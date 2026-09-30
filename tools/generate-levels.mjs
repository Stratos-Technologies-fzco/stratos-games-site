// Generates game/data/levels.json: 5 worlds x 10 levels, each with its own
// settings for the three age bands (Explorer 6-7, Adventurer 8-9,
// Master Explorer 10-12). Edit the tables below, then run:
//   npm run generate
// The generated JSON is committed so the game needs no build step.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'game', 'data', 'levels.json');

const worlds = [
  {
    id: 'beach',
    name: 'Pirate Beach',
    emoji: '🏖️',
    color: '#f59e0b',
    focus: 'Counting, basic maths, observation',
    story: 'An old shipwreck lies on the sand. The first map piece is hidden somewhere on this beach!',
    scenery: ['🌴', '🐚', '🦀', '⚓', '🏴‍☠️', '🥥'],
    pos: { x: 22, y: 78 },
    mapPiece: true,
    gems: 5
  },
  {
    id: 'jungle',
    name: 'Mystery Jungle',
    emoji: '🌿',
    color: '#16a34a',
    focus: 'Words, spelling, patterns, logic',
    story: 'Deep in the jungle, talking vines guard the second map piece.',
    scenery: ['🌴', '🐒', '🦋', '🌺', '🐸', '🍌'],
    pos: { x: 72, y: 72 },
    mapPiece: true,
    gems: 5
  },
  {
    id: 'cave',
    name: 'Crystal Cave',
    emoji: '💎',
    color: '#7c3aed',
    focus: 'Memory and sequences',
    story: 'Glowing crystals hum a secret tune. Remember it to open the way.',
    scenery: ['💎', '🔮', '🦇', '🍄', '🕯️', '🪨'],
    pos: { x: 24, y: 44 },
    mapPiece: true,
    gems: 5
  },
  {
    id: 'temple',
    name: 'Ancient Temple',
    emoji: '🏛️',
    color: '#b45309',
    focus: 'Science, maths, logic',
    story: 'Ancient machines and stone puzzles protect the last map piece.',
    scenery: ['🏺', '🗿', '📜', '🪔', '🌞', '🔱'],
    pos: { x: 74, y: 38 },
    mapPiece: true,
    gems: 5
  },
  {
    id: 'island',
    name: 'Treasure Island',
    emoji: '🏝️',
    color: '#0e7490',
    focus: 'Mixed skills + geography (maps and compass directions)',
    story: 'All four map pieces fit together! Follow the map to the legendary treasure.',
    scenery: ['🏝️', '🧭', '🗺️', '⛵', '🌋', '🦜'],
    pos: { x: 50, y: 19 },
    requiresMapPieces: ['beach', 'jungle', 'cave', 'temple'],
    mapPiece: false,
    gems: 10
  }
];

// [engine, title, clue emoji, mission, band0, band1, band2]
const L = (engine, title, clue, mission, b0, b1, b2) => ({ engine, title, clue, mission, bands: { 0: b0, 1: b1, 2: b2 } });

