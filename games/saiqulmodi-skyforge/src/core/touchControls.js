// On-screen flight buttons for phones and tablets (symbols only). Only built on a touch-first device, so the
// keyboard / PS5 pad play on a computer is unchanged. Every button sends the same key the keyboard sends, so the
// flight logic in index.html is shared and nothing about the aircraft changes:
//   stick (right)  : analog, finger down = nose up, up = nose down, left / right = roll (same sense as the keyboard and the pad)
//   left group     : power Shift / Ctrl, rudder Q / E, wheel brakes B
//   fighter only   : gun Space (held = 10 rounds a second, like the pad), missile F
//   map            : tap it = M (size)

const svg = (body) => `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  powerUp: svg('<path d="M6 12l6-6 6 6"/><path d="M6 19l6-6 6 6"/>'),
  powerDown: svg('<path d="M6 5l6 6 6-6"/><path d="M6 12l6 6 6-6"/>'),
  rudderLeft: svg('<path d="M9 7L4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6v1"/>'),
  rudderRight: svg('<path d="M15 7l5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6v1"/>'),
  brake: svg('<circle cx="12" cy="12" r="5.5"/><path d="M4.5 6.5a10 10 0 0 0 0 11"/><path d="M19.5 6.5a10 10 0 0 1 0 11"/>'),
  gun: svg('<circle cx="12" cy="12" r="6"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/>'),
  missile: svg('<path d="M12 2.5c2.5 2.5 3 5 3 7.5v6H9v-6c0-2.5.5-5 3-7.5z"/><path d="M9 12l-3 4.5V19l3-1.5"/><path d="M15 12l3 4.5V19l-3-1.5"/><path d="M11 19.5v2M13 19.5v2"/>')
};

// Picture for a tab or list button (data URI, white lines on the button colour)
const sym = (body) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>${body}</svg>`)}")`;
const SYM = {
  fighter: sym(`<path fill='white' d='M12 2l1.4 7L21 16v2l-7-2.5-.6 3.5 2.2 2v1l-3.6-1-3.6 1v-1l2.2-2-.6-3.5L3 18v-2l7.6-7z'/>`),
  trainer: sym(`<path fill='white' d='M11 4h2l.5 5H22v2.5l-8.6 1-.4 5.5 3 1.5V21H8v-1.500l3-1.500-.4-5.500-8.600-1V9h8.500z'/><path d='M8.500 2.500h7'/>`),
  airliner: sym(`<path fill='white' d='M12 1.500c1 0 1.500 1.500 1.500 3.500v3.500L22 14v2l-8.500-3v5l2.500 2v1.500L12 20.500 8 21.500V20l2.500-2v-5L2 16v-2l8.500-5.500V5c0-2 .5-3.500 1.500-3.500z'/>`),
  heli: sym(`<path d='M3 5h18M12 5v4'/><path fill='white' d='M7 9h7.500c2.500 0 4 2 4 4s-2 3-4 3H10c-2 0-3-3-3-7z'/><path d='M18 12h4M21 10v4M9 19h8M11 16v3M15 16v3'/>`),
  twoPlayers: sym(`<path fill='white' d='M7 3l1 4 4 4v1.500L8 11l-.4 3 1.400 1.200V16l-2-.6-2 .6v-.8L6.400 14 6 11l-4 1.500V11l4-4z'/><path fill='white' d='M17 8l1 4 4 4v1.500L18 16l-.4 3 1.400 1.200v.8l-2-.6-2 .6v-.8l1.400-1.200L16 16l-4 1.500V16l4-4z'/>`),
  cockpit: sym(`<path d='M3 17C3 9 8 5 12 5s9 4 9 12'/><path d='M3 17h18M9 17v-5h6v5'/>`),
  chase: sym(`<path fill='white' d='M12 8l2 3 7 3v1.500l-7-1-1 2.500h-2l-1-2.500-7 1V14l7-3z'/><path d='M12 8V4'/>`),
  resetHead: sym(`<path d='M5 12a7 7 0 1 0 2-5'/><path d='M7 3v4H3'/>`),
  approach: sym(`<path d='M9 21l2-16h2l2 16zM12 8v2M12 13v3'/><path d='M4 5l5 4M20 5l-5 4'/>`),
  soundOn: sym(`<path fill='white' d='M4 9v6h4l5 4V5L8 9z'/><path d='M16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11'/>`),
  soundOff: sym(`<path fill='white' d='M4 9v6h4l5 4V5L8 9z'/><path d='M16 9l5 6M21 9l-5 6'/>`)
};

