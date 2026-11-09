/* Crystal Quest content: 5 worlds x 20 levels, built from data rules so every level is the same kind of JSON object.
   Add a world or more levels by adding rows to WORLDS; the game reads everything from here. */
(function (root) {
  'use strict';

  var COLOR_NAMES = ['Ruby', 'Sapphire', 'Emerald', 'Topaz', 'Amethyst', 'Diamond'];
  var COLOR_ART = ['crystal_01_ruby', 'crystal_02_sapphire', 'crystal_03_emerald', 'crystal_04_topaz', 'crystal_05_amethyst', 'crystal_06_diamond'];

  var WORLDS = [
    { id: 1, name: 'Crystal Valley', bg: 'bg_01_crystal_valley', music: 'music_02_crystal_valley', gem: 0, boss: { name: 'Stone Golem', art: 'boss_01_stone_golem', hp: 230, every: 5, count: 2 }, hero: 'character_01_eldrin', blockers: ['cage', 'wood'],
      projects: ['Ancient Bridge', 'Wizard Tower', 'Magical Waterfall', 'Crystal Fountain', 'Valley Palace'] },
    { id: 2, name: 'Frozen Mountains', bg: 'bg_02_frozen_mountains', music: 'music_03_frozen_mountains', gem: 1, boss: { name: 'Ice Dragon', art: 'boss_02_ice_dragon', hp: 280, every: 4, count: 2 }, hero: 'character_02_luma', blockers: ['ice', 'stone'],
      projects: ['Frozen Gate', 'Snow Watchtower', 'Ice Bridge', 'Aurora Fountain', 'Ice Castle'] },
    { id: 3, name: 'Enchanted Forest', bg: 'bg_03_enchanted_forest', music: 'music_04_enchanted_forest', gem: 2, boss: { name: 'Forest Witch', art: 'boss_03_forest_witch', hp: 320, every: 4, count: 3 }, hero: 'character_04_nyra', blockers: ['chain', 'wood', 'ice'],
      projects: ['Rope Bridge', 'Treehouse', 'Glow Pond', 'Fairy Ring', 'Elder Tree'] },
    { id: 4, name: 'Lost Desert', bg: 'bg_04_lost_desert', music: 'music_05_lost_desert', gem: 3, boss: { name: 'Sand Titan', art: 'boss_04_sand_titan', hp: 360, every: 4, count: 3 }, hero: 'character_03_arkon', blockers: ['stone', 'seal', 'cage'],
      projects: ['Oasis Well', 'Sun Temple', 'Camel Market', 'Golden Obelisk', 'Pharaoh Gate'] },
    { id: 5, name: 'Dragon Kingdom', bg: 'bg_05_dragon_kingdom', music: 'music_06_dragon_kingdom', gem: 4, boss: { name: 'Fire Dragon', art: 'boss_05_fire_dragon', hp: 400, every: 3, count: 3 }, hero: 'character_01_eldrin', blockers: ['lava', 'dark', 'wall', 'portal'],
      projects: ['Lava Bridge', 'Dragon Cave', 'Ember Forge', 'Fire Fountain', 'Dragon Throne'] }
  ];
  var LOCKED_WORLDS = ['Ocean Kingdom', 'Sky Kingdom', 'Dark Kingdom', 'Celestial Kingdom', 'Crystal Palace'];

  var DIALOGUE = {
    1: { who: 'character_01_eldrin', name: 'Eldrin', text: 'The Crystal Heart is broken, Guardian. Swap two neighbouring crystals to line up three of a colour.' },
    2: { who: 'character_02_luma', name: 'Luma', text: 'Make four in a row and a bolt crystal is born. Swap it to light up a whole line!' },
    3: { who: 'character_01_eldrin', name: 'Eldrin', text: 'Wooden boxes block the way. Clear crystals right next to a box to break it.' },
    4: { who: 'character_02_luma', name: 'Luma', text: 'Cages hold crystals still. Match the crystal inside to free it.' },
    5: { who: 'character_03_arkon', name: 'Arkon', text: 'Five in a row makes a Rainbow crystal. Swap it with any colour to clear that colour!' }
  };

  /* small helper: pick items deterministically from a level number */
  function hash(n) { n = (n * 2654435761) >>> 0; n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; return (n ^ (n >>> 13)) >>> 0; }

  /* Board shapes: rows, cols, holes */
  function shape(name, rows, cols) {
    var holes = [], r, c;
    if (name === 'corners') { holes = [[0, 0], [0, cols - 1], [rows - 1, 0], [rows - 1, cols - 1]]; }
    else if (name === 'diamond') {
      var mid = (cols - 1) / 2;
      for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) { var d = Math.abs(r - (rows - 1) / 2) + Math.abs(c - mid); if (d > Math.max(rows, cols) / 2 + 1.2) holes.push([r, c]); }
    }
    else if (name === 'notch') { holes = [[0, 3], [0, 4], [rows - 1, 3], [rows - 1, 4]]; if (cols < 8) holes = [[0, 2], [rows - 1, 2]]; }
    else if (name === 'arch') { for (c = 2; c < cols - 2; c++) holes.push([rows - 1, c]); holes.push([rows - 2, 3], [rows - 2, cols - 4]); if (cols < 8) holes = [[rows - 1, 2], [rows - 1, 3]]; }
    return holes;
  }

  function build(world, lv) {            // lv = 1..20
    var W = WORLDS[world - 1], idx = (world - 1) * 20 + lv;       // 1..100
    var h = hash(idx), isBoss = lv === 20;
    var ramp = (lv - 1) / 19;                                       // 0..1 inside the world
    var wr = (world - 1) / 4;                                       // 0..1 across worlds
    var colors = Math.min(6, 4 + (lv > 4 ? 1 : 0) + (lv > 12 ? 1 : 0) + (world > 3 ? 0 : 0));
    if (world >= 4 && lv > 6) colors = 6;
    colors = Math.max(4, Math.min(6, colors));
    var rows = 8, cols = 8, holes = [];
    if (lv >= 7 && lv % 4 === 3) holes = shape('corners', rows, cols);
    if (lv >= 11 && lv % 5 === 1) holes = shape('notch', rows, cols);
    if (lv >= 15 && lv % 5 === 4) holes = shape('arch', rows, cols);
    if (lv === 1 || lv === 2) { rows = 7; cols = 7; holes = []; }
    var moves = Math.round(30 - ramp * 6 - wr * 4 + (lv <= 3 ? 8 : 0));
    var objectives = [], blockers = [], note = null;

    // pick blockers allowed so far in this world
    var kinds = W.blockers.slice(0, lv >= 12 ? W.blockers.length : lv >= 5 ? Math.max(1, W.blockers.length - 1) : 1);
    function place(kind, count, seed) {
      var placed = 0, tries = 0, used = {};
      blockers.forEach(function (b) { used[b.r + ',' + b.c] = 1; });
      var holeSet = {}; holes.forEach(function (p) { holeSet[p[0] + ',' + p[1]] = 1; });
      var mode = root.CQEngine ? root.CQEngine.BLOCKERS[kind].mode : 'under';
      while (placed < count && tries < 300) {
        tries++;
        var s = hash(seed + tries * 7919);
        var r = 1 + (s % (rows - 2)), c = 1 + ((s >>> 8) % (cols - 2));
        if (mode === 'solid' && (r === 0)) continue;
        var key = r + ',' + c;
        if (used[key] || holeSet[key]) continue;
        used[key] = 1; blockers.push({ r: r, c: c, kind: kind }); placed++;
      }
      return placed;
    }

    if (isBoss) {
      objectives.push({ type: 'boss' });
      moves = 30 + world * 3;
      colors = 5;
      holes = [];
      place(W.blockers[0], 3 + world, idx * 31);
    } else {
      var type = lv % 4;                  // 1 collect, 2 blockers (if any), 3 score, 0 mixed
      var gemA = (W.gem + lv) % colors, gemB = (W.gem + lv * 2 + 1) % colors;
      var collectN = Math.round(18 + ramp * 22 + wr * 10);
      if (lv <= 2) { objectives.push({ type: 'collect', color: W.gem % colors, n: lv === 1 ? 12 : 16 }); }
      else if (lv < 5 || type === 1) { objectives.push({ type: 'collect', color: gemA, n: collectN }); if (lv > 10) objectives.push({ type: 'collect', color: gemB, n: Math.round(collectN * 0.7) }); }
      else if (type === 2) {
        var k = kinds[h % kinds.length], want = 5 + Math.round(ramp * 6);
        place(k, want, idx * 17);
        objectives.push({ type: 'blockers', kind: k, n: want });
      }
      else if (type === 3) { objectives.push({ type: 'score', n: Math.round((2500 + ramp * 5500 + wr * 3000) / 100) * 100 }); if (lv > 8) { var k3 = kinds[(h >>> 3) % kinds.length]; place(k3, 4, idx * 13); } }
      else {
        var k4 = kinds[(h >>> 5) % kinds.length], w4 = 4 + Math.round(ramp * 4);
        place(k4, w4, idx * 23);
        objectives.push({ type: 'blockers', kind: k4, n: w4 });
        objectives.push({ type: 'collect', color: gemA, n: Math.round(collectN * 0.8) });
      }
      // scatter extra blockers for flavour on later levels
      if (lv > 6 && type !== 2 && type !== 0) { place(kinds[0], 2 + Math.round(ramp * 4), idx * 5); }
    }

    var target = objectives.filter(function (o) { return o.type === 'score'; })[0];
    var base = isBoss ? 4000 + world * 1200 : target ? target.n : (1800 + ramp * 3500 + wr * 2200);
    var stars = [0, Math.round(base * 1.25 / 100) * 100, Math.round(base * 1.7 / 100) * 100];
    if (!isBoss && !target) { stars[1] = Math.round((base + 1200) / 100) * 100; stars[2] = Math.round((base + 2600) / 100) * 100; }

    return { id: idx, world: world, num: lv, rows: rows, cols: cols, colors: colors, moves: moves, holes: holes, blockers: blockers,
             objectives: objectives, stars: stars, boss: isBoss ? { name: W.boss.name, art: W.boss.art, hp: W.boss.hp, every: W.boss.every, count: W.boss.count } : null,
             tip: tipFor(world, lv, objectives, blockers) };
  }

  /* Short teaching card shown the first time a new idea appears. Key = tip id (saved once seen). */
  function tipFor(world, lv, objectives, blockers) {
    if (world === 1 && lv === 1) return 'swap';
    if (objectives.some(function (o) { return o.type === 'boss'; })) return 'boss';
    var kinds = {}; blockers.forEach(function (b) { kinds[b.kind] = 1; });
    var order = ['wood', 'cage', 'ice', 'stone', 'chain', 'seal', 'lava', 'dark', 'wall', 'portal'];
    for (var i = 0; i < order.length; i++) if (kinds[order[i]]) return 'blk_' + order[i];
    if (lv === 4) return 'special4';
    return null;
  }
  var TIPS = {
    swap:      { title: 'How to play', text: 'Swap two neighbouring crystals to line up 3 of the same colour. Reach the goal before you run out of moves.' },
    special4:  { title: 'Bolt crystals', text: 'Line up 4 and a bolt crystal appears. Swap it to clear a whole row or column. 5 in a row makes a Rainbow!' },
    boss:      { title: 'Boss battle', text: 'Every crystal you clear hurts the boss. Beat its health to zero. Watch out: it freezes crystals every few moves. Clear them to break the frost.' },
    blk_wood:  { title: 'Wooden box', text: 'Clear crystals right next to a box to break it.' },
    blk_cage:  { title: 'Crystal cage', text: 'A caged crystal cannot move. Match it to break the cage.' },
    blk_ice:   { title: 'Ice', text: 'Ice sits under a crystal. Match the crystal on top to crack the ice.' },
    blk_stone: { title: 'Stone block', text: 'Stone is tough. Clear crystals next to it, again and again.' },
    blk_chain: { title: 'Magic chain', text: 'Chains hold a crystal still. Match it, or clear next to it, to break the chain.' },
    blk_seal:  { title: 'Ancient seal', text: 'A seal needs three matches on the crystal inside.' },
    blk_lava:  { title: 'Lava tile', text: 'Match the crystal on the lava to cool it down.' },
    blk_dark:  { title: 'Dark crystal', text: 'Dark crystals crack after two clears next to them.' },
    blk_wall:  { title: 'Crystal wall', text: 'Walls are very strong: three clears next to it. Special crystals help a lot.' },
    blk_portal:{ title: 'Shadow portal', text: 'Clear next to a portal to close it.' }
  };

  var LEVELS = [];
  for (var w = 1; w <= 5; w++) for (var l = 1; l <= 20; l++) LEVELS.push(build(w, l));

  /* The daily challenge: one puzzle per day, same for everybody (uses the date as the seed). */
  function daily(dateStr) {
    var seed = 0; for (var i = 0; i < dateStr.length; i++) seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
    var world = 1 + (seed % 5), lv = 8 + ((seed >>> 4) % 11);     // medium-hard, never a boss
    var L = JSON.parse(JSON.stringify(build(world, lv)));
    L.id = 'daily-' + dateStr; L.daily = true; L.seed = seed; L.tip = null;
    L.objectives = [{ type: 'score', n: 3000 + (seed % 7) * 300 }];
    L.stars = [0, L.objectives[0].n + 1500, L.objectives[0].n + 3500];
    L.moves = 24;
    return L;
  }

  root.CQLevels = { WORLDS: WORLDS, LOCKED_WORLDS: LOCKED_WORLDS, LEVELS: LEVELS, COLOR_NAMES: COLOR_NAMES, COLOR_ART: COLOR_ART, DIALOGUE: DIALOGUE, TIPS: TIPS, daily: daily };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CQLevels;
})(typeof window !== 'undefined' ? window : globalThis);
