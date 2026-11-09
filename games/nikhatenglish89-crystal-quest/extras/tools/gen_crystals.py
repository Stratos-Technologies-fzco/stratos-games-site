#!/usr/bin/env python3
"""Crystal Quest - generates crystals, special crystals and blockers as SVG.
Run: python3 gen_crystals.py <assets_root>
All artwork is original, built from geometry (no third-party art)."""
import math, os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "assets"

def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t):
    A, B = hx(a), hx(b)
    return '#%02x%02x%02x' % tuple(round(A[i] + (B[i]-A[i])*t) for i in range(3))
def pts(p): return ' '.join('%.1f,%.1f' % q for q in p)
def poly_ngon(n, R, rot=-90, cx=64, cy=64, sx=1, sy=1):
    return [(cx + math.cos(math.radians(rot + i*360/n))*R*sx,
             cy + math.sin(math.radians(rot + i*360/n))*R*sy) for i in range(n)]

def wrap(body, w=128, h=128, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">'
            '<defs>%s</defs>%s</svg>\n' % (w, h, w, h, defs, body))

GLOW = ('<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">'
        '<feGaussianBlur stdDeviation="5"/></filter>')

def gem(outer, color, k=0.55, center=(64, 64), facet_colors=None, glow=True, stroke_w=3):
    cx, cy = center
    inner = [(cx + (x-cx)*k, cy + (y-cy)*k) for x, y in outer]
    n = len(outer)
    dark = mix(color, '#000000', 0.32); light = mix(color, '#ffffff', 0.42)
    out = []
    if glow:
        out.append('<polygon points="%s" fill="%s" opacity=".6" filter="url(#glow)"/>' % (pts(outer), color))
    out.append('<polygon points="%s" fill="%s" stroke="%s" stroke-width="%d" stroke-linejoin="round"/>'
               % (pts(outer), dark, mix(color, '#000000', 0.55), stroke_w))
    for i in range(n):
        j = (i+1) % n
        quad = [outer[i], outer[j], inner[j], inner[i]]
        mx = sum(q[0] for q in quad)/4 - cx; my = sum(q[1] for q in quad)/4 - cy
        d = math.hypot(mx, my) or 1
        t = ((-mx/d - my/d)/math.sqrt(2) + 1) / 2
        fill = facet_colors[i % len(facet_colors)] if facet_colors else mix(dark, light, t)
        out.append('<polygon points="%s" fill="%s" stroke="%s" stroke-opacity=".35" stroke-width="1"/>'
                   % (pts(quad), fill, '#ffffff'))
    gid = 'tb'
    out.append('<polygon points="%s" fill="url(#%s)" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>'
               % (pts(inner), gid))
    out.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#fff" opacity=".55" transform="rotate(-35 %.1f %.1f)"/>'
               % (cx-12, cy-14, 9, 4.5, cx-12, cy-14))
    out.append('<path d="M%.1f %.1fl2.2 5.5 5.5 2.2-5.5 2.2-2.2 5.5-2.2-5.5-5.5-2.2 5.5-2.2z" fill="#fff" opacity=".9"/>'
               % (cx-30, cy-34))
    defs = (GLOW + '<radialGradient id="tb" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="%s"/>'
            '<stop offset="1" stop-color="%s"/></radialGradient>' % (light, color))
    return ''.join(out), defs

def save(sub, name, svg):
    d = os.path.join(ROOT, sub); os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name + '.svg'), 'w', encoding='utf-8') as f: f.write(svg)

# ---------------------------------------------------------------- basic crystals
COL = {'ruby': '#E5324B', 'sapphire': '#2F7BFF', 'emerald': '#1FBF6A',
       'topaz': '#FFC21A', 'amethyst': '#A24BE8', 'diamond': '#BFE3FF'}
