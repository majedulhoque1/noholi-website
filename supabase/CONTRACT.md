# Noholi backend API contract

The single source of truth for what `/admin` (Noholi OS) and `/web` (public site + member area) may call.
Everything here is enforced in Postgres (constraints, RLS, grants, RPC checks), not in the UI.

- Migrations: `supabase/migrations/2026092800{0100..0900}_*.sql` (forward-only; `npx supabase@2.118 db reset` builds everything).
- Tests: `supabase/tests/001_access.test.sql`, `002_rules.test.sql` (pgTAP, `npx supabase@2.118 test db`) and `supabase/tests/api.test.mjs` (HTTP, concurrency, edge functions; `node supabase/tests/api.test.mjs` against the local stack).

---

## 0. Conventions

### Roles
| Who | How it is recognised | Gets |
|---|---|---|
| **anon** | no JWT (publishable/anon key only) | safe `books` columns, `search_books`, `catalog_facets`, `resolve_login`, `get_public_settings`, `public-intake` |
| **member** | signed in, `members.auth_user_id = auth.uid()` (and not archived) | read-only: own `members` row, own `loans`, `borrow_requests`, `fines`, `fine_payments`, `fine_waivers`, `loan_status_v`, `member_summary_v`; all books (not archived); `settings`. Writes only through member RPCs. |
| **staff** | row in `staff_roles` (`role = 'staff'` or `'admin'`) | read everything; direct edits on a few tables (section 2); all staff RPCs |
| **admin** | `staff_roles.role = 'admin'` **and** JWT `aal = 'aal2'` (TOTP MFA verified this session) | staff rights + `waive_fine`, `update_settings`, `remove_staff`, `purge_rejected_applications`, `create-staff-login` |

Members and staff share the Postgres role `authenticated`; RLS and the RPC guards tell them apart.
A staff account is never a member. The OS must sign out any account where `my_role().role` is not `staff`/`admin`.
An admin whose session is still `aal1` counts as **staff** everywhere except admin-only actions, which answer `NH002`.

### Errors
RPC errors come back from PostgREST as `{ code, message, details, hint }` (HTTP 400). Show `message` to the user as is; branch on `code`.

| code | meaning | typical message |
|---|---|---|
| `NH001` | not allowed (wrong role / not signed in) | "Only library staff can do this." / "Only an administrator can do this." / "Please sign in with your member account." |
| `NH002` | admin action without MFA (aal1) | "Please verify with your authenticator app (two-factor sign-in) first." |
| `NH003` | not found (or not yours) | "Loan LN-0001 was not found." |
| `NH004` | invalid input | "Please give a reason for voiding this loan." |
| `NH005` | no copies available | "No copies of "X" are available right now." |
| `NH006` | item limit reached (loans + holds ≥ `max_items`) | "You already have 5 items (loans and holds). The limit is 5." |
| `NH007` | member blocked (non-Active status, overdue book, unpaid fine) | "There is an unpaid fine of ৳60 on this account. Please clear it first." |
| `NH008` | wrong state (already returned / paid / expired / etc.) | "Loan LN-0001 is already returned." |
| `NH009` | duplicate (open loan/hold on same book, login exists, email taken) | "You already have a request waiting for "X"." |
| `NH010` | payment larger than the balance | "The payment (৳50) is more than the balance due (৳10)." |
| `NH011` | pickup date not allowed (window / closed day) | "The library is closed on Friday. Please choose another pickup day." |
| `NH012` | book is reading-room only (`is_circulating = false`) | ""X" is for the reading room only and cannot be borrowed." |
| `NH013` | renewal not allowed | "This book has already been renewed. Please return it or ask the library." |
| `NH014` | hard delete blocked because history exists | "This member has history or a login, so they cannot be deleted. Archive them instead." |
| `NH015` | stock would break `issued + reserved ≤ total` | "There are 3 copies on loan or on hold, so the total cannot go below that." |
| `NH429` | public-intake throttle (edge fn answers HTTP 429) | "You have already sent this form several times today. We will be in touch." |
| `42501` | Postgres permission denied (table/column/function not granted) | – |
| `23505` | unique violation on a direct insert (e.g. duplicate member email) | – |
| `23514` | CHECK violation on a direct insert/update (e.g. rejection reason missing) | – |

