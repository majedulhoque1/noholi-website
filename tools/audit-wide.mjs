// Wide-viewport audit: screenshots + text escaping bordered/filled boxes + siblings overlapping.
import { chromium } from 'playwright';
const [base, outDir, widthsArg, only] = process.argv.slice(2);
const widths = (widthsArg || '1920').split(',').map(Number);
const routes = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi', '/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'].filter(r => !only || only.split(',').includes(r));
const b = await chromium.launch();
const ctx = await b.newContext();
await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
const p = await ctx.newPage();
for (const w of widths) {
  await p.setViewportSize({ width: w, height: 1000 });
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
    const res = await p.evaluate(() => {
      const boxed = (el) => { const s = getComputedStyle(el); return parseFloat(s.borderLeftWidth) > 0 || parseFloat(s.borderRightWidth) > 0 || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.tagName !== 'BODY' && el.tagName !== 'HTML' && el.tagName !== 'MAIN'); };
      const out = [];
      const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (walker.nextNode()) {
        const t = walker.currentNode; if (!t.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(t);
        const tr = range.getBoundingClientRect(); if (!tr.width) continue;
        let a = t.parentElement;
        while (a && a.tagName !== 'MAIN' && !boxed(a)) a = a.parentElement;
        if (!a || a.tagName === 'MAIN') continue;
        const ar = a.getBoundingClientRect();
        const d = Math.max(tr.right - ar.right, ar.left - tr.left, tr.bottom - ar.bottom);
        if (d > 2 && !seen.has(a)) { seen.add(a); out.push(`${Math.round(d)}px "${t.textContent.trim().slice(0, 40)}" escapes .${a.className}`); }
      }
      return out;
    });
    const name = `${w}${r.replace(/\//g, '_') || '_home'}`;
    await p.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
    console.log(`${w} ${r}: ${res.length} escapes${res.length ? '\n   ' + res.slice(0, 8).join('\n   ') : ''}`);
  }
}
await b.close();
