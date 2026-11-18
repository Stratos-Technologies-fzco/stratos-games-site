"""Domino magic: every cascade is a little show, and never the same twice.

Each time the dominoes are pushed, a Show is made with
  - its own music: an instrument (bells, xylophone, marimba, piano, harp, flute,
    steel drum, kalimba, sitar, water drops), a scale (Indian ragas Bhupali, Yaman,
    Kafi, or major, pentatonic, whole-tone ...), a melody shape (rising, falling,
    waves, zigzag, mountain, ocean) and a rhythm (waltz, march, swing, gallop ...),
    one note every few dominoes, never the same as the show before;
  - its own timing: a slow start, waves of speed, one or two "twists" where
    the line almost stops ("will it fall?") and then bursts forward, tiny
    stops of a fraction of a second, and a
    slow-motion ending, about 4-8 seconds in all whatever the picture;
  - its own magic along the line: butterflies, fireflies, a rainbow trail,
    stars or bubbles rising from the falling dominoes;
  - a finale, one of seven celebrations (never the same as the last one): butterflies,
    rising balloons, a flock of doves and parrots, prismatic bubbles, fuljhari sparklers,
    festival crackers in a night sky, or tiny fairy bulbs lighting up along a branching
    domino wave - each with its own motion (speed, gravity, fading) and its own sounds.
"""

import math
import random

import pygame

SCALES = [
    ("Bhupali", [0, 2, 4, 7, 9]),
    ("Yaman", [0, 2, 4, 6, 7, 9, 11]),
    ("Kafi", [0, 2, 3, 5, 7, 9, 10]),
    ("Major", [0, 2, 4, 5, 7, 9, 11]),
    ("Pentatonic", [0, 3, 5, 7, 10]),
    ("Whole tone", [0, 2, 4, 6, 8, 10]),
    ("Bilawal", [0, 2, 4, 5, 7, 9, 11, 12]),
]
CONTOURS = ["up", "down", "wave", "zigzag", "mountain", "valley", "ocean"]
STYLES = ["butterflies", "fireflies", "rainbow", "stars", "bubbles"]
FINALES = ["butterflies", "balloons", "birds", "bubbles", "sparklers", "fireworks", "bulbs"]
FX_MAX = 420               # particles alive at once (fireworks need many)
INSTRUMENTS = ["bell", "xylophone", "marimba", "piano", "harp", "flute", "steel drum",
               "kalimba", "sitar", "water drop"]
# Rhythms: how long each note waits, cycling (1 = an even step); the first is the strong beat
RHYTHMS = {
    "flowing waves": [1.0],
    "waltz": [1.5, 0.75, 0.75],
    "march": [1.2, 0.8],
    "swing": [1.35, 0.65],
    "gallop": [0.6, 0.6, 1.8],
    "skip": [0.7, 1.3, 1.0, 1.0],
}
NOTES_PER_SECOND = 7
_LAST = {}                 # the previous show's music: the next one never repeats it


def pick(rng, key, options):
  """A random choice that is never the previous show's choice."""
  fresh = [o for o in options if o != _LAST.get(key)] or list(options)
  _LAST[key] = choice = rng.choice(fresh)
  return choice


def plan_music(seed=None):
  """The next cascade's music, chosen when a picture opens (so its instrument's
  notes can be made while the child traces). Never the same as the last one."""
  rng = random.Random(seed)
  return {"inst": pick(rng, "inst", INSTRUMENTS),
          "scale": pick(rng, "scale", [s[0] for s in SCALES]),
          "contour": pick(rng, "contour", CONTOURS),
          "rhythm": pick(rng, "rhythm", list(RHYTHMS)),
          "style": pick(rng, "style", STYLES)}
WING = [(255, 120, 180), (255, 200, 60), (120, 200, 255), (170, 120, 255), (120, 230, 140),
        (255, 150, 80)]


def hue(h, s=85, v=100):
  c = pygame.Color(0)
  c.hsva = (int(h) % 360, s, v, 100)
  return c


