# Launcher

This directory contains the Sincronizado launcher scripts.

## Structure

- `opencode.ps1` - Windows PowerShell launcher with hash-based session management
- `opencode.sh` - macOS/Linux Bash launcher

## Features

- Hash-based session IDs (collision-proof)
- Automatic Mutagen sync configuration
- Pre-flight dependency checks
- Session management commands

## Usage

### Windows
```powershell
.\opencode.ps1
```

### macOS
```bash
./opencode.sh
```
