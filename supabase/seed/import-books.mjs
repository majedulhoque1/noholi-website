#!/usr/bin/env node
// One-time catalogue import for Noholi Library.
//
//   node import-books.mjs [--dry-run]                   parse + normalise -> out/books.json, import-report.md
//   node import-books.mjs --covers                      + download covers -> out/covers/BK-####.webp
//   node import-books.mjs --load --target local         + upload covers and upsert rows into public.books
//   node import-books.mjs --load --target prod --yes-really-prod
//
// Every mode re-parses the sheet and fails (exit 1) unless it holds 3,016 rows and 8,086 copies.
// See README.md.

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import sharp from 'sharp';
import pLimit from 'p-limit';

XLSX.set_fs(fs);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(HERE, 'source', 'all-book-list.xlsx');
const SHEET = 'BookList';
const MAPPINGS = path.join(HERE, 'mappings.json');
const OUT = path.join(HERE, 'out');
const COVERS_DIR = path.join(OUT, 'covers');
const COVERS_MANIFEST = path.join(OUT, 'covers-manifest.json');
const BOOKS_JSON = path.join(OUT, 'books.json');
const REPORT = path.join(HERE, 'import-report.md');

const EXPECTED_ROWS = 3016;
const EXPECTED_SHEET_COPIES = 8086;

const COVER_WIDTH = 400;
const COVER_QUALITY = 75;
const DOWNLOAD_CONCURRENCY = 8;
const DOWNLOAD_TIMEOUT_MS = 15_000;
const DOWNLOAD_RETRIES = 2;
const PER_HOST_CONCURRENCY = 3;
const UPLOAD_CONCURRENCY = 8;
const UPSERT_BATCH = 500;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const HEADERS = [
  'Book Title (Bangla)', 'Book Title (English)', 'Author Name (Bangla)', 'Author Name (English)',
  'Genre', 'Publications', 'Year of Publication', 'Edition', 'Language', 'Category', 'ISBN',
  'Total Copies', 'Book Condition', 'Pages', '৳ Price', 'Cover Image URL',
];

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const a = { mode: 'dry-run', target: null, yesProd: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--dry-run') a.mode = 'dry-run';
    else if (v === '--covers') a.mode = 'covers';
    else if (v === '--load') a.mode = 'load';
    else if (v === '--target') a.target = argv[++i];
    else if (v.startsWith('--target=')) a.target = v.slice(9);
    else if (v === '--yes-really-prod') a.yesProd = true;
    else if (v === '-h' || v === '--help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).join('\n')); process.exit(0); }
    else throw new Error(`Unknown argument: ${v}`);
  }
  if (a.mode === 'load') {
    if (!['local', 'prod'].includes(a.target)) throw new Error('--load needs --target local|prod');
    if (a.target === 'prod' && !a.yesProd) throw new Error('--target prod also needs --yes-really-prod');
  }
  return a;
}

// ---------------------------------------------------------------- helpers

