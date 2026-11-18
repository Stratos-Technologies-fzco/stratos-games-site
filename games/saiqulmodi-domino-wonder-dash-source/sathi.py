"""Sathi: the game's little companion, a golden glowing domino with a smiling face.

Sathi hops along the Domino Highway just ahead of the hero (world.py), points at the
Magic Box's class crystals, and cheers next to a picture the child has just brought to
life (ui_draw.py). Drawing only: draw(screen, x, y, size, t, mood), where (x, y) is the
middle of Sathi's feet and mood is "hop", "point" or "cheer".
"""

import math

import pygame

GOLD = (255, 200, 40)
GOLD_DARK = (190, 120, 20)
GLOW = (255, 230, 120)


def draw(screen, x, y, size, t, mood="hop"):
  """Sathi standing on (x, y), about size pixels tall."""
  if size < 6:
    return
  h = size
  w = h * 0.5
  hop = abs(math.sin(t * (7.0 if mood == "hop" else 5.0)))
  lift = h * (0.22 if mood == "hop" else 0.12 if mood == "cheer" else 0.04) * hop
  squash = 1.0 + 0.08 * (1 - hop) if mood != "point" else 1.0
  bw, bh = w * squash, h / squash
  body = pygame.Rect(0, 0, int(bw), int(bh))
  body.midbottom = (int(x), int(y - lift))
  # glow
  g = pygame.Surface((int(bw * 2.4), int(bh * 1.7)), pygame.SRCALPHA)
  pygame.draw.ellipse(g, (*GLOW, 70), g.get_rect())
  screen.blit(g, g.get_rect(center=body.center))
  # shadow on the ground
  sh = pygame.Surface((int(bw * 1.1) + 1, max(2, int(h * 0.12))), pygame.SRCALPHA)
  pygame.draw.ellipse(sh, (0, 0, 0, 70), sh.get_rect())
  screen.blit(sh, sh.get_rect(center=(int(x), int(y))))
  # the domino: gold, a dividing line, one pip below (the face is on the top half)
  r = max(2, int(bw * 0.22))
  pygame.draw.rect(screen, GOLD, body, border_radius=r)
  pygame.draw.rect(screen, GOLD_DARK, body, max(1, int(h / 30)), border_radius=r)
  mid = body.y + body.h * 0.55
  pygame.draw.line(screen, GOLD_DARK, (body.x + bw * 0.15, mid), (body.right - bw * 0.15, mid),
                   max(1, int(h / 36)))
  pygame.draw.circle(screen, (255, 255, 255), (body.centerx, int(body.y + body.h * 0.78)),
                     max(2, int(h * 0.07)))
  # face: eyes that blink, a smile (wide open when cheering)
  ey = body.y + body.h * 0.26
  blink = (t % 3.2) < 0.12
  for side in (-1, 1):
    ex = body.centerx + side * bw * 0.2
    if blink:
      pygame.draw.line(screen, (60, 40, 20), (ex - h * 0.04, ey), (ex + h * 0.04, ey), max(1, int(h / 40)))
    else:
      pygame.draw.circle(screen, (255, 255, 255), (int(ex), int(ey)), max(2, int(h * 0.065)))
      pygame.draw.circle(screen, (40, 30, 30), (int(ex + side * h * 0.01), int(ey)), max(1, int(h * 0.035)))
  smile = pygame.Rect(0, 0, int(bw * 0.5), int(h * (0.16 if mood == "cheer" else 0.1)))
  smile.midtop = (body.centerx, int(ey + h * 0.06))
  if mood == "cheer":
    pygame.draw.ellipse(screen, (170, 50, 40), smile)
  else:
    pygame.draw.arc(screen, (120, 60, 30), smile, math.pi * 1.05, math.pi * 1.95, max(1, int(h / 30)))
  # arms: up and waving to cheer, one arm pointing, swinging while it hops
  lw = max(2, int(h / 16))
  sy = body.y + body.h * 0.5
  for side in (-1, 1):
    sx = body.centerx + side * bw * 0.5
    if mood == "cheer":
      a = -math.pi / 2 + side * (0.5 + 0.3 * math.sin(t * 9 + side))
    elif mood == "point" and side == 1:
      a = -0.35 + 0.1 * math.sin(t * 4)
    else:
      a = math.pi / 2 - side * (0.6 + 0.4 * math.sin(t * 7 + side))
    ex, ey2 = sx + side * math.cos(a) * h * 0.32, sy + math.sin(a) * h * 0.32
    pygame.draw.line(screen, GOLD_DARK, (sx, sy), (ex, ey2), lw)
    pygame.draw.circle(screen, GOLD, (int(ex), int(ey2)), lw)
  # little legs
  for side in (-1, 1):
    fx = body.centerx + side * bw * 0.22
    pygame.draw.line(screen, GOLD_DARK, (fx, body.bottom), (fx, body.bottom + lift * 0.4 + 1), lw)
