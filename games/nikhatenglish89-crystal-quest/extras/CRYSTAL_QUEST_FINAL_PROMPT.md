# MASTER DEVELOPMENT PROMPT (FINAL) - CRYSTAL QUEST: THE LOST KINGDOM
## STRATOS.GAMES - Professional Match-3 Fantasy Adventure Game

Before you start: copy the whole `crystal-quest` design folder (art, audio, docs, tools) into the STRATOS.GAMES repository at `design/crystal-quest/`, then launch Claude Code from the repository root and paste everything below this line.

---

# 0. READ THIS FIRST - SOURCES OF TRUTH AND DECISIONS

This prompt is complete and overrides any older version. The folder `design/crystal-quest/` already contains the finished design package. Use it. Do not redraw, regenerate or replace it.

## 0.1 Design package (inputs)

- `design/crystal-quest/assets/` - original SVG art: 6 crystals, 8 special crystals, 10 blockers, 5 characters, 7 bosses, 10 world backdrops (portrait 390x844 design size), 31 UI icons, UI kit references and logo emblem. `assets/manifest.json` maps every asset key to a file.
- `design/crystal-quest/audio/music/` (8 loops/themes) and `audio/sfx/` (15 effects). Every file exists as `.ogg` and `.mp3`. Load both in Phaser.
- `design/crystal-quest/docs/crystal-quest/UI_DESIGN_SPEC.md`, `design-tokens.css`, `design-tokens.json` - colours, type, shapes and the screen list. Implement the React screens to match, using the tokens.
- `design/crystal-quest/docs/crystal-quest/ASSET_INVENTORY.md` - authoritative asset statuses. "Placeholder" assets are original and usable but must stay labelled Placeholder in the repo's own inventory. Never describe them as final artwork.
- `design/crystal-quest/docs/crystal-quest/AUDIO_DESIGN.md` - audio guidance.
- UI mock-ups: the Design canvas at https://claude.ai/artifact/9M2vqdcDWswQZnNqM1gJid (20 boards). Layout reference. Numbers shown on mock-ups (Level 8, 24 moves, 3,240 score, coin counts) are sample data only.
- Build pipeline: pack SVGs into WebP texture atlases at build time (script it). Keep the SVGs as sources. Do not call external image or audio generators.
- Still missing and to be built by you in code: animation (tweens, particles), VFX, restoration before/after scenes, reward graphics, level-marker variants, and everything for worlds 6 to 10. Use code-drawn or tinted variants of existing art, and record each in the inventory as Placeholder or Missing.

## 0.2 Decisions (these override anything below that seems to disagree)

1. **Special crystals - creation rules.** All crystals are colour-agnostic specials; names are not colour restrictions.
   - 4 in a horizontal line -> Lightning Crystal (clears its row).
   - 4 in a vertical line -> Vertical Thunder (clears its column).
   - L or T shape -> Ruby Bomb (clears the 3x3 area around it).
   - 5 in a line -> Rainbow Crystal (clears all crystals of the colour it is swapped with).
   - Cross shape (5+ cells meeting in a plus), or a T or L with arms of 4 or longer -> Crystal Nova (large-area blast).
   - 2x2 square of one colour -> Crystal Fish (flies to blockers and objectives).
   - Match of 6 or more, or an advanced combination marked in the combination table -> Super Crystal (massive board effect).
   - Magic Star is never created by a normal match. It comes from Rainbow + Nova, boss rewards, or daily-reward chests.
   - Where more than one rule applies, the highest-priority wins: Super > Nova > Rainbow > Ruby Bomb > Lightning/Thunder > Fish.
