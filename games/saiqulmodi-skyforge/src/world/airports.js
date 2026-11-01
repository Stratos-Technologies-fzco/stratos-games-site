import * as THREE from 'three';
import { geoToWorld, AIRPORT_ELEVATION_M } from '../environment/phase6/geo.js';
import { flatPlane, runwayEndMarkings, edgeLights, createPapi, RUNWAY, SOUTH_RUNWAY_X } from '../environment/phase6/voblAirport.js';
import { createApproachLighting } from '../environment/phase6/approachLights.js';
import { addSurfaceDetail } from '../render/visuals.js';

// South India airports from assets/airports/south_india_airports.json (OurAirports, built by
// tools/build_airports.py). Real positions, runway ends, headings, lengths and field elevations.
// VOBL keeps its detailed Phase 6 layout; every other airport gets a standard layout that is built when
// the aircraft comes within BUILD_RANGE and freed beyond DROP_RANGE.
const FT = 0.3048;
const BUILD_RANGE = 45000;
const DROP_RANGE = 60000;
const MALSR_M = 730;

// A runway end the aircraft can take off from or land on
function runwayEnd(rw, which) {
  const le = which === 'le';
  return {
    icao: rw.icao,
    airportName: rw.airportName,
    ident: le ? rw.le : rw.he,
    thrX: le ? rw.ax : rw.bx,
    thrZ: le ? rw.az : rw.bz,
    dirX: le ? rw.ux : -rw.ux,  // landing / take-off direction
    dirZ: le ? rw.uz : -rw.uz,
    y: rw.y,
    elevFt: rw.elevFt,
    lengthM: rw.length
  };
}

function makeRunway(apt, ident, ax, az, bx, bz, widthM) {
  const dx = bx - ax, dz = bz - az;
  const length = Math.hypot(dx, dz);
  return {
    icao: apt.icao, airportName: apt.city || apt.name, le: ident[0], he: ident[1],
    ax, az, bx, bz, cx: (ax + bx) / 2, cz: (az + bz) / 2,
    ux: dx / length, uz: dz / length, length, halfWidth: widthM / 2,
    y: apt.y, elevFt: apt.elevFt
  };
}

export class Airports {
  static async load(url) {
    const data = await (await fetch(url)).json();
    return new Airports(data.airports);
  }

  constructor(list) {
    this.list = list.map((a) => {
      const w = geoToWorld(a.lat, a.lon);
      const apt = { ...a, x: w.x, z: w.z, y: a.elevFt * FT - AIRPORT_ELEVATION_M, detailed: a.icao === 'VOBL' };
      if (apt.detailed) {
        // VOBL: the runways exactly as the Phase 6 layout draws them (field elevation = world y 0)
        apt.y = 0;
        apt.elevFt = 3002;
        apt.x = SOUTH_RUNWAY_X / 2;
        apt.z = 0;
        apt.runways = [
          makeRunway(apt, ['09L', '27R'], 0, RUNWAY.halfLength, 0, -RUNWAY.halfLength, RUNWAY.width),
          makeRunway(apt, ['09R', '27L'], SOUTH_RUNWAY_X, RUNWAY.halfLength, SOUTH_RUNWAY_X, -RUNWAY.halfLength, RUNWAY.width)
        ];
      } else {
        apt.runways = a.runways.map((r) => {
          const p = geoToWorld(r.leLat, r.leLon), q = geoToWorld(r.heLat, r.heLon);
          return makeRunway(apt, [r.le, r.he], p.x, p.z, q.x, q.z, Math.max(30, r.widthM));
        });
      }
      return apt;
    });
    this.runways = this.list.flatMap((a) => a.runways);
    this.group = new THREE.Group();
    this.group.name = 'airports';
    this.built = new Map(); // icao -> { group, papis, lights }
  }

  // Every take-off / landing end, for the airport picker
  ends() {
    return this.runways.flatMap((rw) => [runwayEnd(rw, 'le'), runwayEnd(rw, 'he')]);
  }

  end(icao, ident) {
    return this.ends().find((e) => e.icao === icao && e.ident === ident) || null;
  }

  // Level each airport's runways, approach lights and apron to its field elevation
  registerFlatZones(terrain) {
    for (const apt of this.list) {
      if (apt.detailed) continue; // VOBL has its own flattened box
      for (const rw of apt.runways) {
        terrain.addFlatZone({
          cx: rw.cx, cz: rw.cz, ux: rw.ux, uz: rw.uz,
          halfLen: rw.length / 2 + MALSR_M + 100, halfWid: 650, y: apt.y, blend: 1500
        });
      }
    }
  }

  // Runway under a ground position: { icao, ident (end landed on, from the heading), distPast } or null
  runwayAt(x, z, headingDeg) {
    const hr = headingDeg * Math.PI / 180;
    const hx = -Math.cos(hr), hz = -Math.sin(hr); // heading as a world direction (north = -X, east = -Z)
    for (const rw of this.runways) {
      const dx = x - rw.cx, dz = z - rw.cz;
      if (Math.abs(dx) + Math.abs(dz) > rw.length) continue;
      const along = dx * rw.ux + dz * rw.uz;
      const cross = -dx * rw.uz + dz * rw.ux;
      if (Math.abs(along) > rw.length / 2 + 60 || Math.abs(cross) > rw.halfWidth + 5) continue;
      const fromLe = hx * rw.ux + hz * rw.uz >= 0;
      return {
        icao: rw.icao,
        ident: fromLe ? rw.le : rw.he,
        distPast: Math.round(fromLe ? along + rw.length / 2 : rw.length / 2 - along)
      };
    }
    return null;
  }

