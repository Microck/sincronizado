# OpenCode Plugins

Complete guide to installing and using OpenCode plugins with Sincronizado.

## Included Plugins

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

### ccmanager (kbwo)

**Purpose:** Manage and cleanup OpenCode sessions.

**Installation:**
```bash
# Included in VPS setup script
npm install -g @kbwo/ccmanager
```

**Usage:**
- `ccmanager list` - List all sessions
- `ccmanager kill <session-id>` - Kill specific session
- `ccmanager cleanup` - Remove orphaned sessions
- `ccmanager killall` - Kill all sessions (use with caution)

## Plugin Configuration

Edit `.opencode.config.json` to enable/disable plugins:

```json
{
  "plugins": {
    "enabled": [
      "opencode-direnv",
      "agentmap",
      "opencode-sync",
      "ai-sessions-mcp",
      "ccmanager"
    ]
  }
}
```

## Troubleshooting

### Plugin not loading
1. Check plugin is in `~/.config/opencode/plugins/`
2. Verify plugin name matches enabled list in config
3. Restart OpenCode session

### sync plugin authentication fails
1. Regenerate GitHub token with `gist` scope
2. Run `opencode sync login` again
3. Check token hasn't expired

### direnv not loading
1. Ensure `.envrc` exists and is executable
2. Run `direnv allow` after creating/modifying
3. Check `.envrc` syntax is valid bash
