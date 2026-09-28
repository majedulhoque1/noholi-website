-- Business rules: fines, payments, void, lost, closed days, holds, renewals, Dhaka time.
-- Run: npx supabase@2.118 test db
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

-- ---------------------------------------------------------------- fixtures
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'staff-rules@test.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'mem-rule-1@members.noholi.app'),
  ('00000000-0000-0000-0000-0000000000c2', 'mem-rule-2@members.noholi.app');
insert into public.staff_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000b1', 'staff');
insert into public.members (id, name, phone, auth_user_id) values
  ('MEM-RULE-1', 'Rule One', '01800000001', '00000000-0000-0000-0000-0000000000c1'),
  ('MEM-RULE-2', 'Rule Two', '01800000002', '00000000-0000-0000-0000-0000000000c2'),
  ('MEM-RULE-3', 'Rule Three (desk)', '01800000003', null);
insert into public.books (id, title, author, total_copies, price) values
  ('BK-8001', 'Cheap Book', 'A', 5, 50),        -- fine capped at 50
  ('BK-8002', 'No Price Book', 'B', 5, null),   -- cap = default 200
  ('BK-8003', 'Pricey Book', 'C', 5, 500),
  ('BK-8004', 'Lost Book', 'D', 3, 420),
  ('BK-8005', 'Lost No Price', 'E', 2, null),
  ('BK-8006', 'Reading Room Only', 'F', 2, 100),
  ('BK-8007', 'Hold Book', 'G', 1, 100),
  ('BK-8011', 'Limit 1', 'H', 3, 10), ('BK-8012', 'Limit 2', 'H', 3, 10),
  ('BK-8013', 'Limit 3', 'H', 3, 10), ('BK-8014', 'Limit 4', 'H', 3, 10),
  ('BK-8015', 'Limit 5', 'H', 3, 10), ('BK-8016', 'Limit 6', 'H', 3, 10),
  ('BK-8020', 'Renew Book', 'I', 2, 100),
  ('BK-8021', 'বাংলা উপন্যাস', 'হুমায়ূন আহমেদ', 1, 150);
update public.books set title_bangla = 'বাংলা উপন্যাস', author_bangla = 'হুমায়ূন আহমেদ' where id = 'BK-8021';
update public.books set is_circulating = false where id = 'BK-8006';

-- Backdated loans (as the DB owner) so we can test late returns.
insert into public.loans (id, book_id, accession_id, book_title, member_id, member_name, issued_date, due_date) values
  ('LN-8001', 'BK-8001', 'BK-8001', 'Cheap Book',    'MEM-RULE-3', 'Rule Three', public.today_dhaka() - 24, public.today_dhaka() - 10),
  ('LN-8002', 'BK-8002', 'BK-8002', 'No Price Book', 'MEM-RULE-3', 'Rule Three', public.today_dhaka() - 44, public.today_dhaka() - 30),
  ('LN-8003', 'BK-8003', 'BK-8003', 'Pricey Book',   'MEM-RULE-3', 'Rule Three', public.today_dhaka() - 17, public.today_dhaka() - 3),
  ('LN-8004', 'BK-8004', 'BK-8004', 'Lost Book',     'MEM-RULE-3', 'Rule Three', public.today_dhaka() - 5,  public.today_dhaka() + 9),
  ('LN-8005', 'BK-8005', 'BK-8005', 'Lost No Price', 'MEM-RULE-3', 'Rule Three', public.today_dhaka() - 5,  public.today_dhaka() + 9);
update public.books set issued_copies = 1 where id in ('BK-8001','BK-8002','BK-8003','BK-8004','BK-8005');

-- ---------------------------------------------------------------- Dhaka time
select is(public.today_dhaka('2026-09-27 19:30:00+00'), '2026-09-28'::date, '01:30 Dhaka is already the next day');
select is(public.today_dhaka('2026-09-27 17:59:00+00'), '2026-09-27'::date, '23:59 Dhaka is still the same day');
select is((select derived_status from public.loan_status_v where id = 'LN-8003'), 'Overdue', 'loan due before today (Dhaka) is Overdue');
select is((select derived_status from public.loan_status_v where id = 'LN-8004'), 'Active', 'loan due later is Active');
select is((select status from public.loans where id = 'LN-8003'), 'Active', 'Overdue is derived, not stored');
select is((select fine_amount from public.loan_status_v where id = 'LN-8003'), 30.00::numeric, 'accruing fine 3 days x 10 = 30');
select is((select fine_amount from public.loan_status_v where id = 'LN-8002'), 200.00::numeric, 'accruing fine capped at the 200 default when no price');

