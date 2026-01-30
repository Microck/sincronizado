#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Sincronizado Windows Launcher - Hash-based session management for remote development

.DESCRIPTION
    Launches OpenCode sessions on remote VPS with automatic file sync via Mutagen.
    Uses hash-based session IDs to prevent project name collisions.

.EXAMPLE
    .\opencode.ps1
    Starts a new development session

.EXAMPLE
    .\opencode.ps1 -ListSessions
    Lists all active sessions

.EXAMPLE
    .\opencode.ps1 -KillSession -SessionName "myproject-a1b2c3"
    Kills a specific session
#>

[CmdletBinding()]
param(
    [switch]$ListSessions,
    [switch]$KillSession,
    [string]$SessionName,
    [switch]$Verbose,
    [switch]$Help
)

# Configuration
$ConfigFileName = ".opencode.config.json"
$GlobalConfigDir = "$env:USERPROFILE\.config\sincronizado"
$GlobalConfigFile = "$GlobalConfigDir\config.json"

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Debug = "Gray"
}

# Logging functions
function Write-Status {
    param([string]$Message, [string]$Level = "Info")
    $color = $Colors[$Level]
    Write-Host "[$Level] $Message" -ForegroundColor $color
}

function Write-Verbose {
    param([string]$Message)
    if ($Verbose) {
        Write-Status -Message $Message -Level "Debug"
    }
}

# Configuration Management
function Get-ProjectPath {
    return (Get-Location).Path
}

function Get-ProjectName {
    $path = Get-ProjectPath
    return Split-Path -Leaf $path
}

function Get-SessionHash {
    $path = Get-ProjectPath
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($path)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    $hashString = [BitConverter]::ToString($hash).Replace("-", "").Substring(0, 6).ToLower()
    return $hashString
}

function Get-SessionName {
    $projectName = Get-ProjectName
    $hash = Get-SessionHash
    return "sync-${projectName}-${hash}"
}

function Get-Config {
    $config = $null
    
    # Try local config first
    $localConfig = Join-Path (Get-ProjectPath) $ConfigFileName
    if (Test-Path $localConfig) {
        try {
            $config = Get-Content $localConfig | ConvertFrom-Json
            Write-Verbose "Loaded local config: $localConfig"
        } catch {
            Write-Status "Failed to parse local config" "Error"
        }
    }
    
    # Fall back to global config
    if (-not $config -and (Test-Path $GlobalConfigFile)) {
        try {
            $config = Get-Content $GlobalConfigFile | ConvertFrom-Json
            Write-Verbose "Loaded global config: $GlobalConfigFile"
        } catch {
            Write-Status "Failed to parse global config" "Error"
        }
    }
    
    # Return default config if nothing found
    if (-not $config) {
        $config = @{
            vps = @{
                default = "localhost"
                hosts = @{}
            }
            sync = @{
                ignore = @("node_modules", ".venv", ".git", "dist", "build")
            }
            session = @{
                prefix = "sync-"
            }
        }
        Write-Verbose "Using default config"
    }
    
    return $config
}

# Pre-flight Checks
function Test-MutagenInstalled {
    try {
        $null = Get-Command mutagen -ErrorAction Stop
        Write-Verbose "Mutagen found"
        return $true
    } catch {
        Write-Status "Mutagen not found. Install with: winget install Mutagen.Mutagen" "Error"
        return $false
    }
}

function Test-TailscaleRunning {
    try {
        $status = tailscale status 2>&1
        if ($status -match "not running|stopped") {
            Write-Status "Tailscale is not running. Start with: tailscale up" "Warning"
            return $false
        }
        Write-Verbose "Tailscale is running"
        return $true
    } catch {
        Write-Status "Tailscale not found. Install from https://tailscale.com/download" "Error"
        return $false
    }
}

function Test-VPSReachable {
    param([string]$Hostname)
    
    if (-not $Hostname) {
        return $false
    }
    
    try {
        $result = Test-Connection -ComputerName $Hostname -Count 1 -Quiet -ErrorAction Stop
        if ($result) {
            Write-Verbose "VPS $Hostname is reachable"
            return $true
        } else {
            Write-Status "VPS $Hostname is not reachable" "Error"
            return $false
        }
    } catch {
        Write-Status "Cannot reach VPS $Hostname" "Error"
        return $false
    }
}

# Mutagen Management
function Get-MutagenSessions {
    try {
        $sessions = mutagen sync list --format json 2>$null | ConvertFrom-Json
        return $sessions
    } catch {
        return @()
    }
}

function Test-SessionExists {
    param([string]$SessionName)
    
    $sessions = Get-MutagenSessions
    $session = $sessions | Where-Object { $_.identifier -eq $SessionName -or $_.name -eq $SessionName }
    return $null -ne $session
}

function Start-MutagenSync {
    param(
        [string]$SessionName,
        [string]$LocalPath,
        [string]$RemoteHost,
        [string]$RemotePath,
        [array]$IgnorePatterns
    )
    
    Write-Status "Starting Mutagen sync session: $SessionName" "Info"
    
    # Build ignore flags
    $ignoreArgs = $IgnorePatterns | ForEach-Object { "--ignore=$_" }
    
    # Create sync session
    $remoteUrl = "${RemoteHost}:${RemotePath}"
    
    try {
        $args = @(
            "sync", "create", $LocalPath, $remoteUrl,
            "--name=$SessionName",
            "--sync-mode=two-way-resolved"
        ) + $ignoreArgs
        
        & mutagen @args 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Sync session created successfully" "Success"
            return $true
        } else {
            Write-Status "Failed to create sync session" "Error"
            return $false
        }
    } catch {
        Write-Status "Error creating sync session: $_" "Error"
        return $false
    }
}

