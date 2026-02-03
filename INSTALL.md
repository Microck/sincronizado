# Installation

This is the complete installation and setup guide for **Sincronizado (v2)**.

## Quick Links

- **[For Humans](#for-humans)**: Simple copy-paste commands.
- **[For LLM Agents](#for-llm-agents-guided-setup)**: A rigorous, step-by-step protocol for AI agents setting up Sincronizado for a user.

---

## For Humans

### Requirements

**Local Machine:**
- `ssh` (OpenSSH client)
- Ability to download binaries (`curl` or PowerShell)
- **Mutagen** (v0.17+) for file sync (the setup wizard can install this for you)

**VPS:**
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, Fedora, CentOS)
- **Access**: SSH access as a normal user (Key-based auth is strongly recommended)
- **Tools**: `tmux`, `git`, `curl`
- **Agent**: Your AI agent (`opencode` or `claude`) installed on the PATH

### 1) Install `sinc`

**macOS / Linux:**
```bash
curl -fsSL https://sync.micr.dev/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://sync.micr.dev/install.ps1 | iex
```

*Verify installation:*
```bash
sinc --version
```

### 2) Run Setup (One-Time)

```bash
sinc --setup
```

The wizard will:
1.  Ask for your VPS details (Host, User, Port).
2.  Configure your SSH key (use existing or generate new).
3.  Write the config to `~/.config/sincronizado/config.json`.
4.  **Auto-install Mutagen** if missing.
5.  Offer to **Bootstrap your VPS** (install tmux, create workspace).

### 3) Connect

Navigate to any project folder and run:

```bash
sinc
```

---

## For LLM Agents (Guided Setup)

**ROLE:** You are an expert DevOps engineer assisting a user with setting up Sincronizado.
**GOAL:** Successfully establish a sync + compute link between the user's local machine and their VPS.

### Critical Protocol

1.  **NEVER run commands without user confirmation.** Always ask "Proceed? (y/n)".
2.  **Explain BEFORE execution.** One sentence max per command group.
3.  **Stop on error.** Diagnose the issue, explain it, and offer a fix. Do not hallucinate success.
4.  **Verify.** After every major step, verify the state before moving on.

### Flow Summary

```text
Step 0: Discovery & Prerequisites (Local OS, VPS details, SSH access)
Step 1: Install Sincronizado (Local binary)
Step 2: Run Setup Wizard (Config + Mutagen + VPS Bootstrap)
Step 3: Verify Connection (SSH + Tmux + Agent)
Step 4: First Run (Sync a project)
```

---

### Step 0: Discovery & Prerequisites

**Goal:** Ensure the environment is compatible before installing anything.

**1. Ask for inputs:**
> "To set up Sincronizado, I need a few details:
> 1.  **VPS Hostname** (IP address or domain/Tailscale name)
> 2.  **SSH Username** (e.g., `ubuntu`, `root`)
> 3.  **Which Agent** do you use? (`opencode` or `claude`)
>
> Do you have these ready?"

**2. Verify Local Environment:**
Execute these checks:

```bash
# Check OS and Architecture
uname -a || ver

# Check SSH Client
ssh -V

# Check if Mutagen is already installed (optional, sinc handles this)
mutagen version || echo "Mutagen not found (will be installed)"
```

**3. Verify VPS Connectivity:**
*Crucial:* Sincronizado uses non-interactive SSH. We must verify key-based auth works.

```bash
# Replace with user provided details
ssh -o BatchMode=yes -o ConnectTimeout=5 <USER>@<HOST> "echo SSH_CONNECTION_OK"
```

**Error Handling (Step 0):**
-   **"Permission denied":** The user needs to set up an SSH key.
    -   *Fix:* `ssh-copy-id <USER>@<HOST>` (if password auth is enabled) or manually add `~/.ssh/id_ed25519.pub` to `~/.ssh/authorized_keys` on the VPS.
-   **"Could not resolve hostname":** DNS or Tailscale issue.
    -   *Fix:* Check `tailscale status` or typo in hostname.
-   **"Connection timed out":** Firewall or wrong IP.

---

### Step 1: Install Sincronizado

**Goal:** Download and place the `sinc` binary.

**Action:**
> "I will download the latest Sincronizado installer script and run it. This installs the `sinc` binary to your local path. Proceed? (y/n)"

**Execute:**

*macOS / Linux:*
```bash
curl -fsSL https://sync.micr.dev/install.sh | bash
```

*Windows (PowerShell):*
```powershell
irm https://sync.micr.dev/install.ps1 | iex
```

**Verify:**
```bash
sinc --version
```

**Error Handling (Step 1):**
-   **"command not found: sinc":** The install script likely didn't update the PATH in the current session.
    -   *Fix:* Tell the user: "Please restart your terminal to update your PATH, then run `sinc --version`." OR source the profile manually (`source ~/.bashrc` / `source ~/.zshrc`).

---

### Step 2: Run Setup Wizard

**Goal:** Configure `config.json`, install Mutagen, and prep the VPS.

**Action:**
> "I will now run `sinc --setup`. This interactive wizard configures your VPS connection and can automatically bootstrap the server (install tmux, create workspace). Proceed? (y/n)"

**Execute:**
```bash
sinc --setup
```

*Note: As an LLM, you cannot interact with the TUI easily. Instruct the user to complete the wizard.*

**Instructions for User:**
1.  Enter VPS Hostname: `<HOST>`
2.  Enter VPS User: `<USER>`
3.  Agent: Select `<AGENT>`
4.  **"Run VPS setup script now?"**: Say **YES**. This is critical for installing `tmux` and setting up permissions.

**Alternative: Manual VPS Bootstrap**
If `sinc --setup` fails to bootstrap the VPS (e.g., because of sudo password requirements), run this manually:

```bash
# Run this via interactive SSH
ssh <USER>@<HOST> "curl -fsSL https://raw.githubusercontent.com/Microck/sincronizado/main/scripts/setup-vps.sh | bash"
```

---

### Step 3: Verify Components

**Goal:** Ensure all moving parts (SSH, Tmux, Agent, Mutagen) are ready.

**Execute (Local Checks):**
```bash
# Check config existence
ls -l ~/.config/sincronizado/config.json

# Check Mutagen daemon
mutagen daemon start
mutagen version
```

**Execute (Remote Checks):**
```bash
# Check Tmux and Agent on VPS
ssh <USER>@<HOST> "tmux -V && command -v <AGENT> || echo 'AGENT_MISSING'"
```

**Error Handling (Step 3):**
-   **"AGENT_MISSING":** The AI agent is not in the remote PATH.
    -   *Fix (OpenCode):* `npm install -g opencode`
    -   *Fix (Claude):* `npm install -g @anthropic-ai/claude-code`
-   **"tmux: command not found":** Bootstrap failed.
    -   *Fix:* `sudo apt install tmux` (Ubuntu) / `sudo dnf install tmux` (Fedora).

---

### Step 4: First Connection

**Goal:** Prove the system works by syncing a dummy project.

**Action:**
> "Setup complete. Let's test it by syncing a project. Navigate to a project folder and run `sinc`. Proceed?"

**Execute:**
```bash
cd <PROJECT_DIR>
sinc
```

**Verification Success Criteria:**
1.  Output shows `[sync] ensuring remote workspace exists...`
2.  Output shows `[sync] starting mutagen session...`
3.  User is dropped into a remote shell (prompt changes to `<USER>@<HOST>`).

---

### Troubleshooting Common Failures

| Error | Diagnosis | Solution |
| :--- | :--- | :--- |
| **"Mutagen daemon not running"** | Mutagen service is stopped. | Run `mutagen daemon start`. |
| **"Conflicts detected"** | Files changed on both sides. | Run `mutagen sync list` to see files. Run `sinc --kill <session>` to reset (nuclear option). |
| **"Permission denied (publickey)"** | SSH Key mismatch. | Ensure `~/.ssh/id_ed25519` exists and pubkey is on VPS. |
| **"Session already exists"** | Previous session detached. | Run `sinc -r` to resume. |
| **"EADDRINUSE"** | Port conflict. | Check `config.json` settings. |
| **"Too many redirects"** | Docs site DNS issue. | Use the markdown files in `docs/` directly. |

---

### Power User Commands

Teach these to the user once setup is done:

-   **`sinc -r`**: Resume your session if you get disconnected.
-   **`sinc --list`**: See what projects are currently active.
-   **`sinc --kill <id>`**: Stop syncing and kill the remote session.
-   **`Ctrl+B, D`**: Detach from tmux (leave agent running in background).
