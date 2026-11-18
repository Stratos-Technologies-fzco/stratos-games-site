import Phaser from 'phaser';
import { Footprint, gridToScreen, depthKey } from '../iso/grid';
import { OccupancyMap } from '../iso/occupancy';
import { validatePlacement } from '../iso/placement';

/** Green/red ghost footprint: one place_ok / place_bad diamond per cell, driven by validatePlacement(). */
export class PlacementPreview {
  private pool: Phaser.GameObjects.Image[] = [];
  constructor(private scene: Phaser.Scene, private occ: OccupancyMap, private isBuildable: (gx: number, gy: number) => boolean) {}

  show(gx: number, gy: number, fp: Footprint, ignoreId?: string) {
    const res = validatePlacement(this.occ, gx, gy, fp, this.isBuildable, ignoreId);
    res.cells.forEach((c, i) => {
      let img = this.pool[i];
      if (!img) {
        img = this.scene.add.image(0, 0, 'atlas_terrain', 'place_ok');
        this.pool[i] = img;
      }
      const p = gridToScreen(c.gx, c.gy);
      img.setFrame(c.ok ? 'place_ok' : 'place_bad').setOriginFromFrame().setPosition(p.x, p.y)
        .setDepth(depthKey(c.gx, c.gy, undefined, 9) + 100000).setAlpha(0.85).setVisible(true);
    });
    for (let i = res.cells.length; i < this.pool.length; i++) this.pool[i].setVisible(false);
    return res;
  }

  hide() { this.pool.forEach((i) => i.setVisible(false)); }
}
