export class RunwayFrictionModel {
  constructor() {
    this.baseDryMu = 0.80;    // Dry asphalt/grooved concrete
    this.monsoonWetMu = 0.38; // Standing water / wet rubber
    this.hydroplaneMu = 0.12; // Dynamic hydroplaning limit
  }

  // Returns effective braking deceleration friction coefficient (mu)
  getBrakingMu(groundSpeedKts, isRainActive = true) {
    if (!isRainActive) return this.baseDryMu;

    // Critical dynamic hydroplaning speed: ~9 * sqrt(tire_psi)
    // For transport category (~160 PSI) = ~114 kts
    const hydroplaneThreshold = 110;

    if (groundSpeedKts > hydroplaneThreshold) {
      return this.hydroplaneMu;
    }

    // Blend between wet traction and hydroplaning onset
    const ratio = groundSpeedKts / hydroplaneThreshold;
    return this.monsoonWetMu - ratio * (this.monsoonWetMu - this.hydroplaneMu);
  }
}
