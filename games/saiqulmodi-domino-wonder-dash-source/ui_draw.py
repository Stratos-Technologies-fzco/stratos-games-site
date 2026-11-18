"""How Domino Game looks: everything Game draws (top row, play area, menu panel, cards).

The methods live on GameDrawing, which Game inherits from, so they still read and write the
game's own state through self. Layout values (PLAY_RECT, BANNER_RECT, ...) and helpers come
from main.py: share() copies them here, and main.set_layout() calls it again whenever the
screen's shape changes.
"""


def share(names):
  """Takes main.py's constants, layout rects, helpers and modules into this module."""
  globals().update({k: v for k, v in names.items() if not k.startswith("__")})


def draw_pencil(screen, tip, scale=1.0):
  """A yellow pencil leaning up to the right, its lead at tip (Draw it)."""
  ux, uy = 0.6, -0.8                       # along the pencil, from the lead upwards
  px, py = -uy, ux                         # across it
  half = 6 * scale

  def at(along, across):
    return (tip[0] + ux * along + px * across, tip[1] + uy * along + py * across)

  cone, body, rub = 14 * scale, 50 * scale, 9 * scale
  pygame.draw.polygon(screen, (40, 40, 60), [at(0, 0), at(cone * 0.4, -half * 0.4), at(cone * 0.4, half * 0.4)])
  pygame.draw.polygon(screen, (240, 205, 160), [at(cone * 0.4, -half * 0.4), at(cone, -half),
                                                at(cone, half), at(cone * 0.4, half * 0.4)])
  pygame.draw.polygon(screen, (255, 200, 40), [at(cone, -half), at(cone + body, -half),
                                               at(cone + body, half), at(cone, half)])
  pygame.draw.polygon(screen, (245, 140, 160), [at(cone + body, -half), at(cone + body + rub, -half),
                                                at(cone + body + rub, half), at(cone + body, half)])
  pygame.draw.polygon(screen, (60, 50, 40), [at(0, 0), at(cone, -half), at(cone + body + rub, -half),
                                             at(cone + body + rub, half), at(cone, half)], 2)


