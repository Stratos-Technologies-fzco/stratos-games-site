#!/usr/bin/env bash
# guard.sh: before Claude edits a file, check it belongs to this maker.
# Makers may change games/<their-github-name>/ and games/<their-github-name>-*/ only.
# Sahil and Sahariar may change anything except app-ads.txt (live ad money, never edited by Claude).
ADMINS=" sahilmodi1965 mody-sahariar1 "
input=$(cat)
file=$(printf '%s' "$input" | sed -nE 's/.*"(file_path|notebook_path)"[[:space:]]*:[[:space:]]*"([^"]*)".*/\2/p' | head -1 | sed 's/\\\\/\//g; s/\\/\//g')
[ -n "$file" ] || exit 0
root=$(printf '%s' "${CLAUDE_PROJECT_DIR:-$PWD}" | sed 's/\\/\//g')
lc() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }
case "$(lc "$file")" in "$(lc "$root")"/*) rel="${file:${#root}+1}" ;; *) exit 0 ;; esac   # outside the repo: not ours to guard

if [ "$(lc "$rel")" = "app-ads.txt" ]; then
  echo "Blocked: app-ads.txt keeps live ad money flowing for Arrow Puzzle and Bloxplode. Nobody edits it through Claude. Tell the maker to ask Sahil." >&2
  exit 2
fi

cd "$root" 2>/dev/null || exit 0
cache="$(git rev-parse --git-dir 2>/dev/null)/stratos-login"
login=$(cat "$cache" 2>/dev/null)
if [ -z "$login" ]; then
  login=$(gh api user -q .login 2>/dev/null)
  [ -n "$login" ] && printf '%s' "$login" > "$cache"
fi
[ -n "$login" ] || exit 0                       # cannot tell who this is: do not block their work
case "$ADMINS" in *" $login "*) exit 0 ;; esac

l=$(lc "$login"); r=$(lc "$rel")
case "$r" in "games/$l/"*|"games/$l-"*) exit 0 ;; esac
echo "Blocked: $rel is not in your game folder. You ($login) can change games/$login/ or games/$login-<game>/ only; shared files and other makers' games are off limits. If this change is really needed, tell the maker to ask Sahil or Sahariar." >&2
exit 2
