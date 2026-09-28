import { useEffect, useState } from 'react';

// Print / cite / share / save for the reading pages (blog post, creative writing, critique).
// There is no backend yet: "save" is remembered per page in this browser only.
const pageTitle = () => document.querySelector('main h1')?.innerText.replace(/\s+/g, ' ').trim() || document.title;

export function useArticleActions() {
  const key = `noholi.saved:${window.location.pathname}`;
  const [flash, setFlash] = useState(null); // which action just succeeded, for a brief label change
  const [saved, setSaved] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (!flash) return undefined;
    const id = setTimeout(() => setFlash(null), 2200);
    return () => clearTimeout(id);
  }, [flash]);

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlash(what);
    } catch {
      window.prompt('Copy this text:', text);
    }
  };

  const accessed = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    flash,
    saved,
    print: () => window.print(),
    cite: () => copy(`“${pageTitle()}.” Noholi Library & Press, Dhaka. ${window.location.href} (accessed ${accessed}).`, 'cite'),
    share: async () => {
      if (navigator.share) {
        try { await navigator.share({ title: pageTitle(), url: window.location.href }); } catch { /* dismissed */ }
      } else {
        copy(window.location.href, 'share');
      }
    },
    toggleSave: () => {
      const next = !saved;
      try { if (next) localStorage.setItem(key, '1'); else localStorage.removeItem(key); } catch { /* storage unavailable */ }
      setSaved(next);
      setFlash(next ? 'saved' : 'unsaved');
    },
  };
}
