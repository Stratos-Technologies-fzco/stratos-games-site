// Small seeded random helpers so a level can be regenerated exactly
// (needed to restore a checkpoint after a browser refresh).

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seed) {
  let a = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    shuffle(list) {
      const arr = list.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    sample(list, n) {
      return rng.shuffle(list).slice(0, n);
    },
    chance(p) {
      return next() < p;
    }
  };
  return rng;
}

// Build a set of unique multiple-choice numeric options around an answer.
export function numberChoices(rng, answer, count = 4, spread = 5, min = 0) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 200) {
    const delta = rng.int(1, Math.max(2, spread)) * (rng.chance(0.5) ? 1 : -1);
    const v = answer + delta;
    if (v >= min) set.add(v);
  }
  let filler = answer + spread + 1;
  while (set.size < count) set.add(filler++);
  return rng.shuffle([...set]);
}
