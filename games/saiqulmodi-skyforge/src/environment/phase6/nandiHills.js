import * as THREE from 'three';
import { geoToWorld, PLACES, AIRPORT_ELEVATION_M } from './geo.js';

// Nandi Hills granite massif, ~19 km north of VOBL, with Skandagiri ~5 km further north.
// Summits sit at their real lat/lon and real heights above the airfield (1478 m / 1450 m AMSL vs 915 m).
// The shape between them is modelled (flat-topped granite domes, steep flanks, saddle, foothills),
// not survey data.
const SIZE_X = 13000;   // north-south extent (m)
const SIZE_Z = 10000;   // east-west extent (m)
const SEG_X = 170;
const SEG_Z = 130;

function dome(d, radius) {
  // Flat-topped dome with steep granite flanks
  const t = d / radius;
  return 1 / (1 + t * t * t * t);
}

function ridgeNoise(x, z) {
  return Math.sin(x * 0.0021 + z * 0.0013) * 0.5 + Math.sin(x * 0.0057 - z * 0.0041) * 0.3 + Math.sin(x * 0.013 + z * 0.011) * 0.2;
}

const nandi = geoToWorld(PLACES.nandiHillsSummit.lat, PLACES.nandiHillsSummit.lon);
const skanda = geoToWorld(PLACES.skandagiriSummit.lat, PLACES.skandagiriSummit.lon);
const nandiH = PLACES.nandiHillsSummit.elev - AIRPORT_ELEVATION_M;
const skandaH = PLACES.skandagiriSummit.elev - AIRPORT_ELEVATION_M;
const cx = (nandi.x + skanda.x) / 2;
const cz = (nandi.z + skanda.z) / 2;

// Height (m above the airfield) of the massif at world x, z; 0 outside the grid. Same surface as the mesh.
export function nandiHeightAt(wx, wz) {
  const lx = wx - cx, lz = wz - cz;
  if (Math.abs(lx) > SIZE_X / 2 || Math.abs(lz) > SIZE_Z / 2) return 0;
  const dN = Math.hypot(wx - nandi.x, (wz - nandi.z) * 1.15);
  const dS = Math.hypot(wx - skanda.x, (wz - skanda.z) * 1.3);

  // Two summits, a saddle between them, rolling foothills around
  let h = Math.max(nandiH * dome(dN, 1700), skandaH * dome(dS, 1300));
  const along = Math.max(0, 1 - Math.abs((wz - (nandi.z + skanda.z) / 2)) / 1500);
  const between = wx < nandi.x && wx > skanda.x ? 1 : 0;
  h = Math.max(h, 280 * along * between);
  const foothills = Math.max(0, 1 - Math.hypot(lx, lz) / 4000); // stays clear of NH44 to the east
  h += foothills * (60 + 45 * ridgeNoise(wx, wz)) + (h > 150 ? 22 * ridgeNoise(wx * 3, wz * 3) : 0);

  // Fade to the plain at the grid edge
  const ex = 1 - Math.pow(Math.abs(lx) / (SIZE_X / 2), 6);
  const ez = 1 - Math.pow(Math.abs(lz) / (SIZE_Z / 2), 6);
  return Math.max(0, h * Math.min(ex, ez));
}

// Terrain overlay: detailed massif height where this grid covers the ground, otherwise null
export function nandiOverlay(wx, wz) {
  if (Math.abs(wx - cx) > SIZE_X / 2 || Math.abs(wz - cz) > SIZE_Z / 2) return null;
  return nandiHeightAt(wx, wz) + 3; // matches the mesh offset below
}

// baseHeightAt(x, z): the real ground under the massif (world y); the detail rises from it
export function createNandiHills(scene, baseHeightAt = () => 0) {
  const geometry = new THREE.PlaneGeometry(SIZE_X, SIZE_Z, SEG_X, SEG_Z);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const granite = new THREE.Color(0x7a746b);
  const graniteDark = new THREE.Color(0x5b5650);
  const scrub = new THREE.Color(0x4d6233);
  const plain = new THREE.Color(0x3e5229);
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + cx;
    const wz = pos.getZ(i) + cz;
    const h = nandiHeightAt(wx, wz);
    pos.setY(i, Math.max(baseHeightAt(wx, wz), h));

    // Bare granite high up, scrub on the flanks, farmland at the foot
    if (h > 330) c.copy(granite).lerp(graniteDark, (ridgeNoise(wx * 5, wz * 5) + 1) * 0.3);
    else if (h > 90) c.copy(scrub).lerp(granite, (h - 90) / 240);
    else c.copy(plain).lerp(scrub, h / 90);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true }));
  mesh.position.set(cx, 3, cz); // above the coarser streamed terrain so the two surfaces never z-fight
  mesh.name = 'nandi_hills';
  scene.add(mesh);
  return mesh;
}
