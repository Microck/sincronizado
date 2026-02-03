import { EXIT_CODES } from "../../utils";
import { log, formatError } from "../output";
import { runSetupTui } from "../../installer/tui";
import { spawnSetupInCmd } from "../../installer/windows-cmd";

export async function setup(): Promise<number> {
  if (spawnSetupInCmd()) {
    return EXIT_CODES.SUCCESS;
  }

  try {
    const config = await runSetupTui();
    if (!config) {
      return EXIT_CODES.GENERAL_ERROR;
    }
    return EXIT_CODES.SUCCESS;
  } catch (error) {
    log(formatError("Setup failed", (error as Error).message));
    return EXIT_CODES.GENERAL_ERROR;
  }
}
