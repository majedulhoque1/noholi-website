// Click-through checks for the member pages' wiring. usage: node tools/behaviour-member.mjs [baseUrl]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:5191';
const b = await chromium.launch();
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`);
const errors = [];

async function page(route, member = true) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  if (member) await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${route}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`${route}: ${m.text().slice(0, 200)}`); });
  await p.goto(base + route, { waitUntil: 'networkidle' });
  return p;
}
const status = (p) => p.locator('[role=status]').last().innerText().catch(() => '');
const iso = (d) => d.toISOString().slice(0, 10);

// guard
{
  const p = await page('/member/dashboard', false);
  check('logged-out /member/dashboard redirects to /login', p.url().endsWith('/login'), p.url());
  await p.context().close();
}
// dashboard
{
  const p = await page('/member/dashboard');
  check('dashboard: View Monograph links to a book', (await p.locator('a:has-text("View Monograph")').first().getAttribute('href')) === '/books/the-solitary-hour');
  await p.click('button:has-text("LOG OUT")');
  await p.waitForTimeout(500);
  check('dashboard: LOG OUT lands on home', new URL(p.url()).pathname === '/', p.url());
  check('dashboard: LOG OUT signs out and goes home', (await p.evaluate(() => localStorage.getItem('noholi.member'))) === null);
  await p.context().close();
}
// profile
{
  const p = await page('/member/profile');
  await p.click('a:has-text("EDIT")');
  check('profile: EDIT opens /member/edit', p.url().endsWith('/member/edit'));
  await p.goto(base + '/member/profile');
  await p.click('a:has-text("CHANGE PASSWORD")');
  check('profile: CHANGE PASSWORD opens /member/password', p.url().endsWith('/member/password'));
  await p.context().close();
}
// edit
{
  const p = await page('/member/edit');
  await p.fill('#medit-full-name', '');
  await p.click('button[type=submit]');
  check('edit: empty name is rejected', /full name/i.test(await status(p)), await status(p));
  await p.fill('#medit-full-name', 'Mohammad Rafiqul Islam');
  await p.fill('#medit-email-address', 'reader@example.com');
  await p.click('button[type=submit]');
  check('edit: valid form saves', /saved/i.test(await status(p)), await status(p));
  check('edit: label click focuses its field', await (async () => { await p.click('label[for=medit-phone-number]'); return p.evaluate(() => document.activeElement.id === 'medit-phone-number'); })());
  await p.context().close();
}
// password
{
  const p = await page('/member/password');
  await p.fill('#mpass-current-password', 'oldpass1');
  await p.fill('#mpass-new-password', 'newpass#1');
  await p.fill('#mpass-confirm-new-password', 'newpass#2');
  await p.click('button[type=submit]');
  check('password: mismatch rejected', /do not match/i.test(await status(p)), await status(p));
  await p.fill('#mpass-confirm-new-password', 'newpass#1');
  await p.click('button[type=submit]');
  check('password: matching passwords accepted', /updated/i.test(await status(p)), await status(p));
  await p.click('button[aria-controls=mpass-new-password]');
  check('password: eye toggles visibility', (await p.getAttribute('#mpass-new-password', 'type')) === 'text');
  await p.context().close();
}
// borrow
{
  const p = await page('/borrow/the-river-path');
  await p.click('button[type=submit]');
  check('borrow: empty required fields rejected', /please fill in/i.test(await status(p)), (await status(p)).slice(0, 60));
  for (const [id, v] of [['nid-passport-birth-certificate-n', '1994269280001234'], ['guarantor-name', 'A. Rahman'], ['relationship-to-member', 'Sibling'], ['guarantor-contact-number', '+880 1711-000000'], ['nid-passport-birth-certificate-n-2', '1988269280004567'], ['address-lane', 'House 1'], ['city-area-2', 'Mirpur'], ['district-postal-code', 'Dhaka - 1216']])
    await p.fill('#borrow-' + id, v);
  const d = new Date(); d.setDate(d.getDate() + 2);
  await p.fill('#borrow-preferred-pickup-date', iso(d));
  await p.click('button[type=submit]');
  check('borrow: complete request accepted', /received/i.test(await status(p)), (await status(p)).slice(0, 60));
  check('borrow: breadcrumb links to the book', (await p.getAttribute('a:has-text("THE RIVER PATH")', 'href')) === '/books/the-river-path');
  await p.context().close();
}
// studio blog
{
  const p = await page('/studio/blog');
  await p.click('button[type=submit]');
  check('blog: empty submission rejected', /please complete/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.fill('#sblog-article-title', 'Old Bookshops');
  await p.selectOption('#sblog-category', 'city-chronicle');
  check('blog: category select updates the drawn box', (await p.locator('.sblog-select-an-archival-folio').innerText()) === 'City Chronicle');
  await p.fill('#sblog-abstract', 'A short summary.');
  check('blog: abstract counter is live', /16 \/ 300/.test(await p.locator('.sblog-paragraph-2-text-3').innerText()));
  await p.fill('#sblog-manuscript', 'one two three');
  await p.click('button.sblog-archival-literary-toolbar-box-3');
  check('blog: word count is live', (await p.locator('.sblog-span-2').innerText()) === '3');
  check('blog: toolbar inserts markup', (await p.inputValue('#sblog-manuscript')).includes('**'));
  await p.check('#sblog-affirmation');
  await p.click('button[type=submit]');
  check('blog: complete essay accepted', /deposited/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.context().close();
}
// studio creative writing
{
  const p = await page('/studio/creative-writing');
  await p.click('button:has-text("#DhakaHeritage")');
  check('writing: tag chip appends to keywords', (await p.inputValue('#swriting-thematic-keywords')).includes('#DhakaHeritage'));
  await p.click('button[type=submit]');
  check('writing: pre-filled submission accepted', /submitted/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.uncheck('#swriting-affirmation');
  await p.click('button[type=submit]');
  check('writing: unticked declaration rejected', /declaration/i.test(await status(p)));
  await p.click('button:has-text("CLEAR CANVAS")');
  check('writing: clear canvas empties manuscript', (await p.inputValue('#swriting-manuscript')) === '');
  await p.context().close();
}
// studio book review
{
  const p = await page('/studio/book-review');
  await p.click('button[aria-label="3 of 5"]');
  check('review: star rating updates score', (await p.locator('.sreview-star-rating-module-box-box-text').innerText()) === '3.0 / 5.0');
  await p.click('button[role=radio]:has-text("DEMANDING")');
  check('review: difficulty option selectable', (await p.getAttribute('button[role=radio]:has-text("DEMANDING")', 'aria-checked')) === 'true');
  await p.click('label:has-text("From Personal Patron Collection")');
  check('review: provenance radio selectable', await p.isChecked('input[value=personal]'));
  await p.click('button[aria-label="Remove Socialist Realism"]');
  check('review: audience tag removable', (await p.locator('text=Socialist Realism ×').count()) === 0);
  await p.click('button[type=submit]');
  check('review: complete review accepted', /submitted/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.click('button:has-text("Clear")');
  await p.click('button[type=submit]');
  check('review: empty critique rejected', /critique/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.context().close();
}
// wishlists
{
  const p = await page('/wishlist/books');
  await p.locator('button:has-text("REMOVE")').first().click();
  check('books: remove drops a card and the count', (await p.locator('.wlbooks-background-border-box-text').innerText()) === '4' && (await p.locator('text=Padma Nadir Majhi (').count()) === 0);
  await p.click('button[type=submit]');
  check('books: empty request rejected', /please complete/i.test(await status(p)));
  await p.fill('#wlbooks-book-title', 'Kapalkundala');
  await p.fill('#wlbooks-author-name', 'Bankim Chandra');
  await p.click('button[type=submit]');
  check('books: request accepted', /thank you/i.test(await status(p)));
  await p.locator('button:has-text("BORROW BOOK")').first().click();
  check('books: borrow opens the borrow request', p.url().includes('/borrow/'), p.url());
  await p.context().close();
}
{
  const p = await page('/wishlist/e-books');
  await p.selectOption('#wlebooks-sort', 'title');
  const first = await p.locator('.wlebooks-wishlist-items-list article').first().innerText();
  check('e-books: sort by title reorders cards', /Hansuli/.test(first.slice(0, 300)));
  const n0 = await p.locator('.wlebooks-wishlist-items-list article').count();
  await p.locator('.wlebooks-wishlist-items-list button:has-text("REMOVE")').first().click();
  check('e-books: remove drops a card', (await p.locator('.wlebooks-wishlist-items-list article').count()) === n0 - 1);
  await p.fill('#wlebooks-book-title', 'Sanchayita');
  await p.fill('#wlebooks-original-author', 'Tagore');
  await p.click('button[type=submit]');
  check('e-books: missing justification rejected', /digitize/i.test(await status(p)));
  await p.fill('#wlebooks-why-should-the-library-digitize', 'Rare edition.');
  await p.click('button[type=submit]');
  check('e-books: proposal accepted', /thank you/i.test(await status(p)));
  await p.context().close();
}
{
  const p = await page('/wishlist/audio-books');
  await p.click('button[aria-label="Change sort order"]');
  const first = await p.locator('article').first().innerText();
  check('audio: sort toggle reorders entries', /Hansuli/.test(first.slice(0, 300)));
  await p.click('button:has-text("NOTIFY ON RELEASE")');
  check('audio: notify toggles', (await p.locator('text=NOTIFICATION SET').count()) === 1);
  await p.fill('#wlaudio-book-title', 'Chander Pahar');
  await p.fill('#wlaudio-original-author', 'Bibhutibhushan');
  await p.click('button[type=submit]');
  check('audio: request accepted', /thank you/i.test(await status(p)));
  await p.context().close();
}

await b.close();
console.log(results.join('\n'));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
