// Noholi Exporter — READ-ONLY. Walks every top-level frame on the current page and
// sends exact layout/style data, SVG icons, image fills and 1x frame renders to the UI,
// which saves them as one JSON file. Nothing in the Figma file is modified.

figma.showUI(__html__, { width: 360, height: 220 });

const M = figma.mixed;
const r2 = v => (typeof v === 'number' ? Math.round(v * 100) / 100 : v);
const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const progress = text => figma.ui.postMessage({ type: 'progress', text });
const tick = () => new Promise(r => setTimeout(r, 0));

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const imageHashes = new Set();
function paints(arr) {
  if (!arr || arr === M || !arr.length) return undefined;
  const out = arr.filter(p => p.visible !== false).map(p => {
    const op = p.opacity !== undefined && p.opacity < 1 ? r2(p.opacity) : undefined;
    if (p.type === 'SOLID') return op !== undefined ? hex(p.color) + '/' + op : hex(p.color);
    if (p.type.startsWith('GRADIENT')) return { g: p.type, s: p.gradientStops.map(s => [hex(s.color), r2(s.color.a), r2(s.position)]), tf: p.gradientTransform.map(r => r.map(r2)), op };
    if (p.type === 'IMAGE') { if (p.imageHash) imageHashes.add(p.imageHash); return { img: p.imageHash, mode: p.scaleMode, op, tf: p.imageTransform, scale: p.scalingFactor }; }
    return { type: p.type };
  });
  return out.length ? out : undefined;
}

// A subtree is "icon-like" when it is only vector geometry (no text, no image fills),
// so it can be exported as one SVG instead of being rebuilt from primitives.
const VECTORISH = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE', 'ELLIPSE', 'RECTANGLE']);
const HARD_VECTOR = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON']);
const iconMemo = new Map();
function hasImageFill(n) { return 'fills' in n && n.fills !== M && n.fills.some(p => p.type === 'IMAGE' && p.visible !== false); }
function iconInfo(n) {
  if (iconMemo.has(n.id)) return iconMemo.get(n.id);
  let res;
  if (n.type === 'TEXT' || hasImageFill(n)) res = { ok: false, hard: false };
  else if (HARD_VECTOR.has(n.type)) res = { ok: true, hard: true };
  else if (VECTORISH.has(n.type)) res = { ok: true, hard: false };
  else if ('children' in n && n.children.length) {
    let ok = true, hard = false;
    for (const c of n.children) { const i = iconInfo(c); ok = ok && i.ok; hard = hard || i.hard; }
    res = { ok, hard };
  } else res = { ok: false, hard: false };
  iconMemo.set(n.id, res);
  return res;
}

const svgs = {};
let nodeCount = 0;

