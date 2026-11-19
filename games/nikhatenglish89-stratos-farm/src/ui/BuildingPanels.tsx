import { useRef, useState } from 'react';
import { useFarm } from '../state/store';
import { farm, formatDuration } from '../game/controller';
import { ANIMAL_BY_ID, BUILDINGS, BUILDING_BY_ID, FEED_ITEM, ITEM_BY_ID, MAX_LEVEL, RECIPES } from '../services/data';
import { animalHappiness, animalStatus, habitatCapacity, productionSlots } from '../services/types';
import { Icon, ItemIcon } from './Icon';
import { PanelShell } from './PanelShell';

const recipeIcon = (buildingId: string) => `item_${RECIPES.find((r) => r.building === buildingId)!.output}`;

function Countdown({ to }: { to: number }) {
  useFarm((s) => s.tick); // re-render every second
  const left = to - farm.now();
  return <>{left <= 0 ? 'Ready' : formatDuration(left)}</>;
}

/** Shop: pick a habitat or factory, then place it on the farm. */
/** Single click = pick it up and place it; double click = build it right now on the selected spot. */
function useShopClick() {
  const last = useRef<{ id: string; t: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (id: string) => {
    const now = Date.now();
    if (last.current && last.current.id === id && now - last.current.t < 400) {
      if (timer.current) clearTimeout(timer.current);
      last.current = null;
      farm.placeAtSelected(id);
      return;
    }
    last.current = { id, t: now };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      last.current = null;
      if (useFarm.getState().player.coins < (BUILDING_BY_ID.get(id)?.cost ?? 0)) useFarm.getState().showToast('Not enough coins');
      else farm.startPlacing(id);
    }, 410);
  };
}

