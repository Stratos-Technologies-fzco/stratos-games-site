// Layered animator for one survivor. Everything is computed on flat arrays (see rig.ts) and written to the bones once per update.
//
// Layers, evaluated in this order every update:
//   1  base locomotion (full body)   state machine: idle / 8-way locomotion / sprint / turn in place / crouch / jump / land / roll / skydive / glide / dead,
//                                    stride matched to ground speed (clip rate = real speed / clip speed, 0.8-1.2), crossfades with a shared foot phase
//   2  upper-body weapon pose        masked from spine_01 up, weight 1 armed, 0.4 sprinting
//   3  aim offset                    pitch poses + yaw twist spread 35 / 35 / 30 over spine_01..03, then corrected so the barrel points exactly at the aim
//   4  additives                     breathing, lean into turns (8 deg) and acceleration (5 deg), landing compression, recoil kick, hit reacts, idle variations
//   5  IK                            left hand to the weapon's handguard, feet to the ground (slopes, stairs; pelvis drops to the lower foot), head look-at
import * as THREE from 'three';
import { CELLS, directionWeights, pitchWeights, PLATEAUS, speedWeights, strideRate } from './blend';
import { type ClipBank, sampleClip } from './clips';
import { FacingState, newFacing, stepFacing, wrap, MOVE_THRESHOLD } from './facing';
import { solveTwoBone } from './ik';
import { qaxis, qmul, qnorm, type Rig } from './rig';

const D = Math.PI / 180;
export type Hold = 'rifle' | 'pistol' | 'melee' | 'none';
export interface AnimInput {
  dt: number; aimYaw: number; aimPitch: number; vx: number; vz: number; onGround: boolean; vy: number;
  crouch: boolean; slide: boolean; sprint: boolean; aiming: boolean; firing: boolean; kick: number;
  armed: boolean; hold: Hold; recoilDeg: number; reload: boolean; reloadP: number; heal: boolean; throwT: number; swap: number;
  hit: number; hitDir: number; dead: 0 | 1 | 2; mode: 'ground' | 'skydive' | 'glide'; emote: boolean; fallLanded: number;
}
export const defaultInput = (): AnimInput => ({ dt: 1 / 60, aimYaw: 0, aimPitch: 0, vx: 0, vz: 0, onGround: true, vy: 0, crouch: false, slide: false, sprint: false, aiming: false, firing: false, kick: 0, armed: false, hold: 'none', recoilDeg: 0, reload: false, reloadP: 0, heal: false, throwT: 0, swap: 0, hit: 0, hitDir: 0, dead: 0, mode: 'ground', emote: false, fallLanded: 0 });

export interface Sockets { handR: { p: THREE.Vector3; q: THREE.Quaternion }; handL: { p: THREE.Vector3; q: THREE.Quaternion }; headCam: { p: THREE.Vector3 } }
export interface WeaponPose { grip: THREE.Vector3; left: THREE.Vector3 | null }
export interface Ground { height(wx: number, wz: number): number }
export interface Debug { state: string; cells: number[]; speedW: number[]; rate: number; feet: { l: number[]; r: number[]; lPlant: number; rPlant: number }; aim: number[]; pelvisOff: number; bodyYaw: number; layers: string }

const Y = new THREE.Vector3(0, 1, 0);
/** The pelvis position lives in the root bone's own frame, which is rotated -90 deg about X: index 0 = left, 1 = backwards, 2 = UP. */
const UP = 2;
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const damp = (cur: number, target: number, tau: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-dt / Math.max(1e-4, tau)));

