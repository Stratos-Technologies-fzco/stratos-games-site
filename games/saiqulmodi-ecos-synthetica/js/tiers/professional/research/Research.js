// Research.js - Research mode inside Eco Professional: published datasets,
// open regression forecasts with uncertainty, "reproduce a published result"
// tasks, biodiversity indices and a map (online tiles only, never stored).
import { addStrings, tr } from '../../../app/strings.js';
import { getLang } from '../../../i18n.js';
import { saveProgress } from '../../../app/Profile.js';
import { lineChart, legend } from '../../../charts/svg.js';
import { parseCSV, toCSV, linreg, expfit, diversity } from './stats.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const L = (o) => (o && typeof o === 'object' ? o[getLang()] || o.en : o) || '';
const num = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : (+v).toFixed(d));

function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const VIEWS = { data: 'viewData', model: 'viewModel', repro: 'viewRepro', div: 'viewDiv', map: 'viewMap' };

export const RESEARCH = {
  pack: null, data: {}, tab: 'data', ds: 'tigers', kind: 'exp', year: 2030, plots: null,

  async load() {
    if (this.pack) return;
    this.pack = await fetch('content/text/professional/research.json').then((r) => r.json());
    addStrings(this.pack.ui);
    await Promise.all(this.pack.datasets.map(async (d) => { this.data[d.id] = parseCSV(await fetch('content/datasets/' + d.file).then((r) => r.text())); }));
    this.plots = this.pack.plots.map((p) => ({ ...p, counts: p.counts.map((c) => [...c]) }));
  },

  async render(main, game) {
    this.game = game;
    main.innerHTML = '<p>…</p>';
    await this.load();
    const tabs = [['data', 'rs.tabData'], ['model', 'rs.tabModel'], ['repro', 'rs.tabRepro'], ['div', 'rs.tabDiv'], ['map', 'rs.tabMap']];
    main.innerHTML = `<h2>🔭 ${esc(tr('rs.title'))}</h2><p class="lead">${esc(tr('rs.lead'))}</p>
      <div class="t-topics rs-tabs">${tabs.map(([k, l]) => `<button class="tab ${k === this.tab ? 'on' : ''}" data-rt="${k}">${esc(tr(l))}</button>`).join('')}</div>
      <div id="rsBody"></div>`;
    main.querySelectorAll('[data-rt]').forEach((b) => { b.onclick = () => { this.tab = b.dataset.rt; this.render(main, game); }; });
    const body = main.querySelector('#rsBody');
    this[VIEWS[this.tab]](body);
  },

  meta(id) { return this.pack.datasets.find((d) => d.id === id); },
  points(id) { const m = this.meta(id); return this.data[id].rows.map((r) => [r[m.x], r[m.y]]); },

  dsPicker() {
    return `<label class="rs-field">${esc(tr('rs.dataset'))} <select id="rsDs">${this.pack.datasets.map((d) => `<option value="${d.id}" ${d.id === this.ds ? 'selected' : ''}>${esc(L(d.title))}</option>`).join('')}</select></label>`;
  },

  // ---------- datasets ----------
  viewData(body) {
    const m = this.meta(this.ds);
    const { head, rows } = this.data[this.ds];
    const series = [{ name: L(m.title), color: 'var(--cyan)', points: this.points(this.ds), band: m.lo ? rows.map((r) => [r[m.x], r[m.lo], r[m.hi]]) : undefined }];
    body.innerHTML = `<section class="pro-sec">${this.dsPicker()}
      <h3>${esc(L(m.title))}</h3>${lineChart(series, { xLabel: m.x, yMin: 0 })}
      <div class="pro-scroll"><table class="pro-table"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${head.map((h) => `<td>${esc(r[h])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="small">${esc(tr('rs.source'))}: ${esc(m.source)} · ${esc(tr('rs.licence'))}: ${esc(m.licence)} · ${esc(tr('rs.rows', { n: rows.length }))}</p>
      <button class="btn" id="rsDl">${esc(tr('rs.download'))}</button></section>`;
    body.querySelector('#rsDs').onchange = (e) => { this.ds = e.target.value; this.viewData(body); };
    body.querySelector('#rsDl').onclick = () => download(m.file, toCSV(head, rows));
  },

  // ---------- model run ----------
  fit() {
    const pts = this.points(this.ds);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return this.kind === 'lin' ? { kind: 'lin', f: linreg(xs, ys), xs, ys } : { kind: 'exp', f: expfit(xs, ys), xs, ys };
  },

  viewModel(body) {
    const m = this.meta(this.ds);
    const { kind, f, xs } = this.fit();
    const last = Math.max(...xs), first = Math.min(...xs);
    this.year = Math.min(Math.max(this.year, last + 1), last + 15);
    const line = [], band = [];
    for (let x = first; x <= this.year + 1e-9; x += (this.year - first) / 60) {
      const p = f.predict(x);
      line.push([x, p.y]);
      band.push([x, p.lo, p.hi]);
    }
    const p = f.predict(this.year);
    const series = [
      { name: tr('rs.data'), color: 'var(--pink)', scatter: true, points: this.points(this.ds) },
      { name: tr('rs.fitted'), color: 'var(--cyan)', points: line, band },
    ];
    const eq = kind === 'lin'
      ? tr('rs.eqLin', { a: num(f.a, 2), b: num(f.b, 3), r2: f.r2.toFixed(3) })
      : tr('rs.eqExp', { rate: (f.rate * 100).toFixed(2), dbl: f.doubling.toFixed(1), r2: f.r2.toFixed(3) });
    body.innerHTML = `<section class="pro-sec">${this.dsPicker()}
      <label class="rs-field">${esc(tr('rs.model'))} <select id="rsModel"><option value="lin" ${kind === 'lin' ? 'selected' : ''}>${esc(tr('rs.linear'))}</option><option value="exp" ${kind === 'exp' ? 'selected' : ''}>${esc(tr('rs.exp'))}</option></select></label>
      <label class="rs-field">${esc(tr('rs.forecast'))} <b id="rsYearV">${this.year}</b><input type="range" id="rsYear" min="${last + 1}" max="${last + 15}" value="${this.year}"></label>
      ${legend(series)}<p class="small">${esc(tr('rs.band'))}</p>${lineChart(series, { xLabel: m.x, yMin: 0 })}
      <p class="mono"><b>${esc(eq)}</b></p>
      <p class="exp-checkline">${esc(tr('rs.pred', { year: this.year, y: num(p.y), lo: num(p.lo), hi: num(p.hi) }))}</p>
      <p class="small">${esc(tr('rs.aiNote'))}</p>
      <button class="btn" id="rsDlFit">${esc(tr('rs.downloadFit'))}</button></section>`;
    body.querySelector('#rsDs').onchange = (e) => { this.ds = e.target.value; this.viewModel(body); };
    body.querySelector('#rsModel').onchange = (e) => { this.kind = e.target.value; this.viewModel(body); };
    const yr = body.querySelector('#rsYear');
    yr.oninput = () => { this.year = Number(yr.value); this.viewModel(body); };
    body.querySelector('#rsDlFit').onclick = () => {
      const rows = [];
      for (let x = first; x <= this.year; x++) { const q = f.predict(x); const obs = this.points(this.ds).find((pt) => pt[0] === x); rows.push({ year: x, observed: obs ? obs[1] : '', fitted: +q.y.toFixed(3), lower95: +q.lo.toFixed(3), upper95: +q.hi.toFixed(3) }); }
      download(`ecos-${this.ds}-${kind}-forecast.csv`, `# ${eq}\n` + toCSV(['year', 'observed', 'fitted', 'lower95', 'upper95'], rows));
    };
  },

  // ---------- reproduce a published result ----------
  viewRepro(body) {
    const pr = this.game.pr;
    body.innerHTML = `<p class="lead">${esc(tr('rs.reproLead'))}</p>${this.pack.tasks.map((t) => {
      const m = this.meta(t.dataset);
      const done = (pr.cases['research_' + t.id] || {}).status === 'done';
      return `<section class="pro-sec"><p class="eyebrow">${esc(L(m.title))}</p><h3>${esc(L(t.q))}</h3>
        <div class="row-in"><label class="rs-field">${esc(tr('rs.answer'))} <input class="field" id="ans_${t.id}" inputmode="decimal" style="width:110px"> ${esc(t.unit)}</label>
        <button class="btn primary" data-check="${t.id}">${esc(tr('rs.check'))}</button>${done ? ` <b class="ok">✓ ${esc(tr('rs.done'))}</b>` : ''}</div>
        <p id="msg_${t.id}"></p><p class="small">${esc(tr('rs.source'))}: ${esc(m.source)}</p></section>`;
    }).join('')}`;
    body.querySelectorAll('[data-check]').forEach((b) => {
      b.onclick = () => {
        const t = this.pack.tasks.find((x) => x.id === b.dataset.check);
        const v = Number(String(body.querySelector('#ans_' + t.id).value).replace(',', '.').replace('%', ''));
        const ok = isFinite(v) && Math.abs(v - t.answer) <= t.tol;
        body.querySelector('#msg_' + t.id).textContent = ok ? tr('rs.right', { pub: L(t.pub) }) : tr('rs.wrong', { hint: L(t.hint) });
        if (ok) {
          pr.cases['research_' + t.id] = { status: 'done', track: 'research', stars: 3, best: 1, impact: 5, at: new Date().toISOString() };
          saveProgress(this.game.p);
          this.game.top();
        }
      };
    });
  },

  // ---------- biodiversity ----------
  viewDiv(body) {
    body.innerHTML = `<p class="lead">${esc(tr('rs.divLead'))}</p><div class="rs-plots">${this.plots.map((p, pi) => {
      const d = diversity(p.counts.map((c) => c[1]));
      return `<section class="pro-sec"><h3>${esc(L(p.title))}</h3>
        <table class="pro-table"><thead><tr><th>${esc(tr('rs.species'))}</th><th>${esc(tr('rs.count'))}</th></tr></thead><tbody>
        ${p.counts.map((c, ci) => `<tr><td><i>${esc(c[0])}</i></td><td><input class="field rs-count" type="number" min="0" value="${c[1]}" data-p="${pi}" data-c="${ci}"></td></tr>`).join('')}</tbody></table>
        <table class="pro-table kv"><tbody>
          <tr><th>${esc(tr('rs.total'))}</th><td>${d.N}</td></tr><tr><th>${esc(tr('rs.richness'))}</th><td>${d.S}</td></tr>
          <tr><th>${esc(tr('rs.shannon'))}</th><td><b>${d.shannon.toFixed(3)}</b></td></tr><tr><th>${esc(tr('rs.simpson'))}</th><td><b>${d.simpson.toFixed(3)}</b></td></tr>
          <tr><th>${esc(tr('rs.evenness'))}</th><td>${d.evenness.toFixed(3)}</td></tr></tbody></table></section>`;
    }).join('')}</div><p class="small">${esc(tr('rs.divNote'))}</p>
    <button class="btn" id="rsDlDiv">${esc(tr('rs.download'))}</button>`;
    body.querySelectorAll('.rs-count').forEach((inp) => {
      inp.onchange = () => { this.plots[inp.dataset.p].counts[inp.dataset.c][1] = Math.max(0, Math.round(Number(inp.value) || 0)); this.viewDiv(body); };
    });
    body.querySelector('#rsDlDiv').onclick = () => {
      const rows = this.plots.flatMap((p) => p.counts.map((c) => ({ plot: p.id, species: c[0], count: c[1] })));
      const idx = this.plots.map((p) => { const d = diversity(p.counts.map((c) => c[1])); return { plot: p.id, species: 'INDEX', count: `S=${d.S}; H=${d.shannon.toFixed(3)}; Simpson=${d.simpson.toFixed(3)}; J=${d.evenness.toFixed(3)}` }; });
      download('ecos-biodiversity-plots.csv', toCSV(['plot', 'species', 'count'], rows.concat(idx)));
    };
  },

  // ---------- map ----------
  // Drawn by the game itself (no map scripts, no tiles): reserves placed by latitude and longitude.
  viewMap(body) {
    const W = 520, H = 560, lng0 = 67, lng1 = 98, lat0 = 6, lat1 = 37.5;
    const X = (lng) => 30 + ((lng - lng0) / (lng1 - lng0)) * (W - 60);
    const Y = (lat) => 20 + (1 - (lat - lat0) / (lat1 - lat0)) * (H - 50);
    const grid = [];
    for (let lng = 70; lng <= 95; lng += 5) grid.push(`<line class="grid" x1="${X(lng)}" x2="${X(lng)}" y1="${Y(lat1)}" y2="${Y(lat0)}"/><text x="${X(lng)}" y="${H - 12}" text-anchor="middle">${lng}°E</text>`);
    for (let lat = 10; lat <= 35; lat += 5) grid.push(`<line class="grid" x1="${X(lng0)}" x2="${X(lng1)}" y1="${Y(lat)}" y2="${Y(lat)}"/><text x="${X(lng0) - 4}" y="${Y(lat) + 4}" text-anchor="end">${lat}°N</text>`);
    const tropic = `<line x1="${X(lng0)}" x2="${X(lng1)}" y1="${Y(23.44)}" y2="${Y(23.44)}" stroke="var(--amber)" stroke-dasharray="5 4" opacity="0.6"/><text x="${X(lng1) - 4}" y="${Y(23.44) - 5}" text-anchor="end" style="fill:var(--amber)">${esc(tr('rs.tropic'))}</text>`;
    const pts = this.pack.reserves.map((r) => `<g><circle cx="${X(r.lng)}" cy="${Y(r.lat)}" r="6" fill="#b7791f" stroke="#fff" stroke-width="1.5"/><text x="${X(r.lng) + 9}" y="${Y(r.lat) + 4}" style="fill:var(--pfg);font-weight:600">${esc(L(r.name))}</text></g>`).join('');
    const osm = (r) => `https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=9/${r.lat}/${r.lng}`;
    body.innerHTML = `<p class="lead">${esc(tr('rs.mapLead'))}</p>
      <div class="rs-map"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tr('rs.tabMap'))}">${grid.join('')}${tropic}${pts}</svg></div>
      <table class="pro-table"><thead><tr><th>${esc(tr('rs.reserve'))}</th><th>${esc(tr('rs.state'))}</th><th>lat, lng</th></tr></thead><tbody>
      ${this.pack.reserves.map((r) => `<tr><td><a href="${osm(r)}" target="_blank" rel="noopener">${esc(L(r.name))}</a></td><td>${esc(L(r.state))}</td><td class="mono">${r.lat.toFixed(2)}, ${r.lng.toFixed(2)}</td></tr>`).join('')}</tbody></table>
      <p class="small">${esc(tr('rs.mapNote'))}</p>`;
  },
};

