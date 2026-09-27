#!/usr/bin/env python3
"""build.py: the stratos.games portal builder.

Reads site.json and games/*/game.json, writes:
  index.html                 the portal front page (sidebar, search, featured, rows of tiles)
  play/<slug>/index.html     one play page per family game (frame, fullscreen, description, more games)
  c/<category>/index.html    one page per category
  games.json                 the catalog (for search and for future apps)
  sitemap.xml, robots.txt, llms.txt, 404.html
Rules: a game shows only if games/<slug>/ has game.json AND index.html; broken JSON skips that
folder and names it; the page always builds. Run: python3 tools/build.py (the Action runs it on push).
"""
import json, os, re, html, datetime, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = os.path.join(ROOT, "games")
SITE = json.load(open(os.path.join(ROOT, "site.json"), encoding="utf-8"))
CATS = {c["id"]: c for c in SITE["categories"]}
YEAR = str(datetime.date.today().year)
TODAY = datetime.date.today().isoformat()

def esc(s): return html.escape(str(s or ""), quote=True)
def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def write(p, s):
    full = os.path.join(ROOT, p); os.makedirs(os.path.dirname(full) or ROOT, exist_ok=True)
    open(full, "w", encoding="utf-8").write(s)

ICONS = {
 "sparkle": '<path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/><path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6L15.5 18.5l2.6-.9z"/>',
 "fire": '<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-6 0 2 1 3 2 3 0-4 2-7 5-9 0 3 1 4 2 5 2 2 3 4 3 7 0 4-3 7-8 7z"/>',
 "joystick": '<circle cx="12" cy="6" r="3"/><path d="M12 9v6"/><rect x="4" y="15" width="16" height="6" rx="2"/>',
 "puzzle": '<path d="M10 3h4v3a2 2 0 1 0 4 0h3v4h-3a2 2 0 1 0 0 4h3v4h-4v-3a2 2 0 1 0-4 0v3H6v-4H3v-4h3a2 2 0 1 0 0-4H3V6h3v3a2 2 0 1 0 4 0z"/>',
 "word": '<path d="M4 6h16M4 12h10M4 18h13"/>',
 "party": '<path d="M4 20l4-12 8 8z"/><path d="M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M19 12l.7 1.3L21 14l-1.3.7L19 16l-.7-1.3L17 14l1.3-.7z"/>',
 "ball": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 "star": '<path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17l-5.5 3 1.1-6.2L3 9.5l6.2-.9z"/>',
 "studio": '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
 "home": '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 "search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 "full": '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
}
def icon(name, size=18):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS.get(name, ICONS["star"])}</svg>'

def cover_svg(title, seed):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16) % 360
    t = esc(title)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="hsl({h},70%,45%)"/><stop offset="1" stop-color="hsl({(h+60)%360},70%,30%)"/></linearGradient></defs>'
            f'<rect width="800" height="500" fill="url(#g)"/><circle cx="650" cy="120" r="140" fill="rgba(255,255,255,.08)"/><circle cx="150" cy="420" r="180" fill="rgba(0,0,0,.12)"/>'
            f'<text x="50%" y="52%" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="64" font-weight="900" fill="#fff" style="paint-order:stroke;stroke:rgba(0,0,0,.25);stroke-width:8px">{t}</text></svg>')

def load_games():
    games, problems = [], []
    for slug in sorted(os.listdir(GAMES)):
        d = os.path.join(GAMES, slug)
        if not os.path.isdir(d) or slug.startswith((".", "_")): continue
        meta, page = os.path.join(d, "game.json"), os.path.join(d, "index.html")
        if not os.path.exists(meta) or not os.path.exists(page):
            problems.append(f"{slug}: needs both game.json and index.html"); continue
        try: g = json.load(open(meta, encoding="utf-8"))
        except Exception as e: problems.append(f"{slug}: game.json is not valid JSON ({e})"); continue
        if not g.get("title") or not g.get("maker"): problems.append(f"{slug}: game.json needs \"title\" and \"maker\""); continue
        g["slug"] = slug
        g["category"] = g.get("category") if g.get("category") in CATS else "arcade"
        thumb = g.get("thumbnail") or next((f for f in ("thumbnail.png", "thumbnail.jpg", "thumbnail.webp", "thumbnail.svg") if os.path.exists(os.path.join(d, f))), None)
        if not thumb:
            write(f"games/{slug}/thumbnail.svg", cover_svg(g["title"], slug)); thumb = "thumbnail.svg"
        g["thumb"] = f"games/{slug}/{thumb}"
        g["game_url"] = f"games/{slug}/"
        g["url"] = f"play/{slug}/"
        g["added"] = g.get("added") or datetime.date.fromtimestamp(os.path.getmtime(meta)).isoformat()
        g["kind"] = "family"
        games.append(g)
    games.sort(key=lambda g: g["added"], reverse=True)
    return games, problems

