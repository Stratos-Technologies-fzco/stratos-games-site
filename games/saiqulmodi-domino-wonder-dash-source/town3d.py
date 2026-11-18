"""Wonder Town: the 3D world children explore to reach every part of Domino Game.

Pure maths, no drawing (world.py paints it):
  * the town - an island in the sea shaped like Dubai's Palm Jumeirah, at its grand scale
    (10x wider than the first town: kilometre-long roads): the trunk (the main street,
    from the beach on the mainland), one curved frond out to each class's building, far
    apart over the water, and the outer crescent with the Games Arcade at its top; plus the
    Story House, Family House, Drawing Studio and Sticker Museum, a canal across the trunk
    with a bridge and swing posts, palm trees and lamp posts;
  * the Magic Box at the entrance gate (one crystal button per class), a Class Pavilion
    over the main street where each class's fronds begin (its Subject Magic Console opens
    inside), and a Back to Gate crystal in front of every pavilion;
  * a perspective camera with near-plane clipping (works the same in the browser);
  * the player: walking, jumping, landing on roofs, and the rope swing - a rope to a roof
    corner or post that swings you across with real pendulum physics;
  * a fly-there ride that carries a child straight to the building they tapped.

World axes: x = east, y = up, z = north, in metres. The main street runs north along x = 0.
(The same engine as Bridge Genius's Campus World, laid out as a children's town.)
"""

import math

GRAVITY = 26.0
WALK_SPEED = 12.0
TURN_SPEED = 2.4            # rad/s
JUMP_SPEED = 11.5
SUPER_JUMP_SPEED = 21.0     # magic boots
GLIDE_FALL = 3.0            # the cape caps the falling speed (m/s)
RADIUS = 0.6                # the player's body, for collisions
ROPE_MIN, ROPE_MAX = 6.0, 40.0
# 01-Nov-2026 (user: classes too far, reaching takes double): halved from 10x to 5x; the 10x layout is git tag backup-town-10x
FROND_SPREAD_MULTIPLIER = 5.0    # fronds reach 5x further out over the sea ...
HOUSE_DISTANCE_SPACING = 5.0     # ... and the fronds sit 5x further apart along the trunk
RIVER_Z = (512.0, 528.0)
BRIDGE_HALF = 6.0           # the street bridge over the river is |x| < 6
BOUNDS = (-1050.0, 1050.0, -120.0, 1925.0)  # x0, x1, z0, z1
START = (0.0, 0.0, -18.0)


class Box:
  """A solid block: a building, a post, a gate pillar. kind/payload say what entering does."""

  def __init__(self, key, x0, z0, x1, z1, h, colour, label="", sub="", kind=None,
               payload=None, roof=None, windows=True, y0=0.0, gable=False, icon=None):
    self.key = key
    self.x0, self.z0, self.x1, self.z1 = min(x0, x1), min(z0, z1), max(x0, x1), max(z0, z1)
    self.y0, self.h = y0, h
    self.colour = colour
    self.roof = roof or tuple(max(0, c - 50) for c in colour)
    self.label = label
    self.sub = sub
    self.kind = kind
    self.payload = payload
    self.windows = windows
    self.gable = gable
    self.icon = icon

  @property
  def centre(self):
    return ((self.x0 + self.x1) / 2, (self.y0 + self.h) / 2, (self.z0 + self.z1) / 2)

  @property
  def top(self):
    return self.h + (self.roof_height() if self.gable else 0.0)

  def roof_height(self):
    return min(5.0, (self.z1 - self.z0) * 0.35)

  def contains_xz(self, x, z, pad=0.0):
    return self.x0 - pad <= x <= self.x1 + pad and self.z0 - pad <= z <= self.z1 + pad

  def distance_xz(self, x, z):
    dx = max(self.x0 - x, 0.0, x - self.x1)
    dz = max(self.z0 - z, 0.0, z - self.z1)
    return math.hypot(dx, dz)

  def door(self):
    cx, _, cz = self.centre
    if self.x1 < -BRIDGE_HALF:
      return (self.x1 + 3.0, 0.0, cz)
    if self.x0 > BRIDGE_HALF:
      return (self.x0 - 3.0, 0.0, cz)
    return (cx, 0.0, self.z0 - 3.0)

  def anchors(self):
    y = self.h
    if (self.x1 - self.x0) < 5 and (self.z1 - self.z0) < 5:
      return [((self.x0 + self.x1) / 2, y, (self.z0 + self.z1) / 2)]
    return [(self.x0, y, self.z0), (self.x1, y, self.z0), (self.x0, y, self.z1), (self.x1, y, self.z1)]


