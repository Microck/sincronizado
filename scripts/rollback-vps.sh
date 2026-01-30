#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

confirm() {
    echo ""
    echo "WARNING: This will remove Sincronizado components from this VPS."
    echo ""
    read -p "Are you sure? Type 'yes' to continue: " response
    if [[ "$response" != "yes" ]]; then
        echo "Rollback cancelled."
        exit 0
    fi
}

stop_services() {
    log_info "Stopping services..."
    
    if systemctl is-active --quiet agent-os 2>/dev/null; then
        systemctl stop agent-os
        systemctl disable agent-os
        log_success "Agent-OS stopped"
    fi
    
    if systemctl is-active --quiet et 2>/dev/null; then
        systemctl stop et
        log_success "Eternal Terminal stopped"
    fi
}

remove_packages() {
    log_info "Removing packages..."
    
    npm uninstall -g agent-os @kbwo/ccmanager 2>/dev/null || true
    
    if command -v et &> /dev/null; then
        rm -f /usr/local/bin/et /usr/local/bin/etserver
        log_success "Eternal Terminal removed"
    fi
    
    log_success "Packages removed"
}

remove_files() {
    log_info "Removing files..."
    
    rm -f /etc/systemd/system/agent-os.service
    rm -rf /opt/opencode-plugins
    rm -f /var/log/sincronizado-setup.log
    
    systemctl daemon-reload
    
    log_success "Files removed"
}

reset_firewall() {
    log_info "Resetting firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw --force reset
        ufw disable
        log_success "Firewall reset"
    fi
}

print_summary() {
    echo ""
    echo "========================================="
    echo "  Sincronizado Rollback Complete"
    echo "========================================="
    echo ""
    echo "Removed:"
    echo "  ✓ Services stopped"
    echo "  ✓ Packages uninstalled"
    echo "  ✓ Configuration files removed"
    echo "  ✓ Firewall reset"
    echo ""
    echo "Base packages kept: git, npm, direnv, tmux, ufw"
    echo ""
}

main() {
    echo "========================================="
    echo "  Sincronizado VPS Rollback"
    echo "========================================="
    echo ""
    
    check_root
    confirm
    stop_services
    remove_packages
    remove_files
    reset_firewall
    print_summary
}

main "$@"
