import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import './Login.css';

// Generated from Figma frame "Noholi Library — Log In (Before Login)" (36:3158) by tools/gen.py, then hand-edited.
export default function Login() {
  const { logIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Demo login: any membership number/email plus a password signs in.
  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!data.get('id')?.toString().trim() || !data.get('password')) {
      setError('Enter your membership number or email and your password.');
      return;
    }
    logIn();
    navigate('/member/dashboard');
  };

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
                <input className="login-input" id="login-id" name="id" autoComplete="username" required placeholder="e.g. NL-8842 or reader@example.com" />
              </div>
              <div className="login-field-2-password">
                <label className="login-label" htmlFor="login-password">PASSWORD</label>
                <input className="login-input-2" id="login-password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
              </div>
              <div className="login-forgot-password-link">
                <Link to="/contact" className="login-forgot-password-link-box">Forgot password?</Link>
              </div>
              <button type="submit" className="login-submit-button">
                <span className="login-submit-button-text">LOG IN</span>
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
