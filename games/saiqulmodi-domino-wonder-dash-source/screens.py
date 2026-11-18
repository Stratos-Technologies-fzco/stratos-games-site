"""Full-screen panels opened from the Games button: the menu, players,
renaming (with an on-screen keyboard), the parents' report and stories.
"""

import math
import time

import pygame

import domino_data as hub
import fun
import howto
import stories
import symbols
import world
from translations import LANGUAGES

WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
CYAN = (0, 255, 204)
HINT = (170, 180, 210)
GOLD = (255, 215, 0)

AREA_BOTTOM = 744        # panels cover everything above the bottom buttons


def shade(screen, theme, alpha=245):
  s = pygame.Surface((screen.get_width(), AREA_BOTTOM), pygame.SRCALPHA)
  s.fill((*theme["bg"], alpha))
  screen.blit(s, (0, 0))


def title(screen, g, text, y=26, words=False):
  if symbols.ONLY and not words:           # no headings for children (symbols only); grown-up pages pass words=True
    return
  t = g.big_font.render(text, True, YELLOW)
  screen.blit(t, t.get_rect(center=(screen.get_width() / 2, y)))


def button(screen, g, rect, text, color, icon=None, sub=None, active=False, words=False):
  pygame.draw.rect(screen, color, rect, border_radius=12)
  pygame.draw.rect(screen, YELLOW if active else WHITE, rect, 3 if active else 2,
                   border_radius=12)
  if symbols.ONLY and not words:           # the picture alone, centred and bigger; no label
    if icon is not None:
      room = max(16, min(rect.w, rect.h) - 14)          # fit inside the tile both ways
      k = room / max(1, icon.get_width(), icon.get_height())
      big = pygame.transform.smoothscale(icon, (max(1, int(icon.get_width() * k)), max(1, int(icon.get_height() * k))))
      screen.blit(big, big.get_rect(center=rect.center))
    else:
      symbols.draw(screen, symbols.kind_of(text), rect)
    return
  x = rect.x + 12
  if icon is not None:
    screen.blit(icon, icon.get_rect(midleft=(x, rect.centery)))
    x += icon.get_width() + 12
  lbl = g.hint_font.render(text, True, WHITE)
  if sub:
    screen.blit(lbl, lbl.get_rect(midleft=(x, rect.centery - 9)))
    s = g.small_font.render(sub, True, (230, 235, 255))
    screen.blit(s, s.get_rect(midleft=(x, rect.centery + 12)))
  else:
    screen.blit(lbl, lbl.get_rect(midleft=(x, rect.centery)))


