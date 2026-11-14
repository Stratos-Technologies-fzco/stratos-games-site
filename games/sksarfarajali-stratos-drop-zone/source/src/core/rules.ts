// Pure game rules: damage, falloff, armour, inventory, kiosk, barrier and Monsoon Wall timing.
import B from '../balance.json';

export type WeaponId = keyof typeof B.weapons;
export type Rarity = 0 | 1 | 2 | 3;
export const WEAPON_IDS = Object.keys(B.weapons) as WeaponId[];

/** Damage of one pellet/bullet before armour: rarity bonus and linear falloff to 50% at twice the effective range. */
export function baseDamage(w: WeaponId, rarity: Rarity, dist: number, headshot: boolean): number {
  const d = B.weapons[w];
  let dmg = d.damage * (1 + B.rarity.damageBonus[rarity]);
  if (dist > d.range) dmg *= Math.max(B.falloff.minAtDoubleRange, 1 - (1 - B.falloff.minAtDoubleRange) * Math.min(1, (dist - d.range) / d.range));
  if (headshot) dmg *= d.headshot;
  return dmg;
}

export interface Armour { vestLv: number; vestDur: number; helmetLv: number }
export interface HitResult { hp: number; vestDamage: number }
/** Apply armour: vest cuts body damage and wears down; helmet cuts headshots. Zone damage skips this. */
export function applyArmour(dmg: number, headshot: boolean, a: Armour): HitResult {
  if (headshot) {
    const r = a.helmetLv > 0 ? B.armour.helmet.headReduction[a.helmetLv - 1] : 0;
    return { hp: dmg * (1 - r), vestDamage: 0 };
  }
  if (a.vestLv > 0 && a.vestDur > 0) {
    const r = B.armour.vest.reduction[a.vestLv - 1], absorbed = dmg * r;
    return { hp: dmg - absorbed, vestDamage: Math.min(a.vestDur, absorbed) };
  }
  return { hp: dmg, vestDamage: 0 };
}

export const fallDamage = (fallMeters: number) => (fallMeters > B.player.fallDamageMin ? Math.round((fallMeters - B.player.fallDamageMin) * B.player.fallDamagePerMeter) : 0);
export const grenadeDamage = (dist: number) => (dist >= B.throwables.frag_grenade.radius ? 0 : Math.round(B.throwables.frag_grenade.damage * (1 - dist / B.throwables.frag_grenade.radius)));

// ---------- inventory ----------
export type ItemKind = 'weapon' | 'ammo' | 'heal' | 'vest' | 'helmet' | 'backpack' | 'throwable' | 'tokens';
export interface Item { kind: ItemKind; id: string; rarity: Rarity; qty: number }
export const STACK_CAP: Record<string, number> = { bandage: 10, medkit: 3, armour_repair_kit: 3, frag_grenade: 3, smoke_can: 3, light: 180, heavy: 180, shells: 48 };
export interface GunSlot { id: WeaponId; rarity: Rarity; mag: number }

export class Inventory {
  main: (GunSlot | null)[] = [null, null];
  pistol: GunSlot | null = null;
  stacks = new Map<string, number>(); // backpack: one stack per id (ammo, heals, throwables)
  backpackLv = 0; barriers = 0; tokens = 0;
  get capacity() { return B.armour.backpack.baseStacks + (this.backpackLv ? B.armour.backpack.extraStacks[this.backpackLv - 1] : 0); }
  get used() { return this.stacks.size; }
  count(id: string) { return this.stacks.get(id) ?? 0; }
  /** Adds to a backpack stack; returns how many were actually stored. */
  add(id: string, qty: number): number {
    const cap = STACK_CAP[id] ?? 99; const have = this.stacks.get(id);
    if (have === undefined) { if (this.used >= this.capacity) return 0; const n = Math.min(cap, qty); this.stacks.set(id, n); return n; }
    const n = Math.min(cap - have, qty); this.stacks.set(id, have + n); return n;
  }
  take(id: string, qty: number): boolean {
    const have = this.stacks.get(id) ?? 0; if (have < qty) return false;
    if (have === qty) this.stacks.delete(id); else this.stacks.set(id, have - qty); return true;
  }
  setBackpack(lv: number) { this.backpackLv = lv; }
  addBarrier(): boolean { if (this.barriers >= B.throwables.monsoon_barrier.carry) return false; this.barriers++; return true; }
}

