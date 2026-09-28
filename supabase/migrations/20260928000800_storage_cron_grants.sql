-- Noholi Library: storage buckets, scheduled jobs, and final execute grants.

-- ---------------------------------------------------------------------------
-- Storage
--   covers         public read (by URL), staff write. Paths: '<book id>.webp'
--   member-photos  private. Staff read (signed URLs). Uploads only through
--                  signed upload URLs issued by the public-intake edge fn.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers', 'covers', true, 2097152, array['image/webp','image/jpeg','image/png']),
  ('member-photos', 'member-photos', false, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "covers: staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and (select public.is_staff()));
create policy "covers: staff update" on storage.objects for update to authenticated
  using (bucket_id = 'covers' and (select public.is_staff()))
  with check (bucket_id = 'covers' and (select public.is_staff()));
create policy "covers: staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and (select public.is_staff()));
create policy "covers: staff list" on storage.objects for select to authenticated
  using (bucket_id = 'covers' and (select public.is_staff()));

create policy "member-photos: staff read" on storage.objects for select to authenticated
  using (bucket_id = 'member-photos' and (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Scheduled jobs (pg_cron runs in UTC). 18:05 UTC = 00:05 Asia/Dhaka.
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;

select cron.schedule('noholi-expire-holds', '5 18 * * *', $$select public.expire_holds()$$);
select cron.schedule('noholi-purge-rejected-applications', '20 18 * * *', $$select public.purge_rejected_applications()$$);

-- ---------------------------------------------------------------------------
-- Execute grants. Supabase grants EXECUTE on new functions to anon and
-- authenticated by default; take it all back and open exactly what is needed.
-- ---------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;

-- anon (public website)
grant execute on function
  public.search_books(text,text,text,text,int,int),
  public.catalog_facets(),
  public.resolve_login(text),
  public.get_public_settings(),
  public.today_dhaka(timestamptz),
  public.fmt_id(text,bigint,int)
to anon, authenticated;

-- authenticated (each function checks staff / admin / member itself)
grant execute on function
  public.is_staff(), public.is_admin(), public.current_member_id(), public.my_role(),
  public.next_open_day(date), public.fine_for(date,date,numeric),
  -- staff
  public.issue_loan(text,text,date,text,text,text,text,text,text,text,text,text,text),
  public.issue_from_request(text,date,text),
  public.return_loan(text,date),
  public.void_loan(text,text),
  public.mark_lost(text,text),
  public.extend_loan(text,date),
  public.reject_request(text,text),
  public.expire_holds(),
  public.record_fine_payment(text,numeric,text,uuid,text,text),
  public.approve_application(text),
  public.reject_application(text,text),
  public.adjust_stock(text,int,text),
  public.add_donation_to_inventory(text),
  public.list_staff(),
  -- admin
  public.waive_fine(text,text),
  public.update_settings(int,int,numeric,numeric,int,int,int,int,int[]),
  public.remove_staff(uuid),
  public.purge_rejected_applications(),
  -- member
  public.renew_my_loan(text),
  public.submit_borrow_request(text,date,boolean,text,text,text,text,text,text,text,text,text,text,text),
  public.cancel_my_request(text),
  public.update_my_profile(text,text,text,text,text,text),
  public.complete_password_change()
to authenticated;

-- Needed by column defaults (staff inserts through the table API).
grant execute on function private.next_human_id(text,text,int,text) to authenticated;

-- service role only (edge functions)
revoke execute on function public.link_member_login(text,uuid,uuid,text) from public, anon, authenticated;
revoke execute on function public.intake_submit(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.link_member_login(text,uuid,uuid,text) to service_role;
grant execute on function public.intake_submit(text,text,jsonb) to service_role;
grant execute on all functions in schema public to service_role;

-- Future objects created by migrations must be granted explicitly.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
