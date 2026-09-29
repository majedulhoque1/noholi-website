# Noholi ops runbook

> **2026-09-29: two-factor sign-in (TOTP) for admins was removed** at the library owner's request (migration `20260929000400_admin_without_mfa.sql`). The admin role alone now unlocks admin tools. Any TOTP/aal2 steps below are obsolete. To bring it back, restore the aal2 checks in `is_admin()`, `private.require_admin()` and `requireStaff()` (edge functions) and the OS MFA components from git history.

For the developer or maintainer who inherits the Noholi system. Library staff have their own guide: `ops/staff-guide.md`.

Every statement here comes from the code and docs in this repo. Anything that can only be checked in a live
dashboard (Supabase, Cloudflare, GitHub) is marked **TODO(verify)**. Fill those in the first time you check them.

Related docs:
- `supabase/CONTRACT.md`: the API contract (tables, RPCs, edge functions, error codes). It is the source of truth.
- `ops/cloudflare-pages.md`: how the two Pages projects are set up.
- `ops/restore.md`: restoring a backup, plus the rehearsal checklist.
- `ops/noholi-backups/README.md`: the nightly backup workflow and its one-time setup.
- `supabase/seed/README.md`: the one-time catalogue import.

---

## 0. Architecture at a glance

```
 Members / public                         Library staff
       │                                       │
       ▼                                       ▼
 Cloudflare Pages `noholi-web`          Cloudflare Pages `noholi-admin` (noindex)
 /web  React 19 + Vite (JS)             /admin  "Noholi OS", React + TS + shadcn
       │   anon key + member JWT               │   staff JWT (admins: TOTP, aal2)
       └──────────────┬────────────────────────┘
                      ▼
      Supabase project "Noholi System" (ref ferszzubdfqurdbqocbo, ap-south-1, Postgres 17)
        • Postgres: tables + RLS + RPCs (all business rules live here)
        • Auth: email/password, public sign-up OFF, TOTP MFA for admins
        • Storage: `covers` (public), `member-photos` (private)
        • Edge functions: create-member-login, reset-member-login,
                          create-staff-login, public-intake
        • pg_cron: expire holds 00:05 Dhaka, purge rejected applications 00:20 Dhaka
                      │
                      ▼  nightly 21:00 UTC (03:00 Dhaka), GitHub Action in private repo `noholi-backups`
      pg_dump (public, auth, storage) │ age-encrypt → Cloudflare R2 bucket `noholi-backups`
```

Key design points:
- **The database enforces the rules** (fines, limits, stock counts, holds, roles). The two frontends only call
  RPCs and show the `message` of any error. See CONTRACT §0 for the error codes (`NH001`…`NH015`).
- Locked library rules (defaults in the `settings` table, editable in OS → Settings → Policy):
  14-day loans; ৳10 per day late, capped at the book's price, or ৳200 when the book has no price;
  at most 5 items per member, counting loans and web holds together; 1 self-renewal of 14 days;
  a web hold expires on the pickup date + 2 days; pickup date within 5 days. Every "today" is Asia/Dhaka.
- **Members** sign in on the website with their member ID (`MEM-0001`). Behind the scenes the login email is
  `mem-0001@members.noholi.app`. Staff create every login and hand over a temporary password. The member must change it at first sign-in.
- **Staff** sign in to the OS with their email. The OS signs out any account that is not in `staff_roles`.
  An admin counts as plain staff until they pass TOTP in that session.

### Where things live

| Thing | Where | Owner account |
|---|---|---|
| Database, auth, storage, edge functions | Supabase project "Noholi System", ref `ferszzubdfqurdbqocbo`, ap-south-1 | TODO(verify): which account owns the Supabase org. Handover target is the Noholi Google account |
| Public site | Cloudflare Pages `noholi-web` (root dir `web`) | TODO(verify): Noholi Cloudflare account |
| Staff console (OS) | Cloudflare Pages `noholi-admin` (root dir `admin`, noindex) | TODO(verify): Noholi Cloudflare account |
| Code | Currently `github.com/majedulhoque1/noholi-website` (the local `origin`). The docs expect it to move to a Noholi GitHub org | TODO: transfer the repo, then update this row and the Pages Git connection |
| Backups | GitHub `noholi-backups` (private, created from `ops/noholi-backups/`) → R2 bucket `noholi-backups` | TODO(verify): whether the repo and bucket exist yet |
| Backup decryption key (`noholi-backup-key.txt`) | Offline only: a password manager entry plus a printed or USB copy in the library safe | Noholi admin |
| Custom domains | Not set up yet (`ops/cloudflare-pages.md` → *Custom domains*) | TODO |

