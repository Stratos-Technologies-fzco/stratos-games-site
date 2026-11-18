import { GameCanvas } from './GameCanvas';
import { BottomNav, InfoPanel, RecenterButton, TileChip, Toast, TopBar } from './Hud';
import { useFarm } from '../state/store';
import { HarvestAllButton, InventoryPanel, SeedPanel } from './Panels';
import { BuildingPanel, PlacementBar, ShopPanel } from './BuildingPanels';
import { ExpansionPanel, MarketPanel, PlotPanel, QuestsPanel, TutorialBanner } from './EconomyPanels';
import { AboutPanel, HomeScreen, HowToPlayPanel, Logo, SettingsPanel, TipsPanel } from './Home';

export function App() {
  const ready = useFarm((s) => s.ready);
  const progress = useFarm((s) => s.loadProgress);
  const error = useFarm((s) => s.loadError);
  const screen = useFarm((s) => s.screen);
  const playing = ready && !error && screen === 'game';
  return (
    <div className="app">
      <GameCanvas />
      {ready && !error && <HomeScreen />}
      {playing && (
        <>
          <TopBar />
          <TileChip />
          <RecenterButton />
          <InfoPanel />
          <SeedPanel />
          <PlotPanel />
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
        </>
      )}
      {ready && !error && (
        <>
          <HowToPlayPanel />
          <TipsPanel />
          <AboutPanel />
          <SettingsPanel />
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
              <Logo />
              <div className="load-bar"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
