-- Noholi Library: role helpers, audit helper, grants and row-level security.

-- ---------------------------------------------------------------------------
-- Role helpers (public so the frontends can call them; SECURITY DEFINER so
-- they can read staff_roles/members regardless of the caller's RLS).
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles sr
    where sr.user_id = (select auth.uid())
  )
$$;

-- Admin = admin role AND a session that passed TOTP MFA (aal2).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles sr
    where sr.user_id = (select auth.uid()) and sr.role = 'admin'
  )
  and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
$$;

-- The caller's member id, or null (staff and anon get null).
create or replace function public.current_member_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.id from public.members m
  where m.auth_user_id = (select auth.uid())
    and m.archived_at is null
  limit 1
$$;

-- What the frontends need to route a signed-in user.
create or replace function public.my_role()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'role', case
      when exists (select 1 from public.staff_roles sr where sr.user_id = (select auth.uid()) and sr.role = 'admin') then 'admin'
      when exists (select 1 from public.staff_roles sr where sr.user_id = (select auth.uid())) then 'staff'
      when exists (select 1 from public.members m where m.auth_user_id = (select auth.uid()) and m.archived_at is null) then 'member'
      else 'none' end,
    'aal', coalesce((select auth.jwt()) ->> 'aal', 'aal1'),
    'is_admin', public.is_admin(),
    'member_id', public.current_member_id(),
    'must_change_password', coalesce((
      select m.must_change_password from public.members m
      where m.auth_user_id = (select auth.uid()) and m.archived_at is null limit 1), false)
  )
$$;

-- ---------------------------------------------------------------------------
-- Guards used at the top of every RPC. Stable SQLSTATEs (see CONTRACT.md).
-- ---------------------------------------------------------------------------
create or replace function private.require_staff()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not public.is_staff() then
    raise exception 'Only library staff can do this.' using errcode = 'NH001';
  end if;
end;
$$;

create or replace function private.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not exists (
       select 1 from public.staff_roles sr
       where sr.user_id = (select auth.uid()) and sr.role = 'admin') then
    raise exception 'Only an administrator can do this.' using errcode = 'NH001';
  end if;
  if coalesce((select auth.jwt()) ->> 'aal', '') <> 'aal2' then
    raise exception 'Please verify with your authenticator app (two-factor sign-in) first.' using errcode = 'NH002';
  end if;
end;
$$;

create or replace function private.require_member()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_id text;
begin
  v_id := public.current_member_id();
  if v_id is null then
    raise exception 'Please sign in with your member account.' using errcode = 'NH001';
  end if;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Audit
