import { AITrafficManager } from './aiTrafficCircuit.js';
import { ILSSystem } from './ilsLocalizerGlide.js';

// Phase 8: AI circuit traffic at VOBL + ILS guidance for the active runway.
// (The old fixed SID list in sidWaypoints.js is replaced by the stage 4 route: TOC / en-route / arrival.)
export function initPhase8Navigation(scene, { makeAirliner, southRunwayX }) {
  const traffic = new AITrafficManager(scene, makeAirliner, southRunwayX);
  const ils = new ILSSystem();
  return {
    traffic,
    ils,
    update: (deltaSec, aircraftPos, runwayEnd) => ({
      traffic: traffic.update(deltaSec),
      ils: ils.computeGuidance(aircraftPos, runwayEnd)
    })
  };
}
