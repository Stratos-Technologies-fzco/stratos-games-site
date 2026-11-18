"""Paints the app icons and the start-up splash into icons/.

The icon is the opening show's domino spiral: biggest dominoes at the edge, dots in
the middle, one arm running in and one running back out.

Used by the phone app (buildozer.spec), the installable web app
(manifest.json) and the browser tab. Run:  python tools/make_icons.py
"""

import math
import os

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
import pygame

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons")
FONT = os.path.join(ROOT, "fonts", "Sniglet-ExtraBold.ttf")
SKY_TOP, SKY_LOW = (120, 205, 255), (60, 140, 235)


def spiral_dominoes(cx, cy, outer, turn):
  """One arm of the icon's spiral: dominoes from the outer edge (biggest) to the
  middle (a dot), each lying along the path, like the opening show. turn rotates
  the arm, so a second arm can sit in the gaps of the first."""
  k = 0.12                                  # how fast the spiral closes in
  c = 0.38                                  # a domino's length, as a share of its radius
  out, theta = [], 0.0
  while True:
    r = outer * math.exp(-k * theta)
    length = c * r
    if length < 1.2:
      break
    a = theta + turn
    x, y = cx + r * math.cos(a), cy + r * math.sin(a)
    # direction of travel (inwards along the spiral)
    tx, ty = -math.sin(a) - k * math.cos(a), math.cos(a) - k * math.sin(a)
    out.append((x, y, math.atan2(ty, tx), length))
    theta += 0.85 * c / math.sqrt(1 + k * k)
  return out


def flat_domino(s, x, y, ang, length, colour):
  """A domino lying along the path, seen from above: coloured face, dark rim,
  a middle line and two pips."""
  w = length * 0.5
  ca, sa = math.cos(ang), math.sin(ang)
  px, py = -sa, ca
  hl, hw = length / 2 * 0.92, w / 2

  def at(u, v):
    return (x + ca * u + px * v, y + sa * u + py * v)

  pts = [at(-hl, -hw), at(hl, -hw), at(hl, hw), at(-hl, hw)]
  dark = tuple(int(v * 0.45) for v in colour)
  pygame.draw.polygon(s, colour, pts)
  pygame.draw.polygon(s, dark, pts, max(1, int(length / 14)))
  if length >= 10:
    pygame.draw.line(s, (255, 255, 255), at(0, -hw * 0.7), at(0, hw * 0.7), max(1, int(length / 18)))
    for u in (-hl / 2, hl / 2):
      q = at(u, 0)
      pygame.draw.circle(s, (255, 255, 255), (int(q[0]), int(q[1])), max(1, int(length / 11)))


def icon(size, safe=1.0):
  """Square icon: the opening show's domino spiral. One rainbow arm runs from the
  biggest domino at the edge into the middle, a second arm runs from the middle
  back out to the biggest domino on the other side. safe < 1 keeps it inside
  Android's round mask. Drawn 4x bigger and scaled down for smooth edges."""
  big = size * 4
  s = pygame.Surface((big, big))
  top, low = (40, 70, 150), (16, 26, 64)          # the opening show's night blue
  for y in range(big):
    k = y / big
    pygame.draw.line(s, tuple(int(a + (b - a) * k) for a, b in zip(top, low)), (0, y), (big, y))
  c = big / 2
  outer = big * safe * 0.38
  glow = pygame.Surface((big, big), pygame.SRCALPHA)  # the middle, where the chain ends
  for i in range(12, 0, -1):
    pygame.draw.circle(glow, (255, 230, 120, 14), (int(c), int(c)), int(outer * 0.05 * i))
  s.blit(glow, (0, 0))
  arms = [(spiral_dominoes(c, c, outer, -math.pi / 2), 0),
          (spiral_dominoes(c, c, outer, math.pi / 2), 180)]
  for arm, hue0 in arms:
    n = len(arm)
    for i, (x, y, ang, length) in enumerate(arm):
      col = pygame.Color(0)
      col.hsva = ((hue0 + 330 * i / max(1, n - 1)) % 360, 82, 100, 100)
      flat_domino(s, x, y, ang, length, (col.r, col.g, col.b))
  pygame.draw.circle(s, (255, 245, 190), (int(c), int(c)), max(2, int(outer * 0.035)))
  return pygame.transform.smoothscale(s, (size, size))


def splash(w, h):
  s = pygame.Surface((w, h))
  for y in range(h):
    k = y / h
    pygame.draw.line(s, tuple(int(a + (b - a) * k) for a, b in zip(SKY_TOP, SKY_LOW)),
                     (0, y), (w, y))
  n = int(w * 0.6)
  card = pygame.Surface((n, n), pygame.SRCALPHA)        # icon with round corners
  pygame.draw.rect(card, (255, 255, 255), (0, 0, n, n), border_radius=n // 6)
  card.blit(icon(n), (0, 0), special_flags=pygame.BLEND_RGBA_MIN)
  rect = card.get_rect(center=(w // 2, int(h * 0.4)))
  pygame.draw.rect(s, (255, 255, 255), rect.inflate(12, 12), border_radius=n // 6 + 6)
  s.blit(card, rect)
  f = pygame.font.Font(FONT, int(w * 0.09))
  for n, line in enumerate(("Domino", "Game")):
    t = f.render(line, True, (255, 255, 255))
    s.blit(t, t.get_rect(center=(w // 2, int(h * 0.68) + n * int(w * 0.11))))
  f2 = pygame.font.Font(FONT, int(w * 0.05))
  t = f2.render("Learn while you play", True, (255, 240, 160))
  s.blit(t, t.get_rect(center=(w // 2, int(h * 0.86))))
  return s


def main():
  pygame.init()
  os.makedirs(OUT, exist_ok=True)
  for n in (48, 180, 192, 512):
    pygame.image.save(icon(n), os.path.join(OUT, f"icon-{n}.png"))
  pygame.image.save(icon(512, safe=0.72), os.path.join(OUT, "icon-maskable-512.png"))
  pygame.image.save(splash(720, 1280), os.path.join(OUT, "presplash.png"))
  print("icons written to", OUT)


if __name__ == "__main__":
  main()
