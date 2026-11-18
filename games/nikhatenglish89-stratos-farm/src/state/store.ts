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
  shopTab: 'habitats' | 'factories' | null; // shop panel open on this tab
  buildingPanel: string | null; // building id whose panel is open
  placing: { type: string; moveId?: string; gx: number | null; gy: number | null; valid: boolean } | null;
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
  setShopTab: (t: 'habitats' | 'factories' | null) => void;
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
  setInventoryOpen: (inventoryOpen) => set({ inventoryOpen }),
  setShopTab: (shopTab) => set({ shopTab }),
  setBuildingPanel: (buildingPanel) => set({ buildingPanel }),
  setPlacing: (placing) => set({ placing }),
  setMarketTab: (marketTab) => set({ marketTab }),
  setQuestsOpen: (questsOpen) => set({ questsOpen }),
  setMapOpen: (mapOpen) => set({ mapOpen }),
  setExpansionPanel: (expansionPanel) => set({ expansionPanel }),
  setScreen: (screen) => set({ screen }),
  setInfoPanel: (infoPanel) => set({ infoPanel }),
  setPlotInfo: (plotInfo) => set({ plotInfo }),
  setPrefs: (prefs) => set({ prefs }),
  showToast: (text) => set({ toast: { id: ++toastId, text } }),
  clearToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : {})),
  bumpTick: () => set((s) => ({ tick: s.tick + 1 })),
}));
