// The 3D tracing stage: a table on a little island. The child's finger follows the dotted real outline; big letter
// dominoes drop onto it (C for Car); a tap pushes the first one and the wave runs from first to last with 7 colours and
// 7 notes; the real picture then stands up from the table. Same dots and rules as the pygame game (main.py): a dot counts
// within 24 px, 95% completes, only the first picture of a visit speaks. tools/export_trace3d.py writes the data.
import * as THREE from 'three';

const S = 0.1;                                  // 1 px of the 440 box = 0.1 world units; the table top is y = 0
const X = (x) => (x - 220) * S, Z = (y) => (y - 220) * S;
const RADIUS = 2.4, DONE_SHARE = 0.95, LETTER_SPACING = 34 * S;
const RAINBOW = [0xff3b3b, 0xff8a1e, 0xffd21e, 0x3ccf4e, 0x1fb5ff, 0x4f6bff, 0xb44dff];
const NOTES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
const TIMBRES = ['triangle', 'sine', 'triangle', 'sine'];
const PATTERNS = [(i) => i % 7, (i) => 6 - (i % 7), (i) => { const f = i % 12; return f < 7 ? f : 12 - f; }, (i) => Math.floor(i / 2) % 7,
  (i) => (i * 3) % 7, (i) => (i * 5) % 7, (i) => [0, 2, 4, 6, 5, 3, 1][i % 7]];
const STORAGE_KEY = 'domino_wonder_dash_progress';     // the game's own progress (fun.py): one list of done pictures
const OWN_HOST = /github\.io|^127\.0\.0\.1|^localhost|^192\.168\.|^100\./.test(location.host);   // this site or a test on the home network
const PAGES = 'https://saiqulmodi.github.io/DominoGame/town/';
const FONT = '"Nirmala UI","Noto Sans Devanagari","Noto Sans Bengali","Arial Rounded MT Bold","Segoe UI",sans-serif';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = THREE.MathUtils.clamp;

function loadProfile() {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (store && store.profiles) return { store, data: store.profiles[store.current || 0] };
  } catch (e) { /* storage blocked */ }
  return { store: null, data: { done: [], lang: 'hi' } };
}
function markDone(key) {
  if (!OWN_HOST) return;                               // the Stratos box saves nothing
  try {
    const { store, data } = loadProfile();
    const s = store || { profiles: [data], current: 0 };
    if (!data.done.includes(key)) data.done.push(key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) { /* storage blocked */ }
}

// ------------------------------------------------------------------ voice: the best voice the device has
function bestVoice(lang) {
  const list = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const score = (v) => (/natural/i.test(v.name) ? 8 : 0) + (/google/i.test(v.name) ? 4 : 0) + (/enhanced|premium/i.test(v.name) ? 3 : 0) + (v.lang === `${lang}-IN` ? 2 : 0);
  const fit = list.filter((v) => v.lang.toLowerCase().startsWith(lang));
  return fit.sort((a, b) => score(b) - score(a))[0] || null;
}
function say(parts) {                                  // parts: [[text, lang], ...]
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  window.dgQ = parts.filter(([t]) => t).map(([text, lang]) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-IN' : `${lang}-IN`;
    u.voice = bestVoice(lang);
    u.rate = 0.92;
    speechSynthesis.speak(u);
    return u;
  });
}

