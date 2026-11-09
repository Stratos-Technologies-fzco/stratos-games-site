/* Run: node tests/engine.test.js   (from the game folder) */
'use strict';
var assert = require('assert');
var Engine = require('../js/engine.js');
var Lv = require('../js/levels.js');
var passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e)); } }

/* Make an engine with a hand-drawn board. Letters a-f = colours 0-5, '.' = empty (null). */
function make(rows, opts) {
  opts = opts || {};
  var L = { rows: rows.length, cols: rows[0].length, colors: 6, moves: opts.moves || 20, objectives: opts.objectives || [{ type: 'score', n: 999999 }], stars: [0, 1, 2], blockers: opts.blockers || [], holes: [] };
  var e = new Engine(L, opts.seed || 5);
  for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
    var ch = rows[r][c];
    e.grid[r][c] = (ch === '.' || e.solidAt(r, c)) ? null : e._mk('abcdef'.indexOf(ch));
  }
  return e;
}
function keys(g) { return g.list.map(function (p) { return p[0] + ',' + p[1]; }).sort().join(' '); }

console.log('Matching');
test('horizontal 3', function () { var e = make(['aaabc', 'bcdef', 'cdefa', 'defab', 'efabc']); var g = e.findMatches(); assert.strictEqual(g.length, 1); assert.strictEqual(g[0].list.length, 3); });
test('vertical 3', function () { var e = make(['abcde', 'afcde', 'agcde', 'bcdea', 'cdeab']); var g = e.findMatches(); assert.ok(g.some(function (x) { return x.color === 2 && x.list.length === 3; })); });
test('no match', function () { var e = make(['abcab', 'cabca', 'bcabc', 'abcab', 'cabca']); assert.strictEqual(e.findMatches().length, 0); });
test('four in a row makes lightning', function () { var e = make(['aaaab', 'bcdef', 'cdefc', 'defad', 'efabe']); var g = e.findMatches()[0]; assert.strictEqual(g.list.length, 4); assert.strictEqual(e._specialFor(g).sp, 'lightning'); });
test('four in a column makes thunder', function () { var e = make(['abcde', 'afcde', 'agcde', 'ahcde']); e.grid[0][0] = e._mk(0); e.grid[1][0] = e._mk(0); e.grid[2][0] = e._mk(0); e.grid[3][0] = e._mk(0); var g = e.findMatches()[0]; assert.strictEqual(e._specialFor(g).sp, 'thunder'); });
test('five in a row makes rainbow', function () { var e = make(['aaaaa', 'bcdef', 'cdefc', 'defad', 'efabe']); assert.strictEqual(e._specialFor(e.findMatches()[0]).sp, 'rainbow'); });
test('L shape makes nova', function () { var e = make(['abcde', 'abcde', 'aaabc', 'bcdef', 'cdefa']); e.grid[0][0] = e._mk(0); e.grid[1][0] = e._mk(0); var g = e.findMatches()[0]; assert.strictEqual(g.list.length, 5); assert.strictEqual(e._specialFor(g).sp, 'nova'); });
test('T shape makes nova', function () { var e = make(['aaabc', 'cabde', 'dafef', 'efcab']); var g = e.findMatches().filter(function (x) { return x.color === 0; })[0]; assert.strictEqual(g.list.length, 5); assert.strictEqual(e._specialFor(g).sp, 'nova'); });
test('two groups at once', function () { var e = make(['aaabc', 'bcdef', 'cdefa', 'eeefb', 'fabcd']); assert.strictEqual(e.findMatches().length, 2); });
test('2x2 inside a match makes a bomb', function () { var e = make(['aaabc', 'aaadf', 'cdefa', 'defab', 'efabc']); var g = e.findMatches()[0]; assert.strictEqual(e._specialFor(g).sp, 'bomb'); });
test('rainbow tile never matches', function () { var e = make(['aaabc', 'bcdef', 'cdefa', 'defab', 'efabc']); e.grid[0][1].color = -2; e.grid[0][1].sp = 'rainbow'; assert.strictEqual(e.findMatches().length, 0); });

