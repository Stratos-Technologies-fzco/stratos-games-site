// tracks/cases.js - Engineering, Agriculture and Forestry cases for the shared
// case runner. Each case scores the player's plan against the best plan that
// fits the same budget (every combination is tried; there are only a few).
import { tr } from '../../../app/strings.js';
import { lineChart, legend, barChart } from '../../../charts/svg.js';
import { CASES, fmt } from '../cases.js';
import { solarWard, drains, wheat, irrigation, tigers, mangroves, METHODS } from './models.js';

const C = { a: 'var(--pink)', b: 'var(--green)', c: 'var(--cyan)', d: 'var(--amber)', e: 'var(--violet)', m: 'var(--muted)' };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const eff = (c, choice, d) => { const o = c.decisions.find((x) => x.id === d).options.find((x) => x.id === choice[d]); return o ? o.effect : 0; };

// All choices that fit the budget.
function* combos(c) {
  const ds = c.decisions;
  const idx = ds.map(() => 0);
  for (;;) {
    const choice = {};
    let cost = 0;
    ds.forEach((d, i) => { const o = d.options[idx[i]]; choice[d.id] = o.id; cost += o.cost || 0; });
    if (!c.budget || cost <= c.budget) yield choice;
    let k = 0;
    while (k < ds.length && ++idx[k] >= ds[k].options.length) { idx[k] = 0; k++; }
    if (k === ds.length) return;
  }
}
// value(choice) -> number; returns the best value over all plans that fit the budget.
const bestOf = (c, value) => { let b = -Infinity; for (const ch of combos(c)) b = Math.max(b, value(ch)); return b; };
const maxOf = (c, f) => { let b = 0; for (const ch of combos(c)) b = Math.max(b, f(ch)); return b || 1; };

// ---------- Engineering ----------
CASES.solar = {
  plan: (c, ch) => ({ solarMW: eff(c, ch, 'solar'), efficiency: eff(c, ch, 'eff'), batteryMWh: eff(c, ch, 'battery') }),
  value(c, ch) { const r = solarWard(this.plan(c, ch)); return 0.8 * r.netZero + 0.2 * (1 - r.peak / r.peakBase); },
  run(c, ch) {
    const r = solarWard(this.plan(c, ch));
    const bars = [
      { label: tr('en.demand'), value: Math.round(r.demand), color: C.d },
      { label: tr('en.solar'), value: Math.round(r.solar), color: C.b },
      { label: tr('en.grid'), value: Math.round(r.net), color: C.a },
    ];
    return {
      charts: [`<h3>${tr('en.chartMWh')}</h3>${barChart(bars, { unit: ' MWh', labelW: 170 })}`],
      metrics: [
        [tr('en.netZero'), Math.round(r.netZero * 100) + '%', '0%'],
        [tr('en.co2'), fmt(r.avoided) + ' t', '0 t'],
        [tr('en.peak'), r.peak.toFixed(2) + ' MW', r.peakBase.toFixed(2) + ' MW'],
      ],
      score: clamp01(this.value(c, ch) / bestOf(c, (x) => this.value(c, x))),
      impact: { value: r.avoided / 100 },
      summary: { netZero: Math.round(r.netZero * 100), co2Avoided: Math.round(r.avoided) },
    };
  },
};

CASES.drain = {
  plan: (c, ch) => ({ capacity: eff(c, ch, 'drain'), dC: eff(c, ch, 'permeable') + eff(c, ch, 'garden') + eff(c, ch, 'rwh'), desilt: !!eff(c, ch, 'desilt') }),
  value(c, ch, maxR) { const r = drains(this.plan(c, ch)); return r.safety + 0.15 * (r.recharge / maxR); },
  run(c, ch) {
    const maxR = maxOf(c, (x) => drains(this.plan(c, x)).recharge);
    const r = drains(this.plan(c, ch));
    const base = drains({});
    const bars = r.storms.map((s) => ({ label: tr('dr.' + s.id) + ` (${s.i} mm/h)`, value: +s.Q.toFixed(2), color: s.ok ? C.b : C.a }));
    bars.push({ label: tr('dr.capacity'), value: +r.cap.toFixed(2), color: C.c });
    return {
      charts: [`<h3>${tr('dr.chart')}</h3>${barChart(bars, { unit: ' m³/s', labelW: 200 })}<p class="small">${tr('dr.note')}</p>`],
      metrics: [
        [tr('dr.C'), r.C.toFixed(2), base.C.toFixed(2)],
        [tr('dr.handled'), r.storms.filter((s) => s.ok).length + ' / 3', base.storms.filter((s) => s.ok).length + ' / 3'],
        [tr('dr.recharge'), fmt(r.recharge) + ' m³', '0 m³'],
      ],
      score: clamp01(this.value(c, ch, maxR) / bestOf(c, (x) => this.value(c, x, maxR))),
      impact: { value: r.safety * 20 },
      summary: { handled: r.storms.filter((s) => s.ok).length, recharge: Math.round(r.recharge) },
    };
  },
};

