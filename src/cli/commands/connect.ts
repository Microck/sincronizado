import { resolve } from "path";
import { createSpinner, emitJson, formatError, log, logVerbose } from "../output";
import { isJson } from "../output-context";
import { loadConfig } from "../../config";
import { generateSessionId, getProjectName, EXIT_CODES } from "../../utils";
import {
  testConnection,
  sshExec,
  hasSession,
  attachTmuxSession,
  selectProtocol,
} from "../../connection";
import {
  createSyncSession,
  getSyncConflicts,
  getSyncStatus,
  flushSync,
  terminateSync,
  isMutagenInstalled,
} from "../../sync";
import { formatConflicts } from "../../sync/conflicts";
import { loadSyncIgnore, mergeIgnorePatterns } from "../../sync/ignore";

interface ConnectOptions {
  resume?: boolean;
}

function quoteRemotePathForShell(path: string): string {
  if (path === "~") {
    return '"$HOME"';
  }
  if (path.startsWith("~/")) {
    const rest = path.slice(2).replace(/"/g, "\\\"");
    return `"$HOME/${rest}"`;
  }
  const escaped = path.replace(/"/g, "\\\"");
  return `"${escaped}"`;
}

async function attachWithReconnect(
  config: Awaited<ReturnType<typeof loadConfig>>,
  sessionName: string,
  remotePath: string,
  agentCommand: string
): Promise<number> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = config.connection.reconnect;
  let attempt = 0;
  let lastExitCode: number = EXIT_CODES.GENERAL_ERROR;

  while (attempt < maxAttempts) {
    const protocol = selectProtocol(config);
    log(`Using protocol: ${protocol}`);

    lastExitCode = await attachTmuxSession(
      config,
      protocol,
      sessionName,
      remotePath,
      agentCommand
    );

    if (lastExitCode === 0) {
      return lastExitCode;
    }

    attempt += 1;
    if (attempt >= maxAttempts) {
      break;
    }

    const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
    log(`Connection lost. Reconnecting in ${Math.ceil(delay / 1000)}s...`);
    await new Promise((resolveWait) => setTimeout(resolveWait, delay));
  }

  log(
    formatError(
      "Connection lost",
      `Failed to reconnect after ${maxAttempts} attempts`
    )
  );
  return lastExitCode;
}

export async function connect(options: ConnectOptions = {}): Promise<number> {
  const cwd = process.cwd();
  const projectPath = resolve(cwd);
  const projectName = getProjectName(projectPath);
  const sessionName = generateSessionId(projectPath);

  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    log(formatError("Failed to load config", (err as Error).message));
    return EXIT_CODES.CONFIG_ERROR;
  }

  const spinner = createSpinner("Checking prerequisites...");
  spinner.start();

  const syncMode = config.sync.mode;
  const syncEnabled = syncMode !== "none";

  if (syncEnabled && !(await isMutagenInstalled())) {
    spinner.fail("Mutagen not found");
    log(formatError("Mutagen is required for file sync", "Install from https://mutagen.io/"));
    return EXIT_CODES.UNAVAILABLE;
  }

  spinner.text = "Connecting to VPS...";
  const connResult = await testConnection(config);

  if (!connResult.success) {
    spinner.fail("Connection failed");
    log(formatError(connResult.error || "Unknown error", "Check VPS hostname and SSH key"));
    return EXIT_CODES.CONNECT_ERROR;
  }

  spinner.text = "Connected to VPS";
  spinner.succeed();

  const hasExisting = await hasSession(config, sessionName);

  if (hasExisting && !options.resume) {
    log(formatError(`Session ${sessionName} already exists`, "Use -r to resume"));
    return EXIT_CODES.MISUSE;
  }

  if (!hasExisting && options.resume) {
    log(formatError(`Session ${sessionName} does not exist`, "Run without -r to start"));
    return EXIT_CODES.MISUSE;
  }

  const remotePath = `${config.sync.remoteBase}/${projectName}`;
  // Ensure the remote work directory exists. This avoids tmux failing when
  // creating a new session with -c.
  const mkdir = await sshExec(config, `mkdir -p ${quoteRemotePathForShell(remotePath)}`);
  if (!mkdir.success) {
    log(formatError("Failed to prepare remote workspace", mkdir.stderr.trim() || mkdir.stdout.trim()));
    return EXIT_CODES.CONNECT_ERROR;
  }

  if (syncEnabled) {
    const syncStatus = await getSyncStatus(sessionName);

    if (isJson()) {
      emitJson({
        event: "sync-status",
        session: sessionName,
        exists: syncStatus.exists,
        status: syncStatus.status,
        watching: syncStatus.watching,
      });
    } else {
      log(`Sync status: ${syncStatus.exists ? syncStatus.status : "not found"}`);
    }

    const syncSpinner = createSpinner("Starting file sync...");
    syncSpinner.start();

    if (!syncStatus.exists) {
      const fileIgnore = await loadSyncIgnore(projectPath);
      const ignorePatterns = mergeIgnorePatterns(config.sync.ignore, fileIgnore);

      const mode = syncMode === "both" ? "two-way-safe" : "one-way-safe";
      const direction = syncMode === "pull" ? "remote-to-local" : "local-to-remote";

      const syncResult = await createSyncSession(
        config,
        sessionName,
        projectPath,
        remotePath,
        ignorePatterns,
        { mode, direction }
      );
      if (!syncResult.success) {
        syncSpinner.fail("Sync setup failed");
        log(formatError(syncResult.error || "Unknown sync error"));
        return EXIT_CODES.GENERAL_ERROR;
      }
    }

    let attempts = 0;
    while (attempts < 30) {
      const status = await getSyncStatus(sessionName);
      if (status.watching) {
        break;
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
      attempts++;
    }

    syncSpinner.succeed("File sync active");
  } else {
    if (isJson()) {
      emitJson({
        event: "sync-status",
        session: sessionName,
        exists: false,
        status: "disabled",
        watching: false,
      });
    } else {
      log("Sync status: disabled (sync.mode=none)");
    }
  }

  const agentCommand = config.agent === "opencode" ? "opencode" : "claude";

  let conflictMonitor: ReturnType<typeof setInterval> | null = null;
  if (syncEnabled) {
    const seenConflicts = new Set<string>();
    conflictMonitor = setInterval(async () => {
      const conflicts = await getSyncConflicts(sessionName);
      const newConflicts = conflicts.filter((conflict) => !seenConflicts.has(conflict.path));
      if (newConflicts.length === 0) {
        return;
      }
      for (const conflict of newConflicts) {
        seenConflicts.add(conflict.path);
      }
      log(`Sync conflict detected:\n${formatConflicts(newConflicts)}`);
    }, 5000);
  }

  logVerbose(`Attaching ${sessionName} in ${remotePath}`);

  const exitCode = await attachWithReconnect(
    config,
    sessionName,
    remotePath,
    agentCommand
  );

  if (conflictMonitor) {
    clearInterval(conflictMonitor);
  }

  if (syncEnabled) {
    const sessionStillExists = await hasSession(config, sessionName);
    if (!sessionStillExists) {
      logVerbose("Session ended; cleaning up sync session");
    }

    const exitSpinner = createSpinner("Syncing final changes...");
    exitSpinner.start();

    await flushSync(sessionName);

    if (!sessionStillExists) {
      await terminateSync(sessionName);
    }

    exitSpinner.succeed("Sync complete");
  }

  return exitCode;
}