Edge functions answer `{ error: { code, message } }` with HTTP 400/401/403/404/409/429/500 and the same codes (`NH500` = unexpected server error).

### Dates and time
- Every "today" is **Asia/Dhaka**: `today_dhaka()` (SQL) and `get_public_settings().today`. Frontends must never use the browser's UTC date.
- Dates are ISO `YYYY-MM-DD` (`date`), timestamps are ISO with offset (`timestamptz`).
- **Overdue is derived, never stored**: `status = 'Active' and due_date < today_dhaka()`. Read `loan_status_v.derived_status`.
- Weekdays use Postgres DOW: `0 = Sunday … 5 = Friday, 6 = Saturday`. `settings.closed_weekdays` is empty until the library confirms.
- Any due date (issue, request pickup → issue, renewal, extension) that lands on a closed weekday moves to the next open day.

### IDs
Human ids are generated by the database from sequences (skipping ids that already exist): `BK-0001`, `MEM-0001`, `LN-0001`, `REQ-0001`, `APP-0001`, `FN-0001`, `DON-001`. Numbers grow past the padding (`BK-12345`), they are never truncated. Do **not** generate ids in the frontend; omit `id` on insert and read it back (`.insert(row).select()`). Seed/test members may use ids like `MEM-TEST-1` (pattern `^MEM-[0-9A-Z-]+$`).
Other ids: `fine_payments.id` uuid, `fine_waivers.id` / `contact_messages.id` / `audit_log.id` bigint.

### Money
`numeric(10,2)` in BDT (৳). PostgREST returns numerics as JSON numbers.

---

## 1. Settings (policy numbers)

`public.settings`, exactly one row (`id = 1`). Read: any signed-in user (`select * from settings`). anon: `get_public_settings()`. Write: `update_settings` (admin + MFA).

| column | default | meaning |
|---|---|---|
| `loan_days` | 14 | default loan length |
| `max_items` | 5 | active loans + pending holds per member |
| `fine_per_day` | 10 | ৳ per day late, no grace period |
| `default_book_value` | 200 | fine cap and lost-book charge when `books.price` is null |
| `hold_grace_days` | 2 | a web hold expires at `pickup_date + hold_grace_days` |
| `pickup_window_days` | 5 | pickup date must be `today … today + 5` |
| `renewals_allowed` | 1 | self-renewals per loan |
| `renewal_days` | 14 | days a self-renewal adds to the current due date |
| `closed_weekdays` | `{}` | DOW numbers the library is closed (fewer than 7) |
| `timezone` | `Asia/Dhaka` | fixed |
| `updated_at`, `updated_by` | | |

---

## 2. Tables

Legend: **R** = who can SELECT, **W** = direct writes allowed (everything else goes through RPCs).

