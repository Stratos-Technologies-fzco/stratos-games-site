// Surveillance drones (main.py:1003-1048): slow patrols at 9,000-16,000 ft between 3 waypoints at a time,
// half over cities, half over open country. A drone that sees the jet cues the nearest armed launcher.
import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Scene, SphereGeometry, BoxGeometry } from 'three';
import {
  coastX,
  DRONE_ALT_MAX_FT,
  DRONE_ALT_MIN_FT,
  DRONE_COUNT,
  DRONE_SPEED_VS_JET,
  DRONE_SPOT_RELOAD,
  DRONE_TURN_DIV,
  FT,
  JET_CRUISE_MPS,
  LEVEL_MULT,
  PX_M,
  pxToX,
  pyToZ,
  STEP,
  TIME_SCALE,
  WORLD_H_PX,
  WORLD_W_PX,
} from '../config';
import type { CityPx } from './Launchers';
import { MAP } from '../world/MapData';

const SPEED_MPS = DRONE_SPEED_VS_JET * JET_CRUISE_MPS; // main.py:2209, = 126 m/s
const SPEED_PX = SPEED_MPS / (PX_M * 60 * TIME_SCALE); // back to main.py px/frame for the turn rule
const TURN_PER_FRAME = SPEED_PX / DRONE_TURN_DIV; // main.py:1034
const WAYPOINT_REACHED_M = 40 * PX_M; // main.py:1032

const wingGeo = new BoxGeometry(22, 0.3, 1.6);
const bodyGeo = new CylinderGeometry(0.6, 0.45, 9, 8);
const tailGeo = new BoxGeometry(3.5, 0.2, 1);
const turretGeo = new SphereGeometry(0.7, 8, 6);
const wingMat = new MeshLambertMaterial({ color: 0xaaa4b6 }); // main.py:979-982
const bodyMat = new MeshLambertMaterial({ color: 0xbebac8 });
const turretMat = new MeshBasicMaterial({ color: 0xd278ff }); // main.py:983 sensor turret

export class Drone {
  readonly mesh = new Group();
  x = 0;
  z = 0;
  y = 0;
  heading = Math.PI; // main.py:1014 (west), radians clockwise from north here: 0 = north (-z)
  spotCd = 0;
  alive = true;
  /** frames until a shot-down drone's replacement crosses the border (main.py:2223-2227) */
  respawn = 0;
  private wp = new Float64Array(6); // 3 waypoints (x, z)
  private wpCount = 0;

  constructor() {
    const wings = new Mesh(wingGeo, wingMat);
    this.mesh.add(wings);
    const body = new Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.position.z = 1;
    this.mesh.add(body);
    for (const side of [-1, 1]) {
      const t = new Mesh(tailGeo, wingMat);
      t.position.set(side * 1.3, 0.9, 5);
      t.rotation.z = side * 0.6; // V-tail
      this.mesh.add(t);
    }
    const turret = new Mesh(turretGeo, turretMat);
    turret.position.set(0, -0.6, -3.8);
    this.mesh.add(turret);
    this.mesh.scale.setScalar(1.5);
  }

  reset(rand: () => number, cities: CityPx[]): void {
    const py = 600 + rand() * (WORLD_H_PX - 1200); // main.py:1009
    const px = coastX(py) + 400 + rand() * (WORLD_W_PX - 600 - coastX(py) - 400); // main.py:1010
    this.x = pxToX(px);
    this.z = pyToZ(py);
    this.y = (DRONE_ALT_MIN_FT + rand() * (DRONE_ALT_MAX_FT - DRONE_ALT_MIN_FT)) * FT; // main.py:1013
    this.heading = -Math.PI / 2; // main.py:1014 heading pi = west
    this.spotCd = Math.floor(rand() * DRONE_SPOT_RELOAD); // main.py:1017
    this.alive = true;
    this.respawn = 0;
    this.mesh.visible = true;
    this.wpCount = 0;
    void cities;
  }

  /** main.py:1005-1007: reinforcements cross the front line from the east */
  respawnFromBorder(rand: () => number): void {
    const py = 600 + rand() * (WORLD_H_PX - 1200);
    this.x = pxToX(MAP.borderX(py) + 120);
    this.z = pyToZ(py);
    this.y = (DRONE_ALT_MIN_FT + rand() * (DRONE_ALT_MAX_FT - DRONE_ALT_MIN_FT)) * FT;
    this.heading = -Math.PI / 2;
    this.spotCd = Math.floor(rand() * DRONE_SPOT_RELOAD);
    this.wpCount = 0;
    this.alive = true;
    this.mesh.visible = true;
  }

  private newWaypoint(rand: () => number, cities: CityPx[], k: number): void {
    let px: number, py: number;
    if (rand() < 0.5) {
      const c = cities[Math.floor(rand() * cities.length)]; // main.py:1023 watch over a city ...
      px = c.x + rand() * 600 - 300;
      py = c.y + rand() * 600 - 300;
    } else {
      py = 500 + rand() * (WORLD_H_PX - 1000); // main.py:1025 ... or sweep open country
      px = coastX(py) + 300 + rand() * (WORLD_W_PX - 500 - coastX(py) - 300);
    }
    this.wp[k * 2] = pxToX(px);
    this.wp[k * 2 + 1] = pyToZ(py);
  }

  /** main.py:1028-1040, one frame */
  step(rand: () => number, cities: CityPx[]): void {
    if (this.wpCount === 0) {
      for (let k = 0; k < 3; k++) this.newWaypoint(rand, cities, k);
      this.wpCount = 3;
    }
    const wx = this.wp[0];
    const wz = this.wp[1];
    if (Math.hypot(wx - this.x, wz - this.z) < WAYPOINT_REACHED_M) {
      // pop the first waypoint
      this.wp[0] = this.wp[2];
      this.wp[1] = this.wp[3];
      this.wp[2] = this.wp[4];
      this.wp[3] = this.wp[5];
      this.wpCount--;
    }
    const want = Math.atan2(wx - this.x, -(wz - this.z));
    let d = want - this.heading;
    d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const m = LEVEL_MULT; // main.py:2209 drone speed = level speed x 0.5; turn = speed / 30 (main.py:1034)
    this.heading += Math.max(-TURN_PER_FRAME * m, Math.min(TURN_PER_FRAME * m, d));
    this.x += Math.sin(this.heading) * SPEED_MPS * m * STEP;
    this.z -= Math.cos(this.heading) * SPEED_MPS * m * STEP;
    if (this.spotCd > 0) this.spotCd--;
  }

  syncMesh(): void {
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.set(0, -this.heading, 0);
  }
}

export function makeDrones(scene: Scene | null): Drone[] {
  const out: Drone[] = [];
  for (let i = 0; i < DRONE_COUNT; i++) {
    const d = new Drone();
    if (scene) scene.add(d.mesh);
    out.push(d);
  }
  return out;
}
