// stats.js - Research mode maths: CSV, regression with uncertainty, growth
// rates and biodiversity indices. Pure functions, checked by tests/research.test.mjs.
// The "AI prediction" in Research mode is this regression, shown openly with
// its uncertainty, so students can see exactly how it was made.

export function parseCSV(text) {
  const lines = String(text).trim().split(/\r?\n/).filter(Boolean);
  const head = lines.shift().split(',').map((h) => h.trim());
  const rows = lines.map((l) => {
    const cells = l.split(',');
    return Object.fromEntries(head.map((h, i) => { const v = (cells[i] ?? '').trim(); const n = Number(v); return [h, v !== '' && isFinite(n) ? n : v]; }));
  });
  return { head, rows };
}

export function toCSV(head, rows) {
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [head.join(','), ...rows.map((r) => head.map((h) => q(r[h])).join(','))].join('\n');
}

// Two-sided 95% t values for df = 1..30 (larger df use 1.96).
const T95 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086, 2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042];
export const t95 = (df) => (df < 1 ? NaN : df <= 30 ? T95[df - 1] : 1.96);

// Ordinary least squares y = a + b x, with R² and a 95% prediction interval.
export function linreg(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); syy += (ys[i] - my) ** 2; }
  const b = sxy / sxx;
  const a = my - b * mx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (ys[i] - (a + b * xs[i])) ** 2;
  const df = n - 2;
  const se = df > 0 ? Math.sqrt(sse / df) : NaN;
  const r2 = syy ? 1 - sse / syy : 1;
  const predict = (x) => {
    const y = a + b * x;
    const half = t95(df) * se * Math.sqrt(1 + 1 / n + (x - mx) ** 2 / sxx);
    return { y, lo: y - half, hi: y + half };
  };
  return { a, b, r2, se, n, df, predict };
}

// Exponential growth y = A e^(k x), fitted on ln y. Returns the yearly growth rate e^k - 1.
export function expfit(xs, ys) {
  const lr = linreg(xs, ys.map((y) => Math.log(y)));
  return {
    k: lr.b, rate: Math.exp(lr.b) - 1, r2: lr.r2, doubling: Math.log(2) / lr.b,
    predict: (x) => { const p = lr.predict(x); return { y: Math.exp(p.y), lo: Math.exp(p.lo), hi: Math.exp(p.hi) }; },
  };
}

// Growth between two values: total % change, and compound yearly rate.
export function growth(v0, v1, years) {
  return { total: (v1 - v0) / v0, yearly: Math.pow(v1 / v0, 1 / years) - 1 };
}

// Biodiversity from counts per species.
export function diversity(counts) {
  const c = counts.filter((x) => x > 0);
  const N = c.reduce((s, x) => s + x, 0);
  const S = c.length;
  if (!N) return { S: 0, N: 0, shannon: 0, simpson: 0, evenness: 0 };
  const p = c.map((x) => x / N);
  const shannon = -p.reduce((s, q) => s + q * Math.log(q), 0);
  const simpson = 1 - p.reduce((s, q) => s + q * q, 0);
  return { S, N, shannon, simpson, evenness: S > 1 ? shannon / Math.log(S) : 0 };
}
