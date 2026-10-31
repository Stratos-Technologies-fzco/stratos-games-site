/* Audio manager: music loops with crossfades, one-shot stingers, and synthesised SFX.
   Separate Music and SFX channels, mute switch, pause ducking (SCR-13, soundtrack notes). */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var A = DF.Audio = {};
  var tracks = {}, current = null, unlocked = false, want = null, duck = 1, stingerDuck = 1, ticker = 0, hidden = false;
  var ctx = null, sfxGain = null, noiseBuf = null;
  var probe = document.createElement('audio');
  var ext = (probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"')) ? '.ogg' : '.mp3';

  function settings() { return (DF.save && DF.save.settings) || { musicEnabled: true, sfxEnabled: true, musicVolume: 70, sfxVolume: 85, muteAll: false }; }
  function musicVol() { var s = settings(); return (s.muteAll || !s.musicEnabled) ? 0 : (s.musicVolume / 100); }
  function sfxVol() { var s = settings(); return (s.muteAll || !s.sfxEnabled) ? 0 : (s.sfxVolume / 100); }

  function get(id) {
    if (tracks[id]) return tracks[id];
    var el = new Audio();
    el.preload = 'auto'; el.loop = true; el.src = 'assets/audio/' + id + ext;
    var t = tracks[id] = { id: id, el: el, gain: 0, target: 0, rate: 0.05, loopFrom: 0, stinger: false };
    return t;
  }
  A.preload = function (id) { get(id); };

  function tick() {
    var any = false;
    Object.keys(tracks).forEach(function (id) {
      var t = tracks[id], el = t.el;
      if (t.gain < t.target) t.gain = Math.min(t.target, t.gain + t.rate); else if (t.gain > t.target) t.gain = Math.max(t.target, t.gain - t.rate);
      var d = t.stinger ? 1 : duck * stingerDuck;
      try { el.volume = Math.max(0, Math.min(1, t.gain * musicVol() * d)); } catch (e) {}
      if (t.loopFrom && el.duration && el.currentTime > el.duration - 0.12) el.currentTime = t.loopFrom;
      if (t.gain <= 0 && t.target <= 0 && !el.paused) el.pause();
      if (!el.paused || t.gain !== t.target) any = true;
    });
    if (!any) { clearInterval(ticker); ticker = 0; }
  }
  function ensureTicker() { if (!ticker) ticker = setInterval(tick, 50); }

  /* Play a looping track, crossfading from the current one. */
  A.play = function (id, fadeMs) {
    want = id;
    if (!unlocked || hidden) return;
    if (current === id) { var c = tracks[id]; if (c && c.el.paused) startEl(c); if (c) c.target = 1; ensureTicker(); return; }
    var rate = 50 / (fadeMs || 900);
    if (current && tracks[current]) { tracks[current].target = 0; tracks[current].rate = rate; }
    current = id;
    var t = get(id); t.el.loop = true; t.loopFrom = 0; t.target = 1; t.rate = rate;
    startEl(t); ensureTicker();
  };
  function startEl(t) {
    var p; try { p = t.el.play(); } catch (e) {}
    if (p && p.catch) p.catch(function () { /* autoplay blocked until a gesture */ });
  }
  A.stop = function (fadeMs) {
    want = null;
    if (current && tracks[current]) { tracks[current].target = 0; tracks[current].rate = 50 / (fadeMs || 600); ensureTicker(); }
    current = null;
  };
  /* Boss phase 2: loop the heavy section (soundtrack notes: from 0:32). */
  A.phase2 = function (id, from) {
    var t = get(id); t.loopFrom = from;
    if (t.el.duration && t.el.currentTime < from) { try { t.el.currentTime = from; } catch (e) {} }
  };
  A.setDuck = function (v) { duck = v; ensureTicker(); };

  /* One-shot stinger: music dips while it plays. Returns the stinger length callback hook. */
  A.stinger = function (id, opts) {
    opts = opts || {};
    if (!unlocked || musicVol() === 0 && sfxVol() === 0) { if (opts.onEnd) setTimeout(opts.onEnd, 50); return; }
    var t = get(id); t.stinger = true; t.el.loop = false; t.loopFrom = 0;
    try { t.el.currentTime = 0; } catch (e) {}
    t.gain = 1; t.target = 1;
    if (opts.stopMusic) A.stop(300); else stingerDuck = 0.25;
    startEl(t); ensureTicker();
    var done = function () {
      t.el.removeEventListener('ended', done); stingerDuck = 1; t.target = 0; t.gain = 0;
      if (opts.onEnd) opts.onEnd();
    };
    t.el.addEventListener('ended', done);
  };

  A.refresh = function () {
    if (ctx && sfxGain) sfxGain.gain.value = sfxVol();
    ensureTicker();
    if (musicVol() > 0 && want && current !== want) A.play(want);
  };

  /* First user gesture: allowed to start sound. */
  A.unlock = function () {
    if (unlocked) return;
    unlocked = true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { ctx = new AC(); sfxGain = ctx.createGain(); sfxGain.gain.value = sfxVol(); sfxGain.connect(ctx.destination); }
    } catch (e) { ctx = null; }
    if (want) { var w = want; current = null; A.play(w); }
  };

  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    if (hidden) { Object.keys(tracks).forEach(function (id) { try { tracks[id].el.pause(); } catch (e) {} }); if (ctx && ctx.suspend) ctx.suspend(); }
    else { if (ctx && ctx.resume) ctx.resume(); if (want && unlocked) { var w = want; current = null; A.play(w, 400); } }
  });

  /* ---------- synthesised SFX (original, generated in code) ---------- */
  function noise() {
    if (noiseBuf) return noiseBuf;
    var len = ctx.sampleRate * 0.6, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (noiseBuf = b);
  }
  var pv = 1; // per-call pitch variation (0.93-1.07) so repeated hits do not sound identical
  function tone(type, f0, f1, dur, g, delay) {
    var t0 = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), gn = ctx.createGain(); f0 *= pv; if (f1) f1 *= pv;
    o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + 0.012); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); gn.connect(sfxGain); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function burst(dur, g, ftype, f0, f1, delay) {
    var t0 = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), gn = ctx.createGain();
    f0 *= pv; f1 *= pv; s.buffer = noise(); f.type = ftype; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur); f.Q.value = 1.2;
    gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(gn); gn.connect(sfxGain); s.start(t0); s.stop(t0 + dur + 0.02);
  }
  var SFX = {
    click: function () { tone('square', 520, 480, 0.05, 0.12); },
    deny: function () { tone('square', 170, 130, 0.1, 0.14); },
    swing: function () { burst(0.11, 0.35, 'bandpass', 900, 300); },
    hit: function () { burst(0.12, 0.5, 'lowpass', 1800, 200); tone('sine', 160, 70, 0.12, 0.4); },
    crit: function () { burst(0.14, 0.55, 'lowpass', 2600, 300); tone('triangle', 520, 1040, 0.14, 0.3); },
    hurt: function () { tone('sawtooth', 240, 90, 0.18, 0.3); burst(0.1, 0.3, 'lowpass', 900, 150); },
    pickup: function () { tone('sine', 660, 990, 0.1, 0.3); tone('sine', 990, 1320, 0.1, 0.2, 0.07); },
    coin: function () { tone('square', 988, 988, 0.05, 0.12); tone('square', 1319, 1319, 0.12, 0.12, 0.05); },
    dash: function () { burst(0.16, 0.3, 'highpass', 400, 2400); },
    ability: function () { tone('sine', 200, 700, 0.3, 0.35); tone('sawtooth', 120, 320, 0.3, 0.15); },
    surge: function () { tone('sine', 150, 900, 0.4, 0.4); burst(0.4, 0.3, 'bandpass', 300, 3000); },
    roar: function () { tone('sawtooth', 110, 55, 0.5, 0.35); burst(0.45, 0.25, 'lowpass', 700, 120); },
    windup: function () { tone('triangle', 900, 1100, 0.07, 0.16); },
    spit: function () { tone('sine', 400, 180, 0.12, 0.25); },
    slam: function () { tone('sine', 90, 35, 0.45, 0.6); burst(0.4, 0.5, 'lowpass', 900, 90); },
    levelup: function () { tone('triangle', 523, 523, 0.14, 0.3); tone('triangle', 659, 659, 0.14, 0.3, 0.12); tone('triangle', 784, 784, 0.3, 0.3, 0.24); },
    crystal: function () { tone('sine', 880, 1760, 0.6, 0.25); tone('sine', 660, 1320, 0.6, 0.2, 0.1); },
    claim: function () { tone('triangle', 660, 660, 0.1, 0.25); tone('triangle', 880, 880, 0.18, 0.25, 0.09); },
    /* fight sounds: every form swings differently, every enemy sounds different when it winds up, lunges, is hit and dies */
    swing_swiftclaw: function () { burst(0.07, 0.3, 'highpass', 2500, 6000); burst(0.06, 0.28, 'bandpass', 3500, 1800, 0.06); tone('sawtooth', 1400, 700, 0.05, 0.07); },
    swing_ironhide: function () { burst(0.2, 0.45, 'lowpass', 700, 120); tone('sine', 110, 55, 0.2, 0.35); },
    swing_wildspark: function () { tone('square', 900, 2200, 0.05, 0.12); tone('square', 1800, 600, 0.07, 0.1, 0.04); burst(0.12, 0.25, 'highpass', 3000, 7000); },
    hit_raider: function () { tone('sine', 150, 60, 0.14, 0.45); burst(0.1, 0.4, 'lowpass', 1400, 200); tone('sawtooth', 320, 160, 0.12, 0.18, 0.02); },
    hit_skimmer: function () { tone('triangle', 1500, 700, 0.09, 0.3); burst(0.06, 0.3, 'bandpass', 3200, 1400); },
    hit_spitter: function () { tone('sine', 260, 90, 0.16, 0.35); burst(0.14, 0.35, 'bandpass', 600, 200); tone('sine', 180, 60, 0.12, 0.2, 0.06); },
    hit_boss_open: function () { tone('sine', 90, 40, 0.3, 0.55); burst(0.18, 0.55, 'lowpass', 1600, 120); tone('sawtooth', 200, 70, 0.2, 0.2); },
    clank: function () { tone('square', 1180, 980, 0.12, 0.14); tone('square', 1760, 1500, 0.1, 0.1, 0.01); burst(0.05, 0.35, 'highpass', 3000, 5000); tone('sine', 140, 90, 0.12, 0.25); },
    windup_raider: function () { tone('sawtooth', 120, 170, 0.25, 0.18); burst(0.2, 0.12, 'lowpass', 600, 300); },
    windup_skimmer: function () { tone('triangle', 1100, 1900, 0.2, 0.16); },
    windup_spitter: function () { tone('sine', 200, 320, 0.28, 0.18); burst(0.25, 0.12, 'bandpass', 400, 900); },
    windup_boss: function () { tone('sawtooth', 80, 140, 0.4, 0.25); burst(0.35, 0.2, 'lowpass', 500, 200); },
    lunge_raider: function () { burst(0.12, 0.3, 'bandpass', 1200, 500); tone('sawtooth', 210, 120, 0.1, 0.18); },
    lunge_skimmer: function () { burst(0.1, 0.3, 'highpass', 1800, 4200); tone('triangle', 1500, 900, 0.08, 0.12); },
    lunge_spitter: function () { tone('sine', 420, 180, 0.12, 0.2); },
    die_raider: function () { tone('sawtooth', 260, 60, 0.45, 0.3); burst(0.3, 0.3, 'lowpass', 900, 100, 0.05); },
    die_skimmer: function () { tone('triangle', 1400, 240, 0.35, 0.28); },
    die_spitter: function () { tone('sine', 300, 50, 0.5, 0.35); burst(0.35, 0.35, 'bandpass', 500, 120); },
    die_boss: function () { tone('sawtooth', 130, 35, 1.2, 0.45); burst(0.9, 0.4, 'lowpass', 900, 60); tone('sine', 70, 30, 1.0, 0.5, 0.1); },
    splat: function () { burst(0.16, 0.45, 'lowpass', 1200, 150); tone('sine', 200, 70, 0.18, 0.4); tone('triangle', 500, 250, 0.1, 0.15, 0.03); },
    chomp: function () { tone('square', 320, 200, 0.05, 0.18); tone('square', 260, 160, 0.06, 0.18, 0.07); },
    dodge: function () { tone('sine', 700, 1400, 0.1, 0.18); burst(0.12, 0.18, 'highpass', 1500, 4000); }
  };
  var FIXED = { chomp: 1, click: 1, deny: 1, levelup: 1, claim: 1, crystal: 1, pickup: 1, coin: 1 }; // menu and reward sounds keep a steady pitch
  A.sfx = function (name) {
    if (!unlocked || !ctx || sfxVol() === 0 || hidden) return;
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    pv = FIXED[name] ? 1 : 0.93 + Math.random() * 0.14;
    try { if (SFX[name]) SFX[name](); else if (SFX[name.split('_')[0]]) SFX[name.split('_')[0]](); } catch (e) {} // a missing variant falls back to the generic sound
  };
})(window.DF);
