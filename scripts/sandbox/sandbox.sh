#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
SANDBOX_DIR="$ROOT_DIR/.sandbox"
SSH_DIR="$SANDBOX_DIR/ssh"
XDG_DIR="$SANDBOX_DIR/xdg"
PROJECT_DIR="$SANDBOX_DIR/demo-project"
SANDBOX_HOME="$SANDBOX_DIR/home"
BIN_DIR="$SANDBOX_DIR/bin"

KEY_PATH="$SSH_DIR/id_ed25519"
PUB_PATH="$SSH_DIR/id_ed25519.pub"
AUTHORIZED_KEYS="$SANDBOX_DIR/authorized_keys"

CONTAINER_NAME="sinc-sandbox-vps"
IMAGE_NAME="sinc-sandbox-vps:local"
DOCKERFILE_PATH="$ROOT_DIR/scripts/sandbox/Dockerfile"

NETWORK_NAME="sinc-sandbox-net"
NETWORK_SUBNET="172.30.0.0/16"
VPS_IP="172.30.0.10"

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: docker is required" >&2
    exit 1
  fi
}

docker_build() {
  require_docker
  docker build -t "$IMAGE_NAME" -f "$DOCKERFILE_PATH" "$ROOT_DIR" >/dev/null
}

docker_up() {
  require_docker
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker network inspect "$NETWORK_NAME" >/dev/null 2>&1 ||
    docker network create --driver bridge --subnet "$NETWORK_SUBNET" "$NETWORK_NAME" >/dev/null
  docker run -d --rm --name "$CONTAINER_NAME" --network "$NETWORK_NAME" --ip "$VPS_IP" "$IMAGE_NAME" >/dev/null
}

