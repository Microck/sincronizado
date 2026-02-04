# sinc sandbox (for demos + tutorial videos)

This sandbox gives you a local "VPS" using Docker (sshd + tmux), plus a repeatable way to demo:

- `sinc` connect flow (ssh + tmux)
- real-time mutagen sync (host <-> container)
- manual `sinc push` / `sinc pull`

It is designed to be safe:
- Uses a generated throwaway SSH key.
- Writes a sandbox config under `.sandbox/`.
- Uses an isolated sandbox `HOME` directory so your real `~/.ssh` and `~/.mutagen` are untouched.

## Prereqs

- Docker
- OpenSSH client (`ssh`)
- Mutagen (recommended). If you don't have it, run: `./scripts/sandbox/sandbox.sh install-mutagen`

## Quick start

From repo root:

```bash
./scripts/sandbox/sandbox.sh up
```

This starts a local "VPS" container on a dedicated Docker network and prints its IP address.

Create a demo project and run a non-interactive verification (push/pull/json):

```bash
./scripts/sandbox/sandbox.sh verify
```

For an interactive demo, use the printed env vars from `up`:

```bash
export HOME="$(pwd)/.sandbox/home"
export XDG_CONFIG_HOME="$(pwd)/.sandbox/xdg"
export SINC_NO_UPDATE_CHECK=1
```

Then:

```bash
cd .sandbox/demo-project
bun src/cli/index.ts
```

## Clean up

```bash
./scripts/sandbox/sandbox.sh down
```

This stops the container.

## Notes

- The container includes stub `opencode`/`claude` commands so `sinc` can attach and run something.
- The sandbox shell uses a sandbox-only config (via `XDG_CONFIG_HOME`) so your real config is untouched.
