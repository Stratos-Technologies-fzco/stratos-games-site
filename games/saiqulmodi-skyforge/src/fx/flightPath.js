// Fighter flight-path visuals (fighter upgrade, phase 2, 09-Nov-2026)
//  - Past path: a glowing ribbon from each wing tip for the last 20 s, coloured by what the aircraft was doing:
//      cyan = normal, amber = Mach 0.85-1.2, white = above Mach 1.2, red = pulling more than 5 g
//  - Future path: dots along where the aircraft will be over the next 8 s if the controls stay as they are
//  - Ghost guide: rings in the sky along the path of the manoeuvre being flown (src/flight/maneuvers.js);
//    the next rings are bright, the ones already passed fade
//  - Contrails: long white trails from both engines above 8,000 m
// Ribbons face the camera so they read from any angle. Everything is pre-allocated; nothing is created per frame.
import * as THREE from 'three';

const TIP = new THREE.Vector3(4.75, 0.05, 2.9);     // right wing tip, airframe axes (same as src/fx/fighterFx.js)
const NOZZLE = new THREE.Vector3(0.62, 0.02, 5.6);  // right engine exit
const COLORS = {
  normal: new THREE.Color(0.25, 0.9, 1.0),
  transonic: new THREE.Color(1.0, 0.62, 0.12),
  supersonic: new THREE.Color(1.0, 1.0, 1.0),
  highG: new THREE.Color(1.0, 0.16, 0.1)
};

// A strip of quads through sample points, newest first, turned to face the camera every frame
class Ribbon {
  constructor(scene, count, { blending, life, width, alpha }) {
    this.n = count;
    this.life = life; this.width = width; this.alpha = alpha;
    this.center = new Float32Array(count * 3);
    this.tangent = new Float32Array(count * 3);
    this.rgb = new Float32Array(count * 3);
    this.strength = new Float32Array(count);
    this.born = new Float32Array(count).fill(-1e9);
    const geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(count * 2 * 3);
    this.col = new Float32Array(count * 2 * 4);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    const idx = [];
    for (let i = 0; i < count - 1; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    geo.setIndex(idx);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending, toneMapped: false
    }));
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.last = new THREE.Vector3();
    this.hasLast = false;
  }

  clear() { this.strength.fill(0); this.hasLast = false; }

  // newest sample at index 0; strength 0 = a gap (the strip is not drawn across it)
  push(p, color, strength, now) {
    const c = this.center, t = this.tangent;
    c.copyWithin(3, 0, (this.n - 1) * 3); t.copyWithin(3, 0, (this.n - 1) * 3);
    this.rgb.copyWithin(3, 0, (this.n - 1) * 3);
    this.strength.copyWithin(1, 0, this.n - 1); this.born.copyWithin(1, 0, this.n - 1);
    c[0] = p.x; c[1] = p.y; c[2] = p.z;
    if (this.hasLast) { const dx = p.x - this.last.x, dy = p.y - this.last.y, dz = p.z - this.last.z, l = Math.hypot(dx, dy, dz) || 1; t[0] = dx / l; t[1] = dy / l; t[2] = dz / l; }
    this.rgb[0] = color.r; this.rgb[1] = color.g; this.rgb[2] = color.b;
    this.strength[0] = strength; this.born[0] = now;
    this.last.copy(p); this.hasLast = true;
  }

  update(now, cam) {
    let any = false;
    const { pos, col, center: c, tangent: t } = this;
    for (let i = 0; i < this.n; i++) {
      const age = now - this.born[i];
      let a = this.strength[i] > 0 && (i === this.n - 1 || this.strength[i + 1] > 0 || (i > 0 && this.strength[i - 1] > 0)) ? this.alpha(age / this.life) * this.strength[i] : 0;
      if (age > this.life) a = 0;
      const k = 3 * i;
      // side = tangent x (towards the camera), so the strip is seen face-on
      const vx = cam.x - c[k], vy = cam.y - c[k + 1], vz = cam.z - c[k + 2];
      // fades out close to the camera so the strip never fills the view as it passes the chase camera
      const camDist = Math.hypot(vx, vy, vz);
      a *= Math.min(1, Math.max(0, (camDist - 30) / 90));
      let sx = t[k + 1] * vz - t[k + 2] * vy, sy = t[k + 2] * vx - t[k] * vz, sz = t[k] * vy - t[k + 1] * vx;
      const sl = Math.hypot(sx, sy, sz) || 1, w = this.width(Math.max(0, age)) / sl;
      sx *= w; sy *= w; sz *= w;
      pos[6 * i] = c[k] - sx; pos[6 * i + 1] = c[k + 1] - sy; pos[6 * i + 2] = c[k + 2] - sz;
      pos[6 * i + 3] = c[k] + sx; pos[6 * i + 4] = c[k + 1] + sy; pos[6 * i + 5] = c[k + 2] + sz;
      for (let j = 0; j < 2; j++) {
        const o = 8 * i + 4 * j;
        col[o] = this.rgb[k]; col[o + 1] = this.rgb[k + 1]; col[o + 2] = this.rgb[k + 2]; col[o + 3] = a;
      }
      if (a > 0.003) any = true;
    }
    this.mesh.visible = any;
    if (any) {
      this.mesh.geometry.attributes.position.needsUpdate = true;
      this.mesh.geometry.attributes.color.needsUpdate = true;
    }
  }
}

