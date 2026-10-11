import { Link } from 'react-router-dom';
import { useArticleActions } from '../articleActions.js';
import './BlogPost.css';

// Generated from Figma frame "Noholi Library — Blog: The Solitary Hour (Before login)" (158:407) by tools/gen.py, then hand-edited.
export default function BlogPost() {
  const act = useArticleActions();
  return (
    <div className="blogpost">
      <section className="blogpost-main">
        <article className="blogpost-article-archival-broadsheet-layo">
          <nav className="blogpost-nav-breadcrumb">
            <Link to="/" className="blogpost-nav-breadcrumb-box">HOME</Link>
            <div className="blogpost-nav-breadcrumb-box-2">
              <span className="blogpost-nav-breadcrumb-box-2-text">/</span>
            </div>
            <Link to="/blogs" className="blogpost-nav-breadcrumb-box">WRITE UPS</Link>
            <div className="blogpost-nav-breadcrumb-box-2">
              <span className="blogpost-nav-breadcrumb-box-2-text">/</span>
            </div>
            <Link to="/blogs" className="blogpost-nav-breadcrumb-box">BLOGS</Link>
            <div className="blogpost-nav-breadcrumb-box-2">
              <span className="blogpost-nav-breadcrumb-box-2-text">/</span>
            </div>
            <div className="blogpost-nav-breadcrumb-box-2">
              <span className="blogpost-nav-breadcrumb-box-2-text-2">THE SOLITARY HOUR</span>
            </div>
          </nav>
          <div className="blogpost-header-section">
            <div className="blogpost-category-pill-folio-registry-fla">
              <div className="blogpost-category-pill-folio-registry-fla-box">
                <span className="blogpost-category-pill-folio-registry-fla-box-text">ESSAYS & NOTES • LIBRARY CHRONICLES</span>
              </div>
              <div className="blogpost-category-pill-folio-registry-fla-box-2">
                <span className="blogpost-category-pill-folio-registry-fla-box-2-text">FOLIO REGISTRY NO. 2025/X-14</span>
              </div>
            </div>
            <h1 className="blogpost-main-display-title"><span>The Solitary Hour: On the<br />Nature of Quiet Reading Rooms</span></h1>
            <div className="blogpost-bengali-subtitle-in-classical-ed">
              <span className="blogpost-bengali-subtitle-in-classical-ed-text">নীরব পাঠকক্ষের স্বভাব ও যৌথ নির্জনতা</span>
            </div>
            <div className="blogpost-publication-metadata-archival-le">
              <div className="blogpost-publication-metadata-archival-le-box">
                <div className="blogpost-publication-metadata-archival-le-box-box">
                  <div className="blogpost-publication-metadata-archival-le-box-box-box">
                    <span className="blogpost-publication-metadata-archival-le-box-box-box-text">By</span>
                  </div>
                  <div className="blogpost-publication-metadata-archival-le-box-box-box">
                    <span className="blogpost-publication-metadata-archival-le-box-box-box-text-2">Mohammad Rafiqul Islam</span>
                  </div>
                  <div className="blogpost-publication-metadata-archival-le-box-box-box">
                    <span className="blogpost-publication-metadata-archival-le-box-box-box-text-3">(Patron Member #NL-88204)</span>
                  </div>
                </div>
                <div className="blogpost-publication-metadata-archival-le-box-box-2">
                  <span className="blogpost-publication-metadata-archival-le-box-box-2-text">•</span>
                </div>
                <div className="blogpost-time">
                  <span className="blogpost-time-text">October 14, 2025</span>
                </div>
                <div className="blogpost-publication-metadata-archival-le-box-box-3">
                  <span className="blogpost-publication-metadata-archival-le-box-box-3-text">•</span>
                </div>
                <div className="blogpost-publication-metadata-archival-le-box-box-4">
                  <img className="blogpost-publication-metadata-archival-le-box-box-4-box" src="/svg/container-1xkbt5g.svg" alt="" width="13" height="13" />
                  <span className="blogpost-publication-metadata-archival-le-box-box-4-text">6 min read</span>
                </div>
                <div className="blogpost-publication-metadata-archival-le-box-box-5">
                  <span className="blogpost-publication-metadata-archival-le-box-box-5-text">•</span>
                </div>
                <div className="blogpost-publication-metadata-archival-le-box-box-6">
                  <span className="blogpost-publication-metadata-archival-le-box-box-6-text">ARCHIVAL REGISTRY • MEMBER ESSAY</span>
                </div>
              </div>
              <div className="blogpost-archival-actions">
                <button type="button" className="blogpost-archival-actions-box" onClick={act.print}>
                  <img className="blogpost-archival-actions-box-box" src="/svg/container-14z0t0b.svg" alt="" width="14" height="12" />
                  <div className="blogpost-archival-actions-box-box-2">
                    <span className="blogpost-archival-actions-box-box-2-text">Print<br />Dispatch</span>
                  </div>
                </button>
                <div className="blogpost-archival-actions-box-2">
                  <span className="blogpost-archival-actions-box-2-text">|</span>
                </div>
                <button type="button" className="blogpost-archival-actions-box" onClick={act.cite} title="Copy a citation">
                  <img className="blogpost-archival-actions-box-box-3" src="/svg/container-6pqxh8.svg" alt="" width="12" height="8" />
                  <div className="blogpost-archival-actions-box-box-2">
                    <span className="blogpost-archival-actions-box-box-2-text-2" aria-live="polite">{act.flash === 'cite' ? 'Copied ✓' : 'Citation'}</span>
                  </div>
                </button>
                <div className="blogpost-archival-actions-box-2">
                  <span className="blogpost-archival-actions-box-2-text">|</span>
                </div>
                <button type="button" className="blogpost-archival-actions-box" onClick={act.toggleSave} aria-pressed={act.saved}>
                  <img className="blogpost-archival-actions-box-box-4" src="/svg/container-srl5au.svg" alt="" width="10" height="12" />
                  <div className="blogpost-archival-actions-box-box-2">
                    <span className="blogpost-archival-actions-box-box-2-text-2" aria-live="polite">{act.saved ? 'Saved ✓' : 'Save'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <section className="blogpost-main-broadsheet-grid">
            <div className="blogpost-aside-scholarly-marginalia-ledge">
              <div className="blogpost-background-border">
                <div className="blogpost-background-border-box">
                  <span className="blogpost-reading-hall-classification">READING HALL CLASSIFICATION</span>
                </div>
                <p className="blogpost-paragraph">
                  <span className="blogpost-paragraph-text">{"Ref: "}</span>
                  <span className="blogpost-paragraph-text-2">BD-ARC / 891.4409</span>
                </p>
                <div className="blogpost-background-border-box">
                  <span className="blogpost-location-stacks-hall-2-north-wal">Location: Stacks Hall 2, North Wall,{' '}<br className="soft-br" />Folio Cabinet IX. Open during{' '}<br className="soft-br" />library study hours.</span>
                </div>
              </div>
              <div className="blogpost-verticalborder">
                <div className="blogpost-verticalborder-box">
                  <span className="blogpost-gloss-on">GLOSS ON "যৌথ নির্জনতা"</span>
                </div>
                <div className="blogpost-verticalborder-box">
                  <span className="blogpost-the-bengali-conception-of-shared">The Bengali conception of shared{' '}<br className="soft-br" />solitude—a state where communal{' '}<br className="soft-br" />proximity deepens interior{' '}<br className="soft-br" />contemplative silence rather than{' '}<br className="soft-br" />dispersing it.</span>
                </div>
              </div>
              <div className="blogpost-background-border-2">
                <div className="blogpost-background-border-2-box">
                  <span className="blogpost-colophon-notice">COLOPHON NOTICE</span>
                </div>
                <div className="blogpost-background-border-2-box">
                  <span className="blogpost-typeset-in-digital-revivals-of-c">Typeset in digital revivals of classic{' '}<br className="soft-br" />garamond and modern Bengali{' '}<br className="soft-br" />news face. Published under Noholi{' '}<br className="soft-br" />Research Press, Dhaka.</span>
                </div>
              </div>
            </div>
            <section className="blogpost-main-center-article-reading-meas">
              <div className="blogpost-main-center-article-reading-meas-box">
                <div className="blogpost-opening-paragraph-with-classical">
                  <span className="blogpost-opening-paragraph-with-classical-text">A</span>
                  <span className="blogpost-opening-paragraph-with-classical-text-2">shared reading table creates an atmosphere fundamentally distinct from</span>
                  <span className="blogpost-opening-paragraph-with-classical-text-3">solitary reading at home. In a common room, the quiet is not an absence</span>
                  <span className="blogpost-opening-paragraph-with-classical-text-4">of sound, but an intentional collective agreement. Pages turn at irregular</span>
                  <span className="blogpost-opening-paragraph-with-classical-text-5">intervals; a wooden chair adjusts against the floor; pen meets paper in brief,</span>
                  <span className="blogpost-opening-paragraph-with-classical-text-6">measured strokes. Within this rhythm, individual concentration finds support</span>
                  <span className="blogpost-opening-paragraph-with-classical-text-7">in the quiet industry of others.</span>
                </div>
                <div className="blogpost-paragraph-2">
                  <span className="blogpost-paragraph-2-text">Community reading sanctuaries exist to preserve this cadence of</span>
                  <span className="blogpost-paragraph-2-text">uninterrupted reflection. When a reader opens a volume in a public hall, the</span>
                  <span className="blogpost-paragraph-2-text">pressure of immediate reaction recedes. There are no notifications demanding</span>
                  <span className="blogpost-paragraph-2-text">vigilance, no algorithmic recommendations nudging attention toward hasty</span>
                  <span className="blogpost-paragraph-2-text">judgment. The words on the printed page unfold in sequence, rewarding</span>
                  <span className="blogpost-paragraph-2-text">patient, sustained inquiry.</span>
                </div>
                <div className="blogpost-inset-typographical-ornament-ast">
                  <div className="blogpost-inset-typographical-ornament-ast-box">
                    <span className="blogpost-inset-typographical-ornament-ast-box-text">✦ ✦ ✦</span>
                  </div>
                </div>
                <div className="blogpost-pull-quote-blockquote-with-seali">
                  <div className="blogpost-pull-quote-blockquote-with-seali-box">
                    <span className="blogpost-in-a-communal-library-silence-is">“In a communal library, silence is neither empty nor lonely; it is{' '}<br className="soft-br" />an active architecture built by readers who have agreed to give{' '}<br className="soft-br" />their undivided attention to the written word.”</span>
                  </div>
                  <div className="blogpost-cite">
                    <span className="blogpost-the-solitary-hour-iv">— THE SOLITARY HOUR, § IV</span>
                  </div>
                </div>
                <div className="blogpost-paragraph-3">
                  <span className="blogpost-paragraph-3-text">To maintain such spaces requires care from both custodians and readers alike.</span>
                  <span className="blogpost-paragraph-3-text">By honoring silence, returning volumes to their designated shelves, and</span>
                  <span className="blogpost-paragraph-3-text">allowing literature to be contemplated on its own terms, a reading room</span>
                  <span className="blogpost-paragraph-3-text">remains what it was always intended to be: an open haven for public curiosity</span>
                  <span className="blogpost-paragraph-3-text">and intellectual hospitality.</span>
                </div>
                <div className="blogpost-paragraph-4">
                  <span className="blogpost-paragraph-4-text">In Dhaka's bustling urban cadence, spaces that demand nothing of the visitor</span>
                  <span className="blogpost-paragraph-4-text">other than quiet contemplation are increasingly rare. Noholi Library’s reading</span>
                  <span className="blogpost-paragraph-4-text">desks, positioned beneath soft northern light and lined with neighborhood</span>
                  <span className="blogpost-paragraph-4-text">volumes, remind us that reading is both a profoundly solitary act and a deeply</span>
                  <span className="blogpost-paragraph-4-text">communal inheritance.</span>
                </div>
              </div>
              <img className="blogpost-end-of-article-printer-mark-orna" src="/svg/end-of-article-printer-mark-ornament-pltkz9.svg" alt="" width="690" height="68" />
              <section className="blogpost-member-author-bio-card">
                <section className="blogpost-member-author-bio-card-2">
                  <div className="blogpost-member-author-bio-card-2-box">
                    <div className="blogpost-author-seal-avatar-monogram">
                      <span className="blogpost-author-seal-avatar-monogram-text">র</span>
                    </div>
                    <div className="blogpost-member-author-bio-card-2-box-box">
                      <div className="blogpost-member-author-bio-card-2-box-box-box">
                        <div className="blogpost-member-author-bio-card-2-box-box-box-box">
                          <span className="blogpost-member-author-bio-card-2-box-box-box-box-text">CONTRIBUTING PATRON</span>
                        </div>
                        <div className="blogpost-member-author-bio-card-2-box-box-box-box">
                          <span className="blogpost-member-author-bio-card-2-box-box-box-box-text-2">NL-PATRON #88204</span>
                        </div>
                      </div>
                      <h2 className="blogpost-heading-2">Mohammad Rafiqul Islam</h2>
                      <div className="blogpost-member-author-bio-card-2-box-box-box-2">
                        <span className="blogpost-mohammad-rafiqul-islam-has-been">Mohammad Rafiqul Islam has been an active patron of Noholi Library{' '}<br className="soft-br" />since 2024, focusing on nineteenth-century regional history and modern{' '}<br className="soft-br" />Bengali prose.</span>
                      </div>
                      <div className="blogpost-member-author-bio-card-2-box-box-box-3">
                        <img className="blogpost-member-author-bio-card-2-box-box-box-3-box" src="/svg/container-14512ma.svg" alt="" width="15" height="11" />
                        <div className="blogpost-member-author-bio-card-2-box-box-box-3-box-2">
                          <span className="blogpost-member-author-bio-card-2-box-box-box-3-box-2-text">3 ESSAYS PUBLISHED IN NOHOLI CHRONICLES</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </section>
              <nav className="blogpost-navigation-bar-back-action">
                <nav className="blogpost-navigation-bar-back-action-2">
                  <Link to="/blogs" className="blogpost-navigation-bar-back-action-2-box">
                    <img className="blogpost-navigation-bar-back-action-2-box-box" src="/svg/container-udyi0k.svg" alt="" width="12" height="12" />
                    <div className="blogpost-navigation-bar-back-action-2-box-box-2">
                      <span className="blogpost-navigation-bar-back-action-2-box-box-2-text">BACK TO ALL ESSAYS &<br />CHRONICLES</span>
                    </div>
                  </Link>
                  <Link to="/studio/blog" className="blogpost-navigation-bar-back-action-2-box-2">
                    <div className="blogpost-navigation-bar-back-action-2-box-2-box">
                      <span className="blogpost-navigation-bar-back-action-2-box-2-box-text">HAVE A REFLECTION TO SHARE? SUBMIT{' '}<br className="soft-br" />ESSAY</span>
                    </div>
                    <img className="blogpost-navigation-bar-back-action-2-box-2-box-2" src="/svg/container-6vkf1q.svg" alt="" width="11" height="11" />
                  </Link>
                </nav>
              </nav>
            </section>
            <div className="blogpost-aside-desktop-right-margin-quick">
              <div className="blogpost-horizontalborder">
                <div className="blogpost-horizontalborder-box">
                  <span className="blogpost-archived-in">ARCHIVED IN</span>
                </div>
                <div className="blogpost-horizontalborder-box">
                  <span className="blogpost-horizontalborder-box-text">খণ্ড ১২ / ২০২৫</span>
                </div>
              </div>
              <div className="blogpost-horizontalborder">
                <div className="blogpost-horizontalborder-box">
                  <span className="blogpost-language">LANGUAGE</span>
                </div>
                <div className="blogpost-horizontalborder-box">
                  <span className="blogpost-english">English / বাংলা টীকা</span>
                </div>
              </div>
              <div className="blogpost-horizontalborder">
                <div className="blogpost-horizontalborder-box">
                  <span className="blogpost-access-level">ACCESS LEVEL</span>
                </div>
                <div className="blogpost-horizontalborder-box">
                  <span className="blogpost-public-archive">PUBLIC ARCHIVE</span>
                </div>
              </div>
              <div className="blogpost-aside-desktop-right-margin-quick-box">
                <div className="blogpost-background-border-3">
                  <div className="blogpost-horizontalborder-2">
                    <span className="blogpost-horizontalborder-2-text">NOHOLI PRESS<br />SEAL</span>
                  </div>
                  <div className="blogpost-background-border-3-box">
                    <span className="blogpost-background-border-3-box-text">নহলী</span>
                    <div className="blogpost-background-border-3-box-box">
                      <span className="blogpost-background-border-3-box-box-text">Seal of Authentic<br />Manuscript</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="blogpost-related-dispatches-section">
            <div className="blogpost-related-dispatches-section-box">
              <p className="blogpost-paragraph-5">
                <span className="blogpost-paragraph-5-text">FURTHER INQUIRIES FROM THE STACKS</span>
                <span className="blogpost-heading-3">Related Dispatches & Chronicles</span>
              </p>
              <Link to="/catalog" className="blogpost-related-dispatches-section-box-box">
                <div className="blogpost-related-dispatches-section-box-box-box">
                  <span className="blogpost-related-dispatches-section-box-box-box-text">VIEW INDEX</span>
                </div>
                <img className="blogpost-related-dispatches-section-box-box-box-2" src="/svg/container-weuv2b.svg" alt="" width="5" height="8" />
              </Link>
            </div>
            <div className="blogpost-preview-cards-grid">
              <article className="blogpost-article-card-1-preserving-region">
                <div className="blogpost-article-card-1-preserving-region-box">
                  <div className="blogpost-horizontalborder-3">
                    <div className="blogpost-horizontalborder-3-box">
                      <span className="blogpost-horizontalborder-3-box-text">FOLIO DISPATCH #089</span>
                    </div>
                    <div className="blogpost-horizontalborder-3-box">
                      <span className="blogpost-horizontalborder-3-box-text-2">CONSERVATION</span>
                    </div>
                  </div>
                  <div className="blogpost-article-card-1-preserving-region-box-box">
                    <h4 className="blogpost-heading-4"><span>Preserving Regional Voices: The Ephemeral Literary{' '}<br className="soft-br" />Journals of East Bengal</span></h4>
                  </div>
                  <div className="blogpost-article-card-1-preserving-region-box-box-2">
                    <span className="blogpost-article-card-1-preserving-region-box-box-2-text">পূর্ববঙ্গের সাময়িকপত্র ও লোকজ স্বরের সংরক্ষণ</span>
                  </div>
                  <div className="blogpost-article-card-1-preserving-region-box-box-3">
                    <div className="blogpost-article-card-1-preserving-region-box-box-3-box">
                      <span className="blogpost-an-exhaustive-study-into-the-bri">An exhaustive study into the brittle broadsheets, hand-pressed{' '}<br className="soft-br" />gazettes, and collegiate literary pamphlets printed in early twentieth-{' '}<br className="soft-br" />century Barisal, Sylhet, and Chittagong.</span>
                    </div>
                  </div>
                </div>
                <div className="blogpost-background-horizontalborder">
                  <div className="blogpost-background-horizontalborder-box">
                    <span className="blogpost-background-horizontalborder-box-text">BY DR. ANISUZZAMAN AL-HADI</span>
                  </div>
                  <Link to="/blogs/preserving-regional-voices" className="blogpost-background-horizontalborder-box-2">
                    <div className="blogpost-background-horizontalborder-box-2-box">
                      <span className="blogpost-background-horizontalborder-box-2-box-text">READ CHRONICLE</span>
                    </div>
                    <img className="blogpost-background-horizontalborder-box-2-box-2" src="/svg/container-1e0orzs.svg" alt="" width="10" height="10" />
                  </Link>
                </div>
              </article>
              <article className="blogpost-article-card-2-the-weight-of-bou">
                <div className="blogpost-article-card-2-the-weight-of-bou-box">
                  <div className="blogpost-horizontalborder-3">
                    <div className="blogpost-horizontalborder-3-box">
                      <span className="blogpost-horizontalborder-3-box-text">FOLIO DISPATCH #084</span>
                    </div>
                    <div className="blogpost-horizontalborder-3-box">
                      <span className="blogpost-horizontalborder-3-box-text-2">MATERIAL HISTORY</span>
                    </div>
                  </div>
                  <div className="blogpost-article-card-2-the-weight-of-bou-box-box">
                    <h4 className="blogpost-heading-4"><span>The Weight of Bound Paper: Exploring Noholi’s Rare{' '}<br className="soft-br" />Monograph Archive</span></h4>
                  </div>
                  <div className="blogpost-article-card-2-the-weight-of-bou-box-box-2">
                    <span className="blogpost-article-card-2-the-weight-of-bou-box-box-2-text">কাগজের বাঁধাই, স্পর্শ এবং মুদ্রিত অক্ষরের উত্তরাধিকার</span>
                  </div>
                  <div className="blogpost-article-card-2-the-weight-of-bou-box-box-3">
                    <div className="blogpost-article-card-2-the-weight-of-bou-box-box-3-box">
                      <span className="blogpost-examining-rag-paper-density-cott">Examining rag paper density, cotton bindings, and letterpress ink{' '}<br className="soft-br" />composition preserved across three generations of library acquisitions{' '}<br className="soft-br" />in Dhaka's Old Town.</span>
                    </div>
                  </div>
                </div>
                <div className="blogpost-background-horizontalborder">
                  <div className="blogpost-background-horizontalborder-box">
                    <span className="blogpost-background-horizontalborder-box-text">BY SHARMIN SULTANA</span>
                  </div>
                  <Link to="/blogs/the-weight-of-bound-paper" className="blogpost-background-horizontalborder-box-2">
                    <div className="blogpost-background-horizontalborder-box-2-box">
                      <span className="blogpost-background-horizontalborder-box-2-box-text">READ CHRONICLE</span>
                    </div>
                    <img className="blogpost-background-horizontalborder-box-2-box-2" src="/svg/container-1e0orzs.svg" alt="" width="10" height="10" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
