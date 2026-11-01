// Backdrop3D.js - the living 3D world behind the path screen (user, 01-Nov-2026: "make all the games in 3D").
// Uses the game's own worlds and creatures (Organisms.js biomes + organism meshes): the camera drifts slowly
// round one world while its creatures live in it, then moves on to the next world (soil water -> roots ->
// meadow -> forest edge) every WORLD_SECONDS. Nature first: the creatures are the show, the menu sits on top.
// Runs only while the path screen is open (start / stop), pauses when the tab is hidden, light on phones.
import * as THREE from 'three';
import { TIERS, organismsOfTier } from '../Database.js';
import { buildBiome, biomeColors, buildOrganismMesh, animateOrganism } from '../Organisms.js';

const ARENA = 50;
const WORLD_SECONDS = 22;
const FADE = 1.6; // s, fade between worlds

export class Backdrop3D {
  constructor() {
    this.coarse = window.matchMedia('(pointer: coarse)').matches;
    this.calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.canvas = null;
    this.running = false;
    this.tier = 0;
  }

  init() {
    if (this.renderer) return true;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: !this.coarse, powerPreference: 'low-power' });
    } catch (e) {
      return false; // no WebGL: the path screen keeps its painted background
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.coarse ? 1.25 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.canvas = this.renderer.domElement;
    this.canvas.id = 'backdrop3d';
    this.canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 1.15);
    this.sun = new THREE.DirectionalLight(0xfff2dc, 1.5);
    this.sun.position.set(30, 50, 20);
    this.scene.add(this.hemi, this.sun);
    this.clock = new THREE.Clock();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && this.running) this.clock.getDelta(); });
    this.resize();
    this.buildWorld(0);
    return true;
  }

  resize() {
    if (!this.renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // One world: its ground, plants and particles, plus up to 10 of its creatures in a loose ring
  buildWorld(tier) {
    if (this.world) {
      this.scene.remove(this.world);
      this.world.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
    }
    this.tier = tier;
    const b = biomeColors(tier);
    this.world = new THREE.Group();
    this.biome = buildBiome(tier, ARENA);
    this.world.add(this.biome);
    this.scene.background = new THREE.Color(b.bg);
    this.scene.fog = new THREE.Fog(b.fog, 30, 95);
    this.hemi.color.set(b.hemi[0]);
    this.hemi.groundColor.set(b.hemi[1]);

    this.critters = [];
    const list = organismsOfTier(tier).slice(0, this.coarse ? 6 : 10);
    list.forEach((org, i) => {
      const mesh = buildOrganismMesh(org);
      const a = (i / list.length) * Math.PI * 2 + Math.random() * 0.4;
      const d = 7 + Math.random() * 13;
      mesh.position.set(Math.cos(a) * d, 0.2 + Math.random() * 1.2, Math.sin(a) * d);
      this.world.add(mesh);
      this.critters.push({ mesh, phase: Math.random() * 6.28, a, d, speed: (0.05 + Math.random() * 0.08) * (Math.random() < 0.5 ? -1 : 1), y: mesh.position.y });
    });
    this.scene.add(this.world);
    this.worldTime = 0;
  }

  start() {
    if (!this.init()) return;
    this.canvas.hidden = false;
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    const loop = () => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      if (document.hidden) return;
      this.frame(Math.min(0.05, this.clock.getDelta()));
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.hidden = true;
  }

  frame(dt) {
    const k = this.calm ? 0.35 : 1;
    this.worldTime += dt;
    const t = this.clock.elapsedTime;

    // next world: fade the canvas out, rebuild, fade back in
    if (this.worldTime > WORLD_SECONDS) this.buildWorld((this.tier + 1) % TIERS.length);
    const w = this.worldTime;
    const fade = Math.min(1, w / FADE, (WORLD_SECONDS - w) / FADE);
    this.canvas.style.opacity = String(Math.max(0, fade));

    // creatures wander their ring, bob and do their own animation
    for (const c of this.critters) {
      c.a += c.speed * dt * k;
      c.mesh.position.x = Math.cos(c.a) * c.d;
      c.mesh.position.z = Math.sin(c.a) * c.d;
      c.mesh.position.y = c.y + Math.sin(t * 0.9 + c.phase) * 0.25;
      c.mesh.rotation.y = -c.a + (c.speed > 0 ? Math.PI : 0);
      animateOrganism(c.mesh, t, dt * k, c.phase);
    }
    if (this.biome.userData.points) this.biome.userData.points.rotation.y += dt * 0.01;

    // slow orbiting camera, low over the ground so the world has depth
    const ca = t * 0.045 * k;
    this.camera.position.set(Math.cos(ca) * 30, 7.5 + Math.sin(t * 0.07) * 1.5, Math.sin(ca) * 30);
    this.camera.lookAt(0, 1.2, 0);
    this.renderer.render(this.scene, this.camera);
  }
}
