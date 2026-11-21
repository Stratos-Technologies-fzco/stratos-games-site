import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ANIMALS, BUILDINGS, CROPS, ITEMS } from '../src/services/data';

const atlas = (k: string) => JSON.parse(readFileSync(`assets/farm/atlases/${k}.json`, 'utf8'));
const frames = (k: string) => new Set(Object.keys(atlas(k).frames));

describe('every crop, animal, home and item has its art', () => {
  it('all 16 crops have 4 growth stages in the crops atlas', () => {
    const f = frames('atlas_crops');
    expect(CROPS).toHaveLength(16);
    for (const c of CROPS) for (let s = 0; s < 4; s++) expect(f.has(`${c.id}_${s}`), `${c.id}_${s}`).toBe(true);
  });
  it('all 9 animals have the 5 poses', () => {
    const f = frames('atlas_animals');
    expect(ANIMALS).toHaveLength(9);
    for (const a of ANIMALS) for (const p of ['idle_0', 'idle_1', 'eat', 'walk_0', 'walk_1']) expect(f.has(`${a.id}_${p}`), `${a.id}_${p}`).toBe(true);
  });
  it('every animal home and every item has a picture', () => {
    const hab = frames('atlas_habitats'), ic = frames('atlas_icons'), decor = frames('atlas_decor');
    for (const b of BUILDINGS.filter((x) => x.kind === 'habitat')) expect(hab.has(b.frames[0]), b.id).toBe(true);
    for (const i of ITEMS) expect(i.icon ? decor.has(i.icon.frame) : ic.has(`item_${i.id}`), i.id).toBe(true);
  });
  it('the old art is still there and the animals keep the same anchor rule (feet on the tile)', () => {
    const a = atlas('atlas_animals').frames;
    expect(Object.keys(a)).toEqual(expect.arrayContaining(['chicken_idle_0', 'cow_walk_1', 'pig_eat']));
    for (const name of ['chicken_idle_0', 'turkey_idle_0', 'rabbit_eat', 'horse_walk_1']) {
      const fr = a[name];
      expect(fr.pivot.x).toBe(0.5);
      expect(fr.pivot.y).toBeCloseTo((fr.sourceSize.h - 8) / fr.sourceSize.h, 3);
    }
    expect(atlas('atlas_crops').frames.wheat_3.pivot).toEqual({ x: 0.5, y: 0.5 });
    expect(atlas('atlas_habitats').frames.turkey_pen.pivot.y).toBeCloseTo(atlas('atlas_habitats').frames.chicken_coop.pivot.y, 3);
  });
  it('no atlas is bigger than 2048 x 2048', () => {
    for (const k of ['atlas_crops', 'atlas_animals', 'atlas_habitats', 'atlas_icons']) {
      const { w, h } = atlas(k).meta.size;
      expect(w).toBeLessThanOrEqual(2048);
      expect(h).toBeLessThanOrEqual(2048);
    }
  });
  it('the new animals, crops and homes are balanced like the old ones (profit, unlock order)', () => {
    for (const c of CROPS) expect(c.yield * c.sellPrice, c.id).toBeGreaterThan(c.seedCost);
    const homes = BUILDINGS.filter((b) => b.kind === 'habitat');
    for (const h of homes) {
      const a = ANIMALS.find((x) => x.habitat === h.id)!;
      expect(a, h.id).toBeTruthy();
      expect(h.unlockLevel, h.id).toBe(a.unlockLevel);
    }
    const levels = ANIMALS.map((a) => a.unlockLevel);
    expect(levels).toEqual([...levels].sort((x, y) => x - y)); // listed in unlock order
  });
});
