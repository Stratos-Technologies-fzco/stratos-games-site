import array
import asyncio
from collections import OrderedDict, deque
import functools
import math
import os
import random
import sys
import pygame


# ---- Stratos analytics (rule: C:\Users\saiqu\GAME_ANALYTICS_RULE.md) ----
# level_start starts the clock; level_complete / game_over also carry `seconds`
# = how long that game lasted. Only the stratos.games play page has window.Stratos;
# anywhere else (desktop, APK, GitHub Pages) nothing is sent and nothing can break.
_track_started = 0.0


def track(name, **details):
    global _track_started
    try:
        import time as _time
        if name == "level_start":
            _track_started = _time.time()
        elif name in ("level_complete", "game_over") and _track_started and "seconds" not in details:
            details["seconds"] = int(round(_time.time() - _track_started))
        if sys.platform != "emscripten":
            return
        import json, platform
        w = platform.window
        s = w.Stratos
        if not s:
            try:
                s = w.parent.Stratos
            except Exception:
                s = None
        if s:
            s.track(name, w.JSON.parse(json.dumps(details)))
    except Exception:
        pass


ON_PHONE = hasattr(sys, "getandroidapilevel") or "ANDROID_ARGUMENT" in os.environ
# fingers stay fingers (the touch controls read them); taps outside the controls are turned into clicks by the game
os.environ.setdefault("SDL_TOUCH_MOUSE_EVENTS", "0")
os.environ.setdefault("SDL_MOUSE_TOUCH_EVENTS", "0")
pygame.init()
try:
    pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)
except pygame.error:
    pass  # no audio device: the game runs silent
pygame.joystick.init()

# ==============================================================================
# STRATOSPHERIC SCALE
# ==============================================================================
SCREEN_W, SCREEN_H = 1024, 600
WORLD_W, WORLD_H = 14000, 5000
CRUISE_ALT_FT = 35000.0

BASE_SPEED = 0.35          # px/frame at level 1 (10x slower than arcade speed)
SPEED_PER_LEVEL = 0.01     # level 100 = 1.35 px/frame
MAX_LEVEL = 100
CAMERA_LAG = 0.015         # camera floats after the jet instead of snapping

LEVEL_BAR_TOP = SCREEN_H - 64   # bottom bar, below the ground: P1 keys, P2 keys, level / players / jet row
PREV_RECT = pygame.Rect(16, LEVEL_BAR_TOP + 39, 110, 22)
NEXT_RECT = pygame.Rect(236, LEVEL_BAR_TOP + 39, 110, 22)
PLAYERS_RECT = pygame.Rect(372, LEVEL_BAR_TOP + 39, 180, 22)
NIGHT_RECT = pygame.Rect(566, LEVEL_BAR_TOP + 39, 160, 22)
NIGHT_SHADE = (66, 82, 100)  # night: the ground darkened to moonlight, then every light added on top
TAB_RECT = pygame.Rect(SCREEN_W - 236, LEVEL_BAR_TOP + 39, 220, 22)
CONTROL_HINTS = [  # player 1, the jet: (keyboard, controller, action)
    ("WASD", "STICK", "FLY"), ("Q/E", "R2/L2", "CLIMB/DIVE"), ("SPACE", "CROSS", "BOMB"),
    ("R", "CIRCLE", "AGM"), ("F", "SQUARE", "AAM"), ("C", "TRIANGLE", "FLARES/ECM"),
    ("V", "L3", "AEROBATICS"), ("M", "R3", "SAM"), ("TAB", "L1/R1", "JET"), ("N/P", "OPTIONS/CREATE", "LEVEL"),
    ("T", "TOUCHPAD", "DAY/NIGHT"),
]
P2_HINTS = [  # player 2, the launchers (keyboard arrows, or a second controller)
    ("LEFT/RIGHT", "D-PAD", "PICK LAUNCHER"), ("UP", "CROSS", "FIRE GUIDED"), ("DOWN", "CIRCLE", "FIRE UNGUIDED"),
    ("2", "-", "1 / 2 PLAYERS"),
]
P2_PICK_RANGE = 1400      # player 2 picks among launchers this close to the jet
P2_FIRE_GAP = 60            # frames between two launches by player 2

CITY_COUNT = 12
SAM_SITE_COUNT = 50
SAM_MISSILES_PER_SITE = 20  # 50 x 20 = 1,000 reserve missiles
SAM_SPACING = 420           # minimum gap between two batteries (no shoulder-to-shoulder sites)
SAM_SITE_HP = 2             # hits (bomb or air-to-ground missile) to destroy a battery
SAM_RANGE = 650             # a battery engages jets inside this ring by itself
SAM_SITE_RELOAD = 900       # 15 s between two launches of one battery on its own
AUTO_SAM_CAP = 4            # at most 4 self-launched SAMs airborne at once

TEL_COUNT = 150             # mobile launchers spread over the whole ground
TEL_MISSILES = 4
TEL_RANGE = 520
TEL_SPACING = 180
TEL_CAMOUFLAGED_SHARE = 0.7 # 70% are hidden until they fire
TEL_REVEAL_FRAMES = 1200    # after a launch a hidden TEL stays visible for 20 s, then hides again

JET_HP = 300
SAM_DAMAGE = JET_HP         # one SAM hit = the jet is shot down and crashes
CRASH_SPIN = 0.09           # rad/frame while the wreck falls
SAM_FUSE = 22               # proximity fuse, px
SAM_SPEED_VS_JET = 2.2      # horizontal speed of a SAM vs the current level speed
SAM_CLIMB_FRAMES = 420      # 7 s from the launch tube to 35,000 ft
SAM_LIFE_FRAMES = 2400      # 40 s of motor, then it self-destructs
SAM_GUIDED_SHARE = 0.5      # launched missiles are guided or unguided projectiles, at random
UNGUIDED_MOTOR_FRAMES = 300 # unguided: 5 s of motor after the climb, then it falls
ROCKET_WARN_RANGE = 400     # warn about an unguided round this close on a crossing course
JET_REJOIN_FRAMES = 180     # a downed jet's replacement rejoins after 3 s
BOMB_BLAST_RADIUS = 45

JET_MISSILE_RELOAD = 45     # frames between two missiles from the piloted jet
AGM_RANGE = 1600            # air-to-ground missile (R) picks the nearest battery inside this
AAM_RANGE = 1200            # air-to-air missile (F) picks the nearest drone inside this
WINGMAN_AAM_RANGE = 450     # wingmen shoot drones that come this close
WINGMAN_AAM_RELOAD = 600

DRONE_COUNT = 12
DRONE_SPEED_VS_JET = 0.5    # drones are slow: half the jets' speed
DRONE_SPOT_RANGE = 380      # a drone that sees a jet cues the nearest battery
DRONE_SPOT_RELOAD = 900
DRONE_RESPAWN_FRAMES = 1200

TILE = 512
TILE_CACHE = 30
WIND = (0.30, -0.10)        # smoke drift, px/frame

CYAN = (0, 230, 255)

# Controller: left stick / d-pad fly. Buttons post the same keys as the keyboard.
# Desktop: SDL's game-controller layer gives every pad (Xbox, DualSense, ...) one layout:
#   A/Cross bomb, B/Circle AGM, X/Square AAM, Y/Triangle flares, LB/L1 previous jet, RB/R1 next jet,
#   Back/Create previous level, Start/Options next level, left stick click aerobatics,
#   right stick click SAM launch, RT/R2 climb, LT/L2 descend.
# Browser (no game-controller layer): the standard raw layout below, d-pad = buttons 12-15,
# buttons 6/7 (LT/RT) held = descend / climb.
try:
    from pygame._sdl2 import controller as sdl_controller
    sdl_controller.init()
except Exception:  # browser build / older SDL: raw joystick only
    sdl_controller = None

PAD_DEADZONE = 0.35
CTRL_BUTTON_KEYS = {
    pygame.CONTROLLER_BUTTON_A: (pygame.K_SPACE, 0),
    pygame.CONTROLLER_BUTTON_B: (pygame.K_r, 0),
    pygame.CONTROLLER_BUTTON_X: (pygame.K_f, 0),
    pygame.CONTROLLER_BUTTON_Y: (pygame.K_c, 0),
    pygame.CONTROLLER_BUTTON_LEFTSHOULDER: (pygame.K_TAB, pygame.KMOD_SHIFT),
    pygame.CONTROLLER_BUTTON_RIGHTSHOULDER: (pygame.K_TAB, 0),
    pygame.CONTROLLER_BUTTON_BACK: (pygame.K_p, 0),
    pygame.CONTROLLER_BUTTON_START: (pygame.K_n, 0),
    pygame.CONTROLLER_BUTTON_LEFTSTICK: (pygame.K_v, 0),
    pygame.CONTROLLER_BUTTON_RIGHTSTICK: (pygame.K_m, 0),
    20: (pygame.K_t, 0),  # SDL's touchpad click (DualSense / DualShock 4): day / night
} if sdl_controller is not None else {}
PAD_BUTTON_KEYS = {
    0: (pygame.K_SPACE, 0),             # A      drop bomb
    1: (pygame.K_r, 0),                 # B      air-to-ground missile
    2: (pygame.K_f, 0),                 # X      air-to-air missile
    3: (pygame.K_c, 0),                 # Y      flares
    4: (pygame.K_TAB, pygame.KMOD_SHIFT),  # LB  previous jet
    5: (pygame.K_TAB, 0),               # RB     next jet
    8: (pygame.K_p, 0),                 # Back   previous level
    9: (pygame.K_n, 0),                 # Start  next level
    10: (pygame.K_v, 0),                # left stick click   aerobatics
    11: (pygame.K_m, 0),                # right stick click  SAM launch
}
P2_CTRL_KEYS = {  # player 2's controller (desktop layout) -> player 2's keys
    pygame.CONTROLLER_BUTTON_DPAD_LEFT: (pygame.K_LEFT, 0), pygame.CONTROLLER_BUTTON_DPAD_RIGHT: (pygame.K_RIGHT, 0),
    pygame.CONTROLLER_BUTTON_A: (pygame.K_UP, 0), pygame.CONTROLLER_BUTTON_B: (pygame.K_DOWN, 0),
} if sdl_controller is not None else {}
P2_PAD_KEYS = {14: (pygame.K_LEFT, 0), 15: (pygame.K_RIGHT, 0), 0: (pygame.K_UP, 0), 1: (pygame.K_DOWN, 0)}
MINIMAP_RECT = pygame.Rect(SCREEN_W - 252 - 14, 26, 252, 90)

# Phone touch controls (shown on phones, and on any screen once a finger touches it):
# a stick on the left flies the jet, buttons on the right do what their keys do
STICK_CENTRE = (130, LEVEL_BAR_TOP - 130)
STICK_RADIUS = 80
STICK_DEADZONE = 0.18
TOUCH_BUTTONS = [  # label, key it presses, centre, radius, held (True = works while the finger stays down)
    ("BOMB", pygame.K_SPACE, (SCREEN_W - 80, LEVEL_BAR_TOP - 80), 44, False),
    ("AGM", pygame.K_r, (SCREEN_W - 186, LEVEL_BAR_TOP - 52), 32, False),
    ("AAM", pygame.K_f, (SCREEN_W - 70, LEVEL_BAR_TOP - 190), 32, False),
    ("FLARE", pygame.K_c, (SCREEN_W - 172, LEVEL_BAR_TOP - 146), 36, False),
    ("SAM", pygame.K_m, (SCREEN_W - 278, LEVEL_BAR_TOP - 118), 26, False),
    ("AERO", pygame.K_v, (SCREEN_W - 284, LEVEL_BAR_TOP - 44), 26, False),
    ("CLIMB", pygame.K_q, (SCREEN_W - 60, 170), 32, True),
    ("DIVE", pygame.K_e, (SCREEN_W - 60, 246), 32, True),
]

# Altitude: the jet you fly climbs / descends (Q-E, PageUp-PageDown, triggers); the camera stays
# the same height above it, so the lower it flies the closer the ground (zoom 1x at 35,000 ft, 3x at 3,000 ft)
ALT_MIN = 3000.0
ALT_RATE = 70.0             # ft per frame
MAX_ZOOM = 3.0
DETAIL_ZOOM = 1.5           # trees, traffic and boats appear from this zoom
LOW_ALT_SPOT = 15000.0      # below this you can spot camouflaged launchers close by
LOW_ALT_SPOT_RANGE = 350
SKY_HAZE_CENTRE = 0         # blue-sky alpha in the middle of the view at full height (kept clear)
SKY_HAZE_EDGE = 40         # ... at the very edges
SKY_HAZE_EDGE_BAND = 90     # px over which it thickens toward the edges

# Real-sky extras
CLOUD_COUNT = 110           # spread over the whole map: about one in view at a time
HELI_COUNT = 8

# Aerobatic display (V / left stick click): each press flies the next manoeuvre with display smoke
AEROBATICS = [("BARREL ROLL", 150), ("LOOP", 260), ("VICTORY ROLLS", 150)]
DISPLAY_SMOKE = [(255, 140, 40), (245, 245, 245), (60, 190, 90)]
LOOP_RADIUS = 60            # px of ground track the loop reaches forward and back
LOOP_HEIGHT = 4000.0        # ft


def zoom_for_altitude(alt: float) -> float:
    return 1.0 + (MAX_ZOOM - 1.0) * (CRUISE_ALT_FT - alt) / (CRUISE_ALT_FT - ALT_MIN)


def level_speed(level: int) -> float:
    return BASE_SPEED + (min(MAX_LEVEL, max(1, level)) - 1) * SPEED_PER_LEVEL




def angle_diff(target: float, current: float) -> float:
    return (target - current + math.pi) % (2 * math.pi) - math.pi


def chaikin(points, iterations=3):
    pts = list(points)
    for _ in range(iterations):
        smooth = [pts[0]]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            smooth.append((0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1))
            smooth.append((0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1))
        smooth.append(pts[-1])
        pts = smooth
    return pts


def segment_touches(rect: pygame.Rect, p1, p2, pad: float) -> bool:
    return (min(p1[0], p2[0]) - pad <= rect.right and max(p1[0], p2[0]) + pad >= rect.left and
            min(p1[1], p2[1]) - pad <= rect.bottom and max(p1[1], p2[1]) + pad >= rect.top)


def on_screen(sx: float, sy: float, pad: float = 40) -> bool:
    return -pad <= sx <= SCREEN_W + pad and -pad <= sy <= SCREEN_H + pad


# ==============================================================================
# FLIGHT TRAJECTORY (PERSISTENT HIGH-ALTITUDE CONTRAILS)
# ==============================================================================
class FlightTrajectory:
    """Fading multi-point trail: a point every `spacing` px, each fades out over `life` frames."""

    def __init__(self, color=(220, 240, 255), width=2, life=1800, spacing=6.0, max_points=400, dashed=False):
        self.points = deque()  # (x, y, frame recorded)
        self.color = color
        self.width = width
        self.life = life
        self.spacing_sq = spacing * spacing
        self.max_points = max_points
        self.dashed = dashed

    def record(self, wx: float, wy: float, frame: int):
        if self.points:
            lx, ly, _ = self.points[-1]
            if (wx - lx) ** 2 + (wy - ly) ** 2 < self.spacing_sq:
                self.expire(frame)
                return
        self.points.append((float(wx), float(wy), frame))
        if len(self.points) > self.max_points:
            self.points.popleft()
        self.expire(frame)

    def expire(self, frame: int):
        while self.points and frame - self.points[0][2] > self.life:
            self.points.popleft()

    def clear(self):
        self.points.clear()

    def draw(self, overlay: pygame.Surface, cam_x: int, cam_y: int, frame: int, head=None, max_alpha=220):
        """Draws onto an SRCALPHA overlay; `head` joins the trail to the object's current spot."""
        pts = list(self.points)
        if head is not None:
            pts.append((head[0], head[1], frame))
        if len(pts) < 2:
            return
        w, h = overlay.get_size()
        r, g, b = self.color
        for i, ((x0, y0, f0), (x1, y1, _)) in enumerate(zip(pts, pts[1:])):
            if self.dashed and i % 2:
                continue
            sx0, sy0, sx1, sy1 = x0 - cam_x, y0 - cam_y, x1 - cam_x, y1 - cam_y
            if (sx0 < -20 and sx1 < -20) or (sx0 > w + 20 and sx1 > w + 20) or \
               (sy0 < -20 and sy1 < -20) or (sy0 > h + 20 and sy1 > h + 20):
                continue
            fresh = max(0.0, 1.0 - (frame - f0) / self.life)
            alpha = int(max_alpha * (0.14 + 0.86 * fresh))
            width = max(1, round(self.width * (0.5 + 0.5 * fresh)))
            pygame.draw.line(overlay, (r, g, b, alpha), (sx0, sy0), (sx1, sy1), width)


# ==============================================================================
# PROCEDURAL AUDIO SYNTHESIZER
# ==============================================================================
class _SilentSound:
    def play(self, *args, **kwargs):
        return None


class RetroSoundEngine:
    @staticmethod
    def create_tone(freq_start: float, freq_end: float, duration: float, volume: float = 0.35) -> pygame.mixer.Sound:
        sample_rate = 44100
        total_samples = int(sample_rate * duration)
        raw_samples = array.array("h")
        phase = 0.0
        for i in range(total_samples):
            t = i / total_samples
            freq = freq_start + (freq_end - freq_start) * t
            phase = (phase + 2.0 * math.pi * freq / sample_rate) % (2.0 * math.pi)
            sample_val = int(math.sin(phase) * ((1.0 - t) ** 1.3) * 32767 * volume)
            raw_samples.append(sample_val)
            raw_samples.append(sample_val)
        return pygame.mixer.Sound(buffer=raw_samples)

    @staticmethod
    def create_rumble(duration: float, volume: float = 0.45) -> pygame.mixer.Sound:
        sample_rate = 44100
        total_samples = int(sample_rate * duration)
        rng = random.Random(7)
        raw_samples = array.array("h")
        low = 0.0
        for i in range(total_samples):
            t = i / total_samples
            low += (rng.uniform(-1.0, 1.0) - low) * 0.06  # low-passed noise = distant blast
            sample_val = int(max(-1.0, min(1.0, low * 3.0)) * ((1.0 - t) ** 1.6) * 32767 * volume)
            raw_samples.append(sample_val)
            raw_samples.append(sample_val)
        return pygame.mixer.Sound(buffer=raw_samples)

    def __init__(self):
        if not pygame.mixer.get_init():
            self.snd_shoot = self.snd_explode = self.snd_ignite = self.snd_switch = self.snd_missile = _SilentSound()
            self.snd_flare = _SilentSound()
            return
        self.snd_shoot = self.create_tone(840, 260, 0.08)
        self.snd_explode = self.create_rumble(0.45)
        self.snd_ignite = self.create_tone(140, 380, 0.25)
        self.snd_switch = self.create_tone(600, 980, 0.1)
        self.snd_missile = self.create_tone(1200, 500, 0.18, 0.25)
        self.snd_flare = self.create_tone(2200, 1400, 0.12, 0.2)


