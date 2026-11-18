// Keyboard + Gamepad API (PS5 DualSense, Xbox, ...) + on-screen touch controls, merged into flight controls and
// one-press actions. In 2-player mode (main.py:2003-2025) player 2 has the arrow keys or the second controller
// (main.py:2136 "in 2-player mode the arrow keys belong to player 2"; main.py:1785-1787 the second pad).

const STICK_RADIUS = 80; // main.py:150, touch stick radius in px
const STICK_DEADZONE = 0.18; // main.py:151
const PAD_DEADZONE = 0.15; // analog flight needs a smaller dead zone than main.py's d-pad style 0.35 (main.py:114)
const KEY_RAMP = 4; // keyboard pitch/roll/yaw move toward full deflection at this rate per second

export type Action =
  | 'start'
  | 'flare'
  | 'ecm'
  | 'night'
  | 'chaff'
  | 'bomb'
  | 'agm'
  | 'aam'
  | 'aero'
  | 'sam'
  | 'nextJet'
  | 'prevJet'
  | 'levelUp'
  | 'levelDown'
  | 'twoPlayers'
  | 'p2Left'
  | 'p2Right'
  | 'p2Guided'
  | 'p2Unguided'
  | 'mnv1'
  | 'mnv2'
  | 'mnv3'
  | 'mnv4'
  | 'mnv5'
  | 'mnv6'
  | 'mnv7'
  | 'mnv8'
  | 'mnvNext'
  | 'rtb'
  | 'limiter';

/** the 8 fighter manoeuvres (flight/Maneuvers.ts): Shift + 1..8 or numpad 1..8; MNV on touch flies the next one */
export const MANEUVER_ACTIONS: Action[] = ['mnv1', 'mnv2', 'mnv3', 'mnv4', 'mnv5', 'mnv6', 'mnv7', 'mnv8'];

const ACTIONS: Action[] = [
  'start', 'flare', 'ecm', 'night', 'chaff', 'bomb', 'agm', 'aam', 'aero', 'sam', 'nextJet', 'prevJet',
  'levelUp', 'levelDown', 'twoPlayers', 'p2Left', 'p2Right', 'p2Guided', 'p2Unguided',
  'mnv1', 'mnv2', 'mnv3', 'mnv4', 'mnv5', 'mnv6', 'mnv7', 'mnv8', 'mnvNext', 'rtb', 'limiter',
];

/** keyboard: one-press actions (main.py's keys where they are free here) */
const KEY_ACTIONS: Record<string, Action> = {
  Enter: 'start',
  NumpadEnter: 'start',
  KeyC: 'flare', // main.py:1973
  KeyX: 'ecm', // ECM gets its own key here (main.py shares C)
  KeyT: 'night', // main.py:2001
  KeyK: 'chaff', // chaff (radar decoy), new
  KeyB: 'bomb', // main.py SPACE (the afterburner here)
  KeyG: 'agm', // main.py R (throttle up here)
  KeyZ: 'aam', // main.py F (throttle down here)
  KeyV: 'aero', // main.py:1950
  KeyM: 'sam', // main.py:1994
  KeyN: 'levelUp', // main.py:2026
  KeyP: 'levelDown', // main.py:2028
  Digit2: 'twoPlayers', // main.py:2003
  KeyO: 'limiter', // AoA limiter off / on (SkyForge fighter)
};
/** player 2 on the arrow keys, only in 2-player mode (main.py:2007-2025) */
const P2_KEYS: Record<string, Action> = { ArrowLeft: 'p2Left', ArrowRight: 'p2Right', ArrowUp: 'p2Guided', ArrowDown: 'p2Unguided' };

/** first controller: buttons for one-press actions (standard browser layout; PS5 names in brackets) */
const PAD1_ACTIONS: [Action, number][] = [
  ['start', 9], // Options
  ['start', 0], // Cross (on menus)
  ['flare', 3], // Triangle (main.py:132)
  ['ecm', 4], // L1
  ['night', 17], // touchpad (main.py:126)
  ['chaff', 12], // d-pad up
  ['bomb', 13], // d-pad down
  ['agm', 1], // Circle (main.py:130)
  ['aam', 2], // Square (main.py:131)
  ['aero', 10], // L3 (main.py:137)
  ['nextJet', 11], // R3
  ['levelUp', 9], // Options (main.py:136)
  ['levelDown', 8], // Create (main.py:135)
];
/** second controller = player 2 in 2-player mode (main.py:144 P2_PAD_KEYS) */
const PAD2_ACTIONS: [Action, number][] = [
  ['p2Left', 14],
  ['p2Right', 15],
  ['p2Guided', 0],
  ['p2Unguided', 1],
];

