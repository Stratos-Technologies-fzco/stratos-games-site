// Organisms.js - low-poly procedural meshes for every organism form, the
// player's four bodies, and the four biomes. Microbes are shown magnified.
import * as THREE from 'three';

const geoCache = {};
const G = (key, make) => geoCache[key] || (geoCache[key] = make());
const UP = new THREE.Vector3(0, 1, 0);

const sphere = () => G('sph', () => new THREE.SphereGeometry(1, 14, 10));
const lowSphere = () => G('sphLo', () => new THREE.SphereGeometry(1, 8, 6));
const cyl = () => G('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 7));
const cone = () => G('cone', () => new THREE.ConeGeometry(1, 1, 6));

function mat(color, extra = {}) {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.05, emissive: c.clone().multiplyScalar(0.22), flatShading: true, ...extra });
}

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function ball(m, r, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, lo = false) {
  const mesh = new THREE.Mesh(lo ? lowSphere() : sphere(), m);
  mesh.scale.set(r * sx, r * sy, r * sz);
  mesh.position.set(x, y, z);
  return mesh;
}

// Cylinder from point a to point b.
function limb(m, a, b, r) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(cyl(), m);
  mesh.scale.set(r, len, r);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- organism forms ----------
function phage(c) {
  const g = new THREE.Group();
  const m = mat(c);
  const head = new THREE.Mesh(G('ico', () => new THREE.IcosahedronGeometry(0.42, 0)), m);
  head.position.y = 1.05;
  g.add(head);
  g.add(limb(m, V(0, 0.68, 0), V(0, 0.22, 0), 0.07));
  const plate = new THREE.Mesh(G('hex', () => new THREE.CylinderGeometry(0.2, 0.2, 0.06, 6)), m);
  plate.position.y = 0.2;
  g.add(plate);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const knee = V(Math.cos(a) * 0.38, 0.1, Math.sin(a) * 0.38);
    g.add(limb(m, V(0, 0.2, 0), knee, 0.022));
    g.add(limb(m, knee, V(Math.cos(a) * 0.55, -0.25, Math.sin(a) * 0.55), 0.02));
  }
  g.position.y = -0.4;
  const w = new THREE.Group();
  w.add(g);
  w.userData.spin = 0.6;
  return w;
}

function rod(c, flag = true) {
  const g = new THREE.Group();
  const m = mat(c);
  const body = new THREE.Mesh(G('caps', () => new THREE.CapsuleGeometry(0.28, 0.8, 4, 10)), m);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  if (flag) {
    const pts = [];
    for (let i = 0; i <= 12; i++) pts.push(V(-0.65 - i * 0.09, Math.sin(i * 0.9) * 0.1, Math.cos(i * 0.9) * 0.1));
    const tube = new THREE.Mesh(G('flag', () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.025, 4)), mat(c, { roughness: 0.8 }));
    g.add(tube);
    g.userData.flag = tube;
  }
  g.userData.tumble = 0.7;
  return g;
}

function cocci(c, n = 5) {
  const g = new THREE.Group();
  const m = mat(c);
  for (let i = 0; i < n; i++) {
    const t = i - (n - 1) / 2;
    g.add(ball(m, 0.27, t * 0.48, Math.sin(i * 0.9) * 0.15, Math.cos(i * 0.7) * 0.12));
  }
  g.userData.tumble = 0.5;
  return g;
}

function filament(c, seed, tips = true, beads = false) {
  const g = new THREE.Group();
  const m = mat(c);
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const el = (r() - 0.3) * 0.8;
    const len = 0.8 + r() * 0.7;
    const end = V(Math.cos(a) * Math.cos(el) * len, Math.sin(el) * len, Math.sin(a) * Math.cos(el) * len);
    g.add(limb(m, V(0, 0, 0), end, 0.05));
    const b = end.clone().add(V((r() - 0.5) * 0.7, r() * 0.5, (r() - 0.5) * 0.7));
    g.add(limb(m, end, b, 0.035));
    if (tips) g.add(ball(m, 0.08, b.x, b.y, b.z, 1, 1, 1, true));
    if (beads) for (let k = 1; k < 4; k++) { const p = end.clone().lerp(b, k / 4); g.add(ball(m, 0.06, p.x, p.y, p.z, 1, 1, 1, true)); }
  }
  g.add(ball(m, 0.18));
  g.userData.spin = 0.2;
  return g;
}

