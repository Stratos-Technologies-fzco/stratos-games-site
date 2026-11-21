"""New art for Stratos Farm, drawn with the same helpers and style as tools/asset-gen (copied in ./asset-gen).
Crops: onion, blueberry, peanut, lavender (4 growth stages each). Animals: turkey, rabbit, horse (5 poses each).
Product icons: big_egg, fluff, horsehair and the four new crops. Homes: turkey_pen, rabbit_hutch, horse_stable.
Run:  python more_art.py   (writes ./svg/*.svg and jobs.json)   then   node render.mjs   then   python pack_more.py
The SVG to PNG step uses Chromium (Playwright) instead of rsvg-convert, so nothing extra has to be installed."""
import os, sys, json

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'asset-gen'))
import lib
from lib import *
import terrain_crops as tc
import items as it
import buildings as bl
import animals as an

JOBS = []


def capture(cat, name, w, h, body, anchor=None, frames=1, note='', scale=1):
    """Stands in for lib.save: writes the SVG and queues a render job instead of calling rsvg-convert."""
    sp = os.path.join(HERE, 'svg', cat, name + '.svg')
    os.makedirs(os.path.dirname(sp), exist_ok=True)
    open(sp, 'w').write(svg_doc(w, h, body))
    JOBS.append(dict(cat=cat, name=name, w=int(w * scale), h=int(h * scale), anchor=anchor, note=note,
                     svg=os.path.relpath(sp, HERE).replace('\\', '/'), png=f'png/{cat}/{name}.png'))
    return sp


for m in (lib, tc, it, bl, an):
    m.save = capture

G1, G2, G3 = tc.G1, tc.G2, tc.G3
leaf, sprout, bush = tc.leaf, tc.sprout, tc.bush


# ================= CROPS (stage 1 sprout, 2 growing, 3 ready; stage 0 is drawn by crop_tile) =================
def p_onion(s):
    if s == 1: return sprout() + leaf(0, 0, 10, 90, G2, .12)
    n, h = (4, 15) if s == 2 else (6, 22)
    o = ''.join(leaf(0, -1, h + (i % 2) * 3, 70 + i * (40 / (n - 1)), G2 if i % 2 else G1, .12) for i in range(n))
    if s == 3:
        o += ell(0, -1, 7, 5.5, '#D9A25A', shade('#D9A25A', -.25), 1.2) + path('M-4,-2 Q0,-6 4,-2', 'none', '#F0C98A', 1.2)
    return o


def p_blueberry(s):
    if s == 1: return sprout()
    o = bush(9 if s == 2 else 12, G2)
    if s == 2:
        o += ''.join(circ(x, y, 1.6, '#ffffff') for x, y in ((-4, -9), (3, -12), (5, -6)))
    else:
        for x, y in ((-7, -8), (-2, -14), (5, -11), (8, -5), (-3, -4), (2, -8)):
            o += circ(x, y, 2.8, '#4A63C9', '#2A3A8C', 1) + circ(x - .8, y - .8, .8, '#9DB0FF')
    return o


def p_peanut(s):
    if s == 1: return sprout()
    cnt = 3 if s == 2 else 5
    o = ''
    for i in range(cnt):
        x = (i - (cnt - 1) / 2) * 5
        o += leaf(x, 0, 8 + (i % 2) * 2, 60 + i * (60 / (cnt - 1)), G2 if i % 2 else G1, .55)
        o += leaf(x, -3, 5, 40 + i * (100 / (cnt - 1)), G1, .55)
    if s == 3:
        for x, y in ((-8, 2), (2, 3), (9, 1)):
            o += ell(x, y, 4.2, 2.6, '#D9B37A', '#8E6A3A', 1) + circ(x - 1.4, y, .7, '#8E6A3A') + circ(x + 1.4, y, .7, '#8E6A3A')
    return o


def p_lavender(s):
    if s == 1: return sprout()
    n, h = (3, 14) if s == 2 else (5, 26)
    o = ''
    for i in range(n):
        dx = (i - (n - 1) / 2) * 4
        o += path(f'M{dx*0.4:.1f},0 Q{dx:.1f},{-h*0.5:.1f} {dx*1.5:.1f},{-h:.1f}', 'none', G3, 1.6)
        if s == 2:
            o += ell(dx * 1.5, -h, 1.6, 2.4, '#B79AE0')
        else:
            for k in range(4):
                o += ell(dx * 1.5, -h + k * 3.6, 2.4, 2.6, '#9B6BD6' if k % 2 else '#B38CE8', '#6D45A8', .8)
    return o


