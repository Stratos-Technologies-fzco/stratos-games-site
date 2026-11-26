// Fighter HUD (fighter upgrade, phase 1, 09-Nov-2026): one F-16 style symbol set, drawn on the cockpit combiner glass
// and, in the chase view, over the whole screen. Every conformal symbol (horizon, pitch ladder, flight path marker,
// gun cross, steering cue) is a real world direction put through the view's own projection, so it lies exactly on
// the outside world in either view. Tapes, scales and numbers are fixed to the display.
//
// drawFighterHud(ctx, L, d, proj)
//   L: layout { W, H, clip: {x, y, w, h}, font, lw, color, compact, tapeLX, tapeRX, tapeHalf, midY, headY, bankY, bankR, outline }
//   d: flight data { q (body quaternion), vel (world m/s), yaw (rot.y), bankDeg, headingDeg, iasKt, mach, altFt, radarAlt,
//      vsiFpm, gLoad, maxG, aoaDeg, power, isAfterburner, limiterOff, stalled, overspeed, fuelPct, onGround, nav, nowMs,
//      mnv: { text, stars } manoeuvre line or null, aoaBracket: approach AoA in deg (gear down) or null,
//      ils: { inRange, locDeviation, gsDeviation }, weapons: see src/hud/weaponsHud.js (or null) }
//   proj(worldDir) -> [x, y] on the display, or null when the direction is behind the viewer
import * as THREE from 'three';
import { drawWeaponsConformal, drawWeaponsFixed } from './weaponsHud.js';

const DEG = Math.PI / 180;
const _c = new THREE.Vector3();
const _h = new THREE.Vector3();
const _p = new THREE.Vector3();
const _n = new THREE.Vector3();
const _v = new THREE.Vector3();

// World direction at azimuth yaw (the game's heading angle: nose = (-sin yaw, 0, -cos yaw)) and elevation el,
// moved sideways (parallel to the horizon) by the angle side
function dirAt(out, yaw, el, side = 0) {
  const ce = Math.cos(el);
  out.set(-Math.sin(yaw) * ce, Math.sin(el), -Math.cos(yaw) * ce);
  if (side) { _h.set(Math.cos(yaw), 0, -Math.sin(yaw)); out.addScaledVector(_h, Math.tan(side)).normalize(); }
  return out;
}

const flash = (nowMs, hz = 2) => Math.floor(nowMs / 1000 * hz * 2) % 2 === 0;