def studio_games():
    out = []
    for s in SITE["studio_games"]:
        s = dict(s); s["kind"] = "studio"; s["maker"] = "Stratos Games"; s["thumb"] = s.get("image") or ""
        if s["thumb"].endswith(".svg") and not os.path.exists(os.path.join(ROOT, s["thumb"])):
            write(s["thumb"], cover_svg(s["title"], s["slug"]))
        s["url"] = s.get("play_url") or s.get("page")
        s["external"] = bool(s.get("play_url") or s.get("store_url")) and not s.get("play_url", "").startswith("games/")
        out.append(s)
    return out

def tile(g, base="", big=False):
    href = base + g["url"] if not str(g["url"]).startswith("http") else g["url"]
    ext = ' target="_blank" rel="noopener"' if str(g["url"]).startswith("http") else ""
    badge = ('<span class="badge new">New</span>' if g.get("kind") == "family" and g.get("added", "") >= (datetime.date.today() - datetime.timedelta(days=14)).isoformat() else
             ('<span class="badge soon">Soon</span>' if g.get("cta") == "Coming soon" else ""))
    return (f'<a class="tile{" big" if big else ""}" href="{esc(href)}"{ext} data-title="{esc(g["title"])}" data-maker="{esc(g["maker"])}" data-cat="{esc(g["category"])}">'
            f'<img src="{esc(base + g["thumb"])}" alt="{esc(g["title"])}" loading="lazy">{badge}'
            f'<div class="tl"><div class="tt">{esc(g["title"])}</div><div class="tm">{esc(g["maker"])}</div></div></a>')

def row(title, items, base="", cat_id=None, sub=""):
    if not items: return ""
    more = f'<a class="more" href="{base}c/{cat_id}/">See all</a>' if cat_id else ""
    return (f'<section class="row" id="{esc(cat_id or title.lower())}"><div class="rh"><h2>{esc(title)}{f" <small>{esc(sub)}</small>" if sub else ""}</h2>{more}</div>'
            f'<div class="rail">{"".join(tile(g, base) for g in items)}</div></section>')

def sidebar(base="", active="home"):
    items = [f'<a class="{"on" if active=="home" else ""}" href="{base}./">{icon("home")}<span>Home</span></a>']
    for c in SITE["categories"]:
        items.append(f'<a class="{"on" if active==c["id"] else ""}" href="{base}c/{c["id"]}/">{icon(c["icon"])}<span>{esc(c["label"])}</span></a>')
    return '<nav class="side">' + "".join(items) + f'<div class="side-foot">{"".join(f"<a href=\"{base}{esc(n["href"])}\">{esc(n["label"])}</a>" for n in SITE["nav"])}</div></nav>'

def topbar(base=""):
    return (f'<header class="top"><a class="logo" href="{base}./"><span class="lm">S</span> STRATOS <b>GAMES</b></a>'
            f'<label class="search">{icon("search")}<input id="q" type="search" placeholder="Search games" autocomplete="off"></label>'
            f'<a class="add" href="https://github.com/Stratos-Technologies-fzco/stratos-games-site#join-one-paste-then-talk" target="_blank" rel="noopener">+ Add your game</a></header>')

def footer(base=""):
    links = "".join(f'<a href="{base}{esc(f["href"])}">{esc(f["label"])}</a>' for f in SITE["footer"])
    return f'<footer class="foot"><div>{links}</div><div class="fine">© {YEAR} Stratos Games · {esc(SITE["tagline"])} · admin@stratos.games</div></footer>'

def head(title, desc, canon, base="", og_image="", jsonld=None):
    ga = f'<script async src="https://www.googletagmanager.com/gtag/js?id={SITE["analytics_id"]}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config","{SITE["analytics_id"]}");</script>' if SITE.get("analytics_id") else ""
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            f'<title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{esc(canon)}">'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="Stratos Games"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(canon)}">'
            f'{f"<meta property=\"og:image\" content=\"{esc(og_image)}\"><meta name=\"twitter:card\" content=\"summary_large_image\">" if og_image else ""}'
            f'<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="{base}assets/favicon.svg">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">'
            f'<link rel="stylesheet" href="{base}assets/site.css">{ga}{ld}</head>')

