// Parent Area: simple parent gate, local progress dashboard, analytics
// switch and reset (one explorer or everything), always with confirmation.

import { h, btn, mount, topBar, confirmModal, toast, formatMinutes } from '../ui.js';
import { t, content } from '../content.js';
import { state, reloadSettings } from '../state.js';
import { navigate } from '../router.js';
import { deleteProfile, levelsCompleted, totalStars, worldLevels, isLevelDone, saveProfile, loadProfiles } from '../player.js';
import { clearAll, storageMode } from '../storage.js';
import { analyticsAvailable, track } from '../analytics.js';
import { toggleRow } from './settings.js';
import { stopMusic } from '../audio.js';

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

let unlockedUntil = 0;

export function render() {
  const back = () => navigate(state.profile ? '/map' : state.profiles.length ? '/profiles' : '/');
  if (Date.now() < unlockedUntil) return dashboard(back);
  return gate(back);
}

function gate(back) {
  const bar = topBar({ title: t('ui.parent.title'), back, showWallet: false });
  const holdMs = ((content.config.parentGate && content.config.parentGate.holdSeconds) || 3) * 1000;
  const digits = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
  const entered = [];
  const display = h('div.pin-display', { 'aria-live': 'polite' });
  const stage = h('div.gate-stage');
  let holdTimer = null;

  const drawDisplay = () => {
    display.replaceChildren(...digits.map((_, i) => h('span.pin-digit', entered[i] != null ? String(entered[i]) : '•')));
  };

  function showQuestion() {
    drawDisplay();
    const keypad = h(
      'div.keypad',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) =>
        btn(String(n), () => {
          entered.push(n);
          drawDisplay();
          if (entered.length === digits.length) {
            if (entered.every((d, i) => d === digits[i])) {
              unlockedUntil = Date.now() + 5 * 60 * 1000;
              render();
            } else {
              toast(t('ui.parent.gateWrong'), 'warn');
              entered.length = 0;
              setTimeout(drawDisplay, 300);
            }
          }
        }, 'key')
      ),
      btn('⌫', () => {
        entered.pop();
        drawDisplay();
      }, 'key key-del', { 'aria-label': t('ui.parent.delete') })
    );
    stage.replaceChildren(
      h('p.gate-question', t('ui.parent.gateQuestion')),
      h('p.gate-words', digits.map((d) => NUMBER_WORDS[d]).join(' · ')),
      display,
      keypad
    );
  }

  const ring = h('span.hold-ring', { 'aria-hidden': 'true' });
  const holdBtn = h(
    'button.btn.btn-primary.btn-big.hold-btn',
    { type: 'button', style: { '--hold': holdMs + 'ms' } },
    ring,
    h('span', t('ui.parent.hold'))
  );
  const startHold = (e) => {
    e.preventDefault();
    holdBtn.classList.add('holding');
    holdTimer = setTimeout(() => {
      holdBtn.classList.remove('holding');
      showQuestion();
    }, holdMs);
  };
  const endHold = () => {
    holdBtn.classList.remove('holding');
    clearTimeout(holdTimer);
  };
  holdBtn.addEventListener('pointerdown', startHold);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => holdBtn.addEventListener(ev, endHold));
  holdBtn.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) startHold(e);
  });
  holdBtn.addEventListener('keyup', endHold);
  holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());

  stage.append(h('p.gate-intro', t('ui.parent.gateIntro')), holdBtn);
  mount(h('main.screen.parent-screen', bar, h('section.card.gate', h('div.big-emoji', '🔒'), stage)));
  return () => {
    clearTimeout(holdTimer);
    bar.dispose();
  };
}

function engineStats(p) {
  const rows = [];
  for (const [engine, name] of Object.entries(content.dialogue.ui.parent.engineNames)) {
    const s = p.stats.engines[engine];
    if (!s) continue;
    const answered = s.correct + s.wrong;
    rows.push({ name, levels: s.levels, accuracy: answered ? Math.round((s.correct / answered) * 100) : 0, hints: s.hints });
  }
  return rows;
}

