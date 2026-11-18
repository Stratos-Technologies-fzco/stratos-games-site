import { useState } from 'react';
import { useFarm } from '../state/store';
import { farm, formatDuration } from '../game/controller';
import { farmLayout } from '../game/layout';
import { CROP_BY_ID, ITEMS, ITEM_BY_ID, NPC_BY_ID, ORDERS } from '../services/data';
import { hintFor } from '../services/hints';
import { offerCoins } from '../game/stratos';
import { cropStage } from '../services/types';
import {
  QUESTS, QuestDef, QuestView, activeQuests, claimableCount, currentTutorialStep, isClaimed, isComplete, questProgress,
} from '../services/quests';
import { Icon } from './Icon';
import { PanelShell } from './Panels';

const useQuestView = (): QuestView => {
  const stats = useFarm((s) => s.stats);
  const level = useFarm((s) => s.player.level);
  const daily = useFarm((s) => s.daily);
  const claimed = useFarm((s) => s.claimed);
  return { stats, level, daily, claimed };
};

export function useClaimable(): number {
  return claimableCount(useQuestView());
}

function Rewards({ coins, xp, gems }: { coins?: number; xp?: number; gems?: number }) {
  return (
    <span className="rewards">
      {coins ? <span className="tag"><Icon name="coin" size={16} /> {coins}</span> : null}
      {xp ? <span className="tag"><Icon name="xp_star" size={16} /> {xp}</span> : null}
      {gems ? <span className="tag"><Icon name="gem" size={16} /> {gems}</span> : null}
    </span>
  );
}

