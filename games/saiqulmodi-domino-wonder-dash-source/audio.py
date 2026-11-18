"""Sound effects and spoken names for Domino Game.

Every sound is generated in code (no asset files), so the game runs the same
on desktop, in the browser (pygbag) and on Android. If audio or speech is not
available on a device, the game keeps running silently instead of crashing.
"""

import base64
import io
import json
import math
import os
import random
import shutil
import struct
import subprocess
import sys
import time
from array import array

import pygame

import voice

RATE = 22050
IS_WEB = sys.platform == "emscripten"
IS_ANDROID = "ANDROID_ARGUMENT" in os.environ or hasattr(
    sys, "getandroidapilevel"
)


# --------------------------------------------------------------------------
# Procedural sound effects
# --------------------------------------------------------------------------
_RAW_ONLY = []   # set once the mixer refuses WAV files (the browser build)
SFX_GAIN = 0.65  # headroom: a chime, pops, clacks and the voice together never clip
TAIL_SECS = 0.008  # every sound fades out over its last few ms (no click at the end)


def _render(duration, fn, peak=0.6):
  rate = RATE
  if _RAW_ONLY:
    rate = pygame.mixer.get_init()[0]
  n = int(rate * duration)
  data = [fn(i / rate, i / n) for i in range(n)]
  top = max(1e-9, max(abs(s) for s in data))
  scale = peak * SFX_GAIN / top
  tail = max(1, int(rate * TAIL_SECS))
  for i in range(max(0, n - tail), n):
    data[i] *= (n - 1 - i) / tail
  pcm = array("h", (int(s * scale * 32767) for s in data))
  if sys.byteorder == "big":
    pcm.byteswap()
  if _RAW_ONLY:
    return _raw_sound(pcm)
  # WAV header written by hand: the browser build (pygbag) has no `wave`
  # module and would try to fetch an unrelated "wave" package instead.
  data = pcm.tobytes()
  header = (b"RIFF" + struct.pack("<I", 36 + len(data)) + b"WAVEfmt "
            + struct.pack("<IHHIIHH", 16, 1, 1, RATE, RATE * 2, 2, 16)
            + b"data" + struct.pack("<I", len(data)))
  try:
    return pygame.mixer.Sound(io.BytesIO(header + data))
  except Exception:
    # pygame-ce in the browser cannot read a file object: hand it raw samples
    # at the mixer's own rate instead (all later sounds go straight this way).
    _RAW_ONLY.append(True)
    return _render(duration, fn, peak)


def _raw_sound(pcm):
  """Mono 16-bit samples -> a Sound in the mixer's own channel layout."""
  channels = pygame.mixer.get_init()[2]
  if channels > 1:
    wide = array("h", bytes(len(pcm) * 2 * channels))
    for c in range(channels):
      wide[c::channels] = pcm
    pcm = wide
  return pygame.mixer.Sound(buffer=pcm.tobytes())


def _sin(freq, t):
  return math.sin(2 * math.pi * freq * t)


def _click(t, p):
  return _sin(1400, t) * (1 - p) ** 3 + 0.3 * _sin(2800, t) * (1 - p) ** 6


def _switch(t, p):
  freq = 660 if p < 0.5 else 990
  local = (p * 2) % 1
  return _sin(freq, t) * math.sin(math.pi * local) ** 0.5 * (1 - local * 0.6)


def _make_pencil(freq):
  def fn(t, p):
    return _sin(freq, t) * math.sin(math.pi * p) + 0.2 * random.uniform(-1, 1) * (1 - p)
  return fn


def _tip(t, p):
  knock = (_sin(220, t) + 0.5 * _sin(440, t)) * math.exp(-t * 45)
  return knock + random.uniform(-1, 1) * math.exp(-t * 120) * 0.4


