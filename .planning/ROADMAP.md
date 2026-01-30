# Sincronizado Roadmap

**Goal: Package hyper-local dev solution so anyone can recreate it**

## Milestone 1: MVP - Complete Solution Packaged

### Phase 1: Create Project Structure
**Status:** ✅ Complete
**Goal:** Organize repository for packaging solution
**Summary:** [.planning/phases/01-create-project-structure/01-01-SUMMARY.md](./phases/01-create-project-structure/01-01-SUMMARY.md)

- [x] Create directory structure (scripts/, launcher/, config/, docs/)
- [x] Initialize Git repository with GitHub remote
- [x] Add LICENSE (MIT)
- [x] Set up CI/CD pipelines (GitHub Actions)
- [x] Scaffold Docusaurus documentation site
- [x] Configure code quality tools (editorconfig, prettier, eslint)
- [x] Create contribution guidelines
- [x] Add GitHub issue/PR templates
- [x] Create configuration template

### Phase 2: VPS Setup Script
**Status:** Pending
**Goal:** One-command VPS setup for Ubuntu/Debian

- [ ] Create setup-vps.sh script
- [ ] Add OS detection (Ubuntu 20.04+, Debian 11+)
- [ ] Install base dependencies (git, npm, direnv, tmux)
- [ ] Install Eternal Terminal (et) from official docs
- [ ] Install agent-os via npm
- [ ] Install all OpenCode plugins
  - simonwjackson/opencode-direnv
  - remorses/agentmap
  - tctinh/opencode-sync
  - yoavf/ai-sessions-mcp
- [ ] Install kbwo/ccmanager for session management
- [ ] Configure firewall (ports 2222, 3000)
- [ ] Add validation and error handling
- [ ] Create rollback script
- [ ] Test on fresh Ubuntu 20.04
- [ ] Test on fresh Debian 11

### Phase 3: Windows Launcher (opencode.ps1)
**Status:** Pending
**Goal:** Package my hash-based session launcher

- [ ] Extract exact opencode.ps1 from PLAN.md
- [ ] Add pre-flight checks
  - Mutagen installed?
  - Tailscale running?
  - Target host reachable?
- [ ] Add error handling and user-friendly messages
- [ ] Add verbose/quiet modes
- [ ] Add help command
- [ ] Create session list command
- [ ] Create session kill command
- [ ] Add configuration file support (.opencode.config.json)
- [ ] Test on Windows 10
- [ ] Test on Windows 11
- [ ] Test with various project types

### Phase 4: macOS Launcher (opencode.sh)
**Status:** Pending
**Goal:** Bash equivalent of Windows launcher

- [ ] Port hash collision logic to Bash
- [ ] Same session ID format
- [ ] Same Mutagen sync patterns
- [ ] Same session management commands
- [ ] Add macOS-specific paths and tools
- [ ] Test on macOS 12+ Intel
- [ ] Test on macOS 12+ Apple Silicon

### Phase 5: Configuration System
**Status:** Pending
**Goal:** Make solution customizable

- [ ] Create .opencode.config.json schema
  - VPS targets (name, hostname, provider)
  - Port configuration
  - Session prefix (default: sync-)
  - Sync ignore patterns
  - Plugin selection
- [ ] Create config validation script
- [ ] Create example config with defaults
- [ ] Add interactive config generator
- [ ] Document all options
- [ ] Create config migration script

### Phase 6: Multi-VPS Provider Support
**Status:** Pending
**Goal:** Support multiple cloud providers

- [ ] Create AWS VPS setup script
  - EC2 instance requirements
  - Security group configuration
  - User setup
- [ ] Create GCP VPS setup script
  - Compute Engine requirements
  - Firewall rules
  - User setup
- [ ] Create Azure VPS setup script
  - VM requirements
  - Network configuration
  - User setup
- [ ] Create DigitalOcean VPS setup script
  - Droplet requirements
  - Firewall configuration
- [ ] Create provider comparison guide
  - Pricing
  - Setup complexity
  - Performance

### Phase 7: Plugin Documentation
**Status:** Pending
**Goal:** Document all plugin integrations

- [ ] Document simonwjackson/opencode-direnv
  - Installation
  - .envrc creation
  - Usage examples
- [ ] Document remorses/agentmap
  - Installation
  - Tree integration
  - Usage in OpenCode
- [ ] Document tctinh/opencode-sync
  - GitHub Gist setup
  - Sync workflow
  - Multi-VPS config
- [ ] Document yoavf/ai-sessions-mcp
  - History search
  - Examples
