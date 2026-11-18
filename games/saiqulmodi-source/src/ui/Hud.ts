// HUD (main.py:2506-2570 in 3D): speed, altitude, heading, G, throttle, HP, flare + ECM reload bars,
// RWR arrows (bearing, distance, closing speed) round the screen centre, the lock warning with the countermeasure
// advice line, red flashing border, ECM ring, message log (main.py:1704), and screen markers for launchers,
// drones and missiles. DOM text is only rewritten when it changes; nothing is created per frame.
import { type PerspectiveCamera, Vector3 } from 'three';
import { ALT_MIN_FT, CHAFF_RELOAD, ECM_RELOAD, FLARE_RELOAD, FT, JET_HP, ROCKET_WARN_COS, ROCKET_WARN_RANGE_M } from '../config';
import type { JetPhysics } from '../flight/JetPhysics';
import type { ThreatSystem } from '../threats/ThreatSystem';
import type { Weapons } from '../weapons/Weapons';

const BOMB_MARKS = 6;

const MS_TO_KT = 1.943844;
const MARK_LAUNCHERS = 24;
const MARK_DRONES = 12;
const RWR_ARROWS = 8;
const LAUNCHER_MARK_RANGE = 14000;
const DRONE_MARK_RANGE = 22000;
const MSG_LINES = 5; // main.py:1659
const MSG_FRAMES = 180; // main.py:1705

const _p = new Vector3();
const _rel = new Vector3();
const _vrel = new Vector3();
const _p2 = new Vector3();

function el(parent: HTMLElement, cls: string, text = ''): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = text;
  parent.appendChild(d);
  return d;
}

class Text {
  private last = '';
  constructor(readonly node: HTMLElement) {}
  set(s: string): void {
    if (s !== this.last) {
      this.node.textContent = s;
      this.last = s;
    }
  }
}

export class Hud {
  readonly root: HTMLDivElement;
  private spd: Text;
  private rwyNode: HTMLDivElement;
  private rwyText: Text;
  private mach: Text;
  private alt: Text;
  private agl: Text;
  private hdg: Text;
  private g: Text;
  private thr: Text;
  private hpText: Text;
  private hpFill: HTMLDivElement;
  private flareFill: HTMLDivElement;
  private flareText: Text;
  private chaffFill: HTMLDivElement;
  private chaffText: Text;
  private ecmFill: HTMLDivElement;
  private bombMarks: HTMLDivElement[] = [];
  private ecmText: Text;
  private warn: Text;
  private warnNode: HTMLDivElement;
  private advice: Text;
  private adviceNode: HTMLDivElement;
  private caution: Text;
  private border: HTMLDivElement;
  private ecmRing: HTMLDivElement;
  private arrows: HTMLDivElement[] = [];
  private arrowText: Text[] = [];
  private launcherMarks: HTMLDivElement[] = [];
  private launcherText: Text[] = [];
  private droneMarks: HTMLDivElement[] = [];
  private missileMarks: HTMLDivElement[] = [];
  private missileText: Text[] = [];
  private msgNodes: Text[] = [];
  private msgText: string[] = [];
  private msgLife: number[] = [];
  // nearest launchers this frame (fixed arrays, no allocation)
  private nearIdx = new Int32Array(MARK_LAUNCHERS);
  private nearD = new Float64Array(MARK_LAUNCHERS);
  private tag!: Text;
  private p2Node!: HTMLDivElement;
  private p2Text!: Text;
  private lastHp = -1;
  private tick = 0;