/** Market: customer orders and selling. */
export function MarketPanel() {
  const tab = useFarm((s) => s.marketTab);
  const setTab = useFarm((s) => s.setMarketTab);
  const orders = useFarm((s) => s.orders);
  const cooldowns = useFarm((s) => s.orderCooldowns);
  const inv = useFarm((s) => s.inventory);
  const level = useFarm((s) => s.player.level);
  const [hints, setHints] = useState<Record<string, string>>({});
  useFarm((s) => s.tick);
  if (!tab) return null;
  const now = farm.now();
  return (
    <PanelShell title="Market" testId="market-panel" onClose={() => setTab(null)}>
      <div className="tabs" role="tablist">
        <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')} data-testid="tab-orders">Orders ({orders.length})</button>
        <button className={tab === 'sell' ? 'on' : ''} onClick={() => setTab('sell')} data-testid="tab-sell">Sell</button>
      </div>
      {tab === 'orders' ? (
        <ul className="rows">
          {ORDERS.slots.map((slot, i) => {
            const o = orders.find((x) => x.slot === i);
            if (slot.unlockLevel > level) {
              return <li key={i}><div className="row dim"><Icon name="lock" size={30} /><span className="grow"><b>Customer slot</b><small>Unlocks at level {slot.unlockLevel}</small></span></div></li>;
            }
            if (!o) {
              const wait = (cooldowns[i] ?? 0) - now;
              return <li key={i}><div className="row dim"><Icon name="clock" size={30} /><span className="grow"><b>Waiting for a customer</b><small>{wait > 0 ? `New order in ${formatDuration(wait)}` : 'Arriving...'}</small></span></div></li>;
            }
            const can = Object.entries(o.items).every(([item, q]) => (inv[item] ?? 0) >= q);
            return (
              <li key={o.id}>
                <div className="order" data-testid={`order-${o.slot}`}>
                  <Icon atlas="atlas_characters" name={`${o.npc}_portrait`} size={52} className="npc" />
                  <div className="grow">
                    <b>{NPC_BY_ID.get(o.npc)?.name ?? o.npc}</b>
                    <div className="wants">
                      {Object.entries(o.items).map(([item, q]) => (
                        <span key={item} className={`want ${(inv[item] ?? 0) >= q ? 'ok' : ''}`}>
                          <Icon name={`item_${item}`} size={24} /> {inv[item] ?? 0}/{q}
                        </span>
                      ))}
                    </div>
                    <Rewards coins={o.coins} xp={o.xp} />
                    {hints[o.id] && <div className="hint-box" data-testid={`hint-text-${o.slot}`}>{hints[o.id]}</div>}
                  </div>
                  <div className="order-actions">
                    <button className="btn small" disabled={!can} onClick={() => farm.fulfilOrder(o.id)} data-testid={`deliver-${o.slot}`}>Deliver</button>
                    {!can && (
                      <button className="link" data-testid={`hint-${o.slot}`} onClick={() => offerCoins('hint', () => setHints((h) => ({ ...h, [o.id]: Object.entries(o.items).filter(([i, q]) => (inv[i] ?? 0) < q).map(([i]) => hintFor(i)).join(' ') })), { label: 'Hint', title: 'Need a hint?', what: 'A hint' })}>Hint</button>
                    )}
                    <button className="link" onClick={() => farm.skipOrder(o.id)} data-testid={`skip-${o.slot}`}>Skip</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <SellList inv={inv} />
      )}
    </PanelShell>
  );
}

function SellList({ inv }: { inv: Record<string, number> }) {
  const items = ITEMS.filter((i) => (inv[i.id] ?? 0) > 0);
  if (!items.length) return <p className="empty" data-testid="sell-empty">Nothing to sell yet. Harvest crops or collect products first.</p>;
  return (
    <ul className="rows">
      {items.map((c) => (
        <li key={c.id}>
          <div className="row" data-testid={`market-${c.id}`}>
            <Icon name={`item_${c.id}`} size={36} />
            <span className="grow"><b>{c.name} × {inv[c.id]}</b><small>{c.sellPrice} coins each</small></span>
            <button className="btn small" onClick={() => farm.sell(c.id, 1)} data-testid={`sell1-${c.id}`}>Sell 1</button>
            <button className="btn small" onClick={() => farm.sell(c.id, inv[c.id])}>All · {inv[c.id] * c.sellPrice}</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuestRow({ q, v }: { q: QuestDef; v: QuestView }) {
  const progress = questProgress(q, v);
  const done = isComplete(q, v), claimed = isClaimed(q, v);
  return (
    <li>
      <div className={`row quest ${claimed ? 'dim' : ''}`} data-testid={`quest-${q.id}`}>
        <span className="grow">
          <b>{q.title}</b>
          <small>{q.desc}</small>
          <span className="bar"><span style={{ width: `${(progress / q.target) * 100}%` }} /></span>
          <small>{progress} / {q.target}</small>
        </span>
        <span className="quest-side">
          <Rewards {...q.reward} />
          {claimed ? <span className="tag">Done</span>
            : <button className="btn small" disabled={!done} onClick={() => farm.claimQuest(q.id)} data-testid={`claim-${q.id}`}>Claim</button>}
        </span>
      </div>
    </li>
  );
}

/** Daily quests, goals and achievements. */
export function QuestsPanel() {
  const open = useFarm((s) => s.questsOpen);
  const setOpen = useFarm((s) => s.setQuestsOpen);
  const v = useQuestView();
  const [tab, setTab] = useState<'daily' | 'goals' | 'achievements'>('daily');
  useFarm((s) => s.tick);
  if (!open) return null;
  const list = activeQuests(v).filter((q) => (tab === 'daily' ? q.daily : tab === 'achievements' ? q.type === 'achievement' : !q.daily && q.type !== 'achievement' && q.type !== 'tutorial'));
  const msLeft = (v.daily.day + 1) * 86_400_000 - farm.now();
  return (
    <PanelShell title="Quests" testId="quests-panel" onClose={() => setOpen(false)}>
      <div className="tabs" role="tablist">
        <button className={tab === 'daily' ? 'on' : ''} onClick={() => setTab('daily')} data-testid="qtab-daily">Today</button>
        <button className={tab === 'goals' ? 'on' : ''} onClick={() => setTab('goals')} data-testid="qtab-goals">Goals</button>
        <button className={tab === 'achievements' ? 'on' : ''} onClick={() => setTab('achievements')} data-testid="qtab-achievements">Awards</button>
      </div>
      {tab === 'daily' && <p className="meta">New daily quests in {formatDuration(msLeft)}</p>}
      <ul className="rows">{list.map((q) => <QuestRow key={q.id} q={q} v={v} />)}</ul>
      {list.length === 0 && <p className="empty">Nothing here yet. Keep playing!</p>}
    </PanelShell>
  );
}

/** First-session guide: one step at a time until all five are claimed (or skipped). */
export function TutorialBanner() {
  const done = useFarm((s) => s.tutorialDone);
  const loaded = useFarm((s) => s.farmLoaded);
  const v = useQuestView();
  const step = currentTutorialStep(v);
  // stay out of the way while a panel is open
  const panelOpen = useFarm((s) => !!(s.shopTab || s.marketTab || s.inventoryOpen || s.questsOpen || s.buildingPanel || s.seedPlot || s.openPanel || s.expansionPanel || s.placing));
  if (done || !loaded || !step || panelOpen) return null;
  const idx = QUESTS.filter((q) => q.type === 'tutorial').findIndex((q) => q.id === step.id) + 1;
  const complete = isComplete(step, v);
  return (
    <div className="tutorial" data-testid="tutorial">
      <Icon name="tutorial_hand" size={34} />
      <div className="grow">
        <small>Step {idx} of 5</small>
        <b>{step.title}</b>
        <span>{step.desc}</span>
      </div>
      {complete
        ? <button className="btn small" onClick={() => farm.claimQuest(step.id)} data-testid="tutorial-claim">Claim</button>
        : <button className="link" onClick={() => farm.skipTutorial()} data-testid="tutorial-skip">Skip</button>}
    </div>
  );
}

/** Clear a locked patch of land with coins and materials. */
export function ExpansionPanel() {
  const id = useFarm((s) => s.expansionPanel);
  const setId = useFarm((s) => s.setExpansionPanel);
  const expanded = useFarm((s) => s.expanded);
  const coins = useFarm((s) => s.player.coins);
  const level = useFarm((s) => s.player.level);
  const inv = useFarm((s) => s.inventory);
  const ex = farmLayout.expansions.find((e) => e.id === id);
  if (!id || !ex || expanded.includes(id)) return null;
  const locked = ex.unlockLevel > level;
  const ready = !locked && coins >= ex.cost && Object.entries(ex.materials).every(([i, q]) => (inv[i] ?? 0) >= q);
  return (
    <PanelShell title={ex.name} testId="expansion-panel" onClose={() => setId(null)}>
      <p className="meta">Clear this land to build on it. {locked ? `Unlocks at level ${ex.unlockLevel}.` : ''}</p>
      <ul className="rows">
        <li><div className="row"><Icon name="coin" size={32} /><span className="grow"><b>Coins</b></span><span className={`tag ${coins >= ex.cost ? '' : 'bad'}`}>{coins} / {ex.cost}</span></div></li>
        {Object.entries(ex.materials).map(([item, q]) => (
          <li key={item}><div className="row"><Icon name={`item_${item}`} size={32} /><span className="grow"><b>{ITEM_BY_ID.get(item)?.name ?? item}</b></span><span className={`tag ${(inv[item] ?? 0) >= q ? '' : 'bad'}`}>{inv[item] ?? 0} / {q}</span></div></li>
        ))}
      </ul>
      <div className="panel-actions" style={{ marginTop: 10 }}>
        <button className="btn" disabled={!ready} onClick={() => farm.expandLand(id)} data-testid="expand-confirm">Clear the land</button>
      </div>
    </PanelShell>
  );
}

/** A growing crop: time left and a Speed-up. */
export function PlotPanel() {
  const id = useFarm((s) => s.plotInfo);
  const plot = useFarm((s) => s.plots.find((p) => p.id === id));
  const setId = useFarm((s) => s.setPlotInfo);
  useFarm((s) => s.tick);
  if (!id || !plot || !plot.cropId) return null;
  const now = farm.now();
  const stage = cropStage(plot, now);
  if (stage === 3) return null;
  const crop = CROP_BY_ID.get(plot.cropId)!;
  return (
    <PanelShell title={crop.name} testId="plot-panel" onClose={() => setId(null)}>
      <p className="meta" data-testid="plot-time">Ready in {formatDuration((plot.readyAt ?? now) - now)}</p>
      <div className="panel-actions">
        <button className="btn small" onClick={() => farm.speedUp('plot', id)} data-testid="speedup">Speed up</button>
      </div>
    </PanelShell>
  );
}
