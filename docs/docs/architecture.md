# Architecture

Understanding how Sincronizado works.

## Overview

Sincronizado creates a seamless bridge between your local development environment and a remote VPS running AI agents.

```
┌─────────────────┐         ┌──────────────────────┐
│   Local PC      │         │    Remote VPS        │
│  (Windows/Mac)  │◄───────►│  (Ubuntu/Debian)     │
│                 │ Mutagen │                      │
│  ┌───────────┐  │  Sync   │  ┌────────────────┐  │
│  │VS Code    │◄─┼────────┼─►│ OpenCode AI    │  │
│  └───────────┘  │         │  └────────────────┘  │
│                 │         │  ┌────────────────┐  │
│  ┌───────────┐  │ Tailscale│  │ Tmux Sessions  │  │
│  │opencode   │◄─┼────────┼─►│                │  │
│  │launcher   │  │         │  └────────────────┘  │
│  └───────────┘  │         │  ┌────────────────┐  │
│                 │         │  │ Agent-OS       │  │
│ TUI Installer   │         │  │ (Port 3000)    │  │
│ (Optional)      │         │  └────────────────┘  │
└─────────────────┘         │  ┌────────────────┐  │
       ▲                    │  │ Kimaki         │  │
       │                    │  │ Discord Bot    │  │
   Discord              │  └────────────────┘  │
   (Optional)              │  ┌────────────────┐  │
       │                    │  │ LunaRoute      │  │
       └────────────────────┴─►│ (Port 8082)    │  │
                               └────────────────┘  │
                               └──────────────────────┘
```

## Installation Tiers

Sincronizado supports tiered installation to match your needs:

### Minimal Mode

Core components only:

- Eternal Terminal (resilient SSH)
- OpenCode (AI agent)
- UFW (firewall)

**Use case**: Headless servers, CI/CD environments, resource-constrained VPS.

### Standard Mode (Recommended)

Adds convenience features:

- Agent-OS (Web UI for mobile access)
- ccmanager (Session management TUI)
- OpenCode plugins (direnv, agentmap, sync, ai-sessions)

**Use case**: Daily development with mobile monitoring.

### Full Mode

Adds advanced features:

- Kimaki (Discord bot with voice support)
- LunaRoute (AI proxy for debugging)
- Worktree-session (Git worktree per task)
- Session-handoff (Context continuation)

**Use case**: Power users, team collaboration, advanced workflows.

### Custom Mode

Pick individual components via TUI or flags.

**Use case**: Specific requirements, testing new features.

## Components

### 1. File Sync (Mutagen)

- **Purpose**: Real-time bidirectional sync
- **Performance**: <500ms latency
- **Smart Ignores**: node_modules, .venv, .git excluded
- **Conflict Resolution**: Local wins by default

### 2. Network Layer (Tailscale)

- **Purpose**: Zero-config VPN
- **Security**: WireGuard-based encryption
- **DNS**: MagicDNS for easy hostname access
- **Mobile**: iOS/Android apps available

### 3. Persistent Shell (Eternal Terminal)

- **Purpose**: Survive network changes
- **Reconnection**: Automatic with state preservation
- **Compatibility**: Drop-in SSH replacement
- **Mobile**: Works over unstable connections

### 4. Session Management

**Hash-Based IDs:**

```
Project "app" in D:\Work\ → sync-app-3a5b2c
Project "app" in C:\Tmp\  → sync-app-7d8e9f
```

**Benefits:**

- Zero collision even with duplicate project names
- Deterministic based on full path
- 6-character hash for readability

### 5. Mobile Access (Agent-OS)

- **Web UI**: Access from any browser
- **Real-time**: See agent output live
- **Control**: Start/stop sessions remotely
- **Responsive**: Works on phone screens

## Optional Components (Full Mode)

### 6. Discord Integration (Kimaki)

- **Purpose**: Control agents via Discord
- **Features**: Text commands, voice transcription, file attachments
- **Architecture**: One bot per VPS, channels map to projects, threads map to sessions
- **Security**: Role-based access ("Kimaki" role required)

### 7. AI Debugging (LunaRoute)

- **Purpose**: Proxy and monitor AI API calls
- **Features**: Token tracking, session recording, cost analysis
- **Web UI**: Debug dashboard at port 8082
- **Performance**: <0.5ms overhead

### 8. Git Worktree Sessions

- **Purpose**: Isolated development per task
- **Features**: Auto-creates worktree per session, auto-commits on exit
- **Safety**: Refuses to run on main branch
- **Cleanup**: Removes worktree after session ends

## Data Flow

1. **Local Edit** → Mutagen detects change
2. **Sync** → File pushed to VPS in <500ms
3. **Agent Notices** → AI sees updated code
4. **Remote Execution** → Heavy work runs on VPS
5. **Results Sync** → Output files return locally

## Security

- **VPN**: All traffic encrypted via Tailscale
- **No Open Ports**: Only accessible within VPN
- **Session Isolation**: Each project in separate tmux session
- **No Secrets in Repo**: Config stored locally only

## Performance

| Metric          | Target   | Achieved |
| --------------- | -------- | -------- |
| File Sync       | <500ms   | ✓        |
| Session Connect | <2s      | ✓        |
| Network Handoff | Seamless | ✓        |
| Mobile Access   | <1s      | ✓        |

## Troubleshooting

See the [Troubleshooting Guide](./troubleshooting.md) for common issues.
