// Dhaka calendar helpers. The library runs on Asia/Dhaka time (UTC+6, no DST);
// never derive "today" from toISOString(), which is UTC and lags Dhaka by 6 hours.
// Mirror of web/src/lib/dhakaDate.js, keep the two in sync.

export const DHAKA_TZ = "Asia/Dhaka";

/** A calendar day as 'YYYY-MM-DD'. */
export type IsoDay = string;

export type FormatDhakaOptions = Intl.DateTimeFormatOptions & { locale?: string };

const DAY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: DHAKA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Today's date in Dhaka as 'YYYY-MM-DD'. `now` is injectable for tests. */
export function todayDhaka(now: Date = new Date()): IsoDay {
  const parts: Record<string, string> = {};
  for (const p of DAY_FMT.formatToParts(now)) parts[p.type] = p.value;
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** Calendar arithmetic on a 'YYYY-MM-DD' string: addDaysISO('2026-09-29', 5) -> '2026-10-04'. */
export function addDaysISO(iso: IsoDay, n: number): IsoDay {
  const m = ISO_DAY.exec(iso);
  if (!m) throw new Error(`addDaysISO: expected YYYY-MM-DD, got ${iso}`);
  const t = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n));
  return t.toISOString().slice(0, 10);
}

/**
 * Format a date for display in Dhaka time.
 * A bare 'YYYY-MM-DD' is treated as that Dhaka calendar day (not UTC midnight);
 * anything else (timestamp string, epoch ms or Date) is an instant shown in Dhaka.
 */
export function formatDhaka(
  isoOrDate: string | number | Date | null | undefined,
  opts: FormatDhakaOptions = {},
): string {
  if (isoOrDate == null || isoOrDate === "") return "";
  const { locale = "en-GB", ...fmt } = opts;
  let d: Date;
  if (typeof isoOrDate === "string" && ISO_DAY.test(isoOrDate)) {
    const [y, mo, day] = isoOrDate.split("-").map(Number);
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
