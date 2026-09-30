// Player Setup: nickname (no full name), age band and avatar.

import { h, btn, mount, toast } from '../ui.js';
import { t, tList, content } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import { createProfile, sanitizeNickname, MAX_PROFILES, NICKNAME_MAX } from '../player.js';
import { speak, unlockAudio } from '../audio.js';
import { track } from '../analytics.js';

export function render() {
  if (state.profiles.length >= MAX_PROFILES) {
    navigate('/profiles', { replace: true });
    return;
  }
  const choice = { nickname: '', band: null, avatar: null };
  let step = 0;
  const root = h('main.screen.setup');

  function draw() {
    root.replaceChildren();
    const dots = h(
      'div.steps',
      [0, 1, 2].map((i) => h('span.step' + (i === step ? '.current' : i < step ? '.done' : ''), { 'aria-hidden': 'true' }))
    );
    const back = step > 0 || state.profiles.length > 0
      ? btn('← ' + t('ui.common.back'), () => {
          if (step > 0) {
            step--;
            draw();
          } else navigate('/profiles');
        }, 'btn-ghost btn-small')
      : null;

    if (step === 0) {
      const input = h('input.text-input#nick', {
        type: 'text',
        maxlength: String(NICKNAME_MAX),
        autocomplete: 'off',
        autocapitalize: 'words',
        spellcheck: 'false',
        placeholder: t('ui.setup.nickPlaceholder'),
        value: choice.nickname,
        'aria-describedby': 'nick-help',
        oninput: (e) => (choice.nickname = e.target.value)
      });
      const suggestions = h(
        'div.chips',
        tList('ui.setup.suggestions').map((s) =>
          btn(s, () => {
            input.value = s;
            choice.nickname = s;
          }, 'chip')
        )
      );
      root.append(
        dots,
        h('h1.screen-title', t('ui.setup.nickTitle')),
        h('label.visually-hidden', { for: 'nick' }, t('ui.setup.nickTitle')),
        input,
        h('p.help#nick-help', t('ui.setup.nickHelp')),
        h('p.help', t('ui.setup.orPick')),
        suggestions,
        h(
          'div.row',
          back,
          btn(t('ui.common.next'), () => {
            const clean = sanitizeNickname(choice.nickname);
            if (!clean) {
              toast(t('ui.setup.nickNeeded'), 'warn');
              input.focus();
              return;
            }
            if (state.profiles.some((p) => p.nickname.toLowerCase() === clean.toLowerCase())) {
              toast(t('ui.setup.nickTaken'), 'warn');
              return;
            }
            choice.nickname = clean;
            step = 1;
            draw();
          }, 'btn-primary')
        )
      );
      setTimeout(() => input.focus({ preventScroll: true }), 50);
    } else if (step === 1) {
      root.append(
        dots,
        h('h1.screen-title', t('ui.setup.bandTitle', { name: choice.nickname })),
        h(
          'div.band-grid',
          content.levels.bands.map((b) =>
            h(
              'button.band-card' + (choice.band === b.id ? '.selected' : ''),
              {
                type: 'button',
                'aria-pressed': String(choice.band === b.id),
                onclick: () => {
                  choice.band = b.id;
                  speak(`${b.name}, ${t('ui.setup.ages', { ages: b.ages })}`);
                  step = 2;
                  draw();
                }
              },
              h('span.band-emoji', b.emoji),
              h('span.band-name', b.name),
              h('span.band-ages', t('ui.setup.ages', { ages: b.ages })),
              h('span.band-desc', t('ui.setup.bandDesc' + b.id))
            )
          )
        ),
        h('p.help', t('ui.setup.bandHelp')),
        h('div.row', back)
      );
    } else {
      const avatars = content.rewards.avatars;
      root.append(
        dots,
        h('h1.screen-title', t('ui.setup.avatarTitle')),
        h(
          'div.avatar-grid',
          avatars.map((a) =>
            h(
              'button.avatar-choice' + (choice.avatar === a ? '.selected' : ''),
              {
                type: 'button',
                'aria-pressed': String(choice.avatar === a),
                'aria-label': t('ui.setup.avatarLabel'),
                onclick: () => {
                  choice.avatar = a;
                  draw();
                }
              },
              a
            )
          )
        ),
        h(
          'div.row',
          back,
          btn(t('ui.setup.start'), async () => {
            if (!choice.avatar) {
              toast(t('ui.setup.avatarNeeded'), 'warn');
              return;
            }
            unlockAudio();
            try {
              await createProfile(choice);
              track('profile', 'created', 'band' + choice.band);
              navigate('/tutorial');
            } catch {
              toast(t('ui.profiles.limitTitle'), 'warn');
              navigate('/profiles');
            }
          }, 'btn-primary', { disabled: false })
        )
      );
    }
  }
  draw();
  mount(root);
}
