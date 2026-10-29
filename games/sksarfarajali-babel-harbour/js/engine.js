// Word loading, seeded round building, and the reward rules.
export const LANGS = {
  de: { name: 'German', code: 'DE', stamp: 'HAFEN', building: 'office' },
  fr: { name: 'French', code: 'FR', stamp: 'PORT', building: 'cafe' },
  es: { name: 'Spanish', code: 'ES', stamp: 'PUERTO', building: 'fish' },
  it: { name: 'Italian', code: 'IT', stamp: 'PORTO', building: 'lighthouse', soon: true },
  nl: { name: 'Dutch', code: 'NL', stamp: 'HAVEN', building: 'bookshop', soon: true },
};
export const BUILDINGS = {
  office: { name: 'Harbour office', short: 'Office', cost: 0, lang: 'de' },
  cafe: { name: 'Café', short: 'Café', cost: 800, lang: 'fr', blurb: 'A little corner café on the quay. Once it opens, ships from France start calling at your harbour.' },
  fish: { name: 'Fish market', short: 'Fish market', cost: 1500, lang: 'es', blurb: 'Stalls of ice and silver fish. Once it opens, ships from Spain start calling at your harbour.' },
  lighthouse: { name: 'Lighthouse', short: 'Lighthouse', cost: 2500, lang: 'it', soon: true, blurb: 'A tall striped light for ships coming from Italy.' },
  bookshop: { name: 'Bookshop', short: 'Bookshop', cost: 3500, lang: 'nl', soon: true, blurb: 'A cosy shop of Dutch paperbacks.' },
};
export const STAMP_ROUNDS = 3; // rounds with a language needed for its passport stamp
export const REWARD = { first: 20, second: 10, perfect: 30, daily: 50, streakPer: 5, streakMax: 50, freeFactor: 0.5, starter: 100 };

// ---- seeded random ----
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---- word bank: one JSON file per language, loaded on demand ----
const cache = {};
export async function loadLang(code) {
  if (cache[code]) return cache[code];
  const res = await fetch(`data/${code}.json`);
  if (!res.ok) throw new Error('load failed ' + code);
  const data = await res.json();
  cache[code] = data.words;
  return cache[code];
}
export const wordById = (id) => {
  const lang = id.split('-')[0];
  return (cache[lang] || []).find((w) => w.id === id);
};
export const wordCount = (code) => (cache[code] ? cache[code].length : null);
export const dockLabel = (trap) => trap.replace(/^(a|an|the) /i, '');

// ---- round building ----
const MIX = {
  easy: { cognate: 0.45, false_friend: 0.25, partial: 0.15, cross_language: 0.15 },
  mixed: { cognate: 0.25, false_friend: 0.4, partial: 0.15, cross_language: 0.2 },
  tricky: { cognate: 0.1, false_friend: 0.6, partial: 0.15, cross_language: 0.15 },
};
function quotas(n, mix) {
  const types = Object.keys(mix);
  const raw = types.map((t) => mix[t] * n);
  const out = Object.fromEntries(types.map((t, i) => [t, Math.floor(raw[i])]));
  let left = n - Object.values(out).reduce((a, b) => a + b, 0);
  types.map((t, i) => [t, raw[i] - Math.floor(raw[i])]).sort((a, b) => b[1] - a[1]).forEach(([t]) => { if (left > 0) { out[t]++; left--; } });
  return out;
}

export function buildRound({ words, difficulty = 'mixed', count = 7, rng, exclude = [] }) {
  const ex = new Set(exclude);
  let pool = words.filter((w) => !ex.has(w.id));
  if (pool.length < count + 4) pool = words.slice();
  pool = shuffle(pool.slice().sort((a, b) => (a.id < b.id ? -1 : 1)), rng); // sort first so the seed alone decides the order
  const buckets = {};
  for (const w of pool) (buckets[w.type] ||= []).push(w);

  const picked = [];
  const meanings = new Set();
  const forms = new Set();
  const take = (w) => {
    const m = w.meaning.toLowerCase();
    if (meanings.has(m) || forms.has(w.word.toLowerCase())) return false;
    meanings.add(m); forms.add(w.word.toLowerCase()); picked.push(w); return true;
  };
  const q = quotas(count, MIX[difficulty] || MIX.mixed);
  for (const [type, n] of Object.entries(q)) {
    let got = 0;
    for (const w of buckets[type] || []) { if (got >= n) break; if (take(w)) got++; }
  }
  for (const w of pool) { if (picked.length >= count) break; take(w); } // top up if a type ran short
  const crates = shuffle(picked, rng);

  // docks: every true meaning plus decoys (the traps players fall for), padded to an even count
  const labels = new Set(crates.map((c) => c.meaning.toLowerCase()));
  const want = crates.length % 2 ? 1 : 2;
  const decoys = [];
  const addDecoy = (label) => {
    const l = label.toLowerCase();
    if (!labels.has(l) && decoys.length < want) { labels.add(l); decoys.push(label); }
  };
  for (const c of shuffle(crates, rng)) if (c.trap) addDecoy(dockLabel(c.trap));
  for (const w of pool) if (decoys.length < want) addDecoy(w.meaning);
  const docks = shuffle([...crates.map((c) => ({ label: c.meaning, owner: c.id })), ...decoys.map((label) => ({ label, owner: null }))], rng)
    .map((d, i) => ({ ...d, id: 'd' + i }));
  return { crates, docks };
}

// the tutorial is fixed: two easy cognates, then a false friend
export function buildTutorial(words) {
  const crates = ['Hotel', 'Hand', 'Gift'].map((w) => words.find((x) => x.word === w));
  const docks = [crates[2], crates[0], crates[1]].map((c, i) => ({ id: 'd' + i, label: c.meaning, owner: c.id }));
  return { crates, docks };
}

export function crateCoins(tries, mode) {
  const base = tries === 1 ? REWARD.first : tries === 2 ? REWARD.second : 0;
  return mode === 'free' ? Math.round(base * REWARD.freeFactor) : base;
}
