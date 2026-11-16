#!/usr/bin/env python3
"""build.py: the stratos.games portal builder.

Reads site.json and games/*/game.json, writes:
  index.html                 the front page: mood cards, the wall (big + small tiles), rows with arrows
  play/<slug>/index.html     one play page per family game (frame, fullscreen, share, side column)
  c/<category>/index.html    one page per category (a wall of that category)
  games.json                 the catalog (search, future apps)
  sitemap.xml, robots.txt, llms.txt, 404.html
  assets/stratos.js          shared Stratos analytics + coins (Firebase settings from the FIREBASE_* secrets; coins from tools/coins.js)
Rules: a game shows only if games/<slug>/ has game.json AND index.html; broken JSON skips that
folder and names it; the page always builds. Run: python3 tools/build.py (the Action runs it on push).
"""
import json, os, re, html, datetime, hashlib, subprocess, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = os.path.join(ROOT, "games")
SITE = json.load(open(os.path.join(ROOT, "site.json"), encoding="utf-8"))
# Live or staging. Games listed in site.json "hidden_on_live" are left off stratos.games but still show on staging,
# so the maker can keep fixing them. Mohua (tester) takes a game off the list once it passes her check.
SITE_MODE = os.environ.get("STRATOS_SITE", "live")
HIDDEN_ON_LIVE = SITE.get("hidden_on_live", {})
# Public game links use the game's name (#67): site.json "links" maps a folder to its link, set once so a later
# title change never breaks a link. A new game without an entry gets one from its short name.
LINKS = SITE.get("links", {})
CATS = {c["id"]: c for c in SITE["categories"]}
YEAR = str(datetime.date.today().year)
TODAY = datetime.date.today().isoformat()
JOIN = "https://github.com/Stratos-Technologies-fzco/stratos-games-site#step-1-claim-your-box-two-minutes-no-game-needed-yet"
CLEAN = SITE.get("home", "portal") == "cards"   # cards = only the games people pushed, nothing else

def esc(s): return html.escape(str(s or ""), quote=True)
def write(p, s):
    full = os.path.join(ROOT, p); os.makedirs(os.path.dirname(full) or ROOT, exist_ok=True)
    open(full, "w", encoding="utf-8").write(s)

ICONS = {
 "help": '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
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

# Go-live rule (Sahil, 2026-10-31): a game goes live only when it hands its events to the shared Stratos analytics
# (window.Stratos / parent.Stratos .track) and sends at least level_start plus level_complete or game_over.
# Without that it stays off the site. Kids-section games are exempt: they run without analytics and ads. Games already live on that date are listed here until their makers add it.
LIVE_BEFORE_ANALYTICS_RULE = {
    "im-mohua-liza", "im-mohua-liza-aetherhold", "im-mohua-liza-ashgrove-extraction", "im-mohua-liza-cargo-climb", "im-mohua-liza-chroma-clash",
    "im-mohua-liza-plot-twist", "Mdsadee527", "mody-sahariar1", "nikhatenglish89", "sahidmodi45", "saiqulmodi", "saiqulmodi-bridge-genius",
    "saiqulmodi-domino-wonder-dash", "saiqulmodi-ecos-synthetica", "saiqulmodi-squirrel-vs-viper", "shoaibul0926", "sksarfarajali",
    "sksarfarajali-babel-harbour", "sksarfarajali-brainrush", "sksarfarajali-dino-frontier", "sumaiyahsultana821-sys"}

def has_analytics(d):
    code = ""
    for root, dirs, files in os.walk(d):
        dirs[:] = [x for x in dirs if x not in ("node_modules", "vendor", "cdn", ".git")]
        for f in files:
            if f.endswith((".html", ".js", ".mjs")):
                try: code += open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()
                except OSError: pass
    return (bool(re.search(r"Stratos[\s\S]{0,80}\.track\(", code)) and "level_start" in code
            and ("level_complete" in code or "game_over" in code))

def first_added():
    """The day each games/<box>/game.json first appeared in git, on any branch: {box: "YYYY-MM-DD"}.
    A file's own time is only the checkout time (on GitHub every game looked added on build day), so git history
    decides. A renamed box keeps the day of its first name. The builds check out the full history (fetch-depth: 0);
    with no git at all this is {} and the file time is used."""
    try:
        out = subprocess.run(["git", "log", "--all", "--reverse", "-M", "--diff-filter=AR", "--format=@%as", "--name-status", "--", "games"],
                             cwd=ROOT, capture_output=True, text=True, timeout=60).stdout
    except Exception:
        return {}
    def box(path):
        p = path.strip().split("/")
        return p[1] if len(p) == 3 and p[0] == "games" and p[2] == "game.json" else None
    days, day = {}, None
    for line in out.splitlines():
        if line.startswith("@"):
            day = line[1:]
            continue
        f = line.split("\t")
        if not day or len(f) < 2: continue
        if f[0].startswith("A") and box(f[1]) and box(f[1]) not in days:            # oldest first, so the first add wins
            days[box(f[1])] = day
        elif f[0].startswith("R") and len(f) == 3 and box(f[2]) and box(f[2]) not in days:
            days[box(f[2])] = days.get(box(f[1]), day)                              # a renamed box keeps its first day
    return days

def link_from(title):
    """A link from a game's name: the short name (before ":" or a dash), lowercase, words joined by dashes."""
    for cut in (":", " \u2013 ", " - "):
        if cut in title and title.split(cut)[0].strip(): title = title.split(cut)[0].strip(); break
    title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", title).strip("-")

def load_games():
    games, problems = [], []
    firsts = first_added()
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
        if SITE_MODE == "live" and slug in HIDDEN_ON_LIVE:
            problems.append(f"{slug}: hidden on live, still on staging ({HIDDEN_ON_LIVE[slug]})"); continue
        g["category"] = g.get("category") if g.get("category") in CATS and g.get("category") not in ("new", "studio") else "arcade"
        g["soon"] = str(g.get("status", "")).lower().replace("-", "_") in ("coming_soon", "placeholder", "soon", "wip")
        if not g["soon"] and g["category"] != "kids" and slug not in LIVE_BEFORE_ANALYTICS_RULE and not has_analytics(d):
            g["soon"] = True; problems.append(f"{slug}: not live yet, needs Stratos analytics (see CLAUDE.md, \"Analytics before launch\")")
        thumb = g.get("thumbnail") or next((f for f in ("thumbnail.png", "thumbnail.jpg", "thumbnail.webp", "thumbnail.svg") if os.path.exists(os.path.join(d, f))), None)
        if thumb and not g["soon"]:
            g["thumb"] = f"games/{slug}/{thumb}"
        else:
            write(f"assets/covers/generated/{slug}.svg", cover_svg(g["title"], slug, f"{g['maker']} is building this" if g["soon"] else ""))
            g["thumb"] = f"assets/covers/generated/{slug}.svg"
        g["game_url"] = f"games/{slug}/index.html"
        g["link"] = LINKS.get(slug) or link_from(g["title"]) or slug
        g["url"] = f"play/{g['link']}/"
        g["added"] = g.get("added") or firsts.get(slug) or datetime.date.fromtimestamp(os.path.getmtime(meta)).isoformat()
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
    if CLEAN: return ""
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
            f'{coin_chip(base)}<a class="add" href="{JOIN}" target="_blank" rel="noopener">+ Add your game</a></header>')

def footer(base=""):
    links = "".join(f'<a href="{base}{esc(f["href"])}">{esc(f["label"])}</a>' for f in SITE["footer"])
    return f'<footer class="foot"><div>{links}</div><div class="fine">© {YEAR} Stratos Games · {esc(SITE["tagline"])} · {esc(SITE["contact"])}</div></footer>'

# Stratos analytics: one shared script on every page. The Firebase web settings come from the FIREBASE_* repo
# secrets (public by design, key locked to stratos.games). Without a measurement ID it loads nothing and track() is a no-op.
# Games call window.Stratos.track(name, details) / window.Stratos.offerReward(onDone); inside the play-page frame they reach the page's copy.
FIREBASE = {k: os.environ.get("FIREBASE_" + e, "") for k, e in [("apiKey", "API_KEY"), ("authDomain", "AUTH_DOMAIN"), ("projectId", "PROJECT_ID"), ("storageBucket", "STORAGE_BUCKET"),
            ("messagingSenderId", "MESSAGING_SENDER_ID"), ("appId", "APP_ID"), ("measurementId", "MEASUREMENT_ID")]}
