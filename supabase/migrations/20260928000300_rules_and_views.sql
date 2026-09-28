-- Noholi Library: business-rule helpers and derived views.

-- ---------------------------------------------------------------------------
-- Rule helpers (internal)
-- ---------------------------------------------------------------------------

-- Move a date forward to the next day the library is open.
create or replace function public.next_open_day(p_date date)
returns date
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_closed int[];
  v_d date := p_date;
  i int := 0;
begin
  select s.closed_weekdays into v_closed from public.settings s where s.id = 1;
  while extract(dow from v_d)::int = any (coalesce(v_closed, '{}')) and i < 7 loop
    v_d := v_d + 1;
    i := i + 1;
  end loop;
  return v_d;
end;
$$;

-- Fine for a loan returned (or evaluated) on p_on: days late x rate, capped
-- at the book's price, or the default book value when the price is missing.
create or replace function public.fine_for(p_due date, p_on date, p_price numeric)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select least(
           greatest(0, p_on - p_due) * s.fine_per_day,
           coalesce(p_price, s.default_book_value))::numeric(10,2)
  from public.settings s where s.id = 1
$$;

-- 150.00 -> '150', 150.50 -> '150.5' (for plain-English messages).
create or replace function private.money(p numeric)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when p = trunc(p) then trunc(p)::bigint::text
              else rtrim(rtrim(p::text, '0'), '.') end
$$;
revoke all on function private.money(numeric) from public;

-- Unpaid balance on settled fines for a member.
create or replace function private.member_balance(p_member_id text)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(f.amount - f.amount_paid), 0)::numeric(10,2)
  from public.fines f
  where f.member_id = p_member_id and f.status in ('Unpaid','Partially Paid')
$$;

