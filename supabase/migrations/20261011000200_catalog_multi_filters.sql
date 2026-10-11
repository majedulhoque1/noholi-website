-- Catalogue filter panel: multi-select filters, an availability filter and live facet counts.
--
-- search_books gains four optional array filters (all default null):
--   genres, categories, languages  a row matches when its genre / category / language equals ANY value
--   availability                   a row matches when its availability bucket is ANY of the values
-- Within one filter the values are OR; across filters (and the old single genre / category /
-- language args, and q) they are AND. A null or empty array means "no filter". Every existing
-- argument keeps its name and meaning, so the admin app and the tests work unchanged.
--
-- Availability buckets are derived only from real columns (is_circulating, total_copies,
-- available_copies); they are mutually exclusive and match the wording on the book card
-- (bookAvailability in web/src/lib/books.ts):
--   reading    NOT is_circulating                                  "Reading room only"
--   borrowed   is_circulating, total_copies > 0, available = 0     "All copies on loan"
--   limited    is_circulating, 0 < available < total, available = 1   exactly one free copy of several
--   available  is_circulating, available > 0, and not limited      two or more free copies, or every
--                                                                  copy (incl. a single-copy book) free
-- A circulating book with total_copies = 0 ("No copies on the shelf") is in no bucket.
--
-- catalog_facet_counts(q, genres, categories, languages, availability) returns the counts the
-- filter panel shows beside each option, using the standard faceting rule: every facet's counts
-- apply q and the OTHER facets' selections but not its own, so ticking a second genre shows how
-- many books it would ADD rather than collapsing to zero.

