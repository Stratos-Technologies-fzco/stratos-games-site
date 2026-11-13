/* Run: node tests/celebrate.test.js   Praise words grow with the blast; special crystals always get a word; confetti is repeatable; Hindi words exist. */
'use strict';
global.window = global; global.document = { documentElement: {} };
var assert = require('assert'), C = require('../js/celebrate.js');
require('../js/i18n.js'); require('../js/lang-hi.js');
var passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); } }
var t = function (cleared, cascade, kinds, combo) { return C.tierFor({ cleared: cleared, cascade: cascade, kinds: kinds || [], combo: !!combo }); };
var w = function (cleared, cascade, kinds, combo) { return C.wordFor(t(cleared, cascade, kinds, combo)); };

test('the six words are in order: Good! Great! Excellent! Awesome! Amazing! Incredible!', function () { assert.deepStrictEqual(C.WORDS, ['', 'Good!', 'Great!', 'Excellent!', 'Awesome!', 'Amazing!', 'Incredible!']); });
test('an ordinary 3-match says nothing', function () { assert.strictEqual(t(3, 1), 0); });
test('a match of 4 is Good!, a match of 5 is Great!', function () { assert.strictEqual(w(4, 1), 'Good!'); assert.strictEqual(w(5, 1), 'Great!'); });
test('bigger blasts climb the words: 7 = Excellent!, 9 = Awesome!, 12 = Amazing!, 16 = Incredible!', function () {
  assert.deepStrictEqual([w(7, 1), w(9, 1), w(12, 1), w(16, 1)], ['Excellent!', 'Awesome!', 'Amazing!', 'Incredible!']);
});
test('chain reactions raise the word: 2 = Good!, 3 = Great!, 4 = Awesome!, 5 = Amazing!, 6 = Incredible!', function () {
  assert.deepStrictEqual([t(3, 2), t(3, 3), t(3, 4), t(3, 5), t(3, 6)], [1, 2, 4, 5, 6]);
});
test('THE RAINBOW always gets a word, even when it clears only a few crystals: at least Awesome!', function () {
  [3, 4, 5, 6, 8].forEach(function (n) { assert.ok(t(n, 1, ['rainbow']) >= 4, 'rainbow clearing ' + n + ' got tier ' + t(n, 1, ['rainbow'])); });
  assert.strictEqual(w(3, 1, ['rainbow']), 'Awesome!'); assert.strictEqual(w(14, 1, ['rainbow']), 'Amazing!');
});
test('every other special crystal gets at least Excellent!, even a small one', function () {
  C.SPECIAL_TYPES.forEach(function (k) { assert.ok(t(3, 1, [k]) >= 3, k + ' got tier ' + t(3, 1, [k])); });
  assert.deepStrictEqual(C.SPECIAL_TYPES.sort(), ['bomb', 'fish', 'lightning', 'nova', 'star', 'super', 'thunder']);
});
test('two specials swapped together are Incredible!, and a hammer on its own says nothing', function () { assert.strictEqual(w(6, 1, ['combo'], true), 'Incredible!'); assert.strictEqual(w(1, 1, ['hammer']), ''); });
test('bigger blasts never get a smaller word (cleared 0 to 40, every chain depth, with and without a Rainbow)', function () {
  [[], ['rainbow'], ['lightning']].forEach(function (kinds) { for (var c = 1; c <= 7; c++) { var last = 0; for (var n = 0; n <= 40; n++) { var v = t(n, c, kinds); assert.ok(v >= last, 'tier fell at n=' + n + ' cascade ' + c); last = v; } } });
});
test('a tier outside 0-6 is safe', function () { assert.strictEqual(C.wordFor(99), 'Incredible!'); assert.strictEqual(C.wordFor(-3), ''); });
test('the Rainbow lights go to at most 28 crystals, spread over the whole list', function () {
  var cells = []; for (var i = 0; i < 60; i++) cells.push({ r: i, c: 0 });
  var picked = C.rainbowTargets(cells, 28); assert.strictEqual(picked.length, 28); assert.strictEqual(picked[0].r, 0); assert.ok(picked[27].r >= 50);
  assert.strictEqual(C.rainbowTargets(cells.slice(0, 5), 28).length, 5);
});
test('confetti: same seed gives the same pieces, a different seed differs, all inside sensible limits', function () {
  var a = C.confetti(44, 12), b = C.confetti(44, 12), d = C.confetti(44, 99);
  assert.deepStrictEqual(a, b); assert.notDeepStrictEqual(a, d); assert.strictEqual(a.length, 44);
  a.forEach(function (p) { assert.ok(p.size >= 6 && p.size <= 12 && p.delay <= 160 && Math.abs(p.dx) <= 260 && p.up >= 60 && p.up <= 220); });
});
test('all six words and the banners have Hindi, each different', function () {
  window.CQI18n.setLang('hi'); var seen = {};
  C.WORDS.slice(1).concat(['Level Complete!', 'BOSS DEFEATED!', 'Daily Puzzle done!']).forEach(function (x) { var h = window.CQI18n.t(x); assert.notStrictEqual(h, x, x + ' has no Hindi'); });
  C.WORDS.slice(1).forEach(function (x) { var h = window.CQI18n.t(x); assert.ok(!seen[h], 'two words share the Hindi ' + h); seen[h] = 1; });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
