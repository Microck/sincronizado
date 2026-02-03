# Scripts

Setup and automation scripts for Sincronizado.

## Available Scripts

### VPS Setup

**setup-vps.sh** - One-command VPS setup for Ubuntu 20.04+ and Debian 11+

```bash
./scripts/setup-vps.sh
```

Installs:

- `tmux` (via apt/yum/dnf if available)
- creates the workspace directory used by `sinc` (defaults to `~/workspace`)

Notes:

- run the script as your normal user; it uses `sudo` internally to install packages
- it does not install your AI agent; install `opencode` or `claude` on the VPS separately
- it prints warnings if `opencode`/`claude` are missing

### Custom workspace path

By default, the script creates `$HOME/workspace` on the VPS. You can override this by
setting `SINC_WORKSPACE`:

```bash
SINC_WORKSPACE=~/workspace ./scripts/setup-vps.sh
```

## Quick Start

1. Provision a VPS with Ubuntu 20.04+ or Debian 11+
2. SSH into the VPS
3. Download and run setup:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Microck/sincronizado/main/scripts/setup-vps.sh | bash
   ```

See https://sincronizado.micr.dev/quick-start for full instructions.
