"""
Figma export -> React page generator for the Noholi site.

Reads design-export/design-tree.json (written by figma-export-plugin) and emits a
React component + CSS file for one page frame, with exact padding / gap / sizing /
colour / type values. Shared chrome (header, notice banner, footer) is skipped —
it lives in src/components and is rendered by the layout.

usage: python tools/gen.py <frameId> <ComponentName> <css-prefix>
"""
import json, re, sys, os, shutil
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, 'design-export')
sys.stdout.reconfigure(encoding='utf-8')

tree = json.load(open(os.path.join(EXPORT, 'design-tree.json'), encoding='utf-8'))
INDEX = {}
def _reg(n):
    INDEX[n['i']] = n
    for c in n.get('c', []): _reg(c)
for f in tree['frames']: _reg(f)

# ---------------------------------------------------------------- tokens
COLOR_TOKENS = {
    '#1a1815': '--ink', '#4a4438': '--ink-soft', '#4b463f': '--ink-muted', '#1c1c16': '--ink-deep',
    '#7a2e27': '--oxblood', '#98453c': '--oxblood-soft', '#c9bfa8': '--parchment-line', '#cdc5bc': '--stone',
    '#f7f3ea': '--paper', '#fdf9f0': '--paper-bright', '#7c766e': '--ink-faint', '#f1eee5': '--paper-dim',
    '#065f46': '--green', '#ffffff': '--white', '#000000': '--black',
}
FONT_STACKS = {
    'Source Sans 3': 'var(--font-sans)', 'Noto Serif': 'var(--font-serif)', 'Newsreader': 'var(--font-newsreader)',
    'EB Garamond': 'var(--font-garamond)', 'Work Sans': 'var(--font-work)', 'Noto Serif Bengali': 'var(--font-bengali)',
    'JetBrains Mono': 'var(--font-mono)',
    'Liberation Sans': 'Arial, Helvetica, sans-serif', 'FreeSans': 'Helvetica, Arial, sans-serif',
    'Nimbus Sans': 'Helvetica, Arial, sans-serif', 'Liberation Serif': '"Times New Roman", Times, serif',
    'Liberation Mono': '"Courier New", Courier, monospace', 'Nimbus Mono PS': '"Courier New", Courier, monospace',
    'IPAGothic': 'sans-serif', 'WenQuanYi Zen Hei': 'sans-serif',
}
# Bengali text: Figma draws FreeSans' own (narrow) Bengali glyphs, and falls back to Noto Sans
# Bengali for Latin families without Bengali. Both are self-hosted (public/fonts, Bengali range only);
# the browser's default Bengali fallback is 10-45% wider and wraps lines Figma keeps on one line.
BN_RE = re.compile('[ঀ-৿]')
FONT_STACKS_BN = {
    'FreeSans': "'Noholi FreeSans Bengali', Helvetica, Arial, sans-serif",
    'Nimbus Sans': "Helvetica, Arial, 'Noholi Sans Bengali', sans-serif",
    'Liberation Sans': "Arial, Helvetica, 'Noholi Sans Bengali', sans-serif",
    'Source Sans 3': "'Source Sans 3', 'Source Sans Pro', Arial, 'Noholi Sans Bengali', sans-serif",
    'Noto Serif': "'Noto Serif', Georgia, 'Noholi Sans Bengali', serif",
    'Newsreader': "'Newsreader', Georgia, 'Noholi Sans Bengali', serif",
    'EB Garamond': "'EB Garamond', Garamond, Georgia, 'Noholi Sans Bengali', serif",
    'Work Sans': "'Work Sans', Arial, 'Noholi Sans Bengali', sans-serif",
    'Liberation Serif': "\"Times New Roman\", Times, 'Noholi Sans Bengali', serif",
}
FONT_FACES = {
    'Noholi FreeSans Bengali': [("normal", "/fonts/FreeSans-bengali.woff2"), ("italic", "/fonts/FreeSansOblique-bengali.woff2")],
    'Noholi Sans Bengali': [("normal", "/fonts/NotoSansBengali-bengali.woff2")],
}
def font_face_css(used):
    out = []
    for fam, faces in FONT_FACES.items():
        if fam not in used: continue
        # FreeSans also carries the space glyph, so it is the primary font of its stack and the line
        # box uses FreeSans metrics as in Figma (a fallback-only face leaves U+0020 to the next font)
        rng = 'U+0020, U+00A0, ' if 'FreeSans' in fam else ''
        for style, url in faces:
            out.append("@font-face {\n  font-family: '%s';\n  font-style: %s;\n  font-weight: 100 900;\n  font-display: swap;\n"
                       "  src: url('%s') format('woff2');\n  unicode-range: %sU+0964-0965, U+0980-09FF, U+200C-200D, U+25CC;\n}\n" % (fam, style, url, rng))
    return '\n'.join(out)

def num(v):
    v = round(float(v), 2)
    return str(int(v)) if v == int(v) else str(v)

def px(v):
    return '0' if round(float(v), 2) == 0 else num(v) + 'px'

def color(c):
    """'#rrggbb' or '#rrggbb/0.6' -> CSS colour, using tokens where possible."""
    if '/' in c:
        h, a = c.split('/')
        a = float(a)
        r, g, b = int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)
        return f'rgba({r}, {g}, {b}, {num(a)})'
    tok = COLOR_TOKENS.get(c)
    return f'var({tok})' if tok else c

