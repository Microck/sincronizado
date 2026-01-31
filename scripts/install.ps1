# Sincronizado Installer - PowerShell
# Usage: irm https://sincronizado.micr.dev/install.ps1 | iex

param(
  [Parameter()]
  [ValidateSet("local", "remote")]
  [string]$Mode = "local",

  [Parameter()]
  [string]$VpsHost = "",

  [Parameter()]
  [string]$VpsUser = "ubuntu"
)

$ErrorActionPreference = "Stop"

function Write-Color {
  param([string]$Message, [string]$Color = "White")
  Write-Host $Message -ForegroundColor $Color
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
    Write-Color "Error: Failed to install Bun" "Red"
    exit 1
  }
}

Write-Color "✓ Bun installed" "Green"

# Installation directory
$installDir = "$env:USERPROFILE\.sincronizado"
if (-not (Test-Path $installDir)) {
  New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Clone or update repo
if (Test-Path "$installDir\.git")) {
  Write-Color "Updating sincronizado..." "Yellow"
  Set-Location $installDir
  git pull --rebase
} else {
  Write-Color "Cloning sincronizado..." "Cyan"
  git clone https://github.com/microck/sincronizado.git $installDir
  Set-Location $installDir
}

Write-Color "✓ Repository ready" "Green"

# Run TUI installer for local mode
if ($Mode -eq "local") {
  Write-Color "Installing TUI dependencies..." "Cyan"
  Set-Location "$installDir\installer"
  bun install --silent
  Write-Color "✓ Dependencies installed" "Green"

  Write-Host ""
  Write-Color "Launching TUI installer..." "Green"
  Write-Host ""
  bun run src/index.tsx
}

# Run VPS setup for remote mode
elseif ($Mode -eq "remote") {
  if ([string]::IsNullOrWhiteSpace($VpsHost)) {
    Write-Color "Error: VpsHost required for remote mode" "Red"
    Write-Host "Usage: irm https://sincronizado.micr.dev/install.ps1 | iex; .\install.ps1 -Mode remote -VpsHost <hostname> [-VpsUser <user>]"
    exit 1
  }

  Write-Color "Setting up VPS at $VpsUser@$VpsHost..." "Cyan"
  Write-Host ""

  # Run setup script on VPS
  $scriptUrl = "https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh"
  ssh "$VpsUser@$VpsHost" "curl -fsSL $scriptUrl | sudo bash"

  Write-Host ""
  Write-Color "✓ VPS setup complete" "Green"
  Write-Host ""
  Write-Host "Next steps:"
  Write-Host "  1. Set up local launcher (.\launcher\opencode.ps1)"
  Write-Host "  2. Configure VPS connection in .\.sincronizado\config.json"
  Write-Host "  Docs: https://sincronizado.micr.dev"
}

# Show usage if no mode specified
else {
  Write-Host ""
  Write-Host "Usage:"
  Write-Host ""
  Write-Host "  TUI Installer (recommended):"
  Write-Host "    irm https://sincronizado.micr.dev/install.ps1 | iex"
  Write-Host ""
  Write-Host "  VPS Setup only:"
  Write-Host "    irm https://sincronizado.micr.dev/install.ps1 | iex; .\install.ps1 -Mode remote -VpsHost <hostname> [-VpsUser <user>]"
  Write-Host ""
  Write-Host "  VPS Setup + TUI:"
  Write-Host "    irm https://sincronizado.micr.dev/install.ps1 | iex; .\install.ps1 -Mode remote -VpsHost <hostname>"
  Write-Host "    Then run TUI to configure launcher"
}
