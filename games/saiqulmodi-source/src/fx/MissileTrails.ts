// The full flight path of every missile in the air (main.py:1083 a SAM's trajectory; main.py:1153 the jet's
// AGM / AAM): a ribbon from the launcher to wherever the missile is now, kept for the whole flight and fading
// over 15 s after it (main.py:1083 life 900). Colours from main.py: guided (236,232,224), unguided
// (206,196,176), AGM (255,214,150), AAM (170,230,255). A fixed pool of ribbons, reused.
import type { Scene, Vector3 } from 'three';
import { SAM_LIFE_FRAMES } from '../config';
import { Ribbon, type RibbonStyle } from './Ribbon';

const POOL = 16;
const COLORS = {
  guided: [236 / 255, 232 / 255, 224 / 255] as [number, number, number],
  unguided: [206 / 255, 196 / 255, 176 / 255] as [number, number, number],
  AGM: [255 / 255, 214 / 255, 150 / 255] as [number, number, number],
  AAM: [170 / 255, 230 / 255, 255 / 255] as [number, number, number],
};
const STYLE: RibbonStyle = {
  points: 520,
  spacing: 45, // m (a 40 s, 22 km flight fits)
  life: SAM_LIFE_FRAMES + 900, // the whole flight, then main.py's 900-frame fade
  width: 3,
  widthOld: 16,
  color: COLORS.guided,
  alpha: 0.8,
  minAngular: 0.0032, // ~3 px wide at any distance
};

/** anything in flight with a trail */
export interface TrailOwner {
  active: boolean;
  pos: Vector3;
  age: number;
}

interface Slot {
  ribbon: Ribbon;
  owner: TrailOwner | null;
  lastAge: number;
}

export class MissileTrails {
  private slots: Slot[] = [];

  constructor(scene: Scene) {
    for (let i = 0; i < POOL; i++) {
      const r = new Ribbon(STYLE);
      scene.add(r.mesh);
      this.slots.push({ ribbon: r, owner: null, lastAge: 0 });
    }
  }

  clear(): void {
    for (const s of this.slots) {
      s.owner = null;
      s.ribbon.clear();
    }
  }

  /** One 60 Hz frame: each flying thing records its position into its own ribbon. */
  track(o: TrailOwner, color: 'guided' | 'unguided' | 'AGM' | 'AAM', frame: number): void {
    let slot: Slot | null = null;
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i];
      if (s.owner === o) {
        // a pooled missile reused for a new flight starts a new path
        if (o.age < s.lastAge) s.owner = null;
        else slot = s;
        break;
      }
    }
    if (!slot) {
      // a free ribbon: unowned and faded; else the unowned one that faded the most
      let best: Slot | null = null;
      for (let i = 0; i < this.slots.length; i++) {
        const s = this.slots[i];
        if (s.owner) continue;
        if (!best || s.ribbon.lastFrame < best.ribbon.lastFrame) best = s;
        if (s.ribbon.faded(frame)) {
          best = s;
          break;
        }
      }
      if (!best) return;
      slot = best;
      slot.owner = o;
      slot.ribbon.clear();
      slot.ribbon.setColor(COLORS[color]);
    }
    slot.lastAge = o.age;
    slot.ribbon.record(o.pos, frame);
  }

  /** After the frame's tracking: owners that ended let their ribbon fade on its own. */
  release(): void {
    for (const s of this.slots) if (s.owner && !s.owner.active) s.owner = null;
  }

  update(cam: Vector3, frame: number, night: number): void {
    const dim = 1 - 0.75 * night;
    for (const s of this.slots) s.ribbon.update(cam, frame, dim);
  }
}