function mold(c, seed, head) {
  const g = filament(c, seed, false);
  const m = mat(c);
  const top = V(0, 1.25, 0);
  g.add(limb(m, V(0, 0, 0), top, 0.06));
  const r = rng(seed + 7);
  if (head === 'asp') {
    g.add(ball(m, 0.22, 0, top.y, 0));
    for (let i = 0; i < 18; i++) {
      const d = V(r() - 0.5, r() * 0.9, r() - 0.5).normalize();
      for (let k = 1; k <= 2; k++) g.add(ball(mat(0x4f8f6f), 0.07, d.x * (0.22 + k * 0.12), top.y + d.y * (0.22 + k * 0.12), d.z * (0.22 + k * 0.12), 1, 1, 1, true));
    }
  } else if (head === 'bot') {
    for (let b = 0; b < 4; b++) {
      const a = (b / 4) * Math.PI * 2;
      const end = V(Math.cos(a) * 0.35, top.y + 0.25, Math.sin(a) * 0.35);
      g.add(limb(m, top, end, 0.03));
      for (let i = 0; i < 5; i++) g.add(ball(m, 0.09, end.x + (r() - 0.5) * 0.22, end.y + (r() - 0.5) * 0.2, end.z + (r() - 0.5) * 0.22, 1, 1.2, 1, true));
    }
  } else if (head === 'mag') {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const p = V(Math.cos(a) * 0.22, top.y + 0.15, Math.sin(a) * 0.22);
      const s = ball(m, 0.13, p.x, p.y, p.z, 0.7, 1.4, 0.7);
      g.add(s);
    }
  } else if (head === 'bea') {
    for (let i = 0; i < 26; i++) {
      const d = V(r() - 0.5, r() - 0.2, r() - 0.5).normalize().multiplyScalar(0.25 + r() * 0.25);
      g.add(ball(m, 0.06, d.x, top.y + d.y, d.z, 1, 1, 1, true));
    }
  }
  return g;
}

function yeast(c) {
  const g = new THREE.Group();
  const m = mat(c);
  g.add(ball(m, 0.42));
  g.add(ball(m, 0.24, 0.5, 0.25, 0));
  g.add(ball(m, 0.14, 0.75, 0.42, 0.05));
  g.add(limb(m, V(-0.3, -0.1, 0), V(-1.1, -0.2, 0.3), 0.06));
  g.add(limb(m, V(-1.1, -0.2, 0.3), V(-1.5, 0.1, 0.1), 0.05));
  g.userData.tumble = 0.4;
  return g;
}

function oomycete(c, seed) {
  const g = new THREE.Group();
  const m = mat(c);
  const r = rng(seed);
  g.add(ball(m, 0.16));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + r();
    const mid = V(Math.cos(a) * 0.3, 0.6 + r() * 0.3, Math.sin(a) * 0.3);
    const end = V(Math.cos(a) * 0.65, 1.05 + r() * 0.3, Math.sin(a) * 0.65);
    g.add(limb(m, V(0, 0, 0), mid, 0.04));
    g.add(limb(m, mid, end, 0.035));
    const s = ball(mat(0xdfe8f2), 0.13, end.x, end.y + 0.12, end.z, 0.75, 1.25, 0.75);
    g.add(s);
  }
  g.position.y = -0.4;
  const w = new THREE.Group();
  w.add(g);
  w.userData.spin = 0.3;
  return w;
}

function virus(c) {
  const g = new THREE.Group();
  const m = mat(c);
  g.add(ball(m, 0.42));
  const sm = mat(0xffffff);
  const n = 26;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    const d = V(Math.cos(th) * rad, y, Math.sin(th) * rad);
    const s = new THREE.Mesh(cone(), i % 3 ? m : sm);
    s.scale.set(0.06, 0.2, 0.06);
    s.position.copy(d).multiplyScalar(0.5);
    s.quaternion.setFromUnitVectors(UP, d);
    g.add(s);
  }
  g.userData.tumble = 0.8;
  return g;
}

function rodvirus(c) {
  const g = new THREE.Group();
  const m = mat(c);
  const body = new THREE.Mesh(cyl(), m);
  body.scale.set(0.12, 1.8, 0.12);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const rm = mat(0x6f9f4a);
  for (let i = 0; i < 9; i++) {
    const t = new THREE.Mesh(G('ring', () => new THREE.TorusGeometry(0.13, 0.025, 4, 10)), rm);
    t.rotation.y = Math.PI / 2;
    t.position.x = -0.8 + i * 0.2;
    g.add(t);
  }
  g.userData.tumble = 0.6;
  return g;
}

function legs(g, m, n, spread, len, y = 0, r = 0.025) {
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const k = Math.floor(i / 2);
    const x = (k - (n / 2 - 1) / 2) * spread;
    const hip = V(x, y, side * 0.12);
    const knee = V(x + 0.05 * (k - 1), y + len * 0.35, side * (0.12 + len * 0.6));
    const foot = V(x + 0.1 * (k - 1), y - len * 0.6, side * (0.14 + len * 0.9));
    g.add(limb(m, hip, knee, r));
    g.add(limb(m, knee, foot, r * 0.8));
  }
}

