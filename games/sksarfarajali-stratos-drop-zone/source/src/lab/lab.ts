// /anim-lab: a test scene for the character animation. A survivor walks a circle or a figure-eight on flat ground, up a 20 degree slope, or up stairs,
// with a free camera, so foot sliding, foot placement and aiming can be checked from every side. F9 shows the debug panel.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import weaponSockets from '../../shared/weapon_sockets.json';
import { AnimDebug } from '../anim/debugPanel';
import { Humanoid } from '../render/humanoid';
import { defaultAnim, SURVIVORS, type Survivor } from '../render/character';

// ---------------------------------------------------------------- world: flat floor, a 20 degree ramp (x < -8) and stairs (z > 8)
const RAMP_X = -8, RAMP_TAN = Math.tan((20 * Math.PI) / 180), RAMP_TOP = 6.2, STAIR_Z = 8, STEP_D = 0.32, STEP_H = 0.17, STEPS = 9;
export function heightAt(x: number, z: number): number {
  if (x < RAMP_X) return Math.min(RAMP_TOP * RAMP_TAN, (RAMP_X - x) * RAMP_TAN);
  if (Math.abs(x) < 1.6 && z > STAIR_Z) { const k = Math.floor((z - STAIR_Z) / STEP_D) + 1; return Math.min(STEPS, k) * STEP_H; }
  return 0;
}
Humanoid.ground = { height: heightAt };

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9fb8d8); scene.fog = new THREE.Fog(0x9fb8d8, 40, 90);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); document.body.prepend(renderer.domElement);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0x556655, 1.6)); const sun = new THREE.DirectionalLight(0xfff2d8, 2.2); sun.position.set(6, 12, 4); scene.add(sun);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshLambertMaterial({ color: 0x5f8f5a })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
const grid = new THREE.GridHelper(40, 40, 0x3b5a3a, 0x486a46); grid.position.y = 0.01; scene.add(grid);
const mat = new THREE.MeshLambertMaterial({ color: 0xa89f8a });
{ // ramp
  const len = RAMP_TOP, h = RAMP_TOP * RAMP_TAN; const geo = new THREE.BoxGeometry(len / Math.cos(Math.atan(RAMP_TAN)), 0.2, 14); const ramp = new THREE.Mesh(geo, mat); ramp.rotation.z = Math.atan(RAMP_TAN); ramp.position.set(RAMP_X - len / 2, h / 2 - 0.1, 0); scene.add(ramp);
  const top = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 14), mat); top.position.set(RAMP_X - len - 7, h - 0.1, 0); scene.add(top);
  for (let i = 0; i < STEPS; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(3.2, STEP_H * (i + 1), STEP_D), mat); s.position.set(0, (STEP_H * (i + 1)) / 2, STAIR_Z + STEP_D * i + STEP_D / 2); scene.add(s); }
  const plat = new THREE.Mesh(new THREE.BoxGeometry(3.2, STEP_H * STEPS, 4), mat); plat.position.set(0, (STEP_H * STEPS) / 2, STAIR_Z + STEP_D * STEPS + 2); scene.add(plat);
}

// ---------------------------------------------------------------- the character
const params = { survivor: 'survivor_kiran' as Survivor, weapon: 'monsoon_ar', path: 'circle', speed: 4.5, facing: 'move', pitch: 0, crouch: false, sprint: false, fire: false, paused: false, camera: 'free', action: 'none' };
let human: Humanoid | null = null; let loading = false;
async function spawn() {
  if (loading) return; loading = true; if (human) scene.remove(human.root); const h = new Humanoid(params.survivor); await h.load(); scene.add(h.root); human = h; await h.setWeapon(params.weapon === 'unarmed' ? null : params.weapon); h.setLod(0); loading = false;
}
type P2 = [number, number];
const PATHS: Record<string, (t: number) => P2> = {
  circle: (t) => [Math.sin(t) * 4, Math.cos(t) * 4 - 4],
  eight: (t) => [Math.sin(t) * 4.5, Math.sin(t) * Math.cos(t) * 5],
  slope: (t) => { const k = 1 - Math.abs(((t / 4) % 2) - 1); return [-3 - k * 12, 0]; },
  stairs: (t) => { const k = 1 - Math.abs(((t / 4) % 2) - 1); return [0, 4 + k * 8.5]; },
  line: (t) => { const k = 1 - Math.abs(((t / 4) % 2) - 1); return [0, -5 + k * 8]; },
  stand: () => [0, 0],
};
let pathT = 0; const pos = new THREE.Vector3(); let vel = new THREE.Vector3(); let aimYaw = 0; let fireClock = 0; const prevFeet = [new THREE.Vector3(), new THREE.Vector3()], prevRoot = [new THREE.Vector3(), new THREE.Vector3()]; let havePrev = false;
const skate: number[] = []; const skateWin = 120;

