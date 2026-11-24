# ASSET_MANIFEST — STRATOS FARM: My Dream Village

Every asset that ships with the game. Produced to the art direction and asset policy in CLAUDE.md (policy option 2: original programmatically drawn art in one consistent style). No third-party art, no emoji, no copied assets.

**Status key:** `v1` = original programmatic art at production quality, eligible to ship; replace freely if the owner supplies art later. Nothing here is `TEMP`.

## Conventions

- Isometric 2:1, tile 128×64, light from the top-left, soft shadow to the bottom-right, dark-brown outline `#3B2A1E`.
- `anchor` = pixel inside the frame that sits on the **top vertex of the object's footprint diamond** (the grid-to-screen point for its origin tile). Phaser: atlas frames carry it as a normalized `anchor` (and `pivot`), which Phaser 3 stores as the frame custom pivot; call `setOriginFromFrame()` on each sprite, or `setOrigin(ax/w, ay/h)` for single images.
- Footprints: crops/terrain/decor 1×1; production buildings and habitats 2×2; farmhouse and barn 3×3; silo 1×1.
- Animals and characters face down-left. Mirror with `setFlipX(true)` for down-right.
- Runtime loading: `public/assets/farm/asset-manifest.json` lists the atlases, standalone images and audio (OGG first, MP3 fallback for Safari).
- Load budget: the atlases total about 1064 KB. Load music lazily after the first frame (about 1.5 MB OGG), so the first load stays well under 5 MB.
- More art (onion, blueberry, peanut, lavender, turkey, rabbit, horse and their homes and icons) is drawn by `art/more_art.py`, rendered with Chromium by `art/render.mjs` and merged into the atlases by `art/pack_more.py`.
- Regenerate: `cd tools/asset-gen && python3 build_all.py` (needs Python 3, numpy, scipy, Pillow, `rsvg-convert`, ffmpeg).

## Atlases

| Key | Image | Size | Frames | KB |
|---|---|---|---|---|
| atlas_terrain | `assets/farm/atlases/atlas_terrain.png` | 512×494 | 20 | 32.1 |
| atlas_crops | `assets/farm/atlases/atlas_crops.png` | 1024×1300 | 64 | 359.2 |
| atlas_animals | `assets/farm/atlases/atlas_animals.png` | 512×770 | 45 | 103.5 |
| atlas_buildings | `assets/farm/atlases/atlas_buildings.png` | 1024×1660 | 15 | 185.4 |
| atlas_habitats | `assets/farm/atlases/atlas_habitats.png` | 1024×708 | 9 | 125.1 |
| atlas_decor | `assets/farm/atlases/atlas_decor.png` | 512×708 | 21 | 60.5 |
| atlas_characters | `assets/farm/atlases/atlas_characters.png` | 512×970 | 34 | 159.6 |
| atlas_icons | `assets/farm/atlases/atlas_icons.png` | 512×726 | 73 | 118.3 |
| atlas_ui_fx | `assets/farm/atlases/atlas_ui_fx.png` | 512×974 | 45 | 95.4 |

## Terrain tiles and cursors (20)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| cursor_hover | `public/assets/farm/terrain/cursor_hover.png` | 128×64 | 1 | 64,0 | atlas_terrain | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| cursor_select | `public/assets/farm/terrain/cursor_select.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| dirt | `public/assets/farm/terrain/dirt.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| edge_left | `public/assets/farm/terrain/edge_left.png` | 128×96 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| edge_right | `public/assets/farm/terrain/edge_right.png` | 128×96 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| field_paddy | `public/assets/farm/terrain/field_paddy.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| field_plowed | `public/assets/farm/terrain/field_plowed.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| grass_1 | `public/assets/farm/terrain/grass_1.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| grass_2 | `public/assets/farm/terrain/grass_2.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| grass_3 | `public/assets/farm/terrain/grass_3.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| grass_flowers | `public/assets/farm/terrain/grass_flowers.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| locked_land | `public/assets/farm/terrain/locked_land.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| path_dirt | `public/assets/farm/terrain/path_dirt.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| path_stone | `public/assets/farm/terrain/path_stone.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| place_bad | `public/assets/farm/terrain/place_bad.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| place_ok | `public/assets/farm/terrain/place_ok.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| sand | `public/assets/farm/terrain/sand.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| water_0 | `public/assets/farm/terrain/water_0.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| water_1 | `public/assets/farm/terrain/water_1.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |
| water_2 | `public/assets/farm/terrain/water_2.png` | 128×64 | 1 | 64,0 | atlas_terrain | same | same | v1 |