function wingPair(g, color, x, y, w, l) {
  const wm = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.3 });
  const wings = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, side * 0.05);
    const p = new THREE.Mesh(G('wing', () => { const gg = new THREE.PlaneGeometry(1, 1); gg.translate(0, 0.5, 0); return gg; }), wm);
    p.scale.set(w, l, 1);
    p.rotation.x = side * Math.PI / 2;
    pivot.add(p);
    pivot.userData.side = side;
    g.add(pivot);
    wings.push(pivot);
  }
  g.userData.wings = (g.userData.wings || []).concat(wings);
}

function aphid(c) {
  const g = new THREE.Group();
  const m = mat(c);
  g.add(ball(m, 0.36, -0.05, 0, 0, 1.3, 0.85, 1));
  g.add(ball(m, 0.16, 0.42, 0.05, 0));
  const dm = mat(0x4f7f30);
  g.add(limb(dm, V(-0.35, 0.18, 0.12), V(-0.6, 0.35, 0.18), 0.03));
  g.add(limb(dm, V(-0.35, 0.18, -0.12), V(-0.6, 0.35, -0.18), 0.03));
  g.add(limb(dm, V(0.5, 0.1, 0.05), V(0.85, 0.35, 0.2), 0.015));
  g.add(limb(dm, V(0.5, 0.1, -0.05), V(0.85, 0.35, -0.2), 0.015));
  legs(g, dm, 6, 0.2, 0.35, -0.1, 0.018);
  return g;
}

function locust(c) {
  const g = new THREE.Group();
  const m = mat(c);
  const body = new THREE.Mesh(G('capsL', () => new THREE.CapsuleGeometry(0.17, 1.0, 4, 8)), m);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  g.add(ball(m, 0.2, 0.65, 0.05, 0, 1, 1.1, 0.9));
  const wm = mat(0xa58a4a);
  const wing = new THREE.Mesh(G('box', () => new THREE.BoxGeometry(1, 1, 1)), wm);
  wing.scale.set(1.05, 0.04, 0.3);
  wing.position.set(-0.15, 0.2, 0);
  g.add(wing);
  const lm = mat(0x9a7a30);
  for (const s of [-1, 1]) {
    g.add(limb(lm, V(-0.1, -0.05, s * 0.14), V(-0.45, 0.45, s * 0.3), 0.05));
    g.add(limb(lm, V(-0.45, 0.45, s * 0.3), V(-0.85, -0.3, s * 0.35), 0.03));
  }
  legs(g, lm, 4, 0.3, 0.3, -0.08, 0.022);
  g.userData.hop = true;
  return g;
}

function ladybird(c) {
  const g = new THREE.Group();
  const m = mat(c);
  g.add(ball(m, 0.42, 0, 0.05, 0, 1.1, 0.65, 1));
  const black = mat(0x111111, { emissive: 0x000000 });
  g.add(ball(black, 0.18, 0.45, 0, 0));
  const spots = [[0, 0.32, 0], [0.18, 0.25, 0.22], [0.18, 0.25, -0.22], [-0.2, 0.24, 0.24], [-0.2, 0.24, -0.24], [-0.05, 0.3, 0.12], [-0.05, 0.3, -0.12]];
  for (const [x, y, z] of spots.slice(0, 7)) g.add(ball(black, 0.07, x, y, z, 1, 0.4, 1, true));
  legs(g, black, 6, 0.2, 0.25, -0.12, 0.02);
  return g;
}

function mosquito(c) {
  const g = new THREE.Group();
  const m = mat(c);
  const body = new THREE.Mesh(G('capsM', () => new THREE.CapsuleGeometry(0.07, 0.8, 4, 6)), m);
  body.rotation.z = Math.PI / 2 - 0.2;
  g.add(body);
  g.add(ball(m, 0.12, 0.5, 0.15, 0));
  g.add(limb(m, V(0.6, 0.12, 0), V(1.05, -0.05, 0), 0.012));
  legs(g, m, 6, 0.12, 0.8, 0, 0.012);
  wingPair(g, 0xdfe6f0, 0.1, 0.12, 0.25, 0.75);
  return g;
}

function mite(c) {
  const g = new THREE.Group();
  const m = mat(c);
  g.add(ball(m, 0.42, 0, 0, 0, 0.85, 0.42, 1.05));
  legs(g, mat(0x5a2a1a), 8, 0.12, 0.3, -0.05, 0.022);
  g.children.slice(1).forEach((l) => { l.position.x += 0.25; });
  return g;
}

function protist() {
  const g = new THREE.Group();
  const rbc = mat(0xc8465a);
  const t = new THREE.Mesh(G('rbc', () => new THREE.TorusGeometry(0.4, 0.17, 8, 18)), rbc);
  t.rotation.x = Math.PI / 2;
  g.add(t);
  const disk = new THREE.Mesh(cyl(), mat(0xd86a78));
  disk.scale.set(0.42, 0.12, 0.42);
  g.add(disk);
  const pm = mat(0x7a5ad0);
  const ring = new THREE.Mesh(G('pring', () => new THREE.TorusGeometry(0.13, 0.035, 6, 14)), pm);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0.1, 0.1, 0.05);
  g.add(ring);
  g.add(ball(pm, 0.05, 0.22, 0.12, 0.05));
  g.userData.tumble = 0.4;
  return g;
}

