import { loadConfig } from "../../config";
import { killSession } from "../../connection";
import { terminateSync } from "../../sync";
import { EXIT_CODES } from "../../utils";
import { emitJson, formatError, formatSuccess, log } from "../output";
import { isJson } from "../output-context";

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
    if (isJson()) {
      emitJson({
        session: sessionName,
        terminated: true,
        tmux: tmuxKilled,
        sync: syncTerminated,
      });
    } else {
      log(formatSuccess(`Session ${sessionName} terminated`));
    }
    return EXIT_CODES.SUCCESS;
  }

  if (isJson()) {
    emitJson({ session: sessionName, terminated: false, error: "not found" });
  } else {
    log(formatError(`Session ${sessionName} not found`));
  }
  return EXIT_CODES.GENERAL_ERROR;
}