def _make_clack(pitch):
  def fn(t, p):
    noise = random.uniform(-1, 1) * math.exp(-t * 90) * 0.6
    body = _sin(pitch, t) * math.exp(-t * 60) * 0.5
    ring = _sin(pitch * 2.7, t) * math.exp(-t * 80) * 0.2
    return noise + body + ring
  return fn


def _make_pop(freq):
  def fn(t, p):
    # Quick upward bubble: pitch slides up while it fades
    f = freq * (1 + 0.5 * p)
    return math.sin(2 * math.pi * f * t) * (1 - p) ** 2
  return fn


# Pentatonic notes, so covering dots one after another plays a little tune
POP_FREQS = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093, 2349]

_CHIME_NOTES =[(0.0, 523.25), (0.12, 659.25), (0.24, 783.99), (0.36, 1046.5)]


def _horn(t, p):
  """Beep-beep: a friendly two-tone car horn (Cross the Road)."""
  on = (t % 0.22) < 0.15
  tone = 0.6 * _sin(392, t) + 0.5 * _sin(494, t) + 0.25 * _sin(784, t)
  return tone if on else 0.0


def _make_bell(freq):
  """A soft glockenspiel note: bright attack, two overtones, quick fade."""
  def fn(t, p):
    attack = min(1.0, t / 0.004)
    return attack * (math.sin(2 * math.pi * freq * t) * math.exp(-t * 6)
                     + 0.35 * math.sin(4 * math.pi * freq * t) * math.exp(-t * 9)
                     + 0.12 * math.sin(2 * math.pi * 4.07 * freq * t) * math.exp(-t * 16))
  return fn


def _make_voice(inst, freq):
  """One note of an instrument, made in code (domino music and jingles)."""
  tau = 2 * math.pi
  if inst == "xylophone":                    # wooden bar: bright, quick
    return lambda t, p: min(1.0, t / 0.002) * (
        math.sin(tau * freq * t) * math.exp(-t * 11)
        + 0.4 * math.sin(tau * 3.93 * freq * t) * math.exp(-t * 30))
  if inst == "marimba":                      # soft, round wood
    return lambda t, p: min(1.0, t / 0.004) * (
        math.sin(tau * freq * t) * math.exp(-t * 7)
        + 0.18 * math.sin(tau * 4.0 * freq * t) * math.exp(-t * 22))
  if inst == "piano":
    return lambda t, p: min(1.0, t / 0.003) * sum(
        a * math.sin(tau * freq * k * 1.0008 ** k * t) * math.exp(-t * (3 + 2.5 * k))
        for k, a in ((1, 1.0), (2, 0.45), (3, 0.22), (4, 0.1)))
  if inst == "harp":                         # plucked string
    return lambda t, p: min(1.0, t / 0.002) * sum(
        math.sin(tau * freq * k * t) * math.exp(-t * (4 + 3 * k)) / k for k in range(1, 6))
  if inst == "flute":                        # breathy, gentle swell, vibrato
    return lambda t, p: (min(1.0, t / 0.05) * (1 - p) ** 0.6
                         * (math.sin(tau * freq * t + 0.04 * math.sin(tau * 5.5 * t))
                            + 0.12 * math.sin(tau * 2 * freq * t)
                            + 0.03 * random.uniform(-1, 1)))
  if inst == "steel drum":
    return lambda t, p: min(1.0, t / 0.003) * math.exp(-t * 5) * (
        math.sin(tau * freq * t) + 0.5 * math.sin(tau * 2 * freq * t)
        + 0.3 * math.sin(tau * 3.01 * freq * t) * math.exp(-t * 6))
  if inst == "kalimba":                      # thumb piano: a click, then a soft tine
    return lambda t, p: min(1.0, t / 0.002) * (
        math.sin(tau * freq * t) * math.exp(-t * 6)
        + 0.35 * math.sin(tau * 5.4 * freq * t) * math.exp(-t * 40))
  if inst == "sitar":                        # buzzing pluck that bends a little
    def fn(t, p):
      f = freq * (1 + 0.012 * math.exp(-t * 10))
      s = sum(math.sin(tau * f * k * t) / k ** 0.8 for k in range(1, 7))
      return min(1.0, t / 0.002) * math.exp(-t * 4.5) * math.tanh(1.6 * s)
    return fn
  if inst == "water drop":                   # a drip: the pitch jumps up as it falls
    return lambda t, p: (math.sin(tau * freq * (1 + 1.2 * p) * t)
                         * math.exp(-t * 28) * min(1.0, t / 0.002))
  return _make_bell(freq)


