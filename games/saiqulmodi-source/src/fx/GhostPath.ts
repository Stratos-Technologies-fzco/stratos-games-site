// The manoeuvre ghost guide in the sky (from SkyForge's src/fx/flightPath.js): the path the figure will fly,
// drawn as a faint line with a ring about every 250 m, a "runway in the sky" to fly through. The next three rings
// are bright, the ones still ahead dimmer, the ones already passed fade. Pre-allocated, nothing made per frame.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  type Scene,
  TorusGeometry,
  Vector3,
} from 'three';

const MAX_POINTS = 2000;
const RING_MAX = 160;
const RING_GAP_M = 250;

export class GhostPath {
  private rings: InstancedMesh;
  private line: Line;
  private ringIdx: number[] = [];
  private lastPassed = -1;
  private color = new Color();
  private _m = new Matrix4();
  private _q = new Quaternion();
  private _x = new Vector3();
  private _s = new Vector3(1, 1, 1);
  private _z = new Vector3(0, 0, 1);

  constructor(scene: Scene) {
    this.rings = new InstancedMesh(
      new TorusGeometry(14, 0.6, 6, 36),
      new MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
      RING_MAX,
    );
    this.rings.instanceMatrix.setUsage(DynamicDrawUsage);
    this.rings.frustumCulled = false;
    this.rings.visible = false;
    this.rings.setColorAt(0, this.color.setRGB(1, 1, 1)); // makes the per-ring colour buffer
    scene.add(this.rings);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(MAX_POINTS * 3), 3));
    this.line = new Line(g, new LineBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false }));
    this.line.frustumCulled = false;
    this.line.visible = false;
    scene.add(this.line);
  }

  /** the figure's path, or null to clear it */
  set(points: Vector3[] | null): void {
    this.lastPassed = -1;
    if (!points) {
      this.rings.visible = this.line.visible = false;
      return;
    }
    const n = Math.min(points.length, MAX_POINTS);
    const pos = this.line.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < n; i++) pos.setXYZ(i, points[i].x, points[i].y, points[i].z);
    this.line.geometry.setDrawRange(0, n);
    pos.needsUpdate = true;
    this.line.visible = true;
    this.ringIdx = [];
    let run = 0;
    for (let i = 1; i < n && this.ringIdx.length < RING_MAX; i++) {
      run += points[i].distanceTo(points[i - 1]);
      if (run >= RING_GAP_M) {
        this.ringIdx.push(i);
        run = 0;
      }
    }
    this.ringIdx.forEach((pi, r) => {
      const a = points[Math.max(0, pi - 1)];
      const b = points[Math.min(n - 1, pi + 1)];
      this._x.copy(b).sub(a).normalize();
      this._q.setFromUnitVectors(this._z, this._x);
      this._m.compose(points[pi], this._q, this._s);
      this.rings.setMatrixAt(r, this._m);
    });
    this.rings.count = this.ringIdx.length;
    this.rings.instanceMatrix.needsUpdate = true;
    this.paint(0);
    this.rings.visible = this.ringIdx.length > 0;
  }

  /** passed: the nearest ghost point the jet has reached (ManeuverScore.i) */
  update(passed: number, night: boolean): void {
    if (!this.rings.visible || passed === this.lastPassed) return;
    this.lastPassed = passed;
    this.paint(passed, night);
  }

  private paint(passed: number, night = false): void {
    let ahead = 0;
    const k = night ? 0.7 : 1;
    this.ringIdx.forEach((pi, r) => {
      const isAhead = pi >= passed;
      const bright = isAhead && ahead++ < 3;
      this.color.setRGB(0.55, 0.85, 1).multiplyScalar(k * (bright ? 0.95 : isAhead ? 0.4 : 0.06));
      this.rings.setColorAt(r, this.color);
    });
    if (this.rings.instanceColor) this.rings.instanceColor.needsUpdate = true;
  }
}