export class CharacterAnimator {
  readonly lq: Float32Array; readonly hip = new Float32Array(3); readonly facing: FacingState = newFacing(0);
  readonly dbg: Debug = { state: 'idle', cells: new Array(8).fill(0), speedW: [1, 0, 0, 0], rate: 1, feet: { l: [0, 0, 0], r: [0, 0, 0], lPlant: 0, rPlant: 0 }, aim: [0, 0, 1], pelvisOff: 0, bodyYaw: 0, layers: '' };
  /** 0 = full, 1 = no foot IK, 2 = base layer + aim only (set by the owner from the distance to the camera) */
  lod = 0; ground: Ground | null = null; weapon: WeaponPose | null = null; leftHandRoll = -90 * D;
  headCamRoot = new THREE.Vector3(); muzzleRoot = new THREE.Vector3(); muzzleDir = new THREE.Vector3(0, 0, 1);
  private n: number; private pelvis: number;
  private b: Record<string, number> = {};
  private sv = { x: 0, z: 0 }; private speed = 0; private lastSpeed = 0; private accel = 0; private phase = 0; private idleT = 0; private t = 0;
  private crouchW = 0; private jumpW = 0; private airT = 0; private wasGround = true; private landT = 0; private rollT = 0; private deadT = 0; private weaponW = 0; private weaponKind: Hold = 'none';
  private moving = false; private moveT = 0; private stopT = 0; private idleVar = { next: 9, kind: -1, t: 0 };
  private pelvisOff = 0; private lean = { roll: 0, pitch: 0 }; private hitEnv = 0; private hitDir = 0; private kickEnv = 0; private leftIK = 0; private footPlant = [0, 0];
  private cellW = new Float32Array(8); private spdW = [1, 0, 0, 0]; private pitchW = [0, 1, 0];
  private acc: Float32Array; private accHip = new Float32Array(3); private accW = 0; private tmp: Float32Array; private tmpHip = new Float32Array(3);
  private pose2: Float32Array; private hip2 = new Float32Array(3); private pose3: Float32Array; private hip3 = new Float32Array(3);
  private v = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), t: new THREE.Vector3(), pole: new THREE.Vector3() };
  private q = { a: new THREE.Quaternion(), b: new THREE.Quaternion(), c: new THREE.Quaternion() };
  private rootX = 0; private rootY = 0; private rootZ = 0;

  constructor(readonly rig: Rig, readonly bank: ClipBank, readonly sockets: Sockets) {
    this.n = rig.n; this.pelvis = rig.i('pelvis'); this.lq = new Float32Array(rig.restQ); this.acc = new Float32Array(this.n * 4); this.tmp = new Float32Array(this.n * 4); this.pose2 = new Float32Array(this.n * 4); this.pose3 = new Float32Array(this.n * 4);
    for (const nm of ['root', 'pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'lowerarm_l', 'hand_l', 'upperarm_r', 'lowerarm_r', 'hand_r', 'thigh_l', 'calf_l', 'foot_l', 'thigh_r', 'calf_r', 'foot_r']) this.b[nm] = rig.i(nm);
    this.hip.set(rig.restP.subarray(this.pelvis * 3, this.pelvis * 3 + 3)); this.idleVar.next = 8 + Math.random() * 4;
  }

  // ------------------------------------------------------------------ helpers on pose buffers
  private clear() { this.acc.fill(0); this.accHip.fill(0); this.accW = 0; }
  private add(pose: Float32Array, hip: Float32Array, w: number) {
    if (w <= 1e-4) return; const a = this.acc, n4 = this.n * 4;
    for (let i = 0; i < n4; i += 4) { const d = a[i] * pose[i] + a[i + 1] * pose[i + 1] + a[i + 2] * pose[i + 2] + a[i + 3] * pose[i + 3]; const s = (d < 0 ? -1 : 1) * w; a[i] += pose[i] * s; a[i + 1] += pose[i + 1] * s; a[i + 2] += pose[i + 2] * s; a[i + 3] += pose[i + 3] * s; }
    this.accHip[0] += hip[0] * w; this.accHip[1] += hip[1] * w; this.accHip[2] += hip[2] * w; this.accW += w;
  }
  private result(out: Float32Array, hip: Float32Array) {
    const k = this.accW > 0 ? 1 / this.accW : 0; const a = this.acc;
    for (let i = 0; i < this.n * 4; i += 4) { let x = a[i], y = a[i + 1], z = a[i + 2], w = a[i + 3]; const l = Math.hypot(x, y, z, w); if (l < 1e-6) { out.set(this.rig.restQ.subarray(i, i + 4), i); continue; } out[i] = x / l; out[i + 1] = y / l; out[i + 2] = z / l; out[i + 3] = w / l; }
    hip[0] = this.accHip[0] * k; hip[1] = this.accHip[1] * k; hip[2] = this.accHip[2] * k;
  }
  /** dst = nlerp(dst, src, w) for the bones flagged in mask (or all). */
  private mix(dst: Float32Array, src: Float32Array, w: number, mask?: Uint8Array) {
    if (w <= 1e-4) return; for (let b = 0; b < this.n; b++) { if (mask && !mask[b]) continue; const i = b * 4; const d = dst[i] * src[i] + dst[i + 1] * src[i + 1] + dst[i + 2] * src[i + 2] + dst[i + 3] * src[i + 3]; const s = (d < 0 ? -w : w); let x = dst[i] * (1 - w) + src[i] * s, y = dst[i + 1] * (1 - w) + src[i + 1] * s, z = dst[i + 2] * (1 - w) + src[i + 2] * s, q = dst[i + 3] * (1 - w) + src[i + 3] * s; const l = Math.hypot(x, y, z, q) || 1; dst[i] = x / l; dst[i + 1] = y / l; dst[i + 2] = z / l; dst[i + 3] = q / l; }
  }
  private sample(name: string, time: number, loop: boolean, reverse = false, pelvisYaw = 0): { p: Float32Array; h: Float32Array } {
    const c = this.bank.get(name); sampleClip(c, this.rig, time, loop, reverse, this.tmp, this.tmpHip);
    if (pelvisYaw) { const pi = this.pelvis * 4, t = this.tmp; const yq = new Float32Array(4); qaxis(yq, 0, 0, 0, 1, pelvisYaw); /* local Z is up in the root bone frame (see UP) */ const o = new Float32Array(4); qmul(o, 0, yq, 0, t, pi); t[pi] = o[0]; t[pi + 1] = o[1]; t[pi + 2] = o[2]; t[pi + 3] = o[3]; }
    return { p: this.tmp, h: this.tmpHip };
  }
  private rot(b: number, ax: number, ay: number, az: number, ang: number) { this.rig.rotateRoot(this.lq, b, ax, ay, az, ang); }
  private fk() { this.rig.fk(this.lq, this.hip, this.pelvis); }

  // ------------------------------------------------------------------ update
  update(inp: AnimInput, rootX: number, rootY: number, rootZ: number) {
    const dt = Math.min(0.1, inp.dt); if (dt <= 0) return; this.t += dt; this.rootX = rootX; this.rootY = rootY; this.rootZ = rootZ;
    // smoothed velocity: 0.15 s to speed up, 0.2 s to slow down
    const tgt = Math.hypot(inp.vx, inp.vz), cur = Math.hypot(this.sv.x, this.sv.z); const tau = tgt > cur ? 0.15 : 0.2;
    this.sv.x = damp(this.sv.x, inp.vx, tau, dt); this.sv.z = damp(this.sv.z, inp.vz, tau, dt); this.lastSpeed = this.speed; this.speed = Math.hypot(this.sv.x, this.sv.z); this.accel = damp(this.accel, (this.speed - this.lastSpeed) / dt, 0.12, dt);
    this.moving = this.speed > MOVE_THRESHOLD; const moveYaw = Math.atan2(this.sv.x, this.sv.z);
    const ready = inp.aiming || inp.firing || inp.reload;
    const twist = stepFacing(this.facing, { aimYaw: inp.aimYaw, moveYaw, speed: this.speed, aiming: inp.aiming, firing: inp.firing, armed: inp.armed, dt });
    const fwd = this.sv.x * Math.sin(this.facing.bodyYaw) + this.sv.z * Math.cos(this.facing.bodyYaw), right = -this.sv.x * Math.cos(this.facing.bodyYaw) + this.sv.z * Math.sin(this.facing.bodyYaw);
    const phi = this.moving ? Math.atan2(right, fwd) : 0;
    if (this.moving) { this.moveT += dt; this.stopT = 0; } else { this.stopT += dt; this.moveT = 0; }
    this.crouchW = damp(this.crouchW, inp.crouch || inp.slide ? 1 : 0, 0.1, dt);
    this.hitEnv = Math.max(this.hitEnv - dt * 3.2, inp.hit > 0.7 ? inp.hit : this.hitEnv); if (inp.hit > 0.7) this.hitDir = inp.hitDir; this.kickEnv = damp(this.kickEnv, inp.kick, 0.04, dt);
    this.dbg.state = 'idle'; this.dbg.layers = '';

    // ---- 1 base locomotion
    if (inp.dead) { this.dead(inp, dt); this.finish(inp, 0, false); return; }
    this.deadT = 0;
    if (inp.mode === 'skydive' || inp.mode === 'glide') { this.air(inp, dt); this.finish(inp, 0, false); return; }
    this.clear();
    const turning = this.facing.turning !== 0 && !this.moving; const effSpeed = turning ? 1.3 : this.speed;
    speedWeights(effSpeed, PLATEAUS, this.spdW);
    // sprint is a forward-only cone (+-40 deg); outside it the weight falls back to the jog
    const cone = smooth(55 * D, 40 * D, Math.abs(phi)); const sw3 = this.spdW[3] * cone; this.spdW[2] += this.spdW[3] - sw3; this.spdW[3] = sw3;
    directionWeights(turning ? (this.facing.turning > 0 ? 0 : 0) : phi, this.cellW);
    const wLoco = this.spdW[1] + this.spdW[2] + this.spdW[3]; const rate = strideRate(effSpeed, this.spdW); this.dbg.rate = rate;
    const freq = wLoco > 0 ? (this.spdW[1] / 1.3333 + this.spdW[2] / 0.9333 + this.spdW[3] / 0.6667) / wLoco : 0.75;
    if (wLoco > 0.02) this.phase = (this.phase + dt * freq * rate) % 1; else if (this.stopT > 0) this.phase = this.phase; // feet stay where they stopped
    if (this.moving && this.moveT < dt * 1.5 && this.stopT === 0 && this.spdW[0] > 0.6) this.phase = 0; // moving off from standing: the left foot leads
    this.idleT += dt;
    const clips = ['Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop'] as const; const durs = [2.5, 1.3333, 0.9333, 0.6667];
    this.add(this.sample(inp.crouch || this.crouchW > 0.5 ? 'Crouch_Idle_Loop' : 'Idle_Loop', this.idleT, true).p, this.tmpHip, this.spdW[0]);
    for (let c = 0; c < 8; c++) { const wc = this.cellW[c]; if (wc < 0.002) continue; const cell = CELLS[c];
      for (let s = 1; s <= 3; s++) { const ws = this.spdW[s]; if (ws < 0.002) continue; const ph = cell.reverse ? 1 - this.phase : this.phase; this.add(this.sample(clips[s], ph * durs[s], true, false, -cell.yaw).p, this.tmpHip, wc * ws); } }
    this.result(this.pose2, this.hip2); this.dbg.cells = Array.from(this.cellW); this.dbg.speedW = [...this.spdW];
    // crouch: the pose sinks (the foot IK bends the knees to reach the floor)
    if (this.crouchW > 0.01) { this.sample('Crouch_Idle_Loop', this.idleT, true); const k = this.crouchW * (1 - smooth(0.3, 1.5, this.speed)); this.mix(this.pose2, this.tmp, k); for (let c = 0; c < 3; c++) this.hip2[c] = this.hip2[c] * (1 - k) + this.tmpHip[c] * k; if (this.lod < 1) this.hip2[UP] -= this.crouchW * 0.3 * smooth(0.3, 1.5, this.speed); }
    // jump / land / roll
    this.airUpdate(inp, dt); const jw = this.jumpW;
    if (jw > 0.01) { let name = 'Jump_Loop', time = this.t, loop = true; if (this.rollT > 0) { name = 'Roll'; time = this.bank.get('Roll').duration - this.rollT; loop = false; } else if (!inp.onGround) { if (this.airT < 0.22 && inp.vy > 0) { name = 'Jump_Start'; time = this.airT; loop = false; } } else { name = 'Jump_Land'; time = (1 - this.landT) * this.bank.get('Jump_Land').duration; loop = false; }
      this.sample(name, time, loop); this.mix(this.pose2, this.tmp, jw); for (let c = 0; c < 3; c++) this.hip2[c] = this.hip2[c] * (1 - jw) + this.tmpHip[c] * jw; this.dbg.state = this.rollT > 0 ? 'roll' : !inp.onGround ? 'jump' : 'land'; }
    else this.dbg.state = turning ? 'turn' : this.moving ? (this.spdW[3] > 0.5 ? 'sprint' : 'locomotion') : this.crouchW > 0.5 ? 'crouch' : 'idle';
    this.lq.set(this.pose2); this.hip.set(this.hip2);
    this.finish(inp, twist, ready, phi);
  }

  private airUpdate(inp: AnimInput, dt: number) {
    if (!inp.onGround) { this.airT += dt; this.wasGround = false; }
    else { if (!this.wasGround) { this.landT = 1; if (inp.fallLanded > 6) this.rollT = this.bank.get('Roll').duration; this.airT = 0; } this.wasGround = true; this.landT = Math.max(0, this.landT - dt / 0.32); this.rollT = Math.max(0, this.rollT - dt); }
    const target = !inp.onGround ? 1 : this.rollT > 0 ? 1 : this.landT > 0 ? smooth(0, 0.5, this.landT) * 0.8 : 0; this.jumpW = damp(this.jumpW, target, !inp.onGround ? 0.06 : 0.1, dt);
  }
  private air(inp: AnimInput, dt: number) {
    const name = inp.mode === 'skydive' ? 'Swim_Fwd_Loop' : 'Jump_Loop'; this.sample(name, this.t, true); this.lq.set(this.tmp); this.hip.set(this.tmpHip); this.dbg.state = inp.mode; this.airT += dt; this.wasGround = false; this.jumpW = 1; this.speed = 0;
  }
  private dead(inp: AnimInput, dt: number) {
    this.deadT += dt; const c = this.bank.get('Death01'); this.sample('Death01', this.deadT, false); this.lq.set(this.tmp); this.hip.set(this.tmpHip); this.dbg.state = 'dead';
    if (inp.dead === 2) this.mirror();
    void c;
  }
  /** Left-right mirror of the current pose (for the second death and for left/right variants). */
  private mirror() {
    const rig = this.rig, q = this.lq;
    for (let b = 0; b < this.n; b++) { const nm = rig.names[b]; if (!nm.endsWith('_l')) continue; const o = rig.idx.get(nm.slice(0, -2) + '_r'); if (o === undefined) continue; for (let k = 0; k < 4; k++) { const t = q[b * 4 + k]; q[b * 4 + k] = q[o * 4 + k]; q[o * 4 + k] = t; } }
    for (let b = 0; b < this.n; b++) { q[b * 4 + 1] = -q[b * 4 + 1]; q[b * 4 + 2] = -q[b * 4 + 2]; }
  }

  // ------------------------------------------------------------------ layers 2-5
  private finish(inp: AnimInput, twist: number, ready: boolean, phi = 0) {
    const dt = Math.min(0.1, inp.dt); const rig = this.rig, B = this.b; const full = this.dbg.state === 'skydive' || this.dbg.state === 'glide' || this.dbg.state === 'dead';
    if (!full) {
      // ---- 2 upper-body weapon pose
      const kind = inp.hold; const hasGun = inp.armed && kind !== 'none'; const sprinting = inp.sprint && this.speed > 4.6;
      const wTarget = inp.emote ? 0 : hasGun ? (sprinting && !ready ? 0.4 : 1) : 0; this.weaponW = damp(this.weaponW, wTarget, 0.12, dt);
      if (this.weaponW > 0.01) {
        let name = 'Pistol_Idle_Loop', time = this.t % 1.667, loop = true; const parts: [string, number, number][] = [];
        if (kind === 'melee') { name = 'Sword_Idle'; time = this.t; if (inp.kick > 0.05) { name = 'Sword_Attack'; time = (1 - inp.kick) * this.bank.get('Sword_Attack').duration; loop = false; } parts.push([name, time, 1]); }
        else if (inp.reload) { name = 'Pistol_Reload'; time = Math.min(0.999, inp.reloadP) * this.bank.get('Pistol_Reload').duration; loop = false; parts.push([name, time, 1]); }
        else if (ready) { pitchWeights(inp.aimPitch, this.pitchW); parts.push(['Pistol_Aim_Down', 0, this.pitchW[0]], ['Pistol_Aim_Neutral', 0, this.pitchW[1]], ['Pistol_Aim_Up', 0, this.pitchW[2]]); }
        else parts.push(['Pistol_Idle_Loop', this.t, 1]);
        this.clear(); for (const [nm, tm, w] of parts) if (w > 0.001) { this.sample(nm, tm, nm !== 'Sword_Attack' && nm !== 'Pistol_Reload', false); this.add(this.tmp, this.tmpHip, w); } this.result(this.pose3, this.hip3);
        this.mix(this.lq, this.pose3, this.weaponW, rig.upper); this.dbg.layers += 'weapon ';
      }
      // one-shot upper-body actions
      const over = (name: string, time: number, w: number, loop = false) => { if (w <= 0.01) return; this.sample(name, time, loop); this.mix(this.lq, this.tmp, w, rig.upper); this.dbg.layers += name + ' '; };
      if (inp.heal) over('PickUp_Table', Math.min(this.t % 3, this.bank.get('PickUp_Table').duration * 0.5), 1);
      if (inp.throwT > 0) over('Punch_Cross', (1 - inp.throwT) * this.bank.get('Punch_Cross').duration, smooth(0, 0.2, inp.throwT) * 0.9);
      if (inp.emote) { this.sample('Dance_Loop', this.t, true); this.mix(this.lq, this.tmp, 1); this.hip.set(this.tmpHip); this.dbg.layers += 'emote '; }
    }
    this.fk();
    // ---- 3 aim offset: counter-twist the hips' strafe yaw, add the aim yaw, spread over the spine 35 / 35 / 30
    const gun = !full && inp.armed && inp.hold !== 'melee' && inp.hold !== 'none' && !inp.heal && inp.throwT <= 0 && !inp.emote; const spine = [B.spine_01, B.spine_02, B.spine_03], share = [0.35, 0.35, 0.3];
    const carryPitch = this.dbg.state === 'sprint' ? -0.75 : -0.42; // low ready: barrel forward and down
    if (gun) {
      let pelvisYaw = 0; for (let c = 0; c < 8; c++) pelvisYaw += this.cellW[c] * -CELLS[c].yaw;
      const want = twist - pelvisYaw; for (let i = 0; i < 3; i++) this.rot(spine[i], 0, 1, 0, want * share[i]); this.fk();
      // exact aim: measure where the barrel points and take out the remaining error
      for (let it = 0; it < 2; it++) {
        this.barrel(); const f = this.muzzleDir; const wantYaw = twist, wantPitch = ready ? inp.aimPitch : carryPitch; const haveYaw = Math.atan2(f.x, f.z), havePitch = Math.asin(Math.max(-1, Math.min(1, f.y)));
        const eY = wrap(wantYaw - haveYaw), eP = wantPitch - havePitch; if (Math.abs(eY) < 0.002 && Math.abs(eP) < 0.002) break;
        for (let i = 0; i < 3; i++) this.rot(spine[i], 0, 1, 0, eY * share[i]); this.fk(); this.barrel(); const ax = this.v.t.copy(this.muzzleDir).cross(Y); const al = ax.length();
        if (al > 1e-3) { ax.divideScalar(al); const eP2 = wantPitch - Math.asin(Math.max(-1, Math.min(1, this.muzzleDir.y))); for (let i = 0; i < 3; i++) this.rot(spine[i], ax.x, ax.y, ax.z, eP2 * share[i]); this.fk(); }
      }
      this.dbg.layers += 'aim ';
    } else if (!full && inp.armed && inp.hold === 'melee') { for (let i = 0; i < 3; i++) this.rot(spine[i], 0, 1, 0, twist * share[i]); }
    // ---- 4 additives (about root-space axes: X pitches forward, Z rolls to the right, Y turns left)
    if (!full && this.lod < 2) {
      const breath = Math.sin(this.t * Math.PI * 2 * 0.27); this.rot(B.spine_03, 1, 0, 0, breath * 0.012); this.rot(B.clavicle_l, 0, 0, 1, breath * 0.006); this.rot(B.clavicle_r, 0, 0, 1, -breath * 0.006);
      // lean into turns up to 8 deg, proportional to turn speed; lean into acceleration up to 5 deg
      const rollT = -Math.max(-1, Math.min(1, this.facing.angVel / (540 * D))) * 8 * D * smooth(0.5, 3, this.speed); const pitchT = Math.max(-1, Math.min(1, this.accel / 8)) * 5 * D;
      this.lean.roll = damp(this.lean.roll, rollT, 0.12, dt); this.lean.pitch = damp(this.lean.pitch, pitchT, 0.15, dt);
      this.rot(B.pelvis, 0, 0, 1, this.lean.roll * 0.4); this.rot(B.spine_01, 0, 0, 1, this.lean.roll * 0.3); this.rot(B.spine_02, 0, 0, 1, this.lean.roll * 0.3);
      this.rot(B.pelvis, 1, 0, 0, this.lean.pitch * 0.3); this.rot(B.spine_02, 1, 0, 0, this.lean.pitch * 0.4); this.rot(B.spine_03, 1, 0, 0, this.lean.pitch * 0.3);
      // landing compression
      if (this.landT > 0 && this.rollT <= 0) this.hip[UP] -= 0.1 * Math.sin(Math.min(1, this.landT) * Math.PI) * smooth(0, 0.2, this.landT);
      // recoil kick
      if (this.kickEnv > 0.01 && inp.hold !== 'melee') { const a = inp.recoilDeg * D * this.kickEnv; this.rot(B.spine_03, 1, 0, 0, -a * 0.6); this.rot(B.spine_02, 1, 0, 0, -a * 0.25); this.rot(B.clavicle_r, 1, 0, 0, a * 0.4); this.rot(B.Head, 1, 0, 0, a * 0.2); }
      // hit reacts: front / back / left / right (hitDir 0 = from the front, +90 = from the left)
      if (this.hitEnv > 0.02) { const h = this.hitEnv; const fz = Math.cos(this.hitDir), fx = Math.sin(this.hitDir); this.rot(B.spine_02, 1, 0, 0, -fz * h * 9 * D); this.rot(B.spine_03, 1, 0, 0, -fz * h * 6 * D); this.rot(B.spine_02, 0, 0, 1, -fx * h * 8 * D); this.rot(B.Head, 1, 0, 0, -fz * h * 14 * D); this.rot(B.Head, 0, 1, 0, fx * h * 12 * D); this.dbg.layers += 'hit '; }
      // idle variations every 8-12 s: look around / shift weight / check the weapon
      this.idleVariation(inp, dt);
    }
    this.fk();
    // ---- 5 IK
    if (!full) { if (this.lod < 2) this.leftHandIK(inp, dt); if (this.lod < 1) this.footIK(inp, dt); else this.pelvisOff = damp(this.pelvisOff, 0, 0.1, dt); if (this.lod < 2) this.headLook(inp, ready); }
    this.fk(); this.barrel(); this.writeSocketOutputs();
    this.dbg.bodyYaw = this.facing.bodyYaw; this.dbg.aim = [this.muzzleDir.x, this.muzzleDir.y, this.muzzleDir.z];
  }

  private idleVariation(inp: AnimInput, dt: number) {
    const iv = this.idleVar, B = this.b;
    if (this.moving || this.stopT < 3 || !inp.onGround) { iv.kind = -1; iv.next = 8 + Math.random() * 4; iv.t = 0; return; }
    iv.next -= dt; if (iv.next <= 0 && iv.kind < 0) { iv.kind = Math.floor(Math.random() * 3); iv.t = 0; }
    if (iv.kind >= 0) { iv.t += dt; const dur = 2.6, p = iv.t / dur, env = Math.sin(Math.min(1, p) * Math.PI);
      if (iv.kind === 0) { this.rot(B.Head, 0, 1, 0, Math.sin(p * Math.PI * 2) * 0.5 * env); this.rot(B.spine_03, 0, 1, 0, Math.sin(p * Math.PI * 2) * 0.12 * env); }
      else if (iv.kind === 1) { this.rot(B.pelvis, 0, 0, 1, 0.07 * env); this.rot(B.spine_02, 0, 0, 1, -0.05 * env); this.hip[0] += 0.02 * env; }
      else { this.rot(B.Head, 1, 0, 0, 0.35 * env); this.rot(B.spine_03, 1, 0, 0, 0.1 * env); }
      if (iv.t >= dur) { iv.kind = -1; iv.next = 8 + Math.random() * 4; } }
  }

  /** Forgets one-shot state (death timer, landing) when a survivor respawns. */
  reset() { this.deadT = 0; this.landT = 0; this.rollT = 0; this.jumpW = 0; this.hitEnv = 0; this.kickEnv = 0; }
  /** Weapon frame in root space: where the weapon's origin and rotation are, from the right hand's current pose (needs a current fk()). */
  weaponFrame(origin: THREE.Vector3, rot: THREE.Quaternion) {
    const B = this.b, S = this.sockets; const hand = this.boneQ(B.hand_r, this.q.b).clone(); rot.copy(hand).multiply(S.handR.q);
    origin.copy(this.bone(B.hand_r, this.v.a)).add(S.handR.p.clone().applyQuaternion(hand)).add((this.weapon?.grip ?? this.v.c.set(0, 0, 0)).clone().multiplyScalar(-1).applyQuaternion(rot));
  }
  /** Turns a point given in weapon space into root space, in place. */
  weaponPoint(p: THREE.Vector3) { const o = new THREE.Vector3(), q = new THREE.Quaternion(); this.weaponFrame(o, q); p.applyQuaternion(q).add(o); }
  /** Where the weapon points, in root space (needs a current fk()). */
  private barrel() {
    const h = this.b.hand_r, S = this.sockets.handR, w = this.rig.wq; const q = this.q.a.set(w[h * 4], w[h * 4 + 1], w[h * 4 + 2], w[h * 4 + 3]).multiply(S.q);
    this.muzzleDir.set(0, 0, 1).applyQuaternion(q);
  }
  private writeSocketOutputs() {
    const rig = this.rig; const Hd = this.b.Head, w = rig.wq, p = rig.wp; const hq = this.q.a.set(w[Hd * 4], w[Hd * 4 + 1], w[Hd * 4 + 2], w[Hd * 4 + 3]);
    this.headCamRoot.copy(this.sockets.headCam.p).applyQuaternion(hq).add(this.v.a.set(p[Hd * 3], p[Hd * 3 + 1], p[Hd * 3 + 2]));
  }
  private bone(b: number, out: THREE.Vector3) { return out.set(this.rig.wp[b * 3], this.rig.wp[b * 3 + 1], this.rig.wp[b * 3 + 2]); }
  private boneQ(b: number, out: THREE.Quaternion) { const w = this.rig.wq; return out.set(w[b * 4], w[b * 4 + 1], w[b * 4 + 2], w[b * 4 + 3]); }
  /** Rotates bone b (world) so that the direction toward its child turns from `from` to `to`. */
  private swing(b: number, from: THREE.Vector3, to: THREE.Vector3) {
    const axis = this.v.t.copy(from).cross(to); const s = axis.length(); if (s < 1e-7) return; axis.divideScalar(s); const ang = Math.atan2(s, from.dot(to)); this.rig.rotateRoot(this.lq, b, axis.x, axis.y, axis.z, ang);
  }
  private twoBone(a: number, m: number, e: number, target: THREE.Vector3, pole: THREE.Vector3) {
    const A = this.bone(a, this.v.a).clone(), M = this.bone(m, this.v.b).clone(), E = this.bone(e, this.v.c).clone();
    const r = solveTwoBone(A, M, E, target, pole); const d0 = M.clone().sub(A).normalize(), d1 = r.mid.clone().sub(A).normalize(); this.swing(a, d0, d1); this.fk();
    const M2 = this.bone(m, this.v.b).clone(), E2 = this.bone(e, this.v.c).clone(); const e0 = E2.clone().sub(M2).normalize(), e1 = r.end.clone().sub(M2).normalize(); this.swing(m, e0, e1); this.fk();
  }
  private leftHandIK(inp: AnimInput, dt: number) {
    const gun = inp.armed && inp.hold !== 'none' && inp.hold !== 'melee' && this.weapon?.left && !inp.reload && !inp.heal && inp.throwT <= 0 && !inp.emote;
    this.leftIK = damp(this.leftIK, gun ? (inp.sprint && !inp.aiming && this.speed > 4.6 ? 0.7 : 1) : 0, 0.08, dt); if (this.leftIK < 0.01 || !this.weapon?.left) return;
    const B = this.b, S = this.sockets, rig = this.rig;
    // weapon frame in root space
    const hq = this.boneQ(B.hand_r, this.q.a).multiply(S.handR.q); const origin = this.bone(B.hand_r, this.v.a).clone().add(S.handR.p.clone().applyQuaternion(this.boneQ(B.hand_r, this.q.b))).add(this.weapon.grip.clone().multiplyScalar(-1).applyQuaternion(hq));
    const target = this.weapon.left.clone().applyQuaternion(hq).add(origin);
    const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.leftHandRoll); const wantHandQ = hq.clone().multiply(roll).multiply(S.handL.q.clone().invert());
    const handPos = target.clone().sub(S.handL.p.clone().applyQuaternion(wantHandQ));
    const ids = [B.upperarm_l, B.lowerarm_l, B.hand_l]; const keep = ids.map((i) => this.lq.slice(i * 4, i * 4 + 4));
    this.twoBone(B.upperarm_l, B.lowerarm_l, B.hand_l, handPos, this.v.pole.set(0.5, -1, -0.35).normalize());
    rig.setWorld(this.lq, B.hand_l, [wantHandQ.x, wantHandQ.y, wantHandQ.z, wantHandQ.w]);
    if (this.leftIK < 0.999) ids.forEach((id, k) => { const cur = this.lq.slice(id * 4, id * 4 + 4); const o = keep[k]; const d = cur[0] * o[0] + cur[1] * o[1] + cur[2] * o[2] + cur[3] * o[3]; const s = d < 0 ? -1 : 1, w = this.leftIK; for (let j = 0; j < 4; j++) this.lq[id * 4 + j] = o[j] * (1 - w) + cur[j] * s * w; qnorm(this.lq, id * 4); });
    this.dbg.layers += 'leftIK ';
  }
  private footIK(inp: AnimInput, dt: number) {
    const B = this.b, rig = this.rig; const g = this.ground; const active = g && inp.onGround && this.rollT <= 0 && !inp.slide; const feet = [B.foot_l, B.foot_r], thighs = [B.thigh_l, B.thigh_r], calves = [B.calf_l, B.calf_r];
    if (!active) { this.pelvisOff = damp(this.pelvisOff, 0, 0.1, dt); this.footPlant[0] = this.footPlant[1] = 0; this.dbg.pelvisOff = this.pelvisOff; if (Math.abs(this.pelvisOff) > 1e-4) { this.hip[UP] += this.pelvisOff; this.fk(); } return; }
    const cy = Math.cos(this.facing.bodyYaw), sy = Math.sin(this.facing.bodyYaw);
    const world = (b: number) => { const x = rig.wp[b * 3], z = rig.wp[b * 3 + 2]; return [this.rootX + x * cy + z * sy, this.rootZ - x * sy + z * cy]; };
    const rest = rig.restP; void rest; const ankle = 0.086; const delta = [0, 0], h = [0, 0];
    for (let i = 0; i < 2; i++) { const [wx, wz] = world(feet[i]); delta[i] = g!.height(wx, wz) - this.rootY; h[i] = rig.wp[feet[i] * 3 + 1] - ankle; }
    // pelvis drops to the lower foot (never rises), smoothed
    const drop = Math.min(0, Math.min(delta[0], delta[1])); const tgtOff = Math.max(-0.5, drop); this.pelvisOff = damp(this.pelvisOff, tgtOff, 0.09, dt); this.hip[UP] += this.pelvisOff; this.fk(); this.dbg.pelvisOff = this.pelvisOff;
    for (let i = 0; i < 2; i++) {
      const hh = Math.max(0, rig.wp[feet[i] * 3 + 1] - ankle); const plant = 1 - smooth(0.03, 0.16, hh); this.footPlant[i] = plant;
      const [wx, wz] = world(feet[i]); const e = 0.18; const gy = g!.height(wx, wz), gx1 = g!.height(wx + e, wz), gz1 = g!.height(wx, wz + e);
      const nWorld = new THREE.Vector3(-(gx1 - gy) / e, 1, -(gz1 - gy) / e).normalize(); const nRoot = nWorld.clone().applyAxisAngle(Y, -this.facing.bodyYaw);
      const fp = this.bone(feet[i], this.v.t).clone();
      // foot target: animated height above the ground it is over, re-based onto the real ground; never below the ground
      const above = Math.max(0, fp.y - ankle); const ty = (gy - this.rootY) + ankle + above;
      const target = new THREE.Vector3(fp.x, ty, fp.z); const origFootQ = this.boneQ(feet[i], this.q.b).clone();
      const kneeDir = this.v.pole.set(0, 0.15, 1).normalize();
      this.twoBone(thighs[i], calves[i], feet[i], target, kneeDir);
      // foot flat on the surface, blended by how planted it is
      const tilt = new THREE.Quaternion().setFromUnitVectors(Y, nRoot); const want = tilt.clone().slerp(new THREE.Quaternion(), 1 - plant * 0.85).multiply(origFootQ);
      rig.setWorld(this.lq, feet[i], [want.x, want.y, want.z, want.w]); this.fk();
      const dst = i === 0 ? this.dbg.feet.l : this.dbg.feet.r; const fp2 = this.bone(feet[i], this.v.t); dst[0] = fp2.x; dst[1] = fp2.y; dst[2] = fp2.z;
    }
    this.dbg.feet.lPlant = this.footPlant[0]; this.dbg.feet.rPlant = this.footPlant[1]; this.dbg.layers += 'footIK ';
  }
  private headLook(inp: AnimInput, ready: boolean) {
    if (!(inp.armed || ready) || this.dbg.state === 'dead') return; const B = this.b;
    const hq = this.boneQ(B.Head, this.q.a); const f = new THREE.Vector3(0, 0, 1).applyQuaternion(hq);
    const rel = wrap(inp.aimYaw - this.facing.bodyYaw); const want = new THREE.Vector3(Math.sin(rel) * Math.cos(inp.aimPitch), Math.sin(inp.aimPitch), Math.cos(rel) * Math.cos(inp.aimPitch));
    const eY = Math.max(-60 * D, Math.min(60 * D, wrap(Math.atan2(want.x, want.z) - Math.atan2(f.x, f.z)))), eP = Math.max(-35 * D, Math.min(35 * D, Math.asin(want.y) - Math.asin(f.y)));
    this.rot(B.neck_01, 0, 1, 0, eY * 0.35); this.rot(B.Head, 0, 1, 0, eY * 0.45); this.rot(B.Head, 1, 0, 0, -eP * 0.6); this.fk();
  }
}
