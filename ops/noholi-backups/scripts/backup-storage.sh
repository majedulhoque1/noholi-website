#!/usr/bin/env bash
# Noholi Storage backup: every object in ONE Supabase Storage bucket -> tar | age -> Cloudflare R2.
#
# pg_dump only has the storage.objects *rows*; the files live in Supabase's object store.
# This script downloads them through the Storage REST API with the service-role key.
#
# Used by .github/workflows/db-backup.yml:
#   member-photos  every night (private, member ID photos: cannot be re-created)
#   covers         Sundays + on demand (public; mostly re-creatable from supabase/seed via
#                  import-books.mjs, but covers staff uploaded later are not)
#
# Object key: storage/<bucket>/YYYY-MM-DD/<bucket>-<UTC timestamp>.tar.age
# Archive layout (after age -d | tar -x):
#   manifest.tsv      <object name> TAB <mimetype> TAB <size bytes>, one line per object
#   objects/<name>    the files, same paths as in the bucket
#
# The files are written to a private temp dir (umask 077) only long enough to be tarred;
# the tar itself streams straight into age. The temp dir is removed on exit.
#
# Required env:
#   SUPABASE_URL               https://<ref>.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY  service_role JWT or sb_secret_... key (bypasses RLS; read-only use here)
#   AGE_RECIPIENT              age public key (age1...)
#   R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET
# Optional env:
#   STORAGE_BUCKET   bucket to back up (default member-photos)
#   WRITE_STATUS     1 = also write status/storage-<bucket>.json (default 0)
# Needs: curl, jq, tar, age, aws cli v2.
set -euo pipefail

: "${SUPABASE_URL:?missing}"
: "${SUPABASE_SERVICE_ROLE_KEY:?missing}"
: "${AGE_RECIPIENT:?missing}"
: "${R2_ACCOUNT_ID:?missing}"
: "${R2_ACCESS_KEY_ID:?missing}"
: "${R2_SECRET_ACCESS_KEY:?missing}"
: "${R2_BUCKET:?missing}"

STORAGE_BUCKET="${STORAGE_BUCKET:-member-photos}"
WRITE_STATUS="${WRITE_STATUS:-0}"
PAGE=1000

case "$STORAGE_BUCKET" in ""|*[!a-z0-9._-]*) echo "STORAGE_BUCKET has unexpected characters: $STORAGE_BUCKET" >&2; exit 2 ;; esac
case "$AGE_RECIPIENT" in age1*) ;; *) echo "AGE_RECIPIENT does not look like an age public key (age1...)" >&2; exit 2 ;; esac

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing tool: $1 ($2)" >&2; exit 3; }; }
need curl "curl"
need jq "jq"
need tar "tar"
need age "https://github.com/FiloSottile/age, e.g. apt install age / winget install FiloSottile.age"
need aws "AWS CLI v2"

# --- R2 through the S3 API (same settings as backup.sh) ------------------------
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION=auto
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
r2() { aws --endpoint-url "$R2_ENDPOINT" "$@"; }

# --- work dir; the key goes in a header file, not on curl's command line --------
umask 077
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
HDR="$WORK/auth.hdr"
# Same as supabase-js: the key in both headers. Works for legacy JWT keys and sb_secret_ keys.
printf 'apikey: %s\nAuthorization: Bearer %s\n' "$SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" > "$HDR"
API="${SUPABASE_URL%/}/storage/v1"
STAGE="$WORK/stage"
FILES="$STAGE/objects"
MANIFEST="$STAGE/manifest.tsv"
mkdir -p "$FILES"
: > "$MANIFEST"

sapi() { curl -fsS --retry 3 --retry-delay 5 --max-time 120 -H @"$HDR" "$@"; }

# --- 1) list every object (the list API is one folder level at a time) -----------
list_page() { # <prefix> <offset>
  jq -nc --arg p "$1" --argjson o "$2" --argjson l "$PAGE" \
    '{prefix: $p, limit: $l, offset: $o, sortBy: {column: "name", order: "asc"}}' \
    | sapi -H 'Content-Type: application/json' --data-binary @- "$API/object/list/$STORAGE_BUCKET"
}

