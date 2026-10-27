// ProfessionalGame.js - Eco Professional: track picker, then the shared case
// runner (nature first -> brief -> data -> decisions -> model -> outcome ->
// debrief -> report). Case words come from content/text/professional/*.json,
// case logic from cases.js. Progress is kept in the profile (cases).
import { addStrings, tr } from '../../app/strings.js';
import { LANGS, getLang, setLang } from '../../i18n.js';
import { progress, saveProgress, starsFor } from '../../app/Profile.js';
import { Mentor } from '../../ai/Mentor.js';
import { CASES } from './cases.js';
import './tracks/cases.js';
import { RESEARCH } from './research/Research.js';
import { track } from '../../app/hooks.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const L = (obj) => (obj && typeof obj === 'object' ? obj[getLang()] || obj.en : obj) || '';
const get = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);

// Extra tracks register here (Research mode adds its own screen instead of cases).
export const TRACK_SCREENS = { research: RESEARCH };

export async function start(profile) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'css/professional.css';
  document.head.appendChild(css);
  const common = await get('content/text/professional/common.json');
  addStrings(common.ui);
  const packs = await Promise.all(common.tracks.map((t) => (t.ready && !t.screen ? get(`content/text/professional/${t.id}.json`) : null)));
  const cases = [];
  packs.forEach((p) => { if (p) { addStrings(p.ui || {}); cases.push(...p.cases); } });
  const game = new ProfessionalGame(profile, common.tracks, cases);
  window.ecosPro = game; // handy for testing from the browser console
  return game;
}

class ProfessionalGame {
  constructor(profile, tracks, cases) {
    this.p = profile;
    this.tracks = tracks;
    this.cases = cases;
    this.pr = progress(profile);
    this.pr.cases = this.pr.cases || {};
    this.mentor = new Mentor('professional');
    if (window.ecosApp && window.ecosApp.llm) window.ecosApp.llm.attach(this.mentor);
    this.root = document.createElement('div');
    this.root.id = 'pro';
    this.root.dataset.tier = 'professional';
    this.root.innerHTML = `<header class="pro-top"><button class="btn" id="proBack"></button><h1 id="proTitle"></h1>
      <span class="pro-impact" id="proImpact"></span><button class="btn" id="proLang"></button></header><main class="pro-main" id="proMain"></main>`;
    document.body.appendChild(this.root);
    this.$ = (id) => this.root.querySelector('#' + id);
    this.$('proBack').onclick = () => this.back();
    this.$('proLang').onclick = () => {
      const keys = Object.keys(LANGS);
      setLang(keys[(keys.indexOf(getLang()) + 1) % keys.length]);
      this.redraw();
    };
    this.view = { name: 'tracks' };
    this.redraw();
  }

  impact() {
    return Math.round(Object.values(this.pr.cases).reduce((s, c) => s + (c.impact || 0), 0));
  }

  top() {
    this.$('proTitle').textContent = tr('pro.title');
    this.$('proBack').textContent = '⬅ ' + (this.view.name === 'tracks' ? tr('shell.back') : tr('pro.back'));
    this.$('proLang').textContent = LANGS[getLang()].label;
    this.$('proImpact').textContent = tr('pro.impactLives', { n: this.impact() });
  }

  back() {
    if (this.view.name === 'case') { this.go({ name: 'track', track: this.view.track }); return; }
    if (this.view.name !== 'tracks') { this.go({ name: 'tracks' }); return; }
    if (window.confirm(tr('shell.backAsk'))) location.reload();
  }

  redraw() {
    this.top();
    const v = this.view;
    if (v.name === 'tracks') this.showTracks();
    else if (v.name === 'track') this.showTrack(v.track);
    else if (v.name === 'case') this.showCase(v.id);
    else if (v.name === 'screen') TRACK_SCREENS[v.track].render(this.$('proMain'), this);
  }

  go(view) { this.view = view; this.choiceFor = null; this.redraw(); window.scrollTo(0, 0); this.root.scrollTop = 0; }