# --- Palm Jumeirah Archipelago Layout ---
# side: -1 (West Fronds), 1 (East Fronds)
# x_reach: how far along the curved frond the pavilion is located
SUBJECT_HOUSES = [
    # --- Frond 1: CLASS 1 (Foundation Frond) ---
    ("english", -1, 38, 70.0, 22, 16, 13, (250, 196, 70), "Class 1: ABC School", "Class 1 - English & Phonics", "English", ("ABC", "A")),
    ("hindi",    1, 38, 70.0, 22, 16, 13, (246, 140, 72), "Class 1: Hindi Pathshala", "Class 1 - Swar & Vyanjan", "Hindi", None),

    # --- Frond 2: CLASS 2 (Numbers & EVS) ---
    ("maths",   -1, 78, 84.0, 22, 16, 15, (90, 150, 240), "Class 2: Number House", "Class 2 - Count, Add & Shapes", "Maths", None),
    ("home",     1, 78, 84.0, 22, 16, 12, (240, 170, 150), "Class 2: My Home & EVS", "Class 2 - Body, Family & Helpers", "Me & Home", None),
    ("rhymes",   1, 120, 78.0, 20, 14, 12, (255, 150, 60), "Class 2: Rhyme Stage", "Class 2 - Action Poems", "Rhymes", ("Classic Rhymes", "Twinkle Twinkle")),

    # --- Frond 3: CLASS 3 (Science & Social Studies) ---
    ("science", -1, 145, 92.0, 24, 16, 14, (110, 200, 230), "Class 3: Science Lab", "Class 3 - Living World & Matter", "Science", ("Lab Tools", "Microscope")),
    ("social",   1, 145, 92.0, 24, 16, 14, (200, 150, 100), "Class 3: Heritage Hall", "Class 3 - History, Land & Maps", "Social", ("Long Ago", "Clay Pot")),

    # --- Frond 4: CLASS 4 (Nature & Food Exploration) ---
    ("nature",  -1, 185, 92.0, 26, 18, 12, (90, 190, 110), "Class 4: Zoo & Nature", "Class 4 - Habitats, Birds & Plants", "Nature", ("Animals", "Tiger")),
    ("food",     1, 185, 92.0, 24, 18, 12, (236, 90, 90), "Class 4: Food Souq", "Class 4 - Crops, Diet & Health", "Food", ("Fruits", "Apple")),

    # --- Frond 5: CLASS 5 (World Travel & Languages) ---
    ("travel",  -1, 225, 84.0, 24, 18, 14, (160, 110, 220), "Class 5: Station Hub", "Class 5 - Transport, Engines & Trade", "Travel", None),
    ("bangla",   1, 225, 84.0, 22, 16, 12, (60, 170, 120), "Class 5: Bangla Pathshala", "Class 5 - Language & Grammar", "Bangla", None),

    # --- Frond 6: CLASS 6 (Safety & Global Sciences) ---
    ("safety",  -1, 265, 70.0, 22, 16, 12, (240, 70, 70), "Class 6: Safety Park", "Class 6 - Civics, Signs & Rules", "Safety", ("Road Safety", "Traffic Light")),
    ("world",    1, 265, 70.0, 20, 20, 28, (60, 190, 200), "Class 6: Globe Tower", "Class 6 - Geography & World Nations", "World", None),

    # --- Outer Crescent: CLASS 7 (Master Subject Arenas) ---
    ("india",   -1, 305, 52.0, 26, 20, 16, (255, 153, 51), "Class 7: India Pavilion", "Class 7 - States, Constitution & Heritage", "India", None),
    ("fun",      1, 305, 52.0, 24, 18, 15, (220, 90, 190), "Class 7: Carnival Park", "Class 7 - Logic, Puzzles & Sports", "Fun", None),
]
SUBJECT_HOUSES = [(key, side, z * HOUSE_DISTANCE_SPACING, reach * FROND_SPREAD_MULTIPLIER, *rest)
                  for key, side, z, reach, *rest in SUBJECT_HOUSES]

