-- Noholi Library: public (anon) RPCs and the intake throttle.

-- ---------------------------------------------------------------------------
-- search_books (anon). Safe columns + availability only. Bangla + English via
-- pg_trgm (ILIKE is served by the trigram GIN indexes; similarity ranks).
-- ---------------------------------------------------------------------------
create type public.book_card as (
  id text, title text, title_bangla text, author text, author_bangla text,
  genre text, category text, language text, publisher text, year_of_publication text,
  edition text, isbn text, pages int, condition text, thumbnail text,
  is_circulating boolean, total_copies int, available_copies int,
  total_count bigint
);

create or replace function public.search_books(
  q text default null,
  genre text default null,
  category text default null,
  language text default null,
  page int default 1,
  page_size int default 24
)
returns setof public.book_card
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_q text := nullif(btrim(coalesce(q, '')), '');
  v_size int := least(greatest(coalesce(page_size, 24), 1), 100);
  v_page int := greatest(coalesce(page, 1), 1);
  v_like text;
begin
  if v_q is not null then
    v_q := left(v_q, 100);
    v_like := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  with hits as (
    select b.*,
      case when v_q is null then 0::real
           else greatest(
             extensions.similarity(b.title, v_q),
             extensions.similarity(coalesce(b.title_bangla, ''), v_q),
             extensions.similarity(b.author, v_q),
             extensions.similarity(coalesce(b.author_bangla, ''), v_q),
             case when b.title ilike v_like or b.title_bangla ilike v_like then 0.9::real else 0::real end,
             case when b.author ilike v_like or b.author_bangla ilike v_like then 0.7::real else 0::real end)
      end as score
    from public.books b
    where b.archived_at is null
      and (search_books.genre is null or b.genre = search_books.genre)
      and (search_books.category is null or b.category = search_books.category)
      and (search_books.language is null or b.language = search_books.language)
      and (v_q is null
           or b.title ilike v_like or b.title_bangla ilike v_like
           or b.author ilike v_like or b.author_bangla ilike v_like
           or b.isbn = v_q or b.id = upper(v_q)
           or extensions.word_similarity(v_q, b.title) > 0.4
           or extensions.word_similarity(v_q, coalesce(b.title_bangla, '')) > 0.4
           or extensions.word_similarity(v_q, b.author) > 0.4
           or extensions.word_similarity(v_q, coalesce(b.author_bangla, '')) > 0.4)
  )
  select h.id, h.title, h.title_bangla, h.author, h.author_bangla,
         h.genre, h.category, h.language, h.publisher, h.year_of_publication,
         h.edition, h.isbn, h.pages, h.condition, h.thumbnail,
         h.is_circulating, h.total_copies, h.available_copies,
         count(*) over () as total_count
  from hits h
  order by h.score desc, h.title asc, h.id asc
  limit v_size offset (v_page - 1) * v_size;
end;
$$;

-- Facet values for the catalogue filters (anon).
create or replace function public.catalog_facets()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'genres', coalesce((select jsonb_agg(x.v order by x.v) from (select distinct b.genre v from public.books b where b.archived_at is null and b.genre is not null) x), '[]'),
    'categories', coalesce((select jsonb_agg(x.v order by x.v) from (select distinct b.category v from public.books b where b.archived_at is null and b.category is not null) x), '[]'),
    'languages', coalesce((select jsonb_agg(x.v order by x.v) from (select distinct b.language v from public.books b where b.archived_at is null and b.language is not null) x), '[]'))
$$;

