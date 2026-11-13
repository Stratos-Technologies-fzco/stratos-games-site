import * as THREE from 'three';
import { createWorld, CarController } from './physics.js';
import { buildLevel } from './track.js';
import { buildCarMesh, getCar } from './cars.js';
import { StuntTracker } from './stunts.js';
import { loadSave, writeSave, totalStars, recordLevelResult } from './save.js';
import * as ui from './ui.js';

function track(name, details) { try { var S = window.Stratos || parent.Stratos; if (S) S.track(name, details); } catch (e) {} }

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 500);

let save = loadSave();

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const keys = { forward: false, backward: false, left: false, right: false, boost: false };

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': keys.forward = true; break;
    case 'KeyS': case 'ArrowDown': keys.backward = true; break;
    case 'KeyA': case 'ArrowLeft': keys.left = true; break;
    case 'KeyD': case 'ArrowRight': keys.right = true; break;
    case 'Space': keys.boost = true; break;
    case 'KeyR': requestReset(); break;
    case 'KeyC': cycleCamera(); break;
    case 'Escape': togglePause(); break;
  }
});
window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': keys.forward = false; break;
    case 'KeyS': case 'ArrowDown': keys.backward = false; break;
    case 'KeyA': case 'ArrowLeft': keys.left = false; break;
    case 'KeyD': case 'ArrowRight': keys.right = false; break;
    case 'Space': keys.boost = false; break;
  }
});

function bindTouch(id, flag) {
  const el = document.getElementById(id);
  const on = (e) => { e.preventDefault(); keys[flag] = true; };
  const off = (e) => { e.preventDefault(); keys[flag] = false; };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointerleave', off);
  el.addEventListener('pointercancel', off);
}
bindTouch('touch-steer-left', 'left');
bindTouch('touch-steer-right', 'right');
bindTouch('touch-gas', 'forward');
bindTouch('touch-brake', 'backward');
bindTouch('touch-boost', 'boost');

// Reset is a one-tap action (not a held direction), so it gets its own
// listener instead of the hold-state bindTouch() pattern above. This is
// the only way to recover a flipped car on a touch device -- KeyR covers
// the same action on keyboard.
document.getElementById('touch-reset').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  requestReset();
});

// ---------------------------------------------------------------------------
// Game / run state
// ---------------------------------------------------------------------------
let appState = 'boot';
let scene = null;
let world = null;
let car = null;
let carMesh = null;
let stunts = null;
let trackData = null;

let currentLevelId = null;
let currentMode = 'timetrial';
let elapsed = 0;
let checkpointIndex = 0;
let lastRespawn = { pos: null, yaw: 0 };
let stuntScore = 0;
let boostFuel = 45;
let cameraMode = 0; // 0 = chase, 1 = far cinematic
const SPAWN_CLEARANCE = 3; // keeps the car's rear wheels on solid ground at spawn

const camPos = new THREE.Vector3();
const camLookTmp = new THREE.Vector3();
let camInit = false;

function cycleCamera() {
  cameraMode = (cameraMode + 1) % 2;
}

function requestReset() {
  if (appState !== 'playing' || !car || !lastRespawn.pos) return;
  car.teleport({ x: lastRespawn.pos.x, y: lastRespawn.pos.y + 1.2, z: lastRespawn.pos.z }, lastRespawn.yaw);
  ui.spawnStuntPopup('RESET');
}

function togglePause() {
  if (appState === 'playing') {
    appState = 'paused';
    ui.setPauseVisible(true);
  } else if (appState === 'paused') {
    appState = 'playing';
    ui.setPauseVisible(false);
  }
}

function disposeScene(s) {
  if (!s) return;
  s.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => m.dispose && m.dispose());
    }
  });
}

