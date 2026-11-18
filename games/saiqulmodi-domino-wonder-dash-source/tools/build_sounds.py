"""Saves every real-life sound from calls.py as a small OGG file in sounds/.

Run:  python tools/build_sounds.py      (needs: pip install soundfile numpy)
"""
import os
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import calls  # noqa: E402


def main():
  os.makedirs(calls.SOUND_DIR, exist_ok=True)
  total = 0
  for key in calls.SOUNDS:
    data = np.array(calls.make_samples(key), dtype=np.float32)
    peak = float(np.max(np.abs(data))) or 1.0
    data = np.clip(data * (0.7 / peak), -1, 1)
    path = os.path.join(calls.SOUND_DIR, key + ".ogg")
    sf.write(path, data, calls.RATE, format="OGG", subtype="VORBIS")
    total += os.path.getsize(path)
  print(f"{len(calls.SOUNDS)} sounds written to sounds/, {total / 1e6:.2f} MB")


if __name__ == "__main__":
  main()