## Crops (stages 0 planted · 1 sprout · 2 growing · 3 ready) (64)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| cabbage_0 | `public/assets/farm/crops/cabbage_0.png` | 128×128 | planted | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| cabbage_1 | `public/assets/farm/crops/cabbage_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| cabbage_2 | `public/assets/farm/crops/cabbage_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| cabbage_3 | `public/assets/farm/crops/cabbage_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| carrot_0 | `public/assets/farm/crops/carrot_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| carrot_1 | `public/assets/farm/crops/carrot_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| carrot_2 | `public/assets/farm/crops/carrot_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| carrot_3 | `public/assets/farm/crops/carrot_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| corn_0 | `public/assets/farm/crops/corn_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| corn_1 | `public/assets/farm/crops/corn_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| corn_2 | `public/assets/farm/crops/corn_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| corn_3 | `public/assets/farm/crops/corn_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| cotton_0 | `public/assets/farm/crops/cotton_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| cotton_1 | `public/assets/farm/crops/cotton_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| cotton_2 | `public/assets/farm/crops/cotton_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| cotton_3 | `public/assets/farm/crops/cotton_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| potato_0 | `public/assets/farm/crops/potato_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| potato_1 | `public/assets/farm/crops/potato_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| potato_2 | `public/assets/farm/crops/potato_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| potato_3 | `public/assets/farm/crops/potato_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| pumpkin_0 | `public/assets/farm/crops/pumpkin_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| pumpkin_1 | `public/assets/farm/crops/pumpkin_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| pumpkin_2 | `public/assets/farm/crops/pumpkin_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| pumpkin_3 | `public/assets/farm/crops/pumpkin_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| rice_0 | `public/assets/farm/crops/rice_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| rice_1 | `public/assets/farm/crops/rice_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| rice_2 | `public/assets/farm/crops/rice_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| rice_3 | `public/assets/farm/crops/rice_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| strawberry_0 | `public/assets/farm/crops/strawberry_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| strawberry_1 | `public/assets/farm/crops/strawberry_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| strawberry_2 | `public/assets/farm/crops/strawberry_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| strawberry_3 | `public/assets/farm/crops/strawberry_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| sugarcane_0 | `public/assets/farm/crops/sugarcane_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| sugarcane_1 | `public/assets/farm/crops/sugarcane_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| sugarcane_2 | `public/assets/farm/crops/sugarcane_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| sugarcane_3 | `public/assets/farm/crops/sugarcane_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| sunflower_0 | `public/assets/farm/crops/sunflower_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| sunflower_1 | `public/assets/farm/crops/sunflower_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| sunflower_2 | `public/assets/farm/crops/sunflower_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| sunflower_3 | `public/assets/farm/crops/sunflower_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| tomato_0 | `public/assets/farm/crops/tomato_0.png` | 128×128 | planted; raised bed, v1.1 | 64,64 | atlas_crops | same | same | v1.1 |
| tomato_1 | `public/assets/farm/crops/tomato_1.png` | 128×128 | sprout; raised bed, v1.1 | 64,64 | atlas_crops | same | same | v1.1 |
| tomato_2 | `public/assets/farm/crops/tomato_2.png` | 128×128 | growing; raised bed, v1.1 | 64,64 | atlas_crops | same | same | v1.1 |
| tomato_3 | `public/assets/farm/crops/tomato_3.png` | 128×128 | ready; raised bed, v1.1 | 64,64 | atlas_crops | same | same | v1.1 |
| wheat_0 | `public/assets/farm/crops/wheat_0.png` | 128×128 | planted | 64,64 | atlas_crops | same | same | v1 |
| wheat_1 | `public/assets/farm/crops/wheat_1.png` | 128×128 | sprout | 64,64 | atlas_crops | same | same | v1 |
| wheat_2 | `public/assets/farm/crops/wheat_2.png` | 128×128 | growing | 64,64 | atlas_crops | same | same | v1 |
| wheat_3 | `public/assets/farm/crops/wheat_3.png` | 128×128 | ready | 64,64 | atlas_crops | same | same | v1 |
| onion_0 | `public/assets/farm/crops/onion_0.png` | 128×128 | planted | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| onion_1 | `public/assets/farm/crops/onion_1.png` | 128×128 | sprout | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| onion_2 | `public/assets/farm/crops/onion_2.png` | 128×128 | growing | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| onion_3 | `public/assets/farm/crops/onion_3.png` | 128×128 | ready | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| blueberry_0 | `public/assets/farm/crops/blueberry_0.png` | 128×128 | planted | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| blueberry_1 | `public/assets/farm/crops/blueberry_1.png` | 128×128 | sprout | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| blueberry_2 | `public/assets/farm/crops/blueberry_2.png` | 128×128 | growing | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| blueberry_3 | `public/assets/farm/crops/blueberry_3.png` | 128×128 | ready | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| peanut_0 | `public/assets/farm/crops/peanut_0.png` | 128×128 | planted | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| peanut_1 | `public/assets/farm/crops/peanut_1.png` | 128×128 | sprout | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| peanut_2 | `public/assets/farm/crops/peanut_2.png` | 128×128 | growing | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| peanut_3 | `public/assets/farm/crops/peanut_3.png` | 128×128 | ready | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| lavender_0 | `public/assets/farm/crops/lavender_0.png` | 128×128 | planted | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| lavender_1 | `public/assets/farm/crops/lavender_1.png` | 128×128 | sprout | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| lavender_2 | `public/assets/farm/crops/lavender_2.png` | 128×128 | growing | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| lavender_3 | `public/assets/farm/crops/lavender_3.png` | 128×128 | ready | 64,64 | atlas_crops | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |

