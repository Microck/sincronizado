# Sincronizado

> **Hyper-local development stack with remote AI execution**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/microck/sincronizado/workflows/CI/badge.svg)](https://github.com/microck/sincronizado/actions)
[![Documentation](https://img.shields.io/badge/docs-docusaurus-blue.svg)](https://microck.github.io/sincronizado/)

**Sincronizado** combines best-in-class tools into a cohesive development environment where you edit files locally while your AI coding assistant runs on a remote VPS. Zero latency. Maximum AI power. Mobile accessible.

## What It Does

- **Local-First**: Edit files on Windows in VS Code, JetBrains, or any editor
- **Remote Execution**: Heavy AI tasks run on your Oracle VPS (Ashburn/Paris)
- **Zero Latency**: File sync completes in <500ms via Mutagen
- **Mobile Access**: Check status or chat from your phone via Agent-OS Web UI
- **Collision-Proof**: Hash-based project identification prevents conflicts

## Quick Start

```powershell
# 1. Install on Windows (PowerShell)
winget install Mutagen.Mutagen
# Or: choco install mutagen

# 2. Clone and run setup
git clone https://github.com/microck/sincronizado.git
cd sincronizado
.\scripts\setup.ps1

# 3. Start development
.\launcher\opencode.ps1
```

Your VPS session is now running! Edit files locally and watch them sync instantly.

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   Windows PC    │         │    Oracle VPS        │
│                 │         │                      │
│  ┌───────────┐  │ Mutagen│  ┌────────────────┐ │
│  │VS Code    │◄─┼────────┼─►│ OpenCode AI   │ │
│  └───────────┘  │   Sync  │  │ Agent          │ │
│                 │         │  └────────────────┘ │
│  ┌───────────┐  │         │  ┌────────────────┐ │
│  │opencode.ps1│◄─┼────Tailscale─►│ Tmux Sessions │ │
│  └───────────┘  │         │  └────────────────┘ │
│                 │         │                      │
└─────────────────┘         └──────────────────────┘
       ▲                              ▲
       │                              │
   Keyboard                  http://vps:3000
       │                              │
       └──────────────────────────────┘
               Mobile Phone
```

## Key Components

| Component | Purpose |
|-----------|---------|
| **Tailscale** | Secure, zero-config VPN |
| **Eternal Terminal** | Resilient connections (survives network drops) |
| **Mutagen** | Bi-directional file sync in real-time |
| **Agent-OS** | Web-based mobile UI for remote access |
| **OpenCode** | AI coding assistant running on VPS |

## Documentation

- 📖 [Full Documentation](https://microck.github.io/sincronizado/)
- 🚀 [Quick Start Guide](https://microck.github.io/sincronizado/docs/quick-start)
- 🏗️ [Architecture](https://microck.github.io/sincronizado/docs/architecture)
- 🤖 [Configuration Guide](https://microck.github.io/sincronizado/docs/configuration)

## Use Cases

### Local Development
Edit files on your powerful Windows machine with your favorite tools while the AI agent handles heavy lifting on the VPS.

### Mobile Monitoring
Check your development progress from your phone while commuting or traveling. Full access to sessions via web UI.

### Network Resilience
Eternal Terminal keeps your session alive even when switching between WiFi and 5G. No more SSH disconnections.

### Team Collaboration
Share project sessions with team members. Collaborate in real-time while maintaining local development speed.

## Installation

### Prerequisites

- Windows 10+ or macOS 12+
- VPS with Ubuntu 20.04+ or Debian 11+
- Tailscale account
- Git

### Windows

```powershell
# Using winget
winget install Mutagen.Mutagen

# Using Chocolatey
choco install mutagen

# Run setup script
.\scripts\setup.ps1
```

### macOS

```bash
# Using Homebrew
brew install mutagen

# Run setup script
./scripts/setup.sh
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

- [ ] Phase 1: Create Project Structure
- [ ] Phase 2: VPS Setup Script
- [ ] Phase 3: Windows Launcher (opencode.ps1)
- [ ] Phase 4: macOS Launcher (opencode.sh)
- [ ] Phase 5: Configuration System
- [ ] Phase 6: Multi-VPS Provider Support
- [ ] Phase 7: Plugin Documentation
- [ ] Phase 8: Mobile Access Documentation
- [ ] Phase 9: Workflow Documentation
- [ ] Phase 10: Testing & Validation
- [ ] Phase 11: Packaging & Distribution
- [ ] Phase 12: Documentation Site
- [ ] Phase 13: Launch & v1.0.0 Release

See [ROADMAP.md](.planning/ROADMAP.md) for complete details.

## License

MIT © 2026 Sincronizado

## Acknowledgments

Built with:
- [Tailscale](https://tailscale.com/)
- [Eternal Terminal](https://eternalterminal.dev/)
- [Mutagen](https://mutagen.io/)
- [Agent-OS](https://github.com/saadnvd1/agent-os)
- [OpenCode](https://github.com/opencode-org/opencode)

---

**Made with ❤️ for developers who need power and flexibility**
