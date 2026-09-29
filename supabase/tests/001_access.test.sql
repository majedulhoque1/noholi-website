-- Access control: anon, member A/B, staff, admin with and without MFA.
-- Run: npx supabase@2.118 test db
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

-- ---------------------------------------------------------------- fixtures
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'staff@test.local'),
  ('00000000-0000-0000-0000-00000000000c', 'mem-test-a@members.noholi.app'),
  ('00000000-0000-0000-0000-00000000000d', 'mem-test-b@members.noholi.app');
insert into public.staff_roles (user_id, role) values
  ('00000000-0000-0000-0000-00000000000a', 'admin'),
  ('00000000-0000-0000-0000-00000000000b', 'staff');
insert into public.members (id, name, email, phone, auth_user_id) values
  ('MEM-TEST-A', 'Member A', 'a@example.com', '01700000001', '00000000-0000-0000-0000-00000000000c'),
  ('MEM-TEST-B', 'Member B', 'b@example.com', '01700000002', '00000000-0000-0000-0000-00000000000d');
insert into public.books (id, title, author, total_copies, price, location) values
  ('BK-9001', 'Access Book One', 'Author One', 3, 350, 'Shelf A'),
  ('BK-9002', 'Access Book Two', 'Author Two', 2, null, 'Shelf B');
insert into public.books (id, title, author, total_copies, archived_at) values
  ('BK-9003', 'Archived Book', 'Author Three', 1, now());
insert into public.loans (id, book_id, accession_id, book_title, member_id, member_name, issued_date, due_date)
values ('LN-9001', 'BK-9001', 'BK-9001', 'Access Book One', 'MEM-TEST-B', 'Member B',
        public.today_dhaka() - 3, public.today_dhaka() + 11);
update public.books set issued_copies = 1 where id = 'BK-9001';
insert into public.fines (id, loan_id, member_id, amount) values ('FN-9001', 'LN-9001', 'MEM-TEST-B', 50);

-- ---------------------------------------------------------------- anon
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok($$ select price from public.books $$, '42501', null, 'anon cannot read books.price');
select throws_ok($$ select location from public.books $$, '42501', null, 'anon cannot read books.location');
select throws_ok($$ select genre_raw from public.books $$, '42501', null, 'anon cannot read books.*_raw');
select lives_ok($$ select id, title, available_copies from public.books $$, 'anon can read safe book columns');
select is((select count(*)::int from public.books where id like 'BK-900%'), 2, 'anon does not see archived books');
select throws_ok($$ select * from public.members $$, '42501', null, 'anon cannot read members');
select throws_ok($$ select * from public.loans $$, '42501', null, 'anon cannot read loans');
select throws_ok($$ select * from public.fines $$, '42501', null, 'anon cannot read fines');
select throws_ok($$ select * from public.settings $$, '42501', null, 'anon cannot read settings table');
select throws_ok($$ select * from public.loan_status_v $$, '42501', null, 'anon cannot read loan_status_v');
select throws_ok($$ select public.issue_loan('MEM-TEST-A','BK-9001') $$, '42501', null, 'anon cannot call issue_loan');
select lives_ok($$ select * from public.search_books('Access') $$, 'anon can call search_books');
select is((select count(*)::int from public.search_books('Access Book')), 2, 'search_books finds the 2 live books, not the archived one');
select ok(public.resolve_login('MEM-TEST-A') = 'mem-test-a@members.noholi.app', 'resolve_login maps a member id');
select ok(public.resolve_login('nobody@nowhere.test') ~ '^mem-[0-9]{4}@members\.noholi\.app$', 'resolve_login unknown input has the same shape');
reset role;

-- ---------------------------------------------------------------- member A
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;

select is((select count(*)::int from public.members), 1, 'member sees only their own member row');
select is((select id from public.members), 'MEM-TEST-A', '... and it is their own');
select is((select count(*)::int from public.loans), 0, 'member A cannot see member B loans');
select is((select count(*)::int from public.fines), 0, 'member A cannot see member B fines');
select is((select count(*)::int from public.loan_status_v), 0, 'member A sees no rows of B in loan_status_v');
select throws_ok($$ update public.members set must_change_password = false $$, '42501', null,
  'member cannot update must_change_password directly');
update public.members set phone = '999' where id = 'MEM-TEST-A';
select throws_ok($$ insert into public.loans (book_id, accession_id, book_title, member_id, member_name, due_date)
  values ('BK-9001','BK-9001','x','MEM-TEST-A','A', current_date + 1) $$, '42501', null, 'member cannot insert loans');
select throws_ok($$ select public.issue_loan('MEM-TEST-A','BK-9001') $$, 'NH001', null, 'member cannot call issue_loan');
select throws_ok($$ select public.adjust_stock('BK-9001', 10, 'x') $$, 'NH001', null, 'member cannot call adjust_stock');
select throws_ok($$ select public.renew_my_loan('LN-9001') $$, 'NH003', null, 'member cannot renew someone else''s loan');
select is((select count(*)::int from public.overdue_list_v), 0, 'report views return nothing to members');
reset role;
select is((select phone from public.members where id = 'MEM-TEST-A'), '01700000001', 'member direct update changed nothing (RLS)');

-- ---------------------------------------------------------------- staff
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is((select count(*)::int from public.members where id in ('MEM-TEST-A', 'MEM-TEST-B')), 2, 'staff see all members');
select throws_ok($$ select public.waive_fine('FN-9001', 'kind') $$, 'NH001', null, 'staff cannot waive fines');
select throws_ok($$ select public.update_settings(p_loan_days => 21) $$, 'NH001', null, 'staff cannot update settings');
select throws_ok($$ update public.settings set loan_days = 21 $$, '42501', null, 'staff cannot update settings table directly');
select throws_ok($$ update public.books set issued_copies = 0 where id = 'BK-9001' $$, '42501', null,
  'stock counters are not directly writable');
select lives_ok($$ update public.books set location = 'Shelf Z' where id = 'BK-9001' $$, 'staff can edit book details');
reset role;

-- ---------------------------------------------------------------- admin (no MFA required since 2026-09-29)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is(public.is_admin(), true, 'is_admin() is true for an admin at aal1 (no MFA gate)');
select throws_ok($$ select public.waive_fine('FN-9001', '  ') $$, 'NH004', null, 'admin at aal1 reaches the waiver rules (blank reason refused)');
select lives_ok($$ select public.waive_fine('FN-9001', 'Hardship') $$, 'admin at aal1 can waive');
select is((select status from public.fines where id = 'FN-9001'), 'Waived', 'fine is Waived');
reset role;

-- audit trail was written by the RPC
select ok(exists (select 1 from public.audit_log where action = 'waive_fine' and entity_id = 'FN-9001'
                  and actor = '00000000-0000-0000-0000-00000000000a'), 'waive_fine wrote an audit_log row');

select * from finish();
rollback;
