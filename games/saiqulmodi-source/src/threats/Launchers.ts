// Ground launchers: 50 SAM batteries + 150 TELs, placed by main.py's rules (main.py:437-475),
// drawn with instanced meshes (a few draw calls for all 200).
import {
  BoxGeometry,
  CylinderGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  type Scene,
  SphereGeometry,
} from 'three';
import {
  coastX,
  pxToX,
  pyToZ,
  SAM_MISSILES_PER_SITE,
  SAM_RANGE_M,
  SAM_SITE_COUNT,
  SAM_SITE_HP,
  SAM_SITE_RELOAD,
  SAM_SPACING_PX,
  TEL_CAMOUFLAGED_SHARE,
  TEL_COUNT,
  TEL_HP,
  TEL_MISSILES,
  TEL_RANGE_M,
  TEL_SPACING_PX,
  WORLD_H_PX,
  WORLD_W_PX,
} from '../config';
import { MAP } from '../world/MapData';

export interface CityPx {
  x: number;
  y: number;
  r: number;
}
import type { Seeker } from './Missile';

export type LauncherKind = 'SAM' | 'TEL';

export class Launcher {
  missiles: number;
  hp: number;
  cooldown = 0;
  /** frames it stays visible after giving itself away (main.py "seen") */
  seen = 0;
  /** launch flash frames (main.py "flash") */
  flash = 0;
  readonly range: number;
  readonly name: string;
  readonly seeker: Seeker;

  constructor(
    readonly index: number,
    readonly kind: LauncherKind,
    readonly x: number,
    readonly y: number,
    readonly z: number,
    readonly phase: number,
    readonly camouflaged: boolean,
  ) {
    this.range = kind === 'SAM' ? SAM_RANGE_M : TEL_RANGE_M;
    this.missiles = kind === 'SAM' ? SAM_MISSILES_PER_SITE : TEL_MISSILES;
    this.hp = kind === 'SAM' ? SAM_SITE_HP : TEL_HP;
    // the battery carries the radar (main.py:843), a TEL has none (main.py:805-827)
    this.seeker = kind === 'SAM' ? 'RADAR' : 'IR';
    const n = kind === 'SAM' ? index + 1 : index - SAM_SITE_COUNT + 1;
    this.name = kind === 'SAM' ? `SAM-${String(n).padStart(2, '0')}` : `TEL-${String(n).padStart(3, '0')}`; // main.py:454, 471
  }

  /** main.py:801 launcher_visible */
  get visible(): boolean {
    return !this.camouflaged || this.seen > 0 || this.hp <= 0;
  }

  get armed(): boolean {
    return this.hp > 0 && this.missiles > 0;
  }

  reset(rand: () => number): void {
    this.cooldown = Math.floor(rand() * SAM_SITE_RELOAD); // main.py:457, 473
    this.missiles = this.kind === 'SAM' ? SAM_MISSILES_PER_SITE : TEL_MISSILES;
    this.hp = this.kind === 'SAM' ? SAM_SITE_HP : TEL_HP;
    this.seen = 0;
    this.flash = 0;
  }
}

/** main.py:437-475, in map px, then to metres. `ground` gives the terrain height; water is skipped. */
export function placeLaunchers(rand: () => number, cities: CityPx[], ground: (x: number, z: number) => number): Launcher[] {
  const out: Launcher[] = [];
  const pts: { x: number; y: number }[] = [];
  let spacing = SAM_SPACING_PX;
  let tries = 0;
  while (out.length < SAM_SITE_COUNT && tries < 200000) {
    tries++;
    if (tries % 4000 === 0) spacing *= 0.9; // main.py:443-444 safety net
    const sy = 300 + rand() * (WORLD_H_PX - 600); // main.py:445
    const sx = coastX(sy) + 260 + rand() * (WORLD_W_PX - 300 - coastX(sy) - 260); // main.py:446
    if (pts.some((p) => Math.hypot(p.x - sx, p.y - sy) < spacing)) continue; // main.py:447
    if (cities.some((c) => Math.hypot(c.x - sx, c.y - sy) < c.r + 140)) continue; // main.py:449
    if (MAP.nearRiver(sx, sy, 70)) continue; // main.py:451
    const x = pxToX(sx);
    const z = pyToZ(sy);
    const y = ground(x, z);
    if (y <= 0.5) continue; // our terrain's lakes / sea
    pts.push({ x: sx, y: sy });
    out.push(new Launcher(out.length, 'SAM', x, y, z, rand() * Math.PI * 2, false));
  }
  tries = 0;
  while (out.length < SAM_SITE_COUNT + TEL_COUNT && tries < 400000) {
    tries++;
    const sy = 200 + rand() * (WORLD_H_PX - 400); // main.py:464
    const sx = coastX(sy) + 150 + rand() * (WORLD_W_PX - 200 - coastX(sy) - 150); // main.py:465
    if (pts.some((p) => Math.hypot(p.x - sx, p.y - sy) < TEL_SPACING_PX)) continue; // main.py:466
    if (cities.some((c) => Math.hypot(c.x - sx, c.y - sy) < c.r + 40)) continue; // main.py:468
    const x = pxToX(sx);
    const z = pyToZ(sy);
    const y = ground(x, z);
    if (y <= 0.5) continue;
    pts.push({ x: sx, y: sy });
    out.push(new Launcher(out.length, 'TEL', x, y, z, rand() * Math.PI * 2, rand() < TEL_CAMOUFLAGED_SHARE)); // main.py:474
  }
  return out;
}

