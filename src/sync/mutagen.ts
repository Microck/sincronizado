import type { Config } from "../config/schema";

export interface SyncStatus {
  exists: boolean;
  status: string;
  watching: boolean;
}

async function mutagenExec(args: string[]): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
}> {
  const proc = Bun.spawn(["mutagen", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  const exitCode = await proc.exited;
  return { success: exitCode === 0, stdout, stderr };
}

export async function createSyncSession(
  config: Config,
  name: string,
  localPath: string,
  remotePath: string,
  ignore: string[]
): Promise<{ success: boolean; error?: string }> {
  const sshHost = `${config.vps.user}@${config.vps.hostname}`;

  const ignoreFlags = ignore.flatMap((pattern) => ["--ignore", pattern]);

  const result = await mutagenExec([
    "sync",
    "create",
    `--name=${name}`,
    "--sync-mode=two-way-safe",
    ...ignoreFlags,
    "--ignore-vcs",
    localPath,
    `${sshHost}:${remotePath}`,
  ]);

  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.stderr.trim() };
}

export async function getSyncStatus(name: string): Promise<SyncStatus> {
  const result = await mutagenExec(["sync", "list", `--name=${name}`, "--output=json"]);

  if (!result.success) {
    return { exists: false, status: "not found", watching: false };
  }

  try {
    const data = JSON.parse(result.stdout);
    const session = data.sessions?.[0];
    if (!session) {
      return { exists: false, status: "not found", watching: false };
    }
    return {
      exists: true,
      status: session.status || "unknown",
      watching: session.status === "Watching for changes",
    };
  } catch {
    return { exists: true, status: result.stdout.trim(), watching: false };
  }
}

export async function flushSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "flush", `--name=${name}`]);
  return result.success;
}

export async function pauseSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "pause", `--name=${name}`]);
  return result.success;
}

export async function resumeSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "resume", `--name=${name}`]);
  return result.success;
}

export async function terminateSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "terminate", `--name=${name}`]);
  return result.success;
}

export async function isMutagenInstalled(): Promise<boolean> {
  const result = await mutagenExec(["version"]);
  return result.success;
}