NEW_CROPS = dict(onion=p_onion, blueberry=p_blueberry, peanut=p_peanut, lavender=p_lavender)


# ================= ITEM ICONS (64x64 bodies) =================
def ic_onion():
    return (path('M32,12 Q34,22 42,29 Q52,40 41,52 Q32,59 23,52 Q12,40 22,29 Q30,22 32,12 Z', '#D9A25A', OUT, 2) +
            path('M27,32 Q24,44 30,54 M37,32 Q40,44 34,54', 'none', '#F0C98A', 1.8) + path('M30,56 l-3,5 M34,56 l3,5', 'none', '#8E6A3A', 1.6))


def ic_blueberry():
    o = ''.join(circ(x, y, 9, '#4A63C9', '#2A3A8C', 2) + circ(x - 3, y - 3, 2.4, '#9DB0FF') for x, y in ((22, 40), (38, 40), (30, 29), (30, 46)))
    return o + path('M30,18 Q38,12 44,18 Q38,24 30,18 Z', G2, OUT, 1.5)


def ic_peanut():
    shell = 'M14,40 Q10,30 20,28 Q28,30 28,36 Q34,34 40,38 Q46,46 36,52 Q28,54 26,48 Q18,52 14,40 Z'
    return path(shell, '#D9B37A', OUT, 2) + ''.join(circ(x, y, 1.3, '#8E6A3A') for x, y in ((20, 38), (24, 44), (34, 42), (38, 47), (22, 34)))


def ic_lavender():
    o = ''
    for tx, ty in ((20, 14), (32, 8), (44, 14)):
        o += path(f'M32,56 L{tx},{ty + 6}', 'none', G3, 2.4)
        o += ''.join(ell(tx + (32 - tx) * k * .06, ty + k * 4.2, 3.2, 3.4, '#9B6BD6' if k % 2 else '#B38CE8', '#6D45A8', 1) for k in range(4))
    return o + rect(24, 42, 16, 7, PAL['orange'], 2, OUT, 1.5)


def ic_fluff():
    return ''.join(circ(x, y, r, '#F3ECFF', '#B9A9D6', 2) for x, y, r in ((22, 38, 9), (42, 38, 9), (31, 28, 11), (31, 44, 10))) + path('M26,34 q4,-3 8,0', 'none', '#D6C8EE', 2)


def ic_big_egg():
    return (ell(32, 34, 17, 21, '#E8CFA6', OUT, 2) + ''.join(circ(x, y, 1.6, '#9A6A44') for x, y in ((26, 28), (38, 30), (30, 40), (40, 42), (24, 44), (34, 24))) +
            ell(25, 26, 4, 7, '#ffffff', extra='opacity=".55"'))


def ic_horsehair():
    return (path('M24,10 Q20,30 26,54 M30,8 Q28,30 32,56 M36,8 Q38,30 34,56 M42,10 Q46,30 40,54', 'none', '#6F4424', 4.2) +
            path('M24,10 Q20,30 26,54 M36,8 Q38,30 34,56', 'none', '#A8693A', 1.8) + rect(21, 28, 22, 8, PAL['red'], 2, OUT, 1.5))


NEW_ICONS = dict(onion=ic_onion, blueberry=ic_blueberry, peanut=ic_peanut, lavender=ic_lavender, fluff=ic_fluff, big_egg=ic_big_egg, horsehair=ic_horsehair)


# ================= ANIMALS (idle0, idle1 blink, eat, walk0, walk1), facing down-left =================
eye, legs, quad = an.eye, an.legs, an.quad