# ---------------------------------------------------------------- assets
SVG_NAMES = {}      # svg key -> public path
def svg_asset(key, name):
    if key in SVG_NAMES: return SVG_NAMES[key]
    base = re.sub(r'[^a-z0-9]+', '-', re.sub(r':margin|margin', '', name.lower())).strip('-')[:40] or 'icon'
    fn = f'{base}-{key}.svg'
    src = os.path.join(EXPORT, 'svg', key + '.svg')
    dst = os.path.join(ROOT, 'public', 'svg', fn)
    if not os.path.exists(dst): shutil.copyfile(src, dst)
    SVG_NAMES[key] = '/svg/' + fn
    return SVG_NAMES[key]

def svg_size(key):
    head = open(os.path.join(EXPORT, 'svg', key + '.svg'), encoding='utf-8').read(300)
    m = re.search(r'width="([\d.]+)" height="([\d.]+)"', head)
    return (float(m.group(1)), float(m.group(2))) if m else (None, None)

def image_asset(h):
    for ext in ('png', 'jpg', 'gif', 'webp'):
        src = os.path.join(EXPORT, 'images', f'{h}.{ext}')
        if os.path.exists(src):
            dst = os.path.join(ROOT, 'public', 'images', f'{h[:12]}.{ext}')
            if not os.path.exists(dst): shutil.copyfile(src, dst)
            return f'/images/{h[:12]}.{ext}'
    return None

# ---------------------------------------------------------------- routes
ROUTES = {
    'home': '/', 'browse': '/catalog', 'browse catalog': '/catalog', 'view full catalog': '/catalog',
    'catalog': '/catalog', 'contact': '/contact', 'contact us': '/contact', 'noholi books': '/noholi-books',
    'become a member': '/become-a-member', 'log in': '/login', 'login': '/login', 'about': '/about',
    'rules': '/rules', 'gallery': '/gallery', 'e-books': '/e-books', 'audio books': '/audio-books',
    'blogs': '/blogs', 'creative writings': '/creative-writings', 'book reviews': '/book-reviews',
    # breadcrumbs / back links
    'write ups': '/blogs', 'resources': '/e-books', 'library': '/catalog', 'creative writing': '/creative-writings',
    'back to all creative writings': '/creative-writings', 'back to all essays &chronicles': '/blogs',
    'back to all essays & chronicles': '/blogs', 'explore complete audio archive': '/audio-books',
    'explore complete repository': '/catalog', 'view in catalog': '/catalog', 'view index': '/catalog',
    # membership / guest actions (member-only destinations send guests to /login)
    'apply for membership': '/become-a-member', 'member log in': '/login', 'log in to borrow': '/login',
    'log in to reserve': '/login', 'log in to write a review': '/login', 'add to wishlist': '/wishlist/books',
    '+ listening shelf': '/wishlist/audio-books', 'borrow volume from stacks': '/borrow/padma-nadir-majhi',
    'submit creative writing / নতুন সাহিত্য রচনা জমা দিন': '/studio/creative-writing',
    'submit your creative writing': '/studio/creative-writing', 'write a blog post / নতুন প্রবন্ধ লিখুন': '/studio/blog',
    'have a reflection to share? submitessay': '/studio/blog', 'have a reflection to share? submit essay': '/studio/blog',
    'submit a book review / বই পর্যালোচনা জমা দিন': '/studio/book-review',
    # desk / enquiries
    'contact librarian': '/contact', 'inquire at desk': '/contact', 'dial desk': '/contact', 'write mail': '/contact',
    'plan your visit': '/contact', 'request physical stacks inspection': '/contact',
    'editorial guidelines & word limits §': '/rules', 'read editorial bylaws §': '/rules',
    # reading destinations (the design has one sample record per type)
    'read online': '/read/the-river-path', 'listen now': '/audio-books/the-river-path',
    'read chronicle': '/blogs/the-solitary-hour', 'read full essay': '/blogs/the-solitary-hour',
    'read critique & apparatus': '/book-reviews/padma-nadir-majhi', 'explore reading guide': '/book-reviews/padma-nadir-majhi',
    'read full poem': '/creative-writings/the-scent-of-wet-clay', 'read full story': '/creative-writings/the-scent-of-wet-clay',
    'read fullexcerpt': '/creative-writings/the-scent-of-wet-clay', 'read full excerpt': '/creative-writings/the-scent-of-wet-clay',
    'read fulltranslation': '/creative-writings/the-scent-of-wet-clay', 'read full translation': '/creative-writings/the-scent-of-wet-clay',
    'read work': '/creative-writings/the-scent-of-wet-clay', "view author's 8 folios": '/creative-writings',
    'view all folios by tanvir hossain': '/book-reviews',
}

# ---------------------------------------------------------------- helpers
def texts(n):
    if n['t'] == 'TEXT': return [n.get('tx', '')]
    out = []
    for c in n.get('c', []): out += texts(c)
    return out

def visible_children(n):
    seen, out = set(), []
    for c in n.get('c', []):
        if c.get('hid'): continue
        k = (c['n'], c['x'], c['y'], c['w'], c['h'])
        if k in seen: continue           # stacked duplicate copies in the file
        seen.add(k)
        out.append(c)
    return out

def is_chrome(n):
    name = n['n']
    if re.match(r'^(Exact Confirmed Before-Login Header|Header - |Header$|Navbar \(|Aside - TOP NOTICE)', name): return True
    if any('© 2026 Noholi Library' in t for t in texts(n)) and n['h'] < 400: return True
    return False

def slug(s):
    s = re.sub(r'→.*$', '', s)
    s = re.sub(r'^(Link|Button|Heading \d|Section|Container|Frame)\s*[-–:]\s*', '', s)
    s = re.sub(r':margin$', '', s)
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'^\d+\.\s*', '', s)
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s[:32].strip('-')

GENERIC = {'', 'container', 'text', 'frame', 'svg', 'margin', 'link', 'button', 'background', 'group', 'div', 'rectangle', 'vector'}

