// One asset manifest for all models. A failed load falls back to a coloured box of the same size.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import manifest from '../../tools/asset_manifest.json';

interface Entry { name: string; category: string; size_m_xyz: [number, number, number] }
const entries = manifest as unknown as Entry[];
export const MODEL_INFO = new Map(entries.map((e) => [e.name, e]));
export const modelUrl = (name: string) => { const e = MODEL_INFO.get(name); return e ? `models/${e.category}/${name}.glb` : ''; };

/** One shared material for everything: vertex colours, flat shading. */
export const sharedMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const fallbackMat = new THREE.MeshLambertMaterial({ color: 0xff00ff, flatShading: true });

const loader = new GLTFLoader();
const cache = new Map<string, Promise<THREE.Object3D>>();

function fallback(name: string): THREE.Object3D {
  const s = MODEL_INFO.get(name)?.size_m_xyz ?? [1, 1, 1];
  const m = new THREE.Mesh(new THREE.BoxGeometry(s[0], s[1], s[2]), fallbackMat);
  m.position.y = s[1] / 2; const g = new THREE.Group(); g.add(m); g.name = name; return g;
}
function prepare(root: THREE.Object3D) {
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.material = sharedMaterial; m.castShadow = false; } });
}
export function loadModel(name: string): Promise<THREE.Object3D> {
  let p = cache.get(name);
  if (!p) {
    const url = modelUrl(name);
    p = url ? loader.loadAsync(url).then((g) => { prepare(g.scene); return g.scene; }).catch(() => fallback(name)) : Promise.resolve(fallback(name));
    cache.set(name, p);
  }
  return p;
}
/** Fresh copy you can pose and attach. */
export async function cloneModel(name: string): Promise<THREE.Object3D> {
  const src = await loadModel(name); return src.clone(true);
}
export async function preload(names: string[], onProgress?: (done: number, total: number) => void) {
  let done = 0; await Promise.all(names.map((n) => loadModel(n).then(() => onProgress?.(++done, names.length))));
}

/** All meshes of a model flattened into one geometry with colours, in model space. */
const geoCache = new Map<string, THREE.BufferGeometry>();
export async function modelGeometry(name: string): Promise<THREE.BufferGeometry> {
  const hit = geoCache.get(name); if (hit) return hit;
  const root = await loadModel(name); root.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh; if (!m.isMesh) return;
    let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
    g.applyMatrix4(m.matrixWorld);
    const pos = g.getAttribute('position'); const out = new THREE.BufferGeometry();
    out.setAttribute('position', pos.clone());
    const col = g.getAttribute('color'); const arr = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { if (col) { arr[i * 3] = col.getX(i); arr[i * 3 + 1] = col.getY(i); arr[i * 3 + 2] = col.getZ(i); } else { arr[i * 3] = arr[i * 3 + 1] = arr[i * 3 + 2] = 0.7; } }
    out.setAttribute('color', new THREE.BufferAttribute(arr, 3)); parts.push(out);
  });
  const merged = parts.length ? (await import('three/examples/jsm/utils/BufferGeometryUtils.js')).mergeGeometries(parts, false)! : new THREE.BufferGeometry();
  geoCache.set(name, merged); return merged;
}
