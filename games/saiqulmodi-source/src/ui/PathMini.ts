// Miniature 3D flight-path display, ported from the SkyForge fighter (src/hud/pathMini.js): a small picture of the
// last 3 minutes of flight in the top-left corner, coloured like the wing-tip ribbons (cyan normal, amber Mach
// 0.85-1.2, white above Mach 1.2, red above 5 G), drop lines to the ground, the manoeuvre ghost dashed, the
// runway when heading back to it, and the missiles in the air (red). It turns slowly so the shape of a loop or a
// turn reads in 3D. Click it: full screen for 5 s, then small again.
import type { Vector3 } from 'three';

const COLORS = ['#40e6ff', '#ff9e1f', '#ffffff', '#ff2a1a'];
const N = 360; // 3 minutes at one point every 0.5 s

export interface MiniInfo {
  pos: Vector3;
  vel: Vector3;
  groundY: number;
  ghost: Vector3[] | null;
  runway: { thrX: number; thrZ: number; dirX: number; dirZ: number; y: number; lengthM: number } | null;
  missiles: Vector3[];
}

export class PathMini {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pts = new Float32Array(N * 3);
  private cat = new Uint8Array(N);
  private count = 0;
  private head = 0;
  private gap = 0;
  private az = 0.6;
  private fullUntil = 0;
  private lastDraw = 0;
  private lastX: { x: number; z: number } | null = null;
  private isFull = false;

  constructor(parent: HTMLElement) {
    const c = (this.canvas = document.createElement('canvas'));
    c.className = 'path-mini';
    parent.appendChild(c);
    this.ctx = c.getContext('2d') as CanvasRenderingContext2D;
    c.addEventListener('click', () => {
      this.fullUntil = performance.now() + 5000;
      this.place();
    });
    window.addEventListener('resize', () => this.place());
    this.place();
    this.show(false);
  }

  show(on: boolean): void {
    this.canvas.style.display = on ? 'block' : 'none';
  }

