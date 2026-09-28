# Tools

All scripts run from the project root with the dev server up (`npx vite --port 5191`).
In Git Bash, `export MSYS_NO_PATHCONV=1` first, or arguments like `/login` get rewritten into Windows paths.

## Building pages from Figma

| Script | Use |
|---|---|
| `gen.py <frameId> <Component> <prefix>` | Figma frame → `src/pages/<Component>.jsx/.css`. Used for the public pages. Has the public ROUTES labels, Bengali font-face handling, gradient borders, exact-line text handling. |
| `gen_member.py <frameId> <Component> <prefix> [--css-only]` | Same idea, used for the member pages. Adds root-section gaps, negative auto-layout gaps, grid spans/pinning, form controls, and `--css-only` (refresh CSS, keep hand-wired JSX). |

The two diverged while being built in parallel. Every page is already generated and hand-wired, so
they were **not** merged. If new Figma frames are added, merge them first (start from
`gen_member.py`, port `font_face_css`, `inner_border`, `newline_ws` and the ROUTES labels from
`gen.py`), then verify by regenerating a known page to a scratch name and running `compare.mjs`.

`../design-export/tree.py <nodeId> [depth]` prints any Figma node's exact values.

## Small screens

| Script | Use |
|---|---|
| `responsive.mjs <base>` | Measures every page at 1280px and writes `src/styles/responsive/<page>.css` (rules only below 1280px). Re-run after changing any page's layout. |
| `soften_breaks.py` | Marks prose line breaks captured from Figma as `.soft-br` (collapse below 1280px). Poetry pages are excluded. |

## Checking

| Script | Checks |
|---|---|
| `compare.mjs <base> <route> <renderKey> [member]` | Pixel diff vs the Figma render at 1280 (writes `out/*.sbs.png`) |
| `compare-member.mjs <base> <route> <renderKey>` | Same for member pages (drops the 33px review strip, accounts for footer height) |
| `overflow.mjs <base> [widths]` | Sideways scrolling / content off either edge, every page |
| `gaps.mjs <base> [width]` | Boxes much taller than their content |
| `shots.mjs <base> <width>` + `sheets.py <width>` | Full-page screenshots + review sheets |
| `allroutes.mjs <base>` | Every route and every internal link, as guest and member |
| `behaviour-member.mjs <base>` | 42 member-page interaction tests |
| `errors.mjs <url>`, `inspect.mjs`, `measure.mjs` | Debug helpers |

`guest-pages.tsv` / `member-pages.tsv` list routes with their render keys.
