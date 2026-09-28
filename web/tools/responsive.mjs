// Derives the smaller-screen layout from the desktop (Figma) layout.
//
// Loads every page at 1280px, measures each classed element inside <main> (row vs column,
// child widths, grids, fixed sizes, big type, wide side padding) and writes
// src/styles/responsive.generated.css with rules that apply ONLY below 1280px:
//   <=1279  fixed-width items may shrink; long nowrap text may wrap
//   <=900   wide multi-column rows stack; 3+ column grids -> 2; content boxes lose fixed heights
//   <=600   rows of small cards wrap two-up; grids -> 1 (or 2 for small tiles); type scales; side padding 20px
// Fixed-geometry illustrations are scaled as a whole at runtime (src/fitBoxes.js).
//
// usage: node tools/responsive.mjs http://localhost:5191
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2];
const PUBLIC = ['/', '/login', '/catalog', '/books/the-river-path', '/noholi-books', '/become-a-member', '/contact', '/about', '/rules', '/gallery', '/e-books', '/read/the-river-path', '/audio-books', '/audio-books/the-river-path', '/blogs', '/blogs/the-solitary-hour', '/creative-writings', '/creative-writings/the-scent-of-wet-clay', '/book-reviews', '/book-reviews/padma-nadir-majhi'];
const MEMBER = ['/member/dashboard', '/member/profile', '/member/edit', '/member/password', '/borrow/the-river-path', '/studio/blog', '/studio/creative-writing', '/studio/book-review', '/wishlist/books', '/wishlist/e-books', '/wishlist/audio-books'];

const b = await chromium.launch();
const rules = { 1279: new Map(), 900: new Map(), 600: new Map() };
const add = (bp, sel, decls) => {
  const m = rules[bp];
  if (!m.has(sel)) m.set(sel, {});
  Object.assign(m.get(sel), decls);
};

