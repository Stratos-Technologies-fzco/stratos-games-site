# Prompt addendum - paste this at the top of Prompt.txt (or right after section 1)

Everything below overrides the main prompt where they disagree. Items marked **(recommended default)** are my suggestions for the open questions found in `PROMPT_REVIEW.md`; edit them if you decide differently.

## A. Source of truth for design and assets

The folder `CRYSTAL QUEST - THE LOST KINGDOM` (copy it into the repository under `design/crystal-quest/`) contains the finished UI design, art and audio. Use it instead of generating or redrawing anything.

- `assets/` holds original SVG art: 6 crystals, 8 special crystals, 10 blockers, 5 characters, 7 bosses, 10 world backdrops, 31 UI icons and a logo emblem. `assets/manifest.json` lists every file by key.
- `audio/music/` holds 8 looping themes and `audio/sfx/` holds 15 sound effects, each as `.ogg` and `.mp3`. Load both formats in Phaser and let it choose.
- `docs/crystal-quest/UI_DESIGN_SPEC.md` and `design-tokens.css` define colours, type, shapes, spacing and the 18 required screens plus the desktop layout. Implement React screens to match, using the tokens.
- The visual mock-ups live in the Claude design canvas linked from `README.md` (20 boards). Treat them as the reference for layout.
- Statuses in `ASSET_INVENTORY.md` are authoritative. "Placeholder" assets are original and usable, but you must keep them labelled as placeholders and never describe them as final artwork.
- Do not regenerate these assets. Pack them into texture atlases at build time (WebP) and keep the original SVGs as sources.

## B. Decisions for the open questions

1. **Special crystal creation (recommended default).**
   - Four in a line: Lightning Crystal if the line is horizontal (clears its row), Vertical Thunder if vertical (clears its column).
   - L or T shape: Ruby Bomb (clears the 3 by 3 area around it).
   - Five in a line: Rainbow Crystal.
   - Five or more in a cross, or a T or L with arms of four or longer: Crystal Nova (large area blast).
   - A 2 by 2 square of one colour: Crystal Fish (seeks blockers and objectives).
   - A match of six or more, or the combination of two specials marked in section 9: Super Crystal.
   - Magic Star is never created by a match. It is awarded by Rainbow plus Nova, as a boss reward, or from a daily reward chest.
   - Specials are colour-agnostic in code; "Ruby Bomb" is a name, not a colour restriction.
2. **Crystals and worlds (recommended default).** The six crystals appear in every world. Each world has a featured collection colour (Valley: Ruby, Frozen: Sapphire, Forest: Emerald, Desert: Topaz, Dragon: Ruby with fire styling, later worlds to be decided). World-specific "crystals" in section 6 become theme and blocker styling, not extra match colours.
3. **Tutorial.** Levels 1 to 3 are guided: Luma explains swapping, matching four and using a booster, using the hint-bubble pattern in the comps. Emit the "Tutorial completed" analytics event when level 3 is finished.
4. **Bosses.** Crystal Valley: Stone Golem at level 20. Frozen Mountains: Ice Dragon at level 20. Enchanted Forest: Forest Witch at level 20. Lost Desert and Dragon Kingdom have no boss in release one. Rename the final Valley restoration project "Crystal Fountain Court" so only World 10 is called Crystal Palace.
5. **Score validation.** The server issues a level seed at `POST /api/game/start`. The client submits the move list with `POST /api/game/complete`. The server replays the moves with the same engine (run the TypeScript engine in a small Node verification service) and only then awards stars and rewards.
6. **Level schema first.** Phase 2 starts by delivering `level.schema.json`, a validator CLI, and a headless bot that plays each level a few hundred times and reports win rate. Levels outside a 20 to 90 percent bot win band are flagged.
7. **Engine and UI contract.** Phaser and React talk only through a typed event bus documented in `ENGINE_API.md`. Test builds accept `?seed=<n>` and expose a debug API that is compiled out of production builds.
8. **Guest progress** is stored in IndexedDB and mirrored to the server when an account is linked. On linking, keep the higher star count per level and add inventories and currencies.
9. **Privacy.** Ask for consent before any analytics event is sent, provide a privacy page and account and data deletion, and pause analytics for players who decline. Do not collect personal data from guests.
10. **Localisation.** All strings go through an i18n layer from the start; English ships first; keep fonts that support Devanagari available.
11. **Performance budget.** Target a mid-range Android phone, first load under 5 MB gzip excluding audio, 60 FPS during cascades, and lazy-load per-world assets and music. Use WebP texture atlases rather than GPU-compressed textures.
12. **Economy.** Produce `ECONOMY.md` with earn and spend rates before building the shop. Numbers in the comps are samples only.
13. **UI stays bright.** Even in dark worlds the interface keeps the bright outlined style from the comps.

## C. Working rules

- Run Phase 0 to Phase 2, then stop and report with test results before continuing.
- Commit after each phase. Run later phases in fresh sessions if the context gets long.
- Never present a placeholder as finished. Update `ASSET_INVENTORY.md` whenever an asset changes.
