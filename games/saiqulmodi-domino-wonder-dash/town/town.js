// Wonder Town in 3D (three.js r160, vendored) - the front door of Domino Game. No words anywhere.
//  * Start: a ring of rainbow dominoes with a smiling domino friend, a domino wave running round it.
//    Tap it: the dominoes fall away and the camera swoops down over the island.
//  * The island is shaped like Dubai's Palm Jumeirah: the trunk from the beach, 16 fronds (8 a side) with
//    villas and palms, and the crescent breakwater round it, open towards the mainland; turquoise shallows,
//    waves, foam and sun glitter on the sea.
//  * Seven class segments on the frond tips, each its own famous Indian place and facing its own way: Taj Mahal,
//    Red Fort, Qutub Minar, Gateway of India, Victoria Memorial, Hawa Mahal, Meenakshi Temple.
//  * Every tap on a destination shows two big symbols: RUN or FLY. The student then goes there in one of 7 zigzag
//    runs or 7 flights (none repeats until all are used) over 1/4 of the old distance. The camera moves once to show
//    the whole way and then stands still. On arrival the dominoes topple from the first to the last: 7 colours,
//    7 notes (Sa Re Ga Ma Pa Dha Ni), a different orientation every time.
//  * Then only that class's own NCERT subjects come out as blocks (ncert.SYLLABUS), plus one bag of ancillary
//    subjects, the same in every class. A block opens the game at that subject (../index.html?open=...).
//  * Stone buttons only: back (one step) and home (the whole island).
import * as THREE from 'three';
import { openTrace, activeStage, stageScene } from './trace3d.js';

// ------------------------------------------------------------------ data (keys = the game's house keys)
const CLASSES = [
  { n: 1, colour: 0xffbf00, place: 'taj', yaw: 0 },
  { n: 2, colour: 0x00b46b, place: 'redfort', yaw: 0.35 },
  { n: 3, colour: 0x28c8f0, place: 'qutub', yaw: -0.3 },
  { n: 4, colour: 0x5a4fe0, place: 'gateway', yaw: 0.25 },
  { n: 5, colour: 0x9966cc, place: 'victoria', yaw: -0.35 },
  { n: 6, colour: 0xff7f50, place: 'hawa', yaw: 0.3 },
  { n: 7, colour: 0xe0115f, place: 'meenakshi', yaw: -0.25 },
];
const EXTRAS = ['story', 'family', 'studio', 'museum', 'arcade'];
// what each block shows: a letter/number with rainbow paint, an emoji, or a drawing
const GLYPH = {
  english: { t: 'A' }, hindi: { t: 'अ' }, bangla: { t: 'অ' }, maths: { draw: 'maths' },
  home: { e: '🏠' }, rhymes: { e: '🎵' }, science: { e: '🔬' }, social: { e: '🏺' }, nature: { e: '🐯' },
  food: { e: '🍎' }, travel: { e: '🚂' }, safety: { e: '🚦' }, world: { e: '🌍' }, india: { draw: 'india' },
  fun: { e: '🎡' }, story: { e: '📖' }, family: { e: '👪' }, studio: { e: '🖍️' }, museum: { e: '⭐' }, arcade: { e: '🎮' },
};
const RAINBOW = [0xff3b3b, 0xff8a1e, 0xffd21e, 0x3ccf4e, 0x1fb5ff, 0x4f6bff, 0xb44dff];
GLYPH.evs = { e: '🌱' }; GLYPH.anc = { e: '🎒' }; GLYPH.melas = { e: '🎪' };
GLYPH.mathsplay = { draw: 'maths' }; GLYPH.roadgame = { e: '🚸' }; GLYPH.star = { e: '⭐' };
// tools/export_town_data.py: {classes: {n: {subject: [entry]}}, anc: {subject: [entry]}}, entry = {pic, glyph, href}
let DATA = { classes: {}, anc: {} };
fetch('data.json').then((r) => r.json()).then((d) => { DATA = d; }).catch(() => { /* subjects still open the game */ });

// ------------------------------------------------------------------ renderer, scene, camera
const canvas = document.getElementById('view');
const coarse = window.matchMedia('(pointer: coarse)').matches;
// ?logo: only the domino ring on a clear background (tools/make_ring_icons.py photographs it for the app icons)
const PARAMS = new URLSearchParams(location.search);
const LOGO_ONLY = PARAMS.has('logo');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: LOGO_ONLY, preserveDrawingBuffer: LOGO_ONLY, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const ANISO = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
const HORIZON = new THREE.Color(0xcdeeff);
scene.fog = new THREE.Fog(HORIZON, 900, 3200);
const camera = new THREE.PerspectiveCamera(50, 1, 5, 9000);

const sunDir = new THREE.Vector3(-0.45, 0.78, 0.43).normalize();
scene.add(new THREE.HemisphereLight(0xcfeeff, 0xe9d6a6, 1.0));
const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
sun.position.copy(sunDir).multiplyScalar(900);
sun.castShadow = true;
sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -620, right: 620, top: 620, bottom: -620, near: 100, far: 2200 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.6;
sun.target.position.set(0, 0, -200);
scene.add(sun, sun.target);

// sky dome: deep blue overhead to pale haze at the horizon, a warm glow round the sun
const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uSun: { value: sunDir }, uTop: { value: new THREE.Color(0x2f8fe8) }, uHor: { value: HORIZON } },
  vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform vec3 uSun; uniform vec3 uTop; uniform vec3 uHor; varying vec3 vDir;
    void main(){ float h = max(vDir.y, 0.0); vec3 c = mix(uHor, uTop, pow(h, 0.55));
      float s = max(dot(vDir, uSun), 0.0); c += vec3(1.0,0.93,0.75) * (pow(s, 400.0) * 3.0 + pow(s, 12.0) * 0.25);
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
}));
sky.renderOrder = -4;
scene.add(sky);

// ------------------------------------------------------------------ the Palm: shapes in world x/z
const TRUNK = { half: 15, z0: 70, z1: -320 };
const C = { x: 0, z: -215, r: 335, half: 13, a0: -128, a1: 128 }; // crescent (angle 0 = north)
const FRONDS = [];
for (let i = 0; i < 8; i++) {
  const z = -30 - i * 40;                                   // clear water channels between fronds
  const len = 165 + 105 * Math.sin(Math.PI * (i + 0.5) / 8);
  const ang = THREE.MathUtils.degToRad(50 + i * 1.2);
  for (const side of [-1, 1]) {
    const x0 = side * TRUNK.half;
    FRONDS.push({ i, side, x0, z0: z, x1: x0 + side * Math.sin(ang) * len, z1: z - Math.cos(ang) * len, half: 6 });
  }
}
const frond = (i, side) => FRONDS.find((f) => f.i === i && f.side === side);
const crescentPoint = (deg, r = C.r) => {
  const a = THREE.MathUtils.degToRad(deg);
  return { x: C.x + r * Math.sin(a), z: C.z - r * Math.cos(a) };
};

// map area for the painted ground and the shallow-water mask
const MAP = { x0: -640, z0: -700, size: 1280 };
const MAP_PX = coarse ? 1536 : 2048;
const toPx = (v) => (v / MAP.size) * MAP_PX;
const mx = (x) => toPx(x - MAP.x0), mz = (z) => toPx(z - MAP.z0);

function drawShapes(g, grow, trunkFill) {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  // mainland beach
  g.fillRect(0, mz(TRUNK.z0 - 6 - grow), MAP_PX, MAP_PX);
  // trunk
  g.fillRect(mx(-TRUNK.half - grow), mz(TRUNK.z1 - grow), toPx(2 * (TRUNK.half + grow)), mz(TRUNK.z0) - mz(TRUNK.z1 - grow));
  g.beginPath(); g.arc(mx(0), mz(TRUNK.z1), toPx(TRUNK.half + grow + 4), 0, Math.PI * 2); g.fill();
  // fronds
  g.lineWidth = toPx(2 * (6 + grow));
  for (const f of FRONDS) { g.beginPath(); g.moveTo(mx(f.x0), mz(f.z0)); g.lineTo(mx(f.x1), mz(f.z1)); g.stroke(); }
  // crescent
  g.lineWidth = toPx(2 * (C.half + grow));
  g.beginPath();
  for (let d = C.a0; d <= C.a1; d += 2) { const p = crescentPoint(d); d === C.a0 ? g.moveTo(mx(p.x), mz(p.z)) : g.lineTo(mx(p.x), mz(p.z)); }
  g.stroke();
  if (trunkFill) trunkFill(g);
}

// painted ground: sand edges, gardens inside, the avenue on the trunk, plots on the fronds
function groundTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = MAP_PX;
  const g = cv.getContext('2d');
  g.fillStyle = '#f3dfa8'; g.strokeStyle = '#f3dfa8';
  drawShapes(g, 0);
  // gardens: the same shapes drawn thinner in green (sand stays as the beach round every edge)
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = '#58b947'; g.strokeStyle = '#58b947';
  drawShapes(g, -3.2);
  // lawn texture: soft darker blotches
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 2600; k++) {
    g.fillStyle = `rgba(${40 + rnd() * 40},${120 + rnd() * 60},${30 + rnd() * 30},0.25)`;
    g.beginPath(); g.arc(rnd() * MAP_PX, rnd() * MAP_PX, 2 + rnd() * 7, 0, Math.PI * 2); g.fill();
  }
  // avenue along the trunk + frond roads
  g.fillStyle = '#6f7480';
  g.fillRect(mx(-6), mz(TRUNK.z1), toPx(12), mz(TRUNK.z0 - 4) - mz(TRUNK.z1));
  g.fillStyle = '#ffd84a';
  for (let z = TRUNK.z1; z < TRUNK.z0 - 8; z += 10) g.fillRect(mx(-0.4), mz(z), toPx(0.8), toPx(5));
  g.strokeStyle = '#9aa0aa'; g.lineWidth = toPx(3.4);
  for (const f of FRONDS) { g.beginPath(); g.moveTo(mx(f.x0), mz(f.z0)); g.lineTo(mx(f.x0 + (f.x1 - f.x0) * 0.93), mz(f.z0 + (f.z1 - f.z0) * 0.93)); g.stroke(); }
  g.beginPath();
  for (let d = C.a0 + 4; d <= C.a1 - 4; d += 2) { const p = crescentPoint(d); d === C.a0 + 4 ? g.moveTo(mx(p.x), mz(p.z)) : g.lineTo(mx(p.x), mz(p.z)); }
  g.stroke();
  g.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ANISO;
  return t;
}

// shallow water: land drawn white and blurred wide (turquoise near land, deep blue further out)
function shallowTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  const g = cv.getContext('2d');
  const k = 512 / MAP_PX;
  g.scale(k, k);
  g.fillStyle = '#000'; g.fillRect(0, 0, MAP_PX, MAP_PX);
  g.filter = 'blur(14px)';                    // blur radius in output pixels (512 px over 1280 m)
  g.fillStyle = '#fff'; g.strokeStyle = '#fff';
  drawShapes(g, 10);
  g.filter = 'blur(3px)';
  drawShapes(g, 2);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

