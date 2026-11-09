#!/usr/bin/env python3
"""Crystal Quest - original procedural music + sound effects (numpy synthesis, no samples).
Run: python3 gen_audio.py <audio_root>   -> writes .ogg and .mp3 (needs ffmpeg)."""
import os, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

ROOT = sys.argv[1] if len(sys.argv) > 1 else "audio"
SR = 44100
TWO_PI = 2 * np.pi

# ------------------------------------------------------------------ helpers
def tarr(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): b, a = butter(o, min(fc / (SR/2), .99), 'low'); return lfilter(b, a, x)
def hp(x, fc, o=2): b, a = butter(o, min(fc / (SR/2), .99), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = butter(o, [lo/(SR/2), min(hi/(SR/2), .99)], 'band'); return lfilter(b, a, x)
rng = np.random.default_rng(7)
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def env(n, a=.01, dec=.3, rel=.05, sus=0.0):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1) * (sus + (1 - sus) * np.exp(-t / dec))
    r = int(rel * SR)
    if r and r < n: e[-r:] *= np.linspace(1, 0, r)
    return e
def saw_h(f, t, hmax, decay=1.0):
    return sum(np.sin(TWO_PI * f * h * t) / (h ** decay) for h in range(1, hmax + 1) if f * h < 16000)

# ------------------------------------------------------------------ instruments (mono arrays)
def pluck(f, d, v=1):
    t = tarr(d); y = sum(np.sin(TWO_PI * f * h * t) * np.exp(-t * (3 + 2.2 * h)) / h for h in range(1, 7))
    return y * v * np.minimum(t / .003, 1) * .6
def bell(f, d, v=1):
    t = tarr(d); idx = 3.2 * np.exp(-t * 3.5)
    y = np.sin(TWO_PI * f * t + idx * np.sin(TWO_PI * f * 3.5 * t)) * np.exp(-t * 2.4)
    return y * v * np.minimum(t / .002, 1) * .55
def pad(f, d, v=1):
    t = tarr(d); y = 0
    for det in (-.006, 0, .006):
        y = y + saw_h(f * (1 + det), t + 0, 7, 1.4)
    y = y * (1 + .05 * np.sin(TWO_PI * 4.7 * t)) / 3
    return y * v * env(len(t), .35, 99, .5, 1.0) * .35
def flute(f, d, v=1):
    t = tarr(d); vib = 1 + .006 * np.sin(TWO_PI * 5.2 * t) * np.minimum(t / .25, 1)
    y = np.sin(TWO_PI * f * vib * t) + .25 * np.sin(TWO_PI * 2 * f * vib * t) + .06 * lp(noise(d), 3500)
    return y * v * env(len(t), .06, 99, .09, 1.0) * .55
def bass(f, d, v=1):
    t = tarr(d); y = np.sin(TWO_PI * f * t) + .45 * np.sin(TWO_PI * 2 * f * t) + .15 * np.sin(TWO_PI * 3 * f * t)
    return y * v * env(len(t), .008, .5, .05, .3) * .7
def brass(f, d, v=1):
    t = tarr(d); y = saw_h(f, t, 12, 1.0) * (1 + .03 * np.sin(TWO_PI * 5 * t))
    sw = np.minimum(t / .12, 1); y = lp(y, 1400 + 2600 * float(sw.mean()), 2)
    return y * v * env(len(t), .03, 99, .08, 1.0) * .28
def oud(f, d, v=1):
    t = tarr(d); y = sum(np.sin(TWO_PI * f * h * t) * np.exp(-t * (4 + 3 * h)) * (1 if h % 2 else .6) / h for h in range(1, 8))
    return y * v * np.minimum(t / .002, 1) * .65
def kick(v=1, low=45):
    t = tarr(.35); fr = low + 90 * np.exp(-t * 28)
    return np.sin(TWO_PI * np.cumsum(fr) / SR) * np.exp(-t * 9) * v
def snare(v=1):
    t = tarr(.25); return (hp(noise(.25), 1500) * np.exp(-t * 20) * .8 + np.sin(TWO_PI * 190 * t) * np.exp(-t * 25) * .5) * v
