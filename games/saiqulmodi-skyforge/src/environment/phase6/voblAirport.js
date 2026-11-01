import * as THREE from 'three';
import { geoToWorld, PLACES } from './geo.js';
import { addSurfaceDetail, gfx } from '../../render/visuals.js';

// Kempegowda International Airport (VOBL): runway 09L/27R markings, edge lights and PAPI,
// parallel taxiway, apron, Terminal 1, Terminal 2 (garden terminal), ATC tower, hangars,
// and the southern runway 09R/27L. Terminals sit between the two runways, as at the real airport.
export const RUNWAY = { length: 4000, width: 45, halfLength: 2000 };
export const SOUTH_RUNWAY_X = geoToWorld(13.1890, 77.7066).x; // 09R/27L centreline (approx.)

const LIGHT_SIZE_PX = 4;

// Which runway (if any) a ground position is on; a 5 m margin past the edge lines for main-gear width
export function runwayAt(x, z) {
  if (Math.abs(z) > RUNWAY.halfLength + 60) return null; // 60 m paved overrun at each end
  if (Math.abs(x) <= RUNWAY.width / 2 + 5) return z > 0 ? '09L' : '27R';
  if (Math.abs(x - SOUTH_RUNWAY_X) <= RUNWAY.width / 2 + 5) return z > 0 ? '09R' : '27L';
  return null;
}

export function flatPlane(w, l, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  m.receiveShadow = true;
  return m;
}

// White runway designator painted on the surface, readable from an aircraft landing towards `headingSign` Z
export function designator(text, z, headingSign) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 230px Arial';
  ctx.fillText(text.slice(0, 2), 128, 230);
  ctx.font = 'bold 190px Arial';
  ctx.fillText(text.slice(2), 128, 470);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = gfx.aniso;
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.75 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 36), mat);
  m.rotation.x = -Math.PI / 2;
  if (headingSign > 0) m.rotation.z = Math.PI; // 27R: read by aircraft flying towards +Z
  m.position.set(0, 0.13, z);
  return m;
}

// Threshold piano keys, designator, touchdown-zone bars and aiming point for one runway end.
// thresholdZ: where the runway starts for this landing direction; dir: -1 lands towards -Z (09L), +1 towards +Z (27R)
export function runwayEndMarkings(group, paint, thresholdZ, dir, text) {
  const inward = dir; // +distance along the landing direction
  for (let i = 0; i < 12; i++) {
    const x = -19.8 + i * 3.6 + (i >= 6 ? 0 : 0);
    group.add(flatPlane(1.8, 30, paint, x, 0.12, thresholdZ + inward * 21));
  }
  group.add(designator(text, thresholdZ + inward * 60, dir));
  // Aiming point: two broad bars 400 m in
  [-1, 1].forEach((s) => group.add(flatPlane(9, 45, paint, s * 11, 0.12, thresholdZ + inward * 422)));
  // Touchdown zone: pairs of bars every 150 m out to 900 m
  [150, 300, 600, 750, 900].forEach((d, k) => {
    const bars = k < 2 ? 3 : k < 4 ? 2 : 1;
    [-1, 1].forEach((s) => {
      for (let b = 0; b < bars; b++) group.add(flatPlane(1.8, 22.5, paint, s * (6 + b * 3), 0.12, thresholdZ + inward * d));
    });
  });
}

// PAPI: 4 lights left of the touchdown point; each turns white above its angle, red below
export function createPapi(group, touchdownZ, sideX, dir) {
  const angles = [3.5, 3.1667, 2.8333, 2.5]; // nearest the runway first
  const positions = new Float32Array(12);
  const colors = new Float32Array(12);
  angles.forEach((_, i) => {
    positions[i * 3] = sideX + Math.sign(sideX) * i * 9;
    positions[i * 3 + 1] = 1.0;
    positions[i * 3 + 2] = touchdownZ;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 7, sizeAttenuation: false, vertexColors: true, toneMapped: false }));
  group.add(pts);
  [0, 1, 2, 3].forEach((i) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    box.position.set(positions[i * 3], 0.6, touchdownZ);
    group.add(box);
  });
  return {
    update(aircraftPos) {
      // Distance to the PAPI measured along the approach (aircraft before the box on its landing direction)
      const dist = (aircraftPos.z - touchdownZ) * -dir;
      const visible = dist > 0;
      const elevDeg = Math.atan2(aircraftPos.y, Math.max(1, dist)) * 180 / Math.PI;
      angles.forEach((a, i) => {
        const white = visible && elevDeg > a;
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = white ? 1.0 : 0.08;
        colors[i * 3 + 2] = white ? 1.0 : 0.08;
      });
      geo.attributes.color.needsUpdate = true;
    }
  };
}

