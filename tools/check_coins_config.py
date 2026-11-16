#!/usr/bin/env python3
"""check_coins_config.py: checks assets/coins-config.json before it goes live. Run it after every edit:

  python3 tools/check_coins_config.py            prints every problem, exits 1 if there is one
  python3 tools/check_coins_config.py FILE.json  check another file

What it catches: wrong types, zero or negative amounts, a per-game cap above the daily total, a game name that has no folder
under games/, a rule or item name that does not exist, tiers out of order, and unknown fields (usually a typo).
tools/build.py prints the same problems as warnings, and tools/check_games.py shows them in the staging report (issue #33).
The coin engine itself ignores bad per-game values and falls back to the global rule, so a typo never breaks a game.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT = os.path.join(ROOT, "assets", "coins-config.json")
MAX = 10000
ONCE = {"game+level", "day", "game"}
RULE_FIELDS = {"label", "amount", "unit", "once", "perDay", "perGamePerDay", "enabled", "max", "min", "minStreak", "multiplier"}
OVERRIDE_FIELDS = {"amount", "once", "perDay", "perGamePerDay", "enabled", "max", "min"}
ITEM_FIELDS = {"type", "price", "label", "freeUpTo", "offer"}
GAME_FIELDS = {"coins", "earn", "dailyCap", "items"}
AUTO_KEYS = {"first", "level", "repeat", "win"}


def isint(v, lo=1, hi=MAX):
    return isinstance(v, int) and not isinstance(v, bool) and lo <= v <= hi


def game_slugs():
    g = os.path.join(ROOT, "games")
    return {d for d in os.listdir(g) if os.path.isdir(os.path.join(g, d))} if os.path.isdir(g) else set()


def check_amount(a, where, errs):
    if a == "dynamic":
        return
    if isinstance(a, list):
        if not a:
            errs.append(f"{where}: amount tiers are empty"); return
        last = 0
        for i, t in enumerate(a):
            if not (isinstance(t, dict) and isint(t.get("maxLevel"), 1, 100000) and isint(t.get("coins"))):
                errs.append(f"{where}: tier {i + 1} needs whole numbers maxLevel and coins"); continue
            if t["maxLevel"] <= last: errs.append(f"{where}: tier {i + 1} maxLevel must be higher than the one before")
            last = t["maxLevel"]
    elif not isint(a):
        errs.append(f"{where}: amount must be a whole number from 1 to {MAX}, a list of tiers or \"dynamic\" (got {a!r})")


def check(cfg, slugs=None):
    errs = []
    slugs = game_slugs() if slugs is None else slugs
    if not isinstance(cfg, dict): return ["the file must hold one JSON object"]
    if not isint(cfg.get("version"), 1, 1000): errs.append("version must be a whole number")
    caps = cfg.get("caps")
    if not (isinstance(caps, dict) and isint(caps.get("daily_total")) and isint(caps.get("daily_per_game"))):
        errs.append("caps needs whole numbers daily_total and daily_per_game")
        caps = {"daily_total": MAX, "daily_per_game": MAX}
    elif caps["daily_per_game"] > caps["daily_total"]:
        errs.append("caps: daily_per_game is higher than daily_total")
    if "kidsCoins" in cfg and not isinstance(cfg["kidsCoins"], bool): errs.append("kidsCoins must be true or false")

    rules = cfg.get("rules")
    if not isinstance(rules, dict) or not rules:
        errs.append("rules is missing"); rules = {}
    for rid, r in rules.items():
        w = f"rules.{rid}"
        if not isinstance(r, dict): errs.append(f"{w}: must be an object"); continue
        for k in r:
            if k not in RULE_FIELDS: errs.append(f"{w}: unknown field \"{k}\"")
        if "amount" in r: check_amount(r["amount"], w, errs)
        elif rid != "streak_bonus": errs.append(f"{w}: amount is missing")
        if "enabled" in r and not isinstance(r["enabled"], bool): errs.append(f"{w}: enabled must be true or false")
        if "once" in r and r["once"] not in ONCE: errs.append(f"{w}: once must be one of {sorted(ONCE)}")
        for k in ("perDay", "perGamePerDay", "max", "min", "minStreak"):
            if k in r and not isint(r[k]): errs.append(f"{w}: {k} must be a whole number")

    cat = cfg.get("catalogue")
    if not isinstance(cat, dict) or not cat:
        errs.append("catalogue is missing"); cat = {}
    for key, it in cat.items():
        w = f"catalogue.{key}"
        if "*" in key[:-1]: errs.append(f"{w}: a * may only be the last character")
        if not isinstance(it, dict): errs.append(f"{w}: must be an object"); continue
        for k in it:
            if k not in ITEM_FIELDS: errs.append(f"{w}: unknown field \"{k}\"")
        if it.get("type") not in ("consumable", "unlock"): errs.append(f"{w}: type must be consumable or unlock")
        if not isint(it.get("price")): errs.append(f"{w}: price must be a whole number from 1 to {MAX}")
        if "freeUpTo" in it and not isint(it["freeUpTo"], 0, 100000): errs.append(f"{w}: freeUpTo must be a whole number")
        gpart = key.split(":")[0] if ":" in key else None
        if gpart and slugs and gpart not in slugs: errs.append(f"{w}: no game folder named \"{gpart}\"")

    auto = cfg.get("auto", {})
    if not isinstance(auto, dict): errs.append("auto must be an object"); auto = {}
    for slug in auto.get("exclude", []):
        if slugs and slug not in slugs: errs.append(f"auto.exclude: no game folder named \"{slug}\"")
    for k, rid in (auto.get("rules") or {}).items():
        if k not in AUTO_KEYS: errs.append(f"auto.rules: unknown key \"{k}\" (use {sorted(AUTO_KEYS)})")
        elif rid not in rules: errs.append(f"auto.rules.{k}: there is no rule called \"{rid}\"")

    games = cfg.get("games", {})
    if not isinstance(games, dict): errs.append("games must be an object"); games = {}
    for slug, g in games.items():
        w = f"games.{slug}"
        if slugs and slug not in slugs: errs.append(f"{w}: no game folder named \"{slug}\"")
        if not isinstance(g, dict): errs.append(f"{w}: must be an object"); continue
        for k in g:
            if k not in GAME_FIELDS: errs.append(f"{w}: unknown field \"{k}\" (use {sorted(GAME_FIELDS)})")
        if "coins" in g and not isinstance(g["coins"], bool): errs.append(f"{w}.coins must be true or false")
        if "dailyCap" in g:
            if not isint(g["dailyCap"]): errs.append(f"{w}.dailyCap must be a whole number")
            elif g["dailyCap"] > caps["daily_total"]: errs.append(f"{w}.dailyCap is higher than the daily total ({caps['daily_total']})")
        for rid, v in (g.get("earn") or {}).items():
            ww = f"{w}.earn.{rid}"
            if rid not in rules: errs.append(f"{ww}: there is no rule called \"{rid}\""); continue
            if v is False: continue
            if isinstance(v, dict):
                for k in v:
                    if k not in OVERRIDE_FIELDS: errs.append(f"{ww}: unknown field \"{k}\"")
                if "amount" in v: check_amount(v["amount"], ww, errs)
            elif not isint(v): errs.append(f"{ww}: use a whole number, false, or an object (got {v!r})")
        for iid, v in (g.get("items") or {}).items():
            ww = f"{w}.items.{iid}"
            if iid not in cat: errs.append(f"{ww}: there is no catalogue item called \"{iid}\" (use the exact name)")
            elif v is not False and not isint(v): errs.append(f"{ww}: use a whole price number or false (got {v!r})")

    dc = cfg.get("dailyChallenges", [])
    if not isinstance(dc, list): errs.append("dailyChallenges must be a list"); dc = []
    for i, d in enumerate(dc):
        if not (isinstance(d, dict) and d.get("game") and d.get("title")): errs.append(f"dailyChallenges[{i}] needs a game and a title")
        elif slugs and d["game"] not in slugs: errs.append(f"dailyChallenges[{i}]: no game folder named \"{d['game']}\"")
    return errs


def load_and_check(path=DEFAULT):
    try:
        with open(path, encoding="utf-8") as f: cfg = json.load(f)
    except Exception as e:
        return [f"cannot read {os.path.basename(path)}: {e}"]
    return check(cfg)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT
    errs = load_and_check(path)
    if errs:
        print(f"{os.path.basename(path)}: {len(errs)} problem(s)")
        for e in errs: print("  - " + e)
        sys.exit(1)
    print(f"{os.path.basename(path)}: OK")
