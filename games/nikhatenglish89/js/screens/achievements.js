import { h, mount, topBar } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { achievementProgress } from '../rewards.js';

export function render() {
  const p = state.profile;
  const bar = topBar({ title: t('ui.awards.title'), back: '/map' });
  const list = content.achievements.achievements;
  const earned = list.filter((a) => p.achievements[a.id]).length;
  const detail = h('div.award-detail', { 'aria-live': 'polite' });
  const tiles = [];

  function show(a, tile) {
    const got = !!p.achievements[a.id];
    const { value, target } = achievementProgress(p, a);
    tiles.forEach((x) => x.setAttribute('aria-pressed', String(x === tile)));
    detail.replaceChildren(
      h('span.award-emoji', { 'aria-hidden': 'true' }, got ? a.emoji : '❔'),
      h(
        'div.award-detail-text',
        h('strong.award-name', a.name),
        h('span.award-desc', a.desc),
        got
          ? h('span.award-gems', '💎 +' + a.gems)
          : h(
              'span.award-progress',
              h('span.progress.progress-sm', h('span.progress-fill', { style: { width: Math.round((value / target) * 100) + '%' } })),
              h('span.award-count', `${value}/${target}`)
            )
      )
    );
  }

  const grid = h(
    'ul.award-grid',
    list.map((a) => {
      const got = !!p.achievements[a.id];
      const tile = h(
        'button.award' + (got ? '.earned' : ''),
        { type: 'button', 'aria-pressed': 'false', 'aria-label': a.name, onclick: () => show(a, tile) },
        got ? a.emoji : '❔'
      );
      tiles.push(tile);
      return h('li', tile);
    })
  );
  show(list[0], tiles[0]);

  mount(
    h(
      'main.screen.awards-screen',
      bar,
      h('p.screen-sub.center', t('ui.awards.count', { n: earned, total: list.length })),
      detail,
      grid
    )
  );
  return () => bar.dispose();
}
