import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCover from '../components/BookCover.jsx';
import { BOOK_COLUMNS, bookPath, displayAuthor, displayTitle } from '../lib/books.js';
import { todayDhaka } from '../lib/dhakaDate.js';
import { supabase } from '../lib/supabase.js';
import { useLang } from '../i18n/LanguageContext.jsx';
import './Home.css';

const SHELF = 5;
const SLOTS = Array.from({ length: SHELF }, () => null);

/**
 * "Featured Books": five real books that have a cover — a different run of the shelves each
 * day, stable for the whole Dhaka day (reloads and shared screenshots agree).
 */
async function loadFeatured() {
  const withCover = (sel, opts) => supabase.from('books').select(sel, opts).not('thumbnail', 'is', null).is('archived_at', null);
  const { count, error: cErr } = await withCover('id', { count: 'exact', head: true });
  if (cErr) throw cErr;
  let h = 0;
  for (const ch of todayDhaka()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const offset = count > SHELF ? h % (count - SHELF) : 0;
  const { data, error } = await withCover(BOOK_COLUMNS).order('id', { ascending: false }).range(offset, offset + SHELF - 1);
  if (error) throw error;
  return data || [];
}

// Generated from Figma frame "Noholi Library — Home & Featured Books Band (Before Login)" (36:3245) by tools/gen.py, then hand-edited.
export default function Home() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [featured, setFeatured] = useState(null);
  useEffect(() => {
    let live = true;
    loadFeatured()
      .then((rows) => { if (live) setFeatured(rows); })
      .catch((err) => { console.error('Featured books could not be loaded:', err); if (live) setFeatured([]); });
    return () => { live = false; };
  }, []);
  const onSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
  };

  return (
    <div className="home">
      <section className="home-main-hero-section">
        <section className="home-section">
          <div className="home-section-box">
            <div className="home-left-column">
              <div className="home-eyebrow-label">
                <div className="home-eyebrow-label-2">
                  <div className="home-background-css-transform">
                    <div className="home-background-css-transform-box" />
                  </div>
                  <div className="home-eyebrow-label-2-box">
                    <span className="home-eyebrow-label-2-box-text">{t('home.eyebrow')}</span>
                  </div>
                </div>
              </div>
              <div className="home-headline-split-across-two-lines">
                <div className="home-headline-split-across-two-lines-2">
                  {lang === 'bn' ? (
                    <span
                      style={{
                        position: 'static',
                        display: 'block',
                        fontFamily: 'var(--font-bengali)',
                        fontSize: 'clamp(2.25rem, 10vw, 3.5rem)',
                        fontWeight: 800,
                        lineHeight: 1.15,
                        color: 'var(--ink)',
                        whiteSpace: 'normal',
                      }}
                    >
                      {t('home.headlineLine1')} {t('home.headlineLine2')}
                    </span>
                  ) : (
                    <>
                      <span className="home-headline-split-across-two-lines-2-text">ST</span>
                      <span className="home-headline-split-across-two-lines-2-text-2">RIES</span>
                      <span className="home-headline-split-across-two-lines-2-text-3">LIVE HERE</span>
                      <div className="home-headline-split-across-two-lines-2-box">
                        <span className="home-headline-split-across-two-lines-2-box-text">O</span>
                        <div className="home-headline-split-across-two-lines-2-box-box" />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="home-supporting-line-in-ink-wash-brow">
                <div className="home-supporting-line-in-ink-wash-brow-2">
                  <span className="home-a-community-reading-room-and-ind">{t('home.supportingLine')}</span>
                </div>
              </div>
              <div className="home-search-bar-with-arrow-button">
                <form className="home-form" role="search" onSubmit={onSearch}>
                  <img className="home-form-box" src="/svg/container-xljvoh.svg" alt="" width="33" height="61" />
                  <input className="home-input" type="search" name="q" aria-label={t('home.searchAria')} placeholder={t('home.searchPlaceholder')} />
                  <button type="submit" className="home-form-box-2">
                    <div className="home-form-box-2-box">
                      <span className="home-form-box-2-box-text">{t('home.searchButton')}</span>
                    </div>
                    <div className="home-form-box-2-box">
                      <span className="home-form-box-2-box-text-2">→</span>
                    </div>
                  </button>
                </form>
              </div>
            </div>
            <div className="home-right-column">
              <div className="home-right-column-box">
                <div className="home-4-leaning-books-graphic-cleanly">
                  <img className="home-4-leaning-books-graphic-cleanly-box" src="/svg/vector-18o4mbj.svg" alt="" width="407" height="3" />
                  <img className="home-4-leaning-books-graphic-cleanly-box-2" src="/svg/vector-1gqf222.svg" alt="" width="406" height="2" />
                  <img className="home-4-leaning-books-graphic-cleanly-box-3" src="/svg/vector-hgfyrf.svg" alt="" width="34" height="87" />
                  <div className="home-spine1">
                    <img className="home-spine1-box" src="/svg/vector-363va3.svg" alt="" width="53" height="247" />
                    <img className="home-spine1-box-2" src="/svg/vector-1lq016i.svg" alt="" width="51" height="3" />
                    <img className="home-spine1-box-3" src="/svg/vector-19dzl5w.svg" alt="" width="51" height="2" />
                    <img className="home-spine1-box-4" src="/svg/vector-19dzl5w.svg" alt="" width="51" height="2" />
                    <img className="home-spine1-box-5" src="/svg/vector-1lq016i.svg" alt="" width="51" height="3" />
                    <img className="home-spine1-box-6" src="/svg/vector-r4s8ss.svg" alt="" width="36" height="128" />
                    <div className="home-spine1-box-7">
                      <span className="home-spine1-box-7-text">গল্প</span>
                    </div>
                    <img className="home-spine1-box-8" src="/svg/vector-funymx.svg" alt="" width="24" height="2" />
                    <img className="home-spine1-box-9" src="/svg/vector-yql1of.svg" alt="" width="7" height="11" />
                    <img className="home-spine1-box-10" src="/svg/vector-1ear7uw.svg" alt="" width="7" height="11" />
                    <img className="home-spine1-box-11" src="/svg/vector-yql1of.svg" alt="" width="7" height="11" />
                    <img className="home-spine1-box-12" src="/svg/vector-1f4myvo.svg" alt="" width="19" height="19" />
                    <img className="home-spine1-box-13" src="/svg/vector-1iktt68.svg" alt="" width="7" height="7" />
                  </div>
                  <div className="home-spine2">
                    <img className="home-spine2-box" src="/svg/vector-9kachs.svg" alt="" width="67" height="221" />
                    <img className="home-spine2-box-2" src="/svg/vector-6hs57e.svg" alt="" width="53" height="193" />
                    <img className="home-spine2-box-3" src="/svg/vector-7cs2jf.svg" alt="" width="42" height="96" />
                    <div className="home-spine2-box-4">
                      <span className="home-spine2-box-4-text">কবিতা</span>
                    </div>
                    <img className="home-spine2-box-5" src="/svg/vector-1njbb3n.svg" alt="" width="19" height="4" />
                    <img className="home-spine2-box-6" src="/svg/vector-kiuadd.svg" alt="" width="6" height="6" />
                    <img className="home-spine2-box-7" src="/svg/vector-f2vf4z.svg" alt="" width="40" height="12" />
                  </div>
                  <div className="home-spine3">
                    <img className="home-spine3-box" src="/svg/vector-1c687kg.svg" alt="" width="106" height="264" />
                    <img className="home-spine3-box-2" src="/svg/vector-qs3834.svg" alt="" width="48" height="15" />
                    <img className="home-spine3-box-3" src="/svg/vector-qs3834.svg" alt="" width="48" height="15" />
                    <img className="home-spine3-box-4" src="/svg/vector-qs3834.svg" alt="" width="48" height="15" />
                    <img className="home-spine3-box-5" src="/svg/vector-qs3834.svg" alt="" width="48" height="15" />
                    <div className="home-spine3-box-6">
                      <span className="home-spine3-box-6-text">সাহিত্য</span>
                    </div>
                    <img className="home-spine3-box-7" src="/svg/vector-h33ueo.svg" alt="" width="9" height="12" />
                    <img className="home-spine3-box-8" src="/svg/vector-1ub4rir.svg" alt="" width="7" height="7" />
                  </div>
                  <div className="home-spine4">
                    <img className="home-spine4-box" src="/svg/vector-yszaz8.svg" alt="" width="128" height="229" />
                    <img className="home-spine4-box-2" src="/svg/vector-197fj62.svg" alt="" width="74" height="116" />
                    <div className="home-spine4-box-3">
                      <span className="home-spine4-box-3-text">প্রবন্ধ</span>
                    </div>
                    <img className="home-spine4-box-4" src="/svg/vector-mzrpur.svg" alt="" width="23" height="11" />
                    <img className="home-spine4-box-5" src="/svg/vector-17fhw8u.svg" alt="" width="38" height="35" />
                    <img className="home-spine4-box-6" src="/svg/vector-oa3ing.svg" alt="" width="7" height="7" />
                    <img className="home-spine4-box-7" src="/svg/vector-1lx6fiu.svg" alt="" width="42" height="19" />
                  </div>
                  <img className="home-4-leaning-books-graphic-cleanly-box-4" src="/svg/vector-6aa5pv.svg" alt="" width="68" height="60" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
      <section className="home-section-2">
        <div className="home-section-2-box">
          <div className="home-section-2-box-box">
            <div className="home-section-2-box-box-box" />
            <span className="home-section-2-box-box-text">FROM THE SHELVES</span>
          </div>
          <h2 className="home-heading-2">{t('home.featuredHeading')}</h2>
          <div className="home-section-2-box-box-2" aria-busy={!featured}>
            {(featured || SLOTS).map((book, i) => {
              const n = i + 1;
              const cover = (
                <div className={`home-background-border${n > 1 ? `-${n}` : ""} home-cover-slot`}>
                  {book && <BookCover book={book} className="home-cover" />}
                </div>
              );
              const title = book ? (lang === 'bn' ? displayTitle(book) : book.title || book.title_bangla) : "";
              const author = book ? (lang === 'bn' ? displayAuthor(book) : book.author || book.author_bangla) : "";
              const inner = (
                <>
                  <div className={`home-book-${n}-box`}>
                    <h3 className="home-heading-3 home-clamp-1" title={title}>{title || " "}</h3>
                  </div>
                  <div className={`home-book-${n}-box-2`}>
                    <div className={`home-book-${n}-box-2-box`}>
                      <span className="home-author-name home-clamp-1">{author || " "}</span>
                    </div>
                  </div>
                  {cover}
                </>
              );
              return book
                ? <Link key={book.id} to={bookPath(book)} className={`home-book-${n}`} aria-label={author ? t('home.bookByAuthor', { title, author }) : title}>{inner}</Link>
                : <div key={i} className={`home-book-${n} home-book-skeleton`} aria-hidden="true">{inner}</div>;
            })}
          </div>
          <div className="home-section-2-box-box-3">
            <Link to="/catalog" className="home-section-2-box-box-3-box">{t('home.viewFullCatalog')}</Link>
          </div>
        </div>
      </section>
      <section className="home-refined-footer">
        <div className="home-refined-footer-box">
          <h2 className="home-heading-2-2">{t('home.popularGenres')}</h2>
          <div className="home-refined-footer-box-box">
            <Link to="/catalog?genre=fiction" className="home-fiction">
              <div className="home-fiction-box">
                <div className="home-fiction-box-box">
                  <div className="home-fiction-box-box-box">
                    <div className="home-fiction-box-box-box-box" />
                  </div>
                </div>
              </div>
              <div className="home-fiction-box-2">
                <span className="home-fiction-box-2-text">{t('home.genreFiction')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=academic" className="home-academic">
              <div className="home-academic-box">
                <div className="home-academic-box-box">
                  <div className="home-academic-box-box-box">
                    <div className="home-horizontal-divider-2" />
                  </div>
                </div>
              </div>
              <div className="home-academic-box-2">
                <span className="home-academic-box-2-text">{t('home.genreAcademic')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=history" className="home-history">
              <img className="home-history-box" src="/svg/icon-1s0tsx7.svg" alt="" width="44" height="56" />
              <div className="home-history-box-2">
                <span className="home-history-box-2-text">{t('home.genreHistory')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=science" className="home-science">
              <div className="home-science-box">
                <div className="home-science-box-box">
                  <div className="home-science-box-box-box">
                    <div className="home-science-box-box-box-box" />
                    <div className="home-border-6" />
                  </div>
                </div>
              </div>
              <div className="home-science-box-2">
                <span className="home-science-box-2-text">{t('home.genreScience')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=children" className="home-children">
              <div className="home-children-box">
                <div className="home-children-box-box">
                  <div className="home-children-box-box-box">
                    <div className="home-children-box-box-box-box" />
                  </div>
                </div>
              </div>
              <div className="home-children-box-2">
                <span className="home-children-box-2-text">{t('home.genreChildren')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=biography" className="home-biography">
              <div className="home-biography-box">
                <div className="home-biography-box-box">
                  <div className="home-biography-box-box-box">
                    <div className="home-horizontal-divider-2" />
                  </div>
                </div>
              </div>
              <div className="home-biography-box-2">
                <span className="home-biography-box-2-text">{t('home.genreBiography')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=mystery" className="home-mystery">
              <img className="home-mystery-box" src="/svg/icon-fzwrxt.svg" alt="" width="44" height="56" />
              <div className="home-mystery-box-2">
                <span className="home-mystery-box-2-text">{t('home.genreMystery')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=romance" className="home-romance">
              <div className="home-romance-box">
                <div className="home-romance-box-box">
                  <div className="home-romance-box-box-box">
                    <div className="home-border-7">
                      <div className="home-border-7-box" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-romance-box-2">
                <span className="home-romance-box-2-text">{t('home.genreRomance')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=fantasy" className="home-fantasy">
              <div className="home-fantasy-box">
                <div className="home-fantasy-box-box">
                  <div className="home-fantasy-box-box-box">
                    <div className="home-border-8">
                      <div className="home-border-8-box" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-fantasy-box-2">
                <span className="home-fantasy-box-2-text">{t('home.genreFantasy')}</span>
              </div>
            </Link>
            <Link to="/catalog?genre=self-help" className="home-self-help">
              <img className="home-self-help-box" src="/svg/icon-kjr41q.svg" alt="" width="44" height="56" />
              <div className="home-self-help-box-2">
                <span className="home-self-help-box-2-text">{t('home.genreSelfHelp')}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <section className="home-join-cta-section">
        <div className="home-join-cta-section-box">
          <img className="home-community-two-people-icon-in-ink" src="/svg/community-two-people-icon-in-ink-fkqycw.svg" alt="" width="40" height="56" />
          <div className="home-join-cta-section-box-box">
            <h2 className="home-heading-2-3">{t('home.joinHeading')}</h2>
          </div>
          <div className="home-join-cta-section-box-box-2">
            <div className="home-join-cta-section-box-box-2-box">
              <span className="home-join-cta-section-box-box-2-box-text">{t('home.joinText')}</span>
            </div>
          </div>
          <div className="home-join-cta-section-box-box-3">
            <Link to="/become-a-member" className="home-join-cta-section-box-box-3-box">{t('home.becomeMember')}</Link>
            <Link to="/login" className="home-join-cta-section-box-box-3-box-2">{t('home.logIn')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
