# crop a y-range of a tools/out/<name>.sbs.png: python tools/crop.py <name> <y0> <y1> [scale]
import sys
from PIL import Image
name, y0, y1 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
s = float(sys.argv[4]) if len(sys.argv) > 4 else 0.6
im = Image.open(f'tools/out/{name}.sbs.png').crop((0, y0, 2570, y1))
im = im.resize((int(im.width * s), int(im.height * s)))
out = f'tools/out/crop-{name}-{y0}.png'
im.save(out); print(out)
