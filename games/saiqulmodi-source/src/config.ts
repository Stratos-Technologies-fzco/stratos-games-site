// Game values taken from ../main.py (the pygame game), scaled to 3D. 1 Three.js unit = 1 metre.
// main.py is a 2D top-down game in pixels and frames at 60 FPS (main.py:2642 clock.tick(60)).
// The web build steps its physics at the same 60 Hz, so frame counts are used as they are.
// Values marked "new" are not in main.py: they exist because the 3D port needs them.

export const STEP = 1 / 60; // one main.py frame (main.py:2642)
/** The player's edge over the computer, which always knows where the jet is: +15% in all aspects
 *  (the user's rule for this game, Jet_vs_Missile CLAUDE.md: human_buff 1.15 vs the AI).
 *  Only against the computer: when two people play (2-player launcher mode, main.py:2003-2025, Phase 5) both
 *  sides get equal chances, so this becomes 1.0 there (user, 31-Oct: 'when two players play, all equal'). */
export const PLAYER_EDGE_VS_AI = 1.15;
/** live value: 1.15 against the computer, 1.0 when two people play */
export let PLAYER_EDGE = PLAYER_EDGE_VS_AI;
export function setTwoPlayers(on: boolean): void {
  PLAYER_EDGE = on ? 1 : PLAYER_EDGE_VS_AI;
  if (typeof window !== 'undefined') (window as unknown as { __fighterTwo?: boolean }).__fighterTwo = on; // mission.js: two players
}
export const edgeChance = (p: number): number => Math.min(0.98, p * PLAYER_EDGE);
export const edgeReload = (frames: number): number => Math.round(frames / PLAYER_EDGE);
export const FT = 0.3048; // metres per foot

/** 1 main.py ground pixel = 4 m (so the 22 px SAM fuse is 88 m). */
export const PX_M = 4;
/** main.py level 1 is deliberately "10x slower than arcade speed" (main.py:29); x3 turns it into a real jet cruise. */
export const TIME_SCALE = 3;
/** main.py px/frame -> m/s */
export const pxFrameToMps = (v: number): number => v * PX_M * 60 * TIME_SCALE;

// ---- World (main.py's map, centred on the origin: x east, z south) ----
export const WORLD_W_PX = 14000; // main.py:26
export const WORLD_H_PX = 5000; // main.py:26
/** main.py map px -> world metres */
export const pxToX = (px: number): number => (px - WORLD_W_PX / 2) * PX_M;
export const pyToZ = (py: number): number => (py - WORLD_H_PX / 2) * PX_M;
/** main.py:483 coast line (the western sea), px */
export const coastX = (wy: number): number =>
  760 + 110 * Math.sin(wy / 520 + 0.6) + 45 * Math.sin(wy / 190 + 2.1) + 18 * Math.sin(wy / 67);
export const START_X_PX = 2000; // main.py:1603 lead jet start
export const START_Y_PX = 2400; // main.py:1603
export const CITY_COUNT = 12; // main.py:54 (cities are drawn in Phase 3; drones already patrol over them)

// ---- Altitudes ----
export const CRUISE_ALT_FT = 35000; // main.py:27, the start altitude too (main.py:882)
export const ALT_MIN_FT = 3000; // main.py:165, lowest altitude in main.py; here it is the "PULL UP" warning height above ground
// main.py:166 ALT_RATE (70 ft/frame) is replaced by the energy model: climb rate now comes from thrust minus drag.
export const LOW_ALT_SPOT_FT = 15000; // main.py:169, below this you spot camouflaged launchers close by
export const LOW_ALT_SPOT_RANGE_M = 350 * PX_M; // main.py:170

// ---- Jet ----
export const BASE_SPEED_PX = 0.35; // main.py:29, px/frame at level 1
export const JET_CRUISE_MPS = pxFrameToMps(BASE_SPEED_PX); // = 252 m/s, the start speed
export const SPEED_PER_LEVEL_PX = 0.01; // main.py:30, level 100 = 1.35 px/frame
export const MAX_LEVEL = 100; // main.py:31
/** main.py:190 level_speed(level) / level_speed(1): every speed in the game scales with the level */
export let LEVEL = 1;
export let LEVEL_MULT = 1;
export function setLevel(n: number): void {
  LEVEL = Math.min(MAX_LEVEL, Math.max(1, Math.round(n)));
  LEVEL_MULT = (BASE_SPEED_PX + (LEVEL - 1) * SPEED_PER_LEVEL_PX) / BASE_SPEED_PX;
}
export const JET_HP = 300; // main.py:70
export const CRASH_SPIN = 0.09; // main.py:72, rad/frame roll of a falling wreck
export const JET_REJOIN_FRAMES = 180; // main.py:80, a downed jet's replacement after 3 s -> restart allowed after 3 s