docker_down() {
  require_docker
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

docker_status() {
  require_docker
  docker ps --filter "name=^/${CONTAINER_NAME}$" --format '{{.Names}} {{.Ports}} {{.Status}}'
}

docker_logs() {
  require_docker
  docker logs -f "$CONTAINER_NAME"
}

ensure_dirs() {
  mkdir -p "$SSH_DIR" "$XDG_DIR/sincronizado" "$PROJECT_DIR" "$SANDBOX_HOME/.ssh" "$BIN_DIR"
}

ensure_key() {
  if [ -f "$KEY_PATH" ] && [ -f "$PUB_PATH" ]; then
    return
  fi
  ssh-keygen -t ed25519 -N "" -f "$KEY_PATH" >/dev/null
}

write_authorized_keys() {
  cp "$PUB_PATH" "$AUTHORIZED_KEYS"
}

write_ssh_wrappers() {
  local abs_key="$KEY_PATH"
  if command -v realpath >/dev/null 2>&1; then
    abs_key=$(realpath "$KEY_PATH")
  fi

  cat > "$BIN_DIR/ssh" <<EOF
#!/usr/bin/env bash
exec /usr/bin/ssh \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -i "$abs_key" \
  "\$@"
EOF

  cat > "$BIN_DIR/scp" <<EOF
#!/usr/bin/env bash
exec /usr/bin/scp \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -i "$abs_key" \
  "\$@"
EOF

  chmod +x "$BIN_DIR/ssh" "$BIN_DIR/scp"
}

write_known_hosts() {
  rm -f "$SANDBOX_HOME/.ssh/known_hosts"
  for _ in $(seq 1 20); do
    out=$(ssh-keyscan -p 22 "$VPS_IP" 2>/dev/null || true)
    if [ -n "$out" ]; then
      printf '%s\n' "$out" >> "$SANDBOX_HOME/.ssh/known_hosts"
      return
    fi
    sleep 1
  done
}

write_sandbox_config() {
  ABS_KEY="$KEY_PATH"
  if command -v realpath >/dev/null 2>&1; then
    ABS_KEY=$(realpath "$KEY_PATH")
  fi

  cat > "$XDG_DIR/sincronizado/config.json" <<EOF
{
  "vps": {
    "hostname": "$VPS_IP",
    "user": "sinc",
    "port": 22
  },
  "sync": {
    "mode": "both",
    "ignore": [
      ".git",
      "node_modules",
      "dist",
      ".cache"
    ],
    "remoteBase": "/home/sinc/workspace"
  },
  "agent": "opencode",
  "ssh": {
    "connectTimeout": 3,
    "keepaliveInterval": 10,
    "identityFile": "$ABS_KEY"
  },
  "connection": {
    "protocols": ["ssh"],
    "reconnect": {"maxAttempts": 1, "baseDelayMs": 100, "maxDelayMs": 1000}
  }
}
EOF
}

wait_for_ssh() {
  for _ in $(seq 1 20); do
    if "$BIN_DIR/ssh" sinc@"$VPS_IP" "echo SSH_OK" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done
  echo "ERROR: sandbox SSH never became ready" >&2
  exit 1
}

cmd_up() {
  ensure_dirs
  ensure_key
  write_authorized_keys
  write_ssh_wrappers

  docker_build
  docker_up ""
  wait_for_ssh
  write_known_hosts

  # Start a sandbox-scoped mutagen daemon that uses our SSH wrappers.
  HOME="$SANDBOX_HOME" MUTAGEN_SSH_PATH="$BIN_DIR" mutagen daemon stop >/dev/null 2>&1 || true
  HOME="$SANDBOX_HOME" MUTAGEN_SSH_PATH="$BIN_DIR" MUTAGEN_SSH_CONNECT_TIMEOUT=2 mutagen daemon start >/dev/null 2>&1 || true

  write_sandbox_config

  echo "Sandbox up"
  echo "  VPS IP:   $VPS_IP"
  echo "  SSH:      sinc@$VPS_IP:22"
  echo "  Config:   $XDG_DIR/sincronizado/config.json"
  echo
  echo "For demo commands (isolated sandbox HOME + config):"
  echo "  export HOME=\"$SANDBOX_HOME\""
  echo "  export XDG_CONFIG_HOME=\"$XDG_DIR\""
  echo "  export SINC_NO_UPDATE_CHECK=1"
  echo "  export MUTAGEN_SSH_PATH=\"$BIN_DIR\""
}

cmd_down() {
  docker_down
  HOME="$SANDBOX_HOME" mutagen daemon stop >/dev/null 2>&1 || true
  docker network rm "$NETWORK_NAME" >/dev/null 2>&1 || true
  echo "Sandbox down"
}

cmd_status() {
  docker_status
}

cmd_logs() {
  docker_logs
}

cmd_install_mutagen() {
  if command -v mutagen >/dev/null 2>&1; then
    echo "mutagen already installed: $(mutagen version)"
    return
  fi
  if ! command -v curl >/dev/null 2>&1; then
    echo "ERROR: curl is required to install mutagen" >&2
    exit 1
  fi

  # Install latest mutagen + agent bundle (requires sudo).
  TAG=$(curl -fsSL https://api.github.com/repos/mutagen-io/mutagen/releases/latest |
    grep -o '"tag_name"[[:space:]]*:[[:space:]]*"[^"]\+"' |
    head -n 1 |
    cut -d'"' -f4)
  VERSION=${TAG#v}

  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) ARCH=amd64 ;;
    aarch64|arm64) ARCH=arm64 ;;
  esac

  if [ "$OS" != "linux" ]; then
    echo "ERROR: install-mutagen currently supports linux only" >&2
    exit 1
  fi

  ASSET="mutagen_${OS}_${ARCH}_v${VERSION}.tar.gz"
  URL="https://github.com/mutagen-io/mutagen/releases/download/${TAG}/${ASSET}"

  TMPDIR=$(mktemp -d)
  curl -fsSL "$URL" -o "$TMPDIR/mutagen.tgz"
  tar -xzf "$TMPDIR/mutagen.tgz" -C "$TMPDIR"

  sudo mv "$TMPDIR/mutagen" /usr/local/bin/mutagen
  sudo chmod +x /usr/local/bin/mutagen

  # Make agent bundle discoverable.
  sudo mkdir -p /usr/local/libexec
  sudo cp "$TMPDIR/mutagen-agents.tar.gz" /usr/local/libexec/mutagen-agents.tar.gz
  sudo cp "$TMPDIR/mutagen-agents.tar.gz" /usr/local/bin/mutagen-agents.tar.gz

  rm -rf "$TMPDIR"
  echo "mutagen installed: $(mutagen version)"
}