-- ---------------------------------------------------------------------------
create or replace function private.audit(
  p_action text, p_entity text, p_entity_id text,
  p_before jsonb default null, p_after jsonb default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
begin
  select case
    when (select auth.uid()) is null then 'system'
    when exists (select 1 from public.staff_roles sr where sr.user_id = (select auth.uid()))
      then (select sr.role from public.staff_roles sr where sr.user_id = (select auth.uid()))
    else 'member' end
  into v_role;
  insert into public.audit_log (actor, actor_role, action, entity, entity_id, before, after)
  values ((select auth.uid()), v_role, p_action, p_entity, p_entity_id, p_before, p_after);
end;
$$;

-- Row trigger for direct (non-RPC) staff edits through the table API.
-- RPCs set noholi.in_rpc = 'on' and log their own, more specific entries.
create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id text;
begin
  if (select auth.uid()) is null
     or coalesce(current_setting('noholi.in_rpc', true), '') = 'on' then
    return coalesce(new, old);
  end if;
  v_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id', to_jsonb(new) ->> 'user_id', to_jsonb(old) ->> 'user_id');
  perform private.audit(lower(tg_op), tg_table_name, v_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end;
$$;

create or replace function private.mark_rpc()
returns void
language sql
set search_path = ''
as $$
  select set_config('noholi.in_rpc', 'on', true)
$$;

create trigger books_audit after insert or update or delete on public.books
  for each row execute function private.audit_row_change();
create trigger members_audit after insert or update or delete on public.members
  for each row execute function private.audit_row_change();
create trigger donations_audit after insert or update or delete on public.donations
  for each row execute function private.audit_row_change();
create trigger member_applications_audit after update on public.member_applications
  for each row execute function private.audit_row_change();
create trigger contact_messages_audit after update on public.contact_messages
  for each row execute function private.audit_row_change();

-- ---------------------------------------------------------------------------
-- Integrity triggers for direct staff edits
-- ---------------------------------------------------------------------------

-- No hard delete once history exists: archive instead.
create or replace function private.block_delete_with_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'books' then
    if exists (select 1 from public.loans l where l.book_id = old.id)
       or exists (select 1 from public.borrow_requests r where r.book_id = old.id)
       or old.donation_id is not null
       or exists (select 1 from public.donations d where d.assigned_accession_id = old.id) then
      raise exception 'This book has lending or donation history, so it cannot be deleted. Archive it instead.'
        using errcode = 'NH014';
    end if;
  elsif tg_table_name = 'members' then
    if exists (select 1 from public.loans l where l.member_id = old.id)
       or exists (select 1 from public.borrow_requests r where r.member_id = old.id)
       or exists (select 1 from public.fines f where f.member_id = old.id)
       or exists (select 1 from public.member_applications a where a.member_id = old.id)
       or old.auth_user_id is not null then
      raise exception 'This member has history or a login, so they cannot be deleted. Archive them instead.'
        using errcode = 'NH014';
    end if;
  elsif tg_table_name = 'donations' then
    if old.review_status = 'Added to Inventory' then
      raise exception 'This donation is already in the inventory, so it cannot be deleted.'
        using errcode = 'NH014';
    end if;
  end if;
  return old;
end;
$$;

create trigger books_block_delete before delete on public.books
  for each row execute function private.block_delete_with_history();
create trigger members_block_delete before delete on public.members
  for each row execute function private.block_delete_with_history();
create trigger donations_block_delete before delete on public.donations
  for each row execute function private.block_delete_with_history();

-- Donations: 'Added to Inventory' only through add_donation_to_inventory().
create or replace function private.guard_donation_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(current_setting('noholi.in_rpc', true), '') = 'on' or (select auth.uid()) is null then
    return new;
  end if;
  if new.review_status = 'Added to Inventory'
     and (tg_op = 'INSERT' or old.review_status is distinct from 'Added to Inventory') then
    raise exception 'Use "Add to inventory" to move a donation into the catalogue.' using errcode = 'NH008';
  end if;
  if tg_op = 'UPDATE' and old.review_status = 'Added to Inventory' then
    raise exception 'This donation is already in the inventory and can no longer be changed.' using errcode = 'NH008';
  end if;
  return new;
end;
$$;
create trigger donations_guard_status before insert or update on public.donations
  for each row execute function private.guard_donation_status();

-- ---------------------------------------------------------------------------
-- Grants. Start from nothing, then open exactly what each role needs.
-- ---------------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema private to authenticated, service_role;
grant execute on function private.next_human_id(text,text,int,text) to authenticated, service_role;

-- anon: safe book columns only (no price, location, *_raw, donation link).
grant select (
  id, title, title_bangla, author, author_bangla, genre, publisher,
  year_of_publication, edition, language, category, isbn,
  total_copies, issued_copies, reserved_copies, available_copies,
  condition, pages, thumbnail, is_circulating, archived_at, created_at, updated_at
) on public.books to anon;

-- authenticated (members AND staff share this role; RLS tells them apart)
grant select on public.books, public.members, public.loans, public.donations,
  public.settings, public.staff_roles, public.member_applications,
  public.borrow_requests, public.fines, public.fine_payments, public.fine_waivers,
  public.contact_messages, public.audit_log to authenticated;

-- Direct staff edits (RLS limits these to staff). Stock counters, ids and
-- links are NOT writable: use adjust_stock / lending RPCs.
grant insert (
  title, title_bangla, author, author_bangla, genre, publisher, year_of_publication,
  edition, language, category, isbn, total_copies, condition, pages, price, thumbnail,
  location, cover_source_url, is_circulating, genre_raw, category_raw, condition_raw
) on public.books to authenticated;
grant update (
  title, title_bangla, author, author_bangla, genre, publisher, year_of_publication,
  edition, language, category, isbn, condition, pages, price, thumbnail,
  location, cover_source_url, is_circulating, archived_at, genre_raw, category_raw, condition_raw
) on public.books to authenticated;
grant delete on public.books to authenticated;

grant insert (
  name, email, phone, address_line, city, district, postal_code, avatar, status,
  merit_grade, merit_note, nid,
  default_guarantor_name, default_guarantor_relationship, default_guarantor_phone,
  default_guarantor_nid, default_guarantor_street, default_guarantor_city,
  default_guarantor_district, default_guarantor_postal_code
) on public.members to authenticated;
grant update (
  name, email, phone, address_line, city, district, postal_code, avatar, status,
  merit_grade, merit_note, nid, archived_at,
  default_guarantor_name, default_guarantor_relationship, default_guarantor_phone,
  default_guarantor_nid, default_guarantor_street, default_guarantor_city,
  default_guarantor_district, default_guarantor_postal_code
) on public.members to authenticated;
grant delete on public.members to authenticated;

grant insert (donor_name, donor_contact, book_title, book_author, condition, date_received, notes)
  on public.donations to authenticated;
grant update (donor_name, donor_contact, book_title, book_author, condition, date_received, notes,
  review_status, rejection_reason)
  on public.donations to authenticated;
grant delete on public.donations to authenticated;

grant update (contacted) on public.member_applications to authenticated;
grant update (status) on public.contact_messages to authenticated;
grant delete on public.staff_roles to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security. Every column reference inside a subquery is qualified.
-- ---------------------------------------------------------------------------
alter table public.settings            enable row level security;
alter table public.staff_roles         enable row level security;
alter table public.members             enable row level security;
alter table public.donations           enable row level security;
alter table public.books               enable row level security;
alter table public.member_applications enable row level security;
alter table public.borrow_requests     enable row level security;
alter table public.loans               enable row level security;
alter table public.fines               enable row level security;
alter table public.fine_payments       enable row level security;
alter table public.fine_waivers        enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.audit_log           enable row level security;
alter table private.login_markers      enable row level security;
alter table private.intake_events      enable row level security;

-- books
create policy books_anon_read on public.books for select to anon
  using (archived_at is null);
create policy books_auth_read on public.books for select to authenticated
  using (archived_at is null or (select public.is_staff()));
create policy books_staff_insert on public.books for insert to authenticated
  with check ((select public.is_staff()));
create policy books_staff_update on public.books for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy books_staff_delete on public.books for delete to authenticated
  using ((select public.is_staff()));

-- settings: everyone signed in may read the policy numbers; writes via update_settings().
create policy settings_read on public.settings for select to authenticated using (true);

-- staff_roles
create policy staff_roles_staff_read on public.staff_roles for select to authenticated
  using ((select public.is_staff()));
create policy staff_roles_admin_delete on public.staff_roles for delete to authenticated
  using ((select public.is_admin()) and staff_roles.user_id <> (select auth.uid()));

-- members
create policy members_self_read on public.members for select to authenticated
  using (members.auth_user_id = (select auth.uid()) or (select public.is_staff()));
create policy members_staff_insert on public.members for insert to authenticated
  with check ((select public.is_staff()));
create policy members_staff_update on public.members for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy members_staff_delete on public.members for delete to authenticated
  using ((select public.is_staff()));

-- donations (staff only)
create policy donations_staff_read on public.donations for select to authenticated
  using ((select public.is_staff()));
create policy donations_staff_insert on public.donations for insert to authenticated
  with check ((select public.is_staff()) and donations.review_status = 'Pending');
create policy donations_staff_update on public.donations for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy donations_staff_delete on public.donations for delete to authenticated
  using ((select public.is_staff()));

-- member_applications (staff only; created through public-intake)
create policy applications_staff_read on public.member_applications for select to authenticated
  using ((select public.is_staff()));
create policy applications_staff_update on public.member_applications for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- member-owned, read-only for the member
create policy borrow_requests_read on public.borrow_requests for select to authenticated
  using (borrow_requests.member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy loans_read on public.loans for select to authenticated
  using (loans.member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy fines_read on public.fines for select to authenticated
  using (fines.member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy fine_payments_read on public.fine_payments for select to authenticated
  using (
    (select public.is_staff())
    or exists (select 1 from public.fines f
               where f.id = fine_payments.fine_id
                 and f.member_id = (select public.current_member_id()))
  );
create policy fine_waivers_read on public.fine_waivers for select to authenticated
  using (
    (select public.is_staff())
    or exists (select 1 from public.fines f
               where f.id = fine_waivers.fine_id
                 and f.member_id = (select public.current_member_id()))
  );

-- contact_messages, audit_log (staff only)
create policy contact_messages_staff_read on public.contact_messages for select to authenticated
  using ((select public.is_staff()));
create policy contact_messages_staff_update on public.contact_messages for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy audit_log_staff_read on public.audit_log for select to authenticated
  using ((select public.is_staff()));

-- Helper execute rights
revoke all on function public.is_staff() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.current_member_id() from public, anon;
revoke all on function public.my_role() from public, anon;
grant execute on function public.is_staff(), public.is_admin(), public.current_member_id(), public.my_role()
  to authenticated, service_role;
revoke all on function private.require_staff() from public;
revoke all on function private.require_admin() from public;
revoke all on function private.require_member() from public;
revoke all on function private.audit(text,text,text,jsonb,jsonb) from public;
revoke all on function private.mark_rpc() from public;
