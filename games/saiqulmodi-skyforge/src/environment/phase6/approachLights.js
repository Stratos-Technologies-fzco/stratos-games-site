import * as THREE from 'three';

// MALSR (Medium-intensity Approach Light System with Runway alignment indicator lights), 2,400 ft long:
// a light bar every 200 ft (61 m) on stanchions past the threshold, a wide 1,000 ft crossbar, and
// sequenced flashers on the outer 1,000 ft that run towards the runway twice a second.
// thresholdZ: runway threshold; direction: +1 lights extend towards +Z (09L approach from the west),
// -1 towards -Z (27R approach from the east).
const STATION_M = 61;
const STATIONS = 12;
const STEADY_STATIONS = 7;   // out to 1,400 ft
const CROSSBAR_STATION = 5;  // 1,000 ft

export function createApproachLighting(scene, thresholdZ, direction = 1) {
  const group = new THREE.Group();
  group.name = `malsr_${direction > 0 ? '09L' : '27R'}`;

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.2, 1, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, STATIONS + 2);
  const dummy = new THREE.Object3D();

  const steady = [];
  const flasherPos = [];
  for (let i = 1; i <= STATIONS; i++) {
    const z = thresholdZ + direction * i * STATION_M;
    const h = 0.6 + i * 0.25;
    dummy.position.set(0, h / 2, z);
    dummy.scale.set(1, h, 1);
    dummy.updateMatrix();
    poles.setMatrixAt(i - 1, dummy.matrix);

    if (i <= STEADY_STATIONS) {
      for (let k = -2; k <= 2; k++) steady.push(k * 0.75, h, z); // 5-light bar
    }
    if (i === CROSSBAR_STATION) {
      [-1, 1].forEach((s) => {
        for (let k = 0; k < 4; k++) steady.push(s * (4.5 + k * 1.5), h, z);
        dummy.position.set(s * 7.5, h / 2, z);
        dummy.updateMatrix();
        poles.setMatrixAt(STATIONS + (s > 0 ? 1 : 0), dummy.matrix);
      });
    }
    if (i > STEADY_STATIONS) flasherPos.push(0, h + 0.4, z);
  }
  poles.instanceMatrix.needsUpdate = true;
  group.add(poles);

  const steadyGeo = new THREE.BufferGeometry();
  steadyGeo.setAttribute('position', new THREE.Float32BufferAttribute(steady, 3));
  group.add(new THREE.Points(steadyGeo, new THREE.PointsMaterial({ color: 0xfff6e0, size: 4, sizeAttenuation: false, toneMapped: false })));

  // Sequenced flashers (outermost fires first)
  const flashCount = flasherPos.length / 3;
  const flashColors = new Float32Array(flashCount * 3);
  const flashGeo = new THREE.BufferGeometry();
  flashGeo.setAttribute('position', new THREE.Float32BufferAttribute(flasherPos, 3));
  flashGeo.setAttribute('color', new THREE.BufferAttribute(flashColors, 3));
  group.add(new THREE.Points(flashGeo, new THREE.PointsMaterial({ size: 8, sizeAttenuation: false, vertexColors: true, toneMapped: false })));

  scene.add(group);

  return {
    group,
    update(timeMs) {
      const cycle = (timeMs % 500) / 500;           // 2 sequences per second
      const active = Math.floor(cycle * (flashCount + 2)); // short dark gap after the last flash
      for (let s = 0; s < flashCount; s++) {
        const firing = (flashCount - 1 - s) === active;
        const v = firing ? 1 : 0.05;
        flashColors[s * 3] = v; flashColors[s * 3 + 1] = v; flashColors[s * 3 + 2] = v;
      }
      flashGeo.attributes.color.needsUpdate = true;
    }
  };
}
