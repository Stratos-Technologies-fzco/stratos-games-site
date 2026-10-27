// svg.js - tiny SVG line charts (no library). Used by the dashboard, the
// experiments, the professional cases and research mode.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const nice = (v) => {
  if (!isFinite(v) || v === 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v))));
  const m = Math.abs(v) / p;
  return Math.sign(v) * (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
};
const fmt = (v) => {
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
  if (a >= 1e4) return (v / 1e3).toFixed(0) + 'k';
  if (a >= 100 || Number.isInteger(v)) return String(Math.round(v));
  return v.toFixed(a >= 10 ? 1 : 2);
};

// series: [{ name, color, points: [[x, y], ...], dash? , band?: [[x, lo, hi], ...] }]
// opts: { w, h, xLabel, yLabel, yMin, yMax, xMin, xMax, marks: [{ y, label, color }], scatter }
export function lineChart(series, opts = {}) {
  const w = opts.w || 560, h = opts.h || 240;
  const L = 46, R = 12, T = 12, B = opts.xLabel ? 36 : 24;
  const all = series.flatMap((s) => s.points.concat((s.band || []).flatMap(([x, lo, hi]) => [[x, lo], [x, hi]])));
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]).filter(isFinite);
  let x0 = opts.xMin ?? Math.min(...xs), x1 = opts.xMax ?? Math.max(...xs);
  let y0 = opts.yMin ?? Math.min(0, ...ys), y1 = opts.yMax ?? Math.max(...ys, ...(opts.marks || []).map((m) => m.y));
  if (!isFinite(x0) || !isFinite(x1)) { x0 = 0; x1 = 1; }
  if (!isFinite(y0) || !isFinite(y1)) { y0 = 0; y1 = 1; }
  if (x1 === x0) x1 = x0 + 1;
  if (y1 === y0) y1 = y0 + 1;
  const step = nice((y1 - y0) / 4);
  y1 = Math.ceil(y1 / step) * step;
  y0 = Math.floor(y0 / step) * step;
  const X = (x) => L + ((x - x0) / (x1 - x0)) * (w - L - R);
  const Y = (y) => T + (1 - (y - y0) / (y1 - y0)) * (h - T - B);
  const out = [`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.title || opts.yLabel || 'chart')}">`];
  for (let v = y0; v <= y1 + step / 2; v += step) {
    out.push(`<line class="grid" x1="${L}" x2="${w - R}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`);
  }
  const xstep = nice((x1 - x0) / 5);
  for (let v = Math.ceil(x0 / xstep) * xstep; v <= x1 + 1e-9; v += xstep) {
    out.push(`<text x="${X(v)}" y="${h - B + 16}" text-anchor="middle">${fmt(v)}</text>`);
  }
  out.push(`<line class="axis" x1="${L}" x2="${L}" y1="${T}" y2="${h - B}"/><line class="axis" x1="${L}" x2="${w - R}" y1="${h - B}" y2="${h - B}"/>`);
  for (const m of opts.marks || []) {
    if (m.y < y0 || m.y > y1) continue;
    out.push(`<line x1="${L}" x2="${w - R}" y1="${Y(m.y)}" y2="${Y(m.y)}" stroke="${m.color || 'currentColor'}" stroke-dasharray="4 4" opacity="0.7"/><text x="${w - R - 4}" y="${Y(m.y) - 4}" text-anchor="end" style="fill:${m.color || 'currentColor'}">${esc(m.label)}</text>`);
  }
  for (const s of series) {
    if (s.band && s.band.length) {
      const top = s.band.map(([x, , hi]) => `${X(x)},${Y(hi)}`);
      const bot = s.band.slice().reverse().map(([x, lo]) => `${X(x)},${Y(lo)}`);
      out.push(`<polygon points="${top.concat(bot).join(' ')}" fill="${s.color}" opacity="0.16"/>`);
    }
    if (!s.points.length) continue;
    if (s.scatter || opts.scatter) {
      for (const [x, y] of s.points) out.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="3.5" fill="${s.color}"/>`);
    } else {
      const d = s.points.filter((p) => isFinite(p[1])).map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('');
      out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" ${s.dash ? 'stroke-dasharray="6 4"' : ''} stroke-linejoin="round"/>`);
    }
  }
  if (opts.xLabel) out.push(`<text x="${(L + w - R) / 2}" y="${h - 4}" text-anchor="middle">${esc(opts.xLabel)}</text>`);
  if (opts.yLabel) out.push(`<text x="${L}" y="${T - 2}" text-anchor="start">${esc(opts.yLabel)}</text>`);
  out.push('</svg>');
  return out.join('');
}

export function legend(series) {
  return `<div class="legend">${series.map((s) => `<span style="--c:${s.color}"><i></i>${esc(s.name)}</span>`).join('')}</div>`;
}

// Simple bar chart: items [{ label, value, color }]
export function barChart(items, opts = {}) {
  const w = opts.w || 560, rowH = 26, h = items.length * rowH + 8;
  const max = opts.max ?? Math.max(...items.map((i) => i.value), 1);
  const L = opts.labelW || 150;
  const out = [`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.title || 'bars')}">`];
  items.forEach((it, i) => {
    const y = 4 + i * rowH;
    const bw = Math.max(0, (it.value / max) * (w - L - 60));
    out.push(`<text x="${L - 8}" y="${y + 16}" text-anchor="end">${esc(it.label)}</text><rect x="${L}" y="${y + 4}" width="${bw}" height="16" rx="4" fill="${it.color || 'var(--cyan)'}"/><text x="${L + bw + 6}" y="${y + 16}">${fmt(it.value)}${esc(opts.unit || '')}</text>`);
  });
  out.push('</svg>');
  return out.join('');
}
