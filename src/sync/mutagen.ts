import type { Config } from "../config/schema";
import { extractConflicts, type SyncConflict } from "./conflicts";

export interface SyncStatus {
  exists: boolean;
  status: string;
  watching: boolean;
  conflicts: SyncConflict[];
}

async function mutagenExec(args: string[]): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
}> {
  try {
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
  } catch (error) {
    return {
      success: false,
      stdout: "",
      stderr: (error as Error).message || "mutagen invocation failed",
    };
  }
}

type MutagenSyncMode = "two-way-safe" | "two-way-resolved" | "one-way-safe" | "one-way-replica";
type SyncDirection = "local-to-remote" | "remote-to-local";

export async function createSyncSession(
  config: Config,
  name: string,
  localPath: string,
  remotePath: string,
  ignore: string[],
  options?: {
    mode?: MutagenSyncMode;
    direction?: SyncDirection;
  }
): Promise<{ success: boolean; error?: string }> {
  const sshHost = `${config.vps.user}@${config.vps.hostname}`;

  const ignoreFlags = ignore.flatMap((pattern) => ["--ignore", pattern]);

  const mode: MutagenSyncMode = options?.mode ?? "two-way-safe";
  const direction: SyncDirection = options?.direction ?? "local-to-remote";

  const localEndpoint = localPath;
  const remoteEndpoint = `${sshHost}:${remotePath}`;
  const [alphaEndpoint, betaEndpoint] =
    direction === "remote-to-local"
      ? [remoteEndpoint, localEndpoint]
      : [localEndpoint, remoteEndpoint];

  const result = await mutagenExec([
    "sync",
    "create",
    `--name=${name}`,
    `--sync-mode=${mode}`,
    ...ignoreFlags,
    "--ignore-vcs",
    alphaEndpoint,
    betaEndpoint,
  ]);

  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.stderr.trim() };
}

export async function getSyncStatus(name: string): Promise<SyncStatus> {
  const result = await mutagenExec(["sync", "list", `--name=${name}`, "--output=json"]);

  if (!result.success) {
    return { exists: false, status: "not found", watching: false, conflicts: [] };
  }

  try {
    const data = JSON.parse(result.stdout);
    const session = data.sessions?.[0];
    if (!session) {
      return { exists: false, status: "not found", watching: false, conflicts: [] };
    }
    return {
      exists: true,
      status: session.status || "unknown",
      watching: session.status === "Watching for changes",
      conflicts: extractConflicts(data),
    };
  } catch {
    return {
      exists: true,
      status: result.stdout.trim(),
      watching: false,
      conflicts: [],
    };
  }
}

export async function getSyncConflicts(name: string): Promise<SyncConflict[]> {
  const result = await mutagenExec(["sync", "list", `--name=${name}`, "--output=json"]);
  if (!result.success) {
    return [];
  }
  return extractConflicts(result.stdout);
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

export async function forceSyncDirection(
  config: Config,
  sessionName: string,
  localPath: string,
  remotePath: string,
  ignore: string[],
  direction: SyncDirection
): Promise<{ success: boolean; error?: string }> {
  const tempName = `${sessionName}-force-${direction}`;
  let created = false;

  try {
    const existing = await getSyncStatus(tempName);
    if (existing.exists) {
      await terminateSync(tempName);
    }

    const createResult = await createSyncSession(
      config,
      tempName,
      localPath,
      remotePath,
      ignore,
      {
        mode: "one-way-replica",
        direction,
      }
    );

    if (!createResult.success) {
      return {
        success: false,
        error: createResult.error || "Failed to create force sync session",
      };
    }

    created = true;
    const flushed = await flushSync(tempName);
    if (!flushed) {
      return {
        success: false,
        error: "Failed to flush force sync session",
      };
    }

    const timeoutMs = 30000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const status = await getSyncStatus(tempName);
      if (!status.exists) {
        return {
          success: false,
          error: "Force sync session not found after creation",
        };
      }
      if (status.watching) {
        return { success: true };
      }
      if (status.status.toLowerCase().includes("error")) {
        return {
          success: false,
          error: `Force sync session error: ${status.status}`,
        };
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
    }

    return {
      success: false,
      error: "Timed out waiting for force sync session to start",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Force sync failed",
    };
  } finally {
    if (created) {
      await terminateSync(tempName);
    }
  }
}
