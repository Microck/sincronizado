@echo off
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: sincronizado requires Bun to be installed.
    echo Install Bun: https://bun.sh
    exit /b 1
)

set "SCRIPT_DIR=%~dp0"
bun run "%SCRIPT_DIR%..\src\index.tsx"