const groundTex = groundTexture();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(MAP.size, MAP.size), new THREE.MeshStandardMaterial({ map: groundTex, alphaTest: 0.5, roughness: 0.95, transparent: false }));
// alpha from the painted shapes: where nothing was painted the canvas is transparent
ground.rotation.x = -Math.PI / 2;
ground.position.set(MAP.x0 + MAP.size / 2, 0.6, MAP.z0 + MAP.size / 2);
ground.receiveShadow = true;
scene.add(ground);
// the mainland beyond the map (sand, then greenery)
const mainland = new THREE.Mesh(new THREE.PlaneGeometry(8000, 3000), new THREE.MeshStandardMaterial({ color: 0xe8d39a, roughness: 1 }));
mainland.rotation.x = -Math.PI / 2;
mainland.position.set(0, 0.55, MAP.z0 + MAP.size + 1500 - 10);
mainland.receiveShadow = true;
mainland.renderOrder = -2; mainland.material.depthWrite = false;  // drawn first: can never flicker against the island
scene.add(mainland);

// Dubai's mainland: a skyline of glass towers behind the beach (instanced)
{
  const n = coarse ? 90 : 160;
  const dummy = new THREE.Object3D(); // (the shared one is declared further down)
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const towers = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.35 }), n);
  let sd = 3; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const glass = [0x9cc8e8, 0xd8e4ee, 0x7fb0d8, 0xe9dcc8, 0xb7d3e6];
  for (let i = 0; i < n; i++) {
    let x = (rnd() * 2 - 1) * 1100;
    if (Math.abs(x) < 60) x += Math.sign(x || 1) * 60;
    const z = TRUNK.z0 + 70 + rnd() * 420;
    const h = 30 + Math.pow(rnd(), 2.2) * 210;
    dummy.position.set(x, 0.6, z); dummy.rotation.set(0, rnd() * 0.4, 0); dummy.scale.set(14 + rnd() * 16, h, 14 + rnd() * 16); dummy.updateMatrix();
    towers.setMatrixAt(i, dummy.matrix);
    towers.setColorAt(i, new THREE.Color(glass[i % glass.length]));
  }
  towers.castShadow = true;
  scene.add(towers);
}

// sea: shallow turquoise near land, deep blue outside, moving waves, foam at the shore, sun glitter
const sea = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000, 1, 1), new THREE.ShaderMaterial({
  fog: true,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uTime: { value: 0 }, uShallow: { value: shallowTexture() }, uSun: { value: sunDir },
    uMap: { value: new THREE.Vector4(MAP.x0, MAP.z0, MAP.size, 0) }, uSky: { value: new THREE.Color(0x9fd8ff) },
  }]),
  vertexShader: `varying vec3 vW;
    #include <fog_pars_vertex>
    void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `uniform float uTime; uniform sampler2D uShallow; uniform vec3 uSun; uniform vec4 uMap; uniform vec3 uSky; varying vec3 vW;
    #include <fog_pars_fragment>
    float h(vec2 p){ return sin(p.x*0.11+uTime*1.1)*0.5 + sin(p.y*0.13-uTime*0.9)*0.5 + sin((p.x+p.y)*0.07+uTime*0.7)*0.6 + sin((p.x-p.y*1.3)*0.17+uTime*1.7)*0.12; }
    void main(){
      vec2 uv = (vW.xz - uMap.xy) / uMap.z;
      float sh = (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) ? texture2D(uShallow, vec2(uv.x, 1.0 - uv.y)).r : 0.0;
      vec2 p = vW.xz; float e = 2.5;
      vec3 n = normalize(vec3(h(p - vec2(e,0.0)) - h(p + vec2(e,0.0)), 6.0, h(p - vec2(0.0,e)) - h(p + vec2(0.0,e))));
      vec3 v = normalize(cameraPosition - vW);
      vec3 deep = vec3(0.02, 0.24, 0.48), mid = vec3(0.03, 0.47, 0.68), shallow = vec3(0.16, 0.82, 0.80);
      vec3 col = mix(deep, mid, smoothstep(0.0, 0.25, sh));
      col = mix(col, shallow, smoothstep(0.25, 0.85, sh));
      float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
      col = mix(col, uSky, fres * 0.55);
      vec3 hv = normalize(uSun + v);
      col += vec3(1.0, 0.95, 0.8) * pow(max(dot(n, hv), 0.0), 90.0) * 0.9;
      float foam = smoothstep(0.86, 0.95, sh) * (0.7 + 0.3 * sin(uTime * 0.6 + p.x * 0.05 + p.y * 0.04));
      col = mix(col, vec3(0.96, 0.99, 1.0), foam * 0.7);
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
}));
sea.rotation.x = -Math.PI / 2;
sea.renderOrder = -3; sea.material.depthWrite = false;       // drawn first: the shore can never flicker
scene.add(sea);

// ------------------------------------------------------------------ helpers: merge geometries, rounded boxes
function merge(geos) {
  let total = 0, idx = 0;
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  parts.forEach((g) => { total += g.attributes.position.count; });
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
  for (const g of parts) {
    pos.set(g.attributes.position.array, idx * 3);
    nor.set(g.attributes.normal.array, idx * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, idx * 2);
    idx += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
function roundedBox(w, h, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const bev = Math.min(r * 0.6, d * 0.3);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 8 });
  g.translate(0, 0, -(d - 2 * bev) / 2);
  return g;
}
const dummy = new THREE.Object3D();

// ------------------------------------------------------------------ palms (instanced) and villas (instanced)
const clutter = [];   // palms and villas a journey's way clears for a moment: {meshes, pts}
const palmSpots = [];
for (let z = TRUNK.z0 - 20; z > TRUNK.z1 + 10; z -= 17) for (const s of [-1, 1]) palmSpots.push([s * (TRUNK.half - 4), z]);
for (const f of FRONDS) {
  const L = Math.hypot(f.x1 - f.x0, f.z1 - f.z0);
  const ux = (f.x1 - f.x0) / L, uz = (f.z1 - f.z0) / L;
  for (let d = 14; d < L - 6; d += 17) for (const s of [-1, 1]) palmSpots.push([f.x0 + ux * d - uz * s * 4.2, f.z0 + uz * d + ux * s * 4.2]);
}
for (let d = C.a0 + 3; d <= C.a1 - 3; d += 2.6) { const p = crescentPoint(d, C.r + (Math.round(d) % 2 ? 7 : -7)); palmSpots.push([p.x, p.z]); }
for (let x = -900; x <= 900; x += 15) palmSpots.push([x + Math.sin(x) * 4, TRUNK.z0 + 30 + Math.cos(x * 0.3) * 8]);

function palmGeometries() {
  const trunk = new THREE.CylinderGeometry(0.45, 0.8, 11, 7, 4);
  const p = trunk.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 5.5; p.setX(i, p.getX(i) + (y * y) * 0.012); }
  trunk.translate(0, 5.5, 0);
  trunk.computeVertexNormals();
  const leaves = [];
  for (let k = 0; k < 7; k++) {
    const leaf = new THREE.PlaneGeometry(1.8, 6.5, 1, 5);
    const lp = leaf.attributes.position;
    for (let i = 0; i < lp.count; i++) { const y = lp.getY(i) + 3.25; lp.setZ(i, -y * y * 0.06); lp.setX(i, lp.getX(i) * (1 - y / 7)); }
    leaf.translate(0, 3.25, 0);
    leaf.rotateX(-1.15);
    leaf.rotateY((k / 7) * Math.PI * 2);
    leaf.translate(1.45, 11, 0);
    leaf.computeVertexNormals();
    leaves.push(leaf);
  }
  return { trunk, crown: merge(leaves) };
}
{
  const { trunk, crown } = palmGeometries();
  const tMesh = new THREE.InstancedMesh(trunk, new THREE.MeshStandardMaterial({ color: 0x9a6b3c, roughness: 0.9 }), palmSpots.length);
  const cMesh = new THREE.InstancedMesh(crown, new THREE.MeshStandardMaterial({ color: 0x2f9a3a, roughness: 0.7, side: THREE.DoubleSide }), palmSpots.length);
  palmSpots.forEach(([x, z], i) => {
    const s = 0.85 + ((i * 37) % 10) / 22;
    dummy.position.set(x, 0.6, z);
    dummy.rotation.set(0, (i * 2.4) % (Math.PI * 2), 0);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    tMesh.setMatrixAt(i, dummy.matrix);
    cMesh.setMatrixAt(i, dummy.matrix);
    cMesh.setColorAt(i, new THREE.Color().setHSL(0.3 + ((i * 13) % 10) / 140, 0.62, 0.32 + ((i * 7) % 10) / 70));
  });
  tMesh.castShadow = cMesh.castShadow = true;
  scene.add(tMesh, cMesh);
  clutter.push({ meshes: [tMesh, cMesh], pts: palmSpots });
}
{
  const spots = [];
  for (const f of FRONDS) {
    const L = Math.hypot(f.x1 - f.x0, f.z1 - f.z0);
    const ux = (f.x1 - f.x0) / L, uz = (f.z1 - f.z0) / L;
    for (let d = 22; d < L - 30; d += 15) for (const s of [-1, 1]) spots.push({ x: f.x0 + ux * d - uz * s * 2.4, z: f.z0 + uz * d + ux * s * 2.4, a: Math.atan2(ux, uz) });
  }
  const wallGeo = new THREE.BoxGeometry(4.2, 3.4, 3.8); wallGeo.translate(0, 1.8, 0);
  const roofGeo = new THREE.ConeGeometry(3.4, 2.2, 4); roofGeo.rotateY(Math.PI / 4); roofGeo.translate(0, 4.5, 0);
  const walls = new THREE.InstancedMesh(wallGeo, new THREE.MeshStandardMaterial({ color: 0xfaf3e6, roughness: 0.8 }), spots.length);
  const roofs = new THREE.InstancedMesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), spots.length);
  const roofCols = [0xd9532b, 0xe8743b, 0x2f7fd8, 0xf2b632, 0x46a35a, 0xd94f8a];
  spots.forEach((p, i) => {
    dummy.position.set(p.x, 0.6, p.z); dummy.rotation.set(0, p.a, 0); dummy.scale.setScalar(1); dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix); roofs.setMatrixAt(i, dummy.matrix);
    roofs.setColorAt(i, new THREE.Color(roofCols[i % roofCols.length]));
  });
  walls.castShadow = roofs.castShadow = true;
  walls.receiveShadow = true;
  scene.add(walls, roofs);
  clutter.push({ meshes: [walls, roofs], pts: spots.map((p) => [p.x, p.z]) });
}
// the crown hotel at the crescent's top (the real Palm's landmark), behind Class 7
{
  const p = crescentPoint(0, C.r + 4);
  const hotel = new THREE.Group();
  const towerMat = new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.6 });
  for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(14, 46, 12), towerMat); t.position.set(s * 13, 23, 0); hotel.add(t); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(13, 3.2, 10, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf6dcb8, roughness: 0.5 }));
  arch.position.set(0, 46, 0); hotel.add(arch);
  hotel.position.set(p.x, 0.6, p.z - 18);
  hotel.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(hotel);
}

