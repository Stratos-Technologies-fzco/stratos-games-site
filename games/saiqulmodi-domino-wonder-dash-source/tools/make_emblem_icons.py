"""The game's emblem and app icons (no words): what Domino Game is about - a child traces an outline,
dominoes stand on it, they topple, and the picture comes alive.

Picture: a sunny sky over Wonder Town's palm island; a crayon has drawn a big star; rainbow dominoes stand
across the line all the way round, the first ones already toppling in a wave; where they have fallen
the star lights up in colour. A white rim like a sticker.

Writes tools/emblem.svg and renders it with headless Chrome (sharp at every size) into icons/:
icon-512, icon-192, icon-180 (Apple), icon-48 (favicon source), icon-maskable-512 (sky full bleed, 80 %).
Superseded on 01-Nov-2026 by tools/make_ring_icons.py (the 3D domino ring the user chose); running this
script would put the star icons back.
Run:  python tools/make_emblem_icons.py
"""

import math
import os
import subprocess
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons")
RAINBOW = ["#ff3b3b", "#ff8a1e", "#ffd21e", "#3ccf4e", "#1fb5ff", "#4f6bff", "#b44dff"]


def star_points(cx, cy, r_out, r_in, n=5, rot=-90):
  pts = []
  for i in range(n * 2):
    r = r_out if i % 2 == 0 else r_in
    a = math.radians(rot + i * 180 / n)
    pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
  return pts


def along(pts, step):
  """points every `step` px round the closed outline, with the direction there"""
  out = []
  segs = list(zip(pts, pts[1:] + pts[:1]))
  carry = 0.0
  for (x0, y0), (x1, y1) in segs:
    L = math.hypot(x1 - x0, y1 - y0)
    ang = math.degrees(math.atan2(y1 - y0, x1 - x0))
    d = carry
    while d < L:
      t = d / L
      out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, ang))
      d += step
    carry = d - L
  return out


