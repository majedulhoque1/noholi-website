// Night (dark) mode: tiny state machine around `document.documentElement.dataset.theme`.
//
// - getTheme() reads the effective theme ('light' | 'dark'): an explicit stored
//   choice wins, otherwise whatever is already applied to <html> (set by the
//   inline script in index.html), otherwise the OS preference.
// - setTheme(theme) applies + persists an explicit choice.
// - toggleTheme() flips light/dark and returns the new theme.
//
// While nothing is stored, the page keeps following OS `prefers-color-scheme`
// changes live. Once the visitor (or setTheme) picks a theme, storage wins from
// then on and the OS listener becomes a no-op.

const STORAGE_KEY = 'noholi.theme';
const THEMES = ['light', 'dark'];
const EVENT_NAME = 'noholi:themechange';

const LIGHT_THEME_COLOR = '#fdf9f0';
const DARK_THEME_COLOR = '#15120e';

function safeGetItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / storage disabled — theme just won't persist */
  }
}

function readStored() {
  if (typeof window === 'undefined') return null;
  const v = safeGetItem(STORAGE_KEY);
  return THEMES.includes(v) ? v : null;
}

function systemTheme() {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch {
    /* matchMedia unavailable */
  }
  return 'light';
}

function appliedTheme() {
  if (typeof document === 'undefined') return null;
  const v = document.documentElement.dataset.theme;
  return THEMES.includes(v) ? v : null;
}

/** The effective theme right now: stored choice > already-applied > OS preference. */
export function getTheme() {
  return readStored() || appliedTheme() || systemTheme();
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { theme } }));
  } catch {
    /* CustomEvent unavailable in this environment — nothing else depends on it */
  }
}

/** Apply + persist an explicit theme choice ('light' | 'dark'). */
export function setTheme(theme) {
  const next = THEMES.includes(theme) ? theme : 'light';
  applyTheme(next);
  safeSetItem(STORAGE_KEY, next);
  return next;
}

/** Flip the current theme and persist the result. Returns the new theme. */
export function toggleTheme() {
  return setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// Sync on load: make sure <meta name="theme-color"> matches whatever the
// inline head script already applied (or fall back to system) — without
// writing to storage, so an unset preference still follows the OS.
if (typeof document !== 'undefined') {
  applyTheme(getTheme());
}

// Follow OS theme changes live, but only while the visitor hasn't chosen one.
if (typeof window !== 'undefined' && window.matchMedia) {
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e) => {
      if (readStored()) return; // explicit choice already made — stop following
      applyTheme(e.matches ? 'dark' : 'light');
    };
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onSystemChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onSystemChange); // Safari < 14
    }
  } catch {
    /* matchMedia listener unavailable — theme still works, just won't live-follow OS */
  }
}
