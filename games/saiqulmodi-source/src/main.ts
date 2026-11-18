// Fighter - web 3D. Game loop: fixed 60 Hz physics step + one render per display frame.
import './style.css';
import { ACESFilmicToneMapping, Color, DirectionalLight, HemisphereLight, Quaternion, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer } from 'three';
import { JetModel } from './flight/JetModel';
import { Ribbon } from './fx/Ribbon';
import { makeSkyEnvironment } from './fx/Environment';
import { SunShadows } from './fx/Shadows';
import { RwrAudio } from './audio/RwrAudio';
import { SFX } from './audio/Sfx';
import { ChaseCamera } from './camera/ChaseCamera';
import { Showcase } from './camera/Showcase';
import { LEVEL, pxToX, pyToZ, SAM_DAMAGE, setLevel, setTwoPlayers, START_X_PX, START_Y_PX, STEP } from './config';
import { flightEnd, flightStart } from './core/Analytics';
import { type Input as InputT, Input, MANEUVER_ACTIONS } from './core/Input';
import { Aerobatics, DISPLAY_SMOKE } from './flight/Aerobatics';
import { applyThrottle, MANEUVER_COUNT, MANEUVERS, ManeuverPilot, ManeuverScore, predictPath } from './flight/Maneuvers';
import { GhostPath } from './fx/GhostPath';
import { FlightPathFx } from './fx/FlightPathFx';
import { ReturnPilot } from './flight/ReturnToBase';
import { checkTouchdown } from './flight/Landing';
import { airDensity } from './flight/JetPhysics';
import { nearestField, onRunway, pickEnd, runwaySurface } from './world/Airfields';
import { newPilotG, type PilotVision, stepPilotG } from './flight/PilotG';
import { FighterHud } from './ui/FighterHud';
import { GVision } from './ui/GVision';
import { PathMini } from './ui/PathMini';
import { APPROACH_AOA_DEG, GEAR_H } from './flight/JetPhysics';
import { Squadron } from './flight/Squadron';
import { JetPhysics } from './flight/JetPhysics';
import { Contrail } from './fx/Contrail';
import { Explosions } from './fx/Explosions';
import { MissileTrails } from './fx/MissileTrails';
import { PostFx } from './fx/PostFx';
import { Pilot } from './fx/Pilot';
import { Smoke } from './fx/Smoke';
import { PlayerTwo } from './threats/PlayerTwo';
import { ThreatSystem } from './threats/ThreatSystem';
import { Weapons } from './weapons/Weapons';
import { Hud } from './ui/Hud';
import { Intro } from './ui/Intro';
import { Minimap } from './ui/Minimap';
import { Clouds } from './world/Clouds';
import { GroundWar } from './world/GroundWar';
import { Helicopters } from './world/Helicopters';
import { makeMapTextures } from './world/MapTexture';
import { Runways } from './world/Runways';
import { Sky } from './world/Sky';
import { Terrain, heightAt, setTerrainDetail } from './world/Terrain';
import { addWorldProps } from './world/WorldProps';

type State = 'start' | 'flying' | 'down' | 'arriving';
const MAX_STEPS = 5; // physics steps per display frame at most (after a stall, the game slows rather than spirals)
const START_X = pxToX(START_X_PX); // main.py:1603 the lead jet starts here ...
const START_Z = pyToZ(START_Y_PX);
const START_HEADING = Math.PI / 2; // ... heading east (main.py:874 heading 0 = +x)

