import { LocalFarmService, SAVE_KEY, validateSave } from '../services/LocalFarmService';
import { OBSTACLE_TYPE_BY_ID, FEED_ITEM, ANIMALS, ANIMAL_BY_ID, BUILDINGS, BUILDING_BY_ID, CROPS, CROP_BY_ID, ITEM_BY_ID, RECIPES, RECIPE_BY_ID } from '../services/data';
import { animalStatus, cropStage, ErrorCode, FarmSnapshot } from '../services/types';
import { useFarm } from '../state/store';
import { bus } from './eventBus';
import { farmLayout, fieldAtCell, obstacleList, worldConfig } from './layout';
import { QUEST_BY_ID } from '../services/quests';
import { offerCoins, track } from './stratos';
import { playSfx, setMusicTrack } from './audio';
import type { SpeedKind } from '../services/types';

const MESSAGES: Record<ErrorCode, string> = {
  invalid_plot: 'That is not a field',
  unknown_crop: 'Unknown crop',
  not_unlocked: 'That is not unlocked yet',
  insufficient_coins: 'Not enough coins',
  plot_occupied: 'Something is already growing here',
  nothing_planted: 'Nothing is planted here',
  not_ready: 'Not ready yet',
  nothing_ready: 'Nothing is ready yet',
  insufficient_items: 'You are missing something for that',
  bad_request: 'Something went wrong, please try again',
  unknown_building: 'That building is gone',
  invalid_placement: 'You cannot build there',
  wrong_building: 'That does not work here',
  at_capacity: 'This home is full, upgrade it for more room',
  nothing_hungry: 'Everyone is fed already',
  max_level: 'Already at the top level',
  unknown_recipe: 'Unknown recipe',
  queue_full: 'The queue is full, collect or upgrade',
  unknown_order: 'That order is gone',
  unknown_quest: 'That quest is not available',
  not_complete: 'Not finished yet',
  already_claimed: 'Already claimed',
  unknown_expansion: 'Unknown land',
  already_expanded: 'You already own this land',
  not_empty: 'Empty the building first (animals and queued recipes)',
  max_fields: 'You have all the extra plots you can have',
  same_spot: 'Pick a different spot',
  already_ready: 'It is already ready',
  unknown_obstacle: 'That is already cleared',
  unknown_object: 'That is no longer there',
  not_adjacent: 'Clear the land next to your farm first',
};

const newKey = () => (globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);

// the farm sounds that exist; the newer animals borrow a similar one (the rabbit stays quiet)
const ANIMAL_SOUND: Record<string, string> = {
  chicken: 'animal_chicken_cluck', duck: 'animal_duck_quack', cow: 'animal_cow_moo', sheep: 'animal_sheep_baa', goat: 'animal_goat_bleat', pig: 'animal_pig_oink',
  turkey: 'animal_chicken_cluck', horse: 'animal_cow_moo',
};
function animalSound(habitatType?: string): string {
  const animal = habitatType ? BUILDING_BY_ID.get(habitatType)?.animal ?? 'chicken' : 'chicken';
  return ANIMAL_SOUND[animal] ?? '';
}

const WHY: Record<string, string> = {
  occupied: 'Something is already there. Tap a different spot.',
  locked: 'That land is still locked. Tap it first to clear it.',
  out_of_bounds: 'That is outside your farm.',
  unknown: 'You cannot build that.',
};

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

type Collected = { collected: { itemId: string; qty: number }[]; xp: number; levelUp: number | null; snapshot: FarmSnapshot };

/** Glue between the UI/world and the farm service. No React and no Phaser in here. */
class FarmController {
  readonly service = new LocalFarmService(worldConfig(farmLayout));
  private busy = false;

  now() { return this.service.now(); }

  async init() {
    const snap = await this.service.load();
    this.apply(snap);
    if (snap.notice === 'save_reset') useFarm.getState().showToast('Your saved farm could not be read, so you start fresh');
    if (snap.notice === 'save_restored') useFarm.getState().showToast('Your latest save was damaged, so we restored the one before it');
    setInterval(() => useFarm.getState().bumpTick(), 1000);
  }

