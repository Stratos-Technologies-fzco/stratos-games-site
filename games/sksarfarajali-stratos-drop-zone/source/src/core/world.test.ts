import { describe, expect, it } from 'vitest';
import { Colliders, stepBody, type Body } from './collision';
import { POIS, buildWorld, coastDist, generateLoot, inRiver, toWorld } from './world';

const w = buildWorld();
const col = new Colliders(w.terrain, w.placements);
describe('island', () => {
  it('is deterministic', () => { const a = buildWorld(); expect(a.placements.length).toBe(w.placements.length); expect(a.terrain.h[5000]).toBe(w.terrain.h[5000]); });
  it('has land at the centre and sea outside', () => { expect(coastDist(0, 0)).toBeGreaterThan(50); expect(coastDist(-310, -310)).toBeLessThan(0); });
  it('has hills of the right height', () => {
    const tea = toWorld(320, 115), radar = toWorld(525, 125);
    expect(w.terrain.height(tea[0], tea[1])).toBeGreaterThan(15); expect(w.terrain.height(radar[0], radar[1])).toBeGreaterThan(25);
  });
  it('places every location', () => { for (const p of POIS) expect(w.placements.filter((q) => q.poi === p.id).length).toBeGreaterThan(2); });
  it('has a river', () => { const [x, z] = toWorld(300, 420); expect(inRiver(x, z)).toBe(true); });
  it('generates 12-30 loot spawns per location', () => {
    const loot = generateLoot(w, (x, z, y) => col.surfaceBelow(x, z, y), (x, z, y) => col.blocked(x, z, y));
    for (const p of POIS) { const n = loot.filter((l) => l.poi === p.id).length; expect(n).toBeGreaterThanOrEqual(12); expect(n).toBeLessThanOrEqual(30); }
  });
});
describe('controller', () => {
  it('walks on terrain and is stopped by a wall', () => {
    const P = POIS[0]; const house = w.placements.find((p) => p.model === 'house_small')!;
    const b: Body = { x: house.x - 12, y: w.terrain.height(house.x - 12, house.z), z: house.z, vy: 0, onGround: true, crouch: false };
    for (let i = 0; i < 600; i++) stepBody(col, b, { dx: 1, dz: 0, speed: 4.5, jump: false, crouch: false }, 1 / 30);
    expect(b.onGround).toBe(true); void P;
    expect(b.x).toBeLessThan(house.x + 8);
  });
  it('falls onto the ground', () => {
    const b: Body = { x: 0, y: 50, z: 0, vy: 0, onGround: false, crouch: false };
    for (let i = 0; i < 300; i++) stepBody(col, b, { dx: 0, dz: 0, speed: 0, jump: false, crouch: false }, 1 / 30);
    expect(b.onGround).toBe(true); expect(Math.abs(b.y - w.terrain.height(0, 0))).toBeLessThan(0.01);
  });
});
