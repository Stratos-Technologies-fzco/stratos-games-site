"""Buildings, habitats and decor. Anchor = top vertex of footprint diamond."""
import math, random
from lib import *
from items import ITEMS
from terrain_crops import ICONS_CROP, leaf, G1, G2, G3


def canvas(fw, fd, height):
    w = (fw + fd) * 64 + 16
    h = (fw + fd) * 32 + height + 16
    ox, oy = fd * 64 + 8, height + 8
    return w, h, ox, oy


def ground_shadow(ox, oy, fw, fd, inset=0.06):
    d = diamond(ox + 10, oy + 4, fw, fd)
    cx = sum(p[0] for p in d) / 4; cy = sum(p[1] for p in d) / 4
    d = [(cx + (x - cx) * (1 - inset), cy + (y - cy) * (1 - inset)) for x, y in d]
    return poly(d, '#2a3d12', extra='opacity=".18"')


def sign(cx, cy, icon_body, r=15):
    return circ(cx, cy, r + 2, PAL['wood_d'], OUT, 2) + circ(cx, cy, r, PAL['cream']) + g(icon_body, f'translate({cx - r*0.75:.1f},{cy - r*0.75:.1f}) scale({r*1.5/64:.3f})')


def chimney(x, y, h=18, smoke=False):
    o = rect(x, y - h, 10, h, PAL['red_d'], 1, OUT, 2) + rect(x - 2, y - h - 4, 14, 5, '#7A3020', 1, OUT, 1.5)
    return o


def cylinder(cx, by, r, h, col, top=None):
    top = top or shade(col, .08)
    o = ell(cx, by, r, r / 2, col, OUT, 2)
    o += rect(cx - r, by - h, 2 * r, h, col, 0, None)
    o += f'<rect x="{cx - r:.1f}" y="{by - h:.1f}" width="{r:.1f}" height="{h:.1f}" fill="{shade(col, .05)}"/>'
    o += path(f'M{cx-r},{by-h} L{cx-r},{by} A{r},{r/2} 0 0 0 {cx},{by+r/2} L{cx},{by-h} Z', shade(col, .05))
    o += path(f'M{cx-r},{by-h} L{cx-r},{by} A{r},{r/2} 0 0 0 {cx+r},{by} L{cx+r},{by-h}', 'none', OUT, 2)
    o += ell(cx, by - h, r, r / 2, top, OUT, 2)
    return o


def house(name, fw, fd, wall, roof, H, rh, decorate, along='x', extra_h=0):
    w, h, ox, oy = canvas(fw, fd, H + rh + 40 + extra_h)
    o = ground_shadow(ox, oy, fw, fd)
    box, c = iso_box(ox, oy, fw, fd, H, shade(wall, .05), wall, shade(wall, -.12), inset=0.12)
    o += box
    if along == 'x':
        o += gable_wall(c, rh, shade(wall, -.12))
    o += decorate(c, ox, oy)
    r, ridge = gable_roof(c, rh, roof, along)
    o += r
    return w, h, ox, oy, o, c, ridge


def facade(c, items_left=(), items_right=()):
    o = ''
    for it in items_left:
        o += g(it, face_left(c))
    for it in items_right:
        o += g(it, face_right(c))
    return o


def production(name, wall, roof, sign_icon, chimney_on=True, extras=None):
    H, rh = 62, 34
    def deco(c, ox, oy):
        Lw = math.dist(c['base'][3], c['base'][2])  # unused
        o = facade(c, [door(54, -46, 22, 46), window(14, -44, 22, 20), window(92, -44, 22, 20)],
                   [window(20, -46, 20, 20), window(70, -46, 20, 20)])
        # sign on right wall above windows
        o += g(sign(56, -60 + 10, sign_icon, 13), face_right(c))
        # crates / sacks at front
        b = c['base'][2]
        o += iso_box(b[0] - 52, b[1] - 18, 0.2, 0.2, 14, PAL['wood'], outline=True)[0]
        return o
    w, h, ox, oy, o, c, ridge = house(name, 2, 2, wall, roof, H, rh, deco)
    if chimney_on:
        R1, R2 = ridge
        o += chimney(R1[0] + (R2[0] - R1[0]) * 0.3 - 5, R1[1] + (R2[1] - R1[1]) * 0.3 + 14)
    if extras:
        o += extras(c, ridge)
    return w, h, ox, oy, o


