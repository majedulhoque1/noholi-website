# Build per-page review sheets from full-page screenshots: 2400px slices side by side at 50%.
import sys, glob, os
from PIL import Image
width = sys.argv[1] if len(sys.argv) > 1 else '390'
for f in glob.glob(f'tools/out/w{width}/_*.png'):
    im = Image.open(f); w, h = im.size
    cols = [im.crop((0, y, w, min(h, y + 2400))) for y in range(0, h, 2400)]
    cols = [c.resize((c.width // 2, c.height // 2)) for c in cols]
    W = sum(c.width + 10 for c in cols); H = max(c.height for c in cols)
    sheet = Image.new('RGB', (W, H), '#777'); x = 0
    for c in cols: sheet.paste(c, (x, 0)); x += c.width + 10
    sheet.save(os.path.join(os.path.dirname(f), 'sheet' + os.path.basename(f)))
print('ok')
