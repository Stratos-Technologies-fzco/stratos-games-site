// Mystery Island: app entry point.

import { initStorage, isPersistent } from './storage.js';
import { loadContent, t, content } from './content.js';
import { state } from './state.js';
import { loadProfiles, selectProfile, lastProfileId, saveProfile } from './player.js';
import { route, setGuard, setNotFound, startRouter, navigate } from './router.js';
import { unlockAudio } from './audio.js';
import { track, installErrorTracking } from './analytics.js';
import { h, btn, mount, modal } from './ui.js';

import * as splash from './screens/splash.js';
import * as profiles from './screens/profiles.js';
import * as setup from './screens/setup.js';
import * as tutorial from './screens/tutorial.js';
import * as map from './screens/map.js';
import * as world from './screens/world.js';
import * as level from './screens/level.js';
import * as camp from './screens/camp.js';
import * as achievements from './screens/achievements.js';
import * as settings from './screens/settings.js';
import * as parent from './screens/parent.js';

function fatal(title, message, action) {
  mount(
    h(
      'main.screen.splash',
      h('div.splash-logo', { 'aria-hidden': 'true' }, '🏝️'),
      h('h1.splash-title', title),
      h('p.splash-sub', message),
      action
    )
  );
}

function trackPlayTime() {
  const TICK = 15;
  let sinceSave = 0;
  setInterval(() => {
    if (document.visibilityState !== 'visible' || !state.profile) return;
    state.profile.stats.playSeconds += TICK;
    sinceSave += TICK;
    if (sinceSave >= 60) {
      sinceSave = 0;
      saveProfile(state.profile);
    }
  }, TICK * 1000);
}

function registerServiceWorker() {
  if (!content.config.pwa || !content.config.pwa.enabled) return;
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register('service-worker.js').catch(() => {
    /* offline play is optional; the game works without it */
  });
}

async function boot() {
  // audio may only start after the first tap (browser autoplay rules)
  ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, unlockAudio, { once: true, capture: true }));

  await initStorage();

  try {
    await loadContent();
  } catch (err) {
    console.error(err);
    const offline = navigator.onLine === false;
    fatal(
      'Mystery Island',
      offline
        ? 'Please connect to the internet to play. Once the game has loaded online, it can be played offline on this device.'
        : 'The game could not load. Please check your connection and try again.',
      h('button.btn.btn-primary.btn-big', { type: 'button', onclick: () => location.reload() }, 'Try again')
    );
    return;
  }

  document.title = t('ui.splash.title');
  installErrorTracking();

  let corrupt = 0;
  try {
    ({ corrupt } = await loadProfiles());
  } catch (err) {
    console.error(err);
    corrupt = 1;
  }
  const last = lastProfileId();
  if (last) selectProfile(last);
  if (!isPersistent()) state.storageWarning = true;

  const needsProfile = { profile: true };
  route('/', splash.render);
  route('/profiles', profiles.render);
  route('/setup', setup.render);
  route('/tutorial', tutorial.render, needsProfile);
  route('/map', map.render, needsProfile);
  route('/world/:id', world.render, needsProfile);
  route('/level/:id', level.render, needsProfile);
  route('/camp', camp.render, needsProfile);
  route('/awards', achievements.render, needsProfile);
  route('/settings', settings.render, needsProfile);
  route('/parent', parent.render);
  setGuard((path, opts) => {
    if (opts.profile && !state.profile) return state.profiles.length ? '/profiles' : '/setup';
    return null;
  });
  setNotFound(() => navigate('/', { replace: true }));

  await startRouter();
  track('app', 'session_start', 'band' + (state.profile ? state.profile.band : 'none'));
  trackPlayTime();
  registerServiceWorker();

  if (corrupt > 0) {
    const go = await modal({
      title: t('ui.errors.corruptTitle'),
      body: h('p', t('ui.errors.corruptBody')),
      buttons: [
        { label: t('ui.common.ok'), value: false, cls: 'btn-ghost' },
        { label: t('ui.parent.entry'), value: true, cls: 'btn-primary' }
      ]
    });
    if (go) navigate('/parent');
  }
}

boot().catch((err) => {
  console.error(err);
  fatal('Mystery Island', 'Something went wrong while starting the game.', btn('Try again', () => location.reload(), 'btn-primary'));
});
