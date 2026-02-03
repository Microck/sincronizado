import { loadConfig } from "../../config";
import { listSessions } from "../../connection";
import { getSyncStatus } from "../../sync";
import { EXIT_CODES } from "../../utils";
import { emitJson, formatError, log } from "../output";
import { getOutputMode, isJson } from "../output-context";

export async function list(): Promise<number> {
  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    log(formatError("Failed to load config", (err as Error).message));
    return EXIT_CODES.CONFIG_ERROR;
  }

  const sessions = await listSessions(config);

  if (isJson()) {
    const data = [] as {
      name: string;
      sync: { exists: boolean; status: string; watching: boolean };
    }[];
    for (const session of sessions) {
      const syncStatus = await getSyncStatus(session);
      data.push({
        name: session,
        sync: {
          exists: syncStatus.exists,
          status: syncStatus.status,
          watching: syncStatus.watching,
        },
      });
    }
    emitJson(data);
    return EXIT_CODES.SUCCESS;
  }

  const mode = getOutputMode();

  if (sessions.length === 0) {
    if (!mode.quiet) {
      console.log("No active sessions");
    }
    return EXIT_CODES.SUCCESS;
  }

  if (!mode.quiet) {
    console.log("Active sessions:");
  }
  for (const session of sessions) {
    const syncStatus = await getSyncStatus(session);
    const syncIndicator = syncStatus.exists
      ? syncStatus.watching
        ? "syncing"
        : "paused"
      : "no sync";
    if (!mode.quiet) {
      console.log(`  ${session} (${syncIndicator})`);
    }
  }

  return EXIT_CODES.SUCCESS;
}
