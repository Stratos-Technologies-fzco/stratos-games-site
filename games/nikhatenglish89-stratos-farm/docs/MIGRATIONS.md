# MIGRATIONS: the save format

The save is JSON in `localStorage` key `stratos_farm_save_v1` (plus the previous save in `stratos_farm_save_prev_v1`). It has a `version` and, since the launch pass, a `sig` checksum. `LocalFarmService.parse()` upgrades old versions on load; nothing is ever reset because of a version change.

| Version | Phase | Added | Upgrade rule |
|---|---|---|---|
| 1 | 2 | coins, gems, xp, level, inventory, plots, ledger, idempotency keys | v1 -> v2: empty `buildings`, `animals`, `jobs`, `nextId` |
| 2 | 3 | buildings, animals, production jobs | v2 -> v3: empty orders, cooldowns, `expanded`, `stats`, `claimed`, `daily`, `tutorialDone` |
| 3 | 4 | orders, quests, expansion, tutorial, stats counters | current |
| 3 + `sig` | 7 | checksum over the whole save | an unsigned save is accepted (old saves); a wrong checksum falls back to the previous save, and if there is none the save is still loaded |

## Review checklist for the next change to the save
1. Bump `VERSION`, add an upgrade step in `parse()`, never delete a field a player may own.
2. Add a test with a hand-written save of the previous version (see `tests/economy.test.ts` "save migration" and `tests/phase7.test.ts`).
3. New master data ids (crops, items, buildings, recipes) must keep every old id; removed content needs a conversion (refund) step.
4. New field plots or removed layout objects are handled on load (`plots` are rebuilt from the layout, unknown plots are dropped, new plots start empty).
5. Backups: players can export and import the save in Settings (files wrapped as `{game, exportedAt, save}`); import goes through the same `parse()` and is size-limited.

When a real backend arrives, a one-time import endpoint can accept the exported file and run the same upgrade steps on the server.
