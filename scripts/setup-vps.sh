#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_FILE="/var/log/sincronizado-setup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

MODE="standard"
WITH_KIMAKI=false
WITH_LUNAROUTE=false
WITH_WORKTREE_SESSION=false
WITH_SESSION_HANDOFF=false
WITH_AGENT_OF_EMPIRES=false
WITH_CCMANAGER=true
WITH_AGENT_OS=true
WITH_PLUGINS=true

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_help() {
    cat << EOF
Sincronizado VPS Setup

Usage: sudo ./setup-vps.sh [OPTIONS]

Installation Modes:
  --mode=minimal          Core only: ET, OpenCode, UFW
  --mode=standard         Recommended: + Agent-OS, ccmanager, plugins (DEFAULT)
  --mode=full            Everything: + kimaki, session-handoff, worktree-session
  --mode=custom          Pick components with --with-* flags

Component Flags (for custom mode):
  --with-kimaki          Install Discord bot (kimaki)
  --with-lunaroute       Install AI proxy (lunaroute)
  --with-worktree-session Install git worktree plugin
  --with-session-handoff  Install session handoff plugin
  --with-agent-of-empires Install agent-of-empires (alternative to ccmanager)
  --no-agent-os          Skip Agent-OS installation
  --no-ccmanager         Skip ccmanager (use agent-of-empires instead)
  --no-plugins           Skip OpenCode plugins

Other Options:
  --help, -h             Show this help message

Examples:
  sudo ./setup-vps.sh                    # Standard mode (default)
  sudo ./setup-vps.sh --mode=minimal     # Minimal install
  sudo ./setup-vps.sh --mode=full        # Full install with all extras
  sudo ./setup-vps.sh --mode=custom --with-kimaki --with-lunaroute

EOF
}

parse_flags() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --mode=*)
                MODE="${1#*=}"
                shift
                ;;
            --with-kimaki)
                WITH_KIMAKI=true
                shift
                ;;
            --with-lunaroute)
                WITH_LUNAROUTE=true
                shift
                ;;
            --with-worktree-session)
                WITH_WORKTREE_SESSION=true
                shift
                ;;
            --with-session-handoff)
                WITH_SESSION_HANDOFF=true
                shift
                ;;
            --with-agent-of-empires)
                WITH_AGENT_OF_EMPIRES=true
                WITH_CCMANAGER=false
                shift
                ;;
            --no-agent-os)
                WITH_AGENT_OS=false
                shift
                ;;
            --no-ccmanager)
                WITH_CCMANAGER=false
                shift
                ;;
            --no-plugins)
                WITH_PLUGINS=false
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Validate mode
    case $MODE in
        minimal|standard|full|custom)
            ;;
        *)
            log_error "Invalid mode: $MODE (must be minimal, standard, full, or custom)"
            exit 1
            ;;
    esac

    # Auto-enable flags for full mode
    if [[ "$MODE" == "full" ]]; then
        WITH_KIMAKI=true
        WITH_WORKTREE_SESSION=true
        WITH_SESSION_HANDOFF=true
    fi

    # Log configuration
    log_info "Installation mode: $MODE"
    log_info "Agent-OS: $WITH_AGENT_OS"
    log_info "ccmanager: $WITH_CCMANAGER"
    log_info "Plugins: $WITH_PLUGINS"
    log_info "Kimaki: $WITH_KIMAKI"
    log_info "LunaRoute: $WITH_LUNAROUTE"
    log_info "Worktree-session: $WITH_WORKTREE_SESSION"
    log_info "Session-handoff: $WITH_SESSION_HANDOFF"
    log_info "Agent-of-empires: $WITH_AGENT_OF_EMPIRES"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Run as root or with sudo"
        exit 1
    fi
}

detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "/etc/os-release not found"
        exit 1
    fi

    case $OS in
        ubuntu)
            if [[ $(echo "$VERSION >= 20.04" | bc) -ne 1 ]]; then
                log_error "Ubuntu $VERSION not supported (needs 20.04+)"
                exit 1
            fi
            ;;
        debian)
            if [[ $(echo "$VERSION >= 11" | bc) -ne 1 ]]; then
                log_error "Debian $VERSION not supported (needs 11+)"
                exit 1
            fi
            ;;
        *)
            log_error "Unsupported OS: $OS (only Ubuntu 20.04+ and Debian 11+)"
            exit 1
            ;;
    esac

    log_success "OS: $OS $VERSION"
}