def tag_for(n):
    name = n['n']
    if re.match(r'^Heading ([1-6])', name):
        if all(c['t'] == 'TEXT' for c in visible_children(n)): return 'h' + re.match(r'^Heading ([1-6])', name).group(1)
    if re.match(r'^(Link|.*→ Link)', name) or name.startswith('Link'): return 'a'
    if re.match(r'^Button', name): return 'button'
    if name == 'Paragraph' and all(c['t'] == 'TEXT' for c in visible_children(n)): return 'p'
    if re.match(r'^Input', name): return 'input'
    if re.match(r'^Textarea', name): return 'textarea'
    if re.match(r'^Form', name): return 'form'
    if re.match(r'^(Section|Main)', name): return 'section'
    if re.match(r'^(Nav|Navigation)', name): return 'nav'
    if re.match(r'^(List)$', name): return 'ul'
    if re.match(r'^(Item)$', name): return 'li'
    if re.match(r'^Article', name): return 'article'
    if re.match(r'^Label$', name) and all(c['t'] == 'TEXT' for c in visible_children(n)): return 'label'
    return 'div'

# ---------------------------------------------------------------- css
def fills_css(fills, d, is_text=False):
    if not fills: return
    if is_text:
        f = fills[-1]
        if isinstance(f, str): d['color'] = color(f)
        return
    layers = []
    for f in reversed(fills):  # css = top first
        if isinstance(f, str):
            layers.append(('solid', color(f)))
        elif 'img' in f:
            url = image_asset(f['img'])
            size = {'FILL': 'cover', 'FIT': 'contain', 'CROP': '100% 100%', 'TILE': 'auto'}.get(f.get('mode'), 'cover')
            layers.append(('img', f"url('{url}') center / {size} {'repeat' if f.get('mode') == 'TILE' else 'no-repeat'}"))
        elif 'g' in f:
            stops = ', '.join(f"{color(s[0]) if s[1] >= 0.999 else color(s[0] + '/' + str(s[1]))} {num(s[2] * 100)}%" for s in f['s'])
            kind = 'radial-gradient(circle, ' if 'RADIAL' in f['g'] else 'linear-gradient(180deg, '
            layers.append(('grad', kind + stops + ')'))
    if len(layers) == 1 and layers[0][0] == 'solid':
        d['background-color'] = layers[0][1]
        return
    parts = []
    for i, (k, v) in enumerate(layers):
        if k == 'solid':
            if i == len(layers) - 1: parts.append(v); continue
            v = f'linear-gradient({v}, {v})'
            # an opaque solid on top hides everything under it
            parts.append(v)
            if not v.startswith('linear-gradient(rgba'): break
        else:
            parts.append(v)
    if len(parts) == 1 and not parts[0].startswith(('url', 'linear', 'radial')):
        d['background-color'] = parts[0]
    else:
        d['background'] = ', '.join(parts)

def inner_border(n):
    """(top, left) widths of the CSS border border_css() draws for n (0 when none / outside)."""
    st = n.get('st')
    if not st or n.get('sa') == 'OUTSIDE': return (0, 0)
    sw = n.get('sw', 1)
    if isinstance(st[-1], dict) and not isinstance(sw, list): return (0, 0)
    if not isinstance(st[-1], (str, dict)): return (0, 0)
    return (sw[0], sw[3]) if isinstance(sw, list) else (sw, sw)

def border_css(n, d):
    st = n.get('st')
    if not st: return
    sw = n.get('sw', 1)
    if isinstance(st[-1], dict) and 'g' in st[-1] and isinstance(sw, list):
        # gradient stroke with an accent side (e.g. 4px left rule): accent side takes the
        # first stop, the hairline sides the last stop
        stops = st[-1]['s']
        hi = max(sw)
        style = 'dashed' if n.get('dash') else 'solid'
        for side, w in zip(('top', 'right', 'bottom', 'left'), sw):
            if w: d[f'border-{side}'] = f"{px(w)} {style} {color(stops[0][0] if w == hi and sw.count(hi) == 1 else stops[-1][0])}"
        return
    if not isinstance(st[-1], str): return
    c = color(st[-1])
    style = 'dashed' if n.get('dash') else 'solid'
    if n.get('sa') == 'OUTSIDE':
        w = sw if not isinstance(sw, list) else max(sw)
        d['box-shadow'] = f'0 0 0 {px(w)} {c}'
        return
    if isinstance(sw, list):
        for side, w in zip(('top', 'right', 'bottom', 'left'), sw):
            if w: d[f'border-{side}'] = f'{px(w)} {style} {c}'
    elif sw:
        d['border'] = f'{px(sw)} {style} {c}'

def effects_css(n, d):
    shadows = []
    for e in n.get('fx', []):
        if 'SHADOW' in e[0]:
            _, h, a, x, y, r, s = e
            inset = 'inset ' if e[0] == 'INNER_SHADOW' else ''
            shadows.append(f"{inset}{px(x)} {px(y)} {px(r)} {px(s)} {color(h + '/' + str(a)) if a < 1 else color(h)}")
        elif e[0] == 'LAYER_BLUR': d['filter'] = f'blur({px(e[1] / 2)})'
        elif e[0] == 'BACKGROUND_BLUR': d['backdrop-filter'] = f'blur({px(e[1] / 2)})'
    if shadows:
        d['box-shadow'] = ', '.join(shadows + ([d['box-shadow']] if 'box-shadow' in d else []))

JUSTIFY = {'MIN': 'flex-start', 'CENTER': 'center', 'MAX': 'flex-end', 'SPACE_BETWEEN': 'space-between'}
ALIGN = {'MIN': 'flex-start', 'CENTER': 'center', 'MAX': 'flex-end', 'BASELINE': 'baseline'}

