// The jet's exhaust trail (main.py:887 FlightTrajectory: a point every 6 px, each fades over 1,800 frames;
// main.py:2477 only the jet you fly shows it). A ribbon that faces the camera, widening as it ages, thicker
// at contrail heights (above ~26,000 ft). Ring buffer, fixed-size geometry: nothing is created per frame.
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, type Vector3 } from 'three';
import { FT, PX_M } from '../config';

const POINTS = 420; // main.py:887 max_points
const SPACING_M = 6 * PX_M * 1.5; // main.py:887 spacing 6 px (a bit wider: the jet is 3x faster here)
const LIFE_FRAMES = 1800; // main.py:887
const W0 = 2.5; // m, fresh width
const W1 = 14; // m, at the end of its life

export class Contrail {
  readonly mesh: Mesh;
  private px = new Float32Array(POINTS);
  private py = new Float32Array(POINTS);
  private pz = new Float32Array(POINTS);
  private born = new Float64Array(POINTS);
  private head = 0; // next slot
  private count = 0;
  private pos: BufferAttribute;
  private col: BufferAttribute;
  private geo: BufferGeometry;
  private mat: MeshBasicMaterial;

  constructor() {
    this.geo = new BufferGeometry();
    this.pos = new BufferAttribute(new Float32Array(POINTS * 2 * 3), 3);
    this.col = new BufferAttribute(new Float32Array(POINTS * 2 * 4), 4);
    this.geo.setAttribute('position', this.pos);
    this.geo.setAttribute('color', this.col);
    const idx = new Uint16Array((POINTS - 1) * 6);
    for (let i = 0; i < POINTS - 1; i++) {
      const a = i * 2;
      idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], i * 6);
    }
    this.geo.setIndex(new BufferAttribute(idx, 1));
    this.mat = new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: DoubleSide });
    this.mesh = new Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
  }

  clear(): void {
    this.count = 0;
    this.head = 0;
    this.geo.setDrawRange(0, 0);
  }

  /** One 60 Hz frame: add a point when the jet has moved far enough. */
  record(p: Vector3, frame: number): void {
    if (this.count > 0) {
      const last = (this.head - 1 + POINTS) % POINTS;
      const dx = p.x - this.px[last], dy = p.y - this.py[last], dz = p.z - this.pz[last];
      if (dx * dx + dy * dy + dz * dz < SPACING_M * SPACING_M) return;
    }
    this.px[this.head] = p.x;
    this.py[this.head] = p.y;
    this.pz[this.head] = p.z;
    this.born[this.head] = frame;
    this.head = (this.head + 1) % POINTS;
    this.count = Math.min(POINTS, this.count + 1);
  }

  /** Draw-side: build the ribbon facing the camera; `head` joins it to the jet (main.py:254 head). */
  update(cam: Vector3, head: Vector3, frame: number, night: number): void {
    const n = this.count;
    if (n < 1) {
      this.geo.setDrawRange(0, 0);
      return;
    }
    const pos = this.pos.array as Float32Array;
    const col = this.col.array as Float32Array;
    const bright = 1 - 0.8 * night;
    // newest first: v = 0 is the jet itself
    let vi = 0;
    let prevX = head.x, prevY = head.y, prevZ = head.z;
    let along = 0; // metres from the jet along the trail
    for (let k = -1; k < n; k++) {
      let x: number, y: number, z: number, age: number;
      if (k < 0) {
        x = head.x; y = head.y; z = head.z; age = 0;
      } else {
        const i = (this.head - 1 - k + POINTS * 2) % POINTS;
        x = this.px[i]; y = this.py[i]; z = this.pz[i];
        age = frame - this.born[i];
      }
      const fresh = Math.max(0, 1 - age / LIFE_FRAMES);
      along += Math.hypot(x - prevX, y - prevY, z - prevZ);
      // direction along the trail, and across it facing the camera
      let tx = prevX - x, ty = prevY - y, tz = prevZ - z;
      if (k <= 0) {
        const j = (this.head - 1 + POINTS) % POINTS;
        tx = head.x - this.px[j]; ty = head.y - this.py[j]; tz = head.z - this.pz[j];
      }
      const cx = cam.x - x, cy = cam.y - y, cz = cam.z - z;
      let sx = ty * cz - tz * cy, sy = tz * cx - tx * cz, sz = tx * cy - ty * cx;
      const sl = Math.hypot(sx, sy, sz) || 1;
      const w = (W0 + (W1 - W0) * (1 - fresh)) / 2 / sl;
      sx *= w; sy *= w; sz *= w;
      pos[vi * 6] = x - sx; pos[vi * 6 + 1] = y - sy; pos[vi * 6 + 2] = z - sz;
      pos[vi * 6 + 3] = x + sx; pos[vi * 6 + 4] = y + sy; pos[vi * 6 + 5] = z + sz;
      // thicker where real contrails form; a faint exhaust trail lower down
      const altFt = y / FT;
      const contrail = 0.25 + 0.75 * Math.min(1, Math.max(0, (altFt - 24000) / 6000));
      // the chase camera sits inside the newest part of the trail: fade it in over the first 400 m
      const near = Math.min(1, Math.max(0, (along - 60) / 340));
      const a = (0.14 + 0.86 * fresh) * 0.28 * contrail * near; // main.py:271 alpha
      for (let s = 0; s < 2; s++) {
        const o = (vi * 2 + s) * 4;
        col[o] = bright; col[o + 1] = bright; col[o + 2] = bright * 1.02; col[o + 3] = a;
      }
      prevX = x; prevY = y; prevZ = z;
      vi++;
      if (vi >= POINTS) break;
    }
    this.pos.needsUpdate = true;
    this.col.needsUpdate = true;
    this.geo.setDrawRange(0, Math.max(0, (vi - 1) * 6));
  }
}
