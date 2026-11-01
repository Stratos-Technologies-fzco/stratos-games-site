import * as THREE from 'three';

export class TargetDroneManager {
  // groundY(x, z): terrain height so ground sites sit on the real ground
  constructor(scene, groundY = () => 0) {
    this.scene = scene;
    this.groundY = groundY;
    this.respawnSec = 45;
    this.targets = [];
    this.initTargets();
  }

  initTargets() {
    // 1. Airborne Aerial Target Drones (North-East training range)
    // Target drone: orange body, delta wing, tail fin (nose towards +Z, as the velocity alignment expects)
    const droneMat = new THREE.MeshStandardMaterial({ color: 0xe8541c, roughness: 0.45 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
    const makeDrone = () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 7, 10), droneMat);
      body.rotation.x = Math.PI / 2;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 10), droneMat);
      nose.rotation.x = Math.PI / 2;
      nose.position.z = 4.6;
      const wing = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 2.2), wingMat);
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 1.4), wingMat);
      fin.position.set(0, 0.9, -3);
      g.add(body, nose, wing, fin);
      g.traverse((o) => { o.castShadow = true; });
      return g;
    };

    const droneConfigs = [
      { id: "TGT-AIR-01", pos: new THREE.Vector3(6000, 1800, -12000), speed: 180, heading: 45 },
      { id: "TGT-AIR-02", pos: new THREE.Vector3(-4000, 2400, -18000), speed: 210, heading: 220 }
    ];

    droneConfigs.forEach(cfg => {
      const mesh = makeDrone();
      mesh.position.copy(cfg.pos);
      this.scene.add(mesh);

      this.targets.push({
        id: cfg.id,
        type: 'AIR',
        mesh: mesh,
        position: mesh.position,
        velocity: new THREE.Vector3(
          Math.sin(THREE.MathUtils.degToRad(cfg.heading)) * cfg.speed,
          0,
          Math.cos(THREE.MathUtils.degToRad(cfg.heading)) * cfg.speed
        ),
        hitRadius: 8.0,
        isDestroyed: false,
        health: 100,
        maxHealth: 100,
        home: cfg.pos.clone()
      });
    });

    // 2. Ground Threat Emplacements (Granite Ridge outpost north)
    const bunkerGeo = new THREE.CylinderGeometry(8, 12, 6, 8);
    const bunkerMat = new THREE.MeshStandardMaterial({ color: 0x555a50, roughness: 0.9 });
    const groundTargets = [
      { id: "SAM-SITE-01", pos: new THREE.Vector3(-2200, 280, -22000) },
      { id: "RADAR-SITE-02", pos: new THREE.Vector3(-1800, 520, -24500) }
    ];

    groundTargets.forEach(cfg => {
      const mesh = new THREE.Mesh(bunkerGeo, bunkerMat);
      mesh.position.copy(cfg.pos);
      mesh.position.y = this.groundY(cfg.pos.x, cfg.pos.z) + 3;
      mesh.castShadow = mesh.receiveShadow = true;
      this.scene.add(mesh);

      this.targets.push({
        id: cfg.id,
        type: 'GROUND',
        mesh: mesh,
        position: mesh.position,
        velocity: new THREE.Vector3(0, 0, 0),
        hitRadius: 12.0,
        isDestroyed: false,
        health: 200,
        maxHealth: 200,
        home: mesh.position.clone()
      });
    });
  }

  update(deltaSec) {
    this.targets.forEach(t => {
      if (t.isDestroyed) {
        // Range resets: a destroyed target comes back after respawnSec
        t.respawnIn = (t.respawnIn ?? this.respawnSec) - deltaSec;
        if (t.respawnIn <= 0) {
          t.isDestroyed = false;
          t.respawnIn = undefined;
          t.health = t.maxHealth;
          t.position.copy(t.home);
          t.mesh.visible = true;
        }
        return;
      }

      if (t.type === 'AIR') {
        t.position.addScaledVector(t.velocity, deltaSec);
        t.mesh.position.copy(t.position);
        t.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), t.velocity.clone().normalize());

        // Boundary rebound inside 30km sector
        if (Math.abs(t.position.x) > 15000) t.velocity.x *= -1;
        if (t.position.z < -30000 || t.position.z > -5000) t.velocity.z *= -1;
      }
    });

    return this.targets.filter(t => !t.isDestroyed);
  }
}