## Animals (5 frames each) (45)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| chicken_eat | `public/assets/farm/animals/chicken_eat.png` | 64×64 | eat | 32,56 | atlas_animals | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| chicken_idle_0 | `public/assets/farm/animals/chicken_idle_0.png` | 64×64 | idle_0 | 32,56 | atlas_animals | same | same | v1 |
| chicken_idle_1 | `public/assets/farm/animals/chicken_idle_1.png` | 64×64 | idle_1 | 32,56 | atlas_animals | same | same | v1 |
| chicken_walk_0 | `public/assets/farm/animals/chicken_walk_0.png` | 64×64 | walk_0 | 32,56 | atlas_animals | same | same | v1 |
| chicken_walk_1 | `public/assets/farm/animals/chicken_walk_1.png` | 64×64 | walk_1 | 32,56 | atlas_animals | same | same | v1 |
| cow_eat | `public/assets/farm/animals/cow_eat.png` | 112×96 | eat | 56,88 | atlas_animals | same | same | v1 |
| cow_idle_0 | `public/assets/farm/animals/cow_idle_0.png` | 112×96 | idle_0 | 56,88 | atlas_animals | same | same | v1 |
| cow_idle_1 | `public/assets/farm/animals/cow_idle_1.png` | 112×96 | idle_1 | 56,88 | atlas_animals | same | same | v1 |
| cow_walk_0 | `public/assets/farm/animals/cow_walk_0.png` | 112×96 | walk_0 | 56,88 | atlas_animals | same | same | v1 |
| cow_walk_1 | `public/assets/farm/animals/cow_walk_1.png` | 112×96 | walk_1 | 56,88 | atlas_animals | same | same | v1 |
| duck_eat | `public/assets/farm/animals/duck_eat.png` | 72×64 | eat | 36,56 | atlas_animals | same | same | v1 |
| duck_idle_0 | `public/assets/farm/animals/duck_idle_0.png` | 72×64 | idle_0 | 36,56 | atlas_animals | same | same | v1 |
| duck_idle_1 | `public/assets/farm/animals/duck_idle_1.png` | 72×64 | idle_1 | 36,56 | atlas_animals | same | same | v1 |
| duck_walk_0 | `public/assets/farm/animals/duck_walk_0.png` | 72×64 | walk_0 | 36,56 | atlas_animals | same | same | v1 |
| duck_walk_1 | `public/assets/farm/animals/duck_walk_1.png` | 72×64 | walk_1 | 36,56 | atlas_animals | same | same | v1 |
| goat_eat | `public/assets/farm/animals/goat_eat.png` | 96×88 | eat | 48,80 | atlas_animals | same | same | v1 |
| goat_idle_0 | `public/assets/farm/animals/goat_idle_0.png` | 96×88 | idle_0 | 48,80 | atlas_animals | same | same | v1 |
| goat_idle_1 | `public/assets/farm/animals/goat_idle_1.png` | 96×88 | idle_1 | 48,80 | atlas_animals | same | same | v1 |
| goat_walk_0 | `public/assets/farm/animals/goat_walk_0.png` | 96×88 | walk_0 | 48,80 | atlas_animals | same | same | v1 |
| goat_walk_1 | `public/assets/farm/animals/goat_walk_1.png` | 96×88 | walk_1 | 48,80 | atlas_animals | same | same | v1 |
| pig_eat | `public/assets/farm/animals/pig_eat.png` | 96×80 | eat | 48,72 | atlas_animals | same | same | v1 |
| pig_idle_0 | `public/assets/farm/animals/pig_idle_0.png` | 96×80 | idle_0 | 48,72 | atlas_animals | same | same | v1 |
| pig_idle_1 | `public/assets/farm/animals/pig_idle_1.png` | 96×80 | idle_1 | 48,72 | atlas_animals | same | same | v1 |
| pig_walk_0 | `public/assets/farm/animals/pig_walk_0.png` | 96×80 | walk_0 | 48,72 | atlas_animals | same | same | v1 |
| pig_walk_1 | `public/assets/farm/animals/pig_walk_1.png` | 96×80 | walk_1 | 48,72 | atlas_animals | same | same | v1 |
| sheep_eat | `public/assets/farm/animals/sheep_eat.png` | 96×80 | eat | 48,72 | atlas_animals | same | same | v1 |
| sheep_idle_0 | `public/assets/farm/animals/sheep_idle_0.png` | 96×80 | idle_0 | 48,72 | atlas_animals | same | same | v1 |
| sheep_idle_1 | `public/assets/farm/animals/sheep_idle_1.png` | 96×80 | idle_1 | 48,72 | atlas_animals | same | same | v1 |
| sheep_walk_0 | `public/assets/farm/animals/sheep_walk_0.png` | 96×80 | walk_0 | 48,72 | atlas_animals | same | same | v1 |
| sheep_walk_1 | `public/assets/farm/animals/sheep_walk_1.png` | 96×80 | walk_1 | 48,72 | atlas_animals | same | same | v1 |
| turkey_idle_0 | `public/assets/farm/animals/turkey_idle_0.png` | 80×72 | idle_0 | 40,64 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| turkey_idle_1 | `public/assets/farm/animals/turkey_idle_1.png` | 80×72 | idle_1 | 40,64 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| turkey_eat | `public/assets/farm/animals/turkey_eat.png` | 80×72 | eat | 40,64 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| turkey_walk_0 | `public/assets/farm/animals/turkey_walk_0.png` | 80×72 | walk_0 | 40,64 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| turkey_walk_1 | `public/assets/farm/animals/turkey_walk_1.png` | 80×72 | walk_1 | 40,64 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| rabbit_idle_0 | `public/assets/farm/animals/rabbit_idle_0.png` | 72×64 | idle_0 | 36,56 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| rabbit_idle_1 | `public/assets/farm/animals/rabbit_idle_1.png` | 72×64 | idle_1 | 36,56 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| rabbit_eat | `public/assets/farm/animals/rabbit_eat.png` | 72×64 | eat | 36,56 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| rabbit_walk_0 | `public/assets/farm/animals/rabbit_walk_0.png` | 72×64 | walk_0 | 36,56 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| rabbit_walk_1 | `public/assets/farm/animals/rabbit_walk_1.png` | 72×64 | walk_1 | 36,56 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| horse_idle_0 | `public/assets/farm/animals/horse_idle_0.png` | 120×104 | idle_0 | 60,96 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| horse_idle_1 | `public/assets/farm/animals/horse_idle_1.png` | 120×104 | idle_1 | 60,96 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| horse_eat | `public/assets/farm/animals/horse_eat.png` | 120×104 | eat | 60,96 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| horse_walk_0 | `public/assets/farm/animals/horse_walk_0.png` | 120×104 | walk_0 | 60,96 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| horse_walk_1 | `public/assets/farm/animals/horse_walk_1.png` | 120×104 | walk_1 | 60,96 | atlas_animals | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |

