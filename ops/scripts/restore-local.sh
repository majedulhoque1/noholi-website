#!/usr/bin/env bash
# Restore an encrypted Noholi backup into the LOCAL Docker Supabase stack
# (npx supabase@2.118 start; db on localhost:54322, postgres/postgres).
# It never touches prod. See ops/restore.md for the rehearsal checklist.
#
#   bash ops/scripts/restore-local.sh --latest            --key-file ~/keys/noholi-backup-key.txt
#   bash ops/scripts/restore-local.sh --key db/2026-09-28/noholi-20260928T210012Z.dump.age --key-file ...
#   bash ops/scripts/restore-local.sh --file ./noholi-....dump.age   --key-file ...   (already downloaded)
#   add --yes to skip the confirmation prompt
#
# Reads ops/.env.ops if present (R2_* for downloading, AGE_KEY_FILE).
# Needs: age; aws cli v2 unless --file; pg_restore + psql >= 17 on PATH, or the running
# supabase_db_* container (used automatically).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS="$(cd "$HERE/.." && pwd)"
ENV_FILE="${ENV_FILE:-$OPS/.env.ops}"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
TABLES=(public.books public.members public.loans public.fines public.fine_payments auth.users)

MODE="" ; OBJ_KEY="" ; LOCAL_FILE="" ; KEY_FILE="${AGE_KEY_FILE:-}" ; YES=0
while [ $# -gt 0 ]; do
  case "$1" in
    --latest)   MODE=latest; shift ;;
    --key)      MODE=key; OBJ_KEY="$2"; shift 2 ;;
    --file)     MODE=file; LOCAL_FILE="$2"; shift 2 ;;
    --key-file) KEY_FILE="$2"; shift 2 ;;
    --yes|-y)   YES=1; shift ;;
    -h|--help)  sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done
[ -n "$MODE" ] || { echo "choose one of --latest, --key <object key>, --file <path>" >&2; exit 2; }
[ -n "$KEY_FILE" ] && [ -f "$KEY_FILE" ] || { echo "age private key not found: pass --key-file or set AGE_KEY_FILE" >&2; exit 2; }

# --- guard: local only ----------------------------------------------------------------
case "$DB_HOST" in localhost|127.0.0.1|::1) ;; *)
  echo "Refusing: DB_HOST=$DB_HOST is not local. This script only restores into local Docker." >&2; exit 2 ;;
esac

command -v age >/dev/null || { echo "missing tool: age" >&2; exit 3; }

# --- postgres tools: host >= 17, else the local stack's db container ----------------------
PGMODE=host
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

# --- fetch + decrypt ---------------------------------------------------------------------
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

if [ "$MODE" != file ]; then
  : "${R2_ACCOUNT_ID:?set R2_* in ops/.env.ops}" "${R2_ACCESS_KEY_ID:?}" "${R2_SECRET_ACCESS_KEY:?}" "${R2_BUCKET:?}"
  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" AWS_DEFAULT_REGION=auto
  export AWS_REQUEST_CHECKSUM_CALCULATION=when_required AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
  r2() { aws --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" "$@"; }
  if [ "$MODE" = latest ]; then
    OBJ_KEY="$(r2 s3 cp "s3://${R2_BUCKET}/status/latest.json" - | sed -nE 's/.*"object_key": *"([^"]+)".*/\1/p')"
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

if [ "$YES" != 1 ]; then
  printf 'This REPLACES the public schema and auth.users in the LOCAL db (%s:%s). Continue? [y/N] ' "$DB_HOST" "$DB_PORT"
  read -r ans; [ "$ans" = y ] || [ "$ans" = Y ] || { echo "aborted"; exit 1; }
fi

# --- 1) auth: logins first, so public foreign keys to auth.users can be re-created -------
# Data only (the local GoTrue owns the auth tables' structure). replica role skips triggers
# such as "on new auth user" hooks while the rows go back in.
echo "Restoring auth.users + auth.identities (data only) ..."
{
  echo "SET session_replication_role = replica;"
  echo "TRUNCATE auth.users CASCADE;"
  pg pg_restore --data-only --no-owner --schema=auth --table=users --table=identities -f - "$DUMP"
} | pg psql -d "$DB_NAME" -q -v ON_ERROR_STOP=1 --single-transaction >/dev/null

# --- 2) public: drop + recreate every object, with its data --------------------------------
echo "Restoring schema public (pg_restore --clean --if-exists --no-owner) ..."
set +e
pg pg_restore --clean --if-exists --no-owner --schema=public -d "$DB_NAME" "$DUMP" 2> "$WORK/restore.log"
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
