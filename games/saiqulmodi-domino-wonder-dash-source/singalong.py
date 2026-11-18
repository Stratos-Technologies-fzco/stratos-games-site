"""Sing-along rhymes.

When a rhyme's picture has been traced and its dominoes have toppled, a card
of words slides up over the play area and the rhyme is sung line by line by
the device's voice. Each word lights up in turn with a xylophone note, and a
star bounces over the word being sung, so children follow the words while
they listen (early reading). Hindi and Bengali rhymes show their own script
(pictures made by tools/add_items.py) with the English-letter line under it.

Tap the card to sing again; Next goes to the next rhyme.
"""

import math
import os
import time

import pygame

import domino_data as hub

WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
SOFT = (200, 210, 240)
START_DELAY = 3.0        # s: the "Well done, now let's sing" line is said first
WORD_TIME = 0.46         # s per word at the slow, clear speaking rate
LINE_GAP = 0.9           # s breath between lines
# a gentle up-and-down tune over the pentatonic notes of the pop sound (0..11)
TUNE = [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1]


class SingAlong:

  def __init__(self, game, cat, name, delay=START_DELAY):
    self.g = game
    self.cat, self.name = cat, name
    data = hub.sing_data(cat, name)
    self.lines = data["lines"]
    self.native = data.get("native")
    self.lang = data.get("lang", "en")
    item = hub.CATEGORIES_HUB.get(cat, {}).get(name, {})
    self.native_imgs = item.get("lyric_imgs")
    self.words = [line.split() for line in self.lines]
    self.durations = [LINE_GAP + WORD_TIME * len(w) for w in self.words]
    self.restart(delay)

  def restart(self, delay=0.6):
    self.start = time.time() + delay
    self.shown_at = time.time()
    self.line = -1
    self.word = -1
    self.note = 0
    self.done_at = None

  @property
  def singing(self):
    return self.done_at is None

  def position(self, now):
    """(line, word, time into the line) for this moment; line -1 = not started."""
    t = now - self.start
    if t < 0:
      return -1, -1, 0.0
    for i, d in enumerate(self.durations):
      if t < d:
        words = len(self.words[i])
        w = min(words - 1, int(t / WORD_TIME))
        return i, w, t
      t -= d
    return len(self.lines), -1, 0.0

  def update(self, now):
    if self.done_at is not None:
      return
    line, word, _t = self.position(now)
    if line >= len(self.lines):
      self.done_at = now
      self.g.sfx.play("chime")
      self.g.say(f"Lovely singing! You sang {self.name}!")
      return
    if line != self.line and line >= 0:
      self.line, self.word = line, -1
      self.sing_line(line)
    if word != self.word and word >= 0:
      self.word = word
      self.g.sfx.play("pop", TUNE[self.note % len(TUNE)] + 3)
      self.note += 1

  def sing_line(self, i):
    text = self.lines[i]
    if self.native and i < len(self.native):        # Hindi / Bengali voice if present
      self.g.speaker.say(text, hindi=self.native[i], lang=self.lang)
    else:
      self.g.speaker.say(text, hindi=None, lang="en")

  # ------------------------------------------------------------ drawing
  def card_rect(self, area):
    h = int(min(area.h * 0.44, 320))
    r = pygame.Rect(0, 0, min(area.w - 20, 640), h)
    r.midbottom = (area.centerx, area.bottom - 40)
    return r

  def draw(self, screen, area, now):
    card = self.card_rect(area)
    rise = min(1.0, max(0.0, (now - self.shown_at) / 0.5))        # the card slides up
    card = card.move(0, int((1 - rise) * (card.h + 40)))
    glass = pygame.Surface(card.size, pygame.SRCALPHA)
    pygame.draw.rect(glass, (25, 30, 70, 225), glass.get_rect(), border_radius=22)
    screen.blit(glass, card.topleft)
    pygame.draw.rect(screen, YELLOW, card, 3, border_radius=22)
    head = self.g.font_at(20).render("Sing along!", True, YELLOW)
    screen.blit(head, head.get_rect(midtop=(card.centerx, card.y + 8)))
    for k, dx in enumerate((-1, 1)):                    # dancing music notes
      x = card.centerx + dx * (head.get_width() // 2 + 22)
      y = card.y + 20 + 4 * math.sin(now * 5 + k)
      note(screen, (x, y), YELLOW)

    line, word, _t = self.position(now)
    if self.done_at is not None:
      line = len(self.lines) - 1
    show = max(0, min(line - 1, len(self.lines) - 4)) if line >= 0 else 0
    top = card.y + 40
    row_h = (card.h - 40 - 30) / 4
    for row in range(4):
      i = show + row
      if i >= len(self.lines):
        break
      y = top + row * row_h
      current = i == line and self.done_at is None
      if current:
        bar = pygame.Surface((card.w - 20, int(row_h) - 4), pygame.SRCALPHA)
        pygame.draw.rect(bar, (255, 255, 255, 40), bar.get_rect(), border_radius=12)
        screen.blit(bar, (card.x + 10, int(y)))
      if self.native_imgs and i < len(self.native_imgs):
        self.draw_native(screen, card, i, y, row_h, current, i < line or self.done_at)
      else:
        self.draw_words(screen, card, i, y, row_h, current, word if current else
                        (len(self.words[i]) if i < line or self.done_at else -1), now)
    tip = ("Tap the words to sing again" if self.done_at is not None else
           "Sing with me!")
    t = self.g.font_at(14).render(tip, True, SOFT)
    screen.blit(t, t.get_rect(midbottom=(card.centerx, card.bottom - 6)))

  def draw_words(self, screen, card, i, y, row_h, current, upto, now):
    words = self.words[i]
    max_w = card.w - 40
    size = 24 if current else 19
    font = self.g.font_at(size)
    space = font.size(" ")[0]
    width = sum(font.size(w)[0] for w in words) + space * (len(words) - 1)
    while width > max_w and size > 12:
      size -= 1
      font = self.g.font_at(size)
      space = font.size(" ")[0]
      width = sum(font.size(w)[0] for w in words) + space * (len(words) - 1)
    x = card.centerx - width / 2
    cy = y + row_h / 2
    for k, w in enumerate(words):
      sung = k <= upto
      colour = YELLOW if (current and k == upto) else (WHITE if sung else SOFT)
      img = font.render(w, True, colour)
      lift = 0
      if current and k == upto:
        lift = 3 * abs(math.sin(now * 8))
        star(screen, (x + img.get_width() / 2, cy - img.get_height() / 2 - 8 - lift), 7)
      screen.blit(img, img.get_rect(midleft=(int(x), int(cy - lift))))
      x += img.get_width() + space

  def draw_native(self, screen, card, i, y, row_h, current, sung):
    path = os.path.join(hub.HERE, self.native_imgs[i])
    img = self.g.image(path)
    if img is None:
      return
    h = int(row_h * (0.62 if current else 0.5))
    w = int(img.get_width() * h / img.get_height())
    if w > card.w - 40:
      w = card.w - 40
      h = int(img.get_height() * w / img.get_width())
    pic = self.g.image(path, (max(1, w), max(1, h)))
    if not current and not sung:
      pic = pic.copy()
      pic.set_alpha(150)
    screen.blit(pic, pic.get_rect(midtop=(card.centerx, int(y + 2))))
    if current:
      star(screen, (card.centerx - w / 2 - 14, y + 2 + h / 2), 8)
      roman = self.g.font_at(13).render(self.lines[i], True, SOFT)
      screen.blit(roman, roman.get_rect(midtop=(card.centerx, int(y + 4 + h))))


def star(screen, c, r):
  pts = []
  for k in range(10):
    rad = r if k % 2 == 0 else r * 0.45
    a = -math.pi / 2 + k * math.pi / 5
    pts.append((c[0] + rad * math.cos(a), c[1] + rad * math.sin(a)))
  pygame.draw.polygon(screen, YELLOW, pts)


def note(screen, c, colour):
  """A little quaver: round head and a stem with a flag."""
  x, y = c
  pygame.draw.ellipse(screen, colour, (x - 6, y + 2, 10, 7))
  pygame.draw.line(screen, colour, (x + 3, y + 5), (x + 3, y - 10), 2)
  pygame.draw.line(screen, colour, (x + 3, y - 10), (x + 8, y - 5), 2)
