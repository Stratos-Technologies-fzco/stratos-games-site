// Zest Strike: free-for-all fruit arena shooter. three.js r165, everything drawn in code.
import * as THREE from './vendor/three.module.js';

const $ = id => document.getElementById(id);
// Stratos analytics hook
function track(name, details) { try { var St = window.Stratos || parent.Stratos; if (St) St.track(name, details); } catch (e) { } }
const TEST = new URLSearchParams(location.search).has('test');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// ---------------------------------------------------------------- settings
const S = { sens: 1, scopeSens: 1, fov: 90, vol: 0.7, bots: 5, diff: 1, name: 'You', fruit: 0, weapon: 'pulper' };
try { Object.assign(S, JSON.parse(localStorage.getItem('zest-strike') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('zest-strike', JSON.stringify(S)); } catch (e) {} };

const FRUITS = [
  { name: 'Orange', color: '#ff8a1f', juice: 0xffa53a },
  { name: 'Lemon', color: '#ffd93a', juice: 0xfff07a },
  { name: 'Lime', color: '#79d24f', juice: 0xb6f28a },
  { name: 'Grapefruit', color: '#ff6f61', juice: 0xff9a8f },
  { name: 'Blood Orange', color: '#c9333d', juice: 0xe0444f },
  { name: 'Pomelo', color: '#d8f06a', juice: 0xeefaa0 },
];
const BOT_NAMES = ['Sir Zest', 'Lil Lime', 'Tangy Tom', 'Pomelo Pete', 'Clementine', 'Kumquat Kid', 'Captain Rind', 'Juicy Jo', 'Mandy Rin', 'Yuzu Yasmin', 'Seedless Sam'];

const WEAPONS = {
  pulper:   { name: 'Pulper',       kind: 'Assault rifle', dmg: 24, head: 1.6, rate: 0.11, mag: 30, reload: 1.9, hip: 0.035, ads: 0.007,  recoil: 0.010, auto: true,  pellets: 1, range: 90,  zooms: [1.6],          speed: 1,    color: 0x3a7bd5, pref: 16 },
  squeezer: { name: 'Squeezer',     kind: 'SMG',           dmg: 16, head: 1.5, rate: 0.07, mag: 40, reload: 1.6, hip: 0.045, ads: 0.016,  recoil: 0.007, auto: true,  pellets: 1, range: 45,  zooms: [1.4],          speed: 1.08, color: 0x9b59b6, pref: 9 },
  scatter:  { name: 'Seed Scatter', kind: 'Shotgun',       dmg: 13, head: 1.3, rate: 0.8,  mag: 6,  reload: 2.4, hip: 0.10,  ads: 0.075,  recoil: 0.04,  auto: false, pellets: 9, range: 28,  zooms: [1.25],         speed: 1,    color: 0xd0402f, pref: 6 },
  rind:     { name: 'Rind Ranger',  kind: 'Sniper, 4-step scope', dmg: 92, head: 1.7, rate: 1.15, mag: 5, reload: 2.6, hip: 0.12, ads: 0.0006, recoil: 0.05, auto: false, pellets: 1, range: 300, zooms: [2, 4, 8, 12], scope: true, speed: 0.92, color: 0x27ae60, pref: 26 },
  peeler:   { name: 'Peeler',       kind: 'Pistol',        dmg: 26, head: 1.6, rate: 0.2,  mag: 12, reload: 1.3, hip: 0.03,  ads: 0.012,  recoil: 0.016, auto: false, pellets: 1, range: 60,  zooms: [1.3],          speed: 1.05, color: 0x8a94a3, pref: 12 },
};
const PRIMARIES = ['pulper', 'squeezer', 'scatter', 'rind'];
const KILL_TARGET = 25, MATCH_TIME = 360, RESPAWN = 3.2;

// ---------------------------------------------------------------- renderer
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.autoClear = false;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe6f5, 70, 220);
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 500);
camera.rotation.order = 'YXZ';
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(62, 1, 0.01, 10);
vmScene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
const vmSun = new THREE.DirectionalLight(0xfff2dd, 2.2); vmSun.position.set(1, 2, 1); vmScene.add(vmSun);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = vmCam.aspect = w / h;
  vmCam.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// sky dome
const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color(0x3d8fe0) }, mid: { value: new THREE.Color(0xbfe4ff) }, bot: { value: new THREE.Color(0xf7d9a8) } },
  vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform vec3 top,mid,bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.?mix(mid,top,pow(h,.55)):mix(mid,bot,min(-h*4.,1.));gl_FragColor=vec4(c,1.);}',
}));
scene.add(sky);
// sun disc
const sunTex = radialTex('rgba(255,250,220,1)', 'rgba(255,230,150,0)');
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, fog: false, depthWrite: false, transparent: true }));
sunSprite.scale.set(60, 60, 1); scene.add(sunSprite);

scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x8a7a5a, 1.25));
const sun = new THREE.DirectionalLight(0xfff0d8, 2.6);
sun.position.set(30, 50, 20); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 140 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);

// ---------------------------------------------------------------- textures (all drawn in code)
function cv(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function radialTex(a, b) { return cv(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, a); r.addColorStop(1, b); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }); }
function noise(g, w, h, n, a) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
const TEX = {
  floor: cv(256, 256, (g, w, h) => {
    g.fillStyle = '#c9b48f'; g.fillRect(0, 0, w, h); noise(g, w, h, 4000, .12);
    g.strokeStyle = 'rgba(80,60,40,.35)'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
  }),
  crate: cv(256, 256, (g, w, h) => {
    g.fillStyle = '#b07a3f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#a66f37' : '#b9844a'; g.fillRect(0, i * 43, w, 41); }
    noise(g, w, h, 3000, .15);
    g.strokeStyle = '#6b4520'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
    g.beginPath(); g.moveTo(22, 22); g.lineTo(w - 22, h - 22); g.stroke();
    g.fillStyle = '#3d2a14'; for (const [x, y] of [[11, 11], [w - 11, 11], [11, h - 11], [w - 11, h - 11]]) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  }),
  wall: cv(256, 256, (g, w, h) => {
    g.fillStyle = '#e8dccb'; g.fillRect(0, 0, w, h); noise(g, w, h, 5000, .1);
    g.fillStyle = '#ff8a1f'; g.fillRect(0, h - 40, w, 22); g.fillStyle = '#c9b8a2'; g.fillRect(0, h - 18, w, 18);
  }),
  carton: cv(256, 256, (g, w, h) => {
    g.fillStyle = '#fff7e6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff8a1f'; g.fillRect(0, 0, w, 54); g.fillRect(0, h - 30, w, 30);
    g.fillStyle = '#ffb14a'; g.beginPath(); g.arc(128, 140, 58, 0, 7); g.fill();
    g.strokeStyle = '#fff3d6'; g.lineWidth = 4; for (let a = 0; a < 8; a++) { g.beginPath(); g.moveTo(128, 140); g.lineTo(128 + Math.cos(a * Math.PI / 4) * 54, 140 + Math.sin(a * Math.PI / 4) * 54); g.stroke(); }
    g.fillStyle = '#3fae3a'; g.beginPath(); g.ellipse(150, 78, 18, 8, -0.5, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 38px sans-serif'; g.textAlign = 'center'; g.fillText('ZEST', 128, 42);
    noise(g, w, h, 1500, .06);
  }),
  step: cv(128, 128, (g, w, h) => { g.fillStyle = '#9aa3ad'; g.fillRect(0, 0, w, h); noise(g, w, h, 1500, .15); g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, 10); }),
  low: cv(256, 128, (g, w, h) => {
    g.fillStyle = '#9b4f35'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c86a48'; for (let r = 0; r < 4; r++) for (let c = -1; c < 5; c++) g.fillRect(c * 64 + (r % 2) * 32 + 3, r * 32 + 3, 58, 26);
    noise(g, w, h, 2000, .12);
  }),
  plat: cv(128, 128, (g, w, h) => { g.fillStyle = '#5d6b78'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a5560'; g.lineWidth = 2; for (let i = 0; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 16, 16); g.stroke(); } noise(g, w, h, 1500, .1); }),
};
TEX.floor.wrapS = TEX.floor.wrapT = THREE.RepeatWrapping; TEX.floor.repeat.set(20, 20);
function containerTex(col) {
  return cv(256, 128, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 12) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 4, h); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 5, 0, 2, h); }
    noise(g, w, h, 2500, .12);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = 'bold 20px sans-serif'; g.fillText('ZEST CO.', 16, 30);
  });
}
const fruitTexCache = {};
function fruitTex(i) {
  if (fruitTexCache[i]) return fruitTexCache[i];
  const col = FRUITS[i].color;
  return fruitTexCache[i] = cv(256, 128, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) { g.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.6, 0, 7); g.fill(); }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.15)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

