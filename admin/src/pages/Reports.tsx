import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { describeError } from "@/lib/rpc";
import { formatDhaka, todayDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";

interface MonthRow { month: string; loans_issued: number; returned: number; lost: number; cancelled: number; still_active: number }
interface TopBook { book_id: string; title: string; title_bangla: string | null; author: string | null; times_borrowed: number; last_borrowed: string }
interface OverdueRow {
  loan_id: string; book_id: string; book_title: string; member_id: string; member_name: string; member_phone: string | null;
  due_date: string; days_overdue: number; accruing_fine: number | string; guarantor_name: string | null; guarantor_phone: string | null;
}
interface FinesRow { month: string; method: string; payments: number; amount_collected: number | string }

const monthLabel = (iso: string) => formatDhaka(iso, { month: "short", year: "2-digit" });

function useReports() {
  const [data, setData] = useState<{ months: MonthRow[]; top: TopBook[]; overdue: OverdueRow[]; fines: FinesRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, t, o, f] = await Promise.all([
          supabase.from("loans_per_month_v").select("*").order("month", { ascending: false }).limit(12),
          supabase.from("top_books_v").select("*").limit(10),
          supabase.from("overdue_list_v").select("*").limit(200),
          supabase.from("fines_collected_v").select("*").order("month", { ascending: false }).limit(72),
        ]);
        for (const r of [m, t, o, f]) if (r.error) throw r.error;
        setData({
          months: ((m.data ?? []) as unknown as MonthRow[]).slice().reverse(),
          top: (t.data ?? []) as unknown as TopBook[],
          overdue: (o.data ?? []) as unknown as OverdueRow[],
          fines: (f.data ?? []) as unknown as FinesRow[],
        });
      } catch (e) {
        setError(describeError(e).message);
      }
    })();
  }, []);

  return { data, error };
}

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 4,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
};

