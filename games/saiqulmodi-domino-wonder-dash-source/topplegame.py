"""
Domino Game - Domino Playground (topplegame.py)
Children lay their own line of dominoes with a finger, tap Topple! and watch the chain
reaction run to the goal balloon, which pops. Everything sits inside the game's play area.
"""
import math
import time
import pygame

BTN_H = 44
SPACING = 26                # px between dominoes, so each one reaches the next


class ToppleTile:
    def __init__(self, x, y, angle=0.0):
        self.x = float(x)
        self.y = float(y)
        self.angle = angle        # path orientation angle (radians)
        self.tilt = 0.0           # 0.0 (upright) -> 1.0 (fully toppled)
        self.toppling = False
        self.toppled = False
        self.w = 8               # half a real domino's width (user, 27-Oct)
        self.h = 42


class ToppleMode:
    def __init__(self, game):
        self.g = game
        self.tiles = []
        self.running = False
        self.cleared_at = 0
        self.popped = False
        self.pop_time = 0
        self.area = pygame.Rect(0, 0, 450, 688)
        self.target_pos = (0, 0)
        self.reset_default_track()

    # --- layout -----------------------------------------------------------------
    def fit(self, area):
        """Follows the play area; a new screen shape lays out a fresh starter track."""
        if area != self.area:
            self.area = pygame.Rect(area)
            self.reset_default_track()

    def buttons(self):
        a = self.area
        w = min(130, (a.w - 40) // 3)
        x = a.centerx - (3 * w + 20) // 2
        y = a.y + 10
        return [(pygame.Rect(x + k * (w + 10), y, w, BTN_H), key, label, col)
                for k, (key, label, col) in enumerate((("go", "Topple!", (60, 180, 90)),
                                                        ("reset", "Again", (70, 120, 200)),
                                                        ("clear", "Clear", (200, 80, 80))))]

    def floor_top(self):
        return self.area.y + 10 + BTN_H + 40      # under the buttons and the tip line

    def reset_default_track(self):
        """Creates an initial inviting S-curve of dominoes ready to topple."""
        self.tiles = []
        self.running = False
        self.popped = False
        a = self.area
        top, bottom = self.floor_top() + 30, a.bottom - 80
        pts = []
        n = 18
        for i in range(n):
            t = i / (n - 1)
            pts.append((a.x + a.w * (0.18 + 0.64 * (0.5 + 0.5 * math.sin(t * math.pi * 1.6 - math.pi / 2))),
                        top + (bottom - top) * t))
        for i, (x, y) in enumerate(pts):
            nx, ny = pts[min(i + 1, n - 1)] if i < n - 1 else (2 * x - pts[i - 1][0], 2 * y - pts[i - 1][1])
            self.tiles.append(ToppleTile(x, y, math.atan2(ny - y, nx - x)))
        last = self.tiles[-1]
        self.target_pos = (int(last.x + 50 * math.cos(last.angle)), int(last.y + 50 * math.sin(last.angle)))

    def clear(self):
        self.tiles = []
        self.running = False
        self.popped = False

    def add_tile_at(self, x, y):
        """Places a new domino aligned with the last tile placed."""
        if not self.area.collidepoint(x, y) or y < self.floor_top():
            return
        if self.running or self.popped:
            if not self.running:
                self.clear()               # a finished chain: start a new one
            else:
                return
        if not self.tiles:
            self.tiles.append(ToppleTile(x, y, 0.0))
            self.target_pos = (int(x + 50), int(y))
            return
        last = self.tiles[-1]
        dist = math.hypot(x - last.x, y - last.y)
        if dist >= SPACING:  # maintain consistent spacing so dominoes hit each other
            ang = math.atan2(y - last.y, x - last.x)
            last.angle = ang
            self.tiles.append(ToppleTile(x, y, ang))
            self.target_pos = (int(x + 50 * math.cos(ang)), int(y + 50 * math.sin(ang)))

    def start_topple(self):
        if self.tiles and not self.running and not self.popped:
            self.running = True
            self.tiles[0].toppling = True
            self.g.sfx.play("tip")
            self.g.say("Go dominoes!", "डोमिनो गिरना शुरू!")

    def update(self, dt):
        if not self.running:
            return
        for idx, t in enumerate(self.tiles):
            if t.toppling and not t.toppled:
                t.tilt = min(1.0, t.tilt + dt * 4.5)
                # When tilted past 35%, trigger the next domino
                if t.tilt > 0.35 and idx + 1 < len(self.tiles):
                    next_t = self.tiles[idx + 1]
                    if not next_t.toppling and not next_t.toppled:
                        next_t.toppling = True
                        self.g.sfx.play("clack", min(idx, 11))
                if t.tilt >= 1.0:
                    t.toppled = True

        # When the final domino falls, trigger the target celebration pop
        if self.tiles and self.tiles[-1].toppled and not self.popped:
            self.popped = True
            self.running = False
            self.pop_time = time.time()
            self.g.sfx.play("chime")
            self.g.particles.confetti(pygame.Rect(self.target_pos[0] - 60, self.target_pos[1] - 60, 120, 120), n=100)
            self.g.say("Super topple!", "शानदार डोमिनो!")

    # --- input --------------------------------------------------------------------
    def handle_click(self, pos):
        for rect, key, _label, _col in self.buttons():
            if rect.collidepoint(pos):
                self.g.sfx.play("click")
                if key == "go":
                    self.start_topple()
                elif key == "reset":
                    self.reset_default_track()
                else:
                    self.clear()
                return True
        # If clicked near the first tile, trigger the start
        if self.tiles and not self.running and not self.popped:
            first = self.tiles[0]
            if math.hypot(pos[0] - first.x, pos[1] - first.y) < 35:
                self.start_topple()
                return True
        self.add_tile_at(*pos)
        return True

    def handle_drag(self, pos):
        if not self.running:
            self.add_tile_at(*pos)

    # --- drawing ------------------------------------------------------------------
    def draw(self, s, now):
        a = self.area
        s.fill((28, 32, 45), a)
        # Grid lines for playground feel
        for gx in range(a.x, a.right, 48):
            pygame.draw.line(s, (35, 40, 56), (gx, self.floor_top()), (gx, a.bottom), 1)
        for gy in range(self.floor_top(), a.bottom, 48):
            pygame.draw.line(s, (35, 40, 56), (a.x, gy), (a.right, gy), 1)

        for rect, key, label, col in self.buttons():
            off = key == "go" and (self.running or self.popped or not self.tiles)
            pygame.draw.rect(s, (100, 110, 120) if off else col, rect, border_radius=10)
            pygame.draw.rect(s, (255, 255, 255), rect, 2, border_radius=10)
            if key == "go":            # a play triangle drawn, not a font symbol
                cx, cy = rect.x + 22, rect.centery
                pygame.draw.polygon(s, (255, 255, 255), [(cx - 6, cy - 9), (cx - 6, cy + 9), (cx + 9, cy)])
            txt = self.g.font_at(18).render(label, True, (255, 255, 255))
            s.blit(txt, txt.get_rect(center=(rect.centerx + (8 if key == "go" else 0), rect.centery)))

        tip = ("Draw a line with your finger to lay dominoes" if not self.tiles else
               "Tap Topple! or the first domino" if not (self.running or self.popped) else
               "Super! Draw a new line, or tap Again" if self.popped else "Watch them fall!")
        itxt = self.g.small_font.render(tip, True, (210, 220, 240))
        s.blit(itxt, itxt.get_rect(center=(a.centerx, a.y + 10 + BTN_H + 18)))

        # Goal balloon at the end of the track (it pops when the last domino falls)
        if self.tiles:
            tx, ty = self.target_pos
            if not self.popped:
                bob = int(4 * math.sin(now * 3))
                pygame.draw.circle(s, (255, 75, 75), (tx, ty - 18 + bob), 24)
                pygame.draw.circle(s, (255, 160, 160), (tx - 8, ty - 26 + bob), 6)
                pygame.draw.polygon(s, (255, 75, 75), [(tx - 6, ty + 6 + bob), (tx + 6, ty + 6 + bob), (tx, ty + 12 + bob)])
                pygame.draw.line(s, (200, 200, 200), (tx, ty + 12 + bob), (tx, ty + 36), 2)
                star_txt = self.g.font_at(14).render("GOAL", True, (255, 255, 255))
                s.blit(star_txt, star_txt.get_rect(center=(tx, ty - 18 + bob)))
            elif now - self.pop_time < 1.2:      # the pop: a ring that grows and fades
                r = int(24 + 60 * (now - self.pop_time))
                pygame.draw.circle(s, (255, 215, 0), (tx, ty - 18), r, 3)

        # Render Domino Tiles
        for t in self.tiles:
            cos_a = math.cos(t.angle)
            sin_a = math.sin(t.angle)
            tilt_shift = t.tilt * 22
            dx = t.x + tilt_shift * cos_a
            dy = t.y + tilt_shift * sin_a
            color_theme = (245, 245, 235) if not t.toppled else (200, 200, 195)
            surf = pygame.Surface((t.w, t.h), pygame.SRCALPHA)
            surf.fill(color_theme)
            pygame.draw.rect(surf, (40, 40, 45), (0, 0, t.w, t.h), 2)
            pygame.draw.line(surf, (80, 80, 85), (2, t.h // 2), (t.w - 3, t.h // 2), 2)
            pygame.draw.circle(surf, (30, 30, 35), (t.w // 2, t.h // 4), 2)
            pygame.draw.circle(surf, (30, 30, 35), (t.w // 2, 3 * t.h // 4), 2)
            rot_deg = -math.degrees(t.angle) - (t.tilt * 48)
            rot_surf = pygame.transform.rotate(surf, rot_deg)
            s.blit(rot_surf, rot_surf.get_rect(center=(int(dx), int(dy))))

        # Push Hint on first domino
        if self.tiles and not self.running and not self.popped:
            first = self.tiles[0]
            pulse = abs(math.sin(now * 4)) * 6
            pygame.draw.circle(s, (255, 215, 0), (int(first.x), int(first.y)), int(22 + pulse), 2)
