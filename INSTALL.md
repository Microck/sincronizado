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
# Linux/macOS with OpenCode
curl -fsSL https://sincronizado.micr.dev/install.sh | bash

# Linux/macOS with Claude Code
curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- --agent=claude

# Windows with OpenCode
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) }"

# Windows with Claude Code
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) } -Agent claude"
```

### TUI Installer (Interactive)

```bash
bunx sincronizado
# Follow prompts to select VPS provider, AI agent, and components
```

---

## For LLM Agents

If you're an LLM Agent helping set up _sincronizado_, Welcome! Follow these steps to install the hyper-local development stack for your user.

### Step 0: Check Prerequisites

**CRITICAL**: Before starting, verify these requirements:

```bash
# Check OS
uname -a  # Linux/macOS
systeminfo | findstr /B /C:"OS"  # Windows

# Check if user has a VPS ready
# Required: Ubuntu 20.04+ or Debian 11+ VPS

# Check Tailscale
tailscale version  # User must have Tailscale account and tailnet setup
```

**Required VPS Specifications:**

- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: 4GB+ recommended (2GB minimum)
- **CPU**: 2+ cores
- **Network**: Tailscale connected
- **Access**: SSH key-based authentication

**If no VPS**: User needs to create one (Oracle Cloud Free Tier, Hetzner, DigitalOcean, AWS)

**If no Tailscale**: User must install and configure Tailscale first

### Step 1: Ask User About AI Agent Preference

Ask user this single question:

```
Which AI agent do you want to use on the VPS?
1. OpenCode (open source, recommended)
2. Claude Code (Anthropic, requires subscription)
```

**Decision logic:**

- User has Claude Pro/Max subscription → **Option 2** (Claude Code)
- User wants free/open source → **Option 1** (OpenCode, default)

### Step 2: Choose Installation Method

Based on user's tech level:

```
How do you want to install?
1. One-liner script (fastest, automated)
2. TUI installer (interactive, guided)
3. Manual setup (full control)
```

### Step 3: Execute Installation

#### Option 1: One-liner Script

**With OpenCode:**

```bash
# Linux/macOS
curl -fsSL https://sincronizado.micr.dev/install.sh | bash

# Windows PowerShell (admin)
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) }"
```

**With Claude Code:**

```bash
# Linux/macOS
curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- --agent=claude

# Windows PowerShell (admin)
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) } -Agent claude"
```

**Installation Modes:**

```bash
# Minimal (core only: ET, AI agent, UFW)
curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- --mode=minimal

# Standard (recommended: + Agent-OS, session manager, plugins)
curl -fsSL https://sincronizado.micr.dev/install.sh | bash

# Full (everything: + Discord bot, AI proxy, worktrees)
curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- --mode=full
```

#### Option 2: TUI Installer (Recommended)

The TUI installer provides a frictionless setup experience with one-click options:

```bash
# Run interactive installer
bunx sincronizado

# Or install globally first
npm install -g sincronizado
sincronizado
```

**TUI Features:**

1. Welcome screen with ASCII art
2. Mode selection (minimal/standard/full/custom)
3. AI agent selection (OpenCode/Claude)
4. **One-click shell alias setup** - type "opencode" anywhere
5. **OpenSync integration** - track sessions and costs
6. Component checkboxes (Discord bot, AI proxy, worktree sessions)
7. VPS provider template selection
8. Configuration (hostname, user, SSH key)
9. Installation confirmation
10. Real-time SSH progress
11. Completion summary with next steps

#### Option 3: Manual Setup

```bash
# 1. Install dependencies
# macOS:
brew install mutagen

# Windows:
winget install Mutagen.Mutagen

# 2. Clone repo
git clone https://github.com/microck/sincronizado.git
cd sincronizado

# 3. Setup VPS
ssh ubuntu@your-vps-ip
sudo ./scripts/setup-vps.sh --mode=standard --agent=opencode

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

### Step 4: Configure SSH MCP Server (Optional but Recommended)

For AI agents to manage the VPS via SSH commands, install the SSH MCP server:

```bash
# Install SSH MCP server
npm install -g @tufantunc/ssh-mcp

# Or with uv
uv tool install ssh-mcp

# Configure MCP server
# Add to your AI client's MCP configuration:
```

**OpenCode Configuration:**

```json
{
  "mcp": {
    "ssh": {
      "command": ["ssh-mcp"],
      "enabled": true,
      "type": "local",
      "environment": {
        "SSH_HOST": "your-vps.tailnet.ts.net",
        "SSH_USER": "ubuntu",
        "SSH_KEY": "~/.ssh/id_rsa"
      }
    }
  }
}
```

**Claude Desktop Configuration:**

```json
{
  "mcpServers": {
    "ssh": {
      "command": "ssh-mcp",
      "env": {
        "SSH_HOST": "your-vps.tailnet.ts.net",
        "SSH_USER": "ubuntu",
        "SSH_KEY": "~/.ssh/id_rsa"
      }
    }
  }
}
```

**File location**:

- OpenCode: `~/.config/opencode/opencode.json`
- Claude Desktop (macOS): `~/Library/Application Support/Claude/claude_desktop_config.json`
- Claude Desktop (Windows): `%APPDATA%\Claude\claude_desktop_config.json`
- Claude Desktop (Linux): `~/.config/Claude/claude_desktop_config.json`

### Step 5: Verify Setup

Run these verification commands:

```bash
# Check sync status
mutagen sync list

# Check AI agent on VPS
ssh ubuntu@your-vps-ip "systemctl status opencode"  # or "systemctl status claude"

# Check Agent-OS (if installed)
ssh ubuntu@your-vps-ip "systemctl status agent-os"

# Test file sync
echo "test" > test.txt
# Wait 5 seconds, then verify on VPS:
ssh ubuntu@your-vps-ip "cat ~/projects/myapp/test.txt"
```

**If verification fails:**

- Check Tailscale connection: `tailscale status`
- Verify SSH access: `ssh ubuntu@your-vps-ip`
- Check Mutagen daemon: `mutagen daemon start`
- Review VPS logs: `ssh ubuntu@your-vps-ip "journalctl -u opencode -f"`

### Step 6: Start Using

**Launch AI session:**

```bash
# OpenCode
./launcher/opencode.sh -p myproject

# Claude Code
./launcher/claude.sh -p myproject

# Windows PowerShell
.\launcher\opencode.ps1 -Project myproject
.\launcher\claude.ps1 -Project myproject
```

**Access mobile UI:**

```
http://your-vps.tailnet.ts.net:3000
```

### Step 7: Configure IDE (Optional)

**VS Code:**

- Install "Remote - SSH" extension
- Connect to VPS via SSH
- Or use local VS Code with remote file sync

**JetBrains:**

- Use built-in SSH deployment
- Or mount remote directory via SSHFS

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
