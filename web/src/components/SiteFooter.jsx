import { Link } from 'react-router-dom';
import './SiteFooter.css';

// Noholi OS (staff console). Override with VITE_ADMIN_URL when it moves to a custom domain.
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://noholi-admin.pages.dev';

// "MainFooter" / "Footer - FULL FOOTER" in Figma — identical on every page.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-columns">
          <div className="site-footer-col">
            <Link to="/" className="site-footer-logo" aria-label="Noholi Library home">
              <img src="/images/logo-footer.png" alt="Noholi" width="73.58" height="48" />
            </Link>
            <p className="site-footer-tagline">Your gateway to knowledge and discovery.</p>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">Quick Links</h3>
            <div className="site-footer-links">
              <Link to="/catalog">Browse Catalog</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/privacy">Privacy Notice</Link>
            </div>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">Hours</h3>
            <p className="site-footer-text">[Hours — to confirm]</p>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>© 2026 Noholi Library. All rights reserved.</p>
          <a href={ADMIN_URL} className="site-footer-admin" rel="nofollow">Staff login</a>
        </div>
      </div>
    </footer>
  );
}
