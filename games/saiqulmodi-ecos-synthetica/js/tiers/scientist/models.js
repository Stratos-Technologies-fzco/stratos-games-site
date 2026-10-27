// models.js - the four Eco Scientist experiments as small, testable models.
// Pure functions (no DOM), so tests/models.test.mjs can check them against
// textbook results.

// Runge-Kutta 4 for a system dy/dt = f(t, y); returns [[t, ...y], ...] every `every` steps.
export function rk4(f, y0, t1, dt = 0.01, every = 10) {
  let y = y0.slice();
  let t = 0;
  const out = [[0, ...y]];
  const n = Math.round(t1 / dt);
  const add = (a, b, k) => a.map((v, i) => v + b[i] * k);
  for (let i = 1; i <= n; i++) {
    const k1 = f(t, y);
    const k2 = f(t + dt / 2, add(y, k1, dt / 2));
    const k3 = f(t + dt / 2, add(y, k2, dt / 2));
    const k4 = f(t + dt, add(y, k3, dt));
    y = y.map((v, j) => Math.max(0, v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])));
    t = i * dt;
    if (i % every === 0) out.push([t, ...y]);
  }
  return out;
}

// 1. Population growth (NCERT Class 12, Organisms and Populations):
// exponential dN/dt = rN, logistic dN/dt = rN(K - N)/K.
export function logistic({ r = 0.5, K = 1000, N0 = 10, years = 30 }) {
  const pts = [];
  for (let t = 0; t <= years + 1e-9; t += years / 120) {
    pts.push([t, K / (1 + ((K - N0) / N0) * Math.exp(-r * t)), N0 * Math.exp(r * t)]);
  }
  // The curve bends (fastest growth) at N = K/2.
  const tHalf = Math.log((K - N0) / N0) / r;
  return { pts, tHalf, maxRate: (r * K) / 4 };
}

// 2. Predator-prey (Lotka 1925, Volterra 1926):
// dH/dt = aH - bHP ; dP/dt = c bHP - dP  (H prey, P predator)
export function lotkaVolterra({ a = 0.6, b = 0.025, c = 0.4, d = 0.5, H0 = 40, P0 = 9, years = 60 }) {
  const pts = rk4((t, [H, P]) => [a * H - b * H * P, c * b * H * P - d * P], [H0, P0], years, 0.005, 20);
  // Equilibrium the cycles turn around, and the small-swing period 2*pi/sqrt(a d).
  return { pts, Heq: d / (c * b), Peq: a / b, period: (2 * Math.PI) / Math.sqrt(a * d) };
}

// Find the times of the peaks of column `col` (for the period check).
export function peaks(pts, col) {
  const out = [];
  for (let i = 1; i < pts.length - 1; i++) if (pts[i][col] > pts[i - 1][col] && pts[i][col] >= pts[i + 1][col]) out.push(pts[i][0]);
  return out;
}

// 3. Carbon cycle: one air box with land and ocean sinks that take up a share of the
// extra carbon above pre-industrial (Global Carbon Budget style). 1 ppm CO2 = 2.124 GtC.
export const PPM_TO_GTC = 2.124;
export function carbon({ start = 2023, years = 50, ppm0 = 421, emit0 = 10.0, growth = 0, forestLoss = 1.1, kOcean = 0.0095, kLand = 0.0105, pre = 280 }) {
  // emit0 = fossil emissions GtC/yr (about 10 in 2023); growth = % per year change; forestLoss = land-use GtC/yr.
  let A = ppm0 * PPM_TO_GTC;
  const A0 = pre * PPM_TO_GTC;
  const pts = [];
  let cum = 0, cumAir = 0;
  for (let i = 0; i <= years; i++) {
    const E = Math.max(0, emit0 * Math.pow(1 + growth / 100, i)) + forestLoss;
    const ocean = kOcean * (A - A0);
    const land = kLand * (A - A0);
    pts.push([start + i, A / PPM_TO_GTC, E, ocean, land]);
    const dA = E - ocean - land;
    cum += E; cumAir += dA;
    A += dA;
  }
  return { pts, airborne: cum ? cumAir / cum : 0 };
}

// 4. Nitrogen cycle in one hectare of soil (kg N/ha), daily steps over a season.
// Fixation (Rhizobium in legume roots), mineralisation (ammonification),
// nitrification (Nitrosomonas, Nitrobacter: needs oxygen), denitrification
// (Pseudomonas, Thiobacillus: in waterlogged soil), plant uptake and leaching.
export function nitrogen({ days = 120, legume = false, fertiliser = 0, waterlogged = false, organic = 2000, nh4 = 20, no3 = 20 }) {
  const fix = legume ? 1.0 : 0.05;              // kg/ha/day: legume fields fix about 50-150 kg N/ha a season
  const kMin = 0.00025;                          // share of organic N mineralised per day
  const kNit = waterlogged ? 0.02 : 0.15;        // nitrification slows when oxygen is short
  const kDen = waterlogged ? 0.08 : 0.005;       // denitrification speeds up without oxygen
  const kLeach = waterlogged ? 0.004 : 0.01;
  let O = organic, A = nh4, N = no3;
  let up = 0, lost = 0, fixed = 0;
  const pts = [[0, A, N, 0]];
  for (let d = 1; d <= days; d++) {
    if (d === 15 && fertiliser) A += fertiliser;   // urea turns into ammonium in soil
    const demand = 1.2 * Math.sin((Math.PI * d) / days) + 0.1; // crop takes most at mid-season
    const min = kMin * O, nit = kNit * A, den = kDen * N, leach = kLeach * N;
    const upA = Math.min(A * 0.5, demand * 0.3), upN = Math.min(N * 0.5, demand * 0.7);
    O -= min;
    A += fix + min - nit - upA;
    N += nit - den - leach - upN;
    up += upA + upN; lost += den + leach; fixed += fix;
    pts.push([d, Math.max(0, A), Math.max(0, N), up]);
  }
  return { pts, uptake: up, lost, fixed };
}
