#!/bin/bash
set -euo pipefail

REPO="https://github.com/microck/sincronizado"
INSTALLER_DIR="installer"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v bun &> /dev/null; then
        log_error "Bun is required but not installed."
        echo ""
        echo "Install Bun:"
        echo "  curl -fsSL https://bun.sh/install | bash"
        echo ""
        echo "Or use the curl installer instead:"
        echo "  curl -fsSL https://sincronizado.dev/install.sh | bash"
        exit 1
    fi
    
    log_success "Bun is installed ($(bun --version))"
}

download_installer() {
    log_info "Downloading Sincronizado installer..."
    
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Download latest installer
    curl -fsSL "$REPO/archive/refs/heads/main.tar.gz" -o sincronizado.tar.gz
    tar -xzf sincronizado.tar.gz --strip-components=1
    
    log_success "Installer downloaded"
}

run_installer() {
    log_info "Starting TUI installer..."
    
    cd "$INSTALLER_DIR"
    
    # Install dependencies
    bun install --silent
    
    # Run the TUI
    bun run src/index.tsx
}

cleanup() {
    if [[ -n "${TEMP_DIR:-}" && -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

main() {
    echo "========================================="
    echo "  Sincronizado TUI Installer"
    echo "  v1.1.0"
    echo "========================================="
    echo ""
    
    check_dependencies
    download_installer
    run_installer
}

main "$@"
