-- Noholi Library: fines, stock, donations, settings, staff admin.

-- ---------------------------------------------------------------------------
-- record_fine_payment (staff). Same idempotency_key twice returns the first
-- payment instead of recording a second one. Overpayment is refused under a
-- row lock on the fine (and by the fines_paid_le_amount CHECK).
-- ---------------------------------------------------------------------------
create or replace function public.record_fine_payment(
  p_fine_id text,
  p_amount numeric,
  p_method text,
  p_idempotency_key uuid,
  p_reference text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.fines%rowtype;
  f2 public.fines%rowtype;
  p public.fine_payments%rowtype;
  v_balance numeric;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if p_idempotency_key is null then
    raise exception 'A payment key is required.' using errcode = 'NH004';
  end if;

  select * into f from public.fines where id = p_fine_id for update;
  if not found then
    raise exception 'Fine % was not found.', p_fine_id using errcode = 'NH003';
  end if;

  -- Checked after the lock so a concurrent duplicate sees the first commit.
  select * into p from public.fine_payments where idempotency_key = p_idempotency_key;
  if found then
    if p.fine_id <> p_fine_id then
      raise exception 'This payment key was already used for another fine.' using errcode = 'NH004';
    end if;
    return jsonb_build_object('payment', to_jsonb(p), 'fine', to_jsonb(f), 'duplicate', true);
  end if;

  if f.status not in ('Unpaid','Partially Paid') then
    raise exception 'Fine % is already %.', f.id, lower(f.status) using errcode = 'NH008';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'The amount must be more than zero.' using errcode = 'NH004';
  end if;
  if p_method is null or p_method not in ('Cash','bKash','Nagad','Bank Transfer','Card','Other') then
    raise exception 'Please choose a payment method.' using errcode = 'NH004';
  end if;
  v_balance := f.amount - f.amount_paid;
  if p_amount > v_balance then
    raise exception 'The payment (৳%) is more than the balance due (৳%).', private.money(p_amount), private.money(v_balance)
      using errcode = 'NH010';
  end if;

  insert into public.fine_payments (fine_id, amount, method, reference, note, recorded_by, idempotency_key)
  values (f.id, p_amount, p_method, nullif(btrim(p_reference), ''), nullif(btrim(p_note), ''),
          (select auth.uid()), p_idempotency_key)
  returning * into p;

  update public.fines
     set amount_paid = amount_paid + p_amount,
         status = case when amount_paid + p_amount >= amount then 'Paid' else 'Partially Paid' end
   where id = f.id returning * into f2;

  perform private.audit('record_fine_payment', 'fines', f.id, to_jsonb(f), to_jsonb(f2) || jsonb_build_object('payment', to_jsonb(p)));
  return jsonb_build_object('payment', to_jsonb(p), 'fine', to_jsonb(f2), 'duplicate', false);
end;
$$;

-- ---------------------------------------------------------------------------
-- waive_fine (admin with MFA). Waives the remaining balance.
-- ---------------------------------------------------------------------------
create or replace function public.waive_fine(p_fine_id text, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.fines%rowtype;
  f2 public.fines%rowtype;
  w public.fine_waivers%rowtype;
begin
  perform private.require_admin();
  perform private.mark_rpc();
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Please give a reason for waiving this fine.' using errcode = 'NH004';
  end if;

  select * into f from public.fines where id = p_fine_id for update;
  if not found then
    raise exception 'Fine % was not found.', p_fine_id using errcode = 'NH003';
  end if;
  if f.status not in ('Unpaid','Partially Paid') then
    raise exception 'Fine % is already %.', f.id, lower(f.status) using errcode = 'NH008';
  end if;

  insert into public.fine_waivers (fine_id, amount_waived, reason, waived_by)
  values (f.id, f.amount - f.amount_paid, btrim(p_reason), (select auth.uid()))
  returning * into w;
  update public.fines set status = 'Waived' where id = f.id returning * into f2;

  perform private.audit('waive_fine', 'fines', f.id, to_jsonb(f), to_jsonb(f2) || jsonb_build_object('waiver', to_jsonb(w)));
  return jsonb_build_object('fine', to_jsonb(f2), 'waiver', to_jsonb(w));
end;
$$;

-- ---------------------------------------------------------------------------
-- adjust_stock (staff): set the number of copies the library owns
-- ---------------------------------------------------------------------------
create or replace function public.adjust_stock(p_book_id text, p_new_total int, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.books%rowtype;
  b2 public.books%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Please give a reason for the stock change.' using errcode = 'NH004';
  end if;
  if p_new_total is null or p_new_total < 0 then
    raise exception 'The number of copies cannot be negative.' using errcode = 'NH004';
  end if;

  select * into b from public.books where id = p_book_id for update;
  if not found then
    raise exception 'Book % was not found.', p_book_id using errcode = 'NH003';
  end if;
  if p_new_total < b.issued_copies + b.reserved_copies then
    raise exception 'There are % copies on loan or on hold, so the total cannot go below that.',
      b.issued_copies + b.reserved_copies using errcode = 'NH015';
  end if;

  update public.books set total_copies = p_new_total where id = b.id returning * into b2;
  perform private.audit('adjust_stock', 'books', b.id,
    jsonb_build_object('total_copies', b.total_copies),
    jsonb_build_object('total_copies', b2.total_copies, 'reason', btrim(p_reason)));
  return to_jsonb(b2);
end;
$$;

-- ---------------------------------------------------------------------------
-- add_donation_to_inventory (staff). Parameter name _donation_id is kept for
-- the existing OS hook. Returns the new book id.
-- ---------------------------------------------------------------------------
create or replace function public.add_donation_to_inventory(_donation_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  d public.donations%rowtype;
  v_book text;
begin
  perform private.require_staff();
  perform private.mark_rpc();

  select * into d from public.donations where id = _donation_id for update;
  if not found then
    raise exception 'Donation % was not found.', _donation_id using errcode = 'NH003';
  end if;
  if d.review_status = 'Added to Inventory' or d.assigned_accession_id is not null then
    raise exception 'Donation % is already in the inventory as %.', d.id, d.assigned_accession_id using errcode = 'NH008';
  end if;
  if d.review_status <> 'Approved' then
    raise exception 'Only approved donations can be added to the inventory (this one is %).', lower(d.review_status)
      using errcode = 'NH008';
  end if;

  insert into public.books (title, author, condition, total_copies, donation_id)
  values (d.book_title, coalesce(nullif(btrim(d.book_author), ''), 'Unknown'), d.condition, 1, d.id)
  returning id into v_book;

  update public.donations
     set review_status = 'Added to Inventory', assigned_accession_id = v_book
   where id = d.id;

  perform private.audit('add_donation_to_inventory', 'donations', d.id, to_jsonb(d),
                        jsonb_build_object('book_id', v_book));
  return v_book;
end;
$$;

-- ---------------------------------------------------------------------------
-- update_settings (admin with MFA). null = leave unchanged.
-- ---------------------------------------------------------------------------
create or replace function public.update_settings(
  p_loan_days int default null,
  p_max_items int default null,
  p_fine_per_day numeric default null,
  p_default_book_value numeric default null,
  p_hold_grace_days int default null,
  p_pickup_window_days int default null,
  p_renewals_allowed int default null,
  p_renewal_days int default null,
  p_closed_weekdays int[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.settings%rowtype;
  s2 public.settings%rowtype;
begin
  perform private.require_admin();
  perform private.mark_rpc();
  if p_closed_weekdays is not null and (
       not (p_closed_weekdays <@ array[0,1,2,3,4,5,6])
       or cardinality(p_closed_weekdays) >= 7) then
    raise exception 'Closed days must be weekday numbers 0 (Sunday) to 6 (Saturday), and at least one day must stay open.'
      using errcode = 'NH004';
  end if;

  select * into s from public.settings where id = 1 for update;
  begin
    update public.settings set
      loan_days          = coalesce(p_loan_days, loan_days),
      max_items          = coalesce(p_max_items, max_items),
      fine_per_day       = coalesce(p_fine_per_day, fine_per_day),
      default_book_value = coalesce(p_default_book_value, default_book_value),
      hold_grace_days    = coalesce(p_hold_grace_days, hold_grace_days),
      pickup_window_days = coalesce(p_pickup_window_days, pickup_window_days),
      renewals_allowed   = coalesce(p_renewals_allowed, renewals_allowed),
      renewal_days       = coalesce(p_renewal_days, renewal_days),
      closed_weekdays    = coalesce((select array_agg(distinct x order by x) from unnest(p_closed_weekdays) x), case when p_closed_weekdays is not null then '{}'::int[] end, closed_weekdays),
      updated_at         = now(),
      updated_by         = (select auth.uid())
    where id = 1 returning * into s2;
  exception when check_violation then
    raise exception 'One of the values is out of range.' using errcode = 'NH004';
  end;

  perform private.audit('update_settings', 'settings', '1', to_jsonb(s), to_jsonb(s2));
  return to_jsonb(s2);
end;
$$;

-- Safe subset for the public site (pickup picker, rules page).
create or replace function public.get_public_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'loan_days', s.loan_days, 'max_items', s.max_items, 'fine_per_day', s.fine_per_day,
    'hold_grace_days', s.hold_grace_days, 'pickup_window_days', s.pickup_window_days,
    'renewals_allowed', s.renewals_allowed, 'renewal_days', s.renewal_days,
    'closed_weekdays', to_jsonb(s.closed_weekdays), 'timezone', s.timezone,
    'today', public.today_dhaka())
  from public.settings s where s.id = 1
$$;

-- ---------------------------------------------------------------------------
-- Staff list for Settings -> Staff (admin), and removing a staff member.
-- ---------------------------------------------------------------------------
create or replace function public.list_staff()
returns table (user_id uuid, email text, role text, created_at timestamptz,
               last_sign_in_at timestamptz, mfa_enabled boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  return query
    select sr.user_id, u.email::text, sr.role, sr.created_at, u.last_sign_in_at,
           exists (select 1 from auth.mfa_factors mf where mf.user_id = sr.user_id and mf.status = 'verified')
    from public.staff_roles sr
    join auth.users u on u.id = sr.user_id
    order by sr.role, u.email;
end;
$$;

create or replace function public.remove_staff(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  sr public.staff_roles%rowtype;
begin
  perform private.require_admin();
  perform private.mark_rpc();
  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot remove your own staff access.' using errcode = 'NH004';
  end if;
  delete from public.staff_roles where user_id = p_user_id returning * into sr;
  if not found then
    raise exception 'That staff account was not found.' using errcode = 'NH003';
  end if;
  perform private.audit('remove_staff', 'staff_roles', p_user_id::text, to_jsonb(sr), null);
end;
$$;
