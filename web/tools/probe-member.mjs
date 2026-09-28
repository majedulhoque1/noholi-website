// print the element stack at page points (member session). usage: node tools/probe-member.mjs <url> x,y ...
import { chromium } from 'playwright';
import { memberSession } from './_login-member.mjs';
const [url, ...pts] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.addInitScript(await memberSession());
await p.goto(url, { waitUntil: 'networkidle' });
for (const pt of pts) {
  const [x, y] = pt.split(',').map(Number);
  const r = await p.evaluate(([x, y]) => {
    window.scrollTo(0, Math.max(0, y - 400));
    const els = document.elementsFromPoint(x, y - window.scrollY);
    return els.slice(0, 4).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}.${e.className} [${Math.round(r.x)},${Math.round(r.y + window.scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}]`; });
  }, [x, y]);
  console.log(pt, '\n  ' + r.join('\n  '));
}
await b.close();