---

## 1. Deploy (production)

Order matters. The frontends call RPCs and edge functions that must already exist.

**db push → edge functions → function secrets → Pages (env vars, then build)**

### 1.1 One-time: CLI access

The global `supabase` CLI on the original dev machine is broken. **Always use the pinned `npx supabase@2.118`.** Run it from the repo root.

```bash
npx supabase@2.118 login                                   # personal access token for the Supabase account
npx supabase@2.118 link --project-ref ferszzubdfqurdbqocbo # asks for the DB password
```

The link is cached in `supabase/.temp/`, which is gitignored. On the original dev machine it already points at `ferszzubdfqurdbqocbo`.

For the pre-deploy dump, copy `ops/.env.ops.example` to `ops/.env.ops` and fill it in (the session-pooler URL, `AGE_RECIPIENT`, `R2_*`).
The file is gitignored. It does not exist on the dev machine yet, so TODO: create it once the R2 bucket and age key exist.

### 1.2 Database

```bash
npx supabase@2.118 db reset                        # 1. local first: rebuild from migrations and run the tests (section 2)
bash ops/scripts/predeploy-dump.sh "<short-label>" # 2. encrypted snapshot of prod → R2 predeploy/…  EVERY time
npx supabase@2.118 db push --dry-run               # 3. check which migrations will be applied
npx supabase@2.118 db push                         # 4. apply
```

Then:
- Supabase dashboard → Advisors: expect **0 security errors**.
- Migrations are forward-only. Never edit a migration that has already been pushed. Add a new one instead.
- The migrations create the buckets, the storage policies, `pg_cron` and both cron jobs, so there is no manual step for those.
  TODO(verify): after the first push, check Database → Cron in the dashboard for the jobs `noholi-expire-holds` and `noholi-purge-rejected-applications`.
- `backup.sh` refuses an encrypted dump smaller than `MIN_BYTES` (20000). On a brand-new, empty project the very first
  pre-deploy dump may fail this check. TODO(verify): if it does, run it with `MIN_BYTES=1 bash ops/scripts/predeploy-dump.sh first-push`.

### 1.3 Edge functions

```bash
npx supabase@2.118 functions deploy          # deploys every function in supabase/functions
# or one at a time:
npx supabase@2.118 functions deploy public-intake
```

`verify_jwt` comes from `supabase/config.toml`: `public-intake` = false (anonymous website forms), the other three = true.
TODO(verify): after the first deploy, confirm those flags on the dashboard's Edge Functions page.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase automatically.

### 1.4 Function secrets

```bash
npx supabase@2.118 secrets set INTAKE_IP_SALT=<long random string>
npx supabase@2.118 secrets set ALLOWED_ORIGIN=https://<site>,https://<os>   # comma-separated
npx supabase@2.118 secrets list
```

- `INTAKE_IP_SALT` salts the hashed IP used for the public-form throttle. If it is not set, the code falls back to the
  service-role key, so rotating that key would also reset the throttle history. Set a salt of its own.
- `ALLOWED_ORIGIN` is a **comma-separated list** of the origins allowed to call the functions: the website **and** the OS
  (e.g. `https://noholi-web.pages.dev,https://noholi-admin.pages.dev`, plus custom domains later). A caller on the list gets
  its own origin echoed back; anything else gets the first entry, so the browser blocks it. Unset means `*`. Forgetting the OS
  origin breaks Create login / Reset login / Add staff with a CORS error. The functions still check the JWT and staff role either way.

### 1.5 Auth settings on the hosted project

`supabase/config.toml` only configures the **local** stack. The hosted project is set in the dashboard.
TODO(verify) each of these under Authentication:
- **Allow new users to sign up: OFF**. The contract depends on it (`auth.signUp` must return `signup_disabled`).
- Minimum password length **8**.
- MFA: **TOTP enabled** (enrol + verify).
- URL configuration: the Site URL and redirect URLs from `ops/cloudflare-pages.md` → *Custom domains* step 4.

### 1.6 Cloudflare Pages