// ---------------------------------------------------------------- map
const colliders = [];
const mapMeshes = [];
const matCache = {};
function matFor(kind, w, h, d, extra) {
  if (kind === 'wall') { const t = TEX.wall.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(w, d) / 7, 1); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: .95 }); }
  if (kind === 'container') { const k = 'c' + extra; return matCache[k] || (matCache[k] = new THREE.MeshStandardMaterial({ map: containerTex(extra), roughness: .7, metalness: .2 })); }
  return matCache[kind] || (matCache[kind] = new THREE.MeshStandardMaterial({ map: TEX[kind], roughness: kind === 'plat' ? .6 : .85, metalness: kind === 'plat' ? .3 : 0 }));
}
function addBox(cx, cz, w, d, h, kind, y0 = 0, extra) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matFor(kind, w, h, d, extra));
  m.position.set(cx, y0 + h / 2, cz); m.castShadow = m.receiveShadow = true;
  scene.add(m); mapMeshes.push(m);
  colliders.push({ min: new THREE.Vector3(cx - w / 2, y0, cz - d / 2), max: new THREE.Vector3(cx + w / 2, y0 + h, cz + d / 2) });
}
function buildMap() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(82, 82), new THREE.MeshStandardMaterial({ map: TEX.floor, roughness: .95 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ color: 0x7fae4e, roughness: 1 }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; scene.add(grass);
  // outer walls
  addBox(0, -40.5, 82, 1, 7, 'wall'); addBox(0, 40.5, 82, 1, 7, 'wall');
  addBox(-40.5, 0, 1, 80, 7, 'wall'); addBox(40.5, 0, 1, 80, 7, 'wall');
  // centre juice tower with stairs north and south
  addBox(0, 0, 6, 6, 4, 'carton');
  for (let k = 1; k <= 8; k++) { addBox(0, 3 + (8 - k) * 0.8 + 0.4, 2.2, 0.8, 0.5 * k, 'step'); addBox(0, -(3 + (8 - k) * 0.8 + 0.4), 2.2, 0.8, 0.5 * k, 'step'); }
  addBox(-2.6, 0, 0.6, 3.4, 0.9, 'low', 4); addBox(2.6, 0, 0.6, 3.4, 0.9, 'low', 4);
  // sniper perches in two corners
  addBox(-30, -30, 6, 6, 3, 'plat');
  for (let k = 1; k <= 6; k++) addBox(-27 + (6 - k) * 0.8 + 0.4, -30, 0.8, 2, 0.5 * k, 'step');
  addBox(-30, -27.3, 6, 0.5, 1, 'low', 3); addBox(-32.7, -30, 0.5, 4, 1, 'low', 3);
  addBox(30, 30, 6, 6, 3, 'plat');
  for (let k = 1; k <= 6; k++) addBox(27 - (6 - k) * 0.8 - 0.4, 30, 0.8, 2, 0.5 * k, 'step');
  addBox(30, 27.3, 6, 0.5, 1, 'low', 3); addBox(32.7, 30, 0.5, 4, 1, 'low', 3);
  // shipping containers
  addBox(-18, -14, 8, 2.6, 2.6, 'container', 0, '#2f7fb8');
  addBox(18, 14, 8, 2.6, 2.6, 'container', 0, '#c0392b');
  addBox(-14, 21, 2.6, 8, 2.6, 'container', 0, '#27ae60');
  addBox(14, -21, 2.6, 8, 2.6, 'container', 0, '#8e44ad');
  addBox(-20, -14, 4, 2.6, 2.6, 'container', 2.6, '#e67e22');
  addBox(20, 14, 4, 2.6, 2.6, 'container', 2.6, '#16a085');
  // big cartons
  addBox(-25, -4, 4, 4, 3, 'carton'); addBox(25, 4, 4, 4, 3, 'carton');
  addBox(5, -30, 6, 3, 2.5, 'carton'); addBox(-5, 30, 6, 3, 2.5, 'carton');
  // low brick walls for crouch cover
  addBox(10, 0, 0.6, 5, 1, 'low'); addBox(-10, 0, 0.6, 5, 1, 'low');
  addBox(0, -15, 5, 0.6, 1, 'low'); addBox(0, 15, 5, 0.6, 1, 'low');
  addBox(-30, 12, 5, 0.6, 1, 'low'); addBox(30, -12, 5, 0.6, 1, 'low');
  addBox(22, -30, 0.6, 5, 1, 'low'); addBox(-22, 30, 0.6, 5, 1, 'low');
  // crates
  const crates = [[-12, -8], [12, 8], [-20, 27], [20, -27], [-33, 6], [33, -6], [-5, -24], [5, 24], [15, -9], [-15, 9], [27, 19], [-27, -19], [-8, -33], [8, 33], [-34, -12], [34, 12], [24, -16], [-24, 16]];
  crates.forEach(([x, z], i) => { addBox(x, z, 1.6, 1.6, 1.6, 'crate'); if (i % 3 === 0) addBox(x + 0.1, z - 0.1, 1.2, 1.2, 1.2, 'crate', 1.6); if (i % 4 === 1) addBox(x + 1.6, z, 1.6, 1.6, 1.6, 'crate'); });
  // scenery outside the walls: orchard trees
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x6b4a2b }), leafM = new THREE.MeshStandardMaterial({ color: 0x3f8f3a, roughness: .9 });
  const orangeM = new THREE.MeshStandardMaterial({ color: 0xff8a1f });
  for (let i = 0; i < 44; i++) {
    const a = i / 44 * Math.PI * 2 + rand(-.04, .04), r = rand(52, 80);
    const t = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.35, .5, 3, 6), trunkM); tr.position.y = 1.5; t.add(tr);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(2.4, 3.4), 0), leafM); crown.position.y = 4.5; t.add(crown);
    for (let k = 0; k < 5; k++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.3, 6, 5), orangeM); o.position.set(rand(-2, 2), rand(3.5, 5.5), rand(-2, 2)).normalize().multiplyScalar(2.8); o.position.y += 4.3; t.add(o); }
    t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(t);
  }
}
buildMap();

const SPAWNS = [[-35, 0], [35, 0], [0, -35], [0, 35], [-35, 35], [35, -35], [-20, -35], [20, 35], [-35, 22], [35, -22], [12, -35], [-12, 35], [-8, 6], [8, -6]]
  .filter(([x, z]) => pointFree(x, z, 0.1, 0.8));
const WAYPOINTS = [];
for (let x = -36; x <= 36; x += 4) for (let z = -36; z <= 36; z += 4) if (pointFree(x, z, 0.1, 1.1)) WAYPOINTS.push(new THREE.Vector3(x, 0, z));

function pointFree(x, z, y, r, h = 1.4) {
  for (const c of colliders) if (x + r > c.min.x && x - r < c.max.x && z + r > c.min.z && z - r < c.max.z && y + h > c.min.y && y < c.max.y) return false;
  return true;
}

// ---------------------------------------------------------------- ray tests
const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _v = new THREE.Vector3(), _w = new THREE.Vector3();
function rayAABB(o, d, c, maxT) {
  let tmin = 0, tmax = maxT;
  for (const ax of ['x', 'y', 'z']) {
    if (Math.abs(d[ax]) < 1e-9) { if (o[ax] < c.min[ax] || o[ax] > c.max[ax]) return Infinity; continue; }
    const inv = 1 / d[ax]; let t1 = (c.min[ax] - o[ax]) * inv, t2 = (c.max[ax] - o[ax]) * inv;
    if (t1 > t2) { const s = t1; t1 = t2; t2 = s; }
    if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2;
    if (tmax < tmin) return Infinity;
  }
  return tmin;
}
function rayScene(o, d, maxT) {
  let best = maxT;
  if (d.y < -1e-6) { const t = -o.y / d.y; if (t > 0 && t < best) best = t; }
  for (const c of colliders) { const t = rayAABB(o, d, c, best); if (t < best) best = t; }
  return best;
}
function raySphere(o, d, c, r) {
  _v.subVectors(o, c); const b = _v.dot(d), q = _v.lengthSq() - r * r, disc = b * b - q;
  if (disc < 0) return Infinity; const t = -b - Math.sqrt(disc); return t > 0 ? t : Infinity;
}

// ---------------------------------------------------------------- audio (synthesised)
let AC = null, master = null, noiseBuf = null;
function audio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = AC.createGain(); master.gain.value = S.vol; master.connect(AC.destination);
  noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
function out(vol, pan) { const g = AC.createGain(); let node = g; if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = clamp(pan || 0, -1, 1); g.connect(p); p.connect(master); } else g.connect(master); return node; }
function sNoise(vol, pan, freq, dec, type = 'lowpass', q = 0.8, sweepTo) {
  const t = AC.currentTime, src = AC.createBufferSource(); src.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dec);
  const g = out(vol, pan); env(g, t, 0.003, vol, dec);
  src.connect(f); f.connect(g); src.start(t, Math.random() * 0.5); src.stop(t + dec + 0.05);
}
function sTone(vol, pan, f0, f1, dec, type = 'sine', delay = 0) {
  const t = AC.currentTime + delay, o = AC.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dec);
  const g = out(vol, pan); env(g, t, 0.004, vol, dec); o.connect(g); o.start(t); o.stop(t + dec + 0.05);
}
const SND = {
  shot(key, vol = 1, pan = 0) {
    if (!AC) return; const v = vol;
    if (key === 'rind') { sNoise(0.9 * v, pan, 2400, 0.5, 'lowpass', 0.7, 300); sTone(0.7 * v, pan, 120, 40, 0.35, 'triangle'); }
    else if (key === 'scatter') { sNoise(0.9 * v, pan, 1600, 0.4, 'lowpass', 0.6, 200); sTone(0.6 * v, pan, 90, 35, 0.3, 'triangle'); }
    else if (key === 'squeezer') { sNoise(0.4 * v, pan, 3500, 0.09, 'bandpass', 0.9); sTone(0.25 * v, pan, 200, 80, 0.07, 'square'); }
    else if (key === 'peeler') { sNoise(0.5 * v, pan, 3000, 0.14, 'bandpass', 0.8); sTone(0.3 * v, pan, 260, 90, 0.1, 'triangle'); }
    else { sNoise(0.55 * v, pan, 2600, 0.14, 'lowpass', 0.8, 600); sTone(0.35 * v, pan, 150, 50, 0.12, 'triangle'); }
  },
  reload() { if (!AC) return; sTone(.25, 0, 900, 600, .05, 'square'); sTone(.25, 0, 700, 400, .05, 'square', .35); sTone(.3, 0, 1200, 800, .05, 'square', .7); },
  empty() { if (!AC) return; sTone(.2, 0, 1500, 1200, .03, 'square'); },
  hit() { if (!AC) return; sTone(.25, 0, 1800, 1400, .05, 'sine'); },
  head() { if (!AC) return; sTone(.35, 0, 2200, 2000, .18, 'sine'); sTone(.2, 0, 3300, 3000, .15, 'sine'); },
  kill() { if (!AC) return; sNoise(.5, 0, 1800, .35, 'bandpass', 2, 250); sTone(.35, 0, 600, 1200, .12, 'sine', .05); },
  hurt() { if (!AC) return; sTone(.45, 0, 180, 60, .2, 'sine'); sNoise(.25, 0, 900, .15, 'lowpass'); },
  zoom() { if (!AC) return; sTone(.15, 0, 2600, 2400, .03, 'square'); },
  swap() { if (!AC) return; sTone(.18, 0, 500, 700, .06, 'triangle'); },
  jump() { if (!AC) return; sNoise(.12, 0, 600, .08, 'lowpass'); },
  boom(vol = 1, pan = 0) { if (!AC) return; sNoise(1.0 * vol, pan, 1200, 0.9, 'lowpass', 0.5, 80); sTone(.8 * vol, pan, 90, 30, .7, 'sine'); sNoise(.4 * vol, pan, 3000, .5, 'bandpass', 1, 800); },
  squish(vol = 1, pan = 0) { if (!AC) return; sNoise(.45 * vol, pan, 1400, .3, 'bandpass', 3, 300); },
  step(vol) { if (!AC) return; sNoise(.05 * vol, 0, 500, .06, 'lowpass'); },
};
function spatial(pos) {
  if (!player) return [0, 0];
  _v.subVectors(pos, camera.position); const d = _v.length();
  const right = _w.set(Math.cos(camera.rotation.y), 0, -Math.sin(camera.rotation.y));
  const pan = d > 0.1 ? _v.dot(right) / d : 0;
  return [1 / (1 + d * 0.07), pan * 0.8];
}

