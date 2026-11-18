// Terrain: one grid mesh that follows the jet; heights from Height.ts (main.py's map). Inside the map the ground
// shows main.py's painted tiles (MapTexture); beyond it, their mirror image (the country carries on to the horizon). Night: the ground darkened to
// moonlight (main.py:39 NIGHT_SHADE) with every main.py light added on top (main.py:2413-2415).
import { BufferAttribute, BufferGeometry, Color, Mesh, ShaderMaterial, type Texture, UniformsLib, UniformsUtils, Vector3 } from 'three';
import { PX_M, WORLD_H_PX, WORLD_W_PX } from '../config';
import { heightAt, noise } from './Height';

/** the drawn terrain surface at (x, z): the grid's triangles between heightAt samples (things laid on it, e.g.
 * runways, follow exactly what is drawn, not the smoother heightAt between grid points) */
export function surfaceY(x: number, z: number): number {
  const gx = x / CELL;
  const gz = z / CELL;
  const c = Math.floor(gx);
  const r = Math.floor(gz);
  const fx = gx - c;
  const fz = gz - r;
  const a = heightAt(c * CELL, r * CELL);
  const b = heightAt((c + 1) * CELL, r * CELL);
  const d = heightAt(c * CELL, (r + 1) * CELL);
  if (fx + fz <= 1) return a + (b - a) * fx + (d - a) * fz;
  const e = heightAt((c + 1) * CELL, (r + 1) * CELL);
  return e + (d - e) * (1 - fx) + (b - e) * (1 - fz);
}

export { heightAt } from './Height';

const SIZE = 90000; // m, side of the terrain mesh
let SEG = 384; // grid cells per side (234 m); 256 on phones
let CELL = SIZE / SEG;
/** grid detail, set before the terrain is built (phones get a lighter grid) */
export function setTerrainDetail(seg: number): void {
  SEG = seg;
  CELL = SIZE / SEG;
}
const RECENTER = SIZE / 8; // rebuild once the jet is this far from the centre
const ROWS_PER_FRAME = 24;