  // ---------- tracks ----------
  showTracks() {
    const main = this.$('proMain');
    main.innerHTML = `<h2>${esc(tr('pro.tracks'))}</h2><div class="pro-tracks">${this.tracks.map((t) => {
      const list = this.cases.filter((c) => c.track === t.id);
      const done = list.filter((c) => (this.pr.cases[c.id] || {}).status === 'done').length;
      const ready = t.ready && (list.length || TRACK_SCREENS[t.id]);
      return `<article class="pro-track ${ready ? '' : 'soon'}"><div class="pro-ico" aria-hidden="true">${t.icon}</div><h3>${esc(L(t.title))}</h3><p>${esc(L(t.text))}</p>
        ${ready ? `${list.length ? `<p class="path-prog">${esc(tr('tier.progress', { d: done, n: list.length }))}</p>` : ''}<button class="btn primary" data-track="${t.id}">${esc(tr('shell.play'))}</button>` : `<p class="path-note">${esc(tr('pro.soon'))}</p>`}</article>`;
    }).join('')}</div>`;
    main.querySelectorAll('[data-track]').forEach((b) => {
      b.onclick = () => this.go(TRACK_SCREENS[b.dataset.track] ? { name: 'screen', track: b.dataset.track } : { name: 'track', track: b.dataset.track });
    });
  }

  showTrack(id) {
    const t = this.tracks.find((x) => x.id === id);
    const list = this.cases.filter((c) => c.track === id);
    const main = this.$('proMain');
    main.innerHTML = `<h2>${t.icon} ${esc(L(t.title))}</h2><p class="lead">${esc(L(t.text))}</p><div class="pro-cases">${list.map((c) => {
      const st = this.pr.cases[c.id];
      return `<article class="pro-case"><h3>${esc(L(c.title))}</h3><p>${esc(L(c.brief)).slice(0, 170)}…</p>
        <p class="path-prog">${st ? `${'★'.repeat(st.stars || 0)}${'☆'.repeat(3 - (st.stars || 0))} · ${esc(tr('pro.best', { s: Math.round((st.best || 0) * 100) }))}` : esc(tr('pro.notDone'))}</p>
        <button class="btn primary" data-case="${c.id}">${esc(tr('pro.open'))}</button></article>`;
    }).join('')}</div>`;
    main.querySelectorAll('[data-case]').forEach((b) => { b.onclick = () => this.go({ name: 'case', track: id, id: b.dataset.case }); });
  }

  // ---------- one case ----------
  decisionsOf(c) {
    if (c.waterSources) {
      return c.waterSources.map((s) => ({ id: s.id, qKey: s.name, options: c.decisionOptions.map((o) => ({ id: o, labelKey: 'wq.t.' + o })) }));
    }
    return c.decisions;
  }

  dataHTML(c) {
    if (c.waterSources) {
      const cols = ['ph', 'turbidity', 'tds', 'fluoride', 'nitrate', 'arsenic', 'ecoli'];
      const lim = { ph: '6.5-8.5', turbidity: '1 (5)', tds: '500 (2000)', fluoride: '1.0 (1.5)', nitrate: '45', arsenic: '0.01', ecoli: '0' };
      return `<div class="pro-scroll"><table class="pro-table"><thead><tr><th>${esc(tr('wq.source'))}</th>${cols.map((k) => `<th>${esc(tr('wq.col.' + k))}</th>`).join('')}</tr></thead><tbody>
        ${c.waterSources.map((s) => `<tr><td>${esc(tr(s.name))} · ${s.people}</td>${cols.map((k) => `<td>${s[k]}</td>`).join('')}</tr>`).join('')}
        <tr class="limit"><td>${esc(tr('wq.limit'))}</td>${cols.map((k) => `<td>${lim[k]}</td>`).join('')}</tr></tbody></table></div>`;
    }
    return `<table class="pro-table kv"><tbody>${(c.data || []).map((d) => `<tr><th>${esc(L(d.label))}</th><td>${esc(L(d.value))}</td></tr>`).join('')}</tbody></table>`;
  }

