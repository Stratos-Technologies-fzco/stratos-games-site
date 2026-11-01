export class InputManager {

  // --- Direct PS5 DualSense Hardware Poller ---
  pollGamepad() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) { gp = gamepads[i]; break; }
    }
    if (!gp) return;

    const deadzone = 0.08;
    // Left Stick Pitch & Roll
    const stickRoll = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    const stickPitch = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

    if (stickRoll !== 0) this.roll = stickRoll;
    if (stickPitch !== 0) this.pitch = stickPitch; // Pull back to climb, push to dive

    // L1 (Button 4) / R1 (Button 5) Rudder Yaw
    const l1 = gp.buttons[4]?.pressed ? 1 : 0;
    const r1 = gp.buttons[5]?.pressed ? 1 : 0;
    if (l1 || r1) this.yaw = (r1 - l1);

    // Cross (Button 0) = Throttle UP, Square (Button 2) = Throttle DOWN
    if (gp.buttons[0]?.pressed) {
      if (typeof this.throttle === 'number') this.throttle = Math.min(1.0, this.throttle + 0.015);
    }
    if (gp.buttons[2]?.pressed) {
      if (typeof this.throttle === 'number') this.throttle = Math.max(0.0, this.throttle - 0.015);
    }

    // Triangle (Button 3): Toggle Camera View
    if (gp.buttons[3]?.pressed && !this._btnTriLock) {
      this._btnTriLock = true;
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('VIEW:'));
      if (btn) btn.click();
      setTimeout(() => { this._btnTriLock = false; }, 350);
    }
  }
  constructor() {
    this.controls = {
      pitch: 0,
      roll: 0,
      yaw: 0,
      throttle: 0.75,
      brakes: false,
      cameraToggle: false,
      trimPitch: 0.0
    };

    this.rawPitch = 0;
    this.rawRoll = 0;
    this.rawYaw = 0;
    this.gamepadConnected = false;
    this.gamepadName = "Keyboard";

    this.prevButtons = {};

    window.addEventListener("gamepadconnected", (e) => {
      this.gamepadConnected = true;
      this.gamepadName = e.gamepad.id.split('(')[0].trim();
      console.log(`[Input] Gamepad connected: ${e.gamepad.id}`);
    });

    window.addEventListener("gamepaddisconnected", () => {
      this.gamepadConnected = false;
      this.gamepadName = "Keyboard";
      console.log("[Input] Gamepad disconnected");
    });

    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyB') this.controls.brakes = !this.controls.brakes;
      if (e.code === 'KeyC') this.controls.cameraToggle = !this.controls.cameraToggle;
      if (e.code === 'BracketLeft') this.controls.trimPitch = Math.max(-0.25, this.controls.trimPitch - 0.01);
      if (e.code === 'BracketRight') this.controls.trimPitch = Math.min(0.25, this.controls.trimPitch + 0.01);
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  applyDeadzone(val, deadzone = 0.08) {
    if (Math.abs(val) < deadzone) return 0;
    return Math.sign(val) * ((Math.abs(val) - deadzone) / (1 - deadzone));
  }

  applyExpo(value, expo = 0.4) {
    return Math.sign(value) * (expo * Math.pow(Math.abs(value), 3) + (1 - expo) * Math.abs(value));
  }

  isButtonPressed(pad, index) {
    const btn = pad.buttons[index];
    if (!btn) return false;
    return typeof btn === 'object' ? btn.pressed : btn > 0.5;
  }

  update(dt, isOnGround) {
    this.pollGamepad();
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let activePad = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        activePad = gamepads[i];
        this.gamepadConnected = true;
        break;
      }
    }

    if (activePad) {
      // 1. Primary Analog Flight Stick (Left Stick)
      // Standard aviation: pushing forward (negative axis) pushes nose down
      const rawRoll = this.applyDeadzone(activePad.axes[0]);
      const rawPitch = this.applyDeadzone(activePad.axes[1]);

      this.controls.roll = this.applyExpo(rawRoll, 0.45);
      this.controls.pitch = this.applyExpo(rawPitch, 0.45) + this.controls.trimPitch;

      // 2. Rudder / Yaw (Right Stick X-axis)
      const rawYaw = this.applyDeadzone(activePad.axes[2] || 0);
      this.controls.yaw = this.applyExpo(rawYaw, 0.35);

      // 3. Throttle Control (Triggers: RT/R2 = throttle up, LT/L2 = throttle down)
      const rt = activePad.buttons[7] ? (typeof activePad.buttons[7] === 'object' ? activePad.buttons[7].value : activePad.buttons[7]) : 0;
      const lt = activePad.buttons[6] ? (typeof activePad.buttons[6] === 'object' ? activePad.buttons[6].value : activePad.buttons[6]) : 0;

      if (rt > 0.1) {
        this.controls.throttle = Math.min(1.0, this.controls.throttle + rt * dt * 0.45);
      }
      if (lt > 0.1) {
        this.controls.throttle = Math.max(0.0, this.controls.throttle - lt * dt * 0.45);
      }

      // 4. Buttons (Rising Edge Detection)
      // Button A (index 0): Toggle Brakes
      if (this.isButtonPressed(activePad, 0) && !this.prevButtons[0]) {
        if (isOnGround) this.controls.brakes = !this.controls.brakes;
      }

      // Button Y (index 3): Toggle Camera View
      if (this.isButtonPressed(activePad, 3) && !this.prevButtons[3]) {
        this.controls.cameraToggle = !this.controls.cameraToggle;
      }

      // D-pad Up / Down (indexes 12 & 13): Pitch Trim
      if (this.isButtonPressed(activePad, 12) && !this.prevButtons[12]) {
        this.controls.trimPitch = Math.max(-0.25, this.controls.trimPitch - 0.015);
      }
      if (this.isButtonPressed(activePad, 13) && !this.prevButtons[13]) {
        this.controls.trimPitch = Math.min(0.25, this.controls.trimPitch + 0.015);
      }

      // Cache button states for edge detection
      for (let b = 0; b < activePad.buttons.length; b++) {
        this.prevButtons[b] = this.isButtonPressed(activePad, b);
      }

      if (!isOnGround) {
        this.controls.brakes = false;
      }
      return;
    }

    // Fallback: Keyboard
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
      this.controls.throttle = Math.min(1.0, this.controls.throttle + dt * 0.35);
    }
    if (this.keys['ControlLeft'] || this.keys['ControlRight']) {
      this.controls.throttle = Math.max(0.0, this.controls.throttle - dt * 0.35);
    }

    let targetPitch = 0;
    if (this.keys['KeyW']) targetPitch -= 1;
    if (this.keys['KeyS']) targetPitch += 1;
    this.rawPitch += (targetPitch - this.rawPitch) * dt * 2.5;
    this.controls.pitch = this.applyExpo(this.rawPitch, 0.5) + this.controls.trimPitch;

    let targetRoll = 0;
    if (this.keys['KeyA']) targetRoll -= 1;
    if (this.keys['KeyD']) targetRoll += 1;
    this.rawRoll += (targetRoll - this.rawRoll) * dt * 3.0;
    this.controls.roll = this.applyExpo(this.rawRoll, 0.45);

    let targetYaw = 0;
    if (this.keys['KeyQ']) targetYaw -= 1;
    if (this.keys['KeyE']) targetYaw += 1;
    this.rawYaw += (targetYaw - this.rawYaw) * dt * 3.0;
    this.controls.yaw = this.applyExpo(this.rawYaw, 0.35);

    if (this.keys['Space'] && isOnGround) {
      this.controls.brakes = true;
    } else if (!isOnGround) {
      this.controls.brakes = false;
    }
  }
}

