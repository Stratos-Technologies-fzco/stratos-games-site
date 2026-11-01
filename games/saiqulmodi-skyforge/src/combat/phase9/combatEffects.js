import * as THREE from 'three';

export class CombatEffectsEngine {
  constructor(scene) {
    this.scene = scene;
    this.explosions = [];
  }

  triggerExplosion(pos, scale = 1.0) {
    const pCount = 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    const velocities = [];

    for (let i = 0; i < pCount; i++) {
      positions[i * 3 + 0] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 80 * scale,
        (Math.random() - 0.2) * 90 * scale,
        (Math.random() - 0.5) * 80 * scale
      );
      velocities.push(v);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff6611,
      size: 4.0 * scale,
      transparent: true,
      opacity: 1.0
    });

    const pSystem = new THREE.Points(geo, mat);
    this.scene.add(pSystem);

    this.explosions.push({
      mesh: pSystem,
      geo: geo,
      mat: mat,
      velocities: velocities,
      life: 1.2
    });
  }

  update(deltaSec) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.life -= deltaSec;

      const posArr = exp.geo.attributes.position.array;
      for (let j = 0; j < exp.velocities.length; j++) {
        posArr[j * 3 + 0] += exp.velocities[j].x * deltaSec;
        posArr[j * 3 + 1] += exp.velocities[j].y * deltaSec;
        posArr[j * 3 + 2] += exp.velocities[j].z * deltaSec;
        exp.velocities[j].y -= 25 * deltaSec; // Gravity on debris
      }
      exp.geo.attributes.position.needsUpdate = true;
      exp.mat.opacity = Math.max(0, exp.life / 1.2);

      if (exp.life <= 0) {
        this.scene.remove(exp.mesh);
        exp.geo.dispose();
        exp.mat.dispose();
        this.explosions.splice(i, 1);
      }
    }
  }
}
