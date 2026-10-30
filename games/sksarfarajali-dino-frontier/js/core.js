/* Domain layer: seedable RNG, balance data, XP/levels, stats, rewards, daily reset, missions.
   Pure logic. No DOM, no rendering, no storage. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  /* ---------- seedable RNG (TECH 5.2) ---------- */
  function hashSeed(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  DF.createRng = function (seed) {
    var a = hashSeed(String(seed));
    var r = {
      next: function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      range: function (lo, hi) { return lo + r.next() * (hi - lo); },
      int: function (lo, hi) { return Math.floor(lo + r.next() * (hi - lo + 1)); },
      pick: function (arr) { return arr[Math.floor(r.next() * arr.length)]; }
    };
    return r;
  };

  /* ---------- balance (all values provisional and data-driven) ---------- */
  DF.balance = {
    maxLevel: 40,
    xpThresholds: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600, 20200, 23500, 27000, 31000, 35500, 40500, 46000, 52000, 58500, 65500, 73000, 81000, 89500, 98500, 108000, 118000, 128500, 139500, 151000, 163500, 176500], // levels 1-40 (Emberlands 11-20, Frostfang Peaks 21-30, Lost Mire 31-40)
    levelBonus: { healthPerLevel: 4, powerEveryTwoLevels: 1 },
    caps: { resource: 99999, xp: 99999 },
    player: { maxHealth: 100, maxEnergy: 100, energyRegen: 7, speed: 150, attackPower: 12, attackCooldown: 380, attackRange: 66, attackDepth: 34, knockback: 80 },
    dash: { cost: 15, distance: 120, duration: 170, cooldown: 600, invuln: 240 },
    baseAbility: { id: 'tail-sweep', name: 'Tail Sweep', cost: 30, cooldown: 3500, radius: 92, damage: 14, knock: 120, stun: 0 },
    evolution: {
      dnaCost: 8, switchTokenCost: 25,
      paths: {
        swiftclaw: { speedMul: 1.25, defence: -0.10, critChance: 0.25, critMul: 2, dashCost: 12, maxHealthAdd: 0, bossDefence: 0, sprite: 'evo-swiftclaw',
          ability: { id: 'phantom-dash', name: 'Phantom Dash', cost: 25, cooldown: 2600, damage: 20, distance: 230, invuln: 420 } },
        ironhide: { speedMul: 0.85, defence: 0.30, critChance: 0, critMul: 1, dashCost: 15, maxHealthAdd: 30, bossDefence: 0.15, sprite: 'evo-ironhide',
          ability: { id: 'fortress-roar', name: 'Fortress Roar', cost: 30, cooldown: 5500, radius: 130, damage: 10, stun: 1500, shield: 3500 } },
        wildspark: { speedMul: 1, defence: 0, critChance: 0, critMul: 1, dashCost: 20, maxHealthAdd: 0, bossDefence: 0, sprite: 'evo-wildspark',
          ability: { id: 'genesis-surge', name: 'Genesis Surge', cost: 40, cooldown: 6500, radius: 160, damage: 42, stun: 1100 } }
      }
    },
    upgrades: {
      hide: { max: 5, base: 40, healthPerLevel: 10 },
      snout: { max: 5, base: 30, foodPerLevel: 0.20 },
      stam: { max: 5, base: 50, regenPerLevel: 0.15 }
    },
    enemies: {
      raider: { hp: 32, speed: 92, dmg: 10, windup: 520, recover: 750, cooldown: 800, aggro: 250, range: 58, lunge: 300, lungeTime: 230, xp: 20, size: 120, sprite: 'enemy-raider', drop: 0.35 },
      spitter: { hp: 24, speed: 58, dmg: 8, windup: 680, recover: 650, cooldown: 1500, aggro: 330, keep: 190, projSpeed: 250, xp: 28, size: 104, sprite: 'enemy-spitter', drop: 0.4 },
      skimmer: { hp: 18, speed: 150, dmg: 7, windup: 380, recover: 520, cooldown: 700, aggro: 290, range: 50, lunge: 340, lungeTime: 200, xp: 24, size: 116, sprite: 'enemy-skimmer', drop: 0.3 }
    },
    boss: { hp: 240, speed: 70, size: 240, xp: 300, chargeWindup: 1100, chargeSpeed: 400, chargeTime: 700, chargeDmg: 16, slamWindup: 950, slamRadius: 140, slamDmg: 14, recover: 1500, armor: 0.7, adds: 1, phase2At: 0.5, enrageSpeed: 1.35, sprite: 'boss-thornback' },
    objectives: {
      egg: { id: 'egg', minLevel: 1, bg: 'canyon_styracosaur', worldW: 9500, berriesNeeded: 4, bushes: 10, raiders: 4, spitters: 1, skimmers: 1, bonus: { food: 6, dna: 3, tokens: 25, xp: 60 }, eggId: 'shadowscale' },
      forage: { id: 'forage', minLevel: 2, bg: 'tribal_river_canyon', worldW: 12000, berriesNeeded: 9, bushes: 15, raiders: 5, spitters: 2, skimmers: 2, bonus: { food: 5, dna: 2, tokens: 25, xp: 70 }, eggId: 'glade' },
      demo: { id: 'demo', minLevel: 1, bg: 'canyon_styracosaur', worldW: 2700, berriesNeeded: 3, bushes: 4, raiders: 3, spitters: 1, skimmers: 1, bonus: { food: 0, dna: 0, tokens: 0, xp: 0 }, eggId: 'shadowscale' },
      boss: { id: 'boss', minLevel: 5, bg: 'volcanic_ruins_chasm', worldW: 1300, berriesNeeded: 0, bushes: 2, raiders: 0, spitters: 0, skimmers: 0, bonus: { food: 0, dna: 4, tokens: 60, xp: 0 }, firstKill: { dna: 6, tokens: 60 }, bossId: 'thornback' },
      /* Emberlands (levels 11-20): lava pools and erupting heat vents, tougher enemies */
      ember: { id: 'ember', minLevel: 11, biome: 'ember', bg: 'volcanic_ruins_chasm', worldW: 11000, berriesNeeded: 5, bushes: 14, raiders: 5, spitters: 2, skimmers: 2, bonus: { food: 8, dna: 4, tokens: 70, xp: 180 }, eggId: 'ember', enemyMul: { hp: 1.4, dmg: 1.25 }, hazards: { pools: 9, vents: 9 } },
      /* Frostfang Peaks (levels 21-30): freezing weather, slippery ice, campfires, scarce food */
      frost: { id: 'frost', minLevel: 21, biome: 'frost', bg: 'aurora_celestial_sanctuary', worldW: 11500, berriesNeeded: 4, bushes: 9, raiders: 4, spitters: 2, skimmers: 2, bonus: { food: 6, dna: 5, tokens: 90, xp: 240 }, eggId: 'frost', enemyMul: { hp: 1.9, dmg: 1.5 }, hazards: { ice: 11, fires: 6 }, regenMul: 0.5 },
      titan: { id: 'titan', minLevel: 25, biome: 'frost', bg: 'aurora_celestial_sanctuary', worldW: 1500, berriesNeeded: 0, bushes: 2, raiders: 0, spitters: 0, skimmers: 0, bonus: { food: 0, dna: 8, tokens: 140, xp: 0 }, firstKill: { dna: 14, tokens: 180 }, bossId: 'whitetitan', enemyMul: { hp: 1.9, dmg: 1.5 }, hazards: { ice: 6, fires: 2 }, regenMul: 0.5 },
      /* The Lost Mire (levels 31-40): poison bogs, glowcaps, camouflaged ambushers */
      mire: { id: 'mire', minLevel: 31, biome: 'mire', bg: 'bioluminescent_spino_swamp', worldW: 12000, berriesNeeded: 4, bushes: 9, raiders: 5, spitters: 2, skimmers: 2, camo: 0.55, bonus: { food: 7, dna: 6, tokens: 110, xp: 300 }, eggId: 'mire', enemyMul: { hp: 2.4, dmg: 1.8 }, hazards: { bogs: 12, glow: 7 }, regenMul: 0.6 },
      queen: { id: 'queen', minLevel: 35, biome: 'mire', bg: 'bioluminescent_spino_swamp', worldW: 1500, berriesNeeded: 0, bushes: 2, raiders: 0, spitters: 0, skimmers: 0, bonus: { food: 0, dna: 10, tokens: 170, xp: 0 }, firstKill: { dna: 16, tokens: 220 }, bossId: 'mirequeen', enemyMul: { hp: 2.4, dmg: 1.8 }, hazards: { bogs: 6, glow: 3 }, regenMul: 0.6 },
      cinder: { id: 'cinder', minLevel: 15, biome: 'ember', bg: 'volcanic_ruins_chasm', worldW: 1500, berriesNeeded: 0, bushes: 2, raiders: 0, spitters: 0, skimmers: 0, bonus: { food: 0, dna: 6, tokens: 100, xp: 0 }, firstKill: { dna: 10, tokens: 120 }, bossId: 'cinderjaw', enemyMul: { hp: 1.4, dmg: 1.25 }, hazards: { pools: 0, vents: 7 } }
    },
    tutorial: { worldW: 2100 },
    missionPool: [
      { id: 'berries', event: 'berry', goal: 10, reward: { tokens: 20 } },
      { id: 'raiders', event: 'kill:raider', goal: 5, reward: { dna: 2 } },
      { id: 'dodge', event: 'dodge', goal: 8, reward: { tokens: 15 } },
      { id: 'abilities', event: 'ability', goal: 4, reward: { tokens: 15 } },
      { id: 'expeditions', event: 'expedition', goal: 2, reward: { tokens: 25 } },
      { id: 'enemies', event: 'kill', goal: 12, reward: { dna: 1, tokens: 10 } }
    ],
    missionsPerDay: 3
  };

  /* bosses: Thornback (Verdant Valley) and Cinderjaw (Emberlands) */
  DF.balance.boss.id = 'thornback'; DF.balance.boss.name = 'THORNBACK';
  DF.balance.bosses = {
    thornback: DF.balance.boss,
    whitetitan: { id: 'whitetitan', name: 'WHITE TITAN', hp: 850, speed: 74, size: 250, xp: 800, chargeWindup: 850, chargeSpeed: 450, chargeTime: 700, chargeDmg: 35, slamWindup: 800, slamRadius: 158, slamDmg: 30, recover: 1000, armor: 0.45, adds: 2, phase2At: 0.5, enrageSpeed: 1.4, sprite: 'boss-whitetitan' },
    mirequeen: { id: 'mirequeen', name: 'MIRE QUEEN', hp: 1000, speed: 76, size: 250, xp: 1000, chargeWindup: 820, chargeSpeed: 455, chargeTime: 700, chargeDmg: 38, slamWindup: 780, slamRadius: 160, slamDmg: 32, recover: 1000, armor: 0.45, adds: 3, phase2At: 0.5, enrageSpeed: 1.4, sprite: 'boss-mirequeen' },
    cinderjaw: { id: 'cinderjaw', name: 'CINDERJAW', hp: 420, speed: 80, size: 235, xp: 520, chargeWindup: 800, chargeSpeed: 440, chargeTime: 700, chargeDmg: 26, slamWindup: 780, slamRadius: 150, slamDmg: 22, recover: 1150, armor: 0.55, adds: 2, phase2At: 0.5, enrageSpeed: 1.4, sprite: 'boss-cinderjaw' }
  };
  /* heat resistance by evolution path (Emberlands hazards) */
  DF.balance.evolution.paths.ironhide.heat = 0.5; DF.balance.evolution.paths.wildspark.heat = 0.2;
  /* cold resistance (Frostfang Peaks): Swiftclaw's feathers keep the warmth in */
  /* poison resistance (Lost Mire): Ironhide's thick hide shrugs off the bog */
  DF.balance.evolution.paths.swiftclaw.poison = 0.1; DF.balance.evolution.paths.ironhide.poison = 0.4; DF.balance.evolution.paths.wildspark.poison = 0.25;
  DF.balance.evolution.paths.swiftclaw.cold = 0.35; DF.balance.evolution.paths.ironhide.cold = 0.1; DF.balance.evolution.paths.wildspark.cold = 0.15;
  /* Frostfang weather: calm spells, a warning, then a blizzard. Chill (0-100) rises outside warm spots; at 100 you freeze (slower, and losing health). */
  DF.balance.weather = { calm: [15000, 22000], warn: 3200, storm: [9000, 12000], chillCalm: 0.9, chillStorm: 7, freezeDps: 4, freezeSlow: 0.78, fireRadius: 135, fireCool: 28, berryWarm: 30, iceAccelMs: 520 };
  DF.balance.biomes = { verdant: { minLevel: 1, objs: ['egg', 'forage', 'boss'] }, ember: { minLevel: 11, objs: ['ember', 'cinder'] }, frost: { minLevel: 21, objs: ['frost', 'titan'] }, mire: { minLevel: 31, objs: ['mire', 'queen'] } };
  /* Lost Mire rules: bog poison lingers after you leave; glowcaps cure it and expose hidden predators; camouflaged enemies reveal when you get close */
  DF.balance.mire = { poisonMs: 3500, tick: 500, dps: 6, glowRadius: 55, revealMs: 7000, camoRadius: 230, revealRadius: 520 };
  DF.biomeOf = function (objId) { var o = DF.balance.objectives[objId]; return (o && o.biome) || 'verdant'; };
  DF.balance.hazards = { poolDps: 10, poolTick: 400, ventDamage: 20, ventIdle: [2600, 4200], ventWarn: 950, ventBurst: 650, ventRx: 50, ventRy: 46 };

  /* ---------- helpers ---------- */
  function clamp(n, lo, hi) { n = Number(n); if (!isFinite(n)) n = lo; return Math.min(hi, Math.max(lo, n)); }
  DF.clamp = clamp;

  DF.levelFromXp = function (xp) {
    var t = DF.balance.xpThresholds, lv = 1;
    for (var i = 0; i < t.length; i++) if (xp >= t[i]) lv = i + 1;
    return Math.min(DF.balance.maxLevel, lv);
  };
  DF.xpProgress = function (xp) {
    var t = DF.balance.xpThresholds, lv = DF.levelFromXp(xp);
    if (lv >= DF.balance.maxLevel) return { level: lv, pct: 100, into: 0, need: 0 };
    var lo = t[lv - 1], hi = t[lv];
    return { level: lv, pct: Math.round(100 * (xp - lo) / (hi - lo)), into: xp - lo, need: hi - lo };
  };

  DF.upgradeCost = function (id, level) {
    var u = DF.balance.upgrades[id];
    return Math.round(u.base * (1 + level * 0.75) / 5) * 5;
  };

  /* Player stats from save state. Health and energy are runtime values and not saved. */
  DF.playerStats = function (save) {
    var b = DF.balance, p = b.player, lv = save.player.level, up = save.upgrades || {};
    var path = save.profile.selectedEvolution ? b.evolution.paths[save.profile.selectedEvolution] : null;
    var s = {
      maxHealth: p.maxHealth + (lv - 1) * b.levelBonus.healthPerLevel + (up.hide || 0) * b.upgrades.hide.healthPerLevel + (path ? path.maxHealthAdd : 0),
      maxEnergy: p.maxEnergy,
      energyRegen: p.energyRegen * (1 + (up.stam || 0) * b.upgrades.stam.regenPerLevel),
      speed: p.speed * (path ? path.speedMul : 1),
      attackPower: p.attackPower + Math.floor((lv - 1) / 2) * b.levelBonus.powerEveryTwoLevels,
      defence: path ? path.defence : 0,
      bossDefence: path ? path.bossDefence : 0,
      critChance: path ? path.critChance : 0,
      critMul: path ? path.critMul : 1,
      dashCost: path ? path.dashCost : b.dash.cost,
      foodMul: 1 + (up.snout || 0) * b.upgrades.snout.foodPerLevel,
      ability: path ? path.ability : b.baseAbility,
      heatResist: path ? (path.heat || 0) : 0,
      coldResist: path ? (path.cold || 0) : 0,
      poisonResist: path ? (path.poison || 0) : 0,
      path: save.profile.selectedEvolution,
      sprite: path ? path.sprite : 'dino-starter'
    };
    return s;
  };

  /* ---------- save defaults and validation (TECH 5.1, 7) ---------- */
  var EVOS = { swiftclaw: 1, ironhide: 1, wildspark: 1 };
  var SPECIES = ['starter', 'raider', 'spitter', 'skimmer', 'thornback', 'cinderjaw', 'whitetitan', 'mirequeen'];
  var EGGS = ['shadowscale', 'glade', 'prism', 'ember', 'frost', 'mire'];
  DF.SPECIES = SPECIES; DF.EGGS = EGGS;

  function uuid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  DF.defaultSave = function () {
    return {
      schemaVersion: 1, updatedAt: new Date().toISOString(), installId: uuid(),
      profile: { tutorialStep: 0, tutorialCompleted: false, firstExpeditionCompleted: false, selectedEvolution: null, unlockedTraits: [], storySeen: false },
      player: { level: 1, experience: 0 },
      inventory: { food: 0, dnaFragments: 0, frontierTokens: 0, genesisCrystals: 0 },
      discoveries: { eggs: [], codexSpecies: ['starter'] },
      upgrades: {},
      progress: { bossesDefeated: [], grantedRewardIds: [], expeditions: 0 },
      missions: { resetKey: '', lastSeenLocalDate: '', active: [], progress: {}, claimedRewardIds: [] },
      settings: { musicEnabled: true, sfxEnabled: true, musicVolume: 70, sfxVolume: 85, muteAll: false, vibrationEnabled: true, reducedEffects: false, controlSensitivity: 6, language: 'en' },
      consent: { analytics: 'unset', decidedAt: null, policyVersion: 1 }
    };
  };
  function strArr(a, max, allow) {
    var out = [];
    if (Array.isArray(a)) for (var i = 0; i < a.length && out.length < max; i++) {
      var v = String(a[i]).slice(0, 64);
      if ((!allow || allow.indexOf(v) >= 0) && out.indexOf(v) < 0) out.push(v);
    }
    return out;
  }
  /* Never trust parsed JSON blindly: rebuild every field with caps and defaults. Returns null if unusable. */
  DF.sanitizeSave = function (raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    if (typeof raw.schemaVersion !== 'number' || raw.schemaVersion < 1 || raw.schemaVersion > 1) return null;
    var d = DF.defaultSave(), c = DF.balance.caps;
    var pr = raw.profile || {}, pl = raw.player || {}, inv = raw.inventory || {}, di = raw.discoveries || {}, up = raw.upgrades || {}, pg = raw.progress || {}, ms = raw.missions || {}, st = raw.settings || {}, co = raw.consent || {};
    var out = d;
    out.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : d.updatedAt;
    out.installId = typeof raw.installId === 'string' && raw.installId.length >= 8 && raw.installId.length <= 80 ? raw.installId : d.installId;
    out.profile.tutorialStep = clamp(pr.tutorialStep, 0, 4) | 0;
    out.profile.tutorialCompleted = pr.tutorialCompleted === true;
    out.profile.firstExpeditionCompleted = pr.firstExpeditionCompleted === true;
    out.profile.selectedEvolution = EVOS[pr.selectedEvolution] ? pr.selectedEvolution : null;
    out.profile.unlockedTraits = strArr(pr.unlockedTraits, 20);
    out.profile.storySeen = pr.storySeen === true;
    out.player.experience = clamp(pl.experience, 0, c.xp) | 0;
    out.player.level = DF.levelFromXp(out.player.experience);
    out.inventory.food = clamp(inv.food, 0, c.resource) | 0;
    out.inventory.dnaFragments = clamp(inv.dnaFragments, 0, c.resource) | 0;
    out.inventory.frontierTokens = clamp(inv.frontierTokens, 0, c.resource) | 0;
    out.inventory.genesisCrystals = clamp(inv.genesisCrystals, 0, c.resource) | 0;
    out.discoveries.eggs = strArr(di.eggs, 10, EGGS);
    out.discoveries.codexSpecies = strArr(di.codexSpecies, 20, SPECIES);
    if (out.discoveries.codexSpecies.indexOf('starter') < 0) out.discoveries.codexSpecies.unshift('starter');
    Object.keys(DF.balance.upgrades).forEach(function (k) { var n = clamp(up[k], 0, DF.balance.upgrades[k].max) | 0; if (n) out.upgrades[k] = n; });
    out.progress.bossesDefeated = strArr(pg.bossesDefeated, 10);
    out.progress.grantedRewardIds = strArr(pg.grantedRewardIds, 500);
    out.progress.expeditions = clamp(pg.expeditions, 0, 1e6) | 0;
    out.missions.resetKey = /^\d{4}-\d{2}-\d{2}$/.test(ms.resetKey) ? ms.resetKey : '';
    out.missions.lastSeenLocalDate = /^\d{4}-\d{2}-\d{2}$/.test(ms.lastSeenLocalDate) ? ms.lastSeenLocalDate : '';
    var poolIds = DF.balance.missionPool.map(function (m) { return m.id; });
    out.missions.active = strArr(ms.active, 5, poolIds);
    out.missions.claimedRewardIds = strArr(ms.claimedRewardIds, 50);
    if (ms.progress && typeof ms.progress === 'object') poolIds.forEach(function (id) { var n = clamp(ms.progress[id], 0, 9999) | 0; if (n) out.missions.progress[id] = n; });
    out.settings.musicEnabled = st.musicEnabled !== false;
    out.settings.sfxEnabled = st.sfxEnabled !== false;
    out.settings.musicVolume = clamp(st.musicVolume == null ? 70 : st.musicVolume, 0, 100) | 0;
    out.settings.sfxVolume = clamp(st.sfxVolume == null ? 85 : st.sfxVolume, 0, 100) | 0;
    out.settings.muteAll = st.muteAll === true;
    out.settings.vibrationEnabled = st.vibrationEnabled !== false;
    out.settings.reducedEffects = st.reducedEffects === true;
    out.settings.controlSensitivity = clamp(st.controlSensitivity == null ? 6 : st.controlSensitivity, 1, 10) | 0;
    out.settings.language = 'en';
    out.consent.analytics = (co.analytics === 'granted' || co.analytics === 'denied') ? co.analytics : 'unset';
    out.consent.decidedAt = typeof co.decidedAt === 'string' ? co.decidedAt.slice(0, 40) : null;
    out.consent.policyVersion = 1;
    return out;
  };

  /* ---------- daily reset policy (PRD 7.4; TECH 7.9) ---------- */
  DF.localDateKey = function (d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  };
  DF.msToMidnight = function (now) {
    now = now || new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return Math.max(0, next - now);
  };
  /* Returns true if the missions state changed. Never resets backward when the clock moves earlier. */
  DF.rollDaily = function (save, now) {
    var ms = save.missions, today = DF.localDateKey(now), changed = false;
    if (!ms.resetKey || !ms.active.length) {
      ms.resetKey = today; ms.lastSeenLocalDate = today; DF.pickMissions(save); return true;
    }
    if (today > ms.lastSeenLocalDate) {
      if (today > ms.resetKey) { ms.resetKey = today; DF.pickMissions(save); }
      ms.lastSeenLocalDate = today; changed = true;
    }
    return changed;
  };
  DF.pickMissions = function (save) {
    var ms = save.missions, rng = DF.createRng(ms.resetKey + '|' + save.installId);
    var pool = DF.balance.missionPool.slice(), ids = [];
    while (ids.length < DF.balance.missionsPerDay && pool.length) ids.push(pool.splice(Math.floor(rng.next() * pool.length), 1)[0].id);
    ms.active = ids; ms.progress = {}; ms.claimedRewardIds = [];
  };
  DF.missionDef = function (id) { return DF.balance.missionPool.filter(function (m) { return m.id === id; })[0]; };
  DF.missionEvent = function (save, ev, n) {
    var ms = save.missions;
    ms.active.forEach(function (id) {
      var d = DF.missionDef(id);
      if (d && (d.event === ev)) ms.progress[id] = Math.min(d.goal, (ms.progress[id] || 0) + (n || 1));
    });
  };
  /* Claim is idempotent: keyed by resetKey:missionId. Returns the reward or null. */
  DF.claimMission = function (save, id) {
    var ms = save.missions, d = DF.missionDef(id), key = ms.resetKey + ':' + id;
    if (!d || ms.active.indexOf(id) < 0) return null;
    if ((ms.progress[id] || 0) < d.goal) return null;
    if (ms.claimedRewardIds.indexOf(key) >= 0) return null;
    ms.claimedRewardIds.push(key);
    DF.addResources(save, d.reward);
    return d.reward;
  };

  /* ---------- economy ---------- */
  DF.addResources = function (save, r) {
    var inv = save.inventory, cap = DF.balance.caps.resource;
    if (r.food) inv.food = Math.min(cap, inv.food + r.food);
    if (r.dna) inv.dnaFragments = Math.min(cap, inv.dnaFragments + r.dna);
    if (r.tokens) inv.frontierTokens = Math.min(cap, inv.frontierTokens + r.tokens);
    if (r.crystals) inv.genesisCrystals = Math.min(cap, inv.genesisCrystals + r.crystals);
    if (r.xp) save.player.experience = Math.min(DF.balance.caps.xp, save.player.experience + r.xp);
    save.player.level = DF.levelFromXp(save.player.experience);
  };
  /* Commit an expedition reward exactly once (idempotent by grantId). Returns the applied reward or null. */
  DF.commitGrant = function (save, grantId, reward) {
    var ids = save.progress.grantedRewardIds;
    if (ids.indexOf(grantId) >= 0) return null;
    ids.push(grantId);
    if (ids.length > 400) ids.splice(0, ids.length - 400);
    DF.addResources(save, reward);
    return reward;
  };
  DF.canAfford = function (save, cost) {
    var inv = save.inventory;
    return (!cost.tokens || inv.frontierTokens >= cost.tokens) && (!cost.dna || inv.dnaFragments >= cost.dna);
  };
  DF.spend = function (save, cost) {
    if (!DF.canAfford(save, cost)) return false;
    if (cost.tokens) save.inventory.frontierTokens -= cost.tokens;
    if (cost.dna) save.inventory.dnaFragments -= cost.dna;
    return true;
  };
  DF.evolveCost = function (save) {
    return save.profile.selectedEvolution ? { tokens: DF.balance.evolution.switchTokenCost } : { dna: DF.balance.evolution.dnaCost };
  };
  DF.discover = function (save, kind, id) {
    var list = kind === 'egg' ? save.discoveries.eggs : save.discoveries.codexSpecies;
    if (list.indexOf(id) >= 0) return false;
    list.push(id); return true;
  };
  DF.objectiveUnlocked = function (save, id) { return save.player.level >= DF.balance.objectives[id].minLevel; };

  /* analytics hook: no-op unless the player accepted (PRIV-01); no provider is wired yet */
  DF.track = function (name, details) {
    try { if (DF.save && DF.save.consent.analytics === 'granted' && DF.analyticsSink) DF.analyticsSink(name, details || {}, DF.save.installId); } catch (e) {}
  };
  /* rewarded-ad hook (CLAUDE.md): no ads yet, so the reward is granted straight away */
  DF.offerReward = function (onDone) { if (typeof onDone === 'function') onDone(); };
})(window.DF);
