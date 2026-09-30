import { h, btn, mount, topBar } from '../ui.js';
import { t } from '../content.js';
import { state, updateSettings } from '../state.js';
import { navigate } from '../router.js';
import { startMusic, stopMusic, stopVoice, speak } from '../audio.js';

export function toggleRow(label, key, onChange) {
  const input = h('input', {
    type: 'checkbox',
    role: 'switch',
    checked: state.settings[key],
    onchange: (e) => {
      updateSettings({ [key]: e.target.checked });
      onChange && onChange(e.target.checked);
    }
  });
  return h('label.toggle-row', h('span.toggle-label', label), h('span.switch', input, h('span.switch-track', { 'aria-hidden': 'true' })));
}

export function render() {
  const bar = topBar({ title: t('ui.settings.title'), back: '/map' });
  mount(
    h(
      'main.screen.settings-screen',
      bar,
      h(
        'section.card',
        toggleRow('🔔 ' + t('ui.settings.sound'), 'sound'),
        toggleRow('🎵 ' + t('ui.settings.music'), 'music', (on) => (on ? startMusic() : stopMusic())),
        toggleRow('🦜 ' + t('ui.settings.voice'), 'voice', (on) => (on ? speak(t('ui.settings.voiceOn'), { kiki: true }) : stopVoice())),
        toggleRow('📢 ' + t('ui.settings.autoRead'), 'autoRead')
      ),
      h(
        'section.card',
        btn('👥 ' + t('ui.nav.explorers'), () => navigate('/profiles'), 'btn-secondary btn-block'),
        btn('🔒 ' + t('ui.parent.entry'), () => navigate('/parent'), 'btn-ghost btn-block')
      )
    )
  );
  return () => bar.dispose();
}
