# Sincronizado Installer - PowerShell
# Usage: irm https://sincronizado.micr.dev/install.ps1 | iex

param(
  [Parameter()]
  [ValidateSet("local", "remote")]
  [string]$Mode = "local"
)

$ErrorActionPreference = "Stop"

function Write-Color {
  param([string]$Message, [string]$Color = "White")
  Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
  param([string]$Message)
  Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-Fail {
  param([string]$Message)
  Write-Host "ERR: $Message" -ForegroundColor Red
}

Write-Color "========================================" "Cyan"
Write-Color "  SINCRONIZADO INSTALLER" "Cyan"
Write-Color "========================================" "Cyan"
Write-Host ""

# Check for Bun
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Write-Color "Bun not found. Installing Bun..." "Yellow"
  irm bun.sh/install.ps1 | iex

  if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Fail "Failed to install Bun"
    exit 1
  }
}

Write-Success "Bun installed"

# Installation directory
$installDir = "$env:USERPROFILE\.sincronizado"
if (-not (Test-Path $installDir)) {
  New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Clone or update repo
if (Test-Path "$installDir\.git") {
  Write-Color "Updating sincronizado..." "Yellow"
  Set-Location $installDir
  git pull --rebase
} else {
  Write-Color "Cloning sincronizado..." "Cyan"
  git clone https://github.com/microck/sincronizado.git $installDir
  Set-Location $installDir
}

Write-Success "Repository ready"

# Check if TUI config exists from previous run
$configFile = "$env:USERPROFILE\.sincronizado\config.json"
$vpsSetupDone = $false

if (Test-Path $configFile) {
  $config = Get-Content $configFile | ConvertFrom-Json
  if ($config.vps -and $config.vps.host -and $config.vps.host -ne "") {
    $vpsSetupDone = $true
    Write-Success "Previous VPS configuration found"
    Write-Host "  Host: $($config.vps.host)" -ForegroundColor Cyan
    Write-Host "  User: $($config.vps.user)" -ForegroundColor Cyan
  }
}

Write-Host ""
Write-Color "Installing TUI dependencies..." "Cyan"
Set-Location "$installDir\installer"
bun install --silent
Write-Success "Dependencies installed"

Write-Host ""
Write-Color "Launching TUI installer..." "Green"
Write-Host ""
bun run src/index.ts

# After TUI exits, check if we should do VPS setup
Set-Location $installDir
$tuiResultFile = "installer\.tui-result.json"

if (Test-Path $tuiResultFile) {
  $result = Get-Content $tuiResultFile | ConvertFrom-Json

  if ($result.action -eq "setup-vps") {
    Write-Host ""
    Write-Color "========================================" "Cyan"
    Write-Color "  VPS SETUP" "Cyan"
    Write-Color "========================================" "Cyan"
    Write-Host ""

    $host = $result.host
    $user = if ($result.user) { $result.user } else { "ubuntu" }
    $mode = if ($result.mode) { $result.mode } else { "standard" }
    $flags = if ($result.flags) { $result.flags } else { "" }

    if ([string]::IsNullOrWhiteSpace($host)) {
      Write-Fail "VPS host not configured"
      exit 1
    }

    Write-Color "Setting up VPS at $user@$host..." "Cyan"
    Write-Host "  Mode: $mode" -ForegroundColor Yellow
    Write-Host ""

    # Run setup script on VPS
    $scriptUrl = "https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh"
    $setupCmd = "ssh $user@$host ""curl -fsSL $scriptUrl | sudo bash -s -- $flags"""

    Invoke-Expression $setupCmd

    if ($LASTEXITCODE -eq 0) {
      Write-Host ""
      Write-Success "VPS setup complete!"
      Write-Host ""
      Write-Host "Next steps:"
      Write-Host "  1. Set up local launcher (.\launcher\opencode.ps1)"
      Write-Host "  2. Test connection: ssh $user@$host"
      Write-Host "  3. Access Agent-OS: http://$host`:3000"
    } else {
      Write-Host ""
      Write-Fail "VPS setup failed"
      Write-Host "  Check your SSH connection and try manually:"
      Write-Host "  ssh $user@$host"
      Write-Host "  irm https://sincronizado.micr.dev/setup-vps.sh | iex"
    }
  }

  # Cleanup
  Remove-Item $tuiResultFile -Force -ErrorAction SilentlyContinue
} else {
  Write-Host ""
  Write-Color "Note: Run TUI again to configure VPS setup" "Yellow"
  Write-Host "  After TUI completes, you'll be prompted for VPS installation"
}