2. **Crystals and worlds.** The six basic crystals (Ruby, Sapphire, Emerald, Topaz, Amethyst, Diamond) appear in every world. Each world has a featured collection crystal used for its objectives and restoration energy (Valley: Ruby, Frozen Mountains: Sapphire, Enchanted Forest: Emerald, Lost Desert: Topaz, Dragon Kingdom: Ruby with fire styling; later worlds to be decided). Section-6 "Fire/Aqua/Wind crystals" are theme and blocker styling, not extra match colours.
3. **Tutorial.** Levels 1 to 3 are guided. Luma and Eldrin hint bubbles explain: swapping, matching four to make a special, and using a booster. Fire the "Tutorial completed" analytics event when level 3 is first finished. Add a "skip tutorial" option.
4. **Bosses in release one.** Crystal Valley: Stone Golem (level 20). Frozen Mountains: Ice Dragon (level 20). Enchanted Forest: Forest Witch (level 20). Lost Desert and Dragon Kingdom have no boss in release one (Sand Titan and Fire Dragon are framework-ready, data only). Rename the Valley's last restoration project from "Crystal Palace" to "Crystal Fountain Court" so that only World 10 is called Crystal Palace.
5. **Server-side validation (anti-cheat).** The server issues a level seed at `POST /api/game/start`. The client's board generation uses that seed. The client submits its move list with `POST /api/game/complete`. The server replays the moves with the same TypeScript engine (a small Node verification service, shared package, in Docker Compose) and only then awards stars, rewards and leaderboard scores. If replay fails, reject and log. Do not port the engine to Python.
6. **Level data first.** Phase 2 begins by delivering `level.schema.json`, a validator CLI, and a headless bot (random plus greedy play, a few hundred runs per level) that reports win rate per level. Flag levels outside a 20 to 90 percent bot win band. All 100 levels must pass the validator and sit in the band before Phase 4 is reported done.
7. **Engine and UI contract.** Phaser and React communicate only through a typed event bus: `levelStart`, `moveMade`, `objectiveChanged`, `scoreChanged`, `levelComplete`, `levelFailed`, `bossDamaged`, `pause`, `resume`. Document it in `docs/crystal-quest/ENGINE_API.md`. Test builds accept `?seed=<n>`. A debug API (force board, add moves) exists only outside production builds and is compiled out.
8. **Guest progress** lives in IndexedDB with a persistent anonymous player id and syncs to the server when an account is linked. On linking: keep the higher star count per level, add currencies and inventories, keep the earliest completion timestamps.
9. **Privacy.** Ask for consent before sending any analytics event. Provide a privacy page and an account and data deletion route. Collect no personal data from guests. Do not decide the minimum age yourself; add a configurable age/consent gate and flag it in the final report as a legal decision for the owner.
10. **Localisation.** All user-visible strings go through an i18n layer from day one (English ships first). Use number and date formatting APIs. Make sure the chosen fonts have Devanagari fallbacks. The Settings screen has a language selector.
11. **Performance budget.** Target a mid-range Android phone (about 4 GB RAM) on Chrome. First load under 5 MB gzip excluding audio. 60 FPS during cascades. Lazy-load per-world assets and music. Use WebP atlases (GPU-compressed textures are not reliably supported in browsers; do not rely on them). Memory ceiling 250 MB in play.
12. **Economy.** Before building the shop, write `docs/crystal-quest/ECONOMY.md` (earn and spend rates for coins, crystal shards, booster prices, the "+5 moves" offer, daily-reward values, energy for restoration). The numbers on the mock-ups are samples.
13. **UI stays bright.** Even in dark worlds (Dark Kingdom, Celestial) the interface uses the bright, outlined style from the design spec.
14. **Colour-blind support.** Every crystal has a unique shape in addition to colour; keep that. Add a high-contrast option in Settings.
15. **Achievement thresholds** are not given; propose them in `ECONOMY.md` for the owner to confirm.
16. **Screens beyond the 18 mocked.** Design and build, in the same style: tutorial hint overlays, Daily Crystal Challenge, Weekly Tournament, treasure-chest opening, character dialogue and introduction, consent and privacy screen, account linking. Mark each as "built from the design language, not mocked".

## 0.3 Working rules for this session

