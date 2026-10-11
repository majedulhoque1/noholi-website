# Noholi Library — website + Noholi OS

One repo, one database.

| Path | What |
|---|---|
| `web/` | Public website + member area (TanStack Start + TypeScript + Tailwind 4 + shadcn, SSR). Wired to Supabase — see `web/README.md`. Run tools from inside `web/`. `web-legacy/` is the previous Vite JS app, kept only as a porting reference. |
| `admin/` | **Noholi OS** — staff console (React + TS + Tailwind + shadcn). Originally built in Lovable, now detached and maintained here. |
| `supabase/` | The backend: versioned migrations, RPCs, edge functions, seed/import, `CONTRACT.md` (the API contract). |
| `ops/` | Backup workflow, pre-deploy dump script, deploy notes. |

## Local development

Development never touches production. Both apps point at a **local Supabase in Docker** via `.env.development`.

```bash
npx supabase@2.118 start          # from repo root; needs Docker Desktop running
npx supabase@2.118 db reset       # rebuild schema from migrations + seed
cd web   && npm install && npm run dev
cd admin && npm install && npm run dev   # http://localhost:8080
```

Production keys live only in the hosting providers' environment variables (Vercel for `web/`, Cloudflare Pages for `admin/`).

## Deploy

`web/` deploys to the Vercel project `noholi-website` (root directory `web`, Nitro Vercel output). `admin/` is a Cloudflare Pages project (root directory `admin`, build `npm run build`, output `dist`, SPA fallback via `public/_redirects`).
