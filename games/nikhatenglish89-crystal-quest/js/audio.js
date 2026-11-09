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
  function unlock() { if (unlocked) return; unlocked = true; if (wanted) music(wanted); }
  function set(kind, v) { on[kind] = !!v; if (kind === 'music') { if (!v) stopMusic(); else if (wanted) music(wanted); } }
  function init(opts) { if (opts) { on.music = opts.music !== false; on.sfx = opts.sfx !== false; if (opts.musicVol !== undefined) level.music = opts.musicVol; if (opts.sfxVol !== undefined) level.sfx = opts.sfxVol; } }
  // pause music when the tab is hidden
  try { document.addEventListener('visibilitychange', function () { if (document.hidden) { if (cur) cur.pause(); } else if (cur && on.music) { var p = cur.play(); if (p && p.catch) p.catch(function () {}); } }); } catch (e) {}

  function debug() { return { unlocked: unlocked, music: on.music, sfx: on.sfx, track: curName, playing: !!(cur && !cur.paused), volume: cur ? cur.volume : null, musicLevel: level.music, sfxLevel: level.sfx }; }
  root.CQAudio = { debug: debug, init: init, unlock: unlock, sfx: sfx, music: music, stopMusic: stopMusic, set: set, setVolume: setVolume, state: on, level: level };
})(window);
