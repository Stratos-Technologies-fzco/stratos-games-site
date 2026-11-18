// The showcase behind the logo: a loop of short shots that show what is inside the game, no words.
//   1 the jet cruising at 35,000 ft with its contrail       4 the northern mountain range, low and fast
//   2 a heat-seeking missile launched at it, beaten by flares 5 a low pass over a city
//   3 a surveillance drone up close                          6 the same city at night, all its lights on
import { type PerspectiveCamera, Vector3 } from 'three';
import { FT, pxToX, pyToZ, STEP } from '../config';
import type { JetPhysics } from '../flight/JetPhysics';
import type { Launcher } from '../threats/Launchers';
import type { ThreatSystem } from '../threats/ThreatSystem';
import { heightAt } from '../world/Height';
import { MAP } from '../world/MapData';

export interface ShowcaseHost {
  jet: JetPhysics;
  threats: ThreatSystem;
  start: { x: number; z: number; heading: number };
  setDemoNight(on: boolean): void;
  clearFx(): void;
  snapChase(): void;
  /** rebuild the ground round (x, z) at once (a cut can jump tens of km) */
  snapTerrain(x: number, z: number): void;
}

interface Shot {
  dur: number;
  setup(): void;
  step?(t: number): void;
  /** true when the shot places the camera itself */
  camera?(cam: PerspectiveCamera, t: number, dt: number): boolean;
}

const EAST = Math.PI / 2;
const _a = new Vector3();
const _b = new Vector3();
const _fwd = new Vector3();
const _right = new Vector3();
const _up = new Vector3(0, 1, 0);
const _camPos = new Vector3();
const _look = new Vector3();

export class Showcase {
  /** missiles in this shot should home on the showcase jet */
  tracking = false;
  private shots: Shot[];
  private index = -1;
  private t = 0;
  private cut: HTMLElement | null = document.getElementById('cut');
  private camInit = false;

  constructor(private host: ShowcaseHost) {
    const { jet, threats } = host;
    // the battery and city used by the shots: a TEL on low ground, a city in the farmland, a snow-capped peak
    const tel = threats.launchers.find((l) => l.kind === 'TEL' && l.y < 400 && l.z > -2000 && l.z < 6000 && l.x > -15000 && l.x < 10000) ?? threats.launchers[0];
    const city = MAP.cities[4];
    const cityX = pxToX(city.x);
    const cityZ = pyToZ(city.y);
    const cityY = heightAt(cityX, cityZ);
    const peak = MAP.peaks.filter((p) => p.snow).sort((a, b) => b.r - a.r)[3] ?? MAP.peaks[0];
    const peakX = pxToX(peak.x);
    const peakZ = pyToZ(peak.y) + 1500;
    let flared = false;

    const place = (x: number, y: number, z: number, heading: number): void => {
      jet.reset(x, z, heading);
      jet.pos.y = y;
    };
    const missileOf = (l: Launcher) => {
      const items = threats.missiles.items;
      for (let i = 0; i < items.length; i++) if (items[i].active && items[i].launcher === l.index) return items[i];
      return null;
    };

    this.shots = [
      {
        dur: 7,
        setup: () => {
          place(host.start.x, 35000 * FT, host.start.z, host.start.heading);
          host.snapChase();
        },
      },
      {
        dur: 9,
        setup: () => {
          place(tel.x - 2600, tel.y + 3000, tel.z + 300, EAST);
          flared = false;
          this.tracking = true;
        },
        step: (t) => {
          if (t > 0.4 && t < 0.42) threats.launch(tel, jet, true);
          const m = missileOf(tel);
          if (m && !flared && m.pos.distanceTo(jet.pos) < 900 && m.climbShare > 0.5) {
            threats.cm.fireFlares(jet.pos, jet.vel);
            flared = true;
          }
        },
        camera: (cam, _t, dt) => {
          // over the jet's right shoulder, looking down at the missile climbing toward it
          _fwd.copy(jet.vel).normalize();
          _right.crossVectors(_fwd, _up).normalize();
          _camPos.copy(jet.pos).addScaledVector(_right, 55).addScaledVector(_up, 30).addScaledVector(_fwd, -95);
          const m = missileOf(tel);
          _look.copy(jet.pos).addScaledVector(_fwd, 120);
          if (m) _look.lerp(m.pos, Math.min(0.12, 150 / Math.max(150, m.pos.distanceTo(jet.pos)))); // keep the jet in frame
          this.ease(cam, _camPos, _look, dt, 3);
          return true;
        },
      },
      {
        dur: 6,
        setup: () => {
          const d = threats.drones[0];
          place(d.x - 6000, d.y + 800, d.z, EAST);
        },
        camera: (cam, t, dt) => {
          const d = threats.drones[0];
          const a = t * 0.35 + 0.6;
          _b.set(d.x, d.y, d.z);
          _camPos.set(d.x + Math.cos(a) * 55, d.y + 12, d.z + Math.sin(a) * 55);
          this.ease(cam, _camPos, _b, dt, 8);
          return true;
        },
      },
      {
        dur: 7,
        setup: () => {
          let top = 0;
          for (let k = 0; k < 12; k++) top = Math.max(top, heightAt(peakX - 7000 + k * 900, peakZ));
          place(peakX - 7000, top + 450, peakZ, EAST);
          host.snapChase();
        },
      },
      {
        dur: 6,
        setup: () => {
          place(cityX - 3500, cityY + 420, cityZ + 200, EAST);
          host.snapChase();
        },
      },
      {
        dur: 7,
        setup: () => {
          host.setDemoNight(true);
          place(cityX - 2500, cityY + 600, cityZ - 300, EAST);
        },
        camera: (cam, t, dt) => {
          const a = 2.3 + t * 0.06;
          _camPos.set(cityX + Math.cos(a) * 3200, cityY + 1100, cityZ + Math.sin(a) * 3200);
          _b.set(cityX, cityY + 60, cityZ);
          this.ease(cam, _camPos, _b, dt, 6);
          return true;
        },
      },
    ];
  }