shapes = {
    'ruby': poly_ngon(8, 55, rot=-67.5),                                  # octagon cut
    'sapphire': poly_ngon(6, 58, rot=-90, sx=.86),                         # tall hex prism
    'emerald': [(40,10),(88,10),(106,30),(106,98),(88,118),(40,118),(22,98),(22,30)],  # emerald cut
    'topaz': poly_ngon(12, 54, rot=-90),                                   # round brilliant
    'amethyst': poly_ngon(5, 58, rot=-90, cy=68),                          # pentagon shard
    'diamond': [(34,22),(94,22),(120,50),(64,116),(8,50)],                 # classic diamond
}
for i, (n, o) in enumerate(shapes.items(), 1):
    body, defs = gem(o, COL[n], center=(64, 62) if n == 'diamond' else (64, 66 if n == 'amethyst' else 64))
    save('crystals', 'crystal_%02d_%s' % (i, n), wrap(body, defs=defs))

# ---------------------------------------------------------------- special crystals
def bolt(fill='#fff', stroke='#7a4a00', rot=0):
    return ('<g transform="rotate(%d 64 64)"><polygon points="72,18 42,70 60,70 50,112 88,54 68,54 80,18" fill="%s" '
            'stroke="%s" stroke-width="3" stroke-linejoin="round"/></g>' % (rot, fill, stroke))
def arrow(x, y, d):  # triangular arrow
    dx, dy = d
    if dx:  p = [(x, y), (x-dx*14, y-11), (x-dx*14, y+11)]
    else:   p = [(x, y), (x-11, y-dy*14), (x+11, y-dy*14)]
    return '<polygon points="%s" fill="#fff" stroke="#333" stroke-opacity=".5" stroke-width="2" stroke-linejoin="round"/>' % pts(p)

# 1 Ruby Bomb
body = ('<circle cx="64" cy="72" r="52" fill="#E5324B" opacity=".55" filter="url(#glow)"/>'
        '<circle cx="64" cy="72" r="44" fill="url(#bomb)" stroke="#5a0714" stroke-width="3"/>'
        '<ellipse cx="48" cy="56" rx="13" ry="7" fill="#fff" opacity=".55" transform="rotate(-35 48 56)"/>'
        '<path d="M64 28 C64 18 74 14 82 10" stroke="#7a4a1a" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<path d="M82 10 l3 -9 3 9 9 3 -9 3 -3 9 -3 -9 -9 -3z" fill="#FFD84A" stroke="#ff8a00" stroke-width="1.5"/>'
        '<circle cx="64" cy="72" r="22" fill="none" stroke="#ffd0d6" stroke-width="2.5" stroke-dasharray="4 6" opacity=".8"/>')
defs = GLOW + '<radialGradient id="bomb" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8a99"/><stop offset=".5" stop-color="#E5324B"/><stop offset="1" stop-color="#6d0a1a"/></radialGradient>'
save('special', 'special_01_ruby_bomb', wrap(body, defs=defs))

# 2 Lightning Crystal (row clear)
b, d = gem(shapes['emerald'], '#FFC21A')
save('special', 'special_02_lightning_crystal', wrap(b + bolt() + arrow(10, 64, (-1, 0)) + arrow(118, 64, (1, 0)), defs=d))
# 3 Vertical Thunder (column clear)
b, d = gem(shapes['sapphire'], '#2F7BFF')
save('special', 'special_03_vertical_thunder', wrap(b + bolt('#fff', '#0b2a6b') + arrow(64, 4, (0, -1)) + arrow(64, 124, (0, 1)), defs=d))
# 4 Rainbow Crystal
rb = ['#FF3B5C', '#FF8A1F', '#FFD21F', '#2FD36E', '#2F9BFF', '#6B4BFF', '#C24BE8']
b, d = gem(poly_ngon(7, 56), '#ffffff', facet_colors=rb)
save('special', 'special_04_rainbow_crystal', wrap(b, defs=d))
# 5 Crystal Nova (star burst)
star = []
for i in range(16):
    r = 60 if i % 2 == 0 else 28
    a = math.radians(-90 + i*22.5); star.append((64+math.cos(a)*r, 64+math.sin(a)*r))
