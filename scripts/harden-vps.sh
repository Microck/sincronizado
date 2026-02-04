#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_FILE="/var/log/sincronizado-harden.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

HARDEN_SSH=true
HARDEN_FIREWALL=true
HARDEN_FAIL2BAN=true
HARDEN_UPDATES=true
HARDEN_USER=true
CREATE_SSH_KEY=false
NEW_USER=""
SKIP_CONFIRM=false

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_help() {
    cat << EOF
sincronizado vps security hardening
Hardens VPS against common attack vectors

Usage: sudo ./harden-vps.sh [OPTIONS]

Options:
  --skip-ssh            Skip SSH hardening
  --skip-firewall       Skip firewall setup
  --skip-fail2ban       Skip fail2ban installation
  --skip-updates        Skip automatic updates setup
  --skip-user           Skip non-root user creation
  --new-user=NAME       Create new user with this name
  --create-ssh-key      Generate and setup SSH key for new user
  --yes                 Skip confirmation prompts
  --help, -h            Show this help

Examples:
  sudo ./harden-vps.sh --yes
  sudo ./harden-vps.sh --new-user=deploy --create-ssh-key
  sudo ./harden-vps.sh --skip-firewall --skip-fail2ban

EOF
}

parse_flags() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-ssh)
                HARDEN_SSH=false
                shift
                ;;
            --skip-firewall)
                HARDEN_FIREWALL=false
                shift
                ;;
            --skip-fail2ban)
                HARDEN_FAIL2BAN=false
                shift
                ;;
            --skip-updates)
                HARDEN_UPDATES=false
                shift
                ;;
            --skip-user)
                HARDEN_USER=false
                shift
                ;;
            --new-user=*)
                NEW_USER="${1#*=}"
                shift
                ;;
            --create-ssh-key)
                CREATE_SSH_KEY=true
                shift
                ;;
            --yes)
                SKIP_CONFIRM=true
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
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Run as root or with sudo"
        exit 1
    fi
}

confirm() {
    if [[ "$SKIP_CONFIRM" == "true" ]]; then
        return 0
    fi
    
    echo ""
    echo "========================================"
    echo "  SECURITY HARDENING CHECKLIST"
    echo "========================================"
    [[ "$HARDEN_UPDATES" == "true" ]] && echo "[✓] Automatic security updates"
    [[ "$HARDEN_USER" == "true" ]] && echo "[✓] Non-root user creation"
    [[ "$HARDEN_SSH" == "true" ]] && echo "[✓] SSH hardening (keys only, no root)"
    [[ "$HARDEN_FIREWALL" == "true" ]] && echo "[✓] UFW firewall"
    [[ "$HARDEN_FAIL2BAN" == "true" ]] && echo "[✓] Fail2ban brute-force protection"
    [[ -n "$NEW_USER" ]] && echo "[✓] New user: $NEW_USER"
    [[ "$CREATE_SSH_KEY" == "true" ]] && echo "[✓] SSH key generation"
    echo ""
    
    read -p "Continue? [Y/n] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ -n $REPLY ]]; then
        log_info "Cancelled by user"
        exit 0
    fi
}

update_system() {
    if [[ "$HARDEN_UPDATES" != "true" ]]; then
        return 0
    fi
    
    log_info "Updating all packages..."
    apt-get update -qq
    apt-get upgrade -y -qq
    
    log_info "Installing unattended-upgrades..."
    apt-get install -y -qq unattended-upgrades
    
    dpkg-reconfigure -plow unattended-upgrades <<< "yes" || true
    
    log_success "Automatic security updates enabled"
}

create_user() {
    if [[ "$HARDEN_USER" != "true" ]]; then
        return 0
    fi
    
    if [[ -z "$NEW_USER" ]]; then
        log_info "Skipping user creation (no --new-user specified)"
        return 0
    fi
    
    if id "$NEW_USER" &>/dev/null; then
        log_warning "User $NEW_USER already exists"
        return 0
    fi
    
    log_info "Creating non-root user: $NEW_USER"
    adduser --disabled-password --gecos "" "$NEW_USER"
    usermod -aG sudo "$NEW_USER"
    
    log_success "User $NEW_USER created with sudo access"
    
    if [[ "$CREATE_SSH_KEY" == "true" ]]; then
        setup_ssh_key
    fi
}

