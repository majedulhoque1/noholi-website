import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BookCover, { availability } from '../components/BookCover.jsx';
import { bookPath, getCatalogFacets, searchBooks } from '../lib/books.js';
import { describeError } from '../lib/supabase.js';
import './Catalog.css';

const PAGE_SIZE = 12;
const FILTERS = [
  { key: 'category', facet: 'categories', label: 'Category', all: 'All Categories', cls: 'catalog-all-categories' },
  { key: 'genre', facet: 'genres', label: 'Genre', all: 'All Genres', cls: 'catalog-all-genres' },
  { key: 'language', facet: 'languages', label: 'Language', all: 'All Languages', cls: 'catalog-all-languages' },
];
// The design grid has three columns; these article classes place a card in column 1, 3 or 5.
const ARTICLE = ['catalog-article-book-1-the-river-path', 'catalog-article-book-2-quiet-hours', 'catalog-article-book-3-shadows-of-the-de'];
const norm = (v) => (v || '').toString().trim().toLowerCase();
const fmt = (n) => Number(n || 0).toLocaleString('en-US');

/**
 * Filter values in the URL may be loosely typed (the home page links `?genre=fiction`);
 * match them to a real facet value case-insensitively. "children" is a category here.
 */
function resolveFilters(params, facets) {
  const out = { category: '', genre: '', language: '' };
  for (const f of FILTERS) {
    const raw = params.get(f.key);
    if (!raw) continue;
    const hit = facets?.[f.facet]?.find((o) => norm(o) === norm(raw));
    out[f.key] = hit || raw;
  }
  if (facets && out.genre && !facets.genres.includes(out.genre) && !out.category) {
    const asCategory = facets.categories.find((o) => norm(o) === norm(out.genre));
    if (asCategory) { out.category = asCategory; out.genre = ''; }
  }
  return out;
}