body = ('<polygon points="%s" fill="#FFB32B" opacity=".6" filter="url(#glow)"/>'
        '<polygon points="%s" fill="url(#nova)" stroke="#a24b00" stroke-width="3" stroke-linejoin="round"/>'
        '<circle cx="64" cy="64" r="17" fill="#fff" stroke="#ffb32b" stroke-width="3"/>'
        '<circle cx="64" cy="64" r="8" fill="#FFE9A0"/>' % (pts(star), pts(star)))
defs = GLOW + '<radialGradient id="nova" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#FFD84A"/><stop offset="1" stop-color="#FF7A1A"/></radialGradient>'
save('special', 'special_05_crystal_nova', wrap(body, defs=defs))
# 6 Magic Star
st = []
for i in range(10):
    r = 60 if i % 2 == 0 else 26
    a = math.radians(-90 + i*36); st.append((64+math.cos(a)*r, 66+math.sin(a)*r))
body = ('<polygon points="%s" fill="#FF4FD8" opacity=".6" filter="url(#glow)"/>'
        '<polygon points="%s" fill="url(#ms)" stroke="#7a1a66" stroke-width="3" stroke-linejoin="round"/>'
        '<polygon points="%s" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" transform="translate(64 66) scale(.55) translate(-64 -66)"/>'
        '<ellipse cx="50" cy="48" rx="8" ry="4" fill="#fff" opacity=".7" transform="rotate(-40 50 48)"/>' % (pts(st), pts(st), pts(st)))
defs = GLOW + '<linearGradient id="ms" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE6A8"/><stop offset=".5" stop-color="#FF6FE0"/><stop offset="1" stop-color="#8E2BE8"/></linearGradient>'
save('special', 'special_06_magic_star', wrap(body, defs=defs))
# 7 Crystal Fish
body = ('<path d="M10 64 C28 30 70 28 98 56 L122 34 L122 94 L98 72 C70 100 28 98 10 64Z" fill="#17C6C0" opacity=".6" filter="url(#glow)"/>'
        '<path d="M12 64 C28 32 70 30 98 56 L120 36 L120 92 L98 72 C70 98 28 96 12 64Z" fill="url(#fish)" stroke="#07585a" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M44 38 L58 64 L44 90 M70 36 L82 64 L70 92" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.5"/>'
        '<path d="M52 36 L66 18 L76 40Z M52 92 L66 110 L76 88Z" fill="#7DF3EC" stroke="#07585a" stroke-width="2.5" stroke-linejoin="round"/>'
        '<circle cx="28" cy="58" r="7" fill="#fff" stroke="#07585a" stroke-width="2"/><circle cx="26" cy="58" r="3.5" fill="#07343a"/>')
defs = GLOW + '<linearGradient id="fish" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8FFF9"/><stop offset=".5" stop-color="#17C6C0"/><stop offset="1" stop-color="#0B7E8C"/></linearGradient>'
save('special', 'special_07_crystal_fish', wrap(body, defs=defs))
# 8 Super Crystal
body = ('<circle cx="64" cy="66" r="58" fill="url(#aura)" opacity=".8"/>'
        '<polygon points="22,100 34,52 52,86" fill="#7B5CFF" stroke="#2a1a7a" stroke-width="3" stroke-linejoin="round"/>'
        '<polygon points="106,100 94,52 76,86" fill="#FF5C9E" stroke="#7a1a44" stroke-width="3" stroke-linejoin="round"/>'
        '<polygon points="64,6 90,40 84,112 64,122 44,112 38,40" fill="url(#sup)" stroke="#2a1a7a" stroke-width="3.5" stroke-linejoin="round"/>'
        '<polygon points="64,6 90,40 64,52 38,40" fill="#fff" opacity=".55"/>'
        '<path d="M64 52 V122 M38 40 L64 52 L90 40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>'
        '<path d="M64 8 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff"/>')
defs = ('<radialGradient id="aura"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#C69BFF" stop-opacity=".5"/><stop offset="1" stop-color="#C69BFF" stop-opacity="0"/></radialGradient>'
        '<linearGradient id="sup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1A8"/><stop offset=".3" stop-color="#7DF3EC"/><stop offset=".6" stop-color="#7B5CFF"/><stop offset="1" stop-color="#FF5C9E"/></linearGradient>')
