import * as THREE from 'three';

export class WeaponsSystem {
  // groundY(x, z): terrain height (world y) so rounds stop at the real ground
  constructor(scene, groundY = () => 0) {
    this.scene = scene;
    this.groundY = groundY;
    this.bullets = [];
    this.missiles = [];

    // Vulcan 20mm Tracer Specs
    this.bulletSpeed = 1050; // m/s (~Mach 3.1)
    this.bulletLife = 2.5;   // Seconds before tracer burn-out

    // Tracer visual geometry
    this.bulletGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.0, 4);
    this.bulletGeo.rotateX(Math.PI / 2);
    this.bulletMat = new THREE.MeshBasicMaterial({ color: 0xffe066, toneMapped: false });

    // Missile visual geometry
    this.missileGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.6, 6);
    this.missileGeo.rotateX(Math.PI / 2);
    this.missileMat = new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.3 });
    this.flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347, toneMapped: false });
    this.flameGeo = new THREE.ConeGeometry(0.22, 2.2, 8);
    this.flameGeo.rotateX(-Math.PI / 2);
    this.flameGeo.translate(0, 0, -2.9);
  }

  fireCannon(muzzlePos, aircraftVel, forwardDir) {
    const mesh = new THREE.Mesh(this.bulletGeo, this.bulletMat);
    mesh.position.copy(muzzlePos);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDir);
    this.scene.add(mesh);

    const muzzleVelocity = forwardDir.clone().multiplyScalar(this.bulletSpeed).add(aircraftVel);

    this.bullets.push({
      mesh: mesh,
      position: mesh.position,
      velocity: muzzleVelocity,
      life: this.bulletLife
    });
  }

  launchMissile(railPos, aircraftVel, forwardDir, lockedTarget) {
    const mesh = new THREE.Mesh(this.missileGeo, this.missileMat);
    mesh.add(new THREE.Mesh(this.flameGeo, this.flameMat)); // motor plume
    mesh.position.copy(railPos);
    this.scene.add(mesh);

    this.missiles.push({
      mesh: mesh,
      position: mesh.position,
      velocity: forwardDir.clone().multiplyScalar(300).add(aircraftVel),
      target: lockedTarget,
      thrust: 650, // m/s^2 acceleration
      maxSpeed: 1200,
      life: 8.0
    });
  }

  update(deltaSec) {
    // 1. Advance Cannon Shells
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life -= deltaSec;
      b.velocity.y -= 9.81 * deltaSec; // Ballistic gravity drop
      b.position.addScaledVector(b.velocity, deltaSec);
      b.mesh.position.copy(b.position);

      if (b.life <= 0 || b.position.y <= this.groundY(b.position.x, b.position.z)) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }

    // 2. Advance Guided Missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.life -= deltaSec;

      if (m.target && !m.target.isDestroyed) {
        // Proportional navigation intercept steering
        const desiredDir = m.target.position.clone().sub(m.position).normalize();
        m.velocity.lerp(desiredDir.multiplyScalar(m.maxSpeed), deltaSec * 4.5);
      }

      m.position.addScaledVector(m.velocity, deltaSec);
      m.mesh.position.copy(m.position);
      m.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), m.velocity.clone().normalize());

      if (m.life <= 0 || m.position.y <= this.groundY(m.position.x, m.position.z)) {
        this.scene.remove(m.mesh);
        this.missiles.splice(i, 1);
      }
    }

    return { bullets: this.bullets, missiles: this.missiles };
  }
}