Details are in `ops/cloudflare-pages.md`. In short:
- `noholi-web`: root `web`, env `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `noholi-admin`: root `admin`, env `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, holding the same anon/publishable value.
- Both need `NODE_VERSION=22`. `VITE_*` values are baked in at build time, so **redeploy after changing any of them**.
- Build watch paths: a push that only touches `supabase/**` or `ops/**` builds **neither** site. That is intended, because the database and functions are deployed by hand (1.2 and 1.3).
- Never put the service-role key or the DB password in Pages.
- Restrict preview deployments. They build against prod Supabase.

### 1.7 First production load (once)

After the first `db push`:
1. Catalogue: `cd supabase/seed`, then create `.env.prod` from `.env.example` (the prod URL and service-role key; it is gitignored), then
   `node import-books.mjs --covers` (if `out/covers` is missing), then `node import-books.mjs --load --target prod --yes-really-prod`.
   It checks 3,016 books / 8,087 copies (see the seed README for why 8,087).
2. First admin: there is no admin yet, so `create-staff-login` (admin-only) can't be used. TODO(verify the method): in the dashboard,
   go to Authentication → Add user (email, password, auto-confirm), then in the SQL editor run
   `insert into public.staff_roles (user_id, role) values ('<uuid>', 'admin');`.
   The admin signs in to the OS, enrols TOTP, and from then on adds everyone else under Settings → Staff.
3. Create a **second admin** straight away (see 4.5).
4. Run the nightly backup workflow by hand once and rehearse a restore (`ops/restore.md`).
5. Retire the old Lovable QA project (section 7).

---

## 2. Local development

Development never touches production. Both apps use `.env.development`, which points at the local Docker stack.

```bash
# 0. Docker Desktop must be running.
npx supabase@2.118 start          # from the repo root. API :54321, DB :54322, Studio :54323, mail :54324
npx supabase@2.118 status -o env  # prints the local URL, anon key and service-role key

npx supabase@2.118 db reset       # rebuilds the schema from supabase/migrations

# catalogue + covers into local
cd supabase/seed
npm install
#   .env.local = SUPABASE_URL=http://127.0.0.1:54321 + the local service-role key (from `status`)
node import-books.mjs --covers               # only if out/covers/ is missing (it's gitignored; slow)
node import-books.mjs --load --target local

# local staff/admin logins + test member MEM-TEST-1 (the script prints the credentials; local only)
node dev-accounts.mjs

# apps
cd ../../admin && npm install && npm run dev   # http://localhost:8080
cd ../web      && npm install && npm run dev   # http://localhost:5190 (moves up if taken)
```

- `admin/.env.development` and `web/.env.development` come from their `.example` files. Put the local anon key in them.
- `config.toml` points the seed at `supabase/seed.sql`, which **doesn't exist**, so `db reset` loads migrations only.
  The catalogue and the accounts come from the two Node scripts above.
- Dev admin logins still need TOTP for admin actions. Enrol any authenticator app under Settings → Account.
- Tests:
  ```bash
  npx supabase@2.118 test db          # pgTAP: supabase/tests/*.test.sql
  node supabase/tests/api.test.mjs    # HTTP, concurrency and edge functions against the local stack
  cd admin && npm run lint && npm test
  ```
- Local edge functions are served by `supabase start`. If they fail, see gotchas 6.3.

---

## 3. Routine tasks

### 3.1 Add staff
1. An admin signs in to the OS and passes TOTP (the yellow banner → **Verify now**).
2. **Settings → Staff → Add staff**: enter the email, choose the role **Staff** or **Administrator**, then click **Create staff login**.
   This calls the `create-staff-login` edge function, which needs admin + aal2.
3. A dialog shows the email and a **one-time temporary password**. Hand it over in person or by phone, never by SMS or chat.
4. The new person signs in and changes the password under **Settings → Account → Change password**.
   ⚠️ **This is not enforced for staff.** `must_change_password` exists only for members. Ask them to do it, and check.
5. Administrators enrol TOTP at their first sign-in. The dialog opens by itself.

**Removing staff**: Settings → Staff → **Remove**, which calls the `remove_staff` RPC. It deletes the `staff_roles` row only.
The auth user stays, so the person can still sign in but is signed out straight away and can read nothing.
Gotcha: you can't re-add the same email later. `create-staff-login` answers "already exists" (409 `NH009`). To re-add someone,
insert the `staff_roles` row in SQL, or delete the auth user in the dashboard first. An admin can't remove themselves.

