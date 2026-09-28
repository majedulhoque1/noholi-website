# Restoring a Noholi backup

Backups are `pg_dump` custom-format files, encrypted with `age`, stored in Cloudflare R2:

| Prefix | Written by | Kept |
|---|---|---|
| `db/YYYY-MM-DD/noholi-<ts>.dump.age` | nightly GitHub workflow (`noholi-backups` repo) | 30 days |
| `predeploy/YYYY-MM-DD/noholi-<ts>-<label>.dump.age` | `ops/scripts/predeploy-dump.sh` before each `db push` | 90 days |
| `status/latest.json` | nightly workflow | always (latest only) |

Each dump holds `public` (all app data), `auth` (logins, including `auth.users` and `auth.identities`)
and `storage` (bucket definitions). It does **not** hold uploaded files (covers, member photos),
auth sessions or tokens, or the auth audit log. After a restore, everybody signs in again.

**Always rehearse into local Docker first.** `ops/scripts/restore-local.sh` refuses any host that is not local.

## Prerequisites (on the admin's machine)

- Docker Desktop, running.
- The local stack, from the repo root: `npx supabase@2.118 start`. The db is on `localhost:54322` (`postgres` / `postgres`).
- `age`: `winget install FiloSottile.age` (Windows), `brew install age`, or `apt install age`.
- AWS CLI v2. You only need it to download from R2. Otherwise download the file from the R2 dashboard and use `--file`.
- The **age private key file** (`noholi-backup-key.txt`) from its offline copy. Keep it **outside** the repo.
- `ops/.env.ops` with the `R2_*` values (copy it from `ops/.env.ops.example`).
- Optional: `pg_restore`/`psql` 17 on PATH. Without them, the script runs them inside the `supabase_db_*` container.

Run the scripts from Git Bash on Windows, or from any bash shell.

## Local restore (the rehearsal)

```bash
# the newest nightly backup
bash ops/scripts/restore-local.sh --latest --key-file /c/keys/noholi-backup-key.txt

# a specific object (list them first)
aws s3 ls s3://noholi-backups/db/ --recursive --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
bash ops/scripts/restore-local.sh --key db/2026-09-28/noholi-20260928T210012Z.dump.age --key-file ...

# a file you already downloaded
bash ops/scripts/restore-local.sh --file ~/Downloads/noholi-....dump.age --key-file ...
```

What the script does:

1. Downloads the object (or takes `--file`) into a temp dir, then decrypts it with `age -d -i key.txt`. The
   plaintext dump is `chmod 600` and shredded or removed on exit. In docker mode, the copy inside the container is removed too.
2. `pg_restore --list` checks that the file is a readable dump.
3. **auth**: `TRUNCATE auth.users CASCADE`, then loads `auth.users` and `auth.identities` **data only**,
   with `session_replication_role = replica`. The local GoTrue owns the structure of those tables, and replica mode stops
   the "new user" triggers from firing. This runs in a single transaction and aborts on the first error.
4. **public**: `pg_restore --clean --if-exists --no-owner --schema=public`. Every table, view, function,
   policy and grant in `public` is dropped and recreated with its data.
5. `notify pgrst, 'reload schema'`, then prints row counts for
   `books, members, loans, fines, fine_payments, auth.users`.

### Expected vs. real errors in step 4

`pg_restore` keeps going after an error. It prints the last lines and saves the full log in `ops/restore-work/`, which is gitignored.

- **Harmless**: `schema "public" already exists`; `cannot drop schema public because other objects depend on it`;
  errors about extensions that the local stack already has, or comments on them.
- **Not harmless**: anything naming one of the app tables, a `COPY` failure, or a foreign-key error.
  Investigate before trusting this backup.

## Rehearsal checklist

Do this once before launch (M1), then **monthly**, and after any change to the dump flags. Write the result in the runbook log.

- [ ] 1. The nightly run is green, and `status/latest.json` shows a `last_success_utc` from the last 24 h.
- [ ] 2. The local stack is running (`npx supabase@2.118 start`), and nobody needs its current local data.
- [ ] 3. `bash ops/scripts/restore-local.sh --latest --key-file <key>` runs to the end.
- [ ] 4. Only the harmless errors listed above, or none at all.
- [ ] 5. Row counts are printed for all six tables. None is `NULL`, which would mean the table is missing.
- [ ] 6. Prod counts, from the Supabase dashboard → SQL editor, **read-only**, run close to the dump time:
  ```sql
  select 'books' t, count(*) from public.books union all
  select 'members', count(*) from public.members union all
  select 'loans', count(*) from public.loans union all
  select 'fines', count(*) from public.fines union all
  select 'fine_payments', count(*) from public.fine_payments union all
  select 'auth.users', count(*) from auth.users;
  ```
  The local and prod counts match, or differ only by rows written after 21:00 UTC.
- [ ] 7. Local admin (`npm run dev` in `/admin` against local): an admin can sign in. Books, members, open loans and fines look right.
      Spot-check one Bangla title and one member with a fine.
- [ ] 8. RLS still holds: the anon key cannot read `members` locally (`curl localhost:54321/rest/v1/members` returns an empty result or 401).
- [ ] 9. The plaintext dump is gone. The temp dir was removed, and `ops/restore-work/` holds only logs.
- [ ] 10. Afterwards, reset the local data if needed: `npx supabase db reset` (migrations and seed again).

## Restoring PROD (disaster only)

Not scripted on purpose. Follow `ops/runbook.md` → *Restore*. In short: pause writes (put the OS in
maintenance mode, or stop the desk), take a `predeploy` dump of the current state, and rehearse the chosen
dump locally first. Then run the same two steps against the **session-pooler URI** with `pg_restore`/`psql` 17, as the
`postgres` user. Re-run the row-count query and have the admin sign in again. The script only restores `auth.users` and
`auth.identities`, so MFA factors (`auth.mfa_factors`) are not brought back and the admin re-enrols MFA.
For a prod restore, add `--table=mfa_factors` if you want to keep them.
