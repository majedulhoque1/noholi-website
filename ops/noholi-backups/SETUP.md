# noholi-backups: one-time setup

About 30 minutes. Do the steps in order. You need admin access to the Noholi GitHub org, the Cloudflare
account and the Supabase project. `README.md` explains what the workflow does.

## 1. age keypair (on your own computer)

1. Install age: `winget install FiloSottile.age` (Windows), `brew install age` (Mac), or `sudo apt install age`.
2. In a terminal, **outside** any git folder: `age-keygen -o noholi-backup-key.txt`
3. It prints `Public key: age1...`. Copy that line. It goes into the `AGE_RECIPIENT` secret (step 4). The public key only encrypts, so it is safe to paste.
4. Store the **private key file** in two offline places:
   - a password-manager entry "Noholi backup key" (paste the whole file, the `AGE-SECRET-KEY-1...` line included);
   - a USB stick or a printout in the library safe.
5. Delete `noholi-backup-key.txt` from the computer once both copies exist. Get it back from the password manager only when you restore.

Never put the private key in GitHub, R2, Supabase, Cloudflare, email or chat. **If it is lost, every backup is unreadable.**

## 2. Cloudflare R2 bucket and API token

1. dash.cloudflare.com → **R2 Object Storage** → **Create bucket**.
   Name `noholi-backups`, location **Automatic** with hint **Asia-Pacific**, storage class Standard → **Create bucket**.
   Leave public access **off** and add no custom domain.
2. In the bucket → **Settings** → **Object lifecycle rules** → **Add rule**, three times:

   | Rule name | Prefix | Action |
   |---|---|---|
   | `db-30d` | `db/` | Delete objects 30 days after upload |
   | `predeploy-90d` | `predeploy/` | Delete objects 90 days after upload |
   | `storage-30d` | `storage/` | Delete objects 30 days after upload |

   Add no rule for `status/`.
3. Back on the R2 overview page, copy the **Account ID** (right-hand side). That is `R2_ACCOUNT_ID`.
4. R2 overview → **Manage API tokens** → **Create Account API token**:
   - Token name `noholi-backups-github`;
   - Permissions **Object Read & Write**;
   - Specify bucket(s): **Apply to specific buckets only** → `noholi-backups`;
   - TTL: Forever → **Create API Token**.
5. The next page shows the **Access Key ID** and **Secret Access Key** once. Copy both straight into the GitHub secrets
   (step 4), or into your password manager first. Close the page only after that.

## 3. Supabase values

In the Noholi project (ref `ferszzubdfqurdbqocbo`):

- **Project URL**: Project Settings → Data API → URL, `https://ferszzubdfqurdbqocbo.supabase.co`.
- **anon key**: Project Settings → API Keys → *Legacy API keys* tab → `anon` `public` (or the publishable key `sb_publishable_...`).
- **service-role key**: same page → `service_role` → Reveal (or a secret key `sb_secret_...`). It bypasses all row-level security. Paste it only into the GitHub secret.
- **Session pooler URI**: the **Connect** button at the top → *Connection string* → Type **URI**, Method **Session pooler**.
  Replace `[YOUR-PASSWORD]` with the database password (URL-encode `@ : / ? # %` and similar characters), then add `?sslmode=require` at the end.
  Do not use "Direct connection" (IPv6 only) or "Transaction pooler" (port 6543).

## 4. The private GitHub repo and its secrets

1. github.com → the Noholi org → **New** repository. Name `noholi-backups`, **Private**, no README/.gitignore/license → **Create repository**.
2. From the main repo root, push the template into it:
   ```bash
   cp -r ops/noholi-backups /tmp/noholi-backups && cd /tmp/noholi-backups
   git init -b main && git add . && git commit -m "Nightly encrypted DB + storage backups"
   git remote add origin https://github.com/<org>/noholi-backups.git && git push -u origin main
   ```
   Check that `.github/workflows/db-backup.yml` and both files in `scripts/` are there.
3. Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, once per row. Name exactly as shown:

   | Secret | Value (from) |
   |---|---|
   | `SUPABASE_URL` | Project URL (step 3) |
   | `SUPABASE_ANON_KEY` | anon / publishable key (step 3) |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role / `sb_secret_...` key (step 3) |
   | `SUPABASE_DB_POOLER_URL` | session-pooler URI with password and `?sslmode=require` (step 3) |
   | `AGE_RECIPIENT` | the `age1...` public key (step 1) |
   | `R2_ACCOUNT_ID` | Cloudflare Account ID (step 2.3) |
   | `R2_ACCESS_KEY_ID` | R2 token Access Key ID (step 2.5) |
   | `R2_SECRET_ACCESS_KEY` | R2 token Secret Access Key (step 2.5) |
   | `R2_BUCKET` | `noholi-backups` |

4. Failure emails: github.com → your avatar → **Settings** → **Notifications** → *System* → **Actions** →
   tick **Email** and **Only notify for failed workflows**. Every repo admin does this.

## 5. First run

1. Repo → **Actions** → **db-backup** → **Run workflow**. Tick "include covers" this first time → **Run workflow**.
2. The run is green. Its summary lists the database object and one line per storage bucket.
3. Cloudflare → R2 → `noholi-backups` shows `db/<today>/`, `storage/member-photos/<today>/`, `storage/covers/<today>/`
   and `status/` with `latest.json`, `storage-member-photos.json`, `storage-covers.json`.
4. Do the restore rehearsal in the main repo: `ops/restore.md` → *Rehearsal checklist*. **A backup is not real until it has been restored once.**
5. For the maintainer's machine, copy `ops/.env.ops.example` to `ops/.env.ops` and fill in the same R2 and pooler values.
