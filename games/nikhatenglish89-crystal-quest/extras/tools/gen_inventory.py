#!/usr/bin/env python3
"""Builds ASSET_INVENTORY.md and assets/manifest.json from the files on disk.
Run from the crystal-quest folder: python3 tools/gen_inventory.py"""
import glob, json, os, re, subprocess

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows, manifest = [], {"images": {}, "audio": {"music": {}, "sfx": {}}}

def dims(path):
    s = open(path, encoding='utf-8').read(600)
    m = re.search(r'viewBox="0 0 (\d+) (\d+)"', s)
    return '%sx%s' % m.groups() if m else '?'
def dur(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True).stdout.strip()
    return '%.1fs' % float(out)

CATS = [  # folder, id-prefix, category, usage, status, priority-fn
 ('crystals', 'CRY', 'Crystal', 'Basic match-3 crystal sprite (one unique shape and colour each)', 'Production (vector v1)', lambda n: 'P0 boot'),
 ('special', 'SPC', 'Special crystal', 'Special crystal sprite (bomb, row/column clear, rainbow, nova, star, fish, super)', 'Production (vector v1)', lambda n: 'P1 per level'),
 ('blockers', 'BLK', 'Blocker', 'Blocker tile sprite (overlay or replacement of a crystal cell)', 'Production (vector v1)', lambda n: 'P1 per level'),
 ('characters', 'CHR', 'Character', 'Story portrait: intro screens, dialogue, menus', 'Placeholder (original vector, static pose)', lambda n: 'P2 lazy'),
 ('bosses', 'BSS', 'Boss', 'Boss intro screen and in-level boss display', 'Placeholder (original vector, static pose)', lambda n: 'P2 lazy'),
 ('backgrounds', 'BGD', 'Background', 'Full-screen world backdrop (portrait 390x844 design size)', 'Placeholder (original vector scene)', lambda n: 'P0 boot' if '_01_' in n else 'P1 per world'),
 ('ui/icons', 'ICN', 'UI icon', 'HUD, menu and booster icon', 'Production (vector v1)', lambda n: 'P0 boot'),
]
for folder, pre, cat, use, status, prio in CATS:
    for i, f in enumerate(sorted(glob.glob(os.path.join(BASE, 'assets', folder, '*.svg'))), 1):
        name = os.path.basename(f); key = name[:-4]; rel = os.path.relpath(f, BASE).replace('\\', '/')
        rows.append(('CQ-%s-%02d' % (pre, i), name, cat, dims(f), 'SVG', use, prio(name), status))
        manifest['images'][key] = rel
for f in sorted(glob.glob(os.path.join(BASE, 'assets', 'ui', '*.svg'))):
    name = os.path.basename(f); rel = os.path.relpath(f, BASE).replace('\\', '/')
    rows.append(('CQ-UIK-%s' % name[:-4].upper().replace('_', '-')[:14], name, 'UI kit', dims(f), 'SVG', 'Reference for button, panel, progress bar and logo emblem styling (the React UI builds these in CSS)',
                 'P0 boot' if 'logo' in name else 'Reference', 'Production (vector v1)' if 'logo' in name else 'Placeholder (reference only)'))
    manifest['images'][name[:-4]] = rel

