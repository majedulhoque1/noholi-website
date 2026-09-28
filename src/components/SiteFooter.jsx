import { Link } from 'react-router-dom';
import './SiteFooter.css';

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
            </div>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">Hours</h3>
            <p className="site-footer-text">[Hours — to confirm]</p>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>© 2026 Noholi Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