- Run Phase 0, Phase 1 and Phase 2 now, then STOP and report. Run Phases 3 to 9 in later sessions, one or two phases at a time, with a commit between each. After each phase: run tests, fix errors, update docs, report what is complete and what remains.
- Never mark something complete if it is a placeholder.
- Write real working code. Do not stop after documentation or empty files.
- Ask the owner only if a decision could break existing STRATOS.GAMES functionality, needs unavailable credentials, costs money, or is irreversible. Otherwise decide, and record the decision in `docs/crystal-quest/DECISIONS.md`.
- Do not commit credentials. Provide `.env.example` files.

---

# 1. YOUR ROLE

Act as a professional game studio: Game Director, Game Designer, Phaser 3 developer, React/TypeScript developer, FastAPI developer, PostgreSQL architect, UI/UX designer, animation specialist, QA engineer, performance engineer, security engineer and DevOps engineer.

Design, build, test, optimise and deliver a complete, polished, browser-based Match-3 puzzle adventure that can be published at https://stratos.games. It must have its own identity, original mechanics, responsive interface and scalable architecture. Not a demo, tutorial project or prototype.

Do not copy Candy Crush or any copyrighted assets, artwork, characters, branding, sounds, level layouts or proprietary content. Use the genre only as a general reference for Match-3 gameplay.

# 2. PROJECT IDENTITY

- Name: CRYSTAL QUEST. Subtitle: THE LOST KINGDOM. Developer: STRATOS.GAMES.
- Genre: Match-3 puzzle + fantasy adventure. Platform: HTML5 browser game.
- Devices: desktop, Windows laptops, Android mobile browsers, iPhone Safari, tablets. Browsers: Chrome, Edge, Firefox, Safari.
- Audience: casual puzzle players worldwide (India, Europe, USA, international). Orientation: portrait-first, responsive.
- Visual style: bright, glowing, polished 2.5D fantasy with chunky outlines and faceted crystals (see the design package).
- Concept: an ancient Crystal Heart has been destroyed and six magical crystals scattered across worlds. The player completes Match-3 puzzles, collects energy, defeats enemies, restores kingdoms and recovers the Crystal Heart.
- Loop: Play level -> match crystals -> complete objectives -> earn stars and coins -> collect Crystal Energy -> restore kingdom -> unlock worlds -> new challenges.

# 3. TECHNICAL STACK

- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Game engine: Phaser 3 with TypeScript (scene management, tweens, input, audio).
- Backend: Python, FastAPI, Pydantic, SQLAlchemy. Database: PostgreSQL with Alembic migrations.
- Verification service: small Node/TypeScript service that replays moves with the shared engine package (see 0.2 item 5).
- Testing: Vitest, Playwright, Pytest. Deployment: Docker, Docker Compose, Nginx. API: REST with OpenAPI.

Architecture rule: the Phaser game engine and the pure Match-3 rules engine are independent of React. Put the rules engine in its own TypeScript package with no Phaser or DOM imports so that the browser, tests, the level bot and the verification service all share it.

React manages: website integration, launcher, menus, profile, world map, settings, shop, leaderboards, all non-board screens.
Phaser manages: board, movement, matching rendering, cascades, special crystals, blockers, gameplay animation, effects, boss presentation.
Rules engine manages: board state, matching, gravity, refill, scoring, objectives, boss mechanics (pure, deterministic, seeded).
FastAPI manages: accounts, progress, level data, inventory, rewards, achievements, leaderboards, daily challenges, analytics.

# 4. EXISTING PROJECT INSPECTION

Before writing code, inspect the existing STRATOS.GAMES repository: frontend and backend architecture, authentication, database, API conventions, routing, game-integration system, CSS and design system, deployment, naming conventions.

Do not overwrite existing files blindly. Do not create a second React app or FastAPI app if one exists. Reuse existing authentication and database infrastructure where appropriate. Build Crystal Quest as an independent game module. If the existing architecture differs from the stack above, document the difference and adapt without breaking the platform.

Before implementation create `docs/crystal-quest/PROJECT_ASSESSMENT.md` covering architecture, integration points, risks and strategy.

# 5. STORY AND CHARACTERS

