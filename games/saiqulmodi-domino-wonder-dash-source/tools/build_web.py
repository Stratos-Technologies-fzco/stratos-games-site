"""Builds the browser version into docs/ (GitHub Pages) with pygbag.

pygbag packs every file in the folder it is given, so the game files are
copied into a clean staging folder first (no docs/, tools/, build/, venv/ ...).

The page is then made an installable app (PWA): manifest.json, the app icons
(icons/, from tools/make_icons.py) and sw.js, a service worker that keeps the
game and the Python engine on the phone so it opens again without internet.

Run:  python tools/build_web.py
"""

import json
import os
import shutil
import tarfile
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Every .py in the game folder is a game module (tools live in tools/), so all of
# them ship. A hand-kept list missed magic.py on 17-Oct and the web game stopped at
# "No module named 'magic'" (grey screen) until 18-Oct.
GAME_FILES = sorted(f for f in os.listdir(ROOT) if f.endswith(".py")) + ["hub_data.json", "videos.json", "photos.json"]
GAME_DIRS = ["pics", "sounds", "fonts", "labels"]   # labels: Hindi / Bangla button words
APP = "dominowonderdash"
ICONS = ["icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]
THEME = "#4A90E2"

MANIFEST = {
    "name": "Domino Game",
    "short_name": "Domino Game",
    "description": "Children learn by tracing, toppling and listening (Class 1-7).",
    "start_url": "./",
    "scope": "./",
    "display": "fullscreen",
    "orientation": "portrait",
    "background_color": "#87CEEB",
    "theme_color": THEME,
    "categories": ["education", "games", "kids"],
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png",
         "purpose": "maskable"},
    ],
}

# Service worker. The game page and its archive: network first (a new version
# shows at once), the saved copy when offline. The pygbag engine on
# pygame-web.github.io is versioned, so it is kept and reused. Videos are
# never stored (too big; they stream).
SW = """// Domino Game - keeps the game on the device so it opens offline
const CACHE = 'dwd-%(stamp)s';
const START = ['./', 'index.html', 'manifest.json', 'favicon.png', %(icons)s];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(START)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function keep(req, res) {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (/\\.(mp4|webm|ogv|mov)$/i.test(url.pathname) || url.pathname.includes('/videos/')) return;
  const engine = url.hostname === 'pygame-web.github.io';
  if (url.origin !== self.location.origin && !engine) return;
  if (engine) {                              // versioned engine files: saved copy first
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(req, res))));
    return;
  }
  e.respondWith(fetch(req).then((res) => keep(req, res))
    .catch(() => caches.match(req, {ignoreSearch: true})
      .then((hit) => hit || caches.match('index.html'))));
});
"""

# The game page opens the 3D Wonder Town first (no words: the domino ring starts); the town comes back here
# with ?open=<house> (main.py _web_open_key). The web game is 3D only: no way round the town (user, 05-Nov-2026).
TOWN_DOOR = """    <script data-town-door>
      if (!/[?&]open=/.test(location.search)) { location.replace('town/' + location.hash); }
    </script>
"""

HEAD = """    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="%(theme)s">
    <meta name="apple-mobile-web-app-title" content="Domino Game">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="icon-180.png">
    <link rel="icon" type="image/png" href="icon-192.png" sizes="192x192">
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('sw.js').catch(function (e) {
            console.warn('offline mode not available', e);
          });
        });
      }
    </script>
"""