// ------------------------------------------------------------------ toy blocks with pictures (subjects)
function glyphTexture(key, tint) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, '#fff3d6');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#' + new THREE.Color(tint).getHexString(); g.lineWidth = 16; g.strokeRect(8, 8, 240, 240);
  const spec = GLYPH[key] || { e: '⭐' };
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const paint = (text, size, y = 136) => {
    g.font = `900 ${size}px "Nirmala UI","Noto Sans Devanagari","Noto Sans Bengali","Arial Rounded MT Bold","Segoe UI",sans-serif`;
    const rb = g.createLinearGradient(40, 40, 216, 216);
    ['#ff3b3b', '#ff8a1e', '#ffd21e', '#3ccf4e', '#1fb5ff', '#b44dff'].forEach((c, i) => rb.addColorStop(i / 5, c));
    g.lineJoin = 'round';
    g.lineWidth = 18; g.strokeStyle = '#3a2a5c'; g.strokeText(text, 128, y);
    g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.strokeText(text, 128, y);
    g.fillStyle = rb; g.fillText(text, 128, y);
  };
  if (spec.t) paint(spec.t, 180);
  else if (spec.e) { g.font = '170px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; g.fillText(spec.e, 128, 140); }
  else if (spec.draw === 'maths') { paint('3', 190, 136); g.font = '900 64px sans-serif'; g.fillStyle = '#ff3b9a'; g.fillText('+', 200, 70); g.fillStyle = '#4f6bff'; g.fillText('=', 205, 190); }
  else if (spec.draw === 'india') {
    const y0 = 66, hh = 40;
    [['#ff9933', y0], ['#ffffff', y0 + hh], ['#138808', y0 + 2 * hh]].forEach(([c, y]) => { g.fillStyle = c; g.fillRect(40, y, 176, hh); });
    g.strokeStyle = '#000080'; g.lineWidth = 4; g.beginPath(); g.arc(128, y0 + 1.5 * hh, 15, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; g.beginPath(); g.moveTo(128, y0 + 1.5 * hh); g.lineTo(128 + Math.cos(a) * 15, y0 + 1.5 * hh + Math.sin(a) * 15); g.lineWidth = 1.4; g.stroke(); }
    g.strokeStyle = '#3a2a5c'; g.lineWidth = 3; g.strokeRect(40, y0, 176, 3 * hh);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ANISO;
  return t;
}
const blockGeo = roundedBox(12, 12, 4, 2.2);
function makeBlock(key, tint) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(blockGeo, new THREE.MeshStandardMaterial({ color: tint, roughness: 0.35, metalness: 0.0 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 10.4), new THREE.MeshStandardMaterial({ map: glyphTexture(key, tint), roughness: 0.5 }));
  face.position.z = 2.05;
  g.add(body, face);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.block = key; } });
  g.userData.block = key;
  return g;
}

function makePicBlock(entry, tint) {
  if (!entry.pic) return makeBlock(entry.glyph || 'star', tint);
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#' + new THREE.Color(tint).getHexString(); g.lineWidth = 16; g.strokeRect(8, 8, 240, 240);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = ANISO;
  const img = new Image();
  img.onload = () => { g.drawImage(img, 28, 28, 200, 200); tex.needsUpdate = true; };
  img.src = entry.pic;
  const grp = new THREE.Group();
  const body = new THREE.Mesh(blockGeo, new THREE.MeshStandardMaterial({ color: tint, roughness: 0.35 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 10.4), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
  face.position.z = 2.05;
  grp.add(body, face);
  grp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return grp;
}

// ------------------------------------------------------------------ dominoes (pips) - shared by the ring and the class signs
const pipGeo = new THREE.SphereGeometry(0.42, 12, 8);
const pipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
const PIP_LAYOUT = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  7: [[-1, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [1, 1]],
};
function domino(colour, top, bottom, w = 4, h = 8, d = 1.6) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(roundedBox(w, h, d, w * 0.22), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.28 })));
  const line = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, h * 0.025, d * 0.2), pipMat);
  line.position.z = d / 2; g.add(line);
  const half = (n, cy) => (PIP_LAYOUT[n] || []).forEach(([px, py]) => {
    const p = new THREE.Mesh(pipGeo, pipMat);
    p.scale.setScalar(w / 4);
    p.position.set(px * w * 0.24, cy + py * h * 0.12, d / 2);
    p.scale.z = 0.35 * (w / 4);
    g.add(p);
  });
  half(top, h * 0.25); half(bottom, -h * 0.25);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ------------------------------------------------------------------ class houses, extras, beams, signs
const pickables = [];
const houses = []; // { key, n?, pos, group, sign, beam, look }
function kidHouse(colour, roof, scale = 1) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(roundedBox(26, 22, 18, 3), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.55 }));
  wall.position.y = 11;
  g.add(wall);
  const roofM = new THREE.Mesh(new THREE.ConeGeometry(21, 12, 4), new THREE.MeshStandardMaterial({ color: roof, roughness: 0.5 }));
  roofM.rotation.y = Math.PI / 4; roofM.scale.set(1, 1, 0.82); roofM.position.y = 28; g.add(roofM);
  const door = new THREE.Mesh(roundedBox(6, 9, 1, 2.6), new THREE.MeshStandardMaterial({ color: 0x8a4b23, roughness: 0.6 }));
  door.position.set(0, 4.5, 9.2); g.add(door);
  const winMat = new THREE.MeshStandardMaterial({ color: 0xbfeaff, roughness: 0.15, emissive: 0x2a6f99, emissiveIntensity: 0.15 });
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(3, 24), winMat); w.position.set(s * 8, 12, 9.15); g.add(w);
    const fr = new THREE.Mesh(new THREE.TorusGeometry(3, 0.45, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffffff })); fr.position.copy(w.position); g.add(fr);
  }
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
  chimney.position.set(7, 30, -2); g.add(chimney);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(22, 23, 1.2, 40), new THREE.MeshStandardMaterial({ color: 0xf6e7c1, roughness: 0.9 }));
  pad.position.y = 0.6; g.add(pad);
  g.scale.setScalar(scale);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// ------------------------------------------------------------------ the seven classes' famous places (front = +z)
