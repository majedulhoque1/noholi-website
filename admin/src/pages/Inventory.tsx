import { useState, useCallback, useEffect } from "react";
import {
  Plus, Download, Pencil, Archive, ArchiveRestore, BookOpen, Eye, Package, AlertTriangle, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { BookDetailDrawer } from "@/components/BookDetailDrawer";
import { AdjustStockDialog } from "@/components/AdjustStockDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AddBookDialog } from "@/components/AddBookDialog";
import { EditBookDialog } from "@/components/EditBookDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useInventory, fetchAllBooks, deriveStatus, isLowStock,
  type Book, type BookStatus, type BookMetadata, type InventoryFlag, type NewBookInput, type StatusFilter,
} from "@/hooks/use-inventory";
import { useCanWrite } from "@/lib/roles";
import { formatTaka } from "@/lib/currency";
import { todayDhaka } from "@/lib/dhaka-date";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<BookStatus, BadgeVariant> = {
  Available: "success",
  Unavailable: "warning",
  "Out of Stock": "destructive",
};

const STATUSES = ["All", "Available", "Unavailable", "Out of Stock"] as const;
const PAGE_SIZE = 50;

const FLAG_LABELS: Record<InventoryFlag, string> = {
  "missing-price": "Missing price",
  "missing-cover": "Missing cover",
  "non-circulating": "Reading room only",
  archived: "Archived",
};

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Inventory() {
  const canWrite = useCanWrite();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [flags, setFlags] = useState<InventoryFlag[]>([]);
  const [page, setPage] = useState(1);

  // Any filter change starts again at page 1.
  useEffect(() => setPage(1), [debouncedSearch, genreFilter, categoryFilter, languageFilter, statusFilter, flags]);

  const {
    books, total, loading, error, stats, statsLoaded, facets,
    addBook, updateBook, setCover, adjustStock, setArchived,
  } = useInventory({
    search: debouncedSearch,
    genre: genreFilter,
    category: categoryFilter,
    language: languageFilter,
    status: statusFilter,
    flags,
    page,
    pageSize: PAGE_SIZE,
  });

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [stockBook, setStockBook] = useState<Book | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [exporting, setExporting] = useState(false);

  // Keep open drawers in sync with refreshed rows.
  useEffect(() => {
    setSelectedBook((cur) => (cur ? books.find((b) => b.id === cur.id) ?? cur : cur));
  }, [books]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportBooks = useCallback(async () => {
    setExporting(true);
    try {
      const all = await fetchAllBooks(flags.includes("archived"));
      const exportData = all.map((b) => ({
        "Book ID": b.id,
        "Title (English)": b.title,
        "Title (Bangla)": b.titleBangla,
        "Author (English)": b.author,
        "Author (Bangla)": b.authorBangla,
        "Genre": b.genre,
        "Category": b.category,
        "Language": b.language,
        "ISBN": b.isbn,
        "Publisher": b.publisher,
        "Year of Publication": b.yearOfPublication,
        "Edition": b.edition,
        "Condition": b.condition,
        "Pages": b.pages || "",
        "Price (৳)": b.price ?? "",
        "Total Copies": b.totalCopies,
        "Available Copies": b.availableCopies,
        "Issued Copies": b.issuedCopies,
        "Reserved Copies": b.reservedCopies,
        "Reading Room Only": b.isCirculating ? "" : "Yes",
        "Location": b.location,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Books");
      XLSX.writeFile(wb, `Inventory_${todayDhaka()}_${all.length}_records.xlsx`);
      toast.success(`Exported ${all.length} records`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [flags]);

  /*
   * Bulk "Upload Excel" import is intentionally hidden. The real catalogue
   * (3,016 titles) was imported once by the seed script (supabase/seed) with
   * explicit BK- ids, covers and raw-value cleanup. A second spreadsheet import
   * from the browser would create duplicate titles with new ids and cannot
   * reconcile copy counts, so new books are added one at a time with Add Book.
   */

  const handleAddBook = useCallback(async (book: NewBookInput, cover: Blob | null) => {
    const res = await addBook(book, cover);
    if (res.success) toast.success(`"${book.title}" added as ${res.data}`);
    else toast.error(res.error);
    return res;
  }, [addBook]);

  const hasFilters = search || genreFilter !== "All" || categoryFilter !== "All" || languageFilter !== "All" || statusFilter !== "All" || flags.length > 0;

  const resetFilters = () => {
    setSearch("");
    setGenreFilter("All");
    setCategoryFilter("All");
    setLanguageFilter("All");
    setStatusFilter("All");
    setFlags([]);
  };

  const toggleFlag = (f: InventoryFlag) =>
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const handleAdjustStock = async (bookId: string, newTotal: number, reason: string) => {
    const result = await adjustStock(bookId, newTotal, reason);
    if (result.success) {
      toast.success("Stock updated");
      return { success: true };
    }
    toast.error(result.error);
    return { success: false, error: result.error };
  };

  const handleEditSave = async (updates: BookMetadata) => {
    if (!editBook) return { success: false as const, error: "No book selected" };
    const result = await updateBook(editBook.id, updates);
    if (result.success) toast.success(`"${updates.title}" updated`);
    else toast.error(result.error);
    return result;
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    const restoring = !!archiveTarget.archivedAt;
    const result = await setArchived(archiveTarget.id, !restoring);
    if (result.success) toast.success(`"${archiveTarget.title}" ${restoring ? "restored" : "archived"}`);
    else toast.error(result.error);
    setArchiveTarget(null);
  };

  const columns: Column<Book>[] = [
    {
      key: "thumb",
      label: "",
      className: "w-10",
      render: (b) => (
        <div className="h-10 w-7 rounded-sm bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
          {b.coverUrl ? (
            <img src={b.coverUrl} alt="" className="h-10 w-7 object-cover" loading="lazy" />
          ) : (
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      className: "max-w-[240px]",
      render: (b) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{b.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            <span className="font-mono">{b.id}</span>
            {b.titleBangla && <span className="ml-1.5">{b.titleBangla}</span>}
          </p>
        </div>
      ),
    },
    {
      key: "author",
      label: "Author",
      className: "max-w-[170px]",
      render: (b) => (
        <div className="min-w-0">
          <p className="text-muted-foreground truncate">{b.author || "—"}</p>
          {b.authorBangla && <p className="text-[11px] text-muted-foreground/80 truncate">{b.authorBangla}</p>}
        </div>
      ),
    },
    { key: "category", label: "Category", className: "text-muted-foreground max-w-[120px] truncate", render: (b) => b.category || "—" },
    { key: "condition", label: "Condition", className: "text-muted-foreground max-w-[90px] truncate", render: (b) => b.condition || "—" },
    { key: "total", label: "Total", className: "text-center font-mono text-[12px]", headerClassName: "text-center", render: (b) => b.totalCopies },
    { key: "issued", label: "Issued", className: "text-center font-mono text-[12px]", headerClassName: "text-center", render: (b) => b.issuedCopies },
    { key: "reserved", label: "Reserved", className: "text-center font-mono text-[12px]", headerClassName: "text-center", render: (b) => b.reservedCopies },
    {
      key: "available",
      label: "Available",
      className: "text-center font-mono text-[12px]",
      headerClassName: "text-center",
      render: (b) => (
        <span className={cn(isLowStock(b) && "text-warning font-semibold")}>
          {b.availableCopies}
          {isLowStock(b) && <AlertTriangle className="inline h-3 w-3 ml-1 -mt-0.5" />}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      className: "text-right font-mono text-[12px] whitespace-nowrap",
      headerClassName: "text-right",
      render: (b) => (b.price === null ? <span className="text-muted-foreground">—</span> : formatTaka(b.price)),
    },
    {
      key: "status",
      label: "Status",
      render: (b) => (
        <div className="flex flex-wrap gap-1">
          {b.archivedAt ? (
            <StatusBadge variant="muted">Archived</StatusBadge>
          ) : (
            <StatusBadge variant={STATUS_VARIANT[deriveStatus(b)]}>{deriveStatus(b)}</StatusBadge>
          )}
          {!b.isCirculating && <StatusBadge variant="accent">Reading room</StatusBadge>}
        </div>
      ),
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (b: Book) => (
              <RowActions
                primary={[
                  { label: "View", icon: Eye, onClick: () => setSelectedBook(b) },
                  { label: "Edit", icon: Pencil, onClick: () => setEditBook(b) },
                ]}
                secondary={[
                  { label: "Adjust Stock", icon: Package, onClick: () => setStockBook(b), disabled: !!b.archivedAt },
                  b.archivedAt
                    ? { label: "Restore", icon: ArchiveRestore, onClick: () => setArchiveTarget(b) }
                    : {
                        label: "Archive",
                        icon: Archive,
                        onClick: () => setArchiveTarget(b),
                        variant: "destructive" as const,
                        disabled: b.issuedCopies > 0 || b.reservedCopies > 0,
                      },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Inventory"
        subtitle={!statsLoaded ? "Counting copies…" : `${stats.titles.toLocaleString()} titles · ${stats.totalCopies.toLocaleString()} copies · ${stats.issued} issued · ${stats.reserved} reserved`}
        actions={
          <>
            <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8" onClick={exportBooks} disabled={exporting}>
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export
            </Button>
            {canWrite && (
              <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowAddBook(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Book
              </Button>
            )}
          </>
        }
      />

      {stats.lowStock > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded border border-warning/30 bg-warning/5 text-[12px] text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{stats.lowStock} title{stats.lowStock > 1 ? "s" : ""} running low (copies on loan, ≤ 2 left on the shelf)</span>
        </div>
      )}

      <p className="text-[12px] text-muted-foreground">
        Copy counts are kept by the system: lending changes Issued and Reserved, Adjust Stock changes Total.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search title or author (English / বাংলা), ISBN, ID…"
          className="flex-1 min-w-[220px] max-w-sm"
        />

        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-[160px] h-8 text-[12px]" aria-label="Genre">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {["All", ...facets.genres].map((g) => (
              <SelectItem key={g} value={g} className="text-[12px]">{g === "All" ? "All genres" : g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-8 text-[12px]" aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {["All", ...facets.categories].map((c) => (
              <SelectItem key={c} value={c} className="text-[12px]">{c === "All" ? "All categories" : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FilterChips
          options={["All", ...(facets.languages.length ? facets.languages : ["Bangla", "English"])]}
          value={languageFilter}
          onChange={setLanguageFilter}
        />
        <FilterChips
          options={[...STATUSES]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          className="ml-auto"
        />
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {(Object.keys(FLAG_LABELS) as InventoryFlag[]).map((f) => {
          const count =
            f === "missing-price" ? stats.missingPrice
            : f === "missing-cover" ? stats.missingCover
            : f === "non-circulating" ? stats.nonCirculating
            : stats.archived;
          const on = flags.includes(f);
          return (
            <button
              key={f}
              onClick={() => toggleFlag(f)}
              aria-pressed={on}
              className={cn(
                "px-2.5 py-1 rounded text-[12px] font-medium transition-colors",
                on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {FLAG_LABELS[f]} {statsLoaded && <span className="opacity-70 font-mono">{count}</span>}
            </button>
          );
        })}
        {hasFilters && (
          <button onClick={resetFilters} className="ml-1 text-[12px] text-muted-foreground hover:text-foreground underline">
            Reset
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          {total === 0
            ? "No books"
            : `Showing ${((page - 1) * PAGE_SIZE + 1).toLocaleString()}–${Math.min(page * PAGE_SIZE, total).toLocaleString()} of ${total.toLocaleString()} books`}
        </span>
        <Pager page={page} pageCount={pageCount} onPage={setPage} />
      </div>

      {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

      <DataTable
        columns={columns}
        data={books}
        keyExtractor={(b) => b.id}
        onRowClick={(book) => setSelectedBook(book)}
        emptyMessage={loading ? "Loading…" : "No books match your filters."}
        compact
        className={cn(loading && "opacity-60 transition-opacity")}
      />

      <div className="flex justify-end">
        <Pager page={page} pageCount={pageCount} onPage={setPage} />
      </div>

      <BookDetailDrawer
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onUploadCover={canWrite ? setCover : undefined}
      />

      <AdjustStockDialog
        book={stockBook}
        open={!!stockBook}
        onClose={() => setStockBook(null)}
        onConfirm={handleAdjustStock}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(o) => !o && setArchiveTarget(null)}
        title={archiveTarget?.archivedAt ? "Restore Book" : "Archive Book"}
        description={
          archiveTarget?.archivedAt
            ? `Restore "${archiveTarget?.title}" to the catalogue?`
            : `Archive "${archiveTarget?.title}"? It disappears from the catalogue and the website but keeps its lending history. You can restore it from the Archived filter.`
        }
        confirmLabel={archiveTarget?.archivedAt ? "Restore" : "Archive"}
        variant={archiveTarget?.archivedAt ? "default" : "destructive"}
        onConfirm={handleArchive}
      />

      <AddBookDialog open={showAddBook} onClose={() => setShowAddBook(false)} onAdd={handleAddBook} />

      <EditBookDialog
        book={editBook}
        open={!!editBook}
        onClose={() => setEditBook(null)}
        onSave={handleEditSave}
        onUploadCover={setCover}
      />
    </div>
  );
}

function Pager({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (p: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="text-[12px] text-muted-foreground px-1.5 tabular-nums">
        Page {page} of {pageCount}
      </span>
      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label="Next page">
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
