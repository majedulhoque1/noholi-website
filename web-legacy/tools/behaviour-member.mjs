// Click-through checks for the member pages, signed in as the real test member MEM-TEST-1 on the
// local Supabase (supabase/seed/dev-accounts.mjs). Leaves no lasting changes: the borrow request it
// makes is cancelled, and the phone number it edits is put back.
// usage: node tools/behaviour-member.mjs [baseUrl]
import { chromium } from 'playwright';
import { memberSession, TEST_MEMBER } from './_login-member.mjs';

const base = process.argv[2] || 'http://localhost:5191';
const BOOK = '/borrow/bk-0110-himur-ditiyo-prohor';
const b = await chromium.launch();
const session = await memberSession();
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`);
const errors = [];

async function page(route, member = true) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  if (member) await ctx.addInitScript(session);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${route}: ${e.message}`));
  // 400s are the expected answers to deliberately wrong input (bad password, bad phone)
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 400/.test(m.text())) errors.push(`${route}: ${m.text().slice(0, 200)}`); });
  await p.goto(base + route, { waitUntil: 'networkidle' });
  return p;
}
const status = (p) => p.locator('[role=status]').last().innerText().catch(() => '');
const waitStatus = (p, re) => p.waitForFunction((src) => [...document.querySelectorAll('[role=status]')].some((e) => new RegExp(src, 'i').test(e.textContent)), re.source, { timeout: 10000 }).catch(() => {});