def main():
  stage_root = tempfile.mkdtemp(prefix="dwd_web_")
  stage = os.path.join(stage_root, APP)
  os.makedirs(stage)
  for f in GAME_FILES:
    if f == "hub_data.json":             # outline points to whole pixels: smaller download
      write_compact_hub(os.path.join(stage, f))
    elif f == "videos.json":             # only what the video player reads
      write_compact_videos(os.path.join(stage, f))
    else:
      shutil.copy2(os.path.join(ROOT, f), stage)
  for d in GAME_DIRS:
    if d == "pics":                      # only pictures the game uses (old builds
      plan = class_pack_plan()
      pack_dir = os.path.join(stage_root, "packs")
      copy_used_pics(os.path.join(stage, d), plan, pack_dir)   # leave unused ones behind)
      # the game reads packs.json: which class pack holds which picture (packs.py)
      with open(os.path.join(stage, "packs.json"), "w", encoding="utf-8") as fh:
        json.dump({f"class{n}": {"file": f"packs/class{n}.tar",
                                 "pics": sorted(k for k, v in plan.items() if v == n)} for n in PACK_CLASSES}, fh,
                  separators=(",", ":"))
    elif d == "labels":
      os.makedirs(os.path.join(stage, d))
      for name in os.listdir(os.path.join(ROOT, d)):
        pack_png(os.path.join(ROOT, d, name), os.path.join(stage, d, name), WORD_COLOURS)
    else:
      shutil.copytree(os.path.join(ROOT, d), os.path.join(stage, d))
  for f in GAME_FILES:
    if f.endswith(".py"):
      subprocess.run([sys.executable, "-m", "py_compile", os.path.join(stage, f)], check=True)
  # pygbag reads the game files with Windows' default code page unless told
  # otherwise; Bengali text has bytes that code page cannot decode
  env = dict(os.environ, PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
  subprocess.run([sys.executable, "-m", "pygbag", "--build", "--title", "Domino Game",
                  stage], check=True, env=env)
  docs = os.path.join(ROOT, "docs")
  os.makedirs(docs, exist_ok=True)
  for name in os.listdir(os.path.join(stage, "build", "web")):
    if name.endswith(".apk"):          # pygbag's zip copy is only read on itch.io; the page loads the .tar.gz
      continue                         # (dropped 01-Nov-2026 to stay under 20 MB; last copy kept in D:\DominoGame_backups)
    shutil.copy2(os.path.join(stage, "build", "web", name), docs)
  open(os.path.join(docs, ".nojekyll"), "w").close()
  # class packs next to the game (GitHub Pages serves them; the Stratos box fetches them from there)
  packs_out = os.path.join(docs, "packs")
  shutil.rmtree(packs_out, ignore_errors=True)
  os.makedirs(packs_out)
  for n in PACK_CLASSES:
    folder = os.path.join(stage_root, "packs", f"class{n}")
    with tarfile.open(os.path.join(packs_out, f"class{n}.tar"), "w") as tar:   # PNGs are compressed already
      for name in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
        tar.add(os.path.join(folder, name), arcname=name)
  make_pwa(docs)
  shutil.rmtree(stage_root, ignore_errors=True)
  for name in sorted(os.listdir(docs)):
    print(f"{name:28s} {os.path.getsize(os.path.join(docs, name)) / 1e6:6.2f} MB")


def write_compact_hub(dest):
  """hub_data.json with outline points rounded to whole pixels (the canvas
  cannot show a tenth of a pixel) and no spaces."""
  with open(os.path.join(ROOT, "hub_data.json"), encoding="utf-8") as fh:
    data = json.load(fh)

  aliases = pic_aliases()

  def snap(x):
    if isinstance(x, float):
      return int(round(x))
    if isinstance(x, str) and x.startswith("pics/") and x[5:] in aliases:
      return "pics/" + aliases[x[5:]]           # one file for identical pictures
    if isinstance(x, list):
      return [snap(v) for v in x]
    if isinstance(x, dict):
      return {k: (v if k in ("w", "h", "pic_frame") else snap(v)) for k, v in x.items()}
    return x

  with open(dest, "w", encoding="utf-8") as fh:
    json.dump({k: snap(v) for k, v in data.items()}, fh, separators=(",", ":"),
              ensure_ascii=False)


VIDEO_FIELDS = ("artist", "license", "sources", "place", "places")   # what video.py reads


def write_compact_videos(dest):
  """videos.json with only the fields the game's video player reads, and no spaces."""
  with open(os.path.join(ROOT, "videos.json"), encoding="utf-8") as fh:
    data = json.load(fh)

  def slim(clip):
    return {k: ([slim(p) for p in clip[k]] if k == "places" else clip[k])
            for k in VIDEO_FIELDS if k in clip}

  with open(dest, "w", encoding="utf-8") as fh:
    json.dump({k: slim(v) for k, v in data.items()}, fh, separators=(",", ":"), ensure_ascii=False)


def used_pics():
  """Every picture hub_data.json points to (the Stratos copy must stay small)."""
  with open(os.path.join(ROOT, "hub_data.json"), encoding="utf-8") as fh:
    data = json.load(fh)
  used = set()

  def walk(x):
    if isinstance(x, dict):
      for v in x.values():
        walk(v)
    elif isinstance(x, list):
      for v in x:
        walk(v)
    elif isinstance(x, str) and x.startswith("pics/"):
      used.add(x[len("pics/"):])

  walk(data)
  return used


def pic_aliases():
  """{picture: the identical picture shipped in its place} - several items share one
  emoji (Owl and Owl Eyes, Lemon and Sour), so the web copy keeps one file of each."""
  import hashlib
  first, out = {}, {}
  for name in sorted(used_pics()):
    path = os.path.join(ROOT, "pics", name)
    if not os.path.exists(path):
      continue
    with open(path, "rb") as fh:
      digest = hashlib.md5(fh.read()).hexdigest()
    if digest in first:
      out[name] = first[digest]
    else:
      first[digest] = name
  return out


def pack_png(src, out, colors, limit=None):
  """A flat-colour copy (palette of a few colours; OpenMoji pictures and word pictures
  look the same) scaled down to fit limit, kept only when it is smaller."""
  from PIL import Image
  img = Image.open(src).convert("RGBA")
  if limit and max(img.size) > limit:
    k = limit / max(img.size)
    img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
  img.quantize(colors=colors, method=Image.Quantize.FASTOCTREE,
               dither=Image.Dither.NONE).save(out, optimize=True)
  if os.path.getsize(out) >= os.path.getsize(src) and (not limit or max(Image.open(src).size) <= limit):
    shutil.copy2(src, out)


WEB_PIC_MAX = 448      # px: the game canvas is 450 wide, so bigger is never seen
WEB_THUMB_MAX = 72     # px: menu, banner and word-card thumbnails are drawn at most ~74 px
PIC_COLOURS, THUMB_COLOURS, WORD_COLOURS = 32, 40, 24   # keeps the Stratos box under 20 MB


PACK_CLASSES = range(2, 8)   # Class 1 and everything shared stay in the game; Classes 2-7 download on demand


def class_pack_plan():
  """Picture file -> class number, for pictures used only by one of Classes 2-7 (not a category's first picture,
  which the menus show as the category's tab). Everything else stays in the game bundle (user, 01-Nov-2026:
  fetch class content when the player needs it, keep the box under 20 MB)."""
  sys.path.insert(0, ROOT)
  import domino_data as hub
  import town3d
  cls_of_subject = {b.payload: town3d.CLASS_OF.get(b.key) for b in town3d.build_world() if b.kind == "subject"}
  cat_class = {}
  for subj, cats in hub.subjects().items():
    for c in cats:
      cat_class.setdefault(c, cls_of_subject.get(subj))
  with open(os.path.join(ROOT, "hub_data.json"), encoding="utf-8") as fh:
    data = json.load(fh)
  owners, first = {}, set()
  seen_cat = set()
  for key, entry in data.items():
    cat = key.split("/", 1)[0]
    pics = [v[len("pics/"):] for v in entry.values() if isinstance(v, str) and v.startswith("pics/")]
    if cat not in seen_cat:                 # the category's first picture stays (menu tab)
      seen_cat.add(cat)
      first.update(pics)
    for name in pics:
      owners.setdefault(name, set()).add(cat_class.get(cat))
  plan = {}
  for name, classes in owners.items():
    if name in first or len(classes) != 1:
      continue
    n = next(iter(classes))
    if n in PACK_CLASSES:
      plan[name] = n
  return plan


def copy_used_pics(dest, plan=None, pack_dir=None):
  """Copies the used pictures, packed into a few flat colours; full-size pictures are
  scaled down to fit the 450-wide canvas (keeps the Stratos copy under its 20 MB limit)."""
  import re
  os.makedirs(dest)
  used = used_pics()
  aliases = pic_aliases()
  for name in os.listdir(os.path.join(ROOT, "pics")):
    if name not in used or name in aliases:
      continue
    target = dest
    if plan and name in plan:                 # a class pack picture: staged for packs/class<n>.tar
      target = os.path.join(pack_dir, f"class{plan[name]}")
      os.makedirs(target, exist_ok=True)
    if name.endswith("_t.png") and os.path.exists(os.path.join(ROOT, "pics", name[:-6] + ".png")):
      continue      # the small copy of a picture: the game shrinks the picture itself
    #                 (domino_data.fetch_thumb_from_hub, Game.thumb)
    src = os.path.join(ROOT, "pics", name)
    if re.search(r"_(hi|bn|w|l\d+(_hi|_bn)?)\.png$", name):
      pack_png(src, os.path.join(target, name), WORD_COLOURS)   # word pictures: a few flat colours
      continue
    thumb = name.endswith("_t.png")
    pack_png(src, os.path.join(target, name), THUMB_COLOURS if thumb else PIC_COLOURS,
             WEB_THUMB_MAX if thumb else WEB_PIC_MAX)


def make_pwa(docs):
  """Manifest, icons, service worker and the <head> lines that use them."""
  icons_dir = os.path.join(ROOT, "icons")
  if not all(os.path.exists(os.path.join(icons_dir, n)) for n in ICONS):
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "make_icons.py")], check=True)
  for name in ICONS:
    shutil.copy2(os.path.join(icons_dir, name), docs)
  shutil.copy2(os.path.join(icons_dir, "icon-48.png"), os.path.join(docs, "favicon.png"))
  with open(os.path.join(docs, "manifest.json"), "w", encoding="utf-8") as fh:
    json.dump(MANIFEST, fh, indent=2)
  with open(os.path.join(docs, "sw.js"), "w", encoding="utf-8") as fh:
    fh.write(SW % {"stamp": time.strftime("%Y%m%d%H%M%S"),
                   "icons": ", ".join(f"'{n}'" for n in ICONS)})
  # the phone app's video player page (video.player_url opens it in Chrome)
  sys.path.insert(0, ROOT)
  import video
  with open(os.path.join(docs, "play.html"), "w", encoding="utf-8") as fh:
    fh.write(video.player_page())
  page = os.path.join(docs, "index.html")
  html = open(page, encoding="utf-8").read()
  if 'rel="manifest"' not in html:
    assert html.count("</head>") == 1, "pygbag page changed: no single </head>"
    html = html.replace("</head>", HEAD % {"theme": THEME} + "</head>")
  if "data-town-door" not in html:
    assert html.count("</head>") == 1, "pygbag page changed: no single </head>"
    html = html.replace("</head>", TOWN_DOOR + "</head>")
  with open(page, "w", encoding="utf-8") as fh:
    fh.write(html)
  # the 3D Wonder Town (three.js, town_web/) is the front door: docs/town/
  town = os.path.join(docs, "town")
  subprocess.run([sys.executable, os.path.join(ROOT, "tools", "export_town_data.py")], check=True)  # categories + pictures
  subprocess.run([sys.executable, os.path.join(ROOT, "tools", "export_trace3d.py")], check=True)     # the 3D tracing stage
  shutil.rmtree(town, ignore_errors=True)
  shutil.copytree(os.path.join(ROOT, "town_web"), town)


if __name__ == "__main__":
  main()
