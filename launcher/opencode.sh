#!/bin/bash
set -euo pipefail

# Sincronizado macOS/Linux Launcher
# Hash-based session management for remote development

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CONFIG_FILE=".opencode.config.json"
GLOBAL_CONFIG_DIR="$HOME/.config/sincronizado"
GLOBAL_CONFIG_FILE="$GLOBAL_CONFIG_DIR/config.json"

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get project info
get_project_path() { pwd; }
get_project_name() { basename "$(get_project_path)"; }

# Generate session hash from full path
get_session_hash() {
    get_project_path | shasum -a 256 | cut -c1-6
}

# Get full session name
get_session_name() {
    local project_name=$(get_project_name)
    local hash=$(get_session_hash)
    echo "sync-${project_name}-${hash}"
}

# Load configuration
get_config() {
    local local_config="$(get_project_path)/$CONFIG_FILE"
    local config=""
    
    if [[ -f "$local_config" ]]; then
        config=$(cat "$local_config" 2>/dev/null) || true
    fi
    
    if [[ -z "$config" && -f "$GLOBAL_CONFIG_FILE" ]]; then
        config=$(cat "$GLOBAL_CONFIG_FILE" 2>/dev/null) || true
    fi
    
    if [[ -z "$config" ]]; then
        config='{"vps":{"default":"localhost","hosts":{}},"sync":{"ignore":["node_modules",".venv",".git","dist","build"]},"session":{"prefix":"sync-"}}'
    fi
    
    echo "$config"
}

# Pre-flight checks
check_mutagen() {
    if command -v mutagen &> /dev/null; then
        log_success "Mutagen found"
        return 0
    else
        log_error "Mutagen not found. Install: brew install mutagen-io/mutagen/mutagen"
        return 1
    fi
}

check_tailscale() {
    if command -v tailscale &> /dev/null; then
        if tailscale status 2>&1 | grep -q "not running\|stopped"; then
            log_warning "Tailscale not running. Start: tailscale up"
            return 1
        fi
        log_success "Tailscale running"
        return 0
    else
        log_error "Tailscale not found. Install from https://tailscale.com/download"
        return 1
    fi
}

check_vps() {
    local hostname=$1
    if ping -c 1 "$hostname" &> /dev/null; then
        log_success "VPS $hostname reachable"
        return 0
    else
        log_error "VPS $hostname not reachable"
        return 1
    fi
}

# Mutagen management
get_mutagen_sessions() {
    mutagen sync list --format json 2>/dev/null || echo "[]"
}

session_exists() {
    local session_name=$1
    local sessions=$(get_mutagen_sessions)
    echo "$sessions" | grep -q "\"$session_name\"" || echo "$sessions" | grep -q "\"identifier\": \"$session_name\""
}

start_sync() {
    local session_name=$1
    local local_path=$2
    local remote_host=$3
    local remote_path=$4
    shift 4
    local ignore_patterns=("$@")
    
    log_info "Starting Mutagen sync: $session_name"
    
    local ignore_args=""
    for pattern in "${ignore_patterns[@]}"; do
        ignore_args="$ignore_args --ignore=$pattern"
    done
    
    local remote_url="${remote_host}:${remote_path}"
    
    # shellcheck disable=SC2086
    mutagen sync create "$local_path" "$remote_url" \
        --name="$session_name" \
        --sync-mode=two-way-resolved \
        $ignore_args
    
    log_success "Sync session created"
}

stop_sync() {
    local session_name=$1
    log_info "Stopping sync: $session_name"
    mutagen sync terminate "$session_name" 2>/dev/null || true
    log_success "Sync stopped"
}

# Session management
list_sessions() {
    log_info "Active Sincronizado sessions:"
    echo ""
    
    local sessions=$(get_mutagen_sessions)
    local sync_sessions=$(echo "$sessions" | grep -o '"identifier": "sync-[^"]*"' || true)
    
    if [[ -z "$sync_sessions" ]]; then
        log_warning "No active sessions"
        return
    fi
    
    echo "$sync_sessions" | while read -r line; do
        local session=$(echo "$line" | grep -o 'sync-[^"]*')
        echo "  - $session"
    done
}

kill_session() {
    local target_session=$1
    if [[ -z "$target_session" ]]; then
        log_error "No session name provided"
        return 1
    fi
    
    stop_sync "$target_session"
}

# Main development session
start_dev_session() {
    local config=$(get_config)
    local session_name=$(get_session_name)
    local local_path=$(get_project_path)
    local project_name=$(get_project_name)
    
    log_info "Sincronizado Development Session"
    log_info "Project: $project_name"
    log_info "Session: $session_name"
    echo ""
    
    # Pre-flight checks
    log_info "Running pre-flight checks..."
    
    check_mutagen || exit 1
    check_tailscale || exit 1
    
    # Extract VPS config (simplified parsing)
    local vps_host=$(echo "$config" | grep -o '"hostname": "[^"]*"' | head -1 | cut -d'"' -f4)
    local vps_user=$(echo "$config" | grep -o '"user": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [[ -z "$vps_host" ]]; then
        log_error "No VPS configured. Create $CONFIG_FILE"
        exit 1
    fi
    
    check_vps "$vps_host" || exit 1
    
    log_success "All checks passed!"
    echo ""
    
    # Check if session exists
    if session_exists "$session_name"; then
        log_info "Session exists. Resuming..."
    else
        # Create new sync session
        local remote_path="/home/$vps_user/workspace/$project_name"
        local ignore_patterns=("node_modules" ".venv" ".git" "dist" "build")
        
        start_sync "$session_name" "$local_path" "$vps_host" "$remote_path" "${ignore_patterns[@]}"
    fi
    
    log_success "File sync active"
    log_info "Local:  $local_path"
    log_info "Remote: $vps_host"
    echo ""
    log_info "Connecting via Eternal Terminal..."
    
    # Connect via Eternal Terminal
    local et_port=$(echo "$config" | grep -o '"port": [0-9]*' | head -1 | grep -o '[0-9]*' || echo "2222")
    
    et "${vps_host}:${et_port}" || {
        log_error "Failed to connect via Eternal Terminal"
        log_info "Try manual SSH: ssh $vps_user@$vps_host"
    }
}

# Help
show_help() {
    cat << 'EOF'
Sincronizado macOS/Linux Launcher

USAGE:
    ./opencode.sh [OPTIONS]

OPTIONS:
    -l, --list       List all active sessions
    -k, --kill       Kill a specific session (provide session name)
    -h, --help       Show this help

CONFIGURATION:
    Create a .opencode.config.json file in your project root.

EXAMPLES:
    Start a new session:
        ./opencode.sh

    List all sessions:
        ./opencode.sh -l

    Kill a session:
        ./opencode.sh -k sync-myproject-a1b2c3
EOF
}

# Main
main() {
    case "${1:-}" in
        -l|--list)
            list_sessions
            ;;
        -k|--kill)
            kill_session "${2:-}"
            ;;
        -h|--help)
            show_help
            ;;
        "")
            start_dev_session
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
