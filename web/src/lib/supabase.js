import { createClient } from '@supabase/supabase-js';

// Public (anon) key only — safe to ship. What anon can read is limited by the
// database itself (see supabase/CONTRACT.md); never put a service key here.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly in dev; in a prod build this means the Pages env vars are missing.
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — see web/.env.development.example');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'noholi.web.auth' },
});

/** One readable line from a Supabase/PostgREST error. RPC messages are written for readers (CONTRACT.md). */
export function describeError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (typeof err === 'string') return err;
  const parts = [err.message || 'Something went wrong. Please try again.'];
  if (err.details && !parts[0].includes(err.details)) parts.push(err.details);
  if (err.hint) parts.push(err.hint);
  return parts.join(' — ');
}
