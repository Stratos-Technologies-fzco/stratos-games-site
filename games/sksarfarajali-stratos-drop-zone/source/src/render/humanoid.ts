// A survivor as a skinned, rigged humanoid (Quaternius base body, repainted into our colour atlas) driven by CharacterAnimator.
// It offers the same methods the game already calls on the old procedural Character, so the game code barely changes.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import atlas from '../../shared/atlas_layout.json';
import weaponSockets from '../../shared/weapon_sockets.json';
import { CharacterAnimator, defaultInput, type AnimInput, type Ground, type Hold, type Sockets } from '../anim/CharacterAnimator';
import { ClipBank, loadRawClips } from '../anim/clips';
import { Rig } from '../anim/rig';
import { wrap } from '../anim/facing';
import { settings } from '../input';
import { cloneModel } from './assets';
import type { AnimState, Avatar, Survivor } from './character';

interface WeaponEntry { hold: Hold; socket_grip: number[]; socket_left_hand: number[] | null; muzzle: number[] | null; recoil: number }
const WEAPONS = weaponSockets as unknown as Record<string, WeaponEntry>;
const loader = new GLTFLoader();
const bodyCache = new Map<string, Promise<THREE.Group>>();
const loadBody = (body: 'male' | 'female') => { let p = bodyCache.get(body); if (!p) { p = loader.loadAsync(`models/Characters/humanoid_${body}.glb`).then((g) => g.scene); bodyCache.set(body, p); } return p; };
let bankPromise: Promise<ClipBank> | null = null; let bankRig: Rig | null = null;
function getBank(rig: Rig): Promise<ClipBank> { return bankPromise ??= loadRawClips().then((raw) => { bankRig = rig; return new ClipBank(rig, raw); }); }
const atlasTex = new Map<number, THREE.Texture>();
function atlasTexture(size: number): THREE.Texture {
  let t = atlasTex.get(size); if (!t) { t = new THREE.TextureLoader().load(`models/Characters/atlas_${size}.png`); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; atlasTex.set(size, t); } return t;
}
const atlasSize = () => (settings.quality === 'low' || (settings.quality === 'auto' && matchMedia('(pointer: coarse)').matches) ? 512 : 1024);