create or replace function private.book_availability_bucket(
  is_circulating boolean,
  total_copies int,
  available_copies int
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when is_circulating is not true then 'reading'
    when coalesce(total_copies, 0) <= 0 then null
    when coalesce(available_copies, 0) <= 0 then 'borrowed'
    when available_copies = 1 and total_copies > 1 then 'limited'
    else 'available'
  end
$$;

revoke execute on function private.book_availability_bucket(boolean, int, int)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- search_books

drop function if exists public.search_books(text, text, text, text, int, int, text);

create or replace function public.search_books(
  q text default null,
  genre text default null,
  category text default null,
  language text default null,
  page int default 1,
  page_size int default 24,
  sort text default null,
  genres text[] default null,
  categories text[] default null,
  languages text[] default null,
  availability text[] default null
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
  -- Typo-tolerant matching only for longer queries; short ones ('Dune') match as substrings.
  v_fuzzy boolean := char_length(btrim(coalesce(q, ''))) >= 5;
  v_sort text := lower(coalesce(nullif(btrim(search_books.sort), ''), 'relevance'));
  v_genres text[] := case when cardinality(search_books.genres) > 0 then search_books.genres end;
  v_categories text[] := case when cardinality(search_books.categories) > 0 then search_books.categories end;
  v_languages text[] := case when cardinality(search_books.languages) > 0 then search_books.languages end;
  v_avail text[] := case when cardinality(search_books.availability) > 0 then search_books.availability end;
begin
  if v_q is not null then
    v_q := left(v_q, 100);
    v_like := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  with hits as (
    select b.*,
      (substring(b.year_of_publication from '(1[0-9]{3}|20[0-9]{2})'))::int as pub_year,
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
      and (v_genres is null or b.genre = any (v_genres))
      and (v_categories is null or b.category = any (v_categories))
      and (v_languages is null or b.language = any (v_languages))
      and (v_avail is null
           or private.book_availability_bucket(b.is_circulating, b.total_copies, b.available_copies) = any (v_avail))
      and (v_q is null
           or b.title ilike v_like or b.title_bangla ilike v_like
           or b.author ilike v_like or b.author_bangla ilike v_like
           or b.isbn = v_q or b.id = upper(v_q)
           or (v_fuzzy and (
                 extensions.word_similarity(v_q, b.title) > 0.55
              or extensions.word_similarity(v_q, coalesce(b.title_bangla, '')) > 0.55
              or extensions.word_similarity(v_q, b.author) > 0.55
              or extensions.word_similarity(v_q, coalesce(b.author_bangla, '')) > 0.55)))
  )
  select h.id, h.title, h.title_bangla, h.author, h.author_bangla,
         h.genre, h.category, h.language, h.publisher, h.year_of_publication,
         h.edition, h.isbn, h.pages, h.condition, h.thumbnail,
         h.is_circulating, h.total_copies, h.available_copies,
         count(*) over () as total_count
  from hits h
  order by
    case when v_sort = 'title' then lower(h.title) end asc,
    case when v_sort = 'title-desc' then lower(h.title) end desc,
    case when v_sort = 'author' then nullif(lower(btrim(h.author)), '') end asc nulls last,
    case when v_sort = 'newest' then h.pub_year end desc nulls last,
    case when v_sort = 'oldest' then h.pub_year end asc nulls last,
    h.score desc, (h.thumbnail is null) asc, h.title asc, h.id asc
  limit v_size offset (v_page - 1) * v_size;
end;
$$;

revoke execute on function public.search_books(text, text, text, text, int, int, text, text[], text[], text[], text[]) from public;
grant execute on function public.search_books(text, text, text, text, int, int, text, text[], text[], text[], text[]) to anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- catalog_facet_counts
--
-- Returns { total, genres: {value: n}, categories: {value: n}, languages: {value: n},
--           availability: {available, limited, borrowed, reading} } for non-archived books.
-- `total` is the full match count (every filter applied) = search_books' total_count.
-- Values with no matching book are simply absent from genres / categories / languages
-- (callers treat a missing key as 0); the four availability keys are always present.

create or replace function public.catalog_facet_counts(
  q text default null,
  genres text[] default null,
  categories text[] default null,
  languages text[] default null,
  availability text[] default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_q text := nullif(btrim(coalesce(q, '')), '');
  v_like text;
  v_fuzzy boolean := char_length(btrim(coalesce(q, ''))) >= 5;
  v_genres text[] := case when cardinality(catalog_facet_counts.genres) > 0 then catalog_facet_counts.genres end;
  v_categories text[] := case when cardinality(catalog_facet_counts.categories) > 0 then catalog_facet_counts.categories end;
  v_languages text[] := case when cardinality(catalog_facet_counts.languages) > 0 then catalog_facet_counts.languages end;
  v_avail text[] := case when cardinality(catalog_facet_counts.availability) > 0 then catalog_facet_counts.availability end;
  v_out jsonb;
begin
  if v_q is not null then
    v_q := left(v_q, 100);
    v_like := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  with base as (
    -- Same text match as search_books: keep the two in step.
    select b.genre, b.category, b.language,
           private.book_availability_bucket(b.is_circulating, b.total_copies, b.available_copies) as bucket
    from public.books b
    where b.archived_at is null
      and (v_q is null
           or b.title ilike v_like or b.title_bangla ilike v_like
           or b.author ilike v_like or b.author_bangla ilike v_like
           or b.isbn = v_q or b.id = upper(v_q)
           or (v_fuzzy and (
                 extensions.word_similarity(v_q, b.title) > 0.55
              or extensions.word_similarity(v_q, coalesce(b.title_bangla, '')) > 0.55
              or extensions.word_similarity(v_q, b.author) > 0.55
              or extensions.word_similarity(v_q, coalesce(b.author_bangla, '')) > 0.55)))
  ),
  flagged as (
    select x.*,
           (v_genres is null or x.genre = any (v_genres)) as g_ok,
           (v_categories is null or x.category = any (v_categories)) as c_ok,
           (v_languages is null or x.language = any (v_languages)) as l_ok,
           (v_avail is null or x.bucket = any (v_avail)) as a_ok
    from base x
  )
  select jsonb_build_object(
    'total', (select count(*) from flagged f where f.g_ok and f.c_ok and f.l_ok and f.a_ok),
    'genres', coalesce((
      select jsonb_object_agg(s.v, s.n)
      from (select f.genre v, count(*) n from flagged f
            where f.c_ok and f.l_ok and f.a_ok and f.genre is not null group by f.genre) s), '{}'::jsonb),
    'categories', coalesce((
      select jsonb_object_agg(s.v, s.n)
      from (select f.category v, count(*) n from flagged f
            where f.g_ok and f.l_ok and f.a_ok and f.category is not null group by f.category) s), '{}'::jsonb),
    'languages', coalesce((
      select jsonb_object_agg(s.v, s.n)
      from (select f.language v, count(*) n from flagged f
            where f.g_ok and f.c_ok and f.a_ok and f.language is not null group by f.language) s), '{}'::jsonb),
    'availability', (
      select jsonb_build_object(
        'available', count(*) filter (where f.bucket = 'available'),
        'limited',   count(*) filter (where f.bucket = 'limited'),
        'borrowed',  count(*) filter (where f.bucket = 'borrowed'),
        'reading',   count(*) filter (where f.bucket = 'reading'))
      from flagged f where f.g_ok and f.c_ok and f.l_ok))
  into v_out;

  return v_out;
end;
$$;

revoke execute on function public.catalog_facet_counts(text, text[], text[], text[], text[]) from public;
grant execute on function public.catalog_facet_counts(text, text[], text[], text[], text[]) to anon, authenticated;

notify pgrst, 'reload schema';
