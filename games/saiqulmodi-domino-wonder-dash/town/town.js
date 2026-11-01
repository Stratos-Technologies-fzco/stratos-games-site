// Wonder Town in 3D (three.js r160, vendored) - the front door of Domino Game. No words anywhere.
//  * Start: a ring of rainbow dominoes with a smiling domino friend, a domino wave running round it.
//    Tap it: the dominoes fall away and the camera swoops down over the island.
//  * The island is shaped like Dubai's Palm Jumeirah: the trunk from the beach, 16 fronds (8 a side) with
//    villas and palms, and the crescent breakwater round it, open towards the mainland; turquoise shallows,
//    waves, foam and sun glitter on the sea.
//  * Seven class houses on the frond tips (Class 7 at the crescent's crown): big, bright, a light beam each and a
//    giant domino whose pips show the class number. A pointing hand shows the next class to visit.
//  * Tap a house: a smooth flight there (5 styles, never the same twice running, 2-4.5 s), then its subjects
//    pop out as toy blocks (A, अ, অ, 3+=, globe ...). Tap a block: the game opens at that subject
//    (../index.html?open=<key>, handled in main.py _web_open_key).
//  * Stone buttons only: back (one step) and home (the whole island).
import * as THREE from 'three';

// ------------------------------------------------------------------ data (keys = the game's house keys)
const CLASSES = [
  { n: 1, colour: 0xffbf00, roof: 0xff5a36, subjects: ['english', 'hindi'] },
  { n: 2, colour: 0x00b46b, roof: 0x2a7bff, subjects: ['maths', 'home', 'rhymes'] },
  { n: 3, colour: 0x28c8f0, roof: 0xff7a2a, subjects: ['science', 'social'] },
  { n: 4, colour: 0x5a4fe0, roof: 0xffc21e, subjects: ['nature', 'food'] },
  { n: 5, colour: 0x9966cc, roof: 0x3ccf4e, subjects: ['travel', 'bangla'] },
  { n: 6, colour: 0xff7f50, roof: 0x1fb5ff, subjects: ['safety', 'world'] },
  { n: 7, colour: 0xe0115f, roof: 0xffd21e, subjects: ['india', 'fun'] },
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
GLYPH.mathsplay = { draw: 'maths' }; GLYPH.roadgame = { e: '🚸' }; GLYPH.star = { e: '⭐' };
// every house's categories (tools/export_town_data.py): [{pic: 'thumbs/n.webp' | null, glyph}], game order
let DATA = {};
fetch('data.json').then((r) => r.json()).then((d) => { DATA = d; }).catch(() => { /* subjects still open the game */ });

// ------------------------------------------------------------------ renderer, scene, camera
const canvas = document.getElementById('view');
const coarse = window.matchMedia('(pointer: coarse)').matches;
// ?logo: only the domino ring on a clear background (tools/make_ring_icons.py photographs it for the app icons)
const LOGO_ONLY = new URLSearchParams(location.search).has('logo');
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
const camera = new THREE.PerspectiveCamera(50, 1, 1, 9000);

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
      float foam = smoothstep(0.86, 0.95, sh) * (0.55 + 0.45 * sin(uTime * 2.0 + p.x * 0.3 + p.y * 0.2));
      col = mix(col, vec3(0.96, 0.99, 1.0), foam * 0.7);
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
}));
sea.rotation.x = -Math.PI / 2;
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

const SIGN_Y = { cls: 78, extra: 40 };
function placeHouse(key, x, z, faceX, faceZ, opts) {
  const group = opts.house;
  group.position.set(x, 0.6, z);
  group.rotation.y = Math.atan2(faceX - x, faceZ - z);
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
  houses.push(item);
  return item;
}