// ---- SAM batteries ----
export const SAM_SITE_COUNT = 50; // main.py:55
export const SAM_MISSILES_PER_SITE = 20; // main.py:56
export const SAM_SPACING_PX = 420; // main.py:57 minimum gap between two batteries
export const SAM_SITE_HP = 2; // main.py:58 (jet weapons come in Phase 5)
export const SAM_RANGE_M = 650 * PX_M; // main.py:59, 650 px ground ring = 2,600 m
export const SAM_SITE_RELOAD = 900; // main.py:60, frames (15 s)
export const AUTO_SAM_CAP = 4; // main.py:61, at most 4 self-launched SAMs airborne
export const SAM_LAUNCH_CHANCE = 1 / 240; // main.py:2239, per frame while the jet is inside the ring

// ---- TELs: mobile launchers ----
export const TEL_COUNT = 150; // main.py:63
export const TEL_MISSILES = 4; // main.py:64
export const TEL_RANGE_M = 520 * PX_M; // main.py:65, 2,080 m
export const TEL_SPACING_PX = 180; // main.py:66
export const TEL_CAMOUFLAGED_SHARE = 0.7; // main.py:67
export const TEL_REVEAL_FRAMES = 1200; // main.py:68, a launch gives a hidden TEL away for 20 s (main.py:1852)
export const TEL_HP = 1; // main.py:472

// ---- Drones ----
export const DRONE_COUNT = 12; // main.py:89
export const DRONE_SPEED_VS_JET = 0.5; // main.py:90
export const DRONE_SPOT_RANGE_M = 380 * PX_M; // main.py:91, 1,520 m
export const DRONE_SPOT_RELOAD = 900; // main.py:92
export const DRONE_CUE_RANGE_M = 2500 * PX_M; // main.py:2217, cues the nearest armed launcher within 2,500 px
export const DRONE_ALT_MIN_FT = 9000; // main.py:1013
export const DRONE_ALT_MAX_FT = 16000; // main.py:1013
export const DRONE_TURN_DIV = 30; // main.py:1034, turn = speed / 30 rad per frame (speed in px/frame)

// ---- SAM missile ----
export const SAM_DAMAGE = JET_HP; // main.py:71, one hit = shot down
export const SAM_FUSE_M = 22 * PX_M; // main.py:73, 22 px = 88 m proximity fuse (a sphere in 3D)
export const SAM_SPEED_VS_JET = 2.2; // main.py:74
export const SAM_SPEED_MPS = SAM_SPEED_VS_JET * JET_CRUISE_MPS; // = 554 m/s
export const SAM_CLIMB_FRAMES = 420; // main.py:75, boost phase length for a 35,000 ft target
export const SAM_CLIMB_MIN_FRAMES = 90; // main.py:1069
export const SAM_BOOST_START = 0.35; // main.py:1106, speed starts at 35% and ramps to 100% over the climb
export const SAM_LIFE_FRAMES = 2400; // main.py:76, 40 s, then it self-destructs
export const SAM_TURN_PER_FRAME = 0.022; // main.py:1120, rad/frame (kept per frame, not time-scaled: 1.32 rad/s)
export const SAM_GUIDED_SHARE = 0.5; // main.py:77, each launch is guided or unguided at random
export const UNGUIDED_MOTOR_FRAMES = 300; // main.py:78, unguided: motor runs 5 s after the climb
export const GUIDED_SUSTAIN_FRAMES = 600; // new: guided motor burns 10 s after the climb, then coasts (main.py:76 burns all 40 s)
export const ROCKET_WARN_RANGE_M = 400 * PX_M; // main.py:79, warn about an unguided round this close on a crossing course
export const ROCKET_WARN_COS = 0.8; // main.py:2518
export const PN_GAIN = 3.5; // new: proportional navigation constant N (3-4)
export const SEEKER_GIMBAL_RAD = (60 * Math.PI) / 180; // new: a target this far off the nose is lost

