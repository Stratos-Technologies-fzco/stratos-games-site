"""Flights across Wonder Town: tap a house and the hero flies there - never the same way twice.

Every flight is made of
  - a cruise in the style of something that travels through the air: a thrown stone's
    arc, a penguin's hops, a butterfly's flutter, an eagle circling up a warm wind and
    gliding down, a swallow's dives, a hummingbird's darts and hovers, a paper plane's
    loop, a bee's figure-eights, a dragonfly's zigzags, a kite's lazy swings, a maple
    seed's corkscrew or an owl's low glide and swoop (12 styles, all used before any
    one comes again, and never the previous one);
  - one round around the house, however near it is;
  - a helicopter landing: hover above the door, rotor spinning, and down gently.
Colourful dominoes stand along the whole path where the hero passed; only when the hero
has landed does the whole run topple, from the start to the house (cascade_secs), and
then the house opens. Every flight has its own colours and its own music (instrument,
scale, melody), never the same as the flight before. A tap skips to the landing.

The Domino Highway (Highway) is the Magic Box's ride to a Class Pavilion: down the main
street at 10x walking speed, easing in and out, in a child's playful way that changes
every ride (zig-zags, wiggles, hops, skips, bounces, swerves, kangaroo leaps, rabbit hops, crab
shuffles, corkscrew loops, dolphin jumps, pogo bounces: 12 ways, all used before any one
comes again). The dominoes stand where
the hero passed and topple, start to end, once the hero has arrived; a tune climbs with
speed - every ride its own instrument, scale, tune shape and pace.
"""

import bisect
import math
import random

import pygame

import magic

SPACING = 3.0            # m between dominoes along the path
DOM_H, DOM_W = 4.0, 1.0  # a domino's height and width (half a real domino's width, user 27-Oct)
MAX_DOMINOES = 600       # the 10x Palm has kilometre-long flights
MAX_POINTS = 1500        # path points of a flight's cruise
FALL_SECS = 0.38         # one domino's fall
FALL_ANGLE = 1.2         # rad: how far it leans onto the next one
NOTES_PER_SECOND = 7
FADE_SECS = 1.4          # after the house opens, the trail shrinks away
CASCADE_PAUSE = 1.5      # s after landing before the first domino falls: the arrival is seen first
WAVE_RATE = 12.0         # dominoes toppling per second: a calm wave, never a hurry


def cascade_secs(n):
  """How long the whole run takes to topple, start to end: a calm wave of WAVE_RATE
  dominoes a second, 6-25 s (only the longest paths run a little faster)."""
  return max(6.0, min(25.0, n / WAVE_RATE))
LIGHT = (0.45, 0.80, -0.40)

STYLES = {               # name -> (toast text, wing flaps per second)
    "stone": ("like a thrown stone", 0.0),
    "penguin": ("hopping like a penguin", 3.0),
    "butterfly": ("like a butterfly", 5.0),
    "eagle": ("like an eagle", 1.2),
    "swallow": ("like a swallow", 3.5),
    "hummingbird": ("like a hummingbird", 14.0),
    "paper plane": ("like a paper plane", 0.0),
    "bee": ("like a bee", 12.0),
    "dragonfly": ("like a dragonfly", 9.0),
    "kite": ("swinging like a kite", 0.0),
    "maple seed": ("spinning like a maple seed", 0.0),
    "owl": ("gliding like an owl", 1.0),
}


def _hsv(h, s=85, v=100):
  c = pygame.Color(0)
  c.hsva = (int(h) % 360, s, v, 100)
  return (c.r, c.g, c.b)


PALETTES = {             # name -> colour of the domino at share f of the path
    "rainbow": lambda f, i: _hsv(360 * f),
    "sunset": lambda f, i: _hsv(330 + 80 * f, 80 + 15 * (i % 2)),
    "ocean": lambda f, i: _hsv(165 + 75 * f + 15 * (i % 2), 75),
    "peacock": lambda f, i: [(0, 150, 160), (40, 90, 200), (120, 200, 60), (90, 50, 160)][i % 4],
    "tricolour": lambda f, i: [(255, 153, 51), (250, 250, 250), (19, 136, 8), (0, 0, 128)][i % 4],
    "candy": lambda f, i: [(255, 120, 180), (120, 230, 190), (255, 230, 90), (190, 150, 255)][i % 4],
    "fire": lambda f, i: _hsv(50 * f + 10 * (i % 3), 90),
    "forest": lambda f, i: _hsv(70 + 70 * f + 20 * (i % 2), 75, 85 + 15 * (i % 2)),
    "galaxy": lambda f, i: _hsv(220 + 110 * f, 70 + 25 * (i % 2)),
}
_LAST = {}


def _pick(rng, key, options):
  """A random choice that is never the previous flight's choice."""
  fresh = [o for o in options if o != _LAST.get(key)] or list(options)
  _LAST[key] = choice = rng.choice(fresh)
  return choice


_BAGS = {}


def _pick_bag(rng, key, options):
  """Every option once, in a random order, before any one comes again (a shuffled bag),
  and never the same as the previous journey's - so journeys differ every time."""
  bag = [o for o in _BAGS.get(key, []) if o in options]
  if not bag:
    bag = list(options)
    rng.shuffle(bag)
    if len(bag) > 1 and bag[-1] == _LAST.get(key):   # the bag is used from the end
      bag[0], bag[-1] = bag[-1], bag[0]
  _LAST[key] = choice = bag.pop()
  _BAGS[key] = bag
  return choice


