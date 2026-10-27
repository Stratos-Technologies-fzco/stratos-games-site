// World.js - the Eco Explorer "Nature Trail": a bright low-poly village with a
// river, pond, hill, fields and animals. Children tap where to go; missions ask
// the world to wait for a tap on one of the glowing goals (waitTap).
import * as THREE from 'three';

const C = {
  sky: 0xbfe6ff, dusk: 0x2a3560, grass: 0x86c96a, grass2: 0x74b85a, dirt: 0x9a6b43, wall: 0xf3e2c4, roof: 0xc0583e,
  trunk: 0x8a5a36, leaf: 0x3f9b4a, leaf2: 0x5cb85c, dirty: 0x7a6a4a, clean: 0x3fa7d6, skin: 0xf1c28e, shirt: 0xffb000,
};
const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const ARENA = 44;

function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }

// ---------- small builders ----------
export function buildTree(s = 1, leaf = C.leaf) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 1.6 * s, 6), lam(C.trunk), 0, 0.8 * s, 0));
  g.add(mesh(new THREE.IcosahedronGeometry(1.1 * s, 0), lam(leaf), 0, 2.2 * s, 0));
  g.add(mesh(new THREE.IcosahedronGeometry(0.8 * s, 0), lam(C.leaf2), 0.4 * s, 2.9 * s, 0.2 * s));
  return g;
}
function buildSapling() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 5), lam(0x5a8a3a), 0, 0.3, 0));
  const l = new THREE.SphereGeometry(0.16, 6, 4);
  g.add(mesh(l, lam(C.leaf2), 0.12, 0.55, 0), mesh(l, lam(C.leaf2), -0.12, 0.5, 0));
  return g;
}
function buildHut(roofColor = C.roof) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(3, 2, 3), lam(C.wall), 0, 1, 0));
  const roof = mesh(new THREE.ConeGeometry(2.6, 1.6, 4), lam(roofColor), 0, 2.8, 0);
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const win = mesh(new THREE.PlaneGeometry(0.8, 0.7), new THREE.MeshBasicMaterial({ color: 0x334455 }), 0, 1.1, 1.51);
  g.add(win, mesh(new THREE.PlaneGeometry(0.8, 1.3), lam(0x7a4a2a), -0.9, 0.65, 1.51));
  g.userData.window = win;
  return g;
}
function buildPlayer() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.1, 8), lam(C.shirt), 0, 0.85, 0));
  g.add(mesh(new THREE.SphereGeometry(0.38, 10, 8), lam(C.skin), 0, 1.65, 0));
  g.add(mesh(new THREE.SphereGeometry(0.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(0x2b1d14), 0, 1.72, -0.02));
  const leg = new THREE.CylinderGeometry(0.11, 0.11, 0.4, 5);
  g.add(mesh(leg, lam(0x33507a), -0.15, 0.2, 0), mesh(leg, lam(0x33507a), 0.15, 0.2, 0));
  g.add(mesh(new THREE.SphereGeometry(0.06, 6, 4), lam(0x111111), -0.13, 1.7, 0.34), mesh(new THREE.SphereGeometry(0.06, 6, 4), lam(0x111111), 0.13, 1.7, 0.34));
  return g;
}
const ANIMALS = {
  turtle() {
    const g = new THREE.Group();
    const shell = mesh(new THREE.SphereGeometry(0.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(0x4f7a3a), 0, 0.15, 0);
    g.add(shell, mesh(new THREE.SphereGeometry(0.2, 8, 6), lam(0x9bc47a), 0, 0.25, 0.65));
    const f = new THREE.SphereGeometry(0.13, 6, 4);
    for (const [x, z] of [[-0.4, 0.35], [0.4, 0.35], [-0.4, -0.35], [0.4, -0.35]]) g.add(mesh(f, lam(0x9bc47a), x, 0.1, z));
    return g;
  },
  chick() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.3, 10, 8), lam(0xffd84a), 0, 0.3, 0), mesh(new THREE.SphereGeometry(0.2, 8, 6), lam(0xffd84a), 0, 0.62, 0.12));
    const beak = mesh(new THREE.ConeGeometry(0.06, 0.16, 5), lam(0xff8a2a), 0, 0.6, 0.34);
    beak.rotation.x = Math.PI / 2;
    g.add(beak);
    return g;
  },
  frog() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.4, 10, 6), lam(0x4caf50), 0, 0.3, 0));
    const eye = new THREE.SphereGeometry(0.11, 6, 4);
    g.add(mesh(eye, lam(0xffffff), -0.17, 0.62, 0.22), mesh(eye, lam(0xffffff), 0.17, 0.62, 0.22));
    g.scale.set(1, 0.8, 1.1);
    return g;
  },
  butterfly() {
    const g = new THREE.Group();
    const w = new THREE.CircleGeometry(0.35, 8);
    const m = new THREE.MeshLambertMaterial({ color: 0xff8f3a, side: THREE.DoubleSide });
    const l = mesh(w, m, -0.3, 0, 0); const r = mesh(w, m, 0.3, 0, 0);
    l.rotation.x = r.rotation.x = -Math.PI / 2;
    g.add(l, r, mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 4), lam(0x222222), 0, 0, 0));
    g.children[2].rotation.x = Math.PI / 2;
    g.userData.wings = [l, r];
    return g;
  },
  peacock() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.35, 8, 6), lam(0x1f5fbf), 0, 0.6, 0.1), mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6), lam(0x1f5fbf), 0, 1.05, 0.3));
    g.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), lam(0x1f5fbf), 0, 1.4, 0.35));
    const fan = mesh(new THREE.CircleGeometry(1.1, 14, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0x2e8b57, side: THREE.DoubleSide }), 0, 0.6, -0.25);
    g.add(fan);
    for (let i = 0; i < 7; i++) {
      const a = (i + 0.5) / 7 * Math.PI;
      g.add(mesh(new THREE.CircleGeometry(0.1, 8), new THREE.MeshBasicMaterial({ color: 0x1a237e, side: THREE.DoubleSide }), Math.cos(a) * 0.85, 0.6 + Math.sin(a) * 0.85, -0.24));
    }
    return g;
  },
  earthworm() {
    const g = new THREE.Group();
    for (let i = 0; i < 7; i++) g.add(mesh(new THREE.SphereGeometry(0.11, 6, 4), lam(0xc77b6b), i * 0.16 - 0.5, 0.1 + Math.sin(i) * 0.04, Math.sin(i * 0.9) * 0.12));
    return g;
  },
  mushroom() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 6), lam(0xf5f0e0), 0, 0.25, 0));
    g.add(mesh(new THREE.SphereGeometry(0.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(0xd9483b), 0, 0.48, 0));
    return g;
  },
  bee() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.22, 8, 6), lam(0xf2c12e), 0, 0, 0), mesh(new THREE.TorusGeometry(0.2, 0.05, 4, 10), lam(0x222222), 0, 0, 0));
    const w = new THREE.CircleGeometry(0.18, 8);
    const m = new THREE.MeshLambertMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const l = mesh(w, m, -0.18, 0.18, 0); const r = mesh(w, m, 0.18, 0.18, 0);
    g.add(l, r);
    g.userData.wings = [l, r];
    return g;
  },
  ladybird() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(0xd32f2f), 0, 0.05, 0));
    g.add(mesh(new THREE.SphereGeometry(0.1, 6, 4), lam(0x111111), 0, 0.08, 0.25));
    for (const [x, z] of [[-0.1, 0.05], [0.1, 0.05], [0, -0.12]]) g.add(mesh(new THREE.SphereGeometry(0.05, 5, 4), lam(0x111111), x, 0.25, z));
    return g;
  },
  fish() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.3, 8, 6), lam(0xff9f43), 0, 0, 0));
    const tail = mesh(new THREE.ConeGeometry(0.18, 0.3, 4), lam(0xff9f43), -0.38, 0, 0);
    tail.rotation.z = Math.PI / 2;
    g.add(tail);
    g.scale.set(1, 0.6, 0.5);
    return g;
  },
};
function buildLitter(i) {
  const kinds = [
    () => mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7, 6), lam(0x9fd3ff, { transparent: true, opacity: 0.85 })),
    () => mesh(new THREE.BoxGeometry(0.6, 0.12, 0.5), lam(0xffffff)),
    () => mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8), lam(0xb0b0b0)),
    () => mesh(new THREE.TetrahedronGeometry(0.4), lam(0xe24a6a)),
  ];
  const m = kinds[i % kinds.length]();
  m.rotation.set(Math.random() * 3, Math.random() * 3, Math.PI / 2);
  const g = new THREE.Group();
  g.add(m);
  return g;
}
function buildSolar() {
  const g = new THREE.Group();
  const p = mesh(new THREE.BoxGeometry(1.6, 0.08, 1.1), lam(0x1e3a8a), 0, 0, 0);
  p.rotation.x = -0.4;
  g.add(p, mesh(new THREE.BoxGeometry(1.64, 0.02, 0.04), lam(0xdddddd), 0, 0.05, 0));
  return g;
}
function buildWindmill() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.15, 0.3, 6, 8), lam(0xf4f4f4), 0, 3, 0));
  const hub = new THREE.Group();
  hub.position.set(0, 6, 0.35);
  for (let i = 0; i < 3; i++) {
    const b = mesh(new THREE.BoxGeometry(0.18, 2.6, 0.05), lam(0xffffff), 0, 1.3, 0);
    const arm = new THREE.Group();
    arm.add(b);
    arm.rotation.z = (i * Math.PI * 2) / 3;
    hub.add(arm);
  }
  g.add(hub);
  g.userData.hub = hub;
  return g;
}

