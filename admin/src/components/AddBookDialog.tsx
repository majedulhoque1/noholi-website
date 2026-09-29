import { useEffect, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { compressCover } from "@/components/inventory/compress-cover";
import type { NewBookInput } from "@/hooks/use-inventory";
import type { Outcome } from "@/hooks/use-inventory";

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (book: NewBookInput, cover: Blob | null) => Promise<Outcome<string>>;
}

const INITIAL: NewBookInput = {
  title: "",
  titleBangla: "",
  author: "",
  authorBangla: "",
  genre: "",
  category: "",
  language: "Bangla",
  isbn: "",
  publisher: "",
  yearOfPublication: "",
  edition: "",
  condition: "New",
  pages: 0,
  price: null,
  totalCopies: 1,
  location: "",
  isCirculating: true,
};

export function AddBookDialog({ open, onClose, onAdd }: AddBookDialogProps) {
  const [form, setForm] = useState<NewBookInput>(INITIAL);
  const [cover, setCover] = useState<Blob | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);

  const set = <K extends keyof NewBookInput>(key: K, val: NewBookInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCompressing(true);
    setError(null);
    try {
      const blob = await compressCover(file);
      setCover(blob);
      setCoverPreview(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this image.");
    } finally {
      setCompressing(false);
    }
  };

  const reset = () => {
    setForm(INITIAL);
    setCover(null);
    setCoverPreview(undefined);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author.trim()) return;
    setSaving(true);
    setError(null);
    const res = await onAdd(form, cover);
    setSaving(false);
    if (res.success) {
      reset();
      onClose();
    } else {
      setError(res.error);
    }
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="md:max-w-2xl md:max-h-[85vh] md:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Add New Book</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Cover upload */}
          <div className="flex items-start gap-4">
            <div
              className="h-28 w-20 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer border border-dashed border-border hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {compressing ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : coverPreview ? (
                <img src={coverPreview} alt="Cover" className="h-full w-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Cover</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground">Resized to 800px and saved as WebP before upload.</p>
              {coverPreview && (
                <Button variant="ghost" size="sm" className="text-[12px] h-7" onClick={() => { setCover(null); setCoverPreview(undefined); }}>
                  <X className="h-3 w-3 mr-1" /> Remove
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Title (English) *" value={form.title} onChange={(v) => set("title", v)} placeholder="Book title" />
            <Field label="Title (Bangla)" value={form.titleBangla} onChange={(v) => set("titleBangla", v)} placeholder="বইয়ের শিরোনাম" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Author (English) *" value={form.author} onChange={(v) => set("author", v)} placeholder="Author name" />
            <Field label="Author (Bangla)" value={form.authorBangla} onChange={(v) => set("authorBangla", v)} placeholder="লেখকের নাম" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Genre" value={form.genre} onChange={(v) => set("genre", v)} placeholder="e.g. Fiction" />
            <Field label="Category" value={form.category} onChange={(v) => set("category", v)} placeholder="e.g. General" />
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
            <Field label="Publisher" value={form.publisher} onChange={(v) => set("publisher", v)} />
            <Field label="Year" value={form.yearOfPublication} onChange={(v) => set("yearOfPublication", v)} />
            <Field label="Edition" value={form.edition} onChange={(v) => set("edition", v)} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger className="h-11 text-base md:h-8 md:text-[12px]" aria-label="Condition"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["New", "Good", "Fair", "Poor"].map((c) => (
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
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Total Copies</label>
              <Input type="number" min={0} value={form.totalCopies} onChange={(e) => set("totalCopies", Math.max(0, Number(e.target.value)))} className="h-11 text-base md:h-8 md:text-[13px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:items-end">
            <Field label="Shelf Location" value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. Shelf A-3" />
            <label className="flex items-center gap-2 h-11 md:h-8 text-[12px] text-muted-foreground cursor-pointer">
              <Switch checked={!form.isCirculating} onCheckedChange={(v) => set("isCirculating", !v)} />
              Reading room only (cannot be borrowed)
            </label>
          </div>

          {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px] h-11 md:h-8" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button
            size="sm"
            className="text-[13px] h-11 md:h-8 gap-1.5"
            onClick={handleSubmit}
            disabled={saving || compressing || !form.title.trim() || !form.author.trim()}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Adding…" : "Add Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 text-base md:h-8 md:text-[13px]" placeholder={placeholder} />
    </div>
  );
}
