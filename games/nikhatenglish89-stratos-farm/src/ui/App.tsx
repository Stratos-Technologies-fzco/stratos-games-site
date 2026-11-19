import { useEffect } from 'react';
import { GameCanvas } from './GameCanvas';
import { farm } from '../game/controller';
import { bus } from '../game/eventBus';
import { BottomNav, InfoPanel, RecenterButton, TileChip, Toast, TopBar } from './Hud';
import { useFarm } from '../state/store';
import { HarvestAllButton, InventoryPanel, PlantingBar, SeedPanel } from './Panels';
import { BuildingPanel, PlacementBar, ShopPanel } from './BuildingPanels';
import { ExpansionPanel, MarketPanel, ObjectPanel, ObstaclePanel, PlotPanel, QuestsPanel, TutorialBanner } from './EconomyPanels';
import { MapPanel } from './MapPanel';
import { AboutPanel, HomeScreen, HowToPlayPanel, Logo, SettingsPanel, TipsPanel } from './Home';

export function App() {
  const ready = useFarm((s) => s.ready);
  const progress = useFarm((s) => s.loadProgress);
  const error = useFarm((s) => s.loadError);
  const screen = useFarm((s) => s.screen);
  const playing = ready && !error && screen === 'game';
  useEffect(() => {
    // Escape: cancel placing, otherwise close the top panel
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const st = useFarm.getState();
      const clear = () => { st.selectTile(null); bus.emit('ui:panelClosed'); };   // Escape also drops the selected spot and its marker
      if (st.placing) { farm.cancelPlacing(); clear(); return; }
      if (st.plantSeed && !st.seedPlot) { farm.cancelPlanting(); clear(); return; }
      if (st.infoPanel) { st.setInfoPanel(null); return; }
      if (st.seedPlot) st.setSeedPlot(null);
      else if (st.plotInfo) st.setPlotInfo(null);
      else if (st.buildingPanel) st.setBuildingPanel(null);
      else if (st.shopTab) st.setShopTab(null);
      else if (st.marketTab) st.setMarketTab(null);
      else if (st.inventoryOpen) st.setInventoryOpen(false);
      else if (st.questsOpen) st.setQuestsOpen(false);
      else if (st.mapOpen) st.setMapOpen(false);
      else if (st.expansionPanel) st.setExpansionPanel(null);
      else if (st.obstaclePanel) st.setObstaclePanel(null);
      else if (st.objectPanel) st.setObjectPanel(null);
      clear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
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
          <PlantingBar />
          <PlotPanel />
          <InventoryPanel />
          <ShopPanel />
          <BuildingPanel />
          <PlacementBar />
          <MarketPanel />
          <MapPanel />
          <QuestsPanel />
          <ExpansionPanel />
          <ObstaclePanel />
          <ObjectPanel />
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