  private apply(snap: FarmSnapshot, changed?: string[]) {
    const st = useFarm.getState();
    const before = st.farmLoaded ? st.player.level : snap.level;
    st.applySnapshot(snap);
    // Stratos Coins: the site pays once per new level when a game reports level_complete with a level number
    for (let lv = before; lv < snap.level; lv++) track('level_complete', { level: lv });
    if (snap.level > before) { playSfx('jingle_level_up'); setTimeout(() => this.levelUpToast(snap.level), 1500); }
    bus.emit('farm:changed', { plotIds: changed ?? snap.plots.map((p) => p.id) });
  }

  private fail(error: ErrorCode) { useFarm.getState().showToast(MESSAGES[error]); playSfx('ui_error'); }

  /** One action at a time: run the call, show the error or hand the result on. */
  private async act<R extends { ok: boolean }>(call: () => Promise<R>, onOk: (r: Extract<R, { ok: true }>) => void, onFail?: (error: ErrorCode) => void) {
    if (this.busy) return;
    this.busy = true;
    try {
      const r = await call();
      if (!r.ok) { const e = (r as unknown as { error: ErrorCode }).error; this.fail(e); onFail?.(e); return; }
      onOk(r as Extract<R, { ok: true }>);
    } finally { this.busy = false; }
  }

  private float(buildingId: string, lines: string[], cropFrame?: string) {
    const b = useFarm.getState().buildings.find((x) => x.id === buildingId);
    if (b) bus.emit('fx:float', { gx: b.gx + 1, gy: b.gy + 1, lines, cropFrame });
  }

  // ---------- fields ----------
  /** A tap on a field tile: empty -> pick a seed, growing -> show the countdown, ready -> harvest. */
  onPlotTapped(plotId: string) {
    const st = useFarm.getState();
    const plot = st.plots.find((p) => p.id === plotId);
    if (!plot) return;
    if (cropStage(plot, this.now()) === 3) { void this.harvest(plotId); return; }   // ripe crops are always picked
    if (st.plantSeed && !plot.cropId) { void this.plantInMode(plotId, st.plantSeed); return; }
    if (!plot.cropId) { st.setSeedPlot(plotId); return; }
    if (st.plantSeed) {                                                              // planting mode: just say how long it needs
      const crop = CROP_BY_ID.get(plot.cropId)!;
      st.showToast(`${crop.name} ready in ${formatDuration((plot.readyAt ?? 0) - this.now())}`);
      return;
    }
    st.setPlotInfo(plotId);
  }

  /** Pick a crop in the seed list. From a field: plant it there and stay in planting mode. From "Change seed": just switch crops. */
  pickSeed(plotId: string, cropId: string) {
    const st = useFarm.getState();
    if (plotId === '*') { st.setSeedPlot(null); st.setPlantSeed(cropId); return; }
    st.setPlantSeed(cropId);
    return this.plant(plotId, cropId);
  }

  /** One tap on an empty field while a seed is picked: plant it, and stop when the money runs out. */
  private plantInMode(plotId: string, cropId: string) {
    return this.act(() => this.service.plant(plotId, cropId, newKey()), (r) => {
      this.apply(r.snapshot, [plotId]);
      playSfx('plant_seed');
      const plot = r.snapshot.plots.find((p) => p.id === plotId)!;
      bus.emit('fx:float', { gx: plot.gx, gy: plot.gy, lines: [`-${r.cost} coins`] });
    }, (error) => {
      // no coins, or the crop is not unlocked: leave planting mode so the next tap is not another error
      if (error === 'insufficient_coins' || error === 'not_unlocked' || error === 'unknown_crop') useFarm.getState().setPlantSeed(null);
    });
  }

  cancelPlanting() { useFarm.getState().setPlantSeed(null); }

  plant(plotId: string, cropId: string) {
    return this.act(() => this.service.plant(plotId, cropId, newKey()), (r) => {
      useFarm.getState().setSeedPlot(null);
      this.apply(r.snapshot, [plotId]);
      playSfx('plant_seed');
      const plot = r.snapshot.plots.find((p) => p.id === plotId)!;
      bus.emit('fx:float', { gx: plot.gx, gy: plot.gy, lines: [`-${r.cost} coins`] });
    });
  }

  harvest(plotId: string) {
    return this.act(() => this.service.harvest(plotId, newKey()), (r) => this.afterHarvest(r.harvested, r.levelUp, r.snapshot));
  }

