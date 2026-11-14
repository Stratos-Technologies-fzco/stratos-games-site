# Crystal Quest - Review of the Master Prompt

Reviewed file: `Prompt.txt` (32 sections). This is a strong prompt: the stack, phases, acceptance criteria, security rules and "do not fake it" rules are all clear. The items below are things Claude Code will otherwise have to guess, or that contradict each other. Fix the **Blocking** ones before you start; the rest can be fixed as you go. A ready-to-paste fix block is in `Prompt_Addendum.md`.

## Blocking (decide before running the prompt)

1. **Special crystals cannot all be created.** Section 9 gives creation rules for only three of the eight specials (Ruby Bomb = 4 in a line, Rainbow = 5 in a line, Nova = L or T). Lightning Crystal, Vertical Thunder, Magic Star, Crystal Fish and Super Crystal have no way to appear on the board, and a 4-in-a-line match can only make one thing. Recommended rule set is in the addendum.

2. **Server-side score validation is impossible as written.** Sections 22 and 23 say never trust client scores, but the puzzle runs in the browser and the engine is TypeScript while the backend is Python. Without more, the server can only check plausibility. Recommended: seeded random generator per level start (the server issues the seed), the client submits the move list, and the server replays it. That needs the engine rules available to the verifier (a small Node worker running the same TypeScript engine is the cheapest way; a Python port doubles the maintenance).

3. **Crystal colours and world crystals do not match.** Section 7 defines six universal crystals (Ruby, Sapphire, Emerald, Topaz, Amethyst, Diamond). Section 6 gives each world its own crystal (Fire, Aqua, Wind...) and gives worlds 8 to 10 none. Decide whether the six are universal in every world (recommended; each world features one as its collection colour) or whether worlds re-skin them.

4. **No tutorial, but the tutorial is measured.** Section 24 tracks "Tutorial completed" and section 30 requires that a new guest can finish the first level, yet no tutorial system, screen or phase exists. Add a guided first three levels with Luma and Eldrin hint bubbles (the comps already show the bubble pattern).

5. **Boss mapping is undefined.** Three bosses are in the first release but five worlds are; worlds 4 and 5 have none. Section 14 also says Crystal Valley ends with a "Crystal Palace" restoration while World 10 is called Crystal Palace. Pick the boss per world and rename one of the two palaces.

## Should add

6. **Level data schema.** "Data-driven levels" is repeated but no schema is given. Ask for a JSON schema plus a validator as the first deliverable of Phase 2, because the engine, the seed data and the tests all depend on it.

7. **Level solvability.** "All level objectives are achievable" for 100 levels cannot be checked by hand. Ask for a headless bot (random plus greedy play, a few hundred runs per level) that reports win rate and flags levels under or over a target band.

8. **Economy.** Coins, shards, energy, booster prices, the "+5 moves" offer and daily reward values are all used but never defined. Add an `ECONOMY.md` deliverable with earn and spend rates. The comps use sample numbers only.

9. **Required screens are incomplete.** Section 18 lists 18 screens. Missing but implied elsewhere: Tutorial hints, Daily Crystal Challenge, Weekly Tournament, character dialogue and introduction screens (section 5), treasure chest opening (section 16), account linking and consent. The comps cover the 18 listed plus a desktop view and a style guide; the extra screens still need design.

10. **Guest to account merge.** Guests must keep progress across sessions and can link an account later. The prompt does not say where guest progress lives (IndexedDB is recommended) or what happens if the account already has progress. Define a merge rule (for example, keep the higher star count per level and add inventories).

11. **Privacy and consent.** The audience is "casual players worldwide" with analytics and leaderboards, aimed at India and Europe. Add a consent step before analytics, a privacy page, account and data deletion, and a decision on the minimum age (a game with a friendly fantasy look will attract children, which brings extra rules). This is a product and legal decision; have it reviewed by someone qualified.

12. **Localisation.** Two of the three target markets are not English-first. Ask for an i18n layer from day one (no hard-coded strings; number formatting; fonts that cover Devanagari). The settings comp has a language row for this.

13. **Performance budget.** "Smooth 60 FPS" and "compressed textures" are goals, not targets. Browser support for compressed GPU textures through Phaser is limited, so WebP atlases are the realistic route. Add numbers: target device (for example a mid-range Android phone), first-load size, memory ceiling.

14. **Engine/UI contract.** Phaser must be independent of React, which is right, but the two still need to talk. Ask for a small typed event bus (`levelStart`, `moveMade`, `objectiveChanged`, `levelComplete`, `levelFailed`, `pause`, `resume`) documented in `docs/crystal-quest/ENGINE_API.md`.

15. **Testability hooks.** The end-to-end test completes a puzzle, which needs deterministic boards. Ask for a `?seed=` parameter and a debug API that is compiled out of production builds.

## Small contradictions and wording

16. **Dark worlds versus "avoid dark interfaces".** Section 18 says avoid dark and dull UI, but World 8 is a corrupted dark kingdom. The comps keep the interface bright and outlined even over dark backdrops; say so explicitly.
17. **"Efficient collision-free board logic"** (section 25) is unclear; there is no collision in a grid game. Probably means "avoid per-frame full-board scans".
18. **Placeholders versus production.** Section 19 says to use image generation if available; Claude Code usually cannot. This package supplies the art and audio instead, so the prompt should point at it (addendum) and Claude Code should not regenerate art.
19. **Scope.** One prompt covers a game engine, 100 levels, 10 blockers, 8 specials, bosses, a backend, a database, tests and deployment. The phased plan is good; add "stop after Phase 2 and report" and run later phases as separate sessions with a commit between each.
20. **Friends leaderboard** is "when available", but no social system is in scope. The comps show it as a locked tab.
21. **Repository access.** Sections 4 and 32 start with inspecting the STRATOS.GAMES repo, so Claude Code must be launched from that repository's root.
22. **Reward values** in section 16 (100, 150, 200, 300 coins) are given; the achievement thresholds are not. The comps use proposed thresholds that you should confirm.

## What is already good

Clear separation of Phaser, React and FastAPI duties; the state machine list; "never allow interaction while a move is processing"; the test lists; the honest-status rule for assets; guest-first play; server-side reward validation; and "do not make progression depend on purchases".
