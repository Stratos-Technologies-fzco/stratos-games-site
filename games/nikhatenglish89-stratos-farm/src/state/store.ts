import { create } from 'zustand';
import { xpForNextLevel } from '../game/rules';
import { loadPrefs, Prefs } from '../game/prefs';
import type { AnimalState, BuildingState, FarmSnapshot, JobState, OrderState, PlotState } from '../services/types';

export interface SelectedTile { gx: number; gy: number; terrain: string; objectId: string | null }

interface FarmState {
  // player values come from the farm service snapshot (the service is the source of truth)
  player: { name: string; avatar: string; level: number; xp: number; coins: number; gems: number };
  xpNext: number;
  inventory: Record<string, number>;
  plots: PlotState[];
  buildings: BuildingState[];
  animals: AnimalState[];
  jobs: JobState[];
  orders: OrderState[];
  orderCooldowns: Record<string, number>;
  expanded: string[];
  stats: Record<string, number>;
  claimed: string[];
  daily: FarmSnapshot['daily'];
  tutorialDone: boolean;
  farmLoaded: boolean;
  // loading
  loadProgress: number;
  ready: boolean;
  loadError: string | null;
  // world selection and panels
  selectedTile: SelectedTile | null;
  openPanel: string | null; // id of the building whose info panel is open
  seedPlot: string | null; // plot id whose seed picker is open
  inventoryOpen: boolean;
  shopTab: 'habitats' | 'factories' | 'decor' | null; // shop panel open on this tab
  obstaclePanel: string | null; // rock, tree or bush whose clear panel is open
  /** Planting mode: the crop picked in the seed list; every tap on an empty field plants it until the player is done. */
  plantSeed: string | null;
  moved: Record<string, { gx: number; gy: number }>;
  objectPanel: string | null; // a fixed object (lamp post, well, silo...) whose panel is open
  clearedObstacles: string[];
  buildingPanel: string | null; // building id whose panel is open
  placing: { type: string; moveId?: string; objectId?: string; flip?: boolean; gx: number | null; gy: number | null; valid: boolean; reason?: string } | null;
  marketTab: 'orders' | 'sell' | null;
  questsOpen: boolean;
  mapOpen: boolean;
  expansionPanel: string | null;
  screen: 'home' | 'game';
  infoPanel: 'how' | 'tips' | 'about' | 'settings' | null;
  plotInfo: string | null; // growing plot whose countdown / speed-up panel is open
  prefs: Prefs;
  toast: { id: number; text: string } | null;
  /** Bumps once a second so countdowns and the "harvest all" button refresh. */
  tick: number;

  applySnapshot: (s: FarmSnapshot) => void;
  setProgress: (p: number) => void;
  setReady: () => void;
  setLoadError: (m: string) => void;
  selectTile: (t: SelectedTile | null) => void;
  setOpenPanel: (id: string | null) => void;
  setSeedPlot: (id: string | null) => void;
  setInventoryOpen: (open: boolean) => void;
  setShopTab: (t: 'habitats' | 'factories' | 'decor' | null) => void;
  setObstaclePanel: (id: string | null) => void;
  setPlantSeed: (id: string | null) => void;
  closeScreens: () => void;
  setObjectPanel: (id: string | null) => void;
  setBuildingPanel: (id: string | null) => void;
  setPlacing: (p: FarmState['placing']) => void;
  setMarketTab: (t: 'orders' | 'sell' | null) => void;
  setQuestsOpen: (open: boolean) => void;
  setMapOpen: (open: boolean) => void;
  setExpansionPanel: (id: string | null) => void;
  setScreen: (s: 'home' | 'game') => void;
  setInfoPanel: (p: 'how' | 'tips' | 'about' | 'settings' | null) => void;
  setPlotInfo: (id: string | null) => void;
  setPrefs: (p: Prefs) => void;
  showToast: (text: string) => void;
  clearToast: (id: number) => void;
  bumpTick: () => void;
}

let toastId = 0;

/** Opening a big screen (shop, market, items, quests, map) closes the small pop-ups about one thing on the farm, so two never pile up on the left. */
const CLOSE_SMALL = { openPanel: null, obstaclePanel: null, objectPanel: null, plotInfo: null, seedPlot: null, buildingPanel: null, expansionPanel: null } as const;

