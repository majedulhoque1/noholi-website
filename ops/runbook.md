# Noholi ops runbook

> **Skeleton. Finish it in M4 (handover).** Items marked `TODO(M4)` need the real screens, names or values.
> Audience: the Noholi admin, plus whoever maintains the system after handover.

## Where things live

| Thing | Where | Owner account |
|---|---|---|
| Database, auth, storage, edge functions | Supabase project (Noholi org, region ap-south-1, Postgres 17) | TODO(M4): Noholi Google account |
| Public site | Cloudflare Pages `noholi-web` (see `ops/cloudflare-pages.md`) | Noholi Cloudflare |
| Staff console (OS) | Cloudflare Pages `noholi-admin` (noindex) | Noholi Cloudflare |
| Code | GitHub org → `noholi-website` (monorepo) | Noholi GitHub org |
| Backups | GitHub `noholi-backups` (private) → R2 bucket `noholi-backups` | Noholi GitHub + Cloudflare |
| Backup decryption key | offline only: password manager + library safe | Noholi admin |

## Log

| Date | What | Who | Result |
|---|---|---|---|
| | Restore rehearsal | | |

---

## 1. Restore

- **A single wrong edit** (a book, member or loan): fix it in the OS. The Activity screen (`audit_log`) shows the before and after values.
- **Data loss or corruption:**
  1. Stop writes: tell the desk to pause, and TODO(M4): name the maintenance switch, if there is one.
  2. Take a snapshot of the current state: `bash ops/scripts/predeploy-dump.sh "pre-restore"`.
  3. Pick the dump in R2 (`db/…` nightly, `predeploy/…` before a deploy).
  4. **Rehearse it locally**: `bash ops/scripts/restore-local.sh --key <object> --key-file <key>`, then check the counts (`ops/restore.md`).
  5. Restore prod: see `ops/restore.md` → *Restoring PROD*. TODO(M4): turn this into exact commands after the first rehearsal.
  6. Re-run the row-count query, have the admin sign in, and have one staff member do a test issue and return.
- **Backup failed email**: open the run log in `noholi-backups` → Actions.
  - A paused project: restore it in the Supabase dashboard.
  - A wrong password: update `SUPABASE_DB_POOLER_URL`.
  - An R2 403: the token has expired or its scope changed.
  - Then re-run the workflow by hand.

## 2. Reset an admin's MFA

TODO(M4): confirm this against the real OS screens.
- The admin loses their authenticator, and **another admin exists**: that admin removes the MFA factor.
  TODO(M4): the RPC or edge function name, or Supabase dashboard → Authentication → Users → user → delete factor.
- **The only admin** is locked out: the Supabase project owner (the Noholi Google account) opens Dashboard → Authentication →
  Users → the admin → **MFA factors → delete**. The admin signs in with their password and enrols again.
- Afterwards: check the Activity log, and change the password if the device was lost rather than simply reset.
- Prevention: always keep **two** admins with MFA, and store the recovery steps with the backup key.

## 3. Rotate keys

| Secret | Where it's used | How to rotate |
|---|---|---|
| DB password | `noholi-backups` secret `SUPABASE_DB_POOLER_URL`, `ops/.env.ops` | Supabase → Database → Reset password → update both → run the backup workflow by hand |
| anon / publishable key | Pages env (`VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`), backup secret `SUPABASE_ANON_KEY` | Supabase → API keys → new publishable key → update 3 places → **redeploy both** Pages projects → revoke the old one |
| service_role / secret key | edge functions only (Supabase-managed env) | Supabase → API keys → roll → confirm the edge functions still work. TODO(M4): list any other user |
| R2 API token | `noholi-backups` secrets, `ops/.env.ops` | Cloudflare → R2 → API tokens → create new → update → run the workflow → delete the old one |
| age keypair | `AGE_RECIPIENT` secret, `ops/.env.ops` | `age-keygen` → update → **keep the old private key 90 days**, until the old dumps expire |

Rotate right away when someone with access leaves, or when a key is ever pasted anywhere public.

## 4. Add staff

TODO(M4): screenshots from Settings → Staff.
1. An admin opens OS → Settings → Staff → *Add staff* (the `create-staff-login` edge function) and picks the role.
2. They give the temporary password in person, never by SMS or chat. The new user changes it at first sign-in.
3. Admin role only: enrol MFA before doing anything else.
4. Removing staff: disable them in Settings → Staff, the same day they leave. TODO(M4): confirm whether this is disable or delete.

## 5. Change policy numbers

Loan length, max loans, pickup window, fine per day, fine cap and so on live in the `settings` table and
are edited in OS → Settings → Policy. **There's no code change and no redeploy.**
TODO(M4): list every key with its current value and meaning.
- A change applies to new loans and holds. Existing due dates don't move.
- Record who asked for the change, and when, in the Log above.

## 6. Confirm closed weekdays with the library

`closed_weekdays` (in `settings`) drives the pickup-date picker and due-date calculation, in Dhaka time.
- TODO(M4): confirm the actual weekly closing day(s) with the library in writing. **Don't assume Friday.**
- Public holidays and one-off closures: TODO(M4), decide whether a `closed_dates` list is needed.
- After a change: open Borrow Request on the site and check that the closed days can't be picked.

## 7. Retire the Lovable Cloud QA project

The old OS prototype used a Lovable Cloud Supabase project **`nkajjhuqneynmzybeeih`**. Its publishable key
is committed in the old repo `majedulhoque1/noholi-admin`, so anyone with that repo can reach it.
- [ ] Confirm that nothing live still points to it: search the Pages env and both apps for `nkajjhuqneynmzybeeih`.
- [ ] Export anything worth keeping (there should be nothing real, only QA data).
- [ ] **Delete the project**. If deleting isn't possible, rotate its keys and reset the dev user's password, so the committed key no longer opens anything useful.
- [ ] Archive `majedulhoque1/noholi-admin` on GitHub, with a README pointer: "moved to <org>/noholi-website/admin".
- [ ] Tell the designer that the OS has moved.
- [ ] Note the date in the Log.

## 8. Deploying schema changes (developer)

1. Test locally: `npx supabase db reset`, then run the app against local.
2. `bash ops/scripts/predeploy-dump.sh "<short-label>"`. **Every time.**
3. `npx supabase db push`.
4. Run the advisors in the Supabase dashboard: expect 0 security errors.
5. Redeploy a Pages project only if the frontend changed. Watch paths handle this on push.
