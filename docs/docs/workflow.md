# Daily Workflow Guide

How to use Sincronizado for daily development.

## Starting Your Day

### 1. Connect to Tailscale

```bash
# Windows
tailscale up

# macOS/Linux
tailscale up
```

### 2. Start Development Session

**Windows:**

```powershell
cd D:\Projects\my-project
.\..\sincronizado\launcher\opencode.ps1
```

**macOS/Linux:**

```bash
cd ~/Projects/my-project
~/sincronizado/launcher/opencode.sh
```

### 3. What Happens Automatically

- Hash-based session ID generated (collision-proof)
- Mutagen sync session starts (if not already running)
- Pre-flight checks run (Mutagen, Tailscale, VPS reachability)
- Eternal Terminal connection established
- File sync begins (&lt;500ms latency)

## Working with Sync

### File Sync Behavior

- **Local → VPS**: Changes sync within 500ms
- **VPS → Local**: Changes sync within 500ms
- **Conflicts**: Local wins (two-way-resolved mode)
- **Ignored**: node_modules, .venv, .git, dist, build

### Checking Sync Status

```bash
mutagen sync list
```

### Pause Sync (if needed)

```bash
mutagen sync pause <session-name>
```

### Resume Sync

```bash
mutagen sync resume <session-name>
```

## Managing Sessions

### List Active Sessions

**Windows:**

```powershell
.\launcher\opencode.ps1 -ListSessions
```

**macOS/Linux:**

```bash
./launcher/opencode.sh -l
```

### Kill a Session

**Windows:**

```powershell
.\launcher\opencode.ps1 -KillSession -SessionName "sync-myproject-a1b2c3"
```

**macOS/Linux:**

```bash
./launcher/opencode.sh -k sync-myproject-a1b2c3
```

### End of Day Cleanup

```bash
# List all sessions
mutagen sync list

# Terminate specific session
mutagen sync terminate sync-myproject-a1b2c3

# Or terminate all sync sessions
mutagen sync terminate --all
```

## Mobile Monitoring

1. Open browser on phone/tablet
2. Navigate to `http://your-vps:3000`
3. View and manage sessions remotely

## Best Practices

### Project Organization

- Keep projects in consistent location
- Use meaningful project names
- Configure .opencode.config.json per project

### Session Naming

- Session names include project name + hash
- Example: `sync-myproject-a1b2c3`
- Hash prevents collision with same project name elsewhere

### Performance Tips

- Exclude large directories in sync.ignore
- Use `.envrc` for project-specific env vars
- Keep VPS in region closest to you

### Troubleshooting Quick Fixes

**Sync not working:**

```bash
mutagen sync list  # Check status
mutagen sync resume <session>  # If paused
```

**VPS unreachable:**

```bash
ping your-vps-hostname  # Check connectivity
tailscale status  # Verify Tailscale
```

**Session won't start:**

- Check .opencode.config.json is valid
- Verify VPS host configuration
- Ensure ports 2222 and 3000 are open

## Advanced Usage

### Multiple Projects

Each project gets unique session via path hash:

- `D:\Work\app` → `sync-app-3a5b2c`
- `C:\Tmp\app` → `sync-app-7d8e9f`

### Multiple VPS Targets

Edit `.opencode.config.json`:

```json
{
  "vps": {
    "default": "production",
    "hosts": {
      "production": { "hostname": "prod-vps", ... },
      "staging": { "hostname": "staging-vps", ... }
    }
  }
}
```

### Custom Ignore Patterns

Edit `.opencode.config.json`:

```json
{
  "sync": {
    "ignore": ["node_modules", ".venv", "*.tmp", "large-files/"]
  }
}
```