export function edgeLights(group, halfWidth, halfLength, offsetX) {
  const pos = [];
  const col = [];
  for (let z = -halfLength; z <= halfLength; z += 60) {
    [-1, 1].forEach((s) => { pos.push(offsetX + s * (halfWidth + 1.5), 0.5, z); col.push(1, 0.95, 0.8); });
  }
  // Threshold / end bars: green facing the approach, red at the far end
  for (let x = -halfWidth; x <= halfWidth; x += 4.5) {
    pos.push(offsetX + x, 0.5, halfLength + 1); col.push(0.2, 1, 0.3);
    pos.push(offsetX + x, 0.5, -halfLength - 1); col.push(0.2, 1, 0.3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: LIGHT_SIZE_PX, sizeAttenuation: false, vertexColors: true, toneMapped: false })));
}

export function createKempegowdaStructures(scene) {
  const group = new THREE.Group();
  group.name = 'vobl_airport';

  const paint = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.75 });
  const asphalt = addSurfaceDetail(new THREE.MeshStandardMaterial({ color: 0x2b2c2e, roughness: 0.9 }), 'runway');
  const taxiMat = addSurfaceDetail(new THREE.MeshStandardMaterial({ color: 0x343538, roughness: 0.9 }), 'taxi');
  const apronMat = addSurfaceDetail(new THREE.MeshStandardMaterial({ color: 0x9a9a94, roughness: 0.85 }), 'apron');
  const yellow = new THREE.MeshStandardMaterial({ color: 0xe8c000, roughness: 0.75 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xd2d2cc, roughness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x35596b, roughness: 0.15, metalness: 0.8 });
  const roofCopper = new THREE.MeshStandardMaterial({ color: 0x9a7448, roughness: 0.5 });
  const garden = new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 0.9 });
  const tower = new THREE.MeshStandardMaterial({ color: 0xe6e6df, roughness: 0.4 });
  const hangarMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc0, roughness: 0.5, metalness: 0.4 });

  // ---- Runway 09L/27R markings (the runway surface and centreline are drawn by the page) ----
  [-1, 1].forEach((s) => group.add(flatPlane(0.9, RUNWAY.length, paint, s * 21.5, 0.11, 0)));
  runwayEndMarkings(group, paint, RUNWAY.halfLength, -1, '09L');
  runwayEndMarkings(group, paint, -RUNWAY.halfLength, 1, '27R');
  edgeLights(group, RUNWAY.width / 2, RUNWAY.halfLength, 0);
  const papi09L = createPapi(group, RUNWAY.halfLength - 400, -40, -1);
  const papi27R = createPapi(group, -RUNWAY.halfLength + 400, 40, 1);

  // ---- Parallel taxiway, connectors, apron ----
  group.add(flatPlane(23, RUNWAY.length + 200, taxiMat, 190, 0.04, 0));
  group.add(flatPlane(0.4, RUNWAY.length + 200, yellow, 190, 0.08, 0));
  [-1900, -1100, -300, 500, 1300, 1900].forEach((z) => {
    group.add(flatPlane(170, 23, taxiMat, 106, 0.04, z));
    group.add(flatPlane(170, 0.4, yellow, 106, 0.08, z));
  });
  group.add(flatPlane(330, 2300, apronMat, 520, 0.03, -400));
  [-1, 0, 1].forEach((k) => group.add(flatPlane(60, 23, taxiMat, 230 + 60, 0.035, -400 + k * 800)));

  // ---- Southern runway 09R/27L ----
  group.add(flatPlane(45, RUNWAY.length, asphalt, SOUTH_RUNWAY_X, 0.05, 0));
  for (let z = -1900; z < 1900; z += 50) group.add(flatPlane(1.2, 30, paint, SOUTH_RUNWAY_X, 0.08, z));
  edgeLights(group, RUNWAY.width / 2, RUNWAY.halfLength, SOUTH_RUNWAY_X);
  group.add(flatPlane(23, RUNWAY.length, taxiMat, SOUTH_RUNWAY_X - 190, 0.04, 0));

  // ---- Terminal 1: glass hall under a barrel-vault roof, two piers to the apron ----
  const t1 = geoToWorld(PLACES.terminal1.lat, PLACES.terminal1.lon);
  const t1Body = new THREE.Mesh(new THREE.BoxGeometry(90, 22, 450), glass);
  t1Body.position.set(t1.x, 11, t1.z);
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(58, 58, 470, 24, 1, true, Math.PI / 2, Math.PI), roofCopper);
  vault.rotation.x = Math.PI / 2;
  vault.scale.set(1, 1, 0.35);
  vault.position.set(t1.x, 22, t1.z);
  group.add(t1Body, vault);
  [-140, 140].forEach((dz) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(t1.x - 700, 14, 40), concrete);
    pier.position.set((t1.x + 700) / 2 - 45, 7, t1.z + dz);
    group.add(pier);
  });

  // ---- Terminal 2: long pavilion with green "garden" roof terraces and a deep canopy ----
  const t2 = geoToWorld(PLACES.terminal2.lat, PLACES.terminal2.lon);
  const t2Body = new THREE.Mesh(new THREE.BoxGeometry(120, 26, 520), glass);
  t2Body.position.set(t2.x, 13, t2.z);
  const t2Canopy = new THREE.Mesh(new THREE.BoxGeometry(160, 3, 560), roofCopper);
  t2Canopy.position.set(t2.x, 27.5, t2.z);
  group.add(t2Body, t2Canopy);
  for (let i = 0; i < 6; i++) {
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(110, 1.5, 70), garden);
    terrace.position.set(t2.x, 29.7, t2.z - 220 + i * 88);
    group.add(terrace);
  }
  const t2Pier = new THREE.Mesh(new THREE.BoxGeometry(t2.x - 700, 14, 50), concrete);
  t2Pier.position.set((t2.x + 700) / 2 - 60, 7, t2.z);
  group.add(t2Pier);

  // ---- ATC tower ----
  const atc = geoToWorld(PLACES.atcTower.lat, PLACES.atcTower.lon);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.5, 58, 16), tower);
  shaft.position.set(atc.x, 29, atc.z);
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(9, 6.5, 8, 12), glass);
  cab.position.set(atc.x, 62, atc.z);
  const cabRoof = new THREE.Mesh(new THREE.CylinderGeometry(10, 9.5, 1.5, 12), tower);
  cabRoof.position.set(atc.x, 66.7, atc.z);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 8, 6), tower);
  mast.position.set(atc.x, 71, atc.z);
  group.add(shaft, cab, cabRoof, mast);

  // ---- Hangars: arched roofs, doors facing the runway ----
  const hg = geoToWorld(PLACES.hangars.lat, PLACES.hangars.lon);
  for (let i = 0; i < 3; i++) {
    const hangar = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 70, 20, 1, false, 0, Math.PI), hangarMat);
    hangar.rotation.z = Math.PI / 2;
    hangar.position.set(hg.x, 0, hg.z - 100 + i * 100);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(56, 26), new THREE.MeshStandardMaterial({ color: 0x55595e }));
    door.rotation.y = -Math.PI / 2;
    door.position.set(hg.x - 35.2, 13, hg.z - 100 + i * 100);
    group.add(hangar, door);
  }
  group.add(flatPlane(260, 360, apronMat, hg.x - 140, 0.03, hg.z));

  // ---- Landside: forecourt and car parks south of the terminals ----
  group.add(flatPlane(200, 1400, taxiMat, t1.x + 170, 0.04, (t1.z + t2.z) / 2));

  scene.add(group);
  return {
    group,
    update(aircraftPos) {
      papi09L.update(aircraftPos);
      papi27R.update(aircraftPos);
    }
  };
}
