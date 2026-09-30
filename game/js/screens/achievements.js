import { h, mount, topBar } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { achievementProgress } from '../rewards.js';

export function render() {
  const p = state.profile;
  const bar = topBar({ title: t('ui.awards.title'), back: '/map' });
  const list = content.achievements.achievements;
  const earned = list.filter((a) => p.achievements[a.id]).length;
  mount(
    h(
      'main.screen.awards-screen',
      bar,
      h('p.screen-sub.center', t('ui.awards.count', { n: earned, total: list.length })),
      h(
        'ul.award-grid',
        list.map((a) => {
          const got = !!p.achievements[a.id];
          const { value, target } = achievementProgress(p, a);
          return h(
            'li.award' + (got ? '.earned' : ''),
            h('span.award-emoji', { 'aria-hidden': 'true' }, got ? a.emoji : '❔'),
            h('span.award-name', a.name),
            h('span.award-desc', a.desc),
            got
              ? h('span.award-gems', '💎 +' + a.gems)
              : h(
                  'span.award-progress',
                  h('span.progress.progress-sm', h('span.progress-fill', { style: { width: Math.round((value / target) * 100) + '%' } })),
                  h('span.award-count', `${value}/${target}`)
                )
          );
        })
      )
    )
  );
  return () => bar.dispose();
}
