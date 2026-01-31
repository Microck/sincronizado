# HANDOFF

Goal

- One-liner runs the TUI installer (moltbot-style).
- Make OpenTUI usage correct (no `process.exit()`; use renderer cleanup).
- Update docs to match the new install flow.

Done

- Installed `msmps/opentui-skill` globally (files placed under `~/.config/opencode/skill/opentui`).
- Applied OpenTUI gotchas to installer:
  - Removed `process.exit()`; use `useRenderer().destroy()`.
  - Fixed keyboard key names: `up/down/left/right` (not `*Arrow`).
  - Removed oversized welcome ASCII block; welcome now fits 24-row terminals.
  - Fixed `Welcome` text layout (single multiline `<text>`).
  - Fixed `Install` screen to spawn `ssh` directly (no `sh -c`).
  - `Complete` now writes `~/.sincronizado/config.json` and `installer/.tui-result.json` then exits via renderer destroy.
- Updated docs to reflect: run `install.sh` / `install.ps1` and pick options in TUI (no `--agent`/`--mode` flags on install scripts).
- Smoke-tested: `cd installer && bun run typecheck` OK, TUI launches.

Files changed (not committed)

- `installer/src/App.tsx`
- `installer/src/components/Button.tsx`
- `installer/src/components/CheckboxGroup.tsx`
- `installer/src/components/RadioGroup.tsx`
- `installer/src/components/TextInput.tsx`
- `installer/src/screens/Welcome.tsx`
- `installer/src/screens/Confirm.tsx`
- `installer/src/screens/Install.tsx`
- `installer/src/screens/Complete.tsx`
- `scripts/install.sh`
- `scripts/install.ps1`
- `README.md`
- `INSTALL.md`
- `docs/index.mdx`
- `docs/quick-start.mdx`
- `packages/npm/README.md`

What worked

- OpenTUI skill docs confirm `renderer.destroy()` is the correct exit path.
- Welcome screen now renders cleanly on 24-row terminal.

What failed / gaps

- `/opentui` slash command not recognized by this OpenCode build (skill installed, but command registry didn't pick it up).
- Not end-to-end tested: pressing buttons through full flow + writing `.tui-result.json` + `scripts/install.sh` consuming it.

Next steps

- Manual run and click-through: `cd installer && bun run src/index.tsx`.
- Verify `Setup VPS` writes:
  - `~/.sincronizado/config.json`
  - `installer/.tui-result.json`
- Run `scripts/install.sh` and confirm it reads `.tui-result.json` and runs VPS setup.
- If OK, commit the pending changes.

Unresolved questions

- Should `install.sh` accept explicit flags again, or keep TUI-only selection?
- Do we want to remove unicode chars from other scripts (`setup-vps.sh`, `rollback-vps.sh`) for strict ASCII?

Start a new session after this file is written.