export class FlightPathFx {
  constructor(scene) {
    this.scene = scene;
    const tipOpts = { blending: THREE.AdditiveBlending, life: 20, width: (age) => 0.3 + age * 0.06, alpha: (x) => 0.55 * (1 - x) ** 1.5 };
    this.tips = [new Ribbon(scene, 400, tipOpts), new Ribbon(scene, 400, tipOpts)];
    const conOpts = { blending: THREE.NormalBlending, life: 30, width: (age) => 0.6 + age * 0.35, alpha: (x) => 0.55 * (1 - x) * Math.min(1, x * 40) };
    this.contrails = [new Ribbon(scene, 300, conOpts), new Ribbon(scene, 300, conOpts)];
    this.tipGap = 0; this.conGap = 0;
    this.now = 0;
    this.q = new THREE.Quaternion();
    this.p = new THREE.Vector3();
    this.lastPos = new THREE.Vector3();
    this.color = new THREE.Color();

    // Future path: 24 dots, one every 0.35 s
    this.futureN = 24;
    const fgeo = new THREE.BufferGeometry();
    this.futurePos = new Float32Array(this.futureN * 3);
    fgeo.setAttribute('position', new THREE.BufferAttribute(this.futurePos, 3).setUsage(THREE.DynamicDrawUsage));
    this.future = new THREE.Points(fgeo, new THREE.PointsMaterial({ color: 0x7dffb0, size: 5, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }));
    this.future.frustumCulled = false;
    this.future.visible = false;
    scene.add(this.future);
    this.omega = new THREE.Vector3();
    this.prevVel = new THREE.Vector3();
    this._w = new THREE.Vector3(); this._d = new THREE.Vector3(); this._x = new THREE.Vector3(); this._qq = new THREE.Quaternion();

    // Ghost guide: a faint line plus up to 80 rings
    this.ringMax = 80;
    const ringGeo = new THREE.TorusGeometry(9, 0.35, 6, 32);
    this.rings = new THREE.InstancedMesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), this.ringMax);
    this.rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rings.frustumCulled = false;
    this.rings.visible = false;
    scene.add(this.rings);
    const lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(900 * 3), 3));
    this.ghostLine = new THREE.Line(lgeo, new THREE.LineBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false }));
    this.ghostLine.frustumCulled = false;
    this.ghostLine.visible = false;
    scene.add(this.ghostLine);
    this.ringIdx = [];
    this.ringColor = new THREE.Color();
    this.lastPassed = -1;
    this.ghostFade = 0;
    this._m = new THREE.Matrix4(); this._s = new THREE.Vector3(1, 1, 1); this._z = new THREE.Vector3(0, 0, 1);
  }

  // points: THREE.Vector3[] of the manoeuvre's path, or null to clear
  setGhost(points) {
    this.ghost = points;
    this.lastPassed = -1;
    this.ghostFade = 0;
    if (!points) { this.rings.visible = this.ghostLine.visible = false; return; }
    const n = Math.min(points.length, 900);
    const arr = this.ghostLine.geometry.attributes.position.array;
    for (let i = 0; i < n; i++) { arr[3 * i] = points[i].x; arr[3 * i + 1] = points[i].y; arr[3 * i + 2] = points[i].z; }
    this.ghostLine.geometry.setDrawRange(0, n);
    this.ghostLine.geometry.attributes.position.needsUpdate = true;
    this.ghostLine.visible = true;
    // a ring about every 250 m along the path
    this.ringIdx = [];
    let run = 0;
    for (let i = 1; i < n && this.ringIdx.length < this.ringMax; i++) {
      run += points[i].distanceTo(points[i - 1]);
      if (run >= 250) { this.ringIdx.push(i); run = 0; }
    }
    this.ringIdx.forEach((pi, r) => {
      const a = points[Math.max(0, pi - 1)], b = points[Math.min(n - 1, pi + 1)];
      this._x.copy(b).sub(a).normalize();
      this._qq.setFromUnitVectors(this._z, this._x);
      this._m.compose(points[pi], this._qq, this._s);
      this.rings.setMatrixAt(r, this._m);
    });
    this.rings.count = this.ringIdx.length;
    this.rings.instanceMatrix.needsUpdate = true;
    this.paintRings(0);
    this.rings.visible = this.ringIdx.length > 0;
  }

  // passedIdx: nearest ghost point the aircraft has reached (ManeuverScore.i)
  paintRings(passedIdx) {
    this.ringIdx.forEach((pi, r) => {
      const ahead = pi >= passedIdx;
      const next = ahead && this.ringIdx.filter((q) => q >= passedIdx).indexOf(pi) < 3;
      this.ringColor.setRGB(0.55, 0.85, 1).multiplyScalar(next ? 0.95 : ahead ? 0.4 : 0.08);
      this.rings.setColorAt(r, this.ringColor);
    });
    if (this.rings.instanceColor) this.rings.instanceColor.needsUpdate = true;
  }

  // hAmslM: height above sea level (contrails above 8,000 m); passedIdx: ghost progress (or -1); camPos: camera position
  update(dt, state, active, hAmslM, camPos, passedIdx = -1) {
    this.now += dt;
    const flying = active && !state.onGround;
    // a jump (new start, approach, crash reset) breaks every strip
    if (this.lastPos.distanceToSquared(state.pos) > 400 * 400) { this.tips.forEach((r) => r.clear()); this.contrails.forEach((r) => r.clear()); }
    this.lastPos.copy(state.pos);
    this.q.setFromEuler(state.rot);

    // Past path from the wing tips
    this.tipGap += dt;
    if (this.tipGap >= 0.05) {
      this.tipGap = 0;
      const g = state.loadG || 1, m = state.mach || 0;
      const col = g > 5 ? COLORS.highG : m > 1.2 ? COLORS.supersonic : m >= 0.85 ? COLORS.transonic : COLORS.normal;
      this.tips.forEach((r, side) => {
        this.p.copy(TIP); if (side) this.p.x = -this.p.x;
        this.p.applyQuaternion(this.q).add(state.pos);
        r.push(this.p, col, flying ? 1 : 0, this.now);
      });
    }
    // Contrails above 8,000 m
    this.conGap += dt;
    if (this.conGap >= 0.1) {
      this.conGap = 0;
      const on = flying && hAmslM > 8000 ? Math.min(1, (hAmslM - 8000) / 800) : 0;
      this.contrails.forEach((r, side) => {
        this.p.copy(NOZZLE); if (side) this.p.x = -this.p.x;
        this.p.applyQuaternion(this.q).add(state.pos);
        r.push(this.p, COLORS.supersonic, on, this.now);
      });
    }
    this.tips.forEach((r) => r.update(this.now, camPos));
    this.contrails.forEach((r) => r.update(this.now, camPos));

    // Future path: the flight path's present turn rate, carried on for 8 s
    if (flying && dt > 0) {
      const v2 = state.vel.lengthSq();
      if (v2 > 100 && this.prevVel.lengthSq() > 100) {
        this._w.crossVectors(this.prevVel, state.vel).divideScalar(v2 * dt);
        this.omega.lerp(this._w, Math.min(1, dt / 0.3));
      }
      this.prevVel.copy(state.vel);
      const w = this.omega.length();
      this._d.copy(state.vel);
      this._x.copy(state.pos);
      const step = 0.35;
      if (w > 1e-5) this._qq.setFromAxisAngle(this._w.copy(this.omega).divideScalar(w), w * step);
      for (let i = 0; i < this.futureN; i++) {
        if (w > 1e-5) this._d.applyQuaternion(this._qq);
        this._x.addScaledVector(this._d, step);
        this.futurePos[3 * i] = this._x.x; this.futurePos[3 * i + 1] = this._x.y; this.futurePos[3 * i + 2] = this._x.z;
      }
      this.future.geometry.attributes.position.needsUpdate = true;
      this.future.visible = true;
    } else {
      this.future.visible = false;
      this.prevVel.copy(state.vel);
    }

    // Ghost rings: brighten the next ones as the aircraft goes along
    if (this.ghost && passedIdx >= 0 && passedIdx !== this.lastPassed) { this.lastPassed = passedIdx; this.paintRings(passedIdx); }
  }
}
