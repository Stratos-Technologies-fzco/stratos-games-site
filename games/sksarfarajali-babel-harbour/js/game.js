// Round state, attempts, hints, rewards, streaks, stamps. No DOM in here.
import { S, save, todayStr, dayNumber, daysBetween, weekId, refreshHints, track, nowMs } from './store.js';
import { LANGS, BUILDINGS, REWARD, STAMP_ROUNDS, loadLang, wordById, buildRound, buildTutorial, mulberry32, hashStr, crateCoins } from './engine.js';

export const unlockedFor = (date) => Object.entries(S.progress.unlocked).filter(([, d]) => d < date).map(([l]) => l).sort();
export const unlockedNow = () => Object.keys(S.progress.unlocked).sort();

// A round carries ids only; word objects hang off a hidden property so the round saves as plain JSON.
function hydrate(r, words) {
  Object.defineProperty(r, 'W', { value: Object.fromEntries(words.map((w) => [w.id, w])), enumerable: false, writable: true });
  return r;
}
async function poolFor(langs) {
  const lists = await Promise.all(langs.map(loadLang));
  return lists.flat();
}
const baseRound = (mode, extra) => ({ mode, idx: 0, tries: 0, ruled: [], sorted: {}, results: [], hearts: 3, hintsUsed: 0, startedAt: Math.floor(nowMs() / 1000), ...extra });

export const dailyCount = (date = todayStr(), langs = unlockedFor(date)) => 6 + Math.floor(mulberry32(hashStr(`bh:${date}:${langs.join(',')}`))() * 3);

export async function makeDaily() {
  const date = todayStr();
  const langs = unlockedFor(date);
  const rng = mulberry32(hashStr(`bh:${date}:${langs.join(',')}`));
  const count = 6 + Math.floor(rng() * 3);
  const words = await poolFor(langs);
  const { crates, docks } = buildRound({ words, difficulty: 'mixed', count, rng });
  return hydrate(baseRound('daily', { date, dayNo: dayNumber(date), langs, difficulty: 'mixed', ids: crates.map((c) => c.id), docks }), crates);
}
export async function makeFree(langs, difficulty) {
  const words = await poolFor(langs);
  const rng = mulberry32((Math.random() * 4294967296) >>> 0);
  const count = 6 + Math.floor(rng() * 3);
  const { crates, docks } = buildRound({ words, difficulty, count, rng, exclude: S.progress.recent });
  return hydrate(baseRound('free', { date: todayStr(), langs, difficulty, ids: crates.map((c) => c.id), docks }), crates);
}
export async function makeTutorial() {
  const words = await loadLang('de');
  const { crates, docks } = buildTutorial(words);
  return hydrate(baseRound('tutorial', { date: todayStr(), langs: ['de'], ids: crates.map((c) => c.id), docks }), crates);
}
export async function restoreRound(saved) {
  const words = await poolFor(saved.langs);
  const r = hydrate(JSON.parse(JSON.stringify(saved)), words.filter((w) => saved.ids.includes(w.id)));
  if (!r.ids.every((id) => r.W[id])) throw new Error('word bank changed');
  return r;
}

export const cur = (r) => r.W[r.ids[r.idx]];
export const total = (r) => r.ids.length;
export const persistRound = (r) => { if (r.mode === 'tutorial') return; S.round_in_progress = r; save('round_in_progress'); };
export const clearRound = () => { S.round_in_progress = null; save('round_in_progress'); };

// returns { ok, tries, coins }
export function attempt(r, dockId) {
  const crate = cur(r);
  const dock = r.docks.find((d) => d.id === dockId);
  r.tries++;
  if (dock.owner === crate.id) {
    const coins = r.mode === 'tutorial' ? 0 : crateCoins(r.tries, r.mode);
    r.sorted[dockId] = crate.id;
    r.results.push({ id: crate.id, tries: r.tries, coins });
    S.progress.coins += coins;
    if (!S.progress.seen.includes(crate.id)) S.progress.seen.push(crate.id);
    if (r.mode !== 'tutorial') save('progress');
    return { ok: true, tries: r.tries, coins };
  }
  r.ruled.push(dockId);
  if (r.mode !== 'tutorial' && r.hearts > 0) r.hearts--;
  track('crate_wrong', { word: crate.id });
  return { ok: false, tries: r.tries };
}
export function nextCrate(r) { r.idx++; r.tries = 0; r.ruled = []; }

export function useHint(r) {
  refreshHints();
  if (S.progress.hints.left <= 0) return null;
  const crate = cur(r);
  const options = r.docks.filter((d) => d.owner !== crate.id && !r.sorted[d.id] && !r.ruled.includes(d.id));
  if (!options.length) return null;
  const pick = options[Math.floor(Math.random() * options.length)];
  r.ruled.push(pick.id); r.hintsUsed++;
  S.progress.hints.left--; save('progress');
  track('hint_used');
  return pick;
}

