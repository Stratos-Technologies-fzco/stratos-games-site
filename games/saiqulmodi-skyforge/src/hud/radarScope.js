// Radar picture and stores page (fighter upgrade, phase 4, 09-Nov-2026). The same drawing is used for the small display
// in the corner of the 3D view and for the cockpit's multi-function displays.
//   drawRadarPage: B-scope, 60 deg either side of the nose across, 0-40 km up; contacts as boxes (ground targets as
//                  triangles), the locked one filled with a line along its heading; the antenna sweeps in search and
//                  stays on the target when locked
//   drawStoresPage: the aircraft from above with what is still on each station, gun rounds, flares, chaff, master arm
const DEG = Math.PI / 180;

// pic: { contacts: [{ az, range, ground, t: { id } }], track (radar track or null), rangeM, gimbalDeg, headingDeg, nowMs }
export function drawRadarPage(ctx, x0, y0, w, h, pic) {
  const pad = Math.round(w * 0.06), fs = Math.max(9, Math.round(w / 17));
  ctx.save();
  ctx.fillStyle = 'rgba(4,10,8,0.86)';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#2dd36f'; ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
  const L = x0 + pad, R = x0 + w - pad, T = y0 + fs * 1.6, B = y0 + h - fs * 1.4;
  const X = (az) => L + (R - L) * (az / pic.gimbalDeg + 1) / 2;
  const Y = (r) => B - (B - T) * Math.min(1, r / pic.rangeM);
  // grid: range quarters, azimuth every 30 deg
  ctx.strokeStyle = 'rgba(45,211,111,0.35)';
  ctx.beginPath();
  for (let k = 1; k <= 4; k++) { const y = Y(pic.rangeM * k / 4); ctx.moveTo(L, y); ctx.lineTo(R, y); }
  for (const az of [-60, -30, 0, 30, 60]) { if (Math.abs(az) > pic.gimbalDeg) continue; ctx.moveTo(X(az), T); ctx.lineTo(X(az), B); }
  ctx.stroke();
  ctx.fillStyle = '#2dd36f';
  ctx.font = `bold ${fs}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(pic.track ? 'STT' : 'RWS', x0 + pad, y0 + fs * 1.15);
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(pic.rangeM / 1000)} KM`, x0 + w - pad, y0 + fs * 1.15);
  ctx.textAlign = 'center';
  ctx.fillText(String(Math.round(pic.headingDeg)).padStart(3, '0'), x0 + w / 2, y0 + fs * 1.15);
  ctx.font = `${Math.max(8, fs - 2)}px monospace`;
  ctx.textAlign = 'left';
  for (let k = 1; k < 4; k++) ctx.fillText(String(Math.round(pic.rangeM * k / 4000)), L + 2, Y(pic.rangeM * k / 4) - 2);
  // antenna
  const sweep = pic.track ? pic.track.az : Math.sin(pic.nowMs / 1000 * Math.PI) * pic.gimbalDeg;
  ctx.strokeStyle = 'rgba(45,211,111,0.8)';
  ctx.beginPath(); ctx.moveTo(X(sweep), B); ctx.lineTo(X(sweep), B + fs * 0.6); ctx.stroke();
  // contacts
  const s = Math.max(3, w / 45);
  for (const c of pic.contacts) {
    const x = X(c.az), y = Y(c.range);
    const locked = pic.track && pic.track.id === c.t.id;
    ctx.fillStyle = ctx.strokeStyle = locked ? '#facc15' : c.ground ? '#a3e635' : '#e2e8f0';
    ctx.lineWidth = locked ? 2 : 1.4;
    ctx.beginPath();
    if (c.ground) { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s); ctx.lineTo(x - s, y + s); ctx.closePath(); }
    else ctx.rect(x - s, y - s, 2 * s, 2 * s);
    if (locked) ctx.fill(); else ctx.stroke();
    if (locked && pic.track.tgtHdg !== null) {
      const a = (pic.track.tgtHdg - pic.headingDeg) * DEG;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * s * 3, y - Math.cos(a) * s * 3); ctx.stroke();
    }
  }
  if (pic.track) {
    ctx.fillStyle = '#facc15';
    ctx.font = `bold ${Math.max(8, fs - 1)}px monospace`;
    ctx.textAlign = 'left';
    const tr = pic.track;
    ctx.fillText(`${tr.id} ${(tr.range / 1000).toFixed(1)}KM ${Math.round(tr.closureKt)}Vc`, x0 + pad, y0 + h - fs * 0.35);
  } else if (!pic.contacts.length) {
    ctx.fillStyle = 'rgba(45,211,111,0.7)';
    ctx.font = `${Math.max(8, fs - 1)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('NO CONTACTS', x0 + w / 2, y0 + h - fs * 0.35);
  }
  ctx.restore();
}

// st: { IR: [..], RDR: [..], BOMB: [..], rounds, flares, chaff, sel, arm }
export function drawStoresPage(ctx, x0, y0, w, h, st) {
  const fs = Math.max(9, Math.round(w / 17));
  ctx.save();
  ctx.fillStyle = 'rgba(4,10,8,0.86)';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#2dd36f'; ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
  // aircraft from above (nose up), scaled to the page
  const cx = x0 + w / 2, cy = y0 + h * 0.5, k = Math.min(w / 12, h / 13);
  ctx.strokeStyle = 'rgba(148,163,184,0.8)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 6 * k); ctx.lineTo(cx + 0.9 * k, cy - 2.5 * k); ctx.lineTo(cx + 4.9 * k, cy + 2.5 * k); ctx.lineTo(cx + 3.8 * k, cy + 4 * k);
  ctx.lineTo(cx + 1.2 * k, cy + 3.6 * k); ctx.lineTo(cx + 1.2 * k, cy + 4.8 * k); ctx.lineTo(cx - 1.2 * k, cy + 4.8 * k); ctx.lineTo(cx - 1.2 * k, cy + 3.6 * k);
  ctx.lineTo(cx - 3.8 * k, cy + 4 * k); ctx.lineTo(cx - 4.9 * k, cy + 2.5 * k); ctx.lineTo(cx - 0.9 * k, cy - 2.5 * k); ctx.closePath();
  ctx.stroke();
  // stations: x in body metres; present = filled, fired = empty outline
  const draw = (kind, xs, len, col) => xs.forEach((bx, i) => {
    const x = cx + bx * k, y = cy + 1.2 * k;
    ctx.strokeStyle = ctx.fillStyle = st.sel === kind && st[kind][i] ? '#facc15' : col;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(x - k * 0.18, y - len * k / 2, k * 0.36, len * k);
    if (st[kind][i]) ctx.fill(); else ctx.stroke();
  });
  draw('IR', [-4.6, 4.6], 3, '#e2e8f0');
  draw('RDR', [-3.4, 3.4], 3.6, '#cbd5e1');
  draw('BOMB', [-1.95, 1.95, -2.6, 2.6], 2.2, '#a3e635');
  ctx.fillStyle = st.arm ? '#f87171' : '#2dd36f';
  ctx.font = `bold ${fs}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(st.arm ? 'ARM' : 'SAFE', x0 + 5, y0 + fs * 1.15);
  ctx.fillStyle = st.sel === 'GUN' ? '#facc15' : '#2dd36f';
  ctx.textAlign = 'right';
  ctx.fillText(`GUN ${st.rounds}`, x0 + w - 5, y0 + fs * 1.15);
  ctx.fillStyle = '#2dd36f';
  ctx.font = `${Math.max(8, fs - 1)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`FLR ${st.flares}  CHF ${st.chaff}`, cx, y0 + h - fs * 0.4);
  ctx.restore();
}
