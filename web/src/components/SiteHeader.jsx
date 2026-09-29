import { startTransition, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { formatDhaka } from '../lib/dhakaDate.js';
import { useLang } from '../i18n/LanguageContext.jsx';
import { toggleTheme } from '../lib/theme.js';
import './SiteHeader.css';
import './SiteHeader.mobile.css';

// Dropdown contents come from the "… Hover" frames in Figma.
function useNavGroups(t) {
  return {
    LIBRARY: [
      { label: t('nav.about'), to: '/about' },
      { label: t('nav.gallery'), to: '/gallery' },
      { label: t('nav.rules'), to: '/rules' },
    ],
    RESOURCES: [
      { label: t('nav.eBooks'), to: '/e-books' },
      { label: t('nav.audioBooks'), to: '/audio-books' },
    ],
    WRITE_UPS: [
      { label: t('nav.blogs'), to: '/blogs' },
      { label: t('nav.creativeWritings'), to: '/creative-writings' },
      { label: t('nav.bookReviews'), to: '/book-reviews' },
    ],
    WISHLIST: [
      { label: t('nav.books'), to: '/wishlist/books' },
      { label: t('nav.audioBooks'), to: '/wishlist/audio-books' },
      { label: t('nav.eBooks'), to: '/wishlist/e-books' },
    ],
  };
}

const Chevron = () => <img className="nav-chevron" src="/svg/chevron-down.svg" alt="" width="14" height="14" />;

/** Click-or-hover dropdown. Only one menu is open at a time (tracked by the header). */
function Dropdown({ id, label, items, open, setOpen, triggerClass = 'nav-link nav-trigger', align = 'left', width, children }) {
  const isOpen = open === id;
  return (
    <div
      className="nav-dropdown"
      onMouseEnter={() => setOpen(id)}
      onMouseLeave={() => setOpen(null)}
    >
      <button
        type="button"
        className={triggerClass}
        style={width ? { width } : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setOpen(isOpen ? null : id)}
      >
        {children || <span>{label}</span>}
        <Chevron />
      </button>
      {isOpen && (
        <div className={`nav-menu nav-menu--${align}`} role="menu">
          {items.map((item) => (
            <Link key={item.to} to={item.to} role="menuitem" className="nav-menu-item" onClick={() => setOpen(null)}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountMenu({ open, setOpen }) {
  const { member, logOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const isOpen = open === 'account';
  return (
    <div className="nav-dropdown" onMouseEnter={() => setOpen('account')} onMouseLeave={() => setOpen(null)}>
      <button
        type="button"
        className="header-identity"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setOpen(isOpen ? null : 'account')}
      >
        <img src="/svg/user.svg" alt="" width="16" height="16" />
        <span>{member.shortName}</span>
        <Chevron />
      </button>
      {isOpen && (
        <div className="account-menu" role="menu">
          <div className="account-menu-head">
            <div>
              <p className="account-menu-name">{member.name}</p>
              <p className="account-menu-meta">
                <span>{member.cardNumber}</span>
                <span className="account-menu-dot">•</span>
                <span>{member.status === 'Active' ? t('header.activePatron') : t('header.accountStatus', { status: member.status })}</span>
              </p>
            </div>
            <span className="account-menu-badge">{t('header.patronBadge')}</span>
          </div>
          <div className="account-menu-list">
            <Link to="/member/profile" role="menuitem" className="account-menu-item" onClick={() => setOpen(null)}>
              <span>{t('header.viewProfile')}</span>
              <span className="account-menu-hint">{t('header.idAndBio')}</span>
            </Link>
            <Link to="/member/dashboard" role="menuitem" className="account-menu-item" onClick={() => setOpen(null)}>
              <span>{t('header.memberDashboard')}</span>
              <span className="account-menu-hint account-menu-hint--due">
                {member.overdueLoans ? t('header.overdueCount', { n: member.overdueLoans }) : t('header.dueCount', { n: member.activeLoans })}
              </span>
            </Link>
            <Link to="/member/edit" role="menuitem" className="account-menu-item" onClick={() => setOpen(null)}>
              <span>{t('header.accountSettings')}</span>
              <span className="account-menu-hint">{t('header.contactHint')}</span>
            </Link>
          </div>
          <div className="account-menu-foot">
            <span className="account-menu-active">
              {t('header.activeSince')}: <strong>{member.since ? formatDhaka(member.since, { hour: 'numeric', minute: '2-digit', hour12: true, locale: 'en-US' }) : '—'}</strong>
            </span>
            <button
              type="button"
              className="account-menu-logout"
              onClick={() => {
                // one transition: route change + sign-out render together, so a
                // member-only page never renders logged-out (which would bounce to /login)
                startTransition(() => {
                  navigate('/');
                  logOut();
                });
                setOpen(null);
              }}
            >
              {t('header.logOut')}
              <img src="/svg/log-out.svg" alt="" width="14" height="14" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Below 1180px the nav collapses into this full-width panel (the Figma design is desktop-only). */
function MobileMenu({ onClose }) {
  const { member, logOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const { LIBRARY, RESOURCES, WRITE_UPS, WISHLIST } = useNavGroups(t);
  const group = (title, items) => (
    <div className="mobile-menu-group" key={title}>
      <p className="mobile-menu-label">{title}</p>
      {items.map((i) => (
        <Link key={i.to} to={i.to} className="mobile-menu-link mobile-menu-link--sub" onClick={onClose}>{i.label}</Link>
      ))}
    </div>
  );
  return (
    <div className="mobile-menu" id="mobile-menu">
      <nav className="mobile-menu-nav" aria-label={t('mobileMenu.mainNavAria')}>
        <Link to="/" className="mobile-menu-link" onClick={onClose}>{t('mobileMenu.home')}</Link>
        <Link to="/catalog" className="mobile-menu-link" onClick={onClose}>{t('mobileMenu.browse')}</Link>
        <Link to="/noholi-books" className="mobile-menu-link" onClick={onClose}>{t('mobileMenu.noholiBooks')}</Link>
        <Link to="/contact" className="mobile-menu-link" onClick={onClose}>{t('mobileMenu.contact')}</Link>
        {group(t('mobileMenu.library'), LIBRARY)}
        {group(t('mobileMenu.resources'), RESOURCES)}
        {group(t('mobileMenu.writeUps'), WRITE_UPS)}
        {member && group(t('mobileMenu.wishlist'), WISHLIST)}
      </nav>
      {member ? (
        <div className="mobile-menu-account">
          <p className="mobile-menu-member">
            <img src="/svg/user.svg" alt="" width="16" height="16" />
            {member.name} <span>{member.cardNumber}</span>
          </p>
          <Link to="/member/profile" className="mobile-menu-link mobile-menu-link--sub" onClick={onClose}>{t('mobileMenu.viewProfile')}</Link>
          <Link to="/member/dashboard" className="mobile-menu-link mobile-menu-link--sub" onClick={onClose}>{t('mobileMenu.memberDashboard')}</Link>
          <Link to="/member/edit" className="mobile-menu-link mobile-menu-link--sub" onClick={onClose}>{t('mobileMenu.accountSettings')}</Link>
          <button
            type="button"
            className="account-menu-logout mobile-menu-logout"
            onClick={() => {
              startTransition(() => {
                navigate('/');
                logOut();
              });
              onClose();
            }}
          >
            {t('mobileMenu.logOut')}
            <img src="/svg/log-out.svg" alt="" width="14" height="14" />
          </button>
        </div>
      ) : (
        <div className="mobile-menu-actions">
          <Link to="/login" className="mobile-menu-login" onClick={onClose}>{t('mobileMenu.login')}</Link>
          <Link to="/become-a-member" className="header-cta mobile-menu-cta" onClick={onClose}>{t('mobileMenu.becomeMember')}</Link>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const { member } = useAuth();
  const [open, setOpen] = useState(null);
  const location = useLocation();
  const ref = useRef(null);
  const { t, lang, toggleLang } = useLang();
  const { LIBRARY, RESOURCES, WRITE_UPS, WISHLIST } = useNavGroups(t);

  // close menus on navigation, outside click and Escape
  useEffect(() => { setOpen(null); }, [location.pathname]);
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="site-header" ref={ref}>
      <div className={`site-header-inner${member ? ' is-member' : ''}`}>
        <Link to="/" className="header-logo" aria-label={t('header.homeAria')}>
          <img src="/images/logo-header.png" alt="Noholi" width="61.31" height="40" />
        </Link>

        <nav className="header-nav" aria-label="Main">
          {/* widths pinned to the Figma layer widths so every item lands on its design x */}
          <NavLink to="/" end className="nav-link" style={{ width: 36.67 }}>{t('nav.home')}</NavLink>
          <NavLink to="/catalog" className="nav-link" style={{ width: 45.47 }}>{t('nav.browse')}</NavLink>
          <Dropdown id="library" label={t('nav.library')} items={LIBRARY} open={open} setOpen={setOpen} width={63.78} />
          <Dropdown id="resources" label={t('nav.resources')} items={RESOURCES} open={open} setOpen={setOpen} width={82.61} />
          <Dropdown id="writeups" label={t('nav.writeUps')} items={WRITE_UPS} open={open} setOpen={setOpen} width={79.39} />
          <NavLink to="/noholi-books" className="nav-link" style={{ width: 82.08 }}>{t('nav.noholiBooks')}</NavLink>
          <NavLink to="/contact" className="nav-link" style={{ width: 48.16 }}>{t('nav.contact')}</NavLink>
        </nav>

        <div className="header-utility">
          <button
            type="button"
            className="header-lang"
            lang={lang === 'bn' ? 'en' : 'bn'}
            aria-label={lang === 'bn' ? t('header.switchToEnglish') : t('header.switchToBangla')}
            onClick={toggleLang}
          >
            {lang === 'bn' ? t('header.langButtonEn') : t('header.langButtonBn')}
          </button>
          <button type="button" className="header-theme" aria-label={t('header.toggleDarkTheme')} onClick={toggleTheme}>
            <img src="/svg/moon.svg" alt="" width="16" height="16" />
          </button>
          <button
            type="button"
            className="header-burger"
            aria-label={open === 'mobile' ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={open === 'mobile'}
            aria-controls="mobile-menu"
            onClick={() => setOpen(open === 'mobile' ? null : 'mobile')}
          >
            <span className={`header-burger-lines${open === 'mobile' ? ' is-open' : ''}`} aria-hidden="true" />
          </button>
          {member ? (
            <>
              <Dropdown
                id="wishlist"
                label={t('nav.wishlist')}
                items={WISHLIST}
                open={open}
                setOpen={setOpen}
                triggerClass="header-wishlist"
                align="right"
              />
              <AccountMenu open={open} setOpen={setOpen} />
            </>
          ) : (
            <>
              <Link to="/login" className="header-login">{t('header.login')}</Link>
              <Link to="/become-a-member" className="header-cta">{t('header.becomeMemberCta')}</Link>
            </>
          )}
        </div>
      </div>
      {open === 'mobile' && <MobileMenu onClose={() => setOpen(null)} />}
    </header>
  );
}
