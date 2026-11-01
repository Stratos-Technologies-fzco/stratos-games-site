import * as THREE from 'three';
import { addGearLeg, deflectSurfaces, disposeObject } from './airframeKit.js';

// Attack gunship: tandem cockpit, 4-blade main rotor (spin follows rotor RPM), tail rotor on the boom,
// stub wings with weapon pylons. Flies on the rotorcraft branch (stepRotorcraft in aero.js).
// Nose towards -Z, origin 1.4 m above the runway when parked.
const ROTOR_RPM = 289;         // 100 % NR
const VISUAL_SPIN = 0.045;     // visual fraction of true rotor speed (avoids strobing at 60 FPS)

export function createHelicopter() {
  const mesh = new THREE.Group();
  mesh.name = 'aircraft_heli';

  const armorMat = new THREE.MeshStandardMaterial({ color: 0x2d362e, roughness: 0.8, metalness: 0.4 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x181a18, roughness: 0.5, metalness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x14202a, roughness: 0.1, metalness: 0.8 });
  const weaponMat = new THREE.MeshStandardMaterial({ color: 0x4b4f4a, roughness: 0.6, metalness: 0.5 });

  // Narrow fuselage with tapered nose
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 4.6), armorMat);
  body.position.set(0, 0, -0.3);
  mesh.add(body);
  const noseGeo = new THREE.CylinderGeometry(0.35, 0.65, 1.4, 4);
  noseGeo.rotateY(Math.PI / 4);
  noseGeo.rotateX(-Math.PI / 2);
  const noseCap = new THREE.Mesh(noseGeo, armorMat);
  noseCap.position.set(0, -0.15, -3.3);
  mesh.add(noseCap);

  // Tandem stepped canopies: gunner low in front, pilot raised behind
  const gunnerCanopy = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.5, 1.2), glassMat);
  gunnerCanopy.position.set(0, 0.85, -2.0);
  const pilotCanopy = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 1.2), glassMat);
  pilotCanopy.position.set(0, 1.0, -0.85);
  mesh.add(gunnerCanopy, pilotCanopy);

  // Engine nacelles either side of the mast
  [-1, 1].forEach((s) => {
    const engGeo = new THREE.CylinderGeometry(0.32, 0.28, 2.0, 12);
    engGeo.rotateX(Math.PI / 2);
    const eng = new THREE.Mesh(engGeo, armorMat);
    eng.position.set(s * 0.72, 0.6, 0.4);
    mesh.add(eng);
  });

  // Chin gun turret
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8), metalMat);
  gun.rotation.x = Math.PI / 2;
  gun.position.set(0, -0.85, -2.6);
  mesh.add(gun);

  // Tail boom, fin, stabiliser
  const boomGeo = new THREE.CylinderGeometry(0.2, 0.36, 6.0, 10);
  boomGeo.rotateX(Math.PI / 2);
  const boom = new THREE.Mesh(boomGeo, armorMat);
  boom.position.set(0, 0.35, 4.9);
  mesh.add(boom);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.7, 1.0), armorMat);
  fin.position.set(0, 1.05, 8.0);
  fin.rotation.x = 0.3;
  mesh.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.6), armorMat);
  stab.position.set(0, 0.4, 7.6);
  mesh.add(stab);

  // Tail rotor: 4 blades spinning about the X axis on the right of the fin
  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.22, 1.35, 8.25);
  [0, 1].forEach((i) => {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.7, 0.14), metalMat);
    blade.rotation.x = i * Math.PI / 2;
    tailRotor.add(blade);
  });
  mesh.add(tailRotor);

  // Stub wings with weapon pylons: rocket pods inboard, missile racks outboard
  const stubWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.8), armorMat);
  stubWing.position.set(0, -0.2, -0.3);
  mesh.add(stubWing);
  [-1, 1].forEach((s) => {
    const podGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.5, 12);
    podGeo.rotateX(Math.PI / 2);
    const pod = new THREE.Mesh(podGeo, weaponMat);
    pod.position.set(s * 1.05, -0.55, -0.3);
    const pylonIn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.5), armorMat);
    pylonIn.position.set(s * 1.05, -0.3, -0.3);
    mesh.add(pod, pylonIn);
    const pylonOut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.5), armorMat);
    pylonOut.position.set(s * 1.65, -0.3, -0.3);
    mesh.add(pylonOut);
    [-0.12, 0.12].forEach((dx) => [-0.52, -0.76].forEach((y) => {
      const mslGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8);
      mslGeo.rotateX(Math.PI / 2);
      const missile = new THREE.Mesh(mslGeo, weaponMat);
      missile.position.set(s * 1.65 + dx, y, -0.3);
      mesh.add(missile);
    }));
  });

  // Main rotor: mast, hub, 4 blades
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 10), metalMat);
  mast.position.set(0, 1.0, -0.3);
  mesh.add(mast);
  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 1.4, -0.3);
  mainRotor.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 12), metalMat));
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.y = i * Math.PI / 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.05, 0.5), metalMat);
    blade.position.x = 3.7;
    arm.add(blade);
    mainRotor.add(arm);
  }
  mesh.add(mainRotor);

  // Fixed gear: two mains under the cockpit, tailwheel under the boom
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  addGearLeg(mesh, gearMat, -0.9, -0.3, -1.3, -1.4, 0.28);
  addGearLeg(mesh, gearMat, 0.9, -0.3, -1.3, -1.4, 0.28);
  addGearLeg(mesh, gearMat, 0, 0.15, 7.3, -1.4, 0.18);

  const surfaces = {};
  let rotorRpm = 0;

  return {
    id: 'heli',
    name: 'Attack Gunship',
    mesh,
    profile: {
      rotorcraft: true,
      dryMass: 5200,
      inertia: { x: 7000, y: 25000, z: 22000 },
      maxThrust: 14.0,
      maxRollRate: 1.0,
      maxPitchRate: 1.0,
      maxYawRate: 1.2,
      liftAccel: 14.0,        // m/s^2 at full collective (hover at ~70 %)
      maxCyclicTilt: 0.35,    // rad of disc tilt at full cyclic
      attitudeResponse: 2.0,  // 1/s, attitude follows the cyclic and self-levels when centred
      horizontalDrag: 0.1,    // 1/s
      verticalDamping: 0.8,   // 1/s
      groundHeight: 1.4,
      approachKt: 50,
      mass: 5200, pitchRate: 1.0, rollRate: 1.0, yawRate: 1.2
    },
    cockpitOffset: new THREE.Vector3(0, 0.9, -0.9), // rear (pilot) seat, raised above the gunner
    chaseOffset: new THREE.Vector3(0, 5.0, 20.0),

    update(dt, flightState) {
      deflectSurfaces(surfaces, flightState.input);
      // Rotor spools with the engines: NR 94 % at flight idle up to 101 % at full collective
      const targetRpm = flightState.power > 1 ? ROTOR_RPM * (0.94 + 0.0007 * flightState.power) : 0;
      rotorRpm += (targetRpm - rotorRpm) * Math.min(1, dt * 0.6);
      const radPerSec = rotorRpm / 60 * Math.PI * 2 * VISUAL_SPIN;
      mainRotor.rotation.y += radPerSec * dt;
      tailRotor.rotation.x += radPerSec * 4.5 * dt;
    },

    dispose() {
      disposeObject(mesh);
    }
  };
}
