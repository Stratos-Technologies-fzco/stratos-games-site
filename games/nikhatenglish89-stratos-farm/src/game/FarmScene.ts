import Phaser from 'phaser';
import { DEFAULT_ISO, depthKey, gridToScreen, screenToGrid, worldBounds } from '../iso/grid';
import { OccupancyMap } from '../iso/occupancy';
import { bus } from './eventBus';
import { farmLayout as L, isBuildableTile, LayoutObject, terrainFrameAt } from './layout';
import { Manifest } from './assets';
import { PlacementPreview } from './PlacementPreview';
import { useFarm } from '../state/store';
import { farm } from './controller';
import { cropStage } from '../services/types';

const TERRAIN_DEPTH = -1_000_000;
const EDGE_DEPTH = -2_000_000;
const OBJECT_LAYER = 10;
const DRAG_THRESHOLD = 8; // px of movement before a press becomes a pan instead of a tap
const MAX_ZOOM = 2;
const WORLD_PAD = 160;
const TOP_EXTRA = 320; // room above the island for tall buildings and trees

export class FarmScene extends Phaser.Scene {
  private occ!: OccupancyMap;
  private sprites = new Map<string, Phaser.GameObjects.Image[]>();
  private cursors: Phaser.GameObjects.Image[] = [];
  private hover!: Phaser.GameObjects.Image;
  private preview!: PlacementPreview;
  private debug = false;
  private water: { img: Phaser.GameObjects.Image; frames: string[]; gx: number; gy: number }[] = [];
  private minZoom = 0.2;
  private fitZoom = 0.5;
  private userMoved = false;
  private press: { x: number; y: number; dragging: boolean } | null = null;
  private pinchDist = 0;
  private selectedObject: string | null = null;
  private plotSprites = new Map<string, { crop: Phaser.GameObjects.Image; bubble: Phaser.GameObjects.Image; gx: number; gy: number }>();
  private floatPool: Phaser.GameObjects.Text[] = [];

  constructor() { super('Farm'); }

