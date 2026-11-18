// Fighter HUD ported from the SkyForge fighter (src/hud/fighterHud.js): horizon, 5-degree pitch ladder (solid
// above, dashed below, ends bent towards the horizon, numbers both ends), zenith / nadir marks, gun cross, flight
// path marker (held at the edge with an X), steering diamond to the runway, ILS needles on final, AoA approach
// bracket with the gear down, heading tape, speed tape with Mach and angle of attack, altitude tape (height above
// the ground with R below 5,000 ft) with climb rate, G + MAX, power / AB, bank scale with pointer and angle,
// the manoeuvre line with its score, flashing STALL / LIM OFF. Phones get a smaller HUD (ladder every 10 deg,
// value boxes only). Conformal symbols are real world directions put through the chase camera's projection, so
// they lie on the outside world; the chase camera banks with the jet, so the bank pointer is read from the
// horizon on the screen. Drawn on one canvas over the 3D view.
import { type PerspectiveCamera, type Quaternion, Vector3 } from 'three';

const DEG = Math.PI / 180;
const _c = new Vector3();
const _h = new Vector3();
const _p = new Vector3();
const _n = new Vector3();
const _v = new Vector3();
const _w = new Vector3();

export interface HudData {
  q: Quaternion;
  vel: Vector3;
  /** heading angle of the nose (nose = (-sin yaw, 0, -cos yaw)) */
  yaw: number;
  bankDeg: number;
  headingDeg: number;
  iasKt: number;
  mach: number;
  altFt: number;
  radarAlt: boolean;
  vsiFpm: number;
  gLoad: number;
  maxG: number;
  aoaDeg: number;
  power: number;
  isAfterburner: boolean;
  limiterOff: boolean;
  stalled: boolean;
  onGround: boolean;
  /** steering diamond: degrees to turn right to the target, or null */
  navTurn: number | null;
  nowMs: number;
  mnv: { text: string; stars: number } | null;
  aoaBracket: number | null;
  ils: { loc: number; gs: number } | null;
  dim: boolean;
}

interface Layout {
  W: number;
  H: number;
  font: number;
  lw: number;
  color: string;
  compact: boolean;
  outline: boolean;
  clip: { x: number; y: number; w: number; h: number };
  tapeLX: number;
  tapeRX: number;
  tapeHalf: number;
  midY: number;
  headY: number;
  mnvY: number;
  bankY: number;
  bankR: number;
}

/** direction at azimuth yaw and elevation el, moved sideways (parallel to the horizon) by the angle side */
function dirAt(out: Vector3, yaw: number, el: number, side = 0): Vector3 {
  const ce = Math.cos(el);
  out.set(-Math.sin(yaw) * ce, Math.sin(el), -Math.cos(yaw) * ce);
  if (side) {
    _h.set(Math.cos(yaw), 0, -Math.sin(yaw));
    out.addScaledVector(_h, Math.tan(side)).normalize();
  }
  return out;
}

const flash = (nowMs: number, hz = 2): boolean => Math.floor((nowMs / 1000) * hz * 2) % 2 === 0;

function screenLayout(W: number, H: number, compact: boolean, color: string): Layout {
  const font = Math.round(Math.max(11, Math.min(16, H / 58)));
  const cw = Math.min(W * (compact ? 0.62 : 0.5), H * (compact ? 0.9 : 0.8));
  const ch = H * (compact ? 0.5 : 0.58);
  const cy = H * (compact ? 0.42 : 0.5); // a little low: the game's HP bar and tag sit at the top centre
  return {
    W,
    H,
    font,
    lw: Math.max(1.5, font / 9),
    color,
    compact,
    outline: true,
    clip: { x: W / 2 - cw / 2, y: cy - ch / 2, w: cw, h: ch },
    tapeLX: W / 2 - cw / 2 - font * 3.2,
    tapeRX: W / 2 + cw / 2 + font * 3.2,
    tapeHalf: ch * 0.34,
    midY: cy,
    headY: cy - ch / 2 - font * 0.4,
    mnvY: cy + ch / 2 + font * 1.6, // under the bank scale (the top centre holds the game's HP bar)
    bankY: cy + ch / 2 - font * 4.2,
    bankR: font * 3.2,
  };
}

