-- update_loan_details: staff can fix guarantor/notes; nothing else is editable.
-- Run: npx supabase@2.118 test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000d1', 'staff-uld@test.local'),
  ('00000000-0000-0000-0000-0000000000d2', 'mem-uld-1@members.noholi.app');
insert into public.staff_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000d1', 'staff');
insert into public.members (id, name, phone, auth_user_id) values
  ('MEM-ULD-1', 'Uld Member', '01900000001', '00000000-0000-0000-0000-0000000000d2');
insert into public.books (id, title, author, total_copies, issued_copies, price) values ('BK-8101', 'Edit Me', 'X', 2, 1, 100);
insert into public.loans (id, book_id, accession_id, book_title, member_id, member_name, issued_date, due_date, guarantor_name)
  values ('LN-8101', 'BK-8101', 'BK-8101', 'Edit Me', 'MEM-ULD-1', 'Uld Member', public.today_dhaka(), public.today_dhaka() + 14, 'Old Name');

-- member is refused
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select throws_ok($$ select public.update_loan_details('LN-8101', '{"notes":"hi"}') $$, 'NH001', null, 'a member cannot edit loan details');
reset role;

-- staff
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is(public.update_loan_details('LN-8101', '{"guarantor_name":"  New Name ","notes":"Called guarantor"}') ->> 'guarantor_name', 'New Name', 'staff can correct the guarantor (trimmed)');
select is((select notes from public.loans where id = 'LN-8101'), 'Called guarantor', 'notes updated');
select throws_ok($$ select public.update_loan_details('LN-8101', '{"due_date":"2030-01-01"}') $$, 'NH004', null, 'due date is not editable here');
select throws_ok($$ select public.update_loan_details('LN-8101', '{}') $$, 'NH004', null, 'empty change set refused');
select throws_ok($$ select public.update_loan_details('LN-9999', '{"notes":"x"}') $$, 'NH003', null, 'unknown loan');
reset role;
select is((select count(*)::int from public.audit_log where action = 'update_loan_details' and entity_id = 'LN-8101'), 1, 'edit is audited');

select * from finish();
rollback;
