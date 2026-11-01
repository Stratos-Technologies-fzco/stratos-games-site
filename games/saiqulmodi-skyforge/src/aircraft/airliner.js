import * as THREE from 'three';
import { addSurface, addGearLeg, deflectSurfaces, disposeObject } from './airframeKit.js';

// High-wing tactical cargo transport: 4 underwing turbofans, T-tail, rear cargo ramp (key R, below 150 kt).
// Procedural geometry only. Nose towards -Z, origin 2.2 m above the runway when parked.
const RAMP_CLOSED = -0.38; // flush with the upswept tail underside
const RAMP_OPEN = 0.17;    // trailing edge on the runway
const RAMP_MAX_KT = 150;

export function createAirliner() {
  const mesh = new THREE.Group();
  mesh.name = 'aircraft_airliner';

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5a636a, roughness: 0.6, metalness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2e3338, roughness: 0.5, metalness: 0.4 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0b1620, roughness: 0.15, metalness: 0.8 });
  const intakeMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });

  // Fuselage, nose and upswept tail cone
  const bodyGeo = new THREE.CylinderGeometry(2.0, 2.0, 20, 24);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, skinMat);
  body.position.set(0, 0.6, -1.0);
  mesh.add(body);

  const noseGeo = new THREE.SphereGeometry(2.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  noseGeo.rotateX(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.scale.set(1, 1, 1.4);
  nose.position.set(0, 0.6, -11.0);
  mesh.add(nose);

  const windscreen = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.2), glassMat);
  windscreen.position.set(0, 1.85, -11.6);
  windscreen.rotation.x = -0.45;
  mesh.add(windscreen);

  const tailGeo = new THREE.CylinderGeometry(0.6, 2.0, 6, 24);
  tailGeo.rotateX(Math.PI / 2);
  const tailCone = new THREE.Mesh(tailGeo, skinMat);
  tailCone.position.set(0, 1.1, 12.0);
  tailCone.rotation.x = -0.17;
  mesh.add(tailCone);

  // Main gear sponsons along the lower fuselage
  [-1, 1].forEach((s) => {
    const sponson = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 5.0), skinMat);
    sponson.position.set(s * 1.85, -0.9, 0.5);
    mesh.add(sponson);
  });

  // High shoulder wing, swept halves
  const wingRoots = [];
  [-1, 1].forEach((s) => {
    const root = new THREE.Group();
    root.position.set(0, 2.55, -1.5);
    root.rotation.y = s * -0.12;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.4, 4.0), skinMat);
    wing.position.set(s * 7.75, 0, 0);
    root.add(wing);
    mesh.add(root);
    wingRoots.push(root);
  });
  const surfaces = {
    aileronL: addSurface(wingRoots[0], skinMat, 4.5, 0.25, 0.8, -12.0, 0, 2.0),
    aileronR: addSurface(wingRoots[1], skinMat, 4.5, 0.25, 0.8, 12.0, 0, 2.0)
  };

  // 4 underwing turbofans on pylons
  [-9.5, -5.0, 5.0, 9.5].forEach((x) => {
    const holder = new THREE.Group();
    holder.position.set(x, 2.55, -1.5 + Math.abs(x) * 0.12);
    const nacelleGeo = new THREE.CylinderGeometry(0.75, 0.6, 3.4, 16);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelle = new THREE.Mesh(nacelleGeo, darkMat);
    nacelle.position.set(0, -1.3, -1.2);
    const intakeGeo = new THREE.CircleGeometry(0.68, 16);
    intakeGeo.rotateY(Math.PI);
    const intake = new THREE.Mesh(intakeGeo, intakeMat);
    intake.position.set(0, -1.3, -2.91);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 2.2), skinMat);
    pylon.position.set(0, -0.55, -0.9);
    holder.add(nacelle, intake, pylon);
    mesh.add(holder);
  });

  // T-tail
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.0, 3.4), skinMat);
  fin.position.set(0, 4.3, 13.2);
  fin.rotation.x = 0.25;
  mesh.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.3, 2.4), skinMat);
  stab.position.set(0, 6.75, 14.6);
  mesh.add(stab);
  surfaces.elevator = addSurface(mesh, skinMat, 9.0, 0.2, 0.8, 0, 6.75, 15.8);
  surfaces.rudder = addSurface(mesh, skinMat, 0.3, 3.6, 0.9, 0, 4.0, 14.6);

  // Rear cargo ramp, hinged at the bottom of the fuselage where the tail sweeps up
  const ramp = new THREE.Group();
  ramp.position.set(0, -1.45, 9.0);
  const rampPlate = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.15, 4.5), darkMat);
  rampPlate.position.z = 2.25;
  ramp.add(rampPlate);
  ramp.rotation.x = RAMP_CLOSED;
  mesh.add(ramp);

  // Fixed gear on the runway (origin 2.2 m up)
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  addGearLeg(mesh, gearMat, 0, -1.2, -8.5, -2.2, 0.4);
  [-1.85, 1.85].forEach((x) => [-0.5, 1.5].forEach((z) => addGearLeg(mesh, gearMat, x, -1.4, z, -2.2, 0.4)));

  let rampTarget = RAMP_CLOSED;

  return {
    id: 'airliner',
    name: 'Tactical Cargo Transport',
    mesh,
    profile: {
      dryMass: 128000,
      inertia: { x: 1.6e7, y: 2.9e7, z: 3.9e7 },
      maxThrust: 26.0,
      maxRollRate: 0.8,
      maxPitchRate: 0.6,
      maxYawRate: 0.35,
      vr: 90,
      stallKt: 78,     // clean stall speed (lift model)
      approachKt: 101, // 1.3 x stall
      groundThrust: 24.0,
      groundHeight: 2.2,
      mass: 128000, wingArea: 353, aspectRatio: 7.2, oswaldEfficiency: 0.8, cd0: 0.024, cl0: 0.35,
      clAlpha: 5.2, stallAoA: 0.26, pitchRate: 0.6, rollRate: 0.8, yawRate: 0.35
    },
    cockpitOffset: new THREE.Vector3(-0.5, 1.6, -9.6), // captain's seat; flight deck centre at x = 0
    chaseOffset: new THREE.Vector3(0, 9.0, 48.0),

    // Key R: open / close the cargo ramp, only below 150 kt. Returns false when refused.
    toggleRamp(iasKt) {
      if (iasKt >= RAMP_MAX_KT) return false;
      rampTarget = rampTarget === RAMP_CLOSED ? RAMP_OPEN : RAMP_CLOSED;
      return true;
    },

    update(dt, flightState) {
      deflectSurfaces(surfaces, flightState.input);
      if (flightState.iasKt >= RAMP_MAX_KT) rampTarget = RAMP_CLOSED;
      const step = 0.35 * dt; // about 1.5 s full travel
      const delta = rampTarget - ramp.rotation.x;
      ramp.rotation.x += Math.sign(delta) * Math.min(Math.abs(delta), step);
    },

    dispose() {
      disposeObject(mesh);
    }
  };
}
