import * as THREE from 'three';
import { CockpitMfdSet } from './cockpit_instruments.js';

export class FighterCockpitInterior {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.cockpitGroup = new THREE.Group();
    this.cockpitGroup.name = "fighter_cockpit_interior";

    // Dynamic flight control pivots
    this.flightStick = null;
    this.throttleLever = null;
    this.leftPedal = null;
    this.rightPedal = null;

    // Dynamic MFD canvas contexts for high-refresh 2D rendering
    this.canvasLeft = document.createElement('canvas');
    this.canvasLeft.width = 512; this.canvasLeft.height = 512;
    this.ctxLeft = this.canvasLeft.getContext('2d');
    this.texLeft = new THREE.CanvasTexture(this.canvasLeft);

    this.canvasCenter = document.createElement('canvas');
    this.canvasCenter.width = 512; this.canvasCenter.height = 512;
    this.ctxCenter = this.canvasCenter.getContext('2d');
    this.texCenter = new THREE.CanvasTexture(this.canvasCenter);

    this.canvasRight = document.createElement('canvas');
    this.canvasRight.width = 512; this.canvasRight.height = 512;
    this.ctxRight = this.canvasRight.getContext('2d');
    this.texRight = new THREE.CanvasTexture(this.canvasRight);

    this.fuelRemainingLbs = 14500;
    this.flareCount = 30;
    this.bombCount = 4;

