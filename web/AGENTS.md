# Project rules

- This site started as a frontend-only prototype on mock data (`src/lib/data.ts`) and is being wired to Supabase (see `supabase/CONTRACT.md` at the repo root, the source of truth for tables, RPCs and auth flows). Real auth lives in `src/lib/auth.tsx` (`useAuth()`), the clients in `src/lib/supabase.ts`; UI-only state (wishlist, theme, language, audio player) lives in `AppProvider` in `src/lib/store.tsx`. Never show a fake success state or invent library policy; surface Supabase errors with `describeError()`.
- Book covers are drawn in code (`Cover` in `src/components/noholi.tsx`) from `--cover-N` tokens rather than images. Why: consistent, lightweight covers for dozens of titles.
- Member pages are nested under the `/account` layout, which gates on the real Supabase session. Why: one place for the patron shell and access check.
- Search uses one index/ranker (`src/lib/search.ts`) and one autocomplete component (`SearchBox`), including picker mode via `onPick`. Why: the brief requires a single consistent search pattern everywhere.
- Borrowing is a multi-step Borrow Request (`/account/borrow/$id`), never a checkout; member submissions and book recommendations always start in a review status. Why: library-first product rules — no payments, nothing auto-published.
- Member-only actions call `requireMember` / `MemberButton`, which open the single `MemberPromptHost` dialog mounted in the root. Why: one consistent "Member Access Required" prompt instead of disabled buttons.
- Initial loading belongs in the document shell, with inline critical styles and a bundle-independent failure watchdog; only the first mounted, idle route signals readiness. Why: prevent partial-content flashes and recover from failed downloads without replaying the screen on navigation.
