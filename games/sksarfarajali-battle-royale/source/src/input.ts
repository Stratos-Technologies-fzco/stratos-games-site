// Desktop (WASD + pointer lock) and mobile (floating joystick + drag-look) input, merged into one state object.
export interface InputState {
  moveX: number; moveY: number; sprint: boolean; lookDX: number; lookDY: number;
  fire: boolean; aim: boolean; jump: boolean; crouch: boolean; reload: boolean; interact: boolean; heal: boolean; grenade: boolean; barrier: boolean;
  slot: number; map: boolean; inventory: boolean; pause: boolean; marker: boolean;
}
export const input: InputState = { moveX: 0, moveY: 0, sprint: false, lookDX: 0, lookDY: 0, fire: false, aim: false, jump: false, crouch: false, reload: false, interact: false, heal: false, grenade: false, barrier: false, slot: -1, map: false, inventory: false, pause: false, marker: false };
export const settings = { sensitivity: 1, aimAssist: true, reduceMotion: false, quality: 'auto' as 'auto' | 'low' | 'medium' | 'high', resScale: 1, fps: false, musicOn: true, autoPickup: matchMedia('(pointer: coarse)').matches, uiScale: 1, master: 0.55, music: 0.45, sfx: 1, ui: 0.6, hints: true };
try { const s = JSON.parse(localStorage.getItem('sdz-settings') ?? '{}'); Object.assign(settings, s); } catch { /* storage unavailable */ }
export const saveSettings = () => { try { localStorage.setItem('sdz-settings', JSON.stringify(settings)); } catch { /* ignore */ } };

export const isTouch = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const keys = new Set<string>();
const edge = { jump: false, reload: false, interact: false, heal: false, grenade: false, barrier: false, map: false, inventory: false, pause: false, marker: false };
let locked = false; let onPause: (() => void) | null = null;
export function setPauseHandler(f: () => void) { onPause = f; }

export function initInput(canvas: HTMLElement, getOverlayActive: () => boolean) {
  addEventListener('keydown', (e) => {
    if (e.repeat) return; if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
    keys.add(e.code);
    if (e.code === 'Space') edge.jump = true; if (e.code === 'KeyR') edge.reload = true; if (e.code === 'KeyF') edge.interact = true; if (e.code === 'KeyH') edge.heal = true;
    if (e.code === 'KeyG') edge.grenade = true; if (e.code === 'KeyB') edge.barrier = true; if (e.code === 'KeyM') edge.map = true; if (e.code === 'Tab') { edge.inventory = true; e.preventDefault(); }
    if (e.code === 'KeyV') edge.marker = true; if (e.code === 'Escape') { edge.pause = true; onPause?.(); }
    const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code); if (n >= 0) input.slot = n;
    if (e.code === 'Space') e.preventDefault();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  canvas.addEventListener('mousedown', (e) => {
    if (isTouch() || getOverlayActive()) return;
    if (!locked) { canvas.requestPointerLock?.(); return; }
    if (e.button === 0) mouse.fire = true; if (e.button === 2) mouse.aim = true;
  });
  addEventListener('mouseup', (e) => { if (e.button === 0) mouse.fire = false; if (e.button === 2) mouse.aim = false; });
  addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (!locked) { mouse.fire = false; mouse.aim = false; } });
  addEventListener('mousemove', (e) => { if (locked) { input.lookDX += e.movementX; input.lookDY += e.movementY; } });
  initTouch(canvas);
}
const mouse = { fire: false, aim: false };
export const touch = { fire: false, aim: false, crouch: false, sprintLatch: false, joy: { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 }, look: { id: -1, lx: 0, ly: 0 }, tracked: 0 };

function initTouch(el: HTMLElement) {
  const half = () => innerWidth / 2;
  el.addEventListener('touchstart', (e) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < half() && !touch.joy.active) { touch.joy = { active: true, id: t.identifier, ox: t.clientX, oy: t.clientY, x: 0, y: 0 }; }
      else if (t.clientX >= half() && touch.look.id < 0) { touch.look = { id: t.identifier, lx: t.clientX, ly: t.clientY }; }
    }
  }, { passive: true });
  el.addEventListener('touchmove', (e) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touch.joy.id) {
        const dx = t.clientX - touch.joy.ox, dy = t.clientY - touch.joy.oy, max = 60, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / max);
        touch.joy.x = (dx / d) * k; touch.joy.y = (dy / d) * k;
      } else if (t.identifier === touch.look.id) { input.lookDX += (t.clientX - touch.look.lx) * 1.4; input.lookDY += (t.clientY - touch.look.ly) * 1.4; touch.look.lx = t.clientX; touch.look.ly = t.clientY; }
    }
    e.preventDefault();
  }, { passive: false });
  const end = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touch.joy.id) touch.joy = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 };
      if (t.identifier === touch.look.id) touch.look = { id: -1, lx: 0, ly: 0 };
    }
  };
  el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
}
/** Called once per frame by the game: folds keyboard, mouse and touch into `input` and clears one-shot flags. */
export function pollInput() {
  const k = (c: string) => keys.has(c);
  let mx = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0), my = (k('KeyW') ? 1 : 0) - (k('KeyS') ? 1 : 0);
  let sprint = k('ShiftLeft') || k('ShiftRight');
  if (touch.joy.active) { mx = touch.joy.x; my = -touch.joy.y; sprint = Math.hypot(mx, my) > 0.92; }
  const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; }
  input.moveX = mx; input.moveY = my; input.sprint = sprint || touch.sprintLatch && l > 0.1;
  input.fire = mouse.fire || touch.fire; input.aim = mouse.aim || touch.aim; input.crouch = k('KeyC') || k('ControlLeft') || touch.crouch;
  input.jump = edge.jump; input.reload = edge.reload; input.interact = edge.interact || k('KeyF') && false; input.heal = edge.heal; input.grenade = edge.grenade; input.barrier = edge.barrier; input.map = edge.map; input.inventory = edge.inventory; input.pause = edge.pause; input.marker = edge.marker;
  for (const key of Object.keys(edge) as (keyof typeof edge)[]) edge[key] = false;
}
export function clearLook() { input.lookDX = 0; input.lookDY = 0; input.slot = -1; }
/** One-shot press from an on-screen button. */
export function press(name: 'jump' | 'reload' | 'interact' | 'heal' | 'grenade' | 'barrier' | 'map' | 'inventory' | 'marker') { edge[name] = true; }
export function exitPointerLock() { if (document.pointerLockElement) document.exitPointerLock(); }
