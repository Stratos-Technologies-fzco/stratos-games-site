# Crystal sets

Every world has its own gem look. The six gameplay colours never change: ruby is red, sapphire blue, emerald green, topaz yellow, amethyst purple, diamond white.

## How it works

- **The rules engine knows only colours** (a number from 0 to 5). It never sees sets or pictures. A test (`tests/sets.test.js`) proves the engine file has no mention of sets and that the same level plays out identically with every set id.
- **One place maps a gem to its picture:** `js/sets.js`, functions `textureKey(gem, setId)` and `gemSrc(gem, setId)`.
- **Which set a level uses** is the `crystalSet` field in the level data (see `LEVEL_SCHEMA.md`). If it is missing, the rules below apply.

### The rules (defaults, any level can override them)

| Level | Set |
|---|---|
| Levels 1-4, 6-9, 11-14, 16-19 of a world | the world's set |
| Levels 5, 10, 15 | **Guest Gems**: the previous world's set (world 1 borrows Forest Leaves). The level intro shows a "Guest gems!" banner |
| Level 20 (boss) | the world's set, plus a glow around the board in the boss colour |
| Daily Puzzle | one of the five playable sets, chosen from the date (same for everybody) |

The set never changes in the middle of a level. Choosing **Gem style: Classic** in Settings uses `set_01_classic` everywhere.

To give one level its own set, add it to `LEVEL_SET_OVERRIDES` in `js/levels.js`, for example `{ 12: 'set_05_dragon_scales' }` (the key is the level number 1-100).

### Loading

- Only the classic gems are loaded at the start.
- A set (six small SVG files, about 80 KB) is loaded the first time a level or its intro needs it. While the intro is open, the **next** level's set is loaded in the background.
- Nine sets are never loaded together. The Gem Collection only requests pictures of sets the player has unlocked.
- If a set fails to load, the board uses the classic gems and the browser console shows a warning. An empty tile cannot appear (every gem picture has a classic fallback).
- There is no WebP atlas in this game. The repo's build tools are shared and are not run for a single game folder, so each set is loaded as six SVGs.

### Special crystals and the rim

The eight special crystals keep their own art. On a themed board a thin ring in the set's **rim colour** (in `sets.js`) is drawn around them. The rim colours are copied from `tools/gen_crystal_sets.py` because `crystal_sets.json` does not list them.

### Where gems show

Board tiles, goal chips in the HUD, the level intro, the level-complete screen and the Ruby starter-booster picker use the active set. Menus, the world map and the shop keep the classic icons.

### Gem Collection

Profile, then "Gem Collection". A set unlocks when the player first starts a level in its world (players who already reached a world get its set automatically). Sets of worlds that are not playable yet show "Coming soon". Unlocks are saved in `save.sets`. Settings, "Gem style" is saved as `save.gemStyle` (`themed` or `classic`).

## Add a new set

1. **Make the six pictures.** Edit `extras/tools/gen_crystal_sets.py` (add an entry to `SETS` with id, name, world, rim colour, tint, motif and six outlines) and run it, or draw them by hand. Files: `assets/crystal_sets/<set_id>/crystal_01_ruby.svg` to `crystal_06_diamond.svg`, 128 x 128.
2. **List it** in `assets/crystal_sets/crystal_sets.json` (same shape as the other entries).
3. **Register it** in `js/sets.js`: add a line to `SETS` (id, name, world name, `worldNum`, folder, rim colour). Change `PLAYABLE_WORLDS` when the world can be played. The default rule uses `SETS[world - 1]`, so keep the order by world.
4. **Translate the name:** add it to `js/lang-hi.js` (and any other language file).
5. **Tests:** run `node tests/sets.test.js` (every gem file exists, every gem has a key, levels pass), open `tests/silhouettes.html` in a browser (six different shapes), and run `node tests/browser/sets-e2e.js`.
6. **Inventory:** add the six files to `ASSET_INVENTORY.md`. New art stays **Placeholder** until it is final.

## Known problems with the first art version

The silhouette check (`tests/silhouettes.html`) compares the outline of every gem with the others in its set. These four pairs are too close for a colour-blind player (outline overlap 0.90 or more) and need new art. The check lists them as warnings and fails on any new look-alike pair:

| Set | Pair | Overlap |
|---|---|---|
| Classic Gems | ruby and topaz | 0.95 |
| Frozen Shards | sapphire and topaz | 0.92 |
| Ocean Pearls | ruby and topaz | 0.92 |
| Dark Obsidian | ruby and sapphire | 0.90 |

Gems in a set also differ in colour and inner pattern, but shape is what helps a colour-blind player most.
