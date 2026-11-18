"""Class packs: pictures of Classes 2-7 are downloaded the first time a child opens one of their categories
(user, 01-Nov-2026: "fetch it automatically when required by the player ... discard the same MB" from the box).

tools/build_web.py moves every picture used only by one of Classes 2-7 into docs/packs/class<n>.tar and writes
packs.json (pack -> picture names) into the game. In the browser, a missing picture's pack is fetched once
(GitHub Pages; the Stratos box fetches from there too), unpacked into pics/, and the game redraws. The site's
service worker keeps the downloaded pack, so it also opens offline afterwards. On the computer every picture is
already there: nothing is downloaded.
"""

import asyncio
import io
import json
import os
import sys
import tarfile

HERE = os.path.dirname(os.path.abspath(__file__))
PICS = os.path.join(HERE, "pics")
IS_WEB = sys.platform == "emscripten"
PAGES = "https://saiqulmodi.github.io/DominoGame/"   # where the packs live when the game runs elsewhere

_INFO = {}
_PIC_PACK = {}
try:
  with open(os.path.join(HERE, "packs.json"), encoding="utf-8") as fh:
    _INFO = json.load(fh)
  for _pack, _entry in _INFO.items():
    for _name in _entry["pics"]:
      _PIC_PACK[_name] = _pack
except (OSError, ValueError):
  pass                                   # the computer version: no packs, every picture is in pics/

_loaded = set()
_tasks = {}                              # pack -> asyncio task while downloading
_failed = set()


def pack_of(pic_path):
  """The pack a missing picture comes in, or None when it is here (or not in any pack)."""
  if not pic_path:
    return None
  name = os.path.basename(pic_path)
  pack = _PIC_PACK.get(name)
  if pack is None or pack in _loaded or os.path.exists(os.path.join(PICS, name)):
    return None
  return pack


def busy():
  """True while a pack is downloading (the game shows a spinning ring)."""
  return any(not t.done() for t in _tasks.values())


def _base():
  try:
    import platform
    host = str(platform.window.location.host)
    href = str(platform.window.location.href).split("?")[0].split("#")[0]
  except Exception:
    return PAGES
  if "saiqulmodi.github.io" in host or host.startswith(("127.0.0.1", "localhost")):
    return href.rsplit("/", 1)[0] + "/"  # next to the game page
  return PAGES


async def _fetch(pack, on_done):
  try:
    import platform
    url = _base() + _INFO[pack]["file"]
    async with platform.fopen(url, "rb") as fh:
      data = fh.read()
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as tar:
      tar.extractall(PICS, filter="data")
    _loaded.add(pack)
    if on_done:
      on_done(pack)
  except Exception as err:               # offline the first time: try again on the next tap
    _failed.add(pack)
    print("pack", pack, "not downloaded:", err)
  finally:
    _tasks.pop(pack, None)


def request(pics, on_done=None):
  """Starts downloading the packs these pictures (paths or names) need. Returns True if anything is coming."""
  if not IS_WEB:
    return False
  wanted = {p for p in (pack_of(x) for x in pics) if p}
  for pack in wanted:
    if pack not in _tasks:
      _failed.discard(pack)
      _tasks[pack] = asyncio.get_event_loop().create_task(_fetch(pack, on_done))
  return bool(wanted)
