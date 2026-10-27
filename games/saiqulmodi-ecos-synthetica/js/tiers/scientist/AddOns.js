// AddOns.js - Eco Scientist additions to the original game: the live
// dashboard, the Scientist's desk (dashboard, 4 experiments, observation
// journal, offline AI Teacher). The original game code is not changed; this
// module reads the game state and adds its own buttons and panels.
import { addStrings, tr } from '../../app/strings.js';
import { progress, saveProgress } from '../../app/Profile.js';
import { lineChart, legend } from '../../charts/svg.js';
import { logistic, lotkaVolterra, peaks, carbon, nitrogen } from './models.js';
import { Mentor } from '../../ai/Mentor.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (id) => document.getElementById(id);
const C = { int: 'var(--green)', atp: 'var(--amber)', bal: 'var(--cyan)', pink: 'var(--pink)', violet: 'var(--violet)', fg: 'var(--muted)' };
const MAX = 300; // dashboard keeps the last 5 minutes

export async function mount(game, ui, profile) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'css/scientist.css';
  document.head.appendChild(css);
  const pack = await fetch('content/text/scientist.json').then((r) => r.json());
  addStrings(pack.ui);
  const desk = new Desk(game, ui, profile, pack.sources);
  window.ecosDesk = desk; // handy for testing from the browser console
  return desk;
}

// Experiment definitions: inputs, model run, chart and textbook check.
const EXPERIMENTS = {
  pop: {
    inputs: [['r', 0.1, 1.5, 0.05, 0.5], ['K', 200, 2000, 50, 1000], ['N0', 2, 100, 1, 10]],
    run(v) {
      const res = logistic({ r: v.r, K: v.K, N0: v.N0, years: 30 });
      const series = [
        { name: tr('exp.logistic'), color: C.int, points: res.pts.map((p) => [p[0], p[1]]) },
        { name: tr('exp.exponential'), color: C.pink, dash: true, points: res.pts.filter((p) => p[2] <= v.K * 1.5).map((p) => [p[0], p[2]]) },
      ];
      const end = res.pts[res.pts.length - 1][1];
      return {
        series, opts: { xLabel: tr('exp.years'), yLabel: tr('exp.individuals'), yMax: v.K * 1.5, marks: [{ y: v.K, label: 'K', color: C.int }, { y: v.K / 2, label: 'K/2', color: C.fg }] },
        check: tr('exp.popCheck', { K: v.K, end: Math.round(end), th: res.tHalf.toFixed(1), rate: Math.round(res.maxRate) }),
        data: { end: Math.round(end), tHalf: +res.tHalf.toFixed(2) },
      };
    },
  },
  lv: {
    inputs: [['a', 0.2, 1.2, 0.05, 0.6], ['b', 0.01, 0.05, 0.001, 0.025], ['c', 0.1, 0.8, 0.05, 0.4], ['d', 0.2, 1.0, 0.05, 0.5], ['H0', 5, 150, 1, 40], ['P0', 2, 60, 1, 9]],
    run(v) {
      const res = lotkaVolterra({ ...v, years: 60 });
      const hp = peaks(res.pts, 1);
      const measured = hp.length > 1 ? (hp[hp.length - 1] - hp[0]) / (hp.length - 1) : NaN;
      return {
        series: [
          { name: tr('exp.prey'), color: C.int, points: res.pts.map((p) => [p[0], p[1]]) },
          { name: tr('exp.pred'), color: C.pink, points: res.pts.map((p) => [p[0], p[2]]) },
        ],
        opts: { xLabel: tr('exp.years'), yLabel: tr('exp.individuals') },
        check: tr('exp.lvCheck', { H: res.Heq.toFixed(0), P: res.Peq.toFixed(0), m: isFinite(measured) ? measured.toFixed(1) : '-', p: res.period.toFixed(1) }),
        data: { Heq: +res.Heq.toFixed(1), Peq: +res.Peq.toFixed(1), period: +measured.toFixed(2) },
      };
    },
  },
  carbon: {
    inputs: [['growth', -8, 3, 0.5, 0], ['forest', 0, 2, 0.1, 1.1]],
    run(v) {
      const res = carbon({ growth: v.growth, forestLoss: v.forest, years: 50 });
      const at = (y) => res.pts.find((p) => p[0] === y)[1];
      return {
        series: [{ name: tr('exp.ppm'), color: C.atp, points: res.pts.map((p) => [p[0], p[1]]) }],
        opts: { xLabel: '', yLabel: tr('exp.ppm'), yMin: 380, marks: [{ y: 421, label: '2023: 421', color: C.fg }] },
        extra: {
          series: [
            { name: tr('exp.emit'), color: C.pink, points: res.pts.map((p) => [p[0], p[2]]) },
            { name: tr('exp.sinks'), color: C.int, points: res.pts.map((p) => [p[0], p[3] + p[4]]) },
          ], opts: { yLabel: 'GtC/yr', h: 180 },
        },
        check: tr('exp.carbonCheck', { y50: at(2050).toFixed(0), y73: at(2073).toFixed(0), af0: ((1 - (res.pts[0][3] + res.pts[0][4]) / res.pts[0][2]) * 100).toFixed(0), af: (res.airborne * 100).toFixed(0) }),
        data: { ppm2050: +at(2050).toFixed(1), ppm2073: +at(2073).toFixed(1), airborne: +(res.airborne * 100).toFixed(1) },
      };
    },
  },
  n: {
    inputs: [['legume', 0, 1, 1, 0, 'check'], ['fert', 0, 200, 10, 0], ['wet', 0, 1, 1, 0, 'check']],
    run(v) {
      const res = nitrogen({ legume: !!v.legume, fertiliser: v.fert, waterlogged: !!v.wet });
      return {
        series: [
          { name: tr('exp.nh4'), color: C.atp, points: res.pts.map((p) => [p[0], p[1]]) },
          { name: tr('exp.no3'), color: C.bal, points: res.pts.map((p) => [p[0], p[2]]) },
        ],
        opts: { xLabel: tr('exp.days'), yLabel: 'kg N/ha' },
        check: tr('exp.nCheck', { fx: res.fixed.toFixed(0), up: res.uptake.toFixed(0), lost: res.lost.toFixed(0) }),
        data: { fixed: +res.fixed.toFixed(1), uptake: +res.uptake.toFixed(1), lost: +res.lost.toFixed(1) },
      };
    },
  },
};
const LABEL = { r: 'exp.r', K: 'exp.K', N0: 'exp.N0', a: 'exp.a', b: 'exp.b', c: 'exp.c', d: 'exp.d', H0: 'exp.H0', P0: 'exp.P0', growth: 'exp.growth', forest: 'exp.forest', legume: 'exp.legume', fert: 'exp.fert', wet: 'exp.wet' };

