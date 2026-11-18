// Typed event bus: the only channel between Phaser (world) and React (HUD), besides the Zustand store.
export interface BusEvents {
  'tile:selected': { gx: number; gy: number; terrain: string; objectId: string | null };
  'object:selected': { id: string };
  'selection:cleared': undefined;
  'ui:panelClosed': undefined;
  'camera:reset': undefined;
  'plot:tapped': { plotId: string; gx: number; gy: number };
  'farm:changed': { plotIds: string[] };
  'fx:float': { gx: number; gy: number; lines: string[]; cropFrame?: string };
}

type Handler<K extends keyof BusEvents> = (payload: BusEvents[K]) => void;

class EventBus {
  private handlers = new Map<keyof BusEvents, Set<Handler<any>>>();

  on<K extends keyof BusEvents>(name: K, fn: Handler<K>): () => void {
    if (!this.handlers.has(name)) this.handlers.set(name, new Set());
    this.handlers.get(name)!.add(fn);
    return () => this.off(name, fn);
  }
  off<K extends keyof BusEvents>(name: K, fn: Handler<K>) { this.handlers.get(name)?.delete(fn); }
  emit<K extends keyof BusEvents>(name: K, payload?: BusEvents[K]) {
    this.handlers.get(name)?.forEach((fn) => fn(payload as BusEvents[K]));
  }
}

export const bus = new EventBus();
