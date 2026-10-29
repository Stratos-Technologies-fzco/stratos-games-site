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
    if (o.alpha != null) cx.globalAlpha = o.alpha;
    cx.drawImage(c, -w / 2, -h * feet, w, h);
    if (o.tint) { cx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * o.tintA; cx.drawImage(A.silhouette(name, w, o.tint), -w / 2, -h * feet, w, h); }
    cx.restore();
  }
  function shadow(x, y, w, a) {
    cx.save(); cx.globalAlpha = a == null ? 0.35 : a; cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(x, y, w * 0.42, w * 0.1, 0, 0, 7); cx.fill(); cx.restore();
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
    var save = DF.save, demo = !!opts.demo, obj = opts.tutorial ? { id: 'egg', bg: 'canyon_styracosaur', worldW: B.tutorial.worldW, berriesNeeded: 3, bonus: B.objectives.egg.bonus, eggId: 'shadowscale' } : B.objectives[opts.demo ? 'demo' : opts.objective];
    var stats = DF.playerStats(demo ? demoSave() : save), rng = DF.createRng(opts.runId);
    S = G.S = {
      runId: opts.runId, tutorial: !!opts.tutorial, objId: opts.tutorial ? 'egg' : obj.id, obj: obj, rng: rng, stats: stats, t: 0, worldW: obj.worldW, camX: 0,
      gained: { food: 0, dna: 0, tokens: 0, xp: 0 }, berries: 0, kills: {}, dodges: 0, abilitiesUsed: 0, seen: {}, newEggs: [], newSpecies: [],
      enemies: [], bushes: [], pickups: [], rocks: [], projectiles: [], parts: [], texts: [], nests: [], crystal: null, boss: null,
      shake: 0, flash: 0, hurtFlash: 0, ending: 0, ended: false, combat: false, combatT: 0, shown: {},
      demo: demo, demoAcc: 0, demoTick: 0, tut: opts.tutorial ? { step: 0, steps: 4, raiderSpawned: false, raider: null } : null, eggReady: false, crystalHint: 0, timeToFirst: 0, firstEncounter: false, speedMul: 1
    };
    S.P = { x: 110, y: 270, face: 1, hp: stats.maxHealth, maxHp: stats.maxHealth, en: stats.maxEnergy, maxEn: stats.maxEnergy, atkT: 0, atkCd: 0, dashCd: 0, abCd: 0, dashT: 0, dashDx: 1, dashDy: 0, dashSpd: 0, inv: 0, shield: 0, hurt: 0, anim: 0, stun: 0, hitIds: {}, surgeT: 0 };
    buildWorld();
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
  function addBush(x, y, berries) { S.bushes.push({ x: x, y: y, berries: berries || 1, bob: S.rng.next() * 6 }); }
  function addEnemy(type, x, y, mods) {
    var d = B.enemies[type], e = { kind: 'enemy', type: type, def: d, x: x, y: y, hp: d.hp, maxHp: d.hp, face: -1, state: 'idle', t: 0, cd: 400, hitFlash: 0, stun: 0, kx: 0, vx: 0, vy: 0, dirx: 1, diry: 0, didHit: false, near: false, wob: S.rng.next() * 6, dead: 0, id: S.enemies.length + 1 };
    if (mods) { Object.keys(mods).forEach(function (k) { e[k] = mods[k]; }); }
    S.enemies.push(e); return e;
  }
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
    if (o.id === 'boss') {
      addBush(260, 215, 3); addBush(1040, 330, 3);
      addRock(560, 215, 60, 22); addRock(760, 340, 56, 20);
      S.boss = { kind: 'boss', x: 980, y: 270, hp: B.boss.hp, maxHp: B.boss.hp, state: 'sleep', t: 0, face: -1, phase: 1, hitFlash: 0, dirx: -1, atk: '', didHit: false, speedMul: 1, windMul: 1, stun: 0, kx: 0, wave: -1, id: 'boss' };
      S.P.x = 120;
      return;
    }
    var nb = o.bushes, step = (W - 900) / nb;
    for (i = 0; i < nb; i++) addBush(480 + i * step + rng.range(-40, 40), rng.range(YMIN + 20, YMAX - 20), 1);
    for (i = 0; i < (S.demo ? 0 : 8); i++) addRock(rng.range(350, W - 450), rng.range(YMIN + 10, YMAX - 10), rng.range(36, 60), rng.range(16, 24)); // the demo arena is rock-free so the pilot never snags
    var ne = o.raiders + o.spitters + o.skimmers, types = [], n;
    for (n = 0; n < o.raiders; n++) types.push('raider'); for (n = 0; n < o.spitters; n++) types.push('spitter'); for (n = 0; n < o.skimmers; n++) types.push('skimmer');
    for (i = 0; i < types.length; i++) {
      x = 700 + (i + 0.5) * (W - 1300) / types.length + rng.range(-60, 60);
      addEnemy(types[i], x, rng.range(YMIN + 10, YMAX - 6));
    }
    for (i = 0; i < 4; i++) S.pickups.push(mkPick('dna', rng.range(600, W - 500), rng.range(YMIN + 12, YMAX - 8)));
    for (i = 0; i < 5; i++) S.pickups.push(mkPick('coin', rng.range(500, W - 400), rng.range(YMIN + 12, YMAX - 8)));
    S.nests.push({ x: W - 240, y: 285, eggId: o.eggId, done: false });
    if (o.id === 'egg' || o.id === 'forage') S.crystal = { x: W - 520, y: 232, used: false };
  }
  function mkPick(type, x, y) { return { type: type, x: x, y: y, t: Math.random() * 6, got: false }; }

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
  G.isRunning = function () { return running; };
  G.stop = function () { running = false; paused = true; cancelAnimationFrame(raf); };
  G.clear = function () { if (cx) cx.clearRect(0, 0, cv.width, cv.height); };

  /* ---------- main loop ---------- */
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    var dt = Math.min(50, now - last); last = now; // clamp large deltas after tab suspension
    if (!paused && S && !S.ended) update(dt);
    render();
  }

  function update(dt) {
    S.t += dt; var P = S.P, i;
    // queued actions
    while (queue.length) { var a = queue.shift(); if (a === 'attack') doAttack(); else if (a === 'dash') doDash(); else if (a === 'ability') doAbility(); }
    if (held.attack && P.atkCd <= 0) doAttack();
    if (S.demo) { demoAI(dt); if (S.t > 75000 && S.ending <= 0) { S.ending = 400; S.endOutcome = 'success'; } }
    updatePlayer(dt);
    for (i = 0; i < S.enemies.length; i++) updateEnemy(S.enemies[i], dt);
    if (S.boss) updateBoss(S.boss, dt);
    separate();
    updateProjectiles(dt); updatePickups(dt); updateEffects(dt);
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
    P.en = Math.min(P.maxEn, P.en + st.energyRegen * dt / 1000);
    if (P.dashT > 0) {
      P.dashT -= dt; P.x += P.dashDx * P.dashSpd * dt / 1000; P.y += P.dashDy * P.dashSpd * 0.5 * dt / 1000;
      if (P.dashHit) dashDamage();
      if (Math.random() < 0.7) spark(P.x - P.face * 20, P.y - 20, st.path === 'swiftclaw' ? '#9FE7DF' : '#F3EBD7', 1);
    } else if (P.stun <= 0) {
      P.x += ix * st.speed * dt / 1000 * S.speedMul; P.y += iy * st.speed * 0.62 * dt / 1000;
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
    P.atkCd = B.player.attackCooldown; P.atkT = 220; P.hitIds = {};
    DF.Audio.sfx('swing');
    var range = B.player.attackRange, hit = false, list = S.enemies.concat(S.boss ? [S.boss] : []);
    for (var i = 0; i < list.length; i++) {
      var e = list[i]; if (e.state === 'dead') continue;
      var dx = (e.x - P.x) * P.face, dy = Math.abs(e.y - P.y), reach = range + (e.kind === 'boss' ? 70 : 28);
      if (dx > -14 && dx < reach && dy < B.player.attackDepth + (e.kind === 'boss' ? 14 : 0)) { hurtEnemy(e, st.attackPower, true); hit = true; }
    }
    slash(P.x + P.face * 40, P.y - 26, P.face, '#F3EBD7');
    return hit;
  }
  function critRoll(base) {
    var st = S.stats;
    if (st.critChance > 0 && S.rng.next() < st.critChance) return { dmg: Math.round(base * st.critMul), crit: true };
    return { dmg: base, crit: false };
  }
  function hurtEnemy(e, base, melee, opts) {
    opts = opts || {};
    var r = critRoll(base), dmg = r.dmg;
    if (e.kind === 'boss') { var vuln = (e.state === 'recover' || e.state === 'stun'); if (!vuln) dmg = Math.max(1, Math.round(dmg * 0.55)); if (e.state === 'roar' || e.state === 'dead') return; }
    else if (e.state === 'recover') dmg = Math.round(dmg * 1.4);
    if (S.tut && e.type === 'raider') dmg = Math.round(dmg * 1.5);
    e.hp -= dmg; e.hitFlash = 130;
    if (e.state === 'idle') { e.state = 'chase'; markSeen(e.type || 'thornback'); }
    if (e.kind === 'enemy') { e.kx = (S.P.x < e.x ? 1 : -1) * (opts.knock || B.player.knockback) * (e.state === 'windup' ? 0.4 : 1); if (e.state === 'windup') { e.state = 'chase'; e.t = 0; e.cd = 500; } }
    float(e.x, e.y - 60, String(dmg), r.crit ? '#F5D27F' : '#F3EBD7', r.crit);
    DF.Audio.sfx(r.crit ? 'crit' : 'hit');
    burst(e.x, e.y - 30, r.crit ? '#F5D27F' : '#F3EBD7', r.crit ? 9 : 5);
    shake(r.crit ? 3.5 : 2); vibrate(12);
    if (e.hp <= 0) killEnemy(e);
  }
  function killEnemy(e) {
    e.state = 'dead'; e.dead = 0;
    if (e.kind === 'boss') { S.gained.xp += B.boss.xp; S.kills.thornback = (S.kills.thornback || 0) + 1; shake(7); DF.Audio.sfx('slam'); burst(e.x, e.y - 50, '#E8B54A', 24); S.ending = 1600; S.endOutcome = 'success'; S.bossDown = true; return; }
    S.gained.xp += e.def.xp; S.kills[e.type] = (S.kills[e.type] || 0) + 1; S.kills.total = (S.kills.total || 0) + 1;
    burst(e.x, e.y - 30, '#E5534B', 8);
    if (S.rng.next() < e.def.drop) S.pickups.push(mkPick(S.rng.next() < 0.5 ? 'coin' : 'dna', e.x, e.y));
    if (S.tut && e.type === 'raider') advanceTut(3);
  }
  function doDash() {
    var P = S.P, st = S.stats; if (P.dashCd > 0 || P.stun > 0 || P.dashT > 0) return;
    if (P.en < st.dashCost) { DF.Audio.sfx('deny'); if (G.onEvent) G.onEvent('noEnergy'); return; }
    P.en -= st.dashCost; P.dashCd = B.dash.cooldown;
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
    P.hp -= d; P.inv = 650; P.hurt = 260; P.kx = (P.x < fromX ? -1 : 1) * 130;
    float(P.x, P.y - 70, '-' + d, '#F2B8B0', false); DF.Audio.sfx('hurt'); shake(4); S.hurtFlash = reduced() ? 120 : 260; vibrate(30);
    burst(P.x, P.y - 30, '#E5534B', 6);
    if (P.hp <= 0) {
      if (S.demo) { P.hp = Math.round(P.maxHp * 0.5); P.inv = 1500; return true; }
      if (S.tut) { P.hp = Math.round(P.maxHp * 0.6); P.inv = 1500; toast('Shake it off! Try again.', 'info'); return true; }
      P.hp = 0; S.ending = 900; S.endOutcome = 'defeat'; S.ended = false;
    }
    return true;
  }

  /* ---------- enemies ---------- */
  function markSeen(type) { if (!type || S.seen[type]) return; S.seen[type] = 1; if (!S.firstEncounter && type !== 'thornback') { S.firstEncounter = true; S.timeToFirst = S.t; DF.track('first_encounter', { ms: Math.round(S.t) }); } }
  function applyKnock(e, dt) { if (e.kx) { e.x += e.kx * dt / 1000 * 3; e.kx *= 0.84; if (Math.abs(e.kx) < 3) e.kx = 0; e.x = Math.max(20, Math.min(S.worldW - 20, e.x)); } }
  function contact(e, rx, ry) { var P = S.P; return Math.abs(P.x - e.x) < rx && Math.abs(P.y - e.y) < ry; }

  function updateEnemy(e, dt) {
    var d = e.def, P = S.P;
    if (e.state === 'dead') { e.dead += dt; return; }
    e.hitFlash = Math.max(0, e.hitFlash - dt); e.cd = Math.max(0, e.cd - dt); e.t -= dt;
    applyKnock(e, dt);
    if (e.stun > 0) { e.stun -= dt; e.state = 'stun'; if (e.stun <= 0) { e.state = 'chase'; e.t = 0; } return; }
    var dx = P.x - e.x, dy = P.y - e.y, dd = Math.sqrt(dx * dx + dy * dy * 2.9), spd = d.speed;
    var tooFar = Math.abs(dx) > 1400;
    if (tooFar && e.state === 'idle') return;
    switch (e.state) {
      case 'idle':
        e.wob += dt / 700; e.y += Math.sin(e.wob) * 0.1;
        if (dd < d.aggro) { e.state = 'chase'; markSeen(e.type); }
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
          else { e.state = 'attack'; e.t = d.lungeTime; e.didHit = false; var lx = P.x - e.x, ly = (P.y - e.y); var ll = Math.sqrt(lx * lx + ly * ly) || 1; e.dirx = lx / ll; e.diry = ly / ll * 0.4; e.startClose = dd < 140; }
        }
        break;
      case 'attack':
        e.x += e.dirx * d.lunge / (d.lungeTime / 1000) * dt / 1000; e.y += e.diry * d.lunge / (d.lungeTime / 1000) * dt / 1000;
        e.y = Math.max(YMIN, Math.min(YMAX, e.y)); e.x = Math.max(20, Math.min(S.worldW - 20, e.x));
        if (!e.didHit && contact(e, 40, 28)) { e.didHit = hurtPlayer(d.dmg, e.x, false) || P.inv > 0 && false; if (!e.didHit && P.inv > 0) e.dodged = true; }
        if (e.t <= 0) { if (!e.didHit && (e.startClose || e.dodged)) countDodge(); e.dodged = false; e.state = 'recover'; e.t = d.recover; }
        break;
      case 'recover':
        if (e.type === 'skimmer') { e.x -= e.face * spd * 0.9 * dt / 1000; }
        if (e.t <= 0) { e.state = 'chase'; e.cd = d.cooldown; }
        break;
    }
  }
  function beginWindup(e, ms) { e.state = 'windup'; e.t = ms; DF.Audio.sfx('windup'); markSeen(e.type); }
  function countDodge() { S.dodges++; if (S.tut && S.tut.step === 2) { /* dodging counts as progress, killing is the goal */ } if (G.onEvent) G.onEvent('dodge'); float(S.P.x, S.P.y - 80, 'Dodge!', '#9FE7DF', false); }
  function fireSpit(e) {
    DF.Audio.sfx('spit'); var P = S.P, dx = P.x - e.x, dy = P.y - e.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
    S.projectiles.push({ x: e.x + e.face * 30, y: e.y - 34, gy: e.y, vx: dx / l * e.def.projSpeed, vy: dy / l * e.def.projSpeed * 0.5, life: 2600, dmg: e.def.dmg, near: false });
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

  /* ---------- boss: Thornback ---------- */
  function updateBoss(b, dt) {
    var P = S.P, def = B.boss; if (b.state === 'dead') return;
    b.hitFlash = Math.max(0, b.hitFlash - dt); b.t -= dt;
    var dx = P.x - b.x, dy = P.y - b.y, dd = Math.sqrt(dx * dx + dy * dy * 2.9);
    if (b.kx) { b.x += b.kx * dt / 1000; b.kx *= 0.8; }
    switch (b.state) {
      case 'sleep':
        if (Math.abs(dx) < 620) { b.state = 'roar'; b.t = 1300; DF.Audio.sfx('roar'); DF.Audio.play('04-boss-thornback', 700); shake(4); markSeen('thornback'); S.shown.boss = true; if (G.onEvent) G.onEvent('boss'); }
        break;
      case 'roar':
        if (b.t <= 0) { b.state = 'approach'; b.t = 900 + S.rng.range(0, 600); }
        break;
      case 'approach':
        b.face = sgn(dx); b.x += b.face * def.speed * b.speedMul * dt / 1000; b.y += Math.sign(dy) * Math.min(Math.abs(dy), 40 * dt / 1000);
        b.y = Math.max(YMIN + 10, Math.min(YMAX, b.y));
        if (b.t <= 0) {
          b.atk = (dd > 300 || S.rng.next() < 0.45) ? 'charge' : 'slam'; b.state = 'windup'; b.t = (b.atk === 'charge' ? def.chargeWindup : def.slamWindup) * b.windMul; b.dirx = sgn(dx); b.laneY = P.y; b.didHit = false; DF.Audio.sfx('windup');
        }
        break;
      case 'windup':
        if (b.atk === 'charge') { b.face = b.dirx; b.laneY += (P.y - b.laneY) * 0.02; b.y += (b.laneY - b.y) * 0.05; }
        if (b.t <= 0) {
          if (b.atk === 'charge') { b.state = 'charge'; b.t = def.chargeTime; DF.Audio.sfx('roar'); b.startClose = dd < 200; }
          else { b.state = 'slam'; b.t = 420; DF.Audio.sfx('slam'); shake(7); ring(b.x, b.y, def.slamRadius, '#E8B54A'); b.waveHit = false; if (Math.abs(P.x - b.x) < def.slamRadius && Math.abs(P.y - b.y) < 50) { if (!hurtPlayer(def.slamDmg, b.x, true) && P.inv > 0) countDodge(); } else if (Math.abs(P.x - b.x) < def.slamRadius + 70) countDodge(); }
        }
        break;
      case 'charge':
        b.x += b.dirx * def.chargeSpeed * b.speedMul * dt / 1000;
        if (!b.didHit && Math.abs(P.x - b.x) < 96 && Math.abs(P.y - b.y) < 36) { b.didHit = hurtPlayer(def.chargeDmg, b.x, true); if (!b.didHit && P.inv > 0) { b.didHit = true; countDodge(); } }
        if (b.x < 90 || b.x > S.worldW - 90) { b.x = Math.max(90, Math.min(S.worldW - 90, b.x)); b.state = 'stun'; b.t = 1500; shake(8); DF.Audio.sfx('slam'); burst(b.x, b.y - 40, '#C9A56A', 14); toast('Thornback is stunned — strike now!', 'info'); }
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
      toast(DF.S.hud.bossPhase, 'info');
      addEnemy('skimmer', Math.min(S.worldW - 60, b.x + 260), 240, { state: 'chase' }); addEnemy('skimmer', Math.max(60, b.x - 260), 320, { state: 'chase' });
    }
  }

  /* ---------- demo pilot: plays the scripted run by itself ---------- */
  function demoAI(dt) {
    S.demoAcc += dt; if (S.demoAcc < 100) return; S.demoAcc = 0; var tick = ++S.demoTick;
    var P = S.P, st = S.stats, near = null, nd = 1e9, tx = null, ty = null, i;
    for (i = 0; i < S.enemies.length; i++) { var e = S.enemies[i]; if (e.state === 'dead') continue; var d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y) * 2; if (d < nd) { nd = d; near = e; } }
    if (near && nd < 460) {
      var dir = near.x < P.x ? 1 : -1; tx = near.x + (near.type === 'spitter' ? 44 : 58) * dir; ty = near.y;
      if (near.state === 'windup' && Math.abs(near.x - P.x) < 130 && P.en >= st.dashCost && P.dashCd <= 0 && tick % 2 === 0) press('dash');
    } else {
      var b = null, bd = 1e9, n = S.nests[0];
      for (i = 0; i < S.bushes.length; i++) if (S.bushes[i].berries > 0) { var bx = Math.abs(S.bushes[i].x - P.x); if (bx < bd) { bd = bx; b = S.bushes[i]; } }
      var pk = null, pd = 1e9; for (i = 0; i < S.pickups.length; i++) { var px = Math.abs(S.pickups[i].x - P.x); if (px < pd) { pd = px; pk = S.pickups[i]; } }
      if (S.berries < S.obj.berriesNeeded && b) { tx = b.x; ty = b.y; } else if (pk && pd < 260) { tx = pk.x; ty = pk.y; } else if (n) { tx = n.x; ty = n.y; }
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
        b.berries--; var n = 1 + (S.rng.next() < S.stats.foodMul - 1 ? 1 : 0); S.gained.food += n; S.berries++; P.hp = Math.min(P.maxHp, P.hp + 6);
        float(b.x, b.y - 50, '+' + n + ' Food', '#CFE8B0', false); DF.Audio.sfx('pickup'); burst(b.x, b.y - 24, '#CFE8B0', 6); if (G.onEvent) G.onEvent('berry');
        if (S.tut && S.tut.step === 1) advanceTut(2);
      }
    }
    for (i = S.pickups.length - 1; i >= 0; i--) {
      p = S.pickups[i]; p.t += dt / 400; var dx = P.x - p.x, dy = P.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) { p.x += dx * Math.min(1, dt / 160); p.y += dy * Math.min(1, dt / 160); }
      if (d < 24) {
        S.pickups.splice(i, 1);
        if (p.type === 'dna') { S.gained.dna += 1; float(p.x, p.y - 30, '+1 DNA', '#CDB4F7', false); DF.Audio.sfx('pickup'); }
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
      if (!n.done && Math.abs(P.x - n.x) < 70 && Math.abs(P.y - n.y) < 50) {
        if (!S.eggReady) { if (!S.shown.needB || S.t - S.shown.needB > 3500) { S.shown.needB = S.t; toast(DF.t(DF.S.hud.needBerries, { n: S.obj.berriesNeeded }), 'info'); DF.Audio.sfx('deny'); } }
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

  /* ---------- effects ---------- */
  function shake(a) { if (!reduced()) S.shake = Math.max(S.shake, a); }
  function float(x, y, txt, color, big) { if (S.texts.length < 24) S.texts.push({ x: x, y: y, txt: txt, color: color, t: 0, big: big }); }
  function spark(x, y, color, n) { burst(x, y, color, n); }
  function burst(x, y, color, n) {
    n = reduced() ? Math.ceil(n / 3) : n;
    for (var i = 0; i < n && S.parts.length < 140; i++) { var a = Math.random() * 6.28, s = 40 + Math.random() * 110; S.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0, life: 380 + Math.random() * 300, c: color, r: 1.6 + Math.random() * 2.2 }); }
  }
  function ring(x, y, r, color) { S.parts.push({ ring: true, x: x, y: y, r: 10, max: r, t: 0, life: 460, c: color }); }
  function slash(x, y, face, color) { S.parts.push({ slash: true, x: x, y: y, face: face, t: 0, life: 200, c: color }); }
  function updateEffects(dt) {
    var i, p;
    for (i = S.parts.length - 1; i >= 0; i--) {
      p = S.parts[i]; p.t += dt; if (p.t >= p.life) { S.parts.splice(i, 1); continue; }
      if (p.ring) p.r = 10 + (p.max - 10) * (p.t / p.life); else if (!p.slash) { p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; p.vy += 260 * dt / 1000; }
    }
    for (i = S.texts.length - 1; i >= 0; i--) { p = S.texts[i]; p.t += dt; p.y -= 24 * dt / 1000; if (p.t > 900) S.texts.splice(i, 1); }
    S.shake = Math.max(0, S.shake - dt / 40); S.hurtFlash = Math.max(0, S.hurtFlash - dt);
    // enemy corpses fade
    for (i = S.enemies.length - 1; i >= 0; i--) if (S.enemies[i].state === 'dead' && S.enemies[i].dead > 700) S.enemies.splice(i, 1);
  }

  /* ---------- end of run ---------- */
  function finish(outcome) {
    if (S.ended) return; S.ended = true;
    var res = { outcome: outcome, objectiveId: S.objId, tutorial: S.tut != null, runId: S.runId, gained: { food: S.gained.food, dna: S.gained.dna, tokens: S.gained.tokens, xp: S.gained.xp }, kills: S.kills, dodges: S.dodges, berries: S.berries, abilities: S.abilitiesUsed, newEggs: S.newEggs.slice(), seen: Object.keys(S.seen), bossDown: !!S.bossDown, timeToFirst: S.timeToFirst, duration: S.t };
    running = true; paused = true;
    if (G.onEnd) G.onEnd(res);
  }
  G.quitRun = function () { running = false; paused = true; cancelAnimationFrame(raf); };
  G.snapshot = function () {
    if (!S) return null; var P = S.P, st = S.stats, o = S.obj, b = S.boss;
    var abReady = P.en >= st.ability.cost, dashReady = P.en >= st.dashCost;
    return { hp: Math.max(0, Math.round(P.hp)), maxHp: P.maxHp, en: Math.floor(P.en), maxEn: P.maxEn, food: S.gained.food, dna: S.gained.dna, tokens: S.gained.tokens, berries: S.berries, need: o.berriesNeeded, objId: S.objId, tutorial: !!S.tut, dashCost: st.dashCost, abCost: st.ability.cost, abName: st.ability.name, dashOk: dashReady, abOk: abReady, abCd: P.abCd, dashCd: P.dashCd, boss: b && b.state !== 'sleep' ? { hp: Math.max(0, b.hp), max: b.maxHp } : null, eggReady: S.eggReady, tutStep: S.tut ? S.tut.step : -1, abilitiesUsed: S.abilitiesUsed, combat: S.combat, kills: S.kills.total || 0, t: S.t };
  };

  /* ---------- rendering ---------- */
  function render() {
    if (!S) return;
    cx.setTransform(ratio, 0, 0, ratio, 0, 0);
    var sx = 0, sy = 0; if (S.shake > 0) { sx = (Math.random() - 0.5) * S.shake * 2; sy = (Math.random() - 0.5) * S.shake; }
    cx.save(); cx.translate(sx, sy);
    drawBackdrop(); drawGround();
    var list = [], i;
    for (i = 0; i < S.rocks.length; i++) list.push({ y: S.rocks[i].y, o: S.rocks[i], k: 'rock' });
    for (i = 0; i < S.bushes.length; i++) list.push({ y: S.bushes[i].y, o: S.bushes[i], k: 'bush' });
    for (i = 0; i < S.nests.length; i++) list.push({ y: S.nests[i].y, o: S.nests[i], k: 'nest' });
    if (S.crystal) list.push({ y: S.crystal.y, o: S.crystal, k: 'crystal' });
    if (S.ferns && S.tut.step === 0) list.push({ y: S.ferns.y, o: S.ferns, k: 'ferns' });
    for (i = 0; i < S.pickups.length; i++) list.push({ y: S.pickups[i].y, o: S.pickups[i], k: 'pick' });
    for (i = 0; i < S.enemies.length; i++) list.push({ y: S.enemies[i].y, o: S.enemies[i], k: 'enemy' });
    if (S.boss) list.push({ y: S.boss.y, o: S.boss, k: 'boss' });
    list.push({ y: S.P.y, o: S.P, k: 'player' });
    list.sort(function (a, b) { return a.y - b.y; });
    cx.translate(-S.camX, 0);
    for (i = 0; i < list.length; i++) {
      var it = list[i]; if (it.o.x < S.camX - 260 || it.o.x > S.camX + VW + 260) continue;
      switch (it.k) { case 'rock': dRock(it.o); break; case 'bush': dBush(it.o); break; case 'nest': dNest(it.o); break; case 'crystal': dCrystal(it.o); break; case 'ferns': dFerns(it.o); break; case 'pick': dPick(it.o); break; case 'enemy': dEnemy(it.o); break; case 'boss': dBoss(it.o); break; case 'player': dPlayer(it.o); break; }
    }
    drawProjectiles(); drawFx(); drawMarker();
    cx.restore();
    // overlays
    if (S.hurtFlash > 0) { cx.fillStyle = 'rgba(229,83,75,' + (0.28 * S.hurtFlash / 260) + ')'; cx.fillRect(0, 0, VW, VH); }
    var vg = cx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VW * 0.62); vg.addColorStop(0, 'rgba(6,10,8,0)'); vg.addColorStop(1, 'rgba(6,10,8,0.5)'); cx.fillStyle = vg; cx.fillRect(0, 0, VW, VH);
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
    shadow(b.x, b.y + 2, 70, 0.3);
    draw('prop-berry-bush', 78, b.x, b.y, { feet: 0.97, alpha: b.berries > 0 ? 1 : 0.55 });
    if (b.berries > 0) { var a = 0.5 + 0.5 * Math.sin(b.bob); cx.fillStyle = 'rgba(207,232,176,' + (0.18 * a) + ')'; cx.beginPath(); cx.ellipse(b.x, b.y - 24, 40, 28, 0, 0, 7); cx.fill(); }
  }
  function dNest(n) {
    shadow(n.x, n.y + 2, 84, 0.35);
    draw(n.eggId === 'glade' ? 'egg-glade' : 'egg', 86, n.x, n.y, { feet: 0.97 });
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
    var bob = Math.sin(p.t) * 4, ic = A.img(p.type === 'dna' ? 'icon-dna' : 'icon-token');
    shadow(p.x, p.y + 4, 26, 0.3);
    cx.drawImage(ic, p.x - 13, p.y - 32 + bob, 26, 26);
  }
  function drawFlash(name, w, x, y, o, e) {
    if (e.hitFlash > 0) { o.tint = '#FFFFFF'; o.tintA = 0.75; }
    else if (e.state === 'windup') { var a = 0.35 + 0.35 * Math.sin(S.t / 40); o.tint = e.type === 'spitter' ? '#9BE070' : '#FFD166'; o.tintA = a; }
    draw(name, w, x, y, o);
  }
  function dEnemy(e) {
    var d = e.def, w = d.size, bob = e.state === 'idle' ? Math.sin(e.wob) * 1.5 : Math.sin(S.t / 110 + e.id) * 1.8, a = 1, sc = sprite(d.sprite, w), hh = sc.height / sc.width * w;
    if (e.state === 'dead') { a = Math.max(0, 1 - e.dead / 700); }
    shadow(e.x, e.y + 2, w * 0.8, 0.35 * a);
    var o = { flip: e.face > 0 ? false : true, alpha: a };
    if (e.state === 'windup' && e.type !== 'spitter') { var t = 1 - e.t / d.windup; o.flip = e.face < 0; e.xo = -e.face * 10 * t; }
    var lean = e.state === 'attack' ? 6 * e.face : 0;
    drawFlash(d.sprite, w, e.x + lean, e.y + bob, { flip: e.face < 0, alpha: a, feet: 0.97 }, e);
    if (e.state !== 'dead') {
      if (e.state === 'windup') { cx.fillStyle = '#FFD166'; cx.font = '900 18px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('!', e.x, e.y - hh - 6); }
      if (e.state === 'stun') { cx.fillStyle = '#9FE7DF'; cx.font = '800 12px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('✦ ✦', e.x, e.y - hh - 6); }
      if (e.state === 'recover') { cx.fillStyle = 'rgba(255,255,255,.85)'; cx.font = '800 10px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('OPEN', e.x, e.y - hh - 6); }
      if (e.hp < e.maxHp) { var bw = 44, bx = e.x - bw / 2, by = e.y - hh - 2; cx.fillStyle = 'rgba(14,23,18,.8)'; cx.fillRect(bx - 1, by - 1, bw + 2, 6); cx.fillStyle = '#E5534B'; cx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 4); }
    }
  }
  function dBoss(b) {
    var def = B.boss, bsc = sprite(def.sprite, def.size), bhh = bsc.height / bsc.width * def.size, a = b.state === 'dead' ? Math.max(0, 1 - (b.dead = (b.dead || 0) + 16) / 1400) : 1;
    shadow(b.x, b.y + 4, def.size * 0.9, 0.4 * a);
    // telegraph lane
    if (b.state === 'windup' && b.atk === 'charge') { cx.fillStyle = 'rgba(229,83,75,' + (0.14 + 0.1 * Math.sin(S.t / 60)) + ')'; var lx = b.dirx > 0 ? b.x : b.x - 900; cx.fillRect(lx, b.y - 26, 900, 52); }
    if (b.state === 'windup' && b.atk === 'slam') { cx.strokeStyle = 'rgba(229,83,75,.7)'; cx.lineWidth = 2; cx.setLineDash([6, 5]); cx.beginPath(); cx.ellipse(b.x, b.y, def.slamRadius, 40, 0, 0, 7); cx.stroke(); cx.setLineDash([]); }
    var o = { flip: b.face > 0, alpha: a, feet: 0.97 }, shakeX = (b.state === 'windup' ? Math.sin(S.t / 30) * 2 : 0);
    o.flip = b.face < 0;
    if (b.hitFlash > 0) { o.tint = '#FFFFFF'; o.tintA = 0.6; } else if (b.state === 'windup') { o.tint = '#FFB199'; o.tintA = 0.3 + 0.25 * Math.sin(S.t / 50); } else if (b.phase === 2) { o.tint = '#E5534B'; o.tintA = 0.14; }
    var lift = b.state === 'windup' && b.atk === 'slam' ? -14 * (1 - b.t / (def.slamWindup * b.windMul)) : 0;
    draw(def.sprite, def.size, b.x + shakeX, b.y + lift, o);
    if (b.state === 'windup') { cx.fillStyle = '#FFD166'; cx.font = '900 26px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('!', b.x, b.y - bhh - 8); }
    if (b.state === 'stun' || b.state === 'recover') { cx.fillStyle = 'rgba(255,255,255,.9)'; cx.font = '800 12px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText(b.state === 'stun' ? '✦ STUNNED ✦' : 'OPEN', b.x, b.y - bhh - 8); }
  }
  function dPlayer(P) {
    var st = S.stats, w = st.path === 'ironhide' ? 156 : 128, bob = Math.sin(P.anim / 90) * 2, o = { flip: P.face < 0, feet: 0.96 }, y = P.y + bob;
    shadow(P.x, P.y + 2, w * 0.8, 0.4);
    if (P.dashT > 0) { for (var i = 1; i <= 3; i++) draw(st.sprite, w, P.x - P.dashDx * i * 18, y, { flip: P.face < 0, feet: 0.96, alpha: 0.16 * (4 - i) }); }
    var blink = P.inv > 0 && P.hurt <= 0 && P.dashT <= 0 && Math.floor(S.t / 70) % 2 === 0;
    if (blink) o.alpha = 0.55;
    if (P.hurt > 0) { o.tint = '#FF6A5E'; o.tintA = 0.5; }
    if (P.shield > 0) { var sa = 0.2 + 0.1 * Math.sin(S.t / 90); cx.fillStyle = 'rgba(207,232,176,' + sa + ')'; cx.beginPath(); cx.ellipse(P.x, P.y - 34, 54, 46, 0, 0, 7); cx.fill(); cx.strokeStyle = 'rgba(207,232,176,.8)'; cx.lineWidth = 2; cx.stroke(); }
    if (P.surgeT > 0) { var g = cx.createRadialGradient(P.x, P.y - 30, 6, P.x, P.y - 30, 90); g.addColorStop(0, 'rgba(79,209,197,.5)'); g.addColorStop(1, 'rgba(79,209,197,0)'); cx.fillStyle = g; cx.fillRect(P.x - 100, P.y - 130, 200, 200); }
    var lunge = P.atkT > 0 ? Math.sin((1 - P.atkT / 220) * Math.PI) * 10 * P.face : 0;
    draw(st.sprite, w, P.x + lunge, y, o);
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