class GameDrawing:

  def draw_places(self, screen, now):
    """Maps, once traced: the capital (star), famous places (red dots) and,
    on the India map, every state's name."""
    places = getattr(self, "places", None)
    if self.stage != "finished" or not places or now - self.finished_at < 0.6:
      return
    area = PLAY_RECT.inflate(-6, -6)
    # markers first, so no name is written over another place's dot
    taken = [pygame.Rect(int(x) - 8, int(y) - 8, 16, 16)
             for _l, x, y, kind, _r in places if kind in ("capital", "place")]
    if self.current_video():
      taken.append(self.watch_rect().inflate(10, 10))
    for _label, x, y, kind, _room in places:
      if kind == "capital":
        self.draw_star(screen, (int(x), int(y)), 10)
      elif kind == "place":
        pygame.draw.circle(screen, WHITE, (int(x), int(y)), 6)
        pygame.draw.circle(screen, (230, 40, 50), (int(x), int(y)), 4)
    busy = sum(1 for p in places if p[3] == "place") > 3
    # famous places first (in their listed order), then the capital (which
    # always gets a name), then state names where they fit
    order = {"place": 0, "capital": 1, "state": 2}
    for label, x, y, kind, room in sorted(places, key=lambda p: order.get(p[3], 3)):
      x, y = int(x), int(y)
      if kind == "state":
        text = self.halo_text(self.small_font, label)
        if text.get_width() > room * 4.2:            # long name: try the short one
          text = self.halo_text(self.small_font, hub.INDIA_SHORT.get(label, label))
        if text.get_width() > room * 4.2 or text.get_height() > room * 2.2:
          continue                       # the state is too small for its name here
        spots = [("center", (x, y))]
        box = text.get_rect()
      else:
        font = self.small_font if busy and kind == "place" else self.font
        text = font.render(label, True, WHITE)
        box = text.get_rect().inflate(8, 4)
        spots = [("midleft", (x + 11, y)), ("midright", (x - 11, y)),
                 ("midbottom", (x, y - 9)), ("midtop", (x, y + 9)),
                 ("bottomleft", (x + 6, y - 6)), ("topleft", (x + 6, y + 6)),
                 ("bottomright", (x - 6, y - 6)), ("topright", (x - 6, y + 6))]
      for anchor, point in spots:
        r = box.copy()
        setattr(r, anchor, point)
        if area.contains(r) and not any(r.colliderect(t) for t in taken
                                        if not t.collidepoint(x, y)):
          break
      else:
        if kind != "capital":
          continue                       # no room: leave this name out
        r = box.copy()
        r.midleft = (x + 11, y)
      taken.append(r)
      if kind != "state":
        pill = pygame.Surface(r.size, pygame.SRCALPHA)
        pill.fill((20, 20, 40, 200) if kind == "place" else (120, 80, 0, 225))
        screen.blit(pill, r.topleft)
      screen.blit(text, text.get_rect(center=r.center))

  def halo_text(self, font, text):
    """Dark words with a white edge: readable on any map colour."""
    ink = font.render(text, True, (25, 25, 45))
    edge = font.render(text, True, WHITE)
    surf = pygame.Surface((ink.get_width() + 2, ink.get_height() + 2), pygame.SRCALPHA)
    for dx, dy in ((0, 1), (2, 1), (1, 0), (1, 2)):
      surf.blit(edge, (dx, dy))
    surf.blit(ink, (1, 1))
    return surf

  def watch_rect(self):
    """Big "Watch the real ..." button shown after a picture is finished."""
    r = pygame.Rect(0, 0, min(320, PLAY_RECT.w - 40), 46)
    r.midbottom = (PLAY_RECT.centerx, PLAY_RECT.bottom - 34)
    return r

  def draw_watch_button(self, screen, now):
    if self.stage != "finished" or not self.current_video():
      return
    rect = self.watch_rect()
    grow = int(3 * (1 + math.sin(now * 5)))
    pygame.draw.rect(screen, YELLOW, rect.inflate(6 + grow, 6 + grow), 3, border_radius=26)
    pygame.draw.rect(screen, (230, 40, 50), rect, border_radius=23)
    pygame.draw.rect(screen, WHITE, rect, 2, border_radius=23)
    cx, cy = rect.x + 28, rect.centery
    pygame.draw.circle(screen, WHITE, (cx, cy), 15)
    pygame.draw.polygon(screen, (230, 40, 50), [(cx - 5, cy - 8), (cx - 5, cy + 8), (cx + 9, cy)])
    word = hub.letter_word(self.cat, self.puzzle)      # a letter: its word's video
    title = (word[1] if word else
             hub.CATEGORIES_HUB[self.cat][self.puzzle].get("label") or self.puzzle)
    words = (f"See {title}'s famous places!" if self.current_video().get("places")
             else f"Watch the real {title}!")
    if symbols.ONLY:                           # play symbol + the picture itself: "watch the real one"
      th = self.thumb(self.puzzle, self.cat, rect.h - 8)
      if th is not None:
        screen.blit(th, th.get_rect(midleft=(rect.x + 56, rect.centery)))
      pygame.draw.circle(screen, WHITE, (rect.right - 30, cy), 9)          # a little camera lens: real video
      pygame.draw.circle(screen, (230, 40, 50), (rect.right - 30, cy), 4)
      return
    lbl = fit_label(self.hint_font, words, WHITE, rect.w - 64)
    screen.blit(lbl, lbl.get_rect(midleft=(rect.x + 52, rect.centery)))

  def whats_next_rect(self):
    return pygame.Rect(PLAY_RECT.right - 104, PLAY_RECT.y + 52, 96, 112)

  def draw_whats_next(self, screen, now):
    """After a finish: the next picture as a dark mystery shape with a "?",
    so children want to find out what comes next. Tap it to go there."""
    if self.stage != "finished" or now - self.finished_at < 1.5 or self.is_custom:
      return
    nxt = self.peek_next()
    if not nxt:
      return
    r = self.whats_next_rect().move(0, int(4 * math.sin(now * 3)))
    card = pygame.Surface(r.size, pygame.SRCALPHA)
    pygame.draw.rect(card, (25, 30, 70, 215), card.get_rect(), border_radius=16)
    screen.blit(card, r.topleft)
    pygame.draw.rect(screen, YELLOW, r, 3, border_radius=16)
    th = self.thumb(nxt[1], nxt[0], 62)
    if th is not None:
      shadow = th.copy()
      shadow.fill((70, 60, 140, 255), special_flags=pygame.BLEND_RGB_MIN)
      screen.blit(shadow, shadow.get_rect(center=(r.centerx, r.y + 44)))
    q = self.font_at(34).render("?", True, YELLOW)
    screen.blit(q, q.get_rect(center=(r.centerx + 26, r.y + 22)))
    lbl = fit_label(self.small_font, "What's next?", WHITE, r.w - 8)
    screen.blit(lbl, lbl.get_rect(center=(r.centerx, r.bottom - 14)))

  def render_char(self, ch, size, color):
    font = self.font_at(size)
    metrics = font.metrics(ch)
    if not metrics or metrics[0] is None:
      font = pygame.font.SysFont("Arial", size, bold=True)
    return font.render(ch, True, color)

  def draw_title_banner(self, screen, now):
    pygame.draw.rect(screen, self.theme["banner"], BANNER_RECT, border_radius=14)
    pygame.draw.rect(screen, YELLOW, BANNER_RECT, 2, border_radius=14)

    # Real picture at the left of the name (tap it to hear its sound). A letter
    # shows its word's picture here instead (A -> the apple), so the play area
    # stays free for tracing.
    x_start = BANNER_RECT.x + 10
    hide = self.banner_override or self.mode == "quiz"   # don't show the answer
    word = hub.letter_word(self.cat, self.puzzle) if self.mode == "trace" and not self.is_custom else None
    hide = hide or (BANNER_RECT.w < 420 and not word)    # narrow phone: room for the letters
    th = None if hide else (self.thumb(word[1], word[0], 52) if word else
                            self.thumb(self.puzzle, self.cat, 52))
    if th is not None:
      if word and self.stage == "finished" and now - self.finished_at < 2:   # a hop of joy
        th_y = BANNER_RECT.centery - int(6 * abs(math.sin((now - self.finished_at) * 4)))
      else:
        th_y = BANNER_RECT.centery
      screen.blit(th, th.get_rect(center=(BANNER_RECT.x + 34, th_y)))
      screen.blit(th, th.get_rect(center=(BANNER_RECT.x + 34, BANNER_RECT.centery)))
      x_start = BANNER_RECT.x + 64

    # Hindi letters: the word ("अ से अनार") is a ready-made picture, so it
    # shows correctly even on phones and browsers without Hindi fonts.
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    if item.get("word_img") and not self.banner_override:
      word = self.image(os.path.join(hub.HERE, item["word_img"]))
      if word is not None:
        avail_w = self.banner_right() - 10 - x_start
        avail_h = BANNER_RECT.h - 12
        if now - self.praised_at < 2.5:  # glow on "Well done"
          pygame.draw.rect(screen, YELLOW, BANNER_RECT, 5, border_radius=14)
        s = min(avail_w / word.get_width(), avail_h / word.get_height())
        size = (max(1, int(word.get_width() * s)), max(1, int(word.get_height() * s)))
        word = self.image(os.path.join(hub.HERE, item["word_img"]), size)
        screen.blit(word, word.get_rect(center=(x_start + avail_w / 2,
                                                BANNER_RECT.centery)))
      self.draw_speaker(screen)
      return

    name = self.banner_override or item.get("tile_text") or self.puzzle
    gap = 3
    avail = self.banner_right() - 8 - x_start
    units = sum(0.5 if ch == " " else 1 for ch in name)
    tile_w = int(min(44, (avail - gap * (len(name) - 1)) / units))
    tile_h = min(54, int(tile_w * 1.3))
    total_w = sum(tile_w // 2 if ch == " " else tile_w for ch in name)
    total_w += gap * (len(name) - 1)
    x = x_start + (avail - total_w) / 2
    base_y = BANNER_RECT.centery - tile_h / 2

    elapsed = now - self.announced_at
    spelled = now - self.spelling_at        # letters light up only when spelled aloud
    spelling = not self.is_custom and not self.banner_override and self.mode != "quiz"
    active = int((spelled - SPELL_START) // SPELL_STEP) if spelling else -1
    n_letters = sum(1 for ch in name if ch != " ")
    letter_idx = 0
    praising = now - self.praised_at < 2.5
    screen.set_clip(BANNER_RECT.inflate(-4, -4))
    for i, ch in enumerate(name):
      if ch == " ":
        x += tile_w // 2 + gap
        continue
      # Tiles drop in one after another, then light up as each letter is said
      drop = max(0.0, 1.0 - (elapsed - i * 0.05) / 0.25)
      y = base_y - drop * 30
      lit = praising or (spelled >= SPELL_START and (
          letter_idx == active or n_letters <= active < n_letters + 2))
      # Bright, strong tiles with a big white letter (a dark edge keeps it readable)
      color = pygame.Color(0)
      color.hsva = ((i * 360 // max(1, len(name))) % 360, 85, 88, 100)
      rect = pygame.Rect(int(x), int(y - (7 if lit else 0)), tile_w, tile_h)
      pygame.draw.rect(screen, (30, 30, 60), rect.move(0, 3), border_radius=8)
      pygame.draw.rect(screen, YELLOW if lit else color, rect, border_radius=8)
      pygame.draw.rect(screen, WHITE, rect, 2, border_radius=8)
      size = max(12, int(tile_h * 0.74))
      edge = self.render_char(ch, size, (30, 30, 60))
      lbl = self.render_char(ch, size, (40, 40, 80) if lit else WHITE)
      for ox, oy in ((-2, 0), (2, 0), (0, -2), (0, 2)) if not lit else ():
        screen.blit(edge, edge.get_rect(center=(rect.centerx + ox, rect.centery + oy)))
      screen.blit(lbl, lbl.get_rect(center=rect.center))
      x += tile_w + gap
      letter_idx += 1
    screen.set_clip(None)
    self.draw_speaker(screen)

  def banner_right(self):
    """Where the name tiles must stop (before the ABC and speaker buttons)."""
    return (SPELL_CENTER if self.can_spell() else SPEAKER_CENTER)[0] - SPEAKER_R

  def draw_speaker(self, screen):
    """Speaker icon (tap to hear the name again) and, for names, the ABC button
    that opens the spelling card."""
    if self.can_spell():
      c = SPELL_CENTER
      pygame.draw.circle(screen, (40, 40, 80), (c[0], c[1] + 2), SPEAKER_R)
      pygame.draw.circle(screen, YELLOW if self.spell_card else (255, 150, 60), c, SPEAKER_R)
      pygame.draw.circle(screen, WHITE, c, SPEAKER_R, 2)
      lbl = fit_label(self.font_at(15), "ABC", WHITE, SPEAKER_R * 2 - 8)
      screen.blit(lbl, lbl.get_rect(center=(c[0], c[1] + 1)))
    cx, cy = SPEAKER_CENTER
    bg = self.theme["bg"]
    pygame.draw.circle(screen, CYAN, SPEAKER_CENTER, SPEAKER_R)
    pygame.draw.rect(screen, bg, (cx - 11, cy - 5, 6, 10))
    pygame.draw.polygon(
        screen, bg,
        [(cx - 6, cy - 5), (cx + 2, cy - 12), (cx + 2, cy + 12), (cx - 6, cy + 5)],
    )
    for r in (7, 12):
      pygame.draw.arc(
          screen, bg, (cx + 2 - r, cy - r, 2 * r, 2 * r),
          -math.pi / 4, math.pi / 4, 2,
      )

  def hint_text(self):
    if self.stage == "draw":
      if self.copy_loops:
        if self.copy_drawing():
          return "Watch the pencil draw it!"
        if not self.drawing:
          return "Now you draw it with the crayons!"
        return "Draw more, or tap Done to make dominoes"
      if not self.drawing:
        return "Draw anything you imagine!"
      return "Draw more, or tap Done to make dominoes"
    if self.stage == "trace":
      return "Trace the dots!"          # how far: the bar and stars above this pill
    if self.stage == "ready":
      if self.dropping():
        letter = getattr(self, "domino_letter", None)
        if letter and not hub.CATEGORIES_HUB[self.cat][self.puzzle].get("hindi"):
          return f"Here come the {letter} dominoes!"
        return "Here come the dominoes!"
      return "Tap to push the dominoes!"
    if self.stage == "finished":
      if self.sing:
        return ("Sing along!" if self.sing.singing
                else "Tap the words to sing again, or Next")
      if self.sing_rect():
        return "Tap Sing to sing along, or Next"
      if self.story:
        last = self.story["step"] == len(self.story["story"]["steps"]) - 1
        return "The end! Pick another story" if last else "Tap for the next part!"
      if self.current_video():
        if self.current_video().get("places"):
          return "Yay! Tap to play again, or see the famous places"
        return "Yay! Tap to play again, or watch the real one"
      return "Yay! Tap to play again, or Next"
    return ""

  def draw_trace_progress(self, screen, pill):
    """How much is traced, for children who cannot read numbers yet: a bar that
    fills with colour and three stars that light up on the way."""
    done = min(1.0, sum(self.covered) / max(1, len(self.dots) * TRACE_DONE))
    bar = pygame.Rect(0, 0, min(260, PLAY_RECT.w - 80), 14)
    bar.midbottom = (pill.centerx, pill.top - 10)
    pygame.draw.rect(screen, (20, 24, 50), bar.inflate(6, 6), border_radius=10)
    if done > 0:
      fill = bar.copy()
      fill.w = max(bar.h, int(bar.w * done))
      pygame.draw.rect(screen, (90, 220, 120), fill, border_radius=7)
    pygame.draw.rect(screen, WHITE, bar.inflate(6, 6), 2, border_radius=10)
    for k in (1, 2, 3):
      c = (bar.x + bar.w * k / 3, bar.centery)
      if done >= k / 3 - 1e-6:
        self.draw_star(screen, c, 13)
      else:
        pts = []
        for i in range(10):
          rad = 13 if i % 2 == 0 else 13 * 0.45
          a = -math.pi / 2 + i * math.pi / 5
          pts.append((c[0] + rad * math.cos(a), c[1] + rad * math.sin(a)))
        pygame.draw.polygon(screen, (120, 130, 160), pts)
        pygame.draw.polygon(screen, WHITE, pts, 1)

  def draw_copy_guide(self, screen, now):
    """Draw it: the pencil draws the picture's own outline, one line after another,
    and the line stays (soft) for the child to draw on; the round pencil button
    where the jingle button sits shows it again."""
    left = (now - self.copy_at) * self.copy_speed
    tip = None
    for lp, closed in zip(self.copy_loops, self.copy_flags):
      pts = lp + lp[:1] if closed and len(lp) > 2 else lp
      drawn = [pts[0]]
      for a, b in zip(pts, pts[1:]):
        d = math.hypot(b[0] - a[0], b[1] - a[1])
        if left >= d:
          drawn.append(b)
          left -= d
          continue
        k = left / d if d else 0.0
        tip = (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)
        drawn.append(tip)
        break
      if len(drawn) > 1:
        pygame.draw.lines(screen, (40, 50, 80), False, drawn, 6)
        pygame.draw.lines(screen, (225, 230, 245), False, drawn, 3)
      if tip is not None:
        break
    if tip is not None:
      draw_pencil(screen, tip)
    else:
      c = JINGLE_CENTER                    # watch again
      pygame.draw.circle(screen, (40, 40, 80), (c[0], c[1] + 3), JINGLE_R)
      pygame.draw.circle(screen, (40, 160, 90), c, JINGLE_R)
      pygame.draw.circle(screen, WHITE, c, JINGLE_R, 2)
      draw_pencil(screen, (c[0] - 8, c[1] + 9), 0.5)

  def draw_free_drawing(self, screen, now):
    """The child's own picture in crayon colours, plus the crayon toolbar."""
    for colour, pts in self.drawing:
      if len(pts) > 1:
        pygame.draw.lines(screen, colour, False, pts, 6)
      for p in pts[:1] + pts[-1:]:
        pygame.draw.circle(screen, colour, (int(p[0]), int(p[1])), 3)
    if self.stage != "draw":
      return
    for i, colour in enumerate(CRAYONS):
      centre = (self.crayon_x(i), CRAYON_Y)
      r = CRAYON_R + (3 if i == self.crayon else 0)
      pygame.draw.circle(screen, colour, centre, r)
      pygame.draw.circle(screen, WHITE if i == self.crayon else (40, 40, 60),
                         centre, r, 3 if i == self.crayon else 1)
    if self.drawing:
      for rect, text, colour in ((UNDO_RECT, "Undo", (255, 100, 100)),
                                 (DONE_RECT, "Done!", (60, 180, 90))):
        pygame.draw.rect(screen, colour, rect, border_radius=10)
        pygame.draw.rect(screen, WHITE, rect, 2, border_radius=10)
        lbl = self.font.render(text, True, WHITE)
        screen.blit(lbl, lbl.get_rect(center=rect.center))
      if len(self.drawing) >= 2 and not self.user_points:
        r = 4 + 2 * math.sin(now * 5)    # gentle pulse: "you can finish now"
        pygame.draw.rect(screen, YELLOW, DONE_RECT.inflate(int(r), int(r)), 2,
                         border_radius=12)

  def draw_play_area(self, screen, now):
    screen.set_clip(PLAY_RECT)
    scenery.draw(screen, PLAY_RECT, self.theme.get("scene", "night"), now)
    if self.mode in ("quiz", "spell"):     # their white text needs a calmer backdrop
      veil = pygame.Surface(PLAY_RECT.size, pygame.SRCALPHA)
      veil.fill((*self.theme["bg"], 205))
      screen.blit(veil, PLAY_RECT.topleft)
    if self.mode == "quiz" and self.quiz:
      self.quiz.draw(screen, now)
      screen.set_clip(None)
      return
    if self.mode == "spell" and self.spell:
      self.spell.draw(screen, now)
      screen.set_clip(None)
      return
    if self.mode == "road" and self.road:
      self.road.draw(screen, now)
      screen.set_clip(None)
      return
    if self.mode == "maths" and self.maths:
      self.maths.draw(screen, now)
      screen.set_clip(None)
      return
    if self.mode == "topple" and self.topple:
      self.topple.fit(PLAY_RECT)
      self.topple.draw(screen, now)
      screen.set_clip(None)
      return

    for line in ([] if self.copy_loops and self.stage == "draw" else self.context):
      if len(line) > 1:
        pygame.draw.lines(screen, self.theme["context"], False, line, 1)

    # The real picture appears only at the end (a faint copy behind the dots
    # looked muddy over the scenery). "I made it!": the traced outline bursts with
    # golden light and the real picture springs out of it with a bounce.
    if self.pic_path and self.pic_rect and self.stage == "finished":
      x, y, w, h = self.pic_rect
      t = now - self.finished_at
      centre = (x + w / 2, y + h / 2)
      if t < 1.2:                                  # golden rays and a ring of light
        k = t / 1.2
        glow = pygame.Surface(screen.get_size(), pygame.SRCALPHA)
        reach = max(w, h) * (0.45 + 0.6 * k)
        for i in range(14):
          a = i * math.tau / 14 + t * 1.5
          tip = (centre[0] + math.cos(a) * reach, centre[1] + math.sin(a) * reach)
          side = (math.cos(a + 1.57) * 9, math.sin(a + 1.57) * 9)
          pygame.draw.polygon(glow, (255, 215, 80, int(150 * (1 - k))),
                              [(centre[0] + side[0], centre[1] + side[1]), tip,
                               (centre[0] - side[0], centre[1] - side[1])])
        pygame.draw.circle(glow, (255, 240, 160, int(200 * (1 - k))), (int(centre[0]), int(centre[1])),
                           int(reach * 0.8), max(2, int(10 * (1 - k))))
        screen.blit(glow, (0, 0))
      # a spring: from small, past full size, settling with a little wobble
      pop = 0.25 + 0.75 * (1.0 - math.exp(-5.0 * t) * math.cos(11.0 * t))
      size = (max(1, int(w * pop)), max(1, int(h * pop)))
      img = self.image(self.pic_path, (max(1, int(w)), max(1, int(h))))
      if img is not None:
        if abs(pop - 1.0) > 0.003:
          img = pygame.transform.smoothscale(img, size)
        else:
          img = img.copy()
        img.set_alpha(int(255 * min(1.0, 0.3 + t / 0.3)))
        screen.blit(img, img.get_rect(center=centre))
      if t < 4.0 and not self.is_custom:          # Sathi cheers beside the creation
        sathi.draw(screen, min(PLAY_RECT.right - 40, x + w + 6), min(PLAY_RECT.bottom - 90, y + h),
                   70, now, "cheer")

    if self.stage == "trace":
      # Dotted outline: faint guide line, hollow dots, filled when covered
      flags = getattr(self, "loop_closed", [])
      for k, lp_start in enumerate(self._loop_slices()):
        pts = self.dots[lp_start[0]:lp_start[1]]
        if len(pts) > 1:
          closed = flags[k] if k < len(flags) else self.closed
          pygame.draw.lines(screen, self.theme["guide"], closed, pts, 1)
      # Trail grows thicker and glows while a streak is going
      streak = self.streak.active(now)
      width = 4 + min(8, streak // 3)
      glow = pygame.Color(0)
      glow.hsva = ((now * 240) % 360, 80, 100, 100)
      for k, stroke in enumerate(self.strokes):
        if len(stroke) > 1:
          live = k == len(self.strokes) - 1 and streak >= 6
          if live:
            pulse = width + 6 + int(3 * math.sin(now * 14))
            pygame.draw.lines(screen, glow, False, stroke[-40:], pulse)
          pygame.draw.lines(screen, YELLOW, False, stroke, width if live else 4)
      first_open = next((i for i, c in enumerate(self.covered) if not c), None)
      rim = (40, 50, 80)
      for i, (dx, dy) in enumerate(self.dots):
        c = (int(dx), int(dy))
        if self.covered[i]:
          pygame.draw.circle(screen, WHITE, c, 8)
          pygame.draw.circle(screen, self.dot_color(i), c, 6)
        else:
          pygame.draw.circle(screen, rim, c, 6)
          pygame.draw.circle(screen, WHITE, c, 4)
      if first_open is not None and not any(self.covered):
        fx, fy = self.dots[first_open]
        r = 13 + 4 * math.sin(now * 6)
        pygame.draw.circle(screen, YELLOW, (int(fx), int(fy)), int(r), 2)

    if self.copy_loops and self.stage == "draw":
      self.draw_copy_guide(screen, now)
    if self.is_custom or self.copy_loops:
      self.draw_free_drawing(screen, now)

    if self.stage in ("ready", "running", "finished"):
      if self.stage == "ready" and self.dominoes and not self.dropping(now):
        r = 15 + 4 * math.sin(now * 6)
        pygame.draw.circle(screen, YELLOW, (int(self.dominoes[0].x),
                                            int(self.dominoes[0].y)), int(r), 2)
      letter = self.letter_surface() if not self.is_custom else None
      for d in self.dominoes:
        t = (now - d.drop_at) / DROP_TIME
        if t < 0:
          continue                     # not dropped yet
        lift = (1 - min(1.0, t)) ** 2 * DROP_HEIGHT
        surf = domino_tile(d.color, plain=letter is not None)
        fall = d.current_angle / (math.pi / 2)     # 0 standing .. 1 lying down
        if fall > 0:                               # it tips over: flatter, with a shadow
          surf = toppled_tile(surf, fall)
        # a standing domino stands across the line with a gap to the next one, like a
        # real domino run; as it falls it turns to lie along the line on the next one
        rotated = pygame.transform.rotate(
            surf, math.degrees(-(d.angle + math.pi / 2 + d.current_angle)))
        alpha = int(255 * min(1.0, 0.3 + t))     # still bright at the end: they made it happen
        since = now - getattr(d, "fall_at", -9) if d.state != "standing" else -1
        if 0 <= since < 0.2 and self.stage == "running":   # flash as it is pushed
          pygame.draw.circle(screen, WHITE, (int(d.x), int(d.y)), int(16 - 40 * since))
        rotated.set_alpha(alpha)
        screen.blit(rotated, rotated.get_rect(center=(d.x, d.y - lift)))
        if letter is not None:
          letter.set_alpha(alpha)
          screen.blit(letter, letter.get_rect(center=(d.x, d.y - lift)))
      if (self.is_custom or self.copy_loops) and self.stage == "finished":
        self.draw_free_drawing(screen, now)   # the child's picture is the reward
      if self.show and self.stage == "running":   # suspense: the teetering domino glows
        front = next((d for d in reversed(self.dominoes) if d.state == "falling"), None)
        if front is not None and self.show.is_twist(self.dominoes.index(front)):
          r = 18 + 6 * math.sin(now * 12)
          pygame.draw.circle(screen, YELLOW, (int(front.x), int(front.y)), int(r), 3)
      if self.show:
        self.show.draw(screen, now)
    self.draw_whats_next(screen, now)

    if self.story:                      # story progress dots
      steps = len(self.story["story"]["steps"])
      for k in range(steps):
        cx = PLAY_RECT.centerx + (k - (steps - 1) / 2) * 22
        done = k < self.story["step"] or (k == self.story["step"] and self.stage == "finished")
        pygame.draw.circle(screen, YELLOW if done else HINT, (int(cx), PLAY_RECT.top + 14),
                           7 if k == self.story["step"] else 5, 0 if done else 2)

    self.draw_places(screen, now)
    if not self.celebration:
      self.draw_watch_button(screen, now)
      self.draw_sing_button(screen, now)
      self.draw_showcase(screen, now)
    self.draw_praise(screen, now)
    self.draw_jingle_button(screen, now)
    hint = self.hint_text()
    streak = self.streak.active(now) if self.stage == "trace" else 0
    if hint:
      self.draw_hint_symbol(screen, now, streak)
    howto.draw_idle_hand(self, screen, now, PLAY_RECT)
    if packs.busy():                           # a class pack is downloading: a spinning rainbow ring
      cx, cy, r = PLAY_RECT.centerx, PLAY_RECT.y + 40, 18
      for k in range(8):
        a = now * 5 + k * math.pi / 4
        col = ((233, 69, 96), (255, 138, 30), (255, 210, 30), (60, 207, 78),
               (31, 181, 255), (79, 107, 255), (180, 77, 255), (255, 255, 255))[k]
        pygame.draw.circle(screen, col, (int(cx + r * math.cos(a)), int(cy + r * math.sin(a))), 4 + (k == 0) * 2)
    if self.sing:
      self.sing.draw(screen, PLAY_RECT, now)
    if self.celebration:
      self.draw_celebration(screen, now)
    self.draw_cap_won(screen, now)
    if self.spell_card:
      self.draw_spell_card(screen, now)
    screen.set_clip(None)

  # ------------------------------------------------------------ tap-only extras
  def draw_showcase(self, screen, now):
    """Hear it / Spell it tabs under a picture brought to life."""
    for rect, act, label in self.showcase_rects():
      col = {"hear": (60, 160, 230), "draw": (40, 160, 90),
             "photo": (230, 120, 40)}.get(act, (150, 90, 220))
      pygame.draw.rect(screen, col, rect, border_radius=21)
      pygame.draw.rect(screen, WHITE, rect, 2, border_radius=21)
      cx, cy = rect.centerx, rect.centery        # icon only, no words
      if act == "hear":                          # a little speaker
        pygame.draw.polygon(screen, WHITE, [(cx - 8, cy - 5), (cx - 3, cy - 5), (cx + 4, cy - 11),
                                            (cx + 4, cy + 11), (cx - 3, cy + 5), (cx - 8, cy + 5)])
        pygame.draw.arc(screen, WHITE, (cx + 2, cy - 8, 12, 16), -1.0, 1.0, 2)
      elif act == "draw":                        # a little pencil
        draw_pencil(screen, (cx - 9, cy + 10), 0.55)
      elif act == "photo":                       # a little camera
        pygame.draw.rect(screen, WHITE, (cx - 11, cy - 6, 22, 15), border_radius=3)
        pygame.draw.rect(screen, WHITE, (cx - 5, cy - 9, 9, 4))
        pygame.draw.circle(screen, (230, 120, 40), (cx, cy + 1), 5)
        pygame.draw.circle(screen, WHITE, (cx, cy + 1), 2)
      else:
        lbl = self.small_font.render("ABC", True, WHITE)
        screen.blit(lbl, lbl.get_rect(center=(cx, cy)))

  def draw_hint_symbol(self, screen, now, streak):
    """The pill under the picture, as pictures: a hand tracing (with the progress bar and stars), a hand tapping
    when the dominoes are ready to push, falling dominoes while they drop, and a star count for a streak."""
    box = pygame.Rect(0, 0, 210, 44)
    box.center = (PLAY_RECT.centerx, PLAY_RECT.bottom - 22)
    pill = pygame.Surface(box.size, pygame.SRCALPHA)
    pygame.draw.rect(pill, (20, 24, 50, 170), pill.get_rect(), border_radius=box.h // 2)
    screen.blit(pill, box.topleft)
    cx, cy = box.center
    if self.stage == "trace":
      howto.draw_hand(screen, (box.x + 26, box.y + 4 + 3 * math.sin(now * 5)), scale=0.5)
      if self.dots:
        self.draw_trace_progress(screen, box)
    elif self.stage == "ready" and self.dropping():
      for k in range(5):                        # dominoes falling into place
        y = cy - 10 + ((now * 40 + k * 9) % 18)
        pygame.draw.rect(screen, (250, 250, 245), (cx - 50 + k * 22, int(y), 9, 18), border_radius=2)
    elif self.stage == "ready":
      howto.draw_hand(screen, (cx, box.y + 6), pressed=int(now * 2) % 2 == 0, scale=0.5)
    else:
      for k in range(3):
        self.draw_star_shape(screen, (cx - 40 + k * 40, cy), 12, (255, 215, 64))
    if streak >= 5:                              # a streak: a big star with the count
      self.draw_star_shape(screen, (box.right + 26, cy), 18, (255, 215, 64))
      n = self.small_font.render(str(streak), True, (60, 40, 10))
      screen.blit(n, n.get_rect(center=(box.right + 26, cy + 1)))

  @staticmethod
  def draw_star_shape(screen, centre, r, colour):
    pts = []
    for i in range(10):
      a = -math.pi / 2 + i * math.pi / 5
      rr = r if i % 2 == 0 else r * 0.45
      pts.append((centre[0] + rr * math.cos(a), centre[1] + rr * math.sin(a)))
    pygame.draw.polygon(screen, colour, pts)
    pygame.draw.polygon(screen, (255, 255, 255), pts, 2)

  def draw_praise(self, screen, now):
    """"Well done! Cat!" shown big for a few seconds after a finish (not said)."""
    if self.stage != "finished" or not self.praise_line:
      return
    t = now - self.finished_at
    if t > 4.0:
      return
    grow = min(1.0, t / 0.3)
    if symbols.ONLY:                           # three stars pop up one after another: well done!
      for k in range(3):
        g = min(1.0, max(0.0, (t - k * 0.18) / 0.3))
        if g > 0:
          symbols.star(screen, (PLAY_RECT.centerx + (k - 1) * 70, PLAY_RECT.y + 50 - (12 if k == 1 else 0)),
                       int((30 if k == 1 else 24) * (g + 0.25 * math.sin(min(1.0, g) * math.pi))))
      return
    lbl = fit_label(self.font_at(34), self.praise_line, YELLOW, PLAY_RECT.w - 60)
    if grow < 1.0:
      lbl = pygame.transform.smoothscale(
          lbl, (max(1, int(lbl.get_width() * grow)), max(1, int(lbl.get_height() * grow))))
    box = lbl.get_rect(midtop=(PLAY_RECT.centerx, PLAY_RECT.y + 14)).inflate(30, 12)
    pill = pygame.Surface(box.size, pygame.SRCALPHA)
    pygame.draw.rect(pill, (20, 24, 50, 200), pill.get_rect(), border_radius=box.h // 2)
    screen.blit(pill, box.topleft)
    pygame.draw.rect(screen, YELLOW, box, 2, border_radius=box.h // 2)
    screen.blit(lbl, lbl.get_rect(center=box.center))

  def draw_sing_button(self, screen, now):
    """A finished rhyme waits for this button: it never starts singing by itself."""
    rect = self.sing_rect()
    if rect is None:
      return
    grow = int(3 * (1 + math.sin(now * 5)))
    pygame.draw.rect(screen, YELLOW, rect.inflate(6 + grow, 6 + grow), 3, border_radius=26)
    pygame.draw.rect(screen, (40, 170, 90), rect, border_radius=23)
    pygame.draw.rect(screen, WHITE, rect, 2, border_radius=23)
    cx, cy = rect.x + 28, rect.centery
    pygame.draw.circle(screen, WHITE, (cx, cy), 15)
    pygame.draw.polygon(screen, (40, 170, 90), [(cx - 5, cy - 8), (cx - 5, cy + 8), (cx + 9, cy)])
    lbl = fit_label(self.hint_font, "Sing along!", WHITE, rect.w - 64)
    screen.blit(lbl, lbl.get_rect(midleft=(rect.x + 52, rect.centery)))

  def draw_jingle_button(self, screen, now):
    """The ♪ button: a different little tune each time it is tapped."""
    if self.mode != "trace" or self.stage == "draw":
      return
    c = JINGLE_CENTER
    playing = now - getattr(self, "jingle_at", -9) < 1.6
    r = JINGLE_R + (int(3 * abs(math.sin(now * 10))) if playing else 0)
    pygame.draw.circle(screen, (40, 40, 80), (c[0], c[1] + 3), r)
    pygame.draw.circle(screen, (170, 90, 230), c, r)
    pygame.draw.circle(screen, WHITE, c, r, 2)
    singalong.note(screen, (c[0] - 2, c[1] - 1), WHITE)

  def spell_card_rects(self):
    """The ABC card and its two buttons: (card, say, spell)."""
    card = pygame.Rect(0, 0, min(PLAY_RECT.w - 30, 640), min(PLAY_RECT.h - 40, 300))
    card.center = PLAY_RECT.center
    bw = min(200, (card.w - 60) // 2)
    say = pygame.Rect(0, 0, bw, 48)
    spell = say.copy()
    say.bottomright = (card.centerx - 10, card.bottom - 16)
    spell.bottomleft = (card.centerx + 10, card.bottom - 16)
    return card, say, spell

  def spell_card_hit(self, pos):
    card, say, spell = self.spell_card_rects()
    if say.collidepoint(pos):
      return "say"
    if spell.collidepoint(pos):
      return "spell"
    close = pygame.Rect(card.right - 46, card.y + 6, 40, 40)
    if card.collidepoint(pos) and not close.collidepoint(pos):
      return "card"
    return None

  def draw_spell_card(self, screen, now):
    """Spelling and saying the name, only when a child taps ABC: big letter tiles
    light up one by one as each letter is said; Say it / Spell it say it again."""
    card, say, spell = self.spell_card_rects()
    glass = pygame.Surface(card.size, pygame.SRCALPHA)
    pygame.draw.rect(glass, (25, 30, 70, 238), glass.get_rect(), border_radius=22)
    screen.blit(glass, card.topleft)
    pygame.draw.rect(screen, YELLOW, card, 3, border_radius=22)
    head = self.font_at(20).render("Spell it and say it", True, YELLOW)
    screen.blit(head, head.get_rect(midtop=(card.centerx, card.y + 12)))
    x0 = card.right - 26
    for a, b in (((-8, -8), (8, 8)), ((-8, 8), (8, -8))):          # close (x)
      pygame.draw.line(screen, WHITE, (x0 + a[0], card.y + 26 + a[1]),
                       (x0 + b[0], card.y + 26 + b[1]), 3)
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    mid = pygame.Rect(card.x + 20, card.y + 46, card.w - 40, say.top - card.y - 60)
    if item.get("word_img"):                         # Hindi / Bangla: the word picture
      img = self.image(os.path.join(hub.HERE, item["word_img"]))
      if img is not None:
        s = min(mid.w / img.get_width(), mid.h / img.get_height())
        img = self.image(os.path.join(hub.HERE, item["word_img"]),
                         (max(1, int(img.get_width() * s)), max(1, int(img.get_height() * s))))
        screen.blit(img, img.get_rect(center=mid.center))
    else:
      name = item.get("tile_text") or self.puzzle
      letters = [ch for ch in name if ch != " "]
      spelled = now - self.spelling_at
      active = int((spelled - SPELL_START) // SPELL_STEP)
      gap = 6
      units = sum(0.5 if ch == " " else 1 for ch in name)
      tw = int(min(70, (mid.w - gap * (len(name) - 1)) / max(1, units)))
      th = min(int(tw * 1.3), mid.h - 30)
      total = sum(tw // 2 if ch == " " else tw for ch in name) + gap * (len(name) - 1)
      x = mid.centerx - total / 2
      y = mid.centery - th / 2 - 8
      k = 0
      for i, ch in enumerate(name):
        if ch == " ":
          x += tw // 2 + gap
          continue
        lit = spelled >= SPELL_START and (k == active or len(letters) <= active < len(letters) + 2)
        col = pygame.Color(0)
        col.hsva = ((i * 360 // max(1, len(name))) % 360, 85, 88, 100)
        r = pygame.Rect(int(x), int(y - (8 if lit else 0)), tw, th)
        pygame.draw.rect(screen, (30, 30, 60), r.move(0, 4), border_radius=10)
        pygame.draw.rect(screen, YELLOW if lit else col, r, border_radius=10)
        pygame.draw.rect(screen, WHITE, r, 2, border_radius=10)
        lbl = self.render_char(ch, max(14, int(th * 0.72)), (40, 40, 80) if lit else WHITE)
        screen.blit(lbl, lbl.get_rect(center=r.center))
        x += tw + gap
        k += 1
      count = fit_label(self.font, f"{len(letters)} letters", HINT, mid.w)
      screen.blit(count, count.get_rect(midtop=(mid.centerx, int(y + th + 12))))
    for rect, text, colour in ((say, "Say it", (60, 160, 255)), (spell, "Spell it", (255, 150, 60))):
      pygame.draw.rect(screen, colour, rect, border_radius=24)
      pygame.draw.rect(screen, WHITE, rect, 2, border_radius=24)
      lbl = fit_label(self.hint_font, text, WHITE, rect.w - 16)
      screen.blit(lbl, lbl.get_rect(center=rect.center))

  def draw_cap_won(self, screen, now):
    """A big rainbow cap pops up when a new subject adds a colour."""
    won = getattr(self, "cap_won", None)
    if won is None or now - won > 4.0:
      return
    t = now - won
    grow = min(1.0, t / 0.4)
    r = int(64 * grow)
    if r < 4:
      return
    c = (PLAY_RECT.centerx, PLAY_RECT.y + 120)
    world.WorldScene.draw_rainbow_cap(screen, (c[0], c[1] + r * 0.2), r / 1.12,
                                      (c[0] + r * 1.4, c[1] + r * 0.2), self.cap_colours())
    count = self.cap_count()
    lbl = fit_label(self.big_font, f"Rainbow cap {min(count, 7)} / 7", YELLOW, PLAY_RECT.w - 40)
    screen.blit(lbl, lbl.get_rect(center=(c[0], c[1] + r * 0.2 + 30)))

  def sticker_picture(self, sid, size):
    """Category stickers show the category's first picture; story stickers
    show the story's first picture."""
    if sid.startswith("c:"):
      cat = sid[2:]
      if cat in hub.CATEGORIES_HUB:
        first = next(iter(hub.CATEGORIES_HUB[cat]))
        return self.thumb(first, cat, size)
    if sid.startswith("s:"):
      story = stories.find(sid[2:])
      if story:
        cat, name, _ = story["steps"][0]
        return self.thumb(name, cat, size)
    return None

  def draw_celebration(self, screen, now):
    sid, start = self.celebration
    t = now - start
    grow = min(1.0, t / 0.35)
    radius = int(70 * (0.3 + 0.7 * grow) * (1 + 0.05 * math.sin(now * 8)))
    cx, cy = PLAY_RECT.centerx, PLAY_RECT.centery - 30
    shade = pygame.Surface(PLAY_RECT.size, pygame.SRCALPHA)
    shade.fill((0, 0, 0, 110))
    screen.blit(shade, PLAY_RECT.topleft)
    fun.draw_sticker(screen, (cx, cy), radius, sid, True, self.big_font,
                     self.sticker_picture(sid, int(radius * 1.0)), t=now * 0.6)
    for text, y, font in (("New sticker!", cy - radius - 26, self.big_font),
                          (fun.sticker_title(sid), cy + radius + 22, self.hint_font)):
      if symbols.ONLY:
        break
      surf = font.render(text, True, YELLOW)
      screen.blit(surf, surf.get_rect(center=(cx, y)))

  def draw_shelf(self, screen, now):
    """Sticker shelf: every sticker, earned ones in colour."""
    width = screen.get_width()           # the shelf panel is 450 wide
    area = pygame.Rect(0, 0, width, STICKER_RECT.top - 6)
    shade = pygame.Surface(area.size, pygame.SRCALPHA)
    shade.fill((*self.theme["bg"], 240))
    screen.blit(shade, area.topleft)
    if symbols.ONLY:                           # stars earned / all, as a big star and numbers
      symbols.star(screen, (width / 2 - 60, 34), 18)
      n = self.big_font.render(f"{len(self.progress.data['stickers'])}", True, YELLOW)
      screen.blit(n, n.get_rect(midleft=(width / 2 - 34, 34)))
    else:
      title = self.big_font.render(f"{self.progress.data['name']}'s Stickers", True, YELLOW)
      screen.blit(title, title.get_rect(center=(width / 2, 24)))
      info = (f"Traced {self.progress.count()} of {self.progress.total}   "
              f"Best streak {self.progress.data.get('best_streak', 0)}")
      surf = self.font.render(info, True, CYAN)
      screen.blit(surf, surf.get_rect(center=(width / 2, 50)))
    cats = [c for cs in self.subjects.values() for c in cs]
    stickers = self.progress.all_stickers(cats, [s["id"] for s in stories.STORIES])
    cols = 8
    cw = width / cols
    ch = (area.h - 90) / math.ceil(len(stickers) / cols)
    r = int(min(cw, ch) * 0.33)
    for i, sid in enumerate(stickers):
      row, col = divmod(i, cols)
      cx = int(col * cw + cw / 2)
      cy = int(70 + row * ch + r)
      earned = self.progress.has(sid)
      fun.draw_sticker(screen, (cx, cy), r, sid, earned, self.small_font,
                       self.sticker_picture(sid, int(r * 1.0)) if earned else None)
      if sid.startswith("c:"):
        size = len(hub.CATEGORIES_HUB.get(sid[2:], {}))
        label = sid[2:] if earned else fun.sticker_need(sid, self.progress.total, size)
      else:
        label = (fun.sticker_title(sid) if earned
                 else fun.sticker_need(sid, self.progress.total))
      if symbols.ONLY:                         # the badge says it; no caption
        continue
      lbl = fit_label(self.small_font, label, WHITE if earned else HINT, cw - 2)
      screen.blit(lbl, lbl.get_rect(center=(cx, cy + r + 7)))
    if not symbols.ONLY:
      tip = self.small_font.render("Tap anywhere to go back", True, HINT)
      screen.blit(tip, tip.get_rect(center=(width / 2, area.bottom - 10)))

  def _loop_slices(self):
    out, start = [], 0
    for lp in getattr(self, "loops", []):
      out.append((start, start + len(lp)))
      start += len(lp)
    return out

  def draw_description(self, screen):
    """Story sentence, or the second-language name and the description."""
    item = hub.CATEGORIES_HUB[self.cat][self.puzzle]
    desc_w = min(PANEL_W - 24, WIDTH - 2 * (TOWN_BTN.right + 8))
    if self.story and self.mode == "trace":
      lines = wrap_text(self.font, self.story_line(), desc_w)[:2]
      for n, line in enumerate(lines):
        surf = self.font.render(line, True, YELLOW)
        screen.blit(surf, surf.get_rect(midtop=(BANNER_RECT.centerx, DESC_Y + n * 17)))
      return
    if self.banner_override:              # spelling: don't give the word away
      return
    native = None if item.get("word_img") else self.native_image(self.cat, self.puzzle, 18)
    desc = item["desc"]
    if native is not None:                      # the word in Hindi / Bangla: part of the lesson
      screen.blit(native, native.get_rect(midtop=(BANNER_RECT.centerx, DESC_Y)))
    # no description sentence under the name (user: symbols only, no write-up); `desc` is still spoken on tap
    del desc

  def draw(self, screen):
    """Game screen: the play area fills the screen under a slim top row
    (menu button, name, Next). The menu and other panels open on top."""
    now = time.time()
    if self.intro:
      self.intro.draw(screen, now)
      return
    if self.in_world:
      self.world.draw(screen) if not IS_WEB else screen.fill(self.theme["bg"])   # the web game is 3D only: no pygame town behind menus
    else:
      screen.fill(self.theme["bg"])
      self.draw_play_area(screen, now)
      self.draw_top_row(screen, now)
    self.particles.draw(screen, self.hint_font)
    if self.overlay:
      dim = pygame.Surface(screen.get_size(), pygame.SRCALPHA)
      dim.fill((0, 0, 0, 150))
      screen.blit(dim, (0, 0))
      panel = screen.subsurface(pygame.Rect(NAV_X, NAV_Y, PANEL_W, PANEL_H))
      if self.overlay == "nav":
        self.draw_menu_panel(panel, now)
      elif self.overlay == "shelf":
        self.draw_shelf(panel, now)
      else:
        screens.PANELS[self.overlay].draw(panel, self, now)

  def draw_top_row(self, screen, now):
    tm = self.theme
    screen.blit(top_band(tm, WIDTH), (0, 0))
    pygame.draw.line(screen, tm["panel"], (0, TOP_H - 1), (WIDTH, TOP_H - 1), 2)
    self.draw_title_banner(screen, now)
    self.draw_description(screen)
    # Menu button: three bars; it glows for a while so children find it
    pulse = now - self.started_at < 12 and not self.overlay
    pygame.draw.rect(screen, (70, 130, 230), MENU_BTN, border_radius=12)
    pygame.draw.rect(screen, YELLOW if pulse and int(now * 2) % 2 else WHITE, MENU_BTN, 2,
                     border_radius=12)
    for k in range(3):
      y = MENU_BTN.centery - 12 + k * 12
      pygame.draw.line(screen, WHITE, (MENU_BTN.x + 14, y), (MENU_BTN.right - 14, y), 4)
    # Town: a little house - back to Wonder Town. (The domino playground and the
    # "How to play" guide are rows of the Games menu, so small children see only
    # Menu, Home, Next and the speaker here.)
    pygame.draw.rect(screen, (240, 140, 40), TOWN_BTN, border_radius=12)
    pygame.draw.rect(screen, WHITE, TOWN_BTN, 2, border_radius=12)
    cx, cy = TOWN_BTN.center
    pygame.draw.polygon(screen, WHITE, [(cx - 14, cy - 1), (cx, cy - 13), (cx + 14, cy - 1)])
    pygame.draw.rect(screen, WHITE, (cx - 10, cy - 1, 20, 14))
    pygame.draw.rect(screen, (240, 140, 40), (cx - 3, cy + 4, 6, 9))
    # Next: an arrow to the next picture
    pygame.draw.rect(screen, (60, 180, 90), NEXT_BTN, border_radius=12)
    pygame.draw.rect(screen, WHITE, NEXT_BTN, 2, border_radius=12)
    cx, cy = NEXT_BTN.center
    pygame.draw.polygon(screen, WHITE, [(cx - 8, cy - 13), (cx + 10, cy), (cx - 8, cy + 13)])
    if self.show_lang_tabs():
      self.draw_lang_tabs(screen, self.lang_tab_rects())

  def show_lang_tabs(self):
    """The top row shows the language tabs where it has no description to show."""
    return bool(self.banner_override) and not self.story

  def lang_tab_rects(self, box=None):
    """English | हिंदी | বাংলা: three tabs (in the top row, or in `box`)."""
    if box is None:
      box = pygame.Rect(0, 0, min(300, WIDTH - 2 * (TOWN_BTN.right + 8)), 32)
      box.midtop = (BANNER_RECT.centerx, DESC_Y + 2)
    tw = (box.w - 8) // 3
    return [(pygame.Rect(box.x + k * (tw + 4), box.y, tw, box.h), code)
            for k, code in enumerate(("en", "hi", "bn"))]

  def lang_tab_hit(self, pos, box=None):
    for r, code in self.lang_tab_rects(box):
      if r.inflate(4, 8).collidepoint(pos):
        return code
    return None

  def native_tab(self, name, rect, colour):
    """A menu tab's name in Hindi / Bangla mode (स्वर, স্বরবর্ণ ...), fitted to the tab."""
    img = self.native_name(name, max(12, rect.h - 13), tuple(colour))
    if img is not None and img.get_width() > rect.w - 4:
      img = pygame.transform.smoothscale(img, (rect.w - 4, max(1, img.get_height() * (rect.w - 4) // img.get_width())))
    return img

  def draw_lang_tabs(self, screen, tabs):
    """Each language named in its own letters; the chosen one is lit up."""
    cache = self.__dict__.setdefault("_tab_imgs", {})
    for r, code in tabs:
      on = code == self.lang
      pygame.draw.rect(screen, YELLOW if on else (60, 80, 140), r, border_radius=r.h // 2)
      pygame.draw.rect(screen, WHITE, r, 3 if on else 2, border_radius=r.h // 2)
      key = (code, r.h, on)
      if key not in cache:
        img = None
        if code == "en":
          img = self.font_at(max(12, r.h - 14)).render("English", True, (40, 40, 70) if on else WHITE)
        else:
          try:
            raw = pygame.image.load(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                 "labels", f"tab_{code}.png")).convert_alpha()
            h = r.h - 6
            img = pygame.transform.smoothscale(raw, (max(1, raw.get_width() * h // raw.get_height()), h))
          except Exception:
            img = self.font_at(max(12, r.h - 14)).render({"hi": "Hindi", "bn": "Bangla"}[code], True, WHITE)
        if img.get_width() > r.w - 8:
          img = pygame.transform.smoothscale(img, (r.w - 8, img.get_height() * (r.w - 8) // img.get_width()))
        cache[key] = img
      screen.blit(cache[key], cache[key].get_rect(center=r.center))

  def draw_menu_panel(self, screen, now):
    """The menu: subjects, categories, every picture of the category and the
    Reset / Games / Stickers / Theme / Play buttons."""
    tm = self.theme
    bg = tm["bg"]
    screen.fill(bg)
    pygame.draw.rect(screen, tm["panel"], screen.get_rect(), 3)

    # Subjects (top row) and their categories (second row)
    pygame.draw.rect(screen, tm["panel"], SUBJ_RECT.union(CAT_RECT))
    for rect, s in self.subject_rects():
      if s in ("<", ">"):                       # page through the subjects
        pygame.draw.rect(screen, PURPLE, rect, border_radius=8)
        lbl = self.cat_font.render(s, True, WHITE)
        screen.blit(lbl, lbl.get_rect(center=rect.center))
        continue
      active = s == self.subject
      pygame.draw.rect(screen, YELLOW if active else tm["subject"], rect, border_radius=8)
      cats = self.subjects.get(s) or []
      pic = self.tab_picture(cats[0], rect) if (symbols.ONLY and cats) else None
      lbl = pic or (self.native_tab(s, rect, bg if active else WHITE)
                    or fit_label(self.cat_font, s, bg if active else WHITE, rect.w - 4))
      screen.blit(lbl, lbl.get_rect(center=rect.center))
    for rect, c in self.category_rects():
      if c in ("<", ">"):                       # page through a long row
        pygame.draw.rect(screen, PURPLE, rect, border_radius=8)
        lbl = self.cat_font.render(c, True, WHITE)
        screen.blit(lbl, lbl.get_rect(center=rect.center))
        continue
      active = c == self.cat
      pygame.draw.rect(screen, CYAN if active else tm["cat"], rect, border_radius=8)
      pic = self.tab_picture(c, rect) if symbols.ONLY else None
      lbl = pic or (self.native_tab(c, rect, bg if active else WHITE)
                    or fit_label(self.cat_font, c, bg if active else WHITE, rect.w - 4))
      screen.blit(lbl, lbl.get_rect(center=rect.center))
      if self.progress.has(f"c:{c}"):          # whole category finished
        pygame.draw.circle(screen, GOLD, (rect.right - 5, rect.top + 5), 5)

    # Item bank: picture + name, with "More" when a category has many items
    pygame.draw.rect(screen, tm["panel"], BANK_RECT)
    cells, pages = self.bank_cells()
    for rect, name in cells:
      if name == ">more":
        pygame.draw.rect(screen, PURPLE, rect, border_radius=8)
        if symbols.ONLY:                         # an arrow and a dot per page (this page lit)
          symbols.draw(screen, "next", rect.inflate(0, -18).move(0, -6))
          for k in range(pages):
            x = rect.centerx + (k - (pages - 1) / 2) * 10
            pygame.draw.circle(screen, YELLOW if k == self.page else WHITE, (int(x), rect.bottom - 10), 3)
          continue
        lbl = self.hint_font.render("More >", True, WHITE)
        screen.blit(lbl, lbl.get_rect(center=(rect.centerx, rect.centery - 8)))
        pg = self.small_font.render(f"{self.page + 1} / {pages}", True, WHITE)
        screen.blit(pg, pg.get_rect(center=(rect.centerx, rect.centery + 14)))
        continue
      active = self.puzzle == name and self.mode == "trace"  # no hints in quiz/spell
      pygame.draw.rect(screen, CYAN if active else tm["cell"], rect, border_radius=8)
      th = self.thumb(name, self.cat, rect.h - (8 if symbols.ONLY else 24))
      if th is not None:
        screen.blit(th, th.get_rect(center=(rect.centerx, rect.centery if symbols.ONLY else rect.y + (rect.h - 18) / 2 + 2)))
      elif name == CUSTOM:
        screen.blit(screens.crayon_icon(rect.h - 30),
                    screens.crayon_icon(rect.h - 30).get_rect(
                        center=(rect.centerx, rect.y + (rect.h - 18) / 2 + 2)))
      if not symbols.ONLY:                       # the picture says it; no name under it
        label = hub.CATEGORIES_HUB[self.cat][name].get("label", name)  # Hindi: "ka"
        lbl = fit_label(self.small_font, label, bg if active else WHITE, rect.w - 6)
        screen.blit(lbl, lbl.get_rect(center=(rect.centerx, rect.bottom - 10)))
      if self.progress.is_done(self.key(name)):  # gold star = already traced
        self.draw_star(screen, (rect.right - 10, rect.top + 10), 8)
      if self.mode == "trace" and hub.video_for(self.cat, name):
        bx, by = rect.x + 11, rect.y + 11          # red badge: has a real video
        pygame.draw.circle(screen, (230, 40, 50), (bx, by), 8)
        pygame.draw.polygon(screen, WHITE, [(bx - 3, by - 4), (bx - 3, by + 4), (bx + 5, by)])

    # Reset, Games, Stickers, Theme and Play (back to the game)
    pygame.draw.rect(screen, (255, 100, 100), RESET_RECT, border_radius=10)
    pygame.draw.rect(screen, (70, 130, 230), GAMES_RECT, border_radius=10)
    if symbols.ONLY:
      symbols.draw(screen, "reset", RESET_RECT)
      symbols.draw(screen, "games", GAMES_RECT)
    else:
      lbl = self.hint_font.render("Reset", True, WHITE)
      screen.blit(lbl, lbl.get_rect(center=RESET_RECT.center))
      lbl = self.hint_font.render("Games", True, WHITE)
      screen.blit(lbl, lbl.get_rect(center=GAMES_RECT.center))
    pygame.draw.rect(screen, (230, 160, 20), STICKER_RECT, border_radius=10)
    self.draw_star(screen, (STICKER_RECT.x + 18, STICKER_RECT.centery), 11)
    lbl = self.hint_font.render(str(len(self.progress.data["stickers"])), True, WHITE)
    screen.blit(lbl, lbl.get_rect(midleft=(STICKER_RECT.x + 33, STICKER_RECT.centery)))
    pygame.draw.rect(screen, tm["subject"], THEME_RECT, border_radius=10)
    for k, col in enumerate(((255, 90, 120), (255, 204, 0), (0, 220, 180), (120, 160, 255))):
      a = k * math.pi / 2 + now * 0.5
      pygame.draw.circle(screen, col, (int(THEME_RECT.centerx + 9 * math.cos(a)),
                                       int(THEME_RECT.centery + 9 * math.sin(a))), 6)
    pygame.draw.rect(screen, (60, 180, 90), NEXT_RECT, border_radius=10)
    if symbols.ONLY:
      symbols.draw(screen, "play", NEXT_RECT)
    else:
      lbl = self.hint_font.render("Play >", True, WHITE)
      screen.blit(lbl, lbl.get_rect(center=NEXT_RECT.center))

  def tab_picture(self, cat, rect):
    """A subject / category tab as a picture: the category's first picture, fitted into the tab."""
    items = list(hub.CATEGORIES_HUB.get(cat, {}).keys())
    return self.thumb(items[0], cat, rect.h - 6) if items else None

  def draw_star(self, screen, center, r):
    cx, cy = center
    pts = []
    for i in range(10):
      rad = r if i % 2 == 0 else r * 0.45
      a = -math.pi / 2 + i * math.pi / 5
      pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    pygame.draw.polygon(screen, GOLD, pts)
    pygame.draw.polygon(screen, (150, 100, 0), pts, 1)