export function ShopPanel() {
  const click = useShopClick();
  const selected = useFarm((s) => s.selectedTile);
  const tab = useFarm((s) => s.shopTab);
  const level = useFarm((s) => s.player.level);
  const coins = useFarm((s) => s.player.coins);
  const setTab = useFarm((s) => s.setShopTab);
  if (!tab) return null;
  const list = BUILDINGS.filter((b) => b.kind === (tab === 'habitats' ? 'habitat' : tab === 'factories' ? 'production' : 'decor'));
  return (
    <PanelShell title="Shop" testId="shop-panel" onClose={() => setTab(null)} wide>
      <div className="tabs" role="tablist">
        <button className={tab === 'habitats' ? 'on' : ''} onClick={() => setTab('habitats')} data-testid="tab-habitats">Animal homes</button>
        <button className={tab === 'factories' ? 'on' : ''} onClick={() => setTab('factories')} data-testid="tab-factories">Factories</button>
        <button className={tab === 'decor' ? 'on' : ''} onClick={() => setTab('decor')} data-testid="tab-decor">Decor</button>
      </div>
      <p className="meta" data-testid="shop-hint">{selected ? `Selected spot: ${selected.gx}, ${selected.gy}. Double-click a building to put it there.` : 'Tip: tap a spot on the farm first, then double-click a building to put it there.'}</p>
      <ul className="rows cols2">
        {list.map((b) => {
          const locked = b.unlockLevel > level;
          const animal = b.animal ? ANIMAL_BY_ID.get(b.animal) : null;
          const makes = RECIPES.filter((r) => r.building === b.id).map((r) => r.name).join(', ');
          return (
            <li key={b.id}>
              <button className={`row ${locked || coins < b.cost ? 'dim' : ''}`} disabled={locked} data-testid={`shop-${b.id}`}
                onClick={() => click(b.id)}>
                {b.kind === 'decor' ? <Icon atlas={b.atlas} name={b.frames[0]} size={40} /> : <Icon name={animal ? `item_${animal.product}` : recipeIcon(b.id)} size={40} />}
                <span className="grow">
                  <b>{b.name}</b>
                  <small>{b.kind === 'decor' ? 'A pretty extra for your village' : animal ? `Home for ${animal.name.toLowerCase()}s, makes ${ITEM_BY_ID.get(animal.product)!.name.toLowerCase()}` : `Makes ${makes}`}</small>
                </span>
                {locked ? <span className="tag"><Icon name="lock" size={18} /> Lv {b.unlockLevel}</span>
                  : <span className="tag"><Icon name="coin" size={20} /> {b.cost}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </PanelShell>
  );
}

/** Habitat or factory panel, opened by tapping the building. */
export function BuildingPanel() {
  const id = useFarm((s) => s.buildingPanel);
  const b = useFarm((s) => s.buildings.find((x) => x.id === id));
  const animals = useFarm((s) => s.animals);
  const jobs = useFarm((s) => s.jobs);
  const inv = useFarm((s) => s.inventory);
  const level = useFarm((s) => s.player.level);
  const setPanel = useFarm((s) => s.setBuildingPanel);
  const [confirmRemove, setConfirmRemove] = useState(false);
  useFarm((s) => s.tick);
  if (!id || !b) return null;
  const def = BUILDING_BY_ID.get(b.type)!;
  const now = farm.now();
  const upgradeCost = b.level < MAX_LEVEL ? def.upgradeCost[b.level] : null;
  const upgradeBtn = (
    <button className="btn small" disabled={upgradeCost === null} data-testid="upgrade" onClick={() => farm.upgrade(b.id)}>
      {upgradeCost === null ? 'Max level' : `Upgrade · ${upgradeCost}`}
    </button>
  );

  const moveRemove = (
    <div className="btn-row">
      <button className="btn small" onClick={() => farm.startMove(b.id)} data-testid="move">Move</button>
      <button className="btn small" onClick={() => farm.rotateBuilding(b.id)} data-testid="rotate">Turn around</button>
      <button className={`btn small ${confirmRemove ? 'red' : ''}`} data-testid="remove"
        onClick={() => (confirmRemove ? farm.removeBuilding(b.id) : setConfirmRemove(true))}>
        {confirmRemove ? `Sure? Get ${Math.floor(def.cost / 2)} back` : 'Remove'}
      </button>
    </div>
  );

  if (def.kind === 'habitat') {
    const mine = animals.filter((a) => a.buildingId === b.id);
    const cap = habitatCapacity(def, b.level);
    const animal = ANIMAL_BY_ID.get(def.animal!)!;
    const product = ITEM_BY_ID.get(animal.product)!.name;
    const ready = mine.filter((a) => animalStatus(a, now) === 'ready').length;
    const hungry = mine.filter((a) => animalStatus(a, now) === 'hungry').length;
    return (
      <PanelShell title={`${def.name} · Lv ${b.level}`} testId="building-panel" onClose={() => setPanel(null)}>
        <p className="meta" data-testid="habitat-meta">{mine.length} / {cap} animals · Animal feed: {inv[FEED_ITEM] ?? 0}</p>
        {hungry > 0 && (inv[FEED_ITEM] ?? 0) === 0 && (
          <div className="hint-box" data-testid="no-feed">
            <b>No animal feed.</b> Hungry animals need 1 animal feed each. Open the Shop, build a <b>Feed Mill</b> (Factories tab), start the recipe <b>Starter feed</b> (3 wheat) and collect it. Then come back and press Feed.
          </div>
        )}
        {mine.length === 0 && <p className="empty">No animals yet. Buy your first {animal.name.toLowerCase()}!</p>}
        <ul className="rows cols2">
          {mine.map((a) => {
            const st = animalStatus(a, now);
            return (
              <li key={a.id}>
                <div className="row" data-testid={`animal-${a.id}`}>
                  <ItemIcon id={animal.product} size={34} />
                  <span className="grow">
                    <b>{animal.name}</b>
                    <small>
                      {st === 'hungry' ? 'Hungry, needs feed' : st === 'ready' ? `${product} is ready` : <>Making {product.toLowerCase()}: <Countdown to={a.readyAt!} /></>}
                      {' · happiness '}{animalHappiness(a, now)}
                    </small>
                  </span>
                  {st === 'producing' && <button className="btn small" onClick={() => farm.speedUp('animal', a.id)} data-testid={`speed-${a.id}`}>Speed up</button>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="actions-grid">
          <button className="btn small" disabled={hungry === 0} onClick={() => farm.feedAnimals(b.id)} data-testid="feed">Feed ({hungry}){(inv[FEED_ITEM] ?? 0) === 0 && hungry > 0 ? ' · no feed' : ''}</button>
          <button className="btn small" disabled={ready === 0} onClick={() => farm.collectAnimals(b.id)} data-testid="collect">Collect ({ready})</button>
          <button className="btn small" disabled={level < animal.unlockLevel} onClick={() => farm.buyAnimal(b.id)} data-testid="buy-animal">Buy {animal.name} · {animal.cost}</button>
          {upgradeBtn}
        </div>
        {moveRemove}
      </PanelShell>
    );
  }

  if (def.kind === 'decor') {
    return (
      <PanelShell title={def.name} testId="building-panel" onClose={() => setPanel(null)}>
        <p className="meta">A decoration. It makes your village look like yours. You can move it, turn it around, or take it away for half the price back.</p>
        {moveRemove}
      </PanelShell>
    );
  }

  const myJobs = jobs.filter((j) => j.buildingId === b.id);
  const slots = productionSlots(def, b.level);
  const done = myJobs.filter((j) => now >= j.readyAt).length;
  return (
    <PanelShell title={`${def.name} · Lv ${b.level}`} testId="building-panel" onClose={() => setPanel(null)}>
      <p className="meta" data-testid="queue-meta">Queue {myJobs.length} / {slots}</p>
      {myJobs.length > 0 && (
        <ul className="rows">
          {myJobs.map((j) => {
            const r = RECIPES.find((x) => x.id === j.recipeId)!;
            return (
              <li key={j.id}>
                <div className="row" data-testid={`job-${j.id}`}>
                  <ItemIcon id={r.output} size={34} />
                  <span className="grow"><b>{r.name}</b><small><Countdown to={j.readyAt} /></small></span>
                  {j.readyAt > now && <button className="btn small" onClick={() => farm.speedUp('job', j.id)} data-testid={`speed-${j.id}`}>Speed up</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <h4>Recipes</h4>
      <ul className="rows">
        {RECIPES.filter((r) => r.building === b.type).map((r) => {
          const locked = r.unlockLevel > level;
          const missing = Object.entries(r.inputs).some(([i, q]) => (inv[i] ?? 0) < q);
          return (
            <li key={r.id}>
              <button className={`row ${locked || missing ? 'dim' : ''}`} disabled={locked} data-testid={`recipe-${r.id}`} onClick={() => farm.queueRecipe(b.id, r.id)}>
                <ItemIcon id={r.output} size={36} />
                <span className="grow">
                  <b>{r.name}</b>
                  <small>{Object.entries(r.inputs).map(([i, q]) => `${inv[i] ?? 0}/${q} ${ITEM_BY_ID.get(i)!.name}`).join(' + ')} · {formatDuration(r.seconds * 1000)}</small>
                </span>
                {locked ? <span className="tag"><Icon name="lock" size={18} /> Lv {r.unlockLevel}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="actions-grid">
        <button className="btn small" disabled={done === 0} onClick={() => farm.collectJobs(b.id)} data-testid="collect">Collect ({done})</button>
        {upgradeBtn}
      </div>
      {moveRemove}
    </PanelShell>
  );
}

/** Bar shown while a building is being placed: tap a spot, then confirm. */
export function PlacementBar() {
  const p = useFarm((s) => s.placing);
  if (!p) return null;
  const def = BUILDING_BY_ID.get(p.type)!;
  return (
    <div className="placement-bar" data-testid="placement-bar">
      <span>{p.gx === null ? (p.moveId ? `Tap a new spot for your ${def.name}` : `Tap a spot for your ${def.name}`) : p.valid ? 'Looks good!' : 'Something is in the way'}</span>
      <div className="panel-actions">
        <button className="btn small" disabled={!p.valid} onClick={() => farm.confirmPlacing()} data-testid="place-confirm">{p.moveId ? 'Move here' : `Place · ${def.cost}`}</button>
        {!p.moveId && <button className="btn small" onClick={() => farm.togglePlacingFlip()} data-testid="place-turn" aria-pressed={!!p.flip}>Turn around</button>}
        <button className="btn small red" onClick={() => farm.cancelPlacing()} data-testid="place-cancel">Cancel</button>
      </div>
    </div>
  );
}