class Desk {
  constructor(game, ui, profile, sources) {
    this.game = game;
    this.ui = ui;
    this.p = profile;
    this.sources = sources;
    this.samples = [];
    this.t0 = performance.now();
    this.tab = 'data';
    this.exp = 'pop';
    this.vals = {};
    for (const [k, e] of Object.entries(EXPERIMENTS)) this.vals[k] = Object.fromEntries(e.inputs.map((i) => [i[0], i[4]]));
    this.mentor = new Mentor('scientist');
    if (window.ecosApp && window.ecosApp.llm) window.ecosApp.llm.attach(this.mentor);
    this.build();
    setInterval(() => this.sample(), 1000);
  }

  build() {
    const act = document.createElement('button');
    act.id = 'btnDesk';
    act.className = 'act';
    act.title = tr('sc.deskTitle');
    $('actions').prepend(act);
    act.onclick = () => this.open();
    this.act = act;

    const live = document.createElement('button');
    live.id = 'btnLive';
    live.className = 'mini-btn';
    $('hudRight').appendChild(live);
    live.onclick = () => { this.liveOn = !this.liveOn; this.renderLive(); this.labels(); };
    this.liveBtn = live;

    this.livePanel = document.createElement('div');
    this.livePanel.id = 'livePanel';
    this.livePanel.className = 'hud-box';
    this.livePanel.hidden = true;
    $('hud').appendChild(this.livePanel);

    const sec = document.createElement('section');
    sec.id = 'desk';
    sec.className = 'modal';
    sec.hidden = true;
    sec.innerHTML = `<div class="panel"><header><h2 id="deskTitle"></h2><button class="x" id="deskClose"></button></header>
      <div class="desk-tabs" id="deskTabs"></div><div class="scroll" id="deskBody"></div></div>`;
    document.body.appendChild(sec);
    $('deskClose').onclick = () => this.ui.close('desk');
    sec.addEventListener('click', (e) => { if (e.target === sec) this.ui.close('desk'); });
    this.labels();
    // Language changes in the game re-label the desk.
    $('btnLang').addEventListener('click', () => setTimeout(() => this.labels(true), 0));
    $('langPick').addEventListener('click', () => setTimeout(() => this.labels(true), 0));
  }