SEARCH_JS = """<script>
(function(){var q=document.getElementById('q');if(!q)return;var tiles=[].slice.call(document.querySelectorAll('.tile'));var rows=[].slice.call(document.querySelectorAll('.row'));var res=document.getElementById('results');
q.addEventListener('input',function(){var v=q.value.trim().toLowerCase();if(!v){rows.forEach(function(r){r.style.display=''});if(res)res.style.display='none';return}
var hits=tiles.filter(function(t){return (t.dataset.title+' '+t.dataset.maker+' '+t.dataset.cat).toLowerCase().indexOf(v)>-1});rows.forEach(function(r){r.style.display='none'});
if(res){res.style.display='';res.querySelector('.rail').innerHTML='';var seen={};hits.forEach(function(t){if(seen[t.href])return;seen[t.href]=1;res.querySelector('.rail').appendChild(t.cloneNode(true))});res.querySelector('h2').textContent=hits.length?('Results for "'+q.value+'"'):('Nothing for "'+q.value+'"');}});})();
</script>"""

def build_home(fam, studio):
    all_games = fam + studio
    featured = [g for g in studio if g.get("featured")][:1] + fam[:3]
    by_cat = {}
    for g in all_games: by_cat.setdefault(g["category"], []).append(g)
    hero = ""
    if featured:
        f0 = featured[0]; href = f0["url"] if str(f0["url"]).startswith("http") else f0["url"]
        hero = (f'<section class="hero"><a class="hero-main" href="{esc(href)}"{" target=\"_blank\" rel=\"noopener\"" if str(href).startswith("http") else ""}>'
                f'<img src="{esc(f0["thumb"])}" alt=""><div class="hero-txt"><div class="kick">Featured</div><h1>{esc(f0["title"])}</h1><p>{esc(f0.get("one_line"))}</p><span class="btn">{esc(f0.get("cta") or "Play")}</span></div></a>'
                f'<div class="hero-side">{"".join(tile(g) for g in featured[1:4])}</div></section>')
    rows = [row("New this week", fam[:12], cat_id="new", sub="from the Stratos family")]
    for c in SITE["categories"]:
        if c["id"] in ("new", "popular", "studio"): continue
        rows.append(row(c["label"], by_cat.get(c["id"], []), cat_id=c["id"]))
    rows.append(row("From the studio", studio, cat_id="studio", sub="humans test, AI builds, games ship"))
    jsonld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Organization", "@id": SITE["url"] + "/#org", "name": "Stratos Games", "url": SITE["url"] + "/", "email": SITE["contact"], "logo": SITE["url"] + "/assets/favicon.svg",
         "founder": [{"@type": "Person", "name": "Sahil Modi", "@id": "https://stratostech.academy/#person-sahil-modi"}, {"@type": "Person", "name": "Shahariar Mody"}]},
        {"@type": "WebSite", "@id": SITE["url"] + "/#site", "url": SITE["url"] + "/", "name": "Stratos Games", "publisher": {"@id": SITE["url"] + "/#org"}}]}
    body = (f'<body>{topbar()}<div class="shell">{sidebar()}<main class="main">{hero}'
            f'<section class="row" id="results" style="display:none"><div class="rh"><h2></h2></div><div class="rail"></div></section>'
            f'{"".join(rows)}<section class="pitch"><h2>Make a game. Put it here.</h2><p>Every game on this page was built by a person and an AI in a few hours, and pushed to one shared folder. Yours can be next.</p>'
            f'<a class="btn" href="https://github.com/Stratos-Technologies-fzco/stratos-games-site#join-one-paste-then-talk" target="_blank" rel="noopener">How to add your game</a></section>{footer()}</main></div>{SEARCH_JS}</body></html>')
    write("index.html", head("Stratos Games: free browser games, new every week", SITE["description"], SITE["url"] + "/", og_image=SITE["url"] + "/assets/og.png", jsonld=jsonld) + body)

def build_category(cid, items, fam, studio):
    c = CATS[cid]; base = "../../"
    pool = (fam if cid == "new" else studio if cid == "studio" else items)
    body = (f'<body>{topbar(base)}<div class="shell">{sidebar(base, cid)}<main class="main"><section class="row"><div class="rh"><h2>{esc(c["label"])} <small>{len(pool)} games</small></h2></div>'
            f'<div class="grid">{"".join(tile(g, base) for g in pool) or "<p class=\"empty\">Nothing here yet. Be the first: add your game.</p>"}</div></section>{footer(base)}</main></div></body></html>')
    write(f"c/{cid}/index.html", head(f"{c['label']} games | Stratos Games", f"Free {c['label'].lower()} games to play in your browser on Stratos Games.", f"{SITE['url']}/c/{cid}/", base=base) + body)

