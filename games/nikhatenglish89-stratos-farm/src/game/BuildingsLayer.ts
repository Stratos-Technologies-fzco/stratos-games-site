import Phaser from 'phaser';
import { depthKey, gridToScreen } from '../iso/grid';
import { OccupancyMap } from '../iso/occupancy';
import { BUILDING_BY_ID } from '../services/data';
import { animalStatus } from '../services/types';
import { useFarm } from '../state/store';
import { bus } from './eventBus';
import { farm } from './controller';
import { PlacementPreview } from './PlacementPreview';

const OBJECT_LAYER = 10;
// where animals stand inside a 2x2 pen (fractions of a tile from the footprint's top corner)
const SLOTS: [number, number][] = [[0.5, 0.5], [1.5, 0.5], [0.5, 1.5], [1.5, 1.5], [1.0, 0.3], [0.3, 1.0], [1.7, 1.0], [1.0, 1.7]];

interface BuildingSprite { img: Phaser.GameObjects.Image; bubble: Phaser.GameObjects.Image; type: string; gx: number; gy: number; frameIdx: number }
interface AnimalSprite {
  img: Phaser.GameObjects.Image; type: string; buildingId: string; slot: number;
  fx: number; fy: number; eatUntil: number; nextWalk: number; walking: boolean;
}

/** Player-built habitats and factories, their animals and the placement ghost. Reads the store, never changes game state. */
export class BuildingsLayer {
  private buildings = new Map<string, BuildingSprite>();
  private animals = new Map<string, AnimalSprite>();
  private preview: PlacementPreview;
  private ghost: Phaser.GameObjects.Image | null = null;
  private placingType: string | null = null;
  ghostCell: { gx: number; gy: number } | null = null;

  constructor(private scene: Phaser.Scene, private occ: OccupancyMap, private isBuildable: (gx: number, gy: number) => boolean) {
    this.preview = new PlacementPreview(scene, occ, isBuildable, 1_000_000);
  }

  /** Which building owns this sprite (for tap handling). */
  idOf(obj: Phaser.GameObjects.GameObject): string | null {
    for (const [id, b] of this.buildings) if (b.img === obj) return id;
    return null;
  }

