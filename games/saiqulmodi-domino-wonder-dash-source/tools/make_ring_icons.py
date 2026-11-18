"""App icons from the 3D domino ring (user, 01-Nov-2026: "let domino which shows all colour to domino effect is the
miniature logo ... kid liking, no write up").

Photographs town_web/index.html?logo (the real three.js ring with the smiling domino, on a clear background) with
headless Chrome at each size, then puts it on a sunny sky disc so it reads on any home screen:
icons/icon-512, icon-192, icon-180 (Apple), icon-48 (favicon source), icon-maskable-512 (sky full bleed).
A tiny local web server (a free port, stopped at the end) serves the page, because ES modules do not load from file://.
Run:  python tools/make_ring_icons.py
"""

import os
import socket
import subprocess
import sys
import time

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons")
WORK = os.path.join(ROOT, "tools", ".emblem_tmp")


def free_port():
  with socket.socket() as s:
    s.bind(("127.0.0.1", 0))
    return s.getsockname()[1]


def chrome_path():
  for p in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"):
    if os.path.exists(p):
      return p
  raise SystemExit("Chrome / Edge not found")


def shoot(chrome, url, size, target):
  """Headless Chrome over the DevTools protocol (its launcher hands off to another process, so
  --screenshot alone can fire before WebGL draws): open the page, wait for document.title == 'ready'
  (set by town.js in ?logo mode), capture the frame with a clear background, then close that Chrome."""
  import base64
  import json
  import urllib.request
  import websocket
  port = free_port()
  profile = os.path.join(WORK, f"ring-profile-{port}")
  proc = subprocess.Popen([chrome, "--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                           "--hide-scrollbars", "--force-device-scale-factor=1", f"--remote-debugging-port={port}",
                           f"--user-data-dir={profile}", f"--window-size={size},{size}", "about:blank"],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
  try:
    ws_url = None
    for _ in range(80):
      try:
        tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=2))
        ws_url = next(t["webSocketDebuggerUrl"] for t in tabs if t.get("type") == "page")
        break
      except Exception:
        time.sleep(0.25)
    if not ws_url:
      raise SystemExit("headless Chrome did not start")
    ws = websocket.create_connection(ws_url, timeout=60)
    n = [0]
    def call(method, **params):
      n[0] += 1
      ws.send(json.dumps({"id": n[0], "method": method, "params": params}))
      while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == n[0]:
          return msg.get("result", {})
    call("Emulation.setDefaultBackgroundColorOverride", color={"r": 0, "g": 0, "b": 0, "a": 0})
    call("Emulation.setDeviceMetricsOverride", width=size, height=size, deviceScaleFactor=1, mobile=False)
    call("Page.navigate", url=url)
    for _ in range(120):
      r = call("Runtime.evaluate", expression="document.title")
      if r.get("result", {}).get("value") == "ready":
        break
      time.sleep(0.5)
    else:
      raise SystemExit("the logo page never got ready")
    time.sleep(0.5)
    shot = call("Page.captureScreenshot", format="png")
    with open(target, "wb") as fh:
      fh.write(base64.b64decode(shot["data"]))
    ws.close()
  finally:
    proc.terminate()                       # the launcher we started ...
    subprocess.run(["powershell", "-NoProfile", "-Command",  # ... and every Chrome process using this profile
                    f"Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object {{ $_.CommandLine -like '*{os.path.basename(profile)}*' }} | ForEach-Object {{ Stop-Process -Id $_.ProcessId -Force }}"],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def sky_disc(size, full_bleed):
  img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
  grad = Image.new("RGBA", (size, size))
  d = ImageDraw.Draw(grad)
  top, low = (92, 200, 255), (255, 241, 200)
  for y in range(size):
    t = y / (size - 1)
    d.line([(0, y), (size, y)], fill=tuple(int(top[i] + (low[i] - top[i]) * t) for i in range(3)) + (255,))
  if full_bleed:
    return grad
  mask = Image.new("L", (size, size), 0)
  ImageDraw.Draw(mask).ellipse([size * 0.02, size * 0.02, size * 0.98, size * 0.98], fill=255)
  img.paste(grad, (0, 0), mask)
  ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
  ImageDraw.Draw(ring).ellipse([size * 0.02, size * 0.02, size * 0.98, size * 0.98], outline=(255, 255, 255, 255), width=max(2, size // 40))
  return Image.alpha_composite(img, ring)


def main():
  os.makedirs(WORK, exist_ok=True)
  port = free_port()
  server = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=ROOT,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
  try:
    time.sleep(1.0)
    chrome = chrome_path()
    shot = os.path.join(WORK, "ring-1024.png")
    shoot(chrome, f"http://127.0.0.1:{port}/town_web/index.html?logo", 1024, shot)
  finally:
    server.terminate()                     # only the server this script started
    server.wait(timeout=10)
  ring = Image.open(shot).convert("RGBA")
  bbox = ring.getbbox()
  if not bbox:
    raise SystemExit("the ring photo is empty (WebGL not available in headless Chrome?)")
  ring = ring.crop(bbox)
  for name, size, scale, bleed in (("icon-512", 512, 0.86, False), ("icon-192", 192, 0.86, False), ("icon-48", 48, 0.9, False),
                                   ("icon-180", 180, 0.84, True), ("icon-maskable-512", 512, 0.7, True)):
    base = sky_disc(size, bleed)
    w = int(size * scale)
    h = int(ring.height * w / ring.width)
    if h > size * scale:
      h = int(size * scale)
      w = int(ring.width * h / ring.height)
    r = ring.resize((w, h), Image.LANCZOS)
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh = Image.new("RGBA", r.size, (20, 40, 90, 110))
    shadow.paste(sh, ((size - w) // 2 + size // 60, (size - h) // 2 + size // 40), r)
    base = Image.alpha_composite(base, shadow.filter(ImageFilter.GaussianBlur(max(1, size // 80))))
    base.paste(r, ((size - w) // 2, (size - h) // 2), r)
    base.save(os.path.join(OUT, name + ".png"))
    print("wrote", os.path.join(OUT, name + ".png"))


if __name__ == "__main__":
  main()