def newline_ws(t):
    """white-space for a text with explicit line breaks: when Figma drew exactly those lines, don't let
    the (slightly wider) browser text re-wrap them; when Figma wrapped further itself, allow wrapping."""
    f = t.get('font') or (t.get('segs') or [{}])[0]
    lh, z = f.get('lh', 'auto'), f.get('z', 0)
    lh = float(lh[:-2]) if lh.endswith('px') else float(lh[:-1]) / 100 * z if lh.endswith('%') else None
    if not lh: return 'pre-line'
    return 'pre' if round(t['h'] / lh) == t.get('tx', '').count('\n') + 1 else 'pre-line'

def text_css(font, d, ta=None, tx=''):
    stack = FONT_STACKS_BN.get(font['f']) if tx and BN_RE.search(tx) else None
    d['font-family'] = stack or FONT_STACKS.get(font['f'], f"'{font['f']}', sans-serif")
    d['font-size'] = px(font['z'])
    d['font-weight'] = str(font['wt'])
    if 'Italic' in font['s']: d['font-style'] = 'italic'
    d['line-height'] = 'normal' if font['lh'] == 'auto' else (num(float(font['lh'][:-1]) / 100) if font['lh'].endswith('%') else font['lh'].replace('.0px', 'px'))
    if 'ls' in font:
        v = font['ls']
        d['letter-spacing'] = (num(float(v[:-1]) / 100) + 'em') if v.endswith('%') else px(float(v[:-2]))
    if font.get('tc') == 'UPPER': d['text-transform'] = 'uppercase'
    elif font.get('tc') == 'LOWER': d['text-transform'] = 'lowercase'
    elif font.get('tc') == 'TITLE': d['text-transform'] = 'capitalize'
    if font.get('td') == 'UNDERLINE': d['text-decoration'] = 'underline'
    elif font.get('td') == 'STRIKETHROUGH': d['text-decoration'] = 'line-through'
    if font.get('c'): fills_css(font['c'], d, is_text=True)
    if ta:
        align = {'LEFT': None, 'CENTER': 'center', 'RIGHT': 'right', 'JUSTIFIED': 'justify'}[ta[0]]
        if align: d['text-align'] = align

def grid_css(n, d):
    kids = [c for c in visible_children(n) if not c.get('abs')]
    if not kids: return
    xs = sorted({round(c['x']) for c in kids})
    widths = [max(c['w'] for c in kids if round(c['x']) == x) for x in xs]
    col_gap = (xs[1] - (xs[0] + widths[0])) if len(xs) > 1 else 0
    row_gap = 0
    p = n['al']['p']
    # rows = cells whose vertical extents overlap (a centred cell sits at its own y)
    rows = []
    for c in sorted(kids, key=lambda c: c['y']):
        if rows and c['y'] < rows[-1][1] - 0.5:
            rows[-1][1] = max(rows[-1][1], c['y'] + c['h']); rows[-1][2].append(c)
        else:
            rows.append([c['y'], c['y'] + c['h'], [c]])
    if len(rows) == 1:
        for c in kids: c['_grow'] = (p[0], n['h'] - p[0] - p[2])
    else:
        # Figma row tracks can be taller than their cards (cards 324 in 327.5 rows, 24 gaps):
        # prefer the column gap when it fits, and give each row its track height
        between = [rows[i + 1][0] - rows[i][1] for i in range(len(rows) - 1)]
        row_gap = col_gap if col_gap > 0.5 and all(b >= col_gap - 0.5 for b in between) else max(0, min(between))
        tracks = []
        for i, (top, bot, members) in enumerate(rows):
            end = rows[i + 1][0] - row_gap if i + 1 < len(rows) else max(bot, n['h'] - p[2])
            tracks.append(end - top)
            for c in members: c['_grow'] = (top, end - top)
        if any(abs(t - (r[1] - r[0])) > 0.5 for t, r in zip(tracks, rows)):
            d['grid-template-rows'] = ' '.join(f'minmax({px(t)}, auto)' for t in tracks)
    d['display'] = 'grid'
    gaps = [xs[i + 1] - (xs[i] + widths[i]) for i in range(len(xs) - 1)]
    if gaps and max(gaps) - min(gaps) > 0.5:
        # uneven column gaps (e.g. 24px then 0): gap tracks of their own, cells placed explicitly
        tracks, col = [], {}
        for i, x in enumerate(xs):
            col[x] = len(tracks) + 1
            tracks.append(f'minmax(0, {num(widths[i])}fr)')
            if i < len(gaps) and gaps[i] > 0.5: tracks.append(px(gaps[i]))
        for c in kids: c['_gcol'] = col[round(c['x'])]
        d['grid-template-columns'] = ' '.join(tracks)
        col_gap = 0
    elif len(set(round(w) for w in widths)) == 1:
        d['grid-template-columns'] = f'repeat({len(xs)}, minmax(0, 1fr))'
    else:
        d['grid-template-columns'] = ' '.join(f'minmax(0, {num(w)}fr)' for w in widths)
    if len(rows) == 1: d['height'] = px(n['h'])   # Figma lets a 1-row grid be shorter than its content
    if col_gap > 0.5: d['column-gap'] = px(col_gap)
    if row_gap > 0.5: d['row-gap'] = px(row_gap)
    if any(p): d['padding'] = ' '.join(px(v) for v in p)

