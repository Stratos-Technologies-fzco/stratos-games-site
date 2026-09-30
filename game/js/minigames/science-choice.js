// Science Choice: pick the right answer, or arrange items in the right order
// (e.g. planets from the Sun, a plant's life cycle). Also used for geography
// questions in the Treasure Island world.

import { choiceGrid, shake } from './common.js';

export function generate(p, rng, ctx) {
  const banks = Array.isArray(p.bank) ? p.bank : [p.bank];
  const pool = banks.flatMap((b) => {
    const bank = ctx.questions.scienceBanks[b];
    if (!bank) throw new Error('Missing science bank ' + b);
    return bank;
  });
  const picked = [];
  const choices = rng.shuffle(pool.filter((q) => q.type !== 'order'));
  const orders = rng.shuffle(pool.filter((q) => q.type === 'order'));
  const nOrder = Math.min(p.orderRounds || 0, orders.length);
  picked.push(...orders.slice(0, nOrder));
  picked.push(...choices.slice(0, (p.rounds || 4) - nOrder));
  return rng.shuffle(picked).map((q) => {
    if (q.type === 'order') {
      return {
        type: 'order',
        q: q.q,
        items: q.items,
        shuffled: shuffleNotSorted(q.items, rng),
        prompt: { text: q.q },
        hint: q.h
      };
    }
    const answer = q.o[q.a];
    return {
      type: 'choice',
      q: q.q,
      emoji: q.e || null,
      options: rng.shuffle(q.o),
      answer,
      prompt: { text: q.q },
      hint: q.h
    };
  });
}

function shuffleNotSorted(items, rng) {
  let s = rng.shuffle(items);
  for (let i = 0; i < 5 && s.join('|') === items.join('|'); i++) s = rng.shuffle(items);
  return s;
}

function renderChoice(round, api) {
  const { h } = api;
  const grid = choiceGrid(api, round.options, (o) => o === round.answer, { cls: 'choice-text' });
  api.setHint(() => {
    if (round.hint) api.say({ text: round.hint });
    grid.eliminateOne();
    return true;
  });
  api.el.append(round.emoji ? h('div.story-emoji', round.emoji) : null, grid.el);
}

function renderOrder(round, api) {
  const { h } = api;
  const chosen = [];
  const answerRow = h('ol.order-answer');
  const pool = round.shuffled.map((item) =>
    h('button.order-item', { type: 'button', onclick: () => pick(item) }, item)
  );
  function refresh() {
    answerRow.replaceChildren(
      ...round.items.map((_, i) =>
        h(
          'li.order-slot' + (chosen[i] ? '.filled' : ''),
          chosen[i]
            ? h('button.order-chosen', { type: 'button', onclick: () => unpick(i) }, `${i + 1}. ${chosen[i]}`)
            : h('span', `${i + 1}.`)
        )
      )
    );
    pool.forEach((b, i) => (b.disabled = chosen.includes(round.shuffled[i])));
  }
  function pick(item) {
    if (api.locked() || chosen.includes(item)) return;
    api.sfx('pop');
    chosen.push(item);
    refresh();
    if (chosen.length === round.items.length) check();
  }
  function unpick(i) {
    if (api.locked()) return;
    chosen.length = i;
    refresh();
  }
  function correctPrefix() {
    let k = 0;
    while (k < chosen.length && chosen[k] === round.items[k]) k++;
    return k;
  }
  function check() {
    if (chosen.every((c, i) => c === round.items[i])) {
      answerRow.classList.add('is-correct');
      api.correct();
    } else {
      api.wrong();
      shake(answerRow);
      setTimeout(() => {
        chosen.length = correctPrefix();
        refresh();
      }, 500);
    }
  }
  api.setHint(() => {
    chosen.length = correctPrefix();
    if (chosen.length >= round.items.length) return false;
    chosen.push(round.items[chosen.length]);
    if (round.hint) api.say({ text: round.hint });
    refresh();
    if (chosen.length === round.items.length) check();
    return true;
  });
  api.el.append(answerRow, h('div.order-pool', pool));
  refresh();
}

export function render(round, api) {
  if (round.type === 'order') return renderOrder(round, api);
  return renderChoice(round, api);
}