EEA = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH".split()
STRATOS_JS = """/* stratos.js: shared Stratos analytics and rewards for every page and game. Written by tools/build.py, do not edit. */
(function(w,d){
if(w.Stratos)return;
try{if(w.parent!==w&&w.parent.Stratos){w.Stratos=w.parent.Stratos;return}}catch(e){}
var C=%s,m=location.pathname.match(/\\/(?:play|games)\\/([^\\/]+)\\//),gm=d.querySelector('meta[name="stratos-game"]'),game=gm&&gm.content?gm.content:(m?m[1]:"");
function gtag(){(w.dataLayer=w.dataLayer||[]).push(arguments)}
if(d.querySelector('meta[name="stratos-kids"]'))C={};   /* Kids section: no analytics, no ads */
var live=/(^|\.)stratos\.games$/.test(location.hostname);   /* staging and test copies: nothing is counted, track() shows in the console instead */
var builder=false;   /* builders and testers are not players (#66): once per browser open stratos.games/?builder=1 (?builder=0 undoes it); that browser's visits are not counted */
try{var bq=new URLSearchParams(location.search).get("builder");
 if(bq==="1"||bq==="0"){if(bq==="1")localStorage.setItem("sg_builder","1");else localStorage.removeItem("sg_builder");
  var bu=new URL(location.href);bu.searchParams.delete("builder");w.history.replaceState(w.history.state,"",bu.pathname+bu.search+bu.hash);   /* w.history: the coins code has its own "history" in this file */
  var bn=function(){var b=d.createElement("div");b.setAttribute("role","status");b.textContent=bq==="1"?"Builder mode on: visits from this browser are not counted. To undo, open stratos.games/?builder=0":"Builder mode off: this browser counts as a player again.";
   b.style.cssText="position:fixed;left:16px;right:16px;top:12px;margin:0 auto;max-width:520px;z-index:2147483647;background:#14151F;color:#fff;font:600 14px/1.35 system-ui,sans-serif;padding:10px 14px;border-radius:12px;box-shadow:0 0 0 2px #B6FF3B;text-align:center";
   (d.body||d.documentElement).appendChild(b);setTimeout(function(){b.remove()},7000)};
  if(d.body)bn();else d.addEventListener("DOMContentLoaded",bn)}
 builder=localStorage.getItem("sg_builder")==="1"}catch(e){}
if(!live||builder)C={};
var S=w.Stratos={config:C,game:game,live:live,builder:builder,
 track:function(n,x){if(!live||builder){try{console.info("Stratos track (not counted"+(builder?": builder mode":" off the live site")+"):",n,x||"")}catch(e){}}if(!C.measurementId)return;try{var p={};for(var k in x||{})p[k]=x[k];if(game&&!p.game)p.game=game;gtag("event",String(n).slice(0,40),p)}catch(e){}},
 offerReward:function(done){S.track("reward_offered");S.track("reward_taken");if(typeof done=="function")done()}};
if(C.measurementId){
 gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"granted"});
 gtag("consent","default",{analytics_storage:"denied",region:%s});
 gtag("js",new Date());gtag("config",C.measurementId,game?{game:game}:{});
 var s=d.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+C.measurementId;d.head.appendChild(s);
}
if(game&&/\\/play\\//.test(location.pathname)){
 S.track("game_open");
 var from=d.visibilityState=="hidden"?0:Date.now();
 function flush(){if(from){var t=Math.round((Date.now()-from)/1000);from=0;if(t>0)S.track("play_time",{seconds:t})}}
 d.addEventListener("visibilitychange",function(){if(d.visibilityState=="hidden")flush();else from=Date.now()});
 w.addEventListener("pagehide",flush);
}
/*__COINS__*/
})(window,document);
""" % (json.dumps(FIREBASE), json.dumps(EEA))
# Stratos Coins (see STRATOS_COINS_ARCHITECTURE.md): the module lives in tools/coins.js, its rules and prices in
# assets/coins-config.json; the config is also baked in as the offline default so earning never breaks.
_here = os.path.dirname(os.path.abspath(__file__))
_coins = open(os.path.join(_here, "coins.js"), encoding="utf-8").read()
_cfg = json.dumps(json.load(open(os.path.join(_here, "..", "assets", "coins-config.json"), encoding="utf-8")), separators=(",", ":"))
STRATOS_JS = STRATOS_JS.replace("/*__COINS__*/", _coins.replace("/*COINS_CONFIG*/{}", _cfg))
ADSENSE = "ca-pub-8653076377863928"   # Stratos Technologies FZCO publisher account (same as AdMob); site ownership tag only, no ads yet
STRATOS_V = hashlib.sha1(STRATOS_JS.encode()).hexdigest()[:8]
CSS_V = hashlib.sha1(open(os.path.join(ROOT, "assets", "site.css"), "rb").read()).hexdigest()[:8]   # ?v= on the stylesheet link: a changed file is fetched at once, not after the 1-day cache

def head(title, desc, canon, base="", og_image="", jsonld=None, kids=False, game=""):
    ga = ('<meta name="stratos-kids" content="1">' if kids else "") + (f'<meta name="stratos-game" content="{esc(game)}">' if game else "") + f'<meta name="google-adsense-account" content="{ADSENSE}"><script async src="{base}assets/stratos.js?v={STRATOS_V}"></script>'
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ""
    og = f'<meta property="og:image" content="{esc(og_image)}"><meta name="twitter:card" content="summary_large_image">' if og_image else ""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0d0f16">'
            f'<title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{esc(canon)}">'
            f'<meta property="og:type" content="website"><meta property="og:url" content="{esc(canon)}"><meta property="og:site_name" content="Stratos Games"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(canon)}">{og}'
            f'<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml"><link rel="icon" href="{base}assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="{base}assets/apple-touch-icon.png">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">'
            f'<link rel="stylesheet" href="{base}assets/site.css?v={CSS_V}">{ga}{ld}</head>')

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

# --- Poki-style look: one packed grid of square tiles, logo box in the corner ---
def pk_nav(base=""):
    return (f'<div class="pk-nav"><div class="pk-nr"><button class="pk-menu" type="button" aria-label="Menu" onclick="document.body.classList.toggle(&quot;side-open&quot;)">{icon("menu", 20)}</button>{sn_logo("pk-logo sn-box", 26, base + "./")}</div>'
            f'<div class="pk-sr"><label class="pk-search">{icon("search", 16)}<input id="pkq" type="search" placeholder="Search" autocomplete="off" aria-label="Search games"></label>{coin_chip(base)}</div></div>{SN_ASSETS}')

def tile_name(title, size):
    """The name on a tile: small (s1) tiles show the part before ":" or a dash, so it fits in two lines (#69)."""
    if "s1" not in size.split(): return title
    for cut in (":", " \u2013 ", " - "):
        if cut in title and title.split(cut)[0].strip(): return title.split(cut)[0].strip()
    return title

def clip_of(g):
    """#71: the game's hover clip: the maker's own games/<folder>/preview.mp4 (tools/make_clip.py makes it),
    else the site's assets/previews/<folder>.mp4. Empty when the game has none yet."""
    for p in (f'games/{g["slug"]}/preview.mp4', f'assets/previews/{g["slug"]}.mp4'):
        if os.path.exists(os.path.join(ROOT, p)): return p
    return ""

def pk_tile(g, base="", size="s1", pv=False):
    href, ext = href_of(g, base)
    q = f'{g["title"]} {g["maker"]} {CATS[g["category"]]["label"]}'.lower()
    # hover preview clip on every page with tiles (#71, see clip_of); the category chip only on the home page (pv)
    clip = clip_of(g)
    pva = f' data-pv="{esc(clip)}"' if clip and not g.get("soon") else ""
    meta = f'<span class="pk-meta"><i>{esc(CATS[g["category"]]["label"])}</i></span>' if pv else ""
    return (f'<a class="pk-t {size}" href="{esc(href)}"{ext} data-q="{esc(q)}"{pva} title="{esc(g["title"])}">'
            f'<img src="{esc(base + g["thumb"])}" alt="{esc(g["title"])}" loading="lazy">{badge(g)}<span class="pk-name">{esc(tile_name(g["title"], size))}{meta}</span></a>')

def pk_tiles(items, base="", first_big=True, later_from=None):
    real = [g for g in items if not g.get("soon")]; soon = [g for g in items if g.get("soon")]
    def size(i):   # later_from: these tiles get "pk-later" (game pages hide them on phones, see build_play)
        return ("s3" if i == 0 and first_big else "s2") + (" pk-later" if later_from is not None and i >= later_from else "")
    out = [pk_tile(g, base, size(i)) for i, g in enumerate(real)]
    return "".join(out + [pk_tile(g, base, "s1") for g in soon])


def pk_cats(base=""):
    return "".join(f'<a class="pk-cat" href="{base}c/{c["id"]}/" style="--h:{c.get("hue", 220)}"><span class="em">{c.get("emoji", "🎮")}</span>'
                   f'<span class="cl">{esc(c["label"])}<small>{esc(c.get("mood", ""))}</small></span></a>'
                   for c in SITE["categories"])

ICONS["heart"] = '<path d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3.2 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.8 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z"/>'

def pk_hero(items, base=""):
    """CrazyGames-style featured banner: the newest real games, sliding every 5 seconds."""
    real = [g for g in items if not g.get("soon")][:5]
    if not real: return ""
    slides, dots = [], []
    for i, g in enumerate(real):
        href, ext = href_of(g, base)
        slides.append(f'<a class="pk-slide{" on" if i == 0 else ""}" href="{esc(href)}"{ext}><img src="{esc(base + g["thumb"])}" alt="" {"" if i == 0 else "loading=\"lazy\""}>'
                      f'<div class="pk-hc"><span class="pk-kick">{"New · " if is_new(g) else "Featured · "}{esc(CATS[g["category"]]["label"])}</span>'
                      f'<b>{esc(g["title"])}</b><p>{esc(g.get("one_line") or "by " + g["maker"])}</p><span class="pk-play">▶ Play now</span></div></a>')
        dots.append(f'<button class="pk-dot{" on" if i == 0 else ""}" type="button" aria-label="Show {esc(g["title"])}"></button>')
    return f'<section class="pk-hero" aria-label="Featured games">{"".join(slides)}<div class="pk-dots">{"".join(dots) if len(real) > 1 else ""}</div></section>'

