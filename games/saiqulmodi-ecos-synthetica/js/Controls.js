// Controls.js - one input layer for PC and phone.
// PC: WASD/arrows move, drag to orbit, wheel to zoom, click to select.
// Phone: left joystick moves, drag elsewhere to orbit, pinch to zoom, tap to select.

export class Controls {
  constructor(dom, joyBase, joyKnob, { onTap }) {
    this.dom = dom;
    this.joyBase = joyBase;
    this.joyKnob = joyKnob;
    this.onTap = onTap;
    this.keys = new Set();
    this.yaw = 0.7;
    this.pitch = 0.5;
    this.dist = 15;
    this.joy = { id: null, x: 0, y: 0, cx: 0, cy: 0 };
    this.pointers = new Map();
    this.pinchStart = 0;
    this.pinchDist = 0;
    this.enabled = true;

    dom.addEventListener('pointerdown', (e) => this.down(e));
    window.addEventListener('pointermove', (e) => this.move(e));
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.up(e));
    dom.addEventListener('wheel', (e) => { e.preventDefault(); this.zoom(1 + e.deltaY * 0.0012); }, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    joyBase.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = joyBase.getBoundingClientRect();
      this.joy.id = e.pointerId;
      this.joy.cx = r.left + r.width / 2;
      this.joy.cy = r.top + r.height / 2;
      this.joyMove(e);
      try { joyBase.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
  }

  zoom(f) { this.dist = Math.min(32, Math.max(6, this.dist * f)); }

  down(e) {
    if (!this.enabled) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: 0 });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      this.pinchDist = this.dist;
    }
  }

  joyMove(e) {
    const max = this.joyBase.clientWidth * 0.38;
    let dx = e.clientX - this.joy.cx;
    let dy = e.clientY - this.joy.cy;
    const len = Math.hypot(dx, dy);
    if (len > max) { dx *= max / len; dy *= max / len; }
    this.joy.x = dx / max;
    this.joy.y = dy / max;
    this.joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  move(e) {
    if (e.pointerId === this.joy.id) { this.joyMove(e); return; }
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    p.moved = Math.max(p.moved, Math.hypot(p.x - p.sx, p.y - p.sy));
    if (this.pointers.size === 1) {
      this.yaw -= dx * 0.006;
      this.pitch = Math.min(1.25, Math.max(0.12, this.pitch + dy * 0.004));
    } else if (this.pointers.size === 2 && this.pinchStart > 0) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      this.dist = Math.min(32, Math.max(6, this.pinchDist * (this.pinchStart / Math.max(20, d))));
    }
  }

  up(e) {
    if (e.pointerId === this.joy.id) {
      this.joy.id = null;
      this.joy.x = this.joy.y = 0;
      this.joyKnob.style.transform = '';
      return;
    }
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinchStart = 0;
    if (p.moved < 8 && performance.now() - p.t < 450 && this.onTap) this.onTap(e.clientX, e.clientY);
  }

  // Movement in world space (x, z), relative to where the camera looks.
  moveVector() {
    let f = 0;
    let s = 0;
    const k = this.keys;
    if (k.has('w') || k.has('arrowup')) f += 1;
    if (k.has('s') || k.has('arrowdown')) f -= 1;
    if (k.has('d') || k.has('arrowright')) s += 1;
    if (k.has('a') || k.has('arrowleft')) s -= 1;
    f -= this.joy.y;
    s += this.joy.x;
    const len = Math.hypot(f, s);
    if (len > 1) { f /= len; s /= len; }
    const sy = Math.sin(this.yaw);
    const cy = Math.cos(this.yaw);
    // forward = (-sin yaw, -cos yaw), right = (cos yaw, -sin yaw)
    return { x: -sy * f + cy * s, z: -cy * f - sy * s, amount: Math.min(1, len) };
  }
}