  harvestAll() {
    return this.act(() => this.service.harvestAll(newKey()), (r) => this.afterHarvest(r.harvested, r.levelUp, r.snapshot));
  }

  private afterHarvest(h: { plotId: string; cropId: string; amount: number; xp: number }[], levelUp: number | null, snap: FarmSnapshot) {
    this.apply(snap, h.map((x) => x.plotId));
    playSfx('harvest_pop');
    h.forEach((x, i) => {
      const plot = snap.plots.find((p) => p.id === x.plotId)!;
      setTimeout(() => bus.emit('fx:float', { gx: plot.gx, gy: plot.gy, cropFrame: CROP_BY_ID.get(x.cropId)?.bed /* a raised bed is too big to float up: use the small icon */ ? `item_${x.cropId}` : `${x.cropId}_3`, lines: [`+${x.amount} ${x.cropId}`, `+${x.xp} XP`] }), i * 90);
    });
  }

  private levelUpToast(level: number) {
    const unlocked = [
      ...CROPS.filter((c) => c.unlockLevel === level).map((c) => c.name),
      ...ANIMALS.filter((a) => a.unlockLevel === level).map((a) => a.name),
      ...BUILDINGS.filter((b) => b.unlockLevel === level).map((b) => b.name),
      ...RECIPES.filter((r) => r.unlockLevel === level && (BUILDING_BY_ID.get(r.building)?.unlockLevel ?? 99) < level).map((r) => r.name),
    ];
    useFarm.getState().showToast(`Level ${level}!${unlocked.length ? ` New: ${unlocked.slice(0, 4).join(', ')}` : ''}`);
  }

  sell(itemId: string, qty: number) {
    return this.act(() => this.service.sell(itemId, qty, newKey()), (r) => {
      this.apply(r.snapshot, []);
      playSfx('coin_collect');
      useFarm.getState().showToast(`Sold ${r.qty} for ${r.coins} coins`);
    });
  }

  // ---------- placing buildings ----------
  startPlacing(type: string, moveId?: string) {
    const st = useFarm.getState();
    st.setPlantSeed(null);
    st.setShopTab(null);
    st.setBuildingPanel(null);
    st.setPlacing({ type, moveId, flip: false, gx: null, gy: null, valid: false });
    const sel = moveId ? null : st.selectedTile; // a new building starts on the spot the player already selected
    const fit = sel ? this.fitAround(type, sel.gx, sel.gy) : null;
    bus.emit('place:start', { type, moveId, at: fit ? { gx: fit.gx, gy: fit.gy } : undefined });
  }

  /** The selected tile is somewhere inside the building, not necessarily its top corner: try the four ways a 2x2 can cover it. */
  private fitAround(type: string, gx: number, gy: number): { gx: number; gy: number; valid: boolean; reason: string } {
    const tries: [number, number][] = [[0, 0], [-1, 0], [0, -1], [-1, -1]];
    let first: { gx: number; gy: number; valid: boolean; reason: string } | null = null;
    for (const [dx, dy] of tries) {
      const c = this.service.canPlace(type, gx + dx, gy + dy);
      const res = { gx: gx + dx, gy: gy + dy, ...c };
      if (c.valid) return res;
      first ??= res;
    }
    return first!;
  }

  /** Double-click in the shop: build right on the selected spot, no extra steps. */
  placeAtSelected(type: string) {
    const st = useFarm.getState();
    const t = st.selectedTile;
    if (!t) {
      st.showToast('Tap a spot on the farm first, then double-click the building');
      playSfx('ui_error');
      return;
    }
    const fit = this.fitAround(type, t.gx, t.gy);
    if (!fit.valid) {
      st.showToast(WHY[fit.reason] ?? WHY.unknown);
      playSfx('ui_error');
      return;
    }
    return this.act(() => this.service.placeBuilding(type, fit.gx, fit.gy, newKey()), (r) => {
      st.setShopTab(null);
      this.apply(r.snapshot);
      playSfx('build_complete');
      track('building_placed', { type });
      st.showToast(`${BUILDING_BY_ID.get(type)!.name} built`);
    });
  }

  /** Fields, rocks, trees, lamp posts, the well, silo, farmhouse and barn can all be picked up and put somewhere else, free. */
  /** Buy one more field: it appears on a free spot and you carry it where you want it. */
  buyField() {
    return this.act(() => this.service.buyField(newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('place_object');
      useFarm.getState().showToast('New plot! Drag it where you want it, then tap Move here');
      this.startMoveObject(r.objectId);
    });
  }