Thousands of years ago six legendary crystals protected the Lost Kingdom. The Shadow Lord destroyed the Crystal Heart and scattered the crystals across the kingdoms. The player is the chosen Crystal Guardian.

Characters (art exists in the design package): Eldrin - Ancient Wizard; Luma - Magical Fairy; Arkon - Crystal Guardian; Nyra - Forest Guardian; Shadow Lord - main villain.

Requirements: character introduction screens, a dialogue system, idle animation (tween-based on the static art), victory expressions, story progression, character celebrations. Static art is Placeholder; expression sets are Missing (log them).

# 6. WORLDS

Ten worlds: 1 Crystal Valley (green valley, waterfalls, crystal caves, ancient bridges); 2 Frozen Mountains (snow, frozen lakes, ice castles, ice blockers); 3 Enchanted Forest (magic trees, hidden creatures, forest obstacles); 4 Lost Desert (temples, dunes, hidden treasure, sand obstacles); 5 Dragon Kingdom (volcanoes, lava rivers, dragon caves, fire obstacles); 6 Ocean Kingdom; 7 Sky Kingdom; 8 Dark Kingdom; 9 Celestial Kingdom; 10 Crystal Palace (legendary palace, final boss arena, Crystal Heart restoration, final Shadow Lord encounter).

Release one: worlds 1 to 5 playable, 20 levels each, 100 levels total. Worlds 6 to 10 appear on the world map as locked "Coming soon". Architecture must support ten worlds and 1,000+ levels (data-driven, lazy loaded).

# 7. MATCH-3 ENGINE (most important)

Build a robust, deterministic, seeded TypeScript rules engine.

- Default board 8x8. Support configurable dimensions, shapes, blocked cells, special cells and per-level crystal distributions.
- Basic crystals: Ruby (red), Sapphire (blue), Emerald (green), Topaz (yellow), Amethyst (purple), Diamond (white). Each: unique shape, colour and look, selection state, move/match/destroy animation, effects.
- Rules: select; swap adjacent; only valid swaps accepted; invalid swaps reverse automatically; valid swaps cost one move; match 3+; remove; gravity; refill; detect and process cascades; update objectives and score; check victory and failure.
- Never allow board input while a move is processing. Use a state machine: INITIALIZING, READY, SELECTING, SWAPPING, MATCHING, CLEARING, FALLING, REFILLING, CASCADING, CHECKING_OBJECTIVES, VICTORY, FAILURE, PAUSED.
- Input: touch swipe and tap-tap on mobile; mouse; keyboard (arrows to move the cursor, Space to select and swap, P to pause).
- Deadlock detection with automatic reshuffle (no hidden matches left). Initial boards and refills never start with pre-made matches; special generation must never create unfair or impossible boards.
- Avoid per-frame full-board scans; compute on state changes.

# 8. MATCH DETECTION

Horizontal, vertical, 3/4/5-match, L, T, cross, simultaneous matches, cascades, special interactions. Deterministic, independently testable, no visual logic inside. Separate board data models from rendering objects.

Unit tests for: horizontal, vertical, four, five, L, T, cross, multiple simultaneous, no-match, cascades, special combinations, blocker interactions.

# 9. SPECIAL CRYSTALS

Eight specials, using the creation rules in 0.2 item 1:
Ruby Bomb (nearby tiles), Lightning Crystal (row), Vertical Thunder (column), Rainbow Crystal (all of a colour), Crystal Nova (large area), Magic Star (multi-tile effect), Crystal Fish (targets blockers and objectives), Super Crystal (massive board effect).

Combinations: Lightning + Lightning; Rainbow + Ruby; Rainbow + Rainbow; Bomb + Lightning; Nova + Rainbow (creates Magic Star); Magic Star + any special. Define the exact effect of each in `docs/crystal-quest/SPECIALS.md`. Each combination needs correct behaviour, animation, sound, scoring and objective updates.

# 10. BLOCKERS

Ten blockers (art in the package): Ice Block, Stone Block, Crystal Cage, Magic Chain, Dark Crystal, Wooden Box, Lava Tile, Crystal Wall, Shadow Portal, Ancient Seal.

