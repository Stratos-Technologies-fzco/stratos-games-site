// Tactical minimap (main.py:145, 772-798, 2592-2613): the whole country, batteries (green armed, grey empty,
// red destroyed), TELs you can see (yellow), drones (purple), missiles (orange), the squadron (white; the jet
// you fly cyan, with its heading). A click picks a jet (main.py:2048-2059). Redrawn at 10 Hz.
// Tactical look: lit bezel, grid lines, range rings and a radar sweep round the jet you fly, military symbols
// (hostile drones and missiles = red / orange chevrons pointing where they fly, the squadron = blue wedges).
import { WORLD_H_PX, WORLD_W_PX, PX_M } from '../config';
import type { Squadron } from '../flight/Squadron';
import type { ThreatSystem } from '../threats/ThreatSystem';
import { MAP } from '../world/MapData';

const W = 252; // main.py:145
const H = 90;

export class Minimap {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bg: HTMLCanvasElement;
  private tick = 0;

  constructor(parent: HTMLElement, mapPicture: CanvasImageSource, onPickJet: (idx: number) => void, squadron: Squadron) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'minimap';
    this.canvas.width = W;
    this.canvas.height = H;
    parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    // the country picture, once (main.py:772-798 minimap())
    this.bg = document.createElement('canvas');
    this.bg.width = W;
    this.bg.height = H;
    const b = this.bg.getContext('2d') as CanvasRenderingContext2D;
    b.imageSmoothingQuality = 'high';
    b.drawImage(mapPicture, 0, 0, W, H);
    b.fillStyle = 'rgba(0, 10, 20, 0.32)';
    b.fillRect(0, 0, W, H);
    // tactical grid: major lines every 1/12 of the width, minor ticks between
    b.strokeStyle = 'rgba(0, 200, 255, 0.16)';
    b.lineWidth = 1;
    b.beginPath();
    for (let x = W / 12; x < W; x += W / 12) {
      b.moveTo(Math.round(x) + 0.5, 0);
      b.lineTo(Math.round(x) + 0.5, H);
    }
    for (let y = H / 4; y < H; y += H / 4) {
      b.moveTo(0, Math.round(y) + 0.5);
      b.lineTo(W, Math.round(y) + 0.5);
    }
    b.stroke();
    // inner vignette so the bezel glow reads
    const vg = b.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,8,18,0.45)');
    b.fillStyle = vg;
    b.fillRect(0, 0, W, H);
    // airbases: a real runway is only ~5 x 0.2 px at this scale, so each is drawn as an enlarged runway symbol
    // (east-west, like the runway): glowing outline, asphalt strip, white centre dashes, green thresholds,
    // the taxiway and apron below it
    for (let i = 0; i < MAP.airbases.length; i += 2) {
      const x = (MAP.airbases[i] / WORLD_W_PX) * W;
      const y = (MAP.airbases[i + 1] / WORLD_H_PX) * H;
      const len = 18;
      const wid = 4;
      b.save();
      b.shadowColor = 'rgba(255, 255, 255, 0.9)';
      b.shadowBlur = 4;
      b.fillStyle = '#f2f2ea';
      b.fillRect(x - len / 2 - 1, y - wid / 2 - 1, len + 2, wid + 2);
      b.restore();
      b.fillStyle = '#2b2f33';
      b.fillRect(x - len / 2, y - wid / 2, len, wid);
      b.fillStyle = '#ffffff';
      for (let d = -len / 2 + 3; d < len / 2 - 3; d += 3) b.fillRect(x + d, y - 0.5, 1.6, 1);
      b.fillStyle = '#3cff6e';
      b.fillRect(x - len / 2, y - wid / 2, 1, wid);
      b.fillRect(x + len / 2 - 1, y - wid / 2, 1, wid);
      b.fillStyle = '#9aa0a4';
      b.fillRect(x - len * 0.38, y + wid / 2 + 2, len * 0.76, 1);
      b.fillRect(x - 3, y + wid / 2 + 3, 6, 3);
    }
    // main.py:2048-2059: a click on the radar picks the nearest jet
    this.canvas.addEventListener('click', (e) => {
      const r = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * W;
      const my = ((e.clientY - r.top) / r.height) * H;
      let best = -1;
      let bd = 30;
      for (const j of squadron.jets) {
        if (!j.alive) continue;
        const [x, y] = this.toMap(j.pos.x, j.pos.z);
        const d = 3.5 * Math.hypot(x - mx, y - my);
        if (d < bd) {
          bd = d;
          best = j.id;
        }
      }
      if (best >= 0) onPickJet(best);
    });
  }

  private toMap(x: number, z: number): [number, number] {
    return [((x / PX_M + WORLD_W_PX / 2) / WORLD_W_PX) * W, ((z / PX_M + WORLD_H_PX / 2) / WORLD_H_PX) * H];
  }

  show(on: boolean): void {
    this.canvas.style.display = on ? 'block' : 'none';
  }

  update(
    ts: ThreatSystem,
    sq: Squadron,
    playerX: number,
    playerZ: number,
    playerHeading: number,
    rwy: { x: number; z: number; label: string } | null = null,
  ): void {
    if (++this.tick % 6 !== 0) return;
    const c = this.ctx;
    c.drawImage(this.bg, 0, 0);
    const kx = W / (WORLD_W_PX * PX_M);
    const kz = H / (WORLD_H_PX * PX_M);
    const ox = W / 2;
    const oz = H / 2;
    for (const l of ts.launchers) {
      const x = ox + l.x * kx;
      const y = oz + l.z * kz;
      if (l.kind === 'SAM') {
        c.fillStyle = l.hp <= 0 ? '#dc3c32' : l.missiles > 0 ? '#00dc96' : '#787878'; // main.py:2597
        c.beginPath();
        c.arc(x, y, 1.6, 0, Math.PI * 2);
        c.fill();
      } else if (l.visible) {
        c.fillStyle = l.hp <= 0 ? '#dc3c32' : l.missiles > 0 ? '#e6c85a' : '#787878'; // main.py:2601
        c.fillRect(x, y, 1, 1);
      }
    }
    // radar range rings and sweep round the jet you fly
    const px = ox + playerX * kx;
    const py = oz + playerZ * kz;
    c.save();
    c.beginPath();
    c.rect(0, 0, W, H);
    c.clip();
    c.strokeStyle = 'rgba(0, 230, 255, 0.35)';
    c.lineWidth = 1;
    for (const r of [14, 28, 42]) {
      c.beginPath();
      c.arc(px, py, r, 0, Math.PI * 2);
      c.stroke();
    }
    const sweep = (performance.now() / 1000) * 2.2; // ~3 s per turn
    const wedge = c.createRadialGradient(px, py, 0, px, py, 46);
    wedge.addColorStop(0, 'rgba(0, 255, 200, 0.28)');
    wedge.addColorStop(1, 'rgba(0, 255, 200, 0)');
    c.fillStyle = wedge;
    c.beginPath();
    c.moveTo(px, py);
    c.arc(px, py, 46, sweep - 0.6, sweep);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(120, 255, 220, 0.8)';
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(px + Math.cos(sweep) * 46, py + Math.sin(sweep) * 46);
    c.stroke();
    c.restore();
    // the nearest runway (SkyForge fighter: always shown with the distance to cover): green ring + line from the jet
    if (rwy) {
      const rx = ox + rwy.x * kx;
      const ry = oz + rwy.z * kz;
      c.save();
      c.strokeStyle = '#3cff6e';
      c.lineWidth = 1.5;
      c.shadowColor = '#3cff6e';
      c.shadowBlur = 5;
      c.beginPath();
      c.arc(rx, ry, 11, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([3, 3]);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(rx, ry);
      c.stroke();
      c.setLineDash([]);
      c.shadowBlur = 0;
      c.font = 'bold 9px monospace';
      const tw = c.measureText(rwy.label).width;
      c.fillStyle = 'rgba(0, 16, 8, 0.75)';
      c.fillRect(4, H - 15, tw + 6, 12);
      c.fillStyle = '#3cff6e';
      c.fillText(rwy.label, 7, H - 6);
      c.restore();
    }
    // hostile drones: red chevrons along their heading (main.py:2604 marks them; colour kept hostile red-violet)
    for (const d of ts.drones) if (d.alive) chevron(c, ox + d.x * kx, oz + d.z * kz, d.heading, 3.4, '#ff5a6e');
    // missiles: orange chevrons along their flight (main.py:2606)
    for (const m of ts.missiles.items) {
      if (!m.active) continue;
      chevron(c, ox + m.pos.x * kx, oz + m.pos.z * kz, Math.atan2(m.vel.x, -m.vel.z), 2.6, '#ff9628');
    }
    // the squadron (main.py:2609): friendly blue wedges along each jet's heading
    for (const j of sq.jets) if (j.alive && j.id !== sq.active) wedgeMark(c, ox + j.pos.x * kx, oz + j.pos.z * kz, j.heading, 3.6, '#4aa8ff');
    // the jet you fly: cyan, pointing where it heads
    c.save();
    c.translate(px, py);
    c.rotate(playerHeading);
    c.fillStyle = '#00e6ff';
    c.beginPath();
    c.moveTo(0, -5);
    c.lineTo(3.5, 3.5);
    c.lineTo(-3.5, 3.5);
    c.closePath();
    c.fill();
    c.restore();
    // lit bezel: double frame with corner brackets (main.py:2613 cyan frame)
    c.strokeStyle = '#00c8ff';
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, W - 1, H - 1);
    c.strokeStyle = 'rgba(0, 200, 255, 0.35)';
    c.strokeRect(2.5, 2.5, W - 5, H - 5);
    c.strokeStyle = '#7ff4ff';
    c.lineWidth = 2;
    c.beginPath();
    for (const [x, y, dx, dy] of [[1, 1, 1, 1], [W - 1, 1, -1, 1], [1, H - 1, 1, -1], [W - 1, H - 1, -1, -1]]) {
      c.moveTo(x, y + dy * 10);
      c.lineTo(x, y);
      c.lineTo(x + dx * 10, y);
    }
    c.stroke();
  }
}

/** NATO-style hostile chevron (an open V pointing where it flies); heading 0 = north (up), clockwise */
function chevron(c: CanvasRenderingContext2D, x: number, y: number, heading: number, s: number, col: string): void {
  c.save();
  c.translate(x, y);
  c.rotate(heading);
  c.strokeStyle = col;
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(-s, s * 0.6);
  c.lineTo(0, -s);
  c.lineTo(s, s * 0.6);
  c.stroke();
  c.restore();
}

/** friendly wedge: a filled narrow triangle along the heading */
function wedgeMark(c: CanvasRenderingContext2D, x: number, y: number, heading: number, s: number, col: string): void {
  c.save();
  c.translate(x, y);
  c.rotate(heading);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(0, -s);
  c.lineTo(s * 0.7, s * 0.8);
  c.lineTo(0, s * 0.35);
  c.lineTo(-s * 0.7, s * 0.8);
  c.closePath();
  c.fill();
  c.restore();
}
