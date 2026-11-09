# Crystal Quest - Audio Design

All audio is original and was synthesised procedurally (additive and FM synthesis, convolution reverb) by `tools/gen_audio.py`. It is a **placeholder-grade draft**: good enough to build and test with, but it has not been through a composer or sound designer and should be reviewed by ear before launch. Each file exists as `.ogg` (Vorbis) and `.mp3` (128k).

## Music (loops unless noted)

| File | Use | Tempo | Mode | Lead sound |
|---|---|---|---|---|
| music_01_main_menu | Main menu, world map | 92 | Major | Bell |
| music_02_crystal_valley | World 1 | 112 | Major | Flute |
| music_03_frozen_mountains | World 2 | 78 | Dorian | Bell, no drums |
| music_04_enchanted_forest | World 3 | 104 | Dorian | Flute, shaker |
| music_05_lost_desert | World 4 | 98 | Phrygian dominant | Oud-like |
| music_06_dragon_kingdom | World 5 | 132 | Harmonic minor | Brass |
| music_07_boss_battle | All boss levels | 148 | Harmonic minor | Brass, stabs |
| music_08_victory | Level complete (plays once, no loop) | 124 | Major | Brass |

## Sound effects

| File | Event |
|---|---|
| sfx_01_select | Crystal selected |
| sfx_02_move | Crystal swap |
| sfx_03_match3 / 04_match4 / 05_match5 | Matches of 3, 4, 5 |
| sfx_06_crystal_explosion | Crystal or Ruby Bomb explosion |
| sfx_07_lightning | Lightning / Thunder crystal |
| sfx_08_rainbow | Rainbow crystal |
| sfx_09_booster | Booster used |
| sfx_10_level_complete | Level complete jingle |
| sfx_11_level_fail | Level failed |
| sfx_12_boss_attack / 13_boss_defeat | Boss attack, boss defeated |
| sfx_14_reward | Coin, star or reward collected |
| sfx_15_button | UI button |

## Implementation guidance (Phaser 3)

- Load both formats: `this.load.audio('music_01_main_menu', ['audio/music/music_01_main_menu.ogg', 'audio/music/music_01_main_menu.mp3'])`. Phaser picks the first the browser supports.
- Browsers block audio until the first user gesture. Start the audio context on the first tap or key press (the title screen "Play" button), not on page load.
- Build one `AudioManager` with three volume buses (master, music, sfx) that map to the sliders in the Settings screen. Persist the values locally; apply mute from the HUD sound button.
- Play one music track at a time. Cross-fade over about 600 ms when changing track. Loop all music except `music_08_victory`.
- Pitch-step cascades: play `sfx_03_match3` with `rate` rising by about 0.06 per chain step (cap at +0.4) so cascades feel escalating without extra files.
- Limit simultaneous SFX (for example 6 voices) and skip a repeat of the same sound within 40 ms.
- Pause music and mute on tab hide; resume on return. Respect a "reduce audio" or mute setting.
- Preload priority: menu music and core SFX (01, 02, 03, 15) at boot; world music with each world; the rest lazily. Music files are the biggest part of the download, so keep them out of the first-load budget.

## Regenerating or changing

`python3 tools/gen_audio.py <audio_root> [filter]` rebuilds files (the optional filter limits it, e.g. `music_05`). Edit the `MUSIC` and SFX dictionaries to change tempo, scale, instruments or drum style. Requires `numpy` and `ffmpeg`.

## Still missing

Music for worlds 6 to 10 (Ocean, Sky, Dark, Celestial, Palace) and ambience loops are not part of the required list and are not made. Replace placeholders with composed music when budget allows.