def save_bld(cat, name, w, h, ox, oy, body, fw, fd, note=''):
    save(cat, name, w, h, body, anchor=[ox, oy], note=f'footprint {fw}x{fd}' + (f'; {note}' if note else ''))


# ---------------- core buildings ----------------
def farmhouse():
    H, rh = 78, 46
    def deco(c, ox, oy):
        o = facade(c, [window(20, -66, 26, 24), window(110, -66, 26, 24), door(70, -54, 26, 54),
                       rect(56, -58, 54, 6, PAL['wood_d'], 2, OUT, 1.5)],
                   [window(26, -66, 26, 24), window(94, -66, 26, 24), window(60, -36, 26, 22)])
        # flower boxes
        o += facade(c, [rect(18, -40, 30, 6, PAL['wood'], 2, OUT, 1.2) + circ(24, -42, 3, PAL['pink']) + circ(33, -42, 3, PAL['yellow']) + circ(42, -42, 3, PAL['pink'])])
        return o
    w, h, ox, oy, o, c, ridge = house('farmhouse', 3, 3, PAL['cream'], PAL['roof_red'], H, rh, deco)
    R1, R2 = ridge
    o += chimney(R1[0] + (R2[0] - R1[0]) * 0.7 - 5, R1[1] + (R2[1] - R1[1]) * 0.7 + 18, 24)
    # porch step
    save_bld('buildings', 'farmhouse', w, h, ox, oy, o, 3, 3)


def barn():
    H, rh = 80, 54
    def deco(c, ox, oy):
        o = facade(c, [rect(52, -66, 60, 66, PAL['red_d'], 2, OUT, 2) +
                       path('M52,-66 L112,0 M112,-66 L52,0', 'none', '#ffffff', 4) + rect(52, -66, 60, 66, 'none', 2, '#ffffff', 4) +
                       window(20, -60, 20, 18) + window(124, -60, 20, 18)],
                   [window(30, -60, 22, 18), window(96, -60, 22, 18), rect(58, -36, 30, 10, '#ffffff', 2, OUT, 1)])
        return o
    w, h, ox, oy, o, c, ridge = house('barn', 3, 3, PAL['red'], PAL['brown'], H, rh, deco, along='x')
    # hayloft window on gable
    A, B, C, D = c['top']
    m = ((B[0] + C[0]) / 2, (B[1] + C[1]) / 2)
    o += g(rect(-10, -30, 20, 20, PAL['cream'], 2, OUT, 2) + rect(-6, -26, 12, 12, '#F2CF55'), f'matrix(1,-0.5,0,1,{m[0]:.1f},{m[1]:.1f})')
    save_bld('buildings', 'barn', w, h, ox, oy, o, 3, 3, 'storage')


def silo():
    w, h = 96, 200
    ox, oy = 48, 136
    o = ground_shadow(ox, oy, 1, 1)
    cx, by = 48, 168
    o += cylinder(cx, by, 34, 116, '#C9D3DA', '#E2E8EC')
    for y in range(by - 100, by, 22):
        o += path(f'M{cx-34},{y} A34,17 0 0 0 {cx+34},{y}', 'none', '#9AA6AE', 2)
    o += path(f'M{cx-36},{by-116} Q{cx},{by-170} {cx+36},{by-116} Z', PAL['roof_red'], OUT, 2)
    o += ell(cx, by - 116, 36, 9, shade(PAL['roof_red'], -.15), OUT, 2)
    o += rect(cx - 8, by - 40, 16, 34, PAL['wood_d'], 2, OUT, 1.5)
    save_bld('buildings', 'silo', w, h, ox, oy, o, 1, 1, 'storage')