  nextFieldCost() { return this.service.nextFieldCost(); }

  startMoveObject(id: string) {
    const st = useFarm.getState();
    st.setPlantSeed(null); st.setShopTab(null); st.setBuildingPanel(null); st.setSeedPlot(null); st.setPlotInfo(null);
    st.setObstaclePanel(null); st.setObjectPanel(null); st.setOpenPanel(null);
    st.setPlacing({ type: '', objectId: id, flip: false, gx: null, gy: null, valid: false });
    bus.emit('objmove:start', { id });
  }

  objectName(id: string) {
    const names: Record<string, string> = { farmhouse: 'farmhouse', barn: 'barn', silo: 'silo', well: 'well', lamp: 'lamp post', mailbox: 'mailbox', scarecrow: 'scarecrow', signpost: 'sign', hay: 'hay bale', flowers_1: 'flowers', field_a: 'field', field_b: 'field', field_c: 'field' };
    if (id.startsWith('field_')) return 'field';
    if (names[id]) return names[id];
    const o = this.obstacles.get(id);
    return (o && OBSTACLE_TYPE_BY_ID.get(o.type)?.name.toLowerCase()) || 'object';
  }

  /** The field that covers a tile (for the Move field button). */
  fieldIdAt(gx: number, gy: number) { return fieldAtCell(farmLayout, useFarm.getState().moved, gx, gy)?.id ?? null; }

  onObjectTapped(id: string) {
    const st = useFarm.getState();
    st.setSeedPlot(null); st.setOpenPanel(null); st.setBuildingPanel(null); st.setObstaclePanel(null); st.setObjectPanel(id);
  }

  startMove(buildingId: string) {
    const b = useFarm.getState().buildings.find((x) => x.id === buildingId);
    if (b) this.startPlacing(b.type, buildingId);
  }

  /** Reported by the scene whenever the ghost moves. */
  onPlaceMoved(gx: number, gy: number, valid: boolean, reason?: string) {
    const p = useFarm.getState().placing;
    if (p) useFarm.getState().setPlacing({ ...p, gx, gy, valid, reason });
  }

  cancelPlacing() {
    useFarm.getState().setPlacing(null);
    bus.emit('place:end');
  }

  confirmPlacing() {
    const p = useFarm.getState().placing;
    if (!p || p.gx === null || p.gy === null) { useFarm.getState().showToast('Tap a spot on the farm first'); return; }
    if (!p.valid) { this.fail('invalid_placement'); return; }
    const { type, gx, gy } = p as { type: string; gx: number; gy: number };
    if (p.objectId) {
      const oid = p.objectId;
      return this.act(() => this.service.moveObject(oid, gx, gy, newKey()), (r) => {
        this.cancelPlacing();
        this.apply(r.snapshot);
        playSfx('place_object');
        useFarm.getState().showToast('Moved');
        useFarm.getState().selectTile(null); bus.emit('ui:panelClosed');   // the spot label and marker would still point at the old place
      });
    }
    if (p.moveId) {
      const id = p.moveId;
      return this.act(() => this.service.moveBuilding(id, gx, gy, newKey()), (r) => {
        this.cancelPlacing();
        this.apply(r.snapshot);
        playSfx('place_object');
        useFarm.getState().showToast('Moved');
        useFarm.getState().selectTile(null); bus.emit('ui:panelClosed');
      });
    }
    const flip = !!p.flip;
    return this.act(() => this.service.placeBuilding(type, gx, gy, newKey(), flip), (r) => {
      this.cancelPlacing();
      this.apply(r.snapshot);
      playSfx('build_complete');
      track('building_placed', { type });
      useFarm.getState().showToast(`${BUILDING_BY_ID.get(type)!.name} built`);
    });
  }

  /** Turn the building you are about to place (new buildings only; an existing one is turned from its own panel). */
  togglePlacingFlip() {
    const p = useFarm.getState().placing;
    if (!p) return;
    const flip = !p.flip;
    useFarm.getState().setPlacing({ ...p, flip });
    bus.emit('place:flip', { flip });
  }

  rotateBuilding(id: string) {
    return this.act(() => this.service.rotateBuilding(id, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('place_object');
    });
  }