const ui = document.getElementById('ui')!; const stats = document.getElementById('stats')!;
function select(label: string, key: keyof typeof params, opts: string[]) { const s = document.createElement('select'); s.title = label; opts.forEach((o) => { const e = document.createElement('option'); e.value = o; e.textContent = `${label}: ${o}`; s.appendChild(e); }); s.value = String(params[key]); s.onchange = () => { (params as Record<string, unknown>)[key] = key === 'speed' ? Number(s.value) : s.value; if (key === 'survivor') void spawn(); if (key === 'weapon') void human?.setWeapon(params.weapon === 'unarmed' ? null : params.weapon); if (key === 'path') { pathT = 0; havePrev = false; } }; ui.appendChild(s); return s; }
function toggle(label: string, key: keyof typeof params) { const b = document.createElement('button'); b.textContent = label; b.onclick = () => { (params as Record<string, unknown>)[key] = !params[key]; b.classList.toggle('on', !!params[key]); }; ui.appendChild(b); return b; }
select('survivor', 'survivor', SURVIVORS.map((s) => s.id)); select('weapon', 'weapon', ['unarmed', ...Object.keys(weaponSockets).filter((k) => !k.startsWith('_'))]); select('path', 'path', Object.keys(PATHS));
select('action', 'action', ['none', 'jump', 'land', 'skydive', 'glide', 'reload', 'heal', 'throw', 'hit front', 'hit back', 'hit left', 'hit right', 'death 1', 'death 2', 'emote', 'melee swing']);
select('speed', 'speed', ['0', '1', '2.5', '4.5', '6.5']); select('facing', 'facing', ['move', 'aim north', 'aim sweep']); select('camera', 'camera', ['free', 'front', 'side', 'back', 'top']);
const pitch = document.createElement('input'); pitch.type = 'range'; pitch.min = '-70'; pitch.max = '70'; pitch.value = '0'; pitch.title = 'aim pitch'; pitch.oninput = () => (params.pitch = Number(pitch.value)); ui.appendChild(pitch);
toggle('crouch', 'crouch'); toggle('sprint', 'sprint'); toggle('fire', 'fire'); toggle('pause', 'paused');

const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; camera.position.set(5, 2.4, 6);
const debug = new AnimDebug(scene, () => `skate   planted-foot speed mean ${(skate.reduce((a, b) => a + b, 0) / Math.max(1, skate.length)).toFixed(3)} max ${Math.max(0, ...skate).toFixed(3)} m/s`);
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); } addEventListener('resize', resize); resize();

function place(c: string, target: THREE.Vector3, yaw: number) {
  const d = 4.2, h = 1.4; const f = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), r = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw));
  const at = (v: THREE.Vector3) => camera.position.copy(target).add(v).add(new THREE.Vector3(0, h, 0));
  if (c === 'front') at(f.clone().multiplyScalar(d)); else if (c === 'back') at(f.clone().multiplyScalar(-d)); else if (c === 'side') at(r.clone().multiplyScalar(-d)); else if (c === 'top') camera.position.copy(target).add(new THREE.Vector3(0.01, 7, 0.01));
}
let camPreset = 'free';

