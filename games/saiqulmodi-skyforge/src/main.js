import { createParachuteRig } from './fleet/parachute.js';
import { FighterCockpitInterior } from './aircraft/cockpitInterior.js';
import { createSeatedPilot } from './fleet/pilotAvatar.js';
import * as THREE from 'three';
import { GameLoop } from './core/loop.js';
import { Environment } from './world/environment.js';
import { AirportVOBL } from './world/runway.js';
import { AIRCRAFT_SPECS } from '../data/aircraft_specs.js';
import { TrainerModel } from './aircraft/trainer.js';
import { AeroEngine6DOF } from './physics/aero.js';
import { InputManager } from './core/input.js';
import { CockpitInstruments } from './aircraft/cockpit_instruments.js';

class SkyforgeApp {
  constructor() {
    window.skyforgeApp = this;
    setupDuplicatePipDisplay(this);
    this.container = document.getElementById('canvas-container');
    this.valFps = document.getElementById('val-fps');
    this.valDraws = document.getElementById('val-draws');
    this.valIas = document.getElementById('val-ias');
    this.valAlt = document.getElementById('val-alt');
    this.valVsi = document.getElementById('val-vsi');
    this.valThrottle = document.getElementById('val-throttle');
    this.valBrakes = document.getElementById('val-brakes');
    this.valAoa = document.getElementById('val-aoa');
    this.stallWarn = document.getElementById('stall-warning');

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xaaccff, 0.00008);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 200000);

    // Pass both scene and renderer
    this.environment = new Environment(this.scene, this.renderer);
    this.airport = new AirportVOBL(this.scene);
    this.instruments = new CockpitInstruments();

    this.trainerMesh = new TrainerModel();
    this.scene.add(this.trainerMesh.group);

    // --- Enhanced Sunlight & Sky Illumination ---
    const skySunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    skySunLight.position.set(50, 100, 50);
    this.scene.add(skySunLight);

    const skyHemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x334433, 1.2);
    this.scene.add(skyHemiLight);
    attachPilotToAircraft(this.trainerMesh.group);
    this.cockpitInterior = new FighterCockpitInterior(this.scene, this.camera);
    this.trainerMesh.group.add(this.cockpitInterior.cockpitGroup);
    this.cockpitInterior.cockpitGroup.position.set(0, 0.45, 0.2);

    const spawnPos = new THREE.Vector3(0, 1.45, -1850);
    this.physics = new AeroEngine6DOF(AIRCRAFT_SPECS.trainer, spawnPos);
    this.physics.throttle = 0.0;
    this.physics.brakes = 1.0;
    this.physics.isOnGround = true;

    this.input = new InputManager();
    this.input.controls.throttle = 0.0;
    this.input.controls.brakes = true;

    this.setCockpitEyeCamera(this.camera, this.trainerMesh.group);
    this.camera.lookAt(0, 1.5, -1800);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.loop = new GameLoop(this.update.bind(this), this.render.bind(this));
    this.loop.start();
  }

  update(dt) {
    this.input.update(dt, this.physics.isOnGround);
    this.physics.update(dt, this.input.controls);

    this.trainerMesh.group.position.copy(this.physics.position);
    this.trainerMesh.group.quaternion.copy(this.physics.quaternion);
    if (window._updateParachutist) window._updateParachutist(0.016, this.camera);
    this.trainerMesh.updateVisuals(this.input.controls, this.physics.throttle, (this.physics.rpm - 750) / 1950);
    if (this.cockpitInterior) {
      this.cockpitInterior.update({
        airspeedKt: (this.physics.velocity ? this.physics.velocity.length() * 1.94384 : 1051),
        altitudeFt: (this.physics.position ? this.physics.position.y * 3.28084 : 2700),
        gForce: 9.0,
        throttle: this.physics.throttle || 0.85,
        mach: 1.59,
        verticalSpeedFpm: (this.physics.velocity ? this.physics.velocity.y * 196.85 : 0),
        apActive: false,
        deltaSec: 0.016
      }, this.input.controls);
    }

    if (this.airport && this.airport.updatePAPI) {
      this.airport.updatePAPI(this.physics.position);
    }
    if (this.instruments) {
      this.instruments.update(this.physics);
    }

    if (this.input.controls.cameraToggle) {
      const eyeOffset = new THREE.Vector3(0, 0.72, 1.15).applyQuaternion(this.physics.quaternion);
      this.camera.position.copy(this.physics.position).add(eyeOffset);
      const lookTarget = new THREE.Vector3(0, 0.7, 50).applyQuaternion(this.physics.quaternion);
      this.camera.lookAt(this.camera.position.clone().add(lookTarget));
    } else {
      const camOffset = new THREE.Vector3(0, 3.5, -13.0).applyQuaternion(this.physics.quaternion);
      this.camera.position.copy(this.physics.position).add(camOffset);
      this.camera.lookAt(this.physics.position.clone().add(new THREE.Vector3(0, 1.0, 5.0).applyQuaternion(this.physics.quaternion)));
    }

    this.valFps.textContent = this.loop.fps;
    this.valDraws.textContent = this.renderer.info.render.calls;
    this.valIas.textContent = Math.round(this.physics.iasKnots) + ' kts';
    this.valAlt.textContent = Math.round(this.physics.altitudeFt) + ' ft';
    this.valVsi.textContent = Math.round(this.physics.vsiFpm) + ' ft/m';
    this.valThrottle.textContent = Math.round(this.physics.throttle * 100) + '%';
    this.valBrakes.textContent = this.physics.brakes ? 'ENGAGED' : 'RELEASED';
    this.valBrakes.style.color = this.physics.brakes ? '#ef4444' : '#22c55e';
    this.valAoa.textContent = this.physics.aoaDeg.toFixed(1) + '°';
    this.stallWarn.style.display = this.physics.isStalled ? 'block' : 'none';
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    new SkyforgeApp();
  } catch (err) {
    console.error(err);
    alert('Startup Error: ' + err.message);
  }
});

