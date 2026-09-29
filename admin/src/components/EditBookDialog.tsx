import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { compressCover } from "@/components/inventory/compress-cover";
import { deriveStatus, type Book, type BookMetadata } from "@/hooks/use-inventory";
import type { Outcome } from "@/hooks/use-inventory";

interface Props {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: BookMetadata) => Promise<Outcome>;
  onUploadCover: (bookId: string, cover: Blob) => Promise<Outcome<string>>;
}

function formFromBook(b: Book): BookMetadata {
  return {
    title: b.title,
    titleBangla: b.titleBangla,
    author: b.author,
    authorBangla: b.authorBangla,
    genre: b.genre,
    category: b.category,
    language: b.language || "Bangla",
    isbn: b.isbn,
    publisher: b.publisher,
    yearOfPublication: b.yearOfPublication,
    edition: b.edition,
    condition: b.condition,
    pages: b.pages,
    price: b.price,
    location: b.location,
    isCirculating: b.isCirculating,
  };
}

const CONDITIONS = ["New", "Good", "Fair", "Poor"];

export function EditBookDialog({ book, open, onClose, onSave, onUploadCover }: Props) {
  const [form, setForm] = useState<BookMetadata | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (book && open) {
      setForm(formFromBook(book));
      setPreview(book.coverUrl);
      setError(null);
    }
  }, [book, open]);

  if (!book || !form) return null;

  const set = <K extends keyof BookMetadata>(key: K, val: BookMetadata[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: val } : prev));

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await compressCover(file);
      const res = await onUploadCover(book.id, blob);
      if (res.success) setPreview(URL.createObjectURL(blob));
      else setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this image.");
    } finally {
      setUploading(false);
    }
  };

  const invalid = !form.title.trim() || !form.author.trim();

  const submit = async () => {
    if (invalid) {
      setError("Title and author are required");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSave({ ...form, pages: Math.max(0, form.pages) });
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error);
  };

  // Conditions imported from the catalogue may be free text; keep them selectable.
  const conditionOptions = form.condition && !CONDITIONS.includes(form.condition) ? [form.condition, ...CONDITIONS] : CONDITIONS;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="md:max-w-2xl md:max-h-[85vh] md:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Book</DialogTitle>
          <DialogDescription className="text-[13px]">{book.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Cover */}
          <div className="flex items-start gap-4">
            <div
              className="h-28 w-20 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer border border-dashed border-border hover:border-primary transition-colors"
              onClick={() => !uploading && fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : preview ? (
                <img src={preview} alt="Cover" className="h-full w-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Cover</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
            <div className="space-y-1 flex-1">
              <p className="text-[12px] font-medium text-muted-foreground">Cover image</p>
              <p className="text-[11px] text-muted-foreground">
                Click the cover to replace it. It is resized to 800px, saved as WebP and uploaded straight away.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Title (English) *" value={form.title} onChange={(v) => set("title", v)} />
            <Field label="Title (Bangla)" value={form.titleBangla} onChange={(v) => set("titleBangla", v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Author (English) *" value={form.author} onChange={(v) => set("author", v)} />
            <Field label="Author (Bangla)" value={form.authorBangla} onChange={(v) => set("authorBangla", v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Genre" value={form.genre} onChange={(v) => set("genre", v)} />
            <Field label="Category" value={form.category} onChange={(v) => set("category", v)} />
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Language</label>
              <Select value={form.language} onValueChange={(v) => set("language", v)}>
                <SelectTrigger className="h-11 text-base md:h-8 md:text-[12px]" aria-label="Language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangla" className="text-[12px]">Bangla</SelectItem>
                  <SelectItem value="English" className="text-[12px]">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="ISBN" value={form.isbn} onChange={(v) => set("isbn", v)} />
            <Field label="Publications" value={form.publisher} onChange={(v) => set("publisher", v)} />
            <Field label="Year" value={form.yearOfPublication} onChange={(v) => set("yearOfPublication", v)} />
            <Field label="Edition" value={form.edition} onChange={(v) => set("edition", v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <Select value={form.condition || undefined} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger className="h-11 text-base md:h-8 md:text-[12px]" aria-label="Condition"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((c) => (
                    <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Pages</label>
              <Input type="number" min={0} value={form.pages || ""} onChange={(e) => set("pages", Number(e.target.value))} className="h-11 text-base md:h-8 md:text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Price (৳)</label>
              <Input
                type="number"
                min={0}
                value={form.price ?? ""}
                placeholder="Unknown"
                onChange={(e) => set("price", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))}
                className="h-11 text-base md:h-8 md:text-[13px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:items-end">
            <Field label="Shelf Location" value={form.location} onChange={(v) => set("location", v)} />
            <label className="flex items-center gap-2 h-11 md:h-8 text-[12px] text-muted-foreground cursor-pointer">
              <Switch checked={!form.isCirculating} onCheckedChange={(v) => set("isCirculating", !v)} />
              Reading room only (cannot be borrowed)
            </label>
          </div>

          {/* System-derived, read-only */}
          <div className="rounded border border-border bg-secondary/40 p-3 space-y-2">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
              System-derived · read-only
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[13px]">
              {[
                ["Total", book.totalCopies],
                ["Available", book.availableCopies],
                ["Issued", book.issuedCopies],
                ["Reserved", book.reservedCopies],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="font-mono font-medium text-foreground">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[11px] text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{deriveStatus(book)}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Change the number of copies with Adjust Stock. Issued and reserved copies change only through lending.
            </p>
          </div>

          {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px] h-11 md:h-8" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" className="text-[13px] h-11 md:h-8 gap-1.5" onClick={submit} disabled={saving || uploading || invalid}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 text-base md:h-8 md:text-[13px]" />
    </div>
  );
}