export function drawFighterHud(ctx, L, d, proj) {
  const { W, H, clip, font } = L;
  const col = L.color;
  ctx.save();
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = L.lw;
  ctx.lineJoin = 'round';
  ctx.globalAlpha = d.dim ? 0.7 : 1;   // dimmer at dusk
  ctx.font = `bold ${font}px monospace`;
  if (L.outline) { ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 3; }

  const P = (dir) => proj(dir);
  const line = (a, b) => { if (!a || !b) return; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };

  // ---------- Conformal part, clipped to the HUD field of view ----------
  ctx.save();
  ctx.beginPath();
  ctx.rect(clip.x, clip.y, clip.w, clip.h);
  ctx.clip();

  const yaw = d.yaw;
  const pitchDeg = Math.asin(Math.max(-1, Math.min(1, _n.set(0, 0, -1).applyQuaternion(d.q).y))) / DEG;

  // Horizon: a long line with a gap in the middle
  ctx.beginPath();
  line(P(dirAt(_c, yaw, 0, -40 * DEG)), P(dirAt(_p, yaw, 0, -3 * DEG)));
  line(P(dirAt(_c, yaw, 0, 3 * DEG)), P(dirAt(_p, yaw, 0, 40 * DEG)));
  ctx.stroke();

  // Pitch ladder: every 5 deg (10 on a phone), solid above the horizon, dashed below, ends bent towards the horizon,
  // the number at both ends. Only rungs within 40 deg of the nose are drawn.
  const step = L.compact ? 10 : 5;
  const inner = 2.2 * DEG, outer = 7 * DEG, labelAt = 8.6 * DEG;
  ctx.textBaseline = 'middle';
  for (let p = -85; p <= 85; p += step) {
    if (p === 0 || Math.abs(p - pitchDeg) > 40) continue;
    const el = p * DEG, toward = (p > 0 ? -1.3 : 1.3) * DEG;
    const a = P(dirAt(_c, yaw, el, -outer)), b = P(dirAt(_p, yaw, el, -inner));
    const c = P(dirAt(_v, yaw, el, inner)), e = P(dirAt(_n, yaw, el, outer));
    if (!a || !b || !c || !e) continue;
    const ta = P(dirAt(_c, yaw, el + toward, -outer)), te = P(dirAt(_p, yaw, el + toward, outer));
    ctx.setLineDash(p < 0 ? [font * 0.55, font * 0.4] : []);
    ctx.beginPath();
    if (ta) line(ta, a);
    line(a, b);
    line(c, e);
    if (te) line(e, te);
    ctx.stroke();
    ctx.setLineDash([]);
    const la = P(dirAt(_c, yaw, el, -labelAt)), le = P(dirAt(_p, yaw, el, labelAt));
    ctx.textAlign = 'center';
    if (la) ctx.fillText(String(Math.abs(p)), la[0], la[1]);
    if (le) ctx.fillText(String(Math.abs(p)), le[0], le[1]);
  }
  // Zenith (circle) and nadir (circle with a cross)
  [[89.999, false], [-89.999, true]].forEach(([p, cross]) => {
    if (Math.abs(p - pitchDeg) > 40) return;
    const z = P(dirAt(_c, yaw, p * DEG));
    if (!z) return;
    const r = font * 0.8;
    ctx.beginPath();
    ctx.arc(z[0], z[1], r, 0, Math.PI * 2);
    if (cross) { ctx.moveTo(z[0] - r, z[1] - r); ctx.lineTo(z[0] + r, z[1] + r); ctx.moveTo(z[0] + r, z[1] - r); ctx.lineTo(z[0] - r, z[1] + r); }
    ctx.stroke();
  });

  // Gun cross / waterline: where the nose points
  const nose = P(_n.set(0, 0, -1).applyQuaternion(d.q));
  if (nose) {
    const s = font * 0.9;
    ctx.beginPath();
    ctx.moveTo(nose[0] - 2 * s, nose[1]); ctx.lineTo(nose[0] - s, nose[1]); ctx.lineTo(nose[0] - s / 2, nose[1] + s * 0.6);
    ctx.lineTo(nose[0], nose[1]); ctx.lineTo(nose[0] + s / 2, nose[1] + s * 0.6); ctx.lineTo(nose[0] + s, nose[1]); ctx.lineTo(nose[0] + 2 * s, nose[1]);
    ctx.stroke();
  }

  // Flight path marker: where the aircraft is really going. Held at the edge (with an X) when it is outside the HUD.
  const speed = d.vel.length();
  if (speed > 15) {
    let f = P(_v.copy(d.vel).divideScalar(speed));
    if (f) {
      const r = font * 0.6, m = r * 3;
      const held = f[0] < clip.x + m || f[0] > clip.x + clip.w - m || f[1] < clip.y + m || f[1] > clip.y + clip.h - m;
      const x = Math.max(clip.x + m, Math.min(clip.x + clip.w - m, f[0])), y = Math.max(clip.y + m, Math.min(clip.y + clip.h - m, f[1]));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.moveTo(x - r, y); ctx.lineTo(x - 2.6 * r, y);
      ctx.moveTo(x + r, y); ctx.lineTo(x + 2.6 * r, y);
      ctx.moveTo(x, y - r); ctx.lineTo(x, y - 1.9 * r);
      if (held) { ctx.moveTo(x - r * 0.7, y - r * 0.7); ctx.lineTo(x + r * 0.7, y + r * 0.7); ctx.moveTo(x + r * 0.7, y - r * 0.7); ctx.lineTo(x - r * 0.7, y + r * 0.7); }
      ctx.stroke();
      // AoA approach bracket (gear down, in the air): the flight path marker sits in the middle of the bracket at the
      // approach angle of attack; marker high in the bracket = too slow, low = too fast (2 deg either side)
      if (d.aoaBracket !== null && d.aoaBracket !== undefined && !d.onGround) {
        const k = font * 0.55, cy = y + (d.aoaDeg - d.aoaBracket) * k, bx = x - 3.3 * r;
        ctx.beginPath();
        ctx.moveTo(bx + r * 0.6, cy - 2 * k); ctx.lineTo(bx, cy - 2 * k); ctx.lineTo(bx, cy + 2 * k); ctx.lineTo(bx + r * 0.6, cy + 2 * k);
        ctx.moveTo(bx, cy); ctx.lineTo(bx + r * 0.4, cy);
        ctx.stroke();
      }
    }
  }

  // Steering cue to the next route point / runway: a diamond on the horizon in its direction (filled when held at the edge)
  if (d.nav && !d.nav.complete && !L.compact) {
    const s = P(dirAt(_c, yaw - d.nav.turn * DEG, 0));   // turn > 0 = to the right = smaller yaw
    if (s) {
      const r = font * 0.6, m = r * 2;
      const held = s[0] < clip.x + m || s[0] > clip.x + clip.w - m || s[1] < clip.y + m || s[1] > clip.y + clip.h - m;
      const x = Math.max(clip.x + m, Math.min(clip.x + clip.w - m, s[0])), y = Math.max(clip.y + m, Math.min(clip.y + clip.h - m, s[1]));
      ctx.strokeStyle = ctx.fillStyle = '#ff6bff';
      ctx.beginPath();
      ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
      held ? ctx.fill() : ctx.stroke();
      ctx.strokeStyle = ctx.fillStyle = col;
    }
  }
  // ILS needles on the HUD (on final): vertical = localizer, horizontal = glide slope; centred = on the beam
  if (d.ils && d.ils.inRange && !L.compact) {
    const cx = clip.x + clip.w / 2, cy = clip.y + clip.h / 2, span = Math.min(clip.w, clip.h) * 0.22;
    ctx.save();
    ctx.setLineDash([font * 0.5, font * 0.35]);
    ctx.beginPath();
    const lx = cx + d.ils.locDeviation * span, gy = cy - d.ils.gsDeviation * span;
    ctx.moveTo(lx, cy - span); ctx.lineTo(lx, cy + span);
    ctx.moveTo(cx - span, gy); ctx.lineTo(cx + span, gy);
    ctx.stroke();
    ctx.restore();
  }
  // Weapons (phase 4): target box / arrow, IR seeker, gun lead ring, CCIP pipper (src/hud/weaponsHud.js)
  drawWeaponsConformal(ctx, L, d.weapons, P, d);
  ctx.restore();

  // ---------- Fixed part ----------
  ctx.textBaseline = 'alphabetic';
  const midY = L.midY;

  // Airspeed (left) and altitude (right) tapes; full on a computer, value boxes only on a phone
  tape(ctx, L, d.iasKt, 10, 50, L.tapeLX, -1, midY, L.compact);
  tape(ctx, L, d.altFt, 100, 500, L.tapeRX, 1, midY, L.compact, d.radarAlt ? 'R' : '');

  const lx = L.tapeLX, rx = L.tapeRX, big = font * 1.25;
  ctx.textAlign = 'center';
  // G now and the most this flight (top left), Mach and angle of attack (under the speed)
  ctx.font = `bold ${font}px monospace`;
  ctx.fillText(`${d.gLoad.toFixed(1)}G`, lx, midY - L.tapeHalf - big * 1.4);
  if (!L.compact) {
    ctx.fillText(`MAX ${d.maxG.toFixed(1)}`, lx, midY - L.tapeHalf - big * 0.4);
    ctx.fillText(`M ${d.mach.toFixed(2)}`, lx, midY + L.tapeHalf + big * 0.9);
    ctx.fillText(`α ${d.aoaDeg.toFixed(1)}`, lx, midY + L.tapeHalf + big * 1.9);
    // power (or AB) above the altitude, climb rate under it
    ctx.fillText(d.isAfterburner ? 'AB' : `${Math.round(d.power)}%`, rx, midY - L.tapeHalf - big * 0.4);
    const vs = Math.round(d.vsiFpm / 10) * 10;
    ctx.fillText(`${vs > 0 ? '+' : ''}${vs}`, rx, midY + L.tapeHalf + big * 0.9);
  } else {
    ctx.fillText(`M ${d.mach.toFixed(2)}`, lx, midY + L.tapeHalf + big * 0.9);
  }

  // Heading tape (top): ticks every 5 deg, numbers every 10, caret at the centre
  if (!L.compact) {
    const hx = W / 2, hy = L.headY, span = Math.min(clip.w * 0.42, font * 14), ppd = span / 17;
    ctx.save();
    ctx.beginPath(); ctx.rect(hx - span, hy - font * 1.6, span * 2, font * 2.4); ctx.clip();
    ctx.beginPath();
    const first = Math.floor((d.headingDeg - 18) / 5) * 5;
    ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
    for (let h = first; h <= d.headingDeg + 18; h += 5) {
      const x = hx + (h - d.headingDeg) * ppd;
      const major = ((h % 10) + 10) % 10 === 0;
      ctx.moveTo(x, hy); ctx.lineTo(x, hy - (major ? font * 0.6 : font * 0.3));
      if (major) ctx.fillText(String(((h % 360) + 360) % 360).padStart(3, '0'), x, hy - font * 0.8);
    }
    ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(hx, hy + 2); ctx.lineTo(hx - font * 0.4, hy + font * 0.6); ctx.lineTo(hx + font * 0.4, hy + font * 0.6); ctx.closePath(); ctx.stroke();
  }

  // Bank scale (bottom): fixed ticks at 0, 10, 20, 30, 45, 60 deg; the pointer is the way down, square to the horizon
  if (!L.compact) {
    const bx = W / 2, by = L.bankY, R = L.bankR;
    ctx.beginPath();
    [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].forEach((a) => {
      const t = a * DEG, len = a % 30 === 0 ? font * 0.8 : font * 0.45;
      ctx.moveTo(bx + Math.sin(t) * R, by + Math.cos(t) * R);
      ctx.lineTo(bx + Math.sin(t) * (R + len), by + Math.cos(t) * (R + len));
    });
    ctx.stroke();
    // angle of the horizon on this display, from two points along it near the nose
    const a = P(dirAt(_c, yaw, pitchDeg * DEG)), b = P(dirAt(_p, yaw, pitchDeg * DEG, 2 * DEG));
    // On the combiner the display rolls with the aircraft, so the horizon's own angle is the bank. The chase camera
    // keeps the horizon level, so there the pointer shows the aircraft's bank itself (same direction as in the cockpit).
    let th = -d.bankDeg * DEG;
    if (!L.bankFromData && a && b) th = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (Math.abs(th) <= Math.PI * 0.6) {
      // tip on the arc, base towards the centre; u = the way down on this display, w = along the horizon
      const ux = -Math.sin(th), uy = Math.cos(th), wx = Math.cos(th), wy = Math.sin(th), s = font * 0.55;
      const tx = bx + ux * (R - 2), ty = by + uy * (R - 2);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - ux * s * 1.4 - wx * s, ty - uy * s * 1.4 - wy * s);
      ctx.lineTo(tx - ux * s * 1.4 + wx * s, ty - uy * s * 1.4 + wy * s);
      ctx.closePath();
      ctx.fill();
    }
    if (Math.abs(d.bankDeg) >= 5) ctx.fillText(`${Math.round(Math.abs(d.bankDeg))}`, bx, by + R + font * 2);
  }

  // Aerobatics: the manoeuvre being flown, or its score with stars when it ends (src/flight/maneuvers.js)
  if (d.mnv) {
    const y = L.compact ? clip.y + font * 1.2 : L.mnvY;
    ctx.font = `bold ${Math.round(font * 1.05)}px monospace`;
    ctx.textAlign = 'center';
    const stars = d.mnv.stars ? '  ' + '★'.repeat(d.mnv.stars) + '☆'.repeat(3 - d.mnv.stars) : '';
    ctx.fillText(d.mnv.text + stars, W / 2, y);
  }

  // Warnings: short, flashing, above the bank scale
  const warn = [];
  if (d.stalled) warn.push('STALL');
  if (d.overspeed) warn.push('OVSPD');
  if (d.limiterOff) warn.push('LIM OFF');
  if (d.fuelPct !== undefined && d.fuelPct < 15) warn.push('FUEL');
  if (warn.length && (flash(d.nowMs) || warn[0] === 'LIM OFF')) {
    ctx.font = `bold ${Math.round(font * 1.1)}px monospace`;
    ctx.fillStyle = d.stalled || d.overspeed ? '#ff5a4f' : col;
    ctx.fillText(warn.join('  '), W / 2, L.compact ? clip.y + clip.h - font : L.bankY - font * 0.8);
  }
  drawWeaponsFixed(ctx, L, d.weapons, d);
  ctx.restore();
}

