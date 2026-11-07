import { h, btn, mount, topBar, toast } from '../ui.js';
import { t, content } from '../content.js';
import { saveProfile, sanitizeNickname, NICKNAME_MAX } from '../player.js';
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

function aboutYou() {
  const p = state.profile;
  const input = h('input.text-input', {
    type: 'text',
    maxlength: String(NICKNAME_MAX),
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': t('ui.settings.nickLabel'),
    value: p.nickname
  });
  const bands = h(
    'div.chips',
    content.levels.bands.map((b) =>
      btn(`${b.emoji} ${b.ages}`, async (e) => {
        p.band = b.id;
        await saveProfile(p);
        bands.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
        e.currentTarget.setAttribute('aria-pressed', 'true');
      }, 'chip', { 'aria-pressed': String(p.band === b.id) })
    )
  );
  const save = btn(t('ui.settings.save'), async () => {
    const clean = sanitizeNickname(input.value);
    if (!clean) return toast(t('ui.setup.nickNeeded'), 'warn');
    if (state.profiles.some((x) => x.id !== p.id && x.nickname.toLowerCase() === clean.toLowerCase())) {
      return toast(t('ui.setup.nickTaken'), 'warn');
    }
    p.nickname = clean;
    input.value = clean;
    await saveProfile(p);
    toast(t('ui.settings.saved'), 'good');
  }, 'btn-primary btn-small');
  return h(
    'section.card.about-you',
    h('div.about-row', input, save),
    h('div.about-row', h('span.help', '🎂 ' + t('ui.settings.ageLabel')), bands)
  );
}

export function render() {
  const bar = topBar({ title: t('ui.settings.title'), back: '/map' });
  mount(
    h(
      'main.screen.settings-screen',
      bar,
      aboutYou(),
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