ICONS["clock"] = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
ICONS["plus"] = '<path d="M12 5v14M5 12h14"/>'
ICONS["info"] = '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
ICONS["coin"] = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>'

def coin_chip(base=""):
    """Stratos Coins balance chip (STRATOS_COINS_ARCHITECTURE.md, section 9). assets/stratos.js fills in the number and keeps it live."""
    return (f'<a class="coin-chip" href="{base}coins/" style="background:#fff4cf;border:2px solid #f2c230;color:#5a3b00" aria-label="Stratos Coins: see your balance and history">'
            '<svg class="coin-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffc933" stroke="#d98a00" stroke-width="2"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#d98a00" stroke-width="1.6"/></svg>'
            '<span class="coin-n">0</span><span class="coin-sr" role="status" aria-live="polite"></span></a>')

def pk_side(base="", active=""):
    """CrazyGames-style left rail: icons only, opens on hover to show the names."""
    def item(href, ic, label, key="", ext=False):
        on = " on" if key and key == active else ""
        tgt = ' target="_blank" rel="noopener"' if ext else ""
        return f'<a class="pk-si{on}" href="{esc(href)}"{tgt} title="{esc(label)}"><span class="ic">{icon(ic, 22)}</span><span class="lb">{esc(label)}</span></a>'
    top = [item(f"{base}./", "home", "Home", "home"), item(f"{base}./#recent", "clock", "Recently played"),
           item(f"{base}./#favs", "heart", "Favourites"), item(f"{base}coins/", "coin", "Stratos Coins", "coins")]
    top += [item(f'{base}c/{c["id"]}/', c["icon"], c["label"], c["id"]) for c in SITE["categories"] if c["id"] in ("new", "studio")]
    cats = [item(f'{base}c/{c["id"]}/', c["icon"], c["label"], c["id"]) for c in SITE["categories"] if c["id"] not in ("new", "studio")]
    foot = [item(f'{base}{n["href"]}', "info", n["label"]) for n in SITE["nav"]]
    return (f'<nav class="pk-side" aria-label="Sections">{"".join(top)}<hr>{"".join(cats)}<hr>{"".join(foot)}</nav>'
            f'<div class="pk-scrim" onclick="document.body.classList.remove(\'side-open\')"></div>')

PK_MINE = '<template id="pk-mine"></template>'   # filled in the browser: favourites + continue playing

def pk_foot(base=""):
    links = "".join(f'<a href="{base}{esc(f["href"])}">{esc(f["label"])}</a>' for f in SITE["footer"])
    return f'<footer class="pk-foot">{links}<span class="fine">© {YEAR} Stratos Games · {esc(SITE["tagline"])}</span></footer>'

PK_JS = """<script>(function(){
var D=document,body=D.body,B=body.getAttribute('data-base')||'',me=body.getAttribute('data-game');
function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return'&#'+c.charCodeAt(0)+';'})}
function rd(k){try{var v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(x){return[]}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(x){}}
/* play page: remember this game, wire the heart */
if(me){var gi;try{gi=JSON.parse(body.getAttribute('data-gi'))}catch(x){}
 if(gi){wr('sg_recent',[gi].concat(rd('sg_recent').filter(function(x){return x.s!==me})).slice(0,12));
  var h=D.getElementById('pk-like');if(h){var on=function(){return rd('sg_likes').some(function(x){return x.s===me})};
   var paint=function(){var o=on();h.classList.toggle('on',o);h.setAttribute('aria-pressed',o);h.title=o?'Remove from favourites':'Add to favourites'};paint();
   h.onclick=function(){var l=rd('sg_likes').filter(function(x){return x.s!==me});if(!on())l.unshift(gi);wr('sg_likes',l);paint()}}}}
/* favourites + continue playing tiles */
var slot=D.getElementById('pk-mine');
if(slot){var out='';[['sg_likes','❤️','Your favourites'],['sg_recent','🕘','Continue playing']].forEach(function(z){
 var l=rd(z[0]).filter(function(x){return x&&x.s&&x.s!==me&&x.u&&x.th}).slice(0,6);if(!l.length)return;
 out+='<div class="pk-label" id="'+(z[0]==='sg_likes'?'favs':'recent')+'"><span class="em">'+z[1]+'</span>'+z[2]+'</div>';
 l.forEach(function(x){out+='<a class="pk-t s1 mine" href="'+e(B+x.u)+'"'+(x.pv?' data-pv="'+e(x.pv)+'"':'')+' data-q="'+e(String(x.t).toLowerCase())+'" title="'+e(x.t)+'"><img src="'+e(B+x.th)+'" alt="'+e(x.t)+'">'+(z[0]==='sg_recent'?'<span class="badge cont">▶ Continue</span>':'<span class="badge fav">♥</span>')+'<span class="pk-name">'+e(String(x.t).split(/: | \u2013 | - /)[0])+'</span></a>'})});
 slot.insertAdjacentHTML('afterend',out);slot.remove();
 if(location.hash){var tg=D.getElementById(location.hash.slice(1));if(tg)tg.scrollIntoView({block:'center'})}}
/* featured banner */
var hero=D.querySelector('.pk-hero');if(hero){var sl=[].slice.call(hero.querySelectorAll('.pk-slide')),ds=[].slice.call(hero.querySelectorAll('.pk-dot')),i=0,tm;
 function go(n){i=(n+sl.length)%sl.length;sl.forEach(function(s,k){s.classList.toggle('on',k===i)});ds.forEach(function(d,k){d.classList.toggle('on',k===i)})}
 ds.forEach(function(d,k){d.onclick=function(){go(k)}});
 var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function start(){clearInterval(tm);if(!rm&&sl.length>1)tm=setInterval(function(){go(i+1)},5000)}
 hero.addEventListener('mouseenter',function(){clearInterval(tm)});hero.addEventListener('mouseleave',start);start()}
/* every page with tiles: play a short preview clip while the mouse rests on a game (#71); phones and "less motion" keep the cover */
if(window.matchMedia&&matchMedia('(hover: hover)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches)
 [].slice.call(D.querySelectorAll('.pk-t[data-pv]')).forEach(function(t){var tm,v;
  t.addEventListener('mouseenter',function(){tm=setTimeout(function(){
   if(!v){v=D.createElement('video');v.className='pk-pv';v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('aria-hidden','true');
    v.src=B+t.dataset.pv;t.insertBefore(v,t.querySelector('.pk-name'))}
   v.currentTime=0;var p=v.play();if(p&&p.catch)p.catch(function(){});t.classList.add('pv')},250)});
  t.addEventListener('mouseleave',function(){clearTimeout(tm);t.classList.remove('pv');if(v)v.pause()})});
/* search */
var q=D.getElementById('pkq'),none=D.getElementById('pk-none');if(!q)return;
q.addEventListener('input',function(){var v=q.value.trim().toLowerCase(),n=0,seen={};
 [].slice.call(D.querySelectorAll('.pk-t[data-q]')).forEach(function(t){var hit=!v||(t.dataset.q.indexOf(v)>-1&&!(v&&t.classList.contains('mine')));
  if(hit&&v){if(seen[t.href])hit=false;seen[t.href]=1}t.hidden=!hit;if(hit)n++});
 body.classList.toggle('pk-searching',!!v);if(none)none.hidden=!(v&&!n)})})();</script>"""

def pk_body(base, inner, attrs="", active="", nav=None, cls="", top="", after=""):
    return (f'<body class="pk{cls}" data-base="{esc(base)}"{attrs}>{top}{pk_side(base, active)}<main class="pk-grid">{pk_nav(base) if nav is None else nav}{inner}</main>'
            f'<p id="pk-none" class="pk-none" hidden>No games match that. Try another word.</p>{after}{pk_foot(base)}{PK_JS}</body></html>')

# Written text under the tiles (AdSense, Nov 2026: pages need words of their own, not only game tiles).
# It sits outside the tile grid (the grid's rows are a fixed height) and hides while someone searches.
def pk_paras(text):
    return [p.strip() for p in re.split(r"\n\s*\n|\n", str(text or "")) if p.strip()]

def pk_list(items):
    items = [items] if isinstance(items, str) else list(items or [])
    return "<ul>" + "".join(f"<li>{esc(x)}</li>" for x in items if str(x).strip()) + "</ul>" if items else ""

def pk_text(title, paras=(), extra=""):
    if not paras and not extra: return ""
    return f'<section class="pk-text"><h2>{esc(title)}</h2>' + "".join(f"<p>{esc(p)}</p>" for p in paras) + extra + "</section>"

# --- home page: Poki look (turquoise page, square logo box, mixed tile sizes) ---
ICONS["thumbup"] = '<path d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1.2 2.2 2.7L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/>'
ICONS["thumbdown"] = '<path d="M7 13V4H4v9zM7 13l4 8c1.5 0 2.5-1.2 2.2-2.7L12.6 15H19a2 2 0 0 0 2-2.3l-1.2-7A2 2 0 0 0 17.8 4H7"/>'
ICONS["user"] ='<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>'