def emblem_svg():
  cx, cy = 256, 262
  star = star_points(cx, cy, 156, 70)
  star_d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in star) + " Z"
  spots = along(star, 21)
  n = len(spots)
  fallen = int(n * 0.42)  # the wave has toppled this many so far
  dominoes = []
  for i, (x, y, ang) in enumerate(spots):
    col = RAINBOW[i % len(RAINBOW)]
    if i < fallen:
      # toppled: lying flat along the line (long side along the path), a little shadow
      dominoes.append(
        f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang:.1f})">'
        f'<rect x="-11" y="-6.5" width="22" height="13" rx="3" fill="#000" opacity="0.18" transform="translate(2 3)"/>'
        f'<rect x="-11" y="-6.5" width="22" height="13" rx="3" fill="{col}" stroke="#ffffff" stroke-width="1.6"/>'
        f'<path d="M0 -5 V5" stroke="#ffffff" stroke-width="1.4"/>'
        f'<circle cx="-5.5" cy="0" r="1.9" fill="#fff"/><circle cx="5.5" cy="-2.5" r="1.6" fill="#fff"/><circle cx="5.5" cy="2.5" r="1.6" fill="#fff"/></g>')
    elif i < fallen + 3:
      # the wave front: falling, tipped over
      tip = [62, 38, 16][i - fallen]
      dominoes.append(
        f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang + 90:.1f}) skewX({tip})">'
        f'<rect x="-5" y="-14" width="10" height="28" rx="2.6" fill="{col}" stroke="#ffffff" stroke-width="1.6"/>'
        f'<circle cx="0" cy="-7" r="1.8" fill="#fff"/><circle cx="0" cy="7" r="1.8" fill="#fff"/></g>')
    else:
      # standing across the line: seen from above-front, a tall tile with a lit top
      dominoes.append(
        f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang + 90:.1f})">'
        f'<rect x="-5" y="-14" width="10" height="28" rx="2.6" fill="{col}" stroke="#ffffff" stroke-width="1.6"/>'
        f'<rect x="-5" y="-14" width="10" height="5" rx="2" fill="#ffffff" opacity="0.45"/>'
        f'<circle cx="0" cy="-5" r="1.7" fill="#fff"/><circle cx="0" cy="6" r="1.7" fill="#fff"/></g>')
  # the coloured-in part: a wedge of the star from its top round to the wave front
  fx, fy, _ = spots[fallen]
  return f"""<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5cc8ff"/><stop offset="70%" stop-color="#a8e6ff"/><stop offset="100%" stop-color="#fff1c8"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbe0"/><stop offset="45%" stop-color="#ffe066"/><stop offset="100%" stop-color="#ffc21e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#29b6e8"/><stop offset="100%" stop-color="#0a7fc0"/>
    </linearGradient>
    <linearGradient id="fill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe45c"/><stop offset="50%" stop-color="#ffb02e"/><stop offset="100%" stop-color="#ff6fa8"/>
    </linearGradient>
    <linearGradient id="crayon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d81b60"/><stop offset="50%" stop-color="#ff4f8b"/><stop offset="100%" stop-color="#b0124a"/>
    </linearGradient>
    <clipPath id="badge"><circle cx="256" cy="256" r="226"/></clipPath>
    <clipPath id="lit"><path d="M{cx} {cy} L{star[0][0]:.1f} {star[0][1]:.1f} L{star[1][0]:.1f} {star[1][1]:.1f} L{star[2][0]:.1f} {star[2][1]:.1f} L{star[3][0]:.1f} {star[3][1]:.1f} L{fx:.1f} {fy:.1f} Z"/></clipPath>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0b3a66" flood-opacity="0.35"/></filter>
  </defs>
  <circle cx="256" cy="256" r="246" fill="#ffffff"/>
  <g clip-path="url(#badge)">
    <rect width="512" height="512" fill="url(#sky)"/>
    <circle cx="398" cy="104" r="78" fill="url(#sun)"/>
    <circle cx="398" cy="104" r="30" fill="#fff4b0"/>
    <g fill="#ffffff" opacity="0.9"><ellipse cx="120" cy="96" rx="40" ry="16"/><ellipse cx="146" cy="86" rx="26" ry="16"/><ellipse cx="96" cy="90" rx="20" ry="12"/></g>
    <rect y="414" width="512" height="98" fill="url(#sea)"/>
    <path d="M0 432 Q 64 424 128 432 T 256 432 T 384 432 T 512 432" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
    <!-- Wonder Town's palm island -->
    <ellipse cx="420" cy="420" rx="70" ry="12" fill="#ffe08a"/>
    <path d="M424 418 C 420 390 428 372 436 356" fill="none" stroke="#8a5a2b" stroke-width="6" stroke-linecap="round"/>
    <g fill="#2fbf4a"><path d="M436 356 C 410 344 392 352 384 362 C 404 356 420 358 436 356 Z"/><path d="M436 356 C 452 338 474 338 486 348 C 466 348 450 352 436 356 Z"/><path d="M436 356 C 428 336 432 320 444 312 C 440 330 440 342 436 356 Z"/><path d="M436 356 C 456 356 472 368 476 380 C 460 370 448 364 436 356 Z"/></g>
    <ellipse cx="86" cy="424" rx="50" ry="9" fill="#ffe08a"/>
  </g>
  <!-- the star: lit up where the dominoes have fallen, a crayon line all round -->
  <path d="{star_d}" fill="#ffffff" opacity="0.55"/>
  <g clip-path="url(#lit)"><path d="{star_d}" fill="url(#fill)" filter="url(#glow)"/></g>
  <path d="{star_d}" fill="none" stroke="#ffffff" stroke-width="10" stroke-linejoin="round" opacity="0.9"/>
  <path d="{star_d}" fill="none" stroke="#7a4dff" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round"/>
  <g filter="url(#drop)">{''.join(dominoes)}</g>
  <!-- a happy face where the picture comes alive -->
  <g transform="translate({cx} {cy + 10})"><circle cx="-18" cy="-10" r="6" fill="#3a2a5c"/><circle cx="18" cy="-10" r="6" fill="#3a2a5c"/>
    <circle cx="-16" cy="-12" r="2" fill="#fff"/><circle cx="20" cy="-12" r="2" fill="#fff"/>
    <path d="M-18 8 Q 0 26 18 8" fill="none" stroke="#3a2a5c" stroke-width="5" stroke-linecap="round"/>
    <circle cx="-32" cy="6" r="7" fill="#ff7aa8" opacity="0.6"/><circle cx="32" cy="6" r="7" fill="#ff7aa8" opacity="0.6"/></g>
  <!-- the crayon, still drawing the line -->
  <g transform="translate(118 330) rotate(-38)" filter="url(#drop)">
    <rect x="-14" y="0" width="28" height="104" rx="5" fill="url(#crayon)"/>
    <rect x="-14" y="20" width="28" height="10" fill="#ffffff" opacity="0.55"/><rect x="-14" y="74" width="28" height="10" fill="#ffffff" opacity="0.55"/>
    <path d="M-14 0 L0 -30 L14 0 Z" fill="#ffd2a0"/><path d="M-5 -19 L0 -30 L5 -19 Z" fill="#d81b60"/>
  </g>
  <circle cx="256" cy="256" r="236" fill="none" stroke="#ffffff" stroke-width="20"/>
  <circle cx="256" cy="256" r="226" fill="none" stroke="#ffd21e" stroke-width="4"/>
  <circle cx="256" cy="256" r="247" fill="none" stroke="#1f6fd1" stroke-width="3"/>
</svg>"""