-- ---------------------------------------------------------------- as staff
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;

-- fine math on return
select is((public.return_loan('LN-8001') -> 'fine' ->> 'amount')::numeric, 50.00, '10 days late on a ৳50 book: fine capped at the price (50)');
select is((public.return_loan('LN-8002') -> 'fine' ->> 'amount')::numeric, 200.00, '30 days late, no price: capped at the ৳200 default');
select is((public.return_loan('LN-8003') -> 'fine' ->> 'amount')::numeric, 30.00, '3 days late on a ৳500 book: 30');
select is((select issued_copies from public.books where id = 'BK-8001'), 0, 'return released the copy');
select throws_ok($$ select public.return_loan('LN-8001') $$, 'NH008', null, 'double return is refused');

-- partial -> Partially Paid -> Paid
select is((public.record_fine_payment((select id from public.fines where loan_id = 'LN-8003'), 20, 'Cash',
            'aaaaaaaa-0000-0000-0000-000000000001') -> 'fine' ->> 'status'), 'Partially Paid', 'partial payment -> Partially Paid');
select is((public.record_fine_payment((select id from public.fines where loan_id = 'LN-8003'), 20, 'Cash',
            'aaaaaaaa-0000-0000-0000-000000000001') ->> 'duplicate')::boolean, true, 'same idempotency key returns the existing payment');
select is((select count(*)::int from public.fine_payments where idempotency_key = 'aaaaaaaa-0000-0000-0000-000000000001'), 1, '... and only 1 payment row exists');
select throws_ok($$ select public.record_fine_payment((select id from public.fines where loan_id = 'LN-8003'), 11, 'bKash',
            'aaaaaaaa-0000-0000-0000-000000000002') $$, 'NH010', null, 'overpayment (11 > balance 10) is refused');
select is((public.record_fine_payment((select id from public.fines where loan_id = 'LN-8003'), 10, 'bKash',
            'aaaaaaaa-0000-0000-0000-000000000003', 'TX123') -> 'fine' ->> 'status'), 'Paid', 'paying the rest -> Paid');
select throws_ok($$ select public.record_fine_payment((select id from public.fines where loan_id = 'LN-8003'), 1, 'Cash',
            'aaaaaaaa-0000-0000-0000-000000000004') $$, 'NH008', null, 'no payments on a Paid fine');

-- void a returned loan -> fine Voided; void an active loan -> copy released
select lives_ok($$ select public.void_loan('LN-8002', 'Entered by mistake') $$, 'void a returned loan');
select is((select status from public.fines where loan_id = 'LN-8002'), 'Voided', 'void -> fine Voided');
select is((select status from public.loans where id = 'LN-8002'), 'Cancelled', 'void -> loan Cancelled');
select throws_ok($$ select public.void_loan('LN-8002', 'again') $$, 'NH008', null, 'double void refused');
select throws_ok($$ select public.void_loan('LN-8003', 'x') $$, 'NH008', null, 'cannot void a loan whose fine has payments');

-- lost lowers total copies; fine = price or default
select is((public.mark_lost('LN-8004') -> 'fine' ->> 'amount')::numeric, 420.00, 'lost fine = price');
select is((select total_copies from public.books where id = 'BK-8004'), 2, 'lost lowers total_copies 3 -> 2');
select is((select issued_copies from public.books where id = 'BK-8004'), 0, 'lost releases the issued count');
select is((public.mark_lost('LN-8005') -> 'fine' ->> 'amount')::numeric, 200.00, 'lost fine without price = ৳200 default');

-- adjust_stock invariant
select throws_ok($$ select public.adjust_stock('BK-8001', -1, 'x') $$, 'NH004', null, 'negative stock refused');
select lives_ok($$ select public.adjust_stock('BK-8001', 7, 'Found two more copies') $$, 'adjust_stock works');
select is((select available_copies from public.books where id = 'BK-8001'), 7, 'available_copies is generated from the counts');
select throws_ok($$ select public.adjust_stock('BK-8001', 1, '') $$, 'NH004', null, 'adjust_stock needs a reason');

-- non-circulating can't be issued
select throws_ok($$ select public.issue_loan('MEM-RULE-2', 'BK-8006') $$, 'NH012', null, 'reading-room book cannot be issued');

-- closed weekday moves the due date forward
reset role;
update public.settings set closed_weekdays = array[extract(dow from public.today_dhaka() + 14)::int];
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is(((public.issue_loan('MEM-RULE-2', 'BK-8011')) ->> 'due_date')::date, public.today_dhaka() + 15,
  'a due date on a closed weekday moves to the next open day');
