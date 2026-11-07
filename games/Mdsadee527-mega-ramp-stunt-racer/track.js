import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getLevel, buildChain } from './levels.js';

function makeQuat(rotY, rotX) {
  const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotX);
  return qYaw.multiply(qPitch);
}

// Simple deterministic PRNG so decoration layout is stable per level.
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function buildLevel(levelId, scene, world) {
  const level = getLevel(levelId);
  const chain = buildChain(level.steps, level.startPos, level.startYaw);

  const group = new THREE.Group();
  scene.add(group);
  const bodies = [];

  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x0b0e1c, metalness: 0.1, roughness: 0.9 });

  for (const plat of chain.platforms) {
    const mat = new THREE.MeshStandardMaterial({
      color: plat.color ?? 0xcccccc,
      metalness: plat.isRamp ? 0.3 : 0.1,
      roughness: plat.isRamp ? 0.5 : 0.85,
    });
    const geo = new THREE.BoxGeometry(plat.size.x, plat.size.y, plat.size.z);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(plat.pos.x, plat.pos.y, plat.pos.z);
    const q = makeQuat(plat.rotY, plat.rotX);
    mesh.quaternion.copy(q);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    group.add(mesh);

    // Thin glowing edge stripes along the sides for arcade readability.
    const stripeGeo = new THREE.BoxGeometry(plat.size.x + 0.08, 0.08, 0.2);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: plat.color ?? 0xffffff,
      emissive: plat.color ?? 0xffffff,
      emissiveIntensity: 0.9,
    });
    const stripeFront = new THREE.Mesh(stripeGeo, stripeMat);
    stripeFront.position.copy(mesh.position);
    const half = new THREE.Vector3(0, plat.size.y / 2 + 0.03, plat.size.z / 2);
    half.applyQuaternion(q);
    stripeFront.position.add(half);
    stripeFront.quaternion.copy(q);
    group.add(stripeFront);

    const body = new CANNON.Body({ mass: 0, material: new CANNON.Material('ground') });
    body.addShape(new CANNON.Box(new CANNON.Vec3(plat.size.x / 2, plat.size.y / 2, plat.size.z / 2)));
    body.position.set(plat.pos.x, plat.pos.y, plat.pos.z);
    body.quaternion.set(q.x, q.y, q.z, q.w);
    world.addBody(body);
    bodies.push(body);
  }

  buildDecorations(level, chain, group);

  // Scene atmosphere
  scene.fog = new THREE.Fog(level.fogColor, 40, 220);
  scene.background = new THREE.Color(level.skyColor);

  if (level.groundColor !== null) {
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({ color: level.groundColor, roughness: 1 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = level.voidY + 2;
    groundMesh.receiveShadow = true;
    group.add(groundMesh);
  }

  return {
    level,
    group,
    bodies,
    checkpoints: chain.checkpoints,
    startPos: level.startPos,
    startYaw: level.startYaw,
    voidY: level.voidY,
  };
}

function buildDecorations(level, chain, group) {
  const rng = makeRng(level.id.length * 7919 + 13);
  const platforms = chain.platforms;
  if (platforms.length === 0) return;

  let decoGeo, decoMats;
  if (level.theme === 'sky') {
    decoGeo = new THREE.IcosahedronGeometry(1, 0);
    decoMats = [0xffffff, 0xbfeeff, 0x9ad9ff].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
  } else if (level.theme === 'canyon') {
    decoGeo = new THREE.ConeGeometry(1, 2.4, 6);
    decoMats = [0x8a4b24, 0xa65a2e, 0x7a3f1d].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
  } else {
    decoGeo = new THREE.BoxGeometry(1, 1, 1);
    decoMats = [0x2a1a4a, 0x1a2a4a, 0x3a1a3a].map(c => new THREE.MeshStandardMaterial({
      color: c, roughness: 0.4, emissive: c, emissiveIntensity: 0.25,
    }));
  }

  const step = Math.max(1, Math.floor(platforms.length / 18));
  for (let i = 0; i < platforms.length; i += step) {
    const plat = platforms[i];
    for (const side of [-1, 1]) {
      if (rng() > 0.6) continue;
      const mat = decoMats[Math.floor(rng() * decoMats.length)];
      const mesh = new THREE.Mesh(decoGeo, mat);
      const dist = plat.size.x / 2 + 6 + rng() * 14;
      const perp = new THREE.Vector3(Math.cos(plat.rotY), 0, -Math.sin(plat.rotY));
      mesh.position.set(
        plat.pos.x + perp.x * dist * side,
        level.theme === 'city' ? (level.voidY + 2) + rng() * 18 + 4 : plat.pos.y - 2 + rng() * 6,
        plat.pos.z + perp.z * dist * side,
      );
      const scale = 1 + rng() * (level.theme === 'city' ? 3 : 2.2);
      mesh.scale.set(scale, scale * (level.theme === 'city' ? 1 + rng() * 4 : 1), scale);
      mesh.rotation.y = rng() * Math.PI * 2;
      mesh.castShadow = false;
      group.add(mesh);
    }
  }
}