  // ---------- rocks, trees and bushes ----------
  private obstacles = new Map(obstacleList(farmLayout).map((o) => [o.id, o]));

  obstacleInfo(id: string) {
    const o = this.obstacles.get(id);
    const t = o ? OBSTACLE_TYPE_BY_ID.get(o.type) : undefined;
    return o && t ? { ...o, def: t } : null;
  }

  onObstacleTapped(id: string) {
    const st = useFarm.getState();
    st.setSeedPlot(null); st.setOpenPanel(null); st.setBuildingPanel(null); st.setObstaclePanel(id);
  }

  clearObstacle(id: string) {
    const info = this.obstacleInfo(id);
    return this.act(() => this.service.clearObstacle(id, newKey()), (r) => {
      useFarm.getState().setObstaclePanel(null);
      this.apply(r.snapshot);
      playSfx(info?.type.startsWith('rock') ? 'clear_rock' : 'clear_chop');
      if (info) bus.emit('fx:float', { gx: info.gx, gy: info.gy, lines: [...Object.entries(r.rewards).map(([i, q]) => `+${q} ${i}`), `+${r.xp} XP`] });
    });
  }

  // ---------- animals ----------
  onBuildingTapped(id: string) {
    const st = useFarm.getState();
    st.setSeedPlot(null); st.setOpenPanel(null); st.setBuildingPanel(id);
  }

  buyAnimal(habitatId: string) {
    return this.act(() => this.service.buyAnimal(habitatId, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx(animalSound(useFarm.getState().buildings.find((b) => b.id === habitatId)?.type));
      useFarm.getState().showToast('New animal bought');
    });
  }

  feedAnimals(habitatId: string) {
    if ((useFarm.getState().inventory[FEED_ITEM] ?? 0) < 1) {
      useFarm.getState().showToast('No animal feed. Build a Feed Mill and make some from wheat.');
      playSfx('ui_error');
      return;
    }
    return this.act(() => this.service.feedAnimals(habitatId, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('feed_animal');
      this.float(habitatId, [`Fed ${r.fed}`]);
      bus.emit('fx:feed', { habitatId });
    });
  }

  collectAnimals(habitatId: string) { return this.act(() => this.service.collectAnimals(habitatId, newKey()), (r) => { playSfx('collect_product'); this.afterCollect(habitatId, r); }); }
  collectJobs(buildingId: string) { return this.act(() => this.service.collectJobs(buildingId, newKey()), (r) => { playSfx('production_done'); this.afterCollect(buildingId, r); }); }

  private afterCollect(buildingId: string, r: Collected) {
    this.apply(r.snapshot);
    this.float(buildingId, [...r.collected.map((c) => `+${c.qty} ${ITEM_BY_ID.get(c.itemId)?.name ?? c.itemId}`), `+${r.xp} XP`]);
  }

  upgrade(buildingId: string) {
    return this.act(() => this.service.upgradeBuilding(buildingId, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('build_complete');
      useFarm.getState().showToast(`Upgraded to level ${r.level}`);
    });
  }

  queueRecipe(buildingId: string, recipeId: string) {
    return this.act(() => this.service.queueRecipe(buildingId, recipeId, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('production_start');
      useFarm.getState().showToast(`${RECIPE_BY_ID.get(recipeId)!.name} started`);
    });
  }

  removeBuilding(buildingId: string) {
    return this.act(() => this.service.removeBuilding(buildingId, newKey()), (r) => {
      useFarm.getState().setBuildingPanel(null);
      this.apply(r.snapshot);
      useFarm.getState().showToast(`Removed, you got ${r.refund} coins back`);
    });
  }

  // ---------- orders, quests, land ----------
  fulfilOrder(orderId: string) {
    return this.act(() => this.service.fulfilOrder(orderId, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('order_fulfil');
      useFarm.getState().showToast(`Order delivered: +${r.coins} coins, +${r.xp} XP`);
      track('order_delivered', { coins: r.coins });
    });
  }

  skipOrder(orderId: string) {
    return this.act(() => this.service.skipOrder(orderId, newKey()), (r) => { this.apply(r.snapshot); });
  }

