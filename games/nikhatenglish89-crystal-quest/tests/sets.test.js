/* Run: node tests/sets.test.js   Gem sets: names, rules, level data, and "the engine does not care which set is used". */
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var Sets = require('../js/sets.js'), Engine = require('../js/engine.js'), Lv = require('../js/levels.js');
var root = path.join(__dirname, '..');
var passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e)); } }

console.log('textureKey and files');
test('textureKey: every gem in every set has its own key, by name or by number', function () {
  var seen = {};
  Sets.SETS.forEach(function (s) { Sets.GEMS.forEach(function (g, i) { var k = Sets.textureKey(g, s.id); assert.strictEqual(k, Sets.textureKey(i, s.id)); assert.ok(!seen[k], 'duplicate ' + k); seen[k] = 1; }); });
  assert.strictEqual(Object.keys(seen).length, 9 * 6);
});
test('every gem picture of every set is a real file', function () {
  Sets.SETS.forEach(function (s) { Sets.GEMS.forEach(function (g) { var f = path.join(root, Sets.gemSrc(g, s.id)); assert.ok(fs.existsSync(f), 'missing ' + f); assert.ok(fs.statSync(f).size > 500, 'empty ' + f); }); });
});
test('crystal_sets.json lists the same eight themed sets and files', function () {
  var j = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'crystal_sets', 'crystal_sets.json'), 'utf8'));
  assert.strictEqual(Object.keys(j).length, 8);
  Object.keys(j).forEach(function (id) { assert.ok(Sets.isSet(id), id); Sets.GEMS.forEach(function (g) { assert.strictEqual(path.join(root, j[id].crystals[g]), path.join(root, Sets.gemSrc(g, id))); }); });
});
test('an unknown set falls back to classic, an unknown gem is an error', function () {
  assert.strictEqual(Sets.gemSrc('ruby', 'set_99_nope'), 'assets/crystals/crystal_01_ruby.svg');
  assert.throws(function () { Sets.textureKey('pearl', Sets.CLASSIC); });
});

console.log('Rules');
test('levels 1-4 and the other normal levels use the world set', function () {
  Lv.LEVELS.forEach(function (L) { if (L.num === 20 || [5, 10, 15].indexOf(L.num) > -1) return; assert.strictEqual(L.crystalSet, Sets.SETS[L.world - 1].id, 'level ' + L.id); assert.ok(!L.guest); });
});
test('levels 5, 10, 15 are Guest Gem levels with the previous world set (world 1 borrows Forest Leaves)', function () {
  Lv.LEVELS.forEach(function (L) { if ([5, 10, 15].indexOf(L.num) === -1) return; var want = L.world === 1 ? 'set_03_forest_leaves' : Sets.SETS[L.world - 2].id; assert.strictEqual(L.crystalSet, want, 'level ' + L.id); assert.strictEqual(L.guest, true); });
});
test('boss levels use the world set', function () { Lv.LEVELS.forEach(function (L) { if (L.num === 20) assert.strictEqual(L.crystalSet, Sets.SETS[L.world - 1].id); }); assert.strictEqual(Sets.BOSS_GLOW.length, 5); });
test('Daily Puzzle: same set for a date, always a playable set, and it varies over days', function () {
  var seen = {}; for (var d = 1; d <= 60; d++) { var day = '2026-11-' + ('0' + (d % 28 + 1)).slice(-2) + '-' + d; var a = Lv.daily(day), b = Lv.daily(day); assert.strictEqual(a.crystalSet, b.crystalSet); assert.ok(Sets.SETS.slice(0, 5).some(function (s) { return s.id === a.crystalSet; })); seen[a.crystalSet] = 1; }
  assert.ok(Object.keys(seen).length >= 3, 'only ' + Object.keys(seen).length + ' different sets over 60 days');
});
test('a level can be given its own set with LEVEL_SET_OVERRIDES', function () { assert.ok(Lv.LEVEL_SET_OVERRIDES && typeof Lv.LEVEL_SET_OVERRIDES === 'object'); });

console.log('Level data check');
test('the check accepts levels without crystalSet and with a good one, and rejects a bad one', function () {
  assert.deepStrictEqual(Sets.validateLevel({ id: 1 }), []);
  assert.deepStrictEqual(Sets.validateLevel({ id: 2, crystalSet: 'set_04_desert_relics' }), []);
  assert.strictEqual(Sets.validateLevel({ id: 3, crystalSet: 'set_00_none' }).length, 1);
});
test('all 100 levels pass the check, and a level with no crystalSet still gets the right default', function () {
  Lv.LEVELS.forEach(function (L) { assert.deepStrictEqual(Sets.validateLevel(L), [], 'level ' + L.id); var bare = JSON.parse(JSON.stringify(L)); delete bare.crystalSet; assert.strictEqual(Sets.setOfLevel(bare), L.crystalSet, 'default for level ' + L.id); });
});

console.log('The engine does not care');
test('the engine file never mentions sets or pictures', function () { var src = fs.readFileSync(path.join(root, 'js', 'engine.js'), 'utf8'); assert.ok(!/crystalSet|set_0\d|CQSets|\.svg|textureKey/.test(src)); });
test('the same level plays out identically with every set id (same seed, same moves)', function () {
  var base = null;
  Sets.SETS.concat([{ id: undefined }]).forEach(function (s) {
    var out = [];
    [1, 12, 20, 43].forEach(function (id) {
      var L = JSON.parse(JSON.stringify(Lv.LEVELS[id - 1])); if (s.id) L.crystalSet = s.id; else delete L.crystalSet;
      var e = new Engine(L, 4242 + id), n = 0; while (e.state === 'ready' && n++ < 25) { var h = e.findHint(); if (!h) break; e.trySwap(h[0], h[1]); }
      out.push([e.state, e.score, e.moves, e.collected.join('.'), JSON.stringify(e.objectiveProgress())].join('|'));
    });
    var joined = out.join('#'); if (base === null) base = joined; assert.strictEqual(joined, base, 'result changed with set ' + s.id);
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
