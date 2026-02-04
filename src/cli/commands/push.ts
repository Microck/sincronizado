import { resolve } from "path";
import { confirm, isCancel } from "@clack/prompts";
import { loadConfig } from "../../config";
import { forceSyncDirection, getSyncStatus, isMutagenInstalled } from "../../sync";
import { loadSyncIgnore, mergeIgnorePatterns } from "../../sync/ignore";
import { generateSessionId, getProjectName, EXIT_CODES } from "../../utils";
import { emitJson, formatError, formatSuccess, log } from "../output";
import { isJson } from "../output-context";

interface ForceOptions {
  yes?: boolean;
}

type SyncDirection = "local-to-remote" | "remote-to-local";

function emitSummary(
  direction: SyncDirection,
  sessionName: string,
  localPath: string,
  remotePath: string
): void {
  if (isJson()) {
    emitJson({
      event: "sync-force",
      direction,
      session: sessionName,
      localPath,
      remotePath,
    });
    return;
  }

  log(`Force sync direction: ${direction}`);
  log(`Session: ${sessionName}`);
  log(`Local path: ${localPath}`);
  log(`Remote path: ${remotePath}`);
}

export async function push(options: ForceOptions = {}): Promise<number> {
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

  if (!(await isMutagenInstalled())) {
    if (isJson()) {
      emitJson({
        event: "sync-force-error",
        error: "Mutagen is required for file sync",
        suggestion: "Install from https://mutagen.io/",
      });
    } else {
      log(formatError("Mutagen is required for file sync", "Install from https://mutagen.io/"));
    }
    return EXIT_CODES.UNAVAILABLE;
  }

  const syncStatus = await getSyncStatus(sessionName);
  if (!syncStatus.exists) {
    if (isJson()) {
      emitJson({
        event: "sync-force-error",
        error: "No sync session found",
        suggestion: "Run `sinc` first to create a sync session",
      });
    } else {
      log(formatError("No sync session found", "Run `sinc` first to create a sync session"));
    }
    return EXIT_CODES.MISUSE;
  }

  const remotePath = `${config.sync.remoteBase}/${projectName}`;
  const fileIgnore = await loadSyncIgnore(projectPath);
  const ignorePatterns = mergeIgnorePatterns(config.sync.ignore, fileIgnore);
  const direction: SyncDirection = "local-to-remote";

  emitSummary(direction, sessionName, projectPath, remotePath);

  if (!options.yes) {
    if (isJson()) {
      emitJson({
        event: "sync-force-error",
        error: "Non-interactive confirmation required",
        suggestion: "Use --yes to bypass confirmation",
      });
      return EXIT_CODES.MISUSE;
    }

    const confirmed = await confirm({
      message: "Overwrite remote files with local state?",
      initialValue: false,
    });
    if (isCancel(confirmed) || !confirmed) {
      log(formatError("Sync cancelled"));
      return EXIT_CODES.GENERAL_ERROR;
    }
  }

  const result = await forceSyncDirection(
    config,
    sessionName,
    projectPath,
    remotePath,
    ignorePatterns,
    direction
  );

  if (result.success) {
    if (isJson()) {
      emitJson({
        event: "sync-force-complete",
        direction,
        session: sessionName,
        success: true,
      });
    } else {
      log(formatSuccess("Push sync complete"));
    }
    return EXIT_CODES.SUCCESS;
  }

  if (isJson()) {
    emitJson({
      event: "sync-force-error",
      direction,
      session: sessionName,
      error: result.error || "Force sync failed",
    });
  } else {
    log(formatError("Force sync failed", result.error));
  }
  return EXIT_CODES.GENERAL_ERROR;
}