  constructor(parent: HTMLElement) {
    const r = el(parent, 'hud');
    this.root = r;
    this.border = el(r, 'hud-border');
    this.ecmRing = el(r, 'hud-ecm-ring');
    const left = el(r, 'hud-box hud-left');
    el(left, 'hud-label', 'SPEED');
    this.spd = new Text(el(left, 'hud-big'));
    this.mach = new Text(el(left, 'hud-small'));
    const right = el(r, 'hud-box hud-right');
    el(right, 'hud-label', 'ALTITUDE');
    this.alt = new Text(el(right, 'hud-big'));
    this.agl = new Text(el(right, 'hud-small'));
    const top = el(r, 'hud-top');
    this.hdg = new Text(el(top, 'hud-hdg'));
    this.tag = new Text(el(top, 'hud-small hud-tag')); // main.py:2531 [callsign] + level
    const hp = el(top, 'hud-hp');
    const bar = el(hp, 'hud-hp-bar');
    this.hpFill = el(bar, 'hud-hp-fill');
    this.hpText = new Text(el(hp, 'hud-small'));
    const bl = el(r, 'hud-box hud-bl');
    this.g = new Text(el(bl, 'hud-mid'));
    this.thr = new Text(el(bl, 'hud-small'));
    const cmRow = (label: string, cls: string): [HTMLDivElement, Text] => {
      const row = el(bl, 'hud-cm');
      el(row, 'hud-cm-label', label);
      const b = el(row, 'hud-cm-bar');
      const fill = el(b, `hud-cm-fill ${cls}`);
      return [fill, new Text(el(row, 'hud-cm-state'))];
    };
    [this.flareFill, this.flareText] = cmRow('FLARES', 'flare'); // main.py:2536-2540 reload bars
    [this.chaffFill, this.chaffText] = cmRow('CHAFF', 'chaff');
    [this.ecmFill, this.ecmText] = cmRow('ECM', 'ecm');
    this.warnNode = el(r, 'hud-warn');
    this.warn = new Text(this.warnNode);
    this.adviceNode = el(r, 'hud-advice');
    this.advice = new Text(this.adviceNode);
    this.caution = new Text(el(r, 'hud-caution'));
    this.p2Node = el(r, 'mark mark-p2'); // main.py:2572-2583 player 2's pick
    this.p2Node.style.display = 'none';
    this.p2Text = new Text(this.p2Node);
    this.rwyNode = el(r, 'mark mark-rwy'); // the nearest runway, always marked (SkyForge fighter)
    this.rwyNode.style.display = 'none';
    this.rwyText = new Text(this.rwyNode);
    const log = el(r, 'hud-log');
    for (let i = 0; i < MSG_LINES; i++) {
      this.msgNodes.push(new Text(el(log, 'hud-log-line')));
      this.msgText.push('');
      this.msgLife.push(0);
    }
    for (let i = 0; i < RWR_ARROWS; i++) {
      const a = el(r, 'rwr-arrow');
      el(a, 'rwr-tip');
      this.arrowText.push(new Text(el(a, 'rwr-label')));
      a.style.display = 'none';
      this.arrows.push(a);
    }
    for (let i = 0; i < MARK_LAUNCHERS; i++) {
      const m = el(r, 'mark mark-site');
      m.style.display = 'none';
      this.launcherMarks.push(m);
      this.launcherText.push(new Text(m));
    }
    for (let i = 0; i < BOMB_MARKS; i++) {
      const m = el(r, 'mark mark-bomb'); // main.py:1326-1329 impact marker
      m.style.display = 'none';
      this.bombMarks.push(m);
    }
    for (let i = 0; i < MARK_DRONES; i++) {
      const m = el(r, 'mark mark-drone', 'UAV');
      m.style.display = 'none';
      this.droneMarks.push(m);
    }
    for (let i = 0; i < RWR_ARROWS; i++) {
      const m = el(r, 'mark mark-missile');
      m.style.display = 'none';
      this.missileMarks.push(m);
      this.missileText.push(new Text(m));
    }
  }

  setTag(s: string): void {
    this.tag.set(s);
  }

  /** the nearest runway in the view: marker with its name and distance */
  rwyMark(at: Vector3 | null, text: string, cam: PerspectiveCamera, w: number, h: number): void {
    if (!at) {
      this.rwyNode.style.display = 'none';
      return;
    }
    if (this.place(this.rwyNode, at, cam, w, h)) this.rwyText.set(text);
  }

  /** player 2's picked launcher: bracket and its state (main.py:2572-2583) */
  p2Mark(l: { x: number; y: number; z: number } | null, text: string, cam: PerspectiveCamera, w: number, h: number): void {
    if (!l) {
      this.p2Node.style.display = 'none';
      return;
    }
    _p2.set(l.x, l.y + 10, l.z);
    if (this.place(this.p2Node, _p2, cam, w, h)) this.p2Text.set(text);
  }

  show(on: boolean): void {
    this.root.style.display = on ? 'block' : 'none';
  }

