# Restoring a Noholi backup

Backups are encrypted with `age` and stored in Cloudflare R2:

| Prefix | What | Written by | Kept |
|---|---|---|---|
| `db/YYYY-MM-DD/noholi-<ts>.dump.age` | `pg_dump` custom format | nightly GitHub workflow (`noholi-backups` repo) | 30 days |
| `predeploy/YYYY-MM-DD/noholi-<ts>-<label>.dump.age` | `pg_dump` custom format | `ops/scripts/predeploy-dump.sh` before each `db push` | 90 days |
| `storage/member-photos/YYYY-MM-DD/member-photos-<ts>.tar.age` | tar of every file in the bucket | nightly workflow | 30 days |
| `storage/covers/YYYY-MM-DD/covers-<ts>.tar.age` | tar of every file in the bucket | workflow, Sundays or on demand | 30 days |
| `status/latest.json`, `status/storage-<bucket>.json` | pointer to the newest object | nightly workflow | always (latest only) |

Each **dump** holds `public` (all app data), `private` (helper functions, login markers, intake
throttle log), `auth` (logins, including `auth.users` and `auth.identities`) and `storage` (bucket
definitions and policies). It does **not** hold auth sessions or tokens, or the auth audit log. After a
restore, everybody signs in again.

The **files** (member photos, covers) are only in the `storage/` archives. Each archive is a tar with
`manifest.tsv` (object name, mimetype, size) and `objects/<name>`. Restore the dump first, then the files.

**Always rehearse into local Docker first.** `ops/scripts/restore-local.sh` refuses any db host or API
URL that is not local.

## Prerequisites (on the admin's machine)

- Docker Desktop, running.
- The local stack, from the repo root: `npx supabase@2.118 start`. The db is on `localhost:54322` (`postgres` / `postgres`), the API on `localhost:54321`.
- `age`: `winget install FiloSottile.age` (Windows), `brew install age`, or `apt install age`.
- AWS CLI v2. You only need it to download from R2. Otherwise download the file from the R2 dashboard and use `--file` / `--storage-file`.
- The **age private key file** (`noholi-backup-key.txt`) from its offline copy. Keep it **outside** the repo.
- `ops/.env.ops` with the `R2_*` values (copy it from `ops/.env.ops.example`).
- Optional: `pg_restore`/`psql` 17 on PATH. Without them, the script runs them inside the `supabase_db_*` container.

Run the scripts from Git Bash on Windows, or from any bash shell.

## Local restore (the rehearsal)

```bash
# the newest nightly dump AND the newest member-photos archive
bash ops/scripts/restore-local.sh --latest --storage --key-file /c/keys/noholi-backup-key.txt

# a specific object (list them first)
aws s3 ls s3://noholi-backups/db/ --recursive --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
bash ops/scripts/restore-local.sh --key db/2026-09-28/noholi-20260928T210012Z.dump.age --key-file ...

# files you already downloaded
bash ops/scripts/restore-local.sh --file ~/Downloads/noholi-....dump.age \
  --storage-file ~/Downloads/member-photos-....tar.age --key-file ...

# only the files (db already restored), e.g. the covers archive
bash ops/scripts/restore-local.sh --storage --storage-bucket covers --key-file ...
```

What the script does:

1. Downloads the objects (or takes `--file` / `--storage-file`) into a temp dir and decrypts them with
   `age -d -i key.txt`. The plaintext dump is `chmod 600` and shredded or removed on exit. In docker mode,
   the copy inside the container is removed too. The photo archive is unpacked into the same temp dir.
2. `pg_restore --list` checks that the file is a readable dump.
3. **auth**: `TRUNCATE auth.users CASCADE`, then loads `auth.users` and `auth.identities` **data only**,
   with `session_replication_role = replica`. The local GoTrue owns the structure of those tables, and replica mode stops
   the "new user" triggers from firing. This runs in a single transaction and aborts on the first error.
4. **public + private**: `pg_restore --clean --if-exists --no-owner --schema=public --schema=private`. Every table,
   view, function, policy and grant in both schemas is dropped and recreated with its data. They go together because
   `public` column defaults and triggers call `private` functions, and `private.login_markers` references `public.members`.
5. `notify pgrst, 'reload schema'`, then prints row counts for
   `books, members, loans, fines, fine_payments, auth.users`.
6. **storage** (with `--storage*`): uploads every file in the archive to the local bucket through the Storage API
   (`POST /storage/v1/object/<bucket>/<name>`, `x-upsert: true`, the original mimetype) with the **local**
   service-role key (from `npx supabase status`, or `LOCAL_SERVICE_ROLE_KEY`). For `member-photos` it then lists
   every `member_applications.photo_path` / `members.avatar` the restored db points at that is not in the archive.

