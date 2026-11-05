import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RGBELoader } from './vendor/loaders/RGBELoader.js';
import { mergeGeometries } from './vendor/utils/BufferGeometryUtils.js';

const pl = window.planck;
const V2 = (x, y) => pl.Vec2(x, y);
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Stratos analytics: hands events to the shared site script (no-op when played outside stratos.games)
function track(name, details) { try { var S = window.Stratos || parent.Stratos; if (S) S.track(name, details); } catch (e) { } }
function offerReward(onDone) { track('reward_offered'); onDone(); track('reward_taken'); }
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ save */
const SAVE_KEY = 'inkvelocity.save.v1';
const save = { stars: {}, best: {}, paint: 0, rim: 0, muted: false };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); } catch (e) { /* private mode */ }
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }

/* ------------------------------------------------------------------ noise */
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }

/* ------------------------------------------------------------------ renderer */
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 2500);
camera.position.set(0, 5, 30);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const envMats = []; // materials whose reflections dim at night
const trackEnv = (m, base = 1) => { m.userData.envBase = base; envMats.push(m); return m; };

const hemi = new THREE.HemisphereLight(0xbfdcff, 0x6b5a45, 1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 22, bottom: -22, near: 1, far: 200 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const sunDir = new THREE.Vector3(0.5, 0.8, 0.45).normalize();

/* ------------------------------------------------------------------ textures */
const maxAniso = renderer.capabilities.getMaxAnisotropy();
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
  return t;
}
function grain(g, w, h, amt) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
}
const asphaltTex = canvasTex(512, 256, (g, w, h) => {
  g.fillStyle = '#2b2d31'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${rand(0.04, 0.1)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(10, 70), rand(4, 22), 0, 0, 7); g.fill(); }
  grain(g, w, h, 34);
  g.fillStyle = '#ebe7dc'; g.fillRect(0, 16, w, 9); g.fillRect(0, h - 25, w, 9);
  g.fillStyle = '#f0c43a'; g.fillRect(0, h / 2 - 5, w * 0.55, 10);
  grain(g, w, h, 18);
});
const turboTex = canvasTex(256, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#04384a'); gr.addColorStop(0.5, '#0aa8cc'); gr.addColorStop(1, '#04384a');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8fbff'; g.lineWidth = 24; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let k = 0; k < 2; k++) { const x0 = 34 + k * 128; g.beginPath(); g.moveTo(x0, 60); g.lineTo(x0 + 58, h / 2); g.lineTo(x0, h - 60); g.stroke(); }
});
const rockTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#7c786c'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(${rand(60, 140) | 0},${rand(50, 110) | 0},${rand(40, 90) | 0},${rand(0.15, 0.4)})`; g.fillRect(0, y + Math.sin(y) * 2, w, rand(2, 7)); }
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(0,0,0,${rand(0.08, 0.25)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(4, 26), rand(2, 9), rand(-0.3, 0.3), 0, 7); g.fill(); }
  grain(g, w, h, 40);
});
rockTex.repeat.set(0.14, 0.14);
const crateTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#a8743f'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) { g.fillStyle = `rgba(80,40,10,${rand(0.15, 0.35)})`; g.fillRect(0, y, w, 3); }
  g.strokeStyle = '#5a3612'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
  g.beginPath(); g.moveTo(16, 16); g.lineTo(w - 16, h - 16); g.stroke();
  grain(g, w, h, 30);
});
const checkerTex = canvasTex(256, 64, (g, w, h) => {
  const s = 32; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { g.fillStyle = ((x + y) / s) % 2 ? '#111' : '#f4f4f4'; g.fillRect(x, y, s, s); }
});
const bannerTex = canvasTex(1024, 256, (g, w, h) => {
  g.fillStyle = '#0d0f14'; g.fillRect(0, 0, w, h);
  const s = 28; for (let x = 0; x < w; x += s) for (let r = 0; r < 2; r++) { g.fillStyle = ((x / s + r) % 2) ? '#fff' : '#111'; g.fillRect(x, r * s, s, s); g.fillRect(x, h - (r + 1) * s, s, s); }
  g.fillStyle = '#ff2d3d'; g.font = 'italic 900 120px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('FINISH', w / 2, h / 2 + 4);
});
bannerTex.wrapS = bannerTex.wrapT = THREE.ClampToEdgeWrapping;
const hazardTex = canvasTex(256, 64, (g, w, h) => {
  g.fillStyle = '#f2b705'; g.fillRect(0, 0, w, h); g.fillStyle = '#16171b';
  for (let x = -h; x < w + h; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 24, 0); g.lineTo(x + 24 + h, h); g.lineTo(x + h, h); g.fill(); }
});
const cloudTex = canvasTex(256, 128, (g, w, h) => {
  for (let i = 0; i < 26; i++) {
    const x = rand(50, w - 50), y = rand(55, h - 30), r = rand(18, 42);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
});

/* ------------------------------------------------------------------ materials */
const M = {
  asphalt: trackEnv(new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.86 }), 0.6),
  concrete: trackEnv(new THREE.MeshStandardMaterial({ color: 0x8f9298, roughness: 0.92, side: THREE.DoubleSide }), 0.6),
  turbo: new THREE.MeshStandardMaterial({ map: turboTex, emissive: 0xffffff, emissiveMap: turboTex, emissiveIntensity: 0.85, roughness: 0.35 }),
  turboSide: new THREE.MeshStandardMaterial({ color: 0x0b5266, emissive: 0x00a8d8, emissiveIntensity: 0.6, roughness: 0.5, side: THREE.DoubleSide }),
  rock: trackEnv(new THREE.MeshStandardMaterial({ map: rockTex, vertexColors: true, roughness: 0.96 }), 0.4),
  crate: trackEnv(new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.8 }), 0.5),
  steel: trackEnv(new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.85, roughness: 0.3 })),
  hazard: trackEnv(new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.5, metalness: 0.2 })),
  gold: trackEnv(new THREE.MeshStandardMaterial({ color: 0xffc23a, metalness: 0.9, roughness: 0.28, emissive: 0xb07400, emissiveIntensity: 0.9 })),
  checker: new THREE.MeshStandardMaterial({ map: checkerTex, roughness: 0.6 }),
  banner: new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.5, emissive: 0xffffff, emissiveMap: bannerTex, emissiveIntensity: 0.25 }),
  pillar: trackEnv(new THREE.MeshStandardMaterial({ color: 0x1a1c22, metalness: 0.6, roughness: 0.35 })),
  neon: new THREE.MeshStandardMaterial({ color: 0xff2d3d, emissive: 0xff2d3d, emissiveIntensity: 2 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x4a3423, roughness: 1 }),
  leaves: new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.95, flatShading: true }),
};
M.checker.map.repeat.set(1, 1);

/* ------------------------------------------------------------------ sky + backdrop */
const skyUniforms = {
  top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
  sunDir: { value: new THREE.Vector3() }, sunColor: { value: new THREE.Color() }, glow: { value: 1 },
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float glow; varying vec3 vD;
    void main(){ float h = vD.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h,0.,1.), 0.55)) : mix(mid, bottom, pow(clamp(-h,0.,1.), 0.4));
      float d = max(dot(normalize(vD), normalize(sunDir)), 0.0);
      c += sunColor * (pow(d, 900.0) * 6.0 + pow(d, 14.0) * 0.4 * glow + pow(d, 3.0) * 0.12 * glow);
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
}));
sky.renderOrder = -10;
scene.add(sky);

const starGeo = new THREE.BufferGeometry();
{ const p = []; for (let i = 0; i < 1600; i++) { const v = new THREE.Vector3(rand(-1, 1), rand(0.02, 1), rand(-1, 1)).normalize().multiplyScalar(1400); p.push(v.x, v.y, v.z); } starGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); }
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }));
sky.add(stars);

/* ------------------------------------------------------------------ Darjeeling backdrop (photo-real) */
const col3 = (h) => new THREE.Color(h);
const texLoader = new THREE.TextureLoader();
function photoTex(path, repeat = 1, srgb = true) {
  const t = texLoader.load(path);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = maxAniso;
  return t;
}
// real scanned PBR material (Poly Haven, CC0)
function pbr(name, repeat, opts = {}) {
  return new THREE.MeshStandardMaterial({
    map: photoTex(`assets/tex/${name}_diff.jpg`, repeat), normalMap: photoTex(`assets/tex/${name}_nor.jpg`, repeat, false),
    roughnessMap: photoTex(`assets/tex/${name}_rough.jpg`, repeat, false), ...opts,
  });
}

