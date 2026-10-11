// tools/errors.mjs signed in as the test member (MEM-TEST-1, see _login-member.mjs). usage: node tools/errors-member.mjs <url>...
import { chromium } from 'playwright';
import { memberSession } from './_login-member.mjs';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await b.newPage();
  await p.addInitScript(await memberSession());
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(url, m.type() + ':', m.text().slice(0, 400)); });
  p.on('pageerror', e => console.log(url, 'pageerror:', e.message.slice(0, 600)));
  await p.goto(url, { waitUntil: 'networkidle' });
  if (!p.url().endsWith(new URL(url).pathname)) console.log(url, 'REDIRECTED to', p.url());
  await p.close();
}
await b.close();
