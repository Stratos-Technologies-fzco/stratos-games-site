"""Extra ways to play: Quiz ("Find it!") and Spell it.

Both draw inside the play area and use the same pictures, voice, sounds and
progress as the tracing game.
"""

import math
import random
import time

import pygame

import domino_data as hub
import symbols

CUSTOM = "Custom Draw"
WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
GREEN = (60, 210, 110)
RED = (240, 70, 80)


def label_of(cat, name):
  item = hub.CATEGORIES_HUB[cat][name]
  return item.get("label") or item.get("tile_text") or name


def fresh_pick(game, key, options, keep=6):
  """A random option that was not among the last `keep` picks for `key` (when possible).

  The memory lives on the game, so it survives switching modes and back.
  """
  recent = game.__dict__.setdefault("_recent_picks", {}).setdefault(key, [])
  keep = min(keep, len(options) // 2)   # always leave a real choice, so a short list never becomes a fixed cycle
  fresh = [o for o in options if o not in recent[-keep:]] if keep else options
  pick = random.choice(fresh or options)
  recent.append(pick)
  del recent[:-12]
  return pick


# --------------------------------------------------------------------------
# Quiz: the voice says a name, the child taps the right picture of four
# --------------------------------------------------------------------------
class QuizMode:

  def __init__(self, game, target=None):
    self.g = game
    self.new_question(target)

  def pool(self):
    g = self.g
    names = [(g.cat, n) for n in hub.CATEGORIES_HUB[g.cat] if n != CUSTOM]
    if len(names) >= 4:
      return names
    names = [(c, n) for c in g.subjects[g.subject] for n in hub.CATEGORIES_HUB[c]
             if n != CUSTOM]
    if len(names) >= 4:
      return names
    return [(c, n) for c in hub.CATEGORIES_HUB for n in hub.CATEGORIES_HUB[c] if n != CUSTOM]

  def new_question(self, target=None):
    g = self.g
    pool = self.pool()
    if target is None or target not in pool:
      target = fresh_pick(g, "find", pool)
    others = [p for p in pool if p[1] != target[1]]
    random.shuffle(others)
    picked, seen = [], {target[1]}
    for p in others:
      if p[1] not in seen:
        picked.append(p)
        seen.add(p[1])
      if len(picked) == 3:
        break
    self.choices = picked + [target]
    random.shuffle(self.choices)
    self.target = target
    self.wrong = set()
    self.shake = {}
    self.solved_at = None
    g.cat, g.puzzle = target
    g.page = g.page_of(g.puzzle)
    self.ask()

  def ask(self):
    cat, name = self.target
    word = label_of(cat, name)
    g = self.g
    g.announced_at = time.time()
    native = g.native_word(cat, name)
    lang = g.lang
    if hub.CATEGORIES_HUB[cat][name].get("hindi"):
      native = hub.CATEGORIES_HUB[cat][name]["hindi"]
      lang = hub.CATEGORIES_HUB[cat][name].get("say_lang", "hi")
    g.say(f"Find the {word}!",
          native and (f"{native} कहाँ है?" if lang == "hi" else f"{native} কোথায়?"), lang)

  def rects(self):
    area = g_area()
    top = area.top + 46
    w, h = (area.w - 36) // 2, (area.h - 46 - 52) // 2
    out = []
    for i in range(4):
      r, c = divmod(i, 2)
      out.append(pygame.Rect(area.left + 12 + c * (w + 12), top + r * (h + 12), w, h))
    return out

  def press(self, pos):
    if self.solved_at is not None:
      return
    g = self.g
    for i, rect in enumerate(self.rects()):
      if not rect.collidepoint(pos) or i in self.wrong:
        continue
      cat, name = self.choices[i]
      if (cat, name) == self.target:
        self.solved_at = time.time()
        g.sfx.play("switch")
        g.particles.burst(rect.centerx, rect.centery, n=40)
        g.calls.play(name)
        g.progress.quiz_answer(len(self.wrong) == 0)
        g.say(f"Yes! That is the {label_of(cat, name)}!",
              g.native_word(cat, name), g.lang)
      else:
        self.wrong.add(i)
        self.shake[i] = time.time()
        g.sfx.play("tip")
        tc, tn = self.target
        g.say(f"That is the {label_of(cat, name)}. Find the {label_of(tc, tn)}!",
              g.native_word(cat, name), g.lang)
      return

  def update(self, now):
    if self.solved_at is not None and now - self.solved_at > 2.2:
      self.new_question()

  def draw(self, screen, now):
    g = self.g
    area = g_area()
    cat, name = self.target
    prompt = g.hint_font.render(f"Find the {label_of(cat, name)}!", True, YELLOW)
    if symbols.ONLY:                             # the name is heard, not read: a speaker instead of the sentence
      prompt = pygame.Surface((54, 44), pygame.SRCALPHA)
      symbols.draw(prompt, "speaker", prompt.get_rect(), YELLOW)
    screen.blit(prompt, prompt.get_rect(center=(area.centerx, area.top + 22)))
    for i, rect in enumerate(self.rects()):
      ccat, cname = self.choices[i]
      dx = 0
      if i in self.shake and now - self.shake[i] < 0.4:
        dx = int(8 * math.sin((now - self.shake[i]) * 50))
      r = rect.move(dx, 0)
      solved = self.solved_at is not None and (ccat, cname) == self.target
      color = GREEN if solved else (RED if i in self.wrong else g.theme["cell"])
      pygame.draw.rect(screen, color, r, border_radius=14)
      pygame.draw.rect(screen, WHITE, r, 3, border_radius=14)
      th = g.thumb(cname, ccat, min(r.w, r.h) - 40)
      if th is not None:
        screen.blit(th, th.get_rect(center=(r.centerx, r.centery - 8)))
      if solved or i in self.wrong:      # show the name once it is known
        lbl = g.hint_font.render("" if symbols.ONLY else label_of(ccat, cname), True, WHITE)
        screen.blit(lbl, lbl.get_rect(center=(r.centerx, r.bottom - 16)))
      if i in self.wrong:
        pygame.draw.line(screen, WHITE, (r.right - 30, r.top + 10), (r.right - 10, r.top + 30), 4)
        pygame.draw.line(screen, WHITE, (r.right - 10, r.top + 10), (r.right - 30, r.top + 30), 4)
    q = g.progress.data["quiz"]
    score = g.small_font.render(f"{q['right']} / {q['asked']}" if symbols.ONLY else
                                f"Right first time: {q['right']} of {q['asked']}", True, WHITE)
    screen.blit(score, score.get_rect(center=(area.centerx, area.bottom - 14)))


# --------------------------------------------------------------------------
# Spell it: tap the letters in the right order
# --------------------------------------------------------------------------
def spellable(cat, name):
  item = hub.CATEGORIES_HUB[cat][name]
  return (item["source"] not in ("glyph", "hindi", "bangla", "custom") and name.isalpha()
          and 2 <= len(name) <= 9)


class SpellMode:

  def __init__(self, game, name=None):
    self.g = game
    self.start(name)

  def candidates(self):
    g = self.g
    words = [(g.cat, n) for n in hub.CATEGORIES_HUB[g.cat] if spellable(g.cat, n)]
    if words:
      return words
    return [("Animals", n) for n in hub.CATEGORIES_HUB["Animals"] if spellable("Animals", n)]

  def start(self, name=None):
    g = self.g
    words = self.candidates()
    target = (g.cat, name) if name and spellable(g.cat, name) else None
    if target is None:
      target = fresh_pick(g, "spell", words)
    self.target = target
    g.cat, g.puzzle = target
    g.page = g.page_of(g.puzzle)
    self.letters = list(target[1].upper())
    order = list(range(len(self.letters)))
    for _ in range(10):
      random.shuffle(order)
      if order != sorted(order) or len(order) < 2:
        break
    self.pool = [(self.letters[i], i) for i in order]   # (letter, tile id)
    self.used = set()
    self.placed = 0
    self.shake = {}
    self.done_at = None
    g.banner_override = "SPELL IT"
    g.announced_at = time.time()
    g.say(f"Spell the word: {target[1]}.", g.native_word(*target), g.lang)

  def layout(self):
    area = g_area()
    n = len(self.letters)
    size = min(44, (area.w - 30) // max(1, n) - 6)
    slots = []
    x0 = area.centerx - (n * (size + 6) - 6) / 2
    for i in range(n):
      slots.append(pygame.Rect(int(x0 + i * (size + 6)), area.top + 200, size, size + 6))
    tiles = []
    per_row = min(n, 6)
    big = 52
    for k, _ in enumerate(self.pool):
      r, c = divmod(k, per_row)
      row_n = min(per_row, n - r * per_row)
      x = area.centerx - (row_n * (big + 10) - 10) / 2 + c * (big + 10)
      tiles.append(pygame.Rect(int(x), area.top + 270 + r * (big + 12), big, big))
    return slots, tiles

  def press(self, pos):
    g = self.g
    if self.done_at is not None:
      if time.time() - self.done_at > 0.8:
        g.sfx.play("click")
        self.start()
      return
    slots, tiles = self.layout()
    for k, rect in enumerate(tiles):
      letter, tid = self.pool[k]
      if tid in self.used or not rect.collidepoint(pos):
        continue
      if letter == self.letters[self.placed]:
        self.used.add(tid)
        self.placed += 1
        g.sfx.play("pop", min(11, self.placed * 12 // len(self.letters)))
        s = slots[self.placed - 1]
        g.particles.sparks(s.centerx, s.centery, YELLOW, n=8)
        if self.placed == len(self.letters):
          self.finish()
      else:
        self.shake[tid] = time.time()
        g.sfx.play("tip")
      return

  def finish(self):
    g = self.g
    cat, name = self.target
    self.done_at = time.time()
    g.banner_override = None
    g.spell_aloud()            # says and spells the word (the child just spelled it)
    g.sfx.play("chime")
    g.particles.confetti(g_area())
    g.calls.play(name)
    g.progress.spelled(name)

  def update(self, now):
    pass

  def draw(self, screen, now):
    g = self.g
    area = g_area()
    cat, name = self.target
    th = g.thumb(name, cat, 150)
    if th is not None:
      screen.blit(th, th.get_rect(center=(area.centerx, area.top + 100)))
    slots, tiles = self.layout()
    tile_font = g.font_at(30)
    for i, s in enumerate(slots):
      filled = i < self.placed
      pygame.draw.rect(screen, YELLOW if filled else g.theme["banner"], s, border_radius=8)
      pygame.draw.rect(screen, WHITE, s, 2, border_radius=8)
      if filled:
        lbl = tile_font.render(self.letters[i], True, g.theme["bg"])
        screen.blit(lbl, lbl.get_rect(center=s.center))
    for k, rect in enumerate(tiles):
      letter, tid = self.pool[k]
      if tid in self.used:
        continue
      dx = 0
      if tid in self.shake and now - self.shake[tid] < 0.4:
        dx = int(7 * math.sin((now - self.shake[tid]) * 50))
      r = rect.move(dx, 0)
      color = pygame.Color(0)
      color.hsva = ((tid * 47) % 360, 65, 95, 100)
      pygame.draw.rect(screen, color, r, border_radius=10)
      pygame.draw.rect(screen, WHITE, r, 2, border_radius=10)
      lbl = tile_font.render(letter, True, g.theme["bg"])
      screen.blit(lbl, lbl.get_rect(center=r.center))
    if symbols.ONLY:                             # a star when the word is right, a tapping hand while spelling
      if self.done_at is not None:
        symbols.star(screen, (area.centerx, area.bottom - 18), 16)
      else:
        symbols.draw(screen, "hand", pygame.Rect(area.centerx - 18, area.bottom - 36, 36, 36), (170, 180, 210))
      return
    msg = ("Well done! Tap for the next word" if self.done_at is not None
           else "Tap the letters in the right order")
    s = g.hint_font.render(msg, True, YELLOW if self.done_at else (170, 180, 210))
    screen.blit(s, s.get_rect(center=(area.centerx, area.bottom - 14)))


_AREA = [None]


def set_area(rect):
  _AREA[0] = rect


def g_area():
  return _AREA[0]