function onionDome(r, h) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const w = u < 0.6 ? Math.sin((u / 0.6) * Math.PI * 0.62 + 0.55) * 1.05 : Math.pow(1 - (u - 0.6) / 0.4, 1.6) * 0.92;
    pts.push(new THREE.Vector2(Math.max(0.001, w * r), u * h));
  }
  return new THREE.LatheGeometry(pts, 24);
}
function landmark(place) {
  const g = new THREE.Group();
  const mat = (color, roughness = 0.65) => new THREE.MeshStandardMaterial({ color, roughness });
  const add = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  // a box or a cylinder standing on height y
  const box = (w, h, d, m, x = 0, y = 0, z = 0) => add(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z);
  const cyl = (r0, r1, h, m, x = 0, y = 0, z = 0, seg = 16) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y + h / 2, z);
  const dome = (r, h, m, x = 0, y = 0, z = 0) => add(onionDome(r, h), m, x, y, z);
  const arch = (w, h, m, x, y, z) => add(roundedBox(w, h, 0.8, w * 0.42), m, x, y + h / 2, z);
  const dark = mat(0x3a2b28), gold = new THREE.MeshStandardMaterial({ color: 0xffc83a, roughness: 0.3, metalness: 0.5 });
  const water = new THREE.MeshStandardMaterial({ color: 0x41b6e6, roughness: 0.15 });
  const chhatri = (x, y, z, r, m, pillar) => { cyl(r, r, r * 0.9, pillar || m, x, y, z, 8); dome(r * 1.05, r * 1.7, m, x, y + r * 0.9, z); };
  add(new THREE.CylinderGeometry(38, 39, 1.2, 40), mat(0xf6e7c1, 0.9), 0, 0.6, 0);

  if (place === 'taj') {
    const w = mat(0xfbf8f0, 0.35), inlay = mat(0xd9cfc0);
    box(64, 3, 64, inlay, 0, 1);
    box(32, 24, 32, w, 0, 4);
    for (const z of [16.3, -16.3]) arch(12, 19, dark, 0, 4.5, z);
    for (const x of [-11, 11]) { arch(5, 8, dark, x, 5, 16.3); arch(5, 8, dark, x, 15, 16.3); }
    cyl(10.5, 10.5, 5, w, 0, 28);
    dome(13.5, 25, w, 0, 33);
    cyl(0.5, 0.5, 5, gold, 0, 57);
    for (const [x, z] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) chhatri(x, 28, z, 3.6, w);
    for (const [x, z] of [[-28, -28], [28, -28], [-28, 28], [28, 28]]) {
      cyl(1.6, 2.3, 34, w, x, 4, z, 12);
      for (const y of [14, 25, 36]) cyl(2.8, 2.8, 0.7, w, x, y, z, 12);
      chhatri(x, 38, z, 2.5, w);
    }
    box(5, 0.3, 11, water, 0, 4, 24);
  } else if (place === 'redfort') {
    const r = mat(0xb5402f), rd = mat(0x97331f), w = mat(0xf7f2e6, 0.4);
    box(70, 15, 11, r);
    box(70, 2, 12, rd, 0, 13);
    for (let x = -33; x <= 33; x += 4.4) box(2.4, 3, 12, r, x, 15);
    for (const x of [-35, 35]) { cyl(7, 8, 20, r, x, 0, 0, 12); chhatri(x, 20, 0, 4, w, r); }
    box(22, 26, 14, r, 0, 0, 1);
    arch(10, 16, dark, 0, 0.5, 8.3);
    for (let x = -8; x <= 8; x += 4) chhatri(x, 26, 6, 1.5, w, r);
    for (const x of [-12.5, 12.5]) { cyl(4, 4.6, 31, r, x, 0, 3, 8); chhatri(x, 31, 3, 3.6, w, r); }
    cyl(0.4, 0.4, 16, mat(0xdddddd), 0, 26, 0, 8);
    [[0xff9933, 39.4], [0xffffff, 37.8], [0x138808, 36.2]].forEach(([c, y]) => box(7, 1.6, 0.2, mat(c), 3.5, y, 0));
  } else if (place === 'qutub') {
    const a = mat(0xc4683a), b = mat(0xdca06a), base = mat(0xa95a33);
    box(24, 2, 24, base, 0, 1);
    let y = 3, r0 = 11;
    [[22, 8.8, a], [17, 7, b], [13, 5.6, a], [9, 4.6, b], [7, 3.8, a]].forEach(([h, r1, m]) => {
      cyl(r1, r0, h, m, 0, y, 0, 20);
      y += h;
      cyl(r1 + 2, r1 + 1.2, 1.1, base, 0, y - 0.5, 0, 20);
      r0 = r1;
    });
    dome(3.6, 6, b, 0, y);
    arch(5, 8, dark, 0, 3, 10.4);
  } else if (place === 'gateway') {
    const m = mat(0xd8b67c);
    const sh = new THREE.Shape();
    sh.moveTo(-22, 0); sh.lineTo(22, 0); sh.lineTo(22, 36); sh.lineTo(-22, 36); sh.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-10, 0); hole.lineTo(-10, 16); hole.quadraticCurveTo(-9, 26, 0, 30); hole.quadraticCurveTo(9, 26, 10, 16); hole.lineTo(10, 0); hole.closePath();
    sh.holes.push(hole);
    const front = new THREE.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false, curveSegments: 12 });
    front.translate(0, 0, -7);
    add(front, m, 0, 1.2, 0);
    box(46, 2, 16, mat(0xc5a268), 0, 37);
    for (let x = -21; x <= 21; x += 6) box(2.6, 2.2, 17, m, x, 39);
    for (const [x, z] of [[-20, 6], [20, 6], [-20, -6], [20, -6]]) { cyl(3, 3.4, 8, m, x, 39, z, 8); dome(3.6, 7, m, x, 47, z); }
    box(50, 1.4, 22, mat(0xbda072), 0, 0.6);
  } else if (place === 'victoria') {
    const w = mat(0xfafafa, 0.3), c = mat(0xe6e6e2), bronze = mat(0x33424a, 0.4);
    box(68, 18, 30, w, 0, 1);
    box(70, 2, 32, c, 0, 18);
    box(24, 23, 8, w, 0, 1, 16);
    for (let x = -10; x <= 10; x += 5) cyl(1, 1, 18, c, x, 1, 21, 10);
    cyl(11, 13, 10, c, 0, 20);
    dome(14, 20, w, 0, 30);
    cyl(1, 1.6, 3, bronze, 0, 49);
    add(new THREE.SphereGeometry(2.6, 14, 10), bronze, 0, 54, 0);
    for (const [x, z] of [[-30, -11], [30, -11], [-30, 11], [30, 11]]) chhatri(x, 20, z, 4.2, w);
    box(40, 0.3, 10, water, 0, 1.2, 31);
  } else if (place === 'hawa') {
    const m = mat(0xee8a6c), m2 = mat(0xf7b49c), win = mat(0xfff0d8, 0.4);
    const tiers = [[60, 14], [50, 12], [40, 11], [30, 10], [20, 9]];
    let y = 1.2;
    const wins = [];
    tiers.forEach(([w, h], k) => {
      box(w, h, 12 - k, m, 0, y);
      box(w + 1.2, 1, 13 - k, m2, 0, y + h - 0.5);
      for (let x = -(w / 2) + 3; x <= w / 2 - 3; x += 4.4) wins.push([x, y + h * 0.52, 6.3 - k / 2]);
      y += h;
    });
    const wg = new THREE.InstancedMesh(roundedBox(3, 5.4, 1.2, 1.2), win, wins.length);
    wins.forEach(([x, wy, z], i) => { dummy.position.set(x, wy, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); wg.setMatrixAt(i, dummy.matrix); });
    g.add(wg);
    for (const x of [-8, 0, 8]) chhatri(x, y, 0, x ? 2.6 : 3.4, m2);
    arch(9, 11, dark, 0, 1.2, 6.5);
  } else {                                                       // the Meenakshi Temple's gopuram
    const cols = [0xe8503a, 0x2fb5a8, 0xf2c230, 0x4f7ad8, 0xe86fa0, 0x62c04f, 0xf08a2c, 0x9a62d8, 0x32b8e0];
    let y = 1.2;
    const figs = [];
    box(48, 10, 28, mat(0xe9d9b6), 0, y);
    arch(10, 9, dark, 0, y, 14.2);
    y += 10;
    for (let k = 0; k < 9; k++) {
      const w = 42 - k * 3.7, d = 24 - k * 2, h = 6.4;
      box(w, h, d, mat(cols[k]), 0, y);
      box(w + 1.4, 0.9, d + 1.4, mat(0xfff2cc), 0, y + h - 0.5);
      for (let x = -w / 2 + 2; x <= w / 2 - 2; x += 3.2) figs.push([x, y + 2.7, d / 2 + 0.4, cols[(k + Math.abs(Math.round(x))) % 9]]);
      y += h;
    }
    const fg = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.75, 1.5, 3, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), figs.length);
    figs.forEach(([x, fy, z, c], i) => { dummy.position.set(x, fy, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); fg.setMatrixAt(i, dummy.matrix); fg.setColorAt(i, new THREE.Color(c)); });
    g.add(fg);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 12, 16, 1, false, 0, Math.PI), mat(0xe8503a));
    roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.position.set(0, y, 0); g.add(roof);
    for (let x = -5; x <= 5; x += 2.5) { add(new THREE.SphereGeometry(0.9, 10, 8), gold, x, y + 4.8, 0); cyl(0.2, 0.5, 1.8, gold, x, y + 5.3, 0, 6); }
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
function beam(colour) {
  const geo = new THREE.CylinderGeometry(8, 15, 260, 24, 1, true);
  geo.translate(0, 130, 0);
  const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uCol: { value: new THREE.Color(colour) }, uTime: { value: 0 } },
    vertexShader: 'varying float vY; void main(){ vY = position.y / 260.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uCol; uniform float uTime; varying float vY; void main(){ float a = (1.0 - vY) * 0.55 * (0.8 + 0.2 * sin(uTime * 3.0 - vY * 12.0)); gl_FragColor = vec4(uCol * a, a); }',
  }));
  m.renderOrder = 2;
  return m;
}
function auraRing(colour) {
  const r = new THREE.Mesh(new THREE.RingGeometry(40, 50, 48), new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
  r.rotation.x = -Math.PI / 2; r.position.y = 1.4;
  return r;
}

const SIGN_Y = { cls: 90, extra: 40 };
function placeHouse(key, x, z, faceX, faceZ, opts) {
  const group = opts.house;
  group.position.set(x, 0.6, z);
  group.rotation.y = Math.atan2(faceX - x, faceZ - z) + (opts.yaw || 0);   // each class faces its own way
  scene.add(group);
  const item = { key, n: opts.n, pos: new THREE.Vector3(x, 0, z), group, colour: opts.colour };
  if (opts.n) {
    item.beam = beam(opts.colour); item.beam.position.set(x, 0, z); scene.add(item.beam);
    item.ring = auraRing(opts.colour); item.ring.position.set(x, 1.4, z); scene.add(item.ring);
    item.sign = domino(opts.colour, Math.min(6, opts.n), Math.max(0, opts.n - 6) || 0, 4, 8, 1.6);
    if (opts.n === 7) { item.sign = domino(opts.colour, 7, 0, 4, 8, 1.6); }
    item.sign.scale.setScalar(3.6);
    item.sign.position.set(x, SIGN_Y.cls, z);
    scene.add(item.sign);
  } else {
    item.sign = makeBlock(key, opts.colour);
    item.sign.scale.setScalar(1.6);
    item.sign.position.set(x, SIGN_Y.extra, z);
    scene.add(item.sign);
  }
  group.traverse((o) => { o.userData.house = item; });
  item.sign.traverse((o) => { o.userData.house = item; });
  pickables.push(group, item.sign);
  // where the camera stands to look at it: on the island side, a little above
  const toward = new THREE.Vector3(faceX - x, 0, faceZ - z).normalize();
  const far = opts.n ? 165 : 105;
  item.view = { pos: new THREE.Vector3(x + toward.x * far, opts.n ? 78 : 48, z + toward.z * far), look: new THREE.Vector3(x, opts.n ? 38 : 20, z) };
  item.viewBase = item.view.pos.clone();
  houses.push(item);
  return item;
}

// class n -> frond (odd classes on the west, even on the east, up the trunk); Class 7 at the crescent's crown
const CLASS_FROND = { 1: [0, -1], 2: [1, 1], 3: [2, -1], 4: [3, 1], 5: [4, -1], 6: [5, 1] };
for (const c of CLASSES) {
  if (c.n === 7) {
    const p = crescentPoint(0, C.r - 34);
    placeHouse('class7', p.x, p.z, 0, -120, { n: 7, colour: c.colour, yaw: c.yaw, house: landmark(c.place) });
  } else {
    const [i, side] = CLASS_FROND[c.n];
    const f = frond(i, side);
    const tx = f.x0 + (f.x1 - f.x0) * 0.86, tz = f.z0 + (f.z1 - f.z0) * 0.86;
    placeHouse('class' + c.n, tx, tz, f.x0, f.z0 + 30, { n: c.n, colour: c.colour, yaw: c.yaw, house: landmark(c.place) });
  }
}
const EXTRA_FROND = { story: [0, 1], family: [1, -1], studio: [2, 1], museum: [3, -1], arcade: [4, 1] };
const EXTRA_COL = { story: 0xff96be, family: 0x96c878, studio: 0x78c8ff, museum: 0xffd750, arcade: 0xb44dff };
for (const key of EXTRAS) {
  const [i, side] = EXTRA_FROND[key];
  const f = frond(i, side);
  const tx = f.x0 + (f.x1 - f.x0) * 0.55, tz = f.z0 + (f.z1 - f.z0) * 0.55;
  placeHouse(key, tx, tz, f.x0, f.z0 + 20, { colour: EXTRA_COL[key], house: kidHouse(EXTRA_COL[key], 0xffffff, 0.9) });
}

// ------------------------------------------------------------------ the pointing hand (shows the next class)
function pointingHand() {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
  const fist = new THREE.Mesh(roundedBox(9, 7, 6, 2.6), white); fist.position.y = 8; g.add(fist);
  const finger = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 7, 6, 12), white); finger.position.set(-2.4, 1.5, 0); g.add(finger);
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 3, 6, 12), white); thumb.rotation.z = 1.2; thumb.position.set(-4.6, 9.5, 1.5); g.add(thumb);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 3, 20), new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 }));
  cuff.position.y = 13; g.add(cuff);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const hand = pointingHand();
hand.scale.setScalar(0.85);
scene.add(hand);
const visited = new Set(JSON.parse((() => { try { return localStorage.getItem('dg.town.visited') || '[]'; } catch (e) { return '[]'; } })()));
function nextClass() { return houses.find((h) => h.n && !visited.has(h.key)) || houses.find((h) => h.n === 1); }

