export const AIRCRAFT_SPECS = {
  trainer: {
    name: "AeroTrainer 172",
    type: "propeller",
    mass: 1040,          // Maximum takeoff weight (kg)
    emptyMass: 730,      // Empty weight (kg)
    wingArea: 16.2,      // Wing area S (m^2)
    wingspan: 11.0,      // Wingspan b (m)
    aspectRatio: 7.47,   // Aspect ratio AR
    oswaldEfficiency: 0.75, // e
    cd0: 0.027,          // Zero-lift parasite drag coefficient
    cl0: 0.31,           // Zero AoA lift coefficient
    clAlpha: 5.1,        // Lift curve slope per radian
    stallAoA: 0.279,     // Critical stall AoA in radians (~16 deg)
    maxThrust: 2400,     // Static maximum thrust in Newtons (~160 hp equivalent)
    pitchRate: 0.85,     // Pitch control authority
    rollRate: 1.4,       // Roll control authority
    yawRate: 0.45,       // Rudder authority
    gearHeight: 1.45,    // Main gear height offset from CG (m)
    vSpeeds: {
      vs0: 40,   // Stall speed with full flaps (knots)
      vs1: 48,   // Clean stall speed (knots)
      vr: 55,    // Rotation speed (knots)
      vx: 62,    // Best angle of climb (knots)
      vy: 74,    // Best rate of climb (knots)
      vfe: 85,   // Flap extension speed limit (knots)
      vno: 129,  // Normal operating limit (knots)
      vne: 163   // Never exceed speed (knots)
    }
  }
};