  labels(redraw = false) {
    this.act.textContent = tr('sc.desk');
    this.liveBtn.textContent = tr(this.liveOn ? 'sc.liveHide' : 'sc.live');
    $('deskTitle').textContent = tr('sc.deskTitle');
    $('deskClose').textContent = tr('common.close');
    if (redraw && !$('desk').hidden) this.render();
    if (redraw) this.renderLive();
  }

  // ---------- dashboard ----------
  sample() {
    const g = this.game;
    if (!g.player || g.pauseReasons.has('start') || g.over) return;
    if (g.paused) return; // nothing changes while a panel is open
    let threats = 0, partners = 0, contained = 0;
    for (const e of g.entities) {
      if (e.state === 'contained') contained++;
      else if (e.state === 'ally') partners++;
      else if (g.isHostile(e.org)) threats++;
    }
    const t = Math.round((performance.now() - this.t0) / 1000);
    this.samples.push({ t, form: g.tier, int: g.integrity, atp: g.energy, bal: g.balance, hum: g.env.hum, temp: g.env.temp, nut: g.env.nut, threats, partners, contained });
    if (this.samples.length > MAX) this.samples.shift();
    if (this.liveOn) this.renderLive();
  }

  meterSeries(list = this.samples) {
    return [
      { name: tr('sc.integrity'), color: C.int, points: list.map((s) => [s.t, s.int]) },
      { name: tr('sc.energy'), color: C.atp, points: list.map((s) => [s.t, s.atp]) },
      { name: tr('sc.balance'), color: C.bal, points: list.map((s) => [s.t, s.bal]) },
    ];
  }

  renderLive() {
    this.livePanel.hidden = !this.liveOn;
    if (!this.liveOn) return;
    const last = this.samples.slice(-60);
    if (last.length < 2) { this.livePanel.innerHTML = `<p class="small">${esc(tr('sc.dataEmpty'))}</p>`; return; }
    const s = this.meterSeries(last);
    this.livePanel.innerHTML = legend(s) + lineChart(s, { w: 320, h: 130, yMin: 0, yMax: 100 });
  }

  dataTab() {
    if (this.samples.length < 2) return `<p class="lead">${esc(tr('sc.dataLead'))}</p><p>${esc(tr('sc.dataEmpty'))}</p>`;
    const S = this.samples;
    const m = this.meterSeries();
    const env = [
      { name: tr('sc.hum'), color: C.bal, points: S.map((s) => [s.t, s.hum]) },
      { name: tr('sc.temp'), color: C.pink, points: S.map((s) => [s.t, s.temp]) },
      { name: tr('sc.nut'), color: C.int, points: S.map((s) => [s.t, s.nut]) },
    ];
    const pop = [
      { name: tr('sc.threats'), color: C.pink, points: S.map((s) => [s.t, s.threats]) },
      { name: tr('sc.partners'), color: C.int, points: S.map((s) => [s.t, s.partners]) },
      { name: tr('sc.contained'), color: C.violet, points: S.map((s) => [s.t, s.contained]) },
    ];
    return `<p class="lead">${esc(tr('sc.dataLead'))}</p>
      <h3>${esc(tr('sc.meters'))}</h3>${legend(m)}${lineChart(m, { yMin: 0, yMax: 100, xLabel: tr('sc.seconds') })}
      <h3>${esc(tr('sc.envChart'))}</h3>${legend(env)}${lineChart(env, { yMin: 0, xLabel: tr('sc.seconds') })}
      <h3>${esc(tr('sc.popChart'))}</h3>${legend(pop)}${lineChart(pop, { yMin: 0, xLabel: tr('sc.seconds') })}
      <div class="sheet-actions"><button class="btn" id="deskSnap">${esc(tr('sc.snapshot'))}</button></div>`;
  }

