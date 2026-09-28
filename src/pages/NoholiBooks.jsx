import { Link } from 'react-router-dom';
import './NoholiBooks.css';

// Generated from Figma frame "Noholi Library — Noholi Books (Before Login)" (36:267) by tools/gen.py, then hand-edited.
export default function NoholiBooks() {
  return (
    <div className="nbooks">
      <section className="nbooks-main-content-section">
        <section className="nbooks-page-header-intro">
          <div className="nbooks-page-header-intro-box">
            <div className="nbooks-page-header-intro-box-box">
              <span className="nbooks-publications">PUBLICATIONS</span>
            </div>
            <h1 className="nbooks-heading-1">Noholi Books</h1>
            <div className="nbooks-page-header-intro-box-box-2">
              <div className="nbooks-page-header-intro-box-box-2-box">
                <span className="nbooks-original-titles-published-by-noh">Original titles published by Noholi Press.</span>
              </div>
            </div>
          </div>
        </section>
        <section className="nbooks-published-titles-grid">
          <div className="nbooks-card-1">
            <div className="nbooks-card-1-box">
              <div className="nbooks-cover-placeholder">
                <div className="nbooks-cover-placeholder-box">
                  <span className="nbooks-cover-placeholder-box-text">The River Path</span>
                </div>
                <div className="nbooks-cover-placeholder-box-2">
                  <div className="nbooks-cover-placeholder-box-2-box">
                    <span className="nbooks-cover-placeholder-box-2-box-text">নদীর পথ</span>
                  </div>
                </div>
              </div>
              <div className="nbooks-card-details">
                <h2 className="nbooks-heading-2">The River Path</h2>
                <div className="nbooks-card-details-box">
                  <span className="nbooks-card-details-box-text">নদীর পথ</span>
                </div>
                <div className="nbooks-card-details-box-2">
                  <span className="nbooks-by-author-name">by [Author Name]</span>
                </div>
              </div>
              <div className="nbooks-metadata-genre-only">
                <div className="nbooks-background-border">
                  <span className="nbooks-background-border-text">Genre: Fiction</span>
                </div>
              </div>
            </div>
            <div className="nbooks-availability-note">
              <div className="nbooks-availability-note-2">
                <div className="nbooks-availability-note-2-box">
                  <span className="nbooks-availability-note-2-box-text">Available in Library Catalog</span>
                </div>
                <Link to="/books/the-river-path" className="nbooks-availability-note-2-box-2">
                  <div className="nbooks-availability-note-2-box-2-box">
                    <span className="nbooks-availability-note-2-box-2-box-text">View</span>
                  </div>
                  <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="nbooks-card-2">
            <div className="nbooks-card-2-box">
              <div className="nbooks-cover-placeholder">
                <div className="nbooks-cover-placeholder-box">
                  <span className="nbooks-cover-placeholder-box-text">Songs of the Delta</span>
                </div>
                <div className="nbooks-cover-placeholder-box-2">
                  <div className="nbooks-cover-placeholder-box-2-box">
                    <span className="nbooks-cover-placeholder-box-2-box-text">বদ্বীপের গান</span>
                  </div>
                </div>
              </div>
              <div className="nbooks-card-details">
                <h2 className="nbooks-heading-2">Songs of the Delta</h2>
                <div className="nbooks-card-details-box">
                  <span className="nbooks-card-details-box-text">বদ্বীপের গান</span>
                </div>
                <div className="nbooks-card-details-box-2">
                  <span className="nbooks-by-author-name">by [Author Name]</span>
                </div>
              </div>
              <div className="nbooks-metadata-genre-only">
                <div className="nbooks-background-border">
                  <span className="nbooks-background-border-text">Genre: Poetry</span>
                </div>
              </div>
            </div>
            <div className="nbooks-availability-note">
              <div className="nbooks-availability-note-2">
                <div className="nbooks-availability-note-2-box">
                  <span className="nbooks-availability-note-2-box-text">Available in Library Catalog</span>
                </div>
                <Link to="/books/songs-of-the-delta" className="nbooks-availability-note-2-box-2">
                  <div className="nbooks-availability-note-2-box-2-box">
                    <span className="nbooks-availability-note-2-box-2-box-text">View</span>
                  </div>
                  <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="nbooks-card-3">
            <div className="nbooks-card-3-box">
              <div className="nbooks-cover-placeholder-2">
                <div className="nbooks-cover-placeholder-2-box">
                  <span className="nbooks-cover-placeholder-2-box-text">Echoes of the Green Shore</span>
                </div>
                <div className="nbooks-cover-placeholder-2-box-2">
                  <div className="nbooks-cover-placeholder-2-box-2-box">
                    <span className="nbooks-cover-placeholder-2-box-2-box-text">সবুজ তীরের প্রতিধ্বনি</span>
                  </div>
                </div>
              </div>
              <div className="nbooks-card-details">
                <h2 className="nbooks-heading-2">Echoes of the Green Shore</h2>
                <div className="nbooks-card-details-box">
                  <span className="nbooks-card-details-box-text">সবুজ তীরের প্রতিধ্বনি</span>
                </div>
                <div className="nbooks-card-details-box-2">
                  <span className="nbooks-by-author-name">by [Author Name]</span>
                </div>
              </div>
              <div className="nbooks-metadata-genre-only">
                <div className="nbooks-background-border">
                  <span className="nbooks-background-border-text">Genre: History</span>
                </div>
              </div>
            </div>
            <div className="nbooks-availability-note">
              <div className="nbooks-availability-note-2">
                <div className="nbooks-availability-note-2-box">
                  <span className="nbooks-availability-note-2-box-text">Available in Library Catalog</span>
                </div>
                <Link to="/books/echoes-of-the-green-shore" className="nbooks-availability-note-2-box-2">
                  <div className="nbooks-availability-note-2-box-2-box">
                    <span className="nbooks-availability-note-2-box-2-box-text">View</span>
                  </div>
                  <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="nbooks-card-4">
            <div className="nbooks-card-4-box">
              <div className="nbooks-cover-placeholder">
                <div className="nbooks-cover-placeholder-box">
                  <span className="nbooks-cover-placeholder-box-text">Quiet Horizons</span>
                </div>
                <div className="nbooks-cover-placeholder-box-2">
                  <div className="nbooks-cover-placeholder-box-2-box">
                    <span className="nbooks-cover-placeholder-box-2-box-text">শান্ত দিগন্ত</span>
                  </div>
                </div>
              </div>
              <div className="nbooks-card-details">
                <h2 className="nbooks-heading-2">Quiet Horizons</h2>
                <div className="nbooks-card-details-box">
                  <span className="nbooks-card-details-box-text">শান্ত দিগন্ত</span>
                </div>
                <div className="nbooks-card-details-box-2">
                  <span className="nbooks-by-author-name">by [Author Name]</span>
                </div>
              </div>
              <div className="nbooks-metadata-genre-only">
                <div className="nbooks-background-border">
                  <span className="nbooks-background-border-text">Genre: Essays</span>
                </div>
              </div>
            </div>
            <div className="nbooks-availability-note">
              <div className="nbooks-availability-note-2">
                <div className="nbooks-availability-note-2-box">
                  <span className="nbooks-availability-note-2-box-text">Available in Library Catalog</span>
                </div>
                <Link to="/books/quiet-horizons" className="nbooks-availability-note-2-box-2">
                  <div className="nbooks-availability-note-2-box-2-box">
                    <span className="nbooks-availability-note-2-box-2-box-text">View</span>
                  </div>
                  <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="nbooks-card-5">
            <div className="nbooks-card-5-box">
              <div className="nbooks-cover-placeholder">
                <div className="nbooks-cover-placeholder-box">
                  <span className="nbooks-cover-placeholder-box-text">Shadows of the Delta</span>
                </div>
                <div className="nbooks-cover-placeholder-box-2">
                  <div className="nbooks-cover-placeholder-box-2-box">
                    <span className="nbooks-cover-placeholder-box-2-box-text">বদ্বীপের ছায়া</span>
                  </div>
                </div>
              </div>
              <div className="nbooks-card-details">
                <h2 className="nbooks-heading-2">Shadows of the Delta</h2>
                <div className="nbooks-card-details-box">
                  <span className="nbooks-card-details-box-text">বদ্বীপের ছায়া</span>
                </div>
                <div className="nbooks-card-details-box-2">
                  <span className="nbooks-by-author-name">by [Author Name]</span>
                </div>
              </div>
              <div className="nbooks-metadata-genre-only">
                <div className="nbooks-background-border">
                  <span className="nbooks-background-border-text">Genre: History</span>
                </div>
              </div>
            </div>
            <div className="nbooks-availability-note">
              <div className="nbooks-availability-note-2">
                <div className="nbooks-availability-note-2-box">
                  <span className="nbooks-availability-note-2-box-text">Available in Library Catalog</span>
                </div>
                <Link to="/books/shadows-of-the-delta" className="nbooks-availability-note-2-box-2">
                  <div className="nbooks-availability-note-2-box-2-box">
                    <span className="nbooks-availability-note-2-box-2-box-text">View</span>
                  </div>
                  <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="nbooks-card-6">
            <div className="nbooks-card-6-box">
              <div className="nbooks-cover-placeholder-3">
                <div className="nbooks-cover-placeholder-3-box">
                  <span className="nbooks-cover-placeholder-3-box-text">Studies in Regional Craft</span>
                </div>
                <div className="nbooks-cover-placeholder-3-box-2">
                  <div className="nbooks-cover-placeholder-3-box-2-box">
                    <span className="nbooks-cover-placeholder-3-box-2-box-text">আঞ্চলিক শিল্পের সমীক্ষা</span>
                  </div>
                </div>
              </div>
              <div className="nbooks-card-details-2">
                <h2 className="nbooks-heading-2">Studies in Regional Craft</h2>
                <div className="nbooks-card-details-2-box">
                  <span className="nbooks-card-details-2-box-text">আঞ্চলিক শিল্পের সমীক্ষা</span>
                </div>
                <div className="nbooks-card-details-2-box-2">
                  <span className="nbooks-by-author-name">by [Author Name]</span>
                </div>
              </div>
              <div className="nbooks-metadata-genre-only">
                <div className="nbooks-background-border">
                  <span className="nbooks-background-border-text">Genre: Non-Fiction</span>
                </div>
              </div>
            </div>
            <div className="nbooks-availability-note">
              <div className="nbooks-availability-note-2">
                <div className="nbooks-availability-note-2-box">
                  <span className="nbooks-availability-note-2-box-text">Available in Library Catalog</span>
                </div>
                <Link to="/books/studies-in-regional-craft" className="nbooks-availability-note-2-box-2">
                  <div className="nbooks-availability-note-2-box-2-box">
                    <span className="nbooks-availability-note-2-box-2-box-text">View</span>
                  </div>
                  <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
