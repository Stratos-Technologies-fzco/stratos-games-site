# stratos.games

The game portal. One folder per maker. Push, and your game is on the front page.

Live: https://stratos-technologies-fzco.github.io/stratos-games-site/ (soon: https://stratos.games)

## Join: one paste, then talk

Accept the GitHub invite in your inbox first. Then paste ONE of these into your terminal. It copies the site to your Desktop and opens Claude Code inside it.

Mac (Terminal):

    gh repo clone Stratos-Technologies-fzco/stratos-games-site ~/Desktop/stratos-games-site && cd ~/Desktop/stratos-games-site && claude

Windows (PowerShell):

    gh repo clone Stratos-Technologies-fzco/stratos-games-site $HOME\Desktop\stratos-games-site; cd $HOME\Desktop\stratos-games-site; claude

Claude Code asks "do you trust this folder?" once. Say yes. Already have the folder? `cd ~/Desktop/stratos-games-site` then `claude`.

Then paste this, in plain English:

    Add my game to stratos.games. My GitHub username is <your-username>. Make a folder games/<your-username>/ and put my game in it as index.html (build it with me if I do not have one yet: ask me what game I want, then make it, single file, works on a phone, no scripts loaded from other sites). Add games/<your-username>/game.json with title, maker (my name), one_line (what it is), category (one of: arcade, puzzle, word, party, sports, kids), github (my username), and a thumbnail.png you make from the game, 800 by 500. Never touch any other folder. When it runs and I say publish, pull, commit and push it.

Say "publish" when you are happy. About a minute later your game is on the front page and has its own play page.

## Your box

    games/<your-username>/
        index.html      the game, one file if you can, everything it needs inside the folder
        game.json       {"title": "...", "maker": "Your Name", "one_line": "what it is", "category": "arcade", "github": "your-username"}
        thumbnail.png   a picture of it, 16:10, about 800 by 500 (if you skip it, the site makes a cover from the title)

Categories: arcade, puzzle, word, party, sports, kids.

## Rules

1. Your folder is yours. Nobody edits another maker's folder, ever.
2. Nobody types a git command. Claude Code pulls, commits and pushes. If it says the push was rejected: "someone else pushed, pull their work and push mine again."
3. Keep it inside the folder: no scripts loaded from outside, no personal data, no passwords, keep the folder under 20 MB.
4. If the page breaks, that is fine, we fix it live.

## How the site builds itself

`tools/build.py` reads every `games/*/game.json` and writes the front page, a play page per game, the category pages, `games.json`, the sitemap and `llms.txt`. A GitHub Action runs it on every push, so nobody edits those pages by hand. A folder without both files, or with broken JSON, is skipped and named in the build log; everyone else's game still shows.
