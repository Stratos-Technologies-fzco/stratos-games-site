import { cellsOf, Footprint } from './grid';
import { OccupancyMap } from './occupancy';

export type PlacementReason = 'ok' | 'out_of_bounds' | 'occupied' | 'locked';
export interface PlacementResult {
  valid: boolean;
  reason: PlacementReason;
  cells: { gx: number; gy: number; ok: boolean }[];
}

/** Validate a footprint at (gx,gy). `isBuildable` lets the caller refuse tiles (water, locked land). */
export function validatePlacement(
  occ: OccupancyMap, gx: number, gy: number, fp: Footprint,
  isBuildable: (gx: number, gy: number) => boolean = () => true,
  ignoreId?: string,
): PlacementResult {
  let reason: PlacementReason = 'ok';
  const cells = cellsOf(gx, gy, fp).map((c) => {
    let ok = true;
    if (!occ.inBounds(c.gx, c.gy)) { ok = false; reason = 'out_of_bounds'; }
    else if (!isBuildable(c.gx, c.gy)) { ok = false; if (reason === 'ok') reason = 'locked'; }
    else {
      const who = occ.occupantAt(c.gx, c.gy);
      if (who !== undefined && who !== ignoreId) { ok = false; if (reason === 'ok') reason = 'occupied'; }
    }
    return { ...c, ok };
  });
  return { valid: cells.every((c) => c.ok), reason, cells };
}
