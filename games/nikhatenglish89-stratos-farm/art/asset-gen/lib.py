"""Shared drawing helpers for STRATOS FARM original programmatic art.
All sprites: 2:1 isometric, tile 128x64, light from top-left, soft shadow down-right.
"""
import os, subprocess, json, colorsys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')  # repo root
PUB = os.path.join(ROOT, 'public', 'assets', 'farm')
SRC = os.path.join(ROOT, 'art-src', 'svg')
TW, TH = 128, 64
REGISTRY = []  # filled by save()

PAL = dict(
    grass='#7BC74D', grass_d='#5DA83A', grass_l='#9BDB6A', forest='#3E8E41', forest_d='#2C6B30',
    sky='#7EC8F0', sky_d='#4FA6D8', yellow='#FFD447', yellow_d='#E8B020', brown='#9A6438',
    brown_d='#6F4424', brown_l='#C08A55', cream='#FFF4DC', cream_d='#EBDDBE', orange='#FF9F45',
    orange_d='#E07A22', red='#E5533D', red_d='#B83A28', white='#FFFFFF', ink='#3B2A1E',
    soil='#8B5A33', soil_d='#6B4226', soil_l='#A8743F', stone='#B9B4AA', stone_d='#8E897F',
    water='#5CC1E8', water_d='#3A9CC9', pink='#FF8FA3', purple='#9B6BD6', roof_red='#D9543F',
    roof_blue='#4F8FD1', roof_green='#4FA05A', wood='#B9824E', wood_d='#8A5A30')


def shade(hexc, f):
    """f>0 lighten, f<0 darken (HLS lightness)."""
    hexc = hexc.lstrip('#')
    r, g, b = (int(hexc[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0, min(1, l + f))
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255))


def P(pts):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)


