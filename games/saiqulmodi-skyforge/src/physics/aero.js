import * as THREE from 'three';

export class AeroEngine6DOF {
  constructor(specs, startPos = new THREE.Vector3(0, 1.45, 0)) {
    this.specs = specs;
    this.position = startPos.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion().setFromEuler(this.rotation);

    this.angularVelocity = new THREE.Vector3(0, 0, 0);

    this.throttle = 1.0;
    this.brakes = 0.0;
    this.rpm = 2400;
    this.iasKnots = 0;
    this.altitudeFt = 0;
    this.vsiFpm = 0;
    this.aoaDeg = 0;
    this.isStalled = false;
    this.isOnGround = true;

    this._forward = new THREE.Vector3();
    this._up = new THREE.Vector3();
    this._vLocal = new THREE.Vector3();
  }

  update(dt, controls) {
    if (this.specs.rotorcraft) return this.updateRotorcraft(dt, controls);

    // --- ENFORCED GROUND IMPACT / CRASH DETECTOR ---
    const currentAlt = (this.position && typeof this.position.y === 'number') ? this.position.y : 0;
    const currentSpeedKt = (this.velocity) ? this.velocity.length() * 1.94384 : 0;

    // Trigger crash if contacting ground outside gentle landing limits
    if (currentAlt <= 1.5) {
      const isUncontrolled = currentSpeedKt > 140 || Math.abs(this.velocity.y) > 3.0;
      if (isUncontrolled && !this.isCrashed) {
        this.isCrashed = true;
        this.velocity.set(0, 0, 0);
        this.throttle = 0;
        if (this.angularVelocity) this.angularVelocity.set(0, 0, 0);

        // Fire global catastrophic crash event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('aircraft-crash', {
            detail: { speedKt: currentSpeedKt, alt: currentAlt }
          }));
        }
      }
    }
    // ==========================================
    // COMPREHENSIVE AERODYNAMIC LIMITS ENGINE
    // ==========================================
    const speedMs = this.velocity ? this.velocity.length() : 0;
    const speedKt = speedMs * 1.94384;
    const altitudeFt = this.position ? this.position.y * 3.28084 : 0;
    const mach = speedKt / 661.0;
    
    // 1. Angle of Attack (AoA) Calculation
    let aoaDeg = 0;
    if (speedMs > 5) {
      const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion);
      const velNorm = this.velocity.clone().normalize();
      const dot = Math.max(-1, Math.min(1, forwardVec.dot(velNorm)));
      aoaDeg = Math.acos(dot) * (180 / Math.PI);
    }

    // 2. Critical Alpha Stall Trigger
    if (aoaDeg > 18.0 && altitudeFt > 20) {
      // Aerodynamic stall: induce buffeting drop and kill forward lift
      this.velocity.y -= 9.81 * 1.5 * 0.016;
      this.velocity.multiplyScalar(0.98); // Massive induced drag spike
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('stall-warning', { detail: { aoa: aoaDeg, speedKt } }));
      }
    }

    // 3. Dynamic Pressure (Q) Structural Airframe Breakup (Vne Limit)
    // Sea-level limit: 750 KT indicated (destroys airframe if exceeded at 4 FT altitude)
    if (altitudeFt < 5000 && speedKt > 750) {
      this.isCrashed = true;
      this.velocity.set(0, 0, 0);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('aircraft-crash', {
          detail: { speedKt, sinkRate: 0, reason: "AIRFRAME BREAKUP: DYNAMIC PRESSURE EXCEEDED Vne" }
        }));
      }
    }

    // 4. Compressibility & Wave Drag Surge (Mach 0.85 -> 1.2)
    if (mach > 0.85 && mach < 1.2) {
      // Add heavy transonic wave drag unless Stage 2 Afterburner is pushed
      const waveDragFactor = (this.throttle > 0.8) ? 0.995 : 0.96;
      this.velocity.multiplyScalar(waveDragFactor);
    }

    // 5. Ground Effect (Cushioning Lift within 15 meters)
    if (this.position && this.position.y > 0.5 && this.position.y < 15.0) {
      const heightAboveGround = this.position.y;
      const groundEffectBonus = (1.0 - (heightAboveGround / 15.0)) * 4.5;
      this.velocity.y += groundEffectBonus * 0.016; // Induced drag reduction cushion
    }
    // Ground Impact / Crash Collision Check
    const groundLevel = 0.5;
    if (this.position.y <= groundLevel) {
      const sinkRate = -this.velocity.y; // m/s downward
      const speed = this.velocity.length();
      
      // Pitch/Roll limits for acceptable touchdown (radians)
      const euler = new THREE.Euler().setFromQuaternion(this.quaternion, 'YXZ');
      const pitchDeg = Math.abs(euler.x * 180 / Math.PI);
      const rollDeg = Math.abs(euler.z * 180 / Math.PI);

      // Safe landing conditions: low sink rate, wings level, nose slightly up, wheels down
      const isHardImpact = sinkRate > 6.0 || speed > 120 || pitchDeg > 20 || rollDeg > 15;

      if (isHardImpact) {
        this.isCrashed = true;
        this.velocity.set(0, 0, 0);
        this.throttle = 0;
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('aircraft-crash', { 
            detail: { sinkRate: sinkRate * 196.85, speedKt: speed * 1.94, pitch: pitchDeg, roll: rollDeg } 
          }));
        }
      } else {
        // Safe rolling / touchdown friction
        this.position.y = groundLevel;
        this.velocity.y = 0;
      }
    }
    this.throttle = THREE.MathUtils.clamp(controls.throttle, 0.0, 1.0);
    this.brakes = controls.brakes ? 1.0 : 0.0;

    const targetRPM = 750 + this.throttle * 1950;
    this.rpm += (targetRPM - this.rpm) * Math.min(dt * 4.0, 1.0);

    // Forward direction of aircraft (+Z axis)
    this._forward.set(0, 0, 1).applyQuaternion(this.quaternion);
    this._up.set(0, 1, 0).applyQuaternion(this.quaternion);

    // Velocity in local aircraft coordinate frame
    this._vLocal.copy(this.velocity).applyQuaternion(this.quaternion.clone().invert());
    const forwardSpeed = this._vLocal.z;
    const verticalAirflow = -this._vLocal.y;
    const totalSpeed = this.velocity.length();

    // Dynamic Pressure & Telemetry
    const dynamicPressure = 0.5 * 1.225 * totalSpeed * totalSpeed;
    this.iasKnots = totalSpeed * 1.94384;
    this.altitudeFt = this.position.y * 3.28084;
    this.vsiFpm = this.isOnGround ? 0 : this.velocity.y * 196.85;

    // Angle of Attack (AoA)
    let aoa = 0;
    if (Math.abs(forwardSpeed) > 1.5) {
      aoa = Math.atan2(verticalAirflow, Math.max(0.1, forwardSpeed));
    }
    this.aoaDeg = THREE.MathUtils.radToDeg(aoa);

    // Lift & Drag Coefficients
    let cl = this.specs.cl0 + this.specs.clAlpha * aoa;
    if (Math.abs(aoa) > this.specs.stallAoA) {
      this.isStalled = true;
      cl *= 0.35;
    } else {
      this.isStalled = false;
    }

    const cd = this.specs.cd0 + (cl * cl) / (Math.PI * this.specs.oswaldEfficiency * this.specs.aspectRatio);
    const liftForce = dynamicPressure * this.specs.wingArea * cl;
    const dragForce = dynamicPressure * this.specs.wingArea * cd;
    
    // Engine thrust: 4200 N static thrust for clean runway roll
    const thrustForce = (this.rpm / 2700.0) * 4200;

    const worldForces = new THREE.Vector3();
    worldForces.addScaledVector(this._up, liftForce);

    // Aerodynamic drag opposing flight path
    if (totalSpeed > 0.1) {
      worldForces.addScaledVector(this.velocity.clone().normalize(), -dragForce);
    }

    // Engine thrust along heading
    worldForces.addScaledVector(this._forward, thrustForce);

    // Gravity
    const gravityForce = this.specs.mass * 9.80665;
    worldForces.y -= gravityForce;

    // Ground contact & normal force
    const gearGroundLevel = 1.45; // renamed: a second `const groundLevel` in this scope was a SyntaxError
    if (this.position.y <= gearGroundLevel) {
      this.isOnGround = true;
      this.position.y = gearGroundLevel;

      // Cancel gravity sink when resting on the runway
      if (worldForces.y < 0) {
        worldForces.y = 0;
      }
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }

      // Rolling friction
      const rollingCoeff = 0.015 + (this.brakes * 0.5);
      const netNormal = Math.max(0, gravityForce - liftForce);
      const frictionMagnitude = netNormal * rollingCoeff;

      if (forwardSpeed > 0.1) {
        worldForces.addScaledVector(this._forward, -frictionMagnitude);
      }
    } else {
      this.isOnGround = false;
    }

    // Linear Integration
    const acceleration = worldForces.divideScalar(this.specs.mass);
    this.velocity.addScaledVector(acceleration, dt);

    if (this.isOnGround && this.brakes > 0.5 && this.velocity.length() < 0.5 && this.throttle < 0.1) {
      this.velocity.set(0, 0, 0);
    }

    this.position.addScaledVector(this.velocity, dt);

    // Rotational flight control authority
    const controlFactor = Math.min(1.0, Math.max(0.2, dynamicPressure / 250.0));
    const targetPitchRate = -controls.pitch * this.specs.pitchRate * controlFactor;
    const targetRollRate = -controls.roll * this.specs.rollRate * controlFactor;
    let targetYawRate = -controls.yaw * this.specs.yawRate * controlFactor;

    if (this.isOnGround) {
      targetYawRate += -controls.yaw * 0.5;
    }

    this.angularVelocity.x += (targetPitchRate - this.angularVelocity.x) * dt * 6.0;
    this.angularVelocity.y += (targetYawRate - this.angularVelocity.y) * dt * 5.0;
    this.angularVelocity.z += (targetRollRate - this.angularVelocity.z) * dt * 7.0;

    const deltaRot = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(this.angularVelocity.x * dt, this.angularVelocity.y * dt, this.angularVelocity.z * dt, 'YXZ')
    );
    this.quaternion.multiply(deltaRot);
    this.quaternion.normalize();

    // --- Ground Impact Tripwire --- (was pasted after the class at module level, which threw on import)
    if (this.altitude <= 5 && (this.airspeed > 180 || Math.abs(this.pitch) > 0.35 || Math.abs(this.roll) > 0.45)) {
        if (typeof this.triggerCrash === 'function') {
            this.triggerCrash('HIGH_SPEED_GROUND_IMPACT');
        } else if (typeof window.triggerExplosion === 'function') {
            window.triggerExplosion(this.position);
        } else {
            console.warn('[CRASH] High-speed ground impact at ' + Math.round(this.airspeed) + ' KT!');
            this.throttle = 0;
            this.airspeed = 0;
            if (this.resetFlight) this.resetFlight();
        }
    }
  }

  // Swap the flight profile (FleetManager pushes the active aircraft's profile here)
  setProfile(profile) {
    this.specs = { ...this.specs, ...profile };
  }

  // Rotorcraft branch: separate from the fixed-wing maths above
  updateRotorcraft(dt, controls) {
    this.rotation.setFromQuaternion(this.quaternion, 'YXZ');
    const s = { pos: this.position, vel: this.velocity, rot: this.rotation, power: (controls.throttle || 0) * 100, onGround: this.isOnGround };
    stepRotorcraft(s, { pitch: -(controls.pitch || 0), roll: controls.roll || 0, yaw: -(controls.yaw || 0) }, this.specs, dt);
    this.isOnGround = s.onGround;
    this.position.addScaledVector(this.velocity, dt);
    this.quaternion.setFromEuler(this.rotation);
    this.iasKnots = this.velocity.length() * 1.94384;
    this.altitudeFt = this.position.y * 3.28084;
    this.vsiFpm = this.velocity.y * 196.85;
  }
}