const levels = {
  beach: [
    L('number', 'Counting Shells', '🐚', 'Count the treasures washed up on the beach.',
      { mode: 'count', min: 2, max: 8, rounds: 4 },
      { mode: 'count', min: 8, max: 15, rounds: 4 },
      { mode: 'addsub', max: 100, min: 20, rounds: 5 }),
    L('object-hunt', 'Shell Hunt', '🔍', 'Find all the hidden shells in the sand.',
      { sets: ['shells'], count: 4, distractors: 5, rounds: 2 },
      { sets: ['shells', 'starfish'], count: 6, distractors: 9, rounds: 2 },
      { sets: ['beach-mixed', 'sea-life'], count: 7, distractors: 12, rounds: 2 }),
    L('number', 'Coins in the Chest', '🪙', 'Add up the pirate coins to open the chest.',
      { mode: 'add', max: 10, rounds: 4, pictures: true },
      { mode: 'add', min: 20, max: 100, rounds: 5 },
      { mode: 'mul', tables: 12, factorMax: 12, rounds: 5 }),
    L('pattern-puzzle', 'Beach Patterns', '🌊', 'The waves left a pattern in the sand. What comes next?',
      { kind: 'emoji', units: ['AB', 'AAB'], show: 6, rounds: 4 },
      { kind: 'emoji', units: ['ABC', 'AABB', 'ABB'], show: 8, rounds: 4 },
      { kind: 'number', rules: ['add', 'alt', 'double'], stepMin: 3, stepMax: 9, rounds: 5 }),
    L('spot-difference', 'Two Sandcastles', '🏰', 'Two sandcastles look the same… but are they?',
      { cols: 3, rows: 3, diffs: 3, rounds: 2 },
      { cols: 4, rows: 3, diffs: 4, rounds: 2 },
      { cols: 4, rows: 4, diffs: 5, rounds: 2 }),
    L('number', 'Crab Races', '🦀', 'Help the crabs work out the race scores.',
      { mode: 'sub', max: 10, rounds: 4 },
      { mode: 'addsub', max: 100, min: 20, rounds: 5 },
      { mode: 'div', tables: 12, factorMax: 12, rounds: 5 }),
    L('object-hunt', 'Starfish Search', '⭐', 'The starfish are playing hide and seek!',
      { sets: ['starfish'], count: 5, distractors: 6, rounds: 2 },
      { sets: ['crabs', 'coins'], count: 7, distractors: 10, rounds: 2 },
      { sets: ['sea-life', 'beach-mixed'], count: 8, distractors: 14, rounds: 2, cols: 7, rows: 6 }),
    L('memory-sequence', 'Parrot Says', '🦜', 'Polly the parrot taps the shells. Can you copy her?',
      { tiles: 4, length: 2, rounds: 3, speed: 900 },
      { tiles: 4, length: 3, rounds: 3, speed: 750 },
      { tiles: 6, length: 4, rounds: 3, speed: 650 }),
    L('number', "Captain's Puzzle", '🏴‍☠️', 'The captain hid a number. Find the missing one!',
      { mode: 'missing', ops: ['add'], max: 10, rounds: 4 },
      { mode: 'missing', ops: ['add', 'sub'], max: 50, rounds: 5 },
      { mode: 'missing', ops: ['mul', 'div'], tables: 12, factorMax: 12, rounds: 5 }),
    L('spot-difference', 'Shipwreck Secrets', '⚓', 'Compare the old drawing with the shipwreck.',
      { cols: 4, rows: 3, diffs: 3, rounds: 2 },
      { cols: 4, rows: 4, diffs: 5, rounds: 2 },
      { cols: 5, rows: 4, diffs: 6, rounds: 2 })
  ],
  jungle: [
    L('word-builder', 'Jungle Words', '🔤', 'The vines spell secret words. Put the letters in order.',
      { list: 'jungle-0', rounds: 3 },
      { list: 'jungle-1', rounds: 3 },
      { list: 'jungle-2', rounds: 3, extra: 1 }),
    L('pattern-puzzle', 'Vine Patterns', '🌿', 'Flowers grow on the vines in a pattern.',
      { kind: 'emoji', units: ['AB', 'ABC'], show: 6, rounds: 4 },
      { kind: 'emoji', units: ['AABB', 'ABBC', 'ABC'], show: 8, rounds: 4, missing: 'any' },
      { kind: 'mixed', units: ['ABBC', 'AABBC'], rules: ['alt', 'growing'], stepMin: 2, stepMax: 7, show: 8, rounds: 5, missing: 'any' }),
    L('object-hunt', 'Hidden Animals', '🐒', 'Cheeky animals are hiding in the leaves.',
      { sets: ['monkeys', 'bananas'], count: 4, distractors: 6, rounds: 2 },
      { sets: ['butterflies', 'fruit'], count: 6, distractors: 10, rounds: 2 },
      { sets: ['mammals', 'insects'], count: 7, distractors: 12, rounds: 2 }),
    L('maze-path', 'River Path', '🛶', 'Find a path along the river to the key.',
      { mode: 'maze', size: 4, rounds: 2 },
      { mode: 'maze', size: 6, rounds: 2 },
      { mode: 'maze', size: 8, rounds: 2 }),
    L('word-builder', 'Animal Names', '🐾', 'Name the jungle animals to make friends with them.',
      { list: 'animals-0', rounds: 3 },
      { list: 'animals-1', rounds: 3 },
      { list: 'animals-2', rounds: 3, extra: 1 }),
    L('pattern-puzzle', 'Monkey Numbers', '🔢', 'The monkeys are counting coconuts in a pattern.',
      { kind: 'number', rules: ['add'], stepMin: 1, stepMax: 2, startMax: 5, rounds: 4 },
      { kind: 'number', rules: ['add', 'sub'], stepMin: 2, stepMax: 10, startMax: 20, rounds: 4 },
      { kind: 'number', rules: ['squares', 'fib', 'growing', 'double'], rounds: 5, missing: 'any' }),
    L('maze-path', 'Tangled Trail', '🧵', 'The trail twists and turns. Reach the key!',
      { mode: 'maze', size: 5, rounds: 2 },
      { mode: 'maze', size: 7, rounds: 2 },
      { mode: 'maze', size: 9, rounds: 2 }),
    L('word-builder', 'Spelling Bridge', '🌉', 'Each correct word adds a plank to the bridge.',
      { list: 'spelling-0', rounds: 3 },
      { list: 'spelling-1', rounds: 4 },
      { list: 'spelling-2', rounds: 4, hideEmoji: true }),
    L('object-hunt', 'Odd Ones Out', '🧐', 'Tap only the things that belong to the group.',
      { sets: ['butterflies', 'monkeys'], count: 5, distractors: 7, rounds: 2 },
      { sets: ['fly', 'fruit'], count: 6, distractors: 10, rounds: 2 },
      { sets: ['insects', 'mammals', 'fly'], count: 8, distractors: 14, rounds: 3, cols: 7, rows: 6 }),
    L('maze-path', 'Jungle Gate', '🚪', 'The gate to the Jungle’s heart is at the end of this maze.',
      { mode: 'maze', size: 5, rounds: 3 },
      { mode: 'maze', size: 7, rounds: 3 },
      { mode: 'maze', size: 10, rounds: 2 })
  ],
  cave: [
    L('memory-sequence', 'Glowing Crystals', '✨', 'Watch the crystals glow, then tap them in the same order.',
      { tiles: 4, length: 2, rounds: 3, speed: 900 },
      { tiles: 4, length: 3, rounds: 3, speed: 800 },
      { tiles: 6, length: 4, rounds: 3, speed: 650 }),
    L('pattern-puzzle', 'Crystal Rows', '💠', 'The crystals grow in rows. Which one is missing?',
      { kind: 'emoji', units: ['AB', 'ABB'], show: 6, rounds: 4 },
      { kind: 'emoji', units: ['ABC', 'ABBC'], show: 8, rounds: 4, missing: 'any' },
      { kind: 'emoji', units: ['AABBC', 'ABCBA', 'ABCD'], show: 10, rounds: 5, missing: 'any' }),
    L('memory-sequence', 'Echo Cave', '🔊', 'The cave echoes back every sound. Can you?',
      { tiles: 4, length: 3, rounds: 3, speed: 850 },
      { tiles: 6, length: 3, rounds: 3, speed: 750 },
      { tiles: 6, length: 5, rounds: 3, speed: 600 }),
    L('spot-difference', 'Mirror Pools', '🪞', 'Two pools reflect the cave. Spot the differences.',
      { cols: 3, rows: 3, diffs: 3, rounds: 2 },
      { cols: 4, rows: 4, diffs: 4, rounds: 2 },
      { cols: 5, rows: 4, diffs: 6, rounds: 2 }),
    L('pattern-puzzle', 'Number Stalactites', '🔢', 'The drips count out a pattern.',
      { kind: 'number', rules: ['add'], stepMin: 1, stepMax: 2, startMax: 5, rounds: 4 },
      { kind: 'number', rules: ['add', 'sub', 'double'], stepMin: 2, stepMax: 10, rounds: 4 },
      { kind: 'number', rules: ['squares', 'fib', 'alt'], stepMin: 3, stepMax: 12, rounds: 5, missing: 'any' }),
    L('memory-sequence', 'Crystal Lock', '🔐', 'The lock opens only for the right crystal song.',
      { tiles: 4, length: 3, rounds: 3, speed: 850 },
      { tiles: 6, length: 4, rounds: 3, speed: 700 },
      { tiles: 9, length: 4, rounds: 3, speed: 600 }),
    L('object-hunt', 'Gem Hunt', '💎', 'Sparkling gems hide among the rocks.',
      { sets: ['gems'], count: 4, distractors: 6, rounds: 2 },
      { sets: ['gems', 'bats'], count: 6, distractors: 10, rounds: 2 },
      { sets: ['cave-light', 'solids'], count: 7, distractors: 12, rounds: 2 }),
    L('pattern-puzzle', 'Secret Sequence', '🗝️', 'Crack the secret sequence carved in the wall.',
      { kind: 'emoji', units: ['ABC', 'AAB'], show: 7, rounds: 4 },
      { kind: 'mixed', units: ['ABBC'], rules: ['add', 'sub'], stepMin: 3, stepMax: 9, rounds: 4, missing: 'any' },
      { kind: 'mixed', units: ['ABCBA', 'AABBC'], rules: ['double', 'squares', 'growing'], show: 7, rounds: 6, missing: 'any' }),
    L('memory-sequence', 'Bat Echo', '🦇', 'The bats squeak in order. Copy them!',
      { tiles: 4, length: 3, rounds: 4, speed: 850, grow: 0 },
      { tiles: 6, length: 4, rounds: 3, speed: 700 },
      { tiles: 9, length: 5, rounds: 3, speed: 550 }),
    L('memory-sequence', 'Great Crystal Door', '🚪', 'The final door needs the longest song of all.',
      { tiles: 4, length: 4, rounds: 3, speed: 800 },
      { tiles: 6, length: 5, rounds: 3, speed: 650 },
      { tiles: 9, length: 6, rounds: 3, speed: 520 })
  ],
  temple: [
    L('science-choice', 'Temple of Nature', '🌱', 'The temple garden asks questions about living things.',
      { bank: 'nature-0', rounds: 4, orderRounds: 1 },
      { bank: 'nature-1', rounds: 5, orderRounds: 1 },
      { bank: 'nature-2', rounds: 5, orderRounds: 2 }),
    L('number', 'Stone Numbers', '🗿', 'The stone guardian asks number riddles.',
      { mode: 'addsub', max: 20, rounds: 4 },
      { mode: 'mul', tables: 10, factorMax: 10, rounds: 5 },
      { mode: 'mixed', max: 200, min: 50, tables: 12, factorMax: 12, rounds: 6 }),
    L('pattern-puzzle', 'Sundial Patterns', '🌞', 'The sundial’s shadow moves in a pattern.',
      { kind: 'number', rules: ['add'], stepMin: 2, stepMax: 2, startMax: 10, rounds: 4 },
      { kind: 'number', rules: ['add', 'double'], stepMin: 3, stepMax: 10, rounds: 4 },
      { kind: 'number', rules: ['squares', 'fib', 'alt', 'growing'], stepMin: 4, stepMax: 15, rounds: 5, missing: 'any' }),
    L('science-choice', 'Sun and Planets', '🪐', 'The star map on the ceiling shows the sky. Place the planets.',
      { bank: 'space-0', rounds: 4, orderRounds: 1 },
      { bank: 'space-1', rounds: 5, orderRounds: 1 },
      { bank: 'space-2', rounds: 5, orderRounds: 2 }),
    L('number', 'Scroll Riddles', '📜', 'Ancient scrolls hold story puzzles.',
      { mode: 'word', bank: 'temple-0', rounds: 4 },
      { mode: 'word', bank: 'temple-1', rounds: 4 },
      { mode: 'word', bank: 'temple-2', rounds: 4 }),
    L('science-choice', 'Water and Weather', '🌦️', 'The rain fountain wants to know about water and weather.',
      { bank: 'water-0', rounds: 4, orderRounds: 1 },
      { bank: 'water-1', rounds: 5, orderRounds: 1 },
      { bank: 'water-2', rounds: 5, orderRounds: 1 }),
    L('spot-difference', 'Twin Statues', '🗿', 'Two statues guard the hall. One has changed!',
      { cols: 3, rows: 3, diffs: 3, rounds: 2 },
      { cols: 4, rows: 4, diffs: 5, rounds: 2 },
      { cols: 5, rows: 5, diffs: 6, rounds: 2 }),
    L('memory-sequence', 'Temple Drums', '🥁', 'Play the drums in the same order as the temple music.',
      { tiles: 4, length: 3, rounds: 3, speed: 850 },
      { tiles: 6, length: 4, rounds: 3, speed: 700 },
      { tiles: 9, length: 5, rounds: 3, speed: 550 }),
    L('science-choice', 'Body and Health', '🫀', 'The healer’s room is full of questions about our bodies.',
      { bank: 'body-0', rounds: 4, orderRounds: 1 },
      { bank: 'body-1', rounds: 5, orderRounds: 1 },
      { bank: 'body-2', rounds: 5, orderRounds: 2 }),
    L('number', 'The Great Lock', '🔒', 'Solve the lock’s numbers to win the last map piece!',
      { mode: 'missing', ops: ['add', 'sub'], max: 20, rounds: 4 },
      { mode: 'missing', ops: ['mul', 'add'], max: 100, tables: 10, factorMax: 10, rounds: 5 },
      { mode: 'missing', ops: ['mul', 'div', 'sub'], max: 500, min: 100, tables: 12, factorMax: 12, rounds: 6 })
  ],
  island: [
    L('maze-path', 'Follow the Compass', '🧭', 'Follow the compass directions to find the hidden chest.',
      { mode: 'compass', size: 4, steps: 1, maxDistance: 2, rounds: 3 },
      { mode: 'compass', size: 5, steps: 2, maxDistance: 3, rounds: 3 },
      { mode: 'compass', size: 6, steps: 3, maxDistance: 3, rounds: 3, diagonal: true }),
    L('science-choice', 'Map Explorer', '🗺️', 'Answer the map-maker’s questions about maps and directions.',
      { bank: 'geo-0', rounds: 4, orderRounds: 1 },
      { bank: 'geo-1', rounds: 5, orderRounds: 1 },
      { bank: 'geo-2', rounds: 5, orderRounds: 1 }),
    L('maze-path', 'Read the Map', '📍', 'Use the map to find which place is in each direction.',
      { mode: 'mapread', size: 4, landmarks: 4, rounds: 3 },
      { mode: 'mapread', size: 5, landmarks: 6, rounds: 4 },
      { mode: 'mapread', size: 6, landmarks: 8, rounds: 4 }),
    L('number', 'Treasure Maths', '💰', 'Count and share the treasure the pirates left behind.',
      { mode: 'word', bank: 'island-0', rounds: 4 },
      { mode: 'word', bank: 'island-1', rounds: 4 },
      { mode: 'word', bank: 'island-2', rounds: 4 }),
    L('word-builder', 'Island Words', '🔤', 'Spell the explorer words carved on the old sign.',
      { list: 'island-0', rounds: 3 },
      { list: 'island-1', rounds: 4 },
      { list: 'island-2', rounds: 4, extra: 1, hideEmoji: true }),
    L('maze-path', 'Compass Trail', '👣', 'A longer trail! Follow every step carefully.',
      { mode: 'compass', size: 5, steps: 2, maxDistance: 2, rounds: 3 },
      { mode: 'compass', size: 6, steps: 3, maxDistance: 3, rounds: 3, diagonal: true },
      { mode: 'compass', size: 7, steps: 4, maxDistance: 3, rounds: 3, diagonal: true }),
    L('science-choice', 'World Wonders', '🌍', 'The treasure map has pictures of places around the world.',
      { bank: 'wonders-0', rounds: 4, orderRounds: 1 },
      { bank: 'wonders-1', rounds: 5, orderRounds: 1 },
      { bank: 'wonders-2', rounds: 5, orderRounds: 1 }),
    L('maze-path', 'Landmark Hunt', '🏰', 'Explore the island map and find each landmark.',
      { mode: 'mapread', size: 4, landmarks: 5, rounds: 3 },
      { mode: 'mapread', size: 6, landmarks: 7, rounds: 4 },
      { mode: 'mapread', size: 7, landmarks: 9, rounds: 4 }),
    L('pattern-puzzle', 'Treasure Lock Code', '🔢', 'The treasure chest has a pattern lock.',
      { kind: 'emoji', units: ['ABC', 'AAB', 'ABB'], show: 7, rounds: 4 },
      { kind: 'mixed', units: ['ABBC', 'AABB'], rules: ['add', 'double', 'alt'], stepMin: 3, stepMax: 12, rounds: 5, missing: 'any' },
      { kind: 'number', rules: ['squares', 'fib', 'growing', 'alt', 'double'], stepMin: 5, stepMax: 20, rounds: 6, missing: 'any' }),
    L('maze-path', 'The Treasure Chest', '🧰', 'The last adventure: a maze, a compass trail and a map. The treasure awaits!',
      { mode: 'mixed', size: 5, compassSize: 4, mapSize: 4, steps: 2, maxDistance: 2, landmarks: 4, rounds: 3 },
      { mode: 'mixed', size: 7, compassSize: 5, mapSize: 5, steps: 3, maxDistance: 3, landmarks: 6, rounds: 3 },
      { mode: 'mixed', size: 9, compassSize: 6, mapSize: 6, steps: 4, maxDistance: 3, landmarks: 8, rounds: 3, diagonal: true })
  ]
};

