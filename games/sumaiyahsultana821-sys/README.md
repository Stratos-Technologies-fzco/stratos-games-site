# Missing Minutes

A beginner-friendly detective puzzle game. Pure HTML, CSS and JavaScript in a single file (`index.html`) — no build tools, no installs, no outside libraries or scripts.

## Play it online

It's already live as part of the Stratos Games site:
- https://stratos-technologies-fzco.github.io/stratos-games-site/ (GitHub Pages preview)
- https://stratos.games (production)

## Run it locally on Windows (PowerShell)

You don't need Node, Python, or anything installed to try the simplest option:

**Option A — just open the file (fastest):**

```powershell
cd "$HOME\Desktop\stratos-games-site\games\sumaiyahsultana821-sys"
Start-Process .\index.html
```

This opens the game directly in your default browser. Everything (the puzzle logic, styling, and content) lives inside that one `index.html` file, so this is all you need.

**Option B — serve it over a local web server (recommended if you plan to edit the code):**

Some browsers restrict certain features when a page is opened as a plain `file://` path. If you want the game to behave exactly like it does on the real site, serve it locally instead:

```powershell
cd "$HOME\Desktop\stratos-games-site\games\sumaiyahsultana821-sys"

# If you have Python installed:
python -m http.server 8080

# Then open this URL in your browser:
Start-Process "http://localhost:8080/"
```

Press `Ctrl+C` in the PowerShell window to stop the server when you're done.

**No Python?** PowerShell can serve files too, using .NET directly:

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

1. **Investigate** — click every location on the case's hub screen to read witness accounts and evidence. Some locations have a hidden "Look Closer" bonus clue worth extra points.
2. **Reconstruct the timeline** — use the ▲ / ▼ buttons on each event card to put all events in the order they truly happened, then press "Check Timeline".
3. **Review the deductions** — a short summary of what the clues actually prove.
4. **Accuse** — pick a suspect and confirm. There are 3 cases of increasing difficulty; finishing one unlocks the next.

## Scoring

| Action | Points |
|---|---|
| Each timeline event placed correctly | +20 |
| Perfect timeline on your first check | +100 |
| Each bonus clue found | +30 |
| Correct accusation | +150 |
| Wrong accusation | -50 |

Your unlocked levels and best total score are saved in your browser's `localStorage`, so they persist between visits on the same device/browser.

## Code structure

Everything is in `index.html`, organized into five clearly commented sections:

1. **Game data** — the text content for all 3 cases (locations, timeline events, deductions, suspects, endings).
2. **Game state** — the small set of variables tracking what's happening right now.
3. **Scoring** — pure functions that turn your choices into points.
4. **Screen drawing** — functions that build each screen's HTML and wire up its buttons.
5. **Startup** — wires the top bar buttons and draws the first screen.

No frameworks, no build step — read it top to bottom in any text editor.
