// Post-processing: ambient occlusion (GTAO: contact shadows under wings, pylons, between buildings, in valleys),
// bloom on the bright things only (afterburner, missile motors, flares, blasts, night lights, sun glare) at half
// resolution, then a speed pass (subtle radial motion blur toward the screen edges and speed lines at Mach speed,
// plus heat shimmer behind the jet's nozzle), then the output pass (ACES tone mapping + sRGB).
import { type Camera, type Scene, Vector2, type WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const DAY_STRENGTH = 0.55;
const NIGHT_STRENGTH = 0.9;

const SpeedShader = {
  uniforms: {
    tDiffuse: { value: null },
    uBlur: { value: 0 },
    uLines: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uHeat: { value: 0 },
    uHeatPos: { value: new Vector2(0.5, 0.5) },
    uHeatDir: { value: new Vector2(0, -0.1) },
    uHeatWidth: { value: 0.02 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uBlur;
    uniform float uLines;
    uniform float uTime;
    uniform float uAspect;
    uniform float uHeat;
    uniform vec2 uHeatPos;
    uniform vec2 uHeatDir;
    uniform float uHeatWidth;
    varying vec2 vUv;
    float hash1(float n) { return fract(sin(n * 91.345) * 47453.5453); }
    void main() {
      vec2 uv = vUv;
      // heat shimmer: a widening capsule from the nozzle along the plume on screen
      if (uHeat > 0.001) {
        vec2 p = (uv - uHeatPos) * vec2(uAspect, 1.0);
        vec2 d = uHeatDir * vec2(uAspect, 1.0);
        float L = max(length(d), 1e-4);
        vec2 dn = d / L;
        float t = clamp(dot(p, dn) / L, 0.0, 1.0);
        float dist = length(p - dn * t * L);
        float w = uHeatWidth * (0.7 + 1.6 * t);
        float m = smoothstep(w, 0.0, dist) * smoothstep(0.0, 0.06, t) * (1.0 - t) * uHeat;
        vec2 wob = vec2(sin(uv.y * 210.0 + uTime * 38.0) + sin(uv.y * 97.0 - uTime * 23.0),
                        cos(uv.x * 190.0 - uTime * 41.0) + cos(uv.x * 83.0 + uTime * 19.0));
        uv += wob * 0.0012 * m;
      }
      vec4 col = texture2D(tDiffuse, uv);
      // motion blur: samples toward the centre, none in the middle (the jet stays sharp), more at the edges
      vec2 toC = uv - 0.5;
      float r = length(toC * vec2(uAspect, 1.0));
      float k = uBlur * smoothstep(0.18, 0.75, r);
      if (k > 0.002) {
        vec4 acc = col;
        for (int i = 1; i < 7; i++) acc += texture2D(tDiffuse, uv - toC * k * 0.022 * float(i));
        col = acc / 7.0;
      }
      // speed lines: thin streaks rushing outward near the edges
      if (uLines > 0.002) {
        float ang = atan(toC.y, toC.x) / 6.28318 + 0.5;
        float cell = floor(ang * 140.0);
        float h = hash1(cell);
        float across = abs(fract(ang * 140.0) - 0.5) * 2.0;
        float streak = smoothstep(0.55, 0.0, fract(r * 2.2 - uTime * (1.6 + h * 1.4) + h * 7.0) - 0.0) ;
        float line = step(0.86, h) * smoothstep(0.35, 0.0, across) * streak * smoothstep(0.32, 0.8, r);
        col.rgb += vec3(0.9, 0.95, 1.0) * line * 0.22 * uLines;
      }
      gl_FragColor = col;
    }`,
};

export interface MotionState {
  blur: number;
  lines: number;
  time: number;
  heat: number;
  heatPos: Vector2;
  heatDir: Vector2;
  heatWidth: number;
}

export class PostFx {
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private ao: GTAOPass | null = null;
  private speed: ShaderPass;

  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera, lowEnd = false) {
    const size = renderer.getSize(new Vector2());
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    if (!lowEnd) {
      // world-sized AO: a few metres of reach, fading out with distance so the far ground isn't speckled
      this.ao = new GTAOPass(scene, camera, size.x, size.y);
      this.ao.output = GTAOPass.OUTPUT.Default;
      this.ao.blendIntensity = 0.8;
      this.ao.updateGtaoMaterial({ radius: 2.5, distanceExponent: 1.5, thickness: 2, scale: 1, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
      this.ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
      // only solid surfaces go into the AO depth/normal pass: no sky dome, clouds, trails, plumes or other
      // see-through effects (they would cast dark smears)
      const ao = this.ao as unknown as { _visibilityCache: Map<unknown, boolean>; scene: Scene; overrideVisibility: () => void };
      ao.overrideVisibility = function (): void {
        const cache = this._visibilityCache;
        this.scene.traverse((o) => {
          cache.set(o, o.visible);
          const m = (o as unknown as { material?: { transparent?: boolean; depthWrite?: boolean } }).material;
          const see = !!m && !Array.isArray(m) && (m.transparent || m.depthWrite === false);
          if ((o as unknown as { isPoints?: boolean }).isPoints || (o as unknown as { isLine?: boolean }).isLine || see) o.visible = false;
        });
      };
      this.composer.addPass(this.ao);
    }
    this.bloom = new UnrealBloomPass(new Vector2(size.x / 2, size.y / 2), DAY_STRENGTH, 0.45, 0.92);
    this.composer.addPass(this.bloom);
    this.speed = new ShaderPass(SpeedShader);
    this.speed.uniforms.uAspect.value = size.x / size.y;
    this.composer.addPass(this.speed);
    this.composer.addPass(new OutputPass());
  }

  setPixelRatio(r: number): void {
    this.composer.setPixelRatio(r);
  }

  /** the quality guard turns bloom off when the device struggles */
  setBloom(on: boolean): void {
    this.bloom.enabled = on;
  }

  /** the quality guard turns ambient occlusion off first (it re-renders the scene's normals) */
  setAO(on: boolean): void {
    if (this.ao) this.ao.enabled = on;
  }

  setNight(night: boolean): void {
    this.bloom.strength = night ? NIGHT_STRENGTH : DAY_STRENGTH;
  }

  /** speed blur / lines (0..1) and the nozzle heat shimmer, per frame */
  setMotion(m: MotionState): void {
    const u = this.speed.uniforms;
    u.uBlur.value = m.blur;
    u.uLines.value = m.lines;
    u.uTime.value = m.time;
    u.uHeat.value = m.heat;
    u.uHeatPos.value.copy(m.heatPos);
    u.uHeatDir.value.copy(m.heatDir);
    u.uHeatWidth.value = m.heatWidth;
    this.speed.enabled = m.blur > 0.002 || m.lines > 0.002 || m.heat > 0.001;
  }

  resize(w: number, h: number): void {
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.speed.uniforms.uAspect.value = w / h;
  }

  render(): void {
    this.composer.render();
  }
}
