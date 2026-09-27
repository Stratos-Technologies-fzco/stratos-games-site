# stratos.games

The one place for Stratos Games. One repo, one folder per maker, one push and your game is on the front page.

Vercel serves this repo at https://stratos.games (Sahil runs the hosting). The GitHub Pages copy at https://stratos-technologies-fzco.github.io/stratos-games-site/ is the preview, same content.

## Step 1. Claim your box (two minutes, no game needed yet)

1. Accept the GitHub invite. It is an email from GitHub, "Stratos-Technologies-fzco invited you to stratos-games-site". Not there? Search your inbox for "stratos-games-site", or ask Sahariar to resend it.

2. Paste ONE of these into your terminal. It copies the site to your Desktop and opens Claude Code inside it.

   Mac (Terminal):

       gh repo clone Stratos-Technologies-fzco/stratos-games-site ~/Desktop/stratos-games-site && cd ~/Desktop/stratos-games-site && claude

   Windows (PowerShell):

       gh repo clone Stratos-Technologies-fzco/stratos-games-site $HOME\Desktop\stratos-games-site; cd $HOME\Desktop\stratos-games-site; claude

   First time on this machine? Run `gh auth login` first (pick GitHub.com, then the browser). No `gh` at all? Tell Claude Code "install the GitHub CLI and sign me in", it walks you through it. Claude Code asks "do you trust this folder?" once. Say yes.

3. Paste this into Claude Code, in plain English:

       Claim my box on stratos.games. My GitHub username is <your-username> and my name is <your name>. My game will be called <title> (help me pick a working title if I have none). Create games/<your-username>/game.json with title, maker (my name), one_line (one sentence on the idea), category (one of: arcade, puzzle, word, party, sports, kids), github (my username) and "status": "coming_soon". Create games/<your-username>/index.html as a placeholder page: dark background, the title big, "by <my name>", the words "coming soon", nothing loaded from other sites. Do not touch any other folder. Then pull, commit as "claim box: <your-username>" and push. If the push is rejected, pull the others' work and push mine again.

About a minute later your box is on the front page under "In the works", with your name on it.

## Step 2. Add your game (when it is ready)

Open the folder again (`cd ~/Desktop/stratos-games-site` then `claude`) and paste:

    Add my game to stratos.games. My GitHub username is <your-username>. My box is games/<your-username>/. Replace the placeholder index.html with my game (build it with me if I do not have one yet: ask me what game I want, then make it, single file, works on a phone, no scripts loaded from other sites). Update game.json: keep title, maker, one_line, category, github; add how_to_play (one line on the controls); remove "status". Make a thumbnail.png from the game, 800 by 500. Never touch any other folder. When it runs and I say publish, pull, commit and push it.

Say "publish" when you are happy. About a minute later the "Soon" badge turns into "New", the game gets its own play page, and it is the first big tile on the wall.

## Your box

    games/<your-username>/
        index.html      the game (or the placeholder), one file if you can, everything it needs inside the folder
        game.json       {"title": "...", "maker": "Your Name", "one_line": "what it is", "category": "arcade", "github": "your-username", "how_to_play": "Tap to jump"}
                        "status": "coming_soon" while it is a placeholder; optional "description" (a paragraph for the play page)
        thumbnail.png   a picture of it, 16:10, about 800 by 500 (if you skip it, the site makes a cover from the title)

Categories: arcade, puzzle, word, party, sports, kids.

## Rules

1. Your folder is yours. Nobody edits another maker's folder, ever.
2. Nobody types a git command. Claude Code pulls, commits and pushes. If it says the push was rejected: "someone else pushed, pull their work and push mine again."
3. Keep it inside the folder: no scripts loaded from outside, no personal data, no passwords, keep the folder under 20 MB.
4. If the page breaks, that is fine, we fix it live.

## How the site builds itself

`tools/build.py` reads every `games/*/game.json` and writes the front page (mood cards, the wall of big and small tiles, rows), a play page per game (frame, fullscreen, share, side column), the category pages, `games.json`, the sitemap and `llms.txt`. A GitHub Action runs it on every push and commits the result, so nobody edits those pages by hand. Real games come first, newest first; claimed boxes ("status": "coming_soon") sit after them with a Soon badge and their own "In the works" row, and stay out of the sitemap until the game lands. A folder without both files, or with broken JSON, is skipped and named in the build log; everyone else's game still shows.

## Hosting (Sahil)

Vercel imports this repo and serves it as static files: Framework preset "Other", no build command, no output directory (the repo root is the site), production branch `main`. `vercel.json` sets trailing slashes (the WordPress URLs all had them, so `/about/` stays `/about/`) and cache headers; `404.html` is the custom not-found page. Every push deploys; the Action's follow-up commit "build: site pages" is the one that carries a new game, so a maker's push is live about a minute after it lands. Domains: add `stratos.games` and `www.stratos.games` in the project's Domains tab and set the DNS records it shows (Vercel's usual ones are an A record for the apex and a CNAME to `cname.vercel-dns.com` for www). The same URLs as the WordPress site are all here, so nothing needs redirecting.
