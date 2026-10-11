// Dhaka calendar helpers. The library runs on Asia/Dhaka time (UTC+6, no DST);
// never derive "today" from toISOString(), which is UTC and lags Dhaka by 6 hours.
// Ported from v1 web/src/lib/dhakaDate.js (mirror of admin/src/lib/dhaka-date.ts).

export const DHAKA_TZ = "Asia/Dhaka";

const DAY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: DHAKA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const HOUR_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: DHAKA_TZ,
  hour: "2-digit",
  hourCycle: "h23",
});

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Today's date in Dhaka as 'YYYY-MM-DD'. `now` is injectable for tests. */
export function todayDhaka(now: Date = new Date()): string {
  const parts = Object.fromEntries(DAY_FMT.formatToParts(now).map((p) => [p.type, p.value]));
  return `${parts["year"]}-${parts["month"]}-${parts["day"]}`;
}

/** Hour of day (0-23) in Dhaka right now. */
export function hourDhaka(now: Date = new Date()): number {
  return Number(HOUR_FMT.format(now));
}

/** Calendar arithmetic on a 'YYYY-MM-DD' string: addDaysISO('2026-09-29', 5) -> '2026-10-04'. */
export function addDaysISO(iso: string, n: number): string {
  const m = ISO_DAY.exec(iso);
  if (!m) throw new Error(`addDaysISO: expected YYYY-MM-DD, got ${iso}`);
  const t = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n));
  return t.toISOString().slice(0, 10);
}

/** Whole days from one 'YYYY-MM-DD' to another (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

/** Postgres DOW (0 = Sunday ... 6 = Saturday) of a 'YYYY-MM-DD' calendar day. */
export function dowOf(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export type FormatOpts = Intl.DateTimeFormatOptions & { locale?: string };

/**
 * Format a date for display in Dhaka time.
 * A bare 'YYYY-MM-DD' is treated as that Dhaka calendar day (not UTC midnight);
 * anything else (timestamp string or Date) is an instant shown in Dhaka.
 */
export function formatDhaka(isoOrDate: string | Date | null | undefined, opts: FormatOpts = {}) {
  if (isoOrDate == null || isoOrDate === "") return "";
  const { locale = "en-GB", ...fmt } = opts;
  let d: Date;
  if (typeof isoOrDate === "string" && ISO_DAY.test(isoOrDate)) {
    const [y, mo, day] = isoOrDate.split("-").map(Number) as [number, number, number];
    d = new Date(Date.UTC(y, mo - 1, day, 12)); // noon UTC = 18:00 Dhaka, same calendar day
  } else {
    d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  }
  if (Number.isNaN(d.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = Object.keys(fmt).length
    ? fmt
    : { day: "numeric", month: "short", year: "numeric" };
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: DHAKA_TZ }).format(d);
}

/**
 * Pickup window from get_public_settings: today ... today + window days, closed weekdays skipped.
 * `open` is every selectable 'YYYY-MM-DD'.
 */
export function pickupWindow(settings: {
  today: string;
  pickup_window_days: number;
  closed_weekdays: number[];
}) {
  const { today, pickup_window_days: days, closed_weekdays: closed } = settings;
  const open: string[] = [];
  for (let i = 0; i <= days; i += 1) {
    const d = addDaysISO(today, i);
    if (!closed.includes(dowOf(d))) open.push(d);
  }
  return { today, last: addDaysISO(today, days), days, closed, open };
}
