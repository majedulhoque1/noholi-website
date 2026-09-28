// Print the box + key styles of an element, its parent chain (3 up) and children, at a given width.
import { chromium } from 'playwright';
const [base, route, width, sel, member] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +width, height: 900 } });
if (member) await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
const p = await ctx.newPage(); await p.goto(base + route, { waitUntil: 'load' }); await p.waitForTimeout(300);
console.log(await p.evaluate((sel) => {
  const d = (el) => { const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return `${(el.className?.baseVal ?? el.className) || el.tagName} [${Math.round(r.left)}..${Math.round(r.right)} w${Math.round(r.width)} h${Math.round(r.height)}] ${cs.display} ${cs.flexDirection} pos:${cs.position} ws:${cs.whiteSpace} fs:${cs.flexShrink} w:${cs.width} txt:"${el.children.length ? '' : el.textContent.trim().slice(0, 40)}"`; };
  const el = document.querySelector(sel); if (!el) return 'not found';
  const lines = [];
  let a = el; for (let i = 0; i < 3 && a.parentElement; i++) { a = a.parentElement; lines.unshift('  up' + (i + 1) + ' ' + d(a)); }
  lines.push('>> ' + d(el));
  for (const c of el.children) lines.push('     child ' + d(c));
  return lines.join('\n');
}, sel));
await b.close();
