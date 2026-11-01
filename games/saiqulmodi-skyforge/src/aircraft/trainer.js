import * as THREE from 'three';
import { addSurface, addGearLeg, deflectSurfaces, disposeObject } from './airframeKit.js';

export class TrainerModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "player_aircraft_root";

    // Sub-models for all 4 profiles
    this.models = {
      fighter: this.buildStealthFighter(),
      airliner: this.buildCargoTransport(),
      trainer: this.buildMilitaryTrainer(),
      helicopter: this.buildAttackHelicopter()
    };

    // Add all to group, show fighter by default
    Object.values(this.models).forEach(m => {
      m.visible = false;
      this.group.add(m);
    });

    this.activeProfile = 'fighter';
    this.models.fighter.visible = true;

    // References for dynamic animations
    this.propellers = [];
    this.rotors = [];
    this.afterburners = [];
  }

  // Switch displayed realistic 3D mesh
  setProfile(profileKey) {
    if (!this.models[profileKey]) return;
    this.activeProfile = profileKey;
    Object.keys(this.models).forEach(k => {
      this.models[k].visible = (k === profileKey);
    });
  }

  // 1. 5th-GEN AIR DOMINANCE STEALTH FIGHTER
  buildStealthFighter() {
    const fGroup = new THREE.Group();
    fGroup.name = "mesh_fighter";

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x24282f,
      roughness: 0.45,
      metalness: 0.65
    });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1b1e23,
      roughness: 0.55,
      metalness: 0.7
    });
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6a817, // Gold radar-reflective tint
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.65,
      transparent: true,
      opacity: 0.75
    });
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.85,
      roughness: 0.3
    });

    // Blended stealth fuselage
    const bodyGeo = new THREE.CylinderGeometry(0.35, 1.1, 8.5, 6);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(1.8, 0.65, 1.0);
    const body = new THREE.Mesh(bodyGeo, skinMat);
    body.position.set(0, 0.4, 0.2);
    fGroup.add(body);

    // Chiseled radome nosecone
    const noseGeo = new THREE.ConeGeometry(0.65, 3.2, 5);
    noseGeo.rotateX(-Math.PI / 2);
    noseGeo.scale(1.4, 0.55, 1.0);
    const nose = new THREE.Mesh(noseGeo, panelMat);
    nose.position.set(0, 0.4, -4.8);
    fGroup.add(nose);

    // Bubble Canopy
    const canopyGeo = new THREE.SphereGeometry(0.62, 24, 16);
    canopyGeo.scale(0.75, 0.8, 3.2);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.85, -1.2);
    fGroup.add(canopy);

    // Diamond Swept Wings with LERX
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(6.4, 3.2);
    wingShape.lineTo(5.8, 4.2);
    wingShape.lineTo(0.9, 3.8);
    wingShape.lineTo(-0.9, 3.8);
    wingShape.lineTo(-5.8, 4.2);
    wingShape.lineTo(-6.4, 3.2);
    wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05 });
    wingGeo.rotateX(Math.PI / 2);
    const wings = new THREE.Mesh(wingGeo, skinMat);
    wings.position.set(0, 0.35, -1.8);
    fGroup.add(wings);

    // Twin Canted Vertical Stabilizers (28 deg cant)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.9, 2.2);
    finShape.lineTo(1.8, 2.2);
    finShape.lineTo(2.4, 0);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.02 });
    // the shape is drawn side-on (chord along x); turn it so the chord runs nose-to-tail (+z = aft here)
    finGeo.rotateY(-Math.PI / 2);
    finGeo.translate(0.04, 0, 0);

    // Left fin
    const leftFin = new THREE.Mesh(finGeo, panelMat);
    leftFin.position.set(-1.1, 0.5, 1.9);
    leftFin.rotation.z = 0.48; // outward cant
    
    // Right fin
    const rightFin = new THREE.Mesh(finGeo, panelMat);
    rightFin.position.set(1.1, 0.5, 1.9);
    rightFin.rotation.z = -0.48;

    fGroup.add(leftFin, rightFin);

    // Twin 2D Thrust Vectoring Exhaust Nozzles
    [-0.55, 0.55].forEach(x => {
      const nozzle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.8), nozzleMat);
      nozzle.position.set(x, 0.4, 4.5);
      
      // Internal reheat glow cone
      const reheat = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 1.4, 8),
        new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.0 })
      );
      reheat.rotation.x = Math.PI / 2;
      reheat.position.set(x, 0.4, 5.2);
      fGroup.add(nozzle, reheat);
      this.afterburners.push(reheat);
    });

    return fGroup;
  }

  // 2. TACTICAL CARGO TRANSPORT (C-17 / C-130 PROFILE)
  buildCargoTransport() {
    const tGroup = new THREE.Group();
    tGroup.name = "mesh_airliner";

    const cargoMat = new THREE.MeshStandardMaterial({ color: 0x5a636a, roughness: 0.6, metalness: 0.3 });
    const detailMat = new THREE.MeshStandardMaterial({ color: 0x2e3338, roughness: 0.5 });

    // Widebody pressurized cargo fuselage
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 16, 16), cargoMat);
    body.rotateX(Math.PI / 2);
    body.position.set(0, 1.5, 0);
    tGroup.add(body);

    // Cockpit nose cap
    const nose = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), cargoMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 1.5, -8.0);
    tGroup.add(nose);

    // High shoulder wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(22, 0.35, 3.2), cargoMat);
    wing.position.set(0, 3.0, -1.0);
    tGroup.add(wing);

    // T-Tail / High Empennage
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.2, 2.8), cargoMat);
    fin.position.set(0, 4.2, 7.0);
    const stabilizer = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.25, 1.8), cargoMat);
    stabilizer.position.set(0, 6.2, 7.5);
    tGroup.add(fin, stabilizer);

    // 4 Underwing Turbofan Engines
    [-6.8, -3.4, 3.4, 6.8].forEach(x => {
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.55, 2.6, 12), detailMat);
      nacelle.rotateX(Math.PI / 2);
      nacelle.position.set(x, 2.0, -1.4);
      tGroup.add(nacelle);
    });

    return tGroup;
  }

  // 3. MILITARY TURBOPROP TRAINER (PC-21 / TEXAN II)
  buildMilitaryTrainer() {
    const trGroup = new THREE.Group();
    trGroup.name = "mesh_trainer";

    const paintMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.35, metalness: 0.2 }); // Acrobatic Red
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 });
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      transmission: 0.8
    });

    // Sleek aerodynamic trainer fuselage
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 7.0, 14), paintMat);
    body.rotateX(Math.PI / 2);
    body.position.set(0, 0.6, 0);
    trGroup.add(body);

    // Tandem 2-seat glass canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), canopyMat);
    canopy.scale.set(0.8, 0.9, 3.0);
    canopy.position.set(0, 0.95, -0.6);
    trGroup.add(canopy);

    // Low wings with dihedral wingtips
    const wings = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 1.5), paintMat);
    wings.position.set(0, 0.45, -0.2);
    trGroup.add(wings);

    // Empennage & rudder
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 1.4), whiteMat);
    fin.position.set(0, 1.35, 3.1);
    const stab = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.9), whiteMat);
    stab.position.set(0, 0.75, 3.2);
    trGroup.add(fin, stab);

    // Front Turboprop Spinner + Blades
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 12), whiteMat);
    spinner.rotateX(-Math.PI / 2);
    spinner.position.set(0, 0.6, -3.8);

    const propDisc = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.04), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    spinner.add(propDisc);
    this.propellers.push(propDisc);
    trGroup.add(spinner);

    return trGroup;
  }

  // 4. ATTACK GUNSHIP HELICOPTER (AH-64 APACHE PROFILE)
  buildAttackHelicopter() {
    const hGroup = new THREE.Group();
    hGroup.name = "mesh_helicopter";

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x2d362e, roughness: 0.8, metalness: 0.4 }); // Gunship Drab
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x181a18, roughness: 0.5, metalness: 0.7 });

    // Narrow tandem cockpit gunship fuselage
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 5.8), armorMat);
    body.position.set(0, 1.2, -0.5);
    hGroup.add(body);

    // Tail boom & vertical fin
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 5.5, 8), armorMat);
    boom.rotateX(Math.PI / 2);
    boom.position.set(0, 1.4, 4.2);
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.8), armorMat);
    tailFin.position.set(0, 1.9, 6.8);
    hGroup.add(boom, tailFin);

    // Stub weapon sponsons
    const pylons = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.6), armorMat);
    pylons.position.set(0, 1.0, -0.4);
    hGroup.add(pylons);

    // Main 4-Blade Rotor Mast
    const rotorMast = new THREE.Group();
    rotorMast.position.set(0, 2.1, -0.3);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), metalMat);
    rotorMast.add(shaft);

    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.04, 0.35), metalMat);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 11.5), metalMat);
    blade1.position.y = 0.3;
    blade2.position.y = 0.3;
    rotorMast.add(blade1, blade2);

    this.rotors.push(rotorMast);
    hGroup.add(rotorMast);

    return hGroup;
  }

  // Animation ticks for rotors, props, and afterburners
  updateVisuals(controls, throttle = 0, rpmNorm = 0) {
    // Spin turboprops
    this.propellers.forEach(p => {
      p.rotation.z += 0.45 + (rpmNorm * 0.8);
    });

    // Spin helicopter rotors
    this.rotors.forEach(r => {
      r.rotation.y += 0.5 + (throttle * 0.7);
    });

    // Modulate Fighter Stage 2 reheat glow
    this.afterburners.forEach(ab => {
      if (this.activeProfile === 'fighter' && throttle > 0.7) {
        ab.material.opacity = (throttle - 0.7) * 3.2;
        const scaleZ = 1.0 + (throttle - 0.7) * 4.0;
        ab.scale.set(1.0, 1.0, scaleZ);
      } else {
        ab.material.opacity = 0.0;
      }
    });
  }
}