Each defines: health, destruction rules, movement rules, visual, animation, sound, interaction with each special crystal. All configurable in level data.

# 11. LEVEL OBJECTIVES

Types: Crystal Collection, Ice Breaker, Ancient Treasure, Forest Restoration, Magic Rescue, Crystal Path, Time Challenge, Boss Battle, Stone Breaker, Energy Collection, Portal Challenge, Mixed Challenge. Multiple simultaneous objectives per level (example: level 25 - collect 30 Emerald, destroy 10 Stone Blocks, within 35 moves). Flexible objective manager configured by JSON. Level schema and bot per 0.2 item 6.

# 12. BOOSTERS

Pre-game: Ruby Starter, Lightning Starter, Rainbow Starter, Magic Shield. In-game: Crystal Hammer, Magic Wand, Lightning Strike, Crystal Shuffle, Extra Moves, Rainbow Blast.

Needs inventory, activation logic, usage limits, icons (in the package), animation, sound, reward integration, server-side inventory validation. Boosters can be earned in play. Progression must never depend on purchases.

# 13. BOSS BATTLES

Independent, data-driven boss system. Release one: Stone Golem, Ice Dragon, Forest Witch. Future (data-ready): Sand Titan, Fire Dragon, Sea Serpent, Shadow Lord.

Mechanics: HP, attack patterns, player damage from matches, attack animations, special obstacles, victory/defeat, rewards. Example Ice Dragon: 100 HP, attacks every configured number of moves, freezes selected tiles, creates ice barriers, takes damage from crystal matches.

# 14. KINGDOM RESTORATION

Each world has restoration projects. Crystal Valley: Ancient Bridge, Wizard Tower, Magical Waterfall, Crystal Fountain, Crystal Fountain Court. Fields: name, required energy, progress, before asset, after asset, restoration animation, reward. Energy comes from level completion. The world visibly changes with progress. Before/after scenes are Missing art: build a tinted or desaturated-vs-colour treatment of the existing world backdrop and log it as Placeholder.

# 15. PLAYER PROGRESSION

Profile, player level, XP, completed levels, stars, gold coins, crystal shards, booster inventory, achievements, restoration progress, unlocked worlds. Stars: 1 = complete, 2 = higher score, 3 = highest score threshold (thresholds configurable per level). Persist across sessions. Guest play first; optional account linking via STRATOS.GAMES authentication. Never force registration before the first playable level.

# 16. REWARDS

Daily: Day 1 100 coins, Day 2 150 coins, Day 3 Crystal Hammer, Day 4 200 coins, Day 5 Lightning Booster, Day 6 300 coins, Day 7 Legendary Treasure Chest. Achievements: First Crystal, Crystal Master, Combo King, Treasure Hunter, Kingdom Builder, Dragon Slayer, Perfect Guardian. Server-side validation and duplicate-claim protection (idempotency keys, unique constraints, transactions).

# 17. DAILY CHALLENGES AND LEADERBOARDS

Daily Crystal Challenge: one special puzzle per day, unique config, score tracking, rewards. Weekly Tournament: identical challenge for all, highest score ranking, start/end times, reward distribution, anti-cheat (replay verification). Leaderboards: Global, Weekly, Monthly, Friends (shown locked until a social system exists). Guests use a persistent anonymous id.

# 18. UI/UX

Follow `UI_DESIGN_SPEC.md`, the tokens and the canvas. Bright colours, glowing crystals, rounded buttons, high-quality panels, clear type (Lilita One + Nunito), consistent spacing, excellent mobile usability. Never a generic dashboard look for gameplay.

Screens (all 18 required are mocked): Splash, Loading, Main Menu, World Map, Level Map, Level Introduction, Gameplay, Pause, Victory, Failure, Booster Shop, Daily Rewards, Achievements, Leaderboard, Player Profile, Settings, Kingdom Restoration, Boss Introduction. Plus the extra screens in 0.2 item 16.

Gameplay layout: top - level, objectives, moves, score; middle - board (the most important element); bottom - boosters and inventory; background - current world.