function cluster(c, seed) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let i = 0; i < 6; i++) {
    const part = i % 2 ? rod(i % 3 ? c : 0x7fc0a0, false) : cocci(0xb6dc8a, 2);
    part.scale.setScalar(0.55);
    part.position.set((r() - 0.5) * 1.1, (r() - 0.5) * 0.6, (r() - 0.5) * 1.1);
    part.rotation.set(r() * 3, r() * 3, r() * 3);
    g.add(part);
  }
  g.userData.spin = 0.4;
  return g;
}

function tree(c) {
  const g = new THREE.Group();
  g.add(limb(mat(0x6b4f35), V(0, -0.8, 0), V(0, 0.6, 0), 0.12));
  const leaf = mat(c);
  for (let i = 0; i < 3; i++) {
    const k = new THREE.Mesh(cone(), leaf);
    k.scale.set(0.75 - i * 0.18, 0.8, 0.75 - i * 0.18);
    k.position.y = 0.4 + i * 0.45;
    g.add(k);
  }
  const amber = mat(0xe8a33d, { roughness: 0.2 });
  for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(ball(amber, 0.07, Math.cos(a) * 0.45, 0.5 + (i % 3) * 0.4, Math.sin(a) * 0.45, 1, 1, 1, true)); }
  return g;
}

function swarm(c, seed) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const p = rod(c, false);
    p.scale.setScalar(0.45);
    const a = (i / 9) * Math.PI * 2;
    p.position.set(Math.cos(a) * (0.5 + r() * 0.4), (r() - 0.5) * 0.3, Math.sin(a) * (0.5 + r() * 0.4));
    p.rotation.y = -a;
    g.add(p);
  }
  g.userData.spin = 0.8;
  return g;
}

function diatom(c) {
  const g = new THREE.Group();
  g.add(ball(new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.2, emissive: new THREE.Color(c).multiplyScalar(0.25) }), 0.5, 0, 0, 0, 1.5, 0.35, 0.55));
  const plastid = mat(0x8a6a2a);
  g.add(ball(plastid, 0.3, 0, 0, 0.12, 1.6, 0.4, 0.35));
  g.add(ball(plastid, 0.3, 0, 0, -0.12, 1.6, 0.4, 0.35));
  const raphe = new THREE.Mesh(G('box', () => new THREE.BoxGeometry(1, 1, 1)), mat(0xf2ecc8));
  raphe.scale.set(1.3, 0.02, 0.03);
  raphe.position.y = 0.18;
  g.add(raphe);
  g.userData.tumble = 0.4;
  return g;
}

function lichen(c, seed) {
  const g = new THREE.Group();
  const r = rng(seed);
  const m = mat(c);
  const dark = mat(0x4a3a2a);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.4;
    const d = 0.25 + r() * 0.35;
    const lobe = ball(m, 0.32 + r() * 0.12, Math.cos(a) * d, (r() - 0.5) * 0.08, Math.sin(a) * d, 1, 0.16, 0.7);
    lobe.rotation.y = -a;
    lobe.rotation.z = (r() - 0.5) * 0.5;
    g.add(lobe);
  }
  for (let i = 0; i < 4; i++) { const a = r() * 6.28; g.add(ball(dark, 0.08, Math.cos(a) * 0.3, 0.07, Math.sin(a) * 0.3, 1, 0.4, 1, true)); }
  g.userData.spin = 0.15;
  return g;
}

function termite(c) {
  const g = new THREE.Group();
  const pale = mat(c);
  const head = mat(0xa0682a);
  g.add(ball(pale, 0.3, -0.35, 0, 0, 1.4, 0.75, 0.9));
  g.add(ball(pale, 0.17, 0.05, 0, 0));
  g.add(ball(head, 0.2, 0.32, 0.03, 0, 1.2, 0.9, 1));
  g.add(limb(head, V(0.48, 0, 0.06), V(0.68, -0.02, 0.0), 0.025));
  g.add(limb(head, V(0.48, 0, -0.06), V(0.68, -0.02, 0.0), 0.025));
  legs(g, head, 6, 0.14, 0.28, -0.05, 0.018);
  return g;
}

function earthworm(c) {
  const g = new THREE.Group();
  const m = mat(c);
  const clitellum = mat(0xe0a090);
  const segs = [];
  for (let i = 0; i < 16; i++) {
    const s = ball(i === 4 || i === 5 ? clitellum : m, 0.15 - Math.abs(i - 7) * 0.004, (i - 8) * 0.13, 0, 0, 1.1, 1, 1, true);
    g.add(s);
    segs.push(s);
  }
  g.userData.worm = segs;
  return g;
}