// real asphalt photo under the painted lane lines
{
  const img = new Image();
  img.onload = () => {
    const c = asphaltTex.image, g = c.getContext('2d'), w = c.width, h = c.height;
    g.drawImage(img, 0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.85; g.fillStyle = '#e9e6dc'; g.fillRect(0, 16, w, 8); g.fillRect(0, h - 24, w, 8);
    g.fillStyle = '#e8c044'; g.fillRect(0, h / 2 - 4, w * 0.55, 8); g.globalAlpha = 1;
    asphaltTex.needsUpdate = true;
  };
  img.src = 'assets/tex/asphalt_02_diff.jpg';
  M.asphalt.normalMap = photoTex('assets/tex/asphalt_02_nor.jpg', 1, false);
  M.asphalt.normalScale.set(0.7, 0.7);
  M.asphalt.roughness = 0.92;
}
// mossy hill-cut rock for the cliffs (keeps the grass/depth tint from vertex colours)
{
  const r = pbr('mossy_rock', 0.2, { vertexColors: true });
  M.rock.map = r.map; M.rock.normalMap = r.normalMap; M.rock.roughnessMap = r.roughnessMap; M.rock.roughness = 1; M.rock.color.setHex(0xb4b0a6);
  M.rock.needsUpdate = true;
}
M.hedge = pbr('leafy_grass', 1, { color: 0x6e9447, roughness: 0.9 });
M.wall = pbr('painted_plaster_wall', 1, { color: 0xffffff, roughness: 1 });
M.tin = pbr('corrugated_iron', 1, { color: 0xffffff, metalness: 0.35, roughness: 0.8 });

// real sky lighting (Poly Haven HDRIs, CC0) - used for reflections and soft fill light
const envMaps = {};
new RGBELoader().load('assets/hdr/kloofendal_43d_clear_1k.hdr', (t) => { t.mapping = THREE.EquirectangularReflectionMapping; envMaps.day = pmrem.fromEquirectangular(t).texture; if (theme.key === 'day') scene.environment = envMaps.day; });
new RGBELoader().load('assets/hdr/kiara_8_sunset_1k.hdr', (t) => { t.mapping = THREE.EquirectangularReflectionMapping; envMaps.sunset = pmrem.fromEquirectangular(t).texture; if (theme.key === 'sunset') scene.environment = envMaps.sunset; });
new RGBELoader().load('assets/hdr/moonlit_golf_1k.hdr', (t) => { t.mapping = THREE.EquirectangularReflectionMapping; envMaps.night = pmrem.fromEquirectangular(t).texture; if (theme.key === 'night') scene.environment = envMaps.night; });
const roomEnv = scene.environment;

const TRAIN_Z = -125, TRAIN_Y = -8;
function terrainH(x, z) {
  let y = -38 + fbm(x * 0.02, z * 0.02) * 8;
  y -= Math.exp(-Math.pow((z + 26) / 9, 2)) * 6;
  const t = clamp((-z - 55) / 135, 0, 1), s = t * t * (3 - 2 * t);
  const fall = clamp((-z - 205) / 90, 0, 1);
  const crest = 44 + (fbm(x * 0.006 + 5, 1.3) - 0.5) * 34;
  y += s * (crest + fbm(x * 0.03, z * 0.03) * 6) * (1 - fall * 0.85);
  return lerp(y, TRAIN_Y - 0.3, Math.exp(-Math.pow((z - TRAIN_Z) / 4.5, 2)));
}
const teaPatch = (x, z) => z < -58 && z > -118 && fbm(x * 0.012 + 7, z * 0.012) > 0.47;

// --- Kanchenjunga: real photographs, cut out along the mountain skyline and placed at "infinity"
const BACKDROP_D = 1400;
const PHOTOS = {
  day: { brightOnly: true, cropL: 0.07, grade: [0.93, 0.98, 1.06], src: 'assets/photos/kanch_day.jpg', crop: 0.6, peakRow: 0.25, peakDeg: 12.5, baseRow: 0.6, baseDeg: 3.8 },
  sunset: { src: 'assets/photos/kanch_golden.jpg', crop: 0.82, peakRow: 0.06, peakDeg: 12.5, baseRow: 0.6, baseDeg: 4.0 },
  night: { brightOnly: true, cropL: 0.07, src: 'assets/photos/kanch_day.jpg', crop: 0.6, peakRow: 0.25, peakDeg: 12.5, baseRow: 0.6, baseDeg: 3.8, night: true },
};
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, fog: false, depthWrite: false, toneMapped: false }));
backdrop.renderOrder = -5; backdrop.visible = false; scene.add(backdrop);
const backdropCache = {};
let backdropY = 0;
function buildBackdrop(key, done) {
  if (backdropCache[key]) return done(backdropCache[key]);
  const P = PHOTOS[key], img = new Image();
  img.onload = () => {
    const sx0 = Math.round(img.width * (P.cropL || 0)), sw = img.width - sx0;
    const W = 1600, H = Math.round(img.height * W / sw), ch = Math.round(H * P.crop), ext = Math.round(ch * 0.5);
    const c = document.createElement('canvas'); c.width = W * 3; c.height = ch + ext;
    const g = c.getContext('2d');
    // centre photo + mirrored copies either side so the range continues
    g.drawImage(img, sx0, 0, sw, img.height * P.crop, W, 0, W, ch);
    g.save(); g.scale(-1, 1); g.drawImage(img, sx0, 0, sw, img.height * P.crop, -W, 0, W, ch); g.drawImage(img, sx0, 0, sw, img.height * P.crop, -3 * W, 0, W, ch); g.restore();
    // extend the bottom row downward so nothing floats
    { const row = g.getImageData(0, ch - 3, c.width, 1).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < row.length; i += 4) { r += row[i]; gg += row[i + 1]; b += row[i + 2]; } const n = row.length / 4;
      const gr = g.createLinearGradient(0, ch - 6, 0, ch + ext); gr.addColorStop(0, 'rgb(' + (r / n | 0) + ',' + (gg / n | 0) + ',' + (b / n | 0) + ')'); gr.addColorStop(1, 'rgb(' + (r / n * 0.55 | 0) + ',' + (gg / n * 0.6 | 0) + ',' + (b / n * 0.7 | 0) + ')');
      g.fillStyle = gr; g.fillRect(0, ch - 6, c.width, ext + 6); }
    const id = g.getImageData(0, 0, c.width, c.height), d = id.data, cw = c.width;
    const lum = (i) => d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    // find the skyline per column: first row that differs clearly from that column's sky
    const sil = new Int32Array(cw), topRows = Math.max(3, Math.round(ch * 0.02));
    let sky = [0, 0, 0], skyN = 0, near = [0, 0, 0], nearN = 0;
    for (let x = 0; x < cw; x++) {
      let sr = 0, sg = 0, sb = 0;
      for (let y = 0; y < topRows; y++) { const i = (y * cw + x) * 4; sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; }
      sr /= topRows; sg /= topRows; sb /= topRows;
      sky[0] += sr; sky[1] += sg; sky[2] += sb; skyN++;
      // skyline = first strong edge going down the column (sky is a smooth gradient, mountains start with a sharp change)
      let found = -1;
      for (let y = topRows + 6; y < ch - 1; y++) {
        const i = (y * cw + x) * 4, j = ((y - 6) * cw + x) * 4;
        const e = Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]);
        const diffSky = Math.abs(d[i] - sr) + Math.abs(d[i + 1] - sg) + Math.abs(d[i + 2] - sb);
        if (e > 34 && diffSky > 30 && (!P.brightOnly || lum(i) - lum(j) > 18)) { found = y - 4; break; }
      }
      sil[x] = found;
    }
    // smooth the skyline a little
    for (let x = 0; x < cw; x++) if (sil[x] < 0) { let l = x, r = x; while (l > 0 && sil[l] < 0) l--; while (r < cw - 1 && sil[r] < 0) r++; sil[x] = Math.max(sil[l], sil[r], 0) || Math.round(ch * 0.55); }
    const sm = new Int32Array(cw);
    for (let x = 0; x < cw; x++) { const a = []; for (let k = -6; k <= 6; k++) a.push(sil[clamp(x + k, 0, cw - 1)]); a.sort((p, q) => p - q); sm[x] = a[6]; }
    // remove "towers": narrow blocks with vertical sides (clouds / stitching patches), real peaks always slope
    { const J = ch * 0.07;
      for (let x = 3; x < cw - 3; x++) {
        if (sm[x - 3] - sm[x] > J) {
          let e = x; while (e < Math.min(cw - 4, x + 160) && !(sm[e + 3] - sm[e] > J)) e++;
          if (e < Math.min(cw - 4, x + 160)) { const a0 = sm[x - 3], b0 = sm[e + 3]; for (let k = x - 2; k <= e + 2; k++) sm[k] = Math.round(a0 + (b0 - a0) * (k - x + 3) / (e - x + 6)); x = e; }
        }
      }
    }
    for (let x = 0; x < cw; x++) {
      const s0 = sm[x];
      for (let y = Math.max(0, s0 - 14); y < s0 - 2; y++) { const i = (y * cw + x) * 4; near[0] += d[i]; near[1] += d[i + 1]; near[2] += d[i + 2]; nearN++; }
      for (let y = 0; y < s0 + 2 && y < c.height; y++) { const i = (y * cw + x) * 4 + 3; d[i] = y < s0 - 2 ? 0 : Math.round(255 * (y - (s0 - 2)) / 4); }
      // soften the outer left/right ends
      const fromMid = Math.abs(x - cw / 2) - W / 2, edge = fromMid <= 0 ? 1 : Math.max(0, 1 - fromMid / (W * 0.75));
      if (edge < 1) for (let y = 0; y < c.height; y++) { const i = (y * cw + x) * 4 + 3; d[i] = Math.round(d[i] * edge); }
    }
    if (P.grade) for (let i = 0; i < d.length; i += 4) { d[i] *= P.grade[0]; d[i + 1] *= P.grade[1]; d[i + 2] = Math.min(255, d[i + 2] * P.grade[2]); }
    if (P.night) {
      for (let i = 0; i < d.length; i += 4) {
        const l = lum(i) / 255, k = Math.pow(l, 1.6) * 0.55 + 0.03;
        d[i] = 255 * k * 0.72; d[i + 1] = 255 * k * 0.84; d[i + 2] = 255 * k * 1.12;
      }
    }
    g.putImageData(id, 0, 0);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
    // map rows to elevation angles
    const degPerRow = (P.peakDeg - P.baseDeg) / ((P.baseRow - P.peakRow) * H);
    const angTop = P.peakDeg + P.peakRow * H * degPerRow, angBot = angTop - c.height * degPerRow;
    const yTop = BACKDROP_D * Math.tan(THREE.MathUtils.degToRad(angTop)), yBot = BACKDROP_D * Math.tan(THREE.MathUtils.degToRad(angBot));
    const hWorld = yTop - yBot;
    const res = {
      tex, w: hWorld * c.width / c.height, h: hWorld, yc: (yTop + yBot) / 2,
      skyTop: new THREE.Color().setRGB(sky[0] / skyN / 255, sky[1] / skyN / 255, sky[2] / skyN / 255, THREE.SRGBColorSpace),
      skyNear: new THREE.Color().setRGB(near[0] / nearN / 255, near[1] / nearN / 255, near[2] / nearN / 255, THREE.SRGBColorSpace),
    };
    backdropCache[key] = res; done(res);
  };
  img.src = P.src;
}
function showBackdrop(key) {
  buildBackdrop(key, (b) => {
    if (theme.key !== key) return;
    backdrop.material.map = b.tex; backdrop.material.needsUpdate = true;
    backdrop.scale.set(b.w, b.h, 1); backdropY = b.yc; backdrop.visible = true;
    if (!theme.night) {
      skyUniforms.top.value.copy(b.skyTop).multiplyScalar(0.92); skyUniforms.mid.value.copy(b.skyNear); skyUniforms.bottom.value.copy(b.skyNear);
      scene.fog.color.copy(b.skyNear).lerp(new THREE.Color(theme.fog), 0.35);
      ridgeTint();
    }
  });
}
// warm up the other photos in the background
setTimeout(() => ['sunset', 'day'].forEach((k) => buildBackdrop(k, () => {})), 1500);

// --- hazy blue foothill ranges in front of the snow peaks (kept at a steady angle like real distant hills)
const ridges = [];
[[-330, 0.045, 0.04], [-440, 0.052, 0.035], [-560, 0.06, 0.03]].forEach(([z, a, b], i) => {
  const dist = -z + 30, s = new THREE.Shape();
  s.moveTo(-1500, -90);
  for (let x = -1500; x <= 1500; x += 6) s.lineTo(x, 5 + dist * (a + b * fbm(x * 0.008 + i * 13.1, i * 3.7) + 0.006 * Math.abs(Math.sin(x * 0.013 + i))));
  s.lineTo(1500, -90);
  const geo = new THREE.ShapeGeometry(s);
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true }));
  m.position.z = z; m.userData.layer = i; scene.add(m); ridges.push(m);
});
function ridgeTint() {
  const fogC = scene.fog ? scene.fog.color : new THREE.Color(0x888888), c = new THREE.Color();
  for (const m of ridges) {
    const top = new THREE.Color(theme.ridge[m.userData.layer]).lerp(fogC, theme.night ? 0.1 : 0.25), pos = m.geometry.attributes.position, col = m.geometry.attributes.color;
    for (let i = 0; i < pos.count; i++) { c.copy(pos.getY(i) > -80 ? top : fogC); if (pos.getY(i) <= -80) c.lerp(top, 0.5); col.setXYZ(i, c.r, c.g, c.b); }
    col.needsUpdate = true;
  }
}

// --- near hills: valley, river, Darjeeling ridge (aerial photo texture)
{
  const geo = new THREE.PlaneGeometry(1600, 420, 220, 80); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -120);
  const pos = geo.attributes.position, uv = geo.attributes.uv, col = [], c = new THREE.Color();
  const cGrass = col3(0x9ccf7e), cForest = col3(0x55784a), cTea = col3(0x8fc865), cSand = col3(0xd8cfb8);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = terrainH(x, z);
    pos.setY(i, y); uv.setXY(i, x / 30, z / 30);
    c.copy(cGrass).lerp(cForest, clamp(clamp((y + 30) / 40, 0, 1) * 0.5 + clamp(fbm(x * 0.03 + 2, z * 0.03) - 0.35, 0, 1) * 1.5, 0, 1));
    if (teaPatch(x, z)) c.copy(cTea);
    c.lerp(cSand, Math.exp(-Math.pow((z + 26) / 7, 2)) * 0.8);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const mat = pbr('aerial_grass_rock', 1, { vertexColors: true, roughness: 1 });
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = false; scene.add(m);
}
const river = new THREE.Mesh(new THREE.PlaneGeometry(1600, 16), trackEnv(new THREE.MeshStandardMaterial({ color: 0x51707a, metalness: 0.2, roughness: 0.12 }), 1.2));
river.rotation.x = -Math.PI / 2; river.position.set(0, -40.6, -26);
scene.add(river);

