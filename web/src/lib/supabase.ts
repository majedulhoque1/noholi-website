import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { translate } from "./i18n";

// Ported from web-legacy/src/lib/supabase.js.
// Public (anon) key only — safe to ship. What anon can read is limited by the database itself
// (see supabase/CONTRACT.md); never put a service key here.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly in dev; in a prod build this means the Vercel env vars are missing.
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — see web/.env.development.example");
}

// createClient() throws on an empty URL, which would take the whole site down (even pages that
// never touch the backend). With the env vars missing, use an unresolvable placeholder instead:
// requests then fail as network errors and the UI shows them (the console.error above says why).
const PLACEHOLDER_URL = "https://supabase-not-configured.invalid";

// On a flaky connection a request can stall at the connect step and the browser waits a
// minute or more, leaving buttons stuck on "Logging in…". Give every request a deadline, and
// retry once when it never got through — but only requests that are safe to repeat (reads and
// the password grant), so a borrow request or form can't be submitted twice.
const TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 60000;

// Read-only RPCs (POST on the wire, but repeating them changes nothing).
const READ_ONLY_RPCS = ["resolve_login", "my_role", "search_books", "catalog_facets", "get_public_settings"];

function hrefOf(input: RequestInfo | URL): string {
  return typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
}

function isRepeatable(input: RequestInfo | URL, init?: RequestInit): boolean {
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  const href = hrefOf(input);
  if (method === "GET" || method === "HEAD" || href.includes("/auth/v1/token")) return true;
  return READ_ONLY_RPCS.some((name) => href.includes(`/rest/v1/rpc/${name}`));
}

async function fetchWithDeadline(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const limit = hrefOf(input).includes("/storage/v1/object") ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS;
  const attempts = isRepeatable(input, init) ? 2 : 1;
  for (let attempt = 1; ; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), limit);
    const onCallerAbort = () => ctrl.abort();
    init.signal?.addEventListener("abort", onCallerAbort, { once: true });
    try {
      return await fetch(input, { ...init, signal: ctrl.signal });
    } catch (err) {
      if (init.signal?.aborted || attempt >= attempts) throw err;
    } finally {
      clearTimeout(timer);
      init.signal?.removeEventListener("abort", onCallerAbort);
    }
  }
}

function createBrowserClient(): SupabaseClient {
  return createClient(url || PLACEHOLDER_URL, anonKey || "missing-anon-key", {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "noholi.web.auth" },
    global: { fetch: fetchWithDeadline },
  });
}

/**
 * Browser client: persists the member session in localStorage and uses the deadline fetch.
 * Only created in the browser. Touching it during SSR throws — use `supabasePublic` in route
 * loaders, and call `supabase` from effects/event handlers only.
 */
export const supabase: SupabaseClient =
  typeof window !== "undefined"
    ? createBrowserClient()
    : (new Proxy({} as SupabaseClient, {
        get() {
          throw new Error(
            "The browser Supabase client was used on the server. Use `supabasePublic` in route loaders; use `supabase` only in effects and event handlers.",
          );
        },
      }) as SupabaseClient);

/**
 * Anonymous client, no stored session: safe for SSR route loaders and any public read
 * (books, search_books, catalog_facets, get_public_settings). Also uses the deadline fetch.
 */
export const supabasePublic: SupabaseClient = createClient(url || PLACEHOLDER_URL, anonKey || "missing-anon-key", {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: fetchWithDeadline },
});

type ErrorLike = { name?: string; message?: string; status?: number; details?: string; hint?: string };

/** True when a request never reached the server (offline, timed out, connection dropped). */
export function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  const e = err as ErrorLike;
  const text = `${e.name || ""} ${e.message || ""}`;
  return e.status === 0 || /AuthRetryableFetchError|Failed to fetch|NetworkError|Load failed|AbortError|aborted/i.test(text);
}

// Getter (not a plain string): a plain constant would freeze in whatever language was active
// the moment this module first loaded. Callers do `new Error(NETWORK_ERROR())` — see auth.tsx.
export const NETWORK_ERROR = () => translate("supabaseLib.networkError");

/**
 * One readable line from a Supabase/PostgREST error. RPC messages are written for readers
 * (CONTRACT.md) and come back from Postgres in English only — this front end has no way to
 * translate them, so only our own generic fallback is localized here.
 */
export function describeError(err: unknown): string {
  if (!err) return translate("supabaseLib.genericError");
  if (typeof err === "string") return err;
  const e = err as ErrorLike;
  const parts = [e.message || translate("supabaseLib.genericError")];
  if (e.details && !parts[0].includes(e.details)) parts.push(e.details);
  if (e.hint) parts.push(e.hint);
  return parts.join(" — ");
}
