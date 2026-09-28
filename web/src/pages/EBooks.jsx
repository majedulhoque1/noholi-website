import { Link } from 'react-router-dom';
import './EBooks.css';

// Generated from Figma frame "Noholi Library — E-Books (Before Login)" (36:107) by tools/gen.py, then hand-edited.
export default function EBooks() {
  return (
    <div className="ebooks">
      <div className="ebooks-breadcrumb" />
      <div className="ebooks-ebooks-box">
        <Link to="/" className="ebooks-ebooks-box-box">HOME</Link>
        <div className="ebooks-ebooks-box-box-2">
          <span className="ebooks-ebooks-box-box-2-text">/</span>
        </div>
        <div className="ebooks-ebooks-box-box-2">
          <span className="ebooks-resources">Resources</span>
        </div>
        <div className="ebooks-ebooks-box-box-2">
          <span className="ebooks-ebooks-box-box-2-text">/</span>
        </div>
        <div className="ebooks-ebooks-box-box-2">
          <span className="ebooks-e-books">E-Books</span>
        </div>
      </div>
      <section className="ebooks-main-content">
        <div className="ebooks-header-section">
          <div className="ebooks-header-section-box">
            <span className="ebooks-digital-library">DIGITAL LIBRARY</span>
          </div>
          <h1 className="ebooks-heading-1">E-Books</h1>
          <div className="ebooks-header-section-box-2">
            <span className="ebooks-header-section-box-2-text">Read digital editions of literary works and public interest collections directly in your browser.</span>
          </div>
        </div>
        <div className="ebooks-e-books-grid">
          <div className="ebooks-book-1">
            <div className="ebooks-book-1-box">
              <div className="ebooks-background-border">
                <div className="ebooks-background-border-box">
                  <span className="ebooks-digital-edition">DIGITAL EDITION</span>
                </div>
                <div className="ebooks-background-border-box-2">
                  <h3 className="ebooks-heading-3">The River Path</h3>
                  <div className="ebooks-background-border-box-2-box">
                    <span className="ebooks-background-border-box-2-box-text">নদীর পথ</span>
                  </div>
                </div>
                <div className="ebooks-background-border-box">
                  <span className="ebooks-author-name">[Author Name]</span>
                </div>
              </div>
              <div className="ebooks-book-1-box-box">
                <h2 className="ebooks-heading-2">The River Path</h2>
                <div className="ebooks-book-1-box-box-box">
                  <span className="ebooks-book-1-box-box-box-text">নদীর পথ</span>
                </div>
                <div className="ebooks-book-1-box-box-box-2">
                  <span className="ebooks-by-author-name">By [Author Name]</span>
                </div>
              </div>
            </div>
            <Link to="/read/the-river-path" className="ebooks-book-1-box-2">READ ONLINE</Link>
          </div>
          <div className="ebooks-book-2">
            <div className="ebooks-book-2-box">
              <div className="ebooks-background-border">
                <div className="ebooks-background-border-box">
                  <span className="ebooks-digital-edition">DIGITAL EDITION</span>
                </div>
                <div className="ebooks-background-border-box-2">
                  <h3 className="ebooks-heading-3">Songs of the Delta</h3>
                  <div className="ebooks-background-border-box-2-box">
                    <span className="ebooks-background-border-box-2-box-text">বদ্বীপের গান</span>
                  </div>
                </div>
                <div className="ebooks-background-border-box">
                  <span className="ebooks-author-name">[Author Name]</span>
                </div>
              </div>
              <div className="ebooks-book-2-box-box">
                <h2 className="ebooks-heading-2">Songs of the Delta</h2>
                <div className="ebooks-book-2-box-box-box">
                  <span className="ebooks-book-2-box-box-box-text">বদ্বীপের গান</span>
                </div>
                <div className="ebooks-book-2-box-box-box-2">
                  <span className="ebooks-by-author-name">By [Author Name]</span>
                </div>
              </div>
            </div>
            <Link to="/read/songs-of-the-delta" className="ebooks-book-2-box-2">READ ONLINE</Link>
          </div>
          <div className="ebooks-book-3">
            <div className="ebooks-book-3-box">
              <div className="ebooks-background-border">
                <div className="ebooks-background-border-box">
                  <span className="ebooks-digital-edition">DIGITAL EDITION</span>
                </div>
                <div className="ebooks-background-border-box-2">
                  <h3 className="ebooks-heading-3-2"><span>Echoes of the Green<br />Shore</span></h3>
                  <div className="ebooks-background-border-box-2-box">
                    <span className="ebooks-background-border-box-2-box-text">সবুজ তীরের প্রতিধ্বনি</span>
                  </div>
                </div>
                <div className="ebooks-background-border-box">
                  <span className="ebooks-author-name">[Author Name]</span>
                </div>
              </div>
              <div className="ebooks-book-3-box-box">
                <h2 className="ebooks-heading-2">Echoes of the Green Shore</h2>
                <div className="ebooks-book-3-box-box-box">
                  <span className="ebooks-book-3-box-box-box-text">সবুজ তীরের প্রতিধ্বনি</span>
                </div>
                <div className="ebooks-book-3-box-box-box-2">
                  <span className="ebooks-by-author-name">By [Author Name]</span>
                </div>
              </div>
            </div>
            <Link to="/read/echoes-of-the-green-shore" className="ebooks-book-3-box-2">READ ONLINE</Link>
          </div>
          <div className="ebooks-book-4">
            <div className="ebooks-book-4-box">
              <div className="ebooks-background-border">
                <div className="ebooks-background-border-box">
                  <span className="ebooks-digital-edition">DIGITAL EDITION</span>
                </div>
                <div className="ebooks-background-border-box-2">
                  <h3 className="ebooks-heading-3">Quiet Horizons</h3>
                  <div className="ebooks-background-border-box-2-box">
                    <span className="ebooks-background-border-box-2-box-text">শান্ত দিগন্ত</span>
                  </div>
                </div>
                <div className="ebooks-background-border-box">
                  <span className="ebooks-author-name">[Author Name]</span>
                </div>
              </div>
              <div className="ebooks-book-4-box-box">
                <h2 className="ebooks-heading-2">Quiet Horizons</h2>
                <div className="ebooks-book-4-box-box-box">
                  <span className="ebooks-book-4-box-box-box-text">শান্ত দিগন্ত</span>
                </div>
                <div className="ebooks-book-4-box-box-box-2">
                  <span className="ebooks-by-author-name">By [Author Name]</span>
                </div>
              </div>
            </div>
            <Link to="/read/quiet-horizons" className="ebooks-book-4-box-2">READ ONLINE</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
