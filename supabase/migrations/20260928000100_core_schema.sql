-- Noholi Library: core schema (tables, sequences, constraints, indexes).
-- Forward-only. Every "today" is Asia/Dhaka (see public.today_dhaka()).

create extension if not exists pg_trgm with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Small pure helpers
-- ---------------------------------------------------------------------------

-- 'BK', 12, 4 -> 'BK-0012'. Never truncates (lpad would cut 12345 to 1234).
create or replace function public.fmt_id(p_prefix text, p_n bigint, p_width int)
returns text
language sql
immutable
set search_path = ''
as $$
  select p_prefix || '-' ||
         case when length(p_n::text) >= p_width then p_n::text
              else lpad(p_n::text, p_width, '0') end
$$;

-- "Today" in Dhaka. Optional argument makes it testable.
create or replace function public.today_dhaka(p_at timestamptz default now())
returns date
language sql
stable
set search_path = ''
as $$
  select (p_at at time zone 'Asia/Dhaka')::date
$$;

-- ---------------------------------------------------------------------------
-- Sequences for every human-readable id
-- ---------------------------------------------------------------------------
create sequence if not exists public.books_id_seq;
create sequence if not exists public.members_id_seq;
create sequence if not exists public.loans_id_seq;
create sequence if not exists public.donations_id_seq;
create sequence if not exists public.borrow_requests_id_seq;
create sequence if not exists public.member_applications_id_seq;
create sequence if not exists public.fines_id_seq;