export class FighterHud {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fighter-hud';
    parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.show(false);
  }

  show(on: boolean): void {
    this.canvas.style.display = on ? 'block' : 'none';
  }

  draw(d: HudData, cam: PerspectiveCamera, compact: boolean): void {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(W * dpr) || this.canvas.height !== Math.round(H * dpr)) {
      this.canvas.width = Math.round(W * dpr);
      this.canvas.height = Math.round(H * dpr);
      this.dpr = dpr;
    }
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const L = screenLayout(W, H, compact, '#3cff8c');
    const camPos = cam.position;
    const proj = (dir: Vector3): [number, number] | null => {
      _w.copy(dir).multiplyScalar(5000).add(camPos).project(cam);
      if (_w.z > 1 || _w.z < -1) return null;
      return [(_w.x * 0.5 + 0.5) * W, (-_w.y * 0.5 + 0.5) * H];
    };
    drawFighterHud(ctx, L, d, proj);
  }
}

function drawFighterHud(ctx: CanvasRenderingContext2D, L: Layout, d: HudData, P: (dir: Vector3) => [number, number] | null): void {
  const { W, clip, font } = L;
  const col = L.color;
  ctx.save();
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = L.lw;
  ctx.lineJoin = 'round';
  ctx.globalAlpha = d.dim ? 0.7 : 0.95;
  ctx.font = `bold ${font}px monospace`;
  if (L.outline) {
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 3;
  }
  const line = (a: [number, number] | null, b: [number, number] | null): void => {
    if (!a || !b) return;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  };

  // ---------- conformal part, clipped to the HUD field of view ----------
  ctx.save();
  ctx.beginPath();
  ctx.rect(clip.x, clip.y, clip.w, clip.h);
  ctx.clip();
  const yaw = d.yaw;
  const pitchDeg = Math.asin(Math.max(-1, Math.min(1, _n.set(0, 0, -1).applyQuaternion(d.q).y))) / DEG;

  // horizon: a long line with a gap in the middle
  ctx.beginPath();
  line(P(dirAt(_c, yaw, 0, -40 * DEG)), P(dirAt(_p, yaw, 0, -3 * DEG)));
  line(P(dirAt(_c, yaw, 0, 3 * DEG)), P(dirAt(_p, yaw, 0, 40 * DEG)));
  ctx.stroke();

  // pitch ladder
  const step = L.compact ? 10 : 5;
  const inner = 2.2 * DEG;
  const outer = 7 * DEG;
  const labelAt = 8.6 * DEG;
  ctx.textBaseline = 'middle';
  for (let p = -85; p <= 85; p += step) {
    if (p === 0 || Math.abs(p - pitchDeg) > 40) continue;
    const el = p * DEG;
    const toward = (p > 0 ? -1.3 : 1.3) * DEG;
    const a = P(dirAt(_c, yaw, el, -outer));
    const b = P(dirAt(_p, yaw, el, -inner));
    const c = P(dirAt(_v, yaw, el, inner));
    const e = P(dirAt(_n, yaw, el, outer));
    if (!a || !b || !c || !e) continue;
    const ta = P(dirAt(_c, yaw, el + toward, -outer));
    const te = P(dirAt(_p, yaw, el + toward, outer));
    ctx.setLineDash(p < 0 ? [font * 0.55, font * 0.4] : []);
    ctx.beginPath();
    if (ta) line(ta, a);
    line(a, b);
    line(c, e);
    if (te) line(e, te);
    ctx.stroke();
    ctx.setLineDash([]);
    const la = P(dirAt(_c, yaw, el, -labelAt));
    const le = P(dirAt(_p, yaw, el, labelAt));
    ctx.textAlign = 'center';
    if (la) ctx.fillText(String(Math.abs(p)), la[0], la[1]);
    if (le) ctx.fillText(String(Math.abs(p)), le[0], le[1]);
  }
  // zenith (circle) and nadir (circle with a cross)
  for (const [p, cross] of [
    [89.999, false],
    [-89.999, true],
  ] as [number, boolean][]) {
    if (Math.abs(p - pitchDeg) > 40) continue;
    const z = P(dirAt(_c, yaw, p * DEG));
    if (!z) continue;
    const r = font * 0.8;
    ctx.beginPath();
    ctx.arc(z[0], z[1], r, 0, Math.PI * 2);
    if (cross) {
      ctx.moveTo(z[0] - r, z[1] - r);
      ctx.lineTo(z[0] + r, z[1] + r);
      ctx.moveTo(z[0] + r, z[1] - r);
      ctx.lineTo(z[0] - r, z[1] + r);
    }
    ctx.stroke();
  }

  // gun cross / waterline: where the nose points
  const nose = P(_n.set(0, 0, -1).applyQuaternion(d.q));
  if (nose) {
    const s = font * 0.9;
    ctx.beginPath();
    ctx.moveTo(nose[0] - 2 * s, nose[1]);
    ctx.lineTo(nose[0] - s, nose[1]);
    ctx.lineTo(nose[0] - s / 2, nose[1] + s * 0.6);
    ctx.lineTo(nose[0], nose[1]);
    ctx.lineTo(nose[0] + s / 2, nose[1] + s * 0.6);
    ctx.lineTo(nose[0] + s, nose[1]);
    ctx.lineTo(nose[0] + 2 * s, nose[1]);
    ctx.stroke();
  }

  // flight path marker: where the jet is really going; held at the edge (with an X) when outside the HUD
  const speed = d.vel.length();
  if (speed > 15) {
    const f = P(_v.copy(d.vel).divideScalar(speed));
    if (f) {
      const r = font * 0.6;
      const m = r * 3;
      const held = f[0] < clip.x + m || f[0] > clip.x + clip.w - m || f[1] < clip.y + m || f[1] > clip.y + clip.h - m;
      const x = Math.max(clip.x + m, Math.min(clip.x + clip.w - m, f[0]));
      const y = Math.max(clip.y + m, Math.min(clip.y + clip.h - m, f[1]));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.moveTo(x - r, y);
      ctx.lineTo(x - 2.6 * r, y);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + 2.6 * r, y);
      ctx.moveTo(x, y - r);
      ctx.lineTo(x, y - 1.9 * r);
      if (held) {
        ctx.moveTo(x - r * 0.7, y - r * 0.7);
        ctx.lineTo(x + r * 0.7, y + r * 0.7);
        ctx.moveTo(x + r * 0.7, y - r * 0.7);
        ctx.lineTo(x - r * 0.7, y + r * 0.7);
      }
      ctx.stroke();
      // AoA approach bracket (gear down, in the air): marker high in the bracket = too slow, low = too fast
      if (d.aoaBracket !== null && !d.onGround) {
        const k = font * 0.55;
        const cy = y + (d.aoaDeg - d.aoaBracket) * k;
        const bx = x - 3.3 * r;
        ctx.beginPath();
        ctx.moveTo(bx + r * 0.6, cy - 2 * k);
        ctx.lineTo(bx, cy - 2 * k);
        ctx.lineTo(bx, cy + 2 * k);
        ctx.lineTo(bx + r * 0.6, cy + 2 * k);
        ctx.moveTo(bx, cy);
        ctx.lineTo(bx + r * 0.4, cy);
        ctx.stroke();
      }
    }
  }

  // steering diamond to the runway on the horizon (filled when held at the edge)
  if (d.navTurn !== null && !L.compact) {
    const s = P(dirAt(_c, yaw - d.navTurn * DEG, 0));
    if (s) {
      const r = font * 0.6;
      const m = r * 2;
      const held = s[0] < clip.x + m || s[0] > clip.x + clip.w - m || s[1] < clip.y + m || s[1] > clip.y + clip.h - m;
      const x = Math.max(clip.x + m, Math.min(clip.x + clip.w - m, s[0]));
      const y = Math.max(clip.y + m, Math.min(clip.y + clip.h - m, s[1]));
      ctx.strokeStyle = ctx.fillStyle = '#ff6bff';
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      if (held) ctx.fill();
      else ctx.stroke();
      ctx.strokeStyle = ctx.fillStyle = col;
    }
  }
  // ILS needles on final: vertical = centre line, horizontal = glide slope; centred = on the beam
  if (d.ils && !L.compact) {
    const cx = clip.x + clip.w / 2;
    const cy = clip.y + clip.h / 2;
    const span = Math.min(clip.w, clip.h) * 0.22;
    ctx.save();
    ctx.setLineDash([font * 0.5, font * 0.35]);
    ctx.beginPath();
    const lx = cx + d.ils.loc * span;
    const gy = cy - d.ils.gs * span;
    ctx.moveTo(lx, cy - span);
    ctx.lineTo(lx, cy + span);
    ctx.moveTo(cx - span, gy);
    ctx.lineTo(cx + span, gy);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // ---------- fixed part ----------
  ctx.textBaseline = 'alphabetic';
  const midY = L.midY;
  tape(ctx, L, d.iasKt, 10, 50, L.tapeLX, -1, midY, L.compact);
  tape(ctx, L, d.altFt, 100, 500, L.tapeRX, 1, midY, L.compact, d.radarAlt ? 'R' : '');
  const lx = L.tapeLX;
  const rx = L.tapeRX;
  const big = font * 1.25;
  ctx.textAlign = 'center';
  ctx.font = `bold ${font}px monospace`;
  ctx.fillText(`${d.gLoad.toFixed(1)}G`, lx, midY - L.tapeHalf - big * 1.4);
  if (!L.compact) {
    ctx.fillText(`MAX ${d.maxG.toFixed(1)}`, lx, midY - L.tapeHalf - big * 0.4);
    ctx.fillText(`M ${d.mach.toFixed(2)}`, lx, midY + L.tapeHalf + big * 0.9);
    ctx.fillText(`α ${d.aoaDeg.toFixed(1)}`, lx, midY + L.tapeHalf + big * 1.9);
    ctx.fillText(d.isAfterburner ? 'AB' : `${Math.round(d.power)}%`, rx, midY - L.tapeHalf - big * 0.4);
    const vs = Math.round(d.vsiFpm / 10) * 10;
    ctx.fillText(`${vs > 0 ? '+' : ''}${vs}`, rx, midY + L.tapeHalf + big * 0.9);
  } else {
    ctx.fillText(`M ${d.mach.toFixed(2)}`, lx, midY + L.tapeHalf + big * 0.9);
  }

  // heading tape (top)
  if (!L.compact) {
    const hx = W / 2;
    const hy = L.headY;
    const span = Math.min(clip.w * 0.42, font * 14);
    const ppd = span / 17;
    ctx.save();
    ctx.beginPath();
    ctx.rect(hx - span, hy - font * 1.6, span * 2, font * 2.4);
    ctx.clip();
    ctx.beginPath();
    const first = Math.floor((d.headingDeg - 18) / 5) * 5;
    ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
    for (let h = first; h <= d.headingDeg + 18; h += 5) {
      const x = hx + (h - d.headingDeg) * ppd;
      const major = ((h % 10) + 10) % 10 === 0;
      ctx.moveTo(x, hy);
      ctx.lineTo(x, hy - (major ? font * 0.6 : font * 0.3));
      if (major) ctx.fillText(String(((h % 360) + 360) % 360).padStart(3, '0'), x, hy - font * 0.8);
    }
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(hx, hy + 2);
    ctx.lineTo(hx - font * 0.4, hy + font * 0.6);
    ctx.lineTo(hx + font * 0.4, hy + font * 0.6);
    ctx.closePath();
    ctx.stroke();
  }

  // bank scale (bottom): ticks at 0, 10, 20, 30, 45, 60 deg; the pointer is the way down, square to the horizon
  if (!L.compact) {
    const bx = W / 2;
    const by = L.bankY;
    const R = L.bankR;
    ctx.beginPath();
    for (const a of [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]) {
      const t = a * DEG;
      const len = a % 30 === 0 ? font * 0.8 : font * 0.45;
      ctx.moveTo(bx + Math.sin(t) * R, by + Math.cos(t) * R);
      ctx.lineTo(bx + Math.sin(t) * (R + len), by + Math.cos(t) * (R + len));
    }
    ctx.stroke();
    // the chase camera banks with the jet: the horizon's own angle on the screen is the bank
    const a = P(dirAt(_c, yaw, pitchDeg * DEG));
    const b = P(dirAt(_p, yaw, pitchDeg * DEG, 2 * DEG));
    let th = -d.bankDeg * DEG;
    if (a && b) th = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (Math.abs(th) <= Math.PI * 0.6) {
      const ux = -Math.sin(th);
      const uy = Math.cos(th);
      const wx = Math.cos(th);
      const wy = Math.sin(th);
      const s = font * 0.55;
      const tx = bx + ux * (R - 2);
      const ty = by + uy * (R - 2);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - ux * s * 1.4 - wx * s, ty - uy * s * 1.4 - wy * s);
      ctx.lineTo(tx - ux * s * 1.4 + wx * s, ty - uy * s * 1.4 + wy * s);
      ctx.closePath();
      ctx.fill();
    }
    if (Math.abs(d.bankDeg) >= 5) ctx.fillText(`${Math.round(Math.abs(d.bankDeg))}`, bx, by + R + font * 2);
  }

  // the manoeuvre being flown, or its score with stars when it ends
  if (d.mnv) {
    const y = L.compact ? clip.y + font * 1.2 : L.mnvY;
    ctx.font = `bold ${Math.round(font * 1.05)}px monospace`;
    ctx.textAlign = 'center';
    const stars = d.mnv.stars ? '  ' + '★'.repeat(d.mnv.stars) + '☆'.repeat(3 - d.mnv.stars) : '';
    ctx.fillText(d.mnv.text + stars, W / 2, y);
  }

  // warnings: short, flashing, above the bank scale
  const warn: string[] = [];
  if (d.stalled) warn.push('STALL');
  if (d.limiterOff) warn.push('LIM OFF');
  if (warn.length && (flash(d.nowMs) || warn[0] === 'LIM OFF')) {
    ctx.font = `bold ${Math.round(font * 1.1)}px monospace`;
    ctx.fillStyle = d.stalled ? '#ff5a4f' : col;
    ctx.fillText(warn.join('  '), W / 2, L.compact ? clip.y + clip.h - font : L.bankY - font * 0.8);
  }
  ctx.restore();
}

