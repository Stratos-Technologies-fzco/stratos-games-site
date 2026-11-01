import * as THREE from 'three';

export class ParatrooperSystem {
  constructor(scene) {
    this.scene = scene;
    this.troopers = [];
  }

  // Create a single military paratrooper with harness & round parachute
  createTrooperMesh() {
    const group = new THREE.Group();

    // 1. Soldier Body (Camo fatigues & tactical gear)
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x3b4737, roughness: 0.8 }); // Olive camo
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x1f261c, roughness: 0.9 }); // Ruck & rig
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xcca080, roughness: 0.5 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x2b3327, roughness: 0.7 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.22), suitMat);
    torso.position.y = 0.35;
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.18), gearMat); // Main chute pack
    backpack.position.set(0, 0.38, 0.15);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
    head.position.y = 0.65;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), helmetMat);
    helmet.position.y = 0.67;

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.18), suitMat);
    legs.position.y = -0.1;

    group.add(torso, backpack, head, helmet, legs);

    // 2. Military T-11 Round Canopy (Olive Drab, 3.2m diameter)
    const canopyGeo = new THREE.SphereGeometry(1.8, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x485c3f,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 3.2, 0);

    // Suspension cords
    const cordMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(Math.cos(ang) * 1.7, 3.2, Math.sin(ang) * 1.7),
        new THREE.Vector3(0, 0.5, 0)
      ];
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cordMat);
      canopy.add(line);
    }

    canopy.scale.set(0.05, 0.05, 0.05); // Closed inside plane
    group.add(canopy);
    group.canopy = canopy;

    return group;
  }

  // Drop a chalk of soldiers out the rear ramp
  dropParatroopers(spawnOrigin, forwardDir, count = 6) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Green jump light tone
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const trooper = this.createTrooperMesh();
        
        // Spawn slightly behind and below transport tail
        const pos = spawnOrigin.clone()
          .sub(forwardDir.clone().multiplyScalar(6.0 + i * 2.2))
          .add(new THREE.Vector3((Math.random() - 0.5) * 2.5, -1.2, (Math.random() - 0.5) * 2.5));

        trooper.position.copy(pos);
        this.scene.add(trooper);

        this.troopers.push({
          mesh: trooper,
          canopy: trooper.canopy,
          velocity: forwardDir.clone().multiplyScalar(25).add(new THREE.Vector3(0, -2, 0)),
          stage: 'FREEFALL', // FREEFALL -> OPENING -> CANOPY_DESCENT -> LANDED
          timer: 0,
          drift: new THREE.Vector3(0.8, 0, 0.3)
        });
      }, i * 350); // Jump every 350ms in stick formation
    }
  }

  update(delta) {
    for (let i = this.troopers.length - 1; i >= 0; i--) {
      const t = this.troopers[i];
      t.timer += delta;

      if (t.stage === 'FREEFALL') {
        t.mesh.position.addScaledVector(t.velocity, delta);
        t.velocity.multiplyScalar(0.96); // Air drag deceleration
        t.velocity.y -= 9.81 * delta;

        // Static line rip cord pops chute after 0.8 sec
        if (t.timer > 0.8) {
          t.stage = 'OPENING';
          t.openProgress = 0.05;
        }
      } else if (t.stage === 'OPENING') {
        t.openProgress += delta * 2.5;
        const s = Math.min(1.0, t.openProgress);
        t.canopy.scale.set(s, s, s);
        t.velocity.y = THREE.MathUtils.lerp(t.velocity.y, -4.5, 0.15); // Descent rate slows
        t.mesh.position.addScaledVector(t.velocity, delta);

        if (s >= 1.0) t.stage = 'CANOPY_DESCENT';
      } else if (t.stage === 'CANOPY_DESCENT') {
        // Stable military canopy descent at 4.2 m/s (~14 ft/s)
        t.mesh.position.y -= 4.2 * delta;
        t.mesh.position.addScaledVector(t.drift, delta);

        // Natural canopy sway in wind
        t.canopy.rotation.z = Math.sin(t.timer * 2.5) * 0.08;
        t.canopy.rotation.x = Math.cos(t.timer * 2.0) * 0.06;

        // Ground landing check
        if (t.mesh.position.y <= 0.2) {
          t.mesh.position.y = 0.2;
          t.stage = 'LANDED';
          // Collapse canopy onto ground
          t.canopy.position.set(1.4, -0.1, 0.8);
          t.canopy.rotation.z = 1.35;
        }
      }
    }
  }
}
