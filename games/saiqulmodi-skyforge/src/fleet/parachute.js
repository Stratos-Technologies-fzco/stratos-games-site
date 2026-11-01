import * as THREE from 'three';

export function createParachuteRig() {
  const rig = new THREE.Group();
  rig.name = "pilot_parachute_rig";

  // 1. Hemispherical Parachute Canopy (Orange/White survival colors)
  const canopyGeo = new THREE.SphereGeometry(2.4, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    roughness: 0.6,
    side: THREE.DoubleSide
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 3.8, 0);
  rig.add(canopy);

  // 2. Suspension Lines / Rigging Cords
  const cordMat = new THREE.LineBasicMaterial({ color: 0xdddddd });
  const cordCount = 8;
  const radius = 2.3;

  for (let i = 0; i < cordCount; i++) {
    const angle = (i / cordCount) * Math.PI * 2;
    const rimX = Math.cos(angle) * radius;
    const rimZ = Math.sin(angle) * radius;

    const points = [
      new THREE.Vector3(rimX, 3.8, rimZ),
      new THREE.Vector3(0, 0.9, 0) // Connects to pilot harness
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const cordLine = new THREE.Line(lineGeo, cordMat);
    rig.add(cordLine);
  }

  return rig;
}
