import { describe, expect, it } from 'vitest';
import B from '../balance.json';
import { Inventory, BarrierState, applyArmour, baseDamage, fallDamage, planZone, purchase, xpFor, zoneAt, zoneDamage, zoneTotalTime } from './rules';
import { mulberry32 } from './world';

describe('damage', () => {
  it('rarity adds +0/5/10/15%', () => {
    expect(baseDamage('monsoon_ar', 0, 10, false)).toBeCloseTo(24);
    expect(baseDamage('monsoon_ar', 3, 10, false)).toBeCloseTo(24 * 1.15);
  });
  it('headshot multiplies', () => expect(baseDamage('longwatch', 0, 10, true)).toBeCloseTo(160));
  it('falls off to 50% at twice range, flat inside range', () => {
    expect(baseDamage('monsoon_ar', 0, 80, false)).toBeCloseTo(24);
    expect(baseDamage('monsoon_ar', 0, 120, false)).toBeCloseTo(18);
    expect(baseDamage('monsoon_ar', 0, 160, false)).toBeCloseTo(12);
    expect(baseDamage('monsoon_ar', 0, 500, false)).toBeCloseTo(12);
  });
  it('vest reduces body damage and wears down', () => {
    const r = applyArmour(50, false, { vestLv: 3, vestDur: 200, helmetLv: 0 });
    expect(r.hp).toBeCloseTo(30); expect(r.vestDamage).toBeCloseTo(20);
  });
  it('broken vest and helmet rules', () => {
    expect(applyArmour(50, false, { vestLv: 1, vestDur: 0, helmetLv: 0 }).hp).toBe(50);
    expect(applyArmour(100, true, { vestLv: 3, vestDur: 200, helmetLv: 2 }).hp).toBeCloseTo(65);
  });
  it('fall damage only past 8 m', () => { expect(fallDamage(8)).toBe(0); expect(fallDamage(12)).toBe(20); });
});

describe('inventory', () => {
  it('has 6 base stacks and backpacks add more', () => {
    const inv = new Inventory();
    for (let i = 0; i < 6; i++) expect(inv.add('s' + i, 1)).toBe(1);
    expect(inv.add('extra', 1)).toBe(0);
    inv.setBackpack(2); expect(inv.capacity).toBe(10); expect(inv.add('extra', 1)).toBe(1);
  });
  it('respects stack caps', () => { const inv = new Inventory(); expect(inv.add('medkit', 5)).toBe(3); expect(inv.add('medkit', 1)).toBe(0); });
  it('limits barriers to 2', () => { const inv = new Inventory(); expect(inv.addBarrier()).toBe(true); expect(inv.addBarrier()).toBe(true); expect(inv.addBarrier()).toBe(false); });
});

describe('kiosk', () => {
  it('validates tokens, cooldown and space', () => {
    const inv = new Inventory(), st = { lastAt: -99 };
    expect(purchase(inv, 'medkit', 0, st)).toEqual({ ok: false, reason: 'tokens' });
    inv.tokens = 200;
    expect(purchase(inv, 'medkit', 0, st)).toEqual({ ok: true }); expect(inv.tokens).toBe(125);
    expect(purchase(inv, 'bandage', 1, st)).toEqual({ ok: false, reason: 'cooldown' });
    expect(purchase(inv, 'bandage', 2.5, st)).toEqual({ ok: true }); expect(inv.count('bandage')).toBe(3);
    expect(purchase(inv, 'nope', 9, st)).toEqual({ ok: false, reason: 'unknown' });
  });
});

describe('barrier', () => {
  it('has 800 HP and lasts 30 s', () => {
    const b = new BarrierState(); expect(b.hp).toBe(800); b.hit(799); expect(b.alive).toBe(true); b.hit(1); expect(b.alive).toBe(false);
    const c = new BarrierState(); c.tick(29.9); expect(c.alive).toBe(true); c.tick(0.2); expect(c.alive).toBe(false);
  });
});

describe('monsoon wall', () => {
  const plan = planZone(mulberry32(5));
  it('total time matches the phase table', () => expect(zoneTotalTime()).toBe(45 + 30 + 35 + 25 + 30 + 20 + 25 + 15 + 20 + 15 + 15 + 20));
  it('starts waiting in phase 1 and shrinks after the wait', () => {
    expect(zoneAt(plan, 1).stage).toBe('wait'); expect(zoneAt(plan, 1).phase).toBe(1);
    const s = zoneAt(plan, 60); expect(s.stage).toBe('shrink'); expect(s.radius).toBeLessThan(B.zone.firstRadius); expect(s.radius).toBeGreaterThan(220);
  });
  it('each circle sits fully inside the previous', () => {
    for (let i = 1; i < plan.radii.length; i++) {
      const d = Math.hypot(plan.centers[i][0] - plan.centers[i - 1][0], plan.centers[i][1] - plan.centers[i - 1][1]);
      expect(d + plan.radii[i]).toBeLessThanOrEqual(plan.radii[i - 1] + 1e-6);
    }
  });
  it('ends at radius 0 and damage grows', () => {
    const e = zoneAt(plan, zoneTotalTime() + 5); expect(e.radius).toBe(0); expect(e.dps).toBe(15);
    expect(zoneDamage(zoneAt(plan, 0), 5000, 0)).toBe(1);
  });
});

describe('xp', () => { it('adds kills, damage and placement', () => expect(xpFor(3, 250, 1)).toBe(30 + 4 + 150)); });
