#!/usr/bin/env python3
"""build.py: the stratos.games portal builder.

Reads site.json and games/*/game.json, writes:
  index.html                 the front page: mood cards, the wall (big + small tiles), rows with arrows
  play/<slug>/index.html     one play page per family game (frame, fullscreen, share, side column)
  c/<category>/index.html    one page per category (a wall of that category)
  games.json                 the catalog (search, future apps)
  sitemap.xml, robots.txt, llms.txt, 404.html
Rules: a game shows only if games/<slug>/ has game.json AND index.html; broken JSON skips that
folder and names it; the page always builds. Run: python3 tools/build.py (the Action runs it on push).
"""
import json, os, html, datetime, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = os.path.join(ROOT, "games")
SITE = json.load(open(os.path.join(ROOT, "site.json"), encoding="utf-8"))
CATS = {c["id"]: c for c in SITE["categories"]}
YEAR = str(datetime.date.today().year)
TODAY = datetime.date.today().isoformat()
JOIN = "https://github.com/Stratos-Technologies-fzco/stratos-games-site#join-one-paste-then-talk"

def esc(s): return html.escape(str(s or ""), quote=True)
def write(p, s):
    full = os.path.join(ROOT, p); os.makedirs(os.path.dirname(full) or ROOT, exist_ok=True)
    open(full, "w", encoding="utf-8").write(s)

ICONS = {
 "sparkle": '<path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/><path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6L15.5 18.5l2.6-.9z"/>',
 "joystick": '<circle cx="12" cy="6" r="3"/><path d="M12 9v6"/><rect x="4" y="15" width="16" height="6" rx="2"/>',
 "puzzle": '<path d="M10 3h4v3a2 2 0 1 0 4 0h3v4h-3a2 2 0 1 0 0 4h3v4h-4v-3a2 2 0 1 0-4 0v3H6v-4H3v-4h3a2 2 0 1 0 0-4H3V6h3v3a2 2 0 1 0 4 0z"/>',
 "word": '<path d="M4 6h16M4 12h10M4 18h13"/>',
 "party": '<path d="M4 20l4-12 8 8z"/><path d="M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M19 12l.7 1.3L21 14l-1.3.7L19 16l-.7-1.3L17 14l1.3-.7z"/>',
 "ball": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 "star": '<path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17l-5.5 3 1.1-6.2L3 9.5l6.2-.9z"/>',
 "studio": '<path d="M5 19l3-3M12 4c3 0 7 1 8 8-7 1-8 5-8 5s-4-1-5-5c0-4 2-8 5-8z"/><circle cx="14" cy="10" r="1.5"/>',
 "home": '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 "search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 "full": '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 "share": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
 "flag": '<path d="M5 21V4h12l-2 4 2 4H5"/>',
 "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
 "chev": '<path d="M9 6l6 6-6 6"/>',
 "left": '<path d="M15 6l-6 6 6 6"/>',
 "right": '<path d="M9 6l6 6-6 6"/>',
 "github": '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/>',
}
def icon(name, size=18):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS.get(name, ICONS["star"])}</svg>'

def cover_svg(title, seed, sub=""):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16) % 360
    t = esc(title); sat, y = (70, "52%") if not sub else (35, "46%")
    subline = f'<text x="50%" y="64%" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="30" font-weight="800" fill="rgba(255,255,255,.85)">{esc(sub)}</text>' if sub else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="hsl({h},{sat}%,45%)"/><stop offset="1" stop-color="hsl({(h+60)%360},{sat}%,30%)"/></linearGradient></defs>'
            f'<rect width="800" height="500" fill="url(#g)"/><circle cx="650" cy="120" r="140" fill="rgba(255,255,255,.08)"/><circle cx="150" cy="420" r="180" fill="rgba(0,0,0,.12)"/>'
            f'<text x="50%" y="{y}" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="64" font-weight="900" fill="#fff" style="paint-order:stroke;stroke:rgba(0,0,0,.25);stroke-width:8px">{t}</text>{subline}</svg>')

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
        g["category"] = g.get("category") if g.get("category") in CATS and g.get("category") not in ("new", "studio") else "arcade"
        g["soon"] = str(g.get("status", "")).lower().replace("-", "_") in ("coming_soon", "placeholder", "soon", "wip")
        thumb = g.get("thumbnail") or next((f for f in ("thumbnail.png", "thumbnail.jpg", "thumbnail.webp", "thumbnail.svg") if os.path.exists(os.path.join(d, f))), None)
        if thumb and not g["soon"]:
            g["thumb"] = f"games/{slug}/{thumb}"
        else:
            write(f"assets/covers/generated/{slug}.svg", cover_svg(g["title"], slug, f"{g['maker']} is building this" if g["soon"] else ""))
            g["thumb"] = f"assets/covers/generated/{slug}.svg"
        g["game_url"] = f"games/{slug}/index.html"
        g["url"] = f"play/{slug}/"
        g["added"] = g.get("added") or datetime.date.fromtimestamp(os.path.getmtime(meta)).isoformat()
        g["kind"] = "family"
        games.append(g)
    games.sort(key=lambda g: g["added"], reverse=True)
    games.sort(key=lambda g: g["soon"])  # real games first (newest first), then the claimed boxes
    return games, problems