    this.buildPhysicalCockpit();
  }

  buildPhysicalCockpit() {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1b1f23, roughness: 0.85, metalness: 0.2 });
    const dashMat = new THREE.MeshStandardMaterial({ color: 0x121417, roughness: 0.95 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x44ddaa,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.5
    });

    // 1. Instrument Panel Glare Shield
    const dashGeo = new THREE.BoxGeometry(0.85, 0.45, 0.4);
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(0, 0.35, -0.65);
    dash.rotation.x = 0.25;
    this.cockpitGroup.add(dash);

    // 2. HUD Glass Combiner Bracket
    const hudFrameGeo = new THREE.BoxGeometry(0.32, 0.015, 0.015);
    const hudFrame = new THREE.Mesh(hudFrameGeo, frameMat);
    hudFrame.position.set(0, 0.62, -0.58);
    
    const hudGlassGeo = new THREE.PlaneGeometry(0.28, 0.22);
    const hudGlass = new THREE.Mesh(hudGlassGeo, glassMat);
    hudGlass.position.set(0, 0.52, -0.58);
    hudGlass.rotation.x = -0.2;
    this.cockpitGroup.add(hudFrame, hudGlass);

    // 3. Side Consoles (Left Throttle Shelf, Right Avionics Shelf)
    const leftShelf = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.8), frameMat);
    leftShelf.position.set(-0.38, 0.1, -0.2);
    const rightShelf = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.8), frameMat);
    rightShelf.position.set(0.38, 0.1, -0.2);
    this.cockpitGroup.add(leftShelf, rightShelf);

    // 4. Center HOTAS Flight Stick (Grip + Base Boot)
    const stickGroup = new THREE.Group();
    stickGroup.position.set(0, 0.1, -0.32);
    const stickShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.28, 8), frameMat);
    stickShaft.position.y = 0.14;
    const stickGrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.06), dashMat);
    stickGrip.position.set(0, 0.26, 0.01);
    
    // Red Weapon Release Pickoff Button
    const triggerBtn = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0xee2222 }));
    triggerBtn.position.set(0, 0.29, -0.02);

    stickGroup.add(stickShaft, stickGrip, triggerBtn);
    this.flightStick = stickGroup;
    this.cockpitGroup.add(stickGroup);

    // 5. Left-Side Throttle Lever Quadrant
    const throttleGroup = new THREE.Group();
    throttleGroup.position.set(-0.32, 0.24, -0.25);
    const leverShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), frameMat);
    leverShaft.position.y = 0.07;
    const throttleGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), dashMat);
    throttleGrip.position.set(0, 0.14, 0);
    throttleGroup.add(leverShaft, throttleGrip);
    this.throttleLever = throttleGroup;
    this.cockpitGroup.add(throttleGroup);

    // 6. Dual Rudder Pedals
    const pedalGeo = new THREE.BoxGeometry(0.08, 0.14, 0.02);
    const pedalMat = new THREE.MeshStandardMaterial({ color: 0x33383e, metalness: 0.6 });
    this.leftPedal = new THREE.Mesh(pedalGeo, pedalMat);
    this.leftPedal.position.set(-0.16, -0.05, -0.75);
    this.rightPedal = new THREE.Mesh(pedalGeo, pedalMat);
    this.rightPedal.position.set(0.16, -0.05, -0.75);
    this.cockpitGroup.add(this.leftPedal, this.rightPedal);

    // 7. Triple MFD Displays (Left: Flight/Eng, Center: Radar/RWR, Right: Stores/Radio)
    const mfdScreenGeo = new THREE.PlaneGeometry(0.22, 0.22);
    
    // Left MFD
    const mfdLeft = new THREE.Mesh(mfdScreenGeo, new THREE.MeshBasicMaterial({ map: this.texLeft }));
    mfdLeft.position.set(-0.26, 0.36, -0.52);
    mfdLeft.rotation.x = -0.15;

    // Center MFD (Tactical Radar)
    const mfdCenter = new THREE.Mesh(mfdScreenGeo, new THREE.MeshBasicMaterial({ map: this.texCenter }));
    mfdCenter.position.set(0, 0.32, -0.54);
    mfdCenter.rotation.x = -0.22;

    // Right MFD (Stores, Flare, AutoPilot)
    const mfdRight = new THREE.Mesh(mfdScreenGeo, new THREE.MeshBasicMaterial({ map: this.texRight }));
    mfdRight.position.set(0.26, 0.36, -0.52);
    mfdRight.rotation.x = -0.15;

    this.cockpitGroup.add(mfdLeft, mfdCenter, mfdRight);
  }

  update(state, controls) {
    // 1. Animate HOTAS Control Sticks Based on Inputs
    if (this.flightStick && controls) {
      this.flightStick.rotation.x = (controls.pitch || 0) * 0.32; // W/S push/pull
      this.flightStick.rotation.z = -(controls.roll || 0) * 0.35; // A/D bank
    }
    if (this.throttleLever && state) {
      const pwr = (state.throttle || 0); // 0.0 to 1.0
      this.throttleLever.rotation.x = 0.4 - (pwr * 0.8);
      // Burn fuel proportional to throttle and afterburner
      this.fuelRemainingLbs = Math.max(0, this.fuelRemainingLbs - (pwr > 0.7 ? 12 : 3) * (state.deltaSec || 0.016));
    }
    if (this.leftPedal && this.rightPedal && controls) {
      const yaw = controls.yaw || 0;
      this.leftPedal.position.z = -0.75 - yaw * 0.06;
      this.rightPedal.position.z = -0.75 + yaw * 0.06;
    }

    // 2. Render Left MFD: ASI, ALT, VSI, Accel G, Throttle, Fuel
    this.renderLeftMFD(state);

    // 3. Render Center MFD: 360 Tactical Radar, Threat Blips, Lock Reticle
    this.renderCenterMFD(state);

    // 4. Render Right MFD: Ordnance (Vulcan/Missiles/Bombs), Flares, AP State, Radio
    this.renderRightMFD(state);
  }

  renderLeftMFD(state) {
    const ctx = this.ctxLeft;
    ctx.fillStyle = '#08110b';
    ctx.fillRect(0, 0, 512, 512);

    // Borders & Header
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 500);

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('PRI FLIGHT / ENG', 20, 36);

    // Airspeed Tape (Left)
    const ias = Math.round(state.airspeedKt || 0);
    ctx.fillStyle = '#0f2918';
    ctx.fillRect(20, 60, 110, 260);
    ctx.fillStyle = '#00ff66';
    ctx.fillText('IAS [KT]', 30, 85);
    ctx.font = 'bold 44px monospace';
    ctx.fillText(`${ias}`, 30, 140);

    // Altimeter Tape (Right)
    const alt = Math.round(state.altitudeFt || 0);
    ctx.fillStyle = '#0f2918';
    ctx.fillRect(380, 60, 110, 260);
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('ALT [FT]', 390, 85);
    ctx.font = 'bold 38px monospace';
    ctx.fillText(`${alt}`, 385, 140);

    // Accelerometer (G-Meter) & VSI (Center)
    ctx.font = 'bold 26px monospace';
    const gVal = (state.gForce || 1.0).toFixed(1);
    ctx.fillStyle = gVal > 6.0 ? '#ff3333' : '#00ff66';
    ctx.fillText(`ACCEL: ${gVal} G`, 160, 100);

    const vsi = Math.round(state.verticalSpeedFpm || 0);
    ctx.fillStyle = '#00ff66';
    ctx.fillText(`VSI: ${vsi > 0 ? '+' : ''}${vsi} FPM`, 160, 140);

    // Mach Number Readout
    const mach = (state.mach || (ias / 661)).toFixed(2);
    ctx.fillText(`M: ${mach} MACH`, 160, 180);

    // Throttle & Fuel Section (Bottom)
    ctx.fillStyle = '#00ffff';
    const pwrPct = Math.round((state.throttle || 0) * 100);
    ctx.fillText(`THROTTLE: ${pwrPct}%`, 20, 380);

    // Throttle Progress Bar
    ctx.fillStyle = '#113333';
    ctx.fillRect(20, 395, 470, 24);
    ctx.fillStyle = pwrPct > 70 ? '#ff8800' : '#00ffff';
    ctx.fillRect(20, 395, (pwrPct / 100) * 470, 24);

    ctx.fillStyle = '#00ff66';
    ctx.fillText(`FUEL: ${Math.round(this.fuelRemainingLbs)} LBS`, 20, 460);
    ctx.fillText(`FLOW: ${pwrPct > 70 ? '14,200' : '3,600'} PPH`, 240, 460);

    this.texLeft.needsUpdate = true;
  }

  renderCenterMFD(state) {
    const ctx = this.ctxCenter;
    ctx.fillStyle = '#040d12';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 500);

    // Radar Header
    ctx.fillStyle = '#00ccff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('TACTICAL RADAR / RWR', 20, 36);
    ctx.fillText('RNG: 40 NM', 340, 36);

    // Radar Sweep Rings
    const cx = 256, cy = 270;
    ctx.lineWidth = 1.5;
    [60, 120, 180].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Azimuth Crosshair lines
    ctx.beginPath();
    ctx.moveTo(cx, cy - 200); ctx.lineTo(cx, cy + 200);
    ctx.moveTo(cx - 200, cy); ctx.lineTo(cx + 200, cy);
    ctx.stroke();

    // Ownship Symbol (Delta at center)
    ctx.fillStyle = '#00ff66';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx - 10, cy + 10);
    ctx.lineTo(cx + 10, cy + 10);
    ctx.closePath();
    ctx.fill();

    // Enemy Targets & Threats
    if (state.targets && state.targets.length > 0) {
      state.targets.forEach((tgt, idx) => {
        // Convert world delta to radar scope coordinates
        const dx = (tgt.position.x - (state.ownPos?.x || 0)) * 0.008;
        const dz = (tgt.position.z - (state.ownPos?.z || 0)) * 0.008;

        const tx = cx + dx;
        const ty = cy + dz;

        // Threat Blip (Red Diamond)
        ctx.strokeStyle = '#ff2222';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(tx - 7, ty - 7, 14, 14);

        ctx.fillStyle = '#ff4444';
        ctx.font = '16px monospace';
        ctx.fillText(tgt.id || `TGT-${idx + 1}`, tx + 12, ty + 5);
      });
    }

    // Active Radar Lock Reticle
    if (state.lockedTarget) {
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx + 15, cy - 60, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('LOCK ON', cx - 35, cy - 95);
    }

    // Radar Warning Receiver (RWR) Signal Alert
    ctx.fillStyle = '#ff1111';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('RWR: SEARCH ACTIVE', 20, 485);
    ctx.fillStyle = '#00ff66';
    ctx.fillText('IFF: MODE 4 OK', 320, 485);

    this.texCenter.needsUpdate = true;
  }

  renderRightMFD(state) {
    const ctx = this.ctxRight;
    ctx.fillStyle = '#0d0914';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#d455ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 500);

    // Header
    ctx.fillStyle = '#d455ff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('STORES / SYS / COMM', 20, 36);

    // Ordnance & Ammo Bay
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px monospace';
    ctx.fillText('GUN: 20MM VULCAN', 25, 90);
    ctx.fillStyle = '#00ff66';
    ctx.fillText('ROUNDS: 480 HEI', 260, 90);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('AAM: AIM-9X SIDEWINDER', 25, 140);
    ctx.fillStyle = '#00ff66';
    ctx.fillText('QTY: 4 / 4 RDY', 260, 140);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('AGM: GBU-38 JDAM BOMB', 25, 190);
    ctx.fillStyle = this.bombCount > 0 ? '#00ff66' : '#777777';
    ctx.fillText(`QTY: ${this.bombCount} / 4`, 260, 190);

    // Countermeasures (Flares / Chaff)
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`FLARES [Key X]: ${this.flareCount} RDY`, 25, 250);

    // Navigation & Radio Beacons
    ctx.fillStyle = '#00ccff';
    ctx.fillText('RADIO COMM: 121.50 MHz (EMG)', 25, 310);
    ctx.fillText('VOBL TWR:   118.10 MHz', 25, 345);
    ctx.fillText('ILS RWY09L: 110.30 MHz [GS OK]', 25, 380);

    // Autopilot Mode Switch Status
    const apEngaged = state.apActive || false;
    ctx.fillStyle = apEngaged ? '#00ff66' : '#ffaa00';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`MODE: ${apEngaged ? 'AUTONOMOUS AP' : 'MANUAL FLY-BY-WIRE'}`, 25, 455);

    this.texRight.needsUpdate = true;
  }
}

