import type { Config } from "../config/schema";

export interface ExecResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function sshExec(
  config: Config,
  command: string
): Promise<ExecResult> {
  const args = [
    "-o",
    `ConnectTimeout=${config.ssh.connectTimeout}`,
    "-o",
    `ServerAliveInterval=${config.ssh.keepaliveInterval}`,
    "-o",
    "ServerAliveCountMax=3",
    "-o",
    "BatchMode=yes",
    ...(config.ssh.identityFile ? ["-i", config.ssh.identityFile] : []),
    "-p",
    String(config.vps.port),
    `${config.vps.user}@${config.vps.hostname}`,
    command,
  ];

  const proc = Bun.spawn(["ssh", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  const exitCode = await proc.exited;
  return { success: exitCode === 0, exitCode, stdout, stderr };
}

export async function testConnection(
  config: Config
): Promise<{ success: boolean; error?: string }> {
  const result = await sshExec(config, "echo ok");
  if (result.success) {
    return { success: true };
  }

  if (result.stderr.includes("Connection timed out")) {
    return { success: false, error: "Connection timed out" };
  }
  if (result.stderr.includes("Connection refused")) {
    return { success: false, error: "Connection refused - check if SSH is running" };
  }
  if (result.stderr.includes("Permission denied")) {
    return { success: false, error: "Permission denied - check SSH key" };
  }
  if (result.stderr.includes("Could not resolve hostname")) {
    return { success: false, error: "Could not resolve hostname" };
  }
  return { success: false, error: result.stderr.trim() || "Unknown connection error" };
}
