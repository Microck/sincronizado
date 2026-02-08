#!/usr/bin/env bash
set -euo pipefail

# sincronizado installer (macOS/Linux)
#
# Primary path: download the latest `sinc` binary from GitHub Releases.
# Fallback path (when no compatible binary exists): install Bun, download the
# repo source, install deps, and install a small wrapper that runs the CLI.
#
# Optionally runs `sinc --setup` to launch the TUI.

REPO_DEFAULT="Microck/sincronizado"
REPO="${SINC_REPO:-$REPO_DEFAULT}"

OS_NAME="$(uname -s)"
ARCH_NAME="$(uname -m)"

case "$OS_NAME" in
  Darwin) OS="darwin" ;;
  Linux) OS="linux" ;;
  *)
    echo "ERROR: unsupported OS: $OS_NAME" >&2
    exit 1
    ;;
esac

case "$ARCH_NAME" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *)
    echo "ERROR: unsupported architecture: $ARCH_NAME" >&2
    exit 1
    ;;
esac

ASSET="sinc-${OS}-${ARCH}"
URL="https://github.com/${REPO}/releases/latest/download/${ASSET}"

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required" >&2
  exit 1
fi

choose_install_dir() {
  if [ -n "${SINC_INSTALL_DIR:-}" ]; then
    echo "$SINC_INSTALL_DIR"
    return
  fi

  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    echo "/usr/local/bin"
    return
  fi

  if [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
    echo "/usr/local/bin"
    return
  fi

  echo "${HOME}/.local/bin"
}

INSTALL_DIR="$(choose_install_dir)"
BIN_PATH="${INSTALL_DIR}/sinc"

APP_DIR_DEFAULT="${HOME}/.local/share/sincronizado/app"
APP_DIR="${SINC_APP_DIR:-$APP_DIR_DEFAULT}"

mkdir -p "$INSTALL_DIR"

TMP="$(mktemp -t sinc.XXXXXX)"
cleanup() {
  rm -f "$TMP" >/dev/null 2>&1 || true
}
trap cleanup EXIT

download_binary() {
  echo "Downloading ${ASSET} from ${REPO}..."
  if curl -fL --retry 3 --retry-delay 1 "$URL" -o "$TMP"; then
    chmod +x "$TMP"
    mv "$TMP" "$BIN_PATH"
    echo "Installed: $BIN_PATH"
    return 0
  fi
  return 1
}

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    return 0
  fi

  if [ "${SINC_NONINTERACTIVE:-0}" != "1" ]; then
    echo "Bun not found. Installing Bun (required for fallback install)..."
  fi

  /bin/sh -c "curl -fsSL https://bun.sh/install | bash"

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v bun >/dev/null 2>&1
}

install_from_source() {
  local ref="${SINC_REF:-main}"
  local archive_url
  if [ "${ref#v}" != "$ref" ]; then
    archive_url="https://github.com/${REPO}/archive/refs/tags/${ref}.tar.gz"
  else
    archive_url="https://github.com/${REPO}/archive/refs/heads/${ref}.tar.gz"
  fi

  if ! ensure_bun; then
    echo "ERROR: Bun install failed; cannot continue fallback install" >&2
    exit 1
  fi

  if ! command -v tar >/dev/null 2>&1; then
    echo "ERROR: tar is required for fallback install" >&2
    exit 1
  fi

  echo "Fallback install: downloading source ($ref)..."
  mkdir -p "$(dirname "$APP_DIR")"
  rm -rf "$APP_DIR"
  mkdir -p "$APP_DIR"

  curl -fL --retry 3 --retry-delay 1 "$archive_url" | tar -xzf - -C "$APP_DIR" --strip-components=1

  echo "Installing dependencies..."
  (cd "$APP_DIR" && bun install)

  cat > "$BIN_PATH" <<EOF
#!/usr/bin/env bash
set -euo pipefail
export BUN_INSTALL=\"\${BUN_INSTALL:-$HOME/.bun}\"
export PATH=\"\$BUN_INSTALL/bin:\$PATH\"
exec bun \"$APP_DIR/src/cli/index.ts\" \"\$@\"
EOF
  chmod +x "$BIN_PATH"

  echo "Installed wrapper: $BIN_PATH"
}

if ! download_binary; then
  echo "WARNING: could not download a prebuilt binary for ${OS}/${ARCH}."
  install_from_source
fi

ensure_path() {
  local dir="$1"
  case ":$PATH:" in
    *":$dir:"*)
      return
      ;;
  esac

  # Avoid editing rc files in non-interactive scenarios unless explicitly asked.
  if [ "${SINC_NO_PATH_EDIT:-0}" = "1" ]; then
    echo "NOTE: $dir is not on PATH. Add it to your shell rc file." >&2
    return
  fi

  local export_line="export PATH=\"$dir:\$PATH\""

  # bash
  if [ -f "$HOME/.bashrc" ]; then
    if ! grep -qF "$export_line" "$HOME/.bashrc"; then
      printf '\n# sincronizado\n%s\n' "$export_line" >> "$HOME/.bashrc"
    fi
  fi

  # zsh
  if [ -f "$HOME/.zshrc" ]; then
    if ! grep -qF "$export_line" "$HOME/.zshrc"; then
      printf '\n# sincronizado\n%s\n' "$export_line" >> "$HOME/.zshrc"
    fi
  fi

  # fish
  if command -v fish >/dev/null 2>&1; then
    mkdir -p "$HOME/.config/fish/conf.d"
    local fish_file="$HOME/.config/fish/conf.d/sincronizado.fish"
    if [ ! -f "$fish_file" ] || ! grep -qF "$dir" "$fish_file"; then
      printf 'set -gx PATH %s $PATH\n' "$dir" >> "$fish_file"
    fi
  fi
}

ensure_path "$INSTALL_DIR"

echo
echo "Verify: $BIN_PATH --version"
"$BIN_PATH" --version || true

run_setup_prompt() {
  if [ "${SINC_NONINTERACTIVE:-0}" = "1" ]; then
    return 1
  fi
  if [ "${SINC_RUN_SETUP:-0}" = "1" ]; then
    return 0
  fi
  if [ ! -t 0 ] || [ ! -t 1 ]; then
    return 1
  fi
  printf "Run 'sinc --setup' now? [Y/n] "
  local ans
  if ! read -r ans </dev/tty; then
    ans=""
  fi
  case "$ans" in
    ""|Y|y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

if run_setup_prompt; then
  echo
  echo "Launching setup TUI..."
  exec "$BIN_PATH" --setup
fi

echo
echo "Next: run 'sinc --setup' to configure your VPS and dependencies."
