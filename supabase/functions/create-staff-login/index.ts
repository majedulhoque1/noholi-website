// POST { email, role: "staff" | "admin" }  (admin JWT with aal2 required)
// -> { user_id, email, role, temp_password }
import { adminClient, corsHeaders, fail, json, MEMBER_EMAIL_DOMAIN, readJson, requireStaff, tempPassword } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail(405, "NH004", "Use POST.");

  const admin = adminClient();
  const caller = await requireStaff(req, admin, { admin: true });
  if (caller instanceof Response) return caller;

  const body = await readJson(req);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = String(body?.role ?? "staff");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(400, "NH004", "Please enter a valid email address.");
  if (email.endsWith(`@${MEMBER_EMAIL_DOMAIN}`)) return fail(400, "NH004", "Member logins cannot be made into staff.");
  if (role !== "staff" && role !== "admin") return fail(400, "NH004", 'Role must be "staff" or "admin".');

  const password = tempPassword(12);
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { kind: "staff" },
  });
  if (cErr || !created?.user) {
    const already = /already|exists|registered/i.test(cErr?.message ?? "");
    return fail(already ? 409 : 500, already ? "NH009" : "NH500",
      already ? `An account with ${email} already exists.` : `Could not create the login: ${cErr?.message}`);
  }

  const userId = created.user.id;
  const { data: linked } = await admin.from("members").select("id").eq("auth_user_id", userId).maybeSingle();
  if (linked) {
    await admin.auth.admin.deleteUser(userId);
    return fail(409, "NH009", "This account belongs to a member and cannot be staff.");
  }

  const { error: rErr } = await admin.from("staff_roles").insert({ user_id: userId, role, created_by: caller.userId });
  if (rErr) {
    await admin.auth.admin.deleteUser(userId);
    return fail(500, "NH500", `Could not save the staff role: ${rErr.message}`);
  }
  await admin.from("audit_log").insert({
    actor: caller.userId, actor_role: caller.role, action: "create_staff_login",
    entity: "staff_roles", entity_id: userId, after: { email, role },
  });

  return json({ user_id: userId, email, role, temp_password: password });
});
