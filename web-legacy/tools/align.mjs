import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [1280, 1302, 1440, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const x = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().x * 10) / 10 : null; };
    return { logo: x('.header-logo img'), eyebrow: x('.home-eyebrow-label'), h1: x('.home-left-column'), cta: Math.round(document.querySelector('.header-cta').getBoundingClientRect().right), featured: x('.home-heading-2'), footerLogo: x('.site-footer-logo img') };
  });
  console.log(w, JSON.stringify(r));
  await p.close();
}
await b.close();