## Buildings (15)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| bakery | `public/assets/farm/buildings/bakery.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| barn | `public/assets/farm/buildings/barn.png` | 400×382 | footprint 3x3; storage | 200,182 | atlas_buildings | same | same | v1 |
| construction_2x2 | `public/assets/farm/buildings/construction_2x2.png` | 272×264 | footprint 2x2; under construction / upgrading | 136,128 | atlas_buildings | same | same | v1 |
| dairy | `public/assets/farm/buildings/dairy.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | same | same | v1 |
| farmhouse | `public/assets/farm/buildings/farmhouse.png` | 400×372 | footprint 3x3 | 200,172 | atlas_buildings | same | same | v1 |
| feed_mill | `public/assets/farm/buildings/feed_mill.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | same | same | v1 |
| flour_mill_0 | `public/assets/farm/buildings/flour_mill_0.png` | 272×354 | footprint 2x2; production; 4-frame blade loop | 136,218 | atlas_buildings | same | same | v1 |
| flour_mill_1 | `public/assets/farm/buildings/flour_mill_1.png` | 272×354 | footprint 2x2; production; 4-frame blade loop | 136,218 | atlas_buildings | same | same | v1 |
| flour_mill_2 | `public/assets/farm/buildings/flour_mill_2.png` | 272×354 | footprint 2x2; production; 4-frame blade loop | 136,218 | atlas_buildings | same | same | v1 |
| flour_mill_3 | `public/assets/farm/buildings/flour_mill_3.png` | 272×354 | footprint 2x2; production; 4-frame blade loop | 136,218 | atlas_buildings | same | same | v1 |
| jam_kitchen | `public/assets/farm/buildings/jam_kitchen.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | same | same | v1 |
| juice_press | `public/assets/farm/buildings/juice_press.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | same | same | v1 |
| silo | `public/assets/farm/buildings/silo.png` | 96×200 | footprint 1x1; storage | 48,136 | atlas_buildings | same | same | v1 |
| sugar_mill | `public/assets/farm/buildings/sugar_mill.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | same | same | v1 |
| textile_mill | `public/assets/farm/buildings/textile_mill.png` | 272×280 | footprint 2x2; production | 136,144 | atlas_buildings | same | same | v1 |

## Animal habitats (9)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| chicken_coop | `public/assets/farm/habitats/chicken_coop.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| cow_pasture | `public/assets/farm/habitats/cow_pasture.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | same | same | v1 |
| duck_pond | `public/assets/farm/habitats/duck_pond.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | same | same | v1 |
| goat_yard | `public/assets/farm/habitats/goat_yard.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | same | same | v1 |
| pig_pen | `public/assets/farm/habitats/pig_pen.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | same | same | v1 |
| sheep_pen | `public/assets/farm/habitats/sheep_pen.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | same | same | v1 |
| turkey_pen | `public/assets/farm/habitats/turkey_pen.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| rabbit_hutch | `public/assets/farm/habitats/rabbit_hutch.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| horse_stable | `public/assets/farm/habitats/horse_stable.png` | 272×234 | footprint 2x2; animal habitat | 136,98 | atlas_habitats | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |

## Decor and obstacles (21)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| bench | `public/assets/farm/decor/bench.png` | 96×72 | footprint 1x1 | 48,30 | atlas_decor | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| bush | `public/assets/farm/decor/bush.png` | 128×96 | footprint 1x1 | 64,64 | atlas_decor | same | same | v1 |
| bush_berry | `public/assets/farm/decor/bush_berry.png` | 128×96 | footprint 1x1 | 64,64 | atlas_decor | same | same | v1 |
| fence_x | `public/assets/farm/decor/fence_x.png` | 128×64 | footprint 1x1 | 64,8 | atlas_decor | same | same | v1 |
| fence_y | `public/assets/farm/decor/fence_y.png` | 128×64 | footprint 1x1 | 64,8 | atlas_decor | same | same | v1 |
| flowers | `public/assets/farm/decor/flowers.png` | 128×96 | footprint 1x1 | 64,32 | atlas_decor | same | same | v1 |
| hay_bale | `public/assets/farm/decor/hay_bale.png` | 96×72 | footprint 1x1 | 48,30 | atlas_decor | same | same | v1 |
| lamp_post | `public/assets/farm/decor/lamp_post.png` | 64×128 | footprint 1x1 | 32,88 | atlas_decor | same | same | v1 |
| log_pile | `public/assets/farm/decor/log_pile.png` | 128×80 | footprint 1x1 | 64,36 | atlas_decor | same | same | v1 |
| mailbox | `public/assets/farm/decor/mailbox.png` | 64×80 | footprint 1x1 | 32,40 | atlas_decor | same | same | v1 |
| rock_large | `public/assets/farm/decor/rock_large.png` | 128×112 | footprint 1x1 | 64,48 | atlas_decor | same | same | v1 |
| rock_small | `public/assets/farm/decor/rock_small.png` | 96×64 | footprint 1x1 | 48,20 | atlas_decor | same | same | v1 |
| scarecrow | `public/assets/farm/decor/scarecrow.png` | 96×128 | footprint 1x1 | 48,96 | atlas_decor | same | same | v1 |
| sign_for_sale | `public/assets/farm/decor/sign_for_sale.png` | 64×96 | footprint 1x1 | 32,56 | atlas_decor | same | same | v1 |
| signpost | `public/assets/farm/decor/signpost.png` | 64×96 | footprint 1x1 | 32,56 | atlas_decor | same | same | v1 |
| tree_apple | `public/assets/farm/decor/tree_apple.png` | 128×176 | footprint 1x1 | 64,124 | atlas_decor | same | same | v1 |
| tree_autumn | `public/assets/farm/decor/tree_autumn.png` | 128×176 | footprint 1x1 | 64,124 | atlas_decor | same | same | v1 |
| tree_oak | `public/assets/farm/decor/tree_oak.png` | 128×176 | footprint 1x1 | 64,124 | atlas_decor | same | same | v1 |
| tree_pine | `public/assets/farm/decor/tree_pine.png` | 128×176 | footprint 1x1 | 64,124 | atlas_decor | same | same | v1 |
| tree_stump | `public/assets/farm/decor/tree_stump.png` | 96×72 | footprint 1x1 | 48,24 | atlas_decor | same | same | v1 |
| well | `public/assets/farm/decor/well.png` | 128×112 | footprint 1x1 | 64,56 | atlas_decor | same | same | v1 |

## Characters (players and NPC customers) (34)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| chef_marco_idle_0 | `public/assets/farm/characters/chef_marco_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| chef_marco_idle_1 | `public/assets/farm/characters/chef_marco_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| chef_marco_portrait | `public/assets/farm/characters/chef_marco_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| chef_marco_wave | `public/assets/farm/characters/chef_marco_wave.png` | 80×140 | wave | 40,134 | atlas_characters | same | same | v1 |
| farmer_boy_idle_0 | `public/assets/farm/characters/farmer_boy_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| farmer_boy_idle_1 | `public/assets/farm/characters/farmer_boy_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| farmer_boy_portrait | `public/assets/farm/characters/farmer_boy_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| farmer_boy_walk_0 | `public/assets/farm/characters/farmer_boy_walk_0.png` | 80×140 | walk_0 | 40,134 | atlas_characters | same | same | v1 |
| farmer_boy_walk_1 | `public/assets/farm/characters/farmer_boy_walk_1.png` | 80×140 | walk_1 | 40,134 | atlas_characters | same | same | v1 |
| farmer_girl_idle_0 | `public/assets/farm/characters/farmer_girl_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| farmer_girl_idle_1 | `public/assets/farm/characters/farmer_girl_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| farmer_girl_portrait | `public/assets/farm/characters/farmer_girl_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| farmer_girl_walk_0 | `public/assets/farm/characters/farmer_girl_walk_0.png` | 80×140 | walk_0 | 40,134 | atlas_characters | same | same | v1 |
| farmer_girl_walk_1 | `public/assets/farm/characters/farmer_girl_walk_1.png` | 80×140 | walk_1 | 40,134 | atlas_characters | same | same | v1 |
| lily_idle_0 | `public/assets/farm/characters/lily_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| lily_idle_1 | `public/assets/farm/characters/lily_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| lily_portrait | `public/assets/farm/characters/lily_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| lily_wave | `public/assets/farm/characters/lily_wave.png` | 80×140 | wave | 40,134 | atlas_characters | same | same | v1 |
| nana_rose_idle_0 | `public/assets/farm/characters/nana_rose_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| nana_rose_idle_1 | `public/assets/farm/characters/nana_rose_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| nana_rose_portrait | `public/assets/farm/characters/nana_rose_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| nana_rose_wave | `public/assets/farm/characters/nana_rose_wave.png` | 80×140 | wave | 40,134 | atlas_characters | same | same | v1 |
| old_joe_idle_0 | `public/assets/farm/characters/old_joe_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| old_joe_idle_1 | `public/assets/farm/characters/old_joe_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| old_joe_portrait | `public/assets/farm/characters/old_joe_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| old_joe_wave | `public/assets/farm/characters/old_joe_wave.png` | 80×140 | wave | 40,134 | atlas_characters | same | same | v1 |
| omar_idle_0 | `public/assets/farm/characters/omar_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| omar_idle_1 | `public/assets/farm/characters/omar_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| omar_portrait | `public/assets/farm/characters/omar_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| omar_wave | `public/assets/farm/characters/omar_wave.png` | 80×140 | wave | 40,134 | atlas_characters | same | same | v1 |
| priya_idle_0 | `public/assets/farm/characters/priya_idle_0.png` | 80×140 | idle_0 | 40,134 | atlas_characters | same | same | v1 |
| priya_idle_1 | `public/assets/farm/characters/priya_idle_1.png` | 80×140 | idle_1 | 40,134 | atlas_characters | same | same | v1 |
| priya_portrait | `public/assets/farm/characters/priya_portrait.png` | 128×128 | portrait | 64,64 | atlas_characters | same | same | v1 |
| priya_wave | `public/assets/farm/characters/priya_wave.png` | 80×140 | wave | 40,134 | atlas_characters | same | same | v1 |

