import { create } from 'zustand';
import { xpForNextLevel } from '../game/rules';

export interface SelectedTile { gx: number; gy: number; terrain: string; objectId: string | null }

interface FarmState {
  // player display values (Phase 1: seed values, not yet persisted)
  player: { name: string; avatar: string; level: number; xp: number; coins: number; gems: number };
  xpNext: number;
  // loading
  loadProgress: number;
  ready: boolean;
  loadError: string | null;
  // world selection
  selectedTile: SelectedTile | null;
  openPanel: string | null; // id of the object whose info panel is open
  toast: { id: number; text: string } | null;

  setProgress: (p: number) => void;
  setReady: () => void;
  setLoadError: (m: string) => void;
  selectTile: (t: SelectedTile | null) => void;
  setOpenPanel: (id: string | null) => void;
  showToast: (text: string) => void;
  clearToast: (id: number) => void;
}

let toastId = 0;

export const useFarm = create<FarmState>((set) => ({
  player: { name: 'Farmer', avatar: 'farmer_boy_portrait', level: 1, xp: 0, coins: 100, gems: 5 },
  xpNext: xpForNextLevel(1),
  loadProgress: 0,
  ready: false,
  loadError: null,
  selectedTile: null,
  openPanel: null,
  toast: null,

  setProgress: (loadProgress) => set({ loadProgress }),
  setReady: () => set({ ready: true, loadProgress: 1 }),
  setLoadError: (loadError) => set({ loadError }),
  selectTile: (selectedTile) => set({ selectedTile }),
  setOpenPanel: (openPanel) => set({ openPanel }),
  showToast: (text) => set({ toast: { id: ++toastId, text } }),
  clearToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : {})),
}));