# --- S-Snake logo (purple snake S with googly eyes): eyes follow the cursor, blinks, wiggles on hover (silent, #80) ---
SN_INNER = '\n<g fill="none" stroke-linecap="round" stroke-linejoin="round">\n<path d="M142 62 C136 32 60 30 60 72 C60 110 142 96 142 136 C142 178 64 176 56 146" stroke="#2A1060" stroke-width="64" transform="translate(5 9)"/>\n<path d="M142 62 C136 32 60 30 60 72 C60 110 142 96 142 136 C142 178 64 176 56 146" stroke="#0B0614" stroke-width="64"/>\n<path d="M142 62 C136 32 60 30 60 72 C60 110 142 96 142 136 C142 178 64 176 56 146" stroke="#8B5CF6" stroke-width="44"/>\n<path d="M118 44 C102 36 76 42 72 66" stroke="#C4B0FF" stroke-width="10"/>\n<path d="M74 92 C96 106 128 104 132 120" stroke="#C4B0FF" stroke-width="10" opacity=".7"/>\n<path class="sn-tongue" d="M146 86 L146 100 M146 100 L140 108 M146 100 L152 108" stroke="#FF4D6D" stroke-width="4.5"/>\n</g>\n<g class="sn-eye"><circle cx="130" cy="58" r="15" fill="#fff" stroke="#0B0614" stroke-width="5"/><circle class="sn-pupil" data-x="132" data-y="59" cx="132" cy="59" r="6.5" fill="#0B0614"/></g>\n<g class="sn-eye"><circle cx="158" cy="64" r="13" fill="#fff" stroke="#0B0614" stroke-width="5"/><circle class="sn-pupil" data-x="159" data-y="65" cx="159" cy="65" r="5.8" fill="#0B0614"/></g>\n'

def sn_logo(cls, size, href="./"):
    return (f'<a class="{cls} sn-logo" href="{href}" aria-label="Stratos Games home">'
            f'<span class="sn-word"><span class="sn-row"><svg class="sn-mark" width="{size}" height="{size}" viewBox="0 0 200 200" aria-hidden="true">{SN_INNER}</svg>'
            '<span class="sn-w1">tratos</span></span><span class="sn-w2">GAMES</span></span></a>')

SN_ASSETS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap">'
             '<style>' + '.sn-logo{display:flex;align-items:center;gap:8px;text-decoration:none}\n.sn-mark{overflow:visible;flex:none;transform-origin:50% 60%}\n.sn-mark *{transform-box:fill-box}\n.sn-word{display:flex;flex-direction:column;align-items:center;line-height:.86;font-family:Fredoka,sans-serif;font-weight:700}\n.sn-row{display:flex;align-items:flex-end;font-size:34px}\n.sn-row .sn-mark{width:.95em;height:.95em;margin:0 .02em .14em 0}\n.sn-w1{font-size:1em;line-height:1;color:#fff;letter-spacing:-.5px}\n.sn-w2{font-size:14px;color:#B6FF3B;letter-spacing:.3em;padding-left:.3em;margin-top:1px}\n.sn-box{flex-direction:column;gap:1px}\n.sn-box .sn-word{align-items:center}\n.sn-box .sn-row{font-size:21px}\n.sn-box .sn-w1{color:#14151F}\n.sn-box .sn-w2{color:#8B5CF6;font-size:8.5px}\n.sn-eye{transform-origin:center}\n.sn-blink .sn-eye{animation:snBlink .18s ease-in-out}\n@keyframes snBlink{50%{transform:scaleY(.1)}}\n.sn-tongue{transform-origin:top center;transform:scaleY(0)}\n.sn-on .sn-tongue{animation:snTongue .5s ease-out}\n@keyframes snTongue{30%,70%{transform:scaleY(1)}}\n.sn-on .sn-mark{animation:snWiggle .7s ease-in-out}\n@keyframes snWiggle{15%{transform:rotate(-9deg) scale(1.08,.94)}35%{transform:rotate(8deg) scale(.96,1.06)}55%{transform:rotate(-5deg)}75%{transform:rotate(3deg)}}\n.cg-logo.sn-logo .sn-word{display:flex!important}\n@media (max-width:1200px){.cg-logo.sn-logo .sn-row{font-size:28px}.cg-logo.sn-logo .sn-w2{font-size:11.5px}}\n@media (max-width:600px){.cg-logo.sn-logo .sn-row{font-size:23px}.cg-logo.sn-logo .sn-w2{font-size:9.5px}}\n@media (prefers-reduced-motion:reduce){.sn-on .sn-mark,.sn-on .sn-tongue,.sn-blink .sn-eye{animation:none}}' + '</style><script>' + "(function(){\n  // silent on purpose (#80): no sound on hover; the snake still wiggles, blinks and its eyes follow the pointer\n  function play(el,c,ms){el.classList.remove(c);void el.offsetWidth;el.classList.add(c);setTimeout(function(){el.classList.remove(c);},ms);}\n  document.querySelectorAll('.sn-logo').forEach(function(el){\n    var last=0;\n    el.addEventListener('pointerenter',function(){var n=Date.now();if(n-last<600)return;last=n;play(el,'sn-on',750);play(el,'sn-blink',200);});\n    (function loop(){setTimeout(function(){play(el,'sn-blink',200);loop();},2500+Math.random()*3000);})();\n  });\n  var pupils=document.querySelectorAll('.sn-pupil');\n  window.addEventListener('pointermove',function(e){\n    pupils.forEach(function(p){\n      var r=p.ownerSVGElement.getBoundingClientRect();if(!r.width)return;var k=r.width/200,bx=+p.dataset.x,by=+p.dataset.y;\n      var dx=e.clientX-(r.left+bx*k),dy=e.clientY-(r.top+by*k),len=Math.hypot(dx,dy)||1,m=Math.min(5,len/20);\n      p.setAttribute('cx',(bx-1+dx/len*m).toFixed(1));p.setAttribute('cy',(by-1+dy/len*m).toFixed(1));\n    });\n  });\n})();" + '</script>')

def pz_nav():
    return (f'<div class="pk-nav pz-nav">{sn_logo("pz-logo sn-box", 30)}'
            f'<div class="pz-btns"><button class="pk-menu" type="button" aria-label="Menu" onclick="document.body.classList.toggle(&quot;side-open&quot;)">{icon("menu", 20)}</button>'
                        f'<button class="pz-b" type="button" aria-label="Search" onclick="document.body.classList.add(&quot;pz-find&quot;);document.getElementById(&quot;pkq&quot;).focus()">{icon("search", 24)}</button></div>'
            f'<label class="pk-search pz-search">{icon("search", 14)}<input id="pkq" type="search" placeholder="Search" autocomplete="off" aria-label="Search games" '
            f'onblur="if(!this.value)document.body.classList.remove(&quot;pz-find&quot;)"></label></div>{SN_ASSETS}')

ICONS["ad"] = '<circle cx="12" cy="12" r="9"/><path d="M7.5 15l2-6 2 6M8.2 13h2.6M14 9v6h1.5a3 3 0 0 0 0-6z"/>'
ICONS["users"] = '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.2 5 2.6 5 5.8"/>'
ICONS["bookmark"] = '<path d="M6 3h12v18l-6-4.5L6 21z"/>'
ICONS["bell"] = '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'

def cg_top(new_count):
    """CrazyGames-style bar across the top of the home page. Its search box drives the same search as the logo box."""
    dot = f'<span class="cg-dot">{new_count}</span>' if new_count else ""
    sync = "var p=document.getElementById(&quot;pkq&quot;);p.value=this.value;p.dispatchEvent(new Event(&quot;input&quot;))"
    return (f'<header class="cg-top"><button class="cg-menu" type="button" aria-label="Menu" onclick="document.body.classList.toggle(&quot;side-open&quot;)">{icon("menu", 24)}</button>'
            f'{sn_logo("cg-logo", 46)}'
            f'<label class="cg-search"><input type="search" placeholder="Search games and categories" autocomplete="off" aria-label="Search games and categories" oninput="{sync}">{icon("search", 20)}</label>'
            f'<div class="cg-acts">{coin_chip()}'
            f'<a class="cg-ib" href="#favs" title="Favourites" aria-label="Favourites">{icon("bookmark", 17)}</a>'
            f'<a class="cg-ib" href="c/new/" title="New games" aria-label="New games: {new_count}">{icon("bell", 18)}{dot}</a>'
            f'</div></header>')

PZ_SIZES = ["s3", "s2", "s2", "s1", "s1", "s2", "s3", "s1", "s2", "s1", "s2", "s1"]   # big, medium, small, repeating

def pz_tiles(items):
    real = [g for g in items if not g.get("soon")]; soon = [g for g in items if g.get("soon")]
    return "".join([pk_tile(g, "", PZ_SIZES[i % len(PZ_SIZES)], pv=True) for i, g in enumerate(real)] + [pk_tile(g, "", "s1") for g in soon])

