import random
from lib import *

# ================= TERRAIN =================
def clip_diamond(id_, ox=64, oy=0):
    return f'<clipPath id="{id_}"><polygon points="{P(diamond(ox, oy))}"/></clipPath>'


def tufts(rng, n, col, area=(10, 118, 8, 56)):
    s = ''
    for _ in range(n):
        x = rng.uniform(*area[:2]); y = rng.uniform(*area[2:])
        s += path(f'M{x-3:.1f},{y:.1f} l2,-5 l1,5 l2,-6 l1,6', 'none', col, 1.6)
    return s


def grass_tile(name, seed, base=PAL['grass'], flowers=False, h=0):
    rng = random.Random(seed)
    s = '<defs>' + clip_diamond('c') + '</defs>'
    s += poly(diamond(64, 0), base)
    inner = ''
    for _ in range(7):
        x, y = rng.uniform(10, 118), rng.uniform(6, 58)
        inner += ell(x, y, rng.uniform(8, 16), rng.uniform(4, 7), shade(base, rng.choice([0.04, -0.04])), extra='opacity=".8"')
    inner += tufts(rng, 9, shade(base, -0.12))
    inner += tufts(rng, 5, shade(base, 0.10))
    if flowers:
        for _ in range(6):
            x, y = rng.uniform(20, 108), rng.uniform(14, 50)
            c = rng.choice([PAL['white'], PAL['yellow'], PAL['pink']])
            for a in range(5):
                import math
                inner += circ(x + 2.4 * math.cos(a * 1.256), y + 1.6 * math.sin(a * 1.256), 1.7, c)
            inner += circ(x, y, 1.3, PAL['orange'])
    s += f'<g clip-path="url(#c)">{inner}</g>'
    s += poly(diamond(64, 0), 'none', shade(base, -0.10), 1, 'opacity=".5"')
    save('terrain', name, 128, 64, s, anchor=[64, 0])


def flat_tile(name, base, detail_fn=None, seed=1):
    rng = random.Random(seed)
    s = '<defs>' + clip_diamond('c') + '</defs>' + poly(diamond(64, 0), base)
    if detail_fn:
        s += f'<g clip-path="url(#c)">{detail_fn(rng)}</g>'
    s += poly(diamond(64, 0), 'none', shade(base, -0.15), 1, 'opacity=".6"')
    save('terrain', name, 128, 64, s, anchor=[64, 0])


def dirt_detail(rng):
    s = ''
    for _ in range(14):
        s += ell(rng.uniform(8, 120), rng.uniform(6, 58), rng.uniform(1.5, 3.5), rng.uniform(1, 2.2), PAL['soil_d'], extra='opacity=".5"')
    for _ in range(8):
        s += ell(rng.uniform(8, 120), rng.uniform(6, 58), rng.uniform(1, 2.5), rng.uniform(1, 1.6), PAL['soil_l'])
    return s


def plowed_detail(rng, wet=False):
    s = ''
    # furrows parallel to gx axis (down-right direction)
    for i in range(5):
        t = (i + 0.5) / 5
        x0, y0 = 64 - 64 * t, 32 * t
        s += path(f'M{x0:.1f},{y0+1:.1f} l64,32', 'none', PAL['soil_d'], 5)
        s += path(f'M{x0:.1f},{y0-2:.1f} l64,32', 'none', PAL['soil_l'], 2.4, 'opacity=".9"')
    if wet:
        s += ell(64, 34, 34, 13, PAL['water'], extra='opacity=".45"')
    return s


def path_stone(rng):
    s = ''
    for gx in range(3):
        for gy in range(3):
            u, v = (gx + 0.5) / 3 + rng.uniform(-.04, .04), (gy + 0.5) / 3 + rng.uniform(-.04, .04)
            x, y = 64 + (u - v) * 64, (u + v) * 32
            c = shade(PAL['stone'], rng.uniform(-.06, .06))
            s += ell(x, y + 1.5, 17, 8, PAL['stone_d']) + ell(x, y, 17, 8, c) + ell(x - 4, y - 2, 7, 3, shade(c, .08))
    return s


