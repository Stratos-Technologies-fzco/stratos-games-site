"""Domino Game - children learn by tracing, toppling and listening.

1. Pick a subject, a category and an item (all from the Picture Data Hub).
2. Trace the dotted outline with a finger or the mouse; each dot pops.
3. Dominoes stand up on the outline - tap and watch them fall, to music that is
   different every time (magic.py).
4. The real picture appears with "Well done!" on the screen. Pictures are shown,
   not talked about: only each house's first picture says what it is. The name is
   spelled only when a child taps ABC, rhymes sing only after Sing is tapped, and
   the ♪ button and the little picture (moo, choo-choo ...) play only when tapped.
5. Sparks, streaks, colour themes and a sticker shelf keep it exciting.
6. The Games button opens more ways to learn: Find it! (quiz), Spell it,
   Story of the day, players (one profile per child), language and a
   parents' report.

Runs on desktop (python main.py), in mobile/desktop browsers (pygbag) and on
Android (buildozer). See BUILD_MOBILE.md.
"""

import asyncio
import datetime
import math
import os
import random
import time

import pygame

import calls
import domino_data as hub
import fun
import howto
import intro
import magic
import modes
import roadsafety
import mathsgame
import scenery
import sathi
import stratos_track
import screens
import singalong
import stories
import topplegame
import symbols  # noqa: F401 - shared with ui_draw (symbols-only buttons)
import packs
import ui_draw
import video
import world
from audio import IS_ANDROID, IS_WEB, SoundBank, Speaker
from translations import CATEGORY_NATIVE, LANGUAGES

# The game screen is the whole screen: a slim top row (menu button, the
# picture's name with speaker and video buttons, Next) and the play area under
# it. The canvas takes the real screen's shape (at least 450 x 800), so
# nothing is cut off and there are no empty bars. The menu button opens the
# 450 x 800 menu panel (subjects, categories, every picture, Games, Stickers,
# Theme), drawn in the middle of the screen; picking a picture goes straight
# back to the game. set_layout() fits everything to the screen.
PANEL_W, PANEL_H = 450, 800
WIDTH, HEIGHT = PANEL_W, PANEL_H
CAT_PER_PAGE = 6         # the menu's category row pages through longer subjects
SUBJ_PER_PAGE = 7        # ... and the subject row through the subjects
TOP_H = 112                       # height of the top row (name + description)

# Inside the menu panel (panel coordinates)
SUBJ_RECT = pygame.Rect(0, 0, PANEL_W, 40)
CAT_RECT = pygame.Rect(0, 40, PANEL_W, 38)
BANK_RECT = pygame.Rect(0, 84, PANEL_W, PANEL_H - 52 - 84)
RESET_RECT = pygame.Rect(8, PANEL_H - 48, 96, 42)
GAMES_RECT = pygame.Rect(110, PANEL_H - 48, 92, 42)
STICKER_RECT = pygame.Rect(208, PANEL_H - 48, 80, 42)
THEME_RECT = pygame.Rect(294, PANEL_H - 48, 48, 42)
NEXT_RECT = pygame.Rect(348, PANEL_H - 48, 94, 42)      # "Play" closes the menu
BANK_COLS, BANK_ROWS = 4, 7

# Game screen (screen coordinates; set_layout() fills these in)
MENU_BTN = pygame.Rect(6, 10, 50, 54)
TOWN_BTN = pygame.Rect(6, 68, 50, 40)     # back to Wonder Town (the 3D front door)
NEXT_BTN = pygame.Rect(PANEL_W - 56, 10, 50, 54)
BANNER_RECT = pygame.Rect(68, 8, PANEL_W - 136, 62)
SPEAKER_R = 21
JINGLE_R = 22
SPEAKER_CENTER = (BANNER_RECT.right - 28, BANNER_RECT.centery)
SPELL_CENTER = (SPEAKER_CENTER[0] - 2 * SPEAKER_R - 8, BANNER_RECT.centery)   # "ABC": spelling card
DESC_Y = 73
PLAY_RECT = pygame.Rect(0, TOP_H, PANEL_W, PANEL_H - TOP_H)
NAV_X = NAV_Y = 0                 # where the 450 x 800 panels sit on screen

# Colors (backgrounds and panels come from the chosen theme in fun.THEMES)
WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
CYAN = (0, 255, 204)
PINK = (233, 69, 96)
PURPLE = (120, 80, 200)
GOLD = (255, 215, 0)
HINT = (170, 180, 210)

CUSTOM = "Custom Draw"
DROP_TIME = 0.32                  # s: one domino dropping onto the picture
DROP_GAP = 0.06                   # s between dominoes (less for big pictures)
DROP_ALL = 2.4                    # s: the whole line has dropped by then
DROP_HEIGHT = 80                  # px it drops from
LETTER_SPACING = 34               # px between the big letter dominoes
LETTER_TILE = (11, 44)            # letter domino (w, h): half a real domino's width (user, 27-Oct)
DOMINO_TILE = (6, 28)             # picture domino (w, h): slim, 1 : 4.7 (was 12 x 28)
BADGE_R = 7                       # white badge with the letter (small: the domino is slim)
PIC_BOTTOM = 46                   # px under the picture kept for the hint and progress bar
# Free drawing: crayons, Undo and Done sit along the top of the play area
CRAYONS = [(255, 204, 0), (233, 69, 96), (255, 140, 40), (80, 200, 90),
           (60, 160, 255), (170, 110, 255), (255, 255, 255)]
CRAYON_Y, CRAYON_R = PLAY_RECT.y + 22, 13
UNDO_RECT = pygame.Rect(262, PLAY_RECT.y + 6, 80, 34)
DONE_RECT = pygame.Rect(350, PLAY_RECT.y + 6, 92, 34)
TOOLBAR_BOTTOM = PLAY_RECT.y + 46


def layout_size(window_size):
  """Canvas size with the screen's own shape: 800 high on wide screens, 450
  wide on tall phones (never smaller than the 450 x 800 menu panel)."""
  ww, wh = window_size
  if ww <= 0 or wh <= 0:
    return PANEL_W, PANEL_H
  if ww / wh >= PANEL_W / PANEL_H:
    return min(2400, max(PANEL_W, int(round(PANEL_H * ww / wh)))), PANEL_H
  return PANEL_W, min(1600, max(PANEL_H, int(round(PANEL_W * wh / ww))))


def set_layout(width, height=PANEL_H):
  """Fits the top row, play area, drawing tools and menu panel to the canvas."""
  global WIDTH, HEIGHT, PLAY_RECT, BANNER_RECT, SPEAKER_CENTER, SPELL_CENTER, JINGLE_CENTER
  global NEXT_BTN, NAV_X, NAV_Y, CRAYON_Y, UNDO_RECT, DONE_RECT, TOOLBAR_BOTTOM
  WIDTH, HEIGHT = width, height
  NEXT_BTN = pygame.Rect(width - 56, 10, 50, 54)
  BANNER_RECT = pygame.Rect(0, 8, min(width - 120, 660), 62)
  BANNER_RECT.centerx = width // 2
  SPEAKER_CENTER = (BANNER_RECT.right - 28, BANNER_RECT.centery)
  SPELL_CENTER = (SPEAKER_CENTER[0] - 2 * SPEAKER_R - 8, BANNER_RECT.centery)
  PLAY_RECT = pygame.Rect(0, TOP_H, width, height - TOP_H)
  JINGLE_CENTER = (PLAY_RECT.x + 32, PLAY_RECT.bottom - 70)    # the ♪ button
  NAV_X, NAV_Y = (width - PANEL_W) // 2, (height - PANEL_H) // 2
  CRAYON_Y = PLAY_RECT.y + 22
  UNDO_RECT = pygame.Rect(PLAY_RECT.right - 188, PLAY_RECT.y + 6, 80, 34)
  DONE_RECT = pygame.Rect(PLAY_RECT.right - 100, PLAY_RECT.y + 6, 92, 34)
  TOOLBAR_BOTTOM = PLAY_RECT.y + 46
  modes.set_area(PLAY_RECT)
  ui_draw.share(globals())      # the drawing code reads the new layout too
MAX_DRAW_DOMINOES = 260
COPY_SPEED = 220       # px/s the Draw it pencil draws the outline
COPY_MIN_SECS, COPY_MAX_SECS = 3.0, 10.0
TRACE_RADIUS = 24      # how close the finger must pass to cover a dot
TRACE_DONE = 0.95      # share of dots that completes the outline
CALL_DELAY = 1.4       # real sound plays this long after the chime

# Spelling animation timing, measured from the Windows voice at rate -2:
# name at ~0.1 s, then one letter every ~0.82 s starting at ~1.7 s.
SPELL_START = 1.7
SPELL_STEP = 0.82

RATE_HINT = 44100  # mixer output rate; effects are resampled to it
FONT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts",
                         "Sniglet-ExtraBold.ttf")
NATIVE_FONTS = {"hi": ("NotoSansDevanagari-Bold.ttf", "Deva"),   # in fonts/, SIL Open Font License
                "bn": ("NotoSansBengali-Bold.ttf", "Beng")}
LANG_ORDER = ["hi", "bn", "en"]

set_layout(PANEL_W, PANEL_H)
fun.STORY_TITLES.update({s["id"]: s["title"] for s in stories.STORIES})


def load_font(size):
  """The bundled rounded font, so every device looks the same."""
  try:
    return pygame.font.Font(FONT_FILE, size)
  except Exception:
    return pygame.font.SysFont("Comic Sans MS", size, bold=True)


class Domino:

  def __init__(self, x, y, angle, color):
    self.x = x
    self.y = y
    self.angle = angle
    self.current_angle = 0.0
    self.state = "standing"
    self.color = color
    self.drop_at = 0.0          # when it starts dropping onto the picture


_BANDS = {}


def top_band(theme, width):
  """The top row's background: the theme colour, a little lighter at the top."""
  key = (theme["name"], width)
  band = _BANDS.get(key)
  if band is None:
    band = pygame.Surface((width, TOP_H))
    bg = theme["bg"]
    for y in range(TOP_H):
      k = 0.28 * (1 - y / TOP_H)
      pygame.draw.line(band, tuple(int(c + (255 - c) * k) for c in bg), (0, y), (width, y))
    if len(_BANDS) > 12:
      _BANDS.clear()
    _BANDS[key] = band
  return band


_TILES = {}


