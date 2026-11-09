/* Run: node tests/features.test.js   (new level types, starters, new boosters, timer) */
'use strict';
var assert = require('assert');
var Engine = require('../js/engine.js');
var Lv = require('../js/levels.js');
var passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e)); } }
function make(rows, opts) {
  opts = opts || {};
  var L = { rows: rows.length, cols: rows[0].length, colors: 6, moves: opts.moves || 20, objectives: opts.objectives || [{ type: 'score', n: 999999 }], stars: [0, 1, 2], blockers: opts.blockers || [], holes: [], time: opts.time, items: 0 };
  var e = new Engine(L, opts.seed || 5);
  for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) { var ch = rows[r][c]; e.grid[r][c] = (ch === '.' || e.solidAt(r, c)) ? null : e._mk('abcdef'.indexOf(ch)); }
  return e;
}
var B5 = ['abcde', 'cdeab', 'eabcd', 'bcdea', 'deabc'];
var B6 = ['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd'];

console.log('Level types');
test('all 12 level types appear in the 100 levels', function () {
  var seen = {}; Lv.LEVELS.forEach(function (L) { seen[L.type] = (seen[L.type] || 0) + 1; });
  ['collect', 'blockers', 'score', 'mixed', 'time', 'treasure', 'rescue', 'path', 'restore', 'energy', 'portal', 'boss'].forEach(function (t) { assert.ok(seen[t] >= 3, t + ' only ' + (seen[t] || 0)); });
  var ice = Lv.LEVELS.some(function (L) { return L.objectives.some(function (o) { return o.type === 'blockers' && o.kind === 'ice'; }); });
  var stone = Lv.LEVELS.some(function (L) { return L.objectives.some(function (o) { return o.type === 'blockers' && o.kind === 'stone'; }); });
  assert.ok(ice && stone, 'ice breaker and stone breaker levels');
});
test('every level has what its goal needs on the board', function () {
  Lv.LEVELS.forEach(function (L) {
    var e = new Engine(JSON.parse(JSON.stringify(L)), L.id);
    var count = function (k) { var n = 0; for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) if (e.blk[r][c] && e.blk[r][c].kind === k) n++; return n; };
    L.objectives.forEach(function (o) {
      if (o.type === 'treasure') { var items = 0; for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) if (e.grid[r][c] && e.grid[r][c].item) items++; assert.strictEqual(items, o.n, 'level ' + L.id + ' treasures'); }
      if (o.type === 'rescue') assert.ok(count('cage') >= o.n, 'level ' + L.id + ' cages');
      if (o.type === 'path') assert.ok(count('path') >= o.n, 'level ' + L.id + ' path');
      if (o.type === 'restore') assert.ok(count('moss') >= o.n, 'level ' + L.id + ' moss');
      if (o.type === 'portal') assert.ok(count('portal') >= o.n, 'level ' + L.id + ' portals');
    });
    if (L.type === 'time') { assert.ok(e.timed && e.timeLeft >= 55); }
  });
});

console.log('Treasure');
test('a treasure cannot be matched or smashed, and falls to the bottom to be collected', function () {
  var e = make(B5); e.grid[0][0] = { id: 99, color: -3, sp: null, item: true };
  e.L.objectives = [{ type: 'treasure', n: 1 }];
  assert.strictEqual(e.findMatches().length, 0);
  e._clear([[0, 0]], null, [], 1, []); assert.ok(e.grid[0][0] && e.grid[0][0].item, 'item was smashed');
  var steps = []; e._clear([[1, 0], [2, 0], [3, 0], [4, 0]], null, steps, 1, []); e._fall(steps);
  assert.strictEqual(e.itemsOut, 1); assert.ok(e.objectiveProgress()[0].done);
  assert.ok(steps.some(function (s) { return s.k === 'item'; }));
  for (var r = 0; r < 5; r++) assert.ok(e.grid[r][0], 'hole left at ' + r);
});
test('hammer will not break a treasure', function () { var e = make(B5); e.grid[2][2] = { id: 98, color: -3, sp: null, item: true }; assert.strictEqual(e.useBooster('hammer', [2, 2]).ok, false); });