## Icons (HUD, crop items, products) (73)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| achievement | `public/assets/farm/icons/achievement.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| check | `public/assets/farm/icons/check.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| clock | `public/assets/farm/icons/clock.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| close | `public/assets/farm/icons/close.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| coin | `public/assets/farm/icons/coin.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| expand | `public/assets/farm/icons/expand.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| friends | `public/assets/farm/icons/friends.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| gem | `public/assets/farm/icons/gem.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| gift | `public/assets/farm/icons/gift.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| happiness | `public/assets/farm/icons/happiness.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| info | `public/assets/farm/icons/info.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_animal_feed | `public/assets/farm/icons/item_animal_feed.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_bread | `public/assets/farm/icons/item_bread.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_butter | `public/assets/farm/icons/item_butter.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_cabbage | `public/assets/farm/icons/item_cabbage.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_cake | `public/assets/farm/icons/item_cake.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_carrot | `public/assets/farm/icons/item_carrot.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_carrot_juice | `public/assets/farm/icons/item_carrot_juice.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_cheese | `public/assets/farm/icons/item_cheese.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_corn | `public/assets/farm/icons/item_corn.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_cotton | `public/assets/farm/icons/item_cotton.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_egg | `public/assets/farm/icons/item_egg.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_fabric | `public/assets/farm/icons/item_fabric.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_feather | `public/assets/farm/icons/item_feather.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_flour | `public/assets/farm/icons/item_flour.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_goat_milk | `public/assets/farm/icons/item_goat_milk.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_milk | `public/assets/farm/icons/item_milk.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_popcorn | `public/assets/farm/icons/item_popcorn.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_potato | `public/assets/farm/icons/item_potato.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_pumpkin | `public/assets/farm/icons/item_pumpkin.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_pumpkin_pie | `public/assets/farm/icons/item_pumpkin_pie.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_rice | `public/assets/farm/icons/item_rice.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_seed_bag | `public/assets/farm/icons/item_seed_bag.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_strawberry | `public/assets/farm/icons/item_strawberry.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_strawberry_jam | `public/assets/farm/icons/item_strawberry_jam.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_sugar | `public/assets/farm/icons/item_sugar.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_sugarcane | `public/assets/farm/icons/item_sugarcane.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_sunflower | `public/assets/farm/icons/item_sunflower.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_sunflower_oil | `public/assets/farm/icons/item_sunflower_oil.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_sweater | `public/assets/farm/icons/item_sweater.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_tomato | `public/assets/farm/icons/item_tomato.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_tomato_juice | `public/assets/farm/icons/item_tomato_juice.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_truffle | `public/assets/farm/icons/item_truffle.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_wheat | `public/assets/farm/icons/item_wheat.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_wool | `public/assets/farm/icons/item_wool.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| level_badge | `public/assets/farm/icons/level_badge.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| lock | `public/assets/farm/icons/lock.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| music_off | `public/assets/farm/icons/music_off.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| music_on | `public/assets/farm/icons/music_on.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| nav_animals | `public/assets/farm/icons/nav_animals.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| nav_farm | `public/assets/farm/icons/nav_farm.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| nav_inventory | `public/assets/farm/icons/nav_inventory.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| nav_map | `public/assets/farm/icons/nav_map.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| nav_market | `public/assets/farm/icons/nav_market.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| nav_shop | `public/assets/farm/icons/nav_shop.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| order_truck | `public/assets/farm/icons/order_truck.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| plus | `public/assets/farm/icons/plus.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| quest | `public/assets/farm/icons/quest.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| sell_tag | `public/assets/farm/icons/sell_tag.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| settings | `public/assets/farm/icons/settings.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| sound_off | `public/assets/farm/icons/sound_off.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| sound_on | `public/assets/farm/icons/sound_on.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| tutorial_hand | `public/assets/farm/icons/tutorial_hand.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| upgrade | `public/assets/farm/icons/upgrade.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| warning | `public/assets/farm/icons/warning.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| xp_star | `public/assets/farm/icons/xp_star.png` | 64×64 | 1 | — | atlas_icons | same | same | v1 |
| item_onion | `public/assets/farm/icons/item_onion.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| item_blueberry | `public/assets/farm/icons/item_blueberry.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| item_peanut | `public/assets/farm/icons/item_peanut.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| item_lavender | `public/assets/farm/icons/item_lavender.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| item_fluff | `public/assets/farm/icons/item_fluff.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| item_big_egg | `public/assets/farm/icons/item_big_egg.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |
| item_horsehair | `public/assets/farm/icons/item_horsehair.png` | 64×64 | 1 | — | atlas_icons | Original, programmatically drawn (SVG source in `art/svg/`, generator in `art/`) | Project-owned original work | v1 |