export class Humanoid implements Avatar {
  /** Set by the game: height of the ground (terrain or a floor) at a world position, for foot placement. */
  static ground: Ground | null = null;
  /** Height of the survivor being animated right now: the ground query looks for floors up to a knee above it, so stairs count and roofs overhead do not. */
  static refY = 0;
  root = new THREE.Group(); body = new THREE.Group(); weapon: THREE.Object3D | null = null; weaponName = ''; ready = false; height = 1.84;
  animator: CharacterAnimator | null = null; wing: THREE.Object3D | null = null; headCam = new THREE.Vector3(); lod = 0;
  private bones: THREE.Bone[] = []; private pelvisBone!: THREE.Bone; private meshes: THREE.SkinnedMesh[] = []; private mat!: THREE.MeshLambertMaterial;
  private handSock!: THREE.Object3D; private hold: Hold = 'none'; private recoil = 0; private muzzleLocal: THREE.Vector3 | null = null;
  private inp: AnimInput = defaultInput(); private acc = 0; private tDead = 0; private wantWing = false; private wingK = 0; private flashT = 0; private isFar = false; private distance = 0;
  private static blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
  private blob: THREE.Mesh;
  constructor(public model: Survivor) {
    this.root.add(this.body); this.blob = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16).rotateX(-Math.PI / 2), Humanoid.blobMat); this.blob.position.y = 0.05; this.blob.renderOrder = 1; this.root.add(this.blob);
  }

  async load() {
    const row = atlas.rows.find((r) => r.id === this.model) ?? atlas.rows[0]; const src = await loadBody(row.body as 'male' | 'female'); const scene = cloneSkinned(src) as THREE.Group; this.body.add(scene);
    scene.traverse((o) => { const m = o as THREE.SkinnedMesh; if (m.isSkinnedMesh) { this.meshes[Number(m.name.slice(-1))] = m; m.frustumCulled = false; m.castShadow = false; } });
    const skel = this.meshes[0].skeleton; this.bones = skel.bones; this.pelvisBone = this.bones.find((b) => b.name === 'pelvis')!;
    const tex = atlasTexture(atlasSize()).clone(); tex.offset.set(0, row.row / atlas.grid); tex.needsUpdate = true; this.mat = new THREE.MeshLambertMaterial({ map: tex });
    for (const m of this.meshes) m.material = this.mat;
    const rig = new Rig(this.bones); const bank = await getBank(rig); if (bankRig && bankRig.names.join() !== rig.names.join()) throw new Error('humanoid: male and female skeletons differ');
    const sock = (n: string) => scene.getObjectByName(n)!; this.handSock = sock('hand_r_weapon'); const hl = sock('hand_l_ik'), hc = sock('head_cam');
    const sockets: Sockets = { handR: { p: this.handSock.position.clone(), q: this.handSock.quaternion.clone() }, handL: { p: hl.position.clone(), q: hl.quaternion.clone() }, headCam: { p: hc.position.clone() } };
    this.animator = new CharacterAnimator(rig, bank, sockets); this.animator.ground = Humanoid.ground; this.setLod(0); this.ready = true;
  }

  async setWeapon(name: string | null) {
    if (name === this.weaponName) return; this.weaponName = name ?? '';
    if (this.weapon) { this.weapon.parent?.remove(this.weapon); this.weapon = null; }
    const e = name ? WEAPONS[name] : undefined; this.hold = e?.hold ?? 'none'; this.recoil = e?.recoil ?? 0; this.muzzleLocal = e?.muzzle ? new THREE.Vector3(...(e.muzzle as [number, number, number])) : null;
    if (this.animator) this.animator.weapon = e ? { grip: new THREE.Vector3(...(e.socket_grip as [number, number, number])), left: e.socket_left_hand ? new THREE.Vector3(...(e.socket_left_hand as [number, number, number])) : null } : null;
    if (!name || !this.ready) return; const w = await cloneModel(name); if (this.weaponName !== name) return;
    w.position.set(-e!.socket_grip[0], -e!.socket_grip[1], -e!.socket_grip[2]); this.handSock.add(w); this.weapon = w;
  }
  async setWing(on: boolean) {
    this.wantWing = on; if (on && !this.wing) { const w = await cloneModel('personal_glider_wing'); if (!this.wing) { this.wing = w; w.position.set(0, 1.5, -0.1); w.scale.setScalar(0.01); this.root.add(w); } }
    if (this.wing && on) this.wing.visible = true;
  }
  setLod(l: number) { this.lod = l; this.meshes.forEach((m, i) => { if (m) m.visible = i === l; }); if (this.animator) this.animator.lod = l; }
  setFar(on: boolean) { this.isFar = on; }
  /** Distance to the camera (m) picks the animation and mesh level: 0-25 full, 25-60 no foot IK and 30 fps, 60-150 base + aim only at 10 fps. Phones and Low quality use half these distances to stay inside the animation time budget. */
  setDistance(d: number) { this.distance = d; const k = settings.quality === 'low' || (settings.quality === 'auto' && matchMedia('(pointer: coarse)').matches) ? 0.5 : 1; const l = d <= 25 * k ? 0 : d <= 60 * k ? 1 : 2; if (l !== this.lod && this.ready) this.setLod(l); }
  flash(t: number) { this.flashT = t; if (this.mat) this.mat.emissive.setHex(0xff6a6a); }
  resetDeath() { this.tDead = 0; this.root.scale.setScalar(1); this.root.visible = true; this.animator?.reset(); }
  /** World position of the weapon's muzzle (for flashes and tracers), or null. */
  muzzleWorld(out: THREE.Vector3): boolean { if (!this.animator || !this.muzzleLocal) return false; this.animator.muzzleRoot.copy(this.muzzleLocal); this.animator.weaponPoint(this.animator.muzzleRoot); this.root.updateMatrixWorld(); out.copy(this.animator.muzzleRoot); this.root.localToWorld(out); return true; }

  update(dt: number, s: AnimState, far?: boolean) {
    if (!this.ready || !this.animator) return; void far;
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.mat.emissive.setHex(0); }
    if (s.dead) this.tDead += dt; else this.tDead = 0;
    const period = this.lod === 0 ? 0 : this.lod === 1 ? 1 / 30 : 1 / 10; this.acc += dt; if (this.acc < period) return; dt = this.acc; this.acc = 0;
    const i = this.inp; i.dt = dt; i.aimYaw = s.yaw; i.aimPitch = s.pitch; i.vx = s.vx; i.vz = s.vz; i.onGround = s.onGround; i.vy = s.vy; i.crouch = s.crouch; i.slide = s.slide; i.sprint = s.sprint; i.aiming = s.aiming; i.firing = s.firing; i.kick = s.kick;
    i.armed = s.armed || s.melee; i.hold = s.melee ? 'melee' : s.armed ? (this.hold === 'none' ? 'rifle' : this.hold) : 'none'; i.recoilDeg = this.recoil; i.reload = s.reload; i.reloadP = s.reloadP; i.heal = s.heal; i.throwT = s.throwT; i.swap = s.swap;
    i.hit = s.hit; i.hitDir = wrap(s.hitFrom - this.animator.facing.bodyYaw); i.dead = s.dead; i.mode = s.mode; i.emote = s.emote; i.fallLanded = s.fallLanded;
    const p = this.root.position; Humanoid.refY = p.y; this.animator.update(i, p.x, p.y, p.z);
    const q = this.animator.lq, bones = this.bones; for (let b = 1; b < bones.length; b++) bones[b].quaternion.set(q[b * 4], q[b * 4 + 1], q[b * 4 + 2], q[b * 4 + 3]);
    this.pelvisBone.position.set(this.animator.hip[0], this.animator.hip[1], this.animator.hip[2]);
    this.root.rotation.y = this.animator.facing.bodyYaw; this.headCam.copy(this.animator.headCamRoot);
    // wing: opens over 0.7 s with a small overshoot, folds in 0.25 s
    if (this.wing) { this.wingK = this.wantWing ? Math.min(1, this.wingK + dt / 0.7) : Math.max(0, this.wingK - dt / 0.25); const k = this.wingK - 1; const e = this.wantWing ? 1 + 2.70158 * k * k * k + 1.70158 * k * k : this.wingK; this.wing.scale.setScalar(Math.max(0.01, e)); this.wing.visible = this.wingK > 0.01; }
    if (s.dead) { const f = Math.min(1, Math.max(0, (this.tDead - 1.5) / 0.4)); this.root.scale.setScalar(1 - f * 0.9); this.root.visible = f < 1; }
  }
}
