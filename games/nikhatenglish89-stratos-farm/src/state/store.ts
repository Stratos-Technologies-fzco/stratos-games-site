import { create } from 'zustand';
import { xpForNextLevel } from '../game/rules';
import type { FarmSnapshot, PlotState } from '../services/types';

export interface SelectedTile { gx: number; gy: number; terrain: string; objectId: string | null }

interface FarmState {
  // player values come from the farm service snapshot (the service is the source of truth)
  player: { name: string; avatar: string; level: number; xp: number; coins: number; gems: number };
  xpNext: number;
  inventory: Record<string, number>;
  plots: PlotState[];
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
  farmLoaded: false,
  loadProgress: 0,
  ready: false,
  loadError: null,
  selectedTile: null,
  openPanel: null,
  seedPlot: null,
  inventoryOpen: false,
  toast: null,
  tick: 0,

  applySnapshot: (s) => set((st) => ({
    player: { ...st.player, level: s.level, xp: s.xp, coins: s.coins, gems: s.gems },
    xpNext: xpForNextLevel(s.level),
    inventory: s.inventory,
    plots: s.plots,
    farmLoaded: true,
  })),
  setProgress: (loadProgress) => set({ loadProgress }),
  setReady: () => set({ ready: true, loadProgress: 1 }),
  setLoadError: (loadError) => set({ loadError }),
  selectTile: (selectedTile) => set({ selectedTile }),
  setOpenPanel: (openPanel) => set({ openPanel }),
  setSeedPlot: (seedPlot) => set({ seedPlot }),
  setInventoryOpen: (inventoryOpen) => set({ inventoryOpen }),
  showToast: (text) => set({ toast: { id: ++toastId, text } }),
  clearToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : {})),
  bumpTick: () => set((s) => ({ tick: s.tick + 1 })),
}));
