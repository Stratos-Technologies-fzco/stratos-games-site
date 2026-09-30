// World Detail: the 10 levels of one world on a winding path.

import { h, mount, topBar, kiki, starsRow, modal } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { isWorldUnlocked, worldLevels, isLevelUnlocked, levelStars, isLevelDone, recommendedLevel } from '../player.js';

export function render({ id }) {
  const p = state.profile;
  const world = content.worldById[id];
  if (!world) return navigate('/map', { replace: true });
  const bar = topBar({ title: world.name, back: '/map' });

  if (!isWorldUnlocked(p, id)) {
    const idx = content.levels.worlds.findIndex((w) => w.id === id);
    const prev = content.levels.worlds[idx - 1];
    mount(
      h(
        'main.screen.world-screen',
        { style: { '--world': world.color } },
        bar,
        h('div.world-locked', h('div.big-emoji', '🔒'), h('h2', world.name)),
        kiki(
          world.requiresMapPieces
            ? t('kiki.worldLockedFinal', { n: world.requiresMapPieces.length - p.mapPieces.length })
            : t('kiki.worldLocked', { prev: prev.name })
        )
      )
    );
    return () => bar.dispose();
  }

  const rec = recommendedLevel(p);
  const nodes = worldLevels(id).map((level, i) => {
    const unlocked = isLevelUnlocked(p, level);
    const done = isLevelDone(p, level.id);
    const next = rec && rec.id === level.id;
    return h(
      'li.level-node' + (i % 2 ? '.right' : '.left'),
      h(
        'button.level-btn' + (unlocked ? '' : '.locked') + (done ? '.done' : '') + (next ? '.next' : ''),
        {
          type: 'button',
          'aria-label': `${t('ui.world.level', { n: level.index })}: ${level.title}. ${
            unlocked ? (done ? t('ui.common.starsOf', { n: levelStars(p, level.id), max: 3 }) : t('ui.world.ready')) : t('ui.map.locked')
          }`,
          onclick: () => {
            if (unlocked) navigate('/level/' + level.id);
            else
              modal({
                title: t('ui.world.lockedTitle'),
                body: h('p', t('ui.world.lockedBody')),
                buttons: [{ label: t('ui.common.ok'), value: true, cls: 'btn-primary' }]
              });
          }
        },
        h('span.level-num', unlocked ? String(level.index) : '🔒'),
        h('span.level-clue', { 'aria-hidden': 'true' }, level.clue)
      ),
      h('span.level-title', level.title),
      done ? starsRow(levelStars(p, level.id), 3, 'small') : null
    );
  });

  const done = worldLevels(id).filter((l) => isLevelDone(p, l.id)).length;
  mount(
    h(
      'main.screen.world-screen.world-' + id,
      { style: { '--world': world.color } },
      bar,
      h(
        'header.world-head',
        h('div.world-emoji', { 'aria-hidden': 'true' }, world.emoji),
        h('p.world-focus', world.focus),
        h('div.progress', { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '10', 'aria-valuenow': String(done) },
          h('div.progress-fill', { style: { width: done * 10 + '%' } })),
        h('p.world-count', t('ui.map.progress', { done, total: 10 }))
      ),
      kiki(done === 0 ? world.story : done === 10 ? t('kiki.worldDone', { world: world.name }) : t('kiki.worldProgress', { n: 10 - done }), { speakNow: true }),
      h('ol.level-path', nodes)
    )
  );
  return () => bar.dispose();
}
