// Full-page screenshots of every route at one width, plus contact sheets for review.
import { chromium } from 'playwright';
import { memberSession } from './_login-member.mjs';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const [base, width = '390', perSheet = '6'] = process.argv.slice(2);
const routes = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi', '/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'];
fs.mkdirSync(`tools/out/w${width}`, { recursive: true });
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +width, height: 844 } });
await ctx.addInitScript(await memberSession());
const p = await ctx.newPage(); const files = [];
for (const r of routes) {
  await p.goto(base + r, { waitUntil: 'load' }); await p.waitForTimeout(400);
  const f = `tools/out/w${width}/${r.replace(/\W+/g, '_') || 'home'}.png`;
  await p.screenshot({ path: f, fullPage: true, timeout: 90000 }); files.push([r, f]);
}
await b.close();
console.log(files.map(([r, f]) => { const i = PNG.sync.read(fs.readFileSync(f)); return `${r} ${i.height}px`; }).join('\n'));
