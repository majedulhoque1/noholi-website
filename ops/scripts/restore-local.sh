#!/usr/bin/env bash
# Restore an encrypted Noholi backup into the LOCAL Docker Supabase stack
# (npx supabase@2.118 start; db on localhost:54322, API on localhost:54321).
# It never touches prod. See ops/restore.md for the rehearsal checklist.
#
# Database (pg_dump archive):
#   bash ops/scripts/restore-local.sh --latest            --key-file ~/keys/noholi-backup-key.txt
#   bash ops/scripts/restore-local.sh --key db/2026-09-28/noholi-20260928T210012Z.dump.age --key-file ...
#   bash ops/scripts/restore-local.sh --file ./noholi-....dump.age   --key-file ...   (already downloaded)
# Storage files (tar archive of one bucket), alone or together with a database option:
#   --storage                   newest archive of the bucket (status/storage-<bucket>.json)
#   --storage-key <object key>  e.g. storage/member-photos/2026-09-28/member-photos-20260928T210130Z.tar.age
#   --storage-file <path>       an archive you already downloaded
#   --storage-bucket <name>     default member-photos (use covers for the covers archive)
#   add --yes to skip the confirmation prompt
#
# Reads ops/.env.ops if present (R2_* for downloading, AGE_KEY_FILE).
# Storage uploads go to LOCAL_API_URL (default http://127.0.0.1:54321) with LOCAL_SERVICE_ROLE_KEY
# (default: read from `npx supabase status -o env`). Never the prod URL/key.
# Needs: age; aws cli v2 unless --file/--storage-file; curl + tar for storage; pg_restore + psql
# >= 17 on PATH, or the running supabase_db_* container (used automatically).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS="$(cd "$HERE/.." && pwd)"
ROOT="$(cd "$OPS/.." && pwd)"
ENV_FILE="${ENV_FILE:-$OPS/.env.ops}"
# tr -d '\r': an .env.ops saved by a Windows editor would otherwise end every value with "\r".
# shellcheck disable=SC1090
if [ -f "$ENV_FILE" ]; then set -a; . <(tr -d '\r' < "$ENV_FILE"); set +a; fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
LOCAL_API_URL="${LOCAL_API_URL:-http://127.0.0.1:54321}"
TABLES=(public.books public.members public.loans public.fines public.fine_payments auth.users)

MODE="" ; OBJ_KEY="" ; LOCAL_FILE="" ; KEY_FILE="${AGE_KEY_FILE:-}" ; YES=0
SMODE="" ; S_KEY="" ; S_FILE="" ; S_BUCKET="member-photos"
argval() { [ -n "${2:-}" ] || { echo "$1 needs a value" >&2; exit 2; }; }
while [ $# -gt 0 ]; do
  case "$1" in
    --latest)         MODE=latest; shift ;;
    --key)            argval "$@"; MODE=key; OBJ_KEY="$2"; shift 2 ;;
    --file)           argval "$@"; MODE="file"; LOCAL_FILE="$2"; shift 2 ;;
    --key-file)       argval "$@"; KEY_FILE="$2"; shift 2 ;;
    --storage)        SMODE=latest; shift ;;
    --storage-key)    argval "$@"; SMODE=key; S_KEY="$2"; shift 2 ;;
    --storage-file)   argval "$@"; SMODE="file"; S_FILE="$2"; shift 2 ;;
    --storage-bucket) argval "$@"; S_BUCKET="$2"; shift 2 ;;
    --yes|-y)         YES=1; shift ;;
    -h|--help)        sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done
[ -n "$MODE$SMODE" ] || { echo "choose --latest, --key <object key> or --file <path>, and/or --storage[-key|-file]" >&2; exit 2; }
if [ -n "$KEY_FILE" ] && [ -f "$KEY_FILE" ]; then :; else
  echo "age private key not found: pass --key-file or set AGE_KEY_FILE" >&2; exit 2
fi
case "$S_BUCKET" in ""|*[!a-z0-9._-]*) echo "bad --storage-bucket: $S_BUCKET" >&2; exit 2 ;; esac

# --- guard: local only ----------------------------------------------------------------
case "$DB_HOST" in localhost|127.0.0.1|::1) ;; *)
  echo "Refusing: DB_HOST=$DB_HOST is not local. This script only restores into local Docker." >&2; exit 2 ;;
esac
case "$LOCAL_API_URL" in http://localhost|http://localhost:*|http://127.0.0.1|http://127.0.0.1:*) ;; *)
  echo "Refusing: LOCAL_API_URL=$LOCAL_API_URL is not local. This script only restores into local Docker." >&2; exit 2 ;;
