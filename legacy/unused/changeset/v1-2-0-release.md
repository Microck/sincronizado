---
'sincronizado': minor
---

## v1.2.0 - Complete TUI Rebuild + Security Hardening

### Major Changes

- **Rebuilt TUI with @clack/prompts** - Replaced OpenTUI with modern, lightweight @clack/prompts library (used by Vite, Astro)
- **Yellow-only color palette** - Consistent brand colors throughout (monkey-patched picocolors)
- **New ASCII art system** - Large and small ASCII arts moved to separate `arts.ts` file for easy customization
- **VPS Security Hardening** - New optional feature to secure your VPS automatically

### New Features

- **Security Hardening Script** (`scripts/harden-vps.sh`):
  - Automatic security updates with unattended-upgrades
  - Non-root user creation with sudo access
  - SSH key authentication setup
  - SSH hardening (disable root login, password auth)
  - UFW firewall configuration (ports 22, 80, 443, 2222, 3000)
  - Fail2ban brute-force protection (3 attempts = 1 hour ban)
  - Disables unnecessary services

- **Dev Testing Utility** (`installer/src/dev.ts`):
  - Test all TUI components
  - ASCII art display
  - Color palette verification
  - Spinner, prompts, notes testing

### Installer Flow Updates

- **10-screen flow** (up from 8):
  1. Welcome
  2. Agent selection (OpenCode/Claude)
  3. Mode selection (minimal/standard/full/custom)
  4. Addons (checkboxes)
  5. **Security hardening (NEW)**
  6. VPS provider
  7. Config
  8. Confirm
  9. Install
  10. Complete

### Documentation Updates

- Updated README.md with new features
- Updated docs/quick-start.mdx
- Updated docs/index.mdx
- Removed all OpenTUI references

### Migration Notes

- TUI entry point changed from `src/index.tsx` to `src/index.ts`
- Still requires Bun to run
- All existing functionality preserved