const pad4 = (n) => String(n).padStart(4, '0');
const bookId = (i) => `BK-${pad4(i + 1)}`;
const lookupKey = (s) => String(s).trim().replace(/\s+/g, ' ').toLowerCase();

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`;
}

class Tally {
  // counts "from -> to" per field, with the ids of the rows it happened to
  constructor() { this.m = new Map(); }
  add(field, from, to, id) {
    const k = `${field}\u0000${from}\u0000${to}`;
    let e = this.m.get(k);
    if (!e) this.m.set(k, (e = { field, from, to, n: 0, ids: [] }));
    e.n++; e.ids.push(id);
  }
  byField(field) { return [...this.m.values()].filter((e) => e.field === field).sort((a, b) => b.n - a.n); }
}

// ---------------------------------------------------------------- parse + normalise

function loadMappings() {
  const m = JSON.parse(fs.readFileSync(MAPPINGS, 'utf8'));
  const idx = (map) => new Map(Object.entries(map).map(([k, v]) => [lookupKey(k), v]));
  m.category.idx = idx(m.category.map);
  m.condition.idx = idx(m.condition.map);
  m.nullSet = new Set(m.nullTokens.map(lookupKey));
  m.suspectCond = new Set((m.condition.flagAsSuspect || []).map(lookupKey));
  m.lowResRe = m.coverLowResHosts.map((s) => new RegExp(s, 'i'));
  m.coverRewrites = (m.coverUrlRewrites?.rules || []).map((r) => ({ re: new RegExp(r.match, 'i'), replace: r.replace }));
  for (const v of Object.values(m.category.map)) if (!m.category.allowed.includes(v)) throw new Error(`mappings.json: category value '${v}' is not allowed`);
  for (const v of Object.values(m.condition.map)) if (!m.condition.allowed.includes(v)) throw new Error(`mappings.json: condition value '${v}' is not allowed`);
  return m;
}

function readSheet() {
  const wb = XLSX.readFile(SOURCE);
  const ws = wb.Sheets[SHEET];
  if (!ws) throw new Error(`Sheet '${SHEET}' not found in ${SOURCE}`);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true, blankrows: false });
  const header = rows[0].map((h) => (h == null ? '' : String(h).trim()));
  const col = {};
  for (const h of HEADERS) {
    const i = header.indexOf(h);
    if (i < 0) throw new Error(`Column '${h}' missing from header: ${JSON.stringify(header)}`);
    col[h] = i;
  }
  // drop trailing rows that are completely empty
  const data = rows.slice(1).filter((r) => r.some((c) => c !== null && String(c).trim() !== ''));
  return data.map((r) => Object.fromEntries(HEADERS.map((h) => [h, r[col[h]] ?? null])));
}

function normalise(rows, M) {
  const T = new Tally();
  const flags = { blankCopies: [], blankCondition: [], suspectCondition: [], foreignPrice: [], unparsedPrice: [], pagesSummed: [], pagesUnparsed: [], titleFallback: [], authorBlank: [], rowFixes: [], nonNumericYear: [] };
  const unmapped = { category: new Map(), condition: new Map() };
  let whitespaceFixes = 0;

  const clean = (v) => {
    if (v === null || v === undefined) return null;
    const raw = String(v);
    const s = raw.replace(/\s+/g, ' ').trim();
    if (s !== raw) whitespaceFixes++;
    return M.nullSet.has(s.toLowerCase()) ? null : s;
  };

  const books = rows.map((r, i) => {
    const id = bookId(i);

    // text fields
    const title_bangla = clean(r['Book Title (Bangla)']);
    let title = clean(r['Book Title (English)']);
    if (!title) { title = title_bangla; flags.titleFallback.push({ id, raw: r['Book Title (English)'] }); }
    // books.author is NOT NULL DEFAULT '' in the schema, so a missing English author is ''.
    let author = clean(r['Author Name (English)']);
    if (author === null) { author = ''; flags.authorBlank.push({ id }); }
    const author_bangla = clean(r['Author Name (Bangla)']);
    const publisher = clean(r['Publications']);
    const language = clean(r['Language']);

    // genre: trim + collapse whitespace
    const genre_raw = r['Genre'] == null ? null : String(r['Genre']);
    const genre = clean(genre_raw);
    if (genre_raw !== null && genre !== genre_raw) T.add('genre', genre_raw, genre ?? '(null)', id);

    // year (text column: ranges like '1859-1885' are kept as written)
    const yRaw = r['Year of Publication'];
    let year_of_publication = null;
    if (typeof yRaw === 'number') year_of_publication = String(Math.trunc(yRaw));
    else {
      year_of_publication = clean(yRaw);
      if (yRaw !== null && year_of_publication === null) T.add('year', JSON.stringify(yRaw), '(null)', id);
      if (year_of_publication && !/^\d{4}$/.test(year_of_publication)) flags.nonNumericYear.push({ id, value: year_of_publication });
    }

    // edition: '1ST' / '1st ' / '21th' -> proper ordinal
    const eRaw = r['Edition'];
    let edition = clean(eRaw);
    if (edition) {
      const m = /^(\d+)\s*(st|nd|rd|th)?$/i.exec(edition);
      if (m) edition = ordinal(Number(m[1]));
    }
    if (eRaw !== null && edition !== String(eRaw)) T.add('edition', JSON.stringify(eRaw), edition ?? '(null)', id);

    // category -> audience
    const category_raw = r['Category'] == null ? null : String(r['Category']);
    const cKey = clean(category_raw);
    let category;
    if (cKey === null) category = M.category.blank;
    else if (M.category.idx.has(lookupKey(cKey))) category = M.category.idx.get(lookupKey(cKey));
    else { unmapped.category.set(cKey, (unmapped.category.get(cKey) || 0) + 1); category = null; }
    T.add('category', category_raw === null ? '(blank)' : JSON.stringify(category_raw), category, id);

    // condition
    const condition_raw = r['Book Condition'] == null ? null : String(r['Book Condition']);
    const kKey = clean(condition_raw);
    let condition;
    if (kKey === null) { condition = M.condition.blank; flags.blankCondition.push({ id }); }
    else if (M.condition.idx.has(lookupKey(kKey))) {
      condition = M.condition.idx.get(lookupKey(kKey));
      if (M.suspectCond.has(lookupKey(kKey))) flags.suspectCondition.push({ id, raw: condition_raw });
    } else { unmapped.condition.set(kKey, (unmapped.condition.get(kKey) || 0) + 1); condition = null; }
    T.add('condition', condition_raw === null ? '(blank)' : JSON.stringify(condition_raw), condition, id);

    // copies
    const cRaw = r['Total Copies'];
    let total_copies;
    if (cRaw === null || String(cRaw).trim() === '') { total_copies = M.copies.blankDefault; flags.blankCopies.push({ id }); }
    else {
      total_copies = Number(cRaw);
      if (!Number.isInteger(total_copies) || total_copies < 0) throw new Error(`${id}: bad Total Copies ${JSON.stringify(cRaw)}`);
    }

    // pages
    const pRaw = r['Pages'];
    let pages = null;
    if (typeof pRaw === 'number') pages = Math.round(pRaw);
    else if (clean(pRaw) !== null) {
      const nums = String(pRaw).match(/\d+/g) || [];
      if (nums.length === 1) { pages = Number(nums[0]); T.add('pages', JSON.stringify(pRaw), String(pages), id); }
      else if (nums.length > 1) { pages = nums.reduce((a, n) => a + Number(n), 0); flags.pagesSummed.push({ id, raw: pRaw, pages }); T.add('pages', JSON.stringify(pRaw), `${pages} (summed volumes)`, id); }
      else flags.pagesUnparsed.push({ id, raw: pRaw });
    } else if (pRaw !== null) T.add('pages', JSON.stringify(pRaw), '(null)', id);
    if (pages !== null && pages <= 0) pages = null;

    // price
    const prRaw = r['৳ Price'];
    let price = null;
    if (typeof prRaw === 'number') price = prRaw >= 0 ? prRaw : null;
    else {
      const s = clean(prRaw);
      if (s !== null) {
        const m = /^([^\d\s.]+\.?)?\s*([\d,]+(?:\.\d+)?)$/.exec(s);
        const prefix = m && m[1] ? m[1].trim() : null;
        if (m && !prefix) price = Number(m[2].replace(/,/g, ''));
        else if (m && M.price.bdtPrefixes.some((p) => p.toLowerCase() === prefix.toLowerCase())) {
          price = Number(m[2].replace(/,/g, '')); T.add('price', JSON.stringify(prRaw), String(price), id);
        } else if (m && M.price.foreignPrefixes.some((p) => p.toLowerCase() === prefix.toLowerCase())) {
          flags.foreignPrice.push({ id, raw: prRaw }); T.add('price', JSON.stringify(prRaw), '(null, foreign currency)', id);
        } else { flags.unparsedPrice.push({ id, raw: prRaw }); T.add('price', JSON.stringify(prRaw), '(null, unparsed)', id); }
      } else if (prRaw !== null) T.add('price', JSON.stringify(prRaw), '(null)', id);
    }

    // cover
    const coverRaw = r['Cover Image URL'];
    const cover_source_url = clean(coverRaw);
    let coverKind = 'missing';
    if (cover_source_url) {
      if (cover_source_url.startsWith('data:image/')) coverKind = 'data-uri';
      else {
        try {
          const u = new URL(cover_source_url);
          coverKind = M.lowResRe.some((re) => re.test(u.hostname)) ? 'low-res' : 'ok';
        } catch { coverKind = 'invalid'; }
      }
    }

    const book = {
      id, title, title_bangla, author, author_bangla, genre, publisher, year_of_publication, edition,
      language, category, isbn: null, total_copies, issued_copies: 0, reserved_copies: 0, condition,
      pages, price, thumbnail: null, cover_source_url, location: null, is_circulating: true,
      genre_raw, category_raw, condition_raw,
    };
    Object.defineProperty(book, '_coverKind', { value: coverKind, enumerable: false });
    Object.defineProperty(book, '_sheetCopies', { value: cRaw === null ? 0 : Number(cRaw), enumerable: false });
    Object.defineProperty(book, '_raw', { value: r, enumerable: false });
    return book;
  });

  // row fixes (guarded)
  for (const [id, fix] of Object.entries(M.rowFixes)) {
    if (id.startsWith('_')) continue;
    const b = books.find((x) => x.id === id);
    if (!b) throw new Error(`rowFixes: ${id} not found`);
    for (const [k, v] of Object.entries(fix.expect || {})) {
      if (b[k] !== v) throw new Error(`rowFixes ${id}: expected ${k}=${JSON.stringify(v)} but sheet has ${JSON.stringify(b[k])}. Review mappings.json.`);
    }
    for (const [k, v] of Object.entries(fix.expectRaw || {})) {
      if (b._raw[k] !== v) throw new Error(`rowFixes ${id}: expected sheet column '${k}' = ${JSON.stringify(v)} but it is ${JSON.stringify(b._raw[k])}. Review mappings.json.`);
    }
    if (fix.expectRaw) for (const k of Object.keys(fix.set)) {
      // a fix that replaces a value the parser flagged removes it from that flag list
      for (const list of [flags.unparsedPrice, flags.foreignPrice]) { const j = list.findIndex((f) => f.id === id); if (k === 'price' && j >= 0) list.splice(j, 1); }
    }
    Object.assign(b, fix.set);
    flags.rowFixes.push({ id, why: fix.why, set: fix.set });
  }

  const errs = [];
  for (const [k, n] of unmapped.category) errs.push(`category '${k}' (${n} rows) is not in mappings.json`);
  for (const [k, n] of unmapped.condition) errs.push(`condition '${k}' (${n} rows) is not in mappings.json`);
  if (errs.length) throw new Error(`Unmapped values:\n  ${errs.join('\n  ')}`);

  return { books, T, flags, whitespaceFixes };
}

function checkTotals(books) {
  const rows = books.length;
  const sheetCopies = books.reduce((a, b) => a + b._sheetCopies, 0);
  const importedCopies = books.reduce((a, b) => a + b.total_copies, 0);
  const problems = [];
  if (rows !== EXPECTED_ROWS) problems.push(`row count is ${rows}, expected ${EXPECTED_ROWS}`);
  if (sheetCopies !== EXPECTED_SHEET_COPIES) problems.push(`copy total in the sheet is ${sheetCopies}, expected ${EXPECTED_SHEET_COPIES}`);
  const ids = new Set(books.map((b) => b.id));
  if (ids.size !== rows) problems.push('duplicate ids');
  return { rows, sheetCopies, importedCopies, problems };
}

function findDuplicates(books) {
  const g = new Map();
  for (const b of books) {
    const k = `${b.title_bangla ?? ''}\u0000${b.author_bangla ?? ''}`;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(b);
  }
  return [...g.values()].filter((v) => v.length > 1);
}

// ---------------------------------------------------------------- covers

function readManifest() {
  try { return JSON.parse(fs.readFileSync(COVERS_MANIFEST, 'utf8')); } catch { return {}; }
}

async function fetchWithRetry(url) {
  let lastErr;
  for (let attempt = 0; attempt <= DOWNLOAD_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
        },
      });
      if (!res.ok) {
        const e = new Error(`HTTP ${res.status}`);
        e.permanent = res.status === 404 || res.status === 410 || res.status === 403;
        if (res.status === 429) e.waitMs = Math.min(30_000, (Number(res.headers.get('retry-after')) || 5) * 1000);
        throw e;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error('empty body');
      return { buf, contentType: res.headers.get('content-type') || '' };
    } catch (e) {
      lastErr = e;
      if (e.permanent) break;
      if (attempt < DOWNLOAD_RETRIES) await new Promise((r) => setTimeout(r, e.waitMs ?? 800 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function toWebp(buf) {
  const img = sharp(buf, { failOn: 'error', animated: false });
  const meta = await img.metadata();
  const out = await img.rotate().resize({ width: COVER_WIDTH }).webp({ quality: COVER_QUALITY }).toBuffer({ resolveWithObject: true });
  return { data: out.data, srcWidth: meta.width, srcHeight: meta.height, width: out.info.width, height: out.info.height };
}

// Rewritten mirror URLs (mappings.json coverUrlRewrites) first, then the sheet's URL.
function candidateUrls(url, M) {
  const out = [];
  for (const r of M.coverRewrites) if (r.re.test(url)) out.push(url.replace(r.re, r.replace));
  out.push(url);
  return [...new Set(out)];
}

async function downloadCovers(books, M) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  const manifest = readManifest();
  const limit = pLimit(DOWNLOAD_CONCURRENCY);
  const hostLimits = new Map();
  const hostLimit = (url) => {
    let h; try { h = new URL(url).hostname; } catch { h = ''; }
    if (!hostLimits.has(h)) hostLimits.set(h, pLimit(PER_HOST_CONCURRENCY));
    return hostLimits.get(h);
  };
  const todo = books.filter((b) => b.cover_source_url && b._coverKind !== 'invalid');
  let done = 0, skipped = 0, ok = 0, failed = 0;
  const t0 = Date.now();

  await Promise.all(todo.map((b) => limit(async () => {
    const file = path.join(COVERS_DIR, `${b.id}.webp`);
    if (fs.existsSync(file) && manifest[b.id]?.status === 'ok' && manifest[b.id]?.url === b.cover_source_url) { skipped++; done++; return; }
    if (fs.existsSync(file) && !manifest[b.id]) { // file from an older run without manifest entry
      const meta = await sharp(file).metadata();
      manifest[b.id] = { status: 'ok', url: b.cover_source_url, bytes: fs.statSync(file).size, width: meta.width, height: meta.height, srcWidth: null };
      skipped++; done++; return;
    }
    try {
      let buf;
      if (b._coverKind === 'data-uri') {
        const m = /^data:image\/[\w.+-]+;base64,(.*)$/s.exec(b.cover_source_url);
        if (!m) throw new Error('unsupported data URI');
        buf = Buffer.from(m[1], 'base64');
      } else {
        let lastErr;
        for (const u of candidateUrls(b.cover_source_url, M)) {
          try { ({ buf } = await hostLimit(u)(() => fetchWithRetry(u))); break; } catch (e) { lastErr = e; }
        }
        if (!buf) throw lastErr;
      }
      const w = await toWebp(buf);
      fs.writeFileSync(file, w.data);
      manifest[b.id] = { status: 'ok', url: b.cover_source_url, bytes: w.data.length, width: w.width, height: w.height, srcWidth: w.srcWidth, srcHeight: w.srcHeight };
      ok++;
    } catch (e) {
      manifest[b.id] = { status: 'failed', url: b.cover_source_url, error: String(e.name === 'TimeoutError' ? 'timeout (15s)' : e.message || e).slice(0, 200) };
      failed++;
    }
    done++;
    if (done % 100 === 0) {
      process.stdout.write(`  covers ${done}/${todo.length}  new ${ok}  failed ${failed}  skipped ${skipped}  ${Math.round((Date.now() - t0) / 1000)}s\n`);
      fs.writeFileSync(COVERS_MANIFEST, JSON.stringify(manifest, null, 1));
    }
  })));

  // forget manifest entries for books that no longer have a cover URL
  for (const id of Object.keys(manifest)) if (!todo.find((b) => b.id === id)) delete manifest[id];
  fs.writeFileSync(COVERS_MANIFEST, JSON.stringify(manifest, null, 1));
  console.log(`covers: ${todo.length} with a URL; ${ok} downloaded, ${skipped} already on disk, ${failed} failed`);
}

// Retailer "no image" artwork downloads fine but isn't a cover; mappings.json lists
// the sha256 of each such file so those books fall back to the site's placeholder.
function attachThumbnails(books) {
  const manifest = readManifest();
  const blocked = new Set(JSON.parse(fs.readFileSync(MAPPINGS, 'utf8')).coverBlocklistSha256 || []);
  for (const b of books) {
    const file = path.join(COVERS_DIR, `${b.id}.webp`);
    let ok = fs.existsSync(file) && manifest[b.id]?.status !== 'failed';
    if (ok && blocked.size) {
      const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (blocked.has(hash)) ok = false;
    }
    b.thumbnail = ok ? `${b.id}.webp` : null;
  }
  return manifest;
}

// ---------------------------------------------------------------- report

function mdEsc(s) { return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, '\\n'); }
function idList(ids, max = 12) { return ids.length <= max ? ids.join(', ') : `${ids.slice(0, max).join(', ')} … (+${ids.length - max})`; }

function writeReport({ books, T, flags, whitespaceFixes }, totals, manifest, mode) {
  const L = [];
  const missingPrice = books.filter((b) => b.price === null);
  const priceBlank = books.filter((b) => b._raw['৳ Price'] === null || String(b._raw['৳ Price']).trim() === '');
  const priceDash = books.filter((b) => b._raw['৳ Price'] !== null && String(b._raw['৳ Price']).trim() === '-');
  const coverBlank = books.filter((b) => b._raw['Cover Image URL'] === null || String(b._raw['Cover Image URL']).trim() === '');
  const coverDash = books.filter((b) => !coverBlank.includes(b) && b.cover_source_url === null);
  const lowRes = books.filter((b) => b._coverKind === 'low-res');
  const dataUri = books.filter((b) => b._coverKind === 'data-uri');
  const invalid = books.filter((b) => b._coverKind === 'invalid');
  const withUrl = books.filter((b) => b.cover_source_url && b._coverKind !== 'invalid');
  const mOk = withUrl.filter((b) => manifest[b.id]?.status === 'ok');
  const mFail = withUrl.filter((b) => manifest[b.id]?.status === 'failed');
  const mNone = withUrl.filter((b) => !manifest[b.id]);
  const dups = findDuplicates(books);

  L.push('# Noholi catalogue import report', '');
  L.push(`Generated ${new Date().toISOString()} by \`import-books.mjs --${mode}\` from \`source/all-book-list.xlsx\` (sheet \`${SHEET}\`). Rules: \`mappings.json\`.`, '');
  L.push('## Totals', '');
  L.push('| | Count |', '|---|---:|');
  L.push(`| Rows (books) | **${totals.rows}** (expected ${EXPECTED_ROWS}) |`);
  L.push(`| Copies as written in the sheet | **${totals.sheetCopies}** (expected ${EXPECTED_SHEET_COPIES}) |`);
  L.push(`| Copies imported (blank copies cell → ${flags.blankCopies.length ? 1 : 0}) | **${totals.importedCopies}** |`);
  L.push(`| Missing price (null after import) | ${missingPrice.length} (blank ${priceBlank.length}, '-' ${priceDash.length}, foreign currency ${flags.foreignPrice.length}, unparsed ${flags.unparsedPrice.length}) |`);
  L.push(`| Missing cover URL | ${coverBlank.length + coverDash.length} (blank ${coverBlank.length}, '-' ${coverDash.length}) |`);
  L.push(`| Low-res thumbnail URL (gstatic tbn / bing) | ${lowRes.length} |`);
  L.push(`| Inline data: URI covers | ${dataUri.length} |`);
  L.push(`| Invalid cover URL | ${invalid.length} |`);
  L.push(`| Cover downloads OK | ${mOk.length} of ${withUrl.length} |`);
  L.push(`| Cover download failures | ${mFail.length} |`);
  if (mNone.length) L.push(`| Covers not yet attempted (run \`--covers\`) | ${mNone.length} |`);
  L.push(`| Books with a stored cover (thumbnail set) | ${books.filter((b) => b.thumbnail).length} |`);
  L.push(`| Duplicate (Bangla title + Bangla author) pairs | ${dups.length} pairs, ${dups.reduce((a, d) => a + d.length, 0)} rows |`);
  L.push('');
  if (totals.importedCopies !== totals.sheetCopies) {
    L.push(`> The sheet sums to ${totals.sheetCopies} copies. ${flags.blankCopies.length} row(s) had a blank copies cell and were imported as ${totals.importedCopies - totals.sheetCopies} extra cop(ies), so the database total is **${totals.importedCopies}**. \`--load\` verifies against ${totals.importedCopies}.`, '');
  }

  const okSizes = mOk.map((b) => manifest[b.id].bytes).sort((a, b) => a - b);
  if (okSizes.length) {
    const q = (p) => okSizes[Math.min(okSizes.length - 1, Math.floor(p * okSizes.length))];
    const tiny = mOk.filter((b) => manifest[b.id].srcWidth && manifest[b.id].srcWidth < 150);
    L.push('## Covers', '');
    L.push(`WebP, ${COVER_WIDTH}px wide, quality ${COVER_QUALITY}. Sizes: min ${(okSizes[0] / 1024).toFixed(1)} KB, median ${(q(0.5) / 1024).toFixed(1)} KB, p95 ${(q(0.95) / 1024).toFixed(1)} KB, max ${(okSizes.at(-1) / 1024).toFixed(1)} KB, total ${(okSizes.reduce((a, b) => a + b, 0) / 1048576).toFixed(1)} MB.`, '');
    L.push(`${tiny.length} stored covers came from a source narrower than 150px (upscaled, will look soft): ${idList(tiny.map((b) => b.id), 40)}`, '');
    const lowOk = lowRes.filter((b) => manifest[b.id]?.status === 'ok').length;
    L.push(`Of the ${lowRes.length} low-res thumbnail URLs, ${lowOk} downloaded; they are stored but should be replaced with better scans over time.`, '');
  }
  if (mFail.length) {
    const byErr = new Map();
    for (const b of mFail) { const e = manifest[b.id].error; if (!byErr.has(e)) byErr.set(e, []); byErr.get(e).push(b); }
    L.push('### Cover download failures', '');
    L.push('| Error | Count |', '|---|---:|');
    for (const [e, list] of [...byErr].sort((a, b) => b[1].length - a[1].length)) L.push(`| ${mdEsc(e)} | ${list.length} |`);
    L.push('', '| Book | Title | Source URL | Error |', '|---|---|---|---|');
    for (const b of mFail) L.push(`| ${b.id} | ${mdEsc(b.title)} | ${mdEsc(b.cover_source_url.slice(0, 120))} | ${mdEsc(manifest[b.id].error)} |`);
    L.push('');
  }

  L.push('## Flagged rows', '');
  L.push(`**Blank copies → ${1} copy (${flags.blankCopies.length}):** ${flags.blankCopies.map((f) => f.id).join(', ') || 'none'}`, '');
  L.push(`**Blank condition → Good (${flags.blankCondition.length}):** ${flags.blankCondition.map((f) => f.id).join(', ') || 'none'}`, '');
  L.push(`**Condition column held something that is not a condition → Good (${flags.suspectCondition.length}):** ${flags.suspectCondition.map((f) => `${f.id} ('${f.raw}')`).join(', ') || 'none'}`, '');
  L.push(`**Foreign-currency price → null (${flags.foreignPrice.length}):** ${flags.foreignPrice.map((f) => `${f.id} ('${String(f.raw).trim()}')`).join(', ') || 'none'}`, '');
  if (flags.unparsedPrice.length) L.push(`**Unparsed price → null (${flags.unparsedPrice.length}):** ${flags.unparsedPrice.map((f) => `${f.id} ('${f.raw}')`).join(', ')}`, '');
  L.push(`**Pages written as two numbers → summed (${flags.pagesSummed.length}):** ${flags.pagesSummed.map((f) => `${f.id} (${JSON.stringify(f.raw)} → ${f.pages})`).join(', ') || 'none'}`, '');
  if (flags.pagesUnparsed.length) L.push(`**Unparsed pages → null (${flags.pagesUnparsed.length}):** ${flags.pagesUnparsed.map((f) => `${f.id} (${JSON.stringify(f.raw)})`).join(', ')}`, '');
  L.push(`**English title missing → Bangla title used (${flags.titleFallback.length}):** ${flags.titleFallback.map((f) => f.id).join(', ') || 'none'}`, '');
  L.push(`**English author missing → '' (column is NOT NULL) (${flags.authorBlank.length}):** ${flags.authorBlank.map((f) => f.id).join(', ') || 'none'}`, '');
  L.push(`**Year is not a single 4-digit year (kept as written) (${flags.nonNumericYear.length}):** ${flags.nonNumericYear.map((f) => `${f.id} ('${f.value}')`).join(', ') || 'none'}`, '');
  L.push(`**Manual row fixes (${flags.rowFixes.length}):**`);
  for (const f of flags.rowFixes) L.push(`- ${f.id}: ${f.why} Set ${JSON.stringify(f.set)}`);
  L.push('');

  L.push('## Normalisations applied', '');
  L.push(`Every text field is trimmed and internal runs of whitespace are collapsed to one space (${whitespaceFixes} cells changed). '-' and blank become null.`, '');
  const section = (field, title, note) => {
    const rows = T.byField(field);
    if (!rows.length) return;
    L.push(`### ${title}`, '');
    if (note) L.push(note, '');
    L.push('| From | To | Rows | Books |', '|---|---|---:|---|');
    for (const e of rows) L.push(`| ${mdEsc(e.from)} | ${mdEsc(e.to)} | ${e.n} | ${e.n > 8 ? '' : e.ids.join(', ')} |`);
    L.push('');
  };
  section('category', 'Category → audience', 'Every row is listed (identity mappings included) so the table is the full picture. Raw value kept in `category_raw`.');
  section('condition', 'Condition', 'Raw value kept in `condition_raw`.');
  const genreRows = T.byField('genre');
  const distinctRaw = new Set(books.map((b) => b.genre_raw)).size;
  const distinctNorm = new Set(books.map((b) => b.genre)).size;
  L.push('### Genre', '', `${genreRows.reduce((a, e) => a + e.n, 0)} rows changed by trimming/collapsing whitespace (or '-' → null). Distinct values: ${distinctRaw} raw → ${distinctNorm} after. Raw value kept in \`genre_raw\`.`, '');
  L.push('| From | To | Rows |', '|---|---|---:|');
  for (const e of genreRows) L.push(`| ${mdEsc(JSON.stringify(e.from))} | ${mdEsc(e.to)} | ${e.n} |`);
  L.push('');
  section('price', 'Price');
  section('pages', 'Pages');
  section('year', 'Year of publication');
  section('edition', 'Edition', 'Ordinals rewritten (1ST → 1st, 21th → 21st, 63th → 63rd).');

  L.push('## Duplicate (Bangla title + Bangla author) pairs', '');
  L.push(`All rows are imported; the sheet is authoritative. ${dups.length} pairs (after trimming whitespace), covering ${dups.reduce((a, d) => a + d.length, 0)} rows. Staff may want to merge some into one row with a higher copy count.`, '');
  L.push('| Bangla title | Bangla author | Books | Copies each |', '|---|---|---|---|');
  for (const d of dups.sort((a, b) => b.length - a.length || (a[0].title_bangla || '').localeCompare(b[0].title_bangla || ''))) {
    L.push(`| ${mdEsc(d[0].title_bangla)} | ${mdEsc(d[0].author_bangla ?? '(blank)')} | ${d.map((b) => b.id).join(', ')} | ${d.map((b) => b.total_copies).join(', ')} |`);
  }
  L.push('');
  fs.writeFileSync(REPORT, L.join('\n'));
}

