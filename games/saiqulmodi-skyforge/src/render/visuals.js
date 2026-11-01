import * as THREE from 'three';

// SkyForge visual pipeline (2026-10-31): physical sky + matching haze, sky reflections (PMREM),
// soft sun shadows that follow the aircraft, procedural surface detail (farmland, asphalt, concrete),
// animated sea normals, aircraft paint/panel detail, quality tiers (Low / Medium / High + bloom).
// Add-ons come from the official three.js examples of the same pinned version (0.160.0).
// No cloud layers on purpose: the user wants clear, unobstructed views.

export const gfx = { aniso: 8 }; // filled from the renderer; read by modules that make textures

// Sun azimuth matches the original light (2500, 3500, 1500)
const SUN_AZ = Math.atan2(1500, 2500);

const TIMES = {
  noon:    { elev: 62,  sun: 0xfff4e6, sunI: 2.6, hemi: 0.35, exposure: 0.62, fog: 0xa9c4d8, sky: 0.4,  sat: 2.2 },
  morning: { elev: 26,  sun: 0xffe2bf, sunI: 2.2, hemi: 0.32, exposure: 0.68, fog: 0xb9c9d6, sky: 0.42, sat: 2.0 },
  golden:  { elev: 7,   sun: 0xffb070, sunI: 2.0, hemi: 0.34, exposure: 0.95, fog: 0xd8b99a, sky: 0.5,  sat: 1.5 },
  dusk:    { elev: 0.8, sun: 0xff7a40, sunI: 0.6, hemi: 0.22, exposure: 1.1, fog: 0x6f6a78, sky: 0.7,  sat: 1.3 }
};

// Existing weather presets (the user's own); none of them adds clouds
const WEATHER = {
  clear:     { fogDensity: 0.00003, sunK: 1.0,  turbidity: 2.0,  rayleigh: 2.0, mie: 0.003, overcast: 0.0,  fogTint: null },
  crosswind: { fogDensity: 0.0001,  sunK: 0.8,  turbidity: 5.0,  rayleigh: 1.4, mie: 0.006, overcast: 0.15, fogTint: 0x9aa9b6 },
  monsoon:   { fogDensity: 0.00035, sunK: 0.35, turbidity: 10.0, rayleigh: 0.5, mie: 0.01,  overcast: 0.75, fogTint: 0x5f6b77 },
  cat3:      { fogDensity: 0.003,   sunK: 0.18, turbidity: 12.0, rayleigh: 0.3, mie: 0.01,  overcast: 0.96, fogTint: 0x98a2ad }
};

const QUALITY = {
  low:    { ratio: 1.0, shadows: false, shadowSize: 1024, bloom: false },
  medium: { ratio: 1.5, shadows: true,  shadowSize: 2048, bloom: false },
  high:   { ratio: 2.0, shadows: true,  shadowSize: 4096, bloom: true }
};

// ---------- GLSL helpers ----------
const NOISE_GLSL = /* glsl */`
float sfHash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float sfNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(sfHash(i), sfHash(i + vec2(1.0, 0.0)), u.x), mix(sfHash(i + vec2(0.0, 1.0)), sfHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float sfFbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 4; k++) { v += a * sfNoise(p); p = p * 2.03 + 7.1; a *= 0.5; }
  return v / 0.9375;
}
`;

