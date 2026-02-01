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

**If SSH MCP connection fails after restart:**

1. **Verify SSH works manually first:**

   ```bash
   ssh -o ConnectTimeout=10 USER_PROVIDED_USER@USER_PROVIDED_HOSTNAME "echo 'SSH OK'"
   ```

   If this fails, the issue is SSH connectivity, not MCP.

2. **Check MCP configuration loaded:**
   - OpenCode: Run `opencode /config` and verify "ssh" appears in MCP servers
   - Claude Desktop: Check settings → MCP servers → ssh

3. **Common MCP fixes:**
   - **"command not found: ssh-mcp"**: Ensure npm global bin is in PATH
   - **"SSH connection refused"**: Verify Tailscale is running on both sides
   - **"Permission denied"**: Check SSH key permissions are 600: `chmod 600 USER_PROVIDED_KEY_PATH`

4. **Retry with explicit path:**
   If `ssh-mcp` isn't found, use full path:
   ```bash
   which ssh-mcp  # Get full path
   # Then update MCP config to use full path
   ```

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

**If VPS setup script fails:**

```bash
# Check exit code and capture error
if [ $? -ne 0 ]; then
  echo "VPS setup failed. Common causes:"
  echo "  1. No internet connection on VPS"
  echo "  2. Insufficient disk space (need 2GB+)"
  echo "  3. Package manager locked (another apt process running)"
  echo "  4. Missing sudo permissions"

  # Check disk space
  df -h /

  # Check for apt lock
  if lsof /var/lib/dpkg/lock-frontend &>/dev/null; then
    echo "Another apt process is running. Wait or kill it:"
    echo "  sudo killall apt apt-get"
    echo "  sudo rm -f /var/lib/dpkg/lock-frontend"
  fi

  # Offer to retry
  echo "Would you like to retry the setup? (y/n)"
fi
```

**Verify services started:**

```bash
# Check all services and capture failures
FAILED_SERVICES=""

for service in opencode agent-os eternal-terminal; do
  if ! systemctl is-active "$service" &>/dev/null; then
    FAILED_SERVICES="$FAILED_SERVICES $service"
    echo "✗ $service failed to start"
    # Get last 20 lines of logs for debugging
    journalctl -u "$service" --no-pager -n 20
  else
    echo "✓ $service running"
  fi
done

# If services failed, try to restart them
if [ -n "$FAILED_SERVICES" ]; then
  echo "Some services failed. Attempting restart..."
  for service in $FAILED_SERVICES; do
    sudo systemctl restart "$service"
    sleep 2
    if systemctl is-active "$service" &>/dev/null; then
      echo "✓ $service restarted successfully"
    else
      echo "✗ $service still failing - check logs with: journalctl -u $service -f"
    fi
  done
fi
```

**Common service failures and fixes:**

| Issue                | Fix                                              |
| -------------------- | ------------------------------------------------ | ------------------------------------ |
| Port 2222 in use     | `sudo lsof -ti:2222                              | xargs kill -9` then restart ET       |
| Port 3000 in use     | `sudo lsof -ti:3000                              | xargs kill -9` then restart agent-os |
| Missing dependencies | `sudo apt-get update && sudo apt-get install -f` |
| Permission denied    | `sudo chown -R $USER:$USER ~/.config/opencode`   |

### Step 4: Local Environment Setup

**Detect user's OS:**

```bash
# Check OS
uname -s  # Linux/macOS show "Linux" or "Darwin"
echo $OS  # Windows shows "Windows_NT"
```

**Check if sincronizado already installed:**

```bash
if [ -d "$HOME/.sincronizado/.git" ]; then
  echo "Sincronizado already installed. Updating..."
  cd "$HOME/.sincronizado" && git pull
else
  echo "Cloning sincronizado..."
  git clone https://github.com/microck/sincronizado.git "$HOME/.sincronizado"
fi
```

**Install Mutagen (if not already installed):**

```bash
# Check if mutagen installed
if ! command -v mutagen &> /dev/null; then
  echo "Installing Mutagen..."
  # macOS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install mutagen
  # Linux
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    curl -fsSL https://github.com/mutagen-io/mutagen/releases/latest/download/mutagen_linux_amd64.tar.gz | tar xz -C /tmp
    sudo mv /tmp/mutagen /usr/local/bin/
  # Windows
  elif [[ "$OS" == "Windows_NT" ]]; then
    winget install Mutagen.Mutagen
  fi
else
  echo "Mutagen already installed"
fi

# Start mutagen daemon if not running
mutagen daemon start 2>/dev/null || true
```

**Create local config** based on agent choice:

**If OpenCode:** `.opencode.config.json`

**If Claude Code:** `.claude.config.json`

Both files have same structure:

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

**Ask user about alias setup:**

```
Do you want to create a shortcut command so you can type 'opencode' from anywhere? (y/n) [y]
```

If yes:

```
What command name do you want? [default: opencode]
```

Set up the alias:

**Windows (PowerShell):**
Add to `$PROFILE`:

```powershell
function ALIAS_NAME { & "$env:USERPROFILE\.sincronizado\launcher\opencode.ps1" }
```

**macOS/Linux:**
Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias ALIAS_NAME='~/.sincronizado/launcher/opencode.sh'
```

Tell user:

> "Alias 'ALIAS_NAME' added. Restart your terminal or run `source ~/.bashrc` (or `$PROFILE` on Windows) to use it."

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

**Show success message (customize with actual values):**

> Setup complete!
>
> VPS (USER_PROVIDED_HOSTNAME):
>
> - Eternal Terminal: Running ✓
> - OpenCode: Installed ✓
> - Agent-OS: Installed ✓
>
> Local:
>
> - Sincronizado: Cloned ✓
> - Mutagen: Installed ✓
> - Config: Created ✓
>
> **Quick start:**
>
> ```
> cd /path/to/your-project
> ALIAS_NAME -p your-project
> ```
>
> **Access your VPS:**
>
> - SSH: ssh USER_PROVIDED_USER@USER_PROVIDED_HOSTNAME
> - Web UI: http://USER_PROVIDED_HOSTNAME:3000
>
> Note: http://USER_PROVIDED_HOSTNAME:3000 is only accessible via Tailscale VPN
>
> **Need help?** Run verification anytime or check troubleshooting below.

**Ask for star:**

> "If you found this helpful, would you like to star the repository? It helps the project grow! ᕙ(⇀‸↼‶)ᕗ"

If user agrees, run:

```bash
gh repo star microck/sincronizado
```

**Important**: Only run if user explicitly says yes. Never run automatically without consent.

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

### Additional Resources

- **Full Documentation**: https://sincronizado.micr.dev
- **GitHub Repo**: https://github.com/microck/sincronizado
- **Discord Community**: https://discord.gg/opencode
- **VPS Providers**: Oracle Cloud (free tier), Hetzner, DigitalOcean, AWS
- **Tailscale**: https://tailscale.com
