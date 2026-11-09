# TASK FOR CLAUDE CODE - Themed Crystal Sets for CRYSTAL QUEST: THE LOST KINGDOM

Paste everything below into Claude Code, launched from the STRATOS.GAMES repository root. The design folder `crystal-quest` must already be copied to `design/crystal-quest/` (it now contains `assets/crystal_sets/`).

---

## 1. Goal

Right now every level uses the same six gems. Make the game more interesting by giving each world (and some individual levels) its own **crystal set**: a different shape family, rim, glow and small inner motif, while the six **gameplay colours stay identical** (ruby = red, sapphire = blue, emerald = green, topaz = yellow, amethyst = purple, diamond = white).

Style guidance: bright, glossy, bold and instantly readable, with one clear silhouette per colour and big shiny highlights, in the way the best casual match-3 games are readable at a glance. This is inspiration for readability and polish only. Do not copy or imitate any Candy Crush Saga piece, character, level layout, sound or artwork. All art in the design package is original; keep it that way and do not replace it with anything resembling a commercial game's assets.

## 2. Inputs (already created, do not redraw)

- `design/crystal-quest/assets/crystal_sets/<set_id>/crystal_01_ruby.svg ... crystal_06_diamond.svg` (6 gems per set, 128x128 SVG).
- `design/crystal-quest/assets/crystal_sets/crystal_sets.json` - set ids, names, worlds and file paths.
- The existing classic set is `design/crystal-quest/assets/crystals/` and becomes set `set_01_classic`.
- Preview sheet: `design/crystal-quest/previews/crystal_sets.png`.
- Generator (reference only): `design/crystal-quest/tools/gen_crystal_sets.py`.
- Status of every file is in `ASSET_INVENTORY.md` (rows CQ-CST-xxx are Placeholder, original vector v1). Keep them labelled as Placeholder.

Sets:

| Set id | Name | Default world |
|---|---|---|
| set_01_classic | Classic Gems | World 1 Crystal Valley |
| set_02_frozen_shards | Frozen Shards | World 2 Frozen Mountains |
| set_03_forest_leaves | Forest Leaves | World 3 Enchanted Forest |
| set_04_desert_relics | Desert Relics | World 4 Lost Desert |
| set_05_dragon_scales | Dragon Scales | World 5 Dragon Kingdom |
| set_06_ocean_pearls | Ocean Pearls | World 6 (coming soon) |
| set_07_sky_feathers | Sky Feathers | World 7 (coming soon) |
| set_08_dark_obsidian | Dark Obsidian | World 8 (coming soon) |
| set_09_celestial_stars | Celestial Stars | World 9 (coming soon) |

## 3. Before coding

Inspect how the live game currently loads and draws crystals (the game is deployed at https://stratos-family-staging.vercel.app/play/nikhatenglish89-crystal-quest/). Find where crystal textures are created, where level data is defined, and where the HUD, objective chips and level-intro screen show crystal icons. Write `docs/crystal-quest/CRYSTAL_SETS_PLAN.md` with the findings and the changes you will make. Do not break existing levels or saved progress.

## 4. Requirements

1. **Engine stays colour-only.** The rules engine knows only the six gem types (`ruby, sapphire, emerald, topaz, amethyst, diamond`). It must never know about sets. A single render-layer function `textureKey(gemType, setId)` maps a gem to its texture. Matching, objectives, scoring and server-side replay verification must give identical results with any set.
2. **Level data.** Add an optional `crystalSet` field to the level JSON schema and validator. Default: the world's set. Add `crystalSet` to the seed data and keep old level files valid without it.
3. **Variety rules (defaults, all overridable per level):**
   - Levels 1 to 4 of a world use the world's set.
   - Levels 5, 10 and 15 are "Guest Gem" levels that use the previous world's set (World 1 uses `set_03_forest_leaves`). Show a small "Guest gems!" banner on the level intro.
   - Boss levels (level 20) use the world's set with a boss-colour glow.
   - The Daily Puzzle picks a set by date (deterministic from the date so it is the same for everyone).
   - Sets must never change in the middle of a level.
4. **Loading and performance.** Pack each set into its own WebP texture atlas at build time and lazy-load it when a level or its intro needs it. Preload the next level's set while the player is on the level intro. Never load all nine atlases up front. Keep the first-load budget from the main prompt.
5. **Specials.** The eight special crystals keep their current art. If a special sits on a themed board, draw a thin rim in the set's rim colour (from `crystal_sets.json`) so it feels part of the board. Specials must still be unmistakable at a glance.
6. **HUD and UI.** Objective chips, collection counters, the level intro, the level-complete screen, the starter-booster picker and the hint bubbles must show the gem icon from the active set. Menus, world map and shop keep the classic icons.
7. **Readability and accessibility.**
   - Within a set, all six outlines are different, so colour-blind players can tell gems apart by shape. Keep that; add a test that checks the six silhouettes of each set are pairwise different (compare rendered alpha masks).
   - Add a Settings option "Gem style": Themed (default) or Classic. Classic uses `set_01_classic` everywhere. Respect "Calmer effects".
   - Contrast: each gem must stay clearly visible over the world background and over the board tile colour.
8. **Gem Collection screen.** Add a simple "Gem Collection" screen (reachable from Profile) that shows each set, locked until the player reaches its world. Unlock the set when the world is first entered. Reuse the bright UI style from the design tokens. Persist unlocks with the rest of the player progress.
9. **Fallback.** If a set fails to load, fall back to `set_01_classic` and log a warning. The game must never show an empty tile.
10. **Do not change** gameplay rules, board sizes, level goals or economy as part of this task.

## 5. Also fix while you are here (found in testing)

- Keep the booster bar and board fully visible when the browser window is short or on phones in portrait.
- Remove the leftover finished board that remains behind the menu after dismissing the next-level intro.
- Give the booster stock on early levels a sensible limit (the player currently has six booster types on Level 2).

## 6. Tests

- Unit: `textureKey` for every gem x set; schema accepts and defaults `crystalSet`; Guest Gem rule picks the right set; Daily Puzzle set is deterministic for a date.
- Engine: run the existing engine and replay tests with each set id to prove results are identical.
- Visual: silhouette-uniqueness test for every set; a screenshot test of one board per set (mobile 390x844 and desktop 1280x800).
- E2E (Playwright): start a level in each of the five playable worlds, confirm the right set loads; switch Gem style to Classic and confirm all boards use classic gems; reload and confirm the setting persists.
- Performance: confirm only the needed atlas is requested (check network requests) and that switching worlds does not leak textures (destroy unused textures).

## 7. Documentation

Update `docs/crystal-quest/ASSET_INVENTORY.md` (do not mark anything Production that is Placeholder), add `docs/crystal-quest/CRYSTAL_SETS.md` (how to add a new set: generate SVGs, add an entry to `crystal_sets.json`, add the set to the atlas build, add tests), and update the level JSON schema docs.

## 8. How to work

Plan first (CRYSTAL_SETS_PLAN.md), then implement in small commits: schema and data, texture pipeline, rendering and HUD, settings and collection screen, tests, docs. Run all tests after each step. Report what is done, what is placeholder, and what remains. Ask me only if a decision could break existing play or progress.
