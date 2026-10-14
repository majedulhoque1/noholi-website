import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

// Notification preferences, backed by public.member_prefs (read, own row) and
// rpc('update_my_prefs'). A member with no row yet gets the defaults below.

export type Prefs = {
  due_date_reminders: boolean;
  borrow_request_updates: boolean;
  contribution_decisions: boolean;
  new_noholi_books: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  due_date_reminders: true,
  borrow_request_updates: true,
  contribution_decisions: true,
  new_noholi_books: false,
};

export function useMyPrefs(memberId: string | null) {
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    if (!memberId) return;
    let live = true;
    supabase
      .from("member_prefs")
      .select(
        "due_date_reminders, borrow_request_updates, contribution_decisions, new_noholi_books",
      )
      .eq("member_id", memberId)
      .maybeSingle()
      .then(({ data }) => {
        if (live) setPrefs({ ...DEFAULT_PREFS, ...((data as Partial<Prefs> | null) ?? {}) });
      });
    return () => {
      live = false;
    };
  }, [memberId]);

  /** Optimistic: flips immediately, rolls back and rethrows if the save fails. */
  const setPref = useCallback(async (key: keyof Prefs, value: boolean) => {
    let before: Prefs | null = null;
    setPrefs((p) => {
      before = p;
      return p ? { ...p, [key]: value } : p;
    });
    const { error } = await supabase.rpc("update_my_prefs", { [`p_${key}`]: value });
    if (error) {
      setPrefs(before);
      throw error;
    }
  }, []);

  return { prefs, setPref };
}