echo "Listing bucket ${STORAGE_BUCKET} ..."
queue=("")
while [ "${#queue[@]}" -gt 0 ]; do
  prefix="${queue[0]}"
  queue=("${queue[@]:1}")
  offset=0
  while :; do
    page="$(list_page "$prefix" "$offset")"
    n="$(jq 'length' <<<"$page")"
    # Folders come back with id = null; recurse into them.
    while IFS= read -r sub; do
      [ -n "$sub" ] && queue+=("$sub")
    done < <(jq -r --arg p "$prefix" \
      '.[] | select(.id == null) | if $p == "" then .name else $p + "/" + .name end' <<<"$page")
    jq -r --arg p "$prefix" '
      .[] | select(.id != null) | select(.name != ".emptyFolderPlaceholder")
      | [ (if $p == "" then .name else $p + "/" + .name end),
          (.metadata.mimetype // "application/octet-stream"),
          ((.metadata.size // 0) | tostring) ]
      | @tsv' <<<"$page" >> "$MANIFEST"
    [ "$n" -lt "$PAGE" ] && break
    offset=$((offset + PAGE))
  done
done
LISTED="$(grep -c '' "$MANIFEST" || true)"
echo "Found ${LISTED} objects."

# --- 2) download -----------------------------------------------------------------
enc_path() { jq -rn --arg p "$1" '$p | split("/") | map(@uri) | join("/")'; }
COUNT=0
TOTAL=0
while IFS=$'\t' read -r name _mime size; do
  case "/$name/" in *"/../"*|*"/./"*|"//"*) echo "refusing odd object name: $name" >&2; exit 5 ;; esac
  dest="$FILES/$name"
  mkdir -p "$(dirname "$dest")"
  sapi -o "$dest" "$API/object/$STORAGE_BUCKET/$(enc_path "$name")"
  got="$(wc -c < "$dest" | tr -d ' ')"
  if [ "$size" != 0 ] && [ "$got" != "$size" ]; then
    echo "size mismatch for ${name}: listed ${size}, downloaded ${got}" >&2
    exit 5
  fi
  COUNT=$((COUNT + 1))
  TOTAL=$((TOTAL + got))
done < "$MANIFEST"
[ "$COUNT" = "$LISTED" ] || { echo "downloaded ${COUNT} of ${LISTED} objects" >&2; exit 5; }
[ "$COUNT" -gt 0 ] || echo "::warning::bucket ${STORAGE_BUCKET} is empty; writing an archive with an empty manifest."
echo "Downloaded ${COUNT} objects, ${TOTAL} bytes."

# --- 3) tar | encrypt ---------------------------------------------------------------
DAY="$(date -u +%Y-%m-%d)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
KEY="storage/${STORAGE_BUCKET}/${DAY}/${STORAGE_BUCKET}-${TS}.tar.age"
OUT="$WORK/archive.tar.age"
tar -C "$STAGE" -cf - manifest.tsv objects | age --encrypt --recipient "$AGE_RECIPIENT" --output "$OUT"
rm -rf "$FILES"
SIZE="$(wc -c < "$OUT" | tr -d ' ')"
SHA="$(sha256sum "$OUT" | cut -d' ' -f1)"
echo "Encrypted archive: ${SIZE} bytes, sha256 ${SHA}"

# --- 4) upload ------------------------------------------------------------------------
r2 s3 cp "$OUT" "s3://${R2_BUCKET}/${KEY}" --only-show-errors \
  --metadata "sha256=${SHA},objects=${COUNT}" --content-type application/octet-stream
r2 s3api head-object --bucket "$R2_BUCKET" --key "$KEY" >/dev/null
echo "Uploaded s3://${R2_BUCKET}/${KEY}"

if [ "$WRITE_STATUS" = 1 ]; then
  cat > "$WORK/status.json" <<JSON
{
  "last_success_utc": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "bucket": "${STORAGE_BUCKET}",
  "object_key": "${KEY}",
  "objects": ${COUNT},
  "source_bytes": ${TOTAL},
  "size_bytes": ${SIZE},
  "sha256": "${SHA}",
  "encryption": "age",
  "format": "tar (manifest.tsv + objects/)"
}
JSON
  r2 s3 cp "$WORK/status.json" "s3://${R2_BUCKET}/status/storage-${STORAGE_BUCKET}.json" --only-show-errors \
    --content-type application/json --cache-control no-cache
  echo "Wrote s3://${R2_BUCKET}/status/storage-${STORAGE_BUCKET}.json"
fi

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "- storage \`${STORAGE_BUCKET}\`: ${COUNT} objects → \`${KEY}\` (${SIZE} bytes encrypted)" >> "$GITHUB_STEP_SUMMARY"
fi
