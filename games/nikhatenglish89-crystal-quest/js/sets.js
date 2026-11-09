/* Crystal sets: which gem pictures a level uses. This file only knows about pictures.
   The rules engine (engine.js) never sees it: for the engine a gem is just a colour 0-5 (ruby, sapphire, emerald, topaz, amethyst, diamond).
   To add a set: see extras/docs/crystal-quest/CRYSTAL_SETS.md. */
(function (root) {
  'use strict';

  var GEMS = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'];
  var FILES = ['crystal_01_ruby', 'crystal_02_sapphire', 'crystal_03_emerald', 'crystal_04_topaz', 'crystal_05_amethyst', 'crystal_06_diamond'];
  var CLASSIC = 'set_01_classic';

  /* rim = the thin ring drawn around special crystals on a board that uses this set (the colours come from tools/gen_crystal_sets.py).
     worldNum = the world it belongs to; sets of worlds that are not playable yet (6-9) show as "coming soon" and stay locked. */
  var SETS = [
    { id: CLASSIC, name: 'Classic Gems', world: 'Crystal Valley', worldNum: 1, dir: 'assets/crystals', rim: '#FFFFFF' },
    { id: 'set_02_frozen_shards', name: 'Frozen Shards', world: 'Frozen Mountains', worldNum: 2, dir: 'assets/crystal_sets/set_02_frozen_shards', rim: '#DFF6FF' },
    { id: 'set_03_forest_leaves', name: 'Forest Leaves', world: 'Enchanted Forest', worldNum: 3, dir: 'assets/crystal_sets/set_03_forest_leaves', rim: '#E8D7A0' },
    { id: 'set_04_desert_relics', name: 'Desert Relics', world: 'Lost Desert', worldNum: 4, dir: 'assets/crystal_sets/set_04_desert_relics', rim: '#FFE08A' },
    { id: 'set_05_dragon_scales', name: 'Dragon Scales', world: 'Dragon Kingdom', worldNum: 5, dir: 'assets/crystal_sets/set_05_dragon_scales', rim: '#FFB347' },
    { id: 'set_06_ocean_pearls', name: 'Ocean Pearls', world: 'Ocean Kingdom', worldNum: 6, dir: 'assets/crystal_sets/set_06_ocean_pearls', rim: '#FFFFFF' },
    { id: 'set_07_sky_feathers', name: 'Sky Feathers', world: 'Sky Kingdom', worldNum: 7, dir: 'assets/crystal_sets/set_07_sky_feathers', rim: '#FFFFFF' },
    { id: 'set_08_dark_obsidian', name: 'Dark Obsidian', world: 'Dark Kingdom', worldNum: 8, dir: 'assets/crystal_sets/set_08_dark_obsidian', rim: '#B78BFF' },
    { id: 'set_09_celestial_stars', name: 'Celestial Stars', world: 'Celestial Kingdom', worldNum: 9, dir: 'assets/crystal_sets/set_09_celestial_stars', rim: '#FFE9A0' }
  ];
  var PLAYABLE_WORLDS = 5;                       // worlds 1-5 can be played today
  var GUEST_LEVELS = [5, 10, 15];                // "Guest Gem" levels use the previous world's set
  var BOSS_GLOW = ['#9BE08A', '#8FD3FF', '#C79BFF', '#FFD27A', '#FF8A3C'];   // the glow around the board on each world's boss level

  function byId(id) { for (var i = 0; i < SETS.length; i++) if (SETS[i].id === id) return SETS[i]; return null; }
  function isSet(id) { return !!byId(id); }
  function gemIndex(gem) { return typeof gem === 'number' ? gem : GEMS.indexOf(gem); }
  /* The one place that turns "this gem in this set" into a picture. */
  function textureKey(gem, setId) {
    var i = gemIndex(gem); if (i < 0 || i > 5) throw new Error('unknown gem ' + gem);
    return (isSet(setId) ? setId : CLASSIC) + '/' + FILES[i];
  }
  function gemSrc(gem, setId) {
    var i = gemIndex(gem); if (i < 0 || i > 5) throw new Error('unknown gem ' + gem);
    var s = byId(setId) || byId(CLASSIC);
    return s.dir + '/' + FILES[i] + '.svg';
  }
  function isGuest(world, num) { return GUEST_LEVELS.indexOf(num) > -1 && num !== 20; }
  /* The set a level uses when its data does not say: the world's set, or the previous world's set on guest levels (world 1 borrows Forest Leaves). */
  function defaultSetFor(world, num) {
    var w = Math.max(1, Math.min(PLAYABLE_WORLDS, world));
    if (isGuest(world, num)) { var guestWorld = world === 1 ? 3 : world - 1; return SETS[guestWorld - 1].id; }
    return SETS[w - 1].id;
  }
  /* Daily Puzzle: the same set for everybody on the same date */
  function dailySet(dateStr) {
    var h = 0; for (var i = 0; i < dateStr.length; i++) h = (h * 33 + dateStr.charCodeAt(i)) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0;
    return SETS[(h >>> 7) % PLAYABLE_WORLDS].id;
  }
  /* Level data check: crystalSet is optional; if it is there it must be a known set. Returns a list of problems (empty = fine). */
  function validateLevel(L) {
    var bad = [];
    if (L.crystalSet !== undefined && !isSet(L.crystalSet)) bad.push('level ' + L.id + ': unknown crystalSet "' + L.crystalSet + '"');
    return bad;
  }
  function setOfLevel(L) { return isSet(L && L.crystalSet) ? L.crystalSet : (L && L.world ? defaultSetFor(L.world, L.num || 1) : CLASSIC); }

  var api = { GEMS: GEMS, FILES: FILES, SETS: SETS, CLASSIC: CLASSIC, PLAYABLE_WORLDS: PLAYABLE_WORLDS, GUEST_LEVELS: GUEST_LEVELS, BOSS_GLOW: BOSS_GLOW,
    byId: byId, isSet: isSet, textureKey: textureKey, gemSrc: gemSrc, isGuest: isGuest, defaultSetFor: defaultSetFor, dailySet: dailySet, validateLevel: validateLevel, setOfLevel: setOfLevel };
  root.CQSets = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
