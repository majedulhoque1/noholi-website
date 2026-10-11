import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Initials } from "@/components/noholi";
import { BookThumb, ErrorState, maskNid, ToneBadge } from "@/components/record-view";
import { Stepper, SummaryBlock } from "@/components/verify";
import { useAuth, type MemberRow } from "@/lib/auth";
import { addDaysISO, formatDhaka, pickupWindow } from "@/lib/dhaka-date";
import {
  bookAuthorOf,
  bookTitleOf,
  errorCode,
  fetchBook,
  last4,
  publicSettings,
  requestStatusView,
  submitBorrowRequest,
  useFmt,
  useLoad,
  type BookLite,
  type PublicSettings,
  type RequestRow,
} from "@/lib/lending";
import { useApp } from "@/lib/store";
import { describeError } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/borrow/$id")({
  head: () => ({
    meta: [
      { title: "Borrow request — Noholi Library" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Review your borrowing request for a book from Noholi Library.",
      },
      { property: "og:title", content: "Borrow request — Noholi Library" },
      {
        property: "og:description",
        content: "Review your borrowing request for a book from Noholi Library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Borrow,
});

function Field({
  id,
  label,
  children,
  err,
}: {
  id: string;
  label: string;
  children: ReactNode;
  err?: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

type Guarantor = {
  name: string;
  relation: string;
  phone: string;
  email: string;
  nid: string;
  street: string;
  city: string;
  district: string;
  postal: string;
};

function BorrowSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-8 w-full" />
      <div className="grid gap-8 pt-6 sm:grid-cols-[160px_minmax(0,1fr)]">
        <Skeleton className="aspect-[2/3] w-32 sm:w-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function Borrow() {
  const { id } = Route.useParams();
  const { t } = useApp();
  const { ready, member, memberError } = useAuth();
  const book = useLoad(() => fetchBook(id), [id]);
  const settings = useLoad(publicSettings, []);
  const retry = () => {
    book.reload();
    settings.reload();
  };

  const loadErr = book.error ?? settings.error ?? (ready && !member ? memberError : null);
  if (loadErr)
    return (
      <div className="mx-auto max-w-lg py-10">
        <ErrorState
          title={t("lending.loadError")}
          message={loadErr}
          retryLabel={t("lending.retry")}
          onRetry={retry}
        />
      </div>
    );
  if (!ready || book.loading || settings.loading || !member || !settings.data)
    return <BorrowSkeleton />;

  if (!book.data)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-4xl">{t("lending.notFoundTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("lending.borrow.bookNotFound")}</p>
        <Button className="mt-8" variant="outline" asChild>
          <Link to="/library/books">{t("lending.browseBooks")}</Link>
        </Button>
      </div>
    );

  return <BorrowFlow book={book.data} settings={settings.data} member={member} />;
}

function BorrowFlow({
  book,
  settings,
  member,
}: {
  book: BookLite;
  settings: PublicSettings;
  member: MemberRow;
}) {
  const { t, lang } = useApp();
  const { refreshMember } = useAuth();
  const fmt = useFmt();
  const title = bookTitleOf(book, lang);
  const author = bookAuthorOf(book, lang);

  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<RequestRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitting = useRef(false); // double-submit guard, set before the state update lands

  const win = pickupWindow(settings);
  const [pickup, setPickup] = useState(win.open[0] ?? "");
  const [nid, setNid] = useState(str(member["nid"]));
  const [g, setG] = useState<Guarantor>({
    name: str(member["default_guarantor_name"]),
    relation: str(member["default_guarantor_relationship"]),
    phone: str(member["default_guarantor_phone"]),
    email: "",
    nid: str(member["default_guarantor_nid"]),
    street: str(member["default_guarantor_street"]),
    city: str(member["default_guarantor_city"]),
    district: str(member["default_guarantor_district"]),
    postal: str(member["default_guarantor_postal_code"]),
  });
  const [agree, setAgree] = useState(false);
  const [note, setNote] = useState("");

  if (!book.is_circulating)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-4xl">{t("lending.borrow.readingRoomTitle")}</h1>
        <p className="mt-3 break-words text-muted-foreground">
          {t("lending.borrow.readingRoomBody", { title })}
        </p>
        <Button className="mt-8" variant="outline" asChild>
          <Link to="/book/$id" params={{ id: book.id }}>
            {t("lending.backToBook")}
          </Link>
        </Button>
      </div>
    );

  if (book.available_copies <= 0 && !done)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-4xl">{t("lending.borrow.unavailableTitle")}</h1>
        <p className="mt-3 break-words text-muted-foreground">
          {t("lending.borrow.unavailableBody", { title })}
        </p>
        <Button className="mt-8" variant="outline" asChild>
          <Link to="/book/$id" params={{ id: book.id }}>
            {t("lending.backToBook")}
          </Link>
        </Button>
      </div>
    );

  const steps = [
    t("lending.borrow.stepBook"),
    t("lending.borrow.stepYou"),
    t("lending.borrow.stepGuarantor"),
    t("lending.borrow.stepPickup"),
    t("lending.borrow.stepReview"),
  ];
  const titles = [
    t("lending.borrow.titleBook"),
    t("lending.borrow.titleYou"),
    t("lending.borrow.titleGuarantor"),
    t("lending.borrow.titlePickup"),
    t("lending.borrow.titleReview"),
  ];

  const errors: Partial<
    Record<
      | "nid"
      | "name"
      | "relation"
      | "phone"
      | "gnid"
      | "street"
      | "city"
      | "district"
      | "agree"
      | "pickup",
      string
    >
  > = {};
  if (step === 1 && !nid.trim()) errors.nid = t("lending.borrow.nidErr");
  if (step === 2) {
    if (!g.name.trim()) errors.name = t("lending.borrow.gNameErr");
    if (!g.relation.trim()) errors.relation = t("lending.borrow.gRelationErr");
    if (g.phone.replace(/\D/g, "").length < 10) errors.phone = t("lending.borrow.gPhoneErr");
    if (!g.nid.trim()) errors.gnid = t("lending.borrow.gNidErr");
    if (!g.street.trim()) errors.street = t("lending.borrow.gStreetErr");
    if (!g.city.trim()) errors.city = t("lending.borrow.gCityErr");
    if (!g.district.trim()) errors.district = t("lending.borrow.gDistrictErr");
    if (!agree) errors.agree = t("lending.borrow.consentErr");
  }
  if (step === 3 && !win.open.includes(pickup)) errors.pickup = t("lending.borrow.pickupErr");
  const e = tried ? errors : {};

  const submit = async () => {
    if (submitting.current || done) return;
    submitting.current = true;
    setBusy(true);
    setSubmitError(null);
    try {
      const req = await submitBorrowRequest({
        bookId: book.id,
        pickupDate: pickup,
        memberNid: nid,
        note: note.trim(),
        guarantor: {
          name: g.name,
          relationship: g.relation,
          phone: g.phone,
          email: g.email,
          nid: g.nid,
          street: g.street,
          city: g.city,
          district: g.district,
          postalCode: g.postal,
        },
      });
      setDone(req);
      window.scrollTo(0, 0);
      void refreshMember(); // counts on the dashboard
    } catch (err) {
      console.error(err);
      setSubmitError(describeError(err));
      if (errorCode(err) === "NH011") setStep(3); // pickup date no longer allowed
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const next = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    setTried(false);
    if (step === 4) {
      void submit();
      return;
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };
  const back = () => {
    setTried(false);
    setSubmitError(null);
    setStep(Math.max(0, step - 1));
  };

  const closedNames = win.closed
    .map((d) =>
      new Intl.DateTimeFormat(fmt.locale, { weekday: "long", timeZone: "UTC" }).format(
        new Date(Date.UTC(2023, 0, 1 + d)),
      ),
    )
    .join(", ");
  // expires_at = pickup date + hold_grace_days (CONTRACT section 2, borrow_requests)
  const holdUntil = pickup ? addDaysISO(pickup, settings.hold_grace_days) : "";

  if (done) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-success text-background">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="mt-8 text-5xl leading-tight">{t("lending.borrow.successTitle")}</h1>
        <p className="mt-3 break-words text-muted-foreground">
          {t("lending.borrow.successBody", {
            title: done.book_title,
            date: fmt.date(done.expires_at),
          })}
        </p>
        <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
          {(
            [
              [t("lending.borrow.requestId"), <span className="font-mono">{done.id}</span>],
              [
                t("lending.borrow.statusRow"),
                <ToneBadge
                  label={t(requestStatusView(done.status).key)}
                  tone={requestStatusView(done.status).tone}
                />,
              ],
              [t("lending.borrow.bookRow"), done.book_title],
              [t("lending.borrow.pickupRow"), fmt.dateLong(done.pickup_date)],
              [t("lending.borrow.collectBy"), <strong>{fmt.dateLong(done.expires_at)}</strong>],
              [
                t("lending.borrow.nextStep"),
                t("lending.borrow.nextBody", {
                  date: fmt.date(done.expires_at),
                  days: settings.loan_days,
                }),
              ],
            ] as [string, ReactNode][]
          ).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 py-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0 break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/account/requests">{t("lending.borrow.viewRequests")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/library/books">{t("lending.borrow.keepBrowsing")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const policy = (
    <div className="space-y-3 border-y border-foreground py-4 text-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
        <div className="font-medium">{t("lending.borrow.feeTitle")}</div>
        <div className="font-display text-3xl tabular-nums">৳0</div>
      </div>
      <p className="text-muted-foreground">
        {t("lending.borrow.fineNote", { amount: fmt.taka(settings.fine_per_day) })}
      </p>
      <p className="text-muted-foreground">
        {t("lending.borrow.limit", { max: settings.max_items })}
      </p>
      <p className="text-muted-foreground">
        {settings.renewals_allowed === 0
          ? t("lending.borrow.renewNone")
          : settings.renewals_allowed === 1
            ? t("lending.borrow.renewOnce", { days: settings.renewal_days })
            : t("lending.borrow.renewMany", {
                n: settings.renewals_allowed,
                days: settings.renewal_days,
              })}
      </p>
    </div>
  );

  const bookFacts = (
    [
      [t("lending.req.genre"), [book.genre, book.category].filter(Boolean).join(" · ")],
      [t("lending.req.language"), book.language],
      [
        t("lending.req.publication"),
        [book.publisher, book.year_of_publication].filter(Boolean).join(", "),
      ],
    ] as [string, string | null][]
  ).filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/book/$id"
        params={{ id: book.id }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("lending.backToBook")}
      </Link>
      <div className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <div className="eyebrow mb-2">
            {t("lending.borrow.eyebrow", { n: step + 1, total: 5 })}
          </div>
          <h1 className="text-4xl md:text-5xl">{titles[step]}</h1>
        </div>
        <div className="text-sm text-muted-foreground">{t("lending.free")}</div>
      </div>
      <Stepper
        steps={steps}
        current={step}
        className="mt-8"
        ariaLabel={t("lending.borrow.progress")}
      />

      <div className="mt-10 min-h-[320px]">
        {step === 0 && (
          <div className="grid gap-8 sm:grid-cols-[160px_minmax(0,1fr)]">
            <BookThumb book={book} fallbackTitle={title} size="md" className="w-32 sm:w-full" />
            <div className="min-w-0">
              <h2 className="break-words font-display text-3xl">{title}</h2>
              {author && <div className="mt-1 break-words text-muted-foreground">{author}</div>}
              {bookFacts.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                  {bookFacts.map(([k, v]) => (
                    <div key={k} className="min-w-0">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {t("lending.copiesAvailable", {
                  n: book.available_copies,
                  total: book.total_copies,
                })}
              </p>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                {t("lending.borrow.holdNote")}
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="min-w-0">
              <div className="flex items-center gap-5 border-b border-border pb-6">
                <Initials name={member.name} className="h-20 w-20 text-3xl" />
                <div className="min-w-0">
                  <div className="break-words font-display text-2xl">{member.name}</div>
                  <div className="font-mono text-sm text-muted-foreground">{member.id}</div>
                </div>
              </div>
              <dl className="divide-y divide-border text-sm">
                {(
                  [
                    [t("lending.borrow.email"), member.email],
                    [t("lending.borrow.phone"), member.phone],
                    [
                      t("lending.borrow.address"),
                      [member.address_line, member.city, member.district, member.postal_code]
                        .filter(Boolean)
                        .join(", "),
                    ],
                  ] as [string, string | null][]
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 py-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="min-w-0 break-words">{v || t("lending.notOnRecord")}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("lending.borrow.detailsNote")}{" "}
                <Link to="/account/profile" className="underline underline-offset-2">
                  {t("lending.borrow.changeInProfile")}
                </Link>
              </p>
            </div>
            <div className="space-y-4">
              <Field id="nid" label={t("lending.borrow.nid")} err={e.nid}>
                <Input
                  id="nid"
                  value={nid}
                  onChange={(x) => setNid(x.target.value)}
                  autoComplete="off"
                  className="h-11 font-mono"
                />
              </Field>
              <p className="text-xs text-muted-foreground">{t("lending.borrow.nidHint")}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("lending.borrow.guarantorIntro")}
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="gn" label={t("lending.borrow.gName")} err={e.name}>
                <Input
                  id="gn"
                  value={g.name}
                  onChange={(x) => setG({ ...g, name: x.target.value })}
                  className="h-11"
                />
              </Field>
              <Field id="gr" label={t("lending.borrow.gRelation")} err={e.relation}>
                <Input
                  id="gr"
                  value={g.relation}
                  onChange={(x) => setG({ ...g, relation: x.target.value })}
                  placeholder={t("lending.borrow.gRelationPh")}
                  className="h-11"
                />
              </Field>
              <Field id="gp" label={t("lending.borrow.gPhone")} err={e.phone}>
                <Input
                  id="gp"
                  type="tel"
                  value={g.phone}
                  onChange={(x) => setG({ ...g, phone: x.target.value })}
                  placeholder="+880 1…"
                  className="h-11"
                />
              </Field>
              <Field id="ge" label={t("lending.borrow.gEmail")}>
                <Input
                  id="ge"
                  type="email"
                  value={g.email}
                  onChange={(x) => setG({ ...g, email: x.target.value })}
                  className="h-11"
                />
              </Field>
              <Field id="gnid" label={t("lending.borrow.gNid")} err={e.gnid}>
                <Input
                  id="gnid"
                  value={g.nid}
                  onChange={(x) => setG({ ...g, nid: x.target.value })}
                  autoComplete="off"
                  className="h-11 font-mono"
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="gstreet" label={t("lending.borrow.gStreet")} err={e.street}>
                  <Input
                    id="gstreet"
                    value={g.street}
                    onChange={(x) => setG({ ...g, street: x.target.value })}
                    className="h-11"
                  />
                </Field>
              </div>
              <Field id="gcity" label={t("lending.borrow.gCity")} err={e.city}>
                <Input
                  id="gcity"
                  value={g.city}
                  onChange={(x) => setG({ ...g, city: x.target.value })}
                  className="h-11"
                />
              </Field>
              <Field id="gdistrict" label={t("lending.borrow.gDistrict")} err={e.district}>
                <Input
                  id="gdistrict"
                  value={g.district}
                  onChange={(x) => setG({ ...g, district: x.target.value })}
                  className="h-11"
                />
              </Field>
              <Field id="gpostal" label={t("lending.borrow.gPostal")}>
                <Input
                  id="gpostal"
                  inputMode="numeric"
                  value={g.postal}
                  onChange={(x) => setG({ ...g, postal: x.target.value })}
                  className="h-11"
                />
              </Field>
            </div>
            <label
              className={cn(
                "flex items-start gap-3 border p-4 text-sm",
                e.agree ? "border-destructive" : "border-border",
              )}
            >
              <Checkbox
                checked={agree}
                onCheckedChange={(c) => setAgree(c === true)}
                className="mt-0.5"
              />
              <span>
                {t("lending.borrow.consent")}{" "}
                <Link to="/privacy" className="underline underline-offset-2">
                  {t("lending.borrow.privacy")}
                </Link>
                .{e.agree && <span className="mt-1 block text-xs text-destructive">{e.agree}</span>}
              </span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="min-w-0 space-y-4">
              <div className="text-sm font-medium">{t("lending.borrow.pickupLabel")}</div>
              {win.open.length === 0 ? (
                <p className="text-sm text-destructive" role="alert">
                  {t("lending.borrow.pickupErr")}
                </p>
              ) : (
                <div
                  role="radiogroup"
                  aria-label={t("lending.borrow.pickupLabel")}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                >
                  {win.open.map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={pickup === d}
                      onClick={() => setPickup(d)}
                      className={cn(
                        "flex flex-col items-start border px-3 py-2.5 text-left text-sm transition-colors",
                        pickup === d
                          ? "border-foreground bg-muted"
                          : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatDhaka(d, { locale: fmt.locale, weekday: "long" })}
                      </span>
                      <span className="font-medium">
                        {formatDhaka(d, { locale: fmt.locale, day: "numeric", month: "short" })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {e.pickup && <p className="text-xs text-destructive">{e.pickup}</p>}
              <p className="text-xs text-muted-foreground">
                {t("lending.borrow.pickupHelp", { days: settings.pickup_window_days })}
                {closedNames && ` ${t("lending.borrow.closedOn", { days: closedNames })}`}
              </p>
              <div className="space-y-1 border-l-2 border-foreground pl-4 text-sm">
                <p>{t("lending.borrow.dueAfter", { days: settings.loan_days })}</p>
                {holdUntil && (
                  <p className="text-muted-foreground">
                    {t("lending.borrow.holdUntil", { date: fmt.date(holdUntil) })}
                  </p>
                )}
              </div>
              <Field id="note" label={t("lending.borrow.note")}>
                <Textarea
                  id="note"
                  rows={3}
                  maxLength={500}
                  value={note}
                  onChange={(x) => setNote(x.target.value)}
                  placeholder={t("lending.borrow.notePh")}
                />
              </Field>
            </div>
            <div>{policy}</div>
          </div>
        )}

        {step === 4 && (
          <div>
            <SummaryBlock
              title={t("lending.borrow.sumBook")}
              onEdit={() => setStep(0)}
              editLabel={t("lending.borrow.editLabel")}
            >
              <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-4">
                <BookThumb book={book} fallbackTitle={title} size="sm" />
                <div className="min-w-0">
                  <div className="break-words font-display text-xl">{title}</div>
                  {author && (
                    <div className="break-words text-sm text-muted-foreground">{author}</div>
                  )}
                </div>
              </div>
            </SummaryBlock>
            <SummaryBlock
              title={t("lending.borrow.sumMember")}
              onEdit={() => setStep(1)}
              editLabel={t("lending.borrow.editLabel")}
            >
              <div className="flex items-center gap-4">
                <Initials name={member.name} className="h-12 w-12 text-xl" />
                <div className="min-w-0 text-sm">
                  <div className="break-words font-display text-xl">{member.name}</div>
                  <div className="break-words text-muted-foreground">
                    {member.id} · NID {maskNid(last4(nid))}
                  </div>
                </div>
              </div>
            </SummaryBlock>
            <SummaryBlock
              title={t("lending.borrow.sumGuarantor")}
              onEdit={() => setStep(2)}
              editLabel={t("lending.borrow.editLabel")}
            >
              <div className="flex items-center gap-4">
                <Initials name={g.name} className="h-12 w-12 text-xl" />
                <div className="min-w-0 text-sm">
                  <div className="break-words font-display text-xl">{g.name}</div>
                  <div className="break-words text-muted-foreground">
                    {g.relation} · {g.phone}
                    {g.email && ` · ${g.email}`}
                  </div>
                  <div className="break-words text-muted-foreground">
                    {[g.street, g.city, g.district, g.postal].filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>
            </SummaryBlock>
            <SummaryBlock
              title={t("lending.borrow.sumPickup")}
              onEdit={() => setStep(3)}
              editLabel={t("lending.borrow.editLabel")}
            >
              <dl className="mb-6 space-y-2 text-sm">
                <div className="flex gap-3">
                  <dt className="w-32 shrink-0 text-muted-foreground">
                    {t("lending.borrow.pickupRow")}
                  </dt>
                  <dd>{fmt.dateLong(pickup)}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-32 shrink-0 text-muted-foreground">
                    {t("lending.borrow.holdRow")}
                  </dt>
                  <dd>{fmt.date(holdUntil)}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-32 shrink-0 text-muted-foreground">
                    {t("lending.borrow.dueRow")}
                  </dt>
                  <dd>{t("lending.borrow.dueRowValue", { days: settings.loan_days })}</dd>
                </div>
                {note.trim() && (
                  <div className="flex gap-3">
                    <dt className="w-32 shrink-0 text-muted-foreground">
                      {t("lending.borrow.noteRow")}
                    </dt>
                    <dd className="min-w-0 whitespace-pre-wrap break-words">{note.trim()}</dd>
                  </div>
                )}
              </dl>
              {policy}
            </SummaryBlock>
          </div>
        )}
      </div>

      {tried && Object.keys(errors).length > 0 && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {t("lending.borrow.fixPrompt")}
        </p>
      )}
      {submitError && (
        <div className="mt-6 border border-destructive/50 p-4 text-sm" role="alert">
          <div className="font-medium text-destructive">{t("lending.borrow.submitFailed")}</div>
          <p className="mt-1 break-words text-muted-foreground">{submitError}</p>
        </div>
      )}
      <div className="sticky bottom-0 mt-10 flex justify-between gap-3 border-t border-border bg-background py-4">
        <Button variant="ghost" onClick={back} disabled={step === 0 || busy}>
          {t("lending.back")}
        </Button>
        <Button
          size="lg"
          variant={step === 4 ? "accent" : "default"}
          onClick={next}
          disabled={busy}
          aria-busy={busy}
        >
          {step === 4
            ? busy
              ? t("lending.borrow.submitting")
              : t("lending.borrow.submit")
            : t("lending.continue")}
        </Button>
      </div>
    </div>
  );
}
