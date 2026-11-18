"""Recorded natural voices for fixed spoken lines (browser build).

tools/make_voice.py records the welcome, class and How-to-play lines with free
neural voices (Piper) into docs/voice/<key>.mp3 on GitHub Pages and writes
voice_keys.py. The game plays a recording by link when one exists for the exact
line, so nothing is added to the game pack; other lines (and any recording that
cannot load) use the device's own voice.
"""

import hashlib

BASE = "https://saiqulmodi.github.io/DominoGame/voice/"

try:
  from voice_keys import KEYS
except ImportError:
  KEYS = frozenset()


def key(lang, text):
  return hashlib.sha1(f"{lang}|{text}".encode("utf-8")).hexdigest()[:16]


def url(lang, text):
  """Link to the recording of this exact line, or None."""
  k = key(lang, text)
  return f"{BASE}{k}.mp3" if k in KEYS else None
