// Survivor model with a procedural animator: limb nodes are rotated in code and blended by state and speed.
import * as THREE from 'three';
import { cloneModel, sharedMaterial } from './assets';

export type Survivor = 'survivor_kiran' | 'survivor_meera' | 'survivor_arjun' | 'survivor_zoya';
export const SURVIVORS: { id: Survivor; name: string; role: string; perk: string; color: string; lines: string[] }[] = [
  { id: 'survivor_kiran', name: 'Kiran', role: 'Scout', perk: 'Sprint +8%, lands 20% faster', color: '#FFB020', lines: ['Shortcut found!', 'Keep up!', "Wind's on my side."] },
  { id: 'survivor_meera', name: 'Meera', role: 'Field medic', perk: 'Heals 25% faster', color: '#FF4D5E', lines: ["Hold still, this'll sting.", 'Patched up, move!', 'Not today.'] },
  { id: 'survivor_arjun', name: 'Arjun', role: 'Engineer', perk: 'Free Monsoon Barrier every 45 s', color: '#4EA8FF', lines: ['Built to last.', 'Cover up!', 'Measure twice.'] },
  { id: 'survivor_zoya', name: 'Zoya', role: 'Tracker', perk: 'Sees footstep pings within 30 m', color: '#A78BFA', lines: ['I hear you.', 'Tracks are fresh.', 'Quiet now.'] },
];

export interface AnimState {
  speed: number; crouch: boolean; onGround: boolean; vy: number; mode: 'ground' | 'skydive' | 'glide';
  aiming: boolean; pitch: number; swap: number; armed: boolean; reload: boolean; heal: boolean; melee: boolean; throwT: number; kick: number; hit: number; dead: 0 | 1 | 2; emote: boolean; fallLanded: number;
}
export const defaultAnim = (): AnimState => ({ speed: 0, crouch: false, onGround: true, vy: 0, mode: 'ground', aiming: false, pitch: 0, swap: 0, armed: false, reload: false, heal: false, melee: false, throwT: 0, kick: 0, hit: 0, dead: 0, emote: false, fallLanded: 0 });

interface Pose { aLx: number; aLz: number; aRx: number; aRz: number; lL: number; lR: number; torso: number; hip: number; head: number; lean: number; roll: number }
const zero = (): Pose => ({ aLx: 0, aLz: 0, aRx: 0, aRz: 0, lL: 0, lR: 0, torso: 0, hip: 0, head: 0, lean: 0, roll: 0 });

export class Character {
  root = new THREE.Group(); body = new THREE.Group();
  parts: Record<'torso' | 'head' | 'arm_L' | 'arm_R' | 'leg_L' | 'leg_R', THREE.Object3D | undefined> = { torso: undefined, head: undefined, arm_L: undefined, arm_R: undefined, leg_L: undefined, leg_R: undefined };
  private base = new Map<THREE.Object3D, THREE.Vector3>();
  private pose = zero(); private phase = 0; private tDead = 0; private landRoll = 0; private t = 0; private lastFrame = 0; private accum = 0;
  weapon: THREE.Object3D | null = null; weaponName = ''; ready = false; height = 1.84; wing: THREE.Object3D | null = null;
  constructor(public model: Survivor) { this.root.add(this.body); }

  async load() {
    const m = await cloneModel(this.model); this.body.add(m);
    m.traverse((o) => { if (o.name in this.parts) { this.parts[o.name as keyof Character['parts']] = o; this.base.set(o, o.position.clone()); } });
    this.ready = true;
  }
  async setWeapon(name: string | null) {
    if (name === this.weaponName) return; this.weaponName = name ?? '';
    if (this.weapon) { this.weapon.parent?.remove(this.weapon); this.weapon = null; }
    const hand = this.parts.arm_R; if (!name || !hand) return;
    const w = await cloneModel(name); if (this.weaponName !== name) return;
    w.rotation.x = Math.PI / 2; w.position.set(0, -0.6, 0.02); hand.add(w); this.weapon = w;
  }
  async setWing(on: boolean) {
    if (on && !this.wing) { this.wing = await cloneModel('personal_glider_wing'); this.wing.position.set(0, 1.5, -0.1); this.body.add(this.wing); }
    if (this.wing) this.wing.visible = on;
  }
  setTint(hex: number) { void hex; }

  update(dt: number, s: AnimState, lod10fps = false) {
    if (!this.ready) return;
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.swapMat(false); }
    if (lod10fps) { this.accum += dt; if (this.accum < 0.1) return; dt = this.accum; this.accum = 0; }
    this.t += dt;
    const target = zero();
    let hipY = 0, rootRoll = 0;
    const run = Math.min(1, s.speed / 6.5), moving = s.speed > 0.4;
    const swingRate = 6 + s.speed * 1.1;
    if (moving && s.onGround) this.phase += dt * swingRate * (s.crouch ? 0.7 : 1);
    const sw = Math.sin(this.phase), amp = (s.crouch ? 0.45 : 0.35 + 0.7 * run);