const CSS = `
  /* Phones show only the view, the two tabs, the map and the flight buttons (user, 03-Nov-2026) */
  #sf-badge, #audio-banner, #hud-canvas, #pad-note, #wingman-hud { display: none !important; }
  html body #control-deck { left: 8px !important; right: 8px !important; }
  .deck-pop-btn .t { display: none; }
  /* Tabs and their lists as big picture buttons, no words */
  html body #control-deck > .panel-box { padding: 3px !important; border-radius: 12px !important; }
  html body .deck-pop-btn, html body .deck-pop button { width: 64px !important; height: 44px !important; padding: 0 !important; font-size: 0 !important;
    color: transparent !important; border-radius: 10px !important; background-repeat: no-repeat !important; background-position: center !important; background-size: 34px 34px !important; }
  html body .deck-pop button { background-color: rgba(2, 132, 199, 0.35) !important; }
  html body .deck-pop button.active { background-color: #059669 !important; }
  html body .deck-pop { flex-direction: row; flex-wrap: wrap; max-width: 92vw; gap: 6px; }
  html body .deck-pop hr { display: none; }
  #btn-fighter, body:has(#btn-fighter.active) #control-deck > .panel-box:nth-child(1) .deck-pop-btn { background-image: ${SYM.fighter} !important; }
  #btn-trainer, body:has(#btn-trainer.active) #control-deck > .panel-box:nth-child(1) .deck-pop-btn { background-image: ${SYM.trainer} !important; }
  #btn-airliner, body:has(#btn-airliner.active) #control-deck > .panel-box:nth-child(1) .deck-pop-btn { background-image: ${SYM.airliner} !important; }
  #btn-heli, body:has(#btn-heli.active) #control-deck > .panel-box:nth-child(1) .deck-pop-btn { background-image: ${SYM.heli} !important; }
  #btn-2p { background-image: ${SYM.twoPlayers} !important; }
  #btn-cam, #control-deck > .panel-box:nth-child(2) .deck-pop-btn { background-image: ${SYM.cockpit} !important; }
  body[data-cam="chase"] #btn-cam, body[data-cam="chase"] #control-deck > .panel-box:nth-child(2) .deck-pop-btn { background-image: ${SYM.chase} !important; }
  #btn-cam + button { background-image: ${SYM.resetHead} !important; }
  #btn-cam + button + button { background-image: ${SYM.approach} !important; }
  #btn-sound { background-image: ${SYM.soundOff} !important; }
  #btn-sound.active { background-image: ${SYM.soundOn} !important; }
  nav.tc { position: fixed; z-index: 10004; bottom: 66px; touch-action: none; user-select: none; -webkit-user-select: none;
    -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
  #tc-left { left: 8px; display: grid; gap: 6px; grid-template-columns: repeat(5, 54px); }
  #tc-fire { right: 132px; display: none; flex-direction: column; gap: 6px; }
  #tc-fire.show { display: flex; }
  html body nav.tc button { width: 54px !important; height: 54px !important; padding: 0 !important; display: flex; align-items: center;
    justify-content: center; border: 1px solid #38bdf8; border-radius: 12px; color: #e2e8f0; touch-action: none;
    background: rgba(15, 23, 42, 0.55) !important; }
  html body nav.tc button.on { background: rgba(2, 132, 199, 0.9) !important; color: #fff; }
  html body #tc-fire button { border-color: #f97316; color: #fdba74; }
  html body #tc-fire button.on { background: rgba(234, 88, 12, 0.9) !important; color: #fff; }
  #tc-pad { right: 8px; width: 116px; height: 116px; border-radius: 50%; border: 1px solid #38bdf8; color: #7dd3fc;
    background: rgba(15, 23, 42, 0.45); }
  #tc-pad svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; }
  #tc-knob { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%;
    border: 1px solid #38bdf8; background: rgba(2, 132, 199, 0.65); pointer-events: none; }
  @media (orientation: portrait) {
    #tc-left { grid-template-columns: repeat(2, 54px); }
    html body #tc-brake { width: 114px !important; grid-column: span 2; }
  }
`;

// A real phone or tablet: finger first, no mouse. A touch-screen laptop keeps its mouse layout.
export const isTouchPlay = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

const sendKey = (type, code) => window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));