# The seven classes: the Magic Box's crystal buttons and the Class Pavilions
CLASSES = [
    (1, "Sunny Amber", (255, 191, 0), ("english", "hindi")),
    (2, "Emerald Jade", (0, 168, 107), ("maths", "home", "rhymes")),
    (3, "Sky Cyan", (40, 200, 240), ("science", "social")),
    (4, "Royal Indigo", (75, 70, 200), ("nature", "food")),
    (5, "Amethyst Violet", (153, 102, 204), ("travel", "bangla")),
    (6, "Coral Orange", (255, 127, 80), ("safety", "world")),
    (7, "Ruby Rose", (224, 17, 95), ("india", "fun")),
]
CLASS_COLOURS = {n: col for n, _name, col, _keys in CLASSES}
CLASS_OF = {key: n for n, _name, _col, keys in CLASSES for key in keys}
# Wonder Melas & Living Sanctuaries along the outer crescent: (key, label, sub, colour,
# angle on the crescent in degrees, [categories]) - each opens its picture categories
ZONES = [
    ("zoo", "Safari Zoo", "All the animals", (230, 150, 60), 8, ["Animals", "Reptiles", "Animal Homes"]),
    ("birdpark", "Bird Sanctuary", "Birds of every kind", (90, 190, 120), 26, ["Birds", "Flying High"]),
    ("aquarium", "Coral Aquarium", "Fish and sea life", (40, 150, 220), 44, ["Sea"]),
    ("garden", "Flower Garden", "Flowers and butterflies", (240, 110, 170), 62, ["Plants", "Flower Garden", "Insects"]),
    ("mela", "Wonder Mela", "Rides, puppets and magic", (250, 190, 40), 118, ["Wonder Mela"]),
    ("bookfair", "Book Fair", "Kitab Mela", (150, 100, 200), 136, ["Book Fair"]),
    ("autoexpo", "Auto Expo", "Vehicle Mela", (220, 70, 70), 154, ["Auto Expo", "Vehicles", "Travel"]),
    ("boatmela", "Boat Mela", "Boats and ships", (30, 170, 170), 172, ["Boat Mela"]),
]
PAVILION_HALF = (12.5, 8.0)  # the pavilion's canopy spans the street: |x| < 12.5, 16 m deep
PAVILION_UP = 10.0           # ... on four pillars, this high

EXTRA_HOUSES = [
    # Trunk Entry Houses
    ("story",  -1, 12, 20.0, 14, 12, 9, (255, 150, 190), "Story House", "Story of the day", "story"),
    ("family",  1, 12, 20.0, 14, 12, 9, (150, 200, 120), "Family House", "Players", "players"),
    # Studios on the trunk, between the Class 4 and Class 5 fronds
    ("studio", -1, 205, 20.0, 16, 12, 10, (120, 200, 255), "Drawing Studio", "Draw my own", "draw"),
    ("museum",  1, 205, 20.0, 16, 12, 10, (255, 215, 80), "Sticker Museum", "Your stickers", "stickers"),
]
EXTRA_HOUSES = [(key, side, z * HOUSE_DISTANCE_SPACING, *rest) for key, side, z, *rest in EXTRA_HOUSES]


# --- the Palm island: land shapes (everything else is sea) ---------------------------
TRUNK_HALF = 14.0           # the trunk is |x| < 14 m
MAINLAND_Z = -22.0          # south of this: the beach and the mainland
FROND_HALF = 7.0            # half width of a frond
FROND_SLOPE = 0.42          # fronds fan out north-east / north-west like the real Palm's
PAD = 6.0                   # land around every building
CRESCENT_C = (0.0, 875.0)   # the outer crescent (breakwater ring) ...
CRESCENT_R = 975.0          # ... its radius
CRESCENT_HALF = 30.0        # ... half its width
CRESCENT_ARC = (math.radians(-35), math.radians(215))   # open towards the beach (south)
TRUNK_END = CRESCENT_C[1] + CRESCENT_R - CRESCENT_HALF  # the trunk reaches the crescent


def _bezier(p0, p1, p2, n=24):
  return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
           (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
          for t in (k / (n - 1) for k in range(n))]


def frond_path(side, z, reach_x):
  """A frond leaves the trunk sideways and bends north to the building's door."""
  tip = (side * (reach_x - 3.0), z + FROND_SLOPE * reach_x)
  return _bezier((side * (TRUNK_HALF - 2.0), z), (side * reach_x * 0.45, z + FROND_SLOPE * reach_x * 0.25), tip)


FRONDS = {}                 # house key -> the frond's centre line [(x, z), ...]
for _key, _side, _z, _reach, *_rest in SUBJECT_HOUSES:
  FRONDS[_key] = frond_path(_side, _z, _reach)
PADS = []                   # land rectangles round buildings and their short paths


