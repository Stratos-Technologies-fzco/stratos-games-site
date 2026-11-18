"""Builds the Picture Data Hub: hub_data.json (dotted outlines) + pics/.

Reads every item from domino_data.CATALOG and makes, for each one:
  - "loops": the real outline (list of point loops) in a 0..1000 space
  - "parts": a picture's inside lines (wheels, windows, legs), also dotted
  - "pic":   the real picture, lined up exactly with the outline
  - "thumb": a small picture for the item buttons (flag for countries, ...)
  - "context": faint neighbour borders (maps and rivers)

Sources: OpenMoji pictures (CC BY-SA 4.0, openmoji.org) and Natural Earth
maps (public domain, India's official view). Downloads are cached in
tools/_downloads so later builds work offline.

Run from anywhere:  python tools/build_hub.py
"""

import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.request

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import domino_data as hub  # noqa: E402
from translations import TRANSLATIONS  # noqa: E402

DL = os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")),
                  "DominoGame", "downloads")
EMOJI_DL = os.path.join(DL, "openmoji")
PICS = os.path.join(ROOT, "pics")
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
OPENMOJI = "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/618x618/"
FONT = r"C:\Windows\Fonts\comicbd.ttf"
SIGN_FONT = r"C:\Windows\Fonts\arialbd.ttf"
SIGNS = "+−×÷=₹"

BENG_FONT_URL = ("https://github.com/notofonts/notofonts.github.io/raw/main/"
                 "fonts/NotoSansBengali/hinted/ttf/NotoSansBengali-Bold.ttf")
DEVA_FONT_URL = ("https://github.com/notofonts/notofonts.github.io/raw/main/"
                 "fonts/NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Bold.ttf")

NORM = 1000.0
CANVAS = 600
PIC_MAX = 384
THUMB = 128

FALLBACK_CODES = {
    "drawn:sugarcane": "1F33E",
    "drawn:pomegranate": "1F34E",
    "drawn:tamarind": "1F95C",
    "drawn:turnip": "1F96C",
    "drawn:lid": "1F373",
    "drawn:mortar": "1F963",
    "drawn:grinding_stone": "1FAA8",
    "drawn:ink_pot": "1F58B",
    "drawn:spinning_top": "1FA80",
    "drawn:xylophone": "1F3B9",
    "drawn:chariot": "1F40E",
}


# ----------------------------------------------------------------- downloads
def download(url, path):
  if not os.path.exists(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for attempt in range(3):
      try:
        urllib.request.urlretrieve(url, path + ".part")
        os.replace(path + ".part", path)
        time.sleep(0.15)
        break
      except Exception:
        if attempt == 2:
          raise
        time.sleep(2)
  return path


EMOJI_TRIM = {
    "Cartoons/Mermaid": [(0, 0, 192, 618)],
}
EMOJI_MIN_FRAC = 0.02


def emoji_picture(key, code):
  img = Image.open(emoji_png(code)).convert("RGBA")
  mask = (np.array(img)[:, :, 3] > 100).astype(np.uint8) * 255
  mask = cv2.morphologyEx(
      mask, cv2.MORPH_CLOSE,
      cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
  for x0, y0, x1, y1 in EMOJI_TRIM.get(key, ()):
    mask[y0:y1, x0:x1] = 0
    arr = np.array(img)
    arr[y0:y1, x0:x1] = 0
    img = Image.fromarray(arr)
  return img, mask


def emoji_png(code):
  code = FALLBACK_CODES.get(code, code)
  for name in (f"{code}.png", f"{code}-FE0F.png"):
    try:
      return download(OPENMOJI + name, os.path.join(EMOJI_DL, name))
    except Exception:
      continue
  # Safe default star fallback if an asset fails to fetch
  return download(OPENMOJI + "2B50.png", os.path.join(EMOJI_DL, "2B50.png"))


def load_geojson(name):
  with open(download(NE + name, os.path.join(DL, name)), encoding="utf-8") as fh:
    return json.load(fh)["features"]


# ----------------------------------------------------------------- geometry
def polygons_of(geom):
  if geom is None:
    return []
  if geom["type"] == "Polygon":
    return [geom["coordinates"]]
  if geom["type"] == "MultiPolygon":
    return geom["coordinates"]
  return []


def lines_of(geom):
  if geom["type"] == "LineString":
    return [geom["coordinates"]]
  if geom["type"] == "MultiLineString":
    return geom["coordinates"]
  return []


def area(pts):
  return 0.5 * abs(sum(x0 * y1 - x1 * y0
                       for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1])))


class Projection:
  def __init__(self, lat0):
    self.k = math.cos(math.radians(lat0))

  def __call__(self, ring):
    return [(lon * self.k, -lat) for lon, lat in ring]


class Frame:
  def __init__(self, x0, y0, x1, y1):
    self.x0, self.y0 = x0, y0
    self.s = NORM / max(x1 - x0, y1 - y0)
    self.w = (x1 - x0) * self.s
    self.h = (y1 - y0) * self.s

  def __call__(self, pts):
    return [((x - self.x0) * self.s, (y - self.y0) * self.s) for x, y in pts]


def bbox(loops):
  xs = [p[0] for lp in loops for p in lp]
  ys = [p[1] for lp in loops for p in lp]
  return min(xs), min(ys), max(xs), max(ys)