console.log('Energy, rescue, path, forest, portal');
test('energy grows from specials and chains', function () {
  var e = make(B6, { objectives: [{ type: 'energy', n: 10 }] }); e.grid[2][2].sp = 'bomb'; var steps = [], fx = [];
  var cells = e._expand([[2, 2]], null, fx); e._clear(cells, null, steps, 1, fx); assert.ok(e.energy >= 5, 'energy ' + e.energy);
});
test('rescue counts broken cages', function () { var e = make(B5, { blockers: [{ r: 2, c: 2, kind: 'cage' }], objectives: [{ type: 'rescue', n: 1 }] }); e._clear([[2, 2]], null, [], 1, []); assert.ok(e.objectiveProgress()[0].done); });
test('path tiles light up when the crystal on them is cleared', function () { var e = make(B5, { blockers: [{ r: 1, c: 1, kind: 'path' }, { r: 1, c: 2, kind: 'path' }], objectives: [{ type: 'path', n: 2 }] }); e._clear([[1, 1], [1, 2]], null, [], 1, []); assert.ok(e.objectiveProgress()[0].done); });
test('forest patches heal', function () { var e = make(B5, { blockers: [{ r: 3, c: 3, kind: 'moss' }], objectives: [{ type: 'restore', n: 1 }] }); e._clear([[3, 3]], null, [], 1, []); assert.ok(e.objectiveProgress()[0].done); });
test('portals close next to a clear', function () { var e = make(B5, { blockers: [{ r: 2, c: 2, kind: 'portal' }], objectives: [{ type: 'portal', n: 1 }] }); e._clear([[2, 1]], null, [], 1, []); assert.ok(e.objectiveProgress()[0].done); });

console.log('Time challenge');
test('the clock runs down, loses at zero, and a second chance gives time back', function () {
  var e = make(B5, { time: 3 }); assert.ok(e.timed); assert.deepStrictEqual(e.tick(1), []); assert.deepStrictEqual(e.tick(1), []);
  var s = e.tick(1); assert.strictEqual(e.state, 'lose'); assert.strictEqual(s[0].result, 'lose');
  assert.ok(Array.isArray(e.reviveWithMoves(5))); assert.strictEqual(e.state, 'ready'); assert.ok(e.timeLeft >= 20);
});
test('moves never run out in a time challenge', function () { var e = make(B5, { time: 60 }); assert.ok(e.moves >= 900); });
test('+5 moves booster gives seconds in a time challenge', function () { var e = make(B5, { time: 30 }); e.useBooster('moves'); assert.strictEqual(e.timeLeft, 45); });

console.log('Boosters');
test('lightning strike clears a row', function () { var e = make(B6); var r = e.useBooster('strike', [2, 3]); assert.ok(r.ok); assert.ok(e.collected.reduce(function (a, b) { return a + b; }) >= 6); });
test('magic wand turns a crystal into a special without using a move', function () { var e = make(B6); var m = e.moves, t = e.grid[2][2]; var r = e.useBooster('wand', [2, 2]); assert.ok(r.ok); assert.ok(t.sp); assert.strictEqual(e.moves, m); assert.ok(r.steps.some(function (s) { return s.k === 'wand'; })); });
test('wand will not work on a special', function () { var e = make(B5); e.grid[2][2].sp = 'bomb'; assert.strictEqual(e.useBooster('wand', [2, 2]).ok, false); });
test('starters: bomb, lightning and rainbow appear on the board', function () {
  var e = make(B6); e.applyStarters(['bomb', 'lightning', 'rainbow']);
  var sp = []; for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) if (e.grid[r][c].sp) sp.push(e.grid[r][c].sp); assert.deepStrictEqual(sp.sort(), ['bomb', 'lightning', 'rainbow']);
});
test('magic shield gives +3 moves, or blocks the first boss attack', function () {
  var e = make(B5, { moves: 10 }); e.applyStarters(['shield']); assert.strictEqual(e.moves, 13);
  var L = JSON.parse(JSON.stringify(Lv.LEVELS[19])); var b = new Engine(L, 4); b.applyStarters(['shield']); assert.ok(b.shield);
  var steps = []; b.moveCount = L.boss.every; b._bossAttack(steps); assert.ok(steps.some(function (s) { return s.k === 'shield'; })); assert.strictEqual(b.shield, false);
});

console.log('Story');
test('story cards use the five characters and only known art', function () {
  var who = {}; Object.keys(Lv.DIALOGUE).forEach(function (k) { assert.ok(Lv.CHAR[Lv.DIALOGUE[k][0]], 'unknown character at ' + k); who[Lv.DIALOGUE[k][0]] = 1; assert.ok(+k >= 1 && +k <= 100); });
  assert.strictEqual(Object.keys(who).length, 5); assert.ok(Object.keys(Lv.DIALOGUE).length >= 30);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