// ---------------------------------------------------------------- effects
// particles
const MAXP = 900;
const pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3);
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const pMat = new THREE.PointsMaterial({ size: 0.13, vertexColors: true, map: radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), transparent: true, depthWrite: false });
const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);
const parts = [];
const _c = new THREE.Color();
function burst(pos, color, n, speed, life = 0.6, grav = 12, up = 0) {
  _c.set(color);
  for (let i = 0; i < n && parts.length < MAXP; i++) {
    const v = new THREE.Vector3(rand(-1, 1), rand(-1, 1) + up, rand(-1, 1)).normalize().multiplyScalar(speed * rand(.3, 1));
    parts.push({ p: pos.clone(), v, life: life * rand(.6, 1.2), r: _c.r * rand(.85, 1.1), g: _c.g * rand(.85, 1.1), b: _c.b * rand(.85, 1.1), grav });
  }
}
function updateParticles(dt) {
  let n = 0;
  for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; } }
  for (const q of parts) {
    q.v.y -= q.grav * dt; q.p.addScaledVector(q.v, dt);
    if (q.p.y < 0.02) { q.p.y = 0.02; q.v.multiplyScalar(0.3); }
    pPos[n * 3] = q.p.x; pPos[n * 3 + 1] = q.p.y; pPos[n * 3 + 2] = q.p.z;
    pCol[n * 3] = q.r; pCol[n * 3 + 1] = q.g; pCol[n * 3 + 2] = q.b; n++;
  }
  pGeo.setDrawRange(0, n); pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
}
// tracers
const tracers = [];
const tracerGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 4, 1, true); tracerGeo.translate(0, 0.5, 0); tracerGeo.rotateX(Math.PI / 2);
for (let i = 0; i < 48; i++) {
  const m = new THREE.Mesh(tracerGeo, new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.visible = false; scene.add(m); tracers.push({ m, t: 0 });
}
let tracerI = 0;
function tracer(a, b, thick = 1) {
  const tr = tracers[tracerI++ % tracers.length];
  tr.m.position.copy(a); tr.m.lookAt(b); tr.m.scale.set(thick, thick, a.distanceTo(b)); tr.m.visible = true; tr.t = 0.07; tr.m.material.opacity = 0.9;
}
// juice splats on the ground
const splats = [];
const splatTex = cv(128, 128, (g) => { g.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(64 + rand(-30, 30), 64 + rand(-30, 30), rand(6, 22), 0, 7); g.fill(); } g.beginPath(); g.arc(64, 64, 30, 0, 7); g.fill(); });
splatTex.colorSpace = THREE.NoColorSpace;
function splat(pos, color, size = 1.6) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: splatTex, color, transparent: true, opacity: .85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rand(0, 6); m.position.set(pos.x, pos.y + 0.02, pos.z); scene.add(m);
  splats.push({ m, t: 14 }); if (splats.length > 30) { const s = splats.shift(); scene.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); }
}
const flashTex = radialTex('rgba(255,240,180,1)', 'rgba(255,160,40,0)');

// ---------------------------------------------------------------- models
const darkM = new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: .45, metalness: .6 });
const accentM = {};
function makeGun(key) {
  const w = WEAPONS[key], g = new THREE.Group();
  const acc = accentM[key] || (accentM[key] = new THREE.MeshStandardMaterial({ color: w.color, roughness: .4, metalness: .25 }));
  const box = (a, b, c, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), m); me.position.set(x, y, z); g.add(me); return me; };
  const cyl = (r, l, m, x, y, z) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 12), m); me.rotation.x = Math.PI / 2; me.position.set(x, y, z); g.add(me); return me; };
  let L = 0.6;
  if (key === 'pulper') { box(.07, .1, .48, acc, 0, 0, -.06); cyl(.018, .3, darkM, 0, .02, -.44); box(.045, .15, .07, darkM, 0, -.11, -.1).rotation.x = .2; box(.055, .09, .2, darkM, 0, -.01, .26); box(.025, .03, .14, darkM, 0, .07, -.04); box(.04, .1, .05, darkM, 0, -.09, .08).rotation.x = -.3; L = .6; }
  else if (key === 'squeezer') { box(.07, .11, .36, acc, 0, 0, -.04); cyl(.02, .16, darkM, 0, .02, -.29); box(.04, .2, .06, darkM, 0, -.14, -.08); box(.04, .1, .05, darkM, 0, -.09, .09).rotation.x = -.3; box(.03, .04, .18, darkM, 0, .01, .22); L = .38; }
  else if (key === 'scatter') { box(.08, .1, .42, acc, 0, -.01, .02); cyl(.026, .5, darkM, -.017, .03, -.42); cyl(.026, .5, darkM, .017, .03, -.42); box(.07, .06, .2, accentM[key], 0, -.05, -.28); box(.06, .12, .22, darkM, 0, -.04, .3); L = .67; }
  else if (key === 'rind') { box(.065, .09, .55, acc, 0, 0, 0); cyl(.016, .55, darkM, 0, .015, -.55); cyl(.034, .3, darkM, 0, .1, -.04); cyl(.042, .04, darkM, 0, .1, -.2); cyl(.04, .04, darkM, 0, .1, .12); box(.04, .08, .05, darkM, 0, -.08, .1).rotation.x = -.3; box(.06, .11, .24, acc, 0, -.02, .38); box(.04, .1, .05, darkM, 0, -.08, -.08); L = .83; }
  else { box(.05, .07, .2, acc, 0, 0, -.02); box(.04, .12, .06, darkM, 0, -.08, .05).rotation.x = -.25; cyl(.012, .06, darkM, 0, .015, -.14); L = .17; }
  g.userData.muzzle = new THREE.Vector3(0, 0.02, -L);
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  fl.position.copy(g.userData.muzzle); fl.scale.set(.25, .25, 1); fl.visible = false; g.add(fl); g.userData.flash = fl;
  return g;
}
const leafM = new THREE.MeshStandardMaterial({ color: 0x3fae3a, roughness: .7 }), stemM = new THREE.MeshStandardMaterial({ color: 0x5a3a1e });
const whiteM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 }), blackM = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: .3 });
function makeFruit(fi, wkey) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const mat = new THREE.MeshStandardMaterial({ map: fruitTex(fi), roughness: .55, emissive: 0x000000 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 28, 20), mat); body.position.y = 0.78; body.scale.set(1, .96, 1); body.castShadow = true; inner.add(body);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.025, .035, .12, 6), stemM); stem.position.y = 1.36; inner.add(stem);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), leafM); leaf.scale.set(.2, .035, .1); leaf.position.set(.13, 1.37, 0); leaf.rotation.z = .35; inner.add(leaf);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 10), whiteM); e.position.set(s * .18, .93, -.47); e.scale.z = .6; inner.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), blackM); p.position.set(s * .18, .93, -.54); inner.add(p);
    const br = new THREE.Mesh(new THREE.BoxGeometry(.15, .03, .03), blackM); br.position.set(s * .18, 1.06, -.49); br.rotation.z = -s * .3; inner.add(br);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), blackM); foot.scale.set(.14, .07, .2); foot.position.set(s * .2, .07, -.04); g.add(foot); g.userData['foot' + s] = foot;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.08, 10, 8), mat); hand.position.set(s * .2 + .1, .66, -.55 + (s > 0 ? .1 : -.05)); inner.add(hand);
  }
  const gun = makeGun(wkey); gun.scale.setScalar(.9); gun.position.set(.12, .7, -.62); inner.add(gun);
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color: 0xcfefff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glint.scale.set(1.4, 1.4, 1); glint.position.set(.12, .8, -.7); glint.visible = false; inner.add(glint);
  Object.assign(g.userData, { body, mat, gun, inner, glint });
  return g;
}
function nameTag(name, color) {
  const t = cv(256, 64, (g, w, h) => { g.font = 'bold 30px Outfit, sans-serif'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(name, w / 2, 42); g.fillStyle = color; g.fillText(name, w / 2, 42); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(1.8, .45, 1); s.position.y = 1.75; return s;
}

// viewmodel
const vm = new THREE.Group(); vm.scale.setScalar(0.72); vmScene.add(vm);
const vmGuns = {};
let vmHands = [];
function buildViewmodel() {
  for (const k in vmGuns) vm.remove(vmGuns[k]);
  vmHands.forEach(h => vmScene.remove(h)); vmHands = [];
  for (const k in WEAPONS) { vmGuns[k] = makeGun(k); vmGuns[k].visible = false; vm.add(vmGuns[k]); }
  const hm = new THREE.MeshStandardMaterial({ map: fruitTex(S.fruit), roughness: .55 });
  const h1 = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 10), hm); h1.position.set(.01, -.1, .06);
  const h2 = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), hm); h2.position.set(-.01, -.04, -.2);
  vm.add(h1, h2); vmHands = [h1, h2];
}

// ---------------------------------------------------------------- bodies
const R = 0.45, G = 22, STEP = 0.55, STAND_H = 1.45, CROUCH_H = 1.05;
let bodies = [], player = null, time = 0, matchT = 0, state = 'menu', feedId = 0;
class Body {
  constructor(isPlayer, name, fruit, primary) {
    Object.assign(this, { isPlayer, name, fruit, primary, nextPrimary: primary });
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0; this.kills = 0; this.deaths = 0; this.streak = 0;
    this.h = STAND_H; this.eye = 1.2; this.crouch = false; this.grounded = false;
    this.alive = false; this.respawnT = 0; this.protect = 0; this.lastHurt = -99; this.lastShot = -99;
    this.color = FRUITS[fruit].color;
    if (!isPlayer) {
      this.model = makeFruit(fruit, primary); scene.add(this.model);
      this.tag = nameTag(name, '#fff'); this.model.add(this.tag);
      this.ai = { thinkT: 0, target: null, react: 0, strafe: 1, strafeT: 0, wp: null, stuckT: 0, lastPos: new THREE.Vector3(), seenPos: null, seenT: -99, burst: 0, pauseT: 0, aimErr: new THREE.Vector2(), jumpT: 0, nadeT: rand(4, 9) };
      this.model.visible = false;
    }
    this.equip(primary);
  }
  equip(primary) {
    this.primary = primary; this.slots = [primary, 'peeler'];
    this.mag = { [primary]: WEAPONS[primary].mag, peeler: WEAPONS.peeler.mag };
    this.cur = 0; this.fireT = 0; this.reloadT = 0; this.swapT = 0; this.bloom = 0; this.nades = 2; this.hp = 100;
    if (this.model) { const ud = this.model.userData; ud.inner.remove(ud.gun); ud.gun = makeGun(primary); ud.gun.scale.setScalar(.9); ud.gun.position.set(.12, .7, -.62); ud.inner.add(ud.gun); }
  }
  get wkey() { return this.slots[this.cur]; }
  get w() { return WEAPONS[this.wkey]; }
  center(out) { return out.set(this.pos.x, this.pos.y + (this.crouch ? 0.6 : 0.78), this.pos.z); }
  eyePos(out) { return out.set(this.pos.x, this.pos.y + this.eye, this.pos.z); }
  dir(out) { const cp = Math.cos(this.pitch); return out.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp); }
}