// ---------- renderer + scene ----------
const app = document.getElementById('app') as HTMLDivElement;
/** phones / small or low-power devices start lighter: no anti-aliasing, fewer pixels, a coarser ground grid */
const LOW_END = (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 900) || (navigator.hardwareConcurrency || 8) <= 4;
const renderer = new WebGLRenderer({ antialias: !LOW_END, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW_END ? 1.25 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);
// photographic colour: ACES filmic tone mapping (applied in the output pass) and sRGB output
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = SRGBColorSpace;
renderer.shadowMap.enabled = true; // cascaded sun shadows (fx/Shadows.ts)

const scene = new Scene();
scene.background = new Color(0x87b4e6);
const sky = new Sky();
scene.fog = sky.fog;
scene.add(sky.mesh);
const hemi = new HemisphereLight(0xdfeaff, 0x4a5a3a, 1.1);
scene.add(hemi);
const sun = new DirectionalLight(0xfff4e0, 2.2);
sun.position.copy(sky.sunDir); // not added to the scene: its colour/strength drive the shadow-casting cascade lights
// sky reflections for the PBR jets (metal panels, canopy glint)
scene.environment = makeSkyEnvironment(renderer, sky.sunDir);

const maps = makeMapTextures();
if (LOW_END) setTerrainDetail(256);
const terrain = new Terrain(maps.day, maps.night);
terrain.material.uniforms.uSunDir.value.copy(sky.sunDir);
scene.add(terrain.mesh);
addWorldProps(scene);
const runways = new Runways(scene);
const clouds = new Clouds();
scene.add(clouds.mesh);
const groundWar = new GroundWar(scene);
const helis = new Helicopters(scene);

const camera = new ChaseCamera(window.innerWidth / window.innerHeight);
const post = new PostFx(renderer, scene, camera.camera, LOW_END);
const shadows = new SunShadows(scene, camera.camera, sky.sunDir, LOW_END ? 1024 : 2048);
const input = new Input(app);
const hud = new Hud(app);
const rwr = new RwrAudio();
const jet = new JetPhysics();
/** the 10-jet squadron (main.py:1600-1640); the jet you fly is drawn with its own squadron model */
const squadron = new Squadron(scene);
const playerModel = () => squadron.jets[squadron.active].model;
let playerVisible = true;
const aero = new Aerobatics();
/** the 8 fighter manoeuvres (SkyForge's fighter): autopilot, ghost path in the sky, score */
const mnv = new ManeuverPilot();
const mnvScore = new ManeuverScore();
const ghost = new GhostPath(scene);
/** wing-tip ribbons, future-path dots, missile paths, vapour cone, wing vapour (SkyForge fighter) */
const pathFx = new FlightPathFx(scene);
/** return to base: overhead break and landing on the nearest runway (SkyForge fighter) */
const rtb = new ReturnPilot();
const _rwy = new Vector3();
/** indicated airspeed, kt */
const iasKt = (): number => (jet.speed * Math.sqrt(airDensity(jet.pos.y) / 1.225)) / 0.514444;
/** gear when the pilot flies: down on the ground and near a runway when low (under 1,000 ft) and slow (under 250 kt) */
function autoGear(): boolean {
  if (jet.onGround) return true;
  const n = nearestField(jet.pos.x, jet.pos.z);
  return n.dist < 4000 && jet.pos.y - runwaySurface(n.field.x, n.field.z) < 305 && iasKt() < 250;
}
function toggleRtb(): void {
  if (rtb.active) {
    rtb.stop();
    hud.say('RTB OFF - YOU HAVE CONTROL');
    return;
  }
  if (jet.onGround) {
    hud.say('ON THE RUNWAY - FULL POWER AND PULL TO TAKE OFF');
    return;
  }
  stopManeuver();
  aero.stop();
  const { field } = nearestField(jet.pos.x, jet.pos.z);
  const end = pickEnd(field, jet.pos.x, jet.pos.z, jet.vel.x, jet.vel.z);
  rtb.start(end, jet, heightAt);
  hud.say(`RTB - BASE ${field.id} RUNWAY ${end.ident}`);
  SFX.play('switch');
}
let boomArmed = true; // the sonic boom sounds once each time the jet goes through Mach 1
let mnvNext = 1; // touch MNV flies the figures in turn
function stopManeuver(): void {
  ghostPts = null;
  mnv.stop();
  mnvScore.stop();
  ghost.set(null);
}
/** start figure n (1..8); refused with the reason (speed, height) */
function startManeuver(n: number): void {
  if (jet.onGround) {
    hud.say(`${MANEUVERS[n].name} - ON THE GROUND`);
    return;
  }
  if (rtb.active) rtb.stop();
  const agl = jet.pos.y - heightAt(jet.pos.x, jet.pos.z);
  // break turns go the way the jet is already banked (right when level)
  const rightWingY = _side.crossVectors(jet.vel, jet.liftUp).normalize().y; // < 0 = right wing down
  const turnDir = rightWingY > 0.02 ? -1 : 1;
  const env = { aglM: agl, turnDir };
  const path = predictPath(n, jet, env);
  const why = mnv.start(n, jet, env);
  if (why) {
    hud.say(`${MANEUVERS[n].name} - ${why}`);
    return;
  }
  aero.stop();
  ghost.set(path ? path.points : null);
  ghostPts = path ? path.points : null;
  mnvScore.start(path);
  hud.say(`${n} ${MANEUVERS[n].name}`);
  SFX.play('switch');
}
function showScore(r: { name: string; score: number; stars: number } | null): void {
  if (!r) return;
  hud.say(`${r.name}  ${r.score}  ${'*'.repeat(r.stars)}`);
  ghost.set(null);
  ghostPts = null;
  lastScore = { text: `${r.name}  ${r.score}`, stars: r.stars, until: performance.now() + 5000 };
}
/** fighter HUD, pilot G, 3D flight-path miniature (SkyForge fighter) */
let ghostPts: Vector3[] | null = null;
let lastScore: { text: string; stars: number; until: number } | null = null;
const pilotG = newPilotG();
let vision: PilotVision | null = null;
let maxG = 1;
let wasGloc = false;
const fhud = new FighterHud(document.body);
const gvis = new GVision(document.body, renderer.domElement);
const mini = new PathMini(document.body);
/** a pilot blacked out under G has no hands on the stick */
const handsOff = { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false };
function resetPilot(): void {
  Object.assign(pilotG, newPilotG());
  vision = null;
  maxG = 1;
  wasGloc = false;
  gvis.set(null);
}
function showFighterUi(on: boolean): void {
  fhud.show(on);
  mini.show(on);
  if (!on) gvis.set(null);
}
const p2 = new PlayerTwo();
const contrail = new Contrail();
scene.add(contrail.mesh);
/** wingtip vapour trails in high-G turns (above VAPOUR_G) */
const VAPOUR_G = 4.5;
const vapour = [0, 1].map(() => {
  const r = new Ribbon({ points: 70, spacing: 5, life: 40, width: 0.4, widthOld: 2.6, color: [1, 1, 1], alpha: 0.45, minAngular: 0.0009 });
  scene.add(r.mesh);
  return r;
});
const _tip = new Vector3();
const _nozA = new Vector3();
const _nozB = new Vector3();
const _nozC = new Vector3();
const motion = { blur: 0, lines: 0, time: 0, heat: 0, heatPos: new Vector2(), heatDir: new Vector2(), heatWidth: 0.02 };
/** per frame: speed blur / lines from Mach and afterburner, heat shimmer behind the nozzle of the jet you fly */
function updateMotion(pm: JetModel, flying: boolean): void {
  motion.time = simTime;
  const target = flying ? Math.min(1, Math.max(0, (jet.mach - 0.85) / 1.3)) : 0;
  const ab = flying && jet.afterburner ? 1 : 0;
  motion.blur += ((target * 0.55 + ab * 0.25) - motion.blur) * 0.08;
  motion.lines += ((Math.min(1, Math.max(0, (jet.mach - 1.05) / 0.9)) * (flying ? 1 : 0) * 0.8 + ab * 0.3) - motion.lines) * 0.08;
  motion.heat = 0;
  if (pm.group.visible) {
    const cam = camera.camera;
    pm.group.localToWorld(_nozA.set(0, 0, 7));
    const dist = _nozA.distanceTo(cam.position);
    pm.group.localToWorld(_nozB.set(0, 0, 7 + (jet.afterburner ? 9 : 5)));
    pm.group.localToWorld(_nozC.set(0, 0.9, 7));
    _nozA.project(cam);
    _nozB.project(cam);
    _nozC.project(cam);
    if (_nozA.z < 1 && _nozB.z < 1 && dist < 220) {
      motion.heatPos.set(_nozA.x * 0.5 + 0.5, _nozA.y * 0.5 + 0.5);
      motion.heatDir.set((_nozB.x - _nozA.x) * 0.5, (_nozB.y - _nozA.y) * 0.5);
      motion.heatWidth = Math.max(0.004, Math.abs(_nozC.y - _nozA.y) * 0.5 * 1.3);
      motion.heat = (0.35 + 0.65 * jet.throttle) * (jet.afterburner ? 1.4 : 1) * (1 - dist / 220);
    }
  }
  post.setMotion(motion);
}
const smoke = new Smoke();
scene.add(smoke.mesh);
const blasts = new Explosions(scene);
const trails = new MissileTrails(scene);
const threats = new ThreatSystem(scene);
threats.onBlast = (x, y, z, r, life) => blasts.spawn(x, y, z, r, life);
const blast = (x: number, y: number, z: number, r: number, life: number): void => blasts.spawn(x, y, z, r, life);
const camDist = (p: Vector3): number => p.distanceTo(camera.camera.position);
const weapons = new Weapons(scene, threats, {
  say: (text) => hud.say(text),
  blast,
  sound: (name, at) => SFX.play(name, at ? camDist(at) : 0),
  smoke: (x, y, z, life, s0, s1, grey) => smoke.emit(x, y, z, life, s0, s1, grey),
});

// ---------- day / night (main.py:1717, 2001: T); the showcase can show night for one shot ----------
let night = false;
let demoNight = false;
const tu = terrain.material.uniforms;
const isNight = (): boolean => night || demoNight;
function applyNight(): void {
  if (isNight()) {
    // moonlight: the ground darkened to main.py's NIGHT_SHADE (66, 82, 100), every light added on top
    sun.color.set(0x8090c0);
    sun.intensity = 0.3;
    hemi.intensity = 0.18;
    tu.uSunColor.value.setRGB(0.035, 0.05, 0.08);
    tu.uSkyLight.value.setRGB(0.03, 0.045, 0.07);
    tu.uGroundLight.value.setRGB(0.01, 0.012, 0.018);
    tu.uNightMix.value = 1;
  } else {
    sun.color.set(0xfff4e0);
    sun.intensity = 2.2;
    hemi.intensity = 1.1;
    tu.uSunColor.value.setRGB(1, 0.95, 0.85).multiplyScalar(1.6);
    tu.uSkyLight.value.setRGB(0.55, 0.62, 0.75);
    tu.uGroundLight.value.setRGB(0.2, 0.22, 0.16);
    tu.uNightMix.value = 0;
  }
  scene.environmentIntensity = isNight() ? 0.12 : 1;
  shadows.setSun(sun.color, sun.intensity);
  runways.setNight(isNight());
  post.setNight(isNight());
}

// ---------- state ----------
let state: State = 'start';
let downFrames = 0;
let simTime = 0;
let frameNo = 0;
let launchesSinceFrame = 0;
const prevPos = new Vector3();
const prevQuat = new Quaternion();
const drawPos = new Vector3();
const drawQuat = new Quaternion();
let wreckVisible = true;
const pilot = new Pilot();
scene.add(pilot.group);
/** where the pilot came down (or the wreck burns): the new jet flies in toward it */
const landing = new Vector3();
let arriveFrames = 0;
const LANDED_WAIT = 90; // 1.5 s on the ground before the new jet shows up
const WRECK_WAIT = 240; // no ejection (flew into the ground): 4 s watching the wreck burn
const ARRIVE_DIST = 3200; // m: the new jet appears this far out, in view, and flies in
const ARRIVE_MAX = 720; // frames: control is handed over by then at the latest
const camLook = new Vector3();
const camGoal = new Vector3();
let camAngle = 0;

const downScreen = document.getElementById('down') as HTMLDivElement;
const downTitle = document.getElementById('down-title') as HTMLDivElement;
const downHint = document.getElementById('down-hint') as HTMLDivElement;
const fpsNode = document.getElementById('fps') as HTMLDivElement;
const intro = new Intro(() => input.queueStart());
// mission.js (Stratos Resume): reads the level for the save and sets it again before a resumed take-off
(window as unknown as { __fighterLevel?: { get: () => number; set: (n: number) => void } }).__fighterLevel = {
  get: () => LEVEL,
  set: (n: number) => setLevel(n),
};
const minimap = new Minimap(document.body, maps.day.image as CanvasImageSource, (idx) => {
  if (state === 'flying') switchJet(idx);
}, squadron);
minimap.show(false);

const showcase = new Showcase({
  jet,
  threats,
  start: { x: START_X, z: START_Z, heading: START_HEADING },
  setDemoNight: (on) => {
    if (demoNight === on) return;
    demoNight = on;
    applyNight();
  },
  clearFx: () => {
    smoke.clear();
    trails.clear();
    blasts.clear();
    contrail.clear();
  },
  snapChase: () => camera.snap(jet.pos, jet.quat),
  snapTerrain: (x, z) => terrain.snapTo(x, z),
});

function resetWorld(): void {
  jet.reset(START_X, START_Z, START_HEADING);
  prevPos.copy(jet.pos);
  prevQuat.copy(jet.quat);
  threats.reset((Date.now() & 0x7fffffff) | 1);
  smoke.clear();
  trails.clear();
  blasts.clear();
  contrail.clear();
  pathFx.clear();
  mini.clear();
  weapons.reset();
  squadron.reset(START_X, START_Z);
  aero.stop();
  stopManeuver();
  rtb.stop();
  p2.sel = null;
  hud.clearLog();
  wreckVisible = true;
  pilot.hide();
  playerVisible = true;
  terrain.snapTo(jet.pos.x, jet.pos.z);
  camera.snap(jet.pos, jet.quat);
}

function startFlight(): void {
  showcase.end();
  intro.hide();
  resetWorld();
  state = 'flying';
  downScreen.style.display = 'none';
  hud.show(true);
  minimap.show(true);
  showFighterUi(true);
  resetPilot();
  input.setTouchVisible(true);
  flightStart(LEVEL); // analytics: a game begins
}

function jetDown(reason: string, onGround: boolean, cause: string): void {
  state = 'down';
  downFrames = 0;
  jet.alive = false;
  squadron.downActive(); // main.py:2319 its replacement rejoins later
  flightEnd(); // analytics: that game is over
  aero.stop();
  stopManeuver();
  rtb.stop();
  camAngle = Math.atan2(jet.vel.z, jet.vel.x) + Math.PI * 0.75;
  camLook.copy(jet.pos);
  if (onGround) {
    blasts.spawn(jet.pos.x, jet.pos.y, jet.pos.z, 60, 2.2);
    SFX.play('explode'); // main.py:2337
    input.rumble(1, 0.8, 800);
    wreckVisible = false;
    playerVisible = false;
    weapons.burn(jet.pos.x, jet.pos.z);
    landing.copy(jet.pos);
    downHint.textContent = cause;
  } else {
    // shot down in the air: the wreck spins down, the pilot ejects (main.py:2318-2323)
    jet.crashing = true;
    pilot.eject(jet.pos, jet.vel);
    SFX.play('ignite'); // the ejection seat fires
    input.rumble(0.8, 0.4, 450);
    landing.copy(jet.pos);
    downHint.textContent = `${cause}  -  PILOT EJECTED`;
  }
  downTitle.textContent = reason;
  downScreen.style.display = 'block';
  hud.show(false);
  minimap.show(false);
  showFighterUi(false);
  resetPilot();
  input.setTouchVisible(false);
}

/** After the pilot lands (or the wreck has burned a while): a new jet flies in from far away, in view. */
function beginArrival(): void {
  state = 'arriving';
  arriveFrames = 0;
  squadron.active = squadron.nextAlive(); // the next jet of the squadron flies in (main.py:2062-2063)
  const a = Math.random() * Math.PI * 2;
  const x = landing.x + Math.cos(a) * ARRIVE_DIST;
  const z = landing.z + Math.sin(a) * ARRIVE_DIST;
  const alt = Math.max(heightAt(x, z), heightAt(landing.x, landing.z)) + 1500;
  jet.reset(x, z, Math.atan2(landing.x - x, -(landing.z - z)));
  jet.pos.y = alt;
  prevPos.copy(jet.pos);
  prevQuat.copy(jet.quat);
  wreckVisible = true;
  playerVisible = true;
  contrail.clear();
  for (const m of threats.missiles.items) m.hide(); // a clean start for the new jet
  weapons.rearm();
  downHint.textContent = pilot.active ? 'PILOT LANDED SAFELY  -  NEW JET INBOUND' : 'NEW JET INBOUND'; // main.py:2343
}

function takeControl(): void {
  state = 'flying';
  downScreen.style.display = 'none';
  hud.show(true);
  minimap.show(true);
  showFighterUi(true);
  resetPilot();
  mini.clear();
  hud.say(`${squadron.callsign} - YOU HAVE CONTROL`);
  flightStart(LEVEL); // analytics: the next flight is the next game
  input.setTouchVisible(true);
  camera.snap(jet.pos, jet.quat);
}

/** TAB / R3 / minimap click: hand this jet to its flight and take over another (main.py:1936-1938, 2045, 2058) */
function switchJet(idx: number): void {
  if (idx === squadron.active || !squadron.jets[idx].alive) return;
  if (jet.onGround) {
    hud.say('ON THE RUNWAY - TAKE OFF FIRST');
    return;
  }
  playerModel().setGear(false, 99); // the jet handed to its flight flies on with its gear up
  squadron.switchTo(idx, jet.pos, (jet.headingDeg * Math.PI) / 180);
  const j = squadron.jets[idx];
  jet.reset(j.pos.x, j.pos.z, j.heading);
  jet.pos.y = j.pos.y;
  prevPos.copy(jet.pos);
  prevQuat.copy(jet.quat);
  contrail.clear();
  aero.stop();
  stopManeuver();
  rtb.stop();
  weapons.rearm();
  terrain.snapTo(jet.pos.x, jet.pos.z);
  camera.snap(jet.pos, jet.quat);
  SFX.play('switch'); // main.py:1938
  hud.say(`JET: ${j.callsign}`);
}

/** what got the jet, and what the player had ready then (so they can think about where it went wrong) */
function debrief(seeker: string, launcher: string): string {
  const cm = threats.cm;
  const from = launcher ? ` from ${launcher}` : '';
  if (seeker === 'IR') return `heat-seeking missile${from}  -  ${cm.flareCd === 0 ? 'flares (C) were ready' : 'flares were reloading: break hard late'}`;
  if (seeker === 'RADAR') {
    const ready = [cm.chaffCd === 0 ? 'chaff (K)' : '', cm.ecmCd === 0 ? 'ECM (X)' : ''].filter(Boolean).join(' and ');
    return `radar-guided missile${from}  -  ${ready ? `${ready} ${ready.includes(' and ') ? 'were' : 'was'} ready` : 'notch it: fly 90 deg across it and dive'}`;
  }
  return `unguided rocket${from}  -  turning away escapes it`;
}

// ---------- one 60 Hz physics frame ----------
function fixedStep(): void {
  frameNo++;
  input.update(STEP);
  const wantsStart = input.consumeStart();
  const wantsFlare = input.consumeFlare();
  const wantsEcm = input.consumeEcm();
  const wantsChaff = input.consume('chaff');
  const wantsBomb = input.consume('bomb');
  const wantsAgm = input.consume('agm');
  const wantsAam = input.consume('aam');
  const wantsAero = input.consume('aero');
  let wantsMnv = 0;
  MANEUVER_ACTIONS.forEach((a, i) => {
    if (input.consume(a)) wantsMnv = i + 1;
  });
  const wantsRtb = input.consume('rtb');
  const wantsLimiter = input.consume('limiter');
  if (input.consume('mnvNext')) {
    wantsMnv = mnvNext;
    mnvNext = (mnvNext % MANEUVER_COUNT) + 1;
  }
  const wantsSam = input.consume('sam');
  const wantsNext = input.consume('nextJet');
  const wantsPrev = input.consume('prevJet');
  const p2Left = input.consume('p2Left');
  const p2Right = input.consume('p2Right');
  const p2Guided = input.consume('p2Guided');
  const p2Unguided = input.consume('p2Unguided');
  const lvUp = input.consume('levelUp');
  const lvDown = input.consume('levelDown');
  // 2 players on / off (main.py:2003-2006); two people get equal chances (no +15% edge)
  if (input.consume('twoPlayers')) {
    p2.on = !p2.on;
    input.twoPlayers = p2.on;
    setTwoPlayers(p2.on);
    p2.sel = null;
    hud.say(p2.on ? '2 PLAYERS: PLAYER 2 COMMANDS THE LAUNCHERS' : '1 PLAYER');
  }
  if (input.consumeNight()) {
    night = !night;
    applyNight();
    if (state === 'flying') hud.say(night ? 'NIGHT VIEW' : 'DAY VIEW');
  }
  groundWar.step(jet.pos.x, jet.pos.z, blast);
  squadron.step(jet.pos.x, jet.pos.z);
  helis.step();

  if (state === 'start') {
    if (wantsStart) {
      startFlight();
      return;
    }
    // the showcase behind the logo
    showcase.step();
    jet.step(STEP, null);
    contrail.record(jet.pos, frameNo);
    threats.step(showcase.tracking ? jet : null, false);
  } else {
    if (state === 'down') {
      // no restart button: the player watches the wreck and the pilot, and thinks it over
      downFrames++;
      if (pilot.active) {
        pilot.step(heightAt(pilot.pos.x, pilot.pos.z));
        if (pilot.landed) landing.copy(pilot.pos);
        if (pilot.landed && pilot.landedFor >= LANDED_WAIT && !wreckVisible) beginArrival();
      } else if (downFrames >= WRECK_WAIT) beginArrival();
    } else if (state === 'flying' && pilot.active) {
      pilot.step(heightAt(pilot.pos.x, pilot.pos.z));
      if (pilot.landedFor > 600) pilot.hide(); // main.py:1239, 1257 gone a while after landing
    } else if (state === 'arriving') {
      arriveFrames++;
      pilot.step(heightAt(pilot.pos.x, pilot.pos.z));
      const near = Math.hypot(jet.pos.x - landing.x, jet.pos.z - landing.z) < 500;
      if (near || arriveFrames >= ARRIVE_MAX) takeControl();
    }
    void wantsStart;

    prevPos.copy(jet.pos);
    prevQuat.copy(jet.quat);
    const flying = state === 'flying';
    if (wreckVisible) {
      if (jet.crashing) jet.stepCrash(STEP);
      else {
        // a running aerobatic figure flies itself (main.py:2102-2131)
        const auto = flying && aero.active && aero.control(jet);
        // the pilot's G tolerance: grey-out, tunnel, blackout, G-LOC (hands off the stick), red-out
        vision = flying ? stepPilotG(pilotG, jet.onGround ? 1 : jet.gLoad, STEP) : null;
        if (flying && !jet.onGround) maxG = Math.max(maxG, jet.gLoad);
        const lost = !!vision && vision.controlsLost;
        if (vision && vision.gloc && !wasGloc) hud.say('G-LOC - THE PILOT HAS BLACKED OUT');
        wasGloc = !!vision && vision.gloc;
        const pilotIn = lost ? (Object.assign(handsOff, { afterburner: jet.afterburner }) as unknown as InputT) : input;
        // a fighter manoeuvre flies itself until the pilot moves the stick or rudder (then the ghost stays to follow)
        if (flying && !lost && mnv.flying && (Math.abs(input.pitch) > 0.15 || Math.abs(input.roll) > 0.15 || Math.abs(input.yaw) > 0.3)) {
          mnv.handOver();
          hud.say('MANUAL - FOLLOW THE RINGS');
        }
        // return to base flies itself until the pilot moves the stick
        if (flying && !lost && rtb.active && (Math.abs(input.pitch) > 0.15 || Math.abs(input.roll) > 0.15 || Math.abs(input.yaw) > 0.3)) {
          rtb.stop();
          hud.say('RTB OFF - YOU HAVE CONTROL');
        }
        const rc = flying && rtb.active ? rtb.update(jet, STEP) : null;
        if (rtb.finished) {
          rtb.finished = false;
          hud.say('STOPPED ON THE RUNWAY - FULL POWER AND PULL TO TAKE OFF');
        }
        const mc = !rc && flying && mnv.flying ? mnv.update(jet, STEP) : null;
        if (mc) applyThrottle(jet, mc);
        jet.gearDown = rtb.active ? rtb.gearDown : autoGear();
        jet.brakes = rtb.active ? rtb.brakes : jet.onGround && jet.throttle < 0.05 && !pilotIn.afterburner;
        const ctl = flying ? ((rc ?? mc ?? (auto ? aero.stick : pilotIn)) as unknown as InputT) : null;
        if (jet.onGround) {
          if (jet.stepGround(STEP, ctl, runwaySurface(jet.pos.x, jet.pos.z))) hud.say('AIRBORNE');
          else if (flying && !onRunway(jet.pos.x, jet.pos.z, 0)) jetDown('RAN OFF THE RUNWAY', true, 'slow down on the runway: power to idle brakes the wheels');
        } else jet.step(STEP, ctl);
        if (flying && mnvScore.on) {
          const r = mnvScore.update(jet.pos, jet.vel, STEP);
          if (r) showScore(r);
          else if (mnv.finished && !mnv.active) showScore(mnvScore.finish(jet.pos, jet.vel));
        }
        if (mnv.finished && !mnvScore.on && !mnv.active) {
          mnv.finished = false;
          ghost.set(null);
        }
        if (auto && frameNo % 2 === 0) {
          // display smoke: three coloured trails across the wings (main.py:2127-2129)
          _side.crossVectors(jet.nose, jet.bodyUp).normalize();
          for (let k = 0; k < 3; k++) {
            const off = (k - 1) * 4;
            const c = DISPLAY_SMOKE[k];
            // starts thin at the jet (the chase camera sits just behind it) and spreads as it ages
            smoke.emitRGB(jet.pos.x + _side.x * off - jet.nose.x * 12, jet.pos.y + _side.y * off - jet.nose.y * 12, jet.pos.z + _side.z * off - jet.nose.z * 12, 20, 0.6, 9, c[0], c[1], c[2]);
          }
        }
      }
      const ground = heightAt(jet.pos.x, jet.pos.z);
      // a runway touchdown: gear down, gentle, wings level = landed; anything else is a crash
      const td = flying && !jet.onGround && !jet.crashing ? checkTouchdown(jet) : null;
      if (td && td.ok) {
        jet.touchDown(runwaySurface(jet.pos.x, jet.pos.z));
        stopManeuver();
        aero.stop();
        hud.say(`LANDED  ${td.sink.toFixed(1)} m/s  ${td.off.toFixed(0)} m off centre  ${'*'.repeat(td.stars)}`);
        input.rumble(0.4, 0.3, 200);
      } else if (td && state === 'flying') {
        jet.pos.y = ground + 1.5;
        jetDown('CRASH LANDING', true, td.why);
      } else if (!jet.onGround && jet.pos.y <= ground + 1.5) {
        jet.pos.y = ground + 1.5;
        if (flying) jetDown('CRASHED INTO THE GROUND', true, 'watch the height above ground - the PULL UP warning comes at 3,000 ft');
        else {
          blasts.spawn(jet.pos.x, jet.pos.y, jet.pos.z, 70, 2.4);
          SFX.play('explode', camDist(jet.pos)); // main.py:2333-2338 the wreck hits the ground
          weapons.burn(jet.pos.x, jet.pos.z); // main.py:2335 and burns
          wreckVisible = false;
          playerVisible = false;
        }
      }
      if (jet.crashing && wreckVisible) smoke.emit(jet.pos.x, jet.pos.y, jet.pos.z, 4, 3, 14, 0.15);
      if (flying || state === 'arriving') contrail.record(jet.pos, frameNo);
    }

    // countermeasures (main.py:1955-1993 messages and sounds)
    if (flying) {
      const cm = threats.cm;
      if (wantsFlare) {
        if (cm.fireFlares(jet.pos, jet.vel)) {
          hud.say('FLARES');
          SFX.play('flare'); // main.py:1978
          input.rumble(0.1, 0.45, 90);
        } else hud.say(`FLARES RELOADING ${(cm.flareCd / 60).toFixed(1)} s`);
      }
      if (wantsChaff) {
        if (cm.fireChaff(jet.pos, jet.vel)) {
          hud.say('CHAFF');
          SFX.play('flare');
          input.rumble(0.1, 0.45, 90);
        } else hud.say(`CHAFF RELOADING ${(cm.chaffCd / 60).toFixed(1)} s`);
      }
      // aerobatics V (main.py:1950-1954), manual SAM M (main.py:1994-2000), jet switch TAB (main.py:1936-1938)
      if (wantsMnv) startManeuver(wantsMnv);
      if (wantsRtb) toggleRtb();
      if (wantsLimiter) {
        jet.limiterOff = !jet.limiterOff;
        hud.say(jet.limiterOff ? 'AoA LIMITER OFF - the wing can stall and spin' : 'AoA LIMITER ON');
        SFX.play('switch');
      }
      if (wantsAero && !aero.active) {
        stopManeuver();
        hud.say(aero.start(jet));
        SFX.play('switch');
      }
      if (wantsSam) {
        const l = threats.nearestArmed(jet.pos.x, jet.pos.z, 1e9);
        if (l && threats.launch(l, jet)) hud.say(`${l.name} LAUNCH -> ${squadron.callsign}`);
        else hud.say('NO SAM RESERVE LEFT');
      }
      if (wantsNext || wantsPrev) switchJet(squadron.nextAlive(wantsPrev ? -1 : 1));
      if (lvUp || lvDown) {
        setLevel(LEVEL + (lvUp ? 1 : -1)); // main.py:2026-2029
        hud.say(`LEVEL ${LEVEL}`);
      }
      // player 2 at the launchers (main.py:2007-2025)
      if (p2.on) {
        if (p2Left || p2Right) p2.pick(p2Right ? 1 : -1, jet.pos, threats);
        if (p2Guided || p2Unguided) hud.say(p2.fire(p2Guided, jet, threats));
      }
      // the jet's weapons (main.py:1939-1949)
      if (wantsBomb) weapons.dropBomb(jet.pos, jet.vel);
      if (wantsAgm) weapons.fireMissile('AGM', jet.pos, jet.vel);
      if (wantsAam) weapons.fireMissile('AAM', jet.pos, jet.vel);
      if (wantsBomb || wantsAgm || wantsAam) input.rumble(0.3, 0.5, 120);
      if (wantsEcm) {
        const broken = cm.fireEcm(jet.pos, threats.missiles.items, threats.rand);
        if (broken < 0) hud.say(`ECM RELOADING ${(cm.ecmCd / 60).toFixed(1)} s`);
        else {
          hud.say(broken ? `ECM - ${broken} LOCK BROKEN` : 'ECM');
          SFX.play('ignite'); // main.py:1961
        }
      }
    }

    threats.step(flying ? jet : null, flying);
    p2.step(flying ? jet.pos : null, threats);
    weapons.step();
    launchesSinceFrame += threats.launchedThisFrame;
    if (flying && threats.launchedThisFrame > 0) {
      SFX.play('ignite', 2000); // main.py:1857 launch
      input.rumble(0.25, 0.6, 220); // a launch at you: a sharp buzz in the hands
    }
    if (threats.decoyedThisFrame > 0) hud.say(`FLARES - ${threats.decoyedThisFrame} SAM DECOYED`); // main.py:1993
    if (flying && threats.hitThisFrame) {
      // main.py:2312-2323 proximity fuse: one SAM hit = shot down
      SFX.play('explode'); // main.py:2317
      input.rumble(1, 1, 700);
      jet.hp = Math.max(0, jet.hp - SAM_DAMAGE);
      if (jet.hp === 0) jetDown('SHOT DOWN BY A SAM', false, debrief(threats.lastHitSeeker, threats.lastHitLauncher));
    }
  }

  // trails: missiles while the motor burns, flares while hot
  if (frameNo % 2 === 0) {
    const items = threats.missiles.items;
    for (let i = 0; i < items.length; i++) {
      const m = items[i];
      if (m.active) trails.track(m, m.guided ? 'guided' : 'unguided', frameNo); // the full flight path
    }
    const ord = weapons.items.items;
    for (let i = 0; i < ord.length; i++) {
      const o = ord[i];
      if (o.active && o.kind !== 'BOMB') trails.track(o, o.kind, frameNo);
    }
    trails.release();
    const fl = threats.cm.flares.items;
    for (let i = 0; i < fl.length; i++) {
      const f = fl[i];
      if (f.active && f.heat > 0.2 && frameNo % 4 === 0 && state !== 'start') smoke.emit(f.pos.x, f.pos.y, f.pos.z, 2.5, 1.5, 5, 0.95);
    }
    const ch = threats.cm.chaff.items;
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i];
      if (c.active && frameNo % 6 === 0) smoke.emit(c.pos.x, c.pos.y, c.pos.z, 3, 6, 22, 0.7); // a silver chaff cloud
    }
  }

  smoke.update(STEP);
  blasts.update(STEP);
  simTime += STEP;
}

