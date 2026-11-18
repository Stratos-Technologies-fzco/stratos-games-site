"""Data for the 3D tracing stage (town_web/trace3d.js): one JSON per category and one small WebP per picture.

Writes town_web/trace/<n>.json  [{key, name, label, say, hi, bn, lang, letter, pic, rect, loops, closed, ctx, places}]
       town_web/trace/index.json {category name: n}
       town_web/pics3d/<hash>.webp
Coordinates are pixels in a 440 x 440 box, from the game's own hub.fetch_* functions, so the dots are the same dots.
The pictures stay out of the Stratos box: the stage fetches them from GitHub Pages there, like the class packs.
Run:  python tools/export_trace3d.py   (tools/build_web.py runs it too)
"""

import hashlib
import json
import os
import shutil
import sys

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from PIL import Image  # noqa: E402

import domino_data as hub  # noqa: E402

OUT = os.path.join(ROOT, "town_web")
TRACE = os.path.join(OUT, "trace")
PICS = os.path.join(OUT, "pics3d")
BOX = (0, 0, 440, 440)
PIC_MAX = 360
SKIP_CATS = {"Draw", "Classic Rhymes", "Desi Rhymes"}   # free drawing and sing-along stay as they are for now


def flat(points):
  return [round(v) for p in points for v in (p[0], p[1])]


def picture(src):
  name = hashlib.sha1(os.path.relpath(src, ROOT).encode()).hexdigest()[:12] + ".webp"
  out = os.path.join(PICS, name)
  if not os.path.exists(out):
    im = Image.open(src).convert("RGBA")
    im.thumbnail((PIC_MAX, PIC_MAX), Image.LANCZOS)
    im.save(out, "WEBP", quality=68, method=6)
  return "pics3d/" + name


def native(item):
  return item.get("hi"), item.get("bn")


def letter_of(name):
  if len(name) == 1 or name.isdigit():
    return name
  for ch in name:
    if ch.isalnum():
      return ch.upper()
  return None


def main():
  shutil.rmtree(TRACE, ignore_errors=True)
  os.makedirs(TRACE)
  os.makedirs(PICS, exist_ok=True)          # pictures already made are kept (named by their source path)
  index, total, skipped = {}, 0, []
  for n, (cat, items) in enumerate(hub.CATEGORIES_HUB.items()):
    if cat in SKIP_CATS:
      continue
    rows = []
    for i, (name, item) in enumerate(items.items()):
      got = hub.fetch_trace_from_hub(name, BOX, cat=cat)
      loops, closed = got if isinstance(got, tuple) else (got, [True] * len(got))
      if not loops:
        skipped.append(f"{cat}/{name}")
        continue
      pic, rect = hub.fetch_picture_from_hub(name, BOX, cat=cat)
      src = os.path.join(ROOT, pic) if pic and not os.path.isabs(pic) else pic
      hi, bn = native(item)
      row = {"i": i, "key": hub.item_key(cat, name), "name": name, "label": item.get("label") or name,
             "say": hub.spoken_text(name, cat), "hi": hi, "bn": bn, "letter": letter_of(name),
             "lang": (item.get("say_lang", "hi") if item.get("hindi") else None), "native": item.get("hindi"),
             "pic": picture(src) if src and os.path.exists(src) else None,
             "rect": [round(v) for v in rect] if rect else None,
             "loops": [flat(lp) for lp in loops], "closed": [bool(c) for c in closed]}
      ctx = hub.fetch_context_from_hub(name, BOX, cat=cat)
      if ctx:
        row["ctx"] = [flat(lp) for lp in ctx]
      places = hub.fetch_places_from_hub(name, BOX, cat=cat)
      if places:
        row["places"] = [[str(p[0]), round(p[1]), round(p[2]), p[3] if len(p) > 3 else "place"] for p in places]
      rows.append(row)
      total += 1
    with open(os.path.join(TRACE, f"{n}.json"), "w", encoding="utf-8") as fh:
      json.dump(rows, fh, ensure_ascii=False, separators=(",", ":"))
    index[cat] = n
  with open(os.path.join(TRACE, "index.json"), "w", encoding="utf-8") as fh:
    json.dump(index, fh, ensure_ascii=False, separators=(",", ":"))
  json_size = sum(os.path.getsize(os.path.join(TRACE, f)) for f in os.listdir(TRACE))
  pic_size = sum(os.path.getsize(os.path.join(PICS, f)) for f in os.listdir(PICS))
  print(f"{len(index)} categories, {total} pictures, JSON {json_size / 1e6:.2f} MB, pictures {pic_size / 1e6:.2f} MB, skipped {skipped}")


if __name__ == "__main__":
  main()
