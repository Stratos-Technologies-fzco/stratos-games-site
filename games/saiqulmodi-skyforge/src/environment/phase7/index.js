import { AtmosphereEngine } from './atmosphericWind.js';
import { MonsoonWeather } from './weatherSystem.js';
import { RunwayFrictionModel } from './surfaceFriction.js';

// Phase 7: wind / gusts / turbulence, monsoon rain, wet-runway braking. One preset per weather button.
// runwayHeadingDeg is used by the crosswind preset (wind square to the active runway).
const PRESETS = {
  clear:     (h) => ({ from: 290, kts: 6, gust: 4, rain: 0, wet: false }),
  crosswind: (h) => ({ from: (h + 90) % 360, kts: 28, gust: 8, rain: 0, wet: false }),
  monsoon:   (h) => ({ from: 240, kts: 16, gust: 10, rain: 0.85, wet: true }),
  cat3:      (h) => ({ from: 60, kts: 2, gust: 1, rain: 0, wet: true })
};

export function initPhase7Weather(scene) {
  const atmosphere = new AtmosphereEngine();
  const weather = new MonsoonWeather(scene);
  const friction = new RunwayFrictionModel();
  let wet = false;
  let gustKts = 4;

  return {
    atmosphere,
    weather,
    friction,
    get wet() { return wet; },
    setPreset(name, runwayHeadingDeg = 90) {
      const p = (PRESETS[name] || PRESETS.clear)(runwayHeadingDeg);
      atmosphere.set(p.from, p.kts, p.gust);
      weather.setRain(p.rain);
      wet = p.wet;
      gustKts = p.gust;
      return p;
    },
    // Wind state for this frame; turbulence = random rate disturbance (rad/s) scaled by the gust strength
    update(timeSec, dt, aircraftPos, aglMeters) {
      const wind = atmosphere.update(timeSec, aglMeters);
      weather.update(aircraftPos, dt);
      wind.turbulence = gustKts * 0.006 * Math.min(1, aglMeters / 150);
      return wind;
    },
    // Wheel-brake friction factor vs dry runway (1 = dry)
    brakeFactor(groundSpeedKts) {
      return friction.getBrakingMu(groundSpeedKts, wet) / friction.baseDryMu;
    }
  };
}
