# Installation

This is the complete installation and setup guide for the current `sinc` CLI (v2).

What you get after setup:

- A fast, bi-directional Mutagen sync between your local project directory and a VPS path
- A persistent `tmux` session on the VPS that runs your AI agent (`opencode` or `claude`)

If you're an LLM assisting a user, scroll to: **For LLM Agents (Guided Setup)**.

## For humans

### Requirements (read this first)

Local machine:

- `ssh` (OpenSSH client)
- ability to download binaries (curl/powershell)
- Mutagen for file sync (the setup wizard can install it)

VPS:

- Linux (Ubuntu/Debian recommended)
- SSH access as a normal user (key-based authentication strongly recommended)
- `tmux`
- Your agent installed and available on the VPS: `opencode` or `claude`

Important notes:

- `sinc` uses non-interactive SSH for checks. Password-only SSH setups are likely to fail.
- The VPS bootstrap uses `sudo` to install packages. If your VPS requires a sudo password,
  run the bootstrap manually in an interactive SSH session.

### 1) Install `sinc`

Recommended (installs from GitHub Releases):

macOS / Linux:

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

### 2) Run the setup wizard (one-time)

```bash
sinc --setup
```

The wizard will:

- ask for VPS host/user/port
- ask which agent you want (`opencode` or `claude`)
- ask which SSH key to use (or generate a new ed25519 key)
- write config to `~/.config/sincronizado/config.json`
- install local dependencies (Mutagen, and Bun when needed)
- ensure the install directory is on your `PATH` (you may need to restart your terminal)
- offer to run the VPS bootstrap script

### 3) Connect from your project directory

From the directory you want to sync:

```bash
sinc
```

What happens:

1. A stable session name is computed from your project path (example: `sinc-myapp-a1b2c3`).
2. A Mutagen sync session is created/attached for that session name.
3. A `tmux` session with the same name is created/attached on the VPS.
4. Your agent runs inside that tmux session.

### 4) Verify everything is working

Local sync status:

```bash
mutagen sync list
```

Remote session status:

```bash
ssh user@hostname "tmux ls || true"
```

### Per-project ignore rules (.syncignore)

Sincronizado uses Mutagen ignore patterns to keep sync fast.

You can add per-project ignores by creating a `.syncignore` file in your project root:

```text
# one pattern per line
dist
.next
.venv
node_modules
```

These patterns are merged with the global `sync.ignore` list in
`~/.config/sincronizado/config.json`.

### Multiple projects

Each local project directory gets its own session name. The session name is stable for a given
absolute path, so you can safely reconnect/resume later.

### VPS bootstrap (one-time)

The setup wizard can run the VPS setup script over SSH.

If you prefer to run it manually, SSH into the VPS and run:

```bash
git clone https://github.com/Microck/sincronizado.git
cd sincronizado
./scripts/setup-vps.sh
```

What it does:

- installs `tmux` using your distro package manager (via `sudo`)
- creates the remote workspace directory (defaults to `$HOME/workspace` unless overridden)

What it does not do:

- install your agent

### Installing your agent on the VPS

Sincronizado expects the agent command to be on the VPS `PATH`:

- OpenCode: `opencode`
- Claude Code: `claude`

Install them using the agent's official installation instructions.

## For LLM Agents (Guided Setup)

Use this flow if you're assisting someone who is setting up Sincronizado.

### Critical rules

1. Ask the user before running commands on their machine.
2. Explain what each command is doing in one sentence.
3. Stop on errors and summarize what failed.
4. Prefer safe defaults: key-based SSH, `ssh` protocol, two-way sync.

### Flow summary

```
Step 0: Collect inputs (host/user/port, OS, agent choice)
Step 1: Verify local prerequisites (ssh, download tools)
Step 2: Verify VPS access (ssh ok, tmux available or installable)
Step 3: Install sinc locally
Step 4: Run sinc --setup (config + deps + optional VPS bootstrap)
Step 5: Run sinc from a project directory and verify sync + tmux session
Step 6: Teach resume/kill/cleanup commands
```

### Step 0: Collect inputs

Ask for:

- VPS hostname (Tailscale hostname is ideal if they have it)
- SSH username (often `ubuntu`)
- SSH port (often `22`)
- Agent: `opencode` or `claude`

Optional but useful:

- Whether they can use key-based SSH (recommended)
- Which SSH key to use (or whether to generate a new one)
- Their desired VPS workspace path (default: `~/workspace`)

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

If `ssh` is missing, install an OpenSSH client first.

### Step 2: Verify VPS access

Have the user run:

```bash
ssh -o ConnectTimeout=10 user@hostname "echo SSH_OK"
```

If that fails, fix SSH access before doing anything else.

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

Have the user run:

```bash
sinc --setup
```

If it fails at "Testing VPS connection":

- confirm host/user/port
- confirm the SSH key path exists
- confirm key permissions (private key should not be world-readable)

If it fails while running VPS setup:

- the VPS user may require a sudo password
- run `./scripts/setup-vps.sh` manually inside an interactive SSH session

### Step 5: First connection and verification

From a project directory:

```bash
sinc
```

Verify sync:

```bash
mutagen sync list
```

Verify VPS session:

```bash
ssh user@hostname "tmux ls || true"
```

### Step 6: Teach the core commands

- Resume: `sinc -r`
- List sessions: `sinc --list`
- Kill a session: `sinc --kill <session>`
- Disable update checks: `SINC_NO_UPDATE_CHECK=1 sinc`

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
  "ssh": {
    "connectTimeout": 10,
    "keepaliveInterval": 60,
    "identityFile": "~/.ssh/id_ed25519"
  },
  "connection": {
    "protocols": ["ssh", "et", "mosh"],
    "reconnect": {
      "maxAttempts": 5,
      "baseDelayMs": 1000,
      "maxDelayMs": 10000
    }
  }
}
```
