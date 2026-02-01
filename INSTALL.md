# Installation

## For Humans

Paste this into your LLM agent session:

```
Install and configure sincronizado by following instructions here:
https://raw.githubusercontent.com/microck/sincronizado/main/INSTALL.md
```

**Alternative: Quick Install**

### One-liner (Recommended)

```bash
# Linux/macOS
curl -fsSL https://sync.micr.dev/install.sh | bash

# Windows (PowerShell)
irm https://sync.micr.dev/install.ps1 | iex
```

### TUI Installer (Interactive)

Requires [Bun](https://bun.sh).

```bash
# Clone repo
git clone https://github.com/microck/sincronizado.git
cd sincronizado/installer

# Install and run
bun install
bun run src/index.ts
```

---

## For LLM Agents (Automated Setup)

If you're an LLM helping set up _sincronizado_, follow this **automation-first** workflow. Unlike the TUI that asks 10 questions, you can actually **do the work** via SSH MCP.

### Step 0: Verify Prerequisites

Check these requirements before starting:

```bash
# Confirm OS
uname -a  # Linux/macOS
systeminfo | findstr /B /C:"OS"  # Windows

# Confirm Tailscale (required for security)
tailscale status

# Confirm VPS SSH access
ssh -o ConnectTimeout=5 ubuntu@your-vps.tailnet.ts.net "echo 'SSH OK'"
```

**Requirements:**

- Ubuntu 20.04+ or Debian 11+ VPS
- Tailscale connected (never use public SSH)
- SSH key-based access working
- 2GB+ RAM (4GB recommended)

**Blockers:**

- No VPS → Direct user to create Oracle Cloud Free Tier instance
- No Tailscale → User must install first: https://tailscale.com/download
- SSH password auth → Switch to SSH keys before proceeding

### Step 1: Configure SSH MCP (DO THIS FIRST)

Since you're running inside an AI agent (OpenCode/Claude/Gemini), you need to configure SSH MCP **for yourself** so you can execute commands on the user's VPS.

**Ask user for 3 values:**

```
I need your VPS connection details to set up automated configuration:

1. VPS hostname (Tailscale): _______________ (e.g., oracle.tail1234.ts.net)
2. SSH user: _______________ (default: ubuntu)
3. SSH private key path: _______________ (default: ~/.ssh/id_rsa)
```

**Install SSH MCP package:**

```bash
npm install -g @tufantunc/ssh-mcp
# Or: uv tool install ssh-mcp
```

**Write MCP config using your file tools:**

Check which AI client you're running in, then update the appropriate config:

**If OpenCode:** Update `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "ssh": {
      "command": ["ssh-mcp"],
      "enabled": true,
      "type": "local",
      "environment": {
        "SSH_HOST": "USER_PROVIDED_HOSTNAME",
        "SSH_USER": "USER_PROVIDED_USER",
        "SSH_KEY": "USER_PROVIDED_KEY_PATH"
      }
    }
  }
}
```

**If Claude Desktop:** Update config at:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ssh": {
      "command": "ssh-mcp",
      "env": {
        "SSH_HOST": "USER_PROVIDED_HOSTNAME",
        "SSH_USER": "USER_PROVIDED_USER",
        "SSH_KEY": "USER_PROVIDED_KEY_PATH"
      }
    }
  }
}
```

**Tell user to restart:**

> "SSH MCP configured in your AI client. **Please restart this AI session** (exit and start a new one) so I can connect to your VPS and complete the setup automatically."

Once user restarts their AI session, you'll have SSH access to their VPS. Proceed to Step 2.

### Step 2: Auto-Detect & Recommend

Use SSH MCP to inspect VPS and provide **one confirmation question**:

```bash
# Detect VPS specs
free -h | grep Mem
cat /etc/os-release | grep PRETTY_NAME
nproc
# Check if AI agents already installed
which opencode claude 2>/dev/null || echo "none"
```

**Decision table:**

| RAM Detected | Recommendation | Reason                           |
| ------------ | -------------- | -------------------------------- |
| < 2GB        | ❌ Block       | Insufficient for AI agents       |
| 2-4GB        | minimal mode   | ET + AI agent + firewall only    |
| 4-8GB        | standard mode  | + Agent-OS + ccmanager + plugins |
| 8GB+         | full mode      | + Kimaki + LunaRoute + worktrees |

**Agent selection:**

- User mentions Claude subscription → Claude Code
- Otherwise → OpenCode (open source, default)

**Present to user:**

> "Detected: 8GB RAM, Ubuntu 22.04. **Recommend 'standard' mode with OpenCode.**
>
> This installs: Eternal Terminal, OpenCode, Agent-OS (web UI), session manager, plugins.
>
> Confirm? (yes/no/custom)"

If "custom", ask which components:

- Mode: minimal/standard/full
- Agent: opencode/claude
- Add-ons: kimaki, lunaroute, worktree-session

### Step 3: Automated VPS Setup

Once confirmed, execute via SSH MCP:

```bash
# 1. Clone sincronizado repo on VPS
git clone https://github.com/microck/sincronizado.git ~/sincronizado

