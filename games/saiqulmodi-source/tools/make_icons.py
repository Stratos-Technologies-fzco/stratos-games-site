"""App icons for Jet vs Missile (web build): a metallic tactical shield with a supersonic jet breaking the sound
barrier (Mach-cone condensation ring) over high-contrast crosshairs, an electric-blue afterburner glow, on a deep
carbon-fibre navy background. Drawn with Pillow at 4x and scaled down (smooth edges).

Run from web/:  python tools/make_icons.py
Writes public/icons/icon-512.png, icon-192.png, icon-maskable-512.png, apple-touch-icon.png
"""
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

S = 2048  # working size
OUT = Path(__file__).resolve().parent.parent / "public" / "icons"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def carbon_background(size):
    """deep navy carbon-fibre weave with a soft centre light"""
    img = Image.new("RGB", (size, size), (6, 12, 26))
    d = ImageDraw.Draw(img)
    cell = size // 48
    for y in range(0, size, cell):
        for x in range(0, size, cell):
            k = ((x // cell) + (y // cell)) % 2
            # each cell: a twill strip, lighter on one diagonal half
            base = (10, 20, 40) if k else (7, 14, 30)
            d.rectangle([x, y, x + cell, y + cell], fill=base)
            if k:
                d.polygon([(x, y), (x + cell, y), (x, y + cell)], fill=(14, 27, 52))
            else:
                d.polygon([(x + cell, y), (x + cell, y + cell), (x, y + cell)], fill=(9, 18, 36))
    # centre light / edge falloff
    glow = Image.new("L", (size, size), 0)
    gd = ImageDraw.Draw(glow)
    for r in range(size // 2, 0, -8):
        v = int(110 * (1 - r / (size / 2)) ** 1.6)
        gd.ellipse([size / 2 - r, size * 0.45 - r, size / 2 + r, size * 0.45 + r], fill=v)
    light = Image.new("RGB", (size, size), (40, 80, 140))
    img = Image.composite(light, img, glow.point(lambda v: v // 2))
    return img


def shield_points(cx, cy, w, h, n=80):
    """heater shield: flat top with rounded shoulders, sides curving to a point"""
    pts = []
    top = cy - h * 0.5
    # top edge with a shallow notch-free arc
    for i in range(n + 1):
        t = i / n
        x = cx - w / 2 + w * t
        y = top + 0.04 * h * (1 - math.sin(math.pi * t))
        pts.append((x, y))
    # right side down to the point
    for i in range(1, n + 1):
        t = i / n
        x = cx + w / 2 * math.cos(t * math.pi / 2) ** 0.9
        y = top + 0.04 * h + (h * 0.96) * (t ** 1.15)
        pts.append((x, y))
    # left side back up
    for i in range(n - 1, 0, -1):
        t = i / n
        x = cx - w / 2 * math.cos(t * math.pi / 2) ** 0.9
        y = top + 0.04 * h + (h * 0.96) * (t ** 1.15)
        pts.append((x, y))
    return pts


def vertical_gradient(size, stops):
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        for i in range(len(stops) - 1):
            t0, c0 = stops[i]
            t1, c1 = stops[i + 1]
            if t0 <= t <= t1:
                d.line([(0, y), (size, y)], fill=lerp(c0, c1, (t - t0) / (t1 - t0)))
                break
    return img


def mask_of(points, size, grow=0):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).polygon(points, fill=255)
    if grow > 0:
        m = m.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    elif grow < 0:
        m = m.filter(ImageFilter.MinFilter(-grow * 2 + 1))
    return m


def jet_points(cx, cy, s, ang):
    """top-down delta-wing jet (nose up before rotation), scaled by s, rotated by ang radians"""
    base = [(0, -1.0), (0.07, -0.62), (0.09, -0.2), (0.62, 0.32), (0.62, 0.44), (0.09, 0.33), (0.08, 0.52),
            (0.26, 0.66), (0.26, 0.74), (0.0, 0.68), (-0.26, 0.74), (-0.26, 0.66), (-0.08, 0.52), (-0.09, 0.33),
            (-0.62, 0.44), (-0.62, 0.32), (-0.09, -0.2), (-0.07, -0.62)]
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + (x * ca - y * sa) * s, cy + (x * sa + y * ca) * s) for x, y in base]


def rot(cx, cy, x, y, ang):
    ca, sa = math.cos(ang), math.sin(ang)
    return (cx + x * ca - y * sa, cy + x * sa + y * ca)


def draw_icon(size, safe=1.0):
    img = carbon_background(size)
    cx, cy = size / 2, size * 0.51
    sw, sh = size * 0.66 * safe, size * 0.78 * safe
    outer = shield_points(cx, cy, sw, sh)
    m_outer = mask_of(outer, size)
    # metallic rim: brushed steel gradient
    steel = vertical_gradient(size, [(0, (236, 242, 250)), (0.35, (150, 162, 178)), (0.55, (96, 108, 124)),
                                     (0.75, (182, 192, 206)), (1, (84, 94, 110))])
    # drop shadow under the shield
    shadow = m_outer.filter(ImageFilter.GaussianBlur(size // 60))
    img = Image.composite(Image.new("RGB", (size, size), (0, 0, 0)), img, shadow.point(lambda v: v * 7 // 10))
    img = Image.composite(steel, img, m_outer)
    # inner face: dark navy, electric-blue inner bevel line
    m_inner = m_outer.filter(ImageFilter.MinFilter(int(size * 0.028) | 1))
    face = vertical_gradient(size, [(0, (20, 44, 86)), (0.6, (6, 14, 32)), (1, (3, 7, 18))])
    img = Image.composite(face, img, m_inner)
    bevel = ImageChops.subtract(m_inner, m_inner.filter(ImageFilter.MinFilter(int(size * 0.006) | 1)))
    img = Image.composite(Image.new("RGB", (size, size), (0, 220, 255)), img, bevel)
    d = ImageDraw.Draw(img)

    # high-contrast crosshairs
    rr = sw * 0.3
    lw = max(2, size // 110)
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(255, 70, 60), width=lw)
    for dx, dy in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
        d.line([(cx + dx * rr * 0.55, cy + dy * rr * 0.55), (cx + dx * rr * 1.35, cy + dy * rr * 1.35)], fill=(255, 70, 60), width=lw)
    d.ellipse([cx - lw * 1.4, cy - lw * 1.4, cx + lw * 1.4, cy + lw * 1.4], fill=(255, 70, 60))

    # the jet climbing up-right, afterburner glow behind, Mach-cone condensation ring round the mid body
    ang = math.radians(38)
    js = sw * 0.36
    jx, jy = cx + sw * 0.03, cy - sh * 0.04
    glow = Image.new("L", (size, size), 0)
    gd = ImageDraw.Draw(glow)
    tail = rot(jx, jy, 0, 0.72 * js, ang)
    far = rot(jx, jy, 0, 1.55 * js, ang)
    gd.line([tail, far], fill=255, width=int(js * 0.3))
    gd.ellipse([tail[0] - js * 0.12, tail[1] - js * 0.12, tail[0] + js * 0.12, tail[1] + js * 0.12], fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(size // 40)).point(lambda v: min(255, int(v * 1.8)))
    glow = ImageChops.multiply(glow, m_inner)
    blue = Image.new("RGB", (size, size), (40, 170, 255))
    img = Image.composite(blue, img, glow)
    core = Image.new("L", (size, size), 0)
    ImageDraw.Draw(core).line([tail, rot(jx, jy, 0, 1.2 * js, ang)], fill=255, width=int(js * 0.1))
    core = core.filter(ImageFilter.GaussianBlur(size // 160))
    img = Image.composite(Image.new("RGB", (size, size), (215, 245, 255)), img, core)

    # condensation (Mach) ring: a white vapour collar round the mid body, seen as a tilted ellipse
    cone = Image.new("L", (size, size), 0)
    cd = ImageDraw.Draw(cone)
    ring = []
    for i in range(73):
        a = 2 * math.pi * i / 72
        ring.append(rot(jx, jy, math.cos(a) * 0.86 * js, 0.12 * js + math.sin(a) * 0.2 * js, ang))
    cd.polygon(ring, fill=70)
    cd.line(ring + [ring[0]], fill=235, width=int(js * 0.07))
    cone = cone.filter(ImageFilter.GaussianBlur(size // 140))
    img = Image.composite(Image.new("RGB", (size, size), (240, 248, 255)), img, cone)

    # the jet itself: polished silver with a cyan outline
    jp = jet_points(jx, jy, js, ang)
    jm = mask_of(jp, size)
    silver = vertical_gradient(size, [(0, (250, 252, 255)), (0.5, (190, 202, 216)), (1, (130, 142, 158))])
    edge = jm.filter(ImageFilter.MaxFilter(int(size * 0.008) | 1))
    img = Image.composite(Image.new("RGB", (size, size), (0, 230, 255)), img, edge)
    img = Image.composite(silver, img, jm)
    d = ImageDraw.Draw(img)
    ck = [rot(jx, jy, x * js, y * js, ang) for x, y in [(0, -0.72), (0.035, -0.52), (0, -0.42), (-0.035, -0.52)]]
    d.polygon(ck, fill=(14, 34, 56))
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    full = draw_icon(S)
    full.resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png", optimize=True)
    full.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png", optimize=True)
    full.resize((180, 180), Image.LANCZOS).save(OUT / "apple-touch-icon.png", optimize=True)
    # maskable: everything inside the central 80% safe zone
    draw_icon(S, safe=0.8).resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
