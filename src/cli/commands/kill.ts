import { loadConfig } from "../../config";
import { killSession } from "../../connection";
import { terminateSync } from "../../sync";
import { EXIT_CODES } from "../../utils";
import { log, formatError, formatSuccess } from "../output";

export async function kill(sessionName: string): Promise<number> {
  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    log(formatError("Failed to load config", (err as Error).message));
    return EXIT_CODES.CONFIG_ERROR;
  }

  const tmuxKilled = await killSession(config, sessionName);
  const syncTerminated = await terminateSync(sessionName);

  if (tmuxKilled || syncTerminated) {
    log(formatSuccess(`Session ${sessionName} terminated`));
    return EXIT_CODES.SUCCESS;
  }

  log(formatError(`Session ${sessionName} not found`));
  return EXIT_CODES.GENERAL_ERROR;
}
