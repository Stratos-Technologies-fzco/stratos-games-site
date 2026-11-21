// Wind for trees, bushes and grass. Plants are merged into big meshes (see worldView.ts), so the sway is done in the vertex shader:
// every plant vertex carries a weight (0 at the base, 1 at the top) and is pushed sideways by a moving wave. No per-plant objects, one extra draw call per area.
import * as THREE from 'three';

/** Shared by every plant material: time in seconds and strength (0 = still, used on Low quality and with Reduce motion). */
export const windUniforms = { uTime: { value: 0 }, uWind: { value: 1 } };

/**
 * Sway weight for each vertex of one plant, given the vertex heights. 0 at the base, rising to 1 at the top (squared, so the trunk stays put
 * and the crown moves). Small plants (grass, bushes) are scaled down so they do not sway as far as a tall tree.
 */
export function swayWeights(ys: ArrayLike<number>, out: Float32Array = new Float32Array(ys.length)): Float32Array {
  let min = Infinity, max = -Infinity; for (let i = 0; i < ys.length; i++) { if (ys[i] < min) min = ys[i]; if (ys[i] > max) max = ys[i]; }
  const h = max - min; if (!(h > 1e-4)) { out.fill(0); return out; }
  const scale = Math.min(1, Math.max(0.12, h / 5));
  for (let i = 0; i < ys.length; i++) { const t = (ys[i] - min) / h; out[i] = t * t * scale; }
  return out;
}

/** The scene's flat vertex-colour material plus the sway. Needs a `sway` vertex attribute. */
export function makeWindMaterial(base: THREE.MeshLambertMaterial): THREE.MeshLambertMaterial {
  const m = base.clone();
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime; shader.uniforms.uWind = windUniforms.uWind;
    shader.vertexShader = 'attribute float sway; uniform float uTime; uniform float uWind;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float ph = uTime * 1.7 + position.x * 0.09 + position.z * 0.07;
      float gust = 0.65 + 0.35 * sin(uTime * 0.35 + position.x * 0.02 + position.z * 0.015);
      transformed.x += (sin(ph) + 0.35 * sin(ph * 2.3 + 1.3)) * 0.3 * sway * uWind * gust;
      transformed.z += cos(ph * 0.9 + 0.7) * 0.2 * sway * uWind * gust;`);
  };
  m.customProgramCacheKey = () => 'plant-wind';
  return m;
}
