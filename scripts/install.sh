#!/usr/bin/env bash
set -euo pipefail

REPO="microck/sincronizado"
INSTALL_DIR="${HOME}/.local/bin"

OS_NAME="$(uname -s)"
ARCH_NAME="$(uname -m)"

case "${OS_NAME}" in
  Darwin) OS="darwin";;
  Linux) OS="linux";;
  *) echo "Unsupported OS: ${OS_NAME}"; exit 1;;
esac

case "${ARCH_NAME}" in
  x86_64|amd64) ARCH="x64";;
  arm64|aarch64) ARCH="arm64";;
  *) echo "Unsupported architecture: ${ARCH_NAME}"; exit 1;;
esac

ASSET="sinc-${OS}-${ARCH}"
URL="https://github.com/${REPO}/releases/latest/download/${ASSET}"

mkdir -p "${INSTALL_DIR}"

echo "Downloading ${ASSET}..."
curl -fsSL "${URL}" -o "${INSTALL_DIR}/sinc"
chmod +x "${INSTALL_DIR}/sinc"

echo "Installed sinc to ${INSTALL_DIR}/sinc"
echo "Next: run 'sinc --setup' to finish configuration."