// --- Injected 3D Seated Pilot Avatar ---
let activePilotAvatar = null;
export function attachPilotToAircraft(aircraftMesh) {
  if (!aircraftMesh) return null;
  const pilot = createSeatedPilot();
  pilot.position.set(0, 0.45, 0.4); // Fits inside cockpit tub
  aircraftMesh.add(pilot);
  activePilotAvatar = pilot;
  return pilot;
}
// --- pilot_head_visibility_hook ---
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyC' && activePilotAvatar) {
    const head = activePilotAvatar.getObjectByName('pilot_head');
    if (head) {
      // Toggle head visibility so it doesn't clip eye camera in cockpit mode
      setTimeout(() => {
        const isCockpit = document.body.innerText.includes('VIEW: COCKPIT');
        head.visible = !isCockpit;
      }, 50);
    }
  }
});



// Display Aviation Rule Violations on Screen
window.addEventListener('flight-rule-alert', (e) => {
  let alertBox = document.getElementById('aviation-rules-box');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'aviation-rules-box';
    alertBox.style.position = 'fixed';
    alertBox.style.top = '12px';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translateX(-50%)';
    alertBox.style.padding = '8px 16px';
    alertBox.style.background = 'rgba(20, 0, 0, 0.85)';
    alertBox.style.border = '2px solid #ff3333';
    alertBox.style.borderRadius = '4px';
    alertBox.style.fontFamily = 'monospace';
    alertBox.style.fontSize = '14px';
    alertBox.style.zIndex = '10000';
    alertBox.style.pointerEvents = 'none';
    document.body.appendChild(alertBox);
  }

  const lines = e.detail.violations.map(v => `<div style="color: #ff4444; font-weight: bold;">⚠ ${v}</div>`).join('');
  alertBox.innerHTML = lines;
  alertBox.style.display = 'block';

  clearTimeout(window._alertTimer);
  window._alertTimer = setTimeout(() => {
    if (alertBox) alertBox.style.display = 'none';
  }, 500);
});

// ==========================================
// ENGINE FLAMEOUT & EJECTION SYSTEM
// ==========================================
let isEngineFlameout = false;
let isEjected = false;

// Audio Synthesizer for Ejection Siren / Master Caution
function playEjectionAlarm() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz high warning tone
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3); // Alternating sweep
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (err) {}
}

// Function to trigger engine failure (e.g. key 'J' or flameout condition)
export function triggerEngineFailure() {
  if (isEngineFlameout) return;
  isEngineFlameout = true;

  // Kill throttle & rpm
  if (window.skyforgeApp && window.skyforgeApp.physics) {
    window.skyforgeApp.physics.throttle = 0;
    window.skyforgeApp.physics.rpm = 0;
  }

  // Display Flashing Ejection Warning Banner
  let warnBox = document.getElementById('ejection-warning-box');
  if (!warnBox) {
    warnBox = document.createElement('div');
    warnBox.id = 'ejection-warning-box';
    warnBox.style.position = 'fixed';
    warnBox.style.top = '15%';
    warnBox.style.left = '50%';
    warnBox.style.transform = 'translateX(-50%)';
    warnBox.style.padding = '18px 36px';
    warnBox.style.background = 'rgba(200, 0, 0, 0.9)';
    warnBox.style.border = '4px solid #ffff00';
    warnBox.style.borderRadius = '8px';
    warnBox.style.textAlign = 'center';
    warnBox.style.fontFamily = 'monospace';
    warnBox.style.zIndex = '99999';
    warnBox.style.boxShadow = '0 0 35px rgba(255, 0, 0, 0.9)';
    document.body.appendChild(warnBox);
  }

  warnBox.innerHTML = `
    <div style="color: #ffff00; font-size: 32px; font-weight: bold; text-shadow: 0 0 10px #000;">
      ⚠ ENGINE FLAMEOUT — DUAL COMPRESSOR STALL ⚠
    </div>
    <div style="color: #ffffff; font-size: 26px; font-weight: bold; margin-top: 8px; animation: blinker 0.6s linear infinite;">
      PULL EJECTION HANDLE NOW [PRESS 'E' 3x OR PRESS 'K']
    </div>
  `;

  // Start repetitive siren
  const alarmInterval = setInterval(() => {
    if (isEjected || !isEngineFlameout) {
      clearInterval(alarmInterval);
      return;
    }
    playEjectionAlarm();
  }, 400);
}