// ---------- kiosk ----------
export interface KioskState { lastAt: number }
export type PurchaseResult = { ok: true } | { ok: false; reason: 'cooldown' | 'tokens' | 'full' | 'unknown' };
export function purchase(inv: Inventory, itemId: string, now: number, st: KioskState): PurchaseResult {
  const it = B.kiosk.items.find((i) => i.id === itemId); if (!it) return { ok: false, reason: 'unknown' };
  if (now - st.lastAt < B.kiosk.cooldown) return { ok: false, reason: 'cooldown' };
  if (inv.tokens < it.price) return { ok: false, reason: 'tokens' };
  const id = it.id === 'ammo' ? 'light' : it.id; const qty = it.id === 'ammo' ? B.ammo.light.pickup : it.qty;
  if (inv.add(id, qty) === 0) return { ok: false, reason: 'full' };
  inv.tokens -= it.price; st.lastAt = now; return { ok: true };
}

// ---------- barrier ----------
export class BarrierState {
  hp = B.throwables.monsoon_barrier.hp; age = 0;
  hit(d: number) { this.hp = Math.max(0, this.hp - d); }
  tick(dt: number) { this.age += dt; }
  get alive() { return this.hp > 0 && this.age < B.throwables.monsoon_barrier.lifetime; }
}

// ---------- Monsoon Wall ----------
export interface ZoneState { phase: number; stage: 'wait' | 'shrink' | 'done'; cx: number; cz: number; radius: number; nextCx: number; nextCz: number; nextRadius: number; dps: number; timeLeft: number }
export interface ZonePlan { centers: [number, number][]; radii: number[] }
/** Builds nested circles: each new circle fits fully inside the previous one. */
export function planZone(rng: () => number): ZonePlan {
  const centers: [number, number][] = [[(rng() * 2 - 1) * B.zone.firstCenterJitter, (rng() * 2 - 1) * B.zone.firstCenterJitter]];
  const radii = [B.zone.firstRadius];
  for (const ph of B.zone.phases) {
    const pr = radii[radii.length - 1], [pcx, pcz] = centers[centers.length - 1], room = Math.max(0, pr - ph.endRadius);
    const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * room;
    centers.push([pcx + Math.cos(a) * d, pcz + Math.sin(a) * d]); radii.push(ph.endRadius);
  }
  return { centers, radii };
}
export function zoneAt(plan: ZonePlan, t: number): ZoneState {
  let acc = 0;
  for (let i = 0; i < B.zone.phases.length; i++) {
    const ph = B.zone.phases[i], [cx0, cz0] = plan.centers[i], [cx1, cz1] = plan.centers[i + 1], r0 = plan.radii[i], r1 = plan.radii[i + 1];
    if (t < acc + ph.wait) return { phase: i + 1, stage: 'wait', cx: cx0, cz: cz0, radius: r0, nextCx: cx1, nextCz: cz1, nextRadius: r1, dps: ph.dps, timeLeft: acc + ph.wait - t };
    acc += ph.wait;
    if (t < acc + ph.shrink) { const k = (t - acc) / ph.shrink; return { phase: i + 1, stage: 'shrink', cx: cx0 + (cx1 - cx0) * k, cz: cz0 + (cz1 - cz0) * k, radius: r0 + (r1 - r0) * k, nextCx: cx1, nextCz: cz1, nextRadius: r1, dps: ph.dps, timeLeft: acc + ph.shrink - t }; }
    acc += ph.shrink;
  }
  const n = B.zone.phases.length, last = plan.centers[n];
  return { phase: n, stage: 'done', cx: last[0], cz: last[1], radius: 0, nextCx: last[0], nextCz: last[1], nextRadius: 0, dps: B.zone.phases[n - 1].dps, timeLeft: 0 };
}
export const zoneDamage = (z: ZoneState, x: number, zz: number) => (Math.hypot(x - z.cx, zz - z.cz) > z.radius ? z.dps : 0);
export const zoneTotalTime = () => B.zone.phases.reduce((s, p) => s + p.wait + p.shrink, 0);

// ---------- weapon timing & progression ----------
export const fireInterval = (w: WeaponId) => { const d = B.weapons[w] as { rpm?: number; swing?: number }; return d.swing ?? 60 / (d.rpm ?? 60); };
export function xpFor(kills: number, damage: number, placement: number): number {
  const p = B.xp.placement as Record<string, number>;
  return kills * B.xp.perKill + Math.floor(damage / 100) * B.xp.per100Damage + (placement === 1 ? p['1'] : placement <= 5 ? p['5'] : placement <= 10 ? p['10'] : 0);
}