// ==========================================
// ACTIVE FLIGHT PROFILE (pushed by FleetManager, read by the flight loop)
// ==========================================
let activeFlightProfile = null;

export function setFlightProfile(profile) {
  activeFlightProfile = profile;
}

export function getFlightProfile() {
  return activeFlightProfile;
}

// ==========================================
// ROTORCRAFT FLIGHT MODEL
// collective (power) = rotor thrust along the disc axis, cyclic = disc / fuselage tilt,
// pedals = yaw. Attitude self-levels when the cyclic is centred and air drag damps
// both climb rate and drift, so a centred cyclic at hover collective holds a stable hover.
// s: { pos, vel, rot (Euler 'YXZ'), power 0-100, onGround } - updates s.vel, s.rot, s.onGround (not s.pos)
// input: { pitch: +1 = cyclic aft (nose up), roll: +1 = right, yaw: +1 = left pedal }
// ==========================================
const _discUp = new THREE.Vector3();

// groundY: terrain height under the aircraft (world y), 0 on the VOBL field
export function stepRotorcraft(s, input, p, dt, groundY = 0) {
  const tilt = p.maxCyclicTilt;
  const onGround = s.pos.y <= groundY + p.groundHeight + 0.01;

  // Cyclic tilts the disc towards a target attitude; pedals yaw the airframe
  const targetPitch = onGround ? Math.max(0, input.pitch * tilt * 0.2) : input.pitch * tilt;
  const targetRoll = onGround ? 0 : -input.roll * tilt;
  const k = Math.min(1, p.attitudeResponse * dt);
  s.rot.x += (targetPitch - s.rot.x) * k;
  s.rot.z += (targetRoll - s.rot.z) * k;
  s.rot.y += input.yaw * p.maxYawRate * dt;

  // Rotor thrust along the disc axis minus gravity
  const thrust = (s.power / 100) * p.liftAccel;
  _discUp.set(0, 1, 0).applyEuler(s.rot);
  s.vel.addScaledVector(_discUp, thrust * dt);
  s.vel.y -= 9.81 * dt;

  // Air drag: horizontal drift and vertical rate both decay
  s.vel.x -= s.vel.x * p.horizontalDrag * dt;
  s.vel.z -= s.vel.z * p.horizontalDrag * dt;
  s.vel.y -= s.vel.y * p.verticalDamping * dt;

  if (onGround && s.vel.y <= 0) {
    s.vel.y = 0;
    s.vel.x *= 0.9;
    s.vel.z *= 0.9;
    s.onGround = true;
  } else {
    s.onGround = false;
  }
}
