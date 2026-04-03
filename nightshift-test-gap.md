# Nightshift: Test Gap Analysis

**Repo:** Microck/sincronizado
**Task:** test-gap
**Date:** 2026-04-03
**Coverage:** 10/38 source modules tested (26.3%)

---

## Summary

Only 26% of source modules have dedicated test files. The test suite covers hashing, config schema, sync-ignore, sync-conflicts, CLI dispatch, completions, state, and version comparison well. Significant gaps exist in connection logic, sync orchestration, CLI commands, and installer modules.

---

## Existing Test Coverage (10 modules)

| Source Module | Test File | Coverage |
|---|---|---|
| `src/utils/hash.ts` | `tests/hash.test.ts` | Good — session ID format, determinism, collision resistance |
| `src/utils/paths.ts` | `tests/hash.test.ts` | Good — project name extraction (in same file) |
| `src/config/schema.ts` | `tests/config.test.ts` | Good — validation, defaults, rejection |
| `src/config/defaults.ts` | `tests/config.test.ts` | Partial — used as fixture, not directly tested |
| `src/sync/ignore.ts` | `tests/sync-ignore.test.ts` | Good — file loading, comment stripping, merge |
| `src/sync/conflicts.ts` | `tests/sync-conflicts.test.ts` | Good — extraction, formatting |
| `src/cli/dispatch.ts` | `tests/cli-dispatch.test.ts` | Exists |
| `src/cli/completions.ts` | `tests/completions.test.ts` | Exists |
| `src/connection/state.ts` | `tests/state.test.ts` | Exists |
| `src/updates/version.ts` | `tests/update-check.test.ts` | Good — normalize, compare, isUpdateAvailable |
| `src/connection/ssh.ts` | `tests/integration/ssh.test.ts` | Integration only |
| `src/sync/mutagen.ts` | `tests/integration/mutagen.test.ts` | Integration only |

---

## P0 — Critical Gaps (untested pure logic)

### 1. `src/connection/protocol.ts` — `buildRemoteCommand()`
**Risk:** SSH/et/mosh command construction with user@host, port, identity file. Bug here = broken connections.
**Testable:** Pure function. Mock `Bun.which` for `detectAvailableProtocols`. Test `buildRemoteCommand` with various configs.
**Suggested tests:**
- SSH command includes `-o ServerAliveInterval`, port, host
- SSH command includes `-i identityFile` when configured
- et command includes `-t remoteCommand -p port host`
- mosh command includes `-- remoteCommand`
- `selectProtocol` falls back to first configured when none available
- `detectAvailableProtocols` filters based on available binaries

### 2. `src/config/loader.ts` — Config loading
**Risk:** File read, JSON parse, schema validation, migration. Bug = broken startup.
**Testable:** Mock `fs.readFile`, test error paths (missing file, invalid JSON, schema rejection).
**Suggested tests:**
- Loads valid config from file
- Returns defaults when file missing
- Throws on invalid JSON
- Throws on schema validation failure
- Merges partial config with defaults

---

## P1 — High Priority Gaps

### 3. `src/sync/mutagen.ts` — Sync session management (231 lines)
**Risk:** Core sync logic — create, flush, pause, resume, terminate sessions. Only has integration test.
**Testable:** Mock `Bun.spawn` to return controlled stdout/stderr. Test parsing of mutagen JSON output.
**Suggested tests:**
- `isMutagenInstalled` returns true/false based on spawn result
- `createSyncSession` constructs correct arguments
- `getSyncStatus` parses session JSON correctly
- `flushSync` handles success/failure
- `terminateSync` handles non-existent session

### 4. `src/cli/commands/connect.ts` — Main connect command (259 lines)
**Risk:** The primary user-facing flow — SSH connect, tmux attach, sync setup. Most complex file in the codebase.
**Testable:** Mock connection/sync modules. Test option parsing, error handling, session creation.
**Suggested tests:**
- `quoteRemotePathForShell` handles `~`, spaces, special chars
- Resume flow reuses existing session
- Error path when SSH connection fails
- Sync session creation with correct ignore patterns

### 5. `src/cli/output.ts` + `src/cli/output-context.ts` — Output formatting
**Risk:** All user-facing output. JSON mode, quiet mode, verbose mode logic.
**Testable:** Set env vars, test conditional output.
**Suggested tests:**
- `formatError` includes suggestion when provided
- `emitJson` only writes to stdout in JSON mode
- `log` suppressed in quiet mode
- `logVerbose` only outputs in verbose mode

---

## P2 — Medium Priority Gaps

### 6. `src/connection/tmux.ts` — Tmux session management
**Risk:** Session listing, killing, attaching. Depends on SSH.
**Testable:** Mock `sshExec`. Test parsing of tmux output.
**Suggested tests:**
- `listSessions` parses `tmux list-sessions` output
- `listSessions` returns empty on failure
- `hasSession` returns boolean based on exit code
- `killSession` returns success/failure

### 7. `src/installer/deps.ts` + `src/installer/path.ts` — Installer utilities
**Risk:** Binary detection, path construction.
**Testable:** Mock `Bun.which`, test path joining.

### 8. `src/cli/commands/list.ts`, `kill.ts`, `push.ts`, `pull.ts` — Command handlers
**Risk:** Each command has unique error handling and output formatting.
**Testable:** Mock connection layer, test output format and exit codes.

### 9. `src/utils/index.ts` — Re-export barrel
**Risk:** Low — just re-exports. But `generateSessionId` import path should be verified.

---

## P3 — Low Priority Gaps

### 10. `src/types/index.ts` — Type-only module
No runtime code to test.

### 11. `src/sync/index.ts` — Re-export barrel
Just re-exports from `mutagen.ts` and `conflicts.ts`.

### 12. `src/config/index.ts` — Re-export barrel
Just re-exports loader and schema.

### 13. `src/cli/index.ts` — CLI entry point
Integration-level, requires full process spawn.

### 14. `src/installer/tui.ts`, `vps-setup.ts`, `windows-cmd.ts`
Platform-specific installer code — requires mock-heavy setup.

### 15. `legacy/` directory
All files in `legacy/unused/` — not in active code paths. Skip testing.

---

## Priority Recommendations

| Priority | Action | Est. Tests |
|---|---|---|
| P0 | Add unit tests for `connection/protocol.ts` (`buildRemoteCommand`) | 8-10 |
| P0 | Add unit tests for `config/loader.ts` | 5-7 |
| P1 | Add mock-based tests for `sync/mutagen.ts` | 6-8 |
| P1 | Add unit tests for `cli/commands/connect.ts` helpers | 5-6 |
| P1 | Add unit tests for `cli/output.ts` + `output-context.ts` | 6-8 |
| P2 | Add mock-based tests for `connection/tmux.ts` | 4-5 |
| P2 | Add unit tests for remaining CLI commands | 8-10 |

**Total estimated new tests: ~42-54**

Target: 80%+ module coverage (30/38 modules) with P0+P1 fixes alone.