INSTRUMENTS = ["bell", "xylophone", "marimba", "piano", "harp", "flute", "steel drum",
               "kalimba", "sitar", "water drop"]
NOTE_LEN = {"water drop": 0.2, "xylophone": 0.4, "kalimba": 0.5, "flute": 0.45,
            "sitar": 0.6, "piano": 0.6, "harp": 0.6, "steel drum": 0.5, "marimba": 0.5}
NOTE_LOW, NOTE_HIGH = 55, 91        # MIDI notes the domino music may use


def _beep(t, p):
  """The walk signal's tick-tock beep."""
  return _sin(1250, t) * (1 - p) ** 0.5


def _chime(t, p):
  total = 0.0
  for start, freq in _CHIME_NOTES:
    if t >= start:
      lt = t - start
      bell = _sin(freq, lt) + 0.3 * _sin(freq * 2, lt) + 0.15 * _sin(freq * 3, lt)
      total += bell * math.exp(-lt * 4)
  return total


class SoundBank:
  """Holds all effects; play() silently does nothing if audio is unavailable."""

  CLACK_STEPS = 8

  def __init__(self):
    self.ok = False
    self.sounds = {}
    try:
      if not pygame.mixer.get_init():
        pygame.mixer.init()
      pygame.mixer.set_num_channels(24)
      random.seed(7)
      self.sounds["click"] = [_render(0.05, _click, 0.45)]
      self.sounds["switch"] = [_render(0.16, _switch, 0.45)]
      self.sounds["pencil"] = [
          _render(0.035, _make_pencil(f), 0.12) for f in (700, 820, 950, 1080)
      ]
      self.sounds["tip"] = [_render(0.10, _tip, 0.7)]
      # Clack pitch climbs along the chain so the cascade "ripples".
      self.sounds["clack"] = [
          _render(0.06, _make_clack(1500 + k * 150), 0.5)
          for k in range(self.CLACK_STEPS)
      ]
      self.sounds["chime"] = [_render(1.4, _chime, 0.6)]
      self.sounds["pop"] = [_render(0.07, _make_pop(f), 0.35) for f in POP_FREQS]
      self.sounds["horn"] = [_render(0.40, _horn, 0.45)]
      self.sounds["beep"] = [_render(0.06, _beep, 0.3)]
      self.ok = True
    except Exception as exc:  # no audio device, unsupported platform, ...
      print(f"[audio] sound effects disabled: {exc}")

  def _voice(self, inst, midi):
    notes = self.sounds.setdefault("notes", {})
    key = (inst, midi)
    snd = notes.get(key)
    if snd is None:
      snd = notes[key] = _render(NOTE_LEN.get(inst, 0.55),
                                 _make_voice(inst, 440 * 2 ** ((midi - 69) / 12)), 0.33)
    return snd

  def note(self, midi, inst="bell", volume=1.0):
    """Plays one note (MIDI number) on an instrument; made the first time it is needed."""
    if not self.ok:
      return
    midi = max(NOTE_LOW, min(NOTE_HIGH, int(midi)))
    try:
      ch = self._voice(inst, midi).play()
      if ch is not None:
        ch.set_volume(volume)
    except Exception:
      pass

  def ready(self, inst):
    """True once every note of this instrument has been made."""
    notes = self.sounds.get("notes", {})
    return all((inst, m) in notes for m in range(NOTE_LOW, NOTE_HIGH + 1))

  def prepare(self, inst, midis):
    """Makes these notes now (the Domino Highway's raga), so its music never waits."""
    if not self.ok:
      return
    for midi in midis:
      self._voice(inst, max(NOTE_LOW, min(NOTE_HIGH, int(midi))))

  def warm(self, inst="bell"):
    """Makes one more note of the coming music ahead of time (called while the game
    is idle, so the domino music never has to wait)."""
    if not self.ok:
      return
    notes = self.sounds.setdefault("notes", {})
    for midi in range(NOTE_LOW, NOTE_HIGH + 1):
      if (inst, midi) not in notes:
        self._voice(inst, midi)
        return

  def play(self, name, variant=None):
    if not self.ok:
      return
    bank = self.sounds.get(name)
    if not bank:
      return
    if variant is None:
      snd = random.choice(bank)
    else:
      snd = bank[variant % len(bank)]
    try:
      snd.play()
    except Exception:
      pass


