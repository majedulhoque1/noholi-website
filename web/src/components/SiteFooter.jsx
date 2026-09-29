import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext.jsx';
import './SiteFooter.css';

// Noholi OS (staff console). Override with VITE_ADMIN_URL when it moves to a custom domain.
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://noholi-admin1.vercel.app';

// "MainFooter" / "Footer - FULL FOOTER" in Figma — identical on every page.
export default function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-columns">
          <div className="site-footer-col">
            <Link to="/" className="site-footer-logo" aria-label={t('footer.homeAria')}>
              <img src="/images/logo-footer.png" alt="Noholi" width="73.58" height="48" />
            </Link>
            <p className="site-footer-tagline">{t('footer.tagline')}</p>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">{t('footer.quickLinks')}</h3>
            <div className="site-footer-links">
              <Link to="/catalog">{t('footer.browseCatalog')}</Link>
              <Link to="/contact">{t('footer.contactUs')}</Link>
              <Link to="/privacy">{t('footer.privacyNotice')}</Link>
            </div>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">{t('footer.hours')}</h3>
            <p className="site-footer-text">{t('footer.hoursPlaceholder')}</p>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>{t('footer.copyright')}</p>
          <a href={ADMIN_URL} className="site-footer-admin" rel="nofollow">{t('footer.staffLogin')}</a>
        </div>
      </div>
    </footer>
  );
}