async function walk(n, isRoot) {
  nodeCount++;
  if (nodeCount % 300 === 0) { progress('Reading layers… ' + nodeCount); await tick(); }
  const o = { i: n.id, n: n.name, t: n.type, x: r2(n.x), y: r2(n.y), w: r2(n.width), h: r2(n.height) };
  if (n.visible === false) o.hid = 1;
  if ('opacity' in n && n.opacity < 1) o.op = r2(n.opacity);
  if ('rotation' in n && Math.abs(n.rotation) > 0.01) o.rot = r2(n.rotation);
  if ('blendMode' in n && !['NORMAL', 'PASS_THROUGH'].includes(n.blendMode)) o.blend = n.blendMode;
  if ('clipsContent' in n && n.clipsContent) o.clip = 1;
  if ('layoutMode' in n && n.layoutMode !== 'NONE') {
    o.al = { m: n.layoutMode, p: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map(r2), gap: r2(n.itemSpacing), pa: n.primaryAxisAlignItems, ca: n.counterAxisAlignItems, psm: n.primaryAxisSizingMode, csm: n.counterAxisSizingMode };
    if (n.layoutWrap === 'WRAP') { o.al.wrap = 1; o.al.cgap = r2(n.counterAxisSpacing); }
  }
  if (n.parent && 'layoutMode' in n.parent && n.parent.layoutMode !== 'NONE' && 'layoutSizingHorizontal' in n) {
    o.sz = [n.layoutSizingHorizontal, n.layoutSizingVertical];
    if (n.layoutPositioning === 'ABSOLUTE') o.abs = 1;
  }
  if ('constraints' in n && n.parent && n.parent.type !== 'PAGE') o.cons = [n.constraints.horizontal, n.constraints.vertical];
  for (const k of ['minWidth', 'maxWidth', 'minHeight', 'maxHeight']) if (k in n && n[k] != null) o[k] = r2(n[k]);
  const f = paints(n.fills); if (f) o.fill = f;
  const s = paints(n.strokes);
  if (s) {
    o.st = s;
    o.sw = n.strokeWeight === M ? [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight].map(r2) : r2(n.strokeWeight);
    o.sa = n.strokeAlign;
    if (n.dashPattern && n.dashPattern.length) o.dash = n.dashPattern;
  }
  if ('cornerRadius' in n) {
    if (n.cornerRadius === M) o.r = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map(r2);
    else if (n.cornerRadius) o.r = r2(n.cornerRadius);
  }
  if ('effects' in n && n.effects.length) {
    const ef = n.effects.filter(e => e.visible !== false).map(e => e.type.includes('SHADOW')
      ? [e.type, hex(e.color), r2(e.color.a), r2(e.offset.x), r2(e.offset.y), r2(e.radius), r2(e.spread || 0)]
      : [e.type, r2(e.radius)]);
    if (ef.length) o.fx = ef;
  }

  if (n.type === 'TEXT') {
    o.tx = n.characters;
    o.ta = [n.textAlignHorizontal, n.textAlignVertical, n.textAutoResize];
    if (n.paragraphSpacing) o.ps = n.paragraphSpacing;
    if (n.textTruncation === 'ENDING') o.trunc = n.maxLines || 1;
    const segs = n.getStyledTextSegments(['fontName', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fills', 'textCase', 'textDecoration', 'hyperlink']);
    const seg = g => {
      const x = { f: g.fontName.family, s: g.fontName.style, z: r2(g.fontSize), wt: g.fontWeight };
      x.lh = g.lineHeight.unit === 'AUTO' ? 'auto' : r2(g.lineHeight.value) + (g.lineHeight.unit === 'PERCENT' ? '%' : 'px');
      if (g.letterSpacing.value) x.ls = r2(g.letterSpacing.value) + (g.letterSpacing.unit === 'PERCENT' ? '%' : 'px');
      const c = paints(g.fills); if (c) x.c = c;
      if (g.textCase !== 'ORIGINAL') x.tc = g.textCase;
      if (g.textDecoration !== 'NONE') x.td = g.textDecoration;
      if (g.hyperlink) x.link = g.hyperlink.value || g.hyperlink.type;
      return x;
    };
    if (segs.length === 1) o.font = seg(segs[0]);
    else o.segs = segs.map(g => Object.assign({ a: g.start, b: g.end }, seg(g)));
    return o;
  }

  // Export pure-vector subtrees (icons, illustrations, logos) as SVG and stop descending.
  if (!isRoot && n.visible !== false) {
    const ic = iconInfo(n);
    if (ic.ok && ic.hard) {
      try {
        const bytes = await n.exportAsync({ format: 'SVG_STRING', svgOutlineText: true, svgIdAttribute: false });
        const key = hash(bytes);
        svgs[key] = bytes;
        o.svg = key;
        return o;
      } catch (e) { o.svgErr = String(e); }
    }
  }

  if ('children' in n && n.children.length) {
    o.c = [];
    for (const c of n.children) o.c.push(await walk(c, false));
  }
  return o;
}

figma.ui.onmessage = async msg => {
  if (msg.type !== 'export') return;
  try {
    const page = figma.currentPage;
    // Keep one copy of each top-level frame (the file contains duplicated frames).
    const seen = new Set();
    const tops = page.children.filter(c => {
      const k = c.name + '|' + Math.round(c.width) + 'x' + Math.round(c.height);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const frames = [];
    for (let i = 0; i < tops.length; i++) {
      progress('Frame ' + (i + 1) + '/' + tops.length + ': ' + tops[i].name);
      await tick();
      frames.push(await walk(tops[i], true));
    }

    progress('Exporting images…');
    const images = {};
    for (const h of imageHashes) {
      const img = figma.getImageByHash(h);
      if (!img) continue;
      const bytes = await img.getBytesAsync();
      const type = bytes[0] === 0x89 ? 'png' : bytes[0] === 0xff ? 'jpg' : bytes[0] === 0x47 ? 'gif' : 'webp';
      images[h] = { type, b64: figma.base64Encode(bytes) };
    }

    const renders = {};
    const pageFrames = tops.filter(t => t.type === 'FRAME' && t.width >= 1000);
    for (let i = 0; i < pageFrames.length; i++) {
      progress('Rendering preview ' + (i + 1) + '/' + pageFrames.length);
      await tick();
      const bytes = await pageFrames[i].exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      renders[pageFrames[i].id] = figma.base64Encode(bytes);
    }

    progress('Reading styles & variables…');
    const textStyles = (await figma.getLocalTextStylesAsync()).map(s => ({ name: s.name, font: s.fontName, size: s.fontSize, lh: s.lineHeight, ls: s.letterSpacing }));
    const paintStyles = (await figma.getLocalPaintStylesAsync()).map(s => ({ name: s.name, paints: paints(s.paints) }));
    const variables = [];
    for (const v of await figma.variables.getLocalVariablesAsync()) variables.push({ name: v.name, type: v.resolvedType, values: v.valuesByMode });

    figma.ui.postMessage({
      type: 'done',
      data: { file: figma.root.name, page: page.name, exportedAt: new Date().toISOString(), nodeCount, frames, svgs, images, renders, textStyles, paintStyles, variables }
    });
  } catch (e) {
    figma.ui.postMessage({ type: 'error', text: String(e && e.stack || e) });
  }
};
