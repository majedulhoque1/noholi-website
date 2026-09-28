# Compare built element boxes with Figma absolute boxes to find where layout drift starts.
# usage: GEN_DEBUG=1 python tools/gen.py ...; python tools/boxes.py <frameId> <route> [minDelta=0.75]
import json, os, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')
fid, route = sys.argv[1], sys.argv[2]
tol = float(sys.argv[3]) if len(sys.argv) > 3 else 0.75
d = json.load(open('design-export/design-tree.json', encoding='utf-8'))
F = {}
def walk(n, ox, oy, parent_group=False):
    ax, ay = ox + n['x'], oy + n['y']
    F[n['i']] = (ax, ay, n['w'], n['h'], n['n'], n['t'])
    for c in n.get('c', []):
        if n['t'] == 'GROUP': walk(c, ox, oy)      # group children are in the group's parent space
        else: walk(c, ax, ay)
frame = [f for f in d['frames'] if f['i'] == fid][0]
for c in frame['c']: walk(c, 0, 0)
env = dict(os.environ, MSYS_NO_PATHCONV='1')
subprocess.run(['node', 'tools/boxes.mjs', 'http://localhost:5191' + route, 'tools/out/boxes.json'], check=True, env=env)
B = json.load(open('tools/out/boxes.json'))
rows = []
for i, x, y, w, h, tag in B:
    if i not in F: continue
    fx, fy, fw, fh, name, t = F[i]
    rows.append((fy, i, name, t, tag, x - fx, y - fy, w - fw, h - fh, fh))
rows.sort()
last = None
for fy, i, name, t, tag, dx, dy, dw, dh, fh in rows:
    if abs(dh) > tol or abs(dw) > tol or (last is not None and abs(dy - last) > tol):
        print(f'y={fy:7.1f} {i:10} {tag:7} dx={dx:+6.1f} dy={dy:+6.1f} dw={dw:+6.1f} dh={dh:+6.1f} (fh={fh:.1f}) {name[:50]}')
    last = dy
