// Fighter flight-path visuals and air effects brought over from the SkyForge fighter (src/fx/flightPath.js and
// src/fx/fighterFx.js there):
//  - Past path: a glowing ribbon from each wing tip for the last 20 s, coloured by what the jet was doing:
//      cyan = normal, amber = Mach 0.85-1.2, white = above Mach 1.2, red = pulling more than 5 G
//  - Future path: dots along where the jet will be over the next 8 s if the controls stay as they are
//  - Missile paths: the same prediction for every missile in the air, 6 s ahead: red = coming at you,
//    blue = your own AGM / AAM (their full flown trails are drawn by MissileTrails as before)
//  - Vapour cone just round Mach 1, and vapour over the top of the wings in a hard pull at high angle of attack
//    in the lower, wetter air
// Everything is pre-allocated; nothing is created per frame.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  DoubleSide,
  DynamicDrawUsage,
  type Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  Quaternion,
  type Scene,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Blending,
} from 'three';

const TIP = new Vector3(5.2, 0.05, 3.4); // right wing tip, jet axes (JetModel.WINGTIPS)
const COLORS = {
  normal: new Color(0.25, 0.9, 1.0),
  transonic: new Color(1.0, 0.62, 0.12),
  supersonic: new Color(1.0, 1.0, 1.0),
  highG: new Color(1.0, 0.16, 0.1),
};

/** a strip of quads through sample points, newest first, turned to face the camera every frame */
class ColourRibbon {
  readonly mesh: Mesh;
  private n: number;
  private center: Float32Array;
  private tangent: Float32Array;
  private rgb: Float32Array;
  private strength: Float32Array;
  private born: Float32Array;
  private pos: Float32Array;
  private col: Float32Array;
  private last = new Vector3();
  private hasLast = false;

  constructor(
    scene: Scene,
    count: number,
    private o: { blending: Blending; life: number; width: (age: number) => number; alpha: (x: number) => number },
  ) {
    this.n = count;
    this.center = new Float32Array(count * 3);
    this.tangent = new Float32Array(count * 3);
    this.rgb = new Float32Array(count * 3);
    this.strength = new Float32Array(count);
    this.born = new Float32Array(count).fill(-1e9);
    this.pos = new Float32Array(count * 6);
    this.col = new Float32Array(count * 8);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(this.pos, 3).setUsage(DynamicDrawUsage));
    geo.setAttribute('color', new BufferAttribute(this.col, 4).setUsage(DynamicDrawUsage));
    const idx: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      const a = 2 * i;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geo.setIndex(idx);
    this.mesh = new Mesh(
      geo,
      new MeshBasicMaterial({ vertexColors: true, transparent: true, side: DoubleSide, depthWrite: false, blending: o.blending, toneMapped: false, fog: false }),
    );
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  clear(): void {
    this.strength.fill(0);
    this.hasLast = false;
  }

  /** newest sample at index 0; strength 0 = a gap */
  push(p: Vector3, color: Color, strength: number, now: number): void {
    const c = this.center;
    const t = this.tangent;
    const n = this.n;
    if (!this.hasLast) {
      // a fresh strip: every slot starts at the first point, so no quad stretches back to the world origin
      for (let i = 0; i < n; i++) {
        c[3 * i] = p.x;
        c[3 * i + 1] = p.y;
        c[3 * i + 2] = p.z;
      }
      this.strength.fill(0);
    }
    c.copyWithin(3, 0, (n - 1) * 3);
    t.copyWithin(3, 0, (n - 1) * 3);
    this.rgb.copyWithin(3, 0, (n - 1) * 3);
    this.strength.copyWithin(1, 0, n - 1);
    this.born.copyWithin(1, 0, n - 1);
    c[0] = p.x;
    c[1] = p.y;
    c[2] = p.z;
    if (this.hasLast) {
      const dx = p.x - this.last.x;
      const dy = p.y - this.last.y;
      const dz = p.z - this.last.z;
      const l = Math.hypot(dx, dy, dz) || 1;
      t[0] = dx / l;
      t[1] = dy / l;
      t[2] = dz / l;
    }
    this.rgb[0] = color.r;
    this.rgb[1] = color.g;
    this.rgb[2] = color.b;
    this.strength[0] = strength;
    this.born[0] = now;
    this.last.copy(p);
    this.hasLast = true;
  }

