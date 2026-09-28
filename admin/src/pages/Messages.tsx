import { useState } from "react";
import { Archive, ArchiveRestore, Loader2, Mail, MailOpen, Phone, Reply } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useCanWrite } from "@/lib/roles";
import { formatDhaka } from "@/lib/dhaka-date";
import { cn } from "@/lib/utils";
import { useContactMessages, type ContactMessage, type MessageStatus } from "@/components/messages/use-contact-messages";

const STATUS_VARIANT: Record<MessageStatus, BadgeVariant> = { New: "accent", Read: "muted", Archived: "default" };
const FILTERS = ["Inbox", "New", "Archived", "All"] as const;
type Filter = typeof FILTERS[number];

const when = (iso: string) => formatDhaka(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function replyHref(m: ContactMessage) {
  const subject = encodeURIComponent(`Re: ${m.subject || "Your message to Noholi Library"}`);
  const body = encodeURIComponent(`\n\n---\nOn ${when(m.createdAt)}, ${m.name} wrote:\n${m.message}`);
  return `mailto:${m.email}?subject=${subject}&body=${body}`;
}

export default function MessagesPage() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const { messages, loading, error, setStatus } = useContactMessages();
  const [filter, setFilter] = useState<Filter>("Inbox");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const open = messages.find((m) => m.id === openId) ?? null;

  const change = async (m: ContactMessage, status: MessageStatus) => {
    const r = await setStatus(m.id, status);
    if (r.success === false) toast({ title: "Could not update message", description: r.error, variant: "destructive" });
  };

  const openMessage = (m: ContactMessage) => {
    setOpenId(m.id);
    if (m.status === "New" && canWrite) change(m, "Read");
  };

  const q = search.toLowerCase();
  const rows = messages.filter((m) => {
    const inFilter = filter === "All" || (filter === "Inbox" ? m.status !== "Archived" : m.status === filter);
    const inSearch = !q || [m.name, m.email, m.phone, m.subject, m.message].some((v) => v.toLowerCase().includes(q));
    return inFilter && inSearch;
  });
  const newCount = messages.filter((m) => m.status === "New").length;

  const columns: Column<ContactMessage>[] = [
    {
      key: "from", label: "From",
      render: (m) => (
        <div className="min-w-0">
          <p className={cn("text-foreground", m.status === "New" && "font-semibold")}>{m.name}</p>
          <p className="text-[12px] text-muted-foreground truncate">{[m.email, m.phone].filter(Boolean).join(" · ")}</p>
        </div>
      ),
    },
    {
      key: "message", label: "Message",
      render: (m) => (
        <div className="min-w-0 max-w-[520px]">
          <p className={cn("truncate", m.status === "New" ? "font-semibold text-foreground" : "text-foreground")}>{m.subject || "(no subject)"}</p>
          <p className="text-[12px] text-muted-foreground truncate">{m.message}</p>
        </div>
      ),
    },
    { key: "when", label: "Received", className: "text-[12px] text-muted-foreground whitespace-nowrap", render: (m) => when(m.createdAt) },
    { key: "status", label: "Status", render: (m) => <StatusBadge variant={STATUS_VARIANT[m.status]}>{m.status}</StatusBadge> },
    {
      key: "actions", label: "", headerClassName: "text-right", className: "text-right whitespace-nowrap",
      render: (m) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {m.email && (
            <Button asChild size="sm" variant="outline" className="h-7 text-[12px] gap-1">
              <a href={replyHref(m)}><Reply className="h-3 w-3" /> Reply by email</a>
            </Button>
          )}
          {!m.email && m.phone && (
            <Button asChild size="sm" variant="outline" className="h-7 text-[12px] gap-1">
              <a href={`tel:${m.phone}`}><Phone className="h-3 w-3" /> Call</a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <PageHeader title="Messages" subtitle={`${newCount} new · from the website Contact form`} />
      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, phone, text…" className="flex-1 min-w-[200px] max-w-xs" />
        <FilterChips options={[...FILTERS]} value={filter} onChange={(v) => setFilter(v as Filter)} />
      </div>
      {error && <p className="text-[12px] text-destructive">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span className="text-[13px]">Loading messages…</span></div>
      ) : (
        <DataTable columns={columns} data={rows} keyExtractor={(m) => String(m.id)} onRowClick={openMessage} emptyMessage="No messages." compact />
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          {open && (
            <>
              <SheetHeader className="p-4 border-b border-border space-y-2 text-left">
                <SheetTitle className="text-base">{open.subject || "(no subject)"}</SheetTitle>
                <SheetDescription className="text-[12px]">From {open.name} · {when(open.createdAt)}</SheetDescription>
                <div className="flex gap-2 flex-wrap">
                  {open.email && (
                    <Button asChild size="sm" className="h-7 text-[12px] gap-1"><a href={replyHref(open)}><Reply className="h-3 w-3" /> Reply by email</a></Button>
                  )}
                  {open.phone && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-[12px] gap-1"><a href={`tel:${open.phone}`}><Phone className="h-3 w-3" /> {open.phone}</a></Button>
                  )}
                  {canWrite && open.status !== "Archived" && (
                    <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1" onClick={() => { change(open, "Archived"); setOpenId(null); }}><Archive className="h-3 w-3" /> Archive (handled)</Button>
                  )}
                  {canWrite && open.status === "Archived" && (
                    <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1" onClick={() => change(open, "Read")}><ArchiveRestore className="h-3 w-3" /> Move to inbox</Button>
                  )}
                  {canWrite && open.status === "Read" && (
                    <Button size="sm" variant="ghost" className="h-7 text-[12px] gap-1" onClick={() => { change(open, "New"); setOpenId(null); }}><Mail className="h-3 w-3" /> Mark unread</Button>
                  )}
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-[12px] text-muted-foreground space-y-0.5">
                  {open.email && <p className="flex items-center gap-1"><MailOpen className="h-3 w-3" /> {open.email}</p>}
                  {open.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {open.phone}</p>}
                </div>
                <p className="text-[13px] text-foreground whitespace-pre-wrap break-words">{open.message}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
