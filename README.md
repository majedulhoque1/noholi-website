# Noholi Library & Press — website

React + Vite build of the Noholi Figma design (file `ypNuhn7wG5u1P1J8kLhsAV`).
Desktop (1280px) matches the Figma frames pixel-for-pixel within ~0.4–3.3% (the remainder is
Bengali glyphs Figma could not draw and text anti-aliasing). Below 1280px the layout adapts for
tablets and phones (320px and up) — the Figma file is desktop-only, so that part is derived.

## Run

```bash
npm install
npm run dev      # http://localhost:5173 (or the port Vite prints)
npm run build    # static site in dist/
```

Login is a **demo**: any membership number / email plus any password signs in (state in
`localStorage`), which switches the header and unlocks the member pages. There is no backend yet —
forms validate and show a confirmation but send nothing.

## Structure

| Path | What |
|---|---|
| `src/App.jsx` | Public routes (pages load lazily, with their CSS) |
| `src/routes/memberRoutes.jsx` | Member-only routes, wrapped in `RequireMember` (→ /login when logged out) |
| `src/components/SiteHeader.*` | Header: dropdowns, account menu, guest/member state, mobile menu (< 1180px) |
| `src/components/SiteFooter.*` | Shared footer |
| `src/pages/*.jsx/.css` | 31 pages, generated from Figma then hand-wired (links, forms, state) — **edit by hand, don't regenerate** |
| `src/styles/tokens.css` | Colours and font stacks |
| `src/styles/responsive/<page>.css` | **Generated** small-screen rules, one file per page (see tools) |
| `src/styles/responsive.overrides.css` | Hand-written small-screen fixes the generator can't infer |
| `src/fitBoxes.js` | Scales fixed Figma artwork (book covers, illustrations) to fit narrow screens |
| `src/auth.jsx` | Demo session |
| `design-export/` | Figma export: `design-tree.json`, SVGs, images, 1x renders (the ground truth) |
| `figma-export-plugin/` | Read-only Figma dev plugin that produced `design-export/` |
| `tools/` | Generators and checkers — see `tools/README.md` |

## Known content gaps (need real material)

- "Download … PDF" links (Audio Book Details, Creative Writings, Book Reviews) — no PDFs yet; shown as "available soon".
- Blogs pagination pages 2–4 / Next — only one page of posts exists.
- Member form dropdown options (category, genre, cadence, format…) are placeholders; Figma shows one value each.
- Placeholder copy from the design stays as is ("Author Name", "[Hours — to confirm]", "[Member Name]"…).
