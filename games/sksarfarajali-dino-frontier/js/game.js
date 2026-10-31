/* Gameplay engine: Canvas 2D side-view "depth lane" world (see App Flow SCR-04/05).
   Reads rules from DF.balance. Talks to the UI only through callbacks and a snapshot object. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var VW = 844, VH = 390, YMIN = 182, YMAX = 358;
  var cv, cx, ratio = 1, raf = 0, last = 0, S = null, paused = true, running = false;
  var keys = {}, mv = { x: 0, y: 0 }, held = { attack: false }, queue = [];
  var G = DF.Game = { S: null, onEnd: null, onToast: null, onTutorial: null, onCombat: null, onPauseRequest: null, onEvent: null };
  var A = null;
  var B = DF.balance;

  /* ---------- assets helpers ---------- */
  function sprite(name, w) { return A.sprite(name, w); }
  function draw(name, w, x, y, o) {
    o = o || {};
    var c = sprite(name, w), h = c.height / c.width * w, feet = o.feet == null ? 0.9 : o.feet;
    cx.save();
    cx.translate(x, y);
    if (o.flip) cx.scale(-1, 1);
    if (o.rot) cx.rotate(o.rot); // + leans forward, whichever way the dinosaur faces
    if (o.skew) cx.transform(1, 0, o.skew, 1, 0, 0); // tail and neck sway, feet stay planted
    if (o.sx || o.sy) cx.scale(o.sx || 1, o.sy || 1);
    if (o.alpha != null) cx.globalAlpha = o.alpha;
    cx.drawImage(c, -w / 2, -h * feet, w, h);
    if (o.tint) { cx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * o.tintA; cx.drawImage(A.silhouette(name, w, o.tint), -w / 2, -h * feet, w, h); }
    cx.restore();
  }
  function shadow(x, y, w, a) {
    cx.save(); cx.globalAlpha = a == null ? 0.35 : a; cx.translate(x, y); cx.scale(1, 0.26); var g = cx.createRadialGradient(0, 0, 0, 0, 0, w * 0.46); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, w * 0.46, 0, 7); cx.fill(); cx.restore();
  }
  function sgn(v) { return v < 0 ? -1 : 1; }
  function dist(a, b) { var dx = a.x - b.x, dy = (a.y - b.y) * 1.7; return Math.sqrt(dx * dx + dy * dy); }
  function toast(msg, kind) { if (G.onToast) G.onToast(msg, kind); }
  function vibrate(ms) { try { if (DF.save.settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  function reduced() { return DF.save.settings.reducedEffects; }

  /* ---------- run setup ---------- */
  G.init = function (canvas, assets) {
    cv = canvas; cx = cv.getContext('2d'); A = assets;
    window.addEventListener('keydown', onKey, false); window.addEventListener('keyup', onKey, false);
    cv.addEventListener('pointerdown', function (e) { if (running && !paused && e.pointerType === 'mouse' && e.button === 0) press('attack'); });
    G.resize(1);
  };
  G.resize = function (scale) {
    if (!cv) return;
    ratio = Math.min(2, Math.max(1, (window.devicePixelRatio || 1) * scale));
    cv.width = Math.round(VW * ratio); cv.height = Math.round(VH * ratio);
  };

  G.start = function (opts) {
    var save = DF.save, demo = !!opts.demo, obj = opts.tutorial ? { id: 'egg', bg: 'canyon_styracosaur', worldW: B.tutorial.worldW, berriesNeeded: 3, bonus: B.objectives.egg.bonus, eggId: 'shadowscale' } : B.objectives[opts.demo ? (opts.demoObj || 'demo') : opts.objective];
    var stats = DF.playerStats(demo ? demoSave() : save), rng = DF.createRng(opts.runId);
    S = G.S = {
      runId: opts.runId, tutorial: !!opts.tutorial, objId: opts.tutorial ? 'egg' : obj.id, obj: obj, rng: rng, stats: stats, t: 0, worldW: obj.worldW, camX: 0,
      gained: { food: 0, dna: 0, tokens: 0, xp: 0 }, berries: 0, kills: {}, dodges: 0, abilitiesUsed: 0, seen: {}, newEggs: [], newSpecies: [],
      enemies: [], bushes: [], pickups: [], rocks: [], projectiles: [], parts: [], texts: [], nests: [], crystal: null, boss: null,
      formScale: 1, biome: obj.biome || 'verdant', hz: { pools: [], vents: [], ice: [], fires: [], bogs: [], glow: [], fields: [] }, bossDef: null, heatAcc: 0, ambT: 0, snowT: 0, poison: 0, poisonAcc: 0, reveal: 0, onIce: false, cold: false, freezeAcc: 0, shake: 0, flash: 0, hurtFlash: 0, ending: 0, ended: false, combat: false, combatT: 0, shown: {},
      demo: demo, demoAcc: 0, demoTick: 0, tut: opts.tutorial ? { step: 0, steps: 4, raiderSpawned: false, raider: null } : null, eggReady: false, crystalHint: 0, timeToFirst: 0, firstEncounter: false, speedMul: 1
    };
    S.P = { x: 250, y: 270, face: 1, hp: stats.maxHealth, maxHp: stats.maxHealth, en: stats.maxEnergy, maxEn: stats.maxEnergy, atkT: 0, atkCd: 0, dashCd: 0, abCd: 0, dashT: 0, dashDx: 1, dashDy: 0, dashSpd: 0, inv: 0, shield: 0, hurt: 0, anim: 0, stun: 0, hitIds: {}, surgeT: 0, ivx: 0, ivy: 0 };
    S.wx = { state: 'calm', t: demo ? 6000 : rng.range(B.weather.calm[0] * 0.6, B.weather.calm[1]), chill: 0 }; // the demo shows a blizzard early
    S.formScale = (FORM_W[stats.path] || 128) / 128; // enemies are drawn in proportion to the player's form (art only; hit boxes do not change)
    buildWorld();
    if (S.biome === 'ember' && !demo) toast(DF.S.hud.emberHint, 'info');
    if (S.biome === 'frost' && !demo) toast(DF.S.hud.frostHint, 'info');
    if (S.biome === 'mire' && !demo) toast(DF.S.hud.mireHint, 'info');
    if (S.biome === 'crater' && !demo) toast(DF.S.hud.craterHint, 'info');
    held.attack = false; queue.length = 0; keys = {}; mv.x = 0; mv.y = 0;
    paused = false; running = true; last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    if (G.onTutorial) G.onTutorial(S.tut ? S.tut.step : -1);
    if (!demo) DF.track(opts.tutorial ? 'tutorial_start' : 'expedition_start', { objective: S.objId });
  };

  /* The demo plays a fixed, mid-game character so it never touches or reads the player's save for stats. */
  function demoSave() {
    var d = DF.defaultSave(); d.player.experience = 450; d.player.level = 4; d.profile.selectedEvolution = 'swiftclaw'; d.upgrades = { hide: 1 }; return d;
  }
  function addRock(x, y, rx, ry) { S.rocks.push({ x: x, y: y, rx: rx, ry: ry, seed: S.rng.next() }); }
  function addBush(x, y, berries) { S.bushes.push({ x: x, y: y, berries: berries || 1, max: berries || 1, bob: S.rng.next() * 6 }); }
  function addEnemy(type, x, y, mods) {
    var d = B.enemies[type], e = { kind: 'enemy', type: type, def: d, x: x, y: y, hp: d.hp, maxHp: d.hp, face: -1, state: 'idle', t: 0, cd: 400, hitFlash: 0, stun: 0, kx: 0, vx: 0, vy: 0, dirx: 1, diry: 0, didHit: false, near: false, wob: S.rng.next() * 6, dead: 0, id: S.enemies.length + 1 };
    var em = S.obj && S.obj.enemyMul; if (em) { e.hp = e.maxHp = Math.round(d.hp * em.hp); e.dmgMul = em.dmg; }
    if (mods) { Object.keys(mods).forEach(function (k) { e[k] = mods[k]; }); }
    S.enemies.push(e); return e;
  }
  function addPool(x, y, rx, ry) { S.hz.pools.push({ x: x, y: y, rx: rx, ry: ry, ph: S.rng.next() * 6 }); }
  function addIce(x, y, rx, ry) { S.hz.ice.push({ x: x, y: y, rx: rx, ry: ry }); }
  function addBog(x, y, rx, ry) { S.hz.bogs.push({ x: x, y: y, rx: rx, ry: ry, ph: S.rng.next() * 6 }); }
  function addField(x, y, rx, ry) { S.hz.fields.push({ x: x, y: y, rx: rx, ry: ry, state: 'idle', t: S.rng.range(B.crater.idle[0] * 0.4, B.crater.idle[1]), hit: false }); }
  function addGlow(x, y) { S.hz.glow.push({ x: x, y: y, used: false }); }
  function addFire(x, y) { S.hz.fires.push({ x: x, y: y }); }
  function addVent(x, y) { var H = B.hazards; S.hz.vents.push({ x: x, y: y, state: 'idle', t: S.rng.range(H.ventIdle[0] * 0.5, H.ventIdle[1]), hit: false }); }
  function buildWorld() {
    var o = S.obj, W = S.worldW, rng = S.rng, i, x;
    if (S.tut) {
      S.ferns = { x: 430, y: 290 };
      addBush(600, 265, 1); addBush(660, 300, 1); addBush(720, 270, 1);
      addRock(300, 330, 46, 20); addRock(880, 220, 54, 22); addRock(1250, 322, 50, 20); addRock(1520, 235, 44, 18);
      S.pickups.push(mkPick('dna', 1000, 300), mkPick('coin', 1200, 250), mkPick('dna', 1400, 300), mkPick('coin', 1450, 335), mkPick('coin', 1700, 270));
      S.nests.push({ x: W - 240, y: 285, eggId: 'shadowscale', done: false });
      return;
    }
    if (o.bossId) {
      S.bossDef = B.bosses[o.bossId];
      addBush(260, 215, 3); addBush(o.id !== 'boss' ? 1240 : 1040, 330, 3);
      if (o.id === 'boss') { addRock(560, 215, 60, 22); addRock(760, 340, 56, 20); addBush(650, 285, 3); }
      if (o.hazards && o.hazards.vents) for (i = 0; i < o.hazards.vents; i++) addVent(560 + i * 115 + rng.range(-25, 25), rng.range(YMIN + 16, YMAX - 16));
      if (o.hazards && o.hazards.ice) for (i = 0; i < o.hazards.ice; i++) addIce(430 + i * 190 + rng.range(-40, 40), rng.range(YMIN + 20, YMAX - 20), rng.range(80, 120), rng.range(17, 23));
      if (o.hazards && o.hazards.fires) { addFire(330, 232); addFire(1210, 322); }
      if (o.hazards && o.hazards.bogs) for (i = 0; i < o.hazards.bogs; i++) addBog(520 + i * 150 + rng.range(-30, 30), rng.range(YMIN + 22, YMAX - 22), rng.range(52, 78), rng.range(15, 20));
      if (o.hazards && o.hazards.glow) for (i = 0; i < o.hazards.glow; i++) addGlow(330 + i * 380, i % 2 ? 330 : 225);
      if (o.hazards && o.hazards.fields) for (i = 0; i < o.hazards.fields; i++) addField(560 + i * 150 + rng.range(-30, 30), rng.range(YMIN + 25, YMAX - 25), rng.range(70, 100), rng.range(18, 24));
      if (o.hazards && o.hazards.rare) for (i = 0; i < o.hazards.rare; i++) { var rf = S.hz.fields[(i * 2 + 1) % Math.max(1, S.hz.fields.length)]; if (rf) S.pickups.push(mkRare(rf.x, rf.y + 2)); }
      S.boss = { kind: 'boss', x: o.id !== 'boss' ? 1150 : 980, y: 270, hp: S.bossDef.hp, maxHp: S.bossDef.hp, state: 'sleep', t: 0, face: -1, phase: 1, hitFlash: 0, dirx: -1, atk: '', didHit: false, speedMul: 1, windMul: 1, stun: 0, kx: 0, wave: -1, id: 'boss' };
      S.P.x = 250;
      return;
    }
    // rocks first, then everything else is placed clear of them (nothing may spawn inside a boulder)
    var nr = Math.round(W / 330);
    for (i = 0; i < nr; i++) addRock(380 + (i + 0.5) * (W - 1100) / nr + rng.range(-45, 45), rng.range(YMIN + 10, YMAX - 10), rng.range(36, 60), rng.range(16, 24)); // evenly spread so rocks can never wall off the lane
    if (S.demo) S.rocks.length = 0; // the demo arena is rock-free so the pilot never snags
    function free(x, y) {
      for (var t = 0; t < 14; t++) {
        var ok = true;
        for (var r = 0; r < S.rocks.length; r++) { var k = S.rocks[r]; if (Math.abs(x - k.x) < k.rx + 50 && Math.abs(y - k.y) < k.ry * 2.4 + 38) { ok = false; break; } }
        if (ok) return [x, y];
        y = rng.range(YMIN + 12, YMAX - 8); x += rng.range(-40, 40);
      }
      return [x, y];
    }
    var nb = o.bushes, step = (W - 900) / nb, p;
    for (i = 0; i < nb; i++) { p = free(480 + i * step + rng.range(-40, 40), rng.range(YMIN + 20, YMAX - 20)); addBush(p[0], p[1], 1); }
    var types = [], n;
    for (n = 0; n < o.raiders; n++) types.push('raider'); for (n = 0; n < o.spitters; n++) types.push('spitter'); for (n = 0; n < o.skimmers; n++) types.push('skimmer');
    for (n = types.length - 1; n > 0; n--) { var m = Math.floor(rng.next() * (n + 1)), tmp = types[n]; types[n] = types[m]; types[m] = tmp; } // mixed order along the trail
    var span = Math.max(W - 2300, W * 0.55); // enemies stop about 1,300 px short of the egg so the last stretch is calm
    for (i = 0; i < types.length; i++) {
      x = 750 + (i + 0.5) * span / types.length + rng.range(-70, 70);
      addEnemy(types[i], x, rng.range(YMIN + 10, YMAX - 6), o.camo && rng.next() < o.camo ? { camo: true } : null);
    }
    var nd = Math.max(4, Math.round(W / 900)), nc = Math.max(5, Math.round(W / 800));
    for (i = 0; i < nd; i++) { p = free(rng.range(600, W - 500), rng.range(YMIN + 12, YMAX - 8)); S.pickups.push(mkPick('dna', p[0], p[1])); }
    for (i = 0; i < nc; i++) { p = free(rng.range(500, W - 400), rng.range(YMIN + 12, YMAX - 8)); S.pickups.push(mkPick('coin', p[0], p[1])); }
    if (o.hazards) { // Emberlands: lava pools and heat vents, spread along the trail but never on the first or last stretch
      var hx0 = 1000, hx1 = W - 1500, tries, okp, q;
      var clearOf = function (x, y, r) { for (q = 0; q < S.bushes.length; q++) if (Math.abs(S.bushes[q].x - x) < r + 40 && Math.abs(S.bushes[q].y - y) < 60) return false; for (q = 0; q < S.pickups.length; q++) if (Math.abs(S.pickups[q].x - x) < r + 30 && Math.abs(S.pickups[q].y - y) < 50) return false; return true; };
      for (i = 0; i < o.hazards.pools; i++) { var rxp = rng.range(55, 85); for (tries = 0, okp = false; tries < 10 && !okp; tries++) { x = hx0 + (i + 0.5) * (hx1 - hx0) / o.hazards.pools + rng.range(-120, 120); var yp = rng.range(YMIN + 22, YMAX - 22); if (clearOf(x, yp, rxp)) { addPool(x, yp, rxp, rng.range(15, 21)); okp = true; } } }
      for (i = 0; i < o.hazards.vents; i++) { for (tries = 0, okp = false; tries < 10 && !okp; tries++) { x = hx0 + 80 + (i + 0.5) * (hx1 - hx0) / o.hazards.vents + rng.range(-150, 150); var yv = rng.range(YMIN + 18, YMAX - 18); if (clearOf(x, yv, 50)) { addVent(x, yv); okp = true; } } }
      for (i = 0; i < (o.hazards.ice || 0); i++) { for (tries = 0, okp = false; tries < 10 && !okp; tries++) { x = hx0 - 300 + (i + 0.5) * (hx1 - hx0 + 300) / o.hazards.ice + rng.range(-160, 160); var yi = rng.range(YMIN + 20, YMAX - 20); if (clearOf(x, yi, 100)) { addIce(x, yi, rng.range(85, 150), rng.range(17, 24)); okp = true; } } }
      for (i = 0; i < (o.hazards.bogs || 0); i++) { var rxb = rng.range(60, 92); for (tries = 0, okp = false; tries < 10 && !okp; tries++) { x = hx0 - 200 + (i + 0.5) * (hx1 - hx0 + 200) / o.hazards.bogs + rng.range(-130, 130); var yb = rng.range(YMIN + 22, YMAX - 22); if (clearOf(x, yb, rxb)) { addBog(x, yb, rxb, rng.range(16, 22)); okp = true; } } }
      var ng = o.hazards.glow || 0; for (i = 0; i < ng; i++) addGlow(i === ng - 1 ? W - 520 : 900 + i * (W - 3300) / Math.max(1, ng - 2), rng.range(YMIN + 40, YMAX - 30)); // glowcaps spread along the trail; the last one waits near the egg
      for (i = 0; i < (o.hazards.fields || 0); i++) { for (tries = 0, okp = false; tries < 10 && !okp; tries++) { x = hx0 - 200 + (i + 0.5) * (hx1 - hx0 + 200) / o.hazards.fields + rng.range(-120, 120); var yf = rng.range(YMIN + 25, YMAX - 25); if (clearOf(x, yf, 110)) { addField(x, yf, rng.range(75, 115), rng.range(19, 25)); okp = true; } } }
      for (i = 0; i < (o.hazards.rare || 0); i++) { var fl = S.hz.fields[(i * 2 + 1) % Math.max(1, S.hz.fields.length)]; if (fl) S.pickups.push(mkRare(fl.x + rng.range(-fl.rx * 0.4, fl.rx * 0.4), fl.y + 2)); } // rare DNA sits inside the energy fields: a risk worth taking
      var nf = o.hazards.fires || 0; for (i = 0; i < nf; i++) addFire(i === nf - 1 ? W - 450 : 900 + i * (W - 3000) / Math.max(1, nf - 2), rng.range(YMIN + 40, YMAX - 30)); // the last fire waits near the egg
    }
    S.nests.push({ x: W - 240, y: 285, eggId: o.eggId, done: false });
    if (o.id === 'egg' || o.id === 'forage') S.crystal = { x: W - 520, y: 232, used: false };
  }
  function mkPick(type, x, y) { return { type: type, x: x, y: y, t: Math.random() * 6, got: false }; }
  function mkRare(x, y) { var p = mkPick('dna', x, y); p.rare = true; return p; }

  /* ---------- input ---------- */
  function onKey(e) {
    if (!running) return;
    var down = e.type === 'keydown', k = e.code;
    var map = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
    if (map[k]) { keys[map[k]] = down; e.preventDefault(); return; }
    if (k === 'Space') { held.attack = down; if (down && !e.repeat) press('attack'); e.preventDefault(); return; }
    if (!down) return;
    if (k === 'ShiftLeft' || k === 'ShiftRight') { press('dash'); e.preventDefault(); }
    else if (k === 'KeyE') { press('ability'); e.preventDefault(); }
    else if (k === 'Escape' || k === 'KeyP') { if (G.onPauseRequest) G.onPauseRequest(); }
  }
  function press(a) { if (!paused && running) queue.push(a); }
  G.press = press;
  G.hold = function (a, v) { if (a === 'attack') held.attack = v; };
  G.setMove = function (x, y) { mv.x = x; mv.y = y; };
  G.pause = function () { paused = true; keys = {}; held.attack = false; mv.x = 0; mv.y = 0; queue.length = 0; };
  G.resume = function () { if (!running) return; paused = false; last = performance.now(); };
  G.isPaused = function () { return paused; };
  G.step = function (dt) { if (S && !S.ended && !paused) update(dt); }; // test-only: advance the simulation without the animation frame
  G.isRunning = function () { return running; };
  G.stop = function () { running = false; paused = true; cancelAnimationFrame(raf); };
  G.clear = function () { if (cx) cx.clearRect(0, 0, cv.width, cv.height); };

  /* ---------- main loop ---------- */
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    var dt = Math.min(50, now - last); last = now; // clamp large deltas after tab suspension
    if (!paused && S && !S.ended) { for (var k = 0, n = G.fast || 1; k < n && !S.ended; k++) update(dt); } // G.fast: test-only speed multiplier
    render();
  }

  function update(dt) {
    if (S.hitStop > 0) { S.hitStop -= dt; updateEffects(dt * 0.25); return; } // hit-stop: a few frozen frames sell the impact
    S.t += dt; var P = S.P, i;
    if (G.onTick) G.onTick(dt); // test-only hook
    // queued actions
    while (queue.length) { var a = queue.shift(); if (a === 'attack') doAttack(); else if (a === 'dash') doDash(); else if (a === 'ability') doAbility(); }
    if (held.attack && P.atkCd <= 0) doAttack();
    if (S.demo) { demoAI(dt); if (S.t > 75000 && S.ending <= 0) { S.ending = 400; S.endOutcome = 'success'; } }
    updatePlayer(dt);
    for (i = 0; i < S.enemies.length; i++) updateEnemy(S.enemies[i], dt);
    if (S.boss) updateBoss(S.boss, dt);
    separate();
    updateProjectiles(dt); updatePickups(dt); updateHazards(dt); updateEffects(dt);
    updateObjective(dt); updateCombatMusic(dt);
    // camera
    var target = Math.max(0, Math.min(S.worldW - VW, P.x - VW * 0.42));
    S.camX += (target - S.camX) * Math.min(1, dt / 140);
    if (S.ending > 0) { S.ending -= dt; if (S.ending <= 0) finish(S.endOutcome); }
  }

  function updatePlayer(dt) {
    var P = S.P, st = S.stats, ix = mv.x + (keys.right ? 1 : 0) - (keys.left ? 1 : 0), iy = mv.y + (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    var len = Math.sqrt(ix * ix + iy * iy); if (len > 1) { ix /= len; iy /= len; }
    P.atkCd = Math.max(0, P.atkCd - dt); P.atkT = Math.max(0, P.atkT - dt); P.dashCd = Math.max(0, P.dashCd - dt); P.abCd = Math.max(0, P.abCd - dt);
    P.inv = Math.max(0, P.inv - dt); P.shield = Math.max(0, P.shield - dt); P.hurt = Math.max(0, P.hurt - dt); P.stun = Math.max(0, P.stun - dt); P.surgeT = Math.max(0, P.surgeT - dt);
    P.anim += dt * (len > 0.1 ? 1 : 0.4);
    if (P.pend > 0) { if (P.stun > 0 || P.dashT > 0) P.pend = 0; else { P.pend -= dt; if (P.pend <= 0) { P.pend = 0; strike(); } } }
    var sg = Math.sin(P.anim / 80) > 0 ? 1 : -1; if (P.dashT <= 0 && len > 0.3 && sg !== P.sg && P.stun <= 0) dust(P.x - P.face * 12, P.y + 3, 1, 6, -P.face); P.sg = sg; // footfall puff
    P.en = Math.min(P.maxEn, P.en + st.energyRegen * dt / 1000);
    // slow recovery after a few calm seconds (not during the boss fight)
    if (S.combat || P.hurt > 0) P.calmT = 0; else P.calmT = (P.calmT || 0) + dt;
    if (!S.boss && P.calmT > 4000 && P.hp > 0 && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + 3 * ((S.obj && S.obj.regenMul) || 1) * dt / 1000);
    if (P.dashT > 0) {
      P.dashT -= dt; P.x += P.dashDx * P.dashSpd * dt / 1000; P.y += P.dashDy * P.dashSpd * 0.5 * dt / 1000;
      if (P.dashHit) dashDamage();
      if (Math.random() < 0.7) spark(P.x - P.face * 20, P.y - 20, st.path === 'swiftclaw' ? '#9FE7DF' : '#F3EBD7', 1);
    } else if (P.stun <= 0) {
      if (S.onIce) { var kk = Math.min(1, dt / B.weather.iceAccelMs); P.ivx += (ix * st.speed * S.speedMul - P.ivx) * kk; P.ivy += (iy * st.speed * 0.62 - P.ivy) * kk; P.x += P.ivx * dt / 1000; P.y += P.ivy * dt / 1000; } // slippery: you slide and steer slowly
      else { P.ivx = ix * st.speed * S.speedMul; P.ivy = iy * st.speed * 0.62; P.x += P.ivx * dt / 1000; P.y += P.ivy * dt / 1000; }
      if (Math.abs(ix) > 0.12) P.face = sgn(ix);
    }
    P.x = Math.max(24, Math.min(S.worldW - 24, P.x)); P.y = Math.max(YMIN, Math.min(YMAX, P.y));
    rocks(P, 22);
    var knock = P.kx || 0; if (knock) { P.x += knock * dt / 1000; P.kx *= 0.86; if (Math.abs(P.kx) < 4) P.kx = 0; }
  }
  function rocks(ent, r) {
    for (var i = 0; i < S.rocks.length; i++) {
      var k = S.rocks[i], dx = (ent.x - k.x) / (k.rx + r * 0.6), dy = (ent.y - k.y) / (k.ry + r * 0.25), d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) { if (d < 0.001) { dx = 1; d = 1; } ent.x = k.x + (dx / d) * (k.rx + r * 0.6) * 1.001; ent.y = k.y + (dy / d) * (k.ry + r * 0.25) * 1.001; ent.y = Math.max(YMIN, Math.min(YMAX, ent.y)); }
    }
  }
  function separate() {
    var i, j, a, b, dx;
    for (i = 0; i < S.enemies.length; i++) {
      a = S.enemies[i]; if (a.state === 'dead') continue;
      for (j = i + 1; j < S.enemies.length; j++) {
        b = S.enemies[j]; if (b.state === 'dead') continue;
        dx = a.x - b.x; if (Math.abs(dx) < 36 && Math.abs(a.y - b.y) < 16) { var push = (36 - Math.abs(dx)) * 0.25 * (dx >= 0 ? 1 : -1); a.x += push; b.x -= push; }
      }
    }
  }

  /* ---------- player actions ---------- */
  function doAttack() {
    var P = S.P, st = S.stats; if (P.atkCd > 0 || P.stun > 0 || P.dashT > 0) return;
    P.atkCd = B.player.attackCooldown; P.atkT = 260; P.pend = 60; P.hitIds = {}; // 0-60 ms wind-back, strike lands at 60 ms, then recovery
    DF.Audio.sfx('swing_' + (S.stats.path || 'base'));
  }
  function critRoll(base) {
    var st = S.stats;
    if (st.critChance > 0 && S.rng.next() < st.critChance) return { dmg: Math.round(base * st.critMul), crit: true };
    return { dmg: base, crit: false };
  }
  function hurtEnemy(e, base, melee, opts) {
    opts = opts || {};
    var r = critRoll(base), dmg = r.dmg;
    if (e.kind === 'boss') { var vuln = (e.state === 'recover' || e.state === 'stun'); if (!vuln) dmg = Math.max(1, Math.round(dmg * (S.bossDef.armor || 0.55))); if (e.state === 'roar' || e.state === 'dead') return; }
    else if (e.state === 'recover') dmg = Math.round(dmg * 1.4);
    if (S.tut && e.type === 'raider') dmg = Math.round(dmg * 1.5);
    e.hp -= dmg; e.hitFlash = 130;
    if (e.state === 'idle') { e.rev = true; e.state = 'chase'; markSeen(e.type || (S.bossDef && S.bossDef.id)); }
    if (e.kind === 'enemy') { e.kx = (S.P.x < e.x ? 1 : -1) * (opts.knock || B.player.knockback) * (e.state === 'windup' ? 0.4 : 1); if (e.state === 'windup') { e.state = 'chase'; e.t = 0; e.cd = 500; } }
    float(e.x, e.y - 60, String(dmg), r.crit ? '#F5D27F' : '#F3EBD7', r.crit);
    DF.Audio.sfx(e.kind === 'boss' ? (vuln ? 'hit_boss_open' : 'clank') : 'hit_' + e.type); if (r.crit) DF.Audio.sfx('crit');
    var pw = r.crit ? 1.7 : (e.kind === 'boss' ? 1.2 : 1), hd = S.P.x < e.x ? 1 : -1;
    impact(e.x - hd * 8, e.y - 36, hd, pw, r.crit ? '#F5D27F' : '#FFD9A0');
    burst(e.x, e.y - 30, r.crit ? '#F5D27F' : '#F3EBD7', r.crit ? 6 : 3);
    e.hitT = 160; e.hitDir = hd; hitStop(r.crit ? 95 : e.kind === 'boss' ? 70 : 55); shake(r.crit ? 5 : 3); kick(hd * (r.crit ? 6 : 3.5), 0); vibrate(r.crit ? 20 : 12);
    if (e.hp <= 0) killEnemy(e);
  }
  function killEnemy(e) {
    e.state = 'dead'; e.dead = 0;
    if (e.kind === 'boss') { S.gained.xp += S.bossDef.xp; S.kills[S.bossDef.id] = (S.kills[S.bossDef.id] || 0) + 1; shake(9); hitStop(220); DF.Audio.sfx('die_boss'); DF.Audio.sfx('slam'); burst(e.x, e.y - 50, '#E8B54A', 24); ring(e.x, e.y, 170, '#E8B54A'); dust(e.x, e.y + 2, 12, 14, 0); S.ending = 1600; S.endOutcome = 'success'; S.bossDown = true; return; }
    DF.Audio.sfx('die_' + e.type); S.gained.xp += e.def.xp; S.kills[e.type] = (S.kills[e.type] || 0) + 1; S.kills.total = (S.kills.total || 0) + 1;
    impact(e.x, e.y - 34, S.P.x < e.x ? 1 : -1, 2.4, '#FF9A7A'); burst(e.x, e.y - 30, '#E5534B', 8); dust(e.x, e.y + 2, 5, 8, 0); hitStop(100); shake(5);
    if (S.rng.next() < e.def.drop) S.pickups.push(mkPick(S.rng.next() < 0.5 ? 'coin' : 'dna', e.x, e.y));
    if (S.tut && e.type === 'raider') advanceTut(3);
  }
  function doDash() {
    var P = S.P, st = S.stats; if (P.dashCd > 0 || P.stun > 0 || P.dashT > 0) return;
    if (P.en < st.dashCost) { DF.Audio.sfx('deny'); if (G.onEvent) G.onEvent('noEnergy'); return; }
    P.en -= st.dashCost; P.dashCd = B.dash.cooldown; dust(P.x, P.y + 3, 5, 9, -P.face);
    var ix = mv.x + (keys.right ? 1 : 0) - (keys.left ? 1 : 0), iy = mv.y + (keys.down ? 1 : 0) - (keys.up ? 1 : 0), l = Math.sqrt(ix * ix + iy * iy);
    if (l < 0.2) { ix = P.face; iy = 0; l = 1; }
    P.dashDx = ix / l; P.dashDy = iy / l; P.dashT = B.dash.duration; P.dashSpd = B.dash.distance / (B.dash.duration / 1000); P.inv = Math.max(P.inv, B.dash.invuln); P.dashHit = false;
    if (Math.abs(P.dashDx) > 0.2) P.face = sgn(P.dashDx);
    DF.Audio.sfx('dash');
  }
  function doAbility() {
    var P = S.P, st = S.stats, ab = st.ability; if (P.abCd > 0 || P.stun > 0 || P.dashT > 0) return;
    if (P.en < ab.cost) { DF.Audio.sfx('deny'); if (G.onEvent) G.onEvent('noEnergy'); return; }
    P.en -= ab.cost; P.abCd = ab.cooldown; S.abilitiesUsed++;
    var list = S.enemies.concat(S.boss ? [S.boss] : []), i, e;
    if (ab.id === 'phantom-dash') {
      P.dashDx = P.face; P.dashDy = 0; P.dashT = 220; P.dashSpd = ab.distance / 0.22; P.inv = ab.invuln; P.dashHit = true; P.hitIds = {}; DF.Audio.sfx('dash'); DF.Audio.sfx('ability');
    } else if (ab.id === 'fortress-roar') {
      P.shield = ab.shield; DF.Audio.sfx('roar'); ring(P.x, P.y, ab.radius, '#CFE8B0'); shake(3);
      for (i = 0; i < list.length; i++) { e = list[i]; if (e.state !== 'dead' && dist(e, P) < ab.radius + 30) { if (e.kind === 'enemy') { e.stun = ab.stun; e.state = 'stun'; } hurtEnemy(e, ab.damage, false, { knock: 60 }); } }
    } else if (ab.id === 'genesis-surge') {
      DF.Audio.sfx('surge'); ring(P.x, P.y, ab.radius, '#4FD1C5'); ring(P.x, P.y, ab.radius * 0.6, '#9FE7DF'); shake(4); P.surgeT = 500;
      for (i = 0; i < list.length; i++) { e = list[i]; if (e.state !== 'dead' && dist(e, P) < ab.radius + 30) { if (e.kind === 'enemy') { e.stun = ab.stun; e.state = 'stun'; } hurtEnemy(e, ab.damage, false, { knock: 140 }); } }
      if (S.crystal && !S.crystal.used && Math.abs(S.crystal.x - P.x) < 280) wakeCrystal();
    } else { // tail sweep
      DF.Audio.sfx('ability'); ring(P.x, P.y, ab.radius, '#F3EBD7'); shake(2);
      for (i = 0; i < list.length; i++) { e = list[i]; if (e.state !== 'dead' && dist(e, P) < ab.radius + 28) hurtEnemy(e, ab.damage, false, { knock: ab.knock }); }
    }
    if (G.onEvent) G.onEvent('ability');
  }
  function dashDamage() {
    var P = S.P, ab = S.stats.ability, list = S.enemies.concat(S.boss ? [S.boss] : []);
    for (var i = 0; i < list.length; i++) {
      var e = list[i]; if (e.state === 'dead' || P.hitIds[e.id]) continue;
      if (Math.abs(e.x - P.x) < 46 && Math.abs(e.y - P.y) < 30) { P.hitIds[e.id] = 1; hurtEnemy(e, ab.damage, false, { knock: 70 }); }
    }
  }
  function wakeCrystal() {
    S.crystal.used = true; DF.Audio.sfx('crystal'); ring(S.crystal.x, S.crystal.y, 120, '#9FE7DF'); burst(S.crystal.x, S.crystal.y - 40, '#9FE7DF', 20);
    S.pickups.push(mkPick('dna', S.crystal.x - 40, S.crystal.y + 40), mkPick('dna', S.crystal.x + 40, S.crystal.y + 50), mkPick('dna', S.crystal.x, S.crystal.y + 60));
    toast(DF.S.hud.crystalWake, 'egg');
    if (DF.save.discoveries.eggs.indexOf('prism') < 0 && S.newEggs.indexOf('prism') < 0) { S.newEggs.push('prism'); DF.Audio.stinger('08-stinger-egg-discovery'); }
  }

  /* ---------- damage to the player ---------- */
  function hurtPlayer(dmg, fromX, isBoss) {
    var P = S.P, st = S.stats; if (P.inv > 0 || S.ended || S.ending > 0) return false;
    var red = st.defence + (isBoss ? st.bossDefence : 0); if (P.shield > 0) red += 0.5;
    var d = Math.max(1, Math.round(dmg * (1 - Math.min(0.85, red))));
    if (S.tut) d = Math.max(1, Math.round(d * 0.5));
    if (S.demo) d = Math.max(1, Math.round(d * 0.35));
    P.hp -= d; P.inv = 650; P.hurt = 260; P.calmT = 0; P.kx = (P.x < fromX ? -1 : 1) * 130;
    float(P.x, P.y - 70, '-' + d, '#F2B8B0', false); DF.Audio.sfx('hurt'); shake(4); S.hurtFlash = reduced() ? 120 : 260; vibrate(30);
    burst(P.x, P.y - 30, '#E5534B', 6);
    var pd = P.x < fromX ? -1 : 1; impact(P.x, P.y - 34, pd, isBoss ? 1.8 : 1.2, '#FF8A7A'); hitStop(isBoss ? 90 : 70); kick(pd * (isBoss ? 7 : 4), 0);
    if (P.hp <= 0) {
      if (S.demo) { P.hp = Math.round(P.maxHp * 0.5); P.inv = 1500; return true; }
      if (S.tut) { P.hp = Math.round(P.maxHp * 0.6); P.inv = 1500; toast('Shake it off! Try again.', 'info'); return true; }
      P.hp = 0; S.ending = 900; S.endOutcome = 'defeat'; S.ended = false;
    }
    return true;
  }

  /* ---------- enemies ---------- */
  function markSeen(type) { if (!type || S.seen[type]) return; S.seen[type] = 1; if (!S.firstEncounter && type !== 'thornback' && type !== 'cinderjaw' && type !== 'whitetitan' && type !== 'mirequeen' && type !== 'colossus') { S.firstEncounter = true; S.timeToFirst = S.t; DF.track('first_encounter', { ms: Math.round(S.t) }); } }
  function applyKnock(e, dt) { if (e.kx) { e.x += e.kx * dt / 1000 * 3; e.kx *= 0.84; if (Math.abs(e.kx) < 3) e.kx = 0; e.x = Math.max(20, Math.min(S.worldW - 20, e.x)); } }
  function contact(e, rx, ry) { var P = S.P; return Math.abs(P.x - e.x) < rx && Math.abs(P.y - e.y) < ry; }

  function updateEnemy(e, dt) {
    var d = e.def, P = S.P;
    if (e.state === 'dead') { e.dead += dt; return; }
    e.hitFlash = Math.max(0, e.hitFlash - dt); e.hitT = Math.max(0, (e.hitT || 0) - dt); e.cd = Math.max(0, e.cd - dt); e.t -= dt;
    applyKnock(e, dt);
    if (e.stun > 0) { e.stun -= dt; e.state = 'stun'; if (e.stun <= 0) { e.state = 'chase'; e.t = 0; } return; }
    var dx = P.x - e.x, dy = P.y - e.y, dd = Math.sqrt(dx * dx + dy * dy * 2.9), spd = d.speed;
    var tooFar = Math.abs(dx) > 1400;
    if (tooFar && e.state === 'idle') return;
    if (e.state === 'chase' && Math.abs(dx) > 620) { e.state = 'idle'; e.cd = 700; return; } // gave up the chase: back to waiting
    switch (e.state) {
      case 'idle':
        e.wob += dt / 700; e.y += Math.sin(e.wob) * 0.1;
        if (e.camo && !e.rev) { // camouflaged ambusher: stays hidden until you are close (or a glowcap lights it up), then strikes at once
          if (dd < B.mire.camoRadius || (S.reveal > 0 && dd < B.mire.revealRadius)) { e.rev = true; e.cd = 0; e.state = 'chase'; markSeen(e.type); burst(e.x, e.y - 30, '#9FFFD0', 8); DF.Audio.sfx('windup'); if (!S.shown.camo) { S.shown.camo = true; toast(DF.S.hud.camoHint, 'info'); } }
        } else if (dd < d.aggro) { e.state = 'chase'; markSeen(e.type); }
        break;
      case 'chase':
        e.face = sgn(dx);
        if (e.type === 'spitter') {
          var keep = d.keep, want = dd < keep - 20 ? -1 : dd > keep + 50 ? 1 : 0;
          e.x += want * e.face * spd * dt / 1000; e.y += Math.sign(dy) * Math.min(Math.abs(dy), 34 * dt / 1000);
          if (e.cd <= 0 && Math.abs(dx) < 340 && Math.abs(dy) < 70 && P.hp > 0) beginWindup(e, 680);
        } else if (e.type === 'skimmer') {
          e.wob += dt / 260; e.x += e.face * spd * (dd > 120 ? 1 : -0.2) * dt / 1000; e.y += Math.sign(dy) * Math.min(Math.abs(dy), 90 * dt / 1000) + Math.sin(e.wob) * 0.6;
          if (e.cd <= 0 && dd < 150) beginWindup(e, d.windup);
        } else { // raider
          e.x += e.face * spd * (Math.abs(dx) > 30 ? 1 : 0) * dt / 1000; e.y += Math.sign(dy) * Math.min(Math.abs(dy), 70 * dt / 1000);
          if (e.cd <= 0 && Math.abs(dx) < 130 && Math.abs(dy) < 40) beginWindup(e, d.windup);
        }
        e.y = Math.max(YMIN, Math.min(YMAX, e.y)); rocks(e, 18);
        break;
      case 'windup':
        e.face = sgn(P.x - e.x) || e.face;
        if (e.t <= 0) {
          if (e.type === 'spitter') { fireSpit(e); e.state = 'recover'; e.t = d.recover; }
          else { e.state = 'attack'; e.t = d.lungeTime; e.didHit = false; enemySlash(e); DF.Audio.sfx('lunge_' + e.type); dust(e.x, e.y + 2, 2, 7, -e.face); var lx = P.x - e.x, ly = (P.y - e.y); var ll = Math.sqrt(lx * lx + ly * ly) || 1; e.dirx = lx / ll; e.diry = ly / ll * 0.4; e.startClose = dd < 140; }
        }
        break;
      case 'attack':
        e.x += e.dirx * d.lunge / (d.lungeTime / 1000) * dt / 1000; e.y += e.diry * d.lunge / (d.lungeTime / 1000) * dt / 1000;
        e.y = Math.max(YMIN, Math.min(YMAX, e.y)); e.x = Math.max(20, Math.min(S.worldW - 20, e.x));
        if (!e.didHit && contact(e, 40, 28)) { e.didHit = hurtPlayer(d.dmg * (e.dmgMul || 1), e.x, false) || P.inv > 0 && false; if (!e.didHit && P.inv > 0) e.dodged = true; }
        if (e.t <= 0) { if (!e.didHit && (e.startClose || e.dodged)) countDodge(); e.dodged = false; e.state = 'recover'; e.t = d.recover; }
        break;
      case 'recover':
        if (e.type === 'skimmer') { e.x -= e.face * spd * 0.9 * dt / 1000; }
        if (e.t <= 0) { e.state = 'chase'; e.cd = d.cooldown; }
        break;
    }
  }
  function beginWindup(e, ms) { e.state = 'windup'; e.t = ms; DF.Audio.sfx('windup_' + e.type); markSeen(e.type); }
  function countDodge() { S.dodges++; DF.Audio.sfx('dodge'); if (S.tut && S.tut.step === 2) { /* dodging counts as progress, killing is the goal */ } if (G.onEvent) G.onEvent('dodge'); float(S.P.x, S.P.y - 80, 'Dodge!', '#9FE7DF', false); }
  function fireSpit(e) {
    DF.Audio.sfx('spit'); var P = S.P, dx = P.x - e.x, dy = P.y - e.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
    S.projectiles.push({ x: e.x + e.face * 30, y: e.y - 34, gy: e.y, vx: dx / l * e.def.projSpeed, vy: dy / l * e.def.projSpeed * 0.5, life: 2600, dmg: e.def.dmg * (e.dmgMul || 1), near: false });
  }
  function updateProjectiles(dt) {
    var P = S.P;
    for (var i = S.projectiles.length - 1; i >= 0; i--) {
      var p = S.projectiles[i]; p.x += p.vx * dt / 1000; p.gy += p.vy * dt / 1000; p.y = p.gy - 34; p.life -= dt;
      var dx = Math.abs(p.x - P.x), dy = Math.abs(p.gy - P.y);
      if (dx < 26 && dy < 26) { if (P.inv > 0) { if (!p.near) { p.near = true; countDodge(); } } else { hurtPlayer(p.dmg, p.x, false); S.projectiles.splice(i, 1); burst(p.x, p.y, '#9BE070', 5); continue; } }
      else if (dx < 60 && dy < 40) p.near = p.near || 'close';
      if (p.life <= 0 || p.x < -20 || p.x > S.worldW + 20) { if (p.near === 'close') countDodge(); S.projectiles.splice(i, 1); }
    }
  }

  /* ---------- Frostfang Peaks: blizzards, chill, ice and campfires ---------- */
  function coldHurt(amount) {
    var P = S.P; if (S.ended || S.ending > 0 || S.tut || S.demo) return;
    var d = Math.max(1, Math.round(amount)); if (P.shield > 0) d = Math.max(1, Math.round(d * 0.6));
    P.hp -= d; P.calmT = 0; P.hurt = 140;
    float(P.x, P.y - 70, '-' + d, '#9FD8FF', false); burst(P.x, P.y - 30, '#CDEBFF', 3);
    if (P.hp <= 0) { P.hp = 0; S.ending = 900; S.endOutcome = 'defeat'; }
  }
  function updateFrost(dt) {
    var W = B.weather, wx = S.wx, P = S.P, st = S.stats, i, f, ice;
    // weather cycle: calm, a short warning, then a blizzard
    wx.t -= dt;
    if (wx.state === 'calm' && wx.t <= 0) { wx.state = 'warn'; wx.t = W.warn; toast(DF.S.hud.blizzardWarn, 'info'); DF.Audio.sfx('windup'); }
    else if (wx.state === 'warn' && wx.t <= 0) { wx.state = 'storm'; wx.t = S.rng.range(W.storm[0], W.storm[1]); DF.Audio.sfx('roar'); }
    else if (wx.state === 'storm' && wx.t <= 0) { wx.state = 'calm'; wx.t = S.rng.range(W.calm[0], W.calm[1]); }
    // falling snow (heavier and wind-blown in a blizzard)
    S.snowT += dt; var rate = wx.state === 'storm' ? 22 : wx.state === 'warn' ? 40 : 70;
    if (!reduced() && S.snowT > rate && S.parts.length < 140) { S.snowT = 0; S.parts.push({ x: S.camX + Math.random() * (VW + 160) - 20, y: -6, vx: wx.state === 'storm' ? -110 - Math.random() * 70 : -10 - Math.random() * 14, vy: 40 + Math.random() * 55, t: 0, life: 5200, c: '#EAF7FF', r: 1 + Math.random() * 1.8, snow: true }); }
    // warmth: campfires (and berries, see updatePickups) bring the chill down
    var warm = false;
    for (i = 0; i < S.hz.fires.length; i++) { f = S.hz.fires[i]; if (Math.abs(P.x - f.x) < W.fireRadius && Math.abs(P.y - f.y) < 90) { warm = true; break; } }
    var gain = (wx.state === 'storm' ? W.chillStorm : W.chillCalm) * (1 - st.coldResist);
    if (warm) wx.chill = Math.max(0, wx.chill - W.fireCool * dt / 1000); else wx.chill = Math.min(100, wx.chill + gain * dt / 1000);
    if (S.demo) wx.chill = Math.min(wx.chill, 55); // the demo never freezes
    S.cold = wx.chill >= 100;
    S.speedMul = S.cold ? W.freezeSlow : 1;
    if (S.cold) { S.freezeAcc += dt; if (S.freezeAcc >= 500) { S.freezeAcc -= 500; coldHurt(W.freezeDps * 0.5); } } else S.freezeAcc = 0;
    // slippery ice
    S.onIce = false;
    for (i = 0; i < S.hz.ice.length; i++) { ice = S.hz.ice[i]; var dx = (P.x - ice.x) / ice.rx, dy = (P.y - ice.y) / ice.ry; if (dx * dx + dy * dy < 1) { S.onIce = true; break; } }
  }

  /* ---------- The Lost Mire: poison bogs, glowcaps and camouflaged ambushers ---------- */
  function poisonHurt(amount) {
    var P = S.P, st = S.stats; if (S.ended || S.ending > 0 || S.tut || S.demo) return;
    var d = Math.max(1, Math.round(amount * (1 - st.poisonResist))); if (P.shield > 0) d = Math.max(1, Math.round(d * 0.6));
    P.hp -= d; P.calmT = 0; P.hurt = 120;
    float(P.x, P.y - 70, '-' + d, '#B6F07A', false); burst(P.x, P.y - 30, '#8BD84A', 3);
    if (P.hp <= 0) { P.hp = 0; S.ending = 900; S.endOutcome = 'defeat'; }
  }
  function updateMire(dt) {
    var M = B.mire, P = S.P, i, p, g, inBog = false;
    S.reveal = Math.max(0, S.reveal - dt);
    // drifting fireflies
    S.ambT += dt;
    if (!reduced() && S.ambT > 120 && S.parts.length < 110) { S.ambT = 0; S.parts.push({ x: S.camX + Math.random() * VW, y: 150 + Math.random() * 230, vx: (Math.random() - 0.5) * 18, vy: -6 - Math.random() * 12, t: 0, life: 2600 + Math.random() * 1800, c: '#B8FFC8', r: 1 + Math.random() * 1.5, ember: true }); }
    // bogs poison you; dashing skims over them
    for (i = 0; i < S.hz.bogs.length; i++) { p = S.hz.bogs[i]; var dx = (P.x - p.x) / p.rx, dy = (P.y - p.y) / p.ry; if (dx * dx + dy * dy < 1) { inBog = true; break; } }
    if (inBog && P.dashT <= 0) { if (S.poison <= 0) { float(P.x, P.y - 90, DF.S.hud.poisoned, '#B6F07A', false); DF.Audio.sfx('hurt'); } S.poison = M.poisonMs; }
    if (S.poison > 0) { S.poison -= dt; S.poisonAcc += dt; if (S.poisonAcc >= M.tick) { S.poisonAcc -= M.tick; poisonHurt(M.dps * M.tick / 1000); } } else S.poisonAcc = 0;
    // glowcaps: cure poison and show where the camouflaged predators are hiding
    for (i = 0; i < S.hz.glow.length; i++) {
      g = S.hz.glow[i]; if (g.used) continue;
      if (Math.abs(P.x - g.x) < M.glowRadius && Math.abs(P.y - g.y) < 60) { g.used = true; S.poison = 0; S.reveal = M.revealMs; burst(g.x, g.y - 24, '#B8FFC8', 14); DF.Audio.sfx('pickup'); toast(DF.S.hud.glowUsed, 'info'); }
    }
  }

  /* ---------- Genesis Crater: unstable energy fields and rare DNA ---------- */
  function energyHurt(amount) {
    var P = S.P, st = S.stats; if (S.ended || S.ending > 0 || S.tut || S.demo) return;
    var d = Math.max(1, Math.round(amount * (1 - st.energyResist))); if (P.shield > 0) d = Math.max(1, Math.round(d * 0.6));
    P.hp -= d; P.calmT = 0; P.hurt = 260;
    float(P.x, P.y - 70, '-' + d, '#9FE3FF', false); burst(P.x, P.y - 30, '#7FD6FF', 6);
    DF.Audio.sfx('hurt'); shake(4); S.hurtFlash = reduced() ? 120 : 240; vibrate(25);
    if (P.hp <= 0) { P.hp = 0; S.ending = 900; S.endOutcome = 'defeat'; }
  }
  function updateCrater(dt) {
    var C = B.crater, P = S.P, i, f, near;
    S.ambT += dt;
    if (!reduced() && S.ambT > 110 && S.parts.length < 110) { S.ambT = 0; S.parts.push({ x: S.camX + Math.random() * VW, y: VH - 10 + Math.random() * 20, vx: (Math.random() - 0.5) * 20, vy: -26 - Math.random() * 34, t: 0, life: 2200 + Math.random() * 1600, c: Math.random() < 0.5 ? '#9FE3FF' : '#F5D27F', r: 1 + Math.random() * 1.6, ember: true }); }
    for (i = 0; i < S.hz.fields.length; i++) {
      f = S.hz.fields[i]; f.t -= dt; near = Math.abs(f.x - P.x) < 520;
      if (f.state === 'idle' && f.t <= 0) { f.state = 'warn'; f.t = C.warn; if (near) DF.Audio.sfx('windup'); }
      else if (f.state === 'warn' && f.t <= 0) { f.state = 'zap'; f.t = C.zap; f.hit = false; if (near) { DF.Audio.sfx('slam'); shake(2); } burst(f.x, f.y - 20, '#9FE3FF', 8); }
      else if (f.state === 'zap') {
        var dx = (P.x - f.x) / f.rx, dy = (P.y - f.y) / f.ry;
        if (!f.hit && dx * dx + dy * dy < 1) { f.hit = true; if (P.inv > 0 || P.dashT > 0) countDodge(); else energyHurt(C.dmg); }
        if (f.t <= 0) { f.state = 'idle'; f.t = S.rng.range(C.idle[0], C.idle[1]); }
      }
    }
  }

  /* ---------- Emberlands hazards: lava pools and heat vents ---------- */
  function heatHurt(amount, kind) {
    var P = S.P, st = S.stats; if (S.ended || S.ending > 0 || S.tut || S.demo) return;
    var d = Math.max(1, Math.round(amount * (1 - st.heatResist))); if (P.shield > 0) d = Math.max(1, Math.round(d * 0.6));
    P.hp -= d; P.calmT = 0; P.hurt = kind === 'vent' ? 260 : 120;
    float(P.x, P.y - 70, '-' + d, '#FFB07A', false); burst(P.x, P.y - 30, '#FF7A2E', 4);
    if (kind === 'vent') { DF.Audio.sfx('hurt'); shake(4); S.hurtFlash = reduced() ? 120 : 240; vibrate(25); }
    if (P.hp <= 0) { P.hp = 0; S.ending = 900; S.endOutcome = 'defeat'; }
  }
  function updateHazards(dt) {
    if (S.biome === 'frost') { updateFrost(dt); return; }
    if (S.biome === 'mire') { updateMire(dt); return; }
    if (S.biome === 'crater') { updateCrater(dt); return; }
    if (S.biome !== 'ember') return;
    var H = B.hazards, P = S.P, i, p, v, near;
    S.ambT += dt;
    if (!reduced() && S.ambT > 90 && S.parts.length < 110) { S.ambT = 0; S.parts.push({ x: S.camX + Math.random() * VW, y: VH - 10 + Math.random() * 20, vx: (Math.random() - 0.5) * 24, vy: -34 - Math.random() * 40, t: 0, life: 1800 + Math.random() * 1400, c: '#FF9A3C', r: 1 + Math.random() * 1.6, ember: true }); }
    var inPool = false;
    for (i = 0; i < S.hz.pools.length; i++) { p = S.hz.pools[i]; var dx = (P.x - p.x) / p.rx, dy = (P.y - p.y) / p.ry; if (dx * dx + dy * dy < 1) { inPool = true; break; } }
    if (inPool && P.dashT <= 0) { S.heatAcc += dt; if (S.heatAcc >= H.poolTick) { S.heatAcc -= H.poolTick; heatHurt(H.poolDps * H.poolTick / 1000, 'pool'); } } else S.heatAcc = Math.max(0, S.heatAcc - dt);
    for (i = 0; i < S.hz.vents.length; i++) {
      v = S.hz.vents[i]; v.t -= dt; near = Math.abs(v.x - P.x) < 520;
      if (v.state === 'idle' && v.t <= 0) { v.state = 'warn'; v.t = H.ventWarn; if (near) DF.Audio.sfx('windup'); }
      else if (v.state === 'warn' && v.t <= 0) { v.state = 'burst'; v.t = H.ventBurst; v.hit = false; if (near) { DF.Audio.sfx('slam'); shake(2); } burst(v.x, v.y - 30, '#FF8A2E', 8); }
      else if (v.state === 'burst') {
        if (!v.hit && Math.abs(P.x - v.x) < H.ventRx && Math.abs(P.y - v.y) < H.ventRy) { v.hit = true; if (P.inv > 0 || P.dashT > 0) countDodge(); else heatHurt(H.ventDamage, 'vent'); }
        if (v.t <= 0) { v.state = 'idle'; v.t = S.rng.range(H.ventIdle[0], H.ventIdle[1]); }
      }
    }
  }

  /* live coaching line under the boss bar */
  function bossHint(b) {
    var T = DF.S.hud.bossHints;
    if (b.state === 'windup') return b.atk === 'charge' ? T.charge : T.slam;
    if (b.state === 'recover') return T.open;
    if (b.state === 'stun') return T.stun;
    if (b.state === 'charge' || b.state === 'slam') return T.dodge;
    if (b.phase === 2 && S.enemies.some(function (e) { return e.state !== 'dead'; })) return T.skimmers;
    return T.wait;
  }
  function bossLabel() { var n = S.bossDef.name; return n.charAt(0) + n.slice(1).toLowerCase(); }
  /* ---------- bosses: Thornback and Cinderjaw ---------- */
  function updateBoss(b, dt) {
    var P = S.P, def = S.bossDef; if (b.state === 'dead') return;
    b.hitFlash = Math.max(0, b.hitFlash - dt); b.hitT = Math.max(0, (b.hitT || 0) - dt); b.t -= dt;
    var dx = P.x - b.x, dy = P.y - b.y, dd = Math.sqrt(dx * dx + dy * dy * 2.9);
    if (b.kx) { b.x += b.kx * dt / 1000; b.kx *= 0.8; }
    switch (b.state) {
      case 'sleep':
        if (Math.abs(dx) < 620) { b.state = 'roar'; b.t = 1300; DF.Audio.sfx('roar'); DF.Audio.play('04-boss-thornback', 700); shake(4); markSeen(S.bossDef.id); S.shown.boss = true; toast(DF.S.hud.bossIntro, 'info'); if (G.onEvent) G.onEvent('boss'); }
        break;
      case 'roar':
        b.rT = (b.rT || 0) + dt; if (b.rT > 420) { b.rT = 0; ring(b.x, b.y, 150, '#F3EBD7'); shake(2.5); }
        if (b.t <= 0) { b.state = 'approach'; b.t = 900 + S.rng.range(0, 600); }
        break;
      case 'approach':
        b.face = sgn(dx); b.x += b.face * def.speed * b.speedMul * dt / 1000; b.y += Math.sign(dy) * Math.min(Math.abs(dy), 40 * dt / 1000);
        b.y = Math.max(YMIN + 10, Math.min(YMAX, b.y));
        b.stepT = (b.stepT || 0) + dt; if (b.stepT > 520) { b.stepT = 0; shake(1.4); dust(b.x - b.face * 20, b.y + 2, 2, 10, 0); } // heavy footfalls
        if (b.t <= 0) {
          b.atk = (dd > 300 || S.rng.next() < 0.45) ? 'charge' : 'slam'; b.state = 'windup'; b.t = (b.atk === 'charge' ? def.chargeWindup : def.slamWindup) * b.windMul; b.dirx = sgn(dx); b.laneY = P.y; b.didHit = false; DF.Audio.sfx('windup_boss');
        }
        break;
      case 'windup':
        if (b.atk === 'charge' && Math.random() < 0.15) dust(b.x - b.dirx * 50, b.y + 2, 1, 7, -b.dirx); // scraping the ground
        if (b.atk === 'charge') { b.face = b.dirx; b.laneY += (P.y - b.laneY) * 0.02; b.y += (b.laneY - b.y) * 0.05; }
        if (b.t <= 0) {
          if (b.atk === 'charge') { b.state = 'charge'; b.t = def.chargeTime; DF.Audio.sfx('roar'); b.startClose = dd < 200; }
          else { b.state = 'slam'; b.t = 420; DF.Audio.sfx('slam'); shake(7); ring(b.x, b.y, def.slamRadius, '#E8B54A'); dust(b.x - 60, b.y + 2, 6, 14, -1); dust(b.x + 60, b.y + 2, 6, 14, 1); hitStop(70); b.waveHit = false; if (Math.abs(P.x - b.x) < def.slamRadius && Math.abs(P.y - b.y) < 50) { if (!hurtPlayer(def.slamDmg, b.x, true) && P.inv > 0) countDodge(); } else if (Math.abs(P.x - b.x) < def.slamRadius + 70) countDodge(); }
        }
        break;
      case 'charge':
        b.x += b.dirx * def.chargeSpeed * b.speedMul * dt / 1000; if (Math.random() < 0.6) dust(b.x - b.dirx * 70, b.y + 2, 1, 12, -b.dirx);
        if (!b.didHit && Math.abs(P.x - b.x) < 96 && Math.abs(P.y - b.y) < 36) { b.didHit = hurtPlayer(def.chargeDmg, b.x, true); if (!b.didHit && P.inv > 0) { b.didHit = true; countDodge(); } }
        if (b.x < 90 || b.x > S.worldW - 90) { b.x = Math.max(90, Math.min(S.worldW - 90, b.x)); b.state = 'stun'; b.t = 1500; shake(8); DF.Audio.sfx('slam'); burst(b.x, b.y - 40, '#C9A56A', 14); toast(DF.t(DF.S.hud.bossStun, { name: bossLabel() }), 'info'); }
        else if (b.t <= 0) { if (!b.didHit && b.startClose) countDodge(); b.state = 'recover'; b.t = def.recover; }
        break;
      case 'slam':
        if (b.t <= 0) { b.state = 'recover'; b.t = def.recover * 0.9; }
        break;
      case 'recover':
      case 'stun':
        if (b.t <= 0) { b.state = 'approach'; b.t = 800 + S.rng.range(0, 700); }
        break;
    }
    b.x = Math.max(60, Math.min(S.worldW - 60, b.x));
    if (b.phase === 1 && b.hp > 0 && b.hp <= b.maxHp * def.phase2At && b.state !== 'sleep') {
      b.phase = 2; b.state = 'roar'; b.t = 1400; b.speedMul = def.enrageSpeed; b.windMul = 0.8; DF.Audio.sfx('roar'); DF.Audio.phase2('04-boss-thornback', 32); shake(6);
      toast(DF.t(DF.S.hud.bossPhase, { name: bossLabel() }), 'info');
      addEnemy('skimmer', Math.min(S.worldW - 60, b.x + 260), 240, { state: 'chase' }); if ((def.adds || 2) > 1) addEnemy('skimmer', Math.max(60, b.x - 260), 320, { state: 'chase' }); // Thornback calls one Skimmer, Cinderjaw two
    }
  }

  /* ---------- demo pilot: plays the scripted run by itself ---------- */
  /* biome demos: the pilot walks through that biome's hazards first, lingering until a timed one fires, so the viewer sees each one working */
  function demoShow() {
    if (S.biome === 'verdant' || S.t > 40000) return null;
    if (!S.show) {
      var h = S.hz, L = S.biome === 'ember' ? [h.pools[0], h.vents[0]] : S.biome === 'frost' ? [h.ice[0], h.fires[0]] : S.biome === 'mire' ? [h.bogs[0], h.glow[0]] : [h.fields[0]];
      S.show = L.filter(Boolean).sort(function (a, b) { return a.x - b.x; }); S.showI = 0; S.showDwell = 0;
    }
    var t = S.show[S.showI]; if (!t) return null;
    if (Math.abs(S.P.x - t.x) < 26 && Math.abs(S.P.y - t.y) < 14) { var need = t.state !== undefined ? (S.biome === 'crater' ? 75 : 55) : 14; if (++S.showDwell >= need) { S.showI++; S.showDwell = 0; } }
    return t;
  }
  function demoAI(dt) {
    S.demoAcc += dt; if (S.demoAcc < 100) return; S.demoAcc = 0; var tick = ++S.demoTick;
    var P = S.P, st = S.stats, near = null, nd = 1e9, tx = null, ty = null, i;
    for (i = 0; i < S.enemies.length; i++) { var e = S.enemies[i]; if (e.state === 'dead' || (e.camo && !e.rev)) continue; var d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y) * 2; if (d < nd) { nd = d; near = e; } }
    if (near && nd < 460) {
      var dir = near.x < P.x ? 1 : -1; tx = near.x + (near.type === 'spitter' ? 44 : 58) * dir; ty = near.y;
      if (near.state === 'windup' && Math.abs(near.x - P.x) < 130 && P.en >= st.dashCost && P.dashCd <= 0 && tick % 2 === 0) press('dash');
    } else {
      var b = null, bd = 1e9, n = S.nests[0];
      for (i = 0; i < S.bushes.length; i++) if (S.bushes[i].berries > 0) { var bx = Math.abs(S.bushes[i].x - P.x); if (bx < bd) { bd = bx; b = S.bushes[i]; } }
      var pk = null, pd = 1e9; for (i = 0; i < S.pickups.length; i++) { var px = Math.abs(S.pickups[i].x - P.x); if (px < pd) { pd = px; pk = S.pickups[i]; } }
      var sc = demoShow(); if (sc) { tx = sc.x; ty = sc.y; } else if (S.berries < S.obj.berriesNeeded && b) { tx = b.x; ty = b.y; } else if (pk && pd < 260) { tx = pk.x; ty = pk.y; } else if (n) { tx = n.x; ty = n.y; }
    }
    var mx = 0, my = 0;
    if (tx != null) { var dx = tx - P.x, dy = ty - P.y; if (Math.abs(dx) > 14) mx = dx > 0 ? 1 : -1; if (Math.abs(dy) > 8) my = dy > 0 ? 1 : -1; }
    // sidestep rocks: if we are pushing sideways but not moving, drift up or down for a moment
    if (mx !== 0 && Math.abs(P.x - (S.lastX == null ? -99 : S.lastX)) < 3) S.stuck = (S.stuck || 0) + 1; else S.stuck = 0;
    S.lastX = P.x;
    if (S.stuck >= 3 && !S.detour) { S.detour = 16; S.detourDir = P.y > 270 ? -1 : 1; }
    if (S.detour > 0) { my = S.detourDir; S.detour--; if (!S.detour) S.stuck = 0; }
    mv.x = mx; mv.y = my;
    if (near) {
      var ddx = (near.x - P.x) * P.face, ddy = Math.abs(near.y - P.y);
      if (ddx > -10 && ddx < 92 && ddy < 40) { press('attack'); if (P.en >= st.ability.cost && tick % 14 === 0) press('ability'); }
    }
  }

  /* ---------- pickups / objective ---------- */
  function updatePickups(dt) {
    var P = S.P, i, b, p;
    for (i = 0; i < S.bushes.length; i++) {
      b = S.bushes[i]; b.bob += dt / 500;
      if (b.berries > 0 && Math.abs(P.x - b.x) < 46 && Math.abs(P.y - b.y) < 30) {
        b.berries--; var n = 1 + (S.rng.next() < S.stats.foodMul - 1 ? 1 : 0); S.gained.food += n; S.berries++; P.hp = Math.min(P.maxHp, P.hp + 10); if (S.biome === 'frost') S.wx.chill = Math.max(0, S.wx.chill - B.weather.berryWarm);
        float(b.x, b.y - 50, '+' + n + ' Food', '#CFE8B0', false); DF.Audio.sfx('pickup'); burst(b.x, b.y - 24, b.berries > 0 ? '#CFE8B0' : '#BEE6FF', b.berries > 0 ? 6 : 12); if (G.onEvent) G.onEvent('berry');
        if (S.tut && S.tut.step === 1) advanceTut(2);
      }
    }
    for (i = S.bushes.length - 1; i >= 0; i--) { b = S.bushes[i]; if (b.berries <= 0) { b.gone = (b.gone || 0) + dt; if (b.gone > 380) S.bushes.splice(i, 1); } } // eaten food leaves the screen
    for (i = S.pickups.length - 1; i >= 0; i--) {
      p = S.pickups[i]; p.t += dt / 400; var dx = P.x - p.x, dy = P.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) { p.x += dx * Math.min(1, dt / 160); p.y += dy * Math.min(1, dt / 160); }
      if (d < 24) {
        S.pickups.splice(i, 1);
        if (p.type === 'dna') { var dv = p.rare ? B.crater.rareValue : 1; S.gained.dna += dv; float(p.x, p.y - 30, '+' + dv + ' DNA', p.rare ? '#FFE9A8' : '#CDB4F7', false); DF.Audio.sfx('pickup'); }
        else { S.gained.tokens += 5; float(p.x, p.y - 30, '+5', '#F5D27F', false); DF.Audio.sfx('coin'); }
        burst(p.x, p.y, p.type === 'dna' ? '#CDB4F7' : '#F5D27F', 5);
      }
    }
    if (S.crystal && !S.crystal.used) {
      var near = Math.abs(P.x - S.crystal.x) < 200;
      S.crystalHint = Math.max(0, S.crystalHint - dt);
      if (near && S.crystalHint <= 0 && !S.shown.crystal) { S.shown.crystal = true; S.crystalHint = 9000; toast(S.stats.path === 'wildspark' ? 'The Genesis Crystal glows. Use your ability near it.' : DF.S.hud.crystalHint, 'info'); }
    }
  }
  function objectiveReady() { return S.berries >= S.obj.berriesNeeded && (!S.tut || S.tut.step >= 3); }
  /* percent of the current goal completed: trail = half berries, half distance to the nest; boss = damage dealt. Never goes backwards. */
  function goalPct() {
    if (S.tut) return 0;
    var P = S.P, pct, b = S.boss;
    if (b) pct = (S.bossDown || b.state === 'dead') ? 100 : b.state === 'sleep' ? 0 : Math.round(100 * (1 - Math.max(0, b.hp) / b.maxHp));
    else { var n = S.nests[0], need = S.obj.berriesNeeded, fb = need > 0 ? Math.min(1, S.berries / need) : 1, fd = n ? Math.max(0, Math.min(1, (P.x - 250) / Math.max(1, n.x - 60 - 250))) : 0; pct = n && n.done ? 100 : Math.round(100 * (0.5 * fb + 0.5 * fd)); }
    S.maxPct = Math.max(S.maxPct || 0, Math.min(100, pct)); return S.maxPct;
  }
  function updateObjective(dt) {
    var P = S.P;
    // tutorial script
    if (S.tut) {
      var t = S.tut;
      if (t.step === 0 && Math.abs(P.x - S.ferns.x) < 70 && Math.abs(P.y - S.ferns.y) < 60) advanceTut(1);
      if (t.step === 2 && !t.raiderSpawned) {
        t.raiderSpawned = true; var rx = Math.min(S.worldW - 200, S.camX + VW + 40), e = addEnemy('raider', rx, P.y, { state: 'chase', cd: 900 });
        e.hp = e.maxHp = Math.round(e.def.hp * 0.7); t.raider = e; markSeen('raider');
      }
    }
    if (!S.boss && S.nests.length) {
      var n = S.nests[0]; S.eggReady = objectiveReady();
      if (!n.done && Math.abs(P.x - n.x) < 100 && Math.abs(P.y - n.y) < 120) {
        if (!S.eggReady) { if (!S.shown.needB || S.t - S.shown.needB > 3500) { S.shown.needB = S.t; toast(DF.t(DF.S.hud.needBerries, { n: Math.max(1, S.obj.berriesNeeded - S.berries) }), 'info'); DF.Audio.sfx('deny'); } }
        else {
          n.done = true; DF.Audio.sfx('claim'); burst(n.x, n.y - 40, '#F5D27F', 18); ring(n.x, n.y, 110, '#F5D27F');
          if (DF.save.discoveries.eggs.indexOf(n.eggId) < 0 && S.newEggs.indexOf(n.eggId) < 0) { S.newEggs.push(n.eggId); }
          DF.Audio.stinger('08-stinger-egg-discovery'); toast(DF.S.hud.eggFound, 'egg');
          S.ending = 1800; S.endOutcome = 'success';
        }
      }
    }
  }
  function advanceTut(step) {
    var t = S.tut; if (!t || step <= t.step) return; t.step = step; DF.Audio.sfx('claim');
    if (G.onTutorial) G.onTutorial(step);
    DF.save.profile.tutorialStep = step; DF.Store.saveSoon(DF.save, 800);
  }
  function updateCombatMusic(dt) {
    if (S.boss) return;
    var active = false, P = S.P;
    for (var i = 0; i < S.enemies.length; i++) { var e = S.enemies[i]; if (e.state !== 'idle' && e.state !== 'dead' && Math.abs(e.x - P.x) < 460) { active = true; break; } }
    if (active) { S.combatT = 3000; if (!S.combat) { S.combat = true; if (G.onCombat) G.onCombat(true); } }
    else if (S.combat) { S.combatT -= dt; if (S.combatT <= 0) { S.combat = false; if (G.onCombat) G.onCombat(false); } }
  }

  /* ---------- combat feel: hit-stop, impact bursts, slash styles, dust ---------- */
  var DUST = { verdant: '#CDBB8E', ember: '#A8745A', frost: '#EAF5FF', mire: '#93AB7C', crater: '#C4D8FF' };
  function hitStop(ms) { if (!reduced()) S.hitStop = Math.max(S.hitStop || 0, ms); }
  function kick(dx, dy) { if (!reduced()) { S.kickX = dx; S.kickY = dy || 0; } }
  function dust(x, y, n, size, dir) {
    if (reduced()) n = Math.ceil(n / 2);
    for (var i = 0; i < n && S.parts.length < 150; i++) S.parts.push({ fx: 'dust', x: x + (Math.random() - 0.5) * 14, y: y - Math.random() * 4, vx: (dir || 0) * (20 + Math.random() * 40) + (Math.random() - 0.5) * 36, vy: -8 - Math.random() * 22, t: 0, life: 380 + Math.random() * 280, c: DUST[S.biome] || DUST.verdant, r: size * (0.7 + Math.random() * 0.6) });
  }
  /* power: 1 normal hit, 1.7 crit, 2.4 kill. Starburst plus sparks thrown away from the attacker. */
  function impact(x, y, dirx, power, color) {
    var i, n = reduced() ? 3 : Math.round(6 * power + 2);
    S.parts.push({ fx: 'star', x: x, y: y, t: 0, life: 150 + power * 40, r: 20 * power + 10, c: color || '#FFFFFF', rot: Math.random() * 3 });
    for (i = 0; i < n && S.parts.length < 160; i++) { var a = (dirx > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 2.0, sp = 200 + Math.random() * 260 * power; S.parts.push({ fx: 'streak', x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, t: 0, life: 200 + Math.random() * 160, c: Math.random() < 0.5 ? '#FFFFFF' : (color || '#FFD9A0'), len: 9 + Math.random() * 12 * power }); }
  }
  /* each evolution swings differently: Swiftclaw rakes three claw lines, Ironhide a heavy crescent, Wildspark a crackling bolt */
  function slashFx(P) {
    var path = S.stats.path, cfg = path === 'ironhide' ? { c1: '#FFF1CF', c2: '#E8B54A', th: 24, life: 290, kind: 'arc' } : path === 'wildspark' ? { c1: '#F6EDFF', c2: '#B58CFF', th: 14, life: 250, kind: 'bolt' } : path === 'swiftclaw' ? { c1: '#EFFFFC', c2: '#4FD1C5', th: 9, life: 210, kind: 'claw' } : { c1: '#FFFFFF', c2: '#F3EBD7', th: 15, life: 240, kind: 'arc' };
    S.parts.push({ fx: 'slash', x: P.x + P.face * 6, y: P.y - 22, face: P.face, t: 0, life: cfg.life, len: B.player.attackRange + 6, cfg: cfg });
  }
  function enemySlash(e) { S.parts.push({ fx: 'slash', x: e.x + e.face * 8, y: e.y - 24, face: e.face, t: 0, life: 220, len: 58, cfg: { c1: '#FFE3DA', c2: '#E5534B', th: 14, life: 220, kind: 'arc' } }); }
  function strike() {
    var P = S.P, st = S.stats, range = B.player.attackRange, hit = false, list = S.enemies.concat(S.boss ? [S.boss] : []);
    for (var i = 0; i < list.length; i++) {
      var e = list[i]; if (e.state === 'dead') continue;
      var dx = (e.x - P.x) * P.face, dy = Math.abs(e.y - P.y), reach = range + (e.kind === 'boss' ? 70 : 28);
      if (dx > -14 && dx < reach && dy < B.player.attackDepth + (e.kind === 'boss' ? 14 : 0)) { hurtEnemy(e, st.attackPower, true); hit = true; }
    }
    slashFx(P);
    dust(P.x - P.face * 14, P.y + 3, hit ? 2 : 3, 6, -P.face);
    if (st.path === 'ironhide') { ring(P.x + P.face * 46, P.y + 2, 74, '#E8B54A'); shake(hit ? 0 : 1.5); }
    return hit;
  }

  /* ---------- effects ---------- */
  function shake(a) { if (!reduced()) S.shake = Math.max(S.shake, a); }
  function float(x, y, txt, color, big) { if (S.texts.length < 24) S.texts.push({ x: x, y: y, txt: txt, color: color, t: 0, big: big }); }
  function spark(x, y, color, n) { burst(x, y, color, n); }
  function burst(x, y, color, n) {
    n = reduced() ? Math.ceil(n / 3) : n;
    for (var i = 0; i < n && S.parts.length < 140; i++) { var a = Math.random() * 6.28, s = 40 + Math.random() * 110; S.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0, life: 380 + Math.random() * 300, c: color, r: 1.6 + Math.random() * 2.2 }); }
  }
  function ring(x, y, r, color) { S.parts.push({ ring: true, x: x, y: y, r: 10, max: r, t: 0, life: 460, c: color }); }
  function updateEffects(dt) {
    var i, p;
    for (i = S.parts.length - 1; i >= 0; i--) {
      p = S.parts[i]; p.t += dt; if (p.t >= p.life) { S.parts.splice(i, 1); continue; }
      if (p.ring) p.r = 10 + (p.max - 10) * (p.t / p.life); else if (p.fx === 'slash' || p.fx === 'star' || p.slash) { /* fixed in place */ } else { p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; if (p.fx === 'dust') { p.vx *= 0.97; p.vy *= 0.97; } else if (p.fx === 'streak') { p.vx *= 0.9; p.vy *= 0.9; } else if (!p.ember && !p.snow) p.vy += 260 * dt / 1000; }
    }
    for (i = S.texts.length - 1; i >= 0; i--) { p = S.texts[i]; p.t += dt; p.y -= 24 * dt / 1000; if (p.t > 900) S.texts.splice(i, 1); }
    S.shake = Math.max(0, S.shake - dt / 40); if (S.kickX) { S.kickX *= Math.pow(0.8, dt / 16.6); if (Math.abs(S.kickX) < 0.1) S.kickX = 0; } S.hurtFlash = Math.max(0, S.hurtFlash - dt);
    // enemy corpses fade
    for (i = S.enemies.length - 1; i >= 0; i--) if (S.enemies[i].state === 'dead' && S.enemies[i].dead > 700) S.enemies.splice(i, 1);
  }

  /* ---------- end of run ---------- */
  function finish(outcome) {
    if (S.ended) return; S.ended = true;
    var res = { outcome: outcome, objectiveId: S.objId, tutorial: S.tut != null, runId: S.runId, gained: { food: S.gained.food, dna: S.gained.dna, tokens: S.gained.tokens, xp: S.gained.xp }, kills: S.kills, dodges: S.dodges, berries: S.berries, abilities: S.abilitiesUsed, newEggs: S.newEggs.slice(), seen: Object.keys(S.seen), bossDown: !!S.bossDown, bossId: S.bossDef ? S.bossDef.id : '', timeToFirst: S.timeToFirst, duration: S.t };
    running = true; paused = true;
    if (G.onEnd) G.onEnd(res);
  }
  G.quitRun = function () { running = false; paused = true; cancelAnimationFrame(raf); };
  G.snapshot = function () {
    if (!S) return null; var P = S.P, st = S.stats, o = S.obj, b = S.boss;
    var abReady = P.en >= st.ability.cost, dashReady = P.en >= st.dashCost;
    return { pct: goalPct(), hp: Math.max(0, Math.round(P.hp)), maxHp: P.maxHp, en: Math.floor(P.en), maxEn: P.maxEn, food: S.gained.food, dna: S.gained.dna, tokens: S.gained.tokens, berries: S.berries, need: o.berriesNeeded, objId: S.objId, tutorial: !!S.tut, dashCost: st.dashCost, abCost: st.ability.cost, abName: st.ability.name, dashOk: dashReady, abOk: abReady, abCd: P.abCd, dashCd: P.dashCd, boss: b && b.state !== 'sleep' ? { hp: Math.max(0, b.hp), max: b.maxHp, name: S.bossDef.name, hint: bossHint(b) } : null, eggReady: S.eggReady, tutStep: S.tut ? S.tut.step : -1, abilitiesUsed: S.abilitiesUsed, chill: S.biome === 'frost' ? Math.round(S.wx.chill) : -1, storm: S.biome === 'frost' ? S.wx.state : '', stormT: S.biome === 'frost' ? Math.ceil(S.wx.t / 1000) : 0, cold: !!S.cold, poison: S.biome === 'mire' ? Math.ceil(S.poison / 1000) : 0, reveal: S.reveal > 0, combat: S.combat, kills: S.kills.total || 0, t: S.t };
  };

  /* ---------- rendering ---------- */
  function render() {
    if (!S) return;
    cx.setTransform(ratio, 0, 0, ratio, 0, 0);
    var sx = 0, sy = 0; if (S.shake > 0) { sx = (Math.random() - 0.5) * S.shake * 2; sy = (Math.random() - 0.5) * S.shake; }
    if (S.kickX) { sx += S.kickX; sy += S.kickY || 0; } // directional camera kick on a big hit
    cx.save(); cx.translate(sx, sy);
    drawBackdrop(); drawGround();
    var list = [], i;
    for (i = 0; i < S.rocks.length; i++) list.push({ y: S.rocks[i].y, o: S.rocks[i], k: 'rock' });
    for (i = 0; i < S.bushes.length; i++) list.push({ y: S.bushes[i].y, o: S.bushes[i], k: 'bush' });
    for (i = 0; i < S.nests.length; i++) list.push({ y: S.nests[i].y, o: S.nests[i], k: 'nest' });
    if (S.crystal) list.push({ y: S.crystal.y, o: S.crystal, k: 'crystal' });
    if (S.ferns && S.tut.step === 0) list.push({ y: S.ferns.y, o: S.ferns, k: 'ferns' });
    for (i = 0; i < S.pickups.length; i++) list.push({ y: S.pickups[i].y, o: S.pickups[i], k: 'pick' });
    for (i = 0; i < S.hz.vents.length; i++) list.push({ y: S.hz.vents[i].y, o: S.hz.vents[i], k: 'vent' });
    for (i = 0; i < S.hz.fires.length; i++) list.push({ y: S.hz.fires[i].y, o: S.hz.fires[i], k: 'fire' });
    for (i = 0; i < S.hz.glow.length; i++) list.push({ y: S.hz.glow[i].y, o: S.hz.glow[i], k: 'glow' });
    for (i = 0; i < S.enemies.length; i++) list.push({ y: S.enemies[i].y, o: S.enemies[i], k: 'enemy' });
    if (S.boss) list.push({ y: S.boss.y, o: S.boss, k: 'boss' });
    list.push({ y: S.P.y, o: S.P, k: 'player' });
    list.sort(function (a, b) { return a.y - b.y; });
    cx.translate(-S.camX, 0);
    drawIce();
    drawBogs();
    drawFields();
    drawPools();
    for (i = 0; i < list.length; i++) {
      var it = list[i]; if (it.o.x < S.camX - 260 || it.o.x > S.camX + VW + 260) continue;
      switch (it.k) { case 'rock': dRock(it.o); break; case 'bush': dBush(it.o); break; case 'nest': dNest(it.o); break; case 'crystal': dCrystal(it.o); break; case 'ferns': dFerns(it.o); break; case 'pick': dPick(it.o); break; case 'enemy': dEnemy(it.o); break; case 'boss': dBoss(it.o); break; case 'player': dPlayer(it.o); break; case 'vent': dVent(it.o); break; case 'fire': dFire(it.o); break; case 'glow': dGlow(it.o); break; }
    }
    drawProjectiles(); drawFx(); drawMarker();
    cx.restore();
    // overlays
    if (S.hurtFlash > 0) { cx.fillStyle = 'rgba(229,83,75,' + (0.28 * S.hurtFlash / 260) + ')'; cx.fillRect(0, 0, VW, VH); }
    var vg = cx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VW * 0.62); vg.addColorStop(0, 'rgba(6,10,8,0)'); vg.addColorStop(1, 'rgba(6,10,8,0.5)'); cx.fillStyle = vg; cx.fillRect(0, 0, VW, VH);
    if (S.biome === 'frost') { var sa = S.wx.state === 'storm' ? 0.3 : S.wx.state === 'warn' ? 0.12 : 0; if (sa) { cx.fillStyle = 'rgba(225,240,255,' + sa + ')'; cx.fillRect(0, 0, VW, VH); } if (S.cold) { cx.fillStyle = 'rgba(110,170,255,0.18)'; cx.fillRect(0, 0, VW, VH); } }
    if (S.biome === 'mire') { cx.fillStyle = 'rgba(20,70,55,0.2)'; cx.fillRect(0, 0, VW, VH); if (S.poison > 0) { cx.fillStyle = 'rgba(130,210,50,0.14)'; cx.fillRect(0, 0, VW, VH); } }
    if (S.ending > 0 && S.endOutcome === 'defeat') { cx.fillStyle = 'rgba(6,10,8,' + Math.min(0.7, (900 - S.ending) / 900) + ')'; cx.fillRect(0, 0, VW, VH); }
  }
  function drawBackdrop() {
    var img = A.img(S.obj.bg), tw = 1180, th = tw * img.height / img.width, y = -(th - VH) * 0.5 - 18, shift = S.camX * 0.28;
    var start = Math.floor(shift / tw);
    for (var i = start; i <= start + 1; i++) {
      cx.save(); var x = i * tw - shift;
      if (i % 2 !== 0) { cx.translate(x + tw, 0); cx.scale(-1, 1); cx.drawImage(img, 0, y, tw, th); } else cx.drawImage(img, x, y, tw, th);
      cx.restore();
    }
    cx.fillStyle = 'rgba(14,23,18,0.18)'; cx.fillRect(0, 0, VW, VH);
    if (S.biome === 'ember') { cx.fillStyle = 'rgba(170,45,0,0.26)'; cx.fillRect(0, 0, VW, VH); }
    else if (S.biome === 'frost') { cx.fillStyle = 'rgba(140,185,235,0.16)'; cx.fillRect(0, 0, VW, VH); }
    else if (S.biome === 'mire') { cx.fillStyle = 'rgba(10,40,34,0.3)'; cx.fillRect(0, 0, VW, VH); }
    else if (S.biome === 'crater') { cx.fillStyle = 'rgba(20,30,90,0.26)'; cx.fillRect(0, 0, VW, VH); }
  }
  function drawGround() {
    var g = cx.createLinearGradient(0, 140, 0, VH); g.addColorStop(0, 'rgba(14,30,20,0)'); g.addColorStop(0.35, 'rgba(18,40,24,0.55)'); g.addColorStop(1, 'rgba(10,24,14,0.82)');
    cx.fillStyle = g; cx.fillRect(0, 140, VW, VH - 140);
    // grass tufts (world-anchored)
    cx.strokeStyle = 'rgba(120,180,90,0.45)'; cx.lineWidth = 1.4; cx.beginPath();
    var first = Math.floor(S.camX / 46) - 1;
    for (var i = first; i < first + VW / 46 + 3; i++) {
      var h = Math.sin(i * 12.9898) * 43758.5453; h -= Math.floor(h); var gx = i * 46 - S.camX + h * 30, gy = 200 + (Math.sin(i * 78.233) * 43758.5453 % 1 + 1) % 1 * 160;
      cx.moveTo(gx, gy); cx.lineTo(gx - 3, gy - 9); cx.moveTo(gx, gy); cx.lineTo(gx + 1, gy - 11); cx.moveTo(gx, gy); cx.lineTo(gx + 4, gy - 8);
    }
    cx.stroke();
  }
  function drawPools() {
    for (var i = 0; i < S.hz.pools.length; i++) {
      var p = S.hz.pools[i]; if (p.x < S.camX - 140 || p.x > S.camX + VW + 140) continue;
      var a = 0.78 + 0.22 * Math.sin(S.t / 320 + p.ph);
      cx.save(); cx.translate(p.x, p.y); cx.scale(1, p.ry / p.rx);
      var g = cx.createRadialGradient(0, 0, 4, 0, 0, p.rx); g.addColorStop(0, 'rgba(255,225,110,' + a + ')'); g.addColorStop(0.42, 'rgba(255,112,32,.92)'); g.addColorStop(1, 'rgba(80,14,6,.9)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, p.rx, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(40,8,4,.75)'; cx.lineWidth = 5; cx.stroke(); cx.restore();
      cx.fillStyle = 'rgba(255,236,160,.8)';
      for (var k = 0; k < 3; k++) { var ph = (S.t / 700 + p.ph + k * 2.1) % 1, bx = p.x + Math.sin(k * 3 + p.ph) * p.rx * 0.5, by = p.y - ph * 14; cx.globalAlpha = 1 - ph; cx.beginPath(); cx.arc(bx, by, 1.5 + ph * 2, 0, 7); cx.fill(); }
      cx.globalAlpha = 1;
    }
  }
  function dVent(v) {
    var H = B.hazards; if (v.x < S.camX - 100 || v.x > S.camX + VW + 100) return;
    cx.fillStyle = 'rgba(25,8,4,.85)'; cx.beginPath(); cx.ellipse(v.x, v.y, 30, 9, 0, 0, 7); cx.fill();
    var glow = v.state === 'warn' ? 0.35 + 0.5 * Math.abs(Math.sin(S.t / 70)) : v.state === 'burst' ? 1 : 0.18 + 0.1 * Math.sin(S.t / 400 + v.x);
    var g = cx.createRadialGradient(v.x, v.y, 2, v.x, v.y, 30); g.addColorStop(0, 'rgba(255,170,60,' + glow + ')'); g.addColorStop(1, 'rgba(255,90,20,0)');
    cx.fillStyle = g; cx.beginPath(); cx.ellipse(v.x, v.y, 34, 12, 0, 0, 7); cx.fill();
    if (v.state === 'warn') { // danger ring shows where the eruption will reach
      cx.strokeStyle = 'rgba(255,208,102,' + (0.55 + 0.4 * Math.sin(S.t / 60)) + ')'; cx.lineWidth = 2; cx.setLineDash([5, 4]); cx.beginPath(); cx.ellipse(v.x, v.y, H.ventRx, H.ventRy * 0.45, 0, 0, 7); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = '#FFD166'; cx.font = '900 16px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('!', v.x, v.y - 20);
    }
    if (v.state === 'burst') {
      var k = Math.min(1, 1.2 - v.t / H.ventBurst), h = 130 * (0.55 + 0.45 * Math.sin(Math.min(1, k) * 3.1)), w = 26 + 14 * Math.sin(S.t / 40);
      var cg = cx.createLinearGradient(0, v.y - h, 0, v.y); cg.addColorStop(0, 'rgba(255,230,140,0)'); cg.addColorStop(0.35, 'rgba(255,170,50,.85)'); cg.addColorStop(1, 'rgba(255,70,20,.95)');
      cx.fillStyle = cg; cx.beginPath(); cx.moveTo(v.x - w, v.y); cx.quadraticCurveTo(v.x - w * 0.4, v.y - h * 0.6, v.x + Math.sin(S.t / 30) * 8, v.y - h); cx.quadraticCurveTo(v.x + w * 0.4, v.y - h * 0.6, v.x + w, v.y); cx.closePath(); cx.fill();
    }
  }
  function drawIce() {
    for (var i = 0; i < S.hz.ice.length; i++) {
      var p = S.hz.ice[i]; if (p.x < S.camX - 180 || p.x > S.camX + VW + 180) continue;
      cx.save(); cx.translate(p.x, p.y); cx.scale(1, p.ry / p.rx);
      var g = cx.createRadialGradient(-p.rx * 0.2, -p.rx * 0.15, 4, 0, 0, p.rx); g.addColorStop(0, 'rgba(235,248,255,.82)'); g.addColorStop(0.6, 'rgba(150,205,245,.62)'); g.addColorStop(1, 'rgba(90,150,215,.45)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, p.rx, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 3; cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-p.rx * 0.5, -p.rx * 0.1); cx.lineTo(-p.rx * 0.15, -p.rx * 0.32); cx.moveTo(p.rx * 0.1, p.rx * 0.2); cx.lineTo(p.rx * 0.5, p.rx * 0.05); cx.stroke();
      cx.restore();
    }
  }
  function dFire(f) {
    if (f.x < S.camX - 160 || f.x > S.camX + VW + 160) return;
    var t = S.t / 110 + f.x, R = B.weather.fireRadius;
    var gl = cx.createRadialGradient(f.x, f.y - 14, 4, f.x, f.y - 14, R); gl.addColorStop(0, 'rgba(255,170,70,.26)'); gl.addColorStop(1, 'rgba(255,170,70,0)');
    cx.fillStyle = gl; cx.beginPath(); cx.ellipse(f.x, f.y - 8, R, 62, 0, 0, 7); cx.fill();
    shadow(f.x, f.y + 3, 60, 0.3);
    cx.fillStyle = '#4A2E1A'; cx.fillRect(f.x - 24, f.y - 6, 48, 8); cx.fillStyle = '#6B4426'; cx.fillRect(f.x - 18, f.y - 11, 36, 6);
    var h = 36 + 7 * Math.sin(t), g = cx.createLinearGradient(0, f.y - 10 - h, 0, f.y - 6); g.addColorStop(0, 'rgba(255,235,150,0)'); g.addColorStop(0.45, 'rgba(255,175,55,.92)'); g.addColorStop(1, 'rgba(255,90,25,.96)');
    cx.fillStyle = g; cx.beginPath(); cx.moveTo(f.x - 17, f.y - 8); cx.quadraticCurveTo(f.x - 9, f.y - 8 - h * 0.7, f.x + Math.sin(t * 1.3) * 5, f.y - 10 - h); cx.quadraticCurveTo(f.x + 11, f.y - 8 - h * 0.6, f.x + 17, f.y - 8); cx.closePath(); cx.fill();
  }
  function drawBogs() {
    for (var i = 0; i < S.hz.bogs.length; i++) {
      var p = S.hz.bogs[i]; if (p.x < S.camX - 160 || p.x > S.camX + VW + 160) continue;
      var a = 0.8 + 0.15 * Math.sin(S.t / 380 + p.ph);
      cx.save(); cx.translate(p.x, p.y); cx.scale(1, p.ry / p.rx);
      var g = cx.createRadialGradient(0, 0, 4, 0, 0, p.rx); g.addColorStop(0, 'rgba(170,230,70,' + a + ')'); g.addColorStop(0.55, 'rgba(70,150,50,.9)'); g.addColorStop(1, 'rgba(20,48,30,.92)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, p.rx, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(12,30,18,.8)'; cx.lineWidth = 5; cx.stroke(); cx.restore();
      cx.fillStyle = 'rgba(210,255,150,.8)';
      for (var k = 0; k < 3; k++) { var ph = (S.t / 900 + p.ph + k * 2.3) % 1, bx = p.x + Math.sin(k * 3 + p.ph) * p.rx * 0.5, by = p.y - ph * 16; cx.globalAlpha = 1 - ph; cx.beginPath(); cx.arc(bx, by, 1.5 + ph * 2.4, 0, 7); cx.fill(); }
      cx.globalAlpha = 1;
    }
  }
  function dGlow(g) {
    if (g.x < S.camX - 120 || g.x > S.camX + VW + 120) return;
    var t = S.t / 400 + g.x, on = !g.used, pulse = on ? 0.75 + 0.25 * Math.sin(t) : 0.25;
    shadow(g.x, g.y + 3, 34, 0.3);
    if (on) { var gl = cx.createRadialGradient(g.x, g.y - 20, 3, g.x, g.y - 20, 70); gl.addColorStop(0, 'rgba(160,255,200,' + 0.42 * pulse + ')'); gl.addColorStop(1, 'rgba(160,255,200,0)'); cx.fillStyle = gl; cx.beginPath(); cx.arc(g.x, g.y - 20, 70, 0, 7); cx.fill(); }
    cx.fillStyle = on ? '#E8FFF0' : '#6F8A7C'; cx.fillRect(g.x - 3, g.y - 22, 6, 22);
    cx.fillStyle = on ? 'rgba(120,255,190,' + pulse + ')' : '#4B6358'; cx.beginPath(); cx.ellipse(g.x, g.y - 26, 22, 14, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = on ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.25)'; cx.beginPath(); cx.arc(g.x - 8, g.y - 31, 2.4, 0, 7); cx.arc(g.x + 6, g.y - 29, 2, 0, 7); cx.fill();
  }
  function drawFields() {
    for (var i = 0; i < S.hz.fields.length; i++) {
      var f = S.hz.fields[i]; if (f.x < S.camX - 160 || f.x > S.camX + VW + 160) continue;
      var warn = f.state === 'warn', zap = f.state === 'zap', pulse = warn ? 0.5 + 0.4 * Math.sin(S.t / 55) : 0;
      cx.save(); cx.translate(f.x, f.y); cx.scale(1, f.ry / f.rx);
      var g = cx.createRadialGradient(0, 0, 4, 0, 0, f.rx);
      if (zap) { g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.5, 'rgba(140,220,255,.8)'); g.addColorStop(1, 'rgba(70,140,255,.5)'); }
      else { g.addColorStop(0, 'rgba(160,225,255,' + (0.12 + pulse * 0.3) + ')'); g.addColorStop(1, 'rgba(245,210,127,' + (0.1 + pulse * 0.3) + ')'); }
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, f.rx, 0, 7); cx.fill();
      cx.strokeStyle = zap ? 'rgba(255,255,255,.95)' : warn ? 'rgba(255,230,140,' + (0.6 + pulse * 0.4) + ')' : 'rgba(160,225,255,.45)'; cx.lineWidth = warn || zap ? 5 : 3; if (!warn && !zap) cx.setLineDash([12, 9]); cx.stroke(); cx.setLineDash([]); cx.restore();
      if (zap) { cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = 3; cx.beginPath(); for (var k = 0; k < 3; k++) { var bx = f.x + (k - 1) * f.rx * 0.45, y0 = f.y - 70; cx.moveTo(bx, y0); cx.lineTo(bx + 9, y0 + 26); cx.lineTo(bx - 7, y0 + 38); cx.lineTo(bx + 6, f.y); } cx.stroke(); }
    }
  }
  function dRock(k) {
    var x = k.x, y = k.y, i, a, r, px, py;
    shadow(x, y + k.ry * 0.7, k.rx * 2.1, 0.3);
    // irregular boulder outline, stable per rock (seeded)
    var pts = [], n = 9, H = k.ry * 3.2;
    for (i = 0; i < n; i++) { a = i / n * 6.283; r = 0.82 + 0.28 * Math.sin(k.seed * 40 + i * 2.3) * Math.cos(i * 1.7 + k.seed * 9); pts.push([x + Math.cos(a) * k.rx * r * 0.95, y - H * 0.42 + Math.sin(a) * H * 0.5 * r]); }
    var g = cx.createLinearGradient(x - k.rx, y - H, x + k.rx, y); g.addColorStop(0, '#8B947F'); g.addColorStop(0.55, '#586354'); g.addColorStop(1, '#2F382E');
    cx.fillStyle = g; cx.beginPath(); cx.moveTo(pts[0][0], pts[0][1]); for (i = 1; i < n; i++) cx.lineTo(pts[i][0], pts[i][1]); cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(20,28,20,.6)'; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = 'rgba(120,178,84,.65)'; cx.beginPath();
    for (i = 0; i < 6; i++) { a = 3.3 + i * 0.5; px = x - k.rx * 0.1 + Math.cos(a) * k.rx * (0.55 + (i % 2) * 0.12); py = y - H * 0.68 + Math.sin(a) * H * 0.26; if (i) cx.lineTo(px, py); else cx.moveTo(px, py); }
    cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,.12)'; cx.beginPath(); cx.moveTo(x - k.rx * 0.5, y - H * 0.5); cx.lineTo(x - k.rx * 0.15, y - H * 0.78); cx.stroke();
  }
  function dBush(b) {
    var gone = b.berries <= 0 ? Math.min(1, (b.gone || 0) / 380) : 0, part = b.max > 1 ? 0.72 + 0.28 * Math.max(0, b.berries) / b.max : 1; // shrinks as portions are eaten, then pops away
    shadow(b.x, b.y + 2, 70 * part, 0.3 * (1 - gone));
    draw('prop-berry-bush', 84, b.x, b.y, { feet: 0.97, alpha: 1 - gone, sx: part * (1 - 0.35 * gone), sy: part * (1 - 0.5 * gone) + (b.berries > 0 ? 0.02 * Math.sin(b.bob) : 0) }); // the owner's glowing mushrooms
    if (b.berries > 0) { var a = 0.5 + 0.5 * Math.sin(b.bob), gl = cx.createRadialGradient(b.x, b.y - 34, 4, b.x, b.y - 34, 52); gl.addColorStop(0, 'rgba(190,230,255,' + (0.3 * a + 0.08) + ')'); gl.addColorStop(1, 'rgba(190,230,255,0)'); cx.fillStyle = gl; cx.beginPath(); cx.ellipse(b.x, b.y - 34, 52, 44, 0, 0, 7); cx.fill(); }
  }
  function dNest(n) {
    shadow(n.x, n.y + 2, 84, 0.35);
    draw(n.eggId === 'glade' ? 'egg-glade' : n.eggId === 'ember' ? 'egg-ember' : n.eggId === 'frost' ? 'egg-frost' : n.eggId === 'mire' ? 'egg-mire' : n.eggId === 'genesis' ? 'egg-genesis' : 'egg', 86, n.x, n.y, { feet: 0.97 });
    if (!S.eggReady && !n.done && Math.abs(S.P.x - n.x) < 340 && (!S.tut || S.tut.step >= 3)) {
      var left = Math.max(1, S.obj.berriesNeeded - S.berries), msg = DF.t(DF.S.hud.needBerriesHint, { n: left, s: left === 1 ? 'berry' : 'berries' });
      cx.font = '800 13px system-ui, sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 4; cx.strokeStyle = 'rgba(14,23,18,.95)'; cx.strokeText(msg, n.x, n.y - 104); cx.fillStyle = '#F5D27F'; cx.fillText(msg, n.x, n.y - 104);
    }
    if (S.eggReady && !n.done) { var a = 0.5 + 0.5 * Math.sin(S.t / 260); var g = cx.createRadialGradient(n.x, n.y - 30, 6, n.x, n.y - 30, 70); g.addColorStop(0, 'rgba(245,210,127,' + (0.45 * a + 0.2) + ')'); g.addColorStop(1, 'rgba(245,210,127,0)'); cx.fillStyle = g; cx.fillRect(n.x - 80, n.y - 110, 160, 130); }
  }
  function dCrystal(c) {
    shadow(c.x, c.y + 2, 92, 0.3);
    var a = 0.5 + 0.5 * Math.sin(S.t / 500), g = cx.createRadialGradient(c.x, c.y - 50, 8, c.x, c.y - 50, c.used ? 120 : 80); g.addColorStop(0, 'rgba(120,230,255,' + (c.used ? 0.5 : 0.18 + a * 0.12) + ')'); g.addColorStop(1, 'rgba(120,230,255,0)');
    cx.fillStyle = g; cx.fillRect(c.x - 130, c.y - 180, 260, 220);
    draw('prop-genesis-crystal', 112, c.x, c.y, { feet: 0.97, alpha: c.used ? 1 : 0.92 });
  }
  function dFerns(f) {
    var a = 0.5 + 0.5 * Math.sin(S.t / 350), g = cx.createRadialGradient(f.x, f.y - 20, 4, f.x, f.y - 20, 90); g.addColorStop(0, 'rgba(160,255,150,' + (0.35 + a * 0.2) + ')'); g.addColorStop(1, 'rgba(160,255,150,0)');
    cx.fillStyle = g; cx.fillRect(f.x - 100, f.y - 120, 200, 160);
    cx.strokeStyle = '#7EE06B'; cx.lineWidth = 3; cx.lineCap = 'round';
    for (var i = 0; i < 7; i++) { var ang = -2.6 + i * 0.37, len = 46 + (i % 3) * 10 + Math.sin(S.t / 600 + i) * 3; cx.beginPath(); cx.moveTo(f.x, f.y); cx.quadraticCurveTo(f.x + Math.cos(ang) * len * 0.6, f.y + Math.sin(ang) * len * 1.1, f.x + Math.cos(ang) * len, f.y + Math.sin(ang) * len * 0.8); cx.stroke(); }
    cx.fillStyle = 'rgba(232,181,74,0.95)'; cx.font = '800 11px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('TRAIL', f.x, f.y - 100 + Math.sin(S.t / 300) * 3);
  }
  function dPick(p) {
    var bob = Math.sin(p.t) * 4, dna = p.type === 'dna', ic = A.img(dna ? 'dna' : 'icon-token'), pw = dna ? (p.rare ? 50 : 34) : 26, ph = dna && ic.naturalWidth ? pw * ic.naturalHeight / ic.naturalWidth : 26;
    shadow(p.x, p.y + 4, 26, 0.3);
    if (p.rare) { var rg = cx.createRadialGradient(p.x, p.y - 20, 3, p.x, p.y - 20, 42); rg.addColorStop(0, 'rgba(255,235,160,' + (0.5 + 0.2 * Math.sin(p.t * 2)) + ')'); rg.addColorStop(1, 'rgba(255,235,160,0)'); cx.fillStyle = rg; cx.beginPath(); cx.arc(p.x, p.y - 20, 42, 0, 7); cx.fill(); }
    cx.drawImage(ic, p.x - pw / 2, p.y - 6 - ph + bob, pw, ph);
  }
  function drawFlash(name, w, x, y, o, e) {
    if (e.hitFlash > 0) { o.tint = '#FFFFFF'; o.tintA = 0.75; }
    else if (e.state === 'windup') { var a = 0.35 + 0.35 * Math.sin(S.t / 40); o.tint = e.type === 'spitter' ? '#9BE070' : '#FFD166'; o.tintA = a; }
    else if (S.biome === 'ember') { o.tint = '#FF7A2E'; o.tintA = 0.16; } // ember-touched
    else if (S.biome === 'frost') { o.tint = '#8FD0FF'; o.tintA = 0.18; } // frost-touched
    else if (S.biome === 'mire') { o.tint = '#7BE0A8'; o.tintA = 0.16; } // mire-touched
    else if (S.biome === 'crater') { o.tint = '#9FC8FF'; o.tintA = 0.14; } // crater-touched
    draw(name, w, x, y, o);
  }
  function dEnemy(e) {
    var d = e.def, w = d.size * S.formScale, sc = sprite(d.sprite, w), hh = sc.height / sc.width * w, a = 1, dead = e.state === 'dead';
    var run = (e.state === 'chase' || (e.state === 'recover' && e.type === 'skimmer')) ? 1 : 0, ph = S.t / 95 + e.id * 1.7, stp = Math.sin(ph);
    var bob = e.state === 'idle' ? Math.sin(e.wob) * 1.5 : -Math.abs(stp) * 3 * run + Math.sin(S.t / 700 + e.id) * 0.8 * (1 - run);
    var rot = 0.06 * run + stp * 0.014 * run, sx = 1, sy = 1 + 0.015 * Math.sin(S.t / 640 + e.id), skew = 0.05 * run * Math.sin(ph - 0.9), lean = 0;
    if (e.state === 'windup') { var pr = 1 - e.t / d.windup; rot = -0.14 * pr; sy = 1 - 0.07 * pr; sx = 1 + 0.03 * pr; lean = -e.face * 7 * pr; } // rears back before it strikes
    else if (e.state === 'attack') { rot = 0.22; sx = 1.14; sy = 0.92; lean = 6 * e.face; }
    else if (e.state === 'recover') { rot = 0.04; sy = 0.97; }
    else if (e.state === 'stun') { skew = Math.sin(S.t / 45) * 0.09; rot = -0.05; }
    if (e.hitT > 0) { var hq = e.hitT / 160; sx *= 1 + 0.12 * hq; sy *= 1 - 0.1 * hq; rot += (e.hitDir === e.face ? 0.12 : -0.14) * hq; } // squash and recoil on a hit
    if (dead) { var ease = 1 - Math.pow(1 - Math.min(1, e.dead / 380), 3); rot = (e.hitDir === e.face ? 1 : -1) * 1.25 * ease; sy = 1 - 0.12 * ease; sx = 1; skew = 0; lean = 0; bob = 0; a = e.dead < 330 ? 1 : Math.max(0, 1 - (e.dead - 330) / 370); } // topples, then fades
    else if (e.camo && !e.rev) a = 0.1 + 0.05 * Math.sin(S.t / 260 + e.id); // camouflaged: almost invisible, only a faint ripple gives it away
    shadow(e.x, e.y + 2, w * 0.8 * (1 + bob * 0.01), 0.35 * a);
    if (e.camo && !e.rev) { cx.strokeStyle = 'rgba(160,255,210,' + (0.25 + 0.2 * Math.sin(S.t / 300 + e.id)) + ')'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(e.x, e.y + 3, w * 0.55, 8, 0, 0, 7); cx.stroke(); }
    if (e.state === 'windup') drawEnemyTelegraph(e, d); // the danger lane shows where the lunge will land
    drawFlash(d.sprite, w, e.x + lean, e.y + bob, { flip: e.face < 0, alpha: a, feet: 0.97, rot: rot, sx: sx, sy: sy, skew: skew }, e);
    if (!dead) {
      if (e.state === 'windup') { cx.fillStyle = '#FFD166'; cx.font = '900 18px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('!', e.x, e.y - hh - 6); }
      if (e.state === 'stun') { cx.fillStyle = '#9FE7DF'; cx.font = '800 12px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('✦ ✦', e.x, e.y - hh - 6); }
      if (e.state === 'recover') { cx.fillStyle = 'rgba(255,255,255,.85)'; cx.font = '800 10px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('OPEN', e.x, e.y - hh - 6); }
      if (e.hp < e.maxHp) { var bw = 44, bx = e.x - bw / 2, by = e.y - hh - 2; cx.fillStyle = 'rgba(14,23,18,.8)'; cx.fillRect(bx - 1, by - 1, bw + 2, 6); cx.fillStyle = '#E5534B'; cx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 4); }
    }
  }
  function dBoss(b) {
    var def = S.bossDef, bw = def.size * S.formScale, bsc = sprite(def.sprite, bw), bhh = bsc.height / bsc.width * bw, a = b.state === 'dead' ? Math.max(0, 1 - (b.dead = (b.dead || 0) + 16) / 1400) : 1;
    shadow(b.x, b.y + 4, bw * 0.9, 0.4 * a);
    // telegraph lane
    if (b.state === 'windup' && b.atk === 'charge') { cx.fillStyle = 'rgba(229,83,75,' + (0.28 + 0.12 * Math.sin(S.t / 60)) + ')'; var lx = b.dirx > 0 ? b.x : b.x - 900; cx.fillRect(lx, b.y - 26, 900, 52); cx.strokeStyle = 'rgba(255,140,120,.9)'; cx.lineWidth = 2; cx.setLineDash([10, 7]); cx.strokeRect(lx, b.y - 26, 900, 52); cx.setLineDash([]); }
    if (b.state === 'windup' && b.atk === 'slam') { cx.strokeStyle = 'rgba(229,83,75,.7)'; cx.lineWidth = 2; cx.setLineDash([6, 5]); cx.beginPath(); cx.ellipse(b.x, b.y, def.slamRadius, 40, 0, 0, 7); cx.stroke(); cx.setLineDash([]); }
    var o = { flip: b.face > 0, alpha: a, feet: 0.97 }, shakeX = (b.state === 'windup' ? Math.sin(S.t / 30) * 2 : 0);
    o.flip = b.face < 0;
    if (b.hitFlash > 0) { o.tint = '#FFFFFF'; o.tintA = 0.6; } else if (b.state === 'windup') { o.tint = '#FFB199'; o.tintA = 0.3 + 0.25 * Math.sin(S.t / 50); } else if (b.phase === 2) { o.tint = '#E5534B'; o.tintA = 0.14; }
    var lift = b.state === 'windup' && b.atk === 'slam' ? -14 * (1 - b.t / (def.slamWindup * b.windMul)) : 0;
    var walk = b.state === 'approach' ? 1 : 0, bph = S.t / 200, brot = 0.025 * walk * Math.sin(bph), bsx = 1, bsy = 1 + 0.012 * Math.sin(S.t / 900), bbob = -Math.abs(Math.sin(bph)) * 4 * walk;
    if (b.state === 'windup') { var wp = 1 - b.t / ((b.atk === 'charge' ? def.chargeWindup : def.slamWindup) * b.windMul); brot = -0.12 * wp; bsy = 1 - 0.05 * wp; bsx = 1 + 0.03 * wp; } // rears back
    else if (b.state === 'charge') { brot = 0.14; bsx = 1.08; bsy = 0.95; }
    else if (b.state === 'slam') { var sq = b.t / 420; brot = 0.12 * sq; bsy = 0.93 + 0.07 * (1 - sq); bsx = 1.06 * sq + 1 * (1 - sq); } // crashes down
    else if (b.state === 'roar') { brot = -0.1; bsx = 1 + 0.04 * Math.sin(S.t / 60); bsy = 1 + 0.03 * Math.sin(S.t / 60); }
    if (b.hitT > 0) { var bq = b.hitT / 160; bsx *= 1 + 0.04 * bq; bsy *= 1 - 0.035 * bq; brot += (b.hitDir === b.face ? 0.03 : -0.04) * bq; }
    if (b.state === 'dead') { var be = Math.min(1, (b.dead || 0) / 700); brot = -0.5 * be; bsy = 1 - 0.08 * be; }
    o.rot = brot; o.sx = bsx; o.sy = bsy;
    if (b.state === 'charge') { for (var gi = 1; gi <= 3; gi++) draw(def.sprite, bw, b.x - b.dirx * gi * 26, b.y + bbob, { flip: o.flip, alpha: 0.13 * (4 - gi) * a, feet: 0.97, rot: 0.14, sx: 1.08, sy: 0.95 }); }
    draw(def.sprite, bw, b.x + shakeX, b.y + lift + bbob, o);
    if (b.state === 'windup') { cx.fillStyle = '#FFD166'; cx.font = '900 26px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('!', b.x, b.y - bhh - 8); }
    if (b.state === 'stun' || b.state === 'recover') { cx.fillStyle = 'rgba(255,255,255,.9)'; cx.font = '800 12px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText(b.state === 'stun' ? '✦ STUNNED ✦' : 'OPEN', b.x, b.y - bhh - 8); }
  }
  var FORM_W = { swiftclaw: 134, ironhide: 156, wildspark: 150 }; // drawn width per evolution form (base form is 128)
  function dPlayer(P) {
    var st = S.stats, w = FORM_W[st.path] || 128, o = { flip: P.face < 0, feet: 0.96 };
    var spd = P.dashT > 0 ? 0 : Math.min(1, Math.sqrt(P.ivx * P.ivx + (P.ivy / 0.62) * (P.ivy / 0.62)) / (st.speed || 150)), ph = P.anim / 80, stp = Math.sin(ph);
    var bob = -Math.abs(stp) * 3.4 * spd + Math.sin(S.t / 620) * 0.9 * (1 - spd), y = P.y + bob;
    var rot = 0.07 * spd * (P.ivx * P.face > 0 ? 1 : 0.4) + stp * 0.016 * spd, sx = 1, sy = 1 + 0.012 * Math.sin(S.t / 620) * (1 - spd) + 0.022 * spd * Math.cos(ph * 2), skew = 0.05 * spd * Math.sin(ph - 0.9) + 0.012 * Math.sin(S.t / 900), lunge = 0;
    if (P.atkT > 0) { // 0-60 ms wind-back, 60-140 ms strike (the hit lands at 60), 140-260 ms recovery
      var el = 260 - P.atkT, q;
      if (el < 60) { q = el / 60; rot = -0.10 * q; sy = 1 - 0.05 * q; sx = 1 + 0.03 * q; lunge = -6 * q; skew = 0; }
      else if (el < 140) { q = (el - 60) / 80; var eo = 1 - Math.pow(1 - q, 2); rot = -0.10 + 0.32 * eo; sx = 1.03 + 0.08 * eo; sy = 0.95 + 0.01 * eo; lunge = -6 + 20 * eo; skew = 0; }
      else { q = (el - 140) / 120; rot = 0.22 * (1 - q); sx = 1.11 - 0.11 * q; sy = 0.96 + 0.04 * q; lunge = 14 * (1 - q); skew = 0; }
    }
    if (P.dashT > 0) { rot = 0.2; sx = 1.14; sy = 0.9; skew = 0; }
    if (P.hurt > 0) { var hq = P.hurt / 260; rot = -0.16 * hq; sy *= 1 - 0.06 * hq; }
    o.rot = rot; o.sx = sx; o.sy = sy; o.skew = skew;
    shadow(P.x, P.y + 2, w * 0.8 * (1 + bob * 0.01), 0.4 * (1 + bob * 0.04));
    if (P.dashT > 0) { for (var i = 1; i <= 3; i++) draw(st.sprite, w, P.x - P.dashDx * i * 18, y, { flip: P.face < 0, feet: 0.96, alpha: 0.16 * (4 - i), rot: 0.2, sx: 1.14, sy: 0.9 }); }
    var blink = P.inv > 0 && P.hurt <= 0 && P.dashT <= 0 && Math.floor(S.t / 70) % 2 === 0;
    if (blink) o.alpha = 0.55;
    if (P.hurt > 0) { o.tint = '#FF6A5E'; o.tintA = 0.5; }
    if (P.shield > 0) { var sa = 0.2 + 0.1 * Math.sin(S.t / 90); cx.fillStyle = 'rgba(207,232,176,' + sa + ')'; cx.beginPath(); cx.ellipse(P.x, P.y - 34, 54, 46, 0, 0, 7); cx.fill(); cx.strokeStyle = 'rgba(207,232,176,.8)'; cx.lineWidth = 2; cx.stroke(); }
    if (P.surgeT > 0) { var g = cx.createRadialGradient(P.x, P.y - 30, 6, P.x, P.y - 30, 90); g.addColorStop(0, 'rgba(79,209,197,.5)'); g.addColorStop(1, 'rgba(79,209,197,0)'); cx.fillStyle = g; cx.fillRect(P.x - 100, P.y - 130, 200, 200); }
    draw(st.sprite, w, P.x + lunge * P.face, y, o);
  }
  /* the swing sweeps from high to low over the first half of its life, then fades. A dark outline and a coloured glow keep it readable on bright backdrops. */
  function drawSlash(p, k) {
    var cf = p.cfg, s = Math.min(1, k / 0.5), e = 1 - Math.pow(1 - s, 3), a0 = -1.25, a1 = a0 + 2.2 * e, R = p.len, N = 14, i, j, ang, th, pass;
    cx.save(); cx.translate(p.x + p.face * 10, p.y); if (p.face < 0) cx.scale(-1, 1); cx.globalAlpha = Math.min(1, (1 - k) * 1.6); cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.shadowColor = cf.c2; cx.shadowBlur = reduced() ? 0 : 14;
    if (cf.kind === 'claw') {
      for (pass = 0; pass < 2; pass++) for (j = -1; j <= 1; j++) { cx.strokeStyle = pass ? (j === 0 ? cf.c1 : cf.c2) : 'rgba(10,18,14,.55)'; cx.lineWidth = ((j === 0 ? 6 : 4.2) + (pass ? 0 : 4)) * (1 - k * 0.5) + 1; cx.beginPath(); cx.arc(-6 + j * 4, j * 10, R - Math.abs(j) * 7, a0 + 0.1 * j, a1 + 0.05 * j); cx.stroke(); }
    } else if (cf.kind === 'bolt') {
      for (j = 0; j < 3; j++) {
        cx.strokeStyle = j === 2 ? cf.c1 : j === 1 ? cf.c2 : 'rgba(10,18,14,.55)'; cx.lineWidth = j === 2 ? 3 : j === 1 ? 8 : 12; cx.beginPath();
        for (i = 0; i <= N; i++) { ang = a0 + (a1 - a0) * i / N; var rj = R + (i % 2 ? 7 : -7) * (Math.random() * 0.8 + 0.4) * (i > 0 && i < N ? 1 : 0); cx.lineTo(Math.cos(ang) * rj, Math.sin(ang) * rj); }
        cx.stroke();
      }
    } else {
      for (j = 0; j < 3; j++) {
        th = cf.th * (j === 2 ? 0.5 : j === 1 ? 1.0 : 1.35) * (1 - 0.4 * k) + 3; cx.fillStyle = j === 2 ? cf.c1 : j === 1 ? cf.c2 : 'rgba(10,18,14,.5)'; cx.globalAlpha = Math.min(1, (1 - k) * 1.6) * (j === 0 ? 0.8 : 1); cx.beginPath();
        for (i = 0; i <= N; i++) { ang = a0 + (a1 - a0) * i / N; cx.lineTo(Math.cos(ang) * R, Math.sin(ang) * R); }
        for (i = N; i >= 0; i--) { ang = a0 + (a1 - a0) * i / N; var rin = R - th * Math.sin(Math.PI * i / N) - 1; cx.lineTo(Math.cos(ang) * rin, Math.sin(ang) * rin); }
        cx.closePath(); cx.fill();
      }
    }
    cx.restore();
  }
  function drawEnemyTelegraph(e, d) {
    var P = S.P, pr = 1 - e.t / d.windup;
    if (e.type === 'spitter') { cx.save(); cx.strokeStyle = 'rgba(155,224,112,' + (0.3 + 0.4 * pr) + ')'; cx.lineWidth = 2; cx.setLineDash([6, 6]); cx.beginPath(); cx.moveTo(e.x + e.face * 30, e.y - 34); cx.lineTo(P.x, P.y - 30); cx.stroke(); cx.restore(); return; }
    var L = d.lunge + 44;
    cx.save(); cx.globalAlpha = 0.16 + 0.3 * pr; cx.fillStyle = '#E5534B'; cx.beginPath(); cx.moveTo(e.x, e.y - 10); cx.lineTo(e.x + e.face * L, e.y - 26); cx.lineTo(e.x + e.face * L, e.y + 26); cx.lineTo(e.x, e.y + 10); cx.closePath(); cx.fill();
    cx.globalAlpha = 0.45 + 0.35 * pr; cx.strokeStyle = '#FF9A8A'; cx.lineWidth = 2; cx.stroke(); cx.restore();
  }
  function drawProjectiles() {
    for (var i = 0; i < S.projectiles.length; i++) {
      var p = S.projectiles[i]; shadow(p.x, p.gy, 14, 0.25);
      cx.fillStyle = '#9BE070'; cx.beginPath(); cx.arc(p.x, p.y, 7, 0, 7); cx.fill(); cx.fillStyle = 'rgba(200,255,150,.5)'; cx.beginPath(); cx.arc(p.x - p.vx * 0.02, p.y - p.vy * 0.02, 5, 0, 7); cx.fill();
    }
  }
  function drawFx() {
    var i, p;
    for (i = 0; i < S.parts.length; i++) {
      p = S.parts[i]; var k = p.t / p.life;
      if (p.ring) { cx.strokeStyle = p.c; cx.globalAlpha = 1 - k; cx.lineWidth = 4 * (1 - k) + 1; cx.beginPath(); cx.ellipse(p.x, p.y - 4, p.r, p.r * 0.32, 0, 0, 7); cx.stroke(); cx.globalAlpha = 1; }
      else if (p.fx === 'slash') { drawSlash(p, k); }
      else if (p.fx === 'star') {
        var rr = p.r * (0.35 + 0.65 * Math.min(1, k * 2.2)); cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 1 - k; cx.fillStyle = p.c; cx.beginPath();
        for (var si = 0; si < 8; si++) { var sa = si * Math.PI / 4, sr = si % 2 ? rr * 0.34 : rr; cx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr); }
        cx.closePath(); cx.fill(); cx.fillStyle = '#FFFFFF'; cx.beginPath(); cx.arc(0, 0, rr * 0.28, 0, 7); cx.fill(); cx.restore();
      }
      else if (p.fx === 'streak') { var sv = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1; cx.strokeStyle = p.c; cx.globalAlpha = 1 - k; cx.lineWidth = 2.2 * (1 - k) + 0.8; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx / sv * p.len, p.y - p.vy / sv * p.len); cx.stroke(); cx.globalAlpha = 1; }
      else if (p.fx === 'dust') { cx.globalAlpha = 0.34 * (1 - k); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y - k * 6, p.r * (1 + k * 1.6), 0, 7); cx.fill(); cx.globalAlpha = 1; }
      else if (p.slash) { cx.strokeStyle = p.c; cx.globalAlpha = 1 - k; cx.lineWidth = 5 * (1 - k) + 1; cx.beginPath(); cx.arc(p.x - p.face * 30, p.y + 6, 44, p.face > 0 ? -1.0 : Math.PI - 0.1 - 0.9, p.face > 0 ? 0.9 : Math.PI + 1.0); cx.stroke(); cx.globalAlpha = 1; }
      else { cx.globalAlpha = 1 - k; cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); cx.globalAlpha = 1; }
    }
    cx.textAlign = 'center';
    for (i = 0; i < S.texts.length; i++) {
      p = S.texts[i]; cx.globalAlpha = Math.max(0, 1 - p.t / 900); cx.font = '900 ' + (p.big ? 20 : 14) + 'px system-ui, sans-serif'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(14,23,18,.9)'; cx.strokeText(p.txt, p.x, p.y); cx.fillStyle = p.color; cx.fillText(p.txt, p.x, p.y); cx.globalAlpha = 1;
    }
  }
  function drawMarker() {
    if (!S.nests.length || S.boss) return; var n = S.nests[0];
    if (S.tut && S.tut.step < 3 && !S.eggReady) return;
    if (n.done) return;
    var bounce = Math.sin(S.t / 220) * 5;
    cx.fillStyle = S.eggReady ? '#F5D27F' : 'rgba(245,210,127,.45)'; cx.beginPath(); cx.moveTo(n.x, n.y - 118 + bounce + 14); cx.lineTo(n.x - 11, n.y - 118 + bounce); cx.lineTo(n.x + 11, n.y - 118 + bounce); cx.closePath(); cx.fill();
  }
  G.drawFrameOnce = function () { render(); };
})(window.DF);
