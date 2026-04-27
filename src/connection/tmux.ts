import type { Config } from "../config/schema";
import { buildRemoteCommand, type ConnectionProtocol } from "./protocol";
import { sshExec } from "./ssh";

// Validates and shell-escapes a value for safe interpolation into tmux commands.
// tmux session names must match ^[a-zA-Z0-9._-]+$ and paths must not contain
// shell metacharacters. This guards against EC-12 command injection.
function shellEscape(value: string): string {
  // Escape single quotes using the Bourne-shell idiom: ' -> '"'"'
  return `'${value.replace(/'/g, "'\"'\"'")}'`;
}

function validateSessionName(name: string): void {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error(
      `Invalid session name "${name}". Session names must contain only letters, numbers, dots, hyphens, and underscores.`
    );
  }
}

export async function hasSession(
  config: Config,
  sessionName: string
): Promise<boolean> {
  validateSessionName(sessionName);
  const escaped = shellEscape(sessionName);
  const result = await sshExec(
    config,
    `tmux has-session -t ${escaped} 2>/dev/null`
  );
  return result.success;
}

export async function listSessions(config: Config): Promise<string[]> {
  const result = await sshExec(
    config,
    "tmux list-sessions -F '#{session_name}' 2>/dev/null | grep '^sinc-' || true"
  );
  if (!result.success) return [];
  return result.stdout.trim().split("\n").filter(Boolean);
}

export async function killSession(
  config: Config,
  sessionName: string
): Promise<boolean> {
  validateSessionName(sessionName);
  const escaped = shellEscape(sessionName);
  const result = await sshExec(config, `tmux kill-session -t ${escaped}`);
  return result.success;
}

export function buildTmuxAttachCommand(
  config: Config,
  protocol: ConnectionProtocol,
  sessionName: string,
  workDir: string,
  initialCommand: string
): string[] {
  validateSessionName(sessionName);
  const tmuxCmd = `tmux new-session -A -s ${shellEscape(sessionName)} -c ${shellEscape(workDir)} ${shellEscape(initialCommand)}`;

  const args = buildRemoteCommand(config, protocol, tmuxCmd);
  if (protocol === "ssh" && !args.includes("-t")) {
    args.splice(1, 0, "-t");
  }
  return args;
}

export async function attachTmuxSession(
  config: Config,
  protocol: ConnectionProtocol,
  sessionName: string,
  workDir: string,
  initialCommand: string
): Promise<number> {
  const args = buildTmuxAttachCommand(
    config,
    protocol,
    sessionName,
    workDir,
    initialCommand
  );

  const proc = Bun.spawn(args, {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  return await proc.exited;
}
