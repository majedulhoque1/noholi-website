// Shared body of create-member-login and reset-member-login.
import { adminClient, corsHeaders, fail, json, memberEmail, readJson, requireStaff, tempPassword } from "./util.ts";

export async function handleMemberLogin(req: Request, mode: "create" | "reset"): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail(405, "NH004", "Use POST.");

  const admin = adminClient();
  const caller = await requireStaff(req, admin);
  if (caller instanceof Response) return caller;

  const body = await readJson(req);
  const memberId = String(body?.member_id ?? "").trim().toUpperCase();
  if (!/^MEM-[0-9A-Z-]+$/.test(memberId)) return fail(400, "NH004", "Please give a member id like MEM-0001.");

  const { data: member, error: mErr } = await admin
    .from("members").select("id, name, status, auth_user_id, archived_at").eq("id", memberId).maybeSingle();
  if (mErr) return fail(500, "NH500", "Could not load the member.");
  if (!member || member.archived_at) return fail(404, "NH003", `Member ${memberId} was not found.`);

  const email = memberEmail(member.id);
  const password = tempPassword(12);
  let userId: string | null = member.auth_user_id;

  if (mode === "create") {
    if (userId) {
      return fail(409, "NH009", `${member.id} already has a login. Use "Reset login" to issue a new password.`);
    }
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { member_id: member.id, kind: "member" },
      user_metadata: { name: member.name },
    });
    if (cErr || !created?.user) {
      // An orphaned auth user with this email (e.g. a half-finished earlier attempt): reuse it.
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);
      if (!existing) return fail(500, "NH500", `Could not create the login: ${cErr?.message ?? "unknown error"}`);
      const { error: uErr } = await admin.auth.admin.updateUserById(existing.id, {
        password, email_confirm: true, app_metadata: { member_id: member.id, kind: "member" },
      });
      if (uErr) return fail(500, "NH500", `Could not create the login: ${uErr.message}`);
      userId = existing.id;
    } else {
      userId = created.user.id;
    }
  } else {
    if (!userId) {
      return fail(409, "NH008", `${member.id} has no login yet. Use "Create login" first.`);
    }
    const { error: uErr } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    if (uErr) return fail(500, "NH500", `Could not reset the login: ${uErr.message}`);
  }

  const { error: linkErr } = await admin.rpc("link_member_login", {
    p_member_id: member.id,
    p_user_id: userId,
    p_actor: caller.userId,
    p_action: mode === "create" ? "create_member_login" : "reset_member_login",
  });
  if (linkErr) return fail(500, "NH500", `Login saved but could not be linked: ${linkErr.message}`);

  // The password is returned exactly once and never stored in plain text.
  return json({
    member_id: member.id,
    login_email: email,
    temp_password: password,
    must_change_password: true,
  });
}
