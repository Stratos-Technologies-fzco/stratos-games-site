import * as THREE from 'three';

// Fighter air effects seen from outside: the vapor cone round Mach 1, white trails off the wing tips in a hard pull,
// and (09-Nov-2026) vapour over the top of the wings at a high angle of attack in the lower, wetter air.
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

    // Wing vapour: soft white puffs over the upper surface of each wing, from the root to the tip
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.5, 'rgba(255,255,255,0.45)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    this.vapourMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    this.vapour = [];
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 5; i++) {
        const k = i / 4;
        const sp = new THREE.Sprite(this.vapourMat);
        sp.position.set(side * (1.1 + 2.7 * k), 0.38 - 0.08 * k, -0.9 + 2.8 * k);
        sp.userData.base = 2.4 - 0.9 * k;
        sp.layers.set(layer);
        sp.visible = false;
        parent.add(sp);
        this.vapour.push(sp);
      }
    });
    this.vapourLevel = 0;
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

    // Wing vapour: angle of attack above 10 deg in a pull of more than 4 g, below about 4,500 m and below Mach 0.95
    const aoaDeg = (state.aoa || 0) * 180 / Math.PI;
    const low = 1 - Math.min(1, Math.max(0, ((state.hAmslM ?? 0) - 3000) / 1500));
    const vapGoal = active && !state.onGround && state.mach < 0.95
      ? Math.min(1, Math.max(0, (aoaDeg - 10) / 6)) * Math.min(1, Math.max(0, ((state.loadG || 1) - 4) / 2)) * low : 0;
    this.vapourLevel += (vapGoal - this.vapourLevel) * Math.min(1, 6 * dt);
    this.vapourMat.opacity = 0.42 * this.vapourLevel;
    const vapOn = this.vapourLevel > 0.02;
    this.vapour.forEach((sp) => {
      sp.visible = vapOn;
      if (vapOn) sp.scale.setScalar(sp.userData.base * (0.85 + Math.random() * 0.3));
    });

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