  /** (Re)start the loop from the first shot. */
  begin(): void {
    this.index = -1;
    this.next();
  }

  /** Leave the showcase (the player pressed play). */
  end(): void {
    this.host.setDemoNight(false);
    this.tracking = false;
  }

  private next(): void {
    this.host.setDemoNight(false);
    this.tracking = false;
    this.index = (this.index + 1) % this.shots.length;
    this.t = 0;
    this.camInit = false;
    this.host.threats.reset((Date.now() & 0x7fffffff) | 1);
    this.host.clearFx();
    this.shots[this.index].setup();
    this.host.snapTerrain(this.host.jet.pos.x, this.host.jet.pos.z);
    if (this.cut) {
      this.cut.classList.add('on');
      requestAnimationFrame(() => this.cut?.classList.remove('on'));
    }
  }

  /** One 60 Hz frame. */
  step(): void {
    if (this.index < 0) return;
    this.t += STEP;
    const shot = this.shots[this.index];
    if (shot.step) shot.step(this.t);
    // never let the showcase jet touch the ground
    const jet = this.host.jet;
    const g = heightAt(jet.pos.x, jet.pos.z);
    if (jet.pos.y < g + 150) jet.pos.y = g + 150;
    if (this.t >= shot.dur) this.next();
  }

  /** Places the camera for shots that frame things themselves; false = use the chase camera. */
  camera(cam: PerspectiveCamera, dt: number): boolean {
    if (this.index < 0) return false;
    const shot = this.shots[this.index];
    return shot.camera ? shot.camera(cam, this.t, dt) : false;
  }

  private ease(cam: PerspectiveCamera, pos: Vector3, look: Vector3, dt: number, rate: number): void {
    if (!this.camInit) {
      cam.position.copy(pos);
      _a.copy(look);
      this.camInit = true;
    } else {
      cam.position.lerp(pos, 1 - Math.exp(-rate * dt));
      _a.lerp(look, 1 - Math.exp(-rate * dt));
    }
    cam.up.set(0, 1, 0);
    cam.lookAt(_a);
    if (cam.fov !== 60) {
      cam.fov = 60;
      cam.updateProjectionMatrix();
    }
  }
}
