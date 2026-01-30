# Mobile Access

Access your development sessions from anywhere using Agent-OS Web UI or Kimaki Discord Bot.

## Agent-OS Web UI

Agent-OS provides a web-based interface to monitor and interact with your OpenCode sessions running on your VPS. Access it from any device with a browser.

### Setup

Agent-OS is installed and configured automatically by the VPS setup script (standard mode or higher). It runs as a systemd service on port 3000.

### Accessing Agent-OS

1. **Via Tailscale (Recommended)**
   - Install Tailscale on your mobile device
   - Connect to your tailnet
   - Open browser to `http://your-vps-hostname:3000`

2. **Direct IP (if firewall allows)**
   - Open browser to `http://your-vps-ip:3000`
   - Note: Only works if you're on the same network or have port forwarding

3. **Tailscale Funnel (for external access)**
   ```bash
   tailscale funnel 3000
   ```

   - Creates public HTTPS URL
   - Use for accessing from anywhere without Tailscale app

### Features

**Session Monitoring**

- View active OpenCode sessions
- See real-time AI output
- Monitor file sync status

**Session Control**

- Start new sessions
- Stop existing sessions
- Send commands to running sessions

**Mobile-Optimized**

- Responsive design works on phones/tablets
- Touch-friendly interface
- Dark mode support

---

## Kimaki Discord Integration

Kimaki adds Discord-based control for your OpenCode sessions, including voice message support.

### Installation

Install Kimaki during VPS setup:

```bash
# Via TUI installer
bunx sincronizado
# Select "Full" mode or check "Kimaki (Discord Bot)" in Custom mode

# Or via command line
sudo ./scripts/setup-vps.sh --with-kimaki
```

### Setup

**1. Create Discord Bot**

```bash
# On your VPS
npx kimaki
```

The interactive wizard will:

- Guide you through Discord bot creation at discord.com/developers
- Configure required intents (Message Content, Server Members)
- Generate an invite link
- Store configuration in `~/.kimaki/`

**2. Start Kimaki Service**

```bash
sudo systemctl start kimaki
sudo systemctl enable kimaki
```

**3. Invite Bot to Your Server**

- Use the invite link from the setup wizard
- Create a dedicated Discord server for development
- The bot will automatically create channels for each project

### Usage

**Text Messages**
Send any message in a project channel to start an OpenCode session. Kimaki creates a thread and starts the AI agent.

**Voice Messages**
Record a voice message in Discord. Kimaki transcribes it using Google's Gemini API and processes it as text. Perfect for hands-free coding while mobile.

**Slash Commands**

- `/session <prompt>` - Start new session with initial prompt
- `/resume <session>` - Resume previous session
- `/abort` - Stop current running session
- `/add-project <project>` - Create channels for existing project
- `/queue <message>` - Queue a follow-up message
- `/model` - Change AI model for channel

**File Attachments**
Attach images, code files, or any other files to your message. Kimaki includes them in the session context.

### Architecture

Each Discord channel maps to a project directory on your VPS. Each Discord thread maps to an OpenCode session.

```
Discord Server
├── #project-a (maps to ~/projects/project-a)
│   └── Thread: "Fix auth bug" (OpenCode session)
├── #project-b (maps to ~/projects/project-b)
│   └── Thread: "Add tests" (OpenCode session)
└── #general (admin/commands)
```

### CI Integration

Trigger Kimaki sessions from GitHub Actions:

```yaml
# .github/workflows/investigate.yml
name: Investigate Issues
on:
  issues:
    types: [opened]

jobs:
  investigate:
    runs-on: ubuntu-latest
    steps:
      - name: Start Kimaki Session
        env:
          KIMAKI_BOT_TOKEN: ${{ secrets.KIMAKI_BOT_TOKEN }}
        run: |
          npx -y kimaki send \
            --channel "1234567890123456789" \
            --prompt "Investigate issue ${{ github.event.issue.html_url }}" \
            --name "Issue #${{ github.event.issue.number }}"
```

### Multi-Machine Support

Run multiple Kimaki instances (one per VPS):

```bash
# VPS 1
data-dir: ~/.kimaki

# VPS 2
data-dir: ~/work-bot

# Each has separate Discord bot and configuration
```

---

## Security Considerations

- **Always use Tailscale** when possible (encrypted, private)
- **Enable authentication** if exposing to internet
- **Use strong VPS passwords** or SSH keys
- **Keep Agent-OS updated**: `npm update -g agent-os`
- **Kimaki permissions**: Only users with "Kimaki" role or admin can trigger sessions
- **Create "no-kimaki" role** to block specific users (break-glass principle)

## Troubleshooting

### Agent-OS Issues

**Cannot connect to Agent-OS**

1. Verify Agent-OS is running:
   ```bash
   sudo systemctl status agent-os
   ```
2. Check firewall allows port 3000:
   ```bash
   sudo ufw status
   ```
3. Verify Tailscale connection:
   ```bash
   tailscale status
   ```

**Agent-OS not starting**

1. Check logs:
   ```bash
   sudo journalctl -u agent-os -f
   ```
2. Reinstall if needed:
   ```bash
   sudo npm install -g agent-os
   sudo systemctl restart agent-os
   ```

### Kimaki Issues

**Bot not responding**

1. Check Kimaki service status:
   ```bash
   sudo systemctl status kimaki
   ```
2. View logs:
   ```bash
   sudo journalctl -u kimaki -f
   ```
3. Verify bot token is configured:
   ```bash
   ls ~/.kimaki/
   ```
4. Restart Kimaki:
   ```bash
   sudo systemctl restart kimaki
   ```

**Voice messages not transcribing**

1. Ensure Gemini API key is configured during `npx kimaki` setup
2. Check file size (Discord has voice message limits)
3. Verify Kimaki has voice permissions in Discord channel

### Slow performance on mobile

1. Reduce sync frequency in Mutagen
2. Close unnecessary browser tabs
3. Use WiFi instead of cellular when possible
4. For Kimaki: Discord may cache images, clear cache if needed

## Tips

**Agent-OS**

- **Bookmark the URL** for quick access
- **Add to home screen** on mobile for app-like experience
- **Use split-screen** on tablets (editor + Agent-OS)
- **Enable notifications** in browser for session alerts

**Kimaki**

- **Create dedicated Discord server** for development
- **Use voice messages** for hands-free coding while walking/commuting
- **Send long prompts as file attachments** (Discord has character limits)
- **Use `/queue`** to chain tasks without waiting for current response