def water_detail(frame):
    def f(rng):
        s = ''
        for i in range(6):
            x = 20 + (i * 17 + frame * 6) % 92; y = 14 + (i * 11) % 36
            s += path(f'M{x},{y} q5,-3 10,0 q5,3 10,0', 'none', '#ffffff', 2, 'opacity=".55"')
        s += ell(64, 32, 44, 18, PAL['water_d'], extra='opacity=".25"')
        return s
    return f


def make_terrain():
    grass_tile('grass_1', 1)
    grass_tile('grass_2', 2)
    grass_tile('grass_3', 3, base=shade(PAL['grass'], -0.03))
    grass_tile('grass_flowers', 4, flowers=True)
    flat_tile('dirt', PAL['soil'], dirt_detail)
    flat_tile('field_plowed', PAL['soil'], lambda r: plowed_detail(r))
    flat_tile('field_paddy', PAL['soil'], lambda r: plowed_detail(r, True))
    flat_tile('path_stone', shade(PAL['grass'], -0.05), path_stone)
    flat_tile('path_dirt', PAL['soil_l'], lambda r: ''.join(ell(r.uniform(10, 118), r.uniform(8, 56), 2, 1.2, PAL['soil'], extra='opacity=".6"') for _ in range(18)))
    flat_tile('sand', '#EBD08C', lambda r: ''.join(circ(r.uniform(10, 118), r.uniform(8, 56), 1, '#C9AE68') for _ in range(30)))
    for fr in range(3):
        flat_tile(f'water_{fr}', PAL['water'], water_detail(fr))
    # locked land: desaturated grass + diagonal hatching
    s = '<defs>' + clip_diamond('c') + '</defs>' + poly(diamond(64, 0), '#9DB08A')
    s += '<g clip-path="url(#c)">' + ''.join(path(f'M{x},0 l-40,64', 'none', '#8A9C77', 6) for x in range(0, 200, 18)) + '</g>'
    s += poly(diamond(64, 0), 'none', '#7A8A68', 1)
    save('terrain', 'locked_land', 128, 64, s, anchor=[64, 0])
    # island edge skirts (place under border tiles)
    for side in ('left', 'right'):
        if side == 'left':
            pts = [(0, 32), (64, 64), (64, 92), (0, 60)]; c = PAL['soil']
        else:
            pts = [(64, 64), (128, 32), (128, 60), (64, 92)]; c = PAL['soil_d']
        s = poly(pts, c, OUT, 1.5)
        top = [pts[0], pts[1], (pts[1][0], pts[1][1] + 7), (pts[0][0], pts[0][1] + 7)]
        s += poly(top, PAL['grass_d'])
        for i in range(5):
            x = pts[0][0] + 10 + i * 11
            y = (pts[0][1] + (pts[1][1] - pts[0][1]) * ((x - pts[0][0]) / 64)) + 16 + (i % 2) * 6
            s += ell(x, y, 3, 2, shade(c, -.1))
        save('terrain', f'edge_{side}', 128, 96, s, anchor=[64, 0])
    # cursors / placement overlays
    for nm, col, fillop in (('cursor_select', PAL['yellow'], 0.15), ('place_ok', '#38D46A', 0.45),
                            ('place_bad', '#F04438', 0.45), ('cursor_hover', '#FFFFFF', 0.18)):
        d = diamond(64, 2, 1, 1)
        d = [(x, y) for x, y in d]
        s = poly([(64, 2), (124, 32), (64, 62), (4, 32)], col, col, 4, f'fill-opacity="{fillop}"')
        save('terrain', nm, 128, 64, s, anchor=[64, 0])


# ================= CROPS =================
def leaf(x, y, l, ang, col, w=0.38):
    import math
    a = math.radians(ang)
    ex, ey = x + l * math.cos(a), y - l * math.sin(a)
    nx, ny = -math.sin(a) * l * w, -math.cos(a) * l * w
    mx, my = (x + ex) / 2, (y + ey) / 2
    return path(f'M{x:.1f},{y:.1f} Q{mx+nx:.1f},{my+ny:.1f} {ex:.1f},{ey:.1f} Q{mx-nx:.1f},{my-ny:.1f} {x:.1f},{y:.1f} Z',
                col, shade(col, -0.25), 1)


G1, G2, G3 = '#8FD45A', '#5DB043', '#3F8C35'


def sprout():
    return leaf(0, 0, 7, 60, G1) + leaf(0, 0, 7, 120, G2)


