# Quick Start

Get up and running with Sincronizado in 5 minutes.

## Prerequisites

- Windows 10+ or macOS 12+
- VPS with Ubuntu 20.04+ or Debian 11+
- Tailscale account
- Git

## Installation

### Option 1: TUI Installer (Recommended)

The interactive installer guides you through component selection:

```bash
# Via bunx (fastest)
bunx sincronizado

# Via npx
npx sincronizado

# Or install globally
npm install -g sincronizado
sincronizado
```

The TUI provides:

- Mode selection (Minimal/Standard/Full/Custom)
- Component checkboxes
- VPS provider templates
- Real-time installation progress

### Option 2: One-Liner Script

**Standard Mode (Recommended):**

```bash
curl -fsSL https://sincronizado.dev/install.sh | bash
```

**Minimal Mode (Core only):**

```bash
curl -fsSL https://sincronizado.dev/install.sh | bash -s -- --mode=minimal
```

**Full Mode (All features):**

```bash
curl -fsSL https://sincronizado.dev/install.sh | bash -s -- --mode=full
```

### Option 3: Manual Setup

**1. Install Dependencies**

**Windows (PowerShell):**

```powershell
winget install Mutagen.Mutagen
```

**macOS:**

```bash
brew install mutagen
```

**2. Clone Repository**

```bash
git clone https://github.com/microck/sincronizado.git
cd sincronizado
```

**3. Run VPS Setup**

SSH into your VPS and run:

```bash
# Standard mode (recommended)
sudo ./scripts/setup-vps.sh

# Or with specific components
sudo ./scripts/setup-vps.sh --mode=custom --with-kimaki --with-lunaroute
```

**4. Configure**

Edit `.opencode.config.json` with your VPS details:

```json
{
  "vps": {
    "host": "your-vps-ip",
    "user": "your-username",
    "port": 2222
  },
  "sync": {
    "alpha": ".",
    "beta": "~/projects/myapp",
    "ignore": [".git", "node_modules"]
  }
}
```

**5. Start Development**

**Windows:**

```powershell
.\launcher\opencode.ps1
```

**macOS:**

```bash
./launcher/opencode.sh
```

## Installation Modes

| Mode         | Components                            | Use Case                |
| ------------ | ------------------------------------- | ----------------------- |
| **Minimal**  | ET, OpenCode, UFW                     | Headless servers, CI/CD |
| **Standard** | + Agent-OS, ccmanager, plugins        | **Recommended**         |
| **Full**     | + Kimaki, LunaRoute, worktree-session | Power users             |
| **Custom**   | Pick components                       | Specific needs          |

### Optional Components

Add these flags to customize your installation:

```bash
--with-kimaki              # Discord bot for voice/text control
--with-lunaroute           # AI proxy with token tracking
--with-worktree-session    # Git worktree per session
--with-session-handoff     # Context continuation
--with-agent-of-empires    # Alternative session manager

--no-agent-os              # Skip web UI
--no-ccmanager             # Skip session manager
--no-plugins               # Skip OpenCode plugins
```

## Verify Installation

1. **Check sync**: Edit a file locally, verify it appears on VPS in &lt;500ms
2. **Test resilience**: Switch WiFi networks, session stays alive
3. **Mobile access**: Open `http://your-vps:3000` in browser
4. **Optional - Discord**: If you installed Kimaki, check Discord bot status

## Next Steps

- Read the [Architecture Guide](./architecture.md)
- Learn about [Configuration Options](./configuration.md)
- Explore the [Plugin Ecosystem](./plugins.md)
- Set up [Mobile Access with Kimaki](./mobile-access.md#kimaki-discord-integration)