## FX (19)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| dust_0 | `public/assets/farm/fx/dust_0.png` | 96×64 | 4-frame | 48,48 | atlas_ui_fx | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| dust_1 | `public/assets/farm/fx/dust_1.png` | 96×64 | 4-frame | 48,48 | atlas_ui_fx | same | same | v1 |
| dust_2 | `public/assets/farm/fx/dust_2.png` | 96×64 | 4-frame | 48,48 | atlas_ui_fx | same | same | v1 |
| dust_3 | `public/assets/farm/fx/dust_3.png` | 96×64 | 4-frame | 48,48 | atlas_ui_fx | same | same | v1 |
| heart | `public/assets/farm/fx/heart.png` | 32×32 | 1 | 16,16 | atlas_ui_fx | same | same | v1 |
| leaf | `public/assets/farm/fx/leaf.png` | 32×32 | 1 | 16,16 | atlas_ui_fx | same | same | v1 |
| levelup_ring | `public/assets/farm/fx/levelup_ring.png` | 192×192 | 1 | 96,96 | atlas_ui_fx | same | same | v1 |
| ready_bubble | `public/assets/farm/fx/ready_bubble.png` | 64×72 | shown above ready crops/products | 32,64 | atlas_ui_fx | same | same | v1 |
| smoke_0 | `public/assets/farm/fx/smoke_0.png` | 48×96 | 4-frame chimney smoke | 24,90 | atlas_ui_fx | same | same | v1 |
| smoke_1 | `public/assets/farm/fx/smoke_1.png` | 48×96 | 4-frame chimney smoke | 24,90 | atlas_ui_fx | same | same | v1 |
| smoke_2 | `public/assets/farm/fx/smoke_2.png` | 48×96 | 4-frame chimney smoke | 24,90 | atlas_ui_fx | same | same | v1 |
| smoke_3 | `public/assets/farm/fx/smoke_3.png` | 48×96 | 4-frame chimney smoke | 24,90 | atlas_ui_fx | same | same | v1 |
| sparkle_0 | `public/assets/farm/fx/sparkle_0.png` | 64×64 | 4-frame | 32,32 | atlas_ui_fx | same | same | v1 |
| sparkle_1 | `public/assets/farm/fx/sparkle_1.png` | 64×64 | 4-frame | 32,32 | atlas_ui_fx | same | same | v1 |
| sparkle_2 | `public/assets/farm/fx/sparkle_2.png` | 64×64 | 4-frame | 32,32 | atlas_ui_fx | same | same | v1 |
| sparkle_3 | `public/assets/farm/fx/sparkle_3.png` | 64×64 | 4-frame | 32,32 | atlas_ui_fx | same | same | v1 |
| star | `public/assets/farm/fx/star.png` | 32×32 | 1 | 16,16 | atlas_ui_fx | same | same | v1 |
| water_drop | `public/assets/farm/fx/water_drop.png` | 32×32 | 1 | 16,16 | atlas_ui_fx | same | same | v1 |
| zzz | `public/assets/farm/fx/zzz.png` | 48×48 | 1 | 24,24 | atlas_ui_fx | same | same | v1 |

## UI (9-slice and HUD pieces), logo, PWA icons (29)

