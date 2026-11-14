// Stratos analytics only (the shared script on stratos.games). Never add other trackers.
export function track(name: string, details?: Record<string, unknown>) {
  try {
    const w = window as unknown as { Stratos?: { track: (n: string, d?: unknown) => void } };
    const S = w.Stratos || (window.parent as unknown as typeof w).Stratos;
    if (S) S.track(name, details);
  } catch { /* analytics must never break the game */ }
}