def expand(b, f):
  x0, y0, x1, y1 = b
  dx, dy = (x1 - x0) * f, (y1 - y0) * f
  return x0 - dx, y0 - dy, x1 + dx, y1 + dy


def simplify(pts, eps, closed):
  arr = np.array(pts, dtype=np.float32).reshape(-1, 1, 2)
  out = cv2.approxPolyDP(arr, eps, closed).reshape(-1, 2)
  return [(round(float(x), 1), round(float(y), 1)) for x, y in out]


def clip_runs(pts, box):
  x0, y0, x1, y1 = box
  runs, cur = [], []
  for x, y in pts:
    if x0 <= x <= x1 and y0 <= y <= y1:
      cur.append((x, y))
    else:
      if cur:
        cur.append((x, y))
        runs.append(cur)
      cur = []
  if cur:
    runs.append(cur)
  return [r for r in runs if len(r) >= 2]


# ----------------------------------------------------------- raster outlines
def mask_contours(mask, min_frac):
  mask = cv2.GaussianBlur(mask, (5, 5), 0)
  _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
  contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
  if not contours:
    return []
  areas = [cv2.contourArea(c) for c in contours]
  biggest = max(areas)
  keep = [(a, c) for a, c in zip(areas, contours) if a >= biggest * min_frac]
  keep.sort(key=lambda t: -t[0])
  return [[(float(x), float(y)) for x, y in c.reshape(-1, 2)] for _, c in keep]


def outline_from_mask(mask, min_frac=0.04):
  loops = mask_contours(mask, min_frac)
  frame = Frame(*bbox(loops))
  out = [simplify(frame(lp), 2.2, True) for lp in loops]
  out = [lp for lp in out if len(lp) >= 3]
  pic_frame = frame([(0, 0), (mask.shape[1], mask.shape[0])])
  return out, frame, [round(v, 1) for v in (*pic_frame[0], *pic_frame[1])]


PART_EDGE = 15
PART_MIN = 40
PARTS_MAX = 1.0


def thin(img):
  im = np.pad((img > 0).astype(np.uint8), 1)
  while True:
    changed = False
    for step in (0, 1):
      p = im
      p2, p3, p4 = p[:-2, 1:-1], p[:-2, 2:], p[1:-1, 2:]
      p5, p6, p7 = p[2:, 2:], p[2:, 1:-1], p[2:, :-2]
      p8, p9 = p[1:-1, :-2], p[:-2, :-2]
      ring = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
      count = sum(n.astype(np.int32) for n in ring[:8])
      turns = sum(((ring[k] == 0) & (ring[k + 1] == 1)).astype(np.int32) for k in range(8))
      if step == 0:
        side = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
      else:
        side = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
      gone = (p[1:-1, 1:-1] == 1) & (count >= 2) & (count <= 6) & (turns == 1) & side
      if gone.any():
        im[1:-1, 1:-1][gone] = 0
        changed = True
    if not changed:
      return im[1:-1, 1:-1]


_STEPS = [(-1, 0), (0, 1), (1, 0), (0, -1), (-1, 1), (1, 1), (1, -1), (-1, -1)]


def trace_lines(sk):
  ys, xs = np.nonzero(sk)
  pix = set(zip(ys.tolist(), xs.tolist()))

  def nbrs(p):
    out = []
    for dy, dx in _STEPS:
      q = (p[0] + dy, p[1] + dx)
      if q in pix and not (dy and dx and ((p[0] + dy, p[1]) in pix
                                          or (p[0], p[1] + dx) in pix)):
        out.append(q)
    return out

  links = {p: nbrs(p) for p in pix}
  nodes = {p for p, nb in links.items() if len(nb) != 2}
  used = set()

  def walk(start, nxt):
    path = [start, nxt]
    used.add(frozenset((start, nxt)))
    prev, cur = start, nxt
    while cur not in nodes and cur != start:
      step = [q for q in links[cur] if q != prev and frozenset((cur, q)) not in used]
      if not step:
        break
      used.add(frozenset((cur, step[0])))
      path.append(step[0])
      prev, cur = cur, step[0]
    return path

  lines = []
  for n in sorted(nodes):
    for q in links[n]:
      if frozenset((n, q)) not in used:
        lines.append((walk(n, q), False))
  for p in sorted(pix):
    free = [q for q in links[p] if frozenset((p, q)) not in used]
    if p not in nodes and len(free) == 2:
      path = walk(p, free[0])
      closed = path[-1] == p
      lines.append((path[:-1] if closed else path, closed))
  return [([(x, y) for y, x in pts], closed) for pts, closed in lines]


