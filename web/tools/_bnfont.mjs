import { chromium } from 'playwright';
import fs from 'node:fs';
const S = JSON.parse(fs.readFileSync('tools/out/bn-samples.json', 'utf8'));
const cands = ["'Noto Serif Bengali'", "'Noto Sans Bengali'", "'Nirmala UI'", "Vrinda", "'Hind Siliguri'", "'Baloo Da 2'", "'Tiro Bangla'", "'Anek Bangla'", "Arial", "Georgia"];
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://localhost:5191/about', { waitUntil: 'networkidle' });
await p.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Baloo+Da+2:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&family=Anek+Bangla:wght@400;500;600;700&display=block' });
await p.evaluate(async (c) => { for (const f of c) for (const w of [400, 500, 600, 700]) await Promise.race([new Promise(r => setTimeout(r, 400)), document.fonts.load(`${w} 16px ${f}`, 'অআ').catch(() => 0)]); }, cands);
const r = await p.evaluate(({ S, cands }) => {
  const out = {};
  for (const fam of ['FreeSans', 'Noto Serif Bengali', 'Newsreader', 'Work Sans']) {
    const rows = S.filter(s => s.f === fam);
    out[fam] = cands.map(c => {
      let err = 0; const rs = [];
      for (const s of rows) {
        const e = document.createElement('span');
        e.style.cssText = `font-family:${c};font-size:${s.z}px;font-weight:${s.wt};white-space:nowrap;position:absolute;${/Italic/.test(s.s) ? 'font-style:italic;' : ''}${s.ls ? 'letter-spacing:' + (s.ls.endsWith('%') ? parseFloat(s.ls) / 100 + 'em' : s.ls) : ''}`;
        e.textContent = s.tx; document.body.appendChild(e);
        const w = e.getBoundingClientRect().width; e.remove();
        rs.push(w / s.w); err += Math.abs(w / s.w - 1);
      }
      return [c, rows.length, (err / rows.length).toFixed(3), rs.slice(0, 6).map(x => x.toFixed(2)).join(' ')];
    });
  }
  return out;
}, { S, cands });
for (const [k, v] of Object.entries(r)) { console.log('==', k); for (const x of v) console.log('  ', x.join('  ')); }
await b.close();
