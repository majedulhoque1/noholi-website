// Shared helpers for the `public-intake` edge function (supabase/CONTRACT.md §5):
// the join application and the contact form. Ported from v1 BecomeMember.jsx / Contact.jsx.
// Browser-only: call from event handlers, never during SSR.
import { supabase, describeError, isNetworkError } from "./supabase";
import { translate } from "./i18n";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turn whatever `functions.invoke` returned as `error` into one reader-facing line.
 * The function answers `{ error: { code, message } }` on non-2xx (supabase-js wraps those as
 * FunctionsHttpError with the Response in `.context`). HTTP 429 / NH429 is the throttle.
 */
export async function intakeError(error: unknown, fallback: string): Promise<string> {
  const ctx = (error as { context?: unknown } | null)?.context;
  if (ctx instanceof Response) {
    let code = "";
    let message = "";
    try {
      const body = await ctx.clone().json();
      code = body?.error?.code ?? "";
      message = body?.error?.message ?? "";
    } catch {
      /* not JSON */
    }
    if (ctx.status === 429 || code === "NH429")
      return message || translate("forms.intake.throttled");
    if (message) return message;
    return fallback;
  }
  // Never reached the function (offline, timed out): say so rather than blaming the form.
  if (isNetworkError(error)) return describeError(error);
  return fallback;
}

/**
 * POST to `public-intake`. Resolves with the reply only after a 2xx with `ok: true`;
 * otherwise throws an Error whose message is ready to show.
 */
export async function submitIntake(
  body: Record<string, unknown>,
  fallback: string,
): Promise<{
  ok: true;
  id?: string | null;
  photo_upload?: { path: string; token: string } | null;
}> {
  const { data, error } = await supabase.functions.invoke("public-intake", { body });
  if (error) throw new Error(await intakeError(error, fallback));
  if (!data?.ok) throw new Error(fallback);
  return data;
}

const MAX_SIDE = 800;
export const MAX_INPUT_BYTES = 15 * 1024 * 1024; // before compression; the bucket takes up to 5 MB after

/** Longest side at most 800px, re-encoded as WebP (JPEG where the browser can't encode WebP) at ~0.8. */
export async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(translate("forms.intake.photoUnreadable"));
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(translate("forms.intake.photoFailed"));
  ctx.fillStyle = "#fff"; // PNG transparency becomes white, not black, in JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.8));
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob) throw new Error(translate("forms.intake.photoFailed"));
  return blob;
}

export function isAllowedPhoto(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/.test(file.type) && file.size <= MAX_INPUT_BYTES;
}