const vertexShader = /* glsl */ `
  #include <common>
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec2 vWorld;
  varying float vViewZ;
  varying float vWorldY;
  #include <fog_pars_vertex>
  #include <shadowmap_pars_vertex>
  void main() {
    vColor = color;
    vNormal = normal;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    vWorldY = world.y;
    vec4 mvPosition = viewMatrix * world;
    vViewZ = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    // sun shadow coordinates (cascades, fx/Shadows.ts)
    vec4 worldPosition = world;
    vec3 transformedNormal = normalMatrix * normal;
    #include <shadowmap_vertex>
    #include <fog_vertex>
  }`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform float uNightMix;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyLight;
  uniform vec3 uGroundLight;
  uniform vec2 uMapSize; // metres
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec2 vWorld;
  varying float vViewZ;
  varying float vWorldY;
  uniform vec2 CSM_cascades[3];
  uniform float cameraNear;
  uniform float shadowFar;
  #include <common>
  #include <packing>
  #include <fog_pars_fragment>
  #include <shadowmap_pars_fragment>
  /** sun shadow from the cascade this fragment's view depth falls in (1 = lit) */
  float sunShadow() {
    float s = 1.0;
    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
      float ld = vViewZ / (shadowFar - cameraNear);
      DirectionalLightShadow dls;
      #pragma unroll_loop_start
      for (int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i++) {
        dls = directionalLightShadows[ i ];
        if (ld >= CSM_cascades[ i ].x && ld < CSM_cascades[ i ].y)
          s = getShadow(directionalShadowMap[ i ], dls.shadowMapSize, dls.shadowIntensity, dls.shadowBias, dls.shadowRadius, vDirectionalShadowCoord[ i ]);
      }
      #pragma unroll_loop_end
    #endif
    return s;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  // ---- procedural detail (no texture downloads): value noise, fbm, and its slope for bump normals ----
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm3(vec2 p) {
    return vnoise(p) * 0.55 + vnoise(p * 2.07 + 13.1) * 0.3 + vnoise(p * 4.13 - 7.7) * 0.15;
  }
  /** gradient of fbm3 at p (finite differences), for detail normals */
  vec2 fbmSlope(vec2 p, float e) {
    float c = fbm3(p);
    return vec2(fbm3(p + vec2(e, 0.0)) - c, fbm3(p + vec2(0.0, e)) - c) / e;
  }
  void main() {
    vec2 uv = vWorld / uMapSize + 0.5;
    vec3 albedo = vColor;
    float inMap = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    vec3 lights = vec3(0.0);
    if (uv.x < 0.0) {
      albedo = vec3(0.0048, 0.0159, 0.0782); // the ocean goes on (main.py 14,34,78)
    } else {
      // inside the map: main.py's painted tiles; beyond it the same tiles mirrored (matches Height.ts mirror())
      vec2 uvm = 1.0 - abs(mod(uv, 2.0) - 1.0);
      albedo = texture2D(uDay, uvm).rgb;
      lights = texture2D(uNight, uvm).rgb * mix(0.5, 1.0, inMap);
    }
    vec3 n = normalize(vNormal);
    float h = vWorldY;
    float land = step(1.5, h);
    // distance fades: micro detail only near the camera (no shimmer or tiling seen from altitude), macro always
    float nearFade = 1.0 - smoothstep(250.0, 3500.0, vViewZ);
    float midFade = 1.0 - smoothstep(2000.0, 16000.0, vViewZ);
    // macro variation over km: breaks up big flat colour areas seen from 35,000 ft
    float macro = fbm3(vWorld / 2600.0);
    albedo *= mix(1.0, 0.86 + 0.28 * macro, land);
    // splat weights: grass where the ground is green, dirt where it is brown/sand, rock on steep or high ground,
    // snow above the snow line on the flatter faces (noisy edge)
    float green = clamp((albedo.g - max(albedo.r, albedo.b)) * 12.0, 0.0, 1.0);
    float slope = 1.0 - n.y;
    float mountain = smoothstep(650.0, 1100.0, h);
    float rockW = clamp(smoothstep(0.1, 0.28, slope) * smoothstep(300.0, 700.0, h) + smoothstep(1500.0, 2100.0, h), 0.0, 1.0) * land;
    float snowLine = 2650.0 + (fbm3(vWorld / 900.0) - 0.5) * 600.0;
    float snowW = smoothstep(snowLine - 120.0, snowLine + 120.0, h) * smoothstep(0.08, 0.22, n.y - 0.6 + 0.3) * land;
    // micro detail: grass tufts / dirt patches (8 m and 1.5 m), mid detail 60 m
    float micro = fbm3(vWorld / 7.0) * 0.6 + vnoise(vWorld / 1.6) * 0.4;
    float mid = fbm3(vWorld / 60.0);
    vec3 grassTint = mix(vec3(0.62, 0.72, 0.45), vec3(1.18, 1.12, 0.88), micro);
    vec3 dirtTint = mix(vec3(0.85, 0.8, 0.72), vec3(1.1, 1.04, 0.95), micro);
    vec3 tint = mix(dirtTint, grassTint, green);
    albedo *= mix(vec3(1.0), tint, nearFade * land);
    albedo *= mix(1.0, 0.9 + 0.2 * mid, midFade * land);
    // dirt patches in grassland (worn fields), fading in near the camera
    float patchN = smoothstep(0.62, 0.75, fbm3(vWorld / 35.0)) * green * midFade;
    albedo = mix(albedo, albedo * vec3(1.35, 1.0, 0.7), patchN * 0.5 * land);
    // mountains: stratified rock (bands along the height + noise) replaces the painted faceted faces
    float strata = (0.5 + 0.5 * sin(h / 37.0 + fbm3(vWorld / 210.0) * 9.0)) * 0.5 + fbm3(vWorld / 45.0) * 0.5;
    vec3 rock = mix(vec3(0.075, 0.068, 0.058), vec3(0.16, 0.15, 0.135), strata * 0.6 + micro * 0.4 * nearFade + mid * 0.3);
    albedo = mix(albedo, rock, rockW * max(mountain, smoothstep(0.18, 0.35, slope)));
    vec3 snow = vec3(0.5, 0.53, 0.58) * (0.9 + 0.1 * micro);
    albedo = mix(albedo, snow, snowW);
    // detail normals: soft bumps on grass/dirt, cliff faces on rock (fade with distance)
    vec2 g1 = fbmSlope(vWorld / 9.0, 0.35) / 9.0;
    vec2 g2 = fbmSlope(vWorld / 120.0, 0.35) / 120.0;
    float bump = (0.6 + 2.5 * rockW) * nearFade;
    float cliff = (12.0 + 40.0 * rockW) * midFade;
    n = normalize(n + vec3(-g1.x, 0.0, -g1.y) * bump * 3.0 + vec3(-g2.x, 0.0, -g2.y) * cliff * land);
    vec3 light = uSunColor * max(dot(n, uSunDir), 0.0) * sunShadow() + mix(uGroundLight, uSkyLight, n.y * 0.5 + 0.5);
    vec3 col = albedo * light + lights * uNightMix * 1.8;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }`;

export class Terrain {
  readonly mesh: Mesh;
  readonly material: ShaderMaterial;
  private geo: BufferGeometry;
  private pos: BufferAttribute;
  private col: BufferAttribute;
  private stagingY: Float32Array;
  private stagingC: Float32Array;
  private centerX = 0;
  private centerZ = 0;
  private jobX = 0;
  private jobZ = 0;
  private jobRow = -1;

  constructor(day: Texture, night: Texture) {
    const n = SEG + 1;
    const positions = new Float32Array(n * n * 3);
    const colors = new Float32Array(n * n * 3);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const i = (r * n + c) * 3;
        positions[i] = -SIZE / 2 + c * CELL;
        positions[i + 2] = -SIZE / 2 + r * CELL;
      }
    }
    const index = new Uint32Array(SEG * SEG * 6);
    let k = 0;
    for (let r = 0; r < SEG; r++) {
      for (let c = 0; c < SEG; c++) {
        const a = r * n + c;
        const b = a + 1;
        const d = a + n;
        const e = d + 1;
        index[k++] = a;
        index[k++] = d;
        index[k++] = b;
        index[k++] = b;
        index[k++] = d;
        index[k++] = e;
      }
    }
    this.geo = new BufferGeometry();
    this.pos = new BufferAttribute(positions, 3);
    this.col = new BufferAttribute(colors, 3);
    this.geo.setAttribute('position', this.pos);
    this.geo.setAttribute('color', this.col);
    this.geo.setIndex(new BufferAttribute(index, 1));
    this.stagingY = new Float32Array(n * n);
    this.stagingC = new Float32Array(n * n * 3);
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      fog: true,
      lights: true, // receives the cascaded sun shadows
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        UniformsLib.lights,
        {
          uDay: { value: null },
          uNight: { value: null },
          uNightMix: { value: 0 },
          uSunDir: { value: new Vector3(0.5, 1, 0.3).normalize() },
          uSunColor: { value: new Color(1, 0.95, 0.85).multiplyScalar(1.6) },
          uSkyLight: { value: new Color(0.55, 0.62, 0.75) },
          uGroundLight: { value: new Color(0.2, 0.22, 0.16) },
          uMapSize: { value: { x: WORLD_W_PX * PX_M, y: WORLD_H_PX * PX_M } },
        },
      ]),
    });
    this.material.uniforms.uDay.value = day;
    this.material.uniforms.uNight.value = night;
    this.mesh = new Mesh(this.geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    this.buildNow(0, 0);
  }

  /** Call once per frame with the jet position. */
  follow(x: number, z: number): void {
    if (this.jobRow < 0) {
      if (Math.abs(x - this.centerX) > RECENTER || Math.abs(z - this.centerZ) > RECENTER) {
        this.jobX = Math.round(x / CELL) * CELL; // snap to the grid: vertices stay on the same world points
        this.jobZ = Math.round(z / CELL) * CELL;
        this.jobRow = 0;
      }
      return;
    }
    const end = Math.min(SEG + 1, this.jobRow + ROWS_PER_FRAME);
    this.fillRows(this.jobX, this.jobZ, this.jobRow, end);
    this.jobRow = end;
    if (end >= SEG + 1) {
      this.jobRow = -1;
      this.swap(this.jobX, this.jobZ);
    }
  }

  /** Jump straight to a new centre (start / restart). */
  snapTo(x: number, z: number): void {
    this.jobRow = -1;
    this.buildNow(Math.round(x / CELL) * CELL, Math.round(z / CELL) * CELL);
  }

  private buildNow(cx: number, cz: number): void {
    this.fillRows(cx, cz, 0, SEG + 1);
    this.swap(cx, cz);
  }

  private fillRows(cx: number, cz: number, r0: number, r1: number): void {
    const n = SEG + 1;
    const ys = this.stagingY;
    const cs = this.stagingC;
    for (let r = r0; r < r1; r++) {
      const wz = cz - SIZE / 2 + r * CELL;
      for (let c = 0; c < n; c++) {
        const wx = cx - SIZE / 2 + c * CELL;
        const h = heightAt(wx, wz);
        const i = r * n + c;
        ys[i] = h;
        const slope = Math.abs(heightAt(wx + CELL, wz) - h) / CELL;
        groundColor(h, slope, noise(wx / 700, wz / 700), cs, i * 3);
      }
    }
  }

  private swap(cx: number, cz: number): void {
    const n = SEG + 1;
    const p = this.pos.array as Float32Array;
    const c = this.col.array as Float32Array;
    for (let i = 0; i < n * n; i++) p[i * 3 + 1] = this.stagingY[i];
    c.set(this.stagingC);
    this.pos.needsUpdate = true;
    this.col.needsUpdate = true;
    this.geo.computeVertexNormals();
    this.mesh.position.set(cx, 0, cz);
    this.centerX = cx;
    this.centerZ = cz;
  }
}

/** colours beyond main.py's map (linear RGB) */
function groundColor(h: number, slope: number, jitter: number, out: Float32Array, o: number): void {
  let r: number, g: number, b: number;
  if (h <= 0.5) {
    r = 0.005; g = 0.016; b = 0.078; // sea
  } else if (slope > 0.5 || h > 2600) {
    r = 0.1; g = 0.09; b = 0.07; // rock
  } else {
    r = 0.045; g = 0.15; b = 0.025; // grassland, main.py:520 (60,108,42)
  }
  const j = 0.85 + jitter * 0.3;
  out[o] = r * j;
  out[o + 1] = g * j;
  out[o + 2] = b * j;
}
