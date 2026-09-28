import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Catalog.css';

// The nine sample titles drawn in the design (order = card order below).
const BOOKS = [
  { title: "The River Path", bn: "নদীর বাঁক", author: "A. R. Chowdhury", category: "Adults", genre: "Fiction", language: "English" },
  { title: "Quiet Hours", bn: "নিস্তব্ধ প্রহর", author: "Rashid Ahmed", category: "General", genre: "Academic", language: "Bangla" },
  { title: "Shadows of the Delta", bn: "বদ্বীপের ছায়া", author: "K. M. Sen", category: "Adults", genre: "History", language: "English" },
  { title: "Studies in Bengal Flora", bn: "বাংলার উদ্ভিদ সমীক্ষা", author: "Dr. T. H. Khan", category: "General", genre: "Science", language: "Bangla" },
  { title: "The Weaver’s Tale", bn: "তাঁতীর আখ্যান", author: "Nahid Parveen", category: "Children", genre: "Fiction", language: "Bangla" },
  { title: "Grammar of Old Texts", bn: "প্রাচীন লিপির ব্যাকরণ", author: "S. B. Majumdar", category: "Adults", genre: "Academic", language: "English" },
  { title: "Chronicles of the Meghna", bn: "মেঘনার ইতিবৃত্ত", author: "Rashid Ahmed", category: "General", genre: "Biography", language: "Bangla" },
  { title: "Night Whispers", bn: "রাত্রির গুঞ্জন", author: "A. R. Chowdhury", category: "Adults", genre: "Mystery", language: "English" },
  { title: "Echoes of the Monsoon", bn: "বর্ষার প্রতিধ্বনি", author: "Nahid Parveen", category: "Children", genre: "Fantasy", language: "Bangla" },
];
const uniq = (key) => [...new Set(BOOKS.map((b) => b[key]))].sort();
const FILTERS = [
  { key: 'category', label: 'Category', all: 'All Categories', options: uniq('category') },
  { key: 'genre', label: 'Genre', all: 'All Genres', options: uniq('genre') },
  { key: 'language', label: 'Language', all: 'All Languages', options: uniq('language') },
];
const norm = (v) => (v || '').toString().trim().toLowerCase();

