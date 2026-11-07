import * as THREE from 'three';

// Car archetypes. Stats are 0-100, converted to physics numbers in physics.js.
// Stars are the cumulative star total (across all levels) required to unlock.
export const CARS = [
  {
    id: 'rookie',
    name: 'ROOKIE',
    unlockStars: 0,
    color: 0x4dc9ff,
    accent: 0x1b2a44,
    stats: { speed: 58, accel: 62, handling: 72, jump: 50 },
    scale: 1.0,
    wheelRadius: 0.38,
  },
  {
    id: 'drifter',
    name: 'DRIFTER',
    unlockStars: 2,
    color: 0xff9e3d,
    accent: 0x3a2410,
    stats: { speed: 64, accel: 56, handling: 92, jump: 55 },
    scale: 1.0,
    wheelRadius: 0.38,
  },
  {
    id: 'rocket',
    name: 'ROCKET',
    unlockStars: 5,
    color: 0xff5c7a,
    accent: 0x2a0f16,
    stats: { speed: 96, accel: 82, handling: 54, jump: 68 },
    scale: 0.95,
    wheelRadius: 0.36,
  },
  {
    id: 'monster',
    name: 'MONSTER',
    unlockStars: 8,
    color: 0x7fe3a1,
    accent: 0x0e241a,
    stats: { speed: 74, accel: 70, handling: 58, jump: 97 },
    scale: 1.15,
    wheelRadius: 0.52,
  },
];

export function getCar(id) {
  return CARS.find(c => c.id === id) || CARS[0];
}

export function getUnlockedCars(starsTotal) {
  return CARS.filter(c => c.unlockStars <= starsTotal);
}

// Builds a stylized low-poly car mesh group. Origin at ground contact center.
export function buildCarMesh(carDef) {
  const group = new THREE.Group();
  const s = carDef.scale;

  const bodyMat = new THREE.MeshStandardMaterial({ color: carDef.color, metalness: 0.4, roughness: 0.35 });
  const accentMat = new THREE.MeshStandardMaterial({ color: carDef.accent, metalness: 0.2, roughness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.6, roughness: 0.1 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.1, roughness: 0.8 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3 });

  // Lower chassis
  const lower = new THREE.Mesh(new THREE.BoxGeometry(1.9 * s, 0.45 * s, 3.6 * s), bodyMat);
  lower.position.set(0, 0.42 * s, 0);
  lower.castShadow = true;
  group.add(lower);

  // Upper cabin (tapered via scale trick using two boxes)
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5 * s, 0.5 * s, 1.9 * s), accentMat);
  cabin.position.set(0, 0.82 * s, -0.1 * s);
  cabin.castShadow = true;
  group.add(cabin);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4 * s, 0.4 * s, 1.0 * s), glassMat);
  windshield.position.set(0, 0.8 * s, 0.75 * s);
  windshield.rotation.x = -0.25;
  group.add(windshield);

  // Nose wedge
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.8 * s, 0.35 * s, 0.9 * s), bodyMat);
  nose.position.set(0, 0.35 * s, 1.85 * s);
  nose.rotation.x = 0.18;
  group.add(nose);

  // Spoiler for the rocket-style flair (purely visual)
  const spoilerStand1 = new THREE.Mesh(new THREE.BoxGeometry(0.1 * s, 0.3 * s, 0.1 * s), accentMat);
  spoilerStand1.position.set(-0.7 * s, 0.85 * s, -1.65 * s);
  group.add(spoilerStand1);
  const spoilerStand2 = spoilerStand1.clone();
  spoilerStand2.position.x = 0.7 * s;
  group.add(spoilerStand2);
  const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.7 * s, 0.08 * s, 0.4 * s), accentMat);
  spoilerWing.position.set(0, 1.0 * s, -1.65 * s);
  group.add(spoilerWing);

  // Headlights / taillights (visual only)
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2040, emissive: 0xff2040, emissiveIntensity: 1.2 });
  for (const side of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.25 * s, 0.12 * s, 0.08 * s), headMat);
    hl.position.set(side * 0.65 * s, 0.5 * s, 2.3 * s);
    group.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.25 * s, 0.12 * s, 0.08 * s), tailMat);
    tl.position.set(side * 0.65 * s, 0.5 * s, -1.85 * s);
    group.add(tl);
  }

  // Wheels (kept as separate objects so physics.js can spin/steer them)
  const wheels = [];
  const wheelR = carDef.wheelRadius * s;
  const wheelW = 0.32 * s;
  const wheelPositions = [
    [-0.95 * s, wheelR, 1.25 * s],  // front-left
    [0.95 * s, wheelR, 1.25 * s],   // front-right
    [-0.95 * s, wheelR, -1.15 * s], // rear-left
    [0.95 * s, wheelR, -1.15 * s],  // rear-right
  ];
  for (const pos of wheelPositions) {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 18), wheelMat);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelR * 0.5, wheelR * 0.5, wheelW * 1.02, 10), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    wheelGroup.castShadow = true;
    // Wheels are NOT parented to the body group: physics.js drives each
    // wheel's world transform directly (steering + suspension + spin), so
    // they are added to the scene independently by main.js.
    wheels.push(wheelGroup);
  }

  group.traverse(o => { if (o.isMesh) o.castShadow = true; });

  return { group, wheels };
}
