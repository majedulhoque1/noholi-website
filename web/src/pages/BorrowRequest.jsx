import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { supabase, describeError } from '../lib/supabase.js';
import { bookPath, displayAuthor, displayTitle, getBookBySlug } from '../lib/books.js';
import { todayDhaka, addDaysISO, formatDhaka } from '../lib/dhakaDate.js';
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
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Postgres DOW (0 = Sunday) of a 'YYYY-MM-DD' calendar day. */
const dowOf = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
const joinDistrict = (district, postal) => [district, postal].filter(Boolean).join(' - ');
/** "Dhaka - 1209" / "Dhaka 1209" / "Dhaka, 1209" → { district: 'Dhaka', postal: '1209' } */
function splitDistrict(value) {
  const v = String(value || '').trim();
  const m = /^(.*?)[\s,–-]*(\d{3,6})$/.exec(v);
  return m ? { district: m[1].trim(), postal: m[2] } : { district: v, postal: '' };
}
const long = (iso) => formatDhaka(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Pickup window from get_public_settings: today … today + window days, closed weekdays skipped. */
function pickupWindow(settings) {
  const today = settings?.today || todayDhaka();
  const days = settings?.pickup_window_days ?? 5;
  const closed = settings?.closed_weekdays || [];
  const open = [];
  for (let i = 0; i <= days; i += 1) {
    const d = addDaysISO(today, i);
    if (!closed.includes(dowOf(d))) open.push(d);
  }
  return { today, last: addDaysISO(today, days), days, closed, open };
}

// Generated from Figma frame "Noholi Library — Borrow Request: The River Path (After Login)" (126:473) by tools/gen_member.py, then hand-edited.
// Submits through rpc('submit_borrow_request') (CONTRACT.md §4). The first request saves the NID and
// guarantor as the member's defaults server-side; later requests are pre-filled from them.
export default function BorrowRequest() {
  const { slug } = useParams();
  const { memberRow, refresh } = useAuth();
  const [book, setBook] = useState(undefined); // undefined = loading, null = not found
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // the created request row

  useEffect(() => {
    let live = true;
    setBook(undefined);
    setLoadError('');
    setDone(null);
    setStatus(null);
    getBookBySlug(slug)
      .then((b) => { if (live) setBook(b || null); })
      .catch((err) => { if (live) { setBook(null); setLoadError(describeError(err)); } });
    supabase.rpc('get_public_settings').then(({ data }) => { if (live && data) setSettings(data); });
    return () => { live = false; };
  }, [slug]);

  const win = useMemo(() => pickupWindow(settings), [settings]);
  const m = memberRow || {};
  const closedText = win.closed.length
    ? ` The library is closed on ${win.closed.map((d) => DAY_NAMES[d]).join(' and ')}.`
    : '';

  const unavailable = book
    ? !book.is_circulating
      ? `“${displayTitle(book)}” is for the reading room only and cannot be borrowed.`
      : book.available_copies <= 0
        ? `No copies of “${displayTitle(book)}” are available right now. Please try again later.`
        : ''
    : '';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy || done || !book) return;
    if (unavailable) { setStatus({ ok: false, text: unavailable }); return; }
    const data = new FormData(e.currentTarget);
    const get = (n) => String(data.get(n) || '').trim();
    const missing = REQUIRED.filter(([n]) => !get(n)).map(([, label]) => label);
    if (missing.length) {
      setStatus({ ok: false, text: `Please fill in: ${missing.join(', ')}.` });
      return;
    }
    if (!data.get('guarantor-consent')) {
      setStatus({ ok: false, text: 'Please confirm that your guarantor has agreed to share their details with the library.' });
      return;
    }
    const date = get('preferred-pickup-date');
    if (date < win.today || date > win.last) {
      setStatus({ ok: false, text: `Please choose a pickup date within the next ${win.days} days.` });
      return;
    }
    if (win.closed.includes(dowOf(date))) {
      setStatus({ ok: false, text: `The library is closed on ${DAY_NAMES[dowOf(date)]}. Please choose another pickup day.` });
      return;
    }
    const g = splitDistrict(get('district-postal-code'));
    const alt = get('alternative-number-2');
    const note = [get('note-to-circulation-desk'), alt ? `Guarantor alternative number: ${alt}` : ''].filter(Boolean).join('\n');
    setBusy(true);
    setStatus({ ok: true, text: 'Sending your request…' });
    const { data: req, error } = await supabase.rpc('submit_borrow_request', {
      p_book_id: book.id,
      p_pickup_date: date,
      p_consent: true,
      p_member_nid: get('nid-passport-birth-certificate-n'),
      p_guarantor_name: get('guarantor-name'),
      p_guarantor_relationship: get('relationship-to-member'),
      p_guarantor_phone: get('guarantor-contact-number'),
      p_guarantor_nid: get('nid-passport-birth-certificate-n-2'),
      p_guarantor_street: get('address-lane'),
      p_guarantor_city: get('city-area-2'),
      p_guarantor_district: g.district,
      p_guarantor_postal_code: g.postal || null,
      p_note: note || null,
    });
    setBusy(false);
    if (error) {
      setStatus({ ok: false, text: describeError(error) });
      return;
    }
    setDone(req);
    setStatus({
      ok: true,
      text: `Request ${req.id} confirmed. “${req.book_title}” will be held at the circulation desk for pickup on ${long(req.pickup_date)}. The hold lasts until ${long(req.expires_at)}; after that the copy is released. You can see or cancel it on your dashboard.`,
    });
    setBook((b) => (b ? { ...b, available_copies: b.available_copies - 1 } : b));
    refresh();
  };

  if (book === undefined) return <div className="borrow" style={{ minHeight: '70vh' }} aria-busy="true" />;

  if (book === null) {
    return (
      <div className="borrow">
        <section className="borrow-main-main-content--root">
          <section className="borrow-main-main-content-2">
            <div className="borrow-page-header">
              <h1 className="borrow-heading-1">Borrow Request</h1>
              <div className="borrow-page-header-box">
                <span className="borrow-submit-a-request-to-hold-this-ci">
                  {loadError || 'This book was not found in the catalogue.'}{' '}
                  <Link to="/catalog" className="borrow-span-3">Browse the catalogue</Link>.
                </span>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }

  const title = displayTitle(book);
  const bangla = book.title && book.title_bangla ? book.title_bangla : '';
  const firstOpen = win.open[0] || win.today;

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
            <Link to={bookPath(book)} className="borrow-nav-breadcrumb-box-3">{title.toUpperCase()}</Link>
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
                  <span className="borrow-cover-plate-thumbnail-box-box-text">{title}</span>
                </div>
                <div className="borrow-cover-plate-thumbnail-box-box">
                  <span className="borrow-cover-plate-thumbnail-box-box-text-2">{bangla}</span>
                </div>
              </div>
              <div className="borrow-horizontalborder-2">
                <div className="borrow-horizontalborder-2-box">
                  <span className="borrow-horizontalborder-2-box-text">{book.publisher || ''}</span>
                </div>
              </div>
            </div>
            <div className="borrow-book-info-metadata">
              <div className="borrow-book-info-metadata-box">
                <div className="borrow-book-info-metadata-box-box">
                  <span className="borrow-book-info-metadata-box-box-text">{book.is_circulating ? 'CIRCULATING VOLUME' : 'READING ROOM ONLY'}</span>
                </div>
                <div className="borrow-book-info-metadata-box-box-2" />
                <div className="borrow-book-info-metadata-box-box">
                  <span className="borrow-book-info-metadata-box-box-text-2">{book.available_copies > 0 ? `In Stock (${book.available_copies} of ${book.total_copies} ${book.total_copies === 1 ? 'copy' : 'copies'})` : 'All copies on loan'}</span>
                </div>
              </div>
              <h2 className="borrow-heading-2">
                <span className="borrow-heading-2-text">{title}</span>
                {bangla && <span className="borrow-heading-2-text-2">{bangla}</span>}
              </h2>
              <div className="borrow-book-info-metadata-box-2">
                <span className="borrow-by-a-r-chowdhury">{"By "}<span className="borrow-span">{displayAuthor(book) || 'Unknown author'}</span></span>
              </div>
              <div className="borrow-book-info-metadata-box-3">
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text">Category:<span className="borrow-span-2">{` ${book.category || '—'}`}</span></span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text-2">·</span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text">Genre:<span className="borrow-span-2">{` ${book.genre || '—'}`}</span></span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text-2">·</span>
                </div>
                <div className="borrow-book-info-metadata-box-3-box">
                  <span className="borrow-book-info-metadata-box-3-box-text">Language:<span className="borrow-span-2">{` ${book.language || '—'}`}</span></span>
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
                      <span className="borrow-horizontalborder-3-box-box-text">Pre-filled from patron membership record #{m.id}. Contact details are changed in your profile.</span>
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
                    <input id="borrow-full-name" name="full-name" className="borrow-input" readOnly value={m.name || ''} />
                  </div>
                  <div className="borrow-name-email-box">
                    <label className="borrow-label" htmlFor="borrow-email-address">
                      <span className="borrow-label-text">{"EMAIL ADDRESS "}</span>
                      <span className="borrow-label-text-2">(ইমেইল)</span>
                    </label>
                    <input id="borrow-email-address" name="email-address" type="email" className="borrow-input-2" readOnly value={m.email || ''} placeholder="Not on record" />
                  </div>
                </div>
                <div className="borrow-phone-numbers">
                  <div className="borrow-phone-numbers-box">
                    <label className="borrow-label" htmlFor="borrow-phone-number">
                      <span className="borrow-label-text">{"PHONE NUMBER "}</span>
                      <span className="borrow-label-text-2">(মোবাইল নম্বর)</span>
                    </label>
                    <input id="borrow-phone-number" name="phone-number" type="tel" className="borrow-input-3" readOnly value={m.phone || ''} placeholder="Not on record" />
                  </div>
                  <div className="borrow-phone-numbers-box">
                    <label className="borrow-label" htmlFor="borrow-alternative-number">
                      <span className="borrow-label-text">{"ALTERNATIVE NUMBER "}</span>
                      <span className="borrow-label-text-2">(বিকল্প নম্বর)</span>
                    </label>
                    <input id="borrow-alternative-number" name="alternative-number" type="tel" className="borrow-input-4" readOnly value="" placeholder="Not on record" />
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
                      <input id="borrow-street-lane" name="street-lane" className="borrow-input-5" readOnly value={m.address_line || ''} placeholder="Not on record" />
                    </div>
                    <div className="borrow-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-city-area">CITY / AREA (এলাকা)</label>
                      <input id="borrow-city-area" name="city-area" className="borrow-input-6" readOnly value={m.city || ''} placeholder="Not on record" />
                    </div>
                    <div className="borrow-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-district-post-code">DISTRICT & POST CODE</label>
                      <input id="borrow-district-post-code" name="district-post-code" className="borrow-input-7" readOnly value={joinDistrict(m.district, m.postal_code)} placeholder="Not on record" />
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
                  <input id="borrow-nid-passport-birth-certificate-n" name="nid-passport-birth-certificate-n" required className="borrow-input-8" defaultValue={m.nid || ''} placeholder="e.g. 1994269280001234 or A02948201" />
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
                    <input id="borrow-guarantor-name" name="guarantor-name" required className="borrow-input-9" defaultValue={m.default_guarantor_name || ''} placeholder="Full legal name of guarantor" />
                  </div>
                  <div className="borrow-guarantor-name-relationship-box">
                    <label className="borrow-label-4" htmlFor="borrow-relationship-to-member">
                      <span className="borrow-label-4-text">{"RELATIONSHIP TO MEMBER "}<span className="borrow-span-3">*</span>{" "}</span>
                      <span className="borrow-label-4-text-2">(সম্পর্ক)</span>
                    </label>
                    <input id="borrow-relationship-to-member" name="relationship-to-member" required className="borrow-input-10" defaultValue={m.default_guarantor_relationship || ''} placeholder="e.g. Parent, Sibling, Spouse, Supervisor" />
                  </div>
                </div>
                <div className="borrow-guarantor-phone-numbers">
                  <div className="borrow-guarantor-phone-numbers-box">
                    <label className="borrow-label-4" htmlFor="borrow-guarantor-contact-number">
                      <span className="borrow-label-4-text">{"GUARANTOR CONTACT NUMBER "}<span className="borrow-span-3">*</span>{" "}</span>
                      <span className="borrow-label-4-text-2">(মোবাইল নম্বর)</span>
                    </label>
                    <input id="borrow-guarantor-contact-number" name="guarantor-contact-number" type="tel" required className="borrow-input-11" defaultValue={m.default_guarantor_phone || ''} placeholder="+880 1XXX-XXXXXX" />
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
                  <input id="borrow-nid-passport-birth-certificate-n-2" name="nid-passport-birth-certificate-n-2" required className="borrow-input-13" defaultValue={m.default_guarantor_nid || ''} placeholder="e.g. 1988269280004567" />
                </div>
                <div className="borrow-guarantor-address-breakdown">
                  <label className="borrow-label-4">
                    <span className="borrow-label-4-text">{"GUARANTOR PERMANENT / PRESENT ADDRESS "}<span className="borrow-span-3">*</span>{" "}</span>
                    <span className="borrow-label-4-text-2">(ঠিকানা বিবরণ)</span>
                  </label>
                  <div className="borrow-guarantor-address-breakdown-box">
                    <div className="borrow-guarantor-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-address-lane">ADDRESS LANE (ঠিকানা / সড়ক) *</label>
                      <input id="borrow-address-lane" name="address-lane" required className="borrow-input-14" defaultValue={m.default_guarantor_street || ''} placeholder="House / Road / Flat" />
                    </div>
                    <div className="borrow-guarantor-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-city-area-2">CITY / AREA (শহর / এলাকা) *</label>
                      <input id="borrow-city-area-2" name="city-area-2" required className="borrow-input-15" defaultValue={m.default_guarantor_city || ''} placeholder="Area / Thana" />
                    </div>
                    <div className="borrow-guarantor-address-breakdown-box-box">
                      <label className="borrow-label-2" htmlFor="borrow-district-postal-code">DISTRICT & POSTAL CODE *</label>
                      <input id="borrow-district-postal-code" name="district-postal-code" required className="borrow-input-16" defaultValue={joinDistrict(m.default_guarantor_district, m.default_guarantor_postal_code)} placeholder="e.g. Dhaka - 1209" />
                    </div>
                  </div>
                </div>
                <label className="borrow-consent" htmlFor="borrow-guarantor-consent">
                  <input id="borrow-guarantor-consent" name="guarantor-consent" type="checkbox" className="borrow-consent-check" />
                  <span>
                    My guarantor has agreed to give these details to Noholi Library, to be seen only by library staff and
                    used for lending accountability. <Link to="/privacy">Privacy notice</Link>.
                  </span>
                </label>
              </section>
            </div>
            <div className="borrow-preferred-pickup-date">
              <label className="borrow-label-6" htmlFor="borrow-preferred-pickup-date"><span>{"PREFERRED PICKUP DATE "}<span className="borrow-span-3">*</span></span></label>
              <input key={firstOpen} id="borrow-preferred-pickup-date" name="preferred-pickup-date" required type="date" className="borrow-input-17" min={win.today} max={win.last} defaultValue={firstOpen} />
              <div className="borrow-preferred-pickup-date-box">
                <span className="borrow-please-choose-a-date-within-the">{`Please choose a date within the next ${win.days} days.${closedText} Holds are prepared each morning.`}</span>
              </div>
            </div>
            <div className="borrow-note-to-circulation-desk">
              <label className="borrow-label" htmlFor="borrow-note-to-circulation-desk">
                <span className="borrow-label-text">{"NOTE TO CIRCULATION DESK "}</span>
                <span className="borrow-label-text-3">(optional)</span>
              </label>
              <textarea id="borrow-note-to-circulation-desk" name="note-to-circulation-desk" className="borrow-textarea" placeholder="e.g. Will arrive after 4:00 PM; please leave on the reserve shelf." />
            </div>
            <button type="submit" className="borrow-submit-button" disabled={busy || Boolean(done) || Boolean(unavailable)} aria-busy={busy}>
              <span className="borrow-submit-button-text">{done ? 'REQUEST SENT' : busy ? 'SENDING…' : 'CONFIRM BORROW REQUEST'}</span>
            </button>
            {(status || unavailable) && (
              <p className={`borrow-status${status?.ok ? ' borrow-status--ok' : ''}`} role="status">
                {status ? status.text : unavailable}
                {done && <>{' '}<Link to="/member/dashboard">Go to your dashboard</Link>.</>}
              </p>
            )}
          </form>
          <div className="borrow-explanatory-note-below-form">
            <span className="borrow-your-request-will-be-held-for-pi">{"Your request will be held for pickup at the circulation desk. Standard loan terms apply \u2014 see "}<Link to="/rules" className="borrow-span-3">Rules page</Link>{" for details."}</span>
          </div>
        </section>
      </section>
    </div>
  );
}
