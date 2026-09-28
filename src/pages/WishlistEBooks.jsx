import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OverlaySelect, Status, useSubmission } from './memberStudio.jsx';
import './WishlistEBooks.css';

const SORTS = [
  { value: 'latest', label: 'ACCESSION DATE (LATEST)', order: [1, 2, 3, 4] },
  { value: 'title', label: 'TITLE (A–Z)', order: [4, 3, 1, 2] },
  { value: 'available', label: 'AVAILABLE FIRST', order: [1, 3, 4, 2] },
];
const FORMATS = [
  { value: 'both', label: 'Reflowable E-Pub & High-Res Facsimile Scan (Both)' },
  { value: 'epub', label: 'Reflowable E-Pub only' },
  { value: 'facsimile', label: 'High-Res Facsimile Scan only' },
];
const REQUIRED = [
  ['book-title', 'book title'],
  ['original-author', 'original author'],
  ['why-should-the-library-digitize', 'why the library should digitize this work'],
];

// Generated from Figma frame "Noholi Library — E-Books Wishlist & Digital Stacks Requests (After login)" (126:5669) by tools/gen_member.py, then hand-edited.
export default function WishlistEBooks() {
  const navigate = useNavigate();
  const [sort, setSort] = useState('latest');
  const [format, setFormat] = useState('both');
  const [removed, setRemoved] = useState([]);
  const [notify, setNotify] = useState(false);
  const remove = (n) => setRemoved((r) => [...r, n]);
  const { status, submit } = useSubmission(REQUIRED, 'Thank you — your proposal has been sent to the Noholi Digital Archives Board.');
  const onSubmit = (e) => {
    if (submit(e)) e.currentTarget.reset();
  };

  // wishlist cards, keyed by their position in the design
  const cards = {};
  cards[1] = (
    <article className="wlebooks-article-item-1-available-to-read">
    <div className="wlebooks-callout-accession-header-strip">
      <div className="wlebooks-callout-accession-header-strip-box">
        <div className="wlebooks-callout-accession-header-strip-box-box">
          <span className="wlebooks-callout-accession-header-strip-box-box-text">FOLIO CALL: NL-EB-0419</span>
        </div>
        <div className="wlebooks-callout-accession-header-strip-box-box">
          <span className="wlebooks-callout-accession-header-strip-box-box-text-2">|</span>
        </div>
        <div className="wlebooks-callout-accession-header-strip-box-box">
          <span className="wlebooks-callout-accession-header-strip-box-box-text-3">EPUB3 & PDF HYBRID</span>
        </div>
      </div>
      <div className="wlebooks-callout-accession-header-strip-box-2">
        <div className="wlebooks-callout-accession-header-strip-box-2-box" />
        <div className="wlebooks-callout-accession-header-strip-box-2-box-2">
          <span className="wlebooks-callout-accession-header-strip-box-2-box-2-text">AVAILABLE TO READ</span>
        </div>
      </div>
    </div>
    <section className="wlebooks-main-book-grid-body">
      <div className="wlebooks-book-details-metadata">
        <div className="wlebooks-book-details-metadata-box">
          <div className="wlebooks-book-details-metadata-box-box">
            <div className="wlebooks-border">
              <span className="wlebooks-border-text">E-BOOK</span>
            </div>
            <div className="wlebooks-border-2">
              <span className="wlebooks-border-2-text">OCR VERIFIED</span>
            </div>
            <div className="wlebooks-book-details-metadata-box-box-box">
              <span className="wlebooks-book-details-metadata-box-box-box-text">BENGALI TYPOGRAPHY</span>
            </div>
          </div>
          <h3 className="wlebooks-heading-3"><span>{"The River Path "}<span className="wlebooks-span-2">(নদীর পথ)</span></span></h3>
          <div className="wlebooks-book-details-metadata-box-box-2">
            <span className="wlebooks-by-kazi-farhan-noholi-digital-ed">By Kazi Farhan • Noholi Digital Editions • Bengali Novel &{' '}<br className="soft-br" />Maritime Prose</span>
          </div>
          <div className="wlebooks-border-3">
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-format">FORMAT:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Enhanced EPUB & PDF</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-file-size">FILE SIZE:</span>
              </div>
              <span className="wlebooks-border-3-box-text">14.2 MB (With Plates)</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-reader-engine">READER ENGINE:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Noholi Web Reader & Offline Folio</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-sync-ledger">SYNC LEDGER:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Page 114 of 342 (33%)</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-actions-bar">
          <div className="wlebooks-actions-bar-box">
            <Link to="/read/the-river-path" className="wlebooks-actions-bar-box-box">
              <div className="wlebooks-actions-bar-box-box-box">
                <span className="wlebooks-read-now">READ NOW / পড়ুন</span>
              </div>
              <img className="wlebooks-actions-bar-box-box-box-2" src="/svg/container-s8x64t.svg" alt="" width="11" height="11" />
            </Link>
            <button type="button" onClick={() => navigate('/read/the-river-path')} className="wlebooks-actions-bar-box-box-2">
              <img className="wlebooks-actions-bar-box-box-2-box" src="/svg/container-1mwk9hg.svg" alt="" width="11" height="11" />
              <div className="wlebooks-actions-bar-box-box-2-box-2">
                <span className="wlebooks-actions-bar-box-box-2-box-2-text">DOWNLOAD FOLIO EPUB</span>
              </div>
            </button>
          </div>
          <button type="button" onClick={() => remove(1)} className="wlebooks-actions-bar-box-2">REMOVE</button>
        </div>
      </div>
      <div className="wlebooks-book-plate-cover-thumbnail">
        <div className="wlebooks-background-border-2">
          <div className="wlebooks-background-border-2-box">
            <div className="wlebooks-background-border-2-box-box">
              <span className="wlebooks-noholi-digital-press-2023">NOHOLI DIGITAL PRESS • 2023</span>
            </div>
            <h4 className="wlebooks-heading-4">The River Path</h4>
            <div className="wlebooks-background-border-2-box-box">
              <span className="wlebooks-background-border-2-box-box-text">নদীর পথ</span>
            </div>
          </div>
          <div className="wlebooks-background-border-2-box-2">
            <div className="wlebooks-horizontal-divider" />
            <div className="wlebooks-background-border-2-box-2-box">
              <span className="wlebooks-kazi-farhan">Kazi Farhan</span>
            </div>
            <div className="wlebooks-background-border-2-box-2-box-2">
              <span className="wlebooks-first-digital-foliated-edition">First Digital Foliated Edition</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-book-plate-cover-thumbnail-box">
          <div className="wlebooks-book-plate-cover-thumbnail-box-box">
            <div className="wlebooks-book-plate-cover-thumbnail-box-box-box">
              <span className="wlebooks-book-plate-cover-thumbnail-box-box-box-text">RES: VECTOR</span>
            </div>
            <div className="wlebooks-book-plate-cover-thumbnail-box-box-box">
              <span className="wlebooks-book-plate-cover-thumbnail-box-box-box-text-2">FOLIO ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </article>
  );
  cards[2] = (
    <article className="wlebooks-article-item-2-digitization-in-p">
    <div className="wlebooks-horizontalborder-2">
      <div className="wlebooks-horizontalborder-2-box">
        <div className="wlebooks-horizontalborder-2-box-box">
          <span className="wlebooks-horizontalborder-2-box-box-text">FOLIO CALL: NL-EB-0891</span>
        </div>
        <div className="wlebooks-horizontalborder-2-box-box">
          <span className="wlebooks-horizontalborder-2-box-box-text-2">|</span>
        </div>
        <div className="wlebooks-horizontalborder-2-box-box">
          <span className="wlebooks-horizontalborder-2-box-box-text-3">LETTERPRESS ARCHIVE SCAN</span>
        </div>
      </div>
      <div className="wlebooks-horizontalborder-2-box-2">
        <img className="wlebooks-horizontalborder-2-box-2-box" src="/svg/container-15bln3g.svg" alt="" width="11" height="14" />
        <div className="wlebooks-horizontalborder-2-box-2-box-2">
          <span className="wlebooks-horizontalborder-2-box-2-box-2-text">DIGITIZATION IN PROGRESS • RELEASING NEXT MONTH</span>
        </div>
      </div>
    </div>
    <div className="wlebooks-article-item-2-digitization-in-p-box">
      <div className="wlebooks-background-border-3">
        <div className="wlebooks-background-border-4">
          <div className="wlebooks-background-border-4-box">
            <div className="wlebooks-background-border-4-box-box">
              <span className="wlebooks-bengal-literary-circle-classics">BENGAL LITERARY CIRCLE<br />CLASSICS</span>
            </div>
            <h4 className="wlebooks-heading-4-2">Titash Ekti Nadir<br />Naam</h4>
            <div className="wlebooks-background-border-4-box-box-2">
              <span className="wlebooks-background-border-4-box-box-2-text">তিতাস একটি নদীর নাম</span>
            </div>
          </div>
          <div className="wlebooks-background-border-4-box-2">
            <div className="wlebooks-horizontal-divider" />
            <div className="wlebooks-background-border-4-box-2-box">
              <span className="wlebooks-advaita-mallabarman">Advaita Mallabarman</span>
            </div>
            <div className="wlebooks-background-border-4-box-2-box-2">
              <span className="wlebooks-calcutta-first-edition-facsimile">Calcutta First Edition Facsimile</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-background-border-3-box">
          <div className="wlebooks-background-border-3-box-box">
            <div className="wlebooks-background-border-3-box-box-box">
              <span className="wlebooks-background-border-3-box-box-box-text">STAGE: OCR CLEAN</span>
            </div>
            <div className="wlebooks-background-border-3-box-box-box">
              <span className="wlebooks-background-border-3-box-box-box-text-2">85% COMPLETE</span>
            </div>
          </div>
        </div>
      </div>
      <div className="wlebooks-article-item-2-digitization-in-p-box-box">
        <div className="wlebooks-article-item-2-digitization-in-p-box-box-box">
          <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-box">
            <div className="wlebooks-border">
              <span className="wlebooks-border-text">CLASSICS SERIES</span>
            </div>
            <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-box-box">
              <span className="wlebooks-article-item-2-digitization-in-p-box-box-box-box-box-text">PREVIEW READY</span>
            </div>
            <div className="wlebooks-border">
              <span className="wlebooks-border-text-2">600 DPI CAMERA SCAN</span>
            </div>
          </div>
          <h3 className="wlebooks-heading-3"><span>{"Titash Ekti Nadir Naam "}<span className="wlebooks-span-2">(তিতাস একটি নদীর{' '}<br className="soft-br" />নাম)</span></span></h3>
          <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-box-2">
            <span className="wlebooks-by-advaita-mallabarman-master-le">By Advaita Mallabarman • Master Letterpress Scan from the 1956{' '}<br className="soft-br" />Edition</span>
          </div>
          <div className="wlebooks-border-3">
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-format">FORMAT:</span>
              </div>
              <span className="wlebooks-border-3-box-text">High-Res Facsimile PDF & Text</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-estimated-release">ESTIMATED RELEASE:</span>
              </div>
              <span className="wlebooks-border-3-box-text">3 Weeks (Mid-Dec)</span>
            </div>
            <div className="wlebooks-border-3-box-2">
              <div className="wlebooks-strong">
                <span className="wlebooks-status">STATUS:</span>
              </div>
              <span className="wlebooks-border-3-box-2-text">Curatorial Proofreading & OCR Bengali Alignment</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-2">
          <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box">
            <button type="button" aria-pressed={notify} onClick={() => setNotify((v) => !v)} className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box">
              <img className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-box" src="/svg/container-1dmqtfi.svg" alt="" width="14" height="14" />
              <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-box-2">
                <span className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-box-2-text">{notify ? 'NOTIFICATION SET ✓' : 'NOTIFY ON RELEASE'}</span>
              </div>
            </button>
            <button type="button" onClick={() => navigate('/read/titash-ekti-nadir-naam')} className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-2">
              <img className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-2-box" src="/svg/container-1f92jsx.svg" alt="" width="15" height="11" />
              <div className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-2-box-2">
                <span className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-box-2-box-2-text">READ EXCERPT (CH. 1)</span>
              </div>
            </button>
          </div>
          <button type="button" onClick={() => remove(2)} className="wlebooks-article-item-2-digitization-in-p-box-box-box-2-box-2">REMOVE</button>
        </div>
      </div>
    </div>
  </article>
  );
  cards[3] = (
    <article className="wlebooks-article-item-3-rare-scan-manuscr">
    <div className="wlebooks-horizontalborder">
      <div className="wlebooks-horizontalborder-box-3">
        <div className="wlebooks-horizontalborder-box-3-box">
          <span className="wlebooks-horizontalborder-box-3-box-text">FOLIO CALL: NL-EB-0104</span>
        </div>
        <div className="wlebooks-horizontalborder-box-3-box">
          <span className="wlebooks-horizontalborder-box-3-box-text-2">|</span>
        </div>
        <div className="wlebooks-horizontalborder-box-3-box">
          <span className="wlebooks-horizontalborder-box-3-box-text-3">RARE SCAN MANUSCRIPT</span>
        </div>
      </div>
      <div className="wlebooks-horizontalborder-box-4">
        <div className="wlebooks-horizontalborder-box-4-box" />
        <div className="wlebooks-horizontalborder-box-4-box-2">
          <span className="wlebooks-horizontalborder-box-4-box-2-text">AVAILABLE IN DIGITAL STACKS</span>
        </div>
      </div>
    </div>
    <div className="wlebooks-article-item-3-rare-scan-manuscr-box">
      <div className="wlebooks-background-border-3">
        <div className="wlebooks-background-border-5">
          <div className="wlebooks-background-border-5-box">
            <div className="wlebooks-background-border-5-box-box">
              <span className="wlebooks-rare-stacks-digital-division">RARE STACKS DIGITAL DIVISION</span>
            </div>
            <h4 className="wlebooks-heading-4-2">Padma Nadir<br />Majhi</h4>
            <div className="wlebooks-background-border-5-box-box">
              <span className="wlebooks-background-border-5-box-box-text">পদ্মা নদীর মাঝি</span>
            </div>
          </div>
          <div className="wlebooks-background-border-5-box-2">
            <div className="wlebooks-horizontal-divider" />
            <div className="wlebooks-background-border-5-box-2-box">
              <span className="wlebooks-manik-bandopadhyay">Manik Bandopadhyay</span>
            </div>
            <div className="wlebooks-background-border-5-box-2-box-2">
              <span className="wlebooks-1936-archival-facsimile">1936 Archival Facsimile</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-background-border-3-box">
          <div className="wlebooks-background-border-3-box-box">
            <div className="wlebooks-background-border-3-box-box-box">
              <span className="wlebooks-background-border-3-box-box-box-text">600 DPI MASTER</span>
            </div>
            <div className="wlebooks-background-border-3-box-box-box">
              <span className="wlebooks-background-border-3-box-box-box-text-3">DIGITAL ARCHIVE</span>
            </div>
          </div>
        </div>
      </div>
      <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box">
        <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box">
          <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-box">
            <div className="wlebooks-border-4">
              <span className="wlebooks-border-4-text">DIGITAL ARCHIVE</span>
            </div>
            <div className="wlebooks-border-5">
              <span className="wlebooks-border-5-text">SCHOLARLY APPARATUS</span>
            </div>
            <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-box-box">
              <span className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-box-box-text">MANUSCRIPT REPRODUCTION</span>
            </div>
          </div>
          <h3 className="wlebooks-heading-3"><span>{"Padma Nadir Majhi "}<span className="wlebooks-span-2">(পদ্মা নদীর মাঝি)</span></span></h3>
          <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-box-2">
            <span className="wlebooks-by-manik-bandopadhyay-complete-1">By Manik Bandopadhyay • Complete 1936 Gurudas{' '}<br className="soft-br" />Chattopadhyay Edition Scan with Scholarly Footnotes</span>
          </div>
          <div className="wlebooks-border-3">
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-format">FORMAT:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Dual Page Facsimile + Text</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-file-size">FILE SIZE:</span>
              </div>
              <span className="wlebooks-border-3-box-text">28.6 MB (Lossless)</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-resolution">RESOLUTION:</span>
              </div>
              <span className="wlebooks-border-3-box-text">600 DPI Optical Scan</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-critical-notes">CRITICAL NOTES:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Annotated by Prof. S. Sen</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2">
          <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box">
            <Link to="/read/padma-nadir-majhi" className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box">
              <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box-box">
                <span className="wlebooks-launch-reader">LAUNCH READER / পড়ুন</span>
              </div>
              <img className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box-box-2" src="/svg/container-s8x64t.svg" alt="" width="11" height="11" />
            </Link>
            <button type="button" onClick={() => navigate('/read/padma-nadir-majhi')} className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box-2">
              <img className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box-2-box" src="/svg/container-1vszazw.svg" alt="" width="12" height="11" />
              <div className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box-2-box-2">
                <span className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-box-2-box-2-text">ANNOTATION LAYER</span>
              </div>
            </button>
          </div>
          <button type="button" onClick={() => remove(3)} className="wlebooks-article-item-3-rare-scan-manuscr-box-box-box-2-box-2">REMOVE</button>
        </div>
      </div>
    </div>
  </article>
  );
  cards[4] = (
    <article className="wlebooks-article-item-4-archival-reconstr">
    <div className="wlebooks-horizontalborder">
      <div className="wlebooks-horizontalborder-box-3">
        <div className="wlebooks-horizontalborder-box-3-box">
          <span className="wlebooks-horizontalborder-box-3-box-text">FOLIO CALL: NL-EB-0027</span>
        </div>
        <div className="wlebooks-horizontalborder-box-3-box">
          <span className="wlebooks-horizontalborder-box-3-box-text-2">|</span>
        </div>
        <div className="wlebooks-horizontalborder-box-3-box">
          <span className="wlebooks-horizontalborder-box-3-box-text-3">ARCHIVAL RECONSTRUCTION</span>
        </div>
      </div>
      <div className="wlebooks-horizontalborder-box-4">
        <div className="wlebooks-horizontalborder-box-4-box" />
        <div className="wlebooks-horizontalborder-box-4-box-2">
          <span className="wlebooks-horizontalborder-box-4-box-2-text">RESTORED EDITION AVAILABLE</span>
        </div>
      </div>
    </div>
    <div className="wlebooks-article-item-4-archival-reconstr-box">
      <div className="wlebooks-background-border-3">
        <div className="wlebooks-background-border-5">
          <div className="wlebooks-background-border-5-box">
            <div className="wlebooks-background-border-5-box-box">
              <span className="wlebooks-bengal-dialect-archives">BENGAL DIALECT ARCHIVES</span>
            </div>
            <h4 className="wlebooks-heading-4-2">Hansuli Banker<br />Upakatha</h4>
            <div className="wlebooks-background-border-5-box-box">
              <span className="wlebooks-background-border-5-box-box-text">হাঁসুলী বাঁকের উপকথা</span>
            </div>
          </div>
          <div className="wlebooks-background-border-5-box-2">
            <div className="wlebooks-horizontal-divider" />
            <div className="wlebooks-background-border-5-box-2-box">
              <span className="wlebooks-tarashankar-bandopadhyay">Tarashankar<br />Bandopadhyay</span>
            </div>
            <div className="wlebooks-background-border-5-box-2-box-2">
              <span className="wlebooks-restored-1947-letterpress-type">Restored 1947 Letterpress Type</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-background-border-3-box">
          <div className="wlebooks-background-border-3-box-box">
            <div className="wlebooks-background-border-3-box-box-box">
              <span className="wlebooks-background-border-3-box-box-box-text">GLOSSARY: 480 TERMS</span>
            </div>
            <div className="wlebooks-background-border-3-box-box-box">
              <span className="wlebooks-background-border-3-box-box-box-text-3">REFLOWABLE</span>
            </div>
          </div>
        </div>
      </div>
      <div className="wlebooks-article-item-4-archival-reconstr-box-box">
        <div className="wlebooks-article-item-4-archival-reconstr-box-box-box">
          <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-box">
            <div className="wlebooks-border">
              <span className="wlebooks-border-text">HERITAGE TEXT</span>
            </div>
            <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-box-box">
              <span className="wlebooks-article-item-4-archival-reconstr-box-box-box-box-box-text">INTERACTIVE GLOSSARY</span>
            </div>
            <div className="wlebooks-border">
              <span className="wlebooks-border-text-2">SOLAIMAN LIPI TYPESET</span>
            </div>
          </div>
          <h3 className="wlebooks-heading-3"><span>{"Hansuli Banker Upakatha "}<span className="wlebooks-span-2">(হাঁসুলী বাঁকের{' '}<br className="soft-br" />উপকথা)</span></span></h3>
          <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-box-2">
            <span className="wlebooks-by-tarashankar-bandopadhyay-digi">By Tarashankar Bandopadhyay • Digital Typeset with Rarh{' '}<br className="soft-br" />Regional Dialect Etymological Apparatus</span>
          </div>
          <div className="wlebooks-border-3">
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-format">FORMAT:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Reflowable Typography (EPUB3)</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-file-size">FILE SIZE:</span>
              </div>
              <span className="wlebooks-border-3-box-text">9.8 MB</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-annotations">ANNOTATIONS:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Folk Dialect Glossary Linked</span>
            </div>
            <div className="wlebooks-border-3-box">
              <div className="wlebooks-strong">
                <span className="wlebooks-license">LICENSE:</span>
              </div>
              <span className="wlebooks-border-3-box-text">Noholi Patron Research Permit</span>
            </div>
          </div>
        </div>
        <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-2">
          <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box">
            <Link to="/read/hansuli-banker-upakatha" className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box">
              <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box-box">
                <span className="wlebooks-read-now">READ NOW / পড়ুন</span>
              </div>
              <img className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box-box-2" src="/svg/container-s8x64t.svg" alt="" width="11" height="11" />
            </Link>
            <button type="button" onClick={() => navigate('/read/hansuli-banker-upakatha')} className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box-2">
              <img className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box-2-box" src="/svg/container-1e5safb.svg" alt="" width="15" height="14" />
              <div className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box-2-box-2">
                <span className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-box-2-box-2-text">VIEW GLOSSARY</span>
              </div>
            </button>
          </div>
          <button type="button" onClick={() => remove(4)} className="wlebooks-article-item-4-archival-reconstr-box-box-box-2-box-2">REMOVE</button>
        </div>
      </div>
    </div>
  </article>
  );

  return (
    <div className="wlebooks">
      <section className="wlebooks-main">
        <div className="wlebooks-main-box">
          <div className="wlebooks-top-archival-register-breadcrumb">
            <div className="wlebooks-top-archival-register-breadcrumb-box">
              <div className="wlebooks-top-archival-register-breadcrumb-box-box">
                <Link to="/" className="wlebooks-top-archival-register-breadcrumb-box-box-box">HOME</Link>
                <div className="wlebooks-top-archival-register-breadcrumb-box-box-box-2">
                  <span className="wlebooks-top-archival-register-breadcrumb-box-box-box-2-text">/</span>
                </div>
                <Link to="/wishlist/books" className="wlebooks-top-archival-register-breadcrumb-box-box-box">WISHLIST</Link>
                <div className="wlebooks-top-archival-register-breadcrumb-box-box-box-2">
                  <span className="wlebooks-top-archival-register-breadcrumb-box-box-box-2-text">/</span>
                </div>
                <div className="wlebooks-top-archival-register-breadcrumb-box-box-box-2">
                  <span className="wlebooks-e-books-wishlist">E-BOOKS WISHLIST (ই-বুক উইশলিস্ট)</span>
                </div>
              </div>
              <div className="wlebooks-top-archival-register-breadcrumb-box-box-2">
                <div className="wlebooks-top-archival-register-breadcrumb-box-box-2-box" />
                <div className="wlebooks-top-archival-register-breadcrumb-box-box-2-box-2">
                  <span className="wlebooks-top-archival-register-breadcrumb-box-box-2-box-2-text">DIGITAL REPOSITORY & SCANNED FOLIOS • DIVISION II</span>
                </div>
              </div>
            </div>
          </div>
          <section className="wlebooks-page-header-broadside-colophon-b">
            <div className="wlebooks-page-header-broadside-colophon-b-box">
              <div className="wlebooks-left-broadside-heading-abstract">
                <div className="wlebooks-left-broadside-heading-abstract-box">
                  <div className="wlebooks-left-broadside-heading-abstract-box-box">
                    <span className="wlebooks-left-broadside-heading-abstract-box-box-text">FACSIMILE & EPUB REGISTER</span>
                  </div>
                  <div className="wlebooks-left-broadside-heading-abstract-box-box-2">
                    <span className="wlebooks-left-broadside-heading-abstract-box-box-2-text">DESK HOLDINGS: 5 ACTIVE ELECTRONIC VOLUMES</span>
                  </div>
                </div>
                <div className="wlebooks-left-broadside-heading-abstract-box-2">
                  <h1 className="wlebooks-heading-1">Patron E-Books Wishlist &<br />Digitization Requests</h1>
                </div>
                <div className="wlebooks-left-broadside-heading-abstract-box-3">
                  <span className="wlebooks-left-broadside-heading-abstract-box-3-text">ই-বুক উইশলিস্ট ও ডিজিটাল সংস্করণ সংগ্রহের প্রস্তাবনা</span>
                </div>
                <div className="wlebooks-left-broadside-heading-abstract-box-4">
                  <div className="wlebooks-left-broadside-heading-abstract-box-4-box">
                    <span className="wlebooks-curate-your-saved-electronic-man">Curate your saved electronic manuscripts, launch digital reader folios with typographic customization,{' '}<br className="soft-br" />and recommend out-of-print or rare Bengali texts for high-resolution scanning, lossless preservation,{' '}<br className="soft-br" />and OCR digitization.</span>
                  </div>
                </div>
              </div>
              <div className="wlebooks-right-digital-folio-stacks-regis">
                <div className="wlebooks-horizontalborder">
                  <div className="wlebooks-horizontalborder-box">
                    <span className="wlebooks-horizontalborder-box-text">DIGITAL FOLIO REGISTER</span>
                  </div>
                  <div className="wlebooks-horizontalborder-box-2">
                    <span className="wlebooks-horizontalborder-box-2-text">5 ACTIVE READS</span>
                  </div>
                </div>
                <div className="wlebooks-right-digital-folio-stacks-regis-box">
                  <div className="wlebooks-right-digital-folio-stacks-regis-box-box">
                    <div className="wlebooks-right-digital-folio-stacks-regis-box-box-box">
                      <span className="wlebooks-archive-code">ARCHIVE CODE</span>
                    </div>
                    <span className="wlebooks-right-digital-folio-stacks-regis-box-box-text">Dhaka-E-Stacks-B</span>
                  </div>
                  <div className="wlebooks-right-digital-folio-stacks-regis-box-box">
                    <div className="wlebooks-right-digital-folio-stacks-regis-box-box-box">
                      <span className="wlebooks-ocr-engine">OCR ENGINE</span>
                    </div>
                    <span className="wlebooks-right-digital-folio-stacks-regis-box-box-text">Tesseract-Bengali v5</span>
                  </div>
                  <div className="wlebooks-right-digital-folio-stacks-regis-box-box-2">
                    <div className="wlebooks-right-digital-folio-stacks-regis-box-box-2-box">
                      <span className="wlebooks-master-format">MASTER FORMAT</span>
                    </div>
                    <span className="wlebooks-right-digital-folio-stacks-regis-box-box-2-text">EPUB3 / Archival PDF / OCR Facsimile</span>
                  </div>
                </div>
                <div className="wlebooks-right-digital-folio-stacks-regis-box-2">
                  <div className="wlebooks-background-border">
                    <div className="wlebooks-background-border-box">
                      <img className="wlebooks-background-border-box-box" src="/svg/container-1why4z6.svg" alt="" width="11" height="14" />
                      <div className="wlebooks-background-border-box-box-2">
                        <span className="wlebooks-background-border-box-box-2-text">TERMINAL ACCESS PASS</span>
                      </div>
                    </div>
                    <div className="wlebooks-background-border-box-2">
                      <span className="wlebooks-full-digital-reading-privileges">Full digital reading privileges active for Patron{' '}<br className="soft-br" /><span className="wlebooks-span">#NL-88204</span>. All offline folios synced.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="wlebooks-main-content-grid">
            <div className="wlebooks-main-content-grid-box">
              <section className="wlebooks-main-left-column-e-books-wishlis">
                <section className="wlebooks-section-header-sort-ledger-contr">
                  <div className="wlebooks-section-header-sort-ledger-contr-box">
                    <h2 className="wlebooks-heading-2">
                      <span className="wlebooks-heading-2-text">{"In My E-Books Wishlist "}</span>
                      <span className="wlebooks-heading-2-text-2">(সংরক্ষিত ই-বুক তালিকা)</span>
                    </h2>
                    <div className="wlebooks-section-header-sort-ledger-contr-box-box">
                      <span className="wlebooks-section-header-sort-ledger-contr-box-box-text">Preserved items ready for web folios, local cache, or reading queue.</span>
                    </div>
                  </div>
                  <div className="wlebooks-section-header-sort-ledger-contr-box-2">
                    <label className="wlebooks-label" htmlFor="wlebooks-sort">SORT BY:</label>
                    <div className="wlebooks-section-header-sort-ledger-contr-box-2-box">
                      <OverlaySelect id="wlebooks-sort" name="sort" value={sort} onChange={setSort} options={SORTS} />
                      <div className="wlebooks-options">
                        <div className="wlebooks-options-box">
                          <span className="wlebooks-options-box-text">{SORTS.find((o) => o.value === sort).label}</span>
                        </div>
                      </div>
                      <img className="wlebooks-section-header-sort-ledger-contr-box-2-box-box" src="/svg/container-5anvoh.svg" alt="" width="7" height="16" />
                    </div>
                  </div>
                </section>
                <div className="wlebooks-wishlist-items-list">
                  {SORTS.find((o) => o.value === sort).order.filter((n) => !removed.includes(n)).map((n) => <Fragment key={n}>{cards[n]}</Fragment>)}
                </div>
                <div className="wlebooks-bottom-archival-reading-notice-b">
                  <div className="wlebooks-bottom-archival-reading-notice-b-2">
                    <div className="wlebooks-bottom-archival-reading-notice-b-2-box">
                      <img className="wlebooks-bottom-archival-reading-notice-b-2-box-box" src="/svg/icon-16636pj.svg" alt="" width="16" height="22" />
                      <div className="wlebooks-bottom-archival-reading-notice-b-2-box-box-2">
                        <div className="wlebooks-bottom-archival-reading-notice-b-2-box-box-2-box">
                          <span className="wlebooks-bottom-archival-reading-notice-b-2-box-box-2-box-text">PATRON DIGITAL READING NOTICE & REPOSITORY POLICY</span>
                        </div>
                        <div className="wlebooks-bottom-archival-reading-notice-b-2-box-box-2-box">
                          <span className="wlebooks-bottom-archival-reading-notice-b-2-box-box-2-box-text-2">All electronic editions hosted on Noholi Library are formatted with custom Bengali typography (Noto Serif{' '}<br className="soft-br" />Bengali and SolaimanLipi). Digital watermarking with your accession credential (<span className="wlebooks-span">#NL-88204</span>) applies to all{' '}<br className="soft-br" />patron folio exports under the Noholi Intellectual Charter. Facsimiles are restricted to non-commercial{' '}<br className="soft-br" />scholarly research.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="wlebooks-aside-right-column-requests-prop">
                <div className="wlebooks-card-1-digitization-e-book-recom">
                  <div className="wlebooks-card-header">
                    <div className="wlebooks-card-header-box">
                      <img className="wlebooks-card-header-box-box" src="/svg/container-thqrmh.svg" alt="" width="15" height="15" />
                      <div className="wlebooks-card-header-box-box-2">
                        <span className="wlebooks-card-header-box-box-2-text">ARCHIVAL DESK REQUEST</span>
                      </div>
                    </div>
                    <h3 className="wlebooks-heading-3-2">Recommend an E-Book or<br />Digitization Project</h3>
                    <div className="wlebooks-card-header-box-2">
                      <span className="wlebooks-card-header-box-2-text">নতুন ই-বুক বা ডিজিটাল স্ক্যান প্রস্তাবনা জমা দিন</span>
                    </div>
                  </div>
                  <div className="wlebooks-explanatory-copy">
                    <span className="wlebooks-help-expand-our-digital-collecti">Help expand our digital collections. Propose rare{' '}<br className="soft-br" />Bengali texts, historical journals, poetry{' '}<br className="soft-br" />collections, or academic volumes that require{' '}<br className="soft-br" />preservation scanning or e-book conversion.</span>
                  </div>
                  <form className="wlebooks-proposal-form" onSubmit={onSubmit} noValidate>
                    <div className="wlebooks-title-field">
                      <label className="wlebooks-label-2" htmlFor="wlebooks-book-title"><span>{"BOOK TITLE (LATIN OR BENGALI) "}<span className="wlebooks-span-3">*</span></span></label>
                      <input id="wlebooks-book-title" name="book-title" required className="wlebooks-input" placeholder="e.g. সঞ্চয়িতা (Sanchayita) or Pather Panchali" />
                    </div>
                    <div className="wlebooks-author-field">
                      <label className="wlebooks-label-2" htmlFor="wlebooks-original-author"><span>{"ORIGINAL AUTHOR "}<span className="wlebooks-span-3">*</span></span></label>
                      <input id="wlebooks-original-author" name="original-author" required className="wlebooks-input-2" placeholder="e.g. Rabindranath Tagore or Bibhutibhushan" />
                    </div>
                    <div className="wlebooks-preferred-format">
                      <label className="wlebooks-label-2" htmlFor="wlebooks-format">PREFERRED FORMAT (OPTIONAL)</label>
                      <div className="wlebooks-preferred-format-box">
                        <OverlaySelect id="wlebooks-format" name="format" value={format} onChange={setFormat} options={FORMATS} />
                        <div className="wlebooks-options-2">
                          <div className="wlebooks-options-2-box">
                            <span className="wlebooks-options-2-box-text">{FORMATS.find((o) => o.value === format).label}</span>
                          </div>
                        </div>
                        <img className="wlebooks-preferred-format-box-box" src="/svg/container-4zwask.svg" alt="" width="8" height="16" />
                      </div>
                    </div>
                    <div className="wlebooks-publication-year-edition-source">
                      <label className="wlebooks-label-2" htmlFor="wlebooks-original-publication-year-or-edi">ORIGINAL PUBLICATION YEAR OR EDITION SOURCE</label>
                      <input id="wlebooks-original-publication-year-or-edi" name="original-publication-year-or-edi" className="wlebooks-input-3" placeholder="e.g. 1928 Bangiya Sahitya Parishat 1st Edition" />
                    </div>
                    <div className="wlebooks-scholarly-justification-textarea">
                      <label className="wlebooks-label-2" htmlFor="wlebooks-why-should-the-library-digitize"><span>WHY SHOULD THE LIBRARY DIGITIZE THIS WORK?{' '}<br className="soft-br" /><span className="wlebooks-span-3">*</span></span></label>
                      <textarea id="wlebooks-why-should-the-library-digitize" name="why-should-the-library-digitize" required className="wlebooks-textarea" placeholder={"Describe scholarly importance, rarity of physical \ncopies in Bengal stacks, dialect preservation, or \nurgent deterioration concerns..."} />
                    </div>
                    <div className="wlebooks-submit-button">
                      <button type="submit" className="wlebooks-submit-button-2">
                        <div className="wlebooks-submit-button-2-box">
                          <span className="wlebooks-submit-e-book-request">SUBMIT E-BOOK REQUEST / ই-বুক<br />প্রস্তাব জমা দিন</span>
                        </div>
                        <img className="wlebooks-submit-button-2-box-2" src="/svg/container-bku1er.svg" alt="" width="15" height="12" />
                      </button>
                    </div>
                    <div className="wlebooks-proposal-form-box">
                      <span className="wlebooks-proposal-form-box-text">Digitization and acquisition proposals are adjudicated{' '}<br className="soft-br" />monthly by the Noholi Digital Archives Board.</span>
                    </div>
                    <Status status={status} />
                  </form>
                </div>
                <div className="wlebooks-card-2-my-digitization-proposals">
                  <div className="wlebooks-horizontalborder">
                    <div className="wlebooks-horizontalborder-box">
                      <h4 className="wlebooks-heading-4-3">My Digitization<br />Proposals</h4>
                      <div className="wlebooks-horizontalborder-box-box">
                        <span className="wlebooks-horizontalborder-box-box-text">আমার পূর্বের প্রস্তাবনাসমূহ</span>
                      </div>
                    </div>
                    <div className="wlebooks-background-border-6">
                      <span className="wlebooks-background-border-6-text">2<br />TRACKED</span>
                    </div>
                  </div>
                  <div className="wlebooks-card-2-my-digitization-proposals-box">
                    <div className="wlebooks-proposal-a">
                      <div className="wlebooks-proposal-a-box">
                        <div className="wlebooks-proposal-a-box-box">
                          <span className="wlebooks-proposal-a-box-box-text">{"Aranyak "}<span className="wlebooks-span-4">(আরণ্যক)</span></span>
                        </div>
                        <div className="wlebooks-background-border-7">
                          <span className="wlebooks-background-border-7-text">APPROVED</span>
                        </div>
                      </div>
                      <div className="wlebooks-proposal-a-box-2">
                        <span className="wlebooks-author-bibhutibhushan-bandopadhy">{"Author: "}<span className="wlebooks-span">Bibhutibhushan Bandopadhyay</span></span>
                      </div>
                      <div className="wlebooks-background-border-8">
                        <div className="wlebooks-background-border-8-box">
                          <img className="wlebooks-background-border-8-box-box" src="/svg/container-i1n03g.svg" alt="" width="11" height="12" />
                          <div className="wlebooks-background-border-8-box-box-2">
                            <span className="wlebooks-background-border-8-box-box-2-text">PRESERVATION SCANNING SCHEDULED</span>
                          </div>
                        </div>
                        <span className="wlebooks-background-border-8-text">{"Target intake: Autumn 2026. Ref: "}</span>
                        <span className="wlebooks-background-border-8-text-2">#ED-2025-88</span>
                      </div>
                    </div>
                    <div className="wlebooks-proposal-b">
                      <div className="wlebooks-proposal-b-box">
                        <div className="wlebooks-proposal-b-box-box">
                          <span className="wlebooks-proposal-b-box-box-text">{"Lalshalu "}<span className="wlebooks-span-4">(লালসালু)</span></span>
                        </div>
                        <div className="wlebooks-background-border-9">
                          <span className="wlebooks-background-border-9-text">IN REVIEW</span>
                        </div>
                      </div>
                      <div className="wlebooks-proposal-b-box-2">
                        <span className="wlebooks-author-syed-waliullah">{"Author: "}<span className="wlebooks-span">Syed Waliullah</span></span>
                      </div>
                      <div className="wlebooks-background-border-10">
                        <div className="wlebooks-background-border-10-box">
                          <img className="wlebooks-background-border-10-box-box" src="/svg/container-1pcnssy.svg" alt="" width="11" height="12" />
                          <div className="wlebooks-background-border-10-box-box-2">
                            <span className="wlebooks-background-border-10-box-box-2-text">CURATORIAL STAGE</span>
                          </div>
                        </div>
                        <span className="wlebooks-background-border-10-text">{"Under Rights & Copyright Clearance. Ref: "}</span>
                        <span className="wlebooks-background-border-10-text-2">#ED-</span>
                        <span className="wlebooks-background-border-10-text-3">2026-09</span>
                      </div>
                    </div>
                  </div>
                  <div className="wlebooks-horizontalborder-3">
                    <Link to="/rules" className="wlebooks-horizontalborder-3-box">
                      <div className="wlebooks-horizontalborder-3-box-box">
                        <span className="wlebooks-horizontalborder-3-box-box-text">VIEW DIGITIZATION CRITERIA & POLICY</span>
                      </div>
                      <img className="wlebooks-horizontalborder-3-box-box-2" src="/svg/container-nkuhlc.svg" alt="" width="9" height="9" />
                    </Link>
                  </div>
                </div>
                <div className="wlebooks-card-3-noholi-digital-scanning-s">
                  <img className="wlebooks-bookplate-vignette-graphic" src="/svg/bookplate-vignette-graphic-1i1e2ar.svg" alt="" width="48" height="48" />
                  <div className="wlebooks-card-3-noholi-digital-scanning-s-box">
                    <div className="wlebooks-card-3-noholi-digital-scanning-s-box-box">
                      <span className="wlebooks-card-3-noholi-digital-scanning-s-box-box-text">NOHOLI DIGITAL SCANNING SUITE SEAL</span>
                    </div>
                    <div className="wlebooks-card-3-noholi-digital-scanning-s-box-box">
                      <span className="wlebooks-card-3-noholi-digital-scanning-s-box-box-text-2">Archival Optical Preservation Standards</span>
                    </div>
                  </div>
                  <div className="wlebooks-card-3-noholi-digital-scanning-s-box-2">
                    <div className="wlebooks-horizontal-divider-2" />
                  </div>
                  <div className="wlebooks-card-3-noholi-digital-scanning-s-box-3">
                    <span className="wlebooks-card-3-noholi-digital-scanning-s-box-3-text">Calibrated with Zeutschel overhead book scanners{' '}<br className="soft-br" />at 600 DPI optical resolution with lossless archival{' '}<br className="soft-br" />preservation, acid-free cradle support, and{' '}<br className="soft-br" />automated text layer alignment.</span>
                  </div>
                  <span className="wlebooks-card-3-noholi-digital-scanning-s-text">ISO/TR 13028 HERITAGE SCAN SPEC</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