def studio_games():
    out = []
    for s in SITE["studio_games"]:
        s = dict(s); s["kind"] = "studio"; s["maker"] = "Stratos Games"; s["thumb"] = s.get("image") or ""
        if s["thumb"].endswith(".svg") and not os.path.exists(os.path.join(ROOT, s["thumb"])):
            write(s["thumb"], cover_svg(s["title"], s["slug"]))
        s["url"] = s.get("play_url") or s.get("page")
        out.append(s)
    out.sort(key=lambda s: not s.get("featured"))
    return out

def is_new(g):
    return g.get("kind") == "family" and not g.get("soon") and g.get("added", "") >= (datetime.date.today() - datetime.timedelta(days=14)).isoformat()

def badge(g):
    if is_new(g): return '<span class="badge new">New</span>'
    if g.get("soon") or g.get("cta") == "Coming soon": return '<span class="badge soon">Soon</span>'
    if g.get("kind") == "studio": return '<span class="badge studio">Studio</span>'
    return ""

def href_of(g, base):
    u = str(g["url"]); ext = u.startswith("http")
    return (u if ext else base + u), (' target="_blank" rel="noopener"' if ext else "")

def tile(g, base="", size=""):
    href, ext = href_of(g, base)
    tags = (f'Coming soon · {g["maker"]}' if g.get("soon") else f'{CATS[g["category"]]["label"]} · {g["maker"]}') if g.get("kind") == "family" else f'{CATS[g["category"]]["label"]} · {g.get("cta") or "Studio"}'
    return (f'<a class="tile{(" " + size) if size else ""}" href="{esc(href)}"{ext} data-title="{esc(g["title"])}" data-maker="{esc(g["maker"])}" data-cat="{esc(CATS[g["category"]]["label"])}">'
            f'<img src="{esc(base + g["thumb"])}" alt="{esc(g["title"])}" loading="lazy">{badge(g)}'
            f'<div class="tl"><div class="tt">{esc(g["title"])}</div><div class="tm">{esc(tags)}</div></div></a>')

def cta_tile():
    return (f'<a class="tile cta" href="{JOIN}" target="_blank" rel="noopener"><div class="cta-in"><span class="plus">+</span>'
            f'<b>Your game here</b><span>Build it with Claude, push it, it shows up</span></div></a>')

def wall(items, base="", bigs=2, title="Play now", sub=""):
    items = [g for g in items if not g.get("soon")] + [g for g in items if g.get("soon")]
    bigs = min(bigs, len([g for g in items if not g.get("soon") and g.get("cta") != "Coming soon"]))
    tiles = [tile(g, base, "big" if i < bigs else ("wide" if (i - bigs) % 7 == 6 else "")) for i, g in enumerate(items)]
    tiles.append(cta_tile())
    return (f'<section class="row" id="wall"><div class="rh"><h2>{esc(title)}{f" <small>{esc(sub)}</small>" if sub else ""}</h2></div>'
            f'<div class="wall">{"".join(tiles)}</div></section>')

