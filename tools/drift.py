# Per-band vertical offset between built screenshot and Figma render.
# usage: python tools/drift.py <out-name> <render-substring> [band=100] [x0 x1]
# prints y: best dy (built = figma + dy) and residual diff; flags bands where dy changes.
import sys, os
import numpy as np
from PIL import Image
name, key = sys.argv[1], sys.argv[2]
band = int(sys.argv[3]) if len(sys.argv) > 3 else 100
x0, x1 = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (0, 1280)
r = [f for f in os.listdir('design-export/renders') if key in f][0]
A = np.asarray(Image.open(f'tools/out/{name}.png').convert('L'), dtype=np.int16)[:, x0:x1]
B = np.asarray(Image.open('design-export/renders/' + r).convert('L'), dtype=np.int16)[:, x0:x1]
prev = None
for y in range(0, B.shape[0] - band, band):
    fb = B[y:y + band]
    if fb.std() < 2: continue
    best = None
    for dy in range(-40, 41):
        if y + dy < 0 or y + dy + band > A.shape[0]: continue
        e = np.abs(A[y + dy:y + dy + band] - fb).mean()
        if best is None or e < best[1]: best = (dy, e)
    if best is None: continue
    mark = ' <--' if prev is not None and best[0] != prev else ''
    print(f'{y:5d}: dy={best[0]:+3d} err={best[1]:.2f}{mark}')
    prev = best[0]
