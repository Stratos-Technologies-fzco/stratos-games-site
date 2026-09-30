// Number Challenge: counting, + − × ÷, missing numbers and word problems.
// Interaction: tap/select the answer.

import { numberChoices } from '../rng.js';
import { choiceGrid, themeSymbols } from './common.js';
import { evaluate } from './expr.js';

function makeArithmetic(mode, p, rng) {
  const max = p.max || 10;
  const min = p.min || 0;
  let a, b, op, answer;
  const pickMode = mode === 'addsub' ? rng.pick(['add', 'sub']) : mode === 'mixed' ? rng.pick(['add', 'sub', 'mul', 'div']) : mode;
  switch (pickMode) {
    case 'add':
      answer = rng.int(Math.max(2, min), max);
      a = rng.int(Math.max(0, min > 0 ? 1 : 0), answer);
      b = answer - a;
      op = '+';
      break;
    case 'sub':
      a = rng.int(Math.max(2, min), max);
      b = rng.int(0, a);
      answer = a - b;
      op = '−';
      break;
    case 'mul': {
      const tmax = p.tables || 10;
      a = rng.int(2, tmax);
      b = rng.int(2, p.factorMax || 10);
      answer = a * b;
      op = '×';
      break;
    }
    case 'div': {
      const tmax = p.tables || 10;
      b = rng.int(2, tmax);
      answer = rng.int(2, p.factorMax || 10);
      a = b * answer;
      op = '÷';
      break;
    }
    default:
      throw new Error('Unknown number mode ' + pickMode);
  }
  return { a, b, op, answer, kind: pickMode };
}

export function generate(p, rng, ctx) {
  const rounds = [];
  const count = p.rounds || 4;
  const seen = new Set();
  const [emoji] = themeSymbols(ctx, 1, rng);
  const templates = p.bank ? ctx.questions.wordProblems[p.bank] : null;
  const order = templates ? rng.shuffle(templates) : [];
  for (let i = 0; i < count; i++) {
    let round = null;
    for (let tries = 0; tries < 40 && !round; tries++) {
      if (p.mode === 'count') {
        const n = rng.int(p.min || 1, p.max || 10);
        const sym = rng.pick(themeSymbols(ctx, 4, rng));
        round = {
          sig: 'c' + n + sym,
          prompt: { key: 'engines.number.count', vars: { emoji: sym } },
          visual: { type: 'count', emoji: sym, n },
          answer: n,
          hint: { key: 'engines.number.countHint' }
        };
      } else if (p.mode === 'word') {
        const tpl = order[i % order.length];
        const vars = {};
        for (const [k, range] of Object.entries(tpl.vars)) vars[k] = rng.int(range[0], range[1]);
        for (const [k, formula] of Object.entries(tpl.derive || {})) vars[k] = evaluate(formula, vars);
        const answer = evaluate(tpl.answer, vars);
        if (!Number.isInteger(answer) || answer < 0) continue;
        const text = tpl.text.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
        round = {
          sig: 'w' + text,
          prompt: { text },
          visual: { type: 'story', emoji: tpl.emoji || '📜' },
          answer,
          hint: { text: tpl.hint.replace(/\{(\w+)\}/g, (_, k) => vars[k]) }
        };
      } else if (p.mode === 'missing') {
        const { a, b, op, answer, kind } = makeArithmetic(p.ops ? rng.pick(p.ops) : 'add', p, rng);
        // show "a op ? = answer", solve for b
        round = {
          sig: `m${a}${op}${b}`,
          prompt: { key: 'engines.number.missing' },
          visual: { type: 'equation', text: `${a} ${op} ? = ${answer}` },
          answer: b,
          hint: { key: kind === 'add' ? 'engines.number.missingAddHint' : 'engines.number.missingHint', vars: { a, c: answer } }
        };
      } else {
        const { a, b, op, answer, kind } = makeArithmetic(p.mode, p, rng);
        const visual =
          kind === 'add' && p.pictures && a <= 10 && b <= 10
            ? { type: 'groups', emoji, a, b, op }
            : { type: 'equation', text: `${a} ${op} ${b} = ?` };
        round = {
          sig: `${a}${op}${b}`,
          prompt: { key: 'engines.number.solve' },
          visual,
          answer,
          hint: { key: 'engines.number.hint_' + kind, vars: { a, b } }
        };
      }
      if (round && seen.has(round.sig) && tries < 39) round = null;
    }
    seen.add(round.sig);
    round.options = numberChoices(rng, round.answer, p.choices || 4, Math.max(3, Math.ceil(round.answer * 0.2)), 0);
    rounds.push(round);
  }
  return rounds;
}

export function render(round, api) {
  const { h } = api;
  const v = round.visual;
  let visual;
  if (v.type === 'count') {
    visual = h(
      'div.count-field',
      Array.from({ length: v.n }, (_, i) => h('span.count-item', { style: { animationDelay: i * 60 + 'ms' } }, v.emoji))
    );
  } else if (v.type === 'groups') {
    const group = (n) => h('div.group', Array.from({ length: n }, () => h('span', v.emoji)));
    visual = h(
      'div.groups',
      group(v.a),
      h('span.op', v.op),
      group(v.b),
      h('span.op', '='),
      h('span.op', '?')
    );
  } else if (v.type === 'story') {
    visual = h('div.story-emoji', v.emoji);
  } else {
    visual = h('div.equation', v.text);
  }
  const grid = choiceGrid(api, round.options, (o) => o === round.answer);
  api.setHint(() => {
    api.say(round.hint);
    grid.eliminateOne();
    return true;
  });
  api.el.append(visual, grid.el);
}
