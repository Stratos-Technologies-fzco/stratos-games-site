// Builds the island scene: coloured terrain, water, merged static chunks, sun, fog and the storm wall.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { settings } from '../input';
import { modelGeometry, sharedMaterial } from './assets';
import { makeWindMaterial, swayWeights, windUniforms } from './wind';
import { CELL, GRID, HALF, MAP, RIVER, RIVER_WIDTH, coastDist, roadDist, type Placement, type WorldData, baseHeight } from '../core/world';

const C = (hex: number) => new THREE.Color(hex);
const SAND = C(0xe8c98b), LOW = C(0x3e9b5f), HILL = C(0x2f7d4a), ROCK = C(0x8a7f6a), ROAD = C(0xc9a66b), LATERITE = C(0xb5543a), SEABED = C(0x2f93b3);

const DRY = new THREE.Color(0x8aa84a);
const hash2 = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
/** Smooth value noise, 0..1. */
function vnoise(x: number, y: number) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return (hash2(ix, iy) * (1 - u) + hash2(ix + 1, iy) * u) * (1 - v) + (hash2(ix, iy + 1) * (1 - u) + hash2(ix + 1, iy + 1) * u) * v; }

/** A sunset sky dome (follows the camera, ignores fog), a sun disc, and one merged mesh of low-poly clouds at 250-340 m. */
function buildSky(): { sky: THREE.Group; mat: THREE.MeshBasicMaterial; clouds: THREE.Mesh } {
  const sky = new THREE.Group(); const R = 1000; const geo = new THREE.SphereGeometry(R, 28, 18); const pos = geo.getAttribute('position'); const col = new Float32Array(pos.count * 3);
  const stops: [number, number][] = [[0, 0xf6c58a], [0.1, 0xf1b58f], [0.28, 0xdc8fa0], [0.55, 0x9a78b8], [1, 0x413d86]]; const c0 = new THREE.Color(), c1 = new THREE.Color(), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = Math.max(0, pos.getY(i) / R); let k = 0; while (k < stops.length - 2 && y > stops[k + 1][0]) k++; const t = Math.min(1, Math.max(0, (y - stops[k][0]) / (stops[k + 1][0] - stops[k][0]))); c0.setHex(stops[k][1]); c1.setHex(stops[k + 1][1]); c.copy(c0).lerp(c1, t); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }); const dome = new THREE.Mesh(geo, mat); dome.renderOrder = -10; dome.frustumCulled = false; sky.add(dome);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(34, 24), new THREE.MeshBasicMaterial({ color: 0xffe3b0, fog: false, depthWrite: false })); sun.position.set(-120, 140, -80).normalize().multiplyScalar(R * 0.92); sun.lookAt(0, 0, 0); sun.renderOrder = -9; sky.add(sun);
  const parts: THREE.BufferGeometry[] = []; let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const top = new THREE.Color(0xfff1e6), bot = new THREE.Color(0xe3b0b8);
  for (let i = 0; i < 26; i++) { const ang = rnd() * Math.PI * 2, dist = 300 + rnd() * 600, cx = Math.cos(ang) * dist, cz = Math.sin(ang) * dist, cy = 250 + rnd() * 90, puffs = 4 + Math.floor(rnd() * 4);
    for (let p = 0; p < puffs; p++) { const g = new THREE.IcosahedronGeometry(1, 1); const s = 9 + rnd() * 9; g.scale(s * (1.2 + rnd() * 0.6), s * 0.38, s * (0.9 + rnd() * 0.5)); g.translate(cx + (p - puffs / 2) * s * 1.1 + (rnd() - 0.5) * 6, cy + (rnd() - 0.5) * 4, cz + (rnd() - 0.5) * s * 0.8);
      const gp = g.getAttribute('position'), gc = new Float32Array(gp.count * 3); for (let v = 0; v < gp.count; v++) { const k = Math.min(1, Math.max(0, (gp.getY(v) - (cy - 5)) / 10)); c.copy(bot).lerp(top, k); gc.set([c.r, c.g, c.b], v * 3); } g.setAttribute('color', new THREE.BufferAttribute(gc, 3)); parts.push(g); } }
  const clouds = new THREE.Mesh(mergeGeometries(parts, false)!, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.94, depthWrite: false })); clouds.frustumCulled = false; clouds.renderOrder = -5;
  return { sky, mat, clouds };
}

