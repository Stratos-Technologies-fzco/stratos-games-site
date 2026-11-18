import { useFarm } from '../state/store';
import { farm, formatDuration } from '../game/controller';
import { CROPS, ITEMS } from '../services/data';
import { Icon } from './Icon';
import { SellRow } from './SellRow';

export function PanelShell({ title, onClose, testId, children, center = false }: { title: string; onClose: () => void; testId: string; children: React.ReactNode; center?: boolean }) {
  return (
    <aside className={`info-panel wide${center ? ' center' : ''}`} role="dialog" aria-label={title} data-testid={testId}>
      <div className="ribbon">{title}</div>
      <div className="panel-body">{children}</div>
      <div className="panel-actions">
        <button className="btn" onClick={onClose} data-testid={`${testId}-close`}>Close</button>
      </div>
    </aside>
  );
}

/** Seed picker for one empty plot. Locked crops are shown with the level that unlocks them. */
export function SeedPanel() {
  const plotId = useFarm((s) => s.seedPlot);
  const level = useFarm((s) => s.player.level);
  const coins = useFarm((s) => s.player.coins);
  const setSeedPlot = useFarm((s) => s.setSeedPlot);
  if (!plotId) return null;
  return (
    <PanelShell title="Plant a seed" testId="seed-panel" onClose={() => setSeedPlot(null)}>
      <ul className="rows">
        {CROPS.map((c) => {
          const locked = c.unlockLevel > level;
          const poor = !locked && coins < c.seedCost;
          return (
            <li key={c.id}>
              <button className={`row ${locked || poor ? 'dim' : ''}`} disabled={locked} data-testid={`seed-${c.id}`}
                onClick={() => (poor ? useFarm.getState().showToast('Not enough coins') : farm.plant(plotId, c.id))}>
                <Icon name={`item_${c.id}`} size={40} />
                <span className="grow">
                  <b>{c.name}</b>
                  <small>{formatDuration(c.growSeconds * 1000)} · {c.yield} per harvest · {c.xp} XP</small>
                </span>
                {locked ? <span className="tag"><Icon name="lock" size={18} /> Lv {c.unlockLevel}</span>
                  : <span className="tag"><Icon name="coin" size={20} /> {c.seedCost}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </PanelShell>
  );
}

/** What the player has harvested, with selling (the full market comes later). */
export function InventoryPanel() {
  const open = useFarm((s) => s.inventoryOpen);
  const inv = useFarm((s) => s.inventory);
  const setOpen = useFarm((s) => s.setInventoryOpen);
  if (!open) return null;
  const items = ITEMS.filter((c) => (inv[c.id] ?? 0) > 0);
  return (
    <PanelShell title="Inventory" testId="inventory-panel" onClose={() => setOpen(false)}>
      {items.length === 0 ? (
        <p className="empty" data-testid="inventory-empty">Nothing here yet. Plant a seed and harvest it to fill your barn.</p>
      ) : (
        <ul className="rows">
          {items.map((c) => (
            <li key={c.id}>
              <SellRow item={c} have={inv[c.id]} testId={`inv-${c.id}`} />
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}

/** Shows only while at least one crop is ready. */
export function HarvestAllButton() {
  useFarm((s) => s.tick); // re-check every second
  useFarm((s) => s.plots);
  const n = farm.readyCount();
  if (n === 0) return null;
  return (
    <button className="harvest-all" onClick={() => farm.harvestAll()} data-testid="harvest-all">
      <Icon name="check" size={26} /> Harvest all ({n})
    </button>
  );
}
