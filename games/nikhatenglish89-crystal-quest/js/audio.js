/* Crystal Quest sound: nothing plays until the player's first tap. Music and effects have their own switch. Soft volumes on purpose. */
(function (root) {
  'use strict';
  var SFX = {
    select: 'sfx_01_select', move: 'sfx_02_move', match3: 'sfx_03_match3', match4: 'sfx_04_match4', match5: 'sfx_05_match5',
    explosion: 'sfx_06_crystal_explosion', lightning: 'sfx_07_lightning', rainbow: 'sfx_08_rainbow', booster: 'sfx_09_booster',
    win: 'sfx_10_level_complete', fail: 'sfx_11_level_fail', bossAttack: 'sfx_12_boss_attack', bossDefeat: 'sfx_13_boss_defeat',
    reward: 'sfx_14_reward', button: 'sfx_15_button'
  };
  var VOL = { sfx: 0.35, music: 0.22 };
  var MUSIC_VOL = { music_07_boss_battle: 0.14, music_08_victory: 0.2 };
  var on = { music: true, sfx: true }, level = { music: 0.5, sfx: 0.5 }, unlocked = false, cache = {}, cur = null, curName = null, wanted = null;
  var canMp3 = (function () { try { return !!new Audio().canPlayType('audio/mpeg'); } catch (e) { return false; } })();

  function url(kind, name) { return 'audio/' + kind + '/' + name + (canMp3 ? '.mp3' : '.ogg'); }

  function sfx(name) {
    if (!unlocked || !on.sfx || !SFX[name]) return;
    try {
      var base = cache[name] || (cache[name] = new Audio(url('sfx', SFX[name])));
      var a = base.cloneNode(); a.volume = Math.min(1, VOL.sfx * level.sfx * 2); var p = a.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  function music(name) {
    wanted = name;
    if (!unlocked) return;
    if (!on.music) { stopMusic(); return; }
    if (curName === name && cur) { if (cur.paused) { var q = cur.play(); if (q && q.catch) q.catch(function () {}); } return; }
    stopMusic();
    try {
      cur = new Audio(url('music', name)); curName = name; cur.loop = true; cur.volume = musicVol(name);
      var p = cur.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  /* the slider runs 0 to 1; the middle (0.5) is the soft default volume */
  function musicVol(name) { return Math.min(1, (MUSIC_VOL[name] || VOL.music) * level.music * 2); }
  function setVolume(kind, v) { level[kind] = Math.max(0, Math.min(1, +v || 0)); if (kind === 'music' && cur) { try { cur.volume = musicVol(curName); } catch (e) {} } }
  function stopMusic() { try { if (cur) { cur.pause(); } } catch (e) {} cur = null; curName = null; }
  /* Soft chimes made with the browser's own sound generator (no sound files): gentle pentatonic notes, quiet, about half a second.
     Used for praise words ("Good!" ... "Incredible!") and the stars of a finished level. They follow the effects switch and volume. */
  var ctx = null, chimeCount = 0, lastChime = '';
  var SCALE = [523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51];            // C5 E5 G5 A5 C6 E6
  function audioCtx() {
    if (ctx) return ctx;
    try { var C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); } catch (e) { ctx = null; }
    return ctx;
  }
  function note(freq, at, dur, gain) {
    var c = ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain(), t = c.currentTime + at;
    o.type = 'sine'; o2.type = 'sine'; o.frequency.value = freq; o2.frequency.value = freq * 2; g2.gain.value = 0.2;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function play(idx, step, dur, base) {
    if (!unlocked || !on.sfx) return;
    var c = audioCtx(); if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      var gain = Math.min(0.28, base * level.sfx * 2);                      // never loud, even with the slider at the top
      idx.forEach(function (i, k) { note(SCALE[i], k * step, dur, gain); });
      chimeCount++; lastChime = idx.join(',');
    } catch (e) {}
  }
  var CHIME_NOTES = [null, [0, 2], [0, 1, 2], [0, 1, 2, 3], [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 4, 5]], CHIME_GAIN = [0, 0.07, 0.075, 0.08, 0.085, 0.09, 0.095];
  function chime(tier) { tier = Math.max(1, Math.min(6, tier | 0)); play(CHIME_NOTES[tier], tier >= 6 ? 0.05 : 0.06, 0.26, CHIME_GAIN[tier]); }
  /* the stars of a finished level: one rising note each, a little sparkle after the third */
  function starChime(i, total) {
    play([[0], [2], [4]][Math.max(0, Math.min(2, i))], 0, 0.5, 0.09);
    if (i === 2 && total === 3) setTimeout(function () { play([5, 4], 0.09, 0.4, 0.07); }, 140);
  }
  function unlock() { if (unlocked) return; unlocked = true; audioCtx(); try { if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) {} if (wanted) music(wanted); }
  function set(kind, v) { on[kind] = !!v; if (kind === 'music') { if (!v) stopMusic(); else if (wanted) music(wanted); } }
  function init(opts) { if (opts) { on.music = opts.music !== false; on.sfx = opts.sfx !== false; if (opts.musicVol !== undefined) level.music = opts.musicVol; if (opts.sfxVol !== undefined) level.sfx = opts.sfxVol; } }
  // pause music when the tab is hidden
  try { document.addEventListener('visibilitychange', function () { if (document.hidden) { if (cur) cur.pause(); } else if (cur && on.music) { var p = cur.play(); if (p && p.catch) p.catch(function () {}); } }); } catch (e) {}

  function debug() { return { chimes: chimeCount, lastChime: lastChime, unlocked: unlocked, music: on.music, sfx: on.sfx, track: curName, playing: !!(cur && !cur.paused), volume: cur ? cur.volume : null, musicLevel: level.music, sfxLevel: level.sfx }; }
  root.CQAudio = { chime: chime, starChime: starChime, debug: debug, init: init, unlock: unlock, sfx: sfx, music: music, stopMusic: stopMusic, set: set, setVolume: setVolume, state: on, level: level };
})(window);
