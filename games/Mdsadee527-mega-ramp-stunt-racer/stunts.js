import * as CANNON from 'cannon-es';

const TWO_PI = Math.PI * 2;

// Tracks mid-air rotation to detect flips/rolls, scores them on landing,
// and runs a combo streak that resets on a bad (crashed) landing.
export class StuntTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.accumPitch = 0;
    this.accumRoll = 0;
    this.prevAirborne = false;
    this.combo = 1;
    this.totalScore = 0;
  }

  update(dt, chassisBody, airborne, airTime) {
    const events = [];

    if (airborne) {
      const invQ = chassisBody.quaternion.inverse();
      const worldAngVel = chassisBody.angularVelocity;
      const localAngVel = invQ.vmult(worldAngVel);
      this.accumPitch += Math.abs(localAngVel.x) * dt;
      this.accumRoll += Math.abs(localAngVel.z) * dt;
    }

    if (this.prevAirborne && !airborne) {
      // Just landed
      const flips = Math.floor(this.accumPitch / TWO_PI);
      const rolls = Math.floor(this.accumRoll / TWO_PI);

      const up = new CANNON.Vec3(0, 1, 0);
      const worldUp = chassisBody.quaternion.vmult(up);
      const uprightDot = worldUp.y; // 1 = perfectly upright
      const spinSpeed = chassisBody.angularVelocity.length();
      const clean = uprightDot > 0.72 && spinSpeed < 6;

      const hadTrick = flips > 0 || rolls > 0 || airTime > 1.1;

      if (hadTrick) {
        if (clean) {
          let points = flips * 150 + rolls * 150;
          if (flips === 0 && rolls === 0 && airTime > 1.1) points += 80; // Big Air
          points = Math.round(points * this.combo);
          this.totalScore += points;
          events.push({
            type: 'bank',
            points,
            combo: this.combo,
            label: describeTrick(flips, rolls, airTime),
          });
          this.combo = Math.min(this.combo + 0.5, 5);
        } else {
          const lost = Math.round((flips * 150 + rolls * 150) * this.combo);
          events.push({ type: 'crash', lostPoints: lost });
          this.combo = 1;
        }
      }

      this.accumPitch = 0;
      this.accumRoll = 0;
    }

    this.prevAirborne = airborne;
    return events;
  }
}

function describeTrick(flips, rolls, airTime) {
  const parts = [];
  if (flips > 0) parts.push(`${flips}x FLIP`);
  if (rolls > 0) parts.push(`${rolls}x BARREL ROLL`);
  if (parts.length === 0) parts.push('BIG AIR');
  return parts.join(' + ');
}
