import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CreativeWritings.css';

// Generated from Figma frame "Noholi Library — Creative Writings: Poetry, Short Stories & Excerpts (Before login)" (158:830) by tools/gen.py, then hand-edited.
// The six compositions drawn in the design, in card order ("recent" = the design's gazetted order).
const WORKS = ['poetry', 'stories', 'excerpts', 'poetry', 'stories', 'translations'];
const TABS = [
  { id: 'all', label: 'ALL WORKS', cls: 'writings-tab', text: 'writings-tab-text' },
  { id: 'poetry', label: 'POETRY (কবিতা)', cls: 'writings-tab-2', text: 'writings-poetry' },
  { id: 'stories', label: 'SHORT STORIES (ছোটগল্প)', cls: 'writings-tab-3', text: 'writings-short-stories' },
  { id: 'excerpts', label: 'LITERARY EXCERPTS (উদ্ধৃতাংশ)', cls: 'writings-tab-4', text: 'writings-literary-excerpts' },
  { id: 'translations', label: 'TRANSLATIONS (অনুবাদ)', cls: 'writings-tab-5', text: 'writings-translations' },
];
const ORDERS = { recent: 'RECENTLY GAZETTED', earliest: 'EARLIEST GAZETTED' };
const PER_PAGE = 6;

export default function CreativeWritings() {
  const [tab, setTab] = useState('all');
  const [order, setOrder] = useState('recent');
  const [page, setPage] = useState(1);
  const [compact, setCompact] = useState(false);
  const countOf = (id) => WORKS.filter((w) => id === 'all' || w === id).length;
  const list = WORKS.map((kind, i) => ({ kind, i })).filter((w) => tab === 'all' || w.kind === tab);
  if (order === 'earliest') list.reverse();
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const slot = (i) => shown.findIndex((w) => w.i === i);
  const card = (i) => ({ hidden: slot(i) < 0, style: { order: slot(i) } });
  const first = shown.length ? (page - 1) * PER_PAGE + 1 : 0;
  const last = (page - 1) * PER_PAGE + shown.length;

  return (
    <div className="writings">
      <section className="writings-main">
        <div className="writings-archival-broadside-shell-contain">
          <section className="writings-breadcrumbs-folio-ledger-ribbon">
            <nav className="writings-nav-folio-breadcrumbs">
              <Link to="/" className="writings-nav-folio-breadcrumbs-box">HOME</Link>
              <div className="writings-nav-folio-breadcrumbs-box-2">
                <span className="writings-nav-folio-breadcrumbs-box-2-text">/</span>
              </div>
              <Link to="/blogs" className="writings-nav-folio-breadcrumbs-box">WRITE UPS</Link>
              <div className="writings-nav-folio-breadcrumbs-box-2">
                <span className="writings-nav-folio-breadcrumbs-box-2-text">/</span>
              </div>
              <div className="writings-nav-folio-breadcrumbs-box-2">
                <span className="writings-nav-folio-breadcrumbs-box-2-text-2">CREATIVE WRITING</span>
              </div>
            </nav>
            <div className="writings-breadcrumbs-folio-ledger-ribbon-box">
              <div className="writings-breadcrumbs-folio-ledger-ribbon-box-box" />
              <div className="writings-breadcrumbs-folio-ledger-ribbon-box-box-2">
                <span className="writings-breadcrumbs-folio-ledger-ribbon-box-box-2-text">SERIES: NL-LIT-2026 • FOLIO EDITION IV</span>
              </div>
            </div>
          </section>
          <section className="writings-header-title-editorial-prolegome">
            <div className="writings-header-title-editorial-prolegome-box">
              <div className="writings-header-title-editorial-prolegome-box-box">
                <img className="writings-header-title-editorial-prolegome-box-box-box" src="/svg/container-1w8yiln.svg" alt="" width="12" height="15" />
                <div className="writings-header-title-editorial-prolegome-box-box-box-2">
                  <span className="writings-poetry-short-stories-literary-ex">POETRY, SHORT STORIES & LITERARY EXCERPTS (কবিতা, ছোটগল্প ও সাহিত্য সংকলন)</span>
                </div>
              </div>
              <h1 className="writings-header-title-editorial-prolegome-box-box-2">Creative Writings & Folios</h1>
              <div className="writings-header-title-editorial-prolegome-box-box-3">
                <span className="writings-header-title-editorial-prolegome-box-box-3-text">A quiet sanctuary for original prose, evocative verse, and intimate Bengali literary pieces<br />composed by patrons, resident poets, and regional storytellers of Noholi Library.</span>
              </div>
            </div>
            <div className="writings-marginalia-stamped-ledger-summar">
              <div className="writings-background-border">
                <div className="writings-paragraph-horizontalborder">
                  <span className="writings-paragraph-horizontalborder-text">ARCHIVAL REGISTRY</span>
                  <span className="writings-paragraph-horizontalborder-text-2">FOLIO-LIB-77</span>
                </div>
                <div className="writings-horizontalborder">
                  <div className="writings-horizontalborder-box">
                    <span className="writings-horizontalborder-box-text">TOTAL WORKS<br />GAZETTED</span>
                  </div>
                  <div className="writings-horizontalborder-box-2">
                    <span className="writings-horizontalborder-box-2-text">34<br />COMPOSITIONS</span>
                  </div>
                </div>
                <p className="writings-paragraph">
                  <span className="writings-paragraph-text">CURATORIAL TERM</span>
                  <span className="writings-paragraph-text-2">SPRING EQUINOX 2026</span>
                </p>
                <div className="writings-background-border-box">
                  <span className="writings-background-border-box-text">DEPOSITORY GAZETTE</span>
                </div>
              </div>
            </div>
          </section>
          <section className="writings-prominent-member-cta-card">
            <div className="writings-inset-decorative-hairline-frame" />
            <div className="writings-prominent-member-cta-card-box">
              <div className="writings-prominent-member-cta-card-box-box">
                <div className="writings-prominent-member-cta-card-box-box-box">
                  <img className="writings-prominent-member-cta-card-box-box-box-box" src="/svg/container-1koxtt9.svg" alt="" width="12" height="11" />
                  <div className="writings-prominent-member-cta-card-box-box-box-box-2">
                    <span className="writings-prominent-member-cta-card-box-box-box-box-2-text">POETRY & FICTION GUILD • OPEN FOR SUBMISSIONS</span>
                  </div>
                </div>
                <h2 className="writings-heading-2"><span>{"Contribute Your Creative Writing "}<span className="writings-span">/</span>{" "}<span className="writings-span-2">সাহিত্য রচনা ও কবিতা<br />জমা দিন</span></span></h2>
                <div className="writings-prominent-member-cta-card-box-box-box-2">
                  <span className="writings-patrons-resident-writers-and-poe">Patrons, resident writers, and poets are invited to submit original verses, flash fiction,<br />serialized short stories, and translated passages for publication in the upcoming<br />quarterly printing of the Noholi Literary Folio.</span>
                </div>
                <div className="writings-prominent-member-cta-card-box-box-box-3">
                  <div className="writings-prominent-member-cta-card-box-box-box-3-box">
                    <img className="writings-prominent-member-cta-card-box-box-box-3-box-box" src="/svg/container-1why4z6.svg" alt="" width="11" height="14" />
                    <div className="writings-prominent-member-cta-card-box-box-box-3-box-box-2">
                      <span className="writings-prominent-member-cta-card-box-box-box-3-box-box-2-text">Curatorial Review & Patron Attribution Standards §</span>
                    </div>
                  </div>
                  <div className="writings-prominent-member-cta-card-box-box-box-3-box-2">
                    <span className="writings-prominent-member-cta-card-box-box-box-3-box-2-text">•</span>
                  </div>
                  <div className="writings-prominent-member-cta-card-box-box-box-3-box-2">
                    <span className="writings-prominent-member-cta-card-box-box-box-3-box-2-text-2">Peer adjudicated within 14 solar days</span>
                  </div>
                </div>
              </div>
              <div className="writings-prominent-member-cta-card-box-box-2">
                <Link to="/studio/creative-writing" className="writings-prominent-member-cta-card-box-box-2-box">
                  <div className="writings-prominent-member-cta-card-box-box-2-box-box">
                    <span className="writings-submit-creative-writing">SUBMIT CREATIVE WRITING / নতুন সাহিত্য রচনা জমা দিন</span>
                  </div>
                  <img className="writings-prominent-member-cta-card-box-box-2-box-box-2" src="/svg/container-kmijix.svg" alt="" width="12" height="12" />
                </Link>
                <a aria-disabled="true" title="Available soon" className="writings-prominent-member-cta-card-box-box-2-box-2">DOWNLOAD FOLIO STYLE SHEET (PDF)</a>
              </div>
            </div>
          </section>
          <section className="writings-literary-genre-filters-tabs-sort">
            <div className="writings-tablist-genre-filters" role="group" aria-label="Filter by form">
              {TABS.map((t) => (
                <button key={t.id} type="button" aria-pressed={tab === t.id} className={`${t.cls}${tab === t.id ? ' is-active' : ''}`} onClick={() => { setTab(t.id); setPage(1); }}>
                  <span className={t.text}>{t.label} ({countOf(t.id)})</span>
                </button>
              ))}
            </div>
            <div className="writings-secondary-search-sort-controls">
              <div className="writings-secondary-search-sort-controls-box">
                <div className="writings-label">
                  <span className="writings-label-2">ORDER:</span>
                </div>
                <div className="writings-secondary-search-sort-controls-box-box">
                  <div className="writings-options">
                    <div className="writings-options-box">
                      <span className="writings-options-box-text">{ORDERS[order]}</span>
                    </div>
                    <select className="writings-order-select" aria-label="Order compositions" value={order} onChange={(e) => { setOrder(e.target.value); setPage(1); }}>
                      {Object.entries(ORDERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <img className="writings-secondary-search-sort-controls-box-box-box" src="/svg/container-5anvoh.svg" alt="" width="7" height="16" />
                </div>
              </div>
              <button type="button" className="writings-density-toggle" aria-pressed={compact} aria-label={compact ? 'Show three columns' : 'Show two columns'} title={compact ? 'Three columns' : 'Two columns'} onClick={() => setCompact((c) => !c)}><img className="writings-toggle-catalog-grid-density" src="/svg/button-toggle-catalog-grid-density-zbv7uh.svg" alt="" width="24" height="24" /></button>
            </div>
          </section>
          <section className={`writings-curated-creative-writings-grid${compact ? ' is-compact' : ''}`}>
            <article className="writings-article-card-1-poetry" {...card(0)}>
              <div className="writings-article-card-1-poetry-box">
                <div className="writings-classification-ribbon">
                  <div className="writings-classification-ribbon-2">
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-poetry-2">POETRY / বর্ষার কবিতা</span>
                    </div>
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-classification-ribbon-2-box-text">MS-POET-091</span>
                    </div>
                  </div>
                </div>
                <div className="writings-header-byline">
                  <h3 className="writings-header-byline-2"><span>The Scent of Wet Clay at<br />Buriganga</span></h3>
                </div>
                <div className="writings-article-card-1-poetry-box-box">
                  <div className="writings-article-card-1-poetry-box-box-box">
                    <span className="writings-article-card-1-poetry-box-box-box-text">বুড়িগঙ্গার ভিজে মাটির ঘ্রাণ</span>
                  </div>
                </div>
                <div className="writings-article-card-1-poetry-box-box-2">
                  <div className="writings-verticalborder">
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text">Anwara Begum</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-2">•</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-3">Patron Fellow</span>
                    </div>
                  </div>
                </div>
                <div className="writings-blockquote-verse-stanza-excerpt">
                  <div className="writings-blockquote-verse-stanza-excerpt-2">
                    <div className="writings-blockquote-verse-stanza-excerpt-2-box">
                      <span className="writings-where-the-timber-barges-slumber">“Where the timber barges slumber by the<br />ghat,<br />a sudden squall dissolves the charcoal<br />evening.<br />The river remembers what Dhaka forgot —<br />the earthen tongue of clay and tidal<br />breathing.”</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="writings-card-footer-ledger">
                <div className="writings-card-footer-ledger-2">
                  <div className="writings-card-footer-ledger-2-box">
                    <img className="writings-card-footer-ledger-2-box-box" src="/svg/container-1u6avhi.svg" alt="" width="12" height="12" />
                    <div className="writings-card-footer-ledger-2-box-box-2">
                      <span className="writings-card-footer-ledger-2-box-box-2-text">3 min read • 14 Feb 2026</span>
                    </div>
                  </div>
                  <Link to="/creative-writings/the-scent-of-wet-clay" className="writings-card-footer-ledger-2-box-2">
                    <div className="writings-card-footer-ledger-2-box-2-box">
                      <span className="writings-card-footer-ledger-2-box-2-box-text">READ FULL POEM</span>
                    </div>
                    <img className="writings-card-footer-ledger-2-box-2-box-2" src="/svg/container-96leqh.svg" alt="" width="10" height="7" />
                  </Link>
                </div>
              </div>
            </article>
            <article className="writings-article-card-2-short-story" {...card(1)}>
              <div className="writings-article-card-2-short-story-box">
                <div className="writings-classification-ribbon">
                  <div className="writings-classification-ribbon-2">
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-short-story">SHORT STORY / ছোটগল্প</span>
                    </div>
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-classification-ribbon-2-box-text">MS-STR-044</span>
                    </div>
                  </div>
                </div>
                <div className="writings-header-byline">
                  <h3 className="writings-header-byline-3">The Bookseller of Tanti Bazar</h3>
                </div>
                <div className="writings-article-card-2-short-story-box-box">
                  <div className="writings-article-card-2-short-story-box-box-box">
                    <span className="writings-article-card-2-short-story-box-box-box-text">তাঁতীবাজারের পুরানো বইওয়ালা</span>
                  </div>
                </div>
                <div className="writings-article-card-2-short-story-box-box-2">
                  <div className="writings-verticalborder">
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text">Kazi Farhan</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-2">•</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-3">Resident Writer</span>
                    </div>
                  </div>
                </div>
                <div className="writings-prose-excerpt">
                  <span className="writings-behind-a-shutter-painted-the-dul">Behind a shutter painted the dull jade of<br />oxidized copper sat Afzal Chacha. His fingers<br />smelled permanently of gum arabic and iron gall<br />ink. In 1964, a student had pledged a leather<br />folio of Michael Madhusudan Dutt for three<br />rupees; seventy years later, Afzal still kept the<br />third shelf dustless, waiting for someone with<br />identical dark eyes to reclaim the verse.</span>
                </div>
              </div>
              <div className="writings-card-footer-ledger">
                <div className="writings-card-footer-ledger-2">
                  <div className="writings-card-footer-ledger-2-box">
                    <img className="writings-card-footer-ledger-2-box-box" src="/svg/container-1u6avhi.svg" alt="" width="12" height="12" />
                    <div className="writings-card-footer-ledger-2-box-box-2">
                      <span className="writings-card-footer-ledger-2-box-box-2-text">8 min read • 02 Feb 2026</span>
                    </div>
                  </div>
                  <Link to="/creative-writings/the-bookseller-of-tanti-bazar" className="writings-card-footer-ledger-2-box-2">
                    <div className="writings-card-footer-ledger-2-box-2-box">
                      <span className="writings-card-footer-ledger-2-box-2-box-text">READ FULL STORY</span>
                    </div>
                    <img className="writings-card-footer-ledger-2-box-2-box-2" src="/svg/container-96leqh.svg" alt="" width="10" height="7" />
                  </Link>
                </div>
              </div>
            </article>
            <article className="writings-article-card-3-literary-excerpt" {...card(2)}>
              <div className="writings-article-card-3-literary-excerpt-box">
                <div className="writings-classification-ribbon-3">
                  <div className="writings-classification-ribbon-2">
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-excerpt">EXCERPT / স্মৃতিচারণ</span>
                    </div>
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-classification-ribbon-2-box-text">MS-MEM-108</span>
                    </div>
                  </div>
                </div>
                <div className="writings-header-byline-4">
                  <h3 className="writings-header-byline-2"><span>Echoes in the Reading Room:<br />Notes from a Diarist</span></h3>
                </div>
                <div className="writings-article-card-3-literary-excerpt-box-box">
                  <div className="writings-article-card-3-literary-excerpt-box-box-box">
                    <span className="writings-article-card-3-literary-excerpt-box-box-box-text">পাঠকক্ষের ধ্বনিপ্রতিধ্বনি</span>
                  </div>
                </div>
                <div className="writings-article-card-3-literary-excerpt-box-box-2">
                  <div className="writings-verticalborder">
                    <div className="writings-verticalborder-box-2">
                      <span className="writings-verticalborder-box-2-text">Dr. Mohammad Rafiqul<br />Islam</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-2">•</span>
                    </div>
                    <div className="writings-verticalborder-box-3">
                      <span className="writings-verticalborder-box-3-text">Archival<br />Scholar</span>
                    </div>
                  </div>
                </div>
                <div className="writings-excerpt-2">
                  <span className="writings-excerpt-2-text">“Silence in a historic library is never empty; it is<br />dense with the friction of turning pulp, the dry<br />rasp of linen bookcloth, and the collective<br />respiration of fifty minds traveling<br />simultaneously across three centuries of regional<br />thought...”</span>
                </div>
              </div>
              <div className="writings-card-footer-ledger">
                <div className="writings-card-footer-ledger-2">
                  <div className="writings-card-footer-ledger-2-box">
                    <img className="writings-card-footer-ledger-2-box-box" src="/svg/container-1u6avhi.svg" alt="" width="12" height="12" />
                    <div className="writings-card-footer-ledger-2-box-box-3">
                      <span className="writings-card-footer-ledger-2-box-box-3-text">5 min read • 28 Jan<br />2026</span>
                    </div>
                  </div>
                  <Link to="/creative-writings/echoes-in-the-reading-room" className="writings-card-footer-ledger-2-box-2">
                    <div className="writings-card-footer-ledger-2-box-2-box-3">
                      <span className="writings-card-footer-ledger-2-box-2-box-3-text">READ FULL<br />EXCERPT</span>
                    </div>
                    <img className="writings-card-footer-ledger-2-box-2-box-2" src="/svg/container-96leqh.svg" alt="" width="10" height="7" />
                  </Link>
                </div>
              </div>
            </article>
            <article className="writings-article-card-4-poetry" {...card(3)}>
              <div className="writings-article-card-4-poetry-box">
                <div className="writings-classification-ribbon">
                  <div className="writings-classification-ribbon-2">
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-verse">VERSE / আধুনিক কবিতা</span>
                    </div>
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-classification-ribbon-2-box-text">MS-POET-099</span>
                    </div>
                  </div>
                </div>
                <div className="writings-header-byline">
                  <h3 className="writings-header-byline-2"><span>Night Lanterns Along the<br />Sitalakhya</span></h3>
                </div>
                <div className="writings-article-card-4-poetry-box-box">
                  <div className="writings-article-card-4-poetry-box-box-box">
                    <span className="writings-article-card-4-poetry-box-box-box-text">শীতলক্ষ্যার নিশানা</span>
                  </div>
                </div>
                <div className="writings-article-card-4-poetry-box-box-2">
                  <div className="writings-verticalborder">
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text">Farhana Zaman</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-2">•</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-3">Member Submission</span>
                    </div>
                  </div>
                </div>
                <div className="writings-blockquote-verse-excerpt">
                  <div className="writings-blockquote-verse-excerpt-2">
                    <div className="writings-blockquote-verse-excerpt-2-box">
                      <span className="writings-kerosene-fumes-blend-with-jute-w">“Kerosene fumes blend with jute weave in<br />the fog.<br />A mast-head lamp trembles once, twice,<br />pinning the cold river to the sleep of small<br />towns.<br />What remains unsaid drifts south toward<br />the bay.”</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="writings-card-footer-ledger">
                <div className="writings-card-footer-ledger-2">
                  <div className="writings-card-footer-ledger-2-box">
                    <img className="writings-card-footer-ledger-2-box-box" src="/svg/container-1u6avhi.svg" alt="" width="12" height="12" />
                    <div className="writings-card-footer-ledger-2-box-box-2">
                      <span className="writings-card-footer-ledger-2-box-box-2-text">4 min read • 19 Jan 2026</span>
                    </div>
                  </div>
                  <Link to="/creative-writings/night-lanterns-along-the-sitalakhya" className="writings-card-footer-ledger-2-box-2">
                    <div className="writings-card-footer-ledger-2-box-2-box">
                      <span className="writings-card-footer-ledger-2-box-2-box-text">READ FULL POEM</span>
                    </div>
                    <img className="writings-card-footer-ledger-2-box-2-box-2" src="/svg/container-96leqh.svg" alt="" width="10" height="7" />
                  </Link>
                </div>
              </div>
            </article>
            <article className="writings-article-card-5-historical-fictio" {...card(4)}>
              <div className="writings-article-card-5-historical-fictio-box">
                <div className="writings-classification-ribbon">
                  <div className="writings-classification-ribbon-2">
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-historical-fiction">HISTORICAL FICTION / কথাশিল্প</span>
                    </div>
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-classification-ribbon-2-box-text">MS-FIC-019</span>
                    </div>
                  </div>
                </div>
                <div className="writings-header-byline">
                  <h3 className="writings-header-byline-3">The Last Calligrapher's Inkstone</h3>
                </div>
                <div className="writings-article-card-5-historical-fictio-box-box">
                  <div className="writings-article-card-5-historical-fictio-box-box-box">
                    <span className="writings-article-card-5-historical-fictio-box-box-box-text">শেষ লিপিকারের দোয়াত</span>
                  </div>
                </div>
                <div className="writings-article-card-5-historical-fictio-box-box-2">
                  <div className="writings-verticalborder">
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text">Tanvir Hossain</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-2">•</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-3">Noholi Press Series</span>
                    </div>
                  </div>
                </div>
                <div className="writings-excerpt-3">
                  <span className="writings-the-slate-inkstone-had-traveled">The slate inkstone had traveled from<br />Murshidabad in a cedar chest filled with raw<br />turmeric. Master Jalal refused the new German<br />aniline crystals; he ground lampblack collected<br />from brass lamps burning pure mustard seed oil.<br />“Letters copied with petroleum lack breath,” he<br />told his nephew, watching the ink settle like<br />black glass.</span>
                </div>
              </div>
              <div className="writings-card-footer-ledger">
                <div className="writings-card-footer-ledger-2">
                  <div className="writings-card-footer-ledger-2-box">
                    <img className="writings-card-footer-ledger-2-box-box" src="/svg/container-1u6avhi.svg" alt="" width="12" height="12" />
                    <div className="writings-card-footer-ledger-2-box-box-2">
                      <span className="writings-card-footer-ledger-2-box-box-2-text">12 min read • 11 Jan 2026</span>
                    </div>
                  </div>
                  <Link to="/creative-writings/the-last-calligraphers-inkstone" className="writings-card-footer-ledger-2-box-2">
                    <div className="writings-card-footer-ledger-2-box-2-box">
                      <span className="writings-card-footer-ledger-2-box-2-box-text">READ FULL STORY</span>
                    </div>
                    <img className="writings-card-footer-ledger-2-box-2-box-2" src="/svg/container-96leqh.svg" alt="" width="10" height="7" />
                  </Link>
                </div>
              </div>
            </article>
            <article className="writings-article-card-6-translation" {...card(5)}>
              <div className="writings-article-card-6-translation-box">
                <div className="writings-classification-ribbon">
                  <div className="writings-classification-ribbon-2">
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-translation">TRANSLATION / অনুবাদ</span>
                    </div>
                    <div className="writings-classification-ribbon-2-box">
                      <span className="writings-classification-ribbon-2-box-text">MS-TRN-007</span>
                    </div>
                  </div>
                </div>
                <div className="writings-header-byline">
                  <h3 className="writings-header-byline-2"><span>Fragments of Jibanananda:<br />Autumn Translations</span></h3>
                </div>
                <div className="writings-article-card-6-translation-box-box">
                  <div className="writings-article-card-6-translation-box-box-box">
                    <span className="writings-article-card-6-translation-box-box-box-text">জীবনানন্দের শরৎ-ভাষান্তর</span>
                  </div>
                </div>
                <div className="writings-article-card-6-translation-box-box-2">
                  <div className="writings-verticalborder">
                    <div className="writings-verticalborder-box-4">
                      <span className="writings-verticalborder-box-4-text">Translated by S.<br />Rahman</span>
                    </div>
                    <div className="writings-verticalborder-box">
                      <span className="writings-verticalborder-box-text-2">•</span>
                    </div>
                    <div className="writings-verticalborder-box-5">
                      <span className="writings-verticalborder-box-5-text">Comparative<br />Literature</span>
                    </div>
                  </div>
                </div>
                <div className="writings-blockquote-verse-excerpt">
                  <div className="writings-blockquote-verse-excerpt-3">
                    <div className="writings-blockquote-verse-excerpt-3-box">
                      <span className="writings-all-birds-come-home-all-the-rive">“All birds come home — all the rivers — all<br />life's ledger shuts.<br />Only dark remains, and sitting face-to-face<br />with Banalata Sen...<br />Rendered with contextual marginalia on<br />Bengal's autumn dusk.”</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="writings-card-footer-ledger">
                <div className="writings-card-footer-ledger-2">
                  <div className="writings-card-footer-ledger-2-box">
                    <img className="writings-card-footer-ledger-2-box-box" src="/svg/container-1u6avhi.svg" alt="" width="12" height="12" />
                    <div className="writings-card-footer-ledger-2-box-box-4">
                      <span className="writings-card-footer-ledger-2-box-box-4-text">6 min read • 05 Jan<br />2026</span>
                    </div>
                  </div>
                  <Link to="/creative-writings/fragments-of-jibanananda" className="writings-card-footer-ledger-2-box-2">
                    <div className="writings-card-footer-ledger-2-box-2-box-4">
                      <span className="writings-card-footer-ledger-2-box-2-box-4-text">READ FULL<br />TRANSLATION</span>
                    </div>
                    <img className="writings-card-footer-ledger-2-box-2-box-2" src="/svg/container-96leqh.svg" alt="" width="10" height="7" />
                  </Link>
                </div>
              </div>
            </article>
          </section>
          <section className="writings-archival-pagination-editorial-co">
            <div className="writings-pagination-controls">
              <div className="writings-pagination-controls-box">
                <span className="writings-pagination-controls-box-text">{"SHOWING "}<span className="writings-span-3">{first}–{last}</span>{" OF "}<span className="writings-span-3">{list.length}</span>{list.length === 1 ? ' LITERARY COMPOSITION' : ' LITERARY COMPOSITIONS'}</span>
              </div>
              <div className="writings-folio-pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" className={n === page ? 'writings-folio-pagination-box' : 'writings-folio-pagination-box-2'} aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button type="button" className="writings-folio-pagination-box-3" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  <div className="writings-folio-pagination-box-3-box">
                    <span className="writings-folio-pagination-box-3-box-text">NEXT</span>
                  </div>
                  <img className="writings-folio-pagination-box-3-box-2" src="/svg/container-tgdzkd.svg" alt="" width="10" height="10" />
                </button>
              </div>
            </div>
            <div className="writings-double-hairline-archival-colopho">
              <div className="writings-border">
                <div className="writings-border-box">
                  <img className="writings-border-box-box" src="/svg/icon-lv3i84.svg" alt="" width="20" height="18" />
                  <div className="writings-border-box-box-2">
                    <div className="writings-border-box-box-2-box">
                      <span className="writings-border-box-box-2-box-text">LITERARY COPYRIGHT & REPOSITORIUM BYLAWS</span>
                    </div>
                    <div className="writings-border-box-box-2-box">
                      <span className="writings-border-box-box-2-box-text-2">All intellectual copyright in original poems, short fiction, and translated prose remains with their respective contributing<br />authors under Perpetual Patron Attribution. Noholi Library retains non-exclusive rights to gazette, archive, and bind<br />accepted works into the annual physical folio series.</span>
                    </div>
                  </div>
                </div>
                <div className="writings-border-box-2">
                  <div className="writings-border-box-2-box">
                    <span className="writings-border-box-2-box-text">ISSN 2957-8914</span>
                  </div>
                  <div className="writings-border-box-2-box">
                    <span className="writings-border-box-2-box-text-2">•</span>
                  </div>
                  <div className="writings-border-box-2-box">
                    <span className="writings-border-box-2-box-text-3">DHAKA ARCHIVES</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
