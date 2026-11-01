// Route to the destination runway end (stage 4: any airport to any airport; default = back to the departure runway).
// Return-to-land route for the active runway end (any South India airport; VOBL 09L by default).
// Worked out in the runway's own frame: u = metres before the threshold along the approach (positive on the
// approach side), v = metres to the side of the extended centreline. The route mirrors a straight-in arrival:
//   JOIN (only when the aircraft is not already on the approach side near the centreline)
//   -> IF  (intermediate fix, 11 km before the threshold, 1,800 ft above the field)
//   -> FAF (final approach fix, 6 km, on the 3 degree glide path ~1,000 ft above the field)
//   -> runway threshold (touchdown aim 400 m beyond)
// Waypoint altitudes are feet above sea level.
const FT_PER_M = 3.28084;
const GLIDE = Math.tan(3 * Math.PI / 180);
const CAPTURE_M = 700; // waypoint passed when this close (horizontal)

// Default: VOBL runway 09L (threshold x 0, z +2000, landing towards -Z, field 3,002 ft)
const VOBL_09L = { icao: 'VOBL', ident: '09L', thrX: 0, thrZ: 2000, dirX: 0, dirZ: -1, elevFt: 3002 };

// Compass bearing (deg, 0 = north) from a to b in world x/z
export function bearingDeg(ax, az, bx, bz) {
  const north = -(bx - ax);
  const east = -(bz - az);
  return (Math.atan2(east, north) * 180 / Math.PI + 360) % 360;
}

// World x, z -> runway frame { u, v }
function toRunway(end, x, z) {
  const dx = x - end.thrX, dz = z - end.thrZ;
  return { u: -(dx * end.dirX + dz * end.dirZ), v: dx * -end.dirZ + dz * end.dirX };
}

function waypoint(end, name, v, u, aboveFieldFt) {
  return {
    name, u, v,
    x: end.thrX - end.dirX * u - end.dirZ * v,
    z: end.thrZ - end.dirZ * u + end.dirX * v,
    altFt: Math.round((end.elevFt + aboveFieldFt) / 10) * 10
  };
}

export function planReturnRoute(x, z, end = VOBL_09L) {
  const fixes = [
    waypoint(end, 'IF', 0, 11000, 1800),
    waypoint(end, 'FAF', 0, 6000, Math.round(6000 * GLIDE * FT_PER_M)),
    waypoint(end, `RW${end.ident}`, 0, 0, 50)
  ];
  const p = toRunway(end, x, z);
  // Already on the approach side inside a 30 degree cone of the centreline: carry on with the fixes ahead
  const inCone = p.u > 3000 && Math.abs(p.v) < p.u * Math.tan(30 * Math.PI / 180);
  if (inCone) return fixes.filter((f) => f.u < p.u - 500);
  // Otherwise join beside the extended centreline on the aircraft's side (like a downwind leg)
  const side = p.v >= 0 ? 1 : -1;
  return [waypoint(end, 'JOIN', side * 4000, 13000, 2500), ...fixes];
}

// Route between airports (stage 4): TOC (top of climb) -> en-route points every ~60 km at the cruise
// altitude -> TOD (top of descent, 3 NM per 1,000 ft) -> the destination's arrival fixes (JOIN / IF / FAF / RW).
// Cruise is raised to clear the highest ground along the track by 2,000 ft and lowered when the trip is
// too short to reach it. Short trips (< 30 km to the arrival) use the plain arrival route.
const CLIMB_M_PER_FT = 3.704;   // 2 NM per 1,000 ft
const DESC_M_PER_FT = 5.556;    // 3 NM per 1,000 ft
const LEG_M = 60000;