const topColumns: Column<TopBook>[] = [
  { key: "rank", label: "#", className: "text-muted-foreground w-8", mobile: "meta", render: (_, i) => i + 1 },
  {
    key: "title",
    label: "Title",
    className: "max-w-[240px]",
    mobile: "title",
    render: (b) => (
      <div className="min-w-0">
        <p className="font-medium truncate">{b.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{b.title_bangla || b.author}</p>
      </div>
    ),
  },
  { key: "last", label: "Last borrowed", className: "text-muted-foreground whitespace-nowrap", mobile: "meta", render: (b) => formatDhaka(b.last_borrowed) },
  { key: "borrows", label: "Borrows", headerClassName: "text-right", className: "text-right font-mono", mobile: "meta", render: (b) => b.times_borrowed },
];

const overdueColumns: Column<OverdueRow>[] = [
  { key: "loan", label: "Loan", className: "font-mono text-[12px] text-muted-foreground", mobile: "meta", render: (r) => r.loan_id },
  {
    key: "member",
    label: "Member",
    mobile: "subtitle",
    render: (r) => (
      <div>
        <span className="font-medium">{r.member_name}</span>
        <span className="ml-1.5 text-[11px] text-muted-foreground">{r.member_id}</span>
        <p className="text-[11px] text-muted-foreground">{r.member_phone || "—"}</p>
      </div>
    ),
  },
  { key: "book", label: "Book", className: "max-w-[200px] truncate", mobile: "title", render: (r) => r.book_title },
  { key: "due", label: "Due", className: "whitespace-nowrap text-muted-foreground", mobile: "meta", render: (r) => formatDhaka(r.due_date) },
  { key: "days", label: "Days", headerClassName: "text-right", className: "text-right font-mono", mobile: "meta", render: (r) => r.days_overdue },
  { key: "fine", label: "Accruing", headerClassName: "text-right", className: "text-right whitespace-nowrap text-destructive", mobile: "meta", render: (r) => formatTaka(Number(r.accruing_fine)) },
  {
    key: "guarantor",
    label: "Guarantor",
    className: "text-[12px]",
    mobile: "meta",
    render: (r) => (r.guarantor_name ? `${r.guarantor_name} · ${r.guarantor_phone ?? "—"}` : "—"),
  },
];

interface FinesByMonth { month: string; label: string; payments: number; total: number; byMethod: string }
const finesColumns: Column<FinesByMonth>[] = [
  { key: "month", label: "Month", className: "whitespace-nowrap", mobile: "title", render: (r) => formatDhaka(r.month, { month: "long", year: "numeric" }) },
  { key: "payments", label: "Payments", headerClassName: "text-right", className: "text-right font-mono", mobile: "meta", render: (r) => r.payments },
  { key: "methods", label: "By method", className: "text-[12px] text-muted-foreground", mobile: "subtitle", render: (r) => r.byMethod },
  { key: "total", label: "Collected", headerClassName: "text-right", className: "text-right font-medium whitespace-nowrap", mobile: "meta", render: (r) => formatTaka(r.total) },
];

export default function ReportsPage() {
  const { data, error } = useReports();

  const derived = useMemo(() => {
    if (!data) return null;
    const byMonth = new Map<string, FinesByMonth>();
    for (const r of data.fines) {
      const cur = byMonth.get(r.month) ?? { month: r.month, label: monthLabel(r.month), payments: 0, total: 0, byMethod: "" };
      cur.payments += r.payments;
      cur.total += Number(r.amount_collected);
      cur.byMethod = [cur.byMethod, `${r.method} ${formatTaka(Number(r.amount_collected))}`].filter(Boolean).join(" · ");
      byMonth.set(r.month, cur);
    }
    const finesMonths = [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month));
    const thisMonth = `${todayDhaka().slice(0, 7)}-01`;
    const current = data.months.find((m) => m.month === thisMonth);
    const loans12 = data.months.reduce((s, m) => s + m.loans_issued, 0);
    const active = data.months.reduce((s, m) => s + m.still_active, 0);
    return {
      finesMonths,
      summary: [
        { label: "Loans (12 months)", value: loans12.toLocaleString() },
        { label: "Loans this month", value: (current?.loans_issued ?? 0).toLocaleString() },
        {
          label: "Overdue now",
          value: active > 0 ? `${data.overdue.length} of ${active} (${Math.round((data.overdue.length / active) * 100)}%)` : String(data.overdue.length),
        },
        { label: "Fines collected this month", value: formatTaka(byMonth.get(thisMonth)?.total ?? 0) },
      ],
      chartMonths: data.months.map((m) => ({ ...m, label: monthLabel(m.month) })),
      chartFines: finesMonths.slice(0, 12).reverse(),
    };
  }, [data]);

  if (error) {
    return <p className="text-[13px] text-destructive" role="alert">Could not load reports: {error}</p>;
  }

  if (!data || !derived) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading reports…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">Reports</h1>
        <p className="text-[13px] text-muted-foreground">Lending and fines, live from the library database</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {derived.summary.map((s) => (
          <Card key={s.label} className="shadow-none">
            <CardContent className="p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-lg font-semibold text-foreground mt-0.5 leading-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Card className="shadow-none">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[13px] font-semibold">Loans per month</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 h-56">
            {derived.chartMonths.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No loans yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derived.chartMonths} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="loans_issued" name="Issued" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="returned" name="Returned" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[13px] font-semibold">Fines collected per month</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 h-56">
            {derived.chartFines.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No fine payments yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derived.chartFines} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatTaka(v)} />
                  <Bar dataKey="total" name="Collected" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground mb-1 px-1">Most borrowed books</h3>
          <DataTable columns={topColumns} data={data.top} keyExtractor={(b) => b.book_id} emptyMessage="No loans yet." compact />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-foreground mb-1 px-1">Fines collected</h3>
          <DataTable columns={finesColumns} data={derived.finesMonths} keyExtractor={(r) => r.month} emptyMessage="No fine payments yet." compact />
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-foreground mb-1 px-1">
          Overdue now <span className="text-muted-foreground font-normal">({data.overdue.length})</span>
        </h3>
        <DataTable columns={overdueColumns} data={data.overdue} keyExtractor={(r) => r.loan_id} emptyMessage="Nothing is overdue." compact />
      </div>
    </div>
  );
}
