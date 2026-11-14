// Pure facing rules. Which way does the body point, and how far does the upper body twist toward the aim?
//   Not aiming + moving   body turns toward the way it moves at 540 deg/s, the camera is free.
//   Aiming or firing      body faces the aim (at the same turn rate, never a snap); legs strafe through the blend space.
//   Standing still, armed upper body follows the aim up to 60 deg, then the feet step round (turn in place) until the offset is small.
const D = Math.PI / 180;
export const TURN_RATE = 540 * D, STEP_TURN_RATE = 220 * D, MOVE_THRESHOLD = 0.5, FOLLOW_LIMIT = 60 * D, STEP_END = 8 * D;
export const wrap = (a: number) => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };

export interface FacingState { bodyYaw: number; turning: number; angVel: number }
export interface FacingInput { aimYaw: number; moveYaw: number; speed: number; aiming: boolean; firing: boolean; armed: boolean; dt: number }
export const newFacing = (yaw = 0): FacingState => ({ bodyYaw: yaw, turning: 0, angVel: 0 });

/** Moves the body yaw one step. Returns the twist the upper body needs (aim relative to the body, radians) for this frame. */
export function stepFacing(s: FacingState, i: FacingInput): number {
  const before = s.bodyYaw; const ready = i.aiming || i.firing; let target: number | null = null, rate = TURN_RATE;
  if (i.speed > MOVE_THRESHOLD) { target = ready ? i.aimYaw : i.moveYaw; s.turning = 0; }
  else if (i.armed || ready) {
    const off = wrap(i.aimYaw - s.bodyYaw);
    if (s.turning === 0 && Math.abs(off) > FOLLOW_LIMIT) s.turning = Math.sign(off);
    if (s.turning !== 0) { if (Math.abs(off) < STEP_END) s.turning = 0; else { target = i.aimYaw; rate = STEP_TURN_RATE; } }
  } else s.turning = 0;
  if (target !== null) { const d = wrap(target - s.bodyYaw), step = Math.min(Math.abs(d), rate * i.dt); s.bodyYaw = wrap(s.bodyYaw + Math.sign(d) * step); }
  s.angVel = i.dt > 0 ? wrap(s.bodyYaw - before) / i.dt : 0;
  const rel = wrap(i.aimYaw - s.bodyYaw);
  if (ready) return Math.max(-90 * D, Math.min(90 * D, rel));
  if (i.speed <= MOVE_THRESHOLD && i.armed) return Math.max(-FOLLOW_LIMIT, Math.min(FOLLOW_LIMIT, rel));
  return 0;
}
