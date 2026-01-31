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

# Check for Bun
if ! command -v bun &> /dev/null; then
  echo -e "${YELLOW}Bun not found. Installing Bun...${NC}"
  curl -fsSL https://bun.sh/install | bash
  if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Failed to install Bun${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}OK: Bun installed${NC}"

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

echo -e "${GREEN}OK: Repository ready${NC}"

# Check if TUI config exists from previous run
CONFIG_FILE="$HOME/.sincronizado/config.json"
VPS_SETUP_DONE=false

if [ -f "$CONFIG_FILE" ]; then
  if command -v jq &> /dev/null; then
    HOST=$(jq -r '.vps.host // empty' "$CONFIG_FILE" 2>/dev/null)
    USER=$(jq -r '.vps.user // "ubuntu"' "$CONFIG_FILE" 2>/dev/null)

    if [ -n "$HOST" ] && [ "$HOST" != "empty" ]; then
      VPS_SETUP_DONE=true
      echo -e "${GREEN}OK: Previous VPS configuration found${NC}"
      echo -e "  Host: ${CYAN}$HOST${NC}"
      echo -e "  User: ${CYAN}$USER${NC}"
    fi
  fi
fi

echo ""
echo -e "${CYAN}Installing TUI dependencies...${NC}"
cd "$INSTALL_DIR/installer"
bun install --silent
echo -e "${GREEN}OK: Dependencies installed${NC}"

echo ""
echo -e "${GREEN}Launching TUI installer...${NC}"
echo ""
bun run src/index.ts

# After TUI exits, check if we should do VPS setup
cd "$INSTALL_DIR"
if [ -f "installer/.tui-result.json" ]; then
  if command -v jq &> /dev/null; then
    ACTION=$(jq -r '.action // empty' "installer/.tui-result.json" 2>/dev/null)

    if [ "$ACTION" = "setup-vps" ]; then
      echo ""
      echo "========================================"
      echo -e "${CYAN}  VPS SETUP${NC}"
      echo "========================================"
      echo ""

      HOST=$(jq -r '.host // empty' "installer/.tui-result.json")
      USER=$(jq -r '.user // "ubuntu"' "installer/.tui-result.json")
      MODE=$(jq -r '.mode // "standard"' "installer/.tui-result.json")
      FLAGS=$(jq -r '.flags // empty' "installer/.tui-result.json")

      if [ -z "$HOST" ] || [ "$HOST" = "empty" ]; then
        echo -e "${RED}Error: VPS host not configured${NC}"
        exit 1
      fi

      echo -e "${CYAN}Setting up VPS at $USER@$HOST...${NC}"
      echo -e "  Mode: ${YELLOW}$MODE${NC}"
      echo ""

      # Run setup script on VPS
      SCRIPT_URL="https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh"
      ssh "$USER@$HOST" "curl -fsSL $SCRIPT_URL | sudo bash -s -- $FLAGS"

      if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}OK: VPS setup complete${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Set up local launcher (./launcher/opencode.sh)"
        echo "  2. Test connection: ssh $USER@$HOST"
        echo "  3. Access Agent-OS: http://$HOST:3000"
      else
        echo -e "${RED}ERR: VPS setup failed${NC}"
        echo "  Check your SSH connection and try manually:"
        echo "  ssh $USER@$HOST"
        echo "  curl -fsSL https://sincronizado.micr.dev/setup-vps.sh | sudo bash"
      fi
    fi

    # Cleanup
    rm -f "installer/.tui-result.json"
  fi
else
  echo ""
  echo -e "${YELLOW}Note: Run TUI again to configure VPS setup${NC}"
  echo "  After TUI completes, you'll be prompted for VPS installation"
fi