### 3.2 Reset a member's website login
Members can't reset their own password. The website's "Forgot password" note tells them to contact the library.
- OS → **Members** → the member's row → ⋮ → **Reset login** (or open the member → **Reset login**). This is the `reset-member-login` edge function.
- A new temporary password is shown once. The member signs in with their member ID and must choose a new password.
- A member who has never had a login shows **Create login** instead. Approving an application creates the login automatically.
- Archived members have no login action. Restore them first.

### 3.3 Reset a staff password (no OS screen)
There is **no** "forgot password" on the OS sign-in page and no staff-password reset in the OS.
- Admin or staff who can still sign in: Settings → Account → Change password.
- Forgotten password: in the Supabase dashboard → Authentication → Users → the user, set a new password, or send a recovery
  email if SMTP is configured. TODO(verify): whether custom SMTP is set up; the hosted default mailer is heavily rate-limited.
  Then tell them to change it under Settings → Account.

### 3.4 Reset an admin's MFA (lost phone)
There is **no OS screen and no RPC** to remove another user's MFA factor.
1. Supabase dashboard → Authentication → Users → the admin → remove the MFA factor. TODO(verify the exact menu label).
2. The admin signs in with their password. The OS finds no verified factor and shows a new QR code, and they enrol again.
3. Check Settings → Activity log for anything unexpected. If the phone was lost rather than reset, change the password too.
Prevention: always keep **two** admins with TOTP set up (4.5).

### 3.5 Change policy numbers
OS → **Settings → Policy** (admin + TOTP; staff see it read-only) → edit → **Save policy**. This is the `update_settings` RPC.
There's no code change and no redeploy. Fields and defaults (CONTRACT §1):

| Field on screen | Column | Default | Meaning |
|---|---|---|---|
| Loan length | `loan_days` | 14 | default due date at issue |
| Items per member | `max_items` | 5 | loans + web holds together |
| Late fine | `fine_per_day` | 10 | ৳ per day late, no grace period |
| Default book value | `default_book_value` | 200 | fine cap and lost-book charge when the book has no price |
| Hold grace | `hold_grace_days` | 2 | a hold expires on pickup date + this |
| Pickup window | `pickup_window_days` | 5 | how far ahead a member may pick a pickup date |
| Self-renewals | `renewals_allowed` | 1 | website renewals per loan |
| Renewal length | `renewal_days` | 14 | days a renewal adds |
| Opening days | `closed_weekdays` | none | weekly closed days; pickup can't fall on them, and due dates move to the next open day |

- Changes apply from now on. Existing due dates don't move.
- **Closed weekdays are empty until the library confirms them in writing.** Don't assume Friday. TODO: get the confirmation, tick
  the days, then open Borrow Request on the website and check that those days can't be picked.
  There is no list of one-off closed dates (holidays). TODO: decide whether one is needed.
- Record who asked for a change, and when, in the Log below.

### 3.6 Rotate keys

| Secret | Where it's used | How to rotate |
|---|---|---|
| DB password | `noholi-backups` secret `SUPABASE_DB_POOLER_URL`, `ops/.env.ops`, the CLI link | Supabase → Database → Reset password → update both → run the backup workflow by hand |
| anon / publishable key | Pages env (`VITE_SUPABASE_ANON_KEY` in web, `VITE_SUPABASE_PUBLISHABLE_KEY` in admin), backup secret `SUPABASE_ANON_KEY` | Create a new key → update all 3 → **redeploy both** Pages projects → revoke the old one |
| service_role / secret key | Edge functions (auto-injected), `noholi-backups` secret `SUPABASE_SERVICE_ROLE_KEY` (storage-file backup), `supabase/seed/.env.prod` (only while importing), the `INTAKE_IP_SALT` fallback | Roll it → update the `noholi-backups` secret and run the backup workflow by hand → test Create login and a website contact form → update or delete `.env.prod` |
| `INTAKE_IP_SALT` | `public-intake` | `secrets set` a new value. It only resets throttle history |
| R2 API token | `noholi-backups` secrets, `ops/.env.ops` | Cloudflare → R2 → API tokens → new token scoped to the bucket → update → run the workflow → delete the old one |
| age keypair | `AGE_RECIPIENT` secret and `ops/.env.ops` (public key); private key offline | `age-keygen` → update the public key in both places → **keep the old private key 90 days**, until the last dump encrypted to it expires |
| Supabase personal access token | the CLI on the maintainer's machine | Account → Access tokens → revoke and create a new one |

Rotate straight away when someone with access leaves, or when a key is pasted anywhere public.