// --- real trees: impostors rendered from a scanned fir tree model (Poly Haven, CC0)
const treeTex = photoTex('assets/fir_impostor.webp', 1);
treeTex.wrapS = treeTex.wrapT = THREE.ClampToEdgeWrapping;
const TREE_CELLS = 6, TREE_ASPECT = 384 / 1024;
const treeGeo = new THREE.PlaneGeometry(TREE_ASPECT, 1).translate(0, 0.5, 0);
const treeMat = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { map: { value: treeTex }, tint: { value: new THREE.Color(1, 1, 1) } }]),
  fog: true,
  vertexShader: `attribute float aCell; attribute float aShade; varying vec2 vUv; varying float vShade;
    #include <fog_pars_vertex>
    void main(){
      vec3 wb = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      float sx = length(instanceMatrix[0].xyz), sy = length(instanceMatrix[1].xyz);
      vec3 toCam = cameraPosition - wb; toCam.y = 0.0; toCam = normalize(toCam);
      vec3 right = vec3(toCam.z, 0.0, -toCam.x);
      vec3 wp = wb + right * position.x * sx + vec3(0.0, position.y * sy, 0.0);
      vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      vUv = vec2((aCell + uv.x) / ${TREE_CELLS}.0, uv.y); vShade = aShade;
      #include <fog_vertex>
    }`,
  fragmentShader: `uniform sampler2D map; uniform vec3 tint; varying vec2 vUv; varying float vShade;
    #include <fog_pars_fragment>
    void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.42) discard;
      gl_FragColor = vec4(c.rgb * tint * vShade, 1.0);
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color(), _up = new THREE.Vector3(0, 1, 0);
function makeForest(list, parent) {
  const m = new THREE.InstancedMesh(treeGeo, treeMat, list.length);
  const cell = new Float32Array(list.length), shade = new Float32Array(list.length);
  list.forEach((t, i) => {
    _m4.compose(_p.set(t.x, t.y, t.z), _q.identity(), _s.set(t.h * rand(0.85, 1.1), t.h, t.h)); m.setMatrixAt(i, _m4);
    cell[i] = Math.floor(Math.random() * TREE_CELLS); shade[i] = rand(0.82, 1.12);
  });
  m.geometry = treeGeo.clone();
  m.geometry.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 1));
  m.geometry.setAttribute('aShade', new THREE.InstancedBufferAttribute(shade, 1));
  m.frustumCulled = false;
  parent.add(m);
  return m;
}

// --- tea garden hedges: rounded leafy rows that follow the ground
const HEDGE_PROFILE = [[-0.5, 0], [-0.5, 0.42], [-0.36, 0.72], [0, 0.84], [0.36, 0.72], [0.5, 0.42], [0.5, 0]];
function makeHedges(rows, width, height) {
  const pos = [], uv = [], idx = [];
  for (const row of rows) {
    const base = pos.length / 3, P = HEDGE_PROFILE.length;
    row.forEach(([x, y, z], k) => {
      const hs = height * (0.82 + 0.3 * vnoise(x * 0.7, z * 1.3)), ws = width * (0.9 + 0.2 * vnoise(x * 0.5 + 9, z));
      HEDGE_PROFILE.forEach(([dz, dy], j) => { pos.push(x, y + dy * hs, z + dz * ws); uv.push(x / 1.4, j / (P - 1) * 1.3); });
      if (k > 0) for (let j = 0; j < P - 1; j++) { const a = base + (k - 1) * P + j, b = a + P; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M.hedge); m.castShadow = true; m.receiveShadow = true;
  return m;
}
{
  const trees = [], rows = [];
  for (let i = 0; i < 1500; i++) {
    const x = rand(-650, 650), z = rand(-260, 5);
    if (Math.abs(z + 26) < 9 || teaPatch(x, z) || Math.abs(z - TRAIN_Z) < 5) continue;
    trees.push({ x, y: terrainH(x, z) - 0.3, z, h: rand(14, 24) });
  }
  for (let z = -60; z > -118; z -= 1.9) {
    let row = [];
    for (let x = -300; x < 380; x += 1.6) {
      if (teaPatch(x, z)) row.push([x, terrainH(x, z) - 0.1, z]);
      else { if (row.length > 2) rows.push(row); row = []; }
    }
    if (row.length > 2) rows.push(row);
  }
  makeForest(trees, scene);
  scene.add(makeHedges(rows, 1.15, 0.95));
}

// --- Darjeeling town: plaster houses with window facades, tin or flat roofs with black water tanks
const facade = (() => {
  const N = 4, S = 128;
  const make = (lit) => {
    const c = document.createElement('canvas'); c.width = c.height = N * S; const g = c.getContext('2d');
    g.fillStyle = lit ? '#000' : '#ebe6dc'; g.fillRect(0, 0, c.width, c.height);
    if (!lit) {
      grain(g, c.width, c.height, 16);
      for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(80,70,60,' + rand(0.03, 0.08) + ')'; g.fillRect(rand(0, 512), rand(0, 512), rand(10, 60), rand(30, 120)); }
    }
    for (let fy = 0; fy < N; fy++) for (let fx = 0; fx < N; fx++) {
      const x = fx * S + 30, y = fy * S + 26, w = 68, h = 78;
      if (lit) {
        if (hash(fx * 7 + 1, fy * 13 + 2) > 0.45) { const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, '#ffd890'); gr.addColorStop(1, '#ffb050'); g.fillStyle = gr; g.fillRect(x + 4, y + 4, w - 8, h - 8); }
        continue;
      }
      g.fillStyle = '#f7f5ef'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#5d6f7d'); gr.addColorStop(0.5, '#25303a'); gr.addColorStop(1, '#3a4652');
      g.fillStyle = gr; g.fillRect(x + 4, y + 4, w - 8, h - 8);
      if (hash(fx, fy) > 0.5) { g.fillStyle = ['#b04a3a', '#d8c27a', '#7a9cc0', '#e0d6c8'][(fx + fy) % 4]; g.globalAlpha = 0.7; g.fillRect(x + 4, y + 4, (w - 8) * 0.35, h - 8); g.globalAlpha = 1; }
      g.fillStyle = '#f7f5ef'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.4, w, 4);
      g.fillStyle = '#cfc8bb'; g.fillRect(x - 8, y + h + 5, w + 16, 7);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(fx * S, fy * S + S - 6, S, 6);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
    return t;
  };
  return { map: make(false), lit: make(true) };
})();
const winMat = new THREE.MeshStandardMaterial({ map: facade.map, emissiveMap: facade.lit, emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, roughness: 0.85 });
{
  const BODY = [0xf0c4c9, 0xbcdcef, 0xf2e2a6, 0xf5f2ea, 0xcde6c4, 0xf0c09a, 0xd8c8ea, 0xb9dcd6, 0xe7b59f, 0xf4e8d2, 0xffffff, 0xe6e1d6];
  const ROOF = [0xa8382c, 0x2f6a4c, 0x30588f, 0x7a7f87, 0x9c4a2e, 0x3c7d6a];
  const bodies = [], roofs = [], tanks = [];
  const tint = (geo, hex) => {
    const c = new THREE.Color(hex), n = geo.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo;
  };
  let k = 0;
  for (const [cx, cz] of [[-210, -175], [-60, -165], [70, -182], [210, -170], [340, -160], [-330, -168]]) {
    for (let n = 0; n < 60; n++, k++) {
      const x = cx + (rand(0, 1) + rand(0, 1) + rand(0, 1) - 1.5) * 70, z = clamp(cz + (rand(0, 1) + rand(0, 1) - 1) * 32, -215, -138);
      const y = terrainH(x, z) - 1.5;
      if (y < -19.5) continue;
      const floors = 2 + Math.floor(rand(0, 4)), h = floors * 3 + 1.5, w = 3.4 * Math.round(rand(1.6, 3.2)), d = rand(6, 9), ry = rand(-0.3, 0.3);
      const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), uv = geo.attributes.uv;
      for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
        const i = f * 4 + v, fw = f < 2 ? d : w;
        if (f === 2 || f === 3) uv.setXY(i, 0.02, 0.5); else uv.setXY(i, uv.getX(i) * fw / 13.6, uv.getY(i) * h / 12);
      }
      geo.rotateY(ry).translate(x, y, z);
      bodies.push(tint(geo, BODY[k % BODY.length]));
      if (hash(x, z) > 0.4) {
        const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.4, 0); tri.lineTo(w / 2 + 0.4, 0); tri.lineTo(0, w * 0.28); tri.lineTo(-w / 2 - 0.4, 0);
        const r = new THREE.ExtrudeGeometry(tri, { depth: d + 0.6, bevelEnabled: false }).translate(0, 0, -(d + 0.6) / 2).rotateY(ry).translate(x, y + h, z);
        r.scale(1, 1, 1);
        roofs.push(tint(r, ROOF[(k * 7) % ROOF.length]));
      } else {
        const nT = hash(z, x) > 0.5 ? 2 : 1;
        for (let t = 0; t < nT; t++) tanks.push(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 12).translate(x + (t - 0.5) * 1.6, y + h + 0.6, z - 1));
      }
    }
  }
  scene.add(new THREE.Mesh(mergeGeometries(bodies), winMat));
  M.tin.vertexColors = true;
  scene.add(new THREE.Mesh(mergeGeometries(roofs), M.tin));
  scene.add(new THREE.Mesh(mergeGeometries(tanks), new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.5 })));
}

// --- monastery with golden roofs (Ghoom style)
function buildMonastery(x, z, sc) {
  const y = terrainH(x, z), g = new THREE.Group();
  const white = M.wall.clone(); white.color = new THREE.Color(0xf3ede0);
  const red = M.wall.clone(); red.color = new THREE.Color(0x8a2420);
  const box = (w, h, d, mat, yy) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.y = yy; g.add(m); };
  const roof = (r, h, yy) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), M.gold); m.rotation.y = Math.PI / 4; m.position.y = yy; g.add(m); };
  box(16, 4, 12, white, 0); box(11, 6, 9, red, 5); box(12, 0.8, 10, white, 8.3); roof(9, 3.2, 10.3);
  box(5, 3, 5, red, 13); roof(4.6, 2.4, 15.7);
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.45, 3, 8), M.gold); sp.position.y = 18; g.add(sp);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), M.gold); ball.position.y = 19.6; g.add(ball);
  g.position.set(x, y - 1, z); g.scale.setScalar(sc); g.rotation.y = 0.15;
  scene.add(g);
}
buildMonastery(40, -192, 1); buildMonastery(-150, -178, 0.8);

// --- the blue toy train on its hillside track
const trainWin = new THREE.MeshStandardMaterial({ color: 0x2a2a22, emissive: 0xffd27a, emissiveIntensity: 0, roughness: 0.3 });
const train = (() => {
  const g = new THREE.Group();
  const blue = trackEnv(new THREE.MeshStandardMaterial({ color: 0x2557a8, roughness: 0.45, metalness: 0.25 }));
  const black = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.6, metalness: 0.4 });
  const red = new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.5 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xe9e2cf, roughness: 0.6 });
  const add = (geo, mat, x, y, z = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.z = rz; g.add(m); return m; };
  add(new THREE.CylinderGeometry(0.72, 0.72, 2.6, 16), blue, 1.6, 1.5, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(2.4, 1.0, 1.7), blue, 1.6, 1.3);
  add(new THREE.BoxGeometry(1.4, 2.0, 1.8), blue, -0.1, 1.7);
  add(new THREE.BoxGeometry(1.7, 0.15, 2.0), black, -0.1, 2.75);
  add(new THREE.CylinderGeometry(0.22, 0.32, 0.9, 10), black, 2.6, 2.55);
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 10), M.gold, 1.5, 2.35);
  add(new THREE.BoxGeometry(4, 0.4, 1.6), black, 1, 0.55);
  add(new THREE.BoxGeometry(0.15, 0.45, 1.9), red, 3.05, 0.6);
  add(new THREE.SphereGeometry(0.16, 8, 6), trainWin, 3.0, 1.55, 0);
  const wheel = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 12).rotateX(Math.PI / 2);
  for (const wx of [0.3, 1.0, 1.7, 2.4]) for (const z of [-0.8, 0.8]) add(wheel, black, wx, 0.4, z);
  for (let k = 0; k < 3; k++) {
    const cx = -3.4 - k * 4.9;
    add(new THREE.BoxGeometry(4.4, 1.3, 1.9), blue, cx, 1.35);
    add(new THREE.BoxGeometry(4.4, 0.6, 1.9), cream, cx, 2.3);
    add(new THREE.BoxGeometry(3.9, 0.45, 1.94), trainWin, cx, 2.3);
    add(new THREE.BoxGeometry(4.6, 0.2, 2.1), cream, cx, 2.7);
    add(new THREE.BoxGeometry(4.2, 0.35, 1.5), black, cx, 0.55);
    for (const wx of [-1.5, 1.5]) for (const z of [-0.8, 0.8]) add(wheel, black, cx + wx, 0.4, z);
  }
  g.scale.setScalar(1.25);
  g.position.set(rand(-60, 10), TRAIN_Y, TRAIN_Z);
  scene.add(g);
  const rails = new THREE.Mesh(new THREE.BoxGeometry(1600, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: 0x4a443c, roughness: 0.9 }));
  rails.position.set(0, TRAIN_Y - 0.1, TRAIN_Z); scene.add(rails);
  return { g, whistleT: 4 };
})();

// --- valley mist
const clouds = [];
for (let i = 0; i < 16; i++) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: rand(0.22, 0.38) }));
  sp.scale.set(rand(60, 130), rand(12, 24), 1); sp.position.set(rand(-400, 400), rand(-34, -20), rand(-110, -25)); sp.userData = { v: rand(0.8, 2), kind: 'mist' };
  scene.add(sp); clouds.push(sp);
}

/* ------------------------------------------------------------------ themes */
const THEMES = {
  day: { key: 'day', label: 'Morning', top: 0x3f7fb0, mid: 0x9cc3d6, bottom: 0x9cc3d6, fog: 0xaecbd8, sun: 0xfff0d6, sunI: 3.0, dir: [0.45, 0.75, 0.5], hs: 0xc4e0ff, hg: 0x5b5a45, hI: 0.55, ridge: [0x2c4256, 0x3e5a70, 0x557489], env: 0.8, exp: 1.0, glow: 0.6, night: false, tree: [1, 1, 1], cloud: 0xf2f6fa },
  sunset: { key: 'sunset', label: 'Golden hour', top: 0x3a4660, mid: 0x7c7f8c, bottom: 0x6a6a78, fog: 0x8a7f86, sun: 0xffb36b, sunI: 2.6, dir: [-0.75, 0.2, 0.6], hs: 0xffc9a0, hg: 0x3a3040, hI: 0.55, ridge: [0x262d42, 0x343c55, 0x454d66], env: 0.7, exp: 1.05, glow: 0.4, night: false, tree: [1.0, 0.86, 0.72], cloud: 0xe8c8b4 },
  night: { key: 'night', label: 'Moonlit', top: 0x01030a, mid: 0x0c1a3d, bottom: 0x05080f, fog: 0x0d1730, sun: 0xa8bcff, sunI: 0.42, dir: [-0.35, 0.55, 0.75], hs: 0x2c3c6e, hg: 0x07070d, hI: 0.32, ridge: [0x080e1d, 0x0c1427, 0x111a31], env: 0.35, exp: 1.0, glow: 0.3, night: true, tree: [0.14, 0.17, 0.26], cloud: 0x26324d },
};
let theme = THEMES.day;
function applyEnv() {
  scene.traverse((o) => {
    if (!o.material) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (m.envMapIntensity === undefined) continue;
      if (m.userData.envBase === undefined) m.userData.envBase = 1;
      m.envMapIntensity = m.userData.envBase * theme.env;
    }
  });
}
function applyTheme(t) {
  theme = t;
  skyUniforms.top.value.setHex(t.top); skyUniforms.mid.value.setHex(t.mid); skyUniforms.bottom.value.setHex(t.bottom);
  skyUniforms.sunColor.value.setHex(t.sun); skyUniforms.glow.value = t.glow;
  sunDir.set(...t.dir).normalize(); skyUniforms.sunDir.value.copy(sunDir);
  scene.fog = new THREE.Fog(t.fog, 220, 2300);
  scene.environment = envMaps[t.key] || roomEnv;
  sun.color.setHex(t.sun); sun.intensity = t.sunI;
  hemi.color.setHex(t.hs); hemi.groundColor.setHex(t.hg); hemi.intensity = t.hI;
  ridgeTint();
  applyEnv();
  renderer.toneMappingExposure = t.exp;
  stars.visible = t.night;
  treeMat.uniforms.tint.value.setRGB(...t.tree);
  clouds.forEach((c) => c.material.color.setHex(t.cloud));
  winMat.emissiveIntensity = t.night ? 1.6 : 0;
  trainWin.emissiveIntensity = t.night ? 2.2 : 0;
  backdrop.visible = false;
  showBackdrop(t.key);
  if (car) car.setNight(t.night);
}

/* ------------------------------------------------------------------ the car */
const PAINTS = [
  { name: 'Racing Red', hex: 0xc4111b }, { name: 'Solar Yellow', hex: 0xf2b705 }, { name: 'Arctic Silver', hex: 0xc6ccd4 },
  { name: 'Lava Orange', hex: 0xff5a14 }, { name: 'Midnight Blue', hex: 0x15275a }, { name: 'British Green', hex: 0x0f4a2b },
  { name: 'Carbon Black', hex: 0x141519 }, { name: 'Pearl White', hex: 0xf1f1ee },
];
const RIMS = [{ name: 'Silver', hex: 0xd8dde3 }, { name: 'Gunmetal', hex: 0x3a3f47 }, { name: 'Gold', hex: 0xd9a63a }, { name: 'Black', hex: 0x111215 }];
const WHEEL_R = 0.36;
const AXLES = [{ x: 1.36, y: 0.32 }, { x: -1.38, y: 0.32 }];

function buildCar() {
  const g = new THREE.Group();
  const paint = trackEnv(new THREE.MeshPhysicalMaterial({ color: PAINTS[save.paint].hex, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.04 }));
  const glass = trackEnv(new THREE.MeshPhysicalMaterial({ color: 0x0b0e14, metalness: 0.3, roughness: 0.04, clearcoat: 1 }), 1.3);
  const trim = trackEnv(new THREE.MeshStandardMaterial({ color: 0x0e0f12, roughness: 0.55, metalness: 0.3 }), 0.6);
  const chrome = trackEnv(new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 }));
  const rim = trackEnv(new THREE.MeshStandardMaterial({ color: RIMS[save.rim].hex, metalness: 0.95, roughness: 0.22 }));
  const tire = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.92 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xe9f2ff, emissive: 0xdfeaff, emissiveIntensity: 1.2, roughness: 0.1 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x5a0006, emissive: 0xff1020, emissiveIntensity: 1.2, roughness: 0.2 });
  const caliperMat = new THREE.MeshStandardMaterial({ color: 0xd8141f, roughness: 0.4, metalness: 0.3 });
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; g.add(m); return m; };

  // side profile: low nose, long hood, fastback, ducktail
  const by = 0.24, ar = 0.42;
  const s = new THREE.Shape();
  s.moveTo(-2.17, by + 0.06);
  s.lineTo(AXLES[1].x - ar, by); s.absarc(AXLES[1].x, AXLES[1].y, ar, Math.PI, 0, true); s.lineTo(AXLES[1].x + ar, by);
  s.lineTo(AXLES[0].x - ar, by); s.absarc(AXLES[0].x, AXLES[0].y, ar, Math.PI, 0, true); s.lineTo(AXLES[0].x + ar, by);
  s.lineTo(2.12, by); s.quadraticCurveTo(2.32, by + 0.03, 2.33, 0.42);
  s.quadraticCurveTo(2.33, 0.58, 2.16, 0.62);
  s.quadraticCurveTo(1.5, 0.86, 0.78, 0.87);
  s.lineTo(-1.15, 0.93);
  s.quadraticCurveTo(-1.9, 0.96, -2.2, 0.88);
  s.quadraticCurveTo(-2.33, 0.62, -2.22, 0.36);
  s.lineTo(-2.17, by + 0.06);
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 1.72, bevelEnabled: true, bevelThickness: 0.13, bevelSize: 0.09, bevelSegments: 5, curveSegments: 28, steps: 1 });
  bodyGeo.translate(0, 0, -0.86);
  add(bodyGeo, paint, 0, 0, 0);

  // glasshouse
  const c = new THREE.Shape();
  c.moveTo(0.98, 0.84); c.quadraticCurveTo(0.45, 1.12, 0.02, 1.235); c.lineTo(-0.62, 1.25);
  c.quadraticCurveTo(-1.3, 1.2, -1.9, 0.92); c.lineTo(-1.9, 0.84); c.lineTo(0.98, 0.84);
  const cabGeo = new THREE.ExtrudeGeometry(c, { depth: 1.3, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.07, bevelSegments: 4, curveSegments: 20 });
  cabGeo.translate(0, 0, -0.65);
  add(cabGeo, glass, 0, 0, 0);
  // painted roof spine + rear buttresses
  const r = new THREE.Shape();
  r.moveTo(0.3, 1.19); r.quadraticCurveTo(0.1, 1.27, -0.2, 1.285); r.lineTo(-0.62, 1.29); r.quadraticCurveTo(-1.1, 1.25, -1.5, 1.08);
  r.lineTo(-1.5, 1.02); r.quadraticCurveTo(-1.1, 1.19, -0.62, 1.22); r.lineTo(-0.2, 1.22); r.quadraticCurveTo(0.1, 1.2, 0.3, 1.13);
  const roofGeo = new THREE.ExtrudeGeometry(r, { depth: 1.12, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.03, bevelSegments: 3, curveSegments: 16 });
  roofGeo.translate(0, 0, -0.56);
  add(roofGeo, paint, 0, 0, 0);

  // aero + details
  add(new THREE.BoxGeometry(0.5, 0.05, 1.86), trim, 2.12, by - 0.01, 0);           // front splitter
  add(new THREE.BoxGeometry(0.42, 0.16, 1.5), trim, -2.08, by + 0.07, 0);            // diffuser
  add(new THREE.BoxGeometry(1.9, 0.08, 1.98), trim, 0, by + 0.02, 0);                // side skirts
  for (const z of [-1, 1]) {
    add(new THREE.BoxGeometry(0.62, 0.2, 0.06), trim, -0.55, 0.56, z * 0.99, 0, 0, -0.12); // side intake
    add(new THREE.SphereGeometry(1, 20, 12), headMat, 2.1, 0.57, z * 0.66).scale.set(0.2, 0.05, 0.24); // headlight
    add(new THREE.BoxGeometry(0.12, 0.06, 0.16), trim, 0.62, 0.98, z * 0.98);          // mirror
    add(new THREE.BoxGeometry(0.05, 0.2, 0.05), trim, -1.92, 1.04, z * 0.5);           // wing strut
    add(new THREE.CylinderGeometry(0.065, 0.075, 0.22, 16), chrome, -2.27, 0.33, z * 0.32, 0, 0, Math.PI / 2); // exhaust
  }
  add(new THREE.BoxGeometry(0.42, 0.04, 1.86), paint, -1.95, 1.15, 0, 0, 0, 0.06);   // rear wing
  add(new THREE.BoxGeometry(0.4, 0.14, 0.03), trim, -1.95, 1.12, 0.94);
  add(new THREE.BoxGeometry(0.4, 0.14, 0.03), trim, -1.95, 1.12, -0.94);
  add(new THREE.BoxGeometry(0.04, 0.05, 1.7), tailMat, -2.29, 0.7, 0);                // light bar
  add(new THREE.BoxGeometry(0.03, 0.12, 0.9), trim, 2.33, 0.42, 0);                   // grille

  // nitro flames
  const flames = [];
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x8fe8ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const z of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.7, 12), flameMat);
    f.rotation.z = Math.PI / 2; f.position.set(-2.72, 0.33, z * 0.32); f.visible = false; g.add(f); flames.push(f);
  }
  // night headlight beam
  const beam = new THREE.SpotLight(0xfff1d8, 0, 70, 0.42, 0.5, 1.2);
  beam.position.set(2.0, 0.6, 0); beam.target.position.set(14, -1.2, 0);
  g.add(beam, beam.target);

  // wheels: hub (follows car tilt) -> spin (rolls)
  const wheels = [];
  const tireGeo = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.28, 36, 1); tireGeo.rotateX(Math.PI / 2);
  const wallGeo = new THREE.TorusGeometry(WHEEL_R - 0.04, 0.045, 10, 36);
  const rimGeo = new THREE.CylinderGeometry(0.245, 0.245, 0.29, 28); rimGeo.rotateX(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(0.05, 0.22, 0.03); spokeGeo.translate(0, 0.12, 0);
  const discGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 24); discGeo.rotateX(Math.PI / 2);
  const discMat = trackEnv(new THREE.MeshStandardMaterial({ color: 0x55585e, metalness: 0.9, roughness: 0.45 }));
  for (const ax of AXLES) {
    for (const z of [-0.86, 0.86]) {
      const hub = new THREE.Group(), spin = new THREE.Group();
      hub.add(spin);
      const tm = new THREE.Mesh(tireGeo, tire); tm.castShadow = true; spin.add(tm);
      for (const side of [-1, 1]) { const w = new THREE.Mesh(wallGeo, tire); w.position.z = side * 0.14; spin.add(w); }
      const disc = new THREE.Mesh(discGeo, discMat); spin.add(disc);
      const face = new THREE.Mesh(rimGeo, rim); face.scale.z = 0.25; face.position.z = Math.sign(z) * 0.115; spin.add(face);
      for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(spokeGeo, rim); sp.rotation.z = k * Math.PI * 2 / 5; sp.position.z = Math.sign(z) * 0.135; spin.add(sp); }
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12).rotateX(Math.PI / 2), chrome); cap.position.z = Math.sign(z) * 0.15; spin.add(cap);
      const cal = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.08), caliperMat); cal.position.set(0.13, 0.08, Math.sign(z) * 0.07); cal.rotation.z = -0.5; hub.add(cal);
      hub.position.z = z;
      scene.add(hub);
      wheels.push({ hub, spin, axle: AXLES.indexOf(ax) });
    }
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g);

  return {
    group: g, wheels, flames, beam, paint, rim, headMat, tailMat,
    setPaint(i) { paint.color.setHex(PAINTS[i].hex); },
    setRim(i) { rim.color.setHex(RIMS[i].hex); },
    setNight(n) { beam.intensity = n ? 220 : 0; headMat.emissiveIntensity = n ? 4 : 1.2; tailMat.emissiveIntensity = n ? 3 : 1.2; },
  };
}
let car = null;
car = buildCar();

/* ------------------------------------------------------------------ particles */
class Particles {
  constructor(max, additive) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max); this.a0 = new Float32Array(max); this.grav = new Float32Array(max); this.drag = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo = geo;
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 400 } }, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute float aSize; attribute vec4 aColor; varying vec4 vC; uniform float uScale;
        void main(){ vC = aColor; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uScale / max(-mv.z, 0.1); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec4 vC; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; float a = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(vC.rgb, vC.a * a);
        #include <colorspace_fragment>
      }`,
    });
    this.points = new THREE.Points(geo, this.mat); this.points.frustumCulled = false;
    scene.add(this.points);
  }
  spawn(x, y, z, vx, vy, vz, life, s0, s1, color, alpha = 1, grav = 0, drag = 0) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.pos.set([x, y, z], i * 3); this.vel.set([vx, vy, vz], i * 3);
    this.life[i] = life; this.maxLife[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.a0[i] = alpha; this.grav[i] = grav; this.drag[i] = drag;
    this.col[i * 4] = color.r; this.col[i * 4 + 1] = color.g; this.col[i * 4 + 2] = color.b;
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.copy(this.n - 1, i); this.n--; continue; }
      const k = 1 - this.life[i] / this.maxLife[i], d = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= d; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * d - this.grav[i] * dt; this.vel[i * 3 + 2] *= d;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] = lerp(this.s0[i], this.s1[i], k);
      this.col[i * 4 + 3] = this.a0[i] * (1 - k) * Math.min(1, k * 8 + 0.2);
      i++;
    }
    this.geo.setDrawRange(0, this.n);
    for (const a of ['position', 'aColor', 'aSize']) this.geo.attributes[a].needsUpdate = true;
  }
  copy(from, to) {
    if (from === to) return;
    for (let k = 0; k < 3; k++) { this.pos[to * 3 + k] = this.pos[from * 3 + k]; this.vel[to * 3 + k] = this.vel[from * 3 + k]; }
    for (let k = 0; k < 4; k++) this.col[to * 4 + k] = this.col[from * 4 + k];
    for (const arr of [this.size, this.life, this.maxLife, this.s0, this.s1, this.a0, this.grav, this.drag]) arr[to] = arr[from];
  }
  clear() { this.n = 0; }
}
const smoke = new Particles(1400, false);
const glowFx = new Particles(1400, true);
const C = (hex) => new THREE.Color(hex);
const COL = { trainSmoke: C(0x8d8f94), dust: C(0xb9a88f), smoke: C(0x9a9a9a), dark: C(0x3a3a3a), flame: C(0x3fd8ff), fire: C(0xff8a2a), spark: C(0xffd27a), gold: C(0xffcf4a), cyan: C(0x5fe9ff), ink: C(0xffffff) };
const CONFETTI = [0xff2d3d, 0xffc83d, 0x27d9ff, 0x3cf08a, 0xb36bff, 0xffffff].map(C);