def crayon_icon(size):
  """A little painter's palette: the free-drawing crayons."""
  surf = pygame.Surface((size, size), pygame.SRCALPHA)
  pygame.draw.ellipse(surf, (235, 200, 150), (1, 5, size - 2, size - 10))
  pygame.draw.ellipse(surf, (120, 80, 40), (1, 5, size - 2, size - 10), 2)
  colours = [(233, 69, 96), (255, 204, 0), (80, 200, 90), (60, 160, 255), (170, 110, 255)]
  spots = [(0.28, 0.38), (0.5, 0.28), (0.72, 0.38), (0.75, 0.62), (0.5, 0.72)]
  for c, (fx, fy) in zip(colours, spots):
    pygame.draw.circle(surf, c, (int(size * fx), int(size * fy)), size // 9)
  pygame.draw.circle(surf, (120, 80, 40), (int(size * 0.27), int(size * 0.64)), size // 10)
  return surf


def domino_icon(size):
  """Three dominoes tipping over one after another: the domino playground."""
  surf = pygame.Surface((size, size), pygame.SRCALPHA)
  w, h = max(6, size // 5), max(14, int(size * 0.62))
  for k, (tilt, col) in enumerate(((0, (233, 69, 96)), (-22, (255, 204, 0)), (-58, (60, 160, 255)))):
    tile = pygame.Surface((w, h), pygame.SRCALPHA)
    pygame.draw.rect(tile, col, tile.get_rect(), border_radius=3)
    pygame.draw.rect(tile, (40, 40, 60), tile.get_rect(), 2, border_radius=3)
    pygame.draw.line(tile, (255, 255, 255), (2, h // 2), (w - 3, h // 2), 1)
    for fy in (0.25, 0.75):
      pygame.draw.circle(tile, (255, 255, 255), (w // 2, int(h * fy)), max(1, w // 5))
    rot = pygame.transform.rotate(tile, tilt)
    surf.blit(rot, rot.get_rect(midbottom=(int(size * (0.22 + 0.3 * k)), size - 2)))
  return surf


# --------------------------------------------------------------------------
def maths_line(p):
  """Maths Play for the parents report: right first time and chapters with a gold star."""
  m = p.get("maths") or {}
  if not m.get("asked"):
    return "-"
  gold = sum(1 for v in (m.get("stars") or {}).values() if v >= 10)
  return f"{m.get('right', 0)} of {m['asked']}, {gold} chapter stars"


class Menu:
  """The Games menu."""

  def rows(self, g):
    today = g.story_of_today()
    player = g.progress.data
    items = [
        ("trace", "Trace & Topple", ("Home", "Pencil"), "Draw over the dots"),
        ("quiz", "Find it!", ("Home", "Bulb"), "Hear a name, tap the picture"),
        ("spell", "Spell it", ("ABC", "A"), "Put the letters in order"),
        ("draw", "Draw my own", ("Home", "Pencil"), "Draw anything you imagine"),
        ("topple", "Domino playground", None, "Lay your own dominoes, watch them fall"),
        ("road", "Cross the Road", ("Road Safety", "Traffic Light"), "Red stop, green go: road safety"),
        ("maths", "Maths Play", ("123", "7"), "Count, add, tables, integers: Class 1-7"),
        ("story", "Story of the day", (today["steps"][0][0], today["steps"][0][1]),
         today["title"]),
        ("stories", "All stories", ("Sky", "Rainbow"), f"{len(stories.STORIES)} adventures"),
        ("players", f"Player: {player['name']}", fun.AVATARS[player["avatar"]],
         "Tap to change or add a player"),
        ("lang", "Language", ("Countries", "India"), None),
        ("howto", "How to play", None, "Pictures show you what to do"),
        ("parents", "For parents", ("Helpers", "Teacher"), "See what your child learned"),
    ]
    full = getattr(g, "fullscreen", None)
    if full and full.available:
      items.append(("screen", "Exit full screen" if full.is_full() else "Full screen",
                    ("Sky", "Mountain"),
                    "Back to a window" if full.is_full() else "Fill the whole screen"))
    out = []
    if symbols.ONLY:                        # picture tiles, 4 a row; the language tabs on their own row
      tiles = [it for it in items if it[0] != "lang"]
      size, gap = 96, 11
      for i, it in enumerate(tiles):
        out.append((pygame.Rect(16 + (i % 4) * (size + gap), 40 + (i // 4) * (size + gap), size, size), it))
      lang = next(it for it in items if it[0] == "lang")
      out.append((pygame.Rect(16, 40 + ((len(tiles) + 3) // 4) * (size + gap) + 6, 418, 56), lang))
      return out
    step = min(76, (AREA_BOTTOM - 34 - 56) // len(items))
    for i, it in enumerate(items):
      out.append((pygame.Rect(16, 56 + i * step, 418, step - 7), it))
    return out

  @staticmethod
  def lang_box(rect):
    """The English | हिंदी | বাংলা tabs on the right of the Language row."""
    h = min(36, rect.h - 10)
    if symbols.ONLY:
      return pygame.Rect(rect.x + 10, rect.centery - h // 2, rect.w - 20, h)
    return pygame.Rect(rect.x + 170, rect.centery - h // 2, rect.w - 180, h)

  def draw(self, screen, g, now):
    shade(screen, g.theme)
    title(screen, g, "Play & Learn")
    drawing = g.mode == "trace" and not g.story and g.is_custom
    for rect, (key, text, icon, sub) in self.rows(g):
      active = (key == g.mode and key in ("trace", "quiz", "spell", "road", "maths", "topple") and not g.story
                and not (key == "trace" and drawing))
      if key == "story" and g.story:
        active = True
      if key == "draw":
        active = drawing
      if key == "draw":
        pic = crayon_icon(44)
      elif key == "topple":
        pic = domino_icon(44)
      elif key == "howto":
        pic = howto.help_icon(44)
      else:
        pic = g.thumb(icon[1], icon[0], 44)
      if key == "lang" and symbols.ONLY:     # the language names are written in their own script: the symbol
        pygame.draw.rect(screen, g.theme["subject"], rect, border_radius=12)
      else:
        button(screen, g, rect, text, g.theme["subject"], pic, sub, active)
      if key == "lang":
        g.draw_lang_tabs(screen, g.lang_tab_rects(self.lang_box(rect)))
    if not symbols.ONLY:
      tip = g.small_font.render("Tap outside a button to close", True, HINT)
      screen.blit(tip, tip.get_rect(center=(225, AREA_BOTTOM - 12)))

  def press(self, g, pos):
    for rect, (key, *_rest) in self.rows(g):
      if rect.collidepoint(pos):
        g.sfx.play("click")
        if key in ("trace", "quiz", "spell", "road", "maths"):
          g.set_mode(key)
          g.overlay = None
        elif key == "draw":
          g.start_drawing()
          g.overlay = None
        elif key == "topple":
          g.enter_topple()
          g.overlay = None
        elif key == "story":
          g.start_story(g.story_of_today())
          g.overlay = None
        elif key == "stories":
          g.overlay = "stories"
        elif key == "players":
          g.overlay = "players"
        elif key == "lang":
          code = g.lang_tab_hit(pos, self.lang_box(rect))
          if code:
            g.set_language(code)
        elif key == "howto":
          g.open_guide()
        elif key == "parents":
          g.overlay = "parents"
        elif key == "screen":
          g.fullscreen.toggle()
          g.overlay = None
        return
    g.overlay = None


# --------------------------------------------------------------------------
class Players:
  """Who is playing? Up to 6 children on one device."""

  def cards(self, g):
    profs = g.progress.profiles()
    n = len(profs) + (1 if len(profs) < fun.MAX_PLAYERS else 0)
    out = []
    for i in range(n):
      r, c = divmod(i, 2)
      card = pygame.Rect(16 + c * 213, 60 + r * 200, 205, 188)
      out.append((card, i if i < len(profs) else "new"))
    return out

  def draw(self, screen, g, now):
    shade(screen, g.theme)
    title(screen, g, "Who is playing?")
    profs = g.progress.profiles()
    for card, idx in self.cards(g):
      if idx == "new":
        pygame.draw.rect(screen, g.theme["cell"], card, border_radius=14)
        pygame.draw.rect(screen, WHITE, card, 2, border_radius=14)
        plus = g.font_at(60).render("+", True, WHITE)
        screen.blit(plus, plus.get_rect(center=(card.centerx, card.centery - 16)))
        if not symbols.ONLY:
          t = g.hint_font.render("New player", True, WHITE)
          screen.blit(t, t.get_rect(center=(card.centerx, card.bottom - 30)))
        continue
      p = profs[idx]
      current = idx == g.progress.store["current"]
      pygame.draw.rect(screen, g.theme["subject"] if current else g.theme["cell"], card,
                       border_radius=14)
      pygame.draw.rect(screen, YELLOW if current else WHITE, card, 3 if current else 2,
                       border_radius=14)
      cat, name = fun.AVATARS[p["avatar"]]
      th = g.thumb(name, cat, 70)
      if th is not None:
        screen.blit(th, th.get_rect(center=(card.centerx, card.top + 50)))
      caps = len(fun.cap_subjects(p["done"], g.subjects))     # each child's own cap
      world.WorldScene.draw_rainbow_cap(screen, (card.right - 30, card.top + 30), 14,
                                        (card.right - 8, card.top + 32), fun.cap_colours(caps))
      nm = g.hint_font.render(p["name"], True, WHITE)
      screen.blit(nm, nm.get_rect(center=(card.centerx, card.top + 104)))
      ren = self.rename_rect(card)
      pygame.draw.rect(screen, (230, 160, 20), ren, border_radius=8)
      if symbols.ONLY:                       # pictures traced (a domino) and stickers (a star), as numbers; pencil = rename
        y = card.top + 130
        pygame.draw.rect(screen, WHITE, (card.centerx - 70, y - 9, 8, 18), border_radius=2)
        n1 = g.small_font.render(str(len(p['done'])), True, (230, 235, 255))
        screen.blit(n1, n1.get_rect(midleft=(card.centerx - 56, y)))
        symbols.star(screen, (card.centerx + 22, y), 9)
        n2 = g.small_font.render(str(len(p['stickers'])), True, (230, 235, 255))
        screen.blit(n2, n2.get_rect(midleft=(card.centerx + 36, y)))
        symbols.draw(screen, "pencil", ren)
      else:
        info = g.small_font.render(f"{len(p['done'])} traced, {len(p['stickers'])} stickers",
                                   True, (230, 235, 255))
        screen.blit(info, info.get_rect(center=(card.centerx, card.top + 128)))
        t = g.small_font.render("Rename", True, WHITE)
        screen.blit(t, t.get_rect(center=ren.center))

  @staticmethod
  def rename_rect(card):
    return pygame.Rect(card.centerx - 45, card.bottom - 38, 90, 28)

  def press(self, g, pos):
    for card, idx in self.cards(g):
      if not card.collidepoint(pos):
        continue
      g.sfx.play("click")
      if idx == "new":
        g.progress.add_profile()
        g.apply_profile()
        g.start_rename()
        return
      if self.rename_rect(card).collidepoint(pos):
        g.progress.switch(idx)
        g.apply_profile()
        g.start_rename()
        return
      g.progress.switch(idx)
      g.apply_profile()
      g.overlay = None
      g.say(f"Hello {g.progress.data['name']}!")
      return
    g.overlay = None


# --------------------------------------------------------------------------
KEYS = ["ABCDEFG", "HIJKLMN", "OPQRSTU", "VWXYZ"]


class Rename:
  """Type a name with the keyboard or the big on-screen letters."""

  def keys(self):
    out = []
    for r, row in enumerate(KEYS):
      for c, ch in enumerate(row):
        out.append((pygame.Rect(16 + c * 60, 250 + r * 66, 54, 58), ch))
    out.append((pygame.Rect(16 + 5 * 60, 250 + 3 * 66, 114, 58), "DEL"))
    out.append((pygame.Rect(16, 250 + 4 * 66, 200, 58), "SPACE"))
    out.append((pygame.Rect(234, 250 + 4 * 66, 200, 58), "DONE"))
    return out

  def draw(self, screen, g, now):
    shade(screen, g.theme)
    title(screen, g, "Type your name")
    box = pygame.Rect(30, 120, 390, 70)
    pygame.draw.rect(screen, g.theme["banner"], box, border_radius=12)
    pygame.draw.rect(screen, YELLOW, box, 3, border_radius=12)
    text = g.rename_text + ("|" if int(now * 2) % 2 == 0 else " ")
    t = g.font_at(34).render(text, True, WHITE)
    screen.blit(t, t.get_rect(midleft=(box.x + 16, box.centery)))
    for rect, ch in self.keys():
      color = (60, 180, 90) if ch == "DONE" else ((255, 100, 100) if ch == "DEL"
                                                  else g.theme["subject"])
      pygame.draw.rect(screen, color, rect, border_radius=10)
      pygame.draw.rect(screen, WHITE, rect, 2, border_radius=10)
      lbl = (g.hint_font if len(ch) > 1 else g.font_at(28)).render(ch, True, WHITE)
      screen.blit(lbl, lbl.get_rect(center=rect.center))

  def press(self, g, pos):
    for rect, ch in self.keys():
      if rect.collidepoint(pos):
        g.sfx.play("click")
        if ch == "DONE":
          g.finish_rename()
        elif ch == "DEL":
          g.rename_text = g.rename_text[:-1]
        elif ch == "SPACE":
          g.type_text(" ")
        else:
          g.type_text(ch if not g.rename_text or g.rename_text.endswith(" ") else ch.lower())
        return


# --------------------------------------------------------------------------
class Parents:
  """What the current child has learned."""

  def draw(self, screen, g, now):
    shade(screen, g.theme, 250)
    p = g.progress.data
    title(screen, g, f"{p['name']}'s learning", words=True)
    y = 58
    for subj, cats in g.subjects.items():
      keys = [hub.item_key(c, n) for c in cats for n in hub.CATEGORIES_HUB[c]]
      done = sum(1 for k in keys if g.progress.is_done(k))
      lbl = g.cat_font.render(subj, True, WHITE)
      screen.blit(lbl, (20, y))
      bar = pygame.Rect(130, y + 2, 230, 16)
      pygame.draw.rect(screen, g.theme["cell"], bar, border_radius=8)
      if keys:
        fill = bar.copy()
        fill.w = max(0, int(bar.w * done / len(keys)))
        if fill.w:
          pygame.draw.rect(screen, CYAN, fill, border_radius=8)
      n = g.small_font.render(f"{done}/{len(keys)}", True, WHITE)
      screen.blit(n, (370, y + 1))
      y += 26 if len(g.subjects) > 13 else 30     # leaves room for every line below
    q, s = p["quiz"], p["spell"]
    acc = f"{round(100 * q['right'] / q['asked'])}%" if q["asked"] else "-"
    stats = [
        ("Pictures traced", f"{len(p['done'])} of {g.progress.total}"),
        ("Quiz: right first time", f"{q['right']} of {q['asked']} ({acc})"),
        ("Words spelled", f"{len(s['words'])} different, {s['right']} times"),
        ("Stories finished", f"{len(p['stories'])} of {len(stories.STORIES)}"),
        ("Stickers", f"{len(p['stickers'])}"),
        ("Safe road crossings", f"{p.get('road', {}).get('safe', 0)}"),
        ("Maths: right first time", maths_line(p)),
        ("Rainbow cap colours", f"{min(7, len(fun.cap_subjects(p['done'], g.subjects)))} of 7"),
        ("Best trace streak", f"{p.get('best_streak', 0)} dots"),
        ("Days played", f"{len(p['days'])}"),
        ("Language", LANGUAGES[p.get("lang", "hi")]),
    ]
    y += 10
    step = max(18, min(28, (AREA_BOTTOM - 62 - y) // len(stats)))   # every row fits above the buttons
    for k, v in stats:
      a = g.cat_font.render(k, True, HINT)
      b = g.cat_font.render(v, True, WHITE)
      screen.blit(a, (20, y))
      screen.blit(b, b.get_rect(topright=(430, y)))
      y += step
    tip = g.small_font.render("Tap anywhere to go back", True, HINT)
    screen.blit(tip, tip.get_rect(midleft=(20, AREA_BOTTOM - 14)))
    button(screen, g, CREDITS_BTN, "Credits", (90, 110, 170), words=True)

  def press(self, g, pos):
    if CREDITS_BTN.collidepoint(pos):
      g.sfx.play("switch")
      g.overlay = "credits"
      return
    g.overlay = None


# --------------------------------------------------------------------------
CREDITS_BTN = pygame.Rect(300, AREA_BOTTOM - 36, 134, 32)
CREDITS = [
    ("Pictures", "OpenMoji, the open-source emoji project (openmoji.org), "
                 "licence CC BY-SA 4.0. The game's pictures and outlines are adapted "
                 "from OpenMoji and shared under the same licence."),
    ("Real-life videos", "Wikimedia Commons (CC BY, CC BY-SA, CC0, public domain), "
                         "Pexels and Pixabay. Each video shows its author and licence."),
    ("Maps", "Natural Earth (public domain), India's official boundaries."),
    ("Hindi and Bengali words", "drawn with Noto Sans Devanagari and Noto Sans Bengali "
                                "(SIL Open Font License)."),
    ("Game font", "Sniglet by Haley Fiege (SIL Open Font License)."),
    ("Rhymes", "traditional nursery rhymes, free for everyone (public domain)."),
    ("Voices", "Piper voices: Cori (LibriVox, public domain), Priyamvada (AI4Bharat, "
               "CC BY-NC-SA 4.0), Google Bengali (CC BY-SA 4.0)."),
    ("Made by", "Saiqul Modi, for children everywhere."),
]


class Credits:
  """Who made the pictures, maps, fonts and videos (licences need this)."""

  def draw(self, screen, g, now):
    shade(screen, g.theme, 250)
    title(screen, g, "Credits & thanks", words=True)
    y = 60
    for head, text in CREDITS:
      h = g.hint_font.render(head, True, YELLOW)
      screen.blit(h, (20, y))
      y += 24
      words, line = text.split(), ""
      for word in words:
        trial = f"{line} {word}".strip()
        if g.font.size(trial)[0] > 410 and line:
          screen.blit(g.font.render(line, True, WHITE), (20, y))
          y += 20
          line = word
        else:
          line = trial
      if line:
        screen.blit(g.font.render(line, True, WHITE), (20, y))
        y += 20
      y += 10
    tip = g.small_font.render("Tap anywhere to go back", True, HINT)
    screen.blit(tip, tip.get_rect(center=(225, AREA_BOTTOM - 12)))

  def press(self, g, pos):
    g.overlay = "parents"


# --------------------------------------------------------------------------
class StoryList:

  def rows(self):
    return [(pygame.Rect(16, 56 + i * 48, 418, 42), s) for i, s in enumerate(stories.STORIES)]

  def draw(self, screen, g, now):
    shade(screen, g.theme)
    title(screen, g, "Stories")
    today = g.story_of_today()["id"]
    for rect, s in self.rows():
      done = s["id"] in g.progress.data["stories"]
      cat, name, _ = s["steps"][0]
      icon = g.thumb(name, cat, 32)
      sub = "Story of the day" if s["id"] == today else None
      button(screen, g, rect, s["title"], g.theme["cell"], icon, sub, s["id"] == today)
      if done:
        g.draw_star(screen, (rect.right - 20, rect.centery), 10)

  def press(self, g, pos):
    for rect, s in self.rows():
      if rect.collidepoint(pos):
        g.sfx.play("click")
        g.start_story(s)
        g.overlay = None
        return
    g.overlay = None


class Creations:
  """My Creations (the museum on the crescent): every picture the child has brought to
  life, newest first, as photo cards. Tap a card to hear it; Back returns to town."""

  COLS, ROWS = 3, 4

  def __init__(self):
    self.page = 0
    self.pop = (None, 0.0)

  def items(self, g):
    out = []
    for key in reversed(g.progress.data.get("done", [])):
      cat, _, name = key.partition("/")
      if name and name in hub.CATEGORIES_HUB.get(cat, {}):
        out.append((cat, name))
    return out

  def cells(self, g):
    items = self.items(g)
    per = self.COLS * self.ROWS
    pages = max(1, -(-len(items) // per))
    self.page %= pages
    shown = items[self.page * per:(self.page + 1) * per]
    cw, ch = 134, 136
    x0 = (450 - self.COLS * cw - (self.COLS - 1) * 10) // 2
    return [(pygame.Rect(x0 + (i % self.COLS) * (cw + 10), 84 + (i // self.COLS) * (ch + 8), cw, ch), it)
            for i, it in enumerate(shown)], pages, len(items)

  def buttons(self):
    return {"prev": pygame.Rect(16, AREA_BOTTOM - 56, 96, 42),
            "back": pygame.Rect(175, AREA_BOTTOM - 56, 100, 42),
            "next": pygame.Rect(338, AREA_BOTTOM - 56, 96, 42)}

  def draw(self, screen, g, now):
    shade(screen, g.theme, 250)
    title(screen, g, "My Creations")
    cells, pages, total = self.cells(g)
    sub = g.font.render(f"You brought {total} pictures to life! Tap one to hear it.", True, CYAN)
    screen.blit(sub, sub.get_rect(center=(225, 62)))
    for rect, (cat, name) in cells:
      popped = self.pop[0] == (cat, name) and now - self.pop[1] < 0.5
      r = rect.inflate(8, 8) if popped else rect
      pygame.draw.rect(screen, (255, 248, 230), r, border_radius=14)
      pygame.draw.rect(screen, YELLOW, r, 3, border_radius=14)
      pic = g.thumb(name, cat, 96)
      if pic is not None:
        screen.blit(pic, pic.get_rect(center=(r.centerx, r.y + 56)))
      label = hub.CATEGORIES_HUB[cat][name].get("label") or name
      lbl = g.small_font.render(label, True, (40, 40, 70))
      if lbl.get_width() > r.w - 10:
        lbl = pygame.transform.smoothscale(lbl, (r.w - 10, lbl.get_height()))
      screen.blit(lbl, lbl.get_rect(center=(r.centerx, r.bottom - 30)))
      c = g.small_font.render(cat, True, (120, 120, 150))
      if c.get_width() > r.w - 10:
        c = pygame.transform.smoothscale(c, (r.w - 10, c.get_height()))
      screen.blit(c, c.get_rect(center=(r.centerx, r.bottom - 13)))
    if total == 0:
      tip = g.font.render("Trace a picture and it will live here!", True, WHITE)
      screen.blit(tip, tip.get_rect(center=(225, 300)))
    b = self.buttons()
    if pages > 1:
      button(screen, g, b["prev"], "< Back", (150, 90, 220))
      button(screen, g, b["next"], "More >", (150, 90, 220))
      pg = g.small_font.render(f"{self.page + 1} / {pages}", True, HINT)
      screen.blit(pg, pg.get_rect(center=(225, AREA_BOTTOM - 70)))
    button(screen, g, b["back"], "Town", (240, 140, 40))

  def press(self, g, pos):
    b = self.buttons()
    cells, pages, _ = self.cells(g)
    if b["back"].collidepoint(pos):
      g.sfx.play("click")
      g.overlay = None
      return
    if pages > 1 and b["prev"].collidepoint(pos):
      g.sfx.play("switch")
      self.page -= 1
      return
    if pages > 1 and b["next"].collidepoint(pos):
      g.sfx.play("switch")
      self.page += 1
      return
    for rect, (cat, name) in cells:
      if rect.collidepoint(pos):
        self.pop = ((cat, name), time.time())
        if not g.calls.play(name):
          g.sfx.play("chime")
        return


PANELS = {"menu": Menu(), "players": Players(), "rename": Rename(),
          "parents": Parents(), "stories": StoryList(), "howto": howto.GUIDE,
          "credits": Credits(), "creations": Creations()}
