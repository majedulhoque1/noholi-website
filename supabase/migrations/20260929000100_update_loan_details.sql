-- ---------------------------------------------------------------------------
-- update_loan_details (staff): correct a loan's guarantor snapshot or notes.
-- Loans have no direct UPDATE grant, so the OS "Edit loan" action goes here.
-- Only the keys listed below are accepted; anything else is refused so the
-- RPC can never touch dates, status, book or member.
-- ---------------------------------------------------------------------------
create or replace function public.update_loan_details(
  p_loan_id text,
  p_changes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.loans%rowtype;
  l2 public.loans%rowtype;
  v_allowed text[] := array[
    'guarantor_name', 'guarantor_relationship', 'guarantor_phone', 'guarantor_email',
    'guarantor_nid', 'guarantor_street', 'guarantor_city', 'guarantor_district',
    'guarantor_postal_code', 'notes'
  ];
  v_bad text;
begin
  perform private.require_staff();
  perform private.mark_rpc();

  if p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'::jsonb then
    raise exception 'Nothing to update.' using errcode = 'NH004';
  end if;
  select k into v_bad from jsonb_object_keys(p_changes) k where k <> all (v_allowed) limit 1;
  if v_bad is not null then
    raise exception 'The field "%" cannot be edited on a loan.', v_bad using errcode = 'NH004';
  end if;

  select * into l from public.loans where id = p_loan_id for update;
  if not found then
    raise exception 'Loan % was not found.', p_loan_id using errcode = 'NH003';
  end if;
  if l.status = 'Cancelled' then
    raise exception 'Loan % was voided and can no longer be edited.', l.id using errcode = 'NH008';
  end if;

  update public.loans set
    guarantor_name         = case when p_changes ? 'guarantor_name'         then nullif(btrim(p_changes->>'guarantor_name'), '')         else guarantor_name end,
    guarantor_relationship = case when p_changes ? 'guarantor_relationship' then nullif(btrim(p_changes->>'guarantor_relationship'), '') else guarantor_relationship end,
    guarantor_phone        = case when p_changes ? 'guarantor_phone'        then nullif(btrim(p_changes->>'guarantor_phone'), '')        else guarantor_phone end,
    guarantor_email        = case when p_changes ? 'guarantor_email'        then nullif(btrim(p_changes->>'guarantor_email'), '')        else guarantor_email end,
    guarantor_nid          = case when p_changes ? 'guarantor_nid'          then nullif(btrim(p_changes->>'guarantor_nid'), '')          else guarantor_nid end,
    guarantor_street       = case when p_changes ? 'guarantor_street'       then nullif(btrim(p_changes->>'guarantor_street'), '')       else guarantor_street end,
    guarantor_city         = case when p_changes ? 'guarantor_city'         then nullif(btrim(p_changes->>'guarantor_city'), '')         else guarantor_city end,
    guarantor_district     = case when p_changes ? 'guarantor_district'     then nullif(btrim(p_changes->>'guarantor_district'), '')     else guarantor_district end,
    guarantor_postal_code  = case when p_changes ? 'guarantor_postal_code'  then nullif(btrim(p_changes->>'guarantor_postal_code'), '')  else guarantor_postal_code end,
    notes                  = case when p_changes ? 'notes'                  then coalesce(p_changes->>'notes', '')                       else notes end
  where id = l.id
  returning * into l2;

  perform private.audit('update_loan_details', 'loans', l.id, to_jsonb(l), to_jsonb(l2));
  return to_jsonb(l2);
end;
$$;

revoke all on function public.update_loan_details(text, jsonb) from public, anon;
grant execute on function public.update_loan_details(text, jsonb) to authenticated;
