# sincronizado

Run `sinc` in any project to connect to a VPS AI agent with bidirectional file sync. Edit locally, compute remotely.

## Quick start

macOS / Linux:

```bash
curl -fsSL https://sync.micr.dev/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://sync.micr.dev/install.ps1 | iex
```

Then run:

```bash
sinc --setup
```

## Core commands

- `sinc` - Connect to the VPS from the current project
- `sinc --setup` - Guided setup wizard
- `sinc --list` - List active sessions
- `sinc --kill <id>` - Kill a session
- `sinc --uninstall` - Remove configuration and local install artifacts

## Troubleshooting

- **Connection failed:** Verify hostname, SSH key, and that SSH is reachable on the VPS.
- **Mutagen not found:** Re-run `sinc --setup` to install dependencies.
- **sinc not found:** Ensure your PATH includes `~/.local/bin` (macOS/Linux) or re-run the installer.

## License

MIT
