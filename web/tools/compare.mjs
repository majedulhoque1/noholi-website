// Screenshot a route at 1280px and diff it against the Figma render.
// usage: node tools/compare.mjs <baseUrl> <route> <render-file-substring> [member]
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';
import path from 'node:path';

const [base, route, renderKey, member] = process.argv.slice(2);
const renders = path.resolve('design-export/renders');
const file = fs.readdirSync(renders).find((f) => f.includes(renderKey));
if (!file) throw new Error('no render matching ' + renderKey);
const out = path.resolve('tools/out');
fs.mkdirSync(out, { recursive: true });
const name = route.replace(/\W+/g, '_') || 'home';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
if (member) await page.addInitScript(() => localStorage.setItem('noholi.member', '1'));
await page.goto(base + route, { waitUntil: 'load' }); await page.waitForTimeout(400);
await page.evaluate(() => document.fonts.ready);
const shotPath = path.join(out, name + '.png');
await page.screenshot({ path: shotPath, fullPage: true });
await browser.close();

const a = PNG.sync.read(fs.readFileSync(shotPath));
const b = PNG.sync.read(fs.readFileSync(path.join(renders, file)));
const w = Math.min(a.width, b.width);
const h = Math.min(a.height, b.height);
const crop = (img) => {
  const o = new PNG({ width: w, height: h });
  PNG.bitblt(img, o, 0, 0, w, h, 0, 0);
  return o;
};
const ca = crop(a), cb = crop(b);
const diff = new PNG({ width: w, height: h });
const bad = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.15 });
fs.writeFileSync(path.join(out, name + '.diff.png'), PNG.sync.write(diff));

// side by side (built | figma) for eyeballing
const sbs = new PNG({ width: w * 2 + 10, height: Math.max(a.height, b.height) });
sbs.data.fill(255);
PNG.bitblt(a, sbs, 0, 0, a.width, a.height, 0, 0);
PNG.bitblt(b, sbs, 0, 0, b.width, b.height, w + 10, 0);
fs.writeFileSync(path.join(out, name + '.sbs.png'), PNG.sync.write(sbs));

// rows with most mismatch (to locate drift)
const rows = [];
for (let y = 0; y < h; y += 40) {
  let n = 0;
  for (let yy = y; yy < Math.min(y + 40, h); yy++)
    for (let x = 0; x < w; x++) if (diff.data[(yy * w + x) * 4] === 255 && diff.data[(yy * w + x) * 4 + 1] === 0) n++;
  rows.push([y, n]);
}
const worst = rows.filter((r) => r[1] > 200).slice(0, 12).map((r) => `${r[0]}:${r[1]}`).join(' ');
console.log(`${route}  built ${a.width}x${a.height}  figma ${b.width}x${b.height}  mismatch ${(100 * bad / (w * h)).toFixed(2)}%`);
console.log('drift rows (y:pixels) ' + worst);
