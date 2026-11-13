// F9 debug panel: the animator's current state, blend weights, feet IK targets, foot-plant markers and the aim vector.
import * as THREE from 'three';
import type { Humanoid } from '../render/humanoid';

const CELL_NAMES = ['F', 'FR', 'R', 'BR', 'B', 'BL', 'L', 'FL'];
export class AnimDebug {
  readonly el = document.createElement('pre'); private on = false; private group = new THREE.Group(); private feet: THREE.Mesh[]; private arrow: THREE.ArrowHelper;
  constructor(scene: THREE.Scene, private extra?: () => string) {
    Object.assign(this.el.style, { position: 'fixed', left: '8px', bottom: '8px', margin: '0', padding: '8px 10px', background: 'rgba(14,11,26,.82)', color: '#e8e4ff', font: '11px/1.35 ui-monospace,Consolas,monospace', borderRadius: '8px', pointerEvents: 'none', display: 'none', zIndex: '50', whiteSpace: 'pre' });
    document.body.appendChild(this.el);
    this.feet = [0, 1].map(() => new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0x4ade80, depthTest: false }))); this.feet.forEach((f) => { f.renderOrder = 10; this.group.add(f); });
    this.arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 1.2, 0xffb020); (this.arrow.line.material as THREE.Material).depthTest = false; (this.arrow.cone.material as THREE.Material).depthTest = false; this.group.add(this.arrow);
    this.group.visible = false; scene.add(this.group);
    addEventListener('keydown', (e) => { if (e.code === 'F9') { e.preventDefault(); this.toggle(); } });
  }
  toggle() { this.on = !this.on; this.el.style.display = this.on ? 'block' : 'none'; this.group.visible = this.on; }
  get enabled() { return this.on; }
  update(h: Humanoid | null) {
    if (!this.on || !h?.animator) return; const a = h.animator, d = a.dbg; const root = h.root; root.updateMatrixWorld();
    const w = (v: number[]) => new THREE.Vector3(v[0], v[1], v[2]).applyMatrix4(root.matrixWorld);
    this.feet[0].position.copy(w(d.feet.l)); this.feet[1].position.copy(w(d.feet.r));
    this.feet.forEach((f, i) => (f.material as THREE.MeshBasicMaterial).color.setHex((i === 0 ? d.feet.lPlant : d.feet.rPlant) > 0.5 ? 0x4ade80 : 0xff4d5e));
    const m = new THREE.Vector3(); const has = h.muzzleWorld(m); this.arrow.visible = has; if (has) { this.arrow.position.copy(m); const dir = new THREE.Vector3(d.aim[0], d.aim[1], d.aim[2]).transformDirection(root.matrixWorld); this.arrow.setDirection(dir); }
    const f2 = (x: number) => x.toFixed(2);
    this.el.textContent = [`state   ${d.state}   lod ${h.lod}`, `layers  ${d.layers}`, `rate    ${f2(d.rate)}   body yaw ${(d.bodyYaw * 57.3).toFixed(0)} deg`,
      `speed   idle ${f2(d.speedW[0])}  walk ${f2(d.speedW[1])}  jog ${f2(d.speedW[2])}  sprint ${f2(d.speedW[3])}`, `dir     ${d.cells.map((c, i) => `${CELL_NAMES[i]} ${f2(c)}`).join('  ')}`,
      `feet    L plant ${f2(d.feet.lPlant)}  R plant ${f2(d.feet.rPlant)}   pelvis ${f2(d.pelvisOff)} m`, `aim     ${d.aim.map((x) => f2(x)).join(' ')}`, this.extra?.() ?? ''].join('\n');
  }
}
