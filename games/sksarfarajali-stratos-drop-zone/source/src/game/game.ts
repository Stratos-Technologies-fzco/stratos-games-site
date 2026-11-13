// The match: actors, weapons, loot, zone, bots, camera and the main loop. Single-player vs bots, fully offline.
import * as THREE from 'three';
import B from '../balance.json';
import { Colliders, rayBox, stepBody, type Body } from '../core/collision';
import { Inventory, BarrierState, applyArmour, baseDamage, fallDamage, fireInterval, grenadeDamage, planZone, purchase, xpFor, zoneAt, zoneDamage, zoneTotalTime, type Armour, type GunSlot, type Item, type Rarity, type WeaponId, type ZonePlan, type ZoneState } from '../core/rules';
import { POIS, buildWorld, generateLoot, mulberry32, HALF, inRiver, coastDist, modelSize, type WorldData, type LootSpawn } from '../core/world';
import { audio, type SoundId } from '../audio';
import { clearLook, input, pollInput, settings, touch, exitPointerLock } from '../input';
import { Character, SURVIVORS, defaultAnim, type Survivor } from '../render/character';
import { cloneModel, preload, MODEL_INFO, sharedMaterial } from '../render/assets';
import { buildWorldView, type WorldView } from '../render/worldView';
import { BotBrain, NavGrid, type BotEnv, type Cmd } from './bots';
import { crateContents, itemLabel, itemModel, rollItem } from './loot';
import type { Actor, BarrierObj, Dummy, FeedRow, GroundItem, Grenade, Hud, Mode, Projectile, Result, SmokeCloud } from './types';
import { track } from '../analytics';
import { recordMatch } from '../progress';
const isTouchDevice = () => matchMedia('(pointer: coarse)').matches;

