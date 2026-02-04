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

function resolveRemoteEndpoint(config: Config, remotePath: string): string {
  // SSH endpoints are expressed using Mutagen's SCP-like syntax:
  //   [<user>@]<host>[:<port>]:<path>
  // See: https://mutagen.io/documentation/transports/ssh/
  const user = config.vps.user;
  const host = config.vps.hostname;
  const port = config.vps.port ?? 22;

  // If the port isn't the default, insert it between host and path.
  const hostPart = port === 22 ? host : `${host}:${port}`;
  return `${user}@${hostPart}:${remotePath}`;
}

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
  const ignoreFlags = ignore.flatMap((pattern) => ["--ignore", pattern]);

  const mode: MutagenSyncMode = options?.mode ?? "two-way-safe";
  const direction: SyncDirection = options?.direction ?? "local-to-remote";

  const localEndpoint = localPath;
  const remoteEndpoint = resolveRemoteEndpoint(config, remotePath);
  const [alphaEndpoint, betaEndpoint] =
    direction === "remote-to-local"
      ? [remoteEndpoint, localEndpoint]
      : [localEndpoint, remoteEndpoint];

  const result = await mutagenExec([
    "sync",
    "create",
    `--name=${name}`,
    `--mode=${mode}`,
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
  const result = await mutagenExec(["sync", "list", "--long", name]);

  if (!result.success) {
    return { exists: false, status: "not found", watching: false, conflicts: [] };
  }

  const output = result.stdout || "";
  const exists = /^Name:\s+/m.test(output);
  if (!exists) {
    return { exists: false, status: "not found", watching: false, conflicts: [] };
  }

  const match = output.match(/^Status:\s*(.*)$/m);
  const status = match?.[1]?.trim() || "unknown";

  return {
    exists: true,
    status,
    watching: status === "Watching for changes",
    conflicts: [],
  };
}

export async function getSyncConflicts(name: string): Promise<SyncConflict[]> {
  // Mutagen's current CLI output isn't JSON by default. Until we add template-based
  // JSON output, conflicts are treated as unavailable in this layer.
  const status = await getSyncStatus(name);
  return status.exists ? status.conflicts : [];
}

export async function flushSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "flush", name]);
  return result.success;
}

export async function pauseSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "pause", name]);
  return result.success;
}

export async function resumeSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "resume", name]);
  return result.success;
}

export async function terminateSync(name: string): Promise<boolean> {
  const result = await mutagenExec(["sync", "terminate", name]);
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
