import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Blogs.css';

const TABS = [
  { id: 'all', label: 'ALL DISPATCHES' },
  { id: 'chronicles', label: 'LIBRARY CHRONICLES' },
  { id: 'essays', label: 'LITERARY ESSAYS' },
  { id: 'regional', label: 'REGIONAL VOICES' },
  { id: 'member', label: 'MEMBER SUBMISSIONS' },
];
const PER_PAGE = 4;
// Figma geometry of the ledger grid (3 rows of cards); later blocks are shifted by the grid's real height
const ROW_H = 342.88;
const ROW_GAP = 32;
const DESIGN_GRID_H = 1092.63;

const POSTS = [
  { cat: 'member', date: '2025-10-14', card: (
  <article key="2025-10-14" className="blogs-article-card-1-mohammad-rafiqul">
    <div className="blogs-article-card-1-mohammad-rafiqul-box">
      <div className="blogs-ribbon-metadata-header">
        <div className="blogs-ribbon-metadata-header-box">
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text">MEMBER CONTRIBUTION</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-2">•</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-3">FOLIO #842</span>
          </div>
        </div>
        <div className="blogs-ribbon-metadata-header-box-2">
          <span className="blogs-ribbon-metadata-header-box-2-text">6 MIN READ</span>
        </div>
      </div>
      <div className="blogs-card-body">
        <div className="blogs-card-body-box">
          <div className="blogs-card-body-box-box">
            <span className="blogs-october-14-2025-by-mohammad-rafi">October 14, 2025 — By Mohammad Rafiqul Islam (Patron Fellow)</span>
          </div>
          <h3 className="blogs-heading-3"><span>The Solitary Hour: On the Nature of Quiet{' '}<br className="soft-br" />Reading Rooms</span></h3>
        </div>
        <div className="blogs-card-body-box-2">
          <span className="blogs-a-shared-reading-table-creates-a">A shared reading table creates an atmosphere fundamentally distinct{' '}<br className="soft-br" />from solitary reading at home. In a common room, the quiet is not an{' '}<br className="soft-br" />absence of sound, but an intentional covenant forged by several…</span>
        </div>
      </div>
    </div>
    <div className="blogs-card-footer-action">
      <div className="blogs-card-footer-action-box">
        <span className="blogs-card-footer-action-box-text">CAT: READING SANCTUARIES</span>
      </div>
      <Link to="/blogs/the-solitary-hour" className="blogs-card-footer-action-box-2">
        <span className="blogs-card-footer-action-box-2-text">Read Full Essay</span>
        <img className="blogs-card-footer-action-box-2-box" src="/svg/container-1t1gqtv.svg" alt="" width="11" height="4" />
      </Link>
    </div>
  </article>
  ) },
  { cat: 'chronicles', date: '2025-09-28', card: (
  <article key="2025-09-28" className="blogs-article-card-2-anwara-begum">
    <div className="blogs-article-card-2-anwara-begum-box">
      <div className="blogs-ribbon-metadata-header">
        <div className="blogs-ribbon-metadata-header-box">
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-4">ARCHIVAL STACKS</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-2">•</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-3">FOLIO #841</span>
          </div>
        </div>
        <div className="blogs-ribbon-metadata-header-box-2">
          <span className="blogs-ribbon-metadata-header-box-2-text">9 MIN READ</span>
        </div>
      </div>
      <div className="blogs-card-body">
        <div className="blogs-card-body-box">
          <div className="blogs-card-body-box-box">
            <span className="blogs-september-28-2025-by-anwara-begu">September 28, 2025 — By Anwara Begum (Senior Archivist)</span>
          </div>
          <h3 className="blogs-heading-3"><span>Preserving Regional Voices: Why Community{' '}<br className="soft-br" />Collections Matter</span></h3>
        </div>
        <div className="blogs-card-body-box-2">
          <span className="blogs-beyond-bestselling-paperbacks-li">Beyond bestselling paperbacks lies a rich fabric of local poetry,{' '}<br className="soft-br" />dialect literature, and neighborhood narratives that require{' '}<br className="soft-br" />intentional care. Without provincial repositories, micro-histories slip</span>
        </div>
      </div>
    </div>
    <div className="blogs-card-footer-action">
      <div className="blogs-card-footer-action-box">
        <span className="blogs-card-footer-action-box-text">CAT: PRESERVATION & MEMORY</span>
      </div>
      <Link to="/blogs/preserving-regional-voices" className="blogs-card-footer-action-box-2">
        <span className="blogs-card-footer-action-box-2-text">Read Full Essay</span>
        <img className="blogs-card-footer-action-box-2-box" src="/svg/container-1t1gqtv.svg" alt="" width="11" height="4" />
      </Link>
    </div>
  </article>
  ) },
  { cat: 'essays', date: '2025-09-12', card: (
  <article key="2025-09-12" className="blogs-article-card-3-tanvir-hossain">
    <div className="blogs-article-card-3-tanvir-hossain-box">
      <div className="blogs-ribbon-metadata-header">
        <div className="blogs-ribbon-metadata-header-box">
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-4">NOHOLI PRESS</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-2">•</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-3">FOLIO #840</span>
          </div>
        </div>
        <div className="blogs-ribbon-metadata-header-box-2">
          <span className="blogs-ribbon-metadata-header-box-2-text">5 MIN READ</span>
        </div>
      </div>
      <div className="blogs-card-body">
        <div className="blogs-card-body-box">
          <div className="blogs-card-body-box-box">
            <span className="blogs-september-12-2025-by-tanvir-hoss">September 12, 2025 — By Tanvir Hossain (Noholi Press)</span>
          </div>
          <h3 className="blogs-heading-3"><span>The Weight of Bound Paper: An Appreciation{' '}<br className="soft-br" />of Simple Print Craft</span></h3>
        </div>
        <div className="blogs-card-body-box-2">
          <span className="blogs-examining-the-physical-texture-o">Examining the physical texture of durable paper, sewn signatures,{' '}<br className="soft-br" />and readable type in an era of rapid digital ephemera. Why the{' '}<br className="soft-br" />mechanical impression of movable metal types retains a tactile…</span>
        </div>
      </div>
    </div>
    <div className="blogs-card-footer-action">
      <div className="blogs-card-footer-action-box">
        <span className="blogs-card-footer-action-box-text">CAT: MATERIAL CULTURE</span>
      </div>
      <Link to="/blogs/the-weight-of-bound-paper" className="blogs-card-footer-action-box-2">
        <span className="blogs-card-footer-action-box-2-text">Read Full Essay</span>
        <img className="blogs-card-footer-action-box-2-box" src="/svg/container-1t1gqtv.svg" alt="" width="11" height="4" />
      </Link>
    </div>
  </article>
  ) },
  { cat: 'chronicles', date: '2025-08-30', card: (
  <article key="2025-08-30" className="blogs-article-card-4-curatorial-team">
    <div className="blogs-article-card-4-curatorial-team-box">
      <div className="blogs-ribbon-metadata-header">
        <div className="blogs-ribbon-metadata-header-box">
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-4">LIBRARY LEDGER</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-2">•</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-3">FOLIO #839</span>
          </div>
        </div>
        <div className="blogs-ribbon-metadata-header-box-2">
          <span className="blogs-ribbon-metadata-header-box-2-text">7 MIN READ</span>
        </div>
      </div>
      <div className="blogs-card-body">
        <div className="blogs-card-body-box">
          <div className="blogs-card-body-box-box">
            <span className="blogs-august-30-2025-by-noholi-curator">August 30, 2025 — By Noholi Curatorial Team</span>
          </div>
          <h3 className="blogs-heading-3"><span>Notes from the Circulation Desk: Patterns in{' '}<br className="soft-br" />Shared Borrowing</span></h3>
        </div>
        <div className="blogs-card-body-box-2">
          <span className="blogs-observations-on-how-borrowed-vol">Observations on how borrowed volumes travel through hands,{' '}<br className="soft-br" />households, and conversations across seasons in a shared reading{' '}<br className="soft-br" />sanctuary. A ledger reveals that historical cartography and seasonal…</span>
        </div>
      </div>
    </div>
    <div className="blogs-card-footer-action">
      <div className="blogs-card-footer-action-box">
        <span className="blogs-card-footer-action-box-text">CAT: READER SOCIOLOGY</span>
      </div>
      <Link to="/blogs/notes-from-the-circulation-desk" className="blogs-card-footer-action-box-2">
        <span className="blogs-card-footer-action-box-2-text">Read Full Essay</span>
        <img className="blogs-card-footer-action-box-2-box" src="/svg/container-1t1gqtv.svg" alt="" width="11" height="4" />
      </Link>
    </div>
  </article>
  ) },
  { cat: 'essays', date: '2025-08-15', card: (
  <article key="2025-08-15" className="blogs-article-card-5-dr-kamal-ahmed">
    <div className="blogs-article-card-5-dr-kamal-ahmed-box">
      <div className="blogs-ribbon-metadata-header">
        <div className="blogs-ribbon-metadata-header-box">
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text">GUEST PATRON</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-2">•</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-3">FOLIO #838</span>
          </div>
        </div>
        <div className="blogs-ribbon-metadata-header-box-2">
          <span className="blogs-ribbon-metadata-header-box-2-text">8 MIN READ</span>
        </div>
      </div>
      <div className="blogs-card-body">
        <div className="blogs-card-body-box">
          <div className="blogs-card-body-box-box">
            <span className="blogs-august-15-2025-by-dr-kamal-ahmed">August 15, 2025 — By Dr. Kamal Ahmed (Guest Patron)</span>
          </div>
          <h3 className="blogs-heading-3"><span>Monsoon Folios: Reading Bengali Poetry{' '}<br className="soft-br" />Under Rain-Washed Skylights</span></h3>
        </div>
        <div className="blogs-card-body-box-2">
          <span className="blogs-the-auditory-resonance-of-downpo">The auditory resonance of downpours against tin roofs and high{' '}<br className="soft-br" />library eaves has long dictated the rhythm of Bengali verse. Reading{' '}<br className="soft-br" />Tagore and Jibanananda Das while water cascades outside transforms</span>
        </div>
      </div>
    </div>
    <div className="blogs-card-footer-action">
      <div className="blogs-card-footer-action-box">
        <span className="blogs-card-footer-action-box-text">CAT: LYRICAL COMMENTARY</span>
      </div>
      <Link to="/blogs/monsoon-folios" className="blogs-card-footer-action-box-2">
        <span className="blogs-card-footer-action-box-2-text">Read Full Essay</span>
        <img className="blogs-card-footer-action-box-2-box" src="/svg/container-1t1gqtv.svg" alt="" width="11" height="4" />
      </Link>
    </div>
  </article>
  ) },
  { cat: 'regional', date: '2025-07-22', card: (
  <article key="2025-07-22" className="blogs-article-card-6-sharmin-akhter">
    <div className="blogs-article-card-6-sharmin-akhter-box">
      <div className="blogs-ribbon-metadata-header">
        <div className="blogs-ribbon-metadata-header-box">
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-4">ARCHIVAL RESEARCH</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-2">•</span>
          </div>
          <div className="blogs-ribbon-metadata-header-box-box">
            <span className="blogs-ribbon-metadata-header-box-box-text-3">FOLIO #837</span>
          </div>
        </div>
        <div className="blogs-ribbon-metadata-header-box-2">
          <span className="blogs-ribbon-metadata-header-box-2-text">11 MIN READ</span>
        </div>
      </div>
      <div className="blogs-card-body">
        <div className="blogs-card-body-box">
          <div className="blogs-card-body-box-box">
            <span className="blogs-july-22-2025-by-sharmin-akhter">July 22, 2025 — By Sharmin Akhter</span>
          </div>
          <h3 className="blogs-heading-3"><span>Forgotten Colophons: Marginalia in{' '}<br className="soft-br" />Twentieth-Century Dhaka Prints</span></h3>
        </div>
        <div className="blogs-card-body-box-2">
          <span className="blogs-traces-of-ownership-faded-librar">Traces of ownership, faded library stamps, and pencil annotations{' '}<br className="soft-br" />that transform institutional texts into intimate social histories. An{' '}<br className="soft-br" />investigation into the small press publishers of Islampur and…</span>
        </div>
      </div>
    </div>
    <div className="blogs-card-footer-action">
      <div className="blogs-card-footer-action-box">
        <span className="blogs-card-footer-action-box-text">CAT: BOOK HISTORY</span>
      </div>
      <Link to="/blogs/forgotten-colophons" className="blogs-card-footer-action-box-2">
        <span className="blogs-card-footer-action-box-2-text">Read Full Essay</span>
        <img className="blogs-card-footer-action-box-2-box" src="/svg/container-1t1gqtv.svg" alt="" width="11" height="4" />
      </Link>
    </div>
  </article>
  ) },
];