let last = performance.now();
function frame(now: number) {
  requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (human?.ready && !params.paused) {
    const speed = params.speed; const f = PATHS[params.path]; const eps = 0.02; const p0 = f(pathT), p1 = f(pathT + eps); const ds = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / eps || 1;
    if (speed > 0 && params.path !== 'stand') pathT += (speed * dt) / ds; const p = f(pathT), pn = f(pathT + eps); const dir = new THREE.Vector3(pn[0] - p[0], 0, pn[1] - p[1]).normalize();
    pos.set(p[0], heightAt(p[0], p[1]), p[1]); vel = params.path === 'stand' || speed === 0 ? new THREE.Vector3() : dir.multiplyScalar(speed);
    human.root.position.copy(pos);
    if (params.facing === 'move') aimYaw = vel.lengthSq() > 0.01 ? Math.atan2(vel.x, vel.z) : aimYaw; else if (params.facing === 'aim north') aimYaw = 0; else aimYaw = Math.sin(performance.now() / 1800) * 2.2;
    const s = defaultAnim(); const armed = params.weapon !== 'unarmed'; s.armed = armed; s.melee = params.weapon === 'tide_machete'; if (s.melee) s.armed = false;
    s.speed = vel.length(); s.vx = vel.x; s.vz = vel.z; s.yaw = aimYaw; s.pitch = (params.pitch * Math.PI) / 180; s.crouch = params.crouch; s.sprint = params.sprint || speed >= 6; s.aiming = armed && params.facing !== 'move';
    fireClock += dt; if (params.fire && armed && fireClock > 0.12) { fireClock = 0; s.kick = 1; } s.firing = params.fire && armed; s.kick = params.fire ? Math.max(0, 1 - fireClock / 0.1) : 0;
    // one-off actions for checking the other clips
    const act = params.action; const T = performance.now() / 1000;
    if (act === 'jump') { s.onGround = false; s.vy = Math.sin(T * 3) * 4; } else if (act === 'land') { s.onGround = Math.floor(T) % 2 === 0; s.fallLanded = 3; } else if (act === 'skydive' || act === 'glide') s.mode = act;
    else if (act === 'reload') { s.reload = true; s.reloadP = (T % 2) / 2; } else if (act === 'heal') s.heal = true; else if (act === 'throw') s.throwT = 1 - (T % 1.2) / 1.2;
    else if (act.startsWith('hit')) { const k = Math.floor(T / 1.4) % 2; s.hit = k === 0 ? Math.max(0, 1 - (T % 1.4) * 2.5) : 0; s.hitFrom = { 'hit front': 0, 'hit back': Math.PI, 'hit left': Math.PI / 2, 'hit right': -Math.PI / 2 }[act] ?? 0; s.hitFrom += human.animator!.facing.bodyYaw; }
    else if (act === 'death 1') s.dead = 1; else if (act === 'death 2') s.dead = 2; else if (act === 'emote') s.emote = true; else if (act === 'melee swing') { s.melee = true; s.armed = false; s.kick = Math.max(0, 1 - ((T % 1) * 1.5)); }
    human.setDistance(0); human.update(dt, s, false);
    // foot skate meter: speed of a foot that the animator says is planted
    const A = human.animator!; const w = [A.dbg.feet.l, A.dbg.feet.r].map((v) => new THREE.Vector3(v[0], v[1], v[2]).applyMatrix4((human!.root.updateMatrixWorld(), human!.root.matrixWorld)));
    // a foot counts as planted (stance) when it is low and moving backwards relative to the body; its speed over the ground should then be about zero
    const rootFeet = [A.dbg.feet.l, A.dbg.feet.r].map((v) => new THREE.Vector3(v[0], v[1], v[2]));
    if (havePrev && dt > 0 && vel.length() > 0.5) { const tr = vel.clone().normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), -human.root.rotation.y); [0, 1].forEach((i) => { const low = rootFeet[i].y - 0.086 < 0.04; const rel = rootFeet[i].clone().sub(prevRoot[i]).divideScalar(dt).dot(tr); if (low && rel < -0.6 * vel.length()) { const v = Math.hypot(w[i].x - prevFeet[i].x, w[i].z - prevFeet[i].z) / dt; skate.push(v); if (skate.length > skateWin) skate.shift(); } }); }
    w.forEach((v, i) => prevFeet[i].copy(v)); rootFeet.forEach((v, i) => prevRoot[i].copy(v)); havePrev = true;
    const tgt = pos.clone().add(new THREE.Vector3(0, 1, 0)); controls.target.lerp(tgt, 0.2);
    if (params.camera !== camPreset) { camPreset = params.camera; if (camPreset !== 'free') place(camPreset, tgt, human.root.rotation.y); }
    debug.update(human);
    stats.textContent = `${A.dbg.state}   speed ${s.speed.toFixed(1)} m/s   rate ${A.dbg.rate.toFixed(2)}   plant L ${A.dbg.feet.lPlant.toFixed(2)} R ${A.dbg.feet.rPlant.toFixed(2)}`;
  }
  controls.update(); renderer.render(scene, camera);
}
requestAnimationFrame(frame); void spawn();
/** Handle for automated checks and recordings. */
(window as unknown as { lab: unknown }).lab = { params, get human() { return human; }, spawn, skate, debug, heightAt, controls, camera, scene, renderer, reset() { pathT = 0; havePrev = false; skate.length = 0; } };
