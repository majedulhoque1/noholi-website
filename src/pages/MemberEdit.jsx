import { useState } from 'react';
import { Link } from 'react-router-dom';
import './MemberEdit.css';

const REQUIRED = [['full-name', 'full name'], ['email-address', 'email address'], ['phone-number', 'phone number']];

// Generated from Figma frame "Noholi Library — Edit Personal Information" (126:943) by tools/gen_member.py, then hand-edited.
export default function MemberEdit() {
  const [status, setStatus] = useState(null);
  const [photo, setPhoto] = useState('');

  // No backend yet: validate the required fields and confirm inline.
  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const missing = REQUIRED.filter(([name]) => !String(data.get(name) || '').trim()).map(([, label]) => label);
    if (missing.length) {
      setStatus({ ok: false, text: `Please enter your ${missing.join(', ')}.` });
      return;
    }
    const email = String(data.get('email-address')).trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus({ ok: false, text: 'Please enter a valid email address.' });
      return;
    }
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
                  <input id="medit-full-name" name="full-name" required className="medit-input" defaultValue="[Member Name]" />
                  <div className="medit-full-name-box">
                    <span className="medit-changing-your-legal-name-require">Changing your legal name requires ID verification at the{' '}<br className="soft-br" />circulation desk — updates will show as pending until{' '}<br className="soft-br" />confirmed.</span>
                  </div>
                </div>
                <div className="medit-membership-number">
                  <div className="medit-membership-number-box">
                    <label className="medit-label-2" htmlFor="medit-membership-number">MEMBERSHIP NUMBER</label>
                    <div className="medit-background-border">
                      <span className="medit-background-border-text">PERMANENT ID</span>
                    </div>
                  </div>
                  <input id="medit-membership-number" name="membership-number" readOnly className="medit-input-2" placeholder="[NL-READER-XXXX]" />
                  <div className="medit-membership-number-box-2">
                    <span className="medit-patron-registry-identifier-assig">Patron registry identifier assigned upon registration.</span>
                  </div>
                </div>
                <div className="medit-email-address">
                  <label className="medit-label" htmlFor="medit-email-address">EMAIL ADDRESS</label>
                  <input id="medit-email-address" name="email-address" required type="email" className="medit-input-3" defaultValue="[Email]" />
                </div>
                <div className="medit-phone-number">
                  <label className="medit-label" htmlFor="medit-phone-number">PHONE NUMBER</label>
                  <input id="medit-phone-number" name="phone-number" required type="tel" className="medit-input-4" defaultValue="[Phone]" />
                </div>
                <div className="medit-alternative-number">
                  <label className="medit-label" htmlFor="medit-alternative-number">ALTERNATIVE NUMBER</label>
                  <input id="medit-alternative-number" name="alternative-number" type="tel" className="medit-input-5" placeholder="[Alternative Number]" />
                </div>
                <div className="medit-edit-form-box-box">
                  <label className="medit-label">PATRON PHOTO</label>
                  <div className="medit-background-border-2">
                    <img className="medit-background-border-3" src="/svg/background-border-gidnu.svg" alt="" width="48" height="56" />
                    <div className="medit-background-border-2-box">
                      <div className="medit-background-border-2-box-box">
                        <span className="medit-background-border-2-box-box-text">Passport Size Photograph — JPG, PNG up to{' '}<br className="soft-br" />2MB. Clear front-facing view required.</span>
                      </div>
                      <label className="medit-label-3" htmlFor="medit-photo">{photo || 'BROWSE FILES'}</label>
                      <input id="medit-photo" name="photo" type="file" accept="image/jpeg,image/png" hidden onChange={(e) => setPhoto(e.target.files[0]?.name || '')} />
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
                    <input id="medit-street-address" name="street-address" className="medit-input-6" placeholder="[Street Address]" />
                  </div>
                  <div className="medit-3-column-row-city-area-district">
                    <div className="medit-3-column-row-city-area-district-box">
                      <label className="medit-label" htmlFor="medit-city-area">CITY / AREA</label>
                      <input id="medit-city-area" name="city-area" className="medit-input-7" placeholder="[City / Area]" />
                    </div>
                    <div className="medit-3-column-row-city-area-district-box">
                      <label className="medit-label" htmlFor="medit-district">DISTRICT</label>
                      <input id="medit-district" name="district" className="medit-input-8" placeholder="[District]" />
                    </div>
                    <div className="medit-3-column-row-city-area-district-box">
                      <label className="medit-label" htmlFor="medit-postal-code">POSTAL CODE</label>
                      <input id="medit-postal-code" name="postal-code" className="medit-input-9" placeholder="[Postal Code]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="medit-action-buttons">
                <button type="submit" className="medit-action-buttons-box">SAVE CHANGES</button>
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
