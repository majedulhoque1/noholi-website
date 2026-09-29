// HTTP-level tests against the LOCAL stack: real JWTs (password + TOTP MFA),
// concurrency, edge functions. No dependencies: Node 18+ fetch only.
//
//   npx supabase@2.118 start
//   node supabase/tests/api.test.mjs
//
// Keys default to the fixed local-dev demo keys; override with env vars.
import crypto from "node:crypto";

const API = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON = process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

if (!/^(http:\/\/(127\.0\.0\.1|localhost))/.test(API)) {
  console.error("Refusing to run: these tests write data and must only target a LOCAL stack.");
  process.exit(2);
}

// ------------------------------------------------------------------ harness
let pass = 0, fail = 0;
const failures = [];
function check(cond, name, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; failures.push(name); console.log(`FAIL ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra).slice(0, 400) : ""}`); }
}

async function http(method, path, { token, body, headers = {}, apikey = ANON } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      apikey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}
const rpc = (fn, args, token) => http("POST", `/rest/v1/rpc/${fn}`, { token, body: args ?? {} });
const svc = (method, path, body, prefer = "return=representation") =>
  http(method, `/rest/v1/${path}`, { token: SERVICE, apikey: SERVICE, body, headers: { Prefer: prefer } });
const fn = (name, body, token, headers = {}) => http("POST", `/functions/v1/${name}`, { token, body, headers });

async function createAuthUser(email, password) {
  const r = await http("POST", "/auth/v1/admin/users", {
    token: SERVICE, apikey: SERVICE, body: { email, password, email_confirm: true },
  });
  if (!r.ok) throw new Error(`createUser ${email}: ${JSON.stringify(r.data)}`);
  return r.data.id;
}
async function signIn(email, password) {
  const r = await http("POST", "/auth/v1/token?grant_type=password", { body: { email, password } });
  return r.ok ? r.data.access_token : null;
}

// RFC 6238 TOTP (SHA1, 6 digits, 30s)
function totp(secretB32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secretB32.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000 / 30)));
  const h = crypto.createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24 | h[o + 1] << 16 | h[o + 2] << 8 | h[o + 3]) % 1_000_000;
  return String(n).padStart(6, "0");
}
async function elevateToAal2(token) {
  const f = await http("POST", "/auth/v1/factors", { token, body: { factor_type: "totp", friendly_name: "test-" + Date.now() } });
  if (!f.ok) throw new Error("enroll: " + JSON.stringify(f.data));
  const c = await http("POST", `/auth/v1/factors/${f.data.id}/challenge`, { token, body: {} });
  const v = await http("POST", `/auth/v1/factors/${f.data.id}/verify`, {
    token, body: { challenge_id: c.data.id, code: totp(f.data.totp.secret) },
  });
  if (!v.ok) throw new Error("verify: " + JSON.stringify(v.data));
  return v.data.access_token;
}
const jwtClaims = (t) => JSON.parse(Buffer.from(t.split(".")[1], "base64url").toString());
const oks = (results) => results.filter((r) => r.ok).length;

// ------------------------------------------------------------------ fixtures
const R = Date.now().toString(36).toUpperCase().slice(-6);
const PW = "Staff-Pass-123";
const today = (await rpc("get_public_settings", {})).data.today;
const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

console.log(`# run ${R}, Dhaka today = ${today}`);

// staff + admin
const staffEmail = `staff-${R}@test.local`.toLowerCase();
const adminEmail = `admin-${R}@test.local`.toLowerCase();
const staffId = await createAuthUser(staffEmail, PW);
const adminId = await createAuthUser(adminEmail, PW);
await svc("POST", "staff_roles", [{ user_id: staffId, role: "staff" }, { user_id: adminId, role: "admin" }]);
const staff = await signIn(staffEmail, PW);
const adminAal1 = await signIn(adminEmail, PW);
const adminAal2 = await elevateToAal2(adminAal1);
check(jwtClaims(adminAal2).aal === "aal2", "admin TOTP verify yields an aal2 token");

// books
const book = (n, copies, extra = {}) => ({ id: `BK-T${R}-${n}`, title: `Test ${R} ${n}`, author: "Tester", total_copies: copies, price: 100, ...extra });
const r1 = await svc("POST", "books", [
  book(1, 1), book(2, 1), book(3, 5), book(4, 5), book(5, 5), book(6, 5), book(7, 5),
  book(8, 5), book(9, 5), book(10, 5), book(11, 5, { price: null }),
]);
check(r1.ok, "fixture books inserted", r1.data);
const B = (n) => `BK-T${R}-${n}`;

