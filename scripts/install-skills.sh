#!/usr/bin/env bash
# Copy this repo's workflow skills into ~/.claude/skills so they work in every project on this machine.
# Usage (from the repo root): ./scripts/install-skills.sh
set -euo pipefail

src="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills"
dst="$HOME/.claude/skills"
mkdir -p "$dst"

for dir in "$src"/*/; do
  name="$(basename "$dir")"
  if [ -e "$dst/$name" ]; then
    echo "skip  $name (already exists in $dst)"
  else
    cp -R "$dir" "$dst/$name"
    echo "added $name"
  fi
done