def node_css(n, parent, root_child=False):
    d = OrderedDict()
    al = n.get('al')
    is_text = n['t'] == 'TEXT'
    p_al = parent.get('al') if parent else None

    # ---- position / size relative to parent
    if root_child and n.get('_abs_top') is not None:
        # a layer laid over another section (e.g. breadcrumb text over an empty bar)
        d['position'] = 'absolute'
        d['left'] = px(n['x']); d['top'] = px(n['_abs_top']); d['width'] = px(n['w'])
        if not n.get('al'): d['height'] = px(n['h'])
    elif root_child:
        d['width'] = '100%'
        # page frames are free-form: keep the empty space Figma leaves above each section
        if abs(n.get('_mt', 0)) > 0.01: d['margin-top'] = px(n['_mt'])
        # a section frame on the free-form page keeps its drawn height even if its content is shorter
        if n['t'] != 'TEXT' and n.get('sz', ['FIXED', 'FIXED'])[1] == 'FIXED': d['min-height'] = px(n['h'])
    elif p_al is None or n.get('abs') or (p_al and p_al['m'] == 'GRID' and False):
        if p_al is None and parent is not None:
            d['position'] = 'absolute'
            d['left'] = px(n['x']); d['top'] = px(n['y'])
            if not (is_text and n['ta'][2] == 'WIDTH_AND_HEIGHT'): d['width'] = px(n['w'])
            if not is_text: d['height'] = px(n['h'])
        elif n.get('abs'):
            d['position'] = 'absolute'
            d['left'] = px(n['x']); d['top'] = px(n['y'])
            d['width'] = px(n['w']); d['height'] = px(n['h'])
    elif p_al['m'] == 'GRID':
        if n.get('_gcol'): d['grid-column'] = str(n['_gcol'])
        # grid cell stretches by default; a hug-height cell shorter than its row is placed by
        # its Figma offset (the export has no cell alignment, so infer start / center / end)
        if n.get('sz', ['', ''])[1] != 'FILL' and n.get('_grow'):
            top, rh = n['_grow']                 # this cell's row track (set by grid_css)
            free, off = rh - n['h'], n['y'] - top
            if free < -1:
                # taller than its row: Figma lets it overflow (e.g. 3px above the row top)
                d['align-self'] = 'start'
                if abs(off) > 0.5: d['margin-top'] = px(off)
            elif abs(free) > 1:
                if abs(off) < 1: d['align-self'] = 'start'
                elif abs(off - free / 2) < 1.5: d['align-self'] = 'center'
                elif abs(off - free) < 1.5: d['align-self'] = 'end'
                elif free > 0:
                    d['align-self'] = 'start'
                    if off > 0.5: d['margin-top'] = px(off)
    else:
        sz = n.get('sz', ['FIXED', 'FIXED'])
        horiz = p_al['m'] == 'HORIZONTAL'
        main, cross = (sz[0], sz[1]) if horiz else (sz[1], sz[0])
        main_dim, cross_dim = ('width', 'height') if horiz else ('height', 'width')
        main_val, cross_val = (n['w'], n['h']) if horiz else (n['h'], n['w'])
        if main == 'FIXED':
            if not (is_text and main_dim == 'height'): d[main_dim] = px(main_val)
            d['flex-shrink'] = '0'
        elif main == 'FILL':
            d['flex'] = '1 1 0'
            d['min-' + main_dim] = '0'
        else:
            d['flex-shrink'] = '0'
        if cross == 'FIXED':
            if not (is_text and cross_dim == 'height'): d[cross_dim] = px(cross_val)
        elif cross == 'FILL':
            d['align-self'] = 'stretch'
    for k in ('maxWidth', 'minWidth', 'maxHeight', 'minHeight'):
        if k in n:
            d[re.sub(r'([A-Z])', r'-\1', k).lower()] = px(n[k])

    if n.get('rot') and n['t'] != 'GROUP':   # a group's children already carry the rotation
        # absolutely placed: Figma x/y is the rotated corner; in auto-layout: rotate in place
        d['transform-origin'] = '0 0' if d.get('position') == 'absolute' else 'center'
        d['transform'] = f"rotate({num(-n['rot'])}deg)"

    # ---- own layout
    if al and not is_text:
        # absolutely placed children (Figma "ignore auto layout") are positioned against this box
        if any(c.get('abs') for c in visible_children(n)) and 'position' not in d: d['position'] = 'relative'
        if al['m'] == 'GRID':
            grid_css(n, d)
        else:
            d['display'] = 'flex'
            if al['m'] == 'VERTICAL': d['flex-direction'] = 'column'
            if al.get('wrap'): d['flex-wrap'] = 'wrap'
            if al['pa'] != 'MIN': d['justify-content'] = JUSTIFY[al['pa']]
            d['align-items'] = ALIGN.get(al['ca'], 'flex-start')
            if al['gap'] and al['pa'] != 'SPACE_BETWEEN': d['gap'] = px(al['gap']) if not al.get('wrap') else f"{px(al.get('cgap', 0))} {px(al['gap'])}"
            elif al.get('wrap') and al.get('cgap'): d['row-gap'] = px(al['cgap'])
            p = al['p']
            if n.get('_center') and p[1] and p[1] == p[3]:
                # page-level section: grow the side padding past 1280px so content
                # stays in the same centred 1280px column as the header and footer
                side = f"max({px(p[1])}, calc((100% - {num(1280 - 2 * p[1])}px) / 2))"
                d['padding'] = f"{px(p[0])} {side} {px(p[2])}"
            elif any(p): d['padding'] = ' '.join(px(v) for v in p) if len(set(p)) > 1 else px(p[0])
    elif not is_text and n.get('c') and not n.get('svg'):
        d.setdefault('position', 'relative')
        if 'width' not in d and not root_child: d['width'] = px(n['w'])
        if 'height' not in d: d['height'] = px(n['h'])

    # ---- paint
    if is_text:
        if n.get('font'): text_css(n['font'], d, n['ta'], n.get('tx', ''))
        elif n.get('segs'):
            text_css(n['segs'][0], d, n['ta'], n.get('tx', ''))
        tx_ = n.get('tx', '')
        edge_space = tx_ != tx_.strip(' ')   # a flex item drops its edge spaces unless whitespace is preserved
        if n['ta'][2] == 'WIDTH_AND_HEIGHT': d['white-space'] = 'pre' if edge_space else 'nowrap'
        elif '\n' in tx_: d['white-space'] = newline_ws(n)
        elif edge_space: d['white-space'] = 'pre-wrap'
        # Figma sizes an auto-height text box to ceil(lines x line-height) (5 x 27.63 -> 139);
        # the browser uses the exact sum, so long pages drift ~1px per paragraph without this
        if n['ta'][2] in ('HEIGHT', 'WIDTH_AND_HEIGHT') and 'height' not in d: d['min-height'] = px(n['h'])
        elif n['ta'][2] == 'NONE':
            # fixed-size text box: Figma keeps the box size and centres the lines in it (they may overflow)
            d['height'] = px(n['h'])
            if n['ta'][1] in ('CENTER', 'BOTTOM'):
                d['display'] = 'flex'; d['flex-direction'] = 'column'
                d['justify-content'] = 'center' if n['ta'][1] == 'CENTER' else 'flex-end'
    else:
        fills_css(n.get('fill'), d)
        border_css(n, d)
        if n.get('r') is not None:
            r = n['r']
            d['border-radius'] = ' '.join(px(v) for v in r) if isinstance(r, list) else px(r)
        effects_css(n, d)
        if n.get('clip'): d['overflow'] = 'hidden'
    # an empty frame has no content to size it: keep its Figma height unless the parent stretches it
    if not is_text and not n.get('svg') and not visible_children(n) and 'height' not in d:
        stretched = (p_al and p_al['m'] == 'VERTICAL' and d.get('flex') == '1 1 0') or \
                    (p_al and p_al['m'] == 'HORIZONTAL' and d.get('align-self') == 'stretch') or \
                    (p_al and p_al['m'] == 'GRID' and not root_child)
        if not stretched: d['height'] = px(n['h'])
    if n.get('op') is not None: d['opacity'] = num(n['op'])
    if n.get('blend'): d['mix-blend-mode'] = n['blend'].lower().replace('_', '-')
    return d

