import Phaser from 'phaser';
import { depthKey, gridToScreen } from '../iso/grid';
import { OccupancyMap } from '../iso/occupancy';
import { OBSTACLE_TYPE_BY_ID } from '../services/data';
import { useFarm } from '../state/store';
import { farmLayout, obstacleList, placedAt } from './layout';
import { effectsOn } from './fx';

const OBJECT_LAYER = 10;

/** Rocks, trees and bushes that can be cleared. Draws what is in the world right now and removes what has been cleared. */
export class ObstaclesLayer {
  private all = obstacleList(farmLayout);
  private sprites = new Map<string, Phaser.GameObjects.Image>();
  private first = true;
  private at = new Map<string, { gx: number; gy: number }>();

  constructor(private scene: Phaser.Scene, private occ: OccupancyMap) {}

  has(id: string) { return this.all.some((o) => o.id === id); }

  spriteOf(id: string) { return this.sprites.get(id); }

  idOf(obj: Phaser.GameObjects.GameObject): string | null {
    for (const [id, s] of this.sprites) if (s === obj) return id;
    return null;
  }

  /** Which obstacles stand in the world now: not cleared, and for a lot, only once the lot is cleared. */
  active() {
    const st = useFarm.getState();
    return this.all.filter((o) => !st.clearedObstacles.includes(o.id) && (!o.lot || st.expanded.includes(o.lot))).map((o) => placedAt(o, st.moved)); // where they stand now
  }

  sync() {
    const now = new Set(this.active().map((o) => o.id));
    for (const [id, s] of [...this.sprites]) {
      if (now.has(id)) continue;
      this.occ.remove(id);
      this.at.delete(id);
      this.sprites.delete(id);
      this.poof(s);
    }
    for (const o of this.active()) {
      const have = this.sprites.get(o.id);
      if (have) {                                   // moved by the player: carry the sprite and its spot over
        const at = this.at.get(o.id);
        if (at && (at.gx !== o.gx || at.gy !== o.gy)) {
          this.occ.remove(o.id); this.occ.place(o.id, o.gx, o.gy, { w: 1, h: 1 });
          const p = gridToScreen(o.gx, o.gy);
          have.setPosition(p.x, p.y).setDepth(depthKey(o.gx, o.gy, undefined, OBJECT_LAYER));
          this.at.set(o.id, { gx: o.gx, gy: o.gy });
        }
        continue;
      }
      const t = OBSTACLE_TYPE_BY_ID.get(o.type);
      if (!t) continue;
      this.occ.place(o.id, o.gx, o.gy, { w: 1, h: 1 });
      const p = gridToScreen(o.gx, o.gy);
      const img = this.scene.add.image(p.x, p.y, 'atlas_decor', t.frame).setOriginFromFrame().setDepth(depthKey(o.gx, o.gy, undefined, OBJECT_LAYER))
        .setInteractive({ pixelPerfect: true, alphaTolerance: 20, useHandCursor: true });
      this.sprites.set(o.id, img);
      this.at.set(o.id, { gx: o.gx, gy: o.gy });
      if (!this.first && effectsOn()) { img.setScale(0.7); this.scene.tweens.add({ targets: img, scale: 1, duration: 300, ease: 'Back.easeOut' }); }
    }
    this.first = false;
  }

  /** A cleared obstacle shrinks away with a puff of dust. */
  private poof(img: Phaser.GameObjects.Image) {
    img.disableInteractive();
    if (!effectsOn()) { img.destroy(); return; }
    const dust = this.scene.add.image(img.x, img.y, 'atlas_ui_fx', 'dust_1').setOriginFromFrame().setDepth(img.depth + 1);
    this.scene.tweens.add({ targets: dust, alpha: 0, y: dust.y - 20, scale: 1.6, duration: 600, onComplete: () => dust.destroy() });
    this.scene.tweens.add({ targets: img, scale: 0, alpha: 0, duration: 350, onComplete: () => img.destroy() });
  }
}
