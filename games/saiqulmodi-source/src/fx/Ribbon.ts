// A trail ribbon (main.py:224-273 FlightTrajectory): a point every `spacing` metres, each fading over `life`
// frames, drawn as a strip that faces the camera. It never gets thinner on screen than `minPx`-ish, so a
// missile's whole flight path stays readable from kilometres away. Fixed-size buffers: no allocation per frame.
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, type Vector3 } from 'three';

export interface RibbonStyle {
  points: number;
  spacing: number; // m
  life: number; // frames each point lasts
  width: number; // m, fresh
  widthOld: number; // m, at the end of its life
  color: [number, number, number];
  alpha: number;
  /** screen-size floor: width never below distance x this (0.0025 = ~2 px at a 65 deg view) */
  minAngular: number;
}

export class Ribbon {
  readonly mesh: Mesh;
  private px: Float32Array;
  private py: Float32Array;
  private pz: Float32Array;
  private born: Float64Array;
  private head = 0;
  private count = 0;
  private pos: BufferAttribute;
  private col: BufferAttribute;
  private geo: BufferGeometry;
  private style: RibbonStyle;
  /** frame of the newest point (to know when the whole ribbon has faded) */
  lastFrame = -1e9;

  constructor(style: RibbonStyle) {
    this.style = style;
    const n = style.points;
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.pz = new Float32Array(n);
    this.born = new Float64Array(n);
    this.geo = new BufferGeometry();
    this.pos = new BufferAttribute(new Float32Array(n * 2 * 3), 3);
    this.col = new BufferAttribute(new Float32Array(n * 2 * 4), 4);
    this.geo.setAttribute('position', this.pos);
    this.geo.setAttribute('color', this.col);
    const idx = new Uint32Array((n - 1) * 6);
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2;
      idx[i * 6] = a;
      idx[i * 6 + 1] = a + 1;
      idx[i * 6 + 2] = a + 2;
      idx[i * 6 + 3] = a + 1;
      idx[i * 6 + 4] = a + 3;
      idx[i * 6 + 5] = a + 2;
    }
    this.geo.setIndex(new BufferAttribute(idx, 1));
    this.mesh = new Mesh(this.geo, new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: DoubleSide }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    this.geo.setDrawRange(0, 0);
  }

  setColor(c: [number, number, number]): void {
    this.style = { ...this.style, color: c };
  }

  clear(): void {
    this.count = 0;
    this.head = 0;
    this.lastFrame = -1e9;
    this.geo.setDrawRange(0, 0);
  }

  /** true when every point has faded away */
  faded(frame: number): boolean {
    return this.count === 0 || frame - this.lastFrame > this.style.life;
  }

  record(p: Vector3, frame: number): void {
    if (this.count > 0) {
      const last = (this.head - 1 + this.style.points) % this.style.points;
      const dx = p.x - this.px[last], dy = p.y - this.py[last], dz = p.z - this.pz[last];
      if (dx * dx + dy * dy + dz * dz < this.style.spacing * this.style.spacing) return;
    }
    this.px[this.head] = p.x;
    this.py[this.head] = p.y;
    this.pz[this.head] = p.z;
    this.born[this.head] = frame;
    this.head = (this.head + 1) % this.style.points;
    this.count = Math.min(this.style.points, this.count + 1);
    this.lastFrame = frame;
  }

  /** Draw-side: rebuild the strip facing the camera. */
  update(cam: Vector3, frame: number, dim = 1): void {
    const n = this.count;
    if (n < 2) {
      this.geo.setDrawRange(0, 0);
      return;
    }
    const st = this.style;
    const pos = this.pos.array as Float32Array;
    const col = this.col.array as Float32Array;
    let vi = 0;
    for (let k = 0; k < n; k++) {
      const i = (this.head - 1 - k + st.points * 2) % st.points;
      const age = frame - this.born[i];
      const fresh = Math.max(0, 1 - age / st.life);
      const x = this.px[i], y = this.py[i], z = this.pz[i];
      // along the trail: to the neighbour point
      const j = k + 1 < n ? (this.head - 2 - k + st.points * 2) % st.points : (this.head - k + st.points * 2) % st.points;
      let tx = x - this.px[j], ty = y - this.py[j], tz = z - this.pz[j];
      if (k + 1 >= n) {
        tx = -tx;
        ty = -ty;
        tz = -tz;
      }
      const cx = cam.x - x, cy = cam.y - y, cz = cam.z - z;
      const dist = Math.hypot(cx, cy, cz);
      let sx = ty * cz - tz * cy, sy = tz * cx - tx * cz, sz = tx * cy - ty * cx;
      const sl = Math.hypot(sx, sy, sz) || 1;
      const w = Math.max(st.width + (st.widthOld - st.width) * (1 - fresh), dist * st.minAngular);
      const h = w / 2 / sl;
      sx *= h; sy *= h; sz *= h;
      pos[vi * 6] = x - sx; pos[vi * 6 + 1] = y - sy; pos[vi * 6 + 2] = z - sz;
      pos[vi * 6 + 3] = x + sx; pos[vi * 6 + 4] = y + sy; pos[vi * 6 + 5] = z + sz;
      const a = st.alpha * (0.14 + 0.86 * fresh) * (fresh > 0 ? 1 : 0); // main.py:270-271
      for (let s = 0; s < 2; s++) {
        const o = (vi * 2 + s) * 4;
        col[o] = st.color[0] * dim;
        col[o + 1] = st.color[1] * dim;
        col[o + 2] = st.color[2] * dim;
        col[o + 3] = a;
      }
      vi++;
    }
    this.pos.needsUpdate = true;
    this.col.needsUpdate = true;
    this.geo.setDrawRange(0, (vi - 1) * 6);
  }
}
