// 3D things standing on main.py's map: city buildings (one per city block, main.py:497-513, taller downtown),
// village houses (main.py:428-435), forest trees (main.py:420-427) and airbase hardened shelters (main.py:645-646).
// Instanced: one draw call per kind.
import { BoxGeometry, Color, ConeGeometry, InstancedMesh, MeshLambertMaterial, Object3D, type Scene } from 'three';
import { PX_M, pxToX, pyToZ } from '../config';
import { heightAt } from './Height';
import { MAP, ROOF_COLORS } from './MapData';

const _o = new Object3D();
const _c = new Color();

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function addWorldProps(scene: Scene): void {
  const r = seeded(99);
  const box = new BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0); // stands on the ground

  // city buildings
  let nb = 0;
  for (const c of MAP.cities) nb += c.blocks.length;
  const buildings = new InstancedMesh(box, new MeshLambertMaterial({ color: 0xffffff }), nb);
  let i = 0;
  for (const c of MAP.cities) {
    for (const b of c.blocks) {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const d = Math.hypot(cx - c.x, cy - c.y) / c.r;
      const tall = 14 + Math.pow(1 - d, 2) * 110 * (0.4 + 0.6 * r());
      const x = pxToX(cx);
      const z = pyToZ(cy);
      _o.position.set(x, heightAt(x, z) - 2, z);
      _o.rotation.set(0, 0, 0);
      _o.scale.set(b.w * PX_M * 0.8, tall, b.h * PX_M * 0.8);
      _o.updateMatrix();
      buildings.setMatrixAt(i, _o.matrix);
      const t = b.tone / 255;
      buildings.setColorAt(i, _c.setRGB(t, t, t + 6 / 255, 'srgb'));
      i++;
    }
  }
  scene.add(buildings);

  // village houses
  let nh = 0;
  for (const v of MAP.villages) nh += v.houses.length / 3;
  const houses = new InstancedMesh(box, new MeshLambertMaterial({ color: 0xffffff }), nh);
  i = 0;
  for (const v of MAP.villages) {
    for (let k = 0; k < v.houses.length; k += 3) {
      const x = pxToX(v.houses[k]);
      const z = pyToZ(v.houses[k + 1]);
      _o.position.set(x, heightAt(x, z) - 1, z);
      _o.rotation.set(0, r() * Math.PI, 0);
      _o.scale.set(9 + r() * 6, 6 + r() * 4, 8 + r() * 5);
      _o.updateMatrix();
      houses.setMatrixAt(i, _o.matrix);
      const col = ROOF_COLORS[v.houses[k + 2]];
      houses.setColorAt(i, _c.setRGB(col[0] / 255, col[1] / 255, col[2] / 255, 'srgb'));
      i++;
    }
  }
  scene.add(houses);

  // forest trees
  let nt = 0;
  for (const f of MAP.forests) nt += f.trees.length / 3;
  const cone = new ConeGeometry(1, 2.6, 6);
  cone.translate(0, 1.3, 0);
  const trees = new InstancedMesh(cone, new MeshLambertMaterial({ color: 0xffffff }), nt);
  i = 0;
  for (const f of MAP.forests) {
    for (let k = 0; k < f.trees.length; k += 3) {
      const x = pxToX(f.trees[k]);
      const z = pyToZ(f.trees[k + 1]);
      const s = f.trees[k + 2] * 1.4; // crown radius, m
      _o.position.set(x, heightAt(x, z) - 1, z);
      _o.rotation.set(0, 0, 0);
      _o.scale.set(s, s * 1.2, s);
      _o.updateMatrix();
      trees.setMatrixAt(i, _o.matrix);
      trees.setColorAt(i, _c.setRGB(40 / 255, (80 + r() * 16) / 255, 34 / 255, 'srgb')); // main.py:559
      i++;
    }
  }
  scene.add(trees);

  // airbase hardened shelters: 4 per base (main.py:645-646)
  const shelters = new InstancedMesh(box, new MeshLambertMaterial({ color: 0x6e7470 }), (MAP.airbases.length / 2) * 4);
  i = 0;
  for (let a = 0; a < MAP.airbases.length; a += 2) {
    for (let k = 0; k < 4; k++) {
      const x = pxToX(MAP.airbases[a] - 24 + k * 14 + 4.5);
      const z = pyToZ(MAP.airbases[a + 1] + 26 + 4.5);
      _o.position.set(x, heightAt(x, z) - 1, z);
      _o.rotation.set(0, 0, 0);
      _o.scale.set(9 * PX_M * 0.9, 11, 9 * PX_M * 0.9);
      _o.updateMatrix();
      shelters.setMatrixAt(i++, _o.matrix);
    }
  }
  scene.add(shelters);

  for (const m of [buildings, houses, trees, shelters]) {
    m.frustumCulled = false;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }
}
