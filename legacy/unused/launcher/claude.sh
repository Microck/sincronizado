#!/bin/bash
set -euo pipefail

CONFIG_FILE=".claude.config.json"
GLOBAL_CONFIG_DIR="$HOME/.config/sincronizado"
GLOBAL_CONFIG_FILE="$GLOBAL_CONFIG_DIR/config.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

get_project_hash() {
    echo -n "$1" | shasum -a 256 | cut -c1-6
}

find_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        echo "$CONFIG_FILE"
    elif [[ -f "$GLOBAL_CONFIG_FILE" ]]; then
        echo "$GLOBAL_CONFIG_FILE"
    else
        echo ""
    fi
}

check_dependencies() {
    local deps=("mutagen" "ssh")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Missing dependency: $dep"
            exit 1
        fi
    done
}

get_session_id() {
    local project_path="$1"
    local prefix="${2:-sync-}"
    local folder_name=$(basename "$project_path")
    local hash=$(get_project_hash "$project_path")
    echo "${prefix}${folder_name}-${hash}"
}

start_session() {
    local config_file="$1"
    local vps_host=$(jq -r '.vps.host' "$config_file")
    local vps_user=$(jq -r '.vps.user' "$config_file")
    local vps_port=$(jq -r '.vps.port' "$config_file")
    local beta=$(jq -r '.sync.beta' "$config_file")
    local prefix=$(jq -r '.session_prefix // "sync-"' "$config_file")
    
    local session_id=$(get_session_id "$PWD" "$prefix")
    local folder_name=$(basename "$PWD")
    local remote_dir="${beta}/${folder_name}"
    
    log_info "Starting Claude Code session: $session_id"
    
    local ssh_cmd="mkdir -p $remote_dir && cd $remote_dir && tmux new-session -A -s $session_id 'claude'"
    et "$vps_user@$vps_host:$vps_port" -c "$ssh_cmd"
}

list_sessions() {
    local config_file="$1"
    local vps_host=$(jq -r '.vps.host' "$config_file")
    local vps_user=$(jq -r '.vps.user' "$config_file")
    local vps_port=$(jq -r '.vps.port' "$config_file")
    
    log_info "Active sessions:"
    ssh -p "$vps_port" "${vps_user}@${vps_host}" "tmux ls 2>/dev/null || echo 'No active sessions'"
}

kill_session() {
    local config_file="$1"
    local session_name="$2"
    local vps_host=$(jq -r '.vps.host' "$config_file")
    local vps_user=$(jq -r '.vps.user' "$config_file")
    local vps_port=$(jq -r '.vps.port' "$config_file")
    
    ssh -p "$vps_port" "${vps_user}@${vps_host}" "tmux kill-session -t $session_name 2>/dev/null || echo 'Session not found'"
    log_success "Session $session_name terminated"
}

show_help() {
    cat << EOF
Claude Code Launcher for Sincronizado

Usage: ./claude.sh [OPTIONS]

Options:
    -l, --list          List all active tmux sessions
    -k, --kill NAME     Kill a specific session
    -h, --help          Show this help message

Configuration:
    Create .claude.config.json in your project root:
    {
        "vps": {
            "host": "your-vps.tailnet.ts.net",
            "user": "ubuntu",
            "port": 2222
        },
        "sync": {
            "alpha": ".",
            "beta": "~/projects"
        },
        "session_prefix": "sync-"
    }
EOF
}

main() {
    check_dependencies
    
    local config_file=$(find_config)
    if [[ -z "$config_file" ]]; then
        log_error "No config found. Create $CONFIG_FILE in project root"
        exit 1
    fi
    
    case "${1:-}" in
        -l|--list)
            list_sessions "$config_file"
            ;;
        -k|--kill)
            if [[ -z "${2:-}" ]]; then
                log_error "Session name required for kill"
                exit 1
            fi
            kill_session "$config_file" "$2"
            ;;
        -h|--help)
            show_help
            ;;
        "")
            start_session "$config_file"
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