SFX = RetroSoundEngine()


# ==============================================================================
# 35,000-FT STRATOSPHERIC COUNTRY MAP
# ==============================================================================
FIELD_COLORS = [(70, 122, 48), (62, 114, 42), (80, 130, 52), (92, 136, 54), (66, 118, 46), (104, 140, 58)]
SAND_COLORS = [(170, 148, 102), (162, 140, 96), (178, 156, 108), (156, 136, 94)]
ROOF_COLORS = [(150, 82, 62), (170, 150, 120), (122, 112, 100), (140, 100, 70)]


class CountryLandscape:
    def __init__(self, world_w=WORLD_W, world_h=WORLD_H):
        self.world_w = world_w
        self.world_h = world_h
        rng = random.Random(2026)

        # Northern mountain range: jagged ridges, shadowed south-east faces, snow on the crests
        self.peaks = []
        x = 2500.0
        while x < world_w - 900:
            for row in range(3):
                px = x + rng.uniform(-40, 40)
                py = 150 + row * 170 + 160 * math.sin(x / 900) + rng.uniform(-60, 60)
                r = rng.uniform(40, 95) * (1.0 - row * 0.2)
                ridge = rng.uniform(-0.5, 0.5)  # ridges run roughly east-west
                outline = []
                for k in range(10):
                    a = ridge + k * math.pi / 5
                    stretch = 1.0 + 0.6 * abs(math.cos(a - ridge))
                    rr = r * stretch * rng.uniform(0.55, 1.0)
                    outline.append((px + math.cos(a) * rr * 0.75, py + math.sin(a) * rr * 0.5))
                snow = rng.random() < 0.75 - row * 0.3
                self.peaks.append((px, py, r * 1.6, snow, ridge, outline))
            x += rng.uniform(40, 75)

        # Winding river system: the main river reaches the western sea, tributaries join it
        nodes = []
        ry = world_h * 0.45
        rx = self.coast_x(ry) - 160
        while rx <= world_w + 300:
            nodes.append((rx, ry))
            rx += rng.uniform(220, 360)
            ry = max(world_h * 0.22, min(world_h * 0.82, ry + rng.uniform(-170, 170)))
        self.river = chaikin(nodes)
        self.tributaries = []
        for k in range(4):
            sx, sy = self.river[int(len(self.river) * (0.2 + 0.18 * k))]
            heading = (-math.pi / 2 if k % 2 == 0 else math.pi / 2) + rng.uniform(-0.4, 0.4)
            trib = [(sx, sy)]
            for _ in range(rng.randint(5, 8)):
                heading += rng.uniform(-0.45, 0.45)
                sx = max(1200, min(world_w - 150, sx + math.cos(heading) * rng.uniform(200, 290)))
                sy = max(120, min(world_h - 120, sy + math.sin(heading) * rng.uniform(200, 290)))
                trib.append((sx, sy))
            self.tributaries.append(chaikin(trib))

        # National frontier with the eastern neighbour (the ground front line)
        self.border = []
        bx = world_w * 0.78
        for i in range(21):
            bx = max(world_w * 0.72, min(world_w * 0.84, bx + rng.uniform(-160, 160)))
            self.border.append((bx, world_h * i / 20))
        self.border_dashes = []
        for p1, p2 in zip(self.border, self.border[1:]):
            seg = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
            for d in range(0, int(seg), 44):
                t0, t1 = d / seg, min(1.0, (d + 26) / seg)
                self.border_dashes.append(((p1[0] + (p2[0] - p1[0]) * t0, p1[1] + (p2[1] - p1[1]) * t0),
                                           (p1[0] + (p2[0] - p1[0]) * t1, p1[1] + (p2[1] - p1[1]) * t1)))

        # Metropolitan hubs with street grids and lit building clusters
        self.cities = []
        gap = (world_w - 2600) / (CITY_COUNT - 1)
        for i in range(CITY_COUNT):
            cx = 1500 + i * gap + rng.uniform(-180, 180)
            cy = rng.uniform(1000, world_h - 550)
            radius = rng.randint(150, 250)
            self.cities.append({"x": cx, "y": cy, "size": radius * 2, "r": radius,
                                "name": f"SECTOR-{chr(65 + i)}", "blocks": self._city_blocks(cx, cy, radius, rng)})
        self.highways = [((a["x"], a["y"]), (b["x"], b["y"])) for a, b in zip(self.cities, self.cities[1:])]
        self.railways = []
        for a, b in zip(self.cities, self.cities[2:]):
            mid = ((a["x"] + b["x"]) / 2 + rng.uniform(-200, 200), (a["y"] + b["y"]) / 2 + rng.uniform(-400, 400))
            self.railways.append(chaikin([(a["x"], a["y"]), mid, (b["x"], b["y"])], 2))

        # Military airbases
        self.airbases = []
        for i in (2, 6, 9):
            c = self.cities[i]
            self.airbases.append((c["x"] + rng.choice((-1, 1)) * 520, c["y"] + rng.uniform(-260, 260)))

        # Forests on the foothills, villages across the farmland
        self.forests = []
        for _ in range(70):
            fx, fy = rng.uniform(1500, world_w - 400), rng.uniform(700, world_h - 300)
            if fy > 1300 and rng.random() < 0.6:
                fy = rng.uniform(700, 1300)
            trees = [(fx + rng.gauss(0, 60), fy + rng.gauss(0, 40), rng.randint(5, 10)) for _ in range(rng.randint(25, 45))]
            self.forests.append((fx, fy, trees))
        self.villages = []
        while len(self.villages) < 240:
            vy = rng.uniform(800, world_h - 150)
            vx = rng.uniform(self.coast_x(vy) + 80, world_w - 150)
            if any(math.hypot(c["x"] - vx, c["y"] - vy) < c["r"] * 1.4 for c in self.cities):
                continue
            houses = [(vx + rng.uniform(-28, 28), vy + rng.uniform(-20, 20), rng.choice(ROOF_COLORS)) for _ in range(rng.randint(5, 12))]
            self.villages.append((vx, vy, houses))

        # Dispersed air-defense batteries (50 sites x 20 missiles = 1,000 reserve)
        self.sam_sites = []
        spacing = SAM_SPACING
        tries = 0
        while len(self.sam_sites) < SAM_SITE_COUNT:
            tries += 1
            if tries % 4000 == 0:
                spacing *= 0.9  # safety net; with these numbers the first pass always fits
            sy = rng.uniform(300, world_h - 300)
            sx = rng.uniform(self.coast_x(sy) + 260, world_w - 300)
            if any(math.hypot(s["x"] - sx, s["y"] - sy) < spacing for s in self.sam_sites):
                continue
            if any(math.hypot(c["x"] - sx, c["y"] - sy) < c["r"] + 140 for c in self.cities):
                continue
            if any(math.hypot(px - sx, py - sy) < 70 for px, py in self.river[::2]):
                continue
            i = len(self.sam_sites)
            self.sam_sites.append({"id": i, "name": f"SAM-{i + 1:02d}", "x": sx, "y": sy,
                                   "missiles": SAM_MISSILES_PER_SITE, "hp": SAM_SITE_HP,
                                   "phase": rng.uniform(0, 2 * math.pi), "flash": 0,
                                   "cd": rng.randint(0, SAM_SITE_RELOAD), "range": SAM_RANGE,
                                   "kind": "SAM", "camouflaged": False, "seen": 0})

        # Mobile launchers (TELs) all over the ground: some parked in the open, most camouflaged
        # (unseen until they fire, then they hide again)
        self.tels = []
        while len(self.tels) < TEL_COUNT:
            sy = rng.uniform(200, world_h - 200)
            sx = rng.uniform(self.coast_x(sy) + 150, world_w - 200)
            if any(math.hypot(s["x"] - sx, s["y"] - sy) < TEL_SPACING for s in self.sam_sites + self.tels):
                continue
            if any(math.hypot(c["x"] - sx, c["y"] - sy) < c["r"] + 40 for c in self.cities):
                continue
            i = len(self.tels)
            self.tels.append({"id": 1000 + i, "name": f"TEL-{i + 1:03d}", "x": sx, "y": sy,
                              "missiles": TEL_MISSILES, "hp": 1, "phase": rng.uniform(0, 2 * math.pi),
                              "flash": 0, "cd": rng.randint(0, SAM_SITE_RELOAD), "range": TEL_RANGE,
                              "kind": "TEL", "camouflaged": rng.random() < TEL_CAMOUFLAGED_SHARE, "seen": 0})
        self.launchers = self.sam_sites + self.tels

        self._tiles = OrderedDict()
        self._light_tiles = OrderedDict()
        self._minimap = None

    @staticmethod
    def coast_x(wy: float) -> float:
        return 760 + 110 * math.sin(wy / 520 + 0.6) + 45 * math.sin(wy / 190 + 2.1) + 18 * math.sin(wy / 67)

    @staticmethod
    def is_desert(wx: float, wy: float) -> bool:
        return (wx - 9600) / 1300 + (wy - 2900) / 800 + 0.35 * math.sin(wx / 700) + 0.25 * math.sin(wy / 410) > 1.0

    def is_highland(self, wx: float, wy: float) -> bool:
        return 2300 < wx < self.world_w - 750 and wy < 640 + 160 * math.sin(wx / 900) + 40 * math.sin(wx / 230)

    def border_x(self, wy: float) -> float:
        i = min(len(self.border) - 2, max(0, int(wy / self.world_h * 20)))
        (x0, y0), (x1, y1) = self.border[i], self.border[i + 1]
        return x0 + (x1 - x0) * ((wy - y0) / (y1 - y0))

    @staticmethod
    def _city_blocks(cx, cy, radius, rng):
        blocks = []
        step = 26
        for gx in range(-radius, radius + 1, step):
            for gy in range(-radius, radius + 1, step):
                d = math.hypot(gx, gy) / radius
                if d > 0.95 or rng.random() < d * 0.55:
                    continue
                w, h = rng.randint(14, 21), rng.randint(14, 21)
                tone = rng.randint(72, 112)
                lights = []
                for _ in range(int(rng.randint(1, 4) * (1.4 - d))):
                    lights.append((rng.randint(2, w - 3), rng.randint(2, h - 3),
                                   rng.choice([(255, 222, 140), (255, 196, 96), (210, 232, 255)])))
                blocks.append((cx + gx - w / 2, cy + gy - h / 2, w, h, (tone, tone, tone + 6), lights))
        return blocks

    # ------------------------------------------------------------------ tiles
    def _render_tile(self, tx: int, ty: int) -> pygame.Surface:
        ox, oy = tx * TILE, ty * TILE
        area = pygame.Rect(ox, oy, TILE, TILE)
        surf = pygame.Surface((TILE, TILE)).convert()
        surf.fill((60, 108, 42))  # continental grassland

        # Farmland / pasture patches, sand dunes in the south-eastern desert
        cell = 160
        for gx in range((ox // cell) * cell, ox + TILE, cell):
            for gy in range((oy // cell) * cell, oy + TILE, cell):
                h = (gx * 73856093 ^ gy * 19349663) & 0xFFFF
                if self.is_desert(gx + cell / 2, gy + cell / 2):
                    col = SAND_COLORS[h % len(SAND_COLORS)]
                    surf.fill(col, (gx - ox, gy - oy, cell, cell))
                    for k in range(3):
                        y = gy - oy + 22 + k * 48 + (h >> (k * 3)) % 17
                        x = gx - ox + (h >> (k * 4)) % 50
                        pygame.draw.arc(surf, (col[0] - 18, col[1] - 18, col[2] - 14),
                                        (x, y, 70 + (h >> k) % 50, 26), 0.3, 2.8, 2)
                    continue
                if self.is_highland(gx + cell / 2, gy + cell / 2):  # rocky alpine slopes, no farmland
                    surf.fill((54, 60, 46), (gx - ox, gy - oy, cell, cell))
                    for k in range(6):
                        rx_, ry_ = gx - ox + (h * (k + 3)) % cell, gy - oy + (h * (k + 7) >> 3) % cell
                        pygame.draw.ellipse(surf, (46, 52, 40) if k % 2 else (62, 66, 52), (rx_, ry_, 40, 22))
                    continue
                inset = 3 + h % 4
                rect = pygame.Rect(gx - ox + inset, gy - oy + inset, cell - 2 * inset, cell - 2 * inset)
                col = FIELD_COLORS[h % len(FIELD_COLORS)]
                pygame.draw.rect(surf, col, rect)
                if h % 5 == 0:  # crop strips
                    for k in range(1, 4):
                        x = rect.x + rect.w * k // 4
                        pygame.draw.line(surf, (col[0] + 6, col[1] + 6, col[2] + 2), (x, rect.y), (x, rect.bottom), 2)
                elif h % 7 == 0:  # woodland
                    pygame.draw.ellipse(surf, (38, 82, 32), rect.inflate(-30, -46))

        # Forests
        for fx, fy, trees in self.forests:
            if not area.inflate(400, 300).collidepoint(fx, fy):
                continue
            for tx_, ty_, r in trees:
                pygame.draw.circle(surf, (26, 58, 24), (tx_ - ox + 2, ty_ - oy + 2), r)
                pygame.draw.circle(surf, (40, 88, 34), (tx_ - ox, ty_ - oy), r)

        # Mountain range: rock ridges with a shadow side and snow caps
        for px, py, r, snow, ridge, outline in self.peaks:
            if not area.inflate(r * 2 + 10, r * 2 + 10).collidepoint(px, py):
                continue
            pts = [(x - ox, y - oy) for x, y in outline]
            c = (px - ox, py - oy)
            pygame.draw.polygon(surf, (78, 74, 60), pts)                         # sunlit north-west face
            pygame.draw.polygon(surf, (52, 49, 42), [c] + pts[1:5])             # shadowed south-east face
            rx_, ry_ = math.cos(ridge) * r * 0.45, math.sin(ridge) * r * 0.3
            pygame.draw.line(surf, (104, 98, 82), (c[0] - rx_, c[1] - ry_), (c[0] + rx_, c[1] + ry_), 2)  # crest
            if snow:
                cap = [(c[0] + (x - c[0]) * 0.32, c[1] + (y - c[1]) * 0.32) for x, y in pts]
                pygame.draw.polygon(surf, (222, 226, 232), cap)
                pygame.draw.polygon(surf, (176, 182, 192), [c] + cap[1:5])

        # Highways and railways
        for p1, p2 in self.highways:
            if segment_touches(area, p1, p2, 4):
                pygame.draw.line(surf, (74, 74, 68), (p1[0] - ox, p1[1] - oy), (p2[0] - ox, p2[1] - oy), 3)
        for line in self.railways:
            for p1, p2 in zip(line, line[1:]):
                if not segment_touches(area, p1, p2, 6):
                    continue
                a, b = (p1[0] - ox, p1[1] - oy), (p2[0] - ox, p2[1] - oy)
                pygame.draw.line(surf, (48, 42, 36), a, b, 2)
                seg = math.hypot(b[0] - a[0], b[1] - a[1]) or 1.0
                nx, ny = -(b[1] - a[1]) / seg * 3, (b[0] - a[0]) / seg * 3
                for d in range(0, int(seg), 9):
                    mx, my = a[0] + (b[0] - a[0]) * d / seg, a[1] + (b[1] - a[1]) * d / seg
                    pygame.draw.line(surf, (60, 54, 46), (mx - nx, my - ny), (mx + nx, my + ny), 1)

        # Rivers (main river widens toward its mouth)
        for line, base_w in [(self.river, None)] + [(t, 5) for t in self.tributaries]:
            for p1, p2 in zip(line, line[1:]):
                if not segment_touches(area, p1, p2, 24):
                    continue
                w = base_w or int(7 + 9 * max(0.0, 1.0 - p1[0] / self.world_w))
                a, b = (p1[0] - ox, p1[1] - oy), (p2[0] - ox, p2[1] - oy)
                pygame.draw.line(surf, (28, 54, 48), a, b, w + 5)
                pygame.draw.circle(surf, (28, 54, 48), b, (w + 5) // 2)
        for line, base_w in [(self.river, None)] + [(t, 5) for t in self.tributaries]:
            for p1, p2 in zip(line, line[1:]):
                if not segment_touches(area, p1, p2, 24):
                    continue
                w = base_w or int(7 + 9 * max(0.0, 1.0 - p1[0] / self.world_w))
                a, b = (p1[0] - ox, p1[1] - oy), (p2[0] - ox, p2[1] - oy)
                pygame.draw.line(surf, (34, 84, 132), a, b, w)
                pygame.draw.circle(surf, (34, 84, 132), b, w // 2)
                if base_w is None:
                    pygame.draw.line(surf, (58, 118, 168), a, b, max(1, w // 4))

        # Western ocean, beach and surf lines
        if ox < 1000:
            for y in range(0, TILE, 4):
                cx = self.coast_x(oy + y) - ox
                if cx <= 0:
                    continue
                for x0, x1, col in ((0, cx - 140, (14, 34, 78)), (cx - 140, cx - 50, (18, 46, 96)),
                                    (cx - 50, cx, (26, 70, 120)), (cx, cx + 7, (168, 160, 120))):
                    x0, x1 = max(0, x0), min(TILE, x1)
                    if x1 > x0:
                        surf.fill(col, (int(x0), y, int(math.ceil(x1 - x0)), 4))
            for off, col, w in ((-8, (200, 226, 236), 2), (-19, (120, 172, 204), 1), (-32, (70, 122, 172), 1)):
                pts = [(self.coast_x(oy + y) - ox + off + 3 * math.sin((oy + y) / 23 + off), y)
                       for y in range(-8, TILE + 9, 8)]
                pygame.draw.lines(surf, col, False, pts, w)

        # Villages
        for vx, vy, houses in self.villages:
            if not area.inflate(80, 60).collidepoint(vx, vy):
                continue
            for hx, hy, col in houses:
                surf.fill(col, (hx - ox, hy - oy, 4, 3))

        # Airbases: runway with centre-line marks, taxiway and apron
        for ax, ay in self.airbases:
            if not area.inflate(320, 80).collidepoint(ax, ay):
                continue
            rx, ry = ax - ox, ay - oy
            pygame.draw.rect(surf, (86, 88, 86), (rx - 130, ry - 6, 260, 12))
            for d in range(-120, 120, 16):
                surf.fill((220, 220, 210), (rx + d, ry - 1, 8, 2))
            pygame.draw.line(surf, (76, 78, 76), (rx - 100, ry + 16), (rx + 100, ry + 16), 4)
            pygame.draw.rect(surf, (80, 82, 80), (rx - 30, ry + 20, 60, 22))
            for k in range(4):
                surf.fill((110, 116, 112), (rx - 24 + k * 14, ry + 26, 9, 9))  # hardened shelters

        # Cities
        for c in self.cities:
            if not area.inflate(c["r"] * 3, c["r"] * 3).collidepoint(c["x"], c["y"]):
                continue
            ccx, ccy = c["x"] - ox, c["y"] - oy
            suburb = (128, 114, 84) if self.is_desert(c["x"], c["y"]) else (46, 60, 48)
            pygame.draw.circle(surf, suburb, (ccx, ccy), int(c["r"] * 1.25))       # suburbs
            pygame.draw.circle(surf, (56, 58, 60), (ccx, ccy), c["r"])               # asphalt base
            for bx, by, w, h, col, lights in c["blocks"]:
                rx, ry = bx - ox, by - oy
                if rx > TILE or ry > TILE or rx + w < 0 or ry + h < 0:
                    continue
                pygame.draw.rect(surf, col, (rx, ry, w, h))
                for lx, ly, lc in lights:
                    surf.fill(lc, (rx + lx, ry + ly, 2, 2))
            for k in (-1, 1):  # lit main avenues
                pygame.draw.line(surf, (176, 160, 110), (ccx - c["r"], ccy + k * 6), (ccx + c["r"], ccy + k * 6), 2)
                pygame.draw.line(surf, (176, 160, 110), (ccx + k * 6, ccy - c["r"]), (ccx + k * 6, ccy + c["r"]), 2)

        # National boundary
        for p1, p2 in self.border_dashes:
            if segment_touches(area, p1, p2, 3):
                pygame.draw.line(surf, (196, 92, 80), (p1[0] - ox, p1[1] - oy), (p2[0] - ox, p2[1] - oy), 2)
        return surf

    # ------------------------------------------------------------ night lights
    def _render_light_tile(self, tx: int, ty: int) -> pygame.Surface:
        """What the ground shows at night: black, plus every light, added on top of the darkened ground."""
        ox, oy = tx * TILE, ty * TILE
        area = pygame.Rect(ox, oy, TILE, TILE)
        surf = pygame.Surface((TILE, TILE)).convert()
        surf.fill((0, 0, 0))

        def lamp(x, y, core, glow, r):
            pygame.draw.circle(surf, glow, (x, y), r)
            pygame.draw.circle(surf, (glow[0] * 2, glow[1] * 2, glow[2] * 2), (x, y), max(1, r // 2))
            surf.fill(core, (int(x), int(y), 2, 2))

        # highways: a sodium-orange ribbon of street lamps
        for p1, p2 in self.highways:
            if not segment_touches(area, p1, p2, 8):
                continue
            a, b = (p1[0] - ox, p1[1] - oy), (p2[0] - ox, p2[1] - oy)
            pygame.draw.line(surf, (40, 26, 6), a, b, 7)
            pygame.draw.line(surf, (110, 74, 22), a, b, 2)
            seg = math.hypot(b[0] - a[0], b[1] - a[1]) or 1.0
            for d in range(0, int(seg), 18):
                x, y = a[0] + (b[0] - a[0]) * d / seg, a[1] + (b[1] - a[1]) * d / seg
                if -8 < x < TILE + 8 and -8 < y < TILE + 8:
                    surf.fill((255, 196, 110), (int(x), int(y), 2, 2))
        # villages: a few lit windows each
        for vx, vy, houses in self.villages:
            if not area.inflate(80, 60).collidepoint(vx, vy):
                continue
            for k, (hx, hy, _) in enumerate(houses):
                if (int(hx) + k) % 3:
                    lamp(hx - ox, hy - oy, (255, 214, 140), (26, 18, 6), 4)
        # airbases: runway edge lights, threshold greens, the apron floodlit
        for ax, ay in self.airbases:
            if not area.inflate(320, 80).collidepoint(ax, ay):
                continue
            rx, ry = ax - ox, ay - oy
            for d in range(-128, 130, 12):
                surf.fill((235, 235, 220), (rx + d, ry - 7, 2, 2))
                surf.fill((235, 235, 220), (rx + d, ry + 6, 2, 2))
            for end in (-131, 129):
                pygame.draw.line(surf, (40, 230, 90), (rx + end, ry - 6), (rx + end, ry + 6), 2)
            pygame.draw.rect(surf, (60, 52, 30), (rx - 34, ry + 18, 68, 26))
        # cities: lit street grid, glowing avenues, windows in every block
        for c in self.cities:
            if not area.inflate(c["r"] * 3, c["r"] * 3).collidepoint(c["x"], c["y"]):
                continue
            ccx, ccy, r = c["x"] - ox, c["y"] - oy, c["r"]
            for f, glow in ((1.2, (12, 8, 3)), (0.95, (20, 13, 5)), (0.65, (28, 19, 7)), (0.35, (36, 25, 9))):
                pygame.draw.circle(surf, glow, (ccx, ccy), int(r * f))  # sky glow, brightest downtown
            for off in range(-r + 13, r, 26):
                half = math.sqrt(max(0.0, r * r - off * off))
                pygame.draw.line(surf, (96, 70, 28), (ccx + off, ccy - half), (ccx + off, ccy + half), 2)
                pygame.draw.line(surf, (96, 70, 28), (ccx - half, ccy + off), (ccx + half, ccy + off), 2)
            for k in (-1, 1):
                pygame.draw.line(surf, (230, 170, 80), (ccx - r, ccy + k * 6), (ccx + r, ccy + k * 6), 2)
                pygame.draw.line(surf, (230, 170, 80), (ccx + k * 6, ccy - r), (ccx + k * 6, ccy + r), 2)
            for bx, by, w, h, _, lights in c["blocks"]:
                rx, ry = bx - ox, by - oy
                if rx > TILE or ry > TILE or rx + w < 0 or ry + h < 0:
                    continue
                pygame.draw.rect(surf, (30, 26, 18), (rx, ry, w, h))
                for lx, ly, lc in lights:
                    surf.fill(lc, (rx + lx, ry + ly, 2, 2))
                    surf.fill((lc[0] // 3, lc[1] // 3, lc[2] // 3), (rx + lx + 3, ry + ly + 1, 2, 2))
        return surf

    def draw_lights(self, surface: pygame.Surface, cam_x: int, cam_y: int, screen_w: int, screen_h: int):
        for tx in range(cam_x // TILE, (cam_x + screen_w) // TILE + 1):
            for ty in range(cam_y // TILE, (cam_y + screen_h) // TILE + 1):
                key = (tx, ty)
                surf = self._light_tiles.get(key)
                if surf is None:
                    surf = self._render_light_tile(tx, ty)
                    self._light_tiles[key] = surf
                    if len(self._light_tiles) > TILE_CACHE:
                        self._light_tiles.popitem(last=False)
                else:
                    self._light_tiles.move_to_end(key)
                surface.blit(surf, (tx * TILE - cam_x, ty * TILE - cam_y), special_flags=pygame.BLEND_ADD)

    def tile(self, tx: int, ty: int) -> pygame.Surface:
        key = (tx, ty)
        surf = self._tiles.get(key)
        if surf is None:
            surf = self._render_tile(tx, ty)
            self._tiles[key] = surf
            if len(self._tiles) > TILE_CACHE:
                self._tiles.popitem(last=False)
        else:
            self._tiles.move_to_end(key)
        return surf

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, screen_w: int, screen_h: int):
        for tx in range(cam_x // TILE, (cam_x + screen_w) // TILE + 1):
            for ty in range(cam_y // TILE, (cam_y + screen_h) // TILE + 1):
                surface.blit(self.tile(tx, ty), (tx * TILE - cam_x, ty * TILE - cam_y))

    # ---------------------------------------------------------------- minimap
    def minimap(self, map_w: int, map_h: int) -> pygame.Surface:
        if self._minimap is not None and self._minimap.get_size() == (map_w, map_h):
            return self._minimap
        sx, sy = map_w / self.world_w, map_h / self.world_h
        surf = pygame.Surface((map_w, map_h)).convert()
        surf.fill((30, 58, 38))
        for my in range(map_h):
            wy = (my + 0.5) / sy
            for mx in range(0, map_w, 2):
                if self.is_desert((mx + 1) / sx, wy):
                    surf.fill((120, 106, 74), (mx, my, 2, 1))
                elif self.is_highland((mx + 1) / sx, wy):
                    surf.fill((68, 70, 56), (mx, my, 2, 1))
            bx = int(self.border_x(wy) * sx)
            tint = pygame.Surface((map_w - bx, 1), pygame.SRCALPHA)
            tint.fill((40, 30, 0, 70))
            surf.blit(tint, (bx, my))                                        # neighbouring nation
            surf.fill((16, 38, 82), (0, my, int(self.coast_x(wy) * sx), 1))  # ocean
        for px, py, r, snow, _, _ in self.peaks[::3]:
            surf.fill((150, 146, 136) if snow else (90, 84, 70), (int(px * sx), int(py * sy), 2, 2))
        for line in [self.river] + self.tributaries:
            pygame.draw.lines(surf, (50, 110, 170), False, [(x * sx, y * sy) for x, y in line], 1)
        pygame.draw.lines(surf, (220, 96, 84), False, [(x * sx, y * sy) for x, y in self.border], 1)
        for c in self.cities:
            pygame.draw.rect(surf, (230, 200, 120), (int(c["x"] * sx) - 1, int(c["y"] * sy) - 1, 3, 3))
        self._minimap = surf
        return surf


def launcher_visible(site: dict) -> bool:
    return not site["camouflaged"] or site["seen"] > 0 or site["hp"] <= 0


def draw_tel(surface: pygame.Surface, tel: dict, sx: int, sy: int, font):
    """Mobile launcher truck: cab, chassis and a raised quad missile rack."""
    if tel["hp"] <= 0:
        pygame.draw.circle(surface, (32, 28, 24), (sx, sy), 9)
        surface.fill((70, 64, 52), (sx - 6, sy - 2, 12, 4))
        return
    vertical = int(tel["phase"] * 10) % 2 == 0
    body = pygame.Rect(0, 0, 8, 20) if vertical else pygame.Rect(0, 0, 20, 8)
    body.center = (sx, sy)
    pygame.draw.rect(surface, (84, 92, 58), body, border_radius=2)
    cab = pygame.Rect(body.x, body.y, 8, 5) if vertical else pygame.Rect(body.right - 5, body.y, 5, 8)
    surface.fill((52, 58, 40), cab)
    for k in (-2, 1):  # launch tubes
        if vertical:
            pygame.draw.line(surface, (150, 156, 130), (sx + k, sy - 3), (sx + k, sy + 9), 2)
        else:
            pygame.draw.line(surface, (150, 156, 130), (sx - 9, sy + k), (sx + 3, sy + k), 2)
    if tel["flash"] > 0:
        pygame.draw.circle(surface, (255, 200, 90), (sx, sy), 5 + tel["flash"] // 3, 2)
    if font is not None:
        col = (255, 150, 120) if tel["camouflaged"] else (190, 200, 150)
        lbl = font.render(f"{tel['name']} {tel['missiles']}", True, col)
        surface.blit(lbl, (sx - lbl.get_width() // 2, sy + 12))


def draw_sam_site(surface: pygame.Surface, site: dict, sx: int, sy: int, frame: int, font):
    if site["hp"] <= 0:
        pygame.draw.circle(surface, (30, 27, 23), (sx, sy), 16)
        pygame.draw.circle(surface, (62, 52, 40), (sx, sy), 16, 2)
        rng = random.Random(site["id"])
        for _ in range(6):
            surface.fill((84, 80, 70), (sx + rng.randint(-12, 10), sy + rng.randint(-12, 10), 3, 2))
        return
    pad = pygame.Rect(sx - 18, sy - 14, 36, 28)
    pygame.draw.rect(surface, (64, 70, 62), pad, border_radius=6)        # concrete hardstand
    pygame.draw.rect(surface, (94, 102, 88), pad, 1, border_radius=6)    # earth berm
    if site["hp"] < SAM_SITE_HP:
        pygame.draw.circle(surface, (38, 34, 30), (sx - 10, sy + 8), 6)  # strike scorch
    # Phased-array radar dome with its rotating array face
    dome = (sx - 8, sy)
    pygame.draw.circle(surface, (196, 206, 210), dome, 7)
    pygame.draw.circle(surface, (118, 132, 138), dome, 7, 1)
    a = site["phase"] + frame * 0.02
    pygame.draw.line(surface, (0, 230, 190), dome, (dome[0] + math.cos(a) * 6, dome[1] + math.sin(a) * 6), 2)
    # Quad vertical launch canisters
    for k in range(4):
        rect = (sx + 2 + (k % 2) * 8, sy - 9 + (k // 2) * 10, 6, 8)
        pygame.draw.rect(surface, (80, 94, 62), rect)
        pygame.draw.rect(surface, (40, 48, 34), rect, 1)
    ready = (0, 220, 120) if site["missiles"] > 0 else (200, 64, 52)
    pygame.draw.circle(surface, ready, (sx + 14, sy - 10), 2)
    if site["flash"] > 0:
        pygame.draw.circle(surface, (255, 200, 90), (sx + 9, sy - 1), 6 + site["flash"] // 3, 2)
    if font is not None:
        lbl = font.render(f"{site['name']} {site['missiles']}", True, (150, 200, 175))
        surface.blit(lbl, (sx - lbl.get_width() // 2, sy + 16))


# ==============================================================================
# SQUADRON AIRCRAFT (10X SLOWER REALISTIC BASE SPEED)
# ==============================================================================
CALLSIGNS = ["VIPER-1", "EAGLE-2", "GHOST-3", "TITAN-4", "HAWK-5",
             "FALCON-6", "RAVEN-7", "SHADOW-8", "VALKYRIE-9", "OMEGA-10"]


class SquadronJet:
    def __init__(self, jet_id: int, x: float, y: float, hue: float, callsign: str):
        self.id = jet_id
        self.x, self.y = x, y
        self.heading = 0.0
        self.base_speed = BASE_SPEED
        self.speed = BASE_SPEED
        self.hue = hue
        self.callsign = callsign
        self.hp = JET_HP
        self.down_timer = 0  # > 0: shot down, replacement on its way
        self.missile_cd = 0
        self.altitude = CRUISE_ALT_FT  # you choose it (climb / descend); lower = the view zooms in
        self.aero = None               # running aerobatic manoeuvre
        self.aero_alt = 0.0            # extra height inside a loop (drawn only)
        self.roll = 0.0                # roll angle inside a roll (drawn only)
        self.smoke = [FlightTrajectory(color=c, width=3, life=1200, spacing=3, max_points=500) for c in DISPLAY_SMOKE]
        self.trajectory = FlightTrajectory(color=self.get_contrail_color(), width=2, life=1800, spacing=6, max_points=420)

    @property
    def alive(self) -> bool:
        return self.down_timer == 0

    def get_contrail_color(self):
        c = pygame.Color(0)
        c.hsva = (self.hue % 360, 22, 100, 100)
        return (c.r, c.g, c.b)

    def get_paint(self):
        def hsv(h, s, v):
            c = pygame.Color(0)
            c.hsva = (h % 360, max(0, min(100, s)), max(0, min(100, v)), 100)
            return (c.r, c.g, c.b)
        return (hsv(self.hue, 50, 85), hsv(self.hue, 65, 45), hsv(self.hue - 20, 25, 95))

    def turn_toward(self, target_heading: float, max_turn: float):
        self.heading += max(-max_turn, min(max_turn, angle_diff(target_heading, self.heading)))

    def avoid_edges(self, world_w: int, world_h: int, max_turn: float) -> bool:
        margin = 260
        if margin < self.x < world_w - margin and margin < self.y < world_h - margin:
            return False
        self.turn_toward(math.atan2(world_h / 2 - self.y, world_w / 2 - self.x), max_turn)
        return True

    def advance(self, speed: float, world_w: int, world_h: int, frame: int):
        self.speed = speed
        self.x = max(100, min(world_w - 100, self.x + math.cos(self.heading) * speed))
        self.y = max(100, min(world_h - 100, self.y + math.sin(self.heading) * speed))
        self.trajectory.record(self.x, self.y, frame)


def formation_slot(lead: SquadronJet, rank_index: int, style: str = "V"):
    """Slot of wingman `rank_index` behind its flight lead.
    V: alternate left/right, stepping back; ECHELON: all stepped back to the right;
    LINE: line abreast, alternate sides; TRAIL: one behind the other."""
    if style == "ECHELON":
        back, lateral = (rank_index + 1) * 60, (rank_index + 1) * 60
    elif style == "LINE":
        back, lateral = 0, (-1 if rank_index % 2 == 0 else 1) * (rank_index // 2 + 1) * 80
    elif style == "TRAIL":
        back, lateral = (rank_index + 1) * 90, 0
    else:
        rank = rank_index // 2 + 1
        back, lateral = rank * 70, (-1 if rank_index % 2 == 0 else 1) * rank * 62
    fx, fy = math.cos(lead.heading), math.sin(lead.heading)
    return lead.x - fx * back - fy * lateral, lead.y - fy * back + fx * lateral


# The squadron flies as 4 separate flights, each on its own CAP station in its own formation;
# the jet you pilot leaves its flight and flies on its own.
FLIGHTS = [("ALPHA", (0, 1, 2), "V"), ("BRAVO", (3, 4), "ECHELON"),
           ("CHARLIE", (5, 6, 7), "LINE"), ("DELTA", (8, 9), "TRAIL")]
CAP_RACETRACK = 700         # half-length of a flight's racetrack orbit, px
CAP_RETASK_FRAMES = 3600    # a flight moves to a new CAP station every 60 s
FLIGHT_STANDOFF = 2200      # flights keep their patrol this far from the jet you fly (out of view)
AI_FLARE_DISTANCE = 120    # AI-flown jets pop flares when a SAM gets this close
AI_FLARE_DECOY_CHANCE = 0.8 # share of SAMs the flares pull away
FLARE_RANGE = 260           # your flares (C) seduce SAMs that are this close when they burn
FLARE_DECOY_CHANCE = 0.85
FLARE_RELOAD = 300          # 5 s between two flare salvos
ECM_RANGE = 450             # ECM jammer (C while the flares reload) breaks the lock of SAMs this close
ECM_BREAK_CHANCE = 0.6
ECM_RELOAD = 720            # 12 s


@functools.lru_cache(maxsize=32)
def draw_jet_model_topdown(paint):
    surf = pygame.Surface((38, 38), pygame.SRCALPHA)
    body, dark, edge = paint
    fuselage = [(36, 19), (22, 14), (8, 16), (2, 19), (8, 22), (22, 24)]
    wing_left = [(22, 14), (10, 2), (4, 4), (12, 16)]
    wing_right = [(22, 24), (10, 36), (4, 34), (12, 22)]
    tail_l = [(8, 16), (2, 8), (0, 10), (4, 18)]
    tail_r = [(8, 22), (2, 30), (0, 28), (4, 20)]

    for w in (wing_left, wing_right, tail_l, tail_r):
        pygame.draw.polygon(surf, dark, w)
        pygame.draw.polygon(surf, edge, w, 1)
    pygame.draw.polygon(surf, body, fuselage)
    pygame.draw.polygon(surf, edge, fuselage, 1)
    pygame.draw.ellipse(surf, (255, 215, 60), (22, 17, 8, 4))
    return surf


@functools.lru_cache(maxsize=1)
def draw_drone_model_topdown():
    """Long straight wings, slim body, V-tail: a medium-altitude surveillance UAV."""
    surf = pygame.Surface((26, 26), pygame.SRCALPHA)
    pygame.draw.line(surf, (170, 164, 182), (11, 1), (11, 25), 3)        # wings
    pygame.draw.line(surf, (190, 186, 200), (4, 13), (24, 13), 3)        # fuselage
    pygame.draw.line(surf, (150, 144, 162), (4, 13), (1, 8), 2)          # V-tail
    pygame.draw.line(surf, (150, 144, 162), (4, 13), (1, 18), 2)
    pygame.draw.circle(surf, (210, 120, 255), (21, 13), 2)               # sensor turret
    return surf


def draw_bracket(surface: pygame.Surface, cx: int, cy: int, half=24, arm=8, color=CYAN):
    for dx, dy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        x, y = cx + dx * half, cy + dy * half
        pygame.draw.line(surface, color, (x, y), (x - dx * arm, y), 2)
        pygame.draw.line(surface, color, (x, y), (x, y - dy * arm), 2)


def draw_alt_label(surface: pygame.Surface, font, sx: int, sy: int, altitude: float, color):
    if font is not None and on_screen(sx, sy, 0):
        lbl = font.render(f"{altitude / 1000:.0f}K FT", True, color)
        surface.blit(lbl, (sx + 8, sy - 6))


# ==============================================================================
# DRONES (SLOW SURVEILLANCE PATROLS OVER THE COUNTRY)
# ==============================================================================
class Drone:
    def __init__(self, rng: random.Random, country: "CountryLandscape", from_border: bool):
        if from_border:  # reinforcements cross the front line from the east
            self.y = rng.uniform(600, country.world_h - 600)
            self.x = country.border_x(self.y) + 120
        else:
            self.y = rng.uniform(600, country.world_h - 600)
            self.x = rng.uniform(country.coast_x(self.y) + 400, country.world_w - 600)
        self.rng = rng
        self.country = country
        self.altitude = rng.uniform(9000, 16000)
        self.heading = math.pi
        self.waypoints = []
        self.alive = True
        self.spot_cd = rng.randint(0, DRONE_SPOT_RELOAD)
        self.trajectory = FlightTrajectory(color=(200, 170, 255), width=1, life=2400, spacing=7, max_points=360, dashed=True)

    def new_waypoint(self):
        c = self.country
        if self.rng.random() < 0.5:
            city = self.rng.choice(c.cities)  # watch over a city ...
            return city["x"] + self.rng.uniform(-300, 300), city["y"] + self.rng.uniform(-300, 300)
        y = self.rng.uniform(500, c.world_h - 500)  # ... or sweep open country
        return self.rng.uniform(c.coast_x(y) + 300, c.world_w - 500), y

    def update(self, speed: float, frame: int):
        if not self.waypoints:
            self.waypoints = [self.new_waypoint() for _ in range(3)]
        wx, wy = self.waypoints[0]
        if math.hypot(wx - self.x, wy - self.y) < 40:
            self.waypoints.pop(0)
        turn = max(-speed / 30, min(speed / 30, angle_diff(math.atan2(wy - self.y, wx - self.x), self.heading)))
        self.heading += turn
        self.x += math.cos(self.heading) * speed
        self.y += math.sin(self.heading) * speed
        self.trajectory.record(self.x, self.y, frame)
        if self.spot_cd > 0:
            self.spot_cd -= 1

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, font):
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        if not on_screen(sx, sy):
            return
        rot = pygame.transform.rotate(draw_drone_model_topdown(), -math.degrees(self.heading))
        surface.blit(rot, rot.get_rect(center=(sx, sy)))
        draw_alt_label(surface, font, sx, sy, self.altitude, (200, 170, 255))


# ==============================================================================
# MISSILES & SLOW-FALLING ORDNANCE
# ==============================================================================
class SAMMissile:
    """Ground-launched missile. Guided: homes on its jet all the way (flares / ECM can fool it).
    Unguided: a projectile fired at where the jet is heading; it flies straight, and when the motor
    burns out it arcs over and falls to the ground (only turning away escapes it)."""

    def __init__(self, site: dict, target: SquadronJet, speed: float, auto: bool = False, guided: bool = True):
        self.x, self.y = site["x"] + 9, site["y"] - 1
        self.site = site
        self.target = target
        self.auto = auto
        self.guided = guided
        self.speed = speed
        self.age = 0
        self.altitude = 0.0
        self.alt_goal = target.altitude
        self.climb_frames = max(90.0, SAM_CLIMB_FRAMES * self.alt_goal / CRUISE_ALT_FT)
        if guided:
            self.heading = math.atan2(target.y - self.y, target.x - self.x)
        else:  # aim off: where the jet will be when the rocket gets there (flying on as it is now)
            t = self.climb_frames
            for _ in range(8):
                ax = target.x + math.cos(target.heading) * target.speed * t
                ay = target.y + math.sin(target.heading) * target.speed * t
                t = self.frames_to_cover(math.hypot(ax - self.x, ay - self.y))
            self.heading = math.atan2(ay - self.y, ax - self.x)
        self.burnout = self.climb_frames + UNGUIDED_MOTOR_FRAMES
        self.fall = 0.0
        self.landed = False
        trail = (236, 232, 224) if guided else (206, 196, 176)
        self.trajectory = FlightTrajectory(color=trail, width=3, life=900, spacing=3, max_points=420)
        self.flares_tried = False
        self.decoy = None  # (x, y) of the flare it chases instead of the jet

    def frames_to_cover(self, dist: float) -> float:
        """Frames the motor needs to fly `dist` px: speed ramps 0.35 -> 1.0 over the climb, then holds."""
        c, v = self.climb_frames, max(0.05, self.speed)
        climb_dist = v * (0.35 * c + 0.65 * c / 2)
        if dist >= climb_dist:
            return c + (dist - climb_dist) / v
        # inside the climb: solve v * (0.35 n + 0.65 n^2 / (2c)) = dist
        a, b = 0.65 * v / (2 * c), 0.35 * v
        return (-b + math.sqrt(b * b + 4 * a * dist)) / (2 * a)

    @property
    def expired(self) -> bool:
        return self.guided and self.age > SAM_LIFE_FRAMES

    def update(self, frame: int):
        self.age += 1
        if self.guided and self.target.alive:
            self.alt_goal = self.target.altitude  # climbs to wherever the jet flies
        climb = min(1.0, self.age / self.climb_frames)
        spd = self.speed * (0.35 + 0.65 * climb)  # boost phase picks up speed while it climbs
        if not self.guided and self.age > self.burnout:
            # motor out: a projectile now, losing speed and falling faster and faster
            self.fall = min(250.0, self.fall + 3.0)
            self.altitude = max(0.0, self.altitude - self.fall)
            self.speed *= 0.996
            self.landed = self.altitude <= 0
        else:
            self.altitude = self.alt_goal * (1.0 - (1.0 - climb) ** 3)  # smooth ease-out climb
        if self.decoy is not None:  # seeker locked on a flare (or jammed onto a false track)
            desired = math.atan2(self.decoy[1] - self.y, self.decoy[0] - self.x)
            self.heading += max(-0.05, min(0.05, angle_diff(desired, self.heading)))
        elif self.guided and self.target.alive:
            desired = math.atan2(self.target.y - self.y, self.target.x - self.x)
            self.heading += max(-0.022, min(0.022, angle_diff(desired, self.heading)))
        self.x += math.cos(self.heading) * spd
        self.y += math.sin(self.heading) * spd
        self.trajectory.record(self.x, self.y, frame)

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, font):
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        size = 2 + 3 * self.altitude / CRUISE_ALT_FT  # closer to the camera = bigger
        hx, hy = math.cos(self.heading), math.sin(self.heading)
        body = (235, 235, 230) if self.guided else (200, 200, 168)
        pygame.draw.line(surface, body, (sx - hx * size * 1.6, sy - hy * size * 1.6),
                         (sx + hx * size * 1.6, sy + hy * size * 1.6), max(2, int(size * 0.8)))
        if self.guided or self.age <= self.burnout:  # motor flame
            pygame.draw.circle(surface, (255, 150, 40), (int(sx - hx * size * 1.9), int(sy - hy * size * 1.9)),
                               max(2, int(size * 0.6)))
        if abs(self.altitude - self.alt_goal) > 1:
            draw_alt_label(surface, font, sx, sy, self.altitude, (255, 190, 120))


class JetMissile:
    """Missile released from a jet: AGM dives from 35,000 ft onto a battery, AAM hunts a drone."""

    def __init__(self, jet: SquadronJet, kind: str, target, speed: float):
        self.kind = kind
        self.target = target
        self.x, self.y = jet.x, jet.y
        self.heading = jet.heading
        self.speed = speed
        self.altitude = jet.altitude
        self.start_alt = jet.altitude
        self.start_dist = max(1.0, math.hypot(self.tx - jet.x, self.ty - jet.y))
        self.age = 0
        self.done = False
        color = (255, 214, 150) if kind == "AGM" else (170, 230, 255)
        self.trajectory = FlightTrajectory(color=color, width=2, life=900, spacing=3, max_points=420)

    @property
    def tx(self):
        return self.target["x"] if self.kind == "AGM" else self.target.x

    @property
    def ty(self):
        return self.target["y"] if self.kind == "AGM" else self.target.y

    @property
    def target_alt(self):
        return 0.0 if self.kind == "AGM" else self.target.altitude

    def update(self, frame: int):
        self.age += 1
        dist = math.hypot(self.tx - self.x, self.ty - self.y)
        boost = min(1.0, 0.4 + self.age / 90)  # drops off the rail, then the motor lights
        turn = 0.03 if self.kind == "AGM" else 0.05
        self.heading += max(-turn, min(turn, angle_diff(math.atan2(self.ty - self.y, self.tx - self.x), self.heading)))
        self.x += math.cos(self.heading) * self.speed * boost
        self.y += math.sin(self.heading) * self.speed * boost
        # altitude follows the distance left: a dive from the release height to the target's height
        frac = min(1.0, dist / self.start_dist)
        self.altitude = self.target_alt + (self.start_alt - self.target_alt) * frac
        self.trajectory.record(self.x, self.y, frame)
        if self.age > 2400:
            self.done = True

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, font):
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        size = 1.5 + 3 * self.altitude / CRUISE_ALT_FT
        hx, hy = math.cos(self.heading), math.sin(self.heading)
        body = (250, 220, 170) if self.kind == "AGM" else (190, 235, 255)
        pygame.draw.line(surface, body, (sx - hx * size * 1.6, sy - hy * size * 1.6),
                         (sx + hx * size * 1.6, sy + hy * size * 1.6), max(2, int(size * 0.7)))
        pygame.draw.circle(surface, (255, 170, 60), (int(sx - hx * size * 1.9), int(sy - hy * size * 1.9)),
                           max(1, int(size * 0.5)))
        draw_alt_label(surface, font, sx, sy, self.altitude, body)


class CrashingJet:
    """A shot-down jet: burning, spinning, losing speed and falling from 35,000 ft to the ground."""

    def __init__(self, jet: SquadronJet):
        self.callsign = jet.callsign
        self.paint = jet.get_paint()
        self.x, self.y = jet.x, jet.y
        self.heading = jet.heading
        self.vx = math.cos(jet.heading) * jet.speed
        self.vy = math.sin(jet.heading) * jet.speed
        self.altitude = jet.altitude
        self.fall_rate = 20.0
        self.trajectory = FlightTrajectory(color=(70, 66, 62), width=4, life=1200, spacing=3, max_points=400)

    def update(self, frame: int):
        self.x += self.vx
        self.y += self.vy
        self.vx *= 0.995
        self.vy *= 0.995
        self.heading += CRASH_SPIN
        self.fall_rate = min(200.0, self.fall_rate + 1.2)
        self.altitude = max(0.0, self.altitude - self.fall_rate)
        self.trajectory.record(self.x, self.y, frame)

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, frame: int, font):
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        if not on_screen(sx, sy):
            return
        scale = 0.35 + 0.65 * self.altitude / CRUISE_ALT_FT  # shrinks as it falls away from the camera
        model = pygame.transform.rotozoom(draw_jet_model_topdown(self.paint), -math.degrees(self.heading), scale)
        model.fill((150, 90, 70), special_flags=pygame.BLEND_RGB_MULT)  # scorched
        surface.blit(model, model.get_rect(center=(sx, sy)))
        flick = (frame // 3) % 3
        pygame.draw.circle(surface, (255, 140 + flick * 40, 40), (sx, sy), max(2, int(6 * scale)))
        draw_alt_label(surface, font, sx, sy, self.altitude, (255, 120, 90))


CANOPY_COLORS = [(230, 60, 60), (245, 140, 40), (245, 220, 60), (70, 190, 80),
                 (60, 140, 230), (80, 70, 200), (160, 80, 210)]  # 7-colour parachute


class EjectedPilot:
    """Ejection seat fires clear of the wreck, the 7-colour canopy opens and the pilot floats down."""
    FREEFALL_FRAMES = 60
    LANDED_FRAMES = 360

    def __init__(self, jet: SquadronJet):
        self.callsign = jet.callsign
        side = jet.heading + math.pi / 2
        self.x, self.y = jet.x, jet.y
        self.vx = math.cos(jet.heading) * jet.speed * 0.6 + math.cos(side) * 0.8
        self.vy = math.sin(jet.heading) * jet.speed * 0.6 + math.sin(side) * 0.8
        self.altitude = jet.altitude
        self.freefall = self.FREEFALL_FRAMES if jet.altitude > 12000 else 15  # low ejection: chute at once
        self.age = 0
        self.landed_for = 0

    @property
    def chute_open(self) -> bool:
        return self.age > self.freefall

    @property
    def gone(self) -> bool:
        return self.landed_for > self.LANDED_FRAMES

    def update(self):
        self.age += 1
        if self.altitude <= 0:
            self.landed_for += 1
            return
        if self.chute_open:  # canopy: slow descent, drifting with the wind
            self.vx += (WIND[0] * 0.5 - self.vx) * 0.03
            self.vy += (WIND[1] * 0.5 - self.vy) * 0.03
            self.altitude = max(0.0, self.altitude - 45.0)
        else:
            self.vx *= 0.97
            self.vy *= 0.97
            self.altitude -= 110.0
        self.x += self.vx
        self.y += self.vy

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, font):
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        if not on_screen(sx, sy):
            return
        if not self.chute_open:
            pygame.draw.circle(surface, (60, 60, 60), (sx, sy), 3)          # seat + pilot tumbling
            pygame.draw.circle(surface, (255, 200, 80), (sx, sy), 1)
        elif self.altitude > 0:
            r = 5 + int(9 * self.altitude / CRUISE_ALT_FT)                  # smaller as it sinks away
            step = 2 * math.pi / len(CANOPY_COLORS)
            for k, col in enumerate(CANOPY_COLORS):
                a0 = k * step + self.age * 0.01
                pts = [(sx, sy)] + [(sx + math.cos(a0 + step * t / 4) * r, sy + math.sin(a0 + step * t / 4) * r) for t in range(5)]
                pygame.draw.polygon(surface, col, pts)
            pygame.draw.circle(surface, (250, 250, 250), (sx, sy), r, 1)
            pygame.draw.circle(surface, (40, 40, 40), (sx, sy), 2)
        else:                                                                # canopy spread on the ground
            for k, col in enumerate(CANOPY_COLORS):
                surface.fill(col, (sx - 7 + k * 2, sy - 2, 2, 5))
            pygame.draw.circle(surface, (40, 40, 40), (sx - 10, sy), 2)
        if self.altitude > 0:
            draw_alt_label(surface, font, sx, sy, self.altitude, (255, 255, 255))


class DroppedBomb:
    def __init__(self, x: float, y: float, heading: float, spd: float, altitude: float = CRUISE_ALT_FT):
        self.x, self.y = x, y
        self.vx = math.cos(heading) * spd
        self.vy = math.sin(heading) * spd
        self.altitude = altitude
        self.fall_rate = 30.0  # ft/frame, gravity builds it up to terminal velocity
        self.trajectory = FlightTrajectory(color=(255, 230, 100), width=1, life=600, spacing=2, max_points=300)
        # where it will land (same physics run ahead), marked on the ground while it falls
        x, y, vx, vy, alt, fall = self.x, self.y, self.vx, self.vy, self.altitude, self.fall_rate
        while alt > 0:
            x, y, vx, vy = x + vx, y + vy, vx * 0.997, vy * 0.997
            fall = min(260.0, fall + 2.2)
            alt -= fall
        self.impact = (x, y)

    def update(self, frame: int):
        self.x += self.vx
        self.y += self.vy
        self.vx *= 0.997
        self.vy *= 0.997
        self.fall_rate = min(260.0, self.fall_rate + 2.2)
        self.altitude = max(0.0, self.altitude - self.fall_rate)
        self.trajectory.record(self.x, self.y, frame)

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, font):
        ix, iy = int(self.impact[0] - cam_x), int(self.impact[1] - cam_y)
        pygame.draw.circle(surface, (255, 90, 70), (ix, iy), 7, 1)
        pygame.draw.line(surface, (255, 90, 70), (ix - 10, iy), (ix + 10, iy), 1)
        pygame.draw.line(surface, (255, 90, 70), (ix, iy - 10), (ix, iy + 10), 1)
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        r = max(1, round(1 + 5 * (self.altitude / CRUISE_ALT_FT)))  # shrinks as it falls away from the camera
        pygame.draw.circle(surface, (255, 220, 90), (sx, sy), r)
        pygame.draw.circle(surface, (90, 70, 20), (sx, sy), r, 1)
        draw_alt_label(surface, font, sx, sy, self.altitude, (255, 225, 120))


# ==============================================================================
# REAL SKY: CLOUDS, HELICOPTERS, LOW-ALTITUDE GROUND DETAIL, AEROBATICS
# ==============================================================================
PUFF_TINTS = {"lit": (255, 255, 255), "mid": (232, 236, 244), "shade": (196, 204, 220)}


@functools.lru_cache(maxsize=256)
def cloud_puff(radius: int, tint: str) -> pygame.Surface:
    """One soft puff: dense in the middle, fading smoothly to nothing at the edge."""
    surf = pygame.Surface((radius * 2, radius * 2), pygame.SRCALPHA)
    col = PUFF_TINTS[tint]
    for r in range(radius, 0, -1):
        a = int(70 * (1.0 - r / radius) ** 1.6)
        pygame.draw.circle(surf, (*col, a), (radius, radius), r)
    return surf


class Cloud:
    """Cumulus seen from above, at its own altitude, drifting with the wind: a few soft cells built from
    many fading puffs (sunlit side white, underside grey); it throws a shadow on the ground."""

    def __init__(self, rng: random.Random, world_w: int, world_h: int):
        self.world_w, self.world_h = world_w, world_h
        self.x, self.y = rng.uniform(0, world_w), rng.uniform(0, world_h)
        self.altitude = rng.uniform(6000, 28000)
        field = rng.random() < 0.35  # a field of small fair-weather cumulus, else one bigger heap
        w = rng.randint(160, 300) if field else rng.randint(90, 220)
        h = int(w * rng.uniform(0.55, 0.85))
        self.surf = pygame.Surface((w, h), pygame.SRCALPHA)
        cells = []
        for _ in range(rng.randint(4, 8) if field else rng.randint(2, 4)):
            size = rng.uniform(0.07, 0.12) * w if field else rng.uniform(0.12, 0.2) * w
            cells.append((rng.uniform(size * 1.6, w - size * 1.6), rng.uniform(size * 1.6, h - size * 1.6), size))
        for cx, cy, size in cells:
            for _ in range(int(size * 2.2) + 6):
                dx, dy = rng.gauss(0, size * 0.5), rng.gauss(0, size * 0.4)
                d = math.hypot(dx / size, dy / size)
                if d > 1.6:  # no stray specks around the cell
                    continue
                r = max(6, int(size * rng.uniform(0.4, 0.8) * max(0.4, 1.0 - d * 0.45)))
                side = (dx + dy) / size  # sun from the top left: that side bright, the far side grey
                tint = "lit" if side < -0.25 else ("shade" if side > 0.35 else "mid")
                px, py = int(cx + dx - r), int(cy + dy - r)
                if 0 <= px <= w - 2 * r and 0 <= py <= h - 2 * r:
                    self.surf.blit(cloud_puff(r, tint), (px, py))
        self.scaled = {}  # (zoom, night) -> smooth-scaled copy for the screen
        self.shadow = self.surf.copy()
        self.shadow.fill((0, 0, 0, 110), special_flags=pygame.BLEND_RGBA_MULT)
        self.surf_night = self.surf.copy()  # moonlit: dim blue-grey
        self.surf_night.fill((70, 78, 104, 255), special_flags=pygame.BLEND_RGBA_MULT)
        self.shadow_off = int(self.altitude / 1000 * 1.5)  # low sun: higher cloud, longer shadow offset

    def update(self):
        self.x = (self.x + WIND[0] * 0.25) % self.world_w
        self.y = (self.y + WIND[1] * 0.25) % self.world_h

    def visible(self, cam_x: float, cam_y: float, view_w: float, view_h: float) -> bool:
        w, h = self.surf.get_size()
        return (cam_x - w - 60 < self.x < cam_x + view_w + 20 and cam_y - h - 60 < self.y < cam_y + view_h + 20)

    def at_scale(self, scale: float, night: bool, shadow: bool = False) -> pygame.Surface:
        """Smooth-scaled for the screen (cached per zoom step), so it stays soft when the view zooms in."""
        key = (round(scale * 20) / 20, night, shadow)
        surf = self.scaled.get(key)
        if surf is None:
            src = self.shadow if shadow else (self.surf_night if night else self.surf)
            w, h = src.get_size()
            surf = src if key[0] == 1.0 else pygame.transform.smoothscale(src, (max(1, int(w * key[0])), max(1, int(h * key[0]))))
            if len(self.scaled) > 6:
                self.scaled.clear()
            self.scaled[key] = surf
        return surf


@functools.lru_cache(maxsize=1)
def draw_heli_model():
    surf = pygame.Surface((30, 30), pygame.SRCALPHA)
    pygame.draw.line(surf, (56, 64, 48), (3, 15), (18, 15), 3)          # tail boom
    pygame.draw.line(surf, (40, 40, 40), (3, 11), (3, 19), 2)           # tail rotor
    pygame.draw.ellipse(surf, (74, 84, 60), (13, 9, 15, 12))            # cabin
    pygame.draw.ellipse(surf, (120, 170, 190), (22, 12, 5, 6))          # canopy glass
    return surf


class Helicopter:
    """Low, slow helicopters shuttling between cities and airbases."""

    def __init__(self, rng: random.Random, country: "CountryLandscape"):
        self.rng, self.country = rng, country
        self.x, self.y = self.waypoint()
        self.target = self.waypoint()
        self.heading = rng.uniform(0, 2 * math.pi)
        self.altitude = rng.uniform(600, 2500)
        self.speed = rng.uniform(0.18, 0.28)

    def waypoint(self):
        if self.rng.random() < 0.4:
            ax, ay = self.rng.choice(self.country.airbases)
            return ax + self.rng.uniform(-100, 100), ay + self.rng.uniform(-60, 60)
        c = self.rng.choice(self.country.cities)
        return c["x"] + self.rng.uniform(-400, 400), c["y"] + self.rng.uniform(-400, 400)

    def update(self):
        tx, ty = self.target
        if math.hypot(tx - self.x, ty - self.y) < 30:
            self.target = self.waypoint()
        self.heading += max(-0.02, min(0.02, angle_diff(math.atan2(ty - self.y, tx - self.x), self.heading)))
        self.x += math.cos(self.heading) * self.speed
        self.y += math.sin(self.heading) * self.speed

    def draw(self, surface: pygame.Surface, cam_x: int, cam_y: int, frame: int, night: bool = False):
        sx, sy = int(self.x - cam_x), int(self.y - cam_y)
        if not on_screen(sx, sy):
            return
        rot = pygame.transform.rotate(draw_heli_model(), -math.degrees(self.heading))
        if night:
            rot.fill((90, 96, 120), special_flags=pygame.BLEND_RGB_MULT)
        surface.blit(rot, rot.get_rect(center=(sx, sy)))
        a = frame * 0.55  # main rotor
        for k in range(2):
            dx, dy = math.cos(a + k * math.pi / 2) * 12, math.sin(a + k * math.pi / 2) * 12
            pygame.draw.line(surface, (28, 28, 28) if not night else (70, 74, 90), (sx - dx, sy - dy), (sx + dx, sy + dy), 1)
        if night and (frame + int(self.x)) % 50 < 8:  # red anti-collision beacon
            pygame.draw.circle(surface, (255, 60, 50), (sx, sy), 2)


CAR_COLORS = [(210, 60, 50), (230, 230, 230), (60, 90, 170), (40, 40, 40), (220, 190, 70)]


def draw_ground_detail(surface: pygame.Surface, country: "CountryLandscape", cam_x: float, cam_y: float,
                       zoom: float, frame: int, night: bool = False):
    """Seen from low altitude only: trees and shrubs, traffic on the highways, boats on the sea (screen scale)."""
    view_w, view_h = SCREEN_W / zoom, SCREEN_H / zoom
    cell = 40
    for gx in range(int(cam_x // cell) * cell, int(cam_x + view_w) + cell, cell):
        for gy in range(int(cam_y // cell) * cell, int(cam_y + view_h) + cell, cell):
            h = (gx * 73856093 ^ gy * 19349663 ^ 0x5BD1E995) & 0xFFFFFF
            wx, wy = gx + h % cell, gy + (h >> 8) % cell
            sx, sy = (wx - cam_x) * zoom, (wy - cam_y) * zoom
            coast = country.coast_x(wy)
            if wx < coast - 30:
                if h % 29 == 0:  # a boat under way with its wake
                    hd = ((h >> 4) % 628) / 100.0
                    bx, by = math.cos(hd), math.sin(hd)
                    t = (frame * 0.05 + h % 97) % 80
                    px, py = sx + bx * t * zoom, sy + by * t * zoom
                    for side in (-1, 1):
                        pygame.draw.line(surface, (190, 214, 230), (px, py),
                                         (px - (bx * 12 - side * by * 5) * zoom, py - (by * 12 + side * bx * 5) * zoom), 1)
                    pygame.draw.line(surface, (236, 236, 228) if not night else (60, 62, 70),
                                     (px - bx * 2 * zoom, py - by * 2 * zoom),
                                     (px + bx * 2 * zoom, py + by * 2 * zoom), max(2, int(zoom)))
                    if night:  # deck and mast lights
                        pygame.draw.circle(surface, (255, 236, 170), (px, py), max(1, int(zoom * 0.6)))
                continue
            if wx < coast + 8 or any(math.hypot(c["x"] - wx, c["y"] - wy) < c["r"] * 1.05 for c in country.cities):
                continue
            if country.is_desert(wx, wy):
                if h % 4 == 0:
                    pygame.draw.circle(surface, (112, 102, 62) if not night else (30, 30, 30), (sx, sy), max(1, int(zoom * 0.9)))
            elif country.is_highland(wx, wy):
                if h % 3 == 0:  # pines on the slopes
                    pygame.draw.circle(surface, (28, 44, 32) if not night else (8, 12, 12), (sx, sy), max(2, int(zoom * 1.3)))
            else:
                for k in range(h % 5):  # trees: shadow, crown, sunlit spot (dark silhouettes at night)
                    tx = sx + (((h >> (k * 3)) % 9) - 4) * zoom * 2
                    ty = sy + (((h >> (k * 3 + 1)) % 9) - 4) * zoom * 2
                    r = max(2, int(zoom * (1.2 + ((h >> k) & 1))))
                    if night:
                        pygame.draw.circle(surface, (8, 14, 14), (tx, ty), r)
                        continue
                    pygame.draw.circle(surface, (18, 34, 22), (tx + r // 2, ty + r // 2), r)
                    pygame.draw.circle(surface, (36, 76, 40) if k % 2 else (46, 86, 46), (tx, ty), r)
                    pygame.draw.circle(surface, (72, 112, 62), (tx - r // 3, ty - r // 3), max(1, r // 3))
    # traffic on the highways, both directions
    for (x1, y1), (x2, y2) in country.highways:
        seg = math.hypot(x2 - x1, y2 - y1)
        if max(x1, x2) < cam_x or min(x1, x2) > cam_x + view_w or max(y1, y2) < cam_y or min(y1, y2) > cam_y + view_h:
            continue
        nx, ny = -(y2 - y1) / seg, (x2 - x1) / seg
        cars = int(seg / 70)
        for k in range(cars):
            way = 1 if k % 2 else -1
            t = (k / cars + way * frame * 0.25 / seg) % 1.0
            cx = (x1 + (x2 - x1) * t + nx * way * 0.8 - cam_x) * zoom
            cy = (y1 + (y2 - y1) * t + ny * way * 0.8 - cam_y) * zoom
            if 0 <= cx <= SCREEN_W and 0 <= cy <= SCREEN_H:
                if night:  # headlights one way, tail lights the other
                    pygame.draw.circle(surface, (255, 244, 210) if way > 0 else (235, 40, 30), (cx, cy), max(1, int(zoom * 0.6)))
                else:
                    pygame.draw.circle(surface, CAR_COLORS[k % len(CAR_COLORS)], (cx, cy), max(1, int(zoom * 0.7)))


def draw_player_jet(surface: pygame.Surface, jet: "SquadronJet", sx: int, sy: int, heading: float, pitch: float):
    """The jet you fly, with its aerobatic attitude: rolls narrow the wings (underside shows when inverted),
    pitch foreshortens the fuselage, and the top of a loop brings it closer to the camera."""
    model = draw_jet_model_topdown(jet.get_paint())
    c = math.cos(jet.roll)
    w = max(8, int(38 * max(0.22, abs(pitch))))
    h = max(5, int(38 * max(0.14, abs(c))))
    scale = 1.0 + jet.aero_alt / 10000.0
    m = pygame.transform.smoothscale(model, (int(w * scale), int(h * scale)))
    if c < 0:  # inverted: we see its belly
        m.fill((140, 140, 150), special_flags=pygame.BLEND_RGB_MULT)
    rot = pygame.transform.rotozoom(m, -math.degrees(heading), 1.0)  # smooth edges
    surface.blit(rot, rot.get_rect(center=(sx, sy)))


def add_blast(blasts: list, x: float, y: float, radius: float, life: int = 40, flare: bool = False):
    blasts.append({"x": x, "y": y, "r": radius, "age": 0, "life": life, "flare": flare})


def draw_blasts(overlay: pygame.Surface, blasts: list, cam_x: int, cam_y: int):
    for b in blasts:
        frac = b["age"] / b["life"]
        r = max(1, int(b["r"] * (0.3 + 0.7 * frac)))
        a = int(230 * (1.0 - frac))
        c = (int(b["x"] - cam_x), int(b["y"] - cam_y))
        if not on_screen(c[0], c[1], r):
            continue
        if b.get("flare"):  # white-hot decoy flare
            pygame.draw.circle(overlay, (255, 255, 235, a), c, max(1, r // 3))
            pygame.draw.circle(overlay, (255, 240, 200, a // 3), c, r)
            continue
        pygame.draw.circle(overlay, (255, 140, 40, a // 2), c, r)
        pygame.draw.circle(overlay, (255, 225, 140, a), c, r, 2)


def draw_fires(overlay: pygame.Surface, fires: list, cam_x: int, cam_y: int, frame: int):
    """Burning ground targets: a flickering core and a smoke plume drifting with the wind."""
    for f in fires:
        sx, sy = f["x"] - cam_x, f["y"] - cam_y
        if not on_screen(sx, sy, 160):
            continue
        fade = min(1.0, (f["life"] - f["age"]) / 240)
        for k in range(6):
            t = (f["age"] + k * 22) % 132
            r = int(f["size"] * (0.5 + t / 50))
            a = int(120 * (1.0 - t / 132) * fade)
            pygame.draw.circle(overlay, (58, 56, 54, a), (int(sx + WIND[0] * t), int(sy + WIND[1] * t)), r)
        flick = (frame * 7 + int(f["x"])) % 5
        pygame.draw.circle(overlay, (255, 120 + flick * 20, 30, int(220 * fade)), (int(sx), int(sy)), max(2, int(f["size"] * 0.45)))


# ==============================================================================
# MAIN ASYNC LOOP WITH 100 PROGRESSIVE LEVELS
# ==============================================================================
async def main():
    if ON_PHONE:  # the whole phone screen, the picture scaled to fit
        screen = pygame.display.set_mode((SCREEN_W, SCREEN_H), pygame.SCALED | pygame.FULLSCREEN)
    else:
        screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Jet vs Missile - Stratospheric Command (35,000 FT)")
    clock = pygame.time.Clock()

    font = pygame.font.SysFont("consolas", 12, bold=True)
    small_font = pygame.font.SysFont("consolas", 10, bold=True)
    big_font = pygame.font.SysFont("consolas", 16, bold=True)

    country = CountryLandscape(world_w=WORLD_W, world_h=WORLD_H)
    overlay = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
    war_rng = random.Random(35000)

    # 10 high-altitude aircraft: you fly one, the rest patrol in 4 flights of their own
    squadron = [SquadronJet(i, 0, 0, (i * 36) % 360, CALLSIGNS[i]) for i in range(10)]
    lead = squadron[0]
    lead.x, lead.y = 2000.0, 2400.0
    flights = [{"name": n, "ids": ids, "style": st} for n, ids, st in FLIGHTS]
    flight_of = {i: f for f in flights for i in f["ids"]}

    def pick_station(flight, avoid):
        # stations lie in the war zone around the eastern front, far from the jet you fly
        for _ in range(400):
            y = war_rng.uniform(700, country.world_h - 600)
            x = war_rng.uniform(max(country.coast_x(y) + 600, country.border_x(y) - 2600),
                                min(country.world_w - 900, country.border_x(y) + 700))
            if (math.hypot(x - avoid[0][0], y - avoid[0][1]) > FLIGHT_STANDOFF + 300 and
                    all(math.hypot(x - ax, y - ay) > 1200 for ax, ay in avoid[1:])):
                break
        else:  # the player sits in the war zone: use the far west instead
            y = war_rng.uniform(700, country.world_h - 600)
            x = country.coast_x(y) + 900 if avoid[0][0] > country.world_w / 2 else country.world_w - 1200
        a = war_rng.uniform(0, math.pi)
        flight["track"] = [(x + math.cos(a) * CAP_RACETRACK, y + math.sin(a) * CAP_RACETRACK),
                           (x - math.cos(a) * CAP_RACETRACK, y - math.sin(a) * CAP_RACETRACK)]
        flight["station"] = (x, y)
        flight["wp"] = 0
        flight["retask"] = CAP_RETASK_FRAMES + war_rng.randint(0, 1200)

    def flight_members(flight):
        """Alive members of a flight minus the jet you pilot; the first one leads."""
        return [squadron[i] for i in flight["ids"] if i != active_jet_idx and squadron[i].alive]

    active_jet_idx = 0
    for f in flights:
        pick_station(f, [(lead.x, lead.y)] + [g["station"] for g in flights if "station" in g])
        members = flight_members(f)
        if members:
            (x0, y0), (x1, y1) = f["track"]
            members[0].x, members[0].y = x0, y0
            members[0].heading = math.atan2(y1 - y0, x1 - x0)
            for rank, jet in enumerate(members[1:]):
                jet.x, jet.y = formation_slot(members[0], rank, f["style"])
                jet.heading = members[0].heading

    current_level = 1

    active_missiles = []   # SAMs
    jet_missiles = []      # AGM / AAM released from the squadron
    dropped_bombs = []
    blasts = []
    fires = []             # burning ground targets
    crashing = []          # shot-down jets falling to the ground
    pilots = []            # ejected pilots under their parachutes
    craters = deque(maxlen=150)
    drones = [Drone(war_rng, country, from_border=False) for _ in range(DRONE_COUNT)]
    drone_respawns = []    # frames left until a replacement drone crosses the border
    convoys = []           # supply columns driving the highways toward the front
    for k in range(10):
        p1, p2 = country.highways[k % len(country.highways)]
        convoys.append({"p1": p1, "p2": p2, "t": war_rng.random(), "dir": war_rng.choice((-1, 1)),
                        "len": max(1.0, math.hypot(p2[0] - p1[0], p2[1] - p1[1]))})
    messages = deque(maxlen=5)  # [text, frames left]
    flare_cd = 0
    ecm_cd = 0
    sky_rng = random.Random(4242)
    clouds = [Cloud(sky_rng, country.world_w, country.world_h) for _ in range(CLOUD_COUNT)]
    helis = [Helicopter(sky_rng, country) for _ in range(HELI_COUNT)]
    aero_next = 0
    ecm_flash = [0]        # frames of the jamming ring around your jet
    layer_cache = {}       # view size -> (ground surface, alpha layer) while zoomed in
    # Controls rows for the bottom bar (title, keys bright, controller buttons cyan, action grey), drawn once
    def make_hints_row(title, title_col, hints):
        pieces = [small_font.render(title, True, title_col)]
        for key, pad, action in hints:
            pieces += [small_font.render(key, True, (235, 235, 240)),
                       small_font.render("/" + pad if pad != "-" else "", True, (110, 200, 235)),
                       small_font.render(" " + action, True, (150, 160, 175))]
        gap = small_font.size("   ")[0]
        width = sum(p.get_width() for p in pieces) + gap * len(hints)
        row = pygame.Surface((width, small_font.get_height()), pygame.SRCALPHA)
        x = 0
        for k, p in enumerate(pieces):
            row.blit(p, (x, 0))
            x += p.get_width() + (gap if k % 3 == 0 else 0)
        if width > SCREEN_W - 16:  # keep it inside the bar
            row = pygame.transform.smoothscale(row, (SCREEN_W - 16, int(row.get_height() * (SCREEN_W - 16) / width)))
        return row

    hints_row = make_hints_row("P1 JET:", CYAN, CONTROL_HINTS)
    p2_hints_row = make_hints_row("P2 LAUNCHERS:", (255, 210, 60), P2_HINTS)

    # Blue sky: the air between you and the ground, thicker toward the edges (the horizon side);
    # it fades in the higher you fly and deepens over the top of a loop
    sky_haze = pygame.Surface((SCREEN_W, LEVEL_BAR_TOP), pygame.SRCALPHA)
    sky_haze.fill((118, 172, 236, SKY_HAZE_CENTRE))
    for k in range(0, SKY_HAZE_EDGE_BAND, 4):
        a = SKY_HAZE_CENTRE + int((SKY_HAZE_EDGE - SKY_HAZE_CENTRE) * (1 - k / SKY_HAZE_EDGE_BAND))
        pygame.draw.rect(sky_haze, (110, 166, 234, a), (k, k, SCREEN_W - 2 * k, LEVEL_BAR_TOP - 2 * k), 4)
    night_haze = sky_haze.copy()  # night sky: deep navy, lighter in the middle so the lights below show
    night_haze.fill((26, 34, 70, 180), special_flags=pygame.BLEND_RGBA_MULT)

    # the camera tracks a centre point; the view size follows the altitude of the jet you fly
    cam_cx, cam_cy = lead.x, lead.y
    cam_x, cam_y = cam_cx - SCREEN_W * 0.5, cam_cy - SCREEN_H * 0.5
    frame = 0

    def say(text):
        messages.append([text, 180])

    def next_alive(start, step=1):
        for k in range(1, len(squadron) + 1):
            j = (start + k * step) % len(squadron)
            if squadron[j].alive:
                return j
        return start

    # Game controllers: plugged in now or later (desktop SDL and browser layouts both covered)
    pads = {}  # instance id -> ("ctrl", Controller) or ("joy", Joystick)
    two_player = False     # player 2 commands the launchers (arrow keys / second controller)
    night = False          # day / night view (T, touchpad click, bottom-bar button)
    touch_on = ON_PHONE    # touch controls showing
    stick_finger = None    # finger on the stick and where it points (x, y, each -1..1)
    stick_vec = (0.0, 0.0)
    touch_held = {}        # finger -> key of a held button (CLIMB / DIVE)
    touch_cache = [None, None]  # drawn controls, redrawn only when the pressed buttons change

    def finger_pos(event):
        """Finger position (0..1 of the window) -> game pixels, allowing for the black bars of a scaled screen."""
        try:
            ww, wh = pygame.display.get_window_size()
        except (AttributeError, pygame.error):
            ww, wh = SCREEN_W, SCREEN_H
        k = min(ww / SCREEN_W, wh / SCREEN_H)
        ox, oy = (ww - SCREEN_W * k) / 2, (wh - SCREEN_H * k) / 2
        return int((event.x * ww - ox) / k), int((event.y * wh - oy) / k)

    def touch_control_at(pos):
        if math.hypot(pos[0] - STICK_CENTRE[0], pos[1] - STICK_CENTRE[1]) < STICK_RADIUS * 1.5:
            return "STICK"
        for b in TOUCH_BUTTONS:
            if math.hypot(pos[0] - b[2][0], pos[1] - b[2][1]) < b[3] + 8:
                return b
        return None

    def set_stick(pos):
        dx, dy = (pos[0] - STICK_CENTRE[0]) / STICK_RADIUS, (pos[1] - STICK_CENTRE[1]) / STICK_RADIUS
        d = math.hypot(dx, dy)
        return (dx / d, dy / d) if d > 1 else (dx, dy)

    def draw_touch_controls(surface):
        pressed = frozenset(touch_held.values())
        if touch_cache[0] != pressed or touch_cache[1] is None:
            layer_t = pygame.Surface((SCREEN_W, LEVEL_BAR_TOP), pygame.SRCALPHA)
            pygame.draw.circle(layer_t, (10, 20, 34, 90), STICK_CENTRE, STICK_RADIUS)
            pygame.draw.circle(layer_t, (0, 230, 255, 150), STICK_CENTRE, STICK_RADIUS, 2)
            for label, key, c, r, held in TOUCH_BUTTONS:
                on = key in pressed
                fill = (255, 170, 40, 170) if on else ((10, 20, 34, 120) if held else (120, 20, 20, 120))
                pygame.draw.circle(layer_t, fill, c, r)
                pygame.draw.circle(layer_t, (255, 255, 255, 190), c, r, 2)
                lbl = font.render(label, True, (255, 255, 255))
                layer_t.blit(lbl, lbl.get_rect(center=c))
            touch_cache[:] = [pressed, layer_t]
        surface.blit(touch_cache[1], (0, 0))
        kx, ky = STICK_CENTRE[0] + stick_vec[0] * STICK_RADIUS * 0.7, STICK_CENTRE[1] + stick_vec[1] * STICK_RADIUS * 0.7
        pygame.draw.circle(surface, (0, 230, 255) if stick_finger is not None else (90, 130, 160), (int(kx), int(ky)), 30)
        pygame.draw.circle(surface, (255, 255, 255), (int(kx), int(ky)), 30, 2)
    p2_sel = None          # the launcher player 2 has picked
    p2_cd = 0

    def open_pad(device_index):
        if sdl_controller is not None and sdl_controller.is_controller(device_index):
            ctrl = sdl_controller.Controller(device_index)
            iid = ctrl.as_joystick().get_instance_id()
            if iid not in pads:
                pads[iid] = ("ctrl", ctrl)
                return ctrl.name
        else:
            joy = pygame.joystick.Joystick(device_index)
            if joy.get_instance_id() not in pads:
                pads[joy.get_instance_id()] = ("joy", joy)
                return joy.get_name()
        return None

    for i in range(pygame.joystick.get_count()):
        open_pad(i)

    def p2_pad_id():
        """In 2-player mode the second controller plugged in belongs to player 2 (the launchers)."""
        return sorted(pads)[1] if two_player and len(pads) >= 2 else None

    def p1_pads():
        return [v for iid, v in pads.items() if iid != p2_pad_id()]

    def pad_steer():
        """Left stick, then d-pad -> (x, y) direction."""
        for kind, pad in p1_pads():
            if kind == "ctrl":
                ax = pad.get_axis(pygame.CONTROLLER_AXIS_LEFTX) / 32767
                ay = pad.get_axis(pygame.CONTROLLER_AXIS_LEFTY) / 32767
                if math.hypot(ax, ay) > PAD_DEADZONE:
                    return ax, ay
                bx = pad.get_button(pygame.CONTROLLER_BUTTON_DPAD_RIGHT) - pad.get_button(pygame.CONTROLLER_BUTTON_DPAD_LEFT)
                by = pad.get_button(pygame.CONTROLLER_BUTTON_DPAD_DOWN) - pad.get_button(pygame.CONTROLLER_BUTTON_DPAD_UP)
                if bx or by:
                    return bx, by
                continue
            if pad.get_numaxes() >= 2:
                ax, ay = pad.get_axis(0), pad.get_axis(1)
                if math.hypot(ax, ay) > PAD_DEADZONE:
                    return ax, ay
            if pad.get_numhats() > 0:
                hx, hy = pad.get_hat(0)
                if hx or hy:
                    return hx, -hy
            if pad.get_numbuttons() > 15:
                bx = pad.get_button(15) - pad.get_button(14)
                by = pad.get_button(13) - pad.get_button(12)
                if bx or by:
                    return bx, by
        return 0, 0

    def pad_triggers():
        """(climb, descend) from RT/R2 and LT/L2."""
        climb = dive = False
        for kind, pad in p1_pads():
            if kind == "ctrl":
                climb |= pad.get_axis(pygame.CONTROLLER_AXIS_TRIGGERRIGHT) > 8000
                dive |= pad.get_axis(pygame.CONTROLLER_AXIS_TRIGGERLEFT) > 8000
            elif pad.get_numbuttons() > 7:  # browser standard layout: 6 = LT, 7 = RT
                climb |= bool(pad.get_button(7))
                dive |= bool(pad.get_button(6))
        return climb, dive

    def p2_candidates():
        """Launchers player 2 can pick: alive and near the jet, in clockwise order around it."""
        jet = squadron[active_jet_idx]
        near = [s for s in country.launchers if s["hp"] > 0
                and math.hypot(s["x"] - jet.x, s["y"] - jet.y) < P2_PICK_RANGE]
        return sorted(near, key=lambda s: math.atan2(s["y"] - jet.y, s["x"] - jet.x))

    def nearest_armed_site(x, y, max_dist=None):
        armed = [s for s in country.launchers if s["hp"] > 0 and s["missiles"] > 0]
        if not armed:
            return None
        site = min(armed, key=lambda s: math.hypot(s["x"] - x, s["y"] - y))
        if max_dist is not None and math.hypot(site["x"] - x, site["y"] - y) > max_dist:
            return None
        return site

    def launch_sam(site, target, auto, guided=None):
        site["missiles"] -= 1
        site["flash"] = 24
        site["cd"] = SAM_SITE_RELOAD
        site["seen"] = TEL_REVEAL_FRAMES  # the launch gives a hidden launcher away
        if guided is None:
            guided = war_rng.random() < SAM_GUIDED_SHARE
        active_missiles.append(SAMMissile(site, target, speed_factor * SAM_SPEED_VS_JET, auto, guided=guided))
        if not auto or on_screen(site["x"] - cam_x, site["y"] - cam_y):
            SFX.snd_ignite.play()

    def fire_jet_missile(jet, kind):
        if kind == "AGM":
            targets = [s for s in country.launchers if s["hp"] > 0 and launcher_visible(s)]  # only what you can see
            pos = (lambda s: (s["x"], s["y"]))
            reach = AGM_RANGE
        else:
            targets = [d for d in drones if d.alive]
            pos = (lambda d: (d.x, d.y))
            reach = AAM_RANGE if jet is squadron[active_jet_idx] else WINGMAN_AAM_RANGE
        if not targets:
            return None
        tgt = min(targets, key=lambda t: math.hypot(pos(t)[0] - jet.x, pos(t)[1] - jet.y))
        if math.hypot(pos(tgt)[0] - jet.x, pos(tgt)[1] - jet.y) > reach:
            return None
        jet_missiles.append(JetMissile(jet, kind, tgt, speed_factor * (3.0 if kind == "AGM" else 4.0)))
        jet.missile_cd = JET_MISSILE_RELOAD if jet is squadron[active_jet_idx] else WINGMAN_AAM_RELOAD
        return tgt

    def ground_hit(x, y, radius, damage, source):
        craters.append((x, y, int(radius * 0.35)))
        fires.append({"x": x, "y": y, "age": 0, "life": 1800, "size": 9})
        for s in country.launchers:
            if s["hp"] > 0 and math.hypot(s["x"] - x, s["y"] - y) < radius + (14 if s["kind"] == "SAM" else 8):
                s["hp"] = max(0, s["hp"] - damage)
                if s["hp"] == 0:
                    s["missiles"] = 0
                    fires.append({"x": s["x"], "y": s["y"], "age": 0, "life": 3600, "size": 14})
                    say(f"{s['name']} DESTROYED BY {source}")
                else:
                    say(f"{s['name']} DAMAGED BY {source}")

    running = True
    track("level_start", level=current_level)   # analytics: the first flight starts
    while running:
        frame += 1
        speed_factor = level_speed(current_level)
        cur_jet = squadron[active_jet_idx]
        icx, icy = int(round(cam_x)), int(round(cam_y))

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type in (pygame.JOYDEVICEADDED, pygame.CONTROLLERDEVICEADDED):
                name = open_pad(event.device_index)
                if name:
                    say(f"CONTROLLER CONNECTED: {name[:28].upper()}")
            elif event.type in (pygame.JOYDEVICEREMOVED, pygame.CONTROLLERDEVICEREMOVED):
                if pads.pop(event.instance_id, None) is not None:
                    say("CONTROLLER DISCONNECTED")
            elif event.type in (pygame.CONTROLLERBUTTONDOWN, pygame.JOYBUTTONDOWN):
                kind = pads.get(event.instance_id, ("joy", None))[0]
                table = CTRL_BUTTON_KEYS if event.type == pygame.CONTROLLERBUTTONDOWN else PAD_BUTTON_KEYS
                if event.instance_id == p2_pad_id():  # player 2's controller drives the launchers
                    table = P2_CTRL_KEYS if event.type == pygame.CONTROLLERBUTTONDOWN else P2_PAD_KEYS
                if (kind == "ctrl") == (event.type == pygame.CONTROLLERBUTTONDOWN) and event.button in table:
                    key, mod = table[event.button]  # a pad button does exactly what its key does
                    pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=key, mod=mod, unicode="", scancode=0))
            elif event.type == pygame.FINGERDOWN:
                touch_on = True
                pos = finger_pos(event)
                ctl = touch_control_at(pos) if pos[1] < LEVEL_BAR_TOP else None
                if ctl == "STICK":
                    stick_finger, stick_vec = event.finger_id, set_stick(pos)
                elif ctl is not None:
                    if ctl[4]:
                        touch_held[event.finger_id] = ctl[1]
                    else:  # a button does exactly what its key does
                        pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=ctl[1], mod=0, unicode="", scancode=0))
                else:  # bottom bar, radar and everything else: a tap is a click
                    pygame.event.post(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=pos, from_finger=True))
            elif event.type == pygame.FINGERMOTION:
                if event.finger_id == stick_finger:
                    stick_vec = set_stick(finger_pos(event))
            elif event.type == pygame.FINGERUP:
                if event.finger_id == stick_finger:
                    stick_finger, stick_vec = None, (0.0, 0.0)
                touch_held.pop(event.finger_id, None)
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_TAB:
                    active_jet_idx = next_alive(active_jet_idx, -1 if event.mod & pygame.KMOD_SHIFT else 1)
                    SFX.snd_switch.play()
                elif event.key == pygame.K_SPACE and cur_jet.alive:
                    dropped_bombs.append(DroppedBomb(cur_jet.x, cur_jet.y, cur_jet.heading, speed_factor * 0.9, cur_jet.altitude))
                    SFX.snd_shoot.play()
                elif event.key in (pygame.K_r, pygame.K_f) and cur_jet.alive:
                    kind = "AGM" if event.key == pygame.K_r else "AAM"
                    if cur_jet.missile_cd > 0:
                        say("MISSILE RAIL RELOADING")
                    elif fire_jet_missile(cur_jet, kind) is None:
                        say("NO BATTERY IN AGM RANGE" if kind == "AGM" else "NO DRONE IN AAM RANGE")
                    else:
                        SFX.snd_missile.play()
                elif event.key == pygame.K_v and cur_jet.alive and cur_jet.aero is None:
                    name, dur = AEROBATICS[aero_next % len(AEROBATICS)]
                    aero_next += 1
                    cur_jet.aero = {"kind": name, "t": 0, "dur": dur, "prev": 0.0}
                    SFX.snd_switch.play()
                elif event.key == pygame.K_c and cur_jet.alive and flare_cd > 0:
                    # ESCAPE key: flares when ready, otherwise the ECM jammer
                    if ecm_cd > 0:
                        say("COUNTERMEASURES RELOADING")
                    else:
                        ecm_cd = ECM_RELOAD
                        SFX.snd_ignite.play()
                        broken = 0
                        for m in active_missiles:
                            if (m.target is cur_jet and m.guided and m.decoy is None
                                    and math.hypot(m.x - cur_jet.x, m.y - cur_jet.y) < ECM_RANGE
                                    and war_rng.random() < ECM_BREAK_CHANCE):
                                # seeker jammed: the missile flies off on a false track and self-destructs
                                m.decoy = (m.x + math.cos(m.heading) * 400 + war_rng.uniform(-150, 150),
                                           m.y + math.sin(m.heading) * 400 + war_rng.uniform(-150, 150))
                                broken += 1
                        ecm_flash[0] = 40
                        say(f"ECM - {broken} LOCK BROKEN" if broken else "ECM")
                elif event.key == pygame.K_c and cur_jet.alive:
                    if flare_cd > 0:
                        say(f"FLARES RELOADING {flare_cd / 60:.1f} s")
                    else:
                        flare_cd = FLARE_RELOAD
                        SFX.snd_flare.play()
                        hx, hy = math.cos(cur_jet.heading), math.sin(cur_jet.heading)
                        spots = []
                        for k in range(6):
                            side = (k % 2 * 2 - 1) * (6 + k * 3)
                            fx_, fy_ = cur_jet.x - hx * (16 + k * 10) - hy * side, cur_jet.y - hy * (16 + k * 10) + hx * side
                            spots.append((fx_, fy_))
                            add_blast(blasts, fx_, fy_, 10, 70, flare=True)
                        pulled = 0
                        for m in active_missiles:
                            if (m.guided and m.decoy is None and m.altitude > m.alt_goal * 0.5
                                    and math.hypot(m.x - cur_jet.x, m.y - cur_jet.y) < FLARE_RANGE
                                    and war_rng.random() < FLARE_DECOY_CHANCE):
                                m.decoy = war_rng.choice(spots)
                                pulled += 1
                        say(f"FLARES - {pulled} SAM DECOYED" if pulled else "FLARES")
                elif event.key == pygame.K_m and cur_jet.alive:
                    site = nearest_armed_site(cur_jet.x, cur_jet.y)
                    if site is not None:
                        launch_sam(site, cur_jet, auto=False)
                        say(f"{site['name']} LAUNCH -> {cur_jet.callsign}")
                    else:
                        say("NO SAM RESERVE LEFT")
                elif event.key == pygame.K_t:
                    night = not night
                elif event.key == pygame.K_2:
                    two_player = not two_player
                    p2_sel = None
                    say("2 PLAYERS: PLAYER 2 COMMANDS THE LAUNCHERS" if two_player else "1 PLAYER")
                elif two_player and event.key in (pygame.K_LEFT, pygame.K_RIGHT):
                    cands = p2_candidates()
                    if cands:
                        step = 1 if event.key == pygame.K_RIGHT else -1
                        p2_sel = cands[(cands.index(p2_sel) + step) % len(cands)] if p2_sel in cands else cands[0]
                elif two_player and event.key in (pygame.K_UP, pygame.K_DOWN):
                    guided = event.key == pygame.K_UP
                    if p2_sel is None or p2_sel["hp"] <= 0:
                        say("P2: NO LAUNCHER PICKED")
                    elif p2_sel["missiles"] <= 0:
                        say(f"P2: {p2_sel['name']} IS EMPTY")
                    elif p2_cd > 0:
                        say("P2: RELOADING")
                    elif not cur_jet.alive or math.hypot(cur_jet.x - p2_sel["x"], cur_jet.y - p2_sel["y"]) > p2_sel["range"]:
                        say(f"P2: JET OUT OF {p2_sel['name']} RANGE")
                    else:
                        launch_sam(p2_sel, cur_jet, auto=False, guided=guided)
                        p2_cd = P2_FIRE_GAP
                        say(f"P2: {p2_sel['name']} FIRES {'GUIDED' if guided else 'UNGUIDED'}")
                elif event.key == pygame.K_n:
                    current_level = min(MAX_LEVEL, current_level + 1)
                elif event.key == pygame.K_p:
                    current_level = max(1, current_level - 1)

            elif (event.type == pygame.MOUSEBUTTONDOWN and event.button == 1
                  and (getattr(event, "from_finger", False) or not getattr(event, "touch", False))):
                # (a click the system made from a finger is skipped: the finger handler above already sent it)
                mx, my = event.pos
                if my >= LEVEL_BAR_TOP:
                    if PREV_RECT.collidepoint(mx, my):
                        current_level = max(1, current_level - 1)
                    elif NEXT_RECT.collidepoint(mx, my):
                        current_level = min(MAX_LEVEL, current_level + 1)
                    elif NIGHT_RECT.collidepoint(mx, my):
                        night = not night
                    elif PLAYERS_RECT.collidepoint(mx, my):
                        pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_2, mod=0, unicode="", scancode=0))
                    elif TAB_RECT.collidepoint(mx, my):
                        active_jet_idx = next_alive(active_jet_idx)
                        SFX.snd_switch.play()
                else:
                    best, best_d = None, 30.0
                    on_map = MINIMAP_RECT.collidepoint(mx, my)  # far-away jets: pick them on the radar
                    for i, j in enumerate(squadron):
                        if not on_map:  # other jets are not drawn on the main view
                            break
                        d = 3.5 * math.hypot(MINIMAP_RECT.x + j.x * MINIMAP_RECT.w / country.world_w - mx,
                                             MINIMAP_RECT.y + j.y * MINIMAP_RECT.h / country.world_h - my)
                        if j.alive and d < best_d:
                            best, best_d = i, d
                    if best is not None:
                        active_jet_idx = best
                        SFX.snd_switch.play()

        speed_factor = level_speed(current_level)
        if not squadron[active_jet_idx].alive:
            active_jet_idx = next_alive(active_jet_idx)
        cur_jet = squadron[active_jet_idx]

        keys = pygame.key.get_pressed()
        turn_rate = speed_factor / 40.0  # ~40 px turn radius: wide stratospheric turns

        # Altitude: climb / descend (the view zooms in as the ground comes closer)
        climb, dive = pad_triggers()
        if keys[pygame.K_q] or keys[pygame.K_PAGEUP] or pygame.K_q in touch_held.values():
            climb = True
        if keys[pygame.K_e] or keys[pygame.K_PAGEDOWN] or pygame.K_e in touch_held.values():
            dive = True
        if cur_jet.alive and climb != dive:
            cur_jet.altitude = max(ALT_MIN, min(CRUISE_ALT_FT, cur_jet.altitude + (ALT_RATE if climb else -ALT_RATE)))
        zoom = zoom_for_altitude(cur_jet.altitude)
        view_w, view_h = int(round(SCREEN_W / zoom)), int(round(SCREEN_H / zoom))
        zx, zy = SCREEN_W / view_w, SCREEN_H / view_h

        # Gentle camera parallax (0.015 for realistic stratospheric floating)
        # (a jet you just switched to far away: the camera flies there quickly, then floats again)
        lag = CAMERA_LAG if math.hypot(cur_jet.x - cam_cx, cur_jet.y - cam_cy) < 400 else 0.08
        cam_cx += (cur_jet.x - cam_cx) * lag
        cam_cy += (cur_jet.y - cam_cy) * lag
        cam_cx = max(view_w * 0.5, min(country.world_w - view_w * 0.5, cam_cx))
        cam_cy = max(view_h * 0.5, min(country.world_h - view_h * 0.5, cam_cy))
        cam_x, cam_y = cam_cx - view_w * 0.5, cam_cy - view_h * 0.5
        icx, icy = int(round(cam_x)), int(round(cam_y))

        # Flying low you can make out camouflaged launchers close below
        if cur_jet.alive and cur_jet.altitude < LOW_ALT_SPOT:
            for s in country.tels:
                if s["camouflaged"] and s["hp"] > 0 and math.hypot(s["x"] - cur_jet.x, s["y"] - cur_jet.y) < LOW_ALT_SPOT_RANGE:
                    s["seen"] = max(s["seen"], 2)

        # Active jet: manual flight (an aerobatic manoeuvre flies itself until it ends)
        for jet in squadron:
            if jet is not cur_jet and jet.aero is not None:
                jet.aero, jet.roll, jet.aero_alt = None, 0.0, 0.0
        aero_heading, aero_pitch = cur_jet.heading, 1.0
        if cur_jet.alive and cur_jet.aero is not None:
            a = cur_jet.aero
            a["t"] += 1
            p = a["t"] / a["dur"]
            fx, fy = math.cos(cur_jet.heading), math.sin(cur_jet.heading)
            if a["kind"] == "LOOP":
                phase = 2 * math.pi * p
                along = LOOP_RADIUS * math.sin(phase)  # forward, back over the top, forward again
                cur_jet.x += fx * (along - a["prev"])
                cur_jet.y += fy * (along - a["prev"])
                a["prev"] = along
                cur_jet.aero_alt = LOOP_HEIGHT * (1 - math.cos(phase)) / 2
                aero_pitch = math.cos(phase)
                cur_jet.roll = math.pi if math.cos(phase) < 0 else 0.0  # inverted over the top
                if math.cos(phase) < 0:
                    aero_heading = cur_jet.heading + math.pi
            else:
                rolls = 1 if a["kind"] == "BARREL ROLL" else 3
                cur_jet.roll = 2 * math.pi * rolls * (p * p * (3 - 2 * p))  # eased in and out
                if a["kind"] == "BARREL ROLL":  # corkscrew around the flight path
                    lat = 16 * math.sin(cur_jet.roll)
                    cur_jet.x += -fy * (lat - a["prev"])
                    cur_jet.y += fx * (lat - a["prev"])
                    a["prev"] = lat
                    cur_jet.aero_alt = 1500 * (1 - math.cos(cur_jet.roll)) / 2
            for k, tr in enumerate(cur_jet.smoke):  # display smoke: three coloured trails
                off = (k - 1) * 5
                tr.record(cur_jet.x - fy * off, cur_jet.y + fx * off, frame)
            if a["t"] >= a["dur"]:
                cur_jet.aero, cur_jet.roll, cur_jet.aero_alt = None, 0.0, 0.0
        for tr in cur_jet.smoke:
            tr.expire(frame)
        if cur_jet.alive:
            if not cur_jet.avoid_edges(country.world_w, country.world_h, turn_rate) and cur_jet.aero is None:
                arrows = not two_player  # in 2-player mode the arrow keys belong to player 2
                steer_x = (1 if keys[pygame.K_d] or arrows and keys[pygame.K_RIGHT] else 0) - (1 if keys[pygame.K_a] or arrows and keys[pygame.K_LEFT] else 0)
                steer_y = (1 if keys[pygame.K_s] or arrows and keys[pygame.K_DOWN] else 0) - (1 if keys[pygame.K_w] or arrows and keys[pygame.K_UP] else 0)
                if not (steer_x or steer_y) and math.hypot(*stick_vec) > STICK_DEADZONE:
                    steer_x, steer_y = stick_vec  # touch stick: the jet turns toward where it points
                if not (steer_x or steer_y):
                    steer_x, steer_y = pad_steer()
                if steer_x or steer_y:
                    cur_jet.turn_toward(math.atan2(steer_y, steer_x), turn_rate)
            cur_jet.advance(speed_factor, country.world_w, country.world_h, frame)

        # The other 9: four flights, each flying a racetrack CAP on its own station in its own formation
        for jet in squadron:
            if jet is cur_jet or jet.alive:
                continue
            jet.down_timer -= 1
            if jet.down_timer == 0:  # replacement joins its own flight (or its CAP station)
                f = flight_of[jet.id]
                others = [m for m in flight_members(f) if m is not jet]
                ref = others[0] if others else None
                hx, hy = (ref.x, ref.y) if ref else f["track"][f["wp"]]
                h = ref.heading if ref else 0.0
                jet.x = max(100, min(country.world_w - 100, hx - math.cos(h) * 520))
                jet.y = max(100, min(country.world_h - 100, hy - math.sin(h) * 520))
                jet.heading, jet.hp = h, JET_HP
                jet.trajectory.clear()
                say(f"{jet.callsign} REJOINS {f['name']} FLIGHT")
        wing_turn = max(0.012, speed_factor / 25.0)
        for f in flights:
            members = flight_members(f)
            if not members:
                continue
            f["retask"] -= 1
            sx0, sy0 = f["station"]
            if f["retask"] <= 0 or math.hypot(sx0 - cur_jet.x, sy0 - cur_jet.y) < FLIGHT_STANDOFF:
                # keep out of your way: the flight moves to another war-zone station
                pick_station(f, [(cur_jet.x, cur_jet.y)] + [g["station"] for g in flights if g is not f])
            flead = members[0]
            wx, wy = f["track"][f["wp"]]
            if math.hypot(wx - flead.x, wy - flead.y) < 90:
                f["wp"] = 1 - f["wp"]  # turn for the other end of the racetrack
            if not flead.avoid_edges(country.world_w, country.world_h, turn_rate):
                flead.turn_toward(math.atan2(wy - flead.y, wx - flead.x), turn_rate)
            flead.advance(speed_factor, country.world_w, country.world_h, frame)
            fx, fy = math.cos(flead.heading), math.sin(flead.heading)
            for rank, jet in enumerate(members[1:]):
                sx, sy = formation_slot(flead, rank, f["style"])
                along = (sx - jet.x) * fx + (sy - jet.y) * fy
                if not jet.avoid_edges(country.world_w, country.world_h, wing_turn):
                    jet.turn_toward(math.atan2(sy + fy * 60 - jet.y, sx + fx * 60 - jet.x), wing_turn)
                jet.advance(speed_factor * max(0.6, min(1.9, 1.0 + along / 80.0)), country.world_w, country.world_h, frame)
            # flights only patrol: every action (bombs, missiles, being engaged) belongs to the jet you fly
        for jet in squadron:
            if jet.missile_cd > 0:
                jet.missile_cd -= 1
        if flare_cd > 0:
            flare_cd -= 1
        if ecm_cd > 0:
            ecm_cd -= 1
        if p2_cd > 0:
            p2_cd -= 1
        if two_player:  # player 2 always has a launcher picked: keep it valid, else the nearest one
            cands = p2_candidates()
            if p2_sel not in cands:
                p2_sel = min(cands, key=lambda s: math.hypot(s["x"] - cur_jet.x, s["y"] - cur_jet.y)) if cands else None
        if ecm_flash[0] > 0:
            ecm_flash[0] -= 1
        for cl in clouds:
            cl.update()
        for hc in helis:
            hc.update()

        # Drones patrol slowly; one that sees a jet cues the nearest battery
        drone_speed = speed_factor * DRONE_SPEED_VS_JET
        auto_airborne = sum(1 for m in active_missiles if m.auto)
        for d in drones:
            d.update(drone_speed, frame)
            if d.spot_cd > 0:
                continue
            seen = [cur_jet] if cur_jet.alive and math.hypot(cur_jet.x - d.x, cur_jet.y - d.y) < DRONE_SPOT_RANGE else []
            if seen and auto_airborne < AUTO_SAM_CAP:
                site = nearest_armed_site(seen[0].x, seen[0].y, max_dist=2500)
                if site is not None:
                    launch_sam(site, seen[0], auto=True)
                    auto_airborne += 1
                    d.spot_cd = DRONE_SPOT_RELOAD
                    say(f"DRONE SPOTS {seen[0].callsign} -> {site['name']} LAUNCH")
        for k in range(len(drone_respawns) - 1, -1, -1):
            drone_respawns[k] -= 1
            if drone_respawns[k] <= 0:
                drone_respawns.pop(k)
                drones.append(Drone(war_rng, country, from_border=True))

        # Every launcher, seen or hidden, engages the jet inside its range by itself
        for s in country.launchers:
            if s["seen"] > 0:
                s["seen"] -= 1
            if s["cd"] > 0:
                s["cd"] -= 1
                continue
            if s["hp"] <= 0 or s["missiles"] <= 0 or auto_airborne >= AUTO_SAM_CAP:
                continue
            near = [cur_jet] if cur_jet.alive and math.hypot(cur_jet.x - s["x"], cur_jet.y - s["y"]) < s["range"] else []
            if near and war_rng.random() < 1 / 240:
                launch_sam(s, min(near, key=lambda j: math.hypot(j.x - s["x"], j.y - s["y"])), auto=True)
                auto_airborne += 1

        # Bombs
        for b in dropped_bombs[:]:
            b.update(frame)
            if b.altitude <= 0:
                dropped_bombs.remove(b)
                add_blast(blasts, b.x, b.y, BOMB_BLAST_RADIUS)
                SFX.snd_explode.play()
                ground_hit(b.x, b.y, BOMB_BLAST_RADIUS, 1, "BOMB")

        # Missiles released from the jets
        for m in jet_missiles[:]:
            m.update(frame)
            alive_target = m.target["hp"] > 0 if m.kind == "AGM" else m.target.alive
            if m.done or not alive_target and math.hypot(m.tx - m.x, m.ty - m.y) < 12:
                jet_missiles.remove(m)
                add_blast(blasts, m.x, m.y, 12, 24)
                continue
            if math.hypot(m.tx - m.x, m.ty - m.y) < 10:
                jet_missiles.remove(m)
                SFX.snd_explode.play()
                if m.kind == "AGM":
                    add_blast(blasts, m.x, m.y, 30)
                    ground_hit(m.x, m.y, 20, 1, "AGM")
                else:
                    add_blast(blasts, m.x, m.y, 20)
                    if m.target.alive:
                        m.target.alive = False
                        craters.append((m.target.x + 30, m.target.y + 10, 3))
                        drone_respawns.append(DRONE_RESPAWN_FRAMES)
                        say("DRONE SPLASHED")

        drones = [d for d in drones if d.alive]

        # SAM missiles
        for m in active_missiles[:]:
            m.update(frame)
            if m.expired:
                active_missiles.remove(m)
                add_blast(blasts, m.x, m.y, 12, 24)
                continue
            if m.landed:  # an unguided round that missed comes down somewhere in the country
                active_missiles.remove(m)
                add_blast(blasts, m.x, m.y, 14, 30)
                craters.append((m.x, m.y, 3))
                continue
            if m.decoy is not None:
                m.decoy_frames = getattr(m, "decoy_frames", 0) + 1
                if math.hypot(m.decoy[0] - m.x, m.decoy[1] - m.y) < 20 or m.decoy_frames > 150:
                    active_missiles.remove(m)  # blows up on the flare
                    add_blast(blasts, m.x, m.y, 16, 28)
                continue
            if m.altitude < m.alt_goal * 0.94:
                continue
            close = [j for j in squadron if j is not cur_jet and j.alive
                     and math.hypot(m.x - j.x, m.y - j.y) < AI_FLARE_DISTANCE]
            if close and m.guided and not m.flares_tried:
                tgt = close[0]
                # AI-flown jets pop flares; most SAMs chase the decoys and blow up harmlessly
                m.flares_tried = True
                hx, hy = math.cos(tgt.heading), math.sin(tgt.heading)
                for k in range(4):
                    add_blast(blasts, tgt.x - hx * (14 + k * 9) + (k % 2 * 2 - 1) * hy * 8,
                              tgt.y - hy * (14 + k * 9) - (k % 2 * 2 - 1) * hx * 8, 9, 50, flare=True)
                if war_rng.random() < AI_FLARE_DECOY_CHANCE:
                    active_missiles.remove(m)
                    add_blast(blasts, m.x, m.y, 14, 26)
                    say(f"{tgt.callsign} FLARES - SAM DECOYED")
                    continue
            for jet in squadron:
                if (jet.alive and math.hypot(m.x - jet.x, m.y - jet.y) < SAM_FUSE
                        and abs(m.altitude - jet.altitude) < 3000):
                    active_missiles.remove(m)
                    jet.hp = max(0, jet.hp - SAM_DAMAGE)
                    add_blast(blasts, m.x, m.y, 26)
                    SFX.snd_explode.play()
                    if jet.hp == 0:
                        jet.down_timer = JET_REJOIN_FRAMES
                        add_blast(blasts, jet.x, jet.y, 50, 60)
                        crashing.append(CrashingJet(jet))
                        if jet is cur_jet:   # analytics: the flight you fly ends (+ seconds); the next one starts
                            track("game_over", level=current_level, jet=jet.callsign)
                            track("level_start", level=current_level)
                        pilots.append(EjectedPilot(jet))
                        say(f"{jet.callsign} SHOT DOWN - PILOT EJECTED")
                    else:
                        say(f"{jet.callsign} HIT  HP {jet.hp}")
                    break

        # Shot-down jets spin down from 35,000 ft and hit the ground
        for w in crashing[:]:
            w.update(frame)
            if w.altitude <= 0:
                crashing.remove(w)
                add_blast(blasts, w.x, w.y, 55, 60)
                craters.append((w.x, w.y, 8))
                fires.append({"x": w.x, "y": w.y, "age": 0, "life": 2400, "size": 12})
                if on_screen(w.x - cam_x, w.y - cam_y):
                    SFX.snd_explode.play()
                say(f"{w.callsign} CRASHED")
        for p in pilots[:]:
            was_airborne = p.altitude > 0
            p.update()
            if was_airborne and p.altitude <= 0:
                say(f"{p.callsign} PILOT LANDED SAFELY")
            if p.gone:
                pilots.remove(p)

        # The ground war: artillery duels along the front line, convoys on the highways
        if -200 < country.border_x(cam_y + SCREEN_H / 2) - cam_x < SCREEN_W + 200 and war_rng.random() < 0.06:
            wy = cam_y + war_rng.uniform(0, SCREEN_H)
            wx = country.border_x(wy) + war_rng.uniform(-90, 90)
            add_blast(blasts, wx, wy, war_rng.uniform(6, 12), 22)
            if war_rng.random() < 0.08:
                fires.append({"x": wx, "y": wy, "age": 0, "life": 900, "size": 7})
                craters.append((wx, wy, 4))
        for cv in convoys:
            cv["t"] += cv["dir"] * 0.12 / cv["len"]
            if not 0.0 < cv["t"] < 1.0:
                cv["dir"] = -cv["dir"]
                cv["t"] = min(1.0, max(0.0, cv["t"]))

        for s in country.launchers:
            if s["flash"] > 0:
                s["flash"] -= 1
        for bl in blasts[:]:
            bl["age"] += 1
            if bl["age"] >= bl["life"]:
                blasts.remove(bl)
        for f in fires[:]:
            f["age"] += 1
            if f["age"] >= f["life"]:
                fires.remove(f)
        if len(fires) > 120:
            del fires[:len(fires) - 120]
        for msg in list(messages):
            msg[1] -= 1
            if msg[1] <= 0:
                messages.remove(msg)

        # ---------------------------------------------------------------- draw
        # The world is drawn at map scale into a view as big as the altitude allows, then stretched to
        # the screen: 1x at 35,000 ft, up to 3x close to the ground. Labels only while high (they'd blur).
        if view_w >= SCREEN_W:
            ground, layer = screen, overlay
        else:
            if (view_w, view_h) not in layer_cache:
                layer_cache.clear()
                layer_cache[(view_w, view_h)] = (pygame.Surface((view_w, view_h)).convert(),
                                                 pygame.Surface((view_w, view_h), pygame.SRCALPHA))
            ground, layer = layer_cache[(view_w, view_h)]
        lab = small_font if zoom < 1.25 else None

        # 1. Ground: the continent, craters, convoys, launchers you can see
        country.draw(ground, icx, icy, view_w, view_h)
        for x, y, r in craters:
            if on_screen(x - icx, y - icy):
                pygame.draw.circle(ground, (34, 30, 26), (int(x - icx), int(y - icy)), r)
                pygame.draw.circle(ground, (70, 60, 46), (int(x - icx), int(y - icy)), r, 1)
        for cv in convoys:
            (x1, y1), (x2, y2) = cv["p1"], cv["p2"]
            for k in range(5):
                t = cv["t"] - cv["dir"] * k * 11 / cv["len"]
                sx, sy = x1 + (x2 - x1) * t - icx, y1 + (y2 - y1) * t - icy
                if on_screen(sx, sy, 5):
                    ground.fill((70, 78, 50), (int(sx) - 2, int(sy) - 2, 5, 4))
        for s in country.sam_sites:
            sx, sy = int(s["x"] - icx), int(s["y"] - icy)
            if on_screen(sx, sy):
                draw_sam_site(ground, s, sx, sy, frame, lab)
        for s in country.tels:
            sx, sy = int(s["x"] - icx), int(s["y"] - icy)
            if on_screen(sx, sy) and launcher_visible(s):
                draw_tel(ground, s, sx, sy, lab)
        if night:  # moonlight on the ground, then every light: cities, streets, highways, villages, runways
            ground.fill(NIGHT_SHADE, special_flags=pygame.BLEND_RGB_MULT)
            country.draw_lights(ground, icx, icy, view_w, view_h)
            blink = (frame // 20) % 3 == 0
            for s in country.sam_sites:  # red beacon on each radar, green when the battery is armed
                sx, sy = int(s["x"] - icx), int(s["y"] - icy)
                if s["hp"] > 0 and on_screen(sx, sy):
                    if blink:
                        pygame.draw.circle(ground, (255, 50, 40), (sx - 8, sy), 2)
                    if s["missiles"] > 0:
                        ground.fill((60, 255, 120), (sx + 13, sy - 11, 2, 2))
            for cv in convoys:  # convoy headlights
                (x1, y1), (x2, y2) = cv["p1"], cv["p2"]
                for k in range(5):
                    t = cv["t"] - cv["dir"] * k * 11 / cv["len"]
                    sx, sy = x1 + (x2 - x1) * t - icx, y1 + (y2 - y1) * t - icy
                    if on_screen(sx, sy, 5):
                        ground.fill((255, 240, 200), (int(sx) - 1, int(sy) - 1, 2, 2))
            for f in fires:  # burning targets light up the ground around them
                sx, sy = int(f["x"] - icx), int(f["y"] - icy)
                if on_screen(sx, sy, 60):
                    pygame.draw.circle(ground, (60, 26, 6), (sx, sy), int(f["size"] * 3), 0)
        if lab is not None:
            for c in country.cities:
                sx, sy = int(c["x"] - icx), int(c["y"] - icy)
                if on_screen(sx, sy, c["r"]):
                    lbl = lab.render(c["name"], True, (240, 226, 170))
                    ground.blit(lbl, (sx - lbl.get_width() // 2, sy - c["r"] - 14))
        if ground is not screen:
            pygame.transform.smoothscale(ground, (SCREEN_W, SCREEN_H), screen)  # smooth, not blocky pixels

        # 2. Low altitude: trees, shrubs, traffic and boats come into view
        if zoom >= DETAIL_ZOOM:
            draw_ground_detail(screen, country, cam_x, cam_y, zx, frame, night)
        # clouds below you (and their shadows on the ground), at screen resolution so they stay soft
        clouds_above = []
        for cl in clouds:
            if not cl.visible(cam_x, cam_y, view_w, view_h):
                continue
            if cl.altitude >= cur_jet.altitude:
                clouds_above.append(cl)
                continue
            px, py = int((cl.x - cam_x) * zx), int((cl.y - cam_y) * zy)
            if not night:
                screen.blit(cl.at_scale(zx, False, shadow=True), (px + int(cl.shadow_off * zx), py + int(cl.shadow_off * zy)))
            screen.blit(cl.at_scale(zx, night), (px, py))
        height = (cur_jet.altitude - ALT_MIN) / (CRUISE_ALT_FT - ALT_MIN)
        haze = min(1.0, max(0.0, height * 0.85 + cur_jet.aero_alt / 8000.0))
        if haze > 0.02:
            haze_surf = night_haze if night else sky_haze
            haze_surf.set_alpha(int(255 * haze))
            screen.blit(haze_surf, (0, 0))

        # 3. Everything in the air below and around you, on one alpha layer:
        #    range rings, fires, every trail, blasts, ordnance, drones, helicopters
        layer.fill((0, 0, 0, 0))
        for s in country.launchers:  # rings only for launchers you can see that have you in range
            if (s["hp"] > 0 and s["missiles"] > 0 and launcher_visible(s)
                    and on_screen(s["x"] - icx, s["y"] - icy, s["range"])
                    and cur_jet.alive and math.hypot(cur_jet.x - s["x"], cur_jet.y - s["y"]) < s["range"]):
                pygame.draw.circle(layer, (255, 80, 60, 70), (int(s["x"] - icx), int(s["y"] - icy)), s["range"], 1)
        draw_fires(layer, fires, icx, icy, frame)
        for d in drones:
            d.trajectory.draw(layer, icx, icy, frame, head=(d.x, d.y), max_alpha=150)
        if cur_jet.alive:  # only the jet you fly shows its exhaust trail; the others stay off the view
            cur_jet.trajectory.draw(layer, icx, icy, frame, head=(cur_jet.x, cur_jet.y))
        for tr in cur_jet.smoke:
            tr.draw(layer, icx, icy, frame, max_alpha=235)
        for m in active_missiles:
            m.trajectory.draw(layer, icx, icy, frame, head=(m.x, m.y))
        for m in jet_missiles:
            m.trajectory.draw(layer, icx, icy, frame, head=(m.x, m.y))
        for b in dropped_bombs:
            b.trajectory.draw(layer, icx, icy, frame, head=(b.x, b.y))
        for w in crashing:
            w.trajectory.draw(layer, icx, icy, frame, head=(w.x, w.y), max_alpha=200)
        draw_blasts(layer, blasts, icx, icy)
        for hc in helis:
            hc.draw(layer, icx, icy, frame, night)
        for b in dropped_bombs:
            b.draw(layer, icx, icy, lab)
        for d in drones:
            d.draw(layer, icx, icy, lab)
        for m in active_missiles:
            m.draw(layer, icx, icy, lab)
        for m in jet_missiles:
            m.draw(layer, icx, icy, lab)
        for w in crashing:
            w.draw(layer, icx, icy, frame, lab)
        for p in pilots:
            p.draw(layer, icx, icy, lab)
        screen.blit(layer if layer is overlay else pygame.transform.smoothscale(layer, (SCREEN_W, SCREEN_H)), (0, 0))

        # 4. The jet you fly (same size at every altitude: the camera stays above it), its gauges,
        #    and the missile warning telling you the key and the countermeasure that is ready
        sx, sy = int((cur_jet.x - cam_x) * zx), int((cur_jet.y - cam_y) * zy)
        threats, rockets = [], []
        if cur_jet.alive:
            for m in active_missiles:
                if m.decoy is not None:
                    continue
                if m.guided and m.target is cur_jet:
                    threats.append(m)
                elif not m.guided and not m.landed and math.hypot(m.x - cur_jet.x, m.y - cur_jet.y) < ROCKET_WARN_RANGE:
                    to_jet = math.atan2(cur_jet.y - m.y, cur_jet.x - m.x)
                    if math.cos(angle_diff(to_jet, m.heading)) > 0.8:  # on a course that crosses yours
                        rockets.append(m)
        if cur_jet.alive:
            draw_player_jet(screen, cur_jet, sx, sy, aero_heading, aero_pitch)
            if night:  # navigation lights: red port wingtip, green starboard, white strobe on the tail
                hx, hy = math.cos(aero_heading), math.sin(aero_heading)
                span = 17 * max(0.15, abs(math.cos(cur_jet.roll))) * (1 + cur_jet.aero_alt / 10000.0)
                pygame.draw.circle(screen, (255, 50, 40), (int(sx - hx * 5 + hy * span), int(sy - hy * 5 - hx * span)), 2)
                pygame.draw.circle(screen, (40, 255, 90), (int(sx - hx * 5 - hy * span), int(sy - hy * 5 + hx * span)), 2)
                if frame % 60 < 5:
                    pygame.draw.circle(screen, (255, 255, 255), (int(sx - hx * 18), int(sy - hy * 18)), 3)
            locked = bool(threats) or bool(rockets)
            draw_bracket(screen, sx, sy, color=(255, 60, 50) if locked and (frame // 12) % 2 == 0 else CYAN)
            tag = font.render(f"[{cur_jet.callsign}]  {cur_jet.altitude / 1000:.0f}K FT"
                              + (f"  {cur_jet.aero['kind']}" if cur_jet.aero else ""), True, CYAN)
            screen.blit(tag, (sx - tag.get_width() // 2, sy - 42))
            pygame.draw.rect(screen, (40, 50, 60), (sx - 20, sy + 28, 40, 4))
            pygame.draw.rect(screen, CYAN, (sx - 20, sy + 28, int(40 * cur_jet.hp / JET_HP), 4))
            for row, (cd, full, col) in enumerate(((flare_cd, FLARE_RELOAD, (255, 245, 210)),
                                                   (ecm_cd, ECM_RELOAD, (120, 200, 255)))):
                pygame.draw.rect(screen, (40, 50, 60), (sx - 20, sy + 34 + row * 5, 40, 3))
                pygame.draw.rect(screen, col if cd == 0 else (110, 110, 110),
                                 (sx - 20, sy + 34 + row * 5, int(40 * (1.0 - cd / full)), 3))
            if ecm_flash[0] > 0:
                pygame.draw.circle(screen, (120, 200, 255), (sx, sy), int(30 + (40 - ecm_flash[0]) * 3), 2)
            if locked:
                near = min(threats + rockets, key=lambda m: math.hypot(m.x - cur_jet.x, m.y - cur_jet.y))
                dist = math.hypot(near.x - cur_jet.x, near.y - cur_jet.y)
                a = math.atan2(near.y - cur_jet.y, near.x - cur_jet.x)  # arrow toward the missile
                tip = (sx + math.cos(a) * 52, sy + math.sin(a) * 52)
                pygame.draw.polygon(screen, (255, 60, 50), [tip, (sx + math.cos(a + 0.18) * 40, sy + math.sin(a + 0.18) * 40),
                                                            (sx + math.cos(a - 0.18) * 40, sy + math.sin(a - 0.18) * 40)])
                if (frame // 12) % 2 == 0:
                    pygame.draw.rect(screen, (255, 40, 40), (0, 0, SCREEN_W, LEVEL_BAR_TOP), 5)
                if not threats:  # only unguided rounds: no seeker to fool, get out of their path
                    advice, adv_col = "UNGUIDED - TURN HARD OUT OF ITS PATH", (255, 210, 120)
                elif flare_cd == 0:
                    advice, adv_col = "PRESS C  (PAD Y / TRIANGLE)  -  FLARES", (255, 245, 210)
                elif ecm_cd == 0:
                    advice, adv_col = "PRESS C  (PAD Y / TRIANGLE)  -  ECM JAMMER", (120, 200, 255)
                else:
                    advice, adv_col = f"COUNTERMEASURES RELOADING  {min(flare_cd, ecm_cd) / 60:.1f} s - TURN HARD", (200, 200, 200)
                what = []
                if threats:
                    what.append(f"MISSILE LOCK {len(threats)}")
                if rockets:
                    what.append(f"ROCKET {len(rockets)}")
                warn = big_font.render(f"{'  +  '.join(what)}  -  {int(dist)} PX", True, (255, 70, 60))
                adv = font.render(advice, True, adv_col)
                wy_ = max(8, min(LEVEL_BAR_TOP - 44, sy - 96))  # stays on screen
                wx_ = max(10 + warn.get_width() // 2, min(SCREEN_W - 10 - warn.get_width() // 2, sx))
                screen.blit(warn, (wx_ - warn.get_width() // 2, wy_))
                screen.blit(adv, (wx_ - adv.get_width() // 2, wy_ + 20))

        # Player 2's picked launcher: bracket, its range ring, name, missiles left and whether it can fire
        if two_player and p2_sel is not None:
            px, py = int((p2_sel["x"] - cam_x) * zx), int((p2_sel["y"] - cam_y) * zy)
            in_range = cur_jet.alive and math.hypot(cur_jet.x - p2_sel["x"], cur_jet.y - p2_sel["y"]) <= p2_sel["range"]
            col = (255, 210, 60) if in_range else (170, 170, 170)
            pygame.draw.circle(screen, col, (px, py), int(p2_sel["range"] * zx), 1)
            draw_bracket(screen, px, py, half=18, arm=6, color=col)
            state = ("READY" if p2_cd == 0 and p2_sel["missiles"] > 0 else "RELOADING") if in_range else "OUT OF RANGE"
            lbl = font.render(f"P2  {p2_sel['name']}  {p2_sel['missiles']}  {state}", True, col)
            lx = max(4, min(SCREEN_W - lbl.get_width() - 4, px - lbl.get_width() // 2))
            ly = max(4, min(LEVEL_BAR_TOP - 18, py + 22))
            screen.blit(lbl, (lx, ly))

        # 5. Clouds above your altitude pass between you and the camera
        for cl in clouds_above:  # nearer the camera: bigger, still soft
            w, h = cl.surf.get_size()
            big = cl.at_scale(zx * 1.5, night)
            cx_, cy_ = (cl.x + w / 2 - cam_x) * zx, (cl.y + h / 2 - cam_y) * zy
            screen.blit(big, big.get_rect(center=(int(cx_), int(cy_))))

        # 6. Tactical minimap (top right)
        rx, ry, map_w, map_h = MINIMAP_RECT
        screen.blit(country.minimap(map_w, map_h), (rx, ry))
        kx, ky = map_w / country.world_w, map_h / country.world_h
        for s in country.sam_sites:
            col = (0, 220, 150) if s["hp"] > 0 and s["missiles"] > 0 else ((120, 120, 120) if s["hp"] > 0 else (220, 60, 50))
            pygame.draw.circle(screen, col, (rx + int(s["x"] * kx), ry + int(s["y"] * ky)), 2)
        for s in country.tels:
            if launcher_visible(s):
                col = (230, 200, 90) if s["hp"] > 0 and s["missiles"] > 0 else ((120, 120, 120) if s["hp"] > 0 else (220, 60, 50))
                screen.fill(col, (rx + int(s["x"] * kx), ry + int(s["y"] * ky), 1, 1))
        for d in drones:
            screen.fill((210, 140, 255), (rx + int(d.x * kx), ry + int(d.y * ky), 2, 2))
        for m in active_missiles:
            screen.fill((255, 150, 40), (rx + int(m.x * kx), ry + int(m.y * ky), 2, 2))
        for idx, jet in enumerate(squadron):
            if jet.alive:
                screen.fill(CYAN if idx == active_jet_idx else (235, 235, 245),
                            (rx + int(jet.x * kx) - 1, ry + int(jet.y * ky) - 1, 3 if idx == active_jet_idx else 2, 3 if idx == active_jet_idx else 2))
        pygame.draw.rect(screen, (255, 215, 60), (rx + int(cam_x * kx), ry + int(cam_y * ky),
                                                  max(4, int(view_w * kx)), max(4, int(view_h * ky))), 1)
        pygame.draw.rect(screen, (0, 200, 255), (rx - 1, ry - 1, map_w + 2, map_h + 2), 1)

        if touch_on:
            draw_touch_controls(screen)

        # 7. Bottom bar, below the ground: every control, then previous / next level and the jet switch
        pygame.draw.rect(screen, (10, 14, 22), (0, LEVEL_BAR_TOP, SCREEN_W, SCREEN_H - LEVEL_BAR_TOP))
        screen.blit(hints_row, hints_row.get_rect(midtop=(SCREEN_W // 2, LEVEL_BAR_TOP + 5)))
        p2_hints_row.set_alpha(255 if two_player else 110)  # dim while player 2 is off
        screen.blit(p2_hints_row, p2_hints_row.get_rect(midtop=(SCREEN_W // 2, LEVEL_BAR_TOP + 21)))
        pygame.draw.rect(screen, (40, 36, 16) if two_player else (26, 32, 48), PLAYERS_RECT, border_radius=3)
        pygame.draw.rect(screen, (255, 210, 60) if two_player else (70, 85, 110), PLAYERS_RECT, 1, border_radius=3)
        lbl = font.render(f"[2]  {'2 PLAYERS' if two_player else '1 PLAYER'}", True,
                          (255, 210, 60) if two_player else (220, 225, 240))
        screen.blit(lbl, lbl.get_rect(center=PLAYERS_RECT.center))
        pygame.draw.rect(screen, (18, 22, 52) if night else (26, 32, 48), NIGHT_RECT, border_radius=3)
        pygame.draw.rect(screen, (140, 160, 255) if night else (70, 85, 110), NIGHT_RECT, 1, border_radius=3)
        lbl = font.render(f"[T]  {'NIGHT' if night else 'DAY'} VIEW", True, (170, 185, 255) if night else (255, 225, 140))
        screen.blit(lbl, lbl.get_rect(center=NIGHT_RECT.center))
        for rect, text in ((PREV_RECT, "< PREV  [P]"), (NEXT_RECT, "[N]  NEXT >"),
                           (TAB_RECT, f"[TAB]  JET: {cur_jet.callsign}  >")):
            pygame.draw.rect(screen, (26, 32, 48), rect, border_radius=3)
            pygame.draw.rect(screen, (70, 85, 110), rect, 1, border_radius=3)
            lbl = font.render(text, True, (220, 225, 240))
            screen.blit(lbl, lbl.get_rect(center=rect.center))
        lbl = font.render(f"LEVEL {current_level}", True, (255, 170, 40))
        screen.blit(lbl, lbl.get_rect(center=((PREV_RECT.right + NEXT_RECT.left) // 2, PREV_RECT.centery)))

        pygame.display.flip()
        clock.tick(60)
        await asyncio.sleep(0)

    pygame.quit()


if __name__ == "__main__":
    asyncio.run(main())
