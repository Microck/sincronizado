#!/bin/bash
set -e

echo "========================================"
echo "  SINCRONIZADO INSTALLER"
echo "========================================"
echo ""

# Color helpers
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Installation mode: "local" (TUI installer) or "remote" (VPS setup)
MODE="${1:-local}"

# VPS connection details (for remote mode)
VPS_HOST="${2:-}"
VPS_USER="${3:-ubuntu}"

# Check for Bun
if ! command -v bun &> /dev/null; then
  echo -e "${YELLOW}Bun not found. Installing Bun...${NC}"
  curl -fsSL https://bun.sh/install | bash
  if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Failed to install Bun${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Bun installed${NC}"

# Installation directory
INSTALL_DIR="$HOME/.sincronizado"
mkdir -p "$INSTALL_DIR"

# Clone or update repo
if [ -d "$INSTALL_DIR/.git" ]; then
  echo -e "${YELLOW}Updating sincronizado...${NC}"
  cd "$INSTALL_DIR"
  git pull --rebase
else
  echo -e "${CYAN}Cloning sincronizado...${NC}"
  git clone https://github.com/microck/sincronizado.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

echo -e "${GREEN}✓ Repository ready${NC}"

# Run TUI installer for local mode
if [ "$MODE" = "local" ]; then
  echo -e "${CYAN}Installing TUI dependencies...${NC}"
  cd "$INSTALL_DIR/installer"
  bun install --silent
  echo -e "${GREEN}✓ Dependencies installed${NC}"

  echo ""
  echo -e "${GREEN}Launching TUI installer...${NC}"
  echo ""
  bun run src/index.tsx

# Run VPS setup for remote mode
elif [ "$MODE" = "remote" ]; then
  if [ -z "$VPS_HOST" ]; then
    echo -e "${RED}Error: VPS_HOST required for remote mode${NC}"
    echo "Usage: curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- remote <hostname> [user]"
    exit 1
  fi

  echo -e "${CYAN}Setting up VPS at $VPS_USER@$VPS_HOST...${NC}"
  echo ""

  # Run TUI first to get config
  cd "$INSTALL_DIR/installer"
  bun install --silent

  # Run setup script on VPS
  SCRIPT_URL="https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh"
  ssh "$VPS_USER@$VPS_HOST" "curl -fsSL $SCRIPT_URL | sudo bash"

  echo ""
  echo -e "${GREEN}✓ VPS setup complete${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Set up local launcher (./launcher/opencode.sh)"
  echo "  2. Configure VPS connection in ~/.sincronizado/config.json"
  echo "  Docs: https://sincronizado.micr.dev"

# Show usage if no mode specified
else
  echo ""
  echo "Usage:"
  echo ""
  echo "  TUI Installer (recommended):"
  echo "    curl -fsSL https://sincronizado.micr.dev/install.sh | bash"
  echo ""
  echo "  VPS Setup only:"
  echo "    curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- remote <hostname> [user]"
  echo ""
  echo "  VPS Setup + TUI:"
  echo "    curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- remote <hostname> [user]"
  echo "    Then run TUI to configure launcher"
fi
