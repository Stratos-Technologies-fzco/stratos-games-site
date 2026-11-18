"""Real-life video of the picture ("Watch real"), then back to play.

The videos are free Wikimedia Commons files listed in videos.json (made and
checked with tools/find_videos.py). They stream from upload.wikimedia.org:
no adverts, no "recommended next" list. Indian states and union territories
play a list of their famous places (one button per place).

  Browser (pygbag): a player opens over the game with a big "Back to play"
                    button; the game notices when it is closed.
  Computer:         the same player page opens in the web browser (pygame
                    cannot show video); coming back to the game window counts
                    as "back to play".
  Android:          the phone's own video player opens.
"""

import base64
import html
import json
import os
import sys
import tempfile
import time
import webbrowser

IS_WEB = sys.platform == "emscripten"
IS_ANDROID = "ANDROID_ARGUMENT" in os.environ or hasattr(sys, "getandroidapilevel")

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} - Domino Game</title>
<style>{css}</style></head><body>{body}
<script>
document.getElementById('dwd-back').onclick=function(){{window.close();
 document.getElementById('dwd-bye').style.display='block';}};
{script}
</script></body></html>"""

CSS = """
#dwd-video{position:fixed;inset:0;z-index:2147483647;background:#0d0d1a;
 display:flex;flex-direction:column;align-items:center;justify-content:center;
 font-family:Arial,sans-serif;color:#fff;gap:12px;padding:12px;box-sizing:border-box}
#dwd-video h1{margin:0;font-size:30px;color:#ffcc00;text-align:center}
#dwd-video video{width:100%;max-width:900px;max-height:62vh;border-radius:14px;
 background:#000;border:3px solid #ffcc00}
#dwd-video .credit{font-size:11px;color:#aab;text-align:center;max-width:900px}
#dwd-video .msg{display:none;font-size:18px;color:#ffcc00;text-align:center}
#dwd-video .row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
#dwd-video button{font-size:24px;font-weight:bold;border:3px solid #fff;
 border-radius:16px;padding:14px 26px;color:#fff;cursor:pointer}
#dwd-back{background:#3cb45a} #dwd-again{background:#4682e6;display:none}
#dwd-bye{display:none;font-size:18px;color:#ffcc00}
"""

BODY = """<div id="dwd-video">
<h1 id="dwd-head">{heading}</h1>
<video id="dwd-player" controls autoplay playsinline preload="auto">{sources}</video>
<div class="msg" id="dwd-msg">This video needs the internet. Try again later!</div>
<div class="row" id="dwd-places">{places}</div>
<div class="row"><button id="dwd-again">&#8635; Watch again</button>
<button id="dwd-back">&#9664; Back to play</button></div>
<div id="dwd-bye">Close this tab to go back to the game.</div>
<div class="credit" id="dwd-credit">{credit}</div></div>"""

# The real photo of a picture (photos.json), and a zoo's live camera link for some animals
PHOTO_CSS = """
#dwd-video img{max-width:100%;max-height:62vh;border-radius:14px;border:3px solid #ffcc00;
 background:#222;object-fit:contain}
#dwd-video a.live{font-size:20px;font-weight:bold;color:#0d0d1a;background:#ffcc00;
 border-radius:16px;padding:12px 22px;text-decoration:none}
"""

PHOTO_BODY = """<div id="dwd-video">
<h1 id="dwd-head">{heading}</h1>
<img id="dwd-photo" src="{src}" alt="{heading}"
 onerror="this.style.display='none';document.getElementById('dwd-msg').style.display='block'">
<div class="msg" id="dwd-msg">This photo needs the internet. Try again later!</div>
<div class="row">{live}<button id="dwd-back">&#9664; Back to play</button></div>
<div id="dwd-bye">Close this tab to go back to the game.</div>
<div class="credit" id="dwd-credit">{credit}</div></div>"""

# States and union territories: one button per famous place
PLACE_CSS = """
#dwd-video .place{font-size:17px;padding:8px 14px;border-radius:22px;
 background:#2b2b4a;border:2px solid #ffcc00;color:#ffcc00}
