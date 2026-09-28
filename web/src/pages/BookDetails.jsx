import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import BookCover, { availability } from '../components/BookCover.jsx';
import { bookSlug, getBookBySlug } from '../lib/books.js';
import { describeError } from '../lib/supabase.js';
import './BookDetails.css';

const dash = (v) => (v === null || v === undefined || String(v).trim() === '' ? '—' : v);

function Breadcrumb({ label }) {
  return (
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
          <span className="book-the-river-path" title={label}>{label}</span>
        </div>
      </nav>
    </div>
  );
}

/** One row of the design's two-column "Book details" ledger. */
function Row({ name, label, value, lang }) {
  return (
    <div className={`book-${name} book-row`}>
      <div className={`book-${name}-box`}>
        <span className={`book-${name}-box-text`}>{label}</span>
      </div>
      <div className={`book-${name}-box-2`}>
        <span className={`book-${name}-box-2-text book-row-value`} lang={lang}>{dash(value)}</span>
      </div>
    </div>
  );
}

// Generated from Figma frame "Noholi Library — Book Details: The River Path (Before Login)" (36:2185) by tools/gen.py, then hand-edited.
// Loads the real book by its `bk-0001-<title>` slug (lib/books.js). Old fictional slugs → "not found".
export default function BookDetails() {
  // Members get the after-login actions (Figma frame 36:2863); guests are sent to log in.
  const { member } = useAuth() || {};
  const { slug = '' } = useParams();
  const [state, setState] = useState({ status: 'loading', book: null, error: '' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let live = true;
    setState({ status: 'loading', book: null, error: '' });
    getBookBySlug(slug)
      .then((book) => { if (live) setState({ status: book ? 'ready' : 'missing', book, error: '' }); })
      .catch((err) => { if (live) setState({ status: 'error', book: null, error: describeError(err) }); });
    return () => { live = false; };
  }, [slug, retry]);

  useEffect(() => {
    const b = state.book;
    if (!b) return undefined;
    const prev = document.title;
    document.title = `${b.title || b.title_bangla} — Noholi Library`;
    return () => { document.title = prev; };
  }, [state.book]);

  if (state.status !== 'ready') {
    const missing = state.status === 'missing';
    const heading = state.status === 'loading' ? 'Loading…' : missing ? 'Book not found' : 'This book could not be loaded';
    return (
      <div className="book">
        <section className="book-main-content">
          <Breadcrumb label={missing ? 'NOT FOUND' : '…'} />
          <section className="book-main-detail-section book-state" aria-busy={state.status === 'loading'}>
            <h1 className="book-heading-1">{heading}</h1>
            {missing && (
              <p className="book-state-text">
                We couldn’t find this book in the Noholi Library catalogue. The link may be out of date, or the title may have been withdrawn.
              </p>
            )}
            {state.status === 'error' && (
              <p className="book-state-text" role="alert">{state.error}</p>
            )}
            {state.status !== 'loading' && (
              <div className="book-state-actions">
                <Link to="/catalog" className="book-border-box-2">BROWSE THE CATALOGUE</Link>
                {state.status === 'error' && (
                  <button type="button" className="book-border-box-2" onClick={() => setRetry((n) => n + 1)}>TRY AGAIN</button>
                )}
              </div>
            )}
          </section>
        </section>
      </div>
    );
  }

  const book = state.book;
  const canonical = bookSlug(book);
  const title = book.title || book.title_bangla;
  const bnTitle = book.title_bangla && book.title_bangla !== title ? book.title_bangla : '';
  const author = book.author || book.author_bangla;
  const bnAuthor = book.author_bangla && book.author_bangla !== author ? book.author_bangla : '';
  const av = availability(book);
  const crumb = bnTitle ? `${title} (${bnTitle})` : title;
  const borrowTo = `/borrow/${canonical}`;
  const total = Number(book.total_copies) || 0;
  const copies = total ? `${total} (${Math.max(0, Number(book.available_copies) || 0)} available)` : null;

  return (
    <div className="book">
      <section className="book-main-content">
        <Breadcrumb label={crumb} />
        <section className="book-main-detail-section">
          <div className="book-main-detail-section-box">
            <div className="book-left-column-book-cover-actions">
              <div className="book-clean-typographic-book-cover-pla book-cover-frame">
                <BookCover book={book} className="book-cover-real" eager />
              </div>
              <div className="book-status-indicator-card">
                <div className="book-status-indicator-card-box">
                  <span className="book-status-indicator-card-box-text">COLLECTION STATUS</span>
                </div>
                <div className="book-status-indicator-card-box-2" aria-live="polite">
                  <div className={`book-status-indicator-card-box-2-box is-${av.state}`} />
                  <span className="book-status-indicator-card-box-2-text">{av.text}</span>
                </div>
              </div>
              <div className="book-borrowing-reservation-buttons">
                {!av.canBorrow ? (
                  <span className="book-borrowing-reservation-buttons-box is-disabled" role="button" aria-disabled="true" title={av.reason}>
                    <span className="book-borrowing-reservation-buttons-box-text">{av.state === 'reading' ? 'READING ROOM ONLY' : 'ALL COPIES ARE ON LOAN'}</span>
                  </span>
                ) : member ? (
                  <>
                    <Link to={borrowTo} className="book-borrowing-reservation-buttons-box">
                      <img className="book-member-icon" src="/svg/icon-borrow-member.svg" alt="" width="14.42" height="11.2" />
                      <span className="book-borrowing-reservation-buttons-box-text">BORROW VOLUME</span>
                    </Link>
                    <Link to={borrowTo} className="book-borrowing-reservation-buttons-box-2">
                      <img className="book-member-icon" src="/svg/icon-reserve-member.svg" alt="" width="8" height="11.2" />
                      <span className="book-borrowing-reservation-buttons-box-2-text">RESERVE COPY</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" state={{ from: borrowTo }} className="book-borrowing-reservation-buttons-box">
                      <img className="book-borrowing-reservation-buttons-box-box" src="/svg/container-adla7j.svg" alt="" width="14" height="17" />
                      <span className="book-borrowing-reservation-buttons-box-text">LOG IN TO BORROW</span>
                    </Link>
                    <Link to="/login" state={{ from: borrowTo }} className="book-borrowing-reservation-buttons-box-2">
                      <img className="book-borrowing-reservation-buttons-box-2-box" src="/svg/container-boxnrc.svg" alt="" width="11" height="14" />
                      <span className="book-borrowing-reservation-buttons-box-2-text">LOG IN TO RESERVE</span>
                    </Link>
                  </>
                )}
              </div>
              <div className="book-policy-notice">
                <div className="book-policy-notice-box">
                  <span className={`book-standard-loan-terms-apply-see-ru${av.canBorrow ? "" : " is-blocked"}`}>
                    {av.canBorrow
                      ? <>Standard loan terms apply — see Rules page for details. Members may borrow or{' '}<br className="soft-br" />reserve titles in person at the circulation desk.</>
                      : <>{av.reason}{' '}{av.state === 'reading' ? 'You are welcome to read it at the library.' : 'Please check back later, or ask at the circulation desk.'}</>}
                  </span>
                </div>
              </div>
            </div>
            <div className="book-right-column-bibliographic-ledge">
              <div className="book-title-author-header">
                <h1 className="book-heading-1">{title}</h1>
                {bnTitle && (
                  <div className="book-title-author-header-box">
                    <span className="book-title-author-header-box-text" lang="bn">{bnTitle}</span>
                  </div>
                )}
                {author && (
                  <div className="book-title-author-header-box-2">
                    <span className="book-by-a-r-chowdhury">{"By "}<span className="book-span">{author}</span>{bnAuthor && <span className="book-span-bn" lang="bn"> · {bnAuthor}</span>}</span>
                  </div>
                )}
              </div>
              <div className="book-details-table">
                <div className="book-details-table-2">
                  <div className="book-overlay-horizontalborder">
                    <div className="book-overlay-horizontalborder-box">
                      <span className="book-overlay-horizontalborder-box-text">BOOK DETAILS</span>
                    </div>
                  </div>
                  <div className="book-details-table-2-box">
                    <Row name="english-title" label="ENGLISH TITLE" value={book.title} />
                    <Row name="bangla-title" label="BANGLA TITLE" value={book.title_bangla} lang="bn" />
                    <Row name="author" label="AUTHOR" value={[book.author, bnAuthor].filter(Boolean).join(' · ') || book.author_bangla} />
                    <Row name="category" label="CATEGORY" value={book.category} />
                    <Row name="genre" label="GENRE" value={book.genre} />
                    <Row name="language" label="LANGUAGE" value={book.language} />
                    <Row name="publication" label="PUBLISHER" value={book.publisher} />
                    <Row name="year" label="YEAR" value={book.year_of_publication} />
                    <Row name="edition" label="EDITION" value={book.edition} />
                    <Row name="copies" label="COPIES" value={copies} />
                    <Row name="condition" label="CONDITION" value={book.condition} />
                    <Row name="pages" label="PAGES" value={book.pages} />
                    {book.isbn && <Row name="pages" label="ISBN" value={book.isbn} />}
                    <Row name="pages" label="BOOK NUMBER" value={book.id} />
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
                  <span className="book-members-can-borrow-circulating-v">Members can request any available volume online{' '}<br className="soft-br" />and collect it from the circulation desk.</span>
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
            <p className="book-no-reviews">No reader reviews yet.</p>
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
