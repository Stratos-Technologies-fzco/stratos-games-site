import Phaser from 'phaser';
import type { Manifest } from './assets';
import { useFarm } from '../state/store';
import { Prefs, savePrefs } from './prefs';

// Sound is OFF by default. Nothing is downloaded or played until the player turns it on (site rule: soothing, never auto-loud).

let scene: Phaser.Scene | null = null;
let loadedAll = false;
let loading = false;
let track: Phaser.Sound.BaseSound | null = null;
let wantTrack = 'music_title';

export function initAudio(s: Phaser.Scene) {
  scene = s;
  const p = useFarm.getState().prefs;
  if (p.music || p.sfx) ensureLoaded(() => syncMusic());
}

/** Fetch the audio files once, the first time the player turns any sound on. */
function ensureLoaded(done: () => void) {
  if (!scene) return;
  if (loadedAll) { done(); return; }
  const m = scene.cache.json.get('manifest') as Manifest | undefined;
  if (!m || loading) return;
  loading = true;
  for (const a of [...m.audio.music, ...m.audio.sfx]) if (!scene.cache.audio.exists(a.key)) scene.load.audio(a.key, a.urls);
  scene.load.once('complete', () => { loadedAll = true; loading = false; done(); });
  scene.load.start();
}

export function setPref(kind: keyof Prefs, on: boolean) {
  const next = { ...useFarm.getState().prefs, [kind]: on };
  useFarm.getState().setPrefs(next);
  savePrefs(next);
  if (on) ensureLoaded(() => { syncMusic(); if (kind === 'sfx') playSfx('ui_click'); });
  else syncMusic();
}

/** Which background track fits the screen (title music on the home screen, the farm tune while playing). */
export function setMusicTrack(key: string) { wantTrack = key; syncMusic(); }

function syncMusic() {
  if (!scene) return;
  const on = useFarm.getState().prefs.music && loadedAll;
  if (!on) { track?.stop(); track?.destroy(); track = null; return; }
  if (track && (track as Phaser.Sound.BaseSound & { key: string }).key === wantTrack && track.isPlaying) return;
  track?.stop(); track?.destroy();
  if (!scene.cache.audio.exists(wantTrack)) return;
  track = scene.sound.add(wantTrack, { loop: true, volume: 0.28 });
  track.play();
}

export function playSfx(key: string) {
  try {
    if (!scene || !useFarm.getState().prefs.sfx || !loadedAll || !scene.cache.audio.exists(key)) return;
    scene.sound.play(key, { volume: 0.5 });
  } catch { /* sound must never break the game */ }
}
