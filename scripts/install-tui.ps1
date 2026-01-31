# Sincronizado TUI Installer - PowerShell One-Liner
# Usage: iex "& { $(irm https://sincronizado.micr.dev/install-tui.ps1) }"

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SINCRONIZADO TUI INSTALLER" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check for Bun
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Write-Host "Error: Bun is required but not installed." -ForegroundColor Red
  Write-Host "Install Bun:" -ForegroundColor Yellow
  Write-Host "  irm bun.sh/install.ps1 | iex" -ForegroundColor White
  exit 1
}

# Clone or update repo
$installDir = "$env:USERPROFILE\.sincronizado-installer"
if (Test-Path "$installDir\.git")) {
  Write-Host "Updating installer..." -ForegroundColor Green
  Set-Location "$installDir"
  git pull
} else {
  Write-Host "Downloading installer..." -ForegroundColor Green
  git clone --depth 1 https://github.com/microck/sincronizado.git "$installDir"
  Set-Location "$installDir\installer"
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
bun install --silent

# Run TUI
Write-Host "Launching TUI installer..." -ForegroundColor Green
bun run src/index.tsx
