import { LocalFarmService } from '../services/LocalFarmService';
import { ANIMAL_BY_ID, BUILDING_BY_ID, CROP_BY_ID, ITEM_BY_ID, RECIPE_BY_ID } from '../services/data';
import { animalStatus, cropStage, ErrorCode, FarmSnapshot } from '../services/types';
import { useFarm } from '../state/store';
import { bus } from './eventBus';
import { farmLayout, worldConfig } from './layout';

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
};

const newKey = () => (globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);

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
    setInterval(() => useFarm.getState().bumpTick(), 1000);
  }

  private apply(snap: FarmSnapshot, changed?: string[]) {
    useFarm.getState().applySnapshot(snap);
    bus.emit('farm:changed', { plotIds: changed ?? snap.plots.map((p) => p.id) });
  }

  private fail(error: ErrorCode) { useFarm.getState().showToast(MESSAGES[error]); }

  /** One action at a time: run the call, show the error or hand the result on. */
  private async act<R extends { ok: boolean }>(call: () => Promise<R>, onOk: (r: Extract<R, { ok: true }>) => void) {
    if (this.busy) return;
    this.busy = true;
    try {
      const r = await call();
      if (!r.ok) { this.fail((r as unknown as { error: ErrorCode }).error); return; }
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
    if (!plot.cropId) { st.setSeedPlot(plotId); return; }
    if (cropStage(plot, this.now()) === 3) { void this.harvest(plotId); return; }
    const crop = CROP_BY_ID.get(plot.cropId)!;
    st.showToast(`${crop.name} ready in ${formatDuration((plot.readyAt ?? 0) - this.now())}`);
  }

  plant(plotId: string, cropId: string) {
    return this.act(() => this.service.plant(plotId, cropId, newKey()), (r) => {
      useFarm.getState().setSeedPlot(null);
      this.apply(r.snapshot, [plotId]);
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
    h.forEach((x, i) => {
      const plot = snap.plots.find((p) => p.id === x.plotId)!;
      setTimeout(() => bus.emit('fx:float', { gx: plot.gx, gy: plot.gy, cropFrame: `${x.cropId}_3`, lines: [`+${x.amount} ${x.cropId}`, `+${x.xp} XP`] }), i * 90);
    });
    if (levelUp) this.levelUpToast(levelUp);
  }

  private levelUpToast(level: number) { useFarm.getState().showToast(`Level up! You are now level ${level}`); }

  sell(itemId: string, qty: number) {
    return this.act(() => this.service.sell(itemId, qty, newKey()), (r) => {
      this.apply(r.snapshot, []);
      useFarm.getState().showToast(`Sold ${r.qty} for ${r.coins} coins`);
    });
  }

  // ---------- placing buildings ----------
  startPlacing(type: string) {
    const st = useFarm.getState();
    st.setShopTab(null);
    st.setBuildingPanel(null);
    st.setPlacing({ type, gx: null, gy: null, valid: false });
    bus.emit('place:start', { type });
  }

  /** Reported by the scene whenever the ghost moves. */
  onPlaceMoved(gx: number, gy: number, valid: boolean) {
    const p = useFarm.getState().placing;
    if (p) useFarm.getState().setPlacing({ ...p, gx, gy, valid });
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
    return this.act(() => this.service.placeBuilding(type, gx, gy, newKey()), (r) => {
      this.cancelPlacing();
      this.apply(r.snapshot);
      useFarm.getState().showToast(`${BUILDING_BY_ID.get(type)!.name} built`);
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
      useFarm.getState().showToast('New animal bought');
    });
  }

  feedAnimals(habitatId: string) {
    return this.act(() => this.service.feedAnimals(habitatId, newKey()), (r) => {
      this.apply(r.snapshot);
      this.float(habitatId, [`Fed ${r.fed}`]);
      bus.emit('fx:feed', { habitatId });
    });
  }

  collectAnimals(habitatId: string) { return this.act(() => this.service.collectAnimals(habitatId, newKey()), (r) => this.afterCollect(habitatId, r)); }
  collectJobs(buildingId: string) { return this.act(() => this.service.collectJobs(buildingId, newKey()), (r) => this.afterCollect(buildingId, r)); }

  private afterCollect(buildingId: string, r: Collected) {
    this.apply(r.snapshot);
    this.float(buildingId, [...r.collected.map((c) => `+${c.qty} ${ITEM_BY_ID.get(c.itemId)?.name ?? c.itemId}`), `+${r.xp} XP`]);
    if (r.levelUp) this.levelUpToast(r.levelUp);
  }

  upgrade(buildingId: string) {
    return this.act(() => this.service.upgradeBuilding(buildingId, newKey()), (r) => {
      this.apply(r.snapshot);
      useFarm.getState().showToast(`Upgraded to level ${r.level}`);
    });
  }

  queueRecipe(buildingId: string, recipeId: string) {
    return this.act(() => this.service.queueRecipe(buildingId, recipeId, newKey()), (r) => {
      this.apply(r.snapshot);
      useFarm.getState().showToast(`${RECIPE_BY_ID.get(recipeId)!.name} started`);
    });
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
