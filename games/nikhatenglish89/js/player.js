// Explorer profiles (max 3 per device) and progress/unlock rules.

import { getAll, putItem, deleteItem, getItem, getSetting, setSetting } from './storage.js';
import { state, emitChange } from './state.js';
import { content } from './content.js';

export const MAX_PROFILES = 3;
export const NICKNAME_MAX = 12;

export function newProfile({ nickname, band, avatar }) {
  return {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    version: 1,
    nickname: sanitizeNickname(nickname),
    band: Number(band) || 0,
    avatar,
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    tutorialDone: false,
    coins: 0,
    gems: 0,
    coinsEarned: 0,
    mapPieces: [],
    worldsCompleted: [],
    levels: {},
    owned: [],
    equipped: { hat: null, outfit: null, pet: null },
    campPlaced: [],
    achievements: {},
    stats: {
      playSeconds: 0,
      perfectLevels: 0,
      noHintLevels: 0,
      replays: 0,
      itemsBought: 0,
      engines: {}
    }
  };
}

export function sanitizeNickname(raw) {
  return String(raw || '')
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NICKNAME_MAX);
}

// Returns true when the stored object looks like a usable profile.
export function isValidProfile(p) {
  return (
    p &&
    typeof p === 'object' &&
    typeof p.id === 'string' &&
    typeof p.nickname === 'string' &&
    [0, 1, 2].includes(p.band) &&
    typeof p.levels === 'object' &&
    p.levels !== null &&
    Number.isFinite(p.coins) &&
    Number.isFinite(p.gems)
  );
}

// Fill in any fields added in later versions so old saves keep working.
function upgrade(p) {
  const base = newProfile({ nickname: p.nickname, band: p.band, avatar: p.avatar });
  const merged = { ...base, ...p };
  merged.stats = { ...base.stats, ...(p.stats || {}) };
  merged.equipped = { ...base.equipped, ...(p.equipped || {}) };
  return merged;
}

export async function loadProfiles() {
  const raw = await getAll('profiles');
  const valid = [];
  let corrupt = 0;
  for (const p of raw || []) {
    if (isValidProfile(p)) valid.push(upgrade(p));
    else corrupt++;
  }
  valid.sort((a, b) => a.createdAt - b.createdAt);
  state.profiles = valid;
  return { profiles: valid, corrupt };
}

export async function saveProfile(profile = state.profile) {
  if (!profile) return false;
  profile.lastPlayedAt = Date.now();
  try {
    await putItem('profiles', profile);
    const idx = state.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) state.profiles[idx] = profile;
    else state.profiles.push(profile);
    emitChange();
    return true;
  } catch (err) {
    console.error('Save failed', err);
    state.storageWarning = true;
    emitChange();
    return false;
  }
}

export async function createProfile(data) {
  if (state.profiles.length >= MAX_PROFILES) throw new Error('limit');
  const profile = newProfile(data);
  await saveProfile(profile);
  selectProfile(profile.id);
  return profile;
}

export function selectProfile(id) {
  const p = state.profiles.find((x) => x.id === id);
  if (!p) return null;
  state.profile = p;
  setSetting('lastProfile', id);
  emitChange();
  return p;
}

export function lastProfileId() {
  return getSetting('lastProfile', null);
}

export async function deleteProfile(id) {
  await deleteItem('profiles', id);
  await deleteItem('checkpoints', id);
  state.profiles = state.profiles.filter((p) => p.id !== id);
  if (state.profile && state.profile.id === id) state.profile = null;
  if (lastProfileId() === id) setSetting('lastProfile', null);
  emitChange();
}

// ---- checkpoints (current level state) ----
export async function saveCheckpoint(cp) {
  if (!state.profile) return;
  try {
    await putItem('checkpoints', { ...cp, profileId: state.profile.id, savedAt: Date.now() });
  } catch {
    /* a missing checkpoint only means the level restarts */
  }
}

export async function getCheckpoint() {
  if (!state.profile) return null;
  try {
    return (await getItem('checkpoints', state.profile.id)) || null;
  } catch {
    return null;
  }
}

export async function clearCheckpoint() {
  if (!state.profile) return;
  try {
    await deleteItem('checkpoints', state.profile.id);
  } catch {
    /* ignore */
  }
}

// ---- progress rules ----
export function worldLevels(worldId) {
  return content.levels.levels.filter((l) => l.world === worldId).sort((a, b) => a.index - b.index);
}

export function isLevelDone(profile, levelId) {
  return !!(profile.levels[levelId] && profile.levels[levelId].completions > 0);
}

export function isWorldComplete(profile, worldId) {
  return worldLevels(worldId).every((l) => isLevelDone(profile, l.id));
}

export function isWorldUnlocked(profile, worldId) {
  const worlds = content.levels.worlds;
  const idx = worlds.findIndex((w) => w.id === worldId);
  if (idx <= 0) return true;
  const world = worlds[idx];
  if (world.requiresMapPieces) {
    return world.requiresMapPieces.every((id) => profile.mapPieces.includes(id));
  }
  return isWorldComplete(profile, worlds[idx - 1].id);
}

export function isLevelUnlocked(profile, level) {
  if (!isWorldUnlocked(profile, level.world)) return false;
  if (level.index === 1) return true;
  const prev = worldLevels(level.world).find((l) => l.index === level.index - 1);
  return prev ? isLevelDone(profile, prev.id) : true;
}

export function levelStars(profile, levelId) {
  return (profile.levels[levelId] && profile.levels[levelId].stars) || 0;
}

export function totalStars(profile) {
  return Object.values(profile.levels).reduce((s, l) => s + (l.stars || 0), 0);
}

export function levelsCompleted(profile) {
  return Object.values(profile.levels).filter((l) => l.completions > 0).length;
}

// The next level the explorer should play: first unlocked, unfinished level.
export function recommendedLevel(profile) {
  for (const world of content.levels.worlds) {
    if (!isWorldUnlocked(profile, world.id)) break;
    for (const level of worldLevels(world.id)) {
      if (!isLevelDone(profile, level.id)) return level;
    }
  }
  return null;
}

export function nextLevelAfter(level) {
  const list = worldLevels(level.world);
  return list.find((l) => l.index === level.index + 1) || null;
}
