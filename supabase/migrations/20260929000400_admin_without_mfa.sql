-- Admin no longer requires a TOTP-verified (aal2) session: the admin role alone is enough.
-- Decision 2026-09-29 (library owner's call): two-factor sign-in removed for Noholi OS admins.
-- my_role() still reports 'aal' for information; nothing gates on it any more.

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
end;
$$;