    if (s.dead) {
      this.tDead += dt; const k = Math.min(1, this.tDead / 0.5);
      target.lean = (s.dead === 1 ? -1 : 1) * 1.45 * k; target.aLz = 0.8 * k; target.aRz = -0.8 * k; hipY = -0.9 * k;
    } else if (s.mode === 'skydive') {
      target.aLz = 1.2; target.aRz = -1.2; target.aLx = -0.4; target.aRx = -0.4; target.lL = 0.5; target.lR = -0.3; target.lean = 1.25; target.torso = 0.15;
    } else if (s.mode === 'glide') {
      target.aLx = Math.PI * 0.95; target.aRx = Math.PI * 0.95; target.aLz = 0.15; target.aRz = -0.15; target.lL = 0.1; target.lR = -0.1; target.lean = 0.12;
    } else if (!s.onGround) {
      const up = s.vy > 0;
      target.lL = up ? -0.9 : 0.35; target.lR = up ? 0.3 : -0.35; target.aLx = up ? -1.0 : -0.3; target.aRx = up ? -1.0 : -0.3; target.aLz = 0.5; target.aRz = -0.5; target.lean = up ? 0.1 : 0;
    } else {
      // ground: idle sway, walk / run / sprint swing, crouch
      const sway = Math.sin(this.t * 1.6) * 0.02;
      target.torso = sway; target.head = Math.sin(this.t * 1.1) * 0.03;
      target.lL = sw * amp; target.lR = -sw * amp; target.aLx = -sw * amp * 0.9; target.aRx = sw * amp * 0.9;
      target.lean = moving ? 0.05 + run * 0.18 : 0; if (s.crouch) { hipY = -0.45; target.lL -= 0.45; target.lR -= 0.45; target.lean += 0.2; }
      if (!moving) { target.aLx = Math.sin(this.t * 1.6) * 0.05; target.aRx = -Math.sin(this.t * 1.6) * 0.05; }
    }
    if (this.landRoll > 0) { this.landRoll -= dt; rootRoll = (1 - this.landRoll / 0.5) * Math.PI * 2; }
    if (s.fallLanded > 6) this.landRoll = 0.5;
    if (!s.dead && s.mode === 'ground') {
      if (s.armed && !s.melee) { const raise = -1.45 - Math.max(-0.6, Math.min(0.6, s.pitch)) * 0.85; target.aRx = raise - s.kick * 0.25; target.aLx = raise + 0.15; target.aLz = -0.5; target.aRx += s.swap * 0.9; target.aLx += s.swap * 0.7; target.torso += s.aiming ? 0.25 : 0; }
      if (s.melee && s.kick > 0) { target.aRx = -1.6 + s.kick * 2.2; target.torso += s.kick * 0.5; }
      if (s.reload) { target.aLx = -0.9 + Math.sin(this.t * 12) * 0.15; target.aLz = -0.4; target.aRx = -0.7; }
      if (s.heal) { target.aLx = -1.1; target.aRx = -1.1; target.aLz = -0.35; target.aRz = 0.35; target.head = 0.2; }
      if (s.throwT > 0) { target.aRx = -2.6 + (1 - s.throwT) * 2.4; target.torso += (s.throwT - 0.5) * 0.5; }
      if (s.emote) { target.aRx = -Math.PI * 0.95 + Math.sin(this.t * 10) * 0.15; target.aRz = -0.2; }
    }
    if (s.hit > 0) { target.torso += (Math.random() - 0.5) * 0.35 * s.hit; target.head += 0.25 * s.hit; }
    target.roll = rootRoll;

    const k = 1 - Math.exp(-dt / 0.12 * 3); const p = this.pose;
    (Object.keys(p) as (keyof Pose)[]).forEach((key) => { p[key] += (target[key] - p[key]) * k; });
    p.roll = rootRoll; // roll is applied directly
    const P = this.parts;
    this.body.position.y = hipY * 0.5 + (s.dead ? 0 : 0); this.body.rotation.set(p.lean, 0, 0); this.body.rotation.z = 0;
    if (P.torso) { P.torso.rotation.set(p.torso, 0, 0); P.torso.position.y = (this.base.get(P.torso)?.y ?? 0.95) + hipY; }
    if (P.head) { P.head.rotation.x = p.head; P.head.position.y = (this.base.get(P.head)?.y ?? 1.5) + hipY; }
    for (const [key, node] of [['arm_L', P.arm_L], ['arm_R', P.arm_R]] as const) if (node) node.position.y = (this.base.get(node)?.y ?? 1.43) + hipY;
    for (const [key, node] of [['leg_L', P.leg_L], ['leg_R', P.leg_R]] as const) if (node) node.position.y = (this.base.get(node)?.y ?? 0.95) + hipY * 0.35;
    if (P.arm_L) P.arm_L.rotation.set(p.aLx, 0, p.aLz); if (P.arm_R) P.arm_R.rotation.set(p.aRx, 0, p.aRz);
    if (P.leg_L) P.leg_L.rotation.x = p.lL; if (P.leg_R) P.leg_R.rotation.x = p.lR;
    if (rootRoll) this.body.rotation.x = rootRoll;
    if (s.dead) { const f = Math.min(1, Math.max(0, (this.tDead - 1.5) / 0.4)); this.root.scale.setScalar(1 - f * 0.9); this.root.visible = f < 1; }
    void this.lastFrame;
  }
  private flashT = 0; private static flashMat = new THREE.MeshBasicMaterial({ color: 0xff9a9a });
  /** Brief white-red flash when this survivor is hit. */
  flash(t: number) { this.flashT = t; this.swapMat(true); }
  private swapMat(on: boolean) { this.body.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !(this.wing && this.isChild(m))) m.material = on ? Character.flashMat : sharedMaterial; }); }
  private isChild(m: THREE.Object3D) { let p: THREE.Object3D | null = m; while (p) { if (p === this.wing) return true; p = p.parent; } return false; }
  resetDeath() { this.tDead = 0; this.root.scale.setScalar(1); this.root.visible = true; }
}