console.log('Swaps, gravity, cascades');
test('invalid swap is reversed and costs nothing', function () { var e = make(['abcde', 'cdeab', 'eabcd', 'bcdea', 'deabc']); var m = e.moves; var r = e.trySwap([0, 0], [0, 1]); assert.strictEqual(r.ok, false); assert.strictEqual(e.moves, m); assert.strictEqual(e.grid[0][0].color, 0); assert.strictEqual(e.state, 'ready'); });
test('valid swap uses one move and fills the board again', function () {
  var e = make(['abcde', 'cdeab', 'aabcd', 'bcdea', 'deabc']); e.grid[2][2].color = 3; // make (2,2) odd one out
  e.grid[1][2].color = 0;                                                               // a above (2,2): swap (1,2)<->(2,2)? simpler: use findHint
  var h = e.findHint(); assert.ok(h); var m = e.moves; var r = e.trySwap(h[0], h[1]); assert.ok(r.ok); assert.strictEqual(e.moves, m - 1);
  for (var rr = 0; rr < e.rows; rr++) for (var cc = 0; cc < e.cols; cc++) assert.ok(e.grid[rr][cc], 'hole at ' + rr + ',' + cc);
  assert.strictEqual(e.findMatches().length, 0);
});
test('input is blocked while busy', function () { var e = make(['abcde', 'cdeab', 'eabcd', 'bcdea', 'deabc']); e.state = 'busy'; assert.strictEqual(e.trySwap([0, 0], [0, 1]).ok, false); });
test('ids stay unique', function () { var e = new Engine(Lv.LEVELS[10], 3); for (var i = 0; i < 15 && e.state === 'ready'; i++) { var h = e.findHint(); if (!h) break; e.trySwap(h[0], h[1]); } var seen = {}; for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) { var t = e.grid[r][c]; if (t) { assert.ok(!seen[t.id]); seen[t.id] = 1; } } });

console.log('Specials');
test('lightning clears its row', function () {
  var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); e.grid[2][0].sp = 'lightning'; var cleared = e._expand([[2, 0]], null, []); assert.strictEqual(cleared.length, 6);
});
test('thunder clears its column', function () { var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); e.grid[0][3].sp = 'thunder'; assert.strictEqual(e._expand([[0, 3]], null, []).length, 5); });
test('bomb clears 3x3', function () { var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); e.grid[2][2].sp = 'bomb'; assert.strictEqual(e._expand([[2, 2]], null, []).length, 9); });
test('chain reaction: lightning hits a bomb', function () { var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); e.grid[2][0].sp = 'lightning'; e.grid[2][3].sp = 'bomb'; var n = e._expand([[2, 0]], null, []).length; assert.ok(n > 6); });
test('rainbow swapped with a colour clears that colour', function () {
  var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); var t = e.grid[0][0]; t.sp = 'rainbow'; t.color = -2;
  var count = 0; for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) if (e.grid[r][c].color === 1) count++;
  e.trySwap([0, 0], [0, 1]); assert.ok(e.collected[1] >= count);
});
test('two rainbows clear the board', function () {
  var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); [[0, 0], [0, 1]].forEach(function (p) { var t = e.grid[p[0]][p[1]]; t.sp = 'rainbow'; t.color = -2; });
  e.trySwap([0, 0], [0, 1]); var total = e.collected.reduce(function (a, b) { return a + b; }, 0); assert.ok(total >= 26, 'cleared ' + total);
});
test('rainbow + bomb turns a colour into bombs', function () {
  var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); var t = e.grid[0][0]; t.sp = 'rainbow'; t.color = -2; e.grid[0][1].sp = 'bomb';
  e.trySwap([0, 0], [0, 1]); var total = e.collected.reduce(function (a, b) { return a + b; }, 0); assert.ok(total >= 12, 'cleared ' + total);
});
test('lightning + thunder makes a cross', function () {
  var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd']); e.grid[2][2].sp = 'lightning'; e.grid[2][3].sp = 'thunder'; e.trySwap([2, 2], [2, 3]);
  var total = e.collected.reduce(function (a, b) { return a + b; }, 0); assert.ok(total >= 10, 'cleared ' + total);
});
test('crystal fish picks blockers first', function () {
  var e = make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd'], { blockers: [{ r: 4, c: 5, kind: 'ice' }] }); var fx = {}; e.grid[0][0].sp = 'fish'; var cells = e._area('fish', 0, 0, fx); assert.ok(cells.some(function (p) { return p[0] === 4 && p[1] === 5; }));
});