const DETAIL = {
  // Real terrain colours + broad tone change, farmland patchwork on plains/plateau, tree clumps, ground grain.
  // Each layer fades out once it would be smaller than a few pixels (no shimmer from altitude).
  terrain: /* glsl */`
  {
    vec2 wp = vSfWorld.xz;
    float px = length(fwidth(wp));
    float amsl = vSfWorld.y + 915.0;
    float land = smoothstep(1.0, 6.0, amsl);
    vec3 c = diffuseColor.rgb;
    c *= 0.86 + 0.28 * sfFbm(wp / 4200.0);
    vec2 q = mat2(0.951, 0.309, -0.309, 0.951) * wp;
    vec2 cellUv = q / vec2(240.0, 170.0) + vec2(sfNoise(wp / 1500.0), sfNoise(wp / 1500.0 + 9.0)) * 1.5;
    float h = sfHash(floor(cellUv));
    vec3 tint = h < 0.22 ? vec3(1.18, 1.06, 0.74) : h < 0.45 ? vec3(0.80, 1.08, 0.70) : h < 0.62 ? vec3(1.08, 0.90, 0.74) : h < 0.80 ? vec3(0.92, 1.0, 0.86) : vec3(1.0);
    float farm = smoothstep(0.42, 0.62, sfNoise(wp / 7000.0 + 3.0)) * land * (1.0 - smoothstep(1050.0, 1350.0, amsl));
    float cellF = 1.0 - smoothstep(40.0, 120.0, px);
    c *= mix(vec3(1.0), tint, farm * cellF * 0.8);
    vec2 fe = abs(fract(cellUv) - 0.5);
    float border = smoothstep(0.47, 0.5, max(fe.x, fe.y));
    c *= 1.0 - border * farm * 0.2 * (1.0 - smoothstep(3.0, 12.0, px));
    float midF = 1.0 - smoothstep(25.0, 90.0, px);
    float trees = smoothstep(0.62, 0.8, sfFbm(wp / 60.0 + 41.0)) * land * midF;
    c = mix(c, c * vec3(0.55, 0.72, 0.5), trees * 0.7);
    c *= 0.9 + 0.2 * mix(0.5, sfFbm(wp / 380.0 + 17.0), midF);
    float fineF = 1.0 - smoothstep(1.5, 6.0, px);
    c *= 0.92 + 0.16 * mix(0.5, sfNoise(wp / 9.0), fineF);
    diffuseColor.rgb = c;
  }`,
  // Runway asphalt (PlaneGeometry: x across, y along): grain, patch repairs, rubber in the touchdown zones
  runway: /* glsl */`
  {
    vec2 p = vSfLocal;
    float px = length(fwidth(p));
    float gF = 1.0 - smoothstep(0.15, 0.6, px);
    float bl = sfFbm(p / 9.0);
    float shade = 0.84 + 0.22 * bl + 0.18 * (sfNoise(p / 70.0) - 0.5) + 0.3 * (sfNoise(p * 3.0) - 0.5) * gF;
    float dEnd = vSfHalf - abs(p.y);
    float zone = 0.2 + 0.8 * smoothstep(80.0, 250.0, dEnd) * (1.0 - smoothstep(700.0, 1150.0, dEnd));
    float lane = exp(-pow((abs(p.x) - 3.2) / 2.4, 2.0)) * 0.8 + exp(-pow(p.x / 6.0, 2.0)) * 0.35;
    float streak = sfNoise(vec2(p.x * 0.8, p.y / 22.0)) * (0.4 + sfNoise(vec2(p.x * 0.3 + 5.0, p.y / 240.0)));
    float rubber = clamp(lane * zone * (0.3 + streak), 0.0, 1.0);
    shade *= 1.0 - 0.55 * rubber;
    diffuseColor.rgb *= shade;
    sfRough = 1.0 - 0.25 * rubber + 0.08 * (bl - 0.5);
  }`,
  taxi: /* glsl */`
  {
    vec2 p = vSfLocal;
    float px = length(fwidth(p));
    float gF = 1.0 - smoothstep(0.15, 0.6, px);
    float bl = sfFbm(p / 10.0);
    diffuseColor.rgb *= 0.86 + 0.2 * bl + 0.16 * (sfNoise(p / 55.0) - 0.5) + 0.28 * (sfNoise(p * 3.0) - 0.5) * gF;
    sfRough = 1.0 + 0.08 * (bl - 0.5);
  }`,
  // Apron concrete: 7.5 m slabs, joints, per-slab tone, oil stains
  apron: /* glsl */`
  {
    vec2 p = vSfLocal;
    float px = length(fwidth(p));
    float h = sfHash(floor(p / 7.5) + 3.1);
    vec2 f = abs(fract(p / 7.5) - 0.5) * 7.5;
    float joint = smoothstep(3.6, 3.72, max(f.x, f.y)) * (1.0 - smoothstep(0.05, 0.35, px));
    float stain = sfFbm(p / 14.0);
    diffuseColor.rgb *= (0.94 + 0.1 * h) * (0.86 + 0.24 * stain) * (1.0 - 0.35 * joint);
    sfRough = 0.95 + 0.1 * h;
  }`
};

