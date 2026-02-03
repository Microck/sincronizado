#!/bin/bash
# Hetzner VPS Setup Helper

set -euo pipefail

echo "Hetzner Cloud Setup Helper"
echo "========================="
echo ""
echo "Server Requirements:"
echo "  - Ubuntu 20.04 or Debian 11"
echo "  - CX11 or larger (1 vCPU, 2GB RAM recommended)"
echo ""
echo "Firewall Rules to Add:"
echo "  - TCP 22 (SSH)"
echo "  - TCP 2222 (Eternal Terminal)"
echo "  - TCP 3000 (Agent-OS)"
echo ""
echo "Setup command:"
echo "  curl -fsSL https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh | sudo bash"
echo ""