install_base_deps() {
    log_info "Updating packages..."
    apt-get update -qq

    log_info "Installing base dependencies..."
    apt-get install -y -qq git npm direnv tmux curl wget unzip ufw bc \
        libssl-dev libprotobuf-dev protobuf-compiler cmake g++ \
        libsodium-dev libncurses5-dev libgflags-dev libutempter-dev libboost-all-dev

    log_success "Base dependencies installed"
}

install_opencode() {
    log_info "Installing OpenCode..."
    
    if command -v opencode &> /dev/null; then
        log_warning "OpenCode already installed"
        return 0
    fi

    curl -fsSL https://opencode.ai/install.sh | bash
    
    log_success "OpenCode installed"
}

install_eternal_terminal() {
    log_info "Installing Eternal Terminal..."
    
    if command -v et &> /dev/null; then
        log_warning "Eternal Terminal already installed"
        return 0
    fi

    ET_VERSION="6.2.9"
    ARCH=$(uname -m)
    
    case $ARCH in
        x86_64) ET_ARCH="linux_x86_64" ;;
        aarch64) ET_ARCH="linux_arm64" ;;
        *) 
            log_warning "No pre-built binary for $ARCH, building from source..."
            install_et_from_source
            return 0
            ;;
    esac

    cd /tmp
    wget -q "https://github.com/MisterTea/EternalTerminal/releases/download/et-v${ET_VERSION}/et-${ET_VERSION}-${ET_ARCH}.tar.gz"
    tar -xzf "et-${ET_VERSION}-${ET_ARCH}.tar.gz"
    cd "et-${ET_VERSION}-${ET_ARCH}"
    ./install.sh
    
    log_success "Eternal Terminal installed"
}

install_et_from_source() {
    log_info "Building Eternal Terminal from source..."
    
    cd /tmp
    rm -rf EternalTerminal
    git clone --depth 1 https://github.com/MisterTea/EternalTerminal.git
    cd EternalTerminal
    mkdir -p build && cd build
    cmake ..
    make -j$(nproc)
    make install
    
    log_success "Eternal Terminal built and installed"
}

install_agent_os() {
    if [[ "$WITH_AGENT_OS" != "true" ]]; then
        log_info "Skipping Agent-OS (--no-agent-os specified)"
        return 0
    fi

    log_info "Installing Agent-OS..."
    
    if command -v agent-os &> /dev/null; then
        log_warning "Agent-OS already installed"
        return 0
    fi

    npm install -g agent-os
    
    cat > /etc/systemd/system/agent-os.service << 'EOF'
[Unit]
Description=Agent-OS Web UI
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/agent-os
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable agent-os
    systemctl start agent-os
    
    log_success "Agent-OS installed and started"
}

install_opencode_plugins() {
    if [[ "$WITH_PLUGINS" != "true" ]]; then
        log_info "Skipping OpenCode plugins (--no-plugins specified)"
        return 0
    fi

    log_info "Installing OpenCode plugins..."
    
    PLUGINS_DIR="/opt/opencode-plugins"
    mkdir -p "$PLUGINS_DIR"
    cd "$PLUGINS_DIR"
    
    install_plugin() {
        local name=$1
        local url=$2
        if [[ ! -d "$name" ]]; then
            git clone "$url" "$name"
            log_success "$name installed"
        fi
    }
    
    install_plugin "opencode-direnv" "https://github.com/simonwjackson/opencode-direnv.git"
    install_plugin "agentmap" "https://github.com/remorses/agentmap.git"
    install_plugin "opencode-sync" "https://github.com/tctinh/opencode-sync.git"
    install_plugin "ai-sessions-mcp" "https://github.com/yoavf/ai-sessions-mcp.git"
    
    log_success "OpenCode plugins installed"
}

install_ccmanager() {
    if [[ "$WITH_CCMANAGER" != "true" ]]; then
        log_info "Skipping ccmanager (--no-ccmanager or --with-agent-of-empires specified)"
        return 0
    fi

    log_info "Installing ccmanager..."
    
    if command -v ccmanager &> /dev/null; then
        log_warning "ccmanager already installed"
        return 0
    fi

    npm install -g @kbwo/ccmanager
    log_success "ccmanager installed"
}