function hornet(c) {
  const g = new THREE.Group();
  const orange = mat(c);
  const dark = mat(0x2a1a10, { emissive: 0x000000 });
  for (let i = 0; i < 4; i++) g.add(ball(i % 2 ? orange : dark, 0.3 - i * 0.03, -0.35 - i * 0.18, 0, 0, 0.6, 1, 1));
  g.add(ball(dark, 0.26, 0.1, 0.05, 0));
  g.add(ball(orange, 0.21, 0.45, 0.05, 0));
  legs(g, mat(0xe8c040), 6, 0.15, 0.35, -0.15, 0.02);
  wingPair(g, 0xd8c8a8, 0.05, 0.25, 0.32, 0.85);
  return g;
}

function fly(c) {
  const g = new THREE.Group();
  const m = mat(c);
  g.add(ball(m, 0.25, -0.15, 0, 0, 1.3, 0.85, 0.9));
  g.add(ball(m, 0.18, 0.22, 0.03, 0));
  const eye = mat(0xa02020);
  g.add(ball(eye, 0.1, 0.32, 0.09, 0.1, 1, 1.2, 1, true));
  g.add(ball(eye, 0.1, 0.32, 0.09, -0.1, 1, 1.2, 1, true));
  legs(g, mat(0x1a1a1a), 6, 0.12, 0.3, -0.1, 0.015);
  wingPair(g, 0xdde4ee, -0.05, 0.15, 0.25, 0.6);
  return g;
}

function dungbeetle(c) {
  const g = new THREE.Group();
  const shell = mat(c, { metalness: 0.4, roughness: 0.35 });
  g.add(ball(shell, 0.36, 0, 0.05, 0, 1.15, 0.6, 1));
  g.add(ball(shell, 0.17, 0.42, 0, 0, 1, 0.6, 1.3));
  legs(g, shell, 6, 0.2, 0.3, -0.1, 0.025);
  const dung = ball(mat(0x6a4a2a, { roughness: 1 }), 0.42, -0.95, 0.05, 0);
  g.add(dung);
  g.userData.roll = dung;
  return g;
}

export function buildOrganismMesh(org) {
  const seed = hash(org.id);
  const c = org.color;
  switch (org.form) {
    case 'phage': return phage(c);
    case 'rod': return rod(c);
    case 'cocci': return cocci(c);
    case 'filament': return filament(c, seed, true, org.id === 'streptomyces');
    case 'network': { const g = filament(c, seed, true, true); g.scale.setScalar(1.15); return g; }
    case 'swarm': return swarm(c, seed);
    case 'mold_asp': return mold(c, seed, 'asp');
    case 'mold_bot': return mold(c, seed, 'bot');
    case 'mold_mag': return mold(c, seed, 'mag');
    case 'mold_bea': return mold(c, seed, 'bea');
    case 'yeast': return yeast(c);
    case 'oomycete': return oomycete(c, seed);
    case 'virus': return virus(c);
    case 'rodvirus': return rodvirus(c);
    case 'aphid': return aphid(c);
    case 'locust': return locust(c);
    case 'ladybird': return ladybird(c);
    case 'mosquito': return mosquito(c);
    case 'mite': return mite(c);
    case 'protist': return protist();
    case 'cluster': return cluster(c, seed);
    case 'tree': return tree(c);
    case 'diatom': return diatom(c);
    case 'lichen': return lichen(c, seed);
    case 'termite': return termite(c);
    case 'earthworm': return earthworm(c);
    case 'hornet': return hornet(c);
    case 'fly': return fly(c);
    case 'dungbeetle': return dungbeetle(c);
    default: return cocci(c);
  }
}

// Called every frame for each organism visual.
export function animateOrganism(g, t, dt, phase) {
  const u = g.userData;
  if (u.spin) g.rotation.y += u.spin * dt;
  if (u.tumble) { g.rotation.y += u.tumble * dt; g.rotation.z = Math.sin(t * 0.8 + phase) * 0.35; }
  if (u.flag) u.flag.rotation.x = t * 8 + phase;
  if (u.wings) for (const w of u.wings) w.rotation.x = w.userData.side * Math.sin(t * 40 + phase) * 0.7;
  if (u.hop) g.position.y = Math.abs(Math.sin(t * 3 + phase)) * 0.35;
  if (u.worm) u.worm.forEach((s, i) => { s.position.z = Math.sin(t * 3 + phase + i * 0.6) * 0.12; });
  if (u.roll) u.roll.rotation.z = t * 3;
}

