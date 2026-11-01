// Game controller input (PS5 DualSense / Xbox / any "standard" mapping pad).
// Mode-2 layout:
//   RIGHT stick  : pitch (pull back = nose up) and roll
//   LEFT stick   : up / down = throttle (collective on the helicopter), left / right = rudder (yaw)
//   L1 / R1      : rudder left / right          L2 / R2 : throttle down / up (analog)
//   Cross  / A   : fire gun (fighter, hold)      Circle   / B : cargo ramp (airliner)
//   Square / X   : autopilot                     Triangle / Y : cockpit / chase view
//   D-pad up/down: autopilot target altitude +/- 500 ft
//   D-pad left/right: previous / next aircraft
//   Share / View : ALT HOLD                      R3 : reset head view
//   Options / Menu : start a final approach      L3 (hold) : wheel brakes
//   Touchpad click : map size
const DEADZONE = 0.12;

const BUTTON_ACTIONS = {
  1: 'ramp',
  2: 'autopilot',
  3: 'view',
  8: 'altHold',
  9: 'approach',
  11: 'resetHead',
  12: 'altUp',
  13: 'altDown',
  14: 'prevAircraft',
  15: 'nextAircraft',
  17: 'map'
};

function axis(v) {
  if (Math.abs(v) < DEADZONE) return 0;
  return Math.sign(v) * (Math.abs(v) - DEADZONE) / (1 - DEADZONE);
}

// Raw (non-"standard") DualSense / DualShock layout as Chrome reports it on Windows when it does not
// remap the pad: buttons Square, Cross, Circle, Triangle, L1, R1, L2, R2, Create, Options, L3, R3, PS, Pad;
// axes LX, LY, RX, L2, R2, RY, ... and the D-pad as a hat on axis 9.
const RAW_SONY_BUTTON = { 0: 1, 1: 2, 2: 0, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 17: 13 };

function hatDirection(v) {
  // Hat axis: up -1, right -0.43, down 0.14, left 0.71, centre > 1
  if (v === undefined || v > 1.05 || v < -1.05) return null;
  const dirs = [[-1, 12], [-0.43, 15], [0.14, 13], [0.71, 14]];
  let best = null, bestD = 0.2;
  dirs.forEach(([val, btn]) => { const d = Math.abs(v - val); if (d < bestD) { bestD = d; best = btn; } });
  return best;
}

// Normalises any pad to the "standard" layout: { lx, ly, rx, ry, value(i), pressed(i) }
function readPad(gp) {
  if (gp.mapping === 'standard' || !/054c/i.test(gp.id)) {
    const v = (i) => (gp.buttons[i] ? gp.buttons[i].value : 0);
    const p = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
    return { lx: gp.axes[0] || 0, ly: gp.axes[1] || 0, rx: gp.axes[2] || 0, ry: gp.axes[3] || 0, value: v, pressed: p };
  }
  const hat = hatDirection(gp.axes[9]);
  const trigger = (axisIndex, btn) => Math.max(gp.buttons[btn] ? gp.buttons[btn].value : 0, gp.axes[axisIndex] !== undefined ? (gp.axes[axisIndex] + 1) / 2 : 0);
  const value = (i) => {
    if (i === 6) return trigger(3, 6);
    if (i === 7) return trigger(4, 7);
    if (i >= 12 && i <= 15) return hat === i ? 1 : 0;
    const raw = RAW_SONY_BUTTON[i];
    return raw !== undefined && gp.buttons[raw] ? gp.buttons[raw].value : 0;
  };
  return { lx: gp.axes[0] || 0, ly: gp.axes[1] || 0, rx: gp.axes[2] || 0, ry: gp.axes[5] || 0, value, pressed: (i) => value(i) > 0.5 };
}

export class GamepadInput {
  // slot: null = whichever pad has the newest input (one player); 0 / 1 = first / second connected pad (two players)
  constructor(slot = null) {
    this.slot = slot;
    this.activeKey = null;  // index of the pad currently driving the aircraft
    this.prevButtons = [];
    this.announced = new Set();
    if (slot !== null) return; // the one-player instance owns the connect / disconnect messages
    window.addEventListener('gamepadconnected', (e) => this.announce(e.gamepad, true));
    window.addEventListener('gamepaddisconnected', (e) => {
      this.announced.delete(e.gamepad.index);
      if (e.gamepad.index === this.activeKey) this.activeKey = null;
      window.dispatchEvent(new CustomEvent('gamepadstatus', { detail: { connected: false, id: e.gamepad.id } }));
    });
  }

  announce(gp, connected) {
    if (connected && this.announced.has(gp.index)) return;
    this.announced.add(gp.index);
    window.dispatchEvent(new CustomEvent('gamepadstatus', { detail: { connected, id: `${gp.id} [${gp.mapping || 'raw'}]` } }));
  }

  // The same controller can appear twice (USB + Bluetooth): use the one with the newest input
  pickPad() {
    if (!navigator.getGamepads) return null;
    if (this.slot !== null) {
      const pads = [...navigator.getGamepads()].filter((gp) => gp && gp.connected).sort((a, b) => a.index - b.index);
      pads.forEach((gp) => this.announce(gp, true));
      return pads[this.slot] || null;
    }
    let best = null;
    for (const gp of navigator.getGamepads()) {
      if (!gp || !gp.connected) continue;
      this.announce(gp, true); // covers pads whose connect event was missed
      if (!best || gp.timestamp > best.timestamp) best = gp;
    }
    return best;
  }

  // Returns null when no pad is connected, otherwise
  // { pitch, roll, yaw (-1..1), throttleRate (-1..1), fire, brake (held), actions: [names pressed this frame] }
  poll() {
    const gp = this.pickPad();
    if (!gp) return null;
    const pad = readPad(gp);
    const b = pad.value;
    const pressed = pad.pressed;

    const buttonsNow = [];
    for (let i = 0; i <= 17; i++) buttonsNow[i] = pressed(i);
    if (gp.index !== this.activeKey) {
      // Switching pads: take its current buttons as the baseline so nothing fires by accident
      this.activeKey = gp.index;
      this.prevButtons = buttonsNow;
    }
    const actions = [];
    for (const i in BUTTON_ACTIONS) {
      if (buttonsNow[i] && !this.prevButtons[i]) actions.push(BUTTON_ACTIONS[i]);
    }
    this.prevButtons = buttonsNow;

    const yawStick = -axis(pad.lx);
    const yawBumpers = (pressed(4) ? 1 : 0) - (pressed(5) ? 1 : 0);
    return {
      pitch: axis(pad.ry),
      roll: axis(pad.rx),
      yaw: Math.max(-1, Math.min(1, yawStick + yawBumpers)),
      throttleRate: Math.max(-1, Math.min(1, -axis(pad.ly) + b(7) - b(6))),
      fire: pressed(0),
      brake: pressed(10),
      actions
    };
  }
}
