// cases.js - the logic of each Professional case: turns the player's decisions
// into model inputs, runs the model, and returns charts, numbers and a score.
// The words live in content/text/professional/<track>.json.
import { tr } from '../../app/strings.js';
import { lineChart, legend, barChart } from '../../charts/svg.js';
import { dengue, air, AIR_WEEK, water, ratios } from './health/models.js';

const C = { a: 'var(--pink)', b: 'var(--green)', c: 'var(--cyan)', d: 'var(--amber)', e: 'var(--violet)', m: 'var(--muted)' };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const fmt = (n) => Math.round(n).toLocaleString('en-IN');

// Every option of every decision: { decisionId: optionId }
const opt = (c, choice, d) => c.decisions.find((x) => x.id === d).options.find((o) => o.id === choice[d]) || {};

export const CASES = {};

// ---------- Health ----------
CASES.dengue = {
  run(c, choice) {
    const plan = { source: opt(c, choice, 'source').effect || 0, fog: !!opt(c, choice, 'fog').effect, protect: opt(c, choice, 'protect').effect || 0, care: !!opt(c, choice, 'care').effect };
    const none = dengue({});
    const res = dengue(plan);
    const series = [
      { name: tr('pro.noAction'), color: C.m, dash: true, points: none.pts.map((p) => [p[0], p[1]]) },
      { name: tr('pro.yourPlan'), color: C.a, points: res.pts.map((p) => [p[0], p[1]]) },
    ];
    const mos = [
      { name: tr('pro.noAction'), color: C.m, dash: true, points: none.pts.map((p) => [p[0], p[3]]) },
      { name: tr('pro.yourPlan'), color: C.d, points: res.pts.map((p) => [p[0], p[3]]) },
    ];
    const score = clamp01(0.7 * (1 - res.cases / none.cases) + 0.3 * (1 - res.deaths / none.deaths));
    return {
      charts: [
        `<h3>${tr('dg.chartSick')}</h3>${legend(series)}${lineChart(series, { xLabel: tr('pro.days'), yMin: 0 })}`,
        `<h3>${tr('dg.chartMos')}</h3>${legend(mos)}${lineChart(mos, { xLabel: tr('pro.days'), yMin: 0 })}`,
      ],
      metrics: [
        [tr('dg.infections'), fmt(res.cases), fmt(none.cases)],
        [tr('dg.deaths'), res.deaths.toFixed(1), none.deaths.toFixed(1)],
        [tr('dg.peak'), fmt(res.peakSick), fmt(none.peakSick)],
        [tr('dg.r0'), res.R0.toFixed(1), none.R0.toFixed(1)],
      ],
      score,
      impact: { kind: 'lives', value: Math.max(0, none.deaths - res.deaths), cases: Math.max(0, none.cases - res.cases) },
      summary: { infections: res.cases, deaths: +res.deaths.toFixed(1) },
    };
  },
};

