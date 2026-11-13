# Stratos Drop Zone

A low-poly battle royale on Vayu Island. Drop in, loot, and outlast 23 bots before the Monsoon Wall closes. Runs in a phone or desktop browser, fully offline once loaded.

## Run it

    cd games/sksarfarajali-stratos-drop-zone/source
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

## UI art

The screens use the pictures in `public/ui/` (lobby, loading, results and Locker). They are copied from the `Artifacts_GameReady` folder by `tools/copy-ui-art.ts`, which runs before `npm run dev` and `npm run build`. To use another folder, set `UI_ART_DIR`. `tools/make-og.ts` then builds `og-image.png` (1200 x 630) for link sharing.

- **Lobby:** island background, image cards for Solo, Training and Squad (locked), and the Season 2 "Ember Isle" teaser.
- **Loading:** a random picture (never the same twice in a row), the drop spot, a rotating tip from `src/data/tips.json`, and a progress bar.
- **Results:** the hero picture. A loss uses the same picture, desaturated and darker.
- **Locker:** outfits. Four survivors by default, plus Chrome Vanguard (Legendary, level 10) and Ember Vanguard (Epic, level 5). Cosmetic only.
- **Drop marker:** during the flight, tap the map (or press V) near Salt Docks, Radar Ridge or Rail Yard to see that place's card for 3 seconds.

All text is live HTML on top of the pictures. UI artwork was generated with AI tools and edited for Stratos Drop Zone (see Settings and About).