#dwd-video .place.on{background:#ffcc00;color:#0d0d1a}
"""

# Shared by both players: famous places one after another (each name is said
# as it starts), "watch again" after the last one, a message if offline
SCRIPT = """(function(){var v=document.getElementById('dwd-player');
 var again=document.getElementById('dwd-again');
 var list=window.dwdPlaylist||[];var at=0;
 function say(t){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);
   u.rate=0.9;speechSynthesis.speak(u);}catch(e){}}
 function start(){var p=v.play();if(p&&p.catch)p.catch(function(){v.muted=true;v.play();});}
 function show(i){if(!list.length)return;at=i;var c=list[i];
   document.getElementById('dwd-head').textContent=c.heading;
   document.getElementById('dwd-credit').textContent=c.credit;
   var b=document.querySelectorAll('#dwd-places .place');
   for(var k=0;k<b.length;k++)b[k].className='place'+(k==i?' on':'');
   v.innerHTML=c.sources;v.style.display='';
   document.getElementById('dwd-msg').style.display='none';hook();v.load();start();
   if(list.length>1)say(c.name);}
 function hook(){var srcs=v.getElementsByTagName('source');
   if(srcs.length)srcs[srcs.length-1].onerror=function(){
     if(at+1<list.length){show(at+1);return;}
     document.getElementById('dwd-msg').style.display='block';v.style.display='none';};}
 var b=document.querySelectorAll('#dwd-places .place');
 for(var k=0;k<b.length;k++)(function(i){b[i].onclick=function(){
   again.style.display='none';show(i);};})(k);
 v.onended=function(){if(at+1<list.length){show(at+1);}
   else{again.style.display='inline-block';}};
 again.onclick=function(){again.style.display='none';
   if(list.length>1){show(0);}else{v.currentTime=0;start();}};
 hook();if(list.length>1)say(list[0].name);start();})();"""


def _sources(clip):
  # WebM first (Chrome, Firefox, Android), MP4 for iPhone / iPad
  ordered = sorted(clip.get("sources", []), key=lambda s: s["type"] != "video/webm")
  return "".join(f'<source src="{html.escape(s["src"])}" type="{s["type"]}">'
                 for s in ordered)


def _credit(clip):
  licence = clip.get("license", "")
  # a few clips are Pexels / Pixabay copies on the game's own site
  site = "" if licence.startswith(("Pexels", "Pixabay")) else "Wikimedia Commons"
  return " - ".join(x for x in (
      "Video: " + (clip.get("artist") or site), licence, site) if x)


def playlist(video, title):
  """The clips to play: a state's famous places, or the one video."""
  clips = [c for c in video.get("places") or [] if c.get("sources")] or [video]
  return [{"name": c.get("place", title),
           "heading": f"{title}: {c['place']}" if c.get("place") else f"The real {title}!",
           "sources": _sources(c), "credit": _credit(c)} for c in clips]


def _parts(video, title):
  clips = playlist(video, title)
  places = ""
  if len(clips) > 1:
    places = "".join(f'<button class="place{" on" if i == 0 else ""}">{html.escape(c["name"])}</button>'
                     for i, c in enumerate(clips))
  body = BODY.format(heading=html.escape(clips[0]["heading"]), sources=clips[0]["sources"],
                     places=places, credit=html.escape(clips[0]["credit"]))
  return body, "window.dwdPlaylist=" + json.dumps(clips) + ";"