const categoryOf = {
  number: 'maths',
  'word-builder': 'language',
  'memory-sequence': 'memory',
  'pattern-puzzle': 'logic',
  'object-hunt': 'observation',
  'maze-path': 'logic',
  'science-choice': 'science',
  'spot-difference': 'observation'
};

const allLevels = [];
for (const w of worlds) {
  const list = levels[w.id];
  if (list.length !== 10) throw new Error(`${w.id} must have 10 levels, has ${list.length}`);
  list.forEach((lvl, i) => {
    let category = categoryOf[lvl.engine];
    if (w.id === 'island' && (lvl.engine === 'maze-path' || lvl.bands[0].bank?.startsWith?.('geo') || lvl.bands[0].bank?.startsWith?.('wonders'))) category = 'geography';
    allLevels.push({
      id: `${w.id}-${String(i + 1).padStart(2, '0')}`,
      world: w.id,
      index: i + 1,
      engine: lvl.engine,
      category,
      title: lvl.title,
      clue: lvl.clue,
      mission: lvl.mission,
      bands: lvl.bands
    });
  });
}

const data = {
  generatedBy: 'tools/generate-levels.mjs',
  bands: [
    { id: 0, name: 'Explorer', ages: '6–7', emoji: '🐣' },
    { id: 1, name: 'Adventurer', ages: '8–9', emoji: '🦊' },
    { id: 2, name: 'Master Explorer', ages: '10–12', emoji: '🦅' }
  ],
  worlds: worlds.map((w) => ({ ...w, levels: allLevels.filter((l) => l.world === w.id).map((l) => l.id) })),
  levels: allLevels
};

writeFileSync(out, JSON.stringify(data, null, 1) + '\n');
console.log(`Wrote ${allLevels.length} levels in ${worlds.length} worlds to ${out}`);
