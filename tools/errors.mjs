import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 600)); });
p.on('pageerror', e => console.log('pageerror:', e.message.slice(0, 600)));
await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await b.close();
