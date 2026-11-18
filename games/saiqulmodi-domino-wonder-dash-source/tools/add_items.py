"""Builds only the named categories and merges them into hub_data.json.

build_hub.py rebuilds every picture (and every map) at once; this adds a new
category of OpenMoji pictures without touching the others. Same outlines,
inside parts, pictures, thumbs and Hindi/Bengali word pictures as build_hub.

Run:  python tools/add_items.py "Road Safety"
      python tools/add_items.py "Classic Rhymes" "Desi Rhymes"
Rhymes with Hindi or Bengali words also get one picture per line of words.
Only pictures not yet in hub_data.json are built (so new rows added to a
category, e.g. from catalog_more.py, take seconds); --all rebuilds them all.
A picture that cannot be built is reported and left out (the game hides it).
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_hub as bh  # noqa: E402  (also puts the game folder on sys.path)

hub = bh.hub


def build(cat, have=(), rebuild=False):
  ci = list(hub.CATALOG).index(cat)
  items = hub.CATALOG[cat]
  out = {}
  for ii, (name, _desc, (kind, arg)) in enumerate(items):
    if not rebuild and hub.item_key(cat, name) in have:
      continue                         # already built
    if kind not in ("emoji", "bangla"):
      raise SystemExit(f"{cat}/{name}: only emoji pictures here; use build_hub.py for {kind}")
    try:
      out.update(build_item(cat, ci, ii, name, arg))
    except Exception as exc:          # e.g. a picture OpenMoji does not have
      print(f"FAIL {cat}/{name}: {exc}")
  return out


def fit_font(font, text):
  """Characters the font cannot draw (the Bengali font has no comma, danda
  or hyphen) become spaces instead of empty boxes."""
  text = text.replace("-", " ").replace(",", "").replace("।", "")   # known gaps
  return "".join(ch if ch == " " or font.metrics(ch)[0] is not None else " " for ch in text)


def bangla_mask(text):
  """Bengali letter drawn big as the shape to trace (like build_hub.hindi_mask)."""
  import cv2
  import numpy as np
  import pygame
  surf = bh.beng_font(330).render(text, True, (255, 255, 255))
  alpha = np.array(pygame.surfarray.pixels_alpha(surf)).T.copy()
  h, w = alpha.shape
  scale = min(1.0, (bh.CANVAS * 0.84) / max(w, h))
  if scale < 1.0:
    alpha = cv2.resize(alpha, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    h, w = alpha.shape
  mask = np.zeros((bh.CANVAS, bh.CANVAS), np.uint8)
  y0, x0 = (bh.CANVAS - h) // 2, (bh.CANVAS - w) // 2
  mask[y0:y0 + h, x0:x0 + w] = alpha
  return mask


def bangla_word_image(text, slug):
  """The phrase (ক-এ কলা) as a picture for the name banner."""
  import pygame
  from PIL import Image
  font = bh.beng_font(96)
  surf = font.render(fit_font(font, text), True, (255, 204, 0))
  img = Image.frombytes("RGBA", surf.get_size(), pygame.image.tobytes(surf, "RGBA"))
  img = img.crop(img.getbbox())
  rel = f"pics/{slug}_w.png"
  bh.compact(img).save(os.path.join(bh.ROOT, rel), optimize=True)
  return rel


def build_item(cat, ci, ii, name, arg):
  out = {}
  key = hub.item_key(cat, name)
  slug = bh.slugify(ci, ii, name)
  if isinstance(arg, tuple):             # Bangla letter: (phrase, roman)
    items = hub.CATALOG[cat]
    mask = bangla_mask(name)
    img = bh.colour_silhouette(mask, bh.hsv(ii, len(items)))
    loops, frame, pic_frame = bh.outline_from_mask(mask, 0.005)
  elif arg.startswith("drawn:"):         # drawn for the game (tools/drawn.py)
    import drawn
    img, mask = drawn.make(arg[len("drawn:"):])
    loops, frame, pic_frame = bh.outline_from_mask(mask, bh.EMOJI_MIN_FRAC)
  else:
    img, mask = bh.emoji_picture(key, arg)
    loops, frame, pic_frame = bh.outline_from_mask(mask, bh.EMOJI_MIN_FRAC)
  if not loops:
    raise ValueError("empty outline")
  entry = {"closed": True, "loops": loops, "w": round(frame.w, 1), "h": round(frame.h, 1),
           "pic": bh.save_pic(img, slug), "pic_frame": pic_frame}
  if isinstance(arg, tuple):
    entry["word_img"] = bangla_word_image(arg[0], slug)
  else:
    entry["parts"] = bh.inner_parts(img, mask, frame, loops)
  entry["thumb"] = bh.save_pic(img.crop(img.getbbox()), slug, "thumb", bh.THUMB)
  if key in bh.TRANSLATIONS:
    hi, bn = bh.TRANSLATIONS[key]
    entry["hi_img"] = bh.native_word_image(hi, slug, "hi")
    entry["bn_img"] = bh.native_word_image(bn, slug, "bn")
  rhyme = hub.rhyme_of(cat, name)
  if rhyme and rhyme.get("native"):     # the words in Hindi / Bengali script
    # the Bengali font has no comma or danda (they would show as empty boxes)
    clean = (lambda t: fit_font(bh.beng_font(72), t)) if rhyme["lang"] == "bn" else str
    entry["lyric_imgs"] = [bh.native_word_image(clean(line), f"{slug}_l{n}", rhyme["lang"])
                           for n, line in enumerate(rhyme["native"])]
  out[key] = entry
  print(f"ok   {key:32s} loops={len(loops)} parts={len(entry.get('parts', []))}")
  return out


def add_lyrics(data, cat, rebuild=False):
  """Sing-along words in Hindi / Bengali script as pictures, one per line,
  for every picture of the category that has them (rhymes, Hindi letters)."""
  ci = list(hub.CATALOG).index(cat)
  for ii, (name, _desc, _src) in enumerate(hub.CATALOG[cat]):
    key = hub.item_key(cat, name)
    sing = hub.sing_data(cat, name)
    if key not in data or not sing or not sing.get("native"):
      continue
    if data[key].get("lyric_imgs") and not rebuild:
      continue
    slug = bh.slugify(ci, ii, name)
    # the Bengali font has no comma, danda or hyphen (they would show as boxes)
    clean = (lambda t: fit_font(bh.beng_font(72), t)) if sing["lang"] == "bn" else str
    data[key]["lyric_imgs"] = [bh.native_word_image(clean(line), f"{slug}_l{n}", sing["lang"])
                               for n, line in enumerate(sing["native"])]
    print(f"words {key}")


def main(cats):
  with open(hub.HUB_JSON, encoding="utf-8") as fh:
    data = json.load(fh)
  rebuild = "--all" in cats
  for cat in [c for c in cats if c != "--all"]:
    data.update(build(cat, set(data), rebuild))
    add_lyrics(data, cat, rebuild)
  with open(hub.HUB_JSON, "w", encoding="utf-8") as fh:
    json.dump(data, fh, separators=(",", ":"))
  print(f"{len(data)} items in hub_data.json")


if __name__ == "__main__":
  main(sys.argv[1:] or ["Road Safety"])