install_agent_of_empires() {
    if [[ "$WITH_AGENT_OF_EMPIRES" != "true" ]]; then
        return 0
    fi

    log_info "Installing agent-of-empires..."
    
    if command -v agent-of-empires &> /dev/null; then
        log_warning "agent-of-empires already installed"
        return 0
    fi

    curl -fsSL https://raw.githubusercontent.com/njbrake/agent-of-empires/main/install.sh | bash || {
        log_warning "agent-of-empires install failed, continuing..."
        return 0
    }
    
    log_success "agent-of-empires installed"
}

install_kimaki() {
    if [[ "$WITH_KIMAKI" != "true" ]]; then
        return 0
    fi

    log_info "Installing Kimaki (Discord bot)..."
    
    if command -v kimaki &> /dev/null; then
        log_warning "kimaki already installed"
        return 0
    fi

    npm install -g kimaki || {
        log_warning "kimaki npm install failed, continuing..."
        return 0
    }
    
    # Create systemd service
    cat > /etc/systemd/system/kimaki.service << 'EOF'
[Unit]
Description=Kimaki Discord Bot
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/kimaki
Restart=always
RestartSec=10
Environment="HOME=/root"
WorkingDirectory=/root

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable kimaki
    
    log_success "kimaki installed"
    log_info "Run 'npx kimaki' to setup Discord bot interactively"
    log_info "Then: systemctl start kimaki"
}

install_lunaroute() {
    if [[ "$WITH_LUNAROUTE" != "true" ]]; then
        return 0
    fi

    log_info "Installing LunaRoute (AI proxy)..."
    
    if command -v lunaroute-server &> /dev/null; then
        log_warning "lunaroute already installed"
        return 0
    fi

    ARCH=$(uname -m)
    case $ARCH in
        x86_64) LR_ARCH="linux-amd64" ;;
        aarch64) LR_ARCH="linux-arm64" ;;
        *) 
            log_warning "No pre-built binary for $ARCH, skipping..."
            return 0
            ;;
    esac

    cd /tmp
    curl -fsSL "https://github.com/erans/lunaroute/releases/latest/download/lunaroute-server-${LR_ARCH}.tar.gz" -o lunaroute.tar.gz || {
        log_warning "Failed to download lunaroute, continuing..."
        return 0
    }
    
    tar -xzf lunaroute.tar.gz
    chmod +x lunaroute-server
    mv lunaroute-server /usr/local/bin/
    
    log_success "lunaroute installed"
    log_info "Run: eval \$(lunaroute-server env)"
}

install_worktree_session() {
    if [[ "$WITH_WORKTREE_SESSION" != "true" ]]; then
        return 0
    fi

    log_info "Installing opencode-worktree-session plugin..."
    
    npm install -g @tmegit/opencode-worktree-session || {
        log_warning "opencode-worktree-session install failed, continuing..."
        return 0
    }
    
    log_success "opencode-worktree-session installed"
}

install_session_handoff() {
    if [[ "$WITH_SESSION_HANDOFF" != "true" ]]; then
        return 0
    fi

    log_info "Installing opencode-session-handoff plugin..."
    
    # This is an OpenCode plugin, configure in opencode.json
    log_info "opencode-session-handoff is an OpenCode plugin"
    log_info "Add to opencode.json: {\"plugin\": [\"opencode-session-handoff\"]}"
    log_success "opencode-session-handoff configuration noted"
}

configure_firewall() {
    log_info "Configuring firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 2222/tcp
    ufw allow 3000/tcp
    
    # LunaRoute web UI port
    if [[ "$WITH_LUNAROUTE" == "true" ]]; then
        ufw allow 8082/tcp
    fi
    
    ufw --force enable
    
    log_success "Firewall configured"
    ufw status verbose
}

