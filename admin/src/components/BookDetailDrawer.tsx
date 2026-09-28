import { useRef, useState } from "react";
import { BookOpen, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { deriveStatus, type Book, type BookStatus } from "@/hooks/use-inventory";
import { compressCover } from "@/components/inventory/compress-cover";
import { formatDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";
import type { Outcome } from "@/hooks/use-inventory";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const STATUS_VARIANT: Record<BookStatus, BadgeVariant> = {
  Available: "success",
  Unavailable: "warning",
  "Out of Stock": "destructive",
};

interface BookDetailDrawerProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  /** Omit to hide the upload button (read-only roles). */
  onUploadCover?: (bookId: string, cover: Blob) => Promise<Outcome<string>>;
}

export function BookDetailDrawer({ book, open, onClose, onUploadCover }: BookDetailDrawerProps) {
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localCover, setLocalCover] = useState<{ id: string; url: string } | null>(null);
  if (!book) return null;

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadCover) return;
    setUploading(true);
    try {
      const blob = await compressCover(file);
      const res = await onUploadCover(book.id, blob);
      if (res.success) {
        setLocalCover({ id: book.id, url: URL.createObjectURL(blob) });
        toast.success("Cover saved");
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read this image.");
    } finally {
      setUploading(false);
    }
  };

  const status = deriveStatus(book);
  const cover = localCover?.id === book.id ? localCover.url : book.coverUrl;

  const rows: [string, string][] = [
    ["Book ID", book.id],
    ...(book.titleBangla ? [["Title (Bangla)", book.titleBangla] as [string, string]] : []),
    ["Author", book.author || "—"],
    ...(book.authorBangla ? [["Author (Bangla)", book.authorBangla] as [string, string]] : []),
    ["Genre", book.genre || "—"],
    ["Category", book.category || "—"],
    ["Language", book.language || "—"],
    ["ISBN", book.isbn || "—"],
    ["Publisher", book.publisher || "—"],
    ["Year", book.yearOfPublication || "—"],
    ["Edition", book.edition || "—"],
    ["Condition", book.condition || "—"],
    ["Pages", book.pages > 0 ? String(book.pages) : "—"],
    ["Price", book.price === null ? "—" : formatTaka(book.price)],
    ["Lending", book.isCirculating ? "Can be borrowed" : "Reading room only"],
    ["Location", book.location || "—"],
    ...(book.archivedAt ? [["Archived", formatDhaka(book.archivedAt)] as [string, string]] : []),
    ["Added", formatDhaka(book.createdAt)],
    ["Last Updated", formatDhaka(book.updatedAt)],
  ];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[360px] sm:w-[400px] flex flex-col overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-base">{book.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="flex items-center justify-center bg-secondary rounded h-48">
            {cover ? (
              <img src={cover} alt={book.title} className="h-full object-contain rounded" />
            ) : (
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            )}
          </div>
          {onUploadCover && (
            <>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-[13px]"
                onClick={() => coverRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading…" : cover ? "Replace Cover" : "Upload Cover"}
              </Button>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Status</span>
            <div className="flex gap-1">
              {book.archivedAt && <StatusBadge variant="muted">Archived</StatusBadge>}
              {!book.isCirculating && <StatusBadge variant="accent">Reading room</StatusBadge>}
              <StatusBadge variant={STATUS_VARIANT[status]}>{status}</StatusBadge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Total", value: book.totalCopies },
              { label: "Available", value: book.availableCopies },
              { label: "Issued", value: book.issuedCopies },
              { label: "Reserved", value: book.reservedCopies },
            ].map((item) => (
              <div key={item.label} className="bg-secondary rounded p-2">
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-[13px]">
            {rows.map(([label, val]) => (
              <div key={label} className="flex justify-between py-1 border-b border-border last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground text-right max-w-[200px] truncate">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
