# Catalogue import (one-time)

Loads Noholi's book list (`source/all-book-list.xlsx`, sheet `BookList`) into `public.books`, and its covers into the `covers` storage bucket as 400px WebP.

The catalogue is imported **once**. After that, new books come in through the OS (Add Book, Donations).

## Setup

```sh
cd supabase/seed
npm install          # xlsx (SheetJS), sharp, @supabase/supabase-js, p-limit. Node 20+ (tested on 24).
```

## Modes

Every mode re-reads the sheet, applies `mappings.json`, and **exits with an error unless the sheet has 3,016 rows and 8,086 copies**. It then writes `out/books.json` (the exact rows that would be loaded) and `import-report.md`.

| Command | What it does |
|---|---|
| `node import-books.mjs` or `--dry-run` | Parse and normalise only. Nothing is downloaded or written to a database. |
| `node import-books.mjs --covers` | Also downloads every cover URL (8 at a time, 15s timeout, 2 retries, browser User-Agent), converts it to WebP 400px wide at quality 75, and saves `out/covers/BK-####.webp`. Files already on disk are skipped, so it is safe to re-run after a network hiccup. Results go to `out/covers-manifest.json`; failures are listed in the report. |
| `node import-books.mjs --load --target local` | Uploads `out/covers/*.webp` to the `covers` bucket and upserts all rows into `books` in batches of 500, then re-counts: it fails unless the table holds 3,016 imported rows whose copies add up to the imported total. |
| `node import-books.mjs --load --target prod --yes-really-prod` | Same, against the production project. The extra flag is required. |

Run `--covers` before `--load`, otherwise every book loads without a cover (`thumbnail` null, which the apps show as a typographic placeholder).

### Credentials for `--load`

Copy `.env.example` to `.env.local` (local) or `.env.prod` (production) in this folder and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Both files are gitignored. For the local stack, `npx supabase@2.118 status` from the repo root prints both values. `--target local` refuses to run if the URL is not localhost.

### Safety

- `--load` refuses to run if any book in the table already has issued or reserved copies, because the import sets both to 0. It is an import, not a sync.
- Rows are upserted by id (`BK-0001` … `BK-3016`, in sheet order), so re-running `--load` on a fresh database is harmless.
- `out/` is gitignored (the covers are large). Keep it until production is loaded.

## Changing how values are cleaned

Edit `mappings.json`, not the script, then re-run `--dry-run` and read `import-report.md`.

- `category.map`: sheet value → audience (`Children`, `Young Adults`, `Adults`, `All Ages`, `General`).
- `condition.map`: sheet value → `Good`, `Fair`, `Needs Repair`, `Poor`.
- `price`: which prefixes mean Taka and which mean a foreign currency (those become null).
- `coverUrlRewrites`: mirror URLs tried before a cover's original URL (`ds.rokomari.store` resets every connection; `rokbucket.rokomari.io` serves the same files).
- `rowFixes`: corrections for single books, each guarded by the value it expects to find.

A category or condition in the sheet that is not in the map stops the import and names the value, so nothing is guessed silently. The raw values are always kept in `category_raw`, `condition_raw` and `genre_raw`.

## Copy total: 8,086 vs 8,087

The sheet adds up to 8,086 copies, and that is what the import checks. One row (BK-1776, *Dune Messiah*) has a blank copies cell and is imported as 1 copy, so the database holds **8,087**. `--load` verifies against 8,087. To import it as 0 instead, set `copies.blankDefault` to 0 in `mappings.json`.
