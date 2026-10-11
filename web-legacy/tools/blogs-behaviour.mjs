// Clicks every Blogs tab, the sort toggle and pagination; reports what is shown.
import { chromium } from 'playwright';
const [base, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(base + '/blogs', { waitUntil: 'networkidle' });
const state = () => p.evaluate(() => ({
  cards: [...document.querySelectorAll('.blogs-curated-chronicle-ledger-grid article')].map((a) => a.querySelector('[class*="-by-"]')?.textContent.slice(0, 22)),
  showing: document.querySelector('.blogs-footer-archival-pagination-ledge-box').textContent,
  pages: document.querySelector('.blogs-nav-folio-pages').textContent,
  nextDisabled: document.querySelector('.blogs-nav-folio-pages-box-2').disabled,
  overlap: (() => { const g = document.querySelector('.blogs-curated-chronicle-ledger-grid').getBoundingClientRect(); const f = document.querySelector('.blogs-archival-register-footnote-aster').getBoundingClientRect(); const last = [...document.querySelectorAll('.blogs-curated-chronicle-ledger-grid article')].pop()?.getBoundingClientRect(); return { gap: Math.round(f.top - (last?.bottom ?? g.top)) }; })(),
}));
console.log('initial', JSON.stringify(await state()));
await p.click('text=NEXT →'); console.log('after next', JSON.stringify(await state()));
await p.screenshot({ path: `${out}/blogs-p2.png`, fullPage: true });
await p.click('.blogs-nav-folio-pages button:has-text("1")'); console.log('page 1', JSON.stringify(await state()));
await p.click('.blogs-sort-toggle'); console.log('asc', JSON.stringify(await state()));
for (const t of ['LIBRARY CHRONICLES', 'LITERARY ESSAYS', 'REGIONAL VOICES', 'MEMBER SUBMISSIONS', 'ALL DISPATCHES']) { await p.click(`button:has-text("${t}")`); console.log(t, JSON.stringify(await state())); }
console.log('errors', errs);
await b.close();
