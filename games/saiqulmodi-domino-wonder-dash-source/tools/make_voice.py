"""Records the game's fixed spoken lines in natural voices for the browser build.

Lines: the Wonder Town welcome, "Pick your class", the class welcomes and every
How to play page and nudge, in English, Hindi and Bengali. Each line becomes
docs/voice/<key>.mp3 (served by GitHub Pages, played by link, so the game pack and
the Stratos box do not grow) and voice_keys.py lists the keys the game knows.

Voices are Piper (free, runs on the laptop CPU, https://github.com/rhasspy/piper),
in its own Python environment so the game's Python stays clean:
  python -m venv <env>; <env>/Scripts/python -m pip install piper-tts imageio-ffmpeg
Models (.onnx + .onnx.json) from https://huggingface.co/rhasspy/piper-voices :
  en_GB-cori-high (public domain), hi_IN-priyamvada-medium (CC BY-NC-SA 4.0),
  bn_BD-google-medium (CC BY-SA 4.0)

Run:  python tools/make_voice.py <piper env python> <models folder> [--all]
Only lines without a recording are made unless --all is given.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
os.environ.setdefault("SDL_AUDIODRIVER", "dummy")

import howto  # noqa: E402
import voice  # noqa: E402
import world  # noqa: E402

OUT = os.path.join(ROOT, "docs", "voice")
MODELS = {"en": ("en_GB-cori-high", None),
          "hi": ("hi_IN-priyamvada-medium", None),
          "bn": ("bn_BD-google-medium", 12)}   # 12: clear female voice (~260 Hz)
PACE = 1.08            # a little slower than normal: clear for young children
# Said, not read: signs the voices would skip or spell out
WORDS = {"en": {" + ": " plus ", " = ": " equals "},
         "hi": {" + ": " जोड़ ", " = ": " बराबर "},
         "bn": {" + ": " যোগ ", " = ": " সমান "}}

SYNTH = r"""
import json, subprocess, sys, wave
from piper import PiperVoice, SynthesisConfig
models, ffmpeg, jobs = sys.argv[1], sys.argv[2], json.load(sys.stdin)
loaded = {}
for job in jobs:
  name, speaker = job["model"]
  if name not in loaded:
    loaded[name] = PiperVoice.load(f"{models}/{name}.onnx")
  wav = job["out"][:-4] + ".wav"
  with wave.open(wav, "wb") as wf:
    loaded[name].synthesize_wav(job["say"], wf, SynthesisConfig(
        speaker_id=speaker, length_scale=job["pace"], noise_scale=0.6, noise_w_scale=0.8))
  subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", wav, "-af",
                  "adelay=120,apad=pad_dur=0.15,loudnorm=I=-16:TP=-1.5",
                  "-ac", "1", "-ar", "44100", "-b:a", "64k", job["out"]], check=True)
  print(job["key"], job["say"][:60].encode("ascii", "replace").decode())
"""


def lines():
  """(en, hi, bn) for every fixed line the game speaks."""
  out = [world.WELCOME, world.PICK_CLASS] + [world.class_welcome(n) for n in range(1, 8)]
  for pages in howto.PAGES.values():
    out += [tuple(p[2:5]) for p in pages]
  out += [howto.NUDGE, howto.TAP_NUDGE]
  return out


def spoken(lang, text):
  for a, b in WORDS[lang].items():
    text = text.replace(a, b)
  return text


def main():
  piper_py, models = sys.argv[1], sys.argv[2]
  redo = "--all" in sys.argv
  os.makedirs(OUT, exist_ok=True)
  keys, jobs = set(), []
  for trio in lines():
    for lang, text in zip(("en", "hi", "bn"), trio):
      k = voice.key(lang, text)
      keys.add(k)
      out = os.path.join(OUT, k + ".mp3")
      if redo or not os.path.exists(out):
        jobs.append({"key": k, "model": MODELS[lang], "say": spoken(lang, text),
                     "out": out, "pace": PACE})
  ffmpeg = subprocess.run([piper_py, "-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"],
                          capture_output=True, text=True, check=True).stdout.strip()
  if jobs:
    subprocess.run([piper_py, "-c", SYNTH, models, ffmpeg], input=json.dumps(jobs),
                   text=True, encoding="utf-8", check=True)
  for f in os.listdir(OUT):                      # tidy: wav working files, retired lines
    if f.endswith(".wav") or f[:-4] not in keys:
      os.remove(os.path.join(OUT, f))
  with open(os.path.join(ROOT, "voice_keys.py"), "w", encoding="utf-8", newline="\n") as fh:
    fh.write('"""Made by tools/make_voice.py: lines with a natural-voice recording."""\n\n')
    fh.write("KEYS = frozenset([\n")
    for k in sorted(keys):
      fh.write(f'    "{k}",\n')
    fh.write("])\n")
  size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
  print(f"{len(keys)} lines, {len(jobs)} recorded now, docs/voice = {size / 1e6:.2f} MB")


if __name__ == "__main__":
  main()