  // ---------- experiments ----------
  expTab() {
    const e = EXPERIMENTS[this.exp];
    const v = this.vals[this.exp];
    const res = e.run(v);
    this.lastRun = res;
    const inputs = e.inputs.map(([k, lo, hi, step, , kind]) => kind === 'check'
      ? `<label class="exp-check"><input type="checkbox" data-k="${k}" ${v[k] ? 'checked' : ''}> ${esc(tr(LABEL[k]))}</label>`
      : `<label class="exp-in"><span>${esc(tr(LABEL[k]))} <b>${v[k]}</b></span><input type="range" min="${lo}" max="${hi}" step="${step}" value="${v[k]}" data-k="${k}"></label>`).join('');
    return `<p class="lead">${esc(tr('sc.expLead'))}</p>
      <div class="desk-tabs sub">${Object.keys(EXPERIMENTS).map((k) => `<button class="tab ${k === this.exp ? 'on' : ''}" data-exp="${k}">${esc(tr('exp.' + k))}</button>`).join('')}</div>
      <p>${esc(tr('exp.' + this.exp + 'Lead'))}</p>
      <div class="exp-grid"><div class="exp-inputs">${inputs}</div>
      <div class="exp-chart" id="expChart">${this.chartHTML(res)}</div></div>
      <p class="exp-checkline" id="expCheck"><b>${esc(tr('sc.check'))}:</b> ${esc(res.check)}</p>
      <p class="small">${esc(tr('sc.source'))}: ${esc(this.sources[this.exp])}</p>
      <div class="sheet-actions"><button class="btn primary" id="expSave">${esc(tr('sc.saveJ'))}</button></div>`;
  }

  chartHTML(res) {
    return legend(res.series) + lineChart(res.series, res.opts) + (res.extra ? legend(res.extra.series) + lineChart(res.extra.series, res.extra.opts) : '');
  }

  // ---------- journal ----------
  journal() { const pr = progress(this.p); pr.journal = pr.journal || []; return pr.journal; }

  addEntry(entry) {
    this.journal().unshift({ id: Date.now().toString(36), at: new Date().toISOString(), ...entry });
    saveProgress(this.p);
    this.ui.toast(tr('sc.saved'), 'good');
  }

  journalTab() {
    const list = this.journal();
    return `<p class="lead">${esc(tr('sc.jLead'))}</p>
      <textarea class="field j-note" id="jNote" rows="3" placeholder="${esc(tr('sc.jNote'))}"></textarea>
      <div class="sheet-actions"><button class="btn primary" id="jAdd">${esc(tr('sc.jAdd'))}</button>${list.length ? `<button class="btn" id="jExport">${esc(tr('sc.jExport'))}</button>` : ''}</div>
      ${list.length ? list.map((j) => `<article class="j-entry"><header><b>${esc(j.title || '')}</b><i>${esc(new Date(j.at).toLocaleString())}</i><button class="mini-btn" data-jdel="${j.id}">${esc(tr('sc.jDel'))}</button></header>
        ${j.text ? `<p>${esc(j.text)}</p>` : ''}${j.data ? `<p class="small mono">${esc(Object.entries(j.data).map(([k, v]) => `${k}: ${v}`).join(' · '))}</p>` : ''}</article>`).join('') : `<p>${esc(tr('sc.jEmpty'))}</p>`}`;
  }

