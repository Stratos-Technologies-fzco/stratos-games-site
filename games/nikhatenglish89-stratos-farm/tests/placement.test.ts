import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV, WorldConfig } from '../src/services/LocalFarmService';

const WORLD: WorldConfig = {
  cols: 12, rows: 12, plotCells: [{ gx: 0, gy: 0 }],
  staticObjects: [{ id: 'field', gx: 0, gy: 0, w: 1, h: 1 }, { id: 'rock', gx: 10, gy: 10, w: 1, h: 1 }],
  isBuildable: (x, y) => !(x >= 8 && x <= 9 && y >= 2 && y <= 3), // a locked patch
};
const make = () => new LocalFarmService(WORLD, new MemoryKV(), { now: () => 1_000_000 });

describe('canPlace answers without changing anything', () => {
  it('says why a spot does not work', async () => {
    const svc = make();
    expect(svc.canPlace('chicken_coop', 4, 4)).toEqual({ valid: true, reason: 'ok' });
    expect(svc.canPlace('chicken_coop', 9, 10)).toEqual({ valid: false, reason: 'occupied' });   // the rock at 10,10
    expect(svc.canPlace('chicken_coop', 8, 2)).toEqual({ valid: false, reason: 'locked' });
    expect(svc.canPlace('chicken_coop', 11, 11)).toEqual({ valid: false, reason: 'out_of_bounds' });
    expect(svc.canPlace('castle', 4, 4)).toEqual({ valid: false, reason: 'unknown' });
    expect((await svc.load()).buildings).toHaveLength(0);
    expect((await svc.load()).coins).toBe(100);
  });
  it('the same building fits when the selected tile is a different corner of it', () => {
    const svc = make();
    // selecting 9,10: as the top corner it hits the rock, as the bottom-right corner (origin 8,9) it fits
    const tries: [number, number][] = [[0, 0], [-1, 0], [0, -1], [-1, -1]];
    const fits = tries.map(([dx, dy]) => svc.canPlace('chicken_coop', 9 + dx, 10 + dy).valid);
    expect(fits).toEqual([false, true, false, true]);
  });
});
