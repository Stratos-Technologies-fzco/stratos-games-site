// hooks.js - the stratos.games moments, ready for the day the site turns on
// its own (Stratos-run) numbers and rewarded ads. Until then:
//   track()        does nothing: nothing is counted or sent anywhere
//   offerReward()  gives the reward straight away, free
// Moments used: level_start, level_complete, game_over, reward_offered, reward_taken.
// Rules from the makers' guide: rewarded only (never forced), never in the
// first session, at most one second chance per level.

const FIRST_SESSION_KEY = 'ecos-first-session';
let firstSession = true;
try { firstSession = !localStorage.getItem(FIRST_SESSION_KEY); localStorage.setItem(FIRST_SESSION_KEY, '1'); } catch (e) { /* storage blocked */ }

export function track(name, details = {}) { // eslint-disable-line no-unused-vars
  // Intentionally empty until stratos.games switches on its own analytics.
}

export const isFirstSession = () => firstSession;

const used = new Set();
// level: a key for "one per level"; returns false when the second chance was already used.
export function offerReward(onDone, level = 'any') {
  if (used.has(level)) return false;
  used.add(level);
  track('reward_offered', { level });
  // Later: show a rewarded ad first (never in the first session). For now the player gets it free.
  track('reward_taken', { level });
  onDone();
  return true;
}
export const rewardUsed = (level) => used.has(level);
export const resetReward = (level) => used.delete(level);