// ------------------------------------------------------------------ the stage (one, reused)
let st = null;
function build(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fd6ff);
  scene.fog = new THREE.Fog(0x8fd6ff, 180, 620);
  const camera = new THREE.PerspectiveCamera(46, 1, 2, 1500);
  scene.add(new THREE.HemisphereLight(0xdff2ff, 0xd8c79a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.3);
  sun.position.set(-30, 70, 34);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 10, far: 180 });
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  // sea, sand, grass, the table
  const flat = (geo, color, y) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.9 })); m.rotation.x = -Math.PI / 2; m.position.y = y; scene.add(m); return m; };
  flat(new THREE.CircleGeometry(1200, 48), 0x2fa9d8, -7);
  flat(new THREE.CircleGeometry(112, 64), 0xf3dfa8, -5.4);
  flat(new THREE.CircleGeometry(98, 64), 0x63bf4e, -5.2).receiveShadow = true;
  const legMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2f, roughness: 0.7 });
  for (const [x, z] of [[-21, -21], [21, -21], [-21, 21], [21, 21]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 5, 12), legMat); leg.position.set(x, -3.2, z); leg.castShadow = true; scene.add(leg);
  }
  const rim = new THREE.Mesh(new THREE.BoxGeometry(50, 1.4, 50), new THREE.MeshStandardMaterial({ color: 0xffbf00, roughness: 0.5 }));
  rim.position.y = -0.85; rim.castShadow = rim.receiveShadow = true; scene.add(rim);
  const top = new THREE.Mesh(new THREE.BoxGeometry(47.5, 0.3, 47.5), new THREE.MeshStandardMaterial({ color: 0xfff8e6, roughness: 0.85 }));
  top.position.y = -0.15; top.receiveShadow = true; scene.add(top);
  // palms round the table
  const trunkG = new THREE.CylinderGeometry(0.7, 1.1, 18, 8); trunkG.translate(0, 9, 0);
  const crownG = new THREE.ConeGeometry(7, 3.4, 8); crownG.translate(0, 18.5, 0);
  const n = 22;
  const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ color: 0x9a6b3c, roughness: 0.9 }), n);
  const crowns = new THREE.InstancedMesh(crownG, new THREE.MeshStandardMaterial({ color: 0x2f9a3a, roughness: 0.75 }), n);
  const d = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = 55 + ((i * 37) % 30);
    d.position.set(Math.cos(a) * r, -5.2, Math.sin(a) * r); d.scale.setScalar(0.9 + ((i * 13) % 7) / 10); d.updateMatrix();
    trunks.setMatrixAt(i, d.matrix); crowns.setMatrixAt(i, d.matrix);
  }
  trunks.castShadow = crowns.castShadow = true;
  scene.add(trunks, crowns);
  // clouds
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Group(), a = (i / 7) * Math.PI * 2;
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(8 + k * 2, 10, 8), cloudMat); b.position.set(k * 9 - 13, (k % 2) * 3, 0); b.scale.y = 0.55; c.add(b); }
    c.position.set(Math.cos(a) * 240, 70 + (i % 3) * 18, Math.sin(a) * 240 - 60); c.lookAt(0, 40, 0);
    scene.add(c);
  }
  // shared instanced things
  const dotMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.62, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }), 900);
  const dotRing = new THREE.InstancedMesh(new THREE.CircleGeometry(0.95, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x3a2a5c }), 900);
  dotMesh.frustumCulled = dotRing.frustumCulled = false; dotMesh.castShadow = true;
  scene.add(dotRing, dotMesh);
  const bodyG = new THREE.BoxGeometry(2.9, 5.8, 0.95); bodyG.translate(0, 2.9, 0);
  const body = new THREE.InstancedMesh(bodyG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32 }), 300);
  body.frustumCulled = false; body.castShadow = true;
  const f1 = new THREE.PlaneGeometry(2.5, 2.5); f1.translate(0, 2.9, 0.49);
  const f2 = new THREE.PlaneGeometry(2.5, 2.5); f2.rotateY(Math.PI); f2.translate(0, 2.9, -0.49);
  const badgeG = mergePlanes(f1, f2);
  const badge = new THREE.InstancedMesh(badgeG, new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.4 }), 300);
  badge.frustumCulled = false;
  scene.add(body, badge);
  const confetti = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.14, 0.45), new THREE.MeshBasicMaterial({ color: 0xffffff }), 260);
  confetti.frustumCulled = false; confetti.count = 0; scene.add(confetti);
  // the picture
  const picMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.6, side: THREE.DoubleSide, alphaTest: 0.03 });
  const picPivot = new THREE.Group();
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), picMat); pic.position.y = 0.5; picPivot.add(pic); picPivot.visible = false; scene.add(picPivot);
  // the helping hand and the ring on the next dot
  const hcv = document.createElement('canvas'); hcv.width = hcv.height = 128;
  const hc = hcv.getContext('2d'); hc.font = '100px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; hc.textAlign = 'center'; hc.textBaseline = 'middle'; hc.fillText('\u{1F446}', 64, 70);
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hcv), depthTest: false, transparent: true }));
  hand.center.set(0.5, 1); hand.scale.setScalar(8); hand.renderOrder = 9; hand.visible = false; scene.add(hand);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.9, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffb400, transparent: true, opacity: 0.9, depthWrite: false }));
  ring.position.y = 0.06; ring.visible = false; scene.add(ring);
  const extras = new THREE.Group(); scene.add(extras);   // name tiles, map lines, places: rebuilt per picture
  const ui = buildUI();
  st = { renderer, scene, camera, rim, dotMesh, dotRing, body, badge, confetti, picMat, picPivot, pic, hand, ring, extras, ui, tex: new THREE.TextureLoader(), cache: {} };
  st.tex.setCrossOrigin('anonymous');
}
function mergePlanes(a, b) {
  const g = new THREE.BufferGeometry();
  const join = (n) => { const x = a.attributes[n].array, y = b.attributes[n].array, o = new Float32Array(x.length + y.length); o.set(x); o.set(y, x.length); return o; };
  g.setAttribute('position', new THREE.BufferAttribute(join('position'), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(join('normal'), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(join('uv'), 2));
  const ia = Array.from(a.index.array), off = a.attributes.position.count;
  g.setIndex(ia.concat(Array.from(b.index.array, (i) => i + off)));
  return g;
}

// ------------------------------------------------------------------ the buttons: symbols only
function buildUI() {
  const css = document.createElement('style');
  css.textContent = `#t3d{position:fixed;inset:0;pointer-events:none;z-index:4}#t3d[hidden]{display:none}
  #t3d button{pointer-events:auto;position:absolute;border:0;padding:0;width:74px;height:74px;border-radius:24px;background:linear-gradient(160deg,#f4efe6,#c9bfae);box-shadow:0 6px 0 #8f8473,0 10px 18px rgba(0,0,0,.3);display:grid;place-items:center;cursor:pointer}
  #t3d button:active{transform:translateY(4px)}#t3d button[hidden]{display:none}#t3d svg{width:44px;height:44px}
  #t3d .b{bottom:calc(18px + env(safe-area-inset-bottom,0px))}#t3d .s{bottom:calc(106px + env(safe-area-inset-bottom,0px))}#t3d .l{left:calc(18px + env(safe-area-inset-left,0px))}#t3d .r{right:calc(18px + env(safe-area-inset-right,0px))}
  #t3dNext{background:linear-gradient(160deg,#4fdc62,#15993a)!important;box-shadow:0 6px 0 #0e6d29,0 10px 18px rgba(0,0,0,.3)!important;width:96px!important;height:96px!important;animation:t3dBob 1s ease-in-out infinite alternate}#t3dNext svg{width:62px;height:62px}
  @keyframes t3dBob{from{transform:translateY(0)}to{transform:translateY(-7px)}}
  #t3dBar{position:absolute;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(64vw,420px);height:18px;border-radius:12px;background:rgba(20,30,70,.55);border:3px solid #fff;overflow:hidden}
  #t3dFill{height:100%;width:0;background:linear-gradient(90deg,#ff3b3b,#ff8a1e,#ffd21e,#3ccf4e,#1fb5ff,#4f6bff,#b44dff);transition:width .12s}
  #t3d .wait{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px;border-radius:50%;border:8px solid #fff;border-top-color:#ff8a1e;animation:t3dSpin .9s linear infinite}@keyframes t3dSpin{to{transform:rotate(360deg)}}`;
  document.head.append(css);
  const root = document.createElement('div'); root.id = 't3d'; root.hidden = true;
  const svg = (inner) => `<svg viewBox="0 0 48 48">${inner}</svg>`;
  root.innerHTML = `<div id="t3dBar"><div id="t3dFill"></div></div><div class="wait" id="t3dWait" hidden></div>
    <button id="t3dBack" class="b l" aria-label="Back">${svg('<path d="M20 10 L8 21 L20 32 V25 C30 25 36 28 40 37 C39 24 32 17 20 17 Z" fill="#c98a3a" stroke="#7a4f1c" stroke-width="2.5" stroke-linejoin="round"/>')}</button>
    <button id="t3dHome" class="b r" aria-label="Home">${svg('<path d="M24 7 L42 23 H37 V40 H28 V30 H20 V40 H11 V23 H6 Z" fill="#ff6a3d" stroke="#9a2f12" stroke-width="2.5" stroke-linejoin="round"/><rect x="21" y="16" width="6" height="6" rx="1" fill="#fff3c4"/>')}</button>
    <button id="t3dSay" class="s l" aria-label="Hear">${svg('<path d="M8 18 H16 L27 9 V39 L16 30 H8 Z" fill="#14a89a" stroke="#0c6d64" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 17 C36 21 36 27 32 31 M37 12 C43 19 43 29 37 36" fill="none" stroke="#14a89a" stroke-width="4" stroke-linecap="round"/>')}</button>
    <button id="t3dSpell" class="l" aria-label="Spell" style="bottom:calc(194px + env(safe-area-inset-bottom,0px))" hidden>${svg('<text x="24" y="33" text-anchor="middle" font-size="24" font-weight="900" font-family="Arial" fill="#ff6a3d">ABC</text>')}</button>
    <button id="t3dMore" class="r" aria-label="More" style="bottom:calc(226px + env(safe-area-inset-bottom,0px))" hidden>${svg('<path d="M24 5 L28 19 L42 24 L28 29 L24 43 L20 29 L6 24 L20 19 Z" fill="#ffc21e" stroke="#b07a00" stroke-width="2.5" stroke-linejoin="round"/>')}</button>
    <button id="t3dNext" class="s r" aria-label="Next" hidden>${svg('<path d="M12 8 L38 24 L12 40 Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>')}</button>`;
  document.body.append(root);
  const $ = (id) => root.querySelector('#' + id);
  return { root, fill: $('t3dFill'), wait: $('t3dWait'), back: $('t3dBack'), home: $('t3dHome'), say: $('t3dSay'), spell: $('t3dSpell'), more: $('t3dMore'), next: $('t3dNext') };
}

// ------------------------------------------------------------------ small textures
function letterTexture(ch, nativeLetter) {
  const key = 'L' + ch + (nativeLetter ? 'n' : '');
  if (st.cache[key]) return st.cache[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#19204a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 55, 0, 7); g.fill();
  g.fillStyle = '#19204a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 ${ch.length > 1 ? 58 : 78}px ${FONT}`;
  g.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  st.cache[key] = t;
  return t;
}
function tileTexture(ch) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#19204a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 92px ${FONT}`; g.fillText(ch, 64, 72);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function textPlane(text, h, color = '#19204a') {
  const cv = document.createElement('canvas'); cv.height = 96;
  let g = cv.getContext('2d'); g.font = `800 64px ${FONT}`;
  cv.width = Math.min(1024, Math.ceil(g.measureText(text).width) + 40);
  g = cv.getContext('2d'); g.font = `800 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#fff'; g.strokeText(text, cv.width / 2, 52); g.fillStyle = color; g.fillText(text, cv.width / 2, 52);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry((h * cv.width) / cv.height, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  return m;
}
function clearExtras() {
  st.extras.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  st.extras.clear();
}

// ------------------------------------------------------------------ playing one category
let audioCtx = null;
function note(k, type = 'triangle', vol = 0.16, mul = 1) {
  const c = audioCtx && audioCtx(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  const o = c.createOscillator(), g = c.createGain(), now = c.currentTime;
  o.type = type; o.frequency.value = NOTES[k] * mul;
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  o.connect(g).connect(c.destination); o.start(now); o.stop(now + 0.42);
}

const tmp = new THREE.Object3D(); tmp.rotation.order = 'YXZ';
const col = new THREE.Color();
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitP = new THREE.Vector3();

function resample(flatPts, closed, step) {
  const pts = [];
  for (let i = 0; i < flatPts.length; i += 2) pts.push([X(flatPts[i]), Z(flatPts[i + 1])]);
  if (closed && pts.length > 2) pts.push(pts[0]);
  const out = [pts[0]];
  let need = step;
  for (let i = 1; i < pts.length; i++) {
    let [ax, az] = pts[i - 1]; const [bx, bz] = pts[i];
    let seg = Math.hypot(bx - ax, bz - az);
    while (seg >= need && seg > 0) {
      const k = need / seg;
      ax += (bx - ax) * k; az += (bz - az) * k;
      out.push([ax, az]);
      seg = Math.hypot(bx - ax, bz - az);
      need = step;
    }
    need -= seg;
  }
  return out;
}

class Play {
  constructor(cfg, rows, start) {
    this.cfg = cfg; this.rows = rows; this.i = start; this.t = 0;
    this.spoke = false;
    this.lang = loadProfile().data.lang || 'hi';
    const u = st.ui;
    u.back.onclick = () => this.leave(false);
    u.home.onclick = () => this.leave(true);
    u.say.onclick = () => this.announce();
    u.spell.onclick = () => this.spell();
    u.next.onclick = () => this.next();
    u.more.onclick = () => { speechSynthesis && speechSynthesis.cancel(); cfg.onMore(`${cfg.href}&item=${rows[this.i].i}`); };
    this.onDown = (e) => this.pointer(e, 'down');
    this.onMove = (e) => this.pointer(e, 'move');
    this.onUp = (e) => this.pointer(e, 'up');
    const c = st.renderer.domElement;
    c.addEventListener('pointerdown', this.onDown);
    c.addEventListener('pointermove', this.onMove);
    addEventListener('pointerup', this.onUp);
    this.onResize = () => this.fit();
    addEventListener('resize', this.onResize);
    u.root.hidden = false;
    this.fit();
    this.load();
  }

  // one fixed camera position that shows the whole table and the name: it never moves
  fit() {
    const cam = st.camera, w = innerWidth, h = innerHeight;
    cam.aspect = w / h; cam.fov = w < h ? 52 : 40; cam.updateProjectionMatrix();
    const look = new THREE.Vector3(0, 1, w < h ? 0 : 1.5);
    const dir = new THREE.Vector3(0, w < h ? 0.84 : 0.8, w < h ? 0.54 : 0.6).normalize();
    const pts = [[-25, 0, 25], [25, 0, 25], [-25, 13, -27], [25, 13, -27], [-25, 0, -25], [25, 0, -25]].map((p) => new THREE.Vector3(...p));
    let lo = 30, hi = 500; const v = new THREE.Vector3();
    const ok = (d) => { cam.position.copy(look).addScaledVector(dir, d); cam.lookAt(look); cam.updateMatrixWorld(); return pts.every((p) => { v.copy(p).project(cam); return Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.86; }); };
    for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (ok(m)) hi = m; else lo = m; }
    ok(hi);
  }

  load() {
    const it = this.rows[this.i];
    this.it = it;
    this.stage = 'trace';
    this.t = 0;
    this.lastCover = -1; this.down = false; this.last = null; this.lastPop = 0;
    this.touched = 0;
    speechSynthesisCancel();
    const u = st.ui;
    u.next.hidden = u.more.hidden = u.spell.hidden = true;
    u.fill.style.width = '0';
    st.picPivot.visible = false;
    st.confetti.count = 0;
    st.body.count = st.badge.count = 0;
    st.rim.material.color.setHex(this.cfg.tint || 0xffbf00);
    clearExtras();
    // dots
    this.dots = [];
    it.loops.forEach((lp) => { for (let i = 0; i < lp.length; i += 2) this.dots.push({ x: X(lp[i]), z: Z(lp[i + 1]), on: false, pop: 0 }); });
    this.need = Math.ceil(this.dots.length * DONE_SHARE);
    this.covered = 0;
    st.dotMesh.count = st.dotRing.count = this.dots.length;
    st.dotMesh.visible = st.dotRing.visible = true;
    this.dots.forEach((d, i) => { this.drawDot(d, i); });
    st.dotMesh.instanceColor && (st.dotMesh.instanceColor.needsUpdate = true);
    // the map round a state, and the name on tiles at the back of the table
    if (it.ctx) {
      const pos = [];
      it.ctx.forEach((lp) => { for (let i = 2; i < lp.length; i += 2) pos.push(X(lp[i - 2]), 0.03, Z(lp[i - 1]), X(lp[i]), 0.03, Z(lp[i + 1])); });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      st.extras.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9aa7bd })));
    }
    this.buildName(it);
    // dominoes (not shown until the outline is done)
    this.tiles = [];
    const patt = PATTERNS[Math.floor(Math.random() * 7)];
    this.timbre = TIMBRES[Math.floor(Math.random() * TIMBRES.length)];
    this.mul = Math.random() < 0.5 ? 1 : 2;
    it.loops.forEach((lp, li) => {
      const pts = resample(lp, it.closed[li], LETTER_SPACING);
      pts.forEach((p, i) => {
        const nxt = pts[i + 1] || p, prv = pts[i - 1] || p;
        const yaw = Math.atan2(nxt[0] - prv[0], nxt[1] - prv[1]);
        const n = this.tiles.length;
        this.tiles.push({ x: p[0], z: p[1], yaw, k: patt(n), fallAt: Infinity, played: false, dropAt: 0, loop: li });
      });
    });
    if (this.tiles.length > 300) this.tiles.length = 300;
    st.badge.material.map = it.letter ? letterTexture(it.letter) : null;
    st.badge.material.needsUpdate = true;
    this.tiles.forEach((d, i) => { st.body.setColorAt(i, col.setHex(RAINBOW[d.k])); });
    if (st.body.instanceColor) st.body.instanceColor.needsUpdate = true;
    // the picture, fetched now so it is ready at the end
    this.picReady = false;
    st.picMat.map = null; st.picMat.needsUpdate = true;
    if (it.pic) {
      const url = (OWN_HOST ? '' : PAGES) + it.pic;
      st.tex.load(url, (t) => {
        if (this.it !== it) { t.dispose(); return; }
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
        if (st.picMat.map) st.picMat.map.dispose();
        st.picMat.map = t; st.picMat.needsUpdate = true; this.picReady = true;
      });
    }
    u.spell.hidden = !/[a-z]/i.test(it.label) || !!it.native;
    if (!this.spoke) { this.spoke = true; this.announce(' Trace the dots!'); }
  }

  native() { return this.lang === 'en' ? null : this.it[this.lang]; }

  buildName(it) {
    const chars = [...(it.native ? it.name : it.label)].filter((c) => c !== ' ');
    this.nameTiles = [];
    const w = Math.min(7, 47 / Math.max(1, chars.length));
    chars.forEach((ch, i) => {
      const grp = new THREE.Group();
      const c = RAINBOW[i % 7];
      const box = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, w * 0.94, 1.0), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, w * 0.8), new THREE.MeshBasicMaterial({ map: tileTexture(ch) }));
      face.position.z = 0.52;
      grp.add(box, face);
      grp.position.set((i - (chars.length - 1) / 2) * w, w * 0.47, -26.4);
      grp.rotation.x = -0.45;
      box.castShadow = true;
      grp.userData = { base: grp.position.y, born: i * 0.07 };
      grp.scale.setScalar(0.01);
      st.extras.add(grp);
      this.nameTiles.push(grp);
    });
    const word = this.native();
    if (word && !it.native) { const p = textPlane(word, 4); p.position.set(0, w * 0.94 + 2.2, -26.8); p.rotation.x = -0.45; st.extras.add(p); }
  }

  drawDot(d, i) {
    tmp.position.set(d.x, 0.62 + (d.on ? 0.0 : 0.0), d.z); tmp.rotation.set(0, 0, 0);
    tmp.scale.setScalar(d.on ? 0.55 : 1 + d.pop); tmp.updateMatrix();
    st.dotMesh.setMatrixAt(i, tmp.matrix);
    st.dotMesh.setColorAt(i, col.setHex(d.on ? RAINBOW[i % 7] : 0xffffff));
    tmp.position.y = 0.03; tmp.scale.setScalar(1); tmp.updateMatrix();
    st.dotRing.setMatrixAt(i, tmp.matrix);
    st.dotMesh.instanceMatrix.needsUpdate = st.dotRing.instanceMatrix.needsUpdate = true;
    st.dotMesh.instanceColor.needsUpdate = true;
  }

  pointer(e, kind) {
    if (kind === 'up') { this.down = false; this.last = null; return; }
    if (kind === 'down') {
      this.down = true;
      if (this.stage === 'ready') { this.push(); return; }
      if (this.stage === 'topple') { this.tiles.forEach((d) => { d.fallAt = Math.min(d.fallAt, this.t - 1); d.played = true; }); return; }
    }
    if (this.stage !== 'trace' || !this.down) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, st.camera);
    if (!ray.ray.intersectPlane(tablePlane, hitP)) return;
    const p = { x: hitP.x, z: hitP.z };
    const a = this.last || p;
    const steps = Math.max(1, Math.ceil(Math.hypot(p.x - a.x, p.z - a.z) / 1));
    for (let s = 0; s <= steps; s++) this.coverAt(a.x + ((p.x - a.x) * s) / steps, a.z + ((p.z - a.z) * s) / steps);
    this.last = p;
  }

  coverAt(x, z) {
    const r2 = RADIUS * RADIUS;
    this.dots.forEach((d, i) => {
      if (!d.on && (d.x - x) ** 2 + (d.z - z) ** 2 <= r2) {
        d.on = true; this.covered++; this.touched = this.t;
        this.drawDot(d, i);
        if (this.t - this.lastPop > 0.07) { this.lastPop = this.t; note(this.covered % 7, 'sine', 0.13, 2); }
      }
    });
    st.ui.fill.style.width = `${clamp((this.covered / this.need) * 100, 0, 100)}%`;
    if (this.stage === 'trace' && this.covered >= this.need) this.standDominoes();
  }

  // the outline is done: the letter dominoes drop onto it one after another
  standDominoes() {
    this.stage = 'drop';
    this.t0 = this.t;
    this.down = false;
    st.dotMesh.visible = st.dotRing.visible = false;
    const gap = Math.min(0.05, 1.6 / Math.max(1, this.tiles.length));
    this.tiles.forEach((d, i) => { d.dropAt = this.t + 0.2 + i * gap; });
    this.dropEnd = this.t + 0.2 + this.tiles.length * gap + 0.35;
    st.body.count = st.badge.count = this.tiles.length;
    note(4, 'triangle', 0.14);
  }
  push() {
    this.stage = 'topple';
    const n = this.tiles.length;
    const total = clamp(n / 10, 4, 10);
    let at = this.t + 0.05, w = 0;
    this.tiles.forEach((d, i) => {
      d.fallAt = at;
      const u = i / Math.max(1, n - 1);
      w = (total / n) * (u < 0.1 ? 1.5 - 5 * u : 1 + 0.35 * Math.sin(u * Math.PI * 6));   // slow start, then waves
      at += w;
    });
    this.end = at + 0.5;
  }
  drawTiles() {
    this.tiles.forEach((d, i) => {
      const dp = this.stage === 'drop' || this.stage === 'ready' ? clamp((this.t - d.dropAt) / 0.3, 0, 1) : 1;
      const y = (1 - dp * dp) * 22;
      const f = d.fallAt === Infinity ? 0 : clamp((this.t - d.fallAt) / 0.24, 0, 1);
      const a = f * f * (i === this.tiles.length - 1 ? 1.5 : 1.22);
      tmp.position.set(d.x, y, d.z); tmp.rotation.set(a, d.yaw, 0); tmp.scale.setScalar(this.t >= d.dropAt ? 1 : 0.001); tmp.updateMatrix();
      st.body.setMatrixAt(i, tmp.matrix); st.badge.setMatrixAt(i, tmp.matrix);
    });
    st.body.instanceMatrix.needsUpdate = st.badge.instanceMatrix.needsUpdate = true;
  }

  // the real picture stands up from the table
  finish() {
    this.stage = 'done';
    this.doneAt = this.t;
    markDone(this.it.key);
    const r = this.it.rect || [20, 20, 400, 400];
    const pw = r[2] * S, ph = r[3] * S;
    st.pic.scale.set(pw, ph, 1);
    st.picPivot.position.set(X(r[0] + r[2] / 2), 0.3, Z(r[1] + r[3]));
    st.picPivot.rotation.x = -Math.PI / 2;
    st.picPivot.visible = true;
    st.picMat.opacity = 0;
    [0, 2, 4, 6].forEach((k, i) => setTimeout(() => note(k, 'triangle', 0.16, 2), i * 110));
    // confetti: 7 colours
    this.bits = [];
    for (let i = 0; i < st.confetti.instanceMatrix.count; i++) {
      this.bits.push({ x: (Math.random() - 0.5) * 44, y: 18 + Math.random() * 26, z: (Math.random() - 0.5) * 44, vy: -5 - Math.random() * 7, s: Math.random() * 6, w: 2 + Math.random() * 4 });
      st.confetti.setColorAt(i, col.setHex(RAINBOW[i % 7]));
    }
    st.confetti.instanceColor.needsUpdate = true;
    st.confetti.count = this.bits.length;
    // places on a state's map
    (this.it.places || []).forEach(([name, x, y, kind]) => {
      const star = new THREE.Mesh(new THREE.SphereGeometry(kind === 'capital' ? 0.9 : 0.6, 10, 8), new THREE.MeshBasicMaterial({ color: kind === 'capital' ? 0xff3b3b : 0x4f6bff }));
      star.position.set(X(x), 0.7, Z(y)); st.extras.add(star);
      const lab = textPlane(name, 1.9); lab.position.set(X(x), 2.2, Z(y)); lab.rotation.x = -0.9; st.extras.add(lab);
    });
    const u = st.ui;
    setTimeout(() => { if (this.stage === 'done') { u.next.hidden = false; u.more.hidden = false; } }, 800);
  }

  announce(after = '') {
    const it = this.it;
    if (it.native) { say([[it.say || it.name, it.lang || 'hi']]); return; }
    const parts = [[`${it.label}!${after}`, 'en']];
    const w = this.native();
    if (w) parts.push([w, this.lang]);
    say(parts);
  }
  spell() {
    const it = this.it;
    const letters = [...it.label].filter((c) => /[a-z0-9]/i.test(c));
    this.spellAt = this.t; this.spellGap = 0.62;
    say([[`${it.label}.`, 'en'], [letters.join(', ') + '.', 'en'], [`${it.label}!`, 'en']]);
  }
  next() {
    speechSynthesisCancel();
    if (this.i + 1 >= this.rows.length) { this.leave(false); return; }
    this.i++;
    this.load();
  }
  leave(home) {
    speechSynthesisCancel();
    const c = st.renderer.domElement;
    c.removeEventListener('pointerdown', this.onDown);
    c.removeEventListener('pointermove', this.onMove);
    removeEventListener('pointerup', this.onUp);
    removeEventListener('resize', this.onResize);
    st.ui.root.hidden = true;
    current = null;
    this.cfg.onExit(home);
  }

  frame(dt) {
    this.t += dt;
    const t = this.t;
    // name tiles pop in; while spelling they light up one by one
    this.nameTiles.forEach((g, i) => {
      const life = t - g.userData.born;
      const k = life <= 0 ? 0.01 : Math.min(1, 1 - Math.pow(1 - Math.min(1, life / 0.35), 3));
      let lift = 0;
      if (this.spellAt !== undefined) { const on = (t - this.spellAt - 0.9) / this.spellGap; if (on > i && on < i + 1) lift = 1.6; }
      g.scale.setScalar(Math.max(0.01, k));
      g.position.y = g.userData.base + lift;
    });
    // the helping hand: on the next dot; on the first domino when it is time to push
    let aim = null;
    if (this.stage === 'trace') {
      const d = this.dots.find((x) => !x.on);
      if (d) {
        aim = d;
        st.ring.visible = true; st.ring.position.set(d.x, 0.06, d.z);
        const s = 1 + 0.18 * Math.sin(t * 5); st.ring.scale.set(s, 1, s);
      }
      st.hand.visible = !!d && !this.down && (this.covered === 0 || t - this.touched > 6);
    } else if (this.stage === 'ready') {
      aim = this.tiles[0]; st.ring.visible = false; st.hand.visible = true;
    } else { st.ring.visible = false; st.hand.visible = false; }
    if (aim && st.hand.visible) st.hand.position.set(aim.x, 1.6 + Math.abs(Math.sin(t * 3.4)) * 1.4, aim.z + 0.2);

    if (this.stage === 'drop') {
      this.drawTiles();
      this.tiles.forEach((d, i) => { if (!d.played && t >= d.dropAt + 0.26) { d.played = true; if (i % 3 === 0) note(d.k, 'sine', 0.08, 2); } });
      if (t >= this.dropEnd) { this.tiles.forEach((d) => { d.played = false; }); this.stage = 'ready'; this.drawTiles(); }
    } else if (this.stage === 'topple') {
      this.tiles.forEach((d) => { if (!d.played && t >= d.fallAt) { d.played = true; note(d.k, this.timbre, 0.16, this.mul); } });
      this.drawTiles();
      if (t >= this.end || this.tiles.every((d) => t >= d.fallAt + 0.3)) this.finish();
    } else if (this.stage === 'done') {
      const k = clamp((t - this.doneAt) / 1.1, 0, 1), e = ease(k);
      st.picMat.opacity = clamp((t - this.doneAt) / 0.5, 0, 1);
      // standing up: facing the camera, on the table
      const face = -Math.atan2(st.camera.position.y - st.picPivot.position.y, st.camera.position.z - st.picPivot.position.z);
      st.picPivot.rotation.x = -Math.PI / 2 + e * (face + Math.PI / 2);
      const pop = 1 + Math.sin(k * Math.PI) * 0.07;
      st.pic.scale.set((this.it.rect ? this.it.rect[2] : 400) * S * pop, (this.it.rect ? this.it.rect[3] : 400) * S * pop, 1);
      st.pic.position.y = 0.5 * st.pic.scale.y;
      if (this.bits) {
        const life = t - this.doneAt;
        this.bits.forEach((b, i) => {
          const y = b.y + b.vy * life;
          tmp.position.set(b.x + Math.sin(life * b.w + b.s) * 1.6, y, b.z);
          tmp.rotation.set(life * b.w, b.s + life * 2, 0);
          tmp.scale.setScalar(y < 0 ? 0.001 : 1);
          tmp.updateMatrix();
          st.confetti.setMatrixAt(i, tmp.matrix);
        });
        st.confetti.instanceMatrix.needsUpdate = true;
        if (life > 6) { st.confetti.count = 0; this.bits = null; }
      }
    }
  }
}
function speechSynthesisCancel() { if (window.speechSynthesis) speechSynthesis.cancel(); }

// ------------------------------------------------------------------ entry
let current = null;
export function activeStage() { return current; }
export async function openTrace(cfg) {
  if (!st) build(cfg.renderer);
  audioCtx = cfg.audio;
  st.ui.root.hidden = false;
  st.ui.wait.hidden = false;
  const index = await (await fetch('trace/index.json')).json();
  const rows = await (await fetch(`trace/${index[cfg.cat]}.json`)).json();
  st.ui.wait.hidden = true;
  current = new Play(cfg, rows, 0);
  if (new URLSearchParams(location.search).has('test')) window.__trace = { get play() { return current; }, st };
  return current;
}
export function stageScene() { return st; }
