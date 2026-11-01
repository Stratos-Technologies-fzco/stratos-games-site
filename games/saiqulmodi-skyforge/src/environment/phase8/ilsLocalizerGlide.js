// ILS for the active runway end (phase 8): localizer (full scale +-2.5 deg) and 3 deg glide slope
// (full scale +-0.7 deg) with the glide-path antenna 300 m past the threshold. Works for any runway end
// { thrX, thrZ, dirX, dirZ, y } (dir = landing direction). Range 35 km, approach side only.
const R2D = 180 / Math.PI;

export class ILSSystem {
  constructor() {
    this.locHalfDeg = 2.5;
    this.gsDeg = 3.0;
    this.gsHalfDeg = 0.7;
    this.rangeM = 35000;
  }

  computeGuidance(aircraftPos, end) {
    if (!end) return { inRange: false };
    const dx = aircraftPos.x - end.thrX, dz = aircraftPos.z - end.thrZ;
    const before = -(dx * end.dirX + dz * end.dirZ);       // metres before the threshold on the approach side
    const side = dx * -end.dirZ + dz * end.dirX;           // metres right (+) / left of the centreline, looking along the landing direction
    const gsDist = before + 300;
    if (before < 100 || before > this.rangeM) return { inRange: false };

    const locDeg = Math.atan2(side, gsDist) * R2D;
    const slopeDeg = Math.atan2(aircraftPos.y - (end.y || 0), gsDist) * R2D;
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    return {
      inRange: true,
      ident: `I-${end.icao.slice(1)}${end.ident}`,
      // Needle: + = steer right / fly up
      locDeviation: clamp(-locDeg / this.locHalfDeg),
      gsDeviation: clamp(-(slopeDeg - this.gsDeg) / this.gsHalfDeg),
      dmeNm: Math.hypot(dx, dz) / 1852
    };
  }
}
