"""Picture-book scenery behind the play area: one little world per colour theme.

  day     - blue sky, smiling sun, drifting clouds, a faint rainbow, green hills, flowers
  night   - deep sky, moon, twinkling stars, sleepy hills with lit windows
  sea     - under the sea: light rays, rising bubbles, swaying seaweed, sand
  forest  - evening forest: layers of pine trees and glowing fireflies
  candy   - pink dusk with floating balloons and sparkles
  sunset  - orange sky, a big setting sun, birds flying home

The still part of each scene is painted once and kept (per scene and size); only a
few small things move each frame, so phones and the browser stay fast. Colours are
soft so the dotted outline and the dominoes stay easy to see.
"""
import math
import random

import pygame

_cache = {}


def _gradient(size, top, bottom):
  w, h = size
  s = pygame.Surface((w, h))
  for y in range(h):
    k = y / max(1, h - 1)
    pygame.draw.line(s, tuple(int(top[i] + (bottom[i] - top[i]) * k) for i in range(3)),
                     (0, y), (w, y))
  return s


def _hills(s, colour, base, amp, freq, phase, w, h):
  pts = [(0, h)]
  for x in range(0, w + 8, 8):
    y = base - amp * (0.6 * math.sin(x * freq + phase) + 0.4 * math.sin(x * freq * 2.3 + phase * 1.7))
    pts.append((x, y))
  pts.append((w, h))
  pygame.draw.polygon(s, colour, pts)


def _cloud(width):
  h = int(width * 0.62)
  s = pygame.Surface((width, h), pygame.SRCALPHA)
  col = (255, 255, 255, 235)
  pygame.draw.ellipse(s, col, (int(width * 0.08), int(h * 0.5), int(width * 0.84), int(h * 0.42)))
  for cx, cy, r in ((0.27, 0.62, 0.17), (0.47, 0.44, 0.24), (0.7, 0.58, 0.18)):
    pygame.draw.circle(s, col, (int(cx * width), int(cy * h)), int(r * width))
  return s


def _static(scene, size):
  """The painted, non-moving part of a scene."""
  w, h = size
  rnd = random.Random(7)
  if scene == "day":
    s = _gradient(size, (96, 178, 250), (206, 236, 255))
    arc = pygame.Surface(size, pygame.SRCALPHA)           # a faint rainbow behind the hills
    cx, cy, r = w * 0.32, h * 0.95, min(w, h) * 0.62
    for k, col in enumerate(((255, 90, 90), (255, 170, 60), (255, 230, 80), (110, 210, 110),
                             (90, 170, 255), (160, 110, 230))):
      rr = int(r - k * 9)
      pygame.draw.circle(arc, (*col, 60), (int(cx), int(cy)), rr, 9)
    s.blit(arc, (0, 0))
    _hills(s, (150, 210, 120), h * 0.80, h * 0.05, 0.006, 0.5, w, h)
    _hills(s, (110, 190, 95), h * 0.88, h * 0.04, 0.009, 2.0, w, h)
    for _ in range(int(w / 9)):                           # flowers on the front hill
      x, y = rnd.uniform(0, w), rnd.uniform(h * 0.92, h - 4)
      col = rnd.choice(((255, 255, 255), (255, 220, 80), (255, 140, 180), (200, 160, 255)))
      pygame.draw.circle(s, col, (int(x), int(y)), 3)
      pygame.draw.circle(s, (255, 200, 40), (int(x), int(y)), 1)
  elif scene == "night":
    s = _gradient(size, (12, 16, 44), (44, 42, 96))
    _hills(s, (30, 34, 70), h * 0.82, h * 0.05, 0.005, 1.0, w, h)
    _hills(s, (22, 26, 54), h * 0.90, h * 0.035, 0.008, 3.0, w, h)
    for _ in range(max(3, int(w / 90))):                  # little houses with warm windows
      x, y = rnd.uniform(20, w - 40), rnd.uniform(h * 0.90, h * 0.95)
      pygame.draw.rect(s, (18, 20, 44), (x, y - 14, 22, 16))
      pygame.draw.polygon(s, (18, 20, 44), [(x - 3, y - 14), (x + 11, y - 24), (x + 25, y - 14)])
      pygame.draw.rect(s, (255, 214, 120), (x + 8, y - 9, 6, 6))
  elif scene == "sea":
    s = _gradient(size, (40, 150, 200), (8, 52, 96))
    _hills(s, (214, 196, 140), h * 0.93, h * 0.02, 0.01, 0.0, w, h)
    for _ in range(int(w / 40)):                          # shells and pebbles
      x, y = rnd.uniform(0, w), rnd.uniform(h * 0.95, h - 3)
      pygame.draw.circle(s, rnd.choice(((255, 200, 200), (240, 230, 210), (180, 160, 130))),
                         (int(x), int(y)), rnd.randint(2, 4))
  elif scene == "forest":
    s = _gradient(size, (40, 70, 80), (90, 120, 80))
    for layer, (col, base, tree_h) in enumerate((((50, 84, 70), 0.86, 0.22), ((34, 64, 48), 0.93, 0.18))):
      x = -20 + layer * 30
      while x < w + 40:
        th = h * tree_h * rnd.uniform(0.7, 1.1)
        tw = th * 0.45
        y = h * base
        for k in range(3):                                # three stacked triangles per pine
          yy = y - th * k * 0.28
          ww = tw * (1 - k * 0.25)
          pygame.draw.polygon(s, col, [(x - ww / 2, yy), (x + ww / 2, yy), (x, yy - th * 0.45)])
        x += tw * rnd.uniform(0.7, 1.1)
      pygame.draw.rect(s, col, (0, h * base, w, h))
  elif scene == "candy":
    s = _gradient(size, (120, 60, 140), (250, 160, 200))
    _hills(s, (240, 140, 190), h * 0.86, h * 0.04, 0.007, 1.2, w, h)
    _hills(s, (220, 110, 170), h * 0.93, h * 0.03, 0.011, 0.3, w, h)
  else:                                                   # sunset
    s = _gradient(size, (90, 60, 140), (255, 160, 90))
    sun_r = int(min(w, h) * 0.16)
    glow = pygame.Surface((sun_r * 4, sun_r * 4), pygame.SRCALPHA)
    for k in range(6):
      pygame.draw.circle(glow, (255, 210, 120, 25), (sun_r * 2, sun_r * 2), int(sun_r * (2 - k * 0.15)))
    s.blit(glow, (w * 0.7 - sun_r * 2, h * 0.80 - sun_r * 2))
    pygame.draw.circle(s, (255, 214, 110), (int(w * 0.7), int(h * 0.80)), sun_r)
    _hills(s, (110, 50, 70), h * 0.84, h * 0.045, 0.006, 0.7, w, h)
    _hills(s, (70, 30, 54), h * 0.92, h * 0.03, 0.010, 2.4, w, h)
  return s


