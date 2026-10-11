// Every route (member view): list controls that look clickable but do nothing — no handler, no href, no form.
import { chromium } from 'playwright';
import { memberSession } from './_login-member.mjs';
const [base] = process.argv.slice(2);
const routes = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi', '/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(await memberSession());
const p = await ctx.newPage(); let total = 0;
for (const r of routes) {
  await p.goto(base + r, { waitUntil: 'networkidle' });
  const dead = await p.evaluate(() => {
    const props = (el) => { const k = Object.keys(el).find((x) => x.startsWith('__reactProps')); return k ? el[k] : {}; };
    const handled = (el) => { for (let n = el, d = 0; n && d < 4; n = n.parentElement, d++) { const pr = props(n); if (pr.onClick || pr.onMouseDown || pr.onPointerDown) return true; } return false; };
    const out = [];
    for (const el of document.querySelectorAll('main button, main a, main [role=button], main [role=tab], main span, main div')) {
      const tag = el.tagName;
      const looks = tag === 'BUTTON' || tag === 'A' || el.getAttribute('role') || getComputedStyle(el).cursor === 'pointer';
      if (!looks || !el.getBoundingClientRect().width) continue;
      if (tag === 'A' && el.getAttribute('href')) continue;
      if (tag === 'BUTTON' && (el.type === 'submit' && el.form)) continue;
      if (el.disabled) continue;
      if (el.closest('label')) continue;
      if (handled(el)) continue;
      if (tag !== 'BUTTON' && tag !== 'A' && el.closest('button, a')) continue;
      out.push(`${tag.toLowerCase()} "${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 45)}"${el.getAttribute('aria-disabled') ? ' [aria-disabled]' : ''}`);
    }
    return out;
  });
  total += dead.length;
  if (dead.length) console.log(`${r} (${dead.length})\n   ${dead.join('\n   ')}`);
}
console.log('TOTAL dead controls:', total);
await b.close();