// Ejection Sequence (Canopy jettisons, seat rockets out)
export function executeEjection(aircraftMesh) {
  if (isEjected) return;
  isEjected = true;

  const warnBox = document.getElementById('ejection-warning-box');
  if (warnBox) {
    warnBox.innerHTML = `
      <div style="color: #00ff66; font-size: 32px; font-weight: bold;">
        CANOPY BLOWN — PILOT EJECTED SAFELY
      </div>
      <div style="color: #ffffff; font-size: 20px; margin-top: 6px;">
        Chute Deployed | Awaiting SAR Recovery | Press [R] to Respawn
      </div>
    `;
    warnBox.style.background = 'rgba(0, 40, 10, 0.9)';
    warnBox.style.border = '4px solid #00ff66';
  }

  // Rocket the pilot avatar upward out of the cockpit
  if (aircraftMesh) {
    const pilot = aircraftMesh.getObjectByName('pilot_avatar');
    if (pilot) {
      let ejectionDist = 0;
      const rocketBurn = setInterval(() => {
        pilot.position.y += 0.8;
        pilot.position.z += 0.3; // Angle back from jet path
        ejectionDist += 1;
        if (ejectionDist > 50) clearInterval(rocketBurn);
      }, 16);
    }
  }
}

// Keyboard binds:
// 'J' = Trigger Engine Flameout / Failure
// 'K' = Eject Pilot Immediately
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyJ') {
    triggerEngineFailure();
  }
  if (e.code === 'KeyK') {
    const aircraft = (window.skyforgeApp && window.skyforgeApp.trainerMesh) ? window.skyforgeApp.trainerMesh.group : null;
    triggerFullEjectionSequence(window.skyforgeApp);
  }
});

// ==========================================
// VISUAL EJECTION, PARACHUTE & SAFE LANDING
// ==========================================
let activeParachutist = null;

export function triggerFullEjectionSequence(app) {
  if (!app || !app.trainerMesh) return;
  const aircraftMesh = app.trainerMesh.group;
  const pilot = aircraftMesh.getObjectByName('pilot_avatar');
  if (!pilot) return;

  // 1. Detach pilot from jet into world coordinates
  const worldPos = new THREE.Vector3();
  const worldQuat = new THREE.Quaternion();
  pilot.getWorldPosition(worldPos);
  pilot.getWorldQuaternion(worldQuat);

  aircraftMesh.remove(pilot);
  app.scene.add(pilot);
  pilot.position.copy(worldPos);
  pilot.quaternion.copy(worldQuat);

  // Un-hide helmet so pilot is fully visible descending
  const pilotHead = pilot.getObjectByName('pilot_head');
  if (pilotHead) pilotHead.visible = true;

  // 2. Attach Parachute Rig above pilot harness
  const chuteRig = createParachuteRig();
  chuteRig.scale.set(0.1, 0.1, 0.1); // Starts packed/deploying
  pilot.add(chuteRig);

  // 3. Update HUD Banner
  let warnBox = document.getElementById('ejection-warning-box');
  if (warnBox) {
    warnBox.innerHTML = `
      <div style="color: #ffaa00; font-size: 26px; font-weight: bold;">
        EJECTION SEAT ROCKETED — DEPLOYING PARACHUTE
      </div>
      <div style="color: #ffffff; font-size: 18px; margin-top: 5px;">
        Tracking Pilot Descent | Hold Steady
      </div>
    `;
    warnBox.style.background = 'rgba(20, 20, 20, 0.85)';
    warnBox.style.border = '3px solid #ffaa00';
  }

  // 4. Parachute physics & descent state
  activeParachutist = {
    mesh: pilot,
    chute: chuteRig,
    velocity: new THREE.Vector3(0, 18.0, -10.0), // Initial rocket kick upward and back
    stage: 'ROCKET', // 'ROCKET' -> 'CHUTE_DESCENT' -> 'LANDED'
    touchdownY: 0.2
  };

  // Rocket burn for 0.8s, then open main parachute
  setTimeout(() => {
    if (activeParachutist) {
      activeParachutist.stage = 'CHUTE_DESCENT';
      // Bloom parachute canopy to full size
      let scale = 0.1;
      const bloomInterval = setInterval(() => {
        scale += 0.15;
        if (scale >= 1.0) {
          scale = 1.0;
          clearInterval(bloomInterval);
        }
        chuteRig.scale.set(scale, scale, scale);
      }, 30);
    }
  }, 800);
}

