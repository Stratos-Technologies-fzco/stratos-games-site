#!/usr/bin/env bash
# sync.sh: keeps every maker's copy in step with GitHub, so nobody has to remember.
#   sync.sh pull     (session start, every message)  get the latest from staging, quietly
#   sync.sh publish  (when Claude finishes a turn)    push any saved commits to staging, retry, confirm on GitHub
# Everyone publishes to STAGING (https://stratos-family-staging.vercel.app). The live site (main) changes only at the
# Saturday release (Actions: "release staging to live") or by a quick fix from Sahil/Sahariar on a branch called hotfix.
# Needs only bash and git, so it works on Mac, Linux and Windows (Git Bash).
BR=staging
STAGING_URL="https://stratos-family-staging.vercel.app"
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
cur="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
case "$cur" in main|staging) ;; *) exit 0 ;; esac          # any other branch (hotfix, experiments): leave it alone
gitdir="$(git rev-parse --git-dir)"
[ -d "$gitdir/rebase-merge" ] || [ -d "$gitdir/rebase-apply" ] && exit 0   # someone is mid-rebase, leave it alone

move_to_staging() {   # once per computer: switch from main to staging, keeping unsaved work and unpublished commits
  [ "$cur" = "$BR" ] && return 0
  git fetch -q origin "$BR" >/dev/null 2>&1 || return 1
  git checkout -q -B "$BR" >/dev/null 2>&1 || return 1
  git branch -q --set-upstream-to="origin/$BR" "$BR" >/dev/null 2>&1
  cur="$BR"
  echo "This computer now publishes to staging ($STAGING_URL). Games go live on stratos.games at the Saturday release, once they pass the staging check (issue #33)."
}

catch_up() {   # bring staging up to date, keeping unsaved work; undo cleanly if it cannot
  git -c core.hooksPath=/dev/null pull -q --rebase --autostash origin "$BR" >/dev/null 2>&1 && return 0
  git rebase --abort >/dev/null 2>&1
  return 1
}

case "$1" in
  pull)
    move_to_staging || exit 0
    git fetch -q origin "$BR" >/dev/null 2>&1 || exit 0          # offline: carry on
    behind=$(git rev-list --count HEAD..origin/$BR 2>/dev/null || echo 0)
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
    move_to_staging || exit 0
    git fetch -q origin "$BR" >/dev/null 2>&1
    ahead=$(git rev-list --count origin/$BR..HEAD 2>/dev/null || echo 0)
    [ "$ahead" = "0" ] && exit 0
    for try in 1 2 3; do
      if ! catch_up; then
        echo "Publish stopped: your saved change clashes with a newer change on GitHub (files: $(git diff --name-only HEAD origin/$BR 2>/dev/null | head -5 | tr '\n' ' ')). Tell the maker in one line, fix it, then commit again." >&2
        exit 2
      fi
      if git push -q origin "HEAD:$BR" >/dev/null 2>&1; then
        sha=$(git rev-parse --short HEAD)
        if [ "$(git ls-remote origin refs/heads/$BR 2>/dev/null | cut -c1-7)" = "$(git rev-parse HEAD | cut -c1-7)" ]; then
          echo "{\"systemMessage\": \"Published to staging ($sha). See it at $STAGING_URL in about a minute. It goes live on stratos.games at the Saturday release if it passes the staging check (issue #33).\"}"
          exit 0
        fi
      fi
      sleep $((try * 3))
    done
    echo "Publish failed after 3 tries: $ahead saved change(s) are still only on this computer. Tell the maker plainly that it is NOT on staging, and check the internet connection and GitHub login (gh auth status)." >&2
    exit 2
    ;;
esac
exit 0
