// Airbase surfaces in 3D (on top of main.py's painted airbase, main.py:635-646): at each of the 3 airbases a
// textured runway (1,040 x 48 m: asphalt with paving seams, edge lines, threshold piano keys, 09 / 27 numbers,
// centre-line dashes, touchdown-zone and aiming-point blocks, tyre skid marks), the taxiway with its yellow
// centre line, the apron with parking marks, and runway lights: white edge lights, green thresholds, red ends
// (dim by day, bright at night: they bloom). Textures are drawn once on canvases (no downloads). Every vertex sits
// on the drawn terrain surface (surfaceY), lifted a little, so nothing floats or sinks.
import {
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  type Scene,
  SphereGeometry,
  SRGBColorSpace,
} from 'three';
import { PX_M, pxToX, pyToZ } from '../config';
import { MAP } from './MapData';
import { surfaceY } from './Terrain';

const LIFT = 0.35; // m above the ground triangles

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** asphalt base: grey with speckle, slightly darker rubbered centre, paving seams */
function asphalt(ctx: CanvasRenderingContext2D, w: number, h: number, r: () => number, base: number): void {
  ctx.fillStyle = `rgb(${base},${base},${base + 2})`;
  ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 22;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function runwayTexture(): CanvasTexture {
  const W = 2048; // along 1,040 m: ~0.51 m per texel
  const H = 96; // across 48 m: 0.5 m per texel
  const mx = W / 1040; // texels per metre along
  const my = H / 48;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  const r = seeded(4242);
  asphalt(ctx, W, H, r, 70);
  // rubbered wheel tracks along the middle
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.35, 'rgba(10,10,10,0.25)');
  g.addColorStop(0.5, 'rgba(10,10,10,0.32)');
  g.addColorStop(0.65, 'rgba(10,10,10,0.25)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // paving seams: longitudinal lanes every 7.5 m, transverse joints every 25 m (faint dark lines)
  ctx.fillStyle = 'rgba(25,25,25,0.45)';
  for (let y = 7.5; y < 48; y += 7.5) ctx.fillRect(0, y * my, W, 1);
  for (let x = 25; x < 1040; x += 25) ctx.fillRect(x * mx, 0, 1, H);
  // tyre skid marks in both touchdown zones (300-700 m from each threshold)
  for (const end of [0, 1]) {
    for (let k = 0; k < 140; k++) {
      const d = 280 + r() * 420;
      const x0 = (end === 0 ? d : 1040 - d) * mx;
      const len = (8 + r() * 45) * mx;
      const y = (24 + (r() < 0.5 ? -1 : 1) * (2.5 + r() * 4) + (r() - 0.5) * 1.5) * my;
      ctx.fillStyle = `rgba(12,12,12,${0.25 + r() * 0.4})`;
      ctx.fillRect(end === 0 ? x0 : x0 - len, y, len, Math.max(1, (0.3 + r() * 0.4) * my));
    }
  }
  const paint = 'rgb(205,205,198)';
  ctx.fillStyle = paint;
  // edge lines (0.9 m wide, 1 m in from the edge)
  ctx.fillRect(0, 1 * my, W, 0.9 * my);
  ctx.fillRect(0, H - 1.9 * my, W, 0.9 * my);
  // threshold piano keys: 8 stripes (1.8 m wide, 30 m long) both sides of the centre line, 6 m from each end
  for (const end of [0, 1]) {
    const x = (end === 0 ? 6 : 1040 - 36) * mx;
    for (let k = 0; k < 8; k++) {
      const off = 3 + k * 2.6;
      ctx.fillRect(x, (24 - off - 1.8) * my, 30 * mx, 1.8 * my);
      ctx.fillRect(x, (24 + off) * my, 30 * mx, 1.8 * my);
    }
  }
  // runway numbers (09 at the west end, 27 at the east end), 9 m tall, read by an aircraft landing on them
  ctx.font = `bold ${Math.round(12 * my)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [end, txt] of [[0, '09'], [1, '27']] as [number, string][]) {
    ctx.save();
    const x = (end === 0 ? 50 : 1040 - 50) * mx;
    ctx.translate(x, H / 2);
    ctx.rotate(end === 0 ? Math.PI / 2 : -Math.PI / 2);
    ctx.scale(1, 3.2 * (mx / my) * 0.62);
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  }
  // centre-line dashes: 30 m paint, 20 m gap, between the numbers
  for (let x = 70; x < 1040 - 100; x += 50) ctx.fillRect(x * mx, (24 - 0.45) * my, 30 * mx, 0.9 * my);
  // aiming points (45 m x 4 m blocks, 300 m in) and touchdown-zone bar pairs (every 150 m to 600 m)
  for (const end of [0, 1]) {
    const at = (d: number, len: number): number => (end === 0 ? d : 1040 - d - len) * mx;
    ctx.fillRect(at(300, 45), (24 - 9 - 4) * my, 45 * mx, 4 * my);
    ctx.fillRect(at(300, 45), (24 + 9) * my, 45 * mx, 4 * my);
    for (const d of [150, 450, 600]) {
      for (const s of [-1, 1]) {
        ctx.fillRect(at(d, 22), (24 + s * 6 - (s < 0 ? 1.8 : 0)) * my, 22 * mx, 1.8 * my);
        ctx.fillRect(at(d, 22), (24 + s * 8.6 - (s < 0 ? 1.8 : 0)) * my, 22 * mx, 1.8 * my);
      }
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function concreteTexture(w: number, h: number, metresX: number, metresY: number, marks: (ctx: CanvasRenderingContext2D, mx: number, my: number) => void): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  const r = seeded(w * 31 + h);
  asphalt(ctx, w, h, r, 92);
  const mx = w / metresX;
  const my = h / metresY;
  // concrete slabs 5 m square
  ctx.fillStyle = 'rgba(40,40,40,0.35)';
  for (let x = 5; x < metresX; x += 5) ctx.fillRect(x * mx, 0, 1, h);
  for (let y = 5; y < metresY; y += 5) ctx.fillRect(0, y * my, w, 1);
  // oil stains
  for (let k = 0; k < (metresX * metresY) / 900; k++) {
    ctx.fillStyle = `rgba(20,18,15,${0.1 + r() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(r() * w, r() * h, (1 + r() * 3) * mx, (1 + r() * 2) * my, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  marks(ctx, mx, my);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** a flat strip laid on the terrain: centre (x, z), size along X and Z, segments every ~10 m */
function strip(cx: number, cz: number, sx: number, sz: number, mat: MeshStandardMaterial): Mesh {
  const geo = new PlaneGeometry(sx, sz, Math.max(1, Math.round(sx / 10)), Math.max(1, Math.round(sz / 10)));
  geo.rotateX(-Math.PI / 2); // lies in x/z; +u along +x, +v toward -z
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx;
    const z = pos.getZ(i) + cz;
    pos.setY(i, surfaceY(x, z) + LIFT);
  }
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const m = new Mesh(geo, mat);
  m.position.set(cx, 0, cz); // local x/z around the centre, world heights
  return m;
}

export class Runways {
  private lights: InstancedMesh;
  private lightMat: MeshBasicMaterial;

  constructor(scene: Scene) {
    const surfMat = (map: CanvasTexture): MeshStandardMaterial =>
      new MeshStandardMaterial({ map, roughness: 0.88, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const runwayMat = surfMat(runwayTexture());
    const taxiMat = surfMat(
      concreteTexture(1024, 32, 800, 16, (ctx, mx, my) => {
        ctx.fillStyle = 'rgb(226,180,40)'; // taxiway centre line
        ctx.fillRect(0, 8 * my - 0.15 * my, 800 * mx, 0.3 * my + 1);
        ctx.fillStyle = 'rgb(226,180,40)';
        ctx.fillRect(0, 0.4 * my, 800 * mx, 0.2 * my + 1); // edge markings
        ctx.fillRect(0, 15.4 * my, 800 * mx, 0.2 * my + 1);
      }),
    );
    const apronMat = surfMat(
      concreteTexture(512, 192, 240, 88, (ctx, mx, my) => {
        ctx.strokeStyle = 'rgb(226,180,40)';
        ctx.lineWidth = Math.max(1, 0.3 * mx);
        for (let k = 0; k < 6; k++) {
          // parking stands: lead-in line + stop bar
          const x = (20 + k * 40) * mx;
          ctx.beginPath();
          ctx.moveTo(x, 4 * my);
          ctx.lineTo(x, 60 * my);
          ctx.moveTo(x - 6 * mx, 60 * my);
          ctx.lineTo(x + 6 * mx, 60 * my);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgb(200,60,40)';
        ctx.fillRect(0, 84 * my, 240 * mx, 0.6 * my); // apron edge safety line
      }),
    );

    const lightGeo = new SphereGeometry(0.45, 8, 6);
    this.lightMat = new MeshBasicMaterial({ color: 0xffffff });
    const nBases = MAP.airbases.length / 2;
    const perBase = 2 * 19 + 2 * 10 + 2 * 10; // edges, thresholds (green), ends (red)
    this.lights = new InstancedMesh(lightGeo, this.lightMat, nBases * perBase);
    this.lights.instanceMatrix.setUsage(DynamicDrawUsage);
    this.lights.userData.noShadow = true;
    const m = new Matrix4();
    const white = new Color(1, 0.97, 0.88);
    const green = new Color(0.2, 1, 0.35);
    const red = new Color(1, 0.12, 0.08);
    let li = 0;
    const lamp = (x: number, z: number, col: Color): void => {
      m.makeTranslation(x, surfaceY(x, z) + LIFT + 0.4, z);
      this.lights.setMatrixAt(li, m);
      this.lights.setColorAt(li, col);
      li++;
    };

    for (let a = 0; a < MAP.airbases.length; a += 2) {
      const ax = MAP.airbases[a];
      const ay = MAP.airbases[a + 1];
      const x = pxToX(ax);
      const z = pyToZ(ay);
      const len = 260 * PX_M; // 1,040 m
      const wid = 12 * PX_M; // 48 m
      scene.add(strip(x, z, len, wid, runwayMat));
      scene.add(strip(x, pyToZ(ay + 16), 200 * PX_M, 4 * PX_M, taxiMat));
      scene.add(strip(x, pyToZ(ay + 31), 60 * PX_M, 22 * PX_M, apronMat));
      // edge lights every ~58 m both sides, 1 m outside the paint
      for (let k = 0; k < 19; k++) {
        const lx = x - len / 2 + 4 + (k * (len - 8)) / 18;
        lamp(lx, z - wid / 2 - 1, white);
        lamp(lx, z + wid / 2 + 1, white);
      }
      // thresholds green (seen by landing aircraft), runway ends red, 10 each end
      for (let k = 0; k < 10; k++) {
        const lz = z - wid / 2 + 2 + (k * (wid - 4)) / 9;
        lamp(x - len / 2 - 1.5, lz, green);
        lamp(x + len / 2 + 1.5, lz, green);
        lamp(x - len / 2 - 6, lz, red);
        lamp(x + len / 2 + 6, lz, red);
      }
    }
    this.lights.count = li;
    scene.add(this.lights);
    this.setNight(false);
  }

  /** runway lights: on by day but dim, bright at night (HDR, blooms) */
  setNight(night: boolean): void {
    this.lightMat.color.setScalar(night ? 6 : 0.9);
  }
}
