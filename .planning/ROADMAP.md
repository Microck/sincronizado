# Roadmap: sincronizado

**Created:** 2025-02-02
**Depth:** Quick (7 phases)
**Total Requirements:** 42 (v1.0) + 10 (v1.1)

## Phases

### Phase 1: Foundation & Core MVP

**Goal:** User can connect to VPS, establish a persistent tmux session, and have files sync bidirectionally.

**Requirements:**
- CONN-01: User sees connection state (connected/disconnected/reconnecting)
- CONN-02: Connection uses heartbeat/keepalive to detect dead connections
- CONN-03: User sees clear timeout message when connection fails
- SESS-01: User session persists through network interruptions (tmux on VPS)
- SESS-05: Sessions have human-readable names (sinc-{project}-{hash})
- SYNC-01: Files sync bidirectionally between local and VPS via Mutagen
- SYNC-02: Sync happens in real-time (sub-second for small changes)
- CLI-01: User can get help with `-h` / `--help`
- CLI-02: User can check version with `--version`
- CLI-03: CLI returns proper exit codes (0 success, non-zero failure)
- CLI-04: CLI outputs data to stdout and logs to stderr
- CONF-01: Config stored at `~/.config/sincronizado/config.json`
- CONF-02: Tool works out of the box with sensible defaults
- INFR-03: Unit tests for core logic

**Success Criteria:**
1. User runs `sinc` in a project folder and connects to VPS within 5 seconds
2. User sees "Connected" status and can interact with AI agent in tmux session
3. Files modified locally appear on VPS within 1 second; VPS changes sync back
4. User disconnects cleanly and can reconnect with same project context
5. Running `sinc --help` displays all available commands and options

**Plans:** 3 plans in 3 waves

Plans:
- [ ] 01-01-PLAN.md — Foundation & Scaffolding (project setup, config, CLI entry)
- [ ] 01-02-PLAN.md — Connection & Session Layer (SSH/tmux/Mutagen wrappers)
- [ ] 01-03-PLAN.md — Sync & Integration (main flow, tests)

---

### Phase 2: CLI Polish & Session Management

**Goal:** User has complete control over multiple sessions with full CLI experience.

**Requirements:**
- SESS-02: User can list all active sessions (`sinc --list`)
- SESS-03: User can resume existing session (`sinc -r`)
- SESS-04: Sessions terminate cleanly with no orphan processes
- SESS-06: User can kill specific session (`sinc --kill <name>`)
- SYNC-03: User can configure ignore patterns for sync
- SYNC-04: User sees sync status on launch before connecting
- CLI-05: User can suppress output with quiet mode (`-q`)
- CLI-06: User can get debug output with verbose mode (`-v`)
- CLI-07: User can get machine-readable output with `--json`
- CLI-08: User can install shell completions for bash/zsh/fish

**Success Criteria:**
1. User with 3 projects running can see all sessions with `sinc --list`
2. User can resume yesterday's session with `sinc -r` and find all work preserved
3. User can configure .syncignore to exclude node_modules and see it take effect
4. Scripts can parse `sinc --list --json` output for automation
5. Tab completion suggests `sinc --` options in user's shell

---

### Phase 3: Reliability & Robustness

**Goal:** User has a self-healing connection that survives network disruptions and handles edge cases gracefully.

**Requirements:**
- CONN-04: Connection auto-reconnects after network changes
- CONN-05: Connection falls back through protocol chain (SSH -> ET -> Mosh based on availability)
- SYNC-05: System detects when same file is changed on both sides (conflict)
- INFR-04: Integration tests for SSH and Mutagen operations

**Success Criteria:**
1. User's laptop sleeps for 30 minutes, wakes, and connection resumes automatically
2. User switches from WiFi to mobile hotspot and session continues without intervention
3. User modifies same file on both machines; system alerts and preserves both versions
4. CI runs integration tests against real SSH and Mutagen on every PR

---

### Phase 4: Installation, Documentation & Distribution

**Goal:** New user can install sincronizado with one command, configure their VPS, and find comprehensive documentation.

**Requirements:**
- INST-01: User can install via TUI installer (@clack/prompts)
- INST-02: User can install via web one-liner that launches TUI
- INST-03: Installer auto-installs Bun and Mutagen if missing
- INST-04: Installer auto-adds sinc to PATH
- INST-05: Installer can run VPS setup script (setup-vps.sh)
- INST-06: Tool auto-checks for updates on launch and prompts if available
- INST-07: User can uninstall with `sinc --uninstall`
- INST-08: User can reconfigure with `sinc --setup`
- INST-09: Windows installer spawns CMD window for TUI rendering
- DOCS-01: Mintlify docs site at sincronizado.micr.dev
- DOCS-02: INSTALL.md for LLM agents (detailed step-by-step guide)
- DOCS-03: README with quick start guide
- INFR-01: GitHub releases with semantic versioning
- INFR-02: GitHub Actions CI runs tests on Windows, macOS, Linux

