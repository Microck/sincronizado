#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${SINC_WORKSPACE:-$HOME/workspace}"

# Expand a leading ~ so callers can pass "~/workspace" safely.
# Note: we intentionally only expand the current user's home (~ or ~/...).
if [[ "$WORKSPACE" == "~" ]]; then
  WORKSPACE="$HOME"
elif [[ "$WORKSPACE" == "~/"* ]]; then
  WORKSPACE="$HOME/${WORKSPACE:2}"
fi

echo "Setting up VPS dependencies..."

if ! command -v tmux >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y && sudo apt-get install -y tmux
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y tmux
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y tmux
  else
    echo "tmux not installed and no supported package manager found."
  fi
fi

mkdir -p "$WORKSPACE"

if ! command -v opencode >/dev/null 2>&1; then
  echo "OpenCode not found on VPS. Install it if you plan to use it."
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "Claude CLI not found on VPS. Install it if you plan to use it."
fi

echo "VPS setup complete."