function overlaps(b, c, px, py, pz) { return px + R > c.min.x && px - R < c.max.x && pz + R > c.min.z && pz - R < c.max.z && py + b.h > c.min.y && py < c.max.y; }
function moveBody(b, dt) {
  b.vel.y -= G * dt;
  const p = b.pos; b.blocked = false;
  for (const ax of ['x', 'z']) {
    p[ax] += b.vel[ax] * dt;
    for (const c of colliders) if (overlaps(b, c, p.x, p.y, p.z)) {
      if (c.max.y - p.y <= STEP && b.grounded && pointFree(p.x, p.z, c.max.y, R - 0.05, b.h)) { p.y = c.max.y; continue; }
      const cen = (c.min[ax] + c.max[ax]) / 2, dirn = b.vel[ax] !== 0 ? Math.sign(b.vel[ax]) : (p[ax] < cen ? 1 : -1);
      p[ax] = dirn > 0 ? c.min[ax] - R - 1e-4 : c.max[ax] + R + 1e-4; b.blocked = true;
    }
  }
  p.y += b.vel.y * dt; b.grounded = false;
  if (p.y <= 0) { p.y = 0; b.vel.y = 0; b.grounded = true; }
  for (const c of colliders) if (overlaps(b, c, p.x, p.y, p.z)) {
    if (b.vel.y <= 0 && c.max.y - p.y <= STEP + 0.35) { p.y = c.max.y; b.vel.y = 0; b.grounded = true; }
    else if (b.vel.y > 0) { p.y = c.min.y - b.h - 1e-4; b.vel.y = 0; }
  }
  p.x = clamp(p.x, -39.5, 39.5); p.z = clamp(p.z, -39.5, 39.5);
}
function setCrouch(b, want, dt) {
  if (!want && b.crouch && !pointFree(b.pos.x, b.pos.z, b.pos.y, R - 0.05, STAND_H)) want = true;
  b.crouch = want; b.h = want ? CROUCH_H : STAND_H;
  b.eye += ((want ? 0.85 : 1.2) - b.eye) * Math.min(1, dt * 14);
}

function canSee(a, b) {
  a.eyePos(_o); b.center(_v); _d.subVectors(_v, _o); const dist = _d.length(); _d.divideScalar(dist);
  return rayScene(_o, _d, dist) >= dist - 0.05;
}

// ---------------------------------------------------------------- shooting
const _dir = new THREE.Vector3(), _u = new THREE.Vector3(), _r = new THREE.Vector3(), _hit = new THREE.Vector3(), _cen = new THREE.Vector3(), _mz = new THREE.Vector3();
function perturb(d, spread, out) {
  _u.set(0, 1, 0); if (Math.abs(d.y) > 0.95) _u.set(1, 0, 0);
  _r.crossVectors(d, _u).normalize(); _u.crossVectors(_r, d).normalize();
  const a = Math.random() * Math.PI * 2, m = spread * Math.sqrt(Math.random());
  return out.copy(d).addScaledVector(_r, Math.cos(a) * m).addScaledVector(_u, Math.sin(a) * m).normalize();
}
function spreadOf(b) {
  const w = b.w, sp = Math.hypot(b.vel.x, b.vel.z);
  const aim = b.isPlayer ? aimT : (b.ai.aiming ? 1 : 0);
  let s = w.hip + (w.ads - w.hip) * aim;
  s += sp * (w.scope && aim > 0.9 ? 0.004 : 0.004) * (1 - aim * 0.6);
  if (!b.grounded) s += 0.04;
  if (b.crouch) s *= 0.75;
  return s + b.bloom;
}
function fire(b, origin, aim, muzzle) {
  const w = b.w;
  b.mag[b.wkey]--; b.fireT = w.rate; b.lastShot = time;
  b.bloom = Math.min(b.bloom + w.recoil * 0.9, 0.08);
  const spread = spreadOf(b);
  let hitBody = null;
  for (let i = 0; i < w.pellets; i++) {
    perturb(aim, spread, _dir);
    let best = rayScene(origin, _dir, w.range * 3), who = null;
    for (const o of bodies) {
      if (o === b || !o.alive) continue;
      const t = raySphere(origin, _dir, o.center(_cen), 0.56);
      if (t < best) { best = t; who = o; }
    }
    _hit.copy(origin).addScaledVector(_dir, best);
    if (b.isPlayer && w.scope && aimT > 0.9) { /* no tracer from the scope view */ } else tracer(muzzle, _hit, w.pellets > 1 ? 0.7 : 1);
    if (who) {
      const head = _hit.y > who.center(_cen).y + 0.24;
      const dist = best, fall = dist > w.range ? Math.max(0.35, w.range / dist) : 1;
      let dmg = w.dmg * fall * (head ? w.head : 1);
      if (!b.isPlayer && who.isPlayer) dmg *= [0.5, 0.75, 0.95][S.diff];
      burst(_hit, FRUITS[who.fruit].juice, head ? 12 : 7, 4, 0.5);
      damage(who, dmg, b, head, w.name);
      hitBody = who;
    } else if (best < w.range * 3 - 0.01) {
      burst(_hit, 0xd8ccb5, 4, 2.5, 0.35, 8);
    }
  }
  if (b.isPlayer) {
    SND.shot(b.wkey, 1, 0);
    const vg = vmGuns[b.wkey]; vg.userData.flash.visible = true; vg.userData.flash.material.rotation = rand(0, 6); flashT = 0.05;
    kick += w.recoil * (aimT > 0.5 ? 0.6 : 1); b.pitch += w.recoil * 0.45 * (aimT > 0.5 ? 0.5 : 1); b.yaw += rand(-1, 1) * w.recoil * 0.25;
    vmKick = Math.min(vmKick + (w.pellets > 1 || w.scope ? 0.09 : 0.035), 0.14);
  } else {
    const [v, pan] = spatial(b.pos); SND.shot(b.wkey, v * 0.8, pan);
    const fl = b.model.userData.gun.userData.flash; fl.visible = true; b.flashT = 0.05;
  }
  return hitBody;
}
function damage(v, amt, src, head, wname) {
  if (!v.alive || v.protect > 0) return;
  v.hp -= amt; v.lastHurt = time;
  if (v.isPlayer) {
    hurtFlash = Math.min(1, hurtFlash + amt / 60); SND.hurt();
    if (src && src !== v) addDmgDir(src.pos.clone());
  } else {
    const ud = v.model.userData; ud.mat.emissive.setHex(0xffffff); v.hitFlash = 0.08;
    if (src && src !== v && (!v.ai.target || Math.random() < 0.6)) { v.ai.target = src; v.ai.react = Math.min(v.ai.react, 0.15); }
  }
  if (src && src.isPlayer && v !== src) { showHit(head, v.hp <= 0); if (v.hp > 0) head ? SND.head() : SND.hit(); }
  if (v.hp <= 0) kill(v, src, head, wname);
}
function kill(v, src, head, wname) {
  v.alive = false; v.hp = 0; v.deaths++; v.streak = 0; v.respawnT = RESPAWN; v.killer = src; v.killedWith = wname;
  v.center(_cen);
  const juice = FRUITS[v.fruit].juice;
  burst(_cen, juice, 70, 7, 0.9, 14, 0.6); burst(_cen, 0xffffff, 12, 4, .5, 10, .5);
  splat(v.pos, juice, 2.2);
  const [vol, pan] = spatial(v.pos); SND.squish(vol, pan);
  if (v.model) v.model.visible = false;
  if (src && src !== v) {
    src.kills++; src.streak++;
    if (src.isPlayer) {
      SND.kill();
      if (time - (src.lastKillT || -99) < 4) src.multi = (src.multi || 1) + 1; else src.multi = 1;
      src.lastKillT = time;
      const m = src.multi >= 4 ? 'Juice Storm!' : src.multi === 3 ? 'Triple Squeeze!' : src.multi === 2 ? 'Double Squeeze!' : src.streak === 5 ? '5 in a row: Juice Rampage!' : src.streak === 10 ? '10 in a row: Unpeelable!' : head ? 'Zest shot!' : '';
      if (m) showMsg(m);
    }
  }
  addFeed(src && src !== v ? src : null, v, wname, head);
  if (v.isPlayer) {
    $('dtitle').textContent = src && src !== v ? `Squeezed by ${src.name}` : 'You squeezed yourself';
    $('dsub').textContent = src && src !== v ? `${wname}${head ? ' (zest shot)' : ''}. They have ${src.hp > 0 ? Math.ceil(src.hp) : 0} health left.` : 'Careful with juice bombs.';
    renderPicks(); $('death').classList.remove('hide'); aimT = 0;
  }
  if (src && src.kills >= KILL_TARGET) endMatch();
}
function respawn(b) {
  let best = null, bd = -1;
  for (const [x, z] of SPAWNS) {
    let md = 1e9; for (const o of bodies) if (o !== b && o.alive) md = Math.min(md, Math.hypot(o.pos.x - x, o.pos.z - z));
    md += rand(0, 8); if (md > bd) { bd = md; best = [x, z]; }
  }
  b.pos.set(best[0], 0, best[1]); b.vel.set(0, 0, 0);
  b.yaw = Math.atan2(best[0], best[1]); b.pitch = 0;
  b.equip(b.nextPrimary); b.alive = true; b.protect = 1.5; b.crouch = false; b.h = STAND_H;
  if (b.model) { b.model.visible = true; b.ai.target = null; b.ai.wp = null; }
  if (b.isPlayer) { $('death').classList.add('hide'); showWeapon(); }
}

