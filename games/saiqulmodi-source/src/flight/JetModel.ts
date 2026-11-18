// Jet built from a few primitives (no model download). Nose points down -Z.
// PBR look: painted skin (MeshStandardMaterial, metalness ~0.22, roughness ~0.38; streamlined lathe fuselage) with a procedural
// panel-line / rivet / vent normal map, a glossy clear canopy (MeshPhysicalMaterial, roughness 0.05), and an
// afterburner made of an HDR plume shader (hot white-blue core, orange body, red tip, shock diamonds) plus a
// glowing nozzle; the bloom pass makes it glow. Reflections come from scene.environment (fx/Environment.ts).
import {
  AdditiveBlending,
  LatheGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ShaderMaterial,
  SphereGeometry,
  type Texture,
  Vector2,
  Vector3,
} from 'three';

type V3 = [number, number, number];

/** triangles with planar UVs taken from two axes (0 = x, 1 = y, 2 = z), so the panel map lies on the surface */
function tri(points: number[], ua = 0, va = 2): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
  const uv = new Float32Array((points.length / 3) * 2);
  for (let i = 0, j = 0; i < points.length; i += 3, j += 2) {
    uv[j] = points[i + ua] / 5;
    uv[j + 1] = points[i + va] / 5;
  }
  g.setAttribute('uv', new BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** HSV (degrees, 0..1, 0..1) -> a hex colour (main.py uses pygame's hsva) */
function hsv(h: number, s: number, v: number): number {
  const f = (n: number): number => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return (Math.round(f(5) * 255) << 16) | (Math.round(f(3) * 255) << 8) | Math.round(f(1) * 255);
}

// ---------- procedural panel maps (drawn once, shared by every jet) ----------
let panelMaps: { normal: Texture; rough: Texture } | null | undefined;

function makePanelMaps(): { normal: Texture; rough: Texture } | null {
  if (panelMaps !== undefined) return panelMaps;
  if (typeof document === 'undefined') return (panelMaps = null);
  const N = 512;
  const hc = document.createElement('canvas');
  hc.width = hc.height = N;
  const h = hc.getContext('2d') as CanvasRenderingContext2D;
  let s = 7;
  const rnd = (): number => ((s = (s * 16807) % 2147483647) / 2147483647);
  h.fillStyle = 'rgb(128,128,128)';
  h.fillRect(0, 0, N, N);
  // panels: rows of plates with staggered seams, slightly raised/sunk plates
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y0 = (r * N) / rows;
    let x = -rnd() * 80;
    while (x < N) {
      const w = 60 + rnd() * 110;
      const lift = 118 + rnd() * 20;
      h.fillStyle = `rgb(${lift},${lift},${lift})`;
      h.fillRect(x + 2, y0 + 2, w - 4, N / rows - 4);
      // seam
      h.fillStyle = 'rgb(70,70,70)';
      h.fillRect(x, y0, 2, N / rows);
      // rivet rows along the seam
      h.fillStyle = 'rgb(165,165,165)';
      for (let ry = y0 + 6; ry < y0 + N / rows - 4; ry += 9) {
        h.beginPath();
        h.arc(x + 6, ry, 1.3, 0, Math.PI * 2);
        h.fill();
      }
      // now and then a cooling vent (louvres) or an access hatch
      const k = rnd();
      if (k < 0.12) {
        for (let i = 0; i < 6; i++) {
          h.fillStyle = 'rgb(60,60,60)';
          h.fillRect(x + 18, y0 + 14 + i * 7, w * 0.4, 3);
          h.fillStyle = 'rgb(170,170,170)';
          h.fillRect(x + 18, y0 + 17 + i * 7, w * 0.4, 1);
        }
      } else if (k < 0.24) {
        h.strokeStyle = 'rgb(80,80,80)';
        h.lineWidth = 1.5;
        h.strokeRect(x + 16, y0 + 16, 26, 20);
      }
      x += w;
    }
    h.fillStyle = 'rgb(70,70,70)';
    h.fillRect(0, y0, N, 2);
    h.fillStyle = 'rgb(165,165,165)';
    for (let rx = 4; rx < N; rx += 9) {
      h.beginPath();
      h.arc(rx, y0 + 6, 1.3, 0, Math.PI * 2);
      h.fill();
    }
  }
  const src = h.getImageData(0, 0, N, N).data;
  const at = (x: number, y: number): number => src[(((y + N) % N) * N + ((x + N) % N)) * 4] / 255;
  // normal map from the height field (Sobel)
  const nc = document.createElement('canvas');
  nc.width = nc.height = N;
  const nctx = nc.getContext('2d') as CanvasRenderingContext2D;
  const nimg = nctx.createImageData(N, N);
  // roughness map: plates matte-coated, seams and rivets a little rougher, faint grime streaks
  const rc = document.createElement('canvas');
  rc.width = rc.height = N;
  const rctx = rc.getContext('2d') as CanvasRenderingContext2D;
  const rimg = rctx.createImageData(N, N);
  const strength = 3.0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)) * strength;
      const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * N + x) * 4;
      nimg.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      nimg.data[i + 3] = 255;
      const hv = at(x, y);
      const streak = 0.06 * Math.sin(x * 0.05 + Math.sin(y * 0.013) * 3) + 0.04 * Math.sin(x * 0.31 + y * 0.002);
      const r = Math.min(1, Math.max(0, 0.82 + Math.abs(hv - 0.5) * 0.6 + streak));
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = r * 255;
      rimg.data[i + 3] = 255;
    }
  }
  nctx.putImageData(nimg, 0, 0);
  rctx.putImageData(rimg, 0, 0);
  const normal = new CanvasTexture(nc);
  const rough = new CanvasTexture(rc);
  for (const t of [normal, rough]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(2, 2);
    t.anisotropy = 4;
  }
  return (panelMaps = { normal, rough });
}

