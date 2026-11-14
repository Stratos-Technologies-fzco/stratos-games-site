// Loot tables: what spawns where, with tier-based rarity. Legendary items only appear in supply crates.
import B from '../balance.json';
import { WEAPON_IDS, type Item, type Rarity, type WeaponId } from '../core/rules';
import type { Rng, Tier } from '../core/world';

const pick = <T>(rng: Rng, list: [T, number][]): T => { const tot = list.reduce((s, [, w]) => s + w, 0); let r = rng() * tot; for (const [v, w] of list) { if ((r -= w) <= 0) return v; } return list[list.length - 1][0]; };
const CLASS_W: Record<string, number> = { pistol: 3, smg: 3, shotgun: 2.2, rifle: 2, marksman: 1, sniper: 0.6 };
export const GUNS = WEAPON_IDS.filter((w) => w !== 'tide_machete');

export function rollRarity(tier: Tier, rng: Rng, crate = false): Rarity {
  if (crate) return 3;
  const p = B.loot.tiers[tier].rarity; return pick<Rarity>(rng, [[0, p[0]], [1, p[1]], [2, p[2]]]);
}
export function rollItem(tier: Tier, rng: Rng, crate = false): Item {
  const rarity = rollRarity(tier, rng, crate);
  const kind = crate ? pick(rng, [['weapon', 3], ['armour', 2], ['heal', 2], ['ammo', 1]] as [string, number][]) : pick(rng, Object.entries(B.loot.table) as [string, number][]);
  switch (kind) {
    case 'weapon': {
      const id = pick<WeaponId>(rng, GUNS.map((g) => [g, (CLASS_W[B.weapons[g].class] ?? 1) * (rarity >= 2 && B.weapons[g].class === 'pistol' ? 0.3 : 1)] as [WeaponId, number]));
      return { kind: 'weapon', id, rarity, qty: 1 };
    }
    case 'ammo': { const id = pick(rng, [['light', 1], ['heavy', 1], ['shells', 0.6]] as [string, number][]); return { kind: 'ammo', id, rarity: 0, qty: B.ammo[id as 'light'].pickup }; }
    case 'heal': { const id = pick(rng, [['bandage', 0.55], ['medkit', 0.25], ['armour_repair_kit', 0.2]] as [string, number][]); return { kind: 'heal', id, rarity: id === 'medkit' ? 1 : 0, qty: id === 'bandage' ? 3 : 1 }; }
    case 'armour': { const k = pick(rng, [['vest', 1], ['helmet', 1], ['backpack', 0.8]] as [string, number][]) as 'vest' | 'helmet' | 'backpack'; const lv = Math.min(3, rarity + 1); return { kind: k, id: `${k}_lv${lv}`, rarity, qty: 1 }; }
    case 'throwable': { const id = pick(rng, [['frag_grenade', 0.45], ['smoke_can', 0.35], ['monsoon_barrier', 0.2]] as [string, number][]); return { kind: 'throwable', id, rarity: 0, qty: 1 }; }
    default: return { kind: 'tokens', id: 'tokens', rarity: 0, qty: B.tokens.pickup };
  }
}
/** Contents of a supply crate: legendary gear. */
export function crateContents(rng: Rng): Item[] {
  const g = pick<WeaponId>(rng, [['monsoon_ar', 2], ['ridgeline_dmr', 2], ['longwatch', 1.5], ['scatter12', 1], ['hornet_smg', 1]] as [WeaponId, number][]);
  return [
    { kind: 'weapon', id: g, rarity: 3, qty: 1 }, { kind: 'ammo', id: B.weapons[g].ammo as string, rarity: 0, qty: 60 },
    { kind: 'vest', id: 'vest_lv3', rarity: 3, qty: 1 }, { kind: 'helmet', id: 'helmet_lv3', rarity: 3, qty: 1 }, { kind: 'backpack', id: 'backpack_lv3', rarity: 3, qty: 1 },
    { kind: 'heal', id: 'medkit', rarity: 1, qty: 2 }, { kind: 'throwable', id: 'frag_grenade', rarity: 0, qty: 2 },
  ];
}
export const itemModel = (it: Item): string => {
  switch (it.kind) {
    case 'weapon': return it.id; case 'ammo': return `ammo_${it.id}`; case 'heal': return it.id; case 'vest': case 'helmet': case 'backpack': return it.id; case 'throwable': return it.id; default: return 'crate_wood';
  }
};
export const itemLabel = (it: Item): string => {
  const W = B.weapons as Record<string, { label: string }>; const A = B.ammo as Record<string, { label: string }>; const H = B.healing as Record<string, { label: string }>;
  switch (it.kind) {
    case 'weapon': return W[it.id].label; case 'ammo': return `${A[it.id].label} x${it.qty}`; case 'heal': return `${H[it.id].label}${it.qty > 1 ? ` x${it.qty}` : ''}`;
    case 'vest': return `Vest Lv${it.id.slice(-1)}`; case 'helmet': return `Helmet Lv${it.id.slice(-1)}`; case 'backpack': return `Backpack Lv${it.id.slice(-1)}`;
    case 'throwable': return it.id === 'frag_grenade' ? 'Frag grenade' : it.id === 'smoke_can' ? 'Smoke can' : 'Monsoon Barrier'; default: return `${it.qty} tokens`;
  }
};