class VideoPlayer:
  def __init__(self):
    self.open = False
    self.left_game = False
    self.opened_at = 0.0

  def show(self, video, title):
    """Starts the video. Returns False if this device cannot play it."""
    if not video or not video.get("sources"):
      return False
    try:
      if IS_WEB:
        self._show_web(video, title)
      elif IS_ANDROID:
        self._show_android(video, title)
      else:
        self._show_desktop(video, title)
    except Exception as exc:
      print("video:", exc)
      return False
    self.open = True
    self.left_game = False
    self.opened_at = time.time()
    return True

  def show_photo(self, photo, title):
    """The real photo, with a live camera link when there is one. False if it cannot open."""
    if not photo:
      return False
    live = photo.get("live")
    link = (f'<a class="live" href="{html.escape(live["url"])}" target="_blank" rel="noopener">'
            f'&#128249; {html.escape(live["label"])}</a>' if live else "")
    credit = " - ".join(x for x in ("Photo: " + (photo.get("artist") or "Wikimedia Commons"),
                                    photo.get("license", ""), "Wikimedia Commons") if x)
    body = PHOTO_BODY.format(heading=html.escape(f"The real {title}!"),
                             src=html.escape(photo.get("src", "")), live=link,
                             credit=html.escape(credit) if photo.get("src") else "")
    if not photo.get("src"):            # live camera only
      body = body.replace('<img id="dwd-photo"', '<img hidden id="dwd-photo"')
    try:
      if IS_WEB:
        self._show_web_body(body, "")
      elif IS_ANDROID:
        self._open_android(photo.get("page") or (live or {}).get("url"))
      else:
        self._show_desktop_body(body, "", title)
    except Exception as exc:
      print("photo:", exc)
      return False
    self.open = True
    self.left_game = False
    self.opened_at = time.time()
    return True

  def closed(self):
    """Browser: True once the child pressed "Back to play" (checked each frame)."""
    if not (self.open and IS_WEB):
      return False
    try:
      import platform
      done = str(platform.window.eval("window.dwdVideoClosed ? 'yes' : 'no'")) == "yes"
    except Exception:
      done = True
    if done:
      self.open = False
    return done

  def focus_lost(self):
    if self.open and not IS_WEB:
      self.left_game = True

  def returned(self):
    """Computer/Android: the game window got focus back after the video."""
    if self.open and not IS_WEB and self.left_game:
      self.open = False
      return True
    return False

  # ------------------------------------------------------------ per platform
  def _show_web(self, video, title):
    body, clips = _parts(video, title)
    self._show_web_body(body, clips + SCRIPT)

  def _show_web_body(self, body, script):
    import platform
    js = ("(function(){var old=document.getElementById('dwd-video');if(old)old.remove();"
          "try{speechSynthesis.cancel();}catch(e){}"
          "window.dwdVideoClosed=0;var d=document.createElement('div');"
          "d.innerHTML=" + json.dumps(body) + ";document.body.appendChild(d.firstChild);"
          "if(!document.getElementById('dwd-style')){var s=document.createElement('style');"
          "s.id='dwd-style';s.textContent=" + json.dumps(CSS + PLACE_CSS + PHOTO_CSS)
          + ";document.head.appendChild(s);}"
          "document.getElementById('dwd-back').onclick=function(){"
          "var v=document.getElementById('dwd-player');if(v)v.pause();"
          "try{speechSynthesis.cancel();}catch(e){}"
          "document.getElementById('dwd-video').remove();window.dwdVideoClosed=1;"
          "var c=document.getElementById('canvas');if(c&&c.focus)c.focus();};"
          + script + "})()")
    platform.window.eval(js)

  def _show_desktop(self, video, title):
    body, clips = _parts(video, title)
    self._show_desktop_body(body, clips + SCRIPT, title)

  def _show_desktop_body(self, body, script, title):
    page = PAGE.format(title=html.escape(title), css=CSS + PLACE_CSS + PHOTO_CSS, body=body,
                       script=script)
    path = os.path.join(tempfile.gettempdir(), "domino_wonder_dash_video.html")
    with open(path, "w", encoding="utf-8") as fh:
      fh.write(page)
    webbrowser.open("file:///" + path.replace("\\", "/"))

  def _show_android(self, video, title):
    """The game's own player page (play.html on the game's website) in Chrome:
    it plays at once, shows every famous place of a state, and the phone's
    Back button returns to the game. (Opening the video file itself made
    Chrome download it and the phone ask "Open with...".)"""
    from jnius import autoclass, cast
    Intent = autoclass("android.content.Intent")
    Uri = autoclass("android.net.Uri")
    activity = autoclass("org.kivy.android.PythonActivity").mActivity
    act = cast("android.app.Activity", activity)
    intent = Intent(Intent.ACTION_VIEW, Uri.parse(player_url(video, title)))
    try:
      intent.setPackage("com.android.chrome")
      act.startActivity(intent)
    except Exception:                        # no Chrome: any browser
      act.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(player_url(video, title))))


  def _open_android(self, url):
    """A web page (the photo's Commons page or a live camera) in the phone's browser."""
    from jnius import autoclass, cast
    Intent = autoclass("android.content.Intent")
    Uri = autoclass("android.net.Uri")
    act = cast("android.app.Activity", autoclass("org.kivy.android.PythonActivity").mActivity)
    act.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))


# The player page on the game's website (written by tools/build_web.py). The
# clips travel in the address after "#", so nothing is sent to any server.
PLAYER_URL = "https://saiqulmodi.github.io/DominoGame/play.html"


def player_url(video, title):
  data = json.dumps({"title": title, "clips": playlist(video, title)}, separators=(",", ":"))
  return PLAYER_URL + "#" + base64.urlsafe_b64encode(data.encode("utf-8")).decode("ascii")


def player_page():
  """docs/play.html: the same player as the web game, filled in from the address."""
  body = BODY.format(heading="", sources="", places="", credit="")
  loader = """(function(){try{var h=location.hash.slice(1).replace(/-/g,'+').replace(/_/g,'/');
 var bin=atob(h),bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
 var d=JSON.parse(new TextDecoder('utf-8').decode(bytes));document.title=d.title+' - Domino Game';
 window.dwdPlaylist=d.clips;var c=d.clips[0];document.getElementById('dwd-head').textContent=c.heading;
 document.getElementById('dwd-credit').textContent=c.credit;
 document.getElementById('dwd-player').innerHTML=c.sources;
 if(d.clips.length>1){var p=document.getElementById('dwd-places');
  d.clips.forEach(function(x,i){var b=document.createElement('button');
   b.className='place'+(i?'':' on');b.textContent=x.name;p.appendChild(b);});}
 }catch(e){document.getElementById('dwd-head').textContent='Video not found';}})();
window.addEventListener('hashchange',function(){location.reload();});
document.getElementById('dwd-back').onclick=function(){
 document.getElementById('dwd-bye').style.display='block';
 try{history.length>1?history.back():window.close();}catch(e){}};
"""
  page = PAGE.replace("{title}", "Real video").replace("{css}", CSS + PLACE_CSS)
  page = page.replace("{body}", body).replace(
      "document.getElementById('dwd-back').onclick=function(){{window.close();\n"
      " document.getElementById('dwd-bye').style.display='block';}};\n", "")
  page = page.replace("{script}", loader + SCRIPT)
  return page.replace("Close this tab to go back to the game.",
                      "Press the phone's Back button to go back to the game.")