def p_wheat(s):
    if s == 1: return sprout() + leaf(0, 0, 9, 90, G1, .2)
    col = G2 if s == 2 else '#E9C24A'
    h = 18 if s == 2 else 26
    o = ''
    for dx, ang in ((-4, 100), (0, 90), (4, 80), (-2, 95), (2, 85)):
        o += path(f'M{dx*0.3:.1f},0 Q{dx:.1f},{-h*0.5:.1f} {dx*1.6:.1f},{-h:.1f}', 'none', shade(col, -.1), 1.6)
        if s == 3:
            o += ell(dx * 1.6, -h - 3, 2.2, 5, '#F2CF55', '#B68A22', 1)
    return o


def p_carrot(s):
    if s == 1: return sprout()
    n = 3 if s == 2 else 5
    o = ''.join(leaf(0, 0, 8 + 4 * s, 60 + i * (60 / (n - 1)), G2 if i % 2 else G1, .22) for i in range(n))
    if s == 3:
        o = path('M-4,1 L0,-3 L4,1 Z', PAL['orange'], PAL['orange_d'], 1) + o
        o = ell(0, 0, 5, 3, PAL['orange'], PAL['orange_d'], 1) + o
    return o


def p_corn(s):
    if s == 1: return sprout() + leaf(0, 0, 10, 90, G2, .15)
    h = 24 if s == 2 else 40
    o = rect(-1.5, -h, 3, h, G3)
    for i, y in enumerate(range(4, h - 4, 8)):
        o += leaf(0, -y, 12, 30 if i % 2 else 150, G2 if i % 2 else G1, .2)
    if s == 3:
        o += ell(4, -h * 0.55, 3.5, 8, PAL['yellow'], PAL['yellow_d'], 1) + leaf(2, -h * 0.4, 10, 75, G1, .25)
        o += path(f'M0,{-h} l-3,-6 M0,{-h} l3,-6 M0,{-h} l0,-7', 'none', '#D9B25A', 1.5)
    return o


def bush(r, col=G2):
    return ell(0, -r * 0.8, r, r * 0.85, col, shade(col, -.25), 1.2) + ell(-r * 0.3, -r * 1.05, r * 0.45, r * 0.35, shade(col, .1))


def p_tomato(s):
    if s == 1: return sprout()
    o = rect(-1, -20, 2, 20, G3) + bush(8 if s == 2 else 10)
    if s == 3:
        for x, y in ((-5, -6), (4, -9), (-1, -14), (6, -3)):
            o += circ(x, y, 3.2, PAL['red'], PAL['red_d'], 1) + circ(x - 1, y - 1, 1, '#fff', extra='opacity=".7"')
    return o


def p_potato(s):
    if s == 1: return sprout()
    o = bush(7 if s == 2 else 9, '#6DB64A')
    if s == 3:
        o = ell(-5, 1, 4, 3, '#C9A06A', '#8E6A3A', 1) + ell(4, 1, 3.5, 2.6, '#C9A06A', '#8E6A3A', 1) + o
        for x, y in ((-3, -14), (4, -12)):
            o += circ(x, y, 2, '#fff') + circ(x, y, 0.9, PAL['yellow'])
    return o


def p_strawberry(s):
    if s == 1: return sprout()
    o = ''.join(leaf(0, 0, 7 + s, a, G2 if i % 2 else G1, .5) for i, a in enumerate((30, 90, 150)))
    if s == 3:
        for x, y in ((-6, -2), (5, -1), (0, -4)):
            o += path(f'M{x-3},{y-3} Q{x},{y+5} {x+3},{y-3} Z', PAL['red'], PAL['red_d'], 1) + path(f'M{x-2},{y-3} l2,-2 l2,2', G2, None)
    elif s == 2:
        o += circ(-4, -8, 1.6, '#fff') + circ(4, -9, 1.6, '#fff')
    return o


