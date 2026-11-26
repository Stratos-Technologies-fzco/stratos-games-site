// Weapon effects (fighter upgrade, phase 4, 09-Nov-2026): missile smoke trails, flares, chaff, gun sparks, bomb blasts.
// Every soft particle (smoke, dust, fire, flare glow, chaff glints) lives in a few pooled point clouds drawn by one
// small shader each (one draw call per cloud, nothing allocated while flying). Bomb impacts add an expanding
// shock ring on the ground and a crater mark that stays a while. Two lights are kept in the scene all the time
// (switching lights on and off would recompile every material): one follows the newest flare, one flashes with a blast.
import * as THREE from 'three';

const VERT = `
  attribute float aSize;
  attribute vec4 aColor;
  uniform float uScale;
  varying vec4 vColor;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * uScale / max(0.1, -mv.z), 0.0, 900.0);
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
  }`;
const FRAG = `
  uniform float uCore;
  varying vec4 vColor;
  #include <logdepthbuf_pars_fragment>
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0 || vColor.a <= 0.0) discard;
    float a = (1.0 - r * r) * vColor.a;
    vec3 c = vColor.rgb + uCore * pow(1.0 - r, 3.0);
    gl_FragColor = vec4(c, a);
    #include <logdepthbuf_fragment>
  }`;

// A pool of soft round particles: emit(...) puts one in the next free slot; update(dt) moves, grows and fades them
export class PuffSystem {
  constructor(scene, max, { additive = false, core = 0 } = {}) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.col = new Float32Array(max * 4);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max);
    this.a0 = new Float32Array(max);
    this.life = new Float32Array(max); this.age = new Float32Array(max);
    this.drag = new Float32Array(max); this.lift = new Float32Array(max);
    this.next = 0;
    this.live = 0;
    const geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.aPos);
    geo.setAttribute('aSize', this.aSize);
    geo.setAttribute('aColor', this.aCol);
    this.uniforms = { uScale: { value: 600 }, uCore: { value: core } };
    this.points = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 3 : 2;
    scene.add(this.points);
  }

  // p, v: positions/velocities (Vector3-like); sizes in metres; life in s; rgb 0..1; alpha at birth
  emit(p, v, s0, s1, life, r, g, b, alpha, drag = 0.5, lift = 0) {
    const i = this.next;
    this.next = (this.next + 1) % this.max;
    this.pos[3 * i] = p.x; this.pos[3 * i + 1] = p.y; this.pos[3 * i + 2] = p.z;
    this.vel[3 * i] = v ? v.x : 0; this.vel[3 * i + 1] = v ? v.y : 0; this.vel[3 * i + 2] = v ? v.z : 0;
    this.s0[i] = s0; this.s1[i] = s1; this.life[i] = life; this.age[i] = 0; this.a0[i] = alpha;
    this.col[4 * i] = r; this.col[4 * i + 1] = g; this.col[4 * i + 2] = b; this.col[4 * i + 3] = alpha;
    this.size[i] = s0; this.drag[i] = drag; this.lift[i] = lift;
  }

  update(dt, scale) {
    this.uniforms.uScale.value = scale;
    let live = 0;
    for (let i = 0; i < this.max; i++) {
      if (this.age[i] >= this.life[i]) { if (this.col[4 * i + 3] !== 0) this.col[4 * i + 3] = 0; continue; }
      live++;
      this.age[i] += dt;
      const t = Math.min(1, this.age[i] / this.life[i]);
      const k = Math.exp(-this.drag[i] * dt);
      this.vel[3 * i] *= k; this.vel[3 * i + 1] = this.vel[3 * i + 1] * k + this.lift[i] * dt; this.vel[3 * i + 2] *= k;
      this.pos[3 * i] += this.vel[3 * i] * dt; this.pos[3 * i + 1] += this.vel[3 * i + 1] * dt; this.pos[3 * i + 2] += this.vel[3 * i + 2] * dt;
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * Math.sqrt(t);
      this.col[4 * i + 3] = this.a0[i] * (1 - t) * Math.min(1, this.age[i] * 12 + 0.3);
    }
    this.live = live;
    this.points.visible = live > 0;
    if (live || this.wasLive) { this.aPos.needsUpdate = true; this.aSize.needsUpdate = true; this.aCol.needsUpdate = true; }
    this.wasLive = live > 0;
  }

  clear() { this.age.fill(1e9); this.life.fill(0); }
}

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();

