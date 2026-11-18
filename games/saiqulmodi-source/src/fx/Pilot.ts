// The ejected pilot (main.py:1232-1297 EjectedPilot): the seat fires clear of the wreck, free-falls for a moment
// (60 frames when ejected above 12,000 ft, else 15), then the 7-colour canopy opens (main.py:1232 CANOPY_COLORS)
// and the pilot comes down under it, drifting with the wind, swaying, until landing.
import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { FT, PX_M, STEP } from '../config';

// main.py:1232-1233, the seven canopy colours
const CANOPY_COLORS = [0xe63c3c, 0xf58c28, 0xf5dc3c, 0x46be50, 0x3c8ce6, 0x5046c8, 0xa050d2];
const FREEFALL_HIGH = 60; // main.py:1238
const FREEFALL_LOW = 15; // main.py:1248
// main.py falls 45 ft/frame under the canopy and 110 before it opens (main.py:1268, 1272): a top-down shortcut that
// lands the pilot in seconds. Here the canopy brings the pilot down in about 13 s from any height, time to think.
const DESCENT_S = 13;
const MIN_DESCENT_MPS = 6;
const FREE_FALL_MPS = 45;
const WIND = [0.3 * 0.5 * PX_M * 60, -0.1 * 0.5 * PX_M * 60]; // main.py:1266 drifts with WIND * 0.5
const CANOPY_R = 5; // m
const OPEN_FRAMES = 40; // the canopy blossoms open

export class Pilot {
  readonly group = new Group();
  readonly pos = new Vector3();
  private vel = new Vector3();
  private canopy = new Group();
  private seat: Mesh;
  private cords: LineSegments;
  age = 0;
  freefall = FREEFALL_HIGH;
  landed = false;
  landedFor = 0;
  active = false;
  private sink = MIN_DESCENT_MPS;

  constructor() {
    // canopy: seven coloured gores of a dome (main.py:1286-1289 draws seven wedges)
    const gore = (Math.PI * 2) / CANOPY_COLORS.length;
    CANOPY_COLORS.forEach((c, k) => {
      const m = new Mesh(
        new SphereGeometry(CANOPY_R, 6, 8, k * gore, gore, 0, Math.PI * 0.42),
        new MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.25, side: DoubleSide }),
      );
      m.scale.set(1, 0.65, 1);
      this.canopy.add(m);
    });
    // white rim (main.py:1290)
    const rim = new Mesh(new CylinderGeometry(CANOPY_R * 0.97, CANOPY_R * 0.97, 0.15, 28, 1, true), new MeshLambertMaterial({ color: 0xfafafa, side: DoubleSide }));
    rim.position.y = CANOPY_R * 0.65 * Math.cos(Math.PI * 0.42);
    this.canopy.add(rim);
    this.canopy.position.y = 7;
    this.group.add(this.canopy);
    // suspension lines from the rim to the pilot
    const pts: number[] = [];
    const rimY = 7 + rim.position.y;
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      pts.push(Math.cos(a) * CANOPY_R * 0.95, rimY, Math.sin(a) * CANOPY_R * 0.95, 0, 1.2, 0);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
    this.cords = new LineSegments(g, new LineBasicMaterial({ color: 0xdddddd }));
    this.group.add(this.cords);
    // the pilot: flight suit, helmet
    const body = new Mesh(new CylinderGeometry(0.28, 0.24, 1.3, 8), new MeshLambertMaterial({ color: 0x5a6a3a }));
    body.position.y = 0.6;
    const helmet = new Mesh(new SphereGeometry(0.22, 10, 8), new MeshLambertMaterial({ color: 0xf0f0f0 }));
    helmet.position.y = 1.45;
    this.group.add(body, helmet);
    // the seat, only while free-falling (main.py:1281)
    this.seat = new Mesh(new CylinderGeometry(0.45, 0.45, 1.6, 6), new MeshLambertMaterial({ color: 0x3c3c3c }));
    this.seat.position.y = 0.6;
    this.group.add(this.seat);
    this.group.visible = false;
  }

  get chuteOpen(): boolean {
    return this.age > this.freefall; // main.py:1253
  }

  /** main.py:1241-1250: out to the side of the wreck, carrying 0.6 of its speed */
  eject(jetPos: Vector3, jetVel: Vector3): void {
    this.pos.copy(jetPos);
    this.vel.set(jetVel.x * 0.6, 35, jetVel.z * 0.6);
    this.freefall = jetPos.y / FT > 12000 ? FREEFALL_HIGH : FREEFALL_LOW;
    this.age = 0;
    this.landed = false;
    this.landedFor = 0;
    this.active = true;
    this.group.visible = true;
  }

  /** One frame. `ground` is the height under the pilot. */
  step(ground: number): void {
    if (!this.active) return;
    this.age++;
    if (this.landed) {
      this.landedFor++;
      return;
    }
    if (this.chuteOpen) {
      if (this.age === this.freefall + 1) this.sink = Math.max(MIN_DESCENT_MPS, (this.pos.y - ground) / DESCENT_S);
      // canopy: slow descent, drifting with the wind (main.py:1265-1268); it brakes in as the canopy fills
      this.vel.x += (WIND[0] - this.vel.x) * 0.03;
      this.vel.z += (WIND[1] - this.vel.z) * 0.03;
      this.pos.y -= this.sink * STEP;
    } else {
      this.vel.x *= 0.97; // main.py:1270-1272
      this.vel.z *= 0.97;
      this.vel.y *= 0.9;
      this.pos.y += this.vel.y * STEP - FREE_FALL_MPS * STEP * Math.min(1, this.age / 30);
    }
    this.pos.x += this.vel.x * STEP;
    this.pos.z += this.vel.z * STEP;
    if (this.pos.y <= ground) {
      this.pos.y = ground;
      this.landed = true;
    }
  }

  /** Draw-side. */
  sync(): void {
    if (!this.active) return;
    this.group.position.copy(this.pos);
    const open = this.chuteOpen ? Math.min(1, (this.age - this.freefall) / OPEN_FRAMES) : 0;
    // the canopy blossoms open, then the pilot sways under it
    const s = this.landed ? 1 : open * (1.15 - 0.15 * Math.cos(open * Math.PI));
    this.canopy.scale.set(s || 0.001, (this.landed ? 0.25 : s) || 0.001, s || 0.001);
    this.canopy.visible = open > 0;
    this.cords.visible = open > 0.6 && !this.landed;
    this.seat.visible = !this.chuteOpen;
    this.group.rotation.z = this.landed ? 0 : Math.sin(this.age * 0.035) * 0.12 * open;
    this.group.rotation.x = this.landed ? 0 : Math.sin(this.age * 0.027 + 1) * 0.08 * open;
    if (this.landed) this.canopy.position.set(4, 0.6, 0); // the canopy spread on the ground (main.py:1292-1294)
    else this.canopy.position.set(0, 7, 0);
  }

  hide(): void {
    this.active = false;
    this.group.visible = false;
  }
}
