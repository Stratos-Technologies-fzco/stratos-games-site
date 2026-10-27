// GameLoop.js - Three.js scene, spawning, behaviour, energy and balance,
// immune memory, evolution and the render loop.
import * as THREE from 'three';
import { TIERS, organismsOfTier, getOrganism, envFit, ENV_EVENTS } from './Database.js';
import { buildOrganismMesh, animateOrganism, buildPlayerMesh, animatePlayer, buildBiome, biomeColors, energyBurst } from './Organisms.js';
import { Controls } from './Controls.js';
import { ScannerSystem } from './ScannerSystem.js';
import { SynthesisEngine } from './SynthesisEngine.js';
import { t, o, dict, tierT, eventT } from './i18n.js';

const ARENA = 50;
const SAVE_KEY = 'ecos-synthetica-v1';
// Each player profile keeps its own save (the first profile keeps the original key).
let saveKey = SAVE_KEY;
export function setSaveKey(k) { saveKey = k || SAVE_KEY; }
const SCAN_COST = 4;
const SYNTH_COST = 8;
export const RING = {
  unknown: 0x8a9aa3, pathogen: 0xe46b86, competitor: 0xa98ae6, opportunist: 0xe8a33d,
  calm: 0xc9a86a, mutualist: 0x84c96b, memory: 0x5fc4d0,
};
const FLYERS = {
  mosquito: 1.7, ladybird: 0.5, aphid: 0.2, locust: -0.2, mite: -0.6, tree: -0.2,
  hornet: 1.5, fly: 1.3, termite: -0.65, earthworm: -0.82, dungbeetle: -0.55, lichen: -0.7,
};

