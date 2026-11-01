import * as THREE from 'three';

export class AirportVOBL {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.runwayLength = 4000;
    this.runwayWidth = 60;
    this.aimingPointZ = -1500; // 300m past threshold (-1800m)

    this.buildRunwaySurface();
    this.buildMarkings();
    this.buildRunwayLights();
    this.buildPAPI();
    this.buildTower();
  }

  buildRunwaySurface() {
    // 1. Main Asphalt Runway Pavement
    const rwyGeo = new THREE.PlaneGeometry(this.runwayWidth, this.runwayLength);
    rwyGeo.rotateX(-Math.PI / 2);
    const rwyMat = new THREE.MeshStandardMaterial({
      color: 0x1f242b,
      roughness: 0.85,
      metalness: 0.1
    });
    const runwayMesh = new THREE.Mesh(rwyGeo, rwyMat);
    runwayMesh.position.set(0, 0.05, 0);
    runwayMesh.receiveShadow = true;
    this.group.add(runwayMesh);

    // 2. Concrete Blast Pads / Shoulders (75m total width)
    const shoulderGeo = new THREE.PlaneGeometry(this.runwayWidth + 15, this.runwayLength + 120);
    shoulderGeo.rotateX(-Math.PI / 2);
    const shoulderMat = new THREE.MeshStandardMaterial({
      color: 0x333b45,
      roughness: 0.95
    });
    const shoulderMesh = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulderMesh.position.set(0, 0.02, 0);
    shoulderMesh.receiveShadow = true;
    this.group.add(shoulderMesh);

    // 3. Main Apron & Parallel Taxiway
    const taxiwayGeo = new THREE.PlaneGeometry(30, this.runwayLength * 0.7);
    taxiwayGeo.rotateX(-Math.PI / 2);
    const taxiwayMesh = new THREE.Mesh(taxiwayGeo, rwyMat);
    taxiwayMesh.position.set(110, 0.04, -200);
    this.group.add(taxiwayMesh);
  }

  buildMarkings() {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // Centerline Dashes (30m stripe, 20m gap)
    const stripeGeo = new THREE.PlaneGeometry(1.8, 30);
    stripeGeo.rotateX(-Math.PI / 2);

    for (let z = -1750; z <= 1750; z += 50) {
      const stripe = new THREE.Mesh(stripeGeo, whiteMat);
      stripe.position.set(0, 0.07, z);
      this.group.add(stripe);
    }

    // Threshold Piano Keys (Runway 09L)
    const keyGeo = new THREE.PlaneGeometry(2.2, 45);
    keyGeo.rotateX(-Math.PI / 2);
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const key = new THREE.Mesh(keyGeo, whiteMat);
      key.position.set(i * 2.6, 0.07, -1880);
      this.group.add(key);

      // Opposite threshold (27R)
      const keyOpp = new THREE.Mesh(keyGeo, whiteMat);
      keyOpp.position.set(i * 2.6, 0.07, 1880);
      this.group.add(keyOpp);
    }

    // Aiming Point Markers (Large 60m x 8m White Bars)
    const aimGeo = new THREE.PlaneGeometry(7.5, 60);
    aimGeo.rotateX(-Math.PI / 2);

    const aimLeft = new THREE.Mesh(aimGeo, whiteMat);
    aimLeft.position.set(-14, 0.07, -1500);
    this.group.add(aimLeft);

    const aimRight = new THREE.Mesh(aimGeo, whiteMat);
    aimRight.position.set(14, 0.07, -1500);
    this.group.add(aimRight);

    // Touchdown Zone (TDZ) Pairs
    const tdzGeo = new THREE.PlaneGeometry(2.0, 25);
    tdzGeo.rotateX(-Math.PI / 2);
    [-1700, -1600, -1400, -1300, -1200].forEach((zPos) => {
      const tdzL1 = new THREE.Mesh(tdzGeo, whiteMat);
      tdzL1.position.set(-15, 0.07, zPos);
      const tdzL2 = new THREE.Mesh(tdzGeo, whiteMat);
      tdzL2.position.set(-18, 0.07, zPos);

      const tdzR1 = new THREE.Mesh(tdzGeo, whiteMat);
      tdzR1.position.set(15, 0.07, zPos);
      const tdzR2 = new THREE.Mesh(tdzGeo, whiteMat);
      tdzR2.position.set(18, 0.07, zPos);

      this.group.add(tdzL1, tdzL2, tdzR1, tdzR2);
    });

    // Taxiway Centerline (Yellow)
    const taxiStripeGeo = new THREE.PlaneGeometry(0.6, this.runwayLength * 0.7);
    taxiStripeGeo.rotateX(-Math.PI / 2);
    const taxiStripe = new THREE.Mesh(taxiStripeGeo, yellowMat);
    taxiStripe.position.set(110, 0.06, -200);
    this.group.add(taxiStripe);
  }

  buildRunwayLights() {
    const edgeCount = 70;
    const spacing = this.runwayLength / edgeCount;
    const lightGeo = new THREE.SphereGeometry(0.35, 8, 8);

    const whiteLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Instanced Runway Edge Lights
    const halfLen = this.runwayLength / 2;
    for (let i = 0; i <= edgeCount; i++) {
      const z = -halfLen + i * spacing;

      const lightL = new THREE.Mesh(lightGeo, whiteLightMat);
      lightL.position.set(-this.runwayWidth / 2 - 1.5, 0.4, z);
      this.group.add(lightL);

      const lightR = new THREE.Mesh(lightGeo, whiteLightMat);
      lightR.position.set(this.runwayWidth / 2 + 1.5, 0.4, z);
      this.group.add(lightR);
    }

    // Green Threshold Light Bar (Runway 09L Entry)
    for (let x = -this.runwayWidth / 2; x <= this.runwayWidth / 2; x += 3.5) {
      const tLight = new THREE.Mesh(lightGeo, greenLightMat);
      tLight.position.set(x, 0.3, -halfLen);
      this.group.add(tLight);

      // Red End Lights
      const endLight = new THREE.Mesh(lightGeo, redLightMat);
      endLight.position.set(x, 0.3, halfLen);
      this.group.add(endLight);
    }
  }

  buildPAPI() {
    // 4 Precision Approach Path Indicator units on left side of Runway 09L
    this.papiLights = [];
    const papiMatBase = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    const papiX = -this.runwayWidth / 2 - 16;
    const papiZ = this.aimingPointZ;

    for (let i = 0; i < 4; i++) {
      // Housing Box
      const housing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), boxMat);
      housing.position.set(papiX - (i * 5.0), 0.4, papiZ);
      this.group.add(housing);

      // Lens Light
      const lensMat = papiMatBase.clone();
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), lensMat);
      lens.position.set(papiX - (i * 5.0), 0.5, papiZ - 0.7);
      this.group.add(lens);

      this.papiLights.push({
        mesh: lens,
        material: lensMat,
        angleOffsetDeg: (i - 1.5) * 0.35 // Beam thresholds: 3.5°, 3.2°, 2.8°, 2.5°
      });
    }
  }

  buildTower() {
    // Kempegowda ATC Tower Landmark
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.6 });

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.0, 55, 16), towerMat);
    shaft.position.set(200, 27.5, -400);
    this.group.add(shaft);

    const cab = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 7.0, 9, 16), glassMat);
    cab.position.set(200, 58, -400);
    this.group.add(cab);

    // Rotating Aerodrome Beacon Light
    this.beaconLight = new THREE.PointLight(0x22c55e, 5.0, 2000);
    this.beaconLight.position.set(200, 64, -400);
    this.group.add(this.beaconLight);
  }

  updatePAPI(planePos) {
    // Calculate vertical glide-path angle from plane to PAPI threshold
    const deltaZ = this.aimingPointZ - planePos.z;
    const deltaY = planePos.y - 0.5;

    // Only compute approach lights when approaching runway 09L from the west
    if (deltaZ < 200 || deltaZ > 12000) return;

    const angleDeg = THREE.MathUtils.radToDeg(Math.atan2(deltaY, deltaZ));
    const targetSlope = 3.0; // Standard 3-degree glide slope

    this.papiLights.forEach((unit) => {
      const thresholdAngle = targetSlope + unit.angleOffsetDeg;
      if (angleDeg >= thresholdAngle) {
        // High: White
        unit.material.color.setHex(0xffffff);
      } else {
        // Low: Red
        unit.material.color.setHex(0xef4444);
      }
    });

    // Pulse beacon light
    if (this.beaconLight) {
      this.beaconLight.intensity = (Math.sin(performance.now() * 0.005) > 0) ? 6.0 : 0.2;
    }
  }
}
