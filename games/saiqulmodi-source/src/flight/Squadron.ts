// The squadron (main.py:863-945, 1600-1640, 2147-2187): 10 jets, you fly one; the other 9 patrol in 4 flights,
// each on its own racetrack CAP station in the war zone near the front, in its own formation, keeping
// 2,200 px (8.8 km) from the jet you fly, moving to a new station every 60 s. Flights only patrol: every action
// belongs to the jet you fly (main.py:2187). TAB switches to the next jet (main.py:1936).
import { Euler, type Scene, Vector3 } from 'three';
import { coastX, CRUISE_ALT_FT, FT, JET_CRUISE_MPS, LEVEL_MULT, PX_M, pxToX, pyToZ, STEP, WORLD_H_PX, WORLD_W_PX } from '../config';
import { MAP } from '../world/MapData';
import { JetModel } from './JetModel';

export const CALLSIGNS = ['VIPER-1', 'EAGLE-2', 'GHOST-3', 'TITAN-4', 'HAWK-5', 'FALCON-6', 'RAVEN-7', 'SHADOW-8', 'VALKYRIE-9', 'OMEGA-10']; // main.py:866
const FLIGHTS: [string, number[], string][] = [
  ['ALPHA', [0, 1, 2], 'V'], // main.py:941
  ['BRAVO', [3, 4], 'ECHELON'],
  ['CHARLIE', [5, 6, 7], 'LINE'],
  ['DELTA', [8, 9], 'TRAIL'],
];
const CAP_RACETRACK_PX = 700; // main.py:943
const CAP_RETASK_FRAMES = 3600; // main.py:944
const FLIGHT_STANDOFF_PX = 2200; // main.py:945
const JET_REJOIN_FRAMES = 180; // main.py:80
/** main.py:2067 turn_rate = speed / 40 rad/frame (speed in px/frame) */
const TURN_PER_FRAME = 0.35 / 40;

export class Wingjet {
  readonly pos = new Vector3();
  heading = 0; // compass, rad (0 = north, -z)
  bank = 0;
  alive = true;
  downTimer = 0;
  readonly model: JetModel;
  constructor(readonly id: number, readonly callsign: string, readonly hue: number) {
    this.model = new JetModel(hue);
  }
}

interface Flight {
  name: string;
  ids: number[];
  style: string;
  track: [number, number, number, number]; // x1, z1, x2, z2 (m)
  station: [number, number];
  wp: number;
  retask: number;
  /** reused list of its flying members (no allocation per frame) */
  m: Wingjet[];
}

const _euler = new Euler(0, 0, 0, 'YXZ');

export class Squadron {
  readonly jets: Wingjet[] = [];
  private flights: Flight[] = [];
  /** the jet you fly */
  active = 0;
  private rand: () => number;