# 2. Run setup with selected mode
sudo ~/sincronizado/scripts/setup-vps.sh --mode=MODE --agent=AGENT [OPTIONS]

# Example for standard + opencode:
# sudo ~/sincronizado/scripts/setup-vps.sh --mode=standard --agent=opencode
```

**Stream progress to user:**

> "Setting up VPS (this takes 2-3 minutes)..."
>
> - Installing Eternal Terminal... ✓
> - Installing OpenCode... ✓
> - Installing Agent-OS... ✓
> - Configuring firewall... ✓
> - Starting services... ✓

**Verify services started:**

```bash
systemctl is-active opencode
systemctl is-active agent-os
systemctl is-active eternal-terminal
```

### Step 4: Local Environment Setup

Clone sincronizado locally and configure launcher:

```bash
# Clone to local machine
git clone https://github.com/microck/sincronizado.git ~/.sincronizado

# Install Mutagen
brew install mutagen  # macOS
winget install Mutagen.Mutagen  # Windows
```

**Create local config** `.opencode.config.json` (or `.claude.config.json`):

```json
{
  "vps": {
    "default": "my-vps",
    "hosts": {
      "my-vps": {
        "hostname": "USER_PROVIDED_HOSTNAME",
        "user": "USER_PROVIDED_USER",
        "port": 2222,
        "provider": "oracle"
      }
    }
  }
}
```

**Add shell alias** (optional but recommended):

```bash
# Add to ~/.bashrc or ~/.zshrc
alias opencode="~/.sincronizado/launcher/opencode.sh"
alias claude="~/.sincronizado/launcher/claude.sh"
```

### Step 5: Automated Verification

Run verification checks via SSH MCP:

```bash
# Check all services
echo "=== Service Status ==="
systemctl is-active opencode && echo "✓ OpenCode running" || echo "✗ OpenCode failed"
systemctl is-active agent-os && echo "✓ Agent-OS running" || echo "✗ Agent-OS failed"
systemctl is-active eternal-terminal && echo "✓ ET running" || echo "✗ ET failed"

# Check ports
echo "=== Port Checks ==="
ss -tlnp | grep -E '2222|3000'

# Check resources
echo "=== VPS Resources ==="
free -h | grep Mem
df -h / | tail -1
```

**Local sync test:**

```bash
# Create test file locally
echo "sincronizado test $(date)" > /tmp/sync-test.txt

