import * as THREE from 'three';
import { createSeatedPilot } from '../fleet/pilotAvatar.js';

// Crash sequence: impact fireball + shockwave, big lasting flames and black smoke from the wreck and from
// burning debris, airframe pieces thrown out, the pilot ejecting on a rocket seat and floating down under a
// colourful parachute, and a slow crash camera circling it all. index.html starts it from crash(reason)
// and puts the aircraft back on the runway when it is finished.

const DURATION = 10;           // seconds before the new start on the runway
const G = 9.81;

function glowTexture(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => r.addColorStop(o, col));
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const rnd = (a, b) => a + Math.random() * (b - a);

export class CrashSequence {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.root = null;
    this.fireTex = glowTexture([[0, 'rgba(255,255,240,1)'], [0.25, 'rgba(255,210,90,0.95)'], [0.55, 'rgba(255,110,20,0.55)'], [1, 'rgba(120,20,0,0)']]);
    this.smokeTex = glowTexture([[0, 'rgba(40,36,34,0.85)'], [0.5, 'rgba(30,28,28,0.45)'], [1, 'rgba(20,20,20,0)']]);
  }

  // pos: impact point (aircraft centre), vel: velocity just before impact, groundY: ground height there,
  // paint: main airframe colour (hex) for the debris
  start(pos, vel, groundY, paint = 0x8896a8) {
    this.clear();
    this.active = true;
    this.t = 0;
    this.ground = groundY;
    this.at = new THREE.Vector3(pos.x, groundY + 0.6, pos.z);
    const v = vel.clone(); v.y = 0;
    this.dir = v.lengthSq() > 1 ? v.normalize() : new THREE.Vector3(0, 0, -1);
    this.root = new THREE.Group(); this.root.name = 'crash_fx';
    this.scene.add(this.root);

    // flash, fireball, shockwave ring, scorch mark, light
    this.flash = this.sprite(this.fireTex, 1, THREE.AdditiveBlending); this.flash.position.copy(this.at); this.flash.scale.setScalar(4);
    this.fireballs = Array.from({ length: 7 }, (_, i) => {
      const s = this.sprite(this.fireTex, 0.95, THREE.AdditiveBlending);
      s.position.copy(this.at).add(new THREE.Vector3(rnd(-4, 4), rnd(0, 3), rnd(-4, 4)));
      s.userData = { grow: rnd(16, 30), delay: i * 0.05 };
      return s;
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.4, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(this.at.x, groundY + 0.15, this.at.z); this.root.add(ring); this.ring = ring;
    const scorch = new THREE.Mesh(new THREE.CircleGeometry(14, 40), new THREE.MeshBasicMaterial({ color: 0x0a0806, transparent: true, opacity: 0.8, depthWrite: false }));
    scorch.rotation.x = -Math.PI / 2; scorch.position.set(this.at.x, groundY + 0.08, this.at.z); this.root.add(scorch);
    this.light = new THREE.PointLight(0xff7a2a, 4000, 260, 1.6); this.light.position.copy(this.at).add(new THREE.Vector3(0, 6, 0)); this.root.add(this.light);

    // debris: pieces of the airframe thrown forward and out, a few of them burning
    const metal = new THREE.MeshStandardMaterial({ color: 0x2a2f36, metalness: 0.7, roughness: 0.45 });
    const skin = new THREE.MeshStandardMaterial({ color: paint, metalness: 0.4, roughness: 0.5 });
    this.debris = Array.from({ length: 28 }, (_, i) => {
      const big = i < 6;
      const m = new THREE.Mesh(new THREE.BoxGeometry(big ? rnd(1.5, 3.5) : rnd(0.3, 1.2), big ? rnd(0.2, 0.6) : rnd(0.1, 0.4), big ? rnd(1, 2.5) : rnd(0.3, 1.0)), i % 3 ? skin : metal);
      m.position.copy(this.at).add(new THREE.Vector3(rnd(-1, 1), rnd(0.5, 2), rnd(-1, 1)));
      const sp = big ? rnd(8, 18) : rnd(12, 34);
      const out = this.dir.clone().multiplyScalar(rnd(0.3, 1.2)).add(new THREE.Vector3(rnd(-1, 1), 0, rnd(-1, 1))).normalize();
      this.root.add(m);
      return { m, v: out.multiplyScalar(sp).add(new THREE.Vector3(0, rnd(6, big ? 14 : 22), 0)), s: new THREE.Vector3(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)), burn: i < 5, rest: false };
    });

    // flames + smoke: pools of sprites recycled continuously
    this.flames = Array.from({ length: 220 }, () => { const s = this.sprite(this.fireTex, 0, THREE.AdditiveBlending); s.userData = { life: 0, age: 9 }; return s; });
    this.smoke = Array.from({ length: 70 }, () => { const s = this.sprite(this.smokeTex, 0, THREE.NormalBlending); s.userData = { life: 0, age: 99 }; return s; });
    this.emitT = 0;

    // ejection: rocket seat up, seat drops away, colourful parachute opens, pilot floats down
    this.pilot = createSeatedPilot();
    this.pilot.position.copy(this.at).add(new THREE.Vector3(0, 2, 0));
    this.root.add(this.pilot);
    this.pilotV = new THREE.Vector3(this.dir.x * 4, 42, this.dir.z * 4);
    this.chute = this.parachute(); this.chute.visible = false; this.chute.scale.setScalar(0.05);
    this.pilot.add(this.chute);
    this.trail = [];
    this.opened = false;

    // crash camera: start behind and above the impact, then circle slowly
    this.camYaw = Math.atan2(-this.dir.x, -this.dir.z) + 0.6;
    this.shake = 1.4;
  }

  sprite(tex, opacity, blending) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending, fog: true }));
    this.root.add(s); return s;
  }

  // 12 coloured gores on a dome + suspension lines
  parachute() {
    const g = new THREE.Group();
    const cols = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xec4899, 0xffffff, 0xef4444, 0xfacc15, 0x3b82f6];
    cols.forEach((c, i) => {
      const geo = new THREE.SphereGeometry(4.2, 4, 10, (i / 12) * Math.PI * 2, Math.PI * 2 / 12, 0, Math.PI * 0.42);
      g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, side: THREE.DoubleSide, emissive: c, emissiveIntensity: 0.12 })));
    });
    g.children.forEach((m) => { m.position.y = 6.2; m.scale.y = 0.75; });
    const pts = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * 3.85, 7.2, Math.sin(a) * 3.85), new THREE.Vector3(0, 1.1, 0)); }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xe5e7eb })));
    return g;
  }

  emitFlame(at, size) {
    const s = this.flames.find((f) => f.userData.age >= f.userData.life);
    if (!s) return;
    s.position.copy(at).add(new THREE.Vector3(rnd(-1, 1) * size * 0.5, rnd(0, 0.5), rnd(-1, 1) * size * 0.5));
    s.userData = { life: rnd(0.6, 1.3), age: 0, size: size * rnd(0.8, 1.4), up: rnd(4, 9) };
  }
  emitSmoke(at) {
    const s = this.smoke.find((f) => f.userData.age >= f.userData.life);
    if (!s) return;
    s.position.copy(at).add(new THREE.Vector3(rnd(-2, 2), rnd(2, 5), rnd(-2, 2)));
    s.userData = { life: rnd(4, 7), age: 0, size: rnd(4, 7), up: rnd(4, 8) };
  }

  update(dt) {
    if (!this.active) return false;
    this.t += dt;
    const t = this.t;
    // flash and fireball
    this.flash.material.opacity = Math.max(0, 1 - t / 0.35); this.flash.scale.setScalar(4 + t * 120);
    this.fireballs.forEach((s) => {
      const u = Math.max(0, t - s.userData.delay);
      s.scale.setScalar(2 + Math.min(1, u / 0.6) * s.userData.grow);
      s.material.opacity = Math.max(0, 0.95 - u / 1.6);
      s.position.y += dt * 4;
    });
    const rq = Math.min(1, t / 1.1);
    this.ring.scale.setScalar(1 + rq * 45); this.ring.material.opacity = 0.85 * (1 - rq);
    this.light.intensity = (t < 0.4 ? 9000 : 2500 + Math.random() * 1800) * Math.max(0.35, 1 - t / DURATION);

    // debris with gravity, ground bounce and spin
    for (const d of this.debris) {
      if (d.rest) continue;
      d.v.y -= G * dt;
      d.m.position.addScaledVector(d.v, dt);
      d.m.rotation.x += d.s.x * dt; d.m.rotation.y += d.s.y * dt; d.m.rotation.z += d.s.z * dt;
      if (d.m.position.y < this.ground + 0.2) {
        d.m.position.y = this.ground + 0.2;
        if (Math.abs(d.v.y) < 2.5) { d.rest = true; continue; }
        d.v.y *= -0.3; d.v.x *= 0.55; d.v.z *= 0.55; d.s.multiplyScalar(0.5);
      }
    }
    // flames: the main wreck burns big, the burning debris pieces smaller; smoke column above
    this.emitT += dt;
    const fade = Math.max(0.25, 1 - t / (DURATION * 1.2));
    while (this.emitT > 0.012) {
      this.emitT -= 0.012;
      this.emitFlame(this.at, 13 * fade); this.emitFlame(this.at, 9 * fade);
      const b = this.debris[Math.floor(Math.random() * 5)];
      if (b) this.emitFlame(b.m.position, 2.2 * fade);
      if (Math.random() < 0.18) this.emitSmoke(this.at);
    }
    for (const s of this.flames) {
      const u = s.userData; if (u.age >= u.life) { s.material.opacity = 0; continue; }
      u.age += dt; const q = u.age / u.life;
      s.position.y += u.up * dt;
      s.scale.setScalar(u.size * (1 - q * 0.6));
      s.material.opacity = 0.9 * (1 - q);
      s.material.color.setRGB(1, 1 - q * 0.55, 1 - q * 0.9);
    }
    for (const s of this.smoke) {
      const u = s.userData; if (u.age >= u.life) { s.material.opacity = 0; continue; }
      u.age += dt; const q = u.age / u.life;
      s.position.y += u.up * dt; s.position.x += dt * 1.5;
      s.scale.setScalar(u.size * (1 + q * 3));
      s.material.opacity = 0.75 * Math.sin(Math.PI * Math.min(1, q * 1.2));
    }

    // ejection seat and parachute
    const p = this.pilot;
    if (!this.opened) {
      this.pilotV.y -= G * dt;
      p.position.addScaledVector(this.pilotV, dt);
      p.rotation.x += dt * 1.5;
      if (t < 0.9) {   // rocket motor trail
        const f = this.sprite(this.fireTex, 0.9, THREE.AdditiveBlending); f.position.copy(p.position); f.scale.setScalar(2.2);
        const s = this.sprite(this.smokeTex, 0.6, THREE.NormalBlending); s.position.copy(p.position); s.scale.setScalar(2.5);
        this.trail.push([f, 0], [s, 0]);
      }
      if (t > 1.6) { this.opened = true; this.chute.visible = true; this.openAt = t; p.rotation.set(0, 0, 0); }
    } else {
      const u = Math.min(1, (t - this.openAt) / 0.7);
      this.chute.scale.setScalar(0.05 + 0.95 * (1 - Math.pow(1 - u, 3)));
      if (p.position.y > this.ground + 0.4) {
        p.position.y -= dt * (u < 1 ? 14 * (1 - u) + 5 : 5);
        p.position.x += this.dir.x * dt * 2.5; p.position.z += this.dir.z * dt * 2.5;
        p.rotation.z = Math.sin(t * 1.6) * 0.12; p.rotation.x = Math.cos(t * 1.3) * 0.08;
      } else { p.rotation.set(0, 0, 0); this.chute.rotation.x = Math.min(1.3, this.chute.rotation.x + dt * 0.6); }
    }
    for (const tr of this.trail) {
      tr[1] += dt; const [s, age] = tr;
      s.material.opacity = Math.max(0, (s.material.blending === THREE.AdditiveBlending ? 0.9 : 0.6) * (1 - age / 2.5));
      s.scale.setScalar(2.2 + age * 2.5);
    }
    this.shake *= Math.pow(0.12, dt);
    return t < DURATION;
  }

  // the crash camera: circles between the wreck and the pilot, a little shake from the blast
  applyCamera(camera) {
    if (!this.active) return;
    const look = this.at.clone().lerp(this.pilot.position, this.opened ? 0.45 : 0.2);
    look.y = Math.max(look.y, this.ground + 6);
    const yaw = this.camYaw + this.t * 0.12;
    const dist = 46 + Math.min(40, this.pilot.position.y - this.ground) * 0.5;
    camera.position.set(look.x + Math.sin(yaw) * dist, Math.max(look.y + 14, this.ground + 18), look.z + Math.cos(yaw) * dist);
    camera.position.x += (Math.random() - 0.5) * this.shake * 1.6; camera.position.y += (Math.random() - 0.5) * this.shake * 1.6;
    camera.lookAt(look);
  }

  clear() {
    if (this.root) {
      this.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      this.scene.remove(this.root);
    }
    this.root = null; this.active = false;
  }
}