  showCase(id) {
    const c = this.cases.find((x) => x.id === id);
    const decisions = this.decisionsOf(c);
    // A new case starts fresh; a language change keeps the choices and the result.
    if (this.choiceFor !== id) {
      track('level_start', { tier: 'professional', case: id });
      this.choice = Object.fromEntries(decisions.map((d) => [d.id, d.options[0].id]));
      this.choiceFor = id;
      this.result = null;
    }
    const main = this.$('proMain');
    const optLabel = (o) => (o.labelKey ? tr(o.labelKey) : L(o.label));
    main.innerHTML = `<p class="eyebrow">${esc(L(this.tracks.find((t) => t.id === c.track).title))}</p><h2>${esc(L(c.title))}</h2>
      <section class="pro-sec nature"><h3>🌿 ${esc(tr('pro.nature'))}</h3><p>${esc(L(c.nature))}</p></section>
      <section class="pro-sec"><h3>${esc(tr('pro.brief'))}</h3><p>${esc(L(c.brief))}</p></section>
      <section class="pro-sec"><h3>${esc(tr('pro.data'))}</h3>${this.dataHTML(c)}</section>
      <section class="pro-sec"><h3>${esc(tr('pro.decide'))}</h3>
        ${decisions.map((d) => `<fieldset class="pro-dec"><legend>${esc(d.qKey ? tr(d.qKey) : L(d.q))}</legend>${d.options.map((o) => `<label class="pro-opt"><input type="radio" name="d_${d.id}" value="${o.id}" ${this.choice[d.id] === o.id ? 'checked' : ''}> <span>${esc(optLabel(o))}</span></label>`).join('')}</fieldset>`).join('')}
        <p class="pro-budget" id="proBudget"></p>
        <button class="btn primary" id="proRun">${esc(tr(this.result ? 'pro.again' : 'pro.run'))}</button>
      </section>
      <div id="proOut"></div>`;
    const budget = () => decisions.reduce((s, d) => s + ((d.options.find((o) => o.id === this.choice[d.id]) || {}).cost || 0), 0);
    const showBudget = () => {
      if (!c.budget) { this.$('proBudget').hidden = true; return true; }
      const u = budget();
      const over = u > c.budget;
      this.$('proBudget').textContent = tr('pro.budget', { u, b: c.budget }) + (over ? ' · ' + tr('pro.over') : '');
      this.$('proBudget').classList.toggle('over', over);
      this.$('proRun').disabled = over;
      return !over;
    };
    main.querySelectorAll('input[type=radio]').forEach((r) => { r.onchange = () => { this.choice[r.name.slice(2)] = r.value; showBudget(); }; });
    showBudget();
    this.$('proRun').onclick = () => { if (showBudget()) this.run(c, decisions); };
    if (this.result) this.outcome(c, decisions);
  }