def windmill_frames():
    H, rh = 0, 0
    w, h, ox, oy = canvas(2, 2, 210)
    base = ground_shadow(ox, oy, 2, 2)
    cx = ox; by = oy + 64 + 24
    # tapered tower
    base += path(f'M{cx-44},{by} L{cx-26},{by-130} L{cx+26},{by-130} L{cx+44},{by} A44,22 0 0 1 {cx-44},{by} Z', PAL['cream'], OUT, 2)
    base += path(f'M{cx+6},{by-130} L{cx+26},{by-130} L{cx+44},{by} A44,22 0 0 1 {cx+14},{by+20} Z', PAL['cream_d'])
    for y in (by - 40, by - 85):
        base += path(f'M{cx-38},{y} Q{cx},{y+18} {cx+38},{y}', 'none', '#D8C9A8', 2)
    base += door(cx - 12, by - 30, 24, 40) + window(cx - 9, by - 100, 18, 18)
    base += path(f'M{cx-34},{by-128} Q{cx},{by-178} {cx+34},{by-128} Z', PAL['roof_red'], OUT, 2)
    base += g(sign(0, 0, ITEMS['flour'](), 12), f'translate({cx + 22},{by - 56})')
    hub = (cx - 10, by - 138)
    for fi in range(4):
        o = base
        for k in range(4):
            a = math.radians(fi * 22.5 + k * 90)
            ex, ey = hub[0] + 84 * math.cos(a), hub[1] + 84 * math.sin(a) * 0.95
            nx, ny = -math.sin(a) * 12, math.cos(a) * 12
            o += path(f'M{hub[0]:.1f},{hub[1]:.1f} L{ex:.1f},{ey:.1f}', 'none', PAL['wood_d'], 4)
            p1 = (hub[0] + (ex - hub[0]) * .25, hub[1] + (ey - hub[1]) * .25)
            o += poly([p1, (ex, ey), (ex + nx, ey + ny), (p1[0] + nx * .6, p1[1] + ny * .6)], '#FFFDF5', OUT, 1.5, 'opacity=".95"')
        o += circ(*hub, 7, PAL['wood_d'], OUT, 2)
        save_bld('buildings', f'flour_mill_{fi}', w, h, ox, oy, o, 2, 2, 'production; 4-frame blade loop')


def productions():
    defs = [
        ('bakery', '#F5E1B8', PAL['orange_d'], ITEMS['bread']()),
        ('feed_mill', PAL['wood'], PAL['roof_green'], ITEMS['animal_feed']()),
        ('dairy', '#F4F7FA', PAL['roof_blue'], ITEMS['milk']()),
        ('sugar_mill', '#F7E7A0', PAL['roof_red'], ITEMS['sugar']()),
        ('textile_mill', '#E7DDF2', '#7E5BB8', ITEMS['fabric']()),
        ('juice_press', '#FFD9B0', PAL['roof_green'], ITEMS['tomato_juice']()),
        ('jam_kitchen', '#FFE0E6', '#C94F6A', ITEMS['strawberry_jam']()),
    ]
    for nm, wall, roof, icon in defs:
        w, h, ox, oy, o = production(nm, wall, roof, icon)
        save_bld('buildings', nm, w, h, ox, oy, o, 2, 2, 'production')