// ------------------------------------------------------------------ the domino ring logo (start)
const logo = new THREE.Group();
const ringTiles = [];
{
  const N = 30, R = 21;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const mascot = i === 4;
    const t = domino(mascot ? 0xffd21e : RAINBOW[i % RAINBOW.length], 1 + (i % 6), 1 + ((i * 2) % 6), 4, 8, 1.8);
    if (mascot) {
      const face = new THREE.Group();
      const black = new THREE.MeshStandardMaterial({ color: 0x2a1a3a, roughness: 0.3 });
      for (const s of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        eye.position.set(s * 0.95, 1.4, 1.0); face.add(eye);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), black); pupil.position.set(s * 0.95, 1.35, 1.5); face.add(pupil);
        const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), new THREE.MeshBasicMaterial({ color: 0xff7aa8 })); cheek.position.set(s * 1.4, 0.3, 0.92); face.add(cheek);
      }
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.16, 8, 20, Math.PI), black);
      smile.rotation.z = Math.PI; smile.position.set(0, 0.5, 0.95); face.add(smile);
      t.children.filter((o) => o.geometry === pipGeo).forEach((p) => { p.visible = false; });
      t.add(face);
      t.scale.setScalar(1.45);
    }
    const holder = new THREE.Group();
    holder.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
    holder.rotation.z = a - Math.PI / 2; // each tile stands like a spoke, pointing out of the ring
    holder.add(t);
    logo.add(holder);
    ringTiles.push({ holder, tile: t, i, a });
  }
  // sparkle in the middle
  const glow = new THREE.Mesh(new THREE.CircleGeometry(15, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false }));
  logo.add(glow);
  logo.rotation.set(0.3, Math.PI, 0, 'YXZ');
  logo.position.set(0, 268, -975);
  logo.traverse((o) => { o.userData.logo = true; });
  scene.add(logo);
  pickables.push(logo);
}

// ------------------------------------------------------------------ camera moves: smooth spline flights in 5 styles
const VIEWS = {
  logo: { pos: new THREE.Vector3(0, 300, -1080), look: new THREE.Vector3(0, 262, -975) },
  island: { pos: new THREE.Vector3(0, 430, 300), look: new THREE.Vector3(0, 0, -250) },
};
const ISLAND_POS = VIEWS.island.pos.clone(), ISLAND_LOOK = VIEWS.island.look.clone();
let view = 'logo';
let current = null;   // house being visited
let flight = null;    // { curve, lookA, lookB, t, dur, done }
const camLook = VIEWS.logo.look.clone();
camera.position.copy(VIEWS.logo.pos);
camera.lookAt(camLook);

function flyTo(pos, look, done, style = 'arc') {
  const a = camera.position.clone(), b = pos.clone();
  const d = a.distanceTo(b);
  const mid = a.clone().lerp(b, 0.5);
  const side = new THREE.Vector3(b.z - a.z, 0, a.x - b.x).normalize();
  let pts;
  if (style === 'arc') pts = [a, mid.clone().add(new THREE.Vector3(0, 60 + d * 0.22, 0)), b];
  else pts = [a, a.clone().lerp(b, 0.45).setY(Math.max(18, Math.min(a.y, b.y) * 0.25)), a.clone().lerp(b, 0.8).setY(22), b];
  pts.forEach((p) => { p.y = Math.max(p.y, 14); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  flight = { curve, lookA: camLook.clone(), lookB: look.clone(), t: 0, dur: THREE.MathUtils.clamp(1.8 + d / 380, 2.0, 4.5), done };
  whoosh();
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ------------------------------------------------------------------ subject blocks at a house
let blocks = [];
let level = 'subjects';   // at a house: its subject blocks, or one subject's category blocks
function addBlock(b, item, base, k, entry) {
  b.position.copy(base);
  b.lookAt(item.view.pos);
  b.scale.setScalar(0.01);
  b.userData = { entry, base, born: performance.now() / 1000 + k * 0.06 };
  scene.add(b);
  pickables.push(b);
  blocks.push(b);
}
function frame(item) {
  const toCam = item.view.pos.clone().sub(item.pos).setY(0).normalize();
  return { toCam, right: new THREE.Vector3(toCam.z, 0, -toCam.x) };
}
// each class lays its subjects out its own way: [sideways, up, towards the camera] for block k of len
const ARRANGE = {
  1: (k, len) => [(k - (len - 1) / 2) * 24, 0, 0],                                  // a straight row
  2: (k, len) => [(k - (len - 1) / 2) * 24, Math.abs(k - (len - 1) / 2) * 8, 0],    // a V
  3: (k, len) => [(k - (len - 1) / 2) * 24, -Math.abs(k - (len - 1) / 2) * 8, 0],   // an arch
  4: (k, len) => [(k - (len - 1) / 2) * 24, (k - (len - 1) / 2) * 9, 0],            // stairs up
  5: (k, len) => [(k - (len - 1) / 2) * 24, (k - (len - 1) / 2) * -9, 0],           // stairs down
  6: (k, len) => [(k - (len - 1) / 2) * 22, 0, Math.abs(k - (len - 1) / 2) * -14],  // a bow
  7: (k, len) => [(k - (len - 1) / 2) * 22, k % 2 ? 11 : -3, 0],                    // up and down
};
// how many blocks of this spacing fit side by side on this screen, depth in front of the house
function fitCols(item, depth, spacing) {
  const d = Math.hypot(item.view.pos.x - item.pos.x, item.view.pos.z - item.pos.z) - depth;
  const w = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  return Math.max(2, Math.floor((w * 0.92) / spacing));
}
// a row of blocks in front of the house: entries are {key} (a subject) or {key, href} (opens the game)
function showRow(item, entries) {
  const { toCam, right } = frame(item);
  const shape = ARRANGE[item.n] || ARRANGE[1];
  const depth = item.n ? 72 : 46;
  const cols = fitCols(item, depth, 24);
  const rows = Math.ceil(entries.length / cols);
  entries.forEach((entry, k) => {
    let [dx, dy, dz] = shape(k, entries.length);
    let y0 = item.n ? 34 : 24;
    if (entries.length > cols) {                     // too many for one row on this screen: rows
      const r = Math.floor(k / cols), inRow = Math.min(cols, entries.length - r * cols);
      dx = ((k % cols) - (inRow - 1) / 2) * 24; dy = ((rows - 1) / 2 - r) * 22; dz = 0;
      y0 += rows > 2 ? 12 : 4;
    }
    const base = item.pos.clone().addScaledVector(toCam, depth + dz).addScaledVector(right, dx);
    base.y = y0 + dy;
    addBlock(makeBlock(entry.key, item.colour), item, base, k, entry);
  });
  if (!item.n) item.sign.visible = false;
}
// the class's own subjects, then the ancillary bag
function showBlocks(item) {
  clearBlocks();
  level = 'subjects';
  if (!item.n) { showRow(item, [{ key: item.key, href: `?open=${item.key}` }]); return; }
  const own = Object.keys(DATA.classes[item.n] || {});
  showRow(item, [...own.map((key) => ({ key })), { key: 'anc' }]);
}
function showAncillary(item) {
  clearBlocks();
  level = 'anc';
  showRow(item, Object.keys(DATA.anc).map((key) => ({ key, anc: true })));
}
// one subject's categories as picture blocks in rows, in front of the house
function showCategories(item, list, fromAnc) {
  clearBlocks();
  level = fromAnc ? 'anc-cats' : 'cats';
  const cols = Math.min(6, Math.ceil(Math.sqrt(list.length * 1.8)), fitCols(item, item.n ? 78 : 56, 17.5));
  const rows = Math.ceil(list.length / cols);
  const { toCam, right } = frame(item);
  list.forEach((entry, k) => {
    const r = Math.floor(k / cols), c = k % cols;
    const inRow = Math.min(cols, list.length - r * cols);
    const base = item.pos.clone().addScaledVector(toCam, item.n ? 78 : 56).addScaledVector(right, (c - (inRow - 1) / 2) * 17.5);
    base.y = (item.n ? 36 : 26) + ((rows - 1) / 2 - r) * 17;
    addBlock(makePicBlock(entry, item.colour), item, base, k, entry);
  });
  if (!item.n) item.sign.visible = false;
}
function clearBlocks() {
  for (const b of blocks) { scene.remove(b); const i = pickables.indexOf(b); if (i >= 0) pickables.splice(i, 1); }
  blocks = [];
  houses.forEach((h) => { h.sign.visible = true; });
}

// ------------------------------------------------------------------ sound: actions only (tap pop, flight whoosh)
let ac = null;
function audio() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } return ac; }
function pop(freq = 660) {
  const c = audio(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, c.currentTime); o.frequency.exponentialRampToValueAtTime(freq * 1.8, c.currentTime + 0.12);
  g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.3);
}
function whoosh() {
  const c = audio(); if (!c) return;
  const len = 0.9, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length) * 0.5;
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  f.type = 'bandpass'; f.frequency.setValueAtTime(400, c.currentTime); f.frequency.exponentialRampToValueAtTime(1400, c.currentTime + len);
  g.gain.value = 0.12; src.buffer = buf; src.connect(f).connect(g).connect(c.destination); src.start();
}

// ------------------------------------------------------------------ the student who runs or flies
const HERO_SCALE = 2.6;
function makeHero() {
  const g = new THREE.Group();
  const M = (color, roughness = 0.55) => new THREE.MeshStandardMaterial({ color, roughness });
  const skin = M(0xc98a5e), shirt = M(0xffffff), navy = M(0x24305e), hair = M(0x17120f);
  const mesh = (geo, m, x, y, z, parent = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };
  mesh(new THREE.CapsuleGeometry(1.15, 1.7, 4, 12), shirt, 0, 4.4, 0);
  mesh(new THREE.BoxGeometry(0.42, 1.5, 0.2), M(0xe0312f), 0, 4.75, 1.13);
  mesh(new THREE.BoxGeometry(2.0, 2.3, 0.9), M(0xff8a1e), 0, 4.6, -1.35);          // school bag
  mesh(new THREE.SphereGeometry(1.15, 18, 14), skin, 0, 6.9, 0);
  const hr = mesh(new THREE.SphereGeometry(1.19, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 6.97, -0.06);
  hr.rotation.x = -0.25;
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.15, 8, 6), hair, s * 0.42, 7.0, 1.05);
  RAINBOW.forEach((c, k) => {                                                       // the rainbow cap
    const w = new THREE.CylinderGeometry(0.3, 1.28, 0.75, 6, 1, false, (k / 7) * Math.PI * 2, (Math.PI * 2) / 7);
    mesh(w, M(c), 0, 8.1, 0);
  });
  const limb = (x, y, h, r, m, foot) => {
    const pivot = new THREE.Group(); pivot.position.set(x, y, 0); g.add(pivot);
    mesh(new THREE.CapsuleGeometry(r, h, 3, 10), m, 0, -h / 2 - r, 0, pivot);
    if (foot) mesh(new THREE.BoxGeometry(0.7, 0.42, 1.25), M(0x101018), 0, -h - r * 2, 0.22, pivot);
    return pivot;
  };
  const legL = limb(-0.58, 3.1, 1.75, 0.46, navy, true), legR = limb(0.58, 3.1, 1.75, 0.46, navy, true);
  const armL = limb(-1.45, 5.3, 1.6, 0.34, shirt), armR = limb(1.45, 5.3, 1.6, 0.34, shirt);
  // wings for flying
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0); wingShape.bezierCurveTo(1.5, 3.2, 4.5, 3.6, 7, 2.6); wingShape.bezierCurveTo(5.5, 1.4, 4.4, 0.2, 3.8, -0.7); wingShape.bezierCurveTo(2.5, -1, 1, -0.8, 0, -0.5);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, side: THREE.DoubleSide });
  const wings = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 0.7, 5.4, -1.4); g.add(p);
    const w = new THREE.Mesh(new THREE.ShapeGeometry(wingShape, 10), wingMat);
    if (s < 0) w.scale.x = -1;
    p.add(w);
    return p;
  });
  g.scale.setScalar(HERO_SCALE);
  g.visible = false;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g);
  return { g, legL, legR, armL, armR, wings, wingMat };
}
const hero = makeHero();
function heroPose(mode, phase, flap, t) {
  const fly = mode === 'fly';
  hero.wings.forEach((w, k) => { w.visible = fly; w.rotation.y = (k ? -1 : 1) * (0.25 + Math.sin(flap) * 0.65); });
  if (fly) {
    hero.legL.rotation.x = 0.55 + Math.sin(t * 5) * 0.08; hero.legR.rotation.x = 0.6 - Math.sin(t * 5) * 0.08;
    hero.armL.rotation.set(0, 0, -1.25); hero.armR.rotation.set(0, 0, 1.25);
  } else {
    const a = Math.sin(phase) * 0.95;
    hero.legL.rotation.x = a; hero.legR.rotation.x = -a;
    hero.armL.rotation.set(-a * 0.85, 0, -0.08); hero.armR.rotation.set(a * 0.85, 0, 0.08);
  }
}
function heroStand() {
  hero.legL.rotation.x = hero.legR.rotation.x = 0;
  hero.armL.rotation.set(0, 0, -0.08); hero.armR.rotation.set(0, 0, 0.08);
  hero.wings.forEach((w) => { w.visible = false; });
  hero.g.rotation.x = hero.g.rotation.z = 0;
}

