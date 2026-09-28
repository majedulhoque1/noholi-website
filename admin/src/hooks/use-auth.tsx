import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/navigation";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/** Result of the `my_role()` RPC (see supabase/CONTRACT.md). */
interface MyRole {
  role: "admin" | "staff" | "member" | "none";
  aal: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Staff role of the signed-in account; null while signed out. */
  role: UserRole | null;
  /** True only for admins whose session passed TOTP (aal2). */
  isAdmin: boolean;
  /** Admin account that still needs to complete MFA this session. */
  needsMfa: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NOT_STAFF = "This account can't use Noholi OS. Member accounts sign in on the library website.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearState = useCallback(() => {
    setUser(null);
    setSession(null);
    setRole(null);
    setIsAdmin(false);
    setNeedsMfa(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    clearTimeout(timeoutRef.current);
    await supabase.auth.signOut();
    clearState();
  }, [clearState]);

  /** Asks the database who this session is. Non-staff accounts are signed out. */
  const loadRole = useCallback(async (sess: Session | null): Promise<string | null> => {
    if (!sess) {
      clearState();
      return null;
    }
    const { data, error } = await supabase.rpc("my_role");
    const r = (data ?? null) as unknown as MyRole | null;
    if (error || !r || (r.role !== "admin" && r.role !== "staff")) {
      await supabase.auth.signOut();
      clearState();
      return error ? error.message : NOT_STAFF;
    }
    setSession(sess);
    setUser(sess.user);
    setRole(r.role);
    setIsAdmin(r.is_admin);
    setNeedsMfa(r.role === "admin" && r.aal !== "aal2");
    return null;
  }, [clearState]);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (session) {
      timeoutRef.current = setTimeout(() => {
        handleSignOut();
      }, SESSION_TIMEOUT_MS);
    }
  }, [session, handleSignOut]);

  // Activity listeners for session timeout
  useEffect(() => {
    if (!session) return;
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session, resetTimer]);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      // Token refreshes and MFA step-ups change the JWT (aal), so re-check the role.
      if (event === "SIGNED_OUT") {
        clearState();
        setLoading(false);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "MFA_CHALLENGE_VERIFIED") {
        // Defer: calling supabase inside this callback can deadlock the auth client.
        setTimeout(() => {
          if (active) loadRole(sess).finally(() => setLoading(false));
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      loadRole(sess).finally(() => {
        if (active) setLoading(false);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadRole, clearState]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const roleError = await loadRole(data.session);
    return { error: roleError };
  };

  const refreshRole = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await loadRole(data.session);
  }, [loadRole]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, role, isAdmin, needsMfa, signIn, signOut: handleSignOut, refreshRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