# --------------------------------------------------------------------------
# Spoken names (text to speech)
# --------------------------------------------------------------------------
# One long-lived PowerShell process speaks each line it receives, so there is
# no start-up delay per word and a new word cancels the previous one.
# Lines are "en<TAB>text" or "<lang><TAB>native text<TAB>english fallback"
# (lang = hi or bn). English uses the classic voices; Hindi/Bengali use the
# newer Windows voices (Settings > Time & language > Speech > Add voices) and
# fall back to the English text when that voice is not installed.
_WINDOWS_TTS = r"""
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.Rate = -2
$player = $null
$voices = @{}
$asTask = $null
try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  $null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
  $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
  foreach ($lang in @('hi', 'bn')) {
    $voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices |
      Where-Object { $_.Language -like "$lang*" } | Select-Object -First 1
    if ($voice) {
      $syn = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
      $syn.Voice = $voice
      $syn.Options.SpeakingRate = 0.85
      $voices[$lang] = $syn
    }
  }
} catch { $voices = @{} }
$in = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), [System.Text.Encoding]::UTF8)
while ($true) {
  $line = $in.ReadLine()
  if ($line -eq $null) { break }
  $s.SpeakAsyncCancelAll()
  if ($player) { $player.Stop(); $player = $null }
  $parts = $line.Split("`t")
  try {
    $native = $voices[$parts[0]]
    if ($parts[0] -ne 'en' -and $native) {
      $op = $native.SynthesizeTextToStreamAsync($parts[1])
      $task = $asTask.MakeGenericMethod([Windows.Media.SpeechSynthesis.SpeechSynthesisStream]).Invoke($null, @($op))
      $task.Wait(-1) | Out-Null
      $ms = New-Object System.IO.MemoryStream
      [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($task.Result).CopyTo($ms)
      $ms.Position = 0
      $player = New-Object System.Media.SoundPlayer $ms
      $player.Play()
    } else {
      $text = $parts[$parts.Length - 1]
      if ($text.Length -gt 0) { [void]$s.SpeakAsync($text) }
    }
  } catch { }
}
"""