  exportJournal() {
    const text = this.journal().map((j) => `${j.at}\n${j.title || ''}\n${j.text || ''}\n${j.data ? JSON.stringify(j.data) : ''}\n`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    a.download = `ecos-journal-${(this.p.name || 'player').replace(/\W+/g, '_')}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ---------- AI Teacher ----------
  teacherTab() {
    return `<p class="lead">${esc(tr('sc.tLead'))}</p>
      <form class="t-ask" id="tForm"><input class="field" id="tQ" autocomplete="off" placeholder="${esc(tr('sc.tPh'))}"><button class="btn primary" type="submit">${esc(tr('sc.tAsk'))}</button></form>
      <div id="tAnswer"></div>
      <p class="eyebrow">${esc(tr('sc.tTopics'))}</p><div class="t-topics" id="tTopics"></div>`;
  }

  async answer(q) {
    const box = $('tAnswer');
    const r = await this.mentor.ask(q);
    if (!r.answer) {
      box.innerHTML = `<p>${esc(tr('sc.tNone'))}</p>`;
      return;
    }
    box.innerHTML = `<article class="t-card"><h3>${esc(r.title)}</h3><p>${esc(r.answer)}</p>
      ${r.live ? `<p class="small">${esc(tr('sc.tLive'))}</p>` : ''}${r.source ? `<p class="small">${esc(tr('sc.source'))}: ${esc(r.source)}</p>` : ''}
      ${this.ui.speech.ok ? `<button class="mini-btn" id="tRead">${esc(tr('sc.read'))}</button>` : ''}</article>`;
    if ($('tRead')) $('tRead').onclick = () => this.ui.speech.speak([r.answer]);
  }

  // ---------- panel ----------
  open(tab) {
    if (tab) this.tab = tab;
    this.ui.open('desk');
    this.render();
  }

  render() {
    const tabs = [['data', 'sc.tabData'], ['exp', 'sc.tabExp'], ['journal', 'sc.tabJournal'], ['teacher', 'sc.tabTeacher']];
    $('deskTabs').innerHTML = tabs.map(([k, l]) => `<button class="tab ${k === this.tab ? 'on' : ''}" data-tab="${k}">${esc(tr(l))}</button>`).join('');
    $('deskTabs').querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { this.ui.speech.stop(); this.tab = b.dataset.tab; this.render(); }; });
    const body = $('deskBody');
    body.innerHTML = this.tab === 'data' ? this.dataTab() : this.tab === 'exp' ? this.expTab() : this.tab === 'journal' ? this.journalTab() : this.teacherTab();
    if (this.tab === 'data' && $('deskSnap')) {
      $('deskSnap').onclick = () => {
        const s = this.samples[this.samples.length - 1];
        this.addEntry({ title: `${tr('sc.tabData')}`, data: { form: s.form + 1, integrity: Math.round(s.int), energy: Math.round(s.atp), balance: Math.round(s.bal), humidity: Math.round(s.hum), temp: Math.round(s.temp), threats: s.threats, partners: s.partners } });
      };
    }
    if (this.tab === 'exp') {
      body.querySelectorAll('[data-exp]').forEach((b) => { b.onclick = () => { this.exp = b.dataset.exp; this.render(); }; });
      body.querySelectorAll('[data-k]').forEach((inp) => {
        inp.oninput = () => {
          const v = this.vals[this.exp];
          v[inp.dataset.k] = inp.type === 'checkbox' ? (inp.checked ? 1 : 0) : Number(inp.value);
          if (inp.type === 'range') inp.previousElementSibling.querySelector('b').textContent = inp.value;
          const res = EXPERIMENTS[this.exp].run(v);
          this.lastRun = res;
          $('expChart').innerHTML = this.chartHTML(res);
          $('expCheck').innerHTML = `<b>${esc(tr('sc.check'))}:</b> ${esc(res.check)}`;
        };
      });
      $('expSave').onclick = () => this.addEntry({ title: tr('exp.' + this.exp), activityId: 'exp_' + this.exp, text: this.lastRun.check, data: { ...this.vals[this.exp], ...this.lastRun.data } });
    }
    if (this.tab === 'journal') {
      $('jAdd').onclick = () => { const t = $('jNote').value.trim(); if (!t) return; this.addEntry({ title: tr('sc.jAdd'), text: t.slice(0, 2000) }); this.render(); };
      if ($('jExport')) $('jExport').onclick = () => this.exportJournal();
      body.querySelectorAll('[data-jdel]').forEach((b) => {
        b.onclick = () => { const pr = progress(this.p); pr.journal = pr.journal.filter((j) => j.id !== b.dataset.jdel); saveProgress(this.p); this.render(); };
      });
    }
    if (this.tab === 'teacher') {
      $('tForm').onsubmit = (e) => { e.preventDefault(); const q = $('tQ').value.trim(); if (q) this.answer({ text: q }); };
      this.mentor.topics().then((list) => {
        if (!$('tTopics')) return;
        $('tTopics').innerHTML = list.map((c) => `<button class="tab" data-c="${c.id}">${esc(c.title)}</button>`).join('');
        $('tTopics').querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => this.answer({ conceptId: b.dataset.c }); });
      });
    }
  }
}

export { EXPERIMENTS };
