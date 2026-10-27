// tracks/models.js - models for the Engineering, Agriculture and Forestry
// cases. Pure functions, checked by tests/tracks.test.mjs. Numbers that are
// model assumptions are marked as such; the rest are cited in the case packs.

// ---------- Engineering 1: a net-zero electricity ward ----------
// 2,000 homes at 150 kWh a month. Rooftop solar yields about 1,500 kWh per kWp
// per year in most of India (4-4.5 units per kW per day). Grid electricity emits
// about 0.71 t CO2 per MWh (CEA CO2 Baseline Database).
export const WARD = { homes: 2000, kwhMonth: 150, yieldPerKw: 1500, ef: 0.71, eveningShare: 0.35, peakMW: 1.6 };

export function solarWard({ solarMW = 0, efficiency = 0, batteryMWh = 0 } = {}, w = WARD) {
  const demand = (w.homes * w.kwhMonth * 12) / 1000 * (1 - efficiency);           // MWh a year
  const solar = solarMW * w.yieldPerKw;                                               // MWh a year
  const net = Math.max(0, demand - solar);                                            // with net metering
  const co2Base = (w.homes * w.kwhMonth * 12) / 1000 * w.ef;
  const co2 = net * w.ef;
  // Evening peak (after sunset): efficiency lowers it; a battery charged by the day's solar covers part of it.
  const eveningMWh = (demand * w.eveningShare) / 365;
  const stored = Math.min(batteryMWh * 0.9, (solar / 365) * 0.5, eveningMWh);
  const peak = w.peakMW * (1 - efficiency) * (1 - stored / eveningMWh);
  return { demand, solar, net, co2Base, co2, avoided: co2Base - co2, netZero: Math.min(1, solar / demand), peak, peakBase: w.peakMW };
}

// ---------- Engineering 2: storm drains (rational method) ----------
// Q = C i A / 360 : Q peak runoff m³/s, C runoff coefficient, i rainfall intensity mm/h, A area in hectares.
export const rationalQ = (C, i, A) => (C * i * A) / 360;
export const DRAIN = { A: 40, C: 0.8, capacity: 3.0, storms: [{ id: 'r2', i: 60, w: 0.5 }, { id: 'r5', i: 80, w: 0.3 }, { id: 'r10', i: 95, w: 0.2 }], rainYear: 800 };

export function drains({ capacity = DRAIN.capacity, dC = 0, desilt = false } = {}, d = DRAIN) {
  const cap = capacity * (desilt ? 1.15 : 1);
  const C = Math.max(0.3, d.C - dC);
  const storms = d.storms.map((s) => { const Q = rationalQ(C, s.i, d.A); return { ...s, Q, ok: Q <= cap }; });
  const safety = storms.reduce((sum, s) => sum + (s.ok ? s.w : 0), 0);
  // Water that soaks in instead of running off, over a year (m³): area (m²) x rain (m) x the cut in C.
  const recharge = d.A * 10000 * (d.rainYear / 1000) * (d.C - C);
  return { cap, C, storms, safety, recharge };
}

// ---------- Agriculture 1: nitrogen for irrigated wheat ----------
// Yield responds with diminishing returns (Mitscherlich): Y = Ymax (1 - e^(-c N)), N = nitrogen the crop gets.
// Low-N soil (Soil Health Card < 280 kg/ha available N) supplies about 40 kg; a summer moong crop leaves about 30 kg.
// Use efficiency of applied N: one basal dose 33%, three split doses 45%, splits guided by a leaf colour chart 55%.
export const WHEAT = { Ymax: 55, c: 0.022, soilN: 40, price: 2425, nPrice: 242 / (45 * 0.46), splitCost: 600, lccCost: 900 };
export const N_METHOD = { single: 0.33, split: 0.45, lcc: 0.55 };

export function wheat({ dose = 0, method = 'single', legume = false } = {}, w = WHEAT) {
  const eff = N_METHOD[method];
  const N = w.soilN + (legume ? 30 : 0) + dose * eff;
  const yieldQ = w.Ymax * (1 - Math.exp(-w.c * N));                    // quintal per hectare
  const cost = dose * w.nPrice + (method === 'split' ? w.splitCost : method === 'lcc' ? w.splitCost + w.lccCost : 0) + (legume ? 0 : 0);
  const income = yieldQ * w.price - cost;
  const lost = dose * (1 - eff);                                          // kg N lost to air and water
  const leached = lost * 0.4;                                             // share that reaches groundwater as nitrate (model assumption)
  return { N, yieldQ, cost, income, lost, leached };
}

