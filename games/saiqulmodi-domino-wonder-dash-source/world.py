"""Wonder Town - the 3D front door of Domino Game (like Bridge Genius's Campus World).

Children walk, jump and use magic tools to move around a sunny town. Every building opens a
part of the game:
  * ABC School, Hindi Pathshala, Number House, My Home, Zoo & Garden, Food Market, Station,
    Globe Tower, India Park and Fun Park open their subject - pick a category, then a picture;
  * Story House plays the story of the day, Family House the players, Drawing Studio
    "Draw my own", Sticker Museum the sticker shelf, and the Games Arcade the Games menu.
Tapping a building (or its square on the map, or from the Houses directory) flies you there and opens it:
each flight has its own style, colours and music, with dominoes toppling along the path (flight.py).

The Magic Box at the entrance gate has a crystal button per class (labels and a spoken welcome in
English, Hindi or Bangla): it sends the hero down the Domino Highway at 10x speed to that class's
pavilion, whose Subject Magic Console opens the class's Maths chapters, EVS / Science, Social
Science, languages and India Map. A Back to Gate crystal (and button) flies back to the Magic Box.

Magic tools: Web swing (hold), Web zip (onto a roof), Super-jump boots, and a Glide cape (hold).
The town's maths lives in town3d.py; this file paints it and handles taps and keys.
"""

import bisect
import math
import random

import pygame

import os

import domino_data as hub
import flight as flights
import magic
import ncert
import sathi
import symbols
import town3d as town

SKY_TOP = (90, 160, 240)
SKY_LOW = (255, 222, 180)
FOG = (210, 228, 242)
GRASS_NEAR = (98, 180, 86)
GRASS_FAR = (160, 206, 128)
STREET = (235, 206, 150)
RIVER = (24, 158, 185)
SEA_NEAR = (38, 150, 200)     # the sea round the Palm island
SEA_FAR = (120, 196, 228)
SAND = (240, 222, 170)
LAWN = (120, 196, 110)
PATH = (250, 236, 200)
DECK = (150, 120, 96)
SUIT = (220, 40, 50)          # the cape and the school tie
SUIT_DARK = (40, 70, 170)     # school trousers
SHIRT = (248, 248, 252)       # school uniform shirt
SKIN = (226, 170, 120)
HAIR = (35, 25, 25)
BAG = (255, 140, 40)          # school bag
HERO_SCALE = 2.5              # the hero is big: the future of the nation (at least 1.7x)
HERO_SCREEN = 0.28            # ... and about this share of the screen's height on phones too
HERO_MAX = 4.2
# The hero's dreams shown in a thought bubble one after another:
DREAMS = [
    ("Helpers", "Scientist", "Scientist", "वैज्ञानिक", "বিজ্ঞানী"),
    ("Helpers", "Astronaut", "Astronaut", "अंतरिक्ष यात्री", "মহাকাশচারী"),
    ("Helpers", "Doctor", "Doctor", "डॉक्टर", "ডাক্তার"),
    ("Helpers", "Engineer", "Engineer", "इंजीनियर", "ইঞ্জিনিয়ার"),
    ("Helpers", "Teacher", "Teacher", "शिक्षक", "শিক্ষক"),
    ("Helpers", "Pilot", "Pilot", "पायलट", "পাইলট"),
    ("Our Country", "Judge", "Judge", "न्यायाधीश", "বিচারক"),
    ("Sports", "Trophy", "Champion", "चैंपियन", "চ্যাম্পিয়ন"),
    ("Helpers", "Artist", "Artist", "कलाकार", "শিল্পী"),
    ("Helpers", "Farmer", "Farmer", "किसान", "কৃষক"),
]
DREAM_SECS = 4.0
FAR_VIEW = 1400.0             # how far away buildings and land are still drawn (the 5x Palm fits inside)
LABEL_FAR = 900.0             # name tags up to this far
FOV_WARP = math.radians(14)   # the view widens this much at the Highway's full speed
FLY_SECS = 5.0                # opening aerial view of the Palm, then down to the hero
FLY_HOLD = 1.6                # ... of which this long it simply hangs above the island
WALK_OUT_SECS = 1.8           # the hero walks out of the room before every journey
WALK_OUT_FROM, WALK_OUT_TO = 2.0, 11.0   # m inside the door ... m out in front of it
HOME_NEAR = 14.0              # m: a hero this near a door is in that house's room
WEB = (250, 250, 255)
LIGHT = (0.45, 0.80, -0.40)
WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)

TIPS = [
    ((90, 210, 240), "Walk with the arrows (or arrow keys / W A S D)."),
    ((255, 220, 60), "Tap any building or open 'Houses' to visit directly."),
    ((255, 120, 120), "Magic tools: WEB to swing, ZIP onto a roof, BOOTS to jump high, CAPE to float."),
    ((140, 230, 140), "Follow yellow arrows to a door or tap GO IN."),
]
ROAD_GAME = "Cross the Road"      # the Road Safety Park also offers the road game
MATHS_GAME = "Maths Play"         # the Number House also offers the maths game
TOUR = ["gateway"] + [f"class{n}" for n in range(1, 8)] + [
        "english", "nature", "maths", "food", "story", "hindi", "home", "bangla", "science", "social", "travel",
        "world", "safety", "rhymes", "india", "fun", "studio", "museum", "family", "arcade",
        "creations"] + [z[0] for z in town.ZONES]
HI_NUM = ["एक", "दो", "तीन", "चार", "पाँच", "छह", "सात"]
BN_TO = ["একে", "দুইয়ে", "তিনে", "চারে", "পাঁচে", "ছয়ে", "সাতে"]
# Spoken lines (English, Hindi, Bengali); tools/make_voice.py records them in natural voices
WELCOME = ("Welcome to Wonder Town! Tap a building or Houses to visit and learn.",
           "वंडर टाउन में स्वागत है! सीखने के लिए किसी भी इमारत पर टैप करो।",
           "ওয়ান্ডার টাউনে স্বাগতম! শিখতে যেকোনো বাড়িতে টোকা দাও।")
PICK_CLASS = ("Pick your class!", "अपनी कक्षा चुनो!", "তোমার শ্রেণি বেছে নাও!")


def class_welcome(n):
  return (f"Welcome to Class {n}!", f"कक्षा {HI_NUM[n - 1]} में आपका स्वागत है!",
          f"শ্রেণি {BN_TO[n - 1]} স্বাগতম!")
LABELS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "labels")
# The Subject Magic Console: (key, English name, icon (category, item)); some only for some classes
CONSOLE = [
    ("maths", "Maths", None),
    ("evs", "EVS", ("Animals", "Tiger")),
    ("science", "Science", ("Lab Tools", "Microscope")),
    ("social", "Social Science", ("Long Ago", "Clay Pot")),
    ("english", "English", ("ABC", "A")),
    ("hindi", "Hindi", None),
    ("bangla", "Bangla", None),
    ("india", "India Map", ("India Map", "India")),
]


def _mix(a, b, k):
  return tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(3))


def _shade(c, k):
  return tuple(max(0, min(255, int(v * k))) for v in c)


def _inside(pt, poly):
  x, y = pt
  inside = False
  n = len(poly)
  for i in range(n):
    x1, y1 = poly[i]
    x2, y2 = poly[(i + 1) % n]
    if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-9) + x1:
      inside = not inside
  return inside


class Pad:
  """A big on-screen button. Hold pads count while a finger stays on them."""

  def __init__(self, key, label, colour, icon=None):
    self.key, self.label, self.colour, self.icon = key, label, colour, icon
    self.rect = pygame.Rect(0, 0, 10, 10)
    self.held = False
    self.visible = True