-- Why a member may not borrow right now (null = not blocked).
create or replace function private.member_block_reason(p_member_id text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_archived timestamptz;
  v_balance numeric;
begin
  select m.status, m.archived_at into v_status, v_archived
  from public.members m where m.id = p_member_id;
  if not found or v_archived is not null then
    return 'This membership is closed.';
  end if;
  if v_status <> 'Active' then
    return format('This membership is %s. Please contact the library.', v_status);
  end if;
  if exists (select 1 from public.loans l
             where l.member_id = p_member_id and l.status = 'Active'
               and l.due_date < public.today_dhaka()) then
    return 'There is an overdue book on this account. Please return it first.';
  end if;
  v_balance := private.member_balance(p_member_id);
  if v_balance > 0 then
    return format('There is an unpaid fine of ৳%s on this account. Please clear it first.', private.money(v_balance));
  end if;
  return null;
end;
$$;

-- Active loans + pending holds.
create or replace function private.member_open_items(p_member_id text)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select (select count(*) from public.loans l where l.member_id = p_member_id and l.status = 'Active')::int
       + (select count(*) from public.borrow_requests r where r.member_id = p_member_id and r.status = 'Pending')::int
$$;

revoke all on function private.member_balance(text) from public;
revoke all on function private.member_block_reason(text) from public;
revoke all on function private.member_open_items(text) from public;
revoke all on function public.next_open_day(date) from public, anon;
revoke all on function public.fine_for(date,date,numeric) from public, anon;
grant execute on function public.next_open_day(date), public.fine_for(date,date,numeric) to authenticated, service_role;
grant execute on function public.today_dhaka(timestamptz), public.fmt_id(text,bigint,int) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Views (security_invoker: the caller's RLS applies, so a member sees only
-- their own rows and staff see everything).
-- ---------------------------------------------------------------------------

create view public.loan_status_v with (security_invoker = true) as
select
  l.*,
  case when l.status = 'Active' and l.due_date < t.today then 'Overdue' else l.status end as derived_status,
  case when l.status = 'Active' then greatest(0, t.today - l.due_date)
       else coalesce(f.days_overdue, 0) end as days_overdue,
  case when l.status = 'Active'
       then least(greatest(0, t.today - l.due_date) * s.fine_per_day,
                  coalesce(b.price, s.default_book_value))::numeric(10,2)
       else coalesce(f.amount, 0)::numeric(10,2) end as fine_amount,
  (l.status = 'Active') as fine_is_accruing,
  f.id          as fine_id,
  f.status      as fine_status,
  coalesce(f.amount_paid, 0)::numeric(10,2) as fine_paid,
  case when f.status in ('Unpaid','Partially Paid') then (f.amount - f.amount_paid)::numeric(10,2)
       else 0::numeric(10,2) end as fine_balance
from public.loans l
join public.books b on b.id = l.book_id
cross join public.settings s
cross join (select public.today_dhaka() as today) t
left join public.fines f on f.loan_id = l.id
where s.id = 1;

create view public.member_summary_v with (security_invoker = true) as
select
  m.*,
  (select count(*) from public.loans l where l.member_id = m.id and l.status = 'Active')::int as active_loans,
  (select count(*) from public.loans l where l.member_id = m.id and l.status = 'Active'
     and l.due_date < public.today_dhaka())::int as overdue_loans,
  (select count(*) from public.borrow_requests r where r.member_id = m.id and r.status = 'Pending')::int as active_holds,
  (select coalesce(sum(f.amount - f.amount_paid), 0) from public.fines f
     where f.member_id = m.id and f.status in ('Unpaid','Partially Paid'))::numeric(10,2) as outstanding_fines,
  (select coalesce(sum(v.fine_amount), 0) from public.loan_status_v v
     where v.member_id = m.id and v.status = 'Active')::numeric(10,2) as accruing_fines
from public.members m;

-- Reports: aggregate views, staff only (the is_staff() filter keeps members out).
create view public.loans_per_month_v with (security_invoker = true) as
select
  date_trunc('month', l.issued_date)::date as month,
  count(*)::int as loans_issued,
  count(*) filter (where l.status = 'Returned')::int as returned,
  count(*) filter (where l.status = 'Lost')::int as lost,
  count(*) filter (where l.status = 'Cancelled')::int as cancelled,
  count(*) filter (where l.status = 'Active')::int as still_active
from public.loans l
where public.is_staff()
group by 1
order by 1 desc;

create view public.top_books_v with (security_invoker = true) as
select
  b.id as book_id, b.title, b.title_bangla, b.author,
  count(l.id)::int as times_borrowed,
  max(l.issued_date) as last_borrowed
from public.books b
join public.loans l on l.book_id = b.id and l.status <> 'Cancelled'
where public.is_staff()
group by b.id, b.title, b.title_bangla, b.author
order by times_borrowed desc, b.title;

create view public.overdue_list_v with (security_invoker = true) as
select
  v.id as loan_id, v.book_id, v.book_title, v.member_id, v.member_name,
  m.phone as member_phone, m.email as member_email,
  v.issued_date, v.due_date, v.days_overdue, v.fine_amount as accruing_fine,
  v.guarantor_name, v.guarantor_phone
from public.loan_status_v v
join public.members m on m.id = v.member_id
where v.derived_status = 'Overdue' and public.is_staff()
order by v.days_overdue desc;

create view public.fines_collected_v with (security_invoker = true) as
select
  date_trunc('month', (p.paid_at at time zone 'Asia/Dhaka'))::date as month,
  p.method,
  count(*)::int as payments,
  sum(p.amount)::numeric(12,2) as amount_collected
from public.fine_payments p
where public.is_staff()
group by 1, 2
order by 1 desc, 2;

revoke all on public.loan_status_v, public.member_summary_v, public.loans_per_month_v,
  public.top_books_v, public.overdue_list_v, public.fines_collected_v from anon, authenticated;
grant select on public.loan_status_v, public.member_summary_v, public.loans_per_month_v,
  public.top_books_v, public.overdue_list_v, public.fines_collected_v to authenticated;
