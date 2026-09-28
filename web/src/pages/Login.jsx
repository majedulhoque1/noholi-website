import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import './Login.css';

// Generated from Figma frame "Noholi Library — Log In (Before Login)" (36:3158) by tools/gen.py, then hand-edited.
// Sign-in: MEM-#### or email → resolve_login → signInWithPassword → my_role (see auth.jsx).
export default function Login() {
  const { member, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const from = location.state?.from;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const id = data.get('id')?.toString().trim();
    const password = data.get('password')?.toString() || '';
    if (!id || !password) {
      setError('Enter your membership number or email and your password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const row = await signIn(id, password);
      const next = row.must_change_password ? '/member/password' : from && from !== '/login' ? from : '/member/dashboard';
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  // Already signed in (e.g. visiting /login from a bookmark).
  if (member && !busy) return <Navigate to="/member/dashboard" replace />;

  return (
    <div className="login">
      <section className="login-maincontent">
        <div className="login-maincontent-box">
          <h1 className="login-login-page-header">Log In</h1>
          <div className="login-maincontent-box-box">
            <span className="login-maincontent-box-box-text">Access your Noholi Library account.</span>
          </div>
          <div className="login-centered-form-card">
            <form className="login-form" onSubmit={onSubmit} noValidate>
              <div className="login-field-1-membership-number-or-ema">
                <label className="login-label" htmlFor="login-id">MEMBERSHIP NUMBER OR EMAIL</label>
                <input className="login-input" id="login-id" name="id" autoComplete="username" required placeholder="e.g. MEM-0042 or your email" />
              </div>
              <div className="login-field-2-password">
                <label className="login-label" htmlFor="login-password">PASSWORD</label>
                <input className="login-input-2" id="login-password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
              </div>
              <div className="login-forgot-password-link">
                <button
                  type="button"
                  className="login-forgot-password-link-box"
                  aria-expanded={showForgot}
                  aria-controls="login-forgot-note"
                  onClick={() => setShowForgot((v) => !v)}
                >
                  Forgot password?
                </button>
              </div>
              {showForgot && (
                <p className="login-forgot-note" id="login-forgot-note" role="note">
                  Passwords are reset at the circulation desk. Visit or phone the library and a librarian will give you
                  a new temporary password; you will choose your own the next time you log in.{' '}
                  <Link to="/contact">Contact the library</Link>.
                </p>
              )}
              <button type="submit" className="login-submit-button" disabled={busy} aria-busy={busy}>
                <span className="login-submit-button-text">{busy ? 'LOGGING IN…' : 'LOG IN'}</span>
              </button>
              {error && <p className="login-error" role="alert">{error}</p>}
            </form>
          </div>
          <div className="login-footer-callout-link">
            <span className="login-footer-callout-link-text">{"Not a member yet? "}</span>
            <Link to="/become-a-member" className="login-footer-callout-link-text-2">Become a Member</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
