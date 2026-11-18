"""Maths Play: the whole NCERT Class 1-7 maths syllabus, learned with dominoes.

The questions come from maths_bank.py (CHAPTERS: every class's chapters and the
kinds of question in them; 60 generators). This file is the screen: a class +
chapter picker, the question with its picture (scene_<name>), up to four big
answer buttons (numbers or words), the sum and its breakdown into adding after
the answer, and the falling-domino cascades with running totals.

Every operation is shown as adding, the way arithmetic is built:
  take away = adding a negative, times = adding again and again,
  sharing = taking away again and again.

The voice asks in the child's language (English, Hindi or Bengali). A wrong tap
shakes and gives a hint; after two tries the answer and its reason are shown.
Each chapter has three steps of difficulty: five right first time in a row moves
up a step, three misses in a row moves one down. Stars count right answers per
chapter; ten earn the chapter's gold star. A wrong tap is just a lesson.
"""

import datetime
import math
import random
import re
import time

import pygame

import maths_bank as mb
import modes
import schoolday
import stratos_track
from maths_bank import add_all, factor_pair, is_prime, num

WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
GREEN = (60, 210, 110)
RED = (240, 70, 80)
INK = (40, 40, 70)
ANTI = (70, 140, 255)         # anti-dominoes (negative numbers)
SHIELD = (120, 230, 255)
LADDOO = (255, 165, 40)
PAPER = (255, 250, 230)
CLASSES = 7
STEP_UP_RUN = 5          # right first time in a row to make the chapter harder
NEXT_AFTER = 3.4         # s after a right answer before the next question (at the least)
NATIVE_LINE = 28         # px the picture moves down for the Hindi / Bangla line of a question
SQUISH_SECS = 0.45      # a tapped answer button squishes and springs back
STAR_SECS = 0.9          # gold stars fly out of a right answer
SPEECH_GAP = 0.4        # s of quiet after the spoken sentence before the next question
CASCADE_STEP = 0.32      # s between falling dominoes in the cascade
CHAPTER_STAR = 10        # right answers that earn a chapter its gold star
MIX = -1                 # "chapter" index for mixed practice of a whole class
TILE_COLOURS = [(255, 120, 90), (90, 170, 255), (120, 210, 120), (255, 190, 60),
                (190, 130, 255), (255, 120, 190), (60, 200, 200), (240, 150, 60)]
SHAPE_COLOURS = {"Circle": (255, 120, 90), "Triangle": (90, 170, 255), "Square": (120, 210, 120),
                 "Rectangle": (255, 190, 60), "Pentagon": (190, 130, 255), "Hexagon": (255, 120, 190),
                 "Oval": (60, 200, 200), "Star": (255, 204, 0)}

PRAISE = [("Yes!", "शाबाश!", "দারুণ!"), ("Well done!", "बहुत अच्छे!", "খুব ভালো!"),
          ("Super!", "बढ़िया!", "চমৎকার!"), ("You got it!", "सही जवाब!", "ঠিক উত্তর!")]
TRY_AGAIN = ("Not {x}. Try again!", "{x} नहीं। फिर से कोशिश करो!", "{x} নয়। আবার চেষ্টা করো!")
TRY_OTHER = ("Look again. Try the other one!", "ध्यान से देखो। दूसरा वाला चुनो!",
             "আবার দেখো। অন্যটা বেছে নাও!")
SHOW = ("The answer is {c}.", "सही जवाब है {c}।", "ঠিক উত্তর {c}।")
HARDER = ("Great! Now a little harder!", "बहुत बढ़िया! अब थोड़ा कठिन!", "দারুণ! এবার একটু কঠিন!")
STAR = ("You earned the {n} star!", "तुमने {n} का सितारा जीता!", "তুমি {n}-এর তারা জিতলে!")
START = ("Let's play with numbers! Pick your class, then a chapter.",
         "चलो संख्याओं से खेलें! अपनी कक्षा चुनो, फिर एक अध्याय।",
         "চলো সংখ্যা নিয়ে খেলি! তোমার শ্রেণি বেছে নাও, তারপর একটা অধ্যায়।")
CHOSEN = ("Class {c}: {n}.", "कक्षा {c}: {n}।", "শ্রেণি {c}: {n}।")
MIX_NAME = ("Mixed practice", "मिली-जुली अभ्यास", "মিশ্র অনুশীলন")
PICK = ("Pick your class and a chapter", "अपनी कक्षा और अध्याय चुनो", "তোমার শ্রেণি আর অধ্যায় বেছে নাও")


def fmt(line, **kw):
  return tuple(s.format(**kw) for s in line)


# ---------------------------------------------------------------- dominoes and helpers
_SPOTS = {
    0: [], 1: [(0.5, 0.5)], 2: [(0.27, 0.27), (0.73, 0.73)],
    3: [(0.25, 0.25), (0.5, 0.5), (0.75, 0.75)],
    4: [(0.27, 0.27), (0.73, 0.27), (0.27, 0.73), (0.73, 0.73)],
    5: [(0.25, 0.25), (0.75, 0.25), (0.5, 0.5), (0.25, 0.75), (0.75, 0.75)],
    6: [(0.27, 0.22), (0.73, 0.22), (0.27, 0.5), (0.73, 0.5), (0.27, 0.78), (0.73, 0.78)],
    7: [(0.22, 0.22), (0.5, 0.22), (0.78, 0.22), (0.5, 0.5), (0.22, 0.78), (0.5, 0.78),
        (0.78, 0.78)],
    8: [(0.22, 0.22), (0.5, 0.22), (0.78, 0.22), (0.22, 0.5), (0.78, 0.5), (0.22, 0.78),
        (0.5, 0.78), (0.78, 0.78)],
    9: [(x, y) for y in (0.22, 0.5, 0.78) for x in (0.22, 0.5, 0.78)],
}