Mobile: portrait-first, touch-friendly, no horizontal scroll, safe areas, scalable board, touch targets of 44 px or more. Desktop: centred landscape layout with side panels and keyboard hints (see the Desktop Gameplay board). Accessibility: real buttons and links, `role="grid"` on the board, visible focus, text contrast checked, `prefers-reduced-motion` respected.

# 19. GRAPHICS AND ASSETS

Use the provided assets (0.1). Build in code: animations (idle, select, swap, match, destroy, gravity, special activation, character celebration, boss attack, restoration), VFX (explosion, glow, lightning, rainbow blast, fire, ice, restoration, boss attacks) with limited particle counts, texture atlases and spritesheets.

Maintain `docs/crystal-quest/ASSET_INVENTORY.md` in the repo (start from the provided one). Every asset: unique id, filename, category, dimensions, format, usage, loading priority, status (Production / Placeholder / Missing). Never present placeholders as finished.

# 20. SOUND

Dedicated AudioManager using the provided files (guidance in AUDIO_DESIGN.md): master/music/SFX volume buses, mute, no audio before the first user interaction, one music track at a time with about 600 ms cross-fade, loop all music except the victory theme, pitch-step cascade sounds, voice limit, pause on tab hide. Required SFX and music lists are covered by the provided files; world 6 to 10 music is Missing (reuse nothing silently; log it).

# 21. DATABASE

SQLAlchemy models and Alembic migrations for: users, player_profiles, game_worlds, game_levels, player_progress, player_inventory, player_achievements, player_rewards, daily_challenges, tournament_entries, leaderboard_scores, game_sessions, game_events, restoration_projects, player_restoration_progress. Add where needed: level_seeds / session seeds, move logs, consent records.

Use primary and foreign keys, unique constraints, indexes, timestamps (UTC), JSONB where appropriate, transactions, validation. Keep level configs separate from game logic. Seed data: five worlds and 100 levels.

# 22. BACKEND API

GAME: GET /api/game/worlds; GET /api/game/worlds/{world_id}; GET /api/game/levels/{level_id}; POST /api/game/start (returns seed); POST /api/game/complete (move list, server replay).
PLAYER: GET /api/player/profile; /progress; /inventory; /achievements.
REWARDS: GET /api/rewards/daily; POST /api/rewards/daily/claim; POST /api/rewards/claim.
BOOSTERS: GET /api/boosters; POST /api/boosters/use.
KINGDOM: GET /api/kingdom/progress; POST /api/kingdom/restore.
CHALLENGES: GET /api/challenges/daily; GET /api/leaderboard; POST /api/leaderboard/submit.
Also: consent, data deletion, guest-to-account merge.

Implement input validation, authentication, authorisation, rate limiting, error handling, logging, OpenAPI docs and transaction management. Never trust client-submitted scores, inventory or rewards.

# 23. SECURITY

Secure authentication, JWT validation, password hashing where local passwords exist, environment-based secrets, SQL injection prevention, input validation, CORS restrictions, rate limiting, server-side reward validation, duplicate-request protection, session validation, replay-based anti-cheat, secure DB access. No committed credentials. `.env.example` files.

# 24. ANALYTICS

Events (sent only after consent): game started, tutorial completed, level started/completed/failed/retried, booster used, special combination, boss defeated, world unlocked, reward claimed, session duration. KPIs: DAU, MAU, D1/D7/D30 retention, average session duration, levels per session, completion rate, retry rate, booster usage. Analytics service is expandable without touching the engine.

# 25. PERFORMANCE

Targets in 0.2 item 11. Implement texture atlases, object pooling, lazy loading, asset compression, limited particles, animation and scene cleanup, responsive scaling, reduced motion. Avoid excessive Phaser objects; destroy unused resources. Add a performance check (bundle-size budget in CI and a frame-time test on a throttled profile).

# 26. TESTING

