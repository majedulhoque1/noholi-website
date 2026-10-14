-- Noholi Library: member wishlist, book recommendations, contributions (blogs, creative writing)
-- and book reviews, with staff moderation.
--
-- Members write only through the RPCs below (no direct table writes); they read their own rows.
-- Staff read everything and moderate through review_* RPCs. Reviews are contributions of kind
-- 'review', which keeps one moderation queue and one status vocabulary.

create sequence if not exists public.book_recommendations_id_seq;
create sequence if not exists public.member_contributions_id_seq;

-- ---------------------------------------------------------------------------
-- Wishlist: a private reading list. item_id is a catalogue book id or an audio book id.
-- ---------------------------------------------------------------------------
create table public.member_wishlist (
  member_id   text not null references public.members(id) on delete cascade,
  item_id     text not null check (length(btrim(item_id)) between 1 and 80),
  created_at  timestamptz not null default now(),
  primary key (member_id, item_id)
);

-- ---------------------------------------------------------------------------
-- Recommendations: "please acquire this title".
-- ---------------------------------------------------------------------------
create table public.book_recommendations (
  id           text primary key
               default private.next_human_id('public.book_recommendations_id_seq', 'REC', 4, 'public.book_recommendations'),
  member_id    text not null references public.members(id) on delete cascade,
  format       text not null default 'Physical Book'
               check (format in ('Physical Book','E-Book','Audio Book')),
  title        text not null check (length(btrim(title)) between 1 and 300),
  author       text not null check (length(btrim(author)) between 1 and 200),
  language     text not null check (language in ('Bangla','English')),
  reason       text not null check (length(btrim(reason)) between 1 and 2000),
  publisher    text, isbn text, year text, edition text, genre text, category text,
  narrator     text, source text, notes text,
  status       text not null default 'Submitted'
               check (status in ('Submitted','Under Review','Considering','Acquired','Not Planned')),
  explanation  text,
  catalog_id   text references public.books(id) on delete set null,
  timeline     jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index book_recommendations_member_idx on public.book_recommendations (member_id, created_at desc);
create index book_recommendations_status_idx on public.book_recommendations (status);
create index book_recommendations_catalog_idx on public.book_recommendations (catalog_id);

-- ---------------------------------------------------------------------------
-- Contributions (blog | creative | review).
-- ---------------------------------------------------------------------------
create table public.member_contributions (
  id           text primary key
               default private.next_human_id('public.member_contributions_id_seq', 'CON', 4, 'public.member_contributions'),
  member_id    text not null references public.members(id) on delete cascade,
  kind         text not null check (kind in ('blog','creative','review')),
  title        text not null check (length(btrim(title)) between 1 and 300),
  status       text not null default 'Draft'
               check (status in ('Draft','Pending Review','Approved','Published','Needs Revision','Rejected')),
  note         text,
  slug         text,
  book_id      text,
  book_title   text,
  book_source  text check (book_source is null or book_source in ('catalog','personal')),
  rating       int check (rating is null or rating between 1 and 5),
  language     text,
  category     text,
  excerpt      text,
  tags         text[] not null default '{}',
  content      text,
  timeline     jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint member_contributions_review_has_rating
    check (kind <> 'review' or status = 'Draft' or rating is not null)
);
create index member_contributions_member_idx on public.member_contributions (member_id, updated_at desc);
create index member_contributions_queue_idx on public.member_contributions (status, submitted_at);
create index member_contributions_book_idx on public.member_contributions (book_id) where kind = 'review';

alter table public.member_wishlist        enable row level security;
alter table public.book_recommendations   enable row level security;
alter table public.member_contributions   enable row level security;

create policy wishlist_self_read on public.member_wishlist for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy recommendations_self_read on public.book_recommendations for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy contributions_self_read on public.member_contributions for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));
-- Reviews that editors approved are public book-page content.
create policy contributions_public_reviews on public.member_contributions for select to anon, authenticated
  using (kind = 'review' and status in ('Approved','Published'));

grant select on public.member_wishlist, public.book_recommendations, public.member_contributions
  to authenticated;
grant select on public.member_contributions to anon;

create trigger book_recommendations_touch before update on public.book_recommendations
  for each row execute function private.touch_updated_at();
create trigger member_contributions_touch before update on public.member_contributions
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function private.timeline_event(p_label text, p_note text default null)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object('label', p_label, 'at', now(), 'note', nullif(btrim(coalesce(p_note,'')), '')))
$$;

