# Stratos Drop Zone (Battle Royale)

A low-poly battle royale on Vayu Island. Drop in, loot, and outlast 23 bots before the Monsoon Wall closes. Runs in a phone or desktop browser, fully offline once loaded.

## Run it

    cd games/sksarfarajali-battle-royale/source
    npm install
    npm run dev        # http://localhost:5173
    npm test           # rules and world tests
    npm run build      # writes the playable game into the box folder one level up

Re-bake colliders after changing models: `node tools/bake-colliders.mjs`.

## Layout

- `src/balance.json`: every gameplay number (damage, timers, prices, speeds).
- `src/core/`: world generation, collision and movement, and pure rules (damage, armour, inventory, kiosk, barrier, zone). Tested with Vitest.
- `src/game/`: the match (`game.ts`), bots with A* (`bots.ts`), loot tables.
- `src/render/`: models, scene, procedural character animation, icons.
- `src/ui/`: Preact menus and HUD. `src/audio.ts`: procedural Web Audio.
- `public/models/`: the 82 low-poly models. `public/art/`: survivor portraits.

## What works

Lobby, Solo (24 players) and Training, plane flight and jump, skydive and glide, island with 10 locations, loot with rarity, all 7 weapons, grenades, smoke, barriers, healing, armour, kiosks and tokens, bots (drop, loot, rotate, engage, heal, flee), the six-phase Monsoon Wall, supply crates, results screen with XP, settings, touch and keyboard controls, procedural sound and music.

## Not in this version

Online multiplayer (needs a server), accounts, leaderboards, the coast buggy and survivor perks. See `DECISIONS.md`.

Controls: WASD move, mouse look, click fire, right-click aim, R reload, Space jump, C crouch, Shift sprint, F pick up, 1-4 weapons, G grenade, B barrier, H heal, Tab pack, M map, Esc pause. On a phone: left thumb moves, right thumb looks, buttons on the right.