// ==========================================
// 3D COCKPIT PER AIRFRAME + COLLIMATED HUD
// buildCockpit(aircraftId) -> { id, group, cockpitOffset, update(), reset(), dispose() }
// Group origin = pilot eye, -Z forward, +Y up (same axes as the airframe).
// ==========================================
const DEG = Math.PI / 180;
const HUD_HZ = 30;
const HUD_GREEN = '#46ff8c';

const COCKPIT_SPECS = {
  fighter:  { offset: [0, 0.95, -0.7], fuelKg: 8200,  burnKgH: [900, 5200], abBurnKgH: 14000, idleRpm: 65, engineLabel: 'RPM %' },
  trainer:  { offset: [0, 0.7, 0.2],   fuelKg: 540,   burnKgH: [60, 230],   idleRpm: 70, engineLabel: 'PROP %' },
  airliner: { offset: [0, 1.4, -6.5],  fuelKg: 19000, burnKgH: [700, 4800], idleRpm: 22, engineLabel: 'N1 %' },
  heli:     { offset: [0, 0.7, -0.4],  fuelKg: 1100,  burnKgH: [180, 520],  idleRpm: 60, engineLabel: 'NG %' }
};

// Green symbology drawn to a CanvasTexture on the combiner glass. Every symbol is placed by projecting its
// body-frame direction through the fixed eye onto the glass, so it overlays the outside world (collimated).
class CombinerHud {
  constructor(glass) {
    this.glass = glass; // { x, y, width, height, dist } in eye space, metres
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = Math.round(512 * glass.height / glass.width);
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.pxPerRad = this.canvas.height / glass.height * glass.dist;
    this.lastDrawMs = -Infinity;
  }

  toPx(az, el) {
    const g = this.glass;
    return [
      (g.dist * Math.tan(az) - g.x + g.width / 2) / g.width * this.canvas.width,
      (g.y + g.height / 2 - g.dist * Math.tan(el)) / g.height * this.canvas.height
    ];
  }