def _ease(k):
  k = max(0.0, min(1.0, k))
  return k * k * (3 - 2 * k)


def _tri(x):
  """A zigzag wave between -1 and 1."""
  x = x % 1.0
  return 4 * x - 1 if x < 0.5 else 3 - 4 * x


def _norm(v):
  n = math.sqrt(sum(c * c for c in v)) or 1.0
  return tuple(c / n for c in v)


def _cross(a, b):
  return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


class Domino:
  __slots__ = ("pos", "tan", "up", "side", "col", "laid", "fall", "rang")

  def __init__(self, pos, tan, col):
    self.pos, self.col = pos, col
    self.tan = tan
    up = (0.0, 1.0, 0.0)
    d = sum(a * b for a, b in zip(up, tan))          # the part of "up" across the path
    up = tuple(u - d * t for u, t in zip(up, tan))
    if math.sqrt(sum(c * c for c in up)) < 0.2:      # the path goes straight up or down
      up = (math.sin(0.3), 0.0, math.cos(0.3))
    self.up = _norm(up)
    self.side = _norm(_cross(self.up, tan))
    self.laid = self.fall = 0.0
    self.rang = False


class Flight:

  def __init__(self, start, box, boxes, yaw=0.0, seed=None, instruments=()):
    rng = random.Random(seed)
    self.rng = rng
    self.box = box
    self.style = _pick_bag(rng, "style", list(STYLES))
    self.label, self.flap_rate = STYLES[self.style]
    self.palette = _pick(rng, "palette", list(PALETTES))
    ready = [i for i in instruments if i != _LAST.get("inst")]
    self.inst = rng.choice(ready) if ready else (rng.choice(list(instruments)) if instruments else None)
    _LAST["inst"] = self.inst
    self.scale = dict(magic.SCALES)[_pick(rng, "scale", [s[0] for s in magic.SCALES])]
    self.contour = _pick(rng, "contour", magic.CONTOURS)
    self.root = rng.choice([60, 62, 63, 65, 67])
    self.ph = rng.uniform(0, math.tau)
    self.t = 0.0
    self.flap = 0.0
    self.finished = False          # the last domino has fallen
    self.fade = 0.0
    self.next_note = 0.0
    self.pts, self.ts = [], []
    self._build(start, box, boxes, yaw)
    self._lay_dominoes()
    self.pos = self.pts[0]
    self.yaw = yaw

  # ------------------------------------------------------------------ the path
  def _offsets(self, u, d, q):
    """(forward, side, up) metres away from the straight line at share u of the cruise,
    and the speed there (1 = the flight's usual speed)."""
    s = self.style
    tau = math.tau
    if s == "stone":                       # one high arc, even speed across the ground
      return 0.0, 0.0, 4 * q["h"] * u * (1 - u), 1.0
    if s == "penguin":                     # hop, hop, hop
      hop = abs(math.sin(math.pi * q["n"] * u))
      return 0.0, 0.8 * math.sin(tau * q["n"] * u), q["hh"] * hop, 0.65 + 0.6 * hop
    if s == "butterfly":                   # flutter up and down, drift side to side
      up = 3.0 * math.sin(tau * q["n"] * u + q["p"]) + 1.4 * math.sin(tau * 2.7 * q["n"] * u)
      side = q["a"] * math.sin(tau * q["m"] * u + q["p2"]) + 1.3 * math.sin(tau * 6.3 * u)
      return 0.0, side, 3.0 + up, 0.6 + 0.5 * math.sin(tau * 3.0 * u + q["p"]) ** 2
    if s == "eagle":                       # circle up a warm wind, then one long glide
      c = 0.4
      if u < c:
        a = tau * q["turns"] * u / c
        fwd = d * (0.06 * u / c - u) + q["r"] * math.sin(a)
        return fwd, q["dir"] * q["r"] * (1 - math.cos(a)), q["h"] * u / c, 0.7
      g = (u - c) / (1 - c)
      return d * (0.06 + 0.94 * g - u), 0.0, q["h"] * (1 - _ease(g)), 1.35
    if s == "swallow":                     # deep dives and climbs
      wave = 0.5 + 0.5 * math.cos(tau * q["n"] * u)
      return 0.0, q["a"] * math.sin(tau * 1.2 * u), q["h"] * wave, 0.75 + 0.6 * (1 - wave)
    if s == "hummingbird":                 # dart ... stop and hover ... dart
      dart = abs(math.sin(math.pi * q["n"] * u))
      return 0.0, 2.5 * math.sin(math.pi * q["n"] * u * 0.5), 3.0 + 1.5 * math.sin(tau * 2 * q["n"] * u), \
          0.12 + 0.9 * dart ** 0.7
    if s == "paper plane":                 # a straight glide with a loop-the-loop
      lo, hi = q["c"] - 0.12, q["c"] + 0.12
      if lo <= u <= hi:
        a = tau * (u - lo) / (hi - lo)
        fwd = d * 0.24 * (a / tau) - d * (u - lo) + q["r"] * math.sin(a)
        return fwd, 0.0, 4.0 + q["r"] * (1 - math.cos(a)), 0.8
      return 0.0, 0.0, 4.0, 1.1
    if s == "kite":                        # big lazy swings side to side, rising and sinking on the wind
      return (0.0, 1.6 * q["a"] * math.sin(tau * 1.5 * u + q["p"]),
              3.2 * q["h"] * u * (1 - u) + 1.5 * math.sin(tau * 3.0 * u + q["p2"]),
              0.6 + 0.25 * math.sin(tau * 1.5 * u + q["p"]) ** 2)
    if s == "maple seed":                  # a spinning corkscrew all the way
      a = tau * q["n"] * u + q["p"]
      return 0.0, 4.5 * math.sin(a), 4.5 + 4.5 * math.cos(a), 0.8
    if s == "owl":                         # low, silent glide ... one big swoop up ... and down
      swoop = math.exp(-((u - q["c"]) / 0.1) ** 2)
      return 0.0, q["dir"] * 2.5 * math.sin(math.pi * u), 1.5 + 11.0 * swoop, 0.85 + 0.45 * swoop
    if s == "bee":                         # little figure-eights
      return 0.0, 3.2 * math.sin(tau * q["n"] * u), 4.0 + 1.8 * math.sin(2 * tau * q["n"] * u), 1.0
    # dragonfly: sharp zigzags with a tiny stop at every corner
    z = _tri(q["n"] * u)
    return 0.0, 6.0 * z, 4.0 + 2.5 * _tri(q["n"] * u * 0.5 + 0.25), 0.25 + 0.95 * (1 - abs(z)) ** 0.5

  def _params(self, d):
    r = self.rng
    return {
        "h": min(38.0, max(14.0, 0.3 * d)) * r.uniform(0.85, 1.15) if self.style == "stone" else
        (r.uniform(16, 24) if self.style == "eagle" else r.uniform(6, 10)),
        "n": max(2, min(9, int(d / r.uniform(16, 24)) + 1)) if self.style in ("penguin", "hummingbird")
        else r.choice([2, 3, 4]) if self.style in ("swallow", "dragonfly") else r.choice([4, 5, 6, 7]),
        "hh": r.uniform(3.5, 5.5), "a": r.uniform(3.5, 6.0), "m": r.choice([1.5, 2.0, 2.5]),
        "p": r.uniform(0, math.tau), "p2": r.uniform(0, math.tau),
        "turns": r.choice([1.0, 1.5]), "r": r.uniform(7.0, 11.0), "dir": r.choice([-1, 1]),
        "c": r.uniform(0.4, 0.6),
    }

  def _build(self, start, box, boxes, yaw):
    ax, ay, az = start
    cx, _, cz = box.centre
    door = box.door()
    radius = max(12.0, math.hypot(box.x1 - box.x0, box.z1 - box.z0) / 2 + 7.0)
    hc = box.top + 7.0                                   # height of the round over the house
    th0 = math.atan2(az - cz, ax - cx) if math.hypot(ax - cx, az - cz) > 0.5 else -yaw
    ex, ez = cx + radius * math.cos(th0), cz + radius * math.sin(th0)
    d = math.hypot(ex - ax, ez - az)
    if d > 1.0:
      fx, fz = (ex - ax) / d, (ez - az) / d
    else:
      fx, fz = math.sin(yaw), math.cos(yaw)
    sx, sz = fz, -fx
    q = self._params(max(d, 30.0))
    pts, speeds = [], []
    n = max(160, min(MAX_POINTS, int(d * 2.5)))
    for i in range(n + 1):                               # 1. the cruise in this flight's style
      u = i / n
      fwd, side, up, sp = self._offsets(u, max(d, 30.0), q)
      env = _ease(u / 0.08) * _ease((1 - u) / 0.12)
      side *= env
      up *= _ease((1 - u) / 0.12) * (1.0 if self.style in ("stone", "penguin") else _ease(u / 0.06))
      base_y = ay + (hc - ay) * (1 - (1 - u) ** 2) + 6.0 * math.sin(math.pi * u)
      along = d * u + fwd * env
      pts.append((ax + fx * along + sx * side, base_y + up, az + fz * along + sz * side))
      speeds.append(sp)
    cruise_end = len(pts)
    turn = self.rng.choice([-1, 1])                     # 2. one round around the house
    thd = math.atan2(door[2] - cz, door[0] - cx)
    sweep = math.tau + ((thd - th0) * turn) % math.tau
    m = 140
    for i in range(1, m + 1):
      v = i / m
      a = th0 + turn * sweep * v
      pts.append((cx + radius * math.cos(a), hc + 2.0 * math.sin(math.tau * v), cz + radius * math.sin(a)))
    circle_end = len(pts)
    last = pts[-1]                                       # 3. in over the door
    for i in range(1, 21):
      v = _ease(i / 20)
      pts.append((last[0] + (door[0] - last[0]) * v, hc, last[2] + (door[2] - last[2]) * v))
    self.hover_at = len(pts) - 1
    self._clear_roofs(pts, boxes, box, cruise_end)
    # times: the cruise by its style's speed, then the round, the glide in, hover and landing
    cruise_secs = max(3.5, min(6.0, d / 18.0))
    raw = [0.0]
    for i in range(1, cruise_end):
      raw.append(raw[-1] + math.dist(pts[i], pts[i - 1]) / max(0.05, speeds[i]))
    k = cruise_secs / max(1e-6, raw[-1])
    ts = [r * k for r in raw]
    round_secs = max(3.0, min(4.0, math.tau * radius / 16.0))
    for i in range(cruise_end, circle_end):
      ts.append(ts[-1] + round_secs / (circle_end - cruise_end))
    for i in range(circle_end, len(pts)):
      ts.append(ts[-1] + 0.9 / (len(pts) - circle_end))
    hx, hy, hz = pts[-1]
    pts.append((hx, hy, hz))                             # 4. hover ...
    ts.append(ts[-1] + 0.6)
    steps = 40                                           # 5. ... and down like a helicopter
    for i in range(1, steps + 1):
      v = i / steps
      pts.append((hx, hy * (1 - _ease(v)), hz))
      ts.append(ts[-1] + 1.8 / steps)
    self.pts, self.ts = pts, ts
    self.land_at = ts[-1]
    self.hover_t = ts[self.hover_at]

  @staticmethod
  def _clear_roofs(pts, boxes, target, cruise_end):
    """Keeps the path a few metres above every roof it crosses (smoothly)."""
    xs, zs = [p[0] for p in pts], [p[2] for p in pts]
    x0, x1, z0, z1 = min(xs) - 3, max(xs) + 3, min(zs) - 3, max(zs) + 3
    near = []                                            # only buildings the path can cross
    for b in boxes:
      if b is target or b.x1 < x0 or b.x0 > x1 or b.z1 < z0 or b.z0 > z1:
        continue
      if any(b.contains_xz(x, z, pad=14.0) for x, z in zip(xs[::8], zs[::8])):
        near.append(b)
    need = []
    for x, y, z in pts:
      roof = 0.0
      for b in near:
        if b.contains_xz(x, z, pad=2.5):
          roof = max(roof, b.top)
      need.append(roof + 3.0 if roof > 0 else -1e9)
    lift = [max(0.0, n - p[1]) for n, p in zip(need, pts)]
    for _ in range(3):                                   # spread each lift to its neighbours
      lift = [max(lift[i], 0.85 * max(lift[max(0, i - 6):i + 7])) for i in range(len(lift))]
    for i in range(len(pts)):
      x, y, z = pts[i]
      pts[i] = (x, max(y + lift[i], need[i]), z)

  def _lay_dominoes(self):
    pts, ts = self.pts[:self.hover_at + 1], self.ts
    arc = [0.0]
    for i in range(1, len(pts)):
      arc.append(arc[-1] + math.dist(pts[i], pts[i - 1]))
    total = arc[-1]
    gap = max(SPACING, total / MAX_DOMINOES)
    self.size = max(1.0, gap / SPACING)                # longer paths: bigger dominoes, further apart
    n = max(2, int(total / gap))
    out = []
    j = 0
    for k in range(n):
      s = 1.0 + k * (total - 1.0) / max(1, n - 1)
      while j < len(arc) - 2 and arc[j + 1] < s:
        j += 1
      seg = max(1e-6, arc[j + 1] - arc[j])
      f = (s - arc[j]) / seg
      a, b = pts[j], pts[j + 1]
      p = tuple(a[c] + (b[c] - a[c]) * f for c in range(3))
      dm = Domino(p, _norm(tuple(b[c] - a[c] for c in range(3))),
                  PALETTES[self.palette](k / max(1, n - 1), k))
      dm.laid = ts[j] + (ts[j + 1] - ts[j]) * f + 0.2
      out.append(dm)
    # they all stand until the hero has landed; then the whole run topples, first to last
    start, span = self.land_at + CASCADE_PAUSE, cascade_secs(n)
    for k, dm in enumerate(out):
      dm.fall = start + span * (k / (n - 1))
    self.wave_speed = total / span                     # m/s: the camera stands back to match
    self.dominoes = out
    self.done_at = out[-1].fall + FALL_SECS
    span = max(0.5, out[-1].fall - out[0].fall)
    self.step = max(1, round(n / (span * NOTES_PER_SECOND)))

  # ------------------------------------------------------------------ running
  @property
  def rotor(self):
    """0..1: how much the helicopter rotor shows (hover and landing)."""
    if self.t >= self.land_at + 0.6:
      return 0.0
    return max(0.0, min(1.0, (self.t - self.hover_t + 0.5) / 0.5))

  @property
  def landed(self):
    return self.t >= self.land_at

  def skip(self):
    """A tap: straight to the landing (the run then topples); a tap during the run ends it."""
    self.t = self.land_at if self.t < self.land_at else max(self.t, self.done_at)

  @property
  def cascading(self):
    return self.landed and not self.finished

  @property
  def toppling(self):
    """The run is falling (after the pause that shows the arrival)."""
    return self.cascading and bool(self.dominoes) and self.t >= self.dominoes[0].fall - 0.4

  def front(self):
    """(position, yaw) of the domino falling now: where the toppling wave is."""
    i = bisect.bisect_right([dm.fall for dm in self.dominoes], self.t) - 1
    dm = self.dominoes[max(0, min(len(self.dominoes) - 1, i))]
    return dm.pos, math.atan2(dm.tan[0], dm.tan[2])

  def at(self, t):
    i = bisect.bisect_right(self.ts, t) - 1
    if i < 0:
      return self.pts[0], 0
    if i >= len(self.ts) - 1:
      return self.pts[-1], len(self.pts) - 1
    k = (t - self.ts[i]) / max(1e-9, self.ts[i + 1] - self.ts[i])
    a, b = self.pts[i], self.pts[i + 1]
    return tuple(a[c] + (b[c] - a[c]) * k for c in range(3)), i

  def note(self, k):
    j, m = k // self.step, max(1, (len(self.dominoes) - 1) // self.step)
    span = len(self.scale) * 2
    f = j / m
    shape = {"up": f, "down": 1 - f, "wave": 0.5 + 0.5 * math.sin(j * 0.6),
             "zigzag": (j % 4) / 3, "mountain": 1 - abs(2 * f - 1), "valley": abs(2 * f - 1),
             "ocean": 0.5 + 0.35 * math.sin(j * 0.5 + self.ph) + 0.15 * math.sin(j * 1.7)}[self.contour]
    d = int(round(max(0.0, min(1.0, shape)) * (span - 1)))
    return self.root + self.scale[d % len(self.scale)] + 12 * (d // len(self.scale))

  def update(self, dt, sfx=None):
    """Moves the flight on; returns "landed" at touch-down and "done" once the last
    domino has fallen."""
    event = None
    if self.finished:
      self.fade += dt
      return None
    was_landed = self.landed
    self.t += dt
    self.flap += dt * self.flap_rate * math.tau
    pos, i = self.at(self.t)
    if i < self.hover_at:
      a, b = self.pts[i], self.pts[min(len(self.pts) - 1, i + 1)]
      if abs(b[0] - a[0]) + abs(b[2] - a[2]) > 1e-4:
        want = math.atan2(b[0] - a[0], b[2] - a[2])
        self.yaw += ((want - self.yaw + math.pi) % math.tau - math.pi) * min(1.0, dt * 8)
    self.pos = pos
    if self.landed and not was_landed:
      event = "landed"
      if sfx:
        sfx.play("pop", 3)
    for k, dm in enumerate(self.dominoes):
      if dm.rang or self.t < dm.fall:
        continue
      dm.rang = True
      if sfx and k % self.step == 0 and self.t - dm.fall < 0.3:
        if self.inst:
          sfx.note(self.note(k), self.inst, 1.0 if (k // self.step) % 3 == 0 else 0.7)
        else:
          sfx.play("clack", k * 8 // len(self.dominoes))
    if self.t >= self.done_at:
      self.finished = True
      event = "done"
    return event

  @property
  def gone(self):
    return self.finished and self.fade >= FADE_SECS

  # ------------------------------------------------------------------ drawing
  def visible(self, cam_pos, far=170.0):
    """(distance, domino) for the dominoes laid so far and near enough to draw."""
    out = []
    for dm in self.dominoes:
      if self.t < dm.laid:
        break
      d = math.dist(dm.pos, cam_pos)
      if d < far:
        out.append((d, dm))
    return out

  def draw_domino(self, s, cam, dm, fog=None):
    grow = min(1.0, (self.t - dm.laid) / 0.25)
    if self.finished:
      grow *= max(0.0, 1.0 - self.fade / FADE_SECS)
    if grow <= 0.02:
      return
    k = 0.0 if self.t < dm.fall else min(1.0, (self.t - dm.fall) / FALL_SECS)
    a = FALL_ANGLE * k * k
    h, w = DOM_H * self.size * grow, DOM_W * self.size * grow / 2
    up = tuple(dm.up[c] * math.cos(a) + dm.tan[c] * math.sin(a) for c in range(3))
    p, sd = dm.pos, dm.side
    base = [tuple(p[c] + sd[c] * w * m for c in range(3)) for m in (-1, 1)]
    top = [tuple(b[c] + up[c] * h for c in range(3)) for b in base]
    got = cam.project_poly([base[0], base[1], top[1], top[0]])
    if not got:
      return
    poly, _depth = got
    normal = _cross(sd, up)
    lit = 0.72 + 0.28 * abs(sum(n * l for n, l in zip(normal, LIGHT)))
    col = tuple(min(255, int(c * lit)) for c in dm.col)
    if k > 0:                                          # falling: a little brighter
      col = tuple(min(255, int(c + (255 - c) * 0.18 * (1 - k))) for c in col)
    if fog:
      col = fog(col, _depth)
    rim = tuple(int(c * 0.45) for c in col)
    pygame.draw.polygon(s, col, poly)
    ys = [q[1] for q in poly]
    tall = max(ys) - min(ys)
    if tall >= 6:
      pygame.draw.polygon(s, rim, poly, 1 if tall < 30 else 2)
    if tall >= 16:                                     # the middle line and two pips
      white = (255, 255, 255) if sum(dm.col) < 690 else (40, 40, 60)

      def P(m, v):
        q = cam.project(tuple(p[c] + sd[c] * w * m + up[c] * h * v for c in range(3)))
        return q[:2] if q else None

      l1, l2 = P(-0.75, 0.5), P(0.75, 0.5)
      if l1 and l2:
        pygame.draw.line(s, white, l1, l2, max(1, int(tall / 24)))
      for v in (0.25, 0.75):
        c = P(0, v)
        if c:
          pygame.draw.circle(s, white, (int(c[0]), int(c[1])), max(1, int(tall / 13)))


# --------------------------------------------------------------------------------------
# The Domino Highway: the Magic Box's 10x ride down the main street to a Class Pavilion
# --------------------------------------------------------------------------------------
HIGHWAY_SPEED = 120.0    # m/s at full speed: 10x the hero's walking speed (town3d.WALK_SPEED)
RAMP_SECS = 2.4          # ease-in and ease-out
TRAIL_GAP = 3.0          # m between the dominoes the hero leaves standing on the road
TRAIL_FALL = 0.30
HIGHWAY_PACES = [(3.0, 7.0), (2.5, 5.0), (4.0, 7.0), (3.0, 6.0)]   # notes per second: slow ...
                                                                   # full speed (never a buzz of clicks)
HIGHWAY_STYLES = {       # a child's way down the road: name -> toast text (never the last one)
    "zigzag": "zig-zagging", "wave": "wiggling like a snake", "hops": "hopping like a frog",
    "skips": "skipping along", "bounce": "bouncing like a ball", "slalom": "swerving like a skier",
    "kangaroo": "leaping like a kangaroo", "rabbit": "hopping like a rabbit",
    "crab": "shuffling like a crab", "corkscrew": "looping like a corkscrew",
    "dolphin": "jumping like a dolphin", "pogo": "bouncing on a pogo stick",
}


class TrailDomino:
  __slots__ = ("pos", "tan", "up", "side", "col", "laid", "fall")

  def place(self, pos, tan, col, laid):
    self.pos, self.tan, self.col, self.laid = pos, tan, col, laid
    self.fall = float("inf")               # set when the hero has arrived
    self.up = (0.0, 1.0, 0.0)
    self.side = _norm((tan[2], 0.0, -tan[0]))
    return self


class Highway:
  """The Magic Box's ride to a Class Pavilion, at warp speed and in a child's playful way
  (zig-zags, a snake's wiggle, frog hops, skips, a ball's bounces or a skier's swerves,
  never the same as the last ride). Dominoes stand where the hero passed; once the hero
  has arrived, the whole run topples from the start to the pavilion. Same interface as
  Flight for world.py."""

  flap_rate = 0.0
  flap = 0.0
  rotor = 0.0
  highway = True

  def __init__(self, start, box, colour, instruments=(), seed=None):
    rng = random.Random(seed)
    self.rng = rng
    self.box = box
    self.style = _pick_bag(rng, "hw_style", list(HIGHWAY_STYLES))
    self.label = HIGHWAY_STYLES[self.style] + " down the Domino Highway"
    self.colour = colour
    # every ride its own music: instrument, scale, tune shape, pace and pitch, never the
    # same as the ride or flight before
    self.inst = _pick(rng, "inst", list(instruments)) if instruments else None
    self.scale = dict(magic.SCALES)[_pick(rng, "scale", [s[0] for s in magic.SCALES])]
    self.contour = _pick(rng, "contour", magic.CONTOURS)
    self.pace = _pick(rng, "pace", HIGHWAY_PACES)
    self.root = rng.choice([57, 60, 62, 63, 65, 67])
    self.ph = rng.uniform(0, math.tau)
    self.t = 0.0
    self.finished = False
    self.fade = FADE_SECS
    self._road(start, box)
    L = self.length
    self.vmax = min(HIGHWAY_SPEED, L / RAMP_SECS)
    self.cruise = max(0.0, (L - self.vmax * RAMP_SECS) / self.vmax)
    self.land_at = 2 * RAMP_SECS + self.cruise
    self.hover_t = self.land_at
    self.done_at = float("inf")            # known once the run's toppling is planned
    self.pos, self.yaw = self.at_s(0.0)[0], 0.0
    self.s = 0.0
    self.speed_k = 0.0
    self.dominoes = []
    self.wave_speed = 0.0
    self.next_gap = TRAIL_GAP
    self.next_note = 0.0
    self.note_k = 0

  def _offset(self, u, run):
    """(sideways, up) metres off the street's middle at share u of the long run."""
    q, s = self.q, self.style
    tau = math.tau
    if s == "zigzag":
      return q["a"] * _tri(u * run / q["len"]), 0.0
    if s == "wave":
      return q["a"] * math.sin(tau * u * run / q["len"] + self.ph), 0.0
    if s == "hops":
      return 1.2 * math.sin(tau * u * run / 90.0), q["h"] * abs(math.sin(math.pi * u * run / q["hop"]))
    if s == "skips":
      return (0.6 * q["a"] * math.sin(tau * u * run / q["len"]),
              0.5 * q["h"] * abs(math.sin(math.pi * u * run / (0.5 * q["hop"]))))
    if s == "bounce":
      return 0.0, 2.2 * q["h"] * abs(math.sin(math.pi * u * run / (2.5 * q["hop"])))
    if s == "kangaroo":                  # long, high leaps with a gentle sway
      return (0.5 * q["a"] * math.sin(tau * u * run / (2.0 * q["len"])),
              1.8 * q["h"] * abs(math.sin(math.pi * u * run / (1.6 * q["hop"]))) ** 0.6)
    if s == "rabbit":                    # quick little hops, zig and zag
      return (0.4 * q["a"] * _tri(u * run / (0.4 * q["len"])),
              0.6 * q["h"] * abs(math.sin(math.pi * u * run / (0.35 * q["hop"]))))
    if s == "crab":                      # quick sideways shuffles
      return 0.7 * q["a"] * math.sin(tau * u * run / (0.2 * q["len"])), 0.0
    if s == "corkscrew":                 # rolling loops round the road
      a = tau * u * run / q["len"]
      return 0.5 * q["a"] * math.sin(a), 0.5 * q["a"] * (1 - math.cos(a))
    if s == "dolphin":                   # arcs up out of the road and back, with a sway
      return (0.5 * q["a"] * math.sin(tau * u * run / (1.5 * q["len"])),
              1.4 * q["h"] * max(0.0, math.sin(tau * u * run / (1.2 * q["hop"]))))
    if s == "pogo":                      # tiny quick bounces
      return (0.3 * q["a"] * math.sin(tau * u * run / q["len"]),
              0.5 * q["h"] * abs(math.sin(math.pi * u * run / (0.2 * q["hop"]))))
    k = math.sin(tau * u * run / q["len"])           # slalom: long swerves, side to side
    return q["a"] * math.copysign(abs(k) ** 0.5, k), 0.0

  def _road(self, start, box):
    """The road: onto the middle of the main street, then along it to the pavilion's
    front in this ride's playful pattern."""
    r = self.rng
    self.q = {"a": r.uniform(4.5, 7.5), "len": r.uniform(45.0, 80.0), "h": r.uniform(1.8, 3.2),
              "hop": r.uniform(10.0, 16.0)}
    ax, _ay, az = start
    door = box.door()
    sgn = 1.0 if door[2] >= az else -1.0
    merge = min(30.0, abs(door[2] - az) * 0.3)
    pts = []
    for i in range(25):                                  # a smooth curve onto the street
      u = i / 24
      cx, cz = 0.0, az + sgn * merge * 0.3
      ex, ez = 0.0, az + sgn * merge
      pts.append(((1 - u) ** 2 * ax + 2 * (1 - u) * u * cx + u * u * ex, 0.0,
                  (1 - u) ** 2 * az + 2 * (1 - u) * u * cz + u * u * ez))
    z0, z1 = pts[-1][2], door[2]
    run = abs(z1 - z0)
    n = max(40, min(3000, int(run / 1.5)))
    for i in range(1, n + 1):                            # the long run, the playful way
      u = i / n
      env = _ease(u / 0.06) * _ease((1 - u) / 0.06)       # straight in and out at the ends
      side, up = self._offset(u, run)
      pts.append((side * env, up * env, z0 + (z1 - z0) * u))
    self.road = pts
    self.arc = [0.0]
    for i in range(1, len(pts)):
      self.arc.append(self.arc[-1] + math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]))
    self.length = max(1.0, self.arc[-1])

  def at_s(self, s):
    """(position, yaw) at distance s along the road."""
    s = max(0.0, min(self.length, s))
    i = max(0, min(len(self.arc) - 2, bisect.bisect_right(self.arc, s) - 1))
    a, b = self.road[i], self.road[i + 1]
    f = (s - self.arc[i]) / max(1e-9, self.arc[i + 1] - self.arc[i])
    return tuple(a[c] + (b[c] - a[c]) * f for c in range(3)), math.atan2(b[0] - a[0], b[2] - a[2])

  def s_at(self, t):
    """Distance covered at time t: an ease-in, the cruise at full speed, an ease-out."""
    V, R, L = self.vmax, RAMP_SECS, self.length
    if t <= 0:
      return 0.0
    if t < R:
      u = t / R
      return V * R * (u ** 3 - u ** 4 / 2)
    if t < R + self.cruise:
      return V * R / 2 + V * (t - R)
    w = max(0.0, (self.land_at - t) / R)
    return L - V * R * (w ** 3 - w ** 4 / 2)

  def v_at(self, t):
    if t <= 0 or t >= self.land_at:
      return 0.0
    if t < RAMP_SECS:
      return self.vmax * _ease(t / RAMP_SECS)
    if t < RAMP_SECS + self.cruise:
      return self.vmax
    return self.vmax * _ease((self.land_at - t) / RAMP_SECS)

  @property
  def landed(self):
    return self.t >= self.land_at

  @property
  def cascading(self):
    return self.landed and not self.finished

  @property
  def toppling(self):
    """The run is falling (after the pause that shows the arrival)."""
    return self.cascading and bool(self.dominoes) and self.t >= self.dominoes[0].fall - 0.4

  @property
  def gone(self):
    return self.finished

  def skip(self):
    """A tap: straight to the pavilion (the run then topples); a tap during the run ends it."""
    if self.t < self.land_at:
      self.t = self.land_at
    elif self.done_at < float("inf"):
      self.t = max(self.t, self.done_at)

  def _glow(self, s):
    glow = 0.35 + 0.35 * (0.5 + 0.5 * math.sin(s * 0.08))
    return tuple(min(255, int(c + (255 - c) * glow)) for c in self.colour)

  def _spawn(self, s):
    pos, yaw = self.at_s(s)
    tan = (math.sin(yaw), 0.0, math.cos(yaw))
    self.dominoes.append(TrailDomino().place((pos[0], 0.0, pos[2]), tan, self._glow(s), self.t))

  def front(self):
    """(position, yaw) of the domino falling now: where the toppling wave is."""
    i = bisect.bisect_right([dm.fall for dm in self.dominoes], self.t) - 1
    dm = self.dominoes[max(0, min(len(self.dominoes) - 1, i))]
    return dm.pos, math.atan2(dm.tan[0], dm.tan[2])

  def _note(self, sfx, f):
    span = len(self.scale) * 2
    d = int(round(max(0.0, min(1.0, f)) * (span - 1)))
    d = min(span - 1, d + (1 if self.note_k % 3 == 1 else 0))
    self.note_k += 1
    midi = self.root + self.scale[d % len(self.scale)] + 12 * (d // len(self.scale))
    if self.inst:
      sfx.note(midi, self.inst, 1.0 if self.note_k % 4 == 1 else 0.7)
    else:
      sfx.play("clack", d)

  def _shape(self, j, f):
    return {"up": f, "down": 1 - f, "wave": 0.5 + 0.5 * math.sin(j * 0.6 + self.ph), "zigzag": (j % 4) / 3,
            "mountain": 1 - abs(2 * f - 1), "valley": abs(2 * f - 1),
            "ocean": 0.5 + 0.35 * math.sin(j * 0.5 + self.ph) + 0.15 * math.sin(j * 1.7)}[self.contour]

  def update(self, dt, sfx=None):
    if self.finished:
      return None
    event = None
    was = self.landed
    self.t += dt
    s = self.s_at(min(self.t, self.land_at))
    pos, yaw = self.at_s(s)
    if self.landed:
      s = self.length
    while self.next_gap <= s - 1.5 and self.next_gap < self.length - 2.0:   # left standing
      self._spawn(self.next_gap)
      self.next_gap += TRAIL_GAP
    self.s, self.pos, self.yaw = s, pos, yaw
    v = self.v_at(self.t)
    self.speed_k = v / HIGHWAY_SPEED
    if sfx and v > 1.0 and self.t >= self.next_note:     # a tune that climbs as we go
      lo, hi = self.pace
      self.next_note = self.t + 1.0 / (lo + (hi - lo) * self.speed_k)
      self._note(sfx, 0.25 * (v / self.vmax) + 0.25 * (s / self.length)
                 + 0.5 * self._shape(self.note_k, s / self.length))
    if self.landed and not was:
      event = "landed"
      if sfx:
        sfx.play("pop", 3)
      n = len(self.dominoes)                   # now the whole run topples, first to last
      start, span = self.t + CASCADE_PAUSE, cascade_secs(n)
      for k, dm in enumerate(self.dominoes):
        dm.fall = start + span * (k / max(1, n - 1))
      self.wave_speed = self.length / span
      self.done_at = (self.dominoes[-1].fall if self.dominoes else self.t) + TRAIL_FALL + 0.3
      self.next_note = start
    if self.landed and self.dominoes and self.t >= self.next_note and self.t < self.done_at:
      lo, hi = self.pace                       # the toppling run plays the tune too
      self.next_note = self.t + 1.0 / hi
      i = bisect.bisect_right([dm.fall for dm in self.dominoes], self.t)
      if sfx and i > 0:
        f = i / len(self.dominoes)
        self._note(sfx, 0.5 * f + 0.5 * self._shape(self.note_k, f))
    if self.t >= self.done_at:
      self.finished = True
      event = "done"
    return event

  def notes(self):
    """Every note the ride can play (made before it starts, so none has to wait)."""
    return [self.root + self.scale[d % len(self.scale)] + 12 * (d // len(self.scale))
            for d in range(len(self.scale) * 2)]

  def visible(self, cam_pos, far=170.0):
    out = []
    for dm in self.dominoes:
      d = math.dist(dm.pos, cam_pos)
      if d < far:
        out.append((d, dm))
    return out

  def draw_domino(self, s, cam, dm, fog=None):
    grow = min(1.0, (self.t - dm.laid) / 0.08)
    if grow <= 0.02:
      return
    k = 0.0 if self.t < dm.fall else min(1.0, (self.t - dm.fall) / TRAIL_FALL)
    a = (math.pi / 2 - 0.08) * k * k                     # falls flat onto the road
    h, w = DOM_H * grow, DOM_W * grow / 2
    up = tuple(dm.up[c] * math.cos(a) + dm.tan[c] * math.sin(a) for c in range(3))
    p, sd = dm.pos, dm.side
    base = [tuple(p[c] + sd[c] * w * m for c in range(3)) for m in (-1, 1)]
    top = [tuple(b[c] + up[c] * h for c in range(3)) for b in base]
    got = cam.project_poly([base[0], base[1], top[1], top[0]])
    if not got:
      return
    poly, depth = got
    col = dm.col if fog is None else fog(dm.col, depth)
    if 0 < k < 1:                                        # falling: a little brighter
      col = tuple(min(255, int(c + (255 - c) * 0.25)) for c in col)
    pygame.draw.polygon(s, col, poly)
    ys = [q[1] for q in poly]
    tall = max(ys) - min(ys)
    if tall >= 5:                                        # a bright rim: they glow
      pygame.draw.polygon(s, (255, 255, 230), poly, 1 if tall < 24 else 2)
    if tall >= 14:
      q = cam.project(tuple(p[c] + up[c] * h * 0.5 for c in range(3)))
      if q:
        pygame.draw.circle(s, (255, 255, 255), (int(q[0]), int(q[1])), max(1, int(tall / 12)))
