// Visit every route as guest and as member; report page errors, ComingSoon fallbacks and redirects.
import { chromium } from 'playwright';
import { memberSession } from './_login-member.mjs';
const base = process.argv[2];
const routes = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi', '/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'];
const b = await chromium.launch();
for (const member of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  if (member) await ctx.addInitScript(await memberSession());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  let bad = 0, soon = 0, redirected = 0;
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: 'networkidle' });
    if (await p.$('text=This page is on its way')) { soon++; console.log(`  ${member ? 'member' : 'guest'} COMING-SOON ${r}`); }
    if (new URL(p.url()).pathname !== r) { redirected++; if (member) console.log(`  member redirected ${r} -> ${p.url()}`); }
  }
  // collect every internal link target on every page and check it resolves to a real page
  const targets = new Set();
  for (const r of routes) { await p.goto(base + r, { waitUntil: 'networkidle' }); (await p.$$eval('a[href^="/"]', as => as.map(a => a.getAttribute('href').split('?')[0]))).forEach(t => targets.add(t)); }
  for (const t of targets) { await p.goto(base + t, { waitUntil: 'networkidle' }); if (await p.$('text=This page is on its way')) { bad++; console.log(`  ${member ? 'member' : 'guest'} link to unbuilt page: ${t}`); } }
  console.log(`${member ? 'MEMBER' : 'GUEST '}: ${routes.length} routes, ${soon} coming-soon, ${redirected} redirected (guest→/login expected for 11 member pages), ${targets.size} distinct link targets, ${bad} dead, page errors: ${errs.length}`);
  await ctx.close();
}
await b.close();
