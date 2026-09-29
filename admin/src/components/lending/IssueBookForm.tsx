import { useState, useMemo, useEffect } from "react";
import { CheckCircle2, CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDaysISO, formatDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";
import type { Outcome } from "@/hooks/use-inventory";
import {
  searchMembers, searchBooksForLoan,
  type IssueLoanInput, type GuarantorDetails, type MemberOption, type BookOption, type LibrarySettings,
} from "@/hooks/use-loans";

interface IssueBookFormProps {
  settings: LibrarySettings;
  onIssue: (input: IssueLoanInput, labels: { member: string; book: string }) => Promise<Outcome<{ id: string; due_date: string }>>;
}

const RELATIONSHIPS = ["Parent", "Sibling", "Spouse", "Friend", "Colleague", "Guardian", "Other"];

const EMPTY_GUARANTOR: GuarantorDetails = {
  name: "", phone: "", email: "", relationship: "", nid: "", street: "", city: "", district: "", postalCode: "",
};

/** Debounced async search used by both pickers. */
function useAsyncSearch<T>(open: boolean, fetcher: (q: string) => Promise<T[]>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetcher(query)
        .then((r) => { if (!cancelled) { setResults(r); setError(null); } })
        .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Search failed"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, open, fetcher]);
  return { query, setQuery, results, loading, error };
}

export function IssueBookForm({ settings, onIssue }: IssueBookFormProps) {
  const defaultDue = useMemo(() => addDaysISO(settings.today, settings.loanDays), [settings]);

  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookOption | null>(null);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [memberOpen, setMemberOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [g, setG] = useState<GuarantorDetails>(EMPTY_GUARANTOR);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const memberSearch = useAsyncSearch(memberOpen, searchMembers);
  const bookSearch = useAsyncSearch(bookOpen, searchBooksForLoan);

  const setField = (k: keyof GuarantorDetails) => (v: string) => setG((prev) => ({ ...prev, [k]: v }));

  const pickMember = (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setValidationError("");
    // Pre-fill the guarantor step with the member's saved default guarantor.
    setG({ ...EMPTY_GUARANTOR, ...m.defaultGuarantor });
  };

  const memberWarning = useMemo(() => {
    const m = selectedMember;
    if (!m) return "";
    if (m.status !== "Active") return `Membership is ${m.status.toLowerCase()}.`;
    if (m.overdueLoans > 0) return `Member has ${m.overdueLoans} overdue book${m.overdueLoans > 1 ? "s" : ""}.`;
    if (m.outstandingFines > 0) return `Member has an unpaid fine of ${formatTaka(m.outstandingFines)}.`;
    const open = m.activeLoans + m.activeHolds;
    if (open >= settings.maxItems) return `Member already has ${open} items (loans and holds). The limit is ${settings.maxItems}.`;
    return "";
  }, [selectedMember, settings.maxItems]);

  const bookWarning = selectedBook
    ? !selectedBook.isCirculating
      ? "Reading room only, cannot be borrowed."
      : selectedBook.availableCopies <= 0
        ? "No copies available right now."
        : ""
    : "";

  const guarantorValid = !!(g.name.trim() && g.phone.trim() && g.relationship && g.street.trim() && g.city.trim() && g.district.trim());
  const canIssue = !!(selectedMember && selectedBook && dueDate && guarantorValid && confirmed && !memberWarning && !bookWarning && !submitting);

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook) return;
    setSubmitting(true);
    setValidationError("");
    const result = await onIssue(
      { memberId: selectedMember.memberId, bookId: selectedBook.id, dueDate, guarantor: g },
      { member: selectedMember.name, book: selectedBook.title },
    );
    setSubmitting(false);
    if (!result.success) {
      setValidationError(result.error);
      return;
    }
    setSelectedMember(null);
    setSelectedBook(null);
    setG(EMPTY_GUARANTOR);
    setConfirmed(false);
    setDueDate(defaultDue);
  };

  return (
    <div className="bg-card border border-border rounded p-3">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-[13px] font-semibold text-foreground">Issue Book</h2>
        <p className="text-[11px] text-muted-foreground">
          Loan period {settings.loanDays} days · limit {settings.maxItems} items per member
        </p>
      </div>

      {/* Step 1–2: member, book, due date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="space-y-1">
          <label className="text-[12px] font-medium text-muted-foreground">1. Member</label>
          <Popover open={memberOpen} onOpenChange={setMemberOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-11 text-base md:h-8 md:text-[13px] justify-between font-normal" data-testid="issue-member">
                {selectedMember ? (
                  <span className="truncate">{selectedMember.name} <span className="text-muted-foreground text-[11px]">({selectedMember.memberId})</span></span>
                ) : (
                  <span className="text-muted-foreground">Search member…</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[calc(100vw-2rem)] max-w-[320px]" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Name, member ID, phone or email…"
                  className="text-base md:text-[13px]"
                  value={memberSearch.query}
                  onValueChange={memberSearch.setQuery}
                />
                <CommandList>
                  {memberSearch.loading && <div className="py-3 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
                  {!memberSearch.loading && (
                    <CommandEmpty className="text-[13px] py-4 text-center">{memberSearch.error ?? "No members found."}</CommandEmpty>
                  )}
                  <CommandGroup>
                    {memberSearch.results.map((m) => (
                      <CommandItem key={m.memberId} value={m.memberId} onSelect={() => pickMember(m)} className="text-[13px] cursor-pointer">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {m.activeLoans} loan{m.activeLoans === 1 ? "" : "s"} · {m.activeHolds} hold{m.activeHolds === 1 ? "" : "s"}
                            {m.status !== "Active" && ` · ${m.status}`}
                          </p>
                        </div>
                        <span className="ml-auto text-[11px] text-muted-foreground font-mono">{m.memberId}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedMember && !memberWarning && (
            <p className="text-[11px] text-success flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {selectedMember.activeLoans + selectedMember.activeHolds} of {settings.maxItems} items in use
            </p>
          )}
          {memberWarning && <p className="text-[11px] text-destructive">{memberWarning}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-medium text-muted-foreground">2. Book</label>
          <Popover open={bookOpen} onOpenChange={setBookOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-11 text-base md:h-8 md:text-[13px] justify-between font-normal" data-testid="issue-book">
                {selectedBook ? (
                  <span className="truncate">{selectedBook.title} — <span className="text-muted-foreground text-[11px]">{selectedBook.id}</span></span>
                ) : (
                  <span className="text-muted-foreground">Search book or ID…</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[calc(100vw-2rem)] max-w-[360px]" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Title or author (English / বাংলা), ISBN, ID…"
                  className="text-base md:text-[13px]"
                  value={bookSearch.query}
                  onValueChange={bookSearch.setQuery}
                />
                <CommandList className="max-h-[300px]">
                  {bookSearch.loading && <div className="py-3 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
                  {!bookSearch.loading && (
                    <CommandEmpty className="text-[13px] py-4 text-center">{bookSearch.error ?? "No books found."}</CommandEmpty>
                  )}
                  <CommandGroup>
                    {bookSearch.results.map((b) => {
                      const blocked = !b.isCirculating || b.availableCopies <= 0;
                      return (
                        <CommandItem
                          key={b.id}
                          value={b.id}
                          disabled={blocked}
                          onSelect={() => { setSelectedBook(b); setBookOpen(false); setValidationError(""); }}
                          className="text-[13px] cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{b.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {b.titleBangla || b.author}
                            </p>
                          </div>
                          <span className="ml-auto text-right text-[11px] text-muted-foreground shrink-0 pl-2">
                            <span className="font-mono block">{b.id}</span>
                            {!b.isCirculating ? "Reading room" : `${b.availableCopies} available`}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedBook && !bookWarning && (
            <p className="text-[11px] text-success flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {selectedBook.availableCopies} {selectedBook.availableCopies === 1 ? "copy" : "copies"} available
            </p>
          )}
          {bookWarning && <p className="text-[11px] text-destructive">{bookWarning}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-medium text-muted-foreground">Due Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={dueDate}
              min={settings.today}
              onChange={(e) => setDueDate(e.target.value)}
              className="pl-8 h-11 text-base md:h-8 md:text-[13px]"
              aria-label="Due date"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Default {formatDhaka(defaultDue)}. A closed day moves to the next open day.
          </p>
        </div>
      </div>

      {/* Step 3: guarantor */}
      <div className="border border-border rounded p-2.5 mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">3. Guarantor Details</h3>
          {selectedMember?.defaultGuarantor.name && (
            <span className="text-[11px] text-muted-foreground">Pre-filled from the member's saved guarantor</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Field label="Full Name *" value={g.name} onChange={setField("name")} placeholder="Guarantor name" />
          <Field label="Phone *" value={g.phone} onChange={setField("phone")} placeholder="01…" />
          <Field label="Email" value={g.email} onChange={setField("email")} placeholder="email@example.com" />
          <Field label="NID" value={g.nid} onChange={setField("nid")} placeholder="National ID" />
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Relationship *</label>
            <Select value={g.relationship || undefined} onValueChange={setField("relationship")}>
              <SelectTrigger className="h-11 text-base md:h-8 md:text-[13px]" aria-label="Relationship">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {(g.relationship && !RELATIONSHIPS.includes(g.relationship) ? [g.relationship, ...RELATIONSHIPS] : RELATIONSHIPS).map((r) => (
                  <SelectItem key={r} value={r} className="text-[13px]">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
          <Field label="Street Address *" value={g.street} onChange={setField("street")} placeholder="Street address" />
          <Field label="City / Area *" value={g.city} onChange={setField("city")} placeholder="City" />
          <Field label="District *" value={g.district} onChange={setField("district")} placeholder="District" />
          <Field label="Postal Code" value={g.postalCode} onChange={setField("postalCode")} placeholder="1200" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="guarantor-confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
          <label htmlFor="guarantor-confirm" className="text-[12px] text-muted-foreground cursor-pointer select-none">
            I confirm the guarantor is responsible for this borrowing.
          </label>
        </div>
        <Button size="sm" className="w-full h-11 text-base md:w-auto md:h-8 md:text-[13px] px-6 gap-1.5" disabled={!canIssue} onClick={handleIssue}>
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? "Issuing…" : "Confirm Issue"}
        </Button>
      </div>

      {validationError && <p className="text-[12px] text-destructive mt-2" role="alert">{validationError}</p>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 text-base md:h-8 md:text-[13px]" aria-label={label.replace(" *", "")} />
    </div>
  );
}