# Browser speech: the device's most natural voice (Edge "Natural" neural voices, Chrome's
# Google voices, Apple's enhanced ones) instead of the default robotic one. Each sentence
# is its own utterance (long ones stop half way in Chrome) and is kept referenced until
# spoken (Chrome drops utterances that get garbage collected, cutting the line).
_WEB_TTS = r"""
(function(){
  var S = window.speechSynthesis;
  if (!S || window.dgSay) return;
  var picked = {};
  function score(v, lg) {
    var lang = v.lang.replace('_', '-').toLowerCase(), n = v.name.toLowerCase(), s = 0;
    if (lang.indexOf(lg) !== 0) return -1;
    if (n.indexOf('natural') >= 0) s += 100;
    if (n.indexOf('neural') >= 0 || n.indexOf('online') >= 0) s += 60;
    if (n.indexOf('google') >= 0) s += 50;
    if (n.indexOf('premium') >= 0 || n.indexOf('enhanced') >= 0) s += 40;
    if (!v.localService) s += 10;
    if (/-in$/.test(lang)) s += 8;
    if (/female|neerja|swara|tanishaa|heera|kalpana|aria|jenny|samantha|zira|lekha|veena/.test(n)) s += 3;
    if (/david|mark|espeak|compact|novelty|bad news|whisper|zarvox|bells/.test(n)) s -= 30;
    return s;
  }
  function pick(lg) {
    if (picked[lg] !== undefined) return picked[lg];
    var vs = S.getVoices(), best = null, bs = -1;
    for (var i = 0; i < vs.length; i++) {
      var s = score(vs[i], lg);
      if (s > bs) { bs = s; best = vs[i]; }
    }
    if (vs.length) picked[lg] = best;
    return best;
  }
  S.getVoices();
  if (S.addEventListener) S.addEventListener('voiceschanged', function(){ picked = {}; });
  window.dgQ = [];
  window.dgSay = function(hi, en, lg) {
    var v = hi ? pick(lg) : null, text = v ? hi : en;
    if (!v) v = pick('en');
    var stop = '.!?' + String.fromCharCode(2404);
    var parts = String(text).match(new RegExp('[^' + stop + ']+[' + stop + ']* *', 'g')) || [String(text)];
    var smooth = v && (!v.localService || /natural|neural|google|premium|enhanced/i.test(v.name));
    var go = function() {
      window.dgQ = parts.map(function(p) {
        var u = new SpeechSynthesisUtterance(p.trim());
        if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = smooth ? 0.92 : 0.85;
        u.pitch = 1.05;
        S.speak(u);
        return u;
      });
    };
    window.dgStopClip();
    if (S.speaking || S.pending) { S.cancel(); setTimeout(go, 80); } else go();
  };
  window.dgClip = null;
  window.dgClipOn = false;
  window.dgStopClip = function() {
    if (window.dgClip) { window.dgClip.onended = window.dgClip.onerror = null; window.dgClip.pause(); }
    window.dgClip = null;
    window.dgClipOn = false;
  };
  window.dgPlay = function(url, hi, en, lg) {
    if (S.speaking || S.pending) S.cancel();
    window.dgStopClip();
    var a = new Audio(url), fallback = function() {
      if (window.dgClip !== a) return;
      window.dgStopClip();
      window.dgSay(hi, en, lg);
    };
    window.dgClip = a;
    window.dgClipOn = true;
    a.onended = function() { if (window.dgClip === a) window.dgClipOn = false; };
    a.onerror = fallback;
    var p = a.play();
    if (p && p.catch) p.catch(fallback);
  };
})();
"""


