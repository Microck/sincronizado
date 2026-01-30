# Architecture

Understanding how Sincronizado works.

## Overview

Sincronizado creates a seamless bridge between your local development environment and a remote VPS running AI agents.

````mermaid
graph TB
    subgraph Local["Local Dev Machine"]
        direction TB
        Editors[VS Code / JetBrains]
        Launchers[Launcher Scripts]
        TUI[TUI Installer]
    end

    subgraph Network["Secure Network Layer"]
        TS[Tailscale VPN<br/>WireGuard]
        Mut[Mutagen Sync<br/>&lt;500ms latency]
        ET[Eternal Terminal<br/>resilient SSH]
    end

    subgraph VPS["Remote VPS<br/>Ubuntu/Debian"]
        direction TB
        AI[AI Agent<br/>OpenCode or Claude Code]
        TM[Tmux Sessions]
        AO[Agent-OS<br/>Web UI Port 3000]
        KR[Kimaki<br/>Discord Bot]
        LR[LunaRoute<br/>Port 8082]
    end

    subgraph Mobile["Mobile Access"]
        Phone[Phone/Tablet]
        Discord[Discord App]
    end

    Editors <-->|file sync| Mut
    Mut <-->|sync| AI
    Launchers <-->|ET SSH| TM
    TUI -.->|install| VPS
    TS -.->|encrypts all| Network
    Phone -->|browser| AO
    Discord <-->|commands| KR

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
- **Performance**: &lt;500ms latency
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

```mermaid
graph LR
    P1["Project 'app'<br/>D:\\Work\\app"] -->|SHA256| H1["sync-app-3a5b2c"]
    P2["Project 'app'<br/>C:\\Tmp\\app"] -->|SHA256| H2["sync-app-7d8e9f"]

    style H1 fill:#4CAF50
    style H2 fill:#2196F3
````

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
- **Performance**: &lt;0.5ms overhead

### 8. Git Worktree Sessions

- **Purpose**: Isolated development per task
- **Features**: Auto-creates worktree per session, auto-commits on exit
- **Safety**: Refuses to run on main branch
- **Cleanup**: Removes worktree after session ends

## Data Flow

```mermaid
sequenceDiagram
    participant Local as Local Editor
    participant Mut as Mutagen
    participant VPS as VPS AI Agent
    participant Remote as Remote Execution

    Local->>Mut: Save file
    Mut->>VPS: Sync changes (&lt;500ms)
    VPS->>Remote: Execute command
    Remote->>VPS: Return results
    VPS->>Mut: File changes
    Mut->>Local: Sync back
```

1. **Local Edit** → Mutagen detects change
2. **Sync** → File pushed to VPS in &lt;500ms
3. **Agent Notices** → AI sees updated code
4. **Remote Execution** → Heavy work runs on VPS
5. **Results Sync** → Output files return locally

## Security

- **VPN**: All traffic encrypted via Tailscale
- **No Open Ports**: Only accessible within VPN
- **Session Isolation**: Each project in separate tmux session
- **No Secrets in Repo**: Config stored locally only

## Performance

| Metric          | Target    | Achieved |
| --------------- | --------- | -------- |
| File Sync       | &lt;500ms | ✓        |
| Session Connect | &lt;2s    | ✓        |
| Network Handoff | Seamless  | ✓        |
| Mobile Access   | &lt;1s    | ✓        |

## Troubleshooting

See the [Troubleshooting Guide](./troubleshooting.md) for common issues.

```

```