// class n -> frond (odd classes on the west, even on the east, up the trunk); Class 7 at the crescent's crown
const CLASS_FROND = { 1: [0, -1], 2: [1, 1], 3: [2, -1], 4: [3, 1], 5: [4, -1], 6: [5, 1] };
for (const c of CLASSES) {
  if (c.n === 7) {
    const p = crescentPoint(0, C.r - 34);
    placeHouse('class7', p.x, p.z, 0, -120, { n: 7, colour: c.colour, house: kidHouse(c.colour, c.roof, 1.9) });
  } else {
    const [i, side] = CLASS_FROND[c.n];
    const f = frond(i, side);
    const tx = f.x0 + (f.x1 - f.x0) * 0.86, tz = f.z0 + (f.z1 - f.z0) * 0.86;
    placeHouse('class' + c.n, tx, tz, f.x0, f.z0 + 30, { n: c.n, colour: c.colour, house: kidHouse(c.colour, c.roof, 1.7) });
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
let view = 'logo';
let current = null;   // house being visited
let flight = null;    // { curve, lookA, lookB, t, dur, done }
const camLook = VIEWS.logo.look.clone();
camera.position.copy(VIEWS.logo.pos);
camera.lookAt(camLook);

const STYLES = ['arc', 'swoop', 'skim', 'spiral', 'coaster'];
let bag = [];
let lastStyle = null;
function nextStyle() {
  if (!bag.length) { bag = STYLES.filter((s) => s !== lastStyle).sort(() => Math.random() - 0.5); if (lastStyle) bag.push(lastStyle); }
  lastStyle = bag.shift();
  return lastStyle;
}
function flyTo(pos, look, done, style = nextStyle()) {
  const a = camera.position.clone(), b = pos.clone();
  const d = a.distanceTo(b);
  const mid = a.clone().lerp(b, 0.5);
  const side = new THREE.Vector3(b.z - a.z, 0, a.x - b.x).normalize();
  let pts;
  if (style === 'arc') pts = [a, mid.clone().add(new THREE.Vector3(0, 60 + d * 0.22, 0)), b];
  else if (style === 'swoop') pts = [a, mid.clone().addScaledVector(side, d * 0.32).add(new THREE.Vector3(0, 30, 0)), b];
  else if (style === 'skim') pts = [a, a.clone().lerp(b, 0.45).setY(Math.max(18, Math.min(a.y, b.y) * 0.25)), a.clone().lerp(b, 0.8).setY(22), b];
  else if (style === 'spiral') {
    const c = look.clone().setY(0);
    const r = Math.max(110, b.clone().setY(0).distanceTo(c));
    const start = Math.atan2(b.x - c.x, b.z - c.z) + Math.PI * 1.2;
    pts = [a, mid.clone().setY(Math.max(a.y, b.y) + 40)];
    for (let k = 0; k <= 3; k++) { const ang = start - (k / 3) * Math.PI * 1.2; pts.push(new THREE.Vector3(c.x + Math.sin(ang) * r, b.y + 50 * (1 - k / 3), c.z + Math.cos(ang) * r)); }
    pts.push(b);
  } else { // coaster
    pts = [a];
    for (let k = 1; k <= 3; k++) { const p = a.clone().lerp(b, k / 4); p.y += k % 2 ? 55 : -15; pts.push(p); }
    pts.push(b);
  }
  pts.forEach((p) => { p.y = Math.max(p.y, 14); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  flight = { curve, lookA: camLook.clone(), lookB: look.clone(), t: 0, dur: THREE.MathUtils.clamp(1.8 + d / 380, 2.0, 4.5), done };
  whoosh();
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ------------------------------------------------------------------ subject blocks at a house
let blocks = [];
let level = 'subjects';   // at a house: its subject blocks, or one subject's category blocks
let openKey = null;       // the subject whose categories are out
function addBlock(b, item, base, k, key, cat) {
  b.position.copy(base);
  b.lookAt(item.view.pos);
  b.scale.setScalar(0.01);
  b.userData = { key, cat, base, born: performance.now() / 1000 + k * 0.06 };
  scene.add(b);
  pickables.push(b);
  blocks.push(b);
}
function frame(item) {
  const toCam = item.view.pos.clone().sub(item.pos).setY(0).normalize();
  return { toCam, right: new THREE.Vector3(toCam.z, 0, -toCam.x) };
}
function showBlocks(item) {
  clearBlocks();
  level = 'subjects';
  const keys = item.n ? CLASSES.find((c) => c.n === item.n).subjects : [item.key];
  const { toCam, right } = frame(item);
  keys.forEach((key, k) => {
    const off = (k - (keys.length - 1) / 2) * 19;
    const base = item.pos.clone().addScaledVector(toCam, item.n ? 66 : 46).addScaledVector(right, off * 1.25);
    base.y = item.n ? 34 : 24;
    addBlock(makeBlock(key, item.colour), item, base, k, key, undefined);
  });
  if (!item.n) item.sign.visible = false;
}
// one subject's categories as picture blocks in rows, in front of the house
function showCategories(item, key) {
  clearBlocks();
  level = 'cats';
  openKey = key;
  const list = DATA[key];
  const cols = Math.min(6, Math.ceil(Math.sqrt(list.length * 1.8)));
  const rows = Math.ceil(list.length / cols);
  const { toCam, right } = frame(item);
  list.forEach((entry, k) => {
    const r = Math.floor(k / cols), c = k % cols;
    const inRow = Math.min(cols, list.length - r * cols);
    const base = item.pos.clone().addScaledVector(toCam, item.n ? 78 : 56).addScaledVector(right, (c - (inRow - 1) / 2) * 17.5);
    base.y = (item.n ? 36 : 26) + ((rows - 1) / 2 - r) * 17;
    addBlock(makePicBlock(entry, item.colour), item, base, k, key, k);
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

// ------------------------------------------------------------------ navigation
const backBtn = document.getElementById('back');
const homeBtn = document.getElementById('home');
function setButtons() { backBtn.hidden = view === 'logo'; homeBtn.hidden = view !== 'house'; }
let logoFall = -1;
function startFromLogo() {
  if (view !== 'logo' || flight) return;
  pop(520);
  logoFall = performance.now() / 1000;
  view = 'island';
  flyTo(VIEWS.island.pos, VIEWS.island.look, null, 'arc');
  setButtons();
}
function goIsland() {
  clearBlocks();
  current = null;
  view = 'island';
  flyTo(VIEWS.island.pos, VIEWS.island.look);
  setButtons();
}
function goHouse(item) {
  clearBlocks();
  current = item;
  view = 'house';
  pop(740);
  flyTo(item.view.pos, item.view.look, () => showBlocks(item));
  setButtons();
}
function tapBlock(b) {
  const { key, cat } = b.userData;
  if (cat !== undefined) { openSubject(key, cat); return; }
  const list = DATA[key];
  if (list && list.length > 1) { pop(800); showCategories(current, key); return; }
  openSubject(key, list && list.length === 1 ? 0 : undefined);
}
function openSubject(key, cat) {
  pop(880);
  if (current && current.n) { visited.add(current.key); /* Stratos box: nothing is saved */ }
  document.getElementById('fade').style.opacity = '1';
  const extra = cat !== undefined ? `&cat=${cat}` : '';
  setTimeout(() => { location.href = `../index.html?open=${encodeURIComponent(key)}${extra}`; }, 520);
}
backBtn.onclick = () => {
  if (flight) return;
  if (view === 'house' && level === 'cats' && current) { pop(600); showBlocks(current); }
  else if (view === 'house') goIsland();
  else if (view === 'island') {
    view = 'logo'; logoFall = -1;
    ringTiles.forEach((r) => { r.holder.visible = true; });
    flyTo(VIEWS.logo.pos, VIEWS.logo.look, null, 'arc');
    setButtons();
  }
};
homeBtn.onclick = () => { if (!flight) goIsland(); };

// taps (a short press without dragging); drag rotates the island view a little
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; audio(); });
canvas.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  down = null;
  if (moved > 10 || flight) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickables, true)[0];
  if (!hit) { if (view === 'logo') startFromLogo(); return; }
  const u = hit.object.userData;
  if (view === 'logo') { startFromLogo(); return; }
  const blk = blocks.find((b) => { for (let o = hit.object; o; o = o.parent) if (o === b) return true; return false; });
  if (blk) { tapBlock(blk); return; }
  if (u.house) goHouse(u.house);
});

// ------------------------------------------------------------------ loop
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 64 : 50;
  camera.updateProjectionMatrix();
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
    const near = view === 'house' && current && h !== current && h.group.position.distanceTo(camera.position) < 120;
    h.group.visible = !near;
    if (h !== current || level !== 'cats') h.sign.visible = !near && !(view === 'house' && h === current && !h.n);
  }

  // class signs spin, beams shimmer, rings breathe, blocks pop in and bob
  houses.forEach((h, k) => {
    h.sign.rotation.y = t * 0.8 + k;
    h.sign.position.y = (h.n ? SIGN_Y.cls : SIGN_Y.extra) + Math.sin(t * 1.4 + k) * 1.5;
    if (h.beam) h.beam.material.uniforms.uTime.value = t;
    if (h.ring) { const s = 1 + 0.06 * Math.sin(t * 2.2 + k); h.ring.scale.set(s, s, s); }
  });
  for (const b of blocks) {
    const life = performance.now() / 1000 - b.userData.born;
    const s = life < 0 ? 0.01 : Math.min(1, 1 - Math.pow(1 - Math.min(1, life / 0.45), 3) + Math.sin(Math.min(1, life / 0.45) * Math.PI) * 0.15);
    b.scale.setScalar(Math.max(0.01, s) * (level === 'cats' ? 1.2 : 1.45));
    b.position.y = b.userData.base.y + Math.sin(t * 2 + b.userData.base.x) * 1.2;
  }

  // the pointing hand: over the next class on the island; over the first block at a house
  const target = view === 'house' && blocks.length ? blocks[0].position : (nextClass() ? nextClass().pos.clone().setY(SIGN_Y.cls + 22) : null);
  hand.visible = view !== 'logo' && !!target && !flight;
  if (target) {
    hand.position.set(target.x, target.y + (view === 'house' ? 12 : 10) + Math.abs(Math.sin(t * 3.2)) * 4, target.z);
    hand.rotation.y = Math.atan2(camera.position.x - hand.position.x, camera.position.z - hand.position.z);
  }

  // camera: on a flight follow the spline (eased); otherwise drift gently - no shaking, ever
  if (flight) {
    flight.t = Math.min(1, flight.t + dt / flight.dur);
    const e = ease(flight.t);
    camera.position.copy(flight.curve.getPointAt(e));
    camLook.copy(flight.lookA).lerp(flight.lookB, ease(Math.min(1, flight.t * 1.15)));
    if (flight.t >= 1) { const done = flight.done; flight = null; if (done) done(); }
  } else {
    const v = view === 'house' && current ? current.view : VIEWS[view];
    const sway = view === 'island' ? 18 : 3;
    const want = v.pos.clone().add(new THREE.Vector3(Math.sin(t * 0.15) * sway, 0, 0));
    camera.position.lerp(want, 1 - Math.exp(-2.5 * dt));
    camLook.lerp(v.look, 1 - Math.exp(-3 * dt));
  }
  camera.lookAt(camLook);
  renderer.render(scene, camera);
});