  update(now: number, cam: Vector3, dim: number): void {
    let any = false;
    const { pos, col, center: c, tangent: t, n } = this;
    for (let i = 0; i < n; i++) {
      const age = now - this.born[i];
      const linked = this.strength[i] > 0 && (i === n - 1 || this.strength[i + 1] > 0 || (i > 0 && this.strength[i - 1] > 0));
      let a = linked && age <= this.o.life ? this.o.alpha(age / this.o.life) * this.strength[i] * dim : 0;
      const k = 3 * i;
      const vx = cam.x - c[k];
      const vy = cam.y - c[k + 1];
      const vz = cam.z - c[k + 2];
      // fades out close to the camera so the strip never fills the view as it passes the chase camera
      a *= Math.min(1, Math.max(0, (Math.hypot(vx, vy, vz) - 30) / 90));
      let sx = t[k + 1] * vz - t[k + 2] * vy;
      let sy = t[k + 2] * vx - t[k] * vz;
      let sz = t[k] * vy - t[k + 1] * vx;
      const w = this.o.width(Math.max(0, age)) / (Math.hypot(sx, sy, sz) || 1);
      sx *= w;
      sy *= w;
      sz *= w;
      pos[6 * i] = c[k] - sx;
      pos[6 * i + 1] = c[k + 1] - sy;
      pos[6 * i + 2] = c[k + 2] - sz;
      pos[6 * i + 3] = c[k] + sx;
      pos[6 * i + 4] = c[k + 1] + sy;
      pos[6 * i + 5] = c[k + 2] + sz;
      for (let j = 0; j < 2; j++) {
        const o = 8 * i + 4 * j;
        col[o] = this.rgb[k];
        col[o + 1] = this.rgb[k + 1];
        col[o + 2] = this.rgb[k + 2];
        col[o + 3] = a;
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

/** anything flying whose path can be predicted */
export interface Flyer {
  active: boolean;
  pos: Vector3;
  vel: Vector3;
}

const FUTURE_N = 24; // jet: one dot every 0.35 s = 8.4 s
const MSL_SLOTS = 24;
const MSL_DOTS = 12; // missiles: one dot every 0.5 s = 6 s

export interface JetState {
  pos: Vector3;
  vel: Vector3;
  quat: Quaternion;
  gLoad: number;
  mach: number;
  alpha: number;
}

export class FlightPathFx {
  private tips: ColourRibbon[];
  private now = 0;
  private tipGap = 0;
  private p = new Vector3();
  private lastPos = new Vector3();
  // jet future path
  private future: Points;
  private futurePos: Float32Array;
  private omega = new Vector3();
  private prevVel = new Vector3();
  private _w = new Vector3();
  private _d = new Vector3();
  private _x = new Vector3();
  private _q = new Quaternion();
  // missile paths
  private msl: Points;
  private mslPos: Float32Array;
  private mslCol: Float32Array;
  private mslPrev = new Map<Flyer, Vector3>();
  private mslOmega = new Map<Flyer, Vector3>();
  // vapour cone and wing vapour (children of the jet you fly)
  private cone: Mesh;
  private coneMat: MeshBasicMaterial;
  private vapour: Sprite[] = [];
  private vapourMat: SpriteMaterial;
  private vapourLevel = 0;
  private host: Group | null = null;

  constructor(scene: Scene) {
    const tipOpts = { blending: AdditiveBlending, life: 20, width: (age: number) => 0.3 + age * 0.06, alpha: (x: number) => 0.55 * (1 - x) ** 1.5 };
    this.tips = [new ColourRibbon(scene, 400, tipOpts), new ColourRibbon(scene, 400, tipOpts)];

    const fgeo = new BufferGeometry();
    this.futurePos = new Float32Array(FUTURE_N * 3);
    fgeo.setAttribute('position', new BufferAttribute(this.futurePos, 3).setUsage(DynamicDrawUsage));
    this.future = new Points(fgeo, new PointsMaterial({ color: 0x7dffb0, size: 5, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false, fog: false }));
    this.future.frustumCulled = false;
    this.future.visible = false;
    scene.add(this.future);

    const mgeo = new BufferGeometry();
    this.mslPos = new Float32Array(MSL_SLOTS * MSL_DOTS * 3);
    this.mslCol = new Float32Array(MSL_SLOTS * MSL_DOTS * 3);
    mgeo.setAttribute('position', new BufferAttribute(this.mslPos, 3).setUsage(DynamicDrawUsage));
    mgeo.setAttribute('color', new BufferAttribute(this.mslCol, 3).setUsage(DynamicDrawUsage));
    this.msl = new Points(mgeo, new PointsMaterial({ vertexColors: true, size: 4, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false, fog: false }));
    this.msl.frustumCulled = false;
    this.msl.visible = false;
    scene.add(this.msl);

    const coneGeo = new ConeGeometry(5.6, 8, 28, 1, true);
    coneGeo.rotateX(-Math.PI / 2); // tip towards the nose (-Z)
    this.coneMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: DoubleSide, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
    this.cone = new Mesh(coneGeo, this.coneMat);
    this.cone.position.z = 0.8;
    this.cone.visible = false;

    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (g) {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.45)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }
    this.vapourMat = new SpriteMaterial({ map: new CanvasTexture(c), transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, toneMapped: false });
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const k = i / 4;
        const sp = new Sprite(this.vapourMat);
        sp.position.set(side * (1.2 + 3.0 * k), 0.5 - 0.1 * k, -0.6 + 3.0 * k);
        sp.userData.base = 2.6 - 1.0 * k;
        sp.visible = false;
        this.vapour.push(sp);
      }
    }
  }

  /** the jet you fly: the cone and wing vapour ride on its model */
  attach(model: Group): void {
    if (this.host === model) return;
    this.host = model;
    model.add(this.cone);
    for (const s of this.vapour) model.add(s);
  }

  clear(): void {
    for (const r of this.tips) r.clear();
    this.mslPrev.clear();
    this.mslOmega.clear();
  }

  /** per display frame. flying: the player is flying the jet; missiles: everything in the air with a path */
  update(dt: number, j: JetState, flying: boolean, cam: Vector3, night: boolean, threats: Flyer[], own: Flyer[]): void {
    this.now += dt;
    // a jump (new jet, jet switch) breaks the strips
    if (this.lastPos.distanceToSquared(j.pos) > 2000 * 2000) for (const r of this.tips) r.clear();
    this.lastPos.copy(j.pos);

    // past path from the wing tips
    this.tipGap += dt;
    if (this.tipGap >= 0.05) {
      this.tipGap = 0;
      const col = j.gLoad > 5 ? COLORS.highG : j.mach > 1.2 ? COLORS.supersonic : j.mach >= 0.85 ? COLORS.transonic : COLORS.normal;
      this.tips.forEach((r, side) => {
        this.p.copy(TIP);
        if (side) this.p.x = -this.p.x;
        this.p.applyQuaternion(j.quat).add(j.pos);
        r.push(this.p, col, flying ? 1 : 0, this.now);
      });
    }
    for (const r of this.tips) r.update(this.now, cam, night ? 0.6 : 1);

    // future path: the flight path's present turn rate, carried on for 8 s
    if (flying && dt > 0) {
      const v2 = j.vel.lengthSq();
      if (v2 > 100 && this.prevVel.lengthSq() > 100) {
        this._w.crossVectors(this.prevVel, j.vel).divideScalar(v2 * dt);
        this.omega.lerp(this._w, Math.min(1, dt / 0.3));
      }
      this.prevVel.copy(j.vel);
      this.project(j.pos, j.vel, this.omega, 0.35, FUTURE_N, this.futurePos, 0);
      this.future.geometry.attributes.position.needsUpdate = true;
      this.future.visible = true;
    } else {
      this.future.visible = false;
      this.prevVel.copy(j.vel);
    }

    // missile paths
    let slot = 0;
    const seen = new Set<Flyer>();
    const doList = (list: Flyer[], r: number, g: number, b: number): void => {
      for (const m of list) {
        if (!m.active || slot >= MSL_SLOTS) continue;
        seen.add(m);
        let prev = this.mslPrev.get(m);
        let om = this.mslOmega.get(m);
        if (!prev || !om) {
          prev = m.vel.clone();
          om = new Vector3();
          this.mslPrev.set(m, prev);
          this.mslOmega.set(m, om);
        } else if (dt > 0) {
          const v2 = m.vel.lengthSq();
          if (v2 > 100 && prev.lengthSq() > 100) {
            this._w.crossVectors(prev, m.vel).divideScalar(v2 * dt);
            om.lerp(this._w, Math.min(1, dt / 0.25));
          }
          prev.copy(m.vel);
        }
        this.project(m.pos, m.vel, om, 0.5, MSL_DOTS, this.mslPos, slot * MSL_DOTS);
        for (let i = 0; i < MSL_DOTS; i++) {
          const f = 1 - (0.6 * i) / MSL_DOTS; // fainter further ahead
          const o = 3 * (slot * MSL_DOTS + i);
          this.mslCol[o] = r * f;
          this.mslCol[o + 1] = g * f;
          this.mslCol[o + 2] = b * f;
        }
        slot++;
      }
    };
    doList(threats, 1, 0.25, 0.2);
    doList(own, 0.4, 0.8, 1);
    for (const k of this.mslPrev.keys())
      if (!seen.has(k)) {
        this.mslPrev.delete(k);
        this.mslOmega.delete(k);
      }
    this.msl.geometry.setDrawRange(0, slot * MSL_DOTS);
    this.msl.visible = slot > 0;
    if (slot > 0) {
      this.msl.geometry.attributes.position.needsUpdate = true;
      this.msl.geometry.attributes.color.needsUpdate = true;
    }

    // vapour cone only just round the speed of sound
    const nearSound = Math.max(0, 1 - Math.abs(j.mach - 1) / 0.05);
    const coneGoal = flying ? nearSound * 0.28 : 0;
    this.coneMat.opacity += (coneGoal - this.coneMat.opacity) * Math.min(1, 8 * dt);
    this.cone.visible = this.coneMat.opacity > 0.01;
    if (this.cone.visible) this.cone.scale.setScalar(0.95 + Math.random() * 0.07);

    // wing vapour: angle of attack above 10 deg in a pull of more than 4 G, below about 4,500 m, below Mach 0.95
    const aoaDeg = (j.alpha * 180) / Math.PI;
    const low = 1 - Math.min(1, Math.max(0, (j.pos.y - 3000) / 1500));
    const vapGoal = flying && j.mach < 0.95 ? Math.min(1, Math.max(0, (aoaDeg - 10) / 6)) * Math.min(1, Math.max(0, (j.gLoad - 4) / 2)) * low : 0;
    this.vapourLevel += (vapGoal - this.vapourLevel) * Math.min(1, 6 * dt);
    this.vapourMat.opacity = 0.42 * this.vapourLevel;
    const on = this.vapourLevel > 0.02;
    for (const sp of this.vapour) {
      sp.visible = on;
      if (on) sp.scale.setScalar((sp.userData.base as number) * (0.85 + Math.random() * 0.3));
    }
  }

  /** dots along a path turning at rate omega (rad/s vector), `step` s apart */
  private project(pos: Vector3, vel: Vector3, omega: Vector3, step: number, n: number, out: Float32Array, first: number): void {
    const w = omega.length();
    this._d.copy(vel);
    this._x.copy(pos);
    if (w > 1e-5) this._q.setFromAxisAngle(this._w.copy(omega).divideScalar(w), w * step);
    for (let i = 0; i < n; i++) {
      if (w > 1e-5) this._d.applyQuaternion(this._q);
      this._x.addScaledVector(this._d, step);
      const o = 3 * (first + i);
      out[o] = this._x.x;
      out[o + 1] = this._x.y;
      out[o + 2] = this._x.z;
    }
  }
}
