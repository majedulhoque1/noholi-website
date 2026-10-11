import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookMarked, Check, Library, Star, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookCover, Cover, StatusBadge, Stars } from "@/components/noholi";
import { SearchBox } from "@/components/search-box";
import { Chips, More, Opt, Req } from "@/components/form-bits";
import { IdentityUpload, Stepper, SummaryBlock, type DocState } from "@/components/verify";
import { audiobooks, getBook } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  BeforeYouSubmit,
  DocUpload,
  MethodChoice,
  fmtSize,
  guidance,
  type SubmitMethod,
  type UploadedDoc,
} from "@/components/doc-upload";
import { ComingSoonBanner, ComingSoonDialog } from "@/components/contribution-list";

const types = ["blog", "creative", "review"] as const;

export const Route = createFileRoute("/account/contribute")({
  validateSearch: z.object({ type: z.enum(types).optional(), book: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Submit writing — My Noholi" },
      {
        name: "description",
        content: "Submit a blog, creative writing or book review to Noholi's editors.",
      },
      { property: "og:title", content: "Submit writing — My Noholi" },
      {
        property: "og:description",
        content: "Submit a blog, creative writing or book review to Noholi's editors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contribute,
});

const label = { blog: "Blog", creative: "Creative Writing", review: "Book Review" } as const;
const tagsList = [
  "Thought-provoking",
  "Emotional",
  "Informative",
  "Inspiring",
  "Entertaining",
  "Challenging",
  "Easy to read",
  "Slow-paced",
  "Fast-paced",
];
const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function Err({ m }: { m?: string }) {
  return m ? <p className="text-xs text-destructive">{m}</p> : null;
}

// Writing submissions have no backend yet: the form stays explorable, but nothing is saved or sent,
// and "Submit" / "Save draft" only open the Coming soon dialog (never a success state).
function Contribute() {
  const [soon, setSoon] = useState(false);
  return (
    <>
      <ComingSoonBanner className="mb-8" />
      <ContributeForm onSoon={() => setSoon(true)} />
      <ComingSoonDialog open={soon} onOpenChange={setSoon} />
    </>
  );
}

function ContributeForm({ onSoon }: { onSoon: () => void }) {
  const { type = "blog", book: preBook } = Route.useSearch();
  const nav = useNavigate({ from: "/account/contribute" });
  const { t } = useApp();
  const { member } = useAuth();
  // shared
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [method, setMethod] = useState<SubmitMethod>("write");
  const [doc, setDoc] = useState<UploadedDoc | null>(null);
  const [excerpt, setExcerpt] = useState("");
  const [cover, setCover] = useState<DocState>(null);
  const [cat, setCat] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [display, setDisplay] = useState(member?.name ?? "");
  const [relatedBook, setRelatedBook] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState<string[]>(["Bangla"]);
  const [contentNote, setContentNote] = useState("");
  // review
  const [step, setStep] = useState(preBook ? 1 : 0);
  const [source, setSource] = useState<"catalog" | "personal" | null>(preBook ? "catalog" : null);
  const [itemId, setItemId] = useState<string | null>(preBook ?? null);
  const [pb, setPb] = useState({
    title: "",
    author: "",
    language: "",
    genre: "",
    publisher: "",
    year: "",
    edition: "",
    isbn: "",
    category: "",
    format: "Physical Book",
    narrator: "",
  });
  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState<string[]>([]);
  const [readDate, setReadDate] = useState("");
  const [rtags, setRtags] = useState<string[]>([]);
  const [tried, setTried] = useState(false);

  const book = itemId ? getBook(itemId) : undefined;
  const related = relatedBook ? getBook(relatedBook) : undefined;
  const audio = itemId ? audiobooks.find((a) => a.id === itemId) : undefined;
  const itemTitle = book?.titleEn ?? audio?.titleEn ?? pb.title;

  const errs: Partial<
    Record<
      | "source"
      | "item"
      | "pbTitle"
      | "pbAuthor"
      | "pbLang"
      | "pbGenre"
      | "rating"
      | "title"
      | "body"
      | "cat",
      string
    >
  > = {};
  if (type === "review") {
    if (step === 0 && !source) errs.source = "Choose where the book comes from.";
    if (step === 1 && source === "catalog" && !itemId) errs.item = "Search and choose the book.";
    if (step === 1 && source === "personal") {
      if (!pb.title.trim()) errs.pbTitle = "Enter the book title.";
      if (!pb.author.trim()) errs.pbAuthor = "Enter the author.";
      if (!pb.language) errs.pbLang = "Choose a language.";
      if (!pb.genre) errs.pbGenre = "Choose a genre.";
    }
    if (step === 2) {
      if (!rating) errs.rating = "Give a rating.";
      if (!title.trim()) errs.title = "Add a review title.";
      if (method === "write" && words(body) < 20)
        errs.body = "Write at least a few sentences (20+ words).";
      if (method === "upload" && (!doc || doc.progress < 100))
        errs.body = "Upload your document (DOC, DOCX or PDF).";
    }
  } else {
    if (!title.trim()) errs.title = "Add a title.";
    if (method === "write" && words(body) < 20)
      errs.body = "Write at least a few sentences (20+ words).";
    if (method === "upload" && (!doc || doc.progress < 100))
      errs.body = "Upload your document (DOC, DOCX or PDF).";
    if (type === "creative" && !cat.length) errs.cat = "Choose a writing type.";
  }
  const e = tried ? errs : {};
  const hasErr = Object.values(errs).some(Boolean);

  const finish = (draft: boolean) => {
    if (!draft) {
      setTried(true);
      if (hasErr) return;
    } else if (!title.trim() && !itemTitle) {
      setTried(true);
      return;
    }
    onSoon(); // coming soon: nothing is created or sent
  };
  const nextStep = () => {
    setTried(true);
    if (hasErr) return;
    setTried(false);
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const typeTabs = (
    <div className="mt-6 inline-flex border border-border p-0.5" role="tablist" aria-label="Type">
      {types.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={type === t}
          onClick={() => {
            nav({ search: { type: t } });
            setTried(false);
          }}
          className={cn(
            "h-9 px-4 text-sm",
            type === t
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label[t]}
        </button>
      ))}
    </div>
  );

  const writingArea = (lbl: string) => (
    <div className="space-y-6">
      <MethodChoice
        value={method}
        onChange={(m) => {
          setMethod(m);
          setTried(false);
        }}
      />
      {method === "write" ? (
        <div className="space-y-2">
          <Label htmlFor="b">
            {lbl}
            <Req />
          </Label>
          <Textarea
            id="b"
            rows={16}
            value={body}
            onChange={(x) => setBody(x.target.value)}
            placeholder="Start writing…"
            className={cn(
              "prose-reading min-h-[360px] border-0 border-y bg-transparent px-0 font-display text-xl leading-[1.75] shadow-none focus-visible:ring-0",
              type === "creative" && lang.includes("Bangla") && "font-bangla",
            )}
          />
          <div className="flex justify-between text-xs">
            <Err m={e.body} />
            <span className="ml-auto tabular-nums text-muted-foreground">
              {words(body)} words · ~{Math.max(1, Math.round(words(body) / 200))} min read
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <BeforeYouSubmit items={[...guidance[type]]} />
          <div className="space-y-2">
            <Label>
              Your document
              <Req />
            </Label>
            <DocUpload value={doc} onChange={setDoc} error={e.body} />
          </div>
          <p className="text-xs text-muted-foreground">
            Uploading doesn't submit anything yet — you can review everything before sending it to
            the editors.
          </p>
        </div>
      )}
    </div>
  );

  // ---------- BOOK REVIEW (multi-step) ----------
  if (type === "review") {
    const setP = (k: keyof typeof pb) => (x: React.ChangeEvent<HTMLInputElement>) =>
      setPb({ ...pb, [k]: x.target.value });
    return (
      <div className="max-w-3xl">
        <div className="eyebrow mb-3">Contribute</div>
        <h1 className="text-4xl md:text-5xl">Write a book review</h1>
        {typeTabs}
        <Stepper
          steps={["Source", "Book", "Your review", "Preview"]}
          current={step}
          className="mt-10"
        />
        <div className="mt-10 min-h-[300px]">
          {step === 0 && (
            <fieldset>
              <legend className="mb-5 font-display text-2xl">What would you like to review?</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    [
                      "catalog",
                      Library,
                      "From Noholi Stacks Catalog",
                      "A book, e-book or audio book in Noholi's library. Search and we'll fill in the details.",
                    ],
                    [
                      "personal",
                      BookMarked,
                      "From Personal Patron Collection",
                      "A book you own or read elsewhere that may not be in our catalog. You'll add its details.",
                    ],
                  ] as const
                ).map(([v, Icon, t, d]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={source === v}
                    onClick={() => setSource(v)}
                    className={cn(
                      "border p-6 text-left transition-colors",
                      source === v
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="mt-4 font-display text-xl">{t}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Err m={e.source} />
              </div>
            </fieldset>
          )}

          {step === 1 && source === "catalog" && (
            <div className="space-y-3">
              <Label>
                Find the book in Noholi's catalog
                <Req />
              </Label>
              {itemId && (book || audio) ? (
                <div className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-5 border border-foreground p-4">
                  {book ? (
                    <BookCover book={book} size="sm" />
                  ) : (
                    <Cover title={audio!.titleBn} author="" tone={audio!.tone} size="sm" />
                  )}
                  <div className="min-w-0">
                    <div className="font-display text-xl">{itemTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {book?.authorEn ?? audio?.authorEn}
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
                      {(book
                        ? [
                            ["Publication", `${book.publisher}, ${book.year}`],
                            ["Language", book.language],
                            ["Genre", book.genre],
                            ["ISBN", book.isbn],
                          ]
                        : [
                            ["Format", "Audio Book"],
                            ["Narrator", audio!.narrator],
                            ["Language", audio!.language],
                          ]
                      ).map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemId(null)}
                    aria-label="Change book"
                    className="h-fit p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <SearchBox
                  groups={["Books", "Noholi Books", "E-Books", "Audio Books"]}
                  placeholder="Search by title, author, ISBN or publisher…"
                  onPick={(it) => setItemId(it.bookId ?? it.audioId ?? null)}
                  autoFocus
                />
              )}
              <Err m={e.item} />
              <p className="text-xs text-muted-foreground">
                Not in the catalog?{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => {
                    setSource("personal");
                    setItemId(null);
                  }}
                >
                  Review it from your personal collection
                </button>
                .
              </p>
            </div>
          )}

          {step === 1 && source === "personal" && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Format
                  <Req />
                </legend>
                <Chips
                  options={["Physical Book", "E-Book", "Audio Book"]}
                  value={[pb.format]}
                  onChange={(v) => setPb({ ...pb, format: v[0]! })}
                />
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pt">
                    Book title
                    <Req />
                  </Label>
                  <Input id="pt" value={pb.title} onChange={setP("title")} className="h-11" />
                  <Err m={e.pbTitle} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pa">
                    Author
                    <Req />
                  </Label>
                  <Input id="pa" value={pb.author} onChange={setP("author")} className="h-11" />
                  <Err m={e.pbAuthor} />
                </div>
                {pb.format === "Audio Book" && (
                  <div className="space-y-2">
                    <Label htmlFor="pn">
                      Narrator
                      <Opt />
                    </Label>
                    <Input
                      id="pn"
                      value={pb.narrator}
                      onChange={setP("narrator")}
                      className="h-11"
                    />
                  </div>
                )}
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    Language
                    <Req />
                  </legend>
                  <Chips
                    options={["Bangla", "English", "Other"]}
                    value={[pb.language]}
                    onChange={(v) => setPb({ ...pb, language: v[0]! })}
                  />
                  <Err m={e.pbLang} />
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    Genre
                    <Req />
                  </legend>
                  <Chips
                    options={["Fiction", "Non-fiction"]}
                    value={[pb.genre]}
                    onChange={(v) => setPb({ ...pb, genre: v[0]! })}
                  />
                  <Err m={e.pbGenre} />
                </fieldset>
              </div>
              <More label="Add more book details (optional)">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pp">
                      Publisher
                      <Opt />
                    </Label>
                    <Input
                      id="pp"
                      value={pb.publisher}
                      onChange={setP("publisher")}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="py">
                      Publication year
                      <Opt />
                    </Label>
                    <Input
                      id="py"
                      inputMode="numeric"
                      value={pb.year}
                      onChange={setP("year")}
                      className="h-11"
                    />
                  </div>
                  {pb.format === "Physical Book" && (
                    <div className="space-y-2">
                      <Label htmlFor="pe">
                        Edition
                        <Opt />
                      </Label>
                      <Input
                        id="pe"
                        value={pb.edition}
                        onChange={setP("edition")}
                        className="h-11"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="pi">
                      ISBN
                      <Opt />
                    </Label>
                    <Input
                      id="pi"
                      value={pb.isbn}
                      onChange={setP("isbn")}
                      className="h-11 font-mono"
                    />
                  </div>
                  <fieldset className="space-y-2 sm:col-span-2">
                    <legend className="text-sm font-medium">
                      Category
                      <Opt />
                    </legend>
                    <Chips
                      options={["Adults", "Children", "General"]}
                      value={[pb.category]}
                      onChange={(v) => setPb({ ...pb, category: v[0]! })}
                    />
                  </fieldset>
                  <div className="max-w-[200px]">
                    <fieldset disabled aria-label={t("forms.soon.upload")} className="opacity-60">
                      <IdentityUpload
                        kind="photo"
                        label="Book cover"
                        value={cover}
                        onChange={setCover}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">{t("forms.soon.upload")}</p>
                    </fieldset>
                  </div>
                </div>
              </More>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <div className="text-sm text-muted-foreground">
                Reviewing{" "}
                <span className="font-display text-base text-foreground">{itemTitle}</span>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Your rating
                  <Req />
                </legend>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`${n} of 5`}
                      aria-pressed={rating >= n}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7",
                          rating >= n ? "fill-foreground text-foreground" : "text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-muted-foreground">
                    {
                      [
                        "",
                        "Didn't work for me",
                        "Had its moments",
                        "Worth reading",
                        "Very good",
                        "Unforgettable",
                      ][rating]
                    }
                  </span>
                </div>
                <Err m={e.rating} />
              </fieldset>
              <div className="space-y-2">
                <Label htmlFor="t">
                  Review title
                  <Req />
                </Label>
                <Input
                  id="t"
                  value={title}
                  onChange={(x) => setTitle(x.target.value)}
                  placeholder="One line that sums it up"
                  className="h-12 font-display text-lg"
                />
                <Err m={e.title} />
              </div>
              {writingArea("Your review")}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rd">
                    {audio || pb.format === "Audio Book" ? "Listening date" : "Reading date"}
                    <Opt />
                  </Label>
                  <Input
                    id="rd"
                    type="date"
                    value={readDate}
                    onChange={(x) => setReadDate(x.target.value)}
                    className="h-11"
                  />
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    Would you recommend it?
                    <Opt />
                  </legend>
                  <Chips options={["Yes", "No"]} value={recommend} onChange={setRecommend} />
                </fieldset>
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  How did it feel to read?
                  <Opt />
                </legend>
                <Chips multi options={tagsList} value={rtags} onChange={setRtags} />
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div>
              <SummaryBlock title="Book" onEdit={() => setStep(1)}>
                <div className="flex items-center gap-4">
                  {book ? (
                    <BookCover book={book} size="sm" className="w-12" />
                  ) : audio ? (
                    <Cover
                      title={audio.titleBn}
                      author=""
                      tone={audio.tone}
                      size="sm"
                      className="w-12"
                    />
                  ) : null}
                  <div>
                    <div className="font-display text-xl">{itemTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {book?.authorEn ?? audio?.authorEn ?? pb.author} ·{" "}
                      {source === "catalog"
                        ? "Noholi Stacks Catalog"
                        : `Personal collection · ${pb.format}`}
                    </div>
                  </div>
                </div>
              </SummaryBlock>
              <SummaryBlock title="Your review" onEdit={() => setStep(2)}>
                <Stars n={rating} />
                <h3 className="mt-2 font-display text-3xl">{title}</h3>
                <div className="mt-1 text-sm text-muted-foreground">
                  by {display || member?.name || ""}
                  {readDate && ` · read ${readDate}`}
                  {recommend[0] &&
                    ` · ${recommend[0] === "Yes" ? "Recommends" : "Doesn't recommend"}`}
                </div>
                {method === "upload" && doc ? (
                  <p className="mt-4 text-sm">
                    Attached document: <span className="font-medium">{doc.name}</span>{" "}
                    <span className="text-muted-foreground">
                      ({doc.ext} · {fmtSize(doc.size)})
                    </span>{" "}
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="ml-2 underline underline-offset-4"
                    >
                      Replace
                    </button>
                  </p>
                ) : (
                  <p className="mt-4 whitespace-pre-line font-display text-lg leading-relaxed">
                    {body}
                  </p>
                )}
                {rtags.length > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">{rtags.join(" · ")}</div>
                )}
              </SummaryBlock>
              <p className="border-t border-border pt-5 text-sm text-muted-foreground">
                After you submit, your review is marked{" "}
                <strong className="text-foreground">Pending Review</strong>. An editor reads it
                before it appears on the book's page.
              </p>
            </div>
          )}
        </div>
        {tried && hasErr && (
          <p className="mt-6 text-sm text-destructive" role="alert">
            Please complete the highlighted fields — everything you've written is kept.
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setTried(false);
              setStep(Math.max(0, step - 1));
            }}
            disabled={step === 0}
          >
            Back
          </Button>
          <div className="ml-auto flex gap-3">
            {step >= 1 && (
              <Button variant="outline" onClick={() => finish(true)}>
                Save draft
              </Button>
            )}
            {step < 3 ? (
              <Button size="lg" onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button size="lg" variant="accent" onClick={() => finish(false)}>
                Submit review
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- BLOG / CREATIVE ----------
  return (
    <div className="max-w-3xl">
      <div className="eyebrow mb-3">Contribute</div>
      <h1 className="text-4xl md:text-5xl">
        Submit {type === "creative" ? "creative writing" : "a blog"}
      </h1>
      {typeTabs}
      <p className="mt-4 text-sm text-muted-foreground">
        Submissions are reviewed by Noholi's editors before publication. Only the title and your
        writing are required.
      </p>

      <div className="mt-10 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="t">
            {type === "blog" ? "Blog title" : "Title"}
            <Req />
          </Label>
          <Input
            id="t"
            value={title}
            onChange={(x) => setTitle(x.target.value)}
            className="h-14 border-0 border-b bg-transparent px-0 font-display text-3xl shadow-none focus-visible:ring-0"
            placeholder="Untitled"
          />
          <Err m={e.title} />
        </div>
        {type === "creative" && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Writing type
              <Req />
            </legend>
            <Chips
              options={[
                "Short Story",
                "Poetry",
                "Essay",
                "Personal Reflection",
                "Fiction",
                "Non-fiction",
                "Other",
              ]}
              value={cat}
              onChange={setCat}
            />
            <Err m={e.cat} />
          </fieldset>
        )}
        {type === "creative" && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Language
              <Opt />
            </legend>
            <Chips options={["Bangla", "English"]} value={lang} onChange={setLang} />
          </fieldset>
        )}
        {writingArea("Your writing")}
        <div className="space-y-2">
          <Label htmlFor="ex">
            Short excerpt
            <Opt />
          </Label>
          <Textarea
            id="ex"
            rows={2}
            value={excerpt}
            onChange={(x) => setExcerpt(x.target.value)}
            placeholder="One or two lines shown in listings. We'll use your opening if left empty."
          />
        </div>

        <More
          label={
            type === "blog"
              ? "Add category, cover, tags and more (optional)"
              : "Add cover, tags and a content note (optional)"
          }
        >
          <div className="space-y-6">
            {type === "blog" && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  Category
                  <Opt />
                </legend>
                <Chips
                  options={[
                    "Literature",
                    "Reading",
                    "Books",
                    "Culture",
                    "Library",
                    "Education",
                    "Community",
                    "Other",
                  ]}
                  value={cat}
                  onChange={setCat}
                />
              </fieldset>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tags">
                  Tags
                  <Opt />
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(x) => setTags(x.target.value)}
                  placeholder="Comma separated, e.g. monsoon, dhaka"
                  className="h-11"
                />
              </div>
              {type === "blog" && (
                <div className="space-y-2">
                  <Label htmlFor="dn">
                    Author display name
                    <Opt />
                  </Label>
                  <Input
                    id="dn"
                    value={display}
                    onChange={(x) => setDisplay(x.target.value)}
                    className="h-11"
                  />
                </div>
              )}
              {type === "blog" && (
                <div className="space-y-2">
                  <Label htmlFor="tp">
                    Related topic
                    <Opt />
                  </Label>
                  <Input
                    id="tp"
                    value={topic}
                    onChange={(x) => setTopic(x.target.value)}
                    placeholder="e.g. Bangla translation"
                    className="h-11"
                  />
                </div>
              )}
              {type === "creative" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cn">
                    Content note
                    <Opt />
                  </Label>
                  <Input
                    id="cn"
                    value={contentNote}
                    onChange={(x) => setContentNote(x.target.value)}
                    placeholder="e.g. mentions of grief or illness"
                    className="h-11"
                  />
                </div>
              )}
            </div>
            {type === "blog" && (
              <div className="space-y-2">
                <Label>
                  Related book
                  <Opt />
                </Label>
                {related ? (
                  <div className="flex items-center justify-between border border-border px-4 py-3 text-sm">
                    <span className="font-display text-lg">{related.titleEn}</span>
                    <button
                      type="button"
                      onClick={() => setRelatedBook(null)}
                      aria-label="Remove related book"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <SearchBox
                    groups={["Books", "Noholi Books", "E-Books"]}
                    placeholder="Link a book from the catalog…"
                    onPick={(it) => it.bookId && setRelatedBook(it.bookId)}
                  />
                )}
              </div>
            )}
            <div className="max-w-md">
              <fieldset disabled aria-label={t("forms.soon.upload")} className="opacity-60">
                <IdentityUpload
                  kind="nid"
                  label="Cover image"
                  hint="Landscape images work best."
                  value={cover}
                  onChange={setCover}
                />
                <p className="mt-2 text-xs text-muted-foreground">{t("forms.soon.upload")}</p>
              </fieldset>
            </div>
          </div>
        </More>
      </div>
      {tried && hasErr && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          Please complete the highlighted fields — everything you've written is kept.
        </p>
      )}
      <div className="sticky bottom-0 mt-10 flex flex-wrap justify-end gap-3 border-t border-border bg-background py-4">
        <Button variant="ghost" onClick={() => finish(true)}>
          Save draft
        </Button>
        <Button size="lg" variant="accent" onClick={() => finish(false)}>
          Submit for review
        </Button>
      </div>
    </div>
  );
}