  constructor(scene: Scene) {
    let s = 35000; // main.py:1598 war_rng
    this.rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < CALLSIGNS.length; i++) {
      const j = new Wingjet(i, CALLSIGNS[i], (i * 36) % 360); // main.py:1601 hue
      scene.add(j.model.group);
      this.jets.push(j);
    }
    for (const [name, ids, style] of FLIGHTS) {
      this.flights.push({ name, ids, style, track: [0, 0, 0, 0], station: [0, 0], wp: 0, retask: 0, m: [] });
    }
  }

  get callsign(): string {
    return this.jets[this.active].callsign;
  }

  /** main.py:1630-1640: every flight on a station, members in formation */
  reset(playerX: number, playerZ: number): void {
    this.active = 0;
    for (const j of this.jets) {
      j.alive = true;
      j.downTimer = 0;
    }
    for (const f of this.flights) {
      this.pickStation(f, playerX, playerZ);
      const members = this.members(f);
      if (members.length === 0) continue;
      const lead = members[0];
      lead.pos.set(f.track[0], CRUISE_ALT_FT * FT, f.track[1]);
      lead.heading = Math.atan2(f.track[2] - f.track[0], -(f.track[3] - f.track[1]));
      for (let r = 1; r < members.length; r++) {
        this.slot(lead, r - 1, f.style, members[r].pos);
        members[r].heading = lead.heading;
      }
    }
  }

  /** alive members of a flight minus the jet you fly; the first one leads (main.py:1626-1628) */
  private members(f: Flight): Wingjet[] {
    const out = f.m;
    out.length = 0;
    for (let i = 0; i < f.ids.length; i++) {
      const id = f.ids[i];
      if (id !== this.active && this.jets[id].alive) out.push(this.jets[id]);
    }
    return out;
  }

  /** main.py:1607-1624 a station in the war zone round the front, far from the jet you fly and from the others */
  private pickStation(f: Flight, playerX: number, playerZ: number): void {
    const ppx = playerX / PX_M + WORLD_W_PX / 2;
    const ppy = playerZ / PX_M + WORLD_H_PX / 2;
    let x = 0;
    let y = 0;
    let ok = false;
    for (let k = 0; k < 400 && !ok; k++) {
      y = 700 + this.rand() * (WORLD_H_PX - 1300);
      const bx = MAP.borderX(y);
      const lo = Math.max(coastX(y) + 600, bx - 2600);
      const hi = Math.min(WORLD_W_PX - 900, bx + 700);
      x = lo + this.rand() * (hi - lo);
      ok = Math.hypot(x - ppx, y - ppy) > FLIGHT_STANDOFF_PX + 300;
      for (const g of this.flights) {
        if (g === f || g.retask === 0) continue;
        const gx = g.station[0] / PX_M + WORLD_W_PX / 2;
        const gy = g.station[1] / PX_M + WORLD_H_PX / 2;
        if (Math.hypot(x - gx, y - gy) < 1200) ok = false;
      }
    }
    if (!ok) {
      // the player sits in the war zone: the far west instead (main.py:1616-1618)
      y = 700 + this.rand() * (WORLD_H_PX - 1300);
      x = ppx > WORLD_W_PX / 2 ? coastX(y) + 900 : WORLD_W_PX - 1200;
    }
    const a = this.rand() * Math.PI;
    const dx = Math.cos(a) * CAP_RACETRACK_PX;
    const dy = Math.sin(a) * CAP_RACETRACK_PX;
    f.track = [pxToX(x + dx), pyToZ(y + dy), pxToX(x - dx), pyToZ(y - dy)];
    f.station = [pxToX(x), pyToZ(y)];
    f.wp = 0;
    f.retask = CAP_RETASK_FRAMES + Math.floor(this.rand() * 1200);
  }

  /** main.py:922-936 formation slot of wingman `rank` behind its lead */
  private slot(lead: Wingjet, rank: number, style: string, out: Vector3): void {
    let back: number;
    let lateral: number;
    if (style === 'ECHELON') {
      back = (rank + 1) * 60;
      lateral = (rank + 1) * 60;
    } else if (style === 'LINE') {
      back = 0;
      lateral = (rank % 2 === 0 ? -1 : 1) * (Math.floor(rank / 2) + 1) * 80;
    } else if (style === 'TRAIL') {
      back = (rank + 1) * 90;
      lateral = 0;
    } else {
      const r = Math.floor(rank / 2) + 1;
      back = r * 70;
      lateral = (rank % 2 === 0 ? -1 : 1) * r * 62;
    }
    // px -> m, a little closer than the map scale so the formation reads as one
    const fx = Math.sin(lead.heading);
    const fz = -Math.cos(lead.heading);
    const k = PX_M * 0.5;
    out.set(lead.pos.x - fx * back * k - fz * lateral * k, lead.pos.y, lead.pos.z - fz * back * k + fx * lateral * k);
  }

  /** One 60 Hz frame (main.py:2147-2187). */
  step(playerX: number, playerZ: number): void {
    // replacements for downed jets rejoin their flight (main.py:2148-2162)
    for (const j of this.jets) {
      if (j.alive || j.id === this.active) continue;
      if (--j.downTimer > 0) continue;
      j.alive = true;
      const f = this.flights.find((g) => g.ids.includes(j.id));
      const ref = f ? this.members(f).find((m) => m !== j) : undefined;
      const h = ref ? ref.heading : 0;
      const bx = ref ? ref.pos.x : f ? f.track[0] : 0;
      const bz = ref ? ref.pos.z : f ? f.track[1] : 0;
      j.pos.set(bx - Math.sin(h) * 520 * PX_M * 0.5, CRUISE_ALT_FT * FT, bz + Math.cos(h) * 520 * PX_M * 0.5);
      j.heading = h;
    }
    const v = JET_CRUISE_MPS * LEVEL_MULT;
    const turn = TURN_PER_FRAME * LEVEL_MULT;
    const _slot = _tmp;
    for (const f of this.flights) {
      const members = this.members(f);
      if (members.length === 0) continue;
      f.retask--;
      if (f.retask <= 0 || Math.hypot(f.station[0] - playerX, f.station[1] - playerZ) < FLIGHT_STANDOFF_PX * PX_M) this.pickStation(f, playerX, playerZ);
      const lead = members[0];
      const wx = f.track[f.wp * 2];
      const wz = f.track[f.wp * 2 + 1];
      if (Math.hypot(wx - lead.pos.x, wz - lead.pos.z) < 90 * PX_M * 3) f.wp = 1 - f.wp; // main.py:2175-2176
      const want = Math.atan2(wx - lead.pos.x, -(wz - lead.pos.z));
      let d = want - lead.heading;
      d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      const dh = Math.max(-turn, Math.min(turn, d));
      lead.heading += dh;
      lead.bank += (Math.max(-1, Math.min(1, dh / turn)) * 0.9 - lead.bank) * 0.05;
      lead.pos.x += Math.sin(lead.heading) * v * STEP;
      lead.pos.z -= Math.cos(lead.heading) * v * STEP;
      lead.pos.y += (CRUISE_ALT_FT * FT - lead.pos.y) * 0.004; // back to 35,000 ft
      for (let r = 1; r < members.length; r++) {
        const w = members[r];
        this.slot(lead, r - 1, f.style, _slot);
        // fly the lead's course and slide into the slot
        w.pos.x += Math.sin(lead.heading) * v * STEP;
        w.pos.z -= Math.cos(lead.heading) * v * STEP;
        w.pos.lerp(_slot, 0.02);
        let dw = lead.heading - w.heading;
        dw = ((dw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        w.heading += dw * 0.08;
        w.bank += (lead.bank - w.bank) * 0.08;
      }
    }
  }

  /** The jet you were flying is down: it is out until its replacement rejoins (main.py:2319). */
  downActive(): void {
    const j = this.jets[this.active];
    j.alive = false;
    j.downTimer = JET_REJOIN_FRAMES;
  }

  /** main.py:1707-1712 the next alive jet after `start` */
  nextAlive(step = 1): number {
    for (let k = 1; k <= this.jets.length; k++) {
      const j = (this.active + k * step + this.jets.length * 10) % this.jets.length;
      if (this.jets[j].alive) return j;
    }
    return this.active;
  }

  /** Hand the jet you fly back to its flight (at your position) and take over `idx`. */
  switchTo(idx: number, fromPos: Vector3, fromHeading: number): void {
    const old = this.jets[this.active];
    old.pos.copy(fromPos);
    old.heading = fromHeading;
    old.bank = 0;
    this.active = idx;
  }

  /** Draw-side for the 9 others (the jet you fly is placed by the main loop from its physics). */
  sync(night: boolean, frame: number): void {
    for (const j of this.jets) {
      if (j.id === this.active) continue; // the main loop draws the jet you fly
      const show = j.alive;
      j.model.group.visible = show;
      if (!show) continue;
      j.model.group.position.copy(j.pos);
      _euler.set(0, -j.heading, -j.bank);
      j.model.group.rotation.copy(_euler);
      j.model.setFlame(0.7, false, frame / 60);
      j.model.setNight(night, frame + j.id * 13);
    }
  }
}

const _tmp = new Vector3();