def p_sunflower(s):
    if s == 1: return sprout()
    h = 18 if s == 2 else 32
    o = rect(-1.2, -h, 2.4, h, G3) + leaf(0, -h * 0.4, 9, 20, G2, .45) + leaf(0, -h * 0.55, 9, 160, G1, .45)
    if s == 2:
        o += circ(0, -h, 4, G1, G3, 1)
    else:
        import math
        for i in range(12):
            a = i * math.pi / 6
            o += ell(7 * math.cos(a), -h + 7 * math.sin(a), 3.5, 2, PAL['yellow'], PAL['yellow_d'], .8,
                     f'transform="rotate({math.degrees(a):.0f} {7*math.cos(a):.1f} {-h+7*math.sin(a):.1f})"')
        o += circ(0, -h, 5, '#7A4A22', '#4E2E14', 1)
    return o


def p_pumpkin(s):
    if s == 1: return sprout()
    o = leaf(0, 0, 10, 20, G2, .55) + leaf(0, 0, 10, 160, G1, .55) + leaf(0, 0, 9, 90, G2, .55)
    if s == 3:
        o += ell(-4, -6, 6, 6.5, PAL['orange'], PAL['orange_d'], 1) + ell(4, -6, 6, 6.5, PAL['orange'], PAL['orange_d'], 1)
        o += ell(0, -6, 6, 7, shade(PAL['orange'], .05), PAL['orange_d'], 1) + rect(-1, -15, 2.5, 4, G3)
    elif s == 2:
        o += circ(0, -4, 3, G1, G3, 1)
    return o


def p_cabbage(s):
    if s == 1: return sprout()
    r = 6 if s == 2 else 9
    o = ''.join(leaf(0, -1, r + 3, a, G2, .55) for a in (10, 170))
    o += ell(0, -r * 0.8, r, r * 0.8, '#A9DE7A', '#5E9B3A', 1.2)
    o += path(f'M{-r*0.6:.1f},{-r*0.8:.1f} Q0,{-r*1.5:.1f} {r*0.6:.1f},{-r*0.8:.1f}', 'none', '#7FBF52', 1.2)
    return o


def p_sugarcane(s):
    if s == 1: return sprout() + leaf(0, 0, 8, 90, G1, .15)
    h = 22 if s == 2 else 38
    col = '#9CCB4E' if s == 2 else '#C6C24A'
    o = ''
    for dx in (-4, 0, 4):
        o += rect(dx - 1.6, -h + abs(dx), 3.2, h - abs(dx), col, 1, shade(col, -.3), .8)
        for y in range(6, h - 2, 7):
            o += f'<line x1="{dx-1.6}" y1="{-y}" x2="{dx+1.6}" y2="{-y}" stroke="{shade(col,-.3)}" stroke-width="1"/>'
        o += leaf(dx, -h + abs(dx), 10, 60 if dx >= 0 else 120, G2, .18)
    return o


def p_rice(s):
    if s == 1: return sprout()
    col = G1 if s == 2 else '#D9C25A'
    o = ''
    for a in (70, 80, 90, 100, 110):
        o += leaf(0, 0, 12 + 3 * s, a, col if a != 90 else G2, .12)
    if s == 3:
        o += path('M0,-18 Q6,-22 9,-14', 'none', '#C9A63A', 2) + path('M0,-18 Q-6,-22 -9,-14', 'none', '#C9A63A', 2)
        for x, y in ((7, -18), (9, -15), (-7, -18), (-9, -15)):
            o += ell(x, y, 1.5, 2.2, '#F0D878')
    return o


def p_cotton(s):
    if s == 1: return sprout()
    o = rect(-1, -16, 2, 16, '#7A5A3A') + bush(7 if s == 2 else 9, '#5FA548')
    if s == 3:
        for x, y in ((-5, -10), (4, -13), (0, -6), (6, -6)):
            o += circ(x, y, 3.4, '#FFFFFF', '#CFC8BC', 1) + circ(x + 1.5, y - 1, 2.2, '#ffffff')
    elif s == 2:
        o += circ(-3, -10, 2, PAL['pink']) + circ(4, -12, 2, '#F7E07A')
    return o


CROPS = dict(wheat=p_wheat, carrot=p_carrot, corn=p_corn, tomato=p_tomato, potato=p_potato,
             strawberry=p_strawberry, sunflower=p_sunflower, pumpkin=p_pumpkin, cabbage=p_cabbage,
             sugarcane=p_sugarcane, rice=p_rice, cotton=p_cotton)