export function initTouchControls(map) {
  if (!isTouchPlay()) return;
  const mapCanvas = map.canvas;
  map.simple = true;

  const style = document.createElement('style');
  style.id = 'touch-controls';
  style.textContent = CSS;
  document.head.appendChild(style);

  const held = new Set();          // keys the fingers are holding now
  const press = (code) => { if (!held.has(code)) { held.add(code); sendKey('keydown', code); } };
  const release = (code) => { if (held.delete(code)) sendKey('keyup', code); };
  const releasers = [];

  // A button that acts while the finger stays on it; onDown / onUp replace the plain held key when given
  function holdButton(parent, label, icon, code, id, onDown, onUp) {
    const b = document.createElement('button');
    b.type = 'button';
    if (id) b.id = id;
    b.setAttribute('aria-label', label);
    b.innerHTML = icon;
    const up = () => { b.classList.remove('on'); if (onUp) onUp(); else release(code); };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      b.classList.add('on');
      if (onDown) onDown(); else press(code);
    });
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    releasers.push(up);
    parent.appendChild(b);
    return b;
  }

  // <nav>, not <div>: the older "body > div" dock styles in index.html leave it alone
  const makeNav = (id) => { const n = document.createElement('nav'); n.id = id; n.className = 'tc'; document.body.appendChild(n); return n; };

  const left = makeNav('tc-left');
  holdButton(left, 'Power up', ICONS.powerUp, 'ShiftLeft', 'tc-power-up');
  holdButton(left, 'Power down', ICONS.powerDown, 'ControlLeft', 'tc-power-down');
  holdButton(left, 'Rudder left', ICONS.rudderLeft, 'KeyQ', 'tc-rudder-left');
  holdButton(left, 'Rudder right', ICONS.rudderRight, 'KeyE', 'tc-rudder-right');
  holdButton(left, 'Wheel brakes', ICONS.brake, 'KeyB', 'tc-brake');

  // Gun and missile only exist on the fighter, so their buttons only show on it
  const fire = makeNav('tc-fire');
  let gunTimer = null;
  const stopGun = () => { clearInterval(gunTimer); gunTimer = null; release('Space'); };
  const startGun = () => {
    stopGun();
    press('Space');
    gunTimer = setInterval(() => sendKey('keydown', 'Space'), 100);
  };
  holdButton(fire, 'Missile', ICONS.missile, 'KeyF', 'tc-missile');
  holdButton(fire, 'Gun', ICONS.gun, 'Space', 'tc-gun', startGun, stopGun);
  const fighterBtn = document.getElementById('btn-fighter');
  const showFire = () => fire.classList.toggle('show', !!fighterBtn && fighterBtn.classList.contains('active'));
  if (fighterBtn) new MutationObserver(showFire).observe(fighterBtn, { attributes: true, attributeFilter: ['class'] });
  showFire();

  // Stick: slide the finger; two directions at once give pitch and roll together
  const pad = makeNav('tc-pad');
  pad.setAttribute('aria-label', 'Flight stick');
  pad.innerHTML = '<svg viewBox="0 0 124 124" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M54 18l8-8 8 8"/><path d="M54 106l8 8 8-8"/><path d="M18 54l-8 8 8 8"/><path d="M106 54l8 8-8 8"/></svg><span id="tc-knob"></span>';
  const knob = pad.querySelector('#tc-knob');
  const RADIUS = 58, TRAVEL = 36;
  let padPointer = null;
  // Analog: the further the finger moves, the stronger the control; fine near the centre for flying straight
  const stick = window.skyforgeTouchStick = { pitch: 0, roll: 0 };
  const setDirections = (x, y) => {   // x, y: -1..1
    stick.roll = x * Math.abs(x);
    stick.pitch = y * Math.abs(y);
  };
  const movePad = (e) => {
    const r = pad.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / RADIUS;
    let y = (e.clientY - (r.top + r.height / 2)) / RADIUS;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    knob.style.transform = `translate(${x * TRAVEL}px, ${y * TRAVEL}px)`;
    setDirections(x, y);
  };
  const endPad = () => { padPointer = null; knob.style.transform = ''; setDirections(0, 0); };
  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    padPointer = e.pointerId;
    pad.setPointerCapture(e.pointerId);
    movePad(e);
  });
  pad.addEventListener('pointermove', (e) => { if (e.pointerId === padPointer) movePad(e); });
  pad.addEventListener('pointerup', endPad);
  pad.addEventListener('pointercancel', endPad);
  pad.addEventListener('lostpointercapture', endPad);
  pad.addEventListener('contextmenu', (e) => e.preventDefault());
  releasers.push(endPad);

  // The map stays in the corner, clear of the buttons: smaller on a phone, never wider than a narrow screen
  const fitMap = () => {
    const w = mapCanvas.width, vw = window.innerWidth, vh = window.innerHeight;
    let s = (Math.min(vw, vh) < 500 && w <= 260) ? 0.7 : 1;
    s = Math.min(s, (vw - 24) / w);
    mapCanvas.style.transformOrigin = 'top right';
    mapCanvas.style.transform = s < 1 ? `scale(${s})` : '';
  };
  mapCanvas.style.pointerEvents = 'auto';
  mapCanvas.addEventListener('click', () => { sendKey('keydown', 'KeyM'); sendKey('keyup', 'KeyM'); });
  new MutationObserver(fitMap).observe(mapCanvas, { attributes: true, attributeFilter: ['width'] });
  window.addEventListener('resize', fitMap);
  fitMap();

  // Phone call, app switch: nothing stays held down
  const releaseAll = () => releasers.forEach((f) => f());
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
}
