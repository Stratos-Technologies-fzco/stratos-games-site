// Player 2 commands the launchers (main.py:47-52, 1832-1837, 2003-2025, 2197-2200, 2572-2583): picks a launcher
// near the jet (left / right, clockwise round it), fires guided (up) or unguided (down) when the jet is inside
// that launcher's ring and it is reloaded. Equal chances: the player's +15% edge is off in 2-player mode.
import type { Vector3 } from 'three';
import { PX_M } from '../config';
import type { Launcher } from './Launchers';
import type { ThreatSystem } from './ThreatSystem';

const P2_PICK_RANGE_M = 1400 * PX_M; // main.py:51
const P2_FIRE_GAP = 60; // main.py:52

export class PlayerTwo {
  on = false;
  sel: Launcher | null = null;
  cd = 0;
  private cands: Launcher[] = [];

  /** main.py:1832-1837 alive launchers near the jet, clockwise round it */
  private candidates(jet: Vector3, ts: ThreatSystem): Launcher[] {
    const c = this.cands;
    c.length = 0;
    for (const l of ts.launchers) if (l.hp > 0 && Math.hypot(l.x - jet.x, l.z - jet.z) < P2_PICK_RANGE_M) c.push(l);
    c.sort((a, b) => Math.atan2(a.z - jet.z, a.x - jet.x) - Math.atan2(b.z - jet.z, b.x - jet.x));
    return c;
  }

  /** One 60 Hz frame (main.py:2195-2200): keep a valid pick, else the nearest one. */
  step(jet: Vector3 | null, ts: ThreatSystem): void {
    if (this.cd > 0) this.cd--;
    if (!this.on || !jet) return;
    const c = this.candidates(jet, ts);
    if (this.sel && c.includes(this.sel)) return;
    let best: Launcher | null = null;
    let bd = Infinity;
    for (const l of c) {
      const d = Math.hypot(l.x - jet.x, l.z - jet.z);
      if (d < bd) {
        bd = d;
        best = l;
      }
    }
    this.sel = best;
  }

  /** main.py:2007-2011 */
  pick(stepDir: number, jet: Vector3, ts: ThreatSystem): void {
    const c = this.candidates(jet, ts);
    if (c.length === 0) return;
    const i = this.sel ? c.indexOf(this.sel) : -1;
    this.sel = i >= 0 ? c[(i + stepDir + c.length) % c.length] : c[0];
  }

  /** main.py:2012-2025; returns the message to show */
  fire(guided: boolean, jet: { pos: Vector3; vel: Vector3 } | null, ts: ThreatSystem): string {
    const s = this.sel;
    if (!s || s.hp <= 0) return 'P2: NO LAUNCHER PICKED';
    if (s.missiles <= 0) return `P2: ${s.name} IS EMPTY`;
    if (this.cd > 0) return 'P2: RELOADING';
    if (!jet || Math.hypot(jet.pos.x - s.x, jet.pos.z - s.z) > s.range) return `P2: JET OUT OF ${s.name} RANGE`;
    if (!ts.launch(s, jet, guided)) return 'P2: SKY FULL';
    this.cd = P2_FIRE_GAP;
    return `P2: ${s.name} FIRES ${guided ? 'GUIDED' : 'UNGUIDED'}`;
  }

  /** main.py:2575-2579 what the HUD shows by the picked launcher */
  status(jet: Vector3): string {
    const s = this.sel;
    if (!s) return '';
    const inRange = Math.hypot(jet.x - s.x, jet.z - s.z) <= s.range;
    const st = inRange ? (this.cd === 0 && s.missiles > 0 ? 'READY' : 'RELOADING') : 'OUT OF RANGE';
    return `P2  ${s.name}  ${s.missiles}  ${st}`;
  }
}
