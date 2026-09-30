// Stars, coins, gems, map pieces, achievements and the Camp shop.
// All rewards are virtual and can never be bought with real money.

import { content } from './content.js';
import {
  isWorldComplete,
  levelsCompleted,
  totalStars,
  saveProfile
} from './player.js';

// Stars (1–3) reflect mistakes and hints used in the level.
export function computeStars(mistakes, hints) {
  const slips = mistakes + hints;
  if (slips === 0) return 3;
  if (slips <= 2) return 2;
  return 1;
}

export async function completeLevel(profile, level, summary) {
  const cfg = content.rewards.coins;
  const stars = computeStars(summary.mistakes, summary.hints);
  const record = profile.levels[level.id] || { stars: 0, completions: 0 };
  const prevStars = record.stars;
  const firstTime = record.completions === 0;

  let coins;
  if (firstTime) coins = cfg.firstClear + cfg.perStar * stars;
  else coins = cfg.replay + Math.max(0, stars - prevStars) * cfg.perStar;

  record.stars = Math.max(prevStars, stars);
  record.completions += 1;
  record.lastPlayed = Date.now();
  profile.levels[level.id] = record;

  profile.coins += coins;
  profile.coinsEarned += coins;
  if (!firstTime) profile.stats.replays += 1;
  if (summary.mistakes === 0 && summary.hints === 0) profile.stats.perfectLevels += 1;
  if (summary.hints === 0) profile.stats.noHintLevels += 1;

  const eng = profile.stats.engines[level.engine] || { levels: 0, correct: 0, wrong: 0, hints: 0 };
  eng.levels += 1;
  eng.correct += summary.correct;
  eng.wrong += summary.mistakes;
  eng.hints += summary.hints;
  profile.stats.engines[level.engine] = eng;

  let gems = 0;
  let mapPiece = null;
  let worldCompleted = null;
  const world = content.worldById[level.world];
  if (!profile.worldsCompleted.includes(world.id) && isWorldComplete(profile, world.id)) {
    profile.worldsCompleted.push(world.id);
    worldCompleted = world;
    gems += world.gems || 0;
    if (world.mapPiece && !profile.mapPieces.includes(world.id)) {
      profile.mapPieces.push(world.id);
      mapPiece = world;
    }
  }
  profile.gems += gems;

  const newAchievements = checkAchievements(profile);
  const achievementGems = newAchievements.reduce((s, a) => s + (a.gems || 0), 0);

  const saved = await saveProfile(profile);
  return {
    stars,
    prevStars,
    coins,
    gems: gems + achievementGems,
    worldGems: gems,
    mapPiece,
    worldCompleted,
    newAchievements,
    firstTime,
    saved
  };
}

function achievementValue(profile, cond) {
  switch (cond.type) {
    case 'levels':
      return levelsCompleted(profile);
    case 'stars':
      return totalStars(profile);
    case 'world':
      return isWorldComplete(profile, cond.world) ? 1 : 0;
    case 'perfect':
      return profile.stats.perfectLevels;
    case 'noHint':
      return profile.stats.noHintLevels;
    case 'coinsEarned':
      return profile.coinsEarned;
    case 'itemsBought':
      return profile.stats.itemsBought;
    case 'engine':
      return (profile.stats.engines[cond.engine] || {}).levels || 0;
    case 'mapPieces':
      return profile.mapPieces.length;
    case 'replays':
      return profile.stats.replays;
    case 'playMinutes':
      return Math.floor(profile.stats.playSeconds / 60);
    case 'threeStarWorld':
      return content.levels.levels
        .filter((l) => l.world === cond.world)
        .every((l) => (profile.levels[l.id] || {}).stars === 3)
        ? 1
        : 0;
    default:
      return 0;
  }
}

export function achievementProgress(profile, ach) {
  const target = ach.condition.count || 1;
  const value = Math.min(target, achievementValue(profile, ach.condition));
  return { value, target };
}

// Awards any newly earned achievements (and their gems). Returns the new ones.
export function checkAchievements(profile) {
  const earned = [];
  for (const ach of content.achievements.achievements) {
    if (profile.achievements[ach.id]) continue;
    const { value, target } = achievementProgress(profile, ach);
    if (value >= target) {
      profile.achievements[ach.id] = Date.now();
      profile.gems += ach.gems || 0;
      earned.push(ach);
    }
  }
  return earned;
}

// ---- Camp shop ----
export function canAfford(profile, item) {
  return item.currency === 'gems' ? profile.gems >= item.price : profile.coins >= item.price;
}

export async function buyItem(profile, item) {
  if (profile.owned.includes(item.id)) return { ok: true, already: true };
  if (!canAfford(profile, item)) return { ok: false, reason: 'funds' };
  if (item.currency === 'gems') profile.gems -= item.price;
  else profile.coins -= item.price;
  profile.owned.push(item.id);
  profile.stats.itemsBought += 1;
  const newAchievements = checkAchievements(profile);
  await saveProfile(profile);
  return { ok: true, newAchievements };
}

export async function toggleItem(profile, item) {
  if (!profile.owned.includes(item.id)) return;
  if (item.slot === 'camp') {
    const i = profile.campPlaced.indexOf(item.id);
    if (i >= 0) profile.campPlaced.splice(i, 1);
    else profile.campPlaced.push(item.id);
  } else {
    profile.equipped[item.slot] = profile.equipped[item.slot] === item.id ? null : item.id;
  }
  await saveProfile(profile);
}

export function isItemActive(profile, item) {
  if (item.slot === 'camp') return profile.campPlaced.includes(item.id);
  return profile.equipped[item.slot] === item.id;
}
