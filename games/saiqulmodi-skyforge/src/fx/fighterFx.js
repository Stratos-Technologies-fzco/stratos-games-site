import * as THREE from 'three';

// Fighter air effects seen from outside: the vapor cone round Mach 1 and white trails off the wing tips in a hard pull.
const TIP = new THREE.Vector3(4.75, 0.05, 2.9);   // right wing tip in airframe axes
const POINTS = 90;

function makeTrail(scene, layer) {
  const pos = new Float32Array(POINTS * 3), col = new Float32Array(POINTS * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  line.frustumCulled = false;
  line.layers.set(layer);
  line.visible = false;
  scene.add(line);
  return { line, pos, col, age: new Float32Array(POINTS).fill(9), strength: new Float32Array(POINTS) };
}

export class FighterFx {
  // parent: follows the aircraft; layer: the exterior camera layer
  constructor(parent, scene, layer) {
    const coneGeo = new THREE.ConeGeometry(5.2, 7.5, 28, 1, true);
    coneGeo.rotateX(-Math.PI / 2);   // tip towards the nose (-Z)
    this.cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
    }));
    this.cone.position.z = 0.5;
    this.cone.layers.set(layer);
    this.cone.visible = false;
    parent.add(this.cone);
    this.trails = [makeTrail(scene, layer), makeTrail(scene, layer)];
    this.tip = new THREE.Vector3();
    this.q = new THREE.Quaternion();
    this.gap = 0;
  }

  update(dt, state, active) {
    // Vapor cone only just round the speed of sound, in the thicker air lower down
    const nearSound = Math.max(0, 1 - Math.abs(state.mach - 1) / 0.05);
    const coneOpacity = active && !state.onGround ? nearSound * 0.28 : 0;
    this.cone.material.opacity += (coneOpacity - this.cone.material.opacity) * Math.min(1, 8 * dt);
    this.cone.visible = this.cone.material.opacity > 0.01;
    if (this.cone.visible) this.cone.scale.setScalar(0.95 + Math.random() * 0.07);

    // Tip trails appear above 4 g and fade behind the aircraft
    const load = active && !state.onGround ? Math.min(1, Math.max(0, ((state.loadG || 1) - 4) / 3)) : 0;
    this.gap += dt;
    const stepNow = this.gap >= 1 / 30;
    if (stepNow) this.gap = 0;
    this.q.setFromEuler(state.rot);
    this.trails.forEach((tr, side) => {
      if (stepNow) {
        tr.pos.copyWithin(3, 0, (POINTS - 1) * 3);
        tr.age.copyWithin(1, 0, POINTS - 1);
        tr.strength.copyWithin(1, 0, POINTS - 1);
        this.tip.copy(TIP);
        if (side) this.tip.x = -this.tip.x;
        this.tip.applyQuaternion(this.q).add(state.pos);
        tr.pos[0] = this.tip.x; tr.pos[1] = this.tip.y; tr.pos[2] = this.tip.z;
        tr.age[0] = 0;
        tr.strength[0] = load;
      }
      let any = false;
      for (let i = 0; i < POINTS; i++) {
        tr.age[i] += dt;
        const c = tr.strength[i] * Math.max(0, 1 - tr.age[i] / 2.2) * 0.9;
        if (c > 0.01) any = true;
        tr.col[i * 3] = tr.col[i * 3 + 1] = tr.col[i * 3 + 2] = c;
      }
      tr.line.visible = any;
      if (any) {
        tr.line.geometry.attributes.position.needsUpdate = true;
        tr.line.geometry.attributes.color.needsUpdate = true;
      }
    });
  }
}