# Sync to VPS (via launcher or mutagen directly)
# Then verify on VPS:
cat ~/projects/*/sync-test.txt
```

### Step 6: Completion

**Success message:**

> "✓ **Setup complete!**
>
> Your VPS is configured and services are running.
>
> **Quick start:**
>
> 1. `opencode -p myproject` (or `claude -p myproject`)
> 2. Edit files locally → they sync to VPS in <500ms
> 3. Open http://VPS_HOSTNAME:3000 on your phone to monitor
>
> **Need help?** Run verification anytime or check troubleshooting below."

### Optional: IDE Configuration

**VS Code:**

- Install "Remote - SSH" extension for direct VPS editing
- Or use local VS Code with automatic Mutagen sync

**JetBrains:**

- Built-in SSH deployment or SSHFS mount

---

## Standard Installation (For Humans)

Use these methods if you prefer interactive setup or don't need LLM automation.

### One-Liner Script (Fastest)

Run one command, then pick agent/mode/components in TUI:

```bash
# Linux/macOS
curl -fsSL https://sync.micr.dev/install.sh | bash

# Windows (PowerShell)
irm https://sync.micr.dev/install.ps1 | iex
```

### TUI Installer (Interactive)

Requires [Bun](https://bun.sh). Most guided experience.

```bash
# Clone repo
git clone https://github.com/microck/sincronizado.git
cd sincronizado/installer

# Install and run
bun install
bun run src/index.ts
```

**TUI Screens:**

1. Welcome
2. Agent selection (OpenCode/Claude)
3. Mode selection (minimal/standard/full/custom)
4. Add-on checkboxes (Kimaki, LunaRoute, worktrees)
5. Security hardening (SSH keys, firewall)
6. VPS provider selection
7. Connection configuration
8. Confirm choices
9. Real-time install progress
10. Completion summary

### Manual Setup (Full Control)

```bash
# 1. Install Mutagen locally
brew install mutagen  # macOS
winget install Mutagen.Mutagen  # Windows

# 2. Clone repo
git clone https://github.com/microck/sincronizado.git
cd sincronizado

# 3. Setup VPS manually
ssh ubuntu@your-vps-ip
cd ~/sincronizado
sudo ./scripts/setup-vps.sh --mode=standard

# 4. Configure locally
cat > .opencode.config.json << 'EOF'
{
  "vps": {
    "default": "my-vps",
    "hosts": {
      "my-vps": {
        "hostname": "your-vps.tailnet.ts.net",
        "user": "ubuntu",
        "port": 2222,
        "provider": "oracle"
      }
    }
  },
  "sync": {
    "alpha": ".",
    "beta": "~/projects/myapp",
    "ignore": [".git", "node_modules"]
  }
}
EOF

# 5. Launch
./launcher/opencode.sh -p myapp  # macOS/Linux
.\launcher\opencode.ps1 -Project myapp  # Windows
```

## Installation Tiers

| Mode         | Components                            | Use Case                      |
| ------------ | ------------------------------------- | ----------------------------- |
| **minimal**  | ET, AI agent, UFW                     | Headless servers, CI/CD       |
| **standard** | + Agent-OS, ccmanager, plugins        | **Recommended for daily dev** |
| **full**     | + Kimaki, LunaRoute, worktree-session | Power users, teams            |
| **custom**   | Pick components                       | Specific needs                |

## Optional Components

```bash
--with-kimaki              # Discord bot for voice/text control
--with-lunaroute           # AI proxy with token tracking
--with-worktree-session    # Git worktree per session
--with-session-handoff     # Context continuation
--with-agent-of-empires    # Alternative session manager
--with-ssh-mcp             # SSH MCP server for AI management

--no-agent-os              # Skip web UI
--no-ccmanager             # Skip session manager
--no-plugins               # Skip plugins
```

## Troubleshooting Guide

**Common Issues:**

| Error                     | Solution                                             |
| ------------------------- | ---------------------------------------------------- |
| "SSH connection refused"  | Check Tailscale status, verify VPS IP/hostname       |
| "Mutagen sync failed"     | Run `mutagen daemon start`, check ignore patterns    |
| "AI agent not responding" | Check VPS resources (RAM/CPU), restart service       |
| "Port 3000 blocked"       | Run `ufw allow 3000/tcp` on VPS                      |
| "Permission denied (SSH)" | Verify SSH key added to VPS `~/.ssh/authorized_keys` |
| "Claude MCP not working"  | Verify `claude /config` shows MCP server             |

**Platform-Specific Notes:**

**Linux:**

- Install system deps: `sudo apt-get install openssh-client`
- May need `sudo` for global npm installs

**macOS:**

- Grant Terminal full disk access for file sync
- Use `brew` for easiest dependency management

**Windows:**

- Run PowerShell as Administrator
- Enable SSH client: `Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0`
- Use Windows Terminal for best experience

### ⚠️ Warnings

**DO NOT:**

- Share VPS credentials or SSH keys
- Run without Tailscale on public networks
- Use weak SSH passwords (always use keys)
- Skip firewall configuration (UFW)

**ALWAYS:**

- Keep Tailscale updated
- Monitor VPS resource usage
- Use `.env.local` for sensitive config (not committed)
- Backup important work before major updates

### Say 'Congratulations! 🎉' to User

Say to user:

> Congratulations! 🎉 You have successfully installed _sincronizado_!
>
> Your local editor is now connected to remote AI execution.
>
> **Quick test:** Try editing a file locally and watch it sync to your VPS in <500ms.
>
> **Next steps:**
>
> 1. Run your launcher script to start an AI session
> 2. Open http://your-vps:3000 on your phone to monitor
> 3. Edit files locally while AI executes remotely
>
> Happy coding! ᕙ(⇀‸↼‶)ᕗ

### Ask for a Star ⭐

After successful setup, ask user:

> "If you found this helpful, would you like to star the repository? It helps the project grow! ⭐"

If user agrees, run:

```bash
gh repo star microck/sincronizado
```

**Important**: Only run this command if user explicitly says yes. Never run automatically without consent.

### Additional Resources

- **Full Documentation**: https://sincronizado.micr.dev
- **GitHub Repo**: https://github.com/microck/sincronizado
- **Discord Community**: https://discord.gg/opencode
- **VPS Providers**: Oracle Cloud (free tier), Hetzner, DigitalOcean, AWS
- **Tailscale**: https://tailscale.com
