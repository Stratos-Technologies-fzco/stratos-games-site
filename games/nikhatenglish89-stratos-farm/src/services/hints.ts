import { ANIMALS, BUILDING_BY_ID, CROP_BY_ID, ITEM_BY_ID, RECIPES } from './data';

/** One short sentence on how to get an item. Used by the paid Hint in the Market. */
export function hintFor(itemId: string): string {
  const name = ITEM_BY_ID.get(itemId)?.name ?? itemId;
  const crop = CROP_BY_ID.get(itemId);
  if (crop) return `${name}: plant it in a field (level ${crop.unlockLevel}, ready in about ${Math.max(1, Math.round(crop.growSeconds / 60))} min).`;
  const animal = ANIMALS.find((a) => a.product === itemId);
  if (animal) {
    const home = BUILDING_BY_ID.get(animal.habitat)!;
    return `${name}: build a ${home.name}, buy a ${animal.name.toLowerCase()}, feed it and collect (level ${animal.unlockLevel}).`;
  }
  if (itemId === 'wood') return 'Wood: clear trees, stumps and bushes on your land (tap them).';
  if (itemId === 'stone') return 'Stone: clear rocks on your land (tap them).';
  const recipes = RECIPES.filter((r) => r.output === itemId);
  if (recipes.length) {
    const r = [...recipes].sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
    const b = BUILDING_BY_ID.get(r.building)!;
    const needs = Object.entries(r.inputs).map(([i, q]) => `${q} ${ITEM_BY_ID.get(i)?.name ?? i}`).join(' + ');
    return `${name}: make it in the ${b.name} from ${needs} (level ${Math.max(b.unlockLevel, r.unlockLevel)}).`;
  }
  return `${name}: keep playing to find out how to get it.`;
}
