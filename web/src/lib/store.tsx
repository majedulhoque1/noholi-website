import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  audiobooks,
  user,
  initialBorrowRequests,
  type Audio,
  type BorrowRequest,
  type Contribution,
  type Recommendation,
} from "./data";
import { setActiveLang, translateFor, type Lang, type TKey, type TVars } from "./i18n";
import { useAuth, type MemberRow } from "./auth";

type Ctx = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey, vars?: TVars) => string;
  /** True once a real Supabase member session exists (see auth.tsx). */
  loggedIn: boolean;
  /** Real sign-in (resolve_login -> password -> my_role). Rejects with a reader-facing Error; use describeError(err). */
  login: (identifier: string, password: string) => Promise<MemberRow>;
  logout: () => void;
  memberPrompt: string | null;
  askMember: (reason: string) => void;
  closeMemberPrompt: () => void;
  /** Runs fn for members; otherwise opens the Member Access prompt with the given reason. */
  requireMember: (reason: string, fn: () => void) => void;
  removeContribution: (id: string) => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
  inWish: (id: string) => boolean;
  borrowRequests: BorrowRequest[];
  addBorrowRequest: (
    r: Omit<
      BorrowRequest,
      "id" | "submitted" | "updated" | "status" | "member" | "timeline" | "guarantor"
    > & { guarantor: { name: string; relation: string; phone: string } },
  ) => string;
  cancelBorrowRequest: (id: string) => void;
  contributions: Contribution[];
  addContribution: (c: Omit<Contribution, "id" | "updated" | "submitted" | "timeline">) => string;
  recommendations: Recommendation[];
  addRecommendation: (
    r: Omit<Recommendation, "id" | "date" | "status" | "updated" | "timeline">,
  ) => string;
  player: {
    track: Audio | null;
    playing: boolean;
    pos: number;
    speed: number;
    volume: number;
    expanded: boolean;
  };
  play: (id: string) => void;
  togglePlay: () => void;
  seek: (s: number) => void;
  skip: (d: number) => void;
  setSpeed: (n: number) => void;
  setVolume: (n: number) => void;
  setExpanded: (b: boolean) => void;
  next: () => void;
  prev: () => void;
  closePlayer: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

// Stable empty lists for the features that are "coming soon" (wishlist, contributions, recommendations).
const NO_IDS: string[] = [];
const NO_CONTRIBUTIONS: Contribution[] = [];
const NO_RECOMMENDATIONS: Recommendation[] = [];

// Keep one context instance across hot reloads; otherwise an edit to this file creates a new
// context while the mounted provider still uses the old one ("useApp outside provider").
const g = globalThis as unknown as { __noholiCtx?: React.Context<Ctx | null> };
const AppCtx = g.__noholiCtx ?? (g.__noholiCtx = createContext<Ctx | null>(null));

