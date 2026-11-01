import * as THREE from 'three';
import { geoToWorld, PLACES } from './geo.js';

// Built-up areas and lakes at their real locations: Bengaluru CBD (~25 km south-west), Hebbal / Manyata
// Tech Park towers, Yelahanka, Devanahalli town, Yelahanka Air Force Station runway (Aero India), and the
// Hebbal, Jakkur and Yelahanka lakes. Building footprints and heights are generated (one instanced draw).

// Small seeded random so the skyline is the same every load
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const CLUSTERS = [
  { place: PLACES.bengaluruCbd, radius: 6500, count: 2600, minH: 8, maxH: 110, tallBias: 2.2 },
  { place: PLACES.manyataTechPark, radius: 1600, count: 320, minH: 20, maxH: 90, tallBias: 1.2 },
  { place: PLACES.hebbal, radius: 2200, count: 420, minH: 8, maxH: 60, tallBias: 2.0 },
  { place: { lat: 13.1000, lon: 77.5960 }, radius: 2200, count: 520, minH: 6, maxH: 30, tallBias: 2.5 }, // Yelahanka
  { place: PLACES.devanahalli, radius: 1100, count: 260, minH: 5, maxH: 15, tallBias: 2.5 }
];

const LAKES = [
  { lat: 13.0455, lon: 77.5900, r: 600 },  // Hebbal
  { lat: 13.0850, lon: 77.6100, r: 450 },  // Jakkur
  { lat: 13.1000, lon: 77.5850, r: 500 }   // Yelahanka
];

// groundAt(x, z): ground height (world y); buildings, lakes and the AFS runway sit on it
// isFree(x, z): false on airport ground (e.g. HAL inside the city) - no building there
export function createBengaluruCity(scene, groundAt = () => 0, isFree = () => true) {
  const group = new THREE.Group();
  group.name = 'bengaluru_city';
  const rand = rng(560001); // Bengaluru PIN

  const total = CLUSTERS.reduce((n, c) => n + c.count, 0);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0);
  const buildings = new THREE.InstancedMesh(boxGeo, new THREE.MeshStandardMaterial({ roughness: 0.8 }), total);
  const shades = [0xd8d2c4, 0xc9c3b6, 0xb9b4aa, 0xe4ddd0, 0x9fa7ad, 0x8aa0b0];
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  let n = 0;
  CLUSTERS.forEach((c) => {
    const centre = geoToWorld(c.place.lat, c.place.lon);
    for (let i = 0; i < c.count; i++) {
      const r = c.radius * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      const core = 1 - r / c.radius;
      const h = c.minH + (c.maxH - c.minH) * Math.pow(rand(), c.tallBias) * (0.35 + 0.65 * core);
      const w = 14 + rand() * 30;
      const bx = centre.x + Math.cos(a) * r, bz = centre.z + Math.sin(a) * r;
      dummy.position.set(bx, groundAt(bx, bz) - 3, bz); // footing slightly sunk on sloping ground
      dummy.rotation.set(0, Math.round(rand() * 4) * 0.12, 0);
      dummy.scale.set(w, h, w * (0.6 + rand() * 0.8));
      if (!isFree(bx, bz)) dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      buildings.setMatrixAt(n, dummy.matrix);
      buildings.setColorAt(n, col.setHex(shades[Math.floor(rand() * shades.length)]));
      n++;
    }
  });
  buildings.instanceMatrix.needsUpdate = true;
  buildings.instanceColor.needsUpdate = true;
  group.add(buildings);

  const water = new THREE.MeshStandardMaterial({ color: 0x3b6e8f, roughness: 0.2, metalness: 0.3 });
  LAKES.forEach((l) => {
    const p = geoToWorld(l.lat, l.lon);
    const lake = new THREE.Mesh(new THREE.CircleGeometry(l.r, 28), water);
    lake.rotation.x = -Math.PI / 2;
    lake.scale.set(1, 0.7, 1);
    lake.position.set(p.x, groundAt(p.x, p.z) + 2.5, p.z);
    group.add(lake);
  });

  // Yelahanka Air Force Station runway (roughly east-west)
  const afs = geoToWorld(PLACES.yelahankaAfs.lat, PLACES.yelahankaAfs.lon);
  const afsRunway = new THREE.Mesh(new THREE.PlaneGeometry(45, 2900), new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.9 }));
  afsRunway.rotation.x = -Math.PI / 2;
  afsRunway.position.set(afs.x, groundAt(afs.x, afs.z) + 2.5, afs.z);
  group.add(afsRunway);

  scene.add(group);
  return group;
}
