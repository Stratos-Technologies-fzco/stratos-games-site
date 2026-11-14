import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { Character, defaultAnim, type Survivor } from '../render/character';

/** The selected survivor, in 3D, slowly turning. Lives only while the lobby is on screen. */
export function Turntable({ survivor }: { survivor: Survivor }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xfff0d8, 0x6b5a8a, 1.7));
    const sun = new THREE.DirectionalLight(0xffd9a0, 2.2); sun.position.set(-2, 3, 3); scene.add(sun);
    const cam = new THREE.PerspectiveCamera(28, 0.7, 0.1, 50); cam.position.set(0, 1.15, 6.6); cam.lookAt(0, 0.95, 0);
    const ch = new Character(survivor); const anim = defaultAnim(); anim.armed = true; let alive = true;
    ch.load().then(() => { if (!alive) return; scene.add(ch.root); void ch.setWeapon('monsoon_ar'); });
    let last = performance.now(), raf = 0, cw = 0, chh = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight; if (w && h && (w !== cw || h !== chh)) { cw = w; chh = h; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      ch.root.rotation.y += dt * 0.6; ch.update(dt, anim); r.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(raf); r.dispose(); r.forceContextLoss(); };
  }, [survivor]);
  return <canvas ref={ref} aria-label="Your survivor" />;
}
