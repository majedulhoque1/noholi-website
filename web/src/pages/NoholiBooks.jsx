import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCover, { availability } from '../components/BookCover.jsx';
import { bookPath, getNoholiBooks } from '../lib/books.js';
import { describeError } from '../lib/supabase.js';
import './NoholiBooks.css';

const PAGE_SIZE = 24;
// Three grid-column positions (1 / 3 / 5 in the design's 5-track grid, cols 2 & 4 are gutters),
// cycled by index — same trick Catalog.jsx uses so any number of cards wraps into new rows.
const CARD_CLASS = ['nbooks-card-1', 'nbooks-card-2', 'nbooks-card-3'];
const fmt = (n) => Number(n || 0).toLocaleString('en-US');

// Card contents only — the caller supplies the outer positional wrapper (CARD_CLASS[i % 3]),
// which is `display:flex; flex-direction:column; justify-content:space-between`, so this
// fragment's two children (the body box and the availability footer) are siblings, and the
// footer stays pinned to the card's bottom regardless of how tall the body is.
function NoholiBookCard({ book }) {
  const path = bookPath(book);
  const title = book.title || book.title_bangla;
  const bn = book.title_bangla && book.title_bangla !== title ? book.title_bangla : '';
  const author = book.author || book.author_bangla;
  const av = availability(book);
  return (
    <>
      <div className="nbooks-card-1-box">
        <Link to={path} className="nbooks-cover-wrap nbooks-cover-link" tabIndex={-1} aria-hidden="true">
          <BookCover book={book} className="nbooks-cover" />
        </Link>
        <div className="nbooks-card-details">
          <h2 className="nbooks-heading-2"><Link to={path} className="nbooks-title-link">{title}</Link></h2>
          {bn && (
            <div className="nbooks-card-details-box">
              <span className="nbooks-card-details-box-text" lang="bn">{bn}</span>
            </div>
          )}
          {author && (
            <div className="nbooks-card-details-box-2">
              <span className="nbooks-by-author-name">by {author}</span>
            </div>
          )}
        </div>
        {book.genre && (
          <div className="nbooks-metadata-genre-only">
            <div className="nbooks-background-border">
              <span className="nbooks-background-border-text">Genre: {book.genre}</span>
            </div>
          </div>
        )}
      </div>
      <div className="nbooks-availability-note">
        <div className="nbooks-availability-note-2">
          <div className="nbooks-availability-note-2-box">
            <span className={`nbooks-availability-note-2-box-text is-${av.state}`}>{av.text}</span>
          </div>
          <Link to={path} className="nbooks-availability-note-2-box-2" aria-label={`View details: ${title}`}>
            <div className="nbooks-availability-note-2-box-2-box">
              <span className="nbooks-availability-note-2-box-2-box-text">View</span>
            </div>
            <img className="nbooks-availability-note-2-box-2-box-2" src="/svg/container-1iubppx.svg" alt="" width="8" height="4" />
          </Link>
        </div>
      </div>
    </>
  );
}

function NoholiBookSkeleton() {
  return (
    <>
      <div className="nbooks-card-1-box nbooks-skel" aria-hidden="true">
        <div className="nbooks-cover-wrap nbooks-skel-cover">
          <div className="nbooks-skel-block nbooks-skel-cover-inner" />
        </div>
        <div className="nbooks-card-details">
          <div className="nbooks-skel-block nbooks-skel-line" style={{ width: '78%', height: 22 }} />
          <div className="nbooks-skel-block nbooks-skel-line" style={{ width: '55%', height: 16 }} />
          <div className="nbooks-skel-block nbooks-skel-line" style={{ width: '40%', height: 16 }} />
        </div>
      </div>
      <div className="nbooks-availability-note">
        <div className="nbooks-availability-note-2">
          <div className="nbooks-skel-block nbooks-skel-line" style={{ width: 110, height: 16 }} />
        </div>
      </div>
    </>
  );
}

// Generated from Figma frame "Noholi Library — Noholi Books (Before Login)" (36:267) by tools/gen.py, then hand-edited.
// Runs on the real catalogue: books where publisher = 'Noholi' exactly (Noholi Press's own imprint).
export default function NoholiBooks() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading'); // loading | ready | error | loading-more
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const reqId = useRef(0);

  useEffect(() => {
    let live = true;
    const id = ++reqId.current;
    setStatus('loading');
    getNoholiBooks({ page: 1, pageSize: PAGE_SIZE })
      .then((r) => {
        if (!live || id !== reqId.current) return;
        setRows(r.rows);
        setTotal(r.total);
        setPage(1);
        setStatus('ready');
      })
      .catch((err) => {
        if (!live || id !== reqId.current) return;
        setError(describeError(err));
        setStatus('error');
      });
    return () => { live = false; };
  }, [retry]);

  const loadMore = () => {
    const nextPage = page + 1;
    setStatus('loading-more');
    getNoholiBooks({ page: nextPage, pageSize: PAGE_SIZE })
      .then((r) => {
        setRows((prev) => [...prev, ...r.rows]);
        setTotal(r.total);
        setPage(nextPage);
        setStatus('ready');
      })
      .catch((err) => {
        setError(describeError(err));
        setStatus('error');
      });
  };

  const loading = status === 'loading';
  const loadingMore = status === 'loading-more';
  const hasMore = status !== 'loading' && rows.length < total;

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
            {status === 'ready' && (
              <div className="nbooks-count-line">{fmt(total)} {total === 1 ? 'title' : 'titles'}</div>
            )}
          </div>
        </section>

        {status === 'error' ? (
          <section className="nbooks-published-titles-grid">
            <p className="nbooks-empty" role="alert">
              These titles could not be loaded: {error}{' '}
              <button type="button" onClick={() => setRetry((n) => n + 1)}>Try again</button>
            </p>
          </section>
        ) : loading ? (
          <section className="nbooks-published-titles-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className={CARD_CLASS[i % 3]} key={i}>
                <NoholiBookSkeleton />
              </div>
            ))}
          </section>
        ) : rows.length === 0 ? (
          <section className="nbooks-published-titles-grid">
            <p className="nbooks-empty">No Noholi Press titles are in the catalogue yet.</p>
          </section>
        ) : (
          <>
            <section className={`nbooks-published-titles-grid${loadingMore ? ' is-loading' : ''}`} aria-busy={loadingMore}>
              {rows.map((book, i) => (
                <div className={CARD_CLASS[i % 3]} key={book.id}>
                  <NoholiBookCard book={book} />
                </div>
              ))}
            </section>
            {hasMore && (
              <div className="nbooks-load-more">
                <button type="button" className="nbooks-load-more-btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : `Load more (${fmt(total - rows.length)} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
