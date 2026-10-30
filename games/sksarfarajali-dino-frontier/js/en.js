/* English strings. All player-facing text lives here (LOC-01). */
window.DF = window.DF || {};
DF.S = {
  game: 'Dino Frontier',
  tagline: 'SURVIVAL & EVOLUTION',
  version: 'v1.1',
  versionFull: 'Version 1.1.0',
  tips: [
    'Enemies flash before they strike — dodge on the flash.',
    'Berries restore a little health. Gather them between fights.',
    'Dash costs energy. Your basic attack never does.',
    'Eggs are hidden near water and old shrines.',
    'Wildspark energy can wake the Genesis Crystal.'
  ],
  loading: { title: 'Loading Verdant Valley…', tip: 'Tip:', errTitle: 'Some game files didn’t load.', errBody: ' Check your connection and try again. Your saved progress is safe.', retry: 'Retry', back: 'Back to Stratos' },
  privacy: {
    title: 'Before you play',
    p1: 'Dino Frontier saves your progress on this device only. We don’t ask for your name, email or any account.',
    age: 'This game is made for teens and adults aged 13 and over.',
    p2a: 'Help us improve?', p2b: ' With your OK we send anonymous gameplay events (e.g. “tutorial finished”) linked only to a random install ID. The game works fully either way, and you can change this in Settings.',
    no: 'No thanks', yes: 'Allow analytics', more: 'Read the full privacy notice',
    full: 'Privacy notice. Dino Frontier stores your progress, settings and an anonymous random install ID in your browser on this device. It does not collect your name, email, location or advertising ID. If you allow analytics, anonymous gameplay events (for example "tutorial finished") may be measured and are linked only to the install ID. If you decline, nothing is sent. You can change your choice any time in Settings. The game is for ages 13 and over.'
  },
  title: { story: 'Story', demo: 'Demo', storyAria: 'Read the story', demoAria: 'Watch a demo', cont: 'Continue', newGame: 'New Game', settings: 'Settings', credits: 'Credits', replaceNote: 'New Game will ask before replacing your saved progress.', stratos: '← Stratos Games', confirmTitle: 'Start a new game?', confirmBody: 'This replaces your saved progress (Level {lv}, {tokens} Tokens). A backup of the old save is kept for recovery.', confirmYes: 'Yes, start new', confirmNo: 'Keep my save' },
  story: { eyebrow: 'CHAPTER ONE', title: 'Separated from the pack', body: 'Sixty-five million years ago the Genesis Pulse reshaped the world. Now you are a young dinosaur, alone on a living island called the Frontier — and the Pulse is returning.', go: 'Begin', skip: 'Skip' },
  lore: {
    eyebrow: 'THE STORY', title: 'The Genesis Pulse',
    p1: 'Sixty-five million years ago, an unknown natural phenomenon called the Genesis Pulse changed the prehistoric world. Instead of a mass extinction, it created isolated ecosystems where dinosaurs developed extraordinary adaptations.',
    p2: 'Millions of years later, you wake on a living island called the Frontier: a young dinosaur separated from its pack. And the Pulse is returning.',
    goals: [['Survive', 'Outlast the next encounter. Read the flash, dodge, then strike.'], ['Evolve', 'Choose Swiftclaw, Ironhide or Wildspark and grow your sanctuary.'], ['Uncover', 'Find out what is calling the Genesis Pulse back.']],
    back: 'Back', demo: 'Watch demo'
  },
  demo: {
    badge: 'DEMO', skip: 'Skip demo',
    caps: ['Explore Verdant Valley. Berries restore a little health.', 'Enemies flash before they strike. Dodge, then hit back.', 'Dash and abilities spend energy, which recharges.', 'Follow the marker to the egg site to discover an egg.', 'Then evolve, upgrade and face Thornback.'],
    end: 'Ready? Tap New Game to start your own expedition.'
  },
  tutorial: {
    step: 'STEP {n} OF 4',
    steps: [
      ['Find your pack’s trail', 'Use the arrow buttons on the left (or WASD / arrow keys) to walk to the glowing ferns.'],
      ['Gather food', 'Walk over the berry bushes to collect Food. Food restores health between fights.'],
      ['A raider approaches!', 'Tap ATTACK (Space / click) to strike. When it flashes, move away to dodge.'],
      ['You survived!', 'Head for the marked egg site to finish your first expedition.']
    ],
    skip: 'Skip tutorial'
  },
  hud: {
    moveGroup: 'Movement buttons', dir: { up: 'UP', down: 'DOWN', left: 'BACK', right: 'FWD' }, dirAria: { up: 'Move up', down: 'Move down', left: 'Move backward', right: 'Move forward' },
    objective: 'OBJECTIVE', food: 'Food', dna: 'DNA', pause: 'Pause', attack: 'ATTACK', dash: 'DASH', ability: 'ABILITY',
    noEnergy: 'No energy', depleted: 'Out of energy — recharging. Basic attack still works.',
    keys: 'WASD move · Space attack · Shift dash · E ability · Esc pause',
    emberHint: 'Lava burns! Go around glowing pools. Vents erupt after a warning glow: step aside or dash through.',
    needBerries: 'Gather {n} more berries first', needBerriesHint: 'Need {n} more {s} to claim the egg', eggFound: 'Egg discovered!', levelUp: 'Level up! Lv {lv}',
    crystalHint: 'Wildspark energy could wake this crystal.', crystalWake: 'The Genesis Crystal hums — a hidden egg appears!',
    cooldown: 'Recharging…', bossPhase: '{name} roars — it’s enraged!', bossStun: '{name} is stunned — strike now!', berry: '+1 Food', dna_: '+1 DNA', token: '+5 Tokens'
  },
  obj: {
    egg: { name: 'Egg Hunt', meta: 'Lv 1+ · ~6 min', hud: 'Reach the egg site · {b}/{n} berries' },
    forage: { name: 'Forage the Falls', meta: 'Lv 2+ · ~5 min', hud: 'Reach the falls nest · {b}/{n} berries' },
    demo: { name: 'Demo', meta: '', hud: 'Reach the egg site · {b}/{n} berries' },
    ember: { name: 'Ember Trail', meta: 'Lv 11+ · lava & heat', hud: 'Reach the Ember nest · {b}/{n} cinder berries' },
    cinder: { name: 'Cinderjaw’s Furnace', meta: 'Lv 15+ · boss', locked: 'Locked · Lv {lv}', hud: 'Defeat Cinderjaw' },
    boss: { name: 'Thornback’s Den', meta: 'Lv 5+ · boss', locked: 'Locked · Lv {lv}', hud: 'Defeat Thornback' },
    choose: 'CHOOSE AN OBJECTIVE', start: 'Start expedition', locked: 'Locked · Lv {lv}'
  },
  pause: { title: 'Paused', resume: 'Resume', settings: 'Settings', restart: 'Restart expedition', exit: 'Exit to Title', confirm: 'Restart this expedition? Items picked up since you set out will be lost. Your Sanctuary progress is kept.', yes: 'Yes, restart', keep: 'Keep playing', panel: 'THIS EXPEDITION', objective: 'Objective', food: 'Food', dna: 'DNA Fragments', tokens: 'Frontier Tokens', note: 'Game time is stopped. You can’t take damage while paused.' },
  summary: {
    where: 'Verdant Valley · Expedition {n}',
    okBadge: '✓ OBJECTIVE COMPLETE', failBadge: '✕ DEFEATED',
    okHead: { egg: 'You reached the egg site!', forage: 'You foraged the falls!', boss: 'Thornback is defeated!', ember: 'You reached the Ember nest!', cinder: 'Cinderjaw is defeated!' },
    okSub: 'Rewards have been added to your Sanctuary.',
    failHead: 'The raiders overwhelmed you', failHeadBoss: 'Thornback was too strong', failHeadCinder: 'Cinderjaw burned you out',
    whereEmber: 'Emberlands · Expedition {n}', nextEmber: 'The Emberlands are open. Try the Ember Trail, and watch for lava and vents.', failSub: 'You keep everything you gathered before the fall. Nothing in your Sanctuary is lost.',
    food: 'Food', dna: 'DNA Fragments', tokens: 'Frontier Tokens', xp: 'Experience',
    next: 'Next:', nextEvo: 'Your first evolution is ready to choose in the Sanctuary.', nextGeneric: 'Spend your rewards on upgrades, or take on a harder objective.', nextBoss: 'Thornback’s Den is open. Evolve first — you will need it.', nextTip: 'Tip: dodge when an enemy flashes, then strike during its recovery.',
    sanctuary: 'Go to Sanctuary', again: 'Play again', retry: 'Retry', sanctuaryShort: 'Sanctuary',
    discovery: 'NEW DISCOVERY · {name}', addedCodex: 'Added to your Codex', levelUp: 'LEVEL UP · Lv {lv}'
  },
  sanctuary: {
    yourDino: 'Your dinosaur', lv: 'Lv {lv} / {max}', biomeShort: { verdant: 'Valley', ember: 'Emberlands' }, biomes: { verdant: 'Verdant Valley', ember: 'Emberlands' }, biomeLocked: 'Emberlands unlock at level {lv}', status: 'Health {hp} · Energy {en} · Path:', notChosen: 'not chosen',
    evo: 'Evolution', evoReady: '● Choice ready', evoLocked: 'Unlocks after your first expedition', evoChosen: 'Path: {p}', upgrades: 'Upgrades', affordable: '{n} affordable', none: 'None affordable',
    codex: 'Codex', discovered: '{a} / {b} discovered', missions: 'Daily missions', missionsMeta: '{d} / {t} · {c} to claim', missionsMeta0: '{d} / {t} done', tokensLabel: 'Tokens', back: 'Back to title'
  },
  evo: {
    title: 'Choose your evolution', switchNote: 'You can switch path later for a small Frontier Token fee.', evolveInto: 'Evolve into {n}', switchTo: 'Switch to {n}', confirm: 'Spend {c} on {n}?', cancel: 'Cancel', confirmBtn: 'Confirm', locked: 'Complete your first expedition to unlock evolution.', current: 'CURRENT', short: 'Need {n} more {r}.', signature: 'Signature:', energy: 'Energy',
    paths: {
      swiftclaw: { name: 'Swiftclaw', role: 'MOBILITY', strength: 'Speed, dodge and critical hits', weakness: 'Lower defence', sig: 'Phantom Dash', energy: 'normal', alt: 'Feathered teal raptor' },
      ironhide: { name: 'Ironhide', role: 'DEFENCE', strength: 'Armour, health, less boss damage, resists heat', weakness: 'Lower speed', sig: 'Fortress Roar', energy: 'normal', alt: 'Heavily armoured spiked dinosaur' },
      wildspark: { name: 'Wildspark', role: 'SPECIAL', strength: 'Area and status effects', weakness: 'Higher energy cost, longer cooldowns', sig: 'Genesis Surge', energy: 'high', alt: 'Dinosaur with glowing blue crystal spines' }
    }
  },
  upg: {
    title: 'Sanctuary upgrades', level: 'Level {l} / {m}', next: 'Next: {t}', need: 'Need {n} more Tokens — earn them from daily missions or by beating Thornback.', note: 'All upgrades are earned through play. No purchases.', maxed: 'Maxed', buy: 'Buy {n} for {c} Tokens', short: '{n}, not enough Tokens',
    list: {
      hide: { name: 'Thick Hide', next: 'Max health +10' },
      snout: { name: 'Keen Snout', next: 'Food pickups +20%' },
      stam: { name: 'Trail Stamina', next: 'Energy recharges 15% faster' }
    }
  },
  codex: {
    title: 'Dinosaur Codex', tabs: { species: 'Species', eggs: 'Eggs', biomes: 'Biomes' }, prog: { species: '{a} / {b} species', eggs: '{a} / {b} eggs', biomes: '{a} / {b} biomes' },
    open: '● OPEN', found: '✓ FOUND', unknown: '? UNKNOWN', later: '× LATER', here: '● HERE',
    species: {
      starter: { name: 'You — young wanderer', text: 'Separated from its pack. Quick learner.' },
      raider: { name: 'Raider', text: 'Basic melee. Flashes before it lunges.', clue: 'Clue: red-scaled hunters stalk the trail.' },
      spitter: { name: 'Spitter', text: 'Ranged. Keeps its distance and spits.', clue: 'Clue: spits from the reeds near water.' },
      skimmer: { name: 'Skimmer', text: 'Fast skirmisher. Hits and runs.', clue: 'Clue: fast and travels in pairs at dusk.' },
      thornback: { name: 'Thornback', text: 'Giant armoured herbivore. Charges and slams.', clue: 'Clue: the ground shakes in the eastern den.' },
      cinderjaw: { name: 'Cinderjaw', text: 'Furnace-born brute. Charges and slams beside erupting vents.', clue: 'Clue: something huge waits where the lava never cools.' }
    },
    eggs: {
      shadowscale: { name: 'Shadowscale Egg', text: 'Found at the egg site. Hatching arrives in a later update.', clue: 'Clue: waits where the trail ends.' },
      glade: { name: 'Glade Egg', text: 'Found in a fern nest by the falls.', clue: 'Clue: a fern nest beside the falls.' },
      prism: { name: 'Prism Egg', text: 'Revealed when a Genesis Crystal wakes.', clue: 'Clue: guarded near a waterfall shrine.' },
      ember: { name: 'Ember Egg', text: 'Warm to the touch. Waits at the end of the Ember Trail.', clue: 'Clue: kept warm by the Emberlands heat.' }
    },
    biomes: {
      verdant: { name: 'Verdant Valley', text: 'Lv 1–10 · Movement, hunting, first eggs.' },
      ember: { name: 'Emberlands', text: 'Lv 11–20 · Lava, heat vents, tougher foes. Open now.' },
      frost: { name: 'Frostfang Peaks', text: 'Lv 21–30 · Freezing weather.' },
      mire: { name: 'The Lost Mire', text: 'Lv 31–40 · Poison and camouflage.' },
      crater: { name: 'Genesis Crater', text: 'Endgame · Source of the Pulse.' }
    },
    unknownName: '???', artNeeded: '[Art needed]'
  },
  missions: {
    title: 'Daily missions', reset: 'New missions at midnight · {t}', reward: 'Reward:', claim: 'Claim', claimed: '✓ Claimed', progress: 'In progress', note: 'Missions are optional. Missing a day costs nothing.',
    names: { berries: 'Gather {n} berries', raiders: 'Defeat {n} Raiders', dodge: 'Dodge {n} attacks', abilities: 'Use your ability {n} times', expeditions: 'Complete {n} expeditions', enemies: 'Defeat {n} enemies' }
  },
  settings: {
    title: 'Settings', autosave: 'Changes save automatically on this device', sound: 'SOUND & FEEL', music: 'Music', sfx: 'Sound effects', mute: 'Mute all', vibration: 'Vibration', vibrationHint: 'Where supported', reduced: 'Reduced effects', reducedHint: 'Less shake & flashing',
    controls: 'CONTROLS', sens: 'Touch control sensitivity', keys: 'Keyboard: WASD / arrows move · Space attack · Shift dash · E ability · Esc pause', privacy: 'PRIVACY', analytics: 'Share anonymous gameplay analytics', analyticsHint: 'Off by default. The game works the same either way.', viewPrivacy: 'View privacy notice'
  },
  error: {
    return: 'Return to title',
    'invalid-save': { title: 'We couldn’t read your save', body: 'Something went wrong with your saved game. We can restore your last backup so you can keep playing.', info: 'Backup from {when} · Level {lv} · {tokens} Tokens. Progress after that point may be unavailable.', infoNone: 'No backup was found. You can start a fresh game; your old data is left untouched until you do.', primary: 'Restore backup', primaryNone: 'Start fresh' },
    'storage-full': { title: 'Progress may not save', body: 'Your browser storage is full or blocked, so new progress might not be kept after you close the game.', info: 'Free up space or allow site storage, then tap Retry. Nothing has been deleted.', primary: 'Retry save', secondary: 'Play anyway' },
    offline: { title: 'You’re offline', body: 'Expeditions still work. Online extras will come back when you reconnect.', info: 'Your progress keeps saving on this device.', primary: 'Keep playing' }
  },
  credits: {
    title: 'Credits', build: 'Version 1.1.0 · build {b}', made: 'MADE BY', studio: 'Stratos Games', design: 'Game design · Sk Sarfaraj Ali', eng: 'Engineering · Claude Code with Sk Sarfaraj Ali', art: 'Art · Original vector art kit & mood-board imagery', audio: 'Audio · Original synthesised soundtrack',
    lic: 'THIRD-PARTY LICENSES', licBody: 'No third-party code libraries are bundled. Dino Frontier runs on plain HTML, CSS and JavaScript.', licNote: 'Every sound and the vector game art were created for this project.',
    attr: 'ASSET ATTRIBUTIONS', attrBody: 'Painted scene images are mood-board art supplied by the project owner (see the provenance register before public release).', fonts: 'Fonts: system serif and sans-serif fonts.'
  },
  rotate: 'Rotate your phone to landscape to play.',
  stratosLink: 'https://stratos.games/'
};
DF.t = function (str, vars) {
  return String(str).replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : '{' + k + '}'; });
};
