// Word Builder: put letter tiles in the right order to spell a word.
// Interaction: tap a tile to place it; tap a placed letter to send it back.

import { shake } from './common.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUW';

export function generate(p, rng, ctx) {
  const list = ctx.questions.wordLists[p.list];
  if (!list) throw new Error('Missing word list ' + p.list);
  const words = rng.sample(list, Math.min(p.rounds || 3, list.length));
  return words.map((entry) => {
    const word = entry.w.toUpperCase();
    const letters = word.split('');
    for (let i = 0; i < (p.extra || 0); i++) {
      let l;
      do l = rng.pick(ALPHABET.split(''));
      while (letters.includes(l) && ALPHABET.length > letters.length);
      letters.push(l);
    }
    let tiles = rng.shuffle(letters);
    // never show the word already spelled out
    if (tiles.slice(0, word.length).join('') === word) tiles = tiles.reverse();
    return {
      word,
      emoji: p.hideEmoji ? null : entry.e,
      clue: entry.c,
      tiles,
      prompt: { key: p.hideEmoji ? 'engines.word.promptClue' : 'engines.word.prompt', vars: { n: word.length } }
    };
  });
}

export function render(round, api) {
  const { h } = api;
  const placed = []; // indices into tiles
  const slots = round.word.split('').map(() => h('button.slot', { type: 'button', 'aria-label': api.t('engines.word.emptySlot') }));
  const tileEls = round.tiles.map((letter, idx) =>
    h('button.tile', { type: 'button', onclick: () => place(idx) }, letter)
  );

  function refresh() {
    slots.forEach((s, i) => {
      const idx = placed[i];
      s.textContent = idx == null ? '' : round.tiles[idx];
      s.classList.toggle('filled', idx != null);
      s.setAttribute('aria-label', idx == null ? api.t('engines.word.emptySlot') : round.tiles[idx]);
    });
    tileEls.forEach((t, idx) => {
      t.disabled = placed.includes(idx);
    });
  }

  function place(idx) {
    if (api.locked() || placed.includes(idx) || placed.length >= slots.length) return;
    api.sfx('pop');
    placed.push(idx);
    refresh();
    if (placed.length === slots.length) check();
  }

  function check() {
    const guess = placed.map((i) => round.tiles[i]).join('');
    if (guess === round.word) {
      slotRow.classList.add('is-correct');
      api.correct();
    } else {
      api.wrong();
      shake(slotRow);
      setTimeout(() => {
        // keep the correct beginning, return the rest
        let keep = 0;
        while (keep < placed.length && round.tiles[placed[keep]] === round.word[keep]) keep++;
        placed.length = keep;
        refresh();
      }, 450);
    }
  }

  slots.forEach((s, i) =>
    s.addEventListener('click', () => {
      if (api.locked() || i >= placed.length) return;
      placed.length = i;
      refresh();
    })
  );

  api.setHint(() => {
    let keep = 0;
    while (keep < placed.length && round.tiles[placed[keep]] === round.word[keep]) keep++;
    placed.length = keep;
    if (keep >= round.word.length) return false;
    const need = round.word[keep];
    const idx = round.tiles.findIndex((l, i) => l === need && !placed.includes(i));
    placed.push(idx);
    refresh();
    api.say({ key: 'engines.word.hint', vars: { letter: need } });
    if (placed.length === slots.length) check();
    return true;
  });

  const slotRow = h('div.slots', slots);
  api.el.append(
    h('div.word-clue', round.emoji ? h('span.word-emoji', round.emoji) : null, h('span.word-clue-text', round.clue)),
    slotRow,
    h('div.tiles', tileEls)
  );
  refresh();
}