/* ------------------------------------------------------------------ audio (code-made) */
const Sound = {
  ctx: null, master: null, eng: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ctx = ctx; this.master = ctx.createGain(); this.master.gain.value = save.muted ? 0 : 0.55; this.master.connect(ctx.destination);
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'square'; o3.type = 'sawtooth';
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 4;
      const gn = ctx.createGain(); gn.gain.value = 0;
      const g2 = ctx.createGain(); g2.gain.value = 0.35;
      o1.connect(f); o2.connect(g2); g2.connect(f); o3.connect(f); f.connect(gn); gn.connect(this.master);
      o1.start(); o2.start(); o3.start();
      this.eng = { o1, o2, o3, f, gn };
    } catch (e) { this.ctx = null; }
  },
  setMuted(m) { save.muted = m; persist(); if (this.master) this.master.gain.value = m ? 0 : 0.55; },
  engine(on, speed, boost) {
    if (!this.eng) return;
    const t = this.ctx.currentTime, e = this.eng;
    const rpm = 48 + Math.abs(speed) * 7 + (boost ? 40 : 0);
    e.o1.frequency.setTargetAtTime(rpm, t, 0.08); e.o2.frequency.setTargetAtTime(rpm * 0.5, t, 0.08); e.o3.frequency.setTargetAtTime(rpm * 1.006, t, 0.08);
    e.f.frequency.setTargetAtTime(380 + Math.abs(speed) * 60 + (boost ? 900 : 0), t, 0.1);
    e.gn.gain.setTargetAtTime(on ? (boost ? 0.16 : 0.1) : 0.035, t, 0.15);
  },
  tone(freq, dur, type = 'sine', vol = 0.3, slide = 0, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.4, freq = 900, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, n = Math.floor(this.ctx.sampleRate * dur);
    const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(); s.buffer = b;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  coin() { this.tone(1320, 0.12, 'square', 0.12); this.tone(1980, 0.25, 'square', 0.1, 0, 0.07); },
  crash() { this.noise(0.7, 0.7, 700); this.tone(90, 0.5, 'sawtooth', 0.25, -50); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.22, 0, i * 0.11)); this.tone(1568, 0.8, 'triangle', 0.15, 0, 0.45); },
  turbo() { this.tone(300, 0.4, 'sawtooth', 0.12, 900); this.noise(0.3, 0.2, 3000); },
  draw() { this.tone(rand(700, 900), 0.04, 'triangle', 0.025); },
  land(v) { this.noise(0.18, clamp(v * 0.05, 0.05, 0.5), 400); },
  click() { this.tone(660, 0.05, 'triangle', 0.12); },
  whistle() { this.tone(740, 0.9, 'sine', 0.045); this.tone(932, 0.9, 'sine', 0.035); this.tone(740, 0.5, 'sine', 0.04, 0, 1.05); this.tone(932, 0.5, 'sine', 0.03, 0, 1.05); },
};

