-- Noholi Library: lending RPCs (staff) + member self-service lending RPCs.
-- Lock order everywhere: member -> book -> loan/request -> fine. This keeps
-- concurrent calls from deadlocking and serialises every stock change on the
-- book row.

-- ---------------------------------------------------------------------------
-- issue_loan (staff, at the desk)
-- ---------------------------------------------------------------------------
create or replace function public.issue_loan(
  p_member_id text,
  p_book_id text,
  p_due_date date default null,
  p_guarantor_name text default null,
  p_guarantor_relationship text default null,
  p_guarantor_phone text default null,
  p_guarantor_email text default null,
  p_guarantor_nid text default null,
  p_guarantor_street text default null,
  p_guarantor_city text default null,
  p_guarantor_district text default null,
  p_guarantor_postal_code text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  m public.members%rowtype;
  b public.books%rowtype;
  s public.settings%rowtype;
  v_today date := public.today_dhaka();
  v_due date;
  v_reason text;
  l public.loans%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  select * into s from public.settings where id = 1;

  select * into m from public.members where id = p_member_id for update;
  if not found or m.archived_at is not null then
    raise exception 'Member % was not found.', p_member_id using errcode = 'NH003';
  end if;

  select * into b from public.books where id = p_book_id for update;
  if not found or b.archived_at is not null then
    raise exception 'Book % was not found.', p_book_id using errcode = 'NH003';
  end if;

  v_reason := private.member_block_reason(m.id);
  if v_reason is not null then
    raise exception '%', v_reason using errcode = 'NH007';
  end if;
  if not b.is_circulating then
    raise exception '"%" is for the reading room only and cannot be borrowed.', b.title using errcode = 'NH012';
  end if;
  if exists (select 1 from public.loans x where x.member_id = m.id and x.book_id = b.id and x.status = 'Active') then
    raise exception '% already has "%" on loan.', m.name, b.title using errcode = 'NH009';
  end if;
  if exists (select 1 from public.borrow_requests r where r.member_id = m.id and r.book_id = b.id and r.status = 'Pending') then
    raise exception '% has a web request waiting for "%". Issue it from Web Requests instead.', m.name, b.title using errcode = 'NH009';
  end if;
  if private.member_open_items(m.id) >= s.max_items then
    raise exception '% already has % items (loans and holds). The limit is %.', m.name, private.member_open_items(m.id), s.max_items using errcode = 'NH006';
  end if;
  if b.available_copies <= 0 then
    raise exception 'No copies of "%" are available right now.', b.title using errcode = 'NH005';
  end if;

  v_due := coalesce(p_due_date, v_today + s.loan_days);
  if v_due < v_today then
    raise exception 'The due date cannot be in the past.' using errcode = 'NH004';
  end if;
  v_due := public.next_open_day(v_due);

  insert into public.loans (
    book_id, accession_id, book_title, member_id, member_name, issued_date, due_date, status,
    guarantor_name, guarantor_relationship, guarantor_phone, guarantor_email, guarantor_nid,
    guarantor_street, guarantor_city, guarantor_district, guarantor_postal_code, notes, issued_by)
  values (
    b.id, b.id, b.title, m.id, m.name, v_today, v_due, 'Active',
    coalesce(p_guarantor_name, m.default_guarantor_name),
    coalesce(p_guarantor_relationship, m.default_guarantor_relationship),
    coalesce(p_guarantor_phone, m.default_guarantor_phone),
    p_guarantor_email,
    coalesce(p_guarantor_nid, m.default_guarantor_nid),
    coalesce(p_guarantor_street, m.default_guarantor_street),
    coalesce(p_guarantor_city, m.default_guarantor_city),
    coalesce(p_guarantor_district, m.default_guarantor_district),
    coalesce(p_guarantor_postal_code, m.default_guarantor_postal_code),
    p_notes, (select auth.uid()))
  returning * into l;

  update public.books set issued_copies = issued_copies + 1 where id = b.id;

  perform private.audit('issue_loan', 'loans', l.id, null, to_jsonb(l));
  return to_jsonb(l);
end;
$$;

-- ---------------------------------------------------------------------------
-- issue_from_request (staff): a member collects a web hold
-- ---------------------------------------------------------------------------
create or replace function public.issue_from_request(
  p_request_id text,
  p_due_date date default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.borrow_requests%rowtype;
  m public.members%rowtype;
  b public.books%rowtype;
  s public.settings%rowtype;
  v_today date := public.today_dhaka();
  v_due date;
  l public.loans%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  select * into s from public.settings where id = 1;

  select * into r from public.borrow_requests where id = p_request_id;
  if not found then
    raise exception 'Request % was not found.', p_request_id using errcode = 'NH003';
  end if;
  select * into m from public.members where id = r.member_id for update;
  select * into b from public.books where id = r.book_id for update;
  select * into r from public.borrow_requests where id = p_request_id for update;

  if r.status <> 'Pending' then
    raise exception 'Request % is already %.', r.id, lower(r.status) using errcode = 'NH008';
  end if;
  if r.expires_at < v_today then
    raise exception 'Request % expired on %.', r.id, r.expires_at using errcode = 'NH008';
  end if;
  if m.status <> 'Active' or m.archived_at is not null then
    raise exception 'This membership is %. Please sort it out before issuing.', coalesce(m.status, 'closed') using errcode = 'NH007';
  end if;

  v_due := coalesce(p_due_date, v_today + s.loan_days);
  if v_due < v_today then
    raise exception 'The due date cannot be in the past.' using errcode = 'NH004';
  end if;
  v_due := public.next_open_day(v_due);

  insert into public.loans (
    book_id, accession_id, book_title, member_id, member_name, issued_date, due_date, status,
    guarantor_name, guarantor_relationship, guarantor_phone, guarantor_email, guarantor_nid,
    guarantor_street, guarantor_city, guarantor_district, guarantor_postal_code,
    notes, request_id, issued_by)
  values (
    b.id, b.id, b.title, m.id, m.name, v_today, v_due, 'Active',
    r.guarantor_name, r.guarantor_relationship, r.guarantor_phone, r.guarantor_email, r.guarantor_nid,
    r.guarantor_street, r.guarantor_city, r.guarantor_district, r.guarantor_postal_code,
    coalesce(p_notes, r.note), r.id, (select auth.uid()))
  returning * into l;

  -- the held copy moves from reserved to issued
  update public.books
     set reserved_copies = reserved_copies - 1, issued_copies = issued_copies + 1
   where id = b.id;
  update public.borrow_requests
     set status = 'Issued', loan_id = l.id, decided_at = now(), decided_by = (select auth.uid())
   where id = r.id;

  perform private.audit('issue_from_request', 'loans', l.id, to_jsonb(r), to_jsonb(l));
  return to_jsonb(l);
end;
$$;

-- ---------------------------------------------------------------------------
-- return_loan (staff): closes the loan and creates the fine if it was late
-- ---------------------------------------------------------------------------
create or replace function public.return_loan(
  p_loan_id text,
  p_return_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.loans%rowtype;
  l2 public.loans%rowtype;
  b public.books%rowtype;
  f public.fines%rowtype;
  v_today date := public.today_dhaka();
  v_ret date;
  v_amount numeric;
begin
  perform private.require_staff();
  perform private.mark_rpc();

  select * into l from public.loans where id = p_loan_id;
  if not found then
    raise exception 'Loan % was not found.', p_loan_id using errcode = 'NH003';
  end if;
  perform 1 from public.members where id = l.member_id for update;
  select * into b from public.books where id = l.book_id for update;
  select * into l from public.loans where id = p_loan_id for update;

  if l.status <> 'Active' then
    raise exception 'Loan % is already %.', l.id, lower(l.status) using errcode = 'NH008';
  end if;

  v_ret := coalesce(p_return_date, v_today);
  if v_ret > v_today then
    raise exception 'The return date cannot be in the future.' using errcode = 'NH004';
  end if;
  if v_ret < l.issued_date then
    raise exception 'The return date cannot be before the issue date (%).', l.issued_date using errcode = 'NH004';
  end if;

  update public.loans set status = 'Returned', return_date = v_ret, closed_at = now()
   where id = l.id returning * into l2;
  update public.books set issued_copies = issued_copies - 1 where id = b.id;

  v_amount := public.fine_for(l.due_date, v_ret, b.price);
  if v_amount > 0 then
    insert into public.fines (loan_id, member_id, kind, days_overdue, amount)
    values (l.id, l.member_id, 'Overdue', greatest(0, v_ret - l.due_date), v_amount)
    returning * into f;
  end if;

  perform private.audit('return_loan', 'loans', l.id, to_jsonb(l), to_jsonb(l2));
  return jsonb_build_object('loan', to_jsonb(l2),
                            'fine', case when f.id is null then null else to_jsonb(f) end);
end;
$$;

-- ---------------------------------------------------------------------------
-- void_loan (staff): undo a loan entered by mistake
-- Active -> Cancelled and the copy goes back on the shelf.
-- Returned -> Cancelled and its fine becomes Voided (refused if money was taken).
-- ---------------------------------------------------------------------------
create or replace function public.void_loan(
  p_loan_id text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.loans%rowtype;
  l2 public.loans%rowtype;
  f public.fines%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Please give a reason for voiding this loan.' using errcode = 'NH004';
  end if;

  select * into l from public.loans where id = p_loan_id;
  if not found then
    raise exception 'Loan % was not found.', p_loan_id using errcode = 'NH003';
  end if;
  perform 1 from public.members where id = l.member_id for update;
  perform 1 from public.books where id = l.book_id for update;
  select * into l from public.loans where id = p_loan_id for update;
  select * into f from public.fines where loan_id = l.id for update;

  if l.status not in ('Active','Returned') then
    raise exception 'Loan % is already %.', l.id, lower(l.status) using errcode = 'NH008';
  end if;
  if f.id is not null and f.amount_paid > 0 then
    raise exception 'This loan''s fine already has payments recorded (৳%). It cannot be voided.', private.money(f.amount_paid)
      using errcode = 'NH008';
  end if;

  if l.status = 'Active' then
    update public.books set issued_copies = issued_copies - 1 where id = l.book_id;
  end if;
  update public.loans
     set status = 'Cancelled', closed_at = now(),
         notes = btrim(coalesce(notes, '') || E'\nVoided: ' || p_reason)
   where id = l.id returning * into l2;
  if f.id is not null and f.status in ('Unpaid','Partially Paid') then
    update public.fines set status = 'Voided' where id = f.id;
  end if;

  perform private.audit('void_loan', 'loans', l.id, to_jsonb(l), to_jsonb(l2) || jsonb_build_object('reason', p_reason));
  return to_jsonb(l2);
end;
$$;

-- ---------------------------------------------------------------------------
-- mark_lost (staff): loan Lost, one copy leaves the collection, fine = price
-- (or the default book value when the price is missing).
-- ---------------------------------------------------------------------------
create or replace function public.mark_lost(
  p_loan_id text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.loans%rowtype;
  l2 public.loans%rowtype;
  b public.books%rowtype;
  s public.settings%rowtype;
  f public.fines%rowtype;
  v_today date := public.today_dhaka();
begin
  perform private.require_staff();
  perform private.mark_rpc();
  select * into s from public.settings where id = 1;

  select * into l from public.loans where id = p_loan_id;
  if not found then
    raise exception 'Loan % was not found.', p_loan_id using errcode = 'NH003';
  end if;
  perform 1 from public.members where id = l.member_id for update;
  select * into b from public.books where id = l.book_id for update;
  select * into l from public.loans where id = p_loan_id for update;

  if l.status <> 'Active' then
    raise exception 'Loan % is already %.', l.id, lower(l.status) using errcode = 'NH008';
  end if;

  update public.loans
     set status = 'Lost', closed_at = now(),
         notes = case when p_note is null then notes else btrim(coalesce(notes, '') || E'\nLost: ' || p_note) end
   where id = l.id returning * into l2;
  update public.books
     set issued_copies = issued_copies - 1, total_copies = total_copies - 1
   where id = b.id;

  insert into public.fines (loan_id, member_id, kind, days_overdue, amount)
  values (l.id, l.member_id, 'Lost', greatest(0, v_today - l.due_date),
          coalesce(b.price, s.default_book_value))
  returning * into f;

  perform private.audit('mark_lost', 'loans', l.id, to_jsonb(l), to_jsonb(l2));
  return jsonb_build_object('loan', to_jsonb(l2), 'fine', to_jsonb(f));
end;
$$;

-- ---------------------------------------------------------------------------
-- extend_loan (staff): new due date, no limit on how often
-- ---------------------------------------------------------------------------
create or replace function public.extend_loan(
  p_loan_id text,
  p_new_due_date date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.loans%rowtype;
  l2 public.loans%rowtype;
  v_due date;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if p_new_due_date is null then
    raise exception 'Please choose the new due date.' using errcode = 'NH004';
  end if;

  select * into l from public.loans where id = p_loan_id for update;
  if not found then
    raise exception 'Loan % was not found.', p_loan_id using errcode = 'NH003';
  end if;
  if l.status <> 'Active' then
    raise exception 'Only an active loan can be extended (loan % is %).', l.id, lower(l.status) using errcode = 'NH008';
  end if;
  if p_new_due_date < public.today_dhaka() then
    raise exception 'The new due date cannot be in the past.' using errcode = 'NH004';
  end if;
  if p_new_due_date <= l.due_date then
    raise exception 'The new due date must be after the current one (%).', l.due_date using errcode = 'NH004';
  end if;
  v_due := public.next_open_day(p_new_due_date);

  update public.loans set due_date = v_due where id = l.id returning * into l2;
  perform private.audit('extend_loan', 'loans', l.id, to_jsonb(l), to_jsonb(l2));
  return to_jsonb(l2);
end;
$$;

-- ---------------------------------------------------------------------------
-- renew_my_loan (member): once, on or before the due date, not while blocked,
-- and not when the title has 0 available and someone's hold is waiting.
-- ---------------------------------------------------------------------------
create or replace function public.renew_my_loan(p_loan_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  l public.loans%rowtype;
  l2 public.loans%rowtype;
  b public.books%rowtype;
  s public.settings%rowtype;
  v_reason text;
  v_due date;
begin
  v_member := private.require_member();
  perform private.mark_rpc();
  select * into s from public.settings where id = 1;

  select * into l from public.loans where id = p_loan_id;
  if not found or l.member_id <> v_member then
    raise exception 'Loan % was not found.', p_loan_id using errcode = 'NH003';
  end if;
  perform 1 from public.members where id = v_member for update;
  select * into b from public.books where id = l.book_id for update;
  select * into l from public.loans where id = p_loan_id for update;

  if l.status <> 'Active' then
    raise exception 'This loan is %, so it cannot be renewed.', lower(l.status) using errcode = 'NH013';
  end if;
  if l.renewal_count >= s.renewals_allowed then
    raise exception 'This book has already been renewed. Please return it or ask the library.' using errcode = 'NH013';
  end if;
  if l.due_date < public.today_dhaka() then
    raise exception 'This book is overdue, so it cannot be renewed online. Please return it to the library.' using errcode = 'NH013';
  end if;
  v_reason := private.member_block_reason(v_member);
  if v_reason is not null then
    raise exception '%', v_reason using errcode = 'NH007';
  end if;
  if b.available_copies <= 0 and exists (
       select 1 from public.borrow_requests r where r.book_id = b.id and r.status = 'Pending') then
    raise exception 'Another member is waiting for this book, so it cannot be renewed.' using errcode = 'NH013';
  end if;

  v_due := public.next_open_day(l.due_date + s.renewal_days);
  update public.loans set due_date = v_due, renewal_count = renewal_count + 1
   where id = l.id returning * into l2;

  perform private.audit('renew_my_loan', 'loans', l.id, to_jsonb(l), to_jsonb(l2));
  return to_jsonb(l2);
end;
$$;
