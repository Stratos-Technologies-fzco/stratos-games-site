import * as THREE from 'three';

// Wind + gusts (phase 7). World axes: -X = north, -Z = east, y = up.
// Wind "from" a compass direction blows towards the opposite one; speed grows with height above ground
// (boundary layer) and gusts come from two slow sine waves.
export class AtmosphereEngine {
  constructor() {
    this.windOriginDeg = 290;
    this.baseSpeedKts = 6;
    this.gustSpeedKts = 4;
    this.windVector = new THREE.Vector3(); // m/s, world space
    this.gustNoise = 0;
  }

  set(fromDeg, speedKts, gustKts) {
    this.windOriginDeg = fromDeg;
    this.baseSpeedKts = speedKts;
    this.gustSpeedKts = gustKts;
  }

  update(timeSec, aglMeters) {
    const altitudeFactor = Math.min(1.6, 0.55 + Math.log10(Math.max(10, aglMeters)) * 0.25);
    this.gustNoise = Math.sin(timeSec * 0.4) * 0.6 + Math.sin(timeSec * 1.1 + 1.3) * 0.4;
    const currentSpeedKts = (this.baseSpeedKts + Math.max(0, this.gustNoise) * this.gustSpeedKts) * altitudeFactor;
    const speedMs = currentSpeedKts * 0.514444;
    const rad = THREE.MathUtils.degToRad(this.windOriginDeg);
    // Towards (from + 180): north component -cos(from), east component -sin(from); world x = -north, z = -east
    this.windVector.set(Math.cos(rad) * speedMs, 0, Math.sin(rad) * speedMs);
    return {
      vector: this.windVector,
      fromDeg: this.windOriginDeg,
      speedKts: currentSpeedKts,
      gustDeltaKts: this.gustNoise * this.gustSpeedKts
    };
  }

  // Angle between the ground track and the heading caused by the wind (radians)
  computeDriftAngle(airVelocity) {
    const groundTrack = Math.atan2(airVelocity.x + this.windVector.x, airVelocity.z + this.windVector.z);
    const airTrack = Math.atan2(airVelocity.x, airVelocity.z);
    return groundTrack - airTrack;
  }
}
