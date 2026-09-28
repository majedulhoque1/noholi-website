"""Mark line breaks in prose as soft (<br className="soft-br" />) so they collapse below 1280px.

Figma captured the browser's own line wrapping as hard newlines. A break is treated as prose
wrapping when the line before it is 30+ characters. Poetry pages keep every break.
"""
import glob
import os
import re

POETRY = {'CreativeWriting.jsx', 'CreativeWritings.jsx'}
SOFT = '<br className="soft-br" />'
total = 0

for f in glob.glob('src/pages/*.jsx'):
    if os.path.basename(f) in POETRY:
        continue
    lines = open(f, encoding='utf-8').read().split('\n')
    changed = False
    for i, line in enumerate(lines):
        if '<br />' not in line:
            continue
        parts = line.split('<br />')
        out = [parts[0]]
        for k in range(1, len(parts)):
            prev = parts[k - 1]
            # text since the previous break (or since the last tag on the line)
            seg = re.sub(r'<[^>]*>', '', prev)
            seg = re.sub(r"\{'\s*'\}|\{\"|\"\}", '', seg)
            seg = re.sub(r'<[^>]*$', '', seg)
            if len(seg.strip()) >= 30:
                sep = SOFT if out[-1].endswith(' ') else "{' '}" + SOFT
                total += 1
            else:
                sep = '<br />'
            out.append(sep + parts[k])
        new = ''.join(out)
        if new != line:
            lines[i] = new
            changed = True
    if changed:
        open(f, 'w', encoding='utf-8').write('\n'.join(lines))

print('newly softened', total)