def chips(base=""):
    out = []
    for c in SITE["categories"]:
        out.append(f'<a class="chip" href="{base}c/{c["id"]}/" style="--h:{c.get("hue", 220)}"><span class="emoji">{c.get("emoji", "🎮")}</span>'
                   f'<span class="cl"><small>{esc(c["label"])}</small>{esc(c.get("mood") or c["label"])}</span></a>')
    return '<section class="chips" aria-label="Categories">' + "".join(out) + "</section>"

def row(title, items, base="", cat_id=None, sub=""):
    if not items: return ""
    h = f'<a href="{base}c/{cat_id}/">{esc(title)}{icon("chev", 20)}</a>' if cat_id else esc(title)
    return (f'<section class="row" id="{esc(cat_id or "r")}"><div class="rh"><h2>{h}{f" <small>{esc(sub)}</small>" if sub else ""}</h2>'
            f'<div class="rb"><button class="rbtn prev" type="button" aria-label="Scroll back">{icon("left")}</button><button class="rbtn next" type="button" aria-label="Scroll forward">{icon("right")}</button></div></div>'
            f'<div class="rail">{"".join(tile(g, base) for g in items)}</div></section>')

def sidebar(base="", active="home"):
    items = [f'<a class="{"on" if active == "home" else ""}" href="{base}./" title="Home">{icon("home", 22)}<span>Home</span></a>']
    for c in SITE["categories"]:
        items.append(f'<a class="{"on" if active == c["id"] else ""}" href="{base}c/{c["id"]}/" title="{esc(c["label"])}">{icon(c["icon"], 22)}<span>{esc(c["label"])}</span></a>')
    foot = "".join(f'<a href="{base}{esc(n["href"])}"><span>{esc(n["label"])}</span></a>' for n in SITE["nav"])
    foot += f'<a href="https://github.com/Stratos-Technologies-fzco/stratos-games-site" target="_blank" rel="noopener" title="GitHub">{icon("github", 22)}<span>GitHub</span></a>'
    return f'<nav class="side" aria-label="Sections">{"".join(items)}<div class="side-foot">{foot}</div></nav><div class="scrim" onclick="document.body.classList.remove(\'nav-open\')"></div>'

def topbar(base=""):
    return (f'<header class="top"><button class="menu" type="button" aria-label="Menu" onclick="document.body.classList.toggle(\'nav-open\')">{icon("menu", 22)}</button>'
            f'<a class="logo" href="{base}./"><span class="lm">S</span><span class="ln">STRATOS <b>GAMES</b></span></a>'
            f'<label class="search">{icon("search")}<input id="q" type="search" placeholder="Search games and categories" autocomplete="off" aria-label="Search"></label>'
            f'<a class="add" href="{JOIN}" target="_blank" rel="noopener">+ Add your game</a></header>')

def footer(base=""):
    links = "".join(f'<a href="{base}{esc(f["href"])}">{esc(f["label"])}</a>' for f in SITE["footer"])
    return f'<footer class="foot"><div>{links}</div><div class="fine">© {YEAR} Stratos Games · {esc(SITE["tagline"])} · {esc(SITE["contact"])}</div></footer>'

def head(title, desc, canon, base="", og_image="", jsonld=None):
    ga = f'<script async src="https://www.googletagmanager.com/gtag/js?id={SITE["analytics_id"]}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config","{SITE["analytics_id"]}");</script>' if SITE.get("analytics_id") else ""
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ""
    og = f'<meta property="og:image" content="{esc(og_image)}"><meta name="twitter:card" content="summary_large_image">' if og_image else ""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0d0f16">'
            f'<title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{esc(canon)}">'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="Stratos Games"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(canon)}">{og}'
            f'<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="{base}assets/favicon.svg">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">'
            f'<link rel="stylesheet" href="{base}assets/site.css">{ga}{ld}</head>')