// Generated from Figma frame "Noholi Library — Blogs & Literary Chronicles (Before login)" (158:67) by tools/gen.py, then hand-edited.
export default function Blogs() {
  const [tab, setTab] = useState('all');
  const [asc, setAsc] = useState(false);
  const [page, setPage] = useState(1);
  const countOf = (id) => (id === 'all' ? POSTS.length : POSTS.filter((p) => p.cat === id).length);
  const list = POSTS.filter((p) => tab === 'all' || p.cat === tab)
    .sort((a, b) => (asc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const first = list.length ? (page - 1) * PER_PAGE + 1 : 0;
  const last = (page - 1) * PER_PAGE + shown.length;
  const rows = Math.max(1, Math.ceil(shown.length / 2));
  const gridH = rows * ROW_H + (rows - 1) * ROW_GAP;
  const goTo = (n) => {
    setPage(n);
    document.querySelector('.blogs-nav-chronicle-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="blogs">
      <section className="blogs-main">
        <section className="blogs-page-envelope-broadsheet-boundar" style={{ '--blogs-grid-h': `${gridH}px`, '--blogs-shift': `${gridH - DESIGN_GRID_H}px` }}>
          <div className="blogs-archival-folio-header-metadata-r">
            <div className="blogs-breadcrumb-classification-bar">
              <div className="blogs-breadcrumb-classification-bar-box">
                <Link to="/" className="blogs-breadcrumb-classification-bar-box-box">HOME</Link>
                <div className="blogs-breadcrumb-classification-bar-box-box-2">
                  <span className="blogs-breadcrumb-classification-bar-box-box-2-text">/</span>
                </div>
                <Link to="/blogs" className="blogs-breadcrumb-classification-bar-box-box">WRITE UPS</Link>
                <div className="blogs-breadcrumb-classification-bar-box-box-2">
                  <span className="blogs-breadcrumb-classification-bar-box-box-2-text">/</span>
                </div>
                <div className="blogs-breadcrumb-classification-bar-box-box-2">
                  <span className="blogs-breadcrumb-classification-bar-box-box-2-text-2">BLOGS</span>
                </div>
              </div>
              <div className="blogs-background-border">
                <div className="blogs-background-border-box">
                  <span className="blogs-background-border-box-text">SERIES: NL-CRN-2025</span>
                </div>
                <div className="blogs-background-border-box">
                  <span className="blogs-background-border-box-text-2">•</span>
                </div>
                <div className="blogs-background-border-box">
                  <span className="blogs-background-border-box-text">DISPATCH NO. 14</span>
                </div>
              </div>
            </div>
            <div className="blogs-category-deck-inscription">
              <div className="blogs-category-deck-inscription-box">
                <div className="blogs-category-deck-inscription-box-box" />
                <div className="blogs-category-deck-inscription-box-box-2">
                  <span className="blogs-essays-editorial-pieces-library">ESSAYS, EDITORIAL PIECES & LIBRARY CHRONICLES (সাহিত্য ও সংগ্রহশালা প্রবন্ধ)</span>
                </div>
              </div>
              <div className="blogs-category-deck-inscription-box-2">
                <h1 className="blogs-heading-1">Library Chronicles & Essays</h1>
              </div>
              <div className="blogs-category-deck-inscription-box-2">
                <span className="blogs-reflections-on-reading-habits-re">Reflections on reading habits, regional Bengali literary traditions, the craft of archival{' '}<br className="soft-br" />preservation, and member-contributed dispatches from the quiet tables of Noholi.</span>
              </div>
            </div>
          </div>
          <section className="blogs-member-submissions">
            <div className="blogs-fine-double-hairline-interior-fr">
              <div className="blogs-fine-double-hairline-interior-fr-box">
                <div className="blogs-fine-double-hairline-interior-fr-box-box">
                  <div className="blogs-fine-double-hairline-interior-fr-box-box-box">
                    <span className="blogs-fine-double-hairline-interior-fr-box-box-box-text">PATRON GUILD LEDGER</span>
                  </div>
                  <div className="blogs-fine-double-hairline-interior-fr-box-box-box">
                    <span className="blogs-fine-double-hairline-interior-fr-box-box-box-text-2">•</span>
                  </div>
                  <div className="blogs-fine-double-hairline-interior-fr-box-box-box">
                    <span className="blogs-fine-double-hairline-interior-fr-box-box-box-text-3">Open for Submissions</span>
                  </div>
                </div>
                <h2 className="blogs-heading-2"><span>{"Contribute to Noholi Chronicles / "}<span className="blogs-span">আপনার লেখা জমা দিন</span></span></h2>
                <div className="blogs-fine-double-hairline-interior-fr-box-box-2">
                  <span className="blogs-fine-double-hairline-interior-fr-box-box-2-text">Authenticated patrons and researchers are invited to submit critical essays, reading reflections,{' '}<br className="soft-br" />and archival reviews. Every text undergoes scholarly editorial review before public preservation.</span>
                </div>
              </div>
              <div className="blogs-fine-double-hairline-interior-fr-box-2">
                <Link to="/studio/blog" className="blogs-fine-double-hairline-interior-fr-box-2-box">
                  <span className="blogs-write-a-blog-post">WRITE A BLOG POST / নতুন প্রবন্ধ লিখুন →</span>
                </Link>
                <Link to="/rules" className="blogs-fine-double-hairline-interior-fr-box-2-box-2">Editorial Guidelines & Word Limits §</Link>
              </div>
            </div>
          </section>
          <nav className="blogs-nav-chronicle-categories">
            <div className="blogs-nav-chronicle-categories-box" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'blogs-active-tab' : 'blogs-nav-chronicle-categories-box-box'} onClick={() => { setTab(t.id); setPage(1); }}>
                  {t.label} ({countOf(t.id)})
                </button>
              ))}
            </div>
            <div className="blogs-sorting-index-identifier">
              <div className="blogs-sorting-index-identifier-box">
                <span className="blogs-sorting-index-identifier-box-text">SORT:</span>
              </div>
              <button type="button" className="blogs-sorting-index-identifier-box blogs-sort-toggle" onClick={() => { setAsc((a) => !a); setPage(1); }}>
                <span className="blogs-sorting-index-identifier-box-text-2">Date: {asc ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </nav>
          <div className="blogs-curated-chronicle-ledger-grid">
            {shown.map((p) => p.card)}
          </div>
          <div className="blogs-archival-register-footnote-aster">
            <div className="blogs-horizontal-divider" />
            <div className="blogs-archival-register-footnote-aster-box">
              <span className="blogs-archival-register-footnote-aster-box-text">∗ ∗ ∗</span>
            </div>
            <div className="blogs-horizontal-divider" />
          </div>
          <div className="blogs-footer-archival-pagination-ledge">
            <div className="blogs-footer-archival-pagination-ledge-box">
              <div className="blogs-footer-archival-pagination-ledge-box-box">
                <span className="blogs-footer-archival-pagination-ledge-box-box-text">SHOWING</span>
              </div>
              <div className="blogs-footer-archival-pagination-ledge-box-box">
                <span className="blogs-footer-archival-pagination-ledge-box-box-text-2">{first}–{last}</span>
              </div>
              <div className="blogs-footer-archival-pagination-ledge-box-box">
                <span className="blogs-footer-archival-pagination-ledge-box-box-text">OF</span>
              </div>
              <div className="blogs-footer-archival-pagination-ledge-box-box">
                <span className="blogs-footer-archival-pagination-ledge-box-box-text-2">{list.length} {list.length === 1 ? 'DISPATCH' : 'DISPATCHES'}</span>
              </div>
            </div>
            <nav className="blogs-nav-folio-pages" aria-label="Pages">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (n === page ? (
                <div key={n} className="blogs-background-border-2" aria-current="page">
                  <span className="blogs-background-border-2-text">{n}</span>
                </div>
              ) : (
                <button key={n} type="button" className="blogs-nav-folio-pages-box" onClick={() => goTo(n)} aria-label={`Page ${n}`}>
                  <div className="blogs-nav-folio-pages-box-box">
                    <span className="blogs-nav-folio-pages-box-box-text">{n}</span>
                  </div>
                </button>
              )))}
              <button type="button" className="blogs-nav-folio-pages-box-2" onClick={() => goTo(page + 1)} disabled={page >= pages}>
                <div className="blogs-nav-folio-pages-box-2-box">
                  <span className="blogs-nav-folio-pages-box-2-box-text">NEXT →</span>
                </div>
              </button>
            </nav>
          </div>
          <div className="blogs-colophon-inset-block">
            <div className="blogs-colophon-inset-block-box">
              <span className="blogs-colophon-inset-block-box-text">All entries in the Noholi Chronicles are indexed under the public lending repository catalog. Patron submissions{' '}<br className="soft-br" />remain the literary copyright of their respective authors while granted archival rights in perpetuity to Noholi{' '}<br className="soft-br" />Library & Press.</span>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
