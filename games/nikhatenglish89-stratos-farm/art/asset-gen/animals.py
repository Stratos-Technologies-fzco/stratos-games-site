"""Animals: 5 frames each (idle0, idle1 blink, eat, walk0, walk1), facing down-left. Flip X for down-right."""
from lib import *

FR = ['idle_0', 'idle_1', 'eat', 'walk_0', 'walk_1']


def eye(x, y, blink, r=2.2):
    if blink:
        return path(f'M{x-r},{y} q{r},{r*0.8} {2*r},0', 'none', OUT, 1.6)
    return circ(x, y, r, OUT) + circ(x - r * 0.35, y - r * 0.35, r * 0.4, '#fff')


def legs(xs, y0, y1, col, f, w=4):
    o = ''
    for i, x in enumerate(xs):
        dx = 0
        if f == 3: dx = 3 if i % 2 == 0 else -3
        if f == 4: dx = -3 if i % 2 == 0 else 3
        o += path(f'M{x},{y0} L{x+dx},{y1}', 'none', col, w)
    return o


def chicken(f):
    bob = -1 if f == 1 else 0
    o = shadow(0, 0, 14, 4)
    o += legs([-3, 3], -8, 0, PAL['orange'], f, 2.4)
    body = ell(2, -16, 13, 10, '#ffffff', OUT, 2) + path('M12,-20 Q22,-30 18,-12 Z', '#ffffff', OUT, 2)
    body += path('M-2,-16 Q4,-10 10,-16', 'none', '#D8D2C6', 2)
    o += g(body, f'translate(0,{bob})')
    hx, hy = (-12, -6) if f == 2 else (-10, -24 + bob)
    head = circ(0, 0, 7, '#ffffff', OUT, 2) + path('M-3,-6 q2,-6 4,-1 q2,-5 4,0 q1,-4 2,2', PAL['red'], OUT, 1.2)
    head += path('M-7,0 l-6,2 l6,2 Z', PAL['orange'], OUT, 1.2) + ell(-5, 5, 2, 3, PAL['red']) + eye(-2, -1, f == 1, 1.6)
    o += g(head, f'translate({hx},{hy})')
    return o


def duck(f):
    bob = -1 if f == 1 else 0
    o = shadow(0, 0, 15, 4) + legs([-3, 4], -7, 0, PAL['orange'], f, 2.6)
    o += g(ell(3, -14, 15, 9, '#8A6040', OUT, 2) + path('M-4,-14 Q6,-8 16,-15', 'none', '#B48A62', 2) +
           path('M16,-16 L24,-20 L19,-11 Z', '#6E4C30', OUT, 1.5) + rect(4, -18, 10, 3, '#4F8FD1', 1), f'translate(0,{bob})')
    hx, hy = (-14, -6) if f == 2 else (-10, -26 + bob)
    head = path('M0,6 L4,18 L-4,18 Z', '#3E8E41') + circ(0, 0, 7, '#3E8E41', OUT, 2)
    head += path('M-6,-1 Q-16,0 -16,3 Q-10,5 -5,3 Z', PAL['yellow'], OUT, 1.2) + eye(-1, -2, f == 1, 1.6) + rect(-4, 6, 8, 2, '#fff')
    o += g(head, f'translate({hx},{hy})')
    return o


def quad(f, body_fn, head_fn, leg_col, w=34, hgt=24, legw=5):
    """generic 4-legged animal; body centred at (4,-hgt)."""
    bob = -1 if f == 1 else 0
    o = shadow(2, 0, w * 0.75, 6)
    o += legs([-w * 0.45, w * 0.45 - 4], -hgt + 6, 0, shade(leg_col, -.15), f, legw)
    o += g(body_fn(), f'translate(0,{bob})')
    o += legs([-w * 0.45 + 6, w * 0.45 + 2], -hgt + 6, 1, leg_col, (3 if f == 4 else 4 if f == 3 else f), legw)
    head_pos = (-w * 0.62, -hgt * 0.55) if f == 2 else (-w * 0.6, -hgt * 1.35 + bob)
    o += g(head_fn(f == 1), f'translate({head_pos[0]:.1f},{head_pos[1]:.1f})')
    return o


