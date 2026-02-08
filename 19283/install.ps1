$ErrorActionPreference = "Stop"

# sincronizado installer (Windows / PowerShell)
#
# Primary path: download the latest `sinc.exe` from GitHub Releases.
# Fallback path (when no compatible exe exists): install Bun, download the repo
# source, install deps, and install a small `sinc.cmd` wrapper that runs the CLI.
#
# Optionally launches the setup TUI.

$Repo = if ($env:SINC_REPO) { $env:SINC_REPO } else { "Microck/sincronizado" }
$InstallDir = if ($env:SINC_INSTALL_DIR) { $env:SINC_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "Programs\sincronizado" }
$AppDir = if ($env:SINC_APP_DIR) { $env:SINC_APP_DIR } else { Join-Path $InstallDir "app" }

$arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
$asset = "sinc-windows-$arch.exe"
$url = "https://github.com/$Repo/releases/latest/download/$asset"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$binPath = Join-Path $InstallDir "sinc.exe"

Write-Host "Downloading $asset from $Repo..."

function Install-Bun {
  if (Get-Command bun -ErrorAction SilentlyContinue) {
    return
  }

  Write-Host "Bun not found. Installing Bun (required for fallback install)..." -ForegroundColor Yellow
  try {
    irm bun.sh/install.ps1 | iex
  } catch {
    throw "Failed to install Bun: $($_.Exception.Message)"
  }

  if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    throw "Bun install finished, but bun is still not on PATH. Restart your terminal and retry."
  }
}

function Install-FromSource {
  Install-Bun

  $ref = if ($env:SINC_REF) { $env:SINC_REF } else { "main" }
  $zipUrl = if ($ref.StartsWith("v")) {
    "https://github.com/$Repo/archive/refs/tags/$ref.zip"
  } else {
    "https://github.com/$Repo/archive/refs/heads/$ref.zip"
  }

  $zipPath = Join-Path $env:TEMP "sincronizado-$ref.zip"
  if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

  Write-Host "Fallback install: downloading source ($ref)..." -ForegroundColor Yellow
  Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

  if (Test-Path $AppDir) { Remove-Item -Recurse -Force $AppDir }
  New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

  Expand-Archive -Path $zipPath -DestinationPath $AppDir -Force
  Remove-Item -Force $zipPath

  # The zip extracts into a single top-level directory.
  $root = Get-ChildItem -Path $AppDir | Where-Object { $_.PSIsContainer } | Select-Object -First 1
  if (-not $root) { throw "Unable to find extracted source directory" }

  Write-Host "Installing dependencies..." -ForegroundColor Yellow
  Push-Location $root.FullName
  bun install
  Pop-Location

  # Create a wrapper on PATH.
  $cmdPath = Join-Path $InstallDir "sinc.cmd"
  $cliPath = Join-Path $root.FullName "src\cli\index.ts"
  @" 
@echo off
bun ""$cliPath"" %*
"@ | Set-Content -Encoding ascii $cmdPath

  Write-Host "Installed: $cmdPath" -ForegroundColor Green
}

$downloadOk = $false
try {
  Invoke-WebRequest -Uri $url -OutFile $binPath -UseBasicParsing
  $downloadOk = $true
} catch {
  $downloadOk = $false
}

if ($downloadOk) {
  Write-Host "Installed: $binPath" -ForegroundColor Green
} else {
  Write-Host "Warning: no compatible prebuilt exe found for $asset. Using fallback install." -ForegroundColor Yellow
  Install-FromSource
}

# Add to user PATH (idempotent)
$currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $currentUserPath) { $currentUserPath = "" }

$parts = $currentUserPath -split ';' | Where-Object { $_ -and $_.Trim().Length -gt 0 }
if ($parts -notcontains $InstallDir) {
  $newPath = ($parts + $InstallDir) -join ';'
  [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
  Write-Host "Added to user PATH: $InstallDir"
} else {
  Write-Host "User PATH already contains: $InstallDir"
}

# Update current session PATH too
if ($env:Path -notlike "*$InstallDir*") {
  $env:Path = "$env:Path;$InstallDir"
}

Write-Host ""
Write-Host "Verify: sinc --version"
try {
  if ($downloadOk) {
    & $binPath --version | Out-Host
  } else {
    & (Join-Path $InstallDir "sinc.cmd") --version | Out-Host
  }
} catch {
  # ignore
}

function ShouldRunSetup {
  if ($env:SINC_NONINTERACTIVE -eq "1") { return $false }
  if ($env:SINC_RUN_SETUP -eq "1") { return $true }

  $ans = Read-Host "Run 'sinc --setup' now? (Y/n)"
  if (-not $ans) { return $true }
  return $ans -match '^(y|yes)$'
}

if (ShouldRunSetup) {
  Write-Host ""
  Write-Host "Launching setup TUI..."
  if ($downloadOk) {
    & $binPath --setup
  } else {
    & (Join-Path $InstallDir "sinc.cmd") --setup
  }
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Next: run 'sinc --setup' to configure your VPS and dependencies."
