import { h, btn, mount, modal, avatarView } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { selectProfile, MAX_PROFILES, levelsCompleted, totalStars } from '../player.js';
import { unlockAudio } from '../audio.js';

export function render() {
  const cards = state.profiles.map((p) =>
    h(
      'button.profile-card',
      {
        type: 'button',
        onclick: () => {
          unlockAudio();
          selectProfile(p.id);
          navigate(p.tutorialDone ? '/map' : '/tutorial');
        }
      },
      avatarView(p, content, 'lg'),
      h('span.profile-name', p.nickname),
      h('span.profile-meta', content.levels.bands[p.band].name),
      h('span.profile-meta', `⭐ ${totalStars(p)} · ${t('ui.profiles.levels', { n: levelsCompleted(p) })}`)
    )
  );

  const canAdd = state.profiles.length < MAX_PROFILES;
  const addCard = h(
    'button.profile-card.profile-add',
    {
      type: 'button',
      onclick: () => {
        if (canAdd) navigate('/setup');
        else
          modal({
            title: t('ui.profiles.limitTitle'),
            body: h('p', t('ui.profiles.limitBody', { max: MAX_PROFILES })),
            buttons: [{ label: t('ui.common.ok'), value: true, cls: 'btn-primary' }]
          });
      }
    },
    h('span.profile-plus', { 'aria-hidden': 'true' }, '＋'),
    h('span.profile-name', t('ui.profiles.add')),
    h('span.profile-meta', t('ui.profiles.slots', { n: state.profiles.length, max: MAX_PROFILES }))
  );

  mount(
    h(
      'main.screen.profiles',
      h('h1.screen-title', t('ui.profiles.title')),
      h('p.screen-sub', t('ui.profiles.subtitle')),
      h('div.profile-grid', cards, addCard),
      h('div.screen-footer', btn('🔒 ' + t('ui.parent.entry'), () => navigate('/parent'), 'btn-ghost btn-small'))
    )
  );
}