// ---------- Agriculture 2: irrigation method ----------
// Field application efficiency (CWC / NMSA): flood 40%, furrow 60%, sprinkler 75%, drip 90%.
// Mulch cuts the crop's water need by about 15% (less evaporation from soil). Irrigating by a soil
// moisture reading instead of by the calendar avoids about 10% over-watering.
export const IRR = { area: 2, need: 600, head: 60, pumpEff: 0.5, price: 70000, kwhCost: 0, recharge: 150, sy: 0.1, years: 5 };
export const METHODS = {
  flood: { eff: 0.4, yieldF: 1.0, capital: 0 },
  furrow: { eff: 0.6, yieldF: 1.05, capital: 10000 },
  sprinkler: { eff: 0.75, yieldF: 1.1, capital: 60000 },
  drip: { eff: 0.9, yieldF: 1.25, capital: 120000 },
};
export function irrigation({ method = 'flood', mulch = false, sensor = false, subsidy = 0.55 } = {}, p = IRR) {
  const m = METHODS[method];
  const need = p.need * (mulch ? 0.85 : 1);                               // mm over the season
  const applied = (need / m.eff) * (sensor ? 0.9 : 1);                    // mm pumped
  const volume = applied / 1000 * p.area * 10000;                         // m³
  const kwh = (volume * 1000 * 9.81 * p.head) / (p.pumpEff * 3.6e6);      // pumping energy
  const fall = Math.max(0, (applied - p.recharge) / 1000 / p.sy);         // m the water table falls under this farm each year (model)
  const yieldF = m.yieldF * (mulch ? 1.05 : 1);
  const capital = (m.capital * (1 - subsidy) + (mulch ? 8000 : 0) + (sensor ? 5000 : 0)) * p.area;
  const income = p.years * p.price * p.area * yieldF - capital;           // 5 seasons, crop income less farmer's share of equipment
  return { applied, volume, kwh, fall, yieldF, capital, income };
}

// ---------- Forestry 1: tigers and their prey ----------
// A tiger eats about 50-60 large prey a year; prey can stand about a 10% take a year, so one tiger needs
// about 550 prey animals in its range (model assumption from that ratio). Reserve core 1,000 km².
export const RESERVE = { area: 1000, preyPerTiger: 550, tigers0: 25, prey0: 20, years: 20, r: 0.2 };

export function tigers({ poaching = 0.12, preyTarget = 20, corridor = false, relocate = false } = {}, p = RESERVE) {
  let T = p.tigers0, D = p.prey0, conflict = 0, moved = 0;
  const pts = [[0, T, D]];
  const area = p.area * (relocate ? 1.15 : 1);           // voluntary relocation adds inviolate area
  for (let y = 1; y <= p.years; y++) {
    D += (preyTarget - D) * 0.25;                        // prey recovers towards the habitat's level
    const K = (area * D) / p.preyPerTiger;
    T += p.r * T * (1 - T / K) - poaching * T;
    // Young tigers leave to find a territory, more as the reserve fills up (model: up to 10% a year).
    // Through a corridor most reach another forest; without one they end up near farms and villages.
    const disp = 0.1 * T * Math.min(1, T / K);
    T = Math.max(0, T - disp);
    moved += corridor ? disp * 0.6 : 0;
    conflict += disp * (corridor ? 0.4 : 1) + (relocate ? 0 : 0.03 * T);   // villages inside the core add cattle kills
    pts.push([y, T, D, K]);
  }
  return { pts, tigers: T, conflict, moved };
}

// ---------- Forestry 2: mangroves and a cyclone ----------
// Mangroves lower storm surge by about 0.04-0.48 m per km of forest width and wave height by 13-66%
// per 100 m (McIvor et al. 2012); the model uses 0.25 m/km and 25% per 100 m. Surviving width counts.
export const COAST = { surge: 2.3, wave: 1.2, embank: 2.4, villagers: 6000 };
export const PLANTING = { native: 0.8, mono: 0.5 };                     // seedling survival after 5 years (model assumption)

export function mangroves({ width = 0, mix = 'native', raise = 0, shelters = false } = {}, c = COAST) {
  const w = width * PLANTING[mix];                       // effective width, m
  const surge = c.surge - 0.25 * (w / 1000);
  const wave = c.wave * Math.pow(0.75, w / 100);
  const level = surge + 0.5 * wave;                      // water level at the embankment, wave run-up taken as half the wave height
  const top = c.embank + raise;
  const breach = level > top;
  // People at risk: everyone if the embankment breaks; early warning and shelters move most of them (model).
  const atRisk = breach ? c.villagers * (shelters ? 0.05 : 0.4) : c.villagers * (shelters ? 0.01 : 0.05);
  const carbon = (w * 10000) / 10000 * 6;                // t CO2 a year: about 6 t per hectare per year, 10 km of coast (model)
  const fishHa = (w * 10000) / 10000;                    // hectares of fish nursery along 10 km of coast
  return { level, top, breach, atRisk, carbon, fishHa, wave };
}
