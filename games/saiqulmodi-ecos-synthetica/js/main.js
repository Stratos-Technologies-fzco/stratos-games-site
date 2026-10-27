// main.js - boots the path screen; each tier is loaded only when it is chosen.
import { Shell } from './app/Shell.js';
import { saveKeyFor } from './app/Profile.js';
import { addShareButtons } from './teacher/share.js';
import { addServerButton, llm } from './app/Connect.js';
import { addDaily } from './app/daily.js';
import { track } from './app/hooks.js';
import { watchPerformance } from './app/perf.js';
import { addStrings } from './app/strings.js';

addStrings({
  en: { 'hk.second': 'Second chance: keep going here' },
  hi: { 'hk.second': 'दूसरा मौका: यहीं से जारी रखें' },
  bn: { 'hk.second': 'দ্বিতীয় সুযোগ: এখান থেকেই চালিয়ে যাও' },
});

const $ = (id) => document.getElementById(id);

// Eco Scientist: the original game (4 forms, Lab, Codex, evolve quiz).
async function startScientist(profile) {
  const [{ Game, setSaveKey }, { UI }, { Sound }, { loadBank }] = await Promise.all([
    import('./GameLoop.js'), import('./UI.js'), import('./Sound.js'), import('./Quiz.js'),
  ]);
  setSaveKey(saveKeyFor(profile));
  const sound = new Sound();
  const ui = new UI(sound);
  try {
    const game = new Game($('stage'), ui, sound);
    ui.bind(game);
    window.ecos = game; // handy for testing from the browser console
    watchPerformance(game.renderer);
    track('level_start', { tier: 'scientist', form: game.tier });
    const evolve = game.evolve.bind(game);
    game.evolve = () => { const from = game.tier; evolve(); if (game.tier !== from) { track('level_complete', { tier: 'scientist', form: from }); track('level_start', { tier: 'scientist', form: game.tier }); } };
    window.ecosUI = ui;
    loadBank(game.tier);
    for (const fn of scientistAddOns) await fn(game, ui, profile);
  } catch (err) {
    console.error(err);
    $('fatal').hidden = false;
  }
}

// Later modules add to the Scientist game (dashboard, journal, experiments, tutor).
export const scientistAddOns = [];
scientistAddOns.push((game, ui, profile) => import('./tiers/scientist/AddOns.js').then((m) => m.mount(game, ui, profile)));

const tiers = {
  explorer: { available: true, start: (p) => import('./tiers/explorer/ExplorerGame.js').then((m) => m.start(p)) },
  scientist: { available: true, start: startScientist },
  professional: { available: true, total: 11, start: (p) => import('./tiers/professional/ProfessionalGame.js').then((m) => m.start(p)) },
};

const shell = new Shell(tiers);
addShareButtons(shell);
addServerButton(shell);
addDaily(shell);
window.ecosApp = { shell, tiers, scientistAddOns, llm };
shell.show();

// Offline play: cache what has been opened (only on http/https pages).
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
