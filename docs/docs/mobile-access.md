# Mobile Access with Agent-OS

Access your development sessions from anywhere using Agent-OS Web UI.

## What is Agent-OS?

Agent-OS provides a web-based interface to monitor and interact with your OpenCode sessions running on your VPS. Access it from any device with a browser.

## Setup

### VPS Configuration (Already done if you ran setup-vps.sh)

Agent-OS is installed and configured automatically by the VPS setup script. It runs as a systemd service on port 3000.

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

## Features

### Session Monitoring
- View active OpenCode sessions
- See real-time AI output
- Monitor file sync status

### Session Control
- Start new sessions
- Stop existing sessions
- Send commands to running sessions

### Mobile-Optimized
- Responsive design works on phones/tablets
- Touch-friendly interface
- Dark mode support

## Security Considerations

- **Always use Tailscale** when possible (encrypted, private)
- **Enable authentication** if exposing to internet
- **Use strong VPS passwords** or SSH keys
- **Keep Agent-OS updated**: `npm update -g agent-os`

## Troubleshooting

### Cannot connect to Agent-OS
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

### Agent-OS not starting
1. Check logs:
   ```bash
   sudo journalctl -u agent-os -f
   ```
2. Reinstall if needed:
   ```bash
   sudo npm install -g agent-os
   sudo systemctl restart agent-os
   ```

### Slow performance on mobile
1. Reduce sync frequency in Mutagen
2. Close unnecessary browser tabs
3. Use WiFi instead of cellular when possible

## Tips

- **Bookmark the URL** for quick access
- **Add to home screen** on mobile for app-like experience
- **Use split-screen** on tablets (editor + Agent-OS)
- **Enable notifications** in browser for session alerts