function startLevel(levelId, mode) {
  currentLevelId = levelId;
  currentMode = mode;

  disposeScene(scene);
  scene = new THREE.Scene();

  const hemi = new THREE.HemisphereLight(0xffffff, 0x404060, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(60, 90, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
  sun.shadow.camera.far = 300;
  scene.add(sun);

  world = createWorld();
  trackData = buildLevel(levelId, scene, world);

  const carDef = getCar(save.selectedCar);
  const startYawRad = (trackData.startYaw) * Math.PI / 180;
  // The track's first platform begins exactly at trackData.startPos, so
  // spawning the car's origin there leaves its rear half hanging off the
  // back edge with nothing under it. Push the spawn point forward so the
  // whole chassis sits on solid ground.
  const spawnPos = {
    x: trackData.startPos.x + Math.sin(startYawRad) * SPAWN_CLEARANCE,
    y: trackData.startPos.y,
    z: trackData.startPos.z + Math.cos(startYawRad) * SPAWN_CLEARANCE,
  };
  car = new CarController(world, carDef, spawnPos, startYawRad);

  carMesh = buildCarMesh(carDef);
  scene.add(carMesh.group);
  for (const w of carMesh.wheels) scene.add(w);

  stunts = new StuntTracker();

  elapsed = 0;
  checkpointIndex = 0;
  stuntScore = 0;
  boostFuel = 45;
  lastRespawn = { pos: spawnPos, yaw: startYawRad };
  camInit = false;

  ui.updateHudCheckpoint(0, trackData.checkpoints.length);
  ui.updateHudTimer(0, mode === 'freeride');
  ui.updateHudScore(0);
  ui.updateBoostMeter(boostFuel);
  ui.setHudVisible(true);
  ui.setPauseVisible(false);
  ui.showScreen('none-game'); // hides every menu overlay; no screen named this on purpose

  appState = 'playing';
  track('level_start', { level: levelId, mode, car: carDef.id });
}

function finishLevel() {
  const freeride = currentMode === 'freeride';
  let stars = 0;
  if (!freeride) {
    const pt = trackData.level.parTimes;
    stars = elapsed <= pt.gold ? 3 : elapsed <= pt.silver ? 2 : 1;
    save = recordLevelResult(save, currentLevelId, stars, elapsed, stuntScore);
    track('level_complete', { level: currentLevelId, stars, time: elapsed, score: stuntScore });
  } else {
    track('game_over', { level: currentLevelId, mode: 'freeride', time: elapsed, score: stuntScore });
  }
  appState = 'results';
  ui.setHudVisible(false);
  ui.showResults({
    title: freeride ? 'SESSION ENDED' : 'LEVEL COMPLETE!',
    stars, timeSec: elapsed, stuntScore, freeride,
  });
}

// ---------------------------------------------------------------------------
// Menu wiring
// ---------------------------------------------------------------------------
document.getElementById('btn-play').addEventListener('click', () => {
  ui.renderLevelList((levelId) => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    startLevel(levelId, mode);
  });
  ui.showScreen('levelSelect');
});
document.getElementById('btn-garage').addEventListener('click', () => {
  ui.renderCarList((carId) => { save.selectedCar = carId; writeSave(save); });
  ui.showScreen('garage');
});
document.getElementById('btn-howto').addEventListener('click', () => ui.showScreen('howto'));
document.getElementById('btn-back-menu').addEventListener('click', () => { ui.refreshStarsTotal(); ui.showScreen('menu'); });
document.getElementById('btn-back-menu-2').addEventListener('click', () => { ui.refreshStarsTotal(); ui.showScreen('menu'); });
document.getElementById('btn-back-menu-3').addEventListener('click', () => { ui.refreshStarsTotal(); ui.showScreen('menu'); });

document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-restart').addEventListener('click', () => { startLevel(currentLevelId, currentMode); });
document.getElementById('btn-quit').addEventListener('click', () => {
  if (car) track('game_over', { level: currentLevelId, mode: currentMode, time: elapsed, score: stuntScore, quit: true });
  appState = 'menu';
  ui.setPauseVisible(false);
  ui.setHudVisible(false);
  ui.refreshStarsTotal();
  ui.showScreen('menu');
});

document.getElementById('btn-retry').addEventListener('click', () => startLevel(currentLevelId, currentMode));
document.getElementById('btn-results-menu').addEventListener('click', () => {
  ui.renderLevelList((levelId) => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    startLevel(levelId, mode);
  });
  ui.showScreen('levelSelect');
});

// ---------------------------------------------------------------------------
// Boot sequence
// ---------------------------------------------------------------------------
function boot() {
  let pct = 0;
  const iv = setInterval(() => {
    pct += 14 + Math.random() * 20;
    if (pct >= 100) {
      pct = 100;
      clearInterval(iv);
      ui.setBootProgress(100, 'Ready!');
      setTimeout(() => {
        appState = 'menu';
        ui.refreshStarsTotal();
        ui.showScreen('menu');
      }, 200);
    } else {
      ui.setBootProgress(pct, 'Loading assets…');
    }
  }, 120);
}
boot();

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------
function onResize() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  // A fixed vertical FOV reads as uncomfortably zoomed-in on tall phone
  // screens, since horizontal FOV shrinks with the aspect ratio. Widen the
  // vertical FOV as the viewport gets more portrait to compensate.
  camera.fov = aspect >= 1 ? 72 : Math.min(100, 72 + (1 - aspect) * 40);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
onResize();

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
const worldUp = new THREE.Vector3(0, 1, 0);