// ---------- Agriculture ----------
CASES.wheat = {
  plan: (c, ch) => ({ dose: eff(c, ch, 'dose'), method: ch.method, legume: !!eff(c, ch, 'legume') }),
  // Income counts as the gain over an unfertilised field, so doing nothing scores low.
  value(c, ch, maxI, maxL) { const r = wheat(this.plan(c, ch)); const i0 = wheat({}).income; return 0.7 * ((r.income - i0) / (maxI - i0)) + 0.3 * (1 - r.leached / maxL); },
  run(c, ch) {
    const maxI = maxOf(c, (x) => wheat(this.plan(c, x)).income);
    const maxL = maxOf(c, (x) => wheat(this.plan(c, x)).leached);
    const plan = this.plan(c, ch);
    const r = wheat(plan);
    const curve = [];
    for (let n = 0; n <= 200; n += 10) curve.push([n, wheat({ ...plan, dose: n }).yieldQ]);
    const series = [{ name: tr('ag.curve'), color: C.b, points: curve }, { name: tr('pro.yourPlan'), color: C.a, scatter: true, points: [[plan.dose, r.yieldQ]] }];
    return {
      charts: [`<h3>${tr('ag.chart')}</h3>${legend(series)}${lineChart(series, { xLabel: 'kg N/ha', yLabel: 'q/ha', yMin: 0 })}`],
      metrics: [
        [tr('ag.yield'), r.yieldQ.toFixed(1) + ' q/ha', ''],
        [tr('ag.income'), '₹' + fmt(r.income), ''],
        [tr('ag.lost'), r.lost.toFixed(0) + ' kg', ''],
        [tr('ag.leached'), r.leached.toFixed(0) + ' kg', ''],
      ],
      score: clamp01(this.value(c, ch, maxI, maxL) / bestOf(c, (x) => this.value(c, x, maxI, maxL))),
      impact: { value: (maxL - r.leached) / 5 },
      summary: { yield: +r.yieldQ.toFixed(1), income: Math.round(r.income), leached: Math.round(r.leached) },
    };
  },
};

CASES.irrigation = {
  plan: (c, ch) => ({ method: ch.method, mulch: !!eff(c, ch, 'mulch'), sensor: !!eff(c, ch, 'sensor') }),
  value(c, ch, maxI, flood) { const r = irrigation(this.plan(c, ch)); return 0.5 * (1 - r.volume / flood) + 0.5 * (r.income / maxI); },
  run(c, ch) {
    const flood = irrigation({ method: 'flood' });
    const maxI = maxOf(c, (x) => irrigation(this.plan(c, x)).income);
    const r = irrigation(this.plan(c, ch));
    const bars = Object.keys(METHODS).map((m) => ({ label: tr('ir.m.' + m), value: Math.round(irrigation({ ...this.plan(c, ch), method: m }).volume), color: m === ch.method ? C.c : C.m }));
    return {
      charts: [`<h3>${tr('ir.chart')}</h3>${barChart(bars, { unit: ' m³', labelW: 130 })}`],
      metrics: [
        [tr('ir.water'), fmt(r.volume) + ' m³', fmt(flood.volume) + ' m³'],
        [tr('ir.energy'), fmt(r.kwh) + ' kWh', fmt(flood.kwh) + ' kWh'],
        [tr('ir.fall'), r.fall.toFixed(1) + ' m', flood.fall.toFixed(1) + ' m'],
        [tr('ir.income'), '₹' + fmt(r.income), '₹' + fmt(flood.income)],
      ],
      score: clamp01(this.value(c, ch, maxI, flood.volume) / bestOf(c, (x) => this.value(c, x, maxI, flood.volume))),
      impact: { value: (flood.volume - r.volume) / 1000 },
      summary: { water: Math.round(r.volume), income: Math.round(r.income) },
    };
  },
};

