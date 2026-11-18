// Sky dome with atmospheric scattering: Rayleigh (blue sky, reddened low sun) + Mie (the bright haze round the sun)
// over an exponential atmosphere, so the sky thins and deepens to indigo as the jet climbs to 35,000 ft, the horizon
// stays pale, and the sun has a disk and glare. At night: a navy sky with stars and a pale moon (main.py:1696 night
// haze: deep navy). The fog takes the same model's horizon colour, so the far ground melts into the sky.
// The same scattering function runs on the CPU (horizonColor) to colour the fog.
import { BackSide, Color, Fog, Mesh, ShaderMaterial, SphereGeometry, Vector3 } from 'three';

const NIGHT_ZENITH = new Color('#03050f');
const NIGHT_HORIZON = new Color('#1a2246'); // main.py:1697 (26,34,70)

// scattering constants (per metre) and scale heights
const BR = [5.8e-6, 13.5e-6, 33.1e-6];
const BM = 21e-6;
const HR = 8000;
const HM = 1200;
const SUN_E = 14; // sun irradiance in the shader's units (ACES tone mapping rolls it off)

/** Kasten-Young air mass from the cosine of the zenith angle (stays finite at the horizon) */
function airMass(mu: number): number {
  const m = Math.max(mu, 0);
  const zen = (Math.acos(m) * 180) / Math.PI;
  return 1 / (m + 0.15 * Math.pow(Math.max(93.885 - zen, 0.001), -1.253));
}

const GLSL_SCATTER = /* glsl */ `
  const vec3 BR = vec3(5.8e-6, 13.5e-6, 33.1e-6);
  const float BM = 21e-6;
  const float HR = 8000.0;
  const float HM = 1200.0;
  const float SUN_E = ${SUN_E.toFixed(1)};
  float airMass(float mu) {
    float m = max(mu, 0.0);
    float zen = degrees(acos(m));
    return 1.0 / (m + 0.15 * pow(max(93.885 - zen, 0.001), -1.253));
  }
  vec3 scatter(vec3 d, vec3 s, float alt) {
    float fr = exp(-alt / HR);
    float fm = exp(-alt / HM);
    float mv = airMass(d.y);
    float ms = airMass(s.y);
    vec3 tauV = BR * HR * fr * mv + BM * 1.1 * HM * fm * mv;
    vec3 tauS = BR * HR * fr * ms + BM * 1.1 * HM * fm * ms;
    vec3 sunT = exp(-tauS);                   // sunlight reaching the air: reddens when the sun is low
    float c = dot(d, s);
    float pR = 0.0596831 * (1.0 + c * c);     // Rayleigh phase
    const float g = 0.76;
    float pM = 0.0795775 * (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * c, 1.5); // Henyey-Greenstein
    vec3 b = BR + BM;
    vec3 inScatter = SUN_E * sunT * (BR * pR + BM * pM) / b * (1.0 - exp(-tauV));
    // a little multiple scattering so the shadowed sky is never black
    inScatter += SUN_E * 0.012 * vec3(0.35, 0.5, 0.8) * (1.0 - exp(-tauV)) * (0.4 + 0.6 * s.y);
    return inScatter;
  }`;

export class Sky {
  readonly mesh: Mesh;
  readonly fog = new Fog(0xbfd6ee, 16000, 42000);
  readonly sunDir = new Vector3(0.55, 0.62, 0.35).normalize();
  private mat: ShaderMaterial;
  private day = new Color();
  private tmp = new Color();
  private lastAlt = -1;

  constructor() {
    this.mat = new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uSunDir: { value: this.sunDir },
        uAlt: { value: 0 },
        uNight: { value: 0 },
        uNightZenith: { value: NIGHT_ZENITH },
        uNightHorizon: { value: NIGHT_HORIZON },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSunDir;
        uniform float uAlt;
        uniform float uNight;
        uniform vec3 uNightZenith;
        uniform vec3 uNightHorizon;
        varying vec3 vDir;
        ${GLSL_SCATTER}
        float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        void main() {
          vec3 d = normalize(vDir);
          vec3 s = normalize(uSunDir);
          vec3 dv = normalize(vec3(d.x, max(d.y, 0.0), d.z)); // below the horizon: the horizon haze
          vec3 day = scatter(dv, s, uAlt);
          // the sun disk (dimmed by the air it shines through) and its glare
          float mu = max(dot(d, s), 0.0);
          float ms = airMass(s.y);
          vec3 sunT = exp(-(BR * HR * exp(-uAlt / HR) * ms + BM * 1.1 * HM * exp(-uAlt / HM) * ms));
          day += sunT * (smoothstep(0.99955, 0.99975, mu) * 60.0 + pow(mu, 800.0) * 2.0) * step(0.0, d.y + 0.02);
          // night: navy gradient, stars, a pale moon where the sun was
          float t = clamp(d.y, 0.0, 1.0);
          vec3 night = mix(uNightHorizon, uNightZenith, pow(t, 0.5));
          if (d.y > 0.0) {
            vec3 cell = floor(d * 420.0);
            float st = step(0.9975, hash(cell));
            night += vec3(0.8, 0.85, 1.0) * st * (0.4 + 0.6 * hash(cell + 3.1)) * smoothstep(0.0, 0.15, d.y);
            night += vec3(0.75, 0.8, 0.9) * smoothstep(0.9990, 0.9994, mu) * 1.5;
          }
          gl_FragColor = vec4(mix(day, night, uNight), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new Mesh(new SphereGeometry(50000, 48, 24), this.mat);
    this.mesh.renderOrder = -1;
    this.mesh.frustumCulled = false;
  }

  /** the scattering model's horizon colour seen across the sun (CPU copy of the shader), linear RGB */
  horizonColor(alt: number, out: Color): Color {
    const s = this.sunDir;
    const fr = Math.exp(-alt / HR);
    const fm = Math.exp(-alt / HM);
    const mv = airMass(0.03);
    const ms = airMass(s.y);
    const pR = 0.0596831; // cos = 0: looking 90 deg from the sun
    const g = 0.76;
    const pM = (0.0795775 * (1 - g * g)) / Math.pow(1 + g * g, 1.5);
    const rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const tauV = BR[i] * HR * fr * mv + BM * 1.1 * HM * fm * mv;
      const tauS = BR[i] * HR * fr * ms + BM * 1.1 * HM * fm * ms;
      const sunT = Math.exp(-tauS);
      const b = BR[i] + BM;
      rgb[i] = (SUN_E * sunT * (BR[i] * pR + BM * pM)) / b * (1 - Math.exp(-tauV));
      rgb[i] += SUN_E * 0.012 * [0.35, 0.5, 0.8][i] * (1 - Math.exp(-tauV)) * (0.4 + 0.6 * s.y);
    }
    return out.setRGB(rgb[0], rgb[1], rgb[2]);
  }

  update(camX: number, camY: number, camZ: number, night: number): void {
    const alt = Math.max(0, camY);
    this.mat.uniforms.uAlt.value = alt;
    this.mat.uniforms.uNight.value = night;
    if (Math.abs(alt - this.lastAlt) > 50 || night !== this.mat.userData.night) {
      this.lastAlt = alt;
      this.mat.userData.night = night;
      this.horizonColor(alt, this.day);
      this.fog.color.copy(this.day).lerp(this.tmp.copy(NIGHT_HORIZON), night);
    }
    this.mesh.position.set(camX, camY, camZ);
  }
}