def crop_tile(name, fn, stage):
    tile = 'field_paddy' if name == 'rice' else 'field_plowed'
    rng = random.Random(7)
    s = '<defs>' + clip_diamond('c', 64, 64) + '</defs>' + poly(diamond(64, 64), PAL['soil'])
    s += f'<g clip-path="url(#c)"><g transform="translate(0,64)">{plowed_detail(rng, name == "rice")}</g></g>'
    s += poly(diamond(64, 64), 'none', PAL['soil_d'], 1, 'opacity=".6"')
    n = 2 if name == 'pumpkin' else 3
    pts = []
    for i in range(n):
        for j in range(n):
            u, v = (i + 0.5) / n, (j + 0.5) / n
            pts.append((u + v, 64 + (u - v) * 64, 64 + (u + v) * 32))
    pts.sort()
    for _, x, y in pts:
        if stage == 0:
            s += ell(x, y, 5, 2.5, PAL['soil_d']) + circ(x - 1, y - 1, 1.2, '#E8D9A8') + circ(x + 2, y, 1.1, '#E8D9A8')
        else:
            sc = {'pumpkin': 1.25, 'strawberry': 1.6, 'potato': 1.2}.get(name, 1)
            s += shadow(x, y, 6, 2.5, .25) + g(fn(stage), f'translate({x:.1f},{y:.1f}) scale({sc})')
    save('crops', f'{name}_{stage}', 128, 128, s, anchor=[64, 64], note=['planted', 'sprout', 'growing', 'ready'][stage])


def make_crops():
    for nm, fn in CROPS.items():
        for st in range(4):
            crop_tile(nm, fn, st)
    # withered / needs-attention overlay is not in design; skip.


# ================= ITEM ICONS (64x64) =================
def icon_frame(body):
    return shadow(32, 54, 18, 4, .18) + body


def ic_wheat():
    o = ''
    for dx in (-8, -3, 2, 7):
        o += path(f'M{32+dx*0.3:.1f},52 Q{32+dx:.1f},34 {32+dx*1.6:.1f},18', 'none', '#B68A22', 2.4)
        for k in range(4):
            y = 16 + k * 5
            o += ell(32 + dx * 1.6 - 2.5, y + 2, 2.5, 4, '#F2CF55', '#B68A22', 1) + ell(32 + dx * 1.6 + 2.5, y + 2, 2.5, 4, '#F2CF55', '#B68A22', 1)
    o += rect(24, 40, 18, 5, PAL['red'], 2, OUT, 1.5)
    return o


def ic_carrot():
    return (path('M20,22 L46,48 Q50,52 46,54 Q42,56 38,50 Z', PAL['orange'], OUT, 2) +
            path('M28,30 l4,-1 M34,38 l4,-1 M40,45 l3,-1', 'none', PAL['orange_d'], 2) +
            leaf(22, 24, 14, 110, G2, .3) + leaf(22, 24, 13, 150, G1, .3) + leaf(22, 24, 12, 75, G1, .3))


def ic_corn():
    o = ell(32, 32, 10, 20, PAL['yellow'], OUT, 2)
    for y in range(16, 50, 5):
        for x in (26, 32, 38):
            o += circ(x, y, 1.8, PAL['yellow_d'], extra='opacity=".6"')
    o += path('M22,40 Q20,24 28,12 Q26,30 32,52 Z', G2, OUT, 1.5) + path('M42,40 Q44,24 36,12 Q38,30 32,52 Z', G1, OUT, 1.5)
    return o


def ic_round(c, cd, extra=''):
    return circ(32, 34, 16, c, OUT, 2) + ell(26, 28, 5, 3.5, '#ffffff', extra='opacity=".5"') + extra


def ic_tomato():
    return ic_round(PAL['red'], PAL['red_d'], path('M24,20 L32,24 L40,20 L36,26 L32,22 L28,26 Z', G2, OUT, 1.5))


def ic_potato():
    return ell(32, 36, 18, 13, '#D2A86E', OUT, 2) + ''.join(circ(x, y, 1.5, '#9C7444') for x, y in ((24, 32), (36, 30), (40, 40), (28, 42)))


def ic_strawberry():
    o = path('M16,24 Q32,16 48,24 Q46,46 32,56 Q18,46 16,24 Z', PAL['red'], OUT, 2)
    o += ''.join(ell(x, y, 1, 1.6, '#FFE27A') for x, y in ((24, 30), (32, 28), (40, 30), (28, 38), (36, 38), (32, 46)))
    o += path('M20,22 L26,14 L32,20 L38,14 L44,22 Z', G2, OUT, 1.5)
    return o


