// The ground war (main.py:2347-2359): supply convoys driving the highways (10 columns of 5 trucks, 0.12 px/frame,
// turning back at the ends; headlights at night, main.py:2424-2430) and artillery duels along the front line
// (a blast near the border 6% of frames while the front is in view).
import { BoxGeometry, InstancedMesh, MeshBasicMaterial, MeshLambertMaterial, Object3D, type Scene, SphereGeometry } from 'three';
import { PX_M, pxToX, pyToZ, WORLD_H_PX, WORLD_W_PX } from '../config';
import { heightAt } from './Height';
import { MAP } from './MapData';

const CONVOYS = 10; // main.py:1655
const TRUCKS = 5; // main.py:2400
const SPEED_PX = 0.12; // main.py:2356, px/frame (29 m/s: road speed, not time-scaled)
const GAP_PX = 11; // main.py:2401
const FRONT_VIEW_M = 25000; // artillery shows while the front line is this close
const ARTY_CHANCE = 0.06; // main.py:2348

interface Convoy {
  hw: number[];
  len: number;
  t: number;
  dir: number;
}

const _o = new Object3D();

export class GroundWar {
  private convoys: Convoy[] = [];
  private trucks: InstancedMesh;
  private lights: InstancedMesh;
  private rand: () => number;

  constructor(scene: Scene) {
    let s = 35000; // main.py:1598 war_rng
    this.rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let k = 0; k < CONVOYS; k++) {
      const hw = MAP.highways[k % MAP.highways.length]; // main.py:1656
      this.convoys.push({ hw, len: Math.max(1, Math.hypot(hw[2] - hw[0], hw[3] - hw[1])), t: this.rand(), dir: this.rand() < 0.5 ? -1 : 1 });
    }
    const truckGeo = new BoxGeometry(3, 3.2, 11);
    truckGeo.translate(0, 1.6, 0);
    this.trucks = new InstancedMesh(truckGeo, new MeshLambertMaterial({ color: 0x464e32 }), CONVOYS * TRUCKS); // main.py:2404
    const lampMat = new MeshBasicMaterial({ color: 0xfff0c8 });
    lampMat.color.multiplyScalar(4); // bright enough to bloom
    this.lights = new InstancedMesh(new SphereGeometry(1.6, 6, 4), lampMat, CONVOYS * TRUCKS);
    this.trucks.frustumCulled = false;
    this.lights.frustumCulled = false;
    this.lights.visible = false;
    scene.add(this.trucks, this.lights);
  }

  /** One 60 Hz frame. `blast` makes an explosion. */
  step(jetX: number, jetZ: number, blast: (x: number, y: number, z: number, r: number, life: number) => void): void {
    for (const cv of this.convoys) {
      cv.t += (cv.dir * SPEED_PX) / cv.len;
      if (!(cv.t > 0 && cv.t < 1)) {
        cv.dir = -cv.dir;
        cv.t = Math.min(1, Math.max(0, cv.t));
      }
    }
    // artillery along the front (main.py:2348-2351)
    const py = jetZ / PX_M + WORLD_H_PX / 2;
    if (py > 0 && py < WORLD_H_PX && this.rand() < ARTY_CHANCE) {
      const fy = Math.min(WORLD_H_PX, Math.max(0, py + (this.rand() * 2 - 1) * 1500));
      const fx = MAP.borderX(fy) + (this.rand() * 2 - 1) * 90;
      const x = pxToX(fx);
      const z = pyToZ(fy);
      if (Math.abs(x - jetX) < FRONT_VIEW_M && fx < WORLD_W_PX) blast(x, heightAt(x, z) + 5, z, (6 + this.rand() * 6) * PX_M, 0.6);
    }
  }

  /** Draw-side: truck positions and headlights. */
  sync(night: boolean): void {
    this.lights.visible = night;
    let i = 0;
    for (const cv of this.convoys) {
      const [x1, y1, x2, y2] = cv.hw;
      const yaw = Math.atan2(x2 - x1, y2 - y1) + (cv.dir < 0 ? Math.PI : 0);
      for (let k = 0; k < TRUCKS; k++) {
        const t = cv.t - (cv.dir * k * GAP_PX) / cv.len; // main.py:2401
        const x = pxToX(x1 + (x2 - x1) * t);
        const z = pyToZ(y1 + (y2 - y1) * t);
        const y = heightAt(x, z);
        _o.position.set(x, y, z);
        _o.rotation.set(0, yaw, 0);
        _o.scale.set(1, 1, 1);
        _o.updateMatrix();
        this.trucks.setMatrixAt(i, _o.matrix);
        if (night) {
          _o.position.set(x + Math.sin(yaw) * 6, y + 1.5, z + Math.cos(yaw) * 6);
          _o.updateMatrix();
          this.lights.setMatrixAt(i, _o.matrix);
        }
        i++;
      }
    }
    this.trucks.instanceMatrix.needsUpdate = true;
    if (night) this.lights.instanceMatrix.needsUpdate = true;
  }
}
