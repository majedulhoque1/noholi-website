# Noholi Library — website + Noholi OS

One repo, one database.

| Path | What |
|---|---|
| `web/` | Public website + member area (React 19 + Vite, JS). Built from the Figma file — see `web/README.md`. Run tools from inside `web/`. |
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

Production keys live only in Cloudflare Pages environment variables.

## Deploy

Two Cloudflare Pages projects from this repo: root directory `web` and root directory `admin`, build `npm run build`, output `dist`. SPA fallback via `public/_redirects`.
