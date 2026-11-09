# Crystal Quest - UI Design Spec

Visual reference: the Design canvas (20 boards) at https://claude.ai/artifact/9M2vqdcDWswQZnNqM1gJid . Tokens: `design-tokens.css` / `design-tokens.json`. All numbers on the screens (Level 8, 24 moves, 3,240 score, coin counts) are **sample data**.

## Direction
Bright, glowing, portrait-first 2.5D fantasy: chunky dark-ink outlines, glossy gradients, faceted crystals, soft glow. Original design; nothing is taken from other match-3 games. The interface stays bright even over dark world backdrops.

## Foundations
- Design sizes: portrait 390x844, desktop 1280x800. Board is 8x8; cell about 40 px on phones, 60 px on desktop.
- Colours: Ink #1B1033, Violet #3B2A86, Bright violet #7B5CFF, Mint #1FBF6A (button fill #0F8A46 for white-text contrast), Gold #F5A31A, Sky #2F7BFF, Ruby #E5324B, Cyan #7DF3EC.
- Type: Lilita One for headings and numbers, Nunito 700/800 for body. Minimum 12 px on game screens.
- Shapes: pill buttons (4 px ink border, 6 px hard drop shadow), panels with 28 px radius and 5 px ink border, icon buttons 52 px square, radius 16.
- Gem identity is by shape as well as colour (each crystal has a unique outline) so the game is playable for colour-blind players.

## Screens (one board each in the canvas)
1. Loading - logo emblem, progress bar, Luma tip.
2. Main menu - logo, Play (primary), Map, Daily Rewards, Shop, Settings, profile and currency strip.
3. World map - scrolling path of level nodes, stars per node, boss and locked markers, "Coming soon" worlds 6 to 10.
4. Level selection - world header, grid of level nodes with stars.
5. Gameplay - top bar (pause, level, sound), moves and score, objectives, 8x8 board, booster bar.
6. Pause - resume, restart, settings, quit.
7. Level complete - stars, score, rewards, Next and Replay.
8. Level failed - retry, +5 moves offer, quit.
9. Boss battle - boss portrait with health, board, moves.
10. Boss victory.
11. Daily rewards - 7-day calendar, claim.
12. Shop - boosters, coin packs (sample prices), no progression gated behind purchase.
13. Achievements.
14. Leaderboard - Global and Weekly tabs; Friends tab shown locked.
15. Settings - music, SFX, language, accessibility toggles.
16. Profile - avatar, stats, linked account state.
17. Restoration progress - before/after kingdom project, shard cost.
18. Story / character intro.
Extra boards: Desktop gameplay with keyboard hints (arrows, space, P) and a Style Guide.

## Interaction and accessibility
- Touch targets 44 px or more; every control is a real `button` or `a`; board has `role="grid"`.
- Keyboard play: arrows move the cursor, Space selects and swaps, P pauses.
- Selection is shown with an animated outline (static under `prefers-reduced-motion`).
- Text contrast checked against its background; white text on mint uses #0F8A46.
- Never allow input while a move is resolving (per the master prompt).

## Not yet designed
Tutorial hint overlays, Daily Crystal Challenge, Weekly Tournament, treasure chest opening, consent and privacy screen, account linking. See PROMPT_REVIEW.md item 9.
