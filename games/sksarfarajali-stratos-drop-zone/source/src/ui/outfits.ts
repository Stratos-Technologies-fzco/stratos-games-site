// Outfits shown in the Locker. The four survivors are the defaults. Vanguard outfits are cosmetic only: they change the avatar,
// the lobby card and the results portrait. The in-match 3D model stays the selected survivor (TODO in DECISIONS.md).
import B from '../balance.json';
import { SURVIVORS, type Survivor } from '../render/character';
import { getProfile } from '../progress';

export interface Img { src: string; webp?: string }
export interface Outfit {
  id: string; name: string; rarity: 0 | 1 | 2 | 3; rarityName: string; color: string; unlockLevel: number; description: string;
  frames: Img[]; /** card images; more than one rotate on hover or press */
  avatarPos: string; kind: 'survivor' | 'vanguard'; survivor?: Survivor;
}
const RN = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;
const vg = (n: string): Img => ({ src: `ui/cards/skins/${n}.jpg`, webp: `ui/cards/skins/${n}.webp` });

export const OUTFITS: Outfit[] = [
  ...SURVIVORS.map((s): Outfit => ({
    id: s.id, name: s.name, rarity: 0, rarityName: RN[0], color: B.rarity.colors[0], unlockLevel: 1, kind: 'survivor', survivor: s.id,
    description: `${s.role}. Default survivor. Cosmetic only, no stat changes.`, frames: [{ src: `art/${s.id.replace('survivor_', 'character_')}_face.jpg` }], avatarPos: 'center 25%',
  })),
  { id: 'chrome_vanguard', name: B.outfits.chrome_vanguard.label, rarity: B.outfits.chrome_vanguard.rarity as 3, rarityName: RN[B.outfits.chrome_vanguard.rarity], color: B.rarity.colors[B.outfits.chrome_vanguard.rarity],
    unlockLevel: B.outfits.chrome_vanguard.unlockLevel, kind: 'vanguard', description: 'Polished alloy suit with a cyan core light. Cosmetic only, no stat changes.',
    frames: [vg('chrome_vanguard_stance_600x800'), vg('chrome_vanguard_kneel_600x800'), vg('chrome_vanguard_sprint_600x800')], avatarPos: 'center 18%' },
  { id: 'ember_vanguard', name: B.outfits.ember_vanguard.label, rarity: B.outfits.ember_vanguard.rarity as 2, rarityName: RN[B.outfits.ember_vanguard.rarity], color: B.rarity.colors[B.outfits.ember_vanguard.rarity],
    unlockLevel: B.outfits.ember_vanguard.unlockLevel, kind: 'vanguard', description: 'Scorched armour with glowing ember seams. Cosmetic only, no stat changes.',
    frames: [vg('ember_vanguard_600x800')], avatarPos: 'center 18%' },
];
export const outfitById = (id: string) => OUTFITS.find((o) => o.id === id);
export const isUnlocked = (o: Outfit, level: number) => level >= o.unlockLevel;

/** The outfit the player has equipped; falls back to the selected survivor. A locked outfit is never returned. */
export function currentOutfit(level: number): Outfit {
  const sv = (typeof localStorage !== 'undefined' && (localStorage.getItem('sdz-sv') as Survivor)) || 'survivor_kiran';
  const eq = outfitById(getProfile().outfit);
  if (eq && isUnlocked(eq, level)) return eq;
  return outfitById(sv) ?? OUTFITS[0];
}