/* ------------------------------------------------------------------ levels */
// grounds: top surface of each cliff (left to right). Units are metres.
const LEVELS = [
  { name: 'First Sketch', theme: 'day', ink: 32, par: 19, finish: 34, grounds: [[[-16, 0], [6, 0]], [[22, 0], [46, 0]]], coins: [[14, 2.6]] },
  { name: 'Up the Ridge', theme: 'day', ink: 40, par: 26, finish: 36, grounds: [[[-16, 0], [4, 0]], [[24, 7], [48, 7]]], coins: [[11, 2.5], [18, 5.5]] },
  { name: 'Drop & Rise', theme: 'day', ink: 48, par: 30, finish: 42, grounds: [[[-16, 6], [2, 6]], [[14, -2], [18.5, -2]], [[32, 4], [54, 4]]], coins: [[9, 2], [16.2, 0.4], [25, 3]] },
  { name: 'Crate Canyon', theme: 'day', ink: 42, par: 26, finish: 47, grounds: [[[-16, 0], [6, 0]], [[30, 0], [58, 0]]], coins: [[18, 6.5], [38, 4]], crates: [[35, 0.6], [36.2, 0.6], [35.6, 1.8], [40, 0.6]] },
  { name: 'Windmill Gap', theme: 'day', ink: 50, par: 32, finish: 45, grounds: [[[-16, 0], [6, 0]], [[34, 2], [56, 2]]], coins: [[13, 4.5], [27, 5]], spinners: [{ x: 20, y: 0.5, len: 9, w: 1.1 }] },
  { name: 'Sunset Steps', theme: 'sunset', ink: 46, par: 29, finish: 46, grounds: [[[-16, 0], [4, 0]], [[12, 3], [15.5, 3]], [[23, 6], [26.5, 6]], [[36, 9], [58, 9]]], coins: [[13.8, 4.6], [24.8, 7.6], [31, 9.5]] },
  { name: 'Night Leap', theme: 'night', ink: 40, par: 22, finish: 52, grounds: [[[-16, 4], [6, 4]], [[44, 0], [66, 0]]], coins: [[22, 10], [30, 9]] },
  { name: 'The Summit', theme: 'sunset', ink: 66, par: 49, finish: 56, grounds: [[[-16, 0], [4, 0]], [[24, -4], [27.5, -4]], [[46, 10], [70, 10]]], coins: [[9, 0], [25.8, -2.4], [37, 4.5]], spinners: [{ x: 14, y: 2, len: 7, w: -1.3 }], crates: [[52, 10.6]] },
];
const heightAt = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0)); } return pts[0][1]; };

/* ------------------------------------------------------------------ road ribbon geometry */
function ribbonGeometry(rawPts, { halfW = 1.7, thick = 0.32, lift = 0.04, uLen = 6 } = {}) {
  let sdx = 0; for (let i = 1; i < rawPts.length; i++) sdx += rawPts[i][0] - rawPts[i - 1][0];
  const pts = sdx < 0 ? rawPts.slice().reverse() : rawPts;
  const n = pts.length, T = [], B = [], U = [];
  let u = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty, ny = tx;
    if (i > 0) u += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    T.push([pts[i][0] + nx * lift, pts[i][1] + ny * lift]); B.push([pts[i][0] - nx * thick, pts[i][1] - ny * thick]); U.push(u / uLen);
  }
  // top surface
  const tp = [], tuv = [], ti = [];
  for (let i = 0; i < n; i++) { tp.push(T[i][0], T[i][1], halfW, T[i][0], T[i][1], -halfW); tuv.push(U[i], 0, U[i], 1); }
  for (let i = 0; i < n - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; ti.push(a, c, b, b, c, d); }
  const top = new THREE.BufferGeometry();
  top.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); top.setAttribute('uv', new THREE.Float32BufferAttribute(tuv, 2)); top.setIndex(ti); top.computeVertexNormals();
  // sides + bottom + caps
  const sp = [], si = [], suv = [];
  const strip = (A, Bv, za, zb) => {
    const base = sp.length / 3;
    for (let i = 0; i < n; i++) { sp.push(A[i][0], A[i][1], za, Bv[i][0], Bv[i][1], zb); suv.push(U[i] * 1.5, 0, U[i] * 1.5, 1); }
    for (let i = 0; i < n - 1; i++) { const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3; si.push(a, b, c, c, b, d); }
  };
  strip(T, B, halfW, halfW); strip(B, T, -halfW, -halfW); strip(B, B, halfW, -halfW);
  for (const i of [0, n - 1]) {
    const base = sp.length / 3;
    sp.push(T[i][0], T[i][1], halfW, T[i][0], T[i][1], -halfW, B[i][0], B[i][1], halfW, B[i][0], B[i][1], -halfW);
    suv.push(0, 0, 1, 0, 0, 1, 1, 1); si.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  }
  const side = new THREE.BufferGeometry();
  side.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); side.setAttribute('uv', new THREE.Float32BufferAttribute(suv, 2)); side.setIndex(si); side.computeVertexNormals();
  return { top, side };
}

/* ------------------------------------------------------------------ world state */
let world = null, level = null, levelIdx = 0;
const levelGroup = new THREE.Group(); scene.add(levelGroup);
let chassis = null, wheelBodies = [], joints = [];
let strokes = [], curStroke = null, pen = 'road', inkUsed = 0;
let coins = [], crates = [], spinners = [];
let state = 'title'; // title | levels | garage | plan | drive | won | failed
let timer = 0, nitro = 100, stunts = 0, coinsGot = 0;
let airTime = 0, airSpin = 0, lastAngle = 0, wasGrounded = true, crashT = 0, stuckT = 0, endT = 0, turboCool = 0;
let shake = 0, failY = -14, finishY = 0, finishEnd = 0;
const keys = { nitro: false, brake: false, left: false, right: false };

function disposeGroup(grp) {
  for (const c of [...grp.children]) {
    grp.remove(c);
    c.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }
}

function addMesh(geo, mat, parent = levelGroup, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m;
}

function buildCliff(top) {
  const x0 = top[0][0], x1 = top[top.length - 1][0], yBot = -46;
  const s = new THREE.Shape();
  s.moveTo(x0 + 0.6, yBot);
  // jagged left wall (only inward so it never pokes out past the physics wall)
  for (let y = yBot + 3; y < top[0][1] - 0.8; y += rand(1.2, 2.4)) s.lineTo(x0 + rand(0, 0.9) + Math.max(0, (top[0][1] - y) * 0.015), y);
  for (const [x, y] of top) s.lineTo(x, y - 0.02);
  for (let y = top[top.length - 1][1] - 0.8; y > yBot + 3; y -= rand(1.2, 2.4)) s.lineTo(x1 - rand(0, 0.9) - Math.max(0, (top[top.length - 1][1] - y) * 0.015), y);
  s.lineTo(x1 - 0.6, yBot);
  const depth = 9.5;
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 4 });
  geo.translate(0, 0, -depth + 1.9);
  const pos = geo.attributes.position, nrm = geo.attributes.normal, col = [];
  const grass = new THREE.Color(0x4f7d33), rock = new THREE.Color(0xffffff), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), x = pos.getX(i), tY = heightAt(top, clamp(x, x0, x1));
    if (nrm.getY(i) > 0.55) c.copy(grass).multiplyScalar(0.85 + hash(x, y) * 0.3);
    else { const k = clamp((tY - y) / 40, 0, 1); c.copy(rock).multiplyScalar(1 - k * 0.55); if (tY - y < 0.5) c.lerp(grass, 0.5); }
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  addMesh(geo, M.rock, levelGroup, false, true);
  // asphalt on top
  const r = ribbonGeometry(top, { thick: 0.5 });
  addMesh(r.top, M.asphalt, levelGroup, false, true); addMesh(r.side, M.concrete, levelGroup, true, true);
  // guard posts along the back edge
  const postGeo = new THREE.BoxGeometry(0.12, 0.7, 0.12);
  for (let x = x0 + 1; x < x1 - 0.5; x += 3) { const p = addMesh(postGeo, M.pillar); p.position.set(x, heightAt(top, x) + 0.35, -1.9); }
  // physics: top plus vertical walls
  const b = world.createBody();
  const chain = [V2(x0, yBot), ...top.map(([x, y]) => V2(x, y)), V2(x1, yBot)];
  b.createFixture(pl.Chain(chain, false), { friction: 0.95 });
}

