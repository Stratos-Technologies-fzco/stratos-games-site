import { LocalFarmService, CROPS } from '../services/LocalFarmService';
import { cropStage, ErrorCode, FarmSnapshot } from '../services/types';
import { useFarm } from '../state/store';
import { bus } from './eventBus';
import { farmLayout, plotCells } from './layout';

const MESSAGES: Record<ErrorCode, string> = {
  invalid_plot: 'That is not a field',
  unknown_crop: 'Unknown crop',
  not_unlocked: 'That crop is not unlocked yet',
  insufficient_coins: 'Not enough coins',
  plot_occupied: 'Something is already growing here',
  nothing_planted: 'Nothing is planted here',
  not_ready: 'Not ready yet',
  nothing_ready: 'Nothing is ready yet',
  insufficient_items: 'You do not have enough of that',
  bad_request: 'Something went wrong, please try again',
};

const newKey = () => (globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Glue between the UI/world and the farm service. No React and no Phaser in here. */
class FarmController {
  readonly service = new LocalFarmService(plotCells(farmLayout));
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

  /** A tap on a field tile: empty -> pick a seed, growing -> show the countdown, ready -> harvest. */
  onPlotTapped(plotId: string) {
    const st = useFarm.getState();
    const plot = st.plots.find((p) => p.id === plotId);
    if (!plot) return;
    if (!plot.cropId) { st.setSeedPlot(plotId); return; }
    const stage = cropStage(plot, this.now());
    if (stage === 3) { void this.harvest(plotId); return; }
    const crop = CROPS.find((c) => c.id === plot.cropId)!;
    st.showToast(`${crop.name} ready in ${formatDuration((plot.readyAt ?? 0) - this.now())}`);
  }

  async plant(plotId: string, cropId: string) {
    if (this.busy) return;
    this.busy = true;
    try {
      const r = await this.service.plant(plotId, cropId, newKey());
      if (!r.ok) { this.fail(r.error); return; }
      useFarm.getState().setSeedPlot(null);
      this.apply(r.snapshot, [plotId]);
      const plot = r.snapshot.plots.find((p) => p.id === plotId)!;
      bus.emit('fx:float', { gx: plot.gx, gy: plot.gy, lines: [`-${r.cost} coins`] });
    } finally { this.busy = false; }
  }

  async harvest(plotId: string) {
    if (this.busy) return;
    this.busy = true;
    try {
      const r = await this.service.harvest(plotId, newKey());
      if (!r.ok) { this.fail(r.error); return; }
      this.afterHarvest(r.harvested, r.levelUp, r.snapshot);
    } finally { this.busy = false; }
  }

  async harvestAll() {
    if (this.busy) return;
    this.busy = true;
    try {
      const r = await this.service.harvestAll(newKey());
      if (!r.ok) { this.fail(r.error); return; }
      this.afterHarvest(r.harvested, r.levelUp, r.snapshot);
    } finally { this.busy = false; }
  }

  private afterHarvest(h: { plotId: string; cropId: string; amount: number; xp: number }[], levelUp: number | null, snap: FarmSnapshot) {
    this.apply(snap, h.map((x) => x.plotId));
    h.forEach((x, i) => {
      const plot = snap.plots.find((p) => p.id === x.plotId)!;
      setTimeout(() => bus.emit('fx:float', { gx: plot.gx, gy: plot.gy, cropFrame: `${x.cropId}_3`, lines: [`+${x.amount} ${x.cropId}`, `+${x.xp} XP`] }), i * 90);
    });
    if (levelUp) useFarm.getState().showToast(`Level up! You are now level ${levelUp}`);
  }

  async sell(itemId: string, qty: number) {
    if (this.busy) return;
    this.busy = true;
    try {
      const r = await this.service.sell(itemId, qty, newKey());
      if (!r.ok) { this.fail(r.error); return; }
      this.apply(r.snapshot, []);
      useFarm.getState().showToast(`Sold ${r.qty} for ${r.coins} coins`);
    } finally { this.busy = false; }
  }

  readyCount(): number {
    const now = this.now();
    return useFarm.getState().plots.filter((p) => cropStage(p, now) === 3).length;
  }
}

export const farm = new FarmController();
