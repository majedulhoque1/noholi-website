import { useRef, useState } from 'react';
import './memberStudio.css';

// Shared behaviour for the member-only form pages (writing studio, wishlist requests).
// Nothing here changes how a page looks until the visitor interacts with it.

/**
 * Online writing submissions and wishlists are not built yet (no backend). Forms still check
 * their fields, then say plainly that nothing was sent.
 */
export const SOON_STUDIO = 'Coming soon: online submissions to the editorial desk are not open yet, so nothing was sent. Save a draft in this browser, or bring your manuscript to the circulation desk.';
export const SOON_REQUEST = 'Coming soon: requests cannot be sent online yet, so nothing was sent. Please ask at the circulation desk.';

/** Honest empty state for lists that have no data source yet, drawn inside the page's own layout. */
export function ComingSoon({ title = 'Coming soon', children, action }) {
  return (
    <div className="studio-soon" role="note">
      <span className="studio-soon-kicker">COMING SOON / শীঘ্রই আসছে</span>
      <p className="studio-soon-title">{title}</p>
      {children && <p className="studio-soon-text">{children}</p>}
      {action}
    </div>
  );
}

/** Validates `required` ([name, label] pairs, plus checkbox names) and returns an inline status. */
export function useSubmission(required, successText, { ok: successOk = true } = {}) {
  const [status, setStatus] = useState(null);
  const submit = (e, extraCheck) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const missing = required
      .filter(([name]) => {
        const el = form.elements.namedItem(name);
        if (el && el.type === 'checkbox') return !el.checked;
        return !String(data.get(name) || '').trim();
      })
      .map(([, label]) => label);
    if (missing.length) {
      setStatus({ ok: false, text: `Please complete: ${missing.join(', ')}.` });
      return false;
    }
    const problem = extraCheck ? extraCheck(data, form) : null;
    if (problem) {
      setStatus({ ok: false, text: problem });
      return false;
    }
    setStatus({ ok: successOk, text: successText });
    return true;
  };
  return { status, setStatus, submit };
}

/** Saves the form's fields under `key` in this browser (demo "draft" storage). */
export function saveDraft(form, key) {
  if (!form) return false;
  const draft = {};
  for (const [k, v] of new FormData(form).entries()) if (typeof v === 'string') draft[k] = v;
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), draft }));
    return true;
  } catch {
    return false;
  }
}

const WRAP = {
  h2: ['## ', '', true],
  h3: ['### ', '', true],
  bold: ['**', '**'],
  italic: ['*', '*'],
  quote: ['> ', '', true],
  citation: ['[^', ']'],
  break: ['\n* * *\n', '', true],
  stanza: ['\n', '', true],
  indent: ['    ', '', true],
  ornament: [' ❦ ', ''],
};

/** A markdown-style manuscript textarea: toolbar insertions, live word count, clear. */
export function useManuscript(initial = '') {
  const ref = useRef(null);
  const [text, setText] = useState(initial);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const apply = (kind) => {
    const el = ref.current;
    if (!el) return;
    const [pre, post, lineStart] = WRAP[kind];
    const { selectionStart: a, selectionEnd: b, value } = el;
    const needsBreak = lineStart && a > 0 && value[a - 1] !== '\n' ? '\n' : '';
    const head = value.slice(0, a) + needsBreak + pre;
    const next = head + value.slice(a, b) + post + value.slice(b);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(head.length, head.length + (b - a));
    });
  };
  return { ref, text, setText, words, apply, clear: () => setText('') };
}

/**
 * A native <select> laid invisibly over a designed select box, so the Figma drawing stays
 * as-is while the control works (keyboard, screen readers, mobile pickers).
 */
export function OverlaySelect({ id, name, value, onChange, options, required, label }) {
  return (
    <select
      id={id}
      name={name}
      className="studio-overlay-select"
      value={value}
      required={required}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
      ))}
    </select>
  );
}

/** Inline result line shown under a form once it has been submitted. */
export function Status({ status, className = '' }) {
  if (!status) return null;
  return (
    <p className={`studio-status ${status.ok ? 'studio-status--ok' : ''} ${className}`} role="status" aria-live="polite">
      {status.text}
    </p>
  );
}
