# Installation

## For Humans

Paste this into your LLM agent session:

```
Install and configure sincronizado by following instructions here:
https://raw.githubusercontent.com/Microck/sincronizado/main/INSTALL.md
```

**Alternative: Quick Install**

### One-liner (Recommended)

```bash
# Linux/macOS
curl -fsSL https://sync.micr.dev/install.sh | bash

# Then run the setup wizard
sinc --setup

# Windows (PowerShell)
irm https://sync.micr.dev/install.ps1 | iex

# Then run the setup wizard
sinc --setup
```

### TUI Installer (Interactive)

Requires [Bun](https://bun.sh).

```bash
# Clone repo
git clone https://github.com/Microck/sincronizado.git
cd sincronizado/installer

# Install and run
bun install
bun run src/index.ts
```

---

## For LLM Agents (Guided Setup)

If you're an LLM helping set up _sincronizado_, follow this **guided** workflow.

### Critical Rules

1. **NEVER run commands without user confirmation** - Always ask "Proceed? (y/n)" before executing
2. **Explain what you're about to do** - One sentence max, then ask
3. **Wait for explicit "yes" or "y"** - Do not assume consent
4. **Show results after each step** - Let user verify before continuing
5. **Stop on any error** - Explain what went wrong, ask how to proceed

### Flow Summary

```
Step 0: Check local prerequisites → report findings → ask to continue
Step 1: Configure SSH MCP → write config → restart session
Step 2: Auto-detect VPS state → show what's installed/missing → recommend → user confirms
Step 3: Execute setup → stream progress → handle errors → verify services
Step 4: Configure local → install mutagen → create config → setup alias
Step 5: Final verification → test sync → show access URLs → done
```

Each step = explain briefly + ask permission + execute + show result.

### Step 0: Verify Prerequisites

**Example interaction:**

> "Checking your system... [runs checks]
>
> Found: Ubuntu 22.04, Tailscale connected, SSH key at ~/.ssh/id_rsa
>
> Proceed with setup? (y/n)"

Check these requirements:

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

**Check for existing SSH MCP configs first:**

```bash
# Check if SSH MCP already configured
grep -o '"ssh[^"]*"' ~/.config/opencode/opencode.json 2>/dev/null || echo "No SSH MCP found"
```

**If SSH MCP already exists:**

> "Found existing SSH connection: ssh-usa (129.213.76.28)
> Use this for setup? (y/n)"

If yes → Skip to Step 2.
If no → Continue below to add new connection.

**If no SSH MCP exists**, ask for connection details:

> "I need 3 things to connect to your VPS:
>
> 1. Hostname (Tailscale): e.g., oracle.tail1234.ts.net
> 2. SSH user: e.g., ubuntu
> 3. SSH key path: e.g., ~/.ssh/id_rsa
>
> Please provide these."

**After user provides info, confirm before writing config:**

> "I'll add SSH MCP to your AI config at [path]. OK? (y/n)"

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

> "I've configured the SSH tool. **Please restart this AI session** (exit and start a new one) so I can connect to your VPS. When you return, paste the install instructions again, and I'll skip to Step 2."

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

### Step 2: Select VPS & Configure Components

**A. Select VPS (auto-detect existing)**

Check for existing SSH MCP configs:

```bash
# Parse SSH MCP entries from opencode config
jq -r '.mcp | to_entries[] | select(.key | startswith("ssh")) | "\(.key): \(.value.command[-3] // .value.command[-1])"' ~/.config/opencode/opencode.json 2>/dev/null || grep -E '"ssh[^"]*":' ~/.config/opencode/opencode.json
```

**Example output:**

```
ssh-oracle: --host=141.145.192.88
ssh-usa: --host=129.213.76.28
ssh-nas: --host=192.168.1.50
```

If **single found** → Use it automatically, tell user:

> "Using existing connection: ssh-usa (129.213.76.28). Proceed? (y/n)"

If **multiple found** → Ask:

> "Found 3 VPS connections. Which to use?
>
> 1. ssh-oracle (141.145.192.88)
> 2. ssh-usa (129.213.76.28)
> 3. ssh-nas (192.168.1.50)
>    Enter number (or 'all' to check each):"

**B. Detect Everything**

Run comprehensive checks to see what's already installed:

```bash
# VPS specs
free -h | grep Mem
cat /etc/os-release | grep PRETTY_NAME
nproc
df -h /

# Check installed components
which opencode claude et 2>/dev/null
dpkg -l | grep -E "eternal-terminal|et" 2>/dev/null
npm list -g --depth=0 2>/dev/null | grep -E "opencode|claude|agent-os|ccmanager|kimaki|lunaroute"

# Check running services
systemctl is-active opencode 2>/dev/null && echo "opencode: running" || echo "opencode: not running"
systemctl is-active agent-os 2>/dev/null && echo "agent-os: running" || echo "agent-os: not running"
systemctl is-active eternal-terminal 2>/dev/null && echo "et: running" || echo "et: not running"
systemctl is-active kimaki 2>/dev/null && echo "kimaki: running" || echo "kimaki: not running"

# Check ports
ss -tlnp 2>/dev/null | grep -E '2222|3000|8082' || netstat -tlnp 2>/dev/null | grep -E '2222|3000|8082'

# Check if sincronizado repo exists
ls -la ~/sincronizado/.git 2>/dev/null && echo "sincronizado: cloned" || echo "sincronizado: not cloned"
```

**C. Show Status & Recommend**

Parse detection output and present clearly:

> "**VPS:** Ubuntu 22.04.5 LTS, 23GB RAM, 4 cores ✓
>
> **Detected:**
>
> - OpenCode: installed ✓, not running
> - Eternal Terminal: installed ✓, not running
> - Agent-OS: not installed
> - ccmanager: not installed
> - Kimaki: not installed
> - LunaRoute: not installed
>
> **Actions needed:**
>
> 1. Start existing services (OpenCode, ET)
> 2. Install missing components (Agent-OS, ccmanager)
>
> **Recommend:** 'standard' mode
>
> - Start: OpenCode + ET
> - Install: Agent-OS + ccmanager + plugins
>
> Choose:
>
> 1. **start** - Just start existing services
> 2. **standard** - Start + install Agent-OS + ccmanager + plugins
> 3. **full** - Everything including Kimaki + LunaRoute
> 4. **custom** - Pick specific components
>
> Which? (1/2/3/4):"

**D. Handle Different Scenarios**

**Scenario 1: Everything installed + running**

> "All services running ✓
>
> - OpenCode: running
> - Agent-OS: running at http://hostname:3000
> - Eternal Terminal: running
>
> Skip to Step 4 (local setup)? (y/n)"

**Scenario 2: Everything installed but NOT running**

> "Components installed but stopped:
>
> - OpenCode: installed, not running
> - Agent-OS: installed, not running
> - ET: installed, not running
>
> Start services only? (y/n)"

**Scenario 3: Partial installation**

> "Partial setup:
>
> - ✓ Eternal Terminal: installed + running
> - ✗ OpenCode: not installed
> - ✗ Agent-OS: not installed
>
> Complete installation? (y/n)"

**Scenario 4: Fresh VPS**

> "Fresh VPS. Nothing installed.
>
> Recommend 'standard' for 23GB RAM:
>
> - Core: ET + OpenCode + UFW
> - Plus: Agent-OS + ccmanager + plugins
>
> Install standard? (y/n)"

**F. Security Hardening (Optional)**

Ask if user wants VPS hardening:

> "Enable VPS security hardening?
>
> - Create non-root user (recommended)
> - SSH key-only auth (disable password)
> - UFW firewall (ports 22, 2222, 3000 only)
>
> Enable? (y/n) [y]"

If yes:

> "Create non-root user? (username or 'no'): [deployer]"

**E. Confirm Actions**

Summarize before executing:

> "**Plan:**
>
> - Start services: opencode, eternal-terminal
> - Install: Agent-OS, ccmanager, plugins
> - Skip: Kimaki, LunaRoute
> - Already configured: UFW firewall
>
> Execute? (y/n)"

### Step 3: VPS Setup

> "Starting VPS setup. This takes ~3 minutes. Proceed? (y/n)"

Execute via SSH MCP:

```bash
# 1. Clone sincronizado repo on VPS
git clone https://github.com/Microck/sincronizado.git ~/sincronizado

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

**If OpenCode fails (404 error):**

The setup script has automatic fallback:

1. Tries official installer (opencode.ai)
2. Falls back to npm
3. Falls back to GitHub releases

If all fail, ask user:

> "OpenCode install failed. Options:
>
> 1. Retry (temporary network issue)
> 2. Install manually from github.com/opencode-ai/opencode
> 3. Use Claude Code instead
>    Choose (1/2/3):"

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

| Issue                | Fix                                                         |
| -------------------- | ----------------------------------------------------------- |
| Port 2222 in use     | `sudo lsof -ti:2222 \| xargs kill -9` then restart ET       |
| Port 3000 in use     | `sudo lsof -ti:3000 \| xargs kill -9` then restart agent-os |
| Missing dependencies | `sudo apt-get update && sudo apt-get install -f`            |
| Permission denied    | `sudo chown -R $USER:$USER ~/.config/opencode`              |

### Step 4: Local Environment Setup

> "VPS done! Now setting up your local machine.
>
> I'll install Mutagen (file sync) and create a config file.
>
> Proceed? (y/n)"

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
  git clone https://github.com/Microck/sincronizado.git "$HOME/.sincronizado"
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

**Ask for VPS Provider:**

> "Which VPS provider are you using? (oracle/hetzner/digitalocean/aws/other)"

**Create local config** based on agent choice and provider:

**If OpenCode:** `.opencode.config.json`

**If Claude Code:** `.claude.config.json`

Both files have same structure. Replace `USER_PROVIDED_PROVIDER` with their answer (default to `oracle` if unknown).

```json
{
  "vps": {
    "default": "my-vps",
    "hosts": {
      "my-vps": {
        "hostname": "USER_PROVIDED_HOSTNAME",
        "user": "USER_PROVIDED_USER",
        "port": 2222,
        "provider": "USER_PROVIDED_PROVIDER"
      }
    }
  }
}
```

**Ask user about alias setup:**

> "Create shortcut command to type 'opencode' from anywhere? (y/n) [y]"

If yes:

> "What command name? [default: opencode]"

**Auto-detect OS and set up accordingly:**

```bash
# Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OS" == "Windows_NT" ]]; then
    OS_TYPE="windows"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
else
    OS_TYPE="linux"
fi

echo "Detected: $OS_TYPE"
```

**Windows PowerShell:**

```powershell
Add-Content $PROFILE "`nfunction ALIAS_NAME { & `"`$env:USERPROFILE\.sincronizado\launcher\opencode.ps1`" }"
```

**Windows CMD (if PowerShell not available):**

```batch
echo @echo off >> %USERPROFILE%\opencode.bat
echo %USERPROFILE%\.sincronizado\launcher\opencode.bat %%* >> %USERPROFILE%\opencode.bat
setx PATH "%PATH%;%USERPROFILE%"
```

**macOS/Linux (Bash):**

```bash
echo "alias ALIAS_NAME='$HOME/.sincronizado/launcher/opencode.sh'" >> ~/.bashrc
```

**macOS/Linux (Zsh):**

```bash
echo "alias ALIAS_NAME='$HOME/.sincronizado/launcher/opencode.sh'" >> ~/.zshrc
```

Tell user:

> "Alias 'ALIAS_NAME' added for $OS_TYPE. Restart terminal or run `source ~/.bashrc` / `$PROFILE` to use."

### Step 5: Verification

> "Running final checks...
>
> VPS:
>
> - Eternal Terminal: running
> - OpenCode: running
> - Agent-OS: running at http://hostname:3000
>
> Local:
>
> - Mutagen: installed
> - Config: created
>
> Setup complete! Run `opencode` to start."

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
git clone https://github.com/Microck/sincronizado.git
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
git clone https://github.com/Microck/sincronizado.git
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
| "OpenCode 404 error"      | Script auto-retries with npm + GitHub fallback       |
| "Agent-OS not running"    | Run `sudo systemctl restart agent-os`                |
| "ET port 2222 in use"     | `sudo lsof -ti:2222 \| xargs kill -9`                |

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
- **GitHub Repo**: https://github.com/Microck/sincronizado
- **Discord Community**: https://discord.gg/opencode
- **VPS Providers**: Oracle Cloud (free tier), Hetzner, DigitalOcean, AWS
- **Tailscale**: https://tailscale.com
