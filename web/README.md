# Noholi Library website

Public website and member area for Noholi Library (Dhaka).

**Stack:** TanStack Start (React 19, SSR) + TypeScript + Tailwind CSS 4 + shadcn/ui, with Supabase as the backend (see `../supabase/CONTRACT.md`).

## Environment

Copy `.env.development.example` to `.env.development` and fill in:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `VITE_ADMIN_URL` | URL of the staff console (Noholi OS), linked from the footer |

## Commands

```sh
npm install
npm run dev     # dev server
npm run build   # production build
npm run lint
npm test
```

## Deploy

Vercel project `noholi-website`, root directory `web`. The build uses the Nitro Vercel preset (`VERCEL=1 npm run build` writes `.vercel/output`).

## Notes

- Member pages live under `/account` and render client-side only (the session is kept in localStorage).
- Translations are in `src/lib/i18n/` (one module per area, merged in `index.ts`).
- The previous Vite app (v1) is in git history at `ae6d945` (`git show ae6d945:web/src/...`).