const _o = new Object3D();

/** All launchers as instanced meshes. Hidden (camouflaged, unseen) TELs are scaled to nothing. */
export class LauncherMeshes {
  private pads: InstancedMesh;
  private domes: InstancedMesh;
  private faces: InstancedMesh;
  private cans: InstancedMesh;
  private bodies: InstancedMesh;
  private cabs: InstancedMesh;
  private tubes: InstancedMesh;
  private telShown: boolean[] = [];
  private beaconRed: InstancedMesh;
  private beaconGreen: InstancedMesh;
  private greenOn: boolean[] = [];
  private samUp: boolean[] = [];
  private sams: Launcher[];
  private tels: Launcher[];

  constructor(scene: Scene, launchers: Launcher[]) {
    this.sams = launchers.filter((l) => l.kind === 'SAM');
    this.tels = launchers.filter((l) => l.kind === 'TEL');
    const ns = this.sams.length;
    const nt = this.tels.length;
    const mk = (geo: BoxGeometry | CylinderGeometry | SphereGeometry, color: number, count: number): InstancedMesh => {
      const m = new InstancedMesh(geo, new MeshLambertMaterial({ color }), count);
      m.frustumCulled = false;
      scene.add(m);
      return m;
    };
    // colours from main.py:839-853 (pad, dome, canisters) and 814-821 (TEL)
    this.pads = mk(new BoxGeometry(44, 1.5, 34), 0x40463e, ns);
    this.domes = mk(new SphereGeometry(6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xc4ced2, ns);
    this.faces = mk(new BoxGeometry(0.6, 5, 7), 0x00e6be, ns);
    this.cans = mk(new BoxGeometry(3, 8, 3), 0x505e3e, ns * 4);
    this.bodies = mk(new BoxGeometry(3.4, 2.6, 13), 0x545c3a, nt);
    this.cabs = mk(new BoxGeometry(3.4, 3.2, 3), 0x343a28, nt);
    this.tubes = mk(new CylinderGeometry(0.7, 0.7, 10, 8), 0x969c82, nt * 2);

    for (let i = 0; i < ns; i++) {
      const s = this.sams[i];
      this.put(this.pads, i, s.x, s.y + 0.6, s.z, s.phase, 1);
      this.put(this.domes, i, s.x - 10 * Math.cos(s.phase), s.y + 1.2, s.z + 10 * Math.sin(s.phase), 0, 1);
      for (let k = 0; k < 4; k++) {
        const ox = 4 + (k % 2) * 6;
        const oz = -5 + Math.floor(k / 2) * 8;
        const c = Math.cos(s.phase);
        const sn = Math.sin(s.phase);
        this.put(this.cans, i * 4 + k, s.x + ox * c + oz * sn, s.y + 5, s.z - ox * sn + oz * c, s.phase, 1);
      }
    }
    // night: red beacon on each radar, green when the battery is armed (main.py:2416-2423)
    const lamp = (hex: number): InstancedMesh => {
      const m = new MeshBasicMaterial({ color: hex });
      m.color.multiplyScalar(5);
      const im = new InstancedMesh(new SphereGeometry(2.2, 8, 6), m, ns);
      im.frustumCulled = false;
      im.visible = false;
      scene.add(im);
      return im;
    };
    this.beaconRed = lamp(0xff3228);
    this.beaconGreen = lamp(0x3cff78);
    for (let i = 0; i < ns; i++) {
      const s = this.sams[i];
      this.put(this.beaconRed, i, s.x - 10 * Math.cos(s.phase), s.y + 9, s.z + 10 * Math.sin(s.phase), 0, 1);
      this.put(this.beaconGreen, i, s.x + 16 * Math.cos(s.phase), s.y + 4, s.z - 16 * Math.sin(s.phase), 0, 1);
    }
    for (let i = 0; i < ns; i++) this.greenOn.push(true);
    this.beaconRed.instanceMatrix.needsUpdate = true;
    this.beaconGreen.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < nt; i++) this.telShown.push(true);
    this.update(0, true);
    this.pads.instanceMatrix.needsUpdate = true;
    this.domes.instanceMatrix.needsUpdate = true;
    this.cans.instanceMatrix.needsUpdate = true;
  }

