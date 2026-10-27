// Profile.js - player profiles and their progress, kept on this device only.
// Several children can share one device: each has a profile, with no login.
// The first profile keeps the original game save key, so old progress carries over.

const LIST_KEY = 'ecos-profiles-v2';
const PROG_KEY = 'ecos-progress-v2:';
export const LEGACY_SAVE = 'ecos-synthetica-v1';

// The seven Explorer modules, in the order they open.
export const EXPLORER_MODULES = ['plants', 'animals', 'water', 'foodchain', 'pollution', 'biodiversity', 'climate'];
// Explorer bands: modules each band adds (Class 1-3, 4-7, 8-10).
export const BANDS = [
  { id: 'b1', from: 1, to: 3, modules: ['plants', 'animals', 'water'] },
  { id: 'b2', from: 4, to: 7, modules: ['foodchain', 'pollution'] },
  { id: 'b3', from: 8, to: 10, modules: ['biodiversity', 'climate'] },
];

const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: lasts this visit */ } };

let state = read(LIST_KEY, null);
const memProgress = {};

function migrate() {
  if (state && Array.isArray(state.list)) return;
  state = { active: null, list: [] };
  const old = read(LEGACY_SAVE, null);
  if (old && ((old.scanned || []).length || old.tier > 0)) {
    // A player from before the three tiers: keep their game and open Eco Scientist for them.
    const p = newProfile('Player 1', 11);
    p.legacy = true;
    p.placement.scientist = true;
    state.list.push(p);
    state.active = p.id;
  }
  write(LIST_KEY, state);
}

function newProfile(name, cls) {
  const first = !state.list.length;
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: String(name || 'Player').slice(0, 24), cls: Number(cls) || 5,
    saveKey: first ? LEGACY_SAVE : null, created: new Date().toISOString(),
    placement: {}, unlocked: {}, classCode: '',
  };
}

migrate();

export const profiles = () => state.list;
export const activeProfile = () => state.list.find((p) => p.id === state.active) || null;
export function setActive(id) { state.active = id; write(LIST_KEY, state); }
export function saveProfiles() { write(LIST_KEY, state); }

export function createProfile(name, cls) {
  const p = newProfile(name, cls);
  if (!p.saveKey) p.saveKey = `${LEGACY_SAVE}:${p.id}`;
  state.list.push(p);
  state.active = p.id;
  write(LIST_KEY, state);
  return p;
}

export function removeProfile(id) {
  const p = state.list.find((x) => x.id === id);
  if (!p) return;
  try { localStorage.removeItem(PROG_KEY + id); localStorage.removeItem(p.saveKey); } catch (e) { /* ignore */ }
  state.list = state.list.filter((x) => x.id !== id);
  if (state.active === id) state.active = state.list[0] ? state.list[0].id : null;
  write(LIST_KEY, state);
}

export const saveKeyFor = (p) => p.saveKey || `${LEGACY_SAVE}:${p.id}`;

// ---------- progress ----------
const blank = () => ({ modules: {}, badges: {}, seeds: 0, trees: 0, journal: [], attempts: {}, cases: {} });

export function progress(p = activeProfile()) {
  if (!p) return blank();
  if (!memProgress[p.id]) memProgress[p.id] = { ...blank(), ...read(PROG_KEY + p.id, {}) };
  return memProgress[p.id];
}
export function saveProgress(p = activeProfile()) { if (p) write(PROG_KEY + p.id, progress(p)); }

// score 0..1 -> stars: 1 = done, 2 = 60%+, 3 = 90%+ with no hints.
export function starsFor(score, hints = 0) { return score >= 0.9 && !hints ? 3 : score >= 0.6 ? 2 : 1; }

export function completeModule(id, score, hints = 0, p = activeProfile()) {
  const pr = progress(p);
  const prev = pr.modules[id] || {};
  const done = score >= 0.6;
  const stars = done ? starsFor(score, hints) : 0;
  pr.modules[id] = { status: done || prev.status === 'done' ? 'done' : 'tried', stars: Math.max(prev.stars || 0, stars), best: Math.max(prev.best || 0, score), at: new Date().toISOString() };
  saveProgress(p);
  return pr.modules[id];
}

export function award(badge, p = activeProfile()) {
  const pr = progress(p);
  if (pr.badges[badge]) return false;
  pr.badges[badge] = new Date().toISOString();
  saveProgress(p);
  return true;
}

// Wrong answers come back after 1, 3 and 7 days.
const GAPS = [1, 3, 7];
export function recordAttempt(qid, correct, p = activeProfile()) {
  const pr = progress(p);
  const a = pr.attempts[qid] || { n: 0, wrong: 0, step: 0, due: null };
  a.n++;
  const now = Date.now();
  if (!correct) { a.wrong++; a.step = 0; a.due = now + GAPS[0] * 864e5; }
  else if (a.due) { a.step++; a.due = a.step < GAPS.length ? now + GAPS[a.step] * 864e5 : null; }
  pr.attempts[qid] = a;
  saveProgress(p);
}
export function dueReview(p = activeProfile()) {
  const now = Date.now();
  return Object.entries(progress(p).attempts).filter(([, a]) => a.due && a.due <= now).map(([id]) => id);
}

// ---------- unlocks ----------
export function explorerDone(p) {
  const m = progress(p).modules;
  return EXPLORER_MODULES.every((id) => m[id] && m[id].status === 'done');
}
export function scientistDone(p) {
  const s = read(saveKeyFor(p), null);
  return !!(s && s.completed);
}
export function bandOpen(band, p) {
  if (!p) return band.id === 'b1';
  if (p.cls >= band.from || p.unlocked[band.id]) return true;
  // Otherwise 70% of the band before it.
  const i = BANDS.indexOf(band);
  if (i <= 0) return true;
  const prev = BANDS.slice(0, i).flatMap((b) => b.modules);
  const m = progress(p).modules;
  return prev.filter((id) => m[id] && m[id].status === 'done').length >= Math.ceil(prev.length * 0.7);
}
export function moduleOpen(id, p) {
  const band = BANDS.find((b) => b.modules.includes(id));
  return bandOpen(band, p);
}
export function tierOpen(tier, p) {
  if (!p) return tier === 'explorer';
  if (tier === 'explorer') return true;
  if (tier === 'scientist') return !!(p.placement.scientist || p.unlocked.scientist || explorerDone(p));
  if (tier === 'professional') return !!(p.placement.professional || p.unlocked.professional || scientistDone(p));
  return false;
}