  run(c, decisions) {
    this.result = CASES[c.model].run(c, this.choice);
    track('level_complete', { tier: 'professional', case: c.id, score: Math.round(this.result.score * 100) });
    const st = this.pr.cases[c.id] || {};
    const stars = starsFor(this.result.score);
    this.pr.cases[c.id] = {
      status: this.result.score >= 0.6 || st.status === 'done' ? 'done' : 'tried', track: c.track,
      stars: Math.max(st.stars || 0, this.result.score >= 0.6 ? stars : 0), best: Math.max(st.best || 0, this.result.score),
      impact: Math.max(st.impact || 0, this.result.impact.value || 0), at: new Date().toISOString(),
    };
    saveProgress(this.p);
    this.top();
    this.$('proRun').textContent = tr('pro.again');
    this.outcome(c, decisions);
    this.$('proOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  outcome(c, decisions) {
    const r = this.result;
    const s = Math.round(r.score * 100);
    const stars = r.score >= 0.6 ? starsFor(r.score) : 0;
    const hasBase = r.metrics.some((m) => m[2] !== '');
    this.$('proOut').innerHTML = `<section class="pro-sec out"><h3>${esc(tr('pro.outcome'))}</h3>
      <p class="pro-score">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} <b>${esc(tr('pro.score', { s }))}</b></p>
      <table class="pro-table"><thead><tr><th>${esc(tr('pro.metric'))}</th><th>${esc(tr('pro.planCol'))}</th>${hasBase ? `<th>${esc(tr('pro.baseCol'))}</th>` : ''}</tr></thead>
      <tbody>${r.metrics.map((m) => `<tr><td>${esc(m[0])}</td><td><b>${esc(m[1])}</b></td>${hasBase ? `<td>${esc(m[2])}</td>` : ''}</tr>`).join('')}</tbody></table>
      ${r.charts.map((h) => `<div class="pro-chart">${h}</div>`).join('')}</section>
      <section class="pro-sec"><h3>${esc(tr('pro.debrief'))}</h3><p>${esc(L(c.debrief))}</p>
      <h4>${esc(tr('pro.sources'))}</h4><ul class="pro-src">${c.sources.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
      ${c.concepts && c.concepts.length ? `<section class="pro-sec"><h3>${esc(tr('pro.ask'))}</h3><div class="t-topics" id="proConcepts"></div><div id="proAnswer"></div></section>` : ''}
      <div class="sheet-actions"><button class="btn primary" id="proReport">${esc(tr('pro.report'))}</button><button class="btn" id="proPrint">${esc(tr('pro.print'))}</button></div>`;
    this.$('proReport').onclick = () => this.download(c, decisions);
    this.$('proPrint').onclick = () => { const w = window.open(URL.createObjectURL(new Blob([this.report(c, decisions)], { type: 'text/html' })), '_blank'); if (w) setTimeout(() => { try { w.print(); } catch (e) { /* user prints */ } }, 800); };
    if (c.concepts && c.concepts.length) {
      this.mentor.topics().then((all) => {
        const box = this.$('proConcepts');
        if (!box) return;
        box.innerHTML = all.filter((t) => c.concepts.includes(t.id)).map((t) => `<button class="tab" data-c="${t.id}">${esc(t.title)}</button>`).join('');
        box.querySelectorAll('[data-c]').forEach((b) => {
          b.onclick = async () => {
            const a = await this.mentor.ask({ conceptId: b.dataset.c });
            this.$('proAnswer').innerHTML = `<article class="t-card"><h4>${esc(a.title)}</h4><p>${esc(a.answer)}</p><p class="small">${esc(tr('pro.sources'))}: ${esc(a.source)} · ${esc(tr('pro.assistantNote'))}</p></article>`;
          };
        });
      });
    }
  }

  report(c, decisions) {
    const r = this.result;
    const optLabel = (o) => (o.labelKey ? tr(o.labelKey) : L(o.label));
    const rows = decisions.map((d) => `<tr><th>${esc(d.qKey ? tr(d.qKey) : L(d.q))}</th><td>${esc(optLabel(d.options.find((o) => o.id === this.choice[d.id])))}</td></tr>`).join('');
    const charts = r.charts.join('').replace(/var\(--[a-z-]+\)/g, (v) => ({ 'var(--pink)': '#c2415d', 'var(--green)': '#3f8f2f', 'var(--cyan)': '#1f8a96', 'var(--amber)': '#b7791f', 'var(--violet)': '#6b4fb8', 'var(--muted)': '#777', 'var(--line)': '#ccc' }[v] || '#555'));
    return `<!doctype html><html lang="${getLang()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(L(c.title))}</title>
      <style>body{font:15px/1.5 "Noto Sans","Noto Sans Devanagari","Noto Sans Bengali",system-ui,sans-serif;color:#1d2a2e;background:#fff;max-width:820px;margin:24px auto;padding:0 16px}
      h1{font-size:24px;margin:0 0 4px}h2{font-size:17px;margin:22px 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px}table{border-collapse:collapse;width:100%;margin:6px 0}
      th,td{border:1px solid #ddd;padding:5px 8px;text-align:left;vertical-align:top}svg{max-width:100%;height:auto}svg text{font:11px monospace;fill:#555}.legend{font:12px monospace;color:#555}.legend i{display:inline-block;width:12px;height:3px;margin:0 5px 0 10px;vertical-align:middle;background:var(--c)}
      .meta{color:#555}@media print{body{margin:0}}</style></head><body>
      <h1>${esc(tr('pro.reportTitle'))}: ${esc(L(c.title))}</h1>
      <p class="meta">${esc(tr('pro.player'))}: ${esc(this.p.name)} · ${esc(tr('pro.date'))}: ${new Date().toLocaleDateString()} · Ecos-Synthetica, ${esc(tr('pro.title'))}</p>
      <h2>${esc(tr('pro.nature'))}</h2><p>${esc(L(c.nature))}</p>
      <h2>${esc(tr('pro.brief'))}</h2><p>${esc(L(c.brief))}</p>
      <h2>${esc(tr('pro.choices'))}</h2><table>${rows}</table>
      <h2>${esc(tr('pro.results'))}: ${esc(tr('pro.score', { s: Math.round(r.score * 100) }))}</h2>
      <table>${r.metrics.map((m) => `<tr><th>${esc(m[0])}</th><td>${esc(m[1])}</td><td>${esc(m[2])}</td></tr>`).join('')}</table>${charts}
      <h2>${esc(tr('pro.debrief'))}</h2><p>${esc(L(c.debrief))}</p>
      <h2>${esc(tr('pro.sources'))}</h2><ul>${c.sources.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></body></html>`;
  }

  download(c, decisions) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([this.report(c, decisions)], { type: 'text/html;charset=utf-8' }));
    a.download = `ecos-case-${c.id}-${(this.p.name || 'player').replace(/\W+/g, '_')}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
}