// A short burst of golden specks: sunlight arriving at an organism, then
// draining into the ground as heat and recycled matter.
export function energyBurst(scene, target) {
  const n = 46;
  const pos = new Float32Array(n * 3);
  const seeds = [];
  for (let i = 0; i < n; i++) seeds.push({ a: Math.random() * 6.28, r: 0.3 + Math.random() * 1.2, d: Math.random() * 0.5 });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd36a, size: 0.32, transparent: true, opacity: 1, depthWrite: false }));
  scene.add(points);
  const start = performance.now();
  const tick = () => {
    const t = (performance.now() - start) / 1000;
    for (let i = 0; i < n; i++) {
      const s = seeds[i];
      const k = Math.max(0, t - s.d);
      let y;
      let r = s.r;
      if (k < 0.8) { y = target.y + 14 * (1 - k / 0.8); r = s.r * (1 - k / 0.8) + 0.2; }
      else { const q = Math.min(1, (k - 0.8) / 0.9); y = target.y - q * 2.2; r = 0.2 + q * 2.5; }
      pos[i * 3] = target.x + Math.cos(s.a + k * 2) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = target.z + Math.sin(s.a + k * 2) * r;
    }
    geo.attributes.position.needsUpdate = true;
    points.material.color.setHex(t > 1.1 ? 0xff8a5a : 0xffd36a);
    points.material.opacity = Math.max(0, 1 - Math.max(0, t - 1.6) / 0.6);
    if (t < 2.3) requestAnimationFrame(tick);
    else { scene.remove(points); geo.dispose(); points.material.dispose(); }
  };
  requestAnimationFrame(tick);
}

// ---------- player bodies ----------
export function buildPlayerMesh(tier) {
  const g = new THREE.Group();
  if (tier === 0) {
    const membrane = new THREE.Mesh(G('cell', () => new THREE.SphereGeometry(1, 24, 16)), new THREE.MeshStandardMaterial({ color: 0x9fd8e8, transparent: true, opacity: 0.42, roughness: 0.15, emissive: 0x1a4a58 }));
    membrane.scale.set(1.25, 0.9, 0.9);
    g.add(membrane);
    const dna = new THREE.Mesh(G('knot', () => new THREE.TorusKnotGeometry(0.35, 0.07, 64, 6, 2, 5)), mat(0xc9a7ff));
    g.add(dna);
    const pm = mat(0xbfe4ee);
    for (let i = 0; i < 14; i++) {
      const y = 1 - (i / 13) * 2;
      const r = Math.sqrt(1 - y * y);
      const d = V(Math.cos(i * 2.4) * r * 1.25, y * 0.9, Math.sin(i * 2.4) * r * 0.9);
      g.add(limb(pm, d, d.clone().multiplyScalar(1.3), 0.02));
    }
    g.userData.pulse = membrane;
    g.userData.inner = dna;
    g.userData.radius = 1.2;
    g.userData.height = 1.2;
  } else if (tier === 1) {
    const stem = mat(0x6fae4a);
    g.add(limb(stem, V(0, -0.4, 0), V(0, 1.4, 0), 0.08));
    const leafM = mat(0x8fd16a);
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0, 1.05, 0);
      const leaf = ball(leafM, 0.5, s * 0.5, 0.1, 0, 1, 0.12, 0.45);
      pivot.add(leaf);
      g.add(pivot);
      (g.userData.leaves = g.userData.leaves || []).push(pivot);
    }
    g.add(ball(mat(0xb7e27a), 0.16, 0, 1.45, 0));
    const root = mat(0xe8dcc0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.add(limb(root, V(0, -0.4, 0), V(Math.cos(a) * 0.6, -0.9, Math.sin(a) * 0.6), 0.035));
    }
    g.userData.radius = 1.0;
    g.userData.height = 0.9;
  } else if (tier === 2) {
    const yellow = mat(0xe8b23a);
    const dark = mat(0x2a2016, { emissive: 0x000000 });
    const abd = new THREE.Group();
    for (let i = 0; i < 4; i++) abd.add(ball(i % 2 ? dark : yellow, 0.36 - i * 0.04, -0.35 - i * 0.2, 0, 0, 0.6, 1, 1));
    g.add(abd);
    g.add(ball(mat(0x6a4a24), 0.3, 0.1, 0.05, 0));
    g.add(ball(dark, 0.22, 0.45, 0.05, 0));
    g.add(limb(dark, V(0.55, 0.2, 0.08), V(0.75, 0.55, 0.2), 0.02));
    g.add(limb(dark, V(0.55, 0.2, -0.08), V(0.75, 0.55, -0.2), 0.02));
    legs(g, dark, 6, 0.15, 0.35, -0.15, 0.02);
    wingPair(g, 0xe6f2ff, 0.05, 0.25, 0.35, 0.9);
    g.scale.setScalar(1.3);
    g.userData.radius = 1.0;
    g.userData.height = 2.2;
  } else {
    const skin = mat(0xb07a5a);
    const cloth = mat(0x3f7f8f);
    const body = new THREE.Mesh(G('capsH', () => new THREE.CapsuleGeometry(0.35, 0.7, 4, 10)), cloth);
    body.position.y = 1.3;
    g.add(body);
    g.add(ball(skin, 0.28, 0, 2.15, 0));
    g.add(ball(mat(0x2a1a14), 0.29, -0.03, 2.25, 0, 1, 0.6, 1));
    const limbs = [];
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(0, 1.7, s * 0.45);
      arm.add(limb(skin, V(0, 0, 0), V(0, -0.75, 0), 0.08));
      g.add(arm);
      const leg = new THREE.Group();
      leg.position.set(0, 0.8, s * 0.18);
      leg.add(limb(mat(0x2f3a4a), V(0, 0, 0), V(0, -0.8, 0), 0.11));
      g.add(leg);
      limbs.push({ arm, leg, s });
    }
    g.position.y = 0;
    g.userData.walk = limbs;
    g.userData.radius = 0.9;
    g.userData.height = 0;
  }
  return g;
}