// juice bombs
const nadeGeo = new THREE.SphereGeometry(0.13, 12, 10), nadeMat = new THREE.MeshStandardMaterial({ color: 0x9be15d, roughness: .4, emissive: 0x224400 });
const nades = [];
function throwNade(b, dir) {
  if (b.nades <= 0) return; b.nades--;
  const m = new THREE.Mesh(nadeGeo, nadeMat); m.castShadow = true; scene.add(m);
  const p = b.eyePos(new THREE.Vector3()).addScaledVector(dir, 0.6);
  nades.push({ m, p, v: dir.clone().multiplyScalar(17).add(new THREE.Vector3(0, 4, 0)).add(b.vel.clone().multiplyScalar(.5)), t: 1.8, owner: b });
  if (b.isPlayer) SND.swap();
}
function updateNades(dt) {
  for (let i = nades.length - 1; i >= 0; i--) {
    const n = nades[i]; n.t -= dt; n.v.y -= G * dt;
    const prev = n.p.clone(); n.p.addScaledVector(n.v, dt);
    if (n.p.y < 0.13) { n.p.y = 0.13; n.v.y = Math.abs(n.v.y) * 0.4; n.v.x *= .7; n.v.z *= .7; }
    for (const c of colliders) {
      if (n.p.x > c.min.x - .13 && n.p.x < c.max.x + .13 && n.p.y > c.min.y - .13 && n.p.y < c.max.y + .13 && n.p.z > c.min.z - .13 && n.p.z < c.max.z + .13) {
        if (prev.y >= c.max.y + .12) { n.p.y = c.max.y + .13; n.v.y = Math.abs(n.v.y) * .4; n.v.x *= .7; n.v.z *= .7; }
        else if (prev.x <= c.min.x - .12 || prev.x >= c.max.x + .12) { n.p.x = prev.x; n.v.x *= -.45; }
        else { n.p.z = prev.z; n.v.z *= -.45; }
      }
    }
    n.m.position.copy(n.p); n.m.rotation.x += dt * 8;
    if (n.t <= 0) { explode(n.p, n.owner); scene.remove(n.m); nades.splice(i, 1); }
  }
}
function explode(p, owner) {
  burst(p, 0x9be15d, 90, 9, 0.8, 10, 0.4); burst(p, 0xfff27a, 40, 6, 0.6, 8, 0.6); burst(p, 0xffffff, 20, 10, 0.3, 4);
  splat(new THREE.Vector3(p.x, 0, p.z), 0x9be15d, 3.5);
  const [v, pan] = spatial(p); SND.boom(v * 1.3, pan);
  for (const o of bodies) {
    if (!o.alive) continue;
    o.center(_cen); const d = _cen.distanceTo(p); if (d > 6) continue;
    _o.copy(p).y += 0.2; _d.subVectors(_cen, _o); const dl = _d.length(); _d.divideScalar(dl);
    if (rayScene(_o, _d, dl) < dl - 0.1) continue;
    let dmg = 120 * (1 - d / 6); if (o === owner) dmg *= 0.5;
    if (!owner.isPlayer && o.isPlayer) dmg *= [0.5, 0.75, 0.95][S.diff];
    o.vel.addScaledVector(_d, 9 * (1 - d / 6)); o.vel.y += 4 * (1 - d / 6);
    damage(o, dmg, owner, false, 'Juice Bomb');
  }
  if (player) { const d = camera.position.distanceTo(p); if (d < 14) shake = Math.max(shake, (1 - d / 14) * 0.6); }
}

// ---------------------------------------------------------------- bots
const DIFF = { react: [0.55, 0.32, 0.18], err: [0.075, 0.045, 0.025], turn: [3.2, 5, 8], fov: [0.35, 0.2, 0.05] };
function botUpdate(b, dt) {
  const ai = b.ai, w = b.w;
  ai.thinkT -= dt;
  if (ai.thinkT <= 0) {
    ai.thinkT = rand(0.15, 0.3);
    let best = null, bd = 1e9;
    b.dir(_w); _w.y = 0; _w.normalize();
    for (const o of bodies) {
      if (o === b || !o.alive) continue;
      _v.subVectors(o.pos, b.pos); const d = _v.length(); _v.y = 0; _v.normalize();
      const inView = _v.dot(_w) > DIFF.fov[S.diff] || d < 7 || o === ai.target;
      const score = d * (o.isPlayer ? 0.9 : 1) - (o === ai.target ? 6 : 0);
      if (inView && score < bd && canSee(b, o)) { bd = score; best = o; }
    }
    if (best && best !== ai.target) ai.react = DIFF.react[S.diff] * rand(.8, 1.3);
    if (!best && ai.target && ai.target.alive) { ai.seenPos = ai.target.pos.clone(); ai.seenT = time; }
    ai.target = best;
    // stuck check
    if (b.pos.distanceTo(ai.lastPos) < 0.4 && !ai.target) { ai.stuckT += 1; if (ai.stuckT > 3) { ai.wp = null; ai.stuckT = 0; ai.jumpT = 0.1; } } else ai.stuckT = 0;
    ai.lastPos.copy(b.pos);
  }
  const t = ai.target && ai.target.alive ? ai.target : null;
  if (!t) ai.target = null;
  // movement
  let wish = new THREE.Vector3();
  if (t) {
    _v.subVectors(t.pos, b.pos); _v.y = 0; const d = _v.length(); _v.normalize();
    const perp = new THREE.Vector3(-_v.z, 0, _v.x);
    ai.strafeT -= dt; if (ai.strafeT <= 0) { ai.strafe = Math.random() < .5 ? -1 : 1; ai.strafeT = rand(.5, 1.6); if (Math.random() < .15) ai.strafe = 0; }
    const pref = w.pref, fwd = d > pref * 1.3 ? 1 : d < pref * 0.6 ? -0.8 : 0;
    wish.addScaledVector(_v, fwd).addScaledVector(perp, ai.strafe * (w.scope ? .5 : 1));
    ai.aiming = d > 12 || w.scope;
    if (S.diff > 0 && b.grounded && Math.random() < dt * 0.25) ai.jumpT = 0.1;
    ai.crouchT = (ai.crouchT || 0) - dt; if (w.scope && Math.random() < dt * .3) ai.crouchT = rand(.6, 1.5);
  } else {
    ai.aiming = false;
    if (ai.seenPos && time - ai.seenT < 5) { _v.subVectors(ai.seenPos, b.pos); _v.y = 0; if (_v.length() < 1.5) ai.seenPos = null; else wish.copy(_v.normalize()); }
    else {
      if (!ai.wp || b.pos.distanceTo(ai.wp) < 2) ai.wp = pick(WAYPOINTS);
      _v.subVectors(ai.wp, b.pos); _v.y = 0; wish.copy(_v.normalize());
    }
  }
  if (wish.lengthSq() > 0.01) {
    wish.normalize();
    // feelers: steer around boxes
    const ahead = 1.3; let ok = false;
    for (const off of [0, .5, -.5, 1, -1, 1.6, -1.6, 2.3, -2.3]) {
      const c = Math.cos(off), s = Math.sin(off), x = wish.x * c - wish.z * s, z = wish.x * s + wish.z * c;
      if (pointFree(b.pos.x + x * ahead, b.pos.z + z * ahead, b.pos.y + STEP, R, b.h - STEP)) { wish.set(x, 0, z); ok = true; break; }
    }
    if (!ok) { ai.jumpT = 0.1; ai.wp = null; }
  }
  const speed = 5.6 * w.speed * (b.crouch ? .55 : 1) * (ai.aiming ? .7 : 1);
  const k = 1 - Math.exp(-(b.grounded ? 10 : 2) * dt);
  b.vel.x += (wish.x * speed - b.vel.x) * k; b.vel.z += (wish.z * speed - b.vel.z) * k;
  ai.jumpT -= dt; if (ai.jumpT > 0 && b.grounded) { b.vel.y = 7.2; ai.jumpT = 0; }
  setCrouch(b, (ai.crouchT || 0) > 0, dt);
  // aim
  if (t) {
    b.eyePos(_o); t.center(_v);
    const lead = Math.min(0.25, _o.distanceTo(_v) / 120);
    _v.addScaledVector(t.vel, lead * (S.diff === 2 ? 1 : 0.5));
    _d.subVectors(_v, _o);
    const ty = Math.atan2(-_d.x, -_d.z), tp = Math.atan2(_d.y, Math.hypot(_d.x, _d.z));
    const turn = DIFF.turn[S.diff] * dt;
    b.yaw += clamp(angDiff(b.yaw, ty), -turn, turn); b.pitch += clamp(tp - b.pitch, -turn, turn);
    ai.react -= dt;
    const err = Math.abs(angDiff(b.yaw, ty)) + Math.abs(tp - b.pitch);
    ai.pauseT -= dt;
    const wantFire = ai.react <= 0 && err < 0.12 && ai.pauseT <= 0 && t.protect <= 0;
    if (wantFire && b.fireT <= 0 && b.reloadT <= 0 && b.swapT <= 0 && b.mag[b.wkey] > 0) {
      const d = _o.distanceTo(_v);
      const e = DIFF.err[S.diff] * (0.6 + d * 0.012) * (w.scope ? 0.5 : 1) * (t.crouch ? 1.1 : 1) + Math.hypot(t.vel.x, t.vel.z) * 0.004;
      b.dir(_dir); perturb(_dir, e, _d);
      const mz = b.model.userData.gun.localToWorld(_mz.copy(b.model.userData.gun.userData.muzzle));
      fire(b, _o, _d, mz);
      b.fireT = w.rate * [1.7, 1.3, 1.08][S.diff];
      if (w.auto) { ai.burst++; if (ai.burst > rand(4, 9)) { ai.burst = 0; ai.pauseT = rand(.25, .6); } }
    }
    ai.nadeT -= dt;
    const dd = b.pos.distanceTo(t.pos);
    if (ai.nadeT <= 0 && b.nades > 0 && dd > 8 && dd < 20 && S.diff > 0) { ai.nadeT = rand(8, 16); b.dir(_dir); _dir.y += 0.15; throwNade(b, _dir.normalize()); }
  } else {
    const sp = Math.hypot(b.vel.x, b.vel.z);
    if (sp > 0.5) { const ty = Math.atan2(-b.vel.x, -b.vel.z); b.yaw += clamp(angDiff(b.yaw, ty), -4 * dt, 4 * dt); }
    b.pitch *= 0.9;
  }
  if (b.mag[b.wkey] <= 0 && b.reloadT <= 0) b.reloadT = w.reload;
  else if (!t && b.mag[b.wkey] < w.mag * 0.5 && b.reloadT <= 0) b.reloadT = w.reload;
}
function updateModel(b, dt) {
  const m = b.model, ud = m.userData;
  m.position.copy(b.pos); m.rotation.y = b.yaw;
  const sp = Math.hypot(b.vel.x, b.vel.z);
  b.walk = (b.walk || 0) + sp * dt * 2.2;
  ud.inner.position.y = b.grounded ? Math.abs(Math.sin(b.walk)) * 0.06 * Math.min(1, sp / 4) : 0.05;
  ud.inner.scale.y += ((b.crouch ? 0.78 : 1) - ud.inner.scale.y) * Math.min(1, dt * 12);
  ud.foot1.position.z = -.04 + Math.sin(b.walk) * .15 * Math.min(1, sp / 3); ud.foot_1 = ud['foot-1']; ud['foot-1'].position.z = -.04 - Math.sin(b.walk) * .15 * Math.min(1, sp / 3);
  ud.gun.rotation.x = b.pitch * 0.8 - (b.reloadT > 0 ? .6 : 0);
  if (b.hitFlash > 0) { b.hitFlash -= dt; if (b.hitFlash <= 0) ud.mat.emissive.setHex(0x000000); }
  if (b.flashT > 0) { b.flashT -= dt; if (b.flashT <= 0) ud.gun.userData.flash.visible = false; }
  ud.mat.transparent = b.protect > 0; ud.mat.opacity = b.protect > 0 ? 0.55 + Math.sin(time * 20) * 0.2 : 1;
  // scope glint so a sniper aiming at you can be spotted
  ud.glint.visible = b.w.scope && b.ai.target === player && b.ai.aiming && b.alive;
  if (ud.glint.visible) { const s = 1.2 + Math.sin(time * 9) * .4; ud.glint.scale.set(s, s, 1); }
}

