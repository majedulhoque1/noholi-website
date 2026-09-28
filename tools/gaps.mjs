// Find boxes that are much taller than their content at a given width (leftover fixed heights).
import { chromium } from 'playwright';
const [base, width = '390', only] = process.argv.slice(2);
const routes = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi', '/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'].filter((r) => !only || r === only);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +width, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
const p = await ctx.newPage();
for (const r of routes) {
  await p.goto(base + r, { waitUntil: 'load' }); await p.waitForTimeout(300);
  const res = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('main [class]')) {
      if (!el.children.length) continue;
      const rc = el.getBoundingClientRect(); if (rc.height < 300) continue;
      let bottom = rc.top;
      for (const c of el.children) { const q = c.getBoundingClientRect(); if (q.height) bottom = Math.max(bottom, q.bottom); }
      const cs = getComputedStyle(el);
      const slack = rc.bottom - parseFloat(cs.paddingBottom) - bottom;
      if (slack > 150) out.push(`${el.classList[0]} h${Math.round(rc.height)} empty ${Math.round(slack)} (height:${cs.height} min:${cs.minHeight})`);
    }
    return out;
  });
  if (res.length) console.log(r + '\n  ' + res.slice(0, 6).join('\n  '));
}
await b.close();
