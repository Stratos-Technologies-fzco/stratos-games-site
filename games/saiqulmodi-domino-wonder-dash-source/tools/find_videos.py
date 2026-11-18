"""Finds a short real-life video for each picture on Wikimedia Commons and
writes videos.json (the data hub's video list, read by domino_data.py).

Commons videos are free (CC / public domain), have no adverts and no
"recommended next" list, which suits children. Each picture's Wikipedia
article leads to its Wikidata entry: the "video" chosen there by Wikimedia
editors comes first, then videos in the subject's own Commons category.

Every pick is checked by a person before it ships: run this, read
tools/videos_review.txt (and watch anything unclear), put any bad file name
in REJECT, run again.

States and union territories also get a playlist of their famous places
(tools/place_videos.py; again only files a person picked).

usage: python tools/find_videos.py            (everything)
       python tools/find_videos.py --places   (only the famous-places playlists)
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import domino_data as hub  # noqa: E402

OUT = os.path.join(ROOT, "videos.json")
REVIEW = os.path.join(ROOT, "tools", "videos_review.txt")
COMMONS = "https://commons.wikimedia.org/w/api.php"
WIKIPEDIA = "https://en.wikipedia.org/w/api.php"
SPARQL = "https://query.wikidata.org/sparql"
AGENT = "DominoGame/1.0 (children's learning game; https://github.com/saiqulmodi/DominoGame)"

# No real-life video for letters, numbers, signs, shapes, cartoon characters or
# free drawing; body parts are left out on purpose (medical videos are not for
# small children)
SKIP = {"ABC", "abc", "Swar", "Vyanjan", "123", "Signs", "Shapes", "Draw", "Body",
        "Cartoons"}

# English Wikipedia article for each picture where it differs from the name.
ARTICLE = {
    "Animals/Cow": "Cattle", "Birds/Peacock": "Indian peafowl", "Birds/Rooster": "Chicken",
    "Birds/Dove": "Columbidae", "Sea/Clownfish": "Amphiprioninae",
    "Sea/Pufferfish": "Tetraodontidae", "Insects/Ladybug": "Coccinellidae",
    "Insects/Bee": "Honey bee", "Plants/Palm Tree": "Arecaceae", "Plants/Pine Tree": "Pine",
    "Plants/Sunflower": "Helianthus annuus", "Plants/Lotus": "Nelumbo nucifera",
    "Plants/Daisy": "Bellis perennis", "Plants/Clover": "Trifolium",
    "Plants/Potted Plant": "Houseplant", "Plants/Corn": "Maize", "Plants/Herb": "Ocimum tenuiflorum",
    "Plants/Cherry Blossom": "Cherry blossom", "Fruits/Grapes": "Grape",
    "Vegetables/Brinjal": "Eggplant", "Vegetables/Chilli": "Chili pepper", "Vegetables/Peas": "Pea",
    "Food/Roti": "Chapati", "Food/Egg": "Egg as food", "Food/Ice Cream": "Ice cream",
    "Helpers/Doctor": "Physician", "Helpers/Police": "Police officer",
    "Helpers/Cook": "Cook (profession)", "Helpers/Pilot": "Aircraft pilot",
    "Home/School Bag": "Backpack", "Home/Key": "Key (lock)", "Home/Bulb": "Incandescent light bulb",
    "Buildings/Temple": "Hindu temple", "Buildings/Church": "Church (building)",
    "Bridges/Arch Bridge": "Arch bridge", "Bridges/Suspension Bridge": "Suspension bridge",
    "Bridges/Beam Bridge": "Beam bridge", "Bridges/Stone Bridge": "Clapper bridge",
    "Vehicles/Racing Car": "Race car", "Vehicles/Police Car": "Police car",
    "Vehicles/Fire Engine": "Fire engine", "Vehicles/Pickup Truck": "Pickup truck",
    "Vehicles/Auto Rickshaw": "Auto rickshaw", "Vehicles/Motorbike": "Motorcycle",
    "Vehicles/Scooter": "Motor scooter", "Vehicles/Kick Scooter": "Kick scooter",
    "Travel/Coach": "Passenger railroad car", "Travel/Aeroplane": "Airplane",
    "Travel/Railway": "Rail transport", "Sky/Snowflake": "Snow",
    "Countries/USA": "United States", "Countries/UK": "United Kingdom",
    "Cities/Agra": "Taj Mahal", "Cities/New York": "New York City",
    "Rivers/Ganga": "Ganges", "Rivers/Brahmaputra": "Brahmaputra River",
    "Rivers/Godavari": "Godavari River", "Rivers/Narmada": "Narmada River",
    "Rivers/Indus": "Indus River", "Rivers/Amazon": "Amazon River", "Rivers/Thames": "River Thames",
    "Rivers/Mississippi": "Mississippi River",
    "Sports/Football": "Association football", "Sports/Hockey": "Field hockey",
    "Monuments/War Memorial": "National War Memorial (India)", "Monuments/Qutub Minar": "Qutb Minar",
    "Monuments/Mysuru Palace": "Mysore Palace", "Monuments/Konark Wheel": "Konark Sun Temple",
    "Monuments/Sanchi Stupa": "Sanchi", "Cities/Delhi": "India Gate", "Cities/Kolkata": "Howrah Bridge",
    "Cities/Bengaluru": "Vidhana Soudha", "Cities/Paris": "Eiffel Tower",
    "Cities/Mumbai": "Gateway of India", "Cities/Hyderabad": "Charminar",
}

# A file a person picked by hand from the candidates list (see --candidates);
# used instead of the automatic first pick (chosen 2026-10-11)
PINNED = {
    "Animals/Cat": "File:Cat meowing into camera.webm",
    "Animals/Elephant": "File:Elephant eating Yala Sri Lanka.ogv",
    "Animals/Giraffe": "File:Juvenile Giraffe - walking - Malawi - 2018 Aug.webm",
    "Birds/Swan": "File:Mute swans and Canada geese.webm",
    "Birds/Flamingo": "File:Phoenicopterus roseus feeding.ogv",
    "Sea/Fish": "File:Madeira Garajau.webm",
    "Sea/Whale": "File:Humpbackwhale singing.webm",
    "Sea/Octopus": "File:Octopus.ogv",
    "Reptiles/Turtle": "File:Trachemys scripta elegans in koi pond at Hakone Gardens.webm",
    "Insects/Bee": "File:Honeybee.ogv",
    "Plants/Tree": "File:Centre Frame of a Faculty of Geography Tree, One.webm",
    "Fruits/Apple": "File:Apple harvest in South Tyrol 2015 video.webm",
    "Fruits/Watermelon": "File:Water melon.webm",
    "Fruits/Pineapple": "File:Preparing pineapple - 01.ogv",
    "Food/Milk": "File:Milk crown HighSpeedPhoto.webm",
    "Food/Water": "File:Eau de ruissellement.mpg",
    "Food/Honey": "File:Kodersdorf - Schusterweg - Bienen (mT) 01 ies.ogv",
    "Food/Rice": "File:Garnish fried rice.webm",
    "Sky/Rainbow": "File:Niagara waterfalls with rainbow 2015.webm",
    "Sky/Comet": "File:Comet C2014 Q2 Lovejoy captured by the AAE from Ibiza (2015-1-8 -- 2015-1-25).ogv",
    "Rivers/Ganga": "File:Ganges River in Varanasi by boat.webm",
    "Rivers/Brahmaputra": "File:River flowing.webm",
    "Cities/Delhi": "File:ICC World Cup 2011 - cheering at India gate.ogv",
    "Cities/Kolkata": "File:Howrah Bridge Night View (Silent Video) Full HD 1080p HIGH FR60.webm",
    "Cities/Paris": "File:Eiffel Tower Drone 4k-Qx c1X3zfEc-313-251.webm",
    "Travel/Aeroplane": "File:Airplane landing Innsbruck 143134.webm",
    "Home/Clock": "File:Glockenturm Villa Haas mit Stunden und Viertelstunden Schlag.webm",
    "Home/Umbrella": "File:Maeklong Station - Folding Umbrella Market - Thailand.webm",
    "Sports/Kite": "File:Kite flying in Seaside.webm",
    "Music/Trumpet": "File:Trompete in B (Périnetventile) Kurzdemonstration.webm",
    "Monuments/Red Fort": "File:Diwan-I-Am.ogv",
    "Monuments/Golden Temple": "File:Film footage of the Golden Temple in Amritsar, by Roger Dumas, circa November–December 1927.webm",
    "Monuments/Hawa Mahal": "File:Top view of Hawa Mahal Jaipur.webm",
    "Monuments/Meenakshi Temple": "File:Madurai Meenakshi Temple.webm",
    "Monuments/Sanchi Stupa": "File:Buddhist Monuments - Sanchi Hill 2013-02-21 4421.ogv",
}
# animal videos the user approved on the review page (28-Oct-2026)
with open(os.path.join(HERE, "videos_pinned.json"), encoding="utf-8") as _fh:
  PINNED.update(json.load(_fh))

# Never show a video whose name, description or categories have these words
BLOCK = re.compile(
    r"mating|copulat|\bsex|nude|naked|kill|dead\b|death|slaughter|butcher|blood|hunt|prey|"
    r"attack|fight|\bwar\b|weapon|\bgun|shoot|bomb|crash|accident|burn|injur|wound|"
    r"surgery|dissect|autopsy|vomit|corpse|carcass|predat|protest|riot|electrocut|"
    r"execution|torture|abuse|drown|victim|dying|disease|cruel|explo|terror|"
    r"lecture|interview|speech|tutorial|presentation|conference|parliament|election|"
    r"politic|advert|commercial|trailer|nazi|propaganda|horror|zombie|"
    r"elephants dream|animation|cartoon|music video|"
    # animals: only calm life in nature for children (user, 27-Oct)
    r"venom|milking|\bbite|biting|\bsting|eating a|feeding on|devour|swallow(ing)? (a|its)|"
    r"birth|calving|placenta|\begg[- ]?laying|circus|rodeo|bullfight|poach|\btrap|snare|"
    r"taxiderm|stuffed|skinn|skull|skeleton|bones\b|parasit|maggot|rotting|decompos|roadkill|"
    r"slaughterhouse|abattoir|market|butcher|meat|fur farm|chained|caged|injured|rescue|"
    r"\bvet\b|veterinar|necropsy|euthan|dying|stranded|beached|trophy",
    re.I)

# File names a person rejected after checking (add more here)
REJECT = {
    # filed under Tamil Nadu but filmed in Sri Lanka (found 2026-10-11)
    "File:அத்தாங்கு மீன்பிடி - மீன்கள் இருக்கும் இடந்தேடி நீருக்குள் நகரும் பெண்கள்.webm",
}

# Only pictures a person approved get a video in the game (checked 2026-10-11
# from each file's name, description and length). A new search result for an
# item that is not listed here is written to the review file but not shipped.
APPROVED = {
    "Animals/Dog", "Animals/Cow", "Animals/Horse", "Animals/Tiger", "Animals/Monkey",
    "Animals/Rabbit", "Animals/Camel", "Animals/Goat", "Animals/Pig",
    "Birds/Eagle", "Birds/Peacock", "Birds/Parrot", "Birds/Duck", "Birds/Owl",
    "Birds/Rooster", "Birds/Penguin", "Birds/Dove",
    "Sea/Clownfish", "Sea/Pufferfish", "Sea/Shark", "Sea/Dolphin", "Sea/Crab",
    "Reptiles/Crocodile", "Reptiles/Lizard", "Reptiles/Frog",
    "Insects/Butterfly", "Insects/Ant", "Insects/Ladybug", "Insects/Snail", "Insects/Spider",
    "Plants/Palm Tree", "Plants/Cactus", "Plants/Sunflower", "Plants/Rose", "Plants/Tulip",
    "Plants/Mushroom", "Plants/Leaf", "Plants/Pine Tree", "Plants/Seedling",
    "Plants/Hibiscus", "Plants/Cherry Blossom",
    "Fruits/Banana", "Fruits/Mango", "Fruits/Grapes", "Fruits/Strawberry", "Fruits/Carrot",
    "Vegetables/Tomato", "Vegetables/Brinjal", "Vegetables/Chilli", "Vegetables/Cucumber",
    "Vegetables/Garlic", "Vegetables/Peas", "Vegetables/Coconut",
    "Food/Egg", "Food/Bread", "Food/Roti", "Food/Ice Cream", "Food/Cake",
    "Helpers/Farmer", "Helpers/Firefighter", "Helpers/Pilot", "Helpers/Mechanic",
    "Home/House", "Home/Shoe",
    "Buildings/House", "Buildings/Temple", "Buildings/Castle",
    "Bridges/Arch Bridge", "Bridges/Suspension Bridge", "Bridges/Tower Bridge",
    "Bridges/Howrah Bridge",
    "Vehicles/Racing Car", "Vehicles/Police Car", "Vehicles/Ambulance", "Vehicles/Fire Engine",
    "Vehicles/Bus", "Vehicles/Truck", "Vehicles/Tractor", "Vehicles/Auto Rickshaw",
    "Vehicles/Bicycle", "Vehicles/Kick Scooter",
    "Travel/Train", "Travel/Coach", "Travel/Helicopter", "Travel/Sailboat", "Travel/Railway",
    "Travel/Rocket",
    "Sky/Sun", "Sky/Cloud", "Sky/Rain", "Sky/Lightning", "Sky/Snowflake", "Sky/Saturn",
    "Sky/Mountain", "Sky/Volcano",
    "Countries/Sri Lanka", "Countries/Bangladesh", "Countries/Nepal", "Countries/Egypt",
    "States/Kerala", "States/Tamil Nadu", "States/Maharashtra", "States/Rajasthan",
    "Cities/Agra", "Cities/Mumbai", "Cities/Hyderabad", "Cities/London", "Cities/New York",
    "Cities/Tokyo", "Cities/Dubai",
    "Rivers/Narmada", "Rivers/Indus", "Rivers/Nile", "Rivers/Amazon", "Rivers/Thames",
    "Rivers/Mississippi",
    "Music/Drum", "Music/Guitar", "Music/Flute", "Music/Violin", "Music/Bell", "Music/Banjo",
    "Music/Maracas",
    "Sports/Cricket", "Sports/Football", "Sports/Hockey", "Sports/Tennis", "Sports/Chess",
}
APPROVED |= set(PINNED)                  # hand-picked files are approved too
# The exact file approved for each item above (a changed search result needs a
# fresh check before it ships)
APPROVED_FILES = "videos_approved.json"

MIN_SECONDS, MAX_SECONDS = 5, 420


def api(base, params):
  params = dict(params, format="json", formatversion="2")
  data = urllib.parse.urlencode(params).encode()
  for attempt in range(4):
    try:
      req = urllib.request.Request(base, data=data, headers={"User-Agent": AGENT})
      with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())
    except Exception as exc:          # be patient with the free service
      print("  retry:", exc)
      time.sleep(5 * (attempt + 1))
  return {}


def chunks(seq, n):
  seq = list(seq)
  for i in range(0, len(seq), n):
    yield seq[i:i + n]


def strip_html(text):
  return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()


def wikidata_ids(articles):
  """Wikipedia article -> Wikidata id (follows redirects)."""
  out = {}
  for part in chunks(set(articles), 50):
    d = api(WIKIPEDIA, {"action": "query", "prop": "pageprops", "ppprop": "wikibase_item",
                        "redirects": 1, "titles": "|".join(part)})
    q = d.get("query", {})
    back = {}
    for r in q.get("normalized", []) + q.get("redirects", []):
      back[r["to"]] = back.get(r["from"], r["from"])
    for page in q.get("pages", []):
      qid = page.get("pageprops", {}).get("wikibase_item")
      if qid:
        title = page["title"]
        out[back.get(title, title)] = qid
        out[title] = qid
    time.sleep(0.5)
  return out


def wikidata_media(qids):
  """Wikidata id -> (editor-chosen video files, Commons category).

  One small SPARQL query per 60 ids (whole entities of countries are megabytes)."""
  out = {}
  for part in chunks(sorted(set(qids)), 60):
    query = ("SELECT ?item ?video ?cat WHERE { VALUES ?item { "
             + " ".join("wd:" + q for q in part)
             + " } OPTIONAL { ?item wdt:P10 ?video } OPTIONAL { ?item wdt:P373 ?cat } }")
    url = SPARQL + "?" + urllib.parse.urlencode({"query": query, "format": "json"})
    rows = []
    for attempt in range(4):
      try:
        req = urllib.request.Request(url, headers={"User-Agent": AGENT,
                                                   "Accept": "application/sparql-results+json"})
        with urllib.request.urlopen(req, timeout=90) as r:
          rows = json.loads(r.read())["results"]["bindings"]
        break
      except Exception as exc:
        print("  retry:", exc)
        time.sleep(5 * (attempt + 1))
    for row in rows:
      qid = row["item"]["value"].rsplit("/", 1)[-1]
      videos, cat = out.get(qid, ([], None))
      if "video" in row:
        name = "File:" + urllib.parse.unquote(row["video"]["value"].rsplit("/", 1)[-1])
        name = name.replace("_", " ")
        if name not in videos:
          videos.append(name)
      out[qid] = (videos, cat or (row["cat"]["value"] if "cat" in row else None))
    time.sleep(1)
  return out


def category_videos(category):
  """Video files in the subject's Commons category and its sub-categories."""
  found = []
  for query in (f'filetype:video incategory:"{category}"',
                f'filetype:video deepcat:"{category}"'):
    d = api(COMMONS, {"action": "query", "list": "search", "srnamespace": 6, "srlimit": 25,
                      "srsearch": query})
    for hit in d.get("query", {}).get("search", []):
      if hit["title"] not in found:
        found.append(hit["title"])
    time.sleep(0.5)
  return found