class WorldScene:

  def __init__(self, game):
    self.g = game
    self.boxes = town.build_world()
    # Collectible Stars along Palm Trunk and Fronds
    self.stars = []
    for z in range(0, 1550, 90):           # stars along the whole trunk (5x Palm)
      self.stars.append([0.0, z, True, 0.0]) # [x, z, active, bob_phase]
    for key, path in town.FRONDS.items():     # two stars along every frond
      for k, phase in ((len(path) // 3, 0.5), (2 * len(path) // 3, 1.0)):
        self.stars.append([path[k][0], path[k][1], True, phase])
    self.score_stars = 0
    self.by_key = {b.key: b for b in self.boxes}
    self.trees, self.lamps = town.trees_and_lamps(self.boxes)
    self.tree_z = [t[1] for t in self.trees]
    self.lamp_z = [lp[1] for lp in self.lamps]
    self.land = self.land_shapes()
    self.flyover = 0.0            # seconds into the opening aerial view (None = done)
    self.far = FAR_VIEW           # how far away buildings and land are still drawn
    self.fog_k = 1.0
    self._map_cache = None
    self.player = town.Player()
    self.cam = town.Camera(450, 800)
    self.size = (450, 800)
    self.t = 0.0
    self.target = None
    self.enter_on_arrival = None
    self.tour_k = 0
    self.toast = ("", 0.0)
    self.picker = None            # (building, [(rect, category)], close rect)
    self.show_directory = False   # Fast-travel all-house browser
    self.dir_page = 0
    self.hit_polys = {}
    self.anchor = None
    self.drag_x = None
    self.web_hold = False
    self.cape_hold = False
    self.web_flash = None
    self.show_tips = not game.progress.data.get("town_seen")
    self.pads = {k: Pad(k, *rest) for k, *rest in (
        ("up", "", (40, 90, 160), "up"), ("left", "", (40, 90, 160), "left"),
        ("down", "", (40, 90, 160), "down"), ("right", "", (40, 90, 160), "right"),
        ("jump", "JUMP", (60, 170, 90)), ("web", "WEB", (220, 50, 60), "web"),
        ("enter", "GO IN", (170, 70, 170)),
        ("zip", "ZIP", (240, 120, 40), "zip"), ("boots", "BOOTS", (60, 140, 230), "boots"),
        ("cape", "CAPE", (150, 80, 220), "cape"))}
    self.buttons = {}
    self._signs = {}
    self.door_marks = []
    self.dream_rect = pygame.Rect(0, 0, 0, 0)
    self.dream_at = None
    self.flight = None            # the flight to a house now under way (flight.py)
    self.walk = None              # the hero walking out of the room, before a journey
    self.origin = None            # (building, "flight" / "highway"): where the last journey began
    self.flight_inst = random.choice(magic.INSTRUMENTS)   # the next flight's music
    self.cam_side = 0.55
    self.magic_open = False       # the Magic Box's class buttons are showing
    self.console = None           # the Class Pavilion whose Subject Magic Console is open
    self.console_wave = None      # (start, from, to, choice): the indoor domino wave
    self.gate_rect = pygame.Rect(0, 0, 0, 0)
    self._labels = {}

  @property
  def panel_open(self):
    return (self.picker is not None or self.show_directory or self.magic_open
            or self.console is not None)

  @property
  def flying(self):
    return self.flight is not None and not self.flight.finished

  # --- layout ----------------------------------------------------------------------
  def fit(self, size):
    if size == self.size and getattr(self, "sky", None) is not None:
      return
    self.size = size
    w, h = size
    self.cam.resize(w, h)
    self.cam.follow(self.player.pos, self.player.yaw)
    self.sky = self._backdrop(w, h)
    pad = max(52, min(76, int(min(w, h) * 0.13)))
    gap = 8
    bx, by = 12, h - 12 - 2 * pad - gap
    P = self.pads
    P["up"].rect = pygame.Rect(bx + pad + gap, by, pad, pad)
    P["left"].rect = pygame.Rect(bx, by + pad + gap, pad, pad)
    P["down"].rect = pygame.Rect(bx + pad + gap, by + pad + gap, pad, pad)
    P["right"].rect = pygame.Rect(bx + 2 * (pad + gap), by + pad + gap, pad, pad)
    rx = w - 12 - pad
    for k, key in enumerate(("enter", "web", "jump")):
      P[key].rect = pygame.Rect(rx - k * (pad + gap), h - 12 - pad, pad, pad)
    for k, key in enumerate(("cape", "boots", "zip")):
      P[key].rect = pygame.Rect(rx - k * (pad + gap), h - 12 - 2 * pad - gap, pad, pad)
    if w < 3 * (pad + gap) * 2 + 40:
      for k, key in enumerate(("cape", "boots", "zip")):
        P[key].rect.y = h - 12 - 2 * pad - gap

    bw = min(110, (w - 70) // 4)
    self.buttons = {
        "guide": pygame.Rect(8, 8, bw, 38),
        "houses": pygame.Rect(14 + bw, 8, bw, 38),
        "pictures": pygame.Rect(20 + 2 * bw, 8, bw, 38),
        "cap": pygame.Rect(26 + 3 * bw, 8, min(bw, 90), 38)
    }
    mw = 170 if w >= 700 else 120
    self.map_rect = pygame.Rect(w - mw - 10, 56, mw, int(mw * 1.35))

  def _backdrop(self, w, h):
    hy = int(self.cam.horizon_y())
    col_px = pygame.Surface((1, h))           # one column, stretched: fast enough to
    for y in range(h):                        # repaint every frame of the flyover
      if y <= hy:
        col = _mix(SKY_TOP, SKY_LOW, (y / max(1, hy)) ** 1.5)
      else:                                    # the sea all round the island
        col = _mix(SEA_FAR, SEA_NEAR, ((y - hy) / max(1, h - hy)) ** 0.7)
      col_px.set_at((0, y), col)
    return pygame.transform.scale(col_px, (w, h))

  # --- helpers ---------------------------------------------------------------------
  def text(self, s, msg, pos, size, colour=WHITE, anchor="center"):
    if symbols.ONLY and not set(str(msg)) <= set("0123456789/ +-=×"):   # numbers stay; words go
      return pygame.Rect(int(pos[0]), int(pos[1]), 0, 0)
    img = self.g.font_at(size).render(symbols.text(msg), True, colour)
    r = img.get_rect(**{anchor: (int(pos[0]), int(pos[1]))})
    s.blit(img, r)
    return r

  def fit_text(self, s, msg, pos, size, width, colour=WHITE):
    """Text made smaller until it fits the width."""
    while size > 10 and self.g.font_at(size).size(msg)[0] > width:
      size -= 1
    return self.text(s, msg, pos, size, colour)

  def icon_for(self, b, size):
    cat, item = b.icon or (None, None)
    if b.kind == "subject" and cat is None:
      cat = self.g.subjects[b.payload][0]
      item = next(iter(hub.CATEGORIES_HUB[cat]))
    if cat is None:
      return None
    return self.g.thumb(item, cat, size)

  def say(self, msg, secs=3.5):
    self.toast = (msg, secs)

  def close_tips(self):
    self.show_tips = False
    self.g.progress.data["town_seen"] = True
    self.g.progress.save()

  def speak_welcome(self):
    if not self.show_tips or getattr(self, "welcomed", False) or self.t < 1.0:
      return
    full = getattr(self.g, "fullscreen", None)
    if full is not None and full.first_tap:
      return
    self.welcomed = True
    self.g.say(WELCOME[0], {"hi": WELCOME[1], "bn": WELCOME[2]}.get(self.g.lang))

  def next_tour(self):
    self.g.sfx.play("click")
    self.target = self.by_key[TOUR[self.tour_k % len(TOUR)]]
    self.tour_k += 1
    self.say(f"{self.target.label}: {self.target.sub}", 4.0)
    self.g.say(f"{self.target.label}. {self.target.sub}")

  def fly_to(self, b, enter=True):
    """Fly to a building: out of the room on foot, then a flight in a new style with
    dominoes standing along the path, one round around the house and a helicopter landing
    at the door; then the whole run topples, start to end, and the house opens."""
    if self.player.zip is not None or self.flying or self.walk is not None:
      return
    self.show_directory = False
    self.target = b
    self.enter_on_arrival = b if enter else None
    self.leave_then(lambda: self._fly(b), "flight")

  def _fly(self, b):
    sfx = self.g.sfx
    sfx.play("switch")
    ready = [i for i in magic.INSTRUMENTS if getattr(sfx, "ok", False) and sfx.ready(i)]
    first = [self.flight_inst] if self.flight_inst in ready else ready
    p = self.player
    p.rope = None
    self.flight = flights.Flight(tuple(p.pos), b, self.boxes, p.yaw, instruments=first)
    self.flight_inst = random.choice([i for i in magic.INSTRUMENTS if i != self.flight.inst])
    self.cam_side = random.choice([-0.55, 0.55])        # the camera watches the path from one side
    self.say(f"Flying {self.flight.label} to {b.label}!", 3.5)

  def skip_flight(self):
    if self.flying:
      self.flight.skip()

  def visit(self, b):
    """A tapped building: fly there and go in (the Magic Box opens at once when near; a
    Back to Gate crystal flies straight to the Magic Box)."""
    if b.kind == "return":
      b = self.by_key["gateway"]
    if b.kind == "gateway" and math.dist((b.door()[0], b.door()[2]),
                                         (self.player.pos[0], self.player.pos[2])) < 30:
      self.target = b
      self.enter(b)
      return
    self.fly_to(b)

  def start_highway(self, n):
    """The Magic Box's ride: out of the room, then down the Domino Highway at 10x speed,
    the playful way, to class n's pavilion."""
    if self.flying or self.walk is not None:
      return
    b = self.by_key[f"class{n}"]
    self.magic_open = False
    self.target = b
    self.enter_on_arrival = b
    self.leave_then(lambda: self._ride(b, town.CLASS_COLOURS[n], f"Class {n}"), "highway")

  def _ride(self, b, colour, name):
    sfx = self.g.sfx
    p = self.player
    p.rope = p.zip = None
    ok = getattr(sfx, "ok", False)
    self.flight = flights.Highway(tuple(p.pos), b, colour, magic.INSTRUMENTS if ok else ())
    if self.flight.inst:                                # this ride's own tune, made ahead
      sfx.prepare(self.flight.inst, self.flight.notes())
    sfx.play("switch")
    self.cam_side = 0.0
    self.say(f"{name}: {self.flight.label}!", 3.5)

  # --- out of the room, and back the same way ------------------------------------------
  def home_box(self):
    """The building whose door the hero stands at (its room), or None."""
    p = self.player
    best, best_d = None, HOME_NEAR
    for b in self.boxes:
      if b.kind is None:
        continue
      dx, _, dz = b.door()
      d = math.hypot(dx - p.pos[0], dz - p.pos[2])
      if d < best_d:
        best, best_d = b, d
    return best

  def leave_then(self, go, way):
    """Every journey starts with the hero walking out of the room (the house whose door
    it stands at) to the street, a little skippy; then go() sets off. The place left is
    remembered for the Come back button."""
    home = self.home_box()
    if home is not None and home is not self.target:
      self.origin = (home, way)
    if home is None:
      go()
      return
    door = home.door()
    cx, _, cz = home.centre
    ox, oz = door[0] - cx, door[2] - cz
    n = math.hypot(ox, oz) or 1.0
    ox, oz = ox / n, oz / n
    a = (door[0] - ox * WALK_OUT_FROM, 0.0, door[2] - oz * WALK_OUT_FROM)
    b = (door[0] + ox * WALK_OUT_TO, 0.0, door[2] + oz * WALK_OUT_TO)
    self.walk = {"t": 0.0, "a": a, "b": b, "go": go, "yaw": math.atan2(ox, oz),
                 "wiggle": random.choice([-1.0, 1.0]) * random.uniform(0.8, 1.6),
                 "hops": random.choice([2, 3, 4])}
    self.say("Off we go!", WALK_OUT_SECS)

  def walk_step(self, dt):
    """The walk out of the room: a wiggle and a few little hops, then the journey."""
    w = self.walk
    w["t"] += dt
    k = min(1.0, w["t"] / WALK_OUT_SECS)
    p = self.player
    a, b = w["a"], w["b"]
    e = k * k * (3 - 2 * k)
    side = w["wiggle"] * math.sin(math.pi * 2 * k) * (1 - k)
    sx, sz = math.cos(w["yaw"]), -math.sin(w["yaw"])
    p.pos = [a[0] + (b[0] - a[0]) * e + sx * side, 0.6 * abs(math.sin(math.pi * w["hops"] * k)),
             a[2] + (b[2] - a[2]) * e + sz * side]
    p.yaw = w["yaw"]
    p.vel = [0.0, 0.0, 0.0]
    p.grounded = True
    p.walk_phase += dt * 9.0
    self.cam.follow(p.pos, p.yaw, dt)
    if k >= 1.0:
      self.walk = None
      p.pos = list(b)
      w["go"]()

  def finish_walk(self):
    if self.walk is not None:
      self.walk["t"] = WALK_OUT_SECS

  # --- the class list on the left: Class 1 to 7, each straight to its pavilion -----------
  def class_list_rects(self):
    """[(rect, class number)] down the left side, between the top row and the pads (none
    while a journey, a panel or the opening view is on)."""
    if (self.flyover is not None or self.flying or self.walk is not None or self.panel_open
            or self.g.overlay or self.show_tips):
      return []
    w, h = self.size
    top = 112
    bottom = min(p.rect.top for p in self.pads.values()) - 70
    n = len(town.CLASSES)
    gap = 6
    bh = max(34, min(58, (bottom - top - gap * (n - 1)) // n))
    bw = 96 if w < 640 else 118
    return [(pygame.Rect(10, top + k * (bh + gap), bw, bh), num)
            for k, (num, _name, _col, _keys) in enumerate(town.CLASSES)]

  def go_to_class(self, n):
    """A class in the list: to its pavilion (the Domino Highway); there, in to its subjects."""
    self.g.sfx.play("click")
    b = self.by_key[f"class{n}"]
    here = self.home_box()
    if here is b:
      self.target = b
      self.enter(b)
      return
    self.start_highway(n)

  def draw_class_list(self, s):
    here = self.home_box()
    for r, n in self.class_list_rects():
      col = town.CLASS_COLOURS[n]
      at = here is not None and here.key == f"class{n}"
      pygame.draw.rect(s, (20, 20, 40), r.move(2, 3), border_radius=12)
      pygame.draw.rect(s, col, r, border_radius=12)
      pygame.draw.rect(s, YELLOW if at else WHITE, r, 3 if at else 2, border_radius=12)
      num = self.g.font_at(min(30, r.h - 8)).render(symbols.text(str(n)), True, WHITE)
      if symbols.ONLY:                       # the class number alone, big, in the middle
        num = self.g.font_at(min(34, r.h - 6)).render(symbols.text(str(n)), True, WHITE)
        s.blit(num, num.get_rect(center=r.center))
        continue
      s.blit(num, num.get_rect(center=(r.x + 18, r.centery)))
      native = self.label_image(f"class{n}", max(12, r.h // 2 - 6))
      word = self.g.font_at(14 if native else 16).render(symbols.text("Class"), True, WHITE)
      x = r.x + 34
      if native is not None:
        if native.get_width() > r.right - x - 4:
          native = pygame.transform.smoothscale(native, (r.right - x - 4, max(1, native.get_height() * (r.right - x - 4) // native.get_width())))
        s.blit(word, word.get_rect(midleft=(x, r.centery - r.h // 4 + 1)))
        s.blit(native, native.get_rect(midleft=(x, r.centery + r.h // 4 - 1)))
      else:
        s.blit(word, word.get_rect(midleft=(x, r.centery)))

  def come_back_ready(self):
    """The Come back button shows when the hero is away from where the last journey began."""
    if self.origin is None or self.flying or self.walk is not None:
      return False
    b = self.origin[0]
    dx, _, dz = b.door()
    return math.hypot(dx - self.player.pos[0], dz - self.player.pos[2]) > 40.0

  def come_back(self):
    """Back to where the last journey began, the same way (a flight or the Highway)."""
    b, way = self.origin
    self.g.sfx.play("click")
    if way == "highway":
      self.target = b
      self.enter_on_arrival = None
      here = self.home_box()
      colour = town.CLASS_COLOURS.get(here.payload, (255, 204, 0)) if here is not None and here.kind == "class" \
          else (255, 204, 0)
      self.leave_then(lambda: self._ride(b, colour, b.label), "highway")
    else:
      self.fly_to(b, enter=False)

  def class_word(self, n):
    """(English, picture of the class's name in the child's language or None)."""
    return f"Class {n}", self.label_image(f"class{n}")

  def label_image(self, key, height=None):
    """A Hindi / Bangla label drawn by tools/make_labels.py (labels/<lang>_<key>.png)."""
    lang = self.g.lang
    if lang not in ("hi", "bn"):
      return None
    k = (lang, key, height)
    if k not in self._labels:
      img = None
      try:
        img = pygame.image.load(os.path.join(LABELS, f"{lang}_{key}.png")).convert_alpha()
        if height:
          img = pygame.transform.smoothscale(img, (max(1, img.get_width() * height // img.get_height()), height))
      except Exception:
        img = None
      self._labels[k] = img
    return self._labels[k]

  def welcome_class(self, n):
    en, hi, bn = class_welcome(n)
    self.g.say(en, {"hi": hi, "bn": bn}.get(self.g.lang))

  # --- entering buildings ----------------------------------------------------------
  def enter(self, b):
    g = self.g
    g.sfx.play("chime")
    kind = b.kind
    if kind == "subject":
      cats = list(g.subjects[b.payload])
      if b.key == "safety":
        cats.append(ROAD_GAME)
      if b.key == "maths":
        cats.insert(0, MATHS_GAME)
      self.picker = (b, cats)
    elif kind == "story":
      g.start_story(g.story_of_today())
    elif kind == "players":
      g.overlay = "players"
    elif kind == "draw":
      g.start_drawing()
    elif kind == "stickers":
      g.overlay = "shelf"
    elif kind == "games":
      g.overlay = "menu"
    elif kind == "gateway":
      self.magic_open = True
      g.say(PICK_CLASS[0], {"hi": PICK_CLASS[1], "bn": PICK_CLASS[2]}.get(g.lang))
    elif kind == "class":
      self.console = b
      self.console_wave = None
    elif kind == "return":
      self.fly_to(self.by_key["gateway"])
    elif kind == "zone":
      cats = [c for c in b.payload if c in hub.CATEGORIES_HUB]
      if cats:
        self.picker = (b, cats)
    elif kind == "creations":
      g.overlay = "creations"

  def subject_of(self, cat):
    for subject, cats in self.g.subjects.items():
      if cat in cats:
        return subject
    return None

  def pick_category(self, b, cat):
    g = self.g
    self.picker = None
    if cat == ROAD_GAME:
      g.set_mode("road")
      return
    if cat == MATHS_GAME:
      g.set_mode("maths")
      return
    subject = b.payload if b.kind == "subject" else self.subject_of(cat)
    if subject is not None and g.subject != subject:
      g.subject = subject
    g.select_category(cat)
    g.overlay = "nav"

  # --- the Magic Box and the Subject Magic Console ----------------------------------
  def console_items(self, n):
    """The console's buttons for class n: EVS for Classes 1-5, Science and Social Science
    for Classes 6-7, Maths, the three languages and the India Map for everyone."""
    out = []
    for key, name, icon in CONSOLE:
      if (key == "evs" and n > 5) or (key in ("science", "social") and n < 6):
        continue
      out.append((key, name, icon))
    return out

  def console_cats(self, n, key):
    """The categories behind a console button (this class's NCERT topics first)."""
    own = list(ncert.CLASS_TOPICS.get(n, {}).get(key, []))
    extra = {"evs": ["Me & Home"] if n <= 2 else ["Nature", "Food"], "science": ["Science"],
             "social": ["Social"], "english": ["English"], "hindi": ["Hindi"], "bangla": ["Bangla"],
             "india": ["India", "Safety"]}.get(key, [])
    for subject in extra:
      own += [c for c in self.g.subjects.get(subject, []) if c not in own]
    cats = [c for c in own if c in hub.CATEGORIES_HUB]
    if key == "india":
      cats.append(ROAD_GAME)
    return cats

  def console_choose(self, n, key):
    g = self.g
    b = self.console
    self.console = None
    if key == "maths":
      g.maths_open_class = n                  # Maths Play opens on this class's chapters
      g.set_mode("maths")
      return
    cats = self.console_cats(n, key)
    if cats:
      self.picker = (b, cats)

  def magic_layout(self):
    w, h = self.size
    cols = 2 if w < 560 else 4
    rows = -(-7 // cols)
    bw = min(150, (w - 60 - (cols - 1) * 12) // cols)
    bh = max(70, min(104, (h - 230) // rows - 12))
    panel = pygame.Rect(0, 0, cols * (bw + 12) + 30, rows * (bh + 12) + 150)
    panel.center = (w // 2, h // 2)
    cells = []
    for k, (n, name, col, _keys) in enumerate(town.CLASSES):
      r, c = divmod(k, cols)
      left = panel.x + 21 + c * (bw + 12)
      if r == rows - 1 and 7 % cols:                     # centre the last row
        left += (cols - 7 % cols) * (bw + 12) // 2
      cells.append((pygame.Rect(left, panel.y + 80 + r * (bh + 12), bw, bh), n, name, col))
    close = pygame.Rect(0, 0, 160, 40)
    close.midbottom = (panel.centerx, panel.bottom - 12)
    return panel, cells, close

  def console_layout(self):
    b = self.console
    n = b.payload
    items = self.console_items(n)
    w, h = self.size
    cols = 2 if w < 560 else 4
    rows = -(-len(items) // cols)
    bw = min(150, (w - 60 - (cols - 1) * 12) // cols)
    bh = max(76, min(110, (h - 300) // rows - 12))
    panel = pygame.Rect(0, 0, cols * (bw + 12) + 30, rows * (bh + 12) + 220)
    panel.center = (w // 2, h // 2)
    cells = []
    for k, (key, name, icon) in enumerate(items):
      r, c = divmod(k, cols)
      cells.append((pygame.Rect(panel.x + 21 + c * (bw + 12), panel.y + 80 + r * (bh + 12), bw, bh),
                    key, name, icon))
    pedestal = (panel.centerx, panel.bottom - 108)
    gate = pygame.Rect(panel.x + 16, panel.bottom - 52, (panel.w - 44) // 2, 40)
    close = pygame.Rect(gate.right + 12, panel.bottom - 52, (panel.w - 44) // 2, 40)
    return panel, cells, pedestal, gate, close

  def press_panels(self, pos):
    """Taps on the Magic Box or the Subject Magic Console; True when one was open."""
    if self.magic_open:
      panel, cells, close = self.magic_layout()
      for r, n, _name, _col in cells:
        if r.collidepoint(pos):
          self.g.sfx.play("chime")
          self.welcome_class(n)
          self.start_highway(n)
          return True
      if close.collidepoint(pos) or not panel.collidepoint(pos):
        self.g.sfx.play("click")
        self.magic_open = False
      return True
    if self.console is not None:
      if self.console_wave is not None:                  # the dominoes are on their way
        return True
      panel, cells, pedestal, gate, close = self.console_layout()
      for r, key, _name, _icon in cells:
        if r.collidepoint(pos):
          self.g.sfx.play("tip")
          self.console_wave = (self.t, pedestal, r.center, key)
          return True
      if gate.collidepoint(pos):
        self.g.sfx.play("switch")
        self.console = None
        self.fly_to(self.by_key["gateway"])
        return True
      if close.collidepoint(pos) or not panel.collidepoint(pos):
        self.g.sfx.play("click")
        self.console = None
      return True
    return False

  WAVE_N = 14
  WAVE_SECS = 1.0

  def update_console_wave(self):
    if self.console_wave is None or self.console is None:
      return
    t0, _a, _b, key = self.console_wave
    k = (self.t - t0) / self.WAVE_SECS
    done = int(min(1.0, k) * self.WAVE_N)
    clacked = getattr(self, "_wave_clacked", 0) if k > 0.02 else 0
    if done > clacked:
      if done % 2 == 0:
        self.g.sfx.play("clack", done)
      self._wave_clacked = done
    if k >= 1.25:
      self.console_wave = None
      self._wave_clacked = 0
      self.g.sfx.play("chime")
      self.console_choose(self.console.payload, key)

  # --- directory layout & input ----------------------------------------------------
  def directory_layout(self):
    w, h = self.size
    panel = pygame.Rect(0, 0, min(580, w - 24), min(660, h - 40))
    panel.center = (w // 2, h // 2)
    cols = 2 if panel.w < 440 else 3
    active_boxes = [self.by_key[k] for k in TOUR if k in self.by_key]
    per_page = cols * 4
    pages = max(1, math.ceil(len(active_boxes) / per_page))
    self.dir_page %= pages
    shown = active_boxes[self.dir_page * per_page:(self.dir_page + 1) * per_page]

    cw = (panel.w - 32 - (cols - 1) * 10) // cols
    ch = min(90, (panel.h - 130) // 4)
    cells = []
    for idx, b in enumerate(shown):
      c = idx % cols
      r = idx // cols
      rx = panel.x + 16 + c * (cw + 10)
      ry = panel.y + 60 + r * (ch + 10)
      cells.append((pygame.Rect(rx, ry, cw, ch), b))

    close_btn = pygame.Rect(0, 0, 140, 38)
    close_btn.midbottom = (panel.centerx, panel.bottom - 12)
    prev_btn = pygame.Rect(panel.x + 20, panel.bottom - 50, 80, 38) if pages > 1 else None
    next_btn = pygame.Rect(panel.right - 100, panel.bottom - 50, 80, 38) if pages > 1 else None
    return panel, cells, close_btn, prev_btn, next_btn, pages

  def draw_directory(self, s):
    panel, cells, close_btn, prev_btn, next_btn, pages = self.directory_layout()
    veil = pygame.Surface(self.size, pygame.SRCALPHA)
    veil.fill((10, 20, 40, 160))
    s.blit(veil, (0, 0))
    pygame.draw.rect(s, (248, 250, 255), panel, border_radius=18)
    pygame.draw.rect(s, (70, 130, 230), panel, 4, border_radius=18)
    self.text(s, "Town Houses Directory", (panel.centerx, panel.y + 24), 22, (30, 40, 70))
    self.text(s, "Tap any house to fly there directly!", (panel.centerx, panel.y + 44), 13, (90, 100, 130))

    for rect, b in cells:
      pygame.draw.rect(s, _shade(b.colour, 1.15), rect, border_radius=12)
      pygame.draw.rect(s, WHITE, rect, 2, border_radius=12)
      icon = self.icon_for(b, rect.h - 36)
      if icon:
        s.blit(icon, icon.get_rect(center=(rect.centerx, rect.y + (rect.h - 22) // 2)))
      self.text(s, b.label, (rect.centerx, rect.bottom - 12), 14, WHITE)

    self.draw_button(s, close_btn, "Close", (100, 110, 140))
    if pages > 1:
      if prev_btn:
        self.draw_button(s, prev_btn, "< Prev", (60, 140, 220))
      if next_btn:
        self.draw_button(s, next_btn, "Next >", (60, 140, 220))

  def picker_layout(self):
    b, cats = self.picker
    w, h = self.size
    cols = 2 if w < 600 else min(3, len(cats))
    rows = -(-len(cats) // cols)
    while rows * 76 > h - 150 and cols < 4:            # a long list: more, smaller cells
      cols += 1
      rows = -(-len(cats) // cols)
    cw, ch = min(190, (w - 60) // cols), max(64, min(120, (h - 150) // rows - 12))
    pw, ph = cols * (cw + 12) + 28, rows * (ch + 12) + 130
    panel = pygame.Rect(0, 0, pw, ph)
    panel.center = (w // 2, h // 2)
    cells = []
    for k, cat in enumerate(cats):
      r = pygame.Rect(panel.x + 20 + (k % cols) * (cw + 12), panel.y + 70 + (k // cols) * (ch + 12), cw, ch)
      cells.append((r, cat))
    close = pygame.Rect(0, 0, 150, 40)
    close.midbottom = (panel.centerx, panel.bottom - 12)
    return panel, cells, close

  def pick_box_at(self, pos):
    if self.map_rect.collidepoint(pos):
      best, best_d = None, 18.0
      for b in self.boxes:
        if b.kind is None:
          continue
        r = self.map_box(b)
        d = 0 if r.collidepoint(pos) else math.hypot(r.centerx - pos[0], r.centery - pos[1])
        if d < best_d:
          best, best_d = b, d
      return best
    for key in reversed(list(self.hit_polys)):
      for poly in self.hit_polys[key]:
        if _inside(pos, poly):
          return self.by_key[key]
    return None

  def press(self, pos):
    if self.flyover is not None:            # a tap ends the aerial view at once
      self.end_flyover()
      return
    if self.flying:                         # a tap during a flight lands at once
      self.skip_flight()
      return
    if self.walk is not None:               # ... and a tap ends the walk out of the room
      self.finish_walk()
      return
    if self.press_panels(pos):
      return
    if self.show_directory:
      panel, cells, close_btn, prev_btn, next_btn, _pages = self.directory_layout()
      for r, b in cells:
        if r.collidepoint(pos):
          self.show_directory = False
          self.visit(b)
          return
      if prev_btn and prev_btn.collidepoint(pos):
        self.dir_page -= 1
        self.g.sfx.play("switch")
        return
      if next_btn and next_btn.collidepoint(pos):
        self.dir_page += 1
        self.g.sfx.play("switch")
        return
      if close_btn.collidepoint(pos) or not panel.collidepoint(pos):
        self.show_directory = False
        self.g.sfx.play("click")
      return

    if self.picker is not None:
      panel, cells, close = self.picker_layout()
      for r, cat in cells:
        if r.collidepoint(pos):
          self.g.sfx.play("click")
          self.pick_category(self.picker[0], cat)
          return
      if close.collidepoint(pos) or not panel.collidepoint(pos):
        self.g.sfx.play("click")
        self.picker = None
      return

    if self.show_tips:
      if self.tips_button.collidepoint(pos) or self.tips_rect.collidepoint(pos):
        self.g.sfx.play("click")
        self.close_tips()
        return

    for r, n in self.class_list_rects():       # the class list on the left
      if r.collidepoint(pos):
        self.go_to_class(n)
        return
    if self.buttons["guide"].collidepoint(pos):
      self.next_tour()
      return
    if self.buttons["houses"].collidepoint(pos):
      self.g.sfx.play("switch")
      self.show_directory = True
      return
    if self.buttons["pictures"].collidepoint(pos):
      self.g.sfx.play("switch")
      self.g.overlay = "nav"
      return
    if self.buttons["cap"].collidepoint(pos):
      self.g.sfx.play("click")
      n = min(7, self.g.cap_count())
      self.say(f"Rainbow cap: {n} of 7 colours", 4.0)
      self.g.say(f"Your rainbow cap has {n} of 7 colours. Learn a new subject to add a colour!",
                 {"hi": f"तुम्हारी इंद्रधनुष टोपी में सात में से {n} रंग हैं। "
                        "नया विषय सीखो और नया रंग पाओ!",
                  "bn": f"তোমার রামধনু টুপিতে সাতটার মধ্যে {n}টা রং আছে। "
                        "নতুন বিষয় শিখে নতুন রং পাও!"}.get(self.g.lang))
      return
    if self.gate_rect.collidepoint(pos):      # drawn over the dream bubble: first
      self.g.sfx.play("switch")
      self.fly_to(self.by_key["gateway"])
      return
    if getattr(self, "come_rect", None) and self.come_rect.collidepoint(pos):
      self.come_back()
      return
    if self.dream_rect.collidepoint(pos):
      self.g.sfx.play("chime")
      self.say_dream()
      return
    if self.target is not None and self.zip_rect.collidepoint(pos) and self.player.zip is None:
      self.fly_to(self.target)
      return
    for key, p in self.pads.items():
      if p.visible and p.rect.collidepoint(pos):
        p.held = True
        self.pad_down(key)
        return
    for rect, b in self.door_marks:
      if rect.collidepoint(pos):
        self.visit(b)
        return
    b = self.pick_box_at(pos)
    if b is not None and b.kind is not None:
      self.visit(b)
      return
    self.drag_x = pos[0]

  def drag(self, pos):
    if self.drag_x is not None:
      self.player.yaw += (pos[0] - self.drag_x) * 0.008
      self.drag_x = pos[0]

  def release(self, pos):
    for key, p in self.pads.items():
      if p.held and key == "web":
        self.web(False)
      if p.held and key == "cape":
        self.cape_hold = False
      p.held = False
    self.drag_x = None

  def pad_down(self, key):
    if key == "jump":
      if self.player.jump():
        self.g.sfx.play("pop")
    elif key == "web":
      self.web(True)
    elif key == "enter":
      self.try_enter()
    elif key == "zip":
      self.web_zip()
    elif key == "boots":
      self.boots()
    elif key == "cape":
      self.cape_hold = True
      if self.player.grounded:
        self.boots()

  def key(self, event):
    k = event.key
    if self.flying:
      if k in (pygame.K_SPACE, pygame.K_RETURN, pygame.K_KP_ENTER, pygame.K_e, pygame.K_ESCAPE):
        self.skip_flight()
      return True
    if self.walk is not None:
      if k in (pygame.K_SPACE, pygame.K_RETURN, pygame.K_KP_ENTER, pygame.K_e, pygame.K_ESCAPE):
        self.finish_walk()
      return True
    if self.panel_open and k in (pygame.K_ESCAPE, pygame.K_AC_BACK):
      self.picker = None
      self.show_directory = False
      self.magic_open = False
      self.console = None
      self.console_wave = None
      return True
    if self.magic_open or self.console is not None:
      return True
    if k == pygame.K_h:
      self.show_directory = not self.show_directory
      return True
    if k == pygame.K_SPACE:
      if self.player.grounded:
        if self.player.jump():
          self.g.sfx.play("pop")
      else:
        self.web(True)
      return True
    if k in (pygame.K_e, pygame.K_RETURN, pygame.K_KP_ENTER):
      self.try_enter()
      return True
    if k == pygame.K_t:
      self.next_tour()
      return True
    if k == pygame.K_z and self.target is not None:
      self.fly_to(self.target)
      return True
    if k == pygame.K_q:
      self.web_zip()
      return True
    if k == pygame.K_b:
      self.boots()
      return True
    return k in (pygame.K_UP, pygame.K_DOWN, pygame.K_LEFT, pygame.K_RIGHT,
                 pygame.K_w, pygame.K_a, pygame.K_s, pygame.K_d, pygame.K_g)

  def web(self, down):
    p = self.player
    if down:
      self.web_hold = True
      if p.rope is None and p.zip is None:
        if p.grounded:
          p.jump()
        if p.attach(self.boxes):
          self.g.sfx.play("switch")
    else:
      self.web_hold = False
      if p.rope is not None:
        p.release()

  def web_zip(self):
    if self.player.zip is not None:
      return
    anchor = self.player.web_pull(self.boxes)
    if anchor is None:
      self.say("Face a building to zip onto its roof!")
      return
    self.g.sfx.play("switch")
    self.web_flash = (anchor, self.t + 1.6)

  def boots(self):
    if self.player.super_jump():
      self.g.sfx.play("pop")

  def try_enter(self):
    b = town.nearest_entrance(self.boxes, self.player.pos)
    if b is not None:
      self.enter(b)

  # --- update ----------------------------------------------------------------------
  def draw_flyover_title(self, s):
    w, h = self.size
    k = min(1.0, self.flyover / 0.6) * min(1.0, max(0.0, (FLY_SECS - self.flyover) / 0.8))
    if k <= 0 or symbols.ONLY:               # no title card: the island itself is the opening
      return
    big = self.g.font_at(34 if w >= 600 else 28).render(symbols.text("Wonder Town"), True, WHITE)
    small = self.g.font_at(18).render("An island in the sea, shaped like a palm tree", True, (230, 240, 255))
    if small.get_width() > w - 60:
      small = pygame.transform.smoothscale(small, (w - 60, max(1, small.get_height() * (w - 60) // small.get_width())))
    box = pygame.Rect(0, 0, max(big.get_width(), small.get_width()) + 36, 84)
    box.midtop = (w // 2, 18)
    pill = pygame.Surface(box.size, pygame.SRCALPHA)
    pygame.draw.rect(pill, (20, 40, 90, int(200 * k)), pill.get_rect(), border_radius=20)
    s.blit(pill, box.topleft)
    for surf, y in ((big, box.y + 10), (small, box.y + 52)):
      surf.set_alpha(int(255 * k))
      s.blit(surf, surf.get_rect(midtop=(box.centerx, y)))
    tip = self.g.font_at(16).render(symbols.text("Tap to start"), True, WHITE)
    tip.set_alpha(int(255 * k * (0.6 + 0.4 * math.sin(self.t * 3))))
    s.blit(tip, tip.get_rect(midbottom=(w // 2, h - 16)))

  def end_flyover(self):
    self.flyover = None
    self.far, self.fog_k = FAR_VIEW, 1.0
    self.cam.pitch = -0.32
    self.cam.follow(self.player.pos, self.player.yaw)
    self.sky_stale = True

  def aerial(self, k):
    """The camera between the bird's-eye view of the whole Palm (k = 0) and the usual
    view behind the hero (k = 1), eased so it glides in and settles gently."""
    cam = self.cam
    e = k * k * (3 - 2 * k)
    w, h = self.size
    x0, x1, z0, z1 = town.BOUNDS
    height = max((z1 - z0) * cam.focal / h, (x1 - x0) * 1.05 * cam.focal / w)   # the whole island fits
    top_pos, top_pitch = (0.0, height, (z0 + z1) / 2 - 0.04 * (z1 - z0)), -1.52
    cam.pitch = -0.32
    cam.follow(self.player.pos, self.player.yaw)
    chase = cam.pos
    cam.pos = tuple(a + (b - a) * e for a, b in zip(top_pos, chase))
    cam.pitch = top_pitch + (-0.32 - top_pitch) * e
    cam._axes()
    self.far = FAR_VIEW + (height + 5000.0) * (1 - e)
    self.fog_k = 0.02 + 0.98 * e
    self.sky_stale = True             # draw() repaints the sky for the new horizon

  def update(self, dt):
    self.t += dt
    msg, ttl = self.toast
    self.toast = (msg, max(0.0, ttl - dt))
    if self.flyover is not None:            # the opening aerial view of the Palm
      self.flyover += dt
      if self.flyover >= FLY_SECS:
        self.end_flyover()
      else:
        self.aerial(max(0.0, self.flyover - FLY_HOLD) / (FLY_SECS - FLY_HOLD))
        return
    self.speak_welcome()
    self.steer_camera(dt)
    self.update_console_wave()
    if self.walk is not None:
      self.walk_step(dt)
      return
    if self.flight is not None and self.fly(dt):
      return
    if self.flight is None and int(self.t * 60) % 3 == 1:
      self.g.sfx.warm(self.flight_inst)       # the next flight's notes, a few at a time
    if self.g.overlay or self.panel_open:
      return
    try:
      keys = pygame.key.get_pressed()
    except pygame.error:
      keys = None

    def k(*codes):
      return bool(keys) and any(keys[c] for c in codes)

    P = self.pads
    fwd = (1.0 if (k(pygame.K_UP, pygame.K_w) or P["up"].held) else 0.0) - \
          (1.0 if (k(pygame.K_DOWN, pygame.K_s) or P["down"].held) else 0.0)
    turn = (1.0 if (k(pygame.K_RIGHT, pygame.K_d) or P["right"].held) else 0.0) - \
           (1.0 if (k(pygame.K_LEFT, pygame.K_a) or P["left"].held) else 0.0)
    if (fwd or turn) and self.show_tips and self.t > 6:
      self.close_tips()
    p = self.player
    if self.web_hold and not P["web"].held and not k(pygame.K_SPACE):
      self.web(False)
    if p.rope is None and not p.grounded and self.web_hold and p.zip is None and p.vel[1] < 2:
      if p.attach(self.boxes):
        self.g.sfx.play("switch")
    p.glide(self.cape_hold or k(pygame.K_g))
    event = p.update(dt, self.boxes, fwd, turn)
    if event == "splash":
      self.g.sfx.play("clack")
      self.say("Splash! That's the sea. Walk along the palm's paths, or use WEB or ZIP.", 4.0)
    elif event == "arrived":
      self.g.sfx.play("chime")
      if self.enter_on_arrival is not None:
        b, self.enter_on_arrival = self.enter_on_arrival, None
        self.enter(b)
    self.anchor = None if (p.rope or p.zip) else p.best_anchor(self.boxes)
    self.cam.follow(p.pos, p.yaw, dt)

  def fly(self, dt):
    """Moves the flight on; True while it steers the hero (and the camera)."""
    f = self.flight
    if f.finished:
      f.update(dt)
      if f.gone:
        self.flight = None
      return False
    event = f.update(dt, self.g.sfx)
    p = self.player
    p.pos, p.yaw = list(f.pos), f.yaw
    p.vel = [0.0, 0.0, 0.0]
    p.rope = p.zip = None
    p.grounded = f.landed
    p.gliding = False
    if event == "done":
      p.safe = (p.pos[0], p.pos[2])
      self.arrive()
      if getattr(f, "highway", False):
        self.flight = None
    self.anchor = None
    if f.toppling:                            # arrived and seen: the camera follows the toppling
      pos, yaw = f.front()                    # run forwards, from its start to the hero
      self.cam.follow(pos, yaw, None if getattr(f, "highway", False) else dt)
      return True
    cx, _, cz = f.box.centre
    look = self.cam.yaw
    if getattr(f, "highway", False):          # the Highway: the camera rides behind
      look = f.yaw
      p.grounded = f.landed
    elif math.hypot(cx - p.pos[0], cz - p.pos[2]) > 4.0:
      look = math.atan2(cx - p.pos[0], cz - p.pos[2]) + self.cam_side
    self.cam.follow(p.pos, look, dt)
    return True

  def arrive(self):
    """The ride is over: the house opens (or a chime when the hero only flew there)."""
    if self.enter_on_arrival is not None:
      b, self.enter_on_arrival = self.enter_on_arrival, None
      self.enter(b)
    else:
      self.g.sfx.play("chime")

  def steer_camera(self, dt):
    """During a flight the camera stands further back and higher, so the whole path shows."""
    cam = self.cam
    warp = 0.0
    if self.flying and self.flight.toppling:   # the toppling run, seen from behind and above:
      v = self.flight.wave_speed               # a faster wave, a wider view, so it never rushes by
      want = (min(70.0, 26.0 + 0.35 * v), min(32.0, 10.0 + 0.18 * v), -0.36 - min(0.14, 0.0015 * v))
    elif self.flying and getattr(self.flight, "highway", False):
      warp = self.flight.speed_k              # warp speed: further back, and a wider view
      want = (30.0 + 10.0 * warp, 12.0 + 2.0 * warp, -0.30)
    elif self.flying and self.flight.t < self.flight.hover_t - 0.8:
      want = (46.0, 20.0, -0.44)
    elif self.flying:                  # close in to watch the helicopter landing
      want = (30.0, 11.0, -0.30)
    else:
      want = (28.0, 12.0, -0.32)
    k = min(1.0, dt * 1.5)
    old = cam.pitch
    cam.dist += (want[0] - cam.dist) * k
    cam.height_offset += (want[1] - cam.height_offset) * k
    cam.pitch += (want[2] - cam.pitch) * k
    fov = cam.FOV + FOV_WARP * warp
    if abs(fov - cam.fov) > 1e-4:
      cam.set_fov(cam.fov + (fov - cam.fov) * min(1.0, dt * 4.0))
      self.sky_stale = True
    if abs(cam.pitch - old) > 1e-5:
      self.sky_stale = True

  # --- drawing ---------------------------------------------------------------------
  def fog(self, col, depth):
    return _mix(col, FOG, min(0.75, max(0.0, (depth * self.fog_k - 60.0) / 1000.0)))

  def draw(self, s):
    self.fit(s.get_size())
    if getattr(self, "sky_stale", False):
      self.sky_stale = False
      self.sky = self._backdrop(*self.size)
    cam = self.cam
    w, h = self.size
    s.blit(self.sky, (0, 0))
    hy = int(cam.horizon_y())
    d = (0.7 - cam.yaw + math.pi) % (2 * math.pi) - math.pi
    if abs(d) < 1.2:
      sx, sy = cam.cx + cam.focal * math.tan(d), hy - 130
      for k in range(12):
        a = self.t * 0.25 + k * math.pi / 6
        pygame.draw.line(s, (255, 226, 110), (sx + 40 * math.cos(a), sy + 40 * math.sin(a)),
                         (sx + 54 * math.cos(a), sy + 54 * math.sin(a)), 4)
      pygame.draw.circle(s, (255, 214, 80), (int(sx), int(sy)), 32)
      pygame.draw.circle(s, (90, 60, 30), (int(sx - 10), int(sy - 5)), 3)
      pygame.draw.circle(s, (90, 60, 30), (int(sx + 10), int(sy - 5)), 3)
      pygame.draw.arc(s, (90, 60, 30), (sx - 12, sy - 4, 24, 18), math.pi * 1.1, math.pi * 1.9, 3)
    self.draw_hills(s, hy)
    self.draw_ground(s)
    self.draw_sea_life(s)
    items = []
    self.hit_polys = {}
    cp = cam.pos
    for b in self.boxes:
      dist = math.dist(b.centre, cp)
      if dist < self.far:
        items.append((dist, 0, b))
    lo, hi = bisect.bisect_left(self.tree_z, cp[2] - 170), bisect.bisect_right(self.tree_z, cp[2] + 170)
    for t in self.trees[lo:hi]:               # only the nearby ones (sorted by z)
      dist = math.dist((t[0], t[2] / 2, t[1]), cp)
      if dist < 170:
        items.append((dist, 1, t))
    lo, hi = bisect.bisect_left(self.lamp_z, cp[2] - 120), bisect.bisect_right(self.lamp_z, cp[2] + 120)
    for lp in self.lamps[lo:hi]:
      dist = math.dist((lp[0], 3, lp[1]), cp)
      if dist < 120:
        items.append((dist, 2, lp))
    items.append((math.dist(self.player.pos, cp), 3, None))
    if self.flight is not None:
      items.extend((d, 4, dm) for d, dm in self.flight.visible(cp))
    self.dream_at = None
    items.sort(key=lambda it: -it[0])
    labels = (self.place_labels() if self.flyover is None and not self.flying and not symbols.ONLY
              else {})   # no name tags from up high; none at all with symbols only (the houses show their pictures)
    for dist, kind, obj in items:
      if kind == 0:
        self.draw_box(s, obj, dist)
        if obj.kind in ("gateway", "return"):
          self.draw_crystal(s, obj)
        elif obj.kind == "creations":
          self.draw_creations(s, obj)
        if obj.key in labels:
          self.draw_label(s, obj, *labels[obj.key])
      elif kind == 1:
        self.draw_tree(s, obj, dist)
      elif kind == 2:
        self.draw_lamp(s, obj, dist)
      elif kind == 4:
        self.flight.draw_domino(s, cam, obj, self.fog)
      else:
        self.draw_player(s)
        self.draw_sathi_ahead(s)
    if self.flyover is not None:            # the aerial view: only the Palm and a title
      self.draw_flyover_title(s)
      return
    if self.flying:                         # the path and the hero only
      self.door_marks = []
      self.dream_at = None
    else:
      self.draw_door_marks(s)
    if self.dream_at:
      self.draw_dream(s, *self.dream_at)
    self.draw_anchor(s)

    # --- Collectible Stars ---
    p_x, p_z = self.player.pos[0], self.player.pos[2]
    for s_item in self.stars:
      sx, sz, active, phase = s_item
      if not active:
        continue
      if math.hypot(p_x - sx, p_z - sz) < 2.2:
        s_item[2] = False
        self.score_stars += 1
        try:
          self.g.sfx.play("pop")
        except Exception:
          pass
        continue
      # Bobbing 3D projection
      bob = math.sin(self.t * 3.5 + phase) * 0.35 + 1.2
      pt = cam.project((sx, bob, sz))
      if pt:
        sr = max(4, int(cam.focal * 0.45 / pt[2]))
        # Draw 8-point sparkling star
        col = (255, 215, 0)
        pygame.draw.circle(s, (255, 245, 160), (int(pt[0]), int(pt[1])), sr + 2)
        pygame.draw.circle(s, col, (int(pt[0]), int(pt[1])), sr)
        pygame.draw.circle(s, (255, 255, 255), (int(pt[0]), int(pt[1])), max(1, sr // 3))

    # Star Counter HUD Pill
    star_hud = pygame.Rect(self.size[0] - 110, 12, 95, 34)
    pygame.draw.rect(s, (30, 45, 80), star_hud, border_radius=17)
    pygame.draw.rect(s, (255, 215, 0), star_hud, 2, border_radius=17)
    pygame.draw.circle(s, (255, 215, 0), (star_hud.x + 18, star_hud.y + 17), 9)
    pygame.draw.circle(s, (255, 255, 255), (star_hud.x + 18, star_hud.y + 17), 4)
    count_txt = self.g.font_at(20).render(symbols.text(str(self.score_stars)), True, (255, 255, 255))
    s.blit(count_txt, (star_hud.x + 36, star_hud.y + 7))

    self.draw_hud(s)
    if self.show_directory:
      self.draw_directory(s)

  def draw_hills(self, s, hy):
    w = self.size[0]
    off = -self.cam.yaw * self.cam.focal
    for col, amp, base, f in (((170, 196, 214), 26, 30, 0.004), ((128, 178, 120), 14, 6, 0.008)):
      pts = [(0, hy + 2)]
      for x in range(0, w + 12, 12):
        X = x - off
        pts.append((x, hy - base - amp * (0.6 * math.sin(X * f) + 0.4 * math.sin(X * f * 2.3 + 1))))
      pts.append((w, hy + 2))
      pygame.draw.polygon(s, col, pts)

  def ground_poly(self, s, pts, col, y=0.0):
    pr = self.cam.project_poly([(x, y, z) for x, z in pts])
    if pr is not None and len(pr[0]) >= 3:
      pygame.draw.polygon(s, self.fog(col, pr[1] * 0.6), pr[0])
      return pr[0]
    return None

  def land_shapes(self):
    """The island as (colour, polygon) pairs, drawn in this order; built once."""
    out = []
    x0, x1, z0, _ = town.BOUNDS
    for k in range(2):                         # the mainland: a beach, and lawn behind it
      a = x0 - 60 + (x1 - x0 + 120) * k / 2
      b = x0 - 60 + (x1 - x0 + 120) * (k + 1) / 2
      out.append((SAND, [(a, town.MAINLAND_Z - 7), (b, town.MAINLAND_Z - 7), (b, town.MAINLAND_Z), (a, town.MAINLAND_Z)]))
      out.append((LAWN, [(a, z0 - 40), (b, z0 - 40), (b, town.MAINLAND_Z - 7), (a, town.MAINLAND_Z - 7)]))
    for poly in town.crescent_pieces():         # sand ring with palms on it
      out.append((SAND, poly))
    th, te = town.TRUNK_HALF, town.TRUNK_END
    out.append((SAND, [(-th - 1, town.MAINLAND_Z - 1), (th + 1, town.MAINLAND_Z - 1), (th + 1, te), (-th - 1, te)]))
    coarse = {k: p[::2] + ([p[-1]] if len(p) % 2 == 0 else []) for k, p in town.FRONDS.items()}
    for path in coarse.values():                 # fewer corners: cheaper to draw, same look
      out.append((SAND, town.strip(path, town.FROND_HALF)))
    for px0, pz0, px1, pz1 in town.PADS:
      out.append((SAND, [(px0, pz0), (px1, pz0), (px1, pz1), (px0, pz1)]))
    for path in coarse.values():                 # the frond's path to the door
      out.append((PATH, town.strip(path, 2.6)))
    # every polygon with its middle, for culling far-away pieces
    return [(col, poly, (sum(p[0] for p in poly) / len(poly), sum(p[1] for p in poly) / len(poly)),
             max(math.dist(q, (sum(p[0] for p in poly) / len(poly), sum(p[1] for p in poly) / len(poly)))
                 for q in poly)) for col, poly in out]

  def draw_ground(self, s):
    x0, x1, z0, z1 = town.BOUNDS
    rz0, rz1 = town.RIVER_Z
    cx, _, cz = self.cam.pos

    # 1. Sparkles on the sea near the camera
    for k in range(14):
      wz = cz - 30 + ((k * 23 + self.t * 2.0) % 160)
      wx = cx + ((k * 47) % 120) - 60
      if town.land_at(wx, wz):
        continue
      a = self.cam.project((wx - 3, 0.0, wz))
      b = self.cam.project((wx + 3, 0.0, wz))
      if a and b and a[2] < 120:
        pygame.draw.line(s, self.fog((200, 235, 255), a[2]), a[:2], b[:2], 2)

    # 2. The island: beach, trunk, fronds, building pads and the crescent
    fx, fz = self.cam.f[0], self.cam.f[2]
    flat = math.hypot(fx, fz) or 1.0
    for col, poly, mid, rad in self.land:
      dx, dz = mid[0] - cx, mid[1] - cz
      near = math.hypot(dx, dz) - rad
      if near > self.far + 20:
        continue
      if self.flyover is None and ((col == PATH and near > 110) or (rad < 25 and near > 170)):
        continue                               # thin paths and small pads: too small to see
      if self.flyover is None and (dx * fx + dz * fz) / flat < -rad:
        continue                               # wholly behind the camera
      self.ground_poly(s, poly, col)

    # 3. The main street along the trunk (Wide Royal Avenue): only the pieces in view
    for za in range(int(town.MAINLAND_Z) - 20, int(town.TRUNK_END), 32):
      zb = min(town.TRUNK_END, za + 32)
      dz = (za + zb) / 2 - cz
      near = math.hypot(cx, dz) - 17
      if near > self.far + 20 or (self.flyover is None and (-cx * fx + dz * fz) / flat < -17):
        continue
      self.ground_poly(s, [(-10, za), (10, za), (10, zb), (-10, zb)], STREET)
      self.ground_poly(s, [(-0.6, za), (0.6, za), (0.6, zb), (-0.6, zb)], (245, 215, 60))

    # 4. Short paths and front courtyards of the trunk's own houses
    for b in self.boxes:
      if b.kind is not None and b.kind not in ("subject", "zone") and b.key != "arcade":
        dx, _, dz = b.door()
        xa, xb = sorted((dx, 0.0))
        self.ground_poly(s, [(xa - 1.0, dz - 4.5), (xb + 1.0, dz - 4.5), (xb + 1.0, dz + 4.5), (xa - 1.0, dz + 4.5)], PATH)

    # 5. Central Grand Plaza (Fountain Lake Court)
    plaza = [(18 * math.cos(a / 16 * math.tau), 4 + 18 * math.sin(a / 16 * math.tau)) for a in range(16)]
    self.ground_poly(s, plaza, (236, 205, 155))

    # 6. The canal across the trunk, and the bridge
    self.ground_poly(s, [(-town.TRUNK_HALF - 1, rz0), (town.TRUNK_HALF + 1, rz0),
                         (town.TRUNK_HALF + 1, rz1), (-town.TRUNK_HALF - 1, rz1)], SEA_NEAR)
    for k in range(5):
      z = rz0 + 2 + ((k * 2.6 + self.t * 1.2) % (rz1 - rz0 - 4))
      a = self.cam.project((-town.TRUNK_HALF, 0.02, z))
      b = self.cam.project((town.TRUNK_HALF, 0.02, z))
      if a and b:
        pygame.draw.line(s, (160, 220, 255), a[:2], b[:2], 2)
    self.ground_poly(s, [(-12, rz0 - 3), (12, rz0 - 3), (12, rz1 + 3), (-12, rz1 + 3)], DECK)
    for b in self.boxes:
      if b.kind is not None and b.gable:
        dx, _, dz = b.door()
        for k in range(5):
          p = self.cam.project((dx + (1.5 if b.x0 > 0 else -1.5), 0.05, dz - 4 + k * 2))
          if p and p[2] < 70:
            pygame.draw.circle(s, ((255, 120, 160), (255, 220, 60), (200, 140, 255))[k % 3],
                               (int(p[0]), int(p[1])), max(2, int(self.cam.focal * 0.25 / p[2])))
    if self.target is not None:
      dx, _, dz = self.target.door()
      r = 2.4 + 0.4 * math.sin(self.t * 5)
      ring = [(dx + r * math.cos(a / 16 * math.tau), dz + r * math.sin(a / 16 * math.tau)) for a in range(16)]
      pr = self.cam.project_poly([(x, 0.05, z) for x, z in ring])
      if pr:
        pygame.draw.polygon(s, YELLOW, pr[0], 4)

  def draw_box(self, s, b, dist):
    cam = self.cam
    x0, x1, z0, z1, y0, y1 = b.x0, b.x1, b.z0, b.z1, b.y0, b.h
    cp = cam.pos
    faces = []
    if cp[2] < z0:
      faces.append(((0, 0, -1), [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)]))
    if cp[2] > z1:
      faces.append(((0, 0, 1), [(x1, y0, z1), (x0, y0, z1), (x0, y1, z1), (x1, y1, z1)]))
    if cp[0] < x0:
      faces.append(((-1, 0, 0), [(x0, y0, z1), (x0, y0, z0), (x0, y1, z0), (x0, y1, z1)]))
    if cp[0] > x1:
      faces.append(((1, 0, 0), [(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)]))
    if cp[1] > y1 and not b.gable:
      faces.append(((0, 1, 0), [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)]))
    if cp[1] < y0:
      faces.append(((0, -1, 0), [(x0, y0, z0), (x0, y0, z1), (x1, y0, z1), (x1, y0, z0)]))
    if b.gable:
      rh = b.roof_height()
      zm = (z0 + z1) / 2
      faces.append((("roof", -1), [(x0, y1, z0), (x1, y1, z0), (x1, y1 + rh, zm), (x0, y1 + rh, zm)]))
      faces.append((("roof", 1), [(x1, y1, z1), (x0, y1, z1), (x0, y1 + rh, zm), (x1, y1 + rh, zm)]))
      for x, sgn in ((x0, -1), (x1, 1)):
        if (cp[0] - x) * sgn > 0:
          faces.append(((sgn, 0, 0), [(x, y1, z0), (x, y1 + rh, zm), (x, y1, z1)]))
    polys = []
    for n, pts in faces:
      if n[0] == "roof":
        side = n[1]
        zm = (z0 + z1) / 2
        if (cp[2] - zm) * side < 0 and cp[1] < y1 + b.roof_height():
          continue
        pr = cam.project_poly(pts)
        if pr is None:
          continue
        k = 0.75 + 0.3 * (1 if side < 0 else 0.4)
        col = self.fog(_shade(b.roof, k), dist)
      else:
        pr = cam.project_poly(pts)
        if pr is None:
          continue
        k = 0.62 + 0.45 * max(0.0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])
        base = b.roof if n[1] > 0 else b.colour
        col = self.fog(_shade(base, k), dist)
      poly = pr[0]
      pygame.draw.polygon(s, col, poly)
      pygame.draw.polygon(s, self.fog(_shade(col, 0.75), dist), poly, 1)
      polys.append(poly)
      if n[0] != "roof" and n[1] == 0 and len(pts) == 4 and b.windows and dist < 90:
        self.draw_windows(s, b, pts, dist)
      if n[0] != "roof" and n[1] == 0 and len(pts) == 4 and b.kind is not None and dist < 120:
        self.draw_wall_sign(s, b, pts)
    if self.target is b and polys:
      for poly in polys:
        pygame.draw.polygon(s, (255, 236, 120), poly, 3)
    if b.kind is not None and polys:
      self.hit_polys[b.key] = polys

  def draw_windows(self, s, b, pts, dist):
    cam = self.cam
    p0, p1, _, p3 = pts
    width = math.dist(p0, p1)
    height = b.h - b.y0
    cols = max(1, min(5, int(width / 4.5)))
    rows = max(1, min(4, int(height / 5.0)))
    dx, _, dz = b.door()
    mid = ((p0[0] + p1[0]) / 2, (p0[2] + p1[2]) / 2)
    door_face = math.hypot(mid[0] - dx, mid[1] - dz) < 4.0
    vmax = 0.68 if b.kind is not None else 1.0

    def at(u, v):
      return tuple(p0[i] + (p1[i] - p0[i]) * u + (p3[i] - p0[i]) * v for i in range(3))

    for r in range(rows):
      for c in range(cols):
        if door_face and r == 0 and abs((c + 0.5) / cols - 0.5) < 0.6 / cols:
          continue
        u0, u1 = (c + 0.22) / cols, (c + 0.78) / cols
        v0, v1 = (r + 0.3) / rows * vmax, (r + 0.78) / rows * vmax
        pr = cam.project_poly([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)])
        if pr:
          pygame.draw.polygon(s, self.fog((255, 250, 235), dist), pr[0])
          pygame.draw.polygon(s, self.fog((120, 170, 230), dist), pr[0], 2)
    if door_face:
      dw = min(0.3, 3.2 / max(width, 1.0))
      top = min(0.8, 4.2 / height)
      pr = cam.project_poly([at(0.5 - dw / 2, 0), at(0.5 + dw / 2, 0), at(0.5 + dw / 2, top), at(0.5 - dw / 2, top)])
      if pr:
        pygame.draw.polygon(s, self.fog((140, 80, 50), dist), pr[0])
        pygame.draw.polygon(s, self.fog((255, 220, 120), dist), pr[0], 2)

  def sign_surface(self, b):
    sign = self._signs.get(b.key)
    if sign is None:
      text = self.g.font_at(44).render(symbols.text(b.label), True, (40, 40, 70))
      sign = pygame.Surface((text.get_width() + 40, text.get_height() + 16))
      sign.fill((255, 255, 255))
      pygame.draw.rect(sign, b.colour, sign.get_rect(), 7)
      sign.blit(text, (20, 8))
      self._signs[b.key] = sign
    return sign

  def draw_wall_sign(self, s, b, pts):
    if symbols.ONLY:                           # a word sign on the wall: not drawn with symbols only
      return
    cam = self.cam
    p0, p1, _, p3 = pts
    width = math.dist((p0[0], p0[2]), (p1[0], p1[2]))
    height = b.h - b.y0
    sign = self.sign_surface(b)
    aspect = sign.get_width() / sign.get_height()
    sh = min(4.2, 0.27 * height)
    sw = min(width * 0.94, sh * aspect)
    sh = sw / aspect
    u0, u1 = 0.5 - sw / width / 2, 0.5 + sw / width / 2
    vt = 0.975
    vb = vt - sh / height

    def at(u, v):
      return tuple(p0[i] + (p1[i] - p0[i]) * u + (p3[i] - p0[i]) * v for i in range(3))

    left, right = cam.project(at(u0, (vt + vb) / 2)), cam.project(at(u1, (vt + vb) / 2))
    if not left or not right or abs(right[0] - left[0]) < 18:
      return
    flip = right[0] < left[0]
    n = 16
    tw, th = sign.get_size()
    for k in range(n):
      ua, ub = u0 + (u1 - u0) * k / n, u0 + (u1 - u0) * (k + 1) / n
      ta, ba, tb, bb = (cam.project(at(ua, vt)), cam.project(at(ua, vb)),
                        cam.project(at(ub, vt)), cam.project(at(ub, vb)))
      if not (ta and ba and tb and bb):
        continue
      x, w = min(ta[0], tb[0]), abs(tb[0] - ta[0])
      y = min(ta[1], tb[1])
      hgt = max(ba[1], bb[1]) - y
      if w < 0.5 or hgt < 2:
        continue
      col = n - 1 - k if flip else k
      c0, c1 = int(tw * col / n), int(tw * (col + 1) / n)
      piece = pygame.transform.scale(sign.subsurface((c0, 0, max(1, c1 - c0), th)),
                                     (int(w) + 1, int(hgt) + 1))
      s.blit(piece, (int(x), int(y)))

  def draw_sathi_ahead(self, s):
    """Sathi hops along the Domino Highway a little ahead of the hero."""
    f = self.flight
    if not self.flying or not getattr(f, "highway", False):
      return
    pos, _yaw = f.at_s(f.s + 9.0)
    q = self.cam.project((pos[0] + 1.6, 0.0, pos[2]))
    if q:
      sathi.draw(s, q[0], q[1], max(8, min(90, self.cam.focal * 3.2 / q[2])), self.t, "hop")

  def draw_sea_life(self, s):
    """Boats bobbing and dolphins leaping in the water near the camera."""
    if self.flyover is not None:
      return
    cam = self.cam
    cx, _, cz = cam.pos
    for k in range(10):
      gx = math.floor(cx / 90.0) * 90.0 + ((k * 37) % 5 - 2) * 90.0 + 25.0 * math.sin(k * 7.1)
      gz = math.floor(cz / 90.0) * 90.0 + ((k * 53) % 5 - 1) * 90.0 + 25.0 * math.cos(k * 3.3)
      seed = int(gx * 13 + gz * 7) % 97
      if town.land_at(gx, gz) or town.land_at(gx + 8, gz) or town.land_at(gx - 8, gz):
        continue
      if seed % 3 == 0:                          # a dolphin leaping now and then
        ph = (self.t * 0.35 + seed * 0.13) % 1.0
        if ph > 0.45:
          continue
        u = ph / 0.45
        p = cam.project((gx + 10 * (u - 0.5), 4.5 * math.sin(math.pi * u), gz))
        if not p or p[2] > 260:
          continue
        k2 = cam.focal / p[2]
        ang = math.cos(math.pi * u) * 0.9
        body = [(p[0] + math.cos(ang) * 2.4 * k2 * sgn, p[1] - math.sin(ang) * 2.4 * k2 * sgn) for sgn in (1, -1)]
        pygame.draw.line(s, self.fog((80, 110, 150), p[2]), body[0], body[1], max(2, int(1.1 * k2)))
        pygame.draw.circle(s, self.fog((80, 110, 150), p[2]), (int(body[0][0]), int(body[0][1])), max(1, int(0.6 * k2)))
        continue
      bob = 0.3 * math.sin(self.t * 1.8 + seed)
      hull = [cam.project((gx + dx, bob + dy, gz)) for dx, dy in ((-3.0, 0.6), (3.0, 0.6), (2.2, -0.4), (-2.2, -0.4))]
      if not all(hull) or hull[0][2] > 260:
        continue
      col = ((230, 70, 60), (250, 250, 250), (60, 120, 220), (250, 190, 40))[seed % 4]
      pygame.draw.polygon(s, self.fog(col, hull[0][2]), [h[:2] for h in hull])
      mast = cam.project((gx, bob + 0.6, gz)), cam.project((gx, bob + 6.0, gz)), cam.project((gx + 2.6, bob + 1.0, gz))
      if all(mast):
        pygame.draw.polygon(s, self.fog((255, 255, 245), mast[0][2]), [m[:2] for m in mast])
        pygame.draw.line(s, self.fog((90, 70, 50), mast[0][2]), mast[0][:2], mast[1][:2], 1)

  def draw_creations(self, s, b):
    """The child's latest creations float round the My Creations museum."""
    done = self.g.progress.data.get("done", [])[-8:]
    if not done:
      return
    cx, _, cz = b.centre
    for i, key in enumerate(done):
      cat, _, name = key.partition("/")
      a = self.t * 0.4 + i * math.tau / len(done)
      p = self.cam.project((cx + 20 * math.cos(a), b.top + 6 + 1.5 * math.sin(self.t * 2 + i), cz + 20 * math.sin(a)))
      if not p or p[2] > 400:
        continue
      size = int(max(16, min(96, self.cam.focal * 6 / p[2])) // 16 * 16)
      pic = self.g.thumb(name, cat, size)
      if pic is not None:
        s.blit(pic, pic.get_rect(midbottom=(int(p[0]), int(p[1]))))

  def draw_crystal(self, s, b):
    """The Magic Box glows on its pedestal with seven class crystals circling it; a Back
    to Gate crystal glows and spins."""
    cam = self.cam
    cx, _, cz = b.centre
    gate = b.kind == "gateway"
    y = b.h + (2.6 if gate else 1.4) + 0.3 * math.sin(self.t * 2.2)
    c = cam.project((cx, y, cz))
    if not c or c[2] > 400:
      return
    k = cam.focal / c[2]
    size = (1.6 if gate else 1.0) * k
    glow = pygame.Surface((int(size * 6) + 4,) * 2, pygame.SRCALPHA)
    gc = (200, 150, 255) if gate else (150, 240, 255)
    pygame.draw.circle(glow, (*gc, 70), (glow.get_width() // 2,) * 2, int(size * 3))
    pygame.draw.circle(glow, (*gc, 110), (glow.get_width() // 2,) * 2, int(size * 1.9))
    s.blit(glow, (int(c[0] - glow.get_width() / 2), int(c[1] - glow.get_height() / 2)))
    spin = self.t * 1.6
    gem = [(c[0], c[1] - size * 1.3), (c[0] + size * abs(math.cos(spin)), c[1]),
           (c[0], c[1] + size * 1.3), (c[0] - size * abs(math.cos(spin)), c[1])]
    pygame.draw.polygon(s, (255, 230, 120) if gate else (170, 245, 255), gem)
    pygame.draw.polygon(s, WHITE, gem, max(1, int(size / 6)))
    if gate:                                  # the seven class crystals going round
      for i, (n, _name, col, _keys) in enumerate(town.CLASSES):
        a = spin + i * math.tau / 7
        q = cam.project((cx + 2.4 * math.cos(a), y + 0.4 * math.sin(a * 2), cz + 2.4 * math.sin(a)))
        if q:
          r = max(2, int(cam.focal * 0.42 / q[2]))
          pygame.draw.circle(s, col, (int(q[0]), int(q[1])), r)
          pygame.draw.circle(s, WHITE, (int(q[0] - r / 3), int(q[1] - r / 3)), max(1, r // 3))

  def draw_gem_button(self, s, r, col, title, native=None, sub=None, icon=None):
    """A crystal button: a faceted gem in the class colour."""
    cut = min(18, r.h // 4)
    outer = [(r.x + cut, r.y), (r.right - cut, r.y), (r.right, r.y + cut), (r.right, r.bottom - cut),
             (r.right - cut, r.bottom), (r.x + cut, r.bottom), (r.x, r.bottom - cut), (r.x, r.y + cut)]
    pygame.draw.polygon(s, _shade(col, 0.8), outer)
    inner = r.inflate(-cut, -cut)
    top = [(r.x + cut, r.y), (r.right - cut, r.y), (inner.right, inner.y), (inner.x, inner.y)]
    pygame.draw.polygon(s, _mix(col, WHITE, 0.45), top)
    pygame.draw.rect(s, col, inner)
    shine = int(inner.w * ((self.t * 0.4 + r.x * 0.003) % 1.6 - 0.3))
    if 0 < shine < inner.w - 6:
      pygame.draw.line(s, _mix(col, WHITE, 0.6), (inner.x + shine, inner.bottom - 2),
                       (inner.x + min(inner.w - 2, shine + inner.h // 2), inner.y + 2), 3)
    pygame.draw.polygon(s, WHITE, outer, 2)
    y = inner.centery
    if icon is not None:
      s.blit(icon, icon.get_rect(midleft=(inner.x + 4, inner.centery)))
    cx = inner.centerx + (icon.get_width() // 2 if icon is not None else 0)
    room = inner.w - 8 - (icon.get_width() if icon is not None else 0)
    if native is not None and native.get_width() > room:      # long Hindi / Bangla words
      native = pygame.transform.smoothscale(
          native, (room, max(1, native.get_height() * room // native.get_width())))
    if native is not None:
      s.blit(native, native.get_rect(center=(cx, y - 8)))
      self.text(s, title, (cx, inner.bottom - 10), 13, WHITE)
    else:
      size = 20
      while size > 12 and self.g.font_at(size).size(title)[0] > inner.w - 8 - (icon.get_width() if icon else 0):
        size -= 1
      self.text(s, title, (cx, y - (8 if sub else 0)), size, WHITE)
    if sub and native is None:
      self.text(s, sub, (cx, inner.bottom - 10), 12, (255, 255, 240))

  def draw_magic_box(self, s):
    panel, cells, close = self.magic_layout()
    veil = pygame.Surface(self.size, pygame.SRCALPHA)
    veil.fill((20, 10, 50, 170))
    s.blit(veil, (0, 0))
    pygame.draw.rect(s, (40, 26, 90), panel, border_radius=22)
    pygame.draw.rect(s, (255, 215, 90), panel, 4, border_radius=22)
    glow = 0.5 + 0.5 * math.sin(self.t * 3)
    self.text(s, "Magic Box", (panel.centerx, panel.y + 30), 28, _mix((255, 215, 90), WHITE, glow))
    self.fit_text(s, "Pick your class - ride the Domino Highway!", (panel.centerx, panel.y + 58), 14,
                  panel.w - 24, (220, 210, 255))
    for r, n, name, col in cells:
      native = self.label_image(f"class{n}", max(20, r.h // 3))
      self.draw_gem_button(s, r, col, f"Class {n}", native, name)
    self.draw_button(s, close, "Back to town", (90, 80, 150))
    sathi.draw(s, close.x - 34, close.bottom, 54, self.t, "point")   # Sathi points at the crystals

  def draw_console(self, s):
    b = self.console
    n = b.payload
    col = b.colour
    panel, cells, pedestal, gate, close = self.console_layout()
    veil = pygame.Surface(self.size, pygame.SRCALPHA)
    veil.fill((10, 20, 40, 150))
    s.blit(veil, (0, 0))
    pygame.draw.rect(s, (252, 248, 238), panel, border_radius=22)   # the courtyard
    pygame.draw.rect(s, col, panel, 5, border_radius=22)
    native = self.label_image(f"class{n}", 30)
    if native is not None:
      s.blit(native, native.get_rect(center=(panel.centerx, panel.y + 26)))
    else:
      self.text(s, f"Class {n}", (panel.centerx, panel.y + 26), 26, (40, 40, 70))
    self.fit_text(s, "Subject Magic Console: what shall we learn?", (panel.centerx, panel.y + 56), 14,
                  panel.w - 24, (90, 90, 120))
    for r, key, name, icon in cells:
      if key == "maths":
        pic = self.g.thumb(str(n), "123", r.h - 34)
      elif icon is not None:
        pic = self.g.thumb(icon[1], icon[0], r.h - 34)
      else:
        first_cat = (self.g.subjects.get(name) or [None])[0]
        pic = self.g.thumb(next(iter(hub.CATEGORIES_HUB[first_cat])), first_cat, r.h - 34) if first_cat else None
      if pic is not None and pic.get_width() > r.w * 0.34:
        pic = pygame.transform.smoothscale(pic, (int(r.w * 0.34), max(1, int(pic.get_height() * r.w * 0.34 / pic.get_width()))))
      self.draw_gem_button(s, r, _shade(col, 0.95) if key != "maths" else _shade(col, 0.8), name,
                           self.label_image(key, max(18, r.h // 4)), None, pic)
    # the magic pedestal, glowing, with the indoor domino wave running to the chosen station
    px, py = pedestal
    pulse = 0.5 + 0.5 * math.sin(self.t * 4)
    pygame.draw.ellipse(s, _mix(col, WHITE, 0.3 + 0.3 * pulse), (px - 46, py - 6, 92, 22))
    pygame.draw.rect(s, _shade(col, 0.7), (px - 30, py - 30, 60, 30), border_radius=6)
    gem = [(px, py - 60 - 4 * pulse), (px + 16, py - 42), (px, py - 26), (px - 16, py - 42)]
    pygame.draw.polygon(s, _mix(col, WHITE, 0.5), gem)
    pygame.draw.polygon(s, WHITE, gem, 2)
    if self.console_wave is not None:
      t0, a, bpt, _key = self.console_wave
      k = (self.t - t0) / self.WAVE_SECS
      ax, ay = a[0], a[1] - 30
      dx, dy = bpt[0] - ax, bpt[1] - ay
      L = math.hypot(dx, dy) or 1.0
      ux, uy = dx / L, dy / L
      for i in range(self.WAVE_N):
        f = (i + 0.5) / self.WAVE_N
        x, y = ax + dx * f, ay + dy * f
        fall = max(0.0, min(1.0, k * self.WAVE_N - i))
        h = 16
        lean = fall * 1.35                               # standing ... toppling towards the station
        top = (x + ux * h * math.sin(lean), y - h * math.cos(lean) + uy * h * math.sin(lean))
        dc = _mix(col, WHITE, 0.25 * fall)
        pygame.draw.line(s, (40, 40, 60), (x, y), top, 9)
        pygame.draw.line(s, dc, (x, y), top, 7)
        pygame.draw.circle(s, WHITE, (int((x + top[0]) / 2), int((y + top[1]) / 2)), 2)
    self.draw_button(s, gate, "Back to Gate", (120, 90, 220))
    self.draw_button(s, close, "Back to town", (90, 110, 150))

  def draw_door_marks(self, s):
    self.door_marks = []
    if self.g.overlay or self.panel_open:
      return
    px, _, pz = self.player.pos
    near = sorted(((math.hypot(b.door()[0] - px, b.door()[2] - pz), i, b)
                   for i, b in enumerate(self.boxes) if b.kind is not None))
    for rank, (d, _i, b) in enumerate(near[:3]):
      if d > 45:
        break
      dx, _, dz = b.door()
      arcade = b.key == "arcade" or b.kind == "zone"
      street_x = dx if arcade else (-4.0 if dx < 0 else 4.0)
      span = dx - street_x
      sgn = 1 if span >= 0 else -1
      for k in range(4):
        f = (k + (self.t * 1.5) % 1.0) / 4.0
        if arcade:
          cx, cz, fx, fz = dx, dz - 8 + 8 * f, 0.0, 1.0
        else:
          cx, cz, fx, fz = street_x + span * f, dz, float(sgn), 0.0
        qx, qz = -fz, fx
        pts = [(cx + fx * 0.9, cz + fz * 0.9), (cx - fx * 0.5 + qx * 1.1, cz - fz * 0.5 + qz * 1.1),
               (cx - fx * 0.1, cz - fz * 0.1), (cx - fx * 0.5 - qx * 1.1, cz - fz * 0.5 - qz * 1.1)]
        pr = self.cam.project_poly([(x, 0.06, z) for x, z in pts])
        if pr:
          pygame.draw.polygon(s, YELLOW, pr[0])
          pygame.draw.polygon(s, (200, 120, 0), pr[0], 1)
      bob = 0.5 * math.sin(self.t * 4 + rank)
      tip = self.cam.project((dx, 5.2 + bob, dz))
      if not tip or tip[2] > 70:
        continue
      k = max(0.5, min(1.6, 22.0 / tip[2]))
      w, h = 26 * k, 30 * k
      x, y = tip[0], tip[1]

      def arrow(grow):
        return [(x - w * 0.6 - grow, y - h - grow), (x + w * 0.6 + grow, y - h - grow),
                (x + w * 0.6 + grow, y - h * 0.45), (x + w + grow, y - h * 0.45),
                (x, y + grow), (x - w - grow, y - h * 0.45), (x - w * 0.6 - grow, y - h * 0.45)]

      pygame.draw.polygon(s, (200, 120, 0), arrow(3))
      pygame.draw.polygon(s, YELLOW, arrow(0))
      if rank == 0:
        lbl = self.g.font_at(max(14, int(16 * k))).render(symbols.text("GO IN"), True, WHITE)
        box = lbl.get_rect(midbottom=(int(x), int(y - h - 6))).inflate(16, 8)
        pygame.draw.rect(s, (60, 170, 90), box, border_radius=box.h // 2)
        pygame.draw.rect(s, WHITE, box, 2, border_radius=box.h // 2)
        s.blit(lbl, lbl.get_rect(center=box.center))
      hit = pygame.Rect(0, 0, int(w * 2.4), int(h * 2.6))
      hit.midbottom = (int(x), int(y + 6))
      self.door_marks.append((hit, b))

  def draw_tree(self, s, t, dist):
    x, z, h = t
    base = self.cam.project((x, 0.0, z))
    top = self.cam.project((x, h, z))
    if not base or not top:
      return
    scale = self.cam.focal / base[2]
    lean = (0.12 + 0.03 * math.sin(self.t * 1.3 + x * 0.07)) * h * scale   # a palm leans and sways
    mid = ((base[0] + top[0]) / 2 + lean * 0.4, (base[1] + top[1]) / 2)
    tip = (top[0] + lean, top[1])
    wide = max(1, int(0.32 * scale))
    trunk = self.fog((150, 110, 70), dist)
    pygame.draw.line(s, trunk, base[:2], mid, wide + 1)
    pygame.draw.line(s, trunk, mid, tip, wide)
    leaf = self.fog((50, 160, 80), dist)
    leaf2 = self.fog((90, 190, 90), dist)
    L = h * 0.55 * scale
    for k in range(7):                           # drooping leaves all round the crown
      a = k / 7 * math.tau + 0.3
      ex, ey = tip[0] + math.cos(a) * L, tip[1] + abs(math.sin(a)) * L * 0.25 + L * 0.2
      cxp, cyp = tip[0] + math.cos(a) * L * 0.5, tip[1] - L * 0.25
      pts = [tip, (cxp, cyp), (ex, ey)]
      pygame.draw.lines(s, leaf if k % 2 else leaf2, False, pts, max(2, int(0.5 * scale)))
    pygame.draw.circle(s, self.fog((120, 80, 40), dist), (int(tip[0]), int(tip[1])), max(1, wide))

  def draw_lamp(self, s, lp, dist):
    x, z = lp
    a = self.cam.project((x, 0.0, z))
    b = self.cam.project((x, 4.5, z))
    if a and b:
      pygame.draw.line(s, self.fog((70, 80, 100), dist), a[:2], b[:2], max(1, int(self.cam.focal * 0.16 / a[2])))
      pygame.draw.circle(s, self.fog((255, 236, 170), dist), (int(b[0]), int(b[1])), max(2, int(self.cam.focal * 0.38 / b[2])))

  def floor_under(self):
    px, py, pz = self.player.pos
    floor = 0.0
    for b in self.boxes:
      if b.contains_xz(px, pz) and b.h <= py + 0.1:
        floor = max(floor, b.h)
    return floor

  def draw_player(self, s):
    p, cam = self.player, self.cam
    px, py, pz = p.pos
    share = HERO_SCREEN * (0.55 if self.flying and not self.flight.rotor else 1.0)  # smaller in flight
    K = max(HERO_SCALE, min(HERO_MAX, share * cam.h * cam.dist / (cam.focal * 1.95)))
    sh = cam.project((px, self.floor_under() + 0.03, pz))
    if sh:
      r = max(3, int(cam.focal * 0.7 * K / sh[2]))
      shadow = pygame.Surface((2 * r, r), pygame.SRCALPHA)
      pygame.draw.ellipse(shadow, (0, 0, 0, 80), shadow.get_rect())
      s.blit(shadow, (sh[0] - r, sh[1] - r // 2))
    foot = cam.project((px, py, pz))
    if not foot:
      return
    sc = cam.focal / foot[2] * K
    hx, _, hz = p.heading

    def P(dx, dy, dz=0.0):
      dx, dy, dz = dx * K, dy * K, dz * K
      q = cam.project((px + hz * dx + hx * dz, py + dy, pz - hx * dx + hz * dz))
      return (q[0], q[1]) if q else foot[:2]

    # Check if hero is walking away from camera
    cam_dx = px - cam.pos[0]
    cam_dz = pz - cam.pos[2]
    is_facing_away = (hx * cam_dx + hz * cam_dz) > 0.0

    swing = math.sin(p.walk_phase * 2.2) * (0.38 if p.grounded else 0.15)
    hip = P(0, 0.94)
    neck = P(0, 1.48)
    head = P(0, 1.72)
    lw = max(3, int(0.20 * sc))

    # --- 1. CAPE (Hero Glide / Running Cape), or wings in a flight ---
    beat = math.sin(self.flight.flap) if self.flying and self.flight.flap_rate else None
    if beat is not None and not p.grounded:
      wing = self.flight.dominoes[0].col
      for side in (-1, 1):
        w = [P(side * 0.2, 1.42, -0.12), P(side * 1.15, 1.75 + 0.5 * beat, -0.25),
             P(side * 1.0, 1.05 + 0.3 * beat, -0.25), P(side * 0.2, 1.0, -0.12)]
        pygame.draw.polygon(s, wing, w)
        pygame.draw.polygon(s, _shade(wing, 0.5), w, max(1, lw // 3))
    elif p.gliding:
      cape = [P(-0.35, 1.46, -0.1), P(0.35, 1.46, -0.1), P(1.0, 0.4, -0.9), P(-1.0, 0.4, -0.9)]
      pygame.draw.polygon(s, (220, 35, 45), cape)
      pygame.draw.polygon(s, (160, 20, 30), cape, max(1, lw // 3))
    elif is_facing_away:
      c_sw = math.sin(p.walk_phase * 2.2) * 0.06
      cape = [P(-0.25, 1.44, -0.06), P(0.25, 1.44, -0.06), 
              P(0.26 + c_sw, 0.90, -0.22), P(-0.26 + c_sw, 0.90, -0.22)]
      pygame.draw.polygon(s, (220, 35, 45), cape)

    # --- 2. LEGS & SNEAKERS ---
    for side, sw in ((-0.16, swing), (0.16, -swing)):
      knee = P(side * 0.85, 0.50, sw * 0.5)
      foot_pt = P(side, 0.04, sw)
      # Trousers
      pygame.draw.line(s, (30, 50, 115), hip, knee, lw + 2)
      pygame.draw.line(s, (30, 50, 115), knee, foot_pt, lw + 1)
      # Academy Sneakers (Red sports shoes with white trim)
      fx, fy = int(foot_pt[0]), int(foot_pt[1])
      pygame.draw.ellipse(s, (230, 40, 40), (fx - max(4, lw), fy - max(2, lw // 2), max(8, lw * 2), max(5, lw + 2)))
      pygame.draw.circle(s, (255, 255, 255), (fx, fy), max(2, lw // 2))

    # --- 3. TORSO (Academy Uniform Blazer) ---
    torso = [P(-0.26, 1.46), P(0.26, 1.46), P(0.21, 0.92), P(-0.21, 0.92)]
    # White base shirt
    pygame.draw.polygon(s, (245, 248, 255), torso)
    # Navy Blazer edges
    pygame.draw.polygon(s, (25, 45, 110), torso, max(2, lw // 3))

    if is_facing_away:
      # BACK VIEW: Leather School Satchel Backpack
      bag = [P(-0.26, 1.42, -0.15), P(0.26, 1.42, -0.15), P(0.28, 0.96, -0.18), P(-0.28, 0.96, -0.18)]
      pygame.draw.polygon(s, (245, 130, 30), bag)
      pygame.draw.polygon(s, (180, 80, 20), bag, max(1, lw // 3))
      # Backpack Flap & Badge
      flap = [bag[0], bag[1], P(0.20, 1.22, -0.20), P(-0.20, 1.22, -0.20)]
      pygame.draw.polygon(s, (255, 165, 50), flap)
      pygame.draw.circle(s, (255, 215, 60), (int(bag[0][0] + 12), int(bag[0][1] + 16)), max(2, lw // 3))
      # Straps over shoulders
      for s_side in (-0.18, 0.18):
        pygame.draw.line(s, (200, 90, 25), P(s_side, 1.46, -0.05), P(s_side * 1.1, 0.98, -0.16), max(2, lw // 2))
    else:
      # FRONT VIEW: Collar, Tie & School Crest
      collar = [P(-0.11, 1.46, 0.05), P(0.11, 1.46, 0.05), P(0, 1.32, 0.06)]
      pygame.draw.polygon(s, (255, 255, 255), collar)
      tie = [P(-0.04, 1.42, 0.06), P(0.04, 1.42, 0.06), P(0.03, 1.10, 0.06), P(0, 1.04, 0.06), P(-0.03, 1.10, 0.06)]
      pygame.draw.polygon(s, (220, 35, 45), tie)
      # Gold Academy Crest on pocket
      crest_pt = P(-0.15, 1.30, 0.05)
      pygame.draw.circle(s, (245, 200, 40), (int(crest_pt[0]), int(crest_pt[1])), max(2, lw // 2))

    # Belt line
    pygame.draw.line(s, (30, 30, 35), P(-0.21, 0.93), P(0.21, 0.93), max(2, lw // 2))

    # --- 4. ARMS & HANDS ---
    def arm(a, b):
      elbow = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
      pygame.draw.line(s, (25, 45, 110), a, elbow, lw + 1)
      pygame.draw.line(s, SKIN, elbow, b, lw)
      pygame.draw.circle(s, SKIN, (int(b[0]), int(b[1])), max(3, lw // 2 + 1))

    shoulder_l, shoulder_r = P(-0.25, 1.42), P(0.25, 1.42)
    rope = p.rope[0] if p.rope is not None else None
    if rope is None and self.web_flash and self.t < self.web_flash[1] and p.zip is not None:
      rope = self.web_flash[0]

    if rope is not None:
      hand = P(0.1, 2.0)
      a = cam.project(rope)
      if a:
        pygame.draw.line(s, WEB, hand, a[:2], 2)
      arm(shoulder_r, hand)
      arm(shoulder_l, P(-0.35, 1.0, 0.2))
    elif beat is not None and not p.grounded:            # flapping like a bird
      arm(shoulder_l, P(-0.62, 1.42 + 0.38 * beat, -0.1))
      arm(shoulder_r, P(0.62, 1.42 + 0.38 * beat, -0.1))
    elif not p.grounded:
      arm(shoulder_l, P(-0.48, 1.75))
      arm(shoulder_r, P(0.48, 1.75))
    else:
      arm(shoulder_l, P(-0.32, 1.02, -swing))
      arm(shoulder_r, P(0.32, 1.02, swing))

    # --- 5. HEAD & FACE ---
    hr = max(4, int(0.23 * sc))
    pygame.draw.circle(s, SKIN, (int(head[0]), int(head[1])), hr)
    # Hair / Trim
    pygame.draw.circle(s, HAIR, (int(head[0]), int(head[1] - hr * 0.22)), int(hr * 0.96),
                       draw_top_left=True, draw_top_right=True)

    # Face details ONLY when facing toward camera
    if not is_facing_away and hr >= 5:
      for ex in (-0.36, 0.36):
        pygame.draw.circle(s, (30, 30, 40), (int(head[0] + ex * hr), int(head[1] + hr * 0.10)), max(1, hr // 7))
      pygame.draw.arc(s, (160, 60, 50), (head[0] - hr * 0.38, head[1] + hr * 0.05, hr * 0.76, hr * 0.55),
                      math.pi * 1.15, math.pi * 1.85, max(1, hr // 8))
    self.draw_rainbow_cap(s, head, hr, P(0, 1.76, 0.42), self.g.cap_colours())
    self.dream_at = ((head[0], head[1] - hr * 1.4), hr)
    rotor = self.flight.rotor if self.flying else 0.0
    if rotor > 0:                                        # landing like a helicopter
      top, hub_pt = P(0, 2.0), P(0, 2.0 + 0.3 * rotor)
      pygame.draw.line(s, (60, 60, 70), top, hub_pt, max(2, lw // 2))
      for k in range(2):
        a = self.t * 26 + k * math.pi / 2
        end = P(math.cos(a) * 1.4 * rotor, 2.0 + 0.3 * rotor, math.sin(a) * 1.4 * rotor)
        other = P(-math.cos(a) * 1.4 * rotor, 2.0 + 0.3 * rotor, -math.sin(a) * 1.4 * rotor)
        pygame.draw.line(s, (50, 50, 60), other, end, max(2, lw // 2))
      pygame.draw.circle(s, (240, 200, 40), (int(hub_pt[0]), int(hub_pt[1])), max(2, lw // 2))
    if p.splash > 0:
      for k in range(6):
        a = k / 6 * math.tau + self.t * 3
        q = P(math.cos(a) * 0.9, 0.3 + 0.8 * p.splash / 2.5, math.sin(a) * 0.9)
        pygame.draw.circle(s, (190, 225, 255), (int(q[0]), int(q[1])), max(2, int(0.1 * sc)))

  def dream_now(self):
    return DREAMS[int(self.t / DREAM_SECS) % len(DREAMS)]

  def draw_dream(self, s, top, hr):
    cat, name, en, _hi, _bn = self.dream_now()
    size = max(44, min(84, int(hr * 3.2)))
    k = (self.t % DREAM_SECS) / DREAM_SECS
    bob = math.sin(self.t * 2.0) * 3
    for i, (dx, dy, r) in enumerate(((0.6, -0.4, 0.18), (1.1, -1.0, 0.26), (1.6, -1.8, 0.34))):
      pygame.draw.circle(s, WHITE, (int(top[0] + dx * hr), int(top[1] + dy * hr + bob)), max(2, int(r * hr)))
    centre = (int(top[0] + hr * 2.4 + size * 0.45), int(top[1] - hr * 2.2 - size * 0.55 + bob))
    bubble = pygame.Rect(0, 0, size + 26, size + 34)
    bubble.center = centre
    w, h = self.size
    bubble.clamp_ip(pygame.Rect(4, 56, w - 8, h - 60))
    for ox, oy, rr in ((-0.32, -0.1, 0.42), (0.32, -0.1, 0.42), (0, -0.32, 0.4), (0, 0.2, 0.45)):
      pygame.draw.circle(s, WHITE, (int(bubble.centerx + ox * bubble.w), int(bubble.centery + oy * bubble.h)),
                         int(rr * bubble.w))
    pygame.draw.rect(s, WHITE, bubble, border_radius=size // 2)
    pygame.draw.rect(s, (255, 200, 60), bubble, 3, border_radius=size // 2)
    fade = min(1.0, k * 8, (1 - k) * 8)
    pic = self.g.thumb(name, cat, size)
    if pic is not None:
      pic = pic.copy()
      pic.set_alpha(int(255 * fade))
      s.blit(pic, pic.get_rect(center=(bubble.centerx, bubble.centery - 8)))
    f = self.g.font_at(max(12, size // 5))
    label = f.render(symbols.text(en), True, (40, 40, 70))
    label.set_alpha(int(255 * fade))
    s.blit(label, label.get_rect(center=(bubble.centerx, bubble.bottom - 12)))
    self.dream_rect = bubble.inflate(10, 10)

  def say_dream(self):
    _cat, _name, en, hi, bn = self.dream_now()
    art = "an" if en[0] in "AEIOU" else "a"
    self.g.say(f"My dream: I will become {art} {en.lower()} and make India proud!",
               {"hi": f"मेरा सपना है {hi} बनना और भारत का नाम रोशन करना!",
                "bn": f"আমার স্বপ্ন {bn} হয়ে ভারতের মুখ উজ্জ্বল করা!"}.get(self.g.lang))
    self.say(f"Dream: {en}!", 3.0)

  @staticmethod
  def draw_rainbow_cap(s, head, hr, peak, colours):
    cx, cy = head[0], head[1] - hr * 0.2
    r = hr * 1.12
    for k, colour in enumerate(colours):
      a0 = math.pi + k * math.pi / 7
      a1 = math.pi + (k + 1) * math.pi / 7
      pts = [(cx, cy)] + [(cx + r * math.cos(a0 + (a1 - a0) * j / 4),
                           cy + r * math.sin(a0 + (a1 - a0) * j / 4)) for j in range(5)]
      pygame.draw.polygon(s, colour, pts)
      if hr >= 8:
        pygame.draw.line(s, (120, 120, 140), (cx, cy), pts[-1], 1)
    if hr >= 8:
      pygame.draw.arc(s, (90, 90, 110), (cx - r, cy - r, 2 * r, 2 * r), 0, math.pi, 2)
    band = max(1, int(hr * 0.22))
    pygame.draw.line(s, WHITE, (cx - r, cy), (cx + r, cy), band)
    pygame.draw.polygon(s, colours[0], [(cx - r * 0.7, cy), (cx + r * 0.7, cy),
                                        (peak[0], peak[1] - hr * 0.1)])
    pygame.draw.circle(s, WHITE, (int(cx), int(cy - r)), max(2, int(hr * 0.28)))

  def draw_anchor(self, s):
    if self.anchor is None or self.g.overlay or self.panel_open:
      return
    a = self.cam.project(self.anchor)
    if a:
      r = 8 + 3 * math.sin(self.t * 8)
      pygame.draw.circle(s, WHITE, (int(a[0]), int(a[1])), int(r) + 3, 2)
      pygame.draw.circle(s, YELLOW, (int(a[0]), int(a[1])), int(r))

  def place_labels(self):
    cam = self.cam
    cands = []
    for b in self.boxes:
      if b.kind is None:
        continue
      cx, _, cz = b.centre
      p = cam.project((cx, b.top + 2.0, cz))
      if not p or p[2] > LABEL_FAR or not (-40 < p[0] < self.size[0] + 40):
        continue
      if p[2] < 60:
        continue
      size = int(max(13, min(26, 1300 / p[2])))
      icon = size + 14 if p[2] < 120 else 0
      tw = self.g.font_at(size).size(b.label)[0]
      r = pygame.Rect(0, 0, tw + 24 + icon, max(size + 14, icon + 6))
      r.midbottom = (int(p[0]), int(p[1]))
      if r.top < 52:
        base = cam.project((cx, b.y0, cz))
        if base is None or base[1] < 52 + r.h:
          continue
        r.top = 52
      cands.append((p[2], b, r, size, icon))
    cands.sort(key=lambda c: c[0])
    kept, taken = {}, []
    for depth, b, r, size, icon in cands:
      if any(r.colliderect(t) for t in taken):
        continue
      taken.append(r.inflate(8, 6))
      kept[b.key] = (r, size, icon, depth)
    return kept

  def draw_label(self, s, b, r, size, icon, depth):
    pill = pygame.Surface(r.size, pygame.SRCALPHA)
    pygame.draw.rect(pill, (255, 255, 255, 235), pill.get_rect(), border_radius=r.h // 2)
    pygame.draw.rect(pill, (*b.colour, 255), pill.get_rect(), 4, border_radius=r.h // 2)
    s.blit(pill, r.topleft)
    x = r.x + 12
    if icon:
      pic = self.icon_for(b, icon)
      if pic is not None:
        s.blit(pic, pic.get_rect(midleft=(x, r.centery)))
      x += icon + 4
    self.text(s, b.label, (x, r.centery), size, (40, 40, 70), anchor="midleft")

  def map_box(self, b):
    x0, x1, z0, z1 = town.BOUNDS
    m = self.map_rect
    sx, sz = m.w / (x1 - x0), m.h / (z1 - z0)
    return pygame.Rect(m.x + (b.x0 - x0) * sx, m.bottom - (b.z1 - z0) * sz,
                       max(4, (b.x1 - b.x0) * sx), max(4, (b.z1 - b.z0) * sz))

  def map_point(self, x, z):
    x0, x1, z0, z1 = town.BOUNDS
    m = self.map_rect
    return (m.x + (x - x0) * m.w / (x1 - x0), m.bottom - (z - z0) * m.h / (z1 - z0))

  def draw_map(self, s):
    m = self.map_rect
    pygame.draw.rect(s, WHITE, m.inflate(8, 8), border_radius=10)
    if self._map_cache is None or self._map_cache[0] != m.size:   # the island, drawn once per size
      base = pygame.Surface(m.size)
      base.fill(SEA_NEAR)
      for col, poly, _mid, _rad in self.land:
        pts = [(x - m.x, y - m.y) for x, y in (self.map_point(px, pz) for px, pz in poly)]
        pygame.draw.polygon(base, col if col != PATH else STREET, pts)
      a, b = self.map_point(-3, town.MAINLAND_Z), self.map_point(3, town.TRUNK_END)
      pygame.draw.rect(base, STREET, pygame.Rect(a[0] - m.x, b[1] - m.y, max(2, b[0] - a[0]), a[1] - b[1]))
      self._map_cache = (m.size, base)
    s.blit(self._map_cache[1], m.topleft)
    for bx in self.boxes:
      if bx.kind is None:
        continue
      r = self.map_box(bx)
      pygame.draw.rect(s, bx.colour, r)
      if bx is self.target:
        pygame.draw.rect(s, WHITE, r.inflate(6, 6), 2)
    p = self.player
    c = self.map_point(p.pos[0], p.pos[2])
    hx, _, hz = -p.heading[0], -p.heading[1], -p.heading[2]
    tri = [(c[0] + hx * 9, c[1] - hz * 9), (c[0] - hz * 5 - hx * 4, c[1] - hx * 5 + hz * 4),
           (c[0] + hz * 5 - hx * 4, c[1] + hx * 5 + hz * 4)]
    pygame.draw.polygon(s, WHITE, tri)
    pygame.draw.polygon(s, SUIT, tri, 2)

  def draw_button(self, s, rect, label, colour):
    pygame.draw.rect(s, colour, rect, border_radius=12)
    pygame.draw.rect(s, WHITE, rect, 2, border_radius=12)
    if symbols.ONLY:
      symbols.draw(s, symbols.kind_of(label), rect)
      return
    size = 17
    while size > 11 and self.g.font_at(size).size(label)[0] > rect.w - 10:
      size -= 1
    self.text(s, label, rect.center, size)

  def draw_pad(self, s, p):
    r = p.rect
    surf = pygame.Surface(r.size, pygame.SRCALPHA)
    pygame.draw.rect(surf, (*_shade(p.colour, 1.35 if p.held else 1.0), 215), surf.get_rect(), border_radius=16)
    pygame.draw.rect(surf, (255, 255, 255, 170), surf.get_rect(), 3, border_radius=16)
    s.blit(surf, r.topleft)
    c, k = r.center, r.w * 0.22
    arrows = {"up": (0, -1), "down": (0, 1), "left": (-1, 0), "right": (1, 0)}
    if p.icon in arrows:
      dx, dy = arrows[p.icon]
      tip = (c[0] + dx * k, c[1] + dy * k)
      side = (-dy * k * 0.9, dx * k * 0.9)
      back = (c[0] - dx * k * 0.7, c[1] - dy * k * 0.7)
      pygame.draw.polygon(s, WHITE, [tip, (back[0] + side[0], back[1] + side[1]), (back[0] - side[0], back[1] - side[1])])
      return
    iy = c[1] - r.h * 0.12
    if p.icon == "web":
      for a in range(8):
        ang = a * math.pi / 4
        pygame.draw.line(s, WHITE, (c[0], iy), (c[0] + k * math.cos(ang), iy + k * math.sin(ang)), 2)
      for rr in (k * 0.45, k * 0.9):
        pygame.draw.circle(s, WHITE, (int(c[0]), int(iy)), int(rr), 1)
    elif p.icon == "zip":
      pygame.draw.polygon(s, WHITE, [(c[0] + k * 0.2, iy - k * 0.9), (c[0] + k, iy - k * 0.3), (c[0] - k * 0.6, iy - k * 0.3)])
      pygame.draw.line(s, WHITE, (c[0] - k, iy + k * 0.8), (c[0] + k * 0.2, iy - k * 0.5), 3)
    elif p.icon == "boots":
      pygame.draw.rect(s, WHITE, (c[0] - k * 0.5, iy - k * 0.8, k * 0.6, k * 1.2), border_radius=3)
      pygame.draw.rect(s, WHITE, (c[0] - k * 0.5, iy + k * 0.2, k * 1.3, k * 0.5), border_radius=4)
      pygame.draw.polygon(s, YELLOW, [(c[0] - k * 0.5, iy - k * 0.4), (c[0] - k * 1.2, iy - k * 0.9), (c[0] - k * 0.9, iy - k * 0.2)])
    elif p.icon == "cape":
      pygame.draw.polygon(s, WHITE, [(c[0] - k * 0.4, iy - k * 0.8), (c[0] + k * 0.4, iy - k * 0.8),
                                     (c[0] + k, iy + k * 0.8), (c[0] - k, iy + k * 0.8)])
    else:
      iy = c[1] + r.h * 0.12
    self.text(s, p.label, (c[0], r.bottom - r.h * 0.2 if p.icon else c[1]), 15 if len(p.label) < 6 else 13)

  def draw_hud(self, s):
    w, h = self.size
    bar = pygame.Surface((w, 54), pygame.SRCALPHA)
    bar.fill((30, 70, 140, 160))
    s.blit(bar, (0, 0))
    self.draw_button(s, self.buttons["guide"], "Guide me", (150, 80, 200))
    self.draw_button(s, self.buttons["houses"], "Houses", (240, 140, 40))
    self.draw_button(s, self.buttons["pictures"], "Pictures", (60, 160, 90))
    cap = self.buttons["cap"]
    pygame.draw.rect(s, (255, 255, 255), cap, border_radius=12)
    pygame.draw.rect(s, YELLOW, cap, 2, border_radius=12)
    self.draw_rainbow_cap(s, (cap.x + 24, cap.centery + 6), 13, (cap.x + 44, cap.centery + 7),
                          self.g.cap_colours())
    self.text(s, f"{min(7, self.g.cap_count())}/7", (cap.right - 6, cap.centery), 16,
              (60, 40, 120), anchor="midright")
    if w >= 640:
      self.text(s, "Wonder Town", (w - self.map_rect.w - 30, 27), 22, YELLOW, anchor="midright")
    self.draw_map(s)
    self.zip_rect = pygame.Rect(0, 0, 0, 0)
    if self.target is not None and self.player.zip is None and self.flight is None and self.walk is None:
      p = self.player
      dx, _, dz = self.target.door()
      dist = math.hypot(dx - p.pos[0], dz - p.pos[2])
      if dist > 6:
        label = f"Fly to {self.target.label}  ({int(dist)} m)"
        tw = self.g.font_at(17).size(label)[0]
        self.zip_rect = pygame.Rect(0, 0, min(w - 20, tw + 40), 40)
        self.zip_rect.midtop = (w // 2 if w >= 560 else (w - self.map_rect.w - 20) // 2 + 4, 62)
        if symbols.ONLY:
          self.zip_rect = pygame.Rect(0, 0, 76, 44)
          self.zip_rect.midtop = (w // 2 if w >= 560 else (w - self.map_rect.w - 20) // 2 + 4, 62)
        pygame.draw.rect(s, (240, 140, 40), self.zip_rect, border_radius=20)
        pygame.draw.rect(s, WHITE, self.zip_rect, 2, border_radius=20)
        if symbols.ONLY:
          symbols.draw(s, "fly", self.zip_rect)
        else:
          self.text(s, label, self.zip_rect.center, 17 if tw + 40 <= w - 20 else 14)
    self.gate_rect = pygame.Rect(0, 0, 0, 0)
    gx, _, gz = self.by_key["gateway"].door()
    if (self.flight is None and not self.panel_open and not self.g.overlay
            and math.hypot(gx - self.player.pos[0], gz - self.player.pos[2]) > 60):
      label = "Back to Gate"
      tw = self.g.font_at(16).size(label)[0]
      self.gate_rect = pygame.Rect(0, 0, max(self.map_rect.w, tw + 46), 38)
      self.gate_rect.topright = (self.map_rect.right, self.map_rect.bottom + 12)
      glow = int(40 * (1 + math.sin(self.t * 4)))
      pygame.draw.rect(s, (110 + glow // 2, 80, 230), self.gate_rect, border_radius=19)
      pygame.draw.rect(s, (170, 245, 255), self.gate_rect, 2, border_radius=19)
      gx0, gy0 = self.gate_rect.x + 18, self.gate_rect.centery
      pygame.draw.polygon(s, (170, 245, 255), [(gx0, gy0 - 10), (gx0 + 7, gy0), (gx0, gy0 + 10), (gx0 - 7, gy0)])
      self.text(s, label, (self.gate_rect.centerx + 10, self.gate_rect.centery), 16)
    self.come_rect = pygame.Rect(0, 0, 0, 0)
    if self.come_back_ready() and not self.panel_open and not self.g.overlay:
      label = f"Come back: {self.origin[0].label}"     # back where the journey began, same way
      size = 16
      while size > 11 and self.g.font_at(size).size(label)[0] > w // 2 - 40:
        size -= 1
      tw = self.g.font_at(size).size(label)[0]
      self.come_rect = pygame.Rect(0, 0, max(self.map_rect.w, tw + 46), 38)
      top = (self.gate_rect.bottom if self.gate_rect.h else self.map_rect.bottom) + 10
      self.come_rect.topright = (self.map_rect.right, top)
      pygame.draw.rect(s, (240, 140, 40), self.come_rect, border_radius=19)
      pygame.draw.rect(s, WHITE, self.come_rect, 2, border_radius=19)
      cx0, cy0 = self.come_rect.x + 17, self.come_rect.centery     # a turning-back arrow
      pygame.draw.arc(s, WHITE, (cx0 - 8, cy0 - 8, 16, 16), 0.3, math.pi, 3)
      pygame.draw.polygon(s, WHITE, [(cx0 - 12, cy0 - 1), (cx0 - 4, cy0 - 1), (cx0 - 8, cy0 + 6)])
      self.text(s, label, (self.come_rect.centerx + 10, self.come_rect.centery), size)
    self.draw_class_list(s)
    b = town.nearest_entrance(self.boxes, self.player.pos)
    self.pads["enter"].visible = b is not None
    for p in self.pads.values():
      if p.visible:
        self.draw_pad(s, p)
    if b is not None and not self.g.overlay and not self.panel_open and self.walk is None and not self.flying:
      label = f"Go into {b.label}!"
      tw = self.g.font_at(20).size(label)[0]
      r = pygame.Rect(0, 0, min(w - 20, tw + 44), 46)
      top_of_pads = min(p.rect.top for p in self.pads.values())
      r.midbottom = (w // 2, top_of_pads - 10)
      pulse = int(30 * (1 + math.sin(self.t * 6)))
      if symbols.ONLY:
        r = pygame.Rect(0, 0, 84, 50)
        r.midbottom = (w // 2, top_of_pads - 10)
      pygame.draw.rect(s, (170 + pulse // 2, 70, 170), r, border_radius=23)
      pygame.draw.rect(s, WHITE, r, 2, border_radius=23)
      if symbols.ONLY:
        symbols.draw(s, "go", r)
      else:
        self.text(s, label, r.center, 20)
    msg, ttl = self.toast
    if ttl > 0 and msg and not symbols.ONLY:
      size = 17
      while size > 11 and self.g.font_at(size).size(msg)[0] > w - 50:
        size -= 1
      tw = self.g.font_at(size).size(msg)[0]
      r = pygame.Rect(0, 0, tw + 30, 40)
      r.midtop = (w // 2, 110)
      box = pygame.Surface(r.size, pygame.SRCALPHA)
      pygame.draw.rect(box, (30, 50, 90, int(min(1.0, ttl) * 225)), box.get_rect(), border_radius=14)
      s.blit(box, r.topleft)
      self.text(s, msg, r.center, size)
    self.tips_rect = self.tips_button = pygame.Rect(0, 0, 0, 0)
    if self.show_tips and not self.g.overlay and not self.panel_open and not symbols.ONLY:
      cw = min(440, w - 30)
      lines = []
      for col, tip in TIPS:
        words, cur, first = tip.split(), "", True
        for word in words:
          trial = (cur + " " + word).strip()
          if self.g.font_at(15).size(trial)[0] > cw - 60 and cur:
            lines.append((col if first else None, cur))
            cur, first = word, False
          else:
            cur = trial
        lines.append((col if first else None, cur))
      r = pygame.Rect(14, 62, cw, 70 + 24 * len(lines) + 60)
      box = pygame.Surface(r.size, pygame.SRCALPHA)
      pygame.draw.rect(box, (30, 60, 110, 235), box.get_rect(), border_radius=16)
      pygame.draw.rect(box, (255, 204, 0, 255), box.get_rect(), 3, border_radius=16)
      s.blit(box, r.topleft)
      self.text(s, "Welcome to Wonder Town!", (r.x + 18, r.y + 16), 22, YELLOW, anchor="topleft")
      y = r.y + 56
      for col, line in lines:
        if col:
          pygame.draw.circle(s, col, (r.x + 24, y + 10), 6)
        self.text(s, line, (r.x + 40, y), 15, anchor="topleft")
        y += 24
      self.tips_rect = r
      self.tips_button = pygame.Rect(r.x + 18, r.bottom - 52, 150, 40)
      self.draw_button(s, self.tips_button, "Let's go!", (60, 170, 90))
    if self.picker is not None:
      self.draw_picker(s)
    if self.magic_open:
      self.draw_magic_box(s)
    if self.console is not None:
      self.draw_console(s)

  def draw_picker(self, s):
    b, cats = self.picker
    panel, cells, close = self.picker_layout()
    veil = pygame.Surface(self.size, pygame.SRCALPHA)
    veil.fill((10, 20, 40, 140))
    s.blit(veil, (0, 0))
    pygame.draw.rect(s, (255, 250, 240), panel, border_radius=18)
    pygame.draw.rect(s, b.colour, panel, 5, border_radius=18)
    self.text(s, b.label, (panel.centerx, panel.y + 26), 26, (40, 40, 70))
    self.text(s, "What shall we learn?", (panel.centerx, panel.y + 52), 15, (90, 90, 120))
    for r, cat in cells:
      pygame.draw.rect(s, _shade(b.colour, 1.1), r, border_radius=14)
      pygame.draw.rect(s, WHITE, r, 3, border_radius=14)
      if cat == ROAD_GAME:
        pic = self.g.thumb("Children Crossing", "Road Safety", r.h - 46)
      elif cat not in hub.CATEGORIES_HUB:
        pic = None
      elif cat == MATHS_GAME:
        pic = self.g.thumb("7", "123", r.h - 46)
      else:
        first = next(iter(hub.CATEGORIES_HUB[cat]))
        pic = self.g.thumb(first, cat, r.h - 46)
      if pic is not None:
        s.blit(pic, pic.get_rect(center=(r.centerx, r.y + (r.h - 30) // 2 + 4)))
      native = self.g.native_name(cat, 18)            # e.g. স্বরবর্ণ in Bangla mode
      if native is not None:
        s.blit(native, native.get_rect(center=(r.centerx, r.bottom - 16)))
      else:
        size = 17
        while size > 11 and self.g.font_at(size).size(cat)[0] > r.w - 8:
          size -= 1
        self.text(s, cat, (r.centerx, r.bottom - 16), size)
      if self.g.progress.has(f"c:{cat}"):
        self.g.draw_star(s, (r.right - 14, r.y + 14), 9)
    self.draw_button(s, close, "Back to town", (90, 110, 150))