validate_installation() {
    log_info "Validating installation..."
    
    local errors=0
    
    check_command() {
        if ! command -v "$1" &> /dev/null; then
            log_error "$1 not found"
            ((errors++))
        fi
    }
    
    # Core (always required)
    check_command "git"
    check_command "npm"
    check_command "direnv"
    check_command "tmux"
    check_command "et"
    check_command "opencode"
    
    # Standard mode components
    if [[ "$MODE" != "minimal" ]]; then
        if [[ "$WITH_AGENT_OS" == "true" ]]; then
            check_command "agent-os"
            if ! systemctl is-active --quiet agent-os; then
                log_warning "Agent-OS service not running"
            fi
        fi
        
        if [[ "$WITH_CCMANAGER" == "true" ]]; then
            check_command "ccmanager"
        fi
    fi
    
    # Full/custom mode components
    if [[ "$WITH_KIMAKI" == "true" ]]; then
        check_command "kimaki"
    fi
    
    if [[ "$WITH_LUNAROUTE" == "true" ]]; then
        check_command "lunaroute-server"
    fi
    
    # Firewall
    if ! ufw status | grep -q "Status: active"; then
        log_error "Firewall not active"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "All validations passed"
        return 0
    else
        log_error "Validation failed: $errors errors"
        return 1
    fi
}

print_summary() {
    local ip=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "========================================="
    echo "  Sincronizado VPS Setup Complete"
    echo "  Mode: $MODE"
    echo "========================================="
    echo ""
    echo "Core Components:"
    echo "  ✓ Base dependencies (git, npm, direnv, tmux)"
    echo "  ✓ OpenCode AI agent"
    echo "  ✓ Eternal Terminal (port 2222)"
    echo "  ✓ Firewall (UFW)"
    
    if [[ "$MODE" != "minimal" ]]; then
        echo ""
        echo "Standard Components:"
        [[ "$WITH_AGENT_OS" == "true" ]] && echo "  ✓ Agent-OS Web UI (port 3000)"
        [[ "$WITH_PLUGINS" == "true" ]] && echo "  ✓ OpenCode plugins"
        [[ "$WITH_CCMANAGER" == "true" ]] && echo "  ✓ ccmanager"
        [[ "$WITH_AGENT_OF_EMPIRES" == "true" ]] && echo "  ✓ agent-of-empires"
    fi
    
    if [[ "$MODE" == "full" ]] || [[ "$WITH_KIMAKI" == "true" ]] || [[ "$WITH_LUNAROUTE" == "true" ]]; then
        echo ""
        echo "Extra Features:"
        [[ "$WITH_KIMAKI" == "true" ]] && echo "  ✓ Kimaki Discord bot"
        [[ "$WITH_LUNAROUTE" == "true" ]] && echo "  ✓ LunaRoute AI proxy (port 8082)"
        [[ "$WITH_WORKTREE_SESSION" == "true" ]] && echo "  ✓ Worktree session plugin"
        [[ "$WITH_SESSION_HANDOFF" == "true" ]] && echo "  ✓ Session handoff plugin"
    fi
    
    echo ""
    echo "Access Points:"
    [[ "$WITH_AGENT_OS" == "true" ]] && echo "  Agent-OS: http://${ip}:3000"
    [[ "$WITH_LUNAROUTE" == "true" ]] && echo "  LunaRoute: http://${ip}:8082"
    echo "  Log: ${LOG_FILE}"
    echo ""
    
    if [[ "$WITH_KIMAKI" == "true" ]]; then
        echo "Next Steps:"
        echo "  1. Run 'npx kimaki' to configure Discord bot"
        echo "  2. Run 'systemctl start kimaki' to start bot"
        echo ""
    fi
}

main() {
    echo "========================================="
    echo "  Sincronizado VPS Setup"
    echo "  v1.1.0"
    echo "========================================="
    echo ""
    
    parse_flags "$@"
    check_root
    detect_os
    install_base_deps
    install_opencode
    install_eternal_terminal
    
    # Standard mode components
    if [[ "$MODE" != "minimal" ]]; then
        install_agent_os
        install_opencode_plugins
        
        if [[ "$WITH_AGENT_OF_EMPIRES" == "true" ]]; then
            install_agent_of_empires
        else
            install_ccmanager
        fi
    fi
    
    # Full/custom mode components
    if [[ "$MODE" == "full" ]] || [[ "$MODE" == "custom" ]]; then
        install_kimaki || log_warning "kimaki installation failed"
        install_lunaroute || log_warning "lunaroute installation failed"
        install_worktree_session || log_warning "worktree-session installation failed"
        install_session_handoff || log_warning "session-handoff configuration noted"
    fi
    
    configure_firewall
    validate_installation || true  # Don't fail on validation errors
    print_summary
}

main "$@"