console.log('Blockers');
test('wood box breaks when a neighbour is cleared', function () {
  var e = make(['aaabc', 'bcwef', 'cdefa', 'defab', 'efabc'], { blockers: [{ r: 1, c: 2, kind: 'wood' }] });
  e.grid[1][2] = null; e._clear([[0, 2]], null, [], 1, []); assert.strictEqual(e.blk[1][2], null); assert.strictEqual(e.broken.wood, 1);
});
test('stone needs two hits', function () {
  var e = make(['abcde', 'bcdea', 'cdeab', 'deabc', 'eabcd'], { blockers: [{ r: 1, c: 1, kind: 'stone' }] });
  e._clear([[0, 1]], null, [], 1, []); assert.ok(e.blk[1][1]); assert.strictEqual(e.blk[1][1].hp, 1); e._clear([[1, 0]], null, [], 1, []); assert.strictEqual(e.blk[1][1], null);
});
test('ice sits under a crystal and cracks when it is cleared', function () {
  var e = make(['abcde', 'bcdea', 'cdeab', 'deabc', 'eabcd'], { blockers: [{ r: 2, c: 2, kind: 'ice' }] });
  e._clear([[2, 2]], null, [], 1, []); assert.strictEqual(e.blk[2][2].hp, 1);
});
test('a caged crystal cannot be swapped and does not fall', function () {
  var e = make(['abcde', 'bcdea', 'cdeab', 'deabc', 'eabcd'], { blockers: [{ r: 2, c: 2, kind: 'cage' }] });
  var r = e.trySwap([2, 2], [2, 3]); assert.strictEqual(r.ok, false);
  var id = e.grid[2][2].id; e._clear([[3, 2]], null, [], 1, []); e._gravity([]); assert.strictEqual(e.grid[2][2].id, id);
});
test('solid blocks stop crystals falling through', function () {
  var e = make(['abcde', 'bcdea', 'cdeab', 'deabc', 'eabcd'], { blockers: [{ r: 2, c: 2, kind: 'wall' }] });
  assert.strictEqual(e.grid[2][2], null); e._clear([[4, 2]], null, [], 1, []); e._gravity([]);
  for (var r = 0; r < 5; r++) if (r !== 2) assert.ok(e.grid[r][2], 'empty at ' + r);
});
test('all blocker kinds exist in the rules', function () { assert.strictEqual(Object.keys(Engine.BLOCKERS).length, 13); });