// ---------------------------------------------------------------- player
const keys = {};
let mouseL = false, mouseR = false, firedSince = false, aimT = 0, kick = 0, vmKick = 0, flashT = 0, hurtFlash = 0, shake = 0;
let zoomIdx = 1, zoomCur = 4, breath = 1, breathHold = false, swayT = 0;
let locked = false;
function curZoomTarget() { const z = player.w.zooms; return z[Math.min(zoomIdx, z.length - 1)]; }
function changeZoom(dirn) {
  const z = player.w.zooms; if (z.length < 2) return false;
  const ni = clamp(zoomIdx + dirn, 0, z.length - 1); if (ni === zoomIdx) return true;
  zoomIdx = ni; SND.zoom(); const l = $('zlbl'); l.classList.add('pop'); setTimeout(() => l.classList.remove('pop'), 150); renderZoomSteps(); return true;
}
function renderZoomSteps() { if (!player) return; $('zsteps').innerHTML = player.w.zooms.map((z, i) => `<b class="${i === zoomIdx ? 'on' : ''}">${z}&times;</b>`).join(''); }
function swapTo(i) {
  const p = player; if (!p.alive || i === p.cur || i < 0 || i > 1) return;
  p.cur = i; p.swapT = 0.4; p.reloadT = 0; SND.swap(); showWeapon();
}
function startReload(b) { if (b.reloadT > 0 || b.mag[b.wkey] >= b.w.mag) return; b.reloadT = b.w.reload; if (b.isPlayer) SND.reload(); }

function playerUpdate(dt) {
  const p = player, w = p.w;
  const wantAim = mouseR && p.reloadT <= 0 && p.swapT <= 0;
  const sprint = keys.ShiftLeft && !wantAim && keys.KeyW && !p.crouch;
  // move
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const sy = Math.sin(p.yaw), cy = Math.cos(p.yaw);
  let wx = -sy * f + cy * s, wz = -cy * f - sy * s; const wl = Math.hypot(wx, wz); if (wl > 0) { wx /= wl; wz /= wl; }
  setCrouch(p, keys.KeyC || keys.ControlLeft, dt);
  const speed = 6.4 * w.speed * (p.crouch ? .5 : sprint ? 1.45 : 1) * (1 - aimT * .4);
  const k = 1 - Math.exp(-(p.grounded ? 12 : 2.5) * dt);
  p.vel.x += (wx * speed - p.vel.x) * k; p.vel.z += (wz * speed - p.vel.z) * k;
  if (keys.Space && p.grounded) { p.vel.y = 7.4; SND.jump(); }
  moveBody(p, dt);
  const sp = Math.hypot(p.vel.x, p.vel.z);
  if (p.grounded && sp > 1) { p.stepT = (p.stepT || 0) + dt * sp; if (p.stepT > 2.4) { p.stepT = 0; SND.step(p.crouch ? .4 : 1); } }
  // aim
  const aimRate = w.scope ? 4 : 7;
  aimT = clamp(aimT + (wantAim && !sprint ? 1 : -1) * dt * aimRate, 0, 1);
  // breath while scoped
  const scoped = w.scope && aimT > 0.9;
  breathHold = scoped && keys.ShiftLeft && breath > 0;
  breath = clamp(breath + (breathHold ? -dt / 4 : dt / 3), 0, 1);
  if (scoped && keys.ShiftLeft && breath <= 0) breathHold = false;
  // fire
  if (p.reloadT > 0) { p.reloadT -= dt; if (p.reloadT <= 0) p.mag[p.wkey] = w.mag; }
  if (p.swapT > 0) p.swapT -= dt;
  p.fireT -= dt;
  p.bloom = Math.max(0, p.bloom - dt * 0.12);
  if (mouseL && p.fireT <= 0 && p.reloadT <= 0 && p.swapT <= 0 && !sprint) {
    if (p.mag[p.wkey] <= 0) { if (!firedSince) { SND.empty(); startReload(p); } firedSince = true; }
    else if (w.auto || !firedSince) {
      camera.getWorldDirection(_dir);
      const mz = _mz.copy(camera.position).addScaledVector(_dir, 0.6);
      _w.set(Math.cos(camera.rotation.y), 0, -Math.sin(camera.rotation.y)); mz.addScaledVector(_w, 0.18 * (1 - aimT)); mz.y -= 0.15 * (1 - aimT);
      fire(p, camera.position.clone(), _dir.clone(), mz);
      firedSince = true;
      if (p.mag[p.wkey] <= 0) setTimeout(() => { if (p.alive && p.mag[p.wkey] <= 0) startReload(p); }, 250);
    }
  }
  if (!mouseL) firedSince = false;
  zoomCur += (curZoomTarget() - zoomCur) * Math.min(1, dt * 14);
  if (p.hp < 100 && time - p.lastHurt > 5) p.hp = Math.min(100, p.hp + dt * 12);
  if (p.protect > 0) p.protect -= dt;
}

function updateCamera(dt) {
  const p = player;
  let ex = 0, ey = 0;
  const scoped = p.alive && p.w.scope && aimT > 0.9;
  swayT += dt;
  if (scoped) {
    const amp = (breathHold ? 0.08 : 1) * 0.0045 * (p.crouch ? 0.6 : 1) * (1 + Math.hypot(p.vel.x, p.vel.z) * 0.4);
    ex = (Math.sin(swayT * 1.1) + Math.sin(swayT * 2.3) * 0.4) * amp; ey = (Math.sin(swayT * 1.7) * 0.8 + Math.cos(swayT * 0.9) * 0.4) * amp;
  }
  kick *= Math.exp(-dt * 10);
  if (shake > 0) { shake = Math.max(0, shake - dt); ex += rand(-1, 1) * shake * 0.03; ey += rand(-1, 1) * shake * 0.03; }
  if (p.alive) {
    camera.position.set(p.pos.x, p.pos.y + p.eye, p.pos.z);
    camera.rotation.set(p.pitch + kick + ey, p.yaw + ex, 0);
  } else {
    // death cam: rise and look at the one who got you
    camera.position.y += (p.pos.y + 3.2 - camera.position.y) * Math.min(1, dt * 2);
    const k = p.killer && p.killer !== p && p.killer.alive ? p.killer : null;
    if (k) { k.center(_v); _d.subVectors(_v, camera.position); const ty = Math.atan2(-_d.x, -_d.z), tp = Math.atan2(_d.y, Math.hypot(_d.x, _d.z)); camera.rotation.y += angDiff(camera.rotation.y, ty) * Math.min(1, dt * 4); camera.rotation.x += (tp - camera.rotation.x) * Math.min(1, dt * 4); }
  }
  // zoom: true magnification on the vertical FOV
  const aspect = camera.aspect;
  const vfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(S.fov) / 2) / aspect);
  const zoom = p.alive ? 1 + (zoomCur - 1) * (p.w.scope ? (aimT > 0.9 ? 1 : aimT * 0.25) : aimT) : 1;
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(vfov / 2) / zoom));
  camera.updateProjectionMatrix();
  sky.position.copy(camera.position);
  sunSprite.position.copy(camera.position).add(_v.set(30, 50, 20).normalize().multiplyScalar(300));
  sun.position.set(camera.position.x * 0 + 30, 50, 20);
}
function updateViewmodel(dt) {
  const p = player; vm.visible = p.alive && !(p.w.scope && aimT > 0.9);
  for (const k in vmGuns) vmGuns[k].visible = k === p.wkey;
  const sp = Math.hypot(p.vel.x, p.vel.z);
  p.bob = (p.bob || 0) + dt * sp * 1.6;
  const bobA = p.grounded ? Math.min(1, sp / 6) * (1 - aimT * .85) : 0;
  vmKick *= Math.exp(-dt * 12);
  const ads = p.w.scope ? [0, -0.075, -0.4] : [0, -0.072, -0.52];
  const hip = [0.19, -0.18, -0.52];
  const x = hip[0] + (ads[0] - hip[0]) * aimT + Math.sin(p.bob) * 0.012 * bobA;
  const y = hip[1] + (ads[1] - hip[1]) * aimT + Math.abs(Math.cos(p.bob)) * 0.012 * bobA - (p.swapT > 0 ? p.swapT * .5 : 0) - (p.reloadT > 0 ? 0.05 : 0);
  vm.position.set(x, y, hip[2] + (ads[2] - hip[2]) * aimT + vmKick);
  vm.rotation.set(vmKick * 1.5 + (p.reloadT > 0 ? -.5 * Math.sin(Math.min(1, (p.w.reload - p.reloadT) / p.w.reload) * Math.PI) : 0), 0, p.reloadT > 0 ? .4 : 0);
  if (flashT > 0) { flashT -= dt; if (flashT <= 0) for (const k in vmGuns) vmGuns[k].userData.flash.visible = false; }
}