// Preferences persist in localStorage under the legacy keys, so returning visitors keep their choice.
// Every access is wrapped: storage can be missing or throw (private mode, blocked site data, SSR).
const LANG_KEY = "noholi.lang";
const THEME_KEY = "noholi.theme";
function readPref(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writePref(key: string, value: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  } catch {
    /* preference just will not persist */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeS] = useState<"light" | "dark">("light");
  const [lang, setLangS] = useState<Lang>("en");
  const auth = useAuth();
  const loggedIn = !!auth.session;
  const { signIn, signOut } = auth;
  const [memberPrompt, setMemberPrompt] = useState<string | null>(null);
  // Wishlist, contributions and recommendations have no backend yet: always empty, never mock records.
  const wishlist = NO_IDS;
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>(initialBorrowRequests);
  const contributions = NO_CONTRIBUTIONS;
  const recommendations = NO_RECOMMENDATIONS;
  const [player, setPlayer] = useState<Ctx["player"]>({
    track: null,
    playing: false,
    pos: 0,
    speed: 1,
    volume: 0.8,
    expanded: false,
  });
  const [hydrated, setHydrated] = useState(false); // true once stored preferences have been read (client only)

  useEffect(() => {
    const th = readPref(THEME_KEY);
    if (th === "light" || th === "dark") setThemeS(th);
    const l = readPref(LANG_KEY);
    if (l === "en" || l === "bn") setLangS(l);
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (hydrated) writePref(THEME_KEY, theme);
  }, [theme, hydrated]);
  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    setActiveLang(lang);
    if (hydrated) writePref(LANG_KEY, lang);
  }, [lang, hydrated]);

  useEffect(() => {
    if (!player.playing || !player.track) return;
    const iv = setInterval(() => {
      setPlayer((p) => (p.track ? { ...p, pos: Math.min(p.track.duration, p.pos + p.speed) } : p));
    }, 1000);
    return () => clearInterval(iv);
  }, [player.playing, player.track]);

  const t = useCallback((k: TKey, vars?: TVars) => translateFor(lang, k, vars), [lang]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      toggleTheme: () => setThemeS((x) => (x === "dark" ? "light" : "dark")),
      setTheme: setThemeS,
      lang,
      setLang: setLangS,
      t,
      loggedIn,
      login: signIn,
      logout: () => {
        void signOut();
        toast("You have been logged out.");
      },
      memberPrompt,
      askMember: setMemberPrompt,
      closeMemberPrompt: () => setMemberPrompt(null),
      requireMember: (reason, fn) => {
        if (loggedIn) fn();
        else setMemberPrompt(reason);
      },
      // Coming soon: no backend yet, so these never create, remove or "save" anything.
      removeContribution: () => {
        toast(t("forms.soon.contribute"));
      },
      wishlist,
      inWish: () => false,
      toggleWish: () => {
        if (!loggedIn) {
          setMemberPrompt("Log in or become a free member to save books to your wishlist.");
          return;
        }
        toast(t("forms.soon.wish"));
      },
      borrowRequests,
      addBorrowRequest: (r) => {
        const id = `BR-26-0${420 + borrowRequests.length}`,
          d = today();
        // Snapshot member + guarantor onto the record so later profile edits never rewrite history.
        setBorrowRequests((x) => [
          {
            ...r,
            id,
            submitted: d,
            updated: d,
            status: "Pending Review",
            member: {
              name: user.name,
              memberId: user.memberId,
              phone: user.phone,
              email: user.email,
              address: user.address,
              verification: "NID verified",
            },
            guarantor: { ...r.guarantor, status: "Submitted — awaiting librarian check" },
            timeline: [{ date: d, label: "Request submitted" }],
          },
          ...x,
        ]);
        return id;
      },
      cancelBorrowRequest: (id) => {
        const d = today();
        setBorrowRequests((x) =>
          x.map((r) =>
            r.id === id && r.status === "Pending Review"
              ? {
                  ...r,
                  status: "Cancelled",
                  updated: d,
                  timeline: [...r.timeline, { date: d, label: "Cancelled by member" }],
                }
              : r,
          ),
        );
        toast("Borrow request cancelled", { description: id });
      },
      contributions,
      // Coming soon: nothing is created. Returns "" (no record id); callers must not show success.
      addContribution: () => {
        toast(t("forms.soon.contribute"));
        return "";
      },
      recommendations,
      addRecommendation: () => {
        toast(t("forms.soon.recommend"));
        return "";
      },
      player,
      play: (id) => {
        const tr = audiobooks.find((a) => a.id === id) ?? null;
        setPlayer((p) =>
          p.track?.id === id
            ? { ...p, playing: !p.playing }
            : { ...p, track: tr, playing: true, pos: 0 },
        );
      },
      togglePlay: () => setPlayer((p) => ({ ...p, playing: !p.playing })),
      seek: (s) => setPlayer((p) => ({ ...p, pos: s })),
      skip: (d) =>
        setPlayer((p) =>
          p.track ? { ...p, pos: Math.max(0, Math.min(p.track.duration, p.pos + d)) } : p,
        ),
      setSpeed: (n) => setPlayer((p) => ({ ...p, speed: n })),
      setVolume: (n) => setPlayer((p) => ({ ...p, volume: n })),
      setExpanded: (b) => setPlayer((p) => ({ ...p, expanded: b })),
      next: () =>
        setPlayer((p) => {
          const i = audiobooks.findIndex((a) => a.id === p.track?.id);
          return { ...p, track: audiobooks[(i + 1) % audiobooks.length] ?? null, pos: 0 };
        }),
      prev: () =>
        setPlayer((p) => {
          if (p.pos > 5) return { ...p, pos: 0 };
          const i = audiobooks.findIndex((a) => a.id === p.track?.id);
          return {
            ...p,
            track: audiobooks[(i - 1 + audiobooks.length) % audiobooks.length] ?? null,
            pos: 0,
          };
        }),
      closePlayer: () => setPlayer((p) => ({ ...p, track: null, playing: false, expanded: false })),
    }),
    [
      theme,
      lang,
      t,
      loggedIn,
      signIn,
      signOut,
      memberPrompt,
      wishlist,
      borrowRequests,
      contributions,
      recommendations,
      player,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
};