esac

command -v age >/dev/null || { echo "missing tool: age" >&2; exit 3; }
if [ -n "$SMODE" ]; then
  command -v curl >/dev/null || { echo "missing tool: curl" >&2; exit 3; }
  command -v tar >/dev/null || { echo "missing tool: tar" >&2; exit 3; }
fi

# --- postgres tools: host >= 17, else the local stack's db container ----------------------
PGMODE=host
DB_CONTAINER=""
ver_ok() { command -v "$1" >/dev/null 2>&1 && [ "$("$1" --version | grep -oE '[0-9]+' | head -n1)" -ge 17 ]; }
if ! ver_ok pg_restore || ! ver_ok psql; then
  PGMODE=docker
  DB_CONTAINER="${DB_CONTAINER:-$(docker ps --format '{{.Names}}' 2>/dev/null | grep '^supabase_db_' | head -n1 || true)}"
  [ -n "$DB_CONTAINER" ] || { echo "No pg_restore/psql >= 17 on PATH and no running supabase_db_* container. Run: npx supabase@2.118 start" >&2; exit 3; }
  echo "Using pg_restore/psql inside container $DB_CONTAINER"
fi
# In docker mode the args are container paths, so Git Bash must not rewrite /tmp/... (MSYS_NO_PATHCONV).
pg() { # pg <binary> [args...]
  local bin="$1"; shift
  if [ "$PGMODE" = host ]; then
    PGPASSWORD="$DB_PASSWORD" "$bin" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$@"
  else
    MSYS_NO_PATHCONV=1 docker exec -i -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" "$bin" -h 127.0.0.1 -p 5432 -U "$DB_USER" "$@"
  fi
}
pg psql -d "$DB_NAME" -tAc 'select 1' >/dev/null || { echo "Cannot reach local db. Is the stack running (npx supabase@2.118 start)?" >&2; exit 3; }

# --- work dir + cleanup ----------------------------------------------------------------------
WORK="$(mktemp -d)"
CDUMP=/tmp/noholi-restore.dump   # copy inside the db container (docker mode)
cleanup() {
  if [ -f "$WORK/noholi.dump" ]; then
    if command -v shred >/dev/null; then shred -u "$WORK/noholi.dump"; else rm -f "$WORK/noholi.dump"; fi
  fi
  rm -rf "$WORK"
  if [ "$PGMODE" = docker ]; then MSYS_NO_PATHCONV=1 docker exec "$DB_CONTAINER" rm -f "$CDUMP" 2>/dev/null || true; fi
}
trap cleanup EXIT
umask 077