def inner_parts(img, mask, frame, loops):
  arr = np.array(img)
  line = (arr[:, :, :3].max(axis=2) < 90) & (arr[:, :, 3] > 100)
  line = cv2.morphologyEx(line.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
  sk = thin(line)
  inside = cv2.distanceTransform((mask > 127).astype(np.uint8), cv2.DIST_L2, 5)
  sk[inside < PART_EDGE] = 0
  found = []
  for pts, closed in trace_lines(sk):
    if len(pts) < 2:
      continue
    size = cv2.arcLength(np.array(pts, np.float32).reshape(-1, 1, 2), closed)
    if size >= PART_MIN:
      found.append((size * frame.s, pts, closed))
  found.sort(key=lambda t: -t[0])
  budget = PARTS_MAX * sum(cv2.arcLength(np.array(lp, np.float32).reshape(-1, 1, 2), True)
                           for lp in loops)
  parts, total = [], 0.0
  for size, pts, closed in found:
    if total + size > budget:
      continue
    pts = simplify(frame(pts), 2.2, closed)
    if len(pts) >= (3 if closed else 2):
      parts.append([1 if closed else 0, pts])
      total += size
  return parts


def save_pic(img, slug, kind="pic", size=PIC_MAX):
  img = img.copy()
  img.thumbnail((size, size), Image.LANCZOS)
  rel = f"pics/{slug}{'' if kind == 'pic' else '_t'}.png"
  compact(img).save(os.path.join(ROOT, rel), optimize=True)
  return rel


def compact(img):
  return img.convert("RGBA").quantize(colors=128, method=Image.Quantize.FASTOCTREE,
                                      dither=Image.Dither.NONE)


def colour_silhouette(mask, fill, edge=(40, 40, 60)):
  h, w = mask.shape
  rgba = np.zeros((h, w, 4), np.uint8)
  rgba[mask > 127] = (*fill, 255)
  contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
  edge_img = np.zeros((h, w), np.uint8)
  cv2.drawContours(edge_img, contours, -1, 255, 8)
  rgba[edge_img > 0] = (*edge, 255)
  return Image.fromarray(rgba, "RGBA")


def hsv(i, n, s=0.65, v=0.95):
  import colorsys
  r, g, b = colorsys.hsv_to_rgb((i / max(1, n)) % 1.0, s, v)
  return int(r * 255), int(g * 255), int(b * 255)


def glyph_mask(ch):
  img = Image.new("L", (CANVAS, CANVAS), 0)
  font = ImageFont.truetype(SIGN_FONT if ch in SIGNS else FONT, 430)
  ImageDraw.Draw(img).text((CANVAS / 2, CANVAS / 2), ch, fill=255, font=font,
                           anchor="mm")
  return np.array(img)


_DEVA_FONTS = {}


def deva_font(size):
  import pygame
  if size not in _DEVA_FONTS:
    pygame.font.init()
    path = download(DEVA_FONT_URL, os.path.join(DL, "fonts", "NotoSansDevanagari-Bold.ttf"))
    f = pygame.font.Font(path, size)
    f.set_script("Deva")
    _DEVA_FONTS[size] = f
  return _DEVA_FONTS[size]


_BENG_FONTS = {}


def beng_font(size):
  import pygame
  if size not in _BENG_FONTS:
    pygame.font.init()
    path = download(BENG_FONT_URL, os.path.join(DL, "fonts", "NotoSansBengali-Bold.ttf"))
    f = pygame.font.Font(path, size)
    f.set_script("Beng")
    _BENG_FONTS[size] = f
  return _BENG_FONTS[size]


def hindi_mask(text):
  import pygame
  surf = deva_font(330).render(text, True, (255, 255, 255))
  alpha = np.array(pygame.surfarray.pixels_alpha(surf)).T.copy()
  h, w = alpha.shape
  scale = min(1.0, (CANVAS * 0.84) / max(w, h))
  if scale < 1.0:
    alpha = cv2.resize(alpha, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    h, w = alpha.shape
  mask = np.zeros((CANVAS, CANVAS), np.uint8)
  y0, x0 = (CANVAS - h) // 2, (CANVAS - w) // 2
  mask[y0:y0 + h, x0:x0 + w] = alpha
  return mask


def bangla_mask(text):
  import pygame
  surf = beng_font(330).render(text, True, (255, 255, 255))
  alpha = np.array(pygame.surfarray.pixels_alpha(surf)).T.copy()
  h, w = alpha.shape
  scale = min(1.0, (CANVAS * 0.84) / max(w, h))
  if scale < 1.0:
    alpha = cv2.resize(alpha, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    h, w = alpha.shape
  mask = np.zeros((CANVAS, CANVAS), np.uint8)
  y0, x0 = (CANVAS - h) // 2, (CANVAS - w) // 2
  mask[y0:y0 + h, x0:x0 + w] = alpha
  return mask


def mixed_render(text, lang, size, colour):
  """Hindi / Bengali text; the Bengali font has no Latin digits or signs (- , : + =), so
  those come from the matching Noto Devanagari font instead of showing as boxes."""
  import pygame
  font = deva_font(size) if lang == "hi" else beng_font(size)
  if lang == "hi" or not any(c in BENG_MISSING for c in text):
    return font.render(text, True, colour)
  runs = []
  for c in text:
    f = deva_font(size) if c in BENG_MISSING else font
    if runs and runs[-1][0] is f:
      runs[-1][1].append(c)
    else:
      runs.append((f, [c]))
  parts = [(f, f.render("".join(cs), True, colour)) for f, cs in runs]
  top = max(f.get_ascent() for f, _ in parts)
  out = pygame.Surface((sum(p.get_width() for _, p in parts),
                        max(top - f.get_ascent() + p.get_height() for f, p in parts)), pygame.SRCALPHA)
  x = 0
  for f, p in parts:
    out.blit(p, (x, top - f.get_ascent()))
    x += p.get_width()
  return out


BENG_MISSING = set("0123456789+-=:,.()%/")


def native_word_image(text, slug, lang):
  import pygame
  surf = mixed_render(text, lang, 72, (255, 230, 120))
  raw = pygame.image.tobytes(surf, "RGBA")
  img = Image.frombytes("RGBA", surf.get_size(), raw)
  img = img.crop(img.getbbox())
  rel = f"pics/{slug}_{lang}.png"
  compact(img).save(os.path.join(ROOT, rel), optimize=True)
  return rel


def hindi_word_image(text, slug):
  import pygame
  surf = deva_font(96).render(text, True, (255, 204, 0))
  raw = pygame.image.tobytes(surf, "RGBA")
  img = Image.frombytes("RGBA", surf.get_size(), raw)
  img = img.crop(img.getbbox())
  rel = f"pics/{slug}_w.png"
  compact(img).save(os.path.join(ROOT, rel), optimize=True)
  return rel


def shape_mask(kind):
  img = Image.new("L", (CANVAS, CANVAS), 0)
  d = ImageDraw.Draw(img)
  c, r = CANVAS / 2, CANVAS * 0.4

  def poly(n, rot=-math.pi / 2, rad=r):
    return [(c + rad * math.cos(rot + 2 * math.pi * i / n),
             c + rad * math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]

  if kind == "circle":
    d.ellipse((c - r, c - r, c + r, c + r), fill=255)
  elif kind == "square":
    d.rectangle((c - r * 0.85, c - r * 0.85, c + r * 0.85, c + r * 0.85), fill=255)
  elif kind == "rectangle":
    d.rectangle((c - r, c - r * 0.55, c + r, c + r * 0.55), fill=255)
  elif kind == "triangle":
    d.polygon(poly(3, rad=r * 1.1), fill=255)
  elif kind == "pentagon":
    d.polygon(poly(5), fill=255)
  elif kind == "hexagon":
    d.polygon(poly(6, rot=0), fill=255)
  elif kind == "diamond":
    d.polygon([(c, c - r), (c + r * 0.7, c), (c, c + r), (c - r * 0.7, c)], fill=255)
  elif kind == "oval":
    d.ellipse((c - r * 0.7, c - r, c + r * 0.7, c + r), fill=255)
  elif kind == "star":
    pts = []
    for i in range(10):
      rad = r if i % 2 == 0 else r * 0.42
      a = -math.pi / 2 + i * math.pi / 5
      pts.append((c + rad * math.cos(a), c + rad * math.sin(a)))
    d.polygon(pts, fill=255)
  elif kind == "heart":
    pts = []
    for i in range(200):
      t = 2 * math.pi * i / 200
      x = 16 * math.sin(t) ** 3
      y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
      pts.append((c + x * r / 16, c - y * r / 16 - r * 0.05))
    d.polygon(pts, fill=255)
  elif kind == "moon":
    d.ellipse((c - r, c - r, c + r, c + r), fill=255)
    d.ellipse((c - r * 0.45, c - r * 1.05, c + r * 1.35, c + r * 0.75), fill=0)
  elif kind == "igloo":
    base = c + r * 0.45
    d.pieslice((c - r, base - r, c + r, base + r), 180, 360, fill=255)
    d.pieslice((c - r * 0.28, base - r * 0.32, c + r * 0.28, base + r * 0.32),
               180, 360, fill=0)
  elif kind == "road":
    pts = [(c + r * 0.45 * math.sin(i / 40 * 2.2 * math.pi), c - r + 2 * r * i / 40)
           for i in range(41)]
    d.line(pts, fill=255, width=int(r * 0.4), joint="curve")
  elif kind == "railway":
    for i in range(7):
      y = c - r + i * (2 * r / 6)
      d.rectangle((c - r * 0.5, y - r * 0.05, c + r * 0.5, y + r * 0.05), fill=255)
    for x in (c - r * 0.3, c + r * 0.3):
      d.rectangle((x - r * 0.05, c - r * 1.02, x + r * 0.05, c + r * 1.02), fill=255)
  elif kind == "parallelogram":
    d.polygon([(c - r, c + r * 0.5), (c + r * 0.45, c + r * 0.5), (c + r, c - r * 0.5),
               (c - r * 0.45, c - r * 0.5)], fill=255)
  elif kind == "trapezium":
    d.polygon([(c - r, c + r * 0.55), (c + r, c + r * 0.55), (c + r * 0.5, c - r * 0.55),
               (c - r * 0.5, c - r * 0.55)], fill=255)
  elif kind == "kite":
    d.polygon([(c, c - r), (c + r * 0.6, c - r * 0.3), (c, c + r), (c - r * 0.6, c - r * 0.3)], fill=255)
  elif kind == "octagon":
    d.polygon(poly(8, rot=-math.pi / 2 + math.pi / 8), fill=255)
  elif kind == "semicircle":
    d.pieslice((c - r, c - r * 0.6, c + r, c + r * 1.4), 180, 360, fill=255)
  elif kind in ("right_angle", "acute_angle", "obtuse_angle"):
    deg = {"right_angle": 90, "acute_angle": 45, "obtuse_angle": 130}[kind]
    ox, oy = (c - r * 0.6, c + r * 0.7) if deg < 120 else (c + r * 0.1, c + r * 0.6)
    rad = r * (1.5 if deg < 120 else 1.0)
    d.pieslice((ox - rad, oy - rad, ox + rad, oy + rad), 360 - deg, 360, fill=255)
  elif kind == "cylinder":
    w, h = r * 0.6, r * 0.9
    d.rectangle((c - w, c - h, c + w, c + h), fill=255)
    d.ellipse((c - w, c - h - r * 0.22, c + w, c - h + r * 0.22), fill=255)
    d.ellipse((c - w, c + h - r * 0.22, c + w, c + h + r * 0.22), fill=255)
  elif kind == "cone":
    d.polygon([(c, c - r), (c + r * 0.6, c + r * 0.7), (c - r * 0.6, c + r * 0.7)], fill=255)
    d.ellipse((c - r * 0.6, c + r * 0.5, c + r * 0.6, c + r * 0.9), fill=255)
  elif kind == "arrow":
    d.polygon([(c - r, c - r * 0.25), (c + r * 0.2, c - r * 0.25),
               (c + r * 0.2, c - r * 0.6), (c + r, c), (c + r * 0.2, c + r * 0.6),
               (c + r * 0.2, c + r * 0.25), (c - r, c + r * 0.25)], fill=255)
  else:
    raise ValueError(kind)
  return np.array(img)


def landmark_mask(spec):
  if isinstance(spec, tuple):
    half, holes = spec
  else:
    half, holes = spec, []
  full = list(half) + [(100 - x, y) for x, y in reversed(half)]
  m, s = CANVAS * 0.08, CANVAS * 0.84 / 100

  def tf(pts):
    return [(m + x * s, m + y * s) for x, y in pts]

  img = Image.new("L", (CANVAS, CANVAS), 0)
  d = ImageDraw.Draw(img)
  d.polygon(tf(full), fill=255)
  for hole in holes:
    d.polygon(tf(hole), fill=0)
  return np.array(img)


def render_map(frame, fills, lines=(), size=PIC_MAX * 2):
  k = size / max(frame.w, frame.h)
  w, h = max(1, int(frame.w * k)), max(1, int(frame.h * k))
  img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
  d = ImageDraw.Draw(img)
  for rings, fill, edge in fills:
    for ring in rings:
      pts = [(x * k, y * k) for x, y in frame(ring)]
      if len(pts) >= 3:
        d.polygon(pts, fill=fill, outline=edge)
        d.line(pts + pts[:1], fill=edge, width=max(2, size // 200))
  for pts, col, width in lines:
    d.line([(x * k, y * k) for x, y in frame(pts)], fill=col, width=width,
           joint="curve")
  return img


def official_kashmir(india, states):
  lon0, lat0, res = 72.0, 37.6, 0.01
  w, h = int((81.0 - lon0) / res), int((lat0 - 32.0) / res)

  def fill(features):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    for f in features:
      for poly in polygons_of(f["geometry"]):
        d.polygon([((lon - lon0) / res, (lat0 - lat) / res) for lon, lat in poly[0]], fill=255)
    return np.array(img) > 0

  jk = next(f for f in states if f["properties"]["name"] == "Jammu and Kashmir")
  la = next(f for f in states if f["properties"]["name"] == "Ladakh")
  extra = fill([india]) & ~fill([f for f in states if f not in (jk, la)])
  extra &= ~fill([jk]) & ~fill([la])
  yy, xx = np.mgrid[0:h, 0:w]
  pok = (lon0 + xx * res < 75.6) & (lat0 - yy * res < 35.05)

  def feature(mask, props):
    m = cv2.morphologyEx(mask.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    big = max(contours, key=cv2.contourArea).reshape(-1, 2)
    ring = [(round(lon0 + x * res, 4), round(lat0 - y * res, 4)) for x, y in big]
    return {"type": "Feature", "properties": props,
            "geometry": {"type": "Polygon", "coordinates": [ring]}}

  return (feature(fill([jk]) | (extra & pok), jk["properties"]),
          feature(fill([la]) | (extra & ~pok), la["properties"]))


def group_rings(feature, proj):
  rings = sorted((proj(poly[0]) for poly in polygons_of(feature["geometry"])),
                 key=area, reverse=True)
  main = rings[0]
  x0, y0, x1, y1 = bbox([main])
  cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
  reach = max(3 * max(x1 - x0, y1 - y0), 1.2)
  keep = [main]
  for r in rings[1:]:
    rx0, ry0, rx1, ry1 = bbox([r])
    if (area(r) >= area(main) * 0.03
        and math.hypot((rx0 + rx1) / 2 - cx, (ry0 + ry1) / 2 - cy) <= reach):
      keep.append(r)
  return keep


ISLAND_GROUPS = {"Lakshadweep": (71.0, 74.5, 7.8, 12.6)}


def island_group(india, proj, window, grow=0.025):
  lon0, lon1, lat0, lat1 = window
  rings = []
  for poly in polygons_of(india["geometry"]):
    r = poly[0]
    lon = sum(p[0] for p in r) / len(r)
    lat = sum(p[1] for p in r) / len(r)
    if lon0 <= lon <= lon1 and lat0 <= lat <= lat1:
      rings.append(proj(r))
  frame = Frame(*expand(bbox(rings), 0.08))
  img = Image.new("L", (int(frame.w) + 2, int(frame.h) + 2), 0)
  d = ImageDraw.Draw(img)
  for r in rings:
    d.polygon(frame(r), fill=255)
  size = int(NORM * grow) * 2 + 1
  mask = cv2.dilate(np.array(img), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (size, size)))
  contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
  out = [[(x / frame.s + frame.x0, y / frame.s + frame.y0) for x, y in c.reshape(-1, 2)]
         for c in contours]
  return sorted(out, key=area, reverse=True)


def label_point(rings, frame, k=0.5):
  size = (int(frame.w * k) + 2, int(frame.h * k) + 2)
  img = Image.new("L", size, 0)
  d = ImageDraw.Draw(img)
  for r in rings:
    d.polygon([(x * k, y * k) for x, y in frame(r)], fill=255)
  dist = cv2.distanceTransform(np.array(img), cv2.DIST_L2, 3)
  y, x = np.unravel_index(int(np.argmax(dist)), dist.shape)
  return round(x / k, 1), round(y / k, 1), float(dist.max()) / k


LANDMARK_FILL = {
    "Monuments/War Memorial": (205, 205, 195), "Monuments/Red Fort": (205, 90, 70),
    "Monuments/Lotus Temple": (240, 240, 245), "Monuments/Golden Temple": (240, 190, 60),
    "Monuments/Hawa Mahal": (235, 140, 120), "Monuments/Qutub Minar": (190, 100, 70),
    "Monuments/Konark Wheel": (180, 130, 90), "Monuments/Sanchi Stupa": (215, 180, 140),
}


def flag_thumb(iso2, slug):
  code = "-".join(f"{0x1F1E6 + ord(ch) - 65:X}" for ch in iso2.upper())
  img = Image.open(emoji_png(code)).convert("RGBA")
  return save_pic(img.crop(img.getbbox()), slug, "thumb", THUMB)


def slugify(ci, ii, name):
  return f"{ci:02d}_{ii:02d}_" + re.sub(r"[^A-Za-z0-9]+", "_", name).strip("_")


def main():
  os.makedirs(PICS, exist_ok=True)
  countries = load_geojson("ne_10m_admin_0_countries_ind.geojson")
  states = [f for f in load_geojson("ne_10m_admin_1_states_provinces.geojson")
            if f["properties"].get("adm0_a3") == "IND"]
  rivers = load_geojson("ne_10m_rivers_lake_centerlines.geojson")

  def country(name):
    for f in countries:
      p = f["properties"]
      if name in (p.get("NAME"), p.get("ADMIN"), p.get("NAME_LONG")):
        return f
    raise KeyError(name)

  def biggest_ring(feature, proj):
    rings = [proj(poly[0]) for poly in polygons_of(feature["geometry"])]
    rings.sort(key=area, reverse=True)
    return rings[0], rings[1:]

  def neighbours(view, proj, skip=None, extra=()):
    x0, y0, x1, y1 = view
    out = []
    for f in list(countries) + list(extra):
      if f is skip:
        continue
      for poly in polygons_of(f["geometry"]):
        ring = proj(poly[0])
        bx0, by0, bx1, by1 = bbox([ring])
        if bx1 < x0 or bx0 > x1 or by1 < y0 or by0 > y1:
          continue
        out.append(ring)
    return out

  def lat_centre(feature_or_lines):
    lats = [pt[1] for ln in feature_or_lines for pt in ln]
    return (min(lats) + max(lats)) / 2

  india = country("India")
  jk, la = official_kashmir(india, states)
  states = [jk if f["properties"]["name"] == "Jammu and Kashmir" else
            la if f["properties"]["name"] == "Ladakh" else f for f in states]
  result, failed = {}, []

  for ci, (cat, items) in enumerate(hub.CATALOG.items()):
    for ii, (name, _desc, (kind, arg)) in enumerate(items):
      if kind == "custom":
        key = hub.item_key(cat, name)
        if key in TRANSLATIONS:
          slug = slugify(ci, ii, name)
          hi, bn = TRANSLATIONS[key]
          result[key] = {"hi_img": native_word_image(hi, slug, "hi"),
                         "bn_img": native_word_image(bn, slug, "bn")}
        continue
      key = hub.item_key(cat, name)
      slug = slugify(ci, ii, name)
      try:
        entry = {"closed": True}
        if kind in ("emoji", "glyph", "shape", "landmark", "hindi", "bangla"):
          if kind == "emoji":
            img, mask = emoji_picture(key, arg)
            pic = img
            min_frac = EMOJI_MIN_FRAC
          elif kind == "glyph":
            mask = glyph_mask(arg)
            pic = colour_silhouette(mask, hsv(ii, len(items)))
            min_frac = 0.01
          elif kind in ("hindi", "bangla"):
            mask = hindi_mask(name) if kind == "hindi" else bangla_mask(name)
            pic = colour_silhouette(mask, hsv(ii, len(items)))
            min_frac = 0.005
            if kind == "hindi":
              entry["word_img"] = hindi_word_image(arg[0], slug)
            else:
              entry["word_img"] = native_word_image(arg[0], slug, "bn")
          elif kind == "shape":
            mask = shape_mask(arg)
            fill = {"road": (120, 120, 130), "railway": (150, 100, 60),
                    "igloo": (225, 240, 255)}.get(arg, hsv(ii, len(items)))
            pic = colour_silhouette(mask, fill)
            min_frac = 0.04
          else:
            mask = landmark_mask(arg)
            fill = LANDMARK_FILL.get(key, (226, 120, 80) if cat == "Bridges" else (236, 196, 140))
            pic = colour_silhouette(mask, fill, (90, 60, 40))
            min_frac = 0.01
          loops, frame, pic_frame = outline_from_mask(mask, min_frac)
          entry.update(loops=loops, w=round(frame.w, 1), h=round(frame.h, 1),
                       pic=save_pic(pic, slug), pic_frame=pic_frame)
          if kind == "emoji":
            entry["parts"] = inner_parts(img, mask, frame, loops)
          entry["thumb"] = save_pic(pic.crop(pic.getbbox()), slug, "thumb", THUMB)

        elif kind == "state":
          feat = next(f for f in states if f["properties"]["name"] == arg)
          others = [f for f in states if f is not feat]
          proj = Projection(lat_centre([poly[0] for poly in polygons_of(feat["geometry"])]))
          if arg in ISLAND_GROUPS:
            rings = island_group(india, proj, ISLAND_GROUPS[arg])
          else:
            rings = group_rings(feat, proj)
          frame = Frame(*bbox(rings))
          loops = [lp for lp in (simplify(frame(r), 2.0, True) for r in rings) if len(lp) >= 3]
          ctx = []
          vbox = (-NORM * 0.4, -NORM * 0.4, frame.w + NORM * 0.4, frame.h + NORM * 0.4)
          for ring in neighbours(expand(bbox(rings), 0.35), proj, skip=feat, extra=others):
            for run in clip_runs(frame(ring), vbox):
              s = simplify(run, 3.0, False)
              if len(s) >= 2:
                ctx.append(s)
          pic = render_map(frame, [(rings, (250, 170, 70, 255), (150, 80, 20, 255))])
          places = []
          cap, cap_at, spots = hub.INDIA_PLACES.get(arg, (None, None, []))
          marks = ([(cap, cap_at, "capital")] if cap else []) + [
              (n, (lat, lon), "place") for n, lat, lon in spots]
          for label, (lat, lon), what in marks:
            x, y = frame(proj([(lon, lat)]))[0]
            if -0.03 * frame.w <= x <= 1.03 * frame.w and -0.03 * frame.h <= y <= 1.03 * frame.h:
              places.append([label, round(x, 1), round(y, 1), what])
          entry.update(loops=loops, w=round(frame.w, 1), h=round(frame.h, 1), context=ctx,
                       pic=save_pic(pic, slug), places=places,
                       pic_frame=[0, 0, round(frame.w, 1), round(frame.h, 1)])
          ip = Projection(22)
          iring, _ = biggest_ring(india, ip)
          ifr = Frame(*bbox([iring]))
          own = (island_group(india, ip, ISLAND_GROUPS[arg]) if arg in ISLAND_GROUPS
                 else group_rings(feat, ip))
          th = render_map(ifr, [
              ([iring], (200, 230, 200, 255), (60, 110, 60, 255)),
              (own, (250, 140, 40, 255), (150, 70, 10, 255)),
          ], size=THUMB * 2)
          if sum(area(r) for r in own) < area(iring) * 0.004:
            k = THUMB * 2 / max(ifr.w, ifr.h)
            x0, y0, x1, y1 = bbox([ifr(r) for r in own])
            cx, cy, rad = (x0 + x1) / 2 * k, (y0 + y1) / 2 * k, THUMB * 0.13
            ImageDraw.Draw(th).ellipse((cx - rad, cy - rad, cx + rad, cy + rad),
                                       outline=(220, 30, 40, 255), width=5)
          entry["thumb"] = save_pic(th, slug, "thumb", THUMB)

        elif kind == "india_map":
          proj = Projection(22)
          main_ring, islands = biggest_ring(india, proj)
          frame = Frame(*bbox([main_ring]))
          loops = [simplify(frame(main_ring), 2.5, True)]
          fills, ctx, places = [], [], []
          ordered = sorted(states, key=lambda f: f["properties"]["name"])
          names = {ne: n for n, ne, *_r in hub.INDIA_STATES + hub.INDIA_UTS}
          for i, f in enumerate(ordered):
            rings = [proj(poly[0]) for poly in polygons_of(f["geometry"])]
            r, g, b = hsv(i * 7 % len(ordered), len(ordered), s=0.45, v=0.97)
            fills.append((rings, (r, g, b, 255), (70, 70, 90, 255)))
            for ring in rings:
              if area(ring) > area(main_ring) * 0.0004:
                s = simplify(frame(ring), 2.5, True)
                if len(s) >= 3:
                  ctx.append(s + s[:1])
            main = max(rings, key=area)
            x, y, room = label_point([main], frame)
            places.append([names.get(f["properties"]["name"], f["properties"]["name"]),
                           x, y, "state", round(room, 1)])
          x, y = frame(proj([(77.2090, 28.6139)]))[0]
          places.append(["New Delhi", round(x, 1), round(y, 1), "capital"])
          pic = render_map(frame, [([main_ring] + islands, (235, 235, 225, 255),
                                    (60, 60, 80, 255))] + fills)
          entry.update(loops=loops, w=round(frame.w, 1), h=round(frame.h, 1), context=ctx,
                       pic=save_pic(pic, slug, size=640), places=places,
                       pic_frame=[0, 0, round(frame.w, 1), round(frame.h, 1)])
          entry["thumb"] = save_pic(pic, slug, "thumb", THUMB)

        elif kind == "country":
          feat = country(arg)
          others = []
          proj = Projection(lat_centre([poly[0] for poly in polygons_of(feat["geometry"])]))
          main_ring, islands = biggest_ring(feat, proj)
          frame = Frame(*bbox([main_ring]))
          loops = [simplify(frame(main_ring), 2.0, True)]
          view = expand(bbox([main_ring]), 0.35)
          ctx_rings = neighbours(view, proj, skip=feat, extra=others)
          ctx_rings += [r for r in islands if area(r) > area(main_ring) * 0.002]
          ctx = []
          vbox = (-NORM * 0.4, -NORM * 0.4, frame.w + NORM * 0.4, frame.h + NORM * 0.4)
          for ring in ctx_rings:
            for run in clip_runs(frame(ring), vbox):
              s = simplify(run, 3.0, False)
              if len(s) >= 2:
                ctx.append(s)
          fills = [([main_ring] + islands, (120, 200, 120, 255), (30, 90, 40, 255))]
          pic = render_map(frame, fills)
          entry.update(loops=loops, w=round(frame.w, 1), h=round(frame.h, 1),
                       context=ctx, pic=save_pic(pic, slug),
                       pic_frame=[0, 0, round(frame.w, 1), round(frame.h, 1)])
          p = feat["properties"]
          iso = p.get("ISO_A2") if p.get("ISO_A2", "-99") != "-99" else p.get("ISO_A2_EH")
          entry["thumb"] = flag_thumb(iso, slug)

        elif kind == "river":
          wanted = {plain(n) for n in arg}
          segs = []
          for f in rivers:
            p = f["properties"]
            names = {plain(str(p.get(k) or "")) for k in ("name", "name_en", "name_alt")}
            if names & wanted:
              segs += [list(map(tuple, ln)) for ln in lines_of(f["geometry"])]
          if not segs:
            raise KeyError(f"river {arg} not in Natural Earth")
          chain = join_segments(segs)
          proj = Projection(lat_centre([chain]))
          course = proj(chain)
          frame_box = expand(bbox([course]), 0.12)
          frame = Frame(*frame_box)
          loops = [simplify(frame(course), 1.5, False)]
          ctx_rings = neighbours(expand(frame_box, 0.3), proj)
          ctx = []
          vbox = (-NORM * 0.4, -NORM * 0.4, frame.w + NORM * 0.4, frame.h + NORM * 0.4)
          for ring in ctx_rings:
            for run in clip_runs(frame(ring), vbox):
              s = simplify(run, 3.0, False)
              if len(s) >= 2:
                ctx.append(s)
          pic = render_map(frame, [(ctx_rings, (205, 235, 200, 255), (110, 150, 110, 255))],
                           [(course, (30, 110, 230, 255), 10)])
          entry.update(closed=False, loops=loops, w=round(frame.w, 1),
                       h=round(frame.h, 1), context=ctx, pic=save_pic(pic, slug),
                       pic_frame=[0, 0, round(frame.w, 1), round(frame.h, 1)])
          entry["thumb"] = save_pic(pic, slug, "thumb", THUMB)
        else:
          raise ValueError(kind)

        if not entry["loops"]:
          raise ValueError("empty outline")
        if key in TRANSLATIONS:
          hi, bn = TRANSLATIONS[key]
          entry["hi_img"] = native_word_image(hi, slug, "hi")
          entry["bn_img"] = native_word_image(bn, slug, "bn")
        result[key] = entry
        print(f"ok   {key:32s} loops={len(entry['loops'])} "
              f"pts={sum(len(l) for l in entry['loops'])}")
      except Exception as exc:
        failed.append((key, str(exc)))
        print(f"FAIL {key}: {exc}")

  with open(hub.HUB_JSON, "w", encoding="utf-8") as fh:
    json.dump(result, fh, separators=(",", ":"))
  print(f"\n{len(result)} items written to hub_data.json, {len(failed)} failed")
  for k, e in failed:
    print("  missing:", k, e)


def plain(text):
  text = unicodedata.normalize("NFKD", text)
  return "".join(ch for ch in text if not unicodedata.combining(ch)).lower()


def join_segments(segs, tol=0.02):
  def d(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])

  def length(s):
    return sum(d(a, b) for a, b in zip(s, s[1:]))

  remaining = sorted(segs, key=length, reverse=True)
  chain = list(remaining.pop(0))
  grown = True
  while grown and remaining:
    grown = False
    for i, s in enumerate(remaining):
      if d(chain[-1], s[0]) < tol:
        chain += s[1:]
      elif d(chain[-1], s[-1]) < tol:
        chain += s[::-1][1:]
      elif d(chain[0], s[-1]) < tol:
        chain = s[:-1] + chain
      elif d(chain[0], s[0]) < tol:
        chain = s[::-1][:-1] + chain
      else:
        continue
      remaining.pop(i)
      grown = True
      break
  return chain


if __name__ == "__main__":
  main()