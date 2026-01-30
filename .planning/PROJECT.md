# Sincronizado

**Package hyper-local development solution so anyone can recreate it**

## Vision

Package complete solution I've built for local-first development with remote AI execution, so others can implement same workflow on their own infrastructure.

## The Problem I Solved

Running AI coding assistants on local machines is expensive and resource-intensive. Running them on cloud VPS requires:
- Constant SSH connections (fragile)
- Manual file syncing (slow, error-prone)
- No mobile access to monitor progress
- Complex setup for each project

## My Solution (From PLAN.md)

I combined best-in-class tools into a cohesive development environment:

```
Local Machine (Your PC)       VPS (Your Cloud Server)
┌─────────────────┐         ┌──────────────────────┐
│  VS Code/JetBrains│         │  OpenCode AI Agent   │
│  Your Editor      │◄────────┤  Running on Your VPS │
│                 │ Mutagen│  (AWS/GCP/Azure/DO)  │
│  opencode launcher│  Sync   │  Tmux Sessions       │
└─────────────────┘         └──────────────────────┘
       ▲                              ▲
       │   Tailscale (Your VPN)         │
       │                              │
       └──────────────────────────────┘
                 Mobile Phone
           (Agent-OS Web UI)
```

### Key Innovations

1. **Hash-Based Session IDs**
   - Problem: Project "app" in `D:\Work\` and `C:\Tmp\` collide
   - Solution: Hash full path → `app-3a5b2c` vs `app-7d8e9f`
   - Result: Zero collision, even with same project names

2. **Optimized Sync Strategy**
   - Problem: Syncing `node_modules`, `.venv`, `.git` is slow
   - Solution: Smart ignore patterns + directory separation
   - Result: <500ms sync for actual code changes

3. **Persistent Connections**
   - Problem: SSH drops when switching WiFi/5G
   - Solution: Eternal Terminal survives network changes
   - Result: Sessions stay alive through handoffs

4. **Mobile Access**
   - Problem: Can't check AI progress while commuting
   - Solution: Agent-OS web UI accessible via Tailscale
   - Result: Full session access from phone

5. **Plugin Ecosystem**
   - Problem: VPS headless, agent lacks context
   - Solution: agentmap provides tree view
   - Result: Agent "sees" entire codebase structure

## What Sincronizado Packages

Sincronizado packages this COMPLETE solution so you can:

1. **Recreate the architecture** on your infrastructure
2. **Use the same tools** (Tailscale, Mutagen, et, agent-os, etc.)
3. **Benefit from my optimizations** (hash collision, sync patterns)
4. **Customize as needed** (different VPS provider, ports, naming)

### Core Components (All Packaged)

| Component | Tool | Purpose | Status |
|-----------|------|---------|--------|
| **Connectivity** | Tailscale | Zero-config VPN | Reference existing |
| **Persistent Shell** | Eternal Terminal (`et`) | Network resilience | Reference existing |
| **File Sync** | Mutagen | <500ms bi-directional sync | Reference existing |
| **Session Launcher** | opencode launcher | Hash-based sessions, smart sync | **NEW - Package my script** |
| **Mobile UI** | Agent-OS | Web-based remote access | Reference existing |
| **Session Mgmt** | CCManager | Cleanup orphaned sessions | Reference existing |
| **Agent Context** | AgentMap | Tree view for headless VPS | Reference existing |
| **Environment** | OpenCode Direnv | Auto-load .envrc | Reference existing |
| **Config Sync** | OpenCode Sync | GitHub Gist sync | Reference existing |
| **History Search** | AI Sessions MCP | Search past sessions | Reference existing |

**NEW** = My innovation that needs packaging
**Reference existing** = Use official tools/installers

## What Users Get

When you install Sincronizado, you get:

### 1. Infrastructure Setup Scripts
- One-command VPS setup (Ubuntu/Debian)
- Firewall configuration
- All dependencies installed automatically
- Plugin ecosystem configured

### 2. Local Launchers
- Windows PowerShell launcher (`opencode.ps1`)
- macOS Bash launcher (`opencode.sh`)
- Hash-based session ID generation
- Smart Mutagen sync configuration
- Automatic session management

### 3. Configuration System
- `.opencode.config.json` for customization
- Your VPS details (NOT my ashburn/paris)
- Your port preferences
- Your session naming convention
- Plugin selection

### 4. Documentation
- How solution works
- How to set up your infrastructure
- How to customize for your needs
- Troubleshooting common issues
- Optimization tips

### 5. The Smart Solutions
- Hash collision detection (reusable)
- Optimized sync patterns (reusable)
- Session naming strategy (adaptable)
- Network resilience (architectural)

## Customization Points (This is NOT my exact setup)

Users can customize:

| Aspect | My Setup | Your Setup | Package Handles It |
|---------|-----------|------------|-------------------|
| **VPS Provider** | Oracle | AWS/GCP/Azure/DigitalOcean | ✅ Scripts for all |
| **VPS Locations** | Ashburn, Paris | Your regions | ✅ Configurable |
| **Session Prefix** | `mic-` | Your prefix | ✅ Configurable |
| **Ports** | 2222, 3000 | Your ports | ✅ Configurable |
| **Local Editor** | VS Code/JetBrains | Any editor | ✅ Works with all |
| **Network** | Tailscale | Tailscale or any VPN | ⚠️ Tailscale recommended |

**What's FIXED (the smart solutions):**
- Hash collision logic
- Sync strategy and patterns
- Session management workflow
- Plugin integration approach
- Architecture design

## Target Users

1. **Developers using AI coding assistants**
   - Need more power than local GPU provides
   - Want local editing experience
   - Use OpenCode, Cursor, or similar tools

2. **Remote development teams**
   - Want fast file editing
   - Need centralized AI execution
   - Require mobile monitoring

3. **Solopreneurs with limited resources**
   - Can't run big models locally
   - Want maximum efficiency
   - Need mobile access for productivity

## Success Metrics

- [ ] Anyone can set up VPS in <15 minutes
- [ ] Anyone can start dev session with one command
- [ ] File sync achieves <500ms latency
- [ ] Sessions survive network changes (WiFi ↔ 5G)
- [ ] Mobile access works out of box
- [ ] Zero collision even with duplicate project names

## Technical Constraints

### Must Support
- VPS OS: Ubuntu 20.04+, Debian 11+
- Local OS: Windows 10+, macOS 12+
- VPN: Tailscale (recommended) or compatible
- Sync: Mutagen (required for performance)
- Shell: Eternal Terminal (recommended) or compatible

### Architecture Requirements
- Hash-based session IDs (collision-proof)
- Smart sync ignore patterns
- Plugin ecosystem integration
- Mobile web UI (Agent-OS)

## Version 1.0 Scope

**Must Have (Complete Solution):**
- VPS setup script (Ubuntu/Debian, supports multiple providers)
- Windows launcher (my opencode.ps1 logic, customizable)
- macOS launcher (Bash equivalent)
- Configuration system (.opencode.config.json)
- Plugin ecosystem integration (all from PLAN.md)
- Complete documentation
- Troubleshooting guide

**Should Have (Enhanced Experience):**
- Pre-flight validation (check dependencies)
- Session management commands (list, kill, cleanup)
- Multi-VPS support (switch between servers)
- Configuration wizard (interactive setup)

**Could Have (Nice to Have):**
- GUI configuration tool
- Alternative VPN support
- Alternative sync tools
- Advanced analytics

## Reuse Strategy

### DO NOT Reinvent (Reference Existing Tools)
- Tailscale → Use official installer
- Mutagen → Use official installer
- Eternal Terminal → Reference official docs
- Agent-OS → Reference existing repo
- All plugins → Reference and integrate

### DO Package (My Innovations)
- opencode launcher (hash collision logic, smart sync)
- VPS setup script (orchestration of existing tools)
- Configuration system (unification of all settings)
- Optimization patterns (sync strategy, session naming)

### DO Document (Integrations)
- How each plugin integrates
- My workflow and optimizations
- Troubleshooting solutions I've discovered
- Best practices from my experience

---

## Questions for v1.0

1. **VPS Provider Scope**
   - Package scripts for just Oracle (my tested setup)?
   - Add AWS/GCP/Azure for v1.0?

2. **Configuration Format**
   - JSON file (.opencode.config.json)?
   - YAML?
   - Environment variables?

3. **macOS Support**
   - Include macOS launcher in v1.0?
   - Defer to v1.1?

4. **Session Naming**
   - Default prefix: `sync-` (neutral)?
   - Let user choose during setup?
