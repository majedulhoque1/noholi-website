import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { describeError, type Result } from "@/lib/rpc";

export type MessageStatus = "New" | "Read" | "Archived";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

/** Website Contact form messages (CONTRACT.md §2 contact_messages). Staff may update `status` only. */
export function useContactMessages() {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) { setError(describeError(err).message); return; }
    setMessages((data ?? []).map((m) => ({
      id: m.id, name: m.name, email: m.email ?? "", phone: m.phone ?? "", subject: m.subject ?? "",
      message: m.message, status: m.status as MessageStatus, createdAt: m.created_at,
    })));
    setError(null);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
    const onFocus = () => { reload(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  const setStatus = useCallback(async (id: number, status: MessageStatus): Promise<Result> => {
    const prev = messages.find((m) => m.id === id)?.status;
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)));
    const { error: err } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (err) {
      if (prev) setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, status: prev } : m)));
      const d = describeError(err);
      return { success: false, error: d.message, code: d.code };
    }
    qc.invalidateQueries({ queryKey: ["notifications"] });
    return { success: true, data: undefined };
  }, [messages, qc]);

  return { messages, loading, error, reload, setStatus };
}