def video_info(files):
  """File name -> details needed to play it and to credit it."""
  out = {}
  for part in chunks(files, 40):
    d = api(COMMONS, {"action": "query", "titles": "|".join(part), "prop": "videoinfo",
                      "viprop": "url|size|mime|mediatype|derivatives|extmetadata",
                      "viextmetadatafilter": "Artist|LicenseShortName|ImageDescription|Categories"})
    q = d.get("query", {})
    back = {r["to"]: r["from"] for r in q.get("normalized", [])}
    for page in q.get("pages", []):
      if page.get("missing") or not page.get("videoinfo"):
        continue
      info = page["videoinfo"][0]
      meta = info.get("extmetadata") or {}
      title = page["title"]
      out[back.get(title, title)] = out[title] = {
          "title": title,
          "desc": strip_html((meta.get("ImageDescription") or {}).get("value"))[:200],
          "cats": (meta.get("Categories") or {}).get("value", ""),
          "seconds": float(info.get("duration") or 0),
          "license": strip_html((meta.get("LicenseShortName") or {}).get("value")),
          "artist": strip_html((meta.get("Artist") or {}).get("value"))[:80],
          "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
          "sources": best_sources(info),
      }
    time.sleep(0.5)
  return out


def best_sources(info):
  """Browser-friendly copies: a ~480p MP4 (iPhone) and WebM, then the original."""
  def rank(d):
    h = int(d.get("height") or 0)
    return (0 if 300 <= h <= 540 else 1, abs(h - 480))
  sources = []
  for d in sorted((d for d in info.get("derivatives") or [] if d.get("src")), key=rank):
    kind = "video/mp4" if "mp4" in (d.get("type") or "") else "video/webm"
    if int(d.get("height") or 0) and not any(s["type"] == kind for s in sources):
      sources.append({"src": d["src"], "type": kind})
  if not sources and info.get("url"):
    sources.append({"src": info["url"], "type": "video/webm"})
  return sources