def domino_tile(color, plain=False):
  """A small domino: coloured tile, darker rim, a shine, a middle line and two
  pips. plain: a big tile with no pips, for a letter badge on top.
  Painted once per colour."""
  key = (*tuple(color)[:3], plain)
  tile = _TILES.get(key)
  if tile is None:
    if len(_TILES) > 600:
      _TILES.clear()
    rgb = key[:3]
    w, h = LETTER_TILE if plain else DOMINO_TILE
    tile = pygame.Surface((w, h), pygame.SRCALPHA)
    dark = tuple(int(c * 0.55) for c in rgb)
    light = tuple(min(255, int(c + (255 - c) * 0.45)) for c in rgb)
    pygame.draw.rect(tile, dark, (0, 0, w, h), border_radius=3)
    pygame.draw.rect(tile, rgb, (1, 1, w - 2, h - 2), border_radius=3)
    pygame.draw.line(tile, light, (1, 2), (1, h - 3), 1)
    if not plain:
      pygame.draw.line(tile, WHITE, (1, h // 2), (w - 2, h // 2), 1)
      pygame.draw.circle(tile, WHITE, (w // 2, h // 4), max(1, w // 4))
      pygame.draw.circle(tile, WHITE, (w // 2, 3 * h // 4), max(1, w // 4))
    _TILES[key] = tile
  return tile


_TOPPLED = {}


def toppled_tile(surf, fall):
  """A domino part-way down: shorter (seen from above it lies flat), a bit
  wider, with a soft shadow. Cached in 6 steps per tile, so it stays fast."""
  step = min(5, int(fall * 6))
  key = (id(surf), step)
  out = _TOPPLED.get(key)
  if out is None:
    if len(_TOPPLED) > 900:
      _TOPPLED.clear()
    k = step / 5
    w, h = surf.get_size()
    nw, nh = max(2, int(w * (1 + 0.15 * k))), max(2, int(h * (1 - 0.45 * k)))
    out = pygame.Surface((nw + 3, nh + 3), pygame.SRCALPHA)
    shadow = pygame.Surface((nw, nh), pygame.SRCALPHA)
    pygame.draw.rect(shadow, (0, 0, 0, int(90 * k)), shadow.get_rect(), border_radius=3)
    out.blit(shadow, (3, 3))
    out.blit(pygame.transform.smoothscale(surf, (nw, nh)), (0, 0))
    _TOPPLED[key] = out
  return out


def domino_letter_of(name):
  """The letter a picture's dominoes carry: C for Car, A for Apple, the letter
  itself for ABC, abc and numbers."""
  if len(name) == 1 or name.isdigit():
    return name
  for ch in name:
    if ch.isalnum():
      return ch.upper()
  return None


def dominoes_from_loops(loops, closed, sat=90, val=85):
  """closed: one flag for all loops, or a list with one flag per loop."""
  domino_list = []
  total = sum(len(lp) for lp in loops)
  flags = closed if isinstance(closed, (list, tuple)) else [closed] * len(loops)
  i = 0
  for lp, closed in zip(loops, flags):
    for j, p in enumerate(lp):
      if j + 1 < len(lp):
        nxt = lp[j + 1]
      elif closed and len(lp) > 2:
        nxt = lp[0]
      else:
        nxt = None
      if nxt is not None:
        angle = math.atan2(nxt[1] - p[1], nxt[0] - p[0]) + math.pi / 2
      else:
        angle = domino_list[-1].angle if domino_list else 0
      color = pygame.Color(0)
      color.hsva = (int(i * 360 / max(1, total)) % 360, sat, val, 100)
      domino_list.append(Domino(p[0], p[1], angle, color))
      i += 1
  return domino_list


TOPPLE_PUSH = 0.3      # rad: a falling domino pushes the next one at this tilt


def wrap_text(font, text, max_w):
  lines, line = [], ""
  for word in text.split():
    trial = f"{line} {word}".strip()
    if font.size(trial)[0] <= max_w or not line:
      line = trial
    else:
      lines.append(line)
      line = word
  if line:
    lines.append(line)
  return lines


def fit_label(font, text, color, max_w):
  lbl = font.render(text, True, color)
  if lbl.get_width() > max_w:
    lbl = pygame.transform.smoothscale(
        lbl, (int(max_w), max(1, int(lbl.get_height() * max_w / lbl.get_width()))))
  return lbl


def today_number():
  return datetime.date.today().toordinal()


class Game(ui_draw.GameDrawing):

  def __init__(self, sfx, speaker):
    self.sfx = sfx
    self.speaker = speaker
    self.subjects = hub.subjects()
    self.subject = next(iter(self.subjects))
    self.cat = self.subjects[self.subject][0]
    self.page = 0
    self.puzzle = list(hub.CATEGORIES_HUB[self.cat].keys())[0]

    self.fonts = {}
    self.font = self.font_at(15)
    self.small_font = self.font_at(12)
    self.cat_font = self.font_at(13)
    self.hint_font = self.font_at(17)
    self.big_font = self.font_at(24)
    self.tile_fonts = {}
    self.images = {}

    # Delight: saved progress + stickers, theme, particles, trace streaks
    total = sum(len(v) for v in hub.CATEGORIES_HUB.values())
    self.progress = fun.Progress(total)
    self.progress.mark_day(datetime.date.today().isoformat())
    self.theme = fun.THEMES[self.progress.data.get("theme", 0) % len(fun.THEMES)]
    self.particles = fun.Particles()
    self.streak = fun.Streak()
    self.calls = calls.CallBank(enabled=getattr(sfx, "ok", True))
    self.started_at = time.time()        # the menu button glows at first
    self.player = video.VideoPlayer()    # "watch real" videos
    self.overlay = None          # "shelf", "menu", "players", "rename", ...
    self.celebration = None      # (sticker id, start time)
    self.last_tick = time.time()
    self.mode = "trace"          # "trace", "quiz" or "spell"
    self.quiz = self.spell = None
    self.road = None             # Cross the Road (roadsafety.py)
    self.maths = None
    self.topple = None            # Maths Play (mathsgame.py)
    self.story = None            # {"story": dict, "step": int}
    self.banner_override = None
    self.call_at = None
    self.rename_text = ""
    self.in_world = True         # the game opens in Wonder Town (world.py)
    self.voiced_cat = None       # the house whose first picture has spoken
    self.spell_card = False      # the "ABC" spelling card is open
    self.spelling_at = -100.0    # when the name was last spelled aloud (letters light up)
    self.jingle_notes = []       # [(time, MIDI note, volume, instrument)] of the ♪ tune
    self.last_jingle_inst = None

    self.load_item(announce=False)
    self.world = world.WorldScene(self)
    # The opening show: a screen-filling domino chain, biggest to dot-sized (intro.py)
    self.intro = intro.Intro(self.sfx, self.font_at(40))

  # ------------------------------------------------------------ helpers
  def font_at(self, size):
    if size not in self.fonts:
      self.fonts[size] = load_font(size)
    return self.fonts[size]

  def native_text(self, text, size, colour=(255, 255, 255), lang=None):
    """Hindi or Bengali words drawn with Noto Sans (the game's own font has no Indian
    letters); None for English or when the font is missing."""
    lang = lang or self.lang
    if lang not in NATIVE_FONTS or not text:
      return None
    f = self.native_font(lang, size)
    if f is None:
      return None
    missing = self.fonts.get(("missing", lang))
    if missing is None:                    # glyphs the font lacks draw as its "tofu" box
      tofu = pygame.image.tobytes(f.render("", True, (0, 0, 0), (255, 255, 255)), "RGB")
      missing = self.fonts[("missing", lang)] = {
          c for c in map(chr, range(32, 127)) if c != " " and pygame.image.tobytes(
              f.render(c, True, (0, 0, 0), (255, 255, 255)), "RGB") == tofu}
    other = self.native_font("hi" if lang == "bn" else "bn", size) if missing else None
    runs = []                              # Bengali has no Latin digits or signs: those
    for c in text:                         # come from the matching Noto Devanagari font
      use = other if (other and c in missing) else f
      if runs and runs[-1][0] is use:
        runs[-1][1].append(c)
      else:
        runs.append((use, [c]))
    if len(runs) == 1:
      return f.render(text, True, colour)
    parts = [(fn, fn.render("".join(cs), True, colour)) for fn, cs in runs]
    top = max(fn.get_ascent() for fn, _ in parts)
    out = pygame.Surface((sum(p.get_width() for _, p in parts),
                          max(top - fn.get_ascent() + p.get_height() for fn, p in parts)), pygame.SRCALPHA)
    x = 0
    for fn, p in parts:
      out.blit(p, (x, top - fn.get_ascent()))
      x += p.get_width()
    return out

  def native_name(self, name, size, colour=(255, 255, 255)):
    """A letter section's or subject's name in Hindi / Bangla mode (CATEGORY_NATIVE), or None."""
    k = {"hi": 0, "bn": 1}.get(self.lang)
    words = CATEGORY_NATIVE.get(name)
    if k is None or not words:
      return None
    key = ("name", name, size, colour, self.lang)
    if key not in self.fonts:
      self.fonts[key] = self.native_text(words[k], size, colour)
    return self.fonts[key]

  def native_font(self, lang, size):
    key = ("native", lang, size)
    if key not in self.fonts:
      try:
        f = pygame.font.Font(os.path.join(os.path.dirname(FONT_FILE), NATIVE_FONTS[lang][0]), size)
        f.set_script(NATIVE_FONTS[lang][1])     # joins the letters properly (HarfBuzz)
      except Exception:
        f = None
      self.fonts[key] = f
    return self.fonts[key]

  @property
  def shelf_open(self):
    return self.overlay == "shelf"

  @shelf_open.setter
  def shelf_open(self, value):
    self.overlay = "shelf" if value else None

  @property
  def lang(self):
    return self.progress.data.get("lang", "hi")

  def native_word(self, cat, name):
    """The item's name in the child's second language (None for English)."""
    if self.lang == "en":
      return None
    item = hub.CATEGORIES_HUB.get(cat, {}).get(name, {})
    return item.get(self.lang)

  def say(self, text, native=None, lang=None):
    self.speaker.say(text, hindi=native, lang=lang or self.lang)

  def page_of(self, name):
    per = self.per_page()
    items = self.items()
    return items.index(name) // per if per and name in items else 0

  def story_of_today(self):
    return stories.story_of_the_day(today_number())

  @property
  def is_custom(self):
    return self.puzzle == CUSTOM

  def key(self, name=None, cat=None):
    return hub.item_key(cat or self.cat, name or self.puzzle)

  # ------------------------------------------------------------ rainbow cap, guides
  def cap_count(self):
    """Subjects discovered so far (each paints one stripe of the cap)."""
    return len(fun.cap_subjects(self.progress.data["done"], self.subjects))

  def cap_colours(self):
    return fun.cap_colours(self.cap_count())

  def open_guide(self, key=None, page=0):
    key = key or howto.guide_key(self)
    seen = self.progress.data.setdefault("guides", [])
    if key not in seen:
      seen.append(key)
      self.progress.save()
    howto.GUIDE.open(self, key, page)

  def guide_first_time(self):
    """The first time a child plays each way, its picture guide opens. Tracing and
    drawing start straight away instead: the helping hand shows how on the picture
    itself (howto.draw_idle_hand), and Games > How to play still has the guide."""
    if self.overlay or self.in_world:
      return
    key = howto.guide_key(self)
    if key in ("trace", "draw"):
      return
    if key not in self.progress.data.setdefault("guides", []):
      self.open_guide()

  # ------------------------------------------------------------ item state
  def load_item(self, announce=True):
    """(Re)start the current item at the tracing stage."""
    stratos_track.track("level_start", level=f"{self.cat}/{self.puzzle}")   # analytics: a picture starts
    self.stage = "draw" if self.is_custom else "trace"
    self.user_points = []
    self.drawing = []            # free drawing: [crayon colour, points] per stroke
    self.copy_loops = None       # Draw it: the outline the pencil draws for the child to copy
    self.crayon = getattr(self, "crayon", 0)
    self.strokes = []
    self.last_pointer = None
    self.dominoes = []
    self.finished_at = 0.0
    self.praised_at = -10.0
    self.celebration = None
    self.call_at = None
    self.last_progress_at = time.time()   # the helping hand waits from here
    self.sing = None                      # sing-along card of a rhyme (singalong.py)
    self.show = None                      # the domino show (magic.py)
    self.nudged = self.tap_nudged = False
    self.spell_card = False
    self.praise_line = ""
    self.announced_at = time.time()       # the name tiles drop in
    self.music = magic.plan_music()       # this picture's domino music (never the last one's)
    if hasattr(self, "particles"):
      self.particles.texts = []
    # the picture fills the play area (at least 85% of its width or height), with
    # room left at the bottom for the hint and the progress bar
    box = pygame.Rect(PLAY_RECT.x + 8, PLAY_RECT.y + 8, PLAY_RECT.w - 16,
                      PLAY_RECT.h - 8 - PIC_BOTTOM)
    self.box = (box.x, box.y, box.w, box.h)
    if self.is_custom:
      self.closed = False
      self.loops = []
      self.loop_closed = []
      self.dots, self.covered = [], []
      self.context = []
      self.pic_path = self.pic_rect = None
    else:
      self.closed = hub.CATEGORIES_HUB[self.cat][self.puzzle].get("closed", True)
      # the outline, then the picture's inside parts (wheels, windows, legs)
      self.loops, self.loop_closed = hub.fetch_trace_from_hub(
          self.puzzle, self.box, cat=self.cat)
      self.dots = [p for lp in self.loops for p in lp]
      self.covered = [False] * len(self.dots)
      self.context = hub.fetch_context_from_hub(self.puzzle, self.box, cat=self.cat)
      self.pic_path, self.pic_rect = hub.fetch_picture_from_hub(
          self.puzzle, self.box, cat=self.cat)
    self.places = ([] if self.is_custom else
                   hub.fetch_places_from_hub(self.puzzle, self.box, cat=self.cat))
    if announce:
      self.voice_first()

  def voice_first(self):
    """Pictures are shown, not talked about: only the first picture of each house
    says what it is and what to do (stories still tell their story)."""
    if self.mode != "trace":
      return
    if self.story:
      self.announce(self.story_line())
    elif self.cat != self.voiced_cat:
      self.voiced_cat = self.cat
      item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
      if self.is_custom:
        todo = ""
      elif item.get("rhyme") or item.get("chant"):
        todo = " Trace the picture, then tap Sing."
      else:
        todo = " Trace the dots!"
      self.announce(after=todo)

  def announce(self, before="", after=""):
    """Says the item's name (no spelling: that is the ABC card), in English and
    the second language. Used when a child taps the speaker."""
    self.announced_at = time.time()
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    if self.is_custom or item.get("hindi"):
      text = hub.spoken_text(self.puzzle, self.cat)
    else:
      text = f"{item.get('label') or self.puzzle}!"
    text = " ".join(t for t in (before, text, after.strip()) if t)
    if item.get("hindi"):                     # Hindi / Bangla letters speak their language
      self.say(text, item["hindi"], item.get("say_lang", "hi"))
      return
    word = self.native_word(self.cat, self.puzzle)
    self.say(text, f"{text} {word}" if word else None)

  def can_spell(self):
    """The ABC spelling card is there for pictures with a name to spell."""
    if self.mode != "trace" or self.is_custom or self.banner_override:
      return False
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    return not item.get("rhyme")

  def spell_aloud(self):
    """Says the name, spells it letter by letter (the letters light up) and says it
    again, only when a child asks for it (ABC card, Spelling game)."""
    self.spelling_at = time.time()
    text = hub.spoken_text(self.puzzle, self.cat)
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    if item.get("hindi"):
      self.say(text, item["hindi"], item.get("say_lang", "hi"))
      return
    word = self.native_word(self.cat, self.puzzle)
    self.say(text, f"{text} {word}" if word else None)

  def play_jingle(self):
    """The ♪ button: a short tune, different from the last one, only when tapped."""
    ready = [i for i in magic.INSTRUMENTS if self.sfx.ok and self.sfx.ready(i)]
    fresh = [i for i in ready if i != self.last_jingle_inst]
    inst = random.choice(fresh) if fresh else self.music["inst"]
    self.last_jingle_inst = inst
    now = time.time()
    self.jingle_notes = [(now + t, m, v, inst) for t, m, v in magic.jingle(inst)]
    self.jingle_at = now

  def stand_dominoes(self, loops):
    self.last_progress_at = time.time()
    # each domino carries the picture's letter (C for Car) and they drop
    # onto the picture one after another
    self.domino_letter = None if self.is_custom else domino_letter_of(self.puzzle)
    flags = self.loop_closed
    if self.domino_letter is not None:
      # big letter dominoes: fewer of them, spaced for a clear letter each
      big, flags = [], []
      for lp, closed in zip(loops, self.loop_closed):
        pts = hub._resample(list(lp), closed and len(lp) > 2, LETTER_SPACING)
        if pts:
          big.append(pts)
          flags.append(closed and len(pts) > 2)
      loops = big
    self.dominoes = dominoes_from_loops(loops, flags, self.theme["domino_sat"],
                                        self.theme["domino_val"])
    now = time.time()
    gap = min(DROP_GAP, DROP_ALL / max(1, len(self.dominoes)))
    for i, d in enumerate(self.dominoes):
      d.drop_at = now + 0.25 + i * gap
    self.landed = 0
    self.stage = "ready"
    self.strokes = []
    self.sfx.play("switch")

  def dropping(self, now=None):
    """True while the dominoes are still dropping onto the picture."""
    return bool(self.dominoes) and (now or time.time()) < self.dominoes[-1].drop_at + DROP_TIME

  def letter_surface(self):
    """The domino letter on an upright white badge with a dark rim, so it
    reads clearly whichever way the domino stands (cached per item)."""
    key = (self.cat, self.puzzle)
    if getattr(self, "_letter_key", None) != key:
      self._letter_key, self._letter_surf = key, None
      item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
      if item.get("hindi") and self.pic_path:       # Hindi letters: the letter picture
        ink = self.native_letter_image()
      elif self.domino_letter:
        size = 14 if len(self.domino_letter) == 1 else 10
        ink = self.render_char(self.domino_letter, size, (25, 30, 70))
      else:
        ink = None
      if ink is not None:
        d = BADGE_R * 2 + 2
        surf = pygame.Surface((d, d), pygame.SRCALPHA)
        pygame.draw.circle(surf, (25, 30, 70), (d // 2, d // 2), BADGE_R + 1)
        pygame.draw.circle(surf, WHITE, (d // 2, d // 2), BADGE_R - 1)
        surf.blit(ink, ink.get_rect(center=(d // 2, d // 2 + 1)))
        self._letter_surf = surf
    return self._letter_surf

  def native_letter_image(self):
    img = self.image(self.pic_path)
    if img is None:
      return None
    img = img.subsurface(img.get_bounding_rect())   # just the letter, no margin
    s = 17 / max(img.get_width(), img.get_height())
    return pygame.transform.smoothscale(
        img, (max(1, int(img.get_width() * s)), max(1, int(img.get_height() * s))))

  def start_cascade(self):
    if not self.dominoes:
      return
    # every cascade is a new little show (magic.py): its own music, twists,
    # magic and finale. Each push time is worked out in advance, so the show
    # runs the same at any frame rate.
    n = len(self.dominoes)
    self.show = magic.Show(n, music=self.music)
    at = time.time()
    for i, d in enumerate(self.dominoes):
      d.state = "standing"
      d.current_angle = 0.0
      d.fall_at = at
      d.spin = self.show.tip_speed(i, TOPPLE_PUSH)
      at += self.show.gaps[i]                  # the next one is pushed from here
    self.stage = "running"
    self.dominoes[0].state = "falling"
    self.sfx.play("tip")

  # ------------------------------------------------------------ modes
  def set_mode(self, mode):
    self.in_world = False
    self.story = None
    self.particles.texts = []
    self.mode = mode
    self.banner_override = None
    self.quiz = self.spell = self.road = self.maths = None
    self.topple = None
    if mode == "quiz":
      self.quiz = modes.QuizMode(self, (self.cat, self.puzzle))
    elif mode == "spell":
      self.spell = modes.SpellMode(self, self.puzzle)
    elif mode == "road":
      self.road = roadsafety.RoadGame(self)
      self.banner_override = "ROAD SAFETY"
    elif mode == "maths":
      self.maths = mathsgame.MathsGame(self)
    else:
      self.load_item()

  def start_story(self, story):
    self.in_world = False
    self.mode = "trace"
    self.quiz = self.spell = None
    self.banner_override = None
    self.story = {"story": story, "step": 0}
    self.go_story_step()

  def story_line(self):
    s = self.story
    return s["story"]["steps"][s["step"]][2]

  def go_story_step(self):
    cat, name, _line = self.story["story"]["steps"][self.story["step"]]
    self.subject = next(s for s, cats in self.subjects.items() if cat in cats)
    self.cat, self.puzzle = cat, name
    self.page = self.page_of(name)
    self.load_item()

  def enter_topple(self):
    if not self.topple:
      self.topple = topplegame.ToppleMode(self)
    self.mode = "topple"
    self.say("Welcome to Domino Topple!", "डोमिनो टोपल में स्वागत है!")

  def leave_story(self):
    self.story = None

  # ------------------------------------------------------------ real videos
  def current_video(self):
    """The item's checked real-life video, only while tracing (not in quizzes)."""
    if self.mode != "trace" or self.banner_override or self.is_custom:
      return None
    return hub.video_for(self.cat, self.puzzle)

  def watch_video(self):
    clip = self.current_video()
    title = hub.CATEGORIES_HUB[self.cat][self.puzzle].get("label") or self.puzzle
    self.call_at = None                  # no animal call over the video
    full = getattr(self, "fullscreen", None)
    if full and not IS_WEB and not IS_ANDROID:
      full.pause()                       # computer: let the browser come in front
    if not self.player.show(clip, title):
      if full:
        full.resume()
      self.say("Sorry, the video cannot play here.")

  def current_photo(self):
    """The item's approved real photo / live camera (photos.json), only while tracing."""
    if self.mode != "trace" or self.banner_override or self.is_custom:
      return None
    return hub.photo_for(self.cat, self.puzzle)

  def see_photo(self):
    title = hub.CATEGORIES_HUB[self.cat][self.puzzle].get("label") or self.puzzle
    word = hub.letter_word(self.cat, self.puzzle)
    if word:
      title = hub.CATEGORIES_HUB[word[0]][word[1]].get("label") or word[1]
    self.sfx.play("click")
    self.call_at = None
    full = getattr(self, "fullscreen", None)
    if full and not IS_WEB and not IS_ANDROID:
      full.pause()
    if not self.player.show_photo(self.current_photo(), title):
      if full:
        full.resume()
      self.say("Sorry, the photo cannot open here.")

  def back_from_video(self):
    """Back to play: a finished picture starts again so the child can redo it."""
    full = getattr(self, "fullscreen", None)
    if full:
      full.resume()
    if self.stage == "finished" and not self.story:
      self.load_item(announce=False)

  def start_drawing(self):
    """Games menu: straight to the free drawing page."""
    self.in_world = False
    self.mode = "trace"
    self.story = None
    self.quiz = self.spell = None
    self.banner_override = None
    self.particles.texts = []
    self.subject = next(s for s, cats in self.subjects.items() if "Draw" in cats)
    self.cat, self.puzzle = "Draw", CUSTOM
    self.page = self.page_of(CUSTOM)
    self.load_item()

  def next_language(self):
    order = LANG_ORDER
    cur = self.lang if self.lang in order else "hi"
    self.progress.data["lang"] = order[(order.index(cur) + 1) % len(order)]
    self.progress.save()
    self.announce()

  def set_language(self, code):
    """A language tab: English, Hindi or Bangla."""
    self.sfx.play("click")
    if code == self.lang:
      return
    self.progress.data["lang"] = code
    self.progress.save()
    if self.mode == "maths" and self.maths:
      self.maths.ask()                    # the question again, in the new language
    else:
      self.announce()

  def apply_profile(self):
    self.theme = fun.THEMES[self.progress.data.get("theme", 0) % len(fun.THEMES)]
    self.progress.mark_day(datetime.date.today().isoformat())

  def start_rename(self):
    self.rename_text = self.progress.data["name"]
    self.overlay = "rename"
    if IS_ANDROID:     # the phone's keyboard would cover the game's big letters
      return
    try:
      pygame.key.start_text_input()
    except Exception:
      pass

  def type_text(self, text):
    if len(self.rename_text) < 14:
      self.rename_text += text

  def finish_rename(self):
    name = self.rename_text.strip()[:14]
    if name:
      self.progress.data["name"] = name
      self.progress.save()
    try:
      pygame.key.stop_text_input()
    except Exception:
      pass
    self.overlay = "players"

  def go_to_town(self):
    """Back to Wonder Town, to the door you left from. In the browser: back to the 3D Wonder Town (town/)."""
    if IS_WEB:
      try:
        import platform
        platform.window.location.href = "town/"
        return
      except Exception:
        pass
    self.sfx.play("switch")
    self.overlay = None
    self.in_world = True
    self.voiced_cat = None          # entering a house again: its first picture speaks

  # ------------------------------------------------------------ navigation
  def items(self):
    return list(hub.CATEGORIES_HUB[self.cat].keys())

  def select_subject(self, subj):
    self.sfx.play("switch")
    self.subject = subj
    self.select_category(self.subjects[subj][0], sound=False)

  def select_category(self, cat, sound=True):
    if sound:
      self.sfx.play("switch")
    self.leave_story()
    self.cat = cat
    self.page = 0
    self.puzzle = self.items()[0]
    self.fetch_pack(cat)
    self.refresh_mode()

  def fetch_pack(self, cat):
    """Browser: if this category's pictures are in a class pack not downloaded yet, fetch it (packs.py)."""
    pics = [v for item in hub.CATEGORIES_HUB.get(cat, {}).values() for v in item.values()
            if isinstance(v, str) and v.startswith("pics/")]
    packs.request(pics, self.pack_arrived)

  def pack_arrived(self, pack):
    """A class pack is unpacked: pictures that could not load before are tried again on the next frame."""
    self.images = {k: v for k, v in self.images.items() if v is not None}

  def select_puzzle(self, name):
    self.in_world = False
    self.sfx.play("click")
    self.leave_story()
    self.puzzle = name
    self.refresh_mode(name)

  def refresh_mode(self, name=None):
    if self.mode in ("road", "maths"):  # a picture picked from the menu: trace it
      self.mode, self.road, self.maths, self.banner_override = "trace", None, None, None
    if self.mode == "quiz":
      self.quiz = modes.QuizMode(self, (self.cat, name) if name else None)
    elif self.mode == "spell":
      self.spell = modes.SpellMode(self, name)
    else:
      self.load_item()

  def next_item(self):
    """Next item; moves on to the next category and subject at the end."""
    if self.story:
      if self.story["step"] + 1 < len(self.story["story"]["steps"]):
        self.story["step"] += 1
        self.sfx.play("click")
        self.go_story_step()
        return
      self.leave_story()
    if self.mode == "quiz":
      self.sfx.play("click")
      self.quiz.new_question()
      return
    if self.mode == "spell":
      self.sfx.play("click")
      self.spell.start()
      return
    if self.mode == "road":
      self.sfx.play("click")
      if self.road.kid in ("wait", "arrived"):
        self.road.new_round()
      return
    if self.mode == "maths":
      self.sfx.play("click")
      self.maths.next_button()
      return
    order = [(s, c, n) for s, cats in self.subjects.items() for c in cats
             for n in hub.CATEGORIES_HUB[c]]
    idx = order.index((self.subject, self.cat, self.puzzle))
    self.subject, self.cat, self.puzzle = order[(idx + 1) % len(order)]
    self.page = self.page_of(self.puzzle)
    self.sfx.play("click")
    self.load_item()

  def peek_next(self):
    """The picture Next would open (for the "What's next?" mystery card)."""
    if self.story or self.mode != "trace":
      return None
    order = [(c, n) for s, cats in self.subjects.items() for c in cats
             for n in hub.CATEGORIES_HUB[c]]
    try:
      i = order.index((self.cat, self.puzzle))
    except ValueError:
      return None
    return order[(i + 1) % len(order)]

  def per_page(self):
    cells = BANK_COLS * BANK_ROWS
    return cells if len(self.items()) <= cells else cells - 1

  # ------------------------------------------------------------ layout
  def subject_rects(self):
    subs = list(self.subjects)
    if len(subs) <= SUBJ_PER_PAGE + 1:
      w = PANEL_W / len(subs)
      return [(pygame.Rect(int(i * w) + 2, 4, int(w) - 4, 32), s)
              for i, s in enumerate(subs)]
    # many subjects: a readable few at a time, with < and > to page through
    per, arrow = SUBJ_PER_PAGE, 28
    pages = math.ceil(len(subs) / per)
    if getattr(self, "subj_page_of", None) != self.subject:
      self.subj_page_of = self.subject
      self.subj_page = subs.index(self.subject) // per if self.subject in subs else 0
    self.subj_page %= pages
    shown = subs[self.subj_page * per:(self.subj_page + 1) * per]
    w = (PANEL_W - 2 * arrow) / per
    out = [(pygame.Rect(2, 4, arrow - 4, 32), "<")]
    out += [(pygame.Rect(arrow + int(i * w) + 2, 4, int(w) - 4, 32), s) for i, s in enumerate(shown)]
    out.append((pygame.Rect(PANEL_W - arrow + 2, 4, arrow - 4, 32), ">"))
    return out

  def category_rects(self):
    cats = self.subjects[self.subject]
    if len(cats) <= CAT_PER_PAGE + 1:
      w = PANEL_W / len(cats)
      return [(pygame.Rect(int(i * w) + 3, 44, int(w) - 6, 30), c)
              for i, c in enumerate(cats)]
    # many categories (EVS, Science): a few at a time, with < and > to page through
    per, arrow = CAT_PER_PAGE, 28
    pages = math.ceil(len(cats) / per)
    if getattr(self, "cat_page_of", None) != self.subject:
      self.cat_page_of = self.subject
      self.cat_page = cats.index(self.cat) // per if self.cat in cats else 0
    self.cat_page %= pages
    shown = cats[self.cat_page * per:(self.cat_page + 1) * per]
    w = (PANEL_W - 2 * arrow) / per
    out = [(pygame.Rect(3, 44, arrow - 5, 30), "<")]
    out += [(pygame.Rect(arrow + int(i * w) + 2, 44, int(w) - 4, 30), c) for i, c in enumerate(shown)]
    out.append((pygame.Rect(PANEL_W - arrow + 2, 44, arrow - 5, 30), ">"))
    return out

  def bank_cells(self):
    """[(rect, item name or '>more')] for the current page of items."""
    items = self.items()
    per = self.per_page()
    pages = max(1, math.ceil(len(items) / per))
    self.page %= pages
    shown = items[self.page * per:(self.page + 1) * per]
    cells = [(name) for name in shown]
    if pages > 1:
      cells.append(">more")
    cw = PANEL_W / BANK_COLS
    ch = (BANK_RECT.h - 8) / BANK_ROWS
    out = []
    for i, name in enumerate(cells):
      r, c = divmod(i, BANK_COLS)
      rect = pygame.Rect(int(c * cw) + 4, int(BANK_RECT.y + 4 + r * ch) + 2,
                         int(cw) - 8, int(ch) - 4)
      out.append((rect, name))
    return out, pages

  # ------------------------------------------------------------ input
  def press(self, pos):
    mx, my = pos
    if self.intro:                       # a tap skips the opening show
      self.intro.skip()
      return
    if self.overlay == "shelf":          # any tap closes the sticker shelf
      self.overlay = None
      self.sfx.play("click")
      return
    if self.overlay:
      px, py = mx - NAV_X, my - NAV_Y      # panels sit in the middle of the screen
      if self.overlay == "nav":
        self.menu_press(px, py)
        return
      if GAMES_RECT.collidepoint(px, py) and self.overlay != "rename":
        self.overlay = None
        self.sfx.play("click")
        return
      screens.PANELS[self.overlay].press(self, (px, py))
      return
    if self.in_world:
      self.world.press(pos)
      return
    if self.spell_card:                  # the ABC card: its buttons, or a tap closes it
      act = self.spell_card_hit(pos)
      if act == "say":
        self.sfx.play("click")
        self.announce()
      elif act == "spell":
        self.sfx.play("click")
        self.spell_aloud()
      elif act != "card":
        self.spell_card = False
        self.sfx.play("click")
      return
    # Only Menu, Home, Next, the name's speaker and ABC sit on the game screen; the domino
    # playground and "How to play" are rows of the Games menu.
    if (self.can_spell() and math.hypot(mx - SPELL_CENTER[0], my - SPELL_CENTER[1])
        <= SPEAKER_R + 4):
      self.sfx.play("click")
      self.spell_card = True
      self.spell_aloud()
    elif (self.mode == "trace" and self.stage != "draw"
          and math.hypot(mx - JINGLE_CENTER[0], my - JINGLE_CENTER[1]) <= JINGLE_R + 4):
      self.play_jingle()
    elif self.show_lang_tabs() and self.lang_tab_hit((mx, my)):
      self.set_language(self.lang_tab_hit((mx, my)))
    elif TOWN_BTN.collidepoint(mx, my):
      self.go_to_town()
    elif MENU_BTN.collidepoint(mx, my):
      self.sfx.play("switch")
      self.overlay = "nav"
    elif NEXT_BTN.collidepoint(mx, my):
      self.next_item()
    elif BANNER_RECT.collidepoint(mx, my):
      self.sfx.play("click")
      word = (hub.letter_word(self.cat, self.puzzle)
              if self.mode == "trace" and not self.is_custom and self.stage != "draw" else None)
      if word and mx < BANNER_RECT.x + 64:   # the letter's word picture (A -> apple)
        cat, word = word
        if self.current_video() and self.stage == "finished":
          self.watch_video()                   # the real one
        else:
          self.say(f"{self.puzzle} for {word}!" if self.cat in ("ABC", "abc") else f"{word}!",
                   self.native_word(cat, word))
          self.calls.play(word)
        return
      if mx < BANNER_RECT.x + 64 and self.calls.play(self.puzzle):
        return                   # tap the little picture to hear its sound
      if self.mode == "quiz":
        self.quiz.ask()
      elif self.mode == "road":
        self.road.say_hint()
      elif self.mode == "maths":
        self.maths.ask()
      elif self.sing and not self.sing.singing:
        self.sing.restart()
      elif self.mode == "spell" and self.spell.done_at is None:
        self.say(f"Spell the word: {self.puzzle}.", self.native_word(self.cat, self.puzzle))
      else:
        self.announce()
    elif PLAY_RECT.collidepoint(mx, my):
      if self.mode == "quiz":
        self.quiz.press(pos)
        return
      if self.mode == "spell":
        self.spell.press(pos)
        return
      if self.mode == "road":
        self.road.press(pos)
        return
      if self.mode == "maths":
        self.maths.press(pos)
        return
      if self.mode == "topple" and self.topple:
        self.topple.handle_click((mx, my))
        return
      if (self.stage == "finished" and self.celebration
          and time.time() - self.celebration[1] < 0.8):
        return                   # don't skip the new sticker by accident
      if self.stage == "draw":
        self.draw_press(mx, my)
      elif self.stage == "trace":
        self.last_pointer = (mx, my)
        self.strokes.append([(mx, my)])
        self.cover_along((mx, my), (mx, my))
      elif self.stage == "ready":
        if not self.dropping():
          self.start_cascade()
      elif self.stage == "finished":
        if (time.time() - self.finished_at >= 1.5 and not self.is_custom
            and self.peek_next() and self.whats_next_rect().collidepoint(mx, my)):
          self.next_item()                   # the mystery picture
          return
        if self.sing_rect() and self.sing_rect().collidepoint(mx, my):
          self.sfx.play("click")          # rhymes sing only when the child asks
          self.sing = singalong.SingAlong(self, self.cat, self.puzzle, delay=0.4)
          return
        if self.sing:                     # rhyme: tap the words to sing again
          if self.sing.card_rect(PLAY_RECT).collidepoint(mx, my) or self.sing.singing:
            if not self.sing.singing:
              self.sfx.play("click")
              self.sing.restart()
            return
        act = self.showcase_hit((mx, my))
        if act == "hear":                 # the showcase tabs under the picture
          self.calls.play(self.puzzle)
          return
        if act == "spell":
          self.sfx.play("click")
          self.spell_card = True
          self.spell_aloud()
          return
        if act == "draw":
          self.start_copy()
          return
        if act == "photo":
          self.see_photo()
          return
        if self.current_video() and self.watch_rect().collidepoint(mx, my):
          self.watch_video()
        elif self.story:
          self.next_item()
        else:
          self.sfx.play("click")
          self.load_item(announce=False)  # play again, endlessly

  def drag(self, pos):
    if self.intro:
      return
    if self.in_world and not self.overlay:
      self.world.drag(pos)
      return
    if not self.overlay and self.mode == "topple" and self.topple:
      if PLAY_RECT.collidepoint(pos):
        self.topple.handle_drag(pos)
      return
    if self.overlay or self.mode != "trace":
      return
    mx, my = pos
    if self.stage == "draw" and self.user_points:
      if PLAY_RECT.collidepoint(mx, my):
        my = max(my, TOOLBAR_BOTTOM)
        last = self.user_points[-1]
        self.stroke_since_sound += math.hypot(mx - last[0], my - last[1])
        self.user_points.append((mx, my))
        if self.stroke_since_sound >= 22:
          self.stroke_since_sound = 0.0
          self.sfx.play("pencil")
    elif self.stage == "trace" and self.last_pointer is not None:
      self.cover_along(self.last_pointer, (mx, my))
      self.last_pointer = (mx, my)
      if self.strokes:
        self.strokes[-1].append((mx, my))

  def release(self, pos):
    if self.intro:
      return
    if self.in_world:
      self.world.release(pos)
    if self.overlay or self.mode != "trace":
      self.last_pointer = None
      return
    if self.stage == "draw":
      self.user_points = []      # the stroke stays in self.drawing; draw more!
    self.last_pointer = None

  # ------------------------------------------------------------ free drawing
  def start_copy(self):
    """Draw it: a pencil slowly draws this picture's own outline, line by line, and
    the child draws it with the crayons; Done turns the child's lines into dominoes."""
    self.sfx.play("click")
    if not self.copy_loops:   # again after a Draw it: the picture's outline, not the child's lines
      self.copy_loops = [list(lp) for lp in self.loops if len(lp) > 1]
      flags = [c for lp, c in zip(self.loops, self.loop_closed) if len(lp) > 1]
      self.copy_flags = flags + [False] * (len(self.copy_loops) - len(flags))
      self.copy_loops = self.below_toolbar(self.copy_loops)
    length = 0.0
    for lp, closed in zip(self.copy_loops, self.copy_flags):
      pts = lp + lp[:1] if closed and len(lp) > 2 else lp
      length += sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
    self.copy_length = length
    self.copy_speed = length / min(COPY_MAX_SECS, max(COPY_MIN_SECS, length / COPY_SPEED))
    self.copy_at = time.time()
    self.stage = "draw"
    self.particles.items, self.particles.texts = [], []   # a clean page for drawing
    self.drawing, self.user_points, self.strokes = [], [], []
    self.dominoes = []
    self.show = self.celebration = self.sing = None
    self.spell_card = False
    self.praise_line = ""
    self.last_progress_at = time.time()

  @staticmethod
  def below_toolbar(loops):
    """The outline shrunk and moved, if needed, into the page under the crayons."""
    xs = [p[0] for lp in loops for p in lp]
    ys = [p[1] for lp in loops for p in lp]
    area = pygame.Rect(PLAY_RECT.x + 8, TOOLBAR_BOTTOM + 6, PLAY_RECT.w - 16,
                       PLAY_RECT.bottom - PIC_BOTTOM - TOOLBAR_BOTTOM - 6)
    w, h = max(1.0, max(xs) - min(xs)), max(1.0, max(ys) - min(ys))
    if min(ys) >= area.top and max(ys) <= area.bottom:
      return loops
    k = min(1.0, area.w / w, area.h / h)
    ox = area.centerx - (min(xs) + w / 2) * k
    oy = area.centery - (min(ys) + h / 2) * k
    return [[(ox + x * k, oy + y * k) for x, y in lp] for lp in loops]

  def copy_drawing(self, now=None):
    """True while the pencil is still drawing the outline."""
    if not self.copy_loops:
      return False
    return ((now or time.time()) - self.copy_at) * self.copy_speed < self.copy_length

  def draw_press(self, mx, my):
    """Free drawing: pick a crayon, Undo, Done, or start a new stroke."""
    if (self.copy_loops and not self.copy_drawing()
        and math.hypot(mx - JINGLE_CENTER[0], my - JINGLE_CENTER[1]) <= JINGLE_R + 4):
      self.sfx.play("click")             # Draw it: watch the pencil again
      self.copy_at = time.time()
      return
    for i, colour in enumerate(CRAYONS):
      if math.hypot(mx - self.crayon_x(i), my - CRAYON_Y) <= CRAYON_R + 4:
        self.crayon = i
        self.sfx.play("click")
        return
    if self.drawing and UNDO_RECT.collidepoint(mx, my):
      self.drawing.pop()
      self.sfx.play("click")
      return
    if self.drawing and DONE_RECT.collidepoint(mx, my):
      self.finish_drawing()
      return
    my = max(my, TOOLBAR_BOTTOM)
    self.user_points = [(mx, my)]
    self.drawing.append([CRAYONS[self.crayon], self.user_points])
    self.stroke_since_sound = 0.0
    self.sfx.play("pencil")

  @staticmethod
  def crayon_x(i):
    return PLAY_RECT.x + 22 + i * 33

  def finish_drawing(self):
    """Done: every stroke of the child's picture becomes a line of dominoes."""
    strokes = [pts for _c, pts in self.drawing if len(pts) > 1]
    length = sum(math.hypot(b[0] - a[0], b[1] - a[1])
                 for pts in strokes for a, b in zip(pts, pts[1:]))
    spacing = max(12.0, length / MAX_DRAW_DOMINOES)  # big pictures: fewer dominoes
    loops = []
    for pts in strokes:
      loops += hub.fetch_path_from_hub(CUSTOM, self.box, pts, min_spacing=spacing)
    if not loops:
      self.sfx.play("click")
      return
    self.user_points = []
    self.loops = loops
    self.loop_closed = [False] * len(loops)
    self.dots = [p for lp in loops for p in lp]
    self.covered = [True] * len(self.dots)
    self.stand_dominoes(loops)

  def key_down(self, event):
    """Keyboard: typing a name, or Esc to close a panel. Returns True if used."""
    if self.overlay == "rename":
      if event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
        self.finish_rename()
      elif event.key == pygame.K_BACKSPACE:
        self.rename_text = self.rename_text[:-1]
      elif event.key == pygame.K_ESCAPE:
        self.finish_rename()
      return True
    if self.overlay and event.key in (pygame.K_ESCAPE, pygame.K_AC_BACK):
      self.overlay = None
      return True
    if self.in_world and not self.overlay:
      return self.world.key(event)
    return False

  def text_input(self, text):
    if self.overlay == "rename":
      self.type_text(text)

  def next_theme(self):
    idx = (fun.THEMES.index(self.theme) + 1) % len(fun.THEMES)
    self.theme = fun.THEMES[idx]
    self.progress.data["theme"] = idx
    self.progress.save()
    if self.dominoes:            # recolour dominoes already standing
      for d, nd in zip(self.dominoes, dominoes_from_loops(
          [[(d.x, d.y) for d in self.dominoes]], False,
          self.theme["domino_sat"], self.theme["domino_val"])):
        d.color = nd.color
    self.sfx.play("switch")
    self.particles.text(THEME_RECT.centerx, THEME_RECT.top - 14,
                        self.theme["name"], YELLOW)

  def dot_color(self, i):
    color = pygame.Color(0)
    color.hsva = (int(i * 360 / max(1, len(self.dots))) % 360, 85, 100, 100)
    return color

  def cover_along(self, a, b):
    """Covers every dot near the finger's path from a to b."""
    steps = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) // 6))
    r2 = TRACE_RADIUS * TRACE_RADIUS
    newly = []
    for s in range(steps + 1):
      t = s / steps
      px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
      for i, (dx, dy) in enumerate(self.dots):
        if not self.covered[i] and (dx - px) ** 2 + (dy - py) ** 2 <= r2:
          self.covered[i] = True
          newly.append(i)
    if newly:
      self.last_progress_at = time.time()
      done = sum(self.covered)
      # Streak: quick pops in a row climb a musical scale and grow the trail
      now = time.time()
      before = self.streak.count if now - self.streak.last <= fun.STREAK_GAP else 0
      count = self.streak.pop(now, len(newly))
      self.sfx.play("pop", self.streak.note())
      power = 1.0 + min(1.5, count / 20)
      for i in newly[:4]:
        dx, dy = self.dots[i]
        self.particles.sparks(dx, dy, self.dot_color(i), n=5, power=power)
      if count // 10 > before // 10:          # every 10 in a row
        x, y = self.dots[newly[-1]]
        self.particles.text(x, y - 24, f"Streak x{count // 10 * 10}!", YELLOW)
        self.particles.burst(x, y, n=24)
      self.progress.note_streak(count)
      if done >= len(self.dots) * TRACE_DONE:
        self.covered = [True] * len(self.dots)
        self.stand_dominoes(self.loops)

  # ------------------------------------------------------------ physics
  def update(self):
    now = time.time()
    dt = min(0.05, now - self.last_tick)
    self.last_tick = now
    if self.intro:                       # Wonder Town waits until the show is over
      self.intro.update(now, (WIDTH, HEIGHT))
      if not self.intro.done:
        return
      self.intro = None
    self.particles.update(dt)
    if self.in_world:
      self.world.update(dt)
    else:
      self.guide_first_time()
    if self.celebration and now - self.celebration[1] > 3.5:
      self.celebration = None
    if self.call_at and now >= self.call_at:
      self.call_at = None
      self.calls.play(self.puzzle)
    if self.mode == "quiz" and self.quiz:
      self.quiz.update(now)
    if self.mode == "road" and self.road:
      self.road.update(now)
    if self.mode == "topple" and self.topple:
      self.topple.fit(PLAY_RECT)
      self.topple.update(dt)
    if self.mode == "maths" and self.maths:
      self.maths.update(now)
    if self.mode == "trace" and getattr(self, "sing", None):
      self.sing.update(now)
    if getattr(self, "show", None):
      self.show.update(dt)
    while self.jingle_notes and now >= self.jingle_notes[0][0]:
      _at, midi, vol, inst = self.jingle_notes.pop(0)
      self.sfx.note(midi, inst, vol)
    if self.stage != "running" and int(now * 20) % 3 == 0:
      self.sfx.warm(self.music["inst"])    # the coming music's notes, a few at a time
    if self.mode == "trace" and self.stage == "ready" and self.dominoes:
      landed = sum(1 for d in self.dominoes if now >= d.drop_at + DROP_TIME)
      if landed > self.landed:
        if landed // 4 > self.landed // 4 or landed == len(self.dominoes):
          self.sfx.play("clack", landed)
        self.landed = landed
    if self.mode != "trace" or self.stage != "running":
      return
    show = self.show
    for i, d in enumerate(self.dominoes):
      if d.state == "standing" and now >= getattr(d, "fall_at", now):
        d.state = "falling"
        if show:
          note = show.note(i)
          if note is not None:
            self.sfx.note(note, show.inst, show.accent(i))   # the show's own melody
          show.pushed(i, d.x, d.y)             # its magic rises from the line
          if show.is_twist(i) and not show.teased:
            show.teased.add(i)
            self.particles.text(d.x, d.y - 34, "...?", YELLOW)   # will it fall?
      if d.state == "falling":
        d.current_angle = (now - getattr(d, "fall_at", now)) * getattr(d, "spin", 7.2)
        if d.current_angle >= math.pi / 2:
          d.current_angle = math.pi / 2
          d.state = "fallen"
          if i % 2 == 0:
            self.sfx.play("clack", i)
    if all(d.state == "fallen" for d in self.dominoes):
      self.finish_item()

  def finish_item(self):
    self.stage = "finished"
    stratos_track.track("level_complete", level=f"{self.cat}/{self.puzzle}", stage=stratos_track.pic_no(f"{self.cat}/{self.puzzle}"))   # analytics: picture done (+ seconds); stage = Stratos Coins once per picture
    self.finished_at = time.time()
    self.sfx.play("chime")
    if self.show:                          # one of seven celebrations
      area = pygame.Rect(self.pic_rect) if self.pic_rect else PLAY_RECT
      self.show.finale(area, self.sfx)
    self.praised_at = time.time()
    self.call_at = None            # its real sound plays when the little picture is tapped
    self.particles.confetti(PLAY_RECT)
    cat_keys = [self.key(n) for n in hub.CATEGORIES_HUB[self.cat]]
    caps_before = self.cap_count()
    new = self.progress.complete(self.key(), cat_keys, self.cat)
    cap_new = self.cap_count() > caps_before and caps_before < len(fun.RAINBOW)
    praise = hub.praise_text(self.puzzle, self.cat)
    if self.story:
      steps = self.story["story"]["steps"]
      if self.story["step"] == len(steps) - 1:
        new += self.progress.finish_story(self.story["story"]["id"])
        praise += " The end! You finished the story!"
      else:
        praise += " Tap for the next part of the story."
    if new:
      self.celebration = (new[-1], time.time())
      self.particles.burst(PLAY_RECT.centerx, PLAY_RECT.centery, n=60)
      praise += " You got a new sticker!"
    if cap_new:                  # a new subject paints the next stripe of the cap
      self.cap_won = time.time()
      colour = fun.RAINBOW_NAMES[caps_before]
      praise += (f" You found {self.subject}! Your cap is now {colour}!" if caps_before == 0
                 else f" You found {self.subject}! Your cap got {colour}!")
      if caps_before + 1 == len(fun.RAINBOW):
        praise += " All seven rainbow colours!"
    # Shown, not said: the praise appears on the screen (the chime, confetti and
    # sticker are the reward). Rhymes wait for the Sing button.
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    if self.is_custom or item.get("hindi") or item.get("source") in ("glyph", "hindi", "bangla"):
      self.praise_line = hub.praise_text(self.puzzle, self.cat)
    else:
      self.praise_line = f"You made it! {item.get('label') or self.puzzle}!"   # traced to life

  def showcase_rects(self):
    """Tabs under a picture brought to life: Hear it (its real sound) and Spell it."""
    if (self.stage != "finished" or self.mode != "trace" or self.is_custom or self.sing
            or time.time() - self.finished_at < 0.8):
      return []
    acts = []
    if self.calls.sound_for(self.puzzle):
      acts.append(("hear", "Hear it"))
    if self.can_spell():
      acts.append(("spell", "Spell it"))
    if any(len(lp) > 1 for lp in self.loops):
      acts.append(("draw", "Draw it"))
    photo = self.current_photo()
    if photo:
      acts.append(("photo", "Real photo" if photo.get("src") else "Live camera"))
    if not acts:
      return []
    below = self.sing_rect() or (self.watch_rect() if self.current_video() else None)
    base = below.top - 12 if below else PLAY_RECT.bottom - 34
    w = 130
    room = PLAY_RECT.w - 2 * (JINGLE_CENTER[0] - PLAY_RECT.x + JINGLE_R + 8)  # clear of the ♪ button
    per_row = max(1, min(len(acts), (room + 12) // (w + 12)))
    out = []
    for i, (act, label) in enumerate(acts):         # rows from the bottom up
      row, col = divmod(i, per_row)
      n = min(per_row, len(acts) - row * per_row)
      x0 = PLAY_RECT.centerx - (n * w + (n - 1) * 12) // 2
      out.append((pygame.Rect(x0 + col * (w + 12), base - 42 - row * 52, w, 42), act, label))
    return out

  def showcase_hit(self, pos):
    for rect, act, _label in self.showcase_rects():
      if rect.collidepoint(pos):
        return act
    return None

  def sing_rect(self):
    """The big Sing button of a finished rhyme (None when there is none)."""
    if self.stage != "finished" or self.sing or self.mode != "trace":
      return None
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    if not (item.get("rhyme") or item.get("chant")):
      return None
    r = self.watch_rect()
    return r.move(0, -(r.h + 14)) if self.current_video() else r

  # ------------------------------------------------------------ drawing
  def image(self, path, size=None):
    """Loads (and caches) a picture, optionally scaled to size."""
    if not path:
      return None
    key = (path, size)
    if key not in self.images:
      try:
        base = self.images.get((path, None))
        if base is None:
          base = pygame.image.load(path).convert_alpha()
          self.images[(path, None)] = base
        if size:
          base = pygame.transform.smoothscale(base, size)
        self.images[key] = base
      except Exception:
        self.images[key] = None
    return self.images[key]

  def thumb(self, name, cat, max_size):
    path = hub.fetch_thumb_from_hub(name, cat)
    img = self.image(path)
    if img is None:
      return None
    if not path.endswith("_t.png"):     # web build: the full picture, cropped like a thumb
      crop = self.images.get(("crop", path))
      if crop is None:
        box = img.get_bounding_rect()
        crop = img.subsurface(box if box.w and box.h else img.get_rect()).copy()
        self.images[("crop", path)] = crop
      w, h = crop.get_size()
      s = min(max_size / w, max_size / h)
      size = (max(1, int(w * s)), max(1, int(h * s)))
      key = (("crop", path), size)
      if key not in self.images:
        self.images[key] = pygame.transform.smoothscale(crop, size)
      return self.images[key]
    w, h = img.get_size()
    s = min(max_size / w, max_size / h)
    return self.image(path, (max(1, int(w * s)), max(1, int(h * s))))

  def native_image(self, cat, name, height):
    if self.lang == "en":
      return None
    item = hub.CATEGORIES_HUB.get(cat, {}).get(name, {})
    rel = item.get(f"{self.lang}_img")
    if not rel:
      return None
    path = os.path.join(hub.HERE, rel)
    img = self.image(path)
    if img is None:
      return None
    s = height / img.get_height()
    return self.image(path, (max(1, int(img.get_width() * s)), height))

  def menu_press(self, mx, my):
    """A tap in the menu panel (panel coordinates). Picking a picture, Play,
    or a tap outside the panel goes back to the game."""
    if not (0 <= mx < PANEL_W and 0 <= my < PANEL_H):
      self.overlay = None
      return
    if SUBJ_RECT.collidepoint(mx, my):
      for rect, s in self.subject_rects():
        if rect.collidepoint(mx, my) and s in ("<", ">"):
          self.sfx.play("switch")
          self.subj_page += 1 if s == ">" else -1
        elif rect.collidepoint(mx, my) and s != self.subject:
          self.select_subject(s)
    elif CAT_RECT.collidepoint(mx, my):
      for rect, c in self.category_rects():
        if rect.collidepoint(mx, my) and c in ("<", ">"):
          self.sfx.play("switch")
          self.cat_page += 1 if c == ">" else -1
        elif rect.collidepoint(mx, my) and c != self.cat:
          self.select_category(c)
    elif BANK_RECT.collidepoint(mx, my):
      cells, _ = self.bank_cells()
      for rect, name in cells:
        if rect.collidepoint(mx, my):
          if name == ">more":
            self.sfx.play("switch")
            self.page += 1
          else:
            self.select_puzzle(name)
            self.overlay = None              # straight back to the picture
          break
    elif RESET_RECT.collidepoint(mx, my):
      self.sfx.play("click")
      self.in_world = False
      self.refresh_mode(self.puzzle)
      self.overlay = None
    elif GAMES_RECT.collidepoint(mx, my):
      self.sfx.play("switch")
      self.overlay = "menu"
    elif STICKER_RECT.collidepoint(mx, my):
      self.sfx.play("switch")
      self.overlay = "shelf"
    elif THEME_RECT.collidepoint(mx, my):
      self.next_theme()
    elif NEXT_RECT.collidepoint(mx, my):
      self.sfx.play("click")
      self.in_world = False
      self.overlay = None

  def relayout(self, old_play):
    """The screen turned or resized: everything on the picture moves to the
    new play area, so a child keeps what was already traced or drawn."""
    self.particles.texts = []
    if self.mode != "trace" or not hasattr(self, "box"):
      return                                 # quiz and spelling lay out live
    old_box = self.box
    box = PLAY_RECT.inflate(-16, -40)
    self.box = (box.x, box.y, box.w, box.h)
    item = None if self.is_custom else hub.CATEGORIES_HUB[self.cat][self.puzzle]
    if item is not None and "w" in item:
      s1, ox1, oy1 = hub._fit(item, old_box)
      s2, ox2, oy2 = hub._fit(item, self.box)
    else:                                    # free drawing: keep it in proportion
      s1, ox1, oy1 = 1.0, old_box[0], old_box[1]
      s2 = min(box.w / old_box[2], box.h / old_box[3])
      ox2 = box.x + (box.w - old_box[2] * s2) / 2
      oy2 = box.y + (box.h - old_box[3] * s2) / 2
    k = s2 / s1

    def move(p):
      return (ox2 + (p[0] - ox1) * k, oy2 + (p[1] - oy1) * k)

    self.loops = [[move(p) for p in lp] for lp in self.loops]
    if getattr(self, "copy_loops", None):
      self.copy_loops = [[move(p) for p in lp] for lp in self.copy_loops]
      self.copy_length *= k
      self.copy_speed *= k
    self.dots = [p for lp in self.loops for p in lp]
    self.strokes = [[move(p) for p in st] for st in self.strokes]
    for stroke in self.drawing:
      stroke[1][:] = [move(p) for p in stroke[1]]
    for d in self.dominoes:
      d.x, d.y = move((d.x, d.y))
    if self.last_pointer is not None:
      self.last_pointer = move(self.last_pointer)
    if item is not None:
      self.context = hub.fetch_context_from_hub(self.puzzle, self.box, cat=self.cat)
      self.pic_path, self.pic_rect = hub.fetch_picture_from_hub(
          self.puzzle, self.box, cat=self.cat)
      self.places = hub.fetch_places_from_hub(self.puzzle, self.box, cat=self.cat)


class Viewport:
  """Scales the virtual canvas onto the real screen and maps input back."""

  def __init__(self):
    self.scale = 1.0
    self.ox = self.oy = 0

  def fit(self, window_size):
    ww, wh = window_size
    self.scale = min(ww / WIDTH, wh / HEIGHT)
    self.ox = int((ww - WIDTH * self.scale) / 2)
    self.oy = int((wh - HEIGHT * self.scale) / 2)

  def to_virtual(self, wx, wy):
    return ((wx - self.ox) / self.scale, (wy - self.oy) / self.scale)

  def present(self, window, canvas, border=(0, 0, 0)):
    if self.scale == 1.0 and self.ox == 0 and self.oy == 0:
      window.blit(canvas, (0, 0))
      return
    window.fill(border)          # side bars take the theme colour, not black
    size = (int(WIDTH * self.scale), int(HEIGHT * self.scale))
    window.blit(pygame.transform.smoothscale(canvas, size), (self.ox, self.oy))


class FullScreen:
  """Full-screen presentation. Computer: starts full screen, F11 or the Games
  menu switches, Esc leaves it. Browser: the first tap goes full screen (and
  keeps phones upright). Android apps are always full screen."""

  WEB_TOGGLE = """(function(){var d=document,e=d.documentElement;
  if(d.fullscreenElement||d.webkitFullscreenElement){
    (d.exitFullscreen||d.webkitExitFullscreen).call(d);return 'off';}
  var r=e.requestFullscreen||e.webkitRequestFullscreen;if(!r)return 'none';
  var lock=function(){try{screen.orientation.lock('portrait').catch(function(){});}catch(x){}};
  try{var p=r.call(e,{navigationUI:'hide'});
    if(p&&p.then)p.then(lock).catch(function(){});else lock();}catch(x){return 'none';}
  return 'on';})()"""
  WEB_STATE = ("(document.fullscreenElement||document.webkitFullscreenElement)"
               "?'yes':'no'")

  def __init__(self):
    self.available = not IS_ANDROID
    self.full = IS_ANDROID
    self.first_tap = IS_WEB          # browsers need a tap before full screen
    self.border_theme = None

  def is_full(self):
    if IS_WEB:
      try:
        import platform
        return str(platform.window.eval(self.WEB_STATE)) == "yes"
      except Exception:
        return False
    return self.full

  def toggle(self):
    self.first_tap = False
    if IS_ANDROID:
      return
    if IS_WEB:
      try:
        import platform
        platform.window.eval(self.WEB_TOGGLE)
      except Exception:
        pass
      return
    self.full = not self.full
    open_display(self.full)

  def pause(self):
    """Computer: a window instead of full screen while a video plays."""
    self.paused = self.full and not IS_WEB and not IS_ANDROID
    if self.paused:
      self.full = False
      open_display(False)

  def resume(self):
    if getattr(self, "paused", False):
      self.paused = False
      self.full = True
      open_display(True)

  def leave(self):
    """Esc: step out of full screen first. True if it did."""
    if self.available and not IS_WEB and self.full:
      self.toggle()
      return True
    return False

  def tapped(self):
    if self.first_tap:
      self.toggle()

  def paint_page(self, theme):
    """Browser page around the game takes the theme colour too."""
    if not IS_WEB or theme is self.border_theme:
      return
    self.border_theme = theme
    try:
      import platform
      colour = "#%02x%02x%02x" % border_colour(theme)
      platform.document.body.style.background = colour
      platform.document.documentElement.style.background = colour
    except Exception:
      pass


def border_colour(theme):
  return tuple(int(c * 0.6) for c in theme["bg"])


def open_display(full=None):
  if IS_WEB:
    return pygame.display.set_mode((WIDTH, HEIGHT))
  if IS_ANDROID or full:
    return pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
  try:
    desk_h = pygame.display.get_desktop_sizes()[0][1]
  except Exception:
    desk_h = 900
  h = max(480, int(desk_h * 0.85))
  return pygame.display.set_mode((int(h * PANEL_W / HEIGHT), h), pygame.RESIZABLE)


async def main():
  # The browser mixes sound on the same thread as the game: a bigger buffer rides out
  # slow frames (the town takes 50-80 ms) instead of breaking up the sound
  pygame.mixer.pre_init(RATE_HINT, -16, 2, 4096 if IS_WEB else 1024 if IS_ANDROID else 512)
  pygame.init()
  fullscreen = FullScreen()
  # The computer version opens full screen (tests use the dummy video driver)
  if not IS_WEB and os.environ.get("SDL_VIDEODRIVER") != "dummy":
    fullscreen.full = True
  open_display(fullscreen.full)
  pygame.display.set_caption("Domino Game - Learn while you play")
  try:
    pygame.key.stop_text_input()   # only on while a name is being typed
  except Exception:
    pass
  clock = pygame.time.Clock()
  canvas = pygame.Surface((WIDTH, HEIGHT))
  view = Viewport()
  sfx = SoundBank()
  speaker = Speaker()
  game = Game(sfx, speaker)
  game.fullscreen = fullscreen
  # Came from the 3D Wonder Town with a house picked: skip the opening show and open that house
  open_key = _web_open_key()
  if open_key and open_key in game.world.by_key:
    game.intro = None
    game.world.enter(game.world.by_key[open_key])
    cat_n = _web_param("cat", "DOMINO_CAT")
    if cat_n is not None and cat_n.isdigit() and game.world.picker:
      b, cats = game.world.picker
      if int(cat_n) < len(cats):
        game.world.pick_category(b, cats[int(cat_n)])
        if game.overlay == "nav":        # picked in the 3D town: straight to tracing its first picture
          game.overlay = None
          game.select_puzzle(_web_item(game))

  if open_key == "syllabus":
    _open_syllabus(game)

  # Touch and mouse share one code path. Phones also send "fake" mouse events
  # for each touch, so those are ignored to avoid double taps.
  state = {"finger": None, "finger_at": 0.0, "finger_pos": None,
           "ignore_mouse_until": 0.0}

  running = True
  errors_seen = set()
  while running:
    if IS_WEB and game.in_world and game.overlay is None and game.intro is None:
      game.go_to_town()             # the web game is 3D only: never the pygame town (user, 05-Nov-2026)
      await asyncio.sleep(0.5)      # the browser is leaving this page
      continue
    try:
      running = frame(game, view, canvas, state)
    except Exception as exc:     # never freeze a child's screen: log and go on
      msg = f"{type(exc).__name__}: {exc}"
      if msg not in errors_seen:
        errors_seen.add(msg)
        report_error()
    clock.tick(60)
    await asyncio.sleep(0)  # lets the browser breathe under pygbag

  speaker.close()
  pygame.quit()


def report_error():
  import traceback
  text = traceback.format_exc()
  print(text)
  if IS_WEB:
    try:
      import platform
      platform.window.console.error(text)
    except Exception:
      pass


def _debug_input():
  """Input log for troubleshooting: add ?debuginput to the web address."""
  if not IS_WEB:
    return bool(os.environ.get("DOMINO_DEBUG_INPUT"))
  try:
    import platform
    return "debuginput" in str(platform.window.location.href)
  except Exception:
    return False


DEBUG_INPUT = _debug_input()


def _web_param(name, env):
  """One ?name=value from the web address (letters, digits and _ only), or the env variable on the desktop."""
  if not IS_WEB:
    return os.environ.get(env) or None
  try:
    import platform
    search = str(platform.window.location.search)
  except Exception:
    return None
  for part in search.lstrip("?").split("&"):
    if part.startswith(name + "="):
      value = part[len(name) + 1:].strip()
      return value if value.replace("_", "").isalnum() else None
  return None


def _web_item(game):
  """The picture named by ?item=<n> (the 3D stage's sparkle button), else the category's first."""
  items = game.items()
  n = _web_param("item", "DOMINO_ITEM")
  return items[int(n)] if n and n.isdigit() and int(n) < len(items) else items[0]


def _open_syllabus(game):
  """A class's own subject from the 3D Wonder Town: index.html?open=syllabus&cls=<n>&subj=<key>&cat=<i>
  (ncert.SYLLABUS). Maths Play opens on that class's chapters; pictures go straight to tracing."""
  import ncert
  try:
    n = int(_web_param("cls", "DOMINO_CLS"))
    cat = ncert.SYLLABUS[n][_web_param("subj", "DOMINO_SUBJ")][int(_web_param("cat", "DOMINO_CAT"))]
    pavilion = game.world.by_key[f"class{n}"]
  except (TypeError, ValueError, KeyError, IndexError):
    return
  game.intro = None
  if cat == ncert.MATHS_PLAY:
    game.maths_open_class = n
  game.world.pick_category(pavilion, cat)
  if game.overlay == "nav":
    game.overlay = None
    game.select_puzzle(_web_item(game))


def _web_open_key():
  """The 3D Wonder Town page (town_web/, served at town/) opens the game at one house:
  index.html?open=<key> (a subject such as maths, or story / family / studio / museum / arcade),
  optionally &cat=<n>: that house's n-th category (town_web/data.json uses the same order)."""
  return _web_param("open", "DOMINO_OPEN")
DEBUG_TYPES = {pygame.MOUSEBUTTONDOWN, pygame.MOUSEBUTTONUP, pygame.FINGERDOWN,
               pygame.FINGERUP}


def log_event(event):
  text = f"[input] {pygame.event.event_name(event.type)} {event.dict}"
  print(text)
  if IS_WEB:
    try:
      import platform
      platform.window.console.log(text)
    except Exception:
      pass


def screen_shape(window, state):
  """Shape of the real screen: the browser page on the web, else the window."""
  if not IS_WEB:
    return window.get_size()
  now = time.time()
  if now - state.get("shape_at", 0.0) > 0.4:    # asking the page costs a little
    state["shape_at"] = now
    try:
      import platform
      state["shape"] = (int(platform.window.innerWidth), int(platform.window.innerHeight))
    except Exception:
      state["shape"] = window.get_size()
  return state.get("shape", window.get_size())


def frame(game, view, canvas, state):
  """One frame: input, update, draw. Returns False when the game should quit."""
  running = True
  window = pygame.display.get_surface()
  # Turned phone, resized window, browser bar or full screen: the canvas
  # takes the screen's shape (a pixel or two of change is ignored)
  tw, th = layout_size(screen_shape(window, state))
  if abs(tw - WIDTH) > 2 or abs(th - HEIGHT) > 2:
    old_play = PLAY_RECT.copy()
    set_layout(tw, th)
    if IS_WEB:                           # the browser canvas takes the new shape
      window = pygame.display.set_mode((WIDTH, HEIGHT))
      try:                               # and the page re-fits it to the screen
        import platform
        platform.window.eval(
            "[60, 400, 1200].forEach(function(t){setTimeout(function(){"
            "window.dispatchEvent(new Event('resize'));}, t);});")
      except Exception:
        pass
    game.relayout(old_play)
  canvas = state.get("canvas", canvas)
  if canvas.get_size() != (WIDTH, HEIGHT):
    canvas = state["canvas"] = pygame.Surface((WIDTH, HEIGHT))
  view.fit(window.get_size())
  now = time.time()
  ww, wh = window.get_size()

  # A finger that went quiet (its "up" never arrived) must not block input
  if state["finger"] is not None and now - state["finger_at"] > 1.0:
    if state["finger_pos"]:
      game.release(state["finger_pos"])
    state["finger"] = None

  for event in pygame.event.get():
    if DEBUG_INPUT and event.type in DEBUG_TYPES:
      log_event(event)
    if event.type == pygame.QUIT:
      running = False
    elif event.type == pygame.WINDOWFOCUSLOST:
      game.player.focus_lost()
    elif event.type == pygame.WINDOWFOCUSGAINED:
      if game.player.returned():         # back from the video in the browser
        game.back_from_video()
    elif event.type == pygame.KEYDOWN:
      full = getattr(game, "fullscreen", None)
      if full and event.key == pygame.K_F11 and game.overlay != "rename":
        full.toggle()
      elif game.key_down(event):
        pass
      elif event.key in (pygame.K_ESCAPE, pygame.K_AC_BACK):
        if not (full and full.leave()):
          running = False
    elif event.type == pygame.TEXTINPUT:
      game.text_input(event.text)

    elif event.type == pygame.FINGERDOWN:
      pos = view.to_virtual(event.x * ww, event.y * wh)
      state["ignore_mouse_until"] = now + 0.6
      if state["finger"] is not None and state["finger_pos"]:
        game.release(state["finger_pos"])     # a new touch takes over
      state.update(finger=event.finger_id, finger_at=now, finger_pos=pos)
      if not tapped(game):               # the first web tap only opens full screen
        game.press(pos)
    elif event.type == pygame.FINGERMOTION:
      state["ignore_mouse_until"] = now + 0.6
      if event.finger_id == state["finger"]:
        pos = view.to_virtual(event.x * ww, event.y * wh)
        state.update(finger_at=now, finger_pos=pos)
        game.drag(pos)
    elif event.type == pygame.FINGERUP:
      state["ignore_mouse_until"] = now + 0.6
      if event.finger_id == state["finger"]:
        state["finger"] = None
        game.release(view.to_virtual(event.x * ww, event.y * wh))

    elif event.type in (
        pygame.MOUSEBUTTONDOWN, pygame.MOUSEMOTION, pygame.MOUSEBUTTONUP):
      if (getattr(event, "touch", False) or state["finger"] is not None
          or now < state["ignore_mouse_until"]):
        continue
      pos = view.to_virtual(*event.pos)
      if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
        if not tapped(game):
          game.press(pos)
      elif event.type == pygame.MOUSEMOTION and event.buttons[0]:
        game.drag(pos)
      elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
        game.release(pos)

  if game.player.closed():               # browser: "Back to play" was pressed
    game.back_from_video()
  game.update()
  game.draw(canvas)
  full = getattr(game, "fullscreen", None)
  if full:
    full.paint_page(game.theme)
  view.present(window, canvas, border_colour(game.theme))
  pygame.display.flip()
  return running


def tapped(game):
  """True when this tap was used to go full screen (the picture then resizes)."""
  full = getattr(game, "fullscreen", None)
  if full and full.first_tap:
    full.tapped()
    return True
  return False


ui_draw.share(globals())        # constants, helpers and modules for the drawing code


if __name__ == "__main__":
  asyncio.run(main())

