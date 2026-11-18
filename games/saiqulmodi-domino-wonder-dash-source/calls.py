"""Real-life sounds for the pictures: animal calls, vehicles, instruments,
weather. Every sound is made in code (no recordings). tools/build_sounds.py
saves them as small OGG files in sounds/ so phones and browsers just load
them; if a file is missing the sound is made here instead.
"""

import io
import math
import os
import random
import struct
from array import array

import pygame

RATE = 16000
HERE = os.path.dirname(os.path.abspath(__file__))
SOUND_DIR = os.path.join(HERE, "sounds")


def _wav(samples, peak=0.7):
  top = max(1e-9, max(abs(s) for s in samples))
  scale = peak / top
  pcm = array("h", (int(max(-1.0, min(1.0, s * scale)) * 32767) for s in samples))
  if struct.pack("=H", 1) != struct.pack("<H", 1):
    pcm.byteswap()
  data = pcm.tobytes()
  header = (b"RIFF" + struct.pack("<I", 36 + len(data)) + b"WAVEfmt "
            + struct.pack("<IHHIIHH", 16, 1, 1, RATE, RATE * 2, 2, 16)
            + b"data" + struct.pack("<I", len(data)))
  try:
    return pygame.mixer.Sound(io.BytesIO(header + data))
  except Exception:
    # Browser build: no file objects, so raw samples at the mixer's own rate/channels
    freq, _, channels = pygame.mixer.get_init()
    n = int(len(pcm) * freq / RATE)
    out = array("h", bytes(n * 2 * channels))
    for i in range(n):
      v = pcm[min(len(pcm) - 1, i * RATE // freq)]
      for c in range(channels):
        out[i * channels + c] = v
    return pygame.mixer.Sound(buffer=out.tobytes())


def _env(t, dur, attack=0.03, release=0.12):
  if t < attack:
    return t / attack
  if t > dur - release:
    return max(0.0, (dur - t) / release)
  return 1.0


def voice(dur, f0, harmonics=(1, .6, .4, .3, .2, .12), bright=None, vib=(0, 0),
          noise=0.0, attack=0.03, release=0.12, trem=(0, 0)):
  """Harmonic voice with a pitch curve f0(t), optional brightness curve,
  vibrato (rate, depth), tremolo (rate, depth) and breath noise."""
  n = int(RATE * dur)
  out = [0.0] * n
  phase = 0.0
  for i in range(n):
    t = i / RATE
    f = f0(t) * (1 + vib[1] * math.sin(2 * math.pi * vib[0] * t))
    phase += 2 * math.pi * f / RATE
    b = bright(t) if bright else 1.0
    s = 0.0
    for k, w in enumerate(harmonics, 1):
      if f * k > RATE / 2:
        break
      s += w * (b ** (k - 1)) * math.sin(phase * k)
    if noise:
      s += noise * random.uniform(-1, 1)
    a = _env(t, dur, attack, release)
    if trem[1]:
      a *= 1 - trem[1] * (0.5 + 0.5 * math.sin(2 * math.pi * trem[0] * t))
    out[i] = s * a
  return out


def silence(dur):
  return [0.0] * int(RATE * dur)


def noise_burst(dur, color=0.6, env=None):
  """Filtered noise (color 0 = white/hiss, near 1 = dark rumble)."""
  n = int(RATE * dur)
  out, y = [0.0] * n, 0.0
  for i in range(n):
    y = color * y + (1 - color) * random.uniform(-1, 1)
    t = i / RATE
    out[i] = y * (env(t) if env else _env(t, dur, 0.02, dur * 0.4))
  return out


def pluck(freq, dur, bright=0.5):
  """Karplus-Strong string (guitar, banjo)."""
  n = int(RATE * dur)
  period = max(2, int(RATE / freq))
  buf = [random.uniform(-1, 1) for _ in range(period)]
  out = [0.0] * n
  for i in range(n):
    j = i % period
    nxt = buf[(j + 1) % period]
    buf[j] = 0.996 * ((1 - bright) * buf[j] + bright * nxt) if i >= period else buf[j]
    out[i] = buf[j]
  return out


def tone(freqs, dur, decay=4.0, square=False):
  n = int(RATE * dur)
  out = [0.0] * n
  for i in range(n):
    t = i / RATE
    s = 0.0
    for f, w in freqs:
      v = math.sin(2 * math.pi * f * t)
      s += w * ((1 if v >= 0 else -1) * 0.6 if square else v)
    out[i] = s * math.exp(-decay * t) * min(1.0, t / 0.005)
  return out


def seq(*parts):
  out = []
  for p in parts:
    out.extend(p)
  return out


def mix(a, b, wb=1.0):
  n = max(len(a), len(b))
  return [(a[i] if i < len(a) else 0) + wb * (b[i] if i < len(b) else 0) for i in range(n)]


def lin(a, b, dur):
  return lambda t: a + (b - a) * min(1.0, t / dur)


# --------------------------------------------------------------- the sounds
def s_moo():
  return voice(1.3, lambda t: 125 - 20 * t / 1.3, (1, .8, .6, .5, .35, .25, .15),
               bright=lambda t: 0.45 + 0.5 * math.sin(math.pi * t / 1.3), attack=0.15,
               release=0.3)


def s_bark():
  b = lambda: voice(0.16, lambda t: 420 - 900 * t, (1, .7, .5, .4, .3), noise=0.35,
                    attack=0.005, release=0.08)
  return seq(b(), silence(0.12), b())


def s_meow():
  return voice(0.8, lambda t: 520 + 260 * math.sin(math.pi * min(1, t / 0.8)) - 120 * t,
               (1, .7, .5, .3, .2), bright=lambda t: 0.3 + 0.6 * math.sin(math.pi * t / 0.8),
               attack=0.05, release=0.2)


def s_roar():
  base = voice(1.4, lambda t: 95 - 25 * t, (1, .9, .8, .7, .6, .5, .4, .3), noise=0.6,
               attack=0.2, release=0.5, trem=(28, 0.5))
  return base


def s_trumpet_animal():
  return voice(1.0, lambda t: 520 + 240 * min(1, t / 0.25) - 80 * t,
               (1, .9, .8, .7, .6, .5, .4, .3, .2), vib=(9, 0.03), noise=0.15,
               attack=0.06, release=0.25)


def s_neigh():
  return voice(1.1, lambda t: 950 - 420 * t, (1, .6, .4, .3), vib=(13, 0.08),
               noise=0.1, attack=0.03, release=0.4)


def s_baa():
  return voice(0.8, lambda t: 360 - 40 * t, (1, .8, .6, .4, .3, .2), trem=(7, 0.7),
               attack=0.04, release=0.2)


def s_oink():
  g = lambda: voice(0.2, lambda t: 170 - 120 * t, (1, .9, .8, .6, .5), noise=0.4,
                    attack=0.01, release=0.06)
  return seq(g(), silence(0.1), g())


def s_quack():
  q = lambda: voice(0.17, lambda t: 330 - 150 * t, (.3, .5, 1, .9, .8, .6, .4), noise=0.2,
                    attack=0.005, release=0.07)
  return seq(q(), silence(0.08), q(), silence(0.08), q())


def s_crow():  # rooster: cock-a-doodle-doo
  n = lambda f, d: voice(d, lambda t, f=f: f, (1, .7, .5, .3, .2), noise=0.05,
                         attack=0.01, release=0.04)
  return seq(n(620, 0.14), n(780, 0.12), n(700, 0.14),
             voice(0.7, lambda t: 900 - 400 * t, (1, .7, .5, .3, .2), vib=(6, 0.02),
                   release=0.3))


def s_hoot():
  h = lambda d: voice(d, lambda t: 380 - 30 * t, (1, .15), attack=0.06, release=0.15)
  return seq(h(0.35), silence(0.15), h(0.25), silence(0.06), h(0.5))


def s_ribbit():
  r = lambda: voice(0.22, lambda t: 420, (1, .6, .4), trem=(32, 0.9), attack=0.01, release=0.05)
  return seq(r(), silence(0.1), r())


def s_buzz():
  return voice(1.0, lambda t: 220 + 15 * math.sin(2 * math.pi * 3 * t),
               (1, .8, .7, .6, .5, .4, .35, .3, .25, .2), trem=(18, 0.3),
               attack=0.1, release=0.2)


def s_hiss():
  return noise_burst(1.0, color=0.0, env=lambda t: min(1, t / 0.1) * max(0, 1 - t))


def s_growl():
  return voice(1.0, lambda t: 70, (1, .9, .8, .7, .5), noise=0.5, trem=(22, 0.6),
               attack=0.1, release=0.3)


def s_monkey():
  o = lambda f: voice(0.22, lambda t, f=f: f + 600 * t, (1, .6, .3), attack=0.02, release=0.06)
  return seq(o(450), silence(0.05), o(520), silence(0.05), o(650), silence(0.05),
             voice(0.4, lambda t: 1100 - 300 * t, (1, .5, .3), noise=0.1, release=0.15))


def s_squawk():
  return seq(voice(0.25, lambda t: 1200 - 300 * t, (1, .8, .6, .5), noise=0.4,
                   attack=0.005, release=0.08), silence(0.1),
             voice(0.3, lambda t: 1300 - 400 * t, (1, .8, .6, .5), noise=0.4,
                   attack=0.005, release=0.1))


def s_screech():
  return voice(0.8, lambda t: 2200 - 900 * t, (1, .4, .2), vib=(25, 0.03), noise=0.1,
               attack=0.02, release=0.3)


def s_coo():
  c = lambda: voice(0.4, lambda t: 300 + 60 * math.sin(math.pi * t / 0.4), (1, .3),
                    trem=(10, 0.4), attack=0.05, release=0.1)
  return seq(c(), silence(0.1), c())


def s_peacock():
  m = lambda: voice(0.45, lambda t: 1000 - 500 * t, (1, .7, .5, .3), noise=0.1,
                    attack=0.02, release=0.12)
  return seq(m(), silence(0.15), m())


def s_honk():
  return seq(voice(0.25, lambda t: 380, (1, .9, .7, .5, .4), noise=0.1, release=0.05),
             silence(0.08), voice(0.3, lambda t: 360, (1, .9, .7, .5, .4), noise=0.1))


def s_chirp():
  c = lambda f: voice(0.09, lambda t, f=f: f + 9000 * t, (1, .3), attack=0.005, release=0.03)
  return seq(c(2600), silence(0.05), c(2800), silence(0.05), c(2500), silence(0.12),
             c(3000), silence(0.05), c(2700))


def s_bubbles():
  out = silence(1.0)
  for k in range(9):
    start = int(RATE * random.uniform(0, 0.85))
    f = random.uniform(500, 1400)
    for i in range(int(RATE * 0.06)):
      t = i / RATE
      if start + i < len(out):
        out[start + i] += math.sin(2 * math.pi * (f + 6000 * t) * t) * math.exp(-40 * t)
  return out


def s_dolphin():
  return seq(voice(0.5, lambda t: 3000 + 2500 * math.sin(math.pi * t / 0.5), (1,),
                   attack=0.02, release=0.1), silence(0.08),
             noise_burst(0.3, 0.0, env=lambda t: 1.0 if int(t * 60) % 2 == 0 else 0.0))


def s_whale():
  return voice(1.8, lambda t: 180 + 160 * math.sin(math.pi * t / 1.8), (1, .4, .2),
               vib=(3, 0.02), attack=0.3, release=0.6)


def s_camel():
  return voice(0.9, lambda t: 110 - 30 * t, (1, .9, .8, .6, .5, .4), noise=0.5,
               trem=(14, 0.5), attack=0.1, release=0.3)


# vehicles
def s_horn(f1=420, f2=525, dur=0.45):
  return seq(tone([(f1, 1), (f2, 1)], dur, decay=0.5, square=True), silence(0.08),
             tone([(f1, 1), (f2, 1)], dur * 0.6, decay=0.5, square=True))


def s_siren(lo=650, hi=950, speed=1.6, dur=1.8):
  return voice(dur, lambda t: lo + (hi - lo) * (0.5 + 0.5 * math.sin(2 * math.pi * t / speed)),
               (1, .3, .15), attack=0.05, release=0.2)


def s_weewoo():
  w = lambda f: voice(0.4, lambda t, f=f: f, (1, .4, .2), attack=0.01, release=0.03)
  return seq(w(960), w(720), w(960), w(720))


def s_engine(f_from=80, f_to=260, dur=1.2):
  return voice(dur, lin(f_from, f_to, dur), (1, .9, .8, .7, .6, .5, .4), noise=0.2,
               trem=(f_from / 4, 0.3), attack=0.05, release=0.3)


def s_putt():
  out = []
  for k in range(10):
    out += voice(0.06, lambda t: 70, (1, .8, .6, .4), noise=0.5, attack=0.003, release=0.04)
    out += silence(0.05)
  return out


def s_bike_bell():
  r = lambda: tone([(2100, 1), (2650, .6), (4100, .3)], 0.35, decay=9)
  return seq(r(), r())


def s_train():
  out = []
  for k in range(4):  # choo choo
    out += noise_burst(0.16, 0.3, env=lambda t: math.sin(math.pi * t / 0.16))
    out += silence(0.08)
  whistle = voice(0.9, lambda t: 700, (1, .5, .3), noise=0.08, attack=0.05, release=0.2)
  chord = mix(whistle, voice(0.9, lambda t: 880, (1, .4), attack=0.05, release=0.2))
  return seq(out, chord)


def s_rail_clicks():
  out = []
  for k in range(6):
    out += tone([(180, 1), (420, .5)], 0.08, decay=40)
    out += silence(0.05 if k % 2 == 0 else 0.25)
  return out


def s_whoosh(dur=1.6):
  return noise_burst(dur, 0.5, env=lambda t: math.sin(math.pi * t / dur) ** 2)


def s_chopper():
  return noise_burst(1.4, 0.7, env=lambda t: (0.3 + 0.7 * (math.sin(2 * math.pi * 11 * t) > 0))
                     * min(1, t / 0.2) * max(0, (1.4 - t) / 0.4 if t > 1.0 else 1))


def s_ship_horn():
  return voice(1.6, lambda t: 110, (1, .9, .8, .6, .5, .4, .3), noise=0.05,
               attack=0.1, release=0.4)


def s_waves():
  return noise_burst(1.8, 0.85, env=lambda t: 0.4 + 0.6 * math.sin(math.pi * t / 0.9) ** 2)


def s_rocket():
  return noise_burst(1.8, 0.9, env=lambda t: min(1, t / 0.6) * max(0, min(1, (1.8 - t) / 0.4)))


# music
def s_drum():
  d = lambda: mix(voice(0.3, lambda t: 110 - 160 * t, (1, .3), attack=0.002, release=0.25),
                  noise_burst(0.05, 0.3), 0.6)
  return seq(d(), silence(0.12), d(), silence(0.05), d())


def s_guitar():
  out = silence(1.6)
  for k, f in enumerate((196, 247, 294, 392)):
    p = pluck(f, 1.4, 0.5)
    off = int(RATE * 0.04 * k)
    for i, v in enumerate(p):
      out[off + i] += v
  return out


def s_banjo():
  return seq(pluck(392, 0.3, 0.2), pluck(494, 0.3, 0.2), pluck(587, 0.5, 0.2))


def s_flute():
  return seq(*[voice(0.3, lambda t, f=f: f, (1, .15, .05), noise=0.05, vib=(5, 0.01),
                     attack=0.04, release=0.08) for f in (784, 880, 988, 1175)])


def s_trumpet():
  return seq(*[voice(d, lambda t, f=f: f, (1, .9, .8, .7, .6, .5, .4), vib=(6, 0.01),
                     attack=0.02, release=0.06) for f, d in ((523, 0.2), (659, 0.2), (784, 0.5))])


def s_violin():
  return voice(1.3, lambda t: 659 if t < 0.6 else 784,
               tuple(1 / k for k in range(1, 12)), vib=(6, 0.012), attack=0.12, release=0.2)


def s_bell():
  return tone([(880, 1), (2380, .5), (4060, .25)], 1.6, decay=2.2)


def s_maracas():
  out = []
  for k in range(6):
    out += noise_burst(0.07, 0.0)
    out += silence(0.06)
  return out


def s_tick():
  out = []
  for k in range(4):
    out += tone([(2600 if k % 2 == 0 else 2000, 1)], 0.03, decay=80) + silence(0.32)
  return out


def s_rain():
  out = noise_burst(1.6, 0.3, env=lambda t: 0.3)
  for k in range(40):
    s = int(RATE * random.uniform(0, 1.5))
    for i in range(int(RATE * 0.01)):
      if s + i < len(out):
        out[s + i] += random.uniform(-1, 1) * math.exp(-500 * i / RATE)
  return out


def s_thunder():
  return noise_burst(2.0, 0.97, env=lambda t: (min(1, t / 0.05) * math.exp(-1.6 * t)
                                               * (1 + 0.6 * math.sin(2 * math.pi * 3 * t))))


def s_whistle():
  return voice(0.7, lambda t: 2400, (1, .2), trem=(30, 0.7), noise=0.1, attack=0.02,
               release=0.1)


def s_bat_ball():
  return seq(tone([(900, 1), (1500, .5)], 0.12, decay=35), silence(0.3),
             noise_burst(0.3, 0.6))


def s_kick():
  return seq(voice(0.15, lambda t: 90 - 200 * t, (1, .4), attack=0.002, release=0.1),
             silence(0.25), noise_burst(0.4, 0.4))


def s_pock():
  return seq(tone([(700, 1), (1100, .4)], 0.08, decay=50), silence(0.35),
             tone([(650, 1), (1050, .4)], 0.08, decay=50))


def s_cheer():
  out = noise_burst(1.6, 0.55, env=lambda t: min(1, t / 0.3) * max(0, min(1, (1.6 - t) / 0.6)))
  return mix(out, s_bell(), 0.4)


def s_wind():
  return noise_burst(1.8, 0.8, env=lambda t: 0.3 + 0.7 * math.sin(math.pi * t / 1.8))


def s_rumble():
  return noise_burst(1.8, 0.98, env=lambda t: min(1, t / 0.3) * (1.8 - t) / 1.8)


SOUNDS = {
    "moo": s_moo, "bark": s_bark, "meow": s_meow, "roar": s_roar,
    "elephant": s_trumpet_animal, "neigh": s_neigh, "baa": s_baa, "oink": s_oink,
    "quack": s_quack, "crow": s_crow, "hoot": s_hoot, "ribbit": s_ribbit,
    "buzz": s_buzz, "hiss": s_hiss, "growl": s_growl, "monkey": s_monkey,
    "squawk": s_squawk, "screech": s_screech, "coo": s_coo, "peacock": s_peacock,
    "honk": s_honk, "chirp": s_chirp, "bubbles": s_bubbles, "dolphin": s_dolphin,
    "whale": s_whale, "camel": s_camel,
    "horn": s_horn, "low_horn": lambda: s_horn(220, 277, 0.6), "siren": s_siren,
    "weewoo": s_weewoo, "wail": lambda: s_siren(500, 1000, 2.2, 2.2),
    "vroom": s_engine, "putt": s_putt, "bike_bell": s_bike_bell, "train": s_train,
    "rail": s_rail_clicks, "whoosh": s_whoosh, "chopper": s_chopper,
    "ship": s_ship_horn, "waves": s_waves, "rocket": s_rocket,
    "drum": s_drum, "guitar": s_guitar, "banjo": s_banjo, "flute": s_flute,
    "trumpet": s_trumpet, "violin": s_violin, "bell": s_bell, "maracas": s_maracas,
    "tick": s_tick, "rain": s_rain, "thunder": s_thunder, "whistle": s_whistle,
    "bat": s_bat_ball, "kick": s_kick, "pock": s_pock, "cheer": s_cheer,
    "wind": s_wind, "rumble": s_rumble,
}

# Which picture makes which sound (category/name or just name)
ITEM_SOUNDS = {
    "Cat": "meow", "Dog": "bark", "Elephant": "elephant", "Cow": "moo", "Horse": "neigh",
    "Tiger": "roar", "Monkey": "monkey", "Goat": "baa", "Pig": "oink", "Camel": "camel",
    "Eagle": "screech", "Swan": "honk", "Peacock": "peacock", "Parrot": "squawk",
    "Duck": "quack", "Owl": "hoot", "Rooster": "crow", "Penguin": "honk",
    "Flamingo": "honk", "Dove": "coo",
    "Fish": "bubbles", "Clownfish": "bubbles", "Pufferfish": "bubbles", "Shark": "bubbles",
    "Dolphin": "dolphin", "Whale": "whale", "Octopus": "bubbles", "Crab": "bubbles",
    "Crocodile": "growl", "Snake": "hiss", "Dinosaur": "roar", "Frog": "ribbit",
    "Lizard": "chirp", "Turtle": "waves",
    "Bee": "buzz", "Butterfly": "wind", "Ant": "chirp", "Ladybug": "buzz",
    "Car": "horn", "Taxi": "horn", "Jeep": "horn", "Racing Car": "vroom",
    "Police Car": "weewoo", "Ambulance": "wail", "Fire Engine": "siren", "Bus": "low_horn",
    "Truck": "low_horn", "Pickup Truck": "horn", "Tractor": "putt", "Auto Rickshaw": "putt",
    "Motorbike": "vroom", "Scooter": "horn", "Bicycle": "bike_bell", "Kick Scooter": "bike_bell",
    "Train": "train", "Coach": "rail", "Aeroplane": "whoosh", "Helicopter": "chopper",
    "Ship": "ship", "Sailboat": "waves", "Road": "horn", "Railway": "train", "Rocket": "rocket",
    "Drum": "drum", "Guitar": "guitar", "Flute": "flute", "Trumpet": "trumpet",
    "Violin": "violin", "Bell": "bell", "Banjo": "banjo", "Maracas": "maracas",
    "Clock": "tick", "Rain": "rain", "Lightning": "thunder", "Cloud": "wind",
    "Volcano": "rumble", "Police": "whistle", "Firefighter": "siren",
    "Cricket": "bat", "Football": "kick", "Ball": "kick", "Tennis": "pock",
    "Badminton": "pock", "Hockey": "bat", "Trophy": "cheer", "Medal": "cheer",
    "Hospital": "wail", "Temple": "bell", "Church": "bell", "School": "bell",
    "Factory": "rumble", "Sea": "waves",
    "Superhero": "whoosh", "Dragon": "roar", "Unicorn": "neigh", "Mermaid": "waves",
    "Fairy": "bell", "Genie": "whoosh", "Wizard": "whoosh", "Ninja": "whoosh",
    "Prince": "trumpet", "Princess": "trumpet", "Alien": "rocket", "Ghost": "wind",
    "Snowman": "wind", "Santa": "bell",
}


def make_samples(key):
  """The raw samples of one sound (same result every time)."""
  random.seed(sum(ord(c) * (i + 1) for i, c in enumerate(key)))
  return SOUNDS[key]()


class CallBank:
  """Makes each real-life sound the first time it is needed."""

  def __init__(self, enabled=True):
    self.enabled = enabled
    self.cache = {}

  def sound_for(self, name):
    return ITEM_SOUNDS.get(name)

  def get(self, key):
    if not self.enabled or key not in SOUNDS:
      return None
    if key not in self.cache:
      try:
        path = os.path.join(SOUND_DIR, key + ".ogg")
        if os.path.exists(path):
          self.cache[key] = pygame.mixer.Sound(path)
        else:
          self.cache[key] = _wav(make_samples(key))
      except Exception as exc:
        print(f"[calls] {key}: {exc}")
        self.cache[key] = None
    return self.cache[key]

  def play(self, name):
    key = self.sound_for(name)
    snd = self.get(key) if key else None
    if snd is not None:
      try:
        snd.play()
      except Exception:
        pass
    return snd is not None
