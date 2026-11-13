// Renders each GLB once into a small offscreen canvas and caches it as an image for the UI.
import * as THREE from 'three';
import { loadModel } from './assets';

let renderer: THREE.WebGLRenderer | null = null; let scene: THREE.Scene, cam: THREE.OrthographicCamera;
const cache = new Map<string, string>(); const pending = new Map<string, Promise<string>>();

export function iconFor(name: string): Promise<string> {
  const hit = cache.get(name); if (hit) return Promise.resolve(hit);
  let p = pending.get(name);
  if (!p) {
    p = (async () => {
      try {
        if (!renderer) {
          const c = document.createElement('canvas'); c.width = c.height = 96; renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, preserveDrawingBuffer: true, antialias: true }); renderer.setSize(96, 96, false);
          scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0x6b5a8a, 1.4)); const l = new THREE.DirectionalLight(0xffffff, 1.6); l.position.set(2, 3, 4); scene.add(l);
          cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
        }
        const m = (await loadModel(name)).clone(true); const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
        m.position.sub(c); const g = new THREE.Group(); g.add(m); g.rotation.set(0.35, -0.7, 0); const r = Math.max(size.x, size.y, size.z) * 0.62 || 1; cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r; cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
        scene.add(g); renderer.render(scene, cam); const url = renderer.domElement.toDataURL('image/png'); scene.remove(g); cache.set(name, url); return url;
      } catch { return ''; }
    })();
    pending.set(name, p);
  }
  return p;
}
