// Spot the Difference: two pictures, tap the places where they differ.

import { themeSymbols, pulse, shake } from './common.js';

export function generate(p, rng, ctx) {
  const rounds = [];
  const cols = p.cols || 4;
  const rows = p.rows || 3;
  const total = cols * rows;
  for (let r = 0; r < (p.rounds || 2); r++) {
    const symbols = themeSymbols(ctx, 6, rng);
    const left = Array.from({ length: total }, () => (rng.chance(p.empty ?? 0.15) ? '' : rng.pick(symbols)));
    const right = left.slice();
    const diffCells = rng.sample(
      Array.from({ length: total }, (_, i) => i),
      Math.min(p.diffs || 3, total)
    );
    for (const i of diffCells) {
      const others = symbols.filter((s) => s !== left[i]);
      // mostly swap the object; sometimes an object vanishes or appears
      if (left[i] && rng.chance(0.25)) right[i] = '';
      else right[i] = rng.pick(others);
    }
    rounds.push({
      cols,
      rows,
      left,
      right,
      diffs: diffCells.sort((a, b) => a - b),
      mirror: !!p.mirror,
      prompt: { key: 'engines.spot.prompt', vars: { n: diffCells.length } }
    });
  }
  return rounds;
}

export function render(round, api) {
  const { h } = api;
  const found = new Set();
  const counter = h('div.hunt-counter');
  const updateCounter = () => (counter.textContent = api.t('engines.hunt.counter', { found: found.size, n: round.diffs.length }));
  const panels = [round.left, round.right].map((cells, side) => {
    const buttons = cells.map((emoji, i) =>
      h('button.spot-cell', { type: 'button', onclick: () => tap(i, buttons[i]), 'aria-label': emoji || api.t('engines.spot.empty') }, emoji)
    );
    const panel = h('div.spot-panel', { style: { '--cols': round.cols } }, buttons);
    panel.buttons = buttons;
    panel.dataset.side = side ? 'right' : 'left';
    return panel;
  });
  function tap(i, el) {
    if (api.locked()) return;
    if (round.diffs.includes(i)) {
      if (found.has(i)) return;
      found.add(i);
      panels.forEach((p) => p.buttons[i].classList.add('found'));
      api.sfx('pop');
      updateCounter();
      if (found.size === round.diffs.length) api.correct();
    } else {
      shake(el);
      api.wrong();
    }
  }
  api.setHint(() => {
    const next = round.diffs.find((i) => !found.has(i));
    if (next == null) return false;
    panels.forEach((p) => pulse(p.buttons[next]));
    return true;
  });
  updateCounter();
  api.el.append(counter, h('div.spot-wrap', panels));
}
