#!/usr/bin/env python3
"""Crystal Quest - generates themed crystal sets (SVG).
Run: python3 gen_crystal_sets.py <assets_root>
Each set keeps the SAME six gameplay colours (ruby=red, sapphire=blue, emerald=green,
topaz=yellow, amethyst=purple, diamond=white) so matching, objectives and colour-blind
support never change. A set changes the SHAPE FAMILY, rim, glow and a small inner motif.
Inside one set all six outlines are different. All artwork is original, built from geometry."""
import json, math, os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "assets"

def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t):
    A, B = hx(a), hx(b)
    return '#%02x%02x%02x' % tuple(round(A[i] + (B[i]-A[i])*t) for i in range(3))
def pts(p): return ' '.join('%.1f,%.1f' % q for q in p)
def ngon(n, R, rot=-90, cx=64, cy=64, sx=1, sy=1):
    return [(cx + math.cos(math.radians(rot + i*360/n))*R*sx,
             cy + math.sin(math.radians(rot + i*360/n))*R*sy) for i in range(n)]
def star(n, R, r, rot=-90, cx=64, cy=64):
    out = []
    for i in range(n*2):
        rad = R if i % 2 == 0 else r
        a = math.radians(rot + i*180/n); out.append((cx + math.cos(a)*rad, cy + math.sin(a)*rad))
    return out
def blob(n, R, amp, samples=24, rot=-90, cx=64, cy=64, sx=1, sy=1):
    """smooth n-lobed outline"""
    out = []
    for i in range(samples):
        a = math.radians(rot + i*360/samples)
        r = R*(1 + amp*math.cos(n*(a - math.radians(rot))))
        out.append((cx + math.cos(a)*r*sx, cy + math.sin(a)*r*sy))
    return out
def lens(w, h=58, rot=0, cx=64, cy=64, samples=7):
    right = [(cx + w*math.sin(t*math.pi/samples), cy - h*math.cos(t*math.pi/samples)) for t in range(0, samples+1)]
    left = [(cx - w*math.sin(t*math.pi/samples), cy - h*math.cos(t*math.pi/samples)) for t in range(samples-1, 0, -1)]
    p = right + left
    if rot:
        c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        p = [(cx + (x-cx)*c - (y-cy)*s, cy + (x-cx)*s + (y-cy)*c) for x, y in p]
    return p
def drop(cx=64, cy=66, R=44):
    p = [(cx, cy-60)]
    for t in range(-60, 241, 30):
        a = math.radians(t); p.append((cx + math.cos(a)*R, cy + 14 + math.sin(a)*R*.95))
    return sorted(set(p), key=lambda q: math.atan2(q[1]-cy, q[0]-cx))

GLOW = ('<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">'
        '<feGaussianBlur stdDeviation="5"/></filter>')
def wrap(body, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">'
            '<defs>%s</defs>%s</svg>\n' % (defs, body))

def gem(outer, color, k=.55, center=(64, 64), glow_col=None, stroke_w=3):
    cx, cy = center
    inner = [(cx + (x-cx)*k, cy + (y-cy)*k) for x, y in outer]
    n = len(outer)
    dark = mix(color, '#000000', .32); light = mix(color, '#ffffff', .42)
    out = ['<polygon points="%s" fill="%s" opacity=".6" filter="url(#glow)"/>' % (pts(outer), glow_col or color),
           '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%d" stroke-linejoin="round"/>'
           % (pts(outer), dark, mix(color, '#000000', .55), stroke_w)]
    for i in range(n):
        j = (i+1) % n
        quad = [outer[i], outer[j], inner[j], inner[i]]
        mx = sum(q[0] for q in quad)/4 - cx; my = sum(q[1] for q in quad)/4 - cy
        d = math.hypot(mx, my) or 1
        t = ((-mx/d - my/d)/math.sqrt(2) + 1) / 2
        out.append('<polygon points="%s" fill="%s" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>'
                   % (pts(quad), mix(dark, light, t)))
    out.append('<polygon points="%s" fill="url(#tb)" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>' % pts(inner))
    out.append('<ellipse cx="%.1f" cy="%.1f" rx="13" ry="6" fill="#fff" opacity=".68" transform="rotate(-35 %.1f %.1f)"/>'
               % (cx-13, cy-16, cx-13, cy-16))
    out.append('<path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>'
               % (cx-18, cy+26, cx, cy+36, cx+18, cy+26))
    out.append('<path d="M%.1f %.1fl2.2 5.5 5.5 2.2-5.5 2.2-2.2 5.5-2.2-5.5-5.5-2.2 5.5-2.2z" fill="#fff" opacity=".9"/>'
               % (cx-30, cy-34))
    defs = (GLOW + '<radialGradient id="tb" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="%s"/>'
            '<stop offset="1" stop-color="%s"/></radialGradient>' % (light, color))
    return ''.join(out), defs

# ---- inner motifs (drawn at the gem centre, white, low opacity) -------------------------
def m_snow(cx, cy):
    return ''.join('<path d="M%.1f %.1f L%.1f %.1f" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>'
                   % (cx+math.cos(math.radians(a))*13, cy+math.sin(math.radians(a))*13,
                      cx-math.cos(math.radians(a))*13, cy-math.sin(math.radians(a))*13) for a in (0, 60, 120))
