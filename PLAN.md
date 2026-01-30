# PLAN.md — The "Hyper-Local" OpenCode Stack (2026 Edition)

## Goal
- **Local-First**: You edit files on Windows in your favorite editor (VS Code, JetBrains, etc.).
- **Remote Execution**: `opencode` runs on your Oracle VPS (Ashburn/Paris), handling heavy AI tasks and running code.
- **Zero Latency**: File editing is local. Sync is instantaneous via Mutagen.
- **Mobile Access**: Use `agent-os` (Web UI) from your phone to check status or chat.

---

## 0. Tool Acquisition (The "Bleeding Edge" Stack)
Ensure you have these specific versions/tools:

| Component | Tool | Why? |
|-----------|------|------|
| **Connectivity** | **Tailscale** + **Eternal Terminal (`et`)** | `et` survives network drops (WiFi<->5G) better than SSH/Mosh. |
| **Sync** | **Mutagen** | The only tool fast enough for "local-first" dev. |
| **Mobile UI** | **`saadnvd1/agent-os`** | Self-hosted Web UI. Much better than SSH on mobile. |
| **Context** | **`remorses/agentmap`** | Gives the agent a "tree" view of your codebase. Essential for headless VPS. |
| **Env** | **`simonwjackson/opencode-direnv`** | Loads `.envrc` automatically. Critical for API keys on VPS. |
| **Config** | **`tctinh/opencode-sync`** | Syncs `opencode` settings/history via GitHub Gist. |

---

## 1. Infrastructure Prep (Oracle VPS)
On **both** Ashburn and Paris instances:

1.  **Security List (Firewall)**: Open ports `2222` (Eternal Terminal) and `3000` (Agent-OS) for the **Tailscale Interface** (or just allow all traffic from `100.x.y.z`).
2.  **Install Dependencies**:
    ```bash
    # Ubuntu/Debian
    sudo apt update && sudo apt install -y build-essential direnv tmux git nodejs npm
    
    # Install Eternal Terminal (Server)
    # (Follow official docs for your distro)
    
    # Install agent-os (Mobile UI)
    npm install -g agent-os
    ```

---

## 2. Windows Setup (Local)
1.  **Install Mutagen**: `winget install Mutagen.Mutagen` (or via Chocolatey).
2.  **Install Eternal Terminal**: If available for Windows (WSL is safest), otherwise stick to standard `ssh` in the launcher script.
3.  **Tailscale**: Ensure "MagicDNS" is on so you can ping `ashburn`.

---

## 3. The "Hyper-Sync" Config (Mutagen)
We do **NOT** sync `node_modules` or `.venv`. This is critical.

**Config Strategy**:
- `~/.config/opencode` -> Synced via `opencode-sync` (Gist).
- `~/work/<project>` -> Synced via Mutagen (Files).
- `~/.local/share/opencode/history` -> Synced via Mutagen (optional, for offline `agent-archives` viewer).

---

## 4. The Launcher Script (`opencode.ps1`)
Save this to `C:\Users\Microck\bin\opencode.ps1` (and add to PATH). This manages the "Project Hash" logic to prevent collisions.

```powershell
# opencode.ps1
param([string]$Target = "ashburn")

$LocalPath = Get-Location
$FolderName = Split-Path $LocalPath -Leaf
# Generate 6-char hash of full path to ensure "D:\Work\App" != "C:\Tmp\App"
$Hash = (Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($LocalPath))) -Algorithm MD5).Hash.Substring(0, 6)
$SessionID = "mic-$FolderName-$Hash"
$RemoteDir = "~/work/$FolderName-$Hash"

Write-Host "🚀 OpenCode: $FolderName ($Target)" -ForegroundColor Cyan

# 1. Start Mutagen Sync (Idempotent)
# Checks if session exists to avoid errors. Ignores heavy/OS-specific folders.
$SyncExists = mutagen sync list $SessionID 2>$null
if (-not $SyncExists) {
    Write-Host "Creating sync session..."
    mutagen sync create --name $SessionID `
        --ignore "node_modules" --ignore ".venv" --ignore ".git" `
        --ignore "dist" --ignore "build" `
        $LocalPath "$Target`:$RemoteDir"
}

# 2. Launch/Attach Remote Session
# We use 'tmux' directly. 'agent-os' will attach to this later.
# Command: Ensure dir exists -> cd -> Start/Attach tmux session -> Run opencode
$Cmd = "mkdir -p $RemoteDir && cd $RemoteDir && tmux new-session -A -s $SessionID 'opencode'"

# Prefer Eternal Terminal (et) if installed, else SSH
if (Get-Command et -ErrorAction SilentlyContinue) {
    et $Target -c "$Cmd"
} else {
    ssh -t $Target "$Cmd"
}
```

---

## 5. Mobile Access (Step 9 Replacement)
Instead of a raw terminal, use **Agent-OS**.

1.  **On VPS**: Run `agent-os start` (daemon mode). It auto-detects running tmux sessions.
2.  **On Phone**: Open `http://ashburn:3000` (via Tailscale).
3.  **Usage**: You will see your active "Project Hash" sessions. Click to view/chat.

---

## 6. Plugin Ecosystem (The "Smart" Layer)
Install these inside `opencode` on the VPS:

1.  **Environment**: `simonwjackson/opencode-direnv`
    - Create `.envrc` in your project root on VPS (or sync it).
    - *Why*: Keeps API keys isolated per project.
2.  **Context**: `remorses/agentmap`
    - Usage: Automatically runs `tree` to give the agent context.
    - *Why*: The agent is blind on the VPS; this gives it sight.
3.  **Config Sync**: `tctinh/opencode-sync`
    - Setup: `opencode sync login` (needs GitHub Token).
    - *Why*: Ensures your prompts/settings match across Ashburn/Paris.
4.  **History Search**: `yoavf/ai-sessions-mcp`
    - Usage: "Search history for database schema decision".

---

## 7. Maintenance & Cleanup
Using **`kbwo/ccmanager`** on the VPS:
- `ssh ashburn "npm install -g ccmanager"`
- Run `ccmanager list` to see all active agent sessions.
- Run `ccmanager clean` to kill old/stuck sessions.

---

## Done Criteria
- [ ] `opencode` command on Windows drops you into a VPS session instantly.
- [ ] Editing `main.py` locally updates remote within <500ms.
- [ ] `opencode` on VPS can run `python main.py` successfully.
- [ ] Phone access via `http://ashburn:3000` shows the active chat.