export function animatePlayer(g, t, speed) {
  const u = g.userData;
  if (u.pulse) { const s = 1 + Math.sin(t * 2.2) * 0.04; u.pulse.scale.set(1.25 * s, 0.9 / s, 0.9 * s); u.inner.rotation.y = t * 0.6; }
  if (u.leaves) u.leaves.forEach((l, i) => { l.rotation.x = Math.sin(t * 1.5 + i) * 0.12; });
  if (u.wings) for (const w of u.wings) w.rotation.x = w.userData.side * Math.sin(t * 45) * 0.8;
  if (u.walk) {
    const sw = Math.sin(t * 9) * 0.7 * Math.min(1, speed);
    for (const { arm, leg, s } of u.walk) { arm.rotation.z = sw * s * 0.8; leg.rotation.z = -sw * s; }
  }
}

// ---------- biomes ----------
const BIOMES = [
  { bg: 0x0c2a31, fog: 0x0c2a31, ground: 0x143e40, ground2: 0x1d5552, decor: 'grains', particle: 0xbfe8f0, hemi: [0x9fe0ea, 0x0a1f22] },
  { bg: 0x1d2c25, fog: 0x1d2c25, ground: 0x3a2e22, ground2: 0x4d3c2a, decor: 'roots', particle: 0xe8e0c0, hemi: [0xd8f0c8, 0x2a1f14] },
  { bg: 0x34452f, fog: 0x34452f, ground: 0x3e5a2b, ground2: 0x557537, decor: 'meadow', particle: 0xffe9a0, hemi: [0xfff2d0, 0x2a3a1a] },
  { bg: 0x2b2638, fog: 0x2b2638, ground: 0x3e4a2c, ground2: 0x55613a, decor: 'river', particle: 0xffd8a0, hemi: [0xffd9c0, 0x1f1a2a] },
];

export function biomeColors(tier) { return BIOMES[tier]; }

