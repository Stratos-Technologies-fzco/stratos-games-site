// Object Hunt: find and tap all the target objects hidden in a scene.

import { pulse, shake } from './common.js';

export function generate(p, rng, ctx) {
  const setIds = p.sets || [];
  const chosen = rng.shuffle(setIds);
  const rounds = [];
  for (let r = 0; r < (p.rounds || 2); r++) {
    const set = ctx.questions.huntSets[chosen[r % chosen.length]];
    if (!set) throw new Error('Missing hunt set ' + chosen[r % chosen.length]);
    const cols = p.cols || 6;
    const rows = p.rows || 5;
    const total = cols * rows;
    const nTargets = Math.min(p.count || 5, total);
    const nDistract = Math.min(p.distractors || 6, total - nTargets);
    const cells = rng.sample(Array.from({ length: total }, (_, i) => i), nTargets + nDistract);
    const items = cells.map((cell, i) => ({
      cell,
      emoji: i < nTargets ? rng.pick(set.targets) : rng.pick(set.distractors),
      target: i < nTargets,
      x: ((cell % cols) + 0.2 + rng.next() * 0.6) / cols,
      y: (Math.floor(cell / cols) + 0.2 + rng.next() * 0.6) / rows,
      rot: rng.int(-20, 20),
      scale: 0.85 + rng.next() * 0.4
    }));
    rounds.push({
      label: set.label,
      scene: set.scene || ctx.theme,
      count: nTargets,
      items,
      showSample: set.targets.length === 1,
      sample: set.targets[0],
      prompt: { key: 'engines.hunt.prompt', vars: { n: nTargets, label: set.label } }
    });
  }
  return rounds;
}

export function render(round, api) {
  const { h } = api;
  let found = 0;
  const counter = h('div.hunt-counter', api.t('engines.hunt.counter', { found, n: round.count }));
  const itemEls = round.items.map((item) => {
    const el = h(
      'button.hunt-item',
      {
        type: 'button',
        style: { left: 7 + item.x * 86 + '%', top: 9 + item.y * 82 + '%', '--rot': item.rot + 'deg', '--s': item.scale },
        'aria-label': item.emoji,
        onclick: () => {
          if (api.locked() || el.classList.contains('found')) return;
          if (item.target) {
            el.classList.add('found');
            api.sfx('pop');
            found++;
            counter.textContent = api.t('engines.hunt.counter', { found, n: round.count });
            if (found === round.count) api.correct();
          } else {
            shake(el);
            api.wrong();
          }
        }
      },
      item.emoji
    );
    return el;
  });
  api.setHint(() => {
    const idx = round.items.findIndex((it, i) => it.target && !itemEls[i].classList.contains('found'));
    if (idx < 0) return false;
    pulse(itemEls[idx]);
    return true;
  });
  api.el.append(
    h('div.hunt-head', round.showSample ? h('span.hunt-sample', round.sample) : null, counter),
    h('div.hunt-scene.scene-' + round.scene, itemEls)
  );
}
