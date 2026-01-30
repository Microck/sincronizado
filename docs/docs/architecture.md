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
│  └───────────┘  │         │                      │
└─────────────────┘         └──────────────────────┘
       ▲                              ▲
       │                              │
   Editor                      http://vps:3000
       │                              │
       └──────────────────────────────┘
           Mobile Phone (Agent-OS)
```

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

| Metric | Target | Achieved |
|--------|--------|----------|
| File Sync | <500ms | ✓ |
| Session Connect | <2s | ✓ |
| Network Handoff | Seamless | ✓ |
| Mobile Access | <1s | ✓ |

## Troubleshooting

See the [Troubleshooting Guide](./troubleshooting.md) for common issues.
