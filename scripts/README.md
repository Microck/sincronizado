# Scripts

Setup and automation scripts for Sincronizado.

## Available Scripts

### VPS Setup

**setup-vps.sh** - One-command VPS setup for Ubuntu 20.04+ and Debian 11+

```bash
sudo ./scripts/setup-vps.sh
```

Installs:
- Git, NPM, direnv, tmux
- Eternal Terminal (port 2222)
- Agent-OS Web UI (port 3000)
- OpenCode plugins (direnv, agentmap, sync, ai-sessions)
- ccmanager for session management
- UFW firewall configuration

**rollback-vps.sh** - Remove Sincronizado from VPS

```bash
sudo ./scripts/rollback-vps.sh
```

## Quick Start

1. Provision a VPS with Ubuntu 20.04+ or Debian 11+
2. SSH into the VPS as root
3. Download and run setup:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Microck/sincronizado/main/scripts/setup-vps.sh | sudo bash
   ```
4. Access Agent-OS at `http://your-vps-ip:3000`

See https://sincronizado.micr.dev/quick-start for full instructions.