function BookCardItem({ book, index }) {
  const path = bookPath(book);
  const title = book.title || book.title_bangla;
  const bn = book.title_bangla && book.title_bangla !== title ? book.title_bangla : '';
  const author = book.author || book.author_bangla;
  const av = availability(book);
  const badges = [['Category', book.category], ['Genre', book.genre], ['Language', book.language]].filter(([, v]) => v);
  return (
    <article className={ARTICLE[index % 3]}>
      <div className="catalog-article-book-1-the-river-path-box">
        <Link to={path} className="catalog-book-cover-placeholder catalog-cover-link" tabIndex={-1} aria-hidden="true">
          <BookCover book={book} className="catalog-cover" />
        </Link>
        <div className="catalog-metadata-title">
          <h2 className="catalog-heading-2 catalog-clamp"><Link to={path} className="catalog-title-link">{title}</Link></h2>
          {bn && (
            <div className="catalog-metadata-title-box">
              <span className="catalog-metadata-title-box-text catalog-clamp" lang="bn">{bn}</span>
            </div>
          )}
          {author && (
            <div className="catalog-metadata-title-box-2">
              <span className="catalog-by-a-r-chowdhury catalog-clamp">by {author}</span>
            </div>
          )}
        </div>
        <div className="catalog-separate-badges-category-genre-l">
          {badges.map(([k, v]) => (
            <div className="catalog-background-border-3" key={k} title={`${k}: ${v}`}>
              <span className="catalog-background-border-3-text">{k}: {v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="catalog-article-book-1-the-river-path-box-2">
        <div className="catalog-horizontalborder-3 catalog-card-foot">
          <span className={`catalog-availability is-${av.state}`}>{av.text}</span>
          <Link to={path} className="catalog-horizontalborder-3-box" aria-label={`View details: ${title}`}>
            <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
            <div className="catalog-horizontalborder-3-box-box">
              <span className="catalog-horizontalborder-3-box-box-text">→</span>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}

// Generated from Figma frame "Noholi Library — Browse the Catalog (Before Login)" (36:2470) by tools/gen.py, then hand-edited.
// Runs on the real catalogue: rpc('search_books') + rpc('catalog_facets'). State lives in the URL
// (?q=&page=&genre=&category=&language=) so back/forward, reloads and shared links all work.
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState(null);
  const [facetsFailed, setFacetsFailed] = useState(false);
  const [result, setResult] = useState({ rows: [], total: 0 });
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const reqId = useRef(0);
  const gridRef = useRef(null);

  const q = (params.get('q') || '').trim();
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const current = resolveFilters(params, facets);
  const hasFilterParam = FILTERS.some((f) => params.get(f.key));
  const [draft, setDraft] = useState(q);
  useEffect(() => { setDraft(q); }, [q]);

  useEffect(() => {
    let live = true;
    getCatalogFacets()
      .then((f) => { if (live) setFacets(f); })
      .catch(() => { if (live) setFacetsFailed(true); });
    return () => { live = false; };
  }, []);

  // Wait for the facets when the URL carries a filter, so `?genre=fiction` is matched first.
  const ready = !hasFilterParam || facets || facetsFailed;
  useEffect(() => {
    if (!ready) return;
    const id = ++reqId.current;
    setStatus('loading');
    searchBooks({
      q, page, pageSize: PAGE_SIZE,
      genre: current.genre || null, category: current.category || null, language: current.language || null,
    })
      .then((r) => { if (id === reqId.current) { setResult(r); setStatus('ready'); } })
      .catch((err) => { if (id === reqId.current) { setError(describeError(err)); setStatus('error'); } });
  }, [ready, q, page, current.genre, current.category, current.language, retry]);

  const update = (changes, { resetPage = true, push = false } = {}) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    if (resetPage) next.delete('page');
    setParams(next, { replace: !push });
  };
  const reset = () => { setDraft(''); setParams({}, { replace: true }); };
  const onSearch = (e) => {
    e.preventDefault();
    update({ q: draft.trim() }, { push: true });
  };
  const goPage = (n) => {
    update({ page: n > 1 ? String(n) : '' }, { resetPage: false, push: true });
    gridRef.current?.scrollIntoView({ block: 'start' });
  };

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const loading = status === 'loading';
  const rows = status === 'error' ? [] : result.rows;
  const select = (f, id) => {
    const options = facets?.[f.facet] || [];
    const value = current[f.key];
    return (
      <select id={id} className="catalog-native-select" value={value} disabled={!facets} onChange={(e) => update({ [f.key]: e.target.value })}>
        <option value="">{f.all}</option>
        {value && !options.includes(value) && <option value={value}>{value}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  };
  const describeScope = [q && `“${q}”`, current.category && `Category: ${current.category}`, current.genre && `Genre: ${current.genre}`, current.language && `Language: ${current.language}`].filter(Boolean).join(' · ');

  return (
    <div className="catalog">
      <section className="catalog-main-content-area">
        <div className="catalog-hero-title-section">
          <div className="catalog-hero-title-section-box">
            <div className="catalog-horizontalborder">
              <h1 className="catalog-heading-1">Browse the Catalog</h1>
              <div className="catalog-horizontalborder-box">
                <span className="catalog-horizontalborder-box-text">তালিকাভুক্ত গ্রন্থসমূহ ও সংগ্রহশালা</span>
              </div>
            </div>
            <div className="catalog-hero-title-section-box-box">
              <span className="catalog-hero-title-section-box-box-text">Explore books and publications available across our reading rooms and circulating collection.{' '}<br className="soft-br" />Members may borrow or reserve titles through the catalog.</span>
            </div>
          </div>
        </div>
        <div className="catalog-filters-section">
          <div className="catalog-background-border">
            <div className="catalog-horizontalborder-2">
              <div className="catalog-horizontalborder-2-box">
                <span className="catalog-horizontalborder-2-box-text">FILTER CATALOG</span>
              </div>
              <button type="button" className="catalog-horizontalborder-2-box-2" onClick={reset}>
                <img className="catalog-horizontalborder-2-box-2-box" src="/svg/container-13os96a.svg" alt="" width="10" height="10" />
                <span className="catalog-horizontalborder-2-box-2-text">RESET FILTERS</span>
              </button>
            </div>
            <form className="catalog-search" role="search" onSubmit={onSearch}>
              <label className="catalog-label" htmlFor="catalog-q">SEARCH</label>
              <div className="catalog-background-border-2 catalog-search-box">
                <input
                  id="catalog-q"
                  className="catalog-search-input"
                  type="search"
                  name="q"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Title or author, in English or বাংলা — or a book number (BK-0001)"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                <button type="submit" className="catalog-search-btn">SEARCH →</button>
              </div>
            </form>
            <div className="catalog-3-dropdowns">
              <div className="catalog-category">
                <label className="catalog-label" htmlFor="catalog-category">CATEGORY</label>
                <div className="catalog-background-border-2">
                  <div className="catalog-options">
                    <img className="catalog-image-clip" src="/svg/image-clip-thkavg.svg" alt="" width="363" height="36" />
                    <div className="catalog-options-box">
                      <span className="catalog-all-categories">{current.category || FILTERS[0].all}</span>
                    </div>
                  </div>
                  <img className="catalog-background-border-2-box" src="/svg/container-1eew7u3.svg" alt="" width="23" height="36" />
                  {select(FILTERS[0], 'catalog-category')}
                </div>
              </div>
              <div className="catalog-genre">
                <label className="catalog-label" htmlFor="catalog-genre">GENRE</label>
                <div className="catalog-background-border-2">
                  <div className="catalog-options">
                    <img className="catalog-image-clip-2" src="/svg/image-clip-10seje7.svg" alt="" width="363" height="36" />
                    <div className="catalog-options-box">
                      <span className="catalog-all-genres">{current.genre || FILTERS[1].all}</span>
                    </div>
                  </div>
                  <img className="catalog-background-border-2-box-2" src="/svg/container-1eew7u3.svg" alt="" width="23" height="36" />
                  {select(FILTERS[1], 'catalog-genre')}
                </div>
              </div>
              <div className="catalog-language">
                <label className="catalog-label" htmlFor="catalog-language">LANGUAGE</label>
                <div className="catalog-background-border-2">
                  <div className="catalog-options">
                    <img className="catalog-image-clip" src="/svg/image-clip-thkavg.svg" alt="" width="363" height="36" />
                    <div className="catalog-options-box">
                      <span className="catalog-all-languages">{current.language || FILTERS[2].all}</span>
                    </div>
                  </div>
                  <img className="catalog-background-border-2-box-3" src="/svg/container-1eew7u3.svg" alt="" width="23" height="36" />
                  {select(FILTERS[2], 'catalog-language')}
                </div>
              </div>
            </div>
            <div className="catalog-active-scope">
              <div className="catalog-active-scope-box">
                <span className="catalog-active-scope-box-text" aria-live="polite">{"Showing: "}{q && <>“{q}” · </>}<span className="catalog-span">Category: {current.category || 'All'}</span>{" · "}<span className="catalog-span">Genre: {current.genre || 'All'}</span>{" · "}<span className="catalog-span">Language: {current.language || 'All'}</span>{status === 'ready' && <>{" — "}<span className="catalog-span">{fmt(result.total)} {result.total === 1 ? 'book' : 'books'}</span></>}</span>
              </div>
            </div>
          </div>
        </div>
        <section className="catalog-books-grid" ref={gridRef}>
          <div className={`catalog-books-grid-box${loading && rows.length ? ' is-loading' : ''}`} aria-busy={loading}>
            {rows.map((b, i) => <BookCardItem key={b.id} book={b} index={i} />)}
            {loading && !rows.length && <p className="catalog-empty" role="status">Loading the catalogue…</p>}
            {status === 'error' && (
              <p className="catalog-empty" role="alert">The catalogue could not be loaded: {error} <button type="button" onClick={() => setRetry((n) => n + 1)}>Try again</button></p>
            )}
            {status === 'ready' && !rows.length && (
              result.total > 0 || page > 1
                ? <p className="catalog-empty">There are no books on page {page}. <button type="button" onClick={() => goPage(1)}>Go to page 1</button></p>
                : <p className="catalog-empty">No books match {describeScope || 'this search'}. <button type="button" onClick={reset}>Reset filters</button></p>
            )}
          </div>
        </section>
        <section className="catalog-pagination">
          <div className="catalog-pagination-box">
            <nav className="catalog-nav-catalog-pagination" aria-label="Catalogue pages">
              <button type="button" className="catalog-nav-catalog-pagination-box" disabled={page <= 1 || loading} onClick={() => goPage(page - 1)}>← PREVIOUS</button>
              <div className="catalog-background-border-5">
                <span className="catalog-background-border-5-text">Page {fmt(page)} of {fmt(totalPages)}</span>
              </div>
              <button type="button" className="catalog-nav-catalog-pagination-box-2" disabled={page >= totalPages || loading} onClick={() => goPage(page + 1)}>NEXT →</button>
            </nav>
          </div>
        </section>
      </section>
    </div>
  );
}
