# sincronizado

## What This Is

A cross-platform CLI tool that instantly connects your local machine to a VPS running an AI coding agent (OpenCode or Claude) with bidirectional file sync via Mutagen. One command (`sinc`) from any project folder → SSH to VPS, attach tmux session, files synced. Public release targeting developers who want powerful remote AI-assisted development without local resource constraints.

## Core Value

Run `sinc` anywhere → instantly connected to VPS AI agent with synced files.

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Launcher
- [ ] Cross-platform launcher (sinc.ts) in Bun
- [ ] Session management: `sinc` (fresh), `sinc -r` (resume), `sinc --list`, `sinc --kill`
- [ ] Hash-based session IDs: sinc-{project}-{hash}
- [ ] Protocol fallback chain: SSH guaranteed, ET/Mosh optional (OS-aware)
- [ ] Initial sync wait with progress, then background sync during session
- [ ] Sync completion on exit before stopping Mutagen
- [ ] Multiple simultaneous projects supported
- [ ] Configurable command name (default: sinc)
- [ ] Auto-check for updates on launch (prompt if available)
- [ ] Uninstall command (`sinc --uninstall`)
- [ ] Reconfigure command (`sinc --setup`)

#### TUI Installer
- [ ] @clack/prompts-based TUI (like legacy)
- [ ] Windows: spawn CMD window for proper TUI rendering
- [ ] Agent selection: OpenCode or Claude
- [ ] Sync mode selection: none / pull / push / both
- [ ] VPS config: hostname, user, port
- [ ] SSH key handling: generate new or use existing (user specifies path)
- [ ] Connection test before proceeding
- [ ] Optional VPS setup: minimal by default, hardening as extra step
- [ ] Detect + offer to install AI agent if missing on VPS
- [ ] User-configurable sync ignores
- [ ] User-configurable workspace path (with default choices)
- [ ] Auto-add to PATH on all platforms
- [ ] Auto-install dependencies (Bun, Mutagen) if missing

#### VPS Setup
- [ ] setup-vps.sh script for VPS configuration
- [ ] Minimal default: tmux, AI agent, workspace directory
- [ ] Optional hardening: firewall, fail2ban, non-root user
- [ ] Works with existing VPS or helps configure new
- [ ] Single VPS target for v1

#### Web Installer
- [ ] sync.micr.dev hosting on Vercel
- [ ] One-liner install: `curl | bash` (Linux/macOS), `irm | iex` (Windows)
- [ ] Downloads and runs TUI installer

#### Documentation
- [ ] Mintlify docs site at sincronizado.micr.dev
- [ ] INSTALL.md for LLM agents (detailed step-by-step guide)
- [ ] README with quick start

#### Configuration
- [ ] Config at ~/.config/sincronizado/config.json
- [ ] Schema: VPS (hostname, user, port), sync (mode, ignores, remoteBase), session (prefix), agent, protocol preference
- [ ] Error verbosity configurable

#### Infrastructure
- [ ] GitHub releases with semantic versioning
- [ ] GitHub Actions CI (tests on PR, auto-release on tag)
- [ ] Unit tests for core logic
- [ ] Integration tests for critical paths (SSH, Mutagen)

### Out of Scope

- Multiple VPS targets — single VPS for v1, multi-VPS in future version
- WSL integration on Windows — native Windows only
- Optional components (Kimaki, LunaRoute, Agent-OS, worktree sessions) — simplified core for v1
- Offline mode / queue — fail gracefully with clear error
- Telemetry / analytics — update check only (GitHub API)
- Mobile app — web-first

## Context

Rebuilding sincronizado from the ground up with a simplified, focused scope. The legacy version had many optional components (Kimaki Discord bot, LunaRoute AI proxy, Agent-OS web UI, worktree sessions, etc.). This version focuses on the core value proposition: one command to connect to remote AI development.

**Legacy assets to reuse:**
- Logo and branding from legacy/assets/
- TUI flow patterns from legacy/installer/
- INSTALL.md structure for LLM agent guide

**Key insight from legacy:** The @clack/prompts TUI doesn't render well in PowerShell, so Windows installer spawns a CMD window.

## Constraints

- **Runtime**: Bun only (no Node.js fallback)
- **Platforms**: Windows, macOS, Linux — true cross-platform from day one
- **Windows**: Native only, no WSL dependency
- **Protocol**: SSH always available; ET/Mosh only if user has them installed
- **Network**: Agnostic — works with direct IP, hostname, or Tailscale
- **License**: MIT

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Bun-only runtime | Fast, modern, good cross-platform support | — Pending |
| @clack/prompts for TUI | Proven in legacy, simple, no React needed | — Pending |
| CMD window for Windows TUI | PowerShell has TUI rendering issues | — Pending |
| SSH guaranteed, ET/Mosh optional | SSH is native everywhere; ET/Mosh require extra install | — Pending |
| Explicit session flags (sinc -r) | Predictable behavior, no magic auto-resume | — Pending |
| Single VPS for v1 | Simplify scope, multi-VPS in future | — Pending |
| Sync wait before connect | Ensure VPS has latest files before AI starts working | — Pending |
| Auto-install dependencies | Reduce friction for new users | — Pending |
| User-configurable command name | Some may want `sync`, `s`, or other aliases | — Pending |

---
*Last updated: 2025-02-02 after initialization*