def ic_sunflower():
    import math
    o = ''
    for i in range(14):
        a = i * 2 * math.pi / 14
        x, y = 32 + 15 * math.cos(a), 32 + 15 * math.sin(a)
        o += ell(x, y, 7, 4, PAL['yellow'], PAL['yellow_d'], 1.2, f'transform="rotate({math.degrees(a):.0f} {x:.1f} {y:.1f})"')
    o += circ(32, 32, 10, '#7A4A22', OUT, 2)
    o += ''.join(circ(32 + 5 * math.cos(a), 32 + 5 * math.sin(a), 1.2, '#4E2E14') for a in range(6))
    return o


def ic_pumpkin():
    return (ell(22, 36, 11, 15, PAL['orange'], OUT, 2) + ell(42, 36, 11, 15, PAL['orange'], OUT, 2) +
            ell(32, 36, 11, 16, shade(PAL['orange'], .06), OUT, 2) + rect(29, 14, 6, 9, G3, 2, OUT, 1.5) + leaf(35, 18, 10, 20, G2, .5))


def ic_cabbage():
    return (ell(32, 36, 19, 16, '#7FC152', OUT, 2) + ell(32, 34, 13, 12, '#B4E28A', OUT, 1.5) +
            path('M22,34 Q32,20 42,34', 'none', '#7FBF52', 2) + path('M26,40 Q32,30 38,40', 'none', '#7FBF52', 2))


def ic_sugarcane():
    o = ''
    for i, x in enumerate((24, 32, 40)):
        o += rect(x - 3, 14 + i * 2, 6, 40 - i * 2, '#B9C04A', 2, OUT, 1.5)
        for y in range(22, 52, 8):
            o += f'<line x1="{x-3}" y1="{y}" x2="{x+3}" y2="{y}" stroke="{OUT}" stroke-width="1.2"/>'
    return o + leaf(32, 16, 14, 50, G2, .2) + leaf(24, 16, 12, 130, G1, .2)


def ic_rice():
    o = path('M16,50 L18,26 Q32,20 46,26 L48,50 Q32,56 16,50 Z', PAL['cream'], OUT, 2)
    o += rect(20, 34, 24, 10, '#E4D2A6', 2) + ell(32, 24, 13, 5, '#F7F2E2', OUT, 1.5)
    o += ''.join(ell(x, 22, 1.4, 2.4, '#ffffff', '#CFC4A0', .8) for x in (26, 30, 34, 38))
    return o


def ic_cotton():
    o = path('M20,44 L32,52 L44,44', G3, OUT, 2)
    for x, y, r in ((24, 32, 9), (40, 32, 9), (32, 24, 10), (32, 38, 10)):
        o += circ(x, y, r, '#ffffff', '#BDB5A8', 2)
    return o


def ic_seed_bag():
    return (path('M18,22 Q32,16 46,22 L48,52 Q32,57 16,52 Z', '#D9B37A', OUT, 2) + path('M20,22 Q32,12 44,22', 'none', OUT, 2) +
            ell(32, 38, 8, 7, '#9A6438') + ''.join(ell(28 + i * 4, 36 + (i % 2) * 3, 1.5, 2.5, '#F2E1B0') for i in range(3)))


ICONS_CROP = dict(wheat=ic_wheat, carrot=ic_carrot, corn=ic_corn, tomato=ic_tomato, potato=ic_potato,
                  strawberry=ic_strawberry, sunflower=ic_sunflower, pumpkin=ic_pumpkin, cabbage=ic_cabbage,
                  sugarcane=ic_sugarcane, rice=ic_rice, cotton=ic_cotton)


def make_crop_icons():
    for nm, fn in ICONS_CROP.items():
        save('icons', f'item_{nm}', 64, 64, icon_frame(fn()))
    save('icons', 'item_seed_bag', 64, 64, icon_frame(ic_seed_bag()))


if __name__ == '__main__':
    make_terrain(); make_crops(); make_crop_icons()
    dump_registry('reg_terrain.json')
    print(len(REGISTRY))
