// Weapon symbols on the fighter HUD (fighter upgrade, phase 4, 09-Nov-2026). Drawn by drawFighterHud, so they sit on
// the outside world in the chase view and on the cockpit combiner alike.
//   conformal: target box on the radar lock (an arrow from the centre when it is outside the HUD), IR seeker circle,
//              gun lead ring (LCOS, only while locked inside 1.5 km with the gun selected), CCIP bomb pipper with the
//              bomb fall line from the flight path marker
//   fixed:     missile range scale (max / no-escape / min range, caret = target), SHOOT cue, lock data (range, closure,
//              target speed, heading, aspect), master arm and the weapon selected with what is left
// w: { arm, sel, counts: { GUN, IR, RDR, BOMB, FLARE, CHAFF }, lock (radar track or null), dlz, shoot, seeker: { state, dir },
//      lcos (world dir or null), ccip: { dir, valid, t } or null, msg }
import * as THREE from 'three';

const DEG = Math.PI / 180;
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const NAME = { GUN: 'GUN', IR: 'IR MSL', RDR: 'RDR MSL', BOMB: 'MK82' };
const flash = (nowMs, hz = 2) => Math.floor(nowMs / 1000 * hz * 2) % 2 === 0;
const inClip = (p, c, m = 0) => p && p[0] > c.x + m && p[0] < c.x + c.w - m && p[1] > c.y + m && p[1] < c.y + c.h - m;

