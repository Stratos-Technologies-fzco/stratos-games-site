"""Getting ready for school: a short picture story before Maths Play opens.

1. Wake up: the sun rises and the alarm clock shows 7 o'clock (reading the clock).
2. Pack the bag: tap 3 notebooks and 2 pencils into the school bag (counting, 3 + 2 = 5).
3. Off to school: the child comes out of the house with Mother, holding hands, stops at
   the zebra crossing, looks right, left and right again, and crosses on the green man.
4. The classroom: the blackboard where the dominoes and numbers begin.

Every picture has one line in English and, under it, in Hindi or Bangla (labels/ from
tools/make_labels.py). Nothing speaks by itself: the Hear button reads the line and a
packed item says its number. Next goes on, Skip goes straight to Maths Play. It opens
once a day (progress "school_day").
"""

import datetime
import math
import os

import pygame

WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
INK = (40, 40, 70)
SKIN = (196, 136, 96)
HAIR = (30, 24, 24)
LABELS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "labels")

SCENES = ["wake", "pack", "walk", "class"]
LINES = {
    "school_wake": "Good morning! It is 7 o'clock.",
    "school_pack": "Pack your bag: 3 books, 2 pencils.",
    "school_ready": "Ready! 3 + 2 = 5 things.",
    "school_walk": "Off to school with Mother!",
    "school_road": "Zebra crossing: look right, left, right again.",
    "school_class": "Welcome to class! Let's count!",
}
SAY = {      # (Hindi, Bangla) for the Hear button
    "school_wake": ("सुप्रभात! सात बज गए।", "সুপ্রভাত! সাতটা বাজে।"),
    "school_pack": ("बस्ता लगाओ। तीन किताबें, दो पेंसिल।", "ব্যাগ গোছাও। তিনটি বই, দুটি পেনসিল।"),
    "school_ready": ("तैयार! तीन और दो, पाँच चीज़ें।", "তৈরি! তিন আর দুই, পাঁচটি জিনিস।"),
    "school_walk": ("माँ के साथ स्कूल चलें!", "মায়ের সঙ্গে স্কুলে চলো!"),
    "school_road": ("ज़ेबरा क्रॉसिंग। दाएँ, बाएँ, फिर दाएँ देखो।", "জেব্রা ক্রসিং। ডানে, বাঁয়ে, আবার ডানে দেখো।"),
    "school_class": ("कक्षा में स्वागत है! चलो गिनें!", "ক্লাসে স্বাগতম! চলো গুনি!"),
}
NUMBERS = [("One", "एक", "এক"), ("Two", "दो", "দুই"), ("Three", "तीन", "তিন"),
           ("Four", "चार", "চার"), ("Five", "पाँच", "পাঁচ")]
MAX_ASPECT = 1.15         # widest picture (width / height); wide screens extend its edges
WALK_DOOR, WALK_TO_ROAD, WALK_LOOK, WALK_CROSS = 1.2, 4.2, 7.0, 10.0   # s into the walk


def due(progress):
  """True when the story has not been seen today."""
  return progress.data.get("school_day") != datetime.date.today().isoformat()


def _ease(k):
  k = max(0.0, min(1.0, k))
  return k * k * (3 - 2 * k)


