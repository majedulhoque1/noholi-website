import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { describeError, isNetworkError, supabase } from "./supabase";
import { translate } from "./i18n";

// Member session backed by Supabase Auth (see supabase/CONTRACT.md section 6). Ported from
// web-legacy/src/auth.jsx.
// Sign-in: identifier -> rpc('resolve_login') -> signInWithPassword -> rpc('my_role').
// Only role 'member' may use the website; staff/admin accounts are signed straight out again.

export type Role = "member" | "staff" | "admin" | "none";

/** A `member_summary_v` row (every `members` column plus loan/fine counters) for the signed-in member. */
export type MemberRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  avatar: string | null;
  status: "Active" | "Suspended" | "Expired";
  active_loans: number;
  overdue_loans: number;
  active_holds: number;
  outstanding_fines: number;
  accruing_fines: number;
  must_change_password: boolean;
  [column: string]: unknown;
};

export type AuthValue = {
  /** False until the persisted session has been checked (always false during SSR). Wait for it before gating. */
  ready: boolean;
  /** The real Supabase session, or null when signed out. */
  session: Session | null;
  user: User | null;
  /** `MEM-0001`-style id from my_role(), null when signed out or not loaded. */
  memberId: string | null;
  /** Role reported by my_role(); null when signed out or if it could not be loaded. */
  role: Role | null;
  mustChangePassword: boolean;
  /** Own member_summary_v row; null if signed out or not loaded (see memberError). */
  member: MemberRow | null;
  /** Reader-facing reason the member row could not be loaded (e.g. network), else null. */
  memberError: string | null;
  /** Throws an Error with a reader-facing message; resolves to the member row. */
  signIn: (identifier: string, password: string) => Promise<MemberRow>;
  signOut: () => Promise<void>;
  /** Reloads my_role + the member row (call after a profile or password change). */
  refreshMember: () => Promise<MemberRow | null>;
};

const AuthContext = createContext<AuthValue | null>(null);

// Kept as getters (not plain strings) so the message reflects whatever language is active
// when the error actually happens, not whatever it was when this module first loaded.
export const GENERIC_LOGIN_ERROR = () => translate("auth.genericLoginError");
export const STAFF_LOGIN_ERROR = () => translate("auth.staffLoginError");

type RoleInfo = { role?: Role; member_id?: string | null; must_change_password?: boolean } | null;