def cow(f):
    def body():
        return (ell(4, -28, 26, 15, '#ffffff', OUT, 2) + path('M8,-40 Q18,-42 20,-30 Q12,-24 6,-32 Z', '#3B2A1E') +
                ell(-8, -24, 6, 5, '#3B2A1E') + ell(10, -16, 6, 4, PAL['pink'], OUT, 1.2) +
                path('M30,-34 Q38,-26 34,-14', 'none', OUT, 2) + circ(34, -13, 2.5, OUT))
    def head(bl):
        return (path('M-6,-12 Q-10,-18 -14,-15 M6,-12 Q10,-18 14,-15', 'none', '#E8DCC0', 3) + ell(-12, -6, 5, 3, '#ffffff', OUT, 1.5) +
                ell(0, 0, 11, 12, '#ffffff', OUT, 2) + ell(0, 8, 9, 6, PAL['pink'], OUT, 1.5) + circ(-3, 8, 1.3, OUT) + circ(3, 8, 1.3, OUT) +
                eye(-4, -2, bl) + eye(5, -2, bl) + path('M2,-12 Q8,-6 10,-2 Q4,-4 2,-12 Z', '#3B2A1E'))
    return quad(f, body, head, '#ffffff', 44, 26, 6)


def sheep(f):
    def body():
        import math
        o = ''
        for i in range(10):
            a = i * 2 * math.pi / 10
            o += circ(4 + 20 * math.cos(a), -26 + 11 * math.sin(a), 8, '#F8F5EE', '#BFB6A6', 1.5)
        return o + ell(4, -26, 20, 11, '#F8F5EE')
    def head(bl):
        return (ell(-9, -2, 5, 3, '#4A3A30', OUT, 1.5) + ell(0, 0, 8, 10, '#4A3A30', OUT, 2) + circ(0, -9, 6, '#F8F5EE', '#BFB6A6', 1.5) +
                eye(-3, 0, bl, 1.8) + eye(3, 0, bl, 1.8) + ell(0, 7, 3, 1.5, '#2A1E16'))
    return quad(f, body, head, '#4A3A30', 38, 24, 5)


def pig(f):
    def body():
        return (ell(4, -22, 22, 14, '#FFB3C1', OUT, 2) + path('M26,-24 q6,-4 4,2 q-2,4 3,2', 'none', '#E88A9C', 2) + ell(-4, -28, 8, 4, '#FFD0DA'))
    def head(bl):
        return (path('M-7,-10 L-10,-18 L-2,-12 Z M7,-10 L10,-18 L2,-12 Z', '#FF9FB1', OUT, 1.5) + ell(0, 0, 11, 10, '#FFB3C1', OUT, 2) +
                ell(-2, 5, 6, 4, '#FF8FA3', OUT, 1.5) + circ(-4, 5, 1.2, '#B85A6A') + circ(0, 5, 1.2, '#B85A6A') + eye(-6, -3, bl, 1.8) + eye(4, -3, bl, 1.8))
    return quad(f, body, head, '#FFB3C1', 36, 20, 5)


def goat(f):
    def body():
        return (ell(4, -26, 21, 12, '#EDE3D1', OUT, 2) + ell(10, -24, 9, 7, '#C9A27A') + path('M24,-30 l6,-6 l-2,8', '#EDE3D1', OUT, 1.5))
    def head(bl):
        return (path('M-2,-10 Q-6,-20 -12,-20 M3,-10 Q4,-20 10,-22', 'none', '#9A8A70', 3) + ell(-10, -4, 5, 2.5, '#EDE3D1', OUT, 1.5) +
                path('M-7,-6 Q-8,10 0,14 Q8,10 7,-6 Q0,-12 -7,-6 Z', '#EDE3D1', OUT, 2) + path('M-2,13 L0,20 L2,13', '#C9BBA2', OUT, 1.2) +
                eye(-3, 0, bl, 1.8) + eye(3, 0, bl, 1.8) + ell(0, 8, 3, 1.6, '#C9A27A'))
    return quad(f, body, head, '#EDE3D1', 34, 26, 4)


ANIMALS = dict(chicken=(chicken, 64, 64), duck=(duck, 72, 64), cow=(cow, 112, 96), sheep=(sheep, 96, 80),
               pig=(pig, 96, 80), goat=(goat, 96, 88))


def make_animals():
    for nm, (fn, w, h) in ANIMALS.items():
        ax, ay = w // 2, h - 8
        for i, fr in enumerate(FR):
            save('animals', f'{nm}_{fr}', w, h, g(fn(i), f'translate({ax},{ay})'), anchor=[ax, ay], note=fr)


if __name__ == '__main__':
    make_animals(); dump_registry('reg_animals.json'); print(len(REGISTRY))
