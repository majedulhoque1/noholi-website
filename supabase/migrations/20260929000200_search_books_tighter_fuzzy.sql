-- search_books: tighten fuzzy matching. Substring matches always count; trigram
-- word-similarity only applies to queries of 5+ characters and needs > 0.55
-- (was > 0.4 for any length, so 'Dune' matched 'Durbin' and 'Quite Contrary').
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
  -- Typo-tolerant matching only for longer queries; short ones ('Dune') match as substrings.
  v_fuzzy boolean := char_length(btrim(coalesce(q, ''))) >= 5;
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
  order by h.score desc, h.title asc, h.id asc
  limit v_size offset (v_page - 1) * v_size;
end;
$$;
