// tools/errors.mjs with the member session flag set first. usage: node tools/errors-member.mjs <url>...
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await b.newPage();
  await p.addInitScript(() => localStorage.setItem('noholi.member', '1'));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(url, m.type() + ':', m.text().slice(0, 400)); });
  p.on('pageerror', e => console.log(url, 'pageerror:', e.message.slice(0, 600)));
  await p.goto(url, { waitUntil: 'networkidle' });
  if (!p.url().endsWith(new URL(url).pathname)) console.log(url, 'REDIRECTED to', p.url());
  await p.close();
}
await b.close();