function buildFinish(x, y) {
  const grp = new THREE.Group(); grp.position.set(x, y, 0); levelGroup.add(grp);
  for (const z of [-2.35, 2.35]) {
    const p = addMesh(new THREE.BoxGeometry(0.45, 6, 0.45), M.pillar, grp); p.position.set(0, 3, z);
    const n = addMesh(new THREE.BoxGeometry(0.06, 5.2, 0.08), M.neon, grp, false, false); n.position.set(0.24, 3.1, z);
  }
  const beam = addMesh(new THREE.BoxGeometry(0.4, 0.4, 5.15), M.pillar, grp); beam.position.set(0, 6, 0);
  const ban = addMesh(new THREE.BoxGeometry(4.6, 1.3, 0.25), [M.pillar, M.pillar, M.pillar, M.pillar, M.banner, M.banner], grp);
  ban.position.set(0, 6.85, 0);
  const line = addMesh(new THREE.PlaneGeometry(1.1, 3.4), M.checker, grp, false, true);
  line.rotation.x = -Math.PI / 2; line.position.set(0, 0.06, 0);
  M.checker.map.repeat.set(1, 1);
}

function makeCoin() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32).rotateX(Math.PI / 2), M.gold);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 10, 32), M.gold);
  const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.13 : 0.3, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const st = new THREE.Mesh(new THREE.ExtrudeGeometry(star, { depth: 0.16, bevelEnabled: false }), M.gold); st.position.z = -0.08;
  g.add(disc, ring, st); g.traverse((o) => { o.castShadow = true; });
  return g;
}

function spawnCar(x, y) {
  chassis = world.createDynamicBody({ position: V2(x, y), angularDamping: 0.3 });
  chassis.createFixture(pl.Polygon([V2(-2.2, 0.3), V2(2.25, 0.3), V2(2.28, 0.55), V2(0.8, 0.84), V2(-1.9, 0.9), V2(-2.25, 0.7)]), { density: 2.2, friction: 0.4, restitution: 0.05 });
  chassis.createFixture(pl.Polygon([V2(-1.85, 0.85), V2(0.9, 0.82), V2(0.0, 1.24), V2(-0.7, 1.25)]), { density: 1, friction: 0.4 });
  wheelBodies = []; joints = [];
  for (const ax of AXLES) {
    const w = world.createDynamicBody({ position: V2(x + ax.x, y + ax.y), angularDamping: 0.2 });
    w.createFixture(pl.Circle(WHEEL_R), { density: 1.3, friction: 1.6, restitution: 0.05 });
    const j = world.createJoint(pl.WheelJoint({ motorSpeed: 0, maxMotorTorque: 60, enableMotor: true, frequencyHz: 4.5, dampingRatio: 0.72 }, chassis, w, w.getPosition(), V2(0, 1)));
    wheelBodies.push(w); joints.push(j);
  }
}

function loadLevel(idx, keepStrokes = false) {
  const keep = keepStrokes ? strokes.map((s) => ({ type: s.type, pts: s.pts })) : [];
  disposeGroup(levelGroup);
  smoke.clear(); glowFx.clear();
  levelIdx = idx; level = LEVELS[idx];
  applyTheme(THEMES[level.theme]);
  world = pl.World({ gravity: V2(0, -10) });

  for (const g of level.grounds) buildCliff(g);
  const fg = level.grounds[level.grounds.length - 1];
  finishY = heightAt(fg, level.finish); finishEnd = fg[fg.length - 1][0];
  buildFinish(level.finish, finishY);
  failY = Math.min(...level.grounds.flat().map((p) => p[1])) - 16;

  // tea garden hedges + tall trees on the cliff tops behind the road
  const forest = [], hedgeRows = [];
  for (const g of level.grounds) {
    const x0 = g[0][0], x1 = g[g.length - 1][0];
    for (let z = -2.9; z > -7.4; z -= 1.45) { const row = []; for (let x = x0 + 0.5; x <= x1 - 0.5; x += 0.7) row.push([x, heightAt(g, x) - 0.06, z]); if (row.length > 2) hedgeRows.push(row); }
    for (let x = x0 + 1.5; x < x1 - 1; x += rand(6, 10)) forest.push({ x, y: heightAt(g, x) - 0.15, z: rand(-7.5, -7.0), h: rand(9, 14) });
  }
  makeForest(forest, levelGroup);
  levelGroup.add(makeHedges(hedgeRows, 1.0, 0.85));
  buildPrayerFlags();

  coins = level.coins.map(([x, y]) => { const m = makeCoin(); m.position.set(x, y, 0); levelGroup.add(m); return { x, y, mesh: m, got: false }; });
  crates = (level.crates || []).map(([x, y]) => {
    const b = world.createDynamicBody({ position: V2(x, y) }); b.createFixture(pl.Box(0.55, 0.55), { density: 0.35, friction: 0.7 });
    const m = addMesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), M.crate); return { b, m };
  });
  spinners = (level.spinners || []).map((s) => {
    const b = world.createBody({ type: 'kinematic', position: V2(s.x, s.y) });
    b.createFixture(pl.Box(s.len / 2, 0.25), { friction: 0.8 }); b.setAngularVelocity(s.w);
    const grp = new THREE.Group(); grp.position.set(s.x, s.y, 0); levelGroup.add(grp);
    const arm = addMesh(new THREE.BoxGeometry(s.len, 0.5, 1.4), M.hazard, grp);
    const hub = addMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.8, 20).rotateX(Math.PI / 2), M.steel, levelGroup); hub.position.set(s.x, s.y, 0);
    const pole = addMesh(new THREE.CylinderGeometry(0.28, 0.4, s.y + 46, 12), M.steel, levelGroup); pole.position.set(s.x, (s.y - 46) / 2, -1.2);
    return { b, grp, arm };
  });

  const g0 = level.grounds[0];
  const sx = g0[0][0] + 6;
  spawnCar(sx, heightAt(g0, sx) + 0.12);

  strokes = []; curStroke = null; inkUsed = 0;
  for (const s of keep) { const ns = newStroke(s.type); ns.pts = s.pts; inkUsed += strokeLen(ns.pts) * (s.type === 'turbo' ? 2 : 1); refreshStroke(ns); }

  applyEnv();
  timer = 0; nitro = 100; stunts = 0; coinsGot = 0; airTime = 0; airSpin = 0; lastAngle = 0; crashT = 0; stuckT = 0; endT = 0;
  setState('plan');
  frameLevel(true);
  $('lvlNum').textContent = `LEVEL ${idx + 1}`;
  $('lvlName').textContent = level.name;
  $('timeTxt').textContent = '0.00s';
  updateHUD();
  hint(keep.length ? 'Fix your road, then press GO' : 'Draw a road to the finish flag, then press GO', 6);
}

/* ------------------------------------------------------------------ prayer flags */
let flagMesh = null, flagList = [];
const flagGeo = new THREE.PlaneGeometry(0.42, 0.55).translate(0, -0.3, 0);
const FLAG_COLS = [0x2a62c9, 0xf5f5f0, 0xd42a2a, 0x2c9a4a, 0xf2c230].map((h) => new THREE.Color(h));
function buildPrayerFlags() {
  const strings = [], H = 6.5, z = -2.3;
  for (let i = 0; i < level.grounds.length - 1; i++) {
    const a = level.grounds[i], b = level.grounds[i + 1];
    strings.push([[a[a.length - 1][0] - 0.6, a[a.length - 1][1]], [b[0][0] + 0.6, b[0][1]]]);
  }
  const g0 = level.grounds[0];
  strings.push([[g0[0][0] + 2, heightAt(g0, g0[0][0] + 2)], [g0[0][0] + 11, heightAt(g0, g0[0][0] + 11)]]);
  flagList = [];
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.09, H + 0.4, 6);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x3a3226 });
  for (const [A, B] of strings) {
    for (const P of [A, B]) { const pole = addMesh(poleGeo, M.bamboo); pole.position.set(P[0], P[1] + H / 2, z); }
    const ax = A[0], ay = A[1] + H, bx = B[0], by = B[1] + H, len = Math.hypot(bx - ax, by - ay), sag = len * 0.1;
    const pts = [];
    for (let k = 0; k <= 40; k++) { const t = k / 40; pts.push(new THREE.Vector3(lerp(ax, bx, t), lerp(ay, by, t) - sag * 4 * t * (1 - t), z)); }
    levelGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    const n = Math.floor(len / 0.62);
    for (let k = 1; k < n; k++) { const t = k / n; flagList.push({ x: lerp(ax, bx, t), y: lerp(ay, by, t) - sag * 4 * t * (1 - t), z, ph: k * 0.7 + rand(0, 0.5), c: FLAG_COLS[k % 5] }); }
  }
  flagMesh = new THREE.InstancedMesh(flagGeo, M.flag, flagList.length);
  flagList.forEach((f, i) => flagMesh.setColorAt(i, f.c));
  flagMesh.castShadow = true;
  levelGroup.add(flagMesh);
}

/* ------------------------------------------------------------------ strokes */
const strokeLen = (pts) => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; };
function newStroke(type) {
  const s = { type, pts: [], body: world.createBody(), fixture: null, meshes: [] };
  strokes.push(s); return s;
}
function refreshStroke(s) {
  if (s.fixture) { s.body.destroyFixture(s.fixture); s.fixture = null; }
  for (const m of s.meshes) { levelGroup.remove(m); m.geometry.dispose(); }
  s.meshes = [];
  if (s.pts.length < 2) return;
  s.fixture = s.body.createFixture(pl.Chain(s.pts.map(([x, y]) => V2(x, y)), false), { friction: s.type === 'turbo' ? 0.8 : 0.95, userData: { turbo: s.type === 'turbo' } });
  const r = ribbonGeometry(s.pts, { thick: s.type === 'turbo' ? 0.22 : 0.3, uLen: s.type === 'turbo' ? 3.4 : 6 });
  s.meshes.push(addMesh(r.top, s.type === 'turbo' ? M.turbo : M.asphalt), addMesh(r.side, s.type === 'turbo' ? M.turboSide : M.concrete));
}
function removeStroke(s) {
  if (!s) return;
  for (const m of s.meshes) { levelGroup.remove(m); m.geometry.dispose(); }
  world.destroyBody(s.body);
  inkUsed = Math.max(0, inkUsed - strokeLen(s.pts) * (s.type === 'turbo' ? 2 : 1));
  strokes.splice(strokes.indexOf(s), 1);
}

const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
function screenToWorld(cx, cy) {
  ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const o = raycaster.ray.origin, d = raycaster.ray.direction, t = -o.z / d.z;
  return [o.x + d.x * t, o.y + d.y * t];
}
const nearCar = (x, y) => { const p = chassis.getPosition(); return Math.hypot(x - p.x, y - (p.y + 0.6)) < 2.9; };
const canDraw = () => state === 'plan' || state === 'drive';

let pointerId = null;
canvas.addEventListener('pointerdown', (e) => {
  Sound.init();
  if (!canDraw() || pointerId !== null) return;
  pointerId = e.pointerId; canvas.setPointerCapture(e.pointerId);
  const [x, y] = screenToWorld(e.clientX, e.clientY);
  if (nearCar(x, y)) { curStroke = null; return; }
  curStroke = newStroke(pen); curStroke.pts.push([x, y]);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== pointerId || !curStroke || !canDraw()) return;
  const [x, y] = screenToWorld(e.clientX, e.clientY);
  const last = curStroke.pts[curStroke.pts.length - 1];
  const d = Math.hypot(x - last[0], y - last[1]);
  if (d < 0.38) return;
  if (nearCar(x, y)) { endStroke(); return; }
  const cost = d * (pen === 'turbo' ? 2 : 1);
  if (inkUsed + cost > level.ink) { hint('Out of ink! Undo (Z) a stroke to get some back', 3); endStroke(); return; }
  // split long jumps so every segment stays smooth
  const steps = Math.ceil(d / 0.6);
  for (let k = 1; k <= steps; k++) curStroke.pts.push([lerp(last[0], x, k / steps), lerp(last[1], y, k / steps)]);
  inkUsed += cost;
  refreshStroke(curStroke);
  if (Math.random() < 0.5) Sound.draw();
  const c = new THREE.Color(pen === 'turbo' ? 0x5fe9ff : 0xfff3c4);
  glowFx.spawn(x, y + 0.1, 1.8, rand(-1, 1), rand(0, 1.5), rand(0, 1), 0.5, 0.25, 0.05, c, 0.9, 2);
  updateHUD();
});
function endStroke() {
  if (curStroke && curStroke.pts.length < 2) removeStroke(curStroke);
  curStroke = null;
}
const pointerEnd = (e) => { if (e.pointerId !== pointerId) return; pointerId = null; endStroke(); };
canvas.addEventListener('pointerup', pointerEnd);
canvas.addEventListener('pointercancel', pointerEnd);

