import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import './BookDetails.css';

// Generated from Figma frame "Noholi Library — Book Details: The River Path (Before Login)" (36:2185) by tools/gen.py, then hand-edited.
export default function BookDetails() {
  // Members get the after-login actions (Figma frame 36:2863); guests are sent to log in.
  const { member } = useAuth();
  const { slug = 'the-river-path' } = useParams();

  return (
    <div className="book">
      <section className="book-main-content">
        <div className="book-breadcrumb-navigation">
          <nav className="book-nav-breadcrumb">
            <Link to="/" className="book-nav-breadcrumb-box">HOME</Link>
            <div className="book-nav-breadcrumb-box-2">
              <span className="book-nav-breadcrumb-box-2-text">/</span>
            </div>
            <Link to="/catalog" className="book-nav-breadcrumb-box">BROWSE</Link>
            <div className="book-nav-breadcrumb-box-2">
              <span className="book-nav-breadcrumb-box-2-text">/</span>
            </div>
            <div className="book-nav-breadcrumb-box-3">
              <span className="book-the-river-path">THE RIVER PATH (নদীর বাঁক)</span>
            </div>
          </nav>
        </div>
        <section className="book-main-detail-section">
          <div className="book-main-detail-section-box">
            <div className="book-left-column-book-cover-actions">
              <div className="book-clean-typographic-book-cover-pla">
                <div className="book-inner-border-line" />
                <div className="book-clean-typographic-book-cover-pla-box">
                  <span className="book-clean-typographic-book-cover-pla-box-text">NOHOLI LIBRARY</span>
                </div>
                <div className="book-cover-central-typography">
                  <div className="book-cover-central-typography-2">
                    <div className="book-horizontal-divider" />
                    <h2 className="book-heading-2">The River Path</h2>
                    <div className="book-cover-central-typography-2-box">
                      <span className="book-cover-central-typography-2-box-text">নদীর বাঁক</span>
                    </div>
                    <div className="book-horizontal-divider" />
                    <div className="book-cover-central-typography-2-box-2">
                      <span className="book-cover-central-typography-2-box-2-text">A. R. Chowdhury</span>
                    </div>
                  </div>
                </div>
                <div className="book-cover-imprint">
                  <div className="book-cover-imprint-box">
                    <span className="book-cover-imprint-box-text">NOHOLI PRESS</span>
                  </div>
                </div>
              </div>
              <div className="book-status-indicator-card">
                <div className="book-status-indicator-card-box">
                  <span className="book-status-indicator-card-box-text">COLLECTION STATUS</span>
                </div>
                <div className="book-status-indicator-card-box-2">
                  <div className="book-status-indicator-card-box-2-box" />
                  <span className="book-status-indicator-card-box-2-text">AVAILABLE TO BORROW</span>
                </div>
              </div>
              <div className="book-borrowing-reservation-buttons">
                {member ? (
                  <>
                    <Link to={`/borrow/${slug}`} className="book-borrowing-reservation-buttons-box">
                      <img className="book-member-icon" src="/svg/icon-borrow-member.svg" alt="" width="14.42" height="11.2" />
                      <span className="book-borrowing-reservation-buttons-box-text">BORROW VOLUME</span>
                    </Link>
                    <Link to={`/borrow/${slug}`} className="book-borrowing-reservation-buttons-box-2">
                      <img className="book-member-icon" src="/svg/icon-reserve-member.svg" alt="" width="8" height="11.2" />
                      <span className="book-borrowing-reservation-buttons-box-2-text">RESERVE COPY</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="book-borrowing-reservation-buttons-box">
                      <img className="book-borrowing-reservation-buttons-box-box" src="/svg/container-adla7j.svg" alt="" width="14" height="17" />
                      <span className="book-borrowing-reservation-buttons-box-text">LOG IN TO BORROW</span>
                    </Link>
                    <Link to="/login" className="book-borrowing-reservation-buttons-box-2">
                      <img className="book-borrowing-reservation-buttons-box-2-box" src="/svg/container-boxnrc.svg" alt="" width="11" height="14" />
                      <span className="book-borrowing-reservation-buttons-box-2-text">LOG IN TO RESERVE</span>
                    </Link>
                  </>
                )}
              </div>
              <div className="book-policy-notice">
                <div className="book-policy-notice-box">
                  <span className="book-standard-loan-terms-apply-see-ru">Standard loan terms apply — see Rules page for details. Members may borrow or{' '}<br className="soft-br" />reserve titles in person at the circulation desk.</span>
                </div>
              </div>
            </div>
            <div className="book-right-column-bibliographic-ledge">
              <div className="book-title-author-header">
                <h1 className="book-heading-1">The River Path</h1>
                <div className="book-title-author-header-box">
                  <span className="book-title-author-header-box-text">নদীর বাঁক</span>
                </div>
                <div className="book-title-author-header-box-2">
                  <span className="book-by-a-r-chowdhury">{"By "}<span className="book-span">A. R. Chowdhury</span></span>
                </div>
              </div>
              <div className="book-synopsis">
                <span className="book-the-river-path-explores-riparian">The River Path explores riparian geography and social transitions along the river basin.{' '}<br className="soft-br" />Grounded in oral memories and regional traditions, the narrative tracks an itinerant{' '}<br className="soft-br" />surveyor whose journeys document everyday community life, seasonal tides, and the{' '}<br className="soft-br" />evolving delta landscape.</span>
              </div>
              <div className="book-details-table">
                <div className="book-details-table-2">
                  <div className="book-overlay-horizontalborder">
                    <div className="book-overlay-horizontalborder-box">
                      <span className="book-overlay-horizontalborder-box-text">BOOK DETAILS</span>
                    </div>
                  </div>
                  <div className="book-details-table-2-box">
                    <div className="book-english-title">
                      <div className="book-english-title-box">
                        <span className="book-english-title-box-text">ENGLISH TITLE</span>
                      </div>
                      <div className="book-english-title-box-2">
                        <span className="book-english-title-box-2-text">The River Path</span>
                      </div>
                    </div>
                    <div className="book-bangla-title">
                      <div className="book-bangla-title-box">
                        <span className="book-bangla-title-box-text">BANGLA TITLE</span>
                      </div>
                      <div className="book-bangla-title-box-2">
                        <span className="book-bangla-title-box-2-text">নদীর বাঁক</span>
                      </div>
                    </div>
                    <div className="book-author">
                      <div className="book-author-box">
                        <span className="book-author-box-text">AUTHOR</span>
                      </div>
                      <div className="book-author-box-2">
                        <span className="book-author-box-2-text">A. R. Chowdhury</span>
                      </div>
                    </div>
                    <div className="book-category">
                      <div className="book-category-box">
                        <span className="book-category-box-text">CATEGORY</span>
                      </div>
                      <div className="book-category-box-2">
                        <span className="book-category-box-2-text">Adults</span>
                      </div>
                    </div>
                    <div className="book-genre">
                      <div className="book-genre-box">
                        <span className="book-genre-box-text">GENRE</span>
                      </div>
                      <div className="book-genre-box-2">
                        <span className="book-genre-box-2-text">Fiction</span>
                      </div>
                    </div>
                    <div className="book-language">
                      <div className="book-language-box">
                        <span className="book-language-box-text">LANGUAGE</span>
                      </div>
                      <div className="book-language-box-2">
                        <span className="book-language-box-2-text">English</span>
                      </div>
                    </div>
                    <div className="book-publication">
                      <div className="book-publication-box">
                        <span className="book-publication-box-text">PUBLICATION</span>
                      </div>
                      <div className="book-publication-box-2">
                        <span className="book-publication-box-2-text">Noholi Press</span>
                      </div>
                    </div>
                    <div className="book-year">
                      <div className="book-year-box">
                        <span className="book-year-box-text">YEAR</span>
                      </div>
                      <div className="book-year-box-2">
                        <span className="book-year-box-2-text">2023</span>
                      </div>
                    </div>
                    <div className="book-edition">
                      <div className="book-edition-box">
                        <span className="book-edition-box-text">EDITION</span>
                      </div>
                      <div className="book-edition-box-2">
                        <span className="book-edition-box-2-text">1st</span>
                      </div>
                    </div>
                    <div className="book-copies">
                      <div className="book-copies-box">
                        <span className="book-copies-box-text">COPIES</span>
                      </div>
                      <div className="book-copies-box-2">
                        <span className="book-copies-box-2-text">3</span>
                      </div>
                    </div>
                    <div className="book-condition">
                      <div className="book-condition-box">
                        <span className="book-condition-box-text">CONDITION</span>
                      </div>
                      <div className="book-condition-box-2">
                        <span className="book-condition-box-2-text">Good</span>
                      </div>
                    </div>
                    <div className="book-pages">
                      <div className="book-pages-box">
                        <span className="book-pages-box-text">PAGES</span>
                      </div>
                      <div className="book-pages-box-2">
                        <span className="book-pages-box-2-text">212</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="book-borrowing-guidelines-section">
            <h3 className="book-heading-3">Borrowing Guidelines</h3>
            <div className="book-borrowing-guidelines-section-box">
              <div className="book-guideline-1">
                <h4 className="book-heading-4">MEMBER CARD</h4>
                <div className="book-guideline-1-box">
                  <span className="book-a-valid-noholi-library-membershi">A valid Noholi Library membership card must be{' '}<br className="soft-br" />presented at the circulation desk to borrow titles.</span>
                </div>
              </div>
              <div className="book-guideline-2">
                <h4 className="book-heading-4">BORROWING & RESERVATIONS</h4>
                <div className="book-guideline-2-box">
                  <span className="book-members-can-borrow-circulating-v">Members can borrow circulating volumes and place{' '}<br className="soft-br" />reservations on currently checked-out titles.</span>
                </div>
              </div>
              <div className="book-guideline-3">
                <h4 className="book-heading-4">LOAN TERMS & RENEWALS</h4>
                <div className="book-guideline-3-box">
                  <span className="book-standard-loan-terms-apply-see-ru-2">Standard loan terms apply — see Rules page for{' '}<br className="soft-br" />details. Inquiries and renewals can be requested at{' '}<br className="soft-br" />the desk.</span>
                </div>
              </div>
            </div>
          </div>
          <section className="book-section">
            <h3 className="book-heading-3-2">Reviews & Ratings</h3>
            <div className="book-section-box">
              <img className="book-section-box-box" src="/svg/container-irbn4m.svg" alt="" width="99" height="15" />
              <span className="book-section-box-text">4.2 out of 5</span>
              <span className="book-section-box-text-2">(Sample reader rating)</span>
            </div>
            <div className="book-section-box-2">
              <div className="book-background-border">
                <div className="book-background-border-box">
                  <div className="book-background-border-box-box">
                    <span className="book-background-border-box-box-text">READER A.</span>
                  </div>
                  <div className="book-background-border-box-box">
                    <span className="book-background-border-box-box-text-2">[Date]</span>
                  </div>
                </div>
                <img className="book-background-border-box-2" src="/svg/container-1tiorrg.svg" alt="" width="1046" height="12" />
                <div className="book-background-border-box-3">
                  <span className="book-a-vivid-and-meditative-study-of">A vivid and meditative study of riparian life and regional transitions. Beautifully published by the press.</span>
                </div>
              </div>
              <div className="book-background-border">
                <div className="book-background-border-box">
                  <div className="book-background-border-box-box">
                    <span className="book-background-border-box-box-text">S. KARIM</span>
                  </div>
                  <div className="book-background-border-box-box">
                    <span className="book-background-border-box-box-text-2">[Date]</span>
                  </div>
                </div>
                <img className="book-background-border-box-2" src="/svg/container-1dx6u5t.svg" alt="" width="1046" height="12" />
                <div className="book-background-border-box-3">
                  <span className="book-the-descriptions-of-river-naviga">The descriptions of river navigation and seasonal tides are deeply resonant. An essential volume in the local collection.</span>
                </div>
              </div>
              <div className="book-background-border">
                <div className="book-background-border-box">
                  <div className="book-background-border-box-box">
                    <span className="book-background-border-box-box-text">M. N.</span>
                  </div>
                  <div className="book-background-border-box-box">
                    <span className="book-background-border-box-box-text-2">[Date]</span>
                  </div>
                </div>
                <img className="book-background-border-box-2" src="/svg/container-1dx6u5t.svg" alt="" width="1046" height="12" />
                <div className="book-background-border-box-3">
                  <span className="book-quiet-patient-prose-that-capture">Quiet, patient prose that captures the cadence of community memories.</span>
                </div>
              </div>
            </div>
            <div className="book-border">
              <div className="book-border-box">
                <span className="book-border-box-text">Have you read this title?</span>
              </div>
              {member ? (
                <Link to="/studio/book-review" className="book-border-box-2 book-border-box-2--member">WRITE A REVIEW</Link>
              ) : (
                <Link to="/login" className="book-border-box-2">LOG IN TO WRITE A REVIEW</Link>
              )}
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}
