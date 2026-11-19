// The only place the game talks to the Stratos site (shared wallet, analytics events).
// Everything here is optional: opened on its own, the game plays exactly the same, boosts are simply free.

interface CoinsApi {
  balance?: () => number;
  offer?: (kind: string, onDone: () => void, o?: { label?: string; title?: string; what?: string; onCancel?: () => void; ref?: string }) => void;
  onChange?: (cb: (i: { balance: number }) => void) => () => void;
}
interface StratosApi { track?: (name: string, details?: Record<string, unknown>) => void; coins?: CoinsApi }

function site(): StratosApi | null {
  try {
    const w = globalThis as unknown as { Stratos?: StratosApi; parent?: { Stratos?: StratosApi } };
    return w.Stratos || w.parent?.Stratos || null;
  } catch { return null; }
}

/** The shared Stratos Coins wallet, or null when the game runs outside the site. */
export function SC(): CoinsApi | null { return site()?.coins ?? null; }

/** Analytics / coin events. On the site these pay Stratos Coins automatically (level_start, level_complete with a level number). */
export function track(name: string, details?: Record<string, unknown>) {
  // Written like the site's own snippet on purpose: tools/build.py looks for the text "Stratos ... .track(" in the game's code
  // before it will list a non-kids game, so do not turn this into an optional call (track?.()).
  try { const w = globalThis as { Stratos?: StratosApi; parent?: { Stratos?: StratosApi } }; const S = w.Stratos || (w.parent && w.parent.Stratos); if (S && S.track) S.track(name, details); } catch { /* never let tracking break the game */ }
}

/** Ask the player to pay with Stratos Coins, then run onDone. Without the site it runs onDone straight away. */
export function offerCoins(kind: 'boost' | 'hint', onDone: () => void, o?: { label?: string; title?: string; what?: string; onCancel?: () => void }) {
  const c = SC();
  track('reward_offered', { kind });
  const taken = () => { track('reward_taken', { kind }); onDone(); };
  if (c?.offer) {
    try { c.offer(kind, taken, o); return; } catch { /* fall through to the free path */ }
  }
  taken();
}

export function coinBalance(): number | null {
  try { const c = SC(); return c?.balance ? c.balance() : null; } catch { return null; }
}

export function onCoinsChange(cb: (balance: number) => void): () => void {
  try {
    const c = SC();
    if (c?.onChange) return c.onChange((i) => cb(i.balance));
  } catch { /* ignore */ }
  return () => undefined;
}
