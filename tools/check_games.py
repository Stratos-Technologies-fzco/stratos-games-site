#!/usr/bin/env python3
"""check_games.py: the Stratos quality checks a game must pass before it goes from staging to live.

Usage:
  python3 tools/check_games.py --changed origin/main origin/staging   check games that differ between two branches
  python3 tools/check_games.py slug1 slug2 ...                         check these game folders
Writes checks.json, checks.md and screenshots to $CHECKS_OUT (default: the temp folder), and prints the table.

Checks (Sahil, 7 Nov 2026):
  cover       a real thumbnail.png / .jpg / .webp, not a plain name card
  clip        a 6-second hover clip of real play: games/<folder>/preview.mp4 or assets/previews/<folder>.mp4 (#71)
  analytics   Stratos track() with level_start and level_complete or game_over (kids games are exempt)
  details     game.json has a title, a how_to_play line, a description of 150+ words, controls and tips
              (#70: a full page for Google, AI answers and AdSense; a thin page waits)
  files       no single file over 100 MB, no mobile app ad IDs (ca-app-pub-)
  coins       a way to spend Stratos Coins (Stratos.coins.offer / spend). A WARNING only, it never keeps a game off live.
              A game with nothing to spend on purpose says so in game.json: "coins": {"spend": false, "why": "..."}
  phone       opens on a phone screen with no scrolling and no crash
  computer    opens on a computer screen with no scrolling and no crash
The phone and computer checks need Playwright (pip install playwright; playwright install chromium).
If Playwright is missing they are skipped, not failed.
"""
import json, os, re, subprocess, sys, tempfile, threading, functools, http.server

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = os.path.join(ROOT, "games")
MAX_FILE = 100 * 1024 * 1024
OUT = os.environ.get("CHECKS_OUT") or os.path.join(tempfile.gettempdir(), "stratos-checks")
SIZES = {"phone": dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2),
         "computer": dict(viewport={"width": 1366, "height": 768})}


def changed_slugs(base, head):
    out = subprocess.run(["git", "diff", "--name-only", base, head, "--", "games/"], cwd=ROOT, capture_output=True, text=True).stdout
    return sorted({p.split("/")[1] for p in out.split() if p.count("/") >= 2})


def read_text(folder):
    """All html/js text in the folder (Unity/Godot builds included), for the analytics check."""
    buf = []
    for dp, _, fs in os.walk(folder):
        if "/node_modules" in dp or "/vendor" in dp:
            continue
        for f in fs:
            if f.endswith((".html", ".js", ".jslib")):
                try:
                    with open(os.path.join(dp, f), encoding="utf-8", errors="ignore") as fh:
                        buf.append(fh.read())
                except OSError:
                    pass
    return "\n".join(buf)


def spends_coins(text):
    """True when the game's code asks the site's wallet to spend Stratos Coins (works on minified builds too: it looks for .coins and .offer( / .spend()."""
    return bool(re.search(r"\.coins\b", text)) and bool(re.search(r"\.(offer|spend)\(", text))


