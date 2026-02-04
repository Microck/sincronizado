# sincronizado

## What This Is

A cross-platform CLI tool that instantly connects your local machine to a VPS running an AI coding agent (OpenCode or Claude) with bidirectional file sync via Mutagen. One command (`sinc`) from any project folder → SSH to VPS, attach tmux session, files synced. Public release targeting developers who want powerful remote AI-assisted development without local resource constraints.

## Core Value

Run `sinc` anywhere → instantly connected to VPS AI agent with synced files.

## Requirements

### Validated

- [x] Cross-platform launcher (sinc.ts) in Bun — v1.0
- [x] Session management: `sinc` (fresh), `sinc -r` (resume), `sinc --list`, `sinc --kill` — v1.0
- [x] Hash-based session IDs: sinc-{project}-{hash} — v1.0
- [x] Protocol fallback chain: SSH guaranteed, ET/Mosh optional (OS-aware) — v1.0
- [x] Initial sync wait with progress, then background sync during session — v1.0
- [x] Sync completion on exit before stopping Mutagen — v1.0
- [x] Multiple simultaneous projects supported — v1.0
- [x] Configurable command name (default: sinc) — v1.0
- [x] Auto-check for updates on launch (prompt if available) — v1.0
- [x] Uninstall command (`sinc --uninstall`) — v1.0
- [x] Reconfigure command (`sinc --setup`) — v1.0
- [x] @clack/prompts-based TUI (like legacy) — v1.0
- [x] Windows: spawn CMD window for proper TUI rendering — v1.0
- [x] Agent selection: OpenCode or Claude — v1.0
- [x] Sync mode selection: none / pull / push / both — v1.0
- [x] VPS config: hostname, user, port — v1.0
- [x] SSH key handling: generate new or use existing (user specifies path) — v1.0
- [x] Connection test before proceeding — v1.0
- [x] Optional VPS setup: minimal by default, hardening as extra step — v1.0
- [x] Detect + offer to install AI agent if missing on VPS — v1.0
- [x] User-configurable sync ignores — v1.0
- [x] User-configurable workspace path (with default choices) — v1.0
- [x] Auto-add to PATH on all platforms — v1.0
- [x] Auto-install dependencies (Bun, Mutagen) if missing — v1.0
- [x] setup-vps.sh script for VPS configuration — v1.0
- [x] Minimal default: tmux, AI agent, workspace directory — v1.0
- [x] Optional hardening: firewall, fail2ban, non-root user — v1.0
- [x] Works with existing VPS or helps configure new — v1.0
- [x] Single VPS target for v1 — v1.0
- [x] sync.micr.dev hosting on Vercel — v1.0
- [x] One-liner install: `curl | bash` (Linux/macOS), `irm | iex` (Windows) — v1.0
- [x] Downloads and runs TUI installer — v1.0
- [x] Mintlify docs site at sincronizado.micr.dev — v1.0
- [x] INSTALL.md for LLM agents (detailed step-by-step guide) — v1.0
- [x] README with quick start — v1.0
- [x] Config at ~/.config/sincronizado/config.json — v1.0
- [x] Schema: VPS (hostname, user, port), sync (mode, ignores, remoteBase), session (prefix), agent, protocol preference — v1.0
- [x] Error verbosity configurable — v1.0
- [x] GitHub releases with semantic versioning — v1.0
- [x] GitHub Actions CI (tests on PR, auto-release on tag) — v1.0
- [x] Unit tests for core logic — v1.0
- [x] Integration tests for critical paths (SSH, Mutagen) — v1.0

### Active

## Current Milestone: v1.1 CLI & Sync Control

**Goal:** Improve CLI ergonomics and give users manual control over file synchronization.

**Target features:**
- CLI flag aliases (e.g., `-k` for `--kill`)
- Manual sync commands (`sinc push`, `sinc pull`)
- Standardized short flags for all commands

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