const W = B.weapons as Record<string, { label: string; class: string; damage: number; pellets: number; headshot: number; rpm?: number; swing?: number; mag: number; range: number; ammo: string | null; reload: number; reloadPerShell?: boolean; spread: number; recoil: number; auto: boolean; scope: number; projectileSpeed?: number; drop?: number }>;
const RC = B.rarity.colors;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
let nextId = 1;
// shared geometry and materials: one per kind instead of one per loot ring or smoke cloud
const RING_GEO = new THREE.RingGeometry(0.55, 0.7, 20).rotateX(-Math.PI / 2); const RING_MATS: THREE.MeshBasicMaterial[] = [];
const ringMat = (r: number) => (RING_MATS[r] ??= new THREE.MeshBasicMaterial({ color: new THREE.Color(RC[r]), transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
const SMOKE_GEO = new THREE.SphereGeometry(1, 10, 8); const SMOKE_MAT = new THREE.MeshLambertMaterial({ color: 0xd8d4e8, transparent: true, opacity: 0.8 });

export class Game {
  renderer: THREE.WebGLRenderer; camera = new THREE.PerspectiveCamera(70, 1, 0.1, 700);
  world!: WorldData; colliders!: Colliders; view!: WorldView; nav!: NavGrid; spawns: LootSpawn[] = [];
  actors: Actor[] = []; player!: Actor; items: GroundItem[] = []; dummies: Dummy[] = []; projectiles: Projectile[] = []; grenades: Grenade[] = []; smokes: SmokeCloud[] = []; barriers: BarrierObj[] = [];
  phase: 'menu' | 'flight' | 'playing' | 'ended' = 'menu'; mode: Mode = 'solo'; time = 0; matchT = 0; flightT = 0; zonePlan!: ZonePlan; zone: ZoneState | null = null; lastPhase = 0;
  rand = mulberry32(1); plane!: THREE.Object3D; planeStart = V(); planeDir = V(); planeSpeed = 0; kiosks: { x: number; z: number; y: number; last: { lastAt: number } }[] = [];
  hud: Hud; feed: FeedRow[] = []; private fx!: { tracers: THREE.Line[]; flashes: THREE.Mesh[]; puffs: THREE.Mesh[] }; private ghost: THREE.Object3D | null = null; placing = false;
  private raf = 0; private last = 0; private hudT = 0; private lootT = 0; private botT = 0; private bushT = 0; private fpsAcc = 0; private fpsN = 0; fps = 60; private lowFpsT = 0; private res = 1;
  survivor: Survivor = 'survivor_kiran'; spectateTarget: Actor | null = null; env: BotEnv; botCount = 0; botsInTraining = false; bushes: { x: number; z: number }[] = []; marker: { x: number; z: number } | null = null;
  private footT = 0; private chat = ''; private chatT = 0; private shake = 0; private numbers: Hud['numbers'] = []; private shotsHeard: { x: number; z: number; t: number; id?: number }[] = []; private dmgArcs: { a: number; t: number }[] = [];
  private hitT = 0; private hitHead = false; private bannerT = 0; private banner = ''; private paused = false; kioskOpen = false; inventoryOpen = false; mapOpen = false; private endT = 0; private difficulty: 'easy' | 'normal' | 'hard' = 'normal';
  private canopies: { x: number; y: number; z: number; r: number }[] = []; private canopyCells = new Map<number, number[]>(); private camDist = 3.2;
  onChange = () => {}; ready = false; private dropT = 0; private dropSeq = 0; private dropCard: { id: number; key: string; name: string } | null = null; private elimText = ''; private elimT = 0; private autoPickT = 0; demo = false; demoStep = 0; demoFlags = { reloaded: false, healed: false }; private demoStart = { x: 0, z: 0 };

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0xf4c58a); this.applyResolution();
    this.hud = this.blankHud();
    this.env = { time: 0, actors: this.actors, colliders: null as unknown as Colliders, terrain: null as never, zone: null, items: this.items, shots: this.shotsHeard, rand: Math.random, seeThrough: (a, b) => this.canSee(a, b) };
    addEventListener('resize', () => this.applyResolution());
  }

  // ------------------------------------------------------------------ setup
  async init(onProgress?: (p: number) => void) {
    this.world = buildWorld(); this.colliders = new Colliders(this.world.terrain, this.world.placements); this.nav = new NavGrid(this.colliders, this.world.terrain);
    this.env.colliders = this.colliders; this.env.terrain = this.world.terrain;
    this.spawns = generateLoot(this.world, (x, z, y) => this.colliders.surfaceBelow(x, z, y), (x, z, y) => this.colliders.blocked(x, z, y));
    this.bushes = this.world.vegetation.filter((v) => v.model === 'bush').map((v) => ({ x: v.x, z: v.z }));
    for (const p of [...this.world.vegetation, ...this.world.placements]) if (p.model === 'palm_tree' || p.model === 'broadleaf_tree') {
      const s = modelSize(p.model); const i = this.canopies.length; this.canopies.push({ x: p.x, y: p.y + s[1] * 0.72, z: p.z, r: Math.max(s[0], s[2]) * 0.42 });
      const k = Math.floor(p.x / 10) * 4096 + Math.floor(p.z / 10); const l = this.canopyCells.get(k); if (l) l.push(i); else this.canopyCells.set(k, [i]);
    }
    onProgress?.(0.1);
    await preload([...MODEL_INFO.keys()].filter((n) => n !== 'coast_buggy'), (d, t) => onProgress?.(0.1 + 0.5 * (d / t)));
    this.view = await buildWorldView(this.world); onProgress?.(0.9);
    this.buildKiosks(); this.buildFx(); this.plane = await cloneModel('cargo_glider'); this.plane.visible = false; this.view.scene.add(this.plane);
    const ghost = await cloneModel('monsoon_barrier'); ghost.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.material = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.5 }); }); ghost.visible = false; this.ghost = ghost; this.view.scene.add(ghost);
    this.applyQuality(); this.ready = true; onProgress?.(1); this.loop(performance.now());
  }
  private buildKiosks() {
    for (const p of POIS.filter((q) => q.tier === 'high' || q.tier === 'top')) {
      const x = p.x + 7, z = p.z + 7; let y = this.world.terrain.height(x, z); y = this.colliders.surfaceBelow(x, z, y + 2) ?? y;
      cloneModel('supply_kiosk').then((m) => { m.position.set(x, y, z); this.view.scene.add(m); });
      this.colliders.add({ x0: x - 0.6, x1: x + 0.6, z0: z - 0.5, z1: z + 0.5, y0: y, y1: y + 2 }); this.kiosks.push({ x, y, z, last: { lastAt: -99 } });
    }
  }
  private buildFx() {
    const scene = this.view.scene; this.fx = { tracers: [], flashes: [], puffs: [] };
    for (let i = 0; i < 24; i++) { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), V(0, 0, 1)]), new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true })); l.visible = false; l.frustumCulled = false; l.userData.t = 0; scene.add(l); this.fx.tracers.push(l); }
    for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffd36b })); m.visible = false; m.userData.t = 0; scene.add(m); this.fx.flashes.push(m); }
    for (let i = 0; i < 32; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xc9b38a, transparent: true })); m.visible = false; m.userData.t = 0; scene.add(m); this.fx.puffs.push(m); }
  }
  private applyResolution() {
    const q = settings.quality; const dpr = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
    this.res = settings.resScale * (q === 'low' ? 0.75 : 1) * this.dynRes; this.renderer.setPixelRatio(Math.max(0.4, dpr * this.res)); this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
  }
  private dynRes = 1;
  private autoQuality() { if (settings.quality === 'auto') { const mobile = matchMedia('(pointer: coarse)').matches; this.effQuality = mobile ? 'low' : 'medium'; } else this.effQuality = settings.quality; this.hud.quality = this.effQuality; }
  effQuality: 'low' | 'medium' | 'high' | 'auto' = 'medium';
  /** Re-reads the graphics setting: resolution, and real shadows on High only. */
  applyQuality() {
    this.autoQuality(); this.applyResolution(); const high = this.effQuality === 'high';
    if (this.renderer.shadowMap.enabled !== high) { this.renderer.shadowMap.enabled = high; sharedMaterial.needsUpdate = true; }
    if (!this.view) return; this.view.sun.castShadow = high;
    if (high) { const s = this.view.sun.shadow, c = s.camera as THREE.OrthographicCamera; s.mapSize.set(1024, 1024); c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 280; c.updateProjectionMatrix(); s.bias = -0.0006; }
    for (const ch of this.view.chunks) { ch.mesh.castShadow = high; ch.mesh.receiveShadow = high; }
    for (const a of this.actors) a.char.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.castShadow = high; });
  }

  // ------------------------------------------------------------------ match lifecycle
  async start(mode: Mode, survivor: Survivor, opts: { bots?: boolean; difficulty?: 'easy' | 'normal' | 'hard'; demo?: boolean } = {}) {
    this.demo = !!opts.demo; this.demoStep = 0; this.demoFlags = { reloaded: false, healed: false }; if (this.demo) track('demo_start');
    this.cleanup(); this.mode = mode; this.survivor = survivor; this.rand = mulberry32((Math.random() * 1e9) | 0); this.difficulty = opts.difficulty ?? 'normal'; this.botsInTraining = !!opts.bots;
    this.time = 0; this.matchT = 0; this.flightT = 0; this.lastPhase = 0; this.feed = []; this.numbers = []; this.hud.result = null; this.spectateTarget = null; this.endT = 0; this.kioskOpen = this.inventoryOpen = this.mapOpen = false; this.marker = null;
    this.zonePlan = planZone(this.rand); this.zone = null; this.env.zone = null;
    this.player = await this.makeActor(settings ? 'You' : 'You', false, true, survivor);
    const bots = mode === 'solo' ? B.match.players - 1 : opts.bots ? B.bots.trainingCount : 0;
    for (let i = 0; i < bots; i++) await this.makeActor('', true, false, SURVIVORS[i % 4].id);
    for (const k of this.kiosks) k.last.lastAt = -99;
    await this.spawnGroundLoot();
    if (mode === 'solo') this.beginFlight(); else this.beginTraining();
    audio.startMusic('match'); track('level_start', { mode });
    this.onChange();
  }
  private gen = 0;
  private cleanup() {
    const scene = this.view.scene; this.gen++;
    for (const a of this.actors) scene.remove(a.char.root);
    for (const g of this.items) { scene.remove(g.mesh); if (g.ring) scene.remove(g.ring); if (g.beam) scene.remove(g.beam); }
    for (const d of this.dummies) scene.remove(d.mesh);
    for (const b of this.barriers) { scene.remove(b.mesh); this.colliders.remove(b.box); }
    for (const p of this.projectiles) scene.remove(p.mesh); for (const g of this.grenades) scene.remove(g.mesh); for (const s of this.smokes) scene.remove(s.mesh);
    this.actors.length = 0; this.items.length = 0; this.dummies.length = 0; this.barriers.length = 0; this.projectiles.length = 0; this.grenades.length = 0; this.smokes.length = 0;
    this.plane.visible = false; this.view.storm.visible = false; this.view.stormNext.visible = false;
  }
  private async makeActor(name: string, isBot: boolean, isPlayer: boolean, survivor: string): Promise<Actor> {
    const char = new Character(survivor as Survivor); await char.load(); this.view.scene.add(char.root);
    const brain = isBot ? new BotBrain(this.rand, this.difficulty, this.nav) : undefined;
    const a: Actor = {
      id: nextId++, name: isBot ? brain!.name : name, isBot, isPlayer, alive: true, body: { x: 0, y: 0, z: 0, vy: 0, onGround: true, crouch: false }, yaw: 0, pitch: 0, hp: B.player.hp,
      armour: { vestLv: 0, vestDur: 0, helmetLv: 0 }, inv: new Inventory(), slot: 3, char, anim: defaultAnim(), mode: 'ground', fireCd: 0, reloadT: 0, reloadMax: 1, healT: 0, healItem: '', swingT: 0, kickT: 0, shots: 0, lastShot: -9, recoilPitch: 0,
      kills: 0, damage: 0, headshots: 0, tokensEarned: 0, hitFlash: 0, placement: 0, killer: '', diedAt: 0, hidden: false, lastHitBy: null, lastHitAt: -99, speedNow: 0, vx: 0, vz: 0, fireHeld: false, coyote: 0, jumpBuf: 0, fallStartY: 0, survivor, bot: brain,
    };
    if (isBot) { const names = this.actors.map((x) => x.name); while (names.filter((n) => n === a.name).length) a.name += 'x'; }
    void char.setWeapon('tide_machete'); if (this.effQuality === 'high') char.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.castShadow = true; }); this.actors.push(a); return a;
  }
  private async spawnGroundLoot() {
    let n = 0;
    for (const s of this.spawns) {
      if (this.mode === 'training') break;
      if (this.rand() > B.loot.tiers[s.tier].chance) continue;
      const it = rollItem(s.tier, this.rand); this.addGroundItem(s.x, s.y, s.z, [it], it.rarity, false); n++;
    }
    void n;
  }
  addGroundItem(x: number, y: number, z: number, items: Item[], rarity: Rarity, crate: boolean, model?: string): GroundItem {
    const g: GroundItem = { id: nextId++, x, y, z, items, rarity, mesh: new THREE.Group(), ring: null, crate, spin: this.rand() * 6, taken: false };
    g.mesh.position.set(x, y + 0.1, z); g.mesh.visible = false; (g.mesh as THREE.Object3D & { userData: { model: string; loaded?: boolean } }).userData = { model: model ?? itemModel(items[0]) };
    this.view.scene.add(g.mesh); this.items.push(g); return g;
  }
  private ensureItemVisual(g: GroundItem) {
    const ud = g.mesh.userData as { model: string; loaded?: boolean }; if (ud.loaded) return; ud.loaded = true; const gen = this.gen;
    cloneModel(ud.model).then((m) => {
      if (gen !== this.gen || g.taken) return; // match restarted or item picked up while the model was loading
      const s = g.items[0].kind === 'tokens' ? 0.35 : g.crate ? 1 : ['vest', 'helmet', 'backpack'].includes(g.items[0].kind) ? 1.2 : g.items[0].kind === 'weapon' ? 1.6 : 1.4; m.scale.setScalar(s); g.mesh.add(m);
      if (g.items[0].kind === 'weapon') m.rotation.z = Math.PI / 2 * 0; // weapons lie along +Z
      const ring = new THREE.Mesh(RING_GEO, ringMat(g.rarity)); ring.position.set(g.x, g.y + 0.06, g.z); this.view.scene.add(ring); g.ring = ring;
      if (g.crate && g.rarity === 3) cloneModel('legendary_beam').then((b) => { if (gen !== this.gen || g.taken) return; b.scale.set(0.3, 1, 0.3); b.position.set(g.x, g.y, g.z); this.view.scene.add(b); g.beam = b; });
    });
  }

  private beginTraining() {
    this.phase = 'playing'; const fort = POIS[4]; const p = this.player;
    this.placeActor(p, fort.x, fort.z + 27); p.mode = 'ground';
    // target dummies in rows
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = fort.x - 20 + c * 10, z = fort.z + 52 + r * 12, y = this.world.terrain.height(x, z);
      const d: Dummy = { id: nextId++, x, y, z, hp: 100, mesh: new THREE.Group(), reset: 0 }; d.mesh.position.set(x, y, z); d.mesh.rotation.y = Math.PI; cloneModel('target_dummy').then((m) => d.mesh.add(m)); this.view.scene.add(d.mesh); this.dummies.push(d);
    }
    // weapon rack: every weapon at every rarity
    let i = 0; for (const w of Object.keys(W).filter((k) => k !== 'tide_machete')) for (let r = 0; r < 4; r++) { const x = fort.x - 14 + i % 8 * 2.2, z = fort.z + 24 + Math.floor(i / 8) * 2.2; i++; this.addGroundItem(x, this.world.terrain.height(x, z), z, [{ kind: 'weapon', id: w, rarity: r as Rarity, qty: 1 }], r as Rarity, false); }
    const kit: Item[] = [{ kind: 'ammo', id: 'light', rarity: 0, qty: 90 }, { kind: 'ammo', id: 'heavy', rarity: 0, qty: 90 }, { kind: 'ammo', id: 'shells', rarity: 0, qty: 36 }, { kind: 'heal', id: 'medkit', rarity: 0, qty: 3 }, { kind: 'heal', id: 'bandage', rarity: 0, qty: 5 }, { kind: 'vest', id: 'vest_lv3', rarity: 2, qty: 1 }, { kind: 'helmet', id: 'helmet_lv3', rarity: 2, qty: 1 }, { kind: 'backpack', id: 'backpack_lv3', rarity: 2, qty: 1 }, { kind: 'throwable', id: 'frag_grenade', rarity: 0, qty: 3 }, { kind: 'throwable', id: 'smoke_can', rarity: 0, qty: 3 }, { kind: 'throwable', id: 'monsoon_barrier', rarity: 0, qty: 2 }, { kind: 'tokens', id: 'tokens', rarity: 0, qty: 200 }];
    kit.forEach((it, k) => { const x = fort.x + 6 + (k % 4) * 2, z = fort.z + 24 + Math.floor(k / 4) * 2; this.addGroundItem(x, this.world.terrain.height(x, z), z, [it], it.rarity, false); });
    for (const a of this.actors.filter((q) => q.isBot)) { const ang = this.rand() * 6.28; this.placeActor(a, fort.x + Math.cos(ang) * 60, fort.z + Math.sin(ang) * 60); a.mode = 'ground'; for (const it of [{ kind: 'weapon', id: 'monsoon_ar', rarity: 0, qty: 1 }, { kind: 'ammo', id: 'heavy', rarity: 0, qty: 90 }] as Item[]) this.give(a, it); }
    if (this.demo) this.setupDemo(); else this.showBanner('TRAINING: no zone, no flight. Try every weapon.');
    this.phase = 'playing';
  }
  private setupDemo() {
    const p = this.player, f = POIS[4]; this.demoStart = { x: p.body.x, z: p.body.z }; p.hp = 60;
    const near: Item[] = [{ kind: 'weapon', id: 'monsoon_ar', rarity: 0, qty: 1 }, { kind: 'ammo', id: 'heavy', rarity: 0, qty: 90 }, { kind: 'heal', id: 'bandage', rarity: 0, qty: 3 }];
    near.forEach((it, i) => { const x = f.x - 3 + i * 3, z = f.z + 33; this.addGroundItem(x, this.world.terrain.height(x, z), z, [it], it.rarity, false); });
    this.items = this.items.filter((g) => !(g.items[0].kind === 'weapon' && g.items[0].id !== 'monsoon_ar') || g.mesh.userData.model === 'monsoon_ar'); this.env.items = this.items;
  }
  private updateDemo() {
    const p = this.player, t = isTouchDevice();
    const steps = [
      t ? 'Drag the left side of the screen to walk.' : 'Walk with W A S D.',
      t ? 'Walk to the glowing items ahead and tap the pick-up prompt for the rifle, ammo and bandages.' : 'Walk to the glowing items ahead and press F to pick up the rifle, ammo and bandages.',
      t ? 'Aim at a target dummy and hold FIRE.' : 'Aim at a target dummy and click to fire.',
      t ? 'Tap RELOAD.' : 'Press R to reload.',
      t ? 'You are hurt. Tap the Heal button to use a bandage.' : 'You are hurt. Press H to use a bandage.',
    ];
    const done = [Math.hypot(p.body.x - this.demoStart.x, p.body.z - this.demoStart.z) > 6, !!p.inv.main[0] && p.inv.count('bandage') > 0, this.dummies.some((d) => d.hp < 100), this.demoFlags.reloaded, this.demoFlags.healed];
    while (this.demoStep < steps.length && done[this.demoStep]) { this.demoStep++; audio.play('pickup', { gain: 0.5 }); }
    if (this.demoStep >= steps.length && !(this as { demoDone?: boolean }).demoDone) { (this as { demoDone?: boolean }).demoDone = true; track('demo_complete'); }
    this.hud.demo = { step: this.demoStep, total: steps.length, text: this.demoStep >= steps.length ? 'Nice! You know the basics. Go back to the lobby and press PLAY for a real match.' : steps[this.demoStep] };
  }
  private placeActor(a: Actor, x: number, z: number) { a.body.x = x; a.body.z = z; a.body.y = this.world.terrain.height(x, z); a.body.vy = 0; a.body.onGround = true; }

  private beginFlight() {
    this.phase = 'flight'; const ang = this.rand() * Math.PI * 2, off = (this.rand() * 2 - 1) * 120; const dir = V(Math.cos(ang), 0, Math.sin(ang)); const perp = V(-dir.z, 0, dir.x);
    this.planeDir.copy(dir); const len = 760; this.planeStart.copy(perp).multiplyScalar(off).addScaledVector(dir, -len / 2); this.planeStart.y = B.match.flightAltitude; this.planeSpeed = len / B.match.flightSeconds;
    for (const a of this.actors) { a.mode = 'plane'; a.body.onGround = false; if (a.bot) a.bot.jumpAt = 5 + this.rand() * 22; }
    this.plane.visible = true; this.syncPlane(0); this.showBanner('Fly over the island. Jump when you are ready!');
  }
  private syncPlane(t: number) { this.plane.position.copy(this.planeStart).addScaledVector(this.planeDir, this.planeSpeed * t); this.plane.rotation.y = Math.atan2(this.planeDir.x, this.planeDir.z); }
  private leavePlane(a: Actor) {
    a.mode = 'skydive'; if (a.isPlayer) a.pitch = -0.85; a.body.x = this.plane.position.x; a.body.z = this.plane.position.z; a.body.y = B.match.flightAltitude - 4; a.body.vy = 0; a.fallStartY = a.body.y; a.yaw = Math.atan2(this.planeDir.x, this.planeDir.z); if (a.isPlayer) audio.play('whoosh');
  }

  // ------------------------------------------------------------------ main loop
  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop); const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016); this.last = now;
    this.fpsAcc += dt; this.fpsN++; if (this.fpsAcc > 1) { this.fps = this.fpsN / this.fpsAcc; this.fpsAcc = 0; this.fpsN = 0; this.adaptResolution(); }
    pollInput(); if (!this.paused && this.phase !== 'menu') this.update(dt);
    // in the lobby the picture is drawn by HTML on top, so the 3D view is not rendered at all (saves battery)
    if (this.phase !== 'menu') { this.updateEffects(dt); this.render(dt); } clearLook();
    this.hudT += dt; if (this.hudT > 0.1) { this.hudT = 0; if (this.demo && this.phase === 'playing') this.updateDemo(); else this.hud.demo = null; this.snapshot(); this.onChange(); }
  };
  setPaused(p: boolean) { this.paused = p; if (p) exitPointerLock(); }
  private adaptResolution() {
    if (settings.quality !== 'auto') { this.dynRes = 1; return; }
    if (this.fps < 28 && this.dynRes > 0.6) { this.dynRes -= 0.1; this.applyResolution(); } else if (this.fps > 52 && this.dynRes < 1) { this.dynRes = Math.min(1, this.dynRes + 0.05); this.applyResolution(); }
  }
  private menuT = 0;
  private menuCamera(dt: number) { this.menuT += dt * 0.05; const r = 330; this.camera.position.set(Math.cos(this.menuT) * r, 130, Math.sin(this.menuT) * r); this.camera.lookAt(0, 0, 0); this.view?.update(this.camera.position, this.time, true); this.time += dt; }
  private render(dt: number) {
    if (!this.view) return; void dt;
    if (this.phase !== 'menu') this.updateCamera(dt);
    this.renderer.render(this.view.scene, this.camera);
  }

  private update(dt: number) {
    this.time += dt; this.env.time = this.time; const p = this.player;
    // ---- phase machine
    if (this.phase === 'flight') {
      this.flightT += dt; this.syncPlane(this.flightT);
      if (p.mode === 'plane' && (input.jump || input.interact || this.flightT >= B.match.flightSeconds)) { this.leavePlane(p); }
      if (this.flightT >= B.match.flightSeconds) { for (const a of this.actors) if (a.mode === 'plane') this.leavePlane(a); this.plane.visible = false; }
      if (this.flightT > 2 && this.actors.every((a) => a.mode !== 'plane') && this.flightT >= 2) { this.plane.visible = this.flightT < B.match.flightSeconds; }
      if (this.actors.every((a) => !a.alive || a.mode === 'ground')) { this.phase = 'playing'; }
      if (this.flightT > 0 && this.actors.every((a) => a.mode !== 'plane') && this.phase === 'flight' && this.flightT > 3) { this.matchT += dt; this.updateZone(dt); }
    } else if (this.phase === 'playing') { if (this.mode === 'solo') { this.matchT += dt; this.updateZone(dt); } }
    if (this.phase === 'ended') { this.endT += dt; }

    // ---- actors
    this.botT += dt; const botTick = this.botT >= 0.1; const botDt = this.botT; if (botTick) this.botT = 0;
    for (const a of this.actors) {
      if (!a.alive) { a.char.update(dt, { ...a.anim, dead: a.anim.dead || 1 }); continue; }
      let cmd: Cmd;
      if (a.isPlayer) cmd = this.playerCmd(a, dt);
      else { const br = a.bot!; if (botTick || !br.lastCmd) br.lastCmd = br.think(a, this.env, Math.max(botDt, 0.05)); cmd = botTick ? br.lastCmd : this.carryCmd(a, br.lastCmd); }
      void botDt; (a as Actor & { lastCmd?: Cmd }).lastCmd = cmd; this.applyCmd(a, cmd, dt);
    }
    this.updateProjectiles(dt); this.updateGrenades(dt); this.updateBarriers(dt); this.updateDummies(dt);
    this.bushT += dt; if (this.bushT > 0.3) { this.bushT = 0; for (const a of this.actors) a.hidden = a.alive && a.body.crouch && this.bushes.some((b) => Math.abs(b.x - a.body.x) < 1.4 && Math.abs(b.z - a.body.z) < 1.4); }
    this.lootT += dt; if (this.lootT > 0.25) { this.lootT = 0; this.updateLootVisibility(); }
    // ---- win / end checks
    if (this.mode === 'solo' && this.phase === 'playing') {
      const alive = this.actors.filter((a) => a.alive);
      if (alive.length <= 1 && this.matchT > 5) this.finish(alive[0] ?? null);
      if (!p.alive && this.endT === 0) { this.endT = 0.001; setTimeout(() => this.finish(null), 2200); }
    }
    for (const f of this.feed) f.t -= dt; this.feed = this.feed.filter((f) => f.t > 0);
    this.dropT = Math.max(0, this.dropT - dt); this.hitT = Math.max(0, this.hitT - dt); this.elimT = Math.max(0, this.elimT - dt); this.shake = Math.max(0, this.shake - dt * 4); this.bannerT = Math.max(0, this.bannerT - dt); this.chatT = Math.max(0, this.chatT - dt);
    this.numbers = this.numbers.filter((n) => (n.y -= dt * 40) > -120); this.dmgArcs = this.dmgArcs.filter((d) => (d.t -= dt) > 0); { const keep = this.shotsHeard.filter((s) => (s.t -= dt) > 0); this.shotsHeard.length = 0; this.shotsHeard.push(...keep); }
    audio.setTension(!!this.zone && this.zone.stage !== 'done' && this.zone.timeLeft < 20);
    if (this.zone && this.zone.phase >= 5 && this.mode === 'solo') audio.startMusic('final');
  }
  private carryCmd(a: Actor, c: Cmd): Cmd { return { ...c, jump: false, fire: c.fire, reload: false, heal: false, barrier: false, interact: null, slot: -1, leavePlane: c.leavePlane }; }

  private updateZone(dt: number) {
    const z = zoneAt(this.zonePlan, this.matchT); this.zone = z; this.env.zone = z;
    this.view.setZone(z.cx, z.cz, z.radius, z.nextCx, z.nextCz, z.nextRadius);
    if (z.phase !== this.lastPhase) {
      this.lastPhase = z.phase; this.showBanner(`STORM CLOSING: phase ${z.phase}`); audio.play('siren');
      if ((B.zone.crateAtPhases as number[]).includes(z.phase)) this.dropSupplyCrate(z);
    }
    for (const a of this.actors) if (a.alive && a.mode === 'ground') { const d = zoneDamage(z, a.body.x, a.body.z); if (d > 0) this.hurt(a, null, d * dt, false, 'the Monsoon Wall', true); }
  }
  private dropSupplyCrate(z: ZoneState) {
    const ang = this.rand() * 6.28, d = Math.sqrt(this.rand()) * z.nextRadius * 0.8, x = z.nextCx + Math.cos(ang) * d, zz = z.nextCz + Math.sin(ang) * d; if (coastDist(x, zz) < 6) return;
    const y = this.world.terrain.height(x, zz); const g = this.addGroundItem(x, y + 120, zz, crateContents(this.rand), 3, true, 'supply_crate_parachute'); g.mesh.userData.drop = { t: B.zone.crateFall, y0: y + 120, y };
    cloneModel('signal_flare').then((f) => { f.position.set(x, y, zz); this.view.scene.add(f); });
    this.showBanner('SUPPLY DROP incoming!'); this.addFeed('A supply crate is parachuting in.', false);
  }

  // ------------------------------------------------------------------ commands
  private playerCmd(a: Actor, dt: number): Cmd {
    const cmd: Cmd = { dx: 0, dz: 0, sprint: input.sprint, crouch: input.crouch, jump: input.jump, yaw: a.yaw, pitch: a.pitch, fire: input.fire, reload: input.reload, heal: input.heal, barrier: input.barrier, slot: input.slot, interact: null, leavePlane: false };
    if (this.kioskOpen || this.inventoryOpen && false) { cmd.fire = false; }
    const sens = 0.0022 * settings.sensitivity * (input.aim ? this.camera.fov / 70 : 1);
    let ax = 1; if (touch.look.id >= 0 && settings.aimAssist && this.overTarget()) ax = 0.55;
    a.yaw -= input.lookDX * sens * ax; a.pitch = Math.max(-1.35, Math.min(1.35, a.pitch - input.lookDY * sens * ax));
    a.pitch = Math.max(-1.35, Math.min(1.35, a.pitch + a.recoilPitch)); a.recoilPitch = 0; cmd.yaw = a.yaw; cmd.pitch = a.pitch;
    const f = V(Math.sin(a.yaw), 0, Math.cos(a.yaw)), r = V(-Math.cos(a.yaw), 0, Math.sin(a.yaw));
    cmd.dx = f.x * input.moveY + r.x * input.moveX; cmd.dz = f.z * input.moveY + r.z * input.moveX;
    if (input.map) { this.mapOpen = !this.mapOpen; } if (input.inventory) this.inventoryOpen = !this.inventoryOpen;
    if (input.marker && this.mapOpen === false) { const hit = this.aimPoint(a, 500); this.setMarker(hit.x, hit.z); }
    if (input.interact) { const g = this.nearestItem(a); const k = this.nearestKiosk(a); if (k && (!g || Math.hypot(k.x - a.body.x, k.z - a.body.z) < Math.hypot(g.x - a.body.x, g.z - a.body.z))) { this.kioskOpen = !this.kioskOpen; } else if (g) cmd.interact = g; }
    // optional auto-pickup of ammo, healing, gadgets and tokens (never weapons or armour)
    this.autoPickT -= dt;
    if (settings.autoPickup && !cmd.interact && this.autoPickT <= 0 && a.alive) { const g = this.nearestItem(a); if (g && Math.hypot(g.x - a.body.x, g.z - a.body.z) < 1.8 && g.items.every((it) => ['ammo', 'heal', 'throwable', 'tokens'].includes(it.kind))) { cmd.interact = g; this.autoPickT = 0.5; } }
    if (this.kioskOpen && !this.nearestKiosk(a)) this.kioskOpen = false; void dt; return cmd;
  }
  private overTarget() { return this.actors.some((o) => o !== this.player && o.alive && this.angleTo(this.player, o) < 0.06) || this.dummies.some((d) => Math.abs(Math.atan2(d.x - this.player.body.x, d.z - this.player.body.z) - this.player.yaw) < 0.06); }
  private angleTo(a: Actor, o: Actor) { let d = Math.atan2(o.body.x - a.body.x, o.body.z - a.body.z) - a.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); return Math.abs(d); }

  gun(a: Actor): { id: WeaponId; rarity: Rarity; mag: number } | null {
    if (a.slot === 3) return { id: 'tide_machete', rarity: 0, mag: 0 }; if (a.slot === 2) return a.inv.pistol; return a.inv.main[a.slot] ?? null;
  }
  private scoped() { const g = this.gun(this.player); return !!g && input.aim && W[g.id].scope > 0; }

  private applyCmd(a: Actor, c: Cmd, dt: number) {
    a.fireCd = Math.max(0, a.fireCd - dt); a.kickT = Math.max(0, a.kickT - dt * 5); a.hitFlash = Math.max(0, a.hitFlash - dt * 4); a.swingT = Math.max(0, a.swingT - dt); if (a.anim.throwT > 0) a.anim.throwT = Math.max(0, a.anim.throwT - dt * 2.5);
    if (!a.isPlayer) { a.yaw = c.yaw; a.pitch = c.pitch; }
    const an = a.anim; an.hit = Math.max(0, an.hit - dt * 5); an.swap = Math.max(0, an.swap - dt * 4); an.kick = a.kickT; an.fallLanded = 0;
    // ---- air phases
    if (a.mode === 'plane') {
      a.body.x = this.plane.position.x; a.body.z = this.plane.position.z; a.body.y = this.plane.position.y; a.char.root.visible = false; if (c.leavePlane) this.leavePlane(a); return;
    }
    a.char.root.visible = true;
    if (a.mode === 'skydive' || a.mode === 'glide') {
      const gnd = this.colliders.surfaceBelow(a.body.x, a.body.z, a.body.y + 5) ?? this.world.terrain.height(a.body.x, a.body.z), alt = a.body.y - gnd;
      const hs = a.mode === 'skydive' ? 24 : B.match.glideForward; const steerX = a.isPlayer ? input.moveX : 0; const fwd = a.isPlayer ? Math.max(0.35, input.moveY * 0.5 + 0.5) : 1;
      let dx: number, dz: number;
      if (a.isPlayer) { dx = Math.sin(a.yaw) * fwd * hs - Math.cos(a.yaw) * steerX * hs * 0.6; dz = Math.cos(a.yaw) * fwd * hs + Math.sin(a.yaw) * steerX * hs * 0.6; } else { dx = c.dx * hs; dz = c.dz * hs; a.yaw = Math.atan2(c.dx, c.dz) || a.yaw; }
      a.body.x += dx * dt; a.body.z += dz * dt; a.body.y -= (a.mode === 'skydive' ? B.match.skydiveSpeed : B.match.glideDown) * dt;
      const lim = HALF + B.match.softWallMeters; a.body.x = Math.max(-lim, Math.min(lim, a.body.x)); a.body.z = Math.max(-lim, Math.min(lim, a.body.z));
      if (a.mode === 'skydive' && alt <= B.match.gliderOpenAltitude) { a.mode = 'glide'; void a.char.setWing(true); }
      if (a.body.y <= gnd + 0.2) { a.body.y = gnd; a.mode = 'ground'; a.body.onGround = true; a.body.vy = 0; void a.char.setWing(false); if (this.phase === 'flight') { /* landed */ } if (a.isPlayer) { this.showBanner('Landed. Find a weapon!'); } }
      an.mode = a.mode === 'skydive' ? 'skydive' : 'glide'; an.speed = 0; this.poseActor(a, dt); return;
    }
    // ---- ground
    an.mode = 'ground';
    const gun = this.gun(a); const wd = gun ? W[gun.id] : null;
    if (c.slot >= 0 && c.slot !== a.slot && c.slot <= 3 && !a.reloadT) this.equip(a, c.slot);
    const healing = a.healT > 0; let speed = c.crouch ? B.player.crouch : c.sprint ? B.player.sprint : B.player.walk; if (healing) speed *= B.player.healSlow;
    const mag = Math.hypot(c.dx, c.dz); const ndx = mag > 0.01 ? c.dx / Math.max(1, mag) : 0, ndz = mag > 0.01 ? c.dz / Math.max(1, mag) : 0;
    speed *= Math.min(1, mag || 0) * 1; if (!a.isPlayer) speed = (c.crouch ? B.player.crouch : c.sprint ? B.player.sprint : B.player.walk) * Math.min(1, mag) * (healing ? 0.5 : 1);
    if (this.perks() && a.survivor === 'survivor_kiran' && c.sprint) speed *= 1.08;
    const prevY = a.body.y, wasGround = a.body.onGround;
    // smooth acceleration, coyote time and jump buffering for a better feel
    const tvx = ndx * speed, tvz = ndz * speed; const acc = (a.body.onGround ? (Math.hypot(tvx, tvz) > 0.1 ? 38 : 55) : 8) * dt; const dvx = tvx - a.vx, dvz = tvz - a.vz, dl = Math.hypot(dvx, dvz);
    if (dl <= acc) { a.vx = tvx; a.vz = tvz; } else { a.vx += (dvx / dl) * acc; a.vz += (dvz / dl) * acc; }
    const vm = Math.hypot(a.vx, a.vz); a.coyote = a.body.onGround ? 0.1 : a.coyote - dt; if (c.jump) a.jumpBuf = 0.12; else a.jumpBuf -= dt;
    const wantJump = a.jumpBuf > 0 && (a.body.onGround || a.coyote > 0); if (wantJump) { a.jumpBuf = 0; a.coyote = 0; }
    const res = stepBody(this.colliders, a.body, { dx: vm > 0.01 ? a.vx / vm : 0, dz: vm > 0.01 ? a.vz / vm : 0, speed: vm, jump: wantJump, crouch: c.crouch, coyote: a.coyote > 0 }, dt);
    if (wasGround && !a.body.onGround && a.body.vy <= 0) a.fallStartY = prevY; if (!a.body.onGround && wasGround && a.body.vy > 0) a.fallStartY = a.body.y;
    if (res.landedFall > 0) { const fallM = Math.max(0, a.fallStartY - a.body.y); const dmg = fallDamage(fallM); if (dmg > 0) this.hurt(a, null, dmg, false, 'a fall', true); an.fallLanded = fallM; if (a.isPlayer && fallM > 3) this.shake = 0.4; }
    a.speedNow = Math.hypot(a.body.x - (a.char.root.position.x), a.body.z - (a.char.root.position.z)) / Math.max(dt, 1e-3);
    if (a.body.y < -6) this.hurt(a, null, 999, false, 'the sea', true);
    this.footT += dt * 0; if (a.isPlayer && a.body.onGround && a.speedNow > 2.5) { this.footT -= dt; if (this.footT < 0) { this.footT = c.sprint ? 0.27 : 0.4; audio.play('steps', { gain: 0.3 }); } }
    // ---- weapon actions
    const swap = c.slot >= 0; void swap;
    if (a.reloadT > 0) { a.reloadT -= dt; if (c.fire && wd?.reloadPerShell && gun && gun.mag > 0) { a.reloadT = 0; } if (a.reloadT <= 0) this.finishReload(a); }
    if (c.reload && gun && wd && !a.reloadT && !healing) this.startReload(a);
    if (wd && gun && a.slot !== 3 && gun.mag === 0 && c.fire && !a.reloadT && a.fireCd <= 0) this.startReload(a);
    if (c.heal) this.startHeal(a);
    if (a.healT > 0) { if (c.fire && a.slot !== 3 || !a.alive) { a.healT = 0; } else { a.healT -= dt; if (a.healT <= 0) this.finishHeal(a); } }
    if (c.fire && !healing && !a.reloadT && !this.placing && !(a.isPlayer && (this.kioskOpen))) this.tryFire(a, c);
    else if (!c.fire) { if (a.isPlayer || true) a.shots = Math.max(0, a.shots - dt * 6); }
    if (c.barrier) this.toggleBarrier(a, c);
    if (a.isPlayer && input.grenade) this.throwGrenade(a, false); if (a.isPlayer && input.heal === false && false) void 0;
    if (!a.isPlayer && c.interact) this.pickup(a, c.interact);
    if (a.isPlayer && c.interact) this.pickup(a, c.interact);
    if (a.isPlayer && this.placing && c.fire) this.placeBarrier(a);
    // bots throw grenades at engaged targets sometimes
    if (a.bot && a.bot.state === 'engage' && a.inv.count('frag_grenade') > 0 && Math.random() < dt * 0.05 && a.bot.target) this.throwGrenade(a, false);
    // ---- animation state
    a.fireHeld = c.fire; an.pitch = a.pitch; an.speed = a.body.onGround ? Math.min(7, vm) : 0; an.crouch = c.crouch; an.onGround = a.body.onGround; an.vy = a.body.vy; an.armed = !!gun && a.slot !== 3; an.melee = a.slot === 3; an.aiming = (a.isPlayer ? input.aim : c.fire) && an.armed;
    an.reload = a.reloadT > 0; an.heal = a.healT > 0; an.dead = 0; this.poseActor(a, dt);
  }
  private perks() { return B.perksEnabled; }
  private poseActor(a: Actor, dt: number) {
    const r = a.char.root; r.position.set(a.body.x, a.body.y, a.body.z); r.rotation.y = a.yaw;
    const far = !a.isPlayer && Math.hypot(a.body.x - this.player.body.x, a.body.z - this.player.body.z) > 60;
    r.visible = a.mode !== 'plane' && (a.isPlayer || Math.hypot(a.body.x - this.camera.position.x, a.body.z - this.camera.position.z) < 150) && !(a.hidden && !a.isPlayer && Math.hypot(a.body.x - this.player.body.x, a.body.z - this.player.body.z) > B.player.bushHideRange);
    if (a.mode === 'skydive' || a.mode === 'glide') { r.rotation.x = 0; }
    const g = this.gun(a); void a.char.setWeapon(a.mode === 'ground' && g ? g.id : null);
    a.char.setFar(far && a.alive); a.char.update(dt, a.anim, far);
  }

  // ------------------------------------------------------------------ weapons
  equip(a: Actor, slot: number) {
    if (slot === a.slot) return; const g = slot === 3 ? true : slot === 2 ? a.inv.pistol : a.inv.main[slot]; if (!g) return; a.slot = slot; a.reloadT = 0; a.anim.swap = 1; if (a.isPlayer) audio.play('tap', { bus: 'ui', gain: 0.5 });
  }
  private startReload(a: Actor) {
    const g = this.gun(a); if (!g || a.slot === 3) return; const wd = W[g.id]; if (g.mag >= wd.mag || a.inv.count(wd.ammo as string) <= 0) return;
    a.reloadMax = wd.reload * (this.perks() && 0 ? 1 : 1); a.reloadT = a.reloadMax; if (a.isPlayer) audio.play('reload');
  }
  private finishReload(a: Actor) {
    const g = this.gun(a); if (!g) return; const wd = W[g.id]; const have = a.inv.count(wd.ammo as string);
    if (a.isPlayer) this.demoFlags.reloaded = true;
    if (wd.reloadPerShell) { if (have > 0 && g.mag < wd.mag) { a.inv.take(wd.ammo as string, 1); g.mag++; if (g.mag < wd.mag && a.inv.count(wd.ammo as string) > 0) { a.reloadT = wd.reload; } } return; }
    const need = Math.min(wd.mag - g.mag, have); if (need > 0) { a.inv.take(wd.ammo as string, need); g.mag += need; }
  }
  /** World position of the gun barrel tip, for flashes and tracers. */
  private tip(a: Actor, fallback: THREE.Vector3): THREE.Vector3 { const w = a.char.weapon; if (!w) return fallback; const len = MODEL_INFO.get(a.char.weaponName)?.size_m_xyz[2] ?? 0.5; w.updateWorldMatrix(true, false); return w.localToWorld(V(0, 0.08, len)); }
  private muzzle(a: Actor): THREE.Vector3 { return V(a.body.x + Math.sin(a.yaw) * 0.6 - Math.cos(a.yaw) * 0.3, a.body.y + (a.body.crouch ? 1.0 : 1.45), a.body.z + Math.cos(a.yaw) * 0.6 + Math.sin(a.yaw) * 0.3); }
  eye(a: Actor): THREE.Vector3 { return V(a.body.x, a.body.y + (a.body.crouch ? 1.1 : 1.6), a.body.z); }
  private aimDir(a: Actor): THREE.Vector3 { return V(Math.sin(a.yaw) * Math.cos(a.pitch), Math.sin(a.pitch), Math.cos(a.yaw) * Math.cos(a.pitch)); }
  /** Point the crosshair is on (for third-person aiming). */
  private aimPoint(a: Actor, max: number): THREE.Vector3 {
    const o = a.isPlayer ? this.camera.position.clone() : this.eye(a); const d = a.isPlayer ? this.camDir() : this.aimDir(a);
    const t = this.trace(o, d, max, a, true).t; return o.addScaledVector(d, t);
  }
  /** Places the map marker. Near a location that has art, a 640x360 card shows at the top centre for 3 s. */
  setMarker(x: number, z: number) {
    this.marker = { x, z }; audio.play('tap', { bus: 'ui', gain: 0.6 });
    const ART: Record<string, string> = { 'Salt Docks': 'salt_docks', 'Radar Ridge': 'radar_ridge_outpost', 'Rail Yard': 'harbour_road' };
    const near = POIS.map((p) => ({ p, d: Math.hypot(p.x - x, p.z - z) })).filter((q) => q.d < 70 && ART[q.p.name]).sort((a, b) => a.d - b.d)[0];
    if (near) { this.dropCard = { id: ++this.dropSeq, key: ART[near.p.name], name: near.p.name }; this.dropT = 3; }
  }
  /** Distance along a ray to the first tree canopy (sphere), ignoring a canopy the origin is already inside. */
  private canopyHit(o: THREE.Vector3, d: THREE.Vector3, maxT: number): number {
    let best = maxT; const seen = new Set<number>();
    for (let t = 0; t <= maxT + 5; t += 5) {
      const x = o.x + d.x * Math.min(t, maxT), z = o.z + d.z * Math.min(t, maxT);
      for (let cx = Math.floor((x - 4) / 10); cx <= Math.floor((x + 4) / 10); cx++) for (let cz = Math.floor((z - 4) / 10); cz <= Math.floor((z + 4) / 10); cz++) {
        const l = this.canopyCells.get(cx * 4096 + cz); if (!l) continue;
        for (const i of l) {
          if (seen.has(i)) continue; seen.add(i); const c = this.canopies[i], ox = o.x - c.x, oy = o.y - c.y, oz = o.z - c.z, cc = ox * ox + oy * oy + oz * oz - c.r * c.r; if (cc < 0) continue;
          const b = ox * d.x + oy * d.y + oz * d.z, disc = b * b - cc; if (disc < 0) continue; const tt = -b - Math.sqrt(disc); if (tt > 0 && tt < best) best = tt;
        }
      }
    }
    return best;
  }
  private camDir() { const d = V(); this.camera.getWorldDirection(d); return d; }

  private tryFire(a: Actor, c: Cmd) {
    const g = this.gun(a); if (!g) return; const wd = W[g.id]; if (a.fireCd > 0) return;
    if (a.slot === 3) return this.swing(a);
    if (g.mag <= 0) return; if (!wd.auto && a.isPlayer && a.fireHeld) return; if (!wd.auto && !a.isPlayer && a.fireCd > 0) return;
    a.fireCd = fireInterval(g.id); g.mag--; a.shots++; a.lastShot = this.time; a.kickT = 1; if (a.isPlayer) a.anim.kick = 1; a.reloadT = 0;
    const origin = a.isPlayer ? this.muzzle(a) : this.muzzle(a); let dir: THREE.Vector3;
    if (a.isPlayer) { const ap = this.aimPoint(a, 400); dir = ap.sub(origin).normalize(); } else dir = this.aimDir(a);
    const moving = a.speedNow > 1; let spread = wd.spread * (moving ? 1.8 : 1) * ((a.isPlayer ? input.aim : false) ? 0.55 : 1) * (a.body.crouch ? 0.7 : 1) * (a.body.onGround ? 1 : 2.5) + Math.min(a.shots, 10) * 0.0012;
    if (this.scoped() && a.isPlayer) spread *= 0.5; const pellets = wd.pellets;
    const snd: SoundId = wd.class === 'pistol' ? 'pistol' : wd.class === 'smg' ? 'smg' : wd.class === 'shotgun' ? 'shotgun' : wd.class === 'sniper' ? 'sniper' : wd.class === 'marksman' ? 'dmr' : 'rifle';
    if (a.isPlayer) audio.play(snd); else audio.playAt(snd, a.body.x - this.player.body.x, a.body.z - this.player.body.z, this.player.yaw, 120, true);
    this.shotsHeard.push({ x: a.body.x, z: a.body.z, t: 2, id: a.id }); this.flash(this.tip(a, origin));
    if (a.isPlayer) { const idx = a.shots; a.recoilPitch += wd.recoil * (0.7 + Math.min(idx, 8) * 0.04); a.yaw += Math.sin(idx * 1.7) * wd.recoil * 0.5 + (Math.random() - 0.5) * wd.recoil * 0.3; if (wd.class === 'sniper' || wd.class === 'marksman') this.shake = 0.3; }
    for (let i = 0; i < pellets; i++) {
      const d = dir.clone(); d.x += (Math.random() - 0.5) * 2 * spread; d.y += (Math.random() - 0.5) * 2 * spread; d.z += (Math.random() - 0.5) * 2 * spread; d.normalize();
      if (wd.projectileSpeed) this.spawnProjectile(a, g, origin, d, wd);
      else this.hitscan(a, g, origin, d, wd, a.shots % 3 === 0 && i === 0);
    }
    void c;
  }
  private swing(a: Actor) {
    a.fireCd = W.tide_machete.swing as number; a.kickT = 1; a.anim.kick = 1; if (a.isPlayer) audio.play('machete');
    const f = V(Math.sin(a.yaw), 0, Math.cos(a.yaw)); const o = this.eye(a);
    for (const t of this.targets(a)) {
      const dx = t.x - a.body.x, dz = t.z - a.body.z, dist = Math.hypot(dx, dz); if (dist > 2.4 || (dx * f.x + dz * f.z) / (dist || 1) < 0.4) continue;
      if (t.actor) { this.hurt(t.actor, a, baseDamage('tide_machete', 0, dist, false), false, 'Tide Machete'); if (a.isPlayer) audio.play('machete_hit'); } else if (t.dummy) this.hitDummy(t.dummy, baseDamage('tide_machete', 0, dist, false), false);
    }
    void o;
  }
  private targets(shooter: Actor) {
    const out: { x: number; y: number; z: number; actor?: Actor; dummy?: Dummy; crouch: boolean }[] = [];
    for (const o of this.actors) if (o !== shooter && o.alive && o.mode === 'ground') out.push({ x: o.body.x, y: o.body.y, z: o.body.z, actor: o, crouch: o.body.crouch });
    for (const d of this.dummies) if (d.hp > 0) out.push({ x: d.x, y: d.y, z: d.z, dummy: d, crouch: false });
    return out;
  }
  /** Closest hit along a ray: actors (head sphere + body box), dummies, world boxes (including barriers) and terrain. */
  trace(o: THREE.Vector3, d: THREE.Vector3, max: number, shooter: Actor | null, worldOnly = false): { t: number; actor?: Actor; dummy?: Dummy; head?: boolean; barrier?: BarrierObj } {
    let best = Math.min(max, this.colliders.raycast(o.x, o.y, o.z, d.x, d.y, d.z, max)); let res: ReturnType<Game['trace']> = { t: best };
    for (const b of this.barriers) { const t = rayBox(o.x, o.y, o.z, d.x, d.y, d.z, b.box); if (t < best) { best = t; res = { t, barrier: b }; } }
    for (const sm of this.smokes) void sm;
    if (worldOnly) return res;
    for (const t of this.targets(shooter ?? ({} as Actor))) {
      const h = t.crouch ? 1.2 : 1.8; const headY = t.y + (t.crouch ? 1.05 : 1.62), headR = 0.3;
      const hx = t.x - o.x, hy = headY - o.y, hz = t.z - o.z; const proj = hx * d.x + hy * d.y + hz * d.z;
      if (proj > 0) { const cx = o.x + d.x * proj - t.x, cy = o.y + d.y * proj - headY, cz = o.z + d.z * proj - t.z; if (Math.hypot(cx, cy, cz) < headR && proj < best) { best = proj; res = { t: proj, actor: t.actor, dummy: t.dummy, head: true }; continue; } }
      const tb = rayBox(o.x, o.y, o.z, d.x, d.y, d.z, { x0: t.x - 0.45, x1: t.x + 0.45, z0: t.z - 0.4, z1: t.z + 0.4, y0: t.y, y1: t.y + h - 0.2 }); if (tb < best) { best = tb; res = { t: tb, actor: t.actor, dummy: t.dummy, head: false }; }
    }
    return res;
  }
  private hitscan(a: Actor, g: GunSlot, o: THREE.Vector3, d: THREE.Vector3, wd: (typeof W)[string], tracer: boolean) {
    const range = wd.range * 2; const h = this.trace(o, d, range, a); const end = o.clone().addScaledVector(d, h.t);
    if (tracer) this.tracerLine(this.tip(a, o), end);
    this.resolveHit(a, g.id, g.rarity, h, o, d, end);
  }
  private resolveHit(a: Actor, w: WeaponId, rarity: Rarity, h: ReturnType<Game['trace']>, o: THREE.Vector3, d: THREE.Vector3, end: THREE.Vector3) {
    if (h.actor) this.hurt(h.actor, a, baseDamage(w, rarity, h.t, !!h.head), !!h.head, W[w].label);
    else if (h.dummy) this.hitDummy(h.dummy, baseDamage(w, rarity, h.t, !!h.head), !!h.head);
    else if (h.barrier) { h.barrier.state.hit(baseDamage(w, rarity, h.t, false)); this.puff(end, 0xa78bfa); } else if (h.t < 2000) this.puff(end, end.y < this.world.terrain.height(end.x, end.z) + 0.3 ? (coastDist(end.x, end.z) < 0 || inRiver(end.x, end.z) ? 0x9fd3ff : 0xc9b38a) : 0xffe08a);
    if (a.isPlayer && (h.actor || h.dummy)) { this.hitT = 0.25; this.hitHead = !!h.head; audio.play(h.head ? 'head' : 'hit', { bus: 'ui' }); }
    void o; void d;
  }
  private spawnProjectile(a: Actor, g: GunSlot, o: THREE.Vector3, d: THREE.Vector3, wd: (typeof W)[string]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.4), new THREE.MeshBasicMaterial({ color: 0xfff1b8 })); m.position.copy(o); m.lookAt(o.clone().add(d)); this.view.scene.add(m);
    this.projectiles.push({ pos: o.clone(), vel: d.clone().multiplyScalar(wd.projectileSpeed!), owner: a, weapon: g.id, rarity: g.rarity, life: 2.2, mesh: m });
  }
  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      p.life -= dt; const wd = W[p.weapon]; p.vel.y -= (wd.drop ?? 4) * dt; const step = p.vel.clone().multiplyScalar(dt), len = step.length(), dir = step.clone().normalize();
      const h = this.trace(p.pos, dir, len, p.owner); p.mesh.position.copy(p.pos); p.mesh.lookAt(p.pos.clone().add(dir));
      if (h.t < len - 1e-4 && (h.actor || h.dummy || h.barrier || true) && h.t < len) { const end = p.pos.clone().addScaledVector(dir, h.t); const dist = p.owner.body ? Math.hypot(end.x - p.owner.body.x, end.z - p.owner.body.z) : 0; this.resolveHit(p.owner, p.weapon, p.rarity, { ...h, t: dist }, p.pos, dir, end); p.life = 0; }
      else p.pos.add(step);
    }
    for (const p of this.projectiles) if (p.life <= 0) this.view.scene.remove(p.mesh); this.projectiles = this.projectiles.filter((p) => p.life > 0);
  }

  // ------------------------------------------------------------------ damage, kills
  hurt(v: Actor, by: Actor | null, raw: number, head: boolean, source: string, ignoreArmour = false) {
    if (!v.alive || v.mode !== 'ground' && v.mode !== 'plane' && false) return; if (this.phase === 'ended') return;
    let hp = raw; if (!ignoreArmour) { const r = applyArmour(raw, head, v.armour); hp = r.hp; v.armour.vestDur = Math.max(0, v.armour.vestDur - r.vestDamage); if (v.armour.vestDur <= 0) v.armour.vestLv = v.armour.vestDur > 0 ? v.armour.vestLv : v.armour.vestLv; }
    v.hp -= hp; v.hitFlash = 1; v.anim.hit = 1; v.char.flash(0.12); if (by && by !== v) { v.lastHitBy = by; v.lastHitAt = this.time; } if (by && by !== v) { by.damage += hp; if (head) by.headshots++; }
    if (v.isPlayer && by) { const a = Math.atan2(by.body.x - v.body.x, by.body.z - v.body.z) - v.yaw; this.dmgArcs.push({ a, t: 1.2 }); this.shake = Math.max(this.shake, 0.25); }
    if (by?.isPlayer && by !== v) { this.numbers.push({ id: nextId++, x: 0, y: 0, v: Math.round(hp), head }); this.numberPos(v.body.x, v.body.y + 2, v.body.z); }
    if (v.healT > 0 && !ignoreArmour) v.healT = 0; if (v.hp <= 0) this.kill(v, by, source);
  }
  private numberPos(x: number, y: number, z: number) { const n = this.numbers[this.numbers.length - 1]; const p = V(x, y, z).project(this.camera); n.x = (p.x * 0.5 + 0.5) * innerWidth; n.y = (-p.y * 0.5 + 0.5) * innerHeight; }
  private hitDummy(d: Dummy, dmg: number, head: boolean) {
    d.hp -= dmg; this.numbers.push({ id: nextId++, x: 0, y: 0, v: Math.round(dmg), head }); this.numberPos(d.x, d.y + 2, d.z);
    d.mesh.rotation.x = -0.12; if (d.hp <= 0) { d.reset = 3; d.mesh.visible = false; }
  }
  private updateDummies(dt: number) { for (const d of this.dummies) { d.mesh.rotation.x *= 0.9; if (d.hp <= 0) { d.reset -= dt; if (d.reset <= 0) { d.hp = 100; d.mesh.visible = true; } } } }
  private kill(v: Actor, by: Actor | null, source: string) {
    v.alive = false; v.hp = 0; v.diedAt = this.time; v.anim.dead = Math.random() < 0.5 ? 1 : 2; v.killer = by?.name ?? source; v.char.resetDeath(); v.healT = 0;
    const alive = this.actors.filter((x) => x.alive).length; v.placement = alive + 1;
    if (by && by !== v) { by.kills++; by.inv.tokens += B.tokens.perKill; by.tokensEarned += B.tokens.perKill; if (by.isPlayer) { this.elimText = `ELIMINATED ${v.name}  +${B.tokens.perKill} tokens`; this.elimT = 2.4; } }
    const you = by?.isPlayer; const line = by?.isPlayer ? SURVIVORS.find((s) => s.id === by.survivor)?.lines[0] : '';
    this.addFeed(`${by ? by.name : 'The storm'} ${by ? 'eliminated' : 'got'} ${v.isPlayer ? 'you' : v.name}${by ? ` (${source})` : ` (${source})`}${you && line ? `  "${line}"` : ''}`, !!you || v.isPlayer);
    // drop everything as a death crate
    const items: Item[] = []; const inv = v.inv;
    for (const g of inv.main) if (g) items.push({ kind: 'weapon', id: g.id, rarity: g.rarity, qty: 1 }); if (inv.pistol) items.push({ kind: 'weapon', id: inv.pistol.id, rarity: inv.pistol.rarity, qty: 1 });
    for (const [id, n] of inv.stacks) items.push({ kind: ['light', 'heavy', 'shells'].includes(id) ? 'ammo' : ['bandage', 'medkit', 'armour_repair_kit'].includes(id) ? 'heal' : 'throwable', id, rarity: 0, qty: n });
    if (v.armour.vestLv) items.push({ kind: 'vest', id: `vest_lv${v.armour.vestLv}`, rarity: 0, qty: 1 }); if (v.armour.helmetLv) items.push({ kind: 'helmet', id: `helmet_lv${v.armour.helmetLv}`, rarity: 0, qty: 1 }); if (inv.backpackLv) items.push({ kind: 'backpack', id: `backpack_lv${inv.backpackLv}`, rarity: 0, qty: 1 });
    if (inv.tokens) items.push({ kind: 'tokens', id: 'tokens', rarity: 0, qty: inv.tokens });
    if (items.length) { const gen0 = this.gen; setTimeout(() => { if (gen0 === this.gen) this.addGroundItem(v.body.x, v.body.y, v.body.z, items, 1, true, 'death_loot_crate'); }, 700); }
    void a11(); if (v.isPlayer) { audio.play('lose'); exitPointerLock(); this.spectateTarget = by && by.alive ? by : this.actors.find((x) => x.alive) ?? null; }
    if (this.mode === 'training' && v.isBot) setTimeout(() => { v.alive = true; v.hp = 100; v.char.resetDeath(); v.anim.dead = 0; }, 3000);
    if (this.mode === 'training' && v.isPlayer) setTimeout(() => this.respawnTraining(v), 1500);
  }
  private respawnTraining(v: Actor) { v.alive = true; v.hp = 100; v.anim.dead = 0; v.char.resetDeath(); const f = POIS[4]; this.placeActor(v, f.x, f.z + 27); }
  private finish(winner: Actor | null) {
    if (this.phase === 'ended') return; this.phase = 'ended'; const p = this.player; const win = winner === p; const placement = win ? 1 : p.placement || this.actors.filter((a) => a.alive).length + 1;
    const res: Result = { win, placement, total: B.match.players, kills: p.kills, damage: Math.round(p.damage), time: Math.round(this.matchT), headshots: p.headshots, tokens: p.tokensEarned, xp: xpFor(p.kills, p.damage, placement), killer: p.killer };
    res.outcome = recordMatch(res); this.hud.result = res; audio.play(win ? 'victory' : 'lose'); track(win ? 'level_complete' : 'game_over', { placement, kills: p.kills }); this.onChange();
  }

  // ------------------------------------------------------------------ items
  nearestItem(a: Actor): GroundItem | null {
    let best: GroundItem | null = null, bd = B.loot.pickupRange; for (const g of this.items) { if (g.taken || g.mesh.userData.drop) continue; const d = Math.hypot(g.x - a.body.x, g.z - a.body.z); if (d < bd && Math.abs(g.y - a.body.y) < 2.5) { bd = d; best = g; } } return best;
  }
  nearestKiosk(a: Actor) { for (const k of this.kiosks) if (Math.hypot(k.x - a.body.x, k.z - a.body.z) < 3.2 && Math.abs(k.y - a.body.y) < 2.5) return k; return null; }
  pickup(a: Actor, g: GroundItem) {
    if (g.taken) return; const left: Item[] = []; let any = false; let legend = false;
    for (const it of g.items) { const r = this.give(a, it); if (r < it.qty || it.kind !== 'ammo' && it.kind !== 'heal' && it.kind !== 'tokens') { /* handled below */ } if (r > 0) { any = true; if (it.rarity === 3) legend = true; } if (r < it.qty && (it.kind === 'ammo' || it.kind === 'heal' || it.kind === 'throwable')) left.push({ ...it, qty: it.qty - r }); }
    if (!any) { if (a.isPlayer) this.showChat('Backpack full'); return; }
    if (left.length) g.items = left; else { g.taken = true; this.view.scene.remove(g.mesh); if (g.ring) this.view.scene.remove(g.ring); if (g.beam) this.view.scene.remove(g.beam); }
    if (a.isPlayer) audio.play(legend ? 'legend' : 'pickup');
  }
  /** Put one item to use. Returns how many units were taken. */
  give(a: Actor, it: Item): number {
    const inv = a.inv;
    switch (it.kind) {
      case 'weapon': {
        const w = it.id as WeaponId, wd = W[w], slot: GunSlot = { id: w, rarity: it.rarity, mag: wd.mag };
        if (wd.class === 'pistol') { if (inv.pistol) this.dropWeapon(a, inv.pistol); inv.pistol = slot; if (a.slot === 3) a.slot = 2; }
        else { const empty = inv.main.findIndex((m) => !m); if (empty >= 0) { inv.main[empty] = slot; if (a.slot >= 2) a.slot = empty; } else { const s = a.slot < 2 ? a.slot : 0; this.dropWeapon(a, inv.main[s]!); inv.main[s] = slot; a.slot = s; } }
        if (a.isPlayer) track('weapon_picked', { weapon: w }); return 1;
      }
      case 'ammo': return inv.add(it.id, it.qty);
      case 'heal': case 'throwable': if (it.id === 'monsoon_barrier') { let n = 0; for (let i = 0; i < it.qty; i++) if (inv.addBarrier()) n++; return n; } return inv.add(it.id, it.qty);
      case 'vest': { const lv = Number(it.id.slice(-1)); if (lv >= a.armour.vestLv) { a.armour.vestLv = lv; a.armour.vestDur = B.armour.vest.durability[lv - 1]; return 1; } return 0; }
      case 'helmet': { const lv = Number(it.id.slice(-1)); if (lv >= a.armour.helmetLv) { a.armour.helmetLv = lv; return 1; } return 0; }
      case 'backpack': { const lv = Number(it.id.slice(-1)); if (lv >= inv.backpackLv) { inv.setBackpack(lv); return 1; } return 0; }
      default: inv.tokens += it.qty; a.tokensEarned += it.qty; return it.qty;
    }
  }
  private dropWeapon(a: Actor, g: GunSlot) { this.addGroundItem(a.body.x + Math.sin(a.yaw) * 1.2, a.body.y, a.body.z + Math.cos(a.yaw) * 1.2, [{ kind: 'weapon', id: g.id, rarity: g.rarity, qty: 1 }], g.rarity, false); }
  dropSlot(a: Actor, slot: number) { const g = slot === 2 ? a.inv.pistol : a.inv.main[slot]; if (!g) return; this.dropWeapon(a, g); if (slot === 2) a.inv.pistol = null; else a.inv.main[slot] = null; if (a.slot === slot) a.slot = 3; }
  private updateLootVisibility() {
    const p = this.player.body, range = this.effQuality === 'low' ? 55 : 80, near: { g: GroundItem; d: number }[] = [];
    for (const g of this.items) {
      if (g.taken) continue; const d = Math.hypot(g.x - p.x, g.z - p.z); if (g.beam) g.beam.visible = d < 220;
      if (d < range) near.push({ g, d }); else { g.mesh.visible = false; if (g.ring) g.ring.visible = false; }
    }
    near.sort((a, b) => a.d - b.d); const cap = this.effQuality === 'low' ? 18 : 28;
    near.forEach(({ g }, i) => { const show = i < cap; g.mesh.visible = show; if (g.ring) g.ring.visible = show; if (show && !(g.mesh.userData as { loaded?: boolean }).loaded) this.ensureItemVisual(g); });
    this.items = this.items.filter((g) => !g.taken); this.env.items = this.items;
  }
  // ------------------------------------------------------------------ healing, throwables, barrier
  startHeal(a: Actor) {
    if (a.healT > 0 || a.reloadT > 0) return; const need = a.hp < B.player.hp; const H = B.healing as Record<string, { heal?: number; repair?: number; time: number }>;
    let id = ''; if (need && a.hp < 60 && a.inv.count('medkit') > 0) id = 'medkit'; else if (need && a.inv.count('bandage') > 0) id = 'bandage'; else if (need && a.inv.count('medkit') > 0) id = 'medkit';
    else if (a.armour.vestLv && a.armour.vestDur < B.armour.vest.durability[a.armour.vestLv - 1] && a.inv.count('armour_repair_kit') > 0) id = 'armour_repair_kit';
    if (!id) { if (a.isPlayer) this.showChat(need ? 'No healing items' : 'Already at full health'); return; }
    a.healItem = id; a.healT = H[id].time * (this.perks() && a.survivor === 'survivor_meera' ? 0.75 : 1);
  }
  private finishHeal(a: Actor) {
    if (a.isPlayer) this.demoFlags.healed = true;
    const H = B.healing as Record<string, { heal?: number; repair?: number }>; if (!a.inv.take(a.healItem, 1)) return;
    if (H[a.healItem].heal) a.hp = Math.min(B.player.hp, a.hp + H[a.healItem].heal!); if (H[a.healItem].repair) a.armour.vestDur = Math.min(B.armour.vest.durability[a.armour.vestLv - 1], a.armour.vestDur + H[a.healItem].repair!);
    if (a.isPlayer) audio.play('pickup', { gain: 0.6 });
  }
  throwGrenade(a: Actor, smoke: boolean) {
    const id = smoke || input.slot === -9 ? 'smoke_can' : 'frag_grenade'; const useId = a.inv.count('frag_grenade') > 0 && !smoke ? 'frag_grenade' : a.inv.count('smoke_can') > 0 ? 'smoke_can' : '';
    void id; if (!useId || !a.inv.take(useId, 1)) { if (a.isPlayer) this.showChat('No grenades'); return; }
    const isSmoke = useId === 'smoke_can'; const dir = a.isPlayer ? this.camDir() : this.aimDir(a); const o = this.eye(a); const v = dir.clone().multiplyScalar(15); v.y += 4;
    const mesh = new THREE.Group(); cloneModel(useId).then((m) => { m.scale.setScalar(2); mesh.add(m); }); mesh.position.copy(o); this.view.scene.add(mesh);
    this.grenades.push({ pos: o, vel: v, fuse: isSmoke ? (B.throwables.smoke_can.fuse) : B.throwables.frag_grenade.fuse, owner: a, smoke: isSmoke, mesh }); a.anim.throwT = 1; if (a.isPlayer) audio.play('whoosh', { gain: 0.3 });
  }
  private updateGrenades(dt: number) {
    for (const g of this.grenades) {
      g.fuse -= dt; g.vel.y -= 18 * dt; const next = g.pos.clone().addScaledVector(g.vel, dt); const gh = this.colliders.surfaceBelow(next.x, next.z, g.pos.y + 0.5) ?? this.world.terrain.height(next.x, next.z);
      if (next.y < gh + 0.1) { next.y = gh + 0.1; g.vel.y *= -0.3; g.vel.x *= 0.6; g.vel.z *= 0.6; } const hit = this.colliders.raycast(g.pos.x, g.pos.y, g.pos.z, g.vel.x, g.vel.y, g.vel.z, g.vel.length() * dt + 0.2); if (hit < g.vel.length() * dt + 0.2) { g.vel.x *= -0.3; g.vel.z *= -0.3; } else g.pos.copy(next);
      g.mesh.position.copy(g.pos);
      if (g.fuse <= 0) { this.explode(g); }
    }
    this.grenades = this.grenades.filter((g) => g.fuse > 0);
    for (const s of this.smokes) { s.t -= dt; s.mesh.scale.setScalar(Math.min(1, (B.throwables.smoke_can.duration - s.t) / 1.5 + 0.1) * s.r); if (s.t <= 0) this.view.scene.remove(s.mesh); } this.smokes = this.smokes.filter((s) => s.t > 0);
  }
  private explode(g: Grenade) {
    this.view.scene.remove(g.mesh);
    if (g.smoke) { const m = new THREE.Mesh(SMOKE_GEO, SMOKE_MAT); m.position.copy(g.pos); this.view.scene.add(m); this.smokes.push({ x: g.pos.x, y: g.pos.y, z: g.pos.z, r: B.throwables.smoke_can.radius, t: B.throwables.smoke_can.duration, mesh: m }); return; }
    audio.playAt('grenade', g.pos.x - this.player.body.x, g.pos.z - this.player.body.z, this.player.yaw, 120); this.shake = Math.max(this.shake, Math.hypot(g.pos.x - this.player.body.x, g.pos.z - this.player.body.z) < 15 ? 0.6 : 0);
    for (let i = 0; i < 8; i++) this.puff(g.pos.clone().add(V((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3)), 0xff8a2a);
    for (const t of this.targets({} as Actor).concat(g.owner.alive ? [{ x: g.owner.body.x, y: g.owner.body.y, z: g.owner.body.z, actor: g.owner, crouch: false }] : [])) {
      const dist = Math.hypot(t.x - g.pos.x, t.y + 1 - g.pos.y, t.z - g.pos.z); const dmg = grenadeDamage(dist); if (dmg <= 0) continue;
      const d = V(t.x - g.pos.x, t.y + 1 - g.pos.y, t.z - g.pos.z).normalize(); if (this.colliders.raycast(g.pos.x, g.pos.y + 0.3, g.pos.z, d.x, d.y, d.z, dist) < dist - 0.5) continue;
      if (t.actor) this.hurt(t.actor, g.owner, dmg, false, 'Frag grenade'); else if (t.dummy) this.hitDummy(t.dummy, dmg, false);
    }
    for (const b of this.barriers) if (Math.hypot(b.x - g.pos.x, b.z - g.pos.z) < 5) b.state.hit(B.throwables.frag_grenade.damage * 3);
  }
  private toggleBarrier(a: Actor, c: Cmd) {
    if (a.inv.barriers <= 0) { if (a.isPlayer) this.showChat('No barriers'); return; }
    if (a.isPlayer) { this.placing = !this.placing; if (this.ghost) this.ghost.visible = this.placing; } else { this.placeBarrierAt(a, a.body.x + Math.sin(c.yaw) * 3, a.body.z + Math.cos(c.yaw) * 3, c.yaw); }
  }
  private placeBarrier(a: Actor) { const x = a.body.x + Math.sin(a.yaw) * 3.2, z = a.body.z + Math.cos(a.yaw) * 3.2; this.placeBarrierAt(a, x, z, a.yaw); this.placing = false; if (this.ghost) this.ghost.visible = false; }
  private placeBarrierAt(a: Actor, x: number, z: number, yaw: number) {
    if (a.inv.barriers <= 0) return; a.inv.barriers--; const y = this.world.terrain.height(x, z); const q = Math.round(yaw / (Math.PI / 2)) & 1; const hw = 2, hd = 0.5;
    const box = this.colliders.add({ x0: x - (q ? hd : hw), x1: x + (q ? hd : hw), z0: z - (q ? hw : hd), z1: z + (q ? hw : hd), y0: y, y1: y + 1.4 });
    const mesh = new THREE.Group(); cloneModel('monsoon_barrier').then((m) => mesh.add(m)); mesh.position.set(x, y, z); mesh.rotation.y = Math.round(yaw / (Math.PI / 2)) * (Math.PI / 2); this.view.scene.add(mesh);
    this.barriers.push({ box, mesh, state: new BarrierState(), x, z }); audio.playAt('barrier', x - this.player.body.x, z - this.player.body.z, this.player.yaw, 60);
  }
  private updateBarriers(dt: number) {
    for (const b of this.barriers) { b.state.tick(dt); if (!b.state.alive) { this.colliders.remove(b.box); this.view.scene.remove(b.mesh); } } this.barriers = this.barriers.filter((b) => b.state.alive);
    if (this.placing && this.ghost) { const a = this.player; const x = a.body.x + Math.sin(a.yaw) * 3.2, z = a.body.z + Math.cos(a.yaw) * 3.2; this.ghost.position.set(x, this.world.terrain.height(x, z), z); this.ghost.rotation.y = Math.round(a.yaw / (Math.PI / 2)) * (Math.PI / 2); }
  }
  /** Can `a` see `b`? Blocked by walls and smoke. */
  canSee(a: Actor, b: Actor): boolean {
    const o = this.eye(a), t = this.eye(b), d = t.clone().sub(o), dist = d.length(); d.normalize();
    if (this.colliders.raycast(o.x, o.y, o.z, d.x, d.y, d.z, dist) < dist - 0.6) return false;
    for (const s of this.smokes) { const rel = V(s.x - o.x, s.y - o.y, s.z - o.z), pr = rel.dot(d); if (pr > 0 && pr < dist && rel.clone().addScaledVector(d, -pr).length() < s.r * 0.8) return false; }
    for (const br of this.barriers) if (rayBox(o.x, o.y, o.z, d.x, d.y, d.z, br.box) < dist) return false;
    return true;
  }
  buy(id: string) { const r = purchase(this.player.inv, id, this.time, this.nearestKiosk(this.player)?.last ?? { lastAt: -99 }); if (r.ok) audio.play('purchase'); else this.showChat(r.reason === 'tokens' ? 'Not enough tokens' : r.reason === 'cooldown' ? 'Wait a moment' : r.reason === 'full' ? 'Backpack full' : 'Unavailable'); return r; }

  // ------------------------------------------------------------------ effects
  private flash(p: THREE.Vector3) { const m = this.fx.flashes.find((f) => !f.visible); if (m) { m.visible = true; m.position.copy(p); m.userData.t = 0.05; m.scale.setScalar(0.8 + Math.random() * 0.9); } }
  private tracerLine(a: THREE.Vector3, b: THREE.Vector3) { const l = this.fx.tracers.find((t) => !t.visible); if (!l) return; const pos = l.geometry.getAttribute('position') as THREE.BufferAttribute; pos.setXYZ(0, a.x, a.y, a.z); pos.setXYZ(1, b.x, b.y, b.z); pos.needsUpdate = true; l.visible = true; l.userData.t = 0.08; }
  private puff(p: THREE.Vector3, color: number) { const m = this.fx.puffs.find((f) => !f.visible); if (m) { m.visible = true; m.position.copy(p); (m.material as THREE.MeshBasicMaterial).color.setHex(color); m.userData.t = 0.4; m.scale.setScalar(1); } }
  private updateEffects(dt: number) {
    for (const l of this.fx?.tracers ?? []) if (l.visible && (l.userData.t -= dt) <= 0) l.visible = false;
    for (const m of this.fx?.flashes ?? []) if (m.visible && (m.userData.t -= dt) <= 0) m.visible = false;
    for (const m of this.fx?.puffs ?? []) if (m.visible) { m.userData.t -= dt; m.scale.multiplyScalar(1 + dt * 3); (m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, m.userData.t / 0.4); if (m.userData.t <= 0) m.visible = false; }
    for (const g of this.items) { if (g.taken) continue; g.spin += dt; const dropping = g.mesh.userData.drop as { t: number; y0: number; y: number } | undefined; if (dropping) { dropping.t -= dt; const k = Math.max(0, dropping.t / B.zone.crateFall); g.y = dropping.y + (dropping.y0 - dropping.y) * k; if (dropping.t <= 0) { delete g.mesh.userData.drop; g.y = dropping.y; cloneModel('supply_crate').then((m) => { g.mesh.clear(); g.mesh.add(m); }); } } g.mesh.position.set(g.x, g.y + 0.25 + Math.sin(g.spin * 2) * 0.08, g.z); g.mesh.rotation.y = g.spin; if (g.ring) g.ring.position.set(g.x, g.y + 0.06, g.z); }
    if (this.view) {
      this.view.update(this.camera.position, this.time, this.effQuality === 'low');
      if (this.effQuality === 'high' && this.player) { const p = this.player.body, s = this.view.sun; s.target.position.set(p.x, p.y, p.z); s.position.set(p.x - 70, p.y + 100, p.z - 45); }
    }
  }

  // ------------------------------------------------------------------ camera
  private updateCamera(dt: number) {
    let a = this.player; if (!a.alive && this.spectateTarget?.alive) a = this.spectateTarget; else if (!a.alive && this.phase === 'ended') a = this.spectateTarget ?? a;
    if (this.phase === 'flight' && a.mode === 'plane') { const p = this.plane.position; this.camera.position.set(p.x - 30, p.y + 14, p.z - 30).add(this.planeDir.clone().multiplyScalar(-10)); this.camera.lookAt(p); this.camera.fov = 70; this.camera.updateProjectionMatrix(); return; }
    const scoped = a === this.player && this.scoped(); const g = this.gun(a); const targetFov = a === this.player && input.aim && g ? (W[g.id].scope === 2 ? 35 : W[g.id].scope === 4 ? 20 : 55) : a.mode === 'skydive' ? 85 : 70;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt / 0.16 * 1); this.camera.updateProjectionMatrix();
    const head = V(a.body.x, a.body.y + (a.body.crouch ? 1.15 : 1.65), a.body.z), f = this.aimDir(a), r = V(-Math.cos(a.yaw), 0, Math.sin(a.yaw));
    if (scoped) { this.camera.position.copy(head).addScaledVector(f, 0.3); }
    else {
      const sk = a.mode === 'skydive' ? 1.6 : 1; const back = 3.2 * sk, side = 0.6; const want = head.clone().addScaledVector(r, side).addScaledVector(f, -back);
      const dir = want.clone().sub(head), dist = dir.length(); dir.normalize(); const hit = this.colliders.raycast(head.x, head.y, head.z, dir.x, dir.y, dir.z, dist), canopy = this.canopyHit(head, dir, dist); const allowed = Math.max(0.5, Math.min(dist, hit < dist ? hit - 0.3 : dist, canopy < dist ? canopy - 0.5 : dist));
      // snap in quickly when something gets in the way, ease back out slowly
      this.camDist += (allowed - this.camDist) * (1 - Math.exp(-dt * (allowed < this.camDist ? 22 : 3))); const d = Math.min(this.camDist, dist);
      this.camera.position.copy(head).addScaledVector(dir, d);
      const gh = this.world.terrain.height(this.camera.position.x, this.camera.position.z) + 0.3; if (this.camera.position.y < gh) this.camera.position.y = gh;
    }
    const sh = this.shake * (settings.reduceMotion ? 0 : 1); this.camera.position.x += (Math.random() - 0.5) * sh * 0.3; this.camera.position.y += (Math.random() - 0.5) * sh * 0.3;
    this.camera.lookAt(head.clone().addScaledVector(r, scoped ? 0 : 0.6).addScaledVector(f, 40));
    a.char.root.visible = a.char.root.visible && !scoped && !(a === this.player && this.camDist < 0.85);
  }

  // ------------------------------------------------------------------ hud snapshot
  showBanner(t: string) { this.banner = t; this.bannerT = 4; }
  showChat(t: string) { this.chat = t; this.chatT = 2; }
  addFeed(text: string, mine: boolean) { this.feed.push({ id: nextId++, text, t: 4, mine }); if (this.feed.length > 4) this.feed.shift(); }
  private blankHud(): Hud {
    return { phase: 'menu', mode: 'solo', hp: 100, vest: 0, vestMax: 1, helmet: 0, alive: 0, kills: 0, tokens: 0, ammoMag: 0, ammoReserve: 0, weaponName: '', slots: [], heals: { bandage: 0, medkit: 0, repair: 0, barriers: 0, frag: 0, smoke: 0 }, prompt: null, feed: [], banner: null, zone: null, px: 0, pz: 0, yaw: 0, alt: 0, hitT: 0, hitHead: false, dmgArc: [], reloading: 0, healing: 0, scope: 0, aim: false, spread: 0, fps: 60, numbers: [], shots: [], marker: null, planeX: 0, planeZ: 0, planeDir: [1, 0], canJump: false, autoJumpIn: 0, kioskNear: false, kioskOpen: false, inventoryOpen: false, mapOpen: false, stack: [], capacity: 6, chat: '', demo: null, elim: null, dropCard: null, weaponClass: '', zoneWarn: null, result: null, quality: 'auto', shake: 0, inBush: false, inZoneDanger: false, spectating: null };
  }
  private snapshot() {
    const h = this.hud, p = this.player; if (!p) return; h.phase = this.phase; h.mode = this.mode; h.hp = Math.max(0, Math.round(p.hp)); h.vest = Math.round(p.armour.vestDur); h.vestMax = p.armour.vestLv ? B.armour.vest.durability[p.armour.vestLv - 1] : 1; h.helmet = p.armour.helmetLv;
    h.alive = this.mode === 'training' ? this.dummies.length + 1 : this.actors.filter((a) => a.alive).length; h.kills = p.kills; h.tokens = p.inv.tokens; const g = this.gun(p);
    h.weaponName = g ? W[g.id].label : ''; h.ammoMag = g?.mag ?? 0; h.ammoReserve = g && W[g.id].ammo ? p.inv.count(W[g.id].ammo as string) : 0;
    const slotDefs: [number, GunSlot | null | true][] = [[0, p.inv.main[0]], [1, p.inv.main[1]], [2, p.inv.pistol], [3, true]];
    h.slots = slotDefs.map(([i, s]) => ({ label: s === true ? 'Tide Machete' : s ? W[s.id].label : 'Empty', id: s === true ? 'tide_machete' : s ? s.id : '', mag: s && s !== true ? s.mag : 0, active: p.slot === i, rarity: s && s !== true ? s.rarity : 0 }));
    h.heals = { bandage: p.inv.count('bandage'), medkit: p.inv.count('medkit'), repair: p.inv.count('armour_repair_kit'), barriers: p.inv.barriers, frag: p.inv.count('frag_grenade'), smoke: p.inv.count('smoke_can') };
    const it = p.alive ? this.nearestItem(p) : null; const kiosk = p.alive ? this.nearestKiosk(p) : null;
    h.prompt = kiosk && !this.kioskOpen && (!it) ? { text: 'Supply kiosk', color: '#A78BFA' } : it ? { text: itemLabel(it.items[0]) + (it.items.length > 1 ? ` +${it.items.length - 1} more` : ''), color: RC[it.rarity] } : null;
    h.feed = [...this.feed]; h.banner = this.bannerT > 0 ? { text: this.banner, t: this.bannerT } : null;
    h.zone = this.zone ? { phase: this.zone.phase, stage: this.zone.stage, timeLeft: this.zone.timeLeft, cx: this.zone.cx, cz: this.zone.cz, r: this.zone.radius, nx: this.zone.nextCx, nz: this.zone.nextCz, nr: this.zone.nextRadius } : null;
    h.px = p.body.x; h.pz = p.body.z; h.yaw = p.yaw; h.alt = Math.max(0, Math.round(p.body.y - this.world.terrain.height(p.body.x, p.body.z))); h.hitT = this.hitT; h.hitHead = this.hitHead; h.dmgArc = this.dmgArcs.map((d) => ({ ...d }));
    h.reloading = p.reloadT > 0 ? 1 - p.reloadT / p.reloadMax : 0; h.healing = p.healT > 0 ? 1 - p.healT / (((B.healing as Record<string, { time: number }>)[p.healItem]?.time) || 1) : 0; h.aim = input.aim; h.scope = this.scoped() ? (W[g!.id].scope) : 0; h.spread = (g ? W[g.id].spread : 0.02) * (p.speedNow > 1 ? 1.8 : 1) * (input.aim ? 0.55 : 1);
    h.fps = Math.round(this.fps); h.numbers = [...this.numbers]; h.shots = this.shotsHeard.map((s) => ({ ...s })); h.marker = this.marker;
    h.planeX = this.plane?.position.x ?? 0; h.planeZ = this.plane?.position.z ?? 0; h.planeDir = [this.planeDir.x, this.planeDir.z]; h.canJump = this.phase === 'flight' && p.mode === 'plane'; h.autoJumpIn = Math.max(0, B.match.flightSeconds - this.flightT);
    h.dropCard = this.dropT > 0 ? this.dropCard : null;
    h.elim = this.elimT > 0 ? { text: this.elimText, t: this.elimT } : null; h.weaponClass = g ? W[g.id].class : ''; h.zoneWarn = this.zone && p.alive && this.phase === 'playing' ? { dist: Math.hypot(p.body.x - this.zone.cx, p.body.z - this.zone.cz) - this.zone.radius, dps: this.zone.dps } : null;
    h.kioskNear = !!kiosk; h.kioskOpen = this.kioskOpen; h.inventoryOpen = this.inventoryOpen; h.mapOpen = this.mapOpen; h.stack = [...p.inv.stacks].map(([id, qty]) => ({ id, qty })); h.capacity = p.inv.capacity; h.chat = this.chatT > 0 ? this.chat : '';
    h.shake = this.shake; h.inBush = p.hidden; h.inZoneDanger = !!this.zone && zoneDamage(this.zone, p.body.x, p.body.z) > 0; h.spectating = !p.alive ? this.spectateTarget?.name ?? null : null; h.quality = this.effQuality;
  }
  spectateNext() { const alive = this.actors.filter((a) => a.alive && !a.isPlayer); if (!alive.length) return; const i = Math.max(0, alive.indexOf(this.spectateTarget!)); this.spectateTarget = alive[(i + 1) % alive.length]; }
  toLobby() { this.cleanup(); this.phase = 'menu'; this.hud.result = null; audio.startMusic('lobby'); this.onChange(); }
  dispose() { cancelAnimationFrame(this.raf); }
}
function a11() { /* placeholder to keep kill() readable */ }