def suitable(v):
  if not v or v["title"] in REJECT:
    return False
  if BLOCK.search(f"{v['title']} {v['desc']} {v['cats']}"):
    return False
  return (MIN_SECONDS <= v["seconds"] <= MAX_SECONDS and v["sources"] and v["license"])


def title_videos(words):
  """Video files whose title has all the words (a last resort search)."""
  d = api(COMMONS, {"action": "query", "list": "search", "srnamespace": 6, "srlimit": 25,
                    "srsearch": "filetype:video " + " ".join(f"intitle:{w}" for w in words.split())})
  return [hit["title"] for hit in d.get("query", {}).get("search", [])]


def candidates(keys, per_item=8):
  """Prints the suitable videos for each picture so a person can choose."""
  pairs = [tuple(k.split("/", 1)) for k in keys]
  article = {k: ARTICLE.get(k, k.split("/", 1)[1]) for k in keys}
  ids = wikidata_ids(article.values())
  media = wikidata_media(v for v in ids.values())
  for key in keys:
    chosen, category = media.get(ids.get(article[key]), ([], None))
    files = list(chosen)
    if category:
      files += [f for f in category_videos(category) if f not in files]
    files += [f for f in title_videos(article[key].lower()) if f not in files]
    infos = video_info(files[:45]) if files else {}
    good = [infos[f] for f in files if suitable(infos.get(f))][:per_item]
    print(f"\n### {key}  (article: {article[key]}, category: {category})")
    for v in good:
      print(f"  {v['title']}\n      {v['seconds']:.0f}s {v['license']} | {v['desc'][:150]}")
    if not good:
      print("  (nothing suitable)")