### 3.7 Backups: the routine check
- **Weekly**: check that GitHub → `noholi-backups` → Actions → `db-backup` is green, and that `status/latest.json` in R2 shows a `last_success_utc` from the last 24 h.
  The OS Backup screen (Settings → Backup) is static text only. It does **not** show the live status yet (TODO(code)).
- A failed run emails the repo admins. Check that the admin's GitHub notifications include failed Actions runs.
- Failed-run triage:
  - Keep-alive 5xx / connection error: the project is probably **paused**. Restore it in the Supabase dashboard.
  - Password authentication failed: update `SUPABASE_DB_POOLER_URL`.
  - R2 403: the token has expired or its scope changed.
  - "smaller than MIN_BYTES": the dump is suspiciously small, so investigate before trusting it.
  - Then re-run the workflow by hand (Actions → db-backup → Run workflow).
- Retention: `db/` 30 days, `predeploy/` 90 days (R2 lifecycle rules). TODO(verify) that the rules exist.

### 3.8 Restore drill (monthly)
Follow the **Rehearsal checklist** in `ops/restore.md`: `bash ops/scripts/restore-local.sh --latest --key-file <key>`
into local Docker only (the script refuses any non-local host), then compare the row counts with prod. Write the result in the Log.

---

## 4. Incident checklist

### 4.1 First five minutes (any incident)
1. What is broken: the website, the OS, or both? One user or everyone? Since when?
2. Supabase status and project health: is the project **paused**? Free projects pause after 7 idle days; the nightly keep-alive should prevent this.
3. Supabase dashboard → Logs (API, Auth, Edge Functions, Postgres) for the time window.
4. Cloudflare Pages → the latest deployment of the affected project: did a build just go out? Roll back there if it did.
5. Settings → Activity log in the OS (`audit_log`) shows who changed what, with before and after values.
6. Write a line in the Log below.

### 4.2 Symptom → likely cause

