# Reusable pieces in `web/`

Building something new on the public site? Check these first.

| Need | Use | Where |
|---|---|---|
| Talk to Supabase (browser, with session) | `supabase` | `src/lib/supabase.ts` |
| Talk to Supabase in SSR loaders (anon, no session) | `supabasePublic` | `src/lib/supabase.ts` |
| Show a Supabase/network error to a reader | `describeError(err)` | `src/lib/supabase.ts` |
| Who is signed in, sign in/out, member row, forced password change | `useAuth()` | `src/lib/auth.tsx` |
| Theme, language, `t()`, member-only gate (`requireMember`) | `useApp()` | `src/lib/store.tsx` |
| Translations (EN + BN) | `src/lib/i18n/{core,auth,catalog,lending,forms}.ts` | add keys to both languages |
| Search, facets, one book, home shelves, Noholi imprint, public settings | `searchBooks`, `catalogFacetsCached`, `getBook`, `getShelfBooks`, `getNoholiBooks`, `getPublicSettings` | `src/lib/books.ts` |
| Book id from any old slug (`bk-0001-title` → `BK-0001`) | `normalizeBookId` | `src/lib/books.ts` |
| Cover image URL, availability, bilingual title/author, Bangla digits | `coverUrl`, `bookAvailability`, `displayTitle`, `displayAuthor`, `fmtNum` | `src/lib/books.ts` |
| Book cover / card for a live book | `LiveCover`, `LiveBookCard` | `src/components/catalog-bits.tsx` |
| Borrow requests, cancel, loans, renew, fines, dashboard | functions in | `src/lib/lending.ts` |
| Dhaka "today", pickup-date maths | | `src/lib/dhaka-date.ts` |
| Join application and contact message (public-intake edge function) | | `src/lib/intake.ts` |
| Old v1 URL → new URL | | `src/lib/legacy-redirects.ts` |
| Password change form (current → new → confirm) | `PasswordForm` | `src/components/password-form.tsx` |
| Account page shells, status pills, empty states | | `src/components/member-ui.tsx` |
| "Check your details" review step before submitting | `Verify` (`editLabel`, `ariaLabel`) | `src/components/verify.tsx` |
| Coming-soon behaviour (wishlist, recommendations, contributions) | no-op actions + toasts | `src/lib/store.tsx` |

## Rules that come with them

- Read `supabase/CONTRACT.md` before adding a query. Anon may only select the columns in `BOOK_COLUMNS`.
- Every new `catch` around a Supabase call shows `describeError(err)`.
- No sample records: a feature without a backend shows the coming-soon state, never fake data.
- Dates the library cares about are Dhaka dates (`dhaka-date.ts`), never `new Date().toISOString()`.