def person(s, x, foot, h, kind, t=0.0, walking=False, look=0, arms_up=0.0):
  """A cartoon person standing on `foot` (y), h pixels tall, facing the viewer.
  kind: "mother" (saree, bun, bindi), "child" (school uniform and bag) or "teacher".
  look: -1 / 0 / 1 - the eyes look left / ahead / right."""
  swing = math.sin(t * 9) if walking else 0.0
  head_r = max(4, int(h * (0.12 if kind == "child" else 0.10)))
  hip = foot - h * 0.42
  neck = foot - h + 2 * head_r
  leg = (60, 45, 40) if kind != "child" else SKIN
  for side in (-1, 1):                                   # legs
    fx = x + side * h * 0.07 + swing * side * h * 0.10
    pygame.draw.line(s, leg, (x + side * h * 0.05, hip), (fx, foot - 3), max(2, int(h * 0.05)))
    pygame.draw.ellipse(s, (40, 30, 30), (fx - h * 0.05, foot - h * 0.035, h * 0.10, h * 0.05))
  if kind == "child":
    body = (250, 250, 250)
    pygame.draw.rect(s, (230, 60, 60), (x - h * 0.17, neck + h * 0.04, h * 0.34, h * 0.30),
                     border_radius=max(2, int(h * 0.05)))        # the school bag behind
    pygame.draw.polygon(s, (40, 60, 140), [(x - h * 0.13, hip - h * 0.02), (x + h * 0.13, hip - h * 0.02),
                                           (x + h * 0.16, hip + h * 0.16), (x - h * 0.16, hip + h * 0.16)])
    pygame.draw.rect(s, body, (x - h * 0.12, neck, h * 0.24, hip - neck + 2), border_radius=3)
    pygame.draw.line(s, (200, 40, 40), (x, neck + 2), (x, neck + h * 0.14), max(2, int(h * 0.03)))
  else:
    saree = (200, 50, 120) if kind == "mother" else (60, 140, 200)
    border = (255, 200, 60)
    pygame.draw.polygon(s, saree, [(x - h * 0.10, neck + h * 0.05), (x + h * 0.10, neck + h * 0.05),
                                   (x + h * 0.17, foot - h * 0.04), (x - h * 0.17, foot - h * 0.04)])
    pygame.draw.line(s, border, (x - h * 0.17, foot - h * 0.05), (x + h * 0.17, foot - h * 0.05),
                     max(2, int(h * 0.025)))
    pygame.draw.line(s, border, (x + h * 0.10, neck + h * 0.04), (x - h * 0.12, hip),
                     max(2, int(h * 0.03)))                  # the pallu over the shoulder
    pygame.draw.rect(s, (240, 170, 60) if kind == "mother" else (250, 250, 250),
                     (x - h * 0.10, neck, h * 0.20, h * 0.10), border_radius=3)
  arm = SKIN
  for side in (-1, 1):                                   # arms
    sx, sy = x + side * h * 0.11, neck + h * 0.03
    if arms_up:
      hx, hy = sx + side * h * 0.10, sy - h * 0.22 * arms_up
    else:
      hx, hy = sx + side * h * 0.05 - swing * side * h * 0.05, sy + h * 0.26
    pygame.draw.line(s, arm, (sx, sy), (hx, hy), max(2, int(h * 0.04)))
  pygame.draw.circle(s, SKIN, (int(x), int(neck - head_r + 2)), head_r)    # head
  hy = neck - head_r + 2
  pygame.draw.arc(s, HAIR, (x - head_r, hy - head_r, 2 * head_r, 2 * head_r), 0.2, math.pi - 0.2,
                  max(2, head_r // 2))
  if kind != "child":
    pygame.draw.circle(s, HAIR, (int(x + head_r * 0.2), int(hy - head_r)), max(2, head_r // 2))   # bun
    pygame.draw.circle(s, (220, 30, 40), (int(x), int(hy - head_r * 0.45)), max(1, head_r // 6))  # bindi
  for side in (-1, 1):                                   # eyes and smile
    pygame.draw.circle(s, INK, (int(x + side * head_r * 0.38 + look * head_r * 0.22), int(hy - head_r * 0.05)),
                       max(1, head_r // 6))
  pygame.draw.arc(s, (120, 40, 40), (x - head_r * 0.4, hy - head_r * 0.1, head_r * 0.8, head_r * 0.6),
                  math.pi + 0.3, 2 * math.pi - 0.3, max(1, head_r // 7))
  return (x + h * 0.11 + h * 0.05, neck + h * 0.29), (x - h * 0.11 - h * 0.05, neck + h * 0.29)


def clock(s, c, r, h, m, shake=0.0):
  cx, cy = c[0] + int(shake), c[1]
  pygame.draw.circle(s, (230, 70, 60), (cx - int(r * 0.7), cy - int(r * 0.85)), int(r * 0.32))   # bells
  pygame.draw.circle(s, (230, 70, 60), (cx + int(r * 0.7), cy - int(r * 0.85)), int(r * 0.32))
  pygame.draw.circle(s, (230, 70, 60), (cx, cy), r)
  pygame.draw.circle(s, (255, 252, 240), (cx, cy), int(r * 0.84))
  for k in range(12):
    a = math.tau * k / 12
    p = (cx + math.sin(a) * r * 0.72, cy - math.cos(a) * r * 0.72)
    pygame.draw.circle(s, INK, (int(p[0]), int(p[1])), max(1, r // 18) + (1 if k % 3 == 0 else 0))
  ah = math.tau * ((h % 12) + m / 60) / 12
  am = math.tau * m / 60
  pygame.draw.line(s, INK, (cx, cy), (cx + math.sin(ah) * r * 0.42, cy - math.cos(ah) * r * 0.42), max(3, r // 8))
  pygame.draw.line(s, INK, (cx, cy), (cx + math.sin(am) * r * 0.66, cy - math.cos(am) * r * 0.66), max(2, r // 12))
  pygame.draw.circle(s, INK, (cx, cy), max(2, r // 10))


class SchoolDay:
  """The story; MathsGame hands it draw / press / update until done is True."""

  def __init__(self, game, area):
    self.g = game
    self.area = area               # a function giving the play area
    self.k = 0
    self.t0 = self.now()
    self.done = False
    self.packed = []               # (item index, time it was tapped)
    self._img = {}

  @staticmethod
  def now():
    import time
    return time.time()

  @property
  def scene(self):
    return SCENES[self.k]

  def line_key(self, t):
    if self.scene == "wake":
      return "school_wake"
    if self.scene == "pack":
      return "school_ready" if len(self.packed) == 5 else "school_pack"
    if self.scene == "walk":
      return "school_road" if WALK_TO_ROAD <= t < WALK_CROSS else "school_walk"
    return "school_class"

  def native(self, key):
    lang = self.g.lang
    if lang not in ("hi", "bn"):
      return None
    if (lang, key) not in self._img:
      try:
        self._img[(lang, key)] = pygame.image.load(os.path.join(LABELS, f"{lang}_{key}.png")).convert_alpha()
      except Exception:
        self._img[(lang, key)] = None
    return self._img[(lang, key)]

  # ------------------------------------------------------------ layout
  def layout(self):
    a = self.area()
    cap = pygame.Rect(a.x + 8, a.y + 8, a.w - 16, 74)
    stage = pygame.Rect(a.x + 8, cap.bottom + 8, a.w - 16, a.bottom - cap.bottom - 82)
    hear = pygame.Rect(a.x + 12, a.bottom - 64, 120, 54)
    nxt = pygame.Rect(a.right - 152, a.bottom - 64, 140, 54)
    skip = pygame.Rect(0, 0, 90, 40)
    skip.midbottom = (a.centerx, a.bottom - 12)
    return a, cap, stage, hear, nxt, skip

  @staticmethod
  def inner(stage):
    """The picture keeps a phone-like shape; a wide screen gets it in the middle."""
    r = stage.copy()
    if r.w > r.h * MAX_ASPECT:
      r.w = int(r.h * MAX_ASPECT)
      r.centerx = stage.centerx
    return r

  def backdrop(self, s, st):
    """Walls, sky and floor across the whole stage, so the sides of a wide screen
    carry on the picture in the middle."""
    bands = {"wake": [(0.0, (255, 236, 200)), (0.82, (200, 150, 100))],
             "pack": [(0.0, (235, 245, 255)), (0.62, (170, 110, 60))],
             "walk": [(0.0, (190, 225, 255)), (0.78, (205, 205, 210)), (0.86, (120, 200, 110))],
             "class": [(0.0, (200, 235, 210)), (0.80, (180, 140, 100))]}[self.scene]
    for k, (y0, col) in enumerate(bands):
      y1 = bands[k + 1][0] if k + 1 < len(bands) else 1.0
      s.fill(col, (st.x, st.y + int(st.h * y0), st.w, int(st.h * (y1 - y0)) + 1))

  def items(self, stage):
    """The 3 notebooks and 2 pencils on the table, and the bag's mouth."""
    stage = self.inner(stage)
    w = stage.w
    table_y = stage.y + stage.h * 0.62
    out = []
    for k in range(3):
      out.append(pygame.Rect(stage.x + w * (0.06 + 0.14 * k), table_y - w * 0.15, w * 0.11, w * 0.15))
    for k in range(2):
      out.append(pygame.Rect(stage.x + w * 0.10, table_y + w * (0.03 + 0.06 * k), w * 0.30, w * 0.035))
    bag = pygame.Rect(0, 0, w * 0.30, w * 0.34)
    bag.midbottom = (stage.x + w * 0.76, table_y + w * 0.10)
    return out, bag

  # ------------------------------------------------------------ input
  def ready(self, t):
    if self.scene == "pack":
      return len(self.packed) == 5
    return t > 1.0

  def press(self, pos):
    a, cap, stage, hear, nxt, skip = self.layout()
    g = self.g
    t = self.now() - self.t0
    if skip.collidepoint(pos):
      g.sfx.play("click")
      self.done = True
      return
    if hear.collidepoint(pos):
      g.sfx.play("click")
      key = self.line_key(t)
      hi, bn = SAY[key]
      g.say(LINES[key], {"hi": hi, "bn": bn}.get(g.lang))
      return
    if nxt.collidepoint(pos) and self.ready(t):
      g.sfx.play("switch")
      self.next()
      return
    if self.scene == "pack":
      items, bag = self.items(stage)
      gone = {i for i, _ in self.packed}
      for i, r in enumerate(items):
        if i not in gone and r.inflate(16, 16).collidepoint(pos):
          self.packed.append((i, self.now()))
          n = len(self.packed)
          g.sfx.play("pop", n + 2)
          word = NUMBERS[n - 1]
          g.say(word[0], {"hi": word[1], "bn": word[2]}.get(g.lang))
          return
    if self.scene == "wake":
      _a, _b = self.wake_clock(self.inner(stage))
      if math.dist(pos, _a) < _b + 10:
        g.sfx.play("beep")                     # the alarm rings only when tapped
        self.ring_at = self.now()

  def next(self):
    if self.k + 1 >= len(SCENES):
      self.done = True
      return
    self.k += 1
    self.t0 = self.now()

  # ------------------------------------------------------------ drawing
  def draw(self, s, now):
    g = self.g
    a, cap, stage, hear, nxt, skip = self.layout()
    t = now - self.t0
    clip = s.get_clip()
    s.set_clip(stage)
    self.backdrop(s, stage)
    inner = self.inner(stage)
    getattr(self, "draw_" + self.scene)(s, inner, t, now)
    s.set_clip(clip)
    pygame.draw.rect(s, WHITE, stage, 3, border_radius=14)
    # the line in English and in the child's language
    pygame.draw.rect(s, (30, 50, 100), cap, border_radius=14)
    pygame.draw.rect(s, YELLOW, cap, 2, border_radius=14)
    key = self.line_key(t)
    size = 21
    while size > 13 and g.font_at(size).size(LINES[key])[0] > cap.w - 20:
      size -= 1
    native = self.native(key)
    en = g.font_at(size).render(LINES[key], True, YELLOW)
    s.blit(en, en.get_rect(center=(cap.centerx, cap.y + (20 if native else cap.h // 2))))
    if native:
      h = 30
      w = native.get_width() * h // native.get_height()
      if w > cap.w - 16:
        w, h = cap.w - 16, native.get_height() * (cap.w - 16) // native.get_width()
      img = pygame.transform.smoothscale(native, (w, h))
      s.blit(img, img.get_rect(center=(cap.centerx, cap.bottom - 20)))
    # buttons: Hear, Skip, Next
    pygame.draw.rect(s, (0, 170, 160), hear, border_radius=16)
    pygame.draw.rect(s, WHITE, hear, 2, border_radius=16)
    cx, cy = hear.x + 28, hear.centery
    pygame.draw.polygon(s, WHITE, [(cx - 10, cy - 6), (cx - 3, cy - 6), (cx + 6, cy - 13), (cx + 6, cy + 13),
                                   (cx - 3, cy + 6), (cx - 10, cy + 6)])
    for r in (8, 14):
      pygame.draw.arc(s, WHITE, (cx + 4 - r, cy - r, 2 * r, 2 * r), -0.7, 0.7, 2)
    lab = g.font_at(19).render("Hear", True, WHITE)
    s.blit(lab, lab.get_rect(midleft=(hear.x + 52, hear.centery)))
    pygame.draw.rect(s, (90, 100, 140), skip, border_radius=14)
    lab = g.font_at(16).render("Skip", True, WHITE)
    s.blit(lab, lab.get_rect(center=skip.center))
    if self.ready(t):
      pulse = int(4 * math.sin(now * 5))
      r = nxt.inflate(pulse, pulse)
      pygame.draw.rect(s, (60, 180, 90), r, border_radius=16)
      pygame.draw.rect(s, WHITE, r, 2, border_radius=16)
      word = "Start!" if self.k == len(SCENES) - 1 else "Next"
      lab = g.font_at(20).render(word, True, WHITE)
      s.blit(lab, lab.get_rect(midleft=(r.x + 16, r.centery)))
      ax = r.right - 26
      pygame.draw.polygon(s, WHITE, [(ax - 8, r.centery - 12), (ax + 8, r.centery), (ax - 8, r.centery + 12)])
    for k in range(len(SCENES)):                        # where we are in the story
      pygame.draw.circle(s, YELLOW if k == self.k else (120, 130, 170),
                         (a.centerx - 27 + k * 18, skip.y - 12), 5)

  # 1. wake up ------------------------------------------------------------------------
  def wake_clock(self, st):
    r = int(min(st.w, st.h) * 0.14)
    return (int(st.x + st.w * 0.80), int(st.y + st.h * 0.52)), r

  def draw_wake(self, s, st, t, now):
    s.fill((255, 236, 200), st)
    win = pygame.Rect(st.x + st.w * 0.08, st.y + st.h * 0.08, st.w * 0.42, st.h * 0.36)
    sky = _ease(t / 3.0)
    for y in range(win.h):                              # the morning sky brightens
      k = y / max(1, win.h)
      col = tuple(int(a + (b - a) * k) for a, b in zip((120 + 100 * sky, 180 + 50 * sky, 255),
                                                       (255, 190 + 40 * sky, 120 + 60 * sky)))
      pygame.draw.line(s, col, (win.x, win.y + y), (win.right, win.y + y))
    sun_y = win.bottom - win.h * 0.55 * sky
    pygame.draw.circle(s, (255, 200, 40), (int(win.centerx), int(sun_y)), int(win.h * 0.18))
    pygame.draw.rect(s, (130, 80, 50), win, 6)
    pygame.draw.line(s, (130, 80, 50), win.midtop, win.midbottom, 4)
    for side in (0, 1):                                 # curtains
      cx = win.x - 10 if side == 0 else win.right - 14
      pygame.draw.rect(s, (220, 90, 120), (cx, win.y - 8, 24, win.h + 20), border_radius=6)
    floor = st.y + st.h * 0.82
    s.fill((200, 150, 100), (st.x, floor, st.w, st.bottom - floor))
    bed = pygame.Rect(st.x + st.w * 0.06, floor - st.h * 0.22, st.w * 0.56, st.h * 0.22)
    pygame.draw.rect(s, (150, 90, 50), (bed.x, bed.y - st.h * 0.12, st.w * 0.05, bed.h + st.h * 0.12), border_radius=4)
    pygame.draw.rect(s, (90, 150, 230), bed, border_radius=10)
    pygame.draw.rect(s, WHITE, (bed.x + st.w * 0.06, bed.y - 8, st.w * 0.12, 18), border_radius=8)
    stretch = _ease((t - 0.6) / 0.8) * (1 - _ease((t - 2.6) / 0.8))
    ch = st.h * 0.34                                 # sitting up, legs under the blanket
    person(s, bed.x + st.w * 0.15, bed.y + 8 + ch * 0.42, ch, "child", arms_up=stretch)
    pygame.draw.rect(s, (90, 150, 230), (bed.x + st.w * 0.04, bed.y + 4, bed.w - st.w * 0.04, bed.h - 4),
                     border_radius=10)                  # the blanket over the legs
    table = pygame.Rect(0, 0, st.w * 0.24, st.h * 0.06)
    c, r = self.wake_clock(st)
    table.midtop = (c[0], c[1] + r + 4)
    pygame.draw.rect(s, (150, 90, 50), table, border_radius=4)
    pygame.draw.rect(s, (150, 90, 50), (table.centerx - 6, table.bottom, 12, floor - table.bottom))
    ring = now - getattr(self, "ring_at", -9) < 1.2
    clock(s, c, r, 7, 0, 3 * math.sin(now * 60) if ring else 0.0)
    if ring:
      for side in (-1, 1):
        for k in range(3):
          a = -math.pi / 2 + side * (0.6 + 0.25 * k)
          p0 = (c[0] + math.cos(a) * r * 1.25, c[1] + math.sin(a) * r * 1.25)
          p1 = (c[0] + math.cos(a) * r * 1.55, c[1] + math.sin(a) * r * 1.55)
          pygame.draw.line(s, (230, 70, 60), p0, p1, 3)
    lab = self.g.font_at(20).render("7:00", True, INK)
    s.blit(lab, lab.get_rect(midtop=(c[0], table.bottom + 4)))

  # 2. pack the bag -------------------------------------------------------------------
  def draw_pack(self, s, st, t, now):
    s.fill((235, 245, 255), st)
    items, bag = self.items(st)
    table_y = st.y + st.h * 0.62
    s.fill((170, 110, 60), (st.x, table_y, st.w, st.bottom - table_y))
    pygame.draw.rect(s, (190, 130, 75), (st.x + 4, table_y - 4, st.w - 8, st.w * 0.17), border_radius=8)
    full = len(self.packed) == 5
    # the bag
    pygame.draw.rect(s, (200, 50, 50), bag, border_radius=int(bag.w * 0.2))
    pygame.draw.rect(s, (150, 30, 30), bag, 3, border_radius=int(bag.w * 0.2))
    pocket = pygame.Rect(0, 0, bag.w * 0.6, bag.h * 0.3)
    pocket.midbottom = (bag.centerx, bag.bottom - bag.h * 0.08)
    pygame.draw.rect(s, (230, 80, 70), pocket, border_radius=10)
    flap = pygame.Rect(bag.x, bag.y - bag.h * (0.02 if full else 0.16), bag.w, bag.h * 0.24)
    pygame.draw.rect(s, (170, 40, 40), flap, border_radius=int(bag.w * 0.18))
    pygame.draw.arc(s, (120, 30, 30), (bag.centerx - bag.w * 0.2, bag.y - bag.h * 0.30, bag.w * 0.4, bag.h * 0.3),
                    0, math.pi, 4)
    mouth = (bag.centerx, bag.y + bag.h * 0.1)
    gone = dict(self.packed)
    for i, r in enumerate(items):
      k = 0.0 if i not in gone else min(1.0, (now - gone[i]) / 0.45)
      if k >= 1.0:
        continue
      cx = r.centerx + (mouth[0] - r.centerx) * _ease(k)
      cy = r.centery + (mouth[1] - r.centery) * _ease(k) - math.sin(math.pi * k) * st.h * 0.18
      sc = 1.0 - 0.5 * k
      rr = pygame.Rect(0, 0, r.w * sc, r.h * sc)
      rr.center = (cx, cy)
      if i < 3:
        col = [(70, 130, 230), (60, 180, 110), (250, 150, 50)][i]
        pygame.draw.rect(s, col, rr, border_radius=4)
        pygame.draw.rect(s, WHITE, rr.inflate(-rr.w * 0.3, -rr.h * 0.6).move(0, -rr.h * 0.15), border_radius=2)
        pygame.draw.line(s, (30, 40, 80), rr.topleft, rr.bottomleft, max(2, int(rr.w * 0.08)))
      else:
        pygame.draw.rect(s, (250, 200, 40), rr, border_radius=3)
        pygame.draw.rect(s, (240, 130, 150), (rr.x, rr.y, rr.w * 0.12, rr.h), border_radius=3)
        tip = [(rr.right, rr.y), (rr.right + rr.h * 1.2, rr.centery), (rr.right, rr.bottom)]
        pygame.draw.polygon(s, (240, 210, 160), tip)
        pygame.draw.circle(s, INK, (int(rr.right + rr.h * 1.1), int(rr.centery)), max(1, int(rr.h * 0.2)))
      if i not in gone:                               # a soft glow: tap me
        glow = int(2 + 2 * math.sin(now * 5 + i))
        pygame.draw.rect(s, YELLOW, rr.inflate(8, 8), glow, border_radius=6)
    n = len(self.packed)
    if n:
      f = self.g.font_at(46)
      num = f.render(str(n), True, (200, 50, 50))
      bump = 1.0 + 0.3 * max(0.0, 1 - (now - self.packed[-1][1]) / 0.3)
      num = pygame.transform.rotozoom(num, 0, bump)
      s.blit(num, num.get_rect(center=(bag.centerx, bag.y - bag.h * 0.62)))
    if full:
      eq = self.g.font_at(34).render("3 + 2 = 5", True, (40, 120, 60))
      s.blit(eq, eq.get_rect(center=(st.x + st.w * 0.30, st.y + st.h * 0.22)))

  # 3. off to school with Mother ------------------------------------------------------
  def draw_walk(self, s, st, t, now):
    ground = st.y + st.h * 0.78
    pygame.draw.circle(s, (255, 210, 60), (int(st.x + st.w * 0.56), int(st.y + st.h * 0.12)), int(st.h * 0.06))
    for k in range(4):                                   # far trees
      tx = st.x + st.w * (0.30 + 0.16 * k)
      pygame.draw.rect(s, (120, 80, 40), (tx - 3, ground - st.h * 0.20, 6, st.h * 0.20))
      pygame.draw.circle(s, (70, 160, 80), (int(tx), int(ground - st.h * 0.22)), int(st.h * 0.07))
    s.fill((205, 205, 210), (st.x, ground, st.w, st.h * 0.08))       # the footpath
    s.fill((120, 200, 110), (st.x, ground + st.h * 0.08, st.w, st.bottom))
    road0, road1 = st.x + st.w * 0.50, st.x + st.w * 0.70            # the road crosses the path
    s.fill((70, 70, 80), (road0, ground, road1 - road0, st.bottom - ground))
    stripes = 5
    for k in range(stripes):                             # the zebra crossing
      sw = (road1 - road0) / (2 * stripes - 1)
      s.fill(WHITE, (road0 + 2 * k * sw, ground + 2, sw, st.h * 0.07))
    # the house on the left, its door opening
    house = pygame.Rect(st.x + st.w * 0.02, ground - st.h * 0.46, st.w * 0.30, st.h * 0.46)
    pygame.draw.rect(s, (250, 220, 150), house)
    pygame.draw.polygon(s, (200, 70, 50), [(house.x - 8, house.y), (house.right + 8, house.y),
                                           (house.centerx, house.y - st.h * 0.18)])
    door = pygame.Rect(0, 0, house.w * 0.30, house.h * 0.55)
    door.midbottom = (house.centerx + house.w * 0.12, house.bottom)
    pygame.draw.rect(s, (60, 40, 30), door)
    open_k = _ease(t / WALK_DOOR)
    leaf = pygame.Rect(door.x, door.y, max(2, door.w * (1 - 0.8 * open_k)), door.h)
    pygame.draw.rect(s, (150, 90, 50), leaf)
    pygame.draw.rect(s, (110, 60, 30), leaf, 2)
    pygame.draw.rect(s, (150, 210, 250), (house.x + house.w * 0.10, house.y + house.h * 0.2, house.w * 0.24, house.h * 0.22))
    # the school on the right with the flag
    school = pygame.Rect(st.x + st.w * 0.74, ground - st.h * 0.42, st.w * 0.26, st.h * 0.42)
    pygame.draw.rect(s, (240, 200, 120), school)
    pygame.draw.rect(s, (180, 80, 60), (school.x - 4, school.y - st.h * 0.05, school.w + 8, st.h * 0.06))
    sign = self.g.font_at(max(11, int(st.w * 0.035))).render("SCHOOL", True, (180, 60, 40))
    s.blit(sign, sign.get_rect(center=(school.centerx, school.y + st.h * 0.06)))
    pole_x = school.x + school.w * 0.2
    pygame.draw.line(s, (90, 90, 90), (pole_x, school.y - st.h * 0.05), (pole_x, school.y - st.h * 0.22), 2)
    fy = school.y - st.h * 0.22
    for k, col in enumerate(((255, 153, 51), WHITE, (19, 136, 8))):
      s.fill(col, (pole_x + 1, fy + k * st.h * 0.016, st.w * 0.07, st.h * 0.016))
    pygame.draw.circle(s, (0, 0, 128), (int(pole_x + 1 + st.w * 0.035), int(fy + st.h * 0.024)), max(1, int(st.h * 0.007)))
    # the traffic light for walkers: red man, then the green man
    green = t >= WALK_LOOK - 0.2
    lp = pygame.Rect(road1 + 4, ground - st.h * 0.30, st.w * 0.05, st.h * 0.10)
    pygame.draw.line(s, (60, 60, 60), (lp.centerx, lp.bottom), (lp.centerx, ground), 3)
    pygame.draw.rect(s, (40, 40, 40), lp, border_radius=4)
    pygame.draw.circle(s, (230, 40, 40) if not green else (90, 30, 30), (lp.centerx, int(lp.y + lp.h * 0.28)), int(lp.w * 0.32))
    pygame.draw.circle(s, (40, 220, 90) if green else (20, 70, 30), (lp.centerx, int(lp.y + lp.h * 0.72)), int(lp.w * 0.32))
    # Mother and the child walking hand in hand
    x_door, x_stop, x_gate = door.centerx, road0 - st.w * 0.06, school.x + st.w * 0.02
    if t < WALK_DOOR:
      x, walking = x_door, False
    elif t < WALK_TO_ROAD:
      x, walking = x_door + (x_stop - x_door) * _ease((t - WALK_DOOR) / (WALK_TO_ROAD - WALK_DOOR)), True
    elif t < WALK_LOOK:
      x, walking = x_stop, False
    else:
      x, walking = x_stop + (x_gate - x_stop) * _ease((t - WALK_LOOK) / (WALK_CROSS - WALK_LOOK)), t < WALK_CROSS
    look = 0
    if WALK_TO_ROAD + 0.2 <= t < WALK_LOOK - 0.2:      # right, left, right again
      look = [1, -1, 1][min(2, int((t - WALK_TO_ROAD - 0.2) / ((WALK_LOOK - WALK_TO_ROAD - 0.4) / 3)))]
    foot = ground + st.h * 0.05
    hm = st.h * 0.42
    _mr, ml = person(s, x - st.w * 0.03, foot, hm, "mother", t, walking, look)
    cr, _cl = person(s, x + st.w * 0.05, foot, hm * 0.62, "child", t + 0.3, walking, look)
    pygame.draw.line(s, SKIN, _mr, _cl, max(2, int(hm * 0.035)))    # holding hands
    if look:                                            # the arrow shows where they look
      ax = x + st.w * 0.01
      ay = foot - hm * 1.12
      d = look * st.w * 0.07
      pygame.draw.line(s, YELLOW, (ax - d * 0.2, ay), (ax + d, ay), 5)
      pygame.draw.polygon(s, YELLOW, [(ax + d * 1.35, ay), (ax + d, ay - 9), (ax + d, ay + 9)])

  # 4. the classroom ------------------------------------------------------------------
  def draw_class(self, s, st, t, now):
    s.fill((200, 235, 210), st)
    floor = st.y + st.h * 0.80
    s.fill((180, 140, 100), (st.x, floor, st.w, st.bottom - floor))
    board = pygame.Rect(st.x + st.w * 0.10, st.y + st.h * 0.08, st.w * 0.80, st.h * 0.42)
    pygame.draw.rect(s, (150, 100, 60), board.inflate(14, 14), border_radius=6)
    pygame.draw.rect(s, (40, 90, 60), board)
    chalk = (245, 245, 235)
    f = self.g.font_at(max(16, int(board.h * 0.22)))
    shown = int(t / 0.35)                                 # the numbers appear as if written
    nums = "1 2 3 4 5"
    line = f.render(nums[:max(0, shown * 2)], True, chalk)
    s.blit(line, line.get_rect(midleft=(board.x + board.w * 0.08, board.y + board.h * 0.3)))
    if shown >= 6:
      eq = f.render("3 + 2 = 5", True, (255, 230, 120))
      s.blit(eq, eq.get_rect(midleft=(board.x + board.w * 0.08, board.y + board.h * 0.68)))
      dm = pygame.Rect(0, 0, board.h * 0.24, board.h * 0.48)            # a domino on the board
      dm.center = (board.right - board.w * 0.12, board.y + board.h * 0.70)
      pygame.draw.rect(s, chalk, dm, 3, border_radius=6)
      pygame.draw.line(s, chalk, dm.midleft, dm.midright, 2)
      for (fx, fy) in ((0.3, 0.12), (0.7, 0.38), (0.5, 0.62), (0.3, 0.82), (0.7, 0.82)):
        pygame.draw.circle(s, chalk, (int(dm.x + dm.w * fx), int(dm.y + dm.h * fy)), max(2, int(dm.w * 0.08)))
    person(s, st.x + st.w * 0.86, floor + 2, st.h * 0.44, "teacher", t, False, -1,
           arms_up=0.5 + 0.2 * math.sin(now * 3))
    for k in range(3):                                   # desks, the child at the front one
      dx = st.x + st.w * (0.18 + 0.27 * k)
      if k == 1:
        person(s, dx, floor - st.h * 0.02, st.h * 0.30, "child", t, False, 0,
               arms_up=max(0.0, math.sin(now * 4)) * 0.8)
      pygame.draw.rect(s, (150, 95, 55), (dx - st.w * 0.11, floor - st.h * 0.13, st.w * 0.22, st.h * 0.04), border_radius=3)
      for side in (-1, 1):
        pygame.draw.line(s, (120, 75, 40), (dx + side * st.w * 0.09, floor - st.h * 0.09), (dx + side * st.w * 0.09, floor), 4)
