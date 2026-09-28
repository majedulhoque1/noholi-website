#!/usr/bin/env bash
# Noholi DB backup: pg_dump (custom format) | age encrypt -> Cloudflare R2.
#
# Single source of truth for the dump. Used by:
#   - .github/workflows/db-backup.yml   (BACKUP_PREFIX=db,        WRITE_STATUS=1)
#   - ops/scripts/predeploy-dump.sh     (BACKUP_PREFIX=predeploy, WRITE_STATUS=0)
#
# The plaintext dump never touches disk: pg_dump streams straight into age.
#
# Required env:
#   SUPABASE_DB_POOLER_URL  session-pooler URI (port 5432), NOT the IPv6-only direct host
#   AGE_RECIPIENT           age public key (age1...)
#   R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET
# Optional env:
#   BACKUP_PREFIX   db | predeploy            (default db)
#   BACKUP_LABEL    short tag appended to the file name, e.g. "m2-catalogue"
#   WRITE_STATUS    1 = also write status/latest.json (default 0)
#   PG_DUMP         path to a pg_dump >= 17   (default: pg_dump on PATH, else docker postgres:17)
#   MIN_BYTES       fail if the encrypted dump is smaller than this (default 20000)
set -euo pipefail

: "${SUPABASE_DB_POOLER_URL:?missing}"
: "${AGE_RECIPIENT:?missing}"
: "${R2_ACCOUNT_ID:?missing}"
: "${R2_ACCESS_KEY_ID:?missing}"
: "${R2_SECRET_ACCESS_KEY:?missing}"
: "${R2_BUCKET:?missing}"

BACKUP_PREFIX="${BACKUP_PREFIX:-db}"
WRITE_STATUS="${WRITE_STATUS:-0}"
MIN_BYTES="${MIN_BYTES:-20000}"

case "$BACKUP_PREFIX" in db|predeploy) ;; *) echo "BACKUP_PREFIX must be db or predeploy" >&2; exit 2 ;; esac
case "$AGE_RECIPIENT" in age1*) ;; *) echo "AGE_RECIPIENT does not look like an age public key (age1...)" >&2; exit 2 ;; esac

# --- R2 through the S3 API -------------------------------------------------
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION=auto
# aws cli >= 2.23 sends CRC checksums by default; keep them to what R2 needs.
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
r2() { aws --endpoint-url "$R2_ENDPOINT" "$@"; }

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing tool: $1 ($2)" >&2; exit 3; }; }
need age "https://github.com/FiloSottile/age, e.g. apt install age / winget install FiloSottile.age"
need aws "AWS CLI v2"

# --- pg_dump >= 17 (Supabase runs Postgres 17) -------------------------------
PG_DUMP="${PG_DUMP:-pg_dump}"
USE_DOCKER=0
if command -v "$PG_DUMP" >/dev/null 2>&1; then
  major="$("$PG_DUMP" --version | grep -oE '[0-9]+' | head -n1)"
  if [ "${major:-0}" -lt 17 ]; then
    echo "pg_dump is version $major; need 17+." >&2
    USE_DOCKER=1
  fi
else
  USE_DOCKER=1
fi
if [ "$USE_DOCKER" = 1 ]; then
  need docker "or install postgresql-client-17"
  echo "Using pg_dump from the postgres:17 docker image."
fi
pgdump() {
  if [ "$USE_DOCKER" = 1 ]; then
    MSYS_NO_PATHCONV=1 docker run --rm postgres:17 pg_dump "$@"
  else
    "$PG_DUMP" "$@"
  fi
}

# --- names --------------------------------------------------------------------
DAY="$(date -u +%Y-%m-%d)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
LABEL=""
if [ -n "${BACKUP_LABEL:-}" ]; then
  LABEL="-$(printf '%s' "$BACKUP_LABEL" | tr -c 'A-Za-z0-9_-' '-' | cut -c1-40)"
fi
KEY="${BACKUP_PREFIX}/${DAY}/noholi-${TS}${LABEL}.dump.age"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
OUT="$WORK/noholi.dump.age"

# --- dump | encrypt ----------------------------------------------------------
# Schemas: public (all app data) + auth (logins, incl. auth.users) + storage (bucket
# definitions and policies). Excluded data:
#   storage.objects      file metadata only; the files themselves are NOT in pg_dump
#   auth.sessions / refresh_tokens / flow_state / one_time_tokens   live secrets, useless after restore
#   auth.audit_log_entries   grows forever, not needed to restore service
echo "Dumping to ${KEY} ..."
pgdump \
  --format=custom \
  --compress=6 \
  --no-password \
  --schema=public \
  --schema=auth \
  --schema=storage \
  --exclude-table-data='storage.objects' \
  --exclude-table-data='auth.sessions' \
  --exclude-table-data='auth.refresh_tokens' \
  --exclude-table-data='auth.flow_state' \
  --exclude-table-data='auth.one_time_tokens' \
  --exclude-table-data='auth.audit_log_entries' \
  --dbname="$SUPABASE_DB_POOLER_URL" \
  | age --encrypt --recipient "$AGE_RECIPIENT" --output "$OUT"

SIZE="$(wc -c < "$OUT" | tr -d ' ')"
SHA="$(sha256sum "$OUT" | cut -d' ' -f1)"
echo "Encrypted dump: ${SIZE} bytes, sha256 ${SHA}"
if [ "$SIZE" -lt "$MIN_BYTES" ]; then
  echo "Encrypted dump is smaller than MIN_BYTES=${MIN_BYTES}; refusing to treat it as a good backup." >&2
  exit 4
fi

# --- upload ---------------------------------------------------------------------
r2 s3 cp "$OUT" "s3://${R2_BUCKET}/${KEY}" --only-show-errors \
  --metadata "sha256=${SHA}" --content-type application/octet-stream
r2 s3api head-object --bucket "$R2_BUCKET" --key "$KEY" >/dev/null
echo "Uploaded s3://${R2_BUCKET}/${KEY}"

# --- status/latest.json (read later by the OS Backup screen) --------------------
if [ "$WRITE_STATUS" = 1 ]; then
  RUN_URL=""
  if [ -n "${GITHUB_RUN_ID:-}" ]; then
    RUN_URL="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID}"
  fi
  cat > "$WORK/latest.json" <<JSON
{
  "last_success_utc": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "object_key": "${KEY}",
  "size_bytes": ${SIZE},
  "sha256": "${SHA}",
  "encryption": "age",
  "format": "pg_dump custom",
  "schemas": ["public", "auth", "storage"],
  "run_url": "${RUN_URL}"
}
JSON
  r2 s3 cp "$WORK/latest.json" "s3://${R2_BUCKET}/status/latest.json" --only-show-errors \
    --content-type application/json --cache-control no-cache
  echo "Wrote s3://${R2_BUCKET}/status/latest.json"
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  { echo "object_key=${KEY}"; echo "size_bytes=${SIZE}"; } >> "$GITHUB_OUTPUT"
fi
