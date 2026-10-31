#!/usr/bin/env bash
# sync.sh: keeps every maker's copy in step with GitHub, so nobody has to remember.
#   sync.sh pull     (session start, every message)  get the latest from main, quietly
#   sync.sh publish  (when Claude finishes a turn)    push any saved commits, retry, confirm on GitHub
# Needs only bash and git, so it works on Mac, Linux and Windows (Git Bash).
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "main" ] || exit 0
gitdir="$(git rev-parse --git-dir)"
[ -d "$gitdir/rebase-merge" ] || [ -d "$gitdir/rebase-apply" ] && exit 0   # someone is mid-rebase, leave it alone

catch_up() {   # bring main up to date, keeping unsaved work; undo cleanly if it cannot
  git -c core.hooksPath=/dev/null pull -q --rebase --autostash origin main >/dev/null 2>&1 && return 0
  git rebase --abort >/dev/null 2>&1
  return 1
}

case "$1" in
  pull)
    git fetch -q origin main >/dev/null 2>&1 || exit 0          # offline: carry on
    behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
    [ "$behind" = "0" ] && exit 0
    if catch_up; then
      echo "Got the latest from GitHub ($behind new change(s) from the team)."
    else
      echo "Could not get the latest from GitHub automatically (a change clashes with this copy). Before editing, run: git status, then fix it with the maker."
    fi
    ;;
  publish)
    input=$(cat)
    case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;; esac
    git fetch -q origin main >/dev/null 2>&1
    ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
    [ "$ahead" = "0" ] && exit 0
    for try in 1 2 3; do
      if ! catch_up; then
        echo "Publish stopped: your saved change clashes with a newer change on GitHub (files: $(git diff --name-only HEAD origin/main 2>/dev/null | head -5 | tr '\n' ' ')). Tell the maker in one line, fix it, then commit again." >&2
        exit 2
      fi
      if git push -q origin HEAD:main >/dev/null 2>&1; then
        sha=$(git rev-parse --short HEAD)
        if [ "$(git ls-remote origin refs/heads/main 2>/dev/null | cut -c1-7)" = "$(git rev-parse HEAD | cut -c1-7)" ]; then
          echo "{\"systemMessage\": \"Published to GitHub ($sha). Live on stratos.games in about a minute.\"}"
          exit 0
        fi
      fi
      sleep $((try * 3))
    done
    echo "Publish failed after 3 tries: $ahead saved change(s) are still only on this computer. Tell the maker plainly that it is NOT live, and check the internet connection and GitHub login (gh auth status)." >&2
    exit 2
    ;;
esac
exit 0