select is(public.next_open_day(public.today_dhaka() + 14), public.today_dhaka() + 15, 'next_open_day skips the closed day');
reset role;
update public.settings set closed_weekdays = '{}';

-- ---------------------------------------------------------------- member: requests
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;

select throws_ok($$ select public.submit_borrow_request('BK-8006', public.today_dhaka(), true, '1234567890', 'G', null, '017') $$,
  'NH012', null, 'non-circulating book cannot be requested');
select throws_ok($$ select public.submit_borrow_request('BK-8007', public.today_dhaka() + 30, true, '1234567890', 'G', null, '017') $$,
  'NH011', null, 'pickup outside the window refused');
select throws_ok($$ select public.submit_borrow_request('BK-8007', public.today_dhaka(), false, '1234567890', 'G', null, '017') $$,
  'NH004', null, 'guarantor consent is required');
select lives_ok($$ select public.submit_borrow_request('BK-8007', public.today_dhaka(), true, '1990123456789',
  'Guarantor G', 'Uncle', '01711111111', null, '9876543210') $$, 'member can request an available book');
select is((select reserved_copies from public.books where id = 'BK-8007'), 1, 'request reserves 1 copy');
select is((select available_copies from public.books where id = 'BK-8007'), 0, '... so available drops to 0');
select is((select nid from public.members where id = 'MEM-RULE-1'), '1990123456789', 'first request saves the member NID');
select is((select default_guarantor_name from public.members where id = 'MEM-RULE-1'), 'Guarantor G', '... and the default guarantor');
select throws_ok($$ select public.submit_borrow_request('BK-8007', public.today_dhaka(), true) $$,
  'NH009', null, 'duplicate hold on the same book refused');
select lives_ok($$ select public.cancel_my_request((select id from public.borrow_requests where book_id = 'BK-8007' and status = 'Pending')) $$,
  'member can cancel their own hold');
select is((select reserved_copies from public.books where id = 'BK-8007'), 0, 'cancel releases the reserved copy');
select lives_ok($$ select public.submit_borrow_request('BK-8007', public.today_dhaka(), true) $$,
  'second request pre-fills NID + guarantor from saved defaults');
reset role;

-- closed pickup day
update public.settings set closed_weekdays = array[extract(dow from public.today_dhaka() + 1)::int];
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c2","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select throws_ok($$ select public.submit_borrow_request('BK-8020', public.today_dhaka() + 1, true, '111', 'G', null, '017') $$,
  'NH011', null, 'pickup on a closed day refused');
reset role;
update public.settings set closed_weekdays = '{}';

-- expire_holds releases a backdated hold (run like pg_cron: no JWT)
select set_config('request.jwt.claims', '', true);
update public.borrow_requests set pickup_date = public.today_dhaka() - 5, expires_at = public.today_dhaka() - 3
  where book_id = 'BK-8007' and status = 'Pending';
select is(public.expire_holds() >= 1, true, 'expire_holds expired at least one hold');
select is((select status from public.borrow_requests where book_id = 'BK-8007' order by created_at desc, id desc limit 1), 'Expired', 'backdated hold is Expired');
select is((select reserved_copies from public.books where id = 'BK-8007'), 0, 'expired hold released its copy');

-- ---------------------------------------------------------------- limit of 5 items
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select public.issue_loan('MEM-RULE-2', 'BK-8012');
select public.issue_loan('MEM-RULE-2', 'BK-8013');
select public.issue_loan('MEM-RULE-2', 'BK-8014');
reset role;
-- MEM-RULE-2 now has 4 loans (8011..8014); add a hold for the 5th item
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c2","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select lives_ok($$ select public.submit_borrow_request('BK-8015', public.today_dhaka(), true, '222', 'G2', null, '018') $$, '5th item (a hold) is allowed');
select throws_ok($$ select public.submit_borrow_request('BK-8016', public.today_dhaka(), true) $$, 'NH006', null, '6th item refused (request)');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select throws_ok($$ select public.issue_loan('MEM-RULE-2', 'BK-8016') $$, 'NH006', null, '6th item refused (desk issue)');
select throws_ok($$ select public.issue_loan('MEM-RULE-2', 'BK-8015') $$, 'NH009', null, 'desk issue refused while a web hold waits for that book');
select lives_ok($$ select public.issue_from_request((select id from public.borrow_requests where book_id = 'BK-8015' and status = 'Pending')) $$,
  'issue_from_request converts the hold into a loan');
