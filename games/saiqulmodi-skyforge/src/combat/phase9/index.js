import { TargetDroneManager } from './targetDrones.js';
import { WeaponsSystem } from './ballisticsWeaponry.js';
import { CombatEffectsEngine } from './combatEffects.js';

// groundY(x, z): terrain height (world y); onDestroyed(target): called once per kill
export function initPhase9Combat(scene, { groundY = () => 0, onDestroyed = () => {} } = {}) {
  const targets = new TargetDroneManager(scene, groundY);
  const weapons = new WeaponsSystem(scene, groundY);
  const effects = new CombatEffectsEngine(scene);

  return {
    targets,
    weapons,
    effects,
    update: (deltaSec, aircraftPos, aircraftForward, radarLockRange = 15000) => {
      const activeTargets = targets.update(deltaSec);
      const activeOrdnance = weapons.update(deltaSec);
      effects.update(deltaSec);

      // Radar acquisition lock computation
      let lockedTarget = null;
      let closestAngle = Infinity;

      activeTargets.forEach(tgt => {
        const toTgt = tgt.position.clone().sub(aircraftPos);
        const dist = toTgt.length();

        if (dist <= radarLockRange) {
          const angle = aircraftForward.angleTo(toTgt.normalize());
          // 30° forward cone lock
          if (angle < (Math.PI / 6) && angle < closestAngle) {
            closestAngle = angle;
            lockedTarget = tgt;
          }
        }
      });

      // Hit-detection resolution (Bullets & Missiles vs Targets)
      activeTargets.forEach(tgt => {
        // Cannon hits
        activeOrdnance.bullets.forEach((b, bIdx) => {
          if (b.position.distanceTo(tgt.position) < tgt.hitRadius) {
            tgt.health -= 35;
            effects.triggerExplosion(b.position, 0.4);
            b.life = 0; // Destroy bullet
          }
        });

        // Missile hits
        activeOrdnance.missiles.forEach(m => {
          if (m.position.distanceTo(tgt.position) < tgt.hitRadius * 1.5) {
            tgt.health -= 250;
            effects.triggerExplosion(tgt.position, 2.5);
            m.life = 0; // Destroy missile
          }
        });

        if (tgt.health <= 0 && !tgt.isDestroyed) {
          tgt.isDestroyed = true;
          tgt.mesh.visible = false;
          effects.triggerExplosion(tgt.position, 3.2);
          onDestroyed(tgt);
        }
      });

      return {
        targets: activeTargets,
        lockedTarget: lockedTarget,
        ordnance: activeOrdnance
      };
    }
  };
}