export function buildTerrainMesh(w: WorldData): THREE.Mesh {
  const g = new THREE.PlaneGeometry(MAP, MAP, GRID - 1, GRID - 1); g.rotateX(-Math.PI / 2);
  const pos = g.getAttribute('position'); const colors = new Float32Array(pos.count * 3); const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = w.terrain.height(x, z); pos.setY(i, h);
    const slope = w.terrain.slope(x, z), d = coastDist(x, z);
    if (d < 0) tmp.copy(SEABED).lerp(SAND, 0.3);
    else if (d < 12 || h < 1.2) tmp.copy(SAND);
    else tmp.copy(LOW).lerp(HILL, Math.min(1, h / 24));
    if (slope > 0.45) tmp.lerp(slope > 0.8 ? ROCK : LATERITE, Math.min(1, (slope - 0.45) * 1.6));
    if (d > 0 && roadDist(x, z) < 3.2) tmp.lerp(ROAD, 0.85);
    if (d > 0) { const n = vnoise(x * 0.018, z * 0.018) * 0.6 + vnoise(x * 0.09, z * 0.09) * 0.4; tmp.offsetHSL((n - 0.5) * 0.05, 0, (n - 0.5) * 0.1); if (h > 1.2 && n > 0.6) tmp.lerp(DRY, Math.min(0.55, (n - 0.6) * 2)); } // patches of dry and lush grass
    colors.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3)); g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, sharedMaterial); mesh.name = 'terrain'; mesh.receiveShadow = true; return mesh;
}

function buildWater(): THREE.Group {
  const grp = new THREE.Group();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(MAP * 10, MAP * 10, 1, 1).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x1e7fa8, transparent: true, opacity: 0.82, flatShading: true }));
  sea.position.y = -0.05; sea.name = 'sea'; grp.add(sea);
  // river ribbon following the centre line at the local bank height
  const pts: THREE.Vector3[] = []; const left: number[] = [], right: number[] = [], idx: number[] = [];
  const dense: [number, number][] = [];
  for (let i = 0; i + 1 < RIVER.length; i++) for (let k = 0; k < 8; k++) dense.push([RIVER[i][0] + (RIVER[i + 1][0] - RIVER[i][0]) * (k / 8), RIVER[i][1] + (RIVER[i + 1][1] - RIVER[i][1]) * (k / 8)]);
  dense.push(RIVER[RIVER.length - 1]);
  dense.forEach(([x, z], i) => {
    const [nx, nz] = i + 1 < dense.length ? [dense[i + 1][0] - x, dense[i + 1][1] - z] : [x - dense[i - 1][0], z - dense[i - 1][1]]; const l = Math.hypot(nx, nz) || 1;
    const px = -nz / l, pz = nx / l, y = Math.max(-0.05, baseHeight(x, z) - 0.2) + 0.45 - 0.6; void y;
    const lvl = Math.max(0.0, bankLevel(x, z) - 0.55); pts.push(new THREE.Vector3(x, lvl, z));
    const hw = RIVER_WIDTH / 2 + 1.5; left.push(x + px * hw, lvl, z + pz * hw); right.push(x - px * hw, lvl, z - pz * hw);
    if (i + 1 < dense.length) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const verts: number[] = []; for (let i = 0; i < left.length; i += 3) verts.push(left[i], left[i + 1], left[i + 2], right[i], right[i + 1], right[i + 2]);
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); rg.setIndex(idx); rg.computeVertexNormals();
  const river = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ color: 0x2c8fbb, transparent: true, opacity: 0.85, side: THREE.DoubleSide, flatShading: true })); river.name = 'river'; grp.add(river);
  return grp;
}
function bankLevel(x: number, z: number) {
  // un-carved terrain height at the river edge: sample a point 9 m away on the higher side
  let best = -Infinity; for (const [dx, dz] of [[9, 0], [-9, 0], [0, 9], [0, -9]]) best = Math.max(best, baseHeight(x + dx, z + dz)); return best;
}

