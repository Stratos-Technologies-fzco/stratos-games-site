// health/models.js - models behind the three Health track cases. Pure
// functions, checked by tests/professional.test.mjs.
import { rk4 } from '../../scientist/models.js';

// ---------- 1. Dengue: SEIR people + SEI Aedes mosquitoes (Ross-Macdonald) ----------
// Defaults: human incubation 5.5 days, infectious 5 days, mosquito extrinsic
// incubation 10 days, adult mosquito life 14 days, 2 female mosquitoes per person,
// 0.5 bites per mosquito per day, 0.4 chance of passing the virus per bite each way.
export const DENGUE = { N: 20000, m: 2, a: 0.5, bh: 0.4, bv: 0.4, sh: 1 / 5.5, g: 0.2, sv: 0.1, mu: 1 / 14, I0: 5, days: 210 };

export function dengueR0(p = DENGUE) {
  return (p.m * p.a * p.a * p.bh * p.bv * (p.sv / (p.sv + p.mu))) / (p.g * p.mu);
}

// choices: { source: 0..1 cut in breeding, fog: true/false, protect: 0..1 cut in bites, care: true/false }
export function dengue(choices = {}, base = DENGUE) {
  const p = { ...base };
  const start = 7; // the response starts one week after the first cases are noticed
  const src = choices.source || 0, protect = choices.protect || 0;
  // y = [Sh, Eh, Ih, Rh] as fractions of N people; [Sv, Ev, Iv] as fractions of the starting
  // mosquito population (m per person). New adults emerge at mu * K, so the total settles at K.
  const y0 = [1 - p.I0 / p.N, 0, p.I0 / p.N, 0, 1, 0, 0];
  const f = (t, [Sh, Eh, Ih, Rh, Sv, Ev, Iv]) => {
    const on = t >= start;
    const a = p.a * (on ? 1 - protect : 1);
    // Fogging kills flying adults for about two weeks only (Aedes rests indoors, so the effect is partial).
    const mu = p.mu * (on && choices.fog && t < start + 14 ? 1.6 : 1);
    // Source reduction removes breeding containers, so fewer new adults emerge.
    const K = on ? 1 - src : 1;
    const hInf = a * p.bh * p.m * Iv;
    const vInf = a * p.bv * Ih;
    return [
      -hInf * Sh,
      hInf * Sh - p.sh * Eh,
      p.sh * Eh - p.g * Ih,
      p.g * Ih,
      p.mu * K - vInf * Sv - mu * Sv,
      vInf * Sv - p.sv * Ev - mu * Ev,
      p.sv * Ev - mu * Iv,
    ];
  };
  const pts = rk4(f, y0, p.days, 0.01, 100).map(([t, Sh, Eh, Ih, Rh, Sv, Ev, Iv]) => [t, Ih * p.N, Rh * p.N, (Sv + Ev + Iv) * p.m * p.N, Sh]);
  const last = pts[pts.length - 1];
  const cases = Math.round(p.N * (1 - last[4])); // everyone infected so far (including the first 5)
  // Model assumptions for outcomes: about 1% of infections become severe dengue (most infections are
  // mild or without symptoms). Without early care about
  // 20% of severe cases die; with fever surveillance, NS1 testing and fluid management about 1% (WHO 2009).
  const severe = cases * 0.01;
  const deaths = severe * (choices.care ? 0.01 : 0.2);
  const peak = pts.reduce((b, q) => (q[1] > b[1] ? q : b));
  return { pts, cases, deaths, peakDay: Math.round(peak[0]), peakSick: Math.round(peak[1]), R0: dengueR0(p) };
}

// ---------- 2. Air quality: CPCB National AQI (2014) ----------
// [conc low, conc high, index low, index high] for 24-hour averages in µg/m³.
const BP = {
  pm25: [[0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200], [91, 120, 201, 300], [121, 250, 301, 400], [251, 380, 401, 500]],
  pm10: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200], [251, 350, 201, 300], [351, 430, 301, 400], [431, 600, 401, 500]],
};
export const AQI_BANDS = [[50, 'good'], [100, 'satisfactory'], [200, 'moderate'], [300, 'poor'], [400, 'veryPoor'], [500, 'severe']];

export function subIndex(pollutant, c) {
  const rows = BP[pollutant];
  const x = Math.max(0, Math.round(c));
  for (const [cl, ch, il, ih] of rows) if (x <= ch) return Math.round(il + ((ih - il) / (ch - cl)) * (Math.max(x, cl) - cl));
  return 500; // above the top breakpoint the index stays at 500
}
export const aqiOf = (pm25, pm10) => Math.max(subIndex('pm25', pm25), subIndex('pm10', pm10));
export const bandOf = (aqi) => AQI_BANDS.find(([hi]) => aqi <= hi)[1];

// A winter week typical of a north Indian city (illustrative values, not a measured record).
export const AIR_WEEK = { pm25: [142, 188, 236, 291, 318, 262, 205], pm10: [262, 318, 372, 446, 478, 410, 336] };