- [ ] Document kbwo/ccmanager
  - Session listing
  - Cleanup commands
- [ ] Create troubleshooting guide for each plugin

### Phase 8: Mobile Access Documentation
**Status:** Pending
**Goal:** Complete mobile setup guide

- [ ] Document agent-os daemon setup
- [ ] Create auto-start script
- [ ] Configure tmux session detection
- [ ] Document Tailscale mobile setup
  - DNS configuration
  - MagicDNS setup
  - Mobile app usage
- [ ] Test mobile UX flow end-to-end
- [ ] Create mobile troubleshooting guide
- [ ] Document UI customization options

### Phase 9: Workflow Documentation
**Status:** Pending
**Goal:** Document how to use solution

- [ ] Create daily workflow guide
  - Starting work (opencode launcher)
  - File editing flow
  - Session management
  - Ending work (pause, cleanup)
- [ ] Document optimization tips
  - Hash collision why it matters
  - Mutagen ignore patterns
  - Sync performance
- [ ] Create example projects
  - Node.js project setup
  - Python project setup
  - Rust project setup
- [ ] Document troubleshooting patterns
  - Sync issues
  - Network drops
  - Session corruption
  - VPS resource limits

### Phase 10: Testing & Validation
**Status:** Pending
**Goal:** Ensure solution works for others

- [ ] Test complete Windows flow
  - Fresh machine install
  - VPS setup
  - Session launch
  - File sync
  - Mobile access
- [ ] Test complete macOS flow
  - Same as Windows
- [ ] Test network resilience
  - WiFi ↔ 5G handoff
  - Long-running sessions
  - Network interruptions
- [ ] Test collision detection
  - Same project name, different paths
  - Verify unique session IDs
- [ ] Test sync performance
  - Measure latency
  - Large files
  - Many small files
- [ ] Test plugin interactions
  - All plugins working together
  - Session cleanup
  - History search
- [ ] Create bug bash checklist
- [ ] Fix all critical bugs

### Phase 11: Packaging & Distribution
**Status:** Pending
**Goal:** Easy installation for all users

- [ ] Create Windows installer (NSIS or Inno Setup)
  - Bundle launcher
  - Add to PATH
  - Create Start Menu shortcuts
- [ ] Create Chocolatey package
  - Publish to Chocolatey.org
  - Auto-update support
- [ ] Create Homebrew formula (macOS)
  - Submit to Homebrew
  - Auto-update support
- [ ] Create npm package (config scripts, utils)
- [ ] Set up GitHub release automation
- [ ] Create versioning strategy (semver)
- [ ] Write release notes for v1.0.0

### Phase 12: Documentation Site
**Status:** Pending
**Goal:** Comprehensive documentation

- [ ] Set up documentation platform (Docusaurus)
- [ ] Create Getting Started
  - Prerequisites
  - Quick start (5 min setup)
  - Detailed installation
- [ ] Create Reference
  - Launcher commands
  - Configuration options
  - Plugin reference
  - Troubleshooting
- [ ] Create Guides
  - Architecture explanation
  - Optimization tips
  - Customization examples
  - Advanced usage
- [ ] Create FAQ
  - Common issues
  - Solutions
- [ ] Deploy to GitHub Pages

### Phase 13: Launch & v1.0.0 Release
**Status:** Pending
**Goal:** Ship to world

- [ ] Final code review
- [ ] Complete critical bugs
- [ ] Run final integration tests
- [ ] Create GitHub release v1.0.0
  - Attach installers
  - Detailed release notes
  - Architecture explanation
- [ ] Publish Chocolatey package
- [ ] Publish Homebrew formula
- [ ] Publish npm package
- [ ] Write launch announcement
  - What this is
  - Why I built it
  - Who it's for
  - How to get started
- [ ] Post on communities
  - OpenCode Discord
  - Tailscale community
  - r/devops
  - r/selfhosted
- [ ] Monitor initial feedback
- [ ] Fix critical bugs immediately

## Milestone 2: Post-v1.0 Enhancements

### Phase 14: GUI Configuration Tool
- Electron/Tauri desktop app
- Visual VPS configuration
- Visual session management
- One-click VPS provisioning

### Phase 15: Alternative Tools Support
- Mosh as alternative to Eternal Terminal
- Unison as alternative to Mutagen
- Custom mobile UI alternatives
- Tool comparison guide

## Statistics

- Total Phases: 15
- Completed: 0
- In Progress: 0
- Pending: 15
- Overall Progress: 0%