function dist3(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 1 / 30);

  if (appState === 'playing' && car) {
    const controls = { ...keys, boostFuel };
    world.step(1 / 60, dt, 6);
    const { airborne, airTime } = car.update(dt, controls);
    const stuntEvents = stunts.update(dt, car.chassisBody, airborne, airTime);

    for (const ev of stuntEvents) {
      if (ev.type === 'bank') {
        stuntScore += ev.points;
        ui.updateHudScore(stuntScore);
        ui.spawnStuntPopup(ev.label, ev.points);
        boostFuel = Math.min(100, boostFuel + 16 * ev.combo);
        if (ev.combo > 1.4) ui.showComboBanner(`${ev.combo.toFixed(1)}x COMBO!`);
      } else if (ev.type === 'crash') {
        ui.spawnStuntPopup('WIPEOUT!');
      }
    }

    // Boost fuel economy
    if (keys.boost && boostFuel > 0) {
      boostFuel = Math.max(0, boostFuel - 32 * dt);
    } else {
      boostFuel = Math.min(100, boostFuel + 5 * dt);
    }
    ui.updateBoostMeter(boostFuel);
    ui.updateSpeedMeter(car.getSpeedKmh(), (car.boostMaxSpeed) * 3.6);

    // Timer / checkpoints (time trial only drives progression)
    if (currentMode === 'timetrial') {
      elapsed += dt;
      ui.updateHudTimer(elapsed, false);
      const cp = trackData.checkpoints[checkpointIndex];
      if (cp && dist3(car.chassisBody.position, cp.pos) < cp.radius) {
        const yaw = Math.atan2(
          2 * (car.chassisBody.quaternion.w * car.chassisBody.quaternion.y),
          1 - 2 * (car.chassisBody.quaternion.y * car.chassisBody.quaternion.y),
        );
        lastRespawn = { pos: { x: cp.pos.x, y: cp.pos.y, z: cp.pos.z }, yaw };
        checkpointIndex++;
        ui.updateHudCheckpoint(checkpointIndex, trackData.checkpoints.length);
        if (checkpointIndex >= trackData.checkpoints.length) {
          finishLevel();
        } else {
          ui.spawnStuntPopup('CHECKPOINT');
        }
      }
    } else {
      // Free ride: checkpoints just refuel boost a little, no end condition.
      const cp = trackData.checkpoints[checkpointIndex % trackData.checkpoints.length];
      if (cp && dist3(car.chassisBody.position, cp.pos) < cp.radius) {
        checkpointIndex++;
        boostFuel = Math.min(100, boostFuel + 10);
      }
    }

    // Fell into the void -> respawn
    if (car.chassisBody.position.y < trackData.voidY) {
      car.teleport({ x: lastRespawn.pos.x, y: lastRespawn.pos.y + 1.2, z: lastRespawn.pos.z }, lastRespawn.yaw);
      ui.spawnStuntPopup('FELL OFF!');
    }

    // Sync visuals
    const p = car.chassisBody.position;
    const q = car.chassisBody.quaternion;
    carMesh.group.position.set(p.x, p.y, p.z);
    carMesh.group.quaternion.set(q.x, q.y, q.z, q.w);
    const wheelTransforms = car.getWheelTransforms();
    for (let i = 0; i < carMesh.wheels.length; i++) {
      const wt = wheelTransforms[i];
      carMesh.wheels[i].position.set(wt.position.x, wt.position.y, wt.position.z);
      carMesh.wheels[i].quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
    }

    updateCamera(dt, p, q);
  }

  if (scene) renderer.render(scene, camera);
}

function updateCamera(dt, bodyPos, bodyQuat) {
  const carPos = new THREE.Vector3(bodyPos.x, bodyPos.y, bodyPos.z);
  const carQuat = new THREE.Quaternion(bodyQuat.x, bodyQuat.y, bodyQuat.z, bodyQuat.w);
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(carQuat);
  fwd.y = 0;
  if (fwd.lengthSq() < 0.0001) fwd.set(0, 0, 1); else fwd.normalize();

  const far = cameraMode === 1;
  const portraitBoost = Math.max(0, 1 - camera.aspect) * 3; // pull back further on tall phone screens
  const backDist = (far ? 13 : 7.5) + portraitBoost;
  const height = (far ? 6.5 : 3.4) + portraitBoost * 0.4;
  const lookAhead = far ? 6 : 4;

  const desired = carPos.clone().addScaledVector(fwd, -backDist);
  desired.y += height;

  if (!camInit) {
    camPos.copy(desired);
    camInit = true;
  } else {
    const t = 1 - Math.exp(-dt * 5.5);
    camPos.lerp(desired, t);
  }
  camera.position.copy(camPos);
  camLookTmp.copy(carPos).addScaledVector(fwd, lookAhead);
  camLookTmp.y += 1.1;
  camera.up.copy(worldUp);
  camera.lookAt(camLookTmp);
}

tick();