const CHUNK = 80;
const VEG = new Set(['palm_tree', 'broadleaf_tree', 'bush', 'grass_clump', 'rock_small', 'rock_medium']);
/** `mesh` holds buildings, rocks and props; `trees` (when the area has any) holds trees, bushes and grass, which sway in the wind. A tree-only area has just `mesh`, with userData.tree set. */
export interface Chunk { mesh: THREE.Mesh; trees?: THREE.Mesh; cx: number; cz: number; center: THREE.Vector3; hasTall: boolean }

/** Merge every static model into one mesh per 80 m cell: a handful of draw calls instead of thousands. */
export async function buildStaticChunks(list: Placement[]): Promise<Chunk[]> {
  const names = [...new Set(list.map((p) => p.model))]; const geos = new Map<string, THREE.BufferGeometry>();
  await Promise.all(names.map(async (n) => geos.set(n, await modelGeometry(n))));
  const cells = new Map<string, Placement[]>();
  for (const p of list) { const k = `${Math.floor((p.x + HALF) / CHUNK)},${Math.floor((p.z + HALF) / CHUNK)}`; (cells.get(k) ?? cells.set(k, []).get(k)!).push(p); }
  const out: Chunk[] = []; const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  const windMat = makeWindMaterial(sharedMaterial);
  for (const [k, ps] of cells) {
    const parts: THREE.BufferGeometry[] = [], plantParts: THREE.BufferGeometry[] = [];
    for (const p of ps) {
      const g = geos.get(p.model)!.clone(); const hsh = (Math.abs(Math.sin(p.x * 12.9898 + p.z * 78.233)) * 43758.5453) % 1, veg = VEG.has(p.model), sc = veg ? 0.85 + hsh * 0.4 : 1;
      q.setFromAxisAngle(up, p.yaw); m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(sc, veg ? sc * (0.9 + ((hsh * 7) % 1) * 0.3) : 1, sc)); g.applyMatrix4(m);
      const col = g.getAttribute('color') as THREE.BufferAttribute, f = veg ? 0.82 + ((hsh * 13) % 1) * 0.36 : 0.9 + ((hsh * 13) % 1) * 0.2, tr = veg && p.model.includes('tree'), tn = tr ? [f * 0.95, f, f * 0.9] : [f, f, f];
      for (let i = 0; i < col.count; i++) col.setXYZ(i, Math.min(1, col.getX(i) * tn[0]), Math.min(1, col.getY(i) * tn[1]), Math.min(1, col.getZ(i) * tn[2]));
      if (/tree|bush|grass/.test(p.model)) { const gp = g.getAttribute('position'); const ys = new Float32Array(gp.count); for (let i = 0; i < gp.count; i++) ys[i] = gp.getY(i); g.setAttribute('sway', new THREE.BufferAttribute(swayWeights(ys), 1)); plantParts.push(g); } else parts.push(g);
    }
    const solid = parts.length ? mergeGeometries(parts, false) : null, plants = plantParts.length ? mergeGeometries(plantParts, false) : null; if (!solid && !plants) continue;
    const make = (geo: THREE.BufferGeometry, mat: THREE.Material) => { geo.computeVertexNormals(); geo.computeBoundingSphere(); const me = new THREE.Mesh(geo, mat); me.matrixAutoUpdate = false; me.frustumCulled = true; me.castShadow = false; return me; };
    const mesh = solid ? make(solid, sharedMaterial) : make(plants!, windMat); const trees = solid && plants ? make(plants, windMat) : undefined; if (!solid) mesh.userData.tree = true;
    const [cx, cz] = k.split(',').map(Number);
    out.push({ mesh, trees, cx, cz, center: (solid ?? plants)!.boundingSphere!.center.clone(), hasTall: ps.some((p) => p.model.includes('tree')) });
  }
  return out;
}