class Show:

  def __init__(self, n, seed=None, music=None):
    rng = random.Random(seed)
    self.rng = rng
    self.n = n
    music = music or plan_music(rng.random())
    self.inst = music["inst"]
    self.scale_name = music["scale"]
    self.scale = dict(SCALES)[self.scale_name]
    self.root = rng.choice([60, 62, 63, 65, 67])
    self.contour = music["contour"]
    self.rhythm_name = music["rhythm"]
    self.rhythm = RHYTHMS[self.rhythm_name]
    self.style = music["style"]
    self.hue0 = rng.uniform(0, 360)
    self.ph = rng.uniform(0, 2 * math.pi)
    self.duration = min(8.0, max(4.0, 3.0 + 0.03 * n))
    phase = rng.uniform(0, 2 * math.pi)
    waves = rng.choice([2, 3, 4])
    depth = rng.uniform(0.45, 0.65)        # waves of speed: slow ... quick ... slow
    self.twists = sorted((rng.uniform(0.3, 0.75), rng.uniform(0.03, 0.06))
                         for _ in range(rng.choice([1, 2])))
    self.step = max(1, round(n / (self.duration * NOTES_PER_SECOND)))
    weights = []
    for i in range(n):
      p = i / max(1, n - 1)
      ramp = 0.35 + 0.65 * min(1.0, p / 0.25)                 # slow start
      speed = ramp * (1.0 + depth * math.sin(p * math.pi * 2 * waves + phase))
      for c, w in self.twists:
        if abs(p - c) < w:
          speed *= 0.22                                       # suspense ...
        elif c + w <= p < c + w + 0.05:
          speed *= 1.8                                        # ... then a burst
      if p > 0.92:
        speed *= 0.55                                         # slow-motion end
      beat = self.rhythm[(i // self.step) % len(self.rhythm)]  # the rhythm's long and short notes
      weights.append(max(0.05, speed / beat))
    raw = [1.0 / s for s in weights]
    k = self.duration / sum(raw)
    self.gaps = [r * k for r in raw]                          # s until the next push
    # a few tiny stops, a fraction of a second, as if the chain holds its breath
    for _ in range(rng.choice([1, 2, 3])):
      j = int(rng.uniform(0.15, 0.85) * n) // self.step * self.step
      if 0 < j < n - 1:
        self.gaps[j] += rng.uniform(0.15, 0.4)
    self.fx = []                                              # magic particles
    self.teased = set()
    self.finale_kind = None
    self.sfx = None
    self.clock = 0.0
    self.cues = []                                            # [(when, sound)] of the finale

  # ------------------------------------------------------------ music
  def note(self, i):
    """The bell note for domino i, or None (one note every few dominoes)."""
    if i % self.step:
      return None
    j, m = i // self.step, max(1, (self.n - 1) // self.step)
    span = len(self.scale) * 2
    f = j / m
    shape = {
        "up": f, "down": 1 - f,
        "wave": 0.5 + 0.5 * math.sin(j * 0.6),
        "zigzag": (j % 4) / 3,
        "mountain": 1 - abs(2 * f - 1),
        "valley": abs(2 * f - 1),
        "ocean": 0.5 + 0.35 * math.sin(j * 0.5 + self.ph) + 0.15 * math.sin(j * 1.7),
    }[self.contour]
    d = int(round(max(0.0, min(1.0, shape)) * (span - 1)))
    return self.root + self.scale[d % len(self.scale)] + 12 * (d // len(self.scale))

  def accent(self, i):
    """Volume of domino i's note: the rhythm's strong beat is louder."""
    return 1.0 if (i // self.step) % len(self.rhythm) == 0 else 0.68

  def tip_speed(self, i, push=0.3):
    """rad/s: domino i tilts far enough to push the next one exactly on time."""
    return max(1.2, push / self.gaps[i])

  def is_twist(self, i):
    p = i / max(1, self.n - 1)
    return any(abs(p - c) < w for c, w in self.twists)

  # ------------------------------------------------------------ magic along the line
  def pushed(self, i, x, y):
    """Domino i starts to fall at (x, y): magic for this show's style."""
    r = self.rng
    h = self.hue0 + 300 * i / max(1, self.n)
    # a ring of light at every push: a glowing wave runs along the picture
    self.fx.append({"k": "ring", "x": x, "y": y, "vx": 0, "vy": 0, "t": 0.0, "life": 0.7,
                    "c": hue(h)})
    if self.style == "butterflies" and i % max(2, self.step * 2) == 0:
      self.fx.append({"k": "fly", "x": x, "y": y, "vx": r.uniform(-30, 30), "vy": r.uniform(-70, -40),
                      "t": 0.0, "life": r.uniform(2.0, 3.0), "c": r.choice(WING), "s": 1.4})
    elif self.style == "fireflies" and i % max(1, self.step) == 0:
      self.fx.append({"k": "glow", "x": x, "y": y, "vx": r.uniform(-25, 25), "vy": r.uniform(-30, -10),
                      "t": 0.0, "life": r.uniform(1.5, 2.5), "c": (255, 240, 120), "ph": r.uniform(0, 6)})
    elif self.style == "rainbow":
      self.fx.append({"k": "spark", "x": x, "y": y, "vx": r.uniform(-15, 15), "vy": r.uniform(-40, -15),
                      "t": 0.0, "life": 1.0, "c": hue(h)})
    elif self.style == "stars" and i % max(1, self.step) == 0:
      self.fx.append({"k": "star", "x": x, "y": y, "vx": 0, "vy": -35, "t": 0.0, "life": 1.4,
                      "c": hue(45 + 20 * r.random(), 70), "rot": r.uniform(0, 6)})
    elif self.style == "bubbles" and i % max(1, self.step) == 0:
      self.fx.append({"k": "bubble", "x": x, "y": y, "vx": r.uniform(-10, 10), "vy": r.uniform(-50, -30),
                      "t": 0.0, "life": r.uniform(1.6, 2.4), "c": hue(h, 40), "r": r.uniform(6, 12)})

  # ------------------------------------------------------------ the finale
  def tone(self, j):
    """Note j of this show's scale (within the two octaves its cascade played)."""
    j = max(0, min(len(self.scale) * 2 - 1, j))
    return self.root + self.scale[j % len(self.scale)] + 12 * (j // len(self.scale))

  def cue(self, after, *sound):
    """A sound of the finale, after this many seconds: ("play", name, variant) or
    ("note", j, volume)."""
    self.cues.append((self.clock + after, sound))

  def finale(self, rect, sfx=None):
    """One of seven celebrations bursts out of the finished picture."""
    self.sfx = sfx
    self.finale_kind = pick(self.rng, "finale", FINALES)
    getattr(self, "_fin_" + self.finale_kind)(pygame.Rect(rect))

  def _fin_butterflies(self, rect):
    r = self.rng
    cx, cy = rect.center
    for k in range(18):
      a = k / 18 * 2 * math.pi + r.uniform(-0.2, 0.2)
      sp = r.uniform(70, 140)
      self.fx.append({"k": "fly", "x": cx + r.uniform(-40, 40), "y": cy + r.uniform(-40, 40),
                      "vx": math.cos(a) * sp, "vy": math.sin(a) * sp - 40, "t": 0.0,
                      "life": r.uniform(2.5, 3.8), "c": r.choice(WING), "s": r.uniform(1.6, 2.4)})
    for j in range(5):                                        # a fluttering arpeggio
      self.cue(0.12 * j + 0.2, "note", 4 + j * 2, 0.7)

  def _fin_balloons(self, rect):
    r = self.rng
    for k in range(13):
      big = k < 2                                             # two hot-air balloons
      self.fx.append({"k": "balloon", "x": rect.x + rect.w * (k + 0.5) / 13 + r.uniform(-10, 10),
                      "y": rect.bottom - r.uniform(0, rect.h * 0.25), "vx": r.uniform(-8, 8),
                      "vy": r.uniform(-70, -45) * (0.7 if big else 1.0), "g": -14 if big else -24,
                      "t": -r.uniform(0, 0.8), "life": r.uniform(3.2, 4.4), "s": 2.2 if big else 1.0,
                      "hot": big, "c": hue(self.hue0 + k * 47), "ph": r.uniform(0, 6),
                      "pop": not big and r.random() < 0.6})
    for j in range(4):
      self.cue(0.25 * j, "note", 2 + j * 2, 0.6)

  def _fin_birds(self, rect):
    r = self.rng
    cx, cy = rect.center
    for k in range(16):
      parrot = k % 3 == 0
      side = -1 if k % 2 else 1
      self.fx.append({"k": "bird", "x": cx + r.uniform(-30, 30), "y": cy + r.uniform(-20, 30),
                      "vx": side * r.uniform(70, 170), "vy": -r.uniform(70, 150), "g": -18,
                      "drag": 0.25, "t": -0.05 * k, "life": r.uniform(2.6, 3.4),
                      "c": (40, 180, 70) if parrot else (246, 246, 250), "parrot": parrot,
                      "rate": r.uniform(9, 13), "s": r.uniform(1.0, 1.5)})
    for j in range(4):                                        # wings whoosh up
      self.cue(0.18 * j, "play", "switch", None)
    self.cue(0.5, "note", 7, 0.7)
    self.cue(0.75, "note", 9, 0.6)

  def _fin_bubbles(self, rect):
    r = self.rng
    for k in range(16):
      self.fx.append({"k": "pbubble", "x": rect.x + r.uniform(0.1, 0.9) * rect.w,
                      "y": rect.bottom - r.uniform(0, rect.h * 0.4), "vx": r.uniform(-12, 12),
                      "vy": -r.uniform(28, 55), "g": -4, "t": -r.uniform(0, 0.6),
                      "life": r.uniform(1.6, 3.6), "r": r.uniform(10, 24), "h": r.uniform(0, 360),
                      "ph": r.uniform(0, 6)})

  def _fin_sparklers(self, rect):
    r = self.rng
    for k, fx in enumerate((0.25, 0.5, 0.75)):                # three fuljhari in the ground
      self.fx.append({"k": "fuljhari", "x": rect.x + rect.w * fx, "y": rect.bottom - rect.h * 0.12,
                      "vx": 0, "vy": 0, "t": -0.25 * k, "life": 2.8, "tilt": r.uniform(-0.25, 0.25)})
    t = 0.0
    while t < 3.1:                                            # crackle ... crackle
      self.cue(t, "play", "click", None)
      t += r.uniform(0.05, 0.14)
    self.cue(0.1, "note", 9, 0.5)

  def _fin_fireworks(self, rect):
    r = self.rng
    self.fx.append({"k": "night", "x": rect.x, "y": rect.y, "vx": 0, "vy": 0, "t": 0.0, "life": 4.2,
                    "w": rect.w, "h": rect.h})
    for k in range(6):
      at = 0.15 + k * r.uniform(0.35, 0.5)
      x = rect.x + rect.w * r.uniform(0.15, 0.85)
      apex = rect.y + rect.h * r.uniform(0.15, 0.4)
      g = 420.0
      vy = -math.sqrt(2 * g * max(40.0, rect.bottom - apex))
      self.fx.append({"k": "rocket", "x": x, "y": rect.bottom, "vx": r.uniform(-20, 20), "vy": vy,
                      "g": g, "t": -at, "life": -vy / g, "c": hue(r.uniform(0, 360), 75)})
      self.cue(at, "play", "switch", None)                    # launch ...
      self.cue(at - vy / g, "play", "clack", 0)               # ... and a celebratory thud
      self.cue(at - vy / g + 0.03, "play", "pop", 0)

  def _fin_bulbs(self, rect):
    r = self.rng
    bulbs, speed = [], 300.0                                  # px/s: the wave along the branches

    def grow(x, y, a, length, depth, dist):
      n = max(3, int(length / 10))
      for i in range(1, n + 1):
        px, py = x + math.cos(a) * length * i / n, y + math.sin(a) * length * i / n
        bulbs.append((px, py, a, dist + length * i / n, r.uniform(0, 360), r.uniform(0, 6)))
      ex, ey = x + math.cos(a) * length, y + math.sin(a) * length
      if depth > 0:
        for turn in (-1, 1):
          grow(ex, ey, a + turn * r.uniform(0.35, 0.65), length * r.uniform(0.62, 0.75), depth - 1,
               dist + length)

    grow(rect.centerx, rect.bottom - 6, -math.pi / 2, rect.h * 0.3, 4, 0.0)
    far = max(b[3] for b in bulbs)
    self.fx.append({"k": "bulbs", "x": 0, "y": 0, "vx": 0, "vy": 0, "t": 0.0,
                    "life": far / speed + 2.6, "b": bulbs, "sp": speed})
    for j in range(6):                                        # bells as the wave climbs
      self.cue(far / speed * j / 6, "note", j * 2, 0.75 if j % 2 == 0 else 0.55)

  def _burst(self, f):
    r = self.rng
    for k in range(34):
      a = k / 34 * math.tau + r.uniform(-0.1, 0.1)
      sp = r.uniform(110, 190)
      self.fx.append({"k": "flare", "x": f["x"], "y": f["y"], "vx": math.cos(a) * sp,
                      "vy": math.sin(a) * sp, "g": 70, "drag": 1.3, "t": 0.0,
                      "life": r.uniform(1.0, 1.6), "c": hue(f["c"].hsva[0] + r.uniform(-25, 25), 65)})

  def _pop_bubble(self, f, n=7):
    r = self.rng
    for _ in range(n):
      a = r.uniform(0, math.tau)
      sp = r.uniform(40, 90)
      self.fx.append({"k": "spark", "x": f["x"], "y": f["y"], "vx": math.cos(a) * sp,
                      "vy": math.sin(a) * sp, "g": 30, "t": 0.0, "life": 0.5,
                      "c": hue(f.get("h", self.hue0) + r.uniform(0, 120), 50)})

  def _play(self, sound):
    sfx = self.sfx
    if sfx is None:
      return
    try:
      if sound[0] == "note":
        sfx.note(self.tone(sound[1]), self.inst, sound[2])
      else:
        sfx.play(sound[1], sound[2])
    except Exception:
      pass

  def update(self, dt):
    self.clock += dt
    if self.cues:
      due = [c for c in self.cues if c[0] <= self.clock]
      if due:
        self.cues = [c for c in self.cues if c[0] > self.clock]
        for _when, sound in due:
          self._play(sound)
    keep, born = [], []
    for f in self.fx:
      f["t"] += dt
      if f["t"] < 0:                           # waiting for its turn
        keep.append(f)
        continue
      k = f["k"]
      if f["t"] >= f["life"]:
        if k == "rocket":                      # the cracker bursts at the top
          self._burst(f)
        elif k == "pbubble" or (k == "balloon" and f.get("pop")):
          self._pop_bubble(f, 9 if k == "balloon" else 7)
          self._play(("play", "pop", None))
        continue
      if k == "fly":                           # flutter: weave side to side
        f["vx"] += math.sin(f["t"] * 3 + f["x"] * 0.01) * 40 * dt
        f["vy"] -= 8 * dt
      elif k == "glow":
        f["vx"] += math.sin(f["t"] * 2 + f["ph"]) * 30 * dt
      elif k == "balloon":                     # sway on the breeze
        f["vx"] = 14 * math.sin(f["t"] * 1.6 + f["ph"])
      elif k == "pbubble":                     # wobble as it floats
        f["vx"] += math.sin(f["t"] * 2.4 + f["ph"]) * 22 * dt
      elif k == "fuljhari":                    # a sparkler throws golden embers
        r = self.rng
        for _ in range(max(1, int(55 * dt + r.random()))):
          a = -math.pi / 2 + f["tilt"] + r.uniform(-1.3, 1.3)
          sp = r.uniform(70, 190)
          born.append({"k": "ember", "x": f["x"] + math.cos(-math.pi / 2 + f["tilt"]) * 40,
                       "y": f["y"] + math.sin(-math.pi / 2 + f["tilt"]) * 40,
                       "vx": math.cos(a) * sp, "vy": math.sin(a) * sp, "g": 320, "t": 0.0,
                       "life": r.uniform(0.3, 0.65)})
      f["vy"] += f.get("g", 0.0) * dt
      drag = f.get("drag")
      if drag:
        f["vx"] -= f["vx"] * min(1.0, drag * dt)
        f["vy"] -= f["vy"] * min(1.0, drag * dt)
      f["x"] += f["vx"] * dt
      f["y"] += f["vy"] * dt
      keep.append(f)
    self.fx = (keep + born)[-FX_MAX:]

  def draw(self, screen, now):
    for f in self.fx:                          # the night sky goes behind the crackers
      if f["k"] == "night" and f["t"] >= 0:
        k = min(1.0, f["t"] / 0.4, (f["life"] - f["t"]) / 0.7)
        veil = pygame.Surface((int(f["w"]), int(f["h"])), pygame.SRCALPHA)
        veil.fill((12, 16, 50, int(190 * max(0.0, k))))
        screen.blit(veil, (int(f["x"]), int(f["y"])))
    for f in self.fx:
      if f["t"] < 0:
        continue
      fade = 1.0 - f["t"] / f["life"]
      x, y = int(f["x"]), int(f["y"])
      k = f["k"]
      if k == "night":
        continue
      if k == "fly":
        butterfly(screen, x, y, f["c"], now * 14 + x, f["s"], fade)
      elif k == "glow":
        a = int(255 * fade * (0.6 + 0.4 * math.sin(now * 8 + f["ph"])))
        g = pygame.Surface((40, 40), pygame.SRCALPHA)
        pygame.draw.circle(g, (255, 240, 120, a // 4), (20, 20), 19)
        pygame.draw.circle(g, (255, 245, 150, a // 2), (20, 20), 10)
        pygame.draw.circle(g, (255, 255, 220, a), (20, 20), 5)
        screen.blit(g, (x - 20, y - 20))
      elif k == "spark":
        rad = max(1, int(7 * fade))
        pygame.draw.circle(screen, f["c"], (x, y), rad)
      elif k == "ring":
        grow = f["t"] / f["life"]
        rad = int(8 + 30 * grow)
        ring = pygame.Surface((rad * 2 + 6, rad * 2 + 6), pygame.SRCALPHA)
        pygame.draw.circle(ring, (*f["c"][:3], int(240 * fade)), (rad + 3, rad + 3), rad, 5)
        screen.blit(ring, (x - rad - 3, y - rad - 3))
      elif k == "star":
        star(screen, (x, y), 10 + 5 * fade, f["c"], f["rot"] + f["t"] * 3)
      elif k == "bubble":
        rad = int(f["r"])
        b = pygame.Surface((rad * 2 + 4, rad * 2 + 4), pygame.SRCALPHA)
        pygame.draw.circle(b, (*f["c"][:3], int(90 * fade)), (rad + 2, rad + 2), rad)
        pygame.draw.circle(b, (255, 255, 255, int(220 * fade)), (rad + 2, rad + 2), rad, 2)
        pygame.draw.circle(b, (255, 255, 255, int(230 * fade)), (rad - 1, rad - 1), max(1, rad // 4))
        screen.blit(b, (x - rad - 2, y - rad - 2))
      elif k == "balloon":
        balloon(screen, x, y, f["c"], f["s"], f["hot"], f["t"] + f["ph"])
      elif k == "bird":
        bird(screen, x, y, f["c"], math.sin(f["t"] * f["rate"]), f["s"], f["parrot"], f["vx"] < 0)
      elif k == "pbubble":
        wob = math.sin(f["t"] * 5 + f["ph"])
        rx, ry = int(f["r"] * (1 + 0.08 * wob)), int(f["r"] * (1 - 0.08 * wob))
        b = pygame.Surface((rx * 2 + 4, ry * 2 + 4), pygame.SRCALPHA)
        ring = hue(f["h"] + f["t"] * 140, 60)
        pygame.draw.ellipse(b, (*ring[:3], 50), b.get_rect().inflate(-4, -4))
        pygame.draw.ellipse(b, (*ring[:3], 210), b.get_rect().inflate(-4, -4), 2)
        pygame.draw.ellipse(b, (*hue(f["h"] + 180 + f["t"] * 140, 50)[:3], 150),
                            b.get_rect().inflate(-10, -10), 1)
        pygame.draw.circle(b, (255, 255, 255, 230), (rx - rx // 3 + 2, ry - ry // 3 + 2), max(2, rx // 5))
        screen.blit(b, (x - rx - 2, y - ry - 2))
      elif k == "fuljhari":
        a = -math.pi / 2 + f["tilt"]
        tip = (x + math.cos(a) * 40, y + math.sin(a) * 40)
        pygame.draw.line(screen, (120, 120, 130), (x, y), tip, 3)
        pygame.draw.circle(screen, (255, 230, 150), (int(tip[0]), int(tip[1])), 7)
        pygame.draw.circle(screen, (255, 255, 255), (int(tip[0]), int(tip[1])), 3)
      elif k == "ember":                       # a streak along its flight, gold to white
        tail = (x - f["vx"] * 0.03, y - f["vy"] * 0.03)
        col = (255, 255, 255) if fade > 0.7 else (255, 215, 90) if fade > 0.35 else (255, 160, 40)
        pygame.draw.line(screen, col, tail, (x, y), 2)
      elif k == "rocket":
        pygame.draw.line(screen, (255, 200, 120), (x, y), (x - f["vx"] * 0.05, y - f["vy"] * 0.05), 3)
        pygame.draw.circle(screen, (255, 255, 230), (x, y), 3)
      elif k == "flare":
        rad = max(1, int(4 * fade + 1))
        pygame.draw.line(screen, f["c"], (x - f["vx"] * 0.04, y - f["vy"] * 0.04), (x, y), max(1, rad - 1))
        pygame.draw.circle(screen, (255, 255, 255) if fade > 0.75 else f["c"], (x, y), rad)
      elif k == "bulbs":
        reach = f["t"] * f["sp"]
        end = max(0.0, min(1.0, (f["life"] - f["t"]) / 0.8))
        for bx, by, a, dist, h, ph in f["b"]:
          px, py = int(bx), int(by)
          if dist > reach:                     # a tiny domino still standing across the branch
            ca, sa = math.cos(a), math.sin(a)
            pygame.draw.line(screen, (90, 70, 60), (px - sa * 4, py + ca * 4), (px + sa * 4, py - ca * 4), 3)
            continue
          ca, sa = math.cos(a), math.sin(a)    # ... fallen along it, and its bulb lights up
          pygame.draw.line(screen, (110, 90, 70), (px - ca * 4, py - sa * 4), (px + ca * 4, py + sa * 4), 3)
          tw = 0.6 + 0.4 * math.sin(now * 7 + ph)
          col = hue(h, 70)
          rad = max(1, int((2 + 2.5 * tw) * end))
          pygame.draw.circle(screen, _dim(col, 0.45), (px, py - 3), rad + 3)
          pygame.draw.circle(screen, col, (px, py - 3), rad + 1)
          pygame.draw.circle(screen, (255, 255, 255), (px, py - 3), max(1, rad // 2))

  @property
  def busy(self):
    return bool(self.fx)


def jingle(inst, seed=None):
  """A short tune for the ♪ button: [(seconds from now, MIDI note, volume)].
  Its scale, shape and rhythm are never the same as the last jingle's."""
  rng = random.Random(seed)
  scale = dict(SCALES)[pick(rng, "j_scale", [s[0] for s in SCALES])]
  shape = pick(rng, "j_shape", ["up", "down", "wave", "mountain", "valley", "bounce"])
  beats = RHYTHMS[pick(rng, "j_rhythm", list(RHYTHMS))]
  root = rng.choice([60, 62, 64, 65, 67])
  n = rng.choice([6, 7, 8, 9])
  out, t = [], 0.0
  for j in range(n):
    f = j / (n - 1)
    v = {"up": f, "down": 1 - f, "wave": 0.5 + 0.5 * math.sin(j * 1.1),
         "mountain": 1 - abs(2 * f - 1), "valley": abs(2 * f - 1),
         "bounce": (j % 2) * 0.6 + f * 0.4}[shape]
    d = int(round(v * (len(scale) + 2)))
    midi = root + scale[d % len(scale)] + 12 * (d // len(scale))
    if j == n - 1:
      midi = root + 12                     # always lands home
    out.append((t, midi, 1.0 if j % len(beats) == 0 else 0.7))
    t += 0.17 * beats[j % len(beats)]
  return out


def butterfly(screen, x, y, colour, flap, size=1.0, fade=1.0):
  """Two pairs of wings that open and close, and a little body."""
  open_ = abs(math.sin(flap))
  w = max(2, int(9 * size * (0.35 + 0.65 * open_)))
  h = int(8 * size)
  s = pygame.Surface((4 * w + 6, 3 * h + 6), pygame.SRCALPHA)
  cx, cy = s.get_width() // 2, s.get_height() // 2
  col = (*colour[:3], int(235 * fade))
  dark = (*[int(c * 0.6) for c in colour[:3]], int(235 * fade))
  for side in (-1, 1):
    pygame.draw.ellipse(s, col, (cx + (0 if side > 0 else -2 * w), cy - h - 2, 2 * w, h + 2))
    pygame.draw.ellipse(s, dark, (cx + (0 if side > 0 else -int(1.5 * w)), cy, int(1.5 * w), h))
  pygame.draw.line(s, (60, 40, 30, int(255 * fade)), (cx, cy - h), (cx, cy + h), 2)
  screen.blit(s, (x - cx, y - cy))


def _dim(c, k):
  return (int(c[0] * k), int(c[1] * k), int(c[2] * k))


def balloon(screen, x, y, colour, size=1.0, hot=False, t=0.0):
  """A party balloon with a ribbon tail, or a hot-air balloon with its basket."""
  w, h = int(22 * size), int(28 * size)
  body = pygame.Rect(0, 0, w, h)
  body.center = (x, y)
  if hot:
    pygame.draw.ellipse(screen, colour, body)
    pygame.draw.ellipse(screen, (255, 230, 90), body.inflate(-int(w * 0.55), 0))   # a stripe
    pygame.draw.ellipse(screen, _dim(colour, 0.6), body, 2)
    bx, by = x, body.bottom + int(10 * size)
    for k in (-1, 1):
      pygame.draw.line(screen, (90, 70, 50), (x + k * w * 0.3, body.bottom - 3), (bx + k * 5 * size, by), 1)
    pygame.draw.rect(screen, (150, 100, 50), (bx - 6 * size, by, 12 * size, 8 * size), border_radius=2)
    return
  pygame.draw.ellipse(screen, colour, body)
  pygame.draw.ellipse(screen, _dim(colour, 0.65), body, 2)
  pygame.draw.ellipse(screen, (255, 255, 255), (body.x + w * 0.22, body.y + h * 0.18, w * 0.22, h * 0.25))
  knot = (x, body.bottom)
  pygame.draw.polygon(screen, _dim(colour, 0.8), [knot, (x - 3, knot[1] + 5), (x + 3, knot[1] + 5)])
  pts = [(x + 4 * math.sin(t * 5 + j * 0.9), knot[1] + 5 + j * 7) for j in range(6)]
  pygame.draw.lines(screen, (240, 240, 245), False, pts, 1)


def bird(screen, x, y, colour, beat, size=1.0, parrot=False, left=False):
  """A dove (white) or a parrot (green, red beak, long tail), wings beating."""
  s = size
  d = -1 if left else 1
  wing_y = y - 9 * s * beat
  for side in (-1, 1):
    pygame.draw.polygon(screen, colour, [(x - 2 * s, y), (x + side * 13 * s, wing_y - 3 * s),
                                         (x + side * 9 * s, y + 2 * s)])
  pygame.draw.ellipse(screen, colour, (x - 7 * s, y - 3 * s, 14 * s, 7 * s))
  head = (int(x + d * 7 * s), int(y - 2 * s))
  pygame.draw.circle(screen, colour, head, max(2, int(3.4 * s)))
  beak = (220, 50, 40) if parrot else (240, 170, 60)
  pygame.draw.polygon(screen, beak, [(head[0] + d * 3 * s, head[1] - 1), (head[0] + d * 7 * s, head[1] + 1),
                                     (head[0] + d * 3 * s, head[1] + 2 * s)])
  if parrot:
    pygame.draw.line(screen, (30, 130, 60), (x - d * 6 * s, y + 1), (x - d * 17 * s, y + 6 * s), max(2, int(2.5 * s)))
  pygame.draw.circle(screen, (20, 20, 30), (head[0] + int(d * s), head[1] - 1), 1)


def star(screen, c, r, colour, rot=0.0):
  pts = []
  for k in range(10):
    rad = r if k % 2 == 0 else r * 0.45
    a = rot + k * math.pi / 5
    pts.append((c[0] + rad * math.cos(a), c[1] + rad * math.sin(a)))
  pygame.draw.polygon(screen, colour, pts)