const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab']);

const clamp1 = (v: number): number => (v < -1 ? -1 : v > 1 ? 1 : v);
const dead = (v: number, dz: number): number => {
  const a = Math.abs(v);
  if (a < dz) return 0;
  return Math.sign(v) * ((a - dz) / (1 - dz));
};

export class Input {
  /** -1 push (nose down) .. +1 pull (nose up) */
  pitch = 0;
  /** -1 roll left .. +1 roll right */
  roll = 0;
  /** -1 yaw left .. +1 yaw right */
  yaw = 0;
  /** -1 .. +1 throttle change request */
  throttle = 0;
  afterburner = false;
  /** true when the controls in use are a touch screen */
  touchMode = false;
  /** 2-player mode: the arrows and the second controller belong to player 2 */
  twoPlayers = false;

  private keys = new Set<string>();
  private kPitch = 0;
  private kRoll = 0;
  private kYaw = 0;
  private queued = new Map<Action, boolean>();
  private pad1Was: boolean[] = [];
  private pad2Was: boolean[] = [];
  private padConnected = false;

  // touch state
  private stickId = -1;
  private stickCx = 0;
  private stickCy = 0;
  private stickX = 0;
  private stickY = 0;
  private touchThrUp = false;
  private touchThrDown = false;
  private touchAb = false;
  private stickBase!: HTMLDivElement;
  private stickKnob!: HTMLDivElement;
  private touchLayer!: HTMLDivElement;
  private playing = false;

  constructor(root: HTMLElement) {
    for (const a of ACTIONS) this.queued.set(a, false);
    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (!e.repeat) {
        if (e.code === 'Tab') this.queue(e.shiftKey ? 'prevJet' : 'nextJet'); // main.py:1936
        // manoeuvres: Shift + 1..8 (plain 2 stays the 2-player switch) or numpad 1..8
        const mn = /^(?:Digit|Numpad)([1-8])$/.exec(e.code);
        const isMnv = !!mn && (e.shiftKey || e.code.startsWith('Numpad'));
        if (isMnv) this.queue(MANEUVER_ACTIONS[Number(mn![1]) - 1]);
        // return to base: Shift + 9 or numpad 9
        if (e.code === 'Numpad9' || (e.code === 'Digit9' && e.shiftKey)) this.queue('rtb');
        const a = isMnv ? undefined : KEY_ACTIONS[e.code];
        if (a) this.queue(a);
        if (this.twoPlayers && P2_KEYS[e.code]) this.queue(P2_KEYS[e.code]);
      }
      this.keys.add(e.code);
      this.touchMode = false;
      this.showTouch(false);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('gamepadconnected', () => (this.padConnected = true));
    window.addEventListener('gamepaddisconnected', () => {
      const pads = navigator.getGamepads();
      this.padConnected = false;
      for (const p of pads) if (p) this.padConnected = true;
    });
    this.buildTouch(root);
    // a coarse pointer counts too (Stratos #55: touch controls missing in a phone test)
    if (navigator.maxTouchPoints > 0 || 'ontouchstart' in window || matchMedia('(pointer: coarse)').matches) {
      this.touchMode = true;
      this.showTouch(true);
    }
  }

  queue(a: Action): void {
    this.queued.set(a, true);
  }

  /** Enter / pad Cross or Options / a tap on the play icon. */
  queueStart(): void {
    this.queue('start');
  }

  /** true once per press */
  consume(a: Action): boolean {
    const s = this.queued.get(a) === true;
    if (s) this.queued.set(a, false);
    return s;
  }

  consumeStart(): boolean {
    return this.consume('start');
  }
  consumeFlare(): boolean {
    return this.consume('flare');
  }
  consumeEcm(): boolean {
    return this.consume('ecm');
  }
  consumeNight(): boolean {
    return this.consume('night');
  }

