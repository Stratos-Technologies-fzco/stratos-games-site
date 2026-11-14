/* Crystal Quest content: 5 worlds x 20 levels, built from data rules so every level is the same kind of JSON object.
   Add a world or more levels by adding rows to WORLDS and PATTERN; the game reads everything from here.
   Level types (12): Crystal Collection (collect), Ice Breaker + Stone Breaker (blockers), Ancient Treasure (treasure),
   Forest Restoration (restore), Magic Rescue (rescue), Crystal Path (path), Time Challenge (time), Boss Battle (boss),
   Energy Collection (energy), Portal Challenge (portal), Mixed Challenge (mixed) and Score (score). */
(function (root) {
  'use strict';

  var Sets = root.CQSets || (typeof require !== 'undefined' ? require('./sets.js') : null);
  /* Give one level its own gem set: { levelNumber: 'set_id' }. Anything not listed follows the rules in sets.js. */
  var LEVEL_SET_OVERRIDES = {};

  var COLOR_NAMES = ['Ruby', 'Sapphire', 'Emerald', 'Topaz', 'Amethyst', 'Diamond'];
  var COLOR_ART = ['crystal_01_ruby', 'crystal_02_sapphire', 'crystal_03_emerald', 'crystal_04_topaz', 'crystal_05_amethyst', 'crystal_06_diamond'];

  var WORLDS = [
    { id: 1, name: 'Crystal Valley', bg: 'bg_01_crystal_valley', music: 'music_02_crystal_valley', gem: 0, boss: { name: 'Stone Golem', art: 'boss_01_stone_golem', hp: 230, every: 5, count: 2 }, hero: 'character_01_eldrin', blockers: ['cage', 'wood'],
      projects: ['Ancient Bridge', 'Wizard Tower', 'Magical Waterfall', 'Crystal Fountain', 'Crystal Fountain Court'] },
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

  /* What each of levels 1-19 of a world is (level 20 is always the boss). */
  var PATTERN = [
    ['collect', 'collect', 'score', 'collect', 'blockers', 'path', 'collect', 'score', 'time', 'mixed', 'blockers', 'treasure', 'collect', 'energy', 'rescue', 'score', 'mixed', 'time', 'path'],
    ['collect', 'blockers', 'score', 'collect', 'blockers', 'path', 'treasure', 'mixed', 'time', 'blockers', 'energy', 'rescue', 'collect', 'score', 'treasure', 'mixed', 'time', 'blockers', 'path'],
    ['collect', 'blockers', 'restore', 'collect', 'restore', 'rescue', 'mixed', 'time', 'treasure', 'score', 'blockers', 'restore', 'energy', 'collect', 'rescue', 'mixed', 'time', 'restore', 'blockers'],
    ['collect', 'treasure', 'blockers', 'collect', 'treasure', 'score', 'mixed', 'time', 'rescue', 'blockers', 'path', 'energy', 'treasure', 'mixed', 'score', 'time', 'blockers', 'treasure', 'collect'],
    ['collect', 'blockers', 'portal', 'collect', 'mixed', 'portal', 'energy', 'time', 'blockers', 'score', 'portal', 'treasure', 'mixed', 'rescue', 'time', 'portal', 'energy', 'mixed', 'blockers']
  ];

  /* The five characters */
  var CHAR = {
    character_01_eldrin: { name: 'Eldrin', role: 'Ancient Wizard' },
    character_02_luma: { name: 'Luma', role: 'Magical Fairy' },
    character_03_arkon: { name: 'Arkon', role: 'Crystal Guardian' },
    character_04_nyra: { name: 'Nyra', role: 'Forest Guardian' },
    character_05_shadow_lord: { name: 'Shadow Lord', role: 'The villain' }
  };
  var E_ = 'character_01_eldrin', L_ = 'character_02_luma', A_ = 'character_03_arkon', N_ = 'character_04_nyra', S_ = 'character_05_shadow_lord';
  /* Story cards shown in the level intro. Key = level number (1-100). */
  var DIALOGUE = {
    1: [E_, 'The Crystal Heart is broken, Guardian. Swap two neighbouring crystals to line up three of a colour.'],
    2: [L_, 'Make four in a row and a bolt crystal is born. Swap it to light up a whole line!'],
    3: [E_, 'You earned a Hammer for finishing level 2! Tap it under the board, then tap a crystal to smash it.'],
    4: [A_, 'Five in a row makes a Rainbow crystal. Swap it with any colour to clear that colour!'],
    5: [L_, 'Cages hold crystals still. Match the crystal inside to free it.'],
    6: [E_, 'Light up the glowing path by clearing the crystals that sit on it.'],
    9: [A_, 'A Time Challenge! No move limit, but the clock is ticking. Think fast.'],
    10: [E_, 'Halfway to the Valley Palace. The Shadow Lord grows nervous.'],
    12: [L_, 'Ancient treasure is hidden at the top. Clear crystals below it so it falls to the bottom.'],
    15: [L_, 'Little crystals are trapped in cages. Set them free, Guardian!'],
    18: [S_, 'Do not hope, Guardian. The Heart will never be whole again.'],
    20: [E_, 'The Stone Golem guards the first crystal. Strike hard, and watch its freezing attacks!'],
    21: [L_, 'Brrr! The Frozen Mountains. Ice hides crystals under their shine. Match the crystal on top to crack it.'],
    25: [A_, 'Stone is tough. Special crystals break it faster. Save them for the big blocks.'],
    28: [N_, 'Treasure sinks in the snow. Bring the chests down to the ground.'],
    30: [E_, 'Halfway up the mountain. Keep your streak, Guardian.'],
    35: [S_, 'The cold is my friend. Soon the whole kingdom will freeze!'],
    40: [L_, 'The Ice Dragon! Be brave. Break its frost to save your crystals.'],
    41: [N_, 'Welcome to the Enchanted Forest. The trees are sick. Clear the grey patches to bring the forest back.'],
    45: [N_, 'Magic chains bind the old trees. Break them and the forest will sing again.'],
    50: [E_, 'You are a true Guardian. The forest feels your magic.'],
    55: [L_, 'Fairy friends are caged here. Please set them free!'],
    58: [S_, 'Every crystal you find, I will take. Every one!'],
    60: [N_, 'The Forest Witch has poisoned the Elder Tree. Beat her to heal it.'],
    61: [A_, 'The Lost Desert hides ancient treasure. Bring it down, then find the way through.'],
    65: [A_, 'Ancient seals need three matches. Patience, Guardian.'],
    70: [E_, 'The sun is high and the clock is ticking. Fast fingers win here.'],
    75: [N_, 'Even the desert has life. Look, the oasis is coming back.'],
    78: [S_, 'The sand will bury you, little Guardian!'],
    80: [A_, 'The Sand Titan rises! Special crystals will crack its shell.'],
    81: [E_, 'Dragon Kingdom. Lava burns under the crystals. Match them to cool it down.'],
    85: [A_, 'Shadow portals leak darkness. Clear next to them to close them.'],
    90: [N_, 'Only the Fire Dragon is left before the Shadow Lord. You can do it.'],
    95: [L_, 'I believe in you, Guardian! Keep going!'],
    98: [S_, 'You are strong. But not strong enough!'],
    100: [E_, 'The Fire Dragon guards the last crystal. Win, and the Crystal Heart glows again!']
  };
  var VICTORY = ['Well done, Guardian!', 'Wonderful! The kingdom is healing.', 'Crystal clear! Nicely played.', 'The Shadow Lord trembles!', 'You make magic look easy!', 'Another step closer to the Heart!'];
  var BOSS_TAUNT = ['"You will never mend the Heart, Guardian!"', '"My frost will freeze your hopes!"', '"The forest is mine now!"', '"The sand will bury you!"', '"Burn, little Guardian!"'];

  /* Star targets [2 stars, 3 stars] for each of the 100 levels, measured from real play by tests/stars.js --write. */
  var STAR_TABLE = [[3300,5700],[2200,3800],[3900,6000],[2200,3800],[2100,3600],[2100,3600],[2200,3900],[4400,6700],[4100,6200],[2100,3700],[1800,3200],[5200,9000],[2000,3400],[2000,3500],[1600,2800],[4100,5400],[2100,3600],[4800,7400],[1900,3200],[4400,7600],[2400,4200],[3500,6000],[4200,6500],[2400,4100],[3500,6000],[3300,5700],[2800,4800],[3200,5600],[4600,7100],[2500,4400],[2000,3400],[2500,4400],[1600,2700],[4400,6100],[3600,6200],[1700,3000],[4900,7500],[1500,2700],[1800,3100],[5200,9000],[1900,3300],[2100,3600],[2000,3500],[1900,3300],[2000,3500],[1800,3200],[1900,3400],[4500,6900],[3100,5400],[5200,7300],[1500,2700],[1900,3200],[2000,3400],[2200,3700],[1700,3000],[1500,2500],[5100,7600],[1800,3100],[2300,4000],[6100,10600],[2100,3600],[5300,9200],[2000,3500],[2300,3900],[3600,6200],[4900,7600],[2300,4000],[4700,7200],[1400,2400],[2600,4600],[1600,2800],[2300,3900],[5300,9200],[1900,3200],[5400,7100],[5400,8000],[3400,6000],[5500,9600],[2200,3800],[6600,11400],[2300,4000],[2100,3600],[2000,3500],[2900,5100],[2100,3600],[1600,2800],[1900,3300],[4800,7300],[1600,2800],[5100,6800],[1100,2000],[4500,7700],[1600,2700],[1700,2900],[5600,8500],[1100,2000],[2400,4200],[1400,2400],[1500,2500],[6300,10900]];

  /* small helper: pick items deterministically from a level number */
  function hash(n) { n = (n * 2654435761) >>> 0; n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; return (n ^ (n >>> 13)) >>> 0; }

  /* Board shapes: rows, cols, holes */
  function shape(name, rows, cols) {
    var holes = [], c;
    if (name === 'corners') { holes = [[0, 0], [0, cols - 1], [rows - 1, 0], [rows - 1, cols - 1]]; }
    else if (name === 'notch') { holes = [[0, 3], [0, 4], [rows - 1, 3], [rows - 1, 4]]; if (cols < 8) holes = [[0, 2], [rows - 1, 2]]; }
    else if (name === 'arch') { for (c = 2; c < cols - 2; c++) holes.push([rows - 1, c]); holes.push([rows - 2, 3], [rows - 2, cols - 4]); if (cols < 8) holes = [[rows - 1, 2], [rows - 1, 3]]; }
    return holes;
  }

  function build(world, lv) {            // lv = 1..20
    var W = WORLDS[world - 1], idx = (world - 1) * 20 + lv;       // 1..100
    var h = hash(idx), isBoss = lv === 20;
    var type = isBoss ? 'boss' : PATTERN[world - 1][lv - 1];
    var ramp = (lv - 1) / 19;                                       // 0..1 inside the world
    var wr = (world - 1) / 4;                                       // 0..1 across worlds
    var colors = (world === 1 && lv === 1) ? 4 : (lv > 12 ? 6 : 5);
    if (world >= 4 && lv > 6) colors = 6;
    colors = Math.max(4, Math.min(6, colors));
    var rows = 8, cols = 8, holes = [];
    if (lv >= 7 && lv % 4 === 3) holes = shape('corners', rows, cols);
    if (lv >= 11 && lv % 5 === 1) holes = shape('notch', rows, cols);
    if (lv >= 15 && lv % 5 === 4) holes = shape('arch', rows, cols);
    if (lv === 1 || lv === 2) holes = [];
    var moves = Math.round(30 - ramp * 4 - wr * 2 + (lv <= 3 ? 8 : 0));
    var objectives = [], blockers = [], time = 0, items = 0;

    var kinds = W.blockers.slice(0, lv >= 12 ? W.blockers.length : lv >= 5 ? Math.max(1, W.blockers.length - 1) : 1);
    function place(kind, count, seed) {
      var placed = 0, tries = 0, used = {};
      blockers.forEach(function (b) { used[b.r + ',' + b.c] = 1; });
      var holeSet = {}; holes.forEach(function (p) { holeSet[p[0] + ',' + p[1]] = 1; });
      while (placed < count && tries < 400) {
        tries++;
        var s = hash(seed + tries * 7919);
        var r = 1 + (s % (rows - 2)), c = 1 + ((s >>> 8) % (cols - 2));
        var key = r + ',' + c;
        if (used[key] || holeSet[key]) continue;
        used[key] = 1; blockers.push({ r: r, c: c, kind: kind }); placed++;
      }
      return placed;
    }
    /* a winding path of lit tiles from the left edge to the right edge */
    function trail(seed) {
      var r = 2 + (hash(seed) % (rows - 4)), n = 0, holeSet = {}, used = {}; holes.forEach(function (p) { holeSet[p[0] + ',' + p[1]] = 1; });
      function add(rr, cc) { var k = rr + ',' + cc; if (holeSet[k] || used[k]) return; used[k] = 1; blockers.push({ r: rr, c: cc, kind: 'path' }); n++; }
      for (var c = 0; c < cols; c++) {
        add(r, c);
        var step = (hash(seed + c * 13) % 3) - 1; r = Math.max(1, Math.min(rows - 2, r + step));
        if (c < cols - 1 && step !== 0) add(r, c);
      }
      return n;
    }
    var six = colors === 6 ? 0.8 : 1;
    var collectN = Math.round((16 + ramp * 18 + wr * 8) * six);
    var gemA = (W.gem + lv) % colors, gemB = (W.gem + lv * 2 + 1) % colors;
    var scoreN = Math.round((2000 + ramp * 3200 + wr * 2000) * six / 100) * 100;
    var base = 1800 + ramp * 3500 + wr * 2200;

    if (type === 'boss') {
      objectives.push({ type: 'boss' }); moves = 30 + world * 3; colors = 5; holes = [];
      place(W.blockers[0], 3 + world, idx * 31);
      base = 4000 + world * 1200;
    } else if (type === 'collect') {
      if (lv <= 2) objectives.push({ type: 'collect', color: W.gem % colors, n: lv === 1 ? 12 : 16 });
      else { objectives.push({ type: 'collect', color: gemA, n: collectN }); if (lv > 10) objectives.push({ type: 'collect', color: gemB, n: Math.round(collectN * 0.6) }); }
    } else if (type === 'blockers') {
      var k = kinds[h % kinds.length], want = (k === 'seal' || k === 'wall') ? 3 + Math.round(ramp * 2) : (k === 'stone' || k === 'dark') ? 4 + Math.round(ramp * 4) : 5 + Math.round(ramp * 6);
      want = place(k, want, idx * 17); objectives.push({ type: 'blockers', kind: k, n: want });
    } else if (type === 'score') {
      objectives.push({ type: 'score', n: scoreN }); base = scoreN; moves += 3;
      if (lv > 8) place(kinds[(h >>> 3) % kinds.length], 4, idx * 13);
    } else if (type === 'mixed') {
      var k4 = kinds[(h >>> 5) % kinds.length], w4 = (k4 === 'seal' || k4 === 'wall') ? 3 : 4 + Math.round(ramp * 3);
      w4 = place(k4, w4, idx * 23);
      objectives.push({ type: 'blockers', kind: k4, n: w4 }); objectives.push({ type: 'collect', color: gemA, n: Math.round(collectN * 0.6) });
    } else if (type === 'time') {
      time = Math.round(85 - ramp * 15 - wr * 5);
      var tn = Math.round((1800 + ramp * 2200 + wr * 1500) / 100) * 100;
      objectives.push({ type: 'score', n: tn }); base = tn; moves = 0;
    } else if (type === 'treasure') {
      items = Math.min(cols - 2, 2 + Math.round(ramp) + (world > 3 ? 1 : 0)); colors = Math.min(colors, 5);
      objectives.push({ type: 'treasure', n: items }); moves = 33;
    } else if (type === 'rescue') {
      var cn = place('cage', 4 + Math.round(ramp * 4), idx * 29); objectives.push({ type: 'rescue', n: cn });
    } else if (type === 'path') {
      var pn = trail(idx * 41); objectives.push({ type: 'path', n: pn }); moves = 32;
    } else if (type === 'restore') {
      var cnt = place('moss', 12 + Math.round(ramp * 6), idx * 43); objectives.push({ type: 'restore', n: Math.max(8, cnt - 3) }); moves = 32;
    } else if (type === 'energy') {
      objectives.push({ type: 'energy', n: Math.round((45 + ramp * 55 + wr * 20) / 5) * 5 }); moves = 28;
    } else if (type === 'portal') {
      var pc = place('portal', 3 + Math.round(ramp * 3), idx * 47); objectives.push({ type: 'portal', n: pc });
    }

    var scoreLike = type === 'score' || type === 'time' || type === 'boss';
    var stars = [0, Math.round((scoreLike ? base * 1.25 : base + 1200) / 100) * 100, Math.round((scoreLike ? base * 1.7 : base + 2600) / 100) * 100];
    if (STAR_TABLE && STAR_TABLE[idx - 1]) stars = [0, STAR_TABLE[idx - 1][0], STAR_TABLE[idx - 1][1]];
    var L = { id: idx, world: world, num: lv, type: type, rows: rows, cols: cols, colors: colors, moves: moves, holes: holes, blockers: blockers,
              objectives: objectives, stars: stars };
    if (time) L.time = time;
    if (items) L.items = items;
    L.crystalSet = LEVEL_SET_OVERRIDES[idx] || Sets.defaultSetFor(world, lv);
    if (Sets.isGuest(world, lv) && !LEVEL_SET_OVERRIDES[idx]) L.guest = true;
    if (isBoss) L.boss = { name: W.boss.name, art: W.boss.art, hp: W.boss.hp, every: W.boss.every, count: W.boss.count };
    L.tip = tipFor(world, lv, type, blockers);
    return L;
  }

  /* One short lesson the first time a new idea appears (saved once seen). */
  function tipFor(world, lv, type, blockers) {
    if (world === 1 && lv === 1) return 'swap';
    if (type === 'boss') return 'boss';
    if (world === 1 && lv === 3) return 'boosters';
    if (world === 1 && lv === 7) return 'starters';
    if (world === 1 && lv === 4) return 'special4';
    if (type === 'time' || type === 'treasure' || type === 'rescue' || type === 'path' || type === 'restore' || type === 'energy' || type === 'portal') return 'type_' + type;
    var kinds = {}; blockers.forEach(function (b) { kinds[b.kind] = 1; });
    var order = ['wood', 'cage', 'ice', 'stone', 'chain', 'seal', 'lava', 'dark', 'wall', 'portal'];
    for (var i = 0; i < order.length; i++) if (kinds[order[i]]) return 'blk_' + order[i];
    return null;
  }
  var TIPS = {
    swap:      { title: 'How to play', text: 'Swap two neighbouring crystals to line up 3 of the same colour. Reach the goal before you run out of moves.' },
    boosters:  { title: 'Boosters', text: 'Boosters are under the board. Tap one, then tap a crystal if it asks you to. You earn more by winning levels, finishing a daily reward, or getting 3 stars.' },
    starters:  { title: 'Starter boosters', text: 'Below the goals you can pick a starter. A Ruby Bomb, Lightning or Rainbow crystal starts on the board, or a Magic Shield protects you.' },
    special4:  { title: 'Bolt crystals', text: 'Line up 4 and a bolt crystal appears. Swap it to clear a whole row or column. 5 in a row makes a Rainbow!' },
    boss:      { title: 'Boss battle', text: 'Every crystal you clear hurts the boss. Beat its health to zero. Watch out: it freezes crystals every few moves. Clear them to break the frost.' },
    type_time:     { title: 'Time challenge', text: 'No move limit here, but the clock runs while you play. Reach the score before time is up. The timer stops while crystals are moving.' },
    type_treasure: { title: 'Ancient treasure', text: 'Chests cannot be matched. Clear the crystals under a chest so it falls. Reach the bottom row to collect it.' },
    type_rescue:   { title: 'Magic rescue', text: 'Free all the caged crystals. Match the crystal inside a cage to set it free.' },
    type_path:     { title: 'Crystal path', text: 'Light up every tile on the glowing path by clearing the crystal that sits on it.' },
    type_restore:  { title: 'Forest restoration', text: 'Green patches are grey and sick. Clear the crystal on a patch to heal it.' },
    type_energy:   { title: 'Energy collection', text: 'Fill the energy bar. Special crystals, big matches and chain reactions give the most energy.' },
    type_portal:   { title: 'Portal challenge', text: 'Close the shadow portals by clearing crystals right next to them.' },
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
    L.id = 'daily-' + dateStr; L.daily = true; L.seed = seed; L.tip = null; L.type = 'score';
    L.crystalSet = Sets.dailySet(dateStr); delete L.guest;
    delete L.time; delete L.items;
    L.blockers = L.blockers.filter(function (b) { return b.kind !== 'path' && b.kind !== 'moss' && b.kind !== 'portal'; });
    L.objectives = [{ type: 'score', n: 3000 + (seed % 7) * 300 }];
    L.stars = [0, L.objectives[0].n + 1500, L.objectives[0].n + 3500];
    L.moves = 24;
    return L;
  }

  root.CQLevels = { WORLDS: WORLDS, LOCKED_WORLDS: LOCKED_WORLDS, LEVELS: LEVELS, COLOR_NAMES: COLOR_NAMES, COLOR_ART: COLOR_ART, DIALOGUE: DIALOGUE, CHAR: CHAR, VICTORY: VICTORY, BOSS_TAUNT: BOSS_TAUNT, TIPS: TIPS, PATTERN: PATTERN, LEVEL_SET_OVERRIDES: LEVEL_SET_OVERRIDES, daily: daily };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CQLevels;
})(typeof window !== 'undefined' ? window : globalThis);