setup_ssh_key() {
    if [[ -z "$NEW_USER" ]]; then
        return 0
    fi
    
    log_info "Setting up SSH key authentication for $NEW_USER"
    
    USER_HOME="/home/$NEW_USER"
    SSH_DIR="$USER_HOME/.ssh"
    
    mkdir -p "$SSH_DIR"
    
    if [[ -f /root/.ssh/authorized_keys ]]; then
        cp /root/.ssh/authorized_keys "$SSH_DIR/authorized_keys"
        chmod 600 "$SSH_DIR/authorized_keys"
        chown -R "$NEW_USER:$NEW_USER" "$SSH_DIR"
        log_success "Copied root SSH keys to $NEW_USER"
    else
        log_warning "No root SSH keys found. You'll need to manually add keys."
    fi
}

harden_ssh() {
    if [[ "$HARDEN_SSH" != "true" ]]; then
        return 0
    fi
    
    log_info "Hardening SSH configuration..."
    
    SSH_CONFIG="/etc/ssh/sshd_config"
    
    cp "$SSH_CONFIG" "${SSH_CONFIG}.backup.$(date +%Y%m%d)"
    
    sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' "$SSH_CONFIG"
    sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' "$SSH_CONFIG"
    sed -i 's/^#*PermitEmptyPasswords.*/PermitEmptyPasswords no/' "$SSH_CONFIG"
    sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 3/' "$SSH_CONFIG"
    
    if [[ -n "$NEW_USER" ]]; then
        if ! grep -q "^AllowUsers" "$SSH_CONFIG"; then
            echo "AllowUsers $NEW_USER" >> "$SSH_CONFIG"
        else
            sed -i "s/^AllowUsers.*/& $NEW_USER/" "$SSH_CONFIG"
        fi
    fi
    
    systemctl restart sshd
    
    log_success "SSH hardened: root disabled, password auth disabled"
    log_warning "CRITICAL: Test SSH connection in new terminal before closing this session!"
}

setup_firewall() {
    if [[ "$HARDEN_FIREWALL" != "true" ]]; then
        return 0
    fi
    
    log_info "Setting up UFW firewall..."
    
    apt-get install -y -qq ufw
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 2222/tcp
    ufw allow 3000/tcp
    
    ufw --force enable
    
    log_success "Firewall enabled"
    ufw status verbose
}

setup_fail2ban() {
    if [[ "$HARDEN_FAIL2BAN" != "true" ]]; then
        return 0
    fi
    
    log_info "Installing fail2ban..."
    
    apt-get install -y -qq fail2ban
    
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[ssh-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 2
EOF
    
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    log_success "Fail2ban configured (3 attempts = 1 hour ban)"
}

disable_unnecessary_services() {
    log_info "Disabling unnecessary services..."
    
    services_to_disable=(
        "cups"
        "bluetooth"
        "avahi-daemon"
    )
    
    for service in "${services_to_disable[@]}"; do
        if systemctl list-unit-files | grep -q "^$service"; then
            systemctl stop "$service" 2>/dev/null || true
            systemctl disable "$service" 2>/dev/null || true
            log_info "Disabled: $service"
        fi
    done
}

print_summary() {
    echo ""
    echo "========================================"
    echo "  SECURITY HARDENING COMPLETE"
    echo "========================================"
    echo ""
    
    [[ "$HARDEN_UPDATES" == "true" ]] && echo "[✓] Automatic security updates enabled"
    [[ -n "$NEW_USER" ]] && echo "[✓] User created: $NEW_USER (sudo access)"
    [[ "$HARDEN_SSH" == "true" ]] && echo "[✓] SSH: root disabled, password auth disabled"
    [[ "$HARDEN_FIREWALL" == "true" ]] && echo "[✓] UFW firewall active"
    [[ "$HARDEN_FAIL2BAN" == "true" ]] && echo "[✓] Fail2ban brute-force protection"
    
    echo ""
    echo "CRITICAL: Verify SSH access before closing this terminal!"
    echo "  ssh $NEW_USER@<your-server-ip>"
    echo ""
    echo "Log file: $LOG_FILE"
}

main() {
    echo "========================================"
    echo "  sincronizado vps security hardening"
    echo "========================================"
    echo ""
    
    parse_flags "$@"
    check_root
    confirm
    
    update_system
    create_user
    harden_ssh
    setup_firewall
    setup_fail2ban
    disable_unnecessary_services
    
    print_summary
}

main "$@"
