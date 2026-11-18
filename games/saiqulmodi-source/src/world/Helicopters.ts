// Helicopters (main.py:177, 1411-1460): 8 of them, low and slow, shuttling between cities and airbases; a
// spinning main rotor, a tail rotor, and at night a blinking red anti-collision beacon. Not a threat.
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Scene, SphereGeometry } from 'three';
import { FT, PX_M, pxToX, pyToZ, STEP } from '../config';
import { heightAt } from './Height';
import { MAP } from './MapData';

const HELI_COUNT = 8; // main.py:177
const TURN_PER_FRAME = 0.02; // main.py:1443

const cabinGeo = new SphereGeometry(1.6, 10, 8);
const boomGeo = new CylinderGeometry(0.25, 0.35, 7, 6);
const rotorGeo = new BoxGeometry(14, 0.08, 0.5);
const tailRotorGeo = new BoxGeometry(0.08, 2.2, 0.3);
const olive = new MeshLambertMaterial({ color: 0x4a543c }); // main.py:1414-1416
const glass = new MeshLambertMaterial({ color: 0x78aabe });
const dark = new MeshLambertMaterial({ color: 0x1c1c1c });
const beaconMat = new MeshBasicMaterial({ color: 0xff3c32 });
beaconMat.color.multiplyScalar(4);

class Heli {
  readonly group = new Group();
  private rotor: Mesh;
  private tail: Mesh;
  private beacon: Mesh;
  x = 0;
  z = 0;
  agl = 300;
  heading = 0;
  speed = 50;
  tx = 0;
  tz = 0;

  constructor() {
    const cabin = new Mesh(cabinGeo, olive);
    cabin.scale.set(1, 0.9, 1.6);
    const canopy = new Mesh(cabinGeo, glass);
    canopy.scale.set(0.7, 0.6, 0.6);
    canopy.position.set(0, 0.3, -1.6);
    const boom = new Mesh(boomGeo, olive);
    boom.rotation.x = Math.PI / 2;
    boom.position.set(0, 0.4, 4.6);
    this.rotor = new Mesh(rotorGeo, dark);
    this.rotor.position.y = 1.7;
    this.tail = new Mesh(tailRotorGeo, dark);
    this.tail.position.set(0.3, 0.8, 8);
    this.beacon = new Mesh(new SphereGeometry(0.35, 6, 4), beaconMat);
    this.beacon.position.y = 1.5;
    this.group.add(cabin, canopy, boom, this.rotor, this.tail, this.beacon);
    this.group.scale.setScalar(1.6);
  }

  /** main.py:1432-1437: 40% an airbase, otherwise somewhere round a city */
  waypoint(r: () => number, out: number[]): void {
    if (r() < 0.4) {
      const k = Math.floor(r() * (MAP.airbases.length / 2)) * 2;
      out[0] = pxToX(MAP.airbases[k] + (r() * 200 - 100));
      out[1] = pyToZ(MAP.airbases[k + 1] + (r() * 120 - 60));
    } else {
      const c = MAP.cities[Math.floor(r() * MAP.cities.length)];
      out[0] = pxToX(c.x + (r() * 800 - 400));
      out[1] = pyToZ(c.y + (r() * 800 - 400));
    }
  }

  step(r: () => number, wp: number[]): void {
    if (Math.hypot(this.tx - this.x, this.tz - this.z) < 30 * PX_M) {
      this.waypoint(r, wp); // main.py:1441-1442
      this.tx = wp[0];
      this.tz = wp[1];
    }
    const want = Math.atan2(this.tx - this.x, -(this.tz - this.z));
    let d = want - this.heading;
    d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    this.heading += Math.max(-TURN_PER_FRAME, Math.min(TURN_PER_FRAME, d));
    this.x += Math.sin(this.heading) * this.speed * STEP;
    this.z -= Math.cos(this.heading) * this.speed * STEP;
  }

  sync(frame: number, night: boolean): void {
    const g = heightAt(this.x, this.z);
    this.group.position.set(this.x, g + this.agl, this.z);
    this.group.rotation.set(0.08, -this.heading, 0, 'YXZ'); // nose down a little, flying
    this.rotor.rotation.y = frame * 0.55; // main.py:1455
    this.tail.rotation.x = frame * 0.9;
    this.beacon.visible = night && (frame + Math.floor(this.x)) % 50 < 8; // main.py:1459
  }
}

export class Helicopters {
  private helis: Heli[] = [];
  private rand: () => number;
  private wp = [0, 0];

  constructor(scene: Scene) {
    let s = 4242; // main.py:1662 sky_rng
    this.rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < HELI_COUNT; i++) {
      const h = new Heli();
      h.waypoint(this.rand, this.wp);
      h.x = this.wp[0];
      h.z = this.wp[1];
      h.waypoint(this.rand, this.wp);
      h.tx = this.wp[0];
      h.tz = this.wp[1];
      h.heading = this.rand() * Math.PI * 2;
      h.agl = (600 + this.rand() * 1900) * FT; // main.py:1429 600-2,500 ft
      h.speed = (0.18 + this.rand() * 0.1) * PX_M * 60; // main.py:1430 0.18-0.28 px/frame (43-67 m/s)
      scene.add(h.group);
      this.helis.push(h);
    }
  }

  step(): void {
    for (const h of this.helis) h.step(this.rand, this.wp);
  }

  sync(frame: number, night: boolean): void {
    for (const h of this.helis) h.sync(frame, night);
  }
}