  // Nearest airport to x, z
  nearest(x, z) {
    let best = null, bestD = Infinity;
    for (const a of this.list) {
      const d = Math.hypot(a.x - x, a.z - z);
      if (d < bestD) { bestD = d; best = a; }
    }
    return { airport: best, dist: bestD };
  }

  buildAirport(apt) {
    const group = new THREE.Group();
    group.name = `airport_${apt.icao}`;
    const mat = {
      asphalt: addSurfaceDetail(new THREE.MeshStandardMaterial({ color: 0x2b2c2e, roughness: 0.9 }), 'runway'),
      taxi: addSurfaceDetail(new THREE.MeshStandardMaterial({ color: 0x343538, roughness: 0.9 }), 'taxi'),
      apron: addSurfaceDetail(new THREE.MeshStandardMaterial({ color: 0x9a9a94, roughness: 0.85 }), 'apron'),
      paint: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.75 }),
      yellow: new THREE.MeshStandardMaterial({ color: 0xe8c000, roughness: 0.75 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x35596b, roughness: 0.15, metalness: 0.8 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0xd2d2cc, roughness: 0.7 })
    };
    const papis = [];
    const lights = [];
    const longest = apt.runways.reduce((a, b) => (b.length > a.length ? b : a));

    for (const rw of apt.runways) {
      // Runway-local frame: the 'le' threshold at +length/2 on Z, landing on 'le' heads towards -Z
      const rg = new THREE.Group();
      rg.position.set(rw.cx, rw.y, rw.cz);
      rg.rotation.y = Math.atan2(-rw.ux, -rw.uz);
      group.add(rg);
      const half = rw.length / 2, width = rw.halfWidth * 2;

      rg.add(flatPlane(width, rw.length, mat.asphalt, 0, 0.05, 0));
      const marks = new THREE.Group();
      marks.scale.x = width / RUNWAY.width; // the shared markings are laid out for a 45 m runway
      rg.add(marks);
      for (let z = -half + 100; z < half - 100; z += 50) marks.add(flatPlane(1.2, 30, mat.paint, 0, 0.08, z));
      [-1, 1].forEach((s) => marks.add(flatPlane(0.9, rw.length, mat.paint, s * 21.5, 0.11, 0)));
      runwayEndMarkings(marks, mat.paint, half, -1, rw.le);
      runwayEndMarkings(marks, mat.paint, -half, 1, rw.he);
      edgeLights(rg, rw.halfWidth, half, 0);
      papis.push({ rg, papi: createPapi(rg, half - 400, -(rw.halfWidth + 17.5), -1) });
      papis.push({ rg, papi: createPapi(rg, -half + 400, rw.halfWidth + 17.5, 1) });
      lights.push(createApproachLighting(rg, half, 1), createApproachLighting(rg, -half, -1));

      // Parallel taxiway with end and middle connectors
      const tx = rw.halfWidth + 150;
      rg.add(flatPlane(23, rw.length, mat.taxi, tx, 0.04, 0));
      [-half + 60, 0, half - 60].forEach((z) => rg.add(flatPlane(tx - rw.halfWidth, 23, mat.taxi, (tx + rw.halfWidth) / 2, 0.04, z)));

      if (rw === longest) {
        // Apron, terminal and tower beside the taxiway (standard layout, not surveyed positions)
        const termLen = Math.min(320, rw.length * 0.22);
        rg.add(flatPlane(180, termLen + 160, mat.apron, tx + 110, 0.03, 0));
        const terminal = new THREE.Mesh(new THREE.BoxGeometry(55, 16, termLen), mat.glass);
        terminal.position.set(tx + 230, 8, 0);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(70, 2, termLen + 20), mat.concrete);
        roof.position.set(tx + 230, 17, 0);
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 32, 12), mat.concrete);
        tower.position.set(tx + 200, 16, termLen / 2 + 90);
        const cab = new THREE.Mesh(new THREE.CylinderGeometry(6, 4.5, 5, 10), mat.glass);
        cab.position.set(tx + 200, 34.5, termLen / 2 + 90);
        rg.add(terminal, roof, tower, cab);
      }
    }
    this.group.add(group);
    return { group, papis, lights };
  }

  dispose(entry) {
    this.group.remove(entry.group);
    const materials = new Set();
    entry.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) materials.add(o.material);
    });
    materials.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
  }

  // Build airports coming into range (one per frame), free far ones, run PAPI and approach lights
  update(pos, timeMs) {
    let builtThisFrame = false;
    for (const apt of this.list) {
      if (apt.detailed) continue;
      const d = Math.hypot(apt.x - pos.x, apt.z - pos.z);
      const entry = this.built.get(apt.icao);
      if (!entry && d < BUILD_RANGE && !builtThisFrame) {
        this.built.set(apt.icao, this.buildAirport(apt));
        builtThisFrame = true;
      } else if (entry && d > DROP_RANGE) {
        this.dispose(entry);
        this.built.delete(apt.icao);
      }
    }
    const local = new THREE.Vector3();
    for (const entry of this.built.values()) {
      for (const { rg, papi } of entry.papis) {
        rg.updateMatrixWorld();
        papi.update(rg.worldToLocal(local.copy(pos)));
      }
      entry.lights.forEach((l) => l.update(timeMs));
    }
  }
}