def static_checks(slug):
    folder = os.path.join(GAMES, slug)
    r = {"slug": slug, "checks": {}, "notes": []}
    c = r["checks"]
    try:
        g = json.load(open(os.path.join(folder, "game.json"), encoding="utf-8"))
    except Exception as e:
        c["details"] = False; r["notes"].append(f"game.json is missing or broken ({e.__class__.__name__})")
        return r, {}
    r["title"] = g.get("title") or slug
    try:
        hidden = json.load(open(os.path.join(ROOT, "site.json"), encoding="utf-8")).get("hidden_on_live", {})
    except Exception:
        hidden = {}
    if slug in hidden:
        r["notes"].append(f"hidden on live until Mohua passes it ({hidden[slug]})")
    r["maker"] = g.get("github") or slug.split("-")[0]
    if g.get("status") == "coming_soon":
        r["soon"] = True
        return r, g
    c["details"] = bool(g.get("title")) and bool(g.get("how_to_play"))
    if not c["details"]: r["notes"].append("game.json needs a title and a how_to_play line")
    # #70: a full page for Google, AI answers and AdSense (they rejected a thin site once): 150+ words, controls, tips
    d = g.get("description") or ""
    words = len(re.findall(r"[A-Za-z0-9']+", " ".join(map(str, d)) if isinstance(d, list) else str(d)))
    thin = ([f"a description of 150+ words (it has {words})"] if words < 150 else []) + \
           ([] if g.get("controls") else ["controls"]) + ([] if g.get("tips") else ["tips"])
    if thin:
        c["details"] = False
        r["notes"].append("page too thin for Google and AdSense: add " + ", ".join(thin) + " to game.json (CLAUDE.md: A full game page)")
    thumb = next((f for f in ("thumbnail.png", "thumbnail.jpg", "thumbnail.webp") if os.path.exists(os.path.join(folder, f))), None)
    c["cover"] = bool(thumb)
    if not thumb: r["notes"].append("no cover: add thumbnail.png (800 x 500, a picture from the game)")
    clip = next((p for p in (os.path.join(folder, "preview.mp4"), os.path.join(ROOT, "assets", "previews", slug + ".mp4")) if os.path.exists(p)), None)
    c["clip"] = bool(clip)
    if not clip: r["notes"].append("no hover clip: make a 6-second clip of real play with tools/make_clip.py (CLAUDE.md: Hover clip)")
    if g.get("category") == "kids":
        c["analytics"] = None; r["notes"].append("kids game: no analytics needed")
    else:
        t = read_text(folder)
        ok = "level_start" in t and ("level_complete" in t or "game_over" in t) and "Stratos" in t
        c["analytics"] = ok
        if not ok: r["notes"].append("Stratos analytics missing: track('level_start') and track('level_complete') or track('game_over')")
    # Stratos Coins: does the game offer a way to spend them? A warning, not a block (see "Stratos Coins" in CLAUDE.md).
    cn = g.get("coins") if isinstance(g.get("coins"), dict) else {}
    if cn.get("spend") is False:
        c["coins"] = None
        r["notes"].append("coins: nothing to spend on, on purpose (" + (cn.get("why") or "add a why to game.json coins") + ")")
    elif spends_coins(read_text(folder)):
        c["coins"] = True
    else:
        c["coins"] = "warn"
        r["notes"].append("coins (does not block): no way to spend Stratos Coins yet. Add one (CLAUDE.md, section Stratos Coins) or set game.json \"coins\": {\"spend\": false, \"why\": \"...\"}")
    big, adid, total = [], False, 0
    for dp, _, fs in os.walk(folder):
        for f in fs:
            p = os.path.join(dp, f); s = os.path.getsize(p); total += s
            if s > MAX_FILE: big.append(os.path.relpath(p, folder))
            if f.endswith((".html", ".js", ".json")) and s < 30 * 1024 * 1024:
                try:
                    if "ca-app-pub-" in open(p, encoding="utf-8", errors="ignore").read(): adid = True
                except OSError:
                    pass
    c["files"] = not big and not adid
    if big: r["notes"].append("files over 100 MB: " + ", ".join(big[:3]))
    if adid: r["notes"].append("remove the mobile app ad ID (ca-app-pub-), web games never use it")
    r["size_mb"] = round(total / 1048576, 1)
    return r, g


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=ROOT)
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, s.server_address[1]