// members (10) + logins through the edge function
const memberIds = Array.from({ length: 10 }, (_, i) => `MEM-T${R}-${i + 1}`);
const rm = await svc("POST", "members", memberIds.map((id, i) => ({ id, name: `Member ${i + 1}`, phone: `0170${R.length}${i}` , email: `${id.toLowerCase()}@example.com` })));
check(rm.ok, "fixture members inserted", rm.data);

// ------------------------------------------------------------------ 1. access (HTTP)
{
  const su = await http("POST", "/auth/v1/signup", { body: { email: `x${R}@example.com`, password: "abcdefgh12" } });
  check(!su.ok && /signup/i.test(JSON.stringify(su.data)), "public signUp is refused", su.data);

  const a1 = await http("GET", `/rest/v1/books?select=id,price&id=eq.${B(1)}`);
  check(!a1.ok && a1.data?.code === "42501", "anon cannot select books.price", a1.data);
  const a2 = await http("GET", `/rest/v1/books?select=id,title,available_copies&id=eq.${B(1)}`);
  check(a2.ok && a2.data.length === 1, "anon can select safe book columns", a2.data);
  for (const t of ["members", "loans", "fines", "fine_payments", "borrow_requests", "member_applications", "contact_messages", "audit_log", "settings", "staff_roles", "donations"]) {
    const r = await http("GET", `/rest/v1/${t}?select=*&limit=1`);
    check(!r.ok, `anon cannot read ${t}`, r.data);
  }
  const a3 = await rpc("issue_loan", { p_member_id: memberIds[0], p_book_id: B(3) });
  check(!a3.ok, "anon cannot call issue_loan", a3.data);
  const s1 = await rpc("search_books", { q: `Test ${R}` });
  check(s1.ok && s1.data.length >= 10 && s1.data[0].price === undefined, "anon search_books works and has no price", s1.data?.[0]);
  const rl1 = await rpc("resolve_login", { identifier: "someone-unknown@example.com" });
  const rl2 = await rpc("resolve_login", { identifier: memberIds[0] });
  check(/^mem-[0-9]{4}@members\.noholi\.app$/.test(rl1.data) && /@members\.noholi\.app$/.test(rl2.data),
    "resolve_login answers real and unknown input with the same shape", [rl1.data, rl2.data]);
}

// ------------------------------------------------------------------ 2. edge fns: member logins
const memberTokens = [];
{
  const noAuth = await fn("create-member-login", { member_id: memberIds[0] });
  check(noAuth.status === 401, "create-member-login without a JWT -> 401", noAuth);

  const byAdmin1 = await fn("create-member-login", { member_id: memberIds[0] }, adminAal1);
  check(byAdmin1.ok, "admin (any aal) counts as staff for create-member-login", byAdmin1.data);
  const logins = [byAdmin1];
  for (const id of memberIds.slice(1)) logins.push(await fn("create-member-login", { member_id: id }, staff));
  check(logins.every((l) => l.ok && l.data.temp_password?.length === 12), "staff create member logins; 12-char temp password", logins.map((l) => l.data));
  const again = await fn("create-member-login", { member_id: memberIds[1] }, staff);
  check(again.status === 409, "second create-member-login for the same member -> 409", again.data);

  for (let i = 0; i < memberIds.length; i++) {
    const email = (await rpc("resolve_login", { identifier: memberIds[i] })).data;
    const t = await signIn(email, logins[i].data.temp_password);
    memberTokens.push(t);
  }
  check(memberTokens.every(Boolean), "members sign in with MEM id -> resolve_login -> temp password");

  const viaEmail = (await rpc("resolve_login", { identifier: `${memberIds[0].toLowerCase()}@example.com` })).data;
  check(viaEmail === `${memberIds[0].toLowerCase()}@members.noholi.app`, "resolve_login maps a member's real email to their login", viaEmail);

  const memberCalls = await fn("create-member-login", { member_id: memberIds[0] }, memberTokens[0]);
  check(memberCalls.status === 403, "a member cannot call create-member-login", memberCalls.data);

  const role = await rpc("my_role", {}, memberTokens[0]);
  check(role.data?.role === "member" && role.data?.must_change_password === true, "my_role: member with forced password change", role.data);

  const early = await rpc("complete_password_change", {}, memberTokens[0]);
  check(!early.ok && early.data?.code === "NH008", "complete_password_change refused before the password changes", early.data);
  const upd = await http("PUT", "/auth/v1/user", { token: memberTokens[0], body: { password: "Member-New-Pass-1" } });
  check(upd.ok, "member sets a new password", upd.data);
  const done = await rpc("complete_password_change", {}, memberTokens[0]);
  check(done.ok && done.data.must_change_password === false, "complete_password_change after a real change", done.data);

  const reset = await fn("reset-member-login", { member_id: memberIds[0] }, staff);
  check(reset.ok && reset.data.temp_password, "staff reset a member login", reset.data);
  const oldFails = await signIn(`${memberIds[0].toLowerCase()}@members.noholi.app`, "Member-New-Pass-1");
  const newWorks = await signIn(`${memberIds[0].toLowerCase()}@members.noholi.app`, reset.data.temp_password);
  check(!oldFails && !!newWorks, "after reset the old password fails and the temp one works");
  memberTokens[0] = newWorks;
  const role2 = await rpc("my_role", {}, newWorks);
  check(role2.data?.must_change_password === true, "reset forces a password change again", role2.data);

  // member-level access over HTTP
  const mine = await http("GET", "/rest/v1/members?select=id", { token: memberTokens[1] });
  check(mine.ok && mine.data.length === 1 && mine.data[0].id === memberIds[1], "member reads only their own member row", mine.data);
  const patch = await http("PATCH", `/rest/v1/members?id=eq.${memberIds[1]}`, { token: memberTokens[1], body: { must_change_password: false } });
  check(!patch.ok && patch.data?.code === "42501", "member cannot PATCH must_change_password", patch.data);
  const staffRpc = await rpc("adjust_stock", { p_book_id: B(3), p_new_total: 50, p_reason: "x" }, memberTokens[1]);
  check(!staffRpc.ok && staffRpc.data?.code === "NH001", "member cannot call a staff RPC", staffRpc.data);
  const ops = await rpc("my_role", {}, staff);
  check(ops.data?.role === "staff", "my_role: staff", ops.data);
}