/** vertical tape: line, ticks, numbers every labelStep, and the value in a box at midY. side -1 = left, +1 = right */
function tape(ctx: CanvasRenderingContext2D, L: Layout, value: number, tickStep: number, labelStep: number, x: number, side: number, midY: number, compact: boolean, suffix = ''): void {
  const font = L.font;
  const half = L.tapeHalf;
  const ppu = half / (labelStep * 2.2);
  const bw = font * 4.6;
  const bh = font * 1.8;
  if (!compact) {
    const lineX = x - side * bw * 0.25;
    ctx.save();
    ctx.beginPath();
    ctx.rect(lineX - font * 5, midY - half, font * 10, half * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(lineX, midY - half);
    ctx.lineTo(lineX, midY + half);
    ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
    ctx.textAlign = side < 0 ? 'right' : 'left';
    const span = half / ppu;
    for (let v = Math.floor((value - span) / tickStep) * tickStep; v <= value + span; v += tickStep) {
      if (v < 0) continue;
      const y = midY - (v - value) * ppu;
      const major = v % labelStep === 0;
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX + side * (major ? font * 0.7 : font * 0.35), y);
      if (major && Math.abs(y - midY) > bh * 0.7) ctx.fillText(String(v), lineX + side * font * 0.9, y + font * 0.3);
    }
    ctx.stroke();
    ctx.restore();
  }
  const bx = x - bw / 2;
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(bx, midY - bh / 2, bw, bh);
  ctx.restore();
  ctx.strokeRect(bx, midY - bh / 2, bw, bh);
  ctx.font = `bold ${Math.round(font * 1.15)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(String(Math.max(0, Math.round(value))) + suffix, x, midY + font * 0.42);
}
