// 110 cumulus clouds (main.py:176, 1354-1408): fields of small fair-weather cumulus or single bigger heaps,
// built from soft puffs (sunlit side white, far side grey), 6,000-28,000 ft, drifting with the wind
// (main.py:1389-1391, WIND * 0.25) and wrapping round the map. One instanced draw call, billboards in the shader.
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector2,
} from 'three';
import { FT, PX_M, pxToX, pyToZ, WORLD_H_PX as H, WORLD_W_PX as W } from '../config';

const CLOUD_COUNT = 20; // main.py:176 has 110; cut to 20 at the user's request (31-Oct)
const WIND_PX = [0.3, -0.1]; // main.py:97
const DRIFT_MPS = new Vector2(WIND_PX[0] * 0.25 * PX_M * 60, WIND_PX[1] * 0.25 * PX_M * 60); // main.py:1390, 18 m/s east
const MAX_PUFFS_PER_CELL = 8;

export class Clouds {
  readonly mesh: Mesh;
  private mat: ShaderMaterial;
  private drift = new Vector2();

  constructor() {
    let s = 4242; // main.py:1662 sky_rng seed
    const r = (): number => {
      s = (s + 0x6d2b79f5) | 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const U = (a: number, b: number): number => a + r() * (b - a);
    const gauss = (sigma: number): number => sigma * Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r());
    const offsets: number[] = [];
    const sizes: number[] = [];
    const shades: number[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const cx = U(0, W);
      const cy = U(0, H);
      const alt = U(6000, 28000) * FT; // main.py:1361
      const field = r() < 0.35; // main.py:1362
      const w = field ? U(160, 300) : U(90, 220);
      const h = w * U(0.55, 0.85);
      const cells = field ? Math.floor(U(4, 9)) : Math.floor(U(2, 5));
      for (let c = 0; c < cells; c++) {
        const size = field ? U(0.07, 0.12) * w : U(0.12, 0.2) * w;
        const ccx = U(size * 1.6, w - size * 1.6);
        const ccy = U(size * 1.6, h - size * 1.6);
        const n = Math.min(MAX_PUFFS_PER_CELL, Math.floor(size * 2.2) + 6);
        for (let k = 0; k < n; k++) {
          const dx = gauss(size * 0.3); // packed tighter than main.py's 0.5 / 0.4: one soft cloud, not scattered balls
          const dy = gauss(size * 0.25);
          const d = Math.hypot(dx / size, dy / size);
          if (d > 1.6) continue; // main.py:1374 no stray specks
          const rad = Math.max(6, size * U(0.4, 0.8) * Math.max(0.4, 1 - d * 0.45));
          const side = (dx + dy) / size; // main.py:1377 sun from the top left
          offsets.push(pxToX(cx + ccx + dx), alt + Math.abs(gauss(size * 0.35)) * PX_M - rad * 0.5, pyToZ(cy + ccy + dy));
          sizes.push(rad * PX_M * 4);
          shades.push(side < -0.25 ? 1 : side > 0.35 ? 0.35 : 0.7);
        }
      }
    }
    const geo = new InstancedBufferGeometry();
    const quad = new PlaneGeometry(2, 2);
    geo.index = quad.index;
    geo.setAttribute('position', quad.getAttribute('position'));
    geo.setAttribute('iOffset', new InstancedBufferAttribute(new Float32Array(offsets), 3));
    geo.setAttribute('iSize', new InstancedBufferAttribute(new Float32Array(sizes), 1));
    geo.setAttribute('iShade', new InstancedBufferAttribute(new Float32Array(shades), 1));
    geo.instanceCount = sizes.length;

    this.mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: true,
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uDrift: { value: new Vector2() },
          uMin: { value: new Vector2(pxToX(0), pyToZ(0)) },
          uSize: { value: new Vector2(W * PX_M, H * PX_M) },
          uLit: { value: new Color('#ffffff') }, // main.py:1340 puff tints
          uShade: { value: new Color('#c4ccdc') },
          uNight: { value: 0 },
        },
      ]),
      vertexShader: /* glsl */ `
        attribute vec3 iOffset;
        attribute float iSize;
        attribute float iShade;
        uniform vec2 uDrift;
        uniform vec2 uMin;
        uniform vec2 uSize;
        varying vec2 vUv;
        varying float vShade;
        varying float vNear;
        varying float vFar;
        #include <fog_pars_vertex>
        void main() {
          vec3 c = iOffset;
          c.x = uMin.x + mod(c.x - uMin.x + uDrift.x, uSize.x);
          c.z = uMin.y + mod(c.z - uMin.y + uDrift.y, uSize.y);
          vec4 mvPosition = viewMatrix * vec4(c, 1.0);
          mvPosition.xy += position.xy * iSize;
          vUv = position.xy;
          vShade = iShade;
          vNear = smoothstep(300.0, 1500.0, -mvPosition.z); // clouds never block the view: puffs within ~1.5 km of the camera fade out (user: clear viewing)
          vFar = 1.0 - smoothstep(6000.0, 14000.0, -mvPosition.z); // and far away: about one cloud in view (main.py:176)
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uLit;
        uniform vec3 uShade;
        uniform float uNight;
        varying vec2 vUv;
        varying float vShade;
        varying float vNear;
        varying float vFar;
        #include <fog_pars_fragment>
        void main() {
          // break the round edge with a little noise so puffs do not read as discs
          float ang = atan(vUv.y, vUv.x);
          float wob = 0.18 * sin(ang * 5.0 + vShade * 7.0) + 0.12 * sin(ang * 9.0 - vShade * 3.0);
          float r2 = dot(vUv, vUv) * (1.0 + wob);
          if (r2 > 1.0) discard;
          float a = pow(1.0 - r2, 2.6) * 0.28 * vNear * vFar; // soft edges // main.py:1349 dense middle, fading edge
          vec3 col = mix(uShade, uLit, vShade);
          col *= mix(vec3(1.0), vec3(0.07, 0.08, 0.13), uNight); // main.py:1386 moonlit blue-grey
          gl_FragColor = vec4(col, a);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
    });
    this.mesh = new Mesh(geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
  }

  update(simTime: number, night: number): void {
    this.drift.copy(DRIFT_MPS).multiplyScalar(simTime);
    this.mat.uniforms.uDrift.value.copy(this.drift);
    this.mat.uniforms.uNight.value = night;
  }
}
