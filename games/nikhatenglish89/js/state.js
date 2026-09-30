// Shared runtime state: settings, the active explorer profile and simple
// change notifications for the header (coins/gems/stars).

import { getSetting, setSetting } from './storage.js';

const DEFAULT_SETTINGS = {
  sound: true,
  music: true,
  voice: true,
  autoRead: true,
  analytics: true
};

export const state = {
  settings: { ...DEFAULT_SETTINGS, ...getSetting('settings', {}) },
  profile: null,
  profiles: [],
  storageWarning: false
};

const listeners = new Set();

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitChange() {
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (err) {
      console.error(err);
    }
  });
}

export function updateSettings(patch) {
  Object.assign(state.settings, patch);
  setSetting('settings', state.settings);
  emitChange();
}

export function reloadSettings() {
  state.settings = { ...DEFAULT_SETTINGS, ...getSetting('settings', {}) };
}