# ---------------------------------------------------------------- emitter
class Page:
    def __init__(self, prefix):
        self.prefix = prefix
        self.rules = OrderedDict()   # class -> decl dict
        self.used = {}
        self.needs_link = False
        self.interactive = 0          # >0 while emitting inside an <a>/<button> (no nesting allowed)

    def cls(self, n, parent_cls, decls):
        base = slug(n['n'])
        if base in GENERIC or base.isdigit():
            base = (parent_cls.replace(self.prefix + '-', '', 1) if parent_cls else 'root') + '-' + {'TEXT': 'text'}.get(n['t'], 'box')
        name = f'{self.prefix}-{base}'
        # reuse an existing class if declarations are identical
        key = json.dumps(decls)
        if name in self.rules and json.dumps(self.rules[name]) == key: return name
        i = 2
        cand = name
        while cand in self.rules:
            if json.dumps(self.rules[cand]) == key: return cand
            cand = f'{name}-{i}'; i += 1
        self.rules[cand] = decls
        return cand

    def text_children(self, n):
        segs = n.get('segs')
        tx = n.get('tx', '')
        if not segs:
            return jsx_text(tx)
        base = segs[0]
        out = []
        for s in segs:
            piece = jsx_text(tx[s['a']:s['b']])
            diff = OrderedDict()
            text_css(s, diff, None, tx)
            ref = OrderedDict(); text_css(base, ref, None, tx)
            delta = OrderedDict((k, v) for k, v in diff.items() if ref.get(k) != v)
            if delta:
                # a run in another font would sit on the shared baseline and stretch the line box
                # past the fixed line-height (Figma keeps every line at exactly line-height)
                if ('font-family' in delta or 'font-size' in delta) and diff.get('line-height') != 'normal':
                    delta['vertical-align'] = 'top'
                c = self.cls({'n': 'span', 't': 'TEXT'}, None, delta)
                out.append(f'<span className="{c}">{piece}</span>')
            else:
                out.append(piece)
        return ''.join(out)

    def emit(self, n, parent, depth, parent_cls='', root_child=False):
        out = self._emit(n, parent, depth, parent_cls, root_child)
        if os.environ.get('GEN_DEBUG'):   # tag each element with its Figma node id (tools/boxes.py)
            out = out.replace('className=', f'data-f="{n["i"]}" className=', 1)
        return out

    def _emit(self, n, parent, depth, parent_cls='', root_child=False):
        ind = '  ' * depth
        decls = node_css(n, parent, root_child)
        if n['t'] == 'TEXT':
            name_is_link = n['n'].startswith('Link') and not self.interactive
            tag = 'span'
            c = self.cls(n, parent_cls, decls)
            inner = self.text_children(n)
            if decls.get('display') == 'flex' and '<' in inner: inner = f'<span>{inner}</span>'
            if name_is_link:
                return ind + self.link_open(n, c) + inner + '</Link>' if self.route_for(n) else ind + f'<a href="#" className="{c}">{inner}</a>'
            return ind + f'<{tag} className="{c}">{inner}</{tag}>'

        if n.get('svg'):
            src = svg_asset(n['svg'], n['n'])
            decls.pop('overflow', None)
            decls['display'] = 'block'
            # Figma grows the exported SVG to include strokes (a 0px-tall line becomes 3px tall),
            # so size the <img> from the file and pull it back by half the difference.
            sw_, sh_ = svg_size(n['svg'])
            w, h = (sw_ or n['w']), (sh_ or n['h'])
            dx, dy = (w - n['w']) / 2, (h - n['h']) / 2
            decls['width'] = px(w); decls['height'] = px(h)
            if n.get('rot') and decls.get('position') == 'absolute':
                # the SVG is exported already rotated: place it at the rotated node's bounding box
                import math
                t = math.radians(-n['rot'])
                ux, uy = math.cos(t) * n['w'], math.sin(t) * n['w']
                vx, vy = -math.sin(t) * n['h'], math.cos(t) * n['h']
                bx = n['x'] + min(0, ux, vx, ux + vx); by = n['y'] + min(0, uy, vy, uy + vy)
                bw = max(0, ux, vx, ux + vx) - min(0, ux, vx, ux + vx); bh = max(0, uy, vy, uy + vy) - min(0, uy, vy, uy + vy)
                decls.pop('transform', None); decls.pop('transform-origin', None)
                decls['left'] = px(bx - (w - bw) / 2); decls['top'] = px(by - (h - bh) / 2)
            elif abs(dx) > 0.01 or abs(dy) > 0.01:
                if decls.get('position') == 'absolute':
                    decls['left'] = px(n['x'] - dx); decls['top'] = px(n['y'] - dy)
                else:
                    decls['margin'] = f'{px(-dy)} {px(-dx)}'
            for k in ('padding', 'flex-direction', 'align-items', 'justify-content', 'gap', 'background-color', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left'):
                decls.pop(k, None)
            c = self.cls(n, parent_cls, decls)
            return ind + f'<img className="{c}" src="{src}" alt="" width="{num(w)}" height="{num(h)}" />'

        kids = visible_children(n)
        # frame whose only paint is an image and which has no children -> <img>
        fills = n.get('fill') or []
        if not kids and len(fills) == 1 and isinstance(fills[0], dict) and 'img' in fills[0]:
            src = image_asset(fills[0]['img'])
            decls.pop('background', None)
            decls['display'] = 'block'; decls['width'] = px(n['w']); decls['height'] = px(n['h']); decls['object-fit'] = 'cover'
            c = self.cls(n, parent_cls, decls)
            alt = re.sub(r'^Link - |→.*$', '', n['n']).strip()
            return ind + f'<img className="{c}" src="{src}" alt="{alt}" />'

        tag = tag_for(n)
        if tag in ('a', 'button') and self.interactive: tag = 'div'   # a link inside a link/button
        # form fields: keep the box styling, carry the placeholder text styling onto the field
        if tag in ('input', 'textarea'):
            ph = [k for k in all_texts_nodes(n)]
            if ph:
                t = ph[0]
                text_css(t.get('font') or t['segs'][0], decls, None, t.get('tx', ''))
                ph_color = decls.pop('color', None)
                # a form field is drawn at a fixed size (a textarea would otherwise add a second row)
                if 'height' not in decls and 'flex' not in decls: decls['height'] = px(n['h'])
                c = self.cls(n, parent_cls, decls)
                if ph_color: self.rules[c + '::placeholder'] = OrderedDict([('color', ph_color), ('opacity', '1')])
                decls['outline'] = 'none'
                attr = f'placeholder="{esc_attr(t.get("tx", ""))}"'
                typ = ' type="password"' if '•' in t.get('tx', '') else ''
                if tag == 'textarea':
                    return ind + f'<textarea className="{c}" {attr} />'
                return ind + f'<input className="{c}"{typ} {attr} />'
            tag = 'div'

        # single text child: fold the text into this element
        if len(kids) == 1 and kids[0]['t'] == 'TEXT' and tag != 'div' and not kids[0].get('abs'):
            t = kids[0]
            tsz = t.get('sz', ['HUG', 'HUG'])
            al = n.get('al')
            if al and al['m'] != 'GRID' and (tsz == ['HUG', 'HUG'] or (al['m'] == 'VERTICAL' and tsz[0] == 'FILL')):
                td = OrderedDict(); text_css(t.get('font') or t['segs'][0], td, t['ta'], t.get('tx', ''))
                ttx = t.get('tx', '')
                if t['ta'][2] == 'WIDTH_AND_HEIGHT': td['white-space'] = 'pre' if ttx != ttx.strip(' ') else 'nowrap'
                elif '\n' in ttx: td['white-space'] = newline_ws(t)
                elif ttx != ttx.strip(' '): td['white-space'] = 'pre-wrap'
                if tsz[0] == 'FILL' and al['m'] == 'VERTICAL': decls['align-items'] = 'stretch'
                decls.update(td)
                if 'height' not in decls and t['ta'][2] in ('HEIGHT', 'WIDTH_AND_HEIGHT'): decls['min-height'] = px(n['h'])
                c = self.cls(n, parent_cls, decls)
                inner = self.text_children(t)
                # styled runs / line breaks inside a flex box would each become a flex item: keep them in one line box
                if '<' in inner: inner = f'<span>{inner}</span>'
                return ind + self.open_tag(tag, n, c, t) + inner + self.close_tag(tag, n, t)

        c = self.cls(n, parent_cls, decls)
        if not kids:
            return ind + f'<div className="{c}" />' if tag in ('div', 'section', 'a', 'button', 'nav') else ind + self.open_tag(tag, n, c, None) + self.close_tag(tag, n, None)
        lines = [ind + self.open_tag(tag, n, c, None)]
        if tag in ('a', 'button'): self.interactive += 1
        for k in kids:
            if n['t'] == 'GROUP':
                # group children are positioned in the group's parent space
                # (keep raw frame-space coords so nested groups subtract the right origin)
                ox, oy = n.get('_rx', n['x']), n.get('_ry', n['y'])
                k = dict(k, x=k['x'] - ox, y=k['y'] - oy, _rx=k['x'], _ry=k['y'])
            elif (not n.get('al') or k.get('abs')) and any(inner_border(n)):
                # Figma measures a placed child from the frame's outer edge, CSS from inside the border
                bt, bl = inner_border(n)
                k = dict(k, x=k['x'] - bl, y=k['y'] - bt, _rx=k.get('_rx', k['x']), _ry=k.get('_ry', k['y']))
            lines.append(self.emit(k, n, depth + 1, c))
        if tag in ('a', 'button'): self.interactive -= 1
        lines.append(ind + self.close_tag(tag, n, None))
        return '\n'.join(lines)

    def route_for(self, n, text_node=None):
        label = (text_node or n).get('tx') if (text_node or n)['t'] == 'TEXT' else None
        if label is None:
            ts = texts(n)
            label = ts[0] if ts else ''
        key = re.sub(r'[→›\s]+$', '', label.strip().lower())
        if key in ROUTES or (text_node or n)['t'] == 'TEXT': return ROUTES.get(key)
        whole = re.sub(r'[→›\s]+$', '', re.sub(r'\s+', ' ', ' '.join(texts(n))).strip().lower())
        return ROUTES.get(whole)

    def link_open(self, n, c, text_node=None):
        self.needs_link = True
        return f'<Link to="{self.route_for(n, text_node)}" className="{c}">'

    def open_tag(self, tag, n, c, text_node):
        if tag == 'a':
            r = self.route_for(n, text_node)
            if r:
                self.needs_link = True
                return f'<Link to="{r}" className="{c}">'
            return f'<a href="#" className="{c}">'
        if tag == 'button':
            r = self.route_for(n, text_node)
            if r:   # a button that only navigates is a link
                self.needs_link = True
                return f'<Link to="{r}" className="{c}">'
            return f'<button type="button" className="{c}">'
        if tag == 'form': return f'<form className="{c}" onSubmit={{(e) => e.preventDefault()}}>'
        return f'<{tag} className="{c}">'

    def close_tag(self, tag, n, text_node):
        if tag in ('a', 'button') and self.route_for(n, text_node): return '</Link>'
        return f'</{tag}>'

def all_texts_nodes(n):
    if n['t'] == 'TEXT': return [n]
    out = []
    for c in n.get('c', []): out += all_texts_nodes(c)
    return out

def jsx_text(s):
    s = s.replace('{', '&#123;').replace('}', '&#125;').replace('<', '&lt;').replace('>', '&gt;')
    parts = s.split('\n')
    return '<br />'.join(p if not (p.startswith(' ') or p.endswith(' ')) else '{' + json.dumps(p) + '}' for p in parts)

def esc_attr(s):
    return s.replace('"', '&quot;')

def css_text(rules):
    out = []
    for c, d in rules.items():
        if not d: continue
        out.append(f'.{c} {{')
        for k, v in d.items(): out.append(f'  {k}: {v};')
        out.append('}\n')
    return '\n'.join(out)

def generate(frame_id, comp, prefix):
    frame = INDEX[frame_id.replace('-', ':')]
    page = Page(prefix)
    kids = sorted([k for k in visible_children(frame) if not is_chrome(k)], key=lambda k: k['y'])
    # vertical gaps between the (skipped) header, each section and the (skipped) footer
    chrome = [k for k in visible_children(frame) if is_chrome(k)]
    first_y = kids[0]['y'] if kids else 0
    # (a header drawn 1px over the first section still ends where the section starts: SiteHeader is 81px)
    prev = top0 = min(first_y, max([c['y'] + c['h'] for c in chrome if c['y'] < first_y + 1] or [0]))
    has_abs = False
    for k in kids:
        if k['y'] < prev - 0.5 and k['y'] + k['h'] <= prev + 0.5:
            k['_abs_top'] = k['y'] - top0; has_abs = True   # sits on top of an earlier section
            continue
        k['_mt'] = k['y'] - prev
        prev = max(prev, k['y'] + k['h'])
    footer_y = min([c['y'] for c in chrome if c['y'] >= prev - 1] or [prev])
    tail = footer_y - prev
    for k in kids:   # mark the first node down each section that carries side padding
        node = k
        while node.get('al') and not node['al']['p'][1] and len(visible_children(node)) == 1:
            node = visible_children(node)[0]
        if node.get('al') and node['al']['p'][1]: node['_center'] = True
    body = [page.emit(k, frame, 3, prefix, root_child=True) for k in kids]
    imports = ["import './" + comp + ".css';"]
    if page.needs_link: imports.insert(0, "import { Link } from 'react-router-dom';")
    jsx = '\n'.join(imports) + f"""

// Generated from Figma frame "{frame['n']}" ({frame['i']}) by tools/gen.py, then hand-edited.
export default function {comp}() {{
  return (
    <div className="{prefix}">
{chr(10).join(body)}
    </div>
  );
}}
"""
    os.makedirs(os.path.join(ROOT, 'src', 'pages'), exist_ok=True)
    open(os.path.join(ROOT, 'src', 'pages', comp + '.jsx'), 'w', encoding='utf-8').write(jsx)
    root_css = OrderedDict([('display', 'flex'), ('flex-direction', 'column')])
    fills_css(frame.get('fill'), root_css)
    if tail > 0.01: root_css['padding-bottom'] = px(tail)
    if has_abs: root_css['position'] = 'relative'
    css = css_text(OrderedDict([(prefix, root_css)] + list(page.rules.items())))
    css = font_face_css(css) + ('\n' if 'Noholi ' in css else '') + css
    open(os.path.join(ROOT, 'src', 'pages', comp + '.css'), 'w', encoding='utf-8').write(css)
    print(f'{comp}: {len(page.rules)} classes, {len(body)} sections')

if __name__ == '__main__':
    generate(sys.argv[1], sys.argv[2], sys.argv[3])
