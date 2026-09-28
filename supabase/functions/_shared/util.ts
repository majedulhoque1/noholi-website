// Shared helpers for Noholi edge functions.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const MEMBER_EMAIL_DOMAIN = "members.noholi.app";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Error body shape used by every function: { error: { code, message } } */
export function fail(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, status);
}

export function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split(".")[1] ?? "";
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  return JSON.parse(atob(b64));
}

export type Caller = { userId: string; role: "admin" | "staff"; aal: string };

/**
 * Verifies the bearer token with Auth (signature + expiry + user still exists),
 * then checks staff_roles. Returns a Response on failure.
 */
export async function requireStaff(
  req: Request,
  admin: SupabaseClient,
  opts: { admin?: boolean } = {},
): Promise<Caller | Response> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return fail(401, "NH001", "Please sign in.");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return fail(401, "NH001", "Your session has expired. Please sign in again.");
  const { data: roleRow, error: roleErr } = await admin
    .from("staff_roles").select("role").eq("user_id", data.user.id).maybeSingle();
  if (roleErr) return fail(500, "NH500", "Could not check your staff access.");
  if (!roleRow) return fail(403, "NH001", "Only library staff can do this.");
  const aal = String(decodeJwtPayload(token).aal ?? "aal1");
  if (opts.admin) {
    if (roleRow.role !== "admin") return fail(403, "NH001", "Only an administrator can do this.");
    if (aal !== "aal2") {
      return fail(403, "NH002", "Please verify with your authenticator app (two-factor sign-in) first.");
    }
  }
  return { userId: data.user.id, role: roleRow.role, aal };
}

/** 12-char temporary password from an unambiguous alphabet (no 0/O, 1/l/I). */
export function tempPassword(length = 12): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const out: string[] = [];
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  for (const n of buf) out.push(alphabet[n % alphabet.length]);
  // guarantee at least one digit and one letter
  if (!/[0-9]/.test(out.join(""))) out[length - 1] = "7";
  if (!/[A-Za-z]/.test(out.join(""))) out[0] = "K";
  return out.join("");
}

export function memberEmail(memberId: string): string {
  return `${memberId.toLowerCase()}@${MEMBER_EMAIL_DOMAIN}`;
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