export function planFlightRoute(x, z, altFt, end, cruiseFt, groundFtAt = null) {
  // Arrival fixes as seen from 30 km out on the line towards the aircraft
  const dx = x - end.thrX, dz = z - end.thrZ;
  const dl = Math.hypot(dx, dz) || 1;
  const arrival = planReturnRoute(end.thrX + dx / dl * 30000, end.thrZ + dz / dl * 30000, end);
  const a0 = arrival[0];
  const D = Math.hypot(a0.x - x, a0.z - z);
  if (D < 30000) return planReturnRoute(x, z, end);

  // Minimum safe altitude along the track
  let msa = 0;
  if (groundFtAt) {
    for (let d = 0; d <= D; d += 2000) {
      const t = d / D;
      msa = Math.max(msa, groundFtAt(x + (a0.x - x) * t, z + (a0.z - z) * t));
    }
  }
  let cruise = Math.max(cruiseFt, Math.ceil((msa + 2000) / 500) * 500);
  const climbM = (c) => Math.max(0, c - altFt) * CLIMB_M_PER_FT;
  const descM = (c) => Math.max(0, c - a0.altFt) * DESC_M_PER_FT;
  while (climbM(cruise) + descM(cruise) > D * 0.9 && cruise - 500 >= Math.max(a0.altFt + 1000, msa + 1500)) cruise -= 500;

  const ux = (a0.x - x) / D, uz = (a0.z - z) / D;
  const at = (d, name) => ({ name, x: x + ux * d, z: z + uz * d, u: Infinity, v: 1, altFt: cruise });
  const tocD = Math.min(D * 0.45, Math.max(4000, climbM(cruise)));
  const todD = Math.max(tocD + 2000, D - descM(cruise));
  const pts = [at(tocD, 'TOC')];
  const legs = Math.floor((todD - tocD) / LEG_M);
  for (let i = 1; i <= legs; i++) {
    const d = tocD + (todD - tocD) * i / (legs + 1);
    pts.push(at(d, `WP${i}`));
  }
  pts.push(at(todD, 'TOD'));
  return [...pts, ...arrival];
}

export class NavComputer {
  constructor() {
    this.route = null;
    this.index = 0;
    this.end = VOBL_09L;
    this.cruiseFt = 9500;
    this.groundFtAt = null; // (x, z) -> ground elevation in feet AMSL (for the safe cruise altitude)
  }

  // Route to this runway end from now on (the next update re-plans)
  setRunway(end) {
    this.end = end;
    this.route = null;
  }

  setCruise(ft) { this.cruiseFt = ft; this.route = null; }

  replan(x, z, altFt = this.end.elevFt) {
    this.route = planFlightRoute(x, z, altFt, this.end, this.cruiseFt, this.groundFtAt);
    this.index = 0;
  }

  // state: sim state; headingDeg: current heading; altFt: altitude above sea level.
  // Returns nav data for map / MFD / HUD, or null on the ground.
  update(state, headingDeg, altFt) {
    if (state.onGround && state.ias < 40) {
      // Parked or rolled out: the next take-off plans a fresh route
      if (this.route && this.index >= this.route.length) this.route = null;
      if (!this.route) return null;
    }
    if (!this.route) this.replan(state.pos.x, state.pos.z, altFt);

    let wp = this.route[Math.min(this.index, this.route.length - 1)];
    const dist = Math.hypot(wp.x - state.pos.x, wp.z - state.pos.z);
    // Sequence: passed when close, or when abeam (already beyond it along the inbound course / the leg)
    const isLast = this.index >= this.route.length - 1;
    const p = toRunway(this.end, state.pos.x, state.pos.z);
    let passed = dist < CAPTURE_M || (this.index > 0 && wp.v === 0 && p.u < wp.u && Math.abs(p.v) < 1500);
    if (!passed && wp.u === Infinity) {
      // En-route point: passed once the aircraft is beyond the line through it, square to the leg
      const prev = this.index > 0 ? this.route[this.index - 1] : null;
      const next = this.route[this.index + 1];
      const ax = next ? next.x - (prev ? prev.x : wp.x) : 0, az = next ? next.z - (prev ? prev.z : wp.z) : 0;
      passed = !!next && ((state.pos.x - wp.x) * ax + (state.pos.z - wp.z) * az) > 0 && dist < 15000;
    }
    if (!isLast && passed) {
      this.index++;
      wp = this.route[this.index];
    }
    if (isLast && state.onGround) this.index = this.route.length; // landed: route complete

    const d = Math.hypot(wp.x - state.pos.x, wp.z - state.pos.z);
    const brg = bearingDeg(state.pos.x, state.pos.z, wp.x, wp.z);
    let turn = brg - headingDeg;
    turn = ((turn + 540) % 360) - 180;
    const gsMs = Math.max(1, Math.hypot(state.vel.x, state.vel.z));

    // Remaining route length (for the total ETA)
    let remaining = d;
    for (let i = this.index + 1; i < this.route.length; i++) {
      const a = this.route[i - 1], b = this.route[i];
      remaining += Math.hypot(b.x - a.x, b.z - a.z);
    }
    return {
      route: this.route,
      index: Math.min(this.index, this.route.length - 1),
      complete: this.index >= this.route.length,
      destination: `${this.end.icao} ${this.end.ident}`,
      name: wp.name,
      bearing: brg,
      turn,
      distM: d,
      distNm: d / 1852,
      etaSec: d / gsMs,
      totalEtaSec: remaining / gsMs,
      remainingNm: remaining / 1852,
      targetAltFt: wp.altFt,
      altFt
    };
  }
}