# --- R2 (only when something has to be downloaded) ---------------------------------------------
r2_setup() {
  : "${R2_ACCOUNT_ID:?set R2_* in ops/.env.ops}" "${R2_ACCESS_KEY_ID:?}" "${R2_SECRET_ACCESS_KEY:?}" "${R2_BUCKET:?}"
  command -v aws >/dev/null || { echo "missing tool: aws (AWS CLI v2), or download the file and use --file/--storage-file" >&2; exit 3; }
  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" AWS_DEFAULT_REGION=auto
  export AWS_REQUEST_CHECKSUM_CALCULATION=when_required AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
}
r2() { aws --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" "$@"; }
status_key() { # <status object> -> object_key inside it
  r2 s3 cp "s3://${R2_BUCKET}/$1" - | sed -nE 's/.*"object_key": *"([^"]+)".*/\1/p'
}
if [ "$MODE" = latest ] || [ "$MODE" = key ] || [ "$SMODE" = latest ] || [ "$SMODE" = key ]; then r2_setup; fi

# --- fetch + decrypt the DB dump ----------------------------------------------------------------
if [ -n "$MODE" ]; then
  if [ "$MODE" != file ]; then
    if [ "$MODE" = latest ]; then
      OBJ_KEY="$(status_key status/latest.json)"
      [ -n "$OBJ_KEY" ] || { echo "could not read object_key from status/latest.json" >&2; exit 4; }
    fi
    echo "Downloading s3://${R2_BUCKET}/${OBJ_KEY}"
    r2 s3 cp "s3://${R2_BUCKET}/${OBJ_KEY}" "$WORK/noholi.dump.age" --only-show-errors
    LOCAL_FILE="$WORK/noholi.dump.age"
  fi

  age --decrypt --identity "$KEY_FILE" --output "$WORK/noholi.dump" "$LOCAL_FILE"
  chmod 600 "$WORK/noholi.dump"
  # pg_restore needs a seekable file (the dump was streamed, so its TOC has no data offsets).
  if [ "$PGMODE" = docker ]; then
    MSYS_NO_PATHCONV=1 docker exec -i "$DB_CONTAINER" sh -c "umask 077; cat > $CDUMP" < "$WORK/noholi.dump"
    DUMP="$CDUMP"
  else
    DUMP="$WORK/noholi.dump"
  fi
  pg pg_restore --list "$DUMP" > "$WORK/toc.txt"
  echo "Decrypted OK: $(grep -c '' "$WORK/toc.txt") TOC entries, $(grep -c 'TABLE DATA' "$WORK/toc.txt") tables with data."
fi

# --- fetch + decrypt + unpack the storage archive ------------------------------------------------
SDIR="$WORK/storage"
if [ -n "$SMODE" ]; then
  if [ "$SMODE" != file ]; then
    if [ "$SMODE" = latest ]; then
      S_KEY="$(status_key "status/storage-${S_BUCKET}.json")"
      [ -n "$S_KEY" ] || { echo "could not read object_key from status/storage-${S_BUCKET}.json" >&2; exit 4; }
    fi
    echo "Downloading s3://${R2_BUCKET}/${S_KEY}"
    r2 s3 cp "s3://${R2_BUCKET}/${S_KEY}" "$WORK/storage.tar.age" --only-show-errors
    S_FILE="$WORK/storage.tar.age"
  fi
  mkdir -p "$SDIR"
  age --decrypt --identity "$KEY_FILE" "$S_FILE" | tar -x -C "$SDIR" -f -
  [ -f "$SDIR/manifest.tsv" ] || { echo "archive has no manifest.tsv; is this a storage backup?" >&2; exit 4; }
  echo "Storage archive OK: $(grep -c '' "$SDIR/manifest.tsv" || true) objects for bucket ${S_BUCKET}."

  if [ -z "${LOCAL_SERVICE_ROLE_KEY:-}" ]; then
    # The local storage container carries the local service-role key (the CLI's demo key).
    SC="$(docker ps --format '{{.Names}}' 2>/dev/null | grep '^supabase_storage_' | head -n1 || true)"
    if [ -n "$SC" ]; then
      LOCAL_SERVICE_ROLE_KEY="$(docker inspect "$SC" --format '{{range .Config.Env}}{{println .}}{{end}}' \
        | sed -n 's/^SERVICE_KEY=//p' | tr -d '\r')"
    fi
  fi
  if [ -z "${LOCAL_SERVICE_ROLE_KEY:-}" ]; then
    echo "Reading the local service-role key from 'npx supabase status' ..."
    LOCAL_SERVICE_ROLE_KEY="$(cd "$ROOT" && npx --yes supabase@2.118 status -o env 2>/dev/null \
      | tr -d '\r' | sed -nE 's/^SERVICE_ROLE_KEY="?([^"]*)"?$/\1/p')"
  fi
  [ -n "${LOCAL_SERVICE_ROLE_KEY:-}" ] || { echo "No local service-role key: set LOCAL_SERVICE_ROLE_KEY (npx supabase status)" >&2; exit 3; }
fi

# --- confirm -----------------------------------------------------------------------------------
if [ "$YES" != 1 ]; then
  what=""
  [ -n "$MODE" ] && what="the public + private schemas and auth.users in the LOCAL db (${DB_HOST}:${DB_PORT})"
  [ -n "$SMODE" ] && what="${what:+$what, and }the files in LOCAL bucket ${S_BUCKET} (${LOCAL_API_URL})"
  printf 'This REPLACES %s. Continue? [y/N] ' "$what"
  read -r ans; [ "$ans" = y ] || [ "$ans" = Y ] || { echo "aborted"; exit 1; }
fi

if [ -n "$MODE" ]; then
  # --- 1) auth: logins first, so public foreign keys to auth.users can be re-created -------
  # Data only (the local GoTrue owns the auth tables' structure). replica role skips triggers
  # such as "on new auth user" hooks while the rows go back in.
  echo "Restoring auth.users + auth.identities (data only) ..."
  {
    echo "SET session_replication_role = replica;"
    echo "TRUNCATE auth.users CASCADE;"
    pg pg_restore --data-only --no-owner --schema=auth --table=users --table=identities -f - "$DUMP" </dev/null
  } | pg psql -d "$DB_NAME" -q -v ON_ERROR_STOP=1 --single-transaction >/dev/null

  # --- 2) public + private: drop + recreate every object, with its data ------------------------
  # private holds the functions public column defaults/triggers call, and private.login_markers
  # has a foreign key to public.members, so both schemas go back together.
  echo "Restoring schemas public + private (pg_restore --clean --if-exists --no-owner) ..."
  set +e
  pg pg_restore --clean --if-exists --no-owner --schema=public --schema=private -d "$DB_NAME" "$DUMP" 2> "$WORK/restore.log"
  rc=$?
  set -e
  if [ $rc -ne 0 ]; then
    echo "pg_restore reported errors (exit $rc). Last lines:"
    tail -n 15 "$WORK/restore.log"
    mkdir -p "$OPS/restore-work"; cp "$WORK/restore.log" "$OPS/restore-work/restore-$(date -u +%Y%m%dT%H%M%SZ).log"
    echo "Full log saved under ops/restore-work/. See ops/restore.md for which errors are expected."
  fi
  pg psql -d "$DB_NAME" -qc "notify pgrst, 'reload schema';" >/dev/null || true

  # --- 3) row counts ------------------------------------------------------------------------
  LIST="$(printf "'%s'," "${TABLES[@]}")"; LIST="${LIST%,}"
  echo
  echo "Row counts (LOCAL, restored from ${OBJ_KEY:-$LOCAL_FILE}):"
  pg psql -d "$DB_NAME" -P pager=off -c "
  select t as table_name,
         case when to_regclass(t) is null then null
              else (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %s', t), false, true, '')))[1]::text::bigint
         end as row_count
  from unnest(array[$LIST]) with ordinality as x(t, i)
  order by i;"
  echo "Compare with prod: run the same query in the Supabase SQL editor (ops/restore.md, step 6)."
fi

# --- 4) storage: upload every file back through the local Storage API ---------------------------
if [ -n "$SMODE" ]; then
  urlenc() { # percent-encode everything except unreserved chars and "/"
    local s="$1" out="" c i LC_ALL=C
    for ((i = 0; i < ${#s}; i++)); do
      c="${s:i:1}"
      case "$c" in
        [A-Za-z0-9._~/-]) out+="$c" ;;
        *) printf -v c '%%%02X' "'$c"; out+="$c" ;;
      esac
    done
    printf '%s' "$out"
  }
  LHDR="$WORK/local.hdr"
  printf 'apikey: %s\nAuthorization: Bearer %s\n' "$LOCAL_SERVICE_ROLE_KEY" "$LOCAL_SERVICE_ROLE_KEY" > "$LHDR"
  echo
  echo "Uploading to local bucket ${S_BUCKET} (${LOCAL_API_URL}) ..."
  up=0; failed=0
  while IFS=$'\t' read -r name mime _size; do
    f="$SDIR/objects/$name"
    if [ ! -f "$f" ]; then echo "  missing in archive: $name" >&2; failed=$((failed + 1)); continue; fi
    if curl -fsS -o /dev/null -X POST -H @"$LHDR" -H "Content-Type: ${mime:-application/octet-stream}" -H "x-upsert: true" \
         --data-binary @"$f" "${LOCAL_API_URL%/}/storage/v1/object/${S_BUCKET}/$(urlenc "$name")"; then
      up=$((up + 1))
    else
      echo "  upload failed: $name" >&2; failed=$((failed + 1))
    fi
  done < "$SDIR/manifest.tsv"
  echo "Storage: ${up} uploaded, ${failed} failed."

  # Cross-check: every photo the restored rows point at should now exist.
  if [ "$S_BUCKET" = member-photos ]; then
    pg psql -d "$DB_NAME" -tA -c "
      select photo_path from public.member_applications where photo_path is not null
      union
      select avatar from public.members where avatar is not null and avatar not like 'http%'" \
      2>/dev/null | tr -d '\r' | sort -u > "$WORK/referenced.txt" || true
    cut -f1 "$SDIR/manifest.tsv" | sort -u > "$WORK/archived.txt"
    missing="$(comm -23 "$WORK/referenced.txt" "$WORK/archived.txt" | grep -c '' || true)"
    echo "Photo paths referenced by the local db: $(grep -c '' "$WORK/referenced.txt" || true); not in the archive: ${missing}."
    [ "$missing" = 0 ] || comm -23 "$WORK/referenced.txt" "$WORK/archived.txt" | head -n 10 | sed 's/^/  /'
  fi
  [ "$failed" = 0 ] || exit 5
fi
