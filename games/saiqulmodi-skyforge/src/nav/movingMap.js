import { geoToWorld, PLACES, NH44_ROUTE, ROADS } from '../environment/phase6/geo.js';
import { RUNWAY, SOUTH_RUNWAY_X } from '../environment/phase6/voblAirport.js';

// North-up moving map overlay: airport, Nandi Hills, roads, city, the return-to-land route and the
// aircraft. Screen: up = north (-X world), right = east (-Z world). Redrawn at 10 Hz.
const MAP_HZ = 10;
const SIZES = { small: 260, large: 560 };
const SCALES_M = [2000, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000]; // half-width shown

const toLine = (route) => route.map(([lat, lon]) => geoToWorld(lat, lon));

export class MovingMap {
  constructor() {
    this.size = 'small';
    this.airports = null;
    this.home = { icao: 'VOBL', ident: '09L', thrX: 0, thrZ: 2000 };
    this.nearest = null; // nearest runway end to land on (always shown)
    this.extras = null;  // { wind, ils, traffic, targets, lock } from the game loop
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;top:12px;right:12px;z-index:10001;border:1px solid rgba(0,255,170,0.45);' +
      'background:rgba(6,12,18,0.82);border-radius:6px;pointer-events:none;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.lastDrawMs = -Infinity;
    this.applySize();
    window.addEventListener('resize', () => this.applySize());

    this.nh44 = toLine(NH44_ROUTE);
    this.roads = Object.values(ROADS).map(toLine);
    this.nandi = geoToWorld(PLACES.nandiHillsSummit.lat, PLACES.nandiHillsSummit.lon);
    this.skanda = geoToWorld(PLACES.skandagiriSummit.lat, PLACES.skandagiriSummit.lon);
    this.cbd = geoToWorld(PLACES.bengaluruCbd.lat, PLACES.bengaluruCbd.lon);
    this.t1 = geoToWorld(PLACES.terminal1.lat, PLACES.terminal1.lon);
    this.t2 = geoToWorld(PLACES.terminal2.lat, PLACES.terminal2.lon);
  }

  // airports: Airports registry (src/world/airports.js); home: the destination runway end
  setAirports(airports) { this.airports = airports; }
  setHome(end) { this.home = end; }

  applySize() {
    // Fit the window height (the control deck takes ~90 px at the bottom)
    const px = Math.max(200, Math.min(SIZES[this.size], window.innerHeight - 110));
    this.canvas.width = px;
    this.canvas.height = px;
    this.lastDrawMs = -Infinity;
  }

  // Nearest airport, and of its runway ends the one whose approach side the aircraft is on
  findNearest(x, z, gsMs) {
    if (!this.airports) return null;
    const ends = this.airports.ends();
    let icao = null, bestD = Infinity;
    for (const e of ends) {
      const d = Math.hypot(e.thrX - x, e.thrZ - z);
      if (d < bestD) { bestD = d; icao = e.icao; }
    }
    let best = null;
    for (const e of ends) {
      if (e.icao === icao && (!best || this.approachSide(e, x, z) > this.approachSide(best, x, z))) best = e;
    }
    if (!best) return null;
    const d = Math.hypot(best.thrX - x, best.thrZ - z);
    const north = -(best.thrX - x), east = -(best.thrZ - z);
    return {
      icao: best.icao, ident: best.ident, name: best.airportName, end: best,
      distNm: d / 1852, distKm: d / 1000,
      bearing: (Math.atan2(east, north) * 180 / Math.PI + 360) % 360,
      etaMin: gsMs > 20 ? d / gsMs / 60 : null
    };
  }

  approachSide(e, x, z) { return -((x - e.thrX) * e.dirX + (z - e.thrZ) * e.dirZ); }

  toggleSize() {
    this.size = this.size === 'small' ? 'large' : 'small';
    this.applySize();
  }

