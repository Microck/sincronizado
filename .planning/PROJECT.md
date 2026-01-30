# Sincronizado

**Hyper-Local Development Stack for the AI-Native Era**

## Vision

A unified development environment that runs your AI coding assistant on remote VPS while keeping file editing instant on your local machine. Zero latency. Maximum AI power. Mobile accessible.

## The Problem

Running large AI models locally is expensive and resource-intensive. Running them on cloud VPS requires constant SSH connections and file syncing overhead. Developers want:
- Local file editing with their favorite tools
- Remote AI execution with powerful GPUs
- Instant synchronization
- Mobile access to check progress

## The Solution

**Sincronizado** combines best-in-class tools into a cohesive development stack:
- **Tailscale**: Secure, zero-config VPN
- **Eternal Terminal**: Resilient connections (survives network drops)
- **Mutagen**: Bi-directional file sync in real-time
- **Agent-OS**: Web-based mobile UI for remote access
- **OpenCode**: AI coding assistant running on VPS

## What Makes It Special

- **Local-First**: Edit files on Windows with VS Code, JetBrains, or any editor
- **Remote Execution**: Heavy AI tasks run on Oracle VPS (Ashburn/Paris)
- **Zero Latency**: Sync completes in <500ms
- **Mobile Access**: Check status or chat from your phone via web UI
- **Collision-Proof**: Hash-based project identification prevents conflicts

## Target Users

- Developers using AI coding assistants (OpenCode, Cursor, etc.)
- Teams working on large codebases
- Developers needing mobile access to their dev environment
- Those with limited local GPU resources

## Success Metrics

- Time to set up: <15 minutes from scratch
- File sync latency: <500ms
- Session reliability: 99%+ uptime through network changes
- Mobile UX: Full feature parity with desktop
- Documentation: Zero manual setup required

## Core Requirements

### Must Have (v1.0)
- Automated VPS setup script (Ubuntu/Debian)
- Windows installer/launcher script
- Mutagen configuration generator
- Project hash collision detection
- Mobile web UI integration
- Complete documentation

### Should Have (v1.0)
- Tailscale auto-configuration
- Session management (ccmanager integration)
- Environment variable isolation (direnv)
- Codebase context visualization (agentmap)
- Configuration sync across VPS instances

### Could Have (v2.0)
- GUI configuration tool
- Multiple VPS provider support
- Team collaboration features
- Analytics/telemetry
- Plugin marketplace

## Technical Constraints

- VPS: Ubuntu 20.04+ or Debian 11+
- Local: Windows 10+ or macOS 12+
- Network: Tailscale account required
- VPS: Root access or sudo privileges
- Local: Git for version control
