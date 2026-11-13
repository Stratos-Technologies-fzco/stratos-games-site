// Pure maths for the locomotion blend space. No three.js here, so it is easy to test.
//
// Directions: phi is the angle of travel relative to the way the body faces, in radians. 0 = forward, +90 deg = to the character's right,
// 180 deg = backwards. The eight cells sit every 45 degrees. Each cell is a "virtual clip": a real clip, played forward or reversed, with the hips
// turned by `yaw` so the legs move that way. The upper body is counter-twisted by the animator, so the shoulders keep pointing at the aim.

export interface Cell { name: string; angle: number; reverse: boolean; yaw: number }
const D = Math.PI / 180;
export const CELLS: Cell[] = [
  { name: 'fwd', angle: 0, reverse: false, yaw: 0 },
  { name: 'fwd_right', angle: 45, reverse: false, yaw: 45 * D },
  { name: 'right', angle: 90, reverse: false, yaw: 90 * D },
  { name: 'back_right', angle: 135, reverse: true, yaw: -45 * D },
  { name: 'back', angle: 180, reverse: true, yaw: 0 },
  { name: 'back_left', angle: 225, reverse: true, yaw: 45 * D },
  { name: 'left', angle: 270, reverse: false, yaw: -90 * D },
  { name: 'fwd_left', angle: 315, reverse: false, yaw: -45 * D },
];

/** Weights of the 8 cells for a travel angle. Two neighbouring cells share the weight; the total is always 1. */
export function directionWeights(phi: number, out: Float32Array = new Float32Array(8)): Float32Array {
  out.fill(0);
  let a = phi / (Math.PI / 4); a = ((a % 8) + 8) % 8; // 0..8 in cell units
  const i = Math.floor(a) % 8, f = a - Math.floor(a);
  out[i] = 1 - f; out[(i + 1) % 8] += f;
  return out;
}

/** Ground speed (m/s) of each locomotion loop, measured from the clips (tools/build-animations.ts). */
export const SPEED_STOPS = [0, 0.975, 5.357, 8.25]; // idle, walk, jog, sprint
/** The speed range each loop covers on its own by stretching its playback rate (about x0.8 to x1.2). Walking and running gaits are only mixed in the gaps between these ranges. */
export const PLATEAUS: [number, number][] = [[0, 0], [0.78, 1.17], [4.29, 5.9], [6.3, Infinity]];
/** Weights of idle / walk / jog / sprint for a ground speed. A speed inside a loop's range plays that loop alone; in a gap the two neighbours are blended. Sums to 1. */
export function speedWeights(speed: number, plateaus: [number, number][] = PLATEAUS, out: number[] = new Array(plateaus.length).fill(0)): number[] {
  out.fill(0); const s = Math.max(0, speed);
  for (let i = 0; i < plateaus.length; i++) if (s >= plateaus[i][0] && s <= plateaus[i][1]) { out[i] = 1; return out; }
  for (let i = 0; i < plateaus.length - 1; i++) if (s > plateaus[i][1] && s < plateaus[i + 1][0]) { const f = (s - plateaus[i][1]) / (plateaus[i + 1][0] - plateaus[i][1]); out[i] = 1 - f; out[i + 1] = f; return out; }
  return out;
}
/** Playback-rate multiplier so the feet do not slide: real speed over the blended clip speed. Clamped to the stride-warp range 0.8 - 1.2. */
export function strideRate(speed: number, w: number[], stops: number[] = SPEED_STOPS): number {
  let clipSpeed = 0; for (let i = 0; i < stops.length; i++) clipSpeed += w[i] * stops[i];
  if (clipSpeed < 0.3) return 1;
  return Math.min(1.2, Math.max(0.8, speed / clipSpeed));
}
/** Blend weights for the aim offset's pitch poses (down / level / up), pitch in radians, -70..+70 degrees. Sums to 1. */
export function pitchWeights(pitch: number, out: number[] = [0, 0, 0]): number[] {
  const lim = 70 * D; const p = Math.max(-lim, Math.min(lim, pitch)) / lim; // -1 (down) .. +1 (up)
  out[0] = Math.max(0, -p); out[2] = Math.max(0, p); out[1] = 1 - out[0] - out[2]; return out;
}