// ------------------------------------------------------------------ 7 runs and 7 flights (zigzag shapes, u = 0..1)
const frac = (x) => x - Math.floor(x);
const tri = (x) => 1 - 4 * Math.abs(frac(x + 0.25) - 0.5);                // starts at 0, -1..1
const blocky = (x) => THREE.MathUtils.clamp(tri(x) * 3.2, -1, 1);         // stairs
const saw = (x) => { const f = frac(x); return f < 0.72 ? -1 + (2 * f) / 0.72 : 1 - (2 * (f - 0.72)) / 0.28; };  // lightning
const RUNS = [
  (u) => tri(u * 3.5),                       // 2a even zigzag
  (u) => tri(u * 2) * 1.5,                   // 2b wide zigzag
  (u) => Math.sin(u * Math.PI * 5) * 0.95,   // 2c snake
  (u) => blocky(u * 3),                      // 2d stairs
  (u) => tri(u * 4.5) * (0.2 + 1.2 * u),     // 2e opening out
  (u) => tri(u * 4.5) * (1.4 - 1.2 * u),     // 2f closing in
  (u) => saw(u * 3.5) * 1.15,                // 2g lightning
];
const FLIGHTS = [                            // off: sideways, h: height, flap: wing speed, w: wing colour, roll, warp
  { off: (u) => Math.sin(u * Math.PI) * 0.35, h: (u) => 46 * Math.sin(u * Math.PI), flap: 5, w: 0 },                         // eagle: a calm high arc
  { off: (u) => tri(u * 3) * 0.85, h: (u) => 24 + 11 * Math.sin(u * Math.PI * 7), flap: 26, w: 1 },                          // butterfly: flutter
  { off: (u) => Math.sin(u * Math.PI * 2) * 0.7, h: (u) => 10 + 38 * Math.abs(Math.sin(u * Math.PI * 3)), flap: 11, w: 2 },   // swallow: swoops
  { off: (u) => blocky(u * 2.5) * 0.75, h: (u) => 14 + 7 * Math.floor(u * 6), flap: 42, w: 3 },                              // hummingbird: hover steps
  { off: (u) => Math.sin(u * Math.PI * 3) * 1.25, h: (u) => 32 + 18 * Math.sin(u * Math.PI), flap: 3, w: 4, roll: 0.5 },     // kite: wide sway
  { off: (u) => Math.sin(u * Math.PI) * 0.2, h: (u) => 30 + 20 * Math.sin(u * Math.PI * 4), flap: 2, w: 5, warp: 0.07 },     // paper plane: loops
  { off: (u) => tri(u * 5) * 0.95, h: () => 22, flap: 36, w: 6 },                                                            // dragonfly: darts
];
// colour + note pattern for domino i: 7 ways, colour k always sounds note k
const PATTERNS = [
  (i) => i % 7, (i) => 6 - (i % 7), (i) => { const f = i % 12; return f < 7 ? f : 12 - f; }, (i) => Math.floor(i / 2) % 7,
  (i) => (i * 3) % 7, (i) => (i * 5) % 7, (i) => [0, 2, 4, 6, 5, 3, 1][i % 7],
];
// domino orientation against the path: yaw (radians), sideways shift, size. 7 ways
const ORIENT = [
  () => [0, 0, 1],                                       // square across the way
  () => [0.5, 0, 1],                                     // slanted right
  () => [-0.5, 0, 1],                                    // slanted left
  (i) => [i % 2 ? 0.58 : -0.58, 0, 1],                   // herringbone
  (i) => [Math.sin(i / 3.2) * 0.75, 0, 1],               // fan
  (i) => [0, i % 2 ? 2.4 : -2.4, 1],                     // weave
  (i, n) => [0, 0, 0.72 + 0.6 * (i / Math.max(1, n - 1))],   // small to big
];
// a bag per kind: all seven are used before any repeats, never the same twice running
const bags = {};
function pick(kind, count) {
  let b = bags[kind];
  if (!b || !b.left.length) {
    const last = b ? b.last : undefined;
    const left = [...Array(count).keys()].filter((k) => k !== last).sort(() => Math.random() - 0.5);
    if (last !== undefined) left.splice(1 + Math.floor(Math.random() * (left.length - 1)), 0, last);
    b = bags[kind] = { left, last };
  }
  b.last = b.left.shift();
  return b.last;
}

// ------------------------------------------------------------------ the 7 notes (Sa Re Ga Ma Pa Dha Ni)
const NOTES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
const TIMBRES = [['triangle', 0.16], ['sine', 0.22], ['triangle', 0.1], ['sine', 0.14], ['square', 0.035], ['sawtooth', 0.04], ['triangle', 0.2]];
function note(k, timbre) {
  const c = audio(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  const [type, vol] = TIMBRES[timbre];
  const o = c.createOscillator(), g = c.createGain(), now = c.currentTime;
  o.type = type; o.frequency.value = NOTES[k] * (timbre % 2 ? 2 : 1);
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
  o.connect(g).connect(c.destination); o.start(now); o.stop(now + 0.45);
}

// ------------------------------------------------------------------ one journey: go, arrive, topple
const MAX_TILES = 64, MAX_STONES = 150, MAX_TRAIL = 70;
const tileMesh = (() => {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128;
  const c = cv.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, 64, 128);
  c.fillStyle = '#20182e'; c.fillRect(6, 62, 52, 4);
  [[32, 32], [16, 16], [48, 48], [16, 80], [48, 80], [32, 96], [16, 112], [48, 112]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = ANISO;
  const geo = new THREE.BoxGeometry(5.4, 10, 1.4); geo.translate(0, 5, 0);
  const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.35 }), MAX_TILES);
  m.frustumCulled = false; m.castShadow = true; m.count = 0; scene.add(m);
  return m;
})();
const stoneMesh = (() => {
  const geo = new THREE.BoxGeometry(7.5, 0.5, 3.2);
  const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xfff6dc, roughness: 0.8 }), MAX_STONES);
  m.frustumCulled = false; m.receiveShadow = true; m.count = 0; scene.add(m);
  return m;
})();
const trailMesh = (() => {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), MAX_TRAIL);
  m.frustumCulled = false; m.count = 0; scene.add(m);
  return m;
})();
const tm = new THREE.Object3D(); tm.rotation.order = 'YXZ';
const tmpC = new THREE.Color();
let journey = null;    // the one running
let cleared = [];      // palms and villas moved out of the way: [mesh, index, matrix]
let inStage = false;   // the 3D tracing stage is on: the town only waits
let hop = null;        // the last little hop from the door to the chosen block

function clearWay(pts) {
  restoreWay();
  const zero = new THREE.Matrix4().makeScale(0, 0, 0), m = new THREE.Matrix4(), R2 = 11 * 11;
  for (const set of clutter) {
    set.pts.forEach(([x, z], i) => {
      if (!pts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < R2)) return;
      for (const mesh of set.meshes) { mesh.getMatrixAt(i, m); cleared.push([mesh, i, m.clone()]); mesh.setMatrixAt(i, zero); mesh.instanceMatrix.needsUpdate = true; }
    });
  }
}
function restoreWay() {
  for (const [mesh, i, m] of cleared) { mesh.setMatrixAt(i, m); mesh.instanceMatrix.needsUpdate = true; }
  cleared = [];
}
function clearJourneyThings() {
  restoreWay();
  tileMesh.count = stoneMesh.count = trailMesh.count = 0;
  hero.g.visible = false;
}

// the camera position that shows all these points, looking from direction dir
function frameAll(points, dir) {
  const box = new THREE.Box3().setFromPoints(points);
  const look = box.getCenter(new THREE.Vector3());
  const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect, 1, 9000);
  const v = new THREE.Vector3();
  const fits = (d) => {
    cam.position.copy(look).addScaledVector(dir, d); cam.lookAt(look); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    return points.every((p) => { v.copy(p).project(cam); return Math.abs(v.x) < 0.86 && Math.abs(v.y) < 0.8; });
  };
  let lo = 40, hi = 1600;
  for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  return { pos: look.clone().addScaledVector(dir, hi), look };
}