def pip_spots(rect, a, b):
  out = []
  wide = rect.w > rect.h
  for k, n in enumerate((a, b)):
    if n is None:
      continue
    if wide:
      half = pygame.Rect(rect.x + k * rect.w // 2, rect.y, rect.w // 2, rect.h)
    else:
      half = pygame.Rect(rect.x, rect.y + k * rect.h // 2, rect.w, rect.h // 2)
    side = min(half.w, half.h) * 0.86
    ox, oy = half.centerx - side / 2, half.centery - side / 2
    out += [(ox + fx * side, oy + fy * side) for fx, fy in _SPOTS[min(9, n)]]
  return out


def draw_domino(s, rect, a, b, colour=(250, 250, 245), lit=0, pip=INK, font=None):
  """A domino face with pips; the first `lit` pips glow. A half given as None shows "?"."""
  r = max(4, min(rect.w, rect.h) // 6)
  pygame.draw.rect(s, (30, 30, 50), rect.move(3, 4), border_radius=r)
  pygame.draw.rect(s, colour, rect, border_radius=r)
  pygame.draw.rect(s, INK, rect, 3, border_radius=r)
  wide = rect.w > rect.h
  if wide:
    pygame.draw.line(s, INK, (rect.centerx, rect.y + 6), (rect.centerx, rect.bottom - 6), 3)
  else:
    pygame.draw.line(s, INK, (rect.x + 6, rect.centery), (rect.right - 6, rect.centery), 3)
  pr = max(2, int(min(rect.w, rect.h) * (0.07 if max(a or 0, b or 0) <= 6 else 0.055)))
  for i, (x, y) in enumerate(pip_spots(rect, a, b)):
    if i < lit:
      pygame.draw.circle(s, YELLOW, (int(x), int(y)), pr + 3)
      pygame.draw.circle(s, (230, 90, 30), (int(x), int(y)), pr)
    else:
      pygame.draw.circle(s, pip, (int(x), int(y)), pr)
  if font is not None:
    for k, n in enumerate((a, b)):
      if n is None:
        c = ((rect.x + rect.w * (0.25 + 0.5 * k), rect.centery) if wide
             else (rect.centerx, rect.y + rect.h * (0.25 + 0.5 * k)))
        t = font.render("?", True, (230, 90, 30))
        s.blit(t, t.get_rect(center=(int(c[0]), int(c[1]))))


def fall_blit(s, surf, foot, fall):
  """Blits an upright piece standing on foot (bottom centre), tipped right by fall 0..1."""
  if fall <= 0:
    s.blit(surf, surf.get_rect(midbottom=foot))
    return
  w, h = surf.get_size()
  ang = math.radians(86 * min(1.0, fall))
  rot = pygame.transform.rotate(surf, -math.degrees(ang))
  px, py = foot[0] + w / 2, foot[1]
  cx = px + (h / 2) * math.sin(ang) - (w / 2) * math.cos(ang)
  cy = py - (h / 2) * math.cos(ang) - (w / 2) * math.sin(ang)
  s.blit(rot, rot.get_rect(center=(int(cx), int(cy))))


_SMALL = {}


def small_domino(h, colour, label=None, font=None, anti=False):
  key = (h, colour, label, anti)
  surf = _SMALL.get(key)
  if surf is None:
    if len(_SMALL) > 300:
      _SMALL.clear()
    w = max(8, h // 2 if label is not None else h // 3)
    surf = pygame.Surface((w, h), pygame.SRCALPHA)
    if anti:
      pygame.draw.rect(surf, (*ANTI, 150), (0, 0, w, h), border_radius=4)
      pygame.draw.rect(surf, (200, 230, 255, 230), (0, 0, w, h), 2, border_radius=4)
    else:
      dark = tuple(int(c * 0.55) for c in colour)
      pygame.draw.rect(surf, dark, (0, 0, w, h), border_radius=4)
      pygame.draw.rect(surf, colour, (1, 1, w - 2, h - 2), border_radius=4)
    if label is not None and font is not None:
      t = font.render(label, True, WHITE)
      if t.get_width() > w - 2:
        t = pygame.transform.smoothscale(t, (w - 2, max(2, int(t.get_height() * (w - 2) / t.get_width()))))
      surf.blit(t, t.get_rect(center=(w // 2, h // 2)))
    else:
      pygame.draw.line(surf, WHITE, (2, h // 2), (w - 3, h // 2), 1)
      pygame.draw.circle(surf, WHITE, (w // 2, h // 4), max(1, w // 6))
      pygame.draw.circle(surf, WHITE, (w // 2, 3 * h // 4), max(1, w // 6))
    _SMALL[key] = surf
  return surf


def face_surface(w, h, a, b):
  surf = pygame.Surface((w + 4, h + 5), pygame.SRCALPHA)
  draw_domino(surf, pygame.Rect(0, 0, w, h), a, b)
  return surf


def draw_laddoo(s, centre, r):
  pygame.draw.circle(s, (200, 110, 20), centre, r)
  pygame.draw.circle(s, LADDOO, (centre[0] - 1, centre[1] - 1), r - 2)
  pygame.draw.circle(s, (255, 220, 140), (centre[0] - r // 3, centre[1] - r // 3), max(1, r // 4))


def draw_friend(s, centre, r, colour):
  x, y = centre
  pygame.draw.circle(s, (240, 190, 140), (x, y), r)
  pygame.draw.circle(s, INK, (x - r // 3, y - r // 5), max(2, r // 8))
  pygame.draw.circle(s, INK, (x + r // 3, y - r // 5), max(2, r // 8))
  pygame.draw.arc(s, INK, (x - r // 2, y - r // 4, r, r * 2 // 3), math.pi * 1.1, math.pi * 1.9, 2)
  pygame.draw.arc(s, colour, (x - r - 2, y - r - 4, 2 * r + 4, 2 * r), 0, math.pi, max(3, r // 3))


def draw_shield(s, centre, r, colour=SHIELD, glow=0.0):
  x, y = centre
  pts = [(x - r, y - r * 0.8), (x, y - r * 1.1), (x + r, y - r * 0.8), (x + r * 0.85, y + r * 0.2),
         (x, y + r * 1.15), (x - r * 0.85, y + r * 0.2)]
  if glow > 0:
    halo = pygame.Surface((r * 4, r * 4), pygame.SRCALPHA)
    pygame.draw.circle(halo, (*colour, int(90 * glow)), (r * 2, r * 2), int(r * 1.9))
    s.blit(halo, (x - r * 2, y - r * 2))
  pygame.draw.polygon(s, colour, pts)
  pygame.draw.polygon(s, WHITE, pts, 3)


def shape_points(name, rect):
  """Outline points of a flat shape inside rect (None for round shapes)."""
  cx, cy = rect.center
  r = min(rect.w, rect.h) / 2

  def poly(n, rot=-90, rr=r):
    return [(cx + rr * math.cos(math.radians(rot + 360 * k / n)), cy + rr * math.sin(math.radians(rot + 360 * k / n)))
            for k in range(n)]
  if name == "Triangle":
    return poly(3, rr=r * 1.05)
  if name == "Square":
    return poly(4, rot=45, rr=r * 1.1)
  if name == "Rectangle":
    w, h = r * 1.8, r * 1.0
    return [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2)]
  if name == "Pentagon":
    return poly(5)
  if name == "Hexagon":
    return poly(6, rot=0)
  if name == "Star":
    return [(cx + (r if k % 2 == 0 else r * 0.45) * math.cos(math.radians(-90 + 36 * k)),
             cy + (r if k % 2 == 0 else r * 0.45) * math.sin(math.radians(-90 + 36 * k))) for k in range(10)]
  return None


def draw_shape(s, name, rect, colour=None, width=0):
  colour = colour or SHAPE_COLOURS.get(name, (255, 190, 60))
  pts = shape_points(name, rect)
  if name == "Circle":
    r = min(rect.w, rect.h) // 2
    pygame.draw.circle(s, colour, rect.center, r, width)
    pygame.draw.circle(s, WHITE, rect.center, r, 3)
  elif name == "Oval":
    e = pygame.Rect(0, 0, rect.w, int(rect.h * 0.62))
    e.center = rect.center
    pygame.draw.ellipse(s, colour, e, width)
    pygame.draw.ellipse(s, WHITE, e, 3)
  elif pts:
    pygame.draw.polygon(s, colour, pts, width)
    pygame.draw.polygon(s, WHITE, pts, 3)


def dashed(s, colour, a, b, dash=8, width=2):
  dx, dy = b[0] - a[0], b[1] - a[1]
  length = math.hypot(dx, dy) or 1
  n = max(2, int(length / dash))
  for k in range(0, n, 2):
    p = (a[0] + dx * k / n, a[1] + dy * k / n)
    q = (a[0] + dx * min(n, k + 1) / n, a[1] + dy * min(n, k + 1) / n)
    pygame.draw.line(s, colour, p, q, width)


def wrap(font, text, max_w):
  words, lines, cur = text.split(), [], ""
  for w in words:
    t = (cur + " " + w).strip()
    if font.size(t)[0] <= max_w or not cur:
      cur = t
    else:
      lines.append(cur)
      cur = w
  if cur:
    lines.append(cur)
  return lines


def render_expr(g, text, size, colour=WHITE, max_w=None):
  """Text with powers written small and raised: "2^4" shows a little 4 up high."""
  parts = re.split(r"\^(\d+)", text)
  big, small = g.font_at(size), g.font_at(max(10, size * 3 // 5))
  pieces = [(small if i % 2 else big).render(p, True, colour) for i, p in enumerate(parts) if p]
  w = sum(p.get_width() for p in pieces) or 1
  h = big.get_height()
  surf = pygame.Surface((w, h), pygame.SRCALPHA)
  x = 0
  for piece in pieces:
    surf.blit(piece, (x, 0))
    x += piece.get_width()
  if max_w and surf.get_width() > max_w:
    surf = pygame.transform.smoothscale(surf, (max_w, max(2, int(h * max_w / surf.get_width()))))
  return surf


# ---------------------------------------------------------------- the game
class MathsGame:
  """Maths Play; draws inside the play area like Find it! and Cross the Road."""

  def __init__(self, game):
    self.g = game
    self.q = None
    self._cascade = []
    self.picker_cls = None
    self.wrong, self.shake = set(), {}
    self.solved_at = self.revealed_at = self.level_up_at = None
    self.ask_after = None
    self.badge = None
    d = self.data
    self.picking = not d["chosen"]
    game.banner_override = "MATHS PLAY"
    hint = getattr(game, "maths_open_class", None)   # from a Class Pavilion's console
    game.maths_open_class = None
    if hint:
      self.picking = True
      self.picker_cls = hint
    elif self.picking:
      self.picker_cls = d["cls"]
    self.school = None
    if schoolday.due(game.progress):                 # once a day: getting ready for school
      self.school = schoolday.SchoolDay(game, self.area)
      game.progress.data["school_day"] = datetime.date.today().isoformat()
      game.progress.save()
    else:
      self.begin()

  def begin(self):
    """Maths Play proper: the class picker or the first question."""
    self.school = None
    if self.picking:
      self.say(START)
    else:
      self.new_question()

  # ------------------------------------------------------------ progress
  @property
  def data(self):
    d = self.g.progress.data.setdefault("maths", {})
    for k, v in (("cls", 1), ("ch", 0), ("chosen", False), ("right", 0), ("asked", 0), ("run", 0),
                 ("miss", 0), ("best", 1), ("solved", 0)):
      d.setdefault(k, v)
    d.setdefault("diff", {})
    d.setdefault("stars", {})
    d["cls"] = max(1, min(CLASSES, d["cls"]))
    if d["ch"] != MIX and d["ch"] >= len(mb.CHAPTERS[d["cls"]]):
      d["ch"] = 0
    return d

  @property
  def key(self):
    return f"{self.data['cls']}-{self.data['ch']}"

  def chapter_name(self, cls=None, ch=None):
    d = self.data
    cls = d["cls"] if cls is None else cls
    ch = d["ch"] if ch is None else ch
    if ch == MIX:
      return MIX_NAME
    return mb.CHAPTERS[cls][ch][0]

  def kinds(self):
    d = self.data
    chs = mb.CHAPTERS[d["cls"]]
    if d["ch"] == MIX:
      return sorted({k for _n, ks in chs for k in ks})
    return chs[d["ch"]][1]

  def say(self, line, extra=None):
    en, hi, bn = line
    if extra:
      en, hi, bn = f"{extra[0]} {en}", f"{extra[1]} {hi}", f"{extra[2]} {bn}"
    native = {"hi": hi, "bn": bn}.get(self.g.lang)
    self.g.say(en, native)

  # ------------------------------------------------------------ questions
  def new_question(self, lead=None):
    g = self.g
    d = self.data
    # A different kind of question from the last few (not just the last one), so sums don't repeat in a row.
    kind = modes.fresh_pick(g, "maths:" + str(self.key), self.kinds(), keep=3)
    self.q = mb.make(kind, d["diff"].get(self.key, 0))
    self.wrong, self.shake = set(), {}
    self.pressed = {}
    self.solved_at = self.revealed_at = self.level_up_at = None
    self.badge = None
    self.asked_at = time.time()
    stratos_track.track("level_start", level=f"maths/{self.key}")   # analytics: a question starts
    self._lit = 0
    self._cascade = []
    self._fired = set()
    self._rh = self._ro = None
    g.particles.texts = []
    g.banner_override = "MATHS PLAY"
    g.announced_at = time.time()
    self.ask_after = None
    self._quiet_at = None
    self.say(self.q["ask"], lead)

  def next_button(self):
    """The top row's Next: the story's next picture, or the next question."""
    if self.school is not None:
      self.school.next()
      if self.school.done:
        self.begin()
      return
    self.new_question()

  def ask(self):
    if self.school is not None:
      return
    if self.picking or not self.q:
      self.say(START)
    else:
      self.say(self.q["ask"])

  def choose(self, cls, ch):
    d = self.data
    d["cls"], d["ch"], d["chosen"] = cls, ch, True
    d["run"] = d["miss"] = 0
    self.g.progress.save()
    self.picking = False
    self.g.sfx.play("switch")
    name = self.chapter_name(cls, ch)
    self.q = None
    self.new_question(lead=tuple(CHOSEN[k].format(c=cls, n=name[k]) for k in range(3)))

  @property
  def shown(self):
    return self.solved_at is not None or self.revealed_at is not None

  @property
  def done_at(self):
    return self.solved_at if self.solved_at is not None else self.revealed_at

  def speak_label(self, label):
    sp = (self.q.get("speak") or {}).get(label)
    return sp if sp else (label, label, label)

  # ------------------------------------------------------------ layout
  def area(self):
    import modes
    return modes.g_area()

  def answer_rects(self, bottom, a):
    """Up to 4 answer buttons: one row for short answers, 2 x 2 for long ones."""
    q = self.q
    n = len(q["choices"])
    longest = max(len(c) for c in q["choices"])
    two_rows = n > 2 and (longest > 6 or a.w < 330)
    gap = 12
    if two_rows:
      per = 2
      bw = min(230, (a.w - 16 - gap) // 2)
      bh = int(min(60, a.h * 0.085))
    else:
      per = n
      bw = min(130 if n > 2 else 180, (a.w - 16 - (n - 1) * gap) // n)
      bh = int(min(84, a.h * 0.12))
    rows = math.ceil(n / per)
    top = bottom - rows * bh - (rows - 1) * 10
    out = []
    for i in range(n):
      r, c = divmod(i, per)
      in_row = min(per, n - r * per)
      row_w = in_row * bw + (in_row - 1) * gap
      out.append(pygame.Rect(a.centerx - row_w // 2 + c * (bw + gap), top + r * (bh + 10), bw, bh))
    return out, top

  def layout(self):
    a = self.area()
    lay = {"area": a}
    foot_h = 46
    lay["foot"] = pygame.Rect(a.x + 8, a.bottom - foot_h - 6, a.w - 16, foot_h)
    lay["chapter_btn"] = pygame.Rect(lay["foot"].x, lay["foot"].y + 3, min(300, int(lay["foot"].w * 0.68)),
                                     foot_h - 6)
    top = lay["foot"].y - 12
    if self.q and not self.q.get("tap2"):
      lay["answers"], top = self.answer_rects(top, a)
    else:
      lay["answers"] = []
    lay["prompt_y"] = a.y + 12
    lay["eq_y"] = top - 26
    lay["steps_y"] = top - 60
    scene_top = a.y + 92 + (NATIVE_LINE if self.native_ask() else 0)
    lay["scene"] = pygame.Rect(a.x + 10, scene_top, a.w - 20, max(60, top - 82 - scene_top))
    return lay

  def domino_rects(self, lay):
    sc = lay["scene"].copy()
    sc.h += 60
    h = int(min(sc.h * 0.85, 320))
    w = h // 2
    gap = max(40, sc.w // 6)
    return [pygame.Rect(sc.centerx - gap // 2 - w, sc.centery - h // 2, w, h),
            pygame.Rect(sc.centerx + gap // 2, sc.centery - h // 2, w, h)]

  # ------------------------------------------------------------ the class + chapter picker
  def picker_layout(self):
    a = self.area()
    cls = self.picker_cls or self.data["cls"]
    chips_y = a.y + 54
    cw = min(56, (a.w - 24) // CLASSES - 6)
    x0 = a.centerx - (CLASSES * (cw + 6) - 6) // 2
    chips = [pygame.Rect(x0 + i * (cw + 6), chips_y, cw, 44) for i in range(CLASSES)]
    chapters = list(range(len(mb.CHAPTERS[cls]))) + [MIX]
    cols = 2 if a.w < 700 else 3
    rows = math.ceil(len(chapters) / cols)
    top, bottom = chips_y + 58, a.bottom - 64
    ch_h = max(34, min(62, (bottom - top) // rows - 8))
    cell_w = (a.w - 24 - (cols - 1) * 8) // cols
    cells = []
    for i, ch in enumerate(chapters):
      r, c = divmod(i, cols)
      cells.append((pygame.Rect(a.x + 12 + c * (cell_w + 8), top + r * (ch_h + 8), cell_w, ch_h), ch))
    back = pygame.Rect(0, 0, 150, 46)
    back.midbottom = (a.centerx, a.bottom - 10)
    return cls, chips, cells, back

  def picker_press(self, pos):
    cls, chips, cells, back = self.picker_layout()
    for i, r in enumerate(chips):
      if r.collidepoint(pos):
        self.picker_cls = i + 1
        self.g.sfx.play("click")
        self.say((f"Class {i + 1}", f"कक्षा {i + 1}", f"শ্রেণি {i + 1}"))
        return
    for r, ch in cells:
      if r.collidepoint(pos):
        self.choose(cls, ch)
        return
    if back.collidepoint(pos) and self.data["chosen"]:
      self.g.sfx.play("click")
      self.picking = False
      if self.q is None:
        self.new_question()
      else:
        self.ask()

  def draw_picker(self, s, now):
    g = self.g
    a = self.area()
    d = self.data
    cls, chips, cells, back = self.picker_layout()
    k = {"hi": 1, "bn": 2}.get(g.lang)
    title = self.native_lines(PICK[k], 21, a.w - 20, YELLOW)[:1] if k else []
    if title:
      s.blit(title[0], title[0].get_rect(center=(a.centerx, a.y + 26)))
    else:
      self.text(s, PICK[0], (a.centerx, a.y + 26), 22, YELLOW, a.w - 20)
    f = g.font_at(18)
    for i, r in enumerate(chips):
      on = cls == i + 1
      pygame.draw.rect(s, YELLOW if on else (90, 110, 160), r, border_radius=12)
      pygame.draw.rect(s, WHITE, r, 2, border_radius=12)
      lab = f.render(str(i + 1), True, INK if on else WHITE)
      s.blit(lab, lab.get_rect(center=(r.centerx, r.centery - 5)))
      cl = g.small_font.render("Class", True, INK if on else WHITE)
      s.blit(cl, cl.get_rect(center=(r.centerx, r.bottom - 9)))
    cf = g.font_at(16)
    for r, ch in cells:
      name = self.chapter_name(cls, ch)[0]
      current = d["chosen"] and d["cls"] == cls and d["ch"] == ch
      colour = (255, 140, 70) if ch == MIX else TILE_COLOURS[(ch * 3) % len(TILE_COLOURS)]
      pygame.draw.rect(s, (20, 20, 40), r.move(2, 3), border_radius=12)
      pygame.draw.rect(s, colour, r, border_radius=12)
      pygame.draw.rect(s, YELLOW if current else WHITE, r, 4 if current else 2, border_radius=12)
      native = self.native_lines(self.chapter_name(cls, ch)[k], 14, r.w - 56, (240, 245, 255))[:1] if k else []
      lines = wrap(cf, name, r.w - 56)[:1 if native else 2]
      rows = [cf.render(line, True, WHITE) for line in lines] + native   # English, then Hindi / Bangla
      for n_, lt in enumerate(rows):
        s.blit(lt, lt.get_rect(midleft=(r.x + 10, r.centery + (n_ - (len(rows) - 1) / 2) * 19)))
      stars = d["stars"].get(f"{cls}-{ch}", 0)
      if stars:
        gold = stars >= CHAPTER_STAR
        g.draw_star(s, (r.right - 30, r.centery - (0 if gold else 6)), 13 if gold else 9)
        if not gold:
          st = g.small_font.render(f"{stars}/{CHAPTER_STAR}", True, WHITE)
          s.blit(st, st.get_rect(center=(r.right - 30, r.centery + 12)))
    if d["chosen"]:
      pygame.draw.rect(s, (90, 110, 170), back, border_radius=14)
      pygame.draw.rect(s, WHITE, back, 2, border_radius=14)
      self.text(s, "Back", back.center, 18)

  # ------------------------------------------------------------ input
  def press(self, pos):
    g = self.g
    if self.school is not None:
      self.school.press(pos)
      if self.school.done:
        self.begin()
      return
    if self.picking or not self.q:
      self.picker_press(pos)
      return
    lay = self.layout()
    if lay["chapter_btn"].collidepoint(pos):
      g.sfx.play("click")
      self.picking = True
      self.picker_cls = self.data["cls"]
      return
    if self.shown:
      if time.time() - self.done_at > 0.8:
        g.sfx.play("click")
        self.new_question()
      return
    targets = self.domino_rects(lay) if self.q.get("tap2") else lay["answers"]
    for i, r in enumerate(targets):
      if r.collidepoint(pos) and i not in self.wrong:
        self.answer(i, r)
        return

  def answer(self, i, rect):
    g = self.g
    q = self.q
    d = self.data
    tap2 = q.get("tap2")
    picked = i if tap2 else q["choices"][i]
    self.pressed = {i: time.time()}              # the tapped button squishes and springs back
    if picked == q["c"]:
      if hasattr(self.g.progress, "record_quest_step"):
        self.g.progress.record_quest_step("maths", self.g)
      first = not self.wrong
      self.solved_at = time.time()
      stratos_track.track("level_complete", level=f"maths/{self.key}", first_try=first)   # + seconds
      d["asked"] += 1
      d["solved"] += 1
      if first:
        d["right"] += 1
        d["run"] += 1
        d["miss"] = 0
        d["stars"][self.key] = d["stars"].get(self.key, 0) + 1
      g.sfx.play("chime")
      g.particles.burst(rect.centerx, rect.centery, n=40)
      g.particles.confetti(self.area(), n=90)
      extra = random.choice(PRAISE)
      line = q["explain"]
      diff = d["diff"].get(self.key, 0)
      if first and d["stars"][self.key] == CHAPTER_STAR:
        self.level_up_at = time.time()
        self.badge = ("Chapter star!", self.chapter_name()[0])
        line = tuple(f"{e} {s_}" for e, s_ in zip(line, fmt(STAR, n=self.chapter_name()[0])))
      elif first and d["run"] >= STEP_UP_RUN and diff < 2:
        d["diff"][self.key] = diff + 1
        d["best"] = max(d["best"], d["cls"])
        d["run"] = 0
        self.level_up_at = time.time()
        self.badge = ("Harder!", f"Step {diff + 2} of 3")
        line = tuple(f"{e} {h}" for e, h in zip(line, HARDER))
      self.say(line, extra)
      g.progress.save()
      return
    self.wrong.add(i)
    self.shake[i] = time.time()
    g.sfx.play("tip")
    if len(self.wrong) == 1:
      d["run"] = 0
      d["miss"] += 1
      diff = d["diff"].get(self.key, 0)
      if d["miss"] >= 3 and diff > 0:           # three misses in a row: a gentler step
        d["diff"][self.key] = diff - 1
        d["miss"] = 0
      g.progress.save()
    if tap2:
      self.say(TRY_OTHER)
    elif len(self.wrong) >= 2 or len(q["choices"]) - len(self.wrong) <= 1:
      d["asked"] += 1
      self.revealed_at = time.time()
      stratos_track.track("game_over", level=f"maths/{self.key}")   # answer shown after misses (+ seconds)
      sp = self.speak_label(q["c"])
      self.say(q["explain"], tuple(SHOW[k].format(c=sp[k]) for k in range(3)))
      g.progress.save()
    else:
      sp = self.speak_label(picked)
      self.say(tuple(TRY_AGAIN[k].format(x=sp[k]) for k in range(3)))

  # ------------------------------------------------------------ update
  def update(self, now):
    if self.school is not None:
      return
    if self.picking or not self.q:
      return
    if not self.shown:
      return
    t = now - self.done_at
    if self.solved_at is not None:
      wait = NEXT_AFTER + (1.5 if self.level_up_at else 0.0) + CASCADE_STEP * len(self._cascade)
      if t > wait and self.voice_done(now):        # never cut the sentence off
        self.new_question()
        return
    top = self.q.get("lit_to")
    if top:                                   # count the dots aloud
      k = int(t / 0.16)
      if k > self._lit and self._lit < top:
        self._lit = min(top, k)
        self.g.sfx.play("pop", min(11, self._lit))
    for i, (x, y, label) in enumerate(self._cascade):  # floating running totals
      if i not in self._fired and t >= 0.3 + i * CASCADE_STEP:
        self._fired.add(i)
        self.g.sfx.play("clack", min(i, 11))
        if label:
          self.g.particles.text(x, y, label, YELLOW)

  def voice_done(self, now):
    """True SPEECH_GAP seconds after the spoken sentence has ended."""
    busy = getattr(self.g.speaker, "busy", None)
    if busy and busy():
      self._quiet_at = None
      return False
    if getattr(self, "_quiet_at", None) is None:
      self._quiet_at = now
    return now - self._quiet_at >= SPEECH_GAP

  def native_ask(self):
    """The question in the child's second language (None in English)."""
    k = {"hi": 1, "bn": 2}.get(self.g.lang)
    if not k or not self.q or self.picking or self.school is not None:
      return None
    return self.q["ask"][k]

  def native_lines(self, text, size, max_w, colour):
    """Hindi / Bangla text wrapped into lines no wider than max_w (cached)."""
    if not text:
      return []
    cache = self.__dict__.setdefault("_native_cache", {})
    key = (text, size, max_w, colour, self.g.lang)
    if key not in cache:
      out, cur = [], ""
      for word in text.split(" "):
        trial = (cur + " " + word).strip()
        img = self.g.native_text(trial, size, colour)
        if img is None:
          return []
        if img.get_width() > max_w and cur:
          out.append(self.g.native_text(cur, size, colour))
          cur = word
        else:
          cur = trial
      if cur:
        img = self.g.native_text(cur, size, colour)
        if img.get_width() > max_w:
          img = pygame.transform.smoothscale(img, (max_w, img.get_height() * max_w // img.get_width()))
        out.append(img)
      if len(cache) > 200:
        cache.clear()
      cache[key] = out
    return cache[key]

  def cascade_fall(self, i, now):
    if not self.shown:
      return 0.0
    t = now - self.done_at - 0.3 - i * CASCADE_STEP
    return max(0.0, min(1.0, t / 0.3))

  # ------------------------------------------------------------ drawing
  def draw(self, s, now):
    g = self.g
    a = self.area()
    veil = pygame.Surface(a.size, pygame.SRCALPHA)
    veil.fill((*g.theme["bg"], 215))
    s.blit(veil, a.topleft)
    if self.school is not None:
      self.school.draw(s, now)
      return
    if self.picking or not self.q:
      self.draw_picker(s, now)
      return
    lay = self.layout()
    q = self.q
    font = g.font_at(21)
    native = self.native_ask()
    lines = wrap(font, q["ask"][0], a.w - 30)[:2 if native else 3]
    for n, line in enumerate(lines):
      t = font.render(line, True, YELLOW)
      s.blit(t, t.get_rect(center=(a.centerx, lay["prompt_y"] + 13 + n * 25)))
    y = lay["prompt_y"] + 6 + len(lines) * 25
    for img in self.native_lines(native, 20, a.w - 24, WHITE)[:2]:   # the same in Hindi / Bangla
      s.blit(img, img.get_rect(midtop=(a.centerx, y)))
      y += img.get_height() - 2
    self._cascade = []
    scene = getattr(self, "scene_" + q["scene"], self.scene_expr)
    clip = s.get_clip()
    s.set_clip(lay["scene"].inflate(20, 40).clip(clip))
    scene(s, lay, now)
    s.set_clip(clip)
    if self.shown:
      self.draw_sums(s, lay, now)
    if not q.get("tap2"):
      self.draw_answers(s, lay, now)
    self.draw_footer(s, lay, now)
    if self.level_up_at and now - self.level_up_at < 3.5:
      self.draw_badge(s, lay, now)

  def draw_sums(self, s, lay, now):
    g = self.g
    q = self.q
    a = lay["area"]
    if q["eq"]:
      eq = render_expr(g, q["eq"], 30 if len(q["eq"]) < 22 else 22,
                       GREEN if self.solved_at is not None else WHITE, a.w - 20)
      s.blit(eq, eq.get_rect(center=(a.centerx, lay["eq_y"])))
    steps = q.get("steps")
    if steps and steps != q["eq"]:
      tokens = steps.split(" ")
      k = int((now - self.done_at) / 0.12) + 1
      text = " ".join(tokens[:k])
      f = g.font_at(19)
      lines = wrap(f, text, a.w - 30)[-2:]
      box_h = 26 * len(lines) + 8
      box = pygame.Rect(0, 0, min(a.w - 16, max(f.size(l)[0] for l in lines) + 28), box_h)
      box.center = (a.centerx, lay["steps_y"] - (box_h - 34) // 2)
      pygame.draw.rect(s, (30, 40, 80), box, border_radius=12)
      pygame.draw.rect(s, YELLOW, box, 2, border_radius=12)
      for n, line in enumerate(lines):
        t = f.render(line, True, WHITE)
        s.blit(t, t.get_rect(center=(box.centerx, box.y + 17 + n * 26)))

  def draw_answers(self, s, lay, now):
    g = self.g
    q = self.q
    for i, r in enumerate(lay["answers"]):
      dx = 0
      if i in self.shake and now - self.shake[i] < 0.4:
        dx = int(8 * math.sin((now - self.shake[i]) * 50))
      rr = r.move(dx, 0)
      label = q["choices"][i]
      good = label == q["c"] and self.shown
      if good:
        col = GREEN
      elif i in self.wrong:
        col = RED
      else:
        col = TILE_COLOURS[(i * 3 + len(q["c"])) % len(TILE_COLOURS)]
      if good and self.solved_at is not None:
        p = int(6 * math.sin(now * 8))
        rr = rr.inflate(p, p)
      k = (now - self.pressed[i]) / SQUISH_SECS if i in getattr(self, "pressed", {}) else 1.0
      if k < 1.0:                                  # squish, then a springy bounce back
        sq = -0.14 * math.cos(k * 3 * math.pi) * (1 - k)
        rr = rr.inflate(int(rr.w * sq * 0.6), int(rr.h * sq))
      pygame.draw.rect(s, (20, 20, 40), rr.move(3, 4), border_radius=18)
      pygame.draw.rect(s, col, rr, border_radius=18)
      pygame.draw.rect(s, WHITE, rr, 3, border_radius=18)
      size = 36
      while size > 14 and g.font_at(size).size(label)[0] > rr.w - 14:
        size -= 2
      o = render_expr(g, label, size, INK)
      t = render_expr(g, label, size, WHITE)
      s.blit(o, o.get_rect(center=(rr.centerx + 2, rr.centery + 2)))
      s.blit(t, t.get_rect(center=rr.center))
      if good and self.solved_at is not None and now - self.solved_at < STAR_SECS:
        k = (now - self.solved_at) / STAR_SECS     # a ring of gold stars bursts out
        for n in range(8):
          a = n * math.pi / 4 + k
          dist = rr.w * 0.35 + rr.w * 0.6 * (1 - (1 - k) ** 2)
          g.draw_star(s, (int(rr.centerx + math.cos(a) * dist), int(rr.centery + math.sin(a) * dist * 0.8)),
                      max(3, int(11 * (1 - k))))
      if q["kind"] == "prime" and self.shown:
        v = int(label.replace(",", ""))
        if is_prime(v):
          draw_shield(s, (rr.right - 12, rr.y + 12), 9, glow=0.6)
        else:
          x, y = factor_pair(v)
          sm = g.small_font.render(f"{x} × {y}", True, WHITE)
          s.blit(sm, sm.get_rect(center=(rr.centerx, rr.bottom - 10)))

  def draw_footer(self, s, lay, now):
    g = self.g
    d = self.data
    btn = lay["chapter_btn"]
    pygame.draw.rect(s, (90, 110, 170), btn, border_radius=12)
    pygame.draw.rect(s, WHITE, btn, 2, border_radius=12)
    t = g.font_at(15).render(f"Class {d['cls']}: {self.chapter_name()[0]}", True, WHITE)
    if t.get_width() > btn.w - 16:
      t = pygame.transform.smoothscale(t, (btn.w - 16, t.get_height()))
    s.blit(t, t.get_rect(midleft=(btn.x + 8, btn.centery - 8)))
    k = {"hi": 1, "bn": 2}.get(g.lang)
    sub = self.native_lines(self.chapter_name()[k], 14, btn.w - 16, (220, 230, 255))[:1] if k else []
    sub = sub[0] if sub else g.small_font.render("Tap to change class or chapter", True, (220, 230, 255))
    s.blit(sub, sub.get_rect(midleft=(btn.x + 8, btn.centery + 11)))
    right = lay["foot"].right
    score = g.font_at(19).render(str(d["stars"].get(self.key, 0)), True, YELLOW)
    sr = score.get_rect(midright=(right - 4, lay["foot"].centery - 9))
    s.blit(score, sr)
    g.draw_star(s, (sr.x - 12, sr.centery), 8)
    diff = d["diff"].get(self.key, 0)
    for k in range(3):                         # difficulty: three steps per chapter
      pygame.draw.circle(s, YELLOW if k <= diff else (90, 110, 160), (right - 40 + k * 14, lay["foot"].centery + 12), 5)
    
    # 3-Star Daily Wonder Quests in Footer
    if hasattr(g.progress, "get_daily_quests"):
      q_status = g.progress.get_daily_quests()
      mid_x = (btn.right + right - 60) // 2
      for idx, done in enumerate([q_status["s1"], q_status["s2"], q_status["s3"]]):
        star_x = mid_x - 22 + idx * 22
        star_y = lay["foot"].centery
        g.draw_star(s, (star_x, star_y), 7 if done else 5)

  def draw_badge(self, s, lay, now):
    g = self.g
    a = lay["area"]
    k = min(1.0, (now - self.level_up_at) / 0.4)
    r = pygame.Rect(0, 0, int(300 * k), int(96 * k))
    r.center = (a.centerx, a.y + a.h // 3)
    if r.w < 20 or not self.badge:
      return
    pygame.draw.rect(s, (255, 120, 60), r, border_radius=24)
    pygame.draw.rect(s, WHITE, r, 4, border_radius=24)
    self.text(s, self.badge[0], (r.centerx, r.centery - 10), 32)
    sub = g.small_font.render(self.badge[1], True, WHITE)
    s.blit(sub, sub.get_rect(center=(r.centerx, r.centery + 22)))

  # ================================================================ pictures
  def text(self, s, txt, centre, size, colour=WHITE, max_w=None):
    t = render_expr(self.g, txt, size, colour, max_w)
    s.blit(t, t.get_rect(center=(int(centre[0]), int(centre[1]))))

  def big_domino_rect(self, sc, wide=False):
    if wide:
      w = int(min(sc.w * 0.8, sc.h * 1.6, 360))
      return pygame.Rect(sc.centerx - w // 2, sc.centery - w // 4 - 10, w, w // 2)
    h = int(min(sc.h * 0.95, 320))
    return pygame.Rect(sc.centerx - h // 4, sc.centery - h // 2, h // 2, h)

  def scene_expr(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    show = q.get("show")
    if not show:
      draw_domino(s, pygame.Rect(sc.centerx - 30, sc.centery - 60, 60, 120), 3, 4)
      return
    size = 40
    while size > 18 and self.g.font_at(size).size(show)[0] > sc.w - 30:
      size -= 2
    card = pygame.Rect(0, 0, min(sc.w, self.g.font_at(size).size(show)[0] + 50), size + 44)
    card.center = sc.center
    pygame.draw.rect(s, (30, 40, 80), card, border_radius=16)
    pygame.draw.rect(s, YELLOW, card, 3, border_radius=16)
    self.text(s, show, card.center, size, WHITE, sc.w - 30)

  def scene_words(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    f = self.g.font_at(30)
    lines = wrap(f, f'"{q["words"]}"', sc.w - 40)
    for n, line in enumerate(lines):
      self.text(s, line, (sc.centerx, sc.centery + (n - (len(lines) - 1) / 2) * 38), 30, YELLOW)

  def scene_column(self, s, lay, now):
    """A written sum in columns (Th H T O); carries appear over the columns after the answer."""
    q = self.q
    sc = lay["scene"]
    a, b, op = q["a"], q["b"], q["op"]
    c = q["val"]
    digits = max(len(str(a)), len(str(b)), len(str(c)))
    cw = int(min(48, (sc.w - 80) / (digits + 1)))
    size = int(cw * 0.8)
    right = sc.centerx + (digits + 1) * cw // 2
    row_h = int(min(46, sc.h / 4.6))
    y0 = sc.y + row_h
    names = ["O", "T", "H", "Th", "TTh"]
    for k in range(digits):
      x = right - (k + 0.5) * cw
      lbl = self.g.small_font.render(names[k] if k < len(names) else "", True, (180, 200, 240))
      s.blit(lbl, lbl.get_rect(center=(int(x), sc.y + 6)))

    def row(n, y, colour=WHITE):
      for k, ch in enumerate(reversed(str(n))):
        self.text(s, ch, (right - (k + 0.5) * cw, y), size, colour)
    row(a, y0)
    row(b, y0 + row_h)
    self.text(s, op, (right - (digits + 0.5) * cw, y0 + row_h), size, YELLOW)
    line_y = y0 + row_h + row_h * 0.6
    pygame.draw.line(s, WHITE, (right - (digits + 1) * cw, line_y), (right, line_y), 3)
    if self.shown:
      row(c, y0 + row_h * 2.2, GREEN)
      if op == "+":                                 # the carries, small, above each column
        carry, k = 0, 0
        while a or b or carry:
          col = a % 10 + b % 10 + carry
          carry = col // 10
          a, b, k = a // 10, b // 10, k + 1
          if carry:
            self.text(s, "1", (right - (k + 0.5) * cw + cw * 0.15, y0 - row_h * 0.62), max(12, size // 2), YELLOW)
    else:
      self.text(s, "?", (right - cw * 0.5, y0 + row_h * 2.2), size, YELLOW)

  def scene_count(self, s, lay, now):
    q = self.q
    draw_domino(s, self.big_domino_rect(lay["scene"]), q["a"], q["b"], lit=self._lit)

  def scene_add(self, s, lay, now):
    q = self.q
    r = self.big_domino_rect(lay["scene"], wide=True)
    draw_domino(s, r, q["a"], q["b"], lit=self._lit)
    for k, n in enumerate((q["a"], q["b"])):
      self.text(s, str(n), (r.x + r.w * (0.25 + 0.5 * k), r.bottom + 24), 30)
    self.text(s, "+", (r.centerx, r.bottom + 24), 30, YELLOW)

  def scene_bonds(self, s, lay, now):
    q = self.q
    r = self.big_domino_rect(lay["scene"], wide=True)
    b = q["b"] if self.shown else None
    draw_domino(s, r, q["a"], b, lit=self._lit, font=self.g.font_at(int(r.h * 0.6)))
    self.text(s, f"{q['a']} + {q['b'] if self.shown else '?'} = {q['total']}", (r.centerx, r.bottom + 26), 28)

  def scene_more(self, s, lay, now):
    q = self.q
    for i, r in enumerate(self.domino_rects(lay)):
      a, b = q["halves"][i]
      dx = 0
      if i in self.shake and now - self.shake[i] < 0.4:
        dx = int(8 * math.sin((now - self.shake[i]) * 50))
      rr = r.move(dx, 0)
      if i == q["c"] and self.solved_at is not None:
        pygame.draw.rect(s, GREEN, rr.inflate(18, 18), border_radius=18)
      draw_domino(s, rr, a, b, colour=(255, 225, 225) if i in self.wrong else (250, 250, 245))
      if self.solved_at is not None or i in self.wrong:
        self.text(s, str(q["totals"][i]), (rr.centerx, rr.bottom + 24), 30)

  def tiles_row(self, s, sc, nums, answer, label_under=None):
    w = min(84, (sc.w - 20) // len(nums) - 10)
    h = int(w * 1.4)
    x0 = sc.centerx - (len(nums) * (w + 10) - 10) // 2
    for k, n in enumerate(nums):
      r = pygame.Rect(x0 + k * (w + 10), sc.centery - h // 2, w, h)
      empty = n is None
      show = answer if empty and self.shown else n
      col = (255, 250, 220) if not empty else ((200, 255, 210) if show is not None else (90, 100, 140))
      pygame.draw.rect(s, (20, 20, 40), r.move(3, 4), border_radius=12)
      pygame.draw.rect(s, col, r, border_radius=12)
      pygame.draw.rect(s, YELLOW if empty else INK, r, 3, border_radius=12)
      txt = "?" if show is None else (num(show) if isinstance(show, int) else str(show))
      sz = int(w * 0.5)
      while sz > 10 and self.g.font_at(sz).size(txt)[0] > w - 6:
        sz -= 2
      self.text(s, txt, r.center, sz, YELLOW if show is None else INK)
    y = sc.centery + h // 2 + 22
    end = x0 + len(nums) * (w + 10) - 10
    pygame.draw.line(s, WHITE, (x0, y), (end, y), 3)
    pygame.draw.polygon(s, WHITE, [(end + 10, y), (end - 4, y - 8), (end - 4, y + 8)])
    if label_under:
      lbl = self.g.small_font.render(label_under, True, WHITE)
      s.blit(lbl, lbl.get_rect(midtop=(sc.centerx, y + 6)))

  def scene_after(self, s, lay, now):
    q = self.q
    a = q["a"]
    nums = [None, a, a + 1, a + 2] if q["before"] else [n for n in (a - 2, a - 1, a) if n >= 0] + [None]
    self.tiles_row(s, lay["scene"], nums, q["val"], "+1 each step")

  def scene_seq(self, s, lay, now):
    q = self.q
    self.tiles_row(s, lay["scene"], q["seq"], q["val"])

  def scene_topple(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n = q["a"]
    per_row = n if n <= 10 else (n + 1) // 2
    rows = 1 if n <= 10 else 2
    gap = min(36, (sc.w - 20) // per_row)
    h = min(int(gap * 1.9), int(sc.h / rows * 0.6))
    t = now - self.asked_at - 1.0
    nf = len(q["falls"])
    for i in range(n):
      row, col = divmod(i, per_row)
      x = int(sc.centerx - (per_row - 1) * gap / 2 + col * gap)
      foot_y = sc.y + int(sc.h * (0.6 if rows == 1 else (0.45 + 0.45 * row)))
      fall = 0.0
      if i in q["falls"]:
        k = q["falls"].index(i)
        fall = max(0.0, min(1.0, (t - k * 1.4 / max(1, nf)) / 0.35))
      colour = (230, 80, 80) if i in q["falls"] else TILE_COLOURS[i % len(TILE_COLOURS)]
      fall_blit(s, small_domino(h, colour), (x, foot_y), fall)
      if self.shown and i not in q["falls"]:
        self.g.draw_star(s, (x, foot_y - h - 12), 7)

  def scene_tens(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    rows = q["a"] + (1 if q["b"] else 0)
    gap = min(30, (sc.w - 70) // 10)
    rh = min(int(gap * 1.6), (sc.h - 10) // max(1, rows))
    h = int(rh * 0.8)
    y0 = sc.centery - rows * rh // 2 + h
    total = 0
    for r in range(rows):
      count = 10 if r < q["a"] else q["b"]
      y = y0 + r * rh
      total = add_all([total, count])
      fall_row = self.cascade_fall(r, now)
      for c in range(count):
        x = sc.x + 30 + c * gap + gap // 2
        colour = (90, 170, 255) if r < q["a"] else (255, 160, 60)
        fall_blit(s, small_domino(h, colour), (int(x), y), fall_row * min(1, (c + 1) / 10 + 0.2))
      lx = sc.x + 30 + 10 * gap + 8
      self.text(s, "10" if r < q["a"] else str(q["b"]), (lx + 12, y - h // 2), max(12, min(20, rh - 4)))
      self._cascade.append((lx + 30, y - h, f"= {total}"))

  def scene_times(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    gnum = q["a"]
    a, b = q["halves"]
    per_row = gnum if gnum <= 5 else (gnum + 1) // 2
    rows = 1 if gnum <= 5 else 2
    h = int(min(sc.h / rows * 0.82, (sc.w - 20) / per_row * 1.6, 150))
    w = h // 2
    gap = max(10, w // 3)
    surf = face_surface(w, h, a, b)
    total = 0
    for i in range(gnum):
      row, col = divmod(i, per_row)
      n_in_row = min(per_row, gnum - row * per_row)
      x0 = sc.centerx - (n_in_row * (w + gap) - gap) // 2
      foot_y = sc.centery + h // 2 + (0 if rows == 1 else int((row - 0.5) * (h + 14)))
      x = x0 + col * (w + gap) + w // 2
      lean = 0.42 if i < gnum - 1 else 0.3
      fall_blit(s, surf, (x, foot_y), self.cascade_fall(i, now) * lean)
      total = add_all([total, q["b"]])
      self._cascade.append((x, foot_y - h - 8, f"+{q['b']} = {total}"))

  def scene_share(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n, gnum = q["a"], q["b"]
    each = n // gnum
    cell = min(110, (sc.w - 20) // gnum)
    lr = max(6, min(12, cell // 9))
    t = (now - self.done_at) if self.shown else -1
    rounds = 0 if t < 0 else min(each, int(t / 0.45) + 1)
    for k in range(gnum):
      fx = sc.centerx - (gnum * cell) // 2 + k * cell + cell // 2
      draw_friend(s, (fx, sc.y + 30), 22, TILE_COLOURS[k % len(TILE_COLOURS)])
      plate = pygame.Rect(0, 0, cell - 14, 22)
      plate.center = (fx, sc.bottom - 26)
      pygame.draw.ellipse(s, (235, 235, 245), plate)
      pygame.draw.ellipse(s, INK, plate, 2)
      for j in range(rounds):
        rr, cc = divmod(j, 3)
        draw_laddoo(s, (fx - lr * 2 + cc * lr * 2, plate.centery - 6 - rr * lr * 2), lr)
    left = n - rounds * gnum
    for j in range(left):
      ring, pos = divmod(j, 8)
      ang = pos * math.pi / 4 + ring * 0.4
      rad = 0 if j == 0 else lr * 2.1 * (ring + 1)
      draw_laddoo(s, (int(sc.centerx + rad * math.cos(ang)), int(sc.centery + rad * math.sin(ang))), lr)

  def scene_multiple(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    f = self.g.font_at(19)
    c = q["val"]
    for k, base in enumerate((q["a"], q["b"])):
      y = sc.y + int(sc.h * (0.28 + 0.44 * k))
      gate = pygame.Rect(sc.x + 4, y - 24, 64, 48)
      pygame.draw.rect(s, (150, 100, 60), gate, border_radius=8)
      pygame.draw.rect(s, WHITE, gate, 2, border_radius=8)
      self.text(s, f"{base}×", gate.center, 24)
      x = gate.right + 8
      m = base
      while x < sc.right - 30 and m <= c + base * 2:
        hit = m == c and self.shown
        label = str(m) if (m != c or self.shown) else "?"
        tw = max(34, f.size(label)[0] + 12)
        tile = pygame.Rect(x, y - 18, tw, 36)
        pygame.draw.rect(s, GREEN if hit else (255, 250, 220), tile, border_radius=8)
        pygame.draw.rect(s, YELLOW if hit else INK, tile, 2, border_radius=8)
        self.text(s, label, tile.center, 19, INK)
        x += tw + 6
        m = add_all([m, base])

  def scene_fib(self, s, lay, now):
    q = self.q
    g = self.g
    sc = lay["scene"]
    seq = q["seq"]
    if not self.shown:
      w = min(60, (sc.w - 20) // 6 - 8)
      h = int(w * 1.5)
      x0 = sc.centerx - (6 * (w + 8) - 8) // 2
      for k, n in enumerate(seq):
        r = pygame.Rect(x0 + k * (w + 8), sc.centery - h // 2, w, h)
        last = k == 5
        pygame.draw.rect(s, (90, 100, 140) if last else TILE_COLOURS[k], r, border_radius=10)
        pygame.draw.rect(s, YELLOW if last else WHITE, r, 3, border_radius=10)
        self.text(s, "?" if last else str(n), r.center, 20, YELLOW if last else WHITE)
        if 2 <= k <= 4:
          plus = g.small_font.render(f"{seq[k - 2]}+{seq[k - 1]}", True, WHITE)
          s.blit(plus, plus.get_rect(midtop=(r.centerx, r.bottom + 6)))
      return
    cx, cy = sc.centerx - sc.w * 0.05, sc.centery + sc.h * 0.05
    r_max = min(sc.w / 2, sc.h / 2) - 45
    pts = []
    for k in range(6):
      ang = 0.4 + k * 1.25
      rad = 34 + (r_max - 34) * (k / 5) ** 1.15
      pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    for k in range(1, 6):
      pygame.draw.line(s, (255, 230, 150), pts[k - 1], pts[k], 2)
    for k, n in enumerate(seq):
      h = 34 + k * 9
      surf = small_domino(h, TILE_COLOURS[k], str(n), g.font_at(max(14, h // 3)))
      fall_blit(s, surf, (int(pts[k][0]), int(pts[k][1] + h / 2)), self.cascade_fall(k, now) * 0.5)
      self._cascade.append((int(pts[k][0]), int(pts[k][1] - h / 2 - 8),
                            str(n) if k < 2 else f"{seq[k - 2]}+{seq[k - 1]}={n}"))

  def scene_prime(self, s, lay, now):
    q = self.q
    g = self.g
    sc = lay["scene"]
    p = q["val"]
    comp = next((int(c) for c in q["choices"] if not is_prime(int(c))), 12)
    r1, c1 = factor_pair(comp)
    box = pygame.Rect(sc.x + 6, sc.y + 6, sc.w // 2 - 12, sc.h - 12)
    dot = max(4, min(10, min(box.w // (c1 + 1), (box.h - 40) // (r1 + 1)) // 2))
    for rr in range(r1):
      for cc in range(c1):
        x = box.centerx - (c1 - 1) * dot * 1.3 + cc * dot * 2.6
        y = box.y + 20 + rr * dot * 2.6 + dot
        pygame.draw.circle(s, (255, 200, 90), (int(x), int(y)), dot)
    t = g.small_font.render(f"{comp} = {r1} rows of {c1}: can split", True, WHITE)
    s.blit(t, t.get_rect(midbottom=(box.centerx, box.bottom)))
    right = pygame.Rect(sc.centerx + 6, sc.y + 6, sc.w // 2 - 12, sc.h - 12)
    glow = 0.5 + 0.5 * math.sin(now * 4) if self.shown else 0.0
    draw_shield(s, (right.centerx, right.centery - 10), 34, glow=glow)
    self.text(s, str(p) if self.shown else "?", (right.centerx, right.centery - 10), 30, INK)
    msg = f"{p}: only 1 row of {p}" if self.shown else "Prime: no equal rows"
    t = g.small_font.render(msg, True, WHITE)
    s.blit(t, t.get_rect(midbottom=(right.centerx, right.bottom)))

  def scene_integer(self, s, lay, now):
    q = self.q
    g = self.g
    sc = lay["scene"]
    self.text(s, q["show"], (sc.centerx, sc.y + 18), 30)
    y = sc.y + int(sc.h * 0.72)
    left, right = sc.x + 14, sc.right - 14
    step = (right - left) / 20

    def xat(v):
      return int(left + (max(-10, min(10, v)) + 10) * step)
    pygame.draw.line(s, WHITE, (left, y), (right, y), 3)
    for v in range(-10, 11):
      tick = 8 if v % 5 else 12
      pygame.draw.line(s, WHITE, (xat(v), y - tick), (xat(v), y + tick), 2)
      if v % 2 == 0 or step > 22:
        t = g.small_font.render(num(v), True, (140, 190, 255) if v < 0 else WHITE)
        s.blit(t, t.get_rect(midtop=(xat(v), y + 14)))
    a, b, c = q["a"], q["b"], q["val"]
    anti = q["form"] in ("plus", "minus")
    th = int(min(46, sc.h * 0.28))
    tf = g.font_at(max(12, th // 3))
    for k in range(b):
      tile = small_domino(th, (90, 200, 120), "−1" if anti else "+1", tf, anti=anti)
      x = sc.centerx - (b - 1) * (tile.get_width() + 4) / 2 + k * (tile.get_width() + 4)
      s.blit(tile, tile.get_rect(midbottom=(int(x), y - 46)))
    hint = ("Blue anti-dominoes: each one takes you 1 to the left" if anti
            else "Taking away anti-dominoes moves you right")
    t = g.small_font.render(hint, True, (170, 210, 255))
    s.blit(t, t.get_rect(midbottom=(sc.centerx, y - 46 - th - 4)))
    pos = a
    if self.shown:
      hops = int((now - self.done_at) / 0.35)
      d = 1 if c > a else -1
      pos = a + d * min(abs(c - a), hops)
    pygame.draw.circle(s, YELLOW, (xat(a), y), 7)
    pygame.draw.circle(s, (255, 120, 60), (xat(pos), y - 24), 13)
    pygame.draw.circle(s, WHITE, (xat(pos), y - 24), 13, 2)
    pygame.draw.polygon(s, (255, 120, 60), [(xat(pos) - 6, y - 13), (xat(pos) + 6, y - 13), (xat(pos), y - 3)])

  def scene_ratio(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    v, c = q["a"], q["val"]
    gate = pygame.Rect(0, 0, 90, int(sc.h * 0.8))
    gate.center = sc.center
    pygame.draw.rect(s, (160, 90, 220), gate, border_radius=40)
    pygame.draw.rect(s, (40, 20, 70), gate.inflate(-26, -26), border_radius=30)
    self.text(s, q["show"], (gate.centerx, max(sc.y + 12, gate.y - 14)), 24, YELLOW)
    h_in = int(sc.h * 0.42)
    k = min(1.0, (now - self.done_at) / 1.2) if self.shown else 0.0
    small = pygame.Rect(0, 0, h_in // 2, h_in)
    small.center = (int(sc.x + sc.w * 0.18 + k * sc.w * 0.32), sc.centery)
    if k < 0.5:
      if v <= 12:
        self._rh = self._rh or mb.split_dots(v, 6)
        draw_domino(s, small, *self._rh)
      self.text(s, str(v), (small.centerx, small.bottom + 18), 24)
    else:
      out_h = int(min(sc.h * 0.95, h_in * (1.5 if q["up"] else 0.6)))
      big = pygame.Rect(0, 0, out_h // 2, out_h)
      big.center = (int(sc.right - sc.w * 0.18), sc.centery)
      if c <= 18:
        self._ro = self._ro or mb.split_dots(c, 9)
        draw_domino(s, big, *self._ro, colour=(255, 245, 210))
      self.text(s, str(c), (big.centerx, min(sc.bottom - 16, big.bottom + 18)), 28, GREEN)

  def scene_balance(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    self.text(s, q["show"], (sc.centerx, sc.y + 18), 30, YELLOW)
    base_y = sc.bottom - 8
    top_y = sc.y + int(sc.h * 0.40)
    
    # Wooden Fulcrum Triangle
    pygame.draw.polygon(s, (160, 115, 65), [(sc.centerx - 38, base_y), (sc.centerx + 38, base_y), (sc.centerx, top_y)])
    pygame.draw.polygon(s, (100, 65, 30), [(sc.centerx - 38, base_y), (sc.centerx + 38, base_y), (sc.centerx, top_y)], 2)
    
    # Beam with subtle wobble when unsolved
    tilt = 0.0 if self.shown else 0.06 * math.sin(now * 2.5)
    half = min(170, sc.w // 2 - 70)
    lx, ly = sc.centerx - half, top_y + half * tilt
    rx, ry = sc.centerx + half, top_y - half * tilt
    pygame.draw.line(s, (230, 200, 120), (lx, ly), (rx, ry), 7)
    pygame.draw.circle(s, (70, 45, 20), (sc.centerx, top_y), 8)
    pygame.draw.circle(s, (255, 225, 120), (sc.centerx, top_y), 5)
    
    left_label = q["show"].split(" = ")[0]
    if self.shown:
      m = re.match(r"^(\d+)x$", left_label)
      left_label = f"{m.group(1)} × {q['val']}" if m else left_label.replace("x", str(q["val"]))

    # Draw both hanging pans with physical objects
    for is_right, ((px, py), label, pan_col) in enumerate([
        (False, ((lx, ly), left_label, (75, 145, 235))),
        (True, ((rx, ry), str(q["total"]), (245, 140, 50)))
    ]):
      pygame.draw.line(s, (200, 200, 210), (px - 45, py + 48), (px, py), 2)
      pygame.draw.line(s, (200, 200, 210), (px + 45, py + 48), (px, py), 2)
      
      pan = pygame.Rect(0, 0, 120, 24)
      pan.center = (px, py + 52)
      pygame.draw.ellipse(s, pan_col, pan)
      pygame.draw.ellipse(s, WHITE, pan, 2)
      
      if not is_right:
        # Left Pan: Mystery Box [x]
        box = pygame.Rect(px - 46, pan.y - 34, 36, 34)
        box_c = (70, 190, 90) if self.shown else (210, 150, 60)
        pygame.draw.rect(s, box_c, box, border_radius=5)
        pygame.draw.rect(s, WHITE, box, 2, border_radius=5)
        box_txt = str(q["val"]) if self.shown else "x"
        self.text(s, box_txt, box.center, 22, WHITE)
        if "+" in label:
          extra_w = label.split("+")[-1].strip()
          w_rect = pygame.Rect(px + 10, pan.y - 28, 34, 28)
          pygame.draw.rect(s, (160, 165, 180), w_rect, border_radius=4)
          pygame.draw.rect(s, WHITE, w_rect, 1, border_radius=4)
          self.text(s, extra_w, w_rect.center, 20, (30, 30, 40))
        elif "-" in label:
          self.text(s, label, (px, pan.y - 48), 22, YELLOW)
      else:
        # Right Pan: Total Weight stack
        w_rect = pygame.Rect(px - 26, pan.y - 36, 52, 36)
        pygame.draw.rect(s, (215, 175, 55), w_rect, border_radius=5)
        pygame.draw.rect(s, WHITE, w_rect, 2, border_radius=5)
        self.text(s, str(q["total"]), w_rect.center, 24, (40, 25, 10))

  # --- numbers ----------------------------------------------------------------------
  def scene_pairs(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n = q["value"]
    if n <= 20:
      pairs, odd = divmod(n, 2)
      cols = pairs + odd
      gap = min(40, (sc.w - 40) // max(1, cols))
      x0 = sc.centerx - (cols - 1) * gap / 2
      for k in range(cols):
        x = int(x0 + k * gap)
        for j in range(2 if k < pairs else 1):
          col = (255, 120, 90) if k == pairs else (90, 170, 255)
          pygame.draw.circle(s, col, (x, sc.centery - 16 + j * 32), 12)
          pygame.draw.circle(s, WHITE, (x, sc.centery - 16 + j * 32), 12, 2)
      if self.shown:
        self.text(s, "one dot has no partner" if odd else "every dot has a partner",
                  (sc.centerx, sc.centery + 60), 18, YELLOW)
    else:
      t = num(n)
      head = t[:-1]
      w = self.g.font_at(44).size(head)[0]
      self.text(s, head, (sc.centerx - 22, sc.centery), 44)
      last = (sc.centerx - 22 + w // 2 + 24, sc.centery)
      pygame.draw.circle(s, YELLOW, last, 28, 3)
      self.text(s, t[-1], last, 44, YELLOW)
      self.text(s, "Look at the last digit", (sc.centerx, sc.centery + 52), 18)

  def scene_queue(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n = q["kids"]
    gap = min(60, (sc.w - 50) // n)
    x0 = sc.x + 40
    for k in range(n):
      x = x0 + k * gap + gap // 2
      y = sc.centery + 10
      pygame.draw.circle(s, (240, 190, 140), (x, y - 30), gap // 4)
      pygame.draw.rect(s, TILE_COLOURS[k % len(TILE_COLOURS)],
                       (x - gap // 4, y - 30 + gap // 4, gap // 2, gap // 2 + 10), border_radius=6)
      if k + 1 == q["pos"]:
        self.g.draw_star(s, (x, y - 30 - gap // 4 - 16), 11)
      if self.shown:
        self.text(s, str(k + 1), (x, y + gap // 2 + 10), 16)
    self.text(s, "front", (x0 + 18, sc.centery + 70), 16, YELLOW)
    pygame.draw.polygon(s, YELLOW, [(x0 - 14, sc.centery + 70), (x0 - 2, sc.centery + 62), (x0 - 2, sc.centery + 78)])

  def scene_place(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    digits = str(q["value"])
    names = ["O", "T", "H", "Th", "TTh", "L", "TL"]
    w = min(54, (sc.w - 20) // len(digits) - 6)
    x0 = sc.centerx - (len(digits) * (w + 6) - 6) // 2
    for i, ch in enumerate(digits):
      r = pygame.Rect(x0 + i * (w + 6), sc.centery - w, w, int(w * 1.3))
      hit = i == q["digit_index"]
      pygame.draw.rect(s, YELLOW if hit else (255, 250, 220), r, border_radius=8)
      pygame.draw.rect(s, INK, r, 2, border_radius=8)
      self.text(s, ch, r.center, int(w * 0.6), INK)
      lbl = self.g.small_font.render(names[len(digits) - 1 - i], True, WHITE)
      s.blit(lbl, lbl.get_rect(midtop=(r.centerx, r.bottom + 4)))

  def scene_numline(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    to, v = q["to"], q["value"]
    lo = v // to * to
    hi = lo + to
    y = sc.centery + 10
    left, right = sc.x + 30, sc.right - 30

    def xat(x):
      return int(left + (x - lo) / to * (right - left))
    pygame.draw.line(s, WHITE, (left, y), (right, y), 3)
    for k in range(11):
      x = left + (right - left) * k / 10
      big = k in (0, 5, 10)
      pygame.draw.line(s, WHITE, (x, y - (12 if big else 6)), (x, y + (12 if big else 6)), 2)
    self.text(s, num(lo), (left, y + 26), 18)
    self.text(s, num(hi), (right, y + 26), 18)
    self.text(s, "half way", ((left + right) / 2, y + 26), 14, (200, 210, 240))
    pygame.draw.circle(s, YELLOW, (xat(v), y), 9)
    self.text(s, num(v), (xat(v), y - 26), 20, YELLOW)
    if self.shown:
      tgt = xat(q["val"])
      pygame.draw.line(s, GREEN, (xat(v), y - 44), (tgt, y - 44), 4)
      pygame.draw.circle(s, GREEN, (tgt, y), 11, 3)

  # --- time and money --------------------------------------------------------------------
  def draw_clock(self, s, centre, r, h, m, colour=(255, 250, 235)):
    pygame.draw.circle(s, (30, 30, 50), (centre[0] + 3, centre[1] + 4), r)
    pygame.draw.circle(s, colour, centre, r)
    pygame.draw.circle(s, INK, centre, r, 4)
    f = max(12, r // 5)
    for k in range(1, 13):
      ang = math.radians(k * 30 - 90)
      self.text(s, str(k), (centre[0] + r * 0.78 * math.cos(ang), centre[1] + r * 0.78 * math.sin(ang)), f, INK)
    for k in range(60):
      ang = math.radians(k * 6 - 90)
      inner = r * (0.9 if k % 5 else 0.86)
      pygame.draw.line(s, INK, (centre[0] + inner * math.cos(ang), centre[1] + inner * math.sin(ang)),
                       (centre[0] + r * 0.95 * math.cos(ang), centre[1] + r * 0.95 * math.sin(ang)), 1)
    ha = math.radians((h % 12 + m / 60) * 30 - 90)
    ma = math.radians(m * 6 - 90)
    pygame.draw.line(s, (220, 60, 60), centre, (centre[0] + r * 0.5 * math.cos(ha), centre[1] + r * 0.5 * math.sin(ha)), 7)
    pygame.draw.line(s, INK, centre, (centre[0] + r * 0.75 * math.cos(ma), centre[1] + r * 0.75 * math.sin(ma)), 4)
    pygame.draw.circle(s, INK, centre, 6)

  def scene_clock(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    self.draw_clock(s, sc.center, int(min(sc.w, sc.h) * 0.45), q["h"], q["m"])

  def scene_clock2(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    r = int(min(sc.w / 4.6, sc.h * 0.4))
    self.draw_clock(s, (sc.centerx - int(r * 1.3), sc.centery - 10), r, q["h"], q["m"])
    self.draw_clock(s, (sc.centerx + int(r * 1.3), sc.centery - 10), r, q["h2"], q["m2"], (220, 245, 255))
    self.text(s, "start", (sc.centerx - int(r * 1.3), sc.centery + r + 4), 16, YELLOW)
    self.text(s, "end", (sc.centerx + int(r * 1.3), sc.centery + r + 4), 16, YELLOW)

  def scene_calendar(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    if "month" in q:
      card = pygame.Rect(0, 0, min(260, sc.w - 20), int(sc.h * 0.9))
      card.center = sc.center
      pygame.draw.rect(s, PAPER, card, border_radius=12)
      pygame.draw.rect(s, (220, 60, 60), (card.x, card.y, card.w, 36), border_top_left_radius=12,
                       border_top_right_radius=12)
      self.text(s, q["month"], (card.centerx, card.y + 18), 20)
      cw = (card.w - 20) / 7
      rh = min(22, (card.h - 50) / 5)
      for k in range(q["val"] if self.shown else 28):
        r_, c_ = divmod(k, 7)
        self.text(s, str(k + 1), (card.x + 10 + cw * (c_ + 0.5), card.y + 50 + r_ * rh), 13, INK)
      if not self.shown:
        self.text(s, "...?", (card.centerx, card.bottom - 12), 18, (220, 60, 60))
      return
    w = min(58, (sc.w - 20) // 7 - 4)
    x0 = sc.centerx - (7 * (w + 4) - 4) // 2
    for k, day in enumerate(mb.DAYS):
      r = pygame.Rect(x0 + k * (w + 4), sc.centery - 30, w, 60)
      today = k == q["day"]
      ans = self.shown and day == q["c"]
      pygame.draw.rect(s, GREEN if ans else (YELLOW if today else PAPER), r, border_radius=8)
      pygame.draw.rect(s, INK, r, 2, border_radius=8)
      self.text(s, day[:3], r.center, 16, INK)
      if today:
        self.text(s, "today", (r.centerx, r.bottom + 12), 13, YELLOW)

  def draw_coin(self, s, centre, value, r):
    if value >= 20:
      note = pygame.Rect(0, 0, int(r * 3.2), int(r * 1.6))
      note.center = centre
      colours = {20: (255, 200, 120), 50: (120, 210, 230), 100: (190, 170, 240), 200: (255, 190, 90),
                 500: (200, 200, 190), 2000: (240, 130, 190)}
      pygame.draw.rect(s, colours.get(value, (200, 230, 200)), note, border_radius=6)
      pygame.draw.rect(s, INK, note, 2, border_radius=6)
      pygame.draw.circle(s, WHITE, (note.right - r // 2 - 4, note.centery), r // 2, 2)
      self.text(s, f"Rs.{value}", (note.centerx - 6, note.centery), max(12, r // 2 + 4), INK)
    else:
      pygame.draw.circle(s, (150, 120, 50), (centre[0] + 2, centre[1] + 3), r)
      pygame.draw.circle(s, (230, 195, 90) if value != 10 else (220, 220, 225), centre, r)
      pygame.draw.circle(s, (170, 130, 40), centre, r, 3)
      self.text(s, str(value), centre, max(12, int(r * 0.9)), INK)

  def scene_money(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    coins = q["coins"]
    per = 3 if len(coins) > 3 else len(coins)
    rows = math.ceil(len(coins) / per)
    r = int(min(30, sc.w / (per * 3.6), sc.h / (rows * 2.6)))
    total = 0
    for i, v in enumerate(coins):
      row, col = divmod(i, per)
      n_in = min(per, len(coins) - row * per)
      x = sc.centerx + (col - (n_in - 1) / 2) * r * 3.6
      y = sc.centery + (row - (rows - 1) / 2) * r * 2.4
      self.draw_coin(s, (int(x), int(y)), v, r)
      total = add_all([total, v])
      self._cascade.append((int(x), int(y - r - 6), f"= {total}"))

  def scene_bill(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    r = int(min(34, sc.h / 4))
    self.draw_coin(s, (sc.centerx - int(sc.w * 0.22), sc.centery), q["n"], r)
    tag = pygame.Rect(0, 0, 110, 56)
    tag.center = (sc.centerx + int(sc.w * 0.22), sc.centery)
    pygame.draw.rect(s, PAPER, tag, border_radius=10)
    pygame.draw.rect(s, (220, 60, 60), tag, 3, border_radius=10)
    self.text(s, f"Rs. {q['a']}", tag.center, 22, INK)
    self.text(s, "you pay", (sc.centerx - int(sc.w * 0.22), sc.centery + r + 18), 15, YELLOW)
    self.text(s, "price", (tag.centerx, tag.bottom + 14), 15, YELLOW)

  def scene_billlist(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    lines = q["lines"]
    card = pygame.Rect(0, 0, min(320, sc.w - 20), min(sc.h - 6, 40 + 32 * (len(lines) + 1)))
    card.center = sc.center
    pygame.draw.rect(s, PAPER, card, border_radius=10)
    pygame.draw.rect(s, INK, card, 2, border_radius=10)
    step = (card.h - 30) / (len(lines) + 1)
    y = card.y + 20
    for name, price, qty in lines:
      self.text(s, name, (card.x + 64, y), 17, INK)
      self.text(s, f"{qty} × Rs. {price}", (card.right - 80, y), 17, INK)
      y += step
    pygame.draw.line(s, INK, (card.x + 12, y - step / 2), (card.right - 12, y - step / 2), 2)
    self.text(s, "Total", (card.x + 64, y), 17, INK)
    self.text(s, f"Rs. {q['c']}" if self.shown else "Rs. ?", (card.right - 80, y), 17, (220, 60, 60))

  # --- fractions ---------------------------------------------------------------------
  def draw_fraction(self, s, rect, n, den, shape="bar", colour=(255, 150, 60)):
    if shape == "pie":
      r = min(rect.w, rect.h) // 2
      c = rect.center
      pygame.draw.circle(s, (250, 250, 245), c, r)
      for k in range(n):
        a0, a1 = -math.pi / 2 + 2 * math.pi * k / den, -math.pi / 2 + 2 * math.pi * (k + 1) / den
        pts = [c] + [(c[0] + r * math.cos(a0 + (a1 - a0) * t / 12), c[1] + r * math.sin(a0 + (a1 - a0) * t / 12))
                     for t in range(13)]
        pygame.draw.polygon(s, colour, pts)
      for k in range(den):
        a = -math.pi / 2 + 2 * math.pi * k / den
        pygame.draw.line(s, INK, c, (c[0] + r * math.cos(a), c[1] + r * math.sin(a)), 2)
      pygame.draw.circle(s, INK, c, r, 3)
    else:
      w = rect.w / den
      for k in range(den):
        cell = pygame.Rect(int(rect.x + k * w), rect.y, int(w) + 1, rect.h)
        pygame.draw.rect(s, colour if k < n else (250, 250, 245), cell)
        pygame.draw.rect(s, INK, cell, 2)

  def scene_fraction(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    if q["shape"] == "pie":
      d = int(min(sc.h * 0.9, 220))
      self.draw_fraction(s, pygame.Rect(sc.centerx - d // 2, sc.centery - d // 2, d, d), q["num"], q["den"], "pie")
    else:
      w = int(min(sc.w * 0.85, 380))
      self.draw_fraction(s, pygame.Rect(sc.centerx - w // 2, sc.centery - 40, w, 80), q["num"], q["den"], "bar")

  def scene_fraction2(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    w = int(min(sc.w * 0.75, 360))
    for k, (n, d) in enumerate(q["fracs"]):
      y = sc.y + int(sc.h * (0.3 + 0.4 * k))
      bar = pygame.Rect(sc.centerx - w // 2 + 34, y - 24, w - 34, 48)
      self.draw_fraction(s, bar, n, d, "bar", (90, 170, 255) if k else (255, 150, 60))
      self.text(s, f"{n}/{d}", (bar.x - 34, y), 24)

  def scene_percent(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    side = int(min(sc.h * 0.9, 220, sc.w * 0.5))
    cell = side / 10
    x0, y0 = sc.centerx - side // 2 - 60, sc.centery - side // 2
    for k in range(100):
      r, c = divmod(k, 10)
      rect = pygame.Rect(int(x0 + c * cell), int(y0 + r * cell), int(cell) + 1, int(cell) + 1)
      pygame.draw.rect(s, (255, 150, 60) if k < q["p"] else (250, 250, 245), rect)
      pygame.draw.rect(s, (180, 180, 190), rect, 1)
    self.text(s, f"{q['p']} of 100", (x0 + side + 74, sc.centery - 14), 20, YELLOW)
    self.text(s, f"= {q['p']}%", (x0 + side + 74, sc.centery + 14), 20, YELLOW)

  # --- measurement -------------------------------------------------------------------
  def scene_ruler(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    cm = (sc.w - 40) / 13
    x0 = sc.x + 24
    ruler = pygame.Rect(int(x0 - 8), sc.centery + 10, int(cm * 12 + 16), 54)
    pygame.draw.rect(s, (250, 215, 120), ruler, border_radius=6)
    pygame.draw.rect(s, INK, ruler, 2, border_radius=6)
    for k in range(13):
      x = x0 + k * cm
      pygame.draw.line(s, INK, (x, ruler.y), (x, ruler.y + 22), 2)
      self.text(s, str(k), (x, ruler.y + 36), 14, INK)
      if k < 12:
        pygame.draw.line(s, INK, (x + cm / 2, ruler.y), (x + cm / 2, ruler.y + 12), 1)
    self.text(s, "cm", (ruler.right - 14, ruler.y + 36), 12, INK)
    st, ln = q["start"], q["length"]
    left, right = x0 + st * cm, x0 + (st + ln) * cm
    y = sc.centery - 26
    tip = cm * 0.6
    pygame.draw.rect(s, (240, 130, 160), (left, y, cm * 0.35, 22))
    pygame.draw.rect(s, (255, 190, 60), (left + cm * 0.35, y, right - left - cm * 0.35 - tip, 22))
    pygame.draw.polygon(s, (240, 210, 160), [(right - tip, y), (right, y + 11), (right - tip, y + 22)])
    pygame.draw.circle(s, INK, (int(right - 2), y + 11), 3)
    for x in (left, right):
      dashed(s, WHITE, (x, y + 22), (x, ruler.y), 5)

  # --- geometry ---------------------------------------------------------------------
  def scene_shape(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    side = int(min(sc.h * 0.85, 220))
    rect = pygame.Rect(sc.centerx - side // 2, sc.centery - side // 2, side, side)
    draw_shape(s, q["shape"], rect)
    if q.get("count_corners") and self.shown:
      for k, p in enumerate(shape_points(q["shape"], rect) or []):
        pygame.draw.circle(s, YELLOW, (int(p[0]), int(p[1])), 10)
        self.text(s, str(k + 1), p, 13, INK)

  def scene_symmetry(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    side = int(min(sc.h * 0.85, 220))
    rect = pygame.Rect(sc.centerx - side // 2, sc.centery - side // 2, side, side)
    draw_shape(s, q["shape"], rect)
    if not self.shown:
      return
    c = rect.center
    r = side * 0.62
    n = q["val"]
    if q["shape"] == "Rectangle":
      angles = [0, 90]
    elif q["shape"] == "Square":
      angles = [0, 45, 90, 135]
    else:
      start = {"Triangle": 90, "Pentagon": 90, "Star": 90, "Hexagon": 0}.get(q["shape"], 0)
      angles = [start + 180 * k / n for k in range(n)]
    shown = int((now - self.done_at) / 0.4) + 1
    for a in angles[:shown]:
      rad = math.radians(a)
      dashed(s, YELLOW, (c[0] - r * math.cos(rad), c[1] - r * math.sin(rad)),
             (c[0] + r * math.cos(rad), c[1] + r * math.sin(rad)), 9, 3)

  def scene_solid(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    name = q["solid"]
    cx, cy = sc.center
    k = int(min(sc.h * 0.36, 90))
    front, top, side = (120, 190, 255), (180, 220, 255), (80, 140, 220)
    if name in ("Cube", "Cuboid"):
      w = k * (1.6 if name == "Cuboid" else 1.0)
      h = k
      dx, dy = k * 0.5, -k * 0.4
      f = [(cx - w / 2, cy - h / 2 + 10), (cx + w / 2, cy - h / 2 + 10), (cx + w / 2, cy + h / 2 + 10),
           (cx - w / 2, cy + h / 2 + 10)]
      t = [f[0], f[1], (f[1][0] + dx, f[1][1] + dy), (f[0][0] + dx, f[0][1] + dy)]
      r = [f[1], f[2], (f[2][0] + dx, f[2][1] + dy), (f[1][0] + dx, f[1][1] + dy)]
      for poly, col in ((f, front), (t, top), (r, side)):
        pygame.draw.polygon(s, col, poly)
        pygame.draw.polygon(s, WHITE, poly, 3)
      if self.shown:
        for p in f + [t[2], t[3], r[2]]:
          pygame.draw.circle(s, YELLOW, (int(p[0]), int(p[1])), 6)
    elif name == "Cylinder":
      e = pygame.Rect(int(cx - k * 0.7), int(cy - k - 12), int(k * 1.4), int(k * 0.5))
      pygame.draw.rect(s, front, (e.x, e.centery, e.w, int(k * 1.6)))
      b = e.move(0, int(k * 1.6))
      pygame.draw.ellipse(s, side, b)
      pygame.draw.ellipse(s, top, e)
      pygame.draw.ellipse(s, WHITE, e, 3)
      pygame.draw.line(s, WHITE, (e.x, e.centery), (b.x, b.centery), 3)
      pygame.draw.line(s, WHITE, (e.right, e.centery), (b.right, b.centery), 3)
      pygame.draw.arc(s, WHITE, b, math.pi, 2 * math.pi, 3)
    elif name == "Cone":
      b = pygame.Rect(int(cx - k * 0.8), int(cy + k * 0.6), int(k * 1.6), int(k * 0.5))
      pygame.draw.polygon(s, front, [(cx, cy - k), (b.x, b.centery), (b.right, b.centery)])
      pygame.draw.ellipse(s, side, b)
      pygame.draw.polygon(s, WHITE, [(cx, cy - k), (b.x, b.centery), (b.right, b.centery)], 3)
      pygame.draw.arc(s, WHITE, b, math.pi, 2 * math.pi, 3)
    elif name == "Sphere":
      pygame.draw.circle(s, front, (cx, cy), k)
      pygame.draw.circle(s, top, (cx - k // 3, cy - k // 3), k // 3)
      pygame.draw.circle(s, WHITE, (cx, cy), k, 3)
      pygame.draw.ellipse(s, WHITE, (cx - k, cy - k // 4, 2 * k, k // 2), 1)
    else:   # square pyramid
      base = [(cx - k, cy + k * 0.5), (cx + k * 0.6, cy + k * 0.5), (cx + k, cy + k * 0.1), (cx - k * 0.6, cy + k * 0.1)]
      apex = (cx, cy - k)
      for i, col in ((0, front), (1, side)):
        pygame.draw.polygon(s, col, [base[i], base[i + 1], apex])
        pygame.draw.polygon(s, WHITE, [base[i], base[i + 1], apex], 3)
      dashed(s, WHITE, base[3], apex, 6, 2)
      dashed(s, WHITE, base[2], base[3], 6, 2)
      dashed(s, WHITE, base[0], base[3], 6, 2)

  def draw_angle(self, s, vertex, r, deg, label=None, colour=YELLOW):
    pygame.draw.line(s, WHITE, vertex, (vertex[0] + r, vertex[1]), 4)
    rad = math.radians(deg)
    end = (vertex[0] + r * math.cos(rad), vertex[1] - r * math.sin(rad))
    pygame.draw.line(s, WHITE, vertex, end, 4)
    ar = r * 0.3
    if abs(deg - 90) < 0.5:
      sq = ar * 0.6
      pygame.draw.lines(s, colour, False, [(vertex[0] + sq, vertex[1]), (vertex[0] + sq, vertex[1] - sq),
                                           (vertex[0], vertex[1] - sq)], 3)
    else:
      pts = [(vertex[0] + ar * math.cos(math.radians(a)), vertex[1] - ar * math.sin(math.radians(a)))
             for a in range(0, int(deg) + 1, 3)]
      if len(pts) > 1:
        pygame.draw.lines(s, colour, False, pts, 3)
    if label:
      mid = math.radians(deg / 2)
      self.text(s, label, (vertex[0] + ar * 1.9 * math.cos(mid), vertex[1] - ar * 1.9 * math.sin(mid)), 20, colour)

  def scene_angle(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    deg = q["deg"]
    if deg <= 180:
      r = int(min(sc.w * 0.4, sc.h * 0.85))
      vertex = (sc.centerx, sc.bottom - 16)
    else:
      r = int(min(sc.w * 0.3, sc.h * 0.45))
      vertex = (sc.centerx, sc.centery)
    if q.get("protractor"):
      pygame.draw.circle(s, (230, 240, 255), vertex, r, draw_top_left=True, draw_top_right=True)
      pygame.draw.circle(s, INK, vertex, r, 2, draw_top_left=True, draw_top_right=True)
      for a in range(0, 181, 10):
        rad = math.radians(a)
        inner = r * (0.88 if a % 30 else 0.8)
        pygame.draw.line(s, INK, (vertex[0] + inner * math.cos(rad), vertex[1] - inner * math.sin(rad)),
                         (vertex[0] + r * math.cos(rad), vertex[1] - r * math.sin(rad)), 2)
        if a % 30 == 0:
          self.text(s, str(a), (vertex[0] + r * 0.68 * math.cos(rad), vertex[1] - r * 0.68 * math.sin(rad)), 13, INK)
    self.draw_angle(s, vertex, r, deg, f"{deg}°" if self.shown else None)

  def scene_vertical(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    c = sc.center
    r = int(min(sc.w * 0.42, sc.h * 0.48))
    deg = q["deg"]
    for a in (0, deg):
      rad = math.radians(a)
      pygame.draw.line(s, WHITE, (c[0] - r * math.cos(rad), c[1] + r * math.sin(rad)),
                       (c[0] + r * math.cos(rad), c[1] - r * math.sin(rad)), 4)
    mid = math.radians(deg / 2)
    self.text(s, f"{deg}°", (c[0] + r * 0.4 * math.cos(mid), c[1] - r * 0.4 * math.sin(mid)), 20, YELLOW)
    self.text(s, f"{deg}°" if self.shown else "?", (c[0] - r * 0.4 * math.cos(mid), c[1] + r * 0.4 * math.sin(mid)),
              22, GREEN if self.shown else YELLOW)

  def scene_angle_pair(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    total, a = q["total"], q["deg"]
    r = int(min(sc.w * 0.4, sc.h * 0.8))
    vertex = (sc.centerx, sc.bottom - 16)
    pygame.draw.line(s, WHITE, vertex, (vertex[0] + r, vertex[1]), 4)
    et = math.radians(total)
    pygame.draw.line(s, WHITE, vertex, (vertex[0] + r * math.cos(et), vertex[1] - r * math.sin(et)), 4)
    mid = math.radians(a)
    pygame.draw.line(s, (120, 200, 255), vertex, (vertex[0] + r * math.cos(mid), vertex[1] - r * math.sin(mid)), 4)
    self.text(s, f"{a}°", (vertex[0] + r * 0.45 * math.cos(mid / 2), vertex[1] - r * 0.45 * math.sin(mid / 2)), 20, YELLOW)
    m2 = math.radians((a + total) / 2)
    self.text(s, f"{q['val']}°" if self.shown else "?",
              (vertex[0] + r * 0.45 * math.cos(m2), vertex[1] - r * 0.45 * math.sin(m2)), 22,
              GREEN if self.shown else YELLOW)
    self.text(s, f"together {total}°", (sc.centerx, sc.y + 14), 18)

  def scene_lines(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    c = sc.center
    L = min(sc.w * 0.4, 170)
    kind = q["line_kind"]
    if kind == "Parallel":
      for dy in (-40, 40):
        pygame.draw.line(s, WHITE, (c[0] - L, c[1] + dy - 20), (c[0] + L, c[1] + dy + 20), 5)
    elif kind == "Perpendicular":
      pygame.draw.line(s, WHITE, (c[0] - L, c[1] + 40), (c[0] + L, c[1] + 40), 5)
      pygame.draw.line(s, WHITE, (c[0], c[1] + 40), (c[0], c[1] - L * 0.6), 5)
      if self.shown:
        pygame.draw.lines(s, YELLOW, False, [(c[0] + 18, c[1] + 40), (c[0] + 18, c[1] + 22), (c[0], c[1] + 22)], 3)
    else:
      pygame.draw.line(s, WHITE, (c[0] - L, c[1] + 50), (c[0] + L, c[1] - 30), 5)
      pygame.draw.line(s, WHITE, (c[0] - L, c[1] - 40), (c[0] + L, c[1] + 30), 5)
      if self.shown:
        pygame.draw.circle(s, YELLOW, (int(c[0] + L * 0.06), int(c[1] + 4)), 8)

  def scene_triangle(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    w = int(min(sc.w * 0.7, 300))
    h = int(min(sc.h * 0.8, w * 0.75))
    p = [(sc.centerx - w // 2, sc.centery + h // 2), (sc.centerx + w // 2, sc.centery + h // 2),
         (sc.centerx - w // 8, sc.centery - h // 2)]
    pygame.draw.polygon(s, (90, 170, 255), p)
    pygame.draw.polygon(s, WHITE, p, 3)
    if "angles" in q:
      a, b, c = q["angles"]
      self.text(s, f"{a}°", (p[0][0] + 34, p[0][1] - 16), 18, YELLOW)
      self.text(s, f"{b}°", (p[1][0] - 34, p[1][1] - 16), 18, YELLOW)
      self.text(s, f"{c}°" if self.shown else "?", (p[2][0] + 4, p[2][1] + 30), 20, GREEN if self.shown else YELLOW)
    else:
      sa, sb, sc_ = q["sides"]
      self.text(s, f"{sa} cm", ((p[0][0] + p[1][0]) / 2, p[0][1] + 16), 17, YELLOW)
      self.text(s, f"{sb} cm", ((p[1][0] + p[2][0]) / 2 + 30, (p[1][1] + p[2][1]) / 2), 17, YELLOW)
      self.text(s, f"{sc_} cm", ((p[0][0] + p[2][0]) / 2 - 32, (p[0][1] + p[2][1]) / 2), 17, YELLOW)

  def scene_circle(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    r = int(min(sc.h * 0.45, 110))
    c = sc.center
    pygame.draw.circle(s, (120, 190, 255), c, r)
    pygame.draw.circle(s, WHITE, c, r, 3)
    pygame.draw.circle(s, INK, c, 5)
    if q["diam"] or self.shown:                 # the radius is given (or shown)
      pygame.draw.line(s, YELLOW, c, (c[0] + r, c[1]), 4)
      self.text(s, f"r = {q['r']}", (c[0] + r // 2, c[1] - 16), 18, YELLOW)
    if not q["diam"] or self.shown:             # the diameter is given (or shown)
      y = c[1] + r // 3
      half = int(math.sqrt(max(0, r * r - (r // 3) ** 2)))
      pygame.draw.line(s, (255, 150, 60), (c[0] - half, y), (c[0] + half, y), 4)
      self.text(s, f"d = {2 * q['r']}", (c[0], y + 18), 18, (255, 150, 60))

  # --- area, perimeter, volume ------------------------------------------------------------
  def scene_grid(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    w, h = q["w"], q["h"]
    cell = int(min((sc.w - 60) / w, (sc.h - 40) / h, 36))
    x0 = sc.centerx - w * cell // 2
    y0 = sc.centery - h * cell // 2
    lit_n = int((now - self.done_at) / 0.05) if self.shown and q["what"] == "area" else 0
    for r in range(h):
      for c in range(w):
        rect = pygame.Rect(x0 + c * cell, y0 + r * cell, cell, cell)
        pygame.draw.rect(s, (255, 190, 60) if r * w + c < lit_n else (120, 190, 255), rect)
        pygame.draw.rect(s, WHITE, rect, 1)
    outline = pygame.Rect(x0, y0, w * cell, h * cell)
    pygame.draw.rect(s, YELLOW if q["what"] == "perimeter" else WHITE, outline, 4 if q["what"] == "perimeter" else 2)
    self.text(s, str(w), (outline.centerx, outline.y - 14), 18, YELLOW)
    self.text(s, str(h), (outline.x - 16, outline.centery), 18, YELLOW)

  def scene_cubes(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    l, w, h = q["l"], q["w"], q["h"]
    k = int(min(sc.w / (l + w * 0.6 + 2), sc.h / (h + w * 0.5 + 1), 34))
    dx, dy = k * 0.6, -k * 0.5
    ox = sc.centerx - (l * k + w * dx) / 2
    oy = sc.centery + (h * k - w * dy) / 2 - 10
    for z in range(h):
      layer_col = TILE_COLOURS[z % len(TILE_COLOURS)]
      for y in range(w - 1, -1, -1):
        for x in range(l):
          bx, by = ox + x * k + y * dx, oy - z * k + y * dy
          f = [(bx, by), (bx + k, by), (bx + k, by - k), (bx, by - k)]
          t = [(bx, by - k), (bx + k, by - k), (bx + k + dx, by - k + dy), (bx + dx, by - k + dy)]
          r = [(bx + k, by), (bx + k + dx, by + dy), (bx + k + dx, by - k + dy), (bx + k, by - k)]
          for poly, shade in ((r, 0.7), (t, 1.15), (f, 1.0)):
            col = tuple(max(0, min(255, int(c * shade))) for c in layer_col)
            pygame.draw.polygon(s, col, poly)
            pygame.draw.polygon(s, (30, 30, 50), poly, 1)
    for z in range(h):
      self._cascade.append((int(ox + l * k + w * dx + 26), int(oy - z * k - k // 2), f"+{l * w} = {l * w * (z + 1)}"))

  # --- data --------------------------------------------------------------------------
  def scene_tally(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n = q["value"]
    groups = math.ceil(n / 5)
    gw = 70
    x0 = sc.centerx - groups * gw // 2
    for g_ in range(groups):
      count = min(5, n - g_ * 5)
      bx = x0 + g_ * gw + 8
      for k in range(min(4, count)):
        pygame.draw.line(s, WHITE, (bx + k * 12, sc.centery - 34), (bx + k * 12, sc.centery + 34), 5)
      if count == 5:
        pygame.draw.line(s, YELLOW, (bx - 8, sc.centery + 26), (bx + 46, sc.centery - 26), 5)

  def fruit_icon(self, name, size):
    return self.g.thumb(name, "Fruits", size)

  def scene_picto(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    counts, key = q["counts"], q["key"]
    rows = list(counts)
    rh = min(54, (sc.h - 30) // len(rows))
    icon = rh - 8
    for i, f in enumerate(rows):
      y = sc.y + 10 + i * rh
      self.text(s, f, (sc.x + 50, y + rh // 2), 16, YELLOW if f == q["fruit"] else WHITE)
      pic = self.fruit_icon(f, icon)
      for k in range(counts[f] // key):
        x = sc.x + 100 + k * (icon + 4)
        if pic is not None:
          s.blit(pic, (x, y + 4))
        else:
          pygame.draw.circle(s, LADDOO, (x + icon // 2, y + rh // 2), icon // 2)
    if key > 1:
      self.text(s, f"each picture = {key}", (sc.centerx, sc.bottom - 10), 16, YELLOW)

  def scene_bars(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    counts = q["counts"]
    top = max(counts.values())
    n = len(counts)
    bw = min(60, (sc.w - 70) // n - 14)
    x0 = sc.x + 50
    base = sc.bottom - 40
    hmax = sc.h - 60
    for v in range(0, top + 1, 2 if top > 8 else 1):
      y = base - v * hmax / top
      pygame.draw.line(s, (90, 110, 160), (x0 - 6, y), (sc.right - 10, y), 1)
      self.text(s, str(v), (x0 - 20, y), 13)
    for i, (f, v) in enumerate(counts.items()):
      x = x0 + 10 + i * (bw + 14)
      h = v * hmax / top
      pygame.draw.rect(s, TILE_COLOURS[i], (x, base - h, bw, h), border_top_left_radius=6, border_top_right_radius=6)
      pygame.draw.rect(s, WHITE, (x, base - h, bw, h), 2, border_top_left_radius=6, border_top_right_radius=6)
      pic = self.fruit_icon(f, 30)
      if pic is not None:
        s.blit(pic, pic.get_rect(midtop=(x + bw // 2, base + 4)))
      if self.shown:
        self.text(s, str(v), (x + bw // 2, base - h - 12), 16, YELLOW)

  def scene_array(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n = q["value"]
    if self.shown:
      rows, cols = q["rows"], q["cols"]
    else:
      cols = min(n, 12)
      rows = math.ceil(n / cols)
    dot = int(min((sc.w - 40) / (cols * 2.4), (sc.h - 30) / (rows * 2.4), 14))
    for k in range(n):
      r, c = divmod(k, cols)
      x = sc.centerx + (c - (cols - 1) / 2) * dot * 2.4
      y = sc.centery + 8 + (r - (rows - 1) / 2) * dot * 2.4
      pygame.draw.circle(s, (255, 190, 60) if self.shown else (120, 190, 255), (int(x), int(y)), dot)
    self.text(s, f"{n} dots" + (f" = {rows} rows of {cols}" if self.shown else ""), (sc.centerx, sc.y + 10), 16)

  def scene_tree(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    n, fs = q["value"], q["factors"]
    x, y = sc.centerx - 40, sc.y + 24
    self.text(s, str(n), (x, y), 24)
    if not self.shown:
      self.text(s, "?  ×  ?", (x, y + 50), 22, YELLOW)
      return
    rest = n
    step_y = min(46, (sc.h - 30) // max(1, len(fs)))
    for i, p in enumerate(fs[:-1]):
      rest //= p
      ny = y + (i + 1) * step_y
      pygame.draw.line(s, WHITE, (x, y + i * step_y + 12), (x - 40, ny - 12), 2)
      pygame.draw.line(s, WHITE, (x, y + i * step_y + 12), (x + 40, ny - 12), 2)
      pygame.draw.circle(s, SHIELD, (x - 40, ny), 16)
      self.text(s, str(p), (x - 40, ny), 18, INK)
      last = i == len(fs) - 2
      if last:
        pygame.draw.circle(s, SHIELD, (x + 40, ny), 16)
      self.text(s, str(rest), (x + 40, ny), 18 if last else 20, INK if last else WHITE)
      x += 40

  def scene_shape_seq(self, s, lay, now):
    q = self.q
    sc = lay["scene"]
    seq = q["seq"]
    w = min(64, (sc.w - 20) // len(seq) - 6)
    x0 = sc.centerx - (len(seq) * (w + 6) - 6) // 2
    for k, name in enumerate(seq):
      rect = pygame.Rect(x0 + k * (w + 6), sc.centery - w // 2, w, w)
      if name is None:
        if self.shown:
          draw_shape(s, q["c"], rect.inflate(-8, -8))
        else:
          pygame.draw.rect(s, (90, 100, 140), rect, border_radius=10)
          pygame.draw.rect(s, YELLOW, rect, 3, border_radius=10)
          self.text(s, "?", rect.center, 26, YELLOW)
      else:
        draw_shape(s, name, rect.inflate(-8, -8))