  claimQuest(questId: string) {
    const wasDone = useFarm.getState().tutorialDone;
    return this.act(() => this.service.claimQuest(questId, newKey()), (r) => {
      this.apply(r.snapshot);
      playSfx('jingle_quest_complete');
      const bits = [r.coins && `${r.coins} coins`, r.xp && `${r.xp} XP`, r.gems && `${r.gems} gems`].filter(Boolean).join(', ');
      useFarm.getState().showToast(`${QUEST_BY_ID.get(questId)!.title}: +${bits}`);
      track('quest_claimed', { id: questId });
      if (r.snapshot.tutorialDone && !wasDone) track('tutorial_done');   // once, when the last tutorial step is claimed, never on later quests
    });
  }

  skipTutorial() { return this.act(() => this.service.skipTutorial(newKey()), (r) => this.apply(r.snapshot)); }

  onExpansionTapped(id: string) {
    const st = useFarm.getState();
    st.setSeedPlot(null); st.setBuildingPanel(null); st.setOpenPanel(null); st.setExpansionPanel(id);
  }

  expandLand(id: string) {
    return this.act(() => this.service.expandLand(id, newKey()), (r) => {
      useFarm.getState().setExpansionPanel(null);
      this.apply(r.snapshot);
      playSfx('expand_land');
      useFarm.getState().showToast('New land cleared! You can build here now');
      track('land_cleared', { id });
    });
  }

  // ---------- Stratos Coins: speed-up ----------
  /** Finish one crop, animal product or factory job now. On the site it costs a Stratos Coins "boost"; on its own it is free. */
  speedUp(kind: SpeedKind, id: string) {
    offerCoins('boost', () => {
      void this.act(() => this.service.speedUp(kind, id, newKey()), (r) => {
        this.apply(r.snapshot);
        useFarm.getState().setPlotInfo(null);
        playSfx('notification');
        useFarm.getState().showToast('Done! It is ready now');
      });
    }, { label: 'Speed-up', title: 'Finish it right now?', what: 'A speed-up' });
  }

  // ---------- screens ----------
  /** Play / Continue on the home screen. Reports level_start, which pays the first-play Stratos Coins once. */
  startGame() {
    const st = useFarm.getState();
    st.setScreen('game');
    st.setInfoPanel(null);
    track('level_start', { level: st.player.level });
    setMusicTrack('music_farm_day');
  }

  goHome() {
    const st = useFarm.getState();
    st.setInfoPanel(null); st.setScreen('home');
    setMusicTrack('music_title');
  }

  /** Download the farm as a file: a backup the player keeps. */
  exportSave() {
    let raw: string | null = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch { /* ignore */ }
    if (!raw) { useFarm.getState().showToast('Nothing to back up yet, play a little first'); return; }
    const blob = new Blob([JSON.stringify({ game: 'stratos-farm', exportedAt: new Date().toISOString(), save: raw })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'stratos-farm-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    useFarm.getState().showToast('Backup saved to your downloads');
  }

  /** Restore a backup file: checked first, and only then does it replace the current farm. */
  async importSave(file: File) {
    try {
      const text = await file.text();
      const wrapper = JSON.parse(text) as { game?: string; save?: string };
      if (wrapper.game !== 'stratos-farm' || typeof wrapper.save !== 'string') throw new Error('not a backup');
      const check = validateSave(wrapper.save, worldConfig(farmLayout));
      if (!check.ok) { useFarm.getState().showToast(check.error); return; }
      localStorage.setItem(SAVE_KEY, wrapper.save);
      location.reload();
    } catch {
      useFarm.getState().showToast('That file is not a Stratos Farm backup');
    }
  }

  /** Throw the saved farm away and start over (the home screen asks twice first). */
  startNewFarm() {
    try { localStorage.removeItem('stratos_farm_save_v1'); } catch { /* ignore */ }
    location.reload();
  }

  // ---------- derived numbers for the UI ----------
  readyCount(): number {
    const now = this.now();
    return useFarm.getState().plots.filter((p) => cropStage(p, now) === 3).length;
  }

  /** Something waiting to be collected in this building (ready animal product or a finished job). */
  buildingReady(id: string): number {
    const st = useFarm.getState(), now = this.now();
    return st.animals.filter((a) => a.buildingId === id && animalStatus(a, now) === 'ready').length
      + st.jobs.filter((j) => j.buildingId === id && now >= j.readyAt).length;
  }
}

export const farm = new FarmController();
export { ANIMAL_BY_ID };