def hat(v=1, d=.05): t = tarr(d); return hp(noise(d), 7000) * np.exp(-t * 90) * v * .6
def shaker(v=1): t = tarr(.09); return bp(noise(.09), 4000, 9000) * np.exp(-t * 45) * v * .5
def taiko(v=1):
    t = tarr(.7); fr = 52 + 55 * np.exp(-t * 14)
    return (np.sin(TWO_PI * np.cumsum(fr) / SR) * np.exp(-t * 4.5) + .3 * lp(noise(.7), 600) * np.exp(-t * 20)) * v
def dum(v=1): t = tarr(.3); fr = 95 + 80 * np.exp(-t * 30); return np.sin(TWO_PI * np.cumsum(fr) / SR) * np.exp(-t * 11) * v
def tek(v=1): t = tarr(.12); return (bp(noise(.12), 1800, 6000) * np.exp(-t * 40) + np.sin(TWO_PI * 420 * t) * np.exp(-t * 35) * .4) * v * .7
def stab(f, d, v=1):
    t = tarr(d); y = saw_h(f, t, 10, .9) + saw_h(f * 1.0595, t, 10, .9) * .6   # dissonant minor-2nd stab
    return lp(y, 3000) * np.exp(-t * 7) * v * .3

def reverb(x, secs=1.8, wet=.3, seed=1):
    r = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    ir = [r.standard_normal(n) * np.exp(-t * (3.4 / secs * 2.0)) for _ in (0, 1)]
    ir = [lp(i, 6000, 1) for i in ir]
    L = fftconvolve(x, ir[0] * .03)[:len(x)]; R = fftconvolve(x, ir[1] * .03)[:len(x)]
    return L * wet, R * wet

class Mix:
    def __init__(self, secs):
        n = int(secs * SR); self.dry = [np.zeros(n), np.zeros(n)]; self.wet = np.zeros(n); self.n = n
    def put(self, sig, t0, g=1.0, pan=0.0, wet=0.0):
        i = int(t0 * SR)
        if i >= self.n: return
        seg = sig[: self.n - i]
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.dry[0][i:i + len(seg)] += seg * g * l * (1 - wet * .5); self.dry[1][i:i + len(seg)] += seg * g * r * (1 - wet * .5)
        if wet: self.wet[i:i + len(seg)] += seg * g * wet
    def out(self, rv=1.8, rw=1.0):
        L, R = reverb(self.wet, rv, rw); return self.dry[0] + L, self.dry[1] + R

# ------------------------------------------------------------------ music engine
SCALES = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'dorian': [0, 2, 3, 5, 7, 9, 10],
          'mixolydian': [0, 2, 4, 5, 7, 9, 10], 'phryg_dom': [0, 1, 4, 5, 7, 8, 10], 'harm_minor': [0, 2, 3, 5, 7, 8, 11]}
