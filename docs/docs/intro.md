---
slug: /
---

# Sincronizado Documentation

Welcome to the Sincronizado documentation. Sincronizado is a hyper-local development stack that combines local file editing with remote AI execution.

## What is Sincronizado?

Sincronizado packages the complete solution for local-first development with remote AI execution. Edit files locally in VS Code while your AI coding assistant runs on a powerful remote VPS.

### Key Features

- **Local-First Development**: Edit files on your local machine with your favorite tools
- **Remote AI Execution**: Heavy AI tasks run on your VPS
- **Zero Latency Sync**: File sync completes in <500ms via Mutagen
- **Mobile Access**: Monitor progress from your phone via Agent-OS Web UI or Discord
- **Interactive Installer**: TUI-based setup with component selection
- **Tiered Installation**: Choose Minimal, Standard, Full, or Custom modes
- **Collision-Proof**: Hash-based project identification prevents conflicts

### Installation Options

**TUI Installer (Recommended):**

```bash
bunx sincronizado
```

**One-Liner Script:**

```bash
curl -fsSL https://sincronizado.dev/install.sh | bash
```

**Tiered Modes:**

- **Minimal**: Core only (ET, OpenCode, UFW) - for headless servers
- **Standard**: Recommended setup with Agent-OS, ccmanager, plugins
- **Full**: Everything including Kimaki Discord bot, LunaRoute proxy
- **Custom**: Pick individual components

### New in v1.1.0

- **TUI Installer**: Interactive 8-screen setup with OpenTUI
- **Kimaki Integration**: Control agents via Discord with voice support
- **LunaRoute**: AI proxy for debugging and token tracking
- **Worktree Sessions**: Automatic git worktree per session
- **Session Handoff**: Seamless context continuation
- **Agent-of-Empires**: Alternative session manager

## Quick Links

- [Quick Start Guide](./quick-start.md) - Get up and running in 5 minutes
- [Architecture](./architecture.md) - Understand how it works
- [Configuration](./configuration.md) - Customize for your needs
- [Plugins](./plugins.md) - Extend functionality
- [Mobile Access](./mobile-access.md) - Agent-OS and Discord integration

## Getting Help

- [GitHub Issues](https://github.com/microck/sincronizado/issues)
- [OpenCode Discord](https://discord.gg/opencode)