// Vertical tape: line, ticks, numbers every labelStep, and the value in a box at midY. side -1 = left, +1 = right.
function tape(ctx, L, value, tickStep, labelStep, x, side, midY, compact, suffix = '') {
  const font = L.font, half = L.tapeHalf, ppu = half / (labelStep * 2.2);
  const bw = font * 4.6, bh = font * 1.8;
  if (!compact) {
    const lineX = x - side * bw * 0.25;
    ctx.save();
    ctx.beginPath(); ctx.rect(lineX - font * 5, midY - half, font * 10, half * 2); ctx.clip();
    ctx.beginPath();
    ctx.moveTo(lineX, midY - half); ctx.lineTo(lineX, midY + half);
    ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
    ctx.textAlign = side < 0 ? 'right' : 'left';
    const span = half / ppu;
    for (let v = Math.floor((value - span) / tickStep) * tickStep; v <= value + span; v += tickStep) {
      if (v < 0) continue;
      const y = midY - (v - value) * ppu;
      const major = v % labelStep === 0;
      ctx.moveTo(lineX, y); ctx.lineTo(lineX + side * (major ? font * 0.7 : font * 0.35), y);
      if (major && Math.abs(y - midY) > bh * 0.7) ctx.fillText(String(v), lineX + side * font * 0.9, y + font * 0.3);
    }
    ctx.stroke();
    ctx.restore();
  }
  // value box
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

// Layout for the full-screen HUD in the chase view (compact on a phone)
export function screenLayout(W, H, compact, color) {
  const font = Math.round(Math.max(11, Math.min(16, H / 58)));
  const cw = Math.min(W * (compact ? 0.62 : 0.5), H * (compact ? 0.9 : 0.8));
  const ch = H * (compact ? 0.5 : 0.62);
  const cy = H * (compact ? 0.42 : 0.44);
  return {
    W, H, font, lw: Math.max(1.5, font / 9), color, compact, outline: !compact, bankFromData: true,
    clip: { x: W / 2 - cw / 2, y: cy - ch / 2, w: cw, h: ch },
    tapeLX: W / 2 - cw / 2 - font * 3.2, tapeRX: W / 2 + cw / 2 + font * 3.2,
    tapeHalf: ch * 0.34, midY: cy,
    headY: cy - ch / 2 - font * 0.4, mnvY: cy - ch / 2 - font * 2.6,
    bankY: cy + ch / 2 - font * 4.2, bankR: font * 3.2
  };
}

// Layout on the combiner glass (canvas W x H)
export function combinerLayout(W, H, color) {
  const font = 15;
  return {
    W, H, font, lw: 2, color, compact: false, outline: false,
    clip: { x: W * 0.2, y: font * 2.2, w: W * 0.6, h: H - font * 4.4 },
    tapeLX: W * 0.1, tapeRX: W * 0.9, tapeHalf: H * 0.24, midY: H * 0.5,
    headY: font * 1.9, mnvY: font * 4.1, bankY: H - font * 6.4, bankR: font * 3
  };
}
