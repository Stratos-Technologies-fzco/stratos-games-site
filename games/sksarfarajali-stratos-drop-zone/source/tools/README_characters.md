# Characters: how they are made and how to swap in the final models

The four survivors (Kiran, Meera, Arjun, Zoya) share two skinned bodies: `humanoid_male.glb` (Kiran, Arjun) and `humanoid_female.glb` (Meera, Zoya). Today these are **stand-ins**: the free CC0 "Superhero" bodies from the Quaternius *Universal Base Characters* pack, repainted into plain, unbranded clothes in each survivor's colours from `Art/Character_Bible.md`. The final art can replace them without touching game code.

## What is in the repo

| File | What it is |
|---|---|
| `public/models/Characters/humanoid_male.glb`, `humanoid_female.glb` | One skeleton (65 bones, Quaternius "universal humanoid" names), three skinned LOD meshes on it (`body_lod0` 12k, `body_lod1` 5k, `body_lod2` 1.5k triangles), 4 weights per vertex, and four sockets |
| `public/models/Characters/atlas_1024.png`, `atlas_512.png` | One colour atlas. 32 x 32 swatches: a **column per body region**, a **row per survivor**. 512 is used on Low quality and on phones |
| `shared/atlas_layout.json` | Which column is which region, which row is which survivor, which body each uses |
| `public/models/Animations/humanoid_anims.glb` | The shared animation clips (21), same bone names as the bodies, so no retargeting |
| `shared/clip_info.json` | Length and real ground speed of every clip (stride matching needs it) |
| `shared/weapon_sockets.json` | Per weapon: `socket_grip` (right hand), `socket_left_hand` (handguard, where IK puts the left hand), `muzzle`, recoil, hold type |
| `tools/build-characters.ts`, `tools/build-animations.ts`, `tools/survivor_palettes.json` | The build scripts and the colours |

Sockets (empty nodes on the skeleton): `hand_r_weapon` (child of `hand_r`), `hand_l_ik` (child of `hand_l`, the left-hand target frame), `spine_backpack` (child of `spine_03`), `head_cam` (child of `Head`, where the camera follows).

Licences: both Quaternius packs are CC0 1.0 (public domain, commercial use allowed). Every model, clip and the atlas is listed with its source in `Models/Asset_Production_Register.csv`; a copy of the new rows is in `shared/asset_register_characters.csv`.

## Rebuilding the stand-ins

The source packs are not stored in the repo (they are large and free to download again). Download "Universal Base Characters [Standard]" and "Universal Animation Library [Standard]" from quaternius.itch.io, unzip them, then:

    node tools/build-characters.ts --chars "<unzipped Base Characters>/Base Characters/Godot - UE"
    node tools/build-animations.ts --ual "<unzipped Animation Library>/Unreal-Godot"

How the body is painted: every vertex is given a **region** from its dominant bone and its position (skin, hair, jacket, sleeve, forearm, neckwear, trousers, beard, boots, sole, belt, glove, band, trim, knee, cuff, laces, backpack, bedroll, strap). Every triangle then points at one swatch, so clothes are flat colour and edges are clean. Change a colour in `tools/survivor_palettes.json` and re-run `build-characters.ts` to restyle a survivor.

## Swapping in the final Kiran, Meera, Arjun and Zoya

You can do it one survivor at a time. Each final model needs:

1. **The same skeleton.** Mixamo-style humanoid, **65 bones with the Quaternius names** (`root`, `pelvis`, `spine_01-03`, `neck_01`, `Head`, `clavicle_l/r`, `upperarm_l/r`, `lowerarm_l/r`, `hand_l/r`, five fingers of four bones each, `thigh_l/r`, `calf_l/r`, `foot_l/r`, `ball_l/r`), parent listed before child, in a T-pose, 1.8 m tall, facing +Z. The Quaternius *Universal Base Characters* rig is the reference: any model rigged to it works with all the clips as they are. (A Mixamo rig has different names; map them with a rename table before export.)
2. **Three skinned meshes** named `body_lod0`, `body_lod1`, `body_lod2` bound to that one skeleton, about 12k, 5k and 1.5k triangles, 4 weights per vertex, **one material, one texture**. Eyes, brows and hair belong in the same mesh.
3. **The four sockets** as child nodes with the names above. Place `hand_r_weapon` in the palm so the weapon's `socket_grip` sits in the fingers; `hand_l_ik` in the left palm.
4. **A texture.** Easiest is to keep the shared atlas and paint the model's UVs onto the region columns (see `shared/atlas_layout.json`). If the final model has its own 1024 texture instead, save it as `atlas_1024.png` (and a 512 version), and give its row a new entry in `atlas_layout.json`.

Then:

- Export to `public/models/Characters/` (for example `humanoid_kiran.glb`) and point that survivor at it in `src/render/humanoid.ts` (`loadBody`, keyed by the `body` field in `atlas_layout.json`).
- Open `/anim-lab.html` (or run `npm run dev` and visit `/anim-lab.html`), pick the survivor, and check: walk a circle and a figure-eight, the slope and the stairs, all eight directions, aiming up and down, every weapon. The panel under F9 shows the planted-foot markers; the bottom-right box shows the foot slide.
- Run `npm test`, then `npm run build`.
- Add the model and its source and licence to `Models/Asset_Production_Register.csv`.

If a final model has different proportions (a shorter or heavier body), the clips still work. Foot placement adapts to the leg length. Re-check the weapon grip once, and tune `socket_grip` in `shared/weapon_sockets.json` if hands sit off the handle.

## Known limits of the stand-ins

- Both bodies are the pack's muscular "Superhero" shape and look alike apart from colours and sex. The four survivors differ by palette and by body type only.
- The pack has no rifle clips and no strafe or backward clips. Those are made from the available clips (forward walk, jog and sprint played forward or reversed, with the hips turned for each of the eight directions, and the pistol set for the weapon pose). They hold up well in a stylised game; real rifle mocap would look better. See `DECISIONS.md`.