// ---------------------------------------------------------------- HUD
const hud = { hpn: $('hpn'), hpbar: $('hpbar').firstElementChild, ammo: $('ammo'), wname: $('wname'), slots: $('slots'), reload: $('reloadbar').firstElementChild, cross: $('cross'), scope: $('scope'), zlbl: $('zlbl'), range: $('range'), breath: $('breath').firstElementChild, timer: $('timer'), score: $('scoreline'), nades: $('nades'), vign: $('vign'), tinfo: $('tinfo'), hint: $('hint') };
const mini = $('mini').getContext('2d');
let hitT = null, msgT = null;
function showHit(head, killed) { const h = $('hit'); h.className = killed ? 'kill' : head ? 'head' : ''; h.style.opacity = 1; clearTimeout(hitT); hitT = setTimeout(() => h.style.opacity = 0, 140); }
function showMsg(t) { const m = $('msg'); m.textContent = t; m.style.opacity = 1; clearTimeout(msgT); msgT = setTimeout(() => m.style.opacity = 0, 1600); }
const dmgDirs = [];
function addDmgDir(from) {
  const el = document.createElement('div'); el.innerHTML = '<i></i>'; $('dmgdirs').appendChild(el);
  dmgDirs.push({ el, from, t: 1.2 });
}
function addFeed(k, v, w, head) {
  const el = document.createElement('div');
  if (k === player || v === player) el.className = 'me';
  const dot = c => `<span class="dot" style="background:${c}"></span>`;
  el.innerHTML = k ? `${dot(k.color)}${esc(k.name)}<em>${w}${head ? ' &#10022;' : ''}</em>${dot(v.color)}${esc(v.name)}` : `${dot(v.color)}${esc(v.name)}<em>${w}</em>`;
  $('feed').prepend(el); setTimeout(() => el.remove(), 5000);
  while ($('feed').children.length > 5) $('feed').lastChild.remove();
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function showWeapon() {
  const p = player; hud.wname.textContent = `${p.w.name} · ${p.w.kind}`;
  hud.slots.innerHTML = p.slots.map((k, i) => `<span style="color:${i === p.cur ? '#ffd23a' : ''}">${i + 1} ${WEAPONS[k].name}</span>`).join(' &nbsp; ');
  zoomIdx = Math.min(zoomIdx, p.w.zooms.length - 1); if (p.w.zooms.length > 1 && zoomIdx < 1) zoomIdx = 1;
  zoomCur = curZoomTarget(); renderZoomSteps();
  hud.hint.textContent = p.w.scope ? 'Right click to scope. Scroll or Z / X to zoom 2x to 12x.' : '';
  clearTimeout(showWeapon.t); showWeapon.t = setTimeout(() => hud.hint.textContent = '', 4000);
}
function renderPicks() {
  $('picks').innerHTML = PRIMARIES.map((k, i) => `<div class="${player.nextPrimary === k ? 'on' : ''}">${i + 1} ${WEAPONS[k].name}</div>`).join('') + '<div style="border:0;background:none;color:#a9b0bd">press 1-4 to change gun</div>';
}
function updateHUD(dt) {
  const p = player, w = p.w;
  hud.hpn.textContent = Math.ceil(p.hp); hud.hpbar.style.width = p.hp + '%';
  hud.hpbar.style.background = p.hp < 35 ? '#ff5a3a' : '';
  hud.ammo.innerHTML = `${p.mag[p.wkey]}<small> / ${w.mag}</small>`;
  hud.reload.style.width = p.reloadT > 0 ? (100 * (1 - p.reloadT / w.reload)) + '%' : '0';
  hud.nades.textContent = `Juice bombs: ${p.nades}  (G)`;
  // crosshair
  const scoped = p.alive && w.scope && aimT > 0.9;
  hud.scope.style.opacity = scoped ? 1 : 0;
  const gap = 4 + spreadOf(p) / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * innerHeight / 2;
  const ads = aimT > 0.6;
  const cs = hud.cross.children;
  cs[0].style.top = (-gap - 9) + 'px'; cs[1].style.top = gap + 'px'; cs[2].style.left = (-gap - 9) + 'px'; cs[3].style.left = gap + 'px';
  for (let i = 0; i < 4; i++) cs[i].style.opacity = ads || scoped ? 0 : 1;
  cs[4].style.opacity = scoped ? 0 : 1;
  hud.cross.style.display = p.alive ? '' : 'none';
  if (scoped) {
    hud.zlbl.innerHTML = `${(Math.round(zoomCur * 10) / 10).toFixed(zoomCur < 10 ? 1 : 0)}&times;`;
    camera.getWorldDirection(_dir); const d = rayScene(camera.position, _dir, 400);
    let td = d, tname = null;
    for (const o of bodies) if (o !== p && o.alive) { const t = raySphere(camera.position, _dir, o.center(_cen), .56); if (t < td) { td = t; tname = o.name; } }
    hud.range.textContent = td >= 400 ? '-- m' : `${td.toFixed(1)} m${tname ? '  ·  ' + tname : ''}`;
    hud.breath.style.height = (breath * 100) + '%';
    hud.breath.style.background = breath < .25 ? '#ff7a5a' : '#9fe6ff';
  }
  // target info under crosshair
  let tgt = null;
  if (p.alive) { camera.getWorldDirection(_dir); let best = rayScene(camera.position, _dir, 120); for (const o of bodies) if (o !== p && o.alive) { const t = raySphere(camera.position, _dir, o.center(_cen), .56); if (t < best) { best = t; tgt = o; } } }
  hud.tinfo.style.opacity = tgt && !scoped ? 1 : 0;
  if (tgt) { hud.tinfo.firstElementChild.textContent = tgt.name; hud.tinfo.querySelector('u').style.width = Math.max(0, tgt.hp) + '%'; }
  hurtFlash = Math.max(0, hurtFlash - dt * 1.2);
  hud.vign.style.opacity = Math.max(hurtFlash, p.alive && p.hp < 35 ? 0.35 + Math.sin(time * 4) * .1 : 0);
  // damage direction arcs
  for (let i = dmgDirs.length - 1; i >= 0; i--) {
    const d = dmgDirs[i]; d.t -= dt; if (d.t <= 0) { d.el.remove(); dmgDirs.splice(i, 1); continue; }
    const a = Math.atan2(d.from.x - p.pos.x, d.from.z - p.pos.z);
    const rel = -(a - (p.yaw + Math.PI));
    d.el.style.transform = `rotate(${rel}rad)`; d.el.style.opacity = Math.min(1, d.t * 2);
  }
  // timer and score
  const left = Math.max(0, MATCH_TIME - matchT);
  hud.timer.textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
  const sorted = [...bodies].sort((a, b) => b.kills - a.kills);
  const lead = sorted[0];
  hud.score.innerHTML = `You <b style="color:#ffd23a">${p.kills}</b> &nbsp;&middot;&nbsp; ${lead === p ? 'You lead' : 'Leader ' + esc(lead.name) + ' <b>' + lead.kills + '</b>'} &nbsp;&middot;&nbsp; first to ${KILL_TARGET}`;
  if (!$('death').classList.contains('hide')) $('dsub').dataset.t = Math.ceil(p.respawnT);
  if (!p.alive) $('dtitle').dataset.n = 1, $('death').querySelector('p').textContent = $('dsub').textContent.replace(/ Back in \d+\.\.\.$/, '') + ` Back in ${Math.ceil(p.respawnT)}...`;
  if (!$('board').classList.contains('hide')) renderBoard();
  drawMini();
}
function drawMini() {
  const g = mini, W = 170, sc = W / 2 / 30, p = player;
  g.clearRect(0, 0, W, W);
  g.save(); g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 1, 0, 7); g.clip();
  g.translate(W / 2, W / 2); g.rotate(p.yaw); g.translate(-p.pos.x * sc, -p.pos.z * sc);
  g.fillStyle = 'rgba(201,180,143,.25)'; g.fillRect(-40 * sc, -40 * sc, 80 * sc, 80 * sc);
  for (const c of colliders) { g.fillStyle = c.max.y > 2 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.28)'; g.fillRect(c.min.x * sc, c.min.z * sc, (c.max.x - c.min.x) * sc, (c.max.z - c.min.z) * sc); }
  for (const o of bodies) {
    if (o === p || !o.alive) continue;
    const loud = time - o.lastShot < 1.6;
    if (!loud) continue;
    g.fillStyle = '#ff4b3a'; g.globalAlpha = 1 - (time - o.lastShot) / 1.6; g.beginPath(); g.arc(o.pos.x * sc, o.pos.z * sc, 4, 0, 7); g.fill(); g.globalAlpha = 1;
  }
  g.restore();
  g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(W / 2, W / 2 - 8); g.lineTo(W / 2 + 6, W / 2 + 6); g.lineTo(W / 2 - 6, W / 2 + 6); g.closePath(); g.fill();
}
function renderBoard() {
  const sorted = [...bodies].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  $('boardb').innerHTML = sorted.map(b => `<tr class="${b === player ? 'me' : ''}"><td><span class="dot" style="background:${b.color}"></span>${esc(b.name)}</td><td class="n">${b.kills}</td><td class="n">${b.deaths}</td></tr>`).join('');
}

// ---------------------------------------------------------------- match flow
function startMatch() {
  for (const b of bodies) if (b.model) scene.remove(b.model);
  for (const n of nades) scene.remove(n.m); nades.length = 0;
  parts.length = 0;
  buildViewmodel();
  bodies = [];
  player = new Body(true, S.name || 'You', S.fruit, S.weapon); bodies.push(player);
  const names = [...BOT_NAMES].sort(() => Math.random() - .5);
  for (let i = 0; i < S.bots; i++) {
    let fi = (S.fruit + 1 + i) % FRUITS.length;
    bodies.push(new Body(false, names[i], fi, pick(PRIMARIES)));
  }
  bodies.forEach(b => respawn(b));
  matchT = 0; aimT = 0; zoomIdx = 1; $('feed').innerHTML = '';
  $('pname').textContent = player.name;
  $('death').classList.add('hide');
  state = 'play'; showWeapon();
  track('level_start', { gun: S.weapon, bots: S.bots, skill: ['easy', 'normal', 'hard'][S.diff] });
  ['menu', 'pause', 'end'].forEach(id => $(id).classList.add('hide'));
  $('hud').classList.remove('hide');
  lock();
}
function endMatch() {
  if (state === 'end') return;
  state = 'end'; document.exitPointerLock?.();
  const sorted = [...bodies].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  const place = sorted.indexOf(player) + 1;
  track(place === 1 ? 'level_complete' : 'game_over', { place, kills: player.kills, deaths: player.deaths, seconds: Math.round(matchT) });
  $('etitle').textContent = place === 1 ? 'YOU WIN!' : 'MATCH OVER';
  $('esub').textContent = place === 1 ? `Freshest fruit in the arena. ${player.kills} squeezes.` : `${sorted[0].name} won. You came ${place}${['st', 'nd', 'rd'][place - 1] || 'th'} with ${player.kills} squeezes.`;
  $('endb').innerHTML = sorted.map((b, i) => `<tr class="${b === player ? 'me' : ''}"><td>${i + 1}</td><td><span class="dot" style="background:${b.color}"></span>${esc(b.name)}</td><td class="n">${b.kills}</td><td class="n">${b.deaths}</td></tr>`).join('');
  $('end').classList.remove('hide'); $('death').classList.add('hide'); $('board').classList.add('hide');
}
function lock() { if (TEST) { locked = true; return; } try { const r = canvas.requestPointerLock({ unadjustedMovement: true }); if (r && r.catch) r.catch(() => canvas.requestPointerLock()); } catch (e) { canvas.requestPointerLock(); } }
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (!locked && state === 'play') { state = 'paused'; $('pause').classList.remove('hide'); mouseL = mouseR = false; for (const k in keys) keys[k] = false; }
});