JS = """<script>
(function(){
var q=document.getElementById('q');
if(q){var tiles=[].slice.call(document.querySelectorAll('.tile:not(.cta)'));var secs=[].slice.call(document.querySelectorAll('.main > section, .main > .play-grid'));var res=document.getElementById('results');
q.addEventListener('input',function(){var v=q.value.trim().toLowerCase();if(!v){secs.forEach(function(s){s.hidden=false});if(res)res.hidden=true;return}
var seen={},hits=tiles.filter(function(t){if(seen[t.href])return false;seen[t.href]=1;return (t.dataset.title+' '+t.dataset.maker+' '+t.dataset.cat).toLowerCase().indexOf(v)>-1});
secs.forEach(function(s){s.hidden=true});if(!res)return;res.hidden=false;var g=res.querySelector('.grid');g.innerHTML='';hits.forEach(function(t){var c=t.cloneNode(true);c.className='tile';g.appendChild(c)});
res.querySelector('h2').textContent=hits.length?(hits.length+' result'+(hits.length>1?'s':'')+' for "'+q.value+'"'):('Nothing for "'+q.value+'"');});}
function arm(){[].slice.call(document.querySelectorAll('.row')).forEach(function(r){var rail=r.querySelector('.rail');if(!rail)return;r.classList.toggle('can-scroll',rail.scrollWidth>rail.clientWidth+4);
if(r._armed)return;r._armed=1;var p=r.querySelector('.prev'),n=r.querySelector('.next');if(p)p.onclick=function(){rail.scrollBy({left:-rail.clientWidth*.9,behavior:'smooth'})};if(n)n.onclick=function(){rail.scrollBy({left:rail.clientWidth*.9,behavior:'smooth'})}})}
arm();window.addEventListener('resize',arm);
})();
</script>"""

def build_home(fam, studio):
    real = [g for g in fam if not g.get("soon")]; soon = [g for g in fam if g.get("soon")]
    all_games = real + studio + soon
    by_cat = {}
    for g in real + studio: by_cat.setdefault(g["category"], []).append(g)
    rows = [row("New from the family", real[:12], cat_id="new", sub="newest first"),
            row("In the works", soon, sub=f"{len(soon)} claimed box{'es' if len(soon) != 1 else ''}, games on the way"),
            row("From the studio", studio, cat_id="studio", sub="humans test, AI builds, games ship")]
    for c in SITE["categories"]:
        if c["id"] in ("new", "studio") or len(by_cat.get(c["id"], [])) < 3: continue
        rows.append(row(c["label"], by_cat[c["id"]], cat_id=c["id"], sub=c.get("mood", "")))
    jsonld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Organization", "@id": SITE["url"] + "/#org", "name": "Stratos Games", "url": SITE["url"] + "/", "email": SITE["contact"], "logo": SITE["url"] + "/assets/favicon.svg",
         "founder": [{"@type": "Person", "name": "Sahil Modi", "@id": "https://stratostech.academy/#person-sahil-modi"}, {"@type": "Person", "name": "Shahariar Mody"}]},
        {"@type": "WebSite", "@id": SITE["url"] + "/#site", "url": SITE["url"] + "/", "name": "Stratos Games", "publisher": {"@id": SITE["url"] + "/#org"}}]}
    body = (f'<body>{topbar()}<div class="shell">{sidebar()}<main class="main">{chips()}'
            f'{wall(all_games, sub=f"{len(all_games)} games, newest first")}'
            f'<section class="row" id="results" hidden><div class="rh"><h2></h2></div><div class="grid"></div></section>'
            f'{"".join(rows)}<section class="pitch"><div><h2>Make a game. Put it here.</h2><p>Every game on this page was built by a person and an AI in a few hours, then pushed to one shared folder. Yours can be next.</p>'
            f'<a class="btn" href="{JOIN}" target="_blank" rel="noopener">How to add your game</a></div><div class="pitch-art">🎮</div></section>{footer()}</main></div>{JS}</body></html>')
    write("index.html", head("Stratos Games: free browser games, new every week", SITE["description"], SITE["url"] + "/", og_image=SITE["url"] + "/assets/og.png", jsonld=jsonld) + body)