music_info = {'01': 'Main menu theme', '02': 'Crystal Valley theme', '03': 'Frozen Mountains theme', '04': 'Enchanted Forest theme', '05': 'Lost Desert theme', '06': 'Dragon Kingdom theme', '07': 'Boss battle theme', '08': 'Victory theme (plays once)'}
sfx_info = {'01': 'Crystal selection', '02': 'Crystal movement (swap)', '03': 'Match 3', '04': 'Match 4', '05': 'Match 5', '06': 'Crystal explosion', '07': 'Lightning activation', '08': 'Rainbow activation', '09': 'Booster activation', '10': 'Level completion', '11': 'Level failure', '12': 'Boss attack', '13': 'Boss defeat', '14': 'Reward collection', '15': 'Button interaction'}
core_sfx = {'01', '02', '03', '15'}
for kind, folder, info in (('music', 'music', music_info), ('sfx', 'sfx', sfx_info)):
    for f in sorted(glob.glob(os.path.join(BASE, 'audio', folder, '*.ogg'))):
        name = os.path.basename(f)[:-4]; num = name.split('_')[1]
        rel = os.path.relpath(f, BASE).replace('\\', '/')
        pr = ('P0 boot' if num == '01' else 'P1 per world' if num in '020304050607'[0::2] or num in ('02', '03', '04', '05', '06', '07') else 'P2 lazy') if kind == 'music' else ('P0 boot' if num in core_sfx else 'P1 per level')
        rows.append(('CQ-%s-%s' % ('MUS' if kind == 'music' else 'SFX', num), name + '.ogg + .mp3', 'Music' if kind == 'music' else 'Sound effect', dur(f), 'OGG Vorbis + MP3 128k',
                     info[num] + ('. Seamless loop.' if kind == 'music' and num != '08' else ''), pr, 'Placeholder (original synthesized draft)'))
        manifest['audio'][kind][name] = {'ogg': rel, 'mp3': rel[:-4] + '.mp3', 'loop': kind == 'music' and num != '08'}

missing = [
 ('Texture atlases and spritesheets', 'Pack the SVGs into compressed atlases (WebP/PNG, plus ASTC/ETC2 for mobile)'),
 ('Crystal animation frames', 'Idle, select, swap, match and destruction animations per crystal (currently only static art; tween in Phaser)'),
 ('Crystal particle and VFX sprites', 'Explosion, glow, lightning, rainbow blast, fire, ice, restoration, boss attack effects'),
 ('Character expression sets', 'Idle, speaking and victory poses for the five characters'),
 ('Boss attack and hurt frames', 'Frames for each boss attack pattern and damage reaction'),
 ('Restoration before/after art', 'Matching before and after scene for each restoration project'),
 ('Worlds 6 to 10 gameplay assets', 'Backdrops exist as placeholders; blockers, bosses and themes for those worlds are not made'),
 ('Music for worlds 6 to 10', 'Ocean, Sky, Dark, Celestial, Palace themes are not part of the required list and are not made'),
 ('Reward graphics', 'Treasure chest open/close art, achievement badges, coin and shard bursts'),
 ('Level marker set', 'Boss marker, treasure marker, star-gated marker for the level map'),
 ('Wordmark outlines', 'The title lettering in the UI uses the Lilita One web font; convert to outlined vector for a fixed logo'),
]
for i, (n, d) in enumerate(missing, 1):
    rows.append(('CQ-MIS-%02d' % i, '-', 'Missing: ' + n, '-', '-', d, 'Needed before launch', 'Missing'))

out = ['# Crystal Quest - Asset Inventory', '',
       'Generated by `tools/gen_inventory.py` from the files in this folder. Statuses are deliberate: "Placeholder" means original artwork or audio that is good enough to build and test with but should be reviewed or replaced before a public launch. Nothing here is third-party material.', '',
       'Loading priority: P0 = preload at boot, P1 = load per world or per level, P2 = lazy load on demand.', '',
       '| ID | Filename | Category | Dimensions / length | Format | Intended usage | Loading priority | Status |', '|---|---|---|---|---|---|---|---|']
for r in rows: out.append('| ' + ' | '.join(r) + ' |')
counts = {}
for r in rows: counts[r[7]] = counts.get(r[7], 0) + 1
out += ['', '## Summary', ''] + ['- %s: %d' % (k, v) for k, v in sorted(counts.items())]
os.makedirs(os.path.join(BASE, 'docs', 'crystal-quest'), exist_ok=True)
open(os.path.join(BASE, 'docs', 'crystal-quest', 'ASSET_INVENTORY.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
json.dump(manifest, open(os.path.join(BASE, 'assets', 'manifest.json'), 'w'), indent=2)
print(len(rows), 'rows', counts)