Frontend: component, game integration, responsive layout, game loading. Engine: match detection, swap validation, gravity, cascades, specials, blockers, objectives, score, victory, failure, deadlock. Backend: API, authentication, database, reward validation, inventory, leaderboard, replay verification. E2E (Playwright, using `?seed=`): open game, start first level, complete a puzzle, receive rewards, save progress, reload, verify persistence. Test mobile and desktop viewports. Do not declare completion while critical tests fail.

# 27. PHASES

0 Assessment. 1 Foundation (game module, Phaser, React integration, loading scene, main menu, gameplay scene). 2 Core engine (level schema + validator + bot first; board generation, swapping, matching, gravity, refill, cascades, scoring, state machine). 3 Special gameplay (specials, combinations, blockers, objectives, boosters). 4 Content (five worlds, 100 levels, difficulty curve, world map, level select, tutorial). 5 Adventure (characters, story, restoration, boss battles, rewards, achievements). 6 Backend. 7 Polish. 8 Testing. 9 Deployment (Docker, Nginx, production build, env configuration, deployment docs).

THIS SESSION: Phases 0 to 2 only, then stop and report with test results and a demonstration of the core gameplay.

# 28. CODING STANDARDS

TypeScript strict mode; avoid `any`; clean modular architecture; reusable components; business logic separated from presentation; proper error handling; no duplicate code; descriptive names; document complex algorithms; follow existing project conventions; minimal dependencies; never overwrite unrelated files; never remove existing functionality without approval; no mock APIs as production implementations; environment variables outside source. Tests for every major feature.

# 29. DELIVERABLES

React integration; Phaser engine; working Match-3; 6 crystals; 8 special mechanics; 10 blocker mechanics; 5 worlds; 100 levels with progression; scoring and stars; boosters; boss framework; kingdom restoration; player progression; rewards; FastAPI integration; PostgreSQL and migrations; API docs; automated tests; Docker and Nginx configuration; developer docs; asset inventory; installation and production deployment instructions. Documentation under `docs/crystal-quest/`: PROJECT_ASSESSMENT, IMPLEMENTATION_PLAN, DECISIONS, ENGINE_API, SPECIALS, ECONOMY, ASSET_INVENTORY, API, DEPLOYMENT.

# 30. ACCEPTANCE CRITERIA

Gameplay: start without registration; first level completable (with tutorial); swapping, invalid-swap reversal, matches, cascades, specials, blockers, objectives, victory and failure all correct.
Content: five worlds; 100 playable data-driven levels; progressive difficulty; every level objective achievable (bot win rate within band).
Experience: mobile and desktop layouts work; smooth animation; sound controls; reliable loading; progress persists; consent flow works.
Backend: APIs work; migrations succeed; rewards validated by replay; progress persists; duplicate claims prevented.
Quality: no critical console or backend errors; automated tests pass; production build succeeds; no broken asset references; bundle within budget; no unresolved critical bugs.

# 31. HOW TO WORK

1 Inspect the repository. 2 Write PROJECT_ASSESSMENT.md. 3 Write IMPLEMENTATION_PLAN.md with milestones. 4 Create folder structure and import the design package. 5 Implement Phases 1 and 2. 6 Run tests and demonstrate core gameplay. 7 Report and stop. After each phase later: run tests, fix, review architecture, update docs, report done and remaining. Do not mark placeholders complete. If a dependency, service or asset is unavailable, state the limitation and use the best safe local alternative. Write working code.

# 32. FIRST EXECUTION INSTRUCTION

Start by inspecting the complete STRATOS.GAMES repository and `design/crystal-quest/`. Do not generate all game code immediately. First: inspect the codebase; identify integration architecture, dependencies, reusable components and conflicts; create PROJECT_ASSESSMENT.md and IMPLEMENTATION_PLAN.md; propose the folder structure; present the first milestone. Then implement Phases 1 and 2 and stop for a report.

Priority: a polished, fully functional, deterministic Match-3 engine that is the foundation for the whole adventure. Final objective: a commercially presentable, original, high-quality browser game for STRATOS.GAMES. Prioritise gameplay quality, player experience, maintainability, performance and scalability.
