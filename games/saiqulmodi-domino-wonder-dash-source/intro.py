"""The opening show: one domino chain that fills the whole screen.

The dominoes stand on a spiral from the screen's edge to its middle: the first one is
the biggest, every next one is a little smaller, and the last ones are as small as a
dot. A push starts the chain, the fall runs all the way round to the middle, the last
dot flashes and the game begins. A tap skips it.

Seen from above, a standing domino is a thin bar across the path; as it falls it grows
along the path until its coloured face with two pips lies flat. Pure pygame drawing
(polygons), so hundreds of dominoes stay smooth in the browser and on phones too.
"""

import math

import pygame

MARGIN = 0.06            # share of the screen kept free at the edges
BIG = 0.17               # the first domino's length, as a share of the shorter side
SMALLEST = 3.0           # px: the last dominoes are dots
GAP = 1.05               # space between rounds of the spiral, in domino lengths
STEP = 0.78              # space between dominoes, in domino lengths
FALL = 0.24              # s: the first (biggest) domino's fall; small ones fall faster
PUSH_AT = 0.22           # the next domino starts when this one is this far down
START_DELAY = 0.6        # s before the first push
END_HOLD = 1.3           # s for the flash and the title after the last domino
BG_TOP, BG_LOW = (40, 70, 150), (16, 26, 64)


class Domino:
  __slots__ = ("x", "y", "ang", "size", "col", "start", "dur")

  def __init__(self, x, y, ang, size, col):
    self.x, self.y, self.ang, self.size, self.col = x, y, ang, size, col
    self.start = None
    self.dur = FALL