def build_home_cards(fam):
    jsonld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Organization", "@id": SITE["url"] + "/#org", "name": "Stratos Games", "url": SITE["url"] + "/", "email": SITE["contact"], "logo": SITE["url"] + "/assets/favicon.svg"},
        {"@type": "WebSite", "@id": SITE["url"] + "/#site", "url": SITE["url"] + "/", "name": "Stratos Games", "publisher": {"@id": SITE["url"] + "/#org"}}]}
    counts = {}
    for g in fam:
        if not g.get("soon"): counts[g["category"]] = counts.get(g["category"], 0) + 1
    counts["studio"] = len(SITE.get("studio_games", []))
    cats = "".join(f'<li><a href="c/{c["id"]}/">{esc(c["label"])}</a>: {esc(c.get("intro") or c.get("mood", ""))}</li>'
                   for c in SITE["categories"] if c["id"] != "new" and counts.get(c["id"]))
    about = pk_text("About Stratos Games", SITE.get("about_home", []), f'<h3>Play by category</h3><ul>{cats}</ul>' if cats else "")
    body = pk_body("", PK_MINE + pz_tiles(fam) + pk_cats(), active="home", nav=pz_nav(), cls=" poki", top=cg_top(sum(1 for g in fam if is_new(g))), after=about)
    write("index.html", head("Stratos Games: free browser games, made by the family", SITE["description"], SITE["url"] + "/", og_image=SITE["url"] + "/assets/og.jpg", jsonld=jsonld) + body)

def build_home(fam, studio):
    if CLEAN: return build_home_cards(fam)
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
    write("index.html", head("Stratos Games: free browser games, new every week", SITE["description"], SITE["url"] + "/", og_image=SITE["url"] + "/assets/og.jpg", jsonld=jsonld) + body)

def build_category(cid, items, fam, studio):
    c = CATS[cid]; base = "../../"
    pool = ([g for g in fam if not g.get("soon")] if cid == "new" else studio if cid == "studio" else items)
    if CLEAN:
        n = len(pool)
        headcard = f'<div class="pk-head"><h1>{c.get("emoji", "")} {esc(c["label"])}</h1><small>{esc(c.get("mood", ""))} · {n} game{"s" if n != 1 else ""}</small></div>'
        names = [f'{g["title"]} by {g["maker"]}' for g in pool if not g.get("soon")]
        listing = (f'<h3>Games in this section</h3>{pk_list(names)}' if names else "")
        about = pk_text(f'About {c["label"].lower()} games' if cid not in ("new", "studio") else f'About {c["label"].lower()}',
                        pk_paras(c.get("intro")), listing)
        body = pk_body(base, headcard + pk_tiles(pool, base) + pk_cats(base), active=cid, after=about)
        write(f"c/{cid}/index.html", head(f"{c['label']} games | Stratos Games", f"Free {c['label'].lower()} games to play in your browser on Stratos Games. {c.get('mood', '')}.", f"{SITE['url']}/c/{cid}/", base=base, kids=cid == "kids") + body)
        return
    body = (f'<body class="{"clean" if CLEAN else ""}">{topbar(base)}<div class="shell">{sidebar(base, cid)}<main class="main">'
            f'<section class="row" id="results" hidden><div class="rh"><h2></h2></div><div class="grid"></div></section>'
            f'{wall(pool, base, bigs=1, title=c["label"], sub=f"{c.get('mood', '')} · {len(pool)} game{'s' if len(pool) != 1 else ''}") if pool else f"<section class=\"row\"><div class=\"rh\"><h2>{esc(c['label'])}</h2></div><div class=\"wall\"><div class=\"empty\">Nothing here yet. Be the first.</div>{cta_tile()}</div></section>"}'
            f'{row("From the studio", studio, base, cat_id="studio") if cid != "studio" and not CLEAN else ""}{footer(base)}</main></div>{JS}</body></html>')
    write(f"c/{cid}/index.html", head(f"{c['label']} games | Stratos Games", f"Free {c['label'].lower()} games to play in your browser on Stratos Games. {c.get('mood', '')}.", f"{SITE['url']}/c/{cid}/", base=base, kids=cid == "kids") + body)

# Play page: one framed block under the tiles, laid out like Poki's game pages (Nov 2026):
# cover + breadcrumb + title + description (Show more), a row of quick facts, then an "About this game" table.
# It lines up with the tiles (not the game: on phones the game runs edge to edge).
ICONS["phone"] = '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>'
ICONS["joystick"] = ICONS.get("joystick") or '<circle cx="12" cy="6" r="3"/><path d="M12 9v6M5 15h14v5H5z"/>'

def pk_date(s):
    try:
        d = datetime.date.fromisoformat(str(s)); return f"{d.day} {d.strftime('%b %Y')}"
    except Exception:
        return str(s or "")

def pk_faq(g):
    """#70 AEO: the questions people ask about a game (and ask AI assistants), answered from game.json. Shown on the
    play page and given to Google and AI assistants as FAQ data. A maker can add more in game.json:
    "faq": [{"q": "...", "a": "..."}]."""
    t, maker = g["title"], g["maker"]
    kind = {"arcade": "an arcade game", "puzzle": "a puzzle game", "word": "a word game", "party": "a party game",
            "sports": "a sports game", "kids": "a game for kids"}.get(g["category"], f'a {CATS[g["category"]]["label"].lower()} game')
    ctr = [str(x).strip().rstrip(".") for x in ([g["controls"]] if isinstance(g.get("controls"), str) else g.get("controls") or []) if str(x).strip()]
    qa = []
    how = (g.get("how_to_play") or "").strip()
    if how or ctr:
        qa.append((f"How do I play {t}?", " ".join(x for x in (how, ("Controls: " + "; ".join(ctr) + ".") if ctr else "") if x)))
    qa.append((f"Is {t} free to play?", f"Yes. {t} is free to play in your web browser on Stratos Games. There is nothing to download or install."))
    qa.append((f"Does {t} work on a phone?", f"Yes. {t} runs in the web browser on phones, tablets and computers, so you can play it anywhere."))
    qa.append((f"What kind of game is {t}?", f"{t} is {kind}." + (f" {g['one_line'].strip()}" if g.get("one_line") else "")))
    qa.append((f"Who made {t}?", f"{maker} made {t}. It was added to Stratos Games on {pk_date(g.get('added'))}."))
    for x in g.get("faq") or []:
        if isinstance(x, dict) and str(x.get("q") or "").strip() and str(x.get("a") or "").strip():
            qa.append((str(x["q"]).strip(), str(x["a"]).strip()))
    return qa

def pk_meta(g):
    """#70: the meta description Google shows under the link: the one-line pitch (or the start of the description),
    with 'free to play' when there is room, at most about 160 characters."""
    one = " ".join(str(g.get("one_line") or "").split())
    base = one if len(one) >= 50 else " ".join(" ".join(pk_paras(g.get("description"))).split()) or one or f"{g['title']} by {g['maker']}."
    if base and base[-1] not in ".!?": base += "."
    tail = " Free to play in your browser on Stratos Games."
    if len(base) + len(tail) <= 160: return base + tail
    if len(base) <= 160: return base
    cut = base[:157].rsplit(" ", 1)[0].rstrip(",;:-")
    return cut + "…"

def pk_detail(g, base):
    c = CATS[g["category"]]; cat_href = f'{base}c/{g["category"]}/'
    paras = pk_paras(g.get("description")) or ([g["one_line"]] if g.get("one_line") else [])
    soon = f'<p class="soon-note">Coming soon. {esc(g["maker"])} is building this one. The box is claimed, the game lands here when it is ready.</p>' if g.get("soon") else ""
    desc = soon + "".join(f"<p>{esc(p)}</p>" for p in paras)
    dev = esc(g["maker"]) + (f' · <a href="https://github.com/{esc(g["github"])}" target="_blank" rel="noopener">GitHub</a>' if g.get("github") else "")
    def fact(ic, hue, label, val):
        return f'<div class="pd-fact"><span class="pd-fi" style="--h:{hue}">{ic}</span><span><small>{label}</small><b>{val}</b></span></div>'
    facts = (fact(f'<span class="em">{c.get("emoji", "")}</span>', 30, "Category", f'<a href="{cat_href}">{esc(c["label"])}</a>') +
             fact(icon("clock", 20), 340, "Added", esc(pk_date(g.get("added")))) +
             fact(icon("phone", 20), 190, "Plays on", "Phone &amp; computer") +
             fact(icon("sparkle", 20), 270, "Price", "Free"))
    def row(ic, label, val):
        return f'<div class="pd-row"><dt>{icon(ic, 19)}{label}</dt><dd>{val}</dd></div>' if val else ""
    story = "".join(f"<p>{esc(p)}</p>" for p in pk_paras(g.get("story")))
    rows = (row("info", "How to play", f'<p>{esc(g["how_to_play"])}</p>' if g.get("how_to_play") else "") +
            row("joystick", "Controls", pk_list(g.get("controls"))) +
            row("star", "Tips", pk_list(g.get("tips"))) +
            row("user", "From the maker", story) +
            row("phone", "Supported devices", "Phone, tablet and computer, right in the browser. No download.") +
            f'<div class="pd-row" id="pd-saves" hidden><dt>{icon("bookmark", 19)}Your progress</dt><dd><p>Saved on this device, in this browser. '
            'No account needed. Clearing your browser data removes it.</p></dd></div>' +
            row("github", "Developer", dev) +
            row("clock", "Released", esc(pk_date(g.get("added")))))
    faq = "".join(f'<div class="pd-row"><dt>{icon("help", 19)}{esc(q)}</dt><dd><p>{esc(a)}</p></dd></div>' for q, a in pk_faq(g))
    return (f'<section class="pk-detail"><div class="pd-head">'
            f'<img class="pd-cover" src="{esc(base + g["thumb"])}" alt="{esc(g["title"])} cover" width="800" height="500" loading="lazy">'
            f'<div class="pd-main"><nav class="pd-crumb" aria-label="Breadcrumb"><a href="{base}">Games</a>{icon("chev", 14)}<a href="{cat_href}">{esc(c["label"])} games</a></nav>'
            f'<h1>{esc(g["title"])}</h1><p class="pd-by">by {esc(g["maker"])}</p>'
            f'<div class="pd-desc" id="pd-desc">{desc}</div>'
            f'<button class="pd-more" id="pd-more" type="button" aria-expanded="false" hidden><span>Show more</span>{icon("plus", 15)}</button></div></div>'
            f'<div class="pd-facts">{facts}</div>'
            f'<h2>About this game</h2><dl class="pd-table">{rows}</dl>'
            f'<h2 id="faq">Questions and answers</h2><dl class="pd-table pd-faq">{faq}</dl></section>'
            '<script>(function(){var D=document,d=D.getElementById("pd-desc"),b=D.getElementById("pd-more"),g=D.querySelector(".pk-grid"),s=D.querySelector(".pk-detail");'
            'function fit(){if(!g||!s)return;var l=1e9,r=-1e9;[].forEach.call(g.children,function(c){var b=c.getBoundingClientRect();if(!b.width||c.hidden||c.classList.contains(\"pk-stage\"))return;l=Math.min(l,b.left);r=Math.max(r,b.right)});'
            'if(r<=l)return;var B=D.body,o=B.getBoundingClientRect().left+parseFloat(getComputedStyle(B).paddingLeft);s.style.width=(r-l)+"px";s.style.marginLeft=(l-o)+"px"}'
            'fit();addEventListener("resize",fit);addEventListener("load",fit);'
            'if(!d||!b)return;d.classList.add("clamp");if(d.scrollHeight<=d.clientHeight+4){d.classList.remove("clamp");return}b.hidden=false;'
            'b.onclick=function(){var c=d.classList.toggle("clamp");b.firstChild.textContent=c?"Show more":"Show less";b.classList.toggle("open",!c);b.setAttribute("aria-expanded",String(!c))}})()</script>')