// ---------- afterburner plume ----------
const PLUME_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const PLUME_FRAG = /* glsl */ `
  uniform float uGain;
  uniform float uHeat;
  uniform float uTime;
  uniform float uDiamonds;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float a = vUv.y;                       // 0 at the nozzle, 1 at the tip
    float face = abs(dot(normalize(vN), normalize(vV)));
    float edge = pow(face, 1.6);           // soft silhouette, dense centre
    vec3 core = vec3(0.70, 0.82, 1.0);     // white-blue at the nozzle
    vec3 body = vec3(1.0, 0.55, 0.16);
    vec3 tip = vec3(0.85, 0.18, 0.04);
    vec3 c = mix(core, body, smoothstep(0.0, 0.35 + 0.2 * uHeat, a));
    c = mix(c, tip, smoothstep(0.55, 1.0, a));
    float fade = pow(1.0 - a, 1.3);
    float flick = 0.88 + 0.12 * sin(uTime * 53.0 + a * 21.0) * sin(uTime * 31.0 - a * 9.0);
    float diam = 1.0 + uDiamonds * 0.9 * pow(0.5 + 0.5 * cos(a * 6.2831 * 4.0), 6.0) * (1.0 - a);
    float k = edge * fade * flick * diam * uGain;
    gl_FragColor = vec4(c * k, k);
  }`;

function plumeMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uGain: { value: 1 }, uHeat: { value: 0 }, uTime: { value: 0 }, uDiamonds: { value: 0 } },
    vertexShader: PLUME_VERT,
    fragmentShader: PLUME_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    fog: false,
  });
}

export class JetModel {
  readonly group = new Group();
  private flame: Group;
  private outerMat: ShaderMaterial;
  private coreMat: ShaderMaterial;
  private nozzleGlow: MeshBasicMaterial;
  private nozzleRing: MeshStandardMaterial;
  private nav: Mesh[] = [];
  private strobe: Mesh;
  private elevons: Group[] = [];
  private rudder: Group;
  private stabs: Group[] = [];
  private ctl = { roll: 0, pitch: 0, yaw: 0 };
  private gear = new Group();
  private gearLegs: Group[] = [];
  /** 0 = up, 1 = down */
  private gearPos = 0;
  /** 0..1: the afterburner flame builds and dies over a moment (SkyForge fighter) instead of snapping */
  private ab = 0;
  private lastT = 0;
  /** wingtip positions (local), for vapour trails */
  static readonly WINGTIPS: [V3, V3] = [[-5.2, 0, 3.4], [5.2, 0, 3.4]];