  /** main.py:1704 say(): newest line at the bottom, 3 s each, 5 lines */
  say(text: string): void {
    // the page's mission layer (public/mission.js) coaches from these lines
    try { window.dispatchEvent(new CustomEvent('fighter-say', { detail: String(text) })); } catch { /* never break the HUD */ }
    for (let i = 0; i < MSG_LINES - 1; i++) {
      this.msgText[i] = this.msgText[i + 1];
      this.msgLife[i] = this.msgLife[i + 1];
    }
    this.msgText[MSG_LINES - 1] = text;
    this.msgLife[MSG_LINES - 1] = MSG_FRAMES;
  }

  clearLog(): void {
    for (let i = 0; i < MSG_LINES; i++) {
      this.msgText[i] = '';
      this.msgLife[i] = 0;
      this.msgNodes[i].set('');
    }
  }

  /** guided missiles tracking the jet right now */
  static lockCount(ts: ThreatSystem): number {
    let n = 0;
    const items = ts.missiles.items;
    for (let i = 0; i < items.length; i++) if (items[i].active && items[i].tracking) n++;
    return n;
  }

  update(jet: JetPhysics, groundM: number, cam: PerspectiveCamera, ts: ThreatSystem, weapons: Weapons, w: number, h: number): void {
    this.tick++;
    const slow = this.tick % 4 === 0; // numbers at 15 Hz, markers and arrows every frame
    const v = jet.speed;
    if (slow) {
      this.spd.set(`${Math.round(v * MS_TO_KT)} KT`);
      this.mach.set(`M ${jet.mach.toFixed(2)}`);
      const altFt = jet.pos.y / FT;
      this.alt.set(`${(Math.round(altFt / 10) * 10).toLocaleString('en-US')} FT`);
      this.agl.set(`AGL ${Math.round(Math.max(0, jet.pos.y - groundM) / FT).toLocaleString('en-US')} FT`);
      this.hdg.set(`HDG ${String(Math.round(jet.headingDeg) % 360).padStart(3, '0')}`);
      this.g.set(`${jet.gLoad.toFixed(1)} G`);
      this.thr.set(`${jet.afterburner ? 'THR AB' : `THR ${Math.round(jet.throttle * 100)}%`}   AAM ${weapons.aamLeft}`);
      const cm = ts.cm;
      this.flareFill.style.width = `${(100 * (1 - cm.flareCd / FLARE_RELOAD())).toFixed(0)}%`;
      this.flareText.set(cm.flareCd === 0 ? 'READY' : `${(cm.flareCd / 60).toFixed(1)} s`);
      this.chaffFill.style.width = `${(100 * (1 - cm.chaffCd / CHAFF_RELOAD())).toFixed(0)}%`;
      this.chaffText.set(cm.chaffCd === 0 ? 'READY' : `${(cm.chaffCd / 60).toFixed(1)} s`);
      this.chaffFill.classList.toggle('ready', cm.chaffCd === 0);
      this.ecmFill.style.width = `${(100 * (1 - cm.ecmCd / ECM_RELOAD())).toFixed(0)}%`;
      this.ecmText.set(cm.ecmCd === 0 ? 'READY' : `${(cm.ecmCd / 60).toFixed(1)} s`);
      this.flareFill.classList.toggle('ready', cm.flareCd === 0);
      this.ecmFill.classList.toggle('ready', cm.ecmCd === 0);
    }
    if (jet.hp !== this.lastHp) {
      this.lastHp = jet.hp;
      this.hpFill.style.width = `${(100 * jet.hp) / JET_HP}%`;
      this.hpText.set(`HP ${jet.hp} / ${JET_HP}`);
    }

    // message log
    for (let i = 0; i < MSG_LINES; i++) {
      if (this.msgLife[i] > 0) {
        this.msgLife[i]--;
        if (this.msgLife[i] === 0) this.msgText[i] = '';
      }
      this.msgNodes[i].set(this.msgText[i]);
    }

    // ---- threats: guided locks and unguided rounds on a crossing course (main.py:2509-2519) ----
    const items = ts.missiles.items;
    let radar = 0;
    let ir = 0;
    let rockets = 0;
    let nearest = -1;
    let nd = Infinity;
    const jb = Math.atan2(jet.vel.x, -jet.vel.z);
    const samT = weapons.samTarget(jet.pos); // the missile Z would shoot down
    for (let i = 0; i < items.length; i++) {
      const m = items[i];
      const arrow = this.arrows[i];
      const mark = this.missileMarks[i];
      let threat = false;
      if (jet.alive && m.active) {
        _rel.copy(m.pos).sub(jet.pos);
        const d = _rel.length();
        if (m.tracking) {
          threat = true;
          if (m.seeker === 'IR') ir++;
          else radar++;
        } else if (!m.guided && d < ROCKET_WARN_RANGE_M && -_rel.dot(m.dir) / d > ROCKET_WARN_COS) {
          threat = true; // main.py:2516-2519 rocket on a course that crosses yours
          rockets++;
        }
        if (threat) {
          if (d < nd) {
            nd = d;
            nearest = i;
          }
          // RWR arrow: bearing relative to the nose (up = ahead), distance and closing speed
          const mb = Math.atan2(_rel.x, -_rel.z);
          const rel = mb - jb;
          _vrel.copy(m.vel).sub(jet.vel);
          const closing = -_vrel.dot(_rel) / d;
          arrow.style.display = 'block';
          arrow.style.transform = `translate(-50%, -50%) rotate(${rel.toFixed(3)}rad)`;
          if (slow) {
            const kind = m.guided ? m.seeker : 'ROCKET';
            const hi = _rel.y > 600 ? ' HI' : _rel.y < -600 ? ' LO' : '';
            this.arrowText[i].set(`${kind}${hi} ${(d / 1000).toFixed(1)}km ${closing >= 0 ? '+' : ''}${Math.round(closing)}m/s`);
          }
          (arrow.lastChild as HTMLElement).style.transform = `translateX(-50%) rotate(${(-rel).toFixed(3)}rad)`;
        }
      }
      if (!threat) arrow.style.display = 'none';
      if (!jet.alive || !m.active || !this.place(mark, m.pos, cam, w, h)) {
        mark.style.display = 'none';
      } else {
        mark.classList.toggle('target', m === samT);
        if (slow) this.missileText[i].set(`${(m.pos.distanceTo(jet.pos) / 1000).toFixed(1)}`);
      }
    }

    const locked = radar + ir > 0 || rockets > 0;
    const flash = (this.tick >> 3) % 2 === 0;
    this.border.style.display = locked && flash ? 'block' : 'none'; // main.py:2550-2551
    (window as unknown as { __fighterThreat?: boolean }).__fighterThreat = radar + ir > 0; // mission.js: missile coaching
    if (locked) {
      if (slow) {
        const what: string[] = [];
        if (radar + ir > 0) what.push(`MISSILE LOCK ${radar + ir}${radar && ir ? ` (RADAR ${radar} / IR ${ir})` : radar ? ' RADAR' : ' IR'}`);
        if (rockets > 0) what.push(`ROCKET ${rockets}`);
        this.warn.set(`${what.join('  +  ')}  -  ${(nd / 1000).toFixed(1)} KM`);
        // advice line (main.py:2552-2559), per seeker
        const cm = ts.cm;
        // phones see the touch button names, never keyboard keys (Stratos #55)
        const tq = (document.querySelector('.touch-layer') as HTMLElement | null)?.style.display === 'block';
        let adv: string;
        if (radar + ir === 0) adv = 'UNGUIDED - TURN HARD OUT OF ITS PATH';
        else if (ir > 0 && cm.flareCd === 0) adv = tq ? 'TAP FLARE' : 'PRESS C (\u25B3)  -  FLARES';
        else if (radar > 0 && cm.chaffCd === 0) adv = tq ? 'TAP CHAFF   |   ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE' : 'PRESS K (D-PAD \u2191)  -  CHAFF   |   X (L1)  -  ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE';
        else if (radar > 0 && cm.ecmCd === 0) adv = tq ? 'TAP ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE' : 'PRESS X (L1)  -  ECM JAMMER   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE';
        else if (radar > 0) adv = 'NOTCH: FLY 90 DEG ACROSS IT AND DIVE, THEN BREAK HARD LATE';
        else adv = `FLARES RELOADING ${(cm.flareCd / 60).toFixed(1)} s - BREAK HARD LATE`;
        if (samT && weapons.missileCd === 0 && weapons.aamLeft > 0) adv += tq ? '   |   AAM  -  SHOOT IT DOWN' : '   |   Z (\u25A1)  -  SHOOT IT DOWN';
        this.advice.set(adv);
      }
      this.warnNode.style.visibility = flash || nd < 3000 ? 'visible' : 'hidden';
    } else {
      this.warn.set('');
      this.advice.set('');
    }
    void nearest;

    this.ecmRing.style.display = ts.cm.ecmFlash > 0 ? 'block' : 'none'; // main.py:2541-2542
    if (ts.cm.ecmFlash > 0) {
      const s = 1 + (40 - ts.cm.ecmFlash) * 0.12;
      this.ecmRing.style.transform = `translate(-50%, -50%) scale(${s.toFixed(2)})`;
      this.ecmRing.style.opacity = (ts.cm.ecmFlash / 40).toFixed(2);
    }

    if (slow) {
      let c = '';
      if (jet.alive && jet.stalled) c = 'STALL';
      else if (jet.alive && jet.pos.y - groundM < ALT_MIN_FT * FT && jet.vel.y < -20) c = 'PULL UP';
      this.caution.set(c);
    }

    // ---- launcher markers: the nearest visible ones (main.py:801 hidden TELs stay hidden) ----
    const n = MARK_LAUNCHERS;
    let count = 0;
    const ls = ts.launchers;
    for (let i = 0; i < ls.length; i++) {
      const l = ls[i];
      if (!l.visible || l.hp <= 0) continue;
      const d = Math.hypot(l.x - jet.pos.x, l.z - jet.pos.z);
      if (d > LAUNCHER_MARK_RANGE) continue;
      // insertion into a fixed sorted list
      let k: number;
      if (count < n) k = count++;
      else if (d >= this.nearD[n - 1]) continue;
      else k = n - 1;
      while (k > 0 && this.nearD[k - 1] > d) {
        this.nearD[k] = this.nearD[k - 1];
        this.nearIdx[k] = this.nearIdx[k - 1];
        k--;
      }
      this.nearD[k] = d;
      this.nearIdx[k] = i;
    }
    const agm = weapons.agmTarget(jet.pos);
    const aam = weapons.aamTarget(jet.pos);
    for (let i = 0; i < n; i++) {
      const m = this.launcherMarks[i];
      if (i >= count) {
        m.style.display = 'none';
        continue;
      }
      const l = ls[this.nearIdx[i]];
      _p.set(l.x, l.y + 10, l.z);
      if (!this.place(m, _p, cam, w, h)) continue;
      m.classList.toggle('tel', l.kind === 'TEL');
      m.classList.toggle('in-range', this.nearD[i] < l.range);
      m.classList.toggle('target', l === agm); // what G (AGM) would go for
      if (slow) this.launcherText[i].set(l.kind);
    }
    for (let i = 0; i < this.droneMarks.length; i++) {
      const m = this.droneMarks[i];
      const d = ts.drones[i];
      if (!d) {
        m.style.display = 'none';
        continue;
      }
      _p.set(d.x, d.y, d.z);
      if (!d.alive || _p.distanceTo(jet.pos) > DRONE_MARK_RANGE || !this.place(m, _p, cam, w, h)) m.style.display = 'none';
      else m.classList.toggle('target', d === aam); // what Z (AAM) would go for
    }
    // falling bombs: where each will land (main.py:1326-1329)
    let b = 0;
    const ord = weapons.items.items;
    for (let i = 0; i < ord.length && b < BOMB_MARKS; i++) {
      const o = ord[i];
      if (!o.active || o.kind !== 'BOMB') continue;
      if (this.place(this.bombMarks[b], o.impact, cam, w, h)) b++;
    }
    for (; b < BOMB_MARKS; b++) this.bombMarks[b].style.display = 'none';
  }

  private place(m: HTMLDivElement, world: Vector3, cam: PerspectiveCamera, w: number, h: number): boolean {
    _p.copy(world).project(cam);
    if (_p.z > 1 || _p.z < -1 || Math.abs(_p.x) > 1.05 || Math.abs(_p.y) > 1.05) {
      m.style.display = 'none';
      return false;
    }
    const x = (_p.x * 0.5 + 0.5) * w;
    const y = (-_p.y * 0.5 + 0.5) * h;
    m.style.display = 'block';
    m.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) translate(-50%, -50%)`;
    return true;
  }
}
