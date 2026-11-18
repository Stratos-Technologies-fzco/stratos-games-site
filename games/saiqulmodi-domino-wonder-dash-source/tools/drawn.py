"""Pictures drawn for the game, for letter words that have no emoji
(अनार pomegranate, लट्टू spinning top, रथ chariot, xylophone ...).

Same look as the OpenMoji pictures: flat colours with a bold black outline,
on a 600 x 600 transparent canvas. tools/add_items.py builds them like any
other picture (outline to trace, inside parts, thumbnails).
"""

import math

from PIL import Image, ImageDraw

S = 600
INK = (30, 30, 30, 255)
W = 14                                  # outline width, like OpenMoji


def canvas():
  img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
  return img, ImageDraw.Draw(img)


def poly(d, pts, fill):
  d.polygon(pts, fill=fill)
  d.line(pts + [pts[0]], fill=INK, width=W, joint="curve")


def ellipse(d, box, fill):
  d.ellipse(box, fill=fill, outline=INK, width=W)


def rrect(d, box, fill, r=24):
  d.rounded_rectangle(box, r, fill=fill, outline=INK, width=W)


def xylophone():
  img, d = canvas()
  rrect(d, (70, 330, 530, 400), (150, 95, 50, 255), 20)          # wooden frame
  colours = [(233, 69, 96), (255, 140, 40), (255, 204, 0), (80, 200, 90),
             (60, 160, 255), (110, 90, 230), (190, 90, 220)]
  for i, c in enumerate(colours):
    x = 95 + i * 60
    h = 230 - i * 18
    rrect(d, (x, 365 - h // 2, x + 46, 365 + h // 2), c + (255,), 14)
    d.ellipse((x + 16, 365 - h // 2 + 14, x + 30, 365 - h // 2 + 28), fill=INK)
  for x0, ang in ((150, -35), (420, 30)):                        # two mallets
    a = math.radians(ang)
    x1, y1 = x0 + 130 * math.sin(a), 150 - 130 * math.cos(a)
    d.line((x0, 150, x1, y1), fill=INK, width=W + 6)
    ellipse(d, (x1 - 26, y1 - 26, x1 + 26, y1 + 26), (255, 230, 120, 255))
  return img


def spinning_top():
  img, d = canvas()
  poly(d, [(170, 230), (430, 230), (300, 520)], (233, 69, 96, 255))     # cone
  d.line((215, 300, 385, 300), fill=(255, 220, 80, 255), width=26)      # stripes
  d.line((245, 370, 355, 370), fill=(60, 160, 255, 255), width=24)
  d.line([(170, 230), (430, 230), (300, 520), (170, 230)], fill=INK, width=W, joint="curve")
  ellipse(d, (160, 190, 440, 270), (255, 140, 40, 255))                 # top
  rrect(d, (285, 100, 315, 215), (150, 95, 50, 255), 10)                # knob
  d.line((300, 520, 300, 560), fill=INK, width=W)                       # nail tip
  return img


def pomegranate():
  img, d = canvas()
  ellipse(d, (110, 160, 490, 540), (200, 40, 60, 255))
  poly(d, [(250, 175), (265, 110), (285, 150), (300, 100), (315, 150), (335, 110),
           (350, 175)], (170, 30, 50, 255))                             # crown
  d.ellipse((190, 270, 260, 340), fill=(255, 120, 140, 255))            # shine
  return img


def tamarind():
  img, d = canvas()
  pts = []
  for k in range(0, 41):
    t = k / 40
    x = 90 + 420 * t
    y = 300 + 60 * math.sin(t * math.pi * 1.4)
    pts.append((x, y))
  top = [(x, y - 55 + 18 * math.sin(i * 0.95)) for i, (x, y) in enumerate(pts)]
  bottom = [(x, y + 55 - 18 * math.sin(i * 0.95)) for i, (x, y) in enumerate(pts)]
  poly(d, top + bottom[::-1], (165, 110, 60, 255))                      # bumpy pod
  for i in range(6, 40, 8):
    x, y = pts[i]
    d.line((x, y - 40, x, y + 40), fill=(110, 70, 35, 255), width=8)
  d.line((pts[0][0], pts[0][1], 50, 250), fill=INK, width=W)            # stalk
  return img


def sugarcane():
  img, d = canvas()
  for x, c in ((210, (120, 180, 60, 255)), (320, (150, 200, 80, 255))):
    rrect(d, (x, 80, x + 70, 540), c, 26)
    for y in range(170, 540, 95):
      d.line((x + 6, y, x + 64, y), fill=INK, width=10)                 # joints
  poly(d, [(260, 100), (120, 30), (170, 25), (290, 80)], (80, 170, 70, 255))   # leaves
  poly(d, [(360, 100), (500, 40), (460, 20), (340, 80)], (80, 170, 70, 255))
  return img


def lid():
  img, d = canvas()
  ellipse(d, (90, 300, 510, 430), (180, 185, 195, 255))                 # rim
  d.pieslice((120, 170, 480, 470), 180, 360, fill=(205, 210, 220, 255), outline=INK, width=W)
  ellipse(d, (250, 140, 350, 210), (90, 90, 100, 255))                  # knob
  d.arc((170, 220, 330, 380), 200, 260, fill=(255, 255, 255, 255), width=12)
  return img


def chariot():
  img, d = canvas()
  poly(d, [(110, 230), (430, 230), (470, 380), (110, 380)], (230, 160, 40, 255))   # body
  poly(d, [(150, 230), (180, 120), (380, 120), (410, 230)], (233, 69, 96, 255))    # canopy
  d.line((180, 120, 380, 120), fill=INK, width=W)
  ellipse(d, (130, 330, 290, 490), (150, 95, 50, 255))                  # wheels
  ellipse(d, (330, 330, 490, 490), (150, 95, 50, 255))
  for cx in (210, 410):
    for a in range(0, 180, 45):
      r = math.radians(a)
      d.line((cx - 70 * math.cos(r), 410 - 70 * math.sin(r),
              cx + 70 * math.cos(r), 410 + 70 * math.sin(r)), fill=INK, width=8)
  d.line((470, 300, 560, 260), fill=INK, width=W)                       # pole
  return img


def mortar():
  img, d = canvas()
  rrect(d, (240, 70, 300, 360), (150, 95, 50, 255), 24)                 # pestle (musal)
  poly(d, [(130, 300), (470, 300), (420, 520), (180, 520)], (140, 140, 150, 255))   # okhli
  ellipse(d, (130, 270, 470, 330), (110, 110, 120, 255))
  return img


def turnip():
  img, d = canvas()
  ellipse(d, (150, 230, 450, 510), (240, 235, 245, 255))
  d.pieslice((150, 230, 450, 510), 200, 340, fill=(170, 90, 200, 255), outline=INK, width=W)
  d.line((300, 505, 300, 570), fill=INK, width=W)                       # root
  for dx, h in ((-60, 120), (0, 170), (60, 120)):                       # leaves
    poly(d, [(300 + dx // 2, 240), (300 + dx - 40, 240 - h), (300 + dx + 40, 240 - h)],
         (80, 180, 80, 255))
  return img


def ink_pot():
  img, d = canvas()
  rrect(d, (160, 280, 440, 520), (60, 90, 170, 255), 40)                # pot
  rrect(d, (230, 220, 370, 290), (40, 60, 120, 255), 16)                # neck
  ellipse(d, (250, 205, 350, 240), (20, 20, 40, 255))                   # ink
  poly(d, [(335, 230), (470, 60), (500, 85), (360, 250)], (240, 200, 90, 255))     # pen
  d.rectangle((210, 350, 390, 420), fill=(255, 255, 255, 255))          # label
  return img


def grinding_stone():
  img, d = canvas()
  ellipse(d, (80, 330, 520, 500), (130, 125, 120, 255))                 # lower stone
  ellipse(d, (130, 250, 470, 390), (160, 155, 150, 255))                # upper stone
  ellipse(d, (270, 295, 330, 335), (60, 60, 60, 255))                   # hole for grain
  rrect(d, (400, 150, 440, 320), (150, 95, 50, 255), 14)                # handle
  return img


DRAWINGS = {
    "xylophone": xylophone, "spinning_top": spinning_top, "pomegranate": pomegranate,
    "tamarind": tamarind, "sugarcane": sugarcane, "lid": lid, "chariot": chariot,
    "mortar": mortar, "turnip": turnip, "ink_pot": ink_pot, "grinding_stone": grinding_stone,
}


def make(kind):
  """(RGBA picture, 0..255 mask of the solid shape) like build_hub.emoji_picture."""
  import numpy as np
  img = DRAWINGS[kind]()
  mask = (np.array(img)[:, :, 3] > 0).astype(np.uint8) * 255
  return img, mask