def _seg_dist(px, pz, a, b):
  ax, az = a
  dx, dz = b[0] - ax, b[1] - az
  L = dx * dx + dz * dz
  t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
  return math.hypot(px - (ax + t * dx), pz - (az + t * dz))


def on_land(x, z):
  """True on the island (trunk, fronds, building pads, crescent) or the mainland."""
  if z < MAINLAND_Z:
    return True
  if abs(x) <= TRUNK_HALF and z <= TRUNK_END:
    return not in_river(x, z)                 # the canal crosses the trunk
  for x0, z0, x1, z1 in PADS:
    if x0 <= x <= x1 and z0 <= z <= z1:
      return True
  for path in FRONDS.values():
    if (min(p[0] for p in path) - FROND_HALF <= x <= max(p[0] for p in path) + FROND_HALF
        and any(_seg_dist(x, z, path[i], path[i + 1]) <= FROND_HALF for i in range(len(path) - 1))):
      return True
  cx, cz = CRESCENT_C
  r = math.hypot(x - cx, z - cz)
  if abs(r - CRESCENT_R) <= CRESCENT_HALF:
    a = math.atan2(z - cz, x - cx)
    lo, hi = CRESCENT_ARC
    a = a if a >= lo else a + 2 * math.pi
    return lo <= a <= hi
  return False


def in_water(x, z):
  return not on_land(x, z)


_GRID = {}
GRID_STEP = 4.0


