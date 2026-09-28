// Creates LOCAL-ONLY staff/admin logins for development and browser testing.
// Refuses to run against anything but localhost. Usage: node dev-accounts.mjs
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
  }));
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(env.SUPABASE_URL)) throw new Error('dev-accounts.mjs is local-only');

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const accounts = [
  { email: 'admin@noholi.test', password: 'NoholiDev#2026', role: 'admin' },
  { email: 'staff@noholi.test', password: 'NoholiDev#2026', role: 'staff' },
];
for (const a of accounts) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  let user = list.users.find(u => u.email === a.email);
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({ email: a.email, password: a.password, email_confirm: true });
    if (error) throw error;
    user = data.user;
  }
  const { error } = await db.from('staff_roles').upsert({ user_id: user.id, role: a.role }, { onConflict: 'user_id' });
  if (error) throw error;
  console.log(`${a.role.padEnd(5)} ${a.email} / ${a.password}`);
}
console.log('Admin actions need TOTP (aal2): enrol in the OS under Settings → Account, or in tests via supabase.auth.mfa.* + otplib.');

// ---------------------------------------------------------------------------
// Test member MEM-TEST-1 (LOCAL ONLY) for the website's member tools (web/tools/*member*).
// Same steps as the create-member-login edge function: synthetic email from
// resolve_login, auth user with app_metadata, link_member_login. Then the password is
// re-set to the known dev password and complete_password_change() is called as the
// member, so must_change_password ends up false through the normal contract path.
// ---------------------------------------------------------------------------
const TEST_MEMBER = {
  id: 'MEM-TEST-1',
  name: 'TEST Member One',
  email: 'test.member1@noholi.test',
  phone: '01700000101',
  address_line: 'TEST House 1, Road 1',
  city: 'Dhanmondi',
  district: 'Dhaka',
  postal_code: '1205',
  nid: '1990000000000101',
  default_guarantor_name: 'TEST Guarantor One',
  default_guarantor_relationship: 'Sibling',
  default_guarantor_phone: '01700000102',
  default_guarantor_nid: '1990000000000102',
  default_guarantor_street: 'TEST House 2, Road 2',
  default_guarantor_city: 'Mirpur',
  default_guarantor_district: 'Dhaka',
  default_guarantor_postal_code: '1216',
};
const TEST_PASSWORD = 'NoholiMember#2026';

{
  const { data: existing, error: selErr } = await db.from('members').select('id, auth_user_id').eq('id', TEST_MEMBER.id).maybeSingle();
  if (selErr) throw selErr;
  if (!existing) {
    const { error } = await db.from('members').insert({ ...TEST_MEMBER, status: 'Active' });
    if (error) throw error;
  }
  const { data: loginEmail, error: rErr } = await db.rpc('resolve_login', { identifier: TEST_MEMBER.id });
  if (rErr) throw rErr;

  let userId = existing?.auth_user_id || null;
  if (!userId) {
    const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
    const orphan = list.users.find(u => u.email?.toLowerCase() === loginEmail);
    if (orphan) userId = orphan.id;
    else {
      const { data, error } = await db.auth.admin.createUser({
        email: loginEmail, password: TEST_PASSWORD, email_confirm: true,
        app_metadata: { member_id: TEST_MEMBER.id, kind: 'member' },
        user_metadata: { name: TEST_MEMBER.name },
      });
      if (error) throw error;
      userId = data.user.id;
    }
    const { error: lErr } = await db.rpc('link_member_login', {
      p_member_id: TEST_MEMBER.id, p_user_id: userId, p_actor: null, p_action: 'create_member_login',
    });
    if (lErr) throw lErr;
  }
  // (Re)set the known password: a fresh hash, so complete_password_change accepts it.
  const { error: pErr } = await db.auth.admin.updateUserById(userId, {
    password: TEST_PASSWORD, email_confirm: true, app_metadata: { member_id: TEST_MEMBER.id, kind: 'member' },
  });
  if (pErr) throw pErr;

  const member = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { error: sErr } = await member.auth.signInWithPassword({ email: loginEmail, password: TEST_PASSWORD });
  if (sErr) throw sErr;
  const { error: cErr } = await member.rpc('complete_password_change');
  if (cErr) throw cErr;
  await member.auth.signOut();
  console.log(`member ${TEST_MEMBER.id} (${loginEmail}) / ${TEST_PASSWORD}`);
}
