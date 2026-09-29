// Public (anon) intake for the website's "Become a member" and "Contact" forms.
//
// POST { type: "application", name, phone, email?, street?, city?, district?,
//        postal_code?, has_photo?: boolean, website?: "" }
//   -> { ok: true, type, id: "APP-0001", photo_upload: { path, token, signed_url } | null }
// POST { type: "contact", name, email? , phone?, subject?, message, website?: "" }
//   -> { ok: true, type, id: "<message id>" }
//
// `website` is a honeypot: humans never fill it. When it is filled we answer
// { ok: true, id: null } and store nothing.
// Throttle (inside the DB, atomic): 3 per phone per 24h, 5 per IP per 24h
// (per form type), 30 per hour across the whole site -> HTTP 429, code NH429.
import { adminClient, corsHeaders, serve, fail, json, readJson, sha256Hex } from "../_shared/util.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail(405, "NH004", "Use POST.");

  const body = await readJson(req);
  if (!body) return fail(400, "NH004", "The form could not be read.");
  const type = String(body.type ?? "");
  if (type !== "application" && type !== "contact") return fail(400, "NH004", "Unknown form type.");

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, type, id: null, photo_upload: null });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "")
    .split(",")[0].trim();
  const salt = Deno.env.get("INTAKE_IP_SALT") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "noholi";
  const ipHash = ip ? await sha256Hex(`${salt}:${ip}`) : null;

  const str = (k: string, max: number) => {
    const v = body[k];
    return typeof v === "string" ? v.slice(0, max) : null;
  };
  const payload = type === "application"
    ? {
      name: str("name", 200), phone: str("phone", 30), email: str("email", 200),
      street: str("street", 300), city: str("city", 100), district: str("district", 100),
      postal_code: str("postal_code", 20), has_photo: body.has_photo === true,
    }
    : {
      name: str("name", 200), phone: str("phone", 30), email: str("email", 200),
      subject: str("subject", 200), message: str("message", 5000),
    };

  const admin = adminClient();
  const { data, error } = await admin.rpc("intake_submit", { p_kind: type, p_ip_hash: ipHash, p_payload: payload });
  if (error) {
    if (error.code === "NH429") return fail(429, "NH429", error.message);
    if (error.code?.startsWith("NH")) return fail(400, error.code, error.message);
    return fail(500, "NH500", "Something went wrong. Please try again.");
  }

  const id = data?.id ?? null;
  let photoUpload: { path: string; token: string; signed_url: string } | null = null;
  if (type === "application" && data?.photo_path) {
    const { data: signed, error: sErr } = await admin.storage
      .from("member-photos").createSignedUploadUrl(data.photo_path, { upsert: true });
    if (!sErr && signed) {
      photoUpload = { path: signed.path, token: signed.token, signed_url: signed.signedUrl };
    }
  }

  return json({ ok: true, type, id, photo_upload: photoUpload });
});