// ==========================================
// FLEET CONTRACT: createTrainer()
// Uses the turboprop trainer mesh above unchanged (only lowered onto fixed gear) plus moving surfaces.
// Profile numbers are the flight loop's existing trainer values, so the flight feel is unchanged.
// ==========================================
export function createTrainer() {
  const holder = { propellers: [] };
  const model = TrainerModel.prototype.buildMilitaryTrainer.call(holder);
  model.position.y = -0.4;

  const mesh = new THREE.Group();
  mesh.name = 'aircraft_trainer';
  mesh.add(model);

  const paintMat = model.children[0].material;
  const whiteMat = model.children[3].material;
  const surfaces = {
    aileronL: addSurface(model, paintMat, 2.4, 0.1, 0.3, -3.3, 0.45, 0.55),
    aileronR: addSurface(model, paintMat, 2.4, 0.1, 0.3, 3.3, 0.45, 0.55),
    elevator: addSurface(model, whiteMat, 3.0, 0.06, 0.3, 0, 0.75, 3.65),
    rudder: addSurface(model, whiteMat, 0.08, 1.6, 0.3, 0, 1.35, 3.8)
  };

  const gearMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
  addGearLeg(mesh, gearMat, 0, -0.3, -2.6, -1.2, 0.2);
  addGearLeg(mesh, gearMat, -1.3, 0.05, -0.3, -1.2, 0.25);
  addGearLeg(mesh, gearMat, 1.3, 0.05, -0.3, -1.2, 0.25);

  return {
    id: 'trainer',
    name: 'Turboprop Trainer',
    mesh,
    profile: {
      dryMass: 2250,
      inertia: { x: 4200, y: 7800, z: 3600 },
      maxThrust: 26.0,
      maxRollRate: 1.4,
      maxPitchRate: 0.9,
      maxYawRate: 0.5,
      vr: 55,
      stallKt: 48,     // clean stall speed (lift model)
      approachKt: 62,  // 1.3 x stall
      groundThrust: 28.0,
      groundHeight: 1.2,
      // keys AeroEngine6DOF reads
      mass: 2250, wingArea: 16.3, aspectRatio: 7.1, oswaldEfficiency: 0.78, cd0: 0.025, cl0: 0.3,
      clAlpha: 5.0, stallAoA: 0.28, pitchRate: 0.9, rollRate: 1.4, yawRate: 0.5
    },
    cockpitOffset: new THREE.Vector3(0, 0.75, -1.1),
    chaseOffset: new THREE.Vector3(0, 3.4, 13.0),

    update(dt, flightState) {
      deflectSurfaces(surfaces, flightState.input);
      holder.propellers.forEach((p) => { p.rotation.z += (0.45 + flightState.power / 100 * 0.8) * dt * 60; });
    },

    dispose() {
      disposeObject(mesh);
    }
  };
}
