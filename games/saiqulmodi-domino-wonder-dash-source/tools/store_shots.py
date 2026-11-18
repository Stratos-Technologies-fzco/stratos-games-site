"""Google Play store graphics, rendered from the real game: phone
screenshots (1080 x 1920, with a caption band) and the feature graphic
(1024 x 500). Uses a throwaway save file, so no child's progress is touched.

Run:  python tools/store_shots.py      (writes store/)
"""

import os
import sys
import tempfile
import time

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
os.chdir(ROOT)
os.environ["DOMINO_PROGRESS_FILE"] = os.path.join(tempfile.mkdtemp(), "progress.json")

import pygame  # noqa: E402

import main  # noqa: E402

OUT = os.path.join(ROOT, "store")
W, H = 540, 960            # game canvas; shown 2x, under a caption band
SHOT = (1080, 1920)
BAND = 1920 - 2 * 860
SKY_TOP, SKY_LOW = (120, 205, 255), (60, 140, 235)


class Quiet:
  def say(self, *a, **k):
    pass

  def close(self):
    pass


def gradient(size, top, low):
  s = pygame.Surface(size)
  for y in range(size[1]):
    k = y / size[1]
    pygame.draw.line(s, tuple(int(a + (b - a) * k) for a, b in zip(top, low)), (0, y), (size[0], y))
  return s