// ---- The jet's weapons (main.py:81-87, 1139-1192, 1300-1334, 1859-1888) ----
export const BOMB_BLAST_M = 45 * PX_M; // main.py:81, 180 m
export const JET_MISSILE_RELOAD = (): number => edgeReload(45); // main.py:83, frames between two missiles
export const AGM_RANGE_M = (): number => 1600 * PX_M * PLAYER_EDGE; // main.py:84, nearest visible launcher within 6.4 km
export const AAM_RANGE_M = (): number => 1200 * PX_M * PLAYER_EDGE; // main.py:85, nearest drone within 4.8 km
export const AGM_SPEED_VS_JET = 3; // main.py:1873
export const AAM_SPEED_VS_JET = 4; // main.py:1873
export const AGM_TURN_PER_FRAME = 0.03; // main.py:1172
export const AAM_TURN_PER_FRAME = 0.05; // main.py:1172
export const JET_MISSILE_HIT_M = 10 * PX_M; // main.py:2260, 40 m
export const AGM_BLAST_M = 20 * PX_M; // main.py:2265, ground_hit radius 20 px
export const JET_MISSILE_LIFE = 2400; // main.py:1180
export const GROUND_HIT_PAD_SAM_M = 14 * PX_M; // main.py:1881, a battery is this much bigger than a point
export const GROUND_HIT_PAD_TEL_M = 8 * PX_M; // main.py:1881
export const DRONE_RESPAWN_FRAMES = 1200; // main.py:93, a replacement crosses the border after 20 s
export const FIRE_LIFE_HIT = 1800; // main.py:1879
export const FIRE_LIFE_DESTROYED = 3600; // main.py:1885

// ---- Countermeasures ----
export const FLARE_RANGE_M = 260 * PX_M; // main.py:948, 1,040 m
export const FLARE_DECOY_CHANCE = (): number => edgeChance(0.85); // main.py:949
export const FLARE_RELOAD = (): number => edgeReload(300); // main.py:950, frames (5 s)
export const FLARES_PER_SALVO = 6; // main.py:1981
export const FLARE_BURN_FRAMES = 120; // new: a flare cools over about 2 s
export const CHAFF_RELOAD = (): number => edgeReload(300); // new: chaff, the radar decoy, reloads like flares (main.py:950)
export const CHAFF_RANGE_M = 1400; // new: radar missiles this close can be seduced
export const CHAFF_DECOY_CHANCE = (): number => edgeChance(0.85); // new: same as flares (main.py:949)
export const CHAFF_BLOOM_FRAMES = 180; // new: a chaff cloud reflects for about 3 s
export const CHAFF_PER_SALVO = 4; // new
export const ECM_RANGE_M = 450 * PX_M; // main.py:951, 1,800 m
export const ECM_BREAK_CHANCE = (): number => edgeChance(0.6); // main.py:952
export const ECM_RELOAD = (): number => edgeReload(720); // main.py:953, frames (12 s)
export const ECM_FALSE_TRACK_M = 400 * PX_M; // main.py:1968, the jammed seeker flies 400 px ahead ...
export const ECM_FALSE_SPREAD_M = 150 * PX_M; // main.py:1968, ... +-150 px
export const DECOY_TURN_PER_FRAME = 0.05; // main.py:1117, a decoyed missile turns toward the decoy
export const DECOY_BLOW_M = 20 * PX_M; // main.py:2290, blows up within 20 px of the decoy ...
export const DECOY_BLOW_FRAMES = 150; // main.py:2290, ... or after 150 frames
export const FLARE_MIN_CLIMB = 0.5; // main.py:1988, flares only pull missiles past half their climb
export const NOTCH_BEAM_COS = 0.25; // new: notching = the jet's own speed toward/away from the missile under 25% (within ~15 deg of 90)
export const NOTCH_BREAK_PER_S = (): number => edgeChance(0.45); // new: chance per second a radar seeker loses a notching jet
export const NOTCH_MIN_RANGE_M = 500; // new: too close to notch (the seeker sees the skin directly)
export const NOTCH_DIVE_MPS = 15; // new: the notch needs ground clutter behind the jet: descending at least this fast
