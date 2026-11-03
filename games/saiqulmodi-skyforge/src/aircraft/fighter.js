import * as THREE from 'three';
import { addSurface, addGearLeg, deflectSurfaces, disposeObject } from './airframeKit.js';

export function createFighter() {
  const fighterGroup = new THREE.Group();
  fighterGroup.name = "stealth_fighter";

  // Materials: air-superiority grey that catches the sun, darker metal for the engines
  const radarAbsorbentMat = new THREE.MeshStandardMaterial({
    color: 0x7d8a97,
    roughness: 0.5,
    metalness: 0.2,
    flatShading: true,
    side: THREE.DoubleSide
  });
  const darkPanelMat = new THREE.MeshStandardMaterial({ color: 0x39424c, roughness: 0.55, metalness: 0.3, flatShading: true });
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x4a443e, roughness: 0.35, metalness: 0.8, side: THREE.DoubleSide });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x997722, // Gold tinted radar-reflective bubble
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85
  });

  const burnerMat = new THREE.MeshBasicMaterial({
    color: 0xff7a1a,
    transparent: true,
    opacity: 0.25,
    toneMapped: false
  });

  // 1. Chiseled stealth fuselage: lofted through cross-sections, sharp nose to wide twin-engine tail
  const SECTION = [[0, 1.05], [0.55, 0.8], [1, 0], [0.6, -0.7], [0, -0.85], [-0.6, -0.7], [-1, 0], [-0.55, 0.8]];
  const STATIONS = [ // z (nose = +), half width, half height, centre height
    [6.4, 0.02, 0.02, -0.02], [5.2, 0.32, 0.2, 0.0], [3.8, 0.6, 0.34, 0.04], [2.2, 0.82, 0.48, 0.08],
    [0.6, 1.22, 0.54, 0.08], [-1.5, 1.55, 0.54, 0.06], [-3.2, 1.5, 0.5, 0.04], [-4.5, 1.2, 0.44, 0.02]
  ];
  const fuselagePos = [];
  const ring = (st, i) => {
    const [px, py] = SECTION[i % SECTION.length];
    return [px * st[1], py * st[2] + st[3], st[0]];
  };
  for (let s = 0; s < STATIONS.length - 1; s++) {
    for (let i = 0; i < SECTION.length; i++) {
      const a = ring(STATIONS[s], i), b = ring(STATIONS[s], i + 1), c = ring(STATIONS[s + 1], i), d = ring(STATIONS[s + 1], i + 1);
      fuselagePos.push(...a, ...c, ...b, ...b, ...c, ...d);
    }
  }
  const fuselageGeo = new THREE.BufferGeometry();
  fuselageGeo.setAttribute('position', new THREE.Float32BufferAttribute(fuselagePos, 3));
  fuselageGeo.computeVertexNormals();
  const fuselage = new THREE.Mesh(fuselageGeo, radarAbsorbentMat);
  fighterGroup.add(fuselage);

  // Air intakes either side, ahead of the wing
  [-1, 1].forEach((side) => {
    const intake = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 2.4), darkPanelMat);
    intake.position.set(side * 1.02, -0.12, 0.7);
    intake.rotation.y = side * 0.12;
    fighterGroup.add(intake);
  });

  // 2. Cockpit Canopy Bubble
  const canopyGeo = new THREE.SphereGeometry(0.65, 16, 12);
  canopyGeo.scale(0.66, 0.62, 2.5);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.42, 1.7);
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

  // Tailplanes between the fins and the wing tips
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0.5);
  tailShape.lineTo(1.9, -0.55);
  tailShape.lineTo(1.9, -1.15);
  tailShape.lineTo(0, -0.95);
  tailShape.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.06, bevelEnabled: false });
  tailGeo.rotateX(Math.PI / 2);
  [-1, 1].forEach((side) => {
    const tail = new THREE.Mesh(tailGeo, radarAbsorbentMat);
    tail.position.set(side * 1.25, 0.02, -3.6);
    tail.scale.x = side;
    fighterGroup.add(tail);
  });

  // 5. Twin engine nozzles with a hot glow inside (brightens with power)
  const nozzleGeo = new THREE.CylinderGeometry(0.46, 0.56, 1.3, 16, 1, true);
  nozzleGeo.rotateX(Math.PI / 2);
  const glowGeo = new THREE.CircleGeometry(0.42, 16);
  glowGeo.rotateY(Math.PI);
  const nozzles = [-0.62, 0.62].map((x) => {
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(x, 0.02, -4.75);
    fighterGroup.add(nozzle);
    const glow = new THREE.Mesh(glowGeo, burnerMat);
    glow.position.set(x, 0.02, -5.2);
    fighterGroup.add(glow);
    return glow;
  });

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

  // Afterburner flame: an orange outer flame round a short bright core; both grow smoothly with the throttle
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xff8a2a, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xa8dcff, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });
  const flameGeo = new THREE.ConeGeometry(0.4, 1, 14);
  flameGeo.rotateX(Math.PI / 2);   // tip points aft
  flameGeo.translate(0, 0, 0.5);
  const flames = [-0.62, 0.62].map((x) => {
    const flame = new THREE.Mesh(flameGeo, flameMat);
    const core = new THREE.Mesh(flameGeo, coreMat);
    flame.position.set(x, 0.02, 5.25);
    core.position.copy(flame.position);
    flame.visible = core.visible = false;
    mesh.add(flame, core);
    return { flame, core };
  });

  // Landing gear folds away after take-off and comes down low on approach
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  const gear = new THREE.Group();
  addGearLeg(gear, gearMat, 0, -0.3, -3.2, -1.2, 0.2);
  addGearLeg(gear, gearMat, -1.1, -0.1, 1.0, -1.2, 0.25);
  addGearLeg(gear, gearMat, 1.1, -0.1, 1.0, -1.2, 0.25);
  mesh.add(gear);
  let gearOut = 1, burn = 0;

  return {
    id: 'fighter',
    name: '5th-Gen Stealth Fighter',
    mesh,
    type: 'fighter',
    afterburners: nozzles,
    // Flight loop's existing fighter numbers (feel unchanged)
    profile: {
      dryMass: 13300,
      inertia: { x: 31000, y: 160000, z: 180000 },
      maxThrust: 65.0,
      afterburnerThrust: 220.0,
      maxRollRate: 3.0,
      maxPitchRate: 1.8,
      maxYawRate: 0.5,
      vr: 135,         // 1.13 x stall
      stallKt: 119,    // from L = 1/2 rho V^2 S CLmax with this aircraft's mass and wing (tools/validate_flight.py)
      approachKt: 160, // 1.35 x stall
      groundThrust: 65.0,
      groundHeight: 1.2,
      mass: 13300, wingArea: 42.7, aspectRatio: 2.7, oswaldEfficiency: 0.7, cd0: 0.02, cl0: 0.1,
      clAlpha: 3.5, stallAoA: 0.35, pitchRate: 1.8, rollRate: 3.0, yawRate: 0.5
    },
    cockpitOffset: new THREE.Vector3(0, 0.62, -1.3), // pilot eye inside the canopy
    chaseOffset: new THREE.Vector3(0, 3.4, 14.0),

    update(dt, flightState) {
      deflectSurfaces(surfaces, flightState.input);
      // Nozzle glow follows engine power; the flame builds and dies over a moment past the afterburner gate
      burnerMat.opacity = 0.2 + 0.7 * flightState.power / 100;
      const burnGoal = flightState.throttle > 0.7 ? (flightState.power / 100 - 0.6) / 0.4 : 0;
      burn += (Math.max(0, burnGoal) - burn) * Math.min(1, 5 * dt);
      flames.forEach(({ flame, core }) => {
        flame.visible = core.visible = burn > 0.02;
        if (!flame.visible) return;
        const flicker = 1 + Math.random() * 0.12;
        flame.scale.set(0.8 + 0.25 * burn, 0.8 + 0.25 * burn, (1.2 + 3.0 * burn) * flicker);
        core.scale.set(0.55, 0.55, (0.6 + 1.3 * burn) * flicker);
      });
      const gearGoal = flightState.gearDown === false ? 0 : 1;
      gearOut += Math.max(-dt / 2.5, Math.min(dt / 2.5, gearGoal - gearOut));
      gear.visible = gearOut > 0.02;
      gear.scale.y = Math.max(0.02, gearOut);
      gear.position.y = -0.1 * (1 - gearOut);
    },

    dispose() {
      disposeObject(mesh);
    }
  };
}
