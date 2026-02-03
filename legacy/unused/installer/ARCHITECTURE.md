# sincronizado installer architecture

this tui installer was built with **opentui** (@opentui/core, @opentui/react) and **react 19**.

## screens flow

1. **welcome**: intro + ascii logo.
2. **agent**: select 'opencode' or 'claude'.
3. **mode**: select 'minimal', 'standard', 'full', or 'custom'.
4. **addons** (if custom): toggle kimaki, lunaroute, worktree-session, session-handoff, agent-of-empires, opensync.
5. **provider**: select 'oracle', 'hetzner', 'digitalocean', 'aws', or 'other'.
6. **config**: input hostname, ssh user, project root.
7. **confirm**: summary of choices before execution.
8. **install**: executes ssh command with flags. shows progress bar and log lines.
9. **complete**: final instructions + write local config + option to trigger vps setup.

## components

- **header**: top banner with version and current screen title.
- **button / buttongroup**: focused/unfocused states, handles 'return' for clicks, 'left/right' for group nav.
- **radio / radiogroup**: 'up/down' to navigate, 'return' to select.
- **checkbox / checkboxgroup**: 'up/down' to navigate, 'space' to toggle.
- **textinput**: handles cursor, backspace, and character input via `key.sequence`.
- **progressbar**: visual track of install completion.

## core logic

- **state**: single `config` object (InstallConfig) passed through screens.
- **ssh execution**: uses node `child_process.spawn('ssh', ...)` to stream output from `setup-vps.sh` on the remote host.
- **exit cleanup**: uses `useRenderer().destroy()` for clean terminal restoration.
- **results**: writes `~/.sincronizado/config.json` for the launcher and `./.tui-result.json` for the bash wrapper to consume.

## install flags mapping

- `--mode=[minimal|standard|full]`
- `--with-kimaki`, `--with-lunaroute`, `--with-worktree-session`, etc.
- `--no-agent-os`, `--no-ccmanager`, `--no-plugins`.
