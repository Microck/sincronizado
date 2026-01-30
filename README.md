# sincronizado

> hyper-local dev with remote ai execution

sincronizado runs your ai coding assistant on a vps while you edit files locally. zero latency. maximum compute. mobile accessible.

## why

local machines have great editors but limited resources. running multiple ai instances locally is intensive and hard to manage while doing other work. cloud vps has compute but terrible latency for editing. sincronizado bridges this: edit locally, execute remotely.

## architecture

```mermaid
graph TB
    subgraph Local["Local Dev Machine"]
        VS[VS Code / JetBrains]
        Launcher[Launcher<br/>hash-based sessions]
    end

    subgraph Network["Secure Network"]
        TS[Tailscale VPN]
        Mut[Mutagen Sync<br/><500ms]
    end

    subgraph VPS["Oracle VPS"]
        AI[AI Agent<br/>OpenCode or Claude]
        TM[Tmux Sessions]
        AO[Agent-OS<br/>port 3000]
    end

    subgraph Mobile["Mobile Access"]
        Phone[Phone Browser]
    end

    VS <-->|Mut| AI
    Launcher <-->|ET SSH| TM
    TS -.->|encrypts| VS
    TS -.->|encrypts| VPS
    Phone -->|http| AO
```

## installation modes

### linux / macos (bash)

```bash
# minimal - core only (et, opencode, ufw)
curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- --mode=minimal

# standard - recommended (+ agent-os, ccmanager, plugins)
curl -fsSL https://sincronizado.micr.dev/install.sh | bash

# full - everything (+ kimaki discord bot, lunaroute proxy, etc)
curl -fsSL https://sincronizado.micr.dev/install.sh | bash -s -- --mode=full
```

### windows (powershell)

```powershell
# minimal - core only
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) } -Mode minimal"

# standard - recommended (default)
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) }"

# full - everything
iex "& { $(irm https://sincronizado.micr.dev/install.ps1) } -Mode full"
```

### tui installer (interactive)

```bash
bunx sincronizado
```

## quick start

### 1. vps setup (one-time)

```bash
ssh ubuntu@your-vps-ip
sudo ./setup-vps.sh --mode=standard
```

### 2. local setup

```powershell
# windows
winget install Mutagen.Mutagen
.\launcher\opencode.ps1 -Project myapp

# macos/linux
brew install mutagen
./launcher/opencode.sh -p myapp
```

### 3. done

- editor syncs via mutagen (<500ms)
- ai runs on vps via eternal terminal
- check status on phone at http://vps:3000

## tiered installation

| mode         | components                            | use case                |
| ------------ | ------------------------------------- | ----------------------- |
| **minimal**  | et, opencode, ufw                     | headless servers, ci/cd |
| **standard** | + agent-os, ccmanager, plugins        | **recommended**         |
| **full**     | + kimaki, lunaroute, worktree-session | power users             |
| **custom**   | pick components                       | specific needs          |

### optional components

```bash
--with-kimaki              # discord bot for voice/text control
--with-lunaroute           # ai proxy with token tracking
--with-worktree-session    # git worktree per session
--with-session-handoff     # context continuation
--with-agent-of-empires    # alt to ccmanager (tmux+worktree)

--no-agent-os              # skip web ui
--no-ccmanager             # skip session manager
--no-plugins               # skip opencode plugins
```

## tui installer

```bash
# interactive mode selection
bunx sincronizado

# or install globally
npm install -g sincronizado
sincronizado
```

8-screen flow:

1. welcome
2. mode select (minimal/standard/full/custom)
3. addons (checkboxes)
4. vps provider (oracle/hetzner/do/aws)
5. config (hostname, user, root)
6. confirm
7. install (real-time ssh progress)
8. complete

## core components

| tool                 | purpose            | why it matters                        |
| -------------------- | ------------------ | ------------------------------------- |
| **tailscale**        | zero-config vpn    | no port forwarding, secure by default |
| **eternal terminal** | resilient ssh      | survives wifi/5g handoffs             |
| **mutagen**          | bidirectional sync | <500ms file sync                      |
| **opencode**         | ai agent           | the actual ai doing work              |
| **agent-os**         | web ui             | mobile access, session browser        |

## advanced features

### kimaki (discord integration)

```bash
# install
sudo ./setup-vps.sh --with-kimaki

# configure
npx kimaki  # interactive discord bot setup
systemctl start kimaki
```

text your codebase from discord. voice messages transcribed via gemini. each project = channel, each session = thread.

### lunaroute (ai debugging)

```bash
# install
sudo ./setup-vps.sh --with-lunaroute

# run
eval $(lunaroute-server env)
```

proxy all ai calls. track token usage. debug conversations. web ui at port 8082.

### worktree sessions

```bash
# install
sudo ./setup-vps.sh --with-worktree-session

# usage
opencode  # prompts for branch suffix, auto-creates worktree
```

each task gets isolated git worktree. auto-commits on exit. no main branch pollution.

### session handoff

say "handoff" in opencode → new session starts with compact continuation prompt. critical for long sessions on mobile.

## configuration

```json
// .opencode.config.json
{
  "vps": {
    "host": "oracle.tail1234.ts.net",
    "user": "ubuntu",
    "port": 2222
  },
  "sync": {
    "alpha": ".",
    "beta": "~/projects/myapp",
    "ignore": [".git", "node_modules", ".next"]
  }
}
```

see [docs/configuration.md](docs/docs/configuration.md)

## mobile access

agent-os runs on vps port 3000. access via tailscale or expose through nginx.

```bash
# status
systemctl status agent-os

# logs
journalctl -u agent-os -f
```

## troubleshooting

| issue             | fix                              |
| ----------------- | -------------------------------- |
| sync slow         | check `mutagen sync list`        |
| et disconnects    | restart: `systemctl restart et`  |
| agent-os 502      | opencode not running, check logs |
| kimaki offline    | `systemctl restart kimaki`       |
| port 3000 blocked | `ufw allow 3000/tcp`             |

## project structure

```
sincronizado/
├── launcher/          # windows (ps1) + mac/linux (sh)
├── scripts/           # vps setup, rollback
├── installer/         # opentui-based tui
├── config/            # templates
└── docs/              # docusaurus site
```

## status

phases 1-15 complete. v1.1.0 ready.

see [.planning/ROADMAP.md](.planning/ROADMAP.md) for details.

## license

mit ᕙ(⇀‸↼‶)ᕗ