export function drawWeaponsConformal(ctx, L, w, P, d) {
  if (!w) return;
  const { font, clip } = L;
  const cx = L.W / 2, cy = L.midY;
  ctx.save();
  ctx.lineWidth = L.lw;
  ctx.strokeStyle = ctx.fillStyle = L.color;

  // Radar lock: target box with the range, or an arrow from the HUD centre when it is outside the HUD
  if (w.lock) {
    const p = P(w.lock.dir);
    const s = font * 1.2;
    if (inClip(p, clip, s)) {
      ctx.strokeRect(p[0] - s, p[1] - s, 2 * s, 2 * s);
      if (!w.lock.inView) { ctx.beginPath(); ctx.moveTo(p[0] - s, p[1] - s); ctx.lineTo(p[0] + s, p[1] + s); ctx.stroke(); }
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
      ctx.fillText(rangeText(w.lock.range), p[0], p[1] + s + font);
    } else {
      // direction of the target in the HUD's own frame (right / up)
      _q.copy(d.q).invert();
      _v.copy(w.lock.dir).applyQuaternion(_q);
      const ang = Math.atan2(-_v.y, _v.x);
      const off = Math.acos(Math.max(-1, Math.min(1, -_v.z))) / DEG;
      const R = Math.min(clip.w, clip.h) * 0.3;
      const ax = cx + Math.cos(ang) * R, ay = cy + Math.sin(ang) * R;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * R * 0.45, cy + Math.sin(ang) * R * 0.45);
      ctx.lineTo(ax, ay);
      ctx.moveTo(ax, ay); ctx.lineTo(ax - Math.cos(ang - 0.45) * font, ay - Math.sin(ang - 0.45) * font);
      ctx.moveTo(ax, ay); ctx.lineTo(ax - Math.cos(ang + 0.45) * font, ay - Math.sin(ang + 0.45) * font);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
      ctx.fillText(`${Math.round(off)}°`, cx + Math.cos(ang) * (R + font * 1.4), cy + Math.sin(ang) * (R + font * 1.4) + font * 0.3);
    }
  }

  // IR seeker: dashed circle on the nose while it searches, solid on the target it sees
  if (w.seeker && w.seeker.state !== 'off') {
    const p = P(w.seeker.dir);
    if (p) {
      ctx.save();
      if (w.seeker.state === 'search') ctx.setLineDash([font * 0.4, font * 0.4]);
      ctx.beginPath(); ctx.arc(p[0], p[1], font * 1.7, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  // Gun lead ring (LCOS): put the ring on the target and fire. The arc inside shows the range (full = 1.5 km)
  if (w.lcos) {
    const p = P(w.lcos);
    if (p) {
      const r = font * 2.4;
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], L.lw * 1.4, 0, Math.PI * 2); ctx.fill();
      if (w.lock) {
        const frac = Math.max(0, Math.min(1, w.lock.range / 1500));
        ctx.save(); ctx.lineWidth = L.lw * 2.2;
        ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.78, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }
  }

  // CCIP: the bomb pipper where a bomb released now would hit, and the fall line up to the flight path marker
  if (w.ccip && w.ccip.valid) {
    let p = P(w.ccip.dir);
    const f = d.vel.lengthSq() > 25 ? P(_v.copy(d.vel).normalize()) : null;
    const delayed = !inClip(p, clip, font);
    if (delayed && f) {
      // below the HUD: the pipper is held at the bottom edge on the line (release later, it moves up)
      const by = clip.y + clip.h - font * 1.5;
      const tx = p ? p[0] : f[0];
      p = [f[0] + (tx - f[0]) * (p && p[1] !== f[1] ? Math.max(0, Math.min(1, (by - f[1]) / (p[1] - f[1]))) : 0), by];
    }
    if (p) {
      if (f) { ctx.beginPath(); ctx.moveTo(f[0], f[1] + font * 0.9); ctx.lineTo(p[0], p[1] - font * 1.0); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(p[0], p[1], font * 0.9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], L.lw * 1.3, 0, Math.PI * 2); ctx.fill();
      if (delayed) {
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.round(font * 0.8)}px monospace`;
        ctx.fillText('DLY', p[0], p[1] + font * 2.0);
      }
    }
  }
  ctx.restore();
}

export function drawWeaponsFixed(ctx, L, w, d) {
  if (!w) return;
  const { font, clip } = L;
  const big = font * 1.25;
  ctx.save();
  ctx.lineWidth = L.lw;
  ctx.strokeStyle = ctx.fillStyle = L.color;
  ctx.font = `bold ${font}px monospace`;

  // Missile range scale, at the right edge of the HUD: max range tick, no-escape bracket, min range tick, target caret
  if (w.dlz) {
    const z = w.dlz;
    const x = clip.x + clip.w - font * 1.6;
    const top = L.midY - L.tapeHalf * 0.9, bot = L.midY + L.tapeHalf * 0.9;
    const full = Math.max(z.rmax * 1.25, z.range * 1.05, 4000);
    const Y = (r) => bot - (bot - top) * Math.min(1, r / full);
    ctx.beginPath();
    ctx.moveTo(x, Y(z.rmax)); ctx.lineTo(x, Y(z.rmin));                      // the launch zone
    ctx.moveTo(x - font * 0.6, Y(z.rmax)); ctx.lineTo(x + font * 0.6, Y(z.rmax));
    ctx.moveTo(x - font * 0.6, Y(z.rmin)); ctx.lineTo(x + font * 0.6, Y(z.rmin));
    ctx.stroke();
    ctx.save(); ctx.lineWidth = L.lw * 3;
    ctx.beginPath(); ctx.moveTo(x, Y(z.rne)); ctx.lineTo(x, Y(z.rmin)); ctx.stroke();   // no-escape: thick
    ctx.restore();
    const yc = Y(z.range);
    ctx.beginPath(); ctx.moveTo(x - font * 0.5, yc); ctx.lineTo(x - font * 1.3, yc - font * 0.45); ctx.lineTo(x - font * 1.3, yc + font * 0.45); ctx.closePath(); ctx.stroke();
    ctx.textAlign = 'right';
    ctx.font = `bold ${Math.round(font * 0.8)}px monospace`;
    ctx.fillText(`${Math.round(z.closureKt)}`, x - font * 1.5, yc + font * 0.3);
    ctx.textAlign = 'center';
    ctx.fillText((z.rmax / 1000).toFixed(0), x, Y(z.rmax) - font * 0.5);
  }

  // SHOOT: in range with a lock (and the seeker on the target for the heat seeker)
  if (w.shoot && flash(d.nowMs, 3)) {
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(font * 1.4)}px monospace`;
    ctx.fillText('SHOOT', L.W / 2, clip.y + clip.h * 0.3);
  }
  // In-range cue for the bomb: time to impact
  ctx.textAlign = 'center';
  ctx.font = `bold ${font}px monospace`;
  if (w.sel === 'BOMB' && w.ccip && w.ccip.valid && w.arm) ctx.fillText(`TTI ${w.ccip.t.toFixed(1)}`, L.W / 2, clip.y + clip.h * 0.3 + font * 1.6);
  if (w.msg) ctx.fillText(w.msg, L.W / 2, clip.y + clip.h * 0.3 + font * 3.2);

  // Lock data under the climb rate (right): target, range + closure, its speed, heading, aspect
  if (w.lock && !L.compact) {
    const rx = L.tapeRX, y0 = L.midY + L.tapeHalf + big * 1.9;
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(font * 0.85)}px monospace`;
    ctx.fillText(w.lock.id, rx, y0);
    ctx.fillText(`${rangeText(w.lock.range)} ${Math.round(w.lock.closureKt)}Vc`, rx, y0 + font);
    if (w.lock.tgtHdg !== null) {
      ctx.fillText(`${Math.round(w.lock.tgtKt)}KT ${String(Math.round(w.lock.tgtHdg)).padStart(3, '0')}`, rx, y0 + font * 2);
      ctx.fillText(`ASP ${Math.round(w.lock.aspectDeg)}${w.lock.aspectSide}`, rx, y0 + font * 3);
    }
  }

  // RWR (phase 5): a ring round the HUD centre, each emitter at its bearing (nose = top): S = SAM, F = fighter,
  // M = missile coming. Track = HUD colour, lock = amber with a diamond, missile = red, flashing, and MISSILE in big letters
  if (w.rwr && w.rwr.length) {
    const R = Math.min(clip.w, clip.h) * 0.47, cx = L.W / 2, cy = L.midY, s = font * 0.75;
    let launch = false;
    ctx.save();
    ctx.font = `bold ${Math.round(font * 0.95)}px monospace`;
    ctx.textAlign = 'center';
    for (const e of w.rwr) {
      const a = e.az * DEG, x = cx + Math.sin(a) * R, y = cy - Math.cos(a) * R;
      if (e.level === 'launch') { launch = true; if (!flash(d.nowMs, 4)) continue; }
      ctx.strokeStyle = ctx.fillStyle = e.level === 'launch' ? '#ff3b30' : e.level === 'lock' ? '#fbbf24' : L.color;
      ctx.fillText(e.kind, x, y + font * 0.35);
      if (e.level !== 'track') {
        ctx.beginPath(); ctx.moveTo(x, y - s * 1.5); ctx.lineTo(x + s * 1.5, y); ctx.lineTo(x, y + s * 1.5); ctx.lineTo(x - s * 1.5, y); ctx.closePath(); ctx.stroke();
      }
    }
    if (launch && flash(d.nowMs, 3)) {
      ctx.fillStyle = '#ff3b30';
      ctx.font = `bold ${Math.round(font * 1.5)}px monospace`;
      ctx.fillText('MISSILE', cx, clip.y + clip.h * 0.18);
    }
    ctx.restore();
  }

  // Master arm + weapon selected + what is left (left, under the angle of attack)
  const lx = L.tapeLX, y1 = L.midY + L.tapeHalf + big * (L.compact ? 1.9 : 3.0);
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.round(font * 0.9)}px monospace`;
  const c = w.counts;
  ctx.fillText(`${w.arm ? 'ARM' : 'SAFE'} ${NAME[w.sel]} ${w.sel === 'GUN' ? c.GUN : c[w.sel]}`, lx, y1);
  if (!L.compact) {
    ctx.fillText(`G${c.GUN} 9:${c.IR} 120:${c.RDR} B${c.BOMB}`, lx, y1 + font);
    ctx.fillText(`FLR ${c.FLARE} CHF ${c.CHAFF}`, lx, y1 + font * 2);
  }
  // damage (phase 5)
  if (w.health !== undefined && w.health < 100) {
    ctx.fillStyle = w.health < 40 ? '#ff3b30' : '#fbbf24';
    const tags = (w.health < 60 ? ' ENG' : '') + (w.health < 40 ? ' CTRL' : '');
    ctx.fillText(`DMG ${Math.round(100 - w.health)}%${tags}`, lx, y1 + font * (L.compact ? 1 : 3));
  }
  ctx.restore();
}

function rangeText(m) {
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)}KM`;
}
