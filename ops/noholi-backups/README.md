# noholi-backups

Daily encrypted backups of the Noholi Library Supabase database **and its storage files** to Cloudflare R2.

First time? Follow [SETUP.md](SETUP.md) (click-by-click). This README explains what runs and why.

This folder is a **template**. It lives at `ops/noholi-backups/` in the main repo and gets copied
into its own **private** repo, `noholi-backups`, in the Noholi GitHub org. Keep the repo private:

- the workflow names the bucket, the schemas and the retention policy;
- GitHub only auto-disables scheduled workflows after 60 days of inactivity in *public* repos,
  so a private repo needs no heartbeat commit;
- the daily run uses about 2 of the 2,000 free Actions minutes a month for private repos.

What a run does (`.github/workflows/db-backup.yml`, 21:00 UTC = 03:00 Dhaka, and on demand):

1. **Keep-alive**: `GET /rest/v1/books?select=id&limit=1` with the anon key. Free projects pause after 7 idle days.
2. Installs `postgresql-client-17` from PGDG. The runner's own client is too old for Postgres 17.
3. `pg_dump -Fc` of `public`, `private`, `auth` and `storage` through the **session pooler**. The direct host is IPv6-only, and GitHub runners only have IPv4.
   It skips the data of `storage.objects`, the auth session and token tables, and `auth.audit_log_entries`.
4. Pipes the dump straight into `age`. **No plaintext dump is ever written to disk.** The dump contains NIDs and phone numbers.
5. Uploads it to R2 as `db/YYYY-MM-DD/noholi-<UTC timestamp>.dump.age`.
6. Writes `status/latest.json` (time, key, size, sha256), which the OS Backup screen reads later.
7. **Storage files** (`scripts/backup-storage.sh`, service-role key, Storage REST API): lists and downloads every
   object of a bucket, checks each size, tars them with a `manifest.tsv` (name, mimetype, size), pipes the tar
   into `age`, and uploads `storage/<bucket>/YYYY-MM-DD/<bucket>-<UTC timestamp>.tar.age` plus
   `status/storage-<bucket>.json`.
   - `member-photos` **every night**: private member ID photos, nothing else can re-create them.
   - `covers` **Sundays** (or tick "include covers" on a manual run): public and mostly re-creatable
     with `supabase/seed/import-books.mjs`, but covers staff upload later are not in the import.
   This step runs even when the database step failed, and only this step gets the service-role key.

A failed step fails the run, and GitHub emails the repo admins. Check that the admin's
GitHub notification settings have **Actions → failed workflows only** switched on.

`scripts/backup.sh` does steps 3–6. The main repo reuses it for `ops/scripts/predeploy-dump.sh`
(prefix `predeploy/`). If you change the dump flags, change them here and copy the file back.

> Storage **files** are not in `pg_dump` (it only has their `storage.objects` rows, and even those are skipped).
> Step 7 covers them. The downloaded photos sit in the runner's private temp dir only until they are tarred.

---

## One-time setup

### 1. age keypair (on the admin's own machine, offline)

```bash
# install: winget install FiloSottile.age   |   brew install age   |   apt install age
age-keygen -o noholi-backup-key.txt
# prints: Public key: age1....
```

- The **public key** (`age1...`) goes into the `AGE_RECIPIENT` secret. It can only encrypt.
- The **private key file** (`noholi-backup-key.txt`) is the only thing that can decrypt a backup.
  Never put it in GitHub, R2, Supabase, Cloudflare or any chat. Keep two offline copies: a
  password manager entry and a printed or USB copy in the library safe. **If it is lost, every backup is unreadable.**
- Rotating it: generate a new pair, update `AGE_RECIPIENT`, and keep the old private key until
  the last dump encrypted to it has expired (30 days for `db/`, 90 days for `predeploy/`).

### 2. Cloudflare R2 bucket

1. Cloudflare dashboard → R2 → **Create bucket** `noholi-backups`. Location hint: Asia-Pacific. Keep it private, with no public access and no custom domain.
2. Bucket → Settings → **Object lifecycle rules**:
   - `db/`: delete objects **30 days** after upload.
   - `predeploy/`: delete objects 90 days after upload. These are rarer and are your rollback points.
   - `storage/`: delete objects **30 days** after upload (about 30 photo archives and 4 cover archives).
   - `status/`: no rule.
3. R2 → **Manage R2 API tokens** → Create API token:
   - Permissions: **Object Read & Write**, scoped to the `noholi-backups` bucket only.
   - It shows an Access Key ID and a Secret Access Key **once**. Save them into the secrets below.
   - The Account ID is on the R2 overview page.
4. Free tier: 10 GB storage. 30 daily dumps of a few MB each fit easily. Photo archives grow with the
   member count (up to 5 MB per photo); check the bucket size monthly.

### 3. Supabase values

- `SUPABASE_URL`: Project Settings → API → Project URL (`https://<ref>.supabase.co`).
- `SUPABASE_ANON_KEY`: the anon / publishable key (the same one the website uses).
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API Keys → the **service_role** key (legacy tab) or a
  **secret** key (`sb_secret_...`). It bypasses row-level security, so it lives only in this repo's secrets
  and in the edge functions. Rotating it means updating this secret too (see `ops/runbook.md` → Rotate keys).
- `SUPABASE_DB_POOLER_URL`: **Connect → Session pooler** (not "Direct connection", not "Transaction pooler"):
  `postgresql://postgres.<ref>:<DB-PASSWORD>@aws-<n>-ap-south-1.pooler.supabase.com:5432/postgres`
  URL-encode special characters in the password. Append `?sslmode=require`.

### 4. GitHub repo secrets

Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Value |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role or `sb_secret_...` key (storage step only) |
| `SUPABASE_DB_POOLER_URL` | session-pooler URI with the DB password |
| `AGE_RECIPIENT` | `age1...` public key |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET` | `noholi-backups` |

If you reset the database password in Supabase, update `SUPABASE_DB_POOLER_URL` here **and** in `ops/.env.ops`.

## Running it manually

GitHub → Actions → **db-backup** → Run workflow. Leave "Update status/latest.json" ticked unless
this is only a test. Or from a terminal: `gh workflow run db-backup -R <org>/noholi-backups`.

Run it once as soon as the secrets are set, and check that:
- the run is green, and its summary shows the object key and size;
- R2 shows `db/<today>/noholi-*.dump.age`, `storage/member-photos/<today>/*.tar.age`, `status/latest.json`
  and `status/storage-member-photos.json`;
- a restore works: follow `ops/restore.md` in the main repo. **A backup is not real until it has been restored once.**

## Listing backups

```bash
aws s3 ls s3://noholi-backups/db/ --recursive \
  --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
aws s3 ls s3://noholi-backups/storage/ --recursive \
  --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
```