function startJourney(item, mode) {
  clearJourneyThings();
  clearBlocks();
  current = item;
  view = 'journey';
  setButtons();
  const oldDist = ISLAND_POS.distanceTo(item.viewBase);   // what the camera used to travel
  const L = oldDist / 4;                                        // the whole way is 1/4 of that
  const { toCam } = frame(item);
  const end = item.pos.clone().addScaledVector(toCam, item.n ? 46 : 30).setY(0);
  const angle = (Math.random() * 2 - 1) * 0.4;
  const fwd = toCam.clone().multiplyScalar(-1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  const side = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const fly = mode === 'fly' ? FLIGHTS[pick('flight', 7)] : null;
  const run = fly ? null : RUNS[pick('run', 7)];
  let amp = fly ? 15 : 19, chord = L * 0.8;
  const N = 240;
  const at = (u, c, a) => {
    const e = Math.min(1, u / 0.08, (1 - u) / 0.08);
    const cu = fly && fly.warp ? u - fly.warp * Math.sin(u * Math.PI * 4) : u;
    const o = (fly ? fly.off(u) : run(u)) * a * e;
    return end.clone().addScaledVector(fwd, (cu - 1) * c).addScaledVector(side, o);
  };
  const length = (c, a) => { let s = 0, p = at(0, c, a); for (let i = 1; i <= 80; i++) { const q = at(i / 80, c, a); s += q.distanceTo(p); p = q; } return s; };
  for (let k = 0; k < 8; k++) { chord *= L / length(chord, amp); if (chord < L * 0.45) { amp *= 0.8; chord = L * 0.6; } }
  const pts = [], lens = [0];
  for (let i = 0; i <= N; i++) { pts.push(at(i / N, chord, amp)); if (i) lens.push(lens[i - 1] + pts[i].distanceTo(pts[i - 1])); }
  const pathLen = lens[N];
  const pointAt = (s) => {
    let lo = 0, hi = N;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (lens[m] <= s) lo = m; else hi = m; }
    const k = (s - lens[lo]) / Math.max(1e-6, lens[hi] - lens[lo]);
    return { p: pts[lo].clone().lerp(pts[hi], k), d: pts[hi].clone().sub(pts[lo]).normalize() };
  };

  // dominoes: colour + note pattern, orientation
  const pattern = PATTERNS[pick('pattern', 7)], orient = ORIENT[pick('orient', 7)], timbre = pick('timbre', 7);
  const n = Math.min(MAX_TILES, Math.max(14, Math.floor(pathLen / 4.6)));
  const tiles = [];
  for (let i = 0; i < n; i++) {
    const s = ((i + 0.5) / n) * pathLen;
    const { p, d } = pointAt(s);
    const [dy, shift, size] = orient(i, n);
    const nx = d.z, nz = -d.x;
    tiles.push({ s, x: p.x + nx * shift, z: p.z + nz * shift, yaw: Math.atan2(d.x, d.z) + dy, size, k: pattern(i), fallAt: Infinity, played: false });
    tileMesh.setColorAt(i, tmpC.setHex(RAINBOW[tiles[i].k]));
  }
  tileMesh.count = n;
  tileMesh.instanceColor.needsUpdate = true;
  // the stones under the way
  const stones = [];
  const sn = Math.min(MAX_STONES, Math.floor(pathLen / 3.1));
  for (let i = 0; i < sn; i++) {
    const s = ((i + 0.5) / sn) * pathLen;
    const { p, d } = pointAt(s);
    stones.push({ s });
    tm.position.set(p.x, 1.05, p.z); tm.rotation.set(0, Math.atan2(d.x, d.z), 0); tm.scale.set(1, 1, 1); tm.updateMatrix();
    stoneMesh.setMatrixAt(i, tm.matrix);
  }
  stoneMesh.instanceMatrix.needsUpdate = true;
  stoneMesh.count = 0;
  trailMesh.count = 0;

  // keep the way clear
  const samples = pts.filter((_, i) => i % 6 === 0);
  clearWay(samples);
  const avoid = new Set(houses.filter((h) => h !== item && samples.some((p) => (p.x - h.pos.x) ** 2 + (p.z - h.pos.z) ** 2 < 42 * 42)));

  // one camera position that shows everything, then it stands still
  const upright = camera.aspect < 1;
  const outward = side.clone().multiplyScalar(side.z < 0 ? 1 : -1);    // away from the mainland towers
  const dir = outward.clone().multiplyScalar(upright ? 0.42 : 0.82).addScaledVector(fwd, upright ? -0.85 : -0.3).add(new THREE.Vector3(0, upright ? 0.85 : 0.62, 0)).normalize();
  const fitPts = samples.map((p) => p.clone().setY(fly ? 52 : 22));
  fitPts.push(...samples.map((p) => p.clone().setY(0)), item.pos.clone().setY(item.n ? 60 : 30));
  const shot = frameAll(fitPts, dir);

  hero.g.position.copy(pts[0]);
  hero.g.rotation.set(0, Math.atan2(pts[3].x - pts[0].x, pts[3].z - pts[0].z), 0);
  hero.g.visible = true;
  if (fly) hero.wingMat.color.setHex(RAINBOW[fly.w]);
  whoosh();
  journey = {
    item, mode, fly, tiles, stones, pathLen, pointAt, avoid, timbre, n,
    age: 0, phase: 'go', s: 0, dur: THREE.MathUtils.clamp(pathLen / 60, 2.4, 3.8), t: 0, skip: false,
    camFrom: camera.position.clone(), lookFrom: camLook.clone(), camTo: shot.pos, lookTo: shot.look, flapA: 0, noteNext: 0, trailNext: 0,
  };
  if (PARAMS.has('test')) window.__lastJourney = { key: item.key, oldDist, L, pathLen, dur: journey.dur, n, chord, mode };
}

function drawTiles(j) {
  j.tiles.forEach((d, i) => {
    const up = THREE.MathUtils.clamp((j.s - d.s + 2) / 7, 0, 1);       // stands up just behind the student
    const fall = d.fallAt === Infinity ? 0 : THREE.MathUtils.clamp((j.t - d.fallAt) / 0.26, 0, 1);
    const a = fall * fall * (i === j.n - 1 ? 1.5 : 1.28);
    tm.position.set(d.x, 1.2, d.z);
    tm.rotation.set(a, d.yaw, 0);
    tm.scale.set(d.size, Math.max(0.001, up * d.size), d.size);
    tm.updateMatrix();
    tileMesh.setMatrixAt(i, tm.matrix);
  });
  tileMesh.instanceMatrix.needsUpdate = true;
}

function updateJourney(dt, t) {
  const j = journey;
  if (!j) return;
  j.age += dt;
  if (j.phase === 'go') {
    j.t += dt;
    const k = j.skip ? 1 : Math.min(1, j.t / j.dur);
    j.skip = false;
    j.s = j.pathLen * (k - (Math.sin(2 * Math.PI * k) / (2 * Math.PI)) * 0.6);   // a soft start and stop, never backwards
    const u = j.s / j.pathLen;
    const { p, d } = j.pointAt(j.s);
    const lift = j.fly ? j.fly.h(u) * Math.min(1, u / 0.12, (1 - u) / 0.15) : 0;
    const hopY = j.fly ? 0 : Math.abs(Math.sin(j.s * 0.42)) * 1.5;
    hero.g.position.set(p.x, 1.3 + lift + hopY, p.z);
    let dy = Math.atan2(d.x, d.z) - hero.g.rotation.y;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    hero.g.rotation.y += dy * (1 - Math.exp(-15 * dt));
    j.flapA += dt * (j.fly ? j.fly.flap : 0);
    hero.g.rotation.z = j.fly && j.fly.roll ? Math.sin(u * Math.PI * 3) * j.fly.roll : 0;
    hero.g.rotation.x = j.fly ? 0.75 : 0.18;
    heroPose(j.mode, j.s * 0.42, j.flapA, t);
    // stones appear under the student; a flight leaves a 7-colour trail and plays the 7 notes
    let shown = 0;
    while (shown < j.stones.length && j.stones[shown].s <= j.s + 3) shown++;
    stoneMesh.count = shown;
    if (j.fly) {
      while (j.noteNext < 7 && u >= (j.noteNext + 0.3) / 7) { note(j.noteNext, j.timbre); j.noteNext++; }
      while (j.trailNext < MAX_TRAIL && u >= j.trailNext / MAX_TRAIL) {
        tm.position.copy(hero.g.position); tm.position.y += 12; tm.rotation.set(0, 0, 0); tm.scale.setScalar(1); tm.updateMatrix();
        trailMesh.setMatrixAt(j.trailNext, tm.matrix);
        trailMesh.setColorAt(j.trailNext, tmpC.setHex(RAINBOW[j.trailNext % 7]));
        j.trailNext++;
      }
      trailMesh.count = j.trailNext;
      trailMesh.instanceMatrix.needsUpdate = true;
      if (trailMesh.instanceColor) trailMesh.instanceColor.needsUpdate = true;
    }
    drawTiles(j);
    if (k >= 1) {
      // arrived: stand at the door facing the way back, then the wave runs from the first domino to the last
      heroStand();
      hero.g.position.set(p.x, 1.3, p.z);
      hero.g.rotation.y = Math.atan2(-d.x, -d.z);
      stoneMesh.count = j.stones.length;
      j.phase = 'topple';
      j.s = j.pathLen * 2;
      j.t = 0;
      const RATE = 8;
      j.tiles.forEach((tile, i) => { tile.fallAt = 0.35 + i / RATE; });
      j.end = 0.35 + j.n / RATE + 0.5;
      drawTiles(j);
    }
  } else {
    j.t += dt;
    if (j.skip) { j.skip = false; j.tiles.forEach((d) => { d.fallAt = -1; d.played = true; }); j.end = Math.min(j.end, j.t + 0.2); }
    j.tiles.forEach((d) => { if (!d.played && j.t >= d.fallAt) { d.played = true; note(d.k, j.timbre); } });
    drawTiles(j);
    if (j.t >= j.end) {
      const item = j.item;
      journey = null;
      trailMesh.count = 0;
      view = 'house';
      setButtons();
      camera.position.copy(j.camTo);
      camLook.copy(j.lookTo);
      flyTo(item.view.pos, item.view.look, () => showBlocks(item));
    }
  }
}

// the last hop: from the door to the block, then the game opens
function updateHop(dt, t) {
  if (!hop) return;
  hop.t = Math.min(1, hop.t + dt / hop.dur);
  const e = ease(hop.t);
  hero.g.position.lerpVectors(hop.from, hop.to, e);
  if (hop.mode === 'run') hero.g.position.y += Math.abs(Math.sin(hop.t * Math.PI * 4)) * 5;
  else hero.g.position.y += Math.sin(hop.t * Math.PI) * 18;
  hero.g.rotation.y = Math.atan2(hop.to.x - hop.from.x, hop.to.z - hop.from.z);
  heroPose(hop.mode, hop.t * 18, t * 22, t);
  if (hop.t >= 1) { const { href, trace } = hop; hop = null; if (trace) enterStage(trace, href); else openSubject(href); }
}

// ------------------------------------------------------------------ navigation
const backBtn = document.getElementById('back');
const homeBtn = document.getElementById('home');
function setButtons() { backBtn.hidden = view === 'logo'; homeBtn.hidden = view !== 'house'; }
let logoFall = -1;
// RUN or FLY: shown for every destination (the island, a class or a house, a subject that opens the game)
const chooserEl = document.getElementById('chooser');
let chooser = null;
function openChooser(target) {
  chooser = target;
  chooserEl.hidden = true; void chooserEl.offsetWidth;   // restart the pop-in
  chooserEl.hidden = false;
  pop(700);
}
function closeChooser() { chooser = null; chooserEl.hidden = true; }
function choose(mode) {
  const c = chooser;
  closeChooser();
  if (!c) return;
  audio();
  if (c.kind === 'start') startFromLogo(mode);
  else if (c.kind === 'house') { pop(740); startJourney(c.item, mode); }
  else if (c.kind === 'open') startHop(c, mode);
}
document.getElementById('goRun').onclick = () => choose('run');
document.getElementById('goFly').onclick = () => choose('fly');

