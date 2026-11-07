// Procedural "chain builder" for mega-ramp courses.
// A level is a sequence of steps; a cursor (position + yaw + pitch) walks
// forward through them, emitting platform specs (box colliders + meshes)
// and checkpoint markers. This keeps hand-authoring compact while still
// producing continuous, physically sane ramp geometry.

const DEG = Math.PI / 180;

function vec(x, y, z) { return { x, y, z }; }

export function buildChain(steps, startPos, startYawDeg) {
  const platforms = [];
  const checkpoints = [];
  const decorations = [];

  let cx = startPos.x, cy = startPos.y, cz = startPos.z;
  let yaw = startYawDeg * DEG;

  const forward = () => vec(Math.sin(yaw), 0, Math.cos(yaw));

  for (const step of steps) {
    const f = forward();

    if (step.type === 'flat' || step.type === 'platform') {
      const len = step.length, width = step.width ?? 10;
      const midX = cx + f.x * len / 2;
      const midZ = cz + f.z * len / 2;
      platforms.push({
        pos: vec(midX, cy - 0.25, midZ),
        size: vec(width, 0.5, len + 0.6),
        rotY: yaw,
        rotX: 0,
        color: step.color,
      });
      cx += f.x * len; cz += f.z * len;
    }

    else if (step.type === 'ramp' || step.type === 'landingramp') {
      const len = step.length, width = step.width ?? 10;
      const angle = (step.type === 'landingramp' ? -1 : 1) * step.angleDeg * DEG;
      const horiz = Math.cos(angle) * len;
      const vert = Math.sin(angle) * len;
      const midX = cx + f.x * horiz / 2;
      const midZ = cz + f.z * horiz / 2;
      const midY = cy + vert / 2;
      platforms.push({
        pos: vec(midX, midY - 0.25 * Math.cos(angle), midZ),
        size: vec(width, 0.5, len + 0.4),
        rotY: yaw,
        rotX: -angle, // box local -Z tilts up/down to match travel direction
        color: step.color ?? 0xffb84d,
        isRamp: true,
      });
      cx += f.x * horiz; cz += f.z * horiz; cy += vert;
    }

    else if (step.type === 'gap') {
      cx += f.x * step.length; cz += f.z * step.length;
      // nothing collidable: this is the void the player must clear
    }

    else if (step.type === 'turn') {
      const len = step.length, width = step.width ?? 10;
      const turnAngle = step.angleDeg * DEG;
      const midYaw = yaw + turnAngle / 2;
      const mf = vec(Math.sin(midYaw), 0, Math.cos(midYaw));
      const midX = cx + mf.x * len / 2;
      const midZ = cz + mf.z * len / 2;
      platforms.push({
        pos: vec(midX, cy - 0.25, midZ),
        size: vec(width * 1.3, 0.5, len + 0.6),
        rotY: midYaw,
        rotX: 0,
        color: step.color,
      });
      cx += mf.x * len; cz += mf.z * len;
      yaw += turnAngle;
    }

    else if (step.type === 'bowlend') {
      // A short up-curl wall used to cap a half-pipe / bowl, purely for freestyle bouncing.
      const len = step.length, width = step.width ?? 10;
      const angle = step.angleDeg * DEG;
      const horiz = Math.cos(angle) * len;
      const vert = Math.sin(angle) * len;
      const midX = cx + f.x * horiz / 2;
      const midZ = cz + f.z * horiz / 2;
      const midY = cy + vert / 2;
      platforms.push({
        pos: vec(midX, midY - 0.25 * Math.cos(angle), midZ),
        size: vec(width, 0.5, len + 0.4),
        rotY: yaw,
        rotX: -angle,
        color: step.color ?? 0xff5c7a,
        isRamp: true,
      });
    }

    if (step.checkpoint) {
      checkpoints.push({ pos: vec(cx, cy + 1.6, cz), radius: step.checkpointRadius ?? 5 });
    }
  }

  return { platforms, checkpoints, decorations, endPos: vec(cx, cy, cz), endYaw: yaw };
}

