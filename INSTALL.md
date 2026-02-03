# INSTALL.md (LLM Guide)

This guide is for AI agents helping users install and configure sincronizado.

## 1) Install the CLI

macOS / Linux:

```bash
curl -fsSL https://sync.micr.dev/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://sync.micr.dev/install.ps1 | iex
```

Expected output: a message confirming `sinc` was installed.

## 2) Run setup wizard

```bash
sinc --setup
```

The wizard will prompt for:

- Agent: `opencode` or `claude`
- Sync mode: `none`, `pull`, `push`, or `both`
- VPS hostname, user, port
- SSH key path (or generate a new key)
- VPS workspace path
- Optional ignore patterns (comma-separated)

The wizard tests the SSH connection before saving the config.

## 3) Verify installation

```bash
sinc --version
```

Confirm the config exists at:

```bash
cat ~/.config/sincronizado/config.json
```

## 4) Connect

```bash
sinc
```

You should attach to a tmux session on the VPS.

## Recovery steps

- **SSH error / permission denied:** Verify the SSH key path and that the key is on the VPS.
- **Connection timed out:** Check hostname, port, and firewall rules.
- **Mutagen missing:** Re-run `sinc --setup` to install dependencies.
- **PATH issues:** Re-run the installer or add `~/.local/bin` to PATH.
