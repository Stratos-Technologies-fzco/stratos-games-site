"""Cross the Road: road safety learned by playing.

A street in the child's own theme: a road with cars, buses and autos, a zebra
crossing, a traffic light for the cars and a walk signal for people. The
lights change by themselves (green, yellow, red for cars; then the green man).
The child taps WALK:

- green man: the child stops at the kerb, looks right, left and right again
  (traffic keeps to the left in India, so the nearest cars come from the
  right), then walks over the zebra crossing to school, home or the temple;
- red man: a car says beep-beep and the voice explains why we wait.

Every safe crossing earns a star and a road safety tip (helmet, seat belt,
footpath, bus stop ...), shown with a picture and said aloud in the child's
language. Nothing bad ever happens on screen; a wrong tap is just a lesson.
"""

import math
import random
import time

import pygame

WHITE = (255, 255, 255)
YELLOW = (255, 204, 0)
RED_LAMP = (240, 50, 50)
AMBER_LAMP = (255, 180, 0)
GREEN_LAMP = (40, 210, 90)
OFF = (60, 60, 70)
ROAD = (70, 72, 82)
PATH = (205, 200, 190)
PATH_LINE = (175, 170, 160)
SKIN = (240, 190, 140)
SHIRT = (255, 120, 40)

# The signal cycle (seconds). Cars: green, yellow, red. People: green man
# while the cars have red; it blinks for the last BLINK seconds.
PHASES = [("go", 5.0), ("slow", 2.0), ("hold", 1.0), ("walk", 7.0), ("hold", 1.0)]
BLINK = 2.0
LOOK_TIME = 2.1          # right, left, right again
CROSS_TIME = 2.6

VEHICLES = [("Vehicles", "Car"), ("Vehicles", "Bus"), ("Vehicles", "Auto Rickshaw"),
            ("Vehicles", "Taxi"), ("Vehicles", "Scooter"), ("Vehicles", "Truck")]
PLACES = [("Buildings", "School", "school"), ("Buildings", "House", "home"),
          ("Buildings", "Temple", "the temple"), ("Buildings", "Hospital", "the hospital"),
          ("Buildings", "Mosque", "the mosque"), ("Buildings", "Church", "the church")]

