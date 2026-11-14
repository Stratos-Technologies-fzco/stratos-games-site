import { h, btn, mount } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { unlockAudio } from '../audio.js';
import { isPersistent } from '../storage.js';
import { createProfile } from '../player.js';
import { track } from '../analytics.js';

export const DEFAULT_NICKNAME = 'Explorer';

export function render() {
  const go = async () => {
    unlockAudio();
    if (state.profiles.length === 0) {
      // Let the player start right away: a default explorer is made for them.
      // They can pick a nickname and age later in Settings.
      const avatars = content.rewards.avatars;
      try {
        await createProfile({
          nickname: DEFAULT_NICKNAME,
          band: 0,
          avatar: avatars[Math.floor(Math.random() * avatars.length)]
        });
        track('profile', 'created', 'band0');
        navigate('/tutorial');
      } catch {
        navigate('/profiles');
      }
    } else navigate('/profiles');
  };

  const worlds = content.levels.worlds;
  const pieceWorlds = worlds.filter((w) => w.mapPiece);
  const treasure = worlds.find((w) => !w.mapPiece);

  const trail = h(
    'div.splash-trail',
    { 'aria-hidden': 'true' },
    pieceWorlds.map((w) =>
      h('div.trail-island', { style: `--world:${w.color}` }, h('span.trail-emoji', w.emoji), h('span.trail-name', w.name), h('span.trail-piece', '🧩'))
    ),
    h('span.trail-arrow', '➜'),
    h('div.trail-island.trail-treasure', { style: `--world:${treasure.color}` }, h('span.trail-emoji', '💰'), h('span.trail-name', treasure.name))
  );

  mount(
    h(
      'main.screen.splash.splash-home',
      h('div.splash-logo', { 'aria-hidden': 'true' }, '🏝️'),
      h('h1.splash-title', t('ui.splash.title')),
      h('p.splash-sub', t('ui.splash.tagline')),
      trail,
      h('p.splash-goal', t('ui.splash.goal', { n: pieceWorlds.length })),
      h('div.splash-kiki', { 'aria-hidden': 'true' }, '🦜'),
      btn(t('ui.splash.play'), go, 'btn-primary btn-huge'),
      !isPersistent() ? h('p.banner.banner-warn', { role: 'alert' }, t('ui.errors.noStorage')) : null
    )
  );
}
