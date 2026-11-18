// Pooled smoke puffs for missile trails and the falling wreck: one InstancedMesh, no per-frame allocation.
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, MeshLambertMaterial, Quaternion, Vector3 } from 'three';
import { Pool, type Poolable } from '../core/Pool';

const MAX_PUFFS = 1400;

class Puff implements Poolable {
  active = false;
  readonly pos = new Vector3();
  age = 0;
  life = 1;
  size0 = 1;
  size1 = 1;
  constructor(readonly index: number) {}
}

const _m = new Matrix4();
const _q = new Quaternion();
const _s = new Vector3();
const _zero = new Matrix4().makeScale(0, 0, 0);

export class Smoke {
  readonly mesh: InstancedMesh;
  private pool = new Pool<Puff>(MAX_PUFFS, (i) => new Puff(i));
  private tmpColor = new Color();

  constructor() {
    const mat = new MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false });
    this.mesh = new InstancedMesh(new IcosahedronGeometry(1, 1), mat, MAX_PUFFS);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    for (let i = 0; i < MAX_PUFFS; i++) {
      this.mesh.setMatrixAt(i, _zero);
      this.mesh.setColorAt(i, this.tmpColor.setRGB(1, 1, 1));
    }
  }

  emit(x: number, y: number, z: number, life: number, size0: number, size1: number, grey: number): void {
    this.emitRGB(x, y, z, life, size0, size1, grey, grey, grey * 0.98);
  }

  /** a coloured puff (display smoke) */
  emitRGB(x: number, y: number, z: number, life: number, size0: number, size1: number, r: number, g: number, b: number): void {
    const p = this.pool.acquireOrRecycle();
    p.pos.set(x, y, z);
    p.age = 0;
    p.life = life;
    p.size0 = size0;
    p.size1 = size1;
    const i = p.index;
    this.mesh.setColorAt(i, this.tmpColor.setRGB(r, g, b));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  update(dt: number): void {
    const items = this.pool.items;
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      if (!p.active) continue;
      p.age += dt;
      if (p.age >= p.life) {
        p.active = false;
        this.mesh.setMatrixAt(i, _zero);
        continue;
      }
      const t = p.age / p.life;
      // grows, then shrinks away at the end instead of fading (one shared material)
      const s = (p.size0 + (p.size1 - p.size0) * Math.sqrt(t)) * (t > 0.8 ? (1 - t) / 0.2 : 1);
      p.pos.y += 1.5 * dt;
      _m.compose(p.pos, _q, _s.set(s, s, s));
      this.mesh.setMatrixAt(i, _m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  clear(): void {
    this.pool.releaseAll();
    for (let i = 0; i < MAX_PUFFS; i++) this.mesh.setMatrixAt(i, _zero);
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