export class World {
  constructor(container, opts = {}) {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({ antialias: !coarse });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    container.appendChild(this.renderer.domElement);
    this.dom = this.renderer.domElement;
    this.dom.className = 'ex-gl';
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(C.sky);
    this.scene.fog = new THREE.Fog(C.sky, 60, 120);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x6a8a4a, 1.1);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sun.position.set(20, 40, 15);
    this.scene.add(this.hemi, this.sun);
    this.zoom = 1;
    this.things = [];
    this.goals = [];
    this.pending = null;
    this.tweens = [];
    this.anims = [];
    this.onWrong = null;
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.time = 0;
    this.keys = {};
    this.build(opts.trees || 0);
    this.bindInput();
    window.addEventListener('resize', this.resizeFn = () => this.resize());
    this.resize();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.resizeFn);
    window.removeEventListener('keydown', this.kd);
    window.removeEventListener('keyup', this.ku);
    this.renderer.dispose();
    this.dom.remove();
  }

  resize() {
    const w = window.innerWidth; const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // A tappable thing. approach(playerPos) gives the point to walk to.
  addThing(id, obj, x, z, opts = {}) {
    obj.position.set(x, opts.y || 0, z);
    this.scene.add(obj);
    const th = { id, obj, radius: opts.radius || 1.2, approach: opts.approach || null, data: opts.data || {} };
    const hit = mesh(new THREE.SphereGeometry(th.radius * 1.3, 8, 6), new THREE.MeshBasicMaterial({ visible: false }), 0, opts.hitY ?? 0.8, 0);
    hit.userData.thing = th;
    obj.add(hit);
    th.hit = hit;
    this.things.push(th);
    return th;
  }
  removeThing(th) {
    this.things = this.things.filter((t) => t !== th);
    th.obj.remove(th.hit);
    th.removed = true;
  }
  approachPoint(th) {
    if (th.approach) return th.approach(this.player.position);
    const p = th.obj.position; const me = this.player.position;
    const d = new THREE.Vector3(me.x - p.x, 0, me.z - p.z);
    const len = d.length() || 1;
    const r = th.radius + 0.9;
    return new THREE.Vector3(p.x + (d.x / len) * r, 0, p.z + (d.z / len) * r);
  }

  build(treeCount) {
    const s = this.scene;
    const ground = mesh(new THREE.PlaneGeometry(140, 140), lam(C.grass), 0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    s.add(ground);
    this.ground = ground;
    // grass tufts and flowers for colour
    const tuft = new THREE.ConeGeometry(0.12, 0.5, 4);
    const rnd = mulberry(7);
    for (let i = 0; i < 160; i++) {
      const x = (rnd() - 0.5) * 90; const z = (rnd() - 0.5) * 90;
      if (Math.abs(z + 20) < 6) continue;
      s.add(mesh(tuft, lam(i % 5 ? C.grass2 : [0xff6fa8, 0xffe14a, 0xffffff][i % 3]), x, 0.25, z));
    }
    // river (colour shows how clean it is)
    this.riverMat = lam(C.dirty);
    const river = mesh(new THREE.PlaneGeometry(140, 8), this.riverMat, 0, 0.03, -20);
    river.rotation.x = -Math.PI / 2;
    s.add(river);
    for (const z of [-15.8, -24.2]) { const bank = mesh(new THREE.BoxGeometry(140, 0.25, 0.6), lam(0xc9b27a), 0, 0.1, z); s.add(bank); }
    this.river = this.addThing('river', new THREE.Group(), 0, -20, { radius: 3, hitY: 0, approach: (p) => new THREE.Vector3(Math.max(-ARENA, Math.min(ARENA, p.x)), 0, -14.6) });
    this.river.hit.scale.set(30, 0.3, 2);
    this.river.marker = () => { const a = this.river.approach(this.player.position); return new THREE.Vector3(a.x, 0, -17.6); };
    this.river.arrowY = 2.2;
    this.setRiverClean(0);
    // pond
    const pond = mesh(new THREE.CircleGeometry(4, 24), lam(C.clean), 0, 0.04, 0);
    pond.rotation.x = -Math.PI / 2;
    this.pond = this.addThing('pond', new THREE.Group(), 24, 16, { radius: 4, hitY: 0.2 });
    this.pond.obj.add(pond);
    // hill for the windmill
    const hill = mesh(new THREE.SphereGeometry(10, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lam(0x6fae55), 0, -5.5, 0);
    this.hill = this.addThing('hill', new THREE.Group(), -32, 24, { radius: 6, hitY: 2.5, approach: () => new THREE.Vector3(-30, 0, 14.5) });
    this.hill.obj.add(hill);
    this.hill.arrowY = 7;
    // village huts (roofs take solar panels)
    this.huts = [[6, -7], [13, -4], [8, 2], [15, 5]].map(([x, z], i) => {
      const h = buildHut(i % 2 ? 0xd7793e : C.roof);
      return this.addThing(`hut${i}`, h, x, z, { radius: 1.8, hitY: 1.5 });
    });
    // seed shed
    const shed = buildHut(0x3f9b4a);
    shed.scale.setScalar(0.8);
    for (let i = 0; i < 3; i++) { const sp = buildSapling(); sp.position.set(-1.2 + i * 0.5, 0, 1.6); shed.add(sp); }
    this.shed = this.addThing('shed', shed, -6, 7, { radius: 1.6, hitY: 1.2 });
    // the big tree with a nest
    const big = buildTree(1.8);
    const nest = mesh(new THREE.TorusGeometry(0.4, 0.15, 5, 10), lam(0x7a5230), 0.9, 3.6, 0.6);
    nest.rotation.x = Math.PI / 2;
    big.add(nest);
    this.nestPos = new THREE.Vector3(0.9, 3.75, 0.6);
    this.nestTree = this.addThing('nestTree', big, 22, -6, { radius: 1.6, hitY: 2 });
    // dry pit
    const pit = mesh(new THREE.CircleGeometry(1.1, 16), lam(0x5a4632), 0, 0.05, 0);
    pit.rotation.x = -Math.PI / 2;
    this.pit = new THREE.Group();
    this.pit.add(pit);
    this.pit.position.set(3, 0, 13);
    s.add(this.pit);
    // trees around the edge (and the ones the child has planted)
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2; const r = 40 + rnd() * 6;
      const t = buildTree(0.9 + rnd() * 0.8);
      t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      if (Math.abs(t.position.z + 20) > 6) s.add(t);
    }
    this.planted = [];
    for (let i = 0; i < Math.min(treeCount, 40); i++) this.addPlantedTree(i, false);
    // player
    this.player = buildPlayer();
    this.player.position.set(0, 0, 6);
    s.add(this.player);
    this.carried = null;
    // goal markers
    this.ringGeo = new THREE.RingGeometry(0.9, 1.2, 32);
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xffe14a, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    this.arrowGeo = new THREE.ConeGeometry(0.35, 0.8, 4);
    this.arrowMat = new THREE.MeshBasicMaterial({ color: 0xffe14a });
    this.markers = [];
    this.moveTarget = null;
    this.fish = [];
  }

  addPlantedTree(i, grow = true) {
    const col = i % 8; const row = Math.floor(i / 8);
    const t = buildTree(0.75 + (i % 3) * 0.1, i % 2 ? C.leaf : 0x4caf50);
    t.position.set(-34 + col * 3.2, 0, 2 + row * 3.2);
    this.scene.add(t);
    this.planted.push(t);
    if (grow) this.grow(t);
    return t;
  }

  grow(obj, to = 1) {
    obj.scale.setScalar(0.05);
    this.tweens.push({ obj, from: 0.05, to, t: 0, dur: 1.4 });
  }

  setRiverClean(f) {
    this.riverMat.color.setHex(C.dirty).lerp(new THREE.Color(C.clean), f);
  }

  addFish(n = 5) {
    for (let i = 0; i < n; i++) {
      const f = ANIMALS.fish();
      f.position.set(-20 + i * 9, 0.15, -20 + (i % 2 ? 1.5 : -1.5));
      f.userData.phase = i;
      this.scene.add(f);
      this.fish.push(f);
    }
  }

  setDusk(f) {
    this.scene.background.setHex(C.sky).lerp(new THREE.Color(C.dusk), f);
    this.scene.fog.color.copy(this.scene.background);
    this.sun.intensity = 1.2 - f * 0.9;
    this.hemi.intensity = 1.1 - f * 0.6;
  }
  lightHomes(on) {
    for (const h of this.huts) h.obj.userData.window.material.color.setHex(on ? 0xffe680 : 0x334455);
  }

  // Fresh brown planting patches for each plant-a-tree mission.
  makePatches() {
    return [[-17, -9], [-21, -5], [-14, -4]].map(([x, z], i) => {
      const d = mesh(new THREE.CircleGeometry(1, 14), lam(C.dirt), 0, 0.05, 0);
      d.rotation.x = -Math.PI / 2;
      const g = new THREE.Group();
      g.add(d);
      return this.addThing(`patch${i}`, g, x, z, { radius: 1, hitY: 0.3 });
    });
  }
  makeCan() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.5, 10), lam(0x2f80ed), 0, 0, 0));
    const spout = mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 6), lam(0x2f80ed), 0.35, 0.1, 0);
    spout.rotation.z = -1;
    g.add(spout);
    return g;
  }
  vec(x, y, z) { return new THREE.Vector3(x, y, z); }
  // Remove panels and windmill from an earlier clean-energy mission, and bring back daylight.
  resetEnergy() {
    for (const o of this.energyObjs || []) o.parent && o.parent.remove(o);
    this.energyObjs = [];
    this.setDusk(0);
    this.lightHomes(false);
  }
  makeAnimal(kind) { return ANIMALS[kind](); }
  makeSapling() { return buildSapling(); }
  makeSolar() { return buildSolar(); }
  makeWindmill() { const w = buildWindmill(); this.anims.push((dt) => { w.userData.hub.rotation.z += dt * 2; }); return w; }
  makeLitter(i) { return buildLitter(i); }

  carry(obj) {
    if (this.carried) this.player.remove(this.carried);
    this.carried = obj;
    if (obj) { obj.position.set(0, 2.3, 0.2); obj.rotation.set(0, 0, 0); this.player.add(obj); }
  }

  // ---------- goals ----------
  setGoals(goals) {
    for (const m of this.markers) this.scene.remove(m);
    this.markers = [];
    this.goals = goals;
    for (const g of goals) {
      const ring = mesh(this.ringGeo, this.ringMat, 0, 0.12, 0);
      ring.rotation.x = -Math.PI / 2;
      const r = Math.max(1, g.radius);
      ring.scale.setScalar(r);
      const arrow = mesh(this.arrowGeo, this.arrowMat);
      arrow.rotation.x = Math.PI;
      const p = g.marker ? g.marker() : g.obj.position;
      ring.position.set(p.x, 0.12, p.z);
      arrow.position.set(p.x, (g.arrowY || 3.2), p.z);
      arrow.userData.baseY = arrow.position.y;
      this.scene.add(ring, arrow);
      this.markers.push(ring, arrow);
    }
  }

  // Resolves with the goal the child reaches; rejects with 'abort' if stopped.
  waitTap(goals) {
    if (this.pending) this.pending.rej('abort');
    return new Promise((res, rej) => {
      this.pending = { goals, res, rej };
      this.setGoals(goals);
    });
  }
  abort() {
    if (this.pending) { const p = this.pending; this.pending = null; this.setGoals([]); p.rej('abort'); }
    this.moveTarget = null;
  }

  // ---------- input ----------
  bindInput() {
    let down = null;
    this.dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    this.dom.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved < 12) this.tap(e.clientX, e.clientY);
    });
    this.dom.addEventListener('wheel', (e) => { this.zoom = Math.max(0.6, Math.min(1.6, this.zoom + Math.sign(e.deltaY) * 0.1)); }, { passive: true });
    this.kd = (e) => { this.keys[e.key.toLowerCase()] = true; };
    this.ku = (e) => { this.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', this.kd);
    window.addEventListener('keyup', this.ku);
  }

  tap(cx, cy) {
    const rect = this.dom.getBoundingClientRect();
    this.ndc.set(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.things.map((t) => t.hit), false);
    // Prefer a goal if one was hit; else the nearest thing.
    const goalHit = hits.find((h) => this.goals.includes(h.object.userData.thing));
    const th = goalHit ? goalHit.object.userData.thing : hits[0] && hits[0].object.userData.thing;
    if (th && this.goals.includes(th)) { this.goTo(th); return; }
    if (th && this.pending && this.onWrong) this.onWrong(th);
    const g = this.raycaster.intersectObject(this.ground, false)[0];
    if (g) this.moveTarget = { pos: new THREE.Vector3(g.point.x, 0, g.point.z), th: null };
  }

  goTo(th) {
    this.moveTarget = { pos: this.approachPoint(th), th };
  }

  arrive(th) {
    if (!this.pending || !this.pending.goals.includes(th)) return;
    const p = this.pending;
    this.pending = null;
    this.setGoals([]);
    p.res(th);
  }

  // ---------- loop ----------
  frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt;
    const p = this.player.position;
    // keyboard movement
    let kx = (this.keys.d || this.keys.arrowright ? 1 : 0) - (this.keys.a || this.keys.arrowleft ? 1 : 0);
    let kz = (this.keys.s || this.keys.arrowdown ? 1 : 0) - (this.keys.w || this.keys.arrowup ? 1 : 0);
    let moving = false;
    if (kx || kz) {
      const l = Math.hypot(kx, kz); kx /= l; kz /= l;
      p.x += kx * 7 * dt; p.z += kz * 7 * dt;
      this.player.rotation.y = Math.atan2(kx, kz);
      this.moveTarget = null;
      moving = true;
      // reaching a goal on foot counts too
      for (const g of this.goals) { const a = this.approachPoint(g); if (Math.hypot(a.x - p.x, a.z - p.z) < 1.4) { this.arrive(g); break; } }
    } else if (this.moveTarget) {
      const t = this.moveTarget.pos;
      const dx = t.x - p.x; const dz = t.z - p.z; const d = Math.hypot(dx, dz);
      if (d < 0.25) {
        const th = this.moveTarget.th;
        this.moveTarget = null;
        if (th) this.arrive(th);
      } else {
        const step = Math.min(d, 7 * dt);
        p.x += (dx / d) * step; p.z += (dz / d) * step;
        this.player.rotation.y = Math.atan2(dx, dz);
        moving = true;
      }
    }
    p.x = Math.max(-ARENA, Math.min(ARENA, p.x));
    p.z = Math.max(-14.6, Math.min(ARENA, p.z));
    this.player.position.y = moving ? Math.abs(Math.sin(this.time * 12)) * 0.12 : 0;
    // camera follows from behind and above
    // Pull back on tall phone screens so the child still sees around them.
    const z = this.zoom * (this.camera.aspect < 1 ? Math.min(1.9, 0.85 / this.camera.aspect) : 1);
    const want = new THREE.Vector3(p.x, 13 * z, p.z + 15 * z);
    this.camera.position.lerp(want, Math.min(1, dt * 4));
    this.camera.lookAt(p.x, 1, p.z - 2);
    // markers
    for (const m of this.markers) {
      if (m.userData.baseY !== undefined) m.position.y = m.userData.baseY + Math.sin(this.time * 4) * 0.3;
      else m.scale.setScalar((m.userData.s0 || (m.userData.s0 = m.scale.x)) * (1 + Math.sin(this.time * 5) * 0.08));
    }
    this.ringMat.opacity = 0.6 + Math.sin(this.time * 5) * 0.3;
    // tweens and little animations
    this.tweens = this.tweens.filter((tw) => {
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      const e = 1 - Math.pow(1 - k, 3);
      tw.obj.scale.setScalar(tw.from + (tw.to - tw.from) * e);
      if (k >= 1 && tw.done) tw.done();
      return k < 1;
    });
    for (const f of this.anims) f(dt, this.time);
    for (const f of this.fish) { f.position.x += Math.sin(this.time + f.userData.phase) * dt * 2; f.rotation.y = Math.cos(this.time + f.userData.phase) > 0 ? 0 : Math.PI; }
    this.renderer.render(this.scene, this.camera);
  }
}

function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