// ------------------------------------------------------------------ 3. edge fns: staff logins
{
  const byStaff = await fn("create-staff-login", { email: `new-${R}@test.local`, role: "staff" }, staff);
  check(byStaff.status === 403, "staff cannot create staff logins", byStaff.data);
  const ok = await fn("create-staff-login", { email: `new-${R}@test.local`, role: "staff" }, adminAal1);
  check(ok.ok && ok.data.temp_password, "admin (no MFA needed) creates a staff login", ok.data);
  const t = await signIn(`new-${R}@test.local`, ok.data.temp_password);
  const isStaff = await rpc("is_staff", {}, t);
  check(isStaff.data === true, "the new staff login is staff", isStaff.data);
  const set1 = await rpc("update_settings", { p_loan_days: 14 }, adminAal1);
  check(set1.ok, "admin at aal1 can update_settings (HTTP)", set1.data);
}

// ------------------------------------------------------------------ 4. concurrency
{
  // 10 parallel desk issues of a 1-copy book to 10 different members
  const res = await Promise.all(memberIds.map((m) => rpc("issue_loan", { p_member_id: m, p_book_id: B(1) }, staff)));
  check(oks(res) === 1, "10 parallel issue_loan on a 1-copy book -> exactly 1 succeeds", res.map((r) => r.data?.code ?? "ok"));
  const bk = (await svc("GET", `books?select=issued_copies,available_copies&id=eq.${B(1)}`)).data[0];
  check(bk.issued_copies === 1 && bk.available_copies === 0, "stock after the race: issued 1, available 0", bk);
  const loanId = res.find((r) => r.ok).data.id;

  // double return in parallel
  const ret = await Promise.all([1, 2].map(() => rpc("return_loan", { p_loan_id: loanId }, staff)));
  check(oks(ret) === 1, "2 parallel return_loan -> exactly 1 succeeds", ret.map((r) => r.data?.code ?? "ok"));
  const bk2 = (await svc("GET", `books?select=issued_copies&id=eq.${B(1)}`)).data[0];
  check(bk2.issued_copies === 0, "issued count back to 0 (not -1)", bk2);

  // 10 parallel web requests for a 1-copy book
  const reqs = await Promise.all(memberTokens.map((t, i) => rpc("submit_borrow_request", {
    p_book_id: B(2), p_pickup_date: today, p_consent: true, p_member_nid: `19900000000${i}`,
    p_guarantor_name: "Guarantor", p_guarantor_phone: "01711111111",
  }, t)));
  check(oks(reqs) === 1, "10 parallel submit_borrow_request on a 1-copy book -> exactly 1", reqs.map((r) => r.data?.code ?? "ok"));
  const bk3 = (await svc("GET", `books?select=reserved_copies&id=eq.${B(2)}`)).data[0];
  check(bk3.reserved_copies === 1, "reserved count is 1", bk3);

  // double donation add
  const don = await svc("POST", "donations", { donor_name: "Donor " + R, book_title: "Donated " + R, condition: "Good", review_status: "Approved" });
  const donId = don.data[0].id;
  const adds = await Promise.all([1, 2].map(() => rpc("add_donation_to_inventory", { _donation_id: donId }, staff)));
  check(oks(adds) === 1, "2 parallel add_donation_to_inventory -> exactly 1", adds.map((r) => r.data?.code ?? r.data));
  const donBooks = await svc("GET", `books?select=id&donation_id=eq.${donId}`);
  check(donBooks.data.length === 1, "exactly one book carries that donation_id", donBooks.data);

  // a late loan -> fine, then idempotent + over-balance payments
  const m = memberIds[2];
  await svc("POST", "loans", { id: `LN-T${R}`, book_id: B(3), accession_id: B(3), book_title: "x", member_id: m, member_name: "x",
    issued_date: addDays(today, -20), due_date: addDays(today, -6) });
  await svc("PATCH", `books?id=eq.${B(3)}`, { issued_copies: 1 });
  const rr = await rpc("return_loan", { p_loan_id: `LN-T${R}` }, staff);
  const fine = rr.data?.fine;
  check(rr.ok && Number(fine?.amount) === 60, "late return creates a fine (6 days x 10 = 60)", rr.data);

  const key = crypto.randomUUID();
  const dup = await Promise.all([1, 2, 3, 4, 5].map(() => rpc("record_fine_payment",
    { p_fine_id: fine.id, p_amount: 10, p_method: "Cash", p_idempotency_key: key }, staff)));
  const rows = await svc("GET", `fine_payments?select=id&idempotency_key=eq.${key}`);
  check(dup.every((r) => r.ok) && rows.data.length === 1, "5 parallel payments with the same key -> 1 payment row, all calls OK", dup.map((r) => r.data?.code ?? r.data?.duplicate));

  const over = await Promise.all([1, 2, 3].map(() => rpc("record_fine_payment",
    { p_fine_id: fine.id, p_amount: 50, p_method: "bKash", p_idempotency_key: crypto.randomUUID() }, staff)));
  check(oks(over) === 1, "3 parallel payments of the full balance -> exactly 1 succeeds", over.map((r) => r.data?.code ?? "ok"));
  const f2 = (await svc("GET", `fines?select=amount_paid,status&id=eq.${fine.id}`)).data[0];
  check(Number(f2.amount_paid) === 60 && f2.status === "Paid", "fine fully paid, never overpaid", f2);
  const staffWaive = await rpc("waive_fine", { p_fine_id: fine.id, p_reason: "x" }, staff);
  check(!staffWaive.ok && staffWaive.data?.code === "NH001", "staff cannot waive (HTTP)", staffWaive.data);

  // limit: member with 4 open items fires 3 parallel requests -> exactly 1 fits
  const mi = 4, mid = memberIds[mi], mt = memberTokens[mi];
  for (const n of [4, 5, 6, 7]) {
    const r = await rpc("issue_loan", { p_member_id: mid, p_book_id: B(n) }, staff);
    if (!r.ok) console.log("setup issue failed", r.data);
  }
  const lim = await Promise.all([8, 9, 10].map((n) => rpc("submit_borrow_request",
    { p_book_id: B(n), p_pickup_date: today, p_consent: true, p_member_nid: "1990", p_guarantor_name: "G", p_guarantor_phone: "017" }, mt)));
  check(oks(lim) === 1, "4 items + 3 parallel requests -> exactly 1 (the 5th) succeeds", lim.map((r) => r.data?.code ?? "ok"));
  check(lim.filter((r) => r.data?.code === "NH006").length === 2, "... the others get NH006 (limit)", lim.map((r) => r.data?.message));

  // double renewal in parallel
  const ri = 5, rid = memberIds[ri], rt = memberTokens[ri];
  const loan = await rpc("issue_loan", { p_member_id: rid, p_book_id: B(11) }, staff);
  const ren = await Promise.all([1, 2].map(() => rpc("renew_my_loan", { p_loan_id: loan.data.id }, rt)));
  check(oks(ren) === 1, "2 parallel renew_my_loan -> exactly 1", ren.map((r) => r.data?.code ?? "ok"));
  const other = await rpc("renew_my_loan", { p_loan_id: loan.data.id }, memberTokens[6]);
  check(!other.ok && other.data?.code === "NH003", "another member cannot renew it", other.data);

  // members see their own loans only
  const ml = await http("GET", "/rest/v1/loan_status_v?select=id,member_id,derived_status,fine_amount", { token: rt });
  check(ml.ok && ml.data.length === 1 && ml.data[0].member_id === rid, "member reads only own rows from loan_status_v", ml.data);
}