  private put(m: InstancedMesh, i: number, x: number, y: number, z: number, yaw: number, s: number, pitch = 0): void {
    _o.position.set(x, y, z);
    _o.rotation.set(pitch, yaw, 0, 'YXZ');
    _o.scale.setScalar(s);
    _o.updateMatrix();
    m.setMatrixAt(i, _o.matrix);
  }

  /** Night beacons: the red one blinks (main.py:2416 (frame // 20) % 3 == 0), green while armed. */
  setNight(night: boolean, frame: number): void {
    this.beaconRed.visible = night && Math.floor(frame / 20) % 3 === 0;
    this.beaconGreen.visible = night;
    if (!night) return;
    let dirty = false;
    for (let i = 0; i < this.sams.length; i++) {
      const s = this.sams[i];
      const on = s.armed;
      if (on === this.greenOn[i]) continue;
      this.greenOn[i] = on;
      dirty = true;
      this.put(this.beaconGreen, i, s.x + 16 * Math.cos(s.phase), s.y + 4, s.z - 16 * Math.sin(s.phase), 0, on ? 1 : 0);
    }
    if (dirty) this.beaconGreen.instanceMatrix.needsUpdate = true;
  }

  /** Radar faces turn (main.py:847); hidden TELs show only while seen. */
  update(frame: number, force = false): void {
    // a destroyed battery loses its dome and canisters; the pad stays, burning (main.py:831-837)
    let samDirty = false;
    for (let i = 0; i < this.sams.length; i++) {
      const s = this.sams[i];
      const up = s.hp > 0;
      if (this.samUp[i] === up) continue;
      this.samUp[i] = up;
      samDirty = true;
      const k = up ? 1 : 0;
      this.put(this.domes, i, s.x - 10 * Math.cos(s.phase), s.y + 1.2, s.z + 10 * Math.sin(s.phase), 0, k);
      for (let c = 0; c < 4; c++) {
        const ox = 4 + (c % 2) * 6;
        const oz = -5 + Math.floor(c / 2) * 8;
        const cs = Math.cos(s.phase);
        const sn = Math.sin(s.phase);
        this.put(this.cans, i * 4 + c, s.x + ox * cs + oz * sn, s.y + 5, s.z - ox * sn + oz * cs, s.phase, k);
      }
    }
    if (samDirty) {
      this.domes.instanceMatrix.needsUpdate = true;
      this.cans.instanceMatrix.needsUpdate = true;
    }
    for (let i = 0; i < this.sams.length; i++) {
      const s = this.sams[i];
      const dx = s.x - 10 * Math.cos(s.phase);
      const dz = s.z + 10 * Math.sin(s.phase);
      const a = s.phase + frame * 0.02; // main.py:847 rotating array face
      this.put(this.faces, i, dx + Math.cos(a) * 4, s.y + 5, dz - Math.sin(a) * 4, a, s.hp > 0 ? 1 : 0);
    }
    this.faces.instanceMatrix.needsUpdate = true;
    let dirty = force;
    for (let i = 0; i < this.tels.length; i++) {
      const t = this.tels[i];
      const show = t.visible && t.hp > 0; // a destroyed TEL is a burning wreck
      if (show === this.telShown[i] && !force) continue;
      this.telShown[i] = show;
      dirty = true;
      const s = show ? 1 : 0;
      const c = Math.cos(t.phase);
      const sn = Math.sin(t.phase);
      this.put(this.bodies, i, t.x, t.y + 1.8, t.z, t.phase, s);
      this.put(this.cabs, i, t.x - 7.5 * sn, t.y + 2, t.z - 7.5 * c, t.phase, s);
      for (let k = 0; k < 2; k++) {
        const ox = k === 0 ? -0.9 : 0.9;
        this.put(this.tubes, i * 2 + k, t.x + ox * c + 1.5 * sn, t.y + 5, t.z - ox * sn + 1.5 * c, t.phase, s, -1.0);
      }
    }
    if (dirty) {
      this.bodies.instanceMatrix.needsUpdate = true;
      this.cabs.instanceMatrix.needsUpdate = true;
      this.tubes.instanceMatrix.needsUpdate = true;
    }
  }
}
