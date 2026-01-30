# OpenCode Plugins

Complete guide to installing and using OpenCode plugins with Sincronizado.

## Core Plugins (Standard Mode)

These plugins are installed by default in standard mode and higher.

### opencode-direnv (simonwjackson)

**Purpose:** Automatically load environment variables from `.envrc` files when entering directories.

**Installation:**

```bash
# Included in VPS setup script
# Or install manually:
git clone https://github.com/simonwjackson/opencode-direnv.git ~/.config/opencode/plugins/direnv
```

**Usage:**

1. Create `.envrc` in project root:
   ```bash
   export API_KEY=secret123
   export DATABASE_URL=postgres://localhost/db
   ```
2. Run `direnv allow`
3. Variables auto-load when you enter the directory

### agentmap (remorses)

**Purpose:** Tree view of codebase for better context in headless VPS environments.

**Installation:**

```bash
# Included in VPS setup script
git clone https://github.com/remorses/agentmap.git ~/.config/opencode/plugins/agentmap
```

**Usage:**

- Type `map` or `tree` in OpenCode to see project structure
- Helps AI understand full codebase layout

### opencode-sync (tctinh)

**Purpose:** Synchronize OpenCode settings and history across multiple machines via GitHub Gist.

**Installation:**

```bash
# Included in VPS setup script
git clone https://github.com/tctinh/opencode-sync.git ~/.config/opencode/plugins/sync
```

**Setup:**

1. Create GitHub Personal Access Token with `gist` scope
2. Run `opencode sync login`
3. Enter your token
4. Run `opencode sync push` to upload settings
5. On new machine: `opencode sync pull`

### ai-sessions-mcp (yoavf)

**Purpose:** Search and reference past OpenCode sessions.

**Installation:**

```bash
# Included in VPS setup script
git clone https://github.com/yoavf/ai-sessions-mcp.git ~/.config/opencode/plugins/ai-sessions
```

**Usage:**

- `search "previous work on auth"` - Find relevant past sessions
- `session:last` - Reference last session context

## Session Management

### ccmanager (kbwo)

**Purpose:** Visual session manager with real-time status indicators.

**Installation:**

```bash
# Included in VPS setup script (unless --no-ccmanager)
npm install -g @kbwo/ccmanager
```

**Usage:**

- `ccmanager` - Launch interactive TUI
- `ccmanager list` - List all sessions
- Shows status: busy/waiting/idle per session
- Git worktree integration with session data copying

### agent-of-empires (njbrake)

**Purpose:** Alternative session manager using tmux + git worktrees.

**Installation:**

```bash
# Install via VPS setup
sudo ./scripts/setup-vps.sh --with-agent-of-empires

# Or manually
curl -fsSL https://raw.githubusercontent.com/njbrake/agent-of-empires/main/install.sh | bash
```

**Usage:**

- TUI/CLI session manager
- Auto-creates worktrees per session
- Status dashboard
- Docker sandboxing option

**Note:** Mutually exclusive with ccmanager. Use `--with-agent-of-empires --no-ccmanager` to switch.

## Optional Plugins (Full/Custom Mode)

### opencode-worktree-session (felixAnhalt)

**Purpose:** Automatic Git worktree per OpenCode session with auto-cleanup.

**Installation:**

```bash
# Included in VPS setup with --with-worktree-session
npm install -g @tmegit/opencode-worktree-session
```

**Configuration:**
Add to `opencode.json`:

```json
{
  "plugin": ["@tmegit/opencode-worktree-session"]
}
```

**Usage:**

1. Run `opencode`
2. Prompt asks for branch suffix (e.g., `feature-auth`)
3. Plugin creates `opencode/feature-auth` branch and worktree
4. AI works in isolated environment
5. On exit: auto-commits changes, pushes branch, removes worktree

**Benefits:**

- No main branch pollution
- Each task in isolated branch
- Automatic cleanup
- Refuses to run on main branch (safety)

### opencode-session-handoff (bristena-op)

**Purpose:** Seamless context continuation when sessions fill up.

**Installation:**

```bash
# Configure in opencode.json (plugin-based, no install needed)
```

**Configuration:**
Add to `opencode.json`:

```json
{
  "plugin": ["opencode-session-handoff"]
}
```

**Usage:**

1. Session fills up (context limit reached)
2. Say "handoff"
3. Plugin creates new session with compact continuation prompt
4. Context preserved across sessions

**Critical for:**

- Long-running tasks
- Mobile workflow (sessions fill faster on phone)
- Multi-device development

## Plugin Configuration

Edit `.opencode.config.json` to enable/disable plugins:

```json
{
  "plugins": {
    "enabled": ["opencode-direnv", "agentmap", "opencode-sync", "ai-sessions-mcp", "ccmanager"]
  }
}
```

For npm-based plugins (worktree-session, session-handoff), add to `opencode.json` instead.

## Troubleshooting

### Plugin not loading

1. Check plugin is in `~/.config/opencode/plugins/`
2. Verify plugin name matches enabled list in config
3. Restart OpenCode session
4. For npm plugins: verify global install with `npm list -g`

### sync plugin authentication fails

1. Regenerate GitHub token with `gist` scope
2. Run `opencode sync login` again
3. Check token hasn't expired

### direnv not loading

1. Ensure `.envrc` exists and is executable
2. Run `direnv allow` after creating/modifying
3. Check `.envrc` syntax is valid bash

### worktree-session not activating

1. Verify plugin installed: `npm list -g @tmegit/opencode-worktree-session`
2. Check `opencode.json` has correct plugin path
3. Ensure you're not on main branch (plugin refuses to run there)

### session-handoff not working

1. Verify plugin configured in `opencode.json`
2. Say "handoff" clearly (not "hand off" or "hand-off")
3. Check if context actually filled (may need longer conversation)