def deg(root, sc, d):
    s = SCALES[sc]; return root + 12 * (d // 7) + s[d % 7]

def melody_phrase(seed, sc, root, chords, rhythms, lo, hi):
    r = np.random.default_rng(seed); notes = []; cur = chords[0] + 4
    for bar, ch in enumerate(chords):
        rh = rhythms[(bar + seed) % len(rhythms)]; t = 0.0
        tones = [ch + o for o in (-7, -5, -3, 0, 2, 4, 7, 9, 11)]
        for i, dur in enumerate(rh):
            if i == 0 or r.random() < .45:
                cur = min(tones, key=lambda x: abs(x - cur) + r.random() * 1.5)
            else:
                cur += int(r.choice([-2, -1, 1, 1, 2]))
            cur = max(lo, min(hi, cur))
            if r.random() < .08: notes.append((bar * 4 + t, None, dur))
            else: notes.append((bar * 4 + t, cur, dur))
            t += dur
    return notes

INSTR = {'pluck': pluck, 'bell': bell, 'flute': flute, 'brass': brass, 'oud': oud}

def drum_pattern(style, mx, bar_t, beat, v=1.0):
    s = beat / 4   # sixteenth
    def hit(fn, step, g, pan=0): mx.put(fn(), bar_t + step * s, g * v, pan)
    if style == 'soft':
        hit(kick, 0, .35); hit(kick, 8, .3)
        for st in (4, 12): hit(shaker, st, .35, .3)
    elif style == 'light':
        hit(kick, 0, .45); hit(kick, 10, .35); hit(snare, 4, .22); hit(snare, 12, .26)
        for st in range(0, 16, 2): hit(hat, st, .28, .3)
    elif style == 'shaker':
        hit(dum, 0, .4); hit(dum, 8, .3)
        for st in range(0, 16, 2): hit(shaker, st, .28 + .1 * (st % 4 == 0), -.3)
    elif style == 'desert':
        for st, fn, g in ((0, dum, .55), (3, tek, .38), (6, dum, .42), (8, tek, .35), (10, tek, .3), (12, dum, .45), (14, tek, .38)): hit(fn, st, g, .1)
        hit(shaker, 4, .3); hit(shaker, 12, .3)
    elif style == 'drive':
        for st in (0, 6, 8): hit(taiko, st, .6)
        hit(kick, 0, .5); hit(snare, 4, .4); hit(snare, 12, .45)
        for st in range(0, 16, 2): hit(hat, st, .3, .35)
    elif style == 'boss':
        for st in (0, 3, 6, 8, 11, 14): hit(kick, st, .62)
        hit(snare, 4, .55); hit(snare, 12, .6); hit(taiko, 0, .5)
        for st in range(16): hit(hat, st, .24 if st % 2 else .34, .35)

def make_track(spec):
    bpm = spec['bpm']; beat = 60 / bpm; bars = spec.get('bars', 16); sc = spec['scale']; root = spec['root']
    secs = bars * 4 * beat; tail = 3.0
    mx = Mix(secs + tail); prog = spec['prog']
    chords = [prog[b % len(prog)] for b in range(bars)]
    ch_tones = lambda d: [deg(root, sc, d), deg(root, sc, d + 2), deg(root, sc, d + 4)]
    # pad
    if spec.get('pad', 1):
        for b, d in enumerate(chords):
            for k, m in enumerate(ch_tones(d)):
                mx.put(pad(mtof(m), 4 * beat + .6), b * 4 * beat, spec.get('pad', 1) * .5, (-.5, 0, .5)[k], .5)
    # bass
    bs = spec.get('bass', 'half')
    for b, d in enumerate(chords):
        f = mtof(deg(root, sc, d) - 24); bt = b * 4 * beat
        if bs == 'half':
            mx.put(bass(f, 1.8 * beat), bt, .7); mx.put(bass(f, 1.8 * beat), bt + 2 * beat, .55)
        elif bs == 'eighth':
            for i in range(8): mx.put(bass(f * (2 if i % 4 == 3 else 1), .45 * beat), bt + i * beat / 2, .62)
        elif bs == 'gallop':
            for i in range(4):
                mx.put(bass(f, .3 * beat), bt + i * beat, .62); mx.put(bass(f, .2 * beat), bt + i * beat + .5 * beat, .45); mx.put(bass(f * 1.5, .2 * beat), bt + i * beat + .75 * beat, .4)
    # arpeggio
    if spec.get('arp'):
        ins = INSTR[spec['arp']]; pat = spec.get('arp_pat', [0, 1, 2, 3, 2, 1, 2, 1])
        for b, d in enumerate(chords):
            tn = ch_tones(d) + [ch_tones(d)[0] + 12]
            for i, p in enumerate(pat):
                mx.put(ins(mtof(tn[p] + 12 * spec.get('arp_oct', 0)), .8 * beat), b * 4 * beat + i * beat / 2 * (8 / len(pat)), spec.get('arp_g', .3), (-.45, .45)[i % 2], .55)
    # melody
    if spec.get('melody'):
        ins = INSTR[spec['melody']]; ph = []
        phrases = [melody_phrase(spec['seed'] + k, sc, root, [prog[b % len(prog)] + 7 for b in range(4)] if False else [prog[b] + 7 for b in range(len(prog))] * (4 // len(prog)), spec['rhythms'], spec.get('lo', 7), spec.get('hi', 16)) for k in (0, 1)]
        order = spec.get('order', [0, 1, 0, 1])
        for ci in range(bars // 4):
            if ci < spec.get('mel_start', 0): continue
            for (t, dg, dur) in phrases[order[ci % 4]]:
                if dg is None: continue
                m = deg(root, sc, dg) + (12 if ci >= spec.get('lift_from', 99) else 0)
                mx.put(ins(mtof(m), dur * beat * .95 + .15), ci * 16 * beat + t * beat, spec.get('mel_g', .45), .1, .45)
    # drums
    if spec.get('drums'):
        for b in range(bars):
            if b < spec.get('drum_start', 0): continue
            drum_pattern(spec['drums'], mx, b * 4 * beat, beat, spec.get('drum_g', 1))
    # stabs (boss)
    if spec.get('stabs'):
        for b, d in enumerate(chords):
            if b % 2 == 0:
                for st in (0, 6, 10): mx.put(stab(mtof(deg(root, sc, d) + 12), .4 * beat), b * 4 * beat + st * beat / 4, .5, 0, .2)
    L, R = mx.out(spec.get('rv', 2.0), spec.get('rw', 1.0))
    n = int(secs * SR)
    if spec.get('loop', True):
        L[:int(tail * SR)] += L[n:n + int(tail * SR)]; R[:int(tail * SR)] += R[n:n + int(tail * SR)]
        L, R = L[:n], R[:n]
    else:
        f = int(1.2 * SR); L[-f:] *= np.linspace(1, 0, f); R[-f:] *= np.linspace(1, 0, f)
    st = np.stack([L, R], 1); st = np.tanh(st * 1.1); st *= .85 / np.max(np.abs(st))
    return st

MUSIC = {
 'music_01_main_menu': dict(bpm=92, root=60, scale='major', prog=[0, 5, 3, 4], seed=11, arp='pluck', arp_g=.28, melody='bell', mel_g=.5, rhythms=[[1.5, .5, 1, 1], [1, 1, 2], [.5, .5, 1, 2], [2, 1, 1]], drums='soft', drum_start=4, rv=2.6, rw=1.2, lo=7, hi=15),
 'music_02_crystal_valley': dict(bpm=112, root=67, scale='major', prog=[0, 3, 4, 0], seed=21, arp='pluck', arp_pat=[0, 2, 1, 3, 2, 1, 3, 2], arp_oct=0, arp_g=.26, melody='flute', mel_g=.5, rhythms=[[1, .5, .5, 1, 1], [.5, .5, 1, .5, .5, 1], [1.5, .5, 2], [1, 1, .5, .5, 1]], drums='light', drum_start=2, rv=1.8, lo=8, hi=16),
 'music_03_frozen_mountains': dict(bpm=78, root=62, scale='dorian', prog=[0, 5, 2, 6], seed=31, arp='bell', arp_pat=[0, 1, 2, 3], arp_oct=1, arp_g=.3, melody='bell', mel_g=.42, rhythms=[[2, 1, 1], [1, 1, 2], [1.5, 1.5, 1], [2, 2]], drums=None, bass='half', pad=1.3, rv=3.6, rw=1.6, lo=9, hi=17, mel_start=1),
 'music_04_enchanted_forest': dict(bpm=104, root=64, scale='dorian', prog=[0, 6, 3, 4], seed=41, arp='pluck', arp_pat=[0, 2, 1, 2, 3, 2, 1, 2], arp_g=.25, melody='flute', mel_g=.55, rhythms=[[1, .5, .5, 1, 1], [.5, 1, .5, 1, 1], [1.5, .5, 1, 1], [1, 1, 1, 1]], drums='shaker', drum_start=0, rv=2.4, lo=7, hi=16),
 'music_05_lost_desert': dict(bpm=98, root=62, scale='phryg_dom', prog=[0, 0, 3, 0], seed=51, arp=None, melody='oud', mel_g=.6, rhythms=[[.5, .5, 1, .5, .5, 1], [1, .5, .5, 1, 1], [.75, .25, 1, 1, 1], [.5, .5, .5, .5, 2]], drums='desert', rv=1.6, pad=.8, lo=7, hi=15, bass='half'),
 'music_06_dragon_kingdom': dict(bpm=132, root=64, scale='harm_minor', prog=[0, 5, 6, 4], seed=61, arp='pluck', arp_g=.2, arp_pat=[0, 2, 1, 3, 0, 2, 1, 3], melody='brass', mel_g=.5, rhythms=[[1, .5, .5, 1, 1], [.5, .5, .5, .5, 2], [1.5, .5, 1, 1], [1, 1, 2]], drums='drive', bass='gallop', rv=1.5, lo=7, hi=14),
 'music_07_boss_battle': dict(bpm=148, root=60, scale='harm_minor', prog=[0, 0, 5, 4], seed=71, arp=None, melody='brass', mel_g=.5, rhythms=[[.5, .5, .5, .5, 1, 1], [.5, .5, 1, .5, .5, 1], [1, .5, .5, 2], [.5, .5, .5, .5, .5, .5, 1]], drums='boss', bass='eighth', stabs=True, rv=1.3, pad=.8, lo=7, hi=14, drum_g=1.1),
 'music_08_victory': dict(bpm=124, root=60, scale='major', bars=8, prog=[0, 3, 4, 0], seed=81, arp='pluck', arp_pat=[0, 1, 2, 3, 2, 1, 2, 3], arp_g=.3, melody='brass', mel_g=.55, rhythms=[[.5, .5, 1, 1, 1], [1, 1, 1, 1], [.5, .5, .5, .5, 2], [1, .5, .5, 2]], drums='light', bass='half', loop=False, rv=2.4, lo=9, hi=17, order=[0, 1], lift_from=1),
}

# ------------------------------------------------------------------ SFX
def seq(parts, total):
    mx = Mix(total)
    for fn, t0, g, pan, wet in parts: mx.put(fn, t0, g, pan, wet)
    L, R = mx.out(1.0, 1.0); return np.stack([L, R], 1)
def chirp(f0, f1, d, wave='sine', v=1):
    t = tarr(d); fr = f0 * (f1 / f0) ** (t / d); ph = TWO_PI * np.cumsum(fr) / SR
    y = np.sin(ph) if wave == 'sine' else sum(np.sin(ph * h) / h for h in range(1, 8))
    return y * v
def whoosh(d, f0=400, f1=3000, v=1):
    t = tarr(d); n = noise(d); out = np.zeros_like(n); seg = 12
    for i in range(seg):
        a, b = int(i*len(n)/seg), int((i+1)*len(n)/seg); fc = f0 * (f1/f0) ** (i/seg)
        out[a:b] = bp(n, fc * .6, min(fc * 1.6, 15000))[a:b]
    return out * np.sin(np.pi * t / d) ** 1.5 * v

SFX = {}
SFX['sfx_01_select'] = lambda: seq([(bell(mtof(88), .35), 0, .6, 0, .3), (bell(mtof(95), .3), .06, .4, 0, .3)], .5)
SFX['sfx_02_move'] = lambda: seq([(whoosh(.2, 600, 2500, .5), 0, 1, 0, 0), (pluck(mtof(76), .15), .1, .3, 0, 0)], .35)
SFX['sfx_03_match3'] = lambda: seq([(bell(mtof(m), .6), i * .09, .55, (-.3, 0, .3)[i], .35) for i, m in enumerate((79, 83, 86))], 1.0)
SFX['sfx_04_match4'] = lambda: seq([(bell(mtof(m), .7), i * .08, .55, (-.4, -.1, .1, .4)[i], .4) for i, m in enumerate((79, 83, 86, 91))] + [(hp(noise(.5), 6000) * np.exp(-tarr(.5) * 7) * .4, .2, .5, 0, .2)], 1.2)
SFX['sfx_05_match5'] = lambda: seq([(bell(mtof(m), .8), i * .07, .55, (-.5, -.25, 0, .25, .5)[i], .45) for i, m in enumerate((72, 76, 79, 84, 88))] + [(chirp(800, 5000, .5) * np.exp(-tarr(.5) * 4) * .3, .15, 1, 0, .4)] + [(bell(mtof(96), 1.0), .38, .5, 0, .5)], 1.7)
SFX['sfx_06_crystal_explosion'] = lambda: seq([(lp(noise(.7), 2500) * np.exp(-tarr(.7) * 7) * 1.0, 0, 1, 0, .2), (kick(1.1, 38), 0, .9, 0, 0), (hp(noise(.5), 5000) * np.exp(-tarr(.5) * 9) * .5, .02, 1, 0, .3), (bell(mtof(96), .6), .05, .3, .3, .4)], 1.1)
SFX['sfx_07_lightning'] = lambda: seq([(chirp(3500, 120, .35, 'saw') * np.exp(-tarr(.35) * 6) * .5, 0, 1, 0, .1), (hp(noise(.45), 3000) * np.exp(-tarr(.45) * 10) * .9, 0, 1, 0, .1), (kick(.8, 40), .02, .7, 0, 0), (chirp(1200, 90, .3, 'saw') * np.exp(-tarr(.3) * 9) * .4, .12, 1, .3, .1)], .9)
SFX['sfx_08_rainbow'] = lambda: seq([(chirp(300, 3200, .7) * np.minimum(tarr(.7) / .05, 1) * np.exp(-tarr(.7) * 2) * .5, 0, 1, 0, .4)] + [(bell(mtof(m), .7), .1 + i * .07, .45, np.sin(i), .5) for i, m in enumerate((72, 76, 79, 84, 88, 91, 96))], 1.6)
SFX['sfx_09_booster'] = lambda: seq([(whoosh(.5, 300, 4500, .8), 0, 1, 0, .2), (bell(mtof(84), .8), .35, .6, -.2, .5), (bell(mtof(91), .8), .45, .5, .2, .5), (pluck(mtof(60), .3), 0, .4, 0, 0)], 1.4)
SFX['sfx_10_level_complete'] = lambda: seq(
    [(brass(mtof(m), d + .2), t, .75, 0, .25) for m, t, d in ((60, 0, .2), (64, .2, .2), (67, .4, .2), (72, .6, .6))] +
    [(bell(mtof(m), 1.8), 1.0 + i * .08, .5, (-.4, 0, .4)[i], .5) for i, m in enumerate((84, 88, 91))] +
    [(pad(mtof(m), 2.2), .6, .35, 0, .4) for m in (60, 64, 67, 72)] + [(kick(.8), 0, .6, 0, 0), (kick(.8), .6, .6, 0, 0)], 3.2)
SFX['sfx_11_level_fail'] = lambda: seq(
    [(flute(mtof(m), .5), i * .38, .8, 0, .35) for i, m in enumerate((67, 64, 62, 55))] + [(pad(mtof(m), 1.8), .2, .35, 0, .4) for m in (55, 58, 62)] + [(bass(mtof(43), 1.2), 1.1, .7, 0, 0)], 2.6)
SFX['sfx_12_boss_attack'] = lambda: seq(
    [(chirp(260, 45, .6, 'saw') * np.exp(-tarr(.6) * 3) * .7, 0, 1, 0, .15), (lp(noise(.6), 900) * np.exp(-tarr(.6) * 6), 0, .9, 0, 0), (taiko(1), .3, .9, 0, 0), (stab(mtof(48), .5), .02, .6, 0, .2)], 1.0)
SFX['sfx_13_boss_defeat'] = lambda: seq(
    [(lp(noise(1.2), 2200) * np.exp(-tarr(1.2) * 3) * .9, 0, 1, 0, .3), (kick(1.2, 35), 0, 1, 0, 0), (chirp(500, 40, 1.4, 'saw') * np.exp(-tarr(1.4) * 2) * .35, .05, 1, 0, .2)] +
    [(brass(mtof(m), .5), 1.2 + i * .16, .7, 0, .3) for i, m in enumerate((60, 64, 67, 72))] + [(bell(mtof(m), 1.6), 1.9 + i * .06, .5, 0, .5) for i, m in enumerate((84, 88, 91, 96))], 3.4)
SFX['sfx_14_reward'] = lambda: seq([(bell(mtof(88), .6), 0, .6, 0, .3), (bell(mtof(95), .9), .09, .6, 0, .4), (hp(noise(.3), 7000) * np.exp(-tarr(.3) * 12) * .3, .09, 1, 0, 0)], 1.1)
SFX['sfx_15_button'] = lambda: seq([(pluck(mtof(84), .12), 0, .5, 0, 0), (hat(1, .03), 0, .6, 0, 0)], .2)

def encode(st, path_noext, pk=.9):
    st = st / max(np.max(np.abs(st)), 1e-6) * pk
    with tempfile.TemporaryDirectory() as td:
        w = os.path.join(td, 'a.wav'); wavfile.write(w, SR, (st * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-c:a', 'libvorbis', '-q:a', '4', path_noext + '.ogg'], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '128k', path_noext + '.mp3'], check=True)

if __name__ == '__main__':
    only = sys.argv[2] if len(sys.argv) > 2 else None
    os.makedirs(os.path.join(ROOT, 'music'), exist_ok=True); os.makedirs(os.path.join(ROOT, 'sfx'), exist_ok=True)
    for name, spec in MUSIC.items():
        if only and only not in name: continue
        encode(make_track(spec), os.path.join(ROOT, 'music', name), .6); print('music', name, flush=True)
    for name, fn in SFX.items():
        if only and only not in name: continue
        encode(fn(), os.path.join(ROOT, 'sfx', name), .85); print('sfx', name, flush=True)
