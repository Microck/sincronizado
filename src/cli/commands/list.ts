import { loadConfig } from "../../config";
import { listSessions } from "../../connection";
import { getSyncStatus } from "../../sync";
import { EXIT_CODES } from "../../utils";
import { log, formatError } from "../output";

export async function list(): Promise<number> {
  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    log(formatError("Failed to load config", (err as Error).message));
    return EXIT_CODES.CONFIG_ERROR;
  }

  const sessions = await listSessions(config);

  if (sessions.length === 0) {
    console.log("No active sessions");
    return EXIT_CODES.SUCCESS;
  }

  console.log("Active sessions:");
  for (const session of sessions) {
    const syncStatus = await getSyncStatus(session);
    const syncIndicator = syncStatus.exists
      ? syncStatus.watching
        ? "syncing"
        : "paused"
      : "no sync";
    console.log(`  ${session} (${syncIndicator})`);
  }

  return EXIT_CODES.SUCCESS;
}