export class OrdnanceFx {
  // groundY(x, z) -> world y of the terrain
  constructor(scene, groundY = () => 0) {
    this.scene = scene;
    this.groundY = groundY;
    this.smoke = new PuffSystem(scene, 1400);                       // missile trails, lingering blast smoke, dust
    this.fire = new PuffSystem(scene, 500, { additive: true, core: 0.6 });   // motor plumes, flares, fireballs, sparks
    this.glint = new PuffSystem(scene, 700, { additive: true, core: 0.2 });  // chaff
    // shock rings (flat, on the ground) and crater marks
    this.rings = [];
    const ringGeo = new THREE.RingGeometry(0.85, 1, 48);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xfff1d0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      m.visible = false; m.renderOrder = 2;
      scene.add(m);
      this.rings.push({ mesh: m, age: 9, life: 1.1, r: 120 });
    }
    this.craters = [];
    const craterGeo = new THREE.CircleGeometry(1, 20);
    craterGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(craterGeo, new THREE.MeshBasicMaterial({ color: 0x1b1712, transparent: true, opacity: 0, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.visible = false;
      scene.add(m);
      this.craters.push({ mesh: m, age: 1e9 });
    }
    this.nextCrater = 0;
    this.flareLight = new THREE.PointLight(0xfff4e0, 0, 900, 1.6);
    this.blastLight = new THREE.PointLight(0xffa040, 0, 2500, 1.6);
    scene.add(this.flareLight, this.blastLight);
    this.blastT = 9;
    this.smokers = [];   // lingering smoke columns from blasts
  }

  // missile motor: bright plume puff at the nozzle and a thick trail puff while the motor burns
  motorPuff(pos, vel, dir, burning, thick = 1) {
    if (!burning) return;
    _v.copy(pos).addScaledVector(dir, -2);
    this.fire.emit(_v, vel, 1.6, 0.6, 0.12, 1.0, 0.75, 0.35, 0.95, 0);
    _w.copy(vel).multiplyScalar(0.05);
    this.smoke.emit(_v, _w, 1.4 * thick, 7 * thick, 5.5, 0.88, 0.88, 0.86, 0.55, 0.4, 0.6);
  }

  // flare: very bright white core with a little smoke arc behind it
  flarePuff(pos, vel) {
    this.fire.emit(pos, vel, 3.2, 2.6, 0.08, 1.0, 0.95, 0.85, 1.0, 0);
    this.smoke.emit(pos, null, 0.8, 4.5, 3.0, 0.92, 0.92, 0.92, 0.35, 0.5, 0.4);
  }

  // chaff: a cloud of glinting strips that spreads and slowly falls
  chaffBurst(pos, vel) {
    for (let i = 0; i < 26; i++) {
      _v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(14).addScaledVector(vel, 0.25);
      this.glint.emit(pos, _v, 0.5, 0.8, 4 + Math.random() * 2, 0.75, 0.8, 0.9, 0.9, 1.4, -1.5);
    }
  }

  // gun: spark at a hit, dust where a round hits the ground
  spark(pos) {
    for (let i = 0; i < 4; i++) {
      _v.set(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).multiplyScalar(40);
      this.fire.emit(pos, _v, 1.2, 0.4, 0.25, 1.0, 0.8, 0.4, 1.0, 2);
    }
    this.smoke.emit(pos, null, 1.5, 6, 2.0, 0.3, 0.3, 0.3, 0.5, 0.5, 1);
  }
  dust(pos) {
    _v.set(0, 6, 0);
    this.smoke.emit(pos, _v, 2, 9, 2.5, 0.55, 0.48, 0.38, 0.6, 1, -1);
  }

  // missile warhead / aircraft hit in the air
  airBurst(pos, scale = 1) {
    for (let i = 0; i < 26; i++) {
      _v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(30 + Math.random() * 30);
      this.fire.emit(pos, _v, 6 * scale, 16 * scale, 0.7 + Math.random() * 0.4, 1.0, 0.55, 0.18, 0.95, 2.5);
    }
    for (let i = 0; i < 14; i++) {
      _v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(30);
      this.smoke.emit(pos, _v, 8 * scale, 30 * scale, 5 + Math.random() * 2, 0.22, 0.2, 0.19, 0.7, 1.2, 0.5);
    }
    this.flash(pos, 6);
  }

  // bomb on the ground: fireball, dust wall, debris, shock ring, crater, then a smoke column for half a minute
  groundBlast(pos) {
    for (let i = 0; i < 40; i++) {
      _v.set(Math.random() - 0.5, Math.random() * 0.9, Math.random() - 0.5).normalize().multiplyScalar(25 + Math.random() * 45);
      this.fire.emit(pos, _v, 10, 30, 0.8 + Math.random() * 0.6, 1.0, 0.5 + Math.random() * 0.2, 0.15, 1.0, 2.2, 6);
    }
    for (let i = 0; i < 36; i++) {
      const a = Math.random() * Math.PI * 2;
      _v.set(Math.cos(a), 0.15 + Math.random() * 0.3, Math.sin(a)).multiplyScalar(40 + Math.random() * 40);
      this.smoke.emit(pos, _v, 10, 45, 6 + Math.random() * 3, 0.5, 0.43, 0.33, 0.75, 1.0, 0.5);
    }
    for (let i = 0; i < 16; i++) {
      _v.set(Math.random() - 0.5, 0.6 + Math.random(), Math.random() - 0.5).multiplyScalar(70);
      this.smoke.emit(pos, _v, 2, 5, 2.5, 0.2, 0.17, 0.14, 0.9, 0.3, -9.8);
    }
    const ring = this.rings.find((r) => r.age >= r.life) || this.rings[0];
    ring.age = 0;
    ring.mesh.position.set(pos.x, pos.y + 1, pos.z);
    ring.mesh.visible = true;
    const c = this.craters[this.nextCrater];
    this.nextCrater = (this.nextCrater + 1) % this.craters.length;
    c.age = 0;
    c.mesh.position.set(pos.x, this.groundY(pos.x, pos.z) + 0.25, pos.z);
    c.mesh.scale.setScalar(7 + Math.random() * 2);
    c.mesh.visible = true;
    this.smokers.push({ x: pos.x, y: pos.y, z: pos.z, t: 0, next: 0 });
    this.flash(pos, 12);
  }

  flash(pos, power) {
    this.blastLight.position.copy(pos);
    this.blastLight.intensity = power * 3000;
    this.blastT = 0;
  }

  // flares: the light sits on the newest one that is still burning (pos or null)
  setFlareLight(pos) {
    if (pos) { this.flareLight.position.copy(pos); this.flareLight.intensity = 9000; } else this.flareLight.intensity = 0;
  }

  // scale: pixels per metre at 1 m distance (viewport height / (2 tan(fov / 2)))
  update(dt, scale) {
    this.smoke.update(dt, scale);
    this.fire.update(dt, scale);
    this.glint.update(dt, scale);
    for (const r of this.rings) {
      if (r.age >= r.life) { r.mesh.visible = false; continue; }
      r.age += dt;
      const t = Math.min(1, r.age / r.life);
      r.mesh.scale.setScalar(4 + r.r * Math.sqrt(t));
      r.mesh.material.opacity = 0.8 * (1 - t);
    }
    for (const c of this.craters) {
      if (!c.mesh.visible) continue;
      c.age += dt;
      c.mesh.material.opacity = 0.85 * Math.max(0, Math.min(1, (180 - c.age) / 30));
      if (c.age > 180) c.mesh.visible = false;
    }
    this.blastT += dt;
    this.blastLight.intensity = this.blastT < 0.6 ? this.blastLight.intensity * Math.exp(-6 * dt) : 0;
    for (let i = this.smokers.length - 1; i >= 0; i--) {
      const s = this.smokers[i];
      s.t += dt;
      s.next -= dt;
      if (s.next <= 0) {
        s.next = 0.35;
        _v.set(s.x + (Math.random() - 0.5) * 6, s.y + 2, s.z + (Math.random() - 0.5) * 6);
        _w.set(1.5, 6, 0.8);
        const fade = 1 - s.t / 30;
        this.smoke.emit(_v, _w, 8, 34, 12, 0.18, 0.17, 0.16, 0.55 * fade, 0.05, 0.4);
      }
      if (s.t > 30) this.smokers.splice(i, 1);
    }
  }

  clear() {
    this.smoke.clear(); this.fire.clear(); this.glint.clear();
    this.smokers.length = 0;
    this.rings.forEach((r) => { r.age = 9; r.mesh.visible = false; });
    this.flareLight.intensity = 0; this.blastLight.intensity = 0;
  }
}