// ---------------------------------------------------------------- load

function readEnv(target) {
  const file = path.join(HERE, target === 'prod' ? '.env.prod' : '.env.local');
  if (!fs.existsSync(file)) throw new Error(`${file} not found. Copy .env.example and fill it in.`);
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error(`${file} needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY`);
  return env;
}

async function load(books, totals, target) {
  const { createClient } = await import('@supabase/supabase-js');
  const env = readEnv(target);
  console.log(`load: target=${target} url=${env.SUPABASE_URL}`);
  if (target === 'local' && !/127\.0\.0\.1|localhost/.test(env.SUPABASE_URL)) throw new Error('--target local but SUPABASE_URL is not localhost; refusing.');
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  // safety: never overwrite a catalogue that is already in use
  const inUse = await sb.from('books').select('id', { count: 'exact', head: true }).or('issued_copies.gt.0,reserved_copies.gt.0');
  if (inUse.error) throw new Error(`books table check failed: ${inUse.error.message} (${inUse.error.code ?? ''}) ${inUse.error.hint ?? ''}`);
  if (inUse.count > 0) throw new Error(`${inUse.count} books already have issued/reserved copies. This import would reset them to 0; refusing.`);

  const bucket = await sb.storage.getBucket('covers');
  if (bucket.error) throw new Error(`storage bucket 'covers' not found: ${bucket.error.message}. Apply the migrations first.`);

  // 1) covers
  const withCover = books.filter((b) => b.thumbnail);
  const limit = pLimit(UPLOAD_CONCURRENCY);
  let up = 0; const upFail = [];
  await Promise.all(withCover.map((b) => limit(async () => {
    const body = fs.readFileSync(path.join(COVERS_DIR, b.thumbnail));
    const { error } = await sb.storage.from('covers').upload(b.thumbnail, body, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
    if (error) upFail.push(`${b.id}: ${error.message}`); else up++;
    if ((up + upFail.length) % 250 === 0) console.log(`  uploaded ${up}/${withCover.length} (${upFail.length} failed)`);
  })));
  console.log(`covers uploaded: ${up}, failed: ${upFail.length}`);
  if (upFail.length) {
    console.log(upFail.slice(0, 20).join('\n'));
    const failedIds = new Set(upFail.map((s) => s.split(':')[0]));
    for (const b of books) if (failedIds.has(b.id)) b.thumbnail = null;
  }

  // 2) rows
  for (let i = 0; i < books.length; i += UPSERT_BATCH) {
    const batch = books.slice(i, i + UPSERT_BATCH).map((b) => ({ ...b }));
    const { error } = await sb.from('books').upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`upsert rows ${i + 1}-${i + batch.length}: ${error.message} (${error.code ?? ''}) ${error.details ?? ''} ${error.hint ?? ''}`);
    console.log(`  upserted ${Math.min(i + UPSERT_BATCH, books.length)}/${books.length}`);
  }

  // 3) verify
  const importIds = new Set(books.map((b) => b.id));
  let count = 0, sum = 0, extra = 0;
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('books').select('id,total_copies').order('id').range(from, from + 999);
    if (error) throw new Error(`verify: ${error.message}`);
    for (const r of data) { count++; if (importIds.has(r.id)) sum += r.total_copies; else extra++; }
    if (data.length < 1000) break;
  }
  const imported = count - extra;
  console.log(`verify: ${imported} imported rows (+${extra} other rows in table), sum(total_copies) of imported rows = ${sum}`);
  if (imported !== EXPECTED_ROWS || sum !== totals.importedCopies) {
    throw new Error(`VERIFY FAILED: expected ${EXPECTED_ROWS} rows / ${totals.importedCopies} copies`);
  }
  console.log(`verify OK: ${EXPECTED_ROWS} rows, ${sum} copies (sheet ${totals.sheetCopies} + ${sum - totals.sheetCopies} defaulted)`);
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const M = loadMappings();
  const rows = readSheet();
  const result = normalise(rows, M);
  const totals = checkTotals(result.books);
  console.log(`parsed ${totals.rows} rows, ${totals.sheetCopies} copies in sheet, ${totals.importedCopies} imported`);
  if (totals.problems.length) {
    console.error(`ABORT: ${totals.problems.join('; ')}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  if (args.mode === 'covers') await downloadCovers(result.books, M);
  const manifest = attachThumbnails(result.books);

  fs.writeFileSync(BOOKS_JSON, JSON.stringify(result.books, null, 1));
  writeReport(result, totals, manifest, args.mode);
  console.log(`wrote ${path.relative(HERE, BOOKS_JSON)} and ${path.relative(HERE, REPORT)}`);

  if (args.mode === 'load') await load(result.books, totals, args.target);
}

main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exit(1); });
