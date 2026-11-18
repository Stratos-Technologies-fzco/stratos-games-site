import { useFarm } from '../state/store';

/** True when the player's system asks for less motion. */
export function reducedMotion(): boolean {
  try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

/** Decorative effects (bobbing bubbles, wandering animals, pop-ins, water ripple, flying icons) are on unless switched off. */
export function effectsOn(): boolean {
  return !useFarm.getState().prefs.lowFx && !reducedMotion();
}