def _stars(size, n):
  rnd = random.Random(3)
  w, h = size
  return [(rnd.uniform(0, w), rnd.uniform(0, h * 0.75), rnd.uniform(0, 6.28), rnd.choice((1, 1, 2)))
          for _ in range(n)]


def draw(screen, rect, scene, now):
  """Paint the scene into rect on screen (the play area)."""
  rect = pygame.Rect(rect)
  w, h = rect.size
  if w <= 0 or h <= 0:
    return
  key = (scene, w, h)
  base = _cache.get(key)
  if base is None:
    if len(_cache) > 8:
      _cache.clear()
    base = _cache[key] = _static(scene, (w, h))
  screen.blit(base, rect.topleft)
  x0, y0 = rect.topleft
  if scene == "day":
    sun = (x0 + w - 70, y0 + 66)
    for k in range(12):                                   # slowly turning sun rays
      a = now * 0.25 + k * math.pi / 6
      pygame.draw.line(screen, (255, 226, 110), (sun[0] + 46 * math.cos(a), sun[1] + 46 * math.sin(a)),
                       (sun[0] + 62 * math.cos(a), sun[1] + 62 * math.sin(a)), 5)
    pygame.draw.circle(screen, (255, 214, 80), sun, 38)
    pygame.draw.circle(screen, (255, 236, 140), sun, 30)
    pygame.draw.circle(screen, (90, 60, 30), (sun[0] - 11, sun[1] - 6), 4)   # a smiling face
    pygame.draw.circle(screen, (90, 60, 30), (sun[0] + 11, sun[1] - 6), 4)
    pygame.draw.arc(screen, (90, 60, 30), (sun[0] - 14, sun[1] - 6, 28, 22), math.pi * 1.1, math.pi * 1.9, 3)
    clouds = _cache.get("clouds")
    if clouds is None:
      clouds = _cache["clouds"] = [_cloud(150), _cloud(110), _cloud(190), _cloud(90)]
    for k, c in enumerate(clouds):
      speed = 8 + k * 3
      x = (now * speed + k * w / 3.3) % (w + c.get_width()) - c.get_width()
      screen.blit(c, (x0 + x, y0 + 20 + k * 47 % (h * 0.35)))
  elif scene == "night":
    for x, y, ph, r in _stars((w, h), int(w * h / 4500)):
      tw = 0.5 + 0.5 * math.sin(now * 2.2 + ph)
      c = int(150 + 105 * tw)
      pygame.draw.circle(screen, (c, c, min(255, c + 20)), (x0 + int(x), y0 + int(y)), r)
    moon = (x0 + w - 80, y0 + 74)
    pygame.draw.circle(screen, (250, 244, 210), moon, 34)
    sky = base.get_at((max(0, w - 64), min(h - 1, 66)))[:3]  # a sky-coloured bite makes the crescent
    pygame.draw.circle(screen, sky, (moon[0] + 16, moon[1] - 8), 30)
  elif scene == "sea":
    rays = pygame.Surface((w, h), pygame.SRCALPHA)
    for k in range(5):                                    # light rays from the surface
      cx = (k + 0.5) * w / 5 + 30 * math.sin(now * 0.4 + k)
      pygame.draw.polygon(rays, (255, 255, 255, 18),
                          [(cx - 20, 0), (cx + 20, 0), (cx + 90, h * 0.9), (cx - 10, h * 0.9)])
    screen.blit(rays, rect.topleft)
    for k in range(int(w / 28)):                          # swaying seaweed
      bx = x0 + (k * 97) % w
      by = y0 + h - 6
      tall = 40 + (k * 37) % 70
      pts = [(bx + 8 * math.sin(now * 1.5 + k + j * 0.6) * j / 6, by - tall * j / 6) for j in range(7)]
      pygame.draw.lines(screen, (40, 150, 90) if k % 2 else (60, 170, 110), False, pts, 5)
    for k in range(14):                                   # bubbles
      bx = x0 + (k * 131 + 20 * math.sin(now + k)) % w
      by = y0 + h - ((now * (30 + k * 4) + k * 97) % h)
      pygame.draw.circle(screen, (220, 245, 255), (int(bx), int(by)), 3 + k % 4, 1)
  elif scene == "forest":
    for k in range(18):                                   # fireflies
      fx = x0 + (k * 151 + 40 * math.sin(now * 0.6 + k * 1.7)) % w
      fy = y0 + h * 0.35 + (k * 73) % (h * 0.5) + 20 * math.sin(now * 0.9 + k)
      glow = 0.5 + 0.5 * math.sin(now * 3 + k * 2.1)
      if glow > 0.3:
        pygame.draw.circle(screen, (180, 255, 120), (int(fx), int(fy)), 2 + int(glow * 2))
  elif scene == "candy":
    for k in range(7):                                    # balloons drifting up
      bx = x0 + (k * 167 + 25 * math.sin(now * 0.7 + k)) % w
      by = y0 + h + 60 - ((now * (14 + k * 2) + k * 140) % (h + 120))
      col = ((255, 90, 120), (255, 200, 60), (90, 200, 255), (160, 120, 255), (120, 220, 140))[k % 5]
      pygame.draw.line(screen, (255, 255, 255), (bx, by + 22), (bx + 4 * math.sin(now + k), by + 60), 1)
      pygame.draw.ellipse(screen, col, (bx - 16, by - 20, 32, 42))
      pygame.draw.ellipse(screen, (255, 255, 255), (bx - 9, by - 13, 7, 11))
    for k in range(16):
      tw = math.sin(now * 3 + k * 1.3)
      if tw > 0.4:
        sx, sy = x0 + (k * 113) % w, y0 + (k * 59) % int(h * 0.6)
        pygame.draw.line(screen, (255, 255, 255), (sx - 4, sy), (sx + 4, sy), 2)
        pygame.draw.line(screen, (255, 255, 255), (sx, sy - 4), (sx, sy + 4), 2)
  else:                                                   # sunset: birds flying home
    for k in range(5):
      bx = x0 + (now * (22 + k * 4) + k * 160) % (w + 60) - 30
      by = y0 + 60 + k * 26 + 6 * math.sin(now * 2 + k)
      flap = 5 * math.sin(now * 8 + k)
      pygame.draw.lines(screen, (60, 30, 50), False, [(bx - 9, by - flap), (bx, by), (bx + 9, by - flap)], 2)


def is_light(scene):
  """Bright scenes need darker guide lines and dot rims."""
  return scene in ("day", "candy")