// ---------- frame loop ----------
let last = performance.now();
let acc = 0;
let fpsFrames = 0;
let fpsTime = 0;

function frame(now: number): void {
  requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  acc += dt;
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    fixedStep();
    acc -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) acc = 0;

  // draw between the last two physics states
  const a = acc / STEP;
  if (state === 'start') {
    drawPos.copy(jet.pos);
    drawQuat.copy(jet.quat);
  } else {
    drawPos.copy(prevPos).lerp(jet.pos, a);
    drawQuat.copy(prevQuat).slerp(jet.quat, a);
  }
  const pm = playerModel();
  pm.group.visible = playerVisible;
  pm.group.position.copy(drawPos);
  pm.group.quaternion.copy(drawQuat);
  // flying in from far away, the new jet stays visible: it keeps a minimum size on screen
  pm.group.scale.setScalar(state === 'arriving' ? Math.max(1, drawPos.distanceTo(camera.camera.position) / 350) : 1);
  pm.setFlame(jet.throttle, jet.afterburner, simTime);
  pm.setGear(jet.gearDown && state !== 'start', dt);
  const flyingNow = state === 'flying';
  if (flyingNow && boomArmed && jet.mach >= 1) {
    boomArmed = false;
    SFX.play('boom');
    input.rumble(0.6, 0.3, 300);
  } else if (jet.mach < 0.97) boomArmed = true;
  pm.setControls(flyingNow ? input.roll : 0, flyingNow ? input.pitch : 0, flyingNow ? input.yaw : 0, dt);
  // wingtip vapour: condensation off the tips while pulling hard
  if (flyingNow && jet.gLoad > VAPOUR_G && pm.group.visible) {
    for (let i = 0; i < 2; i++) {
      const tp = JetModel.WINGTIPS[i];
      pm.group.localToWorld(_tip.set(tp[0], tp[1], tp[2]));
      vapour[i].record(_tip, frameNo);
    }
  } else if (!flyingNow) for (const v of vapour) v.clear();
  pm.setNight(isNight(), frameNo);
  squadron.sync(isNight(), frameNo);
  helis.sync(frameNo, isNight());
  threats.syncMeshes(isNight(), camera.camera.position);
  weapons.sync(camera.camera.position);
  groundWar.sync(isNight());

  pilot.sync();
  if (state === 'start' && showcase.camera(camera.camera, dt)) {
    // the showcase frames its own shots
  } else if (state === 'down' || state === 'arriving') cinematic(dt);
  else camera.update(dt, drawPos, drawQuat, jet.afterburner);
  const cp = camera.camera.position;
  const nightMix = isNight() ? 1 : 0;
  sky.update(cp.x, cp.y, cp.z, nightMix);
  clouds.update(simTime, nightMix);
  clouds.mesh.visible = state !== 'start'; // the intro show stays clear of white patches
  contrail.update(cp, drawPos, frameNo, nightMix);
  trails.update(cp, frameNo, nightMix);
  for (const v of vapour) v.update(cp, frameNo, nightMix ? 0.35 : 1);
  pathFx.attach(pm.group);
  pathFx.update(
    dt,
    { pos: drawPos, vel: jet.vel, quat: drawQuat, gLoad: jet.gLoad, mach: jet.mach, alpha: jet.alpha },
    flyingNow && pm.group.visible,
    cp,
    isNight(),
    state === 'start' ? [] : threats.missiles.items,
    state === 'start' ? [] : weapons.items.items,
  );
  terrain.follow(state === 'start' ? cp.x : drawPos.x, state === 'start' ? cp.z : drawPos.z);
  if (state === 'flying') {
    hud.update(jet, heightAt(jet.pos.x, jet.pos.z), camera.camera, threats, weapons, window.innerWidth, window.innerHeight);
    hud.setTag(`${squadron.callsign}   LEVEL ${LEVEL}${p2.on ? '   2 PLAYERS' : ''}${aero.active ? '   ' + aero.kind : ''}${mnv.active ? '   ' + mnv.def!.name + (mnv.flying ? '' : ' (MANUAL)') : ''}${rtb.active ? `   RTB: ${rtb.phase} ${rtb.end.ident}${rtb.goArounds ? ' (GO AROUND)' : ''}` : ''}${jet.gearDown ? '   GEAR DOWN' : ''}`);
    ghost.update(mnvScore.i, isNight());
    hud.p2Mark(p2.on ? p2.sel : null, p2.on ? p2.status(jet.pos) : '', camera.camera, window.innerWidth, window.innerHeight);
    const nf = nearestField(jet.pos.x, jet.pos.z);
    const rwyF = rtb.active ? rtb.end.field : nf.field;
    const rwyD = Math.hypot(rwyF.x - jet.pos.x, rwyF.z - jet.pos.z);
    const rwyLabel = `RWY ${rwyF.id}  ${rwyD < 1000 ? `${rwyD.toFixed(0)} m` : `${(rwyD / 1000).toFixed(1)} km`}`;
    minimap.update(threats, squadron, jet.pos.x, jet.pos.z, (jet.headingDeg * Math.PI) / 180, { x: rwyF.x, z: rwyF.z, label: rwyLabel });
    drawFighterUi(dt, rwyF);
    hud.rwyMark(jet.onGround ? null : _rwy.set(rwyF.x, runwaySurface(rwyF.x, rwyF.z) + 5, rwyF.z), rwyLabel, camera.camera, window.innerWidth, window.innerHeight);
  }
  rwr.update(state === 'flying' ? threats.painting : 0, state === 'flying' ? Hud.lockCount(threats) : 0, launchesSinceFrame, state === 'flying');
  launchesSinceFrame = 0;

  shadows.update(scene);
  updateMotion(pm, flyingNow);
  post.render();

  fpsFrames++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    const fps = fpsFrames / fpsTime;
    fpsNode.textContent = state === 'start' ? '' : `${Math.round(fps)} FPS`; // the intro shows only the logo
    qualityGuard(fps);
    fpsFrames = 0;
    fpsTime = 0;
  }
}

