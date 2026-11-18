"""Builds games/saiqulmodi-domino-wonder-dash/ for stratos-games-site from docs/.

Same method as the other Stratos boxes: the pygbag engine is bundled inside the
box (main.wasm/main.data gzip-compressed, unpacked in the browser), so nothing
is loaded from other sites. Run tools/build_web.py first.

Run:  python tools/make_stratos_box.py [box folder]
"""
import gzip, os, re, shutil, sys, urllib.request

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(PROJECT, "docs")
APP = "dominowonderdash"
BOX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.expanduser("~"), "OneDrive", "Desktop", "stratos-games-site", "games",
    "saiqulmodi-domino-wonder-dash")
CDN = "https://pygame-web.github.io/cdn/"
CACHE = os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")),
                     "DominoGame", "engine_cache")
os.makedirs(CACHE, exist_ok=True)

ENGINE = [
    "0.9.3/pythons.js", "0.9.3/cpythonrc.py", "0.9.3/empty.html",
    "0.9.3/empty.ogg",   # silent clip that unlocks audio; missing = stuck on "Ready to start"
    "0.9.3/cpython312/main.js", "0.9.3/cpython312/main.wasm", "0.9.3/cpython312/main.data",
    "index-0.9.3-cp312.json", "vtx.js", "vt.js", "vt/xterm.css", "vt/xterm.js",
    "vt/xterm-addon-image.js",
    # `import pygame` installs this wheel from PYGPI (= cdn/ in the box)
    "cp312/pygame_ce-2.5.7-cp312-cp312-wasm32_bi_emscripten.whl",
]


def fetch(rel):
  local = os.path.join(CACHE, rel.replace("/", "__"))
  if not os.path.exists(local):
    with urllib.request.urlopen(CDN + rel, timeout=120) as r, open(local + ".part", "wb") as f:
      shutil.copyfileobj(r, f)
    os.replace(local + ".part", local)
  return local


os.makedirs(BOX, exist_ok=True)
cdn_dir = os.path.join(BOX, "cdn")
for rel in ENGINE:
  src = fetch(rel)
  dst = os.path.join(cdn_dir, *rel.split("/"))
  os.makedirs(os.path.dirname(dst), exist_ok=True)
  if rel.endswith(("main.wasm", "main.data")):
    with open(src, "rb") as f, gzip.open(dst + ".gz", "wb", compresslevel=9) as g:
      g.write(f.read())
  elif rel.endswith("pythons.js"):
    js = open(src, encoding="utf-8").read()
    hook = ("    // Stratos box: engine files are bundled gzip-compressed; unpack them before starting the engine\n"
            "    if (window.__ssv_engine) {\n"
            "        const eng = await window.__ssv_engine\n"
            "        vm.wasmBinary = eng.wasm\n"
            "        vm.getPreloadedPackage = function () { return eng.data }\n"
            "    }\n"
            "    jsimport(config.executable)\n")
    assert js.count("    jsimport(config.executable)\n") == 1, "loader hook point changed"
    open(dst, "w", encoding="utf-8").write(js.replace("    jsimport(config.executable)\n", hook))
  elif rel.endswith("cpythonrc.py"):
    rc = open(src, encoding="utf-8").read()
    anchor = '    os.environ["APPDATA"] = home\n'
    assert rc.count(anchor) == 1, "cpythonrc hook point changed"
    rc = rc.replace(anchor, anchor +
                    "    # Stratos box: read the package index bundled next to this game, never the public CDN\n"
                    "    if not os.environ.get(\"PYGPI\", \"\"):\n"
                    "        os.environ[\"PYGPI\"] = \"cdn/\"\n")
    open(dst, "w", encoding="utf-8").write(rc)
  else:
    shutil.copyfile(src, dst)

# The page loads the .tar.gz everywhere except itch.io (which gets the .apk),
# so the box leaves the .apk out to stay under the 20 MB limit
for name in (f"{APP}.tar.gz", "favicon.png"):
  shutil.copyfile(os.path.join(DOCS, name), os.path.join(BOX, name))
if os.path.exists(os.path.join(BOX, f"{APP}.apk")):
  os.remove(os.path.join(BOX, f"{APP}.apk"))
# the 3D Wonder Town (three.js, vendored: no outside scripts) is the front door: box/town/
shutil.rmtree(os.path.join(BOX, "town"), ignore_errors=True)
shutil.copytree(os.path.join(DOCS, "town"), os.path.join(BOX, "town"))

html = open(os.path.join(DOCS, "index.html"), encoding="utf-8").read()
html = html.replace('<script src="https://pygame-web.github.io/cdn/0.9.3//browserfs.min.js"></script>', "")
html = html.replace("https://pygame-web.github.io/cdn/0.9.3/", "cdn/0.9.3/")
assert html.count('cdn : "cdn/0.9.3/",') == 1, "config.cdn line changed"
html = html.replace('cdn : "cdn/0.9.3/",', 'cdn : new URL("cdn/0.9.3/", document.baseURI).href,')
unpack = """<script>
// Stratos box: fetch the bundled engine (gzip) and unpack it in the browser while the page loads
window.__ssv_engine = (async function () {
    async function gunzip(url) {
        const r = await fetch(url);
        if (!r.ok) throw new Error(url + " " + r.status);
        const buf = await r.arrayBuffer();
        const b = new Uint8Array(buf, 0, 2);
        if (b[0] !== 0x1f || b[1] !== 0x8b) return buf;      // the web host already unpacked it
        return await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    }
    const [wasm, data] = await Promise.all([gunzip("cdn/0.9.3/cpython312/main.wasm.gz"), gunzip("cdn/0.9.3/cpython312/main.data.gz")]);
    return { wasm: wasm, data: data };
})();
</script>
"""
html = html.replace("<head>", "<head>\n" + unpack, 1)
leftover = re.findall(r"https?://(?!www\.w3\.org)[^\s\"'<>)]+", html)
open(os.path.join(BOX, "index.html"), "w", encoding="utf-8").write(html)

total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(BOX) for f in fs)
print("remaining external URLs in index.html:", leftover)
print(f"box size: {total / 1024 / 1024:.2f} MB")