function Stop-MutagenSync {
    param([string]$SessionName)
    
    Write-Status "Stopping sync session: $SessionName" "Info"
    
    try {
        mutagen sync terminate $SessionName 2>&1 | Out-Null
        Write-Status "Sync session terminated" "Success"
        return $true
    } catch {
        Write-Status "Error terminating sync session: $_" "Error"
        return $false
    }
}

# Session Management
function Show-Sessions {
    Write-Status "Active Sincronizado Sessions:" "Info"
    Write-Host ""
    
    $sessions = Get-MutagenSessions
    
    if ($sessions.Count -eq 0) {
        Write-Status "No active sessions" "Warning"
        return
    }
    
    $syncSessions = $sessions | Where-Object { $_.identifier -like "sync-*" }
    
    if ($syncSessions.Count -eq 0) {
        Write-Status "No Sincronizado sessions found" "Warning"
        return
    }
    
    foreach ($session in $syncSessions) {
        Write-Host "  Session: $($session.identifier)" -ForegroundColor Cyan
        Write-Host "    Alpha: $($session.alpha.path)" -ForegroundColor Gray
        Write-Host "    Beta:  $($session.beta.path)" -ForegroundColor Gray
        Write-Host "    Status: $($session.status)" -ForegroundColor $(if ($session.status -eq "watching") { "Green" } else { "Yellow" })
        Write-Host ""
    }
}

function Remove-Session {
    param([string]$TargetSession)
    
    if (-not $TargetSession) {
        Write-Status "No session name provided" "Error"
        return $false
    }
    
    if (-not (Test-SessionExists -SessionName $TargetSession)) {
        Write-Status "Session not found: $TargetSession" "Error"
        return $false
    }
    
    Write-Status "Terminating session: $TargetSession" "Info"
    return (Stop-MutagenSync -SessionName $TargetSession)
}

# Main Launch Function
function Start-DevSession {
    $config = Get-Config
    $sessionName = Get-SessionName
    $localPath = Get-ProjectPath
    
    Write-Status "Sincronizado Development Session" "Info"
    Write-Status "Project: $(Get-ProjectName)" "Info"
    Write-Status "Session: $sessionName" "Info"
    Write-Host ""
    
    # Pre-flight checks
    Write-Status "Running pre-flight checks..." "Info"
    
    $checks = @(
        (Test-MutagenInstalled),
        (Test-TailscaleRunning)
    )
    
    # Get VPS configuration
    $vpsDefault = $config.vps.default
    $vpsConfig = $config.vps.hosts.$vpsDefault
    
    if ($vpsConfig) {
        $vpsHost = $vpsConfig.hostname
        $checks += (Test-VPSReachable -Hostname $vpsHost)
    } else {
        Write-Status "No VPS configured. Please create $ConfigFileName" "Error"
        return
    }
    
    if ($checks -contains $false) {
        Write-Status "Pre-flight checks failed. Please fix the issues above." "Error"
        return
    }
    
    Write-Status "All checks passed!" "Success"
    Write-Host ""
    
    # Check if session already exists
    if (Test-SessionExists -SessionName $sessionName) {
        Write-Status "Session already exists. Resuming..." "Info"
    } else {
        # Create new sync session
        $remotePath = "/home/$($vpsConfig.user)/workspace/$(Get-ProjectName)"
        $ignorePatterns = $config.sync.ignore
        
        $result = Start-MutagenSync `
            -SessionName $sessionName `
            -LocalPath $localPath `
            -RemoteHost $vpsHost `
            -RemotePath $remotePath `
            -IgnorePatterns $ignorePatterns
        
        if (-not $result) {
            Write-Status "Failed to start sync session" "Error"
            return
        }
    }
    
    Write-Status "File sync active" "Success"
    Write-Status "Local:  $localPath" "Info"
    Write-Status "Remote: $vpsHost" "Info"
    Write-Host ""
    Write-Status "Connecting via Eternal Terminal..." "Info"
    
    # Connect via Eternal Terminal
    $etHost = $vpsConfig.hostname
    $etPort = if ($vpsConfig.port) { $vpsConfig.port } else { 2222 }
    
    try {
        et $etHost`:$etPort
    } catch {
        Write-Status "Failed to connect via Eternal Terminal" "Error"
        Write-Status "You can try manual SSH: ssh $($vpsConfig.user)@$etHost" "Info"
    }
}

# Help
function Show-Help {
    Write-Host @"
Sincronizado Windows Launcher

USAGE:
    .\opencode.ps1 [OPTIONS]

OPTIONS:
    -ListSessions    List all active sessions
    -KillSession     Kill a specific session (requires -SessionName)
    -SessionName     Specify session name for -KillSession
    -Verbose         Enable verbose output
    -Help            Show this help message

CONFIGURATION:
    Create a .opencode.config.json file in your project root:
    {
      "vps": {
        "default": "my-vps",
        "hosts": {
          "my-vps": {
            "hostname": "my-vps-hostname",
            "user": "ubuntu",
            "port": 2222
          }
        }
      }
    }

EXAMPLES:
    Start a new session:
        .\opencode.ps1

    List all sessions:
        .\opencode.ps1 -ListSessions

    Kill a session:
        .\opencode.ps1 -KillSession -SessionName "sync-myproject-a1b2c3"
"@ -ForegroundColor Cyan
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

if ($ListSessions) {
    Show-Sessions
    exit 0
}

if ($KillSession) {
    $result = Remove-Session -TargetSession $SessionName
    exit $(if ($result) { 0 } else { 1 })
}

# Default: start development session
Start-DevSession
