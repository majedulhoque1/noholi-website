import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { supabase, describeError } from '../lib/supabase.js';
import './MemberEdit.css';

const DESK = 'Contact the circulation desk to change this.';

// Generated from Figma frame "Noholi Library — Edit Personal Information" (126:943) by tools/gen_member.py, then hand-edited.
// Members may change only their phone and address (rpc update_my_profile, CONTRACT.md §4).
// Name, email, NID, guarantor and photo are kept by the desk, so those fields are read-only here.
export default function MemberEdit() {
  const { memberRow, refresh } = useAuth();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const m = memberRow || {};

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const get = (n) => String(data.get(n) || '').trim();
    if (!get('phone-number')) {
      setStatus({ ok: false, text: 'Please enter your phone number.' });
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc('update_my_profile', {
      p_phone: get('phone-number'),
      p_address_line: get('street-address'),
      p_city: get('city-area'),
      p_district: get('district'),
      p_postal_code: get('postal-code'),
    });
    setBusy(false);
    if (error) {
      setStatus({ ok: false, text: describeError(error) });
      return;
    }
    await refresh();
    setStatus({ ok: true, text: 'Changes saved.' });
  };

  return (
    <div className="medit">
      <section className="medit-main-main-content">
        <section className="medit-main-main-content-2">
          <nav className="medit-nav-breadcrumb">
            <nav className="medit-nav-breadcrumb-2">
              <Link to="/" className="medit-nav-breadcrumb-2-text">{"HOME "}</Link>
              <span className="medit-nav-breadcrumb-2-text-2">/</span>
              <Link to="/member/dashboard" className="medit-nav-breadcrumb-2-text">{"MY DASHBOARD "}</Link>
              <span className="medit-nav-breadcrumb-2-text-2">/</span>
              <Link to="/member/profile" className="medit-nav-breadcrumb-2-text">{"PROFILE "}</Link>
              <span className="medit-nav-breadcrumb-2-text-2">/</span>
              <span className="medit-nav-breadcrumb-2-text-3">EDIT PERSONAL INFORMATION</span>
            </nav>
          </nav>
          <div className="medit-page-header">
            <div className="medit-page-header-2">
              <div className="medit-page-header-2-box">
                <div className="medit-page-header-2-box-box" />
                <div className="medit-page-header-2-box-box-2">
                  <span className="medit-page-header-2-box-box-2-text">PATRON ARCHIVAL REGISTRY</span>
                </div>
              </div>
              <h1 className="medit-heading-1">Edit Personal Information</h1>
              <div className="medit-page-header-2-box-2">
                <span className="medit-update-your-contact-details-and">Update your contact details and patron registry record.</span>
              </div>
            </div>
          </div>
          <div className="medit-stacked-form-view-sections">
            <div className="medit-card-header">
              <p className="medit-paragraph">
                <span className="medit-heading-2">Personal Information</span>
                <span className="medit-paragraph-text">SECTION 01 — EDITING</span>
              </p>
            </div>
            <form className="medit-edit-form" onSubmit={onSubmit} noValidate>
              <div className="medit-edit-form-box">
                <div className="medit-full-name">
                  <label className="medit-label" htmlFor="medit-full-name">FULL NAME</label>
                  <input id="medit-full-name" name="full-name" className="medit-input" readOnly value={m.name || ''} />
                  <div className="medit-full-name-box">
                    <span className="medit-changing-your-legal-name-require">Your name, email, NID and guarantor details are kept by the{' '}<br className="soft-br" />circulation desk. Contact the circulation desk to change{' '}<br className="soft-br" />them.</span>
                  </div>
                </div>
                <div className="medit-membership-number">
                  <div className="medit-membership-number-box">
                    <label className="medit-label-2" htmlFor="medit-membership-number">MEMBERSHIP NUMBER</label>
                    <div className="medit-background-border">
                      <span className="medit-background-border-text">PERMANENT ID</span>
                    </div>
                  </div>
                  <input id="medit-membership-number" name="membership-number" readOnly className="medit-input-2" value={m.id || ''} />
                  <div className="medit-membership-number-box-2">
                    <span className="medit-patron-registry-identifier-assig">Patron registry identifier assigned upon registration.</span>
                  </div>
                </div>
                <div className="medit-email-address">
                  <label className="medit-label" htmlFor="medit-email-address">EMAIL ADDRESS</label>
                  <input id="medit-email-address" name="email-address" type="email" className="medit-input-3" readOnly value={m.email || ''} placeholder="Not on record" title={DESK} />
                </div>
                <div className="medit-phone-number">
                  <label className="medit-label" htmlFor="medit-phone-number">PHONE NUMBER</label>
                  <input id="medit-phone-number" name="phone-number" required type="tel" autoComplete="tel" className="medit-input-4" defaultValue={m.phone || ''} />
                </div>
                <div className="medit-alternative-number">
                  <label className="medit-label" htmlFor="medit-alternative-number">ALTERNATIVE NUMBER</label>
                  <input id="medit-alternative-number" name="alternative-number" type="tel" className="medit-input-5" readOnly placeholder="Not kept online — give it to the circulation desk" />
                </div>
                <div className="medit-edit-form-box-box">
                  <label className="medit-label">PATRON PHOTO</label>
                  <div className="medit-background-border-2">
                    <img className="medit-background-border-3" src="/svg/background-border-gidnu.svg" alt="" width="48" height="56" />
                    <div className="medit-background-border-2-box">
                      <div className="medit-background-border-2-box-box">
                        <span className="medit-background-border-2-box-box-text">Your photograph is kept by the circulation desk.{' '}<br className="soft-br" />Bring a new passport-size photo to the desk to change it.</span>
                      </div>
                      <span className="medit-label-3" aria-disabled="true">AT THE DESK</span>
                    </div>
                  </div>
                </div>
                <div className="medit-address-section">
                  <div className="medit-address-section-box">
                    <div className="medit-address-section-box-box">
                      <span className="medit-address-section-box-box-text">ADDRESS</span>
                    </div>
                    <div className="medit-address-section-box-box">
                      <span className="medit-address-section-box-box-text-2">— POSTAL & RESIDENCE</span>
                    </div>
                  </div>
                  <div className="medit-street-address">
                    <label className="medit-label" htmlFor="medit-street-address">STREET ADDRESS</label>
                    <input id="medit-street-address" name="street-address" autoComplete="street-address" className="medit-input-6" defaultValue={m.address_line || ''} placeholder="House, road, area" />
                  </div>
                  <div className="medit-3-column-row-city-area-district">
                    <div className="medit-3-column-row-city-area-district-box">
                      <label className="medit-label" htmlFor="medit-city-area">CITY / AREA</label>
                      <input id="medit-city-area" name="city-area" autoComplete="address-level2" className="medit-input-7" defaultValue={m.city || ''} placeholder="City / Area" />
                    </div>
                    <div className="medit-3-column-row-city-area-district-box">
                      <label className="medit-label" htmlFor="medit-district">DISTRICT</label>
                      <input id="medit-district" name="district" className="medit-input-8" defaultValue={m.district || ''} placeholder="District" />
                    </div>
                    <div className="medit-3-column-row-city-area-district-box">
                      <label className="medit-label" htmlFor="medit-postal-code">POSTAL CODE</label>
                      <input id="medit-postal-code" name="postal-code" autoComplete="postal-code" inputMode="numeric" className="medit-input-9" defaultValue={m.postal_code || ''} placeholder="Postal code" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="medit-action-buttons">
                <button type="submit" className="medit-action-buttons-box" disabled={busy} aria-busy={busy}>{busy ? 'SAVING…' : 'SAVE CHANGES'}</button>
                <Link to="/member/profile" className="medit-action-buttons-box-2">CANCEL</Link>
                {/* designed as a hidden "CHANGES SAVED." note: shown once the form is submitted */}
                <div className="medit-action-buttons-box-3" role="status" aria-live="polite" style={status ? { opacity: 1 } : undefined}>
                  <span className="medit-action-buttons-box-3-text">{status ? status.text : 'CHANGES SAVED.'}</span>
                </div>
              </div>
            </form>
          </div>
          <div className="medit-footer-desk-assistance-notice">
            <div className="medit-footer-desk-assistance-notice-2">
              <div className="medit-footer-desk-assistance-notice-2-box">
                <span className="medit-footer-desk-assistance-notice-2-box-text">Contact the circulation desk with questions.</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