  private place(): void {
    const full = performance.now() < this.fullUntil;
    const W = window.innerWidth;
    const w = full ? W : Math.round(Math.max(130, Math.min(200, W * 0.15)));
    const h = full ? window.innerHeight : Math.round(w * 0.72);
    const st = this.canvas.style;
    st.left = full ? '0px' : '10px';
    st.top = full ? '0px' : '10px';
    st.borderRadius = full ? '0' : '8px';
    st.background = full ? 'rgba(6,12,20,.92)' : 'rgba(6,12,20,.72)';
    st.zIndex = full ? '40' : '11';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      st.width = `${w}px`;
      st.height = `${h}px`;
    }
    this.isFull = full;
  }

  clear(): void {
    this.count = 0;
    this.head = 0;
  }

  /** every frame: position + what the jet is doing (for the colour) */
  record(dt: number, pos: Vector3, mach: number, loadG: number, flying: boolean): void {
    if (this.lastX !== null && Math.hypot(pos.x - this.lastX.x, pos.z - this.lastX.z) > 3000) this.clear(); // a jump
    this.lastX = { x: pos.x, z: pos.z };
    this.gap += dt;
    if (this.gap < 0.5 || !flying) return;
    this.gap = 0;
    const i = this.head;
    this.pts[3 * i] = pos.x;
    this.pts[3 * i + 1] = pos.y;
    this.pts[3 * i + 2] = pos.z;
    this.cat[i] = loadG > 5 ? 3 : mach > 1.2 ? 2 : mach >= 0.85 ? 1 : 0;
    this.head = (this.head + 1) % N;
    this.count = Math.min(N, this.count + 1);
  }

  draw(nowMs: number, dt: number, info: MiniInfo): void {
    if (this.isFull !== nowMs < this.fullUntil) this.place();
    this.az += dt * 0.12;
    if (nowMs - this.lastDraw < (this.isFull ? 33 : 120)) return;
    this.lastDraw = nowMs;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    const P: [number, number, number, number][] = [];
    for (let k = 0; k < this.count; k++) {
      const i = (this.head - this.count + k + N) % N;
      P.push([this.pts[3 * i], this.pts[3 * i + 1], this.pts[3 * i + 2], this.cat[i]]);
    }
    P.push([info.pos.x, info.pos.y, info.pos.z, P.length ? P[P.length - 1][3] : 0]);
    const extra: [number, number, number][] = [];
    if (info.ghost) for (const g of info.ghost) extra.push([g.x, g.y, g.z]);
    const e = info.runway;
    if (e) extra.push([e.thrX, e.y, e.thrZ], [e.thrX + e.dirX * e.lengthM, e.y, e.thrZ + e.dirZ * e.lengthM]);
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    let z0 = Infinity;
    let z1 = -Infinity;
    for (const p of [...P, ...extra]) {
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
      z0 = Math.min(z0, p[2]);
      z1 = Math.max(z1, p[2]);
    }
    const gy = Math.min(y0, info.groundY);
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    const cy = (gy + y1) / 2;
    const span = Math.max(400, x1 - x0, z1 - z0, (y1 - gy) * 1.3);
    const k = (Math.min(W, H) * 0.78) / span;
    const ca = Math.cos(this.az);
    const sa = Math.sin(this.az);
    const el = 0.42;
    const ce = Math.cos(el);
    const se = Math.sin(el);
    const proj = (x: number, y: number, z: number): [number, number] => {
      const dx = x - cx;
      const dz = z - cz;
      const dy = y - cy;
      const rx = dx * ca - dz * sa;
      const rz = dx * sa + dz * ca;
      return [W / 2 + rx * k, H / 2 - (dy * ce - rz * se) * k];
    };
    const lw = Math.max(1, Math.min(W, H) / 180);

    // ground grid
    ctx.strokeStyle = 'rgba(80,140,110,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const half = span * 0.6;
    for (let g = -4; g <= 4; g++) {
      const t = (g / 4) * half;
      let a = proj(cx - half, gy, cz + t);
      let b = proj(cx + half, gy, cz + t);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      a = proj(cx + t, gy, cz - half);
      b = proj(cx + t, gy, cz + half);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    // runway
    if (e) {
      const a = proj(e.thrX, e.y, e.thrZ);
      const b = proj(e.thrX + e.dirX * e.lengthM, e.y, e.thrZ + e.dirZ * e.lengthM);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = lw * 3;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    // drop lines to the ground
    ctx.strokeStyle = 'rgba(148,163,184,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < P.length; i += 8) {
      const a = proj(P[i][0], P[i][1], P[i][2]);
      const b = proj(P[i][0], gy, P[i][2]);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    // ghost
    if (info.ghost && info.ghost.length > 1) {
      ctx.strokeStyle = 'rgba(154,216,255,0.75)';
      ctx.lineWidth = lw;
      ctx.setLineDash([lw * 4, lw * 3]);
      ctx.beginPath();
      info.ghost.forEach((g, i) => {
        const a = proj(g.x, g.y, g.z);
        if (i) ctx.lineTo(a[0], a[1]);
        else ctx.moveTo(a[0], a[1]);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // path, coloured, fading towards the oldest part
    ctx.lineWidth = lw * 2;
    ctx.lineCap = 'round';
    for (let i = 1; i < P.length; i++) {
      const a = proj(P[i - 1][0], P[i - 1][1], P[i - 1][2]);
      const b = proj(P[i][0], P[i][1], P[i][2]);
      ctx.globalAlpha = 0.35 + (0.65 * i) / P.length;
      ctx.strokeStyle = COLORS[P[i][3]];
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // missiles in the air that fall inside the picture
    ctx.fillStyle = '#ff5040';
    for (const m of info.missiles) {
      if (Math.abs(m.x - cx) > span * 0.6 || Math.abs(m.z - cz) > span * 0.6) continue;
      const a = proj(m.x, m.y, m.z);
      ctx.beginPath();
      ctx.arc(a[0], a[1], lw * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // the jet: dot and a short line along its direction of travel
    const now = proj(info.pos.x, info.pos.y, info.pos.z);
    const v = info.vel;
    const sp = Math.max(1, Math.hypot(v.x, v.y, v.z));
    const ahead = proj(info.pos.x + (v.x / sp) * span * 0.08, info.pos.y + (v.y / sp) * span * 0.08, info.pos.z + (v.z / sp) * span * 0.08);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = lw * 2;
    ctx.beginPath();
    ctx.moveTo(now[0], now[1]);
    ctx.lineTo(ahead[0], ahead[1]);
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(now[0], now[1], lw * 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
