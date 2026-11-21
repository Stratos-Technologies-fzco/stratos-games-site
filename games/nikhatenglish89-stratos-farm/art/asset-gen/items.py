"""Product icons (64x64) for animal products and production goods."""
from lib import *
from terrain_crops import icon_frame, leaf, G1, G2, G3


def jar(body_col, label_col, lid=PAL['red'], content=''):
    return (rect(18, 22, 28, 32, body_col, 8, OUT, 2) + rect(16, 14, 32, 10, lid, 3, OUT, 2) +
            rect(22, 32, 20, 14, label_col, 3, OUT, 1.2) + content + rect(21, 25, 4, 22, '#ffffff', 2, extra='opacity=".35"'))


def bottle(col):
    return (path('M26,10 L38,10 L38,20 Q46,24 46,32 L46,52 Q46,56 42,56 L22,56 Q18,56 18,52 L18,32 Q18,24 26,20 Z', '#E8F6FB', OUT, 2) +
            path('M20,34 L44,34 L44,52 Q44,54 42,54 L22,54 Q20,54 20,52 Z', col) + rect(25, 6, 14, 6, PAL['brown'], 2, OUT, 1.5) +
            rect(23, 24, 4, 26, '#ffffff', 2, extra='opacity=".45"'))


def sack(col, mark):
    return (path('M16,54 Q12,34 20,22 L24,16 L40,16 L44,22 Q52,34 48,54 Q32,58 16,54 Z', col, OUT, 2) +
            path('M22,20 Q32,24 42,20', 'none', OUT, 2) + mark)


ITEMS = {
    'egg': lambda: ell(32, 34, 14, 18, '#FFF7E6', OUT, 2) + ell(27, 27, 4, 6, '#ffffff'),
    'milk': lambda: (path('M22,14 L42,14 L42,20 L48,28 L48,54 L16,54 L16,28 L22,20 Z', '#ffffff', OUT, 2) +
                     rect(16, 34, 32, 12, PAL['sky'], 0, OUT, 1.5) + circ(32, 40, 4, '#fff')),
    'goat_milk': lambda: (path('M22,14 L42,14 L42,20 L48,28 L48,54 L16,54 L16,28 L22,20 Z', '#ffffff', OUT, 2) +
                          rect(16, 34, 32, 12, PAL['roof_green'], 0, OUT, 1.5) + circ(32, 40, 4, '#fff')),
    'wool': lambda: ''.join(circ(x, y, r, '#F8F5EE', '#BFB6A6', 2) for x, y, r in ((22, 38, 10), (42, 38, 10), (32, 30, 12), (32, 42, 10))),
    'truffle': lambda: (ell(32, 38, 16, 14, '#5B3A26', OUT, 2) + ''.join(circ(x, y, 1.8, '#3A2416') for x, y in ((26, 34), (36, 32), (30, 42), (40, 40))) +
                        ell(26, 32, 4, 2.5, '#8A6040')),
    'feather': lambda: (path('M18,52 Q22,24 46,12 Q44,36 18,52 Z', '#ffffff', OUT, 2) + path('M18,52 L42,18', 'none', '#BFB6A6', 2) +
                        path('M26,40 l6,2 M30,34 l6,2 M34,28 l6,2', 'none', '#D8D2C6', 1.5)),
    'flour': lambda: sack(PAL['cream'], ell(32, 38, 8, 6, PAL['yellow']) + path('M28,38 l8,0 M32,34 l0,8', 'none', PAL['brown'], 2)),
    'animal_feed': lambda: sack('#C9A46A', ''.join(circ(x, y, 2.2, PAL['yellow_d']) for x, y in ((26, 36), (32, 40), (38, 36), (30, 46), (36, 46)))),
    'sugar': lambda: sack('#F4F1FA', rect(24, 32, 16, 12, '#ffffff', 2, '#B9B0CC', 1.5) + rect(26, 30, 12, 10, '#ffffff', 2, '#B9B0CC', 1.5)),
    'bread': lambda: (path('M10,40 Q10,22 32,20 Q54,22 54,40 L54,48 Q54,52 50,52 L14,52 Q10,52 10,48 Z', '#D9934A', OUT, 2) +
                      path('M20,30 l6,8 M30,26 l6,8 M40,28 l5,8', 'none', '#F3C27E', 3)),
    'cake': lambda: (rect(14, 30, 36, 22, '#FFE3EA', 4, OUT, 2) + path('M14,34 Q20,42 26,34 Q32,42 38,34 Q44,42 50,34 L50,30 L14,30 Z', '#FF8FA3', OUT, 1.5) +
                     ell(32, 30, 18, 5, '#ffffff', OUT, 1.5) + circ(32, 22, 4, PAL['red'], OUT, 1.5)),
    'pumpkin_pie': lambda: (ell(32, 40, 22, 11, '#E0A660', OUT, 2) + ell(32, 37, 18, 8, PAL['orange']) +
                            path('M32,37 L50,37 A18,8 0 0 0 40,30 Z', '#F4C27E', OUT, 1)),
    'cheese': lambda: (path('M10,40 L44,22 L54,30 L54,48 L10,52 Z', PAL['yellow'], OUT, 2) + path('M10,40 L54,30', 'none', OUT, 1.5) +
                       circ(22, 46, 3, PAL['yellow_d']) + circ(40, 42, 2.5, PAL['yellow_d']) + circ(34, 32, 2, PAL['yellow_d'])),
    'butter': lambda: (ell(32, 46, 22, 8, '#E9F2F7', OUT, 2) + path('M16,44 L16,32 L44,26 L48,40 Z', '#FFE58A', OUT, 2) +
                       path('M16,32 L22,28 L48,24 L44,26 Z', '#FFF0B3', OUT, 1.5)),
    'fabric': lambda: (rect(12, 24, 40, 24, '#8FB8E8', 4, OUT, 2) + ''.join(f'<line x1="{x}" y1="24" x2="{x}" y2="48" stroke="#6E98CC" stroke-width="2"/>' for x in (20, 28, 36, 44)) +
                       ell(12, 36, 5, 12, '#B5D2F2', OUT, 2)),
    'sweater': lambda: (path('M20,16 L28,14 Q32,20 36,14 L44,16 L54,30 L46,34 L44,30 L44,54 L20,54 L20,30 L18,34 L10,30 Z', PAL['red'], OUT, 2) +
                        path('M20,44 L44,44 M20,48 L44,48', 'none', '#ffffff', 2)),
    'tomato_juice': lambda: bottle(PAL['red']),
    'carrot_juice': lambda: bottle(PAL['orange']),
    'strawberry_jam': lambda: jar('#F2D9DE', PAL['cream'], PAL['red'], circ(32, 39, 4, PAL['red'])),
    'popcorn': lambda: (path('M18,26 L46,26 L42,56 L22,56 Z', '#ffffff', OUT, 2) + path('M22,26 L24,56 M30,26 L30,56 M38,26 L36,56', 'none', PAL['red'], 3) +
                        ''.join(circ(x, y, 5, '#FFF6D6', '#D8C08A', 1.5) for x, y in ((22, 22), (30, 18), (38, 20), (44, 24), (32, 24)))),
    'sunflower_oil': lambda: bottle(PAL['yellow']),
}


def make_items():
    for k, fn in ITEMS.items():
        save('icons', f'item_{k}', 64, 64, icon_frame(fn()))


if __name__ == '__main__':
    make_items(); dump_registry('reg_items.json'); print(len(REGISTRY))