export class Game {
  constructor(container, ui, sound) {
    this.ui = ui;
    this.sound = sound;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({ antialias: !coarse, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'gl';

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 1.1);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.3);
    this.sun.position.set(20, 40, 12);
    this.scene.add(this.hemi, this.sun);

    this.ringGeo = new THREE.RingGeometry(0.75, 1, 28);
    this.hitGeo = new THREE.SphereGeometry(1, 8, 6);
    this.hitMat = new THREE.MeshBasicMaterial({ visible: false });

    this.marker = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: 0xc9b2ff }));
    this.marker.rotation.x = Math.PI / 2;
    this.marker.visible = false;
    this.scene.add(this.marker);
    this.beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xc9b2ff, transparent: true, opacity: 0.8 }));
    this.beam.visible = false;
    this.scene.add(this.beam);

    this.controls = new Controls(this.renderer.domElement, document.getElementById('joy'), document.getElementById('joyKnob'), { onTap: (x, y) => this.handleTap(x, y) });
    this.scanner = new ScannerSystem(this.camera, this.renderer.domElement);
    this.scanner.onComplete = (e) => this.onScanned(e);
    this.synth = new SynthesisEngine();

    this.entities = [];
    this.pauseReasons = new Set(['start']);
    this.time = 0;
    this.hudTimer = 0;
    this.camTarget = new THREE.Vector3();
    this.toastAt = {};
    this.load();

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.loadTier(this.tier, true);
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ---------- save ----------
  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(saveKey) || 'null'); } catch (e) { s = null; }
    this.hasSave = !!(s && (s.scanned || []).length);
    this.tier = s && Number.isInteger(s.tier) && s.tier >= 0 && s.tier < TIERS.length ? s.tier : 0;
    this.ep = (s && s.ep) || 0;
    this.completed = !!(s && s.completed);
    const valid = (arr) => new Set((arr || []).filter((id) => getOrganism(id)));
    this.scanned = valid(s && s.scanned);
    this.countered = valid(s && s.countered);
    this.recruited = valid(s && s.recruited);
    // Wrong-try counts per case, so Lab reasons stay unlocked after a reload.
    this.synth.attempts = {};
    for (const [id, n] of Object.entries((s && s.attempts) || {})) {
      if (getOrganism(id) && Number.isInteger(n) && n > 0) this.synth.attempts[id] = n;
    }
  }

  save() {
    try {
      localStorage.setItem(saveKey, JSON.stringify({ tier: this.tier, ep: this.ep, completed: this.completed, scanned: [...this.scanned], countered: [...this.countered], recruited: [...this.recruited], attempts: this.synth.attempts }));
    } catch (e) { /* storage blocked: progress lasts for this visit only */ }
  }

  resetProgress() {
    try { localStorage.removeItem(saveKey); } catch (e) { /* ignore */ }
    this.tier = 0; this.ep = 0; this.completed = false;
    this.scanned = new Set(); this.countered = new Set(); this.recruited = new Set();
    this.synth = new SynthesisEngine();
    this.loadTier(0, true);
  }

  // ---------- pause ----------
  pause(r) { this.pauseReasons.add(r); }
  resume(r) { this.pauseReasons.delete(r); }
  get paused() { return this.pauseReasons.size > 0; }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 68 : 55;
    this.camera.updateProjectionMatrix();
  }

  // ---------- tiers ----------
  loadTier(t, quiet = false) {
    this.tier = t;
    const info = TIERS[t];
    for (const e of [...this.entities]) this.removeEntity(e);
    if (this.biome) { this.scene.remove(this.biome); this.disposeTree(this.biome, true); }
    this.biome = buildBiome(t, ARENA);
    this.scene.add(this.biome);
    const b = biomeColors(t);
    this.scene.background = new THREE.Color(b.bg);
    this.scene.fog = new THREE.Fog(b.fog, 34, 105);
    this.hemi.color.set(b.hemi[0]);
    this.hemi.groundColor.set(b.hemi[1]);

    if (this.player) { this.scene.remove(this.player); this.disposeTree(this.player, false); }
    this.player = buildPlayerMesh(t);
    this.player.position.set(0, this.player.userData.height - 1, 0);
    this.scene.add(this.player);
    this.camTarget.copy(this.player.position);

    this.env = { ...info.base };
    this.envTarget = { ...info.base };
    this.eventName = 'Calm';
    this.eventTimer = 40;
    this.integrity = 100;
    this.energy = 100;
    this.balance = this.balanceTarget();
    this.oppHostile = this.balance < 50;
    this.spawnTimer = 0.5;
    this.hunterTimer = 5;
    this.over = false;
    this.selected = null;
    this.scanner.clear();
    this.wasEvolvable = this.progress().ready;
    for (let i = 0; i < 6; i++) this.spawnOne(true);
    if (!quiet) this.save();
    this.ui.updateHUD(this.hud(this.progress()));
  }

  progress() {
    const orgs = organismsOfTier(this.tier);
    const need = TIERS[this.tier].need;
    const counters = orgs.filter((o) => o.role !== 'mutualist' && this.countered.has(o.id)).length;
    const allies = orgs.filter((o) => o.role === 'mutualist' && this.recruited.has(o.id)).length;
    return { counters, allies, need, ready: counters >= need.counters && allies >= need.allies, totalThreats: orgs.filter((o) => o.role !== 'mutualist').length };
  }

  evolve() {
    if (!this.progress().ready || this.tier >= TIERS.length - 1) return;
    this.sound.evolve();
    this.loadTier(this.tier + 1);
    this.ui.showTierIntro(this.tier);
  }

  // Second chance: keep everything, push the nearest attackers back, half integrity.
  revive() {
    const p = this.player.position;
    for (const e of [...this.entities]) if (e.state !== 'ally' && e.root.position.distanceTo(p) < 9) this.removeEntity(e);
    this.integrity = 50;
    this.over = false;
  }

  retry() {
    for (const e of [...this.entities]) this.removeEntity(e);
    this.integrity = 100;
    this.energy = 100;
    this.over = false;
    this.selected = null;
    this.scanner.clear();
    this.player.position.set(0, this.player.userData.height - 1, 0);
    for (let i = 0; i < 6; i++) this.spawnOne(true);
  }

  // ---------- bonuses & balance ----------
  bonuses() {
    const b = { regen: 0, energy: 0, balance: 0, hunters: [] };
    for (const id of this.recruited) {
      const o = getOrganism(id);
      if (!o.bonus) continue;
      b.regen += o.bonus.regen || 0;
      b.energy += o.bonus.energy || 0;
      b.balance += o.bonus.balance || 0;
      if (o.bonus.hunts) b.hunters.push(o);
    }
    return b;
  }

  stress() {
    const base = TIERS[this.tier].base;
    return Math.min(1, Math.abs(this.env.hum - base.hum) / 45 + Math.abs(this.env.temp - base.temp) / 18);
  }

  balanceTarget() {
    // Partners of the current form keep this ecosystem in balance; stress pulls it down.
    let local = 0;
    for (const o of organismsOfTier(this.tier)) if (this.recruited.has(o.id)) local += 14 + ((o.bonus && o.bonus.balance) || 0);
    return Math.max(5, Math.min(98, 52 + local - this.stress() * 38));
  }

  isHostile(org) {
    if (org.role === 'mutualist' || this.countered.has(org.id)) return false;
    if (org.role === 'opportunist') return this.balance < 50;
    return true;
  }

  // ---------- entities ----------
  spawnOne(initial = false) {
    const pool = organismsOfTier(this.tier);
    const counts = {};
    for (const e of this.entities) if (e.state !== 'contained') counts[e.org.id] = (counts[e.org.id] || 0) + 1;
    const allies = this.entities.filter((e) => e.state === 'ally').length;
    const weights = pool.map((o) => {
      let w = envFit(o, this.env);
      if (!this.scanned.has(o.id)) w *= 1.7;
      if (this.countered.has(o.id)) w *= 0.45;
      if (o.role === 'mutualist') w *= this.recruited.has(o.id) ? (allies < 4 ? 0.4 : 0) : 0.75;
      if (o.speed === 0 && counts[o.id]) w = 0;
      if ((counts[o.id] || 0) >= (o.swarm ? o.swarm + 1 : 2)) w = 0;
      return w;
    });
    const sum = weights.reduce((a, b) => a + b, 0);
    if (sum <= 0) return;
    let r = Math.random() * sum;
    let org = pool[0];
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) { org = pool[i]; break; } }

    const n = org.swarm ? org.swarm : 1;
    const a = Math.random() * Math.PI * 2;
    const d = initial ? 12 + Math.random() * 16 : 22 + Math.random() * 16;
    let cx = this.player.position.x + Math.cos(a) * d;
    let cz = this.player.position.z + Math.sin(a) * d;
    const len = Math.hypot(cx, cz);
    if (len > ARENA - 2) { cx *= (ARENA - 2) / len; cz *= (ARENA - 2) / len; }
    for (let i = 0; i < n; i++) this.createEntity(org, cx + (Math.random() - 0.5) * 4, cz + (Math.random() - 0.5) * 4);
  }

  createEntity(org, x, z, state) {
    const root = new THREE.Group();
    const vis = buildOrganismMesh(org);
    vis.scale.multiplyScalar(org.size);
    root.add(vis);
    const ring = new THREE.Mesh(this.ringGeo, new THREE.MeshBasicMaterial({ color: RING.unknown, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.scale.setScalar(org.size * 1.05);
    root.add(ring);
    const hit = new THREE.Mesh(this.hitGeo, this.hitMat);
    hit.scale.setScalar(org.size * 1.25 + 0.4);
    root.add(hit);
    const hover = FLYERS[org.form] ?? 0.5;
    root.position.set(x, hover, z);
    this.scene.add(root);
    const recruited = this.recruited.has(org.id);
    const e = {
      org, root, vis, ring, hit, hover, phase: Math.random() * 6, t: 0,
      state: state || (recruited && org.speed > 0 && this.entities.filter((q) => q.state === 'ally').length < 4 ? 'ally' : 'wander'),
      allyAngle: Math.random() * Math.PI * 2, wx: x, wz: z, wt: 0, ringKey: '',
    };
    hit.userData.entity = e;
    this.entities.push(e);
    return e;
  }

  removeEntity(e) {
    e.removed = true;
    this.scene.remove(e.root);
    e.root.traverse((o) => { if (o.material && o.material !== this.hitMat) o.material.dispose(); });
    this.entities.splice(this.entities.indexOf(e), 1);
    if (this.selected === e) { this.selected = null; this.scanner.clear(); }
  }

  disposeTree(obj, geometries) {
    obj.traverse((o) => {
      if (geometries && o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
  }

  contain(e, why, delay = 0) {
    if (e.state === 'contained') return;
    e.state = 'contained';
    e.ct = -delay;
    if (why === 'memory') {
      this.ep += 2;
      this.throttledToast('mem' + e.org.id, t('toast.memory', { name: o(e.org, 'name') }), 'memory');
    }
    if (this.selected === e) { this.selected = null; this.scanner.clear(); }
  }

  ringKeyFor(e) {
    if (!this.scanned.has(e.org.id)) return 'unknown';
    if (e.state === 'ally' || this.recruited.has(e.org.id)) return 'mutualist';
    if (this.countered.has(e.org.id)) return 'memory';
    if (e.org.role === 'opportunist' && !this.isHostile(e.org)) return 'calm';
    return e.org.role;
  }

  // ---------- input actions ----------
  handleTap(x, y) {
    if (this.paused || this.over) return;
    this.sound.ensure();
    const e = this.scanner.pick(x, y, this.entities.filter((q) => q.state !== 'contained'));
    if (e) this.select(e);
  }

  select(e) {
    this.selected = e;
    this.sound.select();
    if (this.scanned.has(e.org.id)) {
      this.scanner.clear();
      this.ui.showProfile(e.org);
    } else if (this.energy < SCAN_COST) {
      this.ui.toast(t('toast.noEnergyScan'), 'warn');
    } else {
      this.scanner.start(e);
    }
  }

  scanAction() {
    if (this.paused || this.over) return;
    this.sound.ensure();
    const p = this.player.position;
    if (this.selected && !this.scanned.has(this.selected.org.id)) { this.select(this.selected); return; }
    const live = this.entities.filter((e) => e.state !== 'contained');
    const byDist = live.map((e) => [e, e.root.position.distanceTo(p)]).sort((a, b) => a[1] - b[1]);
    const unscanned = byDist.find(([e, d]) => !this.scanned.has(e.org.id) && d < 22);
    if (unscanned) { this.select(unscanned[0]); return; }
    if (byDist.length && byDist[0][1] < 14) { this.select(byDist[0][0]); return; }
    this.ui.toast(t('toast.nothing'), 'warn');
  }

  onScanned(e) {
    const org = e.org;
    const isNew = !this.scanned.has(org.id);
    this.scanned.add(org.id);
    if (isNew) { this.ep += 5; this.energy = Math.max(0, this.energy - SCAN_COST); }
    this.sound.scanDone();
    energyBurst(this.scene, e.root.position.clone());
    this.save();
    // Let the energy burst play in the world before the profile opens.
    setTimeout(() => this.ui.showProfile(org, { isNew }), 1100);
  }

  // Lab entry point. Returns the engine result, or { error }.
  trySynthesis(orgId, selected) {
    const org = getOrganism(orgId);
    if (!org) return { error: 'none' };
    if (!selected.length) return { error: 'empty' };
    if (this.energy < SYNTH_COST) return { error: 'energy' };
    this.energy -= SYNTH_COST;
    const res = this.synth.evaluate(org, selected);
    if (res.success) {
      this.sound.success();
      if (org.role === 'mutualist') this.recruit(org); else this.counter(org);
    } else {
      this.sound.fail();
      this.save();
    }
    return res;
  }

  counter(org) {
    this.countered.add(org.id);
    this.ep += 25;
    let k = 0;
    for (const e of this.entities) if (e.org.id === org.id && e.state !== 'contained') this.contain(e, 'counter', (k++) * 0.25);
    this.ui.toast(t('toast.contained', { name: o(org, 'name'), outcome: o(org, 'outcome') }), 'good');
    this.save();
  }

  recruit(org) {
    this.recruited.add(org.id);
    this.ep += 20;
    let allies = this.entities.filter((e) => e.state === 'ally').length;
    let found = false;
    for (const e of this.entities) {
      if (e.org.id !== org.id || e.state === 'contained') continue;
      found = true;
      if (org.speed > 0 && allies < 4) { e.state = 'ally'; allies++; } else e.state = 'wander';
    }
    if (!found && org.speed > 0) {
      const p = this.player.position;
      this.createEntity(org, p.x + 4, p.z + 4, 'ally');
    }
    this.ui.toast(t('toast.partner', { name: o(org, 'name'), bonus: o(org, 'bonus') }), 'good');
    this.save();
  }

  throttledToast(key, text, kind, gap = 8) {
    if (this.toastAt[key] && this.time - this.toastAt[key] < gap) return;
    this.toastAt[key] = this.time;
    this.ui.toast(text, kind);
  }

  // ---------- frame ----------
  frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    if (!this.paused && !this.over) this.update(dt);
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    this.time += dt;
    const p = this.player.position;

    // Player movement
    const mv = this.controls.moveVector();
    const speed = this.tier === 2 ? 8.5 : 7;
    p.x += mv.x * speed * dt;
    p.z += mv.z * speed * dt;
    const pr = Math.hypot(p.x, p.z);
    if (pr > ARENA) { p.x *= ARENA / pr; p.z *= ARENA / pr; }
    if (mv.amount > 0.05) {
      const want = Math.atan2(-mv.z, mv.x);
      let diff = want - this.player.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.player.rotation.y += diff * Math.min(1, dt * 10);
    }
    p.y = this.player.userData.height - 1 + (this.tier === 3 ? 0 : Math.sin(this.time * 2) * 0.12);
    animatePlayer(this.player, this.time, mv.amount);

    // Environment drift and events
    this.eventTimer -= dt;
    if (this.eventTimer <= 0) {
      const options = ENV_EVENTS.filter((ev) => ev.name !== this.eventName);
      const ev = options[Math.floor(Math.random() * options.length)];
      const base = TIERS[this.tier].base;
      this.envTarget = { hum: Math.max(5, Math.min(100, base.hum + ev.dHum)), temp: base.temp + ev.dTemp, nut: Math.max(5, Math.min(100, base.nut + ev.dNut)) };
      this.eventName = ev.name;
      this.eventTimer = 45;
      const [evName, evText] = eventT(ev);
      this.ui.toast(t('toast.event', { name: evName, text: evText }), 'env');
    }
    const k = Math.min(1, dt * 0.12);
    for (const key of ['hum', 'temp', 'nut']) this.env[key] += (this.envTarget[key] - this.env[key]) * k;

    // Balance and the opportunist switch
    this.balance += (this.balanceTarget() - this.balance) * Math.min(1, dt * 0.25);
    const oppNow = this.balance < 50;
    if (oppNow !== this.oppHostile) {
      this.oppHostile = oppNow;
      const opp = organismsOfTier(this.tier).filter((o) => o.role === 'opportunist' && !this.countered.has(o.id));
      const names = opp.map((x) => o(x, 'name')).join(', ');
      if (opp.length) this.ui.toast(t(oppNow ? 'toast.balLow' : 'toast.balOk', { names }), oppNow ? 'warn' : 'good');
    }

    const bonus = this.bonuses();

    // Entities
    let attached = 0;
    let damage = 0;
    const attackers = [];
    const contactR = this.player.userData.radius + 1.0;
    for (const e of [...this.entities]) {
      e.t += dt;
      animateOrganism(e.vis, e.t, dt, e.phase);
      const pos = e.root.position;
      e.ring.position.y = -0.95 - pos.y;

      const key = this.ringKeyFor(e);
      if (key !== e.ringKey) { e.ringKey = key; e.ring.material.color.setHex(RING[key]); }

      if (e.state === 'contained') {
        e.ct += dt;
        if (e.ct < 0) continue;
        const s = Math.max(0.01, 1 - e.ct / 1.6);
        e.root.scale.setScalar(s);
        pos.y -= dt * 0.8;
        if (e.ct > 1.6) { this.energy = Math.min(100, this.energy + 3); this.removeEntity(e); }
        continue;
      }

      const dx = p.x - pos.x;
      const dz = p.z - pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 75) { this.removeEntity(e); continue; }

      if (e.state === 'ally') {
        if (e.org.speed === 0) continue;
        const a = e.allyAngle + this.time * 0.5;
        const tx = p.x + Math.cos(a) * 3.4;
        const tz = p.z + Math.sin(a) * 3.4;
        pos.x += (tx - pos.x) * Math.min(1, dt * 2.5);
        pos.z += (tz - pos.z) * Math.min(1, dt * 2.5);
        pos.y = e.hover + Math.sin(this.time * 2 + e.phase) * 0.2;
        continue;
      }

      const hostile = this.isHostile(e.org);
      const memory = this.countered.has(e.org.id);

      if (e.state === 'attached') {
        if (!hostile) { e.state = 'wander'; continue; }
        const a = e.attachAngle + this.time * 1.3;
        pos.set(p.x + Math.cos(a) * contactR * 0.85, p.y + 0.3 + Math.sin(this.time * 3 + e.phase) * 0.25, p.z + Math.sin(a) * contactR * 0.85);
        attached++;
        damage += e.org.dps * dt;
        attackers.push(e.org);
        continue;
      }

      let tx;
      let tz;
      let sp;
      if ((hostile || memory) && dist < 24 && e.org.speed > 0) {
        tx = p.x; tz = p.z; sp = e.org.speed;
        if (memory && dist < contactR + 0.6) { this.contain(e, 'memory'); continue; }
        if (hostile && dist < contactR && attached < 6) {
          e.state = 'attached';
          e.attachAngle = Math.atan2(pos.z - p.z, pos.x - p.x);
          continue;
        }
      } else {
        e.wt -= dt;
        if (e.wt <= 0 || Math.hypot(e.wx - pos.x, e.wz - pos.z) < 1) {
          e.wx = pos.x + (Math.random() - 0.5) * 18;
          e.wz = pos.z + (Math.random() - 0.5) * 18;
          const l = Math.hypot(e.wx, e.wz);
          if (l > ARENA - 2) { e.wx *= (ARENA - 2) / l; e.wz *= (ARENA - 2) / l; }
          e.wt = 3 + Math.random() * 4;
        }
        tx = e.wx; tz = e.wz; sp = e.org.speed * 0.4;
      }
      const mx = tx - pos.x;
      const mz = tz - pos.z;
      const ml = Math.hypot(mx, mz);
      if (ml > 0.01 && sp > 0) {
        pos.x += (mx / ml) * sp * dt;
        pos.z += (mz / ml) * sp * dt;
        if (e.org.category === 'Insect' || e.org.form === 'mite' || e.org.form === 'earthworm') e.root.rotation.y = Math.atan2(-mz, mx);
      }
      pos.y = e.hover + Math.sin(this.time * 1.6 + e.phase) * 0.15;
    }

    // Partner hunters keep their prey in check
    this.hunterTimer -= dt;
    if (this.hunterTimer <= 0) {
      this.hunterTimer = 5;
      for (const ally of bonus.hunters) {
        const prey = this.entities.find((e) => ally.bonus.hunts.includes(e.org.id) && e.state !== 'contained' && this.isHostile(e.org) && e.root.position.distanceTo(p) < 22);
        if (prey) { this.contain(prey, 'ally'); this.throttledToast('hunt' + ally.id, t('toast.hunt', { ally: o(ally, 'name'), prey: o(prey.org, 'name') }), 'good', 12); }
      }
    }

    // Integrity and energy
    if (damage > 0) {
      this.integrity -= damage;
      this.sound.hit();
      this.ui.flashDamage();
    } else {
      this.integrity = Math.min(100, this.integrity + (1 + bonus.regen) * dt);
    }
    this.energy = Math.min(100, this.energy + (1.6 + bonus.energy) * dt);
    if (this.integrity <= 0) {
      this.integrity = 0;
      this.over = true;
      const names = [...new Set(attackers.map((x) => (this.scanned.has(x.id) ? o(x, 'name') : t('over.unscanned', { cat: dict('cats', x.category, x.category).toLowerCase() }))))];
      this.ui.showOverwhelmed(names);
    }

    // Spawning
    this.spawnTimer -= dt;
    const live = this.entities.filter((e) => e.state !== 'contained' && e.state !== 'ally').length;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.4 + Math.random() * 1.2;
      if (live < 11 + this.tier * 2) this.spawnOne();
    }

    // Scanner
    const status = this.scanner.update(dt, p);
    if (status === 'scanning') this.sound.scanTick();
    this.scanStatus = status;

    // Evolution readiness
    const prog = this.progress();
    if (prog.ready && !this.wasEvolvable) {
      this.wasEvolvable = true;
      if (this.tier < TIERS.length - 1) {
        this.ui.toast(t('toast.canEvolve', { name: tierT(this.tier + 1).name }), 'good');
      } else if (!this.completed) {
        this.completed = true;
        this.save();
        this.ui.showComplete();
      }
    }

    // Ambient specks
    if (this.biome.userData.points) this.biome.userData.points.rotation.y += dt * 0.01;

    this.hudTimer -= dt;
    if (this.hudTimer <= 0) { this.hudTimer = 0.12; this.ui.updateHUD(this.hud(prog)); }
  }

  updateCamera(dt) {
    const c = this.controls;
    const p = this.player.position;
    const want = new THREE.Vector3(p.x, p.y + (this.tier === 3 ? 1.8 : 0.7), p.z);
    this.camTarget.lerp(want, 1 - Math.exp(-dt * 6));
    const t = this.camTarget;
    this.camera.position.set(
      t.x + Math.sin(c.yaw) * Math.cos(c.pitch) * c.dist,
      Math.max(0, t.y + Math.sin(c.pitch) * c.dist),
      t.z + Math.cos(c.yaw) * Math.cos(c.pitch) * c.dist,
    );
    this.camera.lookAt(t);

    const s = this.selected;
    this.marker.visible = !!s;
    this.beam.visible = false;
    if (s) {
      this.marker.position.set(s.root.position.x, -0.85, s.root.position.z);
      this.marker.scale.setScalar(s.org.size * 1.4 + 0.3);
      this.marker.rotation.z += dt * 1.5;
      if (this.scanStatus === 'scanning') {
        this.beam.visible = true;
        const arr = this.beam.geometry.attributes.position.array;
        arr[0] = p.x; arr[1] = p.y + 0.5; arr[2] = p.z;
        arr[3] = s.root.position.x; arr[4] = s.root.position.y; arr[5] = s.root.position.z;
        this.beam.geometry.attributes.position.needsUpdate = true;
        this.beam.material.opacity = 0.5 + Math.sin(this.time * 20) * 0.3;
      }
    }
  }

  hud(prog) {
    const s = this.selected;
    let target = null;
    if (s) {
      const known = this.scanned.has(s.org.id);
      const dist = s.root.position.distanceTo(this.player.position);
      const far = !known && this.scanStatus === 'far' ? Math.max(1, Math.ceil(dist - this.scanner.range)) : 0;
      target = { org: s.org, known, far, progress: known ? 1 : this.scanner.progress, ring: this.ringKeyFor(s) };
    }
    return {
      tier: this.tier, counters: prog.counters, allies: prog.allies, need: prog.need,
      ready: prog.ready && this.tier < TIERS.length - 1, ep: Math.round(this.ep),
      integrity: this.integrity, energy: this.energy, balance: this.balance,
      env: this.env, eventName: this.eventName, target,
    };
  }
}
