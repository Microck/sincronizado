#!/bin/bash
# DigitalOcean VPS Setup Helper

set -euo pipefail

echo "DigitalOcean Setup Helper"
echo "========================"
echo ""
echo "Droplet Requirements:"
echo "  - Ubuntu 20.04 or Debian 11"
echo "  - At least 1GB RAM"
echo "  - SSH key access"
echo ""
echo "After creating droplet:"
echo "  1. SSH into the droplet"
echo "  2. Run setup script"
echo ""
echo "Command to run on droplet:"
echo "  curl -fsSL https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh | sudo bash"
echo ""
