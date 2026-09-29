import { createClient } from '@supabase/supabase-js';

// Public (anon) key only — safe to ship. What anon can read is limited by the
// database itself (see supabase/CONTRACT.md); never put a service key here.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly in dev; in a prod build this means the Pages env vars are missing.
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — see web/.env.development.example');
}

// On a flaky connection a request can stall at the connect step and the browser waits a
// minute or more, leaving buttons stuck on "Logging in…". Give every request a deadline, and
// retry once when it never got through — but only requests that are safe to repeat (reads and
// the password grant), so a borrow request or form can't be submitted twice.
const TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 60000;

// Read-only RPCs (POST on the wire, but repeating them changes nothing).
const READ_ONLY_RPCS = ['resolve_login', 'my_role', 'search_books', 'catalog_facets', 'get_public_settings'];

function isRepeatable(input, init) {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (method === 'GET' || method === 'HEAD' || href.includes('/auth/v1/token')) return true;
  return READ_ONLY_RPCS.some((name) => href.includes(`/rest/v1/rpc/${name}`));
}

async function fetchWithDeadline(input, init = {}) {
  const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const limit = href.includes('/storage/v1/object') ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS;
  const attempts = isRepeatable(input, init) ? 2 : 1;
  for (let attempt = 1; ; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), limit);
    const onCallerAbort = () => ctrl.abort();
    init.signal?.addEventListener('abort', onCallerAbort, { once: true });
    try {
      return await fetch(input, { ...init, signal: ctrl.signal });
    } catch (err) {
      if (init.signal?.aborted || attempt >= attempts) throw err;
    } finally {
      clearTimeout(timer);
      init.signal?.removeEventListener('abort', onCallerAbort);
    }
  }
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'noholi.web.auth' },
  global: { fetch: fetchWithDeadline },
});

/** True when a request never reached the server (offline, timed out, connection dropped). */
export function isNetworkError(err) {
  if (!err) return false;
  const text = `${err.name || ''} ${err.message || ''}`;
  return err.status === 0 || /AuthRetryableFetchError|Failed to fetch|NetworkError|Load failed|AbortError|aborted/i.test(text);
}

export const NETWORK_ERROR = "Couldn't reach the Noholi server. Check your internet connection and try again.";

/** One readable line from a Supabase/PostgREST error. RPC messages are written for readers (CONTRACT.md). */
export function describeError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (typeof err === 'string') return err;
  const parts = [err.message || 'Something went wrong. Please try again.'];
  if (err.details && !parts[0].includes(err.details)) parts.push(err.details);
  if (err.hint) parts.push(err.hint);
  return parts.join(' — ');
}
