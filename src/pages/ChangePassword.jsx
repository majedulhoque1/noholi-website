import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ChangePassword.css';

const FIELDS = [
  ['current-password', 'current password'],
  ['new-password', 'new password'],
  ['confirm-new-password', 'confirmation of the new password'],
];

// Generated from Figma frame "Noholi Library — Change Password" (49:290) by tools/gen_member.py, then hand-edited.
export default function ChangePassword() {
  const [shown, setShown] = useState({});
  const [status, setStatus] = useState(null);
  const toggle = (name) => setShown((v) => ({ ...v, [name]: !v[name] }));
  const eye = (name) => (
    <button type="button" className="mpass-toggle-password-visibility" aria-label={shown[name] ? 'Hide password' : 'Show password'} aria-controls={`mpass-${name}`} onClick={() => toggle(name)}>
      <img src="/svg/button-toggle-password-visibility-drzb7x.svg" alt="" width="25" height="20" />
    </button>
  );

  // No backend yet: check the fields against the listed requirements and confirm inline.
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (n) => String(data.get(n) || '');
    const missing = FIELDS.filter(([n]) => !get(n)).map(([, label]) => label);
    let text = null;
    if (missing.length) text = `Please enter your ${missing.join(' and ')}.`;
    else if (get('new-password').length < 8) text = 'The new password must be at least 8 characters.';
    else if (!/[0-9!@#$%]/.test(get('new-password'))) text = 'The new password needs a numeral or one of ! @ # $ %.';
    else if (get('new-password') === get('current-password')) text = 'The new password must differ from the current one.';
    else if (get('new-password') !== get('confirm-new-password')) text = 'The new password and its confirmation do not match.';
    if (text) {
      setStatus({ ok: false, text });
      return;
    }
    form.reset();
    setStatus({ ok: true, text: 'Password updated successfully.' });
  };

  return (
    <div className="mpass">
      <section className="mpass-main-main-content--root">
        <section className="mpass-main-main-content-2">
          <nav className="mpass-nav-breadcrumb">
            <nav className="mpass-nav-breadcrumb-2">
              <Link to="/" className="mpass-nav-breadcrumb-2-text">{"HOME "}</Link>
              <span className="mpass-nav-breadcrumb-2-text-2">/</span>
              <Link to="/member/dashboard" className="mpass-nav-breadcrumb-2-text">{"MY DASHBOARD "}</Link>
              <span className="mpass-nav-breadcrumb-2-text-2">/</span>
              <Link to="/member/profile" className="mpass-nav-breadcrumb-2-text">{"PROFILE "}</Link>
              <span className="mpass-nav-breadcrumb-2-text-2">/</span>
              <span className="mpass-nav-breadcrumb-2-text-3">CHANGE PASSWORD</span>
            </nav>
          </nav>
          <div className="mpass-page-header">
            <div className="mpass-page-header-2">
              <div className="mpass-page-header-2-box">
                <div className="mpass-page-header-2-box-box" />
                <div className="mpass-page-header-2-box-box-2">
                  <span className="mpass-page-header-2-box-box-2-text">PATRON ARCHIVAL REGISTRY</span>
                </div>
              </div>
              <h1 className="mpass-heading-1">Change Password</h1>
              <div className="mpass-page-header-2-box-2">
                <span className="mpass-update-your-patron-access-creden">Update your patron access credentials and account security.</span>
              </div>
            </div>
          </div>
          <div className="mpass-stacked-form-view-sections">
            <div className="mpass-card-header">
              <p className="mpass-paragraph">
                <span className="mpass-heading-2">Change Password</span>
                <span className="mpass-paragraph-text">SECTION 03 — SECURITY</span>
              </p>
            </div>
            <form className="mpass-form" onSubmit={onSubmit} noValidate>
              <div className="mpass-form-box">
                <div className="mpass-current-password">
                  <label className="mpass-label" htmlFor="mpass-current-password">CURRENT PASSWORD *</label>
                  <div className="mpass-current-password-box">
                    <input id="mpass-current-password" name="current-password" required autoComplete="current-password" className="mpass-input" type={shown['current-password'] ? 'text' : 'password'} placeholder="••••••••" />
                    {eye('current-password')}
                  </div>
                </div>
                <div className="mpass-new-password">
                  <label className="mpass-label" htmlFor="mpass-new-password">NEW PASSWORD *</label>
                  <div className="mpass-new-password-box">
                    <input id="mpass-new-password" name="new-password" required autoComplete="new-password" className="mpass-input-2" type={shown['new-password'] ? 'text' : 'password'} placeholder="••••••••" />
                    {eye('new-password')}
                  </div>
                </div>
                <div className="mpass-confirm-new-password">
                  <label className="mpass-label" htmlFor="mpass-confirm-new-password">CONFIRM NEW PASSWORD *</label>
                  <div className="mpass-confirm-new-password-box">
                    <input id="mpass-confirm-new-password" name="confirm-new-password" required autoComplete="new-password" className="mpass-input-3" type={shown['confirm-new-password'] ? 'text' : 'password'} placeholder="••••••••" />
                    {eye('confirm-new-password')}
                  </div>
                </div>
              </div>
              <div className="mpass-password-guidelines-box">
                <div className="mpass-password-guidelines-box-box">
                  <img className="mpass-password-guidelines-box-box-box" src="/svg/container-ue84qw.svg" alt="" width="10" height="13" />
                  <div className="mpass-password-guidelines-box-box-box-2">
                    <span className="mpass-password-guidelines-box-box-box-2-text">PASSWORD REQUIREMENTS</span>
                  </div>
                </div>
                <ul className="mpass-list">
                  <li className="mpass-item">
                    <div className="mpass-item-box">
                      <span className="mpass-item-box-text">•</span>
                    </div>
                    <span className="mpass-item-text">Minimum 8 characters in length</span>
                  </li>
                  <li className="mpass-item">
                    <div className="mpass-item-box">
                      <span className="mpass-item-box-text">•</span>
                    </div>
                    <span className="mpass-item-text">At least one numeral or classical orthographic glyph (!, @, #, $, %)</span>
                  </li>
                  <li className="mpass-item">
                    <div className="mpass-item-box">
                      <span className="mpass-item-box-text">•</span>
                    </div>
                    <span className="mpass-item-text">Must differ from preceding catalog access credentials</span>
                  </li>
                </ul>
              </div>
              <div className="mpass-action-buttons">
                <button type="submit" className="mpass-action-buttons-box">UPDATE PASSWORD</button>
                <Link to="/member/profile" className="mpass-action-buttons-box-2">CANCEL</Link>
                {/* designed as a hidden success note: shown once the form is submitted */}
                <div className="mpass-action-buttons-box-3" role="status" aria-live="polite" style={status ? { opacity: 1 } : undefined}>
                  <span className="mpass-action-buttons-box-3-text">{status ? status.text : 'PASSWORD UPDATED SUCCESSFULLY.'}</span>
                </div>
              </div>
            </form>
          </div>
          <div className="mpass-footer-desk-assistance-notice">
            <div className="mpass-footer-desk-assistance-notice-2">
              <div className="mpass-footer-desk-assistance-notice-2-box">
                <span className="mpass-footer-desk-assistance-notice-2-box-text">Contact the circulation desk with questions.</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
