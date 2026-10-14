-- Noholi Library: patron profile photo + notification preferences.
--
-- Photo: members upload their own picture to the private `member-photos` bucket under
-- `members/<member id>/...` and record the path with update_my_profile(p_avatar). Staff already
-- read the bucket (signed URLs), so the photo shows up in the admin member list and drawer.
-- Preferences: one row per member in member_prefs; members read/write only their own row via
-- the RPCs below, staff can read every row (the reminder jobs and the admin drawer use it).

-- ---------------------------------------------------------------------------
-- Storage: a member may manage objects inside their own folder only.
-- ---------------------------------------------------------------------------
create policy "member-photos: member read own" on storage.objects for select to authenticated
  using (bucket_id = 'member-photos'
         and name like 'members/' || (select public.current_member_id()) || '/%');
create policy "member-photos: member insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'member-photos'
              and name like 'members/' || (select public.current_member_id()) || '/%');
create policy "member-photos: member update own" on storage.objects for update to authenticated
  using (bucket_id = 'member-photos'
         and name like 'members/' || (select public.current_member_id()) || '/%')
  with check (bucket_id = 'member-photos'
              and name like 'members/' || (select public.current_member_id()) || '/%');
create policy "member-photos: member delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'member-photos'
         and name like 'members/' || (select public.current_member_id()) || '/%');

-- ---------------------------------------------------------------------------
-- Notification preferences
-- ---------------------------------------------------------------------------
create table public.member_prefs (
  member_id               text primary key references public.members(id) on delete cascade,
  due_date_reminders      boolean not null default true,
  borrow_request_updates  boolean not null default true,
  contribution_decisions  boolean not null default true,
  new_noholi_books        boolean not null default false,
  updated_at              timestamptz not null default now()
);

alter table public.member_prefs enable row level security;

create policy member_prefs_read on public.member_prefs for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));

revoke all on public.member_prefs from anon, authenticated;
grant select on public.member_prefs to authenticated;

-- Upsert the signed-in member's preferences; null = leave unchanged.
create or replace function public.update_my_prefs(
  p_due_date_reminders boolean default null,
  p_borrow_request_updates boolean default null,
  p_contribution_decisions boolean default null,
  p_new_noholi_books boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  r public.member_prefs%rowtype;
begin
  v_member := private.require_member();
  perform private.mark_rpc();

  insert into public.member_prefs as p (
    member_id, due_date_reminders, borrow_request_updates, contribution_decisions, new_noholi_books
  ) values (
    v_member,
    coalesce(p_due_date_reminders, true),
    coalesce(p_borrow_request_updates, true),
    coalesce(p_contribution_decisions, true),
    coalesce(p_new_noholi_books, false)
  )
  on conflict (member_id) do update set
    due_date_reminders     = coalesce(p_due_date_reminders, p.due_date_reminders),
    borrow_request_updates = coalesce(p_borrow_request_updates, p.borrow_request_updates),
    contribution_decisions = coalesce(p_contribution_decisions, p.contribution_decisions),
    new_noholi_books       = coalesce(p_new_noholi_books, p.new_noholi_books),
    updated_at             = now()
  returning * into r;

  return to_jsonb(r);
end;
$$;

revoke execute on function public.update_my_prefs(boolean,boolean,boolean,boolean) from public, anon;
grant execute on function public.update_my_prefs(boolean,boolean,boolean,boolean) to authenticated;
