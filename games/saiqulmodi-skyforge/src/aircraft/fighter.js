import * as THREE from 'three';
import { addSurface, addGearLeg, deflectSurfaces, disposeObject } from './airframeKit.js';

export function createFighter() {
  const fighterGroup = new THREE.Group();
  fighterGroup.name = "stealth_fighter";

  // Materials
  const radarAbsorbentMat = new THREE.MeshStandardMaterial({
    color: 0x24282f,
    roughness: 0.45,
    metalness: 0.65,
    flatShading: true
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x997722, // Gold tinted radar-reflective bubble
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85
  });

  const burnerMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.0
  });

  // 1. Chiseled Stealth Fuselage
  const fuselageGeo = new THREE.ConeGeometry(1.4, 11, 6);
  fuselageGeo.rotateX(Math.PI / 2);
  fuselageGeo.scale(1.2, 0.45, 1.0);
  const fuselage = new THREE.Mesh(fuselageGeo, radarAbsorbentMat);
  fuselage.position.set(0, 0, 0);
  fighterGroup.add(fuselage);

  // 2. Cockpit Canopy Bubble
  const canopyGeo = new THREE.SphereGeometry(0.65, 16, 12);
  canopyGeo.scale(0.7, 0.65, 2.8);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.45, 1.2);
  fighterGroup.add(canopy);

  // 3. Diamond Delta Main Wings with Chines
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 2.5);       // Apex / chine start
  wingShape.lineTo(4.8, -2.5);     // Wingtip
  wingShape.lineTo(3.8, -4.0);     // Trailing edge tip
  wingShape.lineTo(0.9, -3.4);     // Inboard root
  wingShape.lineTo(-0.9, -3.4);    // Inboard root left
  wingShape.lineTo(-3.8, -4.0);    // Trailing edge tip left
  wingShape.lineTo(-4.8, -2.5);    // Wingtip left
  wingShape.closePath();

  const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.04 };
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
  wingGeo.rotateX(Math.PI / 2);
  const wings = new THREE.Mesh(wingGeo, radarAbsorbentMat);
  wings.position.set(0, 0.05, 0);
  fighterGroup.add(wings);

  // 4. TWIN OUTWARD-CANTED RUDDERS / VERTICAL STABILIZERS (-22 deg outward cant)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.9, 1.8);
  finShape.lineTo(0.3, 1.8);
  finShape.lineTo(-0.7, 0);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false });
  // the shape is drawn side-on (chord along x); turn it so the chord runs nose-to-tail (-z = aft here)
  finGeo.rotateY(Math.PI / 2);
  finGeo.translate(-0.03, 0, 0);

  // Left Vertical Stabilizer (canted left)
  const leftFin = new THREE.Mesh(finGeo, radarAbsorbentMat);
  leftFin.position.set(-1.15, 0.15, -2.8);
  leftFin.rotation.z = 0.38; // ~22 degrees outward cant
  fighterGroup.add(leftFin);

  // Right Vertical Stabilizer (canted right)
  const rightFin = new THREE.Mesh(finGeo, radarAbsorbentMat);
  rightFin.position.set(1.15, 0.15, -2.8);
  rightFin.rotation.z = -0.38; // ~22 degrees outward cant
  fighterGroup.add(rightFin);

  // 5. Twin Reheat Afterburner Cones
  const abGeo = new THREE.ConeGeometry(0.35, 1.6, 12);
  abGeo.rotateX(-Math.PI / 2);

  const leftAB = new THREE.Mesh(abGeo, burnerMat);
  leftAB.position.set(-0.55, 0.0, -5.2);
  const rightAB = new THREE.Mesh(abGeo, burnerMat);
  rightAB.position.set(0.55, 0.0, -5.2);

  fighterGroup.add(leftAB);
  fighterGroup.add(rightAB);

  // ---- Fleet contract wrapper ----
  // The stealth model above is built nose towards +Z; the flight loop flies nose towards -Z,
  // so it is turned 180 degrees inside an outer group. Its look is unchanged.
  const mesh = new THREE.Group();
  mesh.name = 'aircraft_fighter';
  fighterGroup.rotation.y = Math.PI;
  mesh.add(fighterGroup);

  const surfaces = {
    elevonL: addSurface(mesh, radarAbsorbentMat, 2.4, 0.08, 0.45, -2.4, -0.01, 3.55),
    elevonR: addSurface(mesh, radarAbsorbentMat, 2.4, 0.08, 0.45, 2.4, -0.01, 3.55)
  };

  // Afterburner plume: additive, un-tonemapped so it glows
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });
  const plumeGeo = new THREE.ConeGeometry(0.33, 3.2, 12);
  plumeGeo.rotateX(Math.PI / 2);
  const plumes = [-0.55, 0.55].map((x) => {
    const plume = new THREE.Mesh(plumeGeo, plumeMat);
    plume.position.set(x, 0, 7.2);
    plume.visible = false;
    mesh.add(plume);
    return plume;
  });

  const gearMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  addGearLeg(mesh, gearMat, 0, -0.3, -3.2, -1.2, 0.2);
  addGearLeg(mesh, gearMat, -1.1, -0.1, 1.0, -1.2, 0.25);
  addGearLeg(mesh, gearMat, 1.1, -0.1, 1.0, -1.2, 0.25);

  const reheat = function(throttle) {
    // Light up reheat cones past 70% throttle
    const abIntensity = throttle > 0.7 ? (throttle - 0.7) / 0.3 : 0.0;
    burnerMat.opacity = abIntensity * 0.9;
  };

  return {
    id: 'fighter',
    name: '5th-Gen Stealth Fighter',
    mesh,
    type: 'fighter',
    afterburners: [leftAB, rightAB],
    // Flight loop's existing fighter numbers (feel unchanged)
    profile: {
      dryMass: 13300,
      inertia: { x: 31000, y: 160000, z: 180000 },
      maxThrust: 65.0,
      afterburnerThrust: 220.0,
      maxRollRate: 3.0,
      maxPitchRate: 1.8,
      maxYawRate: 0.5,
      vr: 110,
      stallKt: 92,     // clean stall speed (lift model)
      approachKt: 135, // ~1.45 x stall: keeps the nose low enough to see the runway
      groundThrust: 65.0,
      groundHeight: 1.2,
      mass: 13300, wingArea: 42.7, aspectRatio: 2.7, oswaldEfficiency: 0.7, cd0: 0.02, cl0: 0.1,
      clAlpha: 3.5, stallAoA: 0.35, pitchRate: 1.8, rollRate: 3.0, yawRate: 0.5
    },
    cockpitOffset: new THREE.Vector3(0, 0.62, -1.3), // pilot eye inside the canopy
    chaseOffset: new THREE.Vector3(0, 3.4, 14.0),

    update(dt, flightState) {
      reheat(flightState.throttle);
      deflectSurfaces(surfaces, flightState.input);
      plumes.forEach((p) => {
        p.visible = flightState.isAfterburner;
        if (flightState.isAfterburner) {
          const flameScale = 1.0 + Math.random() * 0.4;
          p.scale.set(flameScale, flameScale, flameScale * 1.5);
        }
      });
    },

    dispose() {
      disposeObject(mesh);
    }
  };
}