export interface WorldView {
  scene: THREE.Scene; sun: THREE.DirectionalLight; chunks: Chunk[]; storm: THREE.Mesh; stormNext: THREE.Line; water: THREE.Group;
  update(camPos: THREE.Vector3, t: number, low: boolean): void;
  setZone(cx: number, cz: number, r: number, nx: number, nz: number, nr: number): void;
}

export async function buildWorldView(w: WorldData): Promise<WorldView> {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4c58a); scene.fog = new THREE.Fog(0xf0c898, 140, 520);
  const { sky, mat: skyMat, clouds } = buildSky(); scene.add(sky); scene.add(clouds);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x6b5a8a, 1.05));
  const sun = new THREE.DirectionalLight(0xffd9a0, 2.1); sun.position.set(-120, 140, -80); scene.add(sun); scene.add(sun.target);
  scene.add(buildTerrainMesh(w));
  const water = buildWater(); scene.add(water);
  const chunks = await buildStaticChunks([...w.placements, ...w.vegetation, ...w.lights]);
  for (const c of chunks) { scene.add(c.mesh); if (c.trees) scene.add(c.trees); }

  // storm wall: violet cylinder with a scrolling noise shader
  const stormMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uInside: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float uTime; uniform float uInside; varying vec3 vP; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453);} float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y);} void main(){ float a = atan(vP.z, vP.x); float v = n(vec2(a*6.0, vP.y*0.05 - uTime*0.6))*0.6 + n(vec2(a*14.0 + uTime*0.2, vP.y*0.12 - uTime*1.4))*0.4; float top = 1.0 - smoothstep(30.0, 110.0, vP.y); float low = smoothstep(-110.0, -75.0, vP.y); float rim = pow(max(0.0, 1.0 - abs(vP.y + 20.0) / 130.0), 2.0); float streak = n(vec2(a*40.0, vP.y*0.02 - uTime*0.3)); float alpha = clamp(mix(0.85, 0.55, uInside) * (0.45 + v*0.7 + streak*0.25) * top * low, 0.0, 0.92); vec3 col = mix(vec3(0.30,0.10,0.66), vec3(0.78,0.62,1.0), v*0.4 + rim*0.6); gl_FragColor = vec4(col, alpha); }',
  });
  const storm = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 220, 384, 12, true), stormMat); storm.position.y = 60; storm.name = 'storm'; storm.frustumCulled = false; storm.visible = false; scene.add(storm);
  const ringPts: THREE.Vector3[] = []; for (let i = 0; i <= 384; i++) ringPts.push(new THREE.Vector3(Math.cos((i / 384) * Math.PI * 2), 0, Math.sin((i / 384) * Math.PI * 2)));
  const stormNext = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineDashedMaterial({ color: 0xa78bfa, dashSize: 0.02, gapSize: 0.02 })); stormNext.computeLineDistances(); stormNext.visible = false; stormNext.frustumCulled = false; scene.add(stormNext);

  // storm atmosphere: violet motes drifting along the wall, rain and violet fog outside the safe zone
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d')!; const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const MOTES = 420, RAIN = 360, seeds = Array.from({ length: Math.max(MOTES, RAIN) }, () => [Math.random(), Math.random(), Math.random()]);
  const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MOTES * 3), 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xc4a8ff, size: 3.4, map: dot, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending })); motes.frustumCulled = false; motes.visible = false; scene.add(motes);
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAIN * 3), 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xb9a5f5, size: 0.35, map: dot, transparent: true, opacity: 0.5, depthWrite: false })); rain.frustumCulled = false; rain.visible = false; scene.add(rain);
  const zone = { cx: 0, cz: 0, r: 0 }, fogIn = new THREE.Color(0xf0c898), fogOut = new THREE.Color(0x6a4aa8), bgIn = new THREE.Color(0xf4c58a), bgOut = new THREE.Color(0x4a3a7a); let outK = 0;

  return {
    scene, sun, chunks, storm, stormNext, water,
    update(cam, t, low) {
      sky.position.copy(cam); skyMat.color.setRGB(1 - 0.45 * outK, 1 - 0.5 * outK, 1 - 0.2 * outK); // the sky darkens to violet inside the storm
      (storm.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      const d = Math.hypot(cam.x - storm.position.x, cam.z - storm.position.z); (storm.material as THREE.ShaderMaterial).uniforms.uInside.value = d < storm.scale.x ? 1 : 0;
      const far = low ? 260 : 420;
      for (const c of chunks) { c.mesh.visible = Math.hypot(c.center.x - cam.x, c.center.z - cam.z) < far + 60; if (c.trees) c.trees.visible = c.mesh.visible; }
      windUniforms.uTime.value = t; windUniforms.uWind.value = low || settings.reduceMotion ? 0 : 1; // still on Low quality and with Reduce motion
      // the sun and its shadow follow the camera, so shadows work everywhere on the island, not just near the middle
      { const sx = Math.round(cam.x * 4) / 4, sz = Math.round(cam.z * 4) / 4; sun.target.position.set(sx, 0, sz); sun.position.set(sx - 120, 140, sz - 80); }
      water.children[0].position.x = cam.x; water.children[0].position.z = cam.z;
      // atmosphere
      const dz = Math.hypot(cam.x - zone.cx, cam.z - zone.cz), wallOn = storm.visible && zone.r > 0; outK += ((wallOn && dz > zone.r ? 1 : 0) - outK) * 0.04;
      const fog = scene.fog as THREE.Fog; fog.color.copy(fogIn).lerp(fogOut, outK); const alt = Math.max(0, cam.y - 15); fog.near = 140 - 80 * outK + alt * 0.7; fog.far = 520 - 240 * outK + alt * 2.4; // high up the fog thins, so the island and sea show from the plane (scene.background as THREE.Color).copy(bgIn).lerp(bgOut, outK);
      motes.visible = wallOn && Math.abs(dz - zone.r) < 110;
      if (motes.visible) {
        const pos = moteGeo.getAttribute('position') as THREE.BufferAttribute, a0 = Math.atan2(cam.z - zone.cz, cam.x - zone.cx), arc = 140 / Math.max(zone.r, 40), n = low ? 160 : MOTES; moteGeo.setDrawRange(0, n);
        for (let i = 0; i < n; i++) { const s = seeds[i], ang = a0 + (s[0] - 0.5) * arc * 2, rad = zone.r + (s[1] - 0.5) * 10, y = ((s[2] * 70 + t * (4 + s[0] * 6)) % 70) - 5; pos.setXYZ(i, zone.cx + Math.cos(ang) * rad, y, zone.cz + Math.sin(ang) * rad); }
        pos.needsUpdate = true;
      }
      rain.visible = outK > 0.3;
      if (rain.visible) {
        const pos = rainGeo.getAttribute('position') as THREE.BufferAttribute, n = low ? 140 : RAIN; rainGeo.setDrawRange(0, n);
        for (let i = 0; i < n; i++) { const s = seeds[i]; pos.setXYZ(i, cam.x + (s[0] - 0.5) * 44, cam.y + 14 - ((s[2] * 28 + t * 24) % 28), cam.z + (s[1] - 0.5) * 44); }
        pos.needsUpdate = true;
      }
    },
    setZone(cx, cz, r, nx, nz, nr) {
      zone.cx = cx; zone.cz = cz; zone.r = r; storm.visible = r > 0; storm.position.set(cx, 60, cz); storm.scale.set(Math.max(r, 0.01), 1, Math.max(r, 0.01));
      stormNext.visible = nr > 0; stormNext.position.set(nx, 1, nz); stormNext.scale.set(nr, 1, nr);
    },
  };
}
