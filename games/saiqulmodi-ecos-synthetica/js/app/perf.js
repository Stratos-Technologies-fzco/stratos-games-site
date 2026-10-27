// perf.js - calm effects on a weak phone: if frames are slow for a few
// seconds, render at a lower resolution instead of dropping frames.
export function watchPerformance(renderer, onLower) {
  if (!renderer) return;
  let last = performance.now(), slow = 0, frames = 0, level = 0;
  const tick = (now) => {
    const dt = now - last;
    last = now;
    if (document.visibilityState === 'visible' && dt < 1000) {
      frames++;
      if (dt > 40) slow++;
      if (frames >= 150) {
        if (slow > 90 && level < 2) {
          level++;
          renderer.setPixelRatio(level === 1 ? 1 : 0.75);
          if (renderer.shadowMap) renderer.shadowMap.enabled = false;
          if (onLower) onLower(level);
        }
        frames = 0; slow = 0;
      }
    }
    if (level < 2) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