// ---------------------------------------------------------------- input
addEventListener('mousemove', e => {
  if (!locked || state !== 'play' || !player.alive) return;
  const z = player.w.scope && aimT > 0.9 ? zoomCur : 1 + (zoomCur - 1) * aimT;
  const k = 0.0022 * S.sens * (z > 1.01 ? S.scopeSens / z : 1);
  player.yaw -= e.movementX * k; player.pitch = clamp(player.pitch - e.movementY * k, -1.5, 1.5);
});
canvas.addEventListener('mousedown', e => {
  audio();
  if (state === 'play' && !locked) { lock(); return; }
  if (e.button === 0) mouseL = true; if (e.button === 2) mouseR = true;
});
addEventListener('mouseup', e => { if (e.button === 0) mouseL = false; if (e.button === 2) mouseR = false; });
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => {
  if (state !== 'play' || !player.alive) return;
  const d = e.deltaY > 0 ? -1 : 1;
  if (aimT > 0.5 && changeZoom(d)) return;
  if (player.w.zooms.length > 1 && aimT <= 0.5) { swapTo(1 - player.cur); return; }
  swapTo(1 - player.cur);
}, { passive: true });
addEventListener('keydown', e => {
  if (['Tab', 'Space'].includes(e.code)) e.preventDefault();
  if (state !== 'play') return;
  keys[e.code] = true;
  const p = player;
  if (!p.alive) { const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code); if (n >= 0) { p.nextPrimary = PRIMARIES[n]; S.weapon = PRIMARIES[n]; save(); renderPicks(); } return; }
  if (e.code === 'KeyR') startReload(p);
  if (e.code === 'KeyQ') swapTo(1 - p.cur);
  if (e.code === 'Digit1') swapTo(0); if (e.code === 'Digit2') swapTo(1);
  if (e.code === 'KeyZ') changeZoom(1); if (e.code === 'KeyX') changeZoom(-1);
  if (e.code === 'KeyG' && !e.repeat) { camera.getWorldDirection(_dir); throwNade(p, _dir.clone()); }
  if (e.code === 'Tab') { renderBoard(); $('board').classList.remove('hide'); }
});
addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'Tab') $('board').classList.add('hide'); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseL = mouseR = false; });

// ---------------------------------------------------------------- main loop
let last = performance.now();
function step(dt) {
  time += dt; matchT += dt;
  if (matchT >= MATCH_TIME) { endMatch(); return; }
  for (const b of bodies) {
    if (!b.alive) { b.respawnT -= dt; if (b.respawnT <= 0) respawn(b); continue; }
    if (b.isPlayer) playerUpdate(dt);
    else {
      botUpdate(b, dt); moveBody(b, dt);
      if (b.reloadT > 0) { b.reloadT -= dt; if (b.reloadT <= 0) b.mag[b.wkey] = b.w.mag; }
      if (b.swapT > 0) b.swapT -= dt; b.fireT -= dt; b.bloom = Math.max(0, b.bloom - dt * .12);
      if (b.protect > 0) b.protect -= dt;
      if (b.hp < 100 && time - b.lastHurt > 6) b.hp = Math.min(100, b.hp + dt * 10);
    }
  }
  // soft push between fruits
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const a = bodies[i], b = bodies[j]; if (!a.alive || !b.alive || Math.abs(a.pos.y - b.pos.y) > 1.2) continue;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.9 && d > 1e-4) { const push = (0.9 - d) / 2 / d; a.pos.x -= dx * push; a.pos.z -= dz * push; b.pos.x += dx * push; b.pos.z += dz * push; }
  }
  updateNades(dt);
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (state === 'play') step(dt);
  if (player) {
    for (const b of bodies) if (b.model && b.alive) updateModel(b, dt);
    updateCamera(dt); updateViewmodel(dt);
    if (state === 'play' || state === 'paused') updateHUD(dt);
  } else {
    // menu backdrop: slow orbit over the arena
    const a = now / 1000 * 0.06;
    camera.position.set(Math.cos(a) * 34, 16, Math.sin(a) * 34); camera.lookAt(0, 2, 0);
    camera.fov = 55; camera.updateProjectionMatrix(); sky.position.copy(camera.position);
    sunSprite.position.copy(camera.position).add(_v.set(30, 50, 20).normalize().multiplyScalar(300));
  }
  updateParticles(dt);
  for (const t of tracers) if (t.t > 0) { t.t -= dt; t.m.material.opacity = Math.max(0, t.t / 0.07) * 0.9; if (t.t <= 0) t.m.visible = false; }
  for (const s of splats) { s.t -= dt; if (s.t < 3) s.m.material.opacity = Math.max(0, s.t / 3) * .85; }
  renderer.clear();
  renderer.render(scene, camera);
  if (player && state !== 'menu') { renderer.clearDepth(); renderer.render(vmScene, vmCam); }
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- menu
function initMenu() {
  $('name').value = S.name;
  $('name').oninput = e => { S.name = e.target.value.trim().slice(0, 14) || 'You'; save(); };
  $('fruits').innerHTML = FRUITS.map((f, i) => `<button class="fruit ${i === S.fruit ? 'on' : ''}" title="${f.name}" data-i="${i}" style="background:${f.color}"></button>`).join('');
  $('fruits').onclick = e => { const b = e.target.closest('.fruit'); if (!b) return; S.fruit = +b.dataset.i; save(); initMenu(); };
  const stat = (l, v) => `<div class="bar">${l}<i><u style="width:${Math.round(clamp(v, 0.05, 1) * 100)}%"></u></i></div>`;
  $('weps').innerHTML = PRIMARIES.map(k => { const w = WEAPONS[k]; return `<button class="wep ${k === S.weapon ? 'on' : ''}" data-k="${k}"><b>${w.name}</b><small>${w.kind}</small><div class="bars">${stat('Power', w.dmg * w.pellets / 117)}${stat('Speed', 0.07 / w.rate)}${stat('Range', Math.min(1, w.range / 120))}${stat('Zoom', Math.max(...w.zooms) / 12)}</div></button>`; }).join('');
  $('weps').onclick = e => { const b = e.target.closest('.wep'); if (!b) return; S.weapon = b.dataset.k; save(); initMenu(); };
  const bind = (id, key, fmt) => { const el = $(id), o = $(id + 'v'); el.value = S[key]; o.textContent = fmt(S[key]); el.oninput = () => { S[key] = +el.value; o.textContent = fmt(S[key]); save(); if (key === 'vol' && master) master.gain.value = S.vol; }; };
  bind('bots', 'bots', v => v); bind('sens', 'sens', v => (+v).toFixed(2)); bind('ssens', 'scopeSens', v => (+v).toFixed(2)); bind('fov', 'fov', v => v + '°'); bind('vol', 'vol', v => Math.round(v * 100) + '%');
  $('diff').querySelectorAll('button').forEach(b => { b.classList.toggle('on', +b.dataset.v === S.diff); b.onclick = () => { S.diff = +b.dataset.v; save(); initMenu(); }; });
}
initMenu();
$('play').onclick = () => { audio(); startMatch(); };
$('again').onclick = () => { audio(); startMatch(); };
$('resume').onclick = () => { audio(); state = 'play'; $('pause').classList.add('hide'); lock(); };
$('quit').onclick = $('tomenu').onclick = () => {
  state = 'menu'; for (const b of bodies) if (b.model) scene.remove(b.model); bodies = []; player = null;
  ['pause', 'end', 'death'].forEach(id => $(id).classList.add('hide')); $('hud').classList.add('hide'); $('menu').classList.remove('hide'); initMenu();
};
// mil dots on the reticle
$('mils').innerHTML = [-40, -32, -24, -16, -8, 8, 16, 24, 32, 40].map(v => `<circle cx="${v}" cy="0" r=".9"/><circle cx="0" cy="${v}" r=".9"/>`).join('');
// phones and small touch screens: the game needs a keyboard and mouse
const isPhone = () => (matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches) || innerWidth < 700;
// screens never scroll: shrink a panel to fit the window instead
function fitPanels() {
  const show = (id, on) => { if ($(id).classList.contains('hide') === on) $(id).classList.toggle('hide', !on); };
  if (isPhone()) { show('menu', false); show('touchnote', true); }
  else if (state === 'menu') { show('touchnote', false); show('menu', true); }
  for (const p of document.querySelectorAll('.screen .panel')) {
    p.style.transform = '';
    const k = Math.min(1, (innerHeight - 24) / p.offsetHeight, (innerWidth - 24) / p.offsetWidth);
    if (k < 1) p.style.transform = `scale(${k})`;
  }
}
addEventListener('resize', fitPanels);
const panelWatch = new MutationObserver(fitPanels);
for (const el of document.querySelectorAll('.screen')) panelWatch.observe(el, { attributes: true, attributeFilter: ['class'] });
fitPanels();

// test hooks
window.__zs = { get player() { return player; }, get bodies() { return bodies; }, get state() { return state; }, rayScene, raySphere, colliders, burst, tracer, splat, set state(v) { state = v; }, startMatch, step(dt) { step(dt); if (player) updateCamera(dt); }, keys, setMouse(l, r) { mouseL = l; mouseR = r; }, changeZoom, get aimT() { return aimT; }, get zoomCur() { return zoomCur; }, camera, S };
if (TEST) setTimeout(() => startMatch(), 50);
