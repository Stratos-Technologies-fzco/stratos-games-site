/* Run: node tests/celebrate.test.js   Praise words grow with the blast; confetti is repeatable; Hindi words exist. */
'use strict';
global.window = global; global.document = { documentElement: {} };
var assert = require('assert'), C = require('../js/celebrate.js');
require('../js/i18n.js'); require('../js/lang-hi.js');
var passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); } }
var t = function (cleared, cascade, specials, combo) { return C.tierFor({ cleared: cleared, cascade: cascade, specials: specials || 0, combo: !!combo }); };

test('an ordinary 3-match says nothing', function () { assert.strictEqual(t(3, 1), 0); });
test('a match of 4 is Good!, a match of 5 is Great!', function () { assert.strictEqual(C.wordFor(t(4, 1)), 'Good!'); assert.strictEqual(C.wordFor(t(5, 1)), 'Great!'); });
test('chain reactions raise the word: 2 = Good!, 3 = Great!, 4 = Amazing!, 5 = Incredible!', function () {
  assert.deepStrictEqual([t(3, 2), t(3, 3), t(3, 4), t(3, 5)], [1, 2, 3, 4]);
});
test('a big blast is Amazing! and a huge one or a special combo is Incredible!', function () {
  assert.strictEqual(C.wordFor(t(8, 1)), 'Amazing!'); assert.strictEqual(C.wordFor(t(12, 1)), 'Incredible!'); assert.strictEqual(C.wordFor(t(6, 1, 0, true)), 'Incredible!');
  assert.strictEqual(t(6, 1, 1), 3);
});
test('bigger blasts never get a smaller word (cleared 0 to 40, every chain depth)', function () {
  for (var c = 1; c <= 6; c++) { var last = 0; for (var n = 0; n <= 40; n++) { var v = t(n, c); assert.ok(v >= last, 'tier fell at n=' + n + ' cascade ' + c); last = v; } }
});
test('the four words are in order and a tier outside 0-4 is safe', function () {
  assert.deepStrictEqual(C.WORDS, ['', 'Good!', 'Great!', 'Amazing!', 'Incredible!']); assert.strictEqual(C.wordFor(9), 'Incredible!'); assert.strictEqual(C.wordFor(-3), '');
});
test('confetti: same seed gives the same pieces, a different seed differs, all inside sensible limits', function () {
  var a = C.confetti(34, 12), b = C.confetti(34, 12), d = C.confetti(34, 99);
  assert.deepStrictEqual(a, b); assert.notDeepStrictEqual(a, d); assert.strictEqual(a.length, 34);
  a.forEach(function (p) { assert.ok(p.size >= 6 && p.size <= 12 && p.delay <= 160 && Math.abs(p.dx) <= 260 && p.up >= 60 && p.up <= 220); });
});
test('the praise words have Hindi', function () {
  window.CQI18n.setLang('hi'); ['Good!', 'Great!', 'Amazing!', 'Incredible!', 'Level Complete!', 'BOSS DEFEATED!', 'Daily Puzzle done!'].forEach(function (w) { assert.notStrictEqual(window.CQI18n.t(w), w, w + ' has no Hindi'); });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
