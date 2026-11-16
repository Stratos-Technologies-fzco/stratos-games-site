#!/usr/bin/env python3
"""make_clip.py: record a game's hover clip: 6 seconds of real play, silent, 480 x 300 (#71).

Usage:
  python3 tools/make_clip.py <your-folder> --steps "click:PLAY; wait:1500; mark; hold:ArrowUp:6000"

The steps get from the game's first screen into real play, then play for a few seconds. They run in order on an
800 x 500 screen (the tile's shape), separated by ";":
  click:<text>                      click the button or link with this text (case does not matter)
  tap:<x>,<y>                       click this point
  drag:<x1>,<y1>,<x2>,<y2>          drag the mouse from one point to another (drawing, swiping)
  key:<Key>                         press a key once (ArrowUp, Space, Enter, a, ...)
  hold:<Key>:<ms>                   hold a key down for that long
  taps:<Key>:<every ms>:<for ms>    press a key again and again
  wait:<ms>                         wait
  mark                              the clip starts here: put it where the real play begins
Without "mark" the clip starts after the last step.

Writes games/<your-folder>/preview.mp4 and a sheet of frames to look at. Show only real play: no menus, no
loading screens, no "game over". Needs Playwright (pip install playwright; playwright install chromium) and
ffmpeg (Mac: brew install ffmpeg, Windows: winget install ffmpeg).
"""
import argparse, functools, http.server, os, re, shutil, subprocess, sys, tempfile, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, SECONDS = 800, 500, 6


def serve():
    """The repo over a local web server, so the game loads exactly as on the site."""
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def run_step(page, step, t0, state):
    name, _, arg = step.partition(":")
    name = name.strip().lower(); arg = arg.strip()
    if name == "mark":
        state["mark"] = time.time() - t0
    elif name == "click":
        exact = re.compile(r"^\s*" + re.escape(arg) + r"\s*$", re.I)
        for loc in (page.get_by_role("button", name=exact), page.get_by_role("link", name=exact), page.get_by_text(exact)):
            if loc.count():
                loc.first.click(force=True, timeout=5000); return
        raise SystemExit(f'make_clip: nothing on the screen says "{arg}" (step: {step})')
    elif name == "tap":
        x, y = (float(v) for v in arg.split(",")); page.mouse.click(x, y)
    elif name == "drag":
        x1, y1, x2, y2 = (float(v) for v in arg.split(","))
        page.mouse.move(x1, y1); page.mouse.down(); page.mouse.move(x2, y2, steps=30); page.mouse.up()
    elif name == "key":
        page.keyboard.press(arg)
    elif name == "hold":
        key, ms = arg.rsplit(":", 1); page.keyboard.down(key); page.wait_for_timeout(float(ms)); page.keyboard.up(key)
    elif name == "taps":
        key, every, total = arg.split(":"); end = time.time() + float(total) / 1000
        while time.time() < end:
            page.keyboard.press(key); page.wait_for_timeout(float(every))
    elif name == "wait":
        page.wait_for_timeout(float(arg))
    elif name:
        raise SystemExit(f"make_clip: unknown step '{step}' (see python3 tools/make_clip.py --help)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", help="your game folder under games/, for example sksarfarajali-moto-rush")
    ap.add_argument("--steps", default="", help='for example "click:PLAY; wait:1500; mark; hold:ArrowUp:6000"')
    a = ap.parse_args()
    folder = a.folder.strip("/").split("/")[-1]
    if not os.path.isfile(os.path.join(ROOT, "games", folder, "index.html")):
        raise SystemExit(f"make_clip: games/{folder}/index.html not found")
    if not shutil.which("ffmpeg"):
        raise SystemExit("make_clip: ffmpeg is missing. Mac: brew install ffmpeg   Windows: winget install ffmpeg")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("make_clip: Playwright is missing. Run: pip install playwright && playwright install chromium")

    tmp = tempfile.mkdtemp(prefix="stratos-clip-"); port = serve(); state = {}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required", "--mute-audio"])
        ctx = browser.new_context(viewport={"width": W, "height": H}, record_video_dir=tmp, record_video_size={"width": W, "height": H})
        page = ctx.new_page(); t0 = time.time()
        page.goto(f"http://127.0.0.1:{port}/games/{folder}/index.html", wait_until="load")
        page.wait_for_timeout(2500)
        for step in (s.strip() for s in a.steps.split(";")):
            run_step(page, step, t0, state)
        mark = state.get("mark", time.time() - t0)
        left = SECONDS + 0.5 - (time.time() - t0 - mark)
        if left > 0: page.wait_for_timeout(left * 1000)
        video = page.video.path(); ctx.close(); browser.close()

    out = os.path.join(ROOT, "games", folder, "preview.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{mark:.2f}", "-i", video, "-t", str(SECONDS),
                    "-vf", f"fps=10,scale=480:300:flags=lanczos,format=yuv420p", "-an", "-c:v", "libx264", "-preset", "slow",
                    "-crf", "30", "-movflags", "+faststart", out], check=True)
    sheet = os.path.join(tmp, "preview-frames.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", "fps=2,scale=240:-1,tile=6x2:padding=2:color=white",
                    "-frames:v", "1", sheet], check=True)
    print(f"clip: games/{folder}/preview.mp4 ({os.path.getsize(out) // 1024} KB, {SECONDS} s, 480 x 300, silent)")
    print(f"look at it before you publish (2 frames a second): {sheet}")
    print("It should show real play only. If it shows a menu or a loading screen, move 'mark' later and run again.")


if __name__ == "__main__":
    main()
