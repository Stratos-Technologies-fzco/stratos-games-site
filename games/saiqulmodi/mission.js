// mission.js - Fighter's goal, coaching and results panel (Stratos issue #38, 16-Nov-2026).
// The game itself is unchanged; this page layer listens to three things the game announces:
//   "fighter-say"  every HUD line (Hud.say)          "fighter-kill"  a launch site destroyed (Analytics.targetDestroyed)
//   window.__fighterThreat  a missile is locked on you   window.__fighterTwo  two-player mode
// Goal: win the war by destroying GOAL enemy launch sites. Coaching lines appear once per device, at the moment
// each control is needed. No sound, no animation (Jet vs Missile CLAUDE.md: sound only on actions, no celebrations).
(function () {
  'use strict';
  var GOAL = 10, BEST_KEY = 'fighter-mission-v1', COACH_KEY = 'fighter-coach-v1';
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  function track(name, details) { try { var S = window.Stratos || (window.parent !== window ? window.parent.Stratos : null); if (S) S.track(name, details); } catch (e) { /* never break the game */ } }
  // Stratos Resume (stratos-games-site CLAUDE.md "Resume", 18-Nov-2026): the war is the mission, each launch site
  // destroyed is a safe point. A player who leaves mid-war gets "Continue?" and takes off again with the sites,
  // jets lost, time and level they had. Restoring never pays Stratos Coins (only a won war pays).
  function SR() { try { var S = window.Stratos || parent.Stratos; return S && S.resume ? S.resume : null; } catch (e) { return null; } }
  function FL() { return window.__fighterLevel || null; } // main.ts: get() / set(n) of the game level
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  var touch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
  var best = load(BEST_KEY, { sites: 0, fastest: 0, wins: 0 });
  var seen = load(COACH_KEY, {});
  var kills = 0, lost = 0, t0 = 0, won = false, flying = false, timers = [];

  var css = document.createElement('style');
  css.textContent =
    '.ms-card{position:absolute;left:50%;top:calc(min(30vh,170px) + 6px);transform:translateX(-50%);width:min(520px,calc(100% - 32px));box-sizing:border-box;' +
    'background:rgba(2,8,20,.78);border:1px solid rgba(120,190,255,.35);border-radius:14px;padding:12px 16px;color:#e6f1ff;' +
    'font:500 15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;pointer-events:none}' +
    '.ms-card b{color:#ffd166}.ms-card small{display:block;margin-top:4px;color:#9fb6cf;font-size:13px}' +
    '.ms-card .ms-title{display:block;font:900 26px/1.1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:6px;color:#fff;margin-bottom:6px}' +
    // a big, clear Play button (Stratos #55): the reticle icon plus the word PLAY under it
    '#start .intro-play{width:160px;height:96px}#start .intro-play::after{content:"PLAY";position:absolute;left:50%;top:100%;transform:translateX(-50%);' +
    'margin-top:2px;font:900 20px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:4px;color:#00e6ff}' +
    '@media (max-width:640px){#start .intro-play{width:112px;height:72px}}' +
    '.ms-coach .ok{display:inline-block;margin-left:10px;padding:2px 10px;border-radius:999px;background:#ffd166;color:#06142a;font-weight:700}' +
    '.touch-btn.ms-hi,.stick-base.ms-hi{box-shadow:0 0 0 4px #ffd166}' +
    '#fps{display:none}' +
    '.ms-chip{position:fixed;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:30;pointer-events:none;' +
    'background:rgba(2,8,20,.7);border:1px solid rgba(255,209,102,.6);border-radius:999px;padding:3px 12px;color:#ffd166;' +
    'font:700 14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:none}' +
    '.ms-coach{position:fixed;left:50%;top:calc(40px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:31;' +
    'width:max-content;max-width:min(560px,calc(100% - 32px));box-sizing:border-box;background:rgba(2,8,20,.86);border:1px solid rgba(120,190,255,.5);' +
    'border-radius:12px;padding:8px 14px;color:#e6f1ff;font:500 15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;display:none}' +
    '.ms-coach.warn{border-color:#ff5d5d;color:#ffd6d6}' +
    '.ms-win{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px}' +
    '.ms-win .p{width:min(400px,100%);box-sizing:border-box;background:#06142a;border:1px solid rgba(255,209,102,.6);border-radius:16px;padding:18px;' +
    'color:#e6f1ff;text-align:center;font:500 15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.ms-win h2{margin:0 0 6px;font-size:24px;color:#ffd166}.ms-win .st{font-size:34px;color:#ffd166;letter-spacing:4px;margin:4px 0}' +
    '.ms-win .row{display:flex;gap:10px;margin-top:14px}.ms-win button{flex:1;min-height:46px;border-radius:999px;border:0;font:700 15px system-ui,sans-serif;cursor:pointer}' +
    '.ms-win .again{background:#ffd166;color:#06142a}.ms-win .keep{background:transparent;color:#e6f1ff;border:1px solid rgba(255,255,255,.35)}';
  document.head.appendChild(css);

  // ---- home screen: what you are trying to do, and your best so far
  var start = document.getElementById('start');
  var card = document.createElement('div');
  card.className = 'ms-card';
  function paintCard() {
    // the page's own name (Stratos: "Fighter"; GitHub Pages keeps "Jet vs Missile"), then the goal in one line
    card.innerHTML = '<span class="ms-title">' + (document.title || '').toUpperCase() + '</span>' +
      '🎯 <b>Defend your homeland:</b> destroy ' + GOAL + ' enemy launch sites and dodge their missiles.' +
      '<small>' + (best.sites ? 'Your best: ' + best.sites + ' / ' + GOAL + ' sites' + (best.fastest ? ' · fastest win ' + mmss(best.fastest) : '') : 'Tap the play button below to take off. The ? button shows every control.') + '</small>';
  }
  paintCard();
  if (start) start.appendChild(card);
  // show it once the opening logo has settled at the top (it starts large in the middle)
  card.style.visibility = 'hidden';
  var logo = document.getElementById('intro-logo');
  var settle = setInterval(function () {
    var r = logo ? logo.getBoundingClientRect() : null;
    if (!r || (r.height < 200 && r.bottom < innerHeight * 0.4)) { card.style.visibility = ''; clearInterval(settle); }
  }, 200);

  // ---- in flight: progress chip, coaching line, results panel
  var chip = document.createElement('div'); chip.className = 'ms-chip'; document.body.appendChild(chip);
  var coachEl = document.createElement('div'); coachEl.className = 'ms-coach'; coachEl.setAttribute('role', 'status'); document.body.appendChild(coachEl);
  coachEl.addEventListener('click', function () { coachEl.style.display = 'none'; });
  var hideAt = 0;
  function say(text, warn, ms) {
    coachEl.textContent = text;
    coachEl.classList.toggle('warn', !!warn);
    coachEl.style.display = 'block';
    hideAt = Date.now() + (ms || 6500);
  }
  setInterval(function () { if (hideAt && Date.now() > hideAt) { coachEl.style.display = 'none'; hideAt = 0; } }, 250);
  function coach(id, text, warn) { if (seen[id]) return false; seen[id] = 1; save(COACH_KEY, seen); say(text, warn); return true; }
  function paintChip() { chip.textContent = '🎯 ' + kills + ' / ' + GOAL; chip.style.display = flying && !won ? 'block' : 'none'; }

  // touch wording when the game's touch buttons are on screen (Stratos #55: phones never see keyboard keys)
  function touchOn() { var l = document.querySelector('.touch-layer'); return l ? l.style.display === 'block' : touch; }
  var TT = {
    fly: 'Drag the stick (bottom left) to fly: pull down to climb, push up to dive, left / right to roll.',
    fire: 'Now fire: tap BOMB to drop a bomb (AGM fires a missile at the ground).',
    flare: 'Last one: tap FLARE. Flares pull enemy missiles away from you.',
    power: 'THR+ and THR- set your speed. Hold AB for the afterburner.',
    missile: 'Missile locked on you! Tap FLARE and turn hard. ECM jams radar missiles.',
    hunt: 'Enemies are coming! Find a launch site on the map, fly lower to spot it, then tap BOMB or AGM.',
  };
  var TK = {
    fly: 'Fly: S pulls up, W dives, A / D roll (or the arrow keys).',
    fire: 'Now fire: press B to drop a bomb (G fires a missile at the ground).',
    flare: 'Last one: press C for flares. Flares pull enemy missiles away from you.',
    power: 'R / F set your speed. Hold Space for the afterburner.',
    missile: 'Missile locked on you! Press C for flares and turn hard. X jams radar missiles.',
    hunt: 'Enemies are coming! Find a launch site on the map, fly lower to spot it, then press B (bomb) or G (missile).',
  };
  function T(id) { return (touchOn() ? TT : TK)[id]; }

  // ---- first flight on this device: no enemies for 20-30 s while one control at a time is taught (Stratos #55).
  // Each hint stays until the player uses that control or taps the hint. Enemies hold fire through
  // window.__fighterHold (read by the game's threat system); never in two-player mode.
  var STEPS = [
    { id: 'fly', keys: /^(Key[WASD]|Arrow)/, touch: '.stick-zone', mark: '.stick-base' },
    { id: 'fire', keys: /^Key[BGZ]$/, touch: '.touch-btn.bomb,.touch-btn.agm,.touch-btn.aam', mark: '.touch-btn.bomb' },
    { id: 'flare', keys: /^KeyC$/, touch: '.touch-btn.flare', mark: '.touch-btn.flare' },
  ];
  var HOLD_MIN = 20000, HOLD_MAX = 30000;
  var step = -1, tutStart = 0, tutDone = false;
  function mark(sel, on) { var el = sel && document.querySelector(sel); if (el) el.classList.toggle('ms-hi', on); }
  function showStep() {
    var s = STEPS[step];
    coachEl.innerHTML = '';
    coachEl.appendChild(document.createTextNode(T(s.id)));
    var ok = document.createElement('span'); ok.className = 'ok'; ok.textContent = 'OK'; coachEl.appendChild(ok);
    coachEl.classList.remove('warn');
    coachEl.style.display = 'block';
    hideAt = 0;
    mark(s.mark, true);
  }
  function nextStep() {
    if (step < 0 || step >= STEPS.length) return;
    mark(STEPS[step].mark, false);
    step += 1;
    if (step < STEPS.length) { setTimeout(function () { if (step < STEPS.length) showStep(); }, 600); return; }
    seen.tutorial = 1; save(COACH_KEY, seen);
    coachEl.style.display = 'none';
    var wait = Math.max(0, HOLD_MIN - (Date.now() - tutStart));
    timers.push(setTimeout(endHold, wait));
  }
  function endHold() {
    if (tutDone) return;
    tutDone = true; window.__fighterHold = false;
    seen.tutorial = 1; save(COACH_KEY, seen);
    if (step >= 0 && step < STEPS.length) mark(STEPS[step].mark, false);
    step = STEPS.length;
    say(T('hunt'), false, 8000); seen.hunt = 1; save(COACH_KEY, seen);
    timers.push(setTimeout(function () { coach('power', T('power')); }, 15000));
  }
  function used(ev, isKey) {
    if (step < 0 || step >= STEPS.length) return;
    var s = STEPS[step];
    if (isKey ? s.keys.test(ev.code || '') : (ev.target && ev.target.closest && ev.target.closest(s.touch))) nextStep();
  }
  window.addEventListener('keydown', function (e) { used(e, true); }, true);
  window.addEventListener('pointerdown', function (e) { used(e, false); }, true);
  coachEl.addEventListener('click', function () { if (step >= 0 && step < STEPS.length) nextStep(); });
  setInterval(function () { if (window.__fighterHold && window.__fighterTwo) endHold(); }, 500);

  // the safe point: sites destroyed so far, jets lost, war time and level (plain data, a few bytes). Not in two-player mode.
  function resumeSave() {
    var R = SR(); if (!R || won || !flying || window.__fighterTwo) return;
    var L = FL(), lv = L ? L.get() : 1;
    try { R.save({ mission: 'war', checkpoint: kills, lost: lost, secs: Math.round((Date.now() - t0) / 1000), level: lv }, { ver: 1, label: 'War: ' + kills + ' / ' + GOAL + ' sites' }); } catch (e) { /* never break the game */ }
  }
  var restored = null;
  function resumeRestore(saved) {
    if (!saved || saved.mission !== 'war' || flying) return;
    restored = saved;
    var L = FL(); if (L && saved.level) L.set(saved.level);
    if (start) start.click(); // take off, as a tap on the play button does
  }
  function offerResume(tries) {
    var R = SR(); tries = tries || 0;
    if (!R) { if (tries < 40) setTimeout(function () { offerResume(tries + 1); }, 100); return; }
    try { if (!R.has({ ver: 1 }) || flying) return; R.offer(resumeRestore, function () { /* Start new: stay on the home screen */ }, { ver: 1 }); } catch (e) { /* play as normal */ }
  }
  offerResume();

  function takeOff() {
    if (flying) return;
    flying = true; t0 = Date.now();
    if (restored) {
      kills = Math.max(0, Math.min(GOAL - 1, restored.checkpoint | 0)); lost = Math.max(0, restored.lost | 0);
      t0 = Date.now() - Math.max(0, restored.secs | 0) * 1000; restored = null;
      if (kills) say('War continues: ' + kills + ' / ' + GOAL + ' launch sites destroyed. ' + (GOAL - kills) + ' more to win.', false, 5000);
    }
    paintChip(); resumeSave();
    if (!seen.tutorial && !window.__fighterTwo) {
      window.__fighterHold = true; tutStart = Date.now(); step = 0; showStep();
      seen.fly = 1; save(COACH_KEY, seen);
      timers.push(setTimeout(endHold, HOLD_MAX));
    } else if (!seen.hunt) timers.push(setTimeout(function () { if (!kills) coach('hunt', T('hunt')); }, 20000));
  }
  if (start) {
    new MutationObserver(function () { if (getComputedStyle(start).display === 'none') takeOff(); }).observe(start, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  window.addEventListener('fighter-say', function (e) { if (/YOU HAVE CONTROL/.test(e.detail || '')) takeOff(); });

  // a missile locked on you: the first time, teach the counter
  setInterval(function () { if (flying && window.__fighterThreat) coach('missile', T('missile'), true); }, 300);

  // a jet lost: the next one takes over
  var down = document.getElementById('down'), wasDown = false;
  if (down) {
    new MutationObserver(function () {
      var shown = getComputedStyle(down).display !== 'none';
      if (shown && !wasDown) { lost += 1; resumeSave(); coach('lost', 'Jet lost. The next jet of your squadron takes over: the war goes on.'); }
      wasDown = shown;
    }).observe(down, { attributes: true, attributeFilter: ['style'] });
  }

  // a launch site destroyed: progress, and the war is won at GOAL
  var win = document.createElement('div'); win.className = 'ms-win'; document.body.appendChild(win);
  window.addEventListener('fighter-kill', function () {
    if (won) return;
    kills += 1; paintChip();
    if (kills > best.sites) { best.sites = Math.min(GOAL, kills); save(BEST_KEY, best); }
    if (kills < GOAL) { resumeSave(); say('Launch site destroyed! ' + (GOAL - kills) + ' more to win the war.', false, 4000); return; }
    won = true; paintChip();
    try { var R = SR(); if (R) R.clear(); } catch (e) { /* nothing to forget */ }
    var secs = (Date.now() - t0) / 1000, stars = lost <= 1 ? 3 : lost <= 4 ? 2 : 1, two = !!window.__fighterTwo;
    best.wins = (best.wins || 0) + 1;
    var record = !best.fastest || secs < best.fastest;
    if (record) best.fastest = Math.round(secs);
    save(BEST_KEY, best); paintCard();
    // a won war is a win for Stratos (pays a win in Stratos Coins); not in two-player mode (no coins when friends play)
    var d = { mission: 'war', seconds: Math.round(secs), lost: lost, score: kills };
    if (!two) d.won = true;
    track('game_over', d);
    win.innerHTML = '<div class="p" role="dialog" aria-modal="true" aria-labelledby="msWinT"><h2 id="msWinT">War won</h2>' +
      '<div class="st">' + '★★★'.slice(0, stars) + '<span style="opacity:.3">' + '★★★'.slice(0, 3 - stars) + '</span></div>' +
      '<div>' + GOAL + ' enemy launch sites destroyed in ' + mmss(secs) + ', ' + lost + (lost === 1 ? ' jet' : ' jets') + ' lost.</div>' +
      '<div style="color:#9fb6cf;font-size:13px;margin-top:4px">' + (record ? 'Your fastest win.' : 'Fastest win: ' + mmss(best.fastest)) + ' Lose fewer jets for more stars.</div>' +
      '<div class="row"><button class="keep" type="button">Keep flying</button><button class="again" type="button">New war</button></div></div>';
    win.style.display = 'flex';
    win.querySelector('.keep').onclick = function () { win.style.display = 'none'; };
    win.querySelector('.again').onclick = function () { location.reload(); };
    win.querySelector('.again').focus();
  });
})();
