#!/usr/bin/env python3
"""build.py: turns games/*/game.json into the front page (index.html) and games.json.

Rules it enforces (so nobody's push can break the page):
  - a game shows only if games/<slug>/game.json AND games/<slug>/index.html exist
  - game.json must have "title" and "maker"; everything else is optional
  - bad JSON in one folder skips that folder and reports it; the page still builds
Run:  python3 tools/build.py        (the GitHub Action runs it on every push)
"""
import json, os, re, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = os.path.join(ROOT, "games")
SITE = json.load(open(os.path.join(ROOT, "site.json"), encoding="utf-8"))

def esc(s): return html.escape(str(s or ""))

def load_games():
    games, problems = [], []
    for slug in sorted(os.listdir(GAMES)):
        d = os.path.join(GAMES, slug)
        if not os.path.isdir(d) or slug.startswith((".", "_")): continue
        meta, page = os.path.join(d, "game.json"), os.path.join(d, "index.html")
        if not os.path.exists(meta) or not os.path.exists(page):
            problems.append(f"{slug}: needs both game.json and index.html"); continue
        try:
            g = json.load(open(meta, encoding="utf-8"))
        except Exception as e:
            problems.append(f"{slug}: game.json is not valid JSON ({e})"); continue
        if not g.get("title") or not g.get("maker"):
            problems.append(f"{slug}: game.json needs \"title\" and \"maker\""); continue
        g["slug"] = slug
        thumb = g.get("thumbnail") or next((f for f in ("thumbnail.png", "thumbnail.jpg", "thumbnail.webp") if os.path.exists(os.path.join(d, f))), None)
        g["thumb_url"] = f"games/{slug}/{thumb}" if thumb else ""
        g["url"] = f"games/{slug}/"
        g["added"] = g.get("added") or datetime.date.fromtimestamp(os.path.getmtime(meta)).isoformat()
        games.append(g)
    games.sort(key=lambda g: g["added"], reverse=True)
    return games, problems

def card(g):
    thumb = f'<img src="{esc(g["thumb_url"])}" alt="{esc(g["title"])}" loading="lazy">' if g["thumb_url"] else '<div class="ph"></div>'
    return (f'<a class="card" href="{esc(g["url"])}">{thumb}<div class="cb"><div class="t">{esc(g["title"])}</div>'
            f'<div class="m">by {esc(g["maker"])}</div>{("<div class=\"o\">" + esc(g.get("one_line")) + "</div>") if g.get("one_line") else ""}'
            f'<span class="play">Play</span></div></a>')

def studio_card(s):
    return (f'<a class="card studio" href="{esc(s["url"])}">{("<img src=\"" + esc(s["image"]) + "\" alt=\"" + esc(s["title"]) + "\" loading=\"lazy\">") if s.get("image") else "<div class=\"ph\"></div>"}'
            f'<div class="cb"><div class="t">{esc(s["title"])}</div><div class="o">{esc(s.get("one_line"))}</div><span class="play">{esc(s.get("cta") or "Get it")}</span></div></a>')

def build():
    games, problems = load_games()
    tpl = open(os.path.join(ROOT, "templates", "index.html"), encoding="utf-8").read()
    grid = "\n".join(card(g) for g in games) if games else '<p class="empty">The first game is coming. Watch this space.</p>'
    studio = "\n".join(studio_card(s) for s in SITE.get("studio_games", []))
    out = (tpl.replace("{{GRID}}", grid).replace("{{STUDIO}}", studio)
              .replace("{{COUNT}}", str(len(games))).replace("{{YEAR}}", str(datetime.date.today().year))
              .replace("{{TAGLINE}}", esc(SITE.get("tagline"))).replace("{{SITE_URL}}", esc(SITE.get("url"))))
    open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(out)
    json.dump({"generated": datetime.datetime.utcnow().isoformat() + "Z", "games": [
        {k: g.get(k) for k in ("slug", "title", "maker", "one_line", "url", "thumb_url", "added", "github")} for g in games]},
        open(os.path.join(ROOT, "games.json"), "w", encoding="utf-8"), indent=1)
    print(f"built index.html with {len(games)} game(s)")
    for p in problems: print("  skipped:", p)

if __name__ == "__main__":
    build()