save('special', 'special_08_super_crystal', wrap(body, defs=defs))

# ---------------------------------------------------------------- blockers (128 tiles)
def tile(fill_body, defs=''):
    return wrap(fill_body, defs=defs)
RR = '<rect x="6" y="6" width="116" height="116" rx="18" '
B = {}
B['ice_block'] = tile(
    RR + 'fill="url(#ice)" stroke="#7fd0f2" stroke-width="4"/>'
    '<path d="M22 28 L60 60 L52 104 M60 60 L104 46 M60 60 L88 100" stroke="#fff" stroke-opacity=".75" stroke-width="3" fill="none" stroke-linecap="round"/>'
    '<polygon points="16,16 62,16 16,62" fill="#fff" opacity=".35"/>'
    '<path d="M98 20 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#fff"/>',
    '<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6FAFF" stop-opacity=".9"/><stop offset="1" stop-color="#5DB8E8" stop-opacity=".85"/></linearGradient>')
B['stone_block'] = tile(
    RR + 'fill="#8c8a95" stroke="#4a4955" stroke-width="4"/>'
    '<polygon points="14,14 70,14 52,50 14,60" fill="#b7b5c0"/><polygon points="70,14 114,14 114,46 86,56" fill="#9d9ba7"/>'
    '<polygon points="14,60 52,50 70,100 14,114" fill="#77747f"/><polygon points="52,50 86,56 114,46 114,114 70,114 70,100" fill="#6a6773"/>'
    '<path d="M52 50 L70 100 M86 56 L70 100 M14 60 L52 50 M86 56 L114 46" stroke="#3d3c47" stroke-width="3" fill="none"/>')
B['crystal_cage'] = tile(
    '<circle cx="64" cy="64" r="30" fill="#A24BE8" opacity=".55"/>' +
    RR + 'fill="none" stroke="#d9b24a" stroke-width="6"/>'
    '<path d="M34 8 V120 M64 8 V120 M94 8 V120" stroke="#d9b24a" stroke-width="7" stroke-linecap="round"/>'
    '<path d="M34 8 V120 M64 8 V120 M94 8 V120" stroke="#fff3b8" stroke-width="2" stroke-linecap="round" transform="translate(-1.5 0)"/>'
    '<rect x="6" y="52" width="116" height="10" fill="#b88a22"/><rect x="6" y="68" width="116" height="6" fill="#b88a22" opacity=".6"/>')
B['magic_chain'] = tile(
    ''.join('<g transform="rotate(%d 64 64)">%s</g>' % (a, ''.join(
        '<rect x="%d" y="52" width="26" height="24" rx="12" fill="none" stroke="#c8c8d8" stroke-width="7"/>' % (x)
        for x in (-6, 18, 42, 66, 90, 114))) for a in (45, -45)) +
    '<circle cx="64" cy="64" r="16" fill="#7B5CFF" stroke="#fff" stroke-width="3"/><circle cx="64" cy="64" r="6" fill="#fff"/>')
B['dark_crystal'] = tile(
    '<polygon points="64,4 108,44 98,112 64,124 30,112 20,44" fill="#C21C3B" opacity=".5" filter="url(#glow)"/>'
    '<polygon points="64,8 106,46 96,110 64,120 32,110 22,46" fill="#241338" stroke="#0b0614" stroke-width="4" stroke-linejoin="round"/>'
    '<polygon points="64,8 106,46 64,58 22,46" fill="#4a2a78"/><path d="M64 58 V120 M22 46 L64 58 L106 46" stroke="#7B5CFF" stroke-opacity=".5" stroke-width="2" fill="none"/>'
    '<ellipse cx="64" cy="76" rx="14" ry="8" fill="#FF3B5C"/><ellipse cx="64" cy="76" rx="4" ry="8" fill="#1a0018"/>', GLOW)