| Name | Path | Size | Frames / notes | Anchor | Atlas | Source | Licence | Status |
|---|---|---|---|---|---|---|---|---|
| app_icon_192 | `public/assets/farm/ui/app_icon_192.png` | 192×192 | PWA icon | — | standalone | Original, programmatically drawn (SVG source in `art-src/svg/`, generator in `tools/asset-gen/`) | Project-owned original work | v1 |
| app_icon_512 | `public/assets/farm/ui/app_icon_512.png` | 512×512 | PWA icon | — | standalone | same | same | v1 |
| avatar_frame | `public/assets/farm/ui/avatar_frame.png` | 112×112 | 1 | — | atlas_ui_fx | same | same | v1 |
| badge_count | `public/assets/farm/ui/badge_count.png` | 32×32 | 1 | — | atlas_ui_fx | same | same | v1 |
| bottom_nav | `public/assets/farm/ui/bottom_nav.png` | 256×88 | tile horizontally | — | atlas_ui_fx | same | same | v1 |
| button_blue | `public/assets/farm/ui/button_blue.png` | 96×56 | 9-slice: 20px corners; pressed = offset 4px down | — | atlas_ui_fx | same | same | v1 |
| button_disabled | `public/assets/farm/ui/button_disabled.png` | 96×56 | 9-slice: 20px corners; pressed = offset 4px down | — | atlas_ui_fx | same | same | v1 |
| button_green | `public/assets/farm/ui/button_green.png` | 96×56 | 9-slice: 20px corners; pressed = offset 4px down | — | atlas_ui_fx | same | same | v1 |
| button_red | `public/assets/farm/ui/button_red.png` | 96×56 | 9-slice: 20px corners; pressed = offset 4px down | — | atlas_ui_fx | same | same | v1 |
| button_round | `public/assets/farm/ui/button_round.png` | 72×72 | icon button background | — | atlas_ui_fx | same | same | v1 |
| button_yellow | `public/assets/farm/ui/button_yellow.png` | 96×56 | 9-slice: 20px corners; pressed = offset 4px down | — | atlas_ui_fx | same | same | v1 |
| coming_soon_tag | `public/assets/farm/ui/coming_soon_tag.png` | 128×32 | 1 | — | atlas_ui_fx | same | same | v1 |
| hud_pill | `public/assets/farm/ui/hud_pill.png` | 160×48 | 3-slice: 22px ends; currency counters | — | atlas_ui_fx | same | same | v1 |
| logo | `public/assets/farm/ui/logo.png` | 720×300 | title screen logo | — | standalone | same | same | v1 |
| logo_small | `public/assets/farm/ui/logo_small.png` | 360×150 | loading / header logo | — | atlas_ui_fx | same | same | v1 |
| panel | `public/assets/farm/ui/panel.png` | 96×96 | 9-slice: 24px corners | — | atlas_ui_fx | same | same | v1 |
| panel_dark | `public/assets/farm/ui/panel_dark.png` | 96×96 | 9-slice: 24px corners | — | atlas_ui_fx | same | same | v1 |
| progress_bg | `public/assets/farm/ui/progress_bg.png` | 128×24 | 3-slice: 12px ends | — | atlas_ui_fx | same | same | v1 |
| progress_fill_blue | `public/assets/farm/ui/progress_fill_blue.png` | 128×24 | 3-slice: 12px ends | — | atlas_ui_fx | same | same | v1 |
| progress_fill_green | `public/assets/farm/ui/progress_fill_green.png` | 128×24 | 3-slice: 12px ends | — | atlas_ui_fx | same | same | v1 |
| progress_fill_yellow | `public/assets/farm/ui/progress_fill_yellow.png` | 128×24 | 3-slice: 12px ends | — | atlas_ui_fx | same | same | v1 |
| ribbon_header | `public/assets/farm/ui/ribbon_header.png` | 256×64 | 3-slice horizontal: 40px ends | — | atlas_ui_fx | same | same | v1 |
| slot | `public/assets/farm/ui/slot.png` | 80×80 | inventory slot | — | atlas_ui_fx | same | same | v1 |
| slot_selected | `public/assets/farm/ui/slot_selected.png` | 80×80 | 1 | — | atlas_ui_fx | same | same | v1 |
| tab_active | `public/assets/farm/ui/tab_active.png` | 128×48 | 1 | — | atlas_ui_fx | same | same | v1 |
| tab_inactive | `public/assets/farm/ui/tab_inactive.png` | 128×48 | 1 | — | atlas_ui_fx | same | same | v1 |
| toast | `public/assets/farm/ui/toast.png` | 256×56 | 3-slice: 28px ends | — | atlas_ui_fx | same | same | v1 |
| tooltip | `public/assets/farm/ui/tooltip.png` | 96×64 | 9-slice: 14px corners, tail bottom-centre | — | atlas_ui_fx | same | same | v1 |
| top_bar | `public/assets/farm/ui/top_bar.png` | 256×72 | tile horizontally | — | atlas_ui_fx | same | same | v1 |

## Audio (41)

Synthesized from scratch in `tools/asset-gen/audio.py` (no samples, no third-party audio). Licence: project-owned original work. Music tracks are seamless loops.

