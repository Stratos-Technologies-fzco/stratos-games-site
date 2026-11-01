import * as THREE from 'three';

export function createSeatedPilot() {
  const pilotGroup = new THREE.Group();
  pilotGroup.name = "pilot_avatar";

  // Materials
  const suitMat = new THREE.MeshStandardMaterial({ color: 0x2e3d30, roughness: 0.8 }); // Olive flight suit
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x1f261f, roughness: 0.9 }); // G-suit harness
  const helmetMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3 }); // White composite helmet
  const visorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 }); // Tinted visor
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }); // Ejection seat

  // 1. Ejection Seat (ACES II style)
  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.12), seatMat);
  seatBack.position.set(0, 0.45, -0.2);
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), seatMat);
  seatBase.position.set(0, 0.06, 0.05);
  const headRest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.15), seatMat);
  headRest.position.set(0, 0.95, -0.2);
  pilotGroup.add(seatBack, seatBase, headRest);

  // 2. Torso & Harness
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.28), suitMat);
  torso.position.set(0, 0.42, -0.05);
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.3), vestMat);
  vest.position.set(0, 0.42, -0.05);
  pilotGroup.add(torso, vest);

  // 3. Legs (Seated angled posture toward rudder pedals)
  const thighGeo = new THREE.BoxGeometry(0.16, 0.16, 0.45);
  const leftThigh = new THREE.Mesh(thighGeo, suitMat);
  leftThigh.position.set(-0.14, 0.16, 0.15);
  const rightThigh = new THREE.Mesh(thighGeo, suitMat);
  rightThigh.position.set(0.14, 0.16, 0.15);

  const shinGeo = new THREE.BoxGeometry(0.14, 0.45, 0.14);
  const leftShin = new THREE.Mesh(shinGeo, suitMat);
  leftShin.position.set(-0.14, -0.05, 0.35);
  leftShin.rotation.x = -0.3;
  const rightShin = new THREE.Mesh(shinGeo, suitMat);
  rightShin.position.set(0.14, -0.05, 0.35);
  rightShin.rotation.x = -0.3;

  pilotGroup.add(leftThigh, rightThigh, leftShin, rightShin);

  // 4. Arms & Hands (Right on flight stick, Left on throttle)
  const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8);
  const rightArm = new THREE.Mesh(armGeo, suitMat);
  rightArm.rotation.set(0.8, 0, -0.3);
  rightArm.position.set(0.24, 0.35, 0.08);

  const leftArm = new THREE.Mesh(armGeo, suitMat);
  leftArm.rotation.set(0.7, 0, 0.3);
  leftArm.position.set(-0.24, 0.35, 0.08);

  pilotGroup.add(rightArm, leftArm);

  // 5. Helmet & Tinted Visor
  const headGroup = new THREE.Group();
  headGroup.name = "pilot_head";

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), helmetMat);
  helmet.position.set(0, 0.82, -0.04);

  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI, 0, Math.PI * 0.5), visorMat);
  visor.rotation.x = -Math.PI / 2;
  visor.position.set(0, 0.83, 0.03);

  // Oxygen mask hose
  const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), seatMat);
  hose.position.set(0, 0.72, 0.08);
  hose.rotation.x = 0.5;

  headGroup.add(helmet, visor, hose);
  pilotGroup.add(headGroup);

  return pilotGroup;
}
