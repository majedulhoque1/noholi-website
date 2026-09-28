// Click-through of the controls wired in the 2026-09-28 bug pass.
import { chromium } from 'playwright';
const [base] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
// visible cards in on-screen order (sorting reorders with CSS `order`, not the DOM)
const vis = (sel) => p.$$eval(sel, (els) => els.filter((e) => !e.hidden && e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return [r.top, r.left, e.querySelector('h4, h3, h2')?.textContent.trim().slice(0, 24) || '?']; }).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]));
const ok = (c, msg) => console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`);

await p.goto(base + '/audio-books', { waitUntil: 'networkidle' });
const all = await vis('.audio-audio-book-catalog-grid-2 article');
await p.click('button:has-text("UNDER 3 HOURS")'); const short = await vis('.audio-audio-book-catalog-grid-2 article');
ok(all.length === 6 && short.length === 2, `audio filter under-3h: ${short}`);
await p.click('button:has-text("POETRY READINGS")'); ok((await vis('.audio-audio-book-catalog-grid-2 article')).length === 1, 'audio filter poetry');
await p.click('button:has-text("ALL NARRATIONS")'); await p.fill('.audio-input', 'selina'); ok((await vis('.audio-audio-book-catalog-grid-2 article'))[0]?.startsWith('Shadows'), 'audio search "selina"');
await p.fill('.audio-input', 'zzz'); ok(await p.isVisible('.audio-empty'), 'audio empty state'); await p.click('.audio-empty button');
await p.selectOption('.audio-sort-select', 'shortest'); ok((await vis('.audio-audio-book-catalog-grid-2 article'))[0]?.startsWith('Studies'), `audio sort shortest first: ${(await vis('.audio-audio-book-catalog-grid-2 article'))[0]}`);
const t0 = await p.textContent('.audio-progress-bar-timestamps-box-2-box-text'); await p.click('button[aria-label="Forward 30 seconds"]');
await p.click('.audio-transport-buttons-box-box-2'); const lbl = await p.textContent('.audio-transport-buttons-box-box-2');
ok(lbl.includes('RESUME'), `audio pause toggles label (${t0} -> ${await p.textContent('.audio-progress-bar-timestamps-box-2-box-text')})`);
await p.click('button:has-text("1.5x")'); ok(await p.getAttribute('button:has-text("1.5x")', 'aria-pressed') === 'true', 'audio speed 1.5x active');
await p.click('text=Index'); await p.waitForTimeout(800); ok(p.url().endsWith('/audio-books/the-river-path#chapters') && (await p.evaluate(() => document.getElementById('chapters').getBoundingClientRect().top)) < 300, 'Index -> chapter table');

await p.click('.audiobook-folio-control-actions-box'); await p.waitForTimeout(1300);
ok((await p.textContent('.audiobook-toggle-play-pause')).includes('PAUSE') && (await p.textContent('.audiobook-horizontalborder-box-text-3')) === 'NOW PLAYING', 'detail: start listening plays');
ok((await p.textContent('.audiobook-scrubber-and-timeline-box-box-text-2')).startsWith('পদ্মা'), 'detail: Bengali caption fixed');

await p.goto(base + '/book-reviews', { waitUntil: 'networkidle' });
await p.click('button:has-text("Curated Reading Guides")'); ok((await p.$$eval('.reviews-main-grid-3x2-folio-reviews-read-box article:not([hidden])', (a) => a.length)) === 2, 'reviews tab guides = 2');
ok((await p.textContent('.reviews-pagination-archival-record-summa-box-box-text')).includes('0 Gazetted Reviews & 2 Reading Guides'), 'reviews showing line');
await p.selectOption('#reviews-order', 'earliest'); ok(true, 'reviews order select');
ok(await p.isDisabled('.reviews-pagination-archival-record-summa-box-box-2-box'), 'reviews next disabled on single page');

await p.goto(base + '/creative-writings', { waitUntil: 'networkidle' });
await p.click('button:has-text("POETRY (কবিতা)")'); ok((await p.$$eval('.writings-curated-creative-writings-grid article:not([hidden])', (a) => a.length)) === 2, 'writings tab poetry = 2');
await p.click('.writings-density-toggle'); ok(await p.$eval('.writings-curated-creative-writings-grid', (g) => getComputedStyle(g).gridTemplateColumns.split(' ').length) === 2, 'writings density toggle -> 2 cols');

for (const [route, btn, want] of [['/blogs/the-solitary-hour', 'button:has-text("Citation")', 'Copied'], ['/creative-writings/the-scent-of-wet-clay', 'button:has-text("CITE VERSES")', 'COPIED'], ['/book-reviews/padma-nadir-majhi', 'button:has-text("CITE APPARATUS")', 'COPIED']]) {
  await p.goto(base + route, { waitUntil: 'networkidle' }); await p.click(btn);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  ok((await p.textContent('main')).includes(want) && clip.includes('Noholi Library'), `${route} cite -> "${clip.slice(0, 60)}…"`);
}
await p.goto(base + '/blogs/the-solitary-hour', { waitUntil: 'networkidle' }); await p.click('button:has-text("Save")');
await p.reload({ waitUntil: 'networkidle' }); ok(await p.isVisible('text=Saved ✓'), 'blog save persists after reload');
await p.goto(base + '/book-reviews/padma-nadir-majhi', { waitUntil: 'networkidle' });
await p.click('text=+ ADD ANNOTATION'); await p.fill('#critique-note', 'A test note on the river.'); await p.click('text=POST ANNOTATION');
ok(await p.isVisible('text=“A test note on the river.”') && (await p.textContent('.critique-paragraph-3-text')).startsWith('3'), 'critique annotation posts');
await p.goto(base + '/catalog', { waitUntil: 'networkidle' }); ok(await p.isDisabled('text=NEXT →'), 'catalog next disabled, page 1 of 1');
console.log('page errors:', errs);
await b.close();
