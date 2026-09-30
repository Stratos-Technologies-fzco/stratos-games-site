// Treasure Map: main navigation between the five worlds.

import { h, btn, mount, kiki, topBar, storageBanner, avatarView } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { isWorldUnlocked, isWorldComplete, worldLevels, isLevelDone, recommendedLevel } from '../player.js';

export function render() {
  const p = state.profile;
  const worlds = content.levels.worlds;
  const rec = recommendedLevel(p);
  const bar = topBar({ title: t('ui.map.title'), back: null });

  // dotted route between islands, in unlock order
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'map-route');
  svg.setAttribute('aria-hidden', 'true');
  for (let i = 1; i < worlds.length; i++) {
    const a = worlds[i - 1].pos;
    const b = worlds[i].pos;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mx = (a.x + b.x) / 2 + (i % 2 ? 8 : -8);
    const my = (a.y + b.y) / 2;
    path.setAttribute('d', `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`);
    path.setAttribute('class', 'route' + (isWorldUnlocked(p, worlds[i].id) ? ' open' : ''));
    svg.appendChild(path);
  }

  const islands = worlds.map((w) => {
    const unlocked = isWorldUnlocked(p, w.id);
    const done = worldLevels(w.id).filter((l) => isLevelDone(p, l.id)).length;
    const complete = isWorldComplete(p, w.id);
    const isNext = rec && rec.world === w.id;
    return h(
      'button.island' + (unlocked ? '' : '.locked') + (complete ? '.complete' : '') + (isNext ? '.next' : ''),
      {
        type: 'button',
        style: { left: w.pos.x + '%', top: w.pos.y + '%', '--world': w.color },
        'aria-label': `${w.name}. ${unlocked ? t('ui.map.progress', { done, total: 10 }) : t('ui.map.locked')}`,
        onclick: () => navigate('/world/' + w.id)
      },
      h('span.island-emoji', { 'aria-hidden': 'true' }, unlocked ? w.emoji : '🔒'),
      h('span.island-name', w.name),
      h('span.island-progress', unlocked ? `${done}/10` : t('ui.map.lockedShort')),
      complete && w.mapPiece ? h('span.island-piece', { 'aria-hidden': 'true' }, '🧩') : null,
      isNext ? h('span.island-marker', { 'aria-hidden': 'true' }, avatarView(p, content, 'sm')) : null
    );
  });

  const pieces = h(
    'div.map-pieces',
    { 'aria-label': t('ui.map.pieces', { n: p.mapPieces.length }) },
    h('span.map-pieces-label', t('ui.map.piecesLabel')),
    worlds
      .filter((w) => w.mapPiece)
      .map((w) => h('span.piece' + (p.mapPieces.includes(w.id) ? '.have' : ''), { title: w.name }, p.mapPieces.includes(w.id) ? '🧩' : '▫️'))
  );

  let message;
  if (!rec) message = t('kiki.allDone', { name: p.nickname });
  else if (rec.id === 'beach-01') message = t('kiki.mapFirst', { name: p.nickname });
  else message = t('kiki.mapNext', { name: p.nickname, level: rec.title, world: content.worldById[rec.world].name });

  mount(
    h(
      'main.screen.map-screen',
      bar,
      storageBanner(),
      h('div.sea', svg, h('div.compass-deco', { 'aria-hidden': 'true' }, '🧭'), islands),
      pieces,
      h(
        'div.map-kiki',
        kiki(message, { speakNow: true }),
        rec ? btn(t('ui.map.go') + ' ▶', () => navigate('/level/' + rec.id), 'btn-primary btn-big') : null
      ),
      h(
        'nav.map-nav',
        { 'aria-label': t('ui.map.nav') },
        [
          ['⛺', 'ui.nav.camp', '/camp'],
          ['🏅', 'ui.nav.awards', '/awards'],
          ['⚙️', 'ui.nav.settings', '/settings'],
          ['👥', 'ui.nav.explorers', '/profiles'],
          ['🔒', 'ui.nav.parents', '/parent']
        ].map(([icon, key, path]) =>
          btn([h('span.nav-icon', { 'aria-hidden': 'true' }, icon), h('span.nav-label', t(key))], () => navigate(path), 'nav-btn')
        )
      )
    )
  );
  return () => bar.dispose();
}