// ---------------------------------------------------------------------------

const SKY_COLOR = 0x5ad1ff;
const SAND_COLOR = 0xffa64d;
const NEON_COLOR = 0xd15aff;

export const LEVELS = [
  {
    id: 'sky-gaps',
    name: 'SKY GAPS',
    theme: 'sky',
    fogColor: 0x8fd8ff,
    skyColor: 0xbfeeff,
    groundColor: null, // no ground plane - void below means real falls
    voidY: -40,
    startYaw: 0,
    // Spawn at the top of a 30-degree drop-in ramp (mega-ramp roll-in start)
    // instead of flat ground: startPos.y = 2 + length*sin(angle) so the
    // chain lands exactly back at the original course height of y=2.
    startPos: { x: 0, y: 9, z: 0 },
    parTimes: { gold: 48, silver: 62 },
    steps: [
      // Flat starting pad so the car spawns level (matching its own
      // upright orientation) instead of sitting right at the tilt point
      // of the ramp, which left the wheel raycasts unable to find the
      // sloped surface and the chassis box just resting there inert.
      { type: 'flat', length: 5, width: 11, color: SKY_COLOR },
      { type: 'landingramp', length: 14, angleDeg: 30, width: 11, color: SKY_COLOR },
      { type: 'flat', length: 26, width: 11, color: SKY_COLOR, checkpoint: true },
      { type: 'ramp', length: 9, angleDeg: 18, width: 11, color: SKY_COLOR },
      { type: 'gap', length: 10 },
      { type: 'landingramp', length: 7, angleDeg: 14, width: 11, color: SKY_COLOR },
      { type: 'flat', length: 14, width: 10, color: SKY_COLOR, checkpoint: true },
      { type: 'turn', angleDeg: 45, length: 16, width: 10, color: SKY_COLOR },
      { type: 'ramp', length: 11, angleDeg: 24, width: 10, color: 0xffd45c },
      { type: 'gap', length: 16 },
      { type: 'landingramp', length: 8, angleDeg: 16, width: 10, color: 0xffd45c },
      { type: 'flat', length: 10, width: 10, color: SKY_COLOR, checkpoint: true },
      { type: 'ramp', length: 8, angleDeg: 20, width: 9, color: SKY_COLOR },
      { type: 'gap', length: 12 },
      { type: 'platform', length: 8, width: 9, color: SKY_COLOR },
      { type: 'turn', angleDeg: -40, length: 14, width: 9, color: SKY_COLOR },
      { type: 'ramp', length: 10, angleDeg: 22, width: 9, color: 0xff5c7a },
      { type: 'gap', length: 18 },
      { type: 'landingramp', length: 9, angleDeg: 16, width: 12, color: 0xff5c7a },
      { type: 'flat', length: 18, width: 12, color: SKY_COLOR, checkpoint: true, checkpointRadius: 7 },
    ],
  },
  {
    id: 'canyon-jump',
    name: 'CANYON JUMP',
    theme: 'canyon',
    fogColor: 0xffcf9e,
    skyColor: 0xffdca8,
    groundColor: 0xb5651d,
    voidY: -60,
    startYaw: 0,
    startPos: { x: 0, y: 11, z: 0 }, // drop-in ramp: 2 + 18*sin(30deg) = 11
    parTimes: { gold: 55, silver: 70 },
    steps: [
      { type: 'flat', length: 5, width: 12, color: SAND_COLOR },
      { type: 'landingramp', length: 18, angleDeg: 30, width: 12, color: SAND_COLOR },
      { type: 'flat', length: 20, width: 12, color: SAND_COLOR, checkpoint: true },
      { type: 'ramp', length: 10, angleDeg: 22, width: 12, color: SAND_COLOR },
      { type: 'gap', length: 20 },
      { type: 'landingramp', length: 9, angleDeg: 18, width: 12, color: SAND_COLOR },
      { type: 'flat', length: 12, width: 11, color: SAND_COLOR, checkpoint: true },
      { type: 'turn', angleDeg: 55, length: 18, width: 11, color: SAND_COLOR },
      { type: 'ramp', length: 9, angleDeg: 20, width: 10, color: 0xffd45c },
      { type: 'gap', length: 14 },
      { type: 'platform', length: 7, width: 10, color: 0xffd45c },
      { type: 'ramp', length: 9, angleDeg: 26, width: 10, color: 0xffd45c },
      { type: 'gap', length: 22 },
      { type: 'landingramp', length: 10, angleDeg: 18, width: 12, color: SAND_COLOR },
      { type: 'flat', length: 10, width: 12, color: SAND_COLOR, checkpoint: true },
      { type: 'turn', angleDeg: -60, length: 18, width: 10, color: SAND_COLOR },
      { type: 'ramp', length: 12, angleDeg: 28, width: 10, color: 0xff5c7a },
      { type: 'gap', length: 26 },
      { type: 'landingramp', length: 11, angleDeg: 20, width: 13, color: 0xff5c7a },
      { type: 'flat', length: 8, width: 13, color: SAND_COLOR },
      { type: 'bowlend', length: 6, angleDeg: 35, width: 13, color: 0xff5c7a },
      { type: 'flat', length: 0.1, width: 13, checkpoint: true, checkpointRadius: 8 },
    ],
  },
  {
    id: 'neon-city',
    name: 'NEON LOOP CITY',
    theme: 'city',
    fogColor: 0x160a2e,
    skyColor: 0x0a0618,
    groundColor: 0x110a22,
    voidY: -40,
    startYaw: 0,
    startPos: { x: 0, y: 13, z: 0 }, // drop-in ramp: 2 + 22*sin(30deg) = 13
    parTimes: { gold: 62, silver: 80 },
    steps: [
      { type: 'flat', length: 5, width: 11, color: NEON_COLOR },
      { type: 'landingramp', length: 22, angleDeg: 30, width: 11, color: NEON_COLOR },
      { type: 'flat', length: 18, width: 11, color: NEON_COLOR, checkpoint: true },
      { type: 'turn', angleDeg: 35, length: 14, width: 11, color: NEON_COLOR },
      { type: 'ramp', length: 9, angleDeg: 20, width: 11, color: NEON_COLOR },
      { type: 'gap', length: 14 },
      { type: 'landingramp', length: 8, angleDeg: 16, width: 11, color: NEON_COLOR },
      { type: 'turn', angleDeg: -50, length: 16, width: 10, color: NEON_COLOR, checkpoint: true },
      { type: 'ramp', length: 10, angleDeg: 24, width: 10, color: 0x5ad1ff },
      { type: 'gap', length: 18 },
      { type: 'platform', length: 8, width: 10, color: 0x5ad1ff },
      { type: 'turn', angleDeg: 50, length: 14, width: 10, color: 0x5ad1ff },
      { type: 'ramp', length: 11, angleDeg: 26, width: 10, color: 0xffd45c },
      { type: 'gap', length: 20 },
      { type: 'landingramp', length: 9, angleDeg: 18, width: 12, color: 0xffd45c, checkpoint: true },
      { type: 'turn', angleDeg: -35, length: 14, width: 11, color: NEON_COLOR },
      { type: 'ramp', length: 13, angleDeg: 30, width: 11, color: 0xff5c7a },
      { type: 'gap', length: 24 },
      { type: 'landingramp', length: 11, angleDeg: 20, width: 13, color: 0xff5c7a },
      { type: 'flat', length: 10, width: 13, color: NEON_COLOR },
      { type: 'bowlend', length: 7, angleDeg: 38, width: 13, color: 0xff5c7a },
      { type: 'flat', length: 0.1, width: 13, checkpoint: true, checkpointRadius: 8 },
    ],
  },
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || LEVELS[0];
}
