# Requirements: sincronizado

**Defined:** 2026-02-04
**Milestone:** v1.1 CLI & Sync Control
**Core Value:** Run `sinc` anywhere → instantly connected to VPS AI agent with synced files

## v1 Requirements (this milestone)

### CLI ergonomics

- [x] **CLI-09**: `sinc -k <id>` behaves exactly like `sinc --kill <id>`
- [x] **CLI-10**: `sinc -l` behaves exactly like `sinc --list`
- [x] **CLI-11**: `sinc kill <id>` behaves exactly like `sinc --kill <id>`
- [x] **CLI-12**: `sinc list` behaves exactly like `sinc --list`
- [x] **CLI-13**: `sinc push` and `sinc pull` appear in `sinc --help` output with clear descriptions

### sync control

- [x] **SYNC-08**: `sinc push` forces local state to remote for the current project sync session
- [x] **SYNC-09**: `sinc pull` forces remote state to local for the current project sync session
- [x] **SYNC-10**: `sinc push` and `sinc pull` show a clear "about to overwrite" summary (direction, session id, local path, remote path)

### safety

- [x] **SAFE-01**: `sinc push` and `sinc pull` require explicit confirmation unless `--yes` is provided
- [x] **SAFE-02**: `sinc push` and `sinc pull` fail fast with a clear error when no sync session exists for the current directory (with suggestion to run `sinc` first)

## v2 Requirements

Deferred to future release. Tracked but not in this milestone.

### configuration

- **CONF-03**: Per-project config (.sincrc in project directory)
- **CONF-04**: Environment variable override (SINC_* vars)
- **CONF-05**: Multiple VPS profiles

### sync

- **SYNC-06**: Conflict resolution UI
- **SYNC-07**: File versioning

## Out of Scope

Explicitly excluded for this milestone.

| Feature | Reason |
|---------|--------|
| Multi-VPS targets | out of scope for v1.1; focus is CLI ergonomics + manual sync control |
| Sync conflict UI | separate scope; this milestone focuses on push/pull controls |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLI-09 | Phase 5 | Complete |
| CLI-10 | Phase 5 | Complete |
| CLI-11 | Phase 5 | Complete |
| CLI-12 | Phase 5 | Complete |
| CLI-13 | Phase 5 | Complete |
| SYNC-08 | Phase 6 | Complete |
| SYNC-09 | Phase 6 | Complete |
| SYNC-10 | Phase 6 | Complete |
| SAFE-01 | Phase 6 | Complete |
| SAFE-02 | Phase 6 | Complete |

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 - milestone v1.1 complete*