class Intro:
  def __init__(self, sfx=None, font=None):
    self.sfx = sfx
    self.font = font
    self.size = None
    self.t0 = None
    self.done = False
    self.skipped = False
    self.dominoes = []
    self.end_at = 0.0
    self.next_sound = 0.0
    self.bg = None

  # ------------------------------------------------------------------ layout
  def layout(self, w, h):
    """Spiral from the edge inwards; each domino a little smaller than the last."""
    self.size = (w, h)
    cx, cy = w / 2, h / 2
    ax, ay = w / 2 * (1 - 2 * MARGIN), h / 2 * (1 - 2 * MARGIN)
    big = BIG * min(w, h)
    short = min(ax, ay)
    # The spiral's scale s shrinks by the same share each round, so the gap
    # between rounds always fits the (also shrinking) dominoes: s = exp(-k * theta).
    k = GAP * big / (short * 2 * math.pi)
    out = []
    s, theta = 1.0, -math.pi / 2           # start at the top, run clockwise
    while big * s >= SMALLEST:
      length = big * s

      def at(sc, th):
        return cx + ax * sc * math.cos(th), cy + ay * sc * math.sin(th)

      x, y = at(s, theta)
      d = 0.01                              # direction of travel, measured numerically
      nx, ny = at(s * math.exp(-k * d), theta + d)
      ang = math.atan2(ny - y, nx - x)
      col = pygame.Color(0)
      col.hsva = ((len(out) * 7) % 360, 78, 98, 100)
      out.append(Domino(x, y, ang, length, (col.r, col.g, col.b)))
      speed = math.hypot(nx - x, ny - y) / d            # px per radian here
      dtheta = STEP * length / max(1.0, speed)
      theta += dtheta
      s *= math.exp(-k * dtheta)
    # schedule the chain: smaller dominoes fall faster (time ~ square root of size)
    t = START_DELAY
    for dm in out:
      dm.start = t
      dm.dur = FALL * math.sqrt(dm.size / big)
      t += dm.dur * PUSH_AT
    self.dominoes = out
    self.end_at = t + (out[-1].dur if out else 0) + 0.1
    self.bg = pygame.Surface((w, h))
    for y in range(h):
      k = y / max(1, h - 1)
      self.bg.fill(tuple(int(a + (b - a) * k) for a, b in zip(BG_TOP, BG_LOW)), (0, y, w, 1))

  # ------------------------------------------------------------------ running
  def skip(self):
    self.skipped = True
    self.done = True

  def update(self, now, size):
    if self.done:
      return
    if self.size != size:
      self.layout(*size)
    if self.t0 is None:
      self.t0 = now
    t = now - self.t0
    if self.sfx and t >= self.next_sound and t < self.end_at:
      # clacks follow the chain (at most ~25 a second), pitch climbing as it shrinks
      falling = [i for i, dm in enumerate(self.dominoes) if dm.start <= t < dm.start + dm.dur]
      if falling:
        k = falling[-1] / max(1, len(self.dominoes) - 1)
        self.sfx.play("clack", int(k * 7))
        self.next_sound = t + 0.04
    if t >= self.end_at and not getattr(self, "_chimed", False):
      self._chimed = True
      if self.sfx:
        self.sfx.play("chime")
    if t >= self.end_at + END_HOLD:
      self.done = True

  # ------------------------------------------------------------------ drawing
  def draw(self, screen, now):
    w, h = screen.get_size()
    if self.size != (w, h):
      self.layout(w, h)
    t = 0.0 if self.t0 is None else now - self.t0
    screen.blit(self.bg, (0, 0))
    for dm in self.dominoes:
      fall = 0.0 if t < dm.start else min(1.0, (t - dm.start) / dm.dur)
      self.draw_domino(screen, dm, fall)
    if self.dominoes and t < START_DELAY + 0.4:          # the push: a ring on the first one
      first = self.dominoes[0]
      r = int(first.size * (0.45 + 0.15 * math.sin(t * 12)))
      pygame.draw.circle(screen, (255, 230, 90), (int(first.x), int(first.y)), r, 4)
    if t >= self.end_at:                                 # the last dot flashes, the title appears
      k = min(1.0, (t - self.end_at) / 0.5)
      c = (w // 2, h // 2)
      pygame.draw.circle(screen, (255, 240, 150), c, int(6 + 90 * k), max(1, int(8 * (1 - k)) + 1))
      if self.font:
        title = self.fit(self.font.render("Domino Game", True, (255, 255, 255)), w - 32)
        title.set_alpha(int(255 * k))
        shadow = self.fit(self.font.render("Domino Game", True, (20, 20, 50)), w - 32)
        shadow.set_alpha(int(200 * k))
        screen.blit(shadow, shadow.get_rect(center=(c[0] + 3, c[1] + 3)))
        screen.blit(title, title.get_rect(center=c))
    elif self.font and t > 1.5:
      tip = self.font.render("Tap to start", True, (230, 235, 255))
      tip.set_alpha(int(120 + 100 * math.sin(t * 3)))
      screen.blit(tip, tip.get_rect(midbottom=(w // 2, h - 12)))

  @staticmethod
  def fit(surf, max_w):
    if surf.get_width() <= max_w:
      return surf
    return pygame.transform.smoothscale(surf, (max_w, max(1, int(surf.get_height() * max_w / surf.get_width()))))

  @staticmethod
  def draw_domino(screen, dm, fall):
    """Top view: a thin bar across the path that, as it falls, grows forward
    along the path into the full coloured face."""
    L = dm.size
    width = L * 0.5
    thick = max(1.5, L * 0.18)
    along = thick + (L - thick) * math.sin(fall * math.pi / 2)
    ca, sa = math.cos(dm.ang), math.sin(dm.ang)
    px, py = -sa, ca                                    # across the path
    # the domino's back edge stays put; it falls forward
    bx, by = dm.x - ca * thick / 2, dm.y - sa * thick / 2
    fx, fy = bx + ca * along, by + sa * along
    hw = width / 2
    pts = [(bx + px * hw, by + py * hw), (fx + px * hw, fy + py * hw),
           (fx - px * hw, fy - py * hw), (bx - px * hw, by - py * hw)]
    if L < 5:                                           # a dot
      pygame.draw.circle(screen, dm.col if fall > 0 else (235, 235, 245), (int(dm.x), int(dm.y)),
                         max(1, int(L / 2)))
      return
    face = dm.col if fall > 0.5 else (245, 245, 250)
    pygame.draw.polygon(screen, face, pts)
    pygame.draw.polygon(screen, (25, 30, 60), pts, 1 if L < 16 else 2)
    if fall > 0.85 and L >= 14:                         # lying flat: the line and two pips
      mx, my = (bx + fx) / 2, (by + fy) / 2
      pygame.draw.line(screen, (255, 255, 255), (mx + px * hw * 0.8, my + py * hw * 0.8),
                       (mx - px * hw * 0.8, my - py * hw * 0.8), max(1, int(L / 22)))
      for k in (-0.25, 0.25):
        pygame.draw.circle(screen, (255, 255, 255), (int(mx + ca * along * k), int(my + sa * along * k)),
                           max(1, int(L / 14)))
