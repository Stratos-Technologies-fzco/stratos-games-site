// Device storage with safe fallbacks, plus the UTC clock the whole game keys off.
const PREFIX = 'bh1:';
const mem = {};
export let storageBlocked = false;

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    storageBlocked = true;
    return mem[key] ?? null;
  }
}
function write(key, value) {
  mem[key] = value;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { storageBlocked = true; }
}

// ---- clock (UTC). ?date=YYYY-MM-DD overrides today for testing. ----
const override = new URLSearchParams(location.search).get('date');
const baseMs = override && /^\d{4}-\d{2}-\d{2}$/.test(override) ? Date.parse(override + 'T09:00:00Z') : null;
const loadedAt = performance.now();
export const nowMs = () => (baseMs === null ? Date.now() : baseMs + (performance.now() - loadedAt));
export const todayStr = () => new Date(nowMs()).toISOString().slice(0, 10);
const DAY = 86400000;
const EPOCH = Date.parse('2026-09-17T00:00:00Z'); // 2026-10-28 is Daily Harbour #42
export const dayNumber = (dateStr = todayStr()) => Math.max(1, Math.round((Date.parse(dateStr + 'T00:00:00Z') - EPOCH) / DAY) + 1);
export const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / DAY);
export function msToNextDay() {
  const t = nowMs();
  return (Math.floor(t / DAY) + 1) * DAY - t;
}
export function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}
// Monday-based week id, used for the weekly grace day.
export function weekId(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const back = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - back * DAY).toISOString().slice(0, 10);
}
export function fmtDateLong(dateStr) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(',', '').toUpperCase();
}
export function fmtWeekday(dateStr) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
}

// ---- saved items ----
const defaults = () => ({
  profile: { tutorialDone: false, welcomeSeen: false, demoSeen: false, music: true, sfx: true, reducedMotion: null, contrast: false, textSize: 0, lang: 'en' },
  progress: {
    coins: 0,
    buildings: { office: true },
    unlocked: { de: '0000-00-00' }, // language -> date it was unlocked
    stamps: {}, // language -> date earned
    roundsByLang: {},
    seen: [],
    recent: [],
    hints: { day: '', left: 3 },
  },
  streak: { current: 0, best: 0, lastDate: null, graceWeek: null, graceUsedOn: null },
  daily_results: [],
  round_in_progress: null,
  reports: [],
  events: [],
});

export const S = defaults();
export function load() {
  const d = defaults();
  for (const k of Object.keys(d)) {
    const v = read(k);
    if (v === null) { S[k] = d[k]; continue; }
    S[k] = Array.isArray(d[k]) || d[k] === null ? v : (typeof d[k] === 'object' ? { ...d[k], ...v } : v);
  }
  if (S.profile.reducedMotion === null) {
    S.profile.reducedMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  // probe storage so we can show the one-time "not saving" note
  try { localStorage.setItem(PREFIX + 'probe', '1'); localStorage.removeItem(PREFIX + 'probe'); } catch (e) { storageBlocked = true; }
  refreshHints();
}
export const save = (...keys) => keys.forEach((k) => write(k, S[k]));
export function resetAll() {
  const d = defaults();
  for (const k of Object.keys(d)) { S[k] = d[k]; try { localStorage.removeItem(PREFIX + k); } catch (e) {} delete mem[k]; }
}

export function refreshHints() {
  const t = todayStr();
  if (S.progress.hints.day !== t) { S.progress.hints = { day: t, left: 3 }; save('progress'); }
}

// ---- privacy-friendly anonymous events: kept on device, handed to the portal if it listens ----
export function track(name, props = {}) {
  S.events.push({ name, ...props, t: Math.floor(nowMs() / 1000) });
  if (S.events.length > 200) S.events.splice(0, S.events.length - 200);
  save('events');
  try { window.dispatchEvent(new CustomEvent('babelharbour:event', { detail: { name, ...props } })); } catch (e) {}
}