select is((select reserved_copies || '/' || issued_copies from public.books where id = 'BK-8015'), '0/1', 'hold moved from reserved to issued');
select throws_ok($$ select public.adjust_stock('BK-8015', 0, 'Weeding') $$, 'NH015', null, 'total cannot go below issued + reserved');

-- ---------------------------------------------------------------- renewal
select public.issue_loan('MEM-RULE-1', 'BK-8020');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is(((public.renew_my_loan((select id from public.loans where book_id = 'BK-8020' and status = 'Active'))) ->> 'due_date')::date,
  public.today_dhaka() + 28, 'renewal adds 14 days');
select throws_ok($$ select public.renew_my_loan((select id from public.loans where book_id = 'BK-8020' and status = 'Active')) $$,
  'NH013', null, 'second renewal refused');
select lives_ok($$ select public.update_my_profile(p_phone => '01999999999', p_city => 'Dhaka') $$, 'member can update own profile via RPC');
select is((select phone from public.members where id = 'MEM-RULE-1'), '01999999999', 'profile updated');
reset role;

-- blocked member (unpaid fine) cannot request or renew
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
reset role;
insert into public.loans (id, book_id, accession_id, book_title, member_id, member_name, issued_date, due_date, status, return_date)
values ('LN-8099', 'BK-8012', 'BK-8012', 'Limit 2', 'MEM-RULE-1', 'Rule One', public.today_dhaka() - 20, public.today_dhaka() - 6, 'Returned', public.today_dhaka());
insert into public.fines (loan_id, member_id, amount) values ('LN-8099', 'MEM-RULE-1', 60);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select throws_ok($$ select public.submit_borrow_request('BK-8013', public.today_dhaka(), true) $$, 'NH007', null, 'unpaid fine blocks requests');
select is((select outstanding_fines from public.member_summary_v), 60.00::numeric, 'member_summary_v shows the outstanding balance');
reset role;

-- ---------------------------------------------------------------- donations
insert into public.donations (id, donor_name, book_title, book_author, condition, review_status)
values ('DON-901', 'Donor', 'Gifted Book', '', 'Good', 'Approved');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select ok(public.add_donation_to_inventory('DON-901') ~ '^BK-', 'donation added to inventory, returns a BK id');
select throws_ok($$ select public.add_donation_to_inventory('DON-901') $$, 'NH008', null, 'second add of the same donation refused');
select is((select donation_id from public.books where id = (select assigned_accession_id from public.donations where id = 'DON-901')), 'DON-901', 'books.donation_id is set');
select throws_ok($$ update public.donations set review_status = 'Rejected' where id = 'DON-901' $$, null, null, 'cannot change a donation already in inventory');
select throws_ok($$ delete from public.members where id = 'MEM-RULE-3' $$, 'NH014', null, 'member with history cannot be hard-deleted');
reset role;

-- Bangla search
select ok(exists(select 1 from public.search_books('উপন্যাস', page_size => 100) r where r.id = 'BK-8021'), 'search_books finds a Bangla title');
select ok(exists(select 1 from generate_series(1, 20) pg, lateral public.search_books('হুমায়ূন আহমেদ', page => pg, page_size => 100) r where r.id = 'BK-8021'), 'search_books finds a Bangla author (any page)');

-- invariant at the constraint level
select throws_ok($$ update public.books set issued_copies = 99 where id = 'BK-8001' $$, '23514', null, 'issued + reserved <= total is a CHECK constraint');


-- purge of rejected applications (rows + photo objects) after 90 days, like pg_cron: no JWT
select set_config('request.jwt.claims', '', true);
insert into public.member_applications (id, name, phone, status, rejection_reason, decided_at, photo_path) values
  ('APP-9901', 'Old Reject', '01500000001', 'Rejected', 'Incomplete', now() - interval '100 days', 'applications/APP-9901/photo'),
  ('APP-9902', 'New Reject', '01500000002', 'Rejected', 'Incomplete', now() - interval '10 days', null),
  ('APP-9903', 'Old Pending', '01500000003', 'Pending', null, null, null);
insert into storage.objects (bucket_id, name) values ('member-photos', 'applications/APP-9901/photo');
select is(public.purge_rejected_applications(), 1, 'purge removes exactly the rejected application older than 90 days');
select is((select count(*)::int from public.member_applications where id like 'APP-990%'), 2, 'recent rejects and pending applications stay');
select is((select count(*)::int from storage.objects where bucket_id = 'member-photos' and name = 'applications/APP-9901/photo'), 0, 'its photo object is removed');

select * from finish();
rollback;
