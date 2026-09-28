import { useState } from 'react';
import { coverUrl } from '../lib/books.js';
import './BookCover.css';

// Tints for the typographic placeholder, all from tokens.css. Picked by hashing the book id,
// so a book always gets the same colour on every page.
const TINTS = ['oxblood', 'green', 'umber', 'rose', 'paper'];

function tintOf(id) {
  let h = 0;
  for (const ch of String(id || '')) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

/** Live availability line shared by the catalogue card and the book page. */
export function availability(book) {
  const total = Number(book?.total_copies) || 0;
  const avail = Math.max(0, Number(book?.available_copies) || 0);
  if (book && book.is_circulating === false) return { state: 'reading', text: 'Reading room only', canBorrow: false, reason: 'This title is for the reading room only and cannot be borrowed.' };
  if (avail > 0) return { state: 'available', text: `${avail} of ${total || avail} available`, canBorrow: true, reason: '' };
  return { state: 'loan', text: 'All copies on loan', canBorrow: false, reason: 'All copies are on loan.' };
}

const isBangla = (book) => /bangla|bengali/i.test(book?.language || '');

/**
 * A book cover in a fixed 2:3 box (size it with the parent / className).
 * - Real cover: `object-fit: cover`. Covers much smaller than the box, or far from portrait
 *   (scans of spreads, landscape photos), are shown whole at no more than their own size on
 *   the tinted mat instead of being stretched blurry or cropped.
 * - No cover, or the image fails to load: a typographic cover in the site's own type.
 */
export default function BookCover({ book, className = '', eager = false }) {
  const url = coverUrl(book);
  const [failed, setFailed] = useState(false);
  const [fit, setFit] = useState('');
  const tint = tintOf(book?.id);
  const bn = isBangla(book);
  const title = (bn ? book?.title_bangla || book?.title : book?.title || book?.title_bangla) || '';
  const author = (bn ? book?.author_bangla || book?.author : book?.author || book?.author_bangla) || '';

  const onLoad = (e) => {
    const img = e.currentTarget;
    const ratio = img.naturalHeight / (img.naturalWidth || 1);
    if (ratio < 1.2) setFit('whole');                       // landscape / square scan
    else if (img.naturalWidth < img.clientWidth * 0.8) setFit('small'); // low-res: never upscale much
  };

  const showImage = url && !failed;
  return (
    <div className={`bookcover bookcover--${tint} ${className}`} data-lang={bn ? 'bn' : 'en'}>
      {showImage ? (
        <img
          className={`bookcover-img${fit ? ` bookcover-img--${fit}` : ''}`}
          src={url}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={onLoad}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="bookcover-type" aria-hidden="true">
          <span className="bookcover-title" lang={bn ? 'bn' : 'en'}>{title}</span>
          <span className="bookcover-rule" />
          <span className="bookcover-author" lang={bn ? 'bn' : 'en'}>{author}</span>
          <span className="bookcover-imprint">Noholi Library</span>
        </div>
      )}
    </div>
  );
}
