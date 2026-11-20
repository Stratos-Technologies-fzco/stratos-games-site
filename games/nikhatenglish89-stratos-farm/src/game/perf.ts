import Phaser from 'phaser';
import { useFarm } from '../state/store';
import { savePrefs } from './prefs';

/** Pure decision: switch effects off when the recent frame rate is clearly too low for a smooth game. */
export function shouldReduceEffects(samples: number[], threshold = 28, needed = 4): boolean {
  if (samples.length < needed) return false;
  const recent = samples.slice(-needed);
  return recent.every((f) => f > 0 && f < threshold);
}

/** Watches the frame rate while playing; on a weak phone it switches decorative effects off by itself (once, and says so). */
export function watchFrameRate(scene: Phaser.Scene) {
  if (typeof navigator !== 'undefined' && navigator.webdriver) return; // automated tests run on software rendering
  const samples: number[] = [];
  let skip = 3;
  scene.time.addEvent({
    delay: 2000, loop: true,
    callback: () => {
      const st = useFarm.getState();
      if (st.screen !== 'game' || st.prefs.lowFx || document.hidden) { samples.length = 0; skip = Math.max(skip, 1); return; }
      if (skip > 0) { skip--; return; }                 // the first seconds are loading and warming up, not a fair reading
      samples.push(scene.game.loop.actualFps);
      if (shouldReduceEffects(samples)) {
        const next = { ...st.prefs, lowFx: true };
        st.setPrefs(next); savePrefs(next);
        st.showToast('Switched off some effects to keep the game smooth. You can change this in Settings.');
      }
    },
  });
}