// ------------------------------------------------------------------ 5. public-intake
{
  const ip = `203.0.113.${Math.floor(Math.random() * 250)}`;
  const phone = `019${String(Date.now()).slice(-8)}`;
  const hp = await fn("public-intake", { type: "application", name: "Bot", phone, website: "http://spam" }, ANON, { "x-forwarded-for": ip });
  const hpRows = await svc("GET", `member_applications?select=id&phone=eq.${phone}`);
  check(hp.ok && hp.data.id === null && hpRows.data.length === 0, "honeypot: fake success, nothing stored", hp.data);

  const app = await fn("public-intake", { type: "application", name: "Applicant " + R, phone, email: `app-${R}@example.com`.toLowerCase(), city: "Dhaka", has_photo: true }, ANON, { "x-forwarded-for": ip });
  check(app.ok && /^APP-\d{4,}$/.test(app.data.id) && app.data.photo_upload?.token, "application returns APP id + signed upload", app.data);

  if (app.data?.photo_upload) {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    const up = await fetch(`${API}/storage/v1/object/upload/sign/member-photos/${app.data.photo_upload.path}?token=${app.data.photo_upload.token}`,
      { method: "PUT", headers: { "Content-Type": "image/png", apikey: ANON }, body: png });
    check(up.ok, "photo uploads through the signed upload URL", await up.text());
    const anonList = await http("POST", "/storage/v1/object/list/member-photos", { body: { prefix: "applications" } });
    check(!anonList.ok || (Array.isArray(anonList.data) && anonList.data.length === 0), "anon cannot list member-photos", anonList.data);
    const staffGet = await http("POST", `/storage/v1/object/sign/member-photos/${app.data.photo_upload.path}`, { token: staff, body: { expiresIn: 60 } });
    check(staffGet.ok, "staff can create a signed read URL for the photo", staffGet.data);
    const memberGet = await http("POST", `/storage/v1/object/sign/member-photos/${app.data.photo_upload.path}`, { token: memberTokens[3], body: { expiresIn: 60 } });
    check(!memberGet.ok, "a member cannot read applicant photos", memberGet.data);
  }

  const a2 = await fn("public-intake", { type: "application", name: "Applicant " + R, phone }, ANON, { "x-forwarded-for": ip });
  const a3 = await fn("public-intake", { type: "application", name: "Applicant " + R, phone }, ANON, { "x-forwarded-for": ip });
  const a4 = await fn("public-intake", { type: "application", name: "Applicant " + R, phone }, ANON, { "x-forwarded-for": ip });
  check(a2.ok && a3.ok && a4.status === 429, "4th application from the same phone in a day -> 429", [a2.status, a3.status, a4.status, a4.data]);

  const c = await fn("public-intake", { type: "contact", name: "Visitor", email: "v@example.com", message: "Hello" }, ANON, { "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250)}` });
  check(c.ok && c.data.id, "contact message stored", c.data);
  const bad = await fn("public-intake", { type: "contact", name: "Visitor", message: "Hello" }, ANON);
  check(bad.status === 400 && bad.data?.error?.code === "NH004", "contact without email/phone -> 400 NH004", bad.data);

  const appr = await rpc("approve_application", { p_application_id: app.data.id }, staff);
  check(appr.ok && /^MEM-\d{4,}$/.test(appr.data), "staff approve application -> new MEM id", appr.data);
  const login = await fn("create-member-login", { member_id: appr.data }, staff);
  check(login.ok && login.data.temp_password, "approved applicant gets a login", login.data);
  const rej = await rpc("reject_application", { p_application_id: app.data.id, p_reason: "x" }, staff);
  check(!rej.ok && rej.data?.code === "NH008", "cannot reject an approved application", rej.data);
}

console.log(`\n# ${pass} passed, ${fail} failed`);
if (fail) { console.log("# failures:\n  - " + failures.join("\n  - ")); process.exit(1); }
