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
import { audiobooks, type Audio, type Contribution, type Recommendation } from "./data";
import {
  deleteContributionRecord,
  loadContributions,
  loadRecommendations,
  loadWishlist,
  saveContributionRecord,
  sendRecommendation,
  toggleWishlistItem,
  type ContributionInput,
} from "./collections";
import { describeError } from "./supabase";
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
  /** Deletes a draft / returned piece. Rejects with the server's reader-facing message. */
  removeContribution: (id: string) => Promise<void>;
  wishlist: string[];
  toggleWish: (id: string) => void;
  inWish: (id: string) => boolean;
  contributions: Contribution[];
  /** Saves a draft (submit=false) or sends to the editors (submit=true). Rejects on failure. */
  addContribution: (c: ContributionInput, submit: boolean, id?: string) => Promise<Contribution>;
  recommendations: Recommendation[];
  addRecommendation: (
    r: Omit<Recommendation, "id" | "date" | "status" | "updated" | "timeline">,
  ) => Promise<Recommendation>;
  /** Load state of wishlist / recommendations / contributions for the signed-in member. */
  collections: { loading: boolean; error: string | null; reload: () => void };
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
  // Wishlist, recommendations and contributions/reviews: real member data (see collections.ts).
  const memberId = auth.member?.id ?? null;
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [colState, setColState] = useState<{ loading: boolean; error: string | null }>({
    loading: false,
    error: null,
  });
  const [colNonce, setColNonce] = useState(0);
  useEffect(() => {
    if (!memberId) {
      setWishlist([]);
      setContributions([]);
      setRecommendations([]);
      setColState({ loading: false, error: null });
      return;
    }
    let live = true;
    setColState({ loading: true, error: null });
    Promise.all([loadWishlist(), loadRecommendations(), loadContributions()])
      .then(([w, r, c]) => {
        if (!live) return;
        setWishlist(w);
        setRecommendations(r);
        setContributions(c);
        setColState({ loading: false, error: null });
      })
      .catch((err) => live && setColState({ loading: false, error: describeError(err) }));
    return () => {
      live = false;
    };
  }, [memberId, colNonce]);
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
      removeContribution: async (id) => {
        await deleteContributionRecord(id);
        setContributions((l) => l.filter((c) => c.id !== id));
      },
      wishlist,
      inWish: (id) => wishlist.includes(id),
      toggleWish: (id) => {
        if (!loggedIn) {
          setMemberPrompt("Log in or become a free member to save books to your wishlist.");
          return;
        }
        // Optimistic: flip now, undo if the server refuses.
        const had = wishlist.includes(id);
        setWishlist((l) => (had ? l.filter((x) => x !== id) : [id, ...l]));
        toggleWishlistItem(id)
          .then((on) => {
            toast(on ? t("ux.wish.added") : t("ux.wish.removed"));
            setWishlist((l) =>
              on ? (l.includes(id) ? l : [id, ...l]) : l.filter((x) => x !== id),
            );
          })
          .catch((err) => {
            setWishlist((l) =>
              had ? [id, ...l.filter((x) => x !== id)] : l.filter((x) => x !== id),
            );
            toast.error(describeError(err));
          });
      },
      contributions,
      addContribution: async (c, submit, id) => {
        const saved = await saveContributionRecord(c, submit, id);
        setContributions((l) => [saved, ...l.filter((x) => x.id !== saved.id)]);
        return saved;
      },
      recommendations,
      addRecommendation: async (r) => {
        const saved = await sendRecommendation(r);
        setRecommendations((l) => [saved, ...l]);
        return saved;
      },
      collections: {
        loading: colState.loading,
        error: colState.error,
        reload: () => setColNonce((n) => n + 1),
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
      contributions,
      recommendations,
      colState,
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