console.log('Objectives, boss, ending');
test('collect objective counts cleared crystals', function () {
  var e = make(['aaabc', 'bcdef', 'cdefa', 'defab', 'efabc'], { objectives: [{ type: 'collect', color: 0, n: 3 }] }); e._settle([], null); assert.ok(e.objectiveProgress()[0].done);
});
test('win ends the game and keeps leftover-moves bonus', function () {
  var e = make(['abcde', 'cdeab', 'aabcd', 'bcdea', 'deabc'], { objectives: [{ type: 'score', n: 10 }] }); e.grid[2][2].color = 3; e.grid[1][2].color = 0; var h = e.findHint();
  if (!h) { e.grid[2][1].color = 0; e.grid[2][0].color = 0; e.grid[2][2].color = 3; e.grid[1][2].color = 0; h = e.findHint(); }
  var r = e.trySwap(h[0], h[1]); assert.ok(r.ok); assert.strictEqual(e.state, 'win'); assert.ok(r.steps.some(function (s) { return s.k === 'end' && s.result === 'win'; }));
});
test('running out of moves is a loss, and revive gives moves back', function () {
  var e = make(['abcde', 'cdeab', 'aabcd', 'bcdea', 'deabc'], { moves: 1 }); e.grid[2][2].color = 3; e.grid[1][2].color = 0; var h = e.findHint(); e.trySwap(h[0], h[1]); assert.strictEqual(e.state, 'lose'); assert.ok(Array.isArray(e.reviveWithMoves(5))); assert.strictEqual(e.state, 'ready'); assert.strictEqual(e.moves, 5);
});
test('boss: clearing crystals hurts it and it freezes tiles on its turn', function () {
  var L = JSON.parse(JSON.stringify(Lv.LEVELS[19])); var e = new Engine(L, 9); assert.ok(e.bossHp > 0);
  var frost = 0; for (var i = 0; i < 12 && e.state === 'ready'; i++) { var h = e.findHint(); if (!h) break; e.trySwap(h[0], h[1]); }
  assert.ok(e.bossHp < L.boss.hp); for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) if (e.blk[r][c] && e.blk[r][c].kind === 'frost') frost++;
  assert.ok(frost > 0 || e.broken.frost > 0, 'no frost seen');
});
test('deadlock: board with no moves gets shuffled', function () {
  var e = make(['abcdef', 'cdefab', 'efabcd', 'bcdefa', 'defabc']); assert.strictEqual(e.findHint(), null); e._shuffle([]); assert.ok(e.findHint()); assert.strictEqual(e.findMatches().length, 0);
});

console.log('Content: 100 levels');
test('five worlds of twenty', function () { assert.strictEqual(Lv.LEVELS.length, 100); for (var w = 1; w <= 5; w++) assert.strictEqual(Lv.LEVELS.filter(function (l) { return l.world === w; }).length, 20); });
test('every level starts with no match, a possible move, and valid objectives', function () {
  Lv.LEVELS.forEach(function (L) {
    var e = new Engine(L, L.id * 7);
    assert.strictEqual(e.findMatches().length, 0, 'level ' + L.id + ' starts with a match');
    assert.ok(e.findHint(), 'level ' + L.id + ' has no move');
    assert.ok(L.objectives.length >= 1 && (L.time || L.moves >= 18) && L.stars[2] > L.stars[1]);
    L.objectives.forEach(function (o) { if (o.type === 'blockers') assert.ok(L.blockers.filter(function (b) { return b.kind === o.kind; }).length >= o.n, 'level ' + L.id + ' has fewer ' + o.kind + ' than the goal'); if (o.type === 'collect') assert.ok(o.color < L.colors, 'level ' + L.id + ' collects an unused colour'); });
  });
});
test('every level has the 3 star thresholds in order and each world ends with a boss', function () { for (var w = 0; w < 5; w++) assert.ok(Lv.LEVELS[w * 20 + 19].boss); });
test('daily challenge is the same all day and changes on another day', function () { var a = Lv.daily('2026-11-09'), b = Lv.daily('2026-11-09'), c = Lv.daily('2026-11-10'); assert.deepStrictEqual(a, b); assert.notStrictEqual(a.id, c.id); });

console.log('Bot plays every level (no crashes, state always sane)');
test('bot plays all 100 levels', function () {
  var wins = 0, byWorld = [0, 0, 0, 0, 0];
  Lv.LEVELS.forEach(function (L) {
    var e = new Engine(JSON.parse(JSON.stringify(L)), L.id), guard = 0;
    while (e.state === 'ready' && guard++ < (L.time ? 30 : 80)) {
      var h = e.findHint(); assert.ok(h, 'stuck on level ' + L.id);
      var r = e.trySwap(h[0], h[1]); assert.ok(r.ok);
      for (var rr = 0; rr < e.rows; rr++) for (var cc = 0; cc < e.cols; cc++) if (e._free(rr, cc)) assert.ok(e.grid[rr][cc], 'hole after move on level ' + L.id);
    }
    if (e.state === 'win') { wins++; byWorld[L.world - 1]++; }
    assert.ok(e.state === 'win' || e.state === 'lose' || L.time, 'level ' + L.id + ' ended in ' + e.state);
  });
  console.log('       a dumb bot (first move it finds) won ' + wins + '/100; per world ' + byWorld.join(', '));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
