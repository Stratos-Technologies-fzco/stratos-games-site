// Pilot g tolerance over time (fighter, phase 1 of the fighter upgrade, 09-Nov-2026).
// Blood drains from the head under sustained positive g and pools there under negative g. Neither happens
// at once: the effect builds over seconds and wears off over seconds.
//   Positive g (g-suit + straining):  grey-out from about 6.5 g, tunnel vision near 8 g, blackout near 9 g after
//   a few seconds, then G-LOC: the pilot is unconscious for 6 s (hands off the stick) and comes round over 3 s.
//   Negative g: red-out below -2.5 g.
// Pure maths, no screen code, so tools/test_flight_model.mjs can check it.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const PILOT_G = {
  onsetFrom: 5.5,      // g where the blood starts to drain
  perG: 3.2,           // g from onsetFrom to full blackout (sustained)
  riseSec: 2.5,        // time constant while the g builds
  fallSec: 3.0,        // time constant while the blood comes back
  blackHoldSec: 1.0,   // seconds of blackout before the pilot loses consciousness
  glocSec: 6.0,        // unconscious
  wakeSec: 3.0,        // coming round: vision returns, controls come back
  redFrom: 2.0,        // negative g (as a positive number) where red-out starts
  redPerG: 1.5,
  redRiseSec: 1.0,
  redFallSec: 2.0
};

export function newPilotG() {
  return { stress: 0, red: 0, blackT: 0, gloc: 0, wake: 0 };
}

// s: state from newPilotG(); loadG: g along the pilot's spine (positive = pushed into the seat).
// Returns what the pilot sees and whether the hands work: { grey, tunnel, black, red, controlsLost }
export function stepPilotG(s, loadG, dt, cfg = PILOT_G) {
  const target = Math.max(0, (loadG - cfg.onsetFrom) / cfg.perG);
  const tc = target > s.stress ? cfg.riseSec : cfg.fallSec;
  s.stress += (target - s.stress) * (1 - Math.exp(-dt / tc));

  const redTarget = loadG < -cfg.redFrom ? Math.min(1, (-loadG - cfg.redFrom) / cfg.redPerG) : 0;
  s.red += (redTarget - s.red) * (1 - Math.exp(-dt / (redTarget > s.red ? cfg.redRiseSec : cfg.redFallSec)));

  if (s.gloc > 0) {
    s.gloc -= dt;
    if (s.gloc <= 0) { s.gloc = 0; s.wake = cfg.wakeSec; }
  } else if (s.wake > 0) {
    s.wake = Math.max(0, s.wake - dt);
  } else if (s.stress >= 1) {
    s.blackT += dt;
    if (s.blackT >= cfg.blackHoldSec) { s.gloc = cfg.glocSec; s.blackT = 0; }
  } else {
    s.blackT = Math.max(0, s.blackT - dt);
  }

  const out = s.gloc > 0;
  const waking = s.wake > 0 ? s.wake / cfg.wakeSec : 0;   // 1 just woken .. 0 fully back
  const black = out ? 1 : Math.max(smooth(0.92, 1.0, s.stress), waking);
  return {
    grey: smooth(0.25, 0.6, s.stress),
    tunnel: Math.max(smooth(0.55, 1.0, s.stress), waking),
    black,
    red: s.red,
    controlsLost: out || waking > 0.5,
    gloc: out
  };
}
