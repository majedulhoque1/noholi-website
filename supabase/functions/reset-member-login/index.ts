// POST { member_id: "MEM-0001" }  (staff JWT required)
// -> { member_id, login_email, temp_password, must_change_password: true }
import { handleMemberLogin } from "../_shared/member_login.ts";

Deno.serve((req) => handleMemberLogin(req, "reset"));
