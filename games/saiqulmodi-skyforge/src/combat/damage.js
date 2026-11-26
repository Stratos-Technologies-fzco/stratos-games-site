// The player's aircraft damage (fighter upgrade, phase 5, 09-Nov-2026): hits take health away; the aircraft gets worse
// in steps before it is lost, unless one hit is heavy enough on its own.
//   below 85 %: smoke trail        below 60 %: engine damaged (60 % power at most, no afterburner)
//   below 40 %: fire, stiff stick (half the control authority)        0 %: aircraft lost (eject)
export class DamageModel {
  constructor() { this.reset(); }
  reset() { this.health = 100; this.hits = 0; }
  get smoke() { return this.health < 85; }
  get engineHit() { return this.health < 60; }
  get powerMax() { return this.engineHit ? 0.6 : 1; }
  get fire() { return this.health < 40; }
  get stick() { return this.health < 40 ? 0.5 : 1; }
  get dead() { return this.health <= 0; }
}
