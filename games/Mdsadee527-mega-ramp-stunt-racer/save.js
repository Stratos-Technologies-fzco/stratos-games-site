const KEY = 'gtMegaRamps_save_v1';

function defaultSave() {
  return {
    selectedCar: 'rookie',
    stars: {},     // levelId -> 0..3
    bestTime: {},  // levelId -> seconds
    bestScore: {}, // levelId -> stunt score
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    return { ...defaultSave(), ...parsed };
  } catch (e) {
    return defaultSave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) { /* storage unavailable, ignore */ }
}

export function totalStars(save) {
  return Object.values(save.stars).reduce((a, b) => a + b, 0);
}

export function recordLevelResult(save, levelId, stars, timeSec, stuntScore) {
  const prevStars = save.stars[levelId] ?? 0;
  save.stars[levelId] = Math.max(prevStars, stars);
  const prevTime = save.bestTime[levelId];
  if (prevTime === undefined || timeSec < prevTime) save.bestTime[levelId] = timeSec;
  const prevScore = save.bestScore[levelId] ?? 0;
  if (stuntScore > prevScore) save.bestScore[levelId] = stuntScore;
  writeSave(save);
  return save;
}
