"""Picture symbols for buttons and hints (user, 01-Nov-2026: "no write-up, only symbols to play, wherever applicable").

ONLY = True: navigation words are not drawn; buttons show one of these symbols instead. Lesson words stay
(the picture's name, letters, Hindi / Bangla words, numbers and sums). Pages for grown-ups (For parents,
Credits) keep their words.
"""

import math

import pygame

ONLY = True
WHITE = (255, 255, 255)

# button labels used around the game -> the symbol drawn in their place
LABELS = {
    "back to town": "home", "town": "home", "close": "close", "< prev": "prev", "< back": "prev",
    "next >": "next", "more >": "next", "guide me": "hand", "houses": "houses", "pictures": "pictures",
    "let's go!": "play", "back to gate": "gate", "play >": "play", "reset": "reset", "games": "games",
    "done": "check", "credits": "info",
}


_KEEP = set("0123456789/ +-=×÷.?")


def text(msg):
  """What a label may still say with ONLY on: numbers, sums and single letters (lesson symbols); words become ''."""
  msg = str(msg)
  if not ONLY or not msg.strip() or set(msg) <= _KEEP or len(msg.strip()) <= 2:
    return msg
  return ""


def kind_of(label):
  return LABELS.get(str(label).strip().lower(), "play")


def draw(surf, kind, rect, colour=WHITE):
  """Draws symbol `kind` centred in rect (a pygame.Rect), sized to it."""
  cx, cy = rect.center
  r = max(6, int(min(rect.w, rect.h) * 0.32))
  w = max(2, r // 4)
  if kind == "play" or kind == "next":
    pts = [(cx - r * 0.6, cy - r), (cx + r, cy), (cx - r * 0.6, cy + r)]
    pygame.draw.polygon(surf, colour, pts)
    if kind == "next":
      pygame.draw.polygon(surf, colour, [(cx - r * 1.4, cy - r * 0.8), (cx - r * 0.2, cy), (cx - r * 1.4, cy + r * 0.8)], w)
  elif kind == "prev":
    pygame.draw.polygon(surf, colour, [(cx + r * 0.6, cy - r), (cx - r, cy), (cx + r * 0.6, cy + r)])
  elif kind == "close":
    pygame.draw.line(surf, colour, (cx - r * 0.75, cy - r * 0.75), (cx + r * 0.75, cy + r * 0.75), w + 1)
    pygame.draw.line(surf, colour, (cx + r * 0.75, cy - r * 0.75), (cx - r * 0.75, cy + r * 0.75), w + 1)
  elif kind in ("home", "houses"):
    pygame.draw.polygon(surf, colour, [(cx, cy - r), (cx + r, cy - r * 0.05), (cx - r, cy - r * 0.05)])
    pygame.draw.rect(surf, colour, (cx - r * 0.7, cy - r * 0.1, r * 1.4, r))
    pygame.draw.rect(surf, (90, 60, 40), (cx - r * 0.2, cy + r * 0.3, r * 0.4, r * 0.6))
    if kind == "houses":
      pygame.draw.polygon(surf, colour, [(cx + r * 1.1, cy - r * 0.4), (cx + r * 1.7, cy + r * 0.1), (cx + r * 0.5, cy + r * 0.1)])
      pygame.draw.rect(surf, colour, (cx + r * 0.65, cy + r * 0.1, r * 0.9, r * 0.8))
  elif kind == "hand":
    pygame.draw.circle(surf, colour, (cx, int(cy - r * 0.55)), max(2, r // 4))
    pygame.draw.rect(surf, colour, (cx - r * 0.18, cy - r * 0.55, r * 0.36, r * 0.9))
    pygame.draw.rect(surf, colour, (cx - r * 0.55, cy + r * 0.05, r * 1.1, r * 0.85), border_radius=max(2, r // 3))
  elif kind == "pictures":
    pygame.draw.rect(surf, colour, (cx - r, cy - r * 0.75, r * 2, r * 1.5), w, border_radius=3)
    pygame.draw.polygon(surf, colour, [(cx - r * 0.8, cy + r * 0.55), (cx - r * 0.2, cy - r * 0.15), (cx + r * 0.2, cy + r * 0.25),
                                       (cx + r * 0.45, cy), (cx + r * 0.8, cy + r * 0.55)])
    pygame.draw.circle(surf, colour, (int(cx + r * 0.45), int(cy - r * 0.4)), max(2, r // 6))
  elif kind == "gate":
    pygame.draw.arc(surf, colour, (cx - r, cy - r, r * 2, r * 2), 0, math.pi, w + 1)
    pygame.draw.line(surf, colour, (cx - r, cy), (cx - r, cy + r), w + 1)
    pygame.draw.line(surf, colour, (cx + r, cy), (cx + r, cy + r), w + 1)
  elif kind == "reset":
    pygame.draw.arc(surf, colour, (cx - r, cy - r, r * 2, r * 2), 0.6, 2 * math.pi - 0.2, w + 1)
    pygame.draw.polygon(surf, colour, [(cx + r * 0.6, cy - r * 1.05), (cx + r * 1.15, cy - r * 0.35), (cx + r * 0.35, cy - r * 0.2)])
  elif kind == "games":
    pygame.draw.rect(surf, colour, (cx - r, cy - r * 0.55, r * 2, r * 1.1), border_radius=max(3, r // 2))
    dark = (60, 60, 90)
    pygame.draw.line(surf, dark, (cx - r * 0.65, cy), (cx - r * 0.25, cy), w)
    pygame.draw.line(surf, dark, (cx - r * 0.45, cy - r * 0.2), (cx - r * 0.45, cy + r * 0.2), w)
    pygame.draw.circle(surf, dark, (int(cx + r * 0.4), int(cy - r * 0.12)), max(2, r // 7))
    pygame.draw.circle(surf, dark, (int(cx + r * 0.62), int(cy + r * 0.15)), max(2, r // 7))
  elif kind == "check":
    pygame.draw.lines(surf, colour, False, [(cx - r * 0.8, cy), (cx - r * 0.2, cy + r * 0.6), (cx + r * 0.85, cy - r * 0.6)], w + 2)
  elif kind == "speaker":
    pygame.draw.polygon(surf, colour, [(cx - r, cy - r * 0.35), (cx - r * 0.45, cy - r * 0.35), (cx + r * 0.1, cy - r * 0.9),
                                       (cx + r * 0.1, cy + r * 0.9), (cx - r * 0.45, cy + r * 0.35), (cx - r, cy + r * 0.35)])
    for k in (0.5, 0.85):
      pygame.draw.arc(surf, colour, (cx - r * k + r * 0.25, cy - r * k, r * k * 2, r * k * 2), -0.9, 0.9, w)
  elif kind == "info":
    pygame.draw.circle(surf, colour, (cx, cy), r, w)
    pygame.draw.circle(surf, colour, (cx, int(cy - r * 0.45)), max(2, r // 7))
    pygame.draw.line(surf, colour, (cx, cy - r * 0.1), (cx, cy + r * 0.55), w)
  elif kind == "go":                       # into the house: an arrow through a door
    pygame.draw.rect(surf, colour, (cx + r * 0.1, cy - r, r * 0.9, r * 2), w, border_radius=2)
    pygame.draw.line(surf, colour, (cx - r, cy), (cx + r * 0.3, cy), w + 1)
    pygame.draw.polygon(surf, colour, [(cx + r * 0.45, cy), (cx, cy - r * 0.4), (cx, cy + r * 0.4)])
  elif kind == "pencil":                   # rename: a pencil
    pygame.draw.polygon(surf, (255, 214, 64), [(cx - r * 1.1, cy + r * 0.25), (cx + r * 0.7, cy - r * 0.45), (cx + r * 0.95, cy + r * 0.15), (cx - r * 0.85, cy + r * 0.85)])
    pygame.draw.polygon(surf, (90, 60, 40), [(cx - r * 1.1, cy + r * 0.25), (cx - r * 0.85, cy + r * 0.85), (cx - r * 1.45, cy + r * 0.75)])
    pygame.draw.polygon(surf, (255, 140, 160), [(cx + r * 0.7, cy - r * 0.45), (cx + r * 1.1, cy - r * 0.6), (cx + r * 1.3, cy), (cx + r * 0.95, cy + r * 0.15)])
  elif kind == "fly":                      # a paper plane
    pygame.draw.polygon(surf, colour, [(cx - r, cy), (cx + r, cy - r * 0.7), (cx - r * 0.1, cy + r * 0.2)])
    pygame.draw.polygon(surf, colour, [(cx - r * 0.1, cy + r * 0.2), (cx + r, cy - r * 0.7), (cx + r * 0.1, cy + r * 0.8)])


def star(surf, centre, r, colour=(255, 215, 64), outline=WHITE):
  pts = []
  for i in range(10):
    a = -math.pi / 2 + i * math.pi / 5
    rr = r if i % 2 == 0 else r * 0.45
    pts.append((centre[0] + rr * math.cos(a), centre[1] + rr * math.sin(a)))
  pygame.draw.polygon(surf, colour, pts)
  if outline:
    pygame.draw.polygon(surf, outline, pts, 2)