  // state: sim state, nav: NavComputer output (or null), headingDeg
  draw(state, nav, headingDeg, nowMs) {
    if (nowMs - this.lastDrawMs < 1000 / MAP_HZ) return;
    this.lastDrawMs = nowMs;
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    const cx = W / 2, cy = (H - 54) / 2; // guidance box takes the bottom 54 px
    const gsMs = Math.hypot(state.vel.x, state.vel.z);
    this.nearest = this.findNearest(state.pos.x, state.pos.z, gsMs);
    const nr = this.nearest;

    // Centre between the aircraft and the destination runway; range fits both plus the next waypoint
    const home = { x: this.home.thrX, z: this.home.thrZ };
    const midX = (state.pos.x + home.x) / 2, midZ = (state.pos.z + home.z) / 2;
    const pts = [state.pos, home];
    if (nav && !nav.complete) pts.push(nav.route[nav.index]);
    if (nr) pts.push({ x: nr.end.thrX, z: nr.end.thrZ });
    const need = Math.max(...pts.map((p) => Math.max(Math.abs(p.x - midX), Math.abs(p.z - midZ)))) * 1.1 + 1500;
    const half = SCALES_M.find((s) => s >= need) || SCALES_M[SCALES_M.length - 1];
    const k = (Math.min(W, H - 54) / 2 - 14) / half;
    const sx = (x, z) => cx + (-(z - midZ)) * k; // east is right
    const sy = (x, z) => cy + (x - midX) * k;    // south is down
    const tag = (text, x, y, color) => {          // small boxed label that reads over anything
      ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      const w = ctx.measureText(text).width + 8;
      ctx.fillStyle = 'rgba(6,12,18,0.85)'; ctx.fillRect(x - w / 2, y - 8, w, 13);
      ctx.fillStyle = color; ctx.fillText(text, x, y + 2); ctx.textAlign = 'left';
    };

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();

    // City and Nandi Hills
    ctx.fillStyle = 'rgba(148,163,184,0.18)';
    ctx.beginPath(); ctx.arc(sx(this.cbd.x, this.cbd.z), sy(this.cbd.x, this.cbd.z), 6500 * k, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(161,98,7,0.35)';
    [[this.nandi, 1700], [this.skanda, 1300]].forEach(([p, r]) => {
      ctx.beginPath(); ctx.arc(sx(p.x, p.z), sy(p.x, p.z), Math.max(3, r * k), 0, Math.PI * 2); ctx.fill();
    });

    // Roads
    const poly = (pts, color, w) => {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(sx(p.x, p.z), sy(p.x, p.z)) : ctx.moveTo(sx(p.x, p.z), sy(p.x, p.z))));
      ctx.stroke();
    };
    poly(this.nh44, 'rgba(250,204,21,0.55)', 2);
    this.roads.forEach((r) => poly(r, 'rgba(250,204,21,0.3)', 1));

    // Runways of every airport (at least 3 px wide so they stay visible zoomed out), ICAO labels, terminals
    const runways = this.airports ? this.airports.runways : [
      { ax: 0, az: RUNWAY.halfLength, bx: 0, bz: -RUNWAY.halfLength },
      { ax: SOUTH_RUNWAY_X, az: RUNWAY.halfLength, bx: SOUTH_RUNWAY_X, bz: -RUNWAY.halfLength }
    ];
    const act = this.extras && this.extras.active;   // take-off runway end
    const sameEnd = (a, b) => !!(a && b && a.icao === b.icao && a.ident === b.ident);
    const sameRw = (rw, e) => e && rw.icao === e.icao && (rw.le === e.ident || rw.he === e.ident);
    const rwW = Math.max(5, RUNWAY.width * k);
    runways.forEach((rw) => {
      const toRw = sameRw(rw, act), landRw = sameRw(rw, nr && nr.end);
      const role = (state.onGround ? toRw : toRw && !landRw) ? '#4ade80' : landRw ? '#22d3ee' : toRw ? '#4ade80' : rw.icao === this.home.icao ? '#ffffff' : '#9ca3af';
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = rwW + 3;           // dark edge so it reads on any background
      ctx.beginPath(); ctx.moveTo(sx(rw.ax, rw.az), sy(rw.ax, rw.az)); ctx.lineTo(sx(rw.bx, rw.bz), sy(rw.bx, rw.bz)); ctx.stroke();
      ctx.strokeStyle = role; ctx.lineWidth = rwW;
      ctx.beginPath(); ctx.moveTo(sx(rw.ax, rw.az), sy(rw.ax, rw.az)); ctx.lineTo(sx(rw.bx, rw.bz), sy(rw.bx, rw.bz)); ctx.stroke();
      // runway end names just beyond each threshold (when big enough on screen, or when it matters now)
      const lenPx = Math.hypot(sx(rw.bx, rw.bz) - sx(rw.ax, rw.az), sy(rw.bx, rw.bz) - sy(rw.ax, rw.az));
      if (rw.le && (lenPx > 24 || role !== '#9ca3af')) {
        const ux = (sx(rw.bx, rw.bz) - sx(rw.ax, rw.az)) / (lenPx || 1), uy = (sy(rw.bx, rw.bz) - sy(rw.ax, rw.az)) / (lenPx || 1);
        ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = role === '#9ca3af' ? '#e5e7eb' : role;
        ctx.fillText(rw.le, sx(rw.ax, rw.az) - ux * 16, sy(rw.ax, rw.az) - uy * 16);
        ctx.fillText(rw.he, sx(rw.bx, rw.bz) + ux * 16, sy(rw.bx, rw.bz) + uy * 16);
        ctx.textBaseline = 'alphabetic';
      }
    });
    ctx.fillStyle = '#38bdf8';
    [this.t1, this.t2].forEach((t) => ctx.fillRect(sx(t.x, t.z) - 3, sy(t.x, t.z) - 2, 6, 4));