// Adds procedural detail to a MeshStandardMaterial (kind = terrain | runway | taxi | apron)
export function addSurfaceDetail(mat, kind) {
  if (!DETAIL[kind]) return mat;
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSfWorld;\nvarying vec2 vSfLocal;\nvarying float vSfHalf;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSfLocal = position.xy;\nvSfHalf = abs(position.y);\nvSfWorld = (modelMatrix * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSfWorld;\nvarying vec2 vSfLocal;\nvarying float vSfHalf;\n' + NOISE_GLSL)
      .replace('#include <color_fragment>', '#include <color_fragment>\nfloat sfRough = 1.0;\n' + DETAIL[kind])
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor * sfRough, 0.04, 1.0);');
  };
  mat.customProgramCacheKey = () => 'sf-detail-' + kind;
  mat.needsUpdate = true;
  return mat;
}

// ---------- Procedural textures (no image downloads) ----------
function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

// Tileable sea normal map: sum of waves with whole-number frequencies over the tile
function seaNormalTexture() {
  const N = 256;
  const h = new Float32Array(N * N);
  const waves = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 18; i++) {
    const kx = Math.round((rnd() * 2 - 1) * (2 + i * 1.6));
    const ky = Math.round((rnd() * 2 - 1) * (2 + i * 1.6)) || 1;
    waves.push({ kx, ky, a: 1 / (1 + i * 0.55), ph: rnd() * Math.PI * 2 });
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let v = 0;
    for (const w of waves) v += w.a * Math.sin(2 * Math.PI * (w.kx * x + w.ky * y) / N + w.ph);
    h[y * N + x] = v;
  }
  const c = makeCanvas(N);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(N, N);
  const s = 0.9;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + ((x + 1) % N)] - h[y * N + ((x - 1 + N) % N)];
    const dy = h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x];
    let nx = -dx * s, ny = -dy * s, nz = 1;
    const l = Math.hypot(nx, ny, nz);
    nx /= l; ny /= l; nz /= l;
    const o = (y * N + x) * 4;
    img.data[o] = (nx * 0.5 + 0.5) * 255;
    img.data[o + 1] = (ny * 0.5 + 0.5) * 255;
    img.data[o + 2] = (nz * 0.5 + 0.5) * 255;
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = gfx.aniso;
  return t;
}