def construction_site():
    w, h, ox, oy = canvas(2, 2, 120)
    o = ground_shadow(ox, oy, 2, 2) + poly(diamond(ox, oy, 2, 2), PAL['soil_l'], OUT, 1.5)
    # half wall + scaffolding poles + planks
    box, c = iso_box(ox, oy, 2, 2, 28, '#E9D9B6', inset=0.2)
    o += box
    for (x, y) in (c['base'][3], c['base'][2], c['base'][1]):
        o += rect(x - 3, y - 100, 6, 100, PAL['wood'], 1, OUT, 1.5)
    L, B, R = c['base'][3], c['base'][2], c['base'][1]
    for hgt in (50, 90):
        o += path(f'M{L[0]},{L[1]-hgt} L{B[0]},{B[1]-hgt} L{R[0]},{R[1]-hgt}', 'none', PAL['wood_d'], 6)
    o += path(f'M{L[0]},{L[1]-10} L{B[0]},{B[1]-90} M{B[0]},{B[1]-10} L{R[0]},{R[1]-90}', 'none', PAL['wood'], 3)
    # caution sign
    o += g(poly([(0, -14), (13, 9), (-13, 9)], PAL['yellow'], OUT, 2) + rect(-1.5, -6, 3, 8, OUT) + circ(0, 5, 1.6, OUT), f'translate({B[0]},{B[1]+6})')
    save_bld('buildings', 'construction_2x2', w, h, ox, oy, o, 2, 2, 'under construction / upgrading')


# ---------------- habitats ----------------
def fence_ring(ox, oy, fw, fd, col=PAL['wood']):
    d = diamond(ox, oy, fw, fd)
    o_back, o_front = '', ''
    edges = [(d[0], d[1], 'b'), (d[3], d[0], 'b'), (d[3], d[2], 'f'), (d[2], d[1], 'f')]
    for a, b, side in edges:
        n = 6
        seg = ''
        for k in range(n + 1):
            x = a[0] + (b[0] - a[0]) * k / n; y = a[1] + (b[1] - a[1]) * k / n
            seg += rect(x - 2.5, y - 18, 5, 20, col, 1.5, OUT, 1.2)
        for hgt in (8, 15):
            seg = path(f'M{a[0]},{a[1]-hgt} L{b[0]},{b[1]-hgt}', 'none', OUT, 5) + path(f'M{a[0]},{a[1]-hgt} L{b[0]},{b[1]-hgt}', 'none', shade(col, .1), 3) + seg
        if side == 'b': o_back += seg
        else: o_front += seg
    return o_back, o_front


def habitat(name, floor, roof, wall, icon, water=False):
    fw = fd = 2
    w, h, ox, oy = canvas(fw, fd, 90)
    o = ground_shadow(ox, oy, fw, fd, 0)
    o += poly(diamond(ox, oy, fw, fd), floor, OUT, 1.5)
    rng = random.Random(len(name))
    for _ in range(18):
        u, v = rng.random(), rng.random()
        x, y = ox + (u - v) * 128, oy + (u + v) * 64
        o += path(f'M{x-3:.1f},{y:.1f} l6,-1', 'none', shade(floor, .12), 1.5)
    if water:
        d = diamond(ox, oy, 2, 2)
        cx, cy = ox, oy + 64
        o += ell(cx + 12, cy + 10, 64, 30, '#7A5A3A') + ell(cx + 12, cy + 8, 60, 27, PAL['water'], OUT, 1.5)
        o += path(f'M{cx-10},{cy+6} q6,-3 12,0 M{cx+24},{cy+16} q6,-3 12,0', 'none', '#fff', 2, 'opacity=".7"')
    back, front = fence_ring(ox, oy, fw, fd)
    o += back
    # shelter at back corner
    sx, sy = ox, oy + 8
    box, c = iso_box(sx, sy, 0.9, 0.9, 34, shade(wall, .05), wall, shade(wall, -.12))
    o += box + facade(c, [door(18, -28, 20, 28)])
    r, _ = gable_roof(c, 22, roof, 'x', 8)
    o += gable_wall(c, 22, shade(wall, -.12)) + r
    o += g(sign(0, 0, icon, 11), f'translate({c["top"][1][0]-4:.1f},{c["top"][1][1]+18:.1f})')
    # trough
    tx, ty = ox + 60, oy + 82
    o += iso_box(tx, ty, 0.45, 0.18, 10, PAL['wood'], outline=True)[0] + ell(tx - 2, ty - 5, 14, 3, '#E9C24A')
    o += front
    save_bld('habitats', name, w, h, ox, oy, o, fw, fd, 'animal habitat')


