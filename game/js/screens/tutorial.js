// Meet Kiki + a short tutorial, then straight into the first level.

import { h, btn, mount, kiki } from '../ui.js';
import { t, tList } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { saveProfile } from '../player.js';
import { unlockAudio, stopVoice } from '../audio.js';

export function render() {
  const p = state.profile;
  const lines = tList('kiki.tutorial');
  const icons = ['🦜', '🗺️', '💡', '⭐', '🏖️'];
  let i = 0;
  const bird = kiki(lines[0].replace('{name}', p.nickname), { key: 'tutorial-0', size: 'big' });
  const icon = h('div.tutorial-icon', { 'aria-hidden': 'true' }, icons[0]);
  const nextBtn = btn(t('ui.common.next'), next, 'btn-primary btn-big');

  async function finish() {
    stopVoice();
    p.tutorialDone = true;
    await saveProfile(p);
    navigate('/level/beach-01');
  }

  function next() {
    unlockAudio();
    i++;
    if (i >= lines.length) {
      finish();
      return;
    }
    bird.setText(lines[i].replace('{name}', p.nickname), 'tutorial-' + i);
    icon.textContent = icons[i] || '🦜';
    if (i === lines.length - 1) nextBtn.textContent = t('ui.tutorial.go');
  }

  mount(
    h(
      'main.screen.tutorial',
      h('h1.screen-title', t('ui.tutorial.title')),
      icon,
      bird,
      h('div.row', btn(t('ui.tutorial.skip'), finish, 'btn-ghost'), nextBtn)
    )
  );
  return () => stopVoice();
}