def pk_splash(g, base):
    """#68: every game opens with the same Stratos Games splash, then a loading screen, shown by the play page over
    the game frame (no maker adds anything). Modelled on Arrow Rush's old splash (a comet draws the S over a night sky
    with a glowing horizon, then STRATOS / GAMES, then a LOADING screen), with the brand's snake as the S:
      1. a big snake S draws itself in from its tail, standing on the horizon, a glowing comet at the tip; its eyes
         pop open, it blinks and flicks its tongue
      2. it shrinks into its place in the logo while the letters "tratos" fly in and come together; GAMES slides in
      3. the logo gives way to the loading screen: the game's cover and a LOADING bar (fills when the game has loaded)
      4. the game opens
    About 5.3 s when the game is ready (everything 25% slower than the first cut, the snake drawing and the LOADING bar
    50% slower), longer only while it is still loading (15 s at most). A tap or any key skips
    it. Silent. Players who ask for less motion get it without the movement."""
    mark = (SN_INNER.replace('<path d="M142 62', '<path mask="url(#ss-m)" d="M142 62')
            .replace('<path d="M118 44', '<path mask="url(#ss-m)" d="M118 44')
            .replace('<path d="M74 92', '<path mask="url(#ss-m)" d="M74 92')
            .replace('<g class="sn-eye">', '<g class="sn-eye ss-eye">'))
    fly = [("-1.1em", "-.9em", "-50deg"), ("-.4em", "1.1em", "40deg"), (".5em", "-1.2em", "-30deg"),
           ("1.2em", ".9em", "55deg"), ("1.9em", "-.7em", "-45deg"), ("2.6em", "1em", "35deg")]
    letters = "".join(f'<i style="--x:{x};--y:{y};--r:{r};--d:{k * 75}ms">{c}</i>' for k, (c, (x, y, r)) in enumerate(zip("tratos", fly)))
    svg = ('<svg class="sn-mark ss-mark" viewBox="0 0 200 200" aria-hidden="true"><defs>'
           '<mask id="ss-m" maskUnits="userSpaceOnUse" x="-60" y="-60" width="340" height="340">'
           '<path id="ss-p" d="M56 146 C64 176 142 178 142 136 C142 96 60 110 60 72 C60 30 136 32 142 62" fill="none" stroke="#fff" stroke-width="66" stroke-linecap="round"/></mask>'
           '<radialGradient id="ss-g"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#e2ffb0" stop-opacity=".9"/><stop offset="1" stop-color="#B6FF3B" stop-opacity="0"/></radialGradient>'
           f'</defs>{mark}<g class="ss-comet" transform="translate(56 146)" style="opacity:0"><circle r="24" fill="url(#ss-g)"/><circle r="7" fill="#fff"/></g></svg>')
    return (f'<div class="pk-splash" id="pk-splash" aria-hidden="true"><div class="ss-sky"></div>'
            f'<div class="ss-logo"><span class="sn-word"><span class="sn-row">{svg}<span class="sn-w1">{letters}</span></span><span class="sn-w2">GAMES</span></span><span class="ss-horizon"></span></div>'
            f'<div class="ss-loading"><img class="ss-cover" src="{esc(base + g["thumb"])}" alt=""><div class="ss-bar"><i></i></div><small>LOADING</small></div></div>'
            '<script>(function(){var s=document.getElementById("pk-splash"),f=document.getElementById("game");if(!s||!f)return;'
            'var p=document.getElementById("ss-p"),cm=s.querySelector(".ss-comet"),lg=s.querySelector(".ss-logo"),bar=s.querySelector(".ss-bar i"),mk=s.querySelector(".ss-mark"),hz=s.querySelector(".ss-horizon"),'
            't0=Date.now(),loaded=0,gone=0,lo=0,v=0,vs=0,vt=0,done=0,did={},L=0,'
            'still=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);'
            'try{L=p.getTotalLength()}catch(e){still=true}var M=L+60;'
            'if(!still){p.style.strokeDasharray=L+" "+(L+200);p.style.strokeDashoffset=M}'
            'var T=still?{letters:0,eyes:0,settle:0,games:0,load:875}:{eyes:1380,tongue:1570,settle:1780,letters:1840,games:2405,load:3405};'
            'function place(){if(still||did.settle)return;try{mk.style.transform="none";var r=mk.getBoundingClientRect(),sr=s.getBoundingClientRect(),hr=hz.getBoundingClientRect();mk.style.transform="";'
            'var k=Math.min(sr.height*.36,sr.width*.42,230)/r.height;if(!(k>1))return;'
            'mk.style.setProperty("--ssx",(sr.left+sr.width/2-r.left-r.width/2).toFixed(1)+"px");'
            'mk.style.setProperty("--ssy",(hr.top-r.height*k/2-6-r.top-r.height/2).toFixed(1)+"px");mk.style.setProperty("--sss",k.toFixed(3))}catch(e){}}'
            'place();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);'
            'f.addEventListener("load",function(){loaded=1});'
            'function cls(c){s.classList.add(c)}'
            'function at(t,k,fn){if(!did[k]&&T[k]!=null&&t>=T[k]){did[k]=1;fn()}}'
            'function hide(){if(gone)return;gone=1;s.classList.add("out");setTimeout(function(){s.remove()},580)}'
            'function ease(x){x=x<0?0:x>1?1:x;return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}'
            'cls("ss-run");'
            'function tick(){if(gone)return;var t=Date.now()-t0;'
            'if(!still){var q=ease((t-125)/1275),d=M*q-60;p.style.strokeDashoffset=M*(1-q);'
            'if(d>0){var pt=p.getPointAtLength(Math.min(d,L));cm.setAttribute("transform","translate("+pt.x.toFixed(1)+" "+pt.y.toFixed(1)+")")}'
            'cm.style.opacity=d>0&&q<1?1:0}'
            'at(t,"letters",function(){cls("ss-letters")});at(t,"eyes",function(){cls("ss-eyes")});'
            'at(t,"tongue",function(){cls("ss-tongue");lg.classList.add("sn-blink");setTimeout(function(){lg.classList.remove("sn-blink")},220)});at(t,"settle",function(){cls("ss-settle")});'
            'at(t,"games",function(){cls("ss-games")});at(t,"load",function(){cls("ss-load");lo=t});'
            'if(lo){var u=t-lo-250;if(u>0){if(loaded){if(!vt){vt=t;vs=v}v=vs+(1-vs)*Math.min(1,(t-vt)/825)}else v=.9*(1-Math.exp(-u/2250));'
            'bar.style.width=(v*100).toFixed(1)+"%";if(v>=1&&!done)done=t;if(done&&t-done>200){hide();return}}}'
            'if(t>15000){hide();return}requestAnimationFrame(tick)}'
            'requestAnimationFrame(tick);s.addEventListener("pointerdown",hide);addEventListener("keydown",hide,{once:true})})()</script>')