-- ---------------------------------------------------------------------------
-- Wishlist RPCs (member)
-- ---------------------------------------------------------------------------
create or replace function public.toggle_wishlist(p_item_id text)
returns boolean   -- true = now on the wishlist, false = removed
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  v_item text := btrim(coalesce(p_item_id, ''));
begin
  v_member := private.require_member();
  if length(v_item) = 0 or length(v_item) > 80 then
    raise exception 'That item could not be found.' using errcode = 'NH003';
  end if;
  delete from public.member_wishlist where member_id = v_member and item_id = v_item;
  if found then return false; end if;
  insert into public.member_wishlist (member_id, item_id) values (v_member, v_item);
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Recommendation RPCs
-- ---------------------------------------------------------------------------
create or replace function public.submit_recommendation(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  r public.book_recommendations%rowtype;
  v_open int;
begin
  v_member := private.require_member();
  perform private.mark_rpc();

  select count(*) into v_open from public.book_recommendations
   where member_id = v_member and status in ('Submitted','Under Review')
     and created_at > now() - interval '1 day';
  if v_open >= 10 then
    raise exception 'You have sent several recommendations today. Please try again tomorrow.' using errcode = 'NH008';
  end if;

  insert into public.book_recommendations
    (member_id, format, title, author, language, reason, publisher, isbn, year, edition, genre,
     category, narrator, source, notes, timeline)
  values (
    v_member,
    coalesce(nullif(p->>'format',''), 'Physical Book'),
    btrim(coalesce(p->>'title','')),
    btrim(coalesce(p->>'author','')),
    coalesce(p->>'language',''),
    btrim(coalesce(p->>'reason','')),
    nullif(btrim(coalesce(p->>'publisher','')),''), nullif(btrim(coalesce(p->>'isbn','')),''),
    nullif(btrim(coalesce(p->>'year','')),''), nullif(btrim(coalesce(p->>'edition','')),''),
    nullif(btrim(coalesce(p->>'genre','')),''), nullif(btrim(coalesce(p->>'category','')),''),
    nullif(btrim(coalesce(p->>'narrator','')),''), nullif(btrim(coalesce(p->>'source','')),''),
    nullif(btrim(coalesce(p->>'notes','')),''),
    jsonb_build_array(private.timeline_event('Submitted'))
  ) returning * into r;

  perform private.audit('submit_recommendation', 'book_recommendations', r.id, null, to_jsonb(r));
  return to_jsonb(r);
end;
$$;

-- Staff moderation.
create or replace function public.review_recommendation(
  p_id text, p_status text, p_explanation text default null, p_catalog_id text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.book_recommendations%rowtype;
  r2 public.book_recommendations%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if p_status not in ('Under Review','Considering','Acquired','Not Planned') then
    raise exception 'Choose a valid status.' using errcode = 'NH008';
  end if;
  if p_status = 'Not Planned' and length(btrim(coalesce(p_explanation,''))) = 0 then
    raise exception 'Please give the member a short explanation.' using errcode = 'NH008';
  end if;
  select * into r from public.book_recommendations where id = p_id for update;
  if not found then
    raise exception 'Recommendation % was not found.', p_id using errcode = 'NH003';
  end if;
  update public.book_recommendations set
      status = p_status,
      explanation = coalesce(nullif(btrim(coalesce(p_explanation,'')),''), explanation),
      catalog_id = case when p_status = 'Acquired' then p_catalog_id else catalog_id end,
      timeline = timeline || jsonb_build_array(private.timeline_event(p_status, p_explanation))
    where id = p_id returning * into r2;
  perform private.audit('review_recommendation', 'book_recommendations', p_id, to_jsonb(r), to_jsonb(r2));
  return to_jsonb(r2);
end;
$$;

-- ---------------------------------------------------------------------------
-- Contribution RPCs (member)
-- p: kind, title, content, excerpt, language, category, tags[], book_id, book_title, book_source,
--    rating.  p_submit = true sends it to the editors; false saves a draft.
-- Passing p_id edits an existing Draft / Needs Revision piece of the caller's own.
-- ---------------------------------------------------------------------------
create or replace function public.save_contribution(p jsonb, p_submit boolean, p_id text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  v_kind text := p->>'kind';
  v_title text := btrim(coalesce(p->>'title',''));
  v_content text := nullif(btrim(coalesce(p->>'content','')),'');
  v_tags text[];
  v_rating int := nullif(p->>'rating','')::int;
  old public.member_contributions%rowtype;
  r public.member_contributions%rowtype;
  v_status text := case when p_submit then 'Pending Review' else 'Draft' end;
begin
  v_member := private.require_member();
  perform private.mark_rpc();

  if v_kind not in ('blog','creative','review') then
    raise exception 'Choose what you are submitting.' using errcode = 'NH008';
  end if;
  if length(v_title) = 0 then
    raise exception 'Please add a title.' using errcode = 'NH008';
  end if;
  if p_submit and v_content is null then
    raise exception 'Please write something before submitting.' using errcode = 'NH008';
  end if;
  if p_submit and v_kind = 'review' and (v_rating is null or v_rating not between 1 and 5) then
    raise exception 'Please give a rating from 1 to 5.' using errcode = 'NH008';
  end if;
  select coalesce(array_agg(btrim(x)) filter (where length(btrim(x)) > 0), '{}')
    into v_tags from jsonb_array_elements_text(coalesce(p->'tags','[]'::jsonb)) x;

  if p_id is null then
    insert into public.member_contributions
      (member_id, kind, title, status, language, category, excerpt, tags, content, book_id,
       book_title, book_source, rating, submitted_at, timeline)
    values (v_member, v_kind, v_title, v_status, nullif(p->>'language',''), nullif(p->>'category',''),
       nullif(p->>'excerpt',''), v_tags, v_content, nullif(p->>'book_id',''), nullif(p->>'book_title',''),
       nullif(p->>'book_source',''), v_rating, case when p_submit then now() end,
       jsonb_build_array(private.timeline_event(case when p_submit then 'Submitted' else 'Draft saved' end)))
    returning * into r;
  else
    select * into old from public.member_contributions where id = p_id for update;
    if not found or old.member_id <> v_member then
      raise exception 'That piece was not found.' using errcode = 'NH003';
    end if;
    if old.status not in ('Draft','Needs Revision') then
      raise exception 'This piece is already with the editors and can no longer be edited.' using errcode = 'NH008';
    end if;
    update public.member_contributions set
        title = v_title, status = v_status, language = nullif(p->>'language',''),
        category = nullif(p->>'category',''), excerpt = nullif(p->>'excerpt',''), tags = v_tags,
        content = v_content, book_id = nullif(p->>'book_id',''), book_title = nullif(p->>'book_title',''),
        book_source = nullif(p->>'book_source',''), rating = v_rating,
        submitted_at = case when p_submit then now() else submitted_at end,
        timeline = timeline || jsonb_build_array(
          private.timeline_event(case when p_submit then 'Resubmitted' else 'Draft saved' end))
      where id = p_id returning * into r;
  end if;

  perform private.audit('save_contribution', 'member_contributions', r.id, null, to_jsonb(r));
  return to_jsonb(r);
end;
$$;

create or replace function public.delete_my_contribution(p_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member text;
  r public.member_contributions%rowtype;
begin
  v_member := private.require_member();
  perform private.mark_rpc();
  select * into r from public.member_contributions where id = p_id for update;
  if not found or r.member_id <> v_member then
    raise exception 'That piece was not found.' using errcode = 'NH003';
  end if;
  if r.status not in ('Draft','Needs Revision','Rejected') then
    raise exception 'Only drafts and returned pieces can be deleted.' using errcode = 'NH008';
  end if;
  delete from public.member_contributions where id = p_id;
  perform private.audit('delete_my_contribution', 'member_contributions', p_id, to_jsonb(r), null);
end;
$$;

-- Staff moderation: Approved | Published | Needs Revision | Rejected (notes are member-visible).
create or replace function public.review_contribution(p_id text, p_status text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.member_contributions%rowtype;
  r2 public.member_contributions%rowtype;
begin
  perform private.require_staff();
  perform private.mark_rpc();
  if p_status not in ('Approved','Published','Needs Revision','Rejected') then
    raise exception 'Choose a valid status.' using errcode = 'NH008';
  end if;
  if p_status in ('Needs Revision','Rejected') and length(btrim(coalesce(p_note,''))) = 0 then
    raise exception 'Please tell the member what to change or why.' using errcode = 'NH008';
  end if;
  select * into r from public.member_contributions where id = p_id for update;
  if not found or r.status = 'Draft' then
    raise exception 'Contribution % was not found in the review queue.', p_id using errcode = 'NH003';
  end if;
  update public.member_contributions set
      status = p_status,
      note = nullif(btrim(coalesce(p_note,'')), ''),
      timeline = timeline || jsonb_build_array(private.timeline_event(p_status, p_note))
    where id = p_id returning * into r2;
  perform private.audit('review_contribution', 'member_contributions', p_id, to_jsonb(r), to_jsonb(r2));
  return to_jsonb(r2);
end;
$$;

-- Approved book reviews for a catalogue book (public).
create or replace function public.book_reviews(p_book_id text)
returns table (id text, member_name text, rating int, title text, content text, tags text[], created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, m.name, c.rating, c.title, c.content, c.tags, c.submitted_at
    from public.member_contributions c
    join public.members m on m.id = c.member_id
   where c.kind = 'review' and c.book_id = p_book_id and c.status in ('Approved','Published')
   order by c.submitted_at desc
   limit 50
$$;

-- ---------------------------------------------------------------------------
-- Grants (functions are revoked from everyone by default)
-- ---------------------------------------------------------------------------
revoke all on function private.timeline_event(text,text) from public, anon, authenticated;
revoke execute on function
  public.toggle_wishlist(text),
  public.submit_recommendation(jsonb),
  public.save_contribution(jsonb,boolean,text),
  public.delete_my_contribution(text),
  public.review_recommendation(text,text,text,text),
  public.review_contribution(text,text,text),
  public.book_reviews(text)
from public, anon, authenticated;
grant execute on function
  public.toggle_wishlist(text),
  public.submit_recommendation(jsonb),
  public.save_contribution(jsonb,boolean,text),
  public.delete_my_contribution(text),
  public.review_recommendation(text,text,text,text),
  public.review_contribution(text,text,text)
to authenticated;
grant execute on function public.book_reviews(text) to anon, authenticated;
grant execute on all functions in schema public to service_role;
