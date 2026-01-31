@echo off
echo ==========================================
echo  SINCRONIZADO INSTALLATION ERROR
echo ==========================================
echo.
echo  Do NOT use 'bunx' or 'npx' on Windows.
echo.
echo  Use one of these methods instead:
echo.
echo  1. One-liner (no TUI):
echo     curl -fsSL https://sincronizado.micr.dev/install.sh ^| bash
echo.
echo  2. TUI (requires Bun):
echo     git clone https://github.com/microck/sincronizado.git
echo     cd sincronizado/installer
echo     bun install
echo     bun run src/index.tsx
echo.
echo  3. PowerShell one-liner:
echo     iex "& { $(irm https://sincronizado.micr.dev/install.ps1) }"
echo.
echo  Docs: https://sincronizado.micr.dev
echo ==========================================
exit /b 1
