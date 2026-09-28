import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './BorrowRequest.css';

// fields marked * in the design
const REQUIRED = [
  ['nid-passport-birth-certificate-n', 'your NID / passport / birth certificate number'],
  ['guarantor-name', 'guarantor name'],
  ['relationship-to-member', 'relationship to member'],
  ['guarantor-contact-number', 'guarantor contact number'],
  ['nid-passport-birth-certificate-n-2', 'guarantor NID / passport / birth certificate number'],
  ['address-lane', 'guarantor address lane'],
  ['city-area-2', 'guarantor city / area'],
  ['district-postal-code', 'guarantor district & postal code'],
  ['preferred-pickup-date', 'preferred pickup date'],
];

const isoDay = (d) => d.toISOString().slice(0, 10);

// Generated from Figma frame "Noholi Library — Borrow Request: The River Path (After Login)" (126:473) by tools/gen_member.py, then hand-edited.
export default function BorrowRequest() {
  const { slug = 'the-river-path' } = useParams();
  const [status, setStatus] = useState(null);

  // No backend yet: check the starred fields and the pickup window, then confirm inline.
  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (n) => String(data.get(n) || '').trim();
    const missing = REQUIRED.filter(([n]) => !get(n)).map(([, label]) => label);
    if (missing.length) {
      setStatus({ ok: false, text: `Please fill in: ${missing.join(', ')}.` });
      return;
    }
    const today = new Date();
    const last = new Date(today);
    last.setDate(today.getDate() + 5);
    const date = get('preferred-pickup-date');
    if (date < isoDay(today) || date > isoDay(last)) {
      setStatus({ ok: false, text: 'Please choose a pickup date within the next 5 days.' });
      return;
    }
    setStatus({ ok: true, text: 'Borrow request received. We will hold The River Path at the circulation desk for pickup on the chosen date.' });
  };

  return (
    <div className="borrow">
      <section className="borrow-sub-bar-breadcrumb--root">
        <div className="borrow-sub-bar-breadcrumb-box">
          <nav className="borrow-nav-breadcrumb">
            <Link to="/" className="borrow-nav-breadcrumb-box">HOME</Link>
            <div className="borrow-nav-breadcrumb-box-2">
              <span className="borrow-nav-breadcrumb-box-2-text">/</span>
            </div>
            <Link to="/catalog" className="borrow-nav-breadcrumb-box-3">BROWSE</Link>
            <div className="borrow-nav-breadcrumb-box-2">
              <span className="borrow-nav-breadcrumb-box-2-text">/</span>
            </div>
            <Link to={`/books/${slug}`} className="borrow-nav-breadcrumb-box-3">THE RIVER PATH</Link>
            <div className="borrow-nav-breadcrumb-box-2">
              <span className="borrow-nav-breadcrumb-box-2-text">/</span>
            </div>
            <div className="borrow-nav-breadcrumb-box-2">
              <span className="borrow-nav-breadcrumb-box-2-text-2">BORROW REQUEST</span>
            </div>
          </nav>
          <div className="borrow-sub-bar-breadcrumb-box-box">
            <span className="borrow-sub-bar-breadcrumb-box-box-text">LOGGED-IN PATRON FLOW</span>
          </div>
        </div>
      </section>
      <section className="borrow-main-main-content--root">
        <section className="borrow-main-main-content-2">
          <div className="borrow-page-header">
            <h1 className="borrow-heading-1">Borrow Request</h1>
            <div className="borrow-page-header-box">
              <span className="borrow-submit-a-request-to-hold-this-ci">Submit a request to hold this circulating volume at the circulation desk.</span>
            </div>
          </div>
          <div className="borrow-compact-book-summary-block">
            <div className="borrow-cover-plate-thumbnail">
              <div className="borrow-horizontalborder">
                <div className="borrow-horizontalborder-box">
                  <span className="borrow-horizontalborder-box-text">NOHOLI</span>
                </div>
              </div>
              <div className="borrow-cover-plate-thumbnail-box">
                <div className="borrow-cover-plate-thumbnail-box-box">
                  <span className="borrow-cover-plate-thumbnail-box-box-text">The River<br />Path</span>
                </div>
                <div className="borrow-cover-plate-thumbnail-box-box">
                  <span className="borrow-cover-plate-thumbnail-box-box-text-2">নদীর বাঁক</span>
                </div>
              </div>
              <div className="borrow-horizontalborder-2">
                <div className="borrow-horizontalborder-2-box">
                  <span className="borrow-horizontalborder-2-box-text">Noholi Press</span>
                </div>
              </div>
            </div>
            <div className="borrow-book-info-metadata">
              <div className="borrow-book-info-metadata-box">
                <div className="borrow-book-info-metadata-box-box">
                  <span className="borrow-book-info-metadata-box-box-text">CIRCULATING VOLUME</span>
                </div>
                <div className="borrow-book-info-metadata-box-box-2" />
                <div className="borrow-book-info-metadata-box-box">
                  <span className="borrow-book-info-metadata-box-box-text-2">In Stock (3 copies)</span>
                </div>
              </div>
              <h2 className="borrow-heading-2">
                <span className="borrow-heading-2-text">{"The River Path "}</span>
                <span className="borrow-heading-2-text-2">নদীর বাঁক</span>
              </h2>
              <div className="borrow-book-info-metadata-box-2">
                <span className="borrow-by-a-r-chowdhury">{"By "}<span className="borrow-span">A. R. Chowdhury</span></span>
              </div>
              <div className="borrow-book-info-metadata-box-3">
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text">Category:<span className="borrow-span-2">{" Adults"}</span></span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text-2">·</span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text">Genre:<span className="borrow-span-2">{" Fiction"}</span></span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text-2">·</span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text">Language:<span className="borrow-span-2">{" English"}</span></span>
                </div>
              </div>
            </div>
          </div>
          <form className="borrow-borrow-request-form-card-confirm" onSubmit={onSubmit} noValidate>
            <div className="borrow-member-field">
              <section className="borrow-section-1-personal-information">
                <div className="borrow-horizontalborder-3">
                  <div className="borrow-horizontalborder-3-box">
                    <h3 className="borrow-heading-3">
                      <span className="borrow-heading-3-text">{"Personal Information "}</span>
                      <span className="borrow-heading-3-text-2">(সদস্যের ব্যক্তিগত তথ্য)</span>
                    </h3>
                    <div className="borrow-horizontalborder-3-box-box">
                      <span className="borrow-horizontalborder-3-box-box-text">Pre-filled from patron membership record #NL-READER-4092. Please verify contact & identification details.</span>
                    </div>
                  </div>
                  <div className="borrow-background-border">
                    <span className="borrow-background-border-text">VERIFIED MEMBER</span>
                  </div>
                </div>
                <div className="borrow-name-email">
                  <div className="borrow-name-email-box">
                    <label className="borrow-label" htmlFor="borrow-full-name">
                      <span className="borrow-label-text">{"FULL NAME "}</span>
                      <span className="borrow-label-text-2">(পূর্ণ নাম)</span>
                    </label>
                    <input id="borrow-full-name" name="full-name" className="borrow-input" defaultValue="Mohammad Rafiqul Islam" />
                  </div>
                  <div className="borrow-name-email-box">
                    <label className="borrow-label" htmlFor="borrow-email-address">
                      <span className="borrow-label-text">{"EMAIL ADDRESS "}</span>
                      <span className="borrow-label-text-2">(ইমেইল)</span>
                    </label>
                    <input id="borrow-email-address" name="email-address" type="email" className="borrow-input-2" defaultValue="rafiqul.islam@email.com" />
                  </div>
                </div>
                <div className="borrow-phone-numbers">
                  <div className="borrow-phone-numbers-box">
                    <label className="borrow-label" htmlFor="borrow-phone-number">
                      <span className="borrow-label-text">{"PHONE NUMBER "}</span>
                      <span className="borrow-label-text-2">(মোবাইল নম্বর)</span>
                    </label>
                    <input id="borrow-phone-number" name="phone-number" type="tel" className="borrow-input-3" defaultValue="+880 1712-345678" />
                  </div>
                  <div className="borrow-phone-numbers-box">
                    <label className="borrow-label" htmlFor="borrow-alternative-number">
                      <span className="borrow-label-text">{"ALTERNATIVE NUMBER "}</span>
                      <span className="borrow-label-text-2">(বিকল্প নম্বর)</span>
                    </label>
                    <input id="borrow-alternative-number" name="alternative-number" type="tel" className="borrow-input-4" defaultValue="+880 1912-987654" />
                  </div>
                </div>
                <div className="borrow-address-breakdown">
                  <p className="borrow-paragraph">
                    <span className="borrow-paragraph-text">{"REGISTERED ADDRESS "}</span>
                    <span className="borrow-paragraph-text-2">(নিবন্ধিত ঠিকানা)</span>
                  </p>
                  <div className="borrow-address-breakdown-box">
                    <div className="borrow-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-street-lane">STREET / LANE (সড়ক / বাড়ি)</label>
                      <input id="borrow-street-lane" name="street-lane" className="borrow-input-5" defaultValue="House 42, Road 7, Block D" />
                    </div>
                    <div className="borrow-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-city-area">CITY / AREA (এলাকা)</label>
                      <input id="borrow-city-area" name="city-area" className="borrow-input-6" defaultValue="Dhanmondi" />
                    </div>
                    <div className="borrow-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-district-post-code">DISTRICT & POST CODE</label>
                      <input id="borrow-district-post-code" name="district-post-code" className="borrow-input-7" defaultValue="Dhaka - 1205" />
                    </div>
                  </div>
                </div>
                <div className="borrow-mandatory-verification-nid-passp">
                  <div className="borrow-mandatory-verification-nid-passp-box">
                    <label className="borrow-label-3" htmlFor="borrow-nid-passport-birth-certificate-n">
                      <span className="borrow-label-3-text">{"NID / PASSPORT / BIRTH CERTIFICATE NUMBER "}<span className="borrow-span-3">*</span>{" "}</span>
                      <span className="borrow-label-3-text-2">(জাতীয় পরিচয়পত্র / পাসপোর্ট / জন্ম নিবন্ধন নম্বর)</span>
                    </label>
                    <div className="borrow-mandatory-verification-nid-passp-box-box">
                      <span className="borrow-mandatory-verification-nid-passp-box-box-text">REQUIRED FOR CIRCULATING PHYSICAL BORROW CHECKOUT</span>
                    </div>
                  </div>
                  <input id="borrow-nid-passport-birth-certificate-n" name="nid-passport-birth-certificate-n" required className="borrow-input-8" placeholder="e.g. 1994269280001234 or A02948201" />
                  <div className="borrow-mandatory-verification-nid-passp-box-2">
                    <span className="borrow-physical-verification-of-origina">Physical verification of original identity document will be cross-checked at desk upon collection.</span>
                  </div>
                </div>
              </section>
              <section className="borrow-section-2-guarantor-information">
                <div className="borrow-section-2-guarantor-information-box">
                  <div className="borrow-section-2-guarantor-information-box-box">
                    <h3 className="borrow-heading-3-2">
                      <span className="borrow-heading-3-2-text">{"Guarantor Information & Endorsement "}</span>
                      <span className="borrow-heading-3-2-text-2">(জামিনদারের তথ্য ও অঙ্গীকার)</span>
                    </h3>
                    <div className="borrow-border">
                      <span className="borrow-border-text">CIRCULATION RULE 4.2</span>
                    </div>
                  </div>
                  <div className="borrow-section-2-guarantor-information-box-box-2">
                    <span className="borrow-circulating-borrowing-privileges">Circulating borrowing privileges require an authenticated local guarantor record on file.</span>
                  </div>
                </div>
                <div className="borrow-guarantor-name-relationship">
                  <div className="borrow-guarantor-name-relationship-box">
                    <label className="borrow-label-4" htmlFor="borrow-guarantor-name">
                      <span className="borrow-label-4-text">{"GUARANTOR NAME "}<span className="borrow-span-3">*</span>{" "}</span>
                      <span className="borrow-label-4-text-2">(জামিনদারের নাম)</span>
                    </label>
                    <input id="borrow-guarantor-name" name="guarantor-name" required className="borrow-input-9" placeholder="Full legal name of guarantor" />
                  </div>
                  <div className="borrow-guarantor-name-relationship-box">
                    <label className="borrow-label-4" htmlFor="borrow-relationship-to-member">
                      <span className="borrow-label-4-text">{"RELATIONSHIP TO MEMBER "}<span className="borrow-span-3">*</span>{" "}</span>
                      <span className="borrow-label-4-text-2">(সম্পর্ক)</span>
                    </label>
                    <input id="borrow-relationship-to-member" name="relationship-to-member" required className="borrow-input-10" placeholder="e.g. Parent, Sibling, Spouse, Supervisor" />
                  </div>
                </div>
                <div className="borrow-guarantor-phone-numbers">
                  <div className="borrow-guarantor-phone-numbers-box">
                    <label className="borrow-label-4" htmlFor="borrow-guarantor-contact-number">
                      <span className="borrow-label-4-text">{"GUARANTOR CONTACT NUMBER "}<span className="borrow-span-3">*</span>{" "}</span>
                      <span className="borrow-label-4-text-2">(মোবাইল নম্বর)</span>
                    </label>
                    <input id="borrow-guarantor-contact-number" name="guarantor-contact-number" type="tel" required className="borrow-input-11" placeholder="+880 1XXX-XXXXXX" />
                  </div>
                  <div className="borrow-guarantor-phone-numbers-box">
                    <label className="borrow-label-5" htmlFor="borrow-alternative-number-2">
                      <span className="borrow-label-5-text">{"ALTERNATIVE NUMBER "}</span>
                      <span className="borrow-label-5-text-2">(optional)</span>
                      <span className="borrow-label-5-text-3">(বিকল্প নম্বর)</span>
                    </label>
                    <input id="borrow-alternative-number-2" name="alternative-number-2" type="tel" className="borrow-input-12" placeholder="+880 1XXX-XXXXXX" />
                  </div>
                </div>
                <div className="borrow-guarantor-identification">
                  <label className="borrow-label-4" htmlFor="borrow-nid-passport-birth-certificate-n-2">
                    <span className="borrow-label-4-text">{"NID / PASSPORT / BIRTH CERTIFICATE NUMBER "}<span className="borrow-span-3">*</span>{" "}</span>
                    <span className="borrow-label-4-text-2">(জাতীয় পরিচয়পত্র / পাসপোর্ট নম্বর)</span>
                  </label>
                  <input id="borrow-nid-passport-birth-certificate-n-2" name="nid-passport-birth-certificate-n-2" required className="borrow-input-13" placeholder="e.g. 1988269280004567" />
                </div>
                <div className="borrow-guarantor-address-breakdown">
                  <label className="borrow-label-4">
                    <span className="borrow-label-4-text">{"GUARANTOR PERMANENT / PRESENT ADDRESS "}<span className="borrow-span-3">*</span>{" "}</span>
                    <span className="borrow-label-4-text-2">(ঠিকানা বিবরণ)</span>
                  </label>
                  <div className="borrow-guarantor-address-breakdown-box">
                    <div className="borrow-guarantor-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-address-lane">ADDRESS LANE (ঠিকানা / সড়ক) *</label>
                      <input id="borrow-address-lane" name="address-lane" required className="borrow-input-14" placeholder="House / Road / Flat" />
                    </div>
                    <div className="borrow-guarantor-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-city-area-2">CITY / AREA (শহর / এলাকা) *</label>
                      <input id="borrow-city-area-2" name="city-area-2" required className="borrow-input-15" placeholder="Area / Thana" />
                    </div>
                    <div className="borrow-guarantor-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-district-postal-code">DISTRICT & POSTAL CODE *</label>
                      <input id="borrow-district-postal-code" name="district-postal-code" required className="borrow-input-16" placeholder="e.g. Dhaka - 1209" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="borrow-preferred-pickup-date">
              <label className="borrow-label-6" htmlFor="borrow-preferred-pickup-date"><span>{"PREFERRED PICKUP DATE "}<span className="borrow-span-3">*</span></span></label>
              <input id="borrow-preferred-pickup-date" name="preferred-pickup-date" required type="date" className="borrow-input-17" defaultValue="2026-09-24" />
              <div className="borrow-preferred-pickup-date-box">
                <span className="borrow-please-choose-a-date-within-the">Please choose a date within the next 5 days. Holds are prepared each morning.</span>
              </div>
            </div>
            <div className="borrow-note-to-circulation-desk">
              <label className="borrow-label" htmlFor="borrow-note-to-circulation-desk">
                <span className="borrow-label-text">{"NOTE TO CIRCULATION DESK "}</span>
                <span className="borrow-label-text-3">(optional)</span>
              </label>
              <textarea id="borrow-note-to-circulation-desk" name="note-to-circulation-desk" className="borrow-textarea" placeholder="e.g. Will arrive after 4:00 PM; please leave on the reserve shelf." />
            </div>
            <button type="submit" className="borrow-submit-button">
              <span className="borrow-submit-button-text">CONFIRM BORROW REQUEST</span>
            </button>
            {status && <p className={`borrow-status${status.ok ? ' borrow-status--ok' : ''}`} role="status">{status.text}</p>}
          </form>
          <div className="borrow-explanatory-note-below-form">
            <span className="borrow-your-request-will-be-held-for-pi">{"Your request will be held for pickup at the circulation desk. Standard loan terms apply \u2014 see "}<Link to="/rules" className="borrow-span-3">Rules page</Link>{" for details."}</span>
          </div>
        </section>
      </section>
    </div>
  );
}