for (const [routes, member] of [[PUBLIC, false], [MEMBER, true]]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  if (member) await ctx.addInitScript(() => localStorage.setItem('noholi.member', '1'));
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const found = await p.evaluate(() => {
      const main = document.querySelector('main');
      const root = main.firstElementChild;
      const rootCls = root.classList[0];
      const out = [];
      const inflow = (el) => [...el.children].filter((c) => {
        const cs = getComputedStyle(c);
        return cs.display !== 'none' && cs.position !== 'absolute' && cs.position !== 'fixed';
      });
      const hasAbsKids = (el) => [...el.children].some((c) => getComputedStyle(c).position === 'absolute');
      for (const el of root.querySelectorAll('[class]')) {
        const cls = el.classList[0];
        if (!cls || cls.startsWith('mobile-')) continue;
        const cs = getComputedStyle(el);
        const rc = el.getBoundingClientRect();
        if (!rc.width) continue;
        const kids = inflow(el);
        const kidW = kids.map((k) => k.getBoundingClientRect().width);
        const parent = el.parentElement;
        const pcs = getComputedStyle(parent);
        out.push({
          cls,
          tag: el.tagName,
          w: rc.width,
          h: rc.height,
          display: cs.display,
          dir: cs.flexDirection,
          pos: cs.position,
          shrink: cs.flexShrink,
          ws: cs.whiteSpace,
          fs: parseFloat(cs.fontSize),
          lh: cs.lineHeight,
          pl: parseFloat(cs.paddingLeft),
          pr: parseFloat(cs.paddingRight),
          declW: el.style.width || null,
          styleW: cs.width,
          styleH: cs.height,
          heightDeclared: [...document.styleSheets].some(() => false),
          gridCols: cs.display === 'grid' ? cs.gridTemplateColumns.split(' ').length : 0,
          nKids: kids.length,
          kidW,
          absKids: hasAbsKids(el),
          kidsAreArt: kids.length > 0 && kids.every((k) => hasAbsKids(k)),
          // for absolutely laid-out rows: does the last item hug the right edge in the design?
          absRightHug: hasAbsKids(el) ? [...el.children].some((c) => rc.right - c.getBoundingClientRect().right <= 24 && c.getBoundingClientRect().left - rc.left > rc.width / 2) : false,
          // absolutely placed element: where it sits inside its parent (to re-anchor right-side items)
          absBox: cs.position === 'absolute' ? (() => {
            const pr = parent.getBoundingClientRect();
            return { left: rc.left - pr.left, right: pr.right - rc.right, pw: pr.width, w: rc.width };
          })() : null,
          // text-heavy groups laid out with absolute children: reflow instead of scaling them
          absText: (hasAbsKids(el) && kids.length === 0 && el.textContent.trim().length >= 60 && ![...el.querySelectorAll('img, svg')].some((i) => i.getBoundingClientRect().width > 40) && (() => {
              // only plain-text groups reflow; drawn pieces (filled/bordered/rotated boxes) are artwork
              const ch = [...el.children];
              const plain = ch.filter((c) => {
                const s = getComputedStyle(c);
                const filled = s.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderLeftWidth) > 0;
                const turned = [c, ...c.querySelectorAll('*')].some((d) => getComputedStyle(d).transform !== 'none');
                const chip = c.getBoundingClientRect().height <= 56 && c.textContent.trim().length > 0; // button / badge
                return !turned && (!filled || chip);
              });
              return plain.length >= 0.8 * ch.length;
            })() && !(rc.height > 200 && rc.width >= 600 && [...el.children].every((c) => c.getBoundingClientRect().width >= 0.4 * rc.width))) ? [...el.children]
            .filter((c) => c.classList[0] && getComputedStyle(c).display !== 'none')
            .map((c) => { const r = c.getBoundingClientRect(); return { cls: c.classList[0], top: r.top - rc.top, left: r.left - rc.left, w: r.width, h: r.height }; })
            .sort((a, b) => (Math.abs(a.top - b.top) < 6 ? a.left - b.left : a.top - b.top)) : null,
          // big containers laid out entirely with absolute children: their children in visual order
          absFlow: (hasAbsKids(el) && kids.length === 0 && rc.height > 200 && rc.width >= 600) ? [...el.children]
            .map((c) => { const r = c.getBoundingClientRect(); return { cls: c.classList[0], top: r.top - rc.top, bottom: r.bottom - rc.top, left: r.left - rc.left, w: r.width }; })
            .filter((c) => c.cls)
            .sort((a, b) => a.top - b.top) : null,
          // inside a small absolutely-composed group (headline, cover, badge cluster)? Big page
          // sections placed absolutely are converted to normal flow, so they don't count.
          inAbsComposition: (() => {
            let a = el;
            while (a && a !== root) {
              if (getComputedStyle(a).position === 'absolute') {
                const pa = a.parentElement, pr = pa.getBoundingClientRect();
                const flowed = pr.width >= 600 && pr.height > 200 && [...pa.children].every((c) => getComputedStyle(c).position === 'absolute');
                if (!flowed) return true;
              }
              a = a.parentElement;
            }
            return false;
          })(),
          rotated: cs.transform !== 'none' && /matrix\((-?[\d.e-]+), (-?[\d.e-]+)/.test(cs.transform) && Math.abs(parseFloat(cs.transform.split('(')[1].split(',')[1])) > 0.5,
          pt: parseFloat(cs.paddingTop),
          pb: parseFloat(cs.paddingBottom),
          parentRow: pcs.display.includes('flex') && pcs.flexDirection === 'row',
          parentCol: pcs.display.includes('flex') && pcs.flexDirection === 'column',
          text: el.children.length === 0 && el.textContent.trim().length > 0,
          ownText: [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || (el.children.length > 0 && [...el.children].every((c) => c.tagName === 'SPAN' || c.tagName === 'BR' || c.tagName === 'STRONG' || c.tagName === 'EM')),
        });
      }
      // declared (authored) width/height per class, from the loaded stylesheets
      const declared = {};
      for (const sheet of document.styleSheets) {
        let list;
        try { list = sheet.cssRules; } catch { continue; }
        for (const rule of list) {
          if (!rule.selectorText || !rule.selectorText.startsWith('.')) continue;
          const m = rule.selectorText.match(/^\.([\w-]+)$/);
          if (!m) continue;
          declared[m[1]] = { width: rule.style.width, height: rule.style.height, minHeight: rule.style.minHeight };
        }
      }
      return { rootCls, out, declared };
    });

    const { rootCls, out, declared } = found;
    const S = (cls) => `.${rootCls} .${cls}`;
    // centred page sections use max(Npx, calc(...)) side padding: tighten below 1280
    for (const e of out) {
      const d = declared[e.cls] || {};
      const pxW = d.width && d.width.endsWith('px') ? parseFloat(d.width) : null;
      const pxH = d.height && d.height.endsWith('px') ? parseFloat(d.height) : null;

      // ---- <=1279: let fixed things give way (artwork boxes keep their geometry; fitBoxes scales them)
      if (!e.absKids && e.tag !== 'IMG') {
        if (e.parentRow && e.w >= 60) add(1279, S(e.cls), e.shrink === '0' ? { 'flex-shrink': '1', 'min-width': '0' } : { 'min-width': '0' });
        if ((pxW && pxW >= 120) || e.parentCol) add(1279, S(e.cls), { 'max-width': '100%' });
      }
      if ((e.ws === 'nowrap' || e.ws === 'pre') && e.w >= 60 && !e.absKids) add(1279, S(e.cls), { 'white-space': e.ws === 'pre' ? 'pre-wrap' : 'normal', 'overflow-wrap': 'break-word' });

      // wide decorative images (rules, ornaments, printer's marks) scale with the column
      if (e.tag === 'IMG' && pxW && pxW >= 150) add(1279, S(e.cls), { 'max-width': '100%', 'height': 'auto' });

      // short rows that Figma positioned absolutely (select boxes, tab strips, input adornments):
      // below the design width let them flow instead of sitting at fixed x positions
      if (e.absKids && e.h <= 64 && e.w >= 120 && e.nKids === 0) {
        add(1279, S(e.cls), { 'display': 'flex', 'flex-wrap': 'wrap', 'align-items': 'center', 'justify-content': e.absRightHug ? 'space-between' : 'flex-start', 'gap': '8px', 'width': 'auto', 'max-width': '100%', 'height': 'auto', 'min-height': `${Math.round(e.h)}px` });
        add(1279, `${S(e.cls)} > *`, { 'position': 'static', 'left': 'auto', 'top': 'auto' });
      }

      // ---- side padding on wide containers
      if (e.w >= 900 && (e.pl >= 32 || e.pr >= 32)) {
        add(900, S(e.cls), { 'padding-left': `${Math.min(e.pl, 32)}px`, 'padding-right': `${Math.min(e.pr, 32)}px` });
        add(600, S(e.cls), { 'padding-left': `${Math.min(e.pl, 20)}px`, 'padding-right': `${Math.min(e.pr, 20)}px` });
      } else if (e.w >= 480 && (e.pl >= 40 || e.pr >= 40)) {
        add(600, S(e.cls), { 'padding-left': `${Math.min(e.pl, 20)}px`, 'padding-right': `${Math.min(e.pr, 20)}px` });
      }

      // ---- absolutely placed lines/frames spanning their box: stretch with it instead of a fixed width
      if (e.absBox && e.absBox.pw > 0 && e.absBox.w >= 0.9 * e.absBox.pw) {
        add(1279, S(e.cls), { 'left': `${Math.round(e.absBox.left * 100) / 100}px`, 'right': `${Math.round(e.absBox.right * 100) / 100}px`, 'width': 'auto' });
      } else
      // ---- absolutely placed items on the right half of their box: pin to the right edge
      if (e.absBox && e.absBox.pw > 0 && e.absBox.left + e.absBox.w / 2 > e.absBox.pw / 2 && e.absBox.right >= 0) {
        add(1279, S(e.cls), { 'left': 'auto', 'right': `${Math.round(e.absBox.right * 100) / 100}px` });
      }

      // ---- big containers built from absolutely placed blocks: flow them top-to-bottom
      if (e.absFlow && e.absFlow.length && e.absFlow.every((c) => c.w >= 0.4 * e.w)) {
        add(1279, S(e.cls), { 'display': 'flex', 'flex-direction': 'column', 'height': 'auto', 'width': 'auto', 'max-width': '100%', 'align-self': 'stretch', 'flex-shrink': '1', 'min-width': '0' });
        let prevBottom = 0;
        for (const c of e.absFlow) {
          const gap = Math.max(0, Math.round(c.top - prevBottom));
          add(1279, `${S(e.cls)} > .${c.cls}`, { 'position': 'relative', 'left': 'auto', 'right': 'auto', 'top': 'auto', 'margin-top': `${gap}px`, 'width': 'auto', 'max-width': '100%', 'margin-left': `${Math.max(0, Math.min(Math.round(c.left), 32))}px`, 'margin-right': `${Math.max(0, Math.min(Math.round(c.left), 32))}px` });
          add(600, `${S(e.cls)} > .${c.cls}`, { 'margin-left': `${Math.max(0, Math.min(Math.round(c.left), 20))}px`, 'margin-right': `${Math.max(0, Math.min(Math.round(c.left), 20))}px` });
          prevBottom = Math.max(prevBottom, c.bottom);
        }
      }

      // ---- decorative rotated labels (vertical captions) have no room once columns stack
      if (e.rotated && !e.inAbsComposition && e.text) add(900, S(e.cls), { 'display': 'none' });

      // ---- short rows (breadcrumb bars, meta lines, button pairs) wrap onto a second line on phones
      if (e.display.includes('flex') && e.dir === 'row' && e.nKids >= 2 && e.h <= 72 && e.w >= 300 && !e.inAbsComposition && (Math.min(...e.kidW) >= 24 || (e.nKids >= 3 && e.kidW.filter((w) => w >= 120).length >= 2))) {
        add(900, S(e.cls), { 'flex-wrap': 'wrap', 'row-gap': '8px' });
      }

      // ---- text-heavy absolutely-laid-out groups: flow in reading order (wide pieces take a full line)
      if (e.absText && e.absText.length) {
        add(1279, S(e.cls), { 'display': 'flex', 'flex-wrap': 'wrap', 'align-items': 'flex-start', 'align-content': 'flex-start', 'gap': '8px 10px', 'height': 'auto', 'width': 'auto', 'max-width': '100%', 'min-height': '0' });
        e.absText.forEach((c, i) => {
          const wide = c.w >= 0.5 * e.w;
          add(1279, `${S(e.cls)} > .${c.cls}`, { 'position': 'relative', 'left': 'auto', 'right': 'auto', 'top': 'auto', 'order': String(i), ...(wide ? { 'flex': '1 1 100%', 'width': 'auto', 'max-width': '100%' } : { 'flex': '0 1 auto', 'max-width': '100%' }) });
        });
      }

      // ---- rows
      const isRow = e.display.includes('flex') && e.dir === 'row';
      const big = e.kidW.filter((w) => w >= 120).length;
      if (isRow && e.nKids >= 2 && e.w >= 480 && big >= 2 && e.h > 72) {
        const maxKid = Math.max(...e.kidW);
        const smallCards = e.nKids >= 3 && maxKid <= 320;
        if (smallCards) {
          // rows of cards wrap as soon as the screen is narrower than the design
          add(1279, S(e.cls), { 'flex-wrap': 'wrap', 'row-gap': '32px' });
          if (!e.kidsAreArt) {
            add(900, `${S(e.cls)} > *`, { 'flex': '1 1 200px', 'min-width': '0', 'max-width': '100%' });
            add(600, `${S(e.cls)} > *`, { 'flex': '1 1 calc(50% - 16px)', 'width': 'auto' });
          }
        } else {
          add(900, S(e.cls), { 'flex-direction': 'column', 'align-items': 'stretch', 'justify-content': 'flex-start' });
          add(900, `${S(e.cls)} > *`, { 'width': 'auto', 'max-width': '100%', 'flex': '0 0 auto' });
          if (!e.styleH || e.h > 0) add(900, S(e.cls), { 'height': 'auto' });
        }
      }

      // ---- grids
      if (e.gridCols >= 3) {
        // grids of fixed-geometry cards need room sooner than grids of fluid cards
        add(e.kidsAreArt ? 1279 : 900, S(e.cls), { 'grid-template-columns': 'repeat(2, minmax(0, 1fr))', 'height': 'auto' });
        const colW = e.w / e.gridCols;
        add(600, S(e.cls), { 'grid-template-columns': colW <= 220 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)' });
        // artwork cells have no in-flow content, so they keep their fixed height
        add(900, `${S(e.cls)} > *`, e.kidsAreArt ? { 'grid-column': 'auto', 'grid-row': 'auto' } : { 'grid-column': 'auto', 'grid-row': 'auto', 'height': 'auto', 'align-self': 'start' });
      } else if (e.gridCols === 2 && e.w >= 480) {
        add(900, S(e.cls), { 'grid-template-columns': 'minmax(0, 1fr)', 'height': 'auto' });
        add(900, `${S(e.cls)} > *`, { 'grid-column': 'auto', 'grid-row': 'auto', 'height': 'auto' });
      }

      // ---- anything holding text grows with it once lines re-wrap (design height stays the minimum)
      if (pxH && e.ownText && !e.inAbsComposition && !['INPUT', 'TEXTAREA', 'IMG'].includes(e.tag)) {
        add(1279, S(e.cls), { 'height': 'auto', 'min-height': `${pxH}px` });
      }

      // ---- containers with in-flow content lose fixed heights once things reflow
      if (pxH && e.nKids > 0 && !e.absKids && e.w >= 200 && !['IMG', 'INPUT', 'TEXTAREA', 'BUTTON'].includes(e.tag)) {
        add(900, S(e.cls), { 'height': 'auto', 'min-height': `${Math.min(pxH, 0)}px` });
      }

      // ---- filler padding (used in Figma to make side-by-side columns line up) goes once they stack
      if (e.pt >= 160 || e.pb >= 160) {
        add(900, S(e.cls), { ...(e.pt >= 160 ? { 'padding-top': '48px' } : {}), ...(e.pb >= 160 ? { 'padding-bottom': '48px' } : {}) });
      }

      // ---- vertical rhythm: big section padding tightens on phones
      if (e.w >= 900 && (e.pt >= 72 || e.pb >= 72)) {
        add(600, S(e.cls), { 'padding-top': `${Math.min(e.pt, Math.max(40, Math.round(e.pt * 0.5)))}px`, 'padding-bottom': `${Math.min(e.pb, Math.max(40, Math.round(e.pb * 0.5)))}px` });
      }

      // ---- type (only text in normal flow; absolutely positioned headline pieces scale with their box)
      if (e.inAbsComposition) continue;
      if (e.fs >= 40) {
        const f = Math.max(30, Math.round(e.fs * 0.62));
        add(600, S(e.cls), { 'font-size': `${f}px`, 'line-height': '1.12' });
        add(900, S(e.cls), { 'font-size': `${Math.round(e.fs * 0.8)}px`, 'line-height': '1.12' });
      } else if (e.fs >= 28) {
        add(600, S(e.cls), { 'font-size': `${Math.round(e.fs * 0.8)}px`, 'line-height': '1.2' });
      }
    }
    console.log(`${r}: ${out.length} elements`);
  }
  await ctx.close();
}
await b.close();

// ---- write: one file per page (keyed by the page's root class), loaded with that page's code
const NL = String.fromCharCode(10);
fs.rmSync('src/styles/responsive', { recursive: true, force: true });
fs.mkdirSync('src/styles/responsive', { recursive: true });
const order = [1279, 900, 600];
const roots = new Set();
for (const bp of order) for (const sel of rules[bp].keys()) roots.add(sel.split(' ')[0].slice(1));
for (const root of roots) {
  const out = [
    `/* GENERATED by tools/responsive.mjs for .${root} — do not hand-edit; put fixes in responsive.overrides.css.`,
    '   Every rule sits inside a max-width query below the 1280px design, so desktop stays pixel-exact. */',
  ];
  for (const bp of order) {
    const mine = [...rules[bp]].filter(([sel]) => sel.startsWith(`.${root} `));
    if (!mine.length) continue;
    out.push('', `@media (max-width: ${bp}px) {`);
    for (const [sel, decls] of mine) {
      out.push(`  ${sel} {`);
      for (const [k, v] of Object.entries(decls)) out.push(`    ${k}: ${v};`);
      out.push('  }');
    }
    out.push('}');
  }
  fs.writeFileSync(`src/styles/responsive/${root}.css`, out.join(NL) + NL);
}
if (fs.existsSync('src/styles/responsive.generated.css')) fs.rmSync('src/styles/responsive.generated.css');
console.log('rules:', order.map((bp) => `${bp}: ${rules[bp].size}`).join(', '), '| files:', roots.size);