const _fwd = new Vector3();
const _rt = new Vector3();
const COMPACT_HUD = navigator.maxTouchPoints > 0 && Math.min(window.innerWidth, window.innerHeight) < 600;
/** fighter HUD, G vision and the flight-path miniature, once per display frame while flying */
function drawFighterUi(dt: number, rwyF: { x: number; z: number }): void {
  const agl = jet.onGround ? 0 : jet.pos.y - GEAR_H - Math.max(heightAt(jet.pos.x, jet.pos.z), runwaySurface(jet.pos.x, jet.pos.z) - 1);
  const aglFt = Math.max(0, agl) / 0.3048;
  _fwd.copy(jet.vel).normalize();
  _rt.crossVectors(_fwd, jet.liftUp).normalize();
  const bankDeg = (Math.atan2(-_rt.y, jet.liftUp.y) * 180) / Math.PI;
  const now = performance.now();
  let ils: { loc: number; gs: number } | null = null;
  if (rtb.active && (rtb.phase === 'FINAL' || rtb.phase === 'FLARE')) {
    const r = rtb.rel(jet.pos.x, jet.pos.z);
    const target = rtb.end.y + GEAR_H + Math.max(0, 100 - r.along) * Math.tan((3 * Math.PI) / 180);
    ils = { loc: Math.max(-1, Math.min(1, -r.cross / 100)), gs: Math.max(-1, Math.min(1, (target - jet.pos.y) / 30)) };
  }
  let navTurn: number | null = null;
  if (rtb.active || jet.gearDown) {
    const brg = (Math.atan2(rwyF.x - jet.pos.x, -(rwyF.z - jet.pos.z)) * 180) / Math.PI;
    navTurn = ((brg - jet.headingDeg + 540) % 360) - 180;
  }
  const mnvLine = mnv.active ? { text: `${mnv.def!.name}${mnv.flying ? '' : '  MANUAL'}`, stars: 0 } : lastScore && now < lastScore.until ? lastScore : null;
  fhud.draw(
    {
      q: drawQuat,
      vel: jet.vel,
      yaw: Math.atan2(-jet.nose.x, -jet.nose.z),
      bankDeg,
      headingDeg: jet.headingDeg,
      iasKt: iasKt(),
      mach: jet.mach,
      altFt: aglFt < 5000 ? aglFt : jet.pos.y / 0.3048,
      radarAlt: aglFt < 5000,
      vsiFpm: jet.vel.y * 196.85,
      gLoad: jet.gLoad,
      maxG,
      aoaDeg: (jet.alpha * 180) / Math.PI,
      power: jet.throttle * 100,
      isAfterburner: jet.afterburner,
      limiterOff: jet.limiterOff,
      stalled: jet.stalled,
      onGround: jet.onGround,
      navTurn,
      nowMs: now,
      mnv: mnvLine,
      aoaBracket: jet.gearDown && !jet.onGround ? APPROACH_AOA_DEG : null,
      ils,
      dim: isNight(),
    },
    camera.camera,
    COMPACT_HUD,
  );
  gvis.set(vision);
  mini.record(dt, jet.pos, jet.mach, jet.gLoad, !jet.onGround);
  const live: Vector3[] = [];
  for (const m of threats.missiles.items) if (m.active) live.push(m.pos);
  mini.draw(now, dt, {
    pos: jet.pos,
    vel: jet.vel,
    groundY: heightAt(jet.pos.x, jet.pos.z),
    ghost: ghostPts,
    runway: rtb.active ? rtb.end : null,
    missiles: live,
  });
}

