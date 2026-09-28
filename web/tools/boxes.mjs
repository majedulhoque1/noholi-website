// dump page boxes of every [data-f] element (gen.py GEN_DEBUG=1 build) as JSON
import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
const r = await p.$$eval('[data-f]', els => els.map(e => { const r = e.getBoundingClientRect(); return [e.dataset.f, r.x + scrollX, r.y + scrollY, r.width, r.height, e.tagName]; }));
(await import('node:fs')).writeFileSync(out, JSON.stringify(r)); await b.close();
