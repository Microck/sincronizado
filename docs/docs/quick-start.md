# Quick Start

Get up and running with Sincronizado in 5 minutes.

## Prerequisites

- Windows 10+ or macOS 12+
- VPS with Ubuntu 20.04+ or Debian 11+
- Tailscale account
- Git

## Installation

### 1. Install Dependencies

**Windows (PowerShell):**
```powershell
winget install Mutagen.Mutagen
```

**macOS:**
```bash
brew install mutagen
```

### 2. Clone Repository

```bash
git clone https://github.com/microck/sincronizado.git
cd sincronizado
```

### 3. Run Setup

**Windows:**
```powershell
.\scripts\setup.ps1
```

**macOS:**
```bash
./scripts/setup.sh
```

### 4. Configure

Edit `.opencode.config.json` with your VPS details:

```json
{
  "vps": {
    "host": "your-vps-ip",
    "user": "your-username",
    "port": 2222
  },
  "session_prefix": "sync-"
}
```

### 5. Start Development

**Windows:**
```powershell
.\launcher\opencode.ps1
```

**macOS:**
```bash
./launcher/opencode.sh
```

## Verify Installation

1. Check sync: Edit a file locally, verify it appears on VPS in <500ms
2. Test resilience: Switch WiFi networks, session stays alive
3. Mobile access: Open `http://your-vps:3000` in browser

## Next Steps

- Read the [Architecture Guide](./architecture.md)
- Learn about [Configuration Options](./configuration.md)
- Explore the [Plugin Ecosystem](./plugins.md)
