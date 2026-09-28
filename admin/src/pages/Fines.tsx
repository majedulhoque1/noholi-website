import { useState } from "react";
import { Eye, Ban, DollarSign, Loader2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { FineDetailDrawer } from "@/components/fines/FineDetailDrawer";
import { PayFineDialog } from "@/components/fines/PayFineDialog";
import { WaiveFineDialog } from "@/components/fines/WaiveFineDialog";
import { FINE_STATUS_VARIANT } from "@/components/fines/fine-status";
import { useCanWrite } from "@/lib/roles";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useFines, type Fine } from "@/hooks/use-fines";
import { formatTaka } from "@/lib/currency";
import { formatDhaka } from "@/lib/dhaka-date";

const FILTER_OPTIONS = ["Open", "Accruing", "Unpaid", "Partially Paid", "Paid", "Waived", "Voided", "All"] as const;
type Filter = typeof FILTER_OPTIONS[number];

const isPayable = (f: Fine) => f.status === "Unpaid" || f.status === "Partially Paid";

export default function FinesPage() {
  const canWrite = useCanWrite();
  const { isAdmin, needsMfa } = useAuth();
  const { toast } = useToast();
  const { fines, loading, error, totals, recordPayment, waiveFine } = useFines();

  const [filter, setFilter] = useState<Filter>("Open");
  const [search, setSearch] = useState("");
  const [detailFine, setDetailFine] = useState<Fine | null>(null);
  const [payFine, setPayFine] = useState<Fine | null>(null);
  const [waiveTarget, setWaiveTarget] = useState<Fine | null>(null);

  const q = search.toLowerCase();
  const filtered = fines.filter((f) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Open" ? isPayable(f) || f.isAccruing : f.status === filter);
    const matchesSearch =
      !search ||
      f.member.toLowerCase().includes(q) ||
      f.memberId.toLowerCase().includes(q) ||
      f.book.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.loanId.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const hasFilters = search || filter !== "Open";

  const columns: Column<Fine>[] = [
    { key: "id", label: "Fine", className: "text-muted-foreground font-mono text-[12px]", render: (f) => (f.isAccruing ? "—" : f.id) },
    {
      key: "member",
      label: "Member",
      render: (f) => (
        <>
          <span className="font-medium text-foreground">{f.member}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{f.memberId}</span>
        </>
      ),
    },
    {
      key: "book",
      label: "Book / Loan",
      className: "max-w-[220px]",
      render: (f) => (
        <div className="min-w-0">
          <p className="truncate">{f.book}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {f.loanId}
            {f.kind === "Lost" && <span className="font-sans"> · lost book</span>}
          </p>
        </div>
      ),
    },
    { key: "dueDate", label: "Due Date", className: "text-muted-foreground whitespace-nowrap", render: (f) => formatDhaka(f.dueDate) },
    {
      key: "daysOverdue",
      label: "Days",
      headerClassName: "text-right",
      className: "text-right font-mono text-[12px]",
      render: (f) => (f.kind === "Lost" ? "—" : f.daysOverdue),
    },
    {
      key: "amount",
      label: "Amount",
      headerClassName: "text-right",
      className: "text-right font-medium whitespace-nowrap",
      render: (f) => formatTaka(f.amount),
    },
    {
      key: "balance",
      label: "Balance",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (f) =>
        f.isAccruing ? (
          <span className="text-[11px] text-muted-foreground">not payable yet</span>
        ) : f.balance > 0 ? (
          <span className="font-medium text-destructive">{formatTaka(f.balance)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (f) => <StatusBadge variant={FINE_STATUS_VARIANT[f.status]}>{f.status}</StatusBadge>,
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (f: Fine) => (
              <RowActions
                primary={
                  isPayable(f)
                    ? [{ label: "Record Payment", icon: DollarSign, onClick: () => setPayFine(f) }]
                    : [{ label: "View details", icon: Eye, onClick: () => setDetailFine(f) }]
                }
                secondary={[
                  // waive_fine is admin-only and needs two-factor sign-in (aal2).
                  ...(isPayable(f) && isAdmin
                    ? [{ label: "Waive fine", icon: Ban, onClick: () => setWaiveTarget(f), variant: "destructive" as const }]
                    : []),
                  ...(isPayable(f) ? [{ label: "View details", icon: Eye, onClick: () => setDetailFine(f) }] : []),
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading fines…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Fines"
        subtitle={`Outstanding ${formatTaka(totals.outstanding)} · Accruing ${formatTaka(totals.accruing)} · Collected ${formatTaka(totals.collected)} · Waived ${formatTaka(totals.waived)}`}
      />

      <p className="text-[12px] text-muted-foreground">
        A fine becomes payable when an overdue book is returned or marked lost. Books still out show the amount accruing so far.
        {needsMfa && (
          <span className="inline-flex items-center gap-1 ml-1.5 text-warning">
            <ShieldCheck className="h-3 w-3" /> Verify with your authenticator app to waive fines.
          </span>
        )}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by member, book, fine or loan ID..."
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <FilterChips options={[...FILTER_OPTIONS]} value={filter} onChange={(v) => setFilter(v as Filter)} />
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilter("Open"); }}
            className="text-[12px] text-muted-foreground hover:text-foreground underline"
          >
            Reset
          </button>
        )}
      </div>

      {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

      <div className="text-[12px] text-muted-foreground">
        Showing {filtered.length} of {totals.count}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(f) => `${f.isAccruing ? "acc" : "fine"}-${f.id}`}
        onRowClick={(f) => setDetailFine(f)}
        emptyMessage="No fines found."
        compact
      />

      <FineDetailDrawer fine={detailFine} open={!!detailFine} onClose={() => setDetailFine(null)} />

      <PayFineDialog
        fine={payFine}
        open={!!payFine}
        onClose={() => setPayFine(null)}
        onConfirm={async (payment) => {
          if (!payFine) return { success: false, error: "No fine selected" };
          const result = await recordPayment(payFine.id, payment);
          if (result.success) {
            toast({
              title: result.data.duplicate ? "Payment already recorded" : "Payment recorded",
              description: `${payFine.id} · ${formatTaka(payment.amount)} · now ${result.data.status}`,
            });
          }
          return result;
        }}
      />

      <WaiveFineDialog
        fine={waiveTarget}
        open={!!waiveTarget}
        onClose={() => setWaiveTarget(null)}
        onConfirm={async (reason) => {
          if (!waiveTarget) return { success: false, error: "No fine selected" };
          const result = await waiveFine(waiveTarget.id, reason);
          if (result.success) toast({ title: "Fine waived", description: `${waiveTarget.id} written off` });
          return result;
        }}
      />
    </div>
  );
}
