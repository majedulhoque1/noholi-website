import { supabase } from "@/integrations/supabase/client";

/** Error shape every hook returns. `message` is safe to show to staff as-is. */
export interface RpcError {
  message: string;
  code?: string;
}

export type Result<T = void> = { success: true; data: T } | { success: false; error: string; code?: string };

/**
 * Turns a PostgREST / Supabase error into one readable line.
 * Our RPCs raise plain-English messages with NH0xx codes (see supabase/CONTRACT.md),
 * so `message` is usually enough; hint/details are appended when they add something.
 */
export function describeError(err: unknown): RpcError {
  if (!err) return { message: "Unknown error" };
  if (typeof err === "string") return { message: err };
  const e = err as { message?: string; hint?: string | null; details?: string | null; code?: string };
  const parts = [e.message || "Request failed"];
  if (e.details && !parts[0].includes(e.details)) parts.push(e.details);
  if (e.hint) parts.push(e.hint);
  return { message: parts.join(" — "), code: e.code };
}

/** Calls a database RPC and normalises the outcome. */
export async function callRpc<T = unknown>(fn: string, args?: Record<string, unknown>): Promise<Result<T>> {
  // The generated types don't cover every overload; keep the call loosely typed here.
  const { data, error } = await (supabase.rpc as unknown as (
    f: string,
    a?: Record<string, unknown>,
  ) => Promise<{ data: T; error: unknown }>)(fn, args);
  if (error) {
    const { message, code } = describeError(error);
    return { success: false, error: message, code };
  }
  return { success: true, data };
}