/* ------------------------------------------------------------------ game flow */
function setState(s) {
  state = s;
  const inGame = ['plan', 'drive', 'won', 'failed'].includes(s);
  $('hud').classList.toggle('hidden', !inGame);
  $('title').classList.toggle('hidden', s !== 'title');
  $('levels').classList.toggle('hidden', s !== 'levels');
  $('garage').classList.toggle('hidden', s !== 'garage');
  $('goBtn').classList.toggle('hidden', s !== 'plan');
  $('driveCtl').classList.toggle('hidden', s !== 'drive');
  $('speedo').classList.toggle('hidden', s !== 'drive');
  if (s !== 'won') $('winModal').classList.add('hidden');
  if (s !== 'failed') $('failModal').classList.add('hidden');
  canvas.style.cursor = inGame ? 'crosshair' : 'default';
}
function go() {
  if (state !== 'plan') return;
  Sound.init(); Sound.tone(220, 0.4, 'sawtooth', 0.15, 300);
  setState('drive');
  track('level_start', { level: levelIdx + 1 });
  chassis.setAwake(true); wheelBodies.forEach((w) => w.setAwake(true));
  hint('Hold Shift for NITRO · A/D to lean in the air', 4);
}
function resetCar() {
  if (!['drive', 'won', 'failed', 'plan'].includes(state)) return;
  loadLevel(levelIdx, true);
}
function win() {
  setState('won'); endT = 0;
  track('level_complete', { level: levelIdx + 1, time: +timer.toFixed(2), ink: Math.round(inkUsed) });
  chassis.setLinearDamping(2.2); wheelBodies.forEach((w) => w.setAngularDamping(3));
  Sound.win();
  const inkStar = inkUsed <= level.par, coinStar = coinsGot === coins.length;
  const st = 1 + (inkStar ? 1 : 0) + (coinStar ? 1 : 0);
  save.stars[levelIdx] = Math.max(save.stars[levelIdx] || 0, st);
  if (!save.best[levelIdx] || timer < save.best[levelIdx]) save.best[levelIdx] = +timer.toFixed(2);
  persist();
  const p = chassis.getPosition();
  for (let i = 0; i < 160; i++) smoke.spawn(p.x + rand(-3, 6), p.y + rand(5, 9), rand(-2, 2), rand(-4, 4), rand(0, 5), rand(-2, 2), rand(2, 3.5), 0.22, 0.18, CONFETTI[i % CONFETTI.length], 1, 4, 1.4);
  setTimeout(() => {
    if (state !== 'won') return;
    $('winTitle').textContent = st === 3 ? 'Perfect run!' : st === 2 ? 'Smooth drive!' : 'Level clear!';
    $('sTime').textContent = timer.toFixed(2) + 's';
    $('sInk').textContent = `${inkUsed.toFixed(0)} / ${level.par}m`;
    $('sCoins').textContent = `${coinsGot}/${coins.length}`;
    $('sStunts').textContent = stunts;
    const spans = $('winStars').children;
    [...spans].forEach((sp, i) => { sp.className = ''; setTimeout(() => { sp.className = (i < st ? 'on ' : '') + 'pop'; if (i < st) Sound.tone(880 + i * 220, 0.2, 'triangle', 0.15); }, 200 + i * 260); });
    $('wNext').classList.toggle('hidden', levelIdx >= LEVELS.length - 1);
    $('winModal').classList.remove('hidden');
  }, 1500);
}
function fail(title, sub) {
  if (state !== 'drive') return;
  setState('failed');
  track('game_over', { level: levelIdx + 1, reason: title });
  Sound.crash(); shake = 0.8;
  const p = chassis.getPosition();
  for (let i = 0; i < 40; i++) glowFx.spawn(p.x, p.y + 0.5, rand(-1, 1), rand(-8, 8), rand(2, 10), rand(-3, 3), rand(0.4, 0.9), 0.18, 0.04, COL.spark, 1, 14, 1);
  setTimeout(() => {
    if (state !== 'failed') return;
    $('failTitle').textContent = title; $('failSub').textContent = sub;
    $('failModal').classList.remove('hidden');
  }, 1100);
}

let hintTimer = 0;
function hint(t, secs = 4) { const h = $('hint'); h.textContent = t; h.style.opacity = 1; hintTimer = secs; }
function toast(t, color = '#fff') {
  const el = $('toast'); el.textContent = t; el.style.color = color;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function updateHUD() {
  if (!level) return;
  const left = clamp(1 - inkUsed / level.ink, 0, 1);
  $('inkBar').firstElementChild.style.width = (left * 100) + '%';
  $('inkBar').lastElementChild.style.left = ((1 - level.par / level.ink) * 100) + '%';
  $('coinsTxt').textContent = `◉ ${coinsGot}/${coins.length}`;
}

/* ------------------------------------------------------------------ physics + rules */
const contactsOf = (body) => {
  const out = [];
  for (let ce = body.getContactList(); ce; ce = ce.next) {
    if (!ce.contact.isTouching()) continue;
    const fa = ce.contact.getFixtureA(), fb = ce.contact.getFixtureB();
    out.push(fa.getBody() === body ? fb : fa);
  }
  return out;
};

function fixedStep(dt) {
  let grounded = false, onTurbo = false;
  for (const w of wheelBodies) for (const f of contactsOf(w)) { grounded = true; const u = f.getUserData(); if (u && u.turbo) onTurbo = true; }
  const chassisHit = contactsOf(chassis).length > 0;
  const a = chassis.getAngle(), fwd = V2(Math.cos(a), Math.sin(a));
  const vel = chassis.getLinearVelocity();
  const speed = vel.x * fwd.x + vel.y * fwd.y;
  const driving = state === 'drive';
  const boosting = driving && keys.nitro && nitro > 0;

  if (driving) {
    timer += dt;
    const brake = keys.brake;
    joints.forEach((j) => { j.setMotorSpeed(brake ? 0 : boosting ? -40 : -25); j.setMaxMotorTorque(brake ? 70 : boosting ? 46 : 30); });
    if (boosting) { if (speed < 17) chassis.applyForceToCenter(V2(fwd.x * 55, fwd.y * 55), true); nitro = Math.max(0, nitro - 32 * dt); }
    else nitro = Math.min(100, nitro + 7 * dt);
    const tilt = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    if (tilt) chassis.applyTorque(tilt * (grounded ? 14 : 34), true);
  } else if (state === 'won') {
    joints.forEach((j) => { j.setMotorSpeed(0); j.setMaxMotorTorque(45); });
  } else {
    joints.forEach((j) => { j.setMotorSpeed(0); j.setMaxMotorTorque(80); });
  }
  turboCool -= dt;
  if (onTurbo && (driving || state === 'won')) {
    if (speed < 18) chassis.applyForceToCenter(V2(fwd.x * 125, fwd.y * 125), true);
    if (turboCool <= 0) { Sound.turbo(); turboCool = 0.6; toast('TURBO!', '#5fe9ff'); }
    const p = chassis.getPosition();
    for (let i = 0; i < 3; i++) glowFx.spawn(p.x - fwd.x * 2, p.y, rand(-1.5, 1.5), -fwd.x * rand(3, 8), rand(0, 3), rand(-1, 1), 0.4, 0.3, 0.05, COL.cyan, 1, 0, 2);
  }

  world.step(dt, 8, 3);

  // spinners + crates are synced in render
  if (!driving) { wasGrounded = grounded; lastAngle = chassis.getAngle(); return; }

  // stunts
  const ang = chassis.getAngle();
  if (!grounded && !chassisHit) { airTime += dt; airSpin += ang - lastAngle; }
  else {
    if (!wasGrounded && airTime > 0.3) {
      Sound.land(Math.abs(vel.y));
      const flips = Math.floor((Math.abs(airSpin) + 0.9) / (Math.PI * 2));
      if (flips >= 1 && Math.cos(ang) > 0.3) { stunts += flips; toast((flips > 1 ? flips + 'x ' : '') + (airSpin > 0 ? 'BACKFLIP!' : 'FRONTFLIP!'), '#ffc83d'); nitro = Math.min(100, nitro + 40); }
      else if (airTime > 1.3) { stunts++; toast('BIG AIR!', '#3cf08a'); nitro = Math.min(100, nitro + 20); }
      const p = chassis.getPosition();
      for (let i = 0; i < 14; i++) smoke.spawn(p.x + rand(-2, 2), p.y, rand(-1.5, 1.5), rand(-3, 3), rand(0.5, 2), rand(-1, 1), rand(0.6, 1.2), 0.6, 2, COL.dust, 0.5, -0.3, 2);
    }
    airTime = 0; airSpin = 0;
  }
  wasGrounded = grounded || chassisHit; lastAngle = ang;

  // coins
  const p = chassis.getPosition();
  const cx = p.x + Math.cos(ang) * 0 - Math.sin(ang) * 0.6, cy = p.y + Math.sin(ang) * 0 + Math.cos(ang) * 0.6;
  for (const c of coins) {
    if (c.got) continue;
    if (Math.hypot(c.x - cx, c.y - cy) < 2.0) {
      c.got = true; c.mesh.visible = false; coinsGot++; Sound.coin(); updateHUD();
      for (let i = 0; i < 26; i++) glowFx.spawn(c.x, c.y, 0, rand(-5, 5), rand(-3, 7), rand(-3, 3), rand(0.4, 0.8), 0.32, 0.05, COL.gold, 1, 6, 1.5);
    }
  }
  // win / fail
  if (p.x > level.finish && p.x < finishEnd && p.y < finishY + 3.5) { win(); return; }
  if (p.y < failY) { fail('Into the canyon!', 'Your roads are saved. Fix them and try again.'); return; }
  if (Math.cos(ang) < -0.25 && (chassisHit || grounded)) { crashT += dt; if (crashT > 1.1) { fail('Wrecked!', 'Landed on the roof. Try a smoother road or lean with A / D.'); return; } } else crashT = 0;
  if (Math.abs(speed) < 0.4 && !keys.brake) { stuckT += dt; if (stuckT > 3) { hint('Stuck? Draw a better road, or press R to reset the car', 4); stuckT = -4; } } else stuckT = Math.min(stuckT, 0) + 0;

  // tyre dust + nitro flames as particles
  for (let i = 0; i < wheelBodies.length; i++) {
    if (!contactsOf(wheelBodies[i]).length || Math.abs(speed) < 2) continue;
    const w = wheelBodies[i].getPosition();
    if (Math.random() < 0.5) smoke.spawn(w.x - fwd.x * 0.3, w.y - 0.3, rand(-1, 1.2), -fwd.x * rand(0.5, 2), rand(0.3, 1.2), rand(-0.5, 0.5), rand(0.5, 1.1), 0.35, 1.6, theme.night ? COL.dark : COL.dust, 0.35, -0.4, 1.5);
  }
  if (boosting) {
    for (const z of [-0.32, 0.32]) {
      const ex = p.x + Math.cos(ang) * -2.5 - Math.sin(ang) * 0.33, ey = p.y + Math.sin(ang) * -2.5 + Math.cos(ang) * 0.33;
      glowFx.spawn(ex, ey, z, -fwd.x * rand(6, 10) + vel.x * 0.5, -fwd.y * rand(6, 10) + vel.y * 0.5, rand(-0.4, 0.4), rand(0.12, 0.25), 0.4, 0.1, Math.random() < 0.5 ? COL.flame : COL.fire, 1, 0, 0);
    }
  }
}

/* ------------------------------------------------------------------ camera */
const camPos = new THREE.Vector3(0, 6, 40), camLook = new THREE.Vector3();
let planFrame = { x: 0, y: 0, d: 40 };
function frameLevel(snap) {
  const xs = level.grounds.flat().map((p) => p[0]).concat(level.coins.map((c) => c[0]));
  const ys = level.grounds.flat().map((p) => p[1]).concat(level.coins.map((c) => c[1]));
  const x0 = Math.min(...xs) + 6, x1 = Math.max(...xs) - 4, y0 = Math.min(...ys) - 3, y1 = Math.max(...ys) + 7;
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const dW = ((x1 - x0) / 2 + 3) / (tanH * camera.aspect), dH = ((y1 - y0) / 2 + 2) / tanH;
  planFrame = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, d: Math.max(dW, dH, 22) };
  if (snap) { camPos.set(planFrame.x + planFrame.d * 0.1, planFrame.y + planFrame.d * 0.07, planFrame.d); camLook.set(planFrame.x, planFrame.y, 0); }
}
let orbitT = 0;
function updateCamera(dt) {
  const p = chassis ? chassis.getPosition() : V2(0, 0);
  let tp, tl, k = 1 - Math.exp(-dt * 2.5);
  if (state === 'title' || state === 'levels' || state === 'garage') {
    orbitT += dt * (state === 'garage' ? 0.3 : 0.12);
    const r = state === 'garage' ? 7.2 : 9.5;
    const oa = Math.sin(orbitT) * 1.05 + 0.35;
    tp = new THREE.Vector3(p.x + Math.sin(oa) * r, p.y + (state === 'garage' ? 1.6 : 2.4), Math.cos(oa) * r);
    tl = new THREE.Vector3(p.x, p.y + (state === 'garage' ? 0.5 : 1.6), 0);
    k = 1 - Math.exp(-dt * 3);
  } else if (state === 'plan') {
    tp = new THREE.Vector3(planFrame.x + planFrame.d * 0.1, planFrame.y + planFrame.d * 0.07, planFrame.d);
    tl = new THREE.Vector3(planFrame.x, planFrame.y, 0);
  } else {
    const v = chassis.getLinearVelocity();
    // keep about 26 m of road visible across the screen, even on a tall phone
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = Math.max(clamp(26 + Math.hypot(v.x, v.y) * 0.45, 26, 36), 13 / (tanH * camera.aspect));
    tl = new THREE.Vector3(p.x + 5 + clamp(v.x * 0.35, -4, 6), p.y + 1.4 + clamp(v.y * 0.15, -3, 3), 0);
    tp = new THREE.Vector3(tl.x + 3, tl.y + 3, d);
    k = 1 - Math.exp(-dt * 3.2);
  }
  camPos.lerp(tp, k); camLook.lerp(tl, k);
  camera.position.copy(camPos);
  if (shake > 0) { camera.position.x += rand(-1, 1) * shake; camera.position.y += rand(-1, 1) * shake; shake = Math.max(0, shake - dt * 1.6); }
  camera.lookAt(camLook);
  sky.position.copy(camera.position);
  backdrop.position.set(camera.position.x, camera.position.y + backdropY, camera.position.z - BACKDROP_D);
  for (const r of ridges) r.position.y = camera.position.y - 5;
  sun.target.position.set(camLook.x, camLook.y, 0);
  sun.position.copy(sun.target.position).addScaledVector(sunDir, 80);
}