-- ---------------------------------------------------------------------------
-- resolve_login (anon): identifier -> the synthetic auth email to sign in with.
-- Always returns an address of the same shape, so it never reveals whether a
-- member or email exists.
-- ---------------------------------------------------------------------------
create or replace function public.resolve_login(identifier text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v text := lower(btrim(coalesce(identifier, '')));
  v_id text;
begin
  if v ~ '^mem-[0-9a-z-]+$' then
    return v || '@members.noholi.app';
  end if;
  if position('@' in v) > 0 then
    select m.id into v_id from public.members m
    where lower(m.email) = v and m.auth_user_id is not null and m.archived_at is null
    limit 1;
    if v_id is not null then
      return lower(v_id) || '@members.noholi.app';
    end if;
  end if;
  -- Unknown: a deterministic address of the same shape.
  return 'mem-' || lpad(((('x' || substr(md5('noholi-login:' || v), 1, 8))::bit(32)::bigint % 9000) + 1000)::text, 4, '0')
         || '@members.noholi.app';
end;
$$;

-- ---------------------------------------------------------------------------
-- intake_submit (service role only; called by the public-intake edge fn).
-- Throttles under an advisory lock so parallel submissions can't slip past:
--   per phone: 3 per 24h, per IP: 5 per 24h (per kind), global: 30 per hour.
-- ---------------------------------------------------------------------------
create or replace function public.intake_submit(p_kind text, p_ip_hash text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text := nullif(regexp_replace(coalesce(p_payload ->> 'phone', ''), '[^0-9+]', '', 'g'), '');
  v_email text := nullif(lower(btrim(coalesce(p_payload ->> 'email', ''))), '');
  v_id text;
  v_msg_id bigint;
begin
  if p_kind not in ('application','contact') then
    raise exception 'Unknown form type.' using errcode = 'NH004';
  end if;
  perform pg_advisory_xact_lock(hashtext('noholi-intake'));

  if (select count(*) from private.intake_events e where e.at > now() - interval '1 hour') >= 30 then
    raise exception 'We are receiving a lot of messages right now. Please try again in an hour.' using errcode = 'NH429';
  end if;
  if v_phone is not null and (select count(*) from private.intake_events e
        where e.kind = p_kind and e.phone = v_phone and e.at > now() - interval '24 hours') >= 3 then
    raise exception 'You have already sent this form several times today. We will be in touch.' using errcode = 'NH429';
  end if;
  if p_ip_hash is not null and (select count(*) from private.intake_events e
        where e.kind = p_kind and e.ip_hash = p_ip_hash and e.at > now() - interval '24 hours') >= 5 then
    raise exception 'Too many submissions from this connection today. Please try again tomorrow.' using errcode = 'NH429';
  end if;

  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.' using errcode = 'NH004';
  end if;

  if p_kind = 'application' then
    if length(btrim(coalesce(p_payload ->> 'name', ''))) = 0 then
      raise exception 'Please enter your name.' using errcode = 'NH004';
    end if;
    if v_phone is null or length(v_phone) < 6 or length(v_phone) > 20 then
      raise exception 'Please enter a valid phone number.' using errcode = 'NH004';
    end if;
    insert into public.member_applications (name, phone, email, street, city, district, postal_code, ip_hash)
    values (left(btrim(p_payload ->> 'name'), 200), v_phone, v_email,
            left(nullif(btrim(p_payload ->> 'street'), ''), 300),
            left(nullif(btrim(p_payload ->> 'city'), ''), 100),
            left(nullif(btrim(p_payload ->> 'district'), ''), 100),
            left(nullif(btrim(p_payload ->> 'postal_code'), ''), 20),
            p_ip_hash)
    returning id into v_id;
    update public.member_applications
       set photo_path = 'applications/' || v_id || '/photo'
     where id = v_id and coalesce((p_payload ->> 'has_photo')::boolean, false);
  else
    if length(btrim(coalesce(p_payload ->> 'name', ''))) = 0 then
      raise exception 'Please enter your name.' using errcode = 'NH004';
    end if;
    if v_email is null and v_phone is null then
      raise exception 'Please give an email or phone number so we can reply.' using errcode = 'NH004';
    end if;
    if length(btrim(coalesce(p_payload ->> 'message', ''))) = 0 then
      raise exception 'Please write a message.' using errcode = 'NH004';
    end if;
    insert into public.contact_messages (name, email, phone, subject, message, ip_hash)
    values (left(btrim(p_payload ->> 'name'), 200), v_email, v_phone,
            left(nullif(btrim(p_payload ->> 'subject'), ''), 200),
            left(btrim(p_payload ->> 'message'), 5000), p_ip_hash)
    returning id into v_msg_id;
    v_id := v_msg_id::text;
  end if;

  insert into private.intake_events (kind, phone, ip_hash) values (p_kind, v_phone, p_ip_hash);
  return jsonb_build_object('id', v_id,
    'photo_path', (select a.photo_path from public.member_applications a where p_kind = 'application' and a.id = v_id));
end;
$$;

-- ---------------------------------------------------------------------------
-- purge_rejected_applications (cron): rejected applications older than 90 days.
-- Returns the photo paths so the caller can remove the objects too.
-- ---------------------------------------------------------------------------
create or replace function public.purge_rejected_applications()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paths text[];
  n int;
begin
  if (select auth.uid()) is not null then
    perform private.require_admin();
  end if;
  perform private.mark_rpc();

  with gone as (
    delete from public.member_applications a
    where a.status = 'Rejected' and a.decided_at < now() - interval '90 days'
    returning a.photo_path
  )
  select coalesce(array_agg(g.photo_path) filter (where g.photo_path is not null), '{}'), count(*)
  into v_paths, n from gone g;

  if cardinality(v_paths) > 0 then
    -- Direct deletes from storage tables are blocked by storage.protect_delete();
    -- this transaction-local flag is the documented bypass for maintenance jobs.
    perform set_config('storage.allow_delete_query', 'true', true);
    delete from storage.objects o where o.bucket_id = 'member-photos' and o.name = any (v_paths);
  end if;
  delete from private.intake_events where at < now() - interval '30 days';

  if n > 0 then
    perform private.audit('purge_rejected_applications', 'member_applications', null, null,
                          jsonb_build_object('deleted', n, 'photos', cardinality(v_paths)));
  end if;
  return n;
end;
$$;