class Speaker:
  """Says words out loud using whatever voice the device already has."""

  CHARS_PER_SEC = 10.0     # how fast the voices speak at their slow rate (an estimate)

  def __init__(self):
    self.mode = None
    self._proc = None
    self._tts = None
    self._said_at, self._est = 0.0, 0.0
    try:
      if IS_WEB:
        import platform  # pygbag's browser bridge
        self._window = platform.window
        self._window.eval(_WEB_TTS)
        self.mode = "web"
      elif IS_ANDROID:
        from jnius import autoclass
        activity = autoclass("org.kivy.android.PythonActivity").mActivity
        self._tts_cls = autoclass("android.speech.tts.TextToSpeech")
        self._locale = autoclass("java.util.Locale")
        self._jstring = autoclass("java.lang.String")
        self._bundle = autoclass("android.os.Bundle")
        self._tts = self._tts_cls(activity, None)
        self.mode = "android"
      elif os.name == "nt":
        script = base64.b64encode(_WINDOWS_TTS.encode("utf-16-le")).decode("ascii")
        self._proc = subprocess.Popen(
            ["powershell", "-NoProfile", "-NonInteractive", "-EncodedCommand",
             script],
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        self.mode = "windows"
      elif sys.platform == "darwin" and shutil.which("say"):
        self.mode = "say"
      elif shutil.which("espeak-ng") or shutil.which("espeak"):
        self.mode = "espeak"
    except Exception as exc:
      print(f"[audio] speech disabled: {exc}")
      self.mode = None

  def say(self, text, hindi=None, lang="hi"):
    """Speaks text. If `hindi` (native text) is given it is spoken in that
    language (lang "hi" Hindi or "bn" Bengali) where the device has such a
    voice; otherwise the English text is spoken."""
    self._said_at = time.time()
    self._est = 0.5 + len(hindi or text or "") / self.CHARS_PER_SEC
    try:
      if self.mode == "windows":
        if self._proc.poll() is None:
          clean = [p.replace("\t", " ").replace("\r", " ").replace("\n", " ")
                   for p in (hindi, text) if p is not None]
          line = (f"{lang}\t" if hindi else "en\t") + "\t".join(clean) + "\n"
          self._proc.stdin.write(line.encode("utf-8"))
          self._proc.stdin.flush()
      elif self.mode == "web":
        args = f"{json.dumps(hindi)}, {json.dumps(text)}, {json.dumps(lang)}"
        clip = voice.url(lang, hindi) if hindi else voice.url("en", text)
        if clip:
          self._window.eval(f"window.dgPlay && window.dgPlay({json.dumps(clip)}, {args});")
        else:
          self._window.eval(f"window.dgSay && window.dgSay({args});")
      elif self.mode == "android":
        self._tts.setSpeechRate(0.8)
        speak = text
        if hindi:
          hi = self._locale(lang, "IN")
          if self._tts.isLanguageAvailable(hi) >= 0:
            self._tts.setLanguage(hi)
            speak = hindi
          else:
            self._tts.setLanguage(self._locale.US)
        else:
          self._tts.setLanguage(self._locale.US)
        # speak(CharSequence, int, Bundle, String): a plain Python str and None
        # match no Java method, so the text goes in as a Java CharSequence
        from jnius import cast
        words = cast("java.lang.CharSequence", self._jstring(speak))
        self._tts.speak(words, self._tts_cls.QUEUE_FLUSH, self._bundle(), "domino")
      elif self.mode in ("say", "espeak"):
        self._stop_child()
        if self.mode == "say":
          args = ["say", "-r", "150", text]
          if hindi and lang == "hi":
            args = ["say", "-v", "Lekha", "-r", "150", hindi]
        else:
          exe = shutil.which("espeak-ng") or shutil.which("espeak")
          args = [exe, "-s", "130", text]
          if hindi:
            args = [exe, "-v", lang, "-s", "120", hindi]
        self._proc = subprocess.Popen(
            args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
    except Exception as exc:
      print(f"[audio] could not speak: {exc}")

  def busy(self):
    """True while the last line is still being spoken, so the game can wait for the end
    of a sentence instead of cutting it off. The browser and Android say when they are
    speaking; elsewhere the line's length gives an estimate."""
    if self.mode is None:
      return False
    since = time.time() - self._said_at
    if since > self._est * 2.5 + 3.0:            # never wait for ever
      return False
    try:
      if self.mode == "web":
        return (since < 0.6 or bool(self._window.speechSynthesis.speaking)
                or bool(self._window.dgClipOn))
      if self.mode == "android":
        return since < 0.6 or bool(self._tts.isSpeaking())
    except Exception:
      pass
    return since < self._est

  def _stop_child(self):
    if self._proc is not None and self._proc.poll() is None:
      self._proc.terminate()

  def close(self):
    try:
      if self.mode == "windows" and self._proc.poll() is None:
        self._proc.stdin.close()  # PowerShell loop ends by itself
        try:
          self._proc.wait(timeout=1)
        except subprocess.TimeoutExpired:
          self._proc.terminate()
      elif self.mode == "android":
        self._tts.shutdown()
      elif self.mode in ("say", "espeak"):
        self._stop_child()
    except Exception:
      pass