def add_places(found):
  """States and union territories: a playlist of their famous places, each
  one a file a person picked (PLACES in place_videos.py)."""
  from place_videos import PLACES, HOSTED, SITE
  infos = video_info(sorted({f for places in PLACES.values() for _p, f in places
                             if f.startswith("File:")}))
  for path, meta in HOSTED.items():      # our own copies on the game's site
    if os.path.exists(os.path.join(ROOT, "docs", path)):
      infos[path] = dict(meta, title=path, sources=[{"src": SITE + path, "type": "video/mp4"}])
  for key, places in PLACES.items():
    clips = []
    for place, name in places:
      v = infos.get(name)
      if not v:
        print(f"  missing on Commons: {key} | {place} | {name}")
      elif v["sources"] and v["license"] and v["title"] not in REJECT:
        clips.append({"place": place, **{k: v[k] for k in (
            "title", "seconds", "license", "artist", "page", "sources")}})
    if not clips:
      continue
    # the first famous place is also the main video (Android plays only that)
    entry = dict(clips[0], editor_pick=False, desc="", from_places=True)
    entry.pop("place", None)
    entry["places"] = clips
    found[key] = entry
    print(f"{key:30} {len(clips)} famous places")


def main():
  if len(sys.argv) > 2 and sys.argv[1] == "--candidates":
    candidates(sys.argv[2:])
    return
  if sys.argv[1:] == ["--places"]:       # only the famous-places playlists
    with open(OUT, encoding="utf-8") as fh:
      found = json.load(fh)
    for entry in found.values():
      entry.pop("places", None)
    found = {k: v for k, v in found.items() if not v.get("from_places")}
    add_places(found)
    with open(OUT, "w", encoding="utf-8") as fh:
      json.dump(found, fh, ensure_ascii=False, indent=1, sort_keys=True)
    print(f"videos for {len(found)} pictures -> {OUT}")
    return
  items = [(cat, e[0]) for cat, entries in hub.CATALOG.items() if cat not in SKIP
           for e in entries]
  article = {(c, n): ARTICLE.get(hub.item_key(c, n), n) for c, n in items}
  print("looking up", len(items), "pictures on Wikipedia / Wikidata ...")
  ids = wikidata_ids(article.values())
  media = wikidata_media(v for v in ids.values())

  found, review = {}, []
  for cat, name in items:
    key = hub.item_key(cat, name)
    qid = ids.get(article[(cat, name)])
    chosen, category = media.get(qid, ([], None))
    files = list(chosen)
    if category:
      files += [f for f in category_videos(category) if f not in files]
    if key in PINNED:                    # picked by a person: that file only
      files = [PINNED[key]]
    infos = video_info(files[:30]) if files else {}
    pick = next((infos[f] for f in files if suitable(infos.get(f))), None)
    if pick:
      pick = {k: pick[k] for k in ("title", "desc", "seconds", "license", "artist",
                                   "page", "sources")}
      pick["editor_pick"] = pick["title"] in chosen
      found[key] = pick
    print(f"{key:30} {qid or '-':10} {(pick or {}).get('title', '-')[5:80]}")
    review.append(f"{key:30} {'-' if not pick else pick['title'][5:95]}"
                  + (f"  [{pick['seconds']:.0f}s, {pick['license']}"
                     f"{', editors pick' if pick['editor_pick'] else ''}]  {pick['desc'][:90]}"
                     if pick else ""))
  # Ship only what a person approved, and only the very file they checked
  approved_path = os.path.join(HERE, APPROVED_FILES)
  try:
    with open(approved_path, encoding="utf-8") as fh:
      approved_files = json.load(fh)
  except (OSError, ValueError):
    approved_files = {}
  for key in APPROVED:
    if key in PINNED:
      approved_files[key] = PINNED[key]               # the file a person chose
    elif key in found and key not in approved_files:
      approved_files[key] = found[key]["title"]      # first approval: record the file
  with open(approved_path, "w", encoding="utf-8") as fh:
    json.dump(approved_files, fh, ensure_ascii=False, indent=1, sort_keys=True)
  found = {k: v for k, v in found.items()
           if k in APPROVED and approved_files.get(k) == v["title"]}
  add_places(found)
  with open(OUT, "w", encoding="utf-8") as fh:
    json.dump(found, fh, ensure_ascii=False, indent=1, sort_keys=True)
  with open(REVIEW, "w", encoding="utf-8") as fh:
    fh.write("\n".join(review) + "\n")
  print(f"videos for {len(found)} of {len(items)} pictures -> {OUT}")


if __name__ == "__main__":
  main()