cmd_verify() {
  ensure_dirs
  if ! command -v mutagen >/dev/null 2>&1; then
    echo "ERROR: mutagen is required for this verification" >&2
    echo "Run: ./scripts/sandbox/sandbox.sh install-mutagen" >&2
    exit 1
  fi

  if [ ! -f "$XDG_DIR/sincronizado/config.json" ]; then
    echo "ERROR: sandbox config missing. Run: ./scripts/sandbox/sandbox.sh up" >&2
    exit 1
  fi

  echo "hello local" > "$PROJECT_DIR/hello.txt"

  # Create a base sync session matching sinc's session naming.
  SESSION_NAME=$(cd "$ROOT_DIR" && bun -e 'import { generateSessionId } from "./src/utils/hash"; console.log(generateSessionId(process.argv[1]));' "$PROJECT_DIR")
  PROJECT_NAME=$(cd "$ROOT_DIR" && bun -e 'import { getProjectName } from "./src/utils/paths"; console.log(getProjectName(process.argv[1]));' "$PROJECT_DIR")
  REMOTE_PATH="/home/sinc/workspace/$PROJECT_NAME"

  HOME="$SANDBOX_HOME" MUTAGEN_SSH_PATH="$BIN_DIR" mutagen sync terminate "$SESSION_NAME" >/dev/null 2>&1 || true
  HOME="$SANDBOX_HOME" MUTAGEN_SSH_PATH="$BIN_DIR" MUTAGEN_SSH_CONNECT_TIMEOUT=2 mutagen sync create "$PROJECT_DIR" "sinc@${VPS_IP}:22:$REMOTE_PATH" --name="$SESSION_NAME" --mode=two-way-safe --ignore-vcs >/dev/null
  HOME="$SANDBOX_HOME" MUTAGEN_SSH_PATH="$BIN_DIR" mutagen sync flush "$SESSION_NAME" >/dev/null

  # Use sandbox config for sinc commands.
  (cd "$PROJECT_DIR" && HOME="$SANDBOX_HOME" XDG_CONFIG_HOME="$XDG_DIR" SINC_NO_UPDATE_CHECK=1 bun "$ROOT_DIR/src/cli/index.ts" push --yes >/dev/null)
  ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$SANDBOX_HOME/.ssh/known_hosts" -i "$KEY_PATH" sinc@"$VPS_IP" "cat $REMOTE_PATH/hello.txt" >/dev/null

  ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$SANDBOX_HOME/.ssh/known_hosts" -i "$KEY_PATH" sinc@"$VPS_IP" "echo 'hello from remote' > $REMOTE_PATH/remote.txt"
  (cd "$PROJECT_DIR" && HOME="$SANDBOX_HOME" XDG_CONFIG_HOME="$XDG_DIR" SINC_NO_UPDATE_CHECK=1 bun "$ROOT_DIR/src/cli/index.ts" pull --yes >/dev/null)
  test "$(cat "$PROJECT_DIR/remote.txt")" = "hello from remote"

  set +e
  OUT=$(cd "$PROJECT_DIR" && HOME="$SANDBOX_HOME" XDG_CONFIG_HOME="$XDG_DIR" SINC_NO_UPDATE_CHECK=1 bun "$ROOT_DIR/src/cli/index.ts" push --json 2>/dev/null)
  CODE=$?
  set -e
  test "$CODE" = "2"
  echo "$OUT" | grep -q '"event":"sync-force-error"'

  echo "verify ok"
}

cmd_demo() {
  if [ ! -f "$XDG_DIR/sincronizado/config.json" ]; then
    echo "ERROR: sandbox config missing. Run: ./scripts/sandbox/sandbox.sh up" >&2
    exit 1
  fi
  ensure_dirs
  echo "Demo project: $PROJECT_DIR"
  echo "Run:"
  echo "  export HOME=\"$SANDBOX_HOME\""
  echo "  export XDG_CONFIG_HOME=\"$XDG_DIR\""
  echo "  export MUTAGEN_SSH_PATH=\"$BIN_DIR\""
  echo "  export SINC_NO_UPDATE_CHECK=1"
  echo "  cd \"$PROJECT_DIR\""
  echo "  bun \"$ROOT_DIR/src/cli/index.ts\""
}

usage() {
  cat <<EOF
Usage: ./scripts/sandbox/sandbox.sh <command>

Commands:
  up               Start sandbox container and write sandbox config
  down             Stop sandbox container
  status           Show sandbox container status
  logs             Tail sandbox container logs
  install-mutagen  Install mutagen + agent bundle (linux, requires sudo)
  verify           Non-interactive push/pull/json verification
  demo             Print interactive demo commands
EOF
}

cmd=${1:-}
case "$cmd" in
  up) shift; cmd_up "$@" ;;
  down) shift; cmd_down "$@" ;;
  status) shift; cmd_status "$@" ;;
  logs) shift; cmd_logs "$@" ;;
  install-mutagen) shift; cmd_install_mutagen "$@" ;;
  verify) shift; cmd_verify "$@" ;;
  demo) shift; cmd_demo "$@" ;;
  *) usage; exit 1 ;;
esac
