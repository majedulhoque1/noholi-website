import { chromium } from 'playwright';
const [url, ...sels] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
for (const s of sels) {
  const r = await p.$$eval(s, els => els.map(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.x*100)/100},${Math.round(r.y*100)/100} ${Math.round(r.width*100)/100}x${Math.round(r.height*100)/100}`; }));
  console.log(s, r.join(' | '));
}
await b.close();
