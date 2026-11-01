import * as THREE from 'three';
import { geoToWorld, NH44_ROUTE, ROADS } from './geo.js';

// Highway grid around VOBL, laid on the real routes: NH44 (Bellary Road / Airport Expressway),
// the airport access road from the Trumpet interchange, Devanahalli-Doddaballapur (NH648)
// and Hennur-Bagalur road. NH44 carries moving traffic in both directions.

// Polyline of [lat, lon] -> world points resampled every `step` metres
function routePointsFlat(route, step = 150) {
  const pts = route.map(([lat, lon]) => { const w = geoToWorld(lat, lon); return new THREE.Vector3(w.x, 0, w.z); });
  const out = [pts[0].clone()];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const n = Math.max(1, Math.round(a.distanceTo(b) / step));
    for (let k = 1; k <= n; k++) out.push(a.clone().lerp(b, k / n));
  }
  return out;
}

// Flat ribbon of `width` metres along the points, `y` above the ground
function ribbon(points, width, y, mat) {
  const pos = [];
  const idx = [];
  const side = new THREE.Vector3();
  points.forEach((p, i) => {
    const prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
    side.set(next.z - prev.z, 0, -(next.x - prev.x)).normalize().multiplyScalar(width / 2);
    pos.push(p.x + side.x, p.y + y, p.z + side.z, p.x - side.x, p.y + y, p.z - side.z);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

// Cumulative distances so traffic can be placed by distance along the road
function measure(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + points[i].distanceTo(points[i - 1]));
  return cum;
}

function pointAt(points, cum, d, out, dirOut) {
  let lo = 1, hi = cum.length - 1; // first index with cum[i] >= d
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < d) lo = mid + 1; else hi = mid;
  }
  const i = lo;
  const t = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
  out.copy(points[i - 1]).lerp(points[i], t);
  dirOut.copy(points[i]).sub(points[i - 1]).normalize();
}

// groundAt(x, z): ground height (world y); roads follow it, a little above so the coarser terrain never covers them
export function createNH44Expressway(scene, groundAt = () => 0) {
  const routePoints = (route) => routePointsFlat(route).map((p) => { p.y = groundAt(p.x, p.z); return p; });
  const group = new THREE.Group();
  group.name = 'highway_grid';

  const asphalt = new THREE.MeshStandardMaterial({ color: 0x303234, roughness: 0.95, side: THREE.DoubleSide });
  const median = new THREE.MeshStandardMaterial({ color: 0x55603a, roughness: 1, side: THREE.DoubleSide });
  const minorMat = new THREE.MeshStandardMaterial({ color: 0x3b3d3f, roughness: 0.95, side: THREE.DoubleSide });

  const nh44 = routePoints(NH44_ROUTE);
  group.add(ribbon(nh44, 34, 2.5, asphalt));
  group.add(ribbon(nh44, 3, 2.6, median));
  group.add(ribbon(routePoints(ROADS.airportAccess), 24, 2.5, asphalt));
  group.add(ribbon(routePoints(ROADS.devanahalliDoddaballapur), 14, 2.4, minorMat));
  group.add(ribbon(routePoints(ROADS.hennurBagalur), 12, 2.4, minorMat));

  // NH44 traffic: instanced vehicles, northbound and southbound carriageways
  const cum = measure(nh44);
  const length = cum[cum.length - 1];
  const perDir = 220;
  const total = perDir * 2;
  const cars = new THREE.InstancedMesh(new THREE.BoxGeometry(2.0, 1.6, 4.6), new THREE.MeshStandardMaterial({ roughness: 0.5 }), total);
  const palette = [0xf5f5f5, 0xb0b4b8, 0x1d1d1d, 0xb3261e, 0x1f4e9a, 0xe0b420, 0x2e7d32];
  const offsets = [];
  const speeds = [];
  const col = new THREE.Color();
  for (let i = 0; i < total; i++) {
    offsets.push((i % perDir) / perDir * length + Math.random() * 120);
    speeds.push(22 + Math.random() * 10); // 80-115 km/h
    cars.setColorAt(i, col.setHex(palette[i % palette.length]));
  }
  cars.instanceColor.needsUpdate = true;
  group.add(cars);

  const p = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  scene.add(group);
  return {
    group,
    update(timeSec) {
      for (let i = 0; i < total; i++) {
        const north = i >= perDir;
        let d = (offsets[i] + timeSec * speeds[i]) % length;
        if (!north) d = length - d; // southbound runs the other way
        pointAt(nh44, cum, d, p, dir);
        const lane = (north ? 1 : -1) * (5 + (i % 3) * 3.5); // three lanes each side of the median
        dummy.position.set(p.x + dir.z * lane, p.y + 3.4, p.z - dir.x * lane);
        dummy.rotation.set(0, Math.atan2(dir.x, dir.z) + (north ? 0 : Math.PI), 0);
        dummy.updateMatrix();
        cars.setMatrixAt(i, dummy.matrix);
      }
      cars.instanceMatrix.needsUpdate = true;
    }
  };
}
