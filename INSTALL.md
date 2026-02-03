# Installation

This repo ships the `sinc` CLI.

## Quick install (recommended)

macOS / Linux:

```bash
curl -fsSL https://sync.micr.dev/install.sh | bash
sinc --setup
```

Windows (PowerShell):

```powershell
irm https://sync.micr.dev/install.ps1 | iex
sinc --setup
```

Then, from your project directory:

```bash
sinc
```

## What `sinc --setup` does

- writes `~/.config/sincronizado/config.json`
- validates SSH connectivity to your VPS
- checks required local dependencies (Mutagen)

## VPS setup (one-time)

`sinc` assumes your VPS already has:

- `tmux`
- your chosen agent command: `opencode` or `claude`

If your VPS is fresh, SSH in and run:

```bash
git clone https://github.com/Microck/sincronizado.git
cd sincronizado
sudo ./scripts/setup-vps.sh
```

## Config reference

Config file: `~/.config/sincronizado/config.json`

```json
{
  "vps": {
    "hostname": "oracle.tail1234.ts.net",
    "user": "ubuntu",
    "port": 22
  },
  "sync": {
    "mode": "both",
    "ignore": ["node_modules", ".venv", ".git"],
    "remoteBase": "~/workspace"
  },
  "agent": "opencode"
}
```

## Troubleshooting

- Sync not active: `mutagen sync list`
- Connection issues: `ssh user@hostname "echo ok"`
- Config issues: validate JSON with `node -p "JSON.parse(require('fs').readFileSync(process.env.HOME+'/.config/sincronizado/config.json','utf8'))"` (or open it in an editor)