/** Only one big screen at a time: opening one closes the others. */
const CLOSE_SCREENS = { shopTab: null, marketTab: null, inventoryOpen: false, questsOpen: false, mapOpen: false } as const;

export const useFarm = create<FarmState>((set) => ({
  player: { name: 'Farmer', avatar: 'farmer_boy_portrait', level: 1, xp: 0, coins: 0, gems: 0 },
  xpNext: xpForNextLevel(1),
  inventory: {},
  plots: [],
  buildings: [],
  animals: [],
  jobs: [],
  orders: [],
  orderCooldowns: {},
  expanded: [],
  stats: {},
  claimed: [],
  daily: { day: -1, ids: [], base: {}, claimed: [] },
  tutorialDone: true,
  farmLoaded: false,
  loadProgress: 0,
  ready: false,
  loadError: null,
  selectedTile: null,
  openPanel: null,
  seedPlot: null,
  inventoryOpen: false,
  shopTab: null,
  obstaclePanel: null,
  plantSeed: null,
  moved: {},
  objectPanel: null,
  clearedObstacles: [],
  buildingPanel: null,
  placing: null,
  marketTab: null,
  questsOpen: false,
  mapOpen: false,
  expansionPanel: null,
  screen: 'home',
  infoPanel: null,
  plotInfo: null,
  prefs: loadPrefs(),
  toast: null,
  tick: 0,

  applySnapshot: (s) => set((st) => ({
    player: { ...st.player, level: s.level, xp: s.xp, coins: s.coins, gems: s.gems },
    xpNext: xpForNextLevel(s.level),
    inventory: s.inventory,
    plots: s.plots,
    buildings: s.buildings,
    animals: s.animals,
    jobs: s.jobs,
    orders: s.orders,
    orderCooldowns: s.orderCooldowns,
    expanded: s.expanded,
    clearedObstacles: s.clearedObstacles,
    moved: s.moved,
    stats: s.stats,
    claimed: s.claimed,
    daily: s.daily,
    tutorialDone: s.tutorialDone,
    farmLoaded: true,
  })),
  setProgress: (loadProgress) => set({ loadProgress }),
  setReady: () => set({ ready: true, loadProgress: 1 }),
  setLoadError: (loadError) => set({ loadError }),
  selectTile: (selectedTile) => set({ selectedTile }),
  setOpenPanel: (openPanel) => set({ openPanel }),
  setSeedPlot: (seedPlot) => set({ seedPlot }),
  setInventoryOpen: (inventoryOpen) => set(inventoryOpen ? { ...CLOSE_SMALL, ...CLOSE_SCREENS, inventoryOpen } : { inventoryOpen }),
  setShopTab: (shopTab) => set(shopTab ? { ...CLOSE_SMALL, ...CLOSE_SCREENS, shopTab } : { shopTab }),
  setObstaclePanel: (obstaclePanel) => set({ obstaclePanel }),
  setPlantSeed: (plantSeed) => set({ plantSeed }),
  setObjectPanel: (objectPanel) => set({ objectPanel }),
  setBuildingPanel: (buildingPanel) => set({ buildingPanel }),
  setPlacing: (placing) => set({ placing }),
  closeScreens: () => set({ ...CLOSE_SMALL, ...CLOSE_SCREENS }),
  setMarketTab: (marketTab) => set(marketTab ? { ...CLOSE_SMALL, ...CLOSE_SCREENS, marketTab } : { marketTab }),
  setQuestsOpen: (questsOpen) => set(questsOpen ? { ...CLOSE_SMALL, ...CLOSE_SCREENS, questsOpen } : { questsOpen }),
  setMapOpen: (mapOpen) => set(mapOpen ? { ...CLOSE_SMALL, ...CLOSE_SCREENS, mapOpen } : { mapOpen }),
  setExpansionPanel: (expansionPanel) => set({ expansionPanel }),
  setScreen: (screen) => set({ screen }),
  setInfoPanel: (infoPanel) => set({ infoPanel }),
  setPlotInfo: (plotInfo) => set({ plotInfo }),
  setPrefs: (prefs) => set({ prefs }),
  showToast: (text) => set({ toast: { id: ++toastId, text } }),
  clearToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : {})),
  bumpTick: () => set((s) => ({ tick: s.tick + 1 })),
}));