def build_category(cid, items, fam, studio):
    c = CATS[cid]; base = "../../"
    pool = ([g for g in fam if not g.get("soon")] if cid == "new" else studio if cid == "studio" else items)
    body = (f'<body>{topbar(base)}<div class="shell">{sidebar(base, cid)}<main class="main">'
            f'<section class="row" id="results" hidden><div class="rh"><h2></h2></div><div class="grid"></div></section>'
            f'{wall(pool, base, bigs=1, title=c["label"], sub=f"{c.get('mood', '')} · {len(pool)} game{'s' if len(pool) != 1 else ''}") if pool else f"<section class=\"row\"><div class=\"rh\"><h2>{esc(c['label'])}</h2></div><div class=\"wall\"><div class=\"empty\">Nothing here yet. Be the first.</div>{cta_tile()}</div></section>"}'
            f'{row("From the studio", studio, base, cat_id="studio") if cid != "studio" else ""}{footer(base)}</main></div>{JS}</body></html>')
    write(f"c/{cid}/index.html", head(f"{c['label']} games | Stratos Games", f"Free {c['label'].lower()} games to play in your browser on Stratos Games. {c.get('mood', '')}.", f"{SITE['url']}/c/{cid}/", base=base) + body)

def build_play(g, fam, studio):
    base = "../../"; more = [x for x in fam + studio if x["slug"] != g["slug"] and not x.get("soon")][:8]
    desc = g.get("description") or g.get("one_line") or f"{g['title']} by {g['maker']}, free to play on Stratos Games."
    jsonld = {"@context": "https://schema.org", "@type": "VideoGame", "name": g["title"], "url": f"{SITE['url']}/play/{g['slug']}/", "image": f"{SITE['url']}/{g['thumb']}",
              "description": desc, "genre": CATS[g["category"]]["label"], "gamePlatform": "Web browser", "applicationCategory": "Game", "operatingSystem": "Any",
              "author": {"@type": "Person", "name": g["maker"]}, "publisher": {"@id": SITE["url"] + "/#org"}, "isAccessibleForFree": True, "datePublished": g["added"]}
    gh = f' · <a href="https://github.com/{esc(g["github"])}" target="_blank" rel="noopener">GitHub</a>' if g.get("github") else ""
    howto = f'<h2>How to play</h2><p>{esc(g["how_to_play"])}</p>' if g.get("how_to_play") else ""
    about = (f'<p class="soon-note">Coming soon. {esc(g["maker"])} is building this one. The box is claimed, the game lands here when it is ready.</p>' if g.get("soon") else "") + (f'<p>{esc(g["description"])}</p>' if g.get("description") else "")
    report = f'mailto:{SITE["contact"]}?subject={esc("Problem with " + g["title"] + " on stratos.games")}'
    body = (f'<body>{topbar(base)}<div class="shell">{sidebar(base, g["category"])}<main class="main play"><div class="play-grid"><div class="stage-col">'
            f'<div class="stage"><iframe id="game" src="{base}{esc(g["game_url"])}" title="{esc(g["title"])}" allow="fullscreen; autoplay; gamepad" allowfullscreen loading="eager"></iframe>'
            f'<div class="stage-bar"><div class="sb-title"><b>{esc(g["title"])}</b><span class="tm">{esc(CATS[g["category"]]["label"])} · by {esc(g["maker"])}</span></div>'
            f'<div class="sb-actions"><button class="fs" type="button" onclick="var f=document.getElementById(\'game\');(f.requestFullscreen||f.webkitRequestFullscreen).call(f)">{icon("full", 16)}Fullscreen</button>'
            f'<button class="fs" type="button" onclick="var b=this;(navigator.share?navigator.share({{title:document.title,url:location.href}}):navigator.clipboard.writeText(location.href).then(function(){{b.lastChild.textContent=\'Link copied\'}}))">{icon("share", 16)}<span>Share</span></button>'
            f'<a class="fs" href="{report}">{icon("flag", 16)}Report</a></div></div></div>'
            f'<section class="about-game"><h1>{esc(g["title"])}</h1><p class="lead">{esc(g.get("one_line"))}</p>{about}{howto}'
            f'<p class="meta">{esc(CATS[g["category"]]["label"])} · Made by {esc(g["maker"])}{gh} · Added {esc(g["added"])} · Free, no install, works on a phone</p></section></div>'
            f'<aside class="play-side"><h3>More games</h3><div class="tiles">{"".join(tile(x, base) for x in more)}{cta_tile()}</div></aside></div>{footer(base)}</main></div>{JS}</body></html>')
    write(f"play/{g['slug']}/index.html", head(f"{g['title']} by {g['maker']} | Play free on Stratos Games", desc, f"{SITE['url']}/play/{g['slug']}/", base=base, og_image=f"{SITE['url']}/{g['thumb']}", jsonld=jsonld) + body)