// Each measure cuts the share of PM2.5 / PM10 it comes from (model assumptions based on
// source-apportionment studies, which put road dust high for PM10 and burning high for PM2.5).
export const AIR_MEASURES = {
  dust: { pm25: 0.06, pm10: 0.22 },      // stop construction dust, water and sweep roads
  burning: { pm25: 0.18, pm10: 0.08 },   // stubble and waste burning replaced (bio-decomposer, collection)
  traffic: { pm25: 0.07, pm10: 0.05 },   // trucks diverted, public transport, odd-even
  industry: { pm25: 0.08, pm10: 0.06 },  // brick kilns and coal units paused, gas instead of coal
};
// Respiratory hospital visits rise about 0.8% per 10 µg/m³ PM2.5 above 15 (model assumption from
// time-series studies); baseline 30 visits per day per 100,000 people.
export function air(choices = {}, week = AIR_WEEK) {
  let cut25 = 0, cut10 = 0;
  for (const [k, on] of Object.entries(choices.measures || {})) if (on && AIR_MEASURES[k]) { cut25 += AIR_MEASURES[k].pm25; cut10 += AIR_MEASURES[k].pm10; }
  const days = week.pm25.map((c, i) => {
    const pm25 = c * (1 - cut25), pm10 = week.pm10[i] * (1 - cut10);
    const aqi = aqiOf(pm25, pm10);
    const visits = 30 * (1 + 0.0008 * Math.max(0, pm25 - 15));
    return { day: i + 1, pm25, pm10, aqi, band: bandOf(aqi), visits };
  });
  // Health advice protects the most exposed: N95 masks and indoor time for children, elderly and asthma patients.
  const advice = choices.advice ? 0.15 : 0;
  const base = week.pm25.reduce((s, c) => s + 30 * (1 + 0.0008 * Math.max(0, c - 15)), 0);
  const now = days.reduce((s, d) => s + d.visits, 0) * (1 - advice);
  return { days, visitsAvoided: Math.round(base - now), bad: days.filter((d) => d.aqi > 300).length, mean: Math.round(days.reduce((s, d) => s + d.aqi, 0) / days.length) };
}

// ---------- 3. Village water: BIS IS 10500:2012 drinking water ----------
// acceptable limit, and permissible limit when no other source exists (null = no relaxation).
export const BIS = {
  ph: { lo: 6.5, hi: 8.5 },
  turbidity: { acc: 1, perm: 5 },       // NTU
  tds: { acc: 500, perm: 2000 },        // mg/L
  fluoride: { acc: 1.0, perm: 1.5 },    // mg/L
  nitrate: { acc: 45, perm: null },     // mg/L as NO3
  arsenic: { acc: 0.01, perm: null },   // mg/L
  ecoli: { acc: 0, perm: null },        // per 100 mL: shall not be detectable
};

// What each treatment fixes (boiling kills germs but does nothing for chemicals and
// concentrates nitrate and fluoride as water evaporates).
export const TREAT = {
  none: [],
  boil: ['ecoli'],
  chlorine: ['ecoli'],
  filterChlorine: ['ecoli', 'turbidity'],
  defluoride: ['fluoride'],               // activated alumina or Nalgonda technique
  arsenicPlant: ['arsenic'],              // adsorption (iron-based) unit
  ro: ['tds', 'fluoride', 'nitrate', 'arsenic', 'ecoli', 'turbidity'],
  close: 'close',                         // stop drinking from this source
};

export function problemsOf(s) {
  const out = [];
  if (s.ph < BIS.ph.lo || s.ph > BIS.ph.hi) out.push('ph');
  for (const k of ['turbidity', 'tds', 'fluoride', 'nitrate', 'arsenic']) if (s[k] > (BIS[k].perm ?? BIS[k].acc)) out.push(k);
  if (s.ecoli > 0) out.push('ecoli');
  return out;
}

// Ratio of each reading to its limit (for the bar chart).
export function ratios(s) {
  return {
    turbidity: s.turbidity / BIS.turbidity.perm, tds: s.tds / BIS.tds.perm, fluoride: s.fluoride / BIS.fluoride.perm,
    nitrate: s.nitrate / BIS.nitrate.acc, arsenic: s.arsenic / BIS.arsenic.acc, ecoli: s.ecoli > 0 ? 2 : 0,
  };
}

// choices: { [sourceId]: treatmentId }. A source is safe when every problem is fixed;
// chlorine alone does not work in very turbid water (germs hide in particles).
export function water(sources, choices = {}) {
  let safePeople = 0, unsafePeople = 0, wasted = 0;
  const rows = sources.map((s) => {
    const t = choices[s.id] || 'none';
    const probs = problemsOf(s);
    if (TREAT[t] === 'close') {
      wasted += probs.length ? 0 : s.people;
      return { id: s.id, probs, treat: t, safe: null, closed: true };
    }
    let fixes = TREAT[t] || [];
    if (t === 'chlorine' && s.turbidity > BIS.turbidity.perm) fixes = [];
    const left = probs.filter((p) => !fixes.includes(p));
    const safe = left.length === 0;
    if (safe) safePeople += s.people; else unsafePeople += s.people;
    return { id: s.id, probs, treat: t, left, safe, closed: false };
  });
  const total = sources.reduce((n, s) => n + s.people, 0);
  return { rows, safePeople, unsafePeople, wasted, total };
}