# Spoken lines: English, Hindi, Bengali
LINES = {
    "start": ("Let's cross the road safely! Wait for the green man, then tap Walk.",
              "चलो सड़क सुरक्षित पार करें! हरे आदमी का इंतज़ार करो, फिर वॉक दबाओ।",
              "চলো নিরাপদে রাস্তা পার হই! সবুজ মানুষের জন্য অপেক্ষা করো, তারপর ওয়াক টিপো।"),
    "go": ("Green light for cars. Cars go, so we wait.",
           "गाड़ियों के लिए हरी बत्ती। गाड़ियाँ चलेंगी, हम रुकेंगे।",
           "গাড়ির জন্য সবুজ আলো। গাড়ি চলবে, আমরা অপেক্ষা করব।"),
    "slow": ("Yellow light. Cars slow down and get ready to stop.",
             "पीली बत्ती। गाड़ियाँ धीमी होकर रुकने को तैयार।",
             "হলুদ আলো। গাড়ি আস্তে হয়ে থামার জন্য তৈরি।"),
    "walk": ("Red light for cars. Green man for us! Tap Walk.",
             "गाड़ियों के लिए लाल बत्ती। हमारे लिए हरा आदमी! वॉक दबाओ।",
             "গাড়ির জন্য লাল আলো। আমাদের জন্য সবুজ মানুষ! ওয়াক টিপো।"),
    "look": ("Look right, look left, look right again. Now walk!",
             "दाएँ देखो, बाएँ देखो, फिर से दाएँ देखो। अब चलो!",
             "ডানে দেখো, বাঁয়ে দেখো, আবার ডানে দেখো। এবার হাঁটো!"),
    "red": ("Stop! The man is red and cars are coming. Wait for the green man.",
            "रुको! आदमी लाल है और गाड़ियाँ आ रही हैं। हरे आदमी का इंतज़ार करो।",
            "থামো! মানুষটা লাল, গাড়ি আসছে। সবুজ মানুষের জন্য অপেক্ষা করো।"),
    "blink": ("The green man is blinking. It is too late to start. Wait for the next one.",
              "हरा आदमी झपक रहा है। अब शुरू मत करो, अगली बार का इंतज़ार करो।",
              "সবুজ মানুষ মিটমিট করছে। এখন শুরু কোরো না, পরের বারের অপেক্ষা করো।"),
}
# Tips after each safe crossing: (picture category, picture name, en, hi, bn)
TIPS = [
    ("Road Safety", "Stop Sign", "Always stop at the kerb. Look right, look left, look right again.",
     "हमेशा किनारे पर रुको। दाएँ, बाएँ, फिर दाएँ देखो।",
     "সবসময় ফুটপাতের ধারে থামো। ডানে, বাঁয়ে, আবার ডানে দেখো।"),
    ("Road Safety", "Children Crossing", "Cross only at the zebra crossing.",
     "सड़क सिर्फ़ ज़ेबरा क्रॉसिंग से पार करो।", "শুধু জেব্রা ক্রসিং দিয়ে রাস্তা পার হও।"),
    ("Road Safety", "Footpath", "Always walk on the footpath, not on the road.",
     "हमेशा फ़ुटपाथ पर चलो, सड़क पर नहीं।", "সবসময় ফুটপাতে হাঁটো, রাস্তায় নয়।"),
    ("Road Safety", "Helmet", "Wear a helmet on a bicycle, bike or scooter.",
     "साइकिल, बाइक या स्कूटर पर हेलमेट पहनो।", "সাইকেল, বাইক বা স্কুটারে হেলমেট পরো।"),
    ("Vehicles", "Car", "In a car, always wear your seat belt.",
     "गाड़ी में हमेशा सीट बेल्ट लगाओ।", "গাড়িতে সবসময় সিট বেল্ট পরো।"),
    ("Road Safety", "Bus Stop", "Wait for the bus on the footpath. Get on only when it stops.",
     "बस का इंतज़ार फ़ुटपाथ पर करो। बस रुकने पर ही चढ़ो।",
     "বাসের জন্য ফুটপাতে অপেক্ষা করো। বাস থামলে তবেই ওঠো।"),
    ("Road Safety", "Traffic Police", "Hold a grown-up's hand when you cross the road.",
     "सड़क पार करते समय बड़ों का हाथ पकड़ो।", "রাস্তা পার হওয়ার সময় বড়দের হাত ধরো।"),
    ("Home", "Ball", "Never play on the road. If your ball rolls away, ask a grown-up.",
     "सड़क पर कभी मत खेलो। गेंद सड़क पर जाए तो बड़ों से कहो।",
     "রাস্তায় কখনো খেলো না। বল রাস্তায় গেলে বড়দের বলো।"),
    ("Road Safety", "Safety Vest", "Wear bright clothes so drivers can see you.",
     "चमकीले कपड़े पहनो ताकि ड्राइवर तुम्हें देख सकें।",
     "উজ্জ্বল জামা পরো যাতে চালকরা তোমাকে দেখতে পায়।"),
    ("Vehicles", "Ambulance", "When you hear a siren, make way for the ambulance.",
     "सायरन सुनो तो एम्बुलेंस को रास्ता दो।", "সাইরেন শুনলে অ্যাম্বুলেন্সকে রাস্তা দাও।"),
]
NARRATE_MAX = 2          # each light change is explained at most twice a game


class Car:

  def __init__(self, lane, x, kind, speed):
    self.lane, self.x, self.kind, self.speed = lane, x, kind, speed
    self.moving = True


