import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext.jsx';

// Temporary stand-in for pages that have not been built from the Figma file yet.
export default function ComingSoon() {
  const { t } = useLang();
  return (
    <div style={{ padding: '120px 24px', textAlign: 'center', background: 'var(--paper)' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: '40px', marginBottom: 12 }}>{t('comingSoonPage.title')}</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>{t('comingSoonPage.text')}</p>
      <Link to="/" style={{ color: 'var(--oxblood)', fontWeight: 600 }}>{t('comingSoonPage.backHome')}</Link>
    </div>
  );
}
