import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ComingSoon, OverlaySelect, SOON_REQUEST, Status, useSubmission } from './memberStudio.jsx';
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
  const { member } = useAuth();
  const [sort, setSort] = useState('latest');
  const [format, setFormat] = useState('both');
  // E-book wishlists and digitisation proposals have no backend yet: honest "coming soon" states.
  const { status, submit } = useSubmission(REQUIRED, SOON_REQUEST, { ok: false });
  const onSubmit = (e) => submit(e);

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
                      <span className="wlebooks-full-digital-reading-privileges">Full digital reading privileges active for Patron{' '}<br className="soft-br" /><span className="wlebooks-span">#{member?.cardNumber}</span> once digital lending opens.</span>
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
                  <ComingSoon
                    title="Your e-book wishlist is coming soon"
                    action={<Link to="/e-books" className="studio-soon-action">SEE THE E-BOOKS →</Link>}
                  >
                    Saving e-books to read later is not available yet. Nothing has been saved to your account.
                  </ComingSoon>
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
                          <span className="wlebooks-bottom-archival-reading-notice-b-2-box-box-2-box-text-2">All electronic editions hosted on Noholi Library are formatted with custom Bengali typography (Noto Serif{' '}<br className="soft-br" />Bengali and SolaimanLipi). Digital watermarking with your accession credential (<span className="wlebooks-span">#{member?.cardNumber}</span>) applies to all{' '}<br className="soft-br" />patron folio exports under the Noholi Intellectual Charter. Facsimiles are restricted to non-commercial{' '}<br className="soft-br" />scholarly research.</span>
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
