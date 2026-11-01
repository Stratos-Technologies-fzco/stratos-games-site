import * as THREE from 'three';
import { worldToGeo, AIRPORT_ELEVATION_M } from '../environment/phase6/geo.js';
import { addSurfaceDetail } from '../render/visuals.js';

// Real South India terrain (lat 8-19.5 N, lon 74-85 E) from assets/terrain/south_india.png
// (built by tools/build_heightmap.py from SRTM / GMTED / ETOPO1 via Mapzen Terrain Tiles).
// World y = metres above VOBL (915 m AMSL), so sea level is y = -915.
// The ground is streamed in square chunks around the aircraft; the sea is one plane that follows it.
const CHUNK_M = 24000;
const CHUNK_SEG = 48;           // 500 m vertex spacing (data is ~1.2 km)
const RING = 3;                 // chunks each side of the aircraft's chunk (7 x 7 visible, ~84 km)
const BUILDS_PER_FRAME = 2;
const SEA_FLOOR_M = -25;        // grey level 0 (sea) is treated as this depth
export const SEA_LEVEL_Y = -AIRPORT_ELEVATION_M;

// VOBL flattened to field elevation: runways, terminals, hangars, MALSR; blends back to the real ground
const FLAT_BOX = { xMin: -700, xMax: 2700, zMin: -3200, zMax: 3200, blend: 2500 };

function smoothstep(t) { return t * t * (3 - 2 * t); }

const COLORS = {
  seaFloor: new THREE.Color(0x8a7f5a),
  beach: new THREE.Color(0xc2b280),
  lowland: new THREE.Color(0x4f6b2f),
  plateau: new THREE.Color(0x5c6235),
  plateauDry: new THREE.Color(0x7a6a4a),
  hills: new THREE.Color(0x3f5a2c),
  forest: new THREE.Color(0x24401f),
  highGrass: new THREE.Color(0x6b7044),
  rock: new THREE.Color(0x7a746b)
};

export class Terrain {
  static async load(basePath) {
    const meta = await (await fetch(`${basePath}.json`)).json();
    const img = new Image();
    img.src = `${basePath}.png`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = meta.width;
    canvas.height = meta.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const rgba = ctx.getImageData(0, 0, meta.width, meta.height).data;
    const grey = new Uint8Array(meta.width * meta.height);
    for (let i = 0; i < grey.length; i++) grey[i] = rgba[i * 4];
    return new Terrain(meta, grey);
  }