def make_habitats():
    habitat('chicken_coop', '#D9B87A', PAL['roof_red'], PAL['cream'], ITEMS['egg']())
    habitat('cow_pasture', PAL['grass_d'], PAL['brown'], PAL['red'], ITEMS['milk']())
    habitat('sheep_pen', PAL['grass'], PAL['roof_blue'], PAL['cream'], ITEMS['wool']())
    habitat('pig_pen', '#9A6A44', PAL['roof_green'], PAL['wood'], ITEMS['truffle']())
    habitat('goat_yard', '#B9A26A', '#7E5BB8', PAL['cream'], ITEMS['goat_milk']())
    habitat('duck_pond', PAL['grass'], PAL['orange_d'], PAL['cream'], ITEMS['feather'](), water=True)


# ---------------- decor ----------------
def tree(kind, seed=1):
    rng = random.Random(seed)
    w, h = 128, 176
    bx, by = 64, 156
    o = shadow(bx + 6, by, 34, 12, .22)
    o += path(f'M{bx-7},{by} L{bx-5},{by-56} L{bx+5},{by-56} L{bx+7},{by} Q{bx},{by+4} {bx-7},{by} Z', PAL['wood_d'], OUT, 2)
    if kind == 'pine':
        for i, (yy, r) in enumerate(((by - 40, 40), (by - 76, 32), (by - 108, 22))):
            c = G3 if i % 2 == 0 else '#4A9A40'
            o += path(f'M{bx-r},{yy} Q{bx},{yy+12} {bx+r},{yy} L{bx},{yy-r*1.3} Z', c, OUT, 2)
            o += path(f'M{bx},{yy-r*1.3} L{bx+r},{yy} Q{bx+r*0.5},{yy+6} {bx+4},{yy+8} Z', shade(c, -.06))
    else:
        base_c = '#5DB043' if kind != 'autumn' else PAL['orange']
        blobs = [(bx - 26, by - 72, 26), (bx + 24, by - 74, 26), (bx, by - 98, 32), (bx - 10, by - 66, 24), (bx + 10, by - 62, 22)]
        for x, y, r in blobs:
            o += circ(x, y, r, shade(base_c, -.08), OUT, 2)
        for x, y, r in blobs:
            o += circ(x, y, r - 2, base_c)
        for x, y, r in blobs[:3]:
            o += circ(x - r * .3, y - r * .3, r * .45, shade(base_c, .1))
        if kind == 'apple':
            for _ in range(7):
                x, y = bx + rng.uniform(-38, 38), by - rng.uniform(60, 110)
                o += circ(x, y, 4.5, PAL['red'], OUT, 1.2) + circ(x - 1.5, y - 1.5, 1.2, '#fff')
    save('decor', f'tree_{kind}', w, h, o, anchor=[64, 124], note='footprint 1x1')


def small(name, w, h, body, anchor):
    save('decor', name, w, h, body, anchor=anchor, note='footprint 1x1')


