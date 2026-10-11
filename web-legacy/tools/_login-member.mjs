// Real member session for the member-page tools: signs in MEM-TEST-1 on the local Supabase
// (created by supabase/seed/dev-accounts.mjs) and returns an init script that puts the
// session where the site's supabase client looks for it (localStorage 'noholi.web.auth').
//   import { memberSession } from './_login-member.mjs';
//   await ctx.addInitScript(await memberSession());      // or page.addInitScript(...)
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

export const TEST_MEMBER = { id: process.env.NOHOLI_MEMBER || 'MEM-TEST-1', password: process.env.NOHOLI_MEMBER_PASSWORD || 'NoholiMember#2026' };

function env() {
  const file = new URL('../.env.development', import.meta.url);
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
}

let cached;
/** Signs in once per process; returns { script, arg } for addInitScript. */
export async function memberSession() {
  if (!cached) {
    const e = env();
    if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(e.VITE_SUPABASE_URL)) throw new Error('member tools run against local Supabase only');
    const sb = createClient(e.VITE_SUPABASE_URL, e.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: email, error: rErr } = await sb.rpc('resolve_login', { identifier: TEST_MEMBER.id });
    if (rErr) throw rErr;
    const { data, error } = await sb.auth.signInWithPassword({ email, password: TEST_MEMBER.password });
    if (error) throw new Error(`${TEST_MEMBER.id} could not sign in (${error.message}). Run: node supabase/seed/dev-accounts.mjs`);
    cached = JSON.stringify(data.session);
  }
  return { content: `try { localStorage.setItem('noholi.web.auth', ${JSON.stringify(cached)}); } catch (e) {}` };
}