### Expected vs. real errors in step 4

`pg_restore` keeps going after an error. It prints the last lines and saves the full log in `ops/restore-work/`, which is gitignored.

- **Harmless**: `schema "public"` / `schema "private" already exists`; `cannot drop schema ... because other objects depend on it`;
  `cannot drop function public.is_staff() because other objects depend on it` (the `storage.objects` policies use it;
  the old and new definitions are the same) and the matching `function ... already exists`;
  errors about extensions that the local stack already has, or comments on them.
- **Not harmless**: anything naming one of the app tables, a `COPY` failure, or a foreign-key error.
  Investigate before trusting this backup.

## Rehearsal checklist

Do this once before launch (M1), then **monthly**, and after any change to the dump flags. Write the result in the runbook log.

- [ ] 1. The nightly run is green. `status/latest.json` and `status/storage-member-photos.json` show a `last_success_utc` from the last 24 h.
- [ ] 2. The local stack is running (`npx supabase@2.118 start`), and nobody needs its current local data.
- [ ] 3. `bash ops/scripts/restore-local.sh --latest --storage --key-file <key>` runs to the end.
- [ ] 4. Only the harmless errors listed above, or none at all.
- [ ] 5. Row counts are printed for all six tables. None is `NULL`, which would mean the table is missing.
- [ ] 6. Prod counts, from the Supabase dashboard → SQL editor, **read-only**, run close to the dump time:
  ```sql
  select 'books' t, count(*) from public.books union all
  select 'members', count(*) from public.members union all
  select 'loans', count(*) from public.loans union all
  select 'fines', count(*) from public.fines union all
  select 'fine_payments', count(*) from public.fine_payments union all
  select 'auth.users', count(*) from auth.users union all
  select 'member-photos files', count(*) from storage.objects where bucket_id = 'member-photos';
  ```
  The local and prod counts match, or differ only by rows written after 21:00 UTC. The last line should equal
  the script's "Storage: N uploaded".
- [ ] 7. Storage: `0 failed`, and "not in the archive: 0" (or only photos uploaded after the backup ran).
- [ ] 8. Local admin (`npm run dev` in `/admin` against local): an admin can sign in. Books, members, open loans and fines look right.
      Spot-check one Bangla title, one member with a fine, and one pending application **with its photo showing**.
- [ ] 9. RLS still holds: the anon key cannot read `members` locally. Take the anon key from `npx supabase status`, then
  `curl -s localhost:54321/rest/v1/members -H "apikey: <anon key>"` returns `[]` or a permission error, never member rows.
  (Without the `apikey` header every request gets 401, so that tells you nothing.)
- [ ] 10. The plaintext dump and the unpacked photos are gone. The temp dir was removed, and `ops/restore-work/` holds only logs.
- [ ] 11. Afterwards, reset the local data if needed: `npx supabase db reset` (migrations and seed again).

## Restoring PROD (disaster only)

Not scripted on purpose. Follow `ops/runbook.md` → *Restore*. In short: pause writes (put the OS in
maintenance mode, or stop the desk), take a `predeploy` dump of the current state, and rehearse the chosen
dump locally first. Then run the same two database steps against the **session-pooler URI** with `pg_restore`/`psql` 17, as the
`postgres` user (`--schema=public --schema=private` in step 4). Re-run the row-count query and have the admin sign in again.
The script only restores `auth.users` and `auth.identities`, so MFA factors (`auth.mfa_factors`) are not brought back and the
admin re-enrols MFA. For a prod restore, add `--table=mfa_factors` if you want to keep them.

**Files**, after the database: decrypt and unpack the archive, then upload each file with the **prod** service-role key
(Supabase → Project Settings → API Keys). Run it from the unpacked directory, and do not save the key in a file in the repo:

```bash
age -d -i /c/keys/noholi-backup-key.txt member-photos-....tar.age | tar -x -f -   # -> manifest.tsv + objects/
read -rs -p "prod service-role key: " SRK; echo
URL=https://<project-ref>.supabase.co; BUCKET=member-photos
while IFS=$'\t' read -r name mime _; do
  curl -fsS -o /dev/null -X POST "$URL/storage/v1/object/$BUCKET/$name" \
    -H "apikey: $SRK" -H "Authorization: Bearer $SRK" -H "Content-Type: $mime" -H "x-upsert: true" \
    --data-binary @"objects/$name" || echo "FAILED: $name"
done < manifest.tsv
unset SRK
```

Object names in these buckets are plain ASCII paths (`applications/APP-0001/photo`, `BK-0001.webp`), so they need no
URL-encoding. Delete the unpacked `objects/` directory when the upload is done: it holds member ID photos.
