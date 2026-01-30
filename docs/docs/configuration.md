# Configuration Reference

Complete reference for `.opencode.config.json`.

## File Location

**Project-specific:** `.opencode.config.json` in project root

**Global:** `~/.config/sincronizado/config.json` (fallback)

## Schema

```json
{
  "vps": {
    "default": "string",
    "hosts": {
      "host-name": {
        "hostname": "string",
        "user": "string",
        "port": 2222,
        "provider": "string"
      }
    }
  },
  "sync": {
    "ignore": ["string"]
  },
  "session": {
    "prefix": "string",
    "default_editor": "string"
  },
  "plugins": {
    "enabled": ["string"]
  }
}
```

## Options Reference

### vps.default
- **Type:** string
- **Required:** Yes
- **Description:** Name of the default VPS host to use
- **Example:** `"oracle-ashburn"`

### vps.hosts
- **Type:** object
- **Required:** Yes
- **Description:** Map of VPS host configurations

#### host.hostname
- **Type:** string
- **Required:** Yes
- **Description:** Hostname or IP address (Tailscale name works)
- **Example:** `"ashburn"` or `"192.168.1.100"`

#### host.user
- **Type:** string
- **Required:** Yes
- **Default:** `"ubuntu"`
- **Description:** SSH username for VPS

#### host.port
- **Type:** integer
- **Required:** No
- **Default:** `2222`
- **Description:** Eternal Terminal port

#### host.provider
- **Type:** string
- **Required:** No
- **Description:** VPS provider name (for documentation)
- **Example:** `"oracle"`, `"aws"`, `"digitalocean"`

### sync.ignore
- **Type:** array of strings
- **Required:** No
- **Default:** `["node_modules", ".venv", ".git", "dist", "build"]`
- **Description:** File/directory patterns to exclude from sync

### session.prefix
- **Type:** string
- **Required:** No
- **Default:** `"sync-"`
- **Description:** Prefix for session names

### session.default_editor
- **Type:** string
- **Required:** No
- **Default:** `"code"`
- **Description:** Default editor command

### plugins.enabled
- **Type:** array of strings
- **Required:** No
- **Default:** `["opencode-direnv", "agentmap", "opencode-sync", "ai-sessions-mcp", "ccmanager"]`
- **Description:** List of enabled OpenCode plugins

## Example Configurations

### Single VPS (Oracle)
```json
{
  "vps": {
    "default": "oracle-ashburn",
    "hosts": {
      "oracle-ashburn": {
        "hostname": "ashburn",
        "user": "ubuntu",
        "port": 2222,
        "provider": "oracle"
      }
    }
  }
}
```

### Multiple VPS (Production + Staging)
```json
{
  "vps": {
    "default": "prod",
    "hosts": {
      "prod": {
        "hostname": "prod-vps",
        "user": "ubuntu",
        "port": 2222
      },
      "staging": {
        "hostname": "staging-vps",
        "user": "ubuntu",
        "port": 2222
      }
    }
  }
}
```

### Custom Sync Ignore
```json
{
  "sync": {
    "ignore": [
      "node_modules",
      ".venv",
      ".git",
      "dist",
      "build",
      "*.tmp",
      "data/large-files/"
    ]
  }
}
```

### Full Configuration
```json
{
  "vps": {
    "default": "my-vps",
    "hosts": {
      "my-vps": {
        "hostname": "my-vps.tailnet.ts.net",
        "user": "ubuntu",
        "port": 2222,
        "provider": "hetzner"
      }
    }
  },
  "sync": {
    "ignore": [
      "node_modules",
      ".venv",
      ".git",
      "dist",
      "build",
      "__pycache__",
      ".pytest_cache"
    ]
  },
  "session": {
    "prefix": "sync-",
    "default_editor": "code"
  },
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

## Validation

Use the config validation script:

**Windows:**
```powershell
.\scripts\config-wizard.ps1 -Validate
```

This checks:
- Required fields present
- Valid JSON syntax
- Host configurations complete

## Troubleshooting

### Config not loading
1. Check file is valid JSON: `cat .opencode.config.json | python -m json.tool`
2. Verify file is in project root
3. Check file permissions (readable)

### VPS not found
1. Verify `vps.default` matches a key in `vps.hosts`
2. Check `hostname` is correct (ping it)
3. Ensure `user` has SSH access
