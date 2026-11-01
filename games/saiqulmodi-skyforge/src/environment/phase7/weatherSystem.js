import * as THREE from 'three';

// Monsoon rain around the aircraft (phase 7). Rain streaks only: no cloud decks and no fog changes,
// so views stay clear and the haze stays under src/render/visuals.js.
export class MonsoonWeather {
  constructor(scene) {
    this.scene = scene;
    this.rainRate = 0;        // 0 = dry, 1 = heavy tropical downpour
    this.rainCount = 3000;
    this.box = 260;           // metres around the aircraft
    this.initPrecipitation();
  }

  initPrecipitation() {
    // Each drop is a short vertical streak (2 vertices)
    const pos = new Float32Array(this.rainCount * 6);
    for (let i = 0; i < this.rainCount; i++) {
      const x = (Math.random() - 0.5) * this.box, y = Math.random() * this.box * 0.6, z = (Math.random() - 0.5) * this.box;
      pos.set([x, y, z, x, y + 1.6, z], i * 6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rainMat = new THREE.LineBasicMaterial({ color: 0xb8c8d8, transparent: true, opacity: 0.45, depthWrite: false });
    this.rain = new THREE.LineSegments(geo, this.rainMat);
    this.rain.frustumCulled = false;
    this.rain.visible = false;
    this.scene.add(this.rain);
  }

  setRain(rate) {
    this.rainRate = rate;
    this.rain.visible = rate > 0;
    this.rainMat.opacity = 0.25 + 0.3 * rate;
  }

  update(aircraftPos, dt) {
    if (!this.rain.visible) return;
    this.rain.position.copy(aircraftPos);
    this.rain.position.y -= this.box * 0.3;
    const p = this.rain.geometry.attributes.position.array;
    const fall = (9 + 26 * this.rainRate) * dt; // terminal fall speed
    const top = this.box * 0.6;
    for (let i = 0; i < p.length; i += 6) {
      p[i + 1] -= fall; p[i + 4] -= fall;
      if (p[i + 1] < 0) { p[i + 1] += top; p[i + 4] += top; }
    }
    this.rain.geometry.attributes.position.needsUpdate = true;
  }
}