def turkey(f):
    bob = -1 if f == 1 else 0
    o = shadow(0, 0, 18, 5) + legs([-4, 5], -9, 0, PAL['orange'], f, 3)
    fan = ''
    for k, (x, y, c) in enumerate(((20, -36, '#B8602E'), (26, -29, '#E3A03A'), (28, -21, '#B8602E'), (23, -41, '#7A4A2A'), (13, -42, '#E3A03A'))):
        fan += ell(x, y, 5, 12, c, OUT, 1.5, extra=f'transform="rotate({-60 + k * 30} {x} {y})"')
    body = fan + ell(3, -19, 15, 11, '#8A5A3A', OUT, 2) + path('M-6,-18 Q4,-8 14,-18', 'none', '#B07A50', 2) + ell(-2, -14, 7, 5, '#A8693A')
    o += g(body, f'translate(0,{bob})')
    hx, hy = (-15, -8) if f == 2 else (-11, -33 + bob)
    head = path('M2,6 L2,16 L-4,16 Z', '#C9B4A6') + circ(0, 0, 6.5, '#C9B4A6', OUT, 2) + path('M-5,2 q-2,6 2,8 q3,-2 1,-8', PAL['red'], OUT, 1.2)
    head += path('M-6,-1 l-7,2 l7,3 Z', PAL['yellow'], OUT, 1.2) + eye(-1, -2, f == 1, 1.6)
    o += g(head, f'translate({hx},{hy})')
    return o


def rabbit(f):
    def body():
        return ell(4, -13, 13, 9, '#F2EAE0', OUT, 2) + circ(18, -13, 5, '#ffffff', OUT, 1.5) + ell(2, -9, 6, 3, '#E6DACB')
    def head(bl):
        return (ell(-3, -14, 3, 9, '#F2EAE0', OUT, 1.8) + ell(4, -14, 3, 9, '#F2EAE0', OUT, 1.8) + ell(-3, -14, 1.2, 6, PAL['pink']) + ell(4, -14, 1.2, 6, PAL['pink']) +
                ell(0, 0, 8, 7, '#F2EAE0', OUT, 2) + ell(-4, 3, 2.2, 1.6, PAL['pink']) + eye(-2, -1, bl, 1.5) + eye(4, -1, bl, 1.5) +
                path('M-7,3 l-6,-1 M-7,4 l-6,2', 'none', OUT, .9))
    return quad(f, body, head, '#F2EAE0', 20, 13, 4)


def horse(f):
    def body():
        return (path('M30,-52 Q46,-48 42,-24', 'none', OUT, 6) + path('M30,-52 Q46,-48 42,-24', 'none', '#3B2A1E', 4) +
                ell(4, -42, 28, 15, '#A8693A', OUT, 2) + ell(-2, -38, 12, 6, '#B97B4A') + rect(-10, -56, 18, 6, PAL['red'], 3, OUT, 1.5) +
                path('M-14,-50 Q-30,-62 -34,-58 L-24,-44 Z', '#A8693A', OUT, 2))
    def head(bl):
        return (path('M-4,-10 L-8,-22 L0,-14 Z', '#8A5A30', OUT, 1.4) + path('M2,-10 Q6,-26 14,-22 Q10,-14 4,-8 Z', '#3B2A1E') +
                ell(0, 2, 9, 13, '#A8693A', OUT, 2) + path('M-1,-8 Q0,0 -1,10', 'none', '#ffffff', 2.4) + ell(-4, 12, 7, 5, '#C28A5A', OUT, 1.6) +
                circ(-6, 13, 1, OUT) + circ(-2, 14, 1, OUT) + eye(-3, -3, bl, 1.8))
    return quad(f, body, head, '#8A5A30', 46, 40, 6)


NEW_ANIMALS = dict(turkey=(turkey, 80, 72), rabbit=(rabbit, 72, 64), horse=(horse, 120, 104))


def build():
    for nm, fn in NEW_CROPS.items():
        for st in range(4):
            tc.crop_tile(nm, fn, st)
    for k, fn in NEW_ICONS.items():
        capture('icons', f'item_{k}', 64, 64, tc.icon_frame(fn()))
    for nm, (fn, w, h) in NEW_ANIMALS.items():
        ax, ay = w // 2, h - 8
        for i, fr in enumerate(an.FR):
            capture('animals', f'{nm}_{fr}', w, h, g(fn(i), f'translate({ax},{ay})'), anchor=[ax, ay], note=fr)
    bl.habitat('turkey_pen', '#C9A268', '#B8602E', PAL['cream'], ic_big_egg())
    bl.habitat('rabbit_hutch', PAL['grass'], '#E58FB0', PAL['cream'], ic_fluff())
    bl.habitat('horse_stable', '#B08A58', PAL['brown_d'], '#E0C9A0', ic_horsehair())
    json.dump(JOBS, open(os.path.join(HERE, 'jobs.json'), 'w'), indent=1)
    print(len(JOBS), 'sprites drawn')


if __name__ == '__main__':
    build()