B['wooden_box'] = tile(
    RR + 'fill="#b9792f" stroke="#5a3410" stroke-width="4"/>'
    '<rect x="6" y="26" width="116" height="4" fill="#5a3410"/><rect x="6" y="52" width="116" height="4" fill="#5a3410"/>'
    '<rect x="6" y="78" width="116" height="4" fill="#5a3410"/><rect x="6" y="100" width="116" height="4" fill="#5a3410"/>'
    '<path d="M6 6 L122 122 M122 6 L6 122" stroke="#8a5420" stroke-width="9" opacity=".8"/>'
    '<rect x="6" y="6" width="116" height="116" rx="18" fill="none" stroke="#e0a255" stroke-opacity=".5" stroke-width="2"/>'
    '<circle cx="18" cy="18" r="4" fill="#3a2008"/><circle cx="110" cy="18" r="4" fill="#3a2008"/><circle cx="18" cy="110" r="4" fill="#3a2008"/><circle cx="110" cy="110" r="4" fill="#3a2008"/>')
B['lava_tile'] = tile(
    RR + 'fill="#2b1210" stroke="#ff7a1a" stroke-width="4"/>'
    '<path d="M16 40 L44 54 L58 40 L84 66 L112 50 M30 112 L50 84 L74 98 L98 78 M64 14 L58 40 M84 66 L90 112" stroke="#FF6A1A" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)"/>'
    '<path d="M16 40 L44 54 L58 40 L84 66 L112 50 M30 112 L50 84 L74 98 L98 78 M64 14 L58 40 M84 66 L90 112" stroke="#FFD84A" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>', GLOW)
B['crystal_wall'] = tile(
    RR + 'fill="#E9D8FF" stroke="#8a5cd6" stroke-width="4"/>'
    '<polygon points="14,110 34,40 54,110" fill="#C69BFF" stroke="#6a3fb0" stroke-width="3" stroke-linejoin="round"/>'
    '<polygon points="42,110 66,20 90,110" fill="#F4ECFF" stroke="#6a3fb0" stroke-width="3" stroke-linejoin="round"/>'
    '<polygon points="76,110 98,52 116,110" fill="#B07DFF" stroke="#6a3fb0" stroke-width="3" stroke-linejoin="round"/>'
    '<path d="M66 20 V110" stroke="#fff" stroke-width="3" opacity=".8"/>')
B['shadow_portal'] = tile(
    '<circle cx="64" cy="64" r="56" fill="#6b2bd6" opacity=".5" filter="url(#glow)"/>'
    '<circle cx="64" cy="64" r="52" fill="#120a24" stroke="#9b5cff" stroke-width="4"/>'
    '<path d="%s" fill="none" stroke="#b78bff" stroke-width="5" stroke-linecap="round"/>' % ('M' + ' L'.join('%.1f %.1f' % (64+math.cos(t/6)*t*0.75, 64+math.sin(t/6)*t*0.75) for t in range(2, 62, 2))) +
    '<circle cx="64" cy="64" r="6" fill="#fff"/>', GLOW)
B['ancient_seal'] = tile(
    RR + 'fill="#3b2f6b" stroke="#e8c25a" stroke-width="5"/>'
    '<circle cx="64" cy="64" r="38" fill="none" stroke="#e8c25a" stroke-width="5"/><circle cx="64" cy="64" r="28" fill="none" stroke="#e8c25a" stroke-width="2" stroke-dasharray="3 5"/>'
    '<polygon points="64,34 90,78 38,78" fill="none" stroke="#FFE9A0" stroke-width="5" stroke-linejoin="round"/>'
    '<polygon points="64,94 38,50 90,50" fill="none" stroke="#e8c25a" stroke-width="3" stroke-linejoin="round" opacity=".8"/>'
    '<circle cx="64" cy="64" r="5" fill="#FFE9A0"/>')
for i, (n, s) in enumerate(B.items(), 1):
    save('blockers', 'blocker_%02d_%s' % (i, n), s)
print('crystals/special/blockers written to', ROOT)