### `books` — one title per row with a copy count
Columns: `id` text PK (`BK-0001`), `title` (required), `title_bangla`, `author` (default `''`), `author_bangla`, `genre`, `publisher`, `year_of_publication` text, `edition`, `language`, `category`, `isbn`, `total_copies` int, `issued_copies` int, `reserved_copies` int, `available_copies` int **GENERATED** (`total − issued − reserved`), `condition`, `pages` int, `price` numeric **nullable** (1,104 imported books have none), `thumbnail` text (path inside the `covers` bucket, e.g. `BK-0001.webp`; public URL = `<SUPABASE_URL>/storage/v1/object/public/covers/<thumbnail>`), `location`, `created_at`, `updated_at` (auto), `cover_source_url`, `is_circulating` bool default true (false = "Reading room only"), `archived_at`, `genre_raw`, `category_raw`, `condition_raw`, `donation_id` (unique, → `donations.id`).
- **R anon**: only `id, title, title_bangla, author, author_bangla, genre, publisher, year_of_publication, edition, language, category, isbn, total_copies, issued_copies, reserved_copies, available_copies, condition, pages, thumbnail, is_circulating, archived_at, created_at, updated_at`, and only rows with `archived_at is null`. Selecting `price`, `location`, `cover_source_url`, `*_raw` or `donation_id` (or `select=*`) as anon fails with `42501` — always list columns explicitly on the public site.
- **R member**: all columns, non-archived rows. **R staff**: everything incl. archived.
- **W staff**: INSERT columns `title, title_bangla, author, author_bangla, genre, publisher, year_of_publication, edition, language, category, isbn, total_copies, condition, pages, price, thumbnail, location, cover_source_url, is_circulating, genre_raw, category_raw, condition_raw` (id is generated; issued/reserved start at 0). UPDATE the same list minus `total_copies`, plus `archived_at` (archive = set it, restore = null). DELETE only when the book has no loans, requests or donation link (else `NH014` → archive instead).
- Not writable directly by anyone: `id`, `total_copies` (after insert), `issued_copies`, `reserved_copies`, `available_copies`, `donation_id`. Use `adjust_stock` and the lending RPCs.
- **Invariants**: `total ≥ 0`, `issued ≥ 0`, `reserved ≥ 0`, `issued + reserved ≤ total` (CHECK). Trigram indexes on title/title_bangla/author/author_bangla.
- OS change needed: the old hook sends `available_copies`, `issued_copies`, `reserved_copies` and a client-made `id` on insert — drop those fields.

### `members`
Columns: `id` (`MEM-0001`), `name` (required), `email` (unique case-insensitive when not empty), `phone`, `address_line`, `city`, `district`, `postal_code`, `avatar` (text; for approved applicants it is the `member-photos` path of their application photo), `status` `'Active'|'Suspended'|'Expired'`, `merit_grade` `'A'|'B'|'C'|'D'|'E'|'Not Assigned'`, `merit_note`, `created_at`, `updated_at`, `auth_user_id` uuid unique, `nid`, `default_guarantor_name|relationship|phone|nid|street|city|district|postal_code`, `must_change_password` bool, `archived_at`.
The old stored counters `active_loans` and `fines` **no longer exist** → use `member_summary_v`.
- **R member**: own row only. **R staff**: all.
- **W staff**: INSERT/UPDATE `name, email, phone, address_line, city, district, postal_code, avatar, status, merit_grade, merit_note, nid, default_guarantor_*` (+ `archived_at` on UPDATE). DELETE only without any loans/requests/fines/application/login (else `NH014`). `auth_user_id` and `must_change_password` are set only by the login edge functions and `complete_password_change`.
- **Members cannot UPDATE this table at all** (their edits go through `update_my_profile`). A direct PATCH of `must_change_password` returns `42501`.
- OS: mask NIDs to the last 4 digits in lists.

### `loans`
Columns: `id` (`LN-0001`), `book_id`, `accession_id` (= book id, kept for the OS), `book_title`, `member_id`, `member_name` (snapshots), `issued_date`, `due_date`, `return_date` (null until returned), `status` `'Active'|'Returned'|'Cancelled'|'Lost'`, `guarantor_name|relationship|phone|email|nid|street|city|district|postal_code`, `notes`, `renewal_count`, `request_id` (unique, → `borrow_requests`), `closed_at`, `issued_by`, `created_at`.
No `fine_amount` column → `loan_status_v`.
- **R**: member own / staff all. **W**: nobody (RPCs only).
- **Invariants**: `due_date ≥ issued_date`; Returned ⇒ `return_date` set; Active ⇒ no `return_date`; one Active loan per (member, book) (partial unique index); every status change goes through an RPC.

### `borrow_requests` — web holds
Columns: `id` (`REQ-0001`), `member_id`, `member_name`, `book_id`, `book_title`, `member_nid`, `guarantor_name|relationship|phone|email|nid|street|city|district|postal_code`, `guarantor_consent` bool, `pickup_date`, `expires_at` **date = last day the hold is valid** (`pickup_date + hold_grace_days`), `note`, `status` `'Pending'|'Issued'|'Rejected'|'Expired'|'Cancelled'`, `loan_id`, `reason` (rejection/expiry reason), `created_at`, `decided_at`, `decided_by`.
- **R**: member own / staff all. **W**: nobody.
- **Invariants**: a Pending request holds exactly 1 copy (`books.reserved_copies`); one Pending request per (member, book); Rejected ⇒ reason; Issued ⇒ loan_id.

