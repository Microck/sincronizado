# Draft: Phase 14-15 (Tiered Install + TUI)

## User Request Summary
Implement Phase 14 (tiered installation for setup-vps.sh) and Phase 15 (TUI installer using OpenTUI).

## Research Findings

### Current setup-vps.sh (278 lines)
- Monolithic - installs everything in sequence
- No mode flags - all-or-nothing
- Already installs: base deps, ET, Agent-OS, OpenCode plugins, ccmanager, UFW

### Existing Plans (from .planning/phases/)
- Phase 14: Detailed tool evaluations done (kimaki HIGH, lunaroute LOW, worktree MEDIUM)
- Phase 15: Screen flow designed (8 screens), project structure defined

### New Tools to Add
| Tool | Priority | Install Method |
|------|----------|----------------|
| kimaki | HIGH | npm + systemd |
| session-handoff | HIGH | plugin config |
| worktree-session | MEDIUM | npm plugin |
| lunaroute | LOW/OPTIONAL | binary download |
| agent-of-empires | LOW/OPTIONAL | curl install |

## Technical Decisions (CONFIRMED)

### Phase 14 Decisions
1. **Default mode**: `standard` (backward compatible - bare ./setup-vps.sh works)
2. **Kimaki token**: Interactive wizard on first run (npx kimaki prompts)
3. **Error handling**: Warn and continue (optional tools shouldn't break install)
4. **Session managers**: Mutually exclusive choice:
   - `--with-ccmanager` (default in standard/full)
   - `--with-agent-of-empires` (alternative)
   - If both specified: error or agent-of-empires wins

### Phase 15 Decisions
1. **Framework**: OpenTUI (same tech as OpenCode - dogfooding)
2. **Distribution**: Both npm + standalone binary
3. **Windows**: Day 1 priority

### Mode Component Matrix
| Component | minimal | standard | full | custom |
|-----------|---------|----------|------|--------|
| base deps | x | x | x | x |
| ET | x | x | x | x |
| UFW | x | x | x | x |
| Agent-OS | - | x | x | opt |
| ccmanager | - | x | x | opt* |
| OpenCode plugins | - | x | x | opt |
| kimaki | - | - | x | opt |
| session-handoff | - | - | x | opt |
| worktree-session | - | - | x | opt |
| lunaroute | - | - | x | opt |
| agent-of-empires | - | - | - | opt* |

*ccmanager and agent-of-empires mutually exclusive

## Scope Boundaries

### IN Scope
- Refactor setup-vps.sh with mode flags
- Add 4 new optional tools (kimaki, lunaroute, worktree, session-handoff)
- Create TUI installer with 8 screens
- npm package `sincronizado`
- curl one-liner install

### OUT Scope (Confirm)
- code-on-incus (Incus containers)
- agent-sessions (macOS only)
- GUI installer (web-based)

## Open Questions
See interview questions below.