// guard
{
  const p = await page('/member/dashboard', false);
  check('logged-out /member/dashboard redirects to /login', p.url().endsWith('/login'), p.url());
  await p.context().close();
}
// dashboard
{
  const p = await page('/member/dashboard');
  await p.waitForSelector('.mdash-paragraph-text-2');
  check('dashboard: shows the member card id', (await p.locator('.mdash-paragraph-text-2').innerText()) === TEST_MEMBER.id);
  check('dashboard: no placeholder or demo entries', !/\[Member Name\]|Padma River Boatman|NL-READER/.test(await p.locator('main').innerText()));
  check('dashboard: renewal rule shown', /renewed online/i.test(await p.locator('.mdash-borrowing-guidance-note').innerText()));
  await p.context().close();
}
// profile
{
  const p = await page('/member/profile');
  check('profile: shows the real member row', (await p.locator('.mprofile-horizontalborder-box-2-box-box-2-box-text').innerText()) === TEST_MEMBER.id);
  await p.click('a:has-text("EDIT")');
  check('profile: EDIT opens /member/edit', p.url().endsWith('/member/edit'));
  await p.goto(base + '/member/profile');
  await p.click('a:has-text("CHANGE PASSWORD")');
  check('profile: CHANGE PASSWORD opens /member/password', p.url().endsWith('/member/password'));
  await p.context().close();
}
// edit (phone goes through update_my_profile, then is restored)
{
  const p = await page('/member/edit');
  check('edit: name is read-only', await p.getAttribute('#medit-full-name', 'readonly') !== null);
  const phone = await p.inputValue('#medit-phone-number');
  await p.fill('#medit-phone-number', 'abc');
  await p.click('button[type=submit]');
  await waitStatus(p, /valid phone/);
  check('edit: invalid phone refused by the server', /valid phone/i.test(await status(p)), await status(p));
  await p.fill('#medit-phone-number', '01700000199');
  await p.click('button[type=submit]');
  await waitStatus(p, /saved/);
  check('edit: valid phone saves', /saved/i.test(await status(p)), await status(p));
  await p.fill('#medit-phone-number', phone);
  await p.click('button[type=submit]');
  await p.waitForTimeout(800);
  check('edit: label click focuses its field', await (async () => { await p.click('label[for=medit-phone-number]'); return p.evaluate(() => document.activeElement.id === 'medit-phone-number'); })());
  await p.context().close();
}
// password (validation only; the test member's password is not changed)
{
  const p = await page('/member/password');
  await p.fill('#mpass-current-password', 'oldpass1');
  await p.fill('#mpass-new-password', 'newpass#1');
  await p.fill('#mpass-confirm-new-password', 'newpass#2');
  await p.click('button[type=submit]');
  check('password: mismatch rejected', /do not match/i.test(await status(p)), await status(p));
  await p.fill('#mpass-confirm-new-password', 'newpass#1');
  await p.click('button[type=submit]');
  await waitStatus(p, /not correct/);
  check('password: wrong current password rejected', /not correct/i.test(await status(p)), await status(p));
  await p.click('button[aria-controls=mpass-new-password]');
  check('password: eye toggles visibility', (await p.getAttribute('#mpass-new-password', 'type')) === 'text');
  await p.context().close();
}
// borrow → dashboard hold → cancel
{
  const p = await page(BOOK);
  await p.waitForSelector('.borrow-heading-2-text');
  check('borrow: real book loaded', /Himur/i.test(await p.locator('.borrow-heading-2-text').innerText()));
  check('borrow: NID pre-filled from the member record', (await p.inputValue('#borrow-nid-passport-birth-certificate-n')).length > 0);
  check('borrow: pickup picker bounded', !!(await p.getAttribute('#borrow-preferred-pickup-date', 'min')) && !!(await p.getAttribute('#borrow-preferred-pickup-date', 'max')));
  await p.fill('#borrow-guarantor-name', '');
  await p.click('button[type=submit]');
  check('borrow: empty required field rejected', /please fill in/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.goto(base + BOOK, { waitUntil: 'networkidle' });
  await p.click('button[type=submit]');
  check('borrow: guarantor consent required', /confirm that your guarantor/i.test(await status(p)));
  await p.check('#borrow-guarantor-consent');
  await p.click('button[type=submit]');
  await waitStatus(p, /REQ-/);
  const text = await status(p);
  const req = /REQ-\d+/.exec(text)?.[0];
  check('borrow: request accepted with REQ id and hold expiry', !!req && /hold lasts until/.test(text), text.slice(0, 80));
  check('borrow: breadcrumb links to the book', (await p.getAttribute('.borrow-nav-breadcrumb a:nth-of-type(3)', 'href'))?.startsWith('/books/bk-0110'));
  await p.goto(base + '/member/dashboard', { waitUntil: 'networkidle' });
  const card = p.locator('.mdash-background-border-2', { hasText: req || 'none' });
  check('dashboard: hold listed', (await card.count()) === 1);
  if (await card.count()) {
    await card.locator('button:has-text("Cancel")').click();
    await waitStatus(p, /cancelled/);
    check('dashboard: Cancel releases the hold', /cancelled/i.test(await status(p)), await status(p));
  }
  await p.goto(base + '/borrow/bk-999999-nothing', { waitUntil: 'networkidle' });
  check('borrow: unknown book shows not found', /not found/i.test(await p.locator('main').innerText()));
  await p.context().close();
}
// studio blog
{
  const p = await page('/studio/blog');
  check('blog: real member shown', (await p.locator('.sblog-paragraph-text-3').innerText()).includes(TEST_MEMBER.id));
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
  check('blog: complete essay → honest coming soon', /coming soon/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.context().close();
}
// studio creative writing
{
  const p = await page('/studio/creative-writing');
  await p.click('button:has-text("#DhakaHeritage")');
  check('writing: tag chip appends to keywords', (await p.inputValue('#swriting-thematic-keywords')).includes('#DhakaHeritage'));
  await p.click('button[type=submit]');
  check('writing: pre-filled submission → coming soon', /coming soon/i.test(await status(p)), (await status(p)).slice(0, 60));
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
  check('review: complete review → coming soon', /coming soon/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.click('button:has-text("Clear")');
  await p.click('button[type=submit]');
  check('review: empty critique rejected', /critique/i.test(await status(p)), (await status(p)).slice(0, 60));
  await p.context().close();
}
// wishlists: no data source yet → coming soon, forms say nothing was sent
{
  const p = await page('/wishlist/books');
  check('books: coming soon instead of demo cards', (await p.locator('.studio-soon').count()) === 2 && (await p.locator('text=Padma Nadir Majhi (').count()) === 0);
  check('books: counts are zero', (await p.locator('.wlbooks-background-border-box-text').innerText()) === '0');
  await p.click('button[type=submit]');
  check('books: empty request rejected', /please complete/i.test(await status(p)));
  await p.fill('#wlbooks-book-title', 'Kapalkundala');
  await p.fill('#wlbooks-author-name', 'Bankim Chandra');
  await p.click('button[type=submit]');
  check('books: request → coming soon, nothing sent', /coming soon/i.test(await status(p)));
  await p.context().close();
}
{
  const p = await page('/wishlist/e-books');
  check('e-books: coming soon instead of demo cards', (await p.locator('.wlebooks-wishlist-items-list .studio-soon').count()) === 1 && (await p.locator('.wlebooks-wishlist-items-list article').count()) === 0);
  await p.selectOption('#wlebooks-sort', 'title');
  check('e-books: sort select still works', /TITLE/.test(await p.locator('.wlebooks-options-box-text').innerText()));
  await p.fill('#wlebooks-book-title', 'Sanchayita');
  await p.fill('#wlebooks-original-author', 'Tagore');
  await p.click('button[type=submit]');
  check('e-books: missing justification rejected', /digitize/i.test(await status(p)));
  await p.fill('#wlebooks-why-should-the-library-digitize', 'Rare edition.');
  await p.click('button[type=submit]');
  check('e-books: proposal → coming soon', /coming soon/i.test(await status(p)));
  await p.context().close();
}
{
  const p = await page('/wishlist/audio-books');
  check('audio: coming soon instead of demo entries', (await p.locator('.studio-soon').count()) === 2 && (await p.locator('article').count()) === 0);
  await p.click('button[aria-label="Change sort order"]');
  check('audio: sort toggle changes', /TITLE/.test(await p.locator('button[aria-label="Change sort order"]').innerText()));
  await p.fill('#wlaudio-book-title', 'Chander Pahar');
  await p.fill('#wlaudio-original-author', 'Bibhutibhushan');
  await p.click('button[type=submit]');
  check('audio: request → coming soon', /coming soon/i.test(await status(p)));
  await p.context().close();
}
// log out last (it ends the shared test session)
{
  const p = await page('/member/dashboard');
  await p.click('button:has-text("LOG OUT")');
  await p.waitForTimeout(800);
  check('dashboard: LOG OUT lands on home', new URL(p.url()).pathname === '/', p.url());
  check('dashboard: LOG OUT clears the session', (await p.evaluate(() => localStorage.getItem('noholi.web.auth'))) === null && (await p.isVisible('.header-login')));
  await p.context().close();
}

await b.close();
console.log(results.join('\n'));
console.log(`${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passed`);
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
