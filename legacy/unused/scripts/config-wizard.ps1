#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Sincronizado Configuration Wizard

.DESCRIPTION
    Interactive wizard to create and validate .opencode.config.json files
#>

[CmdletBinding()]
param(
    [switch]$Validate,
    [string]$ConfigPath = ".opencode.config.json"
)

$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
}

function Write-Status {
    param([string]$Message, [string]$Level = "Info")
    Write-Host "[$Level] $Message" -ForegroundColor $Colors[$Level]
}

function New-ConfigWizard {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "  Sincronizado Configuration Wizard" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $config = @{
        vps = @{
            default = ""
            hosts = @{}
        }
        sync = @{
            ignore = @("node_modules", ".venv", ".git", "dist", "build", "__pycache__", ".pytest_cache", "*.log")
        }
        session = @{
            prefix = "sync-"
            default_editor = "code"
        }
        plugins = @{
            enabled = @("opencode-direnv", "agentmap", "opencode-sync", "ai-sessions-mcp", "ccmanager")
        }
    }
    
    # VPS Configuration
    Write-Status "VPS Configuration" "Info"
    Write-Host ""
    
    $vpsName = Read-Host "Enter a name for this VPS (e.g., 'oracle-ashburn')"
    $config.vps.default = $vpsName
    
    $hostname = Read-Host "Enter VPS hostname or Tailscale name"
    $user = Read-Host "Enter VPS username (default: ubuntu)"
    if (-not $user) { $user = "ubuntu" }
    
    $port = Read-Host "Enter Eternal Terminal port (default: 2222)"
    if (-not $port) { $port = 2222 } else { $port = [int]$port }
    
    $config.vps.hosts.$vpsName = @{
        hostname = $hostname
        user = $user
        port = $port
        provider = "custom"
    }
    
    # Sync configuration
    Write-Host ""
    Write-Status "Sync Configuration" "Info"
    $customIgnore = Read-Host "Additional patterns to ignore (comma-separated, or press Enter for defaults)"
    if ($customIgnore) {
        $config.sync.ignore += $customIgnore -split ",\s*"
    }
    
    # Session configuration
    Write-Host ""
    Write-Status "Session Configuration" "Info"
    $prefix = Read-Host "Session prefix (default: sync-)"
    if ($prefix) { $config.session.prefix = $prefix }
    
    # Save configuration
    Write-Host ""
    Write-Status "Saving configuration..." "Info"
    
    try {
        $config | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath
        Write-Status "Configuration saved to $ConfigPath" "Success"
        
        Write-Host ""
        Write-Status "Configuration complete!" "Success"
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Ensure your VPS is running and accessible" -ForegroundColor Gray
        Write-Host "  2. Run the launcher: .\launcher\opencode.ps1" -ForegroundColor Gray
        
    } catch {
        Write-Status "Failed to save configuration: $_" "Error"
    }
}

function Test-Config {
    param([string]$Path)
    
    Write-Status "Validating configuration..." "Info"
    
    if (-not (Test-Path $Path)) {
        Write-Status "Configuration file not found: $Path" "Error"
        return $false
    }
    
    try {
        $config = Get-Content $Path | ConvertFrom-Json
        $valid = $true
        
        # Check required fields
        if (-not $config.vps.default) {
            Write-Status "Missing: vps.default" "Error"
            $valid = $false
        }
        
        if (-not $config.vps.hosts.($config.vps.default)) {
            Write-Status "Missing: vps.hosts.$($config.vps.default)" "Error"
            $valid = $false
        }
        
        $hostConfig = $config.vps.hosts.($config.vps.default)
        if (-not $hostConfig.hostname) {
            Write-Status "Missing: vps.hosts.$($config.vps.default).hostname" "Error"
            $valid = $false
        }
        
        if (-not $hostConfig.user) {
            Write-Status "Missing: vps.hosts.$($config.vps.default).user" "Error"
            $valid = $false
        }
        
        if ($valid) {
            Write-Status "Configuration is valid" "Success"
        } else {
            Write-Status "Configuration has errors" "Error"
        }
        
        return $valid
        
    } catch {
        Write-Status "Invalid JSON: $_" "Error"
        return $false
    }
}

# Main
if ($Validate) {
    Test-Config -Path $ConfigPath
} else {
    if (Test-Path $ConfigPath) {
        Write-Status "Configuration already exists: $ConfigPath" "Warning"
        $overwrite = Read-Host "Overwrite? (y/N)"
        if ($overwrite -ne "y") {
            Write-Status "Cancelled" "Info"
            exit 0
        }
    }
    New-ConfigWizard
}
