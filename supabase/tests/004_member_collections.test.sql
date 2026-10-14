-- Member wishlist, recommendations, contributions/reviews and staff moderation.
-- Run: npx supabase@2.118 test db
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'staff-c@test.local'),
  ('00000000-0000-0000-0000-0000000000a2', 'mem-test-c@members.noholi.app'),
  ('00000000-0000-0000-0000-0000000000a3', 'mem-test-d@members.noholi.app');
insert into public.staff_roles (user_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'staff');
insert into public.members (id, name, email, phone, auth_user_id) values
  ('MEM-TEST-C', 'Member C', 'c@example.com', '01700000011', '00000000-0000-0000-0000-0000000000a2'),
  ('MEM-TEST-D', 'Member D', 'd@example.com', '01700000012', '00000000-0000-0000-0000-0000000000a3');

-- ------------------------------------------------------------ anon
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$ select * from public.member_wishlist $$, '42501', null, 'anon cannot read wishlists');
select throws_ok($$ select * from public.book_recommendations $$, '42501', null, 'anon cannot read recommendations');
select throws_ok($$ select public.toggle_wishlist('BK-1') $$, '42501', null, 'anon cannot toggle wishlist');
select lives_ok($$ select * from public.book_reviews('BK-1') $$, 'anon can read approved reviews');
reset role;

-- ------------------------------------------------------------ member C
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;

select is(public.toggle_wishlist('BK-0001'), true, 'first toggle adds to wishlist');
select is(public.toggle_wishlist('BK-0001'), false, 'second toggle removes it');
select is(public.toggle_wishlist('BK-0002'), true, 'adds another item');
select is((select count(*)::int from public.member_wishlist), 1, 'member sees own wishlist rows');
select throws_ok($$ insert into public.member_wishlist (member_id, item_id) values ('MEM-TEST-C','BK-9') $$,
  '42501', null, 'no direct wishlist writes');

select lives_ok($$ select public.submit_recommendation(jsonb_build_object(
  'format','Physical Book','title','A Good Book','author','Some Author','language','Bangla',
  'reason','Many readers would enjoy it.')) $$, 'member can recommend a book');
select throws_ok($$ select public.submit_recommendation(jsonb_build_object(
  'title','x','author','y','language','French','reason','z')) $$, '23514', null, 'invalid language refused');
select is((select count(*)::int from public.book_recommendations), 1, 'member sees own recommendation');
select is((select status from public.book_recommendations), 'Submitted', 'recommendation starts Submitted');

select lives_ok($$ select public.save_contribution(jsonb_build_object(
  'kind','blog','title','My first post','content','Hello world'), false) $$, 'save a draft');
select is((select status from public.member_contributions where title = 'My first post'), 'Draft', 'draft status');
select lives_ok($$ select public.save_contribution(jsonb_build_object(
  'kind','review','title','Loved it','content','Great read','rating',5,'book_id','BK-0001',
  'book_title','Some Book','book_source','catalog'), true) $$, 'submit a review');
select throws_ok($$ select public.save_contribution(jsonb_build_object(
  'kind','review','title','No rating','content','x'), true) $$, 'NH008', null, 'review needs a rating');
select throws_ok($$ select public.review_contribution('CON-0001','Approved','x') $$, 'NH001', null,
  'member cannot moderate');
select throws_ok($$ select public.review_recommendation('REC-0001','Acquired') $$, 'NH001', null,
  'member cannot moderate recommendations');
reset role;

-- ------------------------------------------------------------ member D cannot see C's rows
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is((select count(*)::int from public.member_wishlist), 0, 'D sees none of C''s wishlist');
select is((select count(*)::int from public.book_recommendations), 0, 'D sees none of C''s recommendations');
select is((select count(*)::int from public.member_contributions), 0, 'D sees none of C''s pieces (nothing approved yet)');
reset role;

-- ------------------------------------------------------------ staff moderation
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is((select count(*)::int from public.member_contributions where status = 'Pending Review'), 1, 'staff see the queue');
select throws_ok($$ select public.review_contribution((select id from public.member_contributions where kind='review'),'Rejected') $$,
  'NH008', null, 'rejection needs a note');
select lives_ok($$ select public.review_contribution((select id from public.member_contributions where kind='review'),'Approved') $$,
  'staff approve a review');
select lives_ok($$ select public.review_recommendation((select id from public.book_recommendations),'Considering','Looking into it') $$,
  'staff update a recommendation');
reset role;

-- approved reviews become public
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*)::int from public.book_reviews('BK-0001')), 1, 'approved review is public');
reset role;

select is((select status from public.book_recommendations), 'Considering', 'member sees status change (service view)');

select * from finish();
rollback;