/* ------------------------------------------------------------------ render sync */
function syncVisuals(dt, now) {
  if (chassis) {
    const p = chassis.getPosition(), a = chassis.getAngle();
    car.group.position.set(p.x, p.y, 0); car.group.rotation.z = a;
    car.wheels.forEach((w) => {
      const b = wheelBodies[w.axle], wp = b.getPosition();
      w.hub.position.x = wp.x; w.hub.position.y = wp.y; w.hub.rotation.z = a;
      w.spin.rotation.z = b.getAngle() - a;
    });
    const boosting = state === 'drive' && keys.nitro && nitro > 0;
    car.flames.forEach((f) => { f.visible = boosting; if (boosting) { f.scale.set(1 + Math.random() * 0.4, 0.8 + Math.random() * 0.7, 1 + Math.random() * 0.4); f.position.x = -2.72 - (f.scale.y - 1) * 0.3; } });
    car.tailMat.emissiveIntensity = (keys.brake && state === 'drive') ? 6 : (theme.night ? 3 : 1.2);
    const v = chassis.getLinearVelocity();
    Sound.engine(state === 'drive', Math.hypot(v.x, v.y), boosting);
    if (state === 'drive') {
      $('spdTxt').textContent = Math.round(Math.hypot(v.x, v.y) * 3.6 * 3.2);
      $('nitroBar').firstElementChild.style.width = nitro + '%';
      $('timeTxt').textContent = timer.toFixed(2) + 's';
    }
  }
  for (const c of crates) { const p = c.b.getPosition(); c.m.position.set(p.x, p.y, 0); c.m.rotation.z = c.b.getAngle(); }
  for (const s of spinners) s.grp.rotation.z = s.b.getAngle();
  for (const c of coins) if (!c.got) { c.mesh.rotation.y = now * 0.0025 + c.x; c.mesh.position.y = c.y + Math.sin(now * 0.003 + c.x) * 0.15; }
  for (const cl of clouds) { cl.position.x += cl.userData.v * dt; if (cl.position.x > 950) cl.position.x = -950; }
  // toy train: chug along, puff smoke, whistle now and then
  train.g.position.x += dt * 6; if (train.g.position.x > camera.position.x + 260) train.g.position.x = camera.position.x - 260;
  if (Math.random() < 0.35) smoke.spawn(train.g.position.x + 3.25, TRAIN_Y + 3.6, TRAIN_Z, rand(-0.4, 0.2), rand(1.2, 2.2), rand(-0.2, 0.2), 3.5, 1.4, 6, COL.trainSmoke, 0.45, -0.15, 0.3);
  train.whistleT -= dt;
  if (train.whistleT < 0) { train.whistleT = rand(14, 26); if (Math.abs(train.g.position.x - camera.position.x) < 170 && ['plan', 'drive', 'title'].includes(state)) Sound.whistle(); }
  // prayer flags flutter in the wind
  if (flagMesh) {
    const e = new THREE.Euler();
    flagList.forEach((f, i) => { _q.setFromEuler(e.set(Math.sin(now * 0.005 + f.ph) * 0.55, Math.sin(now * 0.003 + f.ph) * 0.25, Math.sin(now * 0.004 + f.ph) * 0.08)); _m4.compose(_p.set(f.x, f.y, f.z), _q, _s.set(1, 1, 1)); flagMesh.setMatrixAt(i, _m4); });
    flagMesh.instanceMatrix.needsUpdate = true;
  }
  M.turbo.map.offset.x -= dt * 1.4;
  if (hintTimer > 0) { hintTimer -= dt; if (hintTimer <= 0) $('hint').style.opacity = 0; }
}

/* ------------------------------------------------------------------ loop */
let last = performance.now(), acc = 0, paused = false;
let perfFrames = 0, perfTime = 0, lowGfx = false;
function checkPerf(dt) {
  if (lowGfx || perfTime > 6) return;
  perfFrames++; perfTime += dt;
  if (perfTime > 4 && perfFrames / perfTime < 28) {
    lowGfx = true; renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.needsUpdate = true; }); });
  }
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  checkPerf(dt);
  if (world && !paused) {
    acc += dt;
    let n = 0;
    while (acc >= 1 / 60 && n < 4) { fixedStep(1 / 60); acc -= 1 / 60; n++; }
    if (n === 4) acc = 0;
  }
  syncVisuals(dt, now);
  updateCamera(dt);
  smoke.update(dt); glowFx.update(dt);
  const sc = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  smoke.mat.uniforms.uScale.value = glowFx.mat.uniforms.uScale.value = sc;
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  if (level) frameLevel(false);
});

/* ------------------------------------------------------------------ input */
const KEYMAP = { ShiftLeft: 'nitro', ShiftRight: 'nitro', KeyN: 'nitro', KeyS: 'brake', ArrowDown: 'brake', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
addEventListener('keydown', (e) => {
  Sound.init();
  if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; e.preventDefault(); }
  if (e.repeat) return;
  const inGame = ['plan', 'drive', 'won', 'failed'].includes(state);
  if ((e.code === 'Space' || e.code === 'Enter') && state === 'plan') { e.preventDefault(); go(); }
  else if (e.code === 'Enter' && state === 'won' && levelIdx < LEVELS.length - 1) loadLevel(levelIdx + 1);
  else if (e.code === 'KeyR' && inGame) resetCar();
  else if (e.code === 'KeyZ' && inGame && (state === 'plan' || state === 'drive')) undo();
  else if (e.code === 'KeyC' && inGame && (state === 'plan' || state === 'drive')) clearAll();
  else if (e.code === 'Digit1') setPen('road');
  else if (e.code === 'Digit2') setPen('turbo');
  else if (e.code === 'KeyM') toggleMute();
  else if (e.code === 'Escape') { if (inGame) openLevels(); else if (state !== 'title') setState('title'); }
});
addEventListener('keyup', (e) => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function holdBtn(id, key) {
  const el = $(id);
  const on = (e) => { e.preventDefault(); Sound.init(); keys[key] = true; el.classList.add('held'); };
  const off = () => { keys[key] = false; el.classList.remove('held'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointerleave', off); el.addEventListener('pointercancel', off);
}
holdBtn('nitroBtn', 'nitro'); holdBtn('brakeBtn', 'brake'); holdBtn('tiltL', 'left'); holdBtn('tiltR', 'right');

function undo() { const s = strokes[strokes.length - 1]; if (s) { removeStroke(s); Sound.click(); updateHUD(); } }
function clearAll() { while (strokes.length) removeStroke(strokes[0]); inkUsed = 0; Sound.click(); updateHUD(); }
function setPen(p) { pen = p; document.querySelectorAll('[data-pen]').forEach((b) => b.classList.toggle('on', b.dataset.pen === p)); Sound.click(); }
function toggleMute() { Sound.init(); Sound.setMuted(!save.muted); $('muteBtn').textContent = save.muted ? '🔇' : '🔊'; }
$('muteBtn').textContent = save.muted ? '🔇' : '🔊';

document.querySelectorAll('[data-pen]').forEach((b) => b.addEventListener('click', () => setPen(b.dataset.pen)));
$('undoBtn').onclick = undo; $('clearBtn').onclick = clearAll; $('resetBtn').onclick = resetCar;
$('goBtn').onclick = go; $('muteBtn').onclick = toggleMute; $('menuBtn').onclick = () => openLevels();
$('helpBtn').onclick = () => $('helpModal').classList.remove('hidden');
$('helpClose').onclick = () => $('helpModal').classList.add('hidden');
$('wRetry').onclick = () => loadLevel(levelIdx, true);
$('wNext').onclick = () => loadLevel(levelIdx + 1);
$('wMenu').onclick = openLevels;
$('fRetry').onclick = () => loadLevel(levelIdx, true);
$('fClear').onclick = () => loadLevel(levelIdx, false);
$('fMenu').onclick = openLevels;

/* ------------------------------------------------------------------ menus */
const unlocked = (i) => i === 0 || (save.stars[i - 1] || 0) > 0;
function openLevels() {
  Sound.init();
  if (!level || !['plan', 'drive', 'won', 'failed', 'title', 'garage', 'levels'].includes(state)) loadLevel(0);
  setState('levels');
  const grid = $('lvlGrid'); grid.innerHTML = '';
  let total = 0;
  LEVELS.forEach((L, i) => {
    const st = save.stars[i] || 0; total += st;
    const b = document.createElement('button'); b.className = 'lv'; b.disabled = !unlocked(i);
    b.innerHTML = `<div class="num">${unlocked(i) ? i + 1 : '🔒'}</div><div class="nm">${L.name}</div><div class="th">${THEMES[L.theme].label}${save.best[i] ? ' · ' + save.best[i] + 's' : ''}</div>
      <div class="stars">${[0, 1, 2].map((k) => `<span class="${k < st ? 'on' : ''}">★</span>`).join('')}</div>`;
    b.onclick = () => { Sound.click(); loadLevel(i); };
    grid.appendChild(b);
  });
  $('starTotal').textContent = `★ ${total} / ${LEVELS.length * 3}`;
}
function openGarage() {
  setState('garage');
  const pr = $('paintRow'), rr = $('rimRow'); pr.innerHTML = ''; rr.innerHTML = '';
  const label = () => { $('finishName').textContent = `${PAINTS[save.paint].name} · ${RIMS[save.rim].name} wheels`; };
  PAINTS.forEach((p, i) => {
    const b = document.createElement('button'); b.className = 'swb' + (i === save.paint ? ' on' : ''); b.style.background = '#' + p.hex.toString(16).padStart(6, '0'); b.title = p.name;
    b.onclick = () => { save.paint = i; persist(); car.setPaint(i); [...pr.children].forEach((c, k) => c.classList.toggle('on', k === i)); label(); Sound.click(); };
    pr.appendChild(b);
  });
  RIMS.forEach((r, i) => {
    const b = document.createElement('button'); b.className = 'swb' + (i === save.rim ? ' on' : ''); b.style.background = '#' + r.hex.toString(16).padStart(6, '0'); b.title = r.name;
    b.onclick = () => { save.rim = i; persist(); car.setRim(i); [...rr.children].forEach((c, k) => c.classList.toggle('on', k === i)); label(); Sound.click(); };
    rr.appendChild(b);
  });
  label();
}
$('playBtn').onclick = () => { Sound.init(); Sound.click(); let i = 0; while (i < LEVELS.length - 1 && unlocked(i + 1) && save.stars[i]) i++; loadLevel(i); if (!save.seenHelp) { save.seenHelp = 1; persist(); $('helpModal').classList.remove('hidden'); } };
$('levelsBtn').onclick = () => { Sound.click(); openLevels(); };
$('garageBtn').onclick = () => { Sound.click(); Sound.init(); openGarage(); };
document.querySelectorAll('[data-back]').forEach((b) => b.onclick = () => { Sound.click(); setState('title'); });

/* ------------------------------------------------------------------ boot */
loadLevel(0);
setState('title');
requestAnimationFrame(frame);
window.__iv = { backdropCache, get state() { return state; }, get chassis() { return chassis; }, loadLevel, go, strokes: () => strokes, newStroke, refreshStroke, get inkUsed() { return inkUsed; }, set inkUsed(v) { inkUsed = v; }, keys, LEVELS };