const AIR_KEYS = ['dust', 'burning', 'traffic', 'industry'];
CASES.aqi = {
  plan(c, choice) {
    const measures = {};
    for (const k of AIR_KEYS) measures[k] = !!opt(c, choice, k).effect;
    return { measures, advice: !!opt(c, choice, 'advice').effect };
  },
  // The best a planner could do inside the budget (all 32 combinations), for the score.
  best(c) {
    let best = 0;
    const keys = [...AIR_KEYS, 'advice'];
    for (let mask = 0; mask < 32; mask++) {
      let cost = 0;
      const ch = {};
      keys.forEach((k, i) => {
        const d = c.decisions.find((x) => x.id === k);
        const o = d.options[(mask >> i) & 1];
        ch[k] = o.id; cost += o.cost || 0;
      });
      if (cost > c.budget) continue;
      best = Math.max(best, air(this.plan(c, ch)).visitsAvoided);
    }
    return best;
  },
  run(c, choice) {
    const base = air({});
    const res = air(this.plan(c, choice));
    const series = [
      { name: tr('pro.noAction'), color: C.m, dash: true, points: base.days.map((d) => [d.day, d.aqi]) },
      { name: tr('pro.yourPlan'), color: C.c, points: res.days.map((d) => [d.day, d.aqi]) },
    ];
    const marks = [{ y: 300, label: tr('aq.poorEdge'), color: C.d }, { y: 400, label: tr('aq.severeEdge'), color: C.a }];
    const table = `<table class="pro-table"><thead><tr><th>${tr('pro.day')}</th><th>PM2.5</th><th>PM10</th><th>AQI</th><th>${tr('aq.band')}</th></tr></thead><tbody>${res.days.map((d) => `<tr><td>${d.day}</td><td>${Math.round(d.pm25)}</td><td>${Math.round(d.pm10)}</td><td><b>${d.aqi}</b></td><td><span class="aqi-chip aqi-${d.band}">${tr('aq.' + d.band)}</span></td></tr>`).join('')}</tbody></table>`;
    return {
      charts: [`<h3>${tr('aq.chart')}</h3>${legend(series)}${lineChart(series, { xLabel: tr('pro.day'), yMin: 0, yMax: 500, marks })}`, table],
      metrics: [
        [tr('aq.mean'), res.mean, base.mean],
        [tr('aq.badDays'), res.bad, base.bad],
        [tr('aq.visits'), fmt(res.visitsAvoided), 0],
      ],
      score: clamp01(res.visitsAvoided / (this.best(c) || 1)),
      impact: { kind: 'lives', value: res.visitsAvoided / 100 },
      summary: { meanAQI: res.mean, badDays: res.bad, visitsAvoided: res.visitsAvoided },
    };
  },
};

CASES.water = {
  run(c, choice) {
    const res = water(c.waterSources, choice);
    const rows = res.rows.map((r) => {
      const s = c.waterSources.find((x) => x.id === r.id);
      const status = r.closed ? tr('wq.closed') : r.safe ? tr('wq.safe') : tr('wq.unsafe', { what: r.left.map((k) => tr('wq.p.' + k)).join(', ') });
      return `<tr class="${r.closed ? '' : r.safe ? 'ok' : 'bad'}"><td>${tr(s.name)}</td><td>${s.people}</td><td>${r.probs.length ? r.probs.map((k) => tr('wq.p.' + k)).join(', ') : tr('wq.none')}</td><td>${tr('wq.t.' + r.treat)}</td><td><b>${status}</b></td></tr>`;
    }).join('');
    const bars = c.waterSources.map((s) => {
      const r = ratios(s);
      const worst = Object.entries(r).sort((a, b) => b[1] - a[1])[0];
      return { label: tr(s.name), value: +worst[1].toFixed(2), color: worst[1] > 1 ? C.a : C.b };
    });
    // Closing an unsafe source protects people but makes them walk to another source: part credit.
    let credit = 0;
    for (const r of res.rows) {
      const s = c.waterSources.find((x) => x.id === r.id);
      if (r.closed) credit += r.probs.length ? s.people * 0.6 : -s.people;
      else if (r.safe) credit += s.people * (r.treat !== 'none' && !r.probs.length ? 0.8 : 1);
    }
    return {
      charts: [
        `<h3>${tr('wq.chart')}</h3>${barChart(bars, { unit: '×', labelW: 170 })}<p class="small">${tr('wq.chartNote')}</p>`,
        `<table class="pro-table"><thead><tr><th>${tr('wq.source')}</th><th>${tr('wq.people')}</th><th>${tr('wq.problems')}</th><th>${tr('wq.treatment')}</th><th>${tr('wq.result')}</th></tr></thead><tbody>${rows}</tbody></table>`,
      ],
      metrics: [[tr('wq.safePeople'), fmt(res.safePeople), ''], [tr('wq.unsafePeople'), fmt(res.unsafePeople), '']],
      score: clamp01(credit / res.total),
      impact: { kind: 'lives', value: res.safePeople / 100 },
      summary: { safePeople: res.safePeople, unsafePeople: res.unsafePeople },
    };
  },
};

export { AIR_WEEK };
