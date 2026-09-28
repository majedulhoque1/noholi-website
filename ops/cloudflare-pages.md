# Cloudflare Pages: two projects from one repo

The monorepo `noholi-website` (Noholi GitHub org) deploys as **two** Pages projects:

| | Public site | Staff console (OS) |
|---|---|---|
| Pages project name | `noholi-web` | `noholi-admin` |
| Root directory | `web` | `admin` |
| Framework preset | None (or Vite) | None (or Vite) |
| Build command | `npm run build` | `npm run build` |
| Build output directory | `dist` | `dist` |
| Production branch | `main` | `main` |
| Build watch paths: include | `web/**` | `admin/**` |
| Build watch paths: exclude | *(none)* | *(none)* |
| Indexing | public | `noindex` (already done: `<meta name="robots" content="noindex, nofollow">` in `admin/index.html`, and `Disallow: /` in `admin/public/robots.txt`) |

Both apps already have `public/_redirects` containing `/* /index.html 200`. This is the SPA fallback, so deep
links such as `/books/bk-0001-...` or `/members` load the app instead of a 404. Don't add a `404.html`,
because Pages would serve it in place of the fallback.

## Environment variables

Set these under Settings → Variables and Secrets, for **Production** and **Preview** alike. They are
inlined at build time (Vite `VITE_*`), so you must **redeploy** after changing one.

| Variable | `noholi-web` | `noholi-admin` |
|---|---|---|
| `NODE_VERSION` | `22` | `22` |
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon / publishable key | not used |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | not used | anon / publishable key (the same value) |

- Use only the **anon / publishable** key. It is public by design, and RLS protects the data.
  **Never** put the `service_role` / secret key or the DB password in Pages. Anything named `VITE_*` ends up in the JS bundle.
- Preview deployments build every branch against prod Supabase unless you point Preview at something else.
  Until a staging project exists, restrict previews: Settings → Builds → **Preview branch deployments → None**
  (or "custom branches" only). The alternative is Cloudflare Access on the `*.pages.dev` preview URLs.
- Local dev uses `.env.development` (local Docker Supabase). It is never uploaded.

## Creating each project (repeat for `noholi-web` and `noholi-admin`)

1. Cloudflare dashboard → **Workers & Pages** → Create → **Pages** → *Connect to Git*.
2. Authorise the Cloudflare GitHub app for the **Noholi org**, and only for the `noholi-website` repo.
3. Choose the repo. Project name `noholi-web` (or `noholi-admin`). Production branch `main`.
4. Build settings: the preset **None**, then the build command, output directory and **Root directory** (advanced) from the table.
5. Add the environment variables from the table **before** the first build, or the first build ships with empty Supabase config.
6. Save and Deploy. Check the build log: it should show `Node.js 22` and `vite build`, and `dist/` should be found under the root dir.
7. Settings → Builds → **Build watch paths**: Include `web/**` (or `admin/**`). A commit that touches only
   `admin/**` then skips the web build, and the other way round. A commit touching only `ops/**`,
   `supabase/**` or the root README builds neither. That is intended: deploy those by hand.
8. Open `https://noholi-web.pages.dev/some/deep/link`. It should render the app, not a 404, which confirms `_redirects`.
   For admin, also check that `https://noholi-admin.pages.dev/robots.txt` shows `Disallow: /`.

If you ever change the shared code, remember that the apps share nothing at build time. Each root dir is a
standalone Vite app with its own `package.json` and lockfile.

## Custom domains (later, once the domain is on Cloudflare DNS)

1. Add the domain to Cloudflare (Websites → Add site) and switch the registrar's nameservers to Cloudflare. Wait until it is Active.
2. `noholi-web` → Custom domains → Set up → apex, e.g. `noholilibrary.org`, then add `www` too.
   Cloudflare creates the CNAME records itself. Add a redirect rule `www` → apex (Rules → Redirect rules), or the other way round.
3. `noholi-admin` → Custom domains → `os.<domain>` (or `admin.<domain>`). Keep it **noindex**.
   Optional hardening: put **Cloudflare Access** (Zero Trust, free up to 50 users) in front of `os.<domain>`,
   with the staff emails as the allow list. It is a second gate on top of Supabase auth plus MFA.
4. Supabase → Authentication → URL configuration:
   - Site URL: `https://<domain>`
   - Redirect URLs: `https://<domain>/**`, `https://os.<domain>/**`, `https://noholi-web.pages.dev/**`,
     `https://noholi-admin.pages.dev/**`, and `http://localhost:*/**` for dev.
5. Once the domains work, update the hard-coded site URLs: the sitemap and canonical URLs in `/web`, and the links in the staff guide.
6. If an older Vercel deployment of the site exists, remove its domain and then delete the Vercel project, so there is only one live copy.
