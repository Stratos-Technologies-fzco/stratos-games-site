// Loads JSON content. All child-facing text lives in data/dialogue.json so a
// new language can be added by translating JSON only.

const FILES = ['config', 'levels', 'questions', 'rewards', 'achievements', 'dialogue'];

export const content = {};

export async function loadContent() {
  const results = await Promise.all(
    FILES.map(async (name) => {
      const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Could not load ${name}.json (${res.status})`);
      return [name, await res.json()];
    })
  );
  for (const [name, data] of results) content[name] = data;
  content.worldById = Object.fromEntries(content.levels.worlds.map((w) => [w.id, w]));
  content.levelById = Object.fromEntries(content.levels.levels.map((l) => [l.id, l]));
  content.itemById = Object.fromEntries(content.rewards.items.map((i) => [i.id, i]));
  return content;
}

function lookup(path) {
  let node = content.dialogue;
  for (const part of path.split('.')) {
    if (node == null) return undefined;
    node = node[part];
  }
  return node;
}

// t('ui.map.title', { name: 'Ria' }) -> string with {name} replaced.
export function t(path, vars = {}) {
  let value = lookup(path);
  if (Array.isArray(value)) value = value[Math.floor(Math.random() * value.length)];
  if (typeof value !== 'string') return path;
  return value.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function tList(path) {
  const value = lookup(path);
  return Array.isArray(value) ? value : [];
}
