import Phaser from 'phaser';
import { DEFAULT_ISO, depthKey, gridToScreen, rectBounds, screenToGrid } from '../iso/grid';
import { OccupancyMap } from '../iso/occupancy';
import { bus } from './eventBus';
import { farmLayout as L, fieldAtCell, isBuildableTile, landBox, landState, LayoutObject, lockedExpansionAt, placedAt, terrainFrameAt } from './layout';
import { OBSTACLE_TYPE_BY_ID } from '../services/data';
import { PlacementPreview } from './PlacementPreview';
import { useFarm } from '../state/store';
import { farm } from './controller';
import { cropStage } from '../services/types';
import { BuildingsLayer } from './BuildingsLayer';
import { ObstaclesLayer } from './ObstaclesLayer';
import { initAudio } from './audio';
import { effectsOn } from './fx';
import { watchFrameRate } from './perf';

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
  private tiles = new Map<string, Phaser.GameObjects.Image>();
  private edges: Phaser.GameObjects.Image[] = [];
  private landKey = '';
  private land = new Set<string>();
  private minZoom = 0.2;
  private fitZoom = 0.5;
  private userMoved = false;
  private press: { x: number; y: number; dragging: boolean } | null = null;
  private pinchDist = 0;
  private selectedObject: string | null = null;
  private plotSprites = new Map<string, { crop: Phaser.GameObjects.Image; bubble: Phaser.GameObjects.Image; gx: number; gy: number }>();
  private floatPool: Phaser.GameObjects.Text[] = [];
  private recentFloats: { x: number; y: number; until: number }[] = [];
  private layer!: BuildingsLayer;
  private obstacles!: ObstaclesLayer;
  private movedKey = '{}';
  private moving: { id: string; w: number; h: number; ghost: Phaser.GameObjects.Image | null; dim: Phaser.GameObjects.Image | null } | null = null;

  constructor() { super('Farm'); }

  create() {
    this.debug = new URLSearchParams(location.search).has('debug');
    this.occ = new OccupancyMap(L.cols, L.rows);
    this.buildTerrain();
    this.buildObjects();
    this.hover = this.add.image(0, 0, 'atlas_terrain', 'cursor_hover').setOriginFromFrame().setVisible(false).setAlpha(0.7);
    this.preview = new PlacementPreview(this, this.occ, (gx, gy) => isBuildableTile(L, gx, gy, useFarm.getState().expanded, useFarm.getState().moved));
    this.setupCamera();
    this.setupInput();
    this.scale.on('resize', () => this.onResize());
    this.time.addEvent({ delay: 450, loop: true, callback: () => this.animateWater() });
    bus.on('ui:panelClosed', () => this.clearSelection());
    bus.on('camera:reset', () => this.fitCamera(true));
    bus.on('camera:focus', ({ gx, gy }) => {
      const p = gridToScreen(gx + 1, gy + 1), cam = this.cameras.main;
      this.userMoved = true;
      this.zoomAt(cam.width / 2, cam.height / 2, Math.max(cam.zoom, 0.9));
      cam.pan(p.x, p.y - 40, effectsOn() ? 600 : 0, 'Sine.easeInOut');
    });
    this.buildPlots();
    this.layer = new BuildingsLayer(this, this.occ, (gx, gy) => isBuildableTile(L, gx, gy, useFarm.getState().expanded, useFarm.getState().moved));
    this.layer.sync();
    this.obstacles = new ObstaclesLayer(this, this.occ);
    this.obstacles.sync();
    bus.on('place:flip', ({ flip }) => this.layer.setGhostFlip(flip));
    bus.on('farm:changed', ({ plotIds }) => { this.syncStatics(); plotIds.forEach((id) => this.renderPlot(id, true)); this.refreshTerrain(); this.layer.sync(); this.obstacles.sync(); });
    bus.on('objmove:start', ({ id }) => this.startMoving(id));
    bus.on('fx:feed', ({ habitatId }) => this.layer.feed(habitatId));
    bus.on('place:start', ({ type, moveId, at }) => {
      this.clearSelection();
      this.layer.startPlacing(type, moveId);
      if (at) this.layer.moveGhost(at.gx, at.gy); // a spot was already selected: the ghost starts there
    });
    bus.on('place:end', () => { this.layer.endPlacing(); this.endMoving(); });
    this.time.addEvent({ delay: 450, loop: true, callback: () => this.layer.animate(this.time.now) });
    bus.on('fx:float', (e) => this.floatText(e.gx, e.gy, e.lines, e.cropFrame));
    this.time.addEvent({ delay: 1000, loop: true, callback: () => { this.refreshPlots(); this.layer.refresh(); } });
    if (this.debug) this.exposeDebug();
    // Sound stays off and is not even downloaded until the player turns it on in Settings.
    initAudio(this);
    watchFrameRate(this);
    this.setupKeyboard();
    useFarm.getState().setReady();
  }

  // ---------- world building ----------
  /** Draw every tile that is land right now (the island, cleared lots, lots for sale); open sea draws nothing. */
  private buildTerrain() { this.syncTerrain(true); }

  private syncTerrain(first = false) {
    const { expanded, moved } = useFarm.getState();
    const key = expanded.join(',') + '|' + JSON.stringify(moved);
    if (!first && key === this.landKey) return;
    this.landKey = key;
    this.land.clear();
    for (let gx = 0; gx < L.cols; gx++) for (let gy = 0; gy < L.rows; gy++) {
      const t = terrainFrameAt(L, gx, gy, expanded, moved);
      if (!t.frame) continue;
      this.land.add(`${gx},${gy}`);
      const k = `${gx},${gy}`, have = this.tiles.get(k);
      if (!have) {
        const p = gridToScreen(gx, gy);
        const img = this.add.image(p.x, p.y, 'atlas_terrain', t.frame).setOriginFromFrame().setDepth(TERRAIN_DEPTH + depthKey(gx, gy));
        this.tiles.set(k, img);
        if (t.animate) this.water.push({ img, frames: t.animate, gx, gy });
        if (!first && effectsOn()) this.tweens.add({ targets: img, alpha: { from: 0.2, to: 1 }, duration: 500 });
      } else if (have.frame.name !== t.frame && !t.animate) {
        have.setFrame(t.frame).setOriginFromFrame();
        if (effectsOn()) this.tweens.add({ targets: have, alpha: { from: 0.4, to: 1 }, duration: 400 });
      }
    }
    // the cliff sides of the land: wherever the next tile down-left / down-right is open sea
    this.edges.forEach((e) => e.destroy());
    this.edges = [];
    for (const k of this.land) {
      const [gx, gy] = k.split(',').map(Number);
      const p = gridToScreen(gx, gy);
      if (!this.land.has(`${gx},${gy + 1}`)) this.edges.push(this.add.image(p.x, p.y, 'atlas_terrain', 'edge_left').setOriginFromFrame().setDepth(EDGE_DEPTH));
      if (!this.land.has(`${gx + 1},${gy}`)) this.edges.push(this.add.image(p.x, p.y, 'atlas_terrain', 'edge_right').setOriginFromFrame().setDepth(EDGE_DEPTH));
    }
    if (!first) this.updateBounds();
  }

  private buildObjects() {
    const moved = useFarm.getState().moved;
    this.movedKey = JSON.stringify(moved);
    for (const base of L.objects) {
      if (base.clearable) continue; // rocks, trees and bushes are drawn by the obstacles layer
      const o = placedAt(base, moved);
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
        img.setInteractive({ pixelPerfect: true, alphaTolerance: 20, useHandCursor: true });
        list.push(img);
      }
      this.sprites.set(o.id, list);
    }
  }

  /** After the player moves a field, silo, lamp post...: put the sprites, the spots they take and the crops where they stand now. */
  private syncStatics() {
    const moved = useFarm.getState().moved, key = JSON.stringify(moved);
    if (key === this.movedKey) return;
    this.movedKey = key;
    const objs = L.objects.filter((o) => !o.clearable);
    for (const o of objs) this.occ.remove(o.id);
    for (const base of objs) {
      const o = placedAt(base, moved);
      this.occ.place(o.id, o.gx, o.gy, { w: o.w, h: o.h });
      const img = this.sprites.get(o.id)?.[0];
      if (img) { const p = gridToScreen(o.gx, o.gy); img.setPosition(p.x, p.y).setDepth(depthKey(o.gx, o.gy, { w: o.w, h: o.h }, OBJECT_LAYER)); }
    }
    for (const sp of this.plotSprites.values()) { this.tweens.killTweensOf(sp.bubble); sp.crop.destroy(); sp.bubble.destroy(); }
    this.plotSprites.clear();
    this.buildPlots();
    this.refreshPlots();
  }

  // ---------- moving what was already on the farm ----------
  private startMoving(id: string) {
    this.endMoving();
    this.clearSelection();
    const st = useFarm.getState();
    const base = L.objects.find((o) => o.id === id);
    let img: Phaser.GameObjects.Image | undefined = this.sprites.get(id)?.[0];
    let atlas = base?.atlas, frame = base?.frame, w = base?.w ?? 1, h = base?.h ?? 1;
    if (!base || base.clearable) {                         // a rock, tree or bush (the ones in the bought lots are not in the layout file)
      const ob = this.obstacles.active().find((x) => x.id === id);
      if (!ob) return;
      img = this.obstacles.spriteOf(id); atlas = 'atlas_decor'; frame = OBSTACLE_TYPE_BY_ID.get(ob.type)?.frame; w = 1; h = 1;
    }
    void st;
    const ghost = frame && atlas ? this.add.image(0, 0, atlas, frame).setOriginFromFrame().setAlpha(0.6).setDepth(900_000).setVisible(false) : null;
    img?.setAlpha(0.35);
    this.moving = { id, w, h, ghost, dim: img ?? null };
  }

  private moveTo(gx: number, gy: number) {
    const m = this.moving;
    if (!m) return;
    const p = gridToScreen(gx, gy);
    m.ghost?.setPosition(p.x, p.y).setVisible(true);
    const res = this.preview.show(gx, gy, { w: m.w, h: m.h }, m.id);
    const lay = L.objects.find((o) => o.id === m.id) ?? this.obstacles.active().find((o) => o.id === m.id);
    const cur = lay ? placedAt(lay, useFarm.getState().moved) : null;
    const same = !!cur && cur.gx === gx && cur.gy === gy;   // its own spot is free (it is the one standing there) but is not a move
    bus.emit('place:moved', { gx, gy, valid: res.valid && !same, reason: same ? 'same' : res.reason });
  }

  private endMoving() {
    const m = this.moving;
    if (!m) return;
    m.dim?.setAlpha(1); m.ghost?.destroy();
    this.moving = null;
    this.preview.hide();
  }

  // ---------- crops (drawn from farm state, never from the layout) ----------
  private buildPlots() {
    for (const p of useFarm.getState().plots) {
      const s = gridToScreen(p.gx, p.gy);
      const depth = depthKey(p.gx, p.gy, undefined, OBJECT_LAYER);
      const crop = this.add.image(s.x, s.y, 'atlas_crops', 'wheat_0').setOriginFromFrame().setDepth(depth).setVisible(false);
      const bubble = this.add.image(s.x, s.y - 4, 'atlas_ui_fx', 'ready_bubble').setOrigin(0.5, 1).setDepth(depth + 500).setVisible(false);
      this.tweens.add({ targets: bubble, y: bubble.y - 8, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', paused: !effectsOn() });
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
    if (pop && changed && effectsOn()) {
      sp.crop.setScale(0.6);
      this.tweens.add({ targets: sp.crop, scale: 1, duration: 260, ease: 'Back.easeOut' });
    }
  }

  private refreshPlots() { for (const id of this.plotSprites.keys()) this.renderPlot(id); }

  /** Rising "+2 wheat / +1 XP" text (pooled) with a little crop icon that flies up and fades. */
  private floatText(gx: number, gy: number, lines: string[], cropFrame?: string) {
    const p = gridToScreen(gx, gy);
    const depth = 900_000;
    const fancy = effectsOn();
    // several collections at once would print on top of each other: lift new text above any that is still showing nearby
    const now = this.time.now;
    this.recentFloats = this.recentFloats.filter((f) => f.until > now);
    let lift = 0;
    while (this.recentFloats.some((f) => Math.abs(f.x - p.x) < 80 && Math.abs(f.y - (p.y - lift)) < 32 * Math.max(1, lines.length))) lift += 32 * lines.length;
    this.recentFloats.push({ x: p.x, y: p.y - lift, until: now + 900 });
    if (cropFrame && fancy) {
      const icon = this.add.image(p.x, p.y - lift, 'atlas_crops', cropFrame).setOriginFromFrame().setDepth(depth).setScale(0.8);
      this.tweens.add({ targets: icon, y: p.y - lift - 90, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => icon.destroy() });
    }
    lines.forEach((line, i) => {
      let t = this.floatPool.find((x) => !x.visible);
      if (!t) {
        t = this.add.text(0, 0, '', { fontFamily: 'Trebuchet MS, Segoe UI, sans-serif', fontStyle: 'bold', fontSize: '26px', color: '#ffffff', stroke: '#3b2a1e', strokeThickness: 5 }).setOrigin(0.5);
        this.floatPool.push(t);
      }
      t.setText(line).setColor(line.startsWith('-') ? '#ffd2c2' : line.includes('XP') ? '#ffe36b' : '#ffffff')
        .setPosition(p.x, p.y - lift - 30 - i * 30).setAlpha(1).setVisible(true).setDepth(depth + 1);
      if (fancy) {
        this.tweens.add({ targets: t, y: t.y - 70, alpha: 0, duration: 1100, delay: i * 120, ease: 'Cubic.easeOut', onComplete: () => t!.setVisible(false) });
      } else {
        this.time.delayedCall(1000, () => t!.setVisible(false)); // plain: the text just stays a second
      }
    });
  }

  /** Cleared patches turn from locked land into grass, and new lots appear next to them. */
  private refreshTerrain() { this.syncTerrain(); this.refreshLegacyPatches(); }

  /** The hand-placed locked patches inside the island turn into grass when cleared. */
  private refreshLegacyPatches() {
    const expanded = useFarm.getState().expanded;
    for (const e of L.expansions) {
      if (e.id.startsWith('lot_') || !expanded.includes(e.id)) continue;
      for (let gx = e.rect[0]; gx < e.rect[0] + e.rect[2]; gx++) for (let gy = e.rect[1]; gy < e.rect[1] + e.rect[3]; gy++) {
        const img = this.tiles.get(`${gx},${gy}`);
        const f = terrainFrameAt(L, gx, gy, expanded, useFarm.getState().moved).frame;
        if (img && img.frame.name !== f) { img.setFrame(f).setOriginFromFrame(); if (effectsOn()) this.tweens.add({ targets: img, alpha: { from: 0.4, to: 1 }, duration: 400 }); }
      }
    }
  }

  private animateWater() {
    if (!effectsOn()) return;
    for (const w of this.water) {
      const i = Math.floor(this.time.now / 450 + w.gx + w.gy) % w.frames.length;
      w.img.setFrame(w.frames[i]).setOriginFromFrame();
    }
  }

  // ---------- camera ----------
  private setupCamera() {
    this.updateBounds();
    this.cameras.main.setBackgroundColor('#7ec8ee');
    this.fitCamera(true);
  }

  /** The camera may roam over all the land you can see (including lots for sale), plus a margin. */
  private updateBounds() {
    const bx = landBox(L, useFarm.getState().expanded, true);
    const b = rectBounds(bx.minGx, bx.minGy, bx.maxGx, bx.maxGy, DEFAULT_ISO, WORLD_PAD);
    this.cameras.main.setBounds(b.x, b.y - TOP_EXTRA, b.width, b.height + TOP_EXTRA);
  }

  /** The area the player owns (island + cleared lots): what the camera frames when it recentres. */
  private ownedBox() { return landBox(L, useFarm.getState().expanded, false); }

  private computeFit() {
    const cam = this.cameras.main;
    const o = this.ownedBox();
    const b = rectBounds(o.minGx, o.minGy, o.maxGx, o.maxGy, DEFAULT_ISO, 40);
    const fit = Math.min(cam.width / b.width, cam.height / (b.height + 200));
    this.fitZoom = fit;
    this.minZoom = Math.max(0.1, fit * 0.6);
  }

  /** Centre the island. In portrait the island would be tiny, so start closer and let the player pan. */
  private fitCamera(reset: boolean) {
    this.computeFit();
    const cam = this.cameras.main;
    const portrait = cam.height > cam.width;
    const z = Phaser.Math.Clamp(portrait ? Math.max(this.fitZoom, 0.5) : this.fitZoom, this.minZoom, MAX_ZOOM);
    cam.setZoom(z);
    const o = this.ownedBox();
    const c = gridToScreen((o.maxGx + 1) / 2, (o.maxGy + 1) / 2);
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
  /** Keyboard: arrow keys / WASD move the camera, + and - zoom, R recentres (typing in a box is left alone). */
  private setupKeyboard() {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.on('keydown', (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (useFarm.getState().screen !== 'game') return;
      const cam = this.cameras.main, step = 70 / cam.zoom;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') cam.scrollX -= step;
      else if (k === 'arrowright' || k === 'd') cam.scrollX += step;
      else if (k === 'arrowup' || k === 'w') cam.scrollY -= step;
      else if (k === 'arrowdown' || k === 's') cam.scrollY += step;
      else if (k === '+' || k === '=') this.zoomAt(cam.width / 2, cam.height / 2, cam.zoom * 1.15);
      else if (k === '-' || k === '_') this.zoomAt(cam.width / 2, cam.height / 2, cam.zoom / 1.15);
      else if (k === 'r') { this.fitCamera(true); return; }
      else return;
      this.userMoved = true;
    });
  }

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
    return this.occ.inBounds(c.gx, c.gy) && this.land.has(`${c.gx},${c.gy}`) ? c : null;
  }

  private updateHover(p: Phaser.Input.Pointer) {
    const c = this.tileAt(p);
    if (this.layer.placing || this.moving) { this.hover.setVisible(false); return; } // placing: the ghost stays where it was put until the next tap
    if (!c) { this.hover.setVisible(false); this.preview.hide(); return; }
    const s = gridToScreen(c.gx, c.gy);
    this.hover.setPosition(s.x, s.y).setDepth(depthKey(c.gx, c.gy) + 5).setVisible(true);
    if (this.debug) { this.hover.setVisible(false); this.preview.show(c.gx, c.gy, { w: 2, h: 2 }); }
  }

  private handleTap(p: Phaser.Input.Pointer) {
    if (this.moving) { const t = this.tileAt(p); if (t) this.moveTo(t.gx, t.gy); return; }
    if (this.layer.placing) { const t = this.tileAt(p); if (t) this.layer.moveGhost(t.gx, t.gy); return; }
    // Pixel-accurate hit on interactive buildings (roofs sit far above their footprint), then fall back to the tile.
    const hits = this.input.hitTestPointer(p) as Phaser.GameObjects.Image[];
    let objectId: string | null = null;
    if (hits.length) {
      const top = hits.reduce((a, b) => (b.depth > a.depth ? b : a));
      for (const [id, list] of this.sprites) if (list.includes(top)) objectId = id;
    }
    const tile = this.tileAt(p);
    if (objectId && tile) {      // a tall scarecrow or lamp post must not steal a tap meant for the field tile it overlaps on screen
      const hit = L.objects.find((o) => o.id === objectId), under = this.occ.occupantAt(tile.gx, tile.gy);
      if (hit && !hit.interactive && under && L.objects.find((o) => o.id === under)?.kind === 'field') objectId = null;
    }
    if (!objectId && tile) {
      const occ = this.occ.occupantAt(tile.gx, tile.gy);
      const lo = occ ? L.objects.find((o) => o.id === occ) : undefined;
      if (lo && lo.kind !== 'field' && !lo.clearable) objectId = occ!;
    }
    if (!objectId && hits.length) {
      const top = hits.reduce((a, b) => (b.depth > a.depth ? b : a));
      const bid = this.layer.idOf(top);
      if (bid) { this.clearSelection(); bus.emit('building:tapped', { id: bid }); return; }
      const oid = this.obstacles.idOf(top);
      if (oid) { this.clearSelection(); bus.emit('obstacle:tapped', { id: oid }); return; }
    }
    if (!objectId && tile) {
      const occId = this.occ.occupantAt(tile.gx, tile.gy);
      if (occId && this.obstacles.has(occId)) { this.clearSelection(); bus.emit('obstacle:tapped', { id: occId }); return; }
      if (occId && !L.objects.some((o) => o.id === occId) ) { this.clearSelection(); bus.emit('building:tapped', { id: occId }); return; }
    }
    if (objectId) { this.selectObject(objectId); return; }
    if (!tile) { this.clearSelection(); bus.emit('selection:cleared'); return; }
    const lockedEx = lockedExpansionAt(L, tile.gx, tile.gy, useFarm.getState().expanded);
    if (lockedEx) { this.selectTile(tile.gx, tile.gy); bus.emit('expansion:tapped', { id: lockedEx.id }); return; }
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
    const base = L.objects.find((x) => x.id === id) as LayoutObject;
    const o = placedAt(base, useFarm.getState().moved);
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
    bus.emit(o.interactive ? 'object:selected' : 'object:tapped', { id });
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
      ghost: () => this.layer.ghostCell,
      openBuilding: (id: string) => bus.emit('building:tapped', { id }),
      startMove: (id: string) => farm.startMoveObject(id),
      moved: () => useFarm.getState().moved,
      plot: (id: string) => useFarm.getState().plots.find((q) => q.id === id) ?? null,
      obstacles: () => this.obstacles.active().map((o) => ({ id: o.id, gx: o.gx, gy: o.gy })),
    };
  }
}
