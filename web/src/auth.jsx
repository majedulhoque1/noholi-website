import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isNetworkError, NETWORK_ERROR, supabase } from './lib/supabase.js';

// Member session backed by Supabase Auth (see supabase/CONTRACT.md §6).
// Sign-in: identifier → rpc('resolve_login') → signInWithPassword → rpc('my_role').
// Only role 'member' may use the website; staff accounts are signed straight out again.
const AuthContext = createContext(null);

export const GENERIC_LOGIN_ERROR = 'Incorrect membership number or password.';
export const STAFF_LOGIN_ERROR = 'Staff accounts use Noholi OS.';

/** "Mohammad Rafiqul Islam" → "Mohammad R." (the header's short form). */
function shortNameOf(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || '';
  return `${parts[0]} ${parts[1][0]}.`;
}

/** Loads the signed-in member's row (with loan/fine counts) or explains why there is none. */
async function loadMember() {
  const { data: role, error: roleErr } = await supabase.rpc('my_role');
  if (roleErr) throw roleErr;
  if (role?.role !== 'member') return { role: role?.role || 'none', row: null };
  const { data: row, error } = await supabase
    .from('member_summary_v')
    .select('*')
    .eq('id', role.member_id)
    .maybeSingle();
  if (error) throw error;
  return { role: 'member', row: row ? { ...row, must_change_password: role.must_change_password } : null };
}

export function AuthProvider({ children }) {
  const [memberRow, setMemberRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [since, setSince] = useState(null);
  const gen = useRef(0); // ignores stale loads after a sign-out / newer sign-in

  const clear = useCallback(() => {
    gen.current += 1;
    setMemberRow(null);
    setSince(null);
  }, []);

  const refresh = useCallback(async () => {
    const mine = ++gen.current;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (mine === gen.current) { setMemberRow(null); setLoading(false); }
      return null;
    }
    try {
      const { role, row } = await loadMember();
      if (mine !== gen.current) return null;
      if (role !== 'member' || !row) {
        await supabase.auth.signOut();
        setMemberRow(null);
      } else {
        setMemberRow(row);
        setSince((s) => s || new Date());
      }
      return row;
    } catch (err) {
      console.error('Could not load the member session', err);
      if (mine === gen.current) setMemberRow(null);
      return null;
    } finally {
      if (mine === gen.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial session (persisted in localStorage by supabase-js). Don't await Supabase
    // calls inside the auth callback itself, so defer them.
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { clear(); setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh, clear]);

  /** Throws an Error with a reader-facing message; resolves to the member row. */
  const signIn = useCallback(async (identifier, password) => {
    const id = String(identifier || '').trim();
    if (!id || !password) throw new Error('Enter your membership number or email and your password.');
    const { data: email, error: rErr } = await supabase.rpc('resolve_login', { identifier: id });
    if (rErr && isNetworkError(rErr)) throw new Error(NETWORK_ERROR);
    if (rErr || !email) throw new Error(GENERIC_LOGIN_ERROR);
    let { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
    // A staff email isn't a member login, so resolve_login maps it elsewhere. Try the address as
    // typed (any anon client can do this) so staff get the "use Noholi OS" answer below, and
    // only when their password is right.
    if (sErr && id.includes('@') && id.toLowerCase() !== String(email).toLowerCase()) {
      ({ error: sErr } = await supabase.auth.signInWithPassword({ email: id, password }));
    }
    if (sErr && isNetworkError(sErr)) throw new Error(NETWORK_ERROR);
    if (sErr) throw new Error(GENERIC_LOGIN_ERROR);
    const mine = ++gen.current;
    let result;
    try {
      result = await loadMember();
    } catch (err) {
      await supabase.auth.signOut();
      throw new Error(isNetworkError(err) ? NETWORK_ERROR : GENERIC_LOGIN_ERROR);
    }
    if (result.role === 'staff' || result.role === 'admin') {
      await supabase.auth.signOut();
      throw new Error(STAFF_LOGIN_ERROR);
    }
    if (result.role !== 'member' || !result.row) {
      await supabase.auth.signOut();
      throw new Error(GENERIC_LOGIN_ERROR);
    }
    if (mine === gen.current) {
      setMemberRow(result.row);
      setSince(new Date());
      setLoading(false);
    }
    return result.row;
  }, []);

  // Synchronous state change (the header runs it inside startTransition together with
  // navigate('/')), then the network sign-out in the background.
  const logOut = useCallback(() => {
    clear();
    supabase.auth.signOut().catch(() => { /* already signed out locally */ });
  }, [clear]);

  const value = useMemo(() => {
    const member = memberRow
      ? {
          name: memberRow.name,
          shortName: shortNameOf(memberRow.name),
          cardNumber: memberRow.id,
          status: memberRow.status,
          activeLoans: memberRow.active_loans ?? 0,
          overdueLoans: memberRow.overdue_loans ?? 0,
          since,
        }
      : null;
    return {
      member,
      memberRow,
      loading,
      mustChangePassword: Boolean(memberRow?.must_change_password),
      signIn,
      logOut,
      refresh,
    };
  }, [memberRow, loading, since, signIn, logOut, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