def m_leaf(cx, cy):
    return ('<path d="M%.1f %.1f L%.1f %.1f M%.1f %.1f l7 -7 M%.1f %.1f l-7 -7 M%.1f %.1f l6 -6 M%.1f %.1f l-6 -6" '
            'stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".75"/>'
            % (cx, cy+14, cx, cy-14, cx, cy+4, cx, cy+4, cx, cy-5, cx, cy-5))
def m_sun(cx, cy):
    return ('<circle cx="%.1f" cy="%.1f" r="6" fill="none" stroke="#fff" stroke-width="2.2" opacity=".8"/>'
            '<path d="M%.1f %.1f h-20 M%.1f %.1f h20" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>'
            % (cx, cy, cx-7, cy, cx+7, cy))
def m_flame(cx, cy):
    return ('<path d="M%.1f %.1f C%.1f %.1f %.1f %.1f %.1f %.1f C%.1f %.1f %.1f %.1f %.1f %.1f Z" fill="#fff" opacity=".75"/>'
            % (cx, cy-14, cx+12, cy-2, cx+8, cy+12, cx, cy+12, cx-8, cy+12, cx-12, cy-2, cx, cy-14))
def m_bubbles(cx, cy):
    return ''.join('<circle cx="%.1f" cy="%.1f" r="%d" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>' % (cx+dx, cy+dy, r)
                   for dx, dy, r in ((-6, 6, 6), (7, -2, 4), (-2, -9, 3)))
def m_swirl(cx, cy):
    return ('<path d="M%.1f %.1f C%.1f %.1f %.1f %.1f %.1f %.1f C%.1f %.1f %.1f %.1f %.1f %.1f" fill="none" stroke="#fff" '
            'stroke-width="2.4" stroke-linecap="round" opacity=".8"/>'
            % (cx-12, cy+4, cx-6, cy-12, cx+8, cy-10, cx+10, cy, cx+10, cy+8, cx, cy+10, cx-2, cy+2))
def m_crack(cx, cy):
    return ('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f M%.1f %.1f L%.1f %.1f" fill="none" stroke="#fff" '
            'stroke-width="2" stroke-linejoin="round" opacity=".7"/>'
            % (cx-12, cy-12, cx-2, cy-2, cx-8, cy+4, cx+8, cy+14, cx-2, cy-2, cx+12, cy-6))
def m_stars(cx, cy):
    s = lambda x, y, r: ('<path d="M%.1f %.1f l%.1f %.1f %.1f %.1f %.1f %.1f %.1f %.1f %.1f %.1f %.1f %.1f z" fill="#fff" opacity=".85"/>'
                         % (x, y-r, r*.3, r*.7, r*.7, r*.3, -r*.7, r*.3, -r*.3, r*.7, -r*.3, -r*.7, -r*.7, -r*.3))
    return s(cx, cy-2, 9) + s(cx+10, cy+9, 4) + s(cx-10, cy+8, 3)

# ---- the sets -------------------------------------------------------------------------
# each: id, name, world, glow tint, rim colour, tint mixed into every gem colour, motif, six outlines
BASE = {'ruby': '#E5324B', 'sapphire': '#2F7BFF', 'emerald': '#1FBF6A',
        'topaz': '#FFC21A', 'amethyst': '#A24BE8', 'diamond': '#BFE3FF'}
ORDER = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond']