| Key | Files (ogg / mp3) | Duration | Loop | Use | KB (ogg/mp3) | Status |
|---|---|---|---|---|---|---|
| ui_click | `public/assets/farm/audio/sfx/ui_click.ogg` / `.mp3` | 0.04s | no | buttons | 3.6 / 1.1 | v1 |
| ui_open | `public/assets/farm/audio/sfx/ui_open.ogg` / `.mp3` | 0.37s | no | open panel | 5.3 / 4.4 | v1 |
| ui_close | `public/assets/farm/audio/sfx/ui_close.ogg` / `.mp3` | 0.37s | no | close panel | 5.5 / 4.4 | v1 |
| ui_tab | `public/assets/farm/audio/sfx/ui_tab.ogg` / `.mp3` | 0.08s | no | tab switch | 3.7 / 1.6 | v1 |
| ui_error | `public/assets/farm/audio/sfx/ui_error.ogg` / `.mp3` | 0.36s | no | invalid action | 6.2 / 4.1 | v1 |
| plant_seed | `public/assets/farm/audio/sfx/plant_seed.ogg` / `.mp3` | 0.2s | no | plant crop | 5.0 / 2.6 | v1 |
| harvest_pop | `public/assets/farm/audio/sfx/harvest_pop.ogg` / `.mp3` | 0.52s | no | harvest crop | 6.0 / 5.7 | v1 |
| coin_collect | `public/assets/farm/audio/sfx/coin_collect.ogg` / `.mp3` | 0.62s | no | coins gained | 6.0 / 6.7 | v1 |
| gem_collect | `public/assets/farm/audio/sfx/gem_collect.ogg` / `.mp3` | 0.7s | no | gems gained | 8.4 / 7.4 | v1 |
| xp_gain | `public/assets/farm/audio/sfx/xp_gain.ogg` / `.mp3` | 0.45s | no | XP gained | 5.2 / 5.1 | v1 |
| place_object | `public/assets/farm/audio/sfx/place_object.ogg` / `.mp3` | 0.25s | no | object placed | 4.5 / 3.1 | v1 |
| place_invalid | `public/assets/farm/audio/sfx/place_invalid.ogg` / `.mp3` | 0.36s | no | placement blocked | 6.2 / 4.1 | v1 |
| remove_object | `public/assets/farm/audio/sfx/remove_object.ogg` / `.mp3` | 0.35s | no | object removed/stored | 6.4 / 4.1 | v1 |
| build_complete | `public/assets/farm/audio/sfx/build_complete.ogg` / `.mp3` | 1.8s | no | construction/upgrade finished | 13.7 / 18.2 | v1 |
| production_start | `public/assets/farm/audio/sfx/production_start.ogg` / `.mp3` | 0.7s | no | production job queued | 7.5 / 7.4 | v1 |
| production_done | `public/assets/farm/audio/sfx/production_done.ogg` / `.mp3` | 1.05s | no | production job ready | 8.0 / 11.0 | v1 |
| feed_animal | `public/assets/farm/audio/sfx/feed_animal.ogg` / `.mp3` | 0.37s | no | feed animals | 7.2 / 4.4 | v1 |
| collect_product | `public/assets/farm/audio/sfx/collect_product.ogg` / `.mp3` | 0.45s | no | collect animal/production goods | 5.4 / 5.1 | v1 |
| order_fulfil | `public/assets/farm/audio/sfx/order_fulfil.ogg` / `.mp3` | 0.96s | no | NPC order delivered (cash register) | 9.6 / 10.0 | v1 |
| expand_land | `public/assets/farm/audio/sfx/expand_land.ogg` / `.mp3` | 1.19s | no | land expansion | 11.8 / 12.3 | v1 |
| clear_chop | `public/assets/farm/audio/sfx/clear_chop.ogg` / `.mp3` | 0.15s | no | clear tree/stump obstacle | 4.6 / 2.1 | v1 |
| clear_rock | `public/assets/farm/audio/sfx/clear_rock.ogg` / `.mp3` | 0.4s | no | clear rock obstacle | 7.9 / 4.6 | v1 |
| notification | `public/assets/farm/audio/sfx/notification.ogg` / `.mp3` | 0.85s | no | generic notification | 7.3 / 9.0 | v1 |
| tutorial_pop | `public/assets/farm/audio/sfx/tutorial_pop.ogg` / `.mp3` | 0.1s | no | tutorial step | 3.7 / 1.6 | v1 |
| crop_ready | `public/assets/farm/audio/sfx/crop_ready.ogg` / `.mp3` | 0.56s | no | crop became ready | 6.1 / 6.2 | v1 |
| camera_whoosh | `public/assets/farm/audio/sfx/camera_whoosh.ogg` / `.mp3` | 0.3s | no | map/camera jump | 5.9 / 3.6 | v1 |
| animal_cow_moo | `public/assets/farm/audio/sfx/animal_cow_moo.ogg` / `.mp3` | 1.3s | no | cow moo | 21.8 / 13.3 | v1 |
| animal_sheep_baa | `public/assets/farm/audio/sfx/animal_sheep_baa.ogg` / `.mp3` | 0.9s | no | sheep baa | 11.2 / 9.5 | v1 |
| animal_goat_bleat | `public/assets/farm/audio/sfx/animal_goat_bleat.ogg` / `.mp3` | 0.6s | no | goat bleat | 8.8 / 6.4 | v1 |
| animal_pig_oink | `public/assets/farm/audio/sfx/animal_pig_oink.ogg` / `.mp3` | 0.44s | no | pig oink | 6.1 / 4.9 | v1 |
| animal_chicken_cluck | `public/assets/farm/audio/sfx/animal_chicken_cluck.ogg` / `.mp3` | 0.42s | no | chicken cluck | 6.0 / 4.9 | v1 |
| animal_duck_quack | `public/assets/farm/audio/sfx/animal_duck_quack.ogg` / `.mp3` | 0.52s | no | duck quack | 6.8 / 5.7 | v1 |
| jingle_level_up | `public/assets/farm/audio/music/jingle_level_up.ogg` / `.mp3` | 3.54s | no | level up fanfare | 20.8 / 42.3 | v1 |
| jingle_quest_complete | `public/assets/farm/audio/music/jingle_quest_complete.ogg` / `.mp3` | 2.69s | no | quest complete | 14.1 / 32.2 | v1 |
| jingle_order_complete | `public/assets/farm/audio/music/jingle_order_complete.ogg` / `.mp3` | 2.0s | no | NPC order delivered | 10.6 / 24.2 | v1 |
| jingle_new_unlock | `public/assets/farm/audio/music/jingle_new_unlock.ogg` / `.mp3` | 2.32s | no | new item / area unlocked | 12.8 / 27.9 | v1 |
| ambience_farm | `public/assets/farm/audio/music/ambience_farm.ogg` / `.mp3` | 28.0s | yes | birds + soft wind, play under music at low volume | 214.6 / 328.8 | v1 |
| music_title | `public/assets/farm/audio/music/music_title.ogg` / `.mp3` | 38.4s | yes | title/menu theme, cheerful, seamless loop | 312.9 / 450.7 | v1 |
| music_farm_day | `public/assets/farm/audio/music/music_farm_day.ogg` / `.mp3` | 65.45s | yes | main gameplay loop (daytime), relaxed | 505.2 / 767.8 | v1 |
| music_market | `public/assets/farm/audio/music/music_market.ogg` / `.mp3` | 33.1s | yes | market / shop screens, bouncy | 277.6 / 388.8 | v1 |
| music_evening | `public/assets/farm/audio/music/music_evening.ogg` / `.mp3` | 53.33s | yes | evening / night or calm menus, no drums | 403.9 / 625.8 | v1 |

## Fonts

- The logo PNGs have **Poppins Bold** rendered into them (SIL Open Font License 1.1). Licence text: https://openfontlicense.org — include it in `/licenses` when the game ships.
- For in-game HUD text, use Poppins or another OFL font through Google Fonts or a self-hosted file. No font files are included here.

## Outstanding / not included

- No @2x (high-DPI) exports yet. The SVG sources scale cleanly, so run `build_all.py` with `SCALE=2` when they are needed.
- Animals have idle, eat and walk frames only (no run, sleep or happy-jump frames). The fx `heart` and `zzz` sprites stand in for those states.
- Buildings have no upgrade-level variants yet (Lv2/Lv3 looks). `construction_2x2` is the shared building-in-progress sprite.
- Seasonal and event art (Post-MVP Phase 5+) is not included.
- Audio is synthesized. A composer or sound designer pass is optional polish, not a blocker.
