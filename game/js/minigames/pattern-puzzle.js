// Pattern Puzzle: find the missing item in a picture or number pattern.

import { choiceGrid, themeSymbols, pulse } from './common.js';
import { numberChoices } from '../rng.js';

const NUMBER_RULES = {
  add: (rng, p) => {
    const s = rng.int(p.stepMin || 1, p.stepMax || 3);
    const start = rng.int(0, p.startMax || 10);
    return { seq: (n) => Array.from({ length: n }, (_, i) => start + s * i), hint: { key: 'engines.pattern.hintAdd', vars: { s } } };
  },
  sub: (rng, p) => {
    const s = rng.int(p.stepMin || 1, p.stepMax || 3);
    return {
      seq: (n) => {
        const start = s * (n - 1) + rng.int(0, p.startMax || 10);
        return Array.from({ length: n }, (_, i) => start - s * i);
      },
      hint: { key: 'engines.pattern.hintSub', vars: { s } }
    };
  },
  double: (rng) => {
    const start = rng.int(1, 4);
    return { seq: (n) => Array.from({ length: n }, (_, i) => start * 2 ** i), hint: { key: 'engines.pattern.hintDouble' } };
  },
  squares: (rng) => {
    const off = rng.int(1, 3);
    return { seq: (n) => Array.from({ length: n }, (_, i) => (i + off) ** 2), hint: { key: 'engines.pattern.hintSquares' } };
  },
  alt: (rng, p) => {
    const a = rng.int(p.stepMin || 1, p.stepMax || 5);
    let b = rng.int(p.stepMin || 1, p.stepMax || 5);
    if (b === a) b = a + 1;
    const start = rng.int(0, 10);
    return {
      seq: (n) => {
        const out = [start];
        for (let i = 1; i < n; i++) out.push(out[i - 1] + (i % 2 ? a : b));
        return out;
      },
      hint: { key: 'engines.pattern.hintAlt', vars: { a, b } }
    };
  },
  growing: (rng) => {
    const start = rng.int(1, 5);
    return {
      seq: (n) => {
        const out = [start];
        for (let i = 1; i < n; i++) out.push(out[i - 1] + i);
        return out;
      },
      hint: { key: 'engines.pattern.hintGrowing' }
    };
  },
  fib: (rng) => {
    const a = rng.int(1, 3);
    const b = rng.int(a, a + 2);
    return {
      seq: (n) => {
        const out = [a, b];
        while (out.length < n) out.push(out[out.length - 1] + out[out.length - 2]);
        return out.slice(0, n);
      },
      hint: { key: 'engines.pattern.hintFib' }
    };
  }
};

function emojiRound(p, rng, ctx) {
  const unit = rng.pick(p.units || ['AB', 'ABC', 'AAB']);
  const letters = [...new Set(unit.split(''))];
  const symbols = themeSymbols(ctx, letters.length + 2, rng);
  const map = Object.fromEntries(letters.map((l, i) => [l, symbols[i]]));
  const length = Math.max(p.show || 6, unit.length * 2) + 1;
  const seq = Array.from({ length }, (_, i) => map[unit[i % unit.length]]);
  const missing = p.missing === 'any' ? rng.int(unit.length, length - 1) : length - 1;
  const answer = seq[missing];
  const options = rng.shuffle([...new Set([...letters.map((l) => map[l]), ...symbols.slice(letters.length)])]).slice(0, Math.max(3, Math.min(4, letters.length + 1)));
  if (!options.includes(answer)) options[0] = answer;
  return {
    type: 'emoji',
    seq,
    missing,
    answer,
    unitLength: unit.length,
    options: rng.shuffle(options),
    prompt: { key: 'engines.pattern.prompt' },
    hint: { key: 'engines.pattern.hintUnit', vars: { n: unit.length } }
  };
}

function numberRound(p, rng) {
  const ruleName = rng.pick(p.rules || ['add']);
  const rule = NUMBER_RULES[ruleName](rng, p);
  const length = p.show || 5;
  const seq = rule.seq(length + 1);
  const missing = p.missing === 'any' ? rng.int(2, length) : length;
  const answer = seq[missing];
  return {
    type: 'number',
    seq,
    missing,
    answer,
    options: numberChoices(rng, answer, 4, Math.max(2, Math.ceil(Math.abs(answer) * 0.15)), 0),
    prompt: { key: 'engines.pattern.promptNumber' },
    hint: rule.hint
  };
}

export function generate(p, rng, ctx) {
  const rounds = [];
  for (let i = 0; i < (p.rounds || 4); i++) {
    const kind = p.kind === 'mixed' ? (i % 2 ? 'number' : 'emoji') : p.kind || 'emoji';
    rounds.push(kind === 'number' ? numberRound(p, rng) : emojiRound(p, rng, ctx));
  }
  return rounds;
}

export function render(round, api) {
  const { h } = api;
  const cells = round.seq.map((v, i) =>
    h('span.pattern-cell' + (i === round.missing ? '.missing' : '') + (round.type === 'number' ? '.num' : ''), i === round.missing ? '?' : String(v))
  );
  const row = h('div.pattern-row', cells);
  const grid = choiceGrid(api, round.options, (o) => o === round.answer, { cls: round.type === 'emoji' ? 'choice-emoji' : '' });
  const origCorrect = api.correct;
  api.correct = () => {
    cells[round.missing].textContent = String(round.answer);
    cells[round.missing].classList.add('solved');
    origCorrect();
  };
  api.setHint(() => {
    api.say(round.hint);
    if (round.type === 'emoji') {
      for (let i = 0; i < round.unitLength; i++) pulse(cells[i]);
    } else {
      grid.eliminateOne();
    }
    return true;
  });
  api.el.append(row, grid.el);
}