def screen_checks(results):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        for r in results:
            if not r.get("soon"): r["checks"]["phone"] = r["checks"]["computer"] = None
        return
    srv, port = serve()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for r in results:
            if r.get("soon") or not os.path.exists(os.path.join(GAMES, r["slug"], "index.html")):
                continue
            for name, opts in SIZES.items():
                ctx = b.new_context(**opts); page = ctx.new_page(); crashes = []
                page.on("pageerror", lambda e, c=crashes: c.append(str(e)[:120]))
                try:
                    page.goto(f"http://127.0.0.1:{port}/games/{r['slug']}/index.html", wait_until="load", timeout=30000)
                    page.wait_for_timeout(3000)
                    m = page.evaluate("""() => { const e = document.scrollingElement || document.documentElement;
                        let box = 0;   /* a big box inside the page that scrolls also counts */
                        for (const el of document.querySelectorAll('body *')) {
                          const st = getComputedStyle(el), r = el.getBoundingClientRect();
                          if (st.display === 'none' || st.visibility === 'hidden' || r.width * r.height < innerWidth * innerHeight * 0.25) continue;
                          if (/(auto|scroll)/.test(st.overflowY + st.overflowX) && (el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4)) { box = 1; break; }
                        }
                        return {h: e.scrollHeight, w: e.scrollWidth, ih: innerHeight, iw: innerWidth, box}; }""")
                    scrolls = m["h"] > m["ih"] + 4 or m["w"] > m["iw"] + 4 or m["box"]
                    ok = not scrolls and not crashes
                    if scrolls: r["notes"].append(f"{name}: the screen scrolls, make it fit with no scrolling")
                    if crashes: r["notes"].append(f"{name}: error on open: {crashes[0]}")
                    path = os.path.join(OUT, "shots", f"{r['slug']}-{name}.png")
                    os.makedirs(os.path.dirname(path), exist_ok=True)
                    page.screenshot(path=path)
                except Exception as e:
                    ok = False; r["notes"].append(f"{name}: did not open ({str(e)[:80]})")
                r["checks"][name] = ok
                ctx.close()
        b.close()
    srv.shutdown()


def coins_config_line():
    """One line for the report: is assets/coins-config.json valid? (tools/check_coins_config.py)"""
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import check_coins_config
        errs = check_coins_config.load_and_check()
    except Exception as e:
        return f"**Coins config:** could not be checked ({e.__class__.__name__})"
    if not errs: return "**Coins config:** ✅ valid"
    return "**Coins config:** ❌ " + str(len(errs)) + " problem(s) in assets/coins-config.json: " + "; ".join(errs[:5])


def verdict(r):
    if r.get("soon"): return "soon"
    return "ready" if all(v is not False for v in r["checks"].values()) else "fix"


def table(results):
    mark = {True: "✅", False: "❌", None: "–", "warn": "⚠️"}
    cols = ["cover", "clip", "analytics", "details", "files", "coins", "phone", "computer"]
    rows = ["| Game | Maker | Ready? | " + " | ".join(cols) + " | What to fix |", "|" + "---|" * (len(cols) + 4)]
    for r in sorted(results, key=lambda r: (verdict(r) != "fix", r.get("title", r["slug"]).lower())):
        v = verdict(r)
        if v == "soon":
            continue
        fix = "; ".join(n for n in r["notes"] if not n.startswith("kids game")) or "nothing"
        rows.append(f"| {r.get('title', r['slug'])} | @{r.get('maker', '?')} | {'✅ goes live' if v == 'ready' else '❌ waits'} | "
                    + " | ".join(mark[r['checks'].get(c)] for c in cols) + f" | {fix} |")
    return "\n".join(rows)


def main(argv):
    if argv[:1] == ["--changed"]:
        slugs = [s for s in changed_slugs(argv[1], argv[2]) if os.path.isdir(os.path.join(GAMES, s))]
    else:
        slugs = argv
    results = [static_checks(s)[0] for s in slugs]
    screen_checks(results)
    for r in results: r["verdict"] = verdict(r)
    os.makedirs(OUT, exist_ok=True)
    json.dump(results, open(os.path.join(OUT, "checks.json"), "w"), indent=1)
    md = table(results) if any(r["verdict"] != "soon" for r in results) else "No game changes waiting on staging."
    md += "\n\n" + coins_config_line()
    open(os.path.join(OUT, "checks.md"), "w").write(md + "\n")
    print(md)


if __name__ == "__main__":
    main(sys.argv[1:])
