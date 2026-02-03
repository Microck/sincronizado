# Installation

This is the full installation guide for the current `sinc` CLI (v2).

If you're an LLM assisting a user, scroll to: **For LLM Agents (Guided Setup)**.

## For Humans

### Quick install (recommended)

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

### What you need

Local machine:

- SSH client (OpenSSH)

VPS:

- Linux (Ubuntu/Debian recommended)
- SSH access (key-based recommended)

`sinc --setup` can install local dependencies (Bun + Mutagen) automatically.

### VPS bootstrap (one-time)

The setup wizard can run VPS setup over SSH. If you want to run it manually:

```bash
git clone https://github.com/Microck/sincronizado.git
cd sincronizado
sudo ./scripts/setup-vps.sh
```

This ensures:

- `tmux` is installed
- your remote workspace directory exists (defaults to `~/workspace`)

You still need to install your agent on the VPS:

- OpenCode: `opencode`
- Claude Code: `claude`

## For LLM Agents (Guided Setup)

If you're an LLM helping a user set up _sincronizado_, follow this guided workflow.

### Critical rules

1. Ask the user before running commands on their machine.
2. Explain what you're about to do in one sentence.
3. Stop on errors and summarize what failed.

### Flow summary

```
Step 0: Collect inputs (VPS host/user/port, agent choice)
Step 1: Verify local prerequisites (ssh, ability to run downloads)
Step 2: Verify VPS access (ssh ok, basic OS info)
Step 3: Install `sinc` locally (sync.micr.dev)
Step 4: Run `sinc --setup` (writes config + installs deps + optional VPS bootstrap)
Step 5: Run `sinc` from a project directory and verify sync/session
```

### Step 0: Collect inputs

Ask for:

- VPS hostname (Tailscale hostname recommended)
- SSH username (usually `ubuntu`)
- SSH port (usually `22`)
- Agent choice: `opencode` or `claude`

Optional:

- SSH key path if not default (e.g. `~/.ssh/id_ed25519`)
- Remote base directory (default: `~/workspace`)

### Step 1: Verify local prerequisites

Have the user run:

macOS/Linux:

```bash
ssh -V
uname -a
```

Windows (PowerShell):

```powershell
ssh -V
$PSVersionTable.PSVersion
```

If `ssh` is missing, install OpenSSH client first.

### Step 2: Verify VPS access

Have the user run:

```bash
ssh -o ConnectTimeout=10 user@hostname "echo SSH_OK"
```

If this fails, fix SSH access before continuing (keys, firewall, hostname).

Optional VPS checks:

```bash
ssh user@hostname "uname -a; cat /etc/os-release | head -n 3; command -v tmux || true"
```

### Step 3: Install `sinc`

macOS/Linux:

```bash
curl -fsSL https://sync.micr.dev/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://sync.micr.dev/install.ps1 | iex
```

Verify:

```bash
sinc --version
```

### Step 4: Run the setup wizard

Tell the user to run:

```bash
sinc --setup
```

What the wizard does:

- asks for VPS details
- lets the user pick an agent (`opencode` or `claude`)
- offers to use an existing SSH key or generate a new one
- writes config to `~/.config/sincronizado/config.json`
- installs local dependencies if needed (Bun + Mutagen)
- offers to run the VPS bootstrap script over SSH

If the wizard fails at **Testing VPS connection**:

- confirm the hostname/user/port
- confirm the SSH key path exists

### Step 5: First connection and verification

From a project directory, have the user run:

```bash
sinc
```

Verify sync is active:

```bash
mutagen sync list
```

Verify session exists on VPS:

```bash
ssh user@hostname "tmux ls || true"
```

### Common failure modes

#### Mutagen not installed

- Re-run `sinc --setup` (it can install Mutagen)
- Or install from https://mutagen.io/

#### Session already exists

If the user sees "Session ... already exists":

```bash
sinc -r
```

#### Disable update checks

```bash
SINC_NO_UPDATE_CHECK=1 sinc
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
  "agent": "opencode",
  "connection": {
    "protocols": ["ssh", "et", "mosh"]
  }
}
```