// Generated from Figma frame "Noholi Library — Browse the Catalog (Before Login)" (36:2470) by tools/gen.py, then hand-edited.
export default function Catalog() {
  // Filters live in the URL (?category=&genre=&language=&q=) so the home search and genre links land filtered.
  const [params, setParams] = useSearchParams();
  const q = norm(params.get('q'));
  const pick = (key) => {
    const raw = norm(params.get(key));
    return FILTERS.find((f) => f.key === key).options.find((o) => norm(o) === raw) || '';
  };
  const current = { category: pick('category'), genre: pick('genre'), language: pick('language') };
  // the home page's genre shelf also links "Children", which is a category in this catalogue
  if (params.get('genre') && !current.genre && !current.category) {
    current.category = FILTERS[0].options.find((o) => norm(o) === norm(params.get('genre'))) || '';
  }
  const unmatched = ['category', 'genre', 'language'].some((k) => params.get(k) && !current[k]
    && !(k === 'genre' && current.category && norm(current.category) === norm(params.get('genre'))));
  const visible = useMemo(() => BOOKS.map((b) => !unmatched &&
    (!current.category || b.category === current.category) &&
    (!current.genre || b.genre === current.genre) &&
    (!current.language || b.language === current.language) &&
    (!q || [b.title, b.bn, b.author, b.genre].some((t) => norm(t).includes(q)))
  ), [unmatched, current.category, current.genre, current.language, q]);
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const reset = () => setParams({}, { replace: true });
  const select = (f, id) => (
    <select id={id} className="catalog-native-select" value={current[f.key]} onChange={(e) => setFilter(f.key, e.target.value)}>
      <option value="">{f.all}</option>
      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

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
                  {select(FILTERS[0], "catalog-category")}
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
                  {select(FILTERS[1], "catalog-genre")}
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
                  {select(FILTERS[2], "catalog-language")}
                </div>
              </div>
            </div>
            <div className="catalog-active-scope">
              <div className="catalog-active-scope-box">
                <span className="catalog-active-scope-box-text" aria-live="polite">{"Showing: "}{q && <>“{params.get('q')}” · </>}<span className="catalog-span">Category: {current.category || 'All'}</span>{" \u00b7 "}<span className="catalog-span">Genre: {current.genre || (unmatched && params.get('genre')) || 'All'}</span>{" \u00b7 "}<span className="catalog-span">Language: {current.language || 'All'}</span></span>
              </div>
            </div>
          </div>
        </div>
        <section className="catalog-books-grid">
          <div className="catalog-books-grid-box">
            <article hidden={!visible[0]} className="catalog-article-book-1-the-river-path">
              <div className="catalog-article-book-1-the-river-path-box">
                <div className="catalog-book-cover-placeholder">
                  <div className="catalog-border">
                    <h3 className="catalog-heading-3">The River Path</h3>
                    <div className="catalog-border-box">
                      <div className="catalog-border-box-box">
                        <span className="catalog-border-box-box-text">নদীর বাঁক</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-metadata-title">
                  <h2 className="catalog-heading-2">The River Path</h2>
                  <div className="catalog-metadata-title-box">
                    <span className="catalog-metadata-title-box-text">নদীর বাঁক</span>
                  </div>
                  <div className="catalog-metadata-title-box-2">
                    <span className="catalog-by-a-r-chowdhury">by A. R. Chowdhury</span>
                  </div>
                </div>
                <div className="catalog-separate-badges-category-genre-l">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: Adults</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Fiction</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: English</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-1-the-river-path-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/the-river-path" className="catalog-horizontalborder-3-box">
                    <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-box">
                      <span className="catalog-horizontalborder-3-box-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[1]} className="catalog-article-book-2-quiet-hours">
              <div className="catalog-article-book-2-quiet-hours-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border-2">
                    <h3 className="catalog-heading-3">Quiet Hours</h3>
                    <div className="catalog-border-2-box">
                      <div className="catalog-border-2-box-box">
                        <span className="catalog-border-2-box-box-text">নিস্তব্ধ প্রহর</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-2-quiet-hours-box-box">
                  <h2 className="catalog-heading-2">Quiet Hours</h2>
                  <div className="catalog-article-book-2-quiet-hours-box-box-box">
                    <span className="catalog-article-book-2-quiet-hours-box-box-box-text">নিস্তব্ধ প্রহর</span>
                  </div>
                  <div className="catalog-article-book-2-quiet-hours-box-box-box-2">
                    <span className="catalog-by-rashid-ahmed">by Rashid Ahmed</span>
                  </div>
                </div>
                <div className="catalog-article-book-2-quiet-hours-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: General</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Academic</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: Bangla</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-2-quiet-hours-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/quiet-hours" className="catalog-horizontalborder-3-box-2">
                    <span className="catalog-horizontalborder-3-box-2-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-2-box">
                      <span className="catalog-horizontalborder-3-box-2-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[2]} className="catalog-article-book-3-shadows-of-the-de">
              <div className="catalog-article-book-3-shadows-of-the-de-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border">
                    <h3 className="catalog-heading-3">Shadows of the Delta</h3>
                    <div className="catalog-border-box">
                      <div className="catalog-border-box-box">
                        <span className="catalog-border-box-box-text">বদ্বীপের ছায়া</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-3-shadows-of-the-de-box-box">
                  <h2 className="catalog-heading-2">Shadows of the Delta</h2>
                  <div className="catalog-article-book-3-shadows-of-the-de-box-box-box">
                    <span className="catalog-article-book-3-shadows-of-the-de-box-box-box-text">বদ্বীপের ছায়া</span>
                  </div>
                  <div className="catalog-article-book-3-shadows-of-the-de-box-box-box-2">
                    <span className="catalog-by-k-m-sen">by K. M. Sen</span>
                  </div>
                </div>
                <div className="catalog-article-book-3-shadows-of-the-de-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: Adults</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: History</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: English</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-3-shadows-of-the-de-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/shadows-of-the-delta" className="catalog-horizontalborder-3-box">
                    <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-box">
                      <span className="catalog-horizontalborder-3-box-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[3]} className="catalog-article-book-4-studies-in-bengal">
              <div className="catalog-article-book-4-studies-in-bengal-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border">
                    <h3 className="catalog-heading-3">Studies in Bengal Flora</h3>
                    <div className="catalog-border-box">
                      <div className="catalog-border-box-box">
                        <span className="catalog-border-box-box-text">বাংলার উদ্ভিদ সমীক্ষা</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-4-studies-in-bengal-box-box">
                  <h2 className="catalog-heading-2">Studies in Bengal Flora</h2>
                  <div className="catalog-article-book-4-studies-in-bengal-box-box-box">
                    <span className="catalog-article-book-4-studies-in-bengal-box-box-box-text">বাংলার উদ্ভিদ সমীক্ষা</span>
                  </div>
                  <div className="catalog-article-book-4-studies-in-bengal-box-box-box-2">
                    <span className="catalog-by-dr-t-h-khan">by Dr. T. H. Khan</span>
                  </div>
                </div>
                <div className="catalog-article-book-4-studies-in-bengal-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: General</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Science</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: Bangla</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-4-studies-in-bengal-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/studies-in-bengal-flora" className="catalog-horizontalborder-3-box">
                    <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-box">
                      <span className="catalog-horizontalborder-3-box-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[4]} className="catalog-article-book-5-the-weaver-s-tale">
              <div className="catalog-article-book-5-the-weaver-s-tale-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border-2">
                    <h3 className="catalog-heading-3">The Weaver’s Tale</h3>
                    <div className="catalog-border-2-box">
                      <div className="catalog-border-2-box-box">
                        <span className="catalog-border-2-box-box-text">তাঁতীর আখ্যান</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-5-the-weaver-s-tale-box-box">
                  <h2 className="catalog-heading-2">The Weaver’s Tale</h2>
                  <div className="catalog-article-book-5-the-weaver-s-tale-box-box-box">
                    <span className="catalog-article-book-5-the-weaver-s-tale-box-box-box-text">তাঁতীর আখ্যান</span>
                  </div>
                  <div className="catalog-article-book-5-the-weaver-s-tale-box-box-box-2">
                    <span className="catalog-by-nahid-parveen">by Nahid Parveen</span>
                  </div>
                </div>
                <div className="catalog-article-book-5-the-weaver-s-tale-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: Children</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Fiction</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: Bangla</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-5-the-weaver-s-tale-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/the-weavers-tale" className="catalog-horizontalborder-3-box-2">
                    <span className="catalog-horizontalborder-3-box-2-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-2-box">
                      <span className="catalog-horizontalborder-3-box-2-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[5]} className="catalog-article-book-6-grammar-of-old-te">
              <div className="catalog-article-book-6-grammar-of-old-te-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border">
                    <h3 className="catalog-heading-3">Grammar of Old Texts</h3>
                    <div className="catalog-border-box">
                      <div className="catalog-border-box-box">
                        <span className="catalog-border-box-box-text">প্রাচীন লিপির ব্যাকরণ</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-6-grammar-of-old-te-box-box">
                  <h2 className="catalog-heading-2">Grammar of Old Texts</h2>
                  <div className="catalog-article-book-6-grammar-of-old-te-box-box-box">
                    <span className="catalog-article-book-6-grammar-of-old-te-box-box-box-text">প্রাচীন লিপির ব্যাকরণ</span>
                  </div>
                  <div className="catalog-article-book-6-grammar-of-old-te-box-box-box-2">
                    <span className="catalog-by-s-b-majumdar">by S. B. Majumdar</span>
                  </div>
                </div>
                <div className="catalog-article-book-6-grammar-of-old-te-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: Adults</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Academic</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: English</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-6-grammar-of-old-te-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/grammar-of-old-texts" className="catalog-horizontalborder-3-box">
                    <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-box">
                      <span className="catalog-horizontalborder-3-box-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[6]} className="catalog-article-book-7-chronicles-of-the">
              <div className="catalog-article-book-7-chronicles-of-the-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border">
                    <h3 className="catalog-heading-3">Chronicles of the Meghna</h3>
                    <div className="catalog-border-box">
                      <div className="catalog-border-box-box">
                        <span className="catalog-border-box-box-text">মেঘনার ইতিবৃত্ত</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-7-chronicles-of-the-box-box">
                  <h2 className="catalog-heading-2">Chronicles of the Meghna</h2>
                  <div className="catalog-article-book-7-chronicles-of-the-box-box-box">
                    <span className="catalog-article-book-7-chronicles-of-the-box-box-box-text">মেঘনার ইতিবৃত্ত</span>
                  </div>
                  <div className="catalog-article-book-7-chronicles-of-the-box-box-box-2">
                    <span className="catalog-by-rashid-ahmed">by Rashid Ahmed</span>
                  </div>
                </div>
                <div className="catalog-article-book-7-chronicles-of-the-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: General</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Biography</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: Bangla</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-7-chronicles-of-the-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/chronicles-of-the-meghna" className="catalog-horizontalborder-3-box">
                    <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-box">
                      <span className="catalog-horizontalborder-3-box-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[7]} className="catalog-article-book-8-night-whispers">
              <div className="catalog-article-book-8-night-whispers-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border-2">
                    <h3 className="catalog-heading-3">Night Whispers</h3>
                    <div className="catalog-border-2-box">
                      <div className="catalog-border-2-box-box">
                        <span className="catalog-border-2-box-box-text">রাত্রির গুঞ্জন</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-8-night-whispers-box-box">
                  <h2 className="catalog-heading-2">Night Whispers</h2>
                  <div className="catalog-article-book-8-night-whispers-box-box-box">
                    <span className="catalog-article-book-8-night-whispers-box-box-box-text">রাত্রির গুঞ্জন</span>
                  </div>
                  <div className="catalog-article-book-8-night-whispers-box-box-box-2">
                    <span className="catalog-by-a-r-chowdhury">by A. R. Chowdhury</span>
                  </div>
                </div>
                <div className="catalog-article-book-8-night-whispers-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: Adults</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Mystery</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: English</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-8-night-whispers-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/night-whispers" className="catalog-horizontalborder-3-box-2">
                    <span className="catalog-horizontalborder-3-box-2-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-2-box">
                      <span className="catalog-horizontalborder-3-box-2-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
            <article hidden={!visible[8]} className="catalog-article-book-9-echoes-of-the-mon">
              <div className="catalog-article-book-9-echoes-of-the-mon-box">
                <div className="catalog-background-border-4">
                  <div className="catalog-border">
                    <h3 className="catalog-heading-3">Echoes of the Monsoon</h3>
                    <div className="catalog-border-box">
                      <div className="catalog-border-box-box">
                        <span className="catalog-border-box-box-text">বর্ষার প্রতিধ্বনি</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="catalog-article-book-9-echoes-of-the-mon-box-box">
                  <h2 className="catalog-heading-2">Echoes of the Monsoon</h2>
                  <div className="catalog-article-book-9-echoes-of-the-mon-box-box-box">
                    <span className="catalog-article-book-9-echoes-of-the-mon-box-box-box-text">বর্ষার প্রতিধ্বনি</span>
                  </div>
                  <div className="catalog-article-book-9-echoes-of-the-mon-box-box-box-2">
                    <span className="catalog-by-nahid-parveen">by Nahid Parveen</span>
                  </div>
                </div>
                <div className="catalog-article-book-9-echoes-of-the-mon-box-box-2">
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Category: Children</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Genre: Fantasy</span>
                  </div>
                  <div className="catalog-background-border-3">
                    <span className="catalog-background-border-3-text">Language: Bangla</span>
                  </div>
                </div>
              </div>
              <div className="catalog-article-book-9-echoes-of-the-mon-box-2">
                <div className="catalog-horizontalborder-3">
                  <Link to="/books/echoes-of-the-monsoon" className="catalog-horizontalborder-3-box">
                    <span className="catalog-horizontalborder-3-box-text">VIEW DETAILS</span>
                    <div className="catalog-horizontalborder-3-box-box">
                      <span className="catalog-horizontalborder-3-box-box-text">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
          {!visible.some(Boolean) && <p className="catalog-empty">No titles match these filters. <button type="button" onClick={reset}>Reset filters</button></p>}
          </div>
        </section>
        <section className="catalog-pagination">
          <div className="catalog-pagination-box">
            <nav className="catalog-nav-catalog-pagination">
              <button type="button" className="catalog-nav-catalog-pagination-box" disabled>← PREVIOUS</button>
              <div className="catalog-background-border-5">
                <span className="catalog-background-border-5-text">Page 1 of 3</span>
              </div>
              <button type="button" className="catalog-nav-catalog-pagination-box-2">NEXT →</button>
            </nav>
          </div>
        </section>
      </section>
    </div>
  );
}
