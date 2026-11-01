import * as THREE from 'three';

export class CockpitInstruments {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'flight-instruments-panel';
    this.container.innerHTML = `
      <div class="sixpack-grid">
        <div class="gauge-box">
          <canvas id="gauge-asi" width="130" height="130"></canvas>
          <div class="gauge-label">AIRSPEED</div>
        </div>
        <div class="gauge-box">
          <canvas id="gauge-att" width="130" height="130"></canvas>
          <div class="gauge-label">ATTITUDE</div>
        </div>
        <div class="gauge-box">
          <canvas id="gauge-alt" width="130" height="130"></canvas>
          <div class="gauge-label">ALTIMETER</div>
        </div>
        <div class="gauge-box">
          <canvas id="gauge-tc" width="130" height="130"></canvas>
          <div class="gauge-label">TURN COORD</div>
        </div>
        <div class="gauge-box">
          <canvas id="gauge-hdg" width="130" height="130"></canvas>
          <div class="gauge-label">HEADING</div>
        </div>
        <div class="gauge-box">
          <canvas id="gauge-vsi" width="130" height="130"></canvas>
          <div class="gauge-label">VERT SPEED</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);

    this.ctxAsi = document.getElementById('gauge-asi').getContext('2d');
    this.ctxAtt = document.getElementById('gauge-att').getContext('2d');
    this.ctxAlt = document.getElementById('gauge-alt').getContext('2d');
    this.ctxTc = document.getElementById('gauge-tc').getContext('2d');
    this.ctxHdg = document.getElementById('gauge-hdg').getContext('2d');
    this.ctxVsi = document.getElementById('gauge-vsi').getContext('2d');
  }

  update(physics) {
    this.drawASI(physics.iasKnots || 0);
    this.drawAttitude(physics);
    this.drawAltimeter(physics.altitudeFt || 0);
    this.drawTurnCoordinator(physics);
    this.drawHeading(physics);
    this.drawVSI(physics.vsiFpm || 0);
  }

  drawGaugeBezel(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawASI(ias) {
    const ctx = this.ctxAsi;
    this.drawGaugeBezel(ctx, 130, 130);
    const cx = 65, cy = 65;

    ctx.strokeStyle = '#cbd5e1';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';

    for (let spd = 20; spd <= 160; spd += 20) {
      const angle = (spd / 160) * 1.66 * Math.PI - 0.83 * Math.PI;
      const x1 = cx + Math.cos(angle) * 48;
      const y1 = cy + Math.sin(angle) * 48;
      const x2 = cx + Math.cos(angle) * 56;
      const y2 = cy + Math.sin(angle) * 56;

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const tx = cx + Math.cos(angle) * 38;
      const ty = cy + Math.sin(angle) * 38 + 3;
      ctx.fillText(spd.toString(), tx, ty);
    }

    const clampedSpeed = Math.min(160, Math.max(0, ias));
    const needleAngle = (clampedSpeed / 160) * 1.66 * Math.PI - 0.83 * Math.PI;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(46, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAttitude(physics) {
    const ctx = this.ctxAtt;
    this.drawGaugeBezel(ctx, 130, 130);
    const cx = 65, cy = 65, r = 56;

    const euler = new THREE.Euler().setFromQuaternion(physics.quaternion, 'YXZ');
    const roll = -euler.z;
    const pitch = euler.x;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(cx, cy);
    ctx.rotate(roll);

    const pitchShift = pitch * 100;

    // Sky
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-120, -220 + pitchShift, 240, 220);

    // Ground
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(-120, pitchShift, 240, 220);

    // Horizon line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-60, pitchShift);
    ctx.lineTo(60, pitchShift);
    ctx.stroke();

    ctx.restore();

    // Center reference wings
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(32, cy);
    ctx.lineTo(52, cy);
    ctx.lineTo(52, cy + 6);
    ctx.moveTo(78, cy + 6);
    ctx.lineTo(78, cy);
    ctx.lineTo(98, cy);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAltimeter(altFt) {
    const ctx = this.ctxAlt;
    this.drawGaugeBezel(ctx, 130, 130);
    const cx = 65, cy = 65;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#cbd5e1';

    for (let num = 0; num < 10; num++) {
      const angle = (num / 10) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * 48;
      const y1 = cy + Math.sin(angle) * 48;
      const x2 = cx + Math.cos(angle) * 56;
      const y2 = cy + Math.sin(angle) * 56;

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const tx = cx + Math.cos(angle) * 38;
      const ty = cy + Math.sin(angle) * 38 + 3;
      ctx.fillText(num.toString(), tx, ty);
    }

    // 100-ft needle
    const longAngle = ((altFt % 1000) / 1000) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(longAngle);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -45);
    ctx.stroke();
    ctx.restore();

    // 1000-ft needle
    const shortAngle = ((altFt % 10000) / 10000) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(shortAngle);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -30);
    ctx.stroke();
    ctx.restore();
  }

  drawTurnCoordinator(physics) {
    const ctx = this.ctxTc;
    this.drawGaugeBezel(ctx, 130, 130);
    const cx = 65, cy = 65;

    const euler = new THREE.Euler().setFromQuaternion(physics.quaternion, 'YXZ');
    const roll = -euler.z;

    ctx.save();
    ctx.translate(cx, cy - 8);
    ctx.rotate(roll);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-35, -2, 70, 4);
    ctx.fillRect(-3, -16, 6, 20);
    ctx.restore();

    // Inclinometer tube
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(35, 96, 60, 14);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(35, 96, 60, 14);

    const slip = Math.min(22, Math.max(-22, (physics.angularVelocity ? physics.angularVelocity.y : 0) * 35));
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx + slip, 103, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeading(physics) {
    const ctx = this.ctxHdg;
    this.drawGaugeBezel(ctx, 130, 130);
    const cx = 65, cy = 65;

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(physics.quaternion);
    const headingRad = Math.atan2(forward.x, forward.z);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-headingRad);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#64748b';

    const cardinals = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };

    for (let deg = 0; deg < 360; deg += 30) {
      const angle = (deg * Math.PI) / 180 - Math.PI / 2;
      const x1 = Math.cos(angle) * 48;
      const y1 = Math.sin(angle) * 48;
      const x2 = Math.cos(angle) * 56;
      const y2 = Math.sin(angle) * 56;

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const label = cardinals[deg] || (deg / 10).toString();
      const tx = Math.cos(angle) * 36;
      const ty = Math.sin(angle) * 36 + 3;
      ctx.fillText(label, tx, ty);
    }
    ctx.restore();

    // Lubber line
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx - 5, 18);
    ctx.lineTo(cx + 5, 18);
    ctx.fill();
  }

  drawVSI(vsiFpm) {
    const ctx = this.ctxVsi;
    this.drawGaugeBezel(ctx, 130, 130);
    const cx = 65, cy = 65;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#cbd5e1';

    const ticks = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
    ticks.forEach((tick) => {
      const angle = (tick / 20) * (0.75 * Math.PI);
      const x1 = cx - Math.cos(angle) * 48;
      const y1 = cy - Math.sin(angle) * 48;
      const x2 = cx - Math.cos(angle) * 56;
      const y2 = cy - Math.sin(angle) * 56;

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (tick % 10 === 0) {
        const tx = cx - Math.cos(angle) * 36;
        const ty = cy - Math.sin(angle) * 36 + 3;
        ctx.fillText(Math.abs(tick / 10).toString(), tx, ty);
      }
    });

    const clamped = Math.min(2000, Math.max(-2000, vsiFpm));
    const needleAngle = (clamped / 2000) * (0.75 * Math.PI);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-46, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ==========================================
// LIVE 3D MFD SCREENS (CanvasTextures mapped onto cockpit MFD meshes)
// Pages: 'pfd' (attitude ball, IAS, ALT, VSI), 'eng' (engine / rotor RPM, fuel), 'nav' (heading, G, Mach)
// ==========================================
const MFD_SIZE = 256;
const MFD_HZ = 15;

export class CockpitMfdSet {
  constructor(pages) {
    this.screens = {};
    pages.forEach((page) => {
      const canvas = document.createElement('canvas');
      canvas.width = MFD_SIZE;
      canvas.height = MFD_SIZE;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      this.screens[page] = { canvas, ctx: canvas.getContext('2d'), texture };
    });
    this.lastDrawMs = -Infinity;
  }

  texture(page) {
    return this.screens[page].texture;
  }

  update(d, nowMs) {
    if (nowMs - this.lastDrawMs < 1000 / MFD_HZ) return;
    this.lastDrawMs = nowMs;
    for (const page in this.screens) {
      const s = this.screens[page];
      if (page === 'pfd') this.drawPfd(s.ctx, d);
      else if (page === 'eng') this.drawEng(s.ctx, d);
      else this.drawNav(s.ctx, d);
      s.texture.needsUpdate = true;
    }
  }

  dispose() {
    for (const page in this.screens) this.screens[page].texture.dispose();
  }

  drawFrame(ctx, title, color) {
    ctx.fillStyle = '#05080a';
    ctx.fillRect(0, 0, MFD_SIZE, MFD_SIZE);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, MFD_SIZE - 6, MFD_SIZE - 6);
    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, 10, 20);
  }

  drawPfd(ctx, d) {
    this.drawFrame(ctx, 'PFD', '#22d3ee');
    const cx = 128, cy = 130, r = 72;
    const pxPerDeg = 3;

    // Attitude ball: sky / ground rotated by roll, shifted by pitch
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(d.roll);
    const shift = d.pitch * (180 / Math.PI) * pxPerDeg;
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-160, -400 + shift, 320, 400);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-160, shift, 320, 400);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r, shift);
    ctx.lineTo(r, shift);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    for (let p = -30; p <= 30; p += 10) {
      if (p === 0) continue;
      const y = shift - p * pxPerDeg;
      ctx.beginPath();
      ctx.moveTo(-18, y);
      ctx.lineTo(18, y);
      ctx.stroke();
      ctx.fillText(String(Math.abs(p)), 21, y + 3);
    }
    ctx.restore();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Fixed aircraft reference symbol
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy); ctx.lineTo(cx - 14, cy); ctx.lineTo(cx - 14, cy + 6);
    ctx.moveTo(cx + 40, cy); ctx.lineTo(cx + 14, cy); ctx.lineTo(cx + 14, cy + 6);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);

    // Airspeed (left) and altitude (right) boxes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, cy - 14, 50, 28);
    ctx.fillRect(MFD_SIZE - 64, cy - 14, 58, 28);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, cy - 14, 50, 28);
    ctx.strokeRect(MFD_SIZE - 64, cy - 14, 58, 28);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.round(d.iasKt)), 31, cy + 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(String(Math.max(0, Math.round(d.altFt))), MFD_SIZE - 35, cy + 5);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KT', 31, cy - 18);
    ctx.fillText('FT', MFD_SIZE - 35, cy - 18);

    // VSI + Mach along the bottom
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';
    ctx.fillStyle = '#e2e8f0';
    const vsi = Math.round(d.vsiFpm / 10) * 10;
    ctx.fillText(`VS ${vsi > 0 ? '+' : ''}${vsi}`, 10, MFD_SIZE - 14);
    ctx.textAlign = 'right';
    ctx.fillText(`M ${d.mach.toFixed(2)}`, MFD_SIZE - 10, MFD_SIZE - 14);
  }

  drawArcGauge(ctx, x, y, r, frac, label, valueText, warn) {
    const start = Math.PI * 0.75;
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(x, y, r, start, start + Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = warn ? '#f59e0b' : '#22c55e';
    ctx.beginPath();
    ctx.arc(x, y, r, start, start + Math.PI * 1.5 * Math.min(1, Math.max(0, frac)));
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(valueText, x, y + 6);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px monospace';
    ctx.fillText(label, x, y + r + 12);
  }

  drawEng(ctx, d) {
    this.drawFrame(ctx, d.isRotorcraft ? 'ENG / ROTOR' : 'ENGINE', '#4ade80');
    if (d.isRotorcraft) {
      this.drawArcGauge(ctx, 68, 90, 42, d.rotorRpmPct / 110, 'NR %', `${Math.round(d.rotorRpmPct)}`, d.rotorRpmPct < 95);
      this.drawArcGauge(ctx, 188, 90, 42, d.power / 100, 'TQ %', `${Math.round(d.power)}`, d.power > 95);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`ROTOR ${Math.round(d.rotorRpm)} RPM`, 128, 166);
    } else {
      this.drawArcGauge(ctx, 68, 90, 42, d.rpmPct / 110, d.engineLabel, `${Math.round(d.rpmPct)}`, d.rpmPct > 100);
      this.drawArcGauge(ctx, 188, 90, 42, d.throttle, 'THR %', `${Math.round(d.throttle * 100)}`, d.isAfterburner);
      if (d.isAfterburner) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AFTERBURNER', 128, 166);
      }
    }

    // Fuel quantity bar
    const low = d.fuelPct < 15;
    ctx.textAlign = 'left';
    ctx.fillStyle = low ? '#ef4444' : '#e2e8f0';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`FUEL ${Math.round(d.fuelKg)} KG`, 12, 196);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(d.fuelPct)}%`, MFD_SIZE - 12, 196);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(12, 206, MFD_SIZE - 24, 16);
    ctx.fillStyle = low ? '#ef4444' : '#22c55e';
    ctx.fillRect(12, 206, (MFD_SIZE - 24) * (d.fuelPct / 100), 16);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`FLOW ${Math.round(d.fuelFlowKgH)} KG/H`, 12, 240);
  }

  drawNav(ctx, d) {
    this.drawFrame(ctx, 'NAV / SA', '#fbbf24');
    const cx = 128, cy = 136, r = 82;

    // Heading rose rotating under a fixed lubber line
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-d.headingDeg * Math.PI / 180);
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    for (let deg = 0; deg < 360; deg += 10) {
      const a = deg * Math.PI / 180;
      const inner = deg % 30 === 0 ? r - 12 : r - 6;
      ctx.lineWidth = deg % 30 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.sin(a) * inner, -Math.cos(a) * inner);
      ctx.lineTo(Math.sin(a) * r, -Math.cos(a) * r);
      ctx.stroke();
      if (deg % 30 === 0) {
        const label = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[deg] || String(deg / 10);
        ctx.fillText(label, Math.sin(a) * (r - 24), -Math.cos(a) * (r - 24) + 4);
      }
    }
    ctx.restore();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - 2);
    ctx.lineTo(cx - 6, cy - r - 12);
    ctx.lineTo(cx + 6, cy - r - 12);
    ctx.closePath();
    ctx.fill();

    // Ownship
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
    ctx.moveTo(cx - 10, cy - 2); ctx.lineTo(cx + 10, cy - 2);
    ctx.moveTo(cx - 5, cy + 10); ctx.lineTo(cx + 5, cy + 10);
    ctx.stroke();

    // Bearing needle to the next return-to-land waypoint
    if (d.nav && !d.nav.complete) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(d.nav.turn * Math.PI / 180);
      ctx.strokeStyle = '#e879f9';
      ctx.fillStyle = '#e879f9';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, r - 30); ctx.lineTo(0, -(r - 30)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -(r - 22)); ctx.lineTo(-7, -(r - 36)); ctx.lineTo(7, -(r - 36)); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#e879f9';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.nav.name} ${d.nav.distNm.toFixed(1)} NM`, cx, MFD_SIZE - 12);
    }

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`HDG ${String(Math.round(d.headingDeg) % 360).padStart(3, '0')}`, MFD_SIZE - 10, 20);
    ctx.textAlign = 'left';
    ctx.fillStyle = d.gLoad > 7 ? '#ef4444' : '#e2e8f0';
    ctx.font = '12px monospace';
    ctx.fillText(`G ${d.gLoad.toFixed(1)}`, 10, MFD_SIZE - 12);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`M ${d.mach.toFixed(2)}`, MFD_SIZE - 10, MFD_SIZE - 12);
  }
}