def land_at(x, z):
  """A quick, coarse on_land() for drawing (a 4 m grid, filled in as it is asked)."""
  key = (int(x // GRID_STEP), int(z // GRID_STEP))
  hit = _GRID.get(key)
  if hit is None:
    hit = _GRID[key] = on_land((key[0] + 0.5) * GRID_STEP, (key[1] + 0.5) * GRID_STEP)
  return hit


def strip(path, half):
  """A band of the given half width along a centre line, as one polygon."""
  left, right = [], []
  for i, (x, z) in enumerate(path):
    a = path[max(0, i - 1)]
    b = path[min(len(path) - 1, i + 1)]
    dx, dz = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dz) or 1.0
    nx, nz = -dz / L * half, dx / L * half
    left.append((x + nx, z + nz))
    right.append((x - nx, z - nz))
  return left + right[::-1]


def crescent_pieces(n=24, half=CRESCENT_HALF):
  """The crescent in n pieces (smaller polygons clip and cull better)."""
  lo, hi = CRESCENT_ARC
  out = []
  for k in range(n):
    a0 = lo + (hi - lo) * k / n
    a1 = lo + (hi - lo) * (k + 1) / n
    arc = [a0 + (a1 - a0) * j / 6 for j in range(7)]
    cx, cz = CRESCENT_C
    outer = [(cx + (CRESCENT_R + half) * math.cos(a), cz + (CRESCENT_R + half) * math.sin(a)) for a in arc]
    inner = [(cx + (CRESCENT_R - half) * math.cos(a), cz + (CRESCENT_R - half) * math.sin(a)) for a in arc]
    out.append(outer + inner[::-1])
  return out


def build_world():
  boxes = []
  PADS.clear()
  for key, side, z, reach_x, w, d, h, col, label, sub, subject, icon in SUBJECT_HOUSES:
    x0 = side * reach_x
    tz = z + FROND_SLOPE * reach_x            # at the tip of its frond, out over the sea
    boxes.append(Box(key, x0, tz - d / 2, x0 + side * w, tz + d / 2, h, col, label, sub,
                     kind="subject", payload=subject, gable=h <= 13, icon=icon))
  for key, side, z, reach_x, w, d, h, col, label, sub, kind in EXTRA_HOUSES:
    x0 = side * reach_x
    boxes.append(Box(key, x0, z - d / 2, x0 + side * w, z + d / 2, h, col, label, sub,
                     kind=kind, gable=True))
  # Grand Arcade at the apex of the Crescent
  top = CRESCENT_C[1] + CRESCENT_R
  boxes.append(Box("arcade", -14, top - 8.5, 14, top + 8.5, 24, (255, 120, 60), "Games Arcade",
                   "Find it, Spell it, more", kind="games", roof=(250, 220, 60)))
  # The Magic Box on its pedestal, just inside the entrance gate
  boxes.append(Box("gateway", -13, -16, -9, -12, 4.0, (150, 90, 255), "Magic Box", "Pick your class",
                   kind="gateway", windows=False, roof=(255, 215, 90)))
  hx, hz = PAVILION_HALF
  for n, name, col, _keys in CLASSES:          # a pavilion where the class's fronds begin
    z = pavilion_z(n)
    boxes.append(Box(f"class{n}", -hx, z - hz, hx, z + hz, PAVILION_UP + 3.0, col,
                     f"Class {n} Pavilion", name, kind="class", payload=n, windows=False,
                     y0=PAVILION_UP, roof=tuple(min(255, c + 60) for c in col), icon=("123", str(n))))
    for x0 in (-hx, hx - 2.0):
      for z0 in (z - hz, z + hz - 2.0):
        boxes.append(Box(f"pillar{n}{x0}{z0}", x0, z0, x0 + 2.0, z0 + 2.0, PAVILION_UP,
                         (250, 246, 236), windows=False, roof=col))
    boxes.append(Box(f"return{n}", 9.8, z - hz - 8, 11.8, z - hz - 6, 3.4, (120, 230, 255),
                     "Back to Gate", "Fly to the Magic Box", kind="return", windows=False,
                     roof=(255, 255, 255)))
  a = math.radians(100)                          # My Creations, beside the Games Arcade
  x = CRESCENT_C[0] + CRESCENT_R * math.cos(a)
  z = CRESCENT_C[1] + CRESCENT_R * math.sin(a)
  boxes.append(Box("creations", x - 14, z - 11, x + 14, z + 11, 18, (255, 196, 60), "My Creations",
                   "Everything you brought to life", kind="creations", gable=True,
                   roof=(240, 90, 120)))
  for key, label, sub, col, deg, cats in ZONES:   # the Wonder Melas along the crescent
    a = math.radians(deg)
    x = CRESCENT_C[0] + CRESCENT_R * math.cos(a)
    z = CRESCENT_C[1] + CRESCENT_R * math.sin(a)
    boxes.append(Box(key, x - 13, z - 10, x + 13, z + 10, 14, col, label, sub, kind="zone",
                     payload=cats, gable=True))
  for b in boxes:                           # land under every building and its front path
    if b.kind is not None:
      PADS.append((b.x0 - PAD, b.z0 - PAD, b.x1 + PAD, b.z1 + PAD))
      if b.kind not in ("subject", "zone", "creations") and b.key != "arcade":
        dx, _, dz = b.door()
        PADS.append((min(dx, 0.0) - 5, dz - 5, max(dx, 0.0) + 5, dz + 5))

  mid = (RIVER_Z[0] + RIVER_Z[1]) / 2
  for x in (-45, -24, 24, 45):
    boxes.append(Box(f"post{x}", x - 1.1, mid - 1.1, x + 1.1, mid + 1.1, 18, (250, 200, 80),
                     windows=False, roof=(240, 110, 60)))
  boxes.append(Box("gate_w", -8.5, -6, -6.5, -4, 10, (230, 90, 120), windows=False))
  boxes.append(Box("gate_e", 6.5, -6, 8.5, -4, 10, (230, 90, 120), windows=False))
  boxes.append(Box("gate_top", -8.5, -6, 8.5, -4, 12.5, (90, 170, 240), windows=False, y0=10))
  for side in (-1, 1):
    boxes.append(Box(f"rail{side}", side * 5.6, RIVER_Z[0] - 2, side * 6.2, RIVER_Z[1] + 2, 1.1,
                     (255, 255, 255), windows=False))
  return boxes


def pavilion_z(n):
  """Where class n's pavilion stands on the trunk: at its first frond."""
  keys = dict((c[0], c[3]) for c in CLASSES)[n]
  return min(z for key, _side, z, *_rest in SUBJECT_HOUSES if key in keys)


def trees_and_lamps(boxes=()):
  """Lamps along the trunk; palm trees along its edges, on the frond tips and on the
  beach - only on land, never inside a building or on a frond's path."""
  trees, lamps = [], []
  for z in range(-30, int(TRUNK_END) - 10, 16):
    if RIVER_Z[0] - 6 < z < RIVER_Z[1] + 6:
      continue
    lamps.append((-7.5, z))
    lamps.append((7.5, z + 8))
  spots = []
  for z in range(-6, int(TRUNK_END) - 20, 22):
    spots += [(-11.5, z + 5), (11.5, z + 16)]
  for path in FRONDS.values():               # one palm beside the end of each frond
    (ax, az), (bx, bz) = path[-4], path[-1]
    spots.append((ax, az + (FROND_HALF - 1.5)))
  for i in range(26):                          # the mainland beach
    spots.append((((i * 73) % 360) - 180 + 0.5, -27 - (i * 37) % 16))
  lo, hi = CRESCENT_ARC
  for k in range(120):                         # palms along the crescent
    a = lo + (hi - lo) * (k + 0.5) / 120
    spots.append((CRESCENT_C[0] + CRESCENT_R * math.cos(a), CRESCENT_C[1] + CRESCENT_R * math.sin(a)))
  for i, (x, z) in enumerate(spots):
    if not on_land(x, z) or any(b.contains_xz(x, z, 2.5) for b in boxes):
      continue
    if any(b.kind is not None and math.dist((x, z), (b.door()[0], b.door()[2])) < 6 for b in boxes):
      continue
    trees.append((x, z, 5.0 + (i % 4) * 1.5))
  trees.sort(key=lambda t: t[1])               # by z: drawing looks up only the nearby ones
  lamps.sort(key=lambda lp: lp[1])
  return trees, lamps


def in_river(x, z):
  return RIVER_Z[0] < z < RIVER_Z[1] and abs(x) > BRIDGE_HALF


# --------------------------------------------------------------------------------------
# Camera
# --------------------------------------------------------------------------------------
class Camera:
  """A chase camera behind the player with panoramic elevation."""

  FOV = math.radians(68)
  NEAR = 0.6

  def __init__(self, width, height):
    self.fov = self.FOV
    self.pitch = -0.32
    self.dist = 28.0
    self.height_offset = 12.0
    self.yaw = 0.0
    self.pos = (0.0, 12.0, -28.0)
    self.resize(width, height)

  def resize(self, width, height):
    self.w, self.h = width, height
    self.cx, self.cy = width / 2, height * 0.46
    self.focal = (min(width * 0.85, height) / 2) / math.tan(self.fov / 2)
    self._axes()

  def set_fov(self, fov):
    """A wider view (radians) for the warp-speed feel of the Domino Highway."""
    if abs(fov - self.fov) > 1e-4:
      self.fov = fov
      self.focal = (min(self.w * 0.85, self.h) / 2) / math.tan(fov / 2)

  def _axes(self):
    cp, sp = math.cos(self.pitch), math.sin(self.pitch)
    sy, cy = math.sin(self.yaw), math.cos(self.yaw)
    self.f = (sy * cp, sp, cy * cp)
    self.r = (cy, 0.0, -sy)
    self.u = (-sy * sp, cp, -cy * sp)

  def follow(self, target, yaw, dt=None):
    if dt is None:
      self.yaw = yaw
    else:
      d = (yaw - self.yaw + math.pi) % (2 * math.pi) - math.pi
      self.yaw += d * (1.0 - math.exp(-5.0 * dt))   # frame-rate independent: no judder on uneven web frames
    self._axes()
    tx, ty, tz = target[0], target[1] + 1.5, target[2]
    want = (
        tx - self.f[0] * self.dist,
        max(3.5, ty + self.height_offset - self.f[1] * self.dist * 0.5),
        tz - self.f[2] * self.dist,
    )
    if dt is None:
      self.pos = want
    else:
      k = 1.0 - math.exp(-8.0 * dt)                  # frame-rate independent smoothing (was min(1, 8 dt))
      self.pos = tuple(self.pos[i] + (want[i] - self.pos[i]) * k for i in range(3))

  def to_cam(self, p):
    d = (p[0] - self.pos[0], p[1] - self.pos[1], p[2] - self.pos[2])
    return (d[0] * self.r[0] + d[2] * self.r[2],
            d[0] * self.u[0] + d[1] * self.u[1] + d[2] * self.u[2],
            d[0] * self.f[0] + d[1] * self.f[1] + d[2] * self.f[2])

  def screen(self, c):
    return (self.cx + self.focal * c[0] / c[2], self.cy - self.focal * c[1] / c[2])

  def project(self, p):
    c = self.to_cam(p)
    if c[2] < self.NEAR:
      return None
    x, y = self.screen(c)
    return (x, y, c[2])

  def project_poly(self, pts):
    cam = [self.to_cam(p) for p in pts]
    if all(c[2] >= self.NEAR for c in cam):
      clipped = cam
    else:
      clipped = []
      n = len(cam)
      for i in range(n):
        a, b = cam[i], cam[(i + 1) % n]
        ain, bin_ = a[2] >= self.NEAR, b[2] >= self.NEAR
        if ain:
          clipped.append(a)
        if ain != bin_:
          t = (self.NEAR - a[2]) / (b[2] - a[2])
          clipped.append(tuple(a[k] + (b[k] - a[k]) * t for k in range(3)))
      if len(clipped) < 3:
        return None
    depth = sum(c[2] for c in clipped) / len(clipped)
    return [self.screen(c) for c in clipped], depth

  def horizon_y(self):
    return self.cy + self.focal * math.tan(self.pitch)


# --------------------------------------------------------------------------------------
# Player
# --------------------------------------------------------------------------------------
class Player:

  def __init__(self, pos=START, yaw=0.0):
    self.pos = list(pos)
    self.vel = [0.0, 0.0, 0.0]
    self.yaw = yaw
    self.grounded = True
    self.rope = None
    self.zip = None
    self.splash = 0.0
    self.gliding = False
    self.walk_phase = 0.0
    self.safe = (self.pos[0], self.pos[2])   # the last spot on dry land

  @property
  def heading(self):
    return (math.sin(self.yaw), 0.0, math.cos(self.yaw))

  def best_anchor(self, boxes):
    hx, _, hz = self.heading
    px, py, pz = self.pos
    best, best_score = None, -1e9
    for b in boxes:
      for a in b.anchors():
        dx, dy, dz = a[0] - px, a[1] - py, a[2] - pz
        if dy < 3.0:
          continue
        dist = math.sqrt(dx * dx + dy * dy + dz * dz)
        if not ROPE_MIN <= dist <= ROPE_MAX:
          continue
        flat = math.hypot(dx, dz) or 1.0
        ahead = (dx * hx + dz * hz) / flat
        if ahead < 0.25:
          continue
        score = ahead * 30 - abs(dist - 20) + min(dy, 20) * 0.4
        if score > best_score:
          best, best_score = a, score
    return best

  def attach(self, boxes):
    a = self.best_anchor(boxes)
    if a is None:
      return False
    d = math.dist(a, self.pos)
    self.rope = [a, max(ROPE_MIN, d * 0.96), a[1] - 2.5]
    self.grounded = False
    if self.vel[1] < 0:
      self.vel[1] *= 0.5
    return True

  def release(self):
    if self.rope is None:
      return
    self.rope = None
    self.vel[0] *= 1.12
    self.vel[2] *= 1.12
    self.vel[1] = max(self.vel[1], 0.0) + 5.0

  def zip_to(self, point, duration=None):
    start = tuple(self.pos)
    d = math.dist(start, point)
    self.rope = None
    self.zip = [start, tuple(point), 0.0, duration or max(0.8, min(2.4, d / 40.0))]
    dx, dz = point[0] - start[0], point[2] - start[2]
    if abs(dx) + abs(dz) > 0.1:
      self.yaw = math.atan2(dx, dz)

  def jump(self):
    if self.grounded:
      self.vel[1] = JUMP_SPEED
      self.grounded = False
      return True
    return False

  def super_jump(self):
    if self.grounded or self.rope is not None:
      self.rope = None
      self.vel[1] = SUPER_JUMP_SPEED
      hx, _, hz = self.heading
      self.vel[0] += hx * 4.0
      self.vel[2] += hz * 4.0
      self.grounded = False
      return True
    return False

  def web_pull_target(self, boxes):
    a = self.best_anchor(boxes)
    if a is None:
      return None
    for b in boxes:
      for a_cand in b.anchors():
        if a == a_cand:
          cx, _, cz = b.centre
          x = a[0] + max(-1.2, min(1.2, cx - a[0]))
          z = a[2] + max(-1.2, min(1.2, cz - a[2]))
          return (a, (x, b.h, z))
    return None

  def web_pull(self, boxes):
    hit = self.web_pull_target(boxes)
    if hit is None:
      return None
    anchor, landing = hit
    self.zip_to(landing, duration=max(0.5, min(1.4, math.dist(self.pos, landing) / 30.0)))
    self.zip.append(anchor)
    return anchor

  def glide(self, on):
    self.gliding = bool(on) and not self.grounded and self.rope is None and self.zip is None

  def update(self, dt, boxes, forward=0.0, turn=0.0):
    self.splash = max(0.0, self.splash - dt)
    if self.zip is not None:
      start, end, t, dur = self.zip[:4]
      t = min(1.0, t + dt / dur)
      self.zip[2] = t
      k = t * t * (3 - 2 * t)
      arc = 0.0 if len(self.zip) > 4 else 9.0 * 4 * t * (1 - t)
      self.pos = [start[i] + (end[i] - start[i]) * k for i in range(3)]
      self.pos[1] += arc
      if t >= 1.0:
        self.zip = None
        self.vel = [0.0, 0.0, 0.0]
        self.grounded = True
        return "arrived"
      return None
    self.yaw = (self.yaw + turn * TURN_SPEED * dt + math.pi) % (2 * math.pi) - math.pi
    hx, _, hz = self.heading
    event = None
    steps = max(1, int(dt / (1 / 120)) + 1)
    h = dt / steps
    for _ in range(steps):
      if self.rope is not None:
        self.vel[0] += hx * forward * 9.0 * h
        self.vel[2] += hz * forward * 9.0 * h
        self.rope[1] = max(ROPE_MIN, self.rope[1] - 2.5 * h * max(forward, 0))
        if self.rope[1] > self.rope[2]:
          self.rope[1] = max(self.rope[2], self.rope[1] - 22.0 * h)
      elif self.grounded:
        want = (hx * forward * WALK_SPEED, hz * forward * WALK_SPEED)
        k = min(1.0, h * 12.0)
        self.vel[0] += (want[0] - self.vel[0]) * k
        self.vel[2] += (want[1] - self.vel[2]) * k
      else:
        self.vel[0] += hx * forward * 6.0 * h
        self.vel[2] += hz * forward * 6.0 * h
      self.vel[1] -= GRAVITY * h
      if self.gliding:
        if self.vel[1] < -GLIDE_FALL:
          self.vel[1] = -GLIDE_FALL
        self.vel[0] += hx * 5.0 * h
        self.vel[2] += hz * 5.0 * h
      old_y = self.pos[1]
      for i in range(3):
        self.pos[i] += self.vel[i] * h
      if self.rope is not None:
        a, L = self.rope[0], self.rope[1]
        d = [self.pos[i] - a[i] for i in range(3)]
        n = math.sqrt(sum(c * c for c in d)) or 1.0
        if n > L:
          u = [c / n for c in d]
          self.pos = [a[i] + u[i] * L for i in range(3)]
          radial = sum(self.vel[i] * u[i] for i in range(3))
          if radial > 0:
            self.vel = [self.vel[i] - radial * u[i] for i in range(3)]
      event = self._collide(boxes, old_y) or event
    speed = math.hypot(self.vel[0], self.vel[2])
    self.walk_phase += speed * dt * 0.9
    return event

  def _collide(self, boxes, old_y):
    event = None
    floor = 0.0
    px, pz = self.pos[0], self.pos[2]
    for b in boxes:
      if not b.contains_xz(px, pz, RADIUS):
        continue
      if b.y0 > 0.5 and self.pos[1] + 1.7 < b.y0:
        continue
      if old_y >= b.h - 0.05 and self.pos[1] <= b.h + 0.01:
        floor = max(floor, b.h)
        continue
      if self.pos[1] >= b.h:
        continue
      pushes = [(px - (b.x0 - RADIUS), 0, -1), ((b.x1 + RADIUS) - px, 0, 1),
                (pz - (b.z0 - RADIUS), 2, -1), ((b.z1 + RADIUS) - pz, 2, 1)]
      depth, axis, sign = min(pushes)
      self.pos[axis] += sign * depth
      if self.vel[axis] * sign < 0:
        self.vel[axis] = 0.0
      px, pz = self.pos[0], self.pos[2]
    if self.pos[1] <= floor:
      if not self.grounded and self.vel[1] < -4:
        event = "landed"
      self.pos[1] = floor
      if self.vel[1] < 0:
        self.vel[1] = 0.0
      self.gliding = False
      self.grounded = self.rope is None
    else:
      self.grounded = False
    x0, x1, z0, z1 = BOUNDS
    self.pos[0] = max(x0, min(x1, self.pos[0]))
    self.pos[2] = max(z0, min(z1, self.pos[2]))
    if self.grounded and self.pos[1] < 0.5 and floor == 0.0:
      if in_water(self.pos[0], self.pos[2]):     # into the sea: back to the last dry spot
        self.pos = [self.safe[0], 0.0, self.safe[1]]
        self.vel = [0.0, 0.0, 0.0]
        self.rope = None
        self.splash = 2.5
        event = "splash"
      else:
        self.safe = (self.pos[0], self.pos[2])
    return event


def nearest_entrance(boxes, pos, reach=4.5):
  best, best_d = None, reach
  for b in boxes:
    if b.kind is None:
      continue
    on_roof = b.contains_xz(pos[0], pos[2], 0.5) and abs(pos[1] - b.h) < 0.6
    d = 0.0 if on_roof else b.distance_xz(pos[0], pos[2])
    if pos[1] > 1.0 and not on_roof:
      continue
    if d < best_d:
      best, best_d = b, d
  return best
