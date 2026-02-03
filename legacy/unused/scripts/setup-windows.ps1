#!/usr/bin/env pwsh
# Sincronizado Windows VPS Setup Script
# Usage: iex "& { $(irm https://sync.micr.dev/install.ps1) } [-Mode <minimal|standard|full>]"

param(
    [ValidateSet("minimal", "standard", "full")]
    [string]$Mode = "standard"
)

$ErrorActionPreference = "Stop"

Write-Host "ᕙ(⇀‸↼‶)ᕗ Sincronizado Windows Setup - Mode: $Mode" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "This script requires Administrator privileges. Please run as Administrator."
    exit 1
}

# Install required tools
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Check if winget is available
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error "Windows Package Manager (winget) not found. Please install App Installer from Microsoft Store."
    exit 1
}

# Install Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Git..."
    winget install --id Git.Git -e --source winget
}

# Install OpenSSH Client
$sshFeature = Get-WindowsCapability -Online | Where-Object { $_.Name -like "OpenSSH.Client*" }
if ($sshFeature.State -ne "Installed") {
    Write-Host "Installing OpenSSH Client..."
    Add-WindowsCapability -Online -Name $sshFeature.Name
}

# Install Mutagen
if (-not (Get-Command mutagen -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Mutagen..."
    winget install --id Mutagen.Mutagen -e --source winget
}

# Install Eternal Terminal (et)
if (-not (Get-Command et -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Eternal Terminal..."
    # Download and install et for Windows
    $etUrl = "https://github.com/MisterTea/EternalTerminal/releases/latest/download/et-windows.zip"
    $etTemp = "$env:TEMP\et-windows.zip"
    $etDest = "$env:LOCALAPPDATA\Programs\EternalTerminal"
    
    Invoke-WebRequest -Uri $etUrl -OutFile $etTemp
    Expand-Archive -Path $etTemp -DestinationPath $etDest -Force
    
    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($etDest)) {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$etDest", "User")
        $env:Path = "$env:Path;$etDest"
    }
    
    Remove-Item $etTemp
}

# Install Tailscale
if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Tailscale..."
    winget install --id tailscale.tailscale -e --source winget
}

# Clone Sincronizado repository
$sincDir = "$env:USERPROFILE\sincronizado"
if (-not (Test-Path $sincDir)) {
    Write-Host "Cloning Sincronizado repository..."
    git clone https://github.com/microck/sincronizado.git $sincDir
} else {
    Write-Host "Updating Sincronizado repository..."
    Set-Location $sincDir
    git pull
}

# Run VPS setup based on mode
Write-Host ""
Write-Host "VPS Setup Instructions:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "1. SSH into your VPS:"
Write-Host "   ssh ubuntu@YOUR_VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Download and run setup:"
Write-Host "   curl -fsSL https://sync.micr.dev/install.sh | sudo bash -s -- --mode=$Mode" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. After VPS setup completes, return to Windows and run:"
Write-Host "   cd $sincDir\launcher" -ForegroundColor Cyan
Write-Host "   .\opencode.ps1 -Project YOUR_PROJECT" -ForegroundColor Cyan
Write-Host ""
Write-Host "ᕙ(⇀‸↼‶)ᕗ Setup complete! Install dependencies on your VPS to continue." -ForegroundColor Cyan
