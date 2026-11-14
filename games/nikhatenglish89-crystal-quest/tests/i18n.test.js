/* Run: node tests/i18n.test.js   Every line of story, every tip, name and goal has a Hindi translation. */
'use strict';
global.window = global; global.document = { documentElement: {} };
var assert = require('assert');
require('../js/i18n.js'); require('../js/lang-hi.js');
var I = window.CQI18n, LV = require('../js/levels.js'), E = require('../js/engine.js');
I.setLang('hi');
var passed = 0, failed = 0, missing = [];
function need(s) { var r = I.t(s); if (r === s) missing.push(s); }
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); } }

test('story: every dialogue line, hero name and role', function () {
  Object.keys(LV.DIALOGUE).forEach(function (k) { need(LV.DIALOGUE[k][1]); });
  Object.keys(LV.CHAR).forEach(function (k) { need(LV.CHAR[k].name); need(LV.CHAR[k].role); });
  LV.VICTORY.forEach(need); LV.BOSS_TAUNT.forEach(need);
  assert.deepStrictEqual(missing, []);
});
test('tips: every title and text', function () { Object.keys(LV.TIPS).forEach(function (k) { need(LV.TIPS[k].title); need(LV.TIPS[k].text); }); assert.deepStrictEqual(missing, []); });
test('worlds, projects, bosses and crystal names', function () {
  LV.WORLDS.forEach(function (w) { need(w.name); need(w.boss.name); w.projects.forEach(need); }); LV.LOCKED_WORLDS.forEach(need); LV.COLOR_NAMES.forEach(need);
  Object.keys(E.BLOCKERS).forEach(function (k) { if (k !== 'frost' && k !== 'path' && k !== 'moss') need(E.BLOCKERS[k].name); });
  assert.deepStrictEqual(missing, []);
});
test('gem sets: names, screens and settings', function () {
  require('../js/sets.js').SETS.forEach(function (st) { need(st.name); });
  ['Gem style', 'Themed', 'Classic', 'Guest gems!', 'Gem Collection', 'Reach Frozen Mountains to unlock', 'Coming soon', 'New gem set: Frozen Shards!', 'Every world has its own gems. The colours always stay the same.'].forEach(need);
  assert.deepStrictEqual(missing, []);
});
test('goal lines with numbers are translated', function () {
  ['Collect 12 Ruby', 'Break 5 Cage', 'Score 2700', 'Defeat Stone Golem', 'Bring down 3 treasures', 'Free 7 caged crystals', 'Light 12 path tiles', 'Heal 10 forest patches', 'Collect 85 crystal energy', 'Close 3 shadow portals', 'Level 12', '38 moves', '79 seconds', 'Best 4250 · +60 coins · +20 crystal energy', 'Restored: Ancient Bridge! +50 coins', 'Time Challenge · Crystal Valley · 79 seconds'].forEach(need);
  assert.deepStrictEqual(missing, []);
});
test('English is left alone and unknown text stays as it is', function () { I.setLang('en'); assert.strictEqual(I.t('PLAY'), 'PLAY'); I.setLang('hi'); assert.strictEqual(I.t('Some text nobody translated'), 'Some text nobody translated'); assert.notStrictEqual(I.t('PLAY'), 'PLAY'); });
test('numbers keep their digits inside Hindi lines', function () { assert.ok(I.t('Collect 12 Ruby').indexOf('12') > -1); assert.ok(I.t('Level 7').indexOf('7') > -1); });

console.log('\n' + passed + ' passed, ' + failed + ' failed' + (missing.length ? '\nMissing Hindi for:\n  ' + missing.join('\n  ') : ''));
process.exit(failed ? 1 : 0);
