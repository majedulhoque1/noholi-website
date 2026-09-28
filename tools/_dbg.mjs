import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5191/catalog', { waitUntil: 'networkidle' });
console.log(await p.$$eval('select', s => s.map(x => x.id + ':' + [...x.options].map(o => o.value).join(','))));
await p.selectOption('#catalog-language', 'Bangla'); await p.waitForTimeout(300); console.log(p.url()); await p.selectOption('#catalog-category', 'Children'); await p.waitForTimeout(300); console.log(p.url(), await p.textContent('.catalog-all-categories'));
await b.close();