class RoadGame:
  """The Cross the Road game; draws inside the play area like Find it!."""

  def __init__(self, game):
    self.g = game
    self.phase_i, self.phase_t = 0, 0.0
    self.cars = []
    self.spawn_in = [0.2, 1.4]
    self.narrated = {}
    self.place = 0
    self.tip_i = game.progress.data.setdefault("road", {"safe": 0, "waited": 0})["safe"]
    self.last = time.time()
    self.new_round(first=True)

  # ------------------------------------------------------------ state
  @property
  def data(self):
    return self.g.progress.data.setdefault("road", {"safe": 0, "waited": 0})

  def phase(self):
    return PHASES[self.phase_i][0]

  def left(self):
    return PHASES[self.phase_i][1] - self.phase_t

  def car_light(self):
    return {"go": "green", "slow": "yellow"}.get(self.phase(), "red")

  def walk_light(self):
    if self.phase() != "walk":
      return "red"
    return "blink" if self.left() <= BLINK else "green"

  def say(self, key, *extra):
    en, hi, bn = LINES[key]
    native = {"hi": hi, "bn": bn}.get(self.g.lang)
    self.g.say(en, native)

  def new_round(self, first=False):
    self.kid = "wait"            # wait, look, cross, arrived
    self.kid_t = 0.0
    self.bubble = None           # (text, until)
    self.shake_at = -10.0
    self.tip = None
    if not first:
      self.place = (self.place + 1) % len(PLACES)
    if first:
      self.say("start")

  # ------------------------------------------------------------ layout
  def layout(self):
    a = self.g_area()
    h = a.h
    lay = {
        "area": a,
        "path_top": a.y + int(h * 0.40), "road_top": a.y + int(h * 0.50),
        "road_bot": a.y + int(h * 0.76), "path_bot": a.y + int(h * 0.88),
        "cx": a.centerx, "zw": int(min(170, a.w * 0.34)),
    }
    lay["lanes"] = [lay["road_top"] + (lay["road_bot"] - lay["road_top"]) * 0.30,
                    lay["road_top"] + (lay["road_bot"] - lay["road_top"]) * 0.74]
    lay["car_h"] = int((lay["road_bot"] - lay["road_top"]) * 0.36)
    lay["kid_h"] = int(h * 0.15)
    lay["start"] = (lay["cx"] - lay["zw"] * 0.15, lay["path_bot"] - int(h * 0.015))
    lay["goal"] = (lay["cx"] - lay["zw"] * 0.15, lay["path_top"] + int(h * 0.075))
    bw = int(min(150, a.w * 0.34))
    lay["walk_btn"] = pygame.Rect(a.right - bw - 14, a.bottom - 78, bw, 64)
    return lay

  def g_area(self):
    import modes
    return modes.g_area()

  def stop_x(self, lay, lane):
    """Where cars wait: before the zebra (lane 0 drives right, lane 1 left)."""
    return (lay["cx"] - lay["zw"] / 2 - 14) if lane == 0 else (lay["cx"] + lay["zw"] / 2 + 14)

  # ------------------------------------------------------------ input
  def press(self, pos):
    g = self.g
    lay = self.layout()
    if self.kid == "arrived":
      if time.time() - self.kid_t > 1.0:
        g.sfx.play("click")
        self.new_round()
      return
    if self.kid != "wait":
      return
    kid_rect = pygame.Rect(0, 0, lay["kid_h"], lay["kid_h"] * 1.2)
    kid_rect.midbottom = (int(lay["start"][0]), int(lay["start"][1]))
    zebra = pygame.Rect(lay["cx"] - lay["zw"] // 2, lay["road_top"], lay["zw"],
                        lay["road_bot"] - lay["road_top"])
    if not (lay["walk_btn"].collidepoint(pos) or kid_rect.collidepoint(pos)
            or zebra.collidepoint(pos)):
      self.say_hint()
      return
    light = self.walk_light()
    if light == "green":
      g.sfx.play("switch")
      self.kid, self.kid_t = "look", time.time()
      self.say("look")
    elif light == "blink":
      g.sfx.play("tip")
      self.bubble = ("Wait!", time.time() + 2.0)
      self.shake_at = time.time()
      self.say("blink")
      self.data["waited"] += 1
      g.progress.save()
    else:
      g.sfx.play("horn")
      self.bubble = ("STOP!", time.time() + 2.2)
      self.shake_at = time.time()
      self.say("red")
      self.data["waited"] += 1
      g.progress.save()

  def say_hint(self):
    light = self.walk_light()
    self.say("walk" if light == "green" else ("blink" if light == "blink" else "red"))

  # ------------------------------------------------------------ update
  def update(self, now):
    dt = min(0.05, now - self.last)
    self.last = now
    lay = self.layout()
    busy = self.kid in ("look", "cross")
    if not busy:                       # the lights wait while the child crosses
      self.phase_t += dt
      if self.phase_t >= PHASES[self.phase_i][1]:
        self.phase_t = 0.0
        self.phase_i = (self.phase_i + 1) % len(PHASES)
        self.narrate()
    if self.walk_light() in ("green", "blink"):
      beat = 0.5 if self.walk_light() == "green" else 0.25
      if int((self.phase_t + dt) / beat) != int(self.phase_t / beat):
        self.g.sfx.play("beep")
    if self.kid == "look" and now - self.kid_t >= LOOK_TIME:
      self.kid, self.kid_t = "cross", now
    elif self.kid == "cross" and now - self.kid_t >= CROSS_TIME:
      self.arrive(now)
    self.move_cars(lay, dt)

  def narrate(self):
    if self.kid != "wait":
      return
    key = {"go": "go", "slow": "slow", "walk": "walk"}.get(self.phase())
    if key and self.narrated.get(key, 0) < NARRATE_MAX:
      self.narrated[key] = self.narrated.get(key, 0) + 1
      self.say(key)

  def arrive(self, now):
    g = self.g
    self.kid, self.kid_t = "arrived", now
    self.data["safe"] += 1
    g.progress.save()
    g.sfx.play("chime")
    g.particles.confetti(self.layout()["area"])
    self.tip = TIPS[self.tip_i % len(TIPS)]
    self.tip_i += 1
    _cat, _pic, en, hi, bn = self.tip
    _c, _n, where = PLACES[self.place]
    safe = self.data["safe"]
    star = " You are a Road Safety Star!" if safe % 5 == 0 else ""
    lead = f"Well done! You reached {where} safely.{star} "
    native = {"hi": f"शाबाश! तुम सुरक्षित पहुँच गए। {hi}",
              "bn": f"দারুণ! তুমি নিরাপদে পৌঁছে গেছ। {bn}"}.get(g.lang)
    g.say(lead + en, native)

  def move_cars(self, lay, dt):
    a = lay["area"]
    speed = a.w * 0.32
    for lane in (0, 1):
      self.spawn_in[lane] -= dt
      if self.spawn_in[lane] <= 0:
        self.spawn_in[lane] = random.uniform(1.6, 3.2)
        x = a.x - 90 if lane == 0 else a.right + 90
        ahead = [c for c in self.cars if c.lane == lane]
        if not ahead or min(abs(c.x - x) for c in ahead) > lay["car_h"] * 3:
          self.cars.append(Car(lane, x, random.choice(VEHICLES), speed * random.uniform(0.85, 1.1)))
    light = self.car_light()
    for lane in (0, 1):
      d = 1 if lane == 0 else -1          # lane 0 drives right, lane 1 drives left
      line = self.stop_x(lay, lane)
      queue = sorted((c for c in self.cars if c.lane == lane), key=lambda c: -c.x * d)
      front_limit = None                  # how far the car in front lets us go
      for c in queue:
        half = lay["car_h"] * 0.9
        nose = c.x + d * half
        limit = None
        before_line = (line - nose) * d >= -2
        if light != "green" and before_line:
          # yellow: a car already at the line keeps going; the others stop
          if not (light == "yellow" and (line - nose) * d < lay["car_h"] * 0.6):
            limit = line - d * half
        if front_limit is not None:
          lim2 = front_limit
          limit = lim2 if limit is None else (min(limit, lim2) if d > 0 else max(limit, lim2))
        step = c.speed * dt * d
        if limit is not None and (limit - c.x) * d <= abs(step):
          c.x = limit if (limit - c.x) * d > 0 else c.x
          c.moving = False
        else:
          c.x += step
          c.moving = True
        front_limit = c.x - d * (lay["car_h"] * 2.3)
    self.cars = [c for c in self.cars if a.x - 200 < c.x < a.right + 200]

  # ------------------------------------------------------------ drawing
  def draw(self, screen, now):
    lay = self.layout()
    a = lay["area"]
    self.draw_street(screen, lay)
    self.draw_goal(screen, lay)
    for c in sorted(self.cars, key=lambda c: c.lane):
      self.draw_car(screen, lay, c)
    self.draw_car_light(screen, lay, now)
    self.draw_walk_light(screen, lay, now)
    self.draw_kid(screen, lay, now)
    self.draw_stars(screen, lay)
    if self.kid == "wait":
      self.draw_walk_button(screen, lay, now)
    if self.bubble and now < self.bubble[1]:
      kx, ky = self.kid_pos(lay, now)
      self.draw_bubble(screen, (kx, ky - lay["kid_h"] * 1.25), self.bubble[0])
    if self.kid == "arrived" and self.tip:
      self.draw_tip(screen, lay, now)
    self.draw_hint(screen, lay)

  def draw_street(self, s, lay):
    a = lay["area"]
    pt, rt, rb, pb = lay["path_top"], lay["road_top"], lay["road_bot"], lay["path_bot"]
    for y0, y1 in ((pt, rt), (rb, pb)):                      # footpaths with tiles
      pygame.draw.rect(s, PATH, (a.x, y0, a.w, y1 - y0))
      for x in range(a.x, a.right, 34):
        pygame.draw.line(s, PATH_LINE, (x, y0), (x, y1), 1)
      pygame.draw.line(s, PATH_LINE, (a.x, (y0 + y1) // 2), (a.right, (y0 + y1) // 2), 1)
    pygame.draw.rect(s, ROAD, (a.x, rt, a.w, rb - rt))
    for y in (rt, rb - 6):                                   # black-and-yellow kerbs
      for k, x in enumerate(range(a.x, a.right, 24)):
        pygame.draw.rect(s, (30, 30, 30) if k % 2 else (250, 210, 40), (x, y, 24, 6))
    mid = (rt + rb) // 2                                     # centre line
    for x in range(a.x, a.right, 46):
      if abs(x + 13 - lay["cx"]) > lay["zw"] / 2 + 10:
        pygame.draw.rect(s, WHITE, (x, mid - 2, 26, 4))
    zw, cx = lay["zw"], lay["cx"]                            # zebra crossing
    n = 7
    stripe = (rb - rt - 12) / (2 * n - 1)
    for k in range(n):
      y = rt + 6 + k * 2 * stripe
      pygame.draw.rect(s, WHITE, (cx - zw // 2, int(y), zw, max(3, int(stripe))))
    for lane in (0, 1):                                      # stop lines
      x = self.stop_x(lay, lane)
      y0, y1 = (rt + 6, mid - 4) if lane == 0 else (mid + 4, rb - 6)
      pygame.draw.line(s, WHITE, (x, y0), (x, y1), 4)

  def goal_thumb(self, lay):
    cat, name, _where = PLACES[self.place]
    return self.g.thumb(name, cat, int((lay["path_top"] - lay["area"].y) * 0.55))

  def goal_rect(self, lay):
    th = self.goal_thumb(lay)
    if th is None:
      return None
    return th.get_rect(midbottom=(int(lay["goal"][0]), lay["path_top"] + 4))

  def draw_goal(self, s, lay):
    _cat, _name, where = PLACES[self.place]
    th = self.goal_thumb(lay)
    if th is not None:
      r = self.goal_rect(lay)
      s.blit(th, r)
      lbl = self.g.font_at(18).render(f"Go to {where}!", True, WHITE)
      box = lbl.get_rect(midbottom=(r.centerx, r.top - 4)).inflate(18, 8)
      pill = pygame.Surface(box.size, pygame.SRCALPHA)
      pygame.draw.rect(pill, (20, 30, 70, 190), pill.get_rect(), border_radius=box.h // 2)
      s.blit(pill, box.topleft)
      s.blit(lbl, lbl.get_rect(center=box.center))

  def draw_car(self, s, lay, c):
    cat, name = c.kind
    img = self.g.thumb(name, cat, lay["car_h"] * 2)
    y = lay["lanes"][c.lane]
    if img is None:
      r = pygame.Rect(0, 0, lay["car_h"] * 1.8, lay["car_h"])
      r.center = (int(c.x), int(y))
      pygame.draw.rect(s, (220, 60, 60), r, border_radius=8)
      return
    if c.lane == 0:                       # OpenMoji vehicles face left
      img = pygame.transform.flip(img, True, False)
    bounce = 0 if not c.moving else int(1.5 * math.sin(c.x / 9))
    s.blit(img, img.get_rect(center=(int(c.x), int(y) - bounce)))

  def lamp(self, s, c, r, colour, lit):
    if lit:
      glow = pygame.Surface((r * 4, r * 4), pygame.SRCALPHA)
      pygame.draw.circle(glow, (*colour, 70), (r * 2, r * 2), r * 2)
      s.blit(glow, (c[0] - r * 2, c[1] - r * 2))
    pygame.draw.circle(s, colour if lit else OFF, c, r)
    pygame.draw.circle(s, (20, 20, 25), c, r, 2)

  def draw_car_light(self, s, lay, now):
    """Big traffic light for the cars on the far footpath, left of the zebra."""
    a = lay["area"]
    r = max(11, int(a.h * 0.024))
    x = int(lay["cx"] - lay["zw"] / 2 - r * 3.2)
    goal = self.goal_rect(lay)
    if goal is not None:                   # never in front of the building
      x = min(x, goal.left - r - 18)
    x = max(a.x + r + 14, x)
    foot = (lay["path_top"] + lay["road_top"]) // 2
    box = pygame.Rect(0, 0, r * 2 + 14, r * 6 + 22)
    box.midbottom = (x, lay["path_top"] - int(a.h * 0.03))
    pygame.draw.rect(s, (60, 60, 60), (x - 3, box.bottom, 6, foot - box.bottom))
    pygame.draw.rect(s, (35, 35, 40), box, border_radius=10)
    pygame.draw.rect(s, (250, 210, 40), box, 2, border_radius=10)
    light = self.car_light()
    for k, (col, name) in enumerate(((RED_LAMP, "red"), (AMBER_LAMP, "yellow"),
                                     (GREEN_LAMP, "green"))):
      self.lamp(s, (x, box.y + 11 + r + k * (2 * r + 2)), r, col, light == name)
    word = {"red": "STOP", "yellow": "WAIT", "green": "GO"}[light]
    col = {"red": RED_LAMP, "yellow": AMBER_LAMP, "green": GREEN_LAMP}[light]
    lbl = self.g.font_at(16).render(f"Cars: {word}", True, col)
    bg = lbl.get_rect(midtop=(x, box.bottom + 4)).inflate(10, 4)
    pygame.draw.rect(s, (25, 25, 35), bg, border_radius=8)
    s.blit(lbl, lbl.get_rect(center=bg.center))

  def draw_walk_light(self, s, lay, now):
    """The walk signal across the road: red standing man or green walking man."""
    a = lay["area"]
    w = max(46, int(a.h * 0.075))
    box = pygame.Rect(0, 0, w, int(w * 1.25))
    box.midbottom = (int(lay["cx"] + lay["zw"] / 2 + w * 0.9), lay["path_top"] + int(w * 0.5))
    pygame.draw.rect(s, (60, 60, 60), (box.centerx - 3, box.bottom, 6, lay["road_top"] - box.bottom))
    pygame.draw.rect(s, (35, 35, 40), box, border_radius=8)
    pygame.draw.rect(s, (250, 210, 40), box, 2, border_radius=8)
    light = self.walk_light()
    on = light == "green" or (light == "blink" and int(now * 4) % 2 == 0)
    colour = GREEN_LAMP if light != "red" else RED_LAMP
    if light != "red" and not on:
      colour = OFF
    walking = light != "red"
    draw_person(s, box.center, box.h * 0.78, colour, walking, now)
    word = {"green": "WALK", "red": "WAIT", "blink": "DON'T START"}[light]
    lbl = self.g.font_at(15).render(word, True, GREEN_LAMP if light == "green" else RED_LAMP)
    bg = lbl.get_rect(midtop=(box.centerx, box.bottom + 4)).inflate(10, 4)
    if bg.right > a.right - 4:
      bg.right = a.right - 4
    pygame.draw.rect(s, (25, 25, 35), bg, border_radius=8)
    s.blit(lbl, lbl.get_rect(center=bg.center))

  def kid_pos(self, lay, now):
    sx, sy = lay["start"]
    gx, gy = lay["goal"]
    if self.kid == "cross":
      k = min(1.0, (now - self.kid_t) / CROSS_TIME)
      return sx + (gx - sx) * k, sy + (gy - sy) * k
    if self.kid == "arrived":
      return gx, gy
    dx = 0
    if now - self.shake_at < 0.5:
      dx = 6 * math.sin((now - self.shake_at) * 40)
    return sx + dx, sy

  def draw_kid(self, s, lay, now):
    x, y = self.kid_pos(lay, now)
    h = lay["kid_h"]
    look = 0
    if self.kid == "look":                       # right, left, right again
      t = now - self.kid_t
      look = 1 if t < 0.7 else (-1 if t < 1.4 else 1)
      word = "Right!" if look > 0 else "Left!"
      lbl = self.g.font_at(20).render(word, True, YELLOW)
      arrow_x = x + look * h * 0.75
      s.blit(lbl, lbl.get_rect(center=(arrow_x, y - h * 1.15)))
      ay = y - h * 0.95
      pygame.draw.polygon(s, YELLOW, [(arrow_x + look * 18, ay), (arrow_x - look * 4, ay - 10),
                                      (arrow_x - look * 4, ay + 10)])
    walking = self.kid == "cross"
    draw_child(s, (x, y), h, walking, now, look, self.g.cap_colours(),
               cheer=self.kid == "arrived")

  def draw_stars(self, s, lay):
    a = lay["area"]
    safe = self.data["safe"]
    self.g.draw_star(s, (a.x + 26, a.y + 24), 15)
    lbl = self.g.font_at(18).render(f"{safe} safe crossing{'s' if safe != 1 else ''}", True, WHITE)
    box = lbl.get_rect(midleft=(a.x + 46, a.y + 24)).inflate(14, 6)
    pill = pygame.Surface(box.size, pygame.SRCALPHA)
    pygame.draw.rect(pill, (20, 30, 70, 170), pill.get_rect(), border_radius=box.h // 2)
    s.blit(pill, box.topleft)
    s.blit(lbl, lbl.get_rect(center=box.center))

  def draw_walk_button(self, s, lay, now):
    r = lay["walk_btn"]
    ready = self.walk_light() == "green"
    if ready:
      r = r.inflate(int(6 * math.sin(now * 6)), int(6 * math.sin(now * 6)))
    pygame.draw.rect(s, (40, 170, 80) if ready else (120, 130, 150), r, border_radius=18)
    pygame.draw.rect(s, WHITE, r, 3, border_radius=18)
    draw_person(s, (r.x + 30, r.centery), r.h * 0.7, WHITE, True, now)
    lbl = self.g.font_at(26).render("Walk", True, WHITE)
    s.blit(lbl, lbl.get_rect(midleft=(r.x + 56, r.centery)))

  def draw_bubble(self, s, pos, text):
    lbl = self.g.font_at(22).render(text, True, (200, 30, 30))
    box = lbl.get_rect(center=(int(pos[0]), int(pos[1]))).inflate(22, 12)
    pygame.draw.rect(s, WHITE, box, border_radius=14)
    pygame.draw.rect(s, (200, 30, 30), box, 3, border_radius=14)
    s.blit(lbl, lbl.get_rect(center=box.center))

  def draw_tip(self, s, lay, now):
    a = lay["area"]
    cat, name, en, _hi, _bn = self.tip
    w = min(420, a.w - 30)
    card = pygame.Rect(0, 0, w, 230)
    card.center = (a.centerx, a.y + int(a.h * 0.40))
    grow = min(1.0, (now - self.kid_t) / 0.3)
    if grow < 1:
      card = card.inflate(-int(card.w * (1 - grow) * 0.5), -int(card.h * (1 - grow) * 0.5))
    pygame.draw.rect(s, (255, 250, 235), card, border_radius=20)
    pygame.draw.rect(s, YELLOW, card, 5, border_radius=20)
    head = self.g.font_at(22).render("Road safety tip", True, (220, 90, 30))
    s.blit(head, head.get_rect(midtop=(card.centerx, card.y + 12)))
    th = self.g.thumb(name, cat, 84)
    x = card.x + 18
    if th is not None:
      s.blit(th, th.get_rect(midleft=(card.x + 16, card.centery + 8)))
      x = card.x + 112
    font = self.g.font_at(19)
    lines = wrap(font, en, card.right - 16 - x)
    y = card.centery + 8 - len(lines) * 13
    for line in lines:
      t = font.render(line, True, (40, 40, 70))
      s.blit(t, (x, y))
      y += 26
    more = self.g.font_at(15).render("Tap to cross again", True, (90, 90, 120))
    s.blit(more, more.get_rect(midbottom=(card.centerx, card.bottom - 10)))

  def draw_hint(self, s, lay):
    a = lay["area"]
    if self.kid == "wait":
      light = self.walk_light()
      text = {"green": "Green man: tap Walk!", "blink": "Blinking: wait for the next green",
              "red": "Red man: wait on the footpath"}[light]
    elif self.kid == "look":
      text = "Look right, look left, look right again"
    elif self.kid == "cross":
      text = "Walk on the zebra crossing"
    else:
      return
    lbl = self.g.font_at(17).render(text, True, WHITE)
    box = lbl.get_rect(midleft=(a.x + 14, a.bottom - 46)).inflate(20, 10)
    max_w = lay["walk_btn"].x - a.x - 20
    if box.w > max_w:
      lbl = pygame.transform.smoothscale(lbl, (max(1, max_w - 20), lbl.get_height()))
      box = lbl.get_rect(midleft=(a.x + 14, a.bottom - 46)).inflate(20, 10)
    pill = pygame.Surface(box.size, pygame.SRCALPHA)
    pygame.draw.rect(pill, (20, 24, 50, 190), pill.get_rect(), border_radius=box.h // 2)
    s.blit(pill, box.topleft)
    s.blit(lbl, lbl.get_rect(center=box.center))


# ---------------------------------------------------------------- figures
def draw_person(s, centre, h, colour, walking, now):
  """The little signal man: standing (red) or walking (green)."""
  cx, cy = centre
  u = h / 10.0
  head = (int(cx), int(cy - 3.6 * u))
  pygame.draw.circle(s, colour, head, max(2, int(1.2 * u)))
  w = max(2, int(1.1 * u))
  hip = (cx, cy + 1.0 * u)
  neck = (cx, cy - 2.2 * u)
  pygame.draw.line(s, colour, neck, hip, w + 1)
  swing = math.sin(now * 8) if walking else 0.0
  if walking:
    pygame.draw.line(s, colour, hip, (cx - 2.2 * u * (0.6 + 0.4 * swing), cy + 4.6 * u), w)
    pygame.draw.line(s, colour, hip, (cx + 2.2 * u * (0.6 - 0.4 * swing), cy + 4.6 * u), w)
    pygame.draw.line(s, colour, (cx, cy - 1.6 * u), (cx - 2 * u, cy + 0.2 * u), w)
    pygame.draw.line(s, colour, (cx, cy - 1.6 * u), (cx + 2 * u, cy - 0.6 * u), w)
  else:
    pygame.draw.line(s, colour, hip, (cx - 0.8 * u, cy + 4.6 * u), w)
    pygame.draw.line(s, colour, hip, (cx + 0.8 * u, cy + 4.6 * u), w)
    pygame.draw.line(s, colour, (cx, cy - 1.8 * u), (cx - 1.2 * u, cy + 0.8 * u), w)
    pygame.draw.line(s, colour, (cx, cy - 1.8 * u), (cx + 1.2 * u, cy + 0.8 * u), w)


def draw_child(s, foot, h, walking, now, look, cap_colours, cheer=False):
  """The player: school bag, orange shirt, the rainbow cap earned so far."""
  import world
  fx, fy = foot
  u = h / 10.0
  swing = math.sin(now * 9) if walking else 0.0
  leg = max(3, int(1.0 * u))
  hip = (fx, fy - 4.2 * u)
  pygame.draw.line(s, (40, 60, 140), hip, (fx - 1.0 * u - swing * 1.2 * u, fy), leg)
  pygame.draw.line(s, (40, 60, 140), hip, (fx + 1.0 * u + swing * 1.2 * u, fy), leg)
  for sx in (-1, 1):                                    # shoes
    px = fx + sx * (1.0 * u + sx * swing * 1.2 * u)
    pygame.draw.ellipse(s, (60, 40, 30), (px - 0.9 * u, fy - 0.6 * u, 1.8 * u, 1.0 * u))
  bag = pygame.Rect(0, 0, 3.6 * u, 3.4 * u)             # school bag behind
  bag.center = (int(fx), int(fy - 6.0 * u))
  pygame.draw.rect(s, (60, 140, 230), bag, border_radius=int(u))
  body = pygame.Rect(0, 0, 3.4 * u, 3.8 * u)
  body.midbottom = (int(fx), int(fy - 3.8 * u))
  pygame.draw.rect(s, SHIRT, body, border_radius=int(u))
  arm = max(2, int(0.8 * u))
  if cheer:
    pygame.draw.line(s, SHIRT, (fx - 1.4 * u, fy - 7 * u), (fx - 2.8 * u, fy - 9.6 * u), arm)
    pygame.draw.line(s, SHIRT, (fx + 1.4 * u, fy - 7 * u), (fx + 2.8 * u, fy - 9.6 * u), arm)
  else:
    pygame.draw.line(s, SHIRT, (fx - 1.6 * u, fy - 7 * u), (fx - 2.2 * u + swing * u, fy - 4.6 * u), arm)
    pygame.draw.line(s, SHIRT, (fx + 1.6 * u, fy - 7 * u), (fx + 2.2 * u - swing * u, fy - 4.6 * u), arm)
  head = (int(fx), int(fy - 9.0 * u))
  hr = int(1.7 * u)
  pygame.draw.circle(s, SKIN, head, hr)
  pygame.draw.circle(s, (150, 100, 60), head, hr, 1)
  ex = look * 0.5 * u
  for side in (-0.6, 0.6):
    e = (int(head[0] + side * u + ex), int(head[1] - 0.1 * u))
    pygame.draw.circle(s, WHITE, e, max(2, int(0.45 * u)))
    pygame.draw.circle(s, (30, 30, 40), (e[0] + int(look * 0.18 * u), e[1]), max(1, int(0.22 * u)))
  pygame.draw.arc(s, (150, 60, 40), (head[0] - 0.7 * u + ex, head[1] + 0.2 * u, 1.4 * u, 0.9 * u),
                  math.pi, 2 * math.pi, max(1, int(0.25 * u)))
  peak = (head[0] + (look or 1) * hr * 1.3, head[1] - hr * 0.2)
  world.WorldScene.draw_rainbow_cap(s, head, hr, peak, cap_colours)


def wrap(font, text, max_w):
  lines, line = [], ""
  for word in text.split():
    trial = f"{line} {word}".strip()
    if font.size(trial)[0] <= max_w or not line:
      line = trial
    else:
      lines.append(line)
      line = word
  if line:
    lines.append(line)
  return lines

