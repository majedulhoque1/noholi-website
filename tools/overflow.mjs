// For each route at several widths: does the page scroll sideways? which elements stick out?
import { chromium } from 'playwright';
const base = process.argv[2];
const widths = (process.argv[3] || '390,768,1024').split(',').map(Number);
const only = process.argv[4];
const routes = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi', '/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'].filter(r => !only || r === only);
const b = await chromium.launch();
const ctx = await b.newContext();
await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
const p = await ctx.newPage();
const summary = {};
for (const w of widths) {
  await p.setViewportSize({ width: w, height: 900 });
  let bad = 0;
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: 'load' }); await p.waitForTimeout(250);
    const res = await p.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const sw = document.documentElement.scrollWidth;
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const rc = el.getBoundingClientRect();
        if (rc.width && (rc.right > W + 1 || rc.left < -1)) out.push([(el.className?.baseVal ?? el.className) || el.tagName, Math.round(rc.left), Math.round(rc.right)]);
      }
      return { sw, W, n: out.length, sample: out.slice(0, 4) };
    });
    // content pushed off the LEFT edge is clipped silently (no scrollbar), so count it too
    const over = res.sw > res.W + 1 || res.sample.some((x) => x[1] < -1) || res.n > 0;
    if (over) bad++;
    if (over || only) console.log(`${w} ${r} scrollWidth ${res.sw}/${res.W} overflowing els ${res.n} ${JSON.stringify(res.sample)}`);
  }
  summary[w] = `${bad}/${routes.length} pages scroll sideways`;
}
console.log(summary);
await b.close();