def pk_saves():
    """#72: tell players their progress is saved. The play page watches the game save in the browser (localStorage, or the
    IndexedDB saves of Unity and Godot builds), from outside the game, so every game gets this with no change by its maker:
    a soft "Progress saved on this device" note (at most every 3 minutes, never in the first 12 seconds, never for settings
    such as sound or language), and from then on the game's page says "Your progress is saved on this device" in this
    browser (sg_saves). Only real saves count, so the page never claims it for a game that does not save."""
    return ('<div class="pk-saved" id="pk-saved" role="status" aria-live="polite" hidden>✓ Progress saved on this device</div>'
            '<script>(function(){var D=document,f=D.getElementById("game"),n=D.getElementById("pk-saved"),me=D.body.getAttribute("data-game"),t0=Date.now(),last=0,K="sg_saves";if(!f||!n||!me)return;'
            'var SKIP=/^(stratos[.]|sg_|_)|sound|music|mute|volume|lang|locale|theme|tutorial|seen|intro|onboard|setting|pref|haptic|vibr|quality|graphic|consent|sfx|bgm|name|profile|lastload|cfg|config|debug|cache|session/i;'
            'function known(){try{return !!JSON.parse(localStorage.getItem(K)||"{}")[me]}catch(e){return false}}'
            'function row(){var r=D.getElementById("pd-saves");if(r)r.hidden=false}'
            'function saved(k){if(SKIP.test(String(k)))return;var t=Date.now();if(t-t0<12000)return;'
            'if(!known()){try{var m=JSON.parse(localStorage.getItem(K)||"{}");m[me]=1;localStorage.setItem(K,JSON.stringify(m))}catch(e){}}row();'
            'if(t-last<180000)return;last=t;n.hidden=false;n.offsetWidth;n.classList.add("on");clearTimeout(n._t);n._t=setTimeout(function(){n.classList.remove("on");setTimeout(function(){n.hidden=true},400)},2600)}'
            'function hook(){try{var w=f.contentWindow,P=w.Storage&&w.Storage.prototype;if(P&&!P.__sg){var o=P.setItem;P.setItem=function(k){var r=o.apply(this,arguments);try{if(this===w.localStorage)saved(k)}catch(e){}return r};P.__sg=1}'
            'var I=w.IDBObjectStore&&w.IDBObjectStore.prototype;if(I&&!I.__sg){var op=I.put;I.put=function(){try{var db=this.transaction&&this.transaction.db&&this.transaction.db.name;if(/idbfs|userfs/i.test(db||""))saved("save")}catch(e){}return op.apply(this,arguments)};I.__sg=1}}catch(e){}}'
            'f.addEventListener("load",hook);hook();if(known())D.addEventListener("DOMContentLoaded",row)})()</script>')

def build_play(g, fam, studio):
    base = "../../"; more = [x for x in (fam if CLEAN else fam + studio) if x["slug"] != g["slug"] and not x.get("soon")][:8]
    desc = g.get("description") or g.get("one_line") or f"{g['title']} by {g['maker']}, free to play on Stratos Games."
    page_url = f"{SITE['url']}/{g['url']}"
    game_ld = {"@type": "VideoGame", "@id": page_url + "#game", "name": g["title"], "url": page_url, "image": f"{SITE['url']}/{g['thumb']}",
               "description": desc, "genre": CATS[g["category"]]["label"], "gamePlatform": "Web browser", "applicationCategory": "Game", "operatingSystem": "Any",
               "author": {"@type": "Person", "name": g["maker"]}, "publisher": {"@id": SITE["url"] + "/#org"}, "isAccessibleForFree": True, "datePublished": g["added"]}
    # #70 AEO: the questions on the page, as FAQ data for Google and AI assistants
    faq_ld = {"@type": "FAQPage", "@id": page_url + "#faq", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pk_faq(g)]}
    jsonld = {"@context": "https://schema.org", "@graph": [game_ld, faq_ld]}
    gh = f' · <a href="https://github.com/{esc(g["github"])}" target="_blank" rel="noopener">GitHub</a>' if g.get("github") else ""
    howto = f'<h2>How to play</h2><p>{esc(g["how_to_play"])}</p>' if g.get("how_to_play") else ""
    about = (f'<p class="soon-note">Coming soon. {esc(g["maker"])} is building this one. The box is claimed, the game lands here when it is ready.</p>' if g.get("soon") else "") + (f'<p>{esc(g["description"])}</p>' if g.get("description") and not CLEAN else "")
    # game.json, all optional: "description" (paragraphs, blank line between), "controls" and "tips" (a line or a list),
    # "story" (why and how the maker made it, in their own words)
    more = (pk_list(g.get("controls")) and f'<h3>Controls</h3>{pk_list(g.get("controls"))}') + \
           (pk_list(g.get("tips")) and f'<h3>Tips</h3>{pk_list(g.get("tips"))}') + \
           (f'<h3>From the maker</h3>' + "".join(f"<p>{esc(p)}</p>" for p in pk_paras(g.get("story"))) if pk_paras(g.get("story")) else "")
    words = pk_detail(g, base)
    report = f'mailto:{SITE["contact"]}?subject={esc("Problem with " + g["title"] + " on stratos.games")}'
    if CLEAN:
        stage = (f'<div class="pk-stage"><div class="pk-frame"><iframe id="game" src="{base}{esc(g["game_url"])}" title="{esc(g["title"])}" allow="fullscreen; autoplay; gamepad" allowfullscreen loading="eager"></iframe>{pk_splash(g, base)}{pk_saves()}</div>'
                 f'<div class="pk-bar"><img src="{esc(base + g["thumb"])}" alt=""><div class="pk-bt"><b>{esc(g["title"])}</b><small>by {esc(g["maker"])}</small></div>'
                 f'<button class="pk-ib pk-vote up" type="button" data-v="1" title="I like this game" aria-label="Like" aria-pressed="false">{icon("thumbup", 19)}</button>'
                 f'<button class="pk-ib pk-vote down" type="button" data-v="-1" title="I don\'t like this game" aria-label="Dislike" aria-pressed="false">{icon("thumbdown", 19)}</button>'
                 f'<script>(function(){{var k="sg_votes",s={json.dumps(g["slug"])},b=[].slice.call(document.querySelectorAll(".pk-vote"));'
                 f'function rd(){{try{{return JSON.parse(localStorage.getItem(k)||"{{}}")||{{}}}}catch(e){{return{{}}}}}}'
                 f'function paint(){{var v=rd()[s]||0;b.forEach(function(x){{var o=+x.dataset.v===v;x.classList.toggle("on",o);x.setAttribute("aria-pressed",o)}})}}'
                 f'b.forEach(function(x){{x.onclick=function(){{var m=rd(),v=+x.dataset.v;if(m[s]===v)delete m[s];else m[s]=v;try{{localStorage.setItem(k,JSON.stringify(m))}}catch(e){{}}paint()}}}});paint()}})()</script>'
                 f'<button class="pk-ib pk-like" id="pk-like" type="button" title="Add to favourites" aria-label="Favourite" aria-pressed="false">{icon("heart", 18)}</button>'
                 f'<button class="pk-ib pk-share" type="button" title="Share" aria-label="Share" onclick="var b=this;(navigator.share?navigator.share({{title:document.title,url:location.href}}):navigator.clipboard.writeText(location.href).then(function(){{b.title=\'Link copied\'}}))">{icon("share", 18)}</button>'
                 f'<a class="pk-ib pk-flag" href="{report}" title="Report a problem" aria-label="Report a problem">{icon("flag", 18)}</a>'
                 f'<button class="pk-ib pk-full" type="button" title="Fullscreen" aria-label="Fullscreen" onclick="var f=document.getElementById(\'game\');(f.requestFullscreen||f.webkitRequestFullscreen).call(f)">{icon("full", 18)}</button></div></div>')
        others = [x for x in fam if x["slug"] != g["slug"] and not x.get("soon")]
        # the maker's other games first (matched by GitHub name: display names vary, e.g. "Nikhat" / "Nikhat Sultana"),
        # then similar games (same category), then the rest. Kids game pages keep kids games first (the maker's kids
        # games lead), so a child is never steered to a maker's shooter or card game right under a kids game.
        owner = lambda x: (x.get("github") or x["maker"]).strip().lower()
        if g["category"] == "kids":
            others.sort(key=lambda x: (x["category"] != "kids", x["category"] == "kids" and owner(x) != owner(g)))
        else:
            others.sort(key=lambda x: (owner(x) != owner(g), x["category"] != g["category"]))
        gi = json.dumps({"s": g["slug"], "t": g["title"], "u": g["url"], "th": g["thumb"], **({"pv": clip_of(g)} if clip_of(g) else {})}, ensure_ascii=False)
        # Phones: only the first few similar games sit between the game and its details, the rest come after the details.
        # The .pk-later tiles hide on phones and show again in the .pk-more grid, which only phones see (assets/site.css).
        near = 4
        rest = f'<section class="pk-grid pk-more" aria-label="More games">{pk_tiles(others[near:], base, first_big=False)}{pk_cats(base)}</section>'
        body = pk_body(base, stage + PK_MINE + pk_tiles(others, base, first_big=False, later_from=near) + pk_cats(base),
                       attrs=f' data-game="{esc(g["slug"])}" data-gi="{esc(gi)}"', active=g["category"], after=words + rest)
        write(f"{g['url']}index.html", head(f"{g['title']} by {g['maker']} | Play free on Stratos Games", pk_meta(g), f"{SITE['url']}/{g['url']}", base=base, game=g["slug"], og_image=f"{SITE['url']}/{g['thumb']}", jsonld=jsonld, kids=g["category"] == "kids") + body)
        return
    body = (f'<body class="{"clean" if CLEAN else ""}">{topbar(base)}<div class="shell">{sidebar(base, g["category"])}<main class="main play"><div class="play-grid{" solo" if CLEAN and not more else ""}"><div class="stage-col">'
            f'<div class="stage"><iframe id="game" src="{base}{esc(g["game_url"])}" title="{esc(g["title"])}" allow="fullscreen; autoplay; gamepad" allowfullscreen loading="eager"></iframe>'
            f'<div class="stage-bar"><div class="sb-title"><b>{esc(g["title"])}</b><span class="tm">{esc(CATS[g["category"]]["label"])} · by {esc(g["maker"])}</span></div>'
            f'<div class="sb-actions"><button class="fs" type="button" onclick="var f=document.getElementById(\'game\');(f.requestFullscreen||f.webkitRequestFullscreen).call(f)">{icon("full", 16)}Fullscreen</button>'
            f'<button class="fs" type="button" onclick="var b=this;(navigator.share?navigator.share({{title:document.title,url:location.href}}):navigator.clipboard.writeText(location.href).then(function(){{b.lastChild.textContent=\'Link copied\'}}))">{icon("share", 16)}<span>Share</span></button>'
            f'<a class="fs" href="{report}">{icon("flag", 16)}Report</a></div></div></div>'
            f'<section class="about-game"><h1>{esc(g["title"])}</h1><p class="lead">{esc(g.get("one_line"))}</p>{about}{howto}'
            f'<p class="meta">{esc(CATS[g["category"]]["label"])} · Made by {esc(g["maker"])}{gh} · Added {esc(g["added"])} · Free, no install, works on a phone</p></section></div>'
            f'<aside class="play-side"{" hidden" if CLEAN and not more else ""}><h3>More games</h3><div class="tiles">{"".join(tile(x, base) for x in more)}{"" if CLEAN else cta_tile()}</div></aside></div>{footer(base)}</main></div>{JS}</body></html>')
    write(f"{g['url']}index.html", head(f"{g['title']} by {g['maker']} | Play free on Stratos Games", pk_meta(g), f"{SITE['url']}/{g['url']}", base=base, game=g["slug"], og_image=f"{SITE['url']}/{g['thumb']}", jsonld=jsonld, kids=g["category"] == "kids") + body)

