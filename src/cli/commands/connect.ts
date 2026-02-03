import { resolve } from "path";
import { createSpinner, formatError, log } from "../output";
import { loadConfig } from "../../config";
import { generateSessionId, getProjectName, EXIT_CODES } from "../../utils";
import { testConnection, hasSession, attachTmuxSession } from "../../connection";
import {
  createSyncSession,
  getSyncStatus,
  flushSync,
  isMutagenInstalled,
} from "../../sync";

interface ConnectOptions {
  resume?: boolean;
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

  if (!(await isMutagenInstalled())) {
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
    log(`Session ${sessionName} already exists. Use -r to resume.`);
  }

  const syncSpinner = createSpinner("Starting file sync...");
  syncSpinner.start();

  const remotePath = `${config.sync.remoteBase}/${projectName}`;
  const syncStatus = await getSyncStatus(sessionName);

  if (!syncStatus.exists) {
    const syncResult = await createSyncSession(
      config,
      sessionName,
      projectPath,
      remotePath
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

  const agentCommand = config.agent === "opencode" ? "opencode" : "claude";

  const exitCode = await attachTmuxSession(
    config,
    sessionName,
    remotePath,
    agentCommand
  );

  const exitSpinner = createSpinner("Syncing final changes...");
  exitSpinner.start();

  await flushSync(sessionName);

  exitSpinner.succeed("Sync complete");

  return exitCode;
}
