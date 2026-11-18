// Touchdown rule: the wheels reaching a runway with the gear down, gently and wings level, is a landing; anything
// else that meets the ground is still a crash (Jet_vs_Missile CLAUDE.md: the jet crashes when it hits the ground).
import { GEAR_H, type JetPhysics } from './JetPhysics';
import { onRunway, runwaySurface } from '../world/Airfields';

export const MAX_SINK_MPS = 4; // firmer than this breaks the gear
const MAX_BANK = (15 * Math.PI) / 180;

export interface Touchdown {
  ok: boolean;
  /** why it was not a landing (shown to the player) */
  why: string;
  sink: number;
  /** metres off the centre line */
  off: number;
  stars: number;
}

/** null while the wheels are still above the runway (or not over one) */
export function checkTouchdown(j: JetPhysics): Touchdown | null {
  const f = onRunway(j.pos.x, j.pos.z);
  if (!f) return null;
  const surf = runwaySurface(j.pos.x, j.pos.z);
  if (j.pos.y - GEAR_H > surf || j.vel.y >= 0) return null; // climbing away (just lifted off) is not a touchdown
  const sink = -j.vel.y;
  const off = Math.abs(j.pos.z - f.z);
  const bank = Math.acos(Math.max(-1, Math.min(1, j.liftUp.y)));
  let why = '';
  if (!j.gearDown) why = 'GEAR UP - landing needs the gear down (below 1,000 ft, under 250 kt near a runway)';
  else if (sink > MAX_SINK_MPS) why = `TOO HARD - ${sink.toFixed(1)} m/s sink (max ${MAX_SINK_MPS})`;
  else if (bank > MAX_BANK) why = 'WINGS NOT LEVEL at touchdown';
  else if (j.nose.y < -0.05) why = 'NOSE DOWN at touchdown';
  const stars = why ? 0 : 1 + (sink < 2 ? 1 : 0) + (off < 6 && sink < 1.5 ? 1 : 0);
  return { ok: !why, why, sink, off, stars };
}