SETS = [
 dict(id='set_02_frozen_shards', name='Frozen Shards', world='Frozen Mountains', rim='#DFF6FF', tint=('#BFEFFF', .16), motif=m_snow, k=.5,
      shapes=dict(ruby=star(6, 58, 38), sapphire=ngon(6, 58, rot=0), emerald=ngon(6, 58, sx=.7),
                  topaz=star(12, 58, 47), amethyst=star(5, 58, 34, cy=66), diamond=[(64, 4), (114, 64), (64, 124), (14, 64)])),
 dict(id='set_03_forest_leaves', name='Forest Leaves', world='Enchanted Forest', rim='#E8D7A0', tint=('#9FE070', .14), motif=m_leaf, k=.5,
      shapes=dict(ruby=blob(3, 52, .12, samples=18, rot=-90), sapphire=drop(), emerald=lens(42), topaz=blob(4, 54, .1, samples=16, rot=-45),
                  amethyst=blob(5, 54, .09, samples=20), diamond=[(64, 4), (102, 48), (64, 124), (26, 48)])),
 dict(id='set_04_desert_relics', name='Desert Relics', world='Lost Desert', rim='#FFE08A', tint=('#FFD27A', .14), motif=m_sun, k=.52,
      shapes=dict(ruby=[(36, 10), (92, 10), (118, 36), (118, 92), (92, 118), (36, 118), (10, 92), (10, 36)],
                  sapphire=ngon(6, 58, rot=0, sy=.9), emerald=[(34, 12), (94, 12), (110, 116), (18, 116)],
                  topaz=star(16, 58, 49), amethyst=[(38, 8), (90, 8), (104, 24), (104, 104), (90, 120), (38, 120), (24, 104), (24, 24)],
                  diamond=[(64, 6), (120, 112), (8, 112)])),
 dict(id='set_05_dragon_scales', name='Dragon Scales', world='Dragon Kingdom', rim='#FFB347', tint=('#FF9A3C', .12), motif=m_flame, k=.5,
      shapes=dict(ruby=[(64, 4), (96, 40), (110, 80), (88, 122), (64, 100), (40, 122), (18, 80), (32, 40)],
                  sapphire=[(64, 8), (112, 30), (104, 90), (64, 122), (24, 90), (16, 30)],
                  emerald=lens(34, 58, rot=90), topaz=star(7, 58, 42), amethyst=[(14, 34), (40, 60), (64, 14), (88, 60), (114, 34), (100, 112), (28, 112)],
                  diamond=[(64, 4), (116, 92), (64, 72), (12, 92)])),
 dict(id='set_06_ocean_pearls', name='Ocean Pearls', world='Ocean Kingdom (coming soon)', rim='#FFFFFF', tint=('#7DF3EC', .16), motif=m_bubbles, k=.5,
      shapes=dict(ruby=blob(6, 52, .09), sapphire=drop(R=42), emerald=lens(36, 58, rot=90), topaz=blob(8, 53, .06),
                  amethyst=blob(5, 54, .13, rot=-54), diamond=ngon(10, 56, sx=.8))),
 dict(id='set_07_sky_feathers', name='Sky Feathers', world='Sky Kingdom (coming soon)', rim='#FFFFFF', tint=('#BFE3FF', .18), motif=m_swirl, k=.52,
      shapes=dict(ruby=blob(4, 52, .17, rot=-45), sapphire=lens(30, 58, rot=25), emerald=blob(3, 52, .14, samples=18, rot=90),
                  topaz=blob(2, 50, .16, rot=0, sy=.9), amethyst=ngon(5, 58, rot=90, cy=60), diamond=[(64, 6), (100, 40), (64, 122), (28, 40)])),
 dict(id='set_08_dark_obsidian', name='Dark Obsidian', world='Dark Kingdom (coming soon)', rim='#B78BFF', tint=('#2A1A4A', .28), motif=m_crack, k=.48,
      shapes=dict(ruby=[(64, 4), (100, 30), (116, 72), (80, 120), (40, 112), (12, 70), (30, 28)],
                  sapphire=[(50, 6), (100, 22), (118, 70), (84, 122), (30, 104), (10, 52)],
                  emerald=[(64, 2), (96, 50), (86, 124), (42, 124), (30, 50)], topaz=star(9, 58, 40, rot=-80),
                  amethyst=[(20, 20), (64, 6), (110, 24), (104, 100), (64, 122), (22, 98)], diamond=[(64, 4), (122, 70), (64, 124), (6, 70)])),
 dict(id='set_09_celestial_stars', name='Celestial Stars', world='Celestial Kingdom (coming soon)', rim='#FFE9A0', tint=('#FFE9A0', .12), motif=m_stars, k=.5,
      shapes=dict(ruby=star(4, 60, 28), sapphire=star(5, 60, 30), emerald=star(6, 60, 34), topaz=star(8, 60, 38),
                  amethyst=star(7, 60, 34), diamond=star(10, 60, 40))),
]

def save(sub, name, svg):
    d = os.path.join(ROOT, sub); os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name + '.svg'), 'w', encoding='utf-8') as f: f.write(svg)

def centre(pts_):
    xs = [p[0] for p in pts_]; ys = [p[1] for p in pts_]
    return ((min(xs)+max(xs))/2, (min(ys)+max(ys))/2)

manifest = {}
for s in SETS:
    keys = {}
    for i, n in enumerate(ORDER, 1):
        outer = s['shapes'][n]
        col = mix(BASE[n], s['tint'][0], s['tint'][1])
        c = centre(outer)
        body, defs = gem(outer, col, k=s['k'], center=c, glow_col=s['rim'])
        rim = '<polygon points="%s" fill="none" stroke="%s" stroke-width="2" stroke-opacity=".85" stroke-linejoin="round" ' \
              'transform="translate(%.1f %.1f) scale(.94) translate(%.1f %.1f)"/>' % (pts(outer), s['rim'], c[0], c[1], -c[0], -c[1])
        svg = wrap(body + rim + s['motif'](c[0], c[1]), defs=defs)
        name = 'crystal_%02d_%s' % (i, n)
        save('crystal_sets/' + s['id'], name, svg)
        keys[n] = 'assets/crystal_sets/%s/%s.svg' % (s['id'], name)
    manifest[s['id']] = dict(name=s['name'], world=s['world'], crystals=keys)
with open(os.path.join(ROOT, 'crystal_sets', 'crystal_sets.json'), 'w') as f:
    json.dump(manifest, f, indent=2)
print(len(SETS), 'sets,', len(SETS)*6, 'crystals written to', os.path.join(ROOT, 'crystal_sets'))