  create() {
    this.debug = new URLSearchParams(location.search).has('debug');
    this.occ = new OccupancyMap(L.cols, L.rows);
    this.buildTerrain();
    this.buildObjects();
    this.hover = this.add.image(0, 0, 'atlas_terrain', 'cursor_hover').setOriginFromFrame().setVisible(false).setAlpha(0.7);
    this.preview = new PlacementPreview(this, this.occ, (gx, gy) => isBuildableTile(L, gx, gy));
    this.setupCamera();
    this.setupInput();
    this.scale.on('resize', () => this.onResize());
    this.time.addEvent({ delay: 450, loop: true, callback: () => this.animateWater() });
    bus.on('ui:panelClosed', () => this.clearSelection());
    bus.on('camera:reset', () => this.fitCamera(true));
    this.buildPlots();
    bus.on('farm:changed', ({ plotIds }) => plotIds.forEach((id) => this.renderPlot(id, true)));
    bus.on('fx:float', (e) => this.floatText(e.gx, e.gy, e.lines, e.cropFrame));
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.refreshPlots() });
    if (this.debug) this.exposeDebug();
    // Music is queued after the first rendered frame so the first screen is not delayed.
    this.events.once('postupdate', () => this.queueMusic());
    useFarm.getState().setReady();
  }

  // ---------- world building ----------
  private buildTerrain() {
    for (let gx = 0; gx < L.cols; gx++) for (let gy = 0; gy < L.rows; gy++) {
      const p = gridToScreen(gx, gy);
      if (gy === L.rows - 1) this.add.image(p.x, p.y, 'atlas_terrain', 'edge_left').setOriginFromFrame().setDepth(EDGE_DEPTH);
      if (gx === L.cols - 1) this.add.image(p.x, p.y, 'atlas_terrain', 'edge_right').setOriginFromFrame().setDepth(EDGE_DEPTH);
      const t = terrainFrameAt(L, gx, gy);
      const img = this.add.image(p.x, p.y, 'atlas_terrain', t.frame).setOriginFromFrame().setDepth(TERRAIN_DEPTH + depthKey(gx, gy));
      if (t.animate) this.water.push({ img, frames: t.animate, gx, gy });
    }
  }

  private buildObjects() {
    for (const o of L.objects) {
      if (!this.occ.place(o.id, o.gx, o.gy, { w: o.w, h: o.h })) {
        console.warn(`[layout] ${o.id} overlaps something or is out of bounds; skipped`);
        continue;
      }
      const list: Phaser.GameObjects.Image[] = [];
      if (o.kind === 'field') {
        // soil comes from the terrain layer; crops are drawn from farm state in buildPlots()
      } else {
        const p = gridToScreen(o.gx, o.gy);
        const img = this.add.image(p.x, p.y, o.atlas!, o.frame!).setOriginFromFrame().setDepth(depthKey(o.gx, o.gy, { w: o.w, h: o.h }, OBJECT_LAYER));
        if (o.interactive) img.setInteractive({ pixelPerfect: true, alphaTolerance: 20, useHandCursor: true });
        list.push(img);
      }
      this.sprites.set(o.id, list);
    }
  }

  // ---------- crops (drawn from farm state, never from the layout) ----------
  private buildPlots() {
    for (const p of useFarm.getState().plots) {
      const s = gridToScreen(p.gx, p.gy);
      const depth = depthKey(p.gx, p.gy, undefined, OBJECT_LAYER);
      const crop = this.add.image(s.x, s.y, 'atlas_crops', 'wheat_0').setOriginFromFrame().setDepth(depth).setVisible(false);
      const bubble = this.add.image(s.x, s.y - 4, 'atlas_ui_fx', 'ready_bubble').setOrigin(0.5, 1).setDepth(depth + 500).setVisible(false);
      this.tweens.add({ targets: bubble, y: bubble.y - 8, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.plotSprites.set(p.id, { crop, bubble, gx: p.gx, gy: p.gy });
    }
  }

  private renderPlot(id: string, pop = false) {
    const sp = this.plotSprites.get(id);
    const plot = useFarm.getState().plots.find((p) => p.id === id);
    if (!sp || !plot) return;
    const stage = cropStage(plot, farm.now());
    if (stage === null) { sp.crop.setVisible(false); sp.bubble.setVisible(false); return; }
    const frame = `${plot.cropId}_${stage}`;
    const changed = sp.crop.frame.name !== frame || !sp.crop.visible;
    sp.crop.setFrame(frame).setOriginFromFrame().setVisible(true);
    sp.bubble.setVisible(stage === 3);
    if (pop && changed) {
      sp.crop.setScale(0.6);
      this.tweens.add({ targets: sp.crop, scale: 1, duration: 260, ease: 'Back.easeOut' });
    }
  }

  private refreshPlots() { for (const id of this.plotSprites.keys()) this.renderPlot(id); }

  /** Rising "+2 wheat / +1 XP" text (pooled) with a little crop icon that flies up and fades. */
  private floatText(gx: number, gy: number, lines: string[], cropFrame?: string) {
    const p = gridToScreen(gx, gy);
    const depth = 900_000;
    if (cropFrame) {
      const icon = this.add.image(p.x, p.y, 'atlas_crops', cropFrame).setOriginFromFrame().setDepth(depth).setScale(0.8);
      this.tweens.add({ targets: icon, y: p.y - 90, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => icon.destroy() });
    }
    lines.forEach((line, i) => {
      let t = this.floatPool.find((x) => !x.visible);
      if (!t) {
        t = this.add.text(0, 0, '', { fontFamily: 'Trebuchet MS, Segoe UI, sans-serif', fontStyle: 'bold', fontSize: '26px', color: '#ffffff', stroke: '#3b2a1e', strokeThickness: 5 }).setOrigin(0.5);
        this.floatPool.push(t);
      }
      t.setText(line).setColor(line.startsWith('-') ? '#ffd2c2' : line.includes('XP') ? '#ffe36b' : '#ffffff')
        .setPosition(p.x, p.y - 30 - i * 30).setAlpha(1).setVisible(true).setDepth(depth + 1);
      this.tweens.add({ targets: t, y: t.y - 70, alpha: 0, duration: 1100, delay: i * 120, ease: 'Cubic.easeOut', onComplete: () => t!.setVisible(false) });
    });
  }

  private animateWater() {
    for (const w of this.water) {
      const i = Math.floor(this.time.now / 450 + w.gx + w.gy) % w.frames.length;
      w.img.setFrame(w.frames[i]).setOriginFromFrame();
    }
  }

  private queueMusic() {
    const m = this.cache.json.get('manifest') as Manifest | undefined;
    if (!m) return;
    for (const a of m.audio.music) this.load.audio(a.key, a.urls);
    this.load.start();
  }

  // ---------- camera ----------
  private setupCamera() {
    const b = worldBounds(L.cols, L.rows, DEFAULT_ISO, WORLD_PAD);
    this.cameras.main.setBounds(b.x, b.y - TOP_EXTRA, b.width, b.height + TOP_EXTRA);
    this.cameras.main.setBackgroundColor('#7ec8ee');
    this.fitCamera(true);
  }

  private computeFit() {
    const cam = this.cameras.main;
    const b = worldBounds(L.cols, L.rows, DEFAULT_ISO, 40);
    const fit = Math.min(cam.width / b.width, cam.height / (b.height + 200));
    this.fitZoom = fit;
    this.minZoom = Math.max(0.12, fit * 0.8);
  }

  /** Centre the island. In portrait the island would be tiny, so start closer and let the player pan. */
  private fitCamera(reset: boolean) {
    this.computeFit();
    const cam = this.cameras.main;
    const portrait = cam.height > cam.width;
    const z = Phaser.Math.Clamp(portrait ? Math.max(this.fitZoom, 0.5) : this.fitZoom, this.minZoom, MAX_ZOOM);
    cam.setZoom(z);
    const c = gridToScreen(L.cols / 2, L.rows / 2);
    cam.centerOn(c.x, c.y - 60);
    if (reset) this.userMoved = false;
  }

  private onResize() {
    this.computeFit();
    const cam = this.cameras.main;
    if (!this.userMoved) this.fitCamera(false);
    else cam.setZoom(Phaser.Math.Clamp(cam.zoom, this.minZoom, MAX_ZOOM));
  }

  private screenToWorld(sx: number, sy: number) {
    const cam = this.cameras.main;
    return { x: (sx - cam.width / 2) / cam.zoom + cam.scrollX + cam.width / 2, y: (sy - cam.height / 2) / cam.zoom + cam.scrollY + cam.height / 2 };
  }

  private zoomAt(sx: number, sy: number, zoom: number) {
    const cam = this.cameras.main;
    const before = this.screenToWorld(sx, sy);
    cam.setZoom(Phaser.Math.Clamp(zoom, this.minZoom, MAX_ZOOM));
    const after = this.screenToWorld(sx, sy);
    cam.scrollX += before.x - after.x;
    cam.scrollY += before.y - after.y;
    this.userMoved = true;
  }

  // ---------- input ----------
  private setupInput() {
    this.input.addPointer(1); // second finger for pinch
    const cam = this.cameras.main;

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.input.pointer2.isDown && this.input.pointer1.isDown) { this.press = null; this.pinchDist = this.pinchDistance(); return; }
      this.press = { x: p.x, y: p.y, dragging: false };
    });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const p1 = this.input.pointer1, p2 = this.input.pointer2;
      if (p1.isDown && p2.isDown) { // pinch zoom
        const d = this.pinchDistance();
        if (this.pinchDist > 0 && d > 0) this.zoomAt((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, cam.zoom * (d / this.pinchDist));
        this.pinchDist = d;
        return;
      }
      if (this.press && p.isDown) {
        const moved = Phaser.Math.Distance.Between(p.x, p.y, this.press.x, this.press.y);
        if (this.press.dragging || moved > DRAG_THRESHOLD) {
          this.press.dragging = true; this.userMoved = true;
          cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
          cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
          this.hover.setVisible(false);
        }
        return;
      }
      if (!p.isDown && p.event && (p.event as PointerEvent).pointerType !== 'touch') this.updateHover(p);
    });

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      this.pinchDist = 0;
      const press = this.press; this.press = null;
      if (!press || press.dragging) return;
      this.handleTap(p);
    });

    this.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      this.zoomAt(p.x, p.y, cam.zoom * (dy > 0 ? 0.9 : 1.1));
    });
  }

  private pinchDistance() {
    const a = this.input.pointer1, b = this.input.pointer2;
    return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
  }

  private tileAt(p: Phaser.Input.Pointer) {
    const w = this.screenToWorld(p.x, p.y);
    const c = screenToGrid(w.x, w.y);
    return this.occ.inBounds(c.gx, c.gy) ? c : null;
  }

  private updateHover(p: Phaser.Input.Pointer) {
    const c = this.tileAt(p);
    if (!c) { this.hover.setVisible(false); this.preview.hide(); return; }
    const s = gridToScreen(c.gx, c.gy);
    this.hover.setPosition(s.x, s.y).setDepth(depthKey(c.gx, c.gy) + 5).setVisible(true);
    if (this.debug) { this.hover.setVisible(false); this.preview.show(c.gx, c.gy, { w: 2, h: 2 }); }
  }

  private handleTap(p: Phaser.Input.Pointer) {
    // Pixel-accurate hit on interactive buildings (roofs sit far above their footprint), then fall back to the tile.
    const hits = this.input.hitTestPointer(p) as Phaser.GameObjects.Image[];
    let objectId: string | null = null;
    if (hits.length) {
      const top = hits.reduce((a, b) => (b.depth > a.depth ? b : a));
      for (const [id, list] of this.sprites) if (list.includes(top)) objectId = id;
    }
    const tile = this.tileAt(p);
    if (!objectId && tile) {
      const occ = this.occ.occupantAt(tile.gx, tile.gy);
      if (occ && L.objects.find((o) => o.id === occ)?.interactive) objectId = occ;
    }
    if (objectId) { this.selectObject(objectId); return; }
    if (!tile) { this.clearSelection(); bus.emit('selection:cleared'); return; }
    this.selectTile(tile.gx, tile.gy);
    const occ = this.occ.occupantAt(tile.gx, tile.gy);
    if (occ && L.objects.find((o) => o.id === occ)?.kind === 'field') {
      bus.emit('plot:tapped', { plotId: `${tile.gx},${tile.gy}`, gx: tile.gx, gy: tile.gy });
    }
  }

  // ---------- selection ----------
  private clearCursors() { this.cursors.forEach((c) => c.destroy()); this.cursors = []; }

  private clearSelection() {
    this.clearCursors();
    if (this.selectedObject) {
      this.sprites.get(this.selectedObject)?.forEach((s) => this.tweens.killTweensOf(s));
      this.selectedObject = null;
    }
  }

  private selectTile(gx: number, gy: number) {
    this.clearSelection();
    const s = gridToScreen(gx, gy);
    this.cursors.push(this.add.image(s.x, s.y, 'atlas_terrain', 'cursor_select').setOriginFromFrame().setDepth(depthKey(gx, gy) + 5));
    const occ = this.occ.occupantAt(gx, gy) ?? null;
    bus.emit('tile:selected', { gx, gy, terrain: terrainFrameAt(L, gx, gy).frame, objectId: occ });
  }

  private selectObject(id: string) {
    this.clearSelection();
    const o = L.objects.find((x) => x.id === id) as LayoutObject;
    this.selectedObject = id;
    for (let dx = 0; dx < o.w; dx++) for (let dy = 0; dy < o.h; dy++) {
      const s = gridToScreen(o.gx + dx, o.gy + dy);
      this.cursors.push(this.add.image(s.x, s.y, 'atlas_terrain', 'cursor_select').setOriginFromFrame().setDepth(depthKey(o.gx + dx, o.gy + dy) + 1));
    }
    this.sprites.get(id)?.forEach((s) => {
      const y0 = s.y;
      this.tweens.add({ targets: s, y: y0 - 6, duration: 110, yoyo: true, ease: 'Sine.easeOut', onComplete: () => { s.y = y0; } });
    });
    bus.emit('tile:selected', { gx: o.gx, gy: o.gy, terrain: terrainFrameAt(L, o.gx, o.gy).frame, objectId: id });
    if (o.interactive) bus.emit('object:selected', { id });
  }

  // ---------- debug (only with ?debug=1) ----------
  private exposeDebug() {
    (window as any).__farm = {
      /** Client (page) coordinates of a tile's centre, for tests. */
      tileClientPos: (gx: number, gy: number) => {
        const cam = this.cameras.main, s = gridToScreen(gx, gy);
        const r = this.game.canvas.getBoundingClientRect();
        const sx = (s.x - cam.scrollX - cam.width / 2) * cam.zoom + cam.width / 2;
        const sy = (s.y + 32 - cam.scrollY - cam.height / 2) * cam.zoom + cam.height / 2;
        return { x: r.left + (sx * r.width) / cam.width, y: r.top + (sy * r.height) / cam.height };
      },
      /** Fast-forward service time (debug only). */
      advance: (ms: number) => { farm.service.advance(ms); this.refreshPlots(); },
      zoom: () => this.cameras.main.zoom,
      scroll: () => ({ x: this.cameras.main.scrollX, y: this.cameras.main.scrollY }),
      canvasSize: () => ({ w: this.scale.width, h: this.scale.height }),
    };
  }
}