  draw(d, nowMs) {
    if (nowMs - this.lastDrawMs < 1000 / HUD_HZ) return;
    this.lastDrawMs = nowMs;
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    const [bx, by] = this.toPx(0, 0);
    const k = this.pxPerRad;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = HUD_GREEN;
    ctx.fillStyle = HUD_GREEN;
    ctx.lineWidth = 2;
    ctx.font = 'bold 15px monospace';

    // Pitch ladder: 5-degree rungs, dashed below the horizon, rolled about the boresight
    ctx.save();
    ctx.beginPath();
    ctx.rect(W * 0.2, 0, W * 0.6, H);
    ctx.clip();
    ctx.translate(bx, by);
    ctx.rotate(d.roll);
    for (let p = -90; p <= 90; p += 5) {
      const y = (d.pitch - p * DEG) * k;
      if (Math.abs(y) > H) continue;
      if (p === 0) {
        ctx.beginPath();
        ctx.moveTo(-W * 0.5, y); ctx.lineTo(-W * 0.06, y);
        ctx.moveTo(W * 0.06, y); ctx.lineTo(W * 0.5, y);
        ctx.stroke();
        continue;
      }
      const inner = W * 0.05, outer = W * 0.14, tick = p > 0 ? 8 : -8;
      ctx.setLineDash(p < 0 ? [8, 6] : []);
      ctx.beginPath();
      ctx.moveTo(-outer, y + tick); ctx.lineTo(-outer, y); ctx.lineTo(-inner, y);
      ctx.moveTo(inner, y); ctx.lineTo(outer, y); ctx.lineTo(outer, y + tick);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.abs(p)), -outer - 4, y + 5);
      ctx.textAlign = 'left';
      ctx.fillText(String(Math.abs(p)), outer + 4, y + 5);
    }
    ctx.restore();

    // Boresight (waterline) marker
    ctx.beginPath();
    ctx.moveTo(bx - 26, by); ctx.lineTo(bx - 12, by); ctx.lineTo(bx - 6, by + 8); ctx.lineTo(bx, by);
    ctx.lineTo(bx + 6, by + 8); ctx.lineTo(bx + 12, by); ctx.lineTo(bx + 26, by);
    ctx.stroke();

    // Velocity vector (flight path marker)
    if (d.fpmValid) {
      let [vx, vy] = this.toPx(d.fpmAz, d.fpmEl);
      vx = Math.min(W * 0.78, Math.max(W * 0.22, vx));
      vy = Math.min(H - 20, Math.max(20, vy));
      ctx.beginPath();
      ctx.arc(vx, vy, 9, 0, Math.PI * 2);
      ctx.moveTo(vx - 9, vy); ctx.lineTo(vx - 24, vy);
      ctx.moveTo(vx + 9, vy); ctx.lineTo(vx + 24, vy);
      ctx.moveTo(vx, vy - 9); ctx.lineTo(vx, vy - 18);
      ctx.stroke();
    }

    // Airspeed tape (left) and altitude tape (right)
    this.drawTape(d.iasKt, 2.5, 10, 50, 'left', by);
    this.drawTape(d.altFt, 0.25, 100, 500, 'right', by);

    // G, Mach, heading, afterburner
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`G ${d.gLoad.toFixed(1)}`, 10, 22);
    ctx.fillText(`M ${d.mach.toFixed(2)}`, 10, H - 12);
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.round(d.headingDeg) % 360).padStart(3, '0'), W / 2, 22);
    if (d.isAfterburner) ctx.fillText('AB', W / 2, H - 12);

    // Return-to-land steering: magenta diamond on the horizon in the waypoint's direction
    if (d.nav && !d.nav.complete) {
      let [nx, ny] = this.toPx(Math.max(-1.2, Math.min(1.2, d.nav.turn * DEG)), -d.pitch);
      const clamped = nx < W * 0.24 || nx > W * 0.76;
      nx = Math.min(W * 0.76, Math.max(W * 0.24, nx));
      ny = Math.min(H - 40, Math.max(40, ny));
      ctx.strokeStyle = '#ff6bff';
      ctx.fillStyle = '#ff6bff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nx, ny - 9); ctx.lineTo(nx + 9, ny); ctx.lineTo(nx, ny + 9); ctx.lineTo(nx - 9, ny);
      ctx.closePath();
      clamped ? ctx.fill() : ctx.stroke();
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.nav.name} ${d.nav.distNm.toFixed(1)}NM ${d.nav.targetAltFt}FT`, W / 2, H - 32);
    }
  }

  drawTape(value, pxPerUnit, tickStep, labelStep, side, cy) {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    const half = H * 0.36;
    const left = side === 'left';
    const lineX = left ? 76 : W - 76;
    const dir = left ? -1 : 1; // ticks point away from the centre
    ctx.save();
    ctx.beginPath();
    ctx.rect(left ? 0 : W - 96, cy - half, 96, half * 2);
    ctx.clip();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineX, cy - half); ctx.lineTo(lineX, cy + half);
    const span = half / pxPerUnit;
    const first = Math.floor((value - span) / tickStep) * tickStep;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = left ? 'right' : 'left';
    for (let v = first; v <= value + span; v += tickStep) {
      if (v < 0) continue;
      const y = cy - (v - value) * pxPerUnit;
      const major = v % labelStep === 0;
      ctx.moveTo(lineX, y); ctx.lineTo(lineX + dir * (major ? 12 : 6), y);
      if (major) ctx.fillText(String(v), lineX + dir * 16, y + 5);
    }
    ctx.stroke();
    ctx.restore();

    // Current value box
    const bw = 72, bxx = left ? 4 : W - 4 - bw;
    ctx.clearRect(bxx, cy - 14, bw, 28);
    ctx.lineWidth = 2;
    ctx.strokeRect(bxx, cy - 14, bw, 28);
    ctx.font = 'bold 17px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.max(0, Math.round(value))), bxx + bw / 2, cy + 6);
  }
}

function cockpitMaterials() {
  return {
    frame: new THREE.MeshStandardMaterial({ color: 0x2b3036, roughness: 0.6, metalness: 0.4 }),
    matte: new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 1.0, metalness: 0.0 }),
    console: new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.9, metalness: 0.1 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x141619, roughness: 0.8, metalness: 0.2 }),
    seat: new THREE.MeshStandardMaterial({ color: 0x1c1f23, roughness: 0.95 }),
    glove: new THREE.MeshStandardMaterial({ color: 0x3b3428, roughness: 0.9 }),
    sleeve: new THREE.MeshStandardMaterial({ color: 0x4a5638, roughness: 0.95 }),
    knob: new THREE.MeshStandardMaterial({ color: 0x8b9199, roughness: 0.5, metalness: 0.6 }),
    warn: new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.6 }),
    trigger: new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }),
    canopyGlass: new THREE.MeshBasicMaterial({ color: 0x9cc7e6, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }),
    hudTint: new THREE.MeshBasicMaterial({ color: 0x0b3a22, transparent: true, opacity: 0.22, depthWrite: false })
  };
}

const UP = new THREE.Vector3(0, 1, 0);

function addBox(parent, mat, w, h, d, x, y, z, rx = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  parent.add(m);
  return m;
}

function addStrut(parent, mat, a, b, r) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 8), mat);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, vb.clone().sub(va).normalize());
  parent.add(m);
  return m;
}

// Curved canopy bow: half-ellipse over the pilot's head, tilt leans the top back towards the pilot
function addArch(parent, mat, rx, ry, tube, y, z, tilt = 0) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * i / 16;
    pts.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0));
  }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, tube, 6, false), mat);
  m.position.set(0, y, z);
  m.rotation.x = tilt;
  parent.add(m);
  return m;
}

function addBubble(parent, mat, rx, ry, rz, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  m.scale.set(rx, ry, rz);
  m.position.set(0, y, z);
  m.renderOrder = 1;
  parent.add(m);
  return m;
}

function addGlareShield(parent, mat, w, x, y, z, depth) {
  addBox(parent, mat.matte, w, 0.035, depth, x, y, z);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, w, 10), mat.matte);
  lip.rotation.z = Math.PI / 2;
  lip.position.set(x, y, z + depth / 2);
  parent.add(lip);
}

// Instrument panel with MFD bezels (OSB buttons) and live screens
function addPanel(parent, mat, mfds, { w, h, x, y, z, tilt, screens }) {
  const panel = new THREE.Group();
  panel.position.set(x, y, z);
  panel.rotation.x = tilt;
  parent.add(panel);
  addBox(panel, mat.console, w, h, 0.03, 0, 0, -0.015);
  screens.forEach((s) => {
    addBox(panel, mat.bezel, s.size + 0.025, s.size + 0.025, 0.012, s.x, s.y, 0.006);
    for (let i = 0; i < 4; i++) {
      const oy = s.y - s.size * 0.36 + i * s.size * 0.24;
      addBox(panel, mat.knob, 0.008, 0.008, 0.006, s.x - s.size / 2 - 0.006, oy, 0.014);
      addBox(panel, mat.knob, 0.008, 0.008, 0.006, s.x + s.size / 2 + 0.006, oy, 0.014);
    }
    const screenMat = new THREE.MeshBasicMaterial({ map: mfds.texture(s.page), toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(s.size, s.size), screenMat);
    screen.position.set(s.x, s.y, 0.0135);
    panel.add(screen);
  });
  return panel;
}

// Cockpit tub walls + side consoles with switch rows
function addTub(parent, mat, cx, halfWidth, top, zFront, zBack) {
  const len = zBack - zFront, zc = (zFront + zBack) / 2;
  [-1, 1].forEach((s) => {
    addBox(parent, mat.console, 0.03, 0.4, len, cx + s * halfWidth, top - 0.1, zc);
    addBox(parent, mat.console, 0.16, 0.05, len * 0.7, cx + s * (halfWidth - 0.09), top, zc - len * 0.05);
    for (let i = 0; i < 5; i++) {
      addBox(parent, mat.knob, 0.012, 0.02, 0.012, cx + s * (halfWidth - 0.12), top + 0.035, zFront + 0.12 + i * 0.07);
      addBox(parent, mat.knob, 0.012, 0.02, 0.012, cx + s * (halfWidth - 0.06), top + 0.035, zFront + 0.12 + i * 0.07);
    }
  });
}

function addSeat(parent, mat, x, y, z, ejection) {
  addBox(parent, mat.seat, 0.44, 0.08, 0.42, x, y - 0.55, z - 0.12);
  addBox(parent, mat.seat, 0.44, 0.62, 0.1, x, y - 0.24, z + 0.16);
  addBox(parent, mat.seat, 0.26, 0.2, 0.12, x, y + 0.04, z + 0.18);
  if (ejection) addBox(parent, mat.warn, 0.14, 0.03, 0.03, x, y - 0.5, z - 0.34);
}

// Low-poly gloved hand wrapped round a vertical grip at the parent's origin (side -1 left, +1 right)
function addHand(parent, mat, side, forearmEnd = [side * 0.09, -0.14, 0.32]) {
  const hand = new THREE.Group();
  addBox(hand, mat.glove, 0.04, 0.08, 0.025, 0, 0, 0.03);
  addBox(hand, mat.glove, 0.045, 0.075, 0.02, 0, -0.003, -0.028);
  addBox(hand, mat.glove, 0.016, 0.075, 0.06, side * 0.026, -0.003, 0);
  addBox(hand, mat.glove, 0.018, 0.018, 0.04, -side * 0.008, 0.045, 0.005);
  addStrut(hand, mat.sleeve, [side * 0.01, -0.03, 0.05], forearmEnd, 0.03);
  parent.add(hand);
  return hand;
}

function addStick(parent, mat, x, y, z, side, height) {
  addBox(parent, mat.matte, 0.09, 0.03, 0.09, x, y, z);
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  parent.add(pivot);
  addStrut(pivot, mat.frame, [0, 0, 0], [0, height - 0.04, 0], 0.012);
  addBox(pivot, mat.matte, 0.036, 0.08, 0.04, 0, height, 0);
  addBox(pivot, mat.trigger, 0.012, 0.012, 0.012, 0, height + 0.045, -0.012);
  const grip = new THREE.Group();
  grip.position.set(0, height, 0);
  pivot.add(grip);
  addHand(grip, mat, side);
  return pivot;
}

function addThrottle(parent, mat, x, y, z, side, levers) {
  addBox(parent, mat.matte, 0.05 + 0.04 * levers, 0.02, 0.2, x, y, z);
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  parent.add(pivot);
  for (let i = 0; i < levers; i++) {
    const lx = (i - (levers - 1) / 2) * 0.05;
    addStrut(pivot, mat.frame, [lx, 0, 0], [lx, 0.11, 0], 0.008);
  }
  addBox(pivot, mat.matte, 0.035 + 0.05 * (levers - 1), 0.035, 0.05, 0, 0.12, 0);
  const grip = new THREE.Group();
  grip.position.set(0, 0.12, 0);
  pivot.add(grip);
  addHand(grip, mat, side);
  pivot.rotation.x = 0.35;
  return pivot;
}

// Helicopter collective: lever hinged behind the pilot, grip forward, raised with power
function addCollective(parent, mat, x, y, z, side, length) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  parent.add(pivot);
  addStrut(pivot, mat.frame, [0, 0, 0], [0, 0, -length], 0.014);
  addBox(pivot, mat.matte, 0.04, 0.04, 0.09, 0, 0, -length);
  const grip = new THREE.Group();
  grip.position.set(0, 0, -length);
  grip.rotation.x = -Math.PI / 2;
  pivot.add(grip);
  addHand(grip, mat, side, [side * 0.06, -0.28, 0.12]);
  return pivot;
}

function addYoke(parent, mat, x, y, z) {
  const column = new THREE.Group();
  column.position.set(x, y, z);
  parent.add(column);
  addStrut(column, mat.frame, [0, -0.38, -0.04], [0, 0, 0], 0.02);
  const wheel = new THREE.Group();
  wheel.position.set(0, 0, 0.03);
  column.add(wheel);
  addBox(wheel, mat.matte, 0.07, 0.05, 0.04, 0, 0, 0);
  addBox(wheel, mat.matte, 0.28, 0.025, 0.025, 0, 0, 0);
  [-1, 1].forEach((s) => addBox(wheel, mat.matte, 0.03, 0.11, 0.03, s * 0.14, 0.03, 0));
  return { column, wheel };
}

function addCombiner(parent, mat, hud, glass, mountFrom) {
  const tint = new THREE.Mesh(new THREE.PlaneGeometry(glass.width, glass.height), mat.hudTint);
  tint.position.set(glass.x, glass.y, -glass.dist - 0.002);
  tint.renderOrder = 2;
  const symMat = new THREE.MeshBasicMaterial({
    map: hud.texture, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });
  const symbols = new THREE.Mesh(new THREE.PlaneGeometry(glass.width, glass.height), symMat);
  symbols.position.set(glass.x, glass.y, -glass.dist);
  symbols.renderOrder = 3;
  parent.add(tint, symbols);
  const hw = glass.width / 2, z = -glass.dist - 0.004;
  const top = glass.y + glass.height / 2, bot = glass.y - glass.height / 2;
  addStrut(parent, mat.frame, [glass.x - hw, bot, z], [glass.x - hw, top, z], 0.004);
  addStrut(parent, mat.frame, [glass.x + hw, bot, z], [glass.x + hw, top, z], 0.004);
  addStrut(parent, mat.frame, [glass.x - hw, top, z], [glass.x + hw, top, z], 0.004);
  if (mountFrom) addStrut(parent, mat.frame, mountFrom, [glass.x, top, z], 0.008);
}

// ---------- per-airframe layouts ----------
function layoutFighter(g, mat, mfds) {
  const glass = { x: 0, y: -0.015, width: 0.16, height: 0.14, dist: 0.47 };
  addBubble(g, mat.canopyGlass, 0.47, 0.5, 1.05, -0.2, -0.05);
  addArch(g, mat.frame, 0.34, 0.37, 0.018, -0.2, -0.78, 0.5);
  addArch(g, mat.frame, 0.45, 0.48, 0.022, -0.2, 0.35);
  addStrut(g, mat.frame, [-0.45, -0.2, -0.95], [-0.45, -0.2, 0.9], 0.02);
  addStrut(g, mat.frame, [0.45, -0.2, -0.95], [0.45, -0.2, 0.9], 0.02);
  addGlareShield(g, mat, 0.6, 0, -0.12, -0.66, 0.3);
  addBox(g, mat.matte, 0.14, 0.03, 0.1, 0, -0.09, -0.53);
  addPanel(g, mat, mfds, {
    w: 0.62, h: 0.22, x: 0, y: -0.25, z: -0.6, tilt: -0.2,
    screens: [{ page: 'pfd', x: -0.2, y: 0, size: 0.16 }, { page: 'nav', x: 0, y: 0, size: 0.16 }, { page: 'eng', x: 0.2, y: 0, size: 0.16 }]
  });
  addTub(g, mat, 0, 0.46, -0.42, -0.75, 0.3);
  addSeat(g, mat, 0, 0, 0, true);
  return {
    glass,
    stick: addStick(g, mat, 0.3, -0.42, -0.22, 1, 0.14),
    throttle: addThrottle(g, mat, -0.3, -0.42, -0.2, -1, 1)
  };
}

function layoutTrainer(g, mat, mfds) {
  const glass = { x: 0, y: -0.03, width: 0.13, height: 0.11, dist: 0.5 };
  addBubble(g, mat.canopyGlass, 0.45, 0.48, 1.8, -0.2, 0.55);
  addArch(g, mat.frame, 0.32, 0.35, 0.02, -0.2, -0.85, 0.55);
  addArch(g, mat.frame, 0.44, 0.47, 0.022, -0.2, 0.42);
  addArch(g, mat.frame, 0.42, 0.44, 0.02, -0.2, 1.55);
  addStrut(g, mat.frame, [-0.45, -0.2, -1.0], [-0.45, -0.2, 2.2], 0.02);
  addStrut(g, mat.frame, [0.45, -0.2, -1.0], [0.45, -0.2, 2.2], 0.02);
  addGlareShield(g, mat, 0.56, 0, -0.13, -0.68, 0.28);
  addPanel(g, mat, mfds, {
    w: 0.56, h: 0.22, x: 0, y: -0.26, z: -0.62, tilt: -0.18,
    screens: [{ page: 'pfd', x: -0.13, y: 0, size: 0.17 }, { page: 'eng', x: 0.13, y: 0, size: 0.17 }]
  });
  addTub(g, mat, 0, 0.44, -0.45, -0.8, 1.9);
  addSeat(g, mat, 0, 0, 0, true);
  // Rear (instructor) station of the tandem cockpit
  addSeat(g, mat, 0, 0.12, 1.15, true);
  addGlareShield(g, mat, 0.5, 0, -0.06, 0.62, 0.2);
  addBox(g, mat.console, 0.5, 0.2, 0.03, 0, -0.2, 0.7, -0.15);
  return {
    glass,
    stick: addStick(g, mat, 0, -0.62, -0.36, 1, 0.3),
    throttle: addThrottle(g, mat, -0.33, -0.45, -0.12, -1, 1)
  };
}

function layoutHeli(g, mat, mfds) {
  const glass = { x: 0, y: -0.08, width: 0.12, height: 0.1, dist: 0.5 };
  // Flat-pane canopy frame of the elevated rear (pilot) station
  const FL = [-0.45, -0.22, -0.75], FR = [0.45, -0.22, -0.75], FC = [0, -0.22, -0.78];
  const TL = [-0.36, 0.32, -0.42], TR = [0.36, 0.32, -0.42], TC = [0, 0.32, -0.45];
  const BL = [-0.42, 0.36, 0.45], BR = [0.42, 0.36, 0.45];
  const SL = [-0.5, -0.25, 0.5], SR = [0.5, -0.25, 0.5];
  [[FL, TL], [FR, TR], [FC, TC], [TL, TR], [FL, FR], [TL, BL], [TR, BR], [BL, BR], [BL, SL], [BR, SR], [FL, SL], [FR, SR],
    [[-0.5, -0.24, -0.05], [-0.4, 0.34, 0.0]], [[0.5, -0.24, -0.05], [0.4, 0.34, 0.0]]]
    .forEach(([a, b]) => addStrut(g, mat.frame, a, b, 0.018));
  // Front gunner station below and ahead
  addSeat(g, mat, 0, -0.5, -1.15, false);
  addGlareShield(g, mat, 0.62, 0, -0.17, -0.62, 0.24);
  addPanel(g, mat, mfds, {
    w: 0.6, h: 0.2, x: 0, y: -0.3, z: -0.58, tilt: -0.25,
    screens: [{ page: 'pfd', x: -0.14, y: 0, size: 0.16 }, { page: 'eng', x: 0.14, y: 0, size: 0.16 }]
  });
  addTub(g, mat, 0, 0.5, -0.45, -0.75, 0.4);
  addSeat(g, mat, 0, 0, 0, false);
  return {
    glass,
    stick: addStick(g, mat, 0, -0.64, -0.3, 1, 0.3),
    collective: addCollective(g, mat, -0.34, -0.48, 0.12, -1, 0.34)
  };
}

function layoutAirliner(g, mat, mfds) {
  const glass = { x: 0, y: -0.01, width: 0.15, height: 0.12, dist: 0.45 };
  // Windscreen frames: two front panes, side-front and side windows each side (centreline at x = 0.5)
  const S0 = [-0.4, -0.16, -0.88], H0 = [-0.33, 0.3, -0.62], S1 = [0.5, -0.16, -0.95], H1 = [0.5, 0.3, -0.66];
  const S2 = [1.4, -0.16, -0.88], H2 = [1.33, 0.3, -0.62];
  const SS0 = [-0.66, -0.14, -0.3], HS0 = [-0.58, 0.3, -0.25], SS2 = [1.66, -0.14, -0.3], HS2 = [1.58, 0.3, -0.25];
  const SR0 = [-0.7, -0.12, 0.35], HR0 = [-0.62, 0.3, 0.35], SR2 = [1.7, -0.12, 0.35], HR2 = [1.62, 0.3, 0.35];
  [[S0, H0], [S1, H1], [S2, H2], [S0, S1], [S1, S2], [H0, H1], [H1, H2],
    [S0, SS0], [H0, HS0], [SS0, HS0], [SS0, SR0], [HS0, HR0], [SR0, HR0],
    [S2, SS2], [H2, HS2], [SS2, HS2], [SS2, SR2], [HS2, HR2], [SR2, HR2]]
    .forEach(([a, b]) => addStrut(g, mat.frame, a, b, 0.025));
  addBox(g, mat.console, 1.8, 0.04, 0.95, 0.5, 0.34, -0.12);
  addGlareShield(g, mat, 1.85, 0.5, -0.13, -0.78, 0.3);
  addPanel(g, mat, mfds, {
    w: 1.85, h: 0.26, x: 0.5, y: -0.3, z: -0.74, tilt: -0.15,
    screens: [
      { page: 'pfd', x: -0.5, y: 0, size: 0.2 }, { page: 'nav', x: -0.24, y: 0, size: 0.2 },
      { page: 'eng', x: 0, y: 0, size: 0.2 },
      { page: 'nav', x: 0.24, y: 0, size: 0.2 }, { page: 'pfd', x: 0.5, y: 0, size: 0.2 }
    ]
  });
  addBox(g, mat.console, 0.34, 0.3, 0.75, 0.5, -0.57, -0.3);
  addTub(g, mat, 0.5, 0.75, -0.45, -0.85, 0.4);
  addSeat(g, mat, 0, 0, 0, false);
  addSeat(g, mat, 1.0, 0, 0, false);
  const capt = addYoke(g, mat, 0, -0.36, -0.42);
  const fo = addYoke(g, mat, 1.0, -0.36, -0.42);
  addHand(capt.wheel, mat, -1).position.set(-0.14, 0.03, 0);
  return {
    glass,
    mount: [0, 0.32, -0.3],
    yokes: [capt, fo],
    throttle: addThrottle(g, mat, 0.5, -0.41, -0.3, 1, 2)
  };
}

const LAYOUTS = { fighter: layoutFighter, trainer: layoutTrainer, heli: layoutHeli, airliner: layoutAirliner };
const MFD_PAGES = { fighter: ['pfd', 'nav', 'eng'], trainer: ['pfd', 'eng'], heli: ['pfd', 'eng'], airliner: ['pfd', 'nav', 'eng'] };

// eyeOffset (optional): the airframe's cockpitOffset; defaults to the spec offset
export function buildCockpit(aircraftId, eyeOffset) {
  const id = aircraftId === 'helicopter' ? 'heli' : aircraftId;
  const spec = COCKPIT_SPECS[id];
  const offset = eyeOffset ? eyeOffset.clone() : new THREE.Vector3(...spec.offset);
  const group = new THREE.Group();
  group.name = `cockpit_${id}`;
  group.position.copy(offset);

  const mat = cockpitMaterials();
  const mfds = new CockpitMfdSet(MFD_PAGES[id]);
  const parts = LAYOUTS[id](group, mat, mfds);
  const hud = new CombinerHud(parts.glass);
  addCombiner(group, mat, hud, parts.glass, parts.mount);

  let fuelKg = spec.fuelKg;
  const isRotorcraft = id === 'heli';

  return {
    id,
    group,
    cockpitOffset: offset,

    reset() {
      fuelKg = spec.fuelKg;
    },
    get fuelKg() { return fuelKg; },
    set fuelKg(v) { fuelKg = v; },

    // d: flight data, inputs: { pitch, roll, yaw } in -1..1. Fuel burns in every view;
    // HOTAS animation, HUD (30 Hz) and MFDs (15 Hz) only run while the cockpit is on screen.
    update(d, inputs, nowMs, visible) {
      let flow = spec.burnKgH[0] + (spec.burnKgH[1] - spec.burnKgH[0]) * (d.power / 100);
      if (d.isAfterburner && spec.abBurnKgH) flow = spec.abBurnKgH;
      fuelKg = Math.max(0, fuelKg - flow / 3600 * d.dt);
      if (!visible) return;

      if (parts.stick) {
        parts.stick.rotation.x = inputs.pitch * 0.22;
        parts.stick.rotation.z = -inputs.roll * 0.25;
      }
      if (parts.yokes) {
        parts.yokes.forEach((y) => {
          y.column.position.z = -0.42 + inputs.pitch * 0.06;
          y.wheel.rotation.z = -inputs.roll * 0.6;
        });
      }
      if (parts.throttle) parts.throttle.rotation.x = 0.35 - d.throttle * 0.7;
      if (parts.collective) parts.collective.rotation.x = 0.05 + (d.power / 100) * 0.35;

      const rpmPct = spec.idleRpm + (100 - spec.idleRpm) * (d.power / 100) + (d.isAfterburner ? 3 : 0);
      const rotorRpmPct = 94 + 0.07 * d.power;
      const md = {
        ...d,
        isRotorcraft,
        engineLabel: spec.engineLabel,
        rpmPct,
        rotorRpmPct,
        rotorRpm: 289 * rotorRpmPct / 100,
        fuelKg,
        fuelPct: fuelKg / spec.fuelKg * 100,
        fuelFlowKgH: flow
      };
      mfds.update(md, nowMs);
      hud.draw(md, nowMs);
    },

    dispose() {
      group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && !Object.values(mat).includes(o.material)) o.material.dispose();
      });
      Object.values(mat).forEach((m) => m.dispose());
      hud.texture.dispose();
      mfds.dispose();
    }
  };
}