/** Loads the signed-in member's row (with loan/fine counts) or explains why there is none. */
async function loadMember(): Promise<{ role: Role; row: MemberRow | null }> {
  const { data, error: roleErr } = await supabase.rpc("my_role");
  if (roleErr) throw roleErr;
  const info = data as RoleInfo;
  if (info?.role !== "member") return { role: info?.role || "none", row: null };
  const { data: row, error } = await supabase
    .from("member_summary_v")
    .select("*")
    .eq("id", info.member_id)
    .maybeSingle();
  if (error) throw error;
  return {
    role: "member",
    row: row
      ? ({ ...row, must_change_password: Boolean(info.must_change_password) } as MemberRow)
      : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [memberRow, setMemberRow] = useState<MemberRow | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
  const gen = useRef(0); // ignores stale loads after a sign-out / newer sign-in
  const signingIn = useRef(false); // signIn() does its own loading; ignore the SIGNED_IN event meanwhile

  const clear = useCallback(() => {
    gen.current += 1;
    setSession(null);
    setMemberRow(null);
    setRole(null);
    setMemberError(null);
  }, []);

  const refreshMember = useCallback(async (): Promise<MemberRow | null> => {
    const mine = ++gen.current;
    try {
      const {
        data: { session: current },
      } = await supabase.auth.getSession();
      if (mine !== gen.current) return null;
      if (!current) {
        setSession(null);
        setMemberRow(null);
        setRole(null);
        setMemberError(null);
        return null;
      }
      try {
        const { role: r, row } = await loadMember();
        if (mine !== gen.current) return null;
        if (r !== "member" || !row) {
          // Not a member account (staff, or a login with no member row): not allowed on the website.
          await supabase.auth.signOut();
          if (mine === gen.current) clear();
          return null;
        }
        setSession(current);
        setRole("member");
        setMemberRow(row);
        setMemberError(null);
        return row;
      } catch (err) {
        console.error("Could not load the member session", err);
        if (mine === gen.current) {
          // The session is real but the member row could not be read (offline, server error).
          setSession(current);
          setRole(null);
          setMemberRow(null);
          setMemberError(
            isNetworkError(err) ? translate("supabaseLib.networkError") : describeError(err),
          );
        }
        return null;
      }
    } finally {
      if (mine === gen.current) setReady(true);
    }
  }, [clear]);

  useEffect(() => {
    // Initial session (persisted in localStorage by supabase-js). Don't await Supabase calls
    // inside the auth callback itself, so defer them.
    void refreshMember();
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_OUT") {
        clear();
        setReady(true);
      } else if (event === "TOKEN_REFRESHED" && next) {
        setSession(next);
      } else if (event === "SIGNED_IN" && !signingIn.current) {
        // Signed in from another tab: pick the member up here too.
        setTimeout(() => void refreshMember(), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshMember, clear]);

  const signIn = useCallback(async (identifier: string, password: string): Promise<MemberRow> => {
    const id = String(identifier || "").trim();
    if (!id || !password) throw new Error(translate("auth.enterCredentials"));
    signingIn.current = true;
    try {
      const { data: email, error: rErr } = await supabase.rpc("resolve_login", { identifier: id });
      if (rErr && isNetworkError(rErr)) throw new Error(translate("supabaseLib.networkError"));
      if (rErr || !email) throw new Error(GENERIC_LOGIN_ERROR());
      let { error: sErr } = await supabase.auth.signInWithPassword({
        email: email as string,
        password,
      });
      // A staff email isn't a member login, so resolve_login maps it elsewhere. Try the address as
      // typed (any anon client can do this) so staff get the "use Noholi OS" answer below, and
      // only when their password is right.
      if (sErr && id.includes("@") && id.toLowerCase() !== String(email).toLowerCase()) {
        ({ error: sErr } = await supabase.auth.signInWithPassword({ email: id, password }));
      }
      if (sErr && isNetworkError(sErr)) throw new Error(translate("supabaseLib.networkError"));
      if (sErr) throw new Error(GENERIC_LOGIN_ERROR());
      const mine = ++gen.current;
      let result: Awaited<ReturnType<typeof loadMember>>;
      try {
        result = await loadMember();
      } catch (err) {
        await supabase.auth.signOut();
        throw new Error(
          isNetworkError(err) ? translate("supabaseLib.networkError") : GENERIC_LOGIN_ERROR(),
        );
      }
      if (result.role === "staff" || result.role === "admin") {
        await supabase.auth.signOut();
        throw new Error(STAFF_LOGIN_ERROR());
      }
      if (result.role !== "member" || !result.row) {
        await supabase.auth.signOut();
        throw new Error(GENERIC_LOGIN_ERROR());
      }
      const {
        data: { session: current },
      } = await supabase.auth.getSession();
      if (mine === gen.current) {
        setSession(current);
        setRole("member");
        setMemberRow(result.row);
        setMemberError(null);
        setReady(true);
      }
      return result.row;
    } finally {
      signingIn.current = false;
    }
  }, []);

  // Synchronous state change first (so the UI reacts at once), then the network sign-out.
  const signOut = useCallback(async () => {
    clear();
    setReady(true);
    try {
      await supabase.auth.signOut();
    } catch {
      /* already signed out locally */
    }
  }, [clear]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      memberId: memberRow?.id ?? null,
      role,
      mustChangePassword: Boolean(memberRow?.must_change_password),
      member: memberRow,
      memberError,
      signIn,
      signOut,
      refreshMember,
    }),
    [ready, session, memberRow, role, memberError, signIn, signOut, refreshMember],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