// Global hook to update parachute drift each frame
function updateParachutist(delta, camera) {
  if (!activeParachutist) return;
  const p = activeParachutist;

  if (p.stage === 'ROCKET') {
    p.mesh.position.addScaledVector(p.velocity, delta);
    p.velocity.y -= 15.0 * delta; // Rocket motor burn decay
  } else if (p.stage === 'CHUTE_DESCENT') {
    // Gentle steady descent under canopy (5 m/s sink rate)
    p.mesh.position.y -= 5.0 * delta;
    p.mesh.position.z += 1.5 * delta; // Light wind drift

    // Gentle canopy sway
    p.chute.rotation.z = Math.sin(Date.now() * 0.003) * 0.08;
    p.chute.rotation.x = Math.cos(Date.now() * 0.002) * 0.06;

    // Follow descending pilot with camera so player watches the full drift
    if (camera) {
      setCockpitEyeCamera(this.camera, this.trainerMesh.group);
      camera.lookAt(p.mesh.position.x, p.mesh.position.y + 1.5, p.mesh.position.z);
    }

    // Touchdown Check
    if (p.mesh.position.y <= p.touchdownY) {
      p.mesh.position.y = p.touchdownY;
      p.stage = 'LANDED';
      
      // Deflate / collapse parachute canopy to the side
      p.chute.position.set(1.2, -0.2, 0.8);
      p.chute.rotation.z = 1.2;

      const warnBox = document.getElementById('ejection-warning-box');
      if (warnBox) {
        warnBox.innerHTML = `
          <div style="color: #00ff66; font-size: 28px; font-weight: bold;">
            PILOT TOUCHDOWN — SAFE ON GROUND
          </div>
          <div style="color: #ffffff; font-size: 18px; margin-top: 6px;">
            Harness Released | Recovery Beacon Transmitting | Press [R] to Respawn
          </div>
        `;
        warnBox.style.border = '3px solid #00ff66';
      }
    }
  }
}
window._updateParachutist = updateParachutist;

// Hook Fleet UI Buttons to Realistic 3D Airframe Models
document.querySelectorAll('button').forEach(btn => {
  const text = btn.innerText.trim().toLowerCase();
  if (['trainer', 'airliner', 'fighter', 'helicopter'].includes(text)) {
    btn.addEventListener('click', () => {
      if (window.skyforgeApp && window.skyforgeApp.trainerMesh) {
        window.skyforgeApp.trainerMesh.setProfile(text);
      }
    });
  }
});


// ==========================================
// UNIFIED INTEGRATION: FLIGHT RULES, CHUTE & FLEET
// ==========================================
let activeParachutist = null;
let isEngineFlameout = false;
let isEjected = false;

// Audio Siren for Ejection / Flameout
function playWarningSiren() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

// 1. Engine Flameout Trigger (Key 'J')
window.triggerFlameout = function() {
  if (isEngineFlameout) return;
  isEngineFlameout = true;
  if (window.skyforgeApp && window.skyforgeApp.physics) {
    window.skyforgeApp.physics.throttle = 0;
    window.skyforgeApp.physics.rpm = 0;
  }
  let box = document.getElementById('flameout-alert');
  if (!box) {
    box = document.createElement('div');
    box.id = 'flameout-alert';
    box.style = 'position:fixed;top:14%;left:50%;transform:translateX(-50%);padding:14px 28px;background:rgba(220,0,0,0.9);border:3px solid #ffcc00;border-radius:8px;font-family:monospace;z-index:99999;text-align:center;color:#fff;box-shadow:0 0 30px #f00;';
    document.body.appendChild(box);
  }
  box.innerHTML = '<div style="font-size:24px;color:#ffcc00;font-weight:bold;">⚠ DUAL ENGINE FLAMEOUT ⚠</div><div style="font-size:18px;margin-top:6px;">PULL EJECTION HANDLE [PRESS K]</div>';
  
  const sirenTimer = setInterval(() => {
    if (isEjected || !isEngineFlameout) { clearInterval(sirenTimer); return; }
    playWarningSiren();
  }, 450);
};

// 2. Pilot Ejection & Parachute Deployment (Key 'K')
window.triggerEject = function() {
  if (isEjected || !window.skyforgeApp || !window.skyforgeApp.trainerMesh) return;
  isEjected = true;

  const aircraft = window.skyforgeApp.trainerMesh.group;
  const pilot = aircraft.getObjectByName('pilot_avatar');
  if (!pilot) return;

  const wPos = new THREE.Vector3();
  const wQuat = new THREE.Quaternion();
  pilot.getWorldPosition(wPos);
  pilot.getWorldQuaternion(wQuat);

  aircraft.remove(pilot);
  window.skyforgeApp.scene.add(pilot);
  pilot.position.copy(wPos);
  pilot.quaternion.copy(wQuat);

  const head = pilot.getObjectByName('pilot_head');
  if (head) head.visible = true;

  const chute = createParachuteRig();
  pilot.add(chute);
  chute.scale.set(0.1, 0.1, 0.1);

  activeParachutist = { mesh: pilot, chute: chute, stage: 'ROCKET', velY: 18, timer: 0 };
  
  let box = document.getElementById('flameout-alert');
  if (box) {
    box.innerHTML = '<div style="font-size:24px;color:#00ff66;font-weight:bold;">CANOPY JETTISONED — PARACHUTE OPEN</div><div style="font-size:16px;">Descending to Safe LZ | Press [R] to Respawn</div>';
    box.style.background = 'rgba(0,35,10,0.9)';
    box.style.borderColor = '#00ff66';
  }

  setTimeout(() => {
    if (activeParachutist) {
      activeParachutist.stage = 'CANOPY';
      let sc = 0.1;
      const bInt = setInterval(() => {
        sc += 0.15;
        if (sc >= 1.0) { sc = 1.0; clearInterval(bInt); }
        chute.scale.set(sc, sc, sc);
      }, 30);
    }
  }, 700);
};