function profileCard(p, redraw) {
  const bandSelect = h(
    'select.select',
    {
      'aria-label': t('ui.parent.band'),
      onchange: async (e) => {
        p.band = Number(e.target.value);
        await saveProfile(p);
        toast(t('ui.parent.bandChanged'), 'good');
      }
    },
    content.levels.bands.map((b) => h('option', { value: String(b.id), selected: p.band === b.id }, `${b.name} (${b.ages})`))
  );
  const stats = engineStats(p);
  return h(
    'section.card.parent-profile',
    h('header.pp-head', h('span.pp-avatar', p.avatar), h('div', h('h3', p.nickname), h('span.help', t('ui.parent.lastPlayed', { date: new Date(p.lastPlayedAt).toLocaleDateString() })))),
    h(
      'dl.pp-stats',
      h('div', h('dt', t('ui.parent.levels')), h('dd', `${levelsCompleted(p)} / 50`)),
      h('div', h('dt', t('ui.common.stars')), h('dd', `⭐ ${totalStars(p)} / 150`)),
      h('div', h('dt', t('ui.parent.pieces')), h('dd', `🧩 ${p.mapPieces.length} / 4`)),
      h('div', h('dt', t('ui.parent.time')), h('dd', formatMinutes(p.stats.playSeconds))),
      h('div', h('dt', t('ui.parent.coins')), h('dd', `🪙 ${p.coins}`)),
      h('div', h('dt', t('ui.parent.gems')), h('dd', `💎 ${p.gems}`))
    ),
    h('h4', t('ui.parent.worlds')),
    h(
      'ul.pp-worlds',
      content.levels.worlds.map((w) => {
        const levels = worldLevels(w.id);
        const done = levels.filter((l) => isLevelDone(p, l.id)).length;
        const stars = levels.reduce((s, l) => s + ((p.levels[l.id] || {}).stars || 0), 0);
        return h(
          'li',
          h('span.pp-world-name', `${w.emoji} ${w.name}`),
          h('span.progress.progress-sm', h('span.progress-fill', { style: { width: done * 10 + '%' } })),
          h('span.pp-world-num', `${done}/10 · ⭐${stars}`)
        );
      })
    ),
    h('h4', t('ui.parent.categories')),
    stats.length
      ? h(
          'table.pp-table',
          h('thead', h('tr', h('th', t('ui.parent.challenge')), h('th', t('ui.parent.levels')), h('th', t('ui.parent.accuracy')), h('th', t('ui.parent.hints')))),
          h('tbody', stats.map((r) => h('tr', h('td', r.name), h('td', String(r.levels)), h('td', r.accuracy + '%'), h('td', String(r.hints)))))
        )
      : h('p.help', t('ui.parent.noPlay')),
    h('div.row', h('label.help', t('ui.parent.band') + ' '), bandSelect),
    h(
      'div.row',
      btn('🗑️ ' + t('ui.parent.resetOne', { name: p.nickname }), async () => {
        const ok = await confirmModal(t('ui.parent.resetOneTitle', { name: p.nickname }), h('p', t('ui.parent.resetOneBody')), t('ui.parent.resetConfirm'), t('ui.common.cancel'), true);
        if (!ok) return;
        await deleteProfile(p.id);
        toast(t('ui.parent.resetDone'), 'good');
        redraw();
      }, 'btn-danger btn-small')
    )
  );
}

function dashboard(back) {
  const bar = topBar({ title: t('ui.parent.dashboard'), back, showWallet: false });
  const root = h('main.screen.parent-screen');

  function draw() {
    const analyticsInfo = analyticsAvailable() ? t('ui.parent.analyticsOn') : t('ui.parent.analyticsNotSetUp');
    root.replaceChildren(
      bar,
      h('p.screen-sub', t('ui.parent.intro')),
      ...(state.profiles.length ? state.profiles.map((p) => profileCard(p, draw)) : [h('section.card', h('p', t('ui.parent.noProfiles')))]),
      h(
        'section.card',
        h('h3', t('ui.parent.privacy')),
        toggleRow('📊 ' + t('ui.parent.analytics'), 'analytics', (on) => track('settings', on ? 'analytics_on' : 'analytics_off')),
        h('p.help', analyticsInfo),
        h('p.help', t('ui.parent.privacyNote')),
        h('p.help', t('ui.parent.storageMode', { mode: t('ui.parent.mode_' + storageMode()) }))
      ),
      h(
        'section.card',
        h('h3', t('ui.parent.resetAllTitle')),
        h('p.help', t('ui.parent.resetAllBody')),
        btn('⚠️ ' + t('ui.parent.resetAll'), async () => {
          const ok = await confirmModal(t('ui.parent.resetAllTitle'), h('p', t('ui.parent.resetAllConfirm')), t('ui.parent.resetConfirm'), t('ui.common.cancel'), true);
          if (!ok) return;
          const sure = await confirmModal(t('ui.parent.resetAllTitle'), h('p', t('ui.parent.resetAllSure')), t('ui.parent.resetAllYes'), t('ui.common.cancel'), true);
          if (!sure) return;
          stopMusic();
          await clearAll();
          reloadSettings();
          state.profile = null;
          await loadProfiles();
          toast(t('ui.parent.resetDone'), 'good');
          navigate('/');
        }, 'btn-danger')
      ),
      h('div.center', btn('🎮 ' + t('ui.parent.backToGame'), back, 'btn-primary btn-big'))
    );
  }
  draw();
  mount(root);
  return () => bar.dispose();
}