def caption_shot(canvas, title, sub, name):
  out = gradient(SHOT, SKY_TOP, SKY_LOW)
  big = main.load_font(74)
  small = main.load_font(40)
  t = big.render(title, True, (255, 255, 255))
  sh = big.render(title, True, (30, 70, 150))
  out.blit(sh, sh.get_rect(center=(SHOT[0] // 2 + 4, 84 + 4)))
  out.blit(t, t.get_rect(center=(SHOT[0] // 2, 84)))
  st = small.render(sub, True, (255, 240, 160))
  out.blit(st, st.get_rect(center=(SHOT[0] // 2, 160)))
  game = pygame.transform.smoothscale(canvas.subsurface((0, 0, W, 860)), (2 * W, 2 * 860))
  frame = pygame.Rect(0, BAND, 2 * W, 2 * 860)
  out.blit(game, frame)
  pygame.image.save(out, os.path.join(OUT, name))
  print("wrote", name)


def main_shots():
  os.makedirs(OUT, exist_ok=True)
  pygame.init()
  pygame.display.set_mode((W, H))
  main.set_layout(W, H)
  g = main.Game(main.SoundBank(), Quiet())
  g.progress.data["guides"] = ["trace", "quiz", "spell", "draw", "road"]
  g.progress.data["name"] = "Aarav"
  canvas = pygame.Surface((W, H))

  def run(sec):
    for _ in range(int(sec * 30)):
      g.update()
      time.sleep(1 / 30)

  def draw():
    g.draw(canvas)
    return canvas

  # earn a few cap colours so the rainbow cap shows
  for subj, cats in list(g.subjects.items())[:4]:
    first = next(iter(main.hub.CATEGORIES_HUB[cats[0]]))
    g.progress.data["done"].append(main.hub.item_key(cats[0], first))

  # 1. Wonder Town
  g.world.close_tips()
  run(0.5)
  caption_shot(draw(), "Wonder Town", "Walk, swing and fly to every subject", "1_town.png")

  # 2. tracing a real picture
  g.in_world = False
  g.subject, g.cat, g.puzzle = "Nature", "Animals", "Cat"
  g.load_item(announce=False)
  half = len(g.dots) * 3 // 5
  for i in range(half):
    g.covered[i] = True
  g.strokes = [list(g.dots[:half])]
  g.last_progress_at = time.time()
  caption_shot(draw(), "Trace the dots", "Real outlines of animals, letters, maps", "2_trace.png")

  # 3. finished: real picture, name spelled
  g.covered = [True] * len(g.dots)
  g.stand_dominoes(g.loops)
  for d in g.dominoes:
    d.state, d.current_angle, d.drop_at = "fallen", 1.57, 0
  g.stage = "running"
  g.update()
  run(3.0)                         # the real picture fades in
  g.celebration = g.cap_won = None
  g.particles.texts = []
  g.announced_at = time.time() - 6
  caption_shot(draw(), "Hear it, spell it", "English, Hindi and Bengali voices", "3_spell.png")

  # 4. Cross the Road
  g.set_mode("road")
  r = g.road
  while r.walk_light() != "green":
    run(0.2)
  run(0.6)
  caption_shot(draw(), "Road safety", "Red STOP, green GO: cross safely", "4_road.png")

  # 5. India map
  g.set_mode("trace")
  g.subject, g.cat, g.puzzle = "India", "India Map", "India Map"
  g.load_item(announce=False)
  g.covered = [True] * len(g.dots)
  g.stand_dominoes(g.loops)
  for d in g.dominoes:
    d.state, d.current_angle = "fallen", 1.57
  g.stage = "running"
  g.update()
  run(3.0)
  g.celebration = g.cap_won = None
  g.particles.texts = []
  caption_shot(draw(), "Know India", "28 states, 8 union territories", "5_india.png")

  # 6. picture guide
  g.progress.data["guides"].remove("trace")
  g.update()
  import howto
  howto.GUIDE.open(g, "trace", 1)
  howto.GUIDE.at = time.time() - 2.2
  caption_shot(draw(), "Easy for little ones", "Moving pictures show how to play", "6_guide.png")
  g.overlay = None

  # 8. sing-along rhyme (saved as 8_rhymes.png)
  g.set_mode("trace")
  g.subject, g.cat, g.puzzle = "Rhymes", "Classic Rhymes", "Twinkle Twinkle"
  g.load_item(announce=False)
  g.covered = [True] * len(g.dots)
  g.stand_dominoes(g.loops)
  for d in g.dominoes:
    d.state, d.current_angle = "fallen", 1.57
  g.stage = "running"
  g.update()
  g.celebration = g.cap_won = None
  g.sing.restart(delay=0.0)
  run(4.2)
  g.particles.texts = []
  rhyme_canvas = draw().copy()

  # 7. Find it! quiz
  g.subject, g.cat, g.puzzle = "Nature", "Animals", "Cat"
  g.set_mode("quiz")
  run(0.3)
  caption_shot(draw(), "Find it!", "Listen, then tap the right picture", "7_quiz.png")
  caption_shot(rhyme_canvas, "Sing-along rhymes", "47 rhymes in English, Hindi, Bangla",
               "8_rhymes.png")

  feature_graphic(g)


def feature_graphic(g):
  s = gradient((1024, 500), SKY_TOP, SKY_LOW)
  pygame.draw.ellipse(s, (90, 200, 110), (-200, 380, 1424, 300))
  icon = pygame.image.load(os.path.join(ROOT, "icons", "icon-512.png")).convert()
  icon = pygame.transform.smoothscale(icon, (250, 250))
  card = pygame.Surface((250, 250), pygame.SRCALPHA)
  pygame.draw.rect(card, (255, 255, 255), card.get_rect(), border_radius=46)
  card.blit(icon, (0, 0), special_flags=pygame.BLEND_RGBA_MIN)
  pygame.draw.rect(s, (255, 255, 255), (52, 117, 266, 266), border_radius=52)
  s.blit(card, (60, 125))
  big = main.load_font(72)
  for n, line in enumerate(("Domino", "Game")):
    t = big.render(line, True, (255, 255, 255))
    sh = big.render(line, True, (30, 70, 150))
    s.blit(sh, (364, 92 + n * 84))
    s.blit(t, (360, 88 + n * 84))
  sub = main.load_font(34).render("Learn while you play  |  Class 1-7", True, (255, 240, 160))
  s.blit(sub, (364, 272))
  for k, (cat, name) in enumerate([("Animals", "Cat"), ("Road Safety", "Traffic Light"),
                                   ("Fruits", "Apple"), ("Vehicles", "Bus"), ("Sky", "Rainbow")]):
    th = g.thumb(name, cat, 78)
    if th is not None:
      s.blit(th, th.get_rect(center=(400 + k * 118, 390)))
  pygame.image.save(s, os.path.join(OUT, "feature_graphic.png"))
  pygame.image.save(pygame.image.load(os.path.join(ROOT, "icons", "icon-512.png")),
                    os.path.join(OUT, "icon_512.png"))
  print("wrote feature_graphic.png, icon_512.png")


if __name__ == "__main__":
  main_shots()