def make_decor():
    tree('oak', 1); tree('pine', 2); tree('apple', 3); tree('autumn', 4)
    # bush
    o = shadow(70, 76, 30, 9) + ''.join(circ(x, y, r, '#4FA046', OUT, 2) for x, y, r in ((52, 62, 16), (78, 60, 18), (64, 50, 18)))
    o += ''.join(circ(x, y, r - 2, '#5DB043') for x, y, r in ((52, 62, 16), (78, 60, 18), (64, 50, 18))) + circ(58, 46, 6, '#7BC74D')
    small('bush', 128, 96, o, [64, 64])
    # berry bush
    small('bush_berry', 128, 96, o + ''.join(circ(x, y, 3, '#7A4FC0', OUT, 1) for x, y in ((50, 60), (70, 50), (84, 62), (62, 66))), [64, 64])
    # flowers patch
    rng = random.Random(9); o = ''
    for _ in range(14):
        x, y = 64 + rng.uniform(-40, 40), 64 + rng.uniform(-14, 14)
        c = rng.choice([PAL['pink'], PAL['yellow'], '#fff', '#B98BE8'])
        o += path(f'M{x},{y} l0,-10', 'none', G3, 2) + ''.join(circ(x + 3 * math.cos(a), y - 12 + 3 * math.sin(a), 2.4, c) for a in range(0, 6)) + circ(x, y - 12, 1.8, PAL['orange'])
    small('flowers', 128, 96, o, [64, 32])
    # rocks
    small('rock_small', 96, 64, shadow(50, 50, 22, 7) + path('M30,50 Q28,30 46,26 Q66,24 70,44 Q70,54 50,54 Q34,54 30,50 Z', PAL['stone'], OUT, 2) +
          path('M40,32 Q50,28 58,34', 'none', '#D6D2CA', 3), [48, 20])
    small('rock_large', 128, 112, shadow(66, 92, 44, 13) + path('M22,92 Q14,56 44,40 Q70,26 96,46 Q114,64 106,90 Q80,100 50,98 Q30,98 22,92 Z', PAL['stone'], OUT, 2) +
          path('M60,40 Q80,60 70,96', 'none', PAL['stone_d'], 2) + path('M40,52 Q52,44 64,46', 'none', '#D6D2CA', 4), [64, 48])
    small('tree_stump', 96, 72, shadow(50, 56, 24, 8) + path('M30,52 L32,32 L64,32 L66,52 Q48,60 30,52 Z', PAL['wood'], OUT, 2) +
          ell(48, 32, 16, 7, PAL['brown_l'], OUT, 2) + ell(48, 32, 9, 4, 'none', '#9A6438', 1.2), [48, 24])
    small('log_pile', 128, 80, shadow(66, 60, 40, 10) + ''.join(
        rect(x - 30, y - 8, 60, 16, PAL['wood'], 8, OUT, 2) + ell(x + 30, y, 7, 8, PAL['brown_l'], OUT, 2) for x, y in ((56, 56), (72, 54), (64, 40))), [64, 36])
    small('hay_bale', 96, 72, shadow(50, 58, 30, 8) + iso_box(48, 30, 0.38, 0.22, 20, '#F2CF55', '#E0B83A', '#C99E2A')[0] +
          path('M30,40 l12,6 M56,44 l10,-5', 'none', '#B68A22', 2), [48, 30])
    # fences (along gx and gy)
    for nm, (a, b) in (('fence_x', ((8, 24), (72, 56))), ('fence_y', ((56, 56), (120, 24)))):
        o = ''
        for hgt in (10, 20):
            o += path(f'M{a[0]},{a[1]-hgt} L{b[0]},{b[1]-hgt}', 'none', OUT, 6) + path(f'M{a[0]},{a[1]-hgt} L{b[0]},{b[1]-hgt}', 'none', PAL['wood'], 4)
        for k in range(3):
            x = a[0] + (b[0] - a[0]) * k / 2; y = a[1] + (b[1] - a[1]) * k / 2
            o += rect(x - 3.5, y - 26, 7, 28, PAL['wood'], 2, OUT, 1.5)
        small(nm, 128, 64, o, [64, 8])
    # well
    o = shadow(66, 92, 34, 11) + cylinder(64, 88, 28, 30, PAL['stone'], PAL['stone_d']) + ell(64, 58, 20, 9, '#2E5A7A')
    o += rect(36, 10, 6, 52, PAL['wood_d'], 1, OUT, 1.5) + rect(86, 10, 6, 52, PAL['wood_d'], 1, OUT, 1.5)
    o += path('M28,18 L64,0 L100,18 L96,22 L64,6 L32,22 Z', PAL['roof_red'], OUT, 2) + rect(40, 26, 48, 5, PAL['wood'], 2, OUT, 1.2)
    small('well', 128, 112, o, [64, 56])
    # mailbox, lamp, bench, scarecrow, signpost, for-sale sign
    small('mailbox', 64, 80, shadow(34, 72, 12, 4) + rect(30, 34, 5, 38, PAL['wood_d'], 1, OUT, 1.2) +
          path('M18,36 L18,22 Q18,12 32,12 Q46,12 46,22 L46,36 Z', PAL['roof_blue'], OUT, 2) + rect(44, 14, 3, 12, PAL['red'], 1, OUT, 1), [32, 40])
    small('lamp_post', 64, 128, shadow(34, 120, 12, 4) + rect(29, 40, 6, 80, '#4A4A52', 2, OUT, 1.5) + rect(24, 114, 16, 6, '#4A4A52', 2, OUT, 1.5) +
          path('M20,40 L44,40 L40,22 L24,22 Z', '#FFE58A', OUT, 2) + path('M18,22 L46,22 L32,10 Z', '#4A4A52', OUT, 2) + circ(32, 32, 14, '#FFE58A', extra='opacity=".25"'), [32, 88])
    small('bench', 96, 72, shadow(50, 58, 30, 8) + path('M16,40 L64,64 L80,56 L32,32 Z', PAL['wood'], OUT, 2) +
          path('M32,32 L80,56 L80,40 L32,16 Z', PAL['wood_l'] if 'wood_l' in PAL else PAL['brown_l'], OUT, 2) +
          rect(20, 42, 4, 14, '#4A4A52') + rect(60, 62, 4, 10, '#4A4A52') + rect(76, 56, 4, 10, '#4A4A52'), [48, 30])
    o = shadow(50, 120, 16, 5) + rect(46, 40, 6, 82, PAL['wood_d'], 1, OUT, 1.5) + rect(18, 54, 62, 6, PAL['wood_d'], 1, OUT, 1.5)
    o += path('M34,56 L64,56 L68,94 L30,94 Z', '#4F8FD1', OUT, 2) + path('M34,94 L40,104 M60,94 L56,104', 'none', '#F2CF55', 4)
    o += circ(49, 40, 13, '#F2E1B0', OUT, 2) + circ(44, 39, 1.8, OUT) + circ(54, 39, 1.8, OUT) + path('M44,45 q5,4 10,0', 'none', OUT, 1.5)
    o += path('M30,32 L68,32 L60,20 L38,20 Z', '#C9A46A', OUT, 2) + rect(36, 28, 26, 4, PAL['red'])
    o += ''.join(path(f'M{x},58 l{d},6', 'none', '#F2CF55', 3) for x, d in ((20, -6), (78, 6)))
    small('scarecrow', 96, 128, o, [48, 96])
    small('signpost', 64, 96, shadow(34, 88, 12, 4) + rect(29, 24, 6, 64, PAL['wood_d'], 1, OUT, 1.5) +
          path('M10,26 L50,26 L58,34 L50,42 L10,42 Z', PAL['wood'], OUT, 2) + path('M54,48 L14,48 L6,56 L14,64 L54,64 Z', PAL['wood'], OUT, 2), [32, 56])
    small('sign_for_sale', 64, 96, shadow(34, 88, 12, 4) + rect(29, 36, 6, 52, PAL['wood_d'], 1, OUT, 1.5) +
          rect(8, 18, 48, 34, PAL['cream'], 4, OUT, 2) + rect(12, 22, 40, 26, 'none', 2, PAL['red'], 2) +
          g(ITEMS_COIN(), 'translate(18,22) scale(.42)'), [32, 56])


def ITEMS_COIN():
    return circ(32, 32, 26, PAL['yellow'], OUT, 3) + circ(32, 32, 19, 'none', PAL['yellow_d'], 3) + \
        f'<text x="32" y="42" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="28" fill="{PAL["yellow_d"]}">S</text>'


if __name__ == '__main__':
    farmhouse(); barn(); silo(); windmill_frames(); productions(); construction_site()
    make_habitats(); make_decor()
    dump_registry('reg_buildings.json'); print(len(REGISTRY))