| Symptom | Likely cause | Fix |
|---|---|---|
| Both sites: every request fails | project paused, or the Supabase outage page shows an incident | restore or unpause in the dashboard |
| OS: "This account can't use Noholi OS" | the account has no `staff_roles` row (a member, or removed staff) | add staff (3.1) or use the right account |
| OS: admin tools locked, "Please verify with your authenticator app" | session is still aal1 | click **Verify now** in the banner |
| OS: Create login / Reset login fails with a network or CORS error | the OS origin is missing from `ALLOWED_ORIGIN` (1.4) | add it to the comma-separated list |
| Website: forms return "sent this form several times today" | `public-intake` throttle (3 per phone, 5 per IP per day, 30 per hour site-wide) | expected. It lifts by itself |
| Website: blank data / 401 after a key rotation | Pages still has the old anon key baked in | update the env, **redeploy** |
| Deep link returns 404 on Pages | `public/_redirects` missing or a `404.html` added | restore `_redirects` (`/* /index.html 200`) |
| Holds never expire | pg_cron job missing or failing | Dashboard → Cron; meanwhile run `select public.expire_holds();` in the SQL editor (the OS has no button for it) |
| Member photos broken in the OS | `member-photos` objects missing (they're not in backups, see 6.2) | none from backup |

### 4.3 Data loss or corruption
- **A single wrong edit** (a book, member or loan): fix it in the OS. The Activity log shows the old values.
  Wrong loans: Lending → ⋮ → **Void Loan** (with a reason). Never edit loan rows in SQL, because RPCs keep stock counts consistent.
- **Real data loss:**
  1. Stop writes: phone the desk and ask them to pause. **There is no maintenance switch in the OS or the website.**
     TODO(code), if one is wanted.
  2. Snapshot the current state: `bash ops/scripts/predeploy-dump.sh "pre-restore"`.
  3. Pick the dump in R2 (`db/…` nightly, `predeploy/…` before a deploy).
  4. Rehearse it locally: `bash ops/scripts/restore-local.sh --key <object> --key-file <key>` and check the counts.
  5. Restore prod: `ops/restore.md` → *Restoring PROD*. It is deliberately not scripted. TODO: write the exact commands after the first rehearsal.
  6. Re-run the row-count query, have an admin sign in and re-enrol TOTP (MFA factors are not restored by default),
     and have one staff member do a test issue and return.
  7. Everyone signs in again. Sessions are not in the dump.

### 4.4 Suspected account compromise
1. Staff: an admin removes them (Settings → Staff → Remove). Also reset the password in the dashboard.
2. Admin: another admin removes them. If none exists, use the dashboard, then SQL: `delete from public.staff_roles where user_id = '…'`.
3. Rotate any key the person could have seen (3.6).
4. Review the Activity log from the suspected time.

### 4.5 Admin lock-out prevention
Keep **at least two** administrators with TOTP set up (Settings → Staff shows "Authenticator: Set up").
Store the dashboard recovery steps (3.4) with the backup key.

---

## 5. Known gotchas

1. **The catalogue import refuses to run** once any book has issued or reserved copies, because it would reset them to 0. It is an import, not a sync.
   Load the catalogue right after `db reset` (local), or before the library starts lending (prod). New books after that come in through the OS (Inventory, Book Donations).
2. **The `member-photos` bucket is not in the backups.** `pg_dump` has no storage files (`storage.objects` data is excluded, and the files
   live outside Postgres anyway). Application photos, and the member avatars made from them, have **no backup**. Book covers aren't either:
   the imported ones can be rebuilt from the import (`supabase/seed/out/covers`, gitignored, or `--covers` again), but covers uploaded later in the OS cannot.
   TODO: add a storage sync (for example, a second job that copies both buckets to R2).
3. **After Docker Desktop crashes or sleeps**, local edge functions may answer "name resolution failed".
   Fix: `npx supabase@2.118 stop && npx supabase@2.118 start`.
4. **The global `supabase` CLI is broken** on the original dev machine. Always use `npx supabase@2.118 …`.
5. **`VITE_*` env vars are baked in at build time.** Changing them in Pages does nothing until a redeploy.
6. **Pages watch paths**: commits that only touch `supabase/` or `ops/` build nothing. Deploy the database and functions by hand.
7. **`ALLOWED_ORIGIN` must list both the website and the OS origin** (see 1.4). Update it when a custom domain goes live.
8. **Removed staff can't be re-added with the same email** (3.1).
9. **Staff aren't forced to change their temporary password**, although the temporary-password dialog says "They must choose a new password the first time they sign in". That is only true for members.
10. **Reports is hidden from plain staff.** The sidebar shows it only for a TOTP-verified admin (`admin/src/lib/navigation.ts`), although `/reports` itself isn't gated.
11. **`config.toml` is local-only.** Auth settings on the hosted project (sign-up off, TOTP, password length, redirect URLs) must be set in the dashboard (1.5).
12. **Overdue is never stored.** It is derived in Dhaka time (`loan_status_v`). A running fine becomes a payable `fines` row only when the book is returned or marked lost.
13. Idle OS sessions sign out after **30 minutes** without activity (`admin/src/hooks/use-auth.tsx`).
14. `supabase/CONTRACT.md` lists migrations `…0100..0900`, but there are three more from 2026-09-29 (`update_loan_details` and two `search_books` changes). `db reset` and `db push` pick up the whole folder anyway.

---

## 6. Deploying schema changes (developer)

1. Write a new migration in `supabase/migrations/`, then `npx supabase@2.118 db reset` and run the tests (section 2).
2. Update `supabase/CONTRACT.md` if an RPC, table or error code changed, and the `admin/src/integrations/supabase/types.ts` types if needed.
3. `bash ops/scripts/predeploy-dump.sh "<short-label>"`. **Every time.**
4. `npx supabase@2.118 db push --dry-run`, then `npx supabase@2.118 db push`.
5. Advisors: expect 0 security errors.
6. Frontend changes go out through Pages on push to `main` (watch paths). If a frontend change depends on a new RPC, push the database **first**.

---

## 7. Retire the Lovable Cloud QA project

The old OS prototype used a Lovable Cloud Supabase project **`nkajjhuqneynmzybeeih`**. Its publishable key is committed in the old repo
`majedulhoque1/noholi-admin`. Its data is QA only (for example DON-002 / BK-3017) and must not be imported.
- [ ] Confirm that nothing live still points to it: search the Pages env and both apps for `nkajjhuqneynmzybeeih`.
- [ ] Export anything worth keeping. There should be nothing real.
- [ ] **Delete the project**. If deleting isn't possible, rotate its keys and reset the dev user's password.
- [ ] Archive `majedulhoque1/noholi-admin` with a README pointer to the new repo's `admin/`.
- [ ] Tell the designer that the OS has moved.
- [ ] Note the date in the Log.

---

## Log

| Date | What | Who | Result |
|---|---|---|---|
| | First prod `db push` + functions deploy | | |
| | First restore rehearsal | | |
| | Closed weekdays confirmed by the library | | |
