# Garden Bonk (Whack-a-Mole)

A beginner-friendly Whack-a-Mole game. Pure HTML, CSS and JavaScript in a single file (`index.html`) — no build tools, no installs, no outside libraries or scripts.

## Play it online

It's live as part of the Stratos Games site:
- https://stratos-technologies-fzco.github.io/stratos-games-site/ (GitHub Pages preview)
- https://stratos.games (production)

## Run it locally on Windows (PowerShell)

**Option A — just open the file (fastest, no installs needed):**

```powershell
cd "$HOME\Desktop\stratos-games-site\games\sumaiyahsultana821-sys"
Start-Process .\index.html
```

This opens the game directly in your default browser. Everything — the game logic, styling, and content — lives inside that one `index.html` file.

**Option B — serve it over a local web server (recommended if you plan to edit the code):**

```powershell
cd "$HOME\Desktop\stratos-games-site\games\sumaiyahsultana821-sys"

# If you have Python installed:
python -m http.server 8080

# Then open this URL in your browser:
Start-Process "http://localhost:8080/"
```

Press `Ctrl+C` in the PowerShell window to stop the server when you're done.

**No Python?** PowerShell can serve files on its own using .NET:

```powershell
cd "$HOME\Desktop\stratos-games-site\games\sumaiyahsultana821-sys"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Serving on http://localhost:8080/  (Ctrl+C to stop)"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = Join-Path (Get-Location) ($context.Request.Url.LocalPath.TrimStart('/'))
    if ($context.Request.Url.LocalPath -eq "/") { $path = Join-Path (Get-Location) "index.html" }
    if (Test-Path $path) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.OutputStream.Close()
}
```

## How to play

1. Press **Start Game**. Critters pop out of the 9 holes at random.
2. Click or tap a critter before it ducks back down — or press the number key shown above its hole (1 through 9).
3. 🐹 A regular mole is worth **+10** points. 🌟 A rare golden critter is worth **+30** but disappears fast. 🦨 A skunk should be left alone — whacking one costs you **-15** points.
4. The game runs for 45 seconds across **3 rounds**. Each new round, critters appear faster and more can be on screen at once.
5. When time runs out, see your score, accuracy, and rank, then **Play Again** to beat your best.

## Scoring

| Critter | Points |
|---|---|
| 🐹 Mole | +10 |
| 🌟 Golden critter | +30 |
| 🦨 Skunk (avoid!) | -15 |

Your best score is saved in your browser's `localStorage`, so it persists between visits on the same device/browser.

## Code structure

Everything is in `index.html`, organized into six clearly commented sections:

1. **Config** — every tunable number (timing, points, round difficulty).
2. **State** — the small set of variables tracking what's happening right now.
3. **Scoring** — best-score storage and rank calculation.
4. **Spawning** — the timers that make critters pop up and disappear, and the round difficulty ramp.
5. **Screen drawing** — functions that build each screen's HTML and wire up its buttons.
6. **Startup** — wires the top bar buttons (Help, Main Menu) and keyboard shortcuts, then draws the first screen.

No frameworks, no build step — read it top to bottom in any text editor.