// 3. Paratrooper Chalk Drop (Key 'P')
window.dropTroopers = function() {
  if (window.skyforgeApp && window.skyforgeApp.paratroopers && window.skyforgeApp.trainerMesh) {
    const plane = window.skyforgeApp.trainerMesh.group;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(plane.quaternion);
    window.skyforgeApp.paratroopers.dropParatroopers(plane.position, fwd, 6);
  }
};

// 4. Keyboard Listener Registration
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyJ') window.triggerFlameout();
  if (e.code === 'KeyK') window.triggerEject();
  if (e.code === 'KeyP') window.dropTroopers();
  if (e.code === 'KeyR') location.reload();
});

// 5. Connect UI Fleet Buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button').forEach(btn => {
    const name = btn.innerText.trim().toLowerCase();
    if (['trainer', 'airliner', 'fighter', 'helicopter'].includes(name)) {
      btn.addEventListener('click', () => {
        if (window.skyforgeApp && window.skyforgeApp.trainerMesh) {
          window.skyforgeApp.trainerMesh.setProfile(name);
        }
      });
    }
  });
});



// --- Exact Pilot Eye Cockpit Camera Setup ---
export function setCockpitEyeCamera(camera, aircraftMesh) {
  if (!camera || !aircraftMesh) return;
  // Pilot head center: Y = 0.82 (eye level), Z = -0.05 (just at helmet visor)
  const eyeOffset = new THREE.Vector3(0, 0.82, -0.05);
  eyeOffset.applyQuaternion(aircraftMesh.quaternion);
  camera.position.copy(aircraftMesh.position).add(eyeOffset);
  
  // Look straight forward over the HUD combiner and glare shield
  const lookTarget = new THREE.Vector3(0, 0.78, -15.0);
  lookTarget.applyQuaternion(aircraftMesh.quaternion);
  camera.lookAt(aircraftMesh.position.clone().add(lookTarget));
}


// ==========================================
// DUAL-VIEW DUPLICATE PIP (AIRCRAFT & COCKPIT)
// ==========================================
let pipRenderer = null;
let pipCamera = null;
let pipContainer = null;

function setupDuplicatePipDisplay(app) {
  if (pipContainer) return;

  // Create bottom-corner PiP viewport container
  pipContainer = document.createElement('div');
  pipContainer.id = 'aircraft-pip-container';
  pipContainer.style.position = 'fixed';
  pipContainer.style.bottom = '18px';
  pipContainer.style.right = '18px';
  pipContainer.style.width = '240px';
  pipContainer.style.height = '160px';
  pipContainer.style.background = 'rgba(5, 12, 18, 0.85)';
  pipContainer.style.border = '2px solid #00ffaa';
  pipContainer.style.borderRadius = '8px';
  pipContainer.style.overflow = 'hidden';
  pipContainer.style.boxShadow = '0 0 18px rgba(0, 255, 170, 0.4)';
  pipContainer.style.zIndex = '9999';

  const label = document.createElement('div');
  label.id = 'pip-mode-label';
  label.style.position = 'absolute';
  label.style.top = '4px';
  label.style.left = '8px';
  label.style.fontFamily = 'monospace';
  label.style.fontSize = '10px';
  label.style.fontWeight = 'bold';
  label.style.color = '#00ffaa';
  label.style.textShadow = '0 0 4px #000';
  label.innerText = 'EXT AIRCRAFT STATUS [LIVE 3D]';
  pipContainer.appendChild(label);

  document.body.appendChild(pipContainer);

  // Dedicated secondary WebGL renderer for the duplicate PiP
  pipRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  pipRenderer.setSize(240, 160);
  pipRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  pipContainer.appendChild(pipRenderer.domElement);

  // Dedicated secondary camera
  pipCamera = new THREE.PerspectiveCamera(45, 240 / 160, 0.1, 1000);
}

function updateDuplicatePip(app, isCockpitMode) {
  if (!pipRenderer || !pipCamera || !app || !app.trainerMesh) return;

  const aircraft = app.trainerMesh.group;
  const label = document.getElementById('pip-mode-label');

  if (isCockpitMode) {
    // 1. IN COCKPIT MODE -> Show external duplicate 3D aircraft with live orientation
    if (label) label.innerText = 'EXT AIRCRAFT 3D HOLOGRAPH';
    
    // Position PiP camera orbiting the aircraft slightly offset
    const offset = new THREE.Vector3(3.5, 2.2, 7.5);
    offset.applyQuaternion(aircraft.quaternion);
    pipCamera.position.copy(aircraft.position).add(offset);
    pipCamera.lookAt(aircraft.position);
  } else {
    // 2. IN EXTERNAL/CHASE MODE -> Show live interior cockpit POV
    if (label) label.innerText = 'INT COCKPIT HUD & MFDs';

    const eyeOffset = new THREE.Vector3(0, 0.82, -0.05);
    eyeOffset.applyQuaternion(aircraft.quaternion);
    pipCamera.position.copy(aircraft.position).add(eyeOffset);

    const fwd = new THREE.Vector3(0, 0.78, -10.0);
    fwd.applyQuaternion(aircraft.quaternion);
    pipCamera.lookAt(aircraft.position.clone().add(fwd));
  }

  pipRenderer.render(app.scene, pipCamera);
}

