import { describe, it, expect } from 'vitest';
import { gridToScreen, screenToGrid, screenToGridF, depthKey, cellsOf, worldBounds } from '../src/iso/grid';
import { OccupancyMap } from '../src/iso/occupancy';
import { validatePlacement } from '../src/iso/placement';

describe('iso math', () => {
  it('converts grid to screen with the 2:1 formula', () => {
    expect(gridToScreen(0, 0)).toEqual({ x: 0, y: 0 });
    expect(gridToScreen(1, 0)).toEqual({ x: 64, y: 32 });
    expect(gridToScreen(0, 1)).toEqual({ x: -64, y: 32 });
    expect(gridToScreen(3, 2)).toEqual({ x: 64, y: 160 });
  });
  it('round-trips every tile through its centre', () => {
    for (let gx = -3; gx < 12; gx++) for (let gy = -3; gy < 12; gy++) {
      const p = gridToScreen(gx, gy);
      // the diamond centre is half a tile below the top vertex
      expect(screenToGrid(p.x, p.y + 32)).toEqual({ gx, gy });
    }
  });
  it('inverse is exact for fractional points', () => {
    const f = screenToGridF(64, 32);
    expect(f.x).toBeCloseTo(1);
    expect(f.y).toBeCloseTo(0);
  });
  it('respects a custom tile size', () => {
    const c = { tileW: 64, tileH: 32 };
    expect(gridToScreen(2, 0, c)).toEqual({ x: 64, y: 32 });
    expect(screenToGrid(64, 48, c)).toEqual({ gx: 2, gy: 0 });
  });
  it('sorts by front cell then layer', () => {
    expect(depthKey(3, 3)).toBeGreaterThan(depthKey(2, 3));
    expect(depthKey(0, 0, { w: 3, h: 3 })).toBeGreaterThan(depthKey(1, 1));
    expect(depthKey(2, 2, undefined, 1)).toBeGreaterThan(depthKey(2, 2, undefined, 0));
  });
  it('lists footprint cells', () => {
    expect(cellsOf(2, 3, { w: 2, h: 2 })).toHaveLength(4);
    expect(cellsOf(2, 3, { w: 3, h: 3 })).toContainEqual({ gx: 4, gy: 5 });
  });
  it('computes world bounds', () => {
    const b = worldBounds(10, 10);
    expect(b.width).toBe(1280);
    expect(b.height).toBe(640);
    expect(b.x).toBe(-640);
  });
});

describe('occupancy and placement', () => {
  it('places and rejects overlap', () => {
    const o = new OccupancyMap(10, 10);
    expect(o.place('house', 2, 2, { w: 3, h: 3 })).toBe(true);
    expect(o.occupantAt(4, 4)).toBe('house');
    expect(o.place('mill', 4, 4, { w: 2, h: 2 })).toBe(false);
    expect(o.occupantAt(5, 5)).toBeUndefined(); // a failed place changes nothing
    expect(o.place('mill', 5, 2, { w: 2, h: 2 })).toBe(true);
  });
  it('rejects out of bounds', () => {
    const o = new OccupancyMap(10, 10);
    expect(o.place('x', 9, 9, { w: 2, h: 2 })).toBe(false);
    expect(o.place('x', -1, 0, { w: 1, h: 1 })).toBe(false);
  });
  it('removes an object', () => {
    const o = new OccupancyMap(5, 5);
    o.place('a', 0, 0, { w: 2, h: 2 });
    o.remove('a');
    expect(o.size).toBe(0);
  });
  it('validatePlacement reports reasons per cell', () => {
    const o = new OccupancyMap(10, 10);
    o.place('barn', 0, 0, { w: 3, h: 3 });
    const bad = validatePlacement(o, 2, 2, { w: 2, h: 2 });
    expect(bad.valid).toBe(false);
    expect(bad.reason).toBe('occupied');
    expect(bad.cells.filter((c) => !c.ok)).toHaveLength(1);
    expect(validatePlacement(o, 9, 9, { w: 2, h: 2 }).reason).toBe('out_of_bounds');
    expect(validatePlacement(o, 5, 5, { w: 2, h: 2 }).valid).toBe(true);
    expect(validatePlacement(o, 5, 5, { w: 1, h: 1 }, () => false).reason).toBe('locked');
  });
  it('ignores the moving object itself', () => {
    const o = new OccupancyMap(10, 10);
    o.place('silo', 3, 3, { w: 1, h: 1 });
    expect(validatePlacement(o, 3, 3, { w: 1, h: 1 }, undefined, 'silo').valid).toBe(true);
  });
});
