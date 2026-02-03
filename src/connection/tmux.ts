import type { Config } from "../config/schema";
import { sshExec } from "./ssh";

export async function hasSession(
  config: Config,
  sessionName: string
): Promise<boolean> {
  const result = await sshExec(
    config,
    `tmux has-session -t ${sessionName} 2>/dev/null`
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
  const result = await sshExec(config, `tmux kill-session -t ${sessionName}`);
  return result.success;
}

export function buildTmuxAttachCommand(
  config: Config,
  sessionName: string,
  workDir: string,
  initialCommand: string
): string[] {
  const tmuxCmd = `tmux new-session -A -s ${sessionName} -c ${workDir} '${initialCommand}'`;

  return [
    "ssh",
    "-o",
    `ServerAliveInterval=${config.ssh.keepaliveInterval}`,
    "-o",
    "ServerAliveCountMax=3",
    "-t",
    "-p",
    String(config.vps.port),
    `${config.vps.user}@${config.vps.hostname}`,
    tmuxCmd,
  ];
}

export async function attachTmuxSession(
  config: Config,
  sessionName: string,
  workDir: string,
  initialCommand: string
): Promise<number> {
  const args = buildTmuxAttachCommand(config, sessionName, workDir, initialCommand);

  const proc = Bun.spawn(args, {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  return await proc.exited;
}