const _off = new Vector3();
const _side = new Vector3();
const _look = new Vector3();
/** the camera while the jet is down: with the pilot under the canopy, then watching the new jet fly in */
function cinematic(dt: number): void {
  const cam = camera.camera;
  const k = 1 - Math.exp(-3 * dt);
  if (state === 'arriving') {
    // standing by the pilot (or the wreck), looking at the new jet coming in
    _off.set(jet.pos.x - landing.x, 0, jet.pos.z - landing.z).normalize();
    camGoal.copy(landing).addScaledVector(_off, -24);
    camGoal.y = landing.y + 4;
    cam.position.lerp(camGoal, k);
    // the pilot in the foreground, the new jet coming in above
    _look.copy(landing).lerp(jet.pos, 0.55);
    camLook.lerp(_look, 1 - Math.exp(-6 * dt));
  } else if (pilot.active) {
    // locked to the pilot, slowly circling: the canopy, the wreck's smoke below
    camAngle += dt * 0.12;
    cam.position.set(pilot.pos.x + Math.cos(camAngle) * 40, pilot.pos.y + 7, pilot.pos.z + Math.sin(camAngle) * 40);
    camLook.set(pilot.pos.x, pilot.pos.y + 4, pilot.pos.z);
  } else {
    // flew into the ground: circling the burning wreck
    camAngle += dt * 0.1;
    camGoal.set(landing.x + Math.cos(camAngle) * 380, landing.y + 160, landing.z + Math.sin(camAngle) * 380);
    cam.position.lerp(camGoal, k);
    camLook.lerp(landing, k);
  }
  const g = heightAt(cam.position.x, cam.position.z) + 3;
  if (cam.position.y < g) cam.position.y = g;
  cam.up.set(0, 1, 0);
  cam.lookAt(camLook);
}

