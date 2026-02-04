# Installation

This is the complete installation and setup guide for **sincronizado**.

## Quick Links

- **[For Humans](#for-humans)**: Simple copy-paste commands.
- **[For LLM Agents (Guided Setup)](#for-llm-agents-guided-setup)**: A rigorous, step-by-step protocol for AI agents setting up sincronizado for a user.

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

**ROLE:** You are an expert DevOps engineer assisting a user with setting up sincronizado.
**GOAL:** Successfully establish a sync + compute link between the user's local machine and their VPS.

### Critical Protocol

1.  **NEVER run commands without user confirmation.** Always ask "Proceed? (y/n)".
2.  **Explain BEFORE execution.** One sentence max per command group.
3.  **Stop on error.** Diagnose the issue, explain it, and offer a fix. Do not hallucinate success.
4.  **Verify.** After every major step, verify the state before moving on.

### Flow Summary

```text
Step 0: Discovery & Prerequisites (Local OS, VPS details, SSH access)
Step 1: Install sincronizado (Local binary)
Step 2: Install Mutagen (Local Dependency)
Step 3: Configure sincronizado (Manual Config Creation)
Step 4: Bootstrap VPS (Remote Dependencies)
Step 5: Verification (Full System Check)
```

---

### Step 0: Discovery & Prerequisites

**Goal:** Ensure the environment is compatible and gather necessary details.

**1. Ask for inputs:**
> "To set up sincronizado, I need a few details:
> 1.  **VPS Hostname** (IP address or domain/Tailscale name)
> 2.  **SSH Username** (e.g., `ubuntu`, `root`)
> 3.  **SSH Port** (usually 22)
> 4.  **Which Agent** do you use? (`opencode` or `claude`)
>
> Do you have these ready?"

**2. Verify Local Environment:**
Execute these checks:

```bash
# Check OS and Architecture
uname -a || ver

# Check SSH Client
ssh -V
```

**3. Verify VPS Connectivity:**
*Crucial:* sincronizado uses non-interactive SSH. We must verify key-based auth works.

```bash
# Replace with user provided details
ssh -o BatchMode=yes -o ConnectTimeout=5 <USER>@<HOST> -p <PORT> "echo SSH_CONNECTION_OK"
```

**Error Handling (Step 0):**
-   **"Permission denied":** The user needs to set up an SSH key.
    -   *Fix:* `ssh-copy-id <USER>@<HOST>` (if password auth is enabled) or manually add `~/.ssh/id_ed25519.pub` to `~/.ssh/authorized_keys` on the VPS.
-   **"Could not resolve hostname":** DNS or Tailscale issue.
    -   *Fix:* Check `tailscale status` or typo in hostname.
-   **"Connection timed out":** Firewall or wrong IP.

---

### Step 1: Install sincronizado

**Goal:** Download and place the `sinc` binary.

**Action:**
> "I will download the latest sincronizado installer script and run it. This installs the `sinc` binary to your local path. Proceed? (y/n)"

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

### Step 2: Install Mutagen (Manual)

**Goal:** Install the sync engine. (We do this manually so the LLM has control, rather than relying on the TUI wizard).

**Action:**
> "Checking for Mutagen (required for file sync)..."

**Execute:**
```bash
mutagen version
```

**If missing, install:**

*macOS:*
```bash
brew install mutagen-io/mutagen/mutagen
```

*Linux (Manual Install):*
```bash
# Download latest (example version, check latest dynamically if possible)
curl -L https://github.com/mutagen-io/mutagen/releases/download/v0.17.0/mutagen_linux_amd64.tar.gz -o mutagen.tar.gz
tar -xzf mutagen.tar.gz
sudo mv mutagen /usr/local/bin/
rm mutagen.tar.gz
```

*Windows:*
```powershell
winget install Mutagen.Mutagen
```

---

### Step 3: Configure sincronizado (Manual)

**Goal:** Create `config.json` without using the interactive TUI. This ensures the configuration is exactly what we expect.

**Action:**
> "I will create the sincronizado configuration file at `~/.config/sincronizado/config.json`. Proceed? (y/n)"

**Execute:**

First, ensure the directory exists:
```bash
mkdir -p ~/.config/sincronizado
```

Then, write the file (replace placeholders with user inputs):

```bash
cat > ~/.config/sincronizado/config.json <<EOF
{
  "vps": {
    "hostname": "<HOST>",
    "user": "<USER>",
    "port": <PORT>,
    "keyPath": "~/.ssh/id_ed25519"
  },
  "sync": {
    "mode": "both",
    "remoteBase": "~/workspace",
    "ignore": [
      ".git",
      "node_modules",
      ".next",
      "dist",
      "coverage"
    ]
  },
  "agent": "<AGENT>",
  "ssh": {
    "connectTimeout": 10,
    "keepaliveInterval": 60
  }
}
EOF
```

*Note: Adjust `keyPath` if the user uses a different key.*

---

### Step 4: Bootstrap VPS

**Goal:** Install `tmux` and dependencies on the VPS.

**Action:**
> "I will now bootstrap the VPS. This installs `tmux` and sets up the workspace directory. Proceed? (y/n)"

**Execute:**
Run the setup script remotely over SSH.

```bash
ssh <USER>@<HOST> "curl -fsSL https://raw.githubusercontent.com/Microck/sincronizado/main/scripts/setup-vps.sh | bash"
```

**Verify Remote Components:**
```bash
ssh <USER>@<HOST> "tmux -V && command -v <AGENT> || echo 'AGENT_MISSING'"
```

**Error Handling (Step 4):**
-   **"AGENT_MISSING":** The AI agent is not in the remote PATH.
    -   *Fix (OpenCode):* `npm install -g opencode`
    -   *Fix (Claude):* `npm install -g @anthropic-ai/claude-code`
-   **"sudo: password is required":** The setup script failed because it needs a sudo password.
    -   *Fix:* Tell the user: "Please SSH into your VPS (`ssh <USER>@<HOST>`) and run this command manually: `curl -fsSL https://raw.githubusercontent.com/Microck/sincronizado/main/scripts/setup-vps.sh | bash`"

---

### Step 5: Final Verification

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

### Power User Commands

Teach these to the user once setup is done:

-   **`sinc -r`**: Resume your session if you get disconnected.
-   **`sinc --list`**: See what projects are currently active.
-   **`sinc --kill <id>`**: Stop syncing and kill the remote session.
-   **`Ctrl+B, D`**: Detach from tmux (leave agent running in background).
