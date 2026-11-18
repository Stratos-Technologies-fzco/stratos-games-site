// Pooled fireballs (each one a mesh with its own fading material, made once at start).
import { AdditiveBlending, Mesh, MeshBasicMaterial, SphereGeometry, type Scene } from 'three';
import { Pool, type Poolable } from '../core/Pool';

class Blast implements Poolable {
  active = false;
  age = 0;
  life = 1;
  radius = 1;
  constructor(readonly mesh: Mesh, readonly mat: MeshBasicMaterial) {}
}

export class Explosions {
  private pool: Pool<Blast>;

  constructor(scene: Scene) {
    const geo = new SphereGeometry(1, 16, 10);
    this.pool = new Pool<Blast>(24, () => {
      const mat = new MeshBasicMaterial({ color: 0xffa040, transparent: true, depthWrite: false, blending: AdditiveBlending });
      const m = new Mesh(geo, mat);
      m.visible = false;
      scene.add(m);
      return new Blast(m, mat);
    });
  }

  spawn(x: number, y: number, z: number, radius: number, life = 1.4): void {
    const b = this.pool.acquireOrRecycle();
    b.age = 0;
    b.life = life;
    b.radius = radius;
    b.mesh.position.set(x, y, z);
    b.mesh.visible = true;
  }

  update(dt: number): void {
    const items = this.pool.items;
    for (let i = 0; i < items.length; i++) {
      const b = items[i];
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) {
        b.active = false;
        b.mesh.visible = false;
        continue;
      }
      const t = b.age / b.life;
      const s = b.radius * (0.3 + 0.7 * Math.sqrt(t));
      b.mesh.scale.set(s, s, s);
      b.mat.opacity = 1 - t;
      b.mat.color.setRGB(1, 0.75 - 0.45 * t, 0.35 - 0.3 * t).multiplyScalar(3 - 2 * t);
    }
  }

  clear(): void {
    for (const b of this.pool.items) {
      b.active = false;
      b.mesh.visible = false;
    }
  }
}