export function buildBiome(tier, arena) {
  const b = BIOMES[tier];
  const g = new THREE.Group();
  const r = rng(1234 + tier);

  const groundGeo = new THREE.CircleGeometry(arena + 40, 72);
  groundGeo.rotateX(-Math.PI / 2);
  const cols = [];
  const c1 = new THREE.Color(b.ground);
  const c2 = new THREE.Color(b.ground2);
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const n = Math.sin(pos.getX(i) * 0.15) * Math.cos(pos.getZ(i) * 0.13) * 0.5 + 0.5;
    const c = c1.clone().lerp(c2, n);
    cols.push(c.r, c.g, c.b);
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  ground.position.y = -1;
  g.add(ground);

  const edge = new THREE.Mesh(new THREE.TorusGeometry(arena, 0.15, 6, 96), new THREE.MeshBasicMaterial({ color: b.particle, transparent: true, opacity: 0.25 }));
  edge.rotation.x = Math.PI / 2;
  edge.position.y = -0.9;
  g.add(edge);

  const dummy = new THREE.Object3D();
  const scatter = (geo, material, n, place) => {
    const im = new THREE.InstancedMesh(geo, material, n);
    for (let i = 0; i < n; i++) { place(dummy, i); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }
    g.add(im);
    return im;
  };
  const ringPos = (min = 6) => { const a = r() * Math.PI * 2; const d = min + Math.sqrt(r()) * (arena + 25 - min); return [Math.cos(a) * d, Math.sin(a) * d]; };

  if (b.decor === 'grains') {
    scatter(new THREE.DodecahedronGeometry(1, 0), mat(0x6f8f88, { emissive: 0x0a1a18 }), 160, (d) => {
      const [x, z] = ringPos(); const s = 0.6 + r() * 2.6;
      d.position.set(x, -1 + s * 0.3, z); d.scale.set(s, s * (0.6 + r() * 0.5), s); d.rotation.set(r() * 3, r() * 3, r() * 3);
    });
    scatter(new THREE.IcosahedronGeometry(1, 0), mat(0xc8d8c8, { emissive: 0x101818 }), 60, (d) => {
      const [x, z] = ringPos(); const s = 0.3 + r() * 0.8; d.position.set(x, -0.9, z); d.scale.setScalar(s); d.rotation.set(r() * 3, r() * 3, r() * 3);
    });
  } else if (b.decor === 'roots') {
    scatter(new THREE.ConeGeometry(0.08, 1, 4), mat(0x6f9a4a), 700, (d) => {
      const [x, z] = ringPos(3); d.position.set(x, -0.6, z); d.scale.set(1, 0.6 + r() * 1.4, 1); d.rotation.set((r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4);
    });
    const rootM = mat(0xcfc2a0, { emissive: 0x1a140a });
    for (let i = 0; i < 26; i++) {
      const [x, z] = ringPos(8);
      const pts = [];
      for (let k = 0; k < 6; k++) pts.push(V(x + (r() - 0.5) * 6, -0.95 + r() * 0.3, z + (r() - 0.5) * 6));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.12 + r() * 0.12, 5), rootM));
    }
    scatter(new THREE.DodecahedronGeometry(1, 0), mat(0x5a4a3a), 70, (d) => {
      const [x, z] = ringPos(); const s = 0.4 + r() * 1.2; d.position.set(x, -0.9, z); d.scale.setScalar(s);
    });
  } else if (b.decor === 'meadow') {
    scatter(new THREE.ConeGeometry(0.07, 1, 4), mat(0x7aa84a), 900, (d) => {
      const [x, z] = ringPos(3); d.position.set(x, -0.5, z); d.scale.set(1, 0.7 + r() * 1.3, 1); d.rotation.set((r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5);
    });
    const petal = [0xf2d24a, 0xb48ae0, 0xffffff, 0xe87aa0];
    petal.forEach((pc) => scatter(new THREE.SphereGeometry(0.22, 6, 4), mat(pc), 70, (d) => {
      const [x, z] = ringPos(4); d.position.set(x, 0.1 + r() * 0.5, z); d.scale.set(1, 0.5, 1);
    }));
    const comb = new THREE.Group();
    const hexM = mat(0xd9a03a, { emissive: 0x3a2400 });
    const hg = new THREE.CylinderGeometry(0.9, 0.9, 1.2, 6);
    for (let q = -2; q <= 2; q++) for (let s = -2; s <= 2; s++) {
      if (Math.abs(q + s) > 2) continue;
      const m = new THREE.Mesh(hg, hexM);
      m.position.set(q * 1.56 + s * 0.78, -0.5 + r() * 0.4, s * 1.35);
      comb.add(m);
    }
    comb.position.set(arena * 0.6, 0, -arena * 0.5);
    g.add(comb);
  } else {
    scatter(new THREE.ConeGeometry(0.08, 1, 4), mat(0x7a8a4a), 800, (d) => {
      const [x, z] = ringPos(3); d.position.set(x, -0.5, z); d.scale.set(1, 0.6 + r() * 1.2, 1); d.rotation.set((r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5);
    });
    scatter(new THREE.CylinderGeometry(0.06, 0.06, 1, 4), mat(0x9a9a5a), 260, (d) => {
      const a = -0.6 + r() * 1.2; const dd = arena * 0.55 + r() * 8; d.position.set(Math.cos(a) * dd, 0.5, Math.sin(a) * dd); d.scale.set(1, 2 + r() * 2.5, 1);
    });
    scatter(new THREE.DodecahedronGeometry(1, 0), mat(0x6f6a72), 60, (d) => {
      const [x, z] = ringPos(); const s = 0.5 + r() * 1.6; d.position.set(x, -0.8, z); d.scale.set(s, s * 0.6, s);
    });
    const water = new THREE.Mesh(new THREE.CircleGeometry(16, 40), new THREE.MeshStandardMaterial({ color: 0x3a6a8a, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(arena * 0.75, -0.95, 0);
    g.add(water);
    const hutM = mat(0x8a6a4a);
    for (let i = 0; i < 4; i++) {
      const a = 2.2 + i * 0.5;
      const hut = new THREE.Group();
      const wall = new THREE.Mesh(cyl(), hutM); wall.scale.set(2.2, 2.4, 2.2); wall.position.y = 0.2; hut.add(wall);
      const roof = new THREE.Mesh(cone(), mat(0xb89a5a)); roof.scale.set(2.8, 2, 2.8); roof.position.y = 2.4; hut.add(roof);
      hut.position.set(Math.cos(a) * (arena + 6), -1, Math.sin(a) * (arena + 6));
      g.add(hut);
    }
  }

  // Drifting specks: spores, pollen or dust.
  const n = 380;
  const pp = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pp[i * 3] = (r() - 0.5) * 120; pp[i * 3 + 1] = r() * 14 - 0.5; pp[i * 3 + 2] = (r() - 0.5) * 120; }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const points = new THREE.Points(pg, new THREE.PointsMaterial({ color: b.particle, size: 0.14, transparent: true, opacity: 0.7, depthWrite: false }));
  g.add(points);
  g.userData.points = points;
  return g;
}
