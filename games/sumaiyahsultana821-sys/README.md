# Match the Emoji

A beginner-friendly emoji memory-matching game. Pure HTML, CSS and JavaScript in a single file (`index.html`) — no build tools, no installs, no outside libraries or scripts.

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

1. Pick a difficulty: **Easy** (6 pairs), **Medium** (8 pairs), or **Hard** (12 pairs).
2. Click a card to flip it face up, then click a second card.
3. If the two emoji match, they stay face up. If not, they flip back down after a short pause — remember what you saw!
4. Find every pair to win. Fewer wasted flips between matches means a higher score.
5. See your final score, moves, time, and rank, then **Play Again** to beat your best.

## Scoring

Each match is worth up to **100 points**. Every extra card flip you make before finding that pair (beyond the one that revealed it) lowers the reward by **15 points**, down to a floor of **20 points** — so even a slow match still counts. Your best score is saved per difficulty in your browser's `localStorage`, so it persists between visits on the same device/browser.

## Code structure

Everything is in `index.html`, organized into six clearly commented sections:

1. **Config** — the difficulty levels and the emoji pool.
2. **State** — the small set of variables tracking what's happening right now.
3. **Scoring** — the match-scoring formula, best-score storage, and rank calculation.
4. **Game logic** — flipping cards, checking for a match, and the timer.
5. **Screen drawing** — functions that build each screen's HTML and wire up its buttons.
6. **Startup** — wires the top bar buttons (Help, Main Menu) and draws the first screen.

No frameworks, no build step — read it top to bottom in any text editor.
