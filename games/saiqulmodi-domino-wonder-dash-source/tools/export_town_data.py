"""Data for the 3D Wonder Town (town_web/): every house's categories, each with a small picture, so the town can
show them as 3D picture blocks (no words) and open the game straight on the chosen one.

Writes town_web/data.json
  {"classes": {class number: {subject key: [entry, ...]}}, "anc": {ancillary subject key: [entry, ...]}}
  entry = {"pic": "thumbs/<n>.webp" | null, "glyph": key | null, "href": "?open=...&cat=..."}
Classes come from ncert.SYLLABUS (main.py _open_syllabus). Ancillary = every other category; ?open=<key>&cat=<index>
uses the game's own category list for that house (world.WorldScene.enter: Maths Play first at the Number House,
Cross the Road last at the Safety Park).
Thumbnails: the category's first picture, fitted into 160 px, WebP (town_web/thumbs/).
Run:  python tools/export_town_data.py   (tools/build_web.py runs it too)
"""

import json
import os
import shutil
import sys

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from PIL import Image  # noqa: E402

import domino_data as hub  # noqa: E402
import ncert  # noqa: E402
import town3d  # noqa: E402

ROAD_GAME = "Cross the Road"   # same names as world.py
MATHS_GAME = "Maths Play"
OUT = os.path.join(ROOT, "town_web")
THUMBS = os.path.join(OUT, "thumbs")
SIZE = 160


def first_picture(cat):
  for item in hub.CATEGORIES_HUB.get(cat, {}).values():
    pic = item.get("pic")
    if pic and os.path.exists(os.path.join(ROOT, pic)):
      return os.path.join(ROOT, pic)
  return None


def thumb(src, n):
  im = Image.open(src).convert("RGBA")
  bbox = im.getbbox()
  if bbox:
    im = im.crop(bbox)
  im.thumbnail((SIZE, SIZE), Image.LANCZOS)
  canvas = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
  canvas.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2), im)
  name = f"{n}.webp"
  canvas.save(os.path.join(THUMBS, name), "WEBP", quality=82, method=6)
  return "thumbs/" + name


# Ancillary subjects that are not houses of their own: (zone key, its n-th category)
MELAS = [("garden", "Flower Garden"), ("mela", "Wonder Mela"), ("bookfair", "Book Fair"),
         ("autoexpo", "Auto Expo"), ("boatmela", "Boat Mela")]


def main():
  subjects = hub.subjects()
  shutil.rmtree(THUMBS, ignore_errors=True)
  os.makedirs(THUMBS)
  counter = [0]

  def entry(cat, href):
    row = make_entry(cat, href)
    if cat in hub.CATEGORIES_HUB and cat not in ("Draw", "Classic Rhymes", "Desi Rhymes"):
      row["trace"] = cat                 # opens on the 3D tracing stage (town_web/trace3d.js)
    return row

  def make_entry(cat, href):
    if cat == MATHS_GAME:
      return {"pic": None, "glyph": "mathsplay", "href": href}
    if cat == ROAD_GAME:
      return {"pic": None, "glyph": "roadgame", "href": href}
    src = first_picture(cat)
    if not src:
      return {"pic": None, "glyph": "star", "href": href}
    counter[0] += 1
    return {"pic": thumb(src, counter[0] - 1), "glyph": None, "href": href}

  # the classes: only their own NCERT subjects (ncert.SYLLABUS)
  classes, placed = {}, set()
  for n, subj in ncert.SYLLABUS.items():
    classes[n] = {}
    for key, cats in subj.items():
      for cat in cats:
        if cat != MATHS_GAME and (cat in placed or cat not in hub.CATEGORIES_HUB):
          raise SystemExit(f"Class {n} {key}: {cat} is unknown or already in another class")
        placed.add(cat)
      classes[n][key] = [entry(c, f"?open=syllabus&cls={n}&subj={key}&cat={i}") for i, c in enumerate(cats)]

  # everything else: ancillary, the same in every class. ?cat= keeps the house's own category number
  anc = {}
  for b in town3d.build_world():
    if b.kind != "subject":
      continue
    cats = list(subjects.get(b.payload, []))
    if b.key == "safety":
      cats.append(ROAD_GAME)
    if b.key == "maths":
      cats.insert(0, MATHS_GAME)
    rest = [entry(c, f"?open={b.key}&cat={i}") for i, c in enumerate(cats) if c not in placed]
    if rest:
      anc[b.key] = rest
  by_key = {b.key: b for b in town3d.build_world()}
  anc["melas"] = [entry(c, f"?open={k}&cat={by_key[k].payload.index(c)}") for k, c in MELAS]

  with open(os.path.join(OUT, "data.json"), "w", encoding="utf-8") as fh:
    json.dump({"classes": classes, "anc": anc}, fh, separators=(",", ":"))
  size = sum(os.path.getsize(os.path.join(THUMBS, f)) for f in os.listdir(THUMBS))
  for n, subj in classes.items():
    print(f"Class {n}: " + ", ".join(f"{k} {len(v)}" for k, v in subj.items()))
  print("Ancillary: " + ", ".join(f"{k} {len(v)}" for k, v in anc.items()))
  print(f"{counter[0]} thumbnails, {size / 1e3:.0f} KB")


if __name__ == "__main__":
  main()
