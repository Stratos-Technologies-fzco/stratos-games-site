// Stratos Coins (the shared site wallet). The game keeps no coins of its own; it only asks the page.
// Returns null when the page has no coins (the game opened on its own, or coins switched off), and the game then plays as before.
export interface StratosCoins { offer(kind: string, onDone: () => void, opts?: { title?: string; what?: string; onCancel?: () => void }): void; price(kind: string): number | null }

export function stratosCoins(kind = 'continue'): StratosCoins | null {
  try {
    const w = window as unknown as { Stratos?: { coins?: StratosCoins & { enabled(): boolean } } };
    const c = (w.Stratos || (window.parent as unknown as typeof w).Stratos)?.coins;
    return c && typeof c.offer === 'function' && c.enabled() && c.price(kind) !== null ? c : null;
  } catch { return null; }
}
