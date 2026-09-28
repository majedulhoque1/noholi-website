# Print a compact, readable subtree of the design export: python tree.py <nodeId> [maxDepth]
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
d = json.load(open(__file__.replace('tree.py', 'design-tree.json'), encoding='utf-8'))
idx = {}
def reg(n):
    idx[n['i']] = n
    for c in n.get('c', []): reg(c)
for f in d['frames']: reg(f)
def fmt(n):
    s = f"{n['t'][:4]} [{n['n'][:40]}] {n['w']}x{n['h']}"
    if n.get('hid'): s += ' HIDDEN'
    al = n.get('al')
    if al:
        p = al['p']; s += f" {al['m'][0]} pad={p} gap={al['gap']} {al['pa']}/{al['ca']}"
        if al.get('wrap'): s += f" wrap cgap={al['cgap']}"
    if n.get('sz'): s += f" sz={n['sz'][0][0]}{n['sz'][1][0]}"
    if n.get('abs'): s += ' ABS@' + f"{n['x']},{n['y']}"
    for k in ('fill', 'st', 'sw', 'sa', 'r', 'fx', 'op', 'rot', 'clip', 'svg', 'maxWidth', 'minWidth'):
        if k in n: s += f" {k}={n[k]}"
    if 'font' in n:
        f = n['font']; s += f" «{f['f']} {f['wt']} {f['z']}/{f['lh']}" + (f" ls={f['ls']}" if 'ls' in f else '') + (f" {f.get('tc','')}" if 'tc' in f else '') + f" {f.get('c')}» ta={n['ta'][0][0]}"
    if 'segs' in n:
        s += ' SEGS' + str([(g['a'], g['b'], g['f'], g['wt'], g['z'], g.get('c')) for g in n['segs']])
    if 'tx' in n: s += f" = {n['tx']!r}"
    return s
def walk(n, dep, maxd):
    print('  ' * dep + fmt(n))
    if dep < maxd:
        for c in n.get('c', []): walk(c, dep + 1, maxd)
walk(idx[sys.argv[1].replace('-', ':')], 0, int(sys.argv[2]) if len(sys.argv) > 2 else 99)