    // Labels
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    if (this.airports) {
      this.airports.list.forEach((a) => {
        const px = sx(a.x, a.z), py = sy(a.x, a.z);
        if (px < -40 || px > W + 40 || py < -20 || py > H) return;
        ctx.fillStyle = a.icao === this.home.icao ? '#ffffff' : '#cbd5e1';
        ctx.fillText(a.icao, px + 6, py - 6);
      });
    }
    ctx.fillStyle = '#d6a35c';
    ctx.fillText('NANDI HILLS', sx(this.nandi.x, this.nandi.z) + 8, sy(this.nandi.x, this.nandi.z));
    ctx.fillStyle = '#facc15';
    ctx.fillText('NH44', sx(this.nh44[4].x, this.nh44[4].z) + 5, sy(this.nh44[4].x, this.nh44[4].z));
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('BENGALURU', sx(this.cbd.x, this.cbd.z) - 30, sy(this.cbd.x, this.cbd.z));

    // Route: dashed line from the aircraft through the remaining waypoints
    if (nav) {
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(sx(state.pos.x, state.pos.z), sy(state.pos.x, state.pos.z));
      for (let i = nav.index; i < nav.route.length; i++) ctx.lineTo(sx(nav.route[i].x, nav.route[i].z), sy(nav.route[i].x, nav.route[i].z));
      ctx.stroke();
      ctx.setLineDash([]);
      const large = this.size === 'large';
      nav.route.forEach((wp, i) => {
        const px = sx(wp.x, wp.z), py = sy(wp.x, wp.z);
        const active = i === nav.index;
        ctx.fillStyle = i < nav.index ? '#64748b' : active ? '#e879f9' : '#f5d0fe';
        ctx.beginPath();
        ctx.moveTo(px, py - 5); ctx.lineTo(px + 5, py); ctx.lineTo(px, py + 5); ctx.lineTo(px - 5, py);
        ctx.closePath(); ctx.fill();
        // Small map: label only the active waypoint; large map: all, alternating above / below the line
        if (!large && !active) return;
        ctx.font = active ? 'bold 11px monospace' : '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(large ? `${wp.name} ${wp.altFt}ft` : wp.name, px, i % 2 ? py + 17 : py - 9);
        ctx.textAlign = 'left';
      });
    }

