import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.js';
import bn from './bn.js';

// Dependency-free i18n: two flat-ish dictionaries (namespaced keys, e.g. "header.login"),
// a React context for components, and a module-level `translate()` for code that runs
// outside React (module-level constants in auth.jsx, lib/supabase.js, etc).

const DICTS = { en, bn };
const STORAGE_KEY = 'noholi.lang';
const LanguageContext = createContext(null);

// Mirrors the active language for translate(), which has no access to React context.
let currentLang = 'en';

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'bn' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

function getPath(dict, path) {
  return path.split('.').reduce((v, k) => (v == null ? v : v[k]), dict);
}

function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
}

function lookup(lang, key) {
  const val = getPath(DICTS[lang] || DICTS.en, key);
  return val != null ? val : getPath(DICTS.en, key);
}

/**
 * For module-level strings used outside React (e.g. auth.jsx error messages, lib/supabase.js).
 * Reads whatever language is active *right now* — call it inside a function body, not at
 * module load, so it reflects the language current when the message is actually needed.
 */
export function translate(key, vars) {
  const val = lookup(currentLang, key);
  return val != null ? interpolate(val, vars) : key;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readStored() || 'en');

  useEffect(() => {
    currentLang = lang;
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable (private mode, quota, etc.) */
    }
  }, [lang]);

  const setLang = (next) => setLangState(next === 'bn' ? 'bn' : 'en');
  const toggleLang = () => setLangState((l) => (l === 'bn' ? 'en' : 'bn'));

  const t = useMemo(() => (key, vars) => {
    const val = lookup(lang, key);
    return val != null ? interpolate(val, vars) : key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