def chrome_path():
  for p in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"):
    if os.path.exists(p):
      return p
  raise SystemExit("Chrome / Edge not found")


def render(svg, name, size, scale, background, chrome, tmp):
  inner = round(size * scale)
  html = (f"<!doctype html><html><head><style>html,body{{margin:0;width:{size}px;height:{size}px;overflow:hidden;"
          f"background:{background};}}body{{display:flex;align-items:center;justify-content:center;}}"
          f"svg{{width:{inner}px;height:{inner}px;display:block;}}</style></head><body>{svg}</body></html>")
  page = os.path.join(tmp, name + ".html")
  with open(page, "w", encoding="utf-8") as f:
    f.write(html)
  target = os.path.join(OUT, name + ".png")
  before = os.path.getmtime(target) if os.path.exists(target) else 0
  # --screenshot makes headless Chrome render once and exit by itself; a private profile folder per run.
  # Chrome's launcher returns at once and hands off to another process: wait until the file is written.
  subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                  f"--user-data-dir={os.path.join(tmp, 'profile-' + name)}",
                  "--default-background-color=00000000", f"--window-size={size},{size}", f"--screenshot={target}",
                  "file:///" + page.replace("\\", "/")], check=True, timeout=120,
                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
  for _ in range(120):
    if os.path.exists(target) and os.path.getmtime(target) > before and os.path.getsize(target) > 0:
      time.sleep(0.5)
      print("wrote", target)
      return
    time.sleep(0.25)
  raise SystemExit("timed out waiting for " + target)


def main():
  svg = emblem_svg()
  with open(os.path.join(ROOT, "tools", "emblem.svg"), "w", encoding="utf-8") as f:
    f.write(svg)
  chrome = chrome_path()
  sky = "linear-gradient(180deg, #5cc8ff 0%, #a8e6ff 70%, #fff1c8 100%)"
  tmp = os.path.join(ROOT, "tools", ".emblem_tmp")  # kept: Chrome reads the page after the launcher returns
  os.makedirs(tmp, exist_ok=True)
  render(svg, "icon-512", 512, 1, "transparent", chrome, tmp)
  render(svg, "icon-192", 192, 1, "transparent", chrome, tmp)
  render(svg, "icon-48", 48, 1, "transparent", chrome, tmp)
  render(svg, "icon-180", 180, 0.92, sky, chrome, tmp)
  render(svg, "icon-maskable-512", 512, 0.8, sky, chrome, tmp)


if __name__ == "__main__":
  main()
