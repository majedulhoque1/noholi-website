-- Noholi Library: web holds, member self-service, applications.

-- ---------------------------------------------------------------------------
-- submit_borrow_request (member): holds 1 copy until pickup_date + grace days
-- ---------------------------------------------------------------------------
create or replace function public.submit_borrow_request(
  p_book_id text,
  p_pickup_date date,
  p_consent boolean,
  p_member_nid text default null,
  p_guarantor_name text default null,
  p_guarantor_relationship text default null,
  p_guarantor_phone text default null,
  p_guarantor_email text default null,
  p_guarantor_nid text default null,
  p_guarantor_street text default null,
  p_guarantor_city text default null,
  p_guarantor_district text default null,
  p_guarantor_postal_code text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  m public.members%rowtype;
  b public.books%rowtype;
  s public.settings%rowtype;
  r public.borrow_requests%rowtype;
  v_today date := public.today_dhaka();
  v_reason text;
  v_nid text;
  v_g_name text; v_g_rel text; v_g_phone text; v_g_nid text;
  v_g_street text; v_g_city text; v_g_district text; v_g_postal text;
begin
  v_member := private.require_member();
  perform private.mark_rpc();
  select * into s from public.settings where id = 1;

  select * into m from public.members where id = v_member for update;
  select * into b from public.books where id = p_book_id for update;
  if not found or b.archived_at is not null then
    raise exception 'That book was not found.' using errcode = 'NH003';
  end if;

  v_reason := private.member_block_reason(v_member);
  if v_reason is not null then
    raise exception '%', v_reason using errcode = 'NH007';
  end if;
  if not b.is_circulating then
    raise exception '"%" is for the reading room only and cannot be borrowed.', b.title using errcode = 'NH012';
  end if;
  if exists (select 1 from public.loans x where x.member_id = v_member and x.book_id = b.id and x.status = 'Active') then
    raise exception 'You already have "%" on loan.', b.title using errcode = 'NH009';
  end if;
  if exists (select 1 from public.borrow_requests x where x.member_id = v_member and x.book_id = b.id and x.status = 'Pending') then
    raise exception 'You already have a request waiting for "%".', b.title using errcode = 'NH009';
  end if;
  if private.member_open_items(v_member) >= s.max_items then
    raise exception 'You already have % items (loans and holds). The limit is %.', private.member_open_items(v_member), s.max_items
      using errcode = 'NH006';
  end if;
  if b.available_copies <= 0 then
    raise exception 'Sorry, no copies of "%" are available right now.', b.title using errcode = 'NH005';
  end if;

  if p_pickup_date is null or p_pickup_date < v_today or p_pickup_date > v_today + s.pickup_window_days then
    raise exception 'Please choose a pickup date between today and % days from today.', s.pickup_window_days
      using errcode = 'NH011';
  end if;
  if extract(dow from p_pickup_date)::int = any (s.closed_weekdays) then
    raise exception 'The library is closed on %. Please choose another pickup day.', trim(to_char(p_pickup_date, 'Day'))
      using errcode = 'NH011';
  end if;
  if coalesce(p_consent, false) is not true then
    raise exception 'Please confirm that your guarantor agreed to share their details.' using errcode = 'NH004';
  end if;

  v_nid      := coalesce(nullif(btrim(p_member_nid), ''), m.nid);
  v_g_name   := coalesce(nullif(btrim(p_guarantor_name), ''), m.default_guarantor_name);
  v_g_rel    := coalesce(nullif(btrim(p_guarantor_relationship), ''), m.default_guarantor_relationship);
  v_g_phone  := coalesce(nullif(btrim(p_guarantor_phone), ''), m.default_guarantor_phone);
  v_g_nid    := coalesce(nullif(btrim(p_guarantor_nid), ''), m.default_guarantor_nid);
  v_g_street := coalesce(nullif(btrim(p_guarantor_street), ''), m.default_guarantor_street);
  v_g_city   := coalesce(nullif(btrim(p_guarantor_city), ''), m.default_guarantor_city);
  v_g_district := coalesce(nullif(btrim(p_guarantor_district), ''), m.default_guarantor_district);
  v_g_postal := coalesce(nullif(btrim(p_guarantor_postal_code), ''), m.default_guarantor_postal_code);

  if v_nid is null then
    raise exception 'Please enter your NID number.' using errcode = 'NH004';
  end if;
  if v_g_name is null or v_g_phone is null then
    raise exception 'Please enter your guarantor''s name and phone number.' using errcode = 'NH004';
  end if;

  insert into public.borrow_requests (
    member_id, member_name, book_id, book_title, member_nid,
    guarantor_name, guarantor_relationship, guarantor_phone, guarantor_email, guarantor_nid,
    guarantor_street, guarantor_city, guarantor_district, guarantor_postal_code,
    guarantor_consent, pickup_date, expires_at, note)
  values (
    m.id, m.name, b.id, b.title, v_nid,
    v_g_name, v_g_rel, v_g_phone, nullif(btrim(p_guarantor_email), ''), v_g_nid,
    v_g_street, v_g_city, v_g_district, v_g_postal,
    true, p_pickup_date, p_pickup_date + s.hold_grace_days, nullif(btrim(p_note), ''))
  returning * into r;

  update public.books set reserved_copies = reserved_copies + 1 where id = b.id;

  -- First request: remember NID + guarantor as the member's defaults.
  update public.members set
    nid = coalesce(nid, v_nid),
    default_guarantor_name         = coalesce(default_guarantor_name, v_g_name),
    default_guarantor_relationship = coalesce(default_guarantor_relationship, v_g_rel),
    default_guarantor_phone        = coalesce(default_guarantor_phone, v_g_phone),
    default_guarantor_nid          = coalesce(default_guarantor_nid, v_g_nid),
    default_guarantor_street       = coalesce(default_guarantor_street, v_g_street),
    default_guarantor_city         = coalesce(default_guarantor_city, v_g_city),
    default_guarantor_district     = coalesce(default_guarantor_district, v_g_district),
    default_guarantor_postal_code  = coalesce(default_guarantor_postal_code, v_g_postal)
  where id = m.id
    and (nid is null or default_guarantor_name is null);

  perform private.audit('submit_borrow_request', 'borrow_requests', r.id, null, to_jsonb(r));
  return to_jsonb(r);
end;
$$;

-- ---------------------------------------------------------------------------
-- cancel_my_request (member)
-- ---------------------------------------------------------------------------
create or replace function public.cancel_my_request(p_request_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  r public.borrow_requests%rowtype;
  r2 public.borrow_requests%rowtype;
begin
  v_member := private.require_member();
  perform private.mark_rpc();

  select * into r from public.borrow_requests where id = p_request_id;
  if not found or r.member_id <> v_member then
    raise exception 'Request % was not found.', p_request_id using errcode = 'NH003';
  end if;
  perform 1 from public.members where id = v_member for update;
  perform 1 from public.books where id = r.book_id for update;
  select * into r from public.borrow_requests where id = p_request_id for update;

  if r.status <> 'Pending' then
    raise exception 'This request is already %.', lower(r.status) using errcode = 'NH008';
  end if;

  update public.borrow_requests set status = 'Cancelled', decided_at = now()
   where id = r.id returning * into r2;
  update public.books set reserved_copies = reserved_copies - 1 where id = r.book_id;

  perform private.audit('cancel_my_request', 'borrow_requests', r.id, to_jsonb(r), to_jsonb(r2));
  return to_jsonb(r2);
end;
$$;

-- ---------------------------------------------------------------------------
-- reject_request (staff)
-- ---------------------------------------------------------------------------
create or replace function public.reject_request(p_request_id text, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.borrow_requests%rowtype;
  r2 public.borrow_requests%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Please give a reason so the member knows why.' using errcode = 'NH004';
  end if;

  select * into r from public.borrow_requests where id = p_request_id;
  if not found then
    raise exception 'Request % was not found.', p_request_id using errcode = 'NH003';
  end if;
  perform 1 from public.members where id = r.member_id for update;
  perform 1 from public.books where id = r.book_id for update;
  select * into r from public.borrow_requests where id = p_request_id for update;

  if r.status <> 'Pending' then
    raise exception 'Request % is already %.', r.id, lower(r.status) using errcode = 'NH008';
  end if;

  update public.borrow_requests
     set status = 'Rejected', reason = btrim(p_reason), decided_at = now(), decided_by = (select auth.uid())
   where id = r.id returning * into r2;
  update public.books set reserved_copies = reserved_copies - 1 where id = r.book_id;

  perform private.audit('reject_request', 'borrow_requests', r.id, to_jsonb(r), to_jsonb(r2));
  return to_jsonb(r2);
end;
$$;

-- ---------------------------------------------------------------------------
-- expire_holds (cron 00:05 Dhaka; staff may also run it)
-- ---------------------------------------------------------------------------
create or replace function public.expire_holds()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  n int := 0;
begin
  if (select auth.uid()) is not null then
    perform private.require_staff();
  end if;
  perform private.mark_rpc();

  for r in
    select br.id, br.book_id from public.borrow_requests br
    where br.status = 'Pending' and br.expires_at < public.today_dhaka()
    order by br.book_id, br.id
  loop
    perform 1 from public.books where id = r.book_id for update;
    update public.borrow_requests
       set status = 'Expired', decided_at = now(), reason = 'Not collected by the pickup deadline.'
     where id = r.id and status = 'Pending';
    if found then
      update public.books set reserved_copies = reserved_copies - 1 where id = r.book_id;
      n := n + 1;
    end if;
  end loop;

  if n > 0 then
    perform private.audit('expire_holds', 'borrow_requests', null, null, jsonb_build_object('expired', n));
  end if;
  return n;
end;
$$;

-- ---------------------------------------------------------------------------
-- update_my_profile (member): only these fields; null = leave unchanged,
-- empty string = clear.
-- ---------------------------------------------------------------------------
create or replace function public.update_my_profile(
  p_phone text default null,
  p_address_line text default null,
  p_city text default null,
  p_district text default null,
  p_postal_code text default null,
  p_avatar text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  m public.members%rowtype;
  m2 public.members%rowtype;
begin
  v_member := private.require_member();
  perform private.mark_rpc();

  if p_phone is not null and btrim(p_phone) <> '' and btrim(p_phone) !~ '^\+?[0-9 -]{6,20}$' then
    raise exception 'Please enter a valid phone number.' using errcode = 'NH004';
  end if;
  if length(coalesce(p_address_line,'')) > 300 or length(coalesce(p_city,'')) > 100
     or length(coalesce(p_district,'')) > 100 or length(coalesce(p_postal_code,'')) > 20
     or length(coalesce(p_avatar,'')) > 500 then
    raise exception 'One of the fields is too long.' using errcode = 'NH004';
  end if;

  select * into m from public.members where id = v_member for update;
  update public.members set
    phone        = case when p_phone is null then phone else nullif(btrim(p_phone), '') end,
    address_line = case when p_address_line is null then address_line else nullif(btrim(p_address_line), '') end,
    city         = case when p_city is null then city else nullif(btrim(p_city), '') end,
    district     = case when p_district is null then district else nullif(btrim(p_district), '') end,
    postal_code  = case when p_postal_code is null then postal_code else nullif(btrim(p_postal_code), '') end,
    avatar       = case when p_avatar is null then avatar else nullif(btrim(p_avatar), '') end
  where id = v_member returning * into m2;

  perform private.audit('update_my_profile', 'members', v_member, to_jsonb(m), to_jsonb(m2));
  return to_jsonb(m2);
end;
$$;

-- ---------------------------------------------------------------------------
-- complete_password_change (member): call AFTER supabase.auth.updateUser({password}).
-- Refused while the password is still the temporary one.
-- ---------------------------------------------------------------------------
create or replace function public.complete_password_change()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  v_marker text;
  v_current text;
begin
  v_member := private.require_member();
  perform private.mark_rpc();

  select lm.pw_hash into v_marker from private.login_markers lm where lm.member_id = v_member;
  select u.encrypted_password into v_current from auth.users u where u.id = (select auth.uid());
  if v_marker is not null and v_current is not distinct from v_marker then
    raise exception 'Please set a new password first.' using errcode = 'NH008';
  end if;

  update public.members set must_change_password = false where id = v_member;
  delete from private.login_markers where member_id = v_member;
  perform private.audit('complete_password_change', 'members', v_member, null, null);
  return jsonb_build_object('member_id', v_member, 'must_change_password', false);
end;
$$;

-- ---------------------------------------------------------------------------
-- link_member_login (service role only; called by the login edge functions)
-- ---------------------------------------------------------------------------
create or replace function public.link_member_login(
  p_member_id text,
  p_user_id uuid,
  p_actor uuid,
  p_action text default 'create_member_login'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
begin
  update public.members
     set auth_user_id = p_user_id, must_change_password = true
   where id = p_member_id;
  if not found then
    raise exception 'Member % was not found.', p_member_id using errcode = 'NH003';
  end if;
  select u.encrypted_password into v_hash from auth.users u where u.id = p_user_id;
  insert into private.login_markers (member_id, pw_hash, issued_at)
  values (p_member_id, v_hash, now())
  on conflict (member_id) do update set pw_hash = excluded.pw_hash, issued_at = excluded.issued_at;

  insert into public.audit_log (actor, actor_role, action, entity, entity_id, after)
  values (p_actor,
          (select sr.role from public.staff_roles sr where sr.user_id = p_actor),
          p_action, 'members', p_member_id,
          jsonb_build_object('auth_user_id', p_user_id, 'must_change_password', true));
  return jsonb_build_object('member_id', p_member_id, 'auth_user_id', p_user_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- approve_application / reject_application (staff)
-- ---------------------------------------------------------------------------
create or replace function public.approve_application(p_application_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.member_applications%rowtype;
  v_member text;
begin
  perform private.require_staff();
  perform private.mark_rpc();

  select * into a from public.member_applications where id = p_application_id for update;
  if not found then
    raise exception 'Application % was not found.', p_application_id using errcode = 'NH003';
  end if;
  if a.status <> 'Pending' then
    raise exception 'Application % is already %.', a.id, lower(a.status) using errcode = 'NH008';
  end if;
  if coalesce(a.email, '') <> '' and exists (
       select 1 from public.members mm where lower(mm.email) = lower(a.email)) then
    raise exception 'A member with the email % already exists.', a.email using errcode = 'NH009';
  end if;

  insert into public.members (name, email, phone, address_line, city, district, postal_code, avatar, status)
  values (a.name, nullif(a.email, ''), a.phone, a.street, a.city, a.district, a.postal_code, a.photo_path, 'Active')
  returning id into v_member;

  update public.member_applications
     set status = 'Approved', member_id = v_member, decided_at = now(), decided_by = (select auth.uid())
   where id = a.id;

  perform private.audit('approve_application', 'member_applications', a.id, to_jsonb(a),
                        jsonb_build_object('member_id', v_member));
  return v_member;
end;
$$;

create or replace function public.reject_application(p_application_id text, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.member_applications%rowtype;
  a2 public.member_applications%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Please give a reason for rejecting this application.' using errcode = 'NH004';
  end if;

  select * into a from public.member_applications where id = p_application_id for update;
  if not found then
    raise exception 'Application % was not found.', p_application_id using errcode = 'NH003';
  end if;
  if a.status <> 'Pending' then
    raise exception 'Application % is already %.', a.id, lower(a.status) using errcode = 'NH008';
  end if;

  update public.member_applications
     set status = 'Rejected', rejection_reason = btrim(p_reason), decided_at = now(), decided_by = (select auth.uid())
   where id = a.id returning * into a2;
  perform private.audit('reject_application', 'member_applications', a.id, to_jsonb(a), to_jsonb(a2));
  return to_jsonb(a2);
end;
$$;
