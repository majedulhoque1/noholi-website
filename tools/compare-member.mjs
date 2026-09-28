// Member-page variant of tools/compare.mjs.
// Screenshots a member route at 1280px (logged in via localStorage) and diffs it against the
// Figma render, after dropping the 33px "REVIEW MODE" design-note strip from the render.
// The footer is excluded from the diff (Figma member frames use 242/314/328/329px footers,
// the site always renders the shared 314px SiteFooter), so the reported mismatch is the page
// body only: site rows [0 .. siteH - siteFooter) vs figma rows [33 .. figmaH - figmaFooter).
// usage: node tools/compare-member.mjs <baseUrl> <route> <render-file-substring>
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';
import path from 'node:path';

const STRIP = 33;
const [base, route, renderKey] = process.argv.slice(2);
const renders = path.resolve('design-export/renders');
const file = fs.readdirSync(renders).find((f) => f.includes(renderKey));
if (!file) throw new Error('no render matching ' + renderKey);
const out = path.resolve('tools/out');
fs.mkdirSync(out, { recursive: true });
const name = 'member' + (route.replace(/\W+/g, '_') || 'home');

// Figma footer height: the frame's chrome footer node (any depth <= 2, height > 0)
const frameId = file.match(/__(\d+)-(\d+)\.png$/).slice(1).join(':');
const tree = JSON.parse(fs.readFileSync('design-export/design-tree.json', 'utf8'));
const frame = tree.frames.find((f) => f.i === frameId);
const texts = (n) => (n.t === 'TEXT' ? [n.tx || ''] : (n.c || []).flatMap(texts));
let figFooter = 0;
for (const c of frame.c || []) {
  if (c.h > 0 && /Footer/i.test(c.n) && texts(c).some((t) => t.includes('© 2026 Noholi Library'))) figFooter = c.h;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.addInitScript(() => localStorage.setItem('noholi.member', '1'));
await page.goto(base + route, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const siteFooter = await page.$eval('footer, .site-footer', (e) => Math.round(e.getBoundingClientRect().height)).catch(() => 0);
const finalUrl = page.url();
const shotPath = path.join(out, name + '.png');
await page.screenshot({ path: shotPath, fullPage: true });
await browser.close();

const a = PNG.sync.read(fs.readFileSync(shotPath));
const raw = PNG.sync.read(fs.readFileSync(path.join(renders, file)));
// drop review strip, clamp width to 1280 (some renders include 9-12px of overflow on the right)
const b = new PNG({ width: Math.min(1280, raw.width), height: raw.height - STRIP });
PNG.bitblt(raw, b, 0, STRIP, b.width, b.height, 0, 0);

const w = Math.min(a.width, b.width);
const aBody = a.height - siteFooter;
const bBody = b.height - figFooter;
const h = Math.min(aBody, bBody);
const crop = (img) => {
  const o = new PNG({ width: w, height: h });
  PNG.bitblt(img, o, 0, 0, w, h, 0, 0);
  return o;
};
const ca = crop(a), cb = crop(b);
const diff = new PNG({ width: w, height: h });
const bad = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.15 });
fs.writeFileSync(path.join(out, name + '.diff.png'), PNG.sync.write(diff));

const sbs = new PNG({ width: w * 2 + 10, height: Math.max(a.height, b.height) });
sbs.data.fill(255);
PNG.bitblt(a, sbs, 0, 0, a.width, a.height, 0, 0);
PNG.bitblt(b, sbs, 0, 0, b.width, b.height, w + 10, 0);
fs.writeFileSync(path.join(out, name + '.sbs.png'), PNG.sync.write(sbs));

const rows = [];
for (let y = 0; y < h; y += 40) {
  let n = 0;
  for (let yy = y; yy < Math.min(y + 40, h); yy++)
    for (let x = 0; x < w; x++) if (diff.data[(yy * w + x) * 4] === 255 && diff.data[(yy * w + x) * 4 + 1] === 0) n++;
  rows.push([y, n]);
}
const worst = rows.filter((r) => r[1] > 200).slice(0, 14).map((r) => `${r[0]}:${r[1]}`).join(' ');
const expected = b.height - figFooter + siteFooter;
console.log(`${route}${finalUrl.endsWith(route) ? '' : '  (ended at ' + finalUrl + ')'}`);
console.log(`  built ${a.width}x${a.height}  figma ${raw.width}x${raw.height} (-${STRIP} strip = ${b.height})  footers site ${siteFooter} / figma ${figFooter}  expected built ${expected}  delta ${a.height - expected}`);
console.log(`  body ${aBody} vs ${bBody}  body mismatch ${(100 * bad / (w * h)).toFixed(2)}%`);
console.log('  drift rows (y:pixels) ' + worst);