def build_coins_page(fam):
    """/coins/: the player's coin balance, today's progress, ways to earn, spend, unlocked and history. Filled in the browser by assets/coins-page.js."""
    games = {g["slug"]: {"t": g["title"], "u": g["url"]} for g in fam if not g.get("soon")}   # "u": the game's link (#67)
    gj = json.dumps(games, ensure_ascii=False).replace("</", "<\/")
    def sec(h, body, i=""): return f'<section class="pk-text coins-sec"{(" id=" + chr(34) + i + chr(34)) if i else ""}><h2>{h}</h2>{body}</section>'
    inner = '<div class="pk-head wide"><h1>Stratos Coins</h1><small>Earn coins in any game. Spend them in any game.</small></div>'
    after = ('<div class="coins-wrap">'
        '<section class="pk-text coins-sec" aria-labelledby="c-h-bal"><h2 id="c-h-bal">Your balance</h2>'
        '<p class="coins-big"><span id="c-bal" aria-live="polite">0</span> coins</p>'
        '<p id="c-empty" class="coins-note" hidden>Play a game to earn your first coins.</p>'
        '<p id="c-nostore" class="coins-note" hidden>Your browser is blocking storage, so these coins will not be saved after you close this page.</p>'
        '<dl class="coins-stats"><div><dt>Earned so far</dt><dd id="c-earned">0</dd></div><div><dt>Spent so far</dt><dd id="c-spent">0</dd></div><div><dt>Streak</dt><dd id="c-streak">None yet</dd></div></dl>'
        '<p class="coins-note">Coins are only for use inside Stratos games and have no cash value. They are saved in this browser on this device; clearing your browser data removes them.</p></section>'
        + sec("Today", '<div id="c-today-body"></div>')
        + sec("Ways to earn", '<ul id="c-earn-list" class="coins-list"></ul>')
        + sec("Spend your coins", '<div id="c-spend-body"></div>')
        + sec("Unlocked", '<ul id="c-unlocked-list" class="coins-list"></ul>')
        + sec("History", '<div id="c-history-body"></div>')
        + '<noscript><p class="coins-note">Turn on JavaScript to see your coins.</p></noscript></div>'
        + f'<script>window.STRATOS_GAMES={gj};</script><script src="../assets/coins-page.js?v={hashlib.sha1(open(os.path.join(ROOT, "assets", "coins-page.js"), "rb").read()).hexdigest()[:8]}" defer></script>')
    write("coins/index.html", head("Stratos Coins: your balance, rewards and history | Stratos Games", "See your Stratos Coins, what you can earn today, what you can spend them on, and your history. One wallet for every Stratos game.", SITE["url"] + "/coins/", base="../") + pk_body("../", inner, active="coins", after=after))

def build_extras(fam, studio):
    real = [g for g in fam if not g.get("soon")]; soon = [g for g in fam if g.get("soon")]
    urls = [SITE["url"] + "/"] + [f"{SITE['url']}/{g['url']}" for g in real] + [f"{SITE['url']}/c/{c['id']}/" for c in SITE["categories"]]
    for slug in ("about", "press", "for-publishers", "games-bloxplode", "games-arrow-puzzle", "games-house-mafia", "games-word-quest", "privacy-policy", "terms-of-use"):
        if os.path.exists(os.path.join(ROOT, slug, "index.html")): urls.append(f"{SITE['url']}/{slug}/")
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{esc(u)}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {SITE['url']}/sitemap.xml\n")
    lines = [f"# Stratos Games", "", SITE["description"], "", "## Play (free browser games)"] + [f"- [{g['title']}]({SITE['url']}/{g['url']}): {g.get('one_line','')} Made by {g['maker']}." for g in real] + ["", "## Coming soon (claimed by family makers)"] + [f"- {g['title']} by {g['maker']}: {g.get('one_line','')}" for g in soon] + ["", "## Studio titles"] + [f"- [{s['title']}]({SITE['url']}/{s['page']}): {s['one_line']}" for s in studio] + ["", "## Pages", f"- About: {SITE['url']}/about/", f"- For publishers: {SITE['url']}/for-publishers/", f"- Press kit: {SITE['url']}/press/", f"- Contact: {SITE['contact']}"]
    write("llms.txt", "\n".join(lines) + "\n")
    if CLEAN:
        write("404.html", head("Page not found | Stratos Games", "That page is not here.", SITE["url"] + "/404.html") + pk_body("/", '<div class="pk-head wide"><h1>🕹️ 404. That page is not here.</h1><small>Try the games instead.</small></div>' + pk_tiles(real, "/", first_big=False) + pk_cats("/")))
    else: write("404.html", head("Page not found | Stratos Games", "That page is not here.", SITE["url"] + "/404.html") + f'<body class="{"clean" if CLEAN else ""}">{topbar()}<div class="shell">{sidebar()}<main class="main"><section class="pitch"><div><h2>404. That page is not here.</h2><p>Try the games instead.</p><a class="btn" href="/">Back to the games</a></div><div class="pitch-art">🕹️</div></section>{footer()}</main></div>{JS}</body></html>')
    json.dump({"site": SITE["url"], "count": len(fam) + len(studio), "games": [{k: g.get(k) for k in ("slug", "title", "maker", "one_line", "category", "url", "thumb", "added", "github", "kind", "soon")} for g in fam + studio]},
              open(os.path.join(ROOT, "games.json"), "w", encoding="utf-8"), indent=1)

import shutil
def prune(fam):
    keep = {g["link"] for g in fam}   # play pages live at the game's link (#67); old folder-named pages go
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
    fam, problems = load_games(); studio = studio_games()
    problems += [f"{g['slug']}: coming soon, not shown on the site yet" for g in fam if g["soon"]]
    fam = [g for g in fam if not g["soon"]]   # unfinished boxes stay off the public site
    prune(fam)
    build_home(fam, studio)
    by_cat = {}
    for g in fam + studio:
        if not g.get("soon"): by_cat.setdefault(g["category"], []).append(g)
    for c in SITE["categories"]: build_category(c["id"], by_cat.get(c["id"], []), fam, studio)
    for g in fam: build_play(g, fam, studio)
    build_extras(fam, studio)
    build_coins_page(fam)
    write("assets/stratos.js", STRATOS_JS)
    print(f"built: home, {len(fam)} play page(s), {len(SITE['categories'])} category pages, sitemap, robots, llms.txt, 404")
    try:   # coin rules: print problems as warnings (never stops the build; the staging report shows them too)
        import check_coins_config
        for e in check_coins_config.load_and_check(): print("  COINS CONFIG WARNING:", e)
    except Exception as e:
        print("  coins config not checked:", e.__class__.__name__)
    for p in problems: print("  skipped:", p)

if __name__ == "__main__":
    main()
