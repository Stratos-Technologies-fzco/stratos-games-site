// Content tests: every one of the 50 levels must build valid rounds in all
// three age bands, across many seeds. Run with `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { buildRounds, ENGINES } from '../game/js/minigames/index.js';
import { shortestPath } from '../game/js/minigames/maze-path.js';
import { evaluate } from '../game/js/minigames/expr.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'game', 'data');
const load = (name) => JSON.parse(readFileSync(join(root, name + '.json'), 'utf8'));
const levels = load('levels');
const questions = load('questions');
const rewards = load('rewards');
const achievements = load('achievements');
const dialogue = load('dialogue');
const SEEDS = 25;

test('5 worlds with 10 levels each (50 levels)', () => {
  assert.equal(levels.worlds.length, 5);
  assert.equal(levels.levels.length, 50);
  for (const w of levels.worlds) assert.equal(levels.levels.filter((l) => l.world === w.id).length, 10);
  const final = levels.worlds[4];
  assert.deepEqual(final.requiresMapPieces, ['beach', 'jungle', 'cave', 'temple']);
});

test('all eight engines are used', () => {
  const used = new Set(levels.levels.map((l) => l.engine));
  assert.deepEqual([...used].sort(), Object.keys(ENGINES).sort());
});

test('geography appears in the Treasure Island world', () => {
  const geo = levels.levels.filter((l) => l.world === 'island' && l.category === 'geography');
  assert.ok(geo.length >= 4);
});

for (const level of levels.levels) {
  test(`level ${level.id} (${level.engine}) builds for all 3 bands`, () => {
    for (const band of [0, 1, 2]) {
      assert.ok(level.bands[band], `band ${band} missing`);
      for (let s = 0; s < SEEDS; s++) {
        const rounds = buildRounds(level, band, `${level.id}-${band}-${s}`, questions);
        assert.ok(rounds.length >= 2, 'at least two rounds');
        for (const r of rounds) checkRound(level, r);
      }
    }
  });
}

function checkRound(level, r) {
  assert.ok(r.prompt && (r.prompt.text || r.prompt.key), 'round has a prompt');
  switch (level.engine) {
    case 'number':
    case 'pattern-puzzle':
      assert.ok(r.options.includes(r.answer), `answer ${r.answer} in options ${r.options}`);
      assert.equal(new Set(r.options.map(String)).size, r.options.length, 'options unique');
      if (typeof r.answer === 'number') {
        assert.ok(Number.isInteger(r.answer) && r.answer >= 0, `answer ${r.answer} is a whole number`);
      }
      break;
    case 'word-builder': {
      const letters = r.tiles.slice().sort().join('');
      for (const ch of r.word) assert.ok(r.tiles.includes(ch));
      assert.ok(letters.length >= r.word.length);
      break;
    }
    case 'memory-sequence':
      assert.ok(r.seq.every((n) => n >= 0 && n < r.tiles));
      break;
    case 'object-hunt': {
      const targets = r.items.filter((i) => i.target);
      assert.equal(targets.length, r.count);
      const targetEmoji = new Set(targets.map((i) => i.emoji));
      for (const d of r.items.filter((i) => !i.target)) assert.ok(!targetEmoji.has(d.emoji), 'distractor differs from targets');
      break;
    }
    case 'spot-difference':
      for (const i of r.diffs) assert.notEqual(r.left[i], r.right[i]);
      r.left.forEach((v, i) => {
        if (!r.diffs.includes(i)) assert.equal(v, r.right[i]);
      });
      break;
    case 'maze-path':
      if (r.mode === 'maze') {
        const path = shortestPath(r.walls, r.start, r.goal);
        assert.deepEqual(path[path.length - 1], r.goal);
        assert.deepEqual(path[0], r.start);
      } else if (r.mode === 'compass') {
        assert.ok(r.goal.every((v) => v >= 0 && v < r.size));
      } else if (r.mode === 'mapread') {
        assert.ok(r.placed.some((p) => p.name === r.answer));
      }
      break;
    case 'science-choice':
      if (r.type === 'order') assert.ok(r.items.length >= 3);
      else assert.ok(r.options.includes(r.answer));
      break;
  }
}

test('word problems always give whole-number answers', () => {
  for (const [bank, list] of Object.entries(questions.wordProblems)) {
    for (const tpl of list) {
      for (let i = 0; i < 200; i++) {
        const vars = {};
        for (const [k, [a, b]] of Object.entries(tpl.vars)) vars[k] = a + Math.floor(Math.random() * (b - a + 1));
        for (const [k, f] of Object.entries(tpl.derive || {})) vars[k] = evaluate(f, vars);
        const ans = evaluate(tpl.answer, vars);
        assert.ok(Number.isInteger(ans) && ans >= 0, `${bank}: "${tpl.text}" gave ${ans}`);
      }
    }
  }
});

test('science choice answers are among options', () => {
  for (const [bank, list] of Object.entries(questions.scienceBanks)) {
    for (const q of list) {
      if (q.type === 'order') continue;
      assert.ok(q.o[q.a], `${bank}: ${q.q}`);
      assert.equal(new Set(q.o).size, q.o.length, `${bank}: duplicate options in ${q.q}`);
    }
  }
});

test('20+ achievements and 30+ cosmetic items', () => {
  assert.ok(achievements.achievements.length >= 20);
  assert.ok(rewards.items.length >= 30);
  const ids = rewards.items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of rewards.items) {
    assert.ok(['hat', 'outfit', 'pet', 'camp'].includes(item.slot), item.id);
    assert.ok(['coins', 'gems'].includes(item.currency), item.id);
  }
});

test('dialogue has every engine prompt key used', () => {
  const need = [
    'engines.number.count', 'engines.number.solve', 'engines.number.missing', 'engines.word.prompt',
    'engines.memory.watch', 'engines.pattern.prompt', 'engines.hunt.prompt', 'engines.maze.prompt',
    'engines.compass.prompt', 'engines.mapread.prompt', 'engines.spot.prompt'
  ];
  for (const key of need) {
    const v = key.split('.').reduce((n, k) => n && n[k], dialogue);
    assert.ok(typeof v === 'string', key);
  }
});

test('service worker caches every game file', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const gameDir = join(root, '..');
  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => {
      const full = join(dir, f);
      return statSync(full).isDirectory() ? walk(full) : [full.slice(gameDir.length + 1)];
    });
  const files = walk(gameDir).filter((f) => /\.(html|js|css|json|svg|webmanifest)$/.test(f) && f !== 'service-worker.js');
  const sw = readFileSync(join(gameDir, 'service-worker.js'), 'utf8');
  for (const f of files) assert.ok(sw.includes(`'${f}'`), `service-worker.js is missing ${f}`);
});
