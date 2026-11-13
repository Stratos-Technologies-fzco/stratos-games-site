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
| 10 | Lobby shows the survivor concept art instead of a 3D turntable | Keeps the lobby light on phones. The island flies past behind the menu. |
| 11 | Region buttons, live ping and leaderboards are left out | There is no server to ping. The lobby says "Offline match". Stats are stored on the device. |
| 12 | Training spawns just outside the Old Sea Fort's south wall | The fort walls block shots at the dummy rows if you spawn inside. |
| 13 | Perks (`perksEnabled`) and the coast buggy (`vehiclesEnabled`) stay off | As specified for v1. |
| 14 | Analytics: only the shared Stratos `track()` (`level_start`, `level_complete`, `game_over`, `weapon_picked`) | Site rule: no other tracking. |
| 15 | No ads yet | The site says ads are not live. Plan: a rewarded "second chance" at the moment of loss. |