### `fines` — one per loan
Columns: `id` (`FN-0001`), `loan_id` (unique), `member_id`, `kind` `'Overdue'|'Lost'`, `days_overdue`, `amount`, `amount_paid`, `status` `'Unpaid'|'Partially Paid'|'Paid'|'Waived'|'Voided'`, `created_at`, `updated_at`.
Balance = `amount − amount_paid` while Unpaid/Partially Paid.
- **R**: member own / staff all. **W**: nobody.
- **Invariants**: `0 ≤ amount_paid ≤ amount` (CHECK, plus a row lock in `record_fine_payment`).
- A fine row exists only once the loan is closed (returned late or lost). For an Active overdue loan the running figure is `loan_status_v.fine_amount` (`fine_is_accruing = true`).

### `fine_payments` — many per fine
`id` uuid, `fine_id`, `amount` (> 0), `method` `'Cash'|'bKash'|'Nagad'|'Bank Transfer'|'Card'|'Other'`, `reference`, `note`, `paid_at`, `recorded_by`, `idempotency_key` uuid **UNIQUE**. R: member (payments on own fines) / staff. W: nobody.

### `fine_waivers`
`id`, `fine_id` (unique), `amount_waived` (the balance at waiver time), `reason` (required), `waived_by`, `waived_at`. R: member own / staff. W: nobody (`waive_fine`, admin).

### `donations`
`id` (`DON-001`), `donor_name`, `donor_contact`, `book_title`, `book_author`, `condition`, `date_received` (default Dhaka today), `notes`, `review_status` `'Pending'|'Approved'|'Rejected'|'Added to Inventory'`, `rejection_reason` (required when Rejected, CHECK), `assigned_accession_id` (→ books), `created_at`.
- **R/W staff only.** INSERT (`donor_name, donor_contact, book_title, book_author, condition, date_received, notes`; status starts Pending). UPDATE those plus `review_status` (`Pending/Approved/Rejected`) and `rejection_reason`. `'Added to Inventory'` only via `add_donation_to_inventory`; once added the row is frozen (`NH008`) and cannot be deleted (`NH014`).

### `member_applications` — "Become a member"
`id` (`APP-0001`), `name`, `phone`, `email`, `street`, `city`, `district`, `postal_code`, `photo_path` (path in `member-photos`, e.g. `applications/APP-0001/photo`; null when no photo was announced), `status` `'Pending'|'Approved'|'Rejected'`, `contacted` bool, `rejection_reason`, `member_id`, `ip_hash`, `created_at`, `decided_at`, `decided_by`.
- **R staff.** **W staff**: UPDATE `contacted` only. Created only through `public-intake`; decided through `approve_application` / `reject_application`. Rejected applications (and their photos) are purged 90 days after the decision.

### `contact_messages`
`id` bigint, `name`, `email`, `phone`, `subject`, `message`, `status` `'New'|'Read'|'Archived'`, `ip_hash`, `created_at`. At least one of email/phone. **R staff; W staff**: UPDATE `status` only. Created through `public-intake`.

### `staff_roles`
`user_id` (→ auth.users), `role` `'admin'|'staff'`, `created_at`, `created_by`. R staff. DELETE admin+MFA (not self) — prefer `remove_staff`. Created by `create-staff-login`.

### `audit_log`
`id`, `actor` uuid (null = system/cron), `actor_role` `'admin'|'staff'|'member'|'system'`, `action` (RPC name, or `insert|update|delete` for direct table edits), `entity` (table), `entity_id`, `before` jsonb, `after` jsonb, `at`. R staff. Every staff RPC and every direct staff edit of books/members/donations/applications/messages writes a row.

---

## 3. Views (all `security_invoker`: the caller's RLS applies)

