#!/usr/bin/env pwsh
#Requires -Version 7.0

[CmdletBinding()]
param(
    [switch]$ListSessions,
    [switch]$KillSession,
    [string]$SessionName,
    [switch]$Verbose,
    [switch]$Help
)

$ConfigFileName = ".claude.config.json"
$GlobalConfigDir = "$env:USERPROFILE\.config\sincronizado"
$GlobalConfigFile = "$GlobalConfigDir\config.json"

$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Debug = "Gray"
}

function Write-Status {
    param([string]$Message, [string]$Level = "Info")
    $color = $Colors[$Level]
    Write-Host $Message -ForegroundColor $color
}

function Get-ProjectHash {
    param([string]$Path)
    $hash = Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($Path))) -Algorithm SHA256
    return $hash.Hash.Substring(0, 6).ToLower()
}

function Find-Config {
    $localConfig = Join-Path $PWD $ConfigFileName
    if (Test-Path $localConfig) {
        return $localConfig
    }
    if (Test-Path $GlobalConfigFile) {
        return $GlobalConfigFile
    }
    return $null
}

function Load-Config {
    param([string]$ConfigPath)
    if (-not $ConfigPath -or -not (Test-Path $ConfigPath)) {
        Write-Status "No config found. Create $ConfigFileName in project root or run setup." "Error"
        exit 1
    }
    Get-Content $ConfigPath | ConvertFrom-Json
}

function Test-Dependencies {
    $deps = @("mutagen", "ssh")
    foreach ($dep in $deps) {
        if (-not (Get-Command $dep -ErrorAction SilentlyContinue)) {
            Write-Status "Missing dependency: $dep" "Error"
            exit 1
        }
    }
}

function Get-SessionId {
    param([string]$ProjectPath, [string]$Prefix = "sync-")
    $folderName = Split-Path $ProjectPath -Leaf
    $hash = Get-ProjectHash $ProjectPath
    return "$Prefix$folderName-$hash"
}

function Invoke-ClaudeSession {
    param([hashtable]$Config)
    
    $sessionId = Get-SessionId $PWD $Config.session_prefix
    $remoteDir = "$($Config.vps.beta)/$((Split-Path $PWD -Leaf))"
    
    Write-Status "Starting Claude Code session: $sessionId" "Info"
    
    $sshCmd = "mkdir -p $remoteDir && cd $remoteDir && tmux new-session -A -s $sessionId 'claude'"
    $etCmd = "et $($Config.vps.user)@$($Config.vps.host):$($Config.vps.port) -c `"$sshCmd`""
    
    if ($Verbose) {
        Write-Status "Command: $etCmd" "Debug"
    }
    
    Invoke-Expression $etCmd
}

function Show-Help {
    @"
Claude Code Launcher for Sincronizado

Usage: .\claude.ps1 [OPTIONS]

Options:
    -ListSessions    List all active tmux sessions
    -KillSession     Kill a specific session (requires -SessionName)
    -SessionName     Target session name for -KillSession
    -Verbose         Show detailed output
    -Help            Show this help message

Configuration:
    Create .claude.config.json in your project root:
    {
        "vps": {
            "host": "your-vps.tailnet.ts.net",
            "user": "ubuntu",
            "port": 2222
        },
        "sync": {
            "alpha": ".",
            "beta": "~/projects"
        },
        "session_prefix": "sync-"
    }
"@
}

if ($Help) {
    Show-Help
    exit 0
}

Test-Dependencies

$configPath = Find-Config
$config = Load-Config $configPath

if ($ListSessions) {
    $sessions = ssh -p $config.vps.port "$($config.vps.user)@$($config.vps.host)" "tmux ls 2>/dev/null || echo 'No active sessions'"
    Write-Status "Active sessions:" "Info"
    $sessions | ForEach-Object { Write-Status "  $_" }
    exit 0
}

if ($KillSession) {
    if (-not $SessionName) {
        Write-Status "Error: -SessionName required with -KillSession" "Error"
        exit 1
    }
    ssh -p $config.vps.port "$($config.vps.user)@$($config.vps.host)" "tmux kill-session -t $SessionName 2>/dev/null || echo 'Session not found'"
    Write-Status "Session $SessionName terminated" "Success"
    exit 0
}

Invoke-ClaudeSession $config
