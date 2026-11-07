import * as CANNON from 'cannon-es';

const DEFAULT_GRAVITY = -24; // stronger than earth gravity: keeps arcade jump arcs snappy

export function createWorld() {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, DEFAULT_GRAVITY, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.solver.iterations = 20;
  world.defaultContactMaterial.friction = 0.4;
  return world;
}

export class CarController {
  constructor(world, carDef, startPos, startYawRad) {
    this.world = world;
    this.carDef = carDef;
    const s = carDef.scale;

    const stats = carDef.stats;
    this.maxEngineForce = 600 + (stats.accel / 100) * 1400;
    this.maxBrakeForce = 60;
    this.maxSteerVal = 0.42 + (stats.handling / 100) * 0.34;
    this.frictionSlip = 3.0 + (stats.handling / 100) * 3.0;
    this.maxSpeed = 16 + (stats.speed / 100) * 32; // m/s
    this.boostMaxSpeed = this.maxSpeed * 1.55;
    this.boostForceMult = 1.9;
    this.jumpPopScale = 0.4 + (stats.jump / 100) * 1.6;

    const chassisShape = new CANNON.Box(new CANNON.Vec3(1.0 * s, 0.5 * s, 2.0 * s));
    const chassisBody = new CANNON.Body({ mass: 150 * s });
    chassisBody.addShape(chassisShape, new CANNON.Vec3(0, 0.55 * s, 0));
    const q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), startYawRad);
    chassisBody.quaternion.copy(q);
    chassisBody.position.set(startPos.x, startPos.y, startPos.z);
    chassisBody.angularDamping = 0.5;
    chassisBody.linearDamping = 0.02;
    this.chassisBody = chassisBody;

    const vehicle = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });

    const wheelR = carDef.wheelRadius * s;
    const wheelOptions = {
      radius: wheelR,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.42 * s,
      frictionSlip: this.frictionSlip,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.02,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
      maxSuspensionTravel: 0.35 * s,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    const connections = [
      new CANNON.Vec3(-0.95 * s, 0.1 * s, 1.25 * s),  // front-left
      new CANNON.Vec3(0.95 * s, 0.1 * s, 1.25 * s),   // front-right
      new CANNON.Vec3(-0.95 * s, 0.1 * s, -1.15 * s), // rear-left
      new CANNON.Vec3(0.95 * s, 0.1 * s, -1.15 * s),  // rear-right
    ];
    for (const c of connections) {
      wheelOptions.chassisConnectionPointLocal = c;
      vehicle.addWheel({ ...wheelOptions });
    }

    vehicle.addToWorld(world);
    this.vehicle = vehicle;

    this.wasAirborne = false;
    this.wasOnRamp = false;
    this.airTime = 0;
    this.lastFellThroughVoid = false;
  }

  isAirborne() {
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      if (this.vehicle.wheelInfos[i].isInContact) return false;
    }
    return true;
  }

  getGroundNormalY() {
    let sum = 0, count = 0;
    for (const w of this.vehicle.wheelInfos) {
      if (w.isInContact && w.raycastResult && w.raycastResult.hitNormalWorld) {
        sum += w.raycastResult.hitNormalWorld.y;
        count++;
      }
    }
    return count > 0 ? sum / count : 1;
  }

  update(dt, controls) {
    const airborne = this.isAirborne();
    const groundNormalY = this.getGroundNormalY();
    const onRamp = !airborne && groundNormalY < 0.97;

    // --- Ground driving ---
    const steerInput = (controls.left ? 1 : 0) - (controls.right ? 1 : 0);
    const throttleInput = (controls.forward ? 1 : 0) - (controls.backward ? 1 : 0);

    if (!airborne) {
      const steerVal = -steerInput * this.maxSteerVal;
      this.vehicle.setSteeringValue(steerVal, 0);
      this.vehicle.setSteeringValue(steerVal, 1);

      const boosting = controls.boost && controls.boostFuel > 0;
      const forceScale = boosting ? this.boostForceMult : 1;
      const engineForce = -throttleInput * this.maxEngineForce * forceScale;

      for (const idx of [2, 3]) {
        this.vehicle.applyEngineForce(engineForce, idx);
      }

      const braking = controls.backward && this._forwardSpeed() > 0.5;
      for (const idx of [0, 1, 2, 3]) {
        this.vehicle.setBrake(braking ? this.maxBrakeForce : 0, idx);
      }

      // Speed clamp
      const maxSpd = boosting ? this.boostMaxSpeed : this.maxSpeed;
      const vel = this.chassisBody.velocity;
      const speed = vel.length();
      if (speed > maxSpd) {
        vel.scale(maxSpd / speed, vel);
      }
    } else {
      // No ground drive force while airborne; wheels free-spin visually only.
      for (const idx of [0, 1, 2, 3]) {
        this.vehicle.applyEngineForce(0, idx);
        this.vehicle.setBrake(0, idx);
      }
      // --- Air control: W/S pitch (flip), A/D roll (barrel roll) ---
      const rotAccel = 4.2;
      const pitchAxis = this.chassisBody.vectorToWorldFrame(new CANNON.Vec3(1, 0, 0));
      const rollAxis = this.chassisBody.vectorToWorldFrame(new CANNON.Vec3(0, 0, 1));
      if (controls.forward) {
        this.chassisBody.angularVelocity.x += pitchAxis.x * rotAccel * dt;
        this.chassisBody.angularVelocity.y += pitchAxis.y * rotAccel * dt;
        this.chassisBody.angularVelocity.z += pitchAxis.z * rotAccel * dt;
      }
      if (controls.backward) {
        this.chassisBody.angularVelocity.x -= pitchAxis.x * rotAccel * dt;
        this.chassisBody.angularVelocity.y -= pitchAxis.y * rotAccel * dt;
        this.chassisBody.angularVelocity.z -= pitchAxis.z * rotAccel * dt;
      }
      if (controls.left) {
        this.chassisBody.angularVelocity.x += rollAxis.x * rotAccel * dt;
        this.chassisBody.angularVelocity.y += rollAxis.y * rotAccel * dt;
        this.chassisBody.angularVelocity.z += rollAxis.z * rotAccel * dt;
      }
      if (controls.right) {
        this.chassisBody.angularVelocity.x -= rollAxis.x * rotAccel * dt;
        this.chassisBody.angularVelocity.y -= rollAxis.y * rotAccel * dt;
        this.chassisBody.angularVelocity.z -= rollAxis.z * rotAccel * dt;
      }
    }

    // Boost forward impulse (works both grounded and airborne for trick mobility)
    if (controls.boost && controls.boostFuel > 0) {
      const fwd = this.chassisBody.vectorToWorldFrame(new CANNON.Vec3(0, 0, 1));
      const boostForce = 18 * this.carDef.scale;
      this.chassisBody.velocity.x += fwd.x * boostForce * dt;
      this.chassisBody.velocity.y += fwd.y * boostForce * dt * 0.3;
      this.chassisBody.velocity.z += fwd.z * boostForce * dt;
    }

    // Ramp "pop": leaving a sloped surface gets an extra vertical kick scaled by the car's jump stat.
    if (this.wasOnRamp && airborne) {
      const speed = this._forwardSpeed();
      const pop = Math.min(speed * 0.35, 9) * this.jumpPopScale;
      this.chassisBody.velocity.y += pop;
    }

    if (airborne) this.airTime += dt; else this.airTime = 0;

    this.wasAirborne = airborne;
    this.wasOnRamp = onRamp;

    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
    }

    return { airborne, airTime: this.airTime, groundNormalY };
  }

  getWheelTransforms() {
    return this.vehicle.wheelInfos.map(w => ({
      position: w.worldTransform.position,
      quaternion: w.worldTransform.quaternion,
    }));
  }

  _forwardSpeed() {
    const fwd = this.chassisBody.vectorToWorldFrame(new CANNON.Vec3(0, 0, 1));
    return this.chassisBody.velocity.dot(fwd);
  }

  teleport(pos, yawRad) {
    this.chassisBody.position.set(pos.x, pos.y, pos.z);
    this.chassisBody.velocity.set(0, 0, 0);
    this.chassisBody.angularVelocity.set(0, 0, 0);
    const q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), yawRad);
    this.chassisBody.quaternion.copy(q);
    for (const w of this.vehicle.wheelInfos) {
      w.suspensionLength = w.suspensionRestLength;
    }
  }

  getSpeedKmh() {
    return this.chassisBody.velocity.length() * 3.6;
  }
}