/** if the device keeps dropping under 40 FPS: fewer pixels first, then no ambient occlusion, no bloom, no shadows */
let slowSpells = 0;
let qualityStep = 0;
function qualityGuard(fps: number): void {
  if (document.hidden) return;
  slowSpells = fps < 40 ? slowSpells + 1 : 0;
  if (slowSpells < 4 || qualityStep >= 4) return; // ~2 s of slow frames
  slowSpells = 0;
  qualityStep++;
  if (qualityStep === 1) {
    renderer.setPixelRatio(1);
    post.setPixelRatio(1);
    post.resize(window.innerWidth, window.innerHeight);
  } else if (qualityStep === 2) post.setAO(false);
  else if (qualityStep === 3) post.setBloom(false);
  else shadows.setEnabled(false);
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  post.resize(window.innerWidth, window.innerHeight);
  camera.resize(window.innerWidth / window.innerHeight);
  shadows.resize(camera.camera);
});

if (import.meta.env.DEV)
  (window as unknown as Record<string, unknown>).__jvm = {
    scene,
    renderer,
    camera: camera.camera,
    jet,
    threats,
    post,
    shadows,
    pilot,
    /** dev only: run n physics frames now (tests in a throttled browser window) */
    advance: (n: number) => {
      for (let i = 0; i < n; i++) fixedStep();
    },
    state: () => state,
    setNight: (on: boolean) => {
      night = on;
      applyNight();
    },
  };

applyNight();
resetWorld();
hud.show(false);
showcase.begin();
requestAnimationFrame(frame);

// offline play once installed (production build only; the dev server stays uncached)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