def build_play(g, fam, studio):
    base = "../../"; more = [x for x in fam + studio if x["slug"] != g["slug"]][:8]
    desc = g.get("description") or g.get("one_line") or f"{g['title']} by {g['maker']}, free to play on Stratos Games."
    jsonld = {"@context": "https://schema.org", "@type": "VideoGame", "name": g["title"], "url": f"{SITE['url']}/play/{g['slug']}/", "image": f"{SITE['url']}/{g['thumb']}",
              "description": desc, "genre": CATS[g["category"]]["label"], "gamePlatform": "Web browser", "applicationCategory": "Game", "operatingSystem": "Any",
              "author": {"@type": "Person", "name": g["maker"]}, "publisher": {"@id": SITE["url"] + "/#org"}, "isAccessibleForFree": True, "datePublished": g["added"]}
    body = (f'<body>{topbar(base)}<div class="shell">{sidebar(base, g["category"])}<main class="main play">'
            f'<div class="stage"><iframe id="game" src="{base}{esc(g["game_url"])}" title="{esc(g["title"])}" allow="fullscreen; autoplay; gamepad" allowfullscreen loading="eager"></iframe>'
            f'<div class="stage-bar"><div><b>{esc(g["title"])}</b> <span class="tm">by {esc(g["maker"])}</span></div><button class="fs" onclick="var f=document.getElementById(\'game\');(f.requestFullscreen||f.webkitRequestFullscreen).call(f)">{icon("full", 16)} Fullscreen</button></div></div>'
            f'<section class="about-game"><h1>{esc(g["title"])}</h1><p class="lead">{esc(g.get("one_line"))}</p>{f"<p>{esc(g.get("description"))}</p>" if g.get("description") else ""}'
            f'<p class="meta">Category: <a href="{base}c/{g["category"]}/">{esc(CATS[g["category"]]["label"])}</a> · Made by {esc(g["maker"])}{f" · <a href=\"https://github.com/{esc(g["github"])}\" target=\"_blank\" rel=\"noopener\">GitHub</a>" if g.get("github") else ""} · Added {esc(g["added"])} · Free, no install</p></section>'
            f'{row("More games", more, base)}{footer(base)}</main></div></body></html>')
    write(f"play/{g['slug']}/index.html", head(f"{g['title']} by {g['maker']} | Play free on Stratos Games", desc, f"{SITE['url']}/play/{g['slug']}/", base=base, og_image=f"{SITE['url']}/{g['thumb']}", jsonld=jsonld) + body)

def build_extras(fam, studio):
    urls = [SITE["url"] + "/"] + [f"{SITE['url']}/play/{g['slug']}/" for g in fam] + [f"{SITE['url']}/c/{c['id']}/" for c in SITE["categories"]]
    for slug in ("about", "press", "for-publishers", "games-bloxplode", "games-arrow-puzzle", "games-house-mafia", "games-word-quest", "privacy-policy", "terms-of-use"):
        if os.path.exists(os.path.join(ROOT, slug, "index.html")): urls.append(f"{SITE['url']}/{slug}/")
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{esc(u)}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {SITE['url']}/sitemap.xml\n")
    lines = [f"# Stratos Games", "", SITE["description"], "", "## Play (free browser games)"] + [f"- [{g['title']}]({SITE['url']}/play/{g['slug']}/): {g.get('one_line','')} Made by {g['maker']}." for g in fam] + ["", "## Studio titles"] + [f"- [{s['title']}]({SITE['url']}/{s['page']}): {s['one_line']}" for s in studio] + ["", "## Pages", f"- About: {SITE['url']}/about/", f"- For publishers: {SITE['url']}/for-publishers/", f"- Press kit: {SITE['url']}/press/", f"- Contact: {SITE['contact']}"]
    write("llms.txt", "\n".join(lines) + "\n")
    write("404.html", head("Page not found | Stratos Games", "That page is not here.", SITE["url"] + "/404.html") + f'<body>{topbar()}<div class="shell">{sidebar()}<main class="main"><section class="pitch"><h2>404. That page is not here.</h2><p>Try the games instead.</p><a class="btn" href="/">Back to the games</a></section>{footer()}</main></div></body></html>')
    json.dump({"generated": datetime.datetime.now(datetime.timezone.utc).isoformat(), "games": [{k: g.get(k) for k in ("slug", "title", "maker", "one_line", "category", "url", "thumb", "added", "github", "kind")} for g in fam + studio]},
              open(os.path.join(ROOT, "games.json"), "w", encoding="utf-8"), indent=1)

def main():
    fam, problems = load_games(); studio = studio_games()
    build_home(fam, studio)
    by_cat = {}
    for g in fam + studio: by_cat.setdefault(g["category"], []).append(g)
    for c in SITE["categories"]: build_category(c["id"], by_cat.get(c["id"], []), fam, studio)
    for g in fam: build_play(g, fam, studio)
    build_extras(fam, studio)
    print(f"built: home, {len(fam)} play page(s), {len(SITE['categories'])} category pages, sitemap, robots, llms.txt, 404")
    for p in problems: print("  skipped:", p)

if __name__ == "__main__":
    main()
