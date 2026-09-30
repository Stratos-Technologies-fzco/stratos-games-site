import { h, btn, mount } from '../ui.js';
import { t } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { unlockAudio } from '../audio.js';
import { isPersistent } from '../storage.js';

export function render() {
  const go = () => {
    unlockAudio();
    if (state.profiles.length === 0) navigate('/setup');
    else navigate('/profiles');
  };
  mount(
    h(
      'main.screen.splash',
      h('div.splash-logo', { 'aria-hidden': 'true' }, '🏝️'),
      h('h1.splash-title', t('ui.splash.title')),
      h('p.splash-sub', t('ui.splash.tagline')),
      h('div.splash-kiki', { 'aria-hidden': 'true' }, '🦜'),
      btn(t('ui.splash.play'), go, 'btn-primary btn-huge'),
      !isPersistent() ? h('p.banner.banner-warn', { role: 'alert' }, t('ui.errors.noStorage')) : null
    )
  );
}
