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

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

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

    log_info "Installing dependencies..."
    apt-get install -y -qq git npm direnv tmux curl wget unzip ufw bc \
        libssl-dev libprotobuf-dev protobuf-compiler cmake g++ \
        libsodium-dev libncurses5-dev libgflags-dev libutempter-dev libboost-all-dev

    log_success "Dependencies installed"
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
    log_info "Installing ccmanager..."
    
    if command -v ccmanager &> /dev/null; then
        log_warning "ccmanager already installed"
        return 0
    fi

    npm install -g @kbwo/ccmanager
    log_success "ccmanager installed"
}

configure_firewall() {
    log_info "Configuring firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 2222/tcp
    ufw allow 3000/tcp
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
    
    check_command "git"
    check_command "npm"
    check_command "direnv"
    check_command "tmux"
    check_command "et"
    check_command "agent-os"
    check_command "ccmanager"
    
    if ! systemctl is-active --quiet agent-os; then
        log_error "Agent-OS service not running"
        ((errors++))
    fi
    
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
    echo "========================================="
    echo ""
    echo "Installed:"
    echo "  ✓ Base dependencies (git, npm, direnv, tmux)"
    echo "  ✓ Eternal Terminal (port 2222)"
    echo "  ✓ Agent-OS Web UI (port 3000)"
    echo "  ✓ OpenCode plugins"
    echo "  ✓ ccmanager"
    echo "  ✓ Firewall (UFW)"
    echo ""
    echo "Agent-OS: http://${ip}:3000"
    echo "Log: ${LOG_FILE}"
    echo ""
}

main() {
    echo "========================================="
    echo "  Sincronizado VPS Setup"
    echo "========================================="
    echo ""
    
    check_root
    detect_os
    install_base_deps
    install_eternal_terminal
    install_agent_os
    install_opencode_plugins
    install_ccmanager
    configure_firewall
    validate_installation
    print_summary
}

main "$@"
