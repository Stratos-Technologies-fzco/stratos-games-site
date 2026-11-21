// Player preferences kept on this device. Sound is OFF by default.
const KEY = 'sf_prefs_v1';
export interface Prefs { music: boolean; sfx: boolean; lowFx: boolean }

export function loadPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (p && typeof p.music === 'boolean' && typeof p.sfx === 'boolean') return { music: p.music, sfx: p.sfx, lowFx: p.lowFx === true };
  } catch { /* ignore */ }
  return { music: false, sfx: false, lowFx: false };
}

export function savePrefs(p: Prefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ } }
