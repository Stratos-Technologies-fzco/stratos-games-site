import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { farmLayout as L, terrainFrameAt, isBuildableTile } from '../src/game/layout';
import { OccupancyMap } from '../src/iso/occupancy';
import { xpForNextLevel } from '../src/game/rules';

const atlasFrames = (key: string): Set<string> =>
  new Set(Object.keys(JSON.parse(readFileSync(`assets/farm/atlases/${key}.json`, 'utf8')).frames));

describe('farm layout data', () => {
  it('places every object without overlap or out-of-bounds', () => {
    const occ = new OccupancyMap(L.cols, L.rows);
    for (const o of L.objects) expect(occ.place(o.id, o.gx, o.gy, { w: o.w, h: o.h }), o.id).toBe(true);
  });
  it('only uses frames that exist in the atlas JSON', () => {
    for (const o of L.objects) {
      if (o.kind === 'field') {
        expect(atlasFrames('atlas_crops').has(`${o.crop}_${o.stage}`), o.id).toBe(true);
        expect(atlasFrames('atlas_terrain').has(o.soil!), o.id).toBe(true);
      } else {
        expect(atlasFrames(o.atlas!).has(o.frame!), `${o.id}: ${o.frame}`).toBe(true);
      }
    }
    const terrain = atlasFrames('atlas_terrain');
    for (const r of L.terrain.rects) { expect(terrain.has(r.frame)).toBe(true); (r.animate ?? []).forEach((f) => expect(terrain.has(f)).toBe(true)); }
    L.terrain.default.forEach((f) => expect(terrain.has(f)).toBe(true));
  });
  it('has farmhouse and barn as interactive 3x3 buildings with info text', () => {
    for (const id of ['farmhouse', 'barn']) {
      const o = L.objects.find((x) => x.id === id)!;
      expect(o.interactive).toBe(true);
      expect([o.w, o.h]).toEqual([3, 3]);
      expect(L.info[id].title).toBeTruthy();
    }
  });
  it('keeps water and locked land unbuildable but grass buildable', () => {
    expect(isBuildableTile(L, 10, 4)).toBe(false); // pond
    expect(isBuildableTile(L, 8, 8)).toBe(false); // locked land
    expect(terrainFrameAt(L, 0, 0).frame).toMatch(/grass/);
    expect(isBuildableTile(L, 0, 0)).toBe(true);
  });
});

describe('rules', () => {
  it('uses round(100 * level^1.5) for XP to next level', () => {
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(2)).toBe(283);
    expect(xpForNextLevel(4)).toBe(800);
  });
});
