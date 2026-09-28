-- Covering indexes for foreign keys flagged by the advisors.
create index if not exists borrow_requests_loan_idx on public.borrow_requests (loan_id);
create index if not exists member_applications_member_idx on public.member_applications (member_id);
