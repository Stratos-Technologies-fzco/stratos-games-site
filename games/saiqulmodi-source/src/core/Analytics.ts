// Game analytics, only through the shared Stratos page script (owner's rule, C:\Users\saiqu\GAME_ANALYTICS_RULE.md,
// 31-Oct-2026): one game = one flight, from take-off (level_start) until the jet you fly goes down (game_over with
// the seconds it lasted); the next flight starts the next game. game_open / play_time come from the Stratos script
// itself. No personal data. Never breaks the game: does nothing when Stratos is not there (local, GitHub Pages,
// offline).

import { LEVEL, PLAYER_EDGE } from '../config';

type StratosLike = {
  track: (name: string, details?: Record<string, unknown>) => void;
  coins?: { earn?: (rule: string, ctx: Record<string, unknown>) => { ok?: boolean; amount?: number } | null };
};

function track(name: string, details: Record<string, unknown>): void {
  try {
    const w = window as unknown as { Stratos?: StratosLike; parent?: { Stratos?: StratosLike } };
    const S = w.Stratos || (w.parent && w.parent !== (window as unknown) ? w.parent.Stratos : undefined);
    if (S) S.track(name, details);
  } catch {
    // never let analytics break the game
  }
}

let startedAt = 0;

/** Stratos Coins (16-Nov-2026): an enemy SAM base or launcher destroyed counts as a win (`match_win`, 5/8/12/15 coins
 *  for speed levels 1-25/26-50/51-75/76-100; Stratos pays at most 5 wins a day). Never in two-player mode (Stratos rule:
 *  no coins when friends play together). Returns the text added to the HUD line, e.g. " +8 STRATOS COINS", or "". */
export function targetDestroyed(name: string): string {
  try {
    window.dispatchEvent(new CustomEvent('fighter-kill', { detail: name })); // mission.js counts the war goal
    if (PLAYER_EDGE === 1) return ''; // two players
    const w = window as unknown as { Stratos?: StratosLike; parent?: { Stratos?: StratosLike } };
    const S = w.Stratos || (w.parent && w.parent !== (window as unknown) ? w.parent.Stratos : undefined);
    if (!S || !S.coins || !S.coins.earn) return '';
    const r = S.coins.earn('match_win', { game: 'saiqulmodi', level: Math.min(4, Math.ceil(LEVEL / 25)), ref: `site-${name}-${Date.now()}` });
    return r && r.ok && r.amount ? ` +${r.amount} STRATOS COINS` : '';
  } catch {
    return '';
  }
}

/** a flight begins (take-off / a new jet takes over) */
export function flightStart(level: number): void {
  startedAt = Date.now();
  track('level_start', { level });
}

/** the jet you fly is down: that game is over */
export function flightEnd(score = 0): void {
  if (!startedAt) return;
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  startedAt = 0;
  track('game_over', { seconds, score });
}