  /** hue (degrees) paints it like main.py's get_paint (main.py:898-903); none = the plain grey jet */
  constructor(hue: number | null = null) {
    const maps = makePanelMaps();
    const panel = (color: number, metalness: number, roughness: number, double = false): MeshStandardMaterial =>
      new MeshStandardMaterial({
        color,
        metalness,
        roughness,
        side: double ? DoubleSide : undefined,
        normalMap: maps?.normal ?? null,
        normalScale: new Vector2(0.55, 0.55),
        roughnessMap: maps?.rough ?? null,
        envMapIntensity: 1.0,
      });
    // paint is a coat over the alloy (dielectric): low metalness so it reads as paint, not chrome
    const skin = panel(hue === null ? 0x8c97a3 : hsv(hue, 0.5, 0.85), 0.22, 0.38);
    const dark = panel(hue === null ? 0x5d6670 : hsv(hue, 0.65, 0.45), 0.25, 0.45, true);
    const glass = new MeshPhysicalMaterial({
      color: 0x24324a,
      metalness: 0.1,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.6,
      emissive: 0x050b14,
    });
    const titanium = new MeshStandardMaterial({ color: 0x4a4440, metalness: 0.9, roughness: 0.35, side: DoubleSide });

    // fuselage: one smooth streamlined body (ogive nose -> widest at the cockpit / wing root -> taper to the
    // nozzle), slightly flattened like a real fighter's cross-section; replaces the cylinder + cone pair
    const profile = [
      [0, -10], [0.18, -9.6], [0.36, -9], [0.52, -8.2], [0.66, -7.2], [0.78, -6], [0.88, -4.6],
      [0.94, -3], [0.96, -1], [0.95, 1.5], [0.9, 3.5], [0.83, 5], [0.77, 6], [0.74, 6.05],
    ].map(([r, z]) => new Vector2(r, z));
    const fuselageGeo = new LatheGeometry(profile, 32);
    fuselageGeo.rotateX(Math.PI / 2); // lathe axis (y) -> flight axis (z), nose at -z
    fuselageGeo.scale(1.08, 0.88, 1);
    const fuselage = new Mesh(fuselageGeo, skin);
    this.group.add(fuselage);
    // dorsal spine behind the canopy
    const spine = new Mesh(new CylinderGeometry(0.22, 0.32, 6.5, 12), skin);
    spine.rotation.x = Math.PI / 2;
    spine.scale.set(1.4, 1, 1);
    spine.position.set(0, 0.72, -0.4);
    this.group.add(spine);
    const canopy = new Mesh(new SphereGeometry(0.6, 24, 16), glass);
    canopy.scale.set(1, 0.8, 2.4);
    canopy.position.set(0, 0.7, -4.2);
    this.group.add(canopy);

    // delta wings, fin and tailplane, with moving control surfaces: elevons along each wing's trailing edge
    // (roll + pitch), a rudder on the fin (yaw), all-moving tailplane halves (pitch). Each surface turns about
    // its hinge line; the fixed parts leave the surface's strip open, so nothing overlaps.
    const zTE = (x: number): number => 3.4 + ((Math.abs(x) - 5.2) / -4.6) * 0.6; // wing trailing edge
    for (const side of [-1, 1]) {
      const A: V3 = [0.6 * side, 0, -3];
      const T: V3 = [5.2 * side, 0, 3.4];
      const E1: V3 = [4.8 * side, 0, zTE(4.8)];
      const H1: V3 = [4.8 * side, 0, zTE(4.8) - 0.75];
      const H2: V3 = [0.6 * side, 0, zTE(0.6) - 0.75];
      const R: V3 = [0.6 * side, 0, zTE(0.6)];
      this.group.add(new Mesh(tri([...H1, ...E1, ...T, ...H1, ...T, ...A, ...H1, ...A, ...H2]), dark));
      this.elevons.push(this.hinged(H1, H2, [E1, R], dark));
    }
    const F1: V3 = [0, 0.6, 2.5];
    const F2: V3 = [0, 4.2, 5.8];
    const F3: V3 = [0, 0.6, 6];
    const finTE = (y: number): number => 5.8 + ((4.2 - y) / 3.6) * 0.2;
    const Et: V3 = [0, 3.8, finTE(3.8)];
    const Eb: V3 = [0, 0.8, finTE(0.8)];
    const Ht: V3 = [0, 3.8, finTE(3.8) - 0.6];
    const Hb: V3 = [0, 0.8, finTE(0.8) - 0.6];
    this.group.add(new Mesh(tri([...Ht, ...Et, ...F2, ...Ht, ...F2, ...F1, ...Ht, ...F1, ...Hb, ...Hb, ...F1, ...F3, ...Hb, ...F3, ...Eb], 2, 1), dark));
    this.rudder = this.hinged(Hb, Ht, [Eb, Et], dark, 2, 1);
    for (const side of [-1, 1]) {
      // tailplane half pivoting about a spanwise axis at z = 5.3
      const pivot = new Group();
      pivot.position.set(0, 0, 5.3);
      pivot.add(new Mesh(tri([0.5 * side, 0, 4.4 - 5.3, 2.6 * side, 0, 6.3 - 5.3, 0.5 * side, 0, 6.3 - 5.3]), dark));
      this.group.add(pivot);
      this.stabs.push(pivot);
    }

    // engine nozzle: titanium petals ring, a heat-tinted lip and the glowing turbine face inside
    const nozzle = new Mesh(new CylinderGeometry(0.7, 0.77, 0.9, 24, 1, true), titanium);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.z = 6.4;
    this.group.add(nozzle);
    this.nozzleRing = new MeshStandardMaterial({ color: 0x3a302a, metalness: 0.85, roughness: 0.4, emissive: 0xff5a1e, emissiveIntensity: 0, side: DoubleSide });
    const lip = new Mesh(new CylinderGeometry(0.71, 0.71, 0.18, 24, 1, true), this.nozzleRing);
    lip.rotation.x = Math.PI / 2;
    lip.position.z = 6.8;
    this.group.add(lip);
    this.nozzleGlow = new MeshBasicMaterial({ color: 0xff8a3a, fog: false });
    const face = new Mesh(new CircleGeometry(0.68, 24), this.nozzleGlow);
    face.position.z = 6.3; // faces +Z (backwards)
    this.group.add(face);

    // plume: a wide soft outer cone and a short hot inner core, tips pointing backwards (+Z)
    this.flame = new Group();
    this.outerMat = plumeMaterial();
    this.coreMat = plumeMaterial();
    const outer = new Mesh(new ConeGeometry(0.7, 4, 24, 1, true), this.outerMat);
    const core = new Mesh(new ConeGeometry(0.4, 2.6, 24, 1, true), this.coreMat);
    for (const m of [outer, core]) {
      m.rotation.x = Math.PI / 2;
      m.frustumCulled = false;
    }
    outer.position.z = 2; // base at the nozzle (z = 0 of the flame group)
    core.position.z = 1.3;
    this.flame.add(outer, core);
    this.flame.position.z = 6.85;
    this.group.add(this.flame);

    // navigation lights, shown at night: red port wingtip, green starboard, white tail strobe (main.py:2522-2528)
    const lamp = (hex: number, x: number, y: number, z: number): Mesh => {
      const m = new MeshBasicMaterial({ color: hex });
      m.color.multiplyScalar(1.4);
      const s = new Mesh(new SphereGeometry(0.25, 8, 6), m);
      s.position.set(x, y, z);
      s.visible = false;
      this.group.add(s);
      return s;
    };
    this.nav.push(lamp(0xff3228, -5.2, 0.1, 3.4), lamp(0x28ff5a, 5.2, 0.1, 3.4));
    this.strobe = lamp(0xffffff, 0, 4.3, 5.8);

    // landing gear (SkyForge fighter): nose leg + two main legs with wheels; folds up into the body when raised.
    // Wheels touch at y = -GEAR_H (2.3 m below the centre).
    const gearMat = new MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.7, metalness: 0.3 });
    const strutMat = new MeshStandardMaterial({ color: 0xb8bcc0, roughness: 0.4, metalness: 0.8 });
    const leg = (x: number, z: number, len: number, r: number): Group => {
      const g = new Group();
      g.position.set(x, -0.75, z);
      const strut = new Mesh(new CylinderGeometry(0.09, 0.11, len, 8), strutMat);
      strut.position.y = -len / 2;
      const wheel = new Mesh(new CylinderGeometry(r, r, 0.28, 16), gearMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.y = -len;
      g.add(strut, wheel);
      this.gear.add(g);
      return g;
    };
    this.gearLegs.push(leg(0, -5.6, 1.25, 0.3), leg(-1.4, 1.2, 1.2, 0.35), leg(1.4, 1.2, 1.2, 0.35));
    this.gear.visible = false;
    this.group.add(this.gear);
  }

  /** a control surface: quad from hinge line (h0 -> h1) to its trailing edge (e0, e1), turning about the hinge */
  private hinged(h0: V3, h1: V3, [e0, e1]: [V3, V3], mat: MeshStandardMaterial, ua = 0, va = 2): Group {
    const g = new Group();
    g.position.set(h0[0], h0[1], h0[2]);
    const rel = (p: V3): V3 => [p[0] - h0[0], p[1] - h0[1], p[2] - h0[2]];
    const a = rel(h0), b = rel(h1), c = rel(e1), d = rel(e0);
    g.add(new Mesh(tri([...a, ...d, ...c, ...a, ...c, ...b], ua, va), mat));
    g.userData.axis = new Vector3(b[0], b[1], b[2]).normalize();
    this.group.add(g);
    return g;
  }

  /** stick inputs (-1..1; pitch + = pull, roll + = right, yaw + = right): surfaces follow smoothly */
  setControls(roll: number, pitch: number, yaw: number, dt: number): void {
    const k = Math.min(1, dt * 10);
    this.ctl.roll += (roll - this.ctl.roll) * k;
    this.ctl.pitch += (pitch - this.ctl.pitch) * k;
    this.ctl.yaw += (yaw - this.ctl.yaw) * k;
    const D = Math.PI / 180;
    const { roll: r, pitch: p, yaw: y } = this.ctl;
    // positive = trailing edge down. Pull = both up; roll right = left elevon down, right elevon up
    const left = (-p * 12 + r * 14) * D;
    const right = (-p * 12 - r * 14) * D;
    // left hinge axis points +x, right -x: a positive turn about +x moves a trailing edge (+z) down
    this.elevons[0].quaternion.setFromAxisAngle(this.elevons[0].userData.axis as Vector3, left);
    this.elevons[1].quaternion.setFromAxisAngle(this.elevons[1].userData.axis as Vector3, -right);
    this.rudder.quaternion.setFromAxisAngle(this.rudder.userData.axis as Vector3, y * 18 * D);
    for (const s of this.stabs) s.rotation.x = -p * 14 * D;
  }

  /** landing gear: down or up, moving over about 2 s */
  setGear(down: boolean, dt: number): void {
    this.gearPos += Math.max(-dt / 2, Math.min(dt / 2, (down ? 1 : 0) - this.gearPos));
    this.gear.visible = this.gearPos > 0.02;
    // each leg swings forward up into the body (about its top)
    for (const g of this.gearLegs) g.rotation.x = (1 - this.gearPos) * (Math.PI / 2);
  }

  setNight(night: boolean, frame: number): void {
    for (const n of this.nav) n.visible = night;
    this.strobe.visible = night && frame % 60 < 5; // main.py:2527
  }

  /** 0 = engine idle glow, 1 = full afterburner plume */
  setFlame(throttle: number, afterburner: boolean, t: number): void {
    const dt = Math.min(0.1, Math.max(0, t - this.lastT));
    this.lastT = t;
    // lights in about 0.3 s, dies in about 0.5 s
    this.ab += ((afterburner ? 1 : 0) - this.ab) * Math.min(1, dt * (afterburner ? 7 : 4));
    const b = this.ab;
    const mix = (dry: number, wet: number): number => dry + (wet - dry) * b;
    const len = mix(0.25 + 0.35 * throttle, 1.6 + 0.08 * Math.sin(t * 40));
    const heat = mix(0.15 + 0.35 * throttle, 1);
    const wide = mix(0.85, 1.05);
    this.flame.scale.set(wide, wide, len);
    const ou = this.outerMat.uniforms;
    const cu = this.coreMat.uniforms;
    ou.uTime.value = cu.uTime.value = t;
    ou.uHeat.value = cu.uHeat.value = heat;
    ou.uGain.value = mix(0.5 + 0.9 * throttle, 1.4);
    cu.uGain.value = mix(1.2 + 1.6 * throttle, 2.8);
    ou.uDiamonds.value = 0;
    cu.uDiamonds.value = b * b; // shock diamonds only in a strong afterburner flame
    // turbine face and nozzle lip glow with the heat (HDR: blooms)
    this.nozzleGlow.color.setHex(b > 0.5 ? 0xffb070 : 0xff7a36).multiplyScalar(mix(1 + 1.5 * throttle, 4));
    this.nozzleRing.emissiveIntensity = mix(0.2 + 0.5 * throttle, 1.6);
  }
}