| view | who | rows / columns |
|---|---|---|
| `loan_status_v` | member (own) / staff | every `loans` column + `derived_status` (`Active`/`Overdue`/`Returned`/`Cancelled`/`Lost`), `days_overdue`, `fine_amount` (accruing for Active, the fine's amount otherwise), `fine_is_accruing`, `fine_id`, `fine_status`, `fine_paid`, `fine_balance` |
| `member_summary_v` | member (own) / staff | every `members` column + `active_loans`, `overdue_loans`, `active_holds`, `outstanding_fines` (unpaid balance of settled fines), `accruing_fines` (running fines on active loans) |
| `loans_per_month_v` | staff | `month` (date, 1st of month), `loans_issued`, `returned`, `lost`, `cancelled`, `still_active` |
| `top_books_v` | staff | `book_id`, `title`, `title_bangla`, `author`, `times_borrowed`, `last_borrowed` |
| `overdue_list_v` | staff | `loan_id`, `book_id`, `book_title`, `member_id`, `member_name`, `member_phone`, `member_email`, `issued_date`, `due_date`, `days_overdue`, `accruing_fine`, `guarantor_name`, `guarantor_phone` |
| `fines_collected_v` | staff | `month` (Dhaka), `method`, `payments`, `amount_collected` |

Report views return no rows to members; anon cannot read any view.
Fine formula: `least(days_late × fine_per_day, coalesce(price, default_book_value))`. `public.fine_for(due, on, price)` computes it.

---

## 4. RPCs

Call with `supabase.rpc(name, args)`. Argument names are exactly as listed. Every RPC checks the caller's role **first**, locks the rows it changes (`member → book → loan/request → fine`) and writes `audit_log`. "Returns loan" = the full `loans` row as JSON.

### Public (anon + everyone)
| RPC | args | returns | notes |
|---|---|---|---|
| `search_books` | `q?`, `genre?`, `category?`, `language?`, `page = 1`, `page_size = 24` (max 100) | rows `{ id, title, title_bangla, author, author_bangla, genre, category, language, publisher, year_of_publication, edition, isbn, pages, condition, thumbnail, is_circulating, total_copies, available_copies, total_count }` | Non-archived only. `q` matches title/author in English **and Bangla** (substring always; typo-tolerant trigram word-similarity > 0.55 only for queries of 5+ characters), exact ISBN or book id. Ranked by relevance, then title. `total_count` = total matches (same on every row) for pagination. No price. |
| `catalog_facets` | – | `{ genres: [], categories: [], languages: [] }` | distinct values of live books |
| `resolve_login` | `identifier` | text email | `MEM-0001` → `mem-0001@members.noholi.app`; a member's real email (with a login) → their synthetic email; anything else → a deterministic `mem-NNNN@members.noholi.app`. Never reveals existence. Then `supabase.auth.signInWithPassword({ email, password })`. |
| `get_public_settings` | – | `{ loan_days, max_items, fine_per_day, hold_grace_days, pickup_window_days, renewals_allowed, renewal_days, closed_weekdays, timezone, today }` | `today` is the Dhaka date — use it for the pickup picker |
| `today_dhaka` | `p_at?` | date | |

### Any signed-in user
| RPC | returns |
|---|---|
| `my_role()` | `{ role: 'admin'|'staff'|'member'|'none', aal, is_admin, member_id, must_change_password }` — route on this after sign-in |
| `is_staff()`, `is_admin()` | boolean (`is_admin` needs aal2) |
| `current_member_id()` | text or null |
| `next_open_day(p_date)`, `fine_for(p_due, p_on, p_price)` | helpers |

### Member (web)
| RPC | args | returns | errors |
|---|---|---|---|
| `submit_borrow_request` | `p_book_id`, `p_pickup_date`, `p_consent` (must be true), `p_member_nid?`, `p_guarantor_name?`, `p_guarantor_relationship?`, `p_guarantor_phone?`, `p_guarantor_email?`, `p_guarantor_nid?`, `p_guarantor_street?`, `p_guarantor_city?`, `p_guarantor_district?`, `p_guarantor_postal_code?`, `p_note?` | request row | NH001, NH003, NH007 (blocked), NH012 (reading room), NH009 (already on loan / already requested), NH006 (limit), NH005 (0 available), NH011 (pickup outside today…today+window or closed day), NH004 (no consent / no NID / no guarantor name+phone) |
| | Omitted/empty guarantor and NID fields fall back to the member's saved defaults. On the **first** request (member has no NID or no default guarantor) the given values are saved as defaults. Reserves 1 copy; `expires_at = pickup + hold_grace_days`. Pre-fill the form from `members.nid` / `default_guarantor_*`. | | |
| `cancel_my_request` | `p_request_id` | request row (Cancelled) | NH003, NH008 (not Pending). Releases the copy. |
| `renew_my_loan` | `p_loan_id` | loan (new `due_date`, `renewal_count + 1`) | NH003 (not yours), NH013 (not Active / already renewed `renewals_allowed` times / past due / title has 0 available and a hold waits), NH007 (blocked: another overdue loan, unpaid fine, non-Active status). New due = next open day of `due_date + renewal_days`. Allowed up to and including the due date. |
| `update_my_profile` | `p_phone?`, `p_address_line?`, `p_city?`, `p_district?`, `p_postal_code?`, `p_avatar?` | member row | null = unchanged, `''` = clear. NH004 (bad phone / too long). Name, email, NID, status are staff-only. |
| `complete_password_change` | – | `{ member_id, must_change_password: false }` | Call **after** `supabase.auth.updateUser({ password })`. NH008 while the password is still the temporary one. |

Member blocked (`NH007`) when: status ≠ Active, any Active loan past due (Dhaka), or unpaid fine balance > 0.

### Staff (OS)
| RPC | args | returns | errors / effect |
|---|---|---|---|
| `issue_loan` | `p_member_id`, `p_book_id`, `p_due_date?` (default today + loan_days), `p_guarantor_name?`, `p_guarantor_relationship?`, `p_guarantor_phone?`, `p_guarantor_email?`, `p_guarantor_nid?`, `p_guarantor_street?`, `p_guarantor_city?`, `p_guarantor_district?`, `p_guarantor_postal_code?`, `p_notes?` | loan | NH003, NH007, NH012, NH009 (already on loan, or a web hold waits for that book → use `issue_from_request`), NH006, NH005, NH004 (due in past). Guarantor defaults to the member's saved guarantor. `issued_copies + 1`. |
| `issue_from_request` | `p_request_id`, `p_due_date?`, `p_notes?` | loan (`request_id` set) | NH003, NH008 (not Pending / expired), NH007 (status not Active). Copy moves reserved → issued; request → Issued with `loan_id`. |
| `return_loan` | `p_loan_id`, `p_return_date?` (default today; not future, not before issue) | `{ loan, fine | null }` | NH003, NH008 (not Active), NH004. Creates the fine when late (`kind 'Overdue'`). `issued_copies − 1`. |
| `void_loan` | `p_loan_id`, `p_reason` (required) | loan (Cancelled) | NH004, NH003, NH008 (not Active/Returned, or its fine already has payments). Active → copy released. Its fine → Voided. |
| `mark_lost` | `p_loan_id`, `p_note?` | `{ loan, fine }` | NH003, NH008. Loan → Lost; `total_copies − 1`, `issued_copies − 1`; fine (`kind 'Lost'`) = price or `default_book_value` (no separate overdue fine). |
| `extend_loan` | `p_loan_id`, `p_new_due_date` | loan | NH003, NH008 (not Active), NH004 (past, or not after current due). No limit; doesn't count as a renewal. |
| `update_loan_details` | `p_loan_id`, `p_changes` jsonb — only keys `guarantor_name`, `guarantor_relationship`, `guarantor_phone`, `guarantor_email`, `guarantor_nid`, `guarantor_street`, `guarantor_city`, `guarantor_district`, `guarantor_postal_code`, `notes` | loan | NH004 (empty object, or any other key — dates/status/book/member are never editable here), NH003, NH008 (voided loan). Values are trimmed; blank → null (notes → ''). Audited. |
| `reject_request` | `p_request_id`, `p_reason` (required) | request (Rejected) | NH004, NH003, NH008. Releases the copy. |
| `expire_holds` | – | int (count) | Pending holds with `expires_at < today` → Expired, copies released. Runs daily by cron; staff may run it manually. |
| `record_fine_payment` | `p_fine_id`, `p_amount`, `p_method`, `p_idempotency_key` (uuid, **required**; generate one per dialog open with `crypto.randomUUID()` and reuse it on retry), `p_reference?`, `p_note?` | `{ payment, fine, duplicate }` | NH003, NH008 (fine not Unpaid/Partially Paid), NH004 (amount ≤ 0, bad method, key used for another fine), NH010 (amount > balance). Same key again → the original payment with `duplicate: true` (no second row). Fine → Partially Paid, or Paid when fully covered. |
| `approve_application` | `p_application_id` | text member id (`MEM-####`) | NH003, NH008 (not Pending), NH009 (email already a member). Creates an Active member from the application. Then call the `create-member-login` edge fn for the password. |
| `reject_application` | `p_application_id`, `p_reason` (required) | application row | NH004, NH003, NH008 |
| `adjust_stock` | `p_book_id`, `p_new_total`, `p_reason` (required) | book row | NH004, NH003, NH015 (`new_total < issued + reserved`) |
| `add_donation_to_inventory` | `_donation_id` | text new book id | NH003, NH008 (already added / not Approved). Creates a 1-copy book with `donation_id` set; donation → Added to Inventory with `assigned_accession_id`. |
| `list_staff` | – | rows `{ user_id, email, role, created_at, last_sign_in_at, mfa_enabled }` | staff |

### Admin (role admin + aal2)
| RPC | args | returns | errors |
|---|---|---|---|
| `waive_fine` | `p_fine_id`, `p_reason` (required) | `{ fine, waiver }` | NH001, NH002, NH004, NH003, NH008. Waives the remaining balance; status Waived. |
| `update_settings` | any of `p_loan_days`, `p_max_items`, `p_fine_per_day`, `p_default_book_value`, `p_hold_grace_days`, `p_pickup_window_days`, `p_renewals_allowed`, `p_renewal_days`, `p_closed_weekdays` (int[]; `[]` clears) — null = unchanged | settings row | NH001, NH002, NH004 (out of range; ≥ 7 closed days) |
| `remove_staff` | `p_user_id` | void | NH001, NH002, NH004 (self), NH003 |
| `purge_rejected_applications` | – | int | also runs daily by cron |

### Service role only (edge functions / ops — never from a browser)
- `link_member_login(p_member_id, p_user_id, p_actor, p_action)` — used by the login edge functions.
- `intake_submit(p_kind, p_ip_hash, p_payload)` — used by `public-intake`.

---

## 5. Edge functions (`<SUPABASE_URL>/functions/v1/<name>`, POST JSON)

Use `supabase.functions.invoke(name, { body })`; the client adds the user's JWT.

### `create-member-login` (staff) / `reset-member-login` (staff)
- Body: `{ member_id: "MEM-0001" }`.
- 200: `{ member_id, login_email: "mem-0001@members.noholi.app", temp_password: "12 chars", must_change_password: true }`. **Shown once**; the plain password is not stored anywhere.
- create: creates the auth user (email confirmed), sets `members.auth_user_id`, `must_change_password = true`. 409 `NH009` if the member already has a login.
- reset: sets a new temp password, `must_change_password = true`. 409 `NH008` if the member has no login yet.
- 400 `NH004` bad id · 401 `NH001` no/expired JWT · 403 `NH001` not staff · 404 `NH003` member not found/archived.

### `create-staff-login` (admin + aal2)
- Body: `{ email, role: "staff" | "admin" }` → 200 `{ user_id, email, role, temp_password }` (shown once).
- 403 `NH001` not admin · 403 `NH002` admin without MFA · 409 `NH009` email exists · 400 `NH004` bad email/role (member-domain emails refused).
- The new staff member signs in with the temp password; admins must enrol TOTP (`supabase.auth.mfa.enroll`) before admin actions work.

### `public-intake` (anon, no JWT needed)
- Application: `{ type: "application", name, phone, email?, street?, city?, district?, postal_code?, has_photo?: true, website: "" }`
  → 200 `{ ok: true, type, id: "APP-0001", photo_upload: { path, token, signed_url } | null }`.
  Upload the photo (webp/jpeg/png, ≤ 5 MB) with `supabase.storage.from('member-photos').uploadToSignedUrl(photo_upload.path, photo_upload.token, file)` — use `path` + `token`, not `signed_url` (its host is the internal one in local dev).
- Contact: `{ type: "contact", name, email? , phone?, subject?, message, website: "" }` (email or phone required) → 200 `{ ok: true, type, id }`.
- `website` is a honeypot: keep the input visually hidden and empty. If filled, the reply is `{ ok: true, id: null }` and nothing is stored.
- 400 `NH004` validation (message is user-readable) · 429 `NH429` throttle: 3 per phone per 24 h, 5 per IP per 24 h (per form type; IP = first `x-forwarded-for` entry, stored only as a salted SHA-256), 30 per hour site-wide.
- Env: `INTAKE_IP_SALT` (optional; falls back to the service key), `ALLOWED_ORIGIN` (CORS, default `*` — set to the site origin in prod).

---

## 6. Auth flows

**Member sign-in (web)**: identifier → `rpc('resolve_login', { identifier })` → `auth.signInWithPassword({ email, password })` → `rpc('my_role')`. If `must_change_password`: force the change screen → `auth.updateUser({ password })` (min 8 chars) → `rpc('complete_password_change')`.
**Staff sign-in (OS)**: `signInWithPassword` → `my_role()`; sign out if role is `member`/`none`. Admin: `auth.mfa.challengeAndVerify` (or enrol first) to reach `aal2`; until then admin-only actions return `NH002`.
**Public sign-up is disabled** (`[auth] enable_signup = false`): `auth.signUp` returns `signup_disabled`. Every login is created by staff through the edge functions.

---

## 7. Storage

| bucket | public | limits | read | write |
|---|---|---|---|---|
| `covers` | yes (public URL) | 2 MB; webp/jpeg/png | anyone via `/object/public/covers/<path>` | staff (insert/update/delete); path `BK-0001.webp` stored in `books.thumbnail` |
| `member-photos` | no | 5 MB; webp/jpeg/png | staff via `createSignedUrl` | only through signed upload URLs from `public-intake` |

## 8. Scheduled jobs (pg_cron, UTC)
- `noholi-expire-holds` `5 18 * * *` (00:05 Dhaka) → `expire_holds()`.
- `noholi-purge-rejected-applications` `20 18 * * *` → `purge_rejected_applications()` (rows rejected > 90 days ago + their `member-photos` object rows; also clears throttle events > 30 days).

## 9. Invariants (enforced in the database)
1. `issued_copies + reserved_copies ≤ total_copies`, all counts ≥ 0 (CHECK); `available_copies` is generated.
2. Every status column has a CHECK; every relation has an FK.
3. One Active loan and one Pending hold per (member, book) (partial unique indexes), and the RPCs refuse a hold while a loan is open and vice versa.
4. Active loans + Pending holds ≤ `max_items`, checked under a lock on the member row.
5. `fine_payments.idempotency_key` unique; `fines.amount_paid ≤ amount` (CHECK + row lock).
6. One fine per loan; void → fine Voided; lost → `total_copies − 1`.
7. `books.donation_id` unique; a donation enters the inventory at most once.
8. Rejection reasons required (donations, applications, requests, waivers).
9. No hard delete once history exists (books, members, donations) — archive with `archived_at`.
10. Overdue is derived in Dhaka time; due dates skip closed weekdays.

## 10. Notes for the seed/import script
- Insert books with explicit ids (`BK-0001`…) as the service role; later generated ids skip taken ones automatically.
- Don't send `available_copies` (generated). `issued_copies`/`reserved_copies` default 0.
- `price` may be null; the fine cap then uses `default_book_value`.