def poly(pts, fill, stroke=None, sw=2, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"' if stroke else ''
    return f'<polygon points="{P(pts)}" fill="{fill}"{s} {extra}/>'


def ell(cx, cy, rx, ry, fill, stroke=None, sw=2, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}"{s} {extra}/>'


def circ(cx, cy, r, fill, stroke=None, sw=2, extra=''):
    return ell(cx, cy, r, r, fill, stroke, sw, extra)


def rect(x, y, w, h, fill, rx=0, stroke=None, sw=2, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}"{s} {extra}/>'


def path(d, fill='none', stroke=None, sw=2, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"' if stroke else ''
    return f'<path d="{d}" fill="{fill}"{s} {extra}/>'


def g(content, tr=''):
    return f'<g transform="{tr}">{content}</g>' if tr else f'<g>{content}</g>'


OUT = PAL['ink']  # outline colour


# ---------- isometric geometry ----------
def diamond(ox, oy, fw=1, fd=1, z=0):
    """footprint corners: top, right, bottom, left (top vertex at ox,oy)."""
    hw, hh = TW / 2, TH / 2
    return [(ox, oy - z), (ox + fw * hw, oy + fw * hh - z),
            (ox + (fw - fd) * hw, oy + (fw + fd) * hh - z), (ox - fd * hw, oy + fd * hh - z)]


def iso_box(ox, oy, fw, fd, h, top, left=None, right=None, z=0, outline=True, inset=0):
    """Box on footprint (fw x fd tiles) with height h. Returns svg + corner dict."""
    left = left or shade(top, -0.10)
    right = right or shade(top, -0.20)
    b = diamond(ox, oy, fw, fd, z)
    if inset:
        cx = sum(p[0] for p in b) / 4; cy = sum(p[1] for p in b) / 4
        b = [(cx + (x - cx) * (1 - inset), cy + (y - cy) * (1 - inset)) for x, y in b]
    t = [(x, y - h) for x, y in b]
    st = OUT if outline else None
    s = poly([b[3], b[2], t[2], t[3]], left, st)
    s += poly([b[2], b[1], t[1], t[2]], right, st)
    s += poly(t, top, st)
    return s, dict(base=b, top=t)


def face_left(c):
    """transform for drawing on the left (SW-facing) wall: origin at its bottom-left corner."""
    L = c['base'][3]
    return f'matrix(1,0.5,0,1,{L[0]:.1f},{L[1]:.1f})'


def face_right(c):
    B = c['base'][2]
    return f'matrix(1,-0.5,0,1,{B[0]:.1f},{B[1]:.1f})'


def gable_roof(c, rh, col, along='x', over=6):
    """Gable roof on box corners. along='x': ridge parallel to the gx axis (gable faces right wall)."""
    A, B, C, D = c['top']
    # overhang
    cx = sum(p[0] for p in c['top']) / 4; cy = sum(p[1] for p in c['top']) / 4
    k = 1 + over / 60
    A, B, C, D = [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in (A, B, C, D)]
    mid = lambda p, q: ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - rh)
    dark = shade(col, -0.14); light = shade(col, 0.06)
    if along == 'x':
        R1, R2 = mid(A, D), mid(B, C)
        s = poly([A, B, R2, R1], light, OUT)
        s += poly([D, C, R2, R1], col, OUT)
        s += poly([c['top'][1], c['top'][2], (R2[0], R2[1] + 2)], shade(col, -0.30), OUT)
        # gable wall triangle in wall colour is drawn by caller if wanted
    else:
        R1, R2 = mid(A, B), mid(D, C)
        s = poly([A, D, R2, R1], light, OUT)
        s += poly([B, C, R2, R1], dark, OUT)
    # roof lines
    for t in (0.33, 0.66):
        if along == 'x':
            p = (D[0] + (R1[0] - D[0]) * t, D[1] + (R1[1] - D[1]) * t)
            q = (C[0] + (R2[0] - C[0]) * t, C[1] + (R2[1] - C[1]) * t)
        else:
            p = (B[0] + (R1[0] - B[0]) * t, B[1] + (R1[1] - B[1]) * t)
            q = (C[0] + (R2[0] - C[0]) * t, C[1] + (R2[1] - C[1]) * t)
        s += f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{q[0]:.1f}" y2="{q[1]:.1f}" stroke="{shade(col,-0.22)}" stroke-width="2" opacity=".6"/>'
    return s, (R1, R2)


def gable_wall(c, rh, col, side='right'):
    """Triangle wall under a gable ridge (along='x' -> right side)."""
    A, B, C, D = c['top']
    m = ((B[0] + C[0]) / 2, (B[1] + C[1]) / 2 - rh)
    return poly([B, C, m], col, OUT)


def shadow(cx, cy, rx, ry, op=0.22):
    return ell(cx + rx * 0.08, cy + ry * 0.1, rx, ry, '#2a3d12', extra=f'opacity="{op}"')


def window(x, y, w, h, frame=PAL['cream'], glass='#9FD8F2'):
    s = rect(x, y, w, h, frame, 2, OUT, 2)
    s += rect(x + 3, y + 3, w - 6, h - 6, glass, 1)
    s += f'<line x1="{x + w/2:.1f}" y1="{y+3:.1f}" x2="{x + w/2:.1f}" y2="{y+h-3:.1f}" stroke="{frame}" stroke-width="2"/>'
    s += rect(x + 4, y + 4, (w - 8) / 2 - 1, 3, '#ffffff', 1, extra='opacity=".7"')
    return s


def door(x, y, w, h, col=PAL['wood_d']):
    s = path(f'M{x},{y+h} L{x},{y+w/2} A{w/2},{w/2} 0 0 1 {x+w},{y+w/2} L{x+w},{y+h} Z', col, OUT, 2)
    s += circ(x + w * 0.75, y + h * 0.6, 1.8, PAL['yellow'])
    return s


# ---------- output ----------
def svg_doc(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'{body}</svg>')


def save(cat, name, w, h, body, anchor=None, frames=1, note='', scale=1):
    os.makedirs(os.path.join(SRC, cat), exist_ok=True)
    os.makedirs(os.path.join(PUB, cat), exist_ok=True)
    sp = os.path.join(SRC, cat, name + '.svg')
    pp = os.path.join(PUB, cat, name + '.png')
    with open(sp, 'w') as f:
        f.write(svg_doc(w, h, body))
    subprocess.run(['rsvg-convert', '-w', str(int(w * scale)), '-h', str(int(h * scale)), sp, '-o', pp], check=True)
    REGISTRY.append(dict(cat=cat, name=name, w=int(w * scale), h=int(h * scale), anchor=anchor, frames=frames, note=note,
                         png=os.path.relpath(pp, ROOT).replace('\\', '/'), svg=os.path.relpath(sp, ROOT).replace('\\', '/')))
    return pp


def dump_registry(fn):
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), fn)
    with open(p, 'w') as f:
        json.dump(REGISTRY, f, indent=1)
