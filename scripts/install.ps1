$ErrorActionPreference = "Stop"

$Repo = "microck/sincronizado"
$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\sincronizado"

$arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
$asset = "sinc-windows-$arch.exe"
$url = "https://github.com/$Repo/releases/latest/download/$asset"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Host "Downloading $asset..."
Invoke-WebRequest -Uri $url -OutFile (Join-Path $InstallDir "sinc.exe")

Write-Host "Installed sinc to $InstallDir\sinc.exe"
Write-Host "Next: run 'sinc --setup' to finish configuration."
