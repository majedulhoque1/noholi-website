"""
Figma export -> React page generator for the Noholi site.

Reads design-export/design-tree.json (written by figma-export-plugin) and emits a
React component + CSS file for one page frame, with exact padding / gap / sizing /
colour / type values. Shared chrome (header, notice banner, footer) is skipped —
it lives in src/components and is rendered by the layout.

usage: python tools/gen_member.py <frameId> <ComponentName> <css-prefix> [--css-only]

Member-page fork of tools/gen.py. Differences (see report):
  * is_chrome() also skips "Exact Confirmed After-Login Header" and 0-height "Footer" nodes,
    and chrome is filtered at every depth (one wishlist frame nests its header inside Main).
  * vertical gaps between root-level sections (absolute frames or root auto-layout gap) are
    kept as margins, measured from the bottom of the dropped navbar to the top of the dropped footer.
  * member routes added to ROUTES.
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
    'Liberation Sans': 'Arimo, Arial, Helvetica, sans-serif', 'FreeSans': "Helvetica, Arial, 'Anek Bangla', sans-serif",
    'Nimbus Sans': 'Helvetica, Arial, sans-serif', 'Liberation Serif': 'Tinos, "Times New Roman", Times, serif',
    'Liberation Mono': 'Cousine, "Courier New", Courier, monospace', 'Nimbus Mono PS': '"Courier New", Courier, monospace',
    'IPAGothic': 'sans-serif', 'WenQuanYi Zen Hei': 'sans-serif',
}

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
    'dashboard': '/member/dashboard', 'my dashboard': '/member/dashboard', 'member dashboard': '/member/dashboard',
    'profile': '/member/profile', 'my profile': '/member/profile', 'view profile': '/member/profile',
    'edit profile': '/member/edit', 'edit personal information': '/member/edit', 'edit information': '/member/edit',
    'change password': '/member/password', 'wishlist': '/wishlist/books', 'books wishlist': '/wishlist/books',
    'e-books wishlist': '/wishlist/e-books', 'audio books wishlist': '/wishlist/audio-books',
    'write ups': '/blogs', 'write-ups': '/blogs',
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
        if is_chrome(c): continue        # member frames nest chrome below the root too
        out.append(c)
    return out

def is_chrome(n):
    name = n['n']
    if re.match(r'^(Exact Confirmed (Before|After)-Login Header|Header - |Header$|Navbar \(|Aside - TOP NOTICE)', name): return True
    if re.match(r'^Footer', name) and n['h'] == 0: return True
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

def border_css(n, d):
    st = n.get('st')
    if not st or not isinstance(st[-1], str): return
    c = color(st[-1])
    sw = n.get('sw', 1)
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

def text_css(font, d, ta=None):
    d['font-family'] = FONT_STACKS.get(font['f'], f"'{font['f']}', sans-serif")
    if font['f'] == 'FreeSans':
        # FreeSans' Bengali glyphs are much narrower than any Windows/Google Bengali face;
        # condensed Anek Bangla keeps Figma's line breaks (Latin still renders in Helvetica/Arial)
        d['font-variation-settings'] = "'wdth' 80"
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

def grid_cols(n):
    """(column xs, column widths, column gap) of a Figma grid; spanning cells are ignored for widths."""
    kids = [c for c in visible_children(n) if not c.get('abs')]
    xs = sorted({round(c['x']) for c in kids})
    widths = [min(c['w'] for c in kids if round(c['x']) == x) for x in xs]
    col_gap = (xs[1] - (xs[0] + widths[0])) if len(xs) > 1 else 0
    return xs, widths, col_gap

def grid_css(n, d):
    kids = [c for c in visible_children(n) if not c.get('abs')]
    if not kids: return
    xs, widths, col_gap = grid_cols(n)
    ys = sorted({round(c['y']) for c in kids})
    row_gaps = []
    for y0, y1 in zip(ys, ys[1:]):
        h0 = max(c['h'] for c in kids if round(c['y']) == y0)
        row_gaps.append(y1 - (y0 + h0))
    row_gap = sorted(row_gaps)[len(row_gaps) // 2] if row_gaps else 0
    d['display'] = 'grid'
    if len(set(round(w) for w in widths)) == 1:
        d['grid-template-columns'] = f'repeat({len(xs)}, minmax(0, 1fr))'
    else:
        d['grid-template-columns'] = ' '.join(f'minmax(0, {num(w)}fr)' for w in widths)
    if len(kids) <= len(xs): d['height'] = px(n['h'])   # Figma lets a 1-row grid be shorter than its content
    elif max(c['y'] + c['h'] for c in kids) + n['al']['p'][2] > n['h'] + 0.5:
        d['height'] = px(n['h'])   # Figma stretched the grid to a row height its content overflows
    if col_gap > 0.5: d['column-gap'] = px(col_gap)
    if row_gap > 0.5: d['row-gap'] = px(row_gap)
    p = n['al']['p']
    if any(p): d['padding'] = ' '.join(px(v) for v in p)

def node_css(n, parent, root_child=False):
    d = OrderedDict()
    al = n.get('al')
    is_text = n['t'] == 'TEXT'
    p_al = parent.get('al') if parent else None

    # ---- position / size relative to parent
    if root_child:
        d['width'] = '100%'
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
        # grid cell: Figma places the child at its own height (top of the cell) unless it fills
        xs, widths, col_gap = grid_cols(parent)
        span = 1
        ci = xs.index(round(n['x'])) if round(n['x']) in xs else 0
        acc = widths[ci] if widths else n['w']
        while ci + span < len(widths) and n['w'] > acc + 1:   # spans columns until its width is covered
            acc += col_gap + widths[ci + span]; span += 1
        if span > 1: d['grid-column'] = f'span {span}'
        # layer order in Figma need not be reading order (e.g. a cover drawn after the text but
        # placed left of it): pin the cell explicitly when auto-placement would get it wrong
        gk = [c for c in visible_children(parent) if not c.get('abs')]
        if [c['i'] for c in gk] != [c['i'] for c in sorted(gk, key=lambda c: (round(c['y']), round(c['x'])))]:
            ys = sorted({round(c['y']) for c in gk})
            col = xs.index(round(n['x'])) + 1 if round(n['x']) in xs else 1
            d['grid-column'] = f'{col} / span {span}'
            d['grid-row'] = str(ys.index(round(n['y'])) + 1)
        sz = n.get('sz', ['FILL', 'FILL'])
        if sz[1] != 'FILL':
            d['align-self'] = 'start'
            if sz[1] == 'FIXED' and not is_text: d['height'] = px(n['h'])
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

    # ---- absolutely placed children inside an auto-layout frame (e.g. ":styles" background rects)
    if al and not is_text:
        vk = visible_children(n)
        if any(c.get('abs') for c in vk):
            if d.get('position') != 'absolute': d['position'] = 'relative'
            d['isolation'] = 'isolate'
    if n.get('abs') and parent is not None:
        sib = visible_children(parent)
        idx = next((i for i, c in enumerate(sib) if c is n or c.get('i') == n.get('i')), -1)
        if idx >= 0 and any(not c.get('abs') for c in sib[idx + 1:]):
            d['z-index'] = '-1'   # painted before in-flow siblings in Figma: keep it behind them

    # ---- own layout
    if al and not is_text:
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
        if n.get('font'): text_css(n['font'], d, n['ta'])
        elif n.get('segs'):
            text_css(n['segs'][0], d, n['ta'])
        if n['ta'][2] == 'WIDTH_AND_HEIGHT':
            tx = n.get('tx', '')
            # edge spaces of a flex-item text box collapse under nowrap; keep them like Figma does
            d['white-space'] = 'pre' if tx[:1].isspace() or tx[-1:].isspace() else 'nowrap'
        elif '\n' in n.get('tx', ''): d['white-space'] = 'pre-line'
    else:
        fills_css(n.get('fill'), d)
        border_css(n, d)
        if n.get('r') is not None:
            r = n['r']
            d['border-radius'] = ' '.join(px(v) for v in r) if isinstance(r, list) else px(r)
        effects_css(n, d)
        if n.get('clip'): d['overflow'] = 'hidden'
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
            text_css(s, diff)
            ref = OrderedDict(); text_css(base, ref)
            delta = OrderedDict((k, v) for k, v in diff.items() if ref.get(k) != v)
            if delta:
                c = self.cls({'n': 'span', 't': 'TEXT'}, None, delta)
                out.append(f'<span className="{c}">{piece}</span>')
            else:
                out.append(piece)
        return ''.join(out)

    def emit(self, n, parent, depth, parent_cls='', root_child=False):
        ind = '  ' * depth
        decls = node_css(n, parent, root_child)
        if n['t'] == 'TEXT':
            name_is_link = n['n'].startswith('Link')
            tag = 'span'
            c = self.cls(n, parent_cls, decls)
            inner = self.text_children(n)
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
        # form fields: keep the box styling, carry the placeholder text styling onto the field
        if tag in ('input', 'textarea'):
            ph = [k for k in all_texts_nodes(n)]
            if ph:
                t = ph[0]
                text_css(t.get('font') or t['segs'][0], decls)
                # a form control's box is its Figma box (an <input> ignores flex, a <textarea> has its own rows)
                for k in ('display', 'flex-direction', 'justify-content', 'align-items', 'gap'): decls.pop(k, None)
                decls['height'] = px(n['h'])
                if tag == 'textarea': decls['resize'] = 'none'
                ph_color = decls.get('color')
                # dark (ink) text in a field is a pre-filled value, lighter text is a placeholder
                prefilled = ph_color in ('var(--ink)', 'var(--ink-deep)', 'var(--black)')
                if not prefilled: decls.pop('color', None)
                c = self.cls(n, parent_cls, decls)
                if ph_color and not prefilled: self.rules[c + '::placeholder'] = OrderedDict([('color', ph_color), ('opacity', '1')])
                decls['outline'] = 'none'
                attr = f'{"defaultValue" if prefilled else "placeholder"}="{esc_attr(t.get("tx", ""))}"'
                if tag == 'textarea' and (len(ph) > 1 or chr(10) in t.get('tx', '')):
                    # several placeholder paragraphs: one blank line between them, like the Figma gap
                    attr = ('defaultValue' if prefilled else 'placeholder') + '={' + json.dumps((chr(10) * 2).join(k.get('tx', '') for k in ph)) + '}'
                typ = ' type="password"' if re.fullmatch(r'[•●\s]+', t.get('tx', '') or 'x') else ''
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
                td = OrderedDict(); text_css(t.get('font') or t['segs'][0], td, t['ta'])
                if t['ta'][2] == 'WIDTH_AND_HEIGHT':
                    tx = t.get('tx', '')
                    td['white-space'] = 'pre' if tx[:1].isspace() or tx[-1:].isspace() else 'nowrap'
                if tsz[0] == 'FILL' and al['m'] == 'VERTICAL': decls['align-items'] = 'stretch'
                decls.update(td)
                c = self.cls(n, parent_cls, decls)
                inner = self.text_children(t)
                if '<span' in inner: inner = f'<span>{inner}</span>'   # keep styled runs inline (one flex item)
                return ind + self.open_tag(tag, n, c, t) + inner + self.close_tag(tag, n, t)

        c = self.cls(n, parent_cls, decls)
        al_ = n.get('al')
        if al_ and al_['m'] in ('VERTICAL', 'HORIZONTAL') and al_['gap'] < 0 and not al_.get('wrap') and al_['pa'] != 'SPACE_BETWEEN':
            # CSS gap cannot be negative (the declaration is ignored): overlap siblings with margins
            side = 'top' if al_['m'] == 'VERTICAL' else 'left'
            self.rules[f'{c} > * + *'] = OrderedDict([(f'margin-{side}', px(al_['gap']))])
        if not kids:
            return ind + f'<div className="{c}" />' if tag in ('div', 'section', 'a', 'button', 'nav') else ind + self.open_tag(tag, n, c, None) + self.close_tag(tag, n, None)
        lines = [ind + self.open_tag(tag, n, c, None)]
        for k in kids:
            if n['t'] == 'GROUP':
                # group children are positioned in the group's parent space
                # (keep raw frame-space coords so nested groups subtract the right origin)
                ox, oy = n.get('_rx', n['x']), n.get('_ry', n['y'])
                k = dict(k, x=k['x'] - ox, y=k['y'] - oy, _rx=k['x'], _ry=k['y'])
            lines.append(self.emit(k, n, depth + 1, c))
        lines.append(ind + self.close_tag(tag, n, None))
        return '\n'.join(lines)

    def route_for(self, n, text_node=None):
        label = (text_node or n).get('tx') if (text_node or n)['t'] == 'TEXT' else None
        if label is None:
            ts = texts(n)
            label = ts[0] if ts else ''
        key = re.sub(r'[→\s]+$', '', label.strip().lower())
        return ROUTES.get(key)

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
        if tag == 'button': return f'<button type="button" className="{c}">'
        if tag == 'form': return f'<form className="{c}" onSubmit={{(e) => e.preventDefault()}}>'
        return f'<{tag} className="{c}">'

    def close_tag(self, tag, n, text_node):
        if tag == 'a' and self.route_for(n, text_node): return '</Link>'
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
    allk = [c for c in frame.get('c', []) if not c.get('hid')]
    kids = sorted(visible_children(frame), key=lambda k: k['y'])
    chrome = [c for c in allk if is_chrome(c)]
    top = max([c['y'] + c['h'] for c in chrome if c['y'] < 1 and c['h'] > 0] or [0])
    foot = min([c['y'] for c in chrome if c['y'] > 1 and c['h'] > 0] or [None], key=lambda v: 1e9 if v is None else v)
    gaps = []
    prev = top
    for k in kids:
        gaps.append(k['y'] - prev); prev = k['y'] + k['h']
    tail = (foot - prev) if foot is not None else 0
    for k in kids:   # mark the first node down each section that carries side padding
        node = k
        while node.get('al') and not node['al']['p'][1] and len(visible_children(node)) == 1:
            node = visible_children(node)[0]
        if node.get('al') and node['al']['p'][1]: node['_center'] = True
    body = []
    for i, k in enumerate(kids):
        line = page.emit(k, frame, 3, prefix, root_child=True)
        if frame.get('al') and k.get('sz', ['', ''])[1] == 'FIXED':
            m0 = re.match(r'(\s*<\w+ className=")([^"]+)"', line)
            if m0: page.rules[m0.group(2)]['min-height'] = px(k['h'])
        m = re.match(r'(\s*<\w+ className=")([^"]+)"', line)
        g = round(gaps[i], 2); b = round(tail, 2) if i == len(kids) - 1 else 0
        if m and (abs(g) >= 0.5 or abs(b) >= 0.5):
            d = page.rules[m.group(2)]
            d = OrderedDict(d)
            if abs(g) >= 0.5: d['margin-top'] = px(g)
            if abs(b) >= 0.5: d['margin-bottom'] = px(b)
            page.rules[m.group(2) + '--root'] = d
            line = line.replace(f'className="{m.group(2)}"', f'className="{m.group(2)}--root"', 1)
        body.append(line)
    print('root gaps', [round(g, 2) for g in gaps], 'tail', round(tail, 2))
    imports = ["import './" + comp + ".css';"]
    if page.needs_link: imports.insert(0, "import { Link } from 'react-router-dom';")
    jsx = '\n'.join(imports) + f"""

// Generated from Figma frame "{frame['n']}" ({frame['i']}) by tools/gen_member.py, then hand-edited.
export default function {comp}() {{
  return (
    <div className="{prefix}">
{chr(10).join(body)}
    </div>
  );
}}
"""
    os.makedirs(os.path.join(ROOT, 'src', 'pages'), exist_ok=True)
    if not CSS_ONLY:   # --css-only: refresh styles without touching a hand-wired component
        open(os.path.join(ROOT, 'src', 'pages', comp + '.jsx'), 'w', encoding='utf-8').write(jsx)
    root_css = OrderedDict([('display', 'flex'), ('flex-direction', 'column')])
    fills_css(frame.get('fill'), root_css)
    open(os.path.join(ROOT, 'src', 'pages', comp + '.css'), 'w', encoding='utf-8').write(css_text(OrderedDict([(prefix, root_css)] + list(page.rules.items()))))
    print(f'{comp}: {len(page.rules)} classes, {len(body)} sections')

CSS_ONLY = '--css-only' in sys.argv

if __name__ == '__main__':
    generate(sys.argv[1], sys.argv[2], sys.argv[3])