function startFromLogo(mode) {
  if (view !== 'logo' || flight) return;
  pop(520);
  logoFall = performance.now() / 1000;
  view = 'island';
  flyTo(VIEWS.island.pos, VIEWS.island.look, null, mode === 'run' ? 'skim' : 'arc');
  setButtons();
}
function goIsland() {
  closeChooser();
  clearBlocks();
  clearJourneyThings();
  current = null;
  view = 'island';
  flyTo(VIEWS.island.pos, VIEWS.island.look);
  setButtons();
}
function startHop(c, mode) {
  whoosh();
  hero.g.visible = true;
  hop = { from: hero.g.position.clone(), to: c.block.position.clone().setY(Math.max(1.3, c.block.position.y - 12)), t: 0, dur: 0.95, mode, href: c.href, trace: c.trace };
  hero.g.rotation.x = mode === 'fly' ? 0.6 : 0.15;
}
function tapBlock(b) {
  const entry = b.userData.entry;
  if (entry.href) { openChooser({ kind: 'open', block: b, href: entry.href, trace: entry.trace }); return; }
  closeChooser();
  if (entry.key === 'anc') { pop(800); showAncillary(current); return; }
  const list = entry.anc ? DATA.anc[entry.key] : (DATA.classes[current.n] || {})[entry.key];
  if (!list) return;
  if (list.length > 1) { pop(800); showCategories(current, list, !!entry.anc); return; }
  openChooser({ kind: 'open', block: b, href: list[0].href, trace: list[0].trace });
}
// the picture's own 3D stage; the town waits behind it
function enterStage(cat, href) {
  const fade = document.getElementById('fade');
  fade.style.opacity = '1';
  setTimeout(async () => {
    if (current && current.n) { visited.add(current.key); /* Stratos box: nothing is saved */ }
    backBtn.hidden = homeBtn.hidden = true;
    inStage = true;
    await openTrace({
      renderer, cat, href, tint: current ? current.colour : 0xffbf00, audio,
      onMore: (url) => openSubject(url),
      onExit: (home) => {
        inStage = false;
        resize();
        if (current) {                     // the student is back at the door, standing
          hero.g.position.copy(current.pos).addScaledVector(frame(current).toCam, current.n ? 46 : 30).setY(1.3);
          heroStand();
        }
        fade.style.opacity = '1';
        setTimeout(() => { fade.style.opacity = '0'; }, 60);
        setButtons();
        if (home) goIsland();
      },
    });
    fade.style.opacity = '0';
  }, 420);
}
function openSubject(href) {
  pop(880);
  if (current && current.n) { visited.add(current.key); /* Stratos box: nothing is saved */ }
  document.getElementById('fade').style.opacity = '1';
  setTimeout(() => { location.href = `../index.html${href}`; }, 520);
}
backBtn.onclick = () => {
  if (chooser) { closeChooser(); return; }
  if (flight || journey || hop) return;
  if (view === 'house' && level === 'anc-cats' && current) { pop(600); showAncillary(current); }
  else if (view === 'house' && (level === 'cats' || level === 'anc') && current) { pop(600); showBlocks(current); }
  else if (view === 'house') goIsland();
  else if (view === 'island') {
    view = 'logo'; logoFall = -1;
    ringTiles.forEach((r) => { r.holder.visible = true; });
    flyTo(VIEWS.logo.pos, VIEWS.logo.look, null, 'arc');
    setButtons();
  }
};
homeBtn.onclick = () => { if (!flight && !journey && !hop) goIsland(); };

// taps (a short press without dragging); drag rotates the island view a little
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = null;
canvas.addEventListener('pointerdown', (e) => { if (inStage) return; down = { x: e.clientX, y: e.clientY, t: performance.now() }; audio(); });
canvas.addEventListener('pointerup', (e) => {
  if (inStage || !down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  down = null;
  if (moved > 10) return;
  if (journey) { journey.skip = true; return; }     // a tap during the journey: straight to the end
  if (flight || hop) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickables, true)[0];
  if (view === 'logo') { openChooser({ kind: 'start' }); return; }
  if (!hit) { closeChooser(); return; }
  const u = hit.object.userData;
  const blk = blocks.find((b) => { for (let o = hit.object; o; o = o.parent) if (o === b) return true; return false; });
  if (blk) { tapBlock(blk); return; }
  if (u.house) openChooser({ kind: 'house', item: u.house });
  else closeChooser();
});

// ------------------------------------------------------------------ loop
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 64 : 50;
  camera.updateProjectionMatrix();
  const k = w < h ? 1.35 : 1;                        // upright phones stand further back so all the blocks fit
  houses.forEach((it) => { it.view.pos.copy(it.view.look).add(it.viewBase.clone().sub(it.view.look).multiplyScalar(k)); });
  // the island view: on an upright phone stand far enough back that all seven classes are on the screen
  VIEWS.island.pos.copy(ISLAND_POS); VIEWS.island.look.copy(ISLAND_LOOK);
  if (w < h) {
    const shot = frameAll(houses.flatMap((it) => [it.pos.clone().setY(0), it.pos.clone().setY(SIGN_Y.cls + 10)]), ISLAND_POS.clone().sub(ISLAND_LOOK).normalize());
    VIEWS.island.pos.copy(shot.pos); VIEWS.island.look.copy(shot.look);
  }
}
addEventListener('resize', resize);
resize();
setButtons();

if (LOGO_ONLY) {
  // only the ring and the lights; the camera square in front of it; the wave paused mid-run
  scene.children.forEach((o) => { if (o !== logo && !o.isLight) o.visible = false; });
  scene.fog = null;
  document.querySelectorAll('.stone').forEach((b) => { b.hidden = true; });
  document.body.style.background = 'transparent';
  document.documentElement.style.background = 'transparent';
  const front = new THREE.DirectionalLight(0xffffff, 1.6); front.position.set(-30, 50, -120); scene.add(front);
  renderer.setClearColor(0x000000, 0);
  logo.position.set(0, 0, 0);
  logo.rotation.set(0.25, Math.PI + 0.18, 0, 'YXZ');
  camera.fov = 30; camera.aspect = 1; camera.updateProjectionMatrix();
  camera.position.set(0, 0, -112); camera.lookAt(0, 0, 0);
  ringTiles.forEach((r) => { r.tile.rotation.x = Math.max(0, Math.sin(1.3 - r.i * 0.42)) * 0.6; });
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.render(scene, camera);
  document.title = 'ready';
}

const clock = new THREE.Clock();
if (!LOGO_ONLY) renderer.setAnimationLoop(() => {
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  if (inStage) {
    const play = activeStage();
    if (play) { play.frame(dt); const s = stageScene(); renderer.render(s.scene, s.camera); }
    return;
  }
  sea.material.uniforms.uTime.value = t;

  // domino ring: a toppling wave runs round it; after the tap the tiles fall away
  ringTiles.forEach((r) => {
    const w = Math.sin(t * 2.6 - r.i * 0.42);
    r.tile.rotation.x = Math.max(0, w) * 0.75;
  });
  if (logoFall > 0) {
    const k = performance.now() / 1000 - logoFall;
    ringTiles.forEach((r) => {
      const kk = Math.max(0, k - r.i * 0.02);
      r.holder.position.set(Math.cos(r.a) * (21 + kk * 40), Math.sin(r.a) * 21 - kk * kk * 90, kk * 30);
      r.holder.rotation.x = kk * 4;
      if (kk > 1.4) r.holder.visible = false;
    });
  } else {
    ringTiles.forEach((r) => { r.holder.position.set(Math.cos(r.a) * 21, Math.sin(r.a) * 21, 0); r.holder.rotation.x = 0; });
  }
  logo.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.12;
  logo.position.y = 268 + Math.sin(t * 1.1) * 1.5;

  // at a house, other houses that come between the camera and the blocks step aside (hidden)
  for (const h of houses) {
    const near = ((view === 'house' || journey) && current && h !== current && h.group.position.distanceTo(camera.position) < (camera.aspect < 1 ? 200 : 120)) || !!(journey && journey.avoid.has(h));
    h.group.visible = !near;
    if (h !== current || level !== 'cats') h.sign.visible = !near && !(view === 'house' && h === current && !h.n);
  }

  // class signs spin, beams shimmer, rings breathe, blocks pop in and bob
  houses.forEach((h, k) => {
    h.sign.rotation.y = t * 0.8 + k;
    h.sign.position.y = (h.n ? SIGN_Y.cls : SIGN_Y.extra) + Math.sin(t * 1.4 + k) * 1.5;
    if (h.beam) h.beam.material.uniforms.uTime.value = t;
  });
  for (const b of blocks) {
    const life = performance.now() / 1000 - b.userData.born;
    const s = life < 0 ? 0.01 : Math.min(1, 1 - Math.pow(1 - Math.min(1, life / 0.45), 3) + Math.sin(Math.min(1, life / 0.45) * Math.PI) * 0.15);
    b.scale.setScalar(Math.max(0.01, s) * (level === 'cats' || level === 'anc-cats' ? 1.2 : 1.45));
    b.position.y = b.userData.base.y + Math.sin(t * 2 + b.userData.base.x) * 1.2;
  }

  // the pointing hand: over the next class on the island; over the first block at a house
  const target = chooser && chooser.item ? chooser.item.pos.clone().setY(SIGN_Y.cls + 22) : view === 'house' && blocks.length ? blocks[0].position : (nextClass() ? nextClass().pos.clone().setY(SIGN_Y.cls + 22) : null);
  hand.visible = view !== 'logo' && !!target && !flight && !journey && !hop;
  if (target) {
    hand.position.set(target.x, target.y + (view === 'house' ? 12 : 10) + Math.abs(Math.sin(t * 3.2)) * 4, target.z);
    hand.rotation.y = Math.atan2(camera.position.x - hand.position.x, camera.position.z - hand.position.z);
  }

  updateJourney(dt, t);
  updateHop(dt, t);

  // camera: follows a flight's spline, or stands completely still (no sway, no shaking)
  if (flight) {
    flight.t = Math.min(1, flight.t + dt / flight.dur);
    const e = ease(flight.t);
    camera.position.copy(flight.curve.getPointAt(e));
    camLook.copy(flight.lookA).lerp(flight.lookB, ease(Math.min(1, flight.t * 1.15)));
    if (flight.t >= 1) { const done = flight.done; flight = null; if (done) done(); }
  } else if (journey) {
    const e = ease(Math.min(1, journey.age / 0.8));
    camera.position.lerpVectors(journey.camFrom, journey.camTo, e);
    camLook.lerpVectors(journey.lookFrom, journey.lookTo, e);
  } else {
    const v = view === 'house' && current ? current.view : VIEWS[view];
    camera.position.lerp(v.pos, 1 - Math.exp(-2.5 * dt));
    camLook.lerp(v.look, 1 - Math.exp(-3 * dt));
  }
  camera.lookAt(camLook);
  renderer.render(scene, camera);
});
if (PARAMS.has('test')) window.__town = { houses, camera, THREE, get view() { return view; }, get level() { return level; }, get journey() { return journey; }, get flight() { return flight; }, get blocks() { return blocks; }, get hop() { return hop; } };
