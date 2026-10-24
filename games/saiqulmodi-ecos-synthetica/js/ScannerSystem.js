// ScannerSystem.js - picks organisms in 3D (raycast, with a screen-space
// fallback so small creatures are easy to tap on a phone) and runs the scan.
import * as THREE from 'three';

export class ScannerSystem {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.target = null;      // entity being scanned or inspected
    this.armed = false;      // scan requested
    this.progress = 0;       // 0..1
    this.range = 12;
    this.duration = 1.5;     // seconds of steady scanning
    this.onComplete = null;
  }

  pick(clientX, clientY, entities) {
    const rect = this.dom.getBoundingClientRect();
    this.ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(entities.map((e) => e.hit), false);
    if (hits.length) return hits[0].object.userData.entity;

    // Fallback: nearest entity on screen within a finger-sized radius.
    const v = new THREE.Vector3();
    let best = null;
    let bestD = Math.max(44, rect.width * 0.06);
    for (const e of entities) {
      v.copy(e.root.position).project(this.camera);
      if (v.z > 1) continue;
      const sx = (v.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-v.y * 0.5 + 0.5) * rect.height + rect.top;
      const d = Math.hypot(sx - clientX, sy - clientY);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  start(entity) {
    if (this.target !== entity) this.progress = 0;
    this.target = entity;
    this.armed = true;
  }

  clear() {
    this.target = null;
    this.armed = false;
    this.progress = 0;
  }

  // Returns 'idle' | 'far' | 'scanning' | 'done'.
  update(dt, playerPos) {
    const e = this.target;
    if (!e || e.removed || e.state === 'contained') { if (e) this.clear(); return 'idle'; }
    if (!this.armed) return 'idle';
    const dist = e.root.position.distanceTo(playerPos);
    if (dist > this.range) return 'far';
    this.progress += dt / this.duration;
    if (this.progress >= 1) {
      this.armed = false;
      this.progress = 1;
      if (this.onComplete) this.onComplete(e);
      return 'done';
    }
    return 'scanning';
  }
}
