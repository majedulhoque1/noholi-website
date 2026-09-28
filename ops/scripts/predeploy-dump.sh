#!/usr/bin/env bash
# On-demand encrypted dump of PROD before a schema change.
# Run before EVERY `npx supabase db push`:
#
#   bash ops/scripts/predeploy-dump.sh "add-holds-table"
#
# Same dump as the nightly backup (ops/noholi-backups/scripts/backup.sh), uploaded to
#   predeploy/YYYY-MM-DD/noholi-<UTC timestamp>-<label>.dump.age
# Reads ops/.env.ops (gitignored; copy from ops/.env.ops.example).
# Needs: age, aws cli v2, and pg_dump >= 17 or Docker.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS="$(cd "$HERE/.." && pwd)"
ENV_FILE="${ENV_FILE:-$OPS/.env.ops}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy ops/.env.ops.example to ops/.env.ops and fill it in." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

export BACKUP_PREFIX=predeploy
export WRITE_STATUS=0          # status/latest.json tracks the nightly job only
export BACKUP_LABEL="${1:-${BACKUP_LABEL:-}}"

bash "$OPS/noholi-backups/scripts/backup.sh"

echo
echo "Pre-deploy dump done. You can now run: npx supabase db push"