// Auto-switch to Cockpit View on startup
setTimeout(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const viewBtn = buttons.find(b => b.innerText.includes('VIEW: CHASE') || b.innerText.includes('VIEW: COCKPIT'));
  if (viewBtn && viewBtn.innerText.includes('CHASE')) {
    viewBtn.click();
  }
}, 500);





// Permanently hide top-left instructions overlay
const hideTopLeftStyle = document.createElement('style');
hideTopLeftStyle.innerHTML = `
  #instructions, .instructions, #help-overlay,
  div[style*="top: 10px"][style*="left: 10px"],
  div[style*="top: 12px"][style*="left: 12px"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
  }
`;
document.head.appendChild(hideTopLeftStyle);

setInterval(() => {
  document.querySelectorAll('div').forEach(el => {
    if (el.textContent && (el.textContent.includes('SKYFORGE SIMULATOR') || el.textContent.includes('Controls: [W/S]'))) {
      el.remove();
    }
  });
}, 100);


// Catastrophic Crash Visual Display
window.addEventListener('aircraft-crash', (e) => {
  let overlay = document.getElementById('critical-crash-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'critical-crash-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'radial-gradient(circle, rgba(255, 30, 0, 0.75) 10%, rgba(30, 0, 0, 0.95) 90%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';
    overlay.style.pointerEvents = 'auto';

    overlay.innerHTML = `
      <div style="font-family: monospace; text-align: center; color: #fff;">
        <h1 style="color: #ff3333; font-size: 58px; margin: 0; text-shadow: 0 0 25px #000;">
          CRITICAL IMPACT — AIRCRAFT DESTROYED
        </h1>
        <p style="color: #ffcc00; font-size: 24px; margin: 15px 0;">
          Ground Contact at ${Math.round(e.detail.speedKt)} KT (Exceeded Airframe Breaking Limits)
        </p>
        <button onclick="location.reload()" style="padding: 12px 28px; font-size: 18px; font-family: monospace; background: #222; color: #00ffaa; border: 2px solid #00ffaa; border-radius: 6px; cursor: pointer; margin-top: 15px;">
          PRESS [R] OR CLICK TO RESPAWN
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
});


// Instant Ground Impact & Crash System
setInterval(() => {
  if (window.skyforgeApp && window.skyforgeApp.physics) {
    const phys = window.skyforgeApp.physics;
    const speed = phys.velocity ? phys.velocity.length() * 1.94384 : 0;
    const alt = phys.position ? phys.position.y : 0;

    // If touching ground (alt <= 1.5) at over 120 KT -> CRASH
    if (alt <= 2.0 && speed > 120) {
      phys.velocity.set(0, 0, 0);
      phys.throttle = 0;
      
      let crashBox = document.getElementById('ground-crash-banner');
      if (!crashBox) {
        crashBox = document.createElement('div');
        crashBox.id = 'ground-crash-banner';
        crashBox.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(180,0,0,0.65);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;font-family:monospace;';
        crashBox.innerHTML = `
          <h1 style="color:#ff2222;font-size:48px;margin:0;text-shadow:0 0 20px #000;">CRITICAL GROUND IMPACT — AIRCRAFT DESTROYED</h1>
          <p style="color:#fff;font-size:22px;margin:10px 0;">Ground contact at high speed exceeds structural landing limit.</p>
          <button onclick="location.reload()" style="padding:10px 24px;font-size:18px;background:#111;color:#00ffaa;border:2px solid #00ffaa;border-radius:6px;cursor:pointer;">PRESS [R] TO RESPAWN</button>
        `;
        document.body.appendChild(crashBox);
      }
    }
  }
}, 50);


// ==========================================
// PS5 DUALSENSE CONTROLLER INPUT INTEGRATION
// ==========================================
let activeGamepadIndex = null;

window.addEventListener("gamepadconnected", (e) => {
  console.log(`[Gamepad Connected] ${e.gamepad.id} at index ${e.gamepad.index}`);
  activeGamepadIndex = e.gamepad.index;
  showControllerNotification("PS5 CONTROLLER CONNECTED");
});

window.addEventListener("gamepaddisconnected", (e) => {
  if (activeGamepadIndex === e.gamepad.index) {
    activeGamepadIndex = null;
    showControllerNotification("CONTROLLER DISCONNECTED");
  }
});

function showControllerNotification(text) {
  let note = document.getElementById('gamepad-notification');
  if (!note) {
    note = document.createElement('div');
    note.id = 'gamepad-notification';
    note.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);padding:8px 18px;background:rgba(0,30,50,0.85);border:2px solid #00aaff;border-radius:4px;font-family:monospace;font-size:13px;color:#00e5ff;z-index:99999;box-shadow:0 0 15px rgba(0,170,255,0.5);pointer-events:none;';
    document.body.appendChild(note);
  }
  note.innerText = text;
  note.style.display = 'block';
  setTimeout(() => { if (note) note.style.display = 'none'; }, 3000);
}

// Map DualSense inputs to flight mechanics every frame
function pollPS5Controller(app) {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = gamepads[activeGamepadIndex] || Array.from(gamepads).find(g => g && g.connected);
  if (!gp || !app || !app.physics) return;

  const phys = app.physics;

  // 1. Left Stick (Pitch & Roll)
  const deadzone = 0.08;
  const stickRoll = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
  const stickPitch = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

  if (phys.controls) {
    phys.controls.roll = stickRoll;
    phys.controls.pitch = stickPitch; // Pull back to climb, push forward to dive
  }

  // 2. Rudder (L1 / R1 Bumpers or L2 / R2 Triggers)
  const lBumper = gp.buttons[4]?.pressed ? 1 : 0;
  const rBumper = gp.buttons[5]?.pressed ? 1 : 0;
  if (phys.controls) {
    phys.controls.yaw = (rBumper - lBumper);
  }

  // 3. Throttle Control:
  // Cross (X) = Throttle UP, Square ([ ]) = Throttle DOWN
  if (gp.buttons[0]?.pressed) { // Cross (X)
    phys.throttle = Math.min(1.0, (phys.throttle || 0) + 0.015);
  }
  if (gp.buttons[2]?.pressed) { // Square
    phys.throttle = Math.max(0.0, (phys.throttle || 0) - 0.015);
  }

  // 4. View Switch: Triangle button (Button 3) = Toggle Cockpit/Chase
  if (gp.buttons[3]?.pressed && !window._btnTriangleLocked) {
    window._btnTriangleLocked = true;
    const viewBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('VIEW:'));
    if (viewBtn) viewBtn.click();
    setTimeout(() => { window._btnTriangleLocked = false; }, 350);
  }

  // 5. Paratrooper Drop: D-Pad Down (Button 13)
  if (gp.buttons[13]?.pressed && !window._dpadDownLocked) {
    window._dpadDownLocked = true;
    if (window.dropTroopers) window.dropTroopers();
    setTimeout(() => { window._dpadDownLocked = false; }, 500);
  }

  // 6. Ejection / Emergency: Touchpad / Share (Button 8 or 9)
  if (gp.buttons[8]?.pressed && window.triggerEject) {
    window.triggerEject();
  }
}


// =========================================================================
// 1. DUALSENSE PS5 POLLING LOOP (Reads both Gamepad 0 & 1)
// =========================================================================
function pollDualSenseFlight(app) {
  if (!navigator.getGamepads || !app || !app.physics) return;
  const gamepads = navigator.getGamepads();
  // Find any active DualSense or connected controller
  let gp = null;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && gamepads[i].connected) { gp = gamepads[i]; break; }
  }
  if (!gp) return;

  const phys = app.physics;
  const deadzone = 0.08;

  // Axes: Left Stick X (Roll), Left Stick Y (Pitch)
  const roll = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
  const pitch = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

  if (phys.controls) {
    phys.controls.roll = roll;
    phys.controls.pitch = pitch;
    // L1 (Button 4) / R1 (Button 5) Rudder
    const yawL = gp.buttons[4]?.pressed ? 1 : 0;
    const yawR = gp.buttons[5]?.pressed ? 1 : 0;
    phys.controls.yaw = yawR - yawL;
  }

  // Throttle: Cross (X, Button 0) = Throttle UP, Square (Button 2) = Throttle DOWN
  if (gp.buttons[0]?.pressed) {
    phys.throttle = Math.min(1.0, (phys.throttle || 0) + 0.015);
  }
  if (gp.buttons[2]?.pressed) {
    phys.throttle = Math.max(0.0, (phys.throttle || 0) - 0.015);
  }

  // Triangle (Button 3): Toggle Cockpit / Chase Camera View
  if (gp.buttons[3]?.pressed && !window._dsViewLocked) {
    window._dsViewLocked = true;
    const viewBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('VIEW:'));
    if (viewBtn) viewBtn.click();
    setTimeout(() => { window._dsViewLocked = false; }, 350);
  }

  // D-Pad Down (Button 13): Paratrooper Airdrop
  if (gp.buttons[13]?.pressed && !window._dsTroopLocked) {
    window._dsTroopLocked = true;
    if (window.dropTroopers) window.dropTroopers();
    setTimeout(() => { window._dsTroopLocked = false; }, 500);
  }
}

// 2. STRETCH TWO ROWS ACROSS THE BOTTOM
const dashboardStyle = document.createElement('style');
dashboardStyle.id = 'bottom-two-row-grid';
dashboardStyle.innerHTML = `
  /* ROW 1: TELEMETRY BAR (KT, FT, PWR, MACH, PITCH) */
  #flight-telemetry, div[style*="0 KT"], div[style*="KT"], [class*="telemetry"] {
    position: fixed !important;
    bottom: 42px !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    width: 100vw !important;
    height: 36px !important;
    margin: 0 !important;
    padding: 0 24px !important;
    box-sizing: border-box !important;
    background: rgba(6, 12, 18, 0.88) !important;
    backdrop-filter: blur(8px) !important;
    border-top: 1px solid rgba(0, 255, 170, 0.4) !important;
    border-bottom: 1px solid rgba(0, 255, 170, 0.15) !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    font-family: monospace !important;
    font-size: 13px !important;
    color: #00ffcc !important;
    z-index: 10001 !important;
  }

  /* ROW 2: CONTROLS & FLEET BUTTONS SPANNING FULL BOTTOM EDGE */
  body > div:has(button) {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    transform: none !important;
    width: 100vw !important;
    height: 42px !important;
    margin: 0 !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
    background: rgba(3, 7, 12, 0.95) !important;
    backdrop-filter: blur(10px) !important;
    border-top: 1px solid rgba(0, 255, 170, 0.25) !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    z-index: 10002 !important;
    overflow-x: auto !important;
  }

  .control-card, .glass-panel, .panel, div[class*="panel"], div[class*="card"] {
    position: static !important;
    display: inline-flex !important;
    flex-direction: row !important;
    align-items: center !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 4px !important;
    padding: 0 !important;
  }
`;
document.head.appendChild(dashboardStyle);


// =========================================================================
// REAL-TIME PS5 DUALSENSE HARDWARE ENGINE (Direct window animation hook)
// =========================================================================
(function startPS5InputPoller() {
  function readPS5Pads() {
    requestAnimationFrame(readPS5Pads);

    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let gp = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) { gp = pads[i]; break; }
    }
    if (!gp) return;

    const app = window.skyforgeApp;
    if (!app || !app.physics) return;
    const phys = app.physics;

    const deadzone = 0.08;
    // Left Analog Stick: Pitch (axes[1]) & Roll (axes[0])
    const rawRoll = gp.axes[0] || 0;
    const rawPitch = gp.axes[1] || 0;

    const stickRoll = Math.abs(rawRoll) > deadzone ? rawRoll : 0;
    const stickPitch = Math.abs(rawPitch) > deadzone ? rawPitch : 0;

    if (phys.controls) {
      if (stickRoll !== 0) phys.controls.roll = stickRoll;
      if (stickPitch !== 0) phys.controls.pitch = stickPitch; // Pull back to climb, push forward to dive

      // L1 (Button 4) / R1 (Button 5) Rudder Pedals
      const l1 = gp.buttons[4]?.pressed ? 1 : 0;
      const r1 = gp.buttons[5]?.pressed ? 1 : 0;
      if (l1 || r1) phys.controls.yaw = (r1 - l1);
    }

    // Cross [X] (Button 0): Throttle UP
    if (gp.buttons[0]?.pressed) {
      phys.throttle = Math.min(1.0, (phys.throttle || 0) + 0.015);
    }

    // Square (Button 2): Throttle DOWN / Brakes
    if (gp.buttons[2]?.pressed) {
      phys.throttle = Math.max(0.0, (phys.throttle || 0) - 0.015);
    }

    // Triangle (Button 3): Toggle Cockpit / Chase Camera View
    if (gp.buttons[3]?.pressed && !window._ps5TriLock) {
      window._ps5TriLock = true;
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('VIEW:'));
      if (btn) btn.click();
      setTimeout(() => { window._ps5TriLock = false; }, 350);
    }
  }

  requestAnimationFrame(readPS5Pads);
})();

// Re-format bottom UI into 2 uniform horizontal rows
const twoRowsCss = document.createElement('style');
twoRowsCss.innerHTML = `
  /* ROW 1: Telemetry bar stretched horizontally edge-to-edge */
  div:has(> div:contains("KT")), div[style*="0 KT"], div[style*="KT"], #flight-telemetry {
    position: fixed !important;
    bottom: 42px !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    width: 100vw !important;
    height: 38px !important;
    margin: 0 !important;
    padding: 0 24px !important;
    box-sizing: border-box !important;
    background: rgba(6, 12, 18, 0.92) !important;
    border-top: 1px solid rgba(0, 255, 170, 0.4) !important;
    border-bottom: 1px solid rgba(0, 255, 170, 0.15) !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-around !important;
    font-family: monospace !important;
    font-size: 13px !important;
    font-weight: bold !important;
    color: #00ffcc !important;
    z-index: 10001 !important;
  }

  div:has(> div:contains("KT")) > div, div[style*="0 KT"] > div, #flight-telemetry > div {
    display: inline-flex !important;
    margin: 0 8px !important;
  }

  /* ROW 2: All buttons stretching edge-to-edge at the very bottom */
  body > div:has(button) {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    transform: none !important;
    width: 100vw !important;
    height: 42px !important;
    margin: 0 !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
    background: rgba(3, 7, 12, 0.96) !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    z-index: 10002 !important;
    overflow-x: auto !important;
  }
`;
document.head.appendChild(twoRowsCss);