  constructor(meta, grey) {
    this.meta = meta;
    this.grey = grey;
    this.overlays = []; // functions (x, z) -> detailed height or null (e.g. Nandi Hills mesh)
    this.flatZones = []; // airport runway areas levelled to field elevation (see addFlatZone)
    this.chunks = new Map();
    this.group = new THREE.Group();
    this.group.name = 'south_india_terrain';
    this.material = addSurfaceDetail(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, envMapIntensity: 0.8 }), 'terrain');

    const seaGeo = new THREE.PlaneGeometry(CHUNK_M * (RING * 2 + 3), CHUNK_M * (RING * 2 + 3));
    seaGeo.rotateX(-Math.PI / 2);
    this.sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ color: 0x1e5a7a, roughness: 0.25, metalness: 0.2 }));
    this.sea.position.y = SEA_LEVEL_Y;
    this.sea.name = 'sea';
    this.group.add(this.sea);
  }

  // Real elevation (m AMSL) from the heightmap, bilinear; sea pixels count as SEA_FLOOR_M
  elevationAt(lat, lon) {
    const m = this.meta;
    const fx = Math.min(m.width - 1.001, Math.max(0, (lon - m.lonMin) / (m.lonMax - m.lonMin) * m.width - 0.5));
    const fy = Math.min(m.height - 1.001, Math.max(0, (m.latMax - lat) / (m.latMax - m.latMin) * m.height - 0.5));
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = fx - x0, ty = fy - y0;
    const e = (v) => (v === 0 ? SEA_FLOOR_M : (v - 1) * m.stepM);
    const g = this.grey, w = m.width;
    const a = e(g[y0 * w + x0]), b = e(g[y0 * w + x0 + 1]);
    const c = e(g[(y0 + 1) * w + x0]), d = e(g[(y0 + 1) * w + x0 + 1]);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  }

  // Level a rotated rectangle (runway + approach lights + apron) to height y, blending out over `blend` m.
  // zone: { cx, cz, ux, uz (unit runway direction), halfLen, halfWid, y, blend }
  addFlatZone(zone) {
    zone.reach = zone.halfLen + zone.halfWid + zone.blend;
    this.flatZones.push(zone);
  }

  // Distance (m) from x, z to the flat part of a zone; 0 inside
  zoneDistance(zn, x, z) {
    const dx = x - zn.cx, dz = z - zn.cz;
    const along = dx * zn.ux + dz * zn.uz;
    const cross = -dx * zn.uz + dz * zn.ux;
    return Math.hypot(Math.max(0, Math.abs(along) - zn.halfLen), Math.max(0, Math.abs(cross) - zn.halfWid));
  }

  // True when x, z is on (or within `margin` m of) a levelled airport area
  inFlatZone(x, z, margin = 0) {
    return this.flatZones.some((zn) => Math.abs(x - zn.cx) + Math.abs(z - zn.cz) < zn.reach * 1.5 && this.zoneDistance(zn, x, z) <= margin);
  }

  // Base ground (world y) from the heightmap, with VOBL and every airport levelled to field elevation
  baseHeightAt(x, z) {
    const { lat, lon } = worldToGeo(x, z);
    let y = this.elevationAt(lat, lon) - AIRPORT_ELEVATION_M;
    const f = FLAT_BOX;
    const dx = Math.max(f.xMin - x, 0, x - f.xMax);
    const dz = Math.max(f.zMin - z, 0, z - f.zMax);
    const d = Math.hypot(dx, dz);
    if (d < f.blend) y *= smoothstep(d / f.blend);
    for (const zn of this.flatZones) {
      if (Math.abs(x - zn.cx) + Math.abs(z - zn.cz) > zn.reach * 1.5) continue;
      const dz2 = this.zoneDistance(zn, x, z);
      if (dz2 < zn.blend) y = zn.y + (y - zn.y) * smoothstep(dz2 / zn.blend);
    }
    return y;
  }

  // Ground surface used for contact (base ground or a detailed overlay such as Nandi Hills)
  groundY(x, z) {
    let y = this.baseHeightAt(x, z);
    for (const o of this.overlays) {
      const h = o(x, z);
      if (h !== null) y = Math.max(y, h);
    }
    return y;
  }

  buildChunk(cx, cz) {
    const geo = new THREE.PlaneGeometry(CHUNK_M, CHUNK_M, CHUNK_SEG, CHUNK_SEG);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const col = new THREE.Color();
    const ox = cx * CHUNK_M, oz = cz * CHUNK_M;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + ox, z = pos.getZ(i) + oz;
      const y = this.baseHeightAt(x, z); // detailed overlays (Nandi Hills) draw their own mesh on top
      pos.setY(i, y);
      const amsl = y + AIRPORT_ELEVATION_M;
      const n = Math.sin(x * 0.0011) * Math.cos(z * 0.0013) + Math.sin((x + z) * 0.0007) * 0.6;
      if (amsl < 0) col.copy(COLORS.seaFloor);
      else if (amsl < 2.5) col.copy(COLORS.beach); // thin strip where the ground meets the sea
      else if (amsl < 350) col.copy(COLORS.lowland).lerp(COLORS.plateauDry, Math.max(0, n) * 0.4);
      else if (amsl < 1000) col.copy(COLORS.plateau).lerp(n > 0.4 ? COLORS.plateauDry : COLORS.lowland, Math.min(1, Math.abs(n) * 0.6));
      else if (amsl < 1500) col.copy(COLORS.hills).lerp(COLORS.forest, (amsl - 1000) / 500);
      else if (amsl < 2100) col.copy(COLORS.forest);
      else col.copy(COLORS.highGrass).lerp(COLORS.rock, Math.min(1, (amsl - 2100) / 400));
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, this.material);
    mesh.position.set(ox, 0, oz);
    mesh.receiveShadow = true;
    return mesh;
  }

  // Stream chunks around (x, z): build missing ones (a few per frame), drop far ones
  update(x, z) {
    const ccx = Math.round(x / CHUNK_M), ccz = Math.round(z / CHUNK_M);
    let built = 0;
    for (let r = 0; r <= RING && built < BUILDS_PER_FRAME; r++) {
      for (let i = -r; i <= r && built < BUILDS_PER_FRAME; i++) {
        for (let j = -r; j <= r && built < BUILDS_PER_FRAME; j++) {
          if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; // ring order: nearest first
          const key = `${ccx + i},${ccz + j}`;
          if (this.chunks.has(key)) continue;
          const mesh = this.buildChunk(ccx + i, ccz + j);
          this.chunks.set(key, mesh);
          this.group.add(mesh);
          built++;
        }
      }
    }
    for (const [key, mesh] of this.chunks) {
      const [kx, kz] = key.split(',').map(Number);
      if (Math.max(Math.abs(kx - ccx), Math.abs(kz - ccz)) > RING + 1) {
        this.group.remove(mesh);
        mesh.geometry.dispose();
        this.chunks.delete(key);
      }
    }
    this.sea.position.x = ccx * CHUNK_M;
    this.sea.position.z = ccz * CHUNK_M;
  }

  // Build every chunk of the starting ring at once (used before the first frame)
  prime(x, z) {
    for (let k = 0; k < (RING * 2 + 1) ** 2; k += BUILDS_PER_FRAME) this.update(x, z);
  }
}