  // ---------- state -> sprites ----------
  sync() {
    const st = useFarm.getState();
    for (const b of st.buildings) {
      if (this.buildings.has(b.id)) continue;
      const def = BUILDING_BY_ID.get(b.type)!;
      this.occ.place(b.id, b.gx, b.gy, { w: def.w, h: def.h });
      const p = gridToScreen(b.gx, b.gy);
      const depth = depthKey(b.gx, b.gy, { w: def.w, h: def.h }, OBJECT_LAYER);
      const img = this.scene.add.image(p.x, p.y, def.atlas, def.frames[0]).setOriginFromFrame().setDepth(depth)
        .setInteractive({ pixelPerfect: true, alphaTolerance: 20, useHandCursor: true });
      const bubble = this.scene.add.image(p.x, p.y - img.displayOriginY + 40, 'atlas_ui_fx', 'ready_bubble').setOrigin(0.5, 1).setDepth(depth + 500).setVisible(false);
      this.scene.tweens.add({ targets: bubble, y: bubble.y - 8, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.buildings.set(b.id, { img, bubble, type: b.type, gx: b.gx, gy: b.gy, frameIdx: 0 });
      // pop in
      img.setScale(0.8); this.scene.tweens.add({ targets: img, scale: 1, duration: 280, ease: 'Back.easeOut' });
    }
    for (const a of st.animals) {
      if (this.animals.has(a.id)) continue;
      const home = this.buildings.get(a.buildingId);
      if (!home) continue;
      const slot = st.animals.filter((x) => x.buildingId === a.buildingId).findIndex((x) => x.id === a.id);
      const [fx, fy] = SLOTS[slot % SLOTS.length];
      const img = this.scene.add.image(0, 0, 'atlas_animals', `${a.type}_idle_0`).setOriginFromFrame();
      const s: AnimalSprite = { img, type: a.type, buildingId: a.buildingId, slot, fx, fy, eatUntil: 0, nextWalk: this.scene.time.now + 2000 + Math.random() * 4000, walking: false };
      this.animals.set(a.id, s);
      this.placeAnimal(s);
    }
    this.refresh();
  }

  private placeAnimal(a: AnimalSprite) {
    const home = this.buildings.get(a.buildingId);
    if (!home) return;
    const p = gridToScreen(home.gx + a.fx, home.gy + a.fy);
    a.img.setPosition(p.x, p.y).setDepth(depthKey(home.gx, home.gy, { w: 2, h: 2 }, OBJECT_LAYER) + 20 + Math.floor((a.fx + a.fy) * 10));
  }

  /** Called once a second: bubbles show when something waits to be collected. */
  refresh() {
    for (const [id, b] of this.buildings) b.bubble.setVisible(farm.buildingReady(id) > 0);
  }

  /** Called every ~450 ms: windmill sails, animal idle / eat / wander frames. */
  animate(now: number) {
    for (const b of this.buildings.values()) {
      const def = BUILDING_BY_ID.get(b.type)!;
      if (def.frames.length > 1) { b.frameIdx = (b.frameIdx + 1) % def.frames.length; b.img.setFrame(def.frames[b.frameIdx]).setOriginFromFrame(); }
    }
    const st = useFarm.getState();
    for (const [id, a] of this.animals) {
      const state = st.animals.find((x) => x.id === id);
      if (!state) continue;
      if (a.walking) { a.img.setFrame(`${a.type}_walk_${Math.floor(now / 300) % 2}`).setOriginFromFrame(); continue; }
      if (now < a.eatUntil) { a.img.setFrame(`${a.type}_eat`).setOriginFromFrame(); continue; }
      a.img.setFrame(`${a.type}_idle_${(Math.floor(now / 600) + a.slot) % 2}`).setOriginFromFrame();
      if (now > a.nextWalk && animalStatus(state, farm.now()) !== 'ready') this.wander(a);
    }
  }

  private wander(a: AnimalSprite) {
    const nx = Phaser.Math.Clamp(a.fx + (Math.random() - 0.5) * 0.9, 0.35, 1.65);
    const ny = Phaser.Math.Clamp(a.fy + (Math.random() - 0.5) * 0.9, 0.35, 1.65);
    const home = this.buildings.get(a.buildingId)!;
    const from = gridToScreen(home.gx + a.fx, home.gy + a.fy), to = gridToScreen(home.gx + nx, home.gy + ny);
    a.walking = true;
    a.img.setFlipX(to.x > from.x); // animals face down-left; flip for down-right
    this.scene.tweens.add({
      targets: a.img, x: to.x, y: to.y, duration: 1400, ease: 'Sine.easeInOut',
      onComplete: () => { a.fx = nx; a.fy = ny; a.walking = false; a.nextWalk = this.scene.time.now + 3000 + Math.random() * 5000; this.placeAnimal(a); },
    });
  }

  /** The animals in this habitat munch for a moment. */
  feed(habitatId: string) {
    for (const a of this.animals.values()) if (a.buildingId === habitatId) a.eatUntil = this.scene.time.now + 2500;
  }

  // ---------- placement mode ----------
  startPlacing(type: string) {
    this.endPlacing();
    this.placingType = type;
    const def = BUILDING_BY_ID.get(type)!;
    this.ghost = this.scene.add.image(0, 0, def.atlas, def.frames[0]).setOriginFromFrame().setAlpha(0.6).setDepth(900_000).setVisible(false);
  }

  get placing() { return this.placingType !== null; }

  moveGhost(gx: number, gy: number) {
    if (!this.placingType || !this.ghost) return;
    const def = BUILDING_BY_ID.get(this.placingType)!;
    const p = gridToScreen(gx, gy);
    this.ghost.setPosition(p.x, p.y).setVisible(true);
    this.ghostCell = { gx, gy };
    const res = this.preview.show(gx, gy, { w: def.w, h: def.h });
    bus.emit('place:moved', { gx, gy, valid: res.valid });
  }

  endPlacing() {
    this.placingType = null; this.ghostCell = null;
    this.ghost?.destroy(); this.ghost = null;
    this.preview.hide();
  }
}
