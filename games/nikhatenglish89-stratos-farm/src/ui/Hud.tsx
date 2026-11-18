import { useEffect } from 'react';
import { useFarm } from '../state/store';
import { bus } from '../game/eventBus';
import { Icon } from './Icon';
import { farmLayout } from '../game/layout';
import { useClaimable } from './EconomyPanels';
import { useStratosBalance } from './Home';

export function TopBar() {
  const { player, xpNext } = useFarm();
  const pct = Math.min(100, Math.round((player.xp / xpNext) * 100));
  const claimable = useClaimable();
  const stratos = useStratosBalance();
  return (
    <header className="top-bar" data-testid="top-bar">
      <div className="avatar">
        <Icon atlas="atlas_characters" name={player.avatar} size={44} className="avatar-img" />
      </div>
      <div className="level-block" aria-label={`Level ${player.level}`}>
        <div className="level-row">
          <Icon name="level_badge" size={22} />
          <span className="level-num" data-testid="level">Lv {player.level}</span>
        </div>
        <div className="xp-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="xp-fill" style={{ width: `${pct}%` }} />
          <span className="xp-text">{player.xp} / {xpNext} XP</span>
        </div>
      </div>
      <div className="spacer" />
      {stratos !== null && (
        <div className="pill stratos-pill" data-testid="stratos-coins" title="Stratos Coins"><Icon atlas="atlas_ui_fx" name="logo_small" size={26} /><span>{stratos}</span></div>
      )}
      <div className="pill" data-testid="coins" title="Farm Coins"><Icon name="coin" size={26} /><span>{player.coins}</span></div>
      <div className="pill" data-testid="gems"><Icon name="gem" size={26} /><span>{player.gems}</span></div>
      <button className="round-btn" onClick={() => useFarm.getState().setQuestsOpen(true)} aria-label="Quests" data-testid="quests-btn">
        <Icon name="quest" size={26} />
        {claimable > 0 && <span className="badge" data-testid="quest-badge">{claimable}</span>}
      </button>
      <button className="round-btn" onClick={() => useFarm.getState().setInfoPanel('settings')} aria-label="Settings" data-testid="settings">
        <Icon name="settings" size={26} />
      </button>
    </header>
  );
}

const NAV = [
  { id: 'farm', label: 'Farm', icon: 'nav_farm', ready: true },
  { id: 'shop', label: 'Shop', icon: 'nav_shop', ready: true },
  { id: 'animals', label: 'Animals', icon: 'nav_animals', ready: true },
  { id: 'market', label: 'Market', icon: 'nav_market', ready: true },
  { id: 'inventory', label: 'Items', icon: 'nav_inventory', ready: true },
  { id: 'map', label: 'Map', icon: 'nav_map', ready: true },
];

export function BottomNav() {
  const showToast = useFarm((s) => s.showToast);
  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      {NAV.map((n) => (
        <button
          key={n.id}
          className={`nav-btn ${n.ready ? (n.id === 'farm' ? 'active' : '') : 'disabled'}`}
          aria-disabled={!n.ready}
          aria-current={n.id === 'farm' ? 'page' : undefined}
          data-testid={`nav-${n.id}`}
          onClick={() => {
            if (!n.ready) showToast(`${n.label} is coming soon`);
            else if (n.id === 'inventory') useFarm.getState().setInventoryOpen(true);
            else if (n.id === 'map') useFarm.getState().setMapOpen(true);
            else if (n.id === 'market') useFarm.getState().setMarketTab('orders');
            else if (n.id === 'shop') useFarm.getState().setShopTab('factories');
            else if (n.id === 'animals') useFarm.getState().setShopTab('habitats');
            else bus.emit('camera:reset');
          }}
        >
          <Icon name={n.icon} size={34} />
          <span>{n.label}</span>
          {!n.ready && <i className="soon-dot" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
}

export function InfoPanel() {
  const id = useFarm((s) => s.openPanel);
  const setOpenPanel = useFarm((s) => s.setOpenPanel);
  const info = id ? farmLayout.info[id] : null;
  const close = () => { setOpenPanel(null); bus.emit('ui:panelClosed'); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!info) return null;
  return (
    <aside className="info-panel" role="dialog" aria-label={info.title} data-testid="info-panel">
      <div className="ribbon">{info.title}</div>
      <p>{info.text}</p>
      <ul>{info.lines.map((l) => <li key={l}>{l}</li>)}</ul>
      <div className="panel-actions">
        <button className="btn disabled" aria-disabled="true" onClick={() => useFarm.getState().showToast('Upgrades are coming soon')}>Upgrade · soon</button>
        <button className="btn" onClick={close} data-testid="panel-close">Close</button>
      </div>
    </aside>
  );
}

export function TileChip() {
  const t = useFarm((s) => s.selectedTile);
  if (!t) return null;
  const label = t.objectId ? t.objectId.replace(/_/g, ' ') : t.terrain.replace(/_/g, ' ');
  return <div className="tile-chip" data-testid="tile-chip">Tile {t.gx}, {t.gy} · {label}</div>;
}

export function Toast() {
  const toast = useFarm((s) => s.toast);
  const clear = useFarm((s) => s.clearToast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => clear(toast.id), 1800);
    return () => clearTimeout(t);
  }, [toast, clear]);
  if (!toast) return null;
  return <div className="toast" role="status" data-testid="toast">{toast.text}</div>;
}

export function RecenterButton() {
  return (
    <button className="round-btn recenter" onClick={() => bus.emit('camera:reset')} aria-label="Recenter farm" data-testid="recenter">
      <Icon name="expand" size={26} />
    </button>
  );
}