def build_extras(fam, studio):
    real = [g for g in fam if not g.get("soon")]; soon = [g for g in fam if g.get("soon")]
    urls = [SITE["url"] + "/"] + [f"{SITE['url']}/play/{g['slug']}/" for g in real] + [f"{SITE['url']}/c/{c['id']}/" for c in SITE["categories"]]
    for slug in ("about", "press", "for-publishers", "games-bloxplode", "games-arrow-puzzle", "games-house-mafia", "games-word-quest", "privacy-policy", "terms-of-use"):
        if os.path.exists(os.path.join(ROOT, slug, "index.html")): urls.append(f"{SITE['url']}/{slug}/")
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{esc(u)}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {SITE['url']}/sitemap.xml\n")
    lines = [f"# Stratos Games", "", SITE["description"], "", "## Play (free browser games)"] + [f"- [{g['title']}]({SITE['url']}/play/{g['slug']}/): {g.get('one_line','')} Made by {g['maker']}." for g in real] + ["", "## Coming soon (claimed by family makers)"] + [f"- {g['title']} by {g['maker']}: {g.get('one_line','')}" for g in soon] + ["", "## Studio titles"] + [f"- [{s['title']}]({SITE['url']}/{s['page']}): {s['one_line']}" for s in studio] + ["", "## Pages", f"- About: {SITE['url']}/about/", f"- For publishers: {SITE['url']}/for-publishers/", f"- Press kit: {SITE['url']}/press/", f"- Contact: {SITE['contact']}"]
    write("llms.txt", "\n".join(lines) + "\n")
    write("404.html", head("Page not found | Stratos Games", "That page is not here.", SITE["url"] + "/404.html") + f'<body>{topbar()}<div class="shell">{sidebar()}<main class="main"><section class="pitch"><div><h2>404. That page is not here.</h2><p>Try the games instead.</p><a class="btn" href="/">Back to the games</a></div><div class="pitch-art">🕹️</div></section>{footer()}</main></div>{JS}</body></html>')
    json.dump({"site": SITE["url"], "count": len(fam) + len(studio), "games": [{k: g.get(k) for k in ("slug", "title", "maker", "one_line", "category", "url", "thumb", "added", "github", "kind", "soon")} for g in fam + studio]},
              open(os.path.join(ROOT, "games.json"), "w", encoding="utf-8"), indent=1)

import shutil
def prune(fam):
    keep = {g["slug"] for g in fam}
    for d in ("play",):
        base = os.path.join(ROOT, d)
        for slug in (os.listdir(base) if os.path.isdir(base) else []):
            if slug not in keep: shutil.rmtree(os.path.join(base, slug)); print("  pruned:", f"{d}/{slug}/")
    cbase = os.path.join(ROOT, "c")
    for cid in (os.listdir(cbase) if os.path.isdir(cbase) else []):
        if cid not in CATS and os.path.isdir(os.path.join(cbase, cid)): shutil.rmtree(os.path.join(cbase, cid)); print("  pruned:", f"c/{cid}/")
    gbase = os.path.join(ROOT, "assets", "covers", "generated")
    used = {os.path.basename(g["thumb"]) for g in fam if g["thumb"].startswith("assets/covers/generated/")}
    for f in (os.listdir(gbase) if os.path.isdir(gbase) else []):
        if f not in used: os.remove(os.path.join(gbase, f)); print("  pruned:", f"assets/covers/generated/{f}")

def main():
    fam, problems = load_games(); studio = studio_games(); prune(fam)
    build_home(fam, studio)
    by_cat = {}
    for g in fam + studio:
        if not g.get("soon"): by_cat.setdefault(g["category"], []).append(g)
    for c in SITE["categories"]: build_category(c["id"], by_cat.get(c["id"], []), fam, studio)
    for g in fam: build_play(g, fam, studio)
    build_extras(fam, studio)
    print(f"built: home, {len(fam)} play page(s), {len(SITE['categories'])} category pages, sitemap, robots, llms.txt, 404")
    for p in problems: print("  skipped:", p)

if __name__ == "__main__":
    main()