// ---------- Forestry ----------
CASES.tiger = {
  plan: (c, ch) => ({ poaching: eff(c, ch, 'patrol'), preyTarget: eff(c, ch, 'prey'), corridor: !!eff(c, ch, 'corridor'), relocate: !!eff(c, ch, 'relocate') }),
  // Tigers that reach another forest through the corridor count too: they grow the landscape population.
  value(c, ch, maxT, maxC) { const r = tigers(this.plan(c, ch)); return 0.6 * ((r.tigers + r.moved) / maxT) + 0.4 * (1 - r.conflict / maxC); },
  run(c, ch) {
    const maxT = maxOf(c, (x) => { const t = tigers(this.plan(c, x)); return t.tigers + t.moved; });
    const maxC = maxOf(c, (x) => tigers(this.plan(c, x)).conflict);
    const r = tigers(this.plan(c, ch));
    const base = tigers({});
    const series = [
      { name: tr('pro.noAction'), color: C.m, dash: true, points: base.pts.map((p) => [p[0], p[1]]) },
      { name: tr('fo.tigers'), color: C.d, points: r.pts.map((p) => [p[0], p[1]]) },
      { name: tr('fo.K'), color: C.b, dash: true, points: r.pts.slice(1).map((p) => [p[0], p[3]]) },
    ];
    return {
      charts: [`<h3>${tr('fo.chart')}</h3>${legend(series)}${lineChart(series, { xLabel: tr('fo.years'), yMin: 0 })}`],
      metrics: [
        [tr('fo.tigers20'), Math.round(r.tigers), Math.round(base.tigers)],
        [tr('fo.conflict'), Math.round(r.conflict), Math.round(base.conflict)],
        [tr('fo.moved'), Math.round(r.moved), 0],
      ],
      score: clamp01(this.value(c, ch, maxT, maxC) / bestOf(c, (x) => this.value(c, x, maxT, maxC))),
      impact: { value: r.tigers - base.tigers },
      summary: { tigers: Math.round(r.tigers), conflict: Math.round(r.conflict) },
    };
  },
};

CASES.mangrove = {
  plan: (c, ch) => ({ width: eff(c, ch, 'width'), mix: ch.mix, raise: eff(c, ch, 'raise'), shelters: !!eff(c, ch, 'shelters') }),
  value(c, ch, maxR, maxCarbon) { const r = mangroves(this.plan(c, ch)); return 0.6 * (1 - r.atRisk / maxR) + 0.4 * (r.carbon / maxCarbon); },
  run(c, ch) {
    const maxR = maxOf(c, (x) => mangroves(this.plan(c, x)).atRisk);
    const maxCarbon = maxOf(c, (x) => mangroves(this.plan(c, x)).carbon);
    const r = mangroves(this.plan(c, ch));
    const base = mangroves({});
    const bars = [
      { label: tr('mg.water'), value: +r.level.toFixed(2), color: r.breach ? C.a : C.c },
      { label: tr('mg.top'), value: +r.top.toFixed(2), color: C.b },
    ];
    return {
      charts: [`<h3>${tr('mg.chart')}</h3>${barChart(bars, { unit: ' m', labelW: 200, max: 3.5 })}<p class="small">${tr(r.breach ? 'mg.breach' : 'mg.safe')}</p>`],
      metrics: [
        [tr('mg.risk'), fmt(r.atRisk), fmt(base.atRisk)],
        [tr('mg.carbon'), fmt(r.carbon) + ' t', '0 t'],
        [tr('mg.fish'), fmt(r.fishHa) + ' ha', '0 ha'],
      ],
      score: clamp01(this.value(c, ch, maxR, maxCarbon) / bestOf(c, (x) => this.value(c, x, maxR, maxCarbon))),
      impact: { value: (base.atRisk - r.atRisk) / 50 + r.carbon / 500 },
      summary: { breach: r.breach, atRisk: Math.round(r.atRisk), carbon: Math.round(r.carbon) },
    };
  },
};
