// Level flow: Intro -> Exploration -> Mini-game -> Reward -> Save -> Next.
// A checkpoint is saved after every round so a refresh resumes safely.

import { h, btn, mount, kiki, topBar, starsRow, modal, toast, storageBanner } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { navigate } from '../router.js';
import {
  isLevelUnlocked,
  levelStars,
  saveCheckpoint,
  getCheckpoint,
  clearCheckpoint,
  nextLevelAfter,
  isLevelDone
} from '../player.js';
import { completeLevel } from '../rewards.js';
import { runMiniGame } from '../minigames/index.js';
import { sfx, speak, stopVoice } from '../audio.js';
import { track } from '../analytics.js';

export async function render({ id }) {
  const p = state.profile;
  const level = content.levelById[id];
  if (!level || !isLevelUnlocked(p, level)) {
    navigate(level ? '/world/' + level.world : '/map', { replace: true });
    return;
  }
  const world = content.worldById[level.world];
  let game = null;
  let bar = null;
  let disposed = false;

  const cleanup = () => {
    disposed = true;
    if (game) game.destroy();
    if (bar) bar.dispose();
    stopVoice();
  };

  function shell(...children) {
    if (bar) bar.dispose();
    bar = topBar({ title: level.title, back: () => leave() });
    mount(
      h(
        'main.screen.level-screen.world-' + level.world,
        { style: { '--world': world.color } },
        bar,
        storageBanner(),
        ...children
      )
    );
  }

  async function leave() {
    if (game) {
      const ok = await modal({
        title: t('ui.level.leaveTitle'),
        body: h('p', t('ui.level.leaveBody')),
        buttons: [
          { label: t('ui.level.stay'), value: false, cls: 'btn-primary' },
          { label: t('ui.level.leave'), value: true, cls: 'btn-ghost' }
        ]
      });
      if (!ok) return;
    }
    navigate('/world/' + level.world);
  }

  // ---------- Intro ----------
  function intro() {
    const best = levelStars(p, level.id);
    shell(
      h(
        'section.level-intro',
        h('div.level-badge', { 'aria-hidden': 'true' }, level.clue),
        h('p.level-kicker', `${world.name} · ${t('ui.world.level', { n: level.index })}`),
        h('h2.level-name', level.title),
        best ? h('p.level-best', t('ui.level.best'), ' ', starsRow(best)) : null,
        kiki(level.mission, { speakNow: true }),
        h('p.level-band', content.levels.bands[p.band].emoji + ' ' + content.levels.bands[p.band].name),
        btn(t('ui.level.start') + ' ▶', explore, 'btn-primary btn-huge')
      )
    );
  }

  // ---------- Exploration ----------
  function explore() {
    const scenery = world.scenery.map((emoji, i) =>
      h(
        'button.scene-item',
        {
          type: 'button',
          style: { left: 8 + ((i * 37) % 80) + '%', top: 12 + ((i * 53) % 60) + '%' },
          'aria-label': emoji,
          onclick: (e) => {
            sfx('pop');
            e.currentTarget.classList.remove('wiggle');
            void e.currentTarget.offsetWidth;
            e.currentTarget.classList.add('wiggle');
          }
        },
        emoji
      )
    );
    const clue = h(
      'button.scene-clue',
      { type: 'button', 'aria-label': t('ui.level.clueLabel'), onclick: () => play() },
      level.clue
    );
    shell(
      h(
        'section.explore',
        kiki(t('kiki.explore', { clue: level.clue }), { speakNow: true }),
        h('div.scene.scene-' + level.world, scenery, clue)
      )
    );
  }

  // ---------- Mini-game ----------
  function play(resume = null) {
    track('level', 'start', level.id);
    const seed = resume ? resume.seed : `${level.id}:${p.band}:${Date.now()}`;
    const container = h('section.game');
    shell(container);
    try {
      game = runMiniGame({
        container,
        level,
        band: resume ? resume.band : p.band,
        seed,
        questions: content.questions,
        resume,
        avatar: p.avatar,
        settings: state.settings,
        h,
        t,
        sfx,
        speak,
        onProgress: (progress) =>
          saveCheckpoint({ levelId: level.id, seed, band: resume ? resume.band : p.band, ...progress }),
        onComplete: (summary) => finish(summary)
      });
    } catch (err) {
      console.error(err);
      container.replaceChildren(h('p.banner.banner-warn', t('ui.errors.levelBroken')), btn(t('ui.common.backToMap'), () => navigate('/map'), 'btn-primary'));
    }
  }

  // ---------- Reward ----------
  async function finish(summary) {
    game = null;
    await clearCheckpoint();
    const firstEver = !isLevelDone(p, level.id);
    const result = await completeLevel(p, level, summary);
    if (disposed) return;
    track('level', 'complete', `${level.id}|${level.category}|band${p.band}|${result.stars}`);
    if (result.worldCompleted) track('world', 'complete', result.worldCompleted.id);
    if (!result.saved) toast(t('ui.errors.notSaved'), 'warn', 4000);

    const starEls = [1, 2, 3].map(() => h('span.big-star', { 'aria-hidden': 'true' }, '★'));
    const next = nextLevelAfter(level);
    const worlds = content.levels.worlds;
    const nextWorld = result.worldCompleted ? worlds[worlds.findIndex((w) => w.id === level.world) + 1] : null;
    const extras = [];
    if (result.mapPiece) extras.push(h('li.reward-extra', '🧩 ', t('ui.reward.mapPiece', { world: world.name })));
    if (result.worldGems) extras.push(h('li.reward-extra', '💎 ', t('ui.reward.worldGems', { n: result.worldGems })));
    for (const a of result.newAchievements) extras.push(h('li.reward-extra', a.emoji + ' ', t('ui.reward.achievement', { name: a.name, gems: a.gems })));
    if (nextWorld) extras.push(h('li.reward-extra', nextWorld.emoji + ' ', t('ui.reward.worldUnlocked', { world: nextWorld.name })));

    let message = t('kiki.reward' + result.stars);
    if (!firstEver && result.stars > result.prevStars) message = t('kiki.rewardImproved');

    const actions = [];
    if (level.world === 'island' && result.worldCompleted) {
      actions.push(btn('💰 ' + t('ui.reward.seeTreasure'), () => ending(), 'btn-primary btn-big'));
    } else if (next) {
      actions.push(btn(t('ui.reward.next') + ' ▶', () => navigate('/level/' + next.id), 'btn-primary btn-big'));
    } else if (nextWorld) {
      actions.push(btn(t('ui.reward.toWorld', { world: nextWorld.name }) + ' ▶', () => navigate('/world/' + nextWorld.id), 'btn-primary btn-big'));
    }
    actions.push(btn('🔁 ' + t('ui.reward.replay'), () => intro(), 'btn-ghost'));
    actions.push(btn('🗺️ ' + t('ui.reward.map'), () => navigate('/map'), 'btn-ghost'));

    shell(
      h(
        'section.reward',
        h('h2.reward-title', t('ui.reward.title')),
        h('div.reward-stars', { 'aria-label': t('ui.common.starsOf', { n: result.stars, max: 3 }) }, starEls),
        h(
          'ul.reward-list',
          h('li', '🪙 ', t('ui.reward.coins', { n: result.coins })),
          result.gems - result.worldGems > 0 ? h('li', '💎 ', t('ui.reward.gems', { n: result.gems - result.worldGems })) : null,
          extras
        ),
        kiki(message, { speakNow: true }),
        h('div.reward-actions', actions)
      )
    );
    starEls.forEach((el, i) => {
      if (i < result.stars)
        setTimeout(() => {
          el.classList.add('on');
          sfx('star');
        }, 350 + i * 380);
    });
    setTimeout(() => sfx(result.worldCompleted ? 'fanfare' : 'coin'), 350 + result.stars * 380);
    if (result.mapPiece) {
      setTimeout(
        () =>
          modal({
            title: t('ui.reward.mapPieceTitle'),
            body: h('div.center', h('div.big-emoji.spin-in', '🧩'), h('p', t('ui.reward.mapPieceBody', { n: p.mapPieces.length }))),
            buttons: [{ label: t('ui.common.hooray'), value: true, cls: 'btn-primary' }]
          }),
        1800
      );
    }
  }

  function ending() {
    sfx('fanfare');
    shell(
      h(
        'section.ending',
        h('div.big-emoji.spin-in', '💰'),
        h('h2', t('ui.ending.title')),
        kiki(t('kiki.ending', { name: p.nickname }), { speakNow: true, size: 'big' }),
        h('p', t('ui.ending.body')),
        h('div.reward-actions', btn('⛺ ' + t('ui.nav.camp'), () => navigate('/camp'), 'btn-primary'), btn('🗺️ ' + t('ui.reward.map'), () => navigate('/map'), 'btn-ghost'))
      )
    );
  }

  // ---------- restore checkpoint after refresh ----------
  const cp = await getCheckpoint();
  if (disposed) return cleanup;
  if (cp && cp.levelId === level.id && cp.round > 0) {
    const resume = await modal({
      title: t('ui.level.resumeTitle'),
      body: h('p', t('ui.level.resumeBody', { n: cp.round + 1 })),
      buttons: [
        { label: t('ui.level.restart'), value: false, cls: 'btn-ghost' },
        { label: t('ui.level.resume'), value: true, cls: 'btn-primary' }
      ],
      dismissable: false
    });
    if (resume) {
      play(cp);
      return cleanup;
    }
    await clearCheckpoint();
  } else if (cp && cp.levelId !== level.id) {
    await clearCheckpoint();
  }
  intro();
  return cleanup;
}