    // Nearest runway: cyan dashed line to its threshold
    if (nr) {
      const tx = sx(nr.end.thrX, nr.end.thrZ), ty = sy(nr.end.thrX, nr.end.thrZ);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(sx(state.pos.x, state.pos.z), sy(state.pos.x, state.pos.z));
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.stroke();
      const ax = sx(state.pos.x, state.pos.z), ay = sy(state.pos.x, state.pos.z);
      if (Math.hypot(tx - ax, ty - ay) > 60) tag(`${nr.distKm.toFixed(1)} KM`, (ax + tx) / 2, (ay + ty) / 2, '#22d3ee');
      if (!(state.onGround && sameEnd(nr.end, act))) tag(`LAND ${nr.ident}`, tx, ty - 14, '#22d3ee');
    }
    if (act && !(nr && sameEnd(nr.end, act) && !state.onGround)) {
      const tx = sx(act.thrX, act.thrZ), ty = sy(act.thrX, act.thrZ);
      const ex2 = sx(act.thrX + act.dirX * 600, act.thrZ + act.dirZ * 600), ey2 = sy(act.thrX + act.dirX * 600, act.thrZ + act.dirZ * 600);
      const L = Math.hypot(ex2 - tx, ey2 - ty) || 1, ux = (ex2 - tx) / L, uy = (ey2 - ty) / L;
      ctx.strokeStyle = '#4ade80'; ctx.fillStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + ux * 22, ty + uy * 22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx + ux * 28, ty + uy * 28); ctx.lineTo(tx + ux * 20 - uy * 5, ty + uy * 20 + ux * 5); ctx.lineTo(tx + ux * 20 + uy * 5, ty + uy * 20 - ux * 5); ctx.closePath(); ctx.fill();
      tag(`T/O ${act.ident}`, tx - uy * 18, ty + ux * 18, '#4ade80');
    }

    // Phase 8 traffic (cyan) and phase 9 range targets (orange; locked one ringed)
    const ex = this.extras;
    if (ex) {
      (ex.traffic || []).forEach((t) => {
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath(); ctx.arc(sx(t.position.x, t.position.z), sy(t.position.x, t.position.z), 3, 0, Math.PI * 2); ctx.fill();
      });
      (ex.targets || []).forEach((t) => {
        const px = sx(t.position.x, t.position.z), py = sy(t.position.x, t.position.z);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
        if (ex.lock === t) { ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1.5; ctx.strokeRect(px - 6, py - 6, 12, 12); }
      });
    }

    // Aircraft symbol, rotated to the heading
    ctx.save();
    ctx.translate(sx(state.pos.x, state.pos.z), sy(state.pos.x, state.pos.z));
    ctx.rotate(headingDeg * Math.PI / 180);
    ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#0b1120'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(9, 10); ctx.lineTo(0, 5); ctx.lineTo(-9, 10);
    ctx.closePath(); ctx.stroke(); ctx.fill();
    ctx.strokeStyle = 'rgba(250,204,21,0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -60); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    tag('YOU', sx(state.pos.x, state.pos.z), sy(state.pos.x, state.pos.z) + 22, '#facc15');
    ctx.restore();

    // North arrow + scale
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', 14, 16);
    ctx.beginPath(); ctx.moveTo(14, 20); ctx.lineTo(10, 30); ctx.lineTo(18, 30); ctx.closePath(); ctx.fill();
    ctx.textAlign = 'right';
    ctx.font = '10px monospace';
    ctx.fillText(`${(half * 2 / 1000).toFixed(0)} KM ACROSS  [M] SIZE`, W - 6, 14);
    if (ex && ex.wind) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText(`WIND ${String(Math.round(ex.wind.fromDeg)).padStart(3, '0')}/${Math.round(ex.wind.speedKts)}`, 26, 14);
    }

    // Nearest runway line (always): which runway, distance to cover, bearing, time
    if (nr) {
      ctx.fillStyle = 'rgba(6,12,18,0.85)';
      ctx.fillRect(0, 34, W, 30);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`NEAREST ${nr.icao} RWY ${nr.ident}  ${nr.distNm.toFixed(1)} NM (${nr.distKm.toFixed(1)} KM)`, 6, 47);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#a5f3fc';
      ctx.fillText(`BRG ${String(Math.round(nr.bearing)).padStart(3, '0')}${nr.etaMin !== null ? `  ~${Math.max(1, Math.round(nr.etaMin))} MIN` : ''}  ${nr.name.slice(0, 18)}  [J] LAND HERE`, 6, 60);
    }
    const g = ex && ex.ground;
    if (g) {
      ctx.fillStyle = 'rgba(6,12,18,0.85)'; ctx.fillRect(0, 64, W, 17);
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
      ctx.fillText(g, 6, 76);
    }

    // Guidance box
    ctx.fillStyle = 'rgba(6,12,18,0.88)';
    ctx.fillRect(0, H - 54, W, 54);
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px monospace';
    if (!nav) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ROUTE TO ${this.home.icao}: planned after take-off`, 8, H - 30);
    } else if (nav.complete) {
      ctx.fillStyle = '#4ade80';
      ctx.fillText('LANDED - route complete', 8, H - 30);
    } else {
      const mins = Math.floor(nav.etaSec / 60), secs = Math.round(nav.etaSec % 60);
      const tMins = Math.round(nav.totalEtaSec / 60);
      ctx.fillStyle = '#e879f9';
      ctx.fillText(`NEXT ${nav.name}  BRG ${String(Math.round(nav.bearing)).padStart(3, '0')}  ${nav.distNm.toFixed(1)} NM  ${mins}:${String(secs).padStart(2, '0')}`, 8, H - 36);
      const turnTxt = Math.abs(nav.turn) < 5 ? 'ON COURSE' : `TURN ${nav.turn > 0 ? 'RIGHT' : 'LEFT'} ${Math.round(Math.abs(nav.turn))} DEG`;
      const altDiff = nav.targetAltFt - nav.altFt;
      const altTxt = Math.abs(altDiff) < 200 ? `ALT ${Math.round(nav.altFt)} OK` : `${altDiff > 0 ? 'CLIMB' : 'DESCEND'} TO ${nav.targetAltFt} FT`;
      const col = (v, y, r) => (v < y ? '#4ade80' : v < r ? '#facc15' : '#ef4444');
      const hCol = col(Math.abs(nav.turn), 5, 25), aCol = col(Math.abs(altDiff), 300, 1000);
      ctx.fillStyle = hCol;
      ctx.fillText(`${turnTxt} |`, 8, H - 20);
      ctx.fillStyle = aCol;
      ctx.fillText(` ${altTxt}`, 8 + ctx.measureText(`${turnTxt} |`).width, H - 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${nav.destination} in ~${tMins} min | [N] re-plan`, 8, H - 6);
    }
  }
}