-- Next free human id from a sequence. Skips ids that already exist (the book
-- import inserts explicit ids such as BK-0001), so defaults never collide.
create or replace function private.next_human_id(p_seq text, p_prefix text, p_width int, p_table text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id text;
  v_taken boolean;
begin
  loop
    v_id := public.fmt_id(p_prefix, nextval(p_seq::regclass), p_width);
    execute format('select exists (select 1 from %s where id = $1)', p_table::regclass)
      into v_taken using v_id;
    exit when not v_taken;
  end loop;
  return v_id;
end;
$$;
revoke all on function private.next_human_id(text,text,int,text) from public;

-- ---------------------------------------------------------------------------
-- settings (single row)
-- closed_weekdays uses Postgres DOW: 0 = Sunday ... 6 = Saturday.
-- ---------------------------------------------------------------------------
create table public.settings (
  id                  int primary key default 1 check (id = 1),
  loan_days           int not null default 14 check (loan_days between 1 and 365),
  max_items           int not null default 5  check (max_items between 1 and 50),
  fine_per_day        numeric(10,2) not null default 10  check (fine_per_day >= 0),
  default_book_value  numeric(10,2) not null default 200 check (default_book_value >= 0),
  hold_grace_days     int not null default 2  check (hold_grace_days between 0 and 30),
  pickup_window_days  int not null default 5  check (pickup_window_days between 0 and 60),
  renewals_allowed    int not null default 1  check (renewals_allowed between 0 and 10),
  renewal_days        int not null default 14 check (renewal_days between 1 and 365),
  closed_weekdays     int[] not null default '{}'
                      check (closed_weekdays <@ array[0,1,2,3,4,5,6]
                             and coalesce(cardinality(closed_weekdays), 0) < 7),
  timezone            text not null default 'Asia/Dhaka' check (timezone = 'Asia/Dhaka'),
  updated_at          timestamptz not null default now(),
  updated_by          uuid
);
insert into public.settings (id) values (1);

-- ---------------------------------------------------------------------------
-- staff_roles
-- ---------------------------------------------------------------------------
create table public.staff_roles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin','staff')),
  created_at  timestamptz not null default now(),
  created_by  uuid
);

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table public.members (
  id              text primary key
                  default private.next_human_id('public.members_id_seq', 'MEM', 4, 'public.members')
                  check (id ~ '^MEM-[0-9A-Z-]+$'),
  name            text not null check (length(btrim(name)) between 1 and 200),
  email           text check (email is null or email = '' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text,
  address_line    text,
  city            text,
  district        text,
  postal_code     text,
  avatar          text,
  status          text not null default 'Active' check (status in ('Active','Suspended','Expired')),
  merit_grade     text not null default 'Not Assigned' check (merit_grade in ('A','B','C','D','E','Not Assigned')),
  merit_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  auth_user_id    uuid unique references auth.users(id) on delete set null,
  nid             text,
  default_guarantor_name          text,
  default_guarantor_relationship  text,
  default_guarantor_phone         text,
  default_guarantor_nid           text,
  default_guarantor_street        text,
  default_guarantor_city          text,
  default_guarantor_district      text,
  default_guarantor_postal_code   text,
  must_change_password  boolean not null default false,
  archived_at     timestamptz
);
create unique index members_email_unique on public.members (lower(email))
  where email is not null and email <> '';
create index members_name_trgm on public.members using gin (name extensions.gin_trgm_ops);
create index members_phone_idx on public.members (phone);

-- ---------------------------------------------------------------------------
-- donations (created before books because books.donation_id references it)
-- ---------------------------------------------------------------------------
create table public.donations (
  id                    text primary key
                        default private.next_human_id('public.donations_id_seq', 'DON', 3, 'public.donations'),
  donor_name            text not null check (length(btrim(donor_name)) > 0),
  donor_contact         text,
  book_title            text not null check (length(btrim(book_title)) > 0),
  book_author           text,
  condition             text,
  date_received         date not null default public.today_dhaka(),
  notes                 text,
  review_status         text not null default 'Pending'
                        check (review_status in ('Pending','Approved','Rejected','Added to Inventory')),
  rejection_reason      text,
  assigned_accession_id text unique,
  created_at            timestamptz not null default now(),
  constraint donations_rejection_reason_required
    check (review_status <> 'Rejected' or length(btrim(coalesce(rejection_reason,''))) > 0),
  constraint donations_added_has_accession
    check (review_status <> 'Added to Inventory' or assigned_accession_id is not null)
);

-- ---------------------------------------------------------------------------
-- books (one title per row, with a copy count)
-- ---------------------------------------------------------------------------
create table public.books (
  id                  text primary key
                      default private.next_human_id('public.books_id_seq', 'BK', 4, 'public.books'),
  title               text not null check (length(btrim(title)) > 0),
  title_bangla        text,
  author              text not null default '',
  author_bangla       text,
  genre               text,
  publisher           text,
  year_of_publication text,
  edition             text,
  language            text,
  category            text,
  isbn                text,
  total_copies        int not null default 1,
  issued_copies       int not null default 0,
  reserved_copies     int not null default 0,
  available_copies    int generated always as (total_copies - issued_copies - reserved_copies) stored,
  condition           text,
  pages               int check (pages is null or pages >= 0),
  price               numeric(10,2) check (price is null or price >= 0),
  thumbnail           text,
  location            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  cover_source_url    text,
  is_circulating      boolean not null default true,
  archived_at         timestamptz,
  genre_raw           text,
  category_raw        text,
  condition_raw       text,
  donation_id         text unique references public.donations(id),
  constraint books_counts_nonnegative
    check (total_copies >= 0 and issued_copies >= 0 and reserved_copies >= 0),
  constraint books_counts_within_total
    check (issued_copies + reserved_copies <= total_copies)
);
create index books_title_trgm        on public.books using gin (title extensions.gin_trgm_ops);
create index books_title_bangla_trgm on public.books using gin (title_bangla extensions.gin_trgm_ops);
create index books_author_trgm       on public.books using gin (author extensions.gin_trgm_ops);
create index books_author_bangla_trgm on public.books using gin (author_bangla extensions.gin_trgm_ops);
create index books_genre_idx    on public.books (genre);
create index books_category_idx on public.books (category);
create index books_language_idx on public.books (language);

alter table public.donations
  add constraint donations_assigned_accession_fk
  foreign key (assigned_accession_id) references public.books(id);

-- ---------------------------------------------------------------------------
-- member_applications (public "Become a member" form)
-- ---------------------------------------------------------------------------
create table public.member_applications (
  id                text primary key
                    default private.next_human_id('public.member_applications_id_seq', 'APP', 4, 'public.member_applications'),
  name              text not null check (length(btrim(name)) between 1 and 200),
  phone             text not null check (length(btrim(phone)) between 5 and 30),
  email             text,
  street            text,
  city              text,
  district          text,
  postal_code       text,
  photo_path        text,
  status            text not null default 'Pending' check (status in ('Pending','Approved','Rejected')),
  contacted         boolean not null default false,
  rejection_reason  text,
  member_id         text references public.members(id),
  ip_hash           text,
  created_at        timestamptz not null default now(),
  decided_at        timestamptz,
  decided_by        uuid,
  constraint applications_rejection_reason_required
    check (status <> 'Rejected' or length(btrim(coalesce(rejection_reason,''))) > 0),
  constraint applications_approved_has_member
    check (status <> 'Approved' or member_id is not null)
);
create index member_applications_status_idx on public.member_applications (status, created_at);
create index member_applications_phone_idx  on public.member_applications (phone, created_at);
create index member_applications_ip_idx     on public.member_applications (ip_hash, created_at);

-- ---------------------------------------------------------------------------
-- borrow_requests (web holds)
-- expires_at is the LAST DAY the hold is valid (pickup_date + hold_grace_days).
-- ---------------------------------------------------------------------------
create table public.borrow_requests (
  id                        text primary key
                            default private.next_human_id('public.borrow_requests_id_seq', 'REQ', 4, 'public.borrow_requests'),
  member_id                 text not null references public.members(id),
  member_name               text not null,
  book_id                   text not null references public.books(id),
  book_title                text not null,
  member_nid                text,
  guarantor_name            text,
  guarantor_relationship    text,
  guarantor_phone           text,
  guarantor_email           text,
  guarantor_nid             text,
  guarantor_street          text,
  guarantor_city            text,
  guarantor_district        text,
  guarantor_postal_code     text,
  guarantor_consent         boolean not null default false,
  pickup_date               date not null,
  expires_at                date not null,
  note                      text,
  status                    text not null default 'Pending'
                            check (status in ('Pending','Issued','Rejected','Expired','Cancelled')),
  loan_id                   text,
  reason                    text,
  created_at                timestamptz not null default now(),
  decided_at                timestamptz,
  decided_by                uuid,
  constraint borrow_requests_expiry_after_pickup check (expires_at >= pickup_date),
  constraint borrow_requests_rejected_reason
    check (status <> 'Rejected' or length(btrim(coalesce(reason,''))) > 0),
  constraint borrow_requests_issued_has_loan
    check (status <> 'Issued' or loan_id is not null)
);
-- One pending hold per member per book.
create unique index borrow_requests_one_open_per_book
  on public.borrow_requests (member_id, book_id) where status = 'Pending';
create index borrow_requests_status_idx on public.borrow_requests (status, expires_at);
create index borrow_requests_book_idx on public.borrow_requests (book_id) where status = 'Pending';

-- ---------------------------------------------------------------------------
-- loans
-- ---------------------------------------------------------------------------
create table public.loans (
  id                      text primary key
                          default private.next_human_id('public.loans_id_seq', 'LN', 4, 'public.loans'),
  book_id                 text not null references public.books(id),
  accession_id            text not null,
  book_title              text not null,
  member_id               text not null references public.members(id),
  member_name             text not null,
  issued_date             date not null default public.today_dhaka(),
  due_date                date not null,
  return_date             date,
  status                  text not null default 'Active'
                          check (status in ('Active','Returned','Cancelled','Lost')),
  guarantor_name          text,
  guarantor_relationship  text,
  guarantor_phone         text,
  guarantor_email         text,
  guarantor_nid           text,
  guarantor_street        text,
  guarantor_city          text,
  guarantor_district      text,
  guarantor_postal_code   text,
  notes                   text,
  renewal_count           int not null default 0 check (renewal_count >= 0),
  request_id              text unique references public.borrow_requests(id),
  closed_at               timestamptz,
  issued_by               uuid,
  created_at              timestamptz not null default now(),
  constraint loans_due_after_issue check (due_date >= issued_date),
  constraint loans_returned_has_date check (status <> 'Returned' or return_date is not null),
  constraint loans_active_no_return check (status <> 'Active' or return_date is null),
  constraint loans_return_after_issue check (return_date is null or return_date >= issued_date)
);
-- One open loan per member per book.
create unique index loans_one_open_per_book
  on public.loans (member_id, book_id) where status = 'Active';
create index loans_member_idx on public.loans (member_id, status);
create index loans_book_idx on public.loans (book_id, status);
create index loans_due_idx on public.loans (due_date) where status = 'Active';

alter table public.borrow_requests
  add constraint borrow_requests_loan_fk foreign key (loan_id) references public.loans(id);

-- ---------------------------------------------------------------------------
-- fines: one per loan. amount_paid is maintained by record_fine_payment under
-- a row lock, and the CHECK makes overpayment impossible at the row level.
-- ---------------------------------------------------------------------------
create table public.fines (
  id            text primary key
                default private.next_human_id('public.fines_id_seq', 'FN', 4, 'public.fines'),
  loan_id       text not null unique references public.loans(id),
  member_id     text not null references public.members(id),
  kind          text not null default 'Overdue' check (kind in ('Overdue','Lost')),
  days_overdue  int not null default 0 check (days_overdue >= 0),
  amount        numeric(10,2) not null check (amount >= 0),
  amount_paid   numeric(10,2) not null default 0 check (amount_paid >= 0),
  status        text not null default 'Unpaid'
                check (status in ('Unpaid','Partially Paid','Paid','Waived','Voided')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint fines_paid_le_amount check (amount_paid <= amount)
);
create index fines_member_idx on public.fines (member_id, status);

create table public.fine_payments (
  id               uuid primary key default gen_random_uuid(),
  fine_id          text not null references public.fines(id),
  amount           numeric(10,2) not null check (amount > 0),
  method           text not null check (method in ('Cash','bKash','Nagad','Bank Transfer','Card','Other')),
  reference        text,
  note             text,
  paid_at          timestamptz not null default now(),
  recorded_by      uuid,
  idempotency_key  uuid not null unique
);
create index fine_payments_fine_idx on public.fine_payments (fine_id);
create index fine_payments_paid_at_idx on public.fine_payments (paid_at);

create table public.fine_waivers (
  id              bigint generated always as identity primary key,
  fine_id         text not null unique references public.fines(id),
  amount_waived   numeric(10,2) not null check (amount_waived >= 0),
  reason          text not null check (length(btrim(reason)) > 0),
  waived_by       uuid,
  waived_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null check (length(btrim(name)) between 1 and 200),
  email       text,
  phone       text,
  subject     text,
  message     text not null check (length(btrim(message)) between 1 and 5000),
  status      text not null default 'New' check (status in ('New','Read','Archived')),
  ip_hash     text,
  created_at  timestamptz not null default now(),
  constraint contact_messages_has_reply_channel
    check (coalesce(email,'') <> '' or coalesce(phone,'') <> '')
);
create index contact_messages_created_idx on public.contact_messages (created_at);
create index contact_messages_ip_idx on public.contact_messages (ip_hash, created_at);

-- ---------------------------------------------------------------------------
-- audit_log
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor       uuid,
  actor_role  text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  at          timestamptz not null default now()
);
create index audit_log_at_idx on public.audit_log (at desc);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

-- Internal: temp-password fingerprint so complete_password_change() can prove
-- the password really changed. Never exposed through the API.
create table private.login_markers (
  member_id     text primary key references public.members(id) on delete cascade,
  pw_hash       text,
  issued_at     timestamptz not null default now()
);

-- Internal: throttle log for public intake (applications + contact).
create table private.intake_events (
  id        bigint generated always as identity primary key,
  kind      text not null,
  phone     text,
  ip_hash   text,
  at        timestamptz not null default now()
);
create index intake_events_at_idx on private.intake_events (at);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger books_touch before update on public.books
  for each row execute function private.touch_updated_at();
create trigger members_touch before update on public.members
  for each row execute function private.touch_updated_at();
create trigger fines_touch before update on public.fines
  for each row execute function private.touch_updated_at();