  /**
   * Controller rumble (PS5 DualSense, Xbox and other pads with vibration motors in the browser).
   * strong = the big low motor, weak = the small high one, both 0..1. Player 1's controller only.
   */
  rumble(strong: number, weak: number, ms: number): void {
    if (!this.padConnected) return;
    const pads = navigator.getGamepads();
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      if (!p || !p.connected) continue;
      const act = (p as Gamepad & { vibrationActuator?: { playEffect?: (t: string, o: object) => Promise<unknown> } }).vibrationActuator;
      if (act && act.playEffect) void act.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => undefined);
      break;
    }
  }

  private padEdges(p: Gamepad, table: [Action, number][], was: boolean[]): void {
    const b = p.buttons;
    for (let i = 0; i < table.length; i++) {
      const [a, idx] = table[i];
      const down = !!(b[idx] && b[idx].pressed);
      if (down && !was[i]) this.queue(a);
      was[i] = down;
    }
  }

  /** Read every device once per physics step. */
  update(dt: number): void {
    const k = this.keys;
    const arrows = !this.twoPlayers; // in 2-player mode the arrows belong to player 2 (main.py:2136)
    const tp = (k.has('KeyS') || (arrows && k.has('ArrowDown')) ? 1 : 0) - (k.has('KeyW') || (arrows && k.has('ArrowUp')) ? 1 : 0);
    const tr = (k.has('KeyD') || (arrows && k.has('ArrowRight')) ? 1 : 0) - (k.has('KeyA') || (arrows && k.has('ArrowLeft')) ? 1 : 0);
    const ty = (k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') ? 1 : 0);
    this.kPitch = ramp(this.kPitch, tp, KEY_RAMP * dt);
    this.kRoll = ramp(this.kRoll, tr, KEY_RAMP * dt);
    this.kYaw = ramp(this.kYaw, ty, KEY_RAMP * dt);

    let pitch = this.kPitch;
    let roll = this.kRoll;
    let yaw = this.kYaw;
    let thr = (k.has('KeyR') ? 1 : 0) - (k.has('KeyF') ? 1 : 0);
    let ab = k.has('Space');

    if (this.padConnected) {
      const pads = navigator.getGamepads();
      let n = 0;
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        if (!p || !p.connected) continue;
        if (n === 1) {
          // the second controller: player 2's launchers, in 2-player mode
          if (this.twoPlayers) this.padEdges(p, PAD2_ACTIONS, this.pad2Was);
          break;
        }
        n++;
        const ax = p.axes;
        const lx = dead(ax[0] ?? 0, PAD_DEADZONE);
        const ly = dead(ax[1] ?? 0, PAD_DEADZONE);
        const rx = dead(ax[2] ?? 0, PAD_DEADZONE);
        if (lx !== 0 || ly !== 0 || rx !== 0) {
          roll += lx;
          pitch += ly; // stick back (down on the axis) = pull up
          yaw += rx;
          this.touchMode = false;
          this.showTouch(false);
        }
        const b = p.buttons;
        const rt = b[7] ? b[7].value : 0; // R2
        const lt = b[6] ? b[6].value : 0; // L2
        if (rt > 0.1) thr += rt;
        if (lt > 0.1) thr -= lt;
        if ((b[0] && b[0].pressed) || (b[5] && b[5].pressed)) ab = true; // Cross or R1
        this.padEdges(p, PAD1_ACTIONS, this.pad1Was);
      }
    }

    if (this.stickId >= 0) {
      roll += this.stickX;
      pitch += this.stickY;
    }
    if (this.touchThrUp) thr += 1;
    if (this.touchThrDown) thr -= 1;
    if (this.touchAb) ab = true;

    this.pitch = clamp1(pitch);
    this.roll = clamp1(roll);
    this.yaw = clamp1(yaw);
    this.throttle = clamp1(thr);
    this.afterburner = ab;
  }

  setTouchVisible(playing: boolean): void {
    this.playing = playing;
    this.touchLayer.style.display = this.touchMode && playing ? 'block' : 'none';
  }

  private showTouch(on: boolean): void {
    if (!on) this.touchLayer.style.display = 'none';
  }

  private buildTouch(root: HTMLElement): void {
    const layer = document.createElement('div');
    layer.className = 'touch-layer';
    layer.style.display = 'none';
    const base = document.createElement('div');
    base.className = 'stick-base';
    base.style.width = base.style.height = `${STICK_RADIUS * 2}px`;
    const knob = document.createElement('div');
    knob.className = 'stick-knob';
    base.appendChild(knob);
    layer.appendChild(base);
    this.stickBase = base;
    this.stickKnob = knob;

    const zone = document.createElement('div');
    zone.className = 'stick-zone';
    layer.insertBefore(zone, base);
    zone.addEventListener('pointerdown', (e) => {
      if (this.stickId >= 0) return;
      this.stickId = e.pointerId;
      this.stickCx = e.clientX;
      this.stickCy = e.clientY;
      zone.setPointerCapture(e.pointerId);
      this.placeStick();
      this.moveStick(e.clientX, e.clientY);
    });
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.stickId) this.moveStick(e.clientX, e.clientY);
    });
    const end = (e: PointerEvent): void => {
      if (e.pointerId !== this.stickId) return;
      this.stickId = -1;
      this.stickX = this.stickY = 0;
      this.stickKnob.style.transform = 'translate(-50%, -50%)';
      this.stickBase.classList.remove('live');
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);

    const btn = (label: string, cls: string, set: (v: boolean) => void): void => {
      const b = document.createElement('div');
      b.className = `touch-btn ${cls}`;
      b.textContent = label;
      b.addEventListener('pointerdown', (e) => {
        b.setPointerCapture(e.pointerId);
        set(true);
        b.classList.add('held');
      });
      const off = (): void => {
        set(false);
        b.classList.remove('held');
      };
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      layer.appendChild(b);
    };
    const tap = (label: string, cls: string, a: Action): void =>
      btn(label, cls, (v) => {
        if (v) this.queue(a);
      });
    btn('THR +', 'thr-up', (v) => (this.touchThrUp = v));
    btn('THR -', 'thr-down', (v) => (this.touchThrDown = v));
    btn('AB', 'ab', (v) => (this.touchAb = v));
    tap('FLARE', 'flare', 'flare');
    tap('ECM', 'ecm', 'ecm');
    tap('CHAFF', 'chaff', 'chaff');
    tap('BOMB', 'bomb', 'bomb');
    tap('AGM', 'agm', 'agm');
    tap('AAM', 'aam', 'aam');
    tap('NIGHT', 'night', 'night');
    tap('AERO', 'aero', 'aero'); // main.py:158
    tap('MNV', 'mnv', 'mnvNext'); // the next of the 8 fighter manoeuvres
    tap('RTB', 'rtb', 'rtb'); // return to base and land
    tap('SAM', 'sam', 'sam'); // main.py:157
    tap('JET', 'jet', 'nextJet');
    tap('LV+', 'lvup', 'levelUp');
    tap('LV-', 'lvdown', 'levelDown');

    root.appendChild(layer);
    this.touchLayer = layer;
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        this.touchMode = true;
        if (this.playing) this.touchLayer.style.display = 'block'; // a finger brings the touch controls back
      }
    });
  }

  private placeStick(): void {
    this.stickBase.style.left = `${this.stickCx - STICK_RADIUS}px`;
    this.stickBase.style.top = `${this.stickCy - STICK_RADIUS}px`;
    this.stickBase.style.bottom = 'auto';
    this.stickBase.classList.add('live');
  }

  private moveStick(x: number, y: number): void {
    let dx = (x - this.stickCx) / STICK_RADIUS;
    let dy = (y - this.stickCy) / STICK_RADIUS;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    this.stickKnob.style.transform = `translate(calc(-50% + ${dx * STICK_RADIUS}px), calc(-50% + ${dy * STICK_RADIUS}px))`;
    this.stickX = dead(dx, STICK_DEADZONE);
    this.stickY = dead(dy, STICK_DEADZONE); // finger pulled down = pull up
  }
}

function ramp(cur: number, target: number, maxStep: number): number {
  // springs back to centre twice as fast as it deflects
  const step = target === 0 ? maxStep * 2 : maxStep;
  if (cur < target) return Math.min(target, cur + step);
  if (cur > target) return Math.max(target, cur - step);
  return cur;
}
