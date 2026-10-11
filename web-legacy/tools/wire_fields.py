"""
Pair every generated form control in a member page with its visible label.

usage: python tools/wire_fields.py <Component> <id-prefix> [--dry]

For each <input>/<textarea> without an id, the nearest label text written after the previous
control is found: a <label> element, or else the last <span> whose text looks like a field
label (upper-case words). A <span> label is turned into a <label> (same class, so it looks the
same). The pair gets id / htmlFor / name. Prints the pairing so it can be reviewed.
"""
import re, sys
sys.stdout.reconfigure(encoding="utf-8")

comp, prefix = sys.argv[1], sys.argv[2]
dry = '--dry' in sys.argv
path = f'src/pages/{comp}.jsx'
s = open(path, encoding='utf-8').read()

def strip_tags(t):
    t = re.sub(r'\{"(.*?)"\}', lambda m: m.group(1).encode().decode('unicode_escape') if '\\u' in m.group(1) else m.group(1), t)
    return re.sub(r'<[^>]+>', '', t).strip()

def slug(t):
    t = re.sub(r'\(.*?\)', '', t)
    t = re.sub(r'[^A-Za-z0-9]+', '-', t).strip('-').lower()
    return t[:32].strip('-') or 'field'

def match_close(s, start, tag):
    """index just after the closing tag matching the element opened at `start`"""
    depth, i = 0, start
    pat = re.compile(rf'<{tag}\b[^>]*?(/?)>|</{tag}>')
    for m in pat.finditer(s, start):
        if m.group(0).startswith('</'):
            depth -= 1
            if depth == 0: return m.end()
        elif m.group(1) != '/':
            depth += 1
    return -1

used = set()
out = []
pos = 0
prev_end = 0
field_re = re.compile(r'<(input|textarea|select)\b([^>]*?)(/?)>')
while True:
    m = field_re.search(s, pos)
    if not m: break
    attrs = m.group(2)
    if ' id=' in attrs or 'type="hidden"' in attrs or 'type="checkbox"' in attrs or 'type="radio"' in attrs or 'type="file"' in attrs:
        pos = m.end(); prev_end = m.end(); continue
    seg = s[prev_end:m.start()]
    lab = None
    for lm in re.finditer(r'<label className="[^"]*"(?![^>]*htmlFor)[^>]*>', seg):
        lab = ('label', prev_end + lm.start())
    if lab is None:
        for sm in re.finditer(r'<span className="[^"]*">', seg):
            st = prev_end + sm.start()
            end = match_close(s, st, 'span')
            txt = strip_tags(s[st:end])
            letters = re.sub(r'[^A-Za-z]', '', txt)
            if len(letters) >= 3 and letters.upper() == letters:
                lab = ('span', st)   # keep the last (closest) candidate
    base = slug(strip_tags(s[lab[1]:match_close(s, lab[1], lab[0])])) if lab else 'field'
    fid, i = f'{prefix}-{base}', 2
    while fid in used: fid = f'{prefix}-{base}-{i}'; i += 1
    used.add(fid)
    name = fid[len(prefix) + 1:]
    new_field = f'<{m.group(1)} id="{fid}" name="{name}"{attrs}{m.group(3)}>'
    s = s[:m.start()] + new_field + s[m.end():]
    if lab:
        kind, st = lab
        end = match_close(s, st, kind)
        chunk = s[st:end]
        if kind == 'span':
            chunk = '<label' + chunk[5:-7] + '</label>'
        chunk = re.sub(r'^<label className="([^"]*)"', rf'<label className="\1" htmlFor="{fid}"', chunk)
        s = s[:st] + chunk + s[end:]
        shift = len(chunk) - (end - st)
    else:
        shift = 0
    out.append(f'{fid:45s} <- {strip_tags(chunk)[:60] if lab else "(no label found)"}')
    pos = m.start() + len(new_field) + shift
    prev_end = pos
print('\n'.join(out))
if not dry:
    open(path, 'w', encoding='utf-8').write(s)
