/** XP needed to go from `level` to `level + 1` (seed value from the design brief; later moves to master data). */
export function xpForNextLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}
