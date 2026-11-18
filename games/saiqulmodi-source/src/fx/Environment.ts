// Image-based lighting for the PBR jets: a small sky dome (blue zenith, pale horizon, earth below, a hot sun spot)
// pre-filtered once with PMREM and set as scene.environment, so metal panels reflect sky and ground and the
// canopy shows a sun glint. Built once at start (no texture download).
import { BackSide, Mesh, PMREMGenerator, Scene, ShaderMaterial, SphereGeometry, type Texture, type Vector3, type WebGLRenderer } from 'three';

export function makeSkyEnvironment(renderer: WebGLRenderer, sunDir: Vector3): Texture {
  const envScene = new Scene();
  const mat = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: { uSun: { value: sunDir.clone().normalize() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float up = clamp(d.y, 0.0, 1.0);
        vec3 sky = mix(vec3(0.78, 0.86, 0.95), vec3(0.22, 0.42, 0.85), pow(up, 0.6));
        vec3 ground = mix(vec3(0.42, 0.44, 0.40), vec3(0.16, 0.18, 0.13), clamp(-d.y * 3.0, 0.0, 1.0));
        vec3 c = d.y >= 0.0 ? sky : ground;
        float mu = max(dot(d, uSun), 0.0);
        c += vec3(1.0, 0.92, 0.8) * (pow(mu, 600.0) * 40.0 + pow(mu, 24.0) * 0.6);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  envScene.add(new Mesh(new SphereGeometry(100, 48, 24), mat));
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(envScene, 0, 0.1, 1000).texture;
  pmrem.dispose();
  mat.dispose();
  return tex;
}
