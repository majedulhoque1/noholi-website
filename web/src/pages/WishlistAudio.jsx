import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ComingSoon, SOON_REQUEST, Status, useSubmission } from './memberStudio.jsx';
import './WishlistAudio.css';

const SORTS = [
  { label: 'ACCESSION DATE', order: [1, 2, 3, 4] },
  { label: 'TITLE (A–Z)', order: [4, 3, 1, 2] },
];
const REQUIRED = [
  ['book-title', 'book title'],
  ['original-author', 'original author'],
];

// Generated from Figma frame "Noholi Library — Audio Books Wishlist & Studio Requests (After login)" (126:6298) by tools/gen_member.py, then hand-edited.
export default function WishlistAudio() {
  const { member } = useAuth();
  const [sort, setSort] = useState(0);
  // Audio wishlists and recording proposals have no backend yet: honest "coming soon" states.
  const { status, submit } = useSubmission(REQUIRED, SOON_REQUEST, { ok: false });
  const onSubmit = (e) => submit(e);

  return (
    <div className="wlaudio">
      <section className="wlaudio-main">
        <div className="wlaudio-main-box">
          <section className="wlaudio-folio-header-breadcrumbs-strip">
            <div className="wlaudio-folio-header-breadcrumbs-strip-box">
              <nav className="wlaudio-nav">
                <Link to="/" className="wlaudio-nav-box">HOME</Link>
                <div className="wlaudio-nav-box-2">
                  <span className="wlaudio-nav-box-2-text">/</span>
                </div>
                <Link to="/wishlist/books" className="wlaudio-nav-box">WISHLIST</Link>
                <div className="wlaudio-nav-box-2">
                  <span className="wlaudio-nav-box-2-text">/</span>
                </div>
                <div className="wlaudio-nav-box-2">
                  <span className="wlaudio-nav-box-2-text-2">AUDIO BOOKS WISHLIST (অডিও বুকের উইশলিস্ট)</span>
                </div>
              </nav>
              <div className="wlaudio-folio-header-breadcrumbs-strip-box-box">
                <div className="wlaudio-folio-header-breadcrumbs-strip-box-box-box" />
                <div className="wlaudio-folio-header-breadcrumbs-strip-box-box-box-2">
                  <span className="wlaudio-folio-header-breadcrumbs-strip-box-box-box-2-text">ARCHIVAL SOUND DEPOSITORY • DIVISION IV</span>
                </div>
              </div>
            </div>
          </section>
          <section className="wlaudio-title-scholarly-foreword">
            <div className="wlaudio-title-scholarly-foreword-box">
              <div className="wlaudio-title-scholarly-foreword-box-box">
                <div className="wlaudio-title-scholarly-foreword-box-box-box">
                  <div className="wlaudio-title-scholarly-foreword-box-box-box-box">
                    <div className="wlaudio-title-scholarly-foreword-box-box-box-box-box">
                      <span className="wlaudio-title-scholarly-foreword-box-box-box-box-box-text">PATRON LISTENING REGISTER & STUDIO DESK</span>
                    </div>
                    <div className="wlaudio-title-scholarly-foreword-box-box-box-box-box">
                      <span className="wlaudio-title-scholarly-foreword-box-box-box-box-box-text-2">•</span>
                    </div>
                    <div className="wlaudio-title-scholarly-foreword-box-box-box-box-box">
                      <span className="wlaudio-title-scholarly-foreword-box-box-box-box-box-text-3">Foliated Audio Dossier #AB-2026</span>
                    </div>
                  </div>
                </div>
                <div className="wlaudio-title-scholarly-foreword-box-box-box-2">
                  <h1 className="wlaudio-heading-1">Patron Audio Books Wishlist & Production{' '}<br className="soft-br" />Requests</h1>
                </div>
                <div className="wlaudio-title-scholarly-foreword-box-box-box-3">
                  <div className="wlaudio-title-scholarly-foreword-box-box-box-3-box">
                    <span className="wlaudio-title-scholarly-foreword-box-box-box-3-box-text">অডিও বুক উইশলিস্ট ও নতুন রেকর্ডিং প্রস্তাবনা</span>
                  </div>
                </div>
                <div className="wlaudio-title-scholarly-foreword-box-box-box-4">
                  <span className="wlaudio-title-scholarly-foreword-box-box-box-4-text">Curate your preserved spoken-word manuscripts, listen to master analog tape restorations, and submit{' '}<br className="soft-br" />literary titles to the Noholi Spoken Audio Studio for archival production or preservation remastering.</span>
                </div>
              </div>
              <div className="wlaudio-title-scholarly-foreword-box-box-2">
                <div className="wlaudio-background-border">
                  <div className="wlaudio-horizontalborder">
                    <div className="wlaudio-horizontalborder-box">
                      <span className="wlaudio-horizontalborder-box-text">STUDIO MASTER REGISTER</span>
                    </div>
                    <div className="wlaudio-horizontalborder-box">
                      <span className="wlaudio-horizontalborder-box-text-2">0 ACTIVE ENTRIES</span>
                    </div>
                  </div>
                  <div className="wlaudio-background-border-box">
                    <div className="wlaudio-background-border-box-box">
                      <div className="wlaudio-background-border-box-box-box">
                        <span className="wlaudio-archive-code">ARCHIVE CODE</span>
                      </div>
                      <span className="wlaudio-background-border-box-box-text">Dhaka-Studio-A</span>
                    </div>
                    <div className="wlaudio-background-border-box-box">
                      <div className="wlaudio-background-border-box-box-box">
                        <span className="wlaudio-master-format">MASTER FORMAT</span>
                      </div>
                      <span className="wlaudio-background-border-box-box-text">96kHz / 24-bit PCM</span>
                    </div>
                    <div className="wlaudio-horizontalborder-2">
                      <div className="wlaudio-horizontalborder-2-box">
                        <span className="wlaudio-unrestricted-listening-privilege">Listening privileges for Patron #{member?.cardNumber}{' '}<br className="soft-br" />open with the audio library.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="wlaudio-main-content-grid">
            <div className="wlaudio-main-content-grid-box">
              <div className="wlaudio-left-column-wishlist-entries">
                <div className="wlaudio-left-column-wishlist-entries-box">
                  <div className="wlaudio-horizontalborder-3">
                    <p className="wlaudio-paragraph">
                      <span className="wlaudio-heading-2">In My Audio Wishlist</span>
                      <span className="wlaudio-paragraph-text">সংরক্ষিত অডিও গ্রন্থতালিকা</span>
                    </p>
                    <div className="wlaudio-horizontalborder-3-box">
                      <div className="wlaudio-horizontalborder-3-box-box">
                        <span className="wlaudio-horizontalborder-3-box-box-text">SORT BY:</span>
                      </div>
                      <div className="wlaudio-horizontalborder-3-box-box">
                        <button type="button" aria-label="Change sort order" onClick={() => setSort((v) => (v + 1) % SORTS.length)} className="wlaudio-horizontalborder-3-box-box-text-2">{SORTS[sort].label}</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="wlaudio-entries-container">
                  <ComingSoon
                    title="Your audio wishlist is coming soon"
                    action={<Link to="/audio-books" className="studio-soon-action">SEE THE AUDIO BOOKS →</Link>}
                  >
                    Saving audio books to listen to later is not available yet. Nothing has been saved to your account.
                  </ComingSoon>
                </div>
                <div className="wlaudio-bottom-archival-note">
                  <div className="wlaudio-bottom-archival-note-2">
                    <img className="wlaudio-bottom-archival-note-2-box" src="/svg/icon-kc958c.svg" alt="" width="20" height="22" />
                    <p className="wlaudio-paragraph-2">
                      <span className="wlaudio-paragraph-2-text">PATRON ARCHIVAL LISTENING NOTICE</span>
                      <span className="wlaudio-paragraph-2-text-2">All audiobooks streamed via Noholi Library are digitized from original letterpress{' '}<br className="soft-br" />editions and historic spoken archives. Recordings marked as "Restored Edition" preserve{' '}<br className="soft-br" />the original room reverberance and vocal tone of historical narrators.</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="wlaudio-right-column-recommend-for-produ">
                <div className="wlaudio-recommendation-form-panel">
                  <div className="wlaudio-horizontalborder-4">
                    <div className="wlaudio-horizontalborder-4-box">
                      <span className="wlaudio-noholi-spoken-audio-studio-desk">NOHOLI SPOKEN AUDIO STUDIO DESK</span>
                    </div>
                    <h2 className="wlaudio-heading-2-2">Recommend an Audio Book for<br />Production or Acquisition</h2>
                    <div className="wlaudio-horizontalborder-4-box-2">
                      <span className="wlaudio-horizontalborder-4-box-2-text">নতুন অডিও বুক রেকর্ডিংয়ের প্রস্তাবনা জমা দিন</span>
                    </div>
                  </div>
                  <div className="wlaudio-recommendation-form-panel-box">
                    <span className="wlaudio-help-determine-the-next-titles-p">Help determine the next titles preserved by our recording{' '}<br className="soft-br" />press. Propose critical Bengali novels, poetry collections, or{' '}<br className="soft-br" />research tracts for studio narration.</span>
                  </div>
                  <form className="wlaudio-form" onSubmit={onSubmit} noValidate>
                    <div className="wlaudio-field-book-title">
                      <label className="wlaudio-label" htmlFor="wlaudio-book-title"><span>{"BOOK TITLE (LATIN OR BENGALI) "}<span className="wlaudio-span-3">*</span></span></label>
                      <input id="wlaudio-book-title" name="book-title" required className="wlaudio-input" placeholder="e.g. চাঁদের পাহাড় (Chander Pahar) or Gora" />
                    </div>
                    <div className="wlaudio-field-original-author">
                      <label className="wlaudio-label" htmlFor="wlaudio-original-author"><span>{"ORIGINAL AUTHOR "}<span className="wlaudio-span-3">*</span></span></label>
                      <input id="wlaudio-original-author" name="original-author" required className="wlaudio-input-2" placeholder="e.g. Bibhutibhushan Bandopadhyay or Rabindranath Tagore" />
                    </div>
                    <div className="wlaudio-field-desired-narrator">
                      <label className="wlaudio-label" htmlFor="wlaudio-desired-narrator-voice-artist"><span>{"DESIRED NARRATOR / VOICE ARTIST "}<span className="wlaudio-span-4">(OPTIONAL)</span></span></label>
                      <input id="wlaudio-desired-narrator-voice-artist" name="desired-narrator-voice-artist" className="wlaudio-input-3" placeholder="Prefer dramatic voice / কথাসাহিত্য কণ্ঠশিল্পী" />
                      <div className="wlaudio-field-desired-narrator-box">
                        <span className="wlaudio-specify-preferred-cadence">Specify preferred cadence (e.g. baritone, classical elocutionist,{' '}<br className="soft-br" />theatrical).</span>
                      </div>
                    </div>
                    <div className="wlaudio-field-publication-year-source-ed">
                      <label className="wlaudio-label" htmlFor="wlaudio-publication-year-or-source-editi"><span>{"PUBLICATION YEAR OR SOURCE EDITION "}<span className="wlaudio-span-4">(OPTIONAL)</span></span></label>
                      <input id="wlaudio-publication-year-or-source-editi" name="publication-year-or-source-editi" className="wlaudio-input-4" placeholder="e.g. 1937 Mitra & Ghosh First Edition" />
                    </div>
                    <div className="wlaudio-field-justification">
                      <label className="wlaudio-label" htmlFor="wlaudio-why-should-the-library-produce-o">WHY SHOULD THE LIBRARY PRODUCE OR ACQUIRE THIS{' '}<br className="soft-br" />AUDIOBOOK?</label>
                      <textarea id="wlaudio-why-should-the-library-produce-o" name="why-should-the-library-produce-o" className="wlaudio-textarea" placeholder={"Note scholarly significance, linguistic value, or oral \nhistory accessibility needs..."} />
                    </div>
                    <button type="submit" className="wlaudio-submit-button-in-brand-sealing-w">
                      <div className="wlaudio-submit-button-in-brand-sealing-w-box">
                        <span className="wlaudio-submit-button-in-brand-sealing-w-box-text">SUBMIT AUDIO BOOK REQUEST / অডিও বুক প্রস্তাব{' '}<br className="soft-br" />জমা দিন</span>
                      </div>
                      <img className="wlaudio-submit-button-in-brand-sealing-w-box-2" src="/svg/container-1ffsp6i.svg" alt="" width="13" height="11" />
                    </button>
                    <div className="wlaudio-paragraph-horizontalborder">
                      <span className="wlaudio-paragraph-horizontalborder-text">Proposals are adjudicated every month by the Noholi Sound &</span>
                      <span className="wlaudio-paragraph-horizontalborder-text">Literature Board.</span>
                    </div>
                    <Status status={status} />
                  </form>
                </div>
                <div className="wlaudio-my-audio-recording-proposals-led">
                  <div className="wlaudio-horizontalborder-5">
                    <p className="wlaudio-paragraph">
                      <span className="wlaudio-heading-3-4">My Audio Recording Proposals</span>
                      <span className="wlaudio-paragraph-text">আমার পূর্বের প্রস্তাবনাসমূহ</span>
                    </p>
                    <div className="wlaudio-background-border-5">
                      <span className="wlaudio-background-border-5-text">0 Tracked</span>
                    </div>
                  </div>
                  <div className="wlaudio-my-audio-recording-proposals-led-box">
                    <ComingSoon title="No recording proposals yet">
                      Proposing audio books online is coming soon. Until then, suggest titles at the circulation desk.
                    </ComingSoon>
                  </div>
                  <div className="wlaudio-archival-folio-footer-in-sidebar">
                    <Link to="/rules" className="wlaudio-archival-folio-footer-in-sidebar-box">
                      <div className="wlaudio-archival-folio-footer-in-sidebar-box-box">
                        <span className="wlaudio-archival-folio-footer-in-sidebar-box-box-text">VIEW FULL PRODUCTION GUIDELINES</span>
                      </div>
                      <img className="wlaudio-archival-folio-footer-in-sidebar-box-box-2" src="/svg/container-yovyrz.svg" alt="" width="9" height="9" />
                    </Link>
                  </div>
                </div>
                <div className="wlaudio-studio-equipment-quality-seal">
                  <div className="wlaudio-studio-equipment-quality-seal-box">
                    <img className="wlaudio-studio-equipment-quality-seal-box-box" src="/svg/background-mq7vyh.svg" alt="" width="40" height="40" />
                    <div className="wlaudio-studio-equipment-quality-seal-box-box-2">
                      <div className="wlaudio-studio-equipment-quality-seal-box-box-2-box">
                        <span className="wlaudio-studio-equipment-quality-seal-box-box-2-box-text">NOHOLI SPOKEN AUDIO MASTER SEAL</span>
                      </div>
                      <div className="wlaudio-studio-equipment-quality-seal-box-box-2-box">
                        <span className="wlaudio-studio-equipment-quality-seal-box-box-2-box-text-2">Calibrated with Neumann U87 microphones & Studer analog{' '}<br className="soft-br" />preamps.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
