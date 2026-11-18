"""Game start / end for the Stratos analytics (rule: C:\\Users\\saiqu\\GAME_ANALYTICS_RULE.md).

track("level_start", ...) starts the clock; "level_complete" / "game_over" also carry
`seconds` = how long that game lasted. Events go only to the shared Stratos script on
the stratos.games play page (window.Stratos). Anywhere else (GitHub Pages, APK,
desktop) there is no window.Stratos, so nothing is sent and nothing can break.
"""
import json
import time

_started = 0.0


def pic_no(key):
  """A stable number 1-9999 for a picture, so Stratos Coins pay its first finish once as a new level."""
  h = 5381
  for ch in str(key):
    h = (h * 33 + ord(ch)) % 2147483647
  return h % 9999 + 1


def track(name, **details):
  global _started
  try:
    if name == "level_start":
      _started = time.time()
    elif name in ("level_complete", "game_over") and _started and "seconds" not in details:
      details["seconds"] = int(round(time.time() - _started))
    import platform
    w = getattr(platform, "window", None)
    if w is None:
      return
    s = w.Stratos
    if not s:
      try:
        s = w.parent.Stratos
      except Exception:
        s = None
    if s:
      s.track(name, w.JSON.parse(json.dumps(details)))
  except Exception:
    pass