// ---- streak ----
export const graceLeft = () => (S.streak.graceWeek === weekId(todayStr()) ? 0 : 1);
export function effectiveStreak() {
  const s = S.streak;
  if (!s.lastDate) return 0;
  const gap = daysBetween(s.lastDate, todayStr());
  if (gap <= 1) return s.current;
  if (gap === 2 && graceLeft()) return s.current;
  return 0;
}
export const dailyDone = (date = todayStr()) => S.daily_results.find((d) => d.date === date);

function updateStreak(date) {
  const s = S.streak;
  let note = null;
  if (!s.lastDate) s.current = 1;
  else {
    const gap = daysBetween(s.lastDate, date);
    if (gap <= 0) { /* already counted */ }
    else if (gap === 1) s.current++;
    else if (gap === 2 && s.graceWeek !== weekId(date)) { s.current++; s.graceWeek = weekId(date); note = 'grace'; }
    else s.current = 1;
  }
  s.lastDate = date;
  s.best = Math.max(s.best, s.current);
  return note;
}

// ---- finishing a round: bonuses, streak, stamps, history ----
export function finishRound(r) {
  const free = r.mode === 'free';
  const first = r.results.filter((x) => x.tries === 1).length;
  const second = r.results.filter((x) => x.tries === 2).length;
  const mistakes = r.results.some((x) => x.tries > 1);
  const lines = [];
  const f1 = crateCoins(1, r.mode), f2 = crateCoins(2, r.mode);
  if (first) lines.push([`${first} first-try sort${first > 1 ? 's' : ''}`, first * f1]);
  if (second) lines.push([`${second} second-try sort${second > 1 ? 's' : ''}`, second * f2]);
  let bonus = 0;
  if (!mistakes) { const b = free ? Math.round(REWARD.perfect * REWARD.freeFactor) : REWARD.perfect; lines.push(['No-mistake bonus', b]); bonus += b; }
  let note = null, streakNow = S.streak.current;
  const wasDone = r.mode === 'daily' && dailyDone(r.date);
  if (r.mode === 'daily' && !wasDone) {
    lines.push(['Daily Harbour done', REWARD.daily]); bonus += REWARD.daily;
    note = updateStreak(r.date); streakNow = S.streak.current;
    const sb = Math.min(REWARD.streakMax, REWARD.streakPer * streakNow);
    lines.push([`${streakNow}-day streak bonus`, sb]); bonus += sb;
  }
  S.progress.coins += bonus;

  // passport stamps: rounds sailed per language
  const newStamps = [];
  const inRound = new Set(r.ids.map((id) => r.W[id].lang));
  for (const l of inRound) {
    S.progress.roundsByLang[l] = (S.progress.roundsByLang[l] || 0) + 1;
    if (S.progress.roundsByLang[l] >= STAMP_ROUNDS && !S.progress.stamps[l]) { S.progress.stamps[l] = r.date; newStamps.push(l); }
  }
  S.progress.recent = [...S.progress.recent, ...r.ids].slice(-24);
  const earned = r.results.reduce((a, x) => a + x.coins, 0) + bonus;
  const duration = Math.floor(nowMs() / 1000) - r.startedAt;

  if (r.mode === 'daily' && !wasDone) {
    S.daily_results.push({ date: r.date, dayNo: r.dayNo, tries: r.results.map((x) => x.tries), first, total: r.ids.length, coins: earned, streak: S.streak.current, newStamps, note });
  }
  clearRound();
  save('progress', 'streak', 'daily_results');
  track(r.mode === 'daily' ? 'daily_complete' : 'round_complete', { mode: r.mode, score: first, first_try: first, duration });
  return { mode: r.mode, langs: r.langs, diff: r.difficulty, date: r.date, dayNo: r.dayNo, total: r.ids.length, first, hearts: r.hearts, lines, earned, newStamps, note, streak: streakNow, repeat: !!wasDone };
}

// next building the player can still buy (for progress bars)
export function nextBuildings() {
  return Object.entries(BUILDINGS).filter(([id, b]) => !b.soon && !S.progress.buildings[id]).map(([id, b]) => ({ id, ...b }));
}
export function buy(id) {
  const b = BUILDINGS[id];
  if (!b || b.soon || S.progress.buildings[id] || S.progress.coins < b.cost) return false;
  S.progress.coins -= b.cost;
  S.progress.buildings[id] = true;
  S.progress.unlocked[b.lang] = todayStr(); // appears in Free Sail now, in the Daily from tomorrow
  save('progress');
  track('building_buy', { building: id });
  track('language_unlock', { language: b.lang });
  return true;
}
export { LANGS, BUILDINGS, wordById };
