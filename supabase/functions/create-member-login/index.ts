// POST { member_id: "MEM-0001" }  (staff JWT required)
// -> { member_id, login_email, temp_password, must_change_password: true }
import { handleMemberLogin } from "../_shared/member_login.ts";
import { serve } from "../_shared/util.ts";

serve((req) => handleMemberLogin(req, "create"));
