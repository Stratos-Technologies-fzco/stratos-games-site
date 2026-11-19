"""Adds the sprites from jobs.json to the existing atlases WITHOUT redrawing the old art: the old frames are cut out of the current
atlas images pixel for pixel and everything is packed again with the same rules as tools/asset-gen/pack.py (<= 2048, 2 px padding).
Also updates assets/farm/asset-manifest.json and docs/ASSET_MANIFEST.md.   Run from the game folder: python art/pack_more.py"""
import json, os, re
from PIL import Image

ART = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(ART)
ATL = os.path.join(ROOT, 'assets', 'farm', 'atlases')
MANIFEST = os.path.join(ROOT, 'assets', 'farm', 'asset-manifest.json')
DOC = os.path.join(ROOT, 'docs', 'ASSET_MANIFEST.md')
MAXS, PAD = 2048, 2
ATLAS_OF = {'crops': 'atlas_crops', 'animals': 'atlas_animals', 'habitats': 'atlas_habitats', 'icons': 'atlas_icons'}
SECTION = {'crops': '## Crops', 'animals': '## Animals', 'habitats': '## Animal habitats', 'icons': '## Icons'}


def pack(items):
    items = sorted(items, key=lambda r: (-r['h'], -r['w']))
    for width in (512, 1024, 2048):
        x = y = rowh = 0; pos = {}; ok = True
        for r in items:
            w, h = r['w'] + PAD, r['h'] + PAD
            if w > width: ok = False; break
            if x + w > width: x = 0; y += rowh; rowh = 0
            pos[r['name']] = (x, y); x += w; rowh = max(rowh, h)
        hgt = y + rowh
        if ok and hgt <= MAXS:
            return width, hgt, pos
    raise RuntimeError('does not fit in 2048')


jobs = json.load(open(os.path.join(ART, 'jobs.json')))
manifest = json.load(open(MANIFEST))
new_rows = {}  # cat -> markdown rows

for cat, atlas in ATLAS_OF.items():
    mine = [j for j in jobs if j['cat'] == cat]
    if not mine: continue
    data = json.load(open(os.path.join(ATL, atlas + '.json')))
    sheet = Image.open(os.path.join(ATL, atlas + '.png')).convert('RGBA')
    items = {}
    for name, fr in data['frames'].items():
        f = fr['frame']
        items[name] = dict(name=name, w=f['w'], h=f['h'], img=sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), pivot=fr.get('pivot'))
    for j in mine:
        im = Image.open(os.path.join(ART, j['png'])).convert('RGBA')
        assert im.size == (j['w'], j['h']), (j['name'], im.size)
        piv = {'x': round(j['anchor'][0] / j['w'], 4), 'y': round(j['anchor'][1] / j['h'], 4)} if j.get('anchor') else None
        items[j['name']] = dict(name=j['name'], w=j['w'], h=j['h'], img=im, pivot=piv)  # a re-run replaces the same name
    w, h, pos = pack(list(items.values()))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    frames = {}
    for name, r in items.items():
        x, y = pos[name]
        out.paste(r['img'], (x, y))
        fr = {'frame': {'x': x, 'y': y, 'w': r['w'], 'h': r['h']}, 'rotated': False, 'trimmed': False,
              'spriteSourceSize': {'x': 0, 'y': 0, 'w': r['w'], 'h': r['h']}, 'sourceSize': {'w': r['w'], 'h': r['h']}}
        if r['pivot']:
            fr['pivot'] = r['pivot']; fr['anchor'] = dict(r['pivot'])
        frames[name] = fr
    png = os.path.join(ATL, atlas + '.png')
    out.save(png, optimize=True)
    data['frames'] = frames
    data['meta']['size'] = {'w': w, 'h': h}
    json.dump(data, open(os.path.join(ATL, atlas + '.json'), 'w'), indent=1)
    for a in manifest['atlases']:
        if a['key'] == atlas:
            a['size'] = [w, h]; a['frames'] = len(frames); a['kb'] = round(os.path.getsize(png) / 1024, 1)
    print(f'{atlas}: {len(frames)} frames, {w}x{h}, {os.path.getsize(png)//1024} KB')
    rows = []
    for j in mine:
        anc = f"{j['anchor'][0]},{j['anchor'][1]}" if j.get('anchor') else '—'
        note = j['note'] or ('1' if cat == 'icons' else '')
        src = 'Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`)'
        rows.append(f"| {j['name']} | `public/assets/farm/{cat}/{j['name']}.png` | {j['w']}×{j['h']} | {note} | {anc} | {atlas} | {src} | Project-owned original work | v1 |")
    new_rows[cat] = rows

json.dump(manifest, open(MANIFEST, 'w'), indent=1)

# ---- docs/ASSET_MANIFEST.md: atlas table, section counts, new rows (skipped for names already listed) ----
lines = open(DOC, encoding='utf8').read().split('\n')
for cat, rows in new_rows.items():
    head = next(i for i, l in enumerate(lines) if l.startswith(SECTION[cat] + ' ') or l.startswith(SECTION[cat] + '('))
    nxt = next(i for i in range(head + 1, len(lines)) if lines[i].startswith('## '))
    existing = {l.split('|')[1].strip() for l in lines[head:nxt] if l.startswith('| ') and l.count('|') > 3}
    fresh = [r for r in rows if r.split('|')[1].strip() not in existing]
    last = max(i for i in range(head, nxt) if lines[i].startswith('|'))
    lines[last + 1:last + 1] = fresh
    total = sum(1 for l in lines[head:next(i for i in range(head + 1, len(lines)) if lines[i].startswith('## '))] if l.startswith('| ') and l.count('|') > 8 and not l.startswith('| Name') and not l.startswith('|---'))
    lines[head] = re.sub(r'\(\d+\)\s*$', f'({total})', lines[head])
for a in manifest['atlases']:
    for i, l in enumerate(lines):
        if l.startswith(f"| {a['key']} |"):
            lines[i] = f"| {a['key']} | `{a['image']}` | {a['size'][0]}×{a['size'][1]} | {a['frames']} | {a['kb']} |"
text = '\n'.join(lines)
if 'art/more_art.py' not in text:
    text = text.replace('- Regenerate:', '- More art (onion, blueberry, peanut, lavender, turkey, rabbit, horse and their homes and icons) is drawn by `art/more_art.py`, rendered with Chromium by `art/render.mjs` and merged into the atlases by `art/pack_more.py`.\n- Regenerate:', 1)
open(DOC, 'w', encoding='utf8').write(text)
print('manifest and docs updated')
