# Decisions

Where the build prompt was silent or could not be followed inside a stratos.games box, this is what was chosen and why.

| # | Decision | Why |
|---|---|---|
| 1 | **Offline single-player vs bots**, no Colyseus server | A box on stratos.games is static files only. The server, 20 Hz netcode, matchmaking and regions need hosting the site does not have. Match rules live in `src/core/rules.ts` as pure functions, so they can move to a server later. |
| 2 | One Vite project in `source/`, not a pnpm monorepo | Only one folder is allowed per game, and nothing else needs a workspace. `balance.json` is the single home for every gameplay number. |
| 3 | Built files go in the box root; source stays in `source/` | `npm run build` writes `index.html`, `assets/`, `models/` and `art/` one level up. |
| 4 | Models are copied into `source/public/models/` once and committed | The site needs everything inside the folder (works offline). The originals are untouched. |
| 5 | Terrain: 129 x 129 heightmap, seeded, with flat pads under every building | Same island every run. Buildings never sit on a slope. |
| 6 | Static scenery merged into one mesh per 80 m cell | A few draw calls instead of thousands. One shared vertex-colour material. |
| 7 | Colliders baked by `tools/bake-colliders.mjs` from the GLBs (axis-aligned faces become thin slabs, props use one box) | Gives walls, floors, roofs and stairs without a physics engine. Sloped roofs are not solid. Building yaw is snapped to 90 degrees so boxes stay axis-aligned. |
| 8 | Rays use the shared box colliders plus a terrain march, not three-mesh-bvh | Same code can run on a server later; boxes are already cheap. |
| 9 | Fonts fall back to the system font stack | A web font would be a request to another site. Chakra Petch and Inter apply if installed. |
| 10 | (Replaced by decision 21) The lobby used to show a 3D survivor turntable; it now shows the island picture, as in the mockup | The survivor is still chosen under Survivors and equipped in the Locker. |
| 11 | Region buttons, live ping and leaderboards are left out | There is no server to ping. The lobby says "Offline match". Stats are stored on the device. |
| 12 | Training spawns just outside the Old Sea Fort's south wall | The fort walls block shots at the dummy rows if you spawn inside. |
| 13 | Perks (`perksEnabled`) and the coast buggy (`vehiclesEnabled`) stay off | As specified for v1. |
| 14 | Analytics: only the shared Stratos `track()` (`level_start`, `level_complete`, `game_over`, `weapon_picked`) | Site rule: no other tracking. |
| 15 | No ads yet | The site says ads are not live. Plan: a rewarded "second chance" at the moment of loss. |
| 16 | UI art comes from `Artifacts_GameReady/` through `tools/copy-ui-art.ts`, which writes `public/ui/` and `src/data/ui_assets.json` (the `ui` group of the asset manifest) | The script runs before `npm run dev` and `npm run build`. If the source folder is missing it keeps the copy already committed in `public/ui/`, so the repo builds anywhere. Set `UI_ART_DIR` to point at another folder. |
| 17 | `Artifacts/Image3.png` and every raw image in `Artifacts/` are never used | Its storm dome, chest and blueprint wall look too much like another battle royale. The copy script refuses to copy from any `Artifacts` folder or any `ImageN` file, and a test checks it. |
| 18 | Every image has a `.webp` (used first) and a `.jpg` fallback, through `<picture>` | Only the lobby background is preloaded (1280 on phones, 1920 on desktop, both under 250 KB). Everything else loads when its screen is shown. First load stays far under 20 MB. |
| 19 | Matchmaking is simulated offline: the player count climbs to 24 in about 6 seconds, with a Start now button | There is no server to find players on. The slots are filled by bots and the screen says so ("Bots fill the empty slots"). Only Solo shows it. Training and Demo start at once. |
| 20 | "Harbour Road" (loading image 02) is shown as a High loot spot | It is not a named place on Vayu Island. It matches the Rail Yard side of the map, which is a High tier place, and the drop marker uses its card for the Rail Yard. |
| 21 | The lobby has no 3D survivor and no server list | The picture of the island is the focus, as in the mockup. There are no real servers to list, so that column shows the offline match options instead. The 3D view is not drawn at all while the lobby is open, which saves battery. |
| 22 | The Vanguard outfits are cosmetic only | They change the avatar, the lobby card and the results portrait. **TODO: make a matching low-poly Vanguard model (or recolour a survivor) so the outfit can show in the 3D match.** Until then the in-match model is the selected survivor. |
| 23 | Unlock levels live in `balance.json` under `outfits` (Chrome Vanguard level 10, Ember Vanguard level 5) | The mockup said level 20 for a third card, but the brief gave 10 and 5, so those are used. The equipped outfit is saved in the profile (`sdz-profile`) and a locked outfit is never shown as equipped. |
| 24 | Screen sizes use `em` tied to the screen height | One layout from the 844 x 390 mockups scales up to 1920 x 1080 without separate rules. |
| 25 | The blurred menu picture is set as a CSS variable at start-up | Every panel (Settings, Ranks, Missions, About, pause) shares it, and the file is only fetched when a panel is shown. |
| 26 | `sharp` is a build-time dependency for the share image, and `@types/node` is for types only | `tools/make-og.ts` draws the title on `social/og_base_1200x630.webp` to make `og-image.png` (1200 x 630). Nothing from either goes into the game itself. Node 24 runs the `.ts` tools directly. |
| 27 | Ken Burns: a slow 20 second zoom from 1.0 to 1.05 on background pictures | Switched off when Reduce Motion is on (the setting or the system preference). |