**Success Criteria:**
1. User on fresh macOS runs `curl | bash` and has working `sinc` command in under 2 minutes
2. Windows user runs PowerShell installer and sees beautiful TUI in CMD window
3. User with blank VPS runs `sinc --setup` and has AI agent running in 5 minutes
4. LLM agent can follow INSTALL.md and successfully set up sincronizado
5. New version auto-publishes to GitHub Releases when tag is pushed

---

## Phase Dependencies

```
Phase 1 ─────> Phase 2 ─────> Phase 3
    │              │              │
    │              │              v
    └──────────────┴─────> Phase 4
```

**Critical Path:** Phase 1 -> Phase 2 -> Phase 3 (core functionality)
**Parallel Track:** Phase 4 can begin after Phase 1 basics are stable

## Requirement Coverage Summary

| Category | Count | Phase(s) |
|----------|-------|----------|
| Connection (CONN) | 5 | 1, 3 |
| Session (SESS) | 6 | 1, 2 |
| Sync (SYNC) | 5 | 1, 2, 3 |
| CLI | 8 | 1, 2 |
| Configuration (CONF) | 2 | 1 |
| Installation (INST) | 9 | 4 |
| Documentation (DOCS) | 3 | 4 |
| Infrastructure (INFR) | 4 | 1, 3, 4 |
| **Total** | **42** | |

---
*Roadmap created: 2025-02-02*
*Depth: Quick (4 phases, requirements-driven)*

---

## Milestone v1.1: CLI & Sync Control

### Phase 5: CLI Ergonomics & Command Dispatch

**Goal:** Users can use consistent short flags and git-like subcommands for core session actions.

**Requirements:**
- CLI-09: `sinc -k <id>` behaves exactly like `sinc --kill <id>`
- CLI-10: `sinc -l` behaves exactly like `sinc --list`
- CLI-11: `sinc kill <id>` behaves exactly like `sinc --kill <id>`
- CLI-12: `sinc list` behaves exactly like `sinc --list`
- CLI-13: `sinc push` and `sinc pull` appear in `sinc --help` output with clear descriptions

**Success Criteria:**
1. `sinc -k <id>` and `sinc --kill <id>` produce identical behavior and exit codes
2. `sinc list` and `sinc --list` produce identical output and exit codes
3. `sinc --help` clearly documents subcommands and short aliases

**Plans:** 1 plan in 1 wave

Plans:
- [x] 05-01-PLAN.md — Short flags + git-like subcommands (list/kill) + help docs for push/pull

---

### Phase 6: Manual Sync Commands (push/pull)

**Goal:** Users can manually force sync direction when needed, with safe defaults and explicit confirmations.

**Requirements:**
- SYNC-08: `sinc push` forces local state to remote for the current project sync session
- SYNC-09: `sinc pull` forces remote state to local for the current project sync session
- SYNC-10: `sinc push` and `sinc pull` show a clear overwrite summary (direction, session id, local path, remote path)
- SAFE-01: `sinc push` and `sinc pull` require explicit confirmation unless `--yes` is provided
- SAFE-02: `sinc push` and `sinc pull` fail fast when no sync session exists (suggest running `sinc`)

**Success Criteria:**
1. `sinc push` performs a force-direction sync for the current directory and reports success
2. `sinc pull` performs a force-direction sync for the current directory and reports success
3. Running `sinc push` or `sinc pull` without an active sync session prints an actionable error
4. Destructive actions require confirmation unless `--yes` is provided

**Plans:** 1 plan in 1 wave

Plans:
- [x] 06-01-PLAN.md — Manual push/pull commands with confirmation and force sync helper

---

### Phase 7: Docs & Release

**Goal:** Users can discover and safely use the new commands, and a tagged release is published.

**Requirements:**
- Documentation updated to include `sinc push`/`sinc pull` and short flag aliases
- Git tag + GitHub release created for v1.1

**Success Criteria:**
1. Docs show examples for `sinc push`, `sinc pull`, `sinc -k`, and `sinc kill`
2. Tagging the milestone version publishes a GitHub release

**Plans:** 1 plan in 1 wave

Plans:
- [x] 07-01-PLAN.md — Update docs for push/pull + short flags, create v1.1 release
