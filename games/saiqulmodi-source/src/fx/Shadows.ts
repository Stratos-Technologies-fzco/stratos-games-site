// Sun shadows with cascaded shadow maps (three's CSM): three cascades split along the view - 0-75 m (the jet you
// fly: wings and tail shade the fuselage, sharp), 75-720 m (wingmen, ground objects when low), 720 m-6 km (the
// ground under the jet, buildings, trees when low). Cascades snap to whole texels, so shadows don't shimmer.
// Every lit material takes part: the CSM shader chunk is switched on for all of them and its uniforms are shared.
// Also here: exponential height fog (haze that thickens toward the ground and blurs the horizon) replacing
// three's fog chunks for every material that has fog on.
import {
  type Color,
  Material,
  type Mesh,
  type Object3D,
  type PerspectiveCamera,
  type Scene,
  ShaderChunk,
  Vector2,
  type Vector3,
} from 'three';
import { CSM } from 'three/examples/jsm/csm/CSM.js';

const CASCADES = 3;
export const SHADOW_FAR = 6000; // m: past this no shadows (at 35,000 ft the ground is ~10 km away)
const SPLITS = [75 / SHADOW_FAR, 720 / SHADOW_FAR, 1];
/** per-cascade normal bias (m) and depth bias */
const NORMAL_BIAS = [0.04, 0.4, 3];
const DEPTH_BIAS = [-0.000004, -0.00002, -0.0001];

/** shared by every material: the cascade ranges, camera near, shadow far */
export const csmUniforms = {
  CSM_cascades: { value: [new Vector2(), new Vector2(), new Vector2()] },
  cameraNear: { value: 1 },
  shadowFar: { value: SHADOW_FAR },
};

// haze: extinction per metre at sea level, and how fast it thins with height (1 / scale height)
const HAZE_DENSITY = 1 / 32000;
const HAZE_FALLOFF = 1 / 2500;

function installHeightFog(): void {
  ShaderChunk.fog_pars_vertex = /* glsl */ `
#ifdef USE_FOG
  varying float vFogDepth;
  varying float vFogY;
#endif`;
  // world height of the vertex from the view-space position (view matrix is rotation + translation)
  ShaderChunk.fog_vertex = /* glsl */ `
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vFogY = ((mvPosition.xyz - viewMatrix[3].xyz) * mat3(viewMatrix)).y;
#endif`;
  ShaderChunk.fog_pars_fragment = /* glsl */ `
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying float vFogY;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`;
  // optical depth of an exponential atmosphere between the camera and the fragment, plus the distance fade
  // (fog near/far) so the terrain's far edge always melts into the sky
  ShaderChunk.fog_fragment = /* glsl */ `
#ifdef USE_FOG
  float fogCamY = max(cameraPosition.y, 0.0);
  float fogK = ${HAZE_FALLOFF.toExponential(6)} * (vFogY - fogCamY);
  float fogLine = abs(fogK) > 1e-4 ? (1.0 - exp(-fogK)) / fogK : 1.0;
  float fogOpt = ${HAZE_DENSITY.toExponential(6)} * exp(-${HAZE_FALLOFF.toExponential(6)} * fogCamY) * vFogDepth * fogLine;
  float fogFactor = 1.0 - exp(-max(fogOpt, 0.0));
  #ifdef FOG_EXP2
    fogFactor = max(fogFactor, 1.0 - exp(- fogDensity * fogDensity * vFogDepth * vFogDepth));
  #else
    fogFactor = max(fogFactor, smoothstep(fogNear, fogFar, vFogDepth));
  #endif
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif`;
}

export class SunShadows {
  readonly csm: CSM;
  private tick = 0;

  constructor(scene: Scene, camera: PerspectiveCamera, sunDir: Vector3, mapSize: number) {
    installHeightFog();
    this.csm = new CSM({
      camera,
      parent: scene,
      cascades: CASCADES,
      maxFar: SHADOW_FAR,
      mode: 'custom',
      customSplitsCallback: (_n: number, _near: number, _far: number, target: number[]) => {
        target.push(...SPLITS);
      },
      shadowMapSize: mapSize,
      lightDirection: sunDir.clone().negate(),
      lightIntensity: 2.2,
      lightNear: 1,
      lightFar: 30000,
      lightMargin: 8000, // casters up to 8 km toward the sun (the jet above the ground it shades)
    });
    this.csm.lights.forEach((l, i) => {
      l.shadow.normalBias = NORMAL_BIAS[i];
      l.shadow.bias = DEPTH_BIAS[i];
    });
    // CSM for every lit material: its chunk is guarded by USE_CSM / CSM_CASCADES defines; make them always on
    const on = (src: string): string =>
      src
        .replace(/defined\(\s*USE_CSM\s*\)/g, '1')
        .replace(/defined\(\s*CSM_CASCADES\s*\)/g, '1')
        .replace(/CSM_CASCADES/g, String(CASCADES));
    ShaderChunk.lights_fragment_begin = on(ShaderChunk.lights_fragment_begin);
    ShaderChunk.lights_pars_begin = on(ShaderChunk.lights_pars_begin);
    // ...and hand every material the shared uniforms (none of the game's materials sets its own hook)
    Material.prototype.onBeforeCompile = function (shader: { uniforms: Record<string, unknown> }): void {
      Object.assign(shader.uniforms, csmUniforms);
    };
    this.refreshBreaks(camera);
  }

  private refreshBreaks(camera: PerspectiveCamera): void {
    this.csm.getExtendedBreaks(csmUniforms.CSM_cascades.value);
    csmUniforms.cameraNear.value = camera.near;
    csmUniforms.shadowFar.value = Math.min(camera.far, SHADOW_FAR);
  }

  /** after the camera's aspect changes */
  resize(camera: PerspectiveCamera): void {
    this.csm.updateFrustums();
    this.refreshBreaks(camera);
  }

  /** the sun's colour and strength (day / moonlight) */
  setSun(color: Color, intensity: number): void {
    for (const l of this.csm.lights) {
      l.color.copy(color);
      l.intensity = intensity;
    }
  }

  /** shadows off = one plain sun: the other cascade lights are hidden, or the CSM chunk would add all three */
  setEnabled(on: boolean): void {
    this.csm.lights.forEach((l, i) => {
      l.castShadow = on;
      if (i > 0) l.visible = on;
    });
  }

  /** per frame: fit the cascades to the camera; every 30 frames mark new solid lit meshes as casters/receivers */
  update(scene: Object3D): void {
    this.csm.update();
    if (this.tick++ % 30 === 0) markShadowMeshes(scene);
  }
}

/** solid meshes with lit materials cast and receive; transparent ones (smoke, glass effects) don't */
export function markShadowMeshes(root: Object3D): void {
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh || m.userData.noShadow) return;
    const mat = m.material as Material & { isMeshStandardMaterial?: boolean; isMeshLambertMaterial?: boolean; isMeshPhongMaterial?: boolean };
    if (Array.isArray(mat) || mat.transparent) return;
    if (!(mat.isMeshStandardMaterial || mat.isMeshLambertMaterial || mat.isMeshPhongMaterial)) return;
    m.castShadow = true;
    m.receiveShadow = true;
  });
}
