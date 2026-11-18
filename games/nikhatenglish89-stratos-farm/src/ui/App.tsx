import { GameCanvas } from './GameCanvas';
import { BottomNav, InfoPanel, RecenterButton, TileChip, Toast, TopBar } from './Hud';
import { useFarm } from '../state/store';
import { HarvestAllButton, InventoryPanel, SeedPanel } from './Panels';
import { BuildingPanel, PlacementBar, ShopPanel } from './BuildingPanels';
import { ExpansionPanel, MarketPanel, QuestsPanel, TutorialBanner } from './EconomyPanels';

export function App() {
  const ready = useFarm((s) => s.ready);
  const progress = useFarm((s) => s.loadProgress);
  const error = useFarm((s) => s.loadError);
  return (
    <div className="app">
      <GameCanvas />
      {ready && !error && (
        <>
          <TopBar />
          <TileChip />
          <RecenterButton />
          <InfoPanel />
          <SeedPanel />
          <InventoryPanel />
          <ShopPanel />
          <BuildingPanel />
          <PlacementBar />
          <MarketPanel />
          <QuestsPanel />
          <ExpansionPanel />
          <TutorialBanner />
          <HarvestAllButton />
          <BottomNav />
          <Toast />
        </>
      )}
      {!ready && (
        <div className="loading" data-testid="loading">
          {error ? (
            <>
              <h1>Oops</h1>
              <p>{error}. Please reload the page.</p>
            </>
          ) : (
            <>
              <h1>STRATOS FARM</h1>
              <p>MY DREAM VILLAGE</p>
              <div className="load-bar"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