// Airframe panel lines + rivet rows (used as a faint colour map and as a bump map)
function panelTexture() {
  const N = 512;
  const c = makeCanvas(N);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, N, N);
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cols = [0], rows = [0];
  while (cols[cols.length - 1] < N) cols.push(cols[cols.length - 1] + 70 + rnd() * 70);
  while (rows[rows.length - 1] < N) rows.push(rows[rows.length - 1] + 90 + rnd() * 90);
  ctx.strokeStyle = 'rgb(150,150,150)';
  ctx.lineWidth = 2;
  for (const x of cols) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, N); ctx.stroke(); }
  for (let i = 0; i < rows.length; i++) {
    // staggered panel seams, like real skin panels
    for (let j = 0; j < cols.length - 1; j++) {
      const y = rows[i] + ((j % 2) ? 25 : 0);
      ctx.beginPath(); ctx.moveTo(cols[j], y); ctx.lineTo(cols[j + 1], y); ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgb(200,200,200)';
  for (const x of cols) for (let y = 4; y < N; y += 9) ctx.fillRect(x + 5, y, 2, 2);
  // faint weathering
  for (let i = 0; i < 2500; i++) {
    const g = 235 + Math.floor(rnd() * 20);
    ctx.fillStyle = `rgba(${g},${g},${g},0.25)`;
    ctx.fillRect(rnd() * N, rnd() * N, 2 + rnd() * 6, 2 + rnd() * 6);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = gfx.aniso;
  return t;
}

// Patch the official Sky shader: brightness gain + horizon/overcast blend into the haze colour,
// so the sky meets the fogged ground without a seam
function patchSky(material) {
  material.uniforms.uSkyGain = { value: 1.0 };
  material.uniforms.uHaze = { value: new THREE.Color(0xa9c4d8) };
  material.uniforms.uOvercast = { value: 0.0 };
  material.uniforms.uSat = { value: 1.0 };
  material.fragmentShader = material.fragmentShader
    .replace('uniform vec3 up;', 'uniform vec3 up;\nuniform float uSkyGain;\nuniform vec3 uHaze;\nuniform float uOvercast;\nuniform float uSat;')
    .replace('gl_FragColor = vec4( retColor, 1.0 );', [
      'retColor *= uSkyGain;',
      'float sfL = dot(retColor, vec3(0.2126, 0.7152, 0.0722));',
      'retColor = max(mix(vec3(sfL), retColor, uSat), 0.0);',
      'float sfHz = 1.0 - smoothstep(-0.015, 0.16, direction.y);',
      'retColor = mix(retColor, uHaze, max(sfHz * 0.85, uOvercast));',
      'gl_FragColor = vec4( retColor, 1.0 );'
    ].join('\n'));
  material.needsUpdate = true;
}

function detectQuality(renderer) {
  try {
    const stored = localStorage.getItem('skyforge.quality');
    if (stored && QUALITY[stored]) return { tier: stored, manual: true };
  } catch (e) { /* storage blocked */ }
  let gpu = '';
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
  } catch (e) { /* no info */ }
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const discrete = /NVIDIA|GeForce|RTX|GTX|Radeon RX|Radeon Pro|Arc A/i.test(gpu);
  // best picture first on every computer (user: best graphics); phones start light
  return { tier: mobile ? 'low' : 'high', manual: false, gpu, discrete, mobile };
}

export async function createVisuals({ renderer, scene, camera, sunLight, hemiLight }) {
  gfx.aniso = renderer.capabilities.getMaxAnisotropy();
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const st = { time: 'noon', weather: 'clear', quality: 'medium', manual: false, envDirty: true };
  const sunDir = new THREE.Vector3();

  // Sun shadow box that follows the aircraft (crisp aircraft shadow on the runway)
  scene.add(sunLight.target);
  sunLight.shadow.camera.layers.enable(2); // exterior airframe layer
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.05;
  const sc = sunLight.shadow.camera;
  sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90;
  sc.near = 200; sc.far = 3200;
  sc.updateProjectionMatrix();

  // ---- Sky (official three.js Sky, Preetham/Rayleigh scattering) ----
  let sky = null, skyEnvMesh = null;
  const envScene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;
  try {
    const { Sky } = await import('three/addons/objects/Sky.js');
    sky = new Sky();
    sky.scale.setScalar(80000);
    sky.frustumCulled = false;
    sky.renderOrder = -1;
    patchSky(sky.material);
    scene.add(sky);
    skyEnvMesh = new THREE.Mesh(sky.geometry, sky.material);
    skyEnvMesh.scale.setScalar(500);
    envScene.add(skyEnvMesh);
    scene.background = null;
  } catch (e) {
    console.warn('[visuals] Sky add-on unavailable, keeping the flat sky colour', e);
  }

  // ---- Bloom (High quality): official EffectComposer + UnrealBloomPass + OutputPass ----
  let composer = null, bloomPass = null;
  async function ensureComposer() {
    if (composer) return true;
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js')
      ]);
      const size = renderer.getSize(new THREE.Vector2());
      const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
      composer = new EffectComposer(renderer, rt);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.22, 0.45, 0.92);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(size.x, size.y);
      return true;
    } catch (e) {
      console.warn('[visuals] post-processing add-ons unavailable, bloom off', e);
      return false;
    }
  }
  window.addEventListener('resize', () => {
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(window.innerWidth, window.innerHeight);
    }
  });

  function rebuildEnv() {
    st.envDirty = false;
    if (envRT) envRT.dispose();
    if (sky) {
      envRT = pmrem.fromScene(envScene, 0.02, 0.1, 2000);
    } else {
      const s = new THREE.Scene();
      s.background = scene.fog.color.clone();
      envRT = pmrem.fromScene(s);
    }
    scene.environment = envRT.texture;
  }

  function applyLook() {
    const t = TIMES[st.time], w = WEATHER[st.weather];
    const el = THREE.MathUtils.degToRad(t.elev);
    sunDir.set(Math.cos(el) * Math.cos(SUN_AZ), Math.sin(el), Math.cos(el) * Math.sin(SUN_AZ)).normalize();

    const haze = new THREE.Color(t.fog);
    if (w.fogTint !== null) haze.lerp(new THREE.Color(w.fogTint), Math.min(1, w.overcast + 0.3)).multiplyScalar(st.time === 'dusk' ? 0.55 : 1);
    scene.fog.color.copy(haze);
    scene.fog.density = w.fogDensity;
    if (!sky) {
      if (!scene.background || !scene.background.isColor) scene.background = new THREE.Color();
      scene.background.copy(haze);
    }

    sunLight.color.setHex(t.sun);
    sunLight.intensity = t.sunI * w.sunK;
    hemiLight.intensity = t.hemi * (0.7 + 0.3 * w.sunK);
    hemiLight.color.setHex(st.time === 'dusk' ? 0x8a8fb0 : 0xdfeeff);
    hemiLight.groundColor.setHex(0x4a4f3e);
    renderer.toneMappingExposure = t.exposure * (1 + w.overcast * 0.35);

    if (sky) {
      const u = sky.material.uniforms;
      u.sunPosition.value.copy(sunDir).multiplyScalar(400000);
      u.turbidity.value = w.turbidity;
      u.rayleigh.value = w.rayleigh;
      u.mieCoefficient.value = w.mie;
      u.mieDirectionalG.value = 0.8;
      u.uSkyGain.value = t.sky * (1 - w.overcast * 0.35);
      // haze colour in the sky shader's (pre tone mapping) space
      u.uHaze.value.copy(haze);
      u.uOvercast.value = w.overcast;
      u.uSat.value = 1 + (t.sat - 1) * (1 - w.overcast);
    }
    st.envDirty = true;
  }

  async function setQuality(tier, manual = true) {
    if (!QUALITY[tier]) return;
    const q = QUALITY[tier];
    st.quality = tier;
    if (manual) {
      st.manual = true;
      try { localStorage.setItem('skyforge.quality', tier); } catch (e) { /* storage blocked */ }
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.ratio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const shadowChange = renderer.shadowMap.enabled !== q.shadows;
    renderer.shadowMap.enabled = q.shadows;
    sunLight.castShadow = q.shadows;
    if (sunLight.shadow.mapSize.x !== q.shadowSize) {
      sunLight.shadow.mapSize.set(q.shadowSize, q.shadowSize);
      if (sunLight.shadow.map) { sunLight.shadow.map.dispose(); sunLight.shadow.map = null; }
    }
    if (shadowChange) scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.needsUpdate = true; }); });
    st.bloom = q.bloom && await ensureComposer();
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(window.innerWidth, window.innerHeight);
    }
    document.querySelectorAll('[data-gfx]').forEach((b) => b.classList.toggle('active', b.dataset.gfx === tier));
  }

  // ---- Sea: glossy water with moving tileable wave normals and sky reflections ----
  let seaTex = null;
  function attachSea(seaMesh, tileM = 200) {
    seaTex = seaNormalTexture();
    const size = seaMesh.geometry.parameters.width;
    seaTex.repeat.set(size / tileM, size / tileM); // whole tiles: no jump when the sea plane recentres
    const old = seaMesh.material;
    seaMesh.material = new THREE.MeshStandardMaterial({
      color: 0x0e4560, roughness: 0.12, metalness: 0.0,
      normalMap: seaTex, normalScale: new THREE.Vector2(0.55, 0.55), envMapIntensity: 1.1
    });
    old.dispose();
  }

  // ---- Aircraft: paint vs metal, clear-coat canopies, panel lines, shadows ----
  const panelTex = panelTexture();
  function enhanceAircraft(root, cockpitGroup = null) {
    const inCockpit = new Set();
    if (cockpitGroup) cockpitGroup.traverse((o) => inCockpit.add(o));
    root.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      let seeThrough = false;
      for (const m of mats) {
        if (!m || !m.isMeshStandardMaterial) continue;
        if (m.isMeshPhysicalMaterial && m.transmission > 0) {
          // transmission renders the scene twice per frame; a clear-coated tinted canopy looks the same
          m.transmission = 0;
          m.transparent = true;
          m.opacity = Math.min(m.opacity, 0.4);
          m.metalness = Math.min(m.metalness, 0.5);
          m.roughness = 0.05;
          m.clearcoat = 1.0;
          m.clearcoatRoughness = 0.04;
          m.envMapIntensity = 1.4;
          m.needsUpdate = true;
        }
        if (m.transparent) { seeThrough = true; continue; }
        if (inCockpit.has(o) || m.userData.sfDone) continue;
        m.userData.sfDone = true;
        const glass = m.roughness <= 0.2;
        if (!glass && m.metalness < 0.7) m.metalness = Math.min(m.metalness, 0.3); // painted skin is not bare metal
        m.envMapIntensity = glass ? 1.3 : 0.9;
        if (!glass && !m.map && !m.flatShading) {
          m.map = panelTex;
          m.bumpMap = panelTex;
          m.bumpScale = 0.4;
        }
        m.needsUpdate = true;
      }
      if (!inCockpit.has(o)) {
        o.castShadow = !seeThrough;
        o.receiveShadow = !seeThrough;
      }
    });
  }

  // ---- FPS guard: drop one quality step if the frame rate stays low (only when not chosen by hand) ----
  const fpsWin = { t0: performance.now(), frames: 0, started: performance.now() };
  function fpsGuard(now) {
    fpsWin.frames++;
    if (now - fpsWin.t0 < 4000) return;
    const fps = fpsWin.frames * 1000 / (now - fpsWin.t0);
    fpsWin.t0 = now; fpsWin.frames = 0;
    if (st.manual || now - fpsWin.started < 8000 || document.hidden) return;
    const floor = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'low' : 'medium';   // computers keep shadows
    if (fps < 24 && st.quality !== 'low' && st.quality !== floor) {
      const next = st.quality === 'high' ? 'medium' : 'low';
      console.info(`[visuals] ${fps.toFixed(0)} FPS - graphics ${st.quality} -> ${next}`);
      setQuality(next, false);
    }
  }

  let lastT = performance.now();
  function update(pos) {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    if (st.envDirty) rebuildEnv();
    if (sky) sky.position.copy(camera.position);
    sunLight.target.position.copy(pos);
    sunLight.position.copy(pos).addScaledVector(sunDir, 1600);
    if (seaTex) { seaTex.offset.x += dt * 0.004; seaTex.offset.y += dt * 0.0025; }
    fpsGuard(now);
  }

  function render() {
    if (st.bloom && composer) composer.render();
    else renderer.render(scene, camera);
  }

  function setTime(name) {
    if (!TIMES[name]) return;
    st.time = name;
    applyLook();
    document.querySelectorAll('[data-tod]').forEach((b) => b.classList.toggle('active', b.dataset.tod === name));
  }
  function setWeather(name) {
    if (!WEATHER[name]) return;
    st.weather = name;
    applyLook();
  }

  applyLook();
  const q = detectQuality(renderer);
  st.manual = q.manual;
  await setQuality(q.tier, false);
  st.manual = q.manual;
  console.info(`[visuals] graphics ${q.tier}${q.manual ? ' (saved choice)' : ''}${q.gpu ? ' - ' + q.gpu : ''}`);

  return { update, render, setTime, setWeather, setQuality, attachSea, enhanceAircraft, state: st, sky };
}